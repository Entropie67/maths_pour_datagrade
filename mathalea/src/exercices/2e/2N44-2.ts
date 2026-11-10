import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { seq, stringEquals } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Classer des carrés et des cubes'
export const dateDePublication = '18/08/2026'
export const interactifReady = true

export const uuid = '9489b'

export const refs = {
  'fr-fr': ['2N44-2'],
  'fr-ch': ['NR'],
}

type Ecriture = 'decimal' | 'fraction'

type Base = {
  num: number
  den: number
  latex: string
  ecriture: Ecriture
}

type Expression = {
  base: Base
  exposant: 2 | 3
  lettre: string
  valeur: number
}

const formulaireTypes: FormulaireComplexe = {
  champs: [
    {
      type: 'liste',
      nom: 'types',
      label: 'Types de nombres',
      items: [
        { nom: 'decimal', label: 'Décimaux' },
        { nom: 'fraction', label: 'Fractions' },
        { nom: 'melange', label: 'Mélange' },
      ],
    },
  ],
}

const petitesFractions: ReadonlyArray<readonly [number, number]> = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 6],
  [5, 8],
]

const grandesFractions: ReadonlyArray<readonly [number, number]> = [
  [6, 5],
  [5, 4],
  [4, 3],
  [3, 2],
  [5, 3],
  [7, 4],
  [9, 5],
  [11, 6],
  [7, 3],
  [8, 3],
]

function valeur(base: Base): number {
  return base.num / base.den
}

function baseDecimale(inferieureAUn: boolean): Base {
  const num = choice(
    inferieureAUn
      ? [2, 3, 4, 5, 6, 7, 8, 9]
      : [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23],
  )
  return {
    num,
    den: 10,
    latex: (num / 10).toFixed(1).replace('.', '{,}'),
    ecriture: 'decimal',
  }
}

function baseFractionnaire(inferieureAUn: boolean): Base {
  const [num, den] = choice([
    ...(inferieureAUn ? petitesFractions : grandesFractions),
  ])
  return {
    num,
    den,
    latex: `\\dfrac{${num}}{${den}}`,
    ecriture: 'fraction',
  }
}

function creerBase(inferieureAUn: boolean, ecriture: Ecriture): Base {
  return ecriture === 'decimal'
    ? baseDecimale(inferieureAUn)
    : baseFractionnaire(inferieureAUn)
}

function puissanceLatex(base: Base, exposant: 2 | 3): string {
  const baseAffichee =
    base.ecriture === 'fraction' ? `\\left(${base.latex}\\right)` : base.latex
  return `${baseAffichee}^{${exposant}}`
}

function expressionLatex(expression: Expression): string {
  return puissanceLatex(expression.base, expression.exposant)
}

/**
 * Classer des carrés et des puissances trois à l'aide d'inégalités.
 *
 * @author Arnaud Meistermann
 */
