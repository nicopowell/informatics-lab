import type { LfibEntry, Preset, TopologyNode } from './model'

export type FrameAction = 'classify' | 'swap' | 'pop' | 'dropped'

export type FrameLookup = { port: string; label: number | string }

export type MplsFrame = {
  hop: number
  nodeId: string
  action: FrameAction
  lookup: FrameLookup // what this node searched its LFIB for
  entry: LfibEntry | null // the row that decided the frame; null when nothing matched
  inLabel: number | null // label on arrival; null at the ingress, before any push
  outLabel: number | null // label on departure; null once popped or dropped
  nextNodeId: string | null // where the packet goes next; null once it stops
  narration: string
}

// A packet follows its LFIB output ports, not the configured LSP — the LSP is
// only what well-formed tables happen to produce (see the preset integrity
// test). Edits can therefore walk the packet off the tunnel or into a cycle,
// and every sequence must still end: visiting more nodes than exist means the
// tables loop, and the packet is dropped instead of animated forever.
export function generateFrames(preset: Preset): MplsFrame[] {
  const frames: MplsFrame[] = []
  const nodeById = new Map(preset.nodes.map((node) => [node.id, node]))
  let nodeId = preset.lsp[0]
  let arrivalPort = 'local'
  let carried: number | null = null // no label exists before the ingress push
  let lookupLabel: number | string = preset.destination

  for (;;) {
    const node = nodeById.get(nodeId)
    if (!node) break

    if (frames.length >= preset.nodes.length) {
      frames.push(dropFrame(preset, node, { port: arrivalPort, label: lookupLabel }, carried))
      break
    }

    const lookup: FrameLookup = { port: arrivalPort, label: lookupLabel }
    const entry = (preset.lfib[nodeId] ?? []).find(
      (candidate) => candidate.inPort === arrivalPort && candidate.inLabel === lookupLabel,
    )
    const hop = frames.length

    if (!entry) {
      frames.push({
        hop,
        nodeId,
        action: 'dropped',
        lookup,
        entry: null,
        inLabel: carried,
        outLabel: null,
        nextNodeId: null,
        narration: `${node.label} has no LFIB entry for port ${arrivalPort}, label ${lookupLabel} — packet dropped`,
      })
      break
    }

    if (entry.outLabel === 'pop') {
      if (carried === null) {
        // Unreachable from the edit UI (only numeric labels are editable) but a
        // hand-edited preset could push 'pop' at the ingress: fail visibly.
        frames.push({
          hop,
          nodeId,
          action: 'dropped',
          lookup,
          entry,
          inLabel: null,
          outLabel: null,
          nextNodeId: null,
          narration: `${node.label} cannot pop a label it never pushed — packet dropped`,
        })
        break
      }
      frames.push({
        hop,
        nodeId,
        action: 'pop',
        lookup,
        entry,
        inLabel: carried,
        outLabel: null,
        nextNodeId: null,
        narration: `${node.label} pops label ${carried} and delivers ${preset.destination}`,
      })
      break
    }

    const outLabel = entry.outLabel
    const hopOut = resolveHop(preset, node, entry.outPort, nodeById)
    if (!hopOut) {
      frames.push({
        hop,
        nodeId,
        action: 'dropped',
        lookup,
        entry,
        inLabel: carried,
        outLabel: null,
        nextNodeId: null,
        narration: `${node.label} sends label ${outLabel} to unconnected port ${entry.outPort} — packet dropped`,
      })
      break
    }

    const action = carried === null ? 'classify' : 'swap'
    const narration =
      action === 'classify'
        ? `${node.label} classifies ${lookupLabel}, pushes label ${outLabel} and sends to ${hopOut.node.label}`
        : `${node.label} swaps label ${carried} to ${outLabel}, out ${entry.outPort} to ${hopOut.node.label}`

    frames.push({
      hop,
      nodeId,
      action,
      lookup,
      entry,
      inLabel: carried,
      outLabel,
      nextNodeId: hopOut.node.id,
      narration,
    })

    carried = outLabel
    lookupLabel = outLabel
    arrivalPort = hopOut.arrivalPort
    nodeId = hopOut.node.id
  }

  return frames
}

function dropFrame(
  preset: Preset,
  node: TopologyNode,
  lookup: FrameLookup,
  carried: number | null,
): MplsFrame {
  return {
    hop: preset.nodes.length,
    nodeId: node.id,
    action: 'dropped',
    lookup,
    entry: null,
    inLabel: carried,
    outLabel: null,
    nextNodeId: null,
    narration: `Forwarding loop at ${node.label} — packet dropped`,
  }
}

function resolveHop(
  preset: Preset,
  from: TopologyNode,
  outPort: string,
  nodeById: Map<string, TopologyNode>,
): { node: TopologyNode; arrivalPort: string } | null {
  const link = preset.links.find(
    (candidate) =>
      (candidate.a === from.id && candidate.aPort === outPort) ||
      (candidate.b === from.id && candidate.bPort === outPort),
  )
  if (!link) return null

  const leavesFromA = link.a === from.id
  const nextNodeId = leavesFromA ? link.b : link.a
  const node = nodeById.get(nextNodeId)
  if (!node) return null
  return { node, arrivalPort: leavesFromA ? link.bPort : link.aPort }
}
