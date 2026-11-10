import { describe, expect, it } from 'vitest'
import {
  dispositionEtoile,
  operateurLatex,
  operateurTexte,
  renderLatexEtoile,
  renderTypstEtoile,
  type BrancheEtoile,
} from '../../src/lib/customElements/EtoileCalculsElement'

const branches: BrancheEtoile[] = [
  { operation: 'ajout', facteur: 1, terme: 10, signe: 1, reponse: 50 },
  { operation: 'soustraction', facteur: 1, terme: 7, signe: -1, reponse: 67 },
  { operation: 'multiplication', facteur: 5, terme: 0, signe: 1, reponse: 12 },
  { operation: 'multiplicationCombinee', facteur: 7, terme: 4, signe: 1, reponse: 8 },
  { operation: 'multiplicationCombinee', facteur: 7, terme: 3, signe: -1, reponse: 9 },
  { operation: 'ajout', facteur: 1, terme: 2, signe: 1, reponse: 58 },
  { operation: 'multiplication', facteur: 3, terme: 0, signe: 1, reponse: 20 },
  { operation: 'soustraction', facteur: 1, terme: 19, signe: -1, reponse: 79 },
]

describe('dispositionEtoile', () => {
  it('aligne chaque flèche sur l’axe étiquette → centre', () => {
    const nombre = { demiLargeur: 30, demiHauteur: 15 }
    const etiquettes = branches.map((_, i) => ({
      demiLargeur: 30 + i * 7, // largeurs volontairement très inégales
      demiHauteur: 12,
    }))
    const d = dispositionEtoile(nombre, etiquettes)
    for (const p of d.branches) {
      const angleAxe = Math.atan2(
        d.centreY - p.etiquetteY,
        d.centreX - p.etiquetteX,
      )
      const angleFleche = Math.atan2(p.pointeY - p.talonY, p.pointeX - p.talonX)
      let ecart = angleAxe - angleFleche
      while (ecart > Math.PI) ecart -= 2 * Math.PI
      while (ecart < -Math.PI) ecart += 2 * Math.PI
      expect(Math.abs(ecart)).toBeLessThan(1e-9)
    }
  })

  it('donne la même longueur aux flèches quand rien ne se chevauche', () => {
    // Étiquettes de largeurs différentes mais assez étroites pour tenir côte à
    // côte : aucun écartement, donc toutes les flèches gardent leur longueur.
    const d = dispositionEtoile(
      { demiLargeur: 26, demiHauteur: 16 },
      branches.map((_, i) => ({ demiLargeur: 25 + i * 2, demiHauteur: 11 })),
    )
    const longueurs = d.branches.map((p) =>
      Math.hypot(p.pointeX - p.talonX, p.pointeY - p.talonY),
    )
    for (const longueur of longueurs) {
      expect(longueur).toBeCloseTo(longueurs[0], 6)
    }
  })

  it('ne laisse aucune étiquette en chevaucher une autre, même à douze flèches', () => {
    // Douze directions et des étiquettes larges : sans écartement, celles du
    // haut et du bas se recouvrent.
    const etiquettes = Array.from({ length: 12 }, (_, i) => ({
      demiLargeur: 45 + (i % 4) * 12,
      demiHauteur: 15,
    }))
    const d = dispositionEtoile({ demiLargeur: 26, demiHauteur: 16 }, etiquettes)
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const a = d.branches[i]
        const b = d.branches[j]
        const separes =
          Math.abs(a.etiquetteX - b.etiquetteX) >=
            etiquettes[i].demiLargeur + etiquettes[j].demiLargeur ||
          Math.abs(a.etiquetteY - b.etiquetteY) >=
            etiquettes[i].demiHauteur + etiquettes[j].demiHauteur
        expect(separes, `étiquettes ${i} et ${j}`).toBe(true)
      }
    }
  })

  it('fait toujours partir la flèche du bord de son étiquette', () => {
    const etiquettes = Array.from({ length: 12 }, (_, i) => ({
      demiLargeur: 45 + (i % 4) * 12,
      demiHauteur: 15,
    }))
    const d = dispositionEtoile({ demiLargeur: 26, demiHauteur: 16 }, etiquettes)
    d.branches.forEach((p, i) => {
      // Le talon doit être hors de l'étiquette, mais juste à côté.
      const dx = Math.abs(p.talonX - p.etiquetteX)
      const dy = Math.abs(p.talonY - p.etiquetteY)
      const dehors =
        dx >= etiquettes[i].demiLargeur - 1e-6 ||
        dy >= etiquettes[i].demiHauteur - 1e-6
      expect(dehors, `talon ${i} hors de l’étiquette`).toBe(true)
      const distanceAuBord =
        Math.hypot(p.talonX - p.etiquetteX, p.talonY - p.etiquetteY) -
        Math.min(
          dx === 0 ? Infinity : etiquettes[i].demiLargeur / (dx / Math.hypot(dx, dy)),
          dy === 0 ? Infinity : etiquettes[i].demiHauteur / (dy / Math.hypot(dx, dy)),
        )
      expect(distanceAuBord).toBeCloseTo(10, 6) // ECART_ETIQUETTE
    })
  })

  it('englobe toutes les étiquettes dans le cadre calculé', () => {
    const etiquettes = branches.map((_, i) => ({ demiLargeur: 25 + i * 9, demiHauteur: 14 }))
    const d = dispositionEtoile({ demiLargeur: 30, demiHauteur: 15 }, etiquettes)
    d.branches.forEach((p, i) => {
      expect(p.etiquetteX - etiquettes[i].demiLargeur).toBeGreaterThanOrEqual(-1e-9)
      expect(p.etiquetteX + etiquettes[i].demiLargeur).toBeLessThanOrEqual(d.largeur + 1e-9)
      expect(p.etiquetteY - etiquettes[i].demiHauteur).toBeGreaterThanOrEqual(-1e-9)
      expect(p.etiquetteY + etiquettes[i].demiHauteur).toBeLessThanOrEqual(d.hauteur + 1e-9)
    })
  })
})

