import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { ppcm } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des calculs complexes avec des fractions'
export const dateDePublication = '15/08/2026'
export const interactifReady = true

export const uuid = '1fc02'

export const refs = {
  'fr-fr': ['2N32-2'],
  'fr-ch': [],
}

type Operation = '+' | '-'

function etapesSommeOuDifference(
  fraction1: FractionEtendue,
  fraction2: FractionEtendue,
  operation: Operation,
): string[] {
  const f1 = fraction1.simplifie()
  const f2 = fraction2.simplifie()
  const denominateurCommun = ppcm(f1.den, f2.den)
  const f1Reduite = f1.reduire(denominateurCommun / f1.den)
  const f2Reduite = f2.reduire(denominateurCommun / f2.den)
  const numerateurResultat =
    operation === '+'
      ? f1Reduite.num + f2Reduite.num
      : f1Reduite.num - f2Reduite.num
  const resultat = new FractionEtendue(numerateurResultat, denominateurCommun)

  return [
    `${f1Reduite.texFSD}${operation}${f2Reduite.texFSD}&\\text{On met au même dénominateur.}`,
    `\\dfrac{${f1Reduite.num}${operation}${f2Reduite.num}}{${denominateurCommun}}&\\text{On calcule la somme ou la différence des numérateurs.}`,
    ...(resultat.estIrreductible ? [] : [resultat.texFSD]),
  ]
}

export default class CalculsComplexesFractions extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Calculer et donner le résultat sous la forme d’une fraction irréductible.'
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 1
    this.spacingCorr = 2
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de calculs',
      4,
      `1 : Somme avec priorité opératoire
2 : Quotient de sommes
3 : Somme de produits
4 : Mélange`,
    ]
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    const types = combinaisonListes(
      this.sup === 4 ? [1, 2, 3] : [this.sup],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i]
      const operation: Operation = randint(0, 1) === 0 ? '-' : '+'
      const operation2: Operation = randint(0, 1) === 0 ? '-' : '+'
      const b = randint(2, 9)
      const a = randint(1, b - 1)
      const c = randint(type === 3 ? 2 : 1, 6)
      const e = randint(2, 9)
      const d = randint(1, e - 1)
      const f = randint(type === 3 ? 2 : 1, 6)
      const fractionA = new FractionEtendue(a, b)
      let reponse: FractionEtendue
      let expression = ''
      let expressionCorrection = ''
      let commentairePremiereEtape = ''
      let etapes: string[] = []

      switch (type) {
        case 1: {
          const fractionC = new FractionEtendue(c, b)
          const fractionE = new FractionEtendue(e, f)
          const produit = fractionC.produitFraction(fractionE)
          reponse =
            operation === '+'
              ? fractionA.sommeFraction(produit)
              : fractionA.differenceFraction(produit)
          expression = `${fractionA.texFraction}${operation}${fractionC.texFraction}\\times${fractionE.texFraction}`
          expressionCorrection = `${fractionA.texFraction}${operation}${miseEnEvidence(`${fractionC.texFraction}\\times${fractionE.texFraction}`, 'red')}`
          commentairePremiereEtape = `&\\text{On repère la priorité de la multiplication sur ${operation === '+' ? 'l’addition' : 'la soustraction'}.}`
          etapes = [
            `${fractionA.texFraction}${operation}\\dfrac{${fractionC.num}\\times${fractionE.num}}{${fractionC.den}\\times${fractionE.den}}&\\text{On multiplie les numérateurs entre eux et les dénominateurs entre eux.}`,
            `${fractionA.texFraction}${operation}${produit.texFSD}&\\text{On calcule le produit.}`,
            ...(produit.estIrreductible
              ? []
              : [
                  `${fractionA.texFraction}${operation}${produit.simplifie().texFSD}&\\text{On simplifie le produit.}`,
                ]),
            ...etapesSommeOuDifference(
              fractionA,
              produit.simplifie(),
              operation,
            ),
          ]
          break
        }
        case 2: {
          const fractionD = new FractionEtendue(d, e)
          const numerateur =
            operation === '+'
              ? fractionA.ajouteEntier(c)
              : fractionA.ajouteEntier(-c)
          const denominateur =
            operation2 === '+'
              ? fractionD.ajouteEntier(f)
              : fractionD.ajouteEntier(-f)
          reponse = numerateur.diviseFraction(denominateur)
          expression = `\\dfrac{${fractionA.texFraction}${operation}${c}}{${fractionD.texFraction}${operation2}${f}}`
          const entierC = new FractionEtendue(c * b, b)
          const entierF = new FractionEtendue(f * e, e)
          etapes = [
            `\\dfrac{${fractionA.texFraction}${operation}${entierC.texFSD}}{${fractionD.texFraction}${operation2}${entierF.texFSD}}&\\text{On met au même dénominateur dans le numérateur et le dénominateur.}`,
            `\\dfrac{\\dfrac{${a}${operation}${c * b}}{${b}}}{\\dfrac{${d}${operation2}${f * e}}{${e}}}&\\text{On calcule les sommes ou les différences.}`,
            `\\dfrac{${numerateur.texFSD}}{${denominateur.texFSD}}`,
            `${numerateur.simplifie().texFSD}\\times${denominateur.inverse().texFSD}&\\text{Diviser par un réel non nul, c’est multiplier par son inverse.}`,
            ...(reponse.estIrreductible ? [] : [reponse.texFSD]),
          ]
          break
        }
        case 3:
        default: {
          const fractionD = new FractionEtendue(d, e)
          const produit1 = fractionA.multiplieEntier(c)
          const produit2 = fractionD.multiplieEntier(f)
          reponse =
            operation === '+'
              ? produit1.sommeFraction(produit2)
              : produit1.differenceFraction(produit2)
          expression = `${fractionA.texFraction}\\times${c}${operation}${fractionD.texFraction}\\times${f}`
          expressionCorrection = `${miseEnEvidence(`${fractionA.texFraction}\\times${c}`, 'red')}${operation}${miseEnEvidence(`${fractionD.texFraction}\\times${f}`, 'red')}`
          commentairePremiereEtape = `&\\text{On repère la priorité des multiplications sur ${operation === '+' ? 'l’addition' : 'la soustraction'}.}`
          etapes = [
            `${produit1.simplifie().texFSD}${operation}${produit2.simplifie().texFSD}&\\text{On effectue les multiplications en priorité.}`,
            ...etapesSommeOuDifference(
              produit1.simplifie(),
              produit2.simplifie(),
              operation,
            ),
          ]
          break
        }
      }

      if (
        this.questionJamaisPosee(
          i,
          type,
          operation,
          operation2,
          a,
          b,
          c,
          d,
          e,
          f,
        )
      ) {
        const nom = lettreDepuisChiffre(i + 1)
        let texte = `$${nom}=${expression}$`
        const resultat = reponse.simplifie()
        const texteCorr =
          `$\\begin{aligned}${nom}&=${expressionCorrection || expression}${commentairePremiereEtape}\\\\` +
          etapes.map((etape) => `&=${etape}\\\\`).join('') +
          `&=${miseEnEvidence(resultat.texFSD)}\\end{aligned}$`

        handleAnswers(this, i, {
          reponse: {
            value: resultat.texFSD,
            options: { fractionIrreductible: true },
          },
        })
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${nom} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup2),
        })

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
