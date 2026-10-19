import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MarkdownDescription from './MarkdownDescription'

const render = (source: string) => renderToStaticMarkup(<MarkdownDescription source={source} />)

/*
 * The descriptions are written wrapped at ~80 columns, so a bullet often spans two
 * source lines. That structure is the whole contract of this component: what the page
 * shows is a list, not a list followed by a stray sentence.
 */
describe('MarkdownDescription', () => {
  it('keeps a wrapped bullet inside its list item', () => {
    const html = render(
      '# T\n\n- **Best case:** O(n) comparisons, because one exchange-free\n  pass ends the run\n',
    )

    // One list with the two source lines joined, not a list plus a paragraph.
    expect(html).toContain('<li><strong>Best case:</strong> O(n) comparisons, because one')
    expect(html).toContain('exchange-free pass ends the run</li>')
    expect(html.match(/<ul>/g)).toHaveLength(1)
    expect(html.match(/<li>/g)).toHaveLength(1)
    expect(html).not.toContain('<p>exchange-free')
  })

  it('keeps every bullet of a wrapped list in the same list', () => {
    const html = render('- one\n  uno\n- two\n  dos\n')

    expect(html.match(/<ul>/g)).toHaveLength(1)
    expect(html).toContain('<li>one uno</li>')
    expect(html).toContain('<li>two dos</li>')
  })

  it('still starts a paragraph when the line after a list is not indented', () => {
    const html = render('- one\n\nnot indented, not part of the list\n')

    expect(html.match(/<ul>/g)).toHaveLength(1)
    expect(html).toContain('<li>one</li>')
    expect(html).toContain('<p>not indented, not part of the list</p>')
  })

  it('joins wrapped paragraph lines, as it already did', () => {
    const html = render('first line\nsecond line\n')

    expect(html).toContain('<p>first line second line</p>')
  })

  it('renders the heading alone', () => {
    expect(render('# Bubble Sort\n\ntext\n')).toContain(
      '<h1 class="experience-description__title">Bubble Sort</h1>',
    )
  })
})
