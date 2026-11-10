import Exercice from '../../exercices/Exercice'
import { listeQuestionsToContenu } from '../../modules/outils'
import {
  lireFormulaireComplexe,
  repartitionPonderee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../formulaireComplexe'
import { KeyboardType } from '../interactif/claviers/keyboard'
import { handleAnswers } from '../interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../interactif/questionMathLive'
import { shuffle } from '../outils/arrayOutils'
import {
  compositionStatement,
  type InnerFamily,
  type OuterFamily,
} from './deriveesComposees'
import { derivativeComparator } from './deriveesComposeesComparison'
import { latex } from './deriveesComposeesExpressions'
import {
  derivativeCorrection,
  functionTypes,
  generateDerivative,
  type DerivativeFamily,
  type FunctionType,
} from './deriveesFamilles'

/**
 * Base commune des exercices de dérivation : chaque sous-classe fournit son
 * formulaire. Sans champ `family`, tous les calculs sont des compositions ;
 * sinon le champ `functions` limite les types de fonctions qui apparaissent.
 * Chaque question vaut un point, quel que soit le tirage.
 */
export default class DeriveesExercice extends Exercice {
  constructor(private readonly formulaire: FormulaireComplexe) {
    super()
    this.nbQuestions = 3
    this.nbCols = 1
    this.nbColsCorr = 1
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  private repartition<T extends string>(
    params: ReturnType<typeof lireFormulaireComplexe>,
    nom: string,
  ): T[] {
    return repartitionPonderee(
      shuffle(params.liste(nom)),
      this.nbQuestions,
      shuffle(params.declares(nom)),
    ) as T[]
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(this.formulaire, this.sup)
    const hasFamily = this.formulaire.champs.some((c) => c.nom === 'family')
    const hasComposition = this.formulaire.champs.some((c) => c.nom === 'outer')
    // Les types cochés sont répétés selon leur poids ; aucun coché : tous les types.
    const weighted = hasFamily
      ? params
          .listeActive('functions')
          .flatMap((item) =>
            Array<FunctionType>(item.poids).fill(item.nom as FunctionType),
          )
      : []
    const types = weighted.length
      ? weighted
      : (Object.keys(functionTypes) as FunctionType[])
    const families = hasFamily
      ? this.repartition<DerivativeFamily>(params, 'family')
      : []
    const outers = hasComposition
      ? this.repartition<OuterFamily>(params, 'outer')
      : []
    const inners = hasComposition
      ? this.repartition<InnerFamily>(params, 'inner')
      : []
    for (let i = 0; i < this.nbQuestions; i++) {
      const family = hasFamily ? families[i] : 'composition'
      const draw = () =>
        generateDerivative(
          family,
          inners[i] === 'affine' ? 'affine' : 'nonAffine',
          outers[i] ?? 'power',
          inners[i] ?? 'polynomial',
          types,
        )
      let question = draw()
      // La borne évite de bloquer une longue série sur un choix restreint.
      for (let retry = 0; retry < 50; retry++) {
        if (this.questionJamaisPosee(i, latex(question.expression))) break
        question = draw()
      }
      let statement = compositionStatement(question)
      if (this.interactif)
        statement +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            { texteAvant: "$h'(x)=$" },
          )
      handleAnswers(this, i, {
        reponse: {
          value: latex(question.derived),
          compare: derivativeComparator(question),
        },
      })
      this.listeQuestions[i] = statement
      this.listeCorrections[i] = derivativeCorrection(question)
    }
    listeQuestionsToContenu(this)
  }
}
