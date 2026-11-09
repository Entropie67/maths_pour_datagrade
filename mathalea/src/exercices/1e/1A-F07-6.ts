import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import { bleuMathalea } from '../../lib/colors'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = 'f3030'
export const refs = {
  'fr-fr': ['1A-F07-6'],
  'fr-ch': ['1mQCM-66'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer une équation de droite à partir de sa représentation graphique'
export const dateDePublication = '13/02/2026'

export default class Auto1AF076 extends ExerciceQcmA {
  private appliquerLesValeurs(
    signeM: 1 | -1,
    typeP: 'pos' | 'neg' | 'nul',
  ): void {
    // ===== Graphique schématique (sans graduations ni labels) =====
    const o = latex2d('0', -0.3, -0.3, { letterSize: 'scriptsize' })

    const yOrd = typeP === 'pos' ? 1 : typeP === 'neg' ? -1 : 0
    const pente = signeM * 2
    const ptA = pointAbstrait(0, yOrd)
    const ptB = pointAbstrait(1, yOrd + pente)
    const d = droite(ptA, ptB, '', bleuMathalea)
    d.epaisseur = 2

    const lD = latex2d('D', signeM > 0 ? 0.5 : -0.5, 2.5, {
      color: bleuMathalea,
      letterSize: 'normalsize',
    })

    const r1 = repere({
      xMin: -3,
      xMax: 3,
      xUnite: 1,
      yMin: -3,
      yMax: 3,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
      xThickListe: false,
      yThickListe: false,
      xLabelListe: false,
      yLabelListe: false,
    })

    const objet = mathalea2d(
      {
        xmin: -3,
        xmax: 3.5,
        ymin: -3,
        ymax: 3.5,
        pixelsParCm: 25,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
      lD,
    )

    // ===== Génération des valeurs numériques =====
    const absM = randint(1, 3)
    const mVal = signeM * absM
    const pVal =
      typeP === 'pos' ? randint(1, 3) : typeP === 'neg' ? -randint(1, 3) : 0

    // ===== Forme réduite : y = mx + p =====
    const nuReduite = `y=${rienSi1(mVal)}x${pVal !== 0 ? ecritureAlgebrique(pVal) : ''}`

    // ===== Forme cartésienne =====
    const mult = randint(1, 3)
    let aC = -mVal * mult
    let bC = mult
    let cC = -pVal * mult
    if (aC < 0) {
      aC = -aC
      bC = -bC
      cC = -cC
    }
    const nuCartesienne = this.nuEquationCartesienne(aC, bC, cC)

    // ===== Forme x² : y = x² - (x + k)² + c =====
    // Développement : y = -2kx + (c - k²), donc mX2 = -2k et pX2 = c - k²
    const kBon = signeM > 0 ? -randint(1, 3) : randint(1, 3)
    const pX2 = pVal
    const cX2 = pX2 + kBon * kBon
    const texKBon = kBon > 0 ? `x+${kBon}` : `x${kBon}`
    const nuX2 = `y=x^2-(${texKBon})^2${cX2 !== 0 ? ecritureAlgebrique(cX2) : ''}`

    // ===== Distracteurs (mauvais signe de m ou de p) =====

    // Réduite avec m opposé
    const nuReduiteFausseM = `y=${rienSi1(-mVal)}x${pVal !== 0 ? ecritureAlgebrique(pVal) : ''}`

    // Réduite avec p opposé (ou p non nul si p = 0)
    const pFaux = pVal !== 0 ? -pVal : choice([-1, -2, 1, 2])
    const nuReduiteFausseP = `y=${rienSi1(mVal)}x${ecritureAlgebrique(pFaux)}`

    // Cartésienne avec mauvais signe de m
    let aCf = mVal * mult
    let bCf = mult
    let cCf = -pVal * mult
    if (aCf < 0) {
      aCf = -aCf
      bCf = -bCf
      cCf = -cCf
    }
    const nuCartesienneFausseM = this.nuEquationCartesienne(aCf, bCf, cCf)
    // Forme réduite correspondante : m opposé, même p
    const nuReduiteDeCartFausse = `y=${rienSi1(-mVal)}x${pVal !== 0 ? ecritureAlgebrique(pVal) : ''}`

    // Forme x² avec mauvais signe de m (k inversé)
    const kFaux = -kBon
    const cX2Faux = pVal + kFaux * kFaux
    const texKFaux = kFaux > 0 ? `x+${kFaux}` : `x${kFaux}`
    const nuX2FausseM = `y=x^2-(${texKFaux})^2${cX2Faux !== 0 ? ecritureAlgebrique(cX2Faux) : ''}`
    const mX2Faux = -2 * kFaux
    const nuReduiteDeX2Fausse = `y=${rienSi1(mX2Faux)}x${pVal !== 0 ? ecritureAlgebrique(pVal) : ''}`

    // ===== Choix de la bonne réponse (alternance des 3 formes) =====
    const typeBonne = choice(['reduite', 'cartesienne', 'x2'])

    // Structure : { equation, reduite } pour chaque réponse
    interface Reponse {
      eq: string
      red: string
    }

    let bonne: Reponse
    let faux1: Reponse
    let faux2: Reponse
    let faux3: Reponse

    switch (typeBonne) {
      case 'reduite':
        bonne = { eq: nuReduite, red: nuReduite }
        faux1 = { eq: nuReduiteFausseM, red: nuReduiteFausseM }
        faux2 = { eq: nuCartesienneFausseM, red: nuReduiteDeCartFausse }
        faux3 = { eq: nuX2FausseM, red: nuReduiteDeX2Fausse }
        break

      case 'cartesienne':
        bonne = { eq: nuCartesienne, red: nuReduite }
        faux1 = { eq: nuReduiteFausseM, red: nuReduiteFausseM }
        faux2 = { eq: nuReduiteFausseP, red: nuReduiteFausseP }
        faux3 = { eq: nuX2FausseM, red: nuReduiteDeX2Fausse }
        break

      case 'x2':
      default:
        bonne = { eq: nuX2, red: nuReduite }
        faux1 = { eq: nuReduiteFausseM, red: nuReduiteFausseM }
        faux2 = { eq: nuCartesienneFausseM, red: nuReduiteDeCartFausse }
        faux3 = { eq: nuReduiteFausseP, red: nuReduiteFausseP }
        break
    }

    // ===== Énoncé =====
    this.enonce = `${deuxColonnes(
      'On a représenté ci-contre une droite $(D)$.<br><br>' +
        "Parmi les quatre équations ci-dessous, la seule susceptible d'être représentée par la droite $(D)$ est :",
      `${objet}`,
    )}`

    // ===== Correction =====
    const texSigneM =
      signeM > 0
        ? 'positif ($(D)$ représente une fonction affine croissante)'
        : 'négatif ($(D)$ représente une fonction affine décroissante)'
    const texP =
      typeP === 'pos'
        ? "strictement positive ($(D)$ coupe l'axe des ordonnées au-dessus de l'origine)"
        : typeP === 'neg'
          ? "strictement négative ($(D)$ coupe l'axe des ordonnées en dessous de l'origine)"
          : "nulle ($(D)$ passe par l'origine)"

    this.correction = `On observe sur le graphique que le coefficient directeur est ${texSigneM} et que l'ordonnée à l'origine est ${texP}.<br>`

    // Écriture de chaque équation sous forme réduite
    const toutes = [bonne, faux1, faux2, faux3]
    this.correction +=
      'On écrit les équations qui ne sont pas forme réduite, sous forme réduite :<br>'
    for (const rep of toutes) {
      if (rep.eq === rep.red) {
        this.correction += `$\\bullet\\:$ $${rep.eq}$ est sous forme réduite.<br>`
      } else {
        this.correction += `$\\bullet\\:$ $${rep.eq}$ s'écrit $${rep.red}$.<br>`
      }
    }

    this.correction += `Parmi ces $4$ équations réduites, la seule équation ayant un coefficient directeur ${signeM > 0 ? 'positif' : 'négatif'} et une ordonnée à l'origine ${typeP === 'pos' ? 'positive' : typeP === 'neg' ? 'négative' : 'nulle'} est : $${miseEnEvidence(bonne.eq)}$.`

    // ===== Réponses =====
    this.reponses = [
      `$${bonne.eq}$`,
      `$${faux1.eq}$`,
      `$${faux2.eq}$`,
      `$${faux3.eq}$`,
    ]
  }

  private nuEquationCartesienne(a: number, b: number, c: number): string {
    return `${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${c !== 0 ? ecritureAlgebrique(c) : ''}=0`
  }

  versionOriginale: () => void = () => {
    const o = latex2d('0', -0.3, -0.3, { letterSize: 'scriptsize' })

    const ptA = pointAbstrait(0, 0)
    const ptB = pointAbstrait(1, -2)
    const d = droite(ptA, ptB, '', bleuMathalea)
    d.epaisseur = 2

    const lD = latex2d('D', 0.5, 2.5, {
      color: bleuMathalea,
      letterSize: 'normalsize',
    })

    const r1 = repere({
      xMin: -3,
      xMax: 3,
      xUnite: 1,
      yMin: -3,
      yMax: 3,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
      xThickListe: false,
      yThickListe: false,
      xLabelListe: false,
      yLabelListe: false,
    })

    const objet = mathalea2d(
      {
        xmin: -3,
        xmax: 3.5,
        ymin: -3,
        ymax: 3.5,
        pixelsParCm: 25,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
      lD,
    )

    this.enonce = `${deuxColonnes(
      'On a représenté ci-contre une droite $(D)$.<br><br>' +
        "Parmi les quatre équations ci-dessous, la seule susceptible d'être représentée par la droite $(D)$ est :",
      `${objet}`,
    )}`

    // 2x - y = 0 => y = 2x (m=2 > 0, p=0) ✗
    // 2x + y + 1 = 0 => y = -2x - 1 (m=-2, p=-1) ✗
    // y = x² - (x+1)² + 1 = -2x (m=-2, p=0) ✓
    // y = 2x - 1 (m=2, p=-1) ✗
    this.correction = `On observe sur le graphique que le coefficient directeur est négatif (la droite est décroissante) et que l'ordonnée à l'origine est nulle (la droite passe par l'origine).<br>`
    this.correction += `On écrit les équations qui ne sont pas sous forme réduite, sous forme réduite :<br>`
    this.correction += `$\\bullet\\:$ $2x-y=0$ s'écrit $y=2x$.<br>`
    this.correction += `$\\bullet\\:$ $2x+y+1=0$ s'écrit $y=-2x-1$.<br>`
    this.correction += `$\\bullet\\:$ $y=x^2-(x+1)^2+1$ s'écrit $y=-2x$.<br>`
    this.correction += `$\\bullet\\:$ $y=2x-1$ est sous forme réduite.<br>`
    this.correction += `<br>Parmi ces $4$ équations réduites, la seule équation ayant un coefficient directeur négatif et une ordonnée à l'origine nulle est : $${miseEnEvidence('y=x^2-(x+1)^2+1')}$.`

    this.reponses = ['$y=x^2-(x+1)^2+1$', '$2x-y=0$', '$2x+y+1=0$', '$y=2x-1$']
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const signeM = choice([1, -1]) as 1 | -1
      const typeP = choice(['pos', 'neg', 'nul']) as 'pos' | 'neg' | 'nul'
      this.appliquerLesValeurs(signeM, typeP)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
