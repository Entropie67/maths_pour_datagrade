import { createList } from './lists'
import { setOutputLatex, setOutputHtml } from '../../modules/context'

const simpleNone = {
  name: 'simple none style',
  input: { items: ['item 1'], style: 'none' as const },
  latexOut: `
\\begin{itemize}
item 1\\par
\\end{itemize}
`,
  htmlOut: `
<ul class='none'>
<li>item 1</li>
</ul>
`,
}
const simpleNone2Items = {
  name: 'simple none style two items',
  input: { items: ['item 1', 'item 2'], style: 'none' as const },
  latexOut: `
\\begin{itemize}
item 1\\par
item 2\\par
\\end{itemize}
`,
  htmlOut: `
<ul class='none'>
<li>item 1</li>
<li>item 2</li>
</ul>
`,
}
const simplePuces = {
  name: 'simples puces styles',
  input: { items: ['item 1'], style: 'puces' as const },
  latexOut: `
\\begin{itemize}[label=$\\bullet$]
	\\item item 1
\\end{itemize}
`,
  htmlOut: `
<ul class='puces'>
	<li>item 1</li>
</ul>
`,
}
const simplePuces2Items = {
  name: 'simple puces style 2 items',
  input: { items: ['item 1', 'item 2'], style: 'puces' as const },
  latexOut: `
\\begin{itemize}[label=$\\bullet$]
	\\item item 1
	\\item item 2
\\end{itemize}
`,
  htmlOut: `
<ul class='puces'>
	<li>item 1</li>
	<li>item 2</li>
</ul>
`,
}

const listWithDescriptionItem = {
  name: 'description item',
  input: {
    items: ['item 1', { description: 'en-tête', text: 'texte' }, 'item 3'],
    style: 'puces' as const,
  },
  htmlOut: `
<ul class='puces'>
	<li>item 1</li>
	<li><span>en-tête</span>texte</li>
	<li>item 3</li>
</ul>
`,
  latexOut: `
\\begin{itemize}[label=$\\bullet$]
	\\item item 1
	\\item[\\textbf{en-tête}] texte
	\\item item 3
\\end{itemize}
`,
}

const listWithIntroAndSubList = {
  name: 'intro and sublist',
  input: {
    items: [
      'item 1',
      'item 2',
      { items: ['item 3'], style: 'carres' as const, introduction: 'intro' },
    ],
    style: 'puces' as const,
  },
  htmlOut: `
<ul class='puces'>
	<li>item 1</li>
	<li>item 2</li>
	<li>intro
	<ul class='carres'>
		<li>item 3</li>
	</ul>
</li>
</ul>
`,
  latexOut: `
\\begin{itemize}[label=$\\bullet$]
	\\item item 1
	\\item item 2
	\\item intro
	\\begin{itemize}[label=\\tiny$\\blacksquare$]
		\\item item 3
	\\end{itemize}

\\end{itemize}
`,
}

describe.each([
  simpleNone,
  simpleNone2Items,
  simplePuces,
  simplePuces2Items,
  listWithDescriptionItem,
  listWithIntroAndSubList,
])('$name', ({ input, htmlOut, latexOut }) => {
  test('html output', () => {
    setOutputHtml()
    expect(createList(input)).toBe(htmlOut)
  })
  test('latex output', () => {
    setOutputLatex()
    expect(createList(input)).toBe(latexOut)
  })
})
