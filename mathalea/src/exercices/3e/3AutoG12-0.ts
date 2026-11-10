import type { MathfieldElement } from 'mathlive'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer une distance avec le théorème de Thalès'

export const interactifReady = true

export const dateDePublication = '25/12/2025'

export const uuid = '7ab98'

export const refs = {
  'fr-fr': ['3AutoG12-0'],
  'fr-ch': [],
}
/**
 * @author Jean-Claude Lhote
 */
export default class AutoTheoremeThales extends ExerciceSimple {
  constructor() {
    super()
    this.spacingCorr = 2
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = KeyboardType.alphanumeric
    this.formatInteractif = 'meta-custom'
  }

  nouvelleVersion() {
    const rapport = this.sup ? 1.5 : choice([1.5, 1.7, 1.8, 1.9, 2.1])
    const longueurBD = this.sup ? 3 : choice([4, 6, 8, 10, 12])
    const longueurDE = longueurBD + 1
    const longueurBE = longueurDE + 0.5
    const longueurAC = longueurDE * rapport

    const nomTriangle = this.sup ? 'ABC' : choisitLettresDifferentes(3).join('')
    const nomPara2 = this.sup
      ? 'DE'
      : choisitLettresDifferentes(2, nomTriangle).join('')
    const nomPara1 = `${nomTriangle[0]}${nomTriangle[2]}`

    const A = pointAbstrait(0, 0, nomTriangle[0], 'below left')
    const B = pointAbstrait(0.2, 4.5, nomTriangle[1], 'above left')
    const C = pointAbstrait(5, 1, nomTriangle[2], 'right')
    const D = homothetie(
      A,
      B,
      1 / rapport,
      this.sup ? 'D' : nomPara2[0],
      'left',
    )
    const E = homothetie(
      C,
      B,
      1 / rapport,
      this.sup ? 'E' : nomPara2[1],
      'right',
    )
    const triangleBDE = polygone(B, D, E)
    triangleBDE.epaisseur = 3
    const triangleBAC = polygone(B, A, C)
    triangleBAC.epaisseur = 1.5
    const coteAC = segment(A, C)
    coteAC.epaisseur = 3
    const labels = labelPoint(A, D, E, B, C)
    const afficheBD = placeLatexSurSegment(texNombre(longueurBD, 0), D, B, {
      horizontal: true,
      distance: 0.4,
      letterSize: 'small',
    })
    const afficheDE = placeLatexSurSegment(texNombre(longueurDE, 1), E, D, {
      horizontal: true,
      distance: 0.3,
      letterSize: 'small',
    })
    const afficheBE = placeLatexSurSegment(texNombre(longueurBE, 1), B, E, {
      horizontal: true,
      distance: 0.5,
      letterSize: 'small',
    })
    const afficheAC = placeLatexSurSegment(texNombre(longueurAC, 1), C, A, {
      horizontal: true,
      distance: 0.3,
      letterSize: 'small',
    })

    const objets = [
      triangleBAC,
      triangleBDE,
      coteAC,
      labels,
      afficheDE,
      afficheBE,
      afficheBD,
      afficheAC,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30 }, fixeBordures(objets)),
      objets,
    )

    this.reponse = {
      champ1: { value: [nomTriangle[0], nomTriangle[1]].join('') },
      champ2: { value: [[nomTriangle[1], D.nom].join(''), String(longueurBD)] },
      champ3: {
        value: [[nomTriangle[0], nomTriangle[2]].join(''), String(longueurAC)],
      },
      champ4: { value: [D.nom + E.nom, String(longueurDE)] },
    }
    if (context.isHtml) {
      this.consigne = // this.consigne n'admet pas de figure en LaTeX
        figure +
        `Sur la figure ci-dessus, les droites $(${nomPara1})$ et $(${nomPara2})$ sont parallèles.<br><br>
      Écrire une égalité de rapports permettant de déterminer la longueur $${nomTriangle.slice(0, 2)}$.<br>`
      this.question =
        '\\dfrac{%{champ1}}{%{champ2}} = \\dfrac{%{champ3}}{%{champ4}}'
      this.canEnonce = this.consigne
    } else {
      this.question =
        figure +
        `Sur la figure ci-dessus, les droites $(${nomPara1})$ et $(${nomPara2})$ sont parallèles.<br><br>
      Écrire une égalité de rapports permettant de déterminer la longueur$${nomTriangle.slice(0, 2)}$.<br>`
      this.question += '$\\dfrac{\\ldots}{\\ldots} = \\dfrac{\\ldots}{\\ldots}$'
      this.canEnonce = this.question
    }
    this.correction = `Pour déterminer la longueur $${nomTriangle.slice(0, 2)}$, on utilise le théorème de Thalès qui s'applique ici car les droites $(${nomPara1})$ et $(${nomPara2})$ sont parallèles.<br>
On écrit l'égalité des rapports :<br>
$\\dfrac{${miseEnEvidence(
      [nomTriangle[0], nomTriangle[1]].join(''),
    )}}{${miseEnEvidence([D.nom, B.nom].join(''))}}= \\dfrac{${miseEnEvidence(
      [nomTriangle[0], nomTriangle[2]].join(''),
    )}}{${miseEnEvidence([D.nom, E.nom].join(''))}}$ ou encore avec les valeurs numériques :
$\\dfrac{${miseEnEvidence(
      [nomTriangle[0], nomTriangle[1]].join(''),
    )}}{${miseEnEvidence(longueurBD)}} = \\dfrac{${miseEnEvidence(
      texNombre(longueurAC, 1),
    )}}{${miseEnEvidence(longueurDE)}}$`
  }

  correctionInteractive(i: number): string | string[] {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    let result = 'KO'
    const mf = document.querySelector(
      `#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()
    const resultatCheck = document.querySelector(
      `span#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const champ1 = mf.getPromptValue('champ1')
    const champ2 = mf.getPromptValue('champ2')
    const champ3 = mf.getPromptValue('champ3')
    const champ4 = mf.getPromptValue('champ4')
    const goodAnswer = this.reponse as {
      champ1: { value: string }
      champ2: { value: [string, number] }
      champ3: { value: [string, number] }
      champ4: { value: [string, number] }
    }
    const num1 = goodAnswer.champ1.value // num1 est un string
    const den1 = goodAnswer.champ2.value // den1 est un [string, number]
    const num2 = goodAnswer.champ3.value // num2 est un [string, number]
    const den2 = goodAnswer.champ4.value // den2 est un [string, number]
    if (champ1 === num1 || champ1 === `${num1[1]}${num1[0]}`) {
      // champ1 contient 'AB'
      if (
        champ2 === den1[0] ||
        champ2 === den1[0][1] + den1[0][0] ||
        champ2.replace(',', '.') === den1[1].toString()
      ) {
        if (
          champ3 === num2[0] ||
          champ3 === num2[0][1] + num2[0][0] ||
          champ3.replace(',', '.') === num2[1].toString()
        ) {
          if (
            champ4 === den2[0] ||
            champ4 === den2[0][1] + den2[0][0] ||
            champ4.replace(',', '.') === den2[1].toString()
          ) {
            result = 'OK'
          } else result = 'KO'
        } else result = 'KO'
      } else result = 'KO'
    } else if (champ2 === num1 || champ2 === `${num1[1]}${num1[0]}`) {
      // champ2 contient 'AB' on va tester les rapports inverses
      if (
        champ1 === den1[0] ||
        champ1 === den1[0][1] + den1[0][0] ||
        champ1.replace(',', '.') === den1[1].toString()
      ) {
        if (
          champ4 === num2[0] ||
          champ4 === num2[0][1] + num2[0][0] ||
          champ4.replace(',', '.') === num2[1].toString()
        ) {
          if (
            champ3 === den2[0] ||
            champ3 === den2[0][1] + den2[0][0] ||
            champ3.replace(',', '.') === den2[1].toString()
          ) {
            result = 'OK'
          } else result = 'KO'
        } else result = 'KO'
      } else result = 'KO'
    } else if (champ3 === num1 || champ3 === `${num1[1]}${num1[0]}`) {
      // champ3 contient 'AB' on va tester l'égalité dans l'autre sens
      if (
        champ4 === den1[0] ||
        champ4 === den1[0][1] + den1[0][0] ||
        champ4.replace(',', '.') === den1[1].toString()
      ) {
        if (
          champ1 === num2[0] ||
          champ1 === num2[0][1] + num2[0][0] ||
          champ1.replace(',', '.') === num2[1].toString()
        ) {
          if (
            champ2 === den2[0] ||
            champ2 === den2[0][1] + den2[0][0] ||
            champ2.replace(',', '.') === den2[1].toString()
          ) {
            result = 'OK'
          } else result = 'KO'
        } else result = 'KO'
      } else result = 'KO'
    } else if (champ4 === num1 || champ4 === `${num1[1]}${num1[0]}`) {
      // champ4 contient 'AB' on va tester l'égalité dans l'autre sens avec les rapports inverses
      if (
        champ3 === den1[0] ||
        champ3 === den1[0][1] + den1[0][0] ||
        champ3.replace(',', '.') === den1[1].toString()
      ) {
        if (
          champ2 === num2[0] ||
          champ2 === num2[0][1] + num2[0][0] ||
          champ2.replace(',', '.') === num2[1].toString()
        ) {
          if (
            champ1 === den2[0] ||
            champ1 === den2[0][1] + den2[0][0] ||
            champ1.replace(',', '.') === den2[1].toString()
          ) {
            result = 'OK'
          } else result = 'KO'
        } else result = 'KO'
      } else result = 'KO'
    } else result = 'KO' // aucun champ ne contient 'AB'
    if (result === 'OK' && resultatCheck) resultatCheck.innerHTML = '😎'
    else if (resultatCheck) resultatCheck.innerHTML = '☹️'
    return result
  }
}