describe('sorties imprimables', () => {
  it('LaTeX : une flèche et une étiquette par branche', () => {
    const tex = renderLatexEtoile(60, branches, false)
    expect(tex).toContain('\\begin{tikzpicture}')
    expect((tex.match(/\\draw\[->/g) || []).length).toBe(branches.length)
    expect((tex.match(/\\node\[font=\\small/g) || []).length).toBe(branches.length)
    expect(tex).toContain('$\\ldots\\,\\times 7 + 4$')
    expect(tex).not.toMatch(/NaN|undefined/)
  })

  it('LaTeX correction : réponses mises en évidence', () => {
    const tex = renderLatexEtoile(60, branches, true)
    expect(tex).not.toContain('\\ldots')
    expect(tex).toContain('\\boldsymbol{50}')
  })

  it('Typst : dessin natif, pas d’image embarquée', () => {
    const typ = renderTypstEtoile(60, branches, false)
    expect(typ).not.toContain('#image')
    expect(typ.startsWith('#align(center, box(')).toBe(true)
    expect((typ.match(/#place\(top \+ left, line\(/g) || []).length).toBe(branches.length)
    expect((typ.match(/#place\(top \+ left, polygon\(/g) || []).length).toBe(branches.length)
    expect(typ).toContain('$bold(60)$')
    expect(typ).toContain('$dots.h$')
    expect(typ).toContain('$times 7 + 4$')
    expect(typ.trimEnd().endsWith('])')).toBe(true)
    expect(typ).not.toMatch(/NaN|undefined/)
  })

  it('Typst correction : réponses en couleur', () => {
    const typ = renderTypstEtoile(60, branches, true)
    expect(typ).not.toContain('$dots.h$')
    expect(typ).toContain('weight: "bold"')
  })

  it('opérateurs', () => {
    expect(operateurLatex(branches[3])).toBe('\\times 7 + 4')
    expect(operateurTexte(branches[4])).toBe('× 7 − 3')
    expect(operateurTexte(branches[0])).toBe('+ 10')
  })
})
