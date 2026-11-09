import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { tracePointSurDroite } from '../../lib/2d/TracePointSurDroite'
import { rotation } from '../../lib/2d/transformations'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '01875'
export const titre = "Donner une mesure d'angle à l'aide de la bissectrice"
export const interactifReady = true

export const dateDePublication = '27/08/2025'
export const dateDeModifImportante = '05/12/2025'

export const refs = {
  'fr-fr': ['6G5A'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2D-6', '9R2ES2D-6', '9R3ES2D-6'],
}

/**
 * @author Jean-claude Lhote
 */
export default class QuestionBissectrice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1

    this.besoinFormulaireTexte = [
      'types de questions',
      'Nombres séparés par des tirets :\n1 : Utilisation directe\n2 : Utilisation indirecte\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Multiples de 10\n2 : Nombres pairs\n3 : Nombres quelconques\n4 : Mélange',
    ]
    this.besoinFormulaire4CaseACocher = ['Avec figure', false]
    this.sup = '3'
    this.sup2 = '4'
    this.sup3 = false
    this.sup4 = false
  }

  nouvelleVersion(): void {
    const typesQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
    }).map(Number)
    const niveauxDifficulte = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)
    const avecFigure = this.sup4
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      let texte = ''
      let texteCorr = ''
      let alpha = 0
      const angleMax = 90
      const angleMin = 20
      if (niveauxDifficulte[i] === 1) {
        alpha = 10 * (2 + Math.floor(((angleMax - 20) / 20) * Math.random()))
      } else if (niveauxDifficulte[i] === 2) {
        alpha = 2 * (5 + Math.floor(((angleMax - 10) / 2) * Math.random()))
      } else if (niveauxDifficulte[i] === 3) {
        alpha = angleMin + Math.floor((angleMax - angleMin) * Math.random())
      }
      const alpha2 = 2 * alpha
      const lettres = choisitLettresDifferentes(4)
      const A = lettres[0]
      const B = lettres[1]
      const C = lettres[2]
      const I = lettres[3]
      if (typesQuestions[i] === 1) {
        if (avecFigure) {
          const pointA = pointAbstrait(5, 0, A, 'below')
          const pointB = pointAbstrait(0, 0, B, 'below left')
          const pointC = rotation(pointA, pointB, alpha2, C, 'above left')
          const dd1 = demiDroite(pointB, pointA)
          const d1 = droite(pointB, pointA)
          const d2 = droite(pointB, pointC)
          const dd2 = demiDroite(pointB, pointC)
          const labels = labelPoint(pointA, pointB, pointC)
          const trace1 = tracePointSurDroite(pointA, d1)
          const trace2 = tracePointSurDroite(pointC, d2)
          const mesureAngle = afficheMesureAngle(pointA, pointB, pointC)
          const objets = [dd1, dd2, labels, trace1, trace2, mesureAngle]
          texte += mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
          texte += '<br>'
        }
        texte +=
          `Donner la mesure de l'angle $\\widehat{${A}${B}${I}}$ sachant que :<br>
        ${createList({
          items: [
            `la demi-droite $\\left[${B}${I}\\right)$ est la bissectrice de l'angle $\\widehat{${A}${B}${C}}$,`,
            `$\\widehat{${A}${B}${C}}$ mesure $${alpha2}^\\circ$.`,
          ],
          style: 'fleches',
        })}` +
          ajouteChampTexteMathLive(this, i, KeyboardType.nombresEtDegre, {
            texteAvant: `$\\widehat{${A}${B}${I}}=$`,
            texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
          })
        handleAnswers(this, i, {
          reponse: { value: `${alpha}^\\circ`, options: { unite: true } },
        })
        texteCorr = `La demi-droite $\\left[${B}${I}\\right)$ est la bissectrice de l'angle $\\widehat{${A}${B}${C}}$.<br>
        Par définition de la bissectrice, elle partage cet angle en deux angles de même mesure.<br>
        Donc : $\\widehat{${A}${B}${I}} = \\dfrac{${alpha2}^\\circ}{2} = ${miseEnEvidence(`${alpha}^\\circ`)}$.`
      } else {
        if (avecFigure) {
          const pointA = pointAbstrait(5, 0, A, 'below')
          const pointB = pointAbstrait(0, 0, B, 'below left')
          const pointI = rotation(pointA, pointB, alpha, I, 'above')
          const dd1 = demiDroite(pointB, pointA)
          const d1 = droite(pointB, pointA)
          const d3 = droite(pointB, pointI)
          const dd3 = demiDroite(pointB, pointI)
          const labels = labelPoint(pointA, pointB, pointI)
          const trace1 = tracePointSurDroite(pointA, d1)
          const trace2 = tracePointSurDroite(pointI, d3)
          const mesureAngle = afficheMesureAngle(pointA, pointB, pointI)
          const objets = [dd1, dd3, labels, trace1, trace2, mesureAngle]
          texte += mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
          texte += '<br>'
        }
        texte +=
          `Donner la mesure de l'angle $\\widehat{${A}${B}${C}}$ sachant que :<br>
        ${createList({
          items: [
            `la demi-droite $\\left[${B}${I}\\right)$ est la bissectrice de l'angle $\\widehat{${A}${B}${C}}$,`,
            `$\\widehat{${A}${B}${I}}$ mesure $${alpha}^\\circ$.`,
          ],
          style: 'fleches',
        })}` +
          ajouteChampTexteMathLive(this, i, KeyboardType.nombresEtDegre, {
            texteAvant: `$\\widehat{${A}${B}${C}}=$`,
            texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
          })
        handleAnswers(this, i, {
          reponse: { value: `${alpha2}^\\circ`, options: { unite: true } },
        })
        texteCorr = `La demi-droite $\\left[${B}${I}\\right)$ est la bissectrice de l'angle $\\widehat{${A}${B}${C}}$.<br>
        Par définition de la bissectrice, elle partage cet angle en deux angles de même mesure.<br>
        Donc : $\\widehat{${A}${B}${C}} = 2 \\times ${alpha}^\\circ = ${miseEnEvidence(`${alpha2}^\\circ`)}$.`
      }
      if (this.questionJamaisPosee(i, alpha)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
