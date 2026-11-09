/**
 * Texte des fiches de cours en HTML, comme dans l'application : paragraphes,
 * listes (lignes « - », une ligne sans tiret continue l'élément précédent),
 * **gras**, *italique*, formules entre $ (dans la ligne) et $$ (centrées).
 * Tout le texte est échappé ; seules les formules passent par KaTeX.
 */
import katex from 'katex'

const escape = (t: string) =>
  t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export function formula(latex: string, display = false) {
  return katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  })
}

export function richText(text: string): string {
  const formulas: string[] = []
  const centered = new Set<number>()
  // Formules mises de côté (elles peuvent contenir *, - ou des retours à la ligne)
  const withoutFormulas = text.replace(
    /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g,
    (_, block: string | undefined, inline: string | undefined) => {
      if (block !== undefined) centered.add(formulas.length)
      formulas.push(
        block !== undefined
          ? `<span class="block text-center my-2">${formula(block.trim(), true)}</span>`
          : formula(inline!),
      )
      return `\u0000${formulas.length - 1}\u0000`
    },
  )
  const inline = (t: string) =>
    escape(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\u0000(\d+)\u0000/g, (_, n) => formulas[Number(n)])
  // Pas de saut de ligne autour d'une formule centrée (elle va déjà à la ligne)
  const isCentered = (l: string) => {
    const m = /^\u0000(\d+)\u0000$/.exec(l)
    return !!m && centered.has(Number(m[1]))
  }
  const lines = (ls: string[]) =>
    ls
      .map(
        (l, k) =>
          (k > 0 && !isCentered(l) && !isCentered(ls[k - 1]) ? '<br>' : '') +
          inline(l),
      )
      .join('')
  return withoutFormulas
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const ls = block.split('\n').map((l) => l.trim())
      if (/^- /.test(ls[0])) {
        const items: string[] = []
        for (const l of ls) {
          if (/^- /.test(l)) items.push(l.slice(2))
          else items[items.length - 1] += `\n${l}`
        }
        return `<ul class="list-disc pl-6">${items.map((e) => `<li>${lines(e.split('\n'))}</li>`).join('')}</ul>`
      }
      return `<p>${lines(ls)}</p>`
    })
    .join('')
}

/** Titre court (encadré, exemple) : texte échappé et formules entre $ */
export const richTitle = (title: string) =>
  title
    .split(/(\$[^$]+\$)/g)
    .map((m) => (/^\$[^$]+\$$/.test(m) ? formula(m.slice(1, -1)) : escape(m)))
    .join('')
