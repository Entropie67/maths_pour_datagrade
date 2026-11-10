import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { range } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Placer une fraction sur une droite graduée à partir d'une fraction unitaire"

export const dateDePublication = '11/11/2025'

/**
 * @author Guillaume Valmont
 */
export const uuid = 'ab11c'

export const refs = {
  'fr-fr': ['6M1autoD-1'],
  'fr-2016': [],
  'fr-ch': ['9R1NO4B-11', '9R2NO4B-11', '9R3NO4B-11', 'PRQNO04B-11'],
}
export default class sensDesPrefixes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Mélange\n2 : Fractions < 1\n3 : Fractions > 1',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 2,
      max: 3,
      melange: 1,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const fractionInf1Uniquement = listeTypeDeQuestions.every((t) => t === 2)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const maxUnit = 3
      const fractionSup1 = listeTypeDeQuestions[i] === 3
      const den = randint(3, 6)
      const num = fractionSup1
        ? randint(den + 1, den * maxUnit - 1, [den * 2])
        : randint(2, den - 1)
      const fraction = new FractionEtendue(num, den)
      const fractionUnitaire = new FractionEtendue(1, den)
      const paramsDroite: ParamsDroite = {
        Min: 0,
        Max: fractionInf1Uniquement ? 1 : maxUnit,
        Unite: fractionInf1Uniquement ? 12 : 5,
        axeEpaisseur: 0.5,
        labelsPrincipaux: true,
        labelListe: [
          [fractionUnitaire.toNumber(), fractionUnitaire.texFraction],
        ],
        labelCustomDistance: 1,
        labelDistance: 1,
        pointListe: [[fractionUnitaire.toNumber(), '']],
        pointCouleur: 'black',
        pointStyle: '|',
        pointTaille: 3,
        labelListeScriptsize: true,
      }
      const droiteEnonce = droiteGraduee(paramsDroite)
      const droiteCorrection = droiteGraduee(
        Object.assign({}, paramsDroite, {
          pointListe: [
            ...range(num - 1).map((k) => [
              fractionUnitaire.toNumber() * (k + 1),
              '',
            ]),
          ],
          labelListe: [
            [fractionUnitaire.toNumber(), fractionUnitaire.texFraction],
            [fraction.toNumber(), fraction.texFraction],
          ],
        }),
      )
      const droiteCorrectionOpti = droiteGraduee(
        Object.assign({}, paramsDroite, {
          pointListe: [
            ...range((num % den) - 1).map((k) => [
              fractionUnitaire.toNumber() * (k + 1) + Math.floor(num / den),
              '',
            ]),
            [fractionUnitaire.toNumber(), ''],
          ],
          labelListe: [
            [fractionUnitaire.toNumber(), fractionUnitaire.texFraction],
            [fraction.toNumber(), fraction.texFraction],
          ],
        }),
      )
      let texte = `Placer la fraction $${fraction.texFraction}$ en s'aidant de la fraction unitaire $${fractionUnitaire.texFraction}$ déjà placée sur la droite graduée ci-dessous.<br>`
      texte += mathalea2d(
        Object.assign({}, fixeBordures([droiteEnonce])),
        droiteEnonce,
      )
      let texteCorr = `$${fraction.texFraction} = ${num} \\times ${fractionUnitaire.texFraction}$ donc
pour placer $${fraction.texFraction}$ il faut reporter $${num}$ fois la distance entre $0$ et $${fractionUnitaire.texFraction}$.<br>
On peut utiliser le compas pour reporter cette distance $${num}$ fois sur la droite graduée.<br>`
      texteCorr += mathalea2d(
        Object.assign({}, fixeBordures([droiteCorrection])),
        droiteCorrection,
      )
      if (fractionSup1) {
        texteCorr += `<br><br>On peut aussi remarquer que $${fraction.texFraction} = ${Math.floor(fraction.toNumber())} + \\dfrac{${num % den}}{${den}}$.<br>
Il suffit donc de reporter $${num % den}$ fois la distance entre $0$ et $${fractionUnitaire.texFraction}$ à partir de $${Math.floor(fraction.toNumber())}$.<br>`
        texteCorr += mathalea2d(
          Object.assign({}, fixeBordures([droiteCorrectionOpti])),
          droiteCorrectionOpti,
        )
      }
      if (this.questionJamaisPosee(i, num, den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

type ParamsDroite = {
  Min: number
  Max: number
  Unite: number
  axeEpaisseur: number
  labelsPrincipaux: boolean
  labelListe: [number, string][]
  labelCustomDistance: number
  labelDistance: number
  pointListe: [number, string][]
  pointCouleur: string
  pointStyle: string
  labelListeScriptsize: boolean
  pointTaille: number
}
