import type { LfibEntry, Preset, TopologyNode } from './model'

export type FrameAction =
  | 'send' // the source terminal puts the unlabelled packet on the wire
  | 'classify' // the ingress pushes: destination -> FEC -> first label
  | 'swap' // each LSR trades its label for the next one
  | 'pop' // the egress removes the label and hands the packet to its port
  | 'received' // the sink terminal takes delivery
  | 'dropped'

// Why a frame stopped. Only 'no-entry' means a lookup ran and found nothing;
// the loop guard fires before any lookup and the other two are entry-level
// faults. The LFIB panel draws its ghost row for 'no-entry' alone.
export type DropReason = 'no-entry' | 'invalid-pop' | 'bad-port' | 'loop'

// port is null only before the packet crosses its first link — a lookup that
// cannot exist yet. Terminals never search: their frames omit lookup entirely.
export type FrameLookup = { port: number | null; label: number | string }

export type MplsFrame = {
  hop: number
  nodeId: string
  action: FrameAction
  lookup?: FrameLookup // what this node searched its LFIB for
  entry: LfibEntry | null // the row that decided the frame; null when nothing matched
  inLabel: number | null // label on arrival; null before the push and after the pop
  outLabel: number | null // label on departure; null once popped or dropped
  nextNodeId: string | null // where the packet goes next; null once it stops
  narration: string
  dropReason?: DropReason // present exactly when action is 'dropped'
}

// A packet follows its LFIB output ports, not the configured LSP — the LSP is
// only what well-formed tables happen to produce (see the preset integrity
// test). Edits can therefore walk the packet off the tunnel or into a cycle,
// and every sequence must still end: visiting more nodes than exist means the
// tables loop, and the packet is dropped instead of animated forever.
export function generateFrames(preset: Preset): MplsFrame[] {
  const frames: MplsFrame[] = []
  const nodeById = new Map(preset.nodes.map((node) => [node.id, node]))
  let nodeId = preset.source
  let arrivalPort: number | null = null // null until the first link is crossed
  let carried: number | null = null // no label exists before the ingress push
  let lookupLabel: number | string = preset.destination

  for (;;) {
    const node = nodeById.get(nodeId)
    if (!node) break

    if (frames.length >= preset.nodes.length) {
      frames.push(
        droppedFrame({
          hop: frames.length,
          node,
          lookup: { port: arrivalPort, label: lookupLabel },
          entry: null,
          inLabel: carried,
          reason: 'loop',
          narration: `Forwarding loop at ${node.label} — packet dropped`,
        }),
      )
      break
    }

    const hop = frames.length

    if (node.kind === 'host') {
      if (arrivalPort === null) {
        // The run starts at the source terminal: no table, no label, one link.
        const terminal = hostHop(preset, node, nodeById)
        if (!terminal) break
        frames.push({
          hop,
          nodeId,
          action: 'send',
          entry: null,
          inLabel: null,
          outLabel: null,
          nextNodeId: terminal.node.id,
          narration: `${node.label} sends ${preset.destination} to gateway ${terminal.node.label}`,
        })
        arrivalPort = terminal.arrivalPort
        nodeId = terminal.node.id
        continue
      }
      if (carried === null) {
        // The egress pop handed the unlabelled packet over: the run is complete.
        frames.push({
          hop,
          nodeId,
          action: 'received',
          entry: null,
          inLabel: null,
          outLabel: null,
          nextNodeId: null,
          narration: `${node.label} receives ${preset.destination}`,
        })
        break
      }
      // A labelled packet at a terminal: terminals hold no table, so the
      // lookup below cannot match and the packet drops — only reachable from
      // a hand-edited preset, never from the edit UI.
    }

    const lookup: FrameLookup = { port: arrivalPort, label: lookupLabel }
    const entry = (preset.lfib[nodeId] ?? []).find(
      (candidate) => candidate.inPort === arrivalPort && candidate.inLabel === lookupLabel,
    )

    if (!entry) {
      frames.push(
        droppedFrame({
          hop,
          node,
          lookup,
          entry: null,
          inLabel: carried,
          reason: 'no-entry',
          narration: `${node.label} has no LFIB entry for port ${arrivalPort}, label ${lookupLabel} — packet dropped`,
        }),
      )
      break
    }

    if (entry.outLabel === 'pop') {
      if (carried === null) {
        // Unreachable from the edit UI (only numeric labels are editable) but a
        // hand-edited preset could push 'pop' at the ingress: fail visibly.
        frames.push(
          droppedFrame({
            hop,
            node,
            lookup,
            entry,
            inLabel: null,
            reason: 'invalid-pop',
            narration: `${node.label} cannot pop a label it never pushed — packet dropped`,
          }),
        )
        break
      }
      const sink = resolveHop(preset, node, entry.outPort, nodeById)
      if (!sink) {
        frames.push(
          droppedFrame({
            hop,
            node,
            lookup,
            entry,
            inLabel: carried,
            reason: 'bad-port',
            narration: `${node.label} pops to unconnected port ${entry.outPort} — packet dropped`,
          }),
        )
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
        nextNodeId: sink.node.id,
        narration: `${node.label} pops label ${carried} and delivers to ${sink.node.label}`,
      })
      carried = null // the packet crosses the last link unlabelled
      arrivalPort = sink.arrivalPort
      nodeId = sink.node.id
      continue
    }

    const outLabel = entry.outLabel
    const hopOut = resolveHop(preset, node, entry.outPort, nodeById)
    if (!hopOut) {
      frames.push(
        droppedFrame({
          hop,
          node,
          lookup,
          entry,
          inLabel: carried,
          reason: 'bad-port',
          narration: `${node.label} sends label ${outLabel} to unconnected port ${entry.outPort} — packet dropped`,
        }),
      )
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

// Every stopped packet is built here so dropped frames cannot drift apart:
// no label is ever written (outLabel null) and no hop follows (nextNodeId null).
function droppedFrame(parts: {
  hop: number
  node: TopologyNode
  lookup: FrameLookup
  entry: LfibEntry | null
  inLabel: number | null
  reason: DropReason
  narration: string
}): MplsFrame {
  return {
    hop: parts.hop,
    nodeId: parts.node.id,
    action: 'dropped',
    dropReason: parts.reason,
    lookup: parts.lookup,
    entry: parts.entry,
    inLabel: parts.inLabel,
    outLabel: null,
    nextNodeId: null,
    narration: parts.narration,
  }
}

// A terminal has exactly one link: its only way out is its gateway.
function hostHop(
  preset: Preset,
  host: TopologyNode,
  nodeById: Map<string, TopologyNode>,
): { node: TopologyNode; arrivalPort: number } | null {
  const link = preset.links.find(
    (candidate) => candidate.a === host.id || candidate.b === host.id,
  )
  if (!link) return null
  const hostIsA = link.a === host.id
  const port = hostIsA ? link.aPort : link.bPort
  return resolveHop(preset, host, port, nodeById)
}

function resolveHop(
  preset: Preset,
  from: TopologyNode,
  outPort: number,
  nodeById: Map<string, TopologyNode>,
): { node: TopologyNode; arrivalPort: number } | null {
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
