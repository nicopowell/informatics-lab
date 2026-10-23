import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BstNode } from '../logic/binarySearchTree'
import { generateInsertSteps, generateSearchSteps } from '../logic/binarySearchTree'
import { createReadyFrame, toVisualFrames } from '../logic/visualFrames'
import type { BstFrame } from '../logic/visualFrames'
import { layoutTree } from '../logic/layout'
import TreeCanvas from './TreeCanvas'

function n(
  value: number,
  left: BstNode | null = null,
  right: BstNode | null = null,
): BstNode {
  return { value, left, right }
}

//        60
//       /  \
//     42    78
//    /
//  30
const TREE = n(60, n(42, n(30)), n(78))

function render(frame: BstFrame, finalFrame?: BstFrame): string {
  return renderToStaticMarkup(<TreeCanvas frame={frame} finalFrame={finalFrame} />)
}

function searchFrames(tree: BstNode | null, target: number): BstFrame[] {
  return toVisualFrames(generateSearchSteps(tree, target), tree)
}

describe('TreeCanvas', () => {
  it('draws every node of the ready tree with its value', () => {
    const html = render(createReadyFrame(TREE, 42))

    expect(html.match(/<circle /g)).toHaveLength(4)
    expect(html.match(/<text /g)).toHaveLength(4)
    expect(html).toContain('>60<')
    expect(html).toContain('>30<')
    expect(html).not.toContain('bst-tree__gap')
  })

  it('spots exactly the node being compared', () => {
    const html = render(searchFrames(TREE, 30)[0])

    expect(html.match(/bst-tree__node--active/g)).toHaveLength(1)
    expect(html).toContain('>60<')
  })

  it('dims the whole subtree a descend ruled out', () => {
    const html = render(searchFrames(TREE, 78)[1])

    // 60 went right: 42 and its child 30 are both out.
    expect(html.match(/bst-tree__node--discarded/g)).toHaveLength(2)
  })

  it('lights the path walked so far: edges and visited nodes', () => {
    const html = render(searchFrames(TREE, 30)[3])

    expect(html.match(/bst-tree__edge--path/g)).toHaveLength(1)
    expect(html.match(/bst-tree__node--path/g)).toHaveLength(2) // 60 and 42
  })

  it('outlines the empty slot a miss reached, with its dashed branch', () => {
    const frames = searchFrames(TREE, 31)
    const html = render(frames.at(-1) as BstFrame)

    expect(html.match(/<circle /g)).toHaveLength(5) // four nodes + the gap
    expect(html.match(/bst-tree__gap/g)).toHaveLength(2) // circle + line
    // The dashed branch starts at the parent's edge, never at its centre:
    // nothing may draw across a node.
    const parent = layoutTree(TREE).nodes.find((node) => node.value === 30)
    expect(html).not.toContain(`x1="${parent?.x}" y1="${parent?.y}"`)
    // Nothing is being compared at a terminal frame: the parent keeps its
    // route colour instead of the amber spotlight.
    expect(html).not.toContain('bst-tree__node--active')
  })

  it('marks the freshly attached node and its edge as new', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)
    const frames = toVisualFrames(steps, TREE, root)
    const html = render(frames.at(-1) as BstFrame)

    expect(html.match(/<circle /g)).toHaveLength(5)
    expect(html.match(/bst-tree__node--new/g)).toHaveLength(1)
    expect(html.match(/bst-tree__edge--new/g)).toHaveLength(1)
    // The parent is done comparing: route colour, not amber.
    expect(html).not.toContain('bst-tree__node--active')
    expect(html).toContain('>50<')
  })

  it('marks the found node green instead of the comparing amber', () => {
    const frames = searchFrames(TREE, 30)
    const html = render(frames.at(-1) as BstFrame)

    expect(html.match(/bst-tree__node--found/g)).toHaveLength(1)
    expect(html).not.toContain('bst-tree__node--active')
  })

  it('exposes the svg as an image to assistive tech', () => {
    const html = render(createReadyFrame(TREE, 42))

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Binary search tree"')
  })

  it('keeps the new node mounted as a pending ghost before the insert lands', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)
    const frames = toVisualFrames(steps, TREE, root)
    const final = frames.at(-1) as BstFrame

    // Before the terminal frame: the ghost is already mounted (invisible),
    // so stepping back to here fades it out instead of cutting it away.
    const ghost = render(createReadyFrame(TREE, 50), final)
    expect(ghost.match(/<circle /g)).toHaveLength(5) // four nodes + the ghost
    expect(ghost.match(/bst-tree__pending/g)).toHaveLength(2) // node + edge

    // On the terminal frame the very same elements go live.
    const live = render(final, final)
    expect(live).not.toContain('bst-tree__pending')
    expect(live.match(/bst-tree__node--new/g)).toHaveLength(1)
    expect(live.match(/bst-tree__edge--new/g)).toHaveLength(1)
  })

  it('keeps the empty slot mounted as a pending ghost before the miss lands', () => {
    const frames = searchFrames(TREE, 31)
    const final = frames.at(-1) as BstFrame

    const ghost = render(createReadyFrame(TREE, 31), final)
    expect(ghost.match(/bst-tree__gap/g)).toHaveLength(2) // ring + line
    expect(ghost.match(/bst-tree__pending/g)).toHaveLength(2)

    const live = render(final, final)
    expect(live).not.toContain('bst-tree__pending')
    expect(live.match(/bst-tree__gap/g)).toHaveLength(2)
  })
})
