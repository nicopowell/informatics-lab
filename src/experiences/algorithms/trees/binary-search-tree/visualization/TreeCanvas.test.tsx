import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BstNode } from '../logic/binarySearchTree'
import { generateInsertSteps, generateSearchSteps } from '../logic/binarySearchTree'
import { createReadyFrame, toVisualFrames } from '../logic/visualFrames'
import type { BstFrame } from '../logic/visualFrames'
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

function render(frame: BstFrame): string {
  return renderToStaticMarkup(<TreeCanvas frame={frame} />)
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

  it('lights the edges along the path walked so far', () => {
    const html = render(searchFrames(TREE, 30)[3])

    expect(html.match(/bst-tree__edge--path/g)).toHaveLength(1)
  })

  it('outlines the empty slot a miss reached', () => {
    const frames = searchFrames(TREE, 31)
    const html = render(frames.at(-1) as BstFrame)

    expect(html.match(/<circle /g)).toHaveLength(5) // four nodes + the gap
    expect(html.match(/bst-tree__gap/g)).toHaveLength(1)
  })

  it('marks the freshly attached node on the insert frame', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)
    const frames = toVisualFrames(steps, TREE, root)
    const html = render(frames.at(-1) as BstFrame)

    expect(html.match(/<circle /g)).toHaveLength(5)
    expect(html.match(/bst-tree__node--new/g)).toHaveLength(1)
    expect(html).toContain('>50<')
  })

  it('exposes the svg as an image to assistive tech', () => {
    const html = render(createReadyFrame(TREE, 42))

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Binary search tree"')
  })
})
