import { sameComparisonSign, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux nombres réels en calculant leur différence'
export const dateDePublication = '16/07/2026'
export const interactifReady = true

export const uuid = '2b00b'

export const refs = {
  'fr-fr': ['2N14-3'],
  'fr-ch': [],
}

type TypeQuestion = 'racineCarree' | 'pi' | 'variable'

function termeAvecX(coefficient: number, x: string): string {
  return `${rienSi1(coefficient)}${x}`
}

/**
 * Comparer deux nombres de la forme a/(b+cX)
 * en étudiant le signe de leur différence.
 * @author Stéphane Guyon
 */
export default class ComparerDeuxQuotientsAvecIrrationnel extends Exercice {
  constructor() {
    super()
    this.tip = `
      <p style="margin: 0;">
        Pour comparer deux nombres $A$ et $B$, on peut calculer leur différence $A-B$ et étudier son signe.
      </p>
    `
    this.nbQuestions = 3
    this.nbCols = 1
    this.nbColsCorr = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Racine carrée\n2 : Pi\n3 : Variable encadrée\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Comparer les deux nombres réels suivants en justifiant la réponse.'
        : 'Comparer les deux nombres réels de chaque question en justifiant les réponses.'

    const typesDisponibles: TypeQuestion[] =
      this.sup === 1
        ? ['racineCarree']
        : this.sup === 2
          ? ['pi']
          : this.sup === 3
            ? ['variable']
            : ['racineCarree', 'pi', 'variable']
    const typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )
    const sensDesComparaisons = combinaisonListes(
      ['inferieur', 'superieur'],
      this.nbQuestions,
    )
    const valeursDeC = combinaisonListes(
      [3, 5, 7, 11, 13, 15],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeQuestion = typesDeQuestions[i]
      const sensComparaison = sensDesComparaisons[i]
      let k = 0
      let x = ''
      let precisionEnonce = ''
      let justificationSigne = ''
      let donneeCaracteristique = 0

      if (typeQuestion === 'racineCarree') {
        const c = valeursDeC[i]
        const entierInferieur = Math.floor(Math.sqrt(c))
        k =
          sensComparaison === 'inferieur'
            ? entierInferieur
            : entierInferieur + 1
        const carreDeK = k ** 2
        x = `\\sqrt{${c}}`
        donneeCaracteristique = c
        justificationSigne =
          carreDeK < c
            ? `Comme $${k}=\\sqrt{${carreDeK}}$ et $\\sqrt{${carreDeK}} < \\sqrt{${c}}$, on a $${k}-${x} < 0$.`
            : `Comme $${k}=\\sqrt{${carreDeK}}$ et $\\sqrt{${carreDeK}} > \\sqrt{${c}}$, on a $${k}-${x} > 0$.`
      } else if (typeQuestion === 'pi') {
        k =
          sensComparaison === 'inferieur'
            ? choice([1, 2, 3])
            : choice([4, 5, 6])
        x = '\\pi'
        donneeCaracteristique = k
        const comparaisonAvecPi =
          k < 3
            ? `${k} < 3 < \\pi`
            : k === 3
              ? '3 < \\pi'
              : k === 4
                ? '\\pi < 4'
                : `\\pi < 4 < ${k}`
        justificationSigne = `Comme $3 < \\pi < 4$, on a $${comparaisonAvecPi}$, donc $${k}-${x} ${k <= 3 ? '<' : '>'} 0$.`
      } else {
        const borneInferieure = randint(1, 8)
        k =
          sensComparaison === 'inferieur'
            ? borneInferieure
            : borneInferieure + 1
        x = 'n'
        donneeCaracteristique = borneInferieure
        precisionEnonce = `, où $n$ est un nombre réel tel que $${borneInferieure} < n < ${borneInferieure + 1}$`
        justificationSigne = `Comme $${borneInferieure} < n < ${borneInferieure + 1}$, on a $${k}-n ${k === borneInferieure ? '<' : '>'} 0$.`
      }

      const structures = [
        { numerateurA: 2, numerateurB: 3, coefficientA: 1, coefficientB: 1 },
        { numerateurA: 3, numerateurB: 2, coefficientA: 2, coefficientB: 1 },
        { numerateurA: 3, numerateurB: 4, coefficientA: 1, coefficientB: 1 },
        { numerateurA: 4, numerateurB: 3, coefficientA: 3, coefficientB: 2 },
        { numerateurA: 5, numerateurB: 3, coefficientA: 2, coefficientB: 1 },
        { numerateurA: 3, numerateurB: 5, coefficientA: 2, coefficientB: 3 },
      ]
      const constructionsPossibles = structures.flatMap((structure) =>
        Array.from({ length: 10 }, (_, indice) => indice + 1)
          .map((constanteA) => {
            const numerateurConstanteB = k + structure.numerateurB * constanteA
            if (numerateurConstanteB % structure.numerateurA !== 0) {
              return null
            }
            const constanteB = numerateurConstanteB / structure.numerateurA
            if (
              pgcd(
                structure.numerateurA,
                constanteA,
                structure.coefficientA,
              ) !== 1 ||
              pgcd(
                structure.numerateurB,
                constanteB,
                structure.coefficientB,
              ) !== 1
            ) {
              return null
            }
            return { ...structure, constanteA, constanteB }
          })
          .filter((construction) => construction !== null),
      )
      const {
        numerateurA,
        numerateurB,
        coefficientA,
        coefficientB,
        constanteA,
        constanteB,
      } = choice(constructionsPossibles)
      const reponse: '<' | '>' = sensComparaison === 'inferieur' ? '<' : '>'
      const denominateurA = `${constanteA}+${termeAvecX(coefficientA, x)}`
      const denominateurB = `${constanteB}+${termeAvecX(coefficientB, x)}`

      let texte = `On pose $A=\\dfrac{${numerateurA}}{${denominateurA}}$ et $B=\\dfrac{${numerateurB}}{${denominateurB}}$${precisionEnonce}.<br>`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierCompare,
          {
            texteAvant: '$A$',
            texteApres: '$B$',
          },
        )
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([sameComparisonSign()]),
        },
      })

      const texteCorr = `On calcule la différence $A-B$ :<br>
      $\\begin{aligned}
      A-B
      &=\\dfrac{${numerateurA}}{${denominateurA}}
      -\\dfrac{${numerateurB}}{${denominateurB}}\\\\
      &=\\dfrac{${numerateurA}\\left(${denominateurB}\\right)
      -${numerateurB}\\left(${denominateurA}\\right)}
      {\\left(${denominateurA}\\right)\\left(${denominateurB}\\right)}\\\\
      &=\\dfrac{${numerateurA * constanteB}
      +${termeAvecX(numerateurA * coefficientB, x)}
      -${numerateurB * constanteA}
      -${termeAvecX(numerateurB * coefficientA, x)}}
      {\\left(${denominateurA}\\right)\\left(${denominateurB}\\right)}\\\\
      &=\\dfrac{${k}-${x}}
      {\\left(${denominateurA}\\right)\\left(${denominateurB}\\right)}.
      \\end{aligned}$<br>
      Les deux facteurs du dénominateur sont positifs, donc leur produit est positif. Le signe de $A-B$ est ainsi celui de $${k}-${x}$.<br>
      ${justificationSigne}<br>
      Par conséquent, $A ${miseEnEvidence(reponse)} B$.`

      if (
        this.questionJamaisPosee(
          i,
          typeQuestion,
          numerateurA,
          numerateurB,
          constanteA,
          constanteB,
          coefficientB,
          k,
          donneeCaracteristique,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