export default class ClasserNombresFonctionsReference extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireComplexe = formulaireTypes
    this.sup = serialiseFormulaireComplexe(
      formulaireTypes,
      valeursParDefaut(formulaireTypes),
    )
  }

  nouvelleVersion() {
    const typesParQuestion = lireFormulaireComplexe(
      formulaireTypes,
      this.sup,
    ).repartition('types', this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeDeLaQuestion = typesParQuestion[i]
      const ecritures: [Ecriture, Ecriture] =
        typeDeLaQuestion === 'decimal'
          ? ['decimal', 'decimal']
          : typeDeLaQuestion === 'fraction'
            ? ['fraction', 'fraction']
            : (shuffle<Ecriture>(['decimal', 'fraction']) as [
                Ecriture,
                Ecriture,
              ])
      const petite = creerBase(true, ecritures[0])
      const grande = creerBase(false, ecritures[1])
      const expressionsSansLettre = [
        { base: petite, exposant: 2 as const },
        { base: petite, exposant: 3 as const },
        { base: grande, exposant: 2 as const },
        { base: grande, exposant: 3 as const },
      ]
      const expressions = shuffle(expressionsSansLettre).map(
        (expression, indice): Expression => ({
          ...expression,
          lettre: ['A', 'B', 'C', 'D'][indice],
          valeur: valeur(expression.base) ** expression.exposant,
        }),
      )
      const croissant = choice([true, false])
      const expressionsCroissantes = [...expressions].sort(
        (expression1, expression2) => expression1.valeur - expression2.valeur,
      )
      const classement = croissant
        ? expressionsCroissantes
        : [...expressionsCroissantes].reverse()
      const signe = croissant ? '<' : '>'
      const definitions = expressions
        .map(
          (expression) =>
            `$${expression.lettre}=${expressionLatex(expression)}$`,
        )
        .join(', ')
      let texte = `${definitions}.<br>Ranger $A$, $B$, $C$ et $D$ par ordre ${croissant ? 'croissant' : 'décroissant'}.<br>`

      if (this.interactif) {
        texte += addMultiMathfield(this, i, {
          dataTemplate: `%{champ1} $${signe}$ %{champ2} $${signe}$ %{champ3} $${signe}$ %{champ4}`,
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierDeBase },
            champ2: { keyboard: KeyboardType.clavierDeBase },
            champ3: { keyboard: KeyboardType.clavierDeBase },
            champ4: { keyboard: KeyboardType.clavierDeBase },
          },
        })
      }

      handleAnswers(
        this,
        i,
        Object.fromEntries(
          classement.map((expression, indice) => [
            `champ${indice + 1}`,
            {
              value: expression.lettre,
              compare: seq([
                stringEquals({
                  trim: true,
                  ignoreCase: true,
                  ignoreLatexText: true,
                  ignoreLatexDelimiters: true,
                }),
              ]),
            },
          ]),
        ),
        { formatInteractif: 'multi-mathfield' },
      )

      const petiteAuCube = expressions.find(
        (expression) => expression.base === petite && expression.exposant === 3,
      )!
      const petiteAuCarre = expressions.find(
        (expression) => expression.base === petite && expression.exposant === 2,
      )!
      const grandeAuCarre = expressions.find(
        (expression) => expression.base === grande && expression.exposant === 2,
      )!
      const grandeAuCube = expressions.find(
        (expression) => expression.base === grande && expression.exposant === 3,
      )!
      const petiteLatex = petite.latex
      const grandeLatex = grande.latex
      const petiteCarreLatex = puissanceLatex(petite, 2)
      const grandeCarreLatex = puissanceLatex(grande, 2)
      const classementFinal = classement
        .map((expression) => expression.lettre)
        .join(` ${signe} `)

      let correction = `Comme $${petiteLatex}>0$, si on multiplie une inégalité par $${petiteLatex}$, on ne change pas l'ordre.<br>`
      correction += `Or $${petiteLatex}<1$, donc $${petiteCarreLatex}<${petiteLatex}$ et $${expressionLatex(petiteAuCube)}<${petiteCarreLatex}$.<br>`
      correction += `On obtient donc $${expressionLatex(petiteAuCube)}<${petiteCarreLatex}<${petiteLatex}<1$.<br><br>`
      correction += `Comme $${grandeLatex}>0$, si on multiplie une inégalité par $${grandeLatex}$, on ne change pas l'ordre.<br>`
      correction += `Or $1<${grandeLatex}$, donc $${grandeLatex}<${grandeCarreLatex}$ et $${grandeCarreLatex}<${expressionLatex(grandeAuCube)}$.<br>`
      correction += `On obtient donc $1<${grandeLatex}<${grandeCarreLatex}<${expressionLatex(grandeAuCube)}$.<br><br>`
      correction += `Finalement, on a $${expressionLatex(petiteAuCube)}<${expressionLatex(petiteAuCarre)}<1<${expressionLatex(grandeAuCarre)}<${expressionLatex(grandeAuCube)}$.<br>`
      correction += `Le classement demandé est donc $${miseEnEvidence(classementFinal)}$.`

      if (
        this.questionJamaisPosee(
          i,
          ...expressions.map((e) => expressionLatex(e)),
          croissant ? 1 : 0,
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(correction)
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
