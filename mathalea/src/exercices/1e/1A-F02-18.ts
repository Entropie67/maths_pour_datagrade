import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import Trinome from '../../modules/Trinome'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '7ef2d'
export const refs = {
  'fr-fr': ['1A-F02-18'],
  'fr-ch': ['1mQCM-44', '11LSQCMFA2A-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer la position d'un point par rapport à une courbe à partir de l'expression de la fonction"
export const dateDePublication = '17/12/2025'
export const dateDeModifImportante = '21/10/2026'

export default class Auto1AF2r extends ExerciceQcmA {
  private correctionsDetaillees = new Map<string, string>()

  private appliquerLesValeurs(
    typeFonction: 'affine' | 'trinome',
    numCoeff: number,
    denCoeff: number,
    ordOrigine: number,
    multiplicateur: number,
    position: number,
    b?: number,
    c?: number,
  ): void {
    let fonctionTex: string
    let imageCalcul: number
    let detailCalcul: string
    let xPoint: number
    let yPoint: number

    if (typeFonction === 'affine') {
      // Fonction affine f(x) = (numCoeff/denCoeff)x + ordOrigine
      const coeffDir = new FractionEtendue(numCoeff, denCoeff)
      xPoint = multiplicateur * denCoeff
      imageCalcul = numCoeff * multiplicateur + ordOrigine

      fonctionTex = `$f(x)=${reduireAxPlusB(coeffDir, ordOrigine)}$`

      detailCalcul = `$\\begin{aligned}
      f(${xPoint})&=${coeffDir.texFractionSimplifiee}\\times ${ecritureParentheseSiNegatif(xPoint)}${ecritureAlgebrique(ordOrigine)}\\\\
     &=\\dfrac{${numCoeff * xPoint}}{${denCoeff}}${ecritureAlgebrique(ordOrigine)}\\\\
     &=${(numCoeff * xPoint) / denCoeff}${ecritureAlgebrique(ordOrigine)}\\\\
     &=${texNombre(imageCalcul)}
     \\end{aligned}$`

      if (position === 0) {
        yPoint = imageCalcul
      } else if (position === 1) {
        yPoint = imageCalcul + randint(1, 3)
      } else {
        yPoint = imageCalcul - randint(1, 3)
      }
    } else {
      // Trinôme f(x) = ax² + bx + c
      const a = numCoeff
      const bCoeff = b!
      const cCoeff = c!
      const p = new Trinome(a, bCoeff, cCoeff)
      fonctionTex = `$f(x)=${p.tex}$`
      xPoint = randint(-4, 4, 0)
      imageCalcul = a * xPoint * xPoint + bCoeff * xPoint + cCoeff

      const ax2 = a * xPoint * xPoint
      const bx = bCoeff * xPoint

      detailCalcul = `$\\begin{aligned}    
      f(${xPoint})&=${a}\\times ${ecritureParentheseSiNegatif(xPoint)}^2${bCoeff === 0 ? `` : `${ecritureAlgebrique(bCoeff)}\\times ${ecritureParentheseSiNegatif(xPoint)}`}${ecritureAlgebrique(cCoeff)}\\\\
     &=${ax2}${bCoeff === 0 ? `` : `${ecritureAlgebrique(bx)}`}${cCoeff}\\\\
     &=${texNombre(imageCalcul)}
     \\end{aligned}$`

      if (position === 0) {
        yPoint = imageCalcul
      } else if (position === 1) {
        yPoint = imageCalcul + randint(1, 5)
      } else {
        yPoint = imageCalcul - randint(1, 5)
      }
    }

    this.enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par ${fonctionTex}.<br>
    On note $(C)$ sa courbe représentative dans un repère du plan.<br>
    On considère le point $A$ de coordonnées $(${xPoint}\\,;\\,${yPoint})$.<br><br>
    ${this.sup3 || context.isAmc ? (this.interactif ? 'La position du point $A$ par rapport à la courbe $(C)$ est donnée par l’affirmation suivante :' : 'Quelle est la position du point $A$ par rapport à la courbe $(C)$ ?') : 'Le point $A$ est-il sur la courbe $(C)$, en dessous ou au-dessus ?'}`

    // Correction détaillée
    this.correction = `On calcule l'image de $${xPoint}$ par la fonction $f$ :<br>
    ${detailCalcul}<br>
    L'ordonnée du point de $(C)$ d'abscisse $${xPoint}$ est $${texNombre(imageCalcul)}$.<br>`

    if (position === 0) {
      this.correction += `L'ordonnée du point de $(C)$ d'abscisse $${xPoint}$ est égale à l'ordonnée de $A$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ appartient à la courbe $${miseEnEvidence('(C)')}$`)}.`
      this.reponses = [
        `Le point $A$ appartient à la courbe $(C)$`,
        `Le point $A$ est situé au-dessus de la courbe $(C)$`,
        `Le point $A$ est situé en dessous de la courbe $(C)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la courbe $(C)$`,
      ]
    } else if (position === 1) {
      this.correction += `On a $${yPoint}>${texNombre(imageCalcul)}$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ est situé au-dessus de la courbe $${miseEnEvidence('(C)')}$`)}.`
      this.reponses = [
        `Le point $A$ est situé au-dessus de la courbe $(C)$`,
        `Le point $A$ appartient à la courbe $(C)$`,
        `Le point $A$ est situé en dessous de la courbe $(C)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la courbe $(C)$`,
      ]
    } else {
      this.correction += `On a $${yPoint}<${texNombre(imageCalcul)}$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ est situé en dessous de la courbe $${miseEnEvidence('(C)')}$`)}.`
      this.reponses = [
        `Le point $A$ est situé en dessous de la courbe $(C)$`,
        `Le point $A$ appartient à la courbe $(C)$`,
        `Le point $A$ est situé au-dessus de la courbe $(C)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la courbe $(C)$`,
      ]
    }
    this.correctionsDetaillees.set(this.enonce, this.correction)
  }

  versionOriginale: () => void = () => {
    // Fonction affine f(x) = (1/3)x + 2, multiplicateur 12, au-dessus
    this.appliquerLesValeurs('affine', 1, 3, 2, 12, 1)
  }

  versionAleatoire: () => void = () => {
    const typeFonction = choice(['affine', 'trinome']) as 'affine' | 'trinome'
    const position = randint(0, 2)

    if (typeFonction === 'affine') {
      // Fonction affine avec coefficient fractionnaire
      const listeFractions = [
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 5],
        [-1, 2],
        [-1, 3],
        [-2, 3],
        [-1, 5],
        [-2, 5],
        [-1, 6],
        [1, 6],
      ]
      const frac = choice(listeFractions)
      const ordOrigine = randint(-5, 5, 0)
      const multiplicateur = randint(10, 19) * choice([-1, 1])

      this.appliquerLesValeurs(
        'affine',
        frac[0],
        frac[1],
        ordOrigine,
        multiplicateur,
        position,
      )
    } else {
      // Trinôme
      const a = randint(-3, 3, [-1, 0, 1])
      const b = randint(-5, 5)
      const c = randint(-5, 5, 0)
      const multiplicateur = 0 // Non utilisé pour trinôme

      this.appliquerLesValeurs(
        'trinome',
        a,
        1,
        0,
        multiplicateur,
        position,
        b,
        c,
      )
    }
  }

  nouvelleVersion() {
    this.correctionsDetaillees.clear()
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const bonneReponse =
        this.autoCorrection[i].propositions?.find((p) => p.statut)?.texte ?? ''
      const reponse = bonneReponse.includes('appartient')
        ? 'sur'
        : bonneReponse.includes('au-dessus')
          ? 'au-dessus'
          : 'en dessous'
      this.listeCorrections[i] = this.correctionsDetaillees.get(enonce) ?? ''
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            'Le point $A$ est-il sur la courbe $(C)$, en dessous ou au-dessus ?',
            `Le point $A$ ${choixDeroulant(this, i, {
              choices: [
                { label: 'Choisir', value: '' },
                { label: 'appartient à', value: 'sur' },
                { label: 'est au-dessus de', value: 'au-dessus' },
                { label: 'est en dessous de', value: 'en dessous' },
              ],
            })} la courbe $(C)$.`,
          )
        : enonce
      handleAnswers(
        this,
        i,
        { reponse: { value: reponse, options: { texteSansCasse: true } } },
        { formatInteractif: 'liste-deroulante' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.versionAleatoire()
  }
}
