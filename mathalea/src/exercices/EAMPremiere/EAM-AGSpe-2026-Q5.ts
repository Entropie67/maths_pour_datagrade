import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'dee0e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Retrouver une fonction à partir d'un tableau de signes"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5AGs2026 extends ExerciceQcmACourt {
  // Tableau de signes d'une parabole : racines r1 < 0 < r2, orientation S (=signe de a).
  // Distracteurs forçables (distA/B/C) pour reproduire la version officielle.
  private appliquerLesValeurs(
    r1: number,
    r2: number,
    S: number,
    distA?: string,
    distB?: string,
    distC?: string,
  ): void {
    // Affichage d'un facteur : signe +1 => « x - racine » ; signe -1 => « racine - x » (racine > 0)
    const facteurTex = (signe: number, racine: number) =>
      signe > 0 ? reduireAxPlusB(1, -racine) : `${texNombre(racine)}-x`

    // Forme factorisée pour des racines (ra, rb) et une orientation (le facteur -1 va sur la racine positive)
    const exprFactorisee = (ra: number, rb: number, orient: number) => {
      if (orient > 0) return `(${facteurTex(1, ra)})(${facteurTex(1, rb)})`
      if (rb > 0) return `(${facteurTex(1, ra)})(${facteurTex(-1, rb)})`
      return `(${facteurTex(-1, ra)})(${facteurTex(1, rb)})`
    }

    // Fonction servant à tracer le tableau de l'énoncé : signe +0-0+ si S>0, -0+0- si S<0
    const f = (x: number | FractionEtendue) =>
      S * (Number(x) - r1) * (Number(x) - r2)

    const opts = {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    }

    this.enonce = `On considère ci-dessous le tableau de signes d'une fonction $f$ définie sur $\\mathbb{R}$.<br><br>`
    this.enonce += `${tableauSignesFonction(f, -20, 20, opts)}<br>`
    this.enonce += `Une expression possible de $f(x)$ est :`

    const correct = exprFactorisee(r1, r2, S)
    let dist1: string, dist2: string, dist3: string
    if (distA && distB && distC) {
      dist1 = distA
      dist2 = distB
      dist3 = distC
    } else {
      dist1 = exprFactorisee(r1, r2, -S) // mauvais signe de a (orientation inversée)
      dist2 = exprFactorisee(-r1, -r2, S) // signe des racines inversé
      dist3 = exprFactorisee(-r1, -r2, -S) // racines et signe de a faux
    }

    this.reponses = [
      `$f(x) = ${correct}$`,
      `$f(x) = ${dist1}$`,
      `$f(x) = ${dist2}$`,
      `$f(x) = ${dist3}$`,
    ]

    this.correction = `Les expressions proposées sont des formes factorisées de polynômes du second degré.<br>`
    this.correction += `D'après le tableau, $f$ s'annule en $x = ${r1}$ et $x = ${r2}$ : ce sont les racines $x_1$ et $x_2$.<br>`
    this.correction +=
      S > 0
        ? `À l'extérieur des racines, $f(x)$ est positive : le coefficient $a$ est donc positif ($a > 0$).<br>`
        : `À l'extérieur des racines, $f(x)$ est négative : le coefficient $a$ est donc négatif ($a < 0$).<br>`
    this.correction += `Une seule expression vérifie ces conditions, il s'agit de  $f(x) = ${miseEnEvidence(correct)}$.`
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : tableau + 0 - 0 + (racines -3 et 2)  =>  f(x) = (x+3)(x-2)
    this.appliquerLesValeurs(-3, 2, 1, '(x+3)(2-x)', '(x+2)(x-3)', '(x+3)(x+2)')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const r1 = choice([-5, -4, -3, -2]) // racine négative
      const r2 = choice([2, 3, 4, 5].filter((r) => r !== -r1)) // racine positive, ≠ -r1 (racines non symétriques)
      const S = choice([1, -1]) // orientation de la parabole (signe de a)
      this.appliquerLesValeurs(r1, r2, S)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Une expression possible de \$f\(x\)\$ est :\s*$/,
        'Donner une expression factorisée de $f(x)$, dont le coefficient de $x^2$ est égal à $1$ ou $-1$.',
      )
    // La bonne réponse du QCM est de la forme « $f(x) = (x+3)(2-x)$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$f\(x\) = /, '').replace(/\$$/, '')
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { factorisation: true })
    this.texteAvantReponseCourte = '$f(x)=$'
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.options.vertical = true
  }
}
