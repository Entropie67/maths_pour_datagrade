import type { MathfieldElement } from 'mathlive'
import { evaluateArithmeticExpression } from '../../../lib/interactif/checks/evaluateArithmeticExpression'
import { normalizeLatexArithmetic } from '../../../lib/interactif/checks/latexArithmetic'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    expressionLineaire,
    printSystem,
    texMembreGauche,
    texSystemeEquations,
} from '../../../lib/outils/systemeEquations'
import { fraction } from '../../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Résoudre un système avec une infinité de solutions par substitution'
export const interactifReady = true
export const dateDePublication = '04/05/2026'
export const uuid = 'f3a91'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G95-17p'],
}

type Systeme = {
  coefficients: number[][]
  constantes: number[]
  nbEquations: 1 | 2
  variables: string[]
  kNul: boolean
}

const groupesVariables = [
  ['x', 'y', 'z'],
  ['u', 'v', 'w'],
  ['a', 'b', 'c'],
]

export default class SystemeInfinitesSolutionsSubstitution extends Exercice {
  private systemes: Systeme[] = []

  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 3
    this.sup2 = 3
    this.sup3 = 1
    this.exoCustomResultat = true
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      "Nombre d'équations",
      3,
      '1 : Une équation à deux inconnues\n2 : Deux équations à trois inconnues\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Second membre',
      3,
      '1 : k = 0\n2 : k non nul\n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Variables',
      4,
      '1 : x, y, z\n2 : u, v, w\n3 : a, b, c\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.systemes = []
    const choixNombreEquations: (1 | 2)[] =
      this.sup === 1 ? [1] : this.sup === 2 ? [2] : [1, 2]
    const choixSecondMembre: boolean[] =
      this.sup2 === 1 ? [true] : this.sup2 === 2 ? [false] : [true, false]
    const choixVariables = [1, 2, 3].includes(this.sup3)
      ? [this.sup3 - 1]
      : [0, 1, 2]
    const listeNbEquations = combinaisonListes(
      choixNombreEquations,
      this.nbQuestions,
    )
    const toutesEquations = listeNbEquations.every((n) => n === 1)
    const tousSystèmes = listeNbEquations.every((n) => n === 2)
    this.consigne =
      this.nbQuestions === 1
        ? `Donner une solution ${listeNbEquations[0] === 1 ? "de l'équation suivante" : "du système d'équations suivant"}.`
        : toutesEquations
          ? 'Donner une solution des équations suivantes.'
          : tousSystèmes
            ? "Donner une solution des systèmes d'équations suivants."
            : "Donner une solution des équations et systèmes d'équations suivants."
    const listeSecondMembre = combinaisonListes(
      choixSecondMembre,
      this.nbQuestions,
    )
    const listeVariables = combinaisonListes(choixVariables, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const nbEquations = listeNbEquations[i]
      const kNul = listeSecondMembre[i]
      const variables = groupesVariables[listeVariables[i]].slice(
        0,
        nbEquations + 1,
      )
      const coefficients = this.genereCoefficients(nbEquations)
      const constantes = Array.from({ length: nbEquations }, () =>
        kNul ? 0 : randint(-9, 9, [0]),
      )
      const systeme = { coefficients, constantes, nbEquations, variables, kNul }
      const texteSysteme = this.texSysteme(systeme)
      let texte = `$${texteSysteme}$`
      if (kNul) {
        texte += `<br>Donner une solution différente de $(0;0${listeNbEquations[i] === 1 ? '' : ';0'})$.`
      }
      const texteCorr = this.correctionSysteme(systeme)

      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            `\\left(${variables.join(';')}\\right)=\\left(${variables
              .map((_, index) => `%{champ${index + 1}}`)
              .join(';')}\\right)`,
          )
      }

      if (
        this.questionJamaisPosee(
          i,
          nbEquations,
          kNul ? 0 : 1,
          variables.join(','),
          coefficients.flat().join(','),
          constantes.join(','),
        )
      ) {
        this.systemes[i] = systeme
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive(i: number): string[] {
    const systeme = this.systemes[i]
    const mf = document.querySelector(
      `#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement | null
    const resultatCheck = document.querySelector(
      `span#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLSpanElement | null
    if (systeme == null || mf == null) return ['KO']
    if (this.answers === undefined) this.answers = {}
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()

    const valeurs = systeme.variables.map((_, index) =>
      this.valeurNumerique(mf.getPromptValue(`champ${index + 1}`)),
    )
    const saisieComplete = valeurs.every((valeur) => valeur != null)
    const verifieSysteme =
      saisieComplete &&
      systeme.coefficients.every(
        (ligne, index) =>
          Math.abs(
            ligne.reduce(
              (somme, coefficient, rang) =>
                somme + coefficient * (valeurs[rang] ?? 0),
              0,
            ) - systeme.constantes[index],
          ) < 1e-9,
      )
    const estNulle = valeurs.every((valeur) => Math.abs(valeur ?? 0) < 1e-9)
    const estCorrect = Boolean(verifieSysteme && (!systeme.kNul || !estNulle))

    for (let index = 0; index < systeme.variables.length; index++) {
      mf.setPromptState(
        `champ${index + 1}`,
        estCorrect ? 'correct' : 'incorrect',
        true,
      )
    }
    mf.classList.add('corrected')
    if (resultatCheck != null) {
      resultatCheck.innerHTML = estCorrect ? '😎' : '☹️'
    }
    return [estCorrect ? 'OK' : 'KO']
  }

  private genereCoefficients(nbEquations: 1 | 2): number[][] {
    const nbInconnues = nbEquations + 1
    const premiereLigne = Array.from({ length: nbInconnues }, () =>
      randint(-6, 6, [0]),
    )
    premiereLigne[randint(0, nbInconnues - 1)] = choice([-1, 1])
    if (nbEquations === 1) return [premiereLigne]

    let deuxiemeLigne: number[]
    do {
      deuxiemeLigne = Array.from({ length: nbInconnues }, () =>
        randint(-6, 6, [0]),
      )
    } while (this.lignesProportionnelles(premiereLigne, deuxiemeLigne))
    return [premiereLigne, deuxiemeLigne]
  }

  private lignesProportionnelles(ligne1: number[], ligne2: number[]) {
    for (let i = 0; i < ligne1.length; i++) {
      for (let j = i + 1; j < ligne1.length; j++) {
        if (ligne1[i] * ligne2[j] !== ligne1[j] * ligne2[i]) return false
      }
    }
    return true
  }

  private texSysteme({ coefficients, constantes, variables }: Systeme) {
    const equations = coefficients.map(
      (ligne, index) =>
        `${texMembreGauche(ligne, variables)}&=${constantes[index]}`,
    )
    return equations.length === 1
      ? equations[0].replace('&=', '=')
      : printSystem(equations[0], equations[1])
  }

  private correctionSysteme(systeme: Systeme) {
    const { coefficients, constantes, variables, nbEquations, kNul } = systeme
    const indiceIsole = coefficients[0].findIndex(
      (coefficient) => Math.abs(coefficient) === 1,
    )
    const variableIsolee = variables[indiceIsole]
    const expressionIsolee = this.expressionIsolee(
      coefficients[0],
      constantes[0],
      indiceIsole,
      variables,
    )
    let texteCorr = `On isole $${variableIsolee}$ dans la première équation :<br>`
    texteCorr +=
      nbEquations === 1
        ? `$${variableIsolee}=${expressionIsolee}$.<br>`
        : `$${texSystemeEquations([
            `${variableIsolee}&=${expressionIsolee}`,
            `${texMembreGauche(coefficients[1], variables)}&=${constantes[1]}`,
          ])}$.<br>`

    if (nbEquations === 1) {
      const indiceLibre = indiceIsole === 0 ? 1 : 0
      const variableLibre = variables[indiceLibre]
      texteCorr += `On peut choisir librement $${variableLibre}=t$, avec $t\\in\\mathbb{R}$.<br>`
      texteCorr += `En remplaçant $${variableLibre}$ par $t$ dans l'expression précédente, on obtient :<br>`
      texteCorr += `Ainsi, les solutions sont les ${variables.length === 2 ? 'couples' : 'triplets'} $\\left(${variables.join(';')}\\right)$ de la forme `
      texteCorr += `$${miseEnEvidence(
        this.solutionParametreeUneEquation(
          coefficients[0],
          constantes[0],
          indiceIsole,
          indiceLibre,
          variables.length,
        ),
      )}$, avec $t\\in\\mathbb{R}${kNul ? '^*' : ''}$.`
      texteCorr += `<br>Par exemple, pour $t=${kNul ? '1' : '0'}$, on obtient la solution $${miseEnEvidence(
        this.solutionExempleUneEquation(
          coefficients[0],
          constantes[0],
          indiceIsole,
          indiceLibre,
          variables.length,
          kNul ? 1 : 0,
        ),
      )}$ qui est une solution de l'équation.`
      return texteCorr
    }

    const substitution = this.substitutionDeuxEquations(systeme, indiceIsole)
    texteCorr += `On substitue cette expression dans la deuxième équation :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${this.texMembreGaucheSubstitue(systeme, indiceIsole, expressionIsolee)}&=${constantes[1]}`,
    ])}$.<br>`
    texteCorr += `On réduit :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${texMembreGauche(substitution.coefficients, variables)}&=${substitution.constante}`,
    ])}$.<br>`
    const coefficientAExprimerV =
      substitution.coefficients[substitution.indiceAExprimer]
    const valeurConstanteAExprimer = fraction(
      substitution.constante,
      coefficientAExprimerV,
    ).simplifie()
    const valeurCoeffLibreAExprimer = fraction(
      -substitution.coefficients[substitution.indiceLibre],
      coefficientAExprimerV,
    ).simplifie()
    const expressionAExprimer = expressionLineaire(
      valeurConstanteAExprimer,
      valeurCoeffLibreAExprimer,
      variables[substitution.indiceLibre],
    )
    const coefficientIsole0 = coefficients[0][indiceIsole]
    const constanteIsolee0 = fraction(constantes[0], coefficientIsole0)
      .differenceFraction(
        fraction(
          coefficients[0][substitution.indiceAExprimer],
          coefficientIsole0,
        ).produitFraction(valeurConstanteAExprimer),
      )
      .simplifie()
    const coefficientLibreIsole0 = fraction(
      -coefficients[0][substitution.indiceLibre],
      coefficientIsole0,
    )
      .differenceFraction(
        fraction(
          coefficients[0][substitution.indiceAExprimer],
          coefficientIsole0,
        ).produitFraction(valeurCoeffLibreAExprimer),
      )
      .simplifie()
    const variableLibre = variables[substitution.indiceLibre]
    texteCorr += `Cette deuxième équation ne contient plus $${variableIsolee}$. On exprime $${variables[substitution.indiceAExprimer]}$ en fonction de $${variableLibre}$ :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${variables[substitution.indiceAExprimer]}&=${expressionAExprimer}`,
    ])}$.<br>`
    texteCorr += `On substitue l'expression de $${variables[substitution.indiceAExprimer]}$ dans la première équation pour exprimer $${variableIsolee}$ en fonction de $${variableLibre}$ :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionLineaire(constanteIsolee0, coefficientLibreIsole0, variableLibre)}`,
      `${variables[substitution.indiceAExprimer]}&=${expressionAExprimer}`,
    ])}$.<br>`
    texteCorr += `On choisit alors $${variableLibre}=t$, avec $t\\in\\mathbb{R}$.<br>`
    texteCorr += `En remplaçant $${variableLibre}$ par $t$ dans les expressions précédentes, on obtient alors `
    texteCorr += `$${miseEnEvidence(this.solutionParametreeDeuxEquations(systeme, indiceIsole, substitution))}$, avec $t\\in\\mathbb{R}${kNul ? '^*' : ''}$.`
    texteCorr += `<br>Par exemple, pour $t=${kNul ? '1' : '0'}$, on obtient la solution $${miseEnEvidence(this.solutionExempleDeuxEquations(systeme, indiceIsole, substitution, kNul ? 1 : 0))}$ qui est une solution du système d'équations.`
    return texteCorr
  }

  private expressionIsolee(
    coefficients: number[],
    constante: number,
    indiceIsole: number,
    variables: string[],
  ) {
    const coefficientIsole = coefficients[indiceIsole]
    const constanteIsolee = fraction(constante, coefficientIsole).simplifie()
    return coefficients.reduce((expression, coefficient, index) => {
      if (index === indiceIsole) return expression
      const coefficientTex = fraction(
        -coefficient,
        coefficientIsole,
      ).simplifie()
      const terme = `${ecritureAlgebriqueSauf1(coefficientTex)}${variables[index]}`
      return expression === '0'
        ? terme.replace(/^\+/, '')
        : `${expression}${terme}`
    }, constanteIsolee.texFractionSimplifiee)
  }

  private solutionParametreeUneEquation(
    coefficients: number[],
    constante: number,
    indiceIsole: number,
    indiceLibre: number,
    nbInconnues: number,
  ) {
    const solution = Array.from({ length: nbInconnues }, (_, index) => {
      if (index === indiceLibre) return 't'
      const coefficientIsole = coefficients[indiceIsole]
      return expressionLineaire(
        fraction(constante, coefficientIsole).simplifie(),
        fraction(-coefficients[indiceLibre], coefficientIsole).simplifie(),
      )
    })
    return `\\left(${solution.join(';')}\\right)`
  }

  private texMembreGaucheSubstitue(
    systeme: Systeme,
    indiceIsole: number,
    expressionIsolee: string,
  ) {
    const ligne = systeme.coefficients[1]
    let expression = ''
    for (let index = 0; index < ligne.length; index++) {
      const coefficient = ligne[index]
      if (coefficient === 0) continue
      const variable =
        index === indiceIsole
          ? `\\left(${expressionIsolee}\\right)`
          : systeme.variables[index]
      expression +=
        expression === ''
          ? `${rienSi1(coefficient)}${variable}`
          : `${ecritureAlgebriqueSauf1(coefficient)}${variable}`
    }
    return expression === '' ? '0' : expression
  }

  private solutionExempleUneEquation(
    coefficients: number[],
    constante: number,
    indiceIsole: number,
    indiceLibre: number,
    nbInconnues: number,
    valeurParametre: number,
  ) {
    const valeurIsolee =
      (constante - coefficients[indiceLibre] * valeurParametre) /
      coefficients[indiceIsole]
    const solution = Array.from({ length: nbInconnues }, (_, index) => {
      if (index === indiceIsole)
        return fraction(valeurIsolee).texFractionSimplifiee
      return fraction(valeurParametre).texFractionSimplifiee
    })
    return `\\left(${solution.join(';')}\\right)`
  }

  private substitutionDeuxEquations(systeme: Systeme, indiceIsole: number) {
    const [ligne1, ligne2] = systeme.coefficients
    const [constante1, constante2] = systeme.constantes
    const coefficientIsole = ligne1[indiceIsole]
    const coefficients = ligne2.map((coefficient, index) =>
      index === indiceIsole
        ? 0
        : coefficient -
          (ligne2[indiceIsole] * ligne1[index]) / coefficientIsole,
    )
    const constante =
      constante2 - (ligne2[indiceIsole] * constante1) / coefficientIsole
    const indicesRestants = coefficients
      .map((coefficient, index) => ({ coefficient, index }))
      .filter(({ coefficient }) => coefficient !== 0)
    const indiceAExprimer = indicesRestants[0].index
    const indiceLibre = systeme.variables.findIndex(
      (_, index) => index !== indiceIsole && index !== indiceAExprimer,
    )
    return { coefficients, constante, indiceAExprimer, indiceLibre }
  }

  private solutionParametreeDeuxEquations(
    systeme: Systeme,
    indiceIsole: number,
    substitution: {
      coefficients: number[]
      constante: number
      indiceAExprimer: number
      indiceLibre: number
    },
  ) {
    const [ligne1] = systeme.coefficients
    const [constante1] = systeme.constantes
    const coefficientAExprimer =
      substitution.coefficients[substitution.indiceAExprimer]
    const valeurAExprimer = fraction(
      substitution.constante,
      coefficientAExprimer,
    ).simplifie()
    const coefficientLibreAExprimer = fraction(
      -substitution.coefficients[substitution.indiceLibre],
      coefficientAExprimer,
    ).simplifie()
    const coefficientIsole = ligne1[indiceIsole]
    const constanteIsolee = fraction(constante1, coefficientIsole)
      .differenceFraction(
        fraction(
          ligne1[substitution.indiceAExprimer],
          coefficientIsole,
        ).produitFraction(valeurAExprimer),
      )
      .simplifie()
    const coefficientLibreIsole = fraction(
      -ligne1[substitution.indiceLibre],
      coefficientIsole,
    )
      .differenceFraction(
        fraction(
          ligne1[substitution.indiceAExprimer],
          coefficientIsole,
        ).produitFraction(coefficientLibreAExprimer),
      )
      .simplifie()
    const solution = systeme.variables.map((_, index) => {
      if (index === indiceIsole) {
        return expressionLineaire(constanteIsolee, coefficientLibreIsole)
      }
      if (index === substitution.indiceAExprimer) {
        return expressionLineaire(
          valeurAExprimer,
          coefficientLibreAExprimer,
        )
      }
      return 't'
    })
    return `\\left(${solution.join(';')}\\right)`
  }

  private solutionExempleDeuxEquations(
    systeme: Systeme,
    indiceIsole: number,
    substitution: {
      coefficients: number[]
      constante: number
      indiceAExprimer: number
      indiceLibre: number
    },
    valeurParametre: number,
  ) {
    const [ligne1] = systeme.coefficients
    const [constante1] = systeme.constantes
    const valeurAExprimer =
      (substitution.constante -
        substitution.coefficients[substitution.indiceLibre] * valeurParametre) /
      substitution.coefficients[substitution.indiceAExprimer]
    const valeurIsolee =
      (constante1 -
        ligne1[substitution.indiceAExprimer] * valeurAExprimer -
        ligne1[substitution.indiceLibre] * valeurParametre) /
      ligne1[indiceIsole]
    const solution = systeme.variables.map((_, index) => {
      if (index === indiceIsole)
        return fraction(valeurIsolee).texFractionSimplifiee
      if (index === substitution.indiceAExprimer) {
        return fraction(valeurAExprimer).texFractionSimplifiee
      }
      return fraction(valeurParametre).texFractionSimplifiee
    })
    return `\\left(${solution.join(';')}\\right)`
  }

  // Lecture partagée avec les checks : accepte \frac72, \dfrac{7}{2}, 3,5 ou 7/2.
  private valeurNumerique(saisie: string) {
    const valeur = evaluateArithmeticExpression(
      normalizeLatexArithmetic(saisie.replaceAll('{,}', ',')),
    )
    return valeur !== undefined && Number.isFinite(valeur) ? valeur : null
  }
}
