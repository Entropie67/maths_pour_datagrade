import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scratchblock } from '../../modules/scratchblock'

declare global {
  interface Window {
    notify: (message: string, objet: unknown) => void
  }
}

describe('scratchblock - garde-fous anti-boucle infinie', () => {
  beforeEach(() => {
    window.notify = vi.fn()
  })

  it('ne boucle pas indéfiniment sur une commande inconnue dans \\ovaloperator', () => {
    const malformedLatex = String.raw`\begin{scratch}[blocks]
\blocklook{dire \ovaloperator{\commandeInconnue{abc}}}
\end{scratch}`

    const start = Date.now()
    const output = scratchblock(malformedLatex)
    const durationMs = Date.now() - start

    expect(typeof output).toBe('string')
    expect(durationMs).toBeLessThan(500)
  })

  it('retourne false quand le nombre d’accolades est incohérent', () => {
    const malformedLatex = String.raw`\begin{scratch}[blocks]
\blocklook{dire \ovaloperator{1 + 2}
\end{scratch}`

    const output = scratchblock(malformedLatex)

    expect(output).toBe(false)
  })

  it('gère \\pencolor HTML et place la couleur avant :: pen', () => {
    const latex = String.raw`\begin{scratch}[blocks]
\blockpen{mettre la couleur du stylo à \pencolor{[HTML]{CB4AD4}}}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)
    expect(rendered).toContain('mettre la couleur du stylo à [#CB4AD4] :: pen')
  })

  it('traduit ovallist longueur de liste avec la categorie list', () => {
    const latex = String.raw`\begin{scratch}[blocks]
\blockvariable{mettre \selectmenu{taille} à \ovallist{longueur de \selectmenu{triplets}}}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('(longueur de [triplets v] :: list)')
  })

  it("traduit blocklist supprimer l'element avec ovallist longueur", () => {
    const latex = String.raw`\begin{scratch}[blocks]
\blocklist{supprimer l'élément \ovallist{longueur de \selectmenu{triplets}} de \selectmenu{triplets}}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain("supprimer l'élément")
    expect(rendered).toContain('(longueur de [triplets v] :: list)')
    expect(rendered).toContain('de [triplets v] :: list')
  })

  it('traduit correctement un script complet stylo/couleur/taille', () => {
    const latex = String.raw`\begin{scratch}
\blockinit{quand \greenflag est cliqué}
\blockmove{s'orienter à \ovalnum{90}}
\blockpen{stylo en position d'écriture}
\blockpen{mettre la couleur du stylo à \pencolor{[HTML]{CB4AD4}}}
\blockrepeat{répéter \ovalnum{10} fois}
{
  \blockrepeat{répéter \ovalnum{10} fois}
  {
    \blockmove{avancer de \ovalnum{20} pas}
    \blockmove{tourner \turnright{} de \ovalnum{36} degrés}
    \blockpen{ajouter \ovalnum{10} à \selectmenu{color} du stylo}
    \blockpen{mettre la taille du stylo à \ovaloperator{\ovaloperator{\ovalmove{abscisse x} modulo \ovalnum{4}} + \ovalnum{1}}}
  }
  \blockmove{avancer de \ovalnum{5} pas}
  \blockmove{tourner \turnright{} de \ovalnum{5} degrés}
}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('@greenFlag')
    expect(rendered).toContain("s'orienter à [90]")
    expect(rendered).toContain('mettre la couleur du stylo à [#CB4AD4] :: pen')
    expect(rendered).toContain('ajouter [10] à [color v] du stylo :: pen')
    expect(rendered).toMatch(/mettre la taille du stylo à .*:: pen/)
  })

  it('annote les arguments de blocs personnalisés en :: custom-arg', () => {
    const latex = String.raw`\begin{scratch}[blocks]
\initmoreblocks{définir \namemoreblocks{polygone\_régulier \ovalmoreblocks{number1} \ovalmoreblocks{number2} \boolmoreblocks{condition}}}
\blockrepeat{répéter \ovalmoreblocks{number1} fois}{
\blockmove{avancer de \ovalmoreblocks{number2} pas}
\blockif{si \boolmoreblocks{condition} alors}{
\blocklook{dire ok}
}
}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('(number1 :: custom-arg)')
    expect(rendered).toContain('(number2 :: custom-arg)')
    expect(rendered).toContain('<condition :: custom-arg>')
  })

  it('ne tronque pas les blocs après initmoreblocks avec ovalmoreblocks imbriqués', () => {
    const latex = String.raw`\begin{scratch}
\initmoreblocks{définir \namemoreblocks{polygone\_régulier \ovalmoreblocks{number1} \ovalmoreblocks{number2}}}
\blockrepeat{répéter \ovalmoreblocks{number1} fois}
{
  \blockmove{avancer de \ovalmoreblocks{number2} pas}
  \blockmove{tourner \turnright{} de \ovaloperator{\ovalnum{360} / \ovalmoreblocks{number1}} degrés}
}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('définir')
    expect(rendered).toMatch(/répéter\s+\(number1 :: custom-arg\)\s+fois/)
    expect(rendered).toMatch(/avancer\s+de\s+\(number2 :: custom-arg\)\s+pas/)
    expect(rendered).toMatch(
      /tourner\s+droite\s+de\s+\(\[360\]\s+\/\s+\(number1 :: custom-arg\)\)\s+degrés/,
    )
  })

  it('traite un gros code multi-scripts sans coupure prématurée', () => {
    const manyLooks = Array.from(
      { length: 420 },
      (_, index) => `\\blocklook{dire \\ovalnum{${index}}}`,
    ).join('\n')

    const latex = `\\begin{scratch}
${manyLooks}
\\end{scratch}

\\begin{scratch}
\\initmoreblocks{définir \\namemoreblocks{init}}
\\blockmove{aller à x: \\ovalnum{0} y: \\ovalnum{0}}
\\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('dire [419]')
    expect(rendered).toContain('aller à x: [0] y: [0]')
    expect(window.notify).not.toHaveBeenCalled()
  })

  it('traite plusieurs environnements scratch avec plusieurs initmoreblocks', () => {
    const latex = String.raw`\begin{scratch}
\initmoreblocks{définir \namemoreblocks{polygone\_régulier \ovalmoreblocks{number1} \ovalmoreblocks{number2}}}
\blockrepeat{répéter \ovalmoreblocks{number1} fois}
{
  \blockmove{avancer de \ovalmoreblocks{number2} pas}
  \blockmove{tourner \turnright{} de \ovaloperator{\ovalnum{360} / \ovalmoreblocks{number1}} degrés}
}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{Rubis}}
\blockmoreblocks{init}
\blockmoreblocks{Saut \ovalnum{1}}
\blockrepeat{répéter \ovalnum{2} fois}
{
  \blockmoreblocks{polygone\_régulier \ovalnum{4} \ovalnum{40}}
  \blockmove{avancer de \ovalnum{40} pas}
  \blockrepeat{répéter \ovalnum{3} fois}
  {
    \blockmoreblocks{Maison}
  }
  \blockmove{tourner \turnleft{} de \ovalnum{90} degrés}
  \blockmove{avancer de \ovalnum{-40} pas}
  \blockmoreblocks{Maison}
  \blockmove{tourner \turnright{} de \ovalnum{90} degrés}
  \blockmove{avancer de \ovalnum{40} pas}
  \blockmove{tourner \turnright{} de \ovalnum{180} degrés}
  \blockrepeat{répéter \ovalnum{3} fois}
  {
    \blockmoreblocks{polygone\_régulier \ovalnum{3} \ovalnum{40}}
    \blockmove{tourner \turnright{} de \ovalnum{60} degrés}
  }
  \blockmove{tourner \turnright{} de \ovalnum{120} degrés}
  \blockmove{avancer de \ovalnum{40} pas}
  \blockmove{tourner \turnleft{} de \ovalnum{60} degrés}
}
\blockmoreblocks{Saut \ovalnum{-1}}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{Maison}}
\blockmoreblocks{polygone\_régulier \ovalnum{4} \ovalnum{40}}
\blockmove{avancer de \ovalnum{40} pas}
\blockmove{tourner \turnright{} de \ovalnum{30} degrés}
\blockmoreblocks{polygone\_régulier \ovalnum{3} \ovalnum{40}}
\blockmove{tourner \turnleft{} de \ovalnum{90} degrés}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{Saut \ovalmoreblocks{number1}}}
\blockpen{relever le stylo}
\blockmove{tourner \turnright{} de \ovaloperator{\ovalnum{45} * \ovalmoreblocks{number1}} degrés}
\blockmove{avancer de \ovaloperator{\ovaloperator{\ovalnum{40} * \ovalmoreblocks{number1}} * \ovaloperator{\selectmenu{sqrt} de \ovalnum{2}}} pas}
\blockmove{tourner \turnright{} de \ovaloperator{\ovalnum{45} * \ovalmoreblocks{number1}} degrés}
\blockpen{stylo en position d'écriture}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{Emeraude}}
\blockmoreblocks{init}
\blockmove{tourner \turnright{} de \ovalnum{30} degrés}
\blockrepeat{répéter \ovalnum{2} fois}
{
  \blockmoreblocks{Maison}
  \blockmoreblocks{Maison}
  \blockmove{tourner \turnright{} de \ovalnum{30} degrés}
  \blockmoreblocks{polygone\_régulier \ovalnum{3} \ovalnum{40}}
  \blockmove{tourner \turnleft{} de \ovalnum{90} degrés}
}
\blockmove{tourner \turnleft{} de \ovalnum{60} degrés}
\blockmoreblocks{polygone\_régulier \ovalnum{3} \ovalnum{40}}
\blockmove{tourner \turnright{} de \ovalnum{30} degrés}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{init}}
\blockmove{aller à x: \ovalnum{0} y: \ovalnum{0}}
\blockpen{effacer tout}
\blockmove{s'orienter à \ovalnum{0}}
\blockpen{stylo en position d'écriture}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('Rubis')
    expect(rendered).toContain('Maison')
    expect(rendered).toContain('Emeraude')
    expect(rendered).toContain('Saut')
    expect(rendered).toContain('effacer tout')
    expect(rendered).toContain('init :: custom')
    expect(rendered).toContain('Saut [1] :: custom')
    expect(window.notify).not.toHaveBeenCalled()
  })

  it("gère \\_ dans le nom d'un blockmoreblocks sans tronquer les arguments", () => {
    const latex = String.raw`\begin{scratch}
\blockmoreblocks{polygone\_régulier \ovalnum{3} \ovalnum{40}}
\end{scratch}`

    const output = scratchblock(latex)
    expect(typeof output).toBe('string')
    const rendered = String(output)

    expect(rendered).toContain('polygone_régulier')
    expect(rendered).toContain('[3] [40] :: custom')
  })
})
