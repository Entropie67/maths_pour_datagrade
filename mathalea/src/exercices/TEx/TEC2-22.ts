import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { all, isEqual } from '../../lib/interactif/checks'
import { ecritureAlgebriqueSauf1, ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer le module d'un produit de deux nombres complexes"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = 'd35e4'
export const refs = {
  'fr-fr': ['TEC2-22'],
  'fr-ch': [],
}

/** Écrit √n sous la forme k√m (m sans facteur carré), ou k si n est un carré parfait. */
const racineSimplifiee = (n: number, format: (x: number) => string = String) => {
  let k = 1
  let m = n
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d
      k *= d
    }
  }
  if (m === 1) return format(k)
  return `${k === 1 ? '' : format(k)}\\sqrt{${format(m)}}`
}

/**
 * Calculer le module du produit z₁z₂ à partir des formes algébriques de z₁ et z₂.
 * @author Stéphane Guyon
 */
export default class ModuleProduit extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const a = randint(-5, 5, 0)
      const b = randint(-5, 5, 0)
      const c = randint(-5, 5, 0)
      const d = randint(-5, 5, 0)
      if (a === c && b === d) continue
      if (!this.questionJamaisPosee(i, a, b, c, d)) continue

      const n1 = a * a + b * b
      const n2 = c * c + d * d
      const n = n1 * n2
      const z1 = `${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}`
      const z2 = `${c}${ecritureAlgebriqueSauf1(d)}\\mathrm{i}`
      const valeur = racineSimplifiee(n)
      const valeurTex = racineSimplifiee(n, texNombre)
      // On factorise par le PGCD de la partie réelle et de la partie imaginaire
      const g1 = pgcd(a, b)
      const g2 = pgcd(c, d)
      const n1r = n1 / (g1 * g1)
      const n2r = n2 / (g2 * g2)
      const facteur = (g: number) => (g === 1 ? '' : String(g))
      const moduleTex = (re: number, im: number, nom: string, g: number, norme: number) => {
        if (g === 1) {
          return (
            `$\\begin{aligned}\\vert ${nom}\\vert&=\\sqrt{${ecritureParentheseSiNegatif(re)}^2+${ecritureParentheseSiNegatif(im)}^2}\\\\` +
            `&=\\sqrt{${re * re}+${im * im}}\\\\&=\\sqrt{${texNombre(norme)}}\\end{aligned}$`
          )
        }
        const reduit = `${re / g}${ecritureAlgebriqueSauf1(im / g)}\\mathrm{i}`
        const normeReduite = norme / (g * g)
        return (
          `$\\begin{aligned}\\vert ${nom}\\vert&=\\vert ${g}\\left(${reduit}\\right)\\vert\\\\` +
          `&=${g}\\times\\sqrt{${ecritureParentheseSiNegatif(re / g)}^2+${ecritureParentheseSiNegatif(im / g)}^2}\\\\` +
          `&=${g}\\sqrt{${(re / g) ** 2}+${(im / g) ** 2}}\\\\&=${g}\\sqrt{${texNombre(normeReduite)}}\\end{aligned}$`
        )
      }
      const racine1 = `${facteur(g1)}\\sqrt{${n1r}}`
      const racine2 = `${facteur(g2)}\\sqrt{${n2r}}`
      const gProduit = g1 * g2
      const produitReduit = `${facteur(gProduit)}\\sqrt{${texNombre(n1r * n2r)}}`
      const etapes = [`${racine1}\\times ${racine2}`, produitReduit, valeurTex].filter(
        (etape, k, tab) => k === 0 || etape !== tab[k - 1],
      )
      const lignes = etapes.map((etape, k) => {
        const fin = k === etapes.length - 1 ? miseEnEvidence(etape) : etape
        return k === 0 ? `\\vert z_1z_2\\vert&=${fin}` : `&=${fin}`
      })
      const correction =
        "Le module d'un produit est le produit des modules, donc " +
        '$\\vert z_1z_2\\vert=\\vert z_1\\vert\\times\\vert z_2\\vert$.<br>' +
        `${moduleTex(a, b, 'z_1', g1, n1)}<br>${moduleTex(c, d, 'z_2', g2, n2)}<br>` +
        `$\\begin{aligned}${lignes.join('\\\\')}\\end{aligned}$`
      createQuestion(this, i, {
        question: `Soit $z_1=${z1}$ et $z_2=${z2}$.<br>Calculer le module de $z_1z_2$.`,
        correction,
        answer: { value: valeur, compare: all([isEqual()]) },
        field: { keyboard: KeyboardType.clavierFullOperations, texteAvant: '<br>$\\vert z_1z_2\\vert=$' },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
