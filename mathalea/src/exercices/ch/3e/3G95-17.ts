import type { MathfieldElement } from 'mathlive'
import { evaluateArithmeticExpression } from '../../../lib/interactif/checks/evaluateArithmeticExpression'
import { normalizeLatexArithmetic } from '../../../lib/interactif/checks/latexArithmetic'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { crossProduct, type Vector3 } from '../../../lib/outils/geometrieVectorielle'
import {
    expressionLineaire,
    texMembreGauche,
    texSystemeEquations,
} from '../../../lib/outils/systemeEquations'
import { fraction } from '../../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer un vecteur non nul orthogonal à deux vecteurs'
export const interactifReady = true
export const dateDePublication = '04/05/2026'
export const uuid = 'a7f28'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G95-17'],
}

type Vecteurs = {
  u: Vector3
  v: Vector3
}

export default class VecteurNonNulOrthogonalADeuxVecteurs extends Exercice {
  private vecteurs: Vecteurs[] = []

  constructor() {
    super()
    this.nbQuestions = 2
    this.exoCustomResultat = true
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.vecteurs = []
    this.consigne =
      this.nbQuestions === 1
        ? "Soit l'espace muni d'un repère orthonormé $(O ; \\vec{\\imath}, \\vec{\\jmath}, \\vec{k})$. Déterminer un vecteur non nul orthogonal aux vecteurs $\\vec u$ et $\\vec v$ suivants."
        : "Soit l'espace muni d'un repère orthonormé $(O ; \\vec{\\imath}, \\vec{\\jmath}, \\vec{k})$. Déterminer un vecteur non nul orthogonal aux vecteurs $\\vec u$ et $\\vec v$ suivants."

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const vecteurs = this.genereVecteurs()
      const { u, v } = vecteurs
      let texte = ''
      texte += `$\\vec u\\begin{pmatrix}${u[0]}\\\\${u[1]}\\\\${u[2]}\\end{pmatrix}$ et $\\vec v\\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$.`
      if (this.interactif) {
        texte +=
          '<br><br>' +
          remplisLesBlancs(
            this,
            i,
            '\\vec n=\\begin{pmatrix}%{champ1}\\\\%{champ2}\\\\%{champ3}\\end{pmatrix}',
          )
      }
      const texteCorr = this.correctionVecteurs(vecteurs)

      if (this.questionJamaisPosee(i, u.join(','), v.join(','))) {
        this.vecteurs[i] = vecteurs
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive(i: number): string[] {
    const vecteurs = this.vecteurs[i]
    const mf = document.querySelector(
      `#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement | null
    const resultatCheck = document.querySelector(
      `span#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLSpanElement | null
    if (vecteurs == null || mf == null) return ['KO']
    if (this.answers === undefined) this.answers = {}
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()

    const valeurs = [1, 2, 3].map((index) =>
      this.valeurNumerique(mf.getPromptValue(`champ${index}`)),
    )
    const saisieComplete = valeurs.every((valeur) => valeur != null)
    const produitU =
      saisieComplete &&
      vecteurs.u.reduce(
        (somme, coefficient, index) => somme + coefficient * valeurs[index]!,
        0,
      )
    const produitV =
      saisieComplete &&
      vecteurs.v.reduce(
        (somme, coefficient, index) => somme + coefficient * valeurs[index]!,
        0,
      )
    const estNul = valeurs.every((valeur) => Math.abs(valeur ?? 0) < 1e-9)
    const estCorrect = Boolean(
      saisieComplete &&
      Math.abs(produitU || 0) < 1e-9 &&
      Math.abs(produitV || 0) < 1e-9 &&
      !estNul,
    )

    for (let index = 1; index <= 3; index++) {
      mf.setPromptState(
        `champ${index}`,
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

  private genereVecteurs(): Vecteurs {
    let u: Vector3
    let v: Vector3
    do {
      u = Array.from({ length: 3 }, () => randint(-6, 6, [0])) as Vector3
      u[randint(0, 2)] = choice([-1, 1])
      v = Array.from({ length: 3 }, () => randint(-6, 6, [0])) as Vector3
    } while (this.vecteurNul(crossProduct(u, v)))
    return { u, v }
  }

  private correctionVecteurs({ u, v }: Vecteurs) {
    const variables = ['x', 'y', 'z']
    const indiceIsole = u.findIndex(
      (coefficient) => Math.abs(coefficient) === 1,
    )
    const variableIsolee = variables[indiceIsole]
    const expressionIsolee = this.expressionIsolee(u, indiceIsole, variables)
    const substitution = this.substitution(u, v, indiceIsole)
    const coefficientAExprimerUV =
      substitution.coefficients[substitution.indiceAExprimer]
    const coefficientLibreAExprimerUV = fraction(
      -substitution.coefficients[substitution.indiceLibre],
      coefficientAExprimerUV,
    ).simplifie()
    const expressionAExprimer = expressionLineaire(
      fraction(0).simplifie(),
      coefficientLibreAExprimerUV,
      variables[substitution.indiceLibre],
    )
    const coefficientIsoleUV = u[indiceIsole]
    const coefficientLibreIsoleUV = fraction(
      -u[substitution.indiceLibre],
      coefficientIsoleUV,
    )
      .differenceFraction(
        fraction(
          u[substitution.indiceAExprimer],
          coefficientIsoleUV,
        ).produitFraction(coefficientLibreAExprimerUV),
      )
      .simplifie()
    const solution = this.solutionParametree(u, indiceIsole, substitution)
    const exemple = this.solutionExemple(u, indiceIsole, substitution, 1)
    const variableLibre = variables[substitution.indiceLibre]

    let texteCorr = `Soit $\\vec n\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$.<br>`
    texteCorr += `$\\vec n$ est orthogonal aux deux vecteurs de l’énoncé si et seulement si $\\vec n\\cdot\\vec u=0$ et $\\vec n\\cdot\\vec v=0$.<br>`
    texteCorr += `On obtient donc le système :<br>$${texSystemeEquations([
      `${texMembreGauche(u, variables)}&=0`,
      `${texMembreGauche(v, variables)}&=0`,
    ])}$.<br>`
    texteCorr += `On isole $${variableIsolee}$ dans la première équation :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${texMembreGauche(v, variables)}&=0`,
    ])}$.<br>`
    texteCorr += `On substitue cette expression dans la deuxième équation :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${this.texMembreGaucheSubstitue(v, indiceIsole, expressionIsolee, variables)}&=0`,
    ])}$.<br>`
    texteCorr += `On réduit :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${texMembreGauche(substitution.coefficients, variables)}&=0`,
    ])}$.<br>`
    texteCorr += `Cette deuxième équation ne contient plus $${variableIsolee}$. On exprime $${variables[substitution.indiceAExprimer]}$ en fonction de $${variableLibre}$ :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionIsolee}`,
      `${variables[substitution.indiceAExprimer]}&=${expressionAExprimer}`,
    ])}$.<br>`
    texteCorr += `On substitue l’expression de $${variables[substitution.indiceAExprimer]}$ dans la première équation pour exprimer $${variableIsolee}$ en fonction de $${variableLibre}$ :<br>`
    texteCorr += `$${texSystemeEquations([
      `${variableIsolee}&=${expressionLineaire(fraction(0), coefficientLibreIsoleUV, variableLibre)}`,
      `${variables[substitution.indiceAExprimer]}&=${expressionAExprimer}`,
    ])}$.<br>`
    texteCorr += `On choisit alors $${variableLibre}=t$, avec $t\\in\\mathbb{R}^*$, afin d’obtenir un vecteur non nul.<br>`
    texteCorr += `En remplaçant $${variableLibre}$ par $t$ dans les expressions précédentes, on obtient les vecteurs $\\vec n$ dont les coordonnées sont de la forme $${miseEnEvidence(solution)}$, avec $t\\in\\mathbb{R}^*$.<br>`
    texteCorr += `Par exemple, pour $t=1$, on obtient le vecteur non nul $${miseEnEvidence(`\\vec n\\begin{pmatrix}${exemple.join('\\\\')}\\end{pmatrix}`)}$ qui est un vecteur orthogonal à $\\vec u$ et $\\vec v$.`
    return texteCorr
  }

  private expressionIsolee(
    coefficients: number[],
    indiceIsole: number,
    variables: string[],
  ) {
    const coefficientIsole = coefficients[indiceIsole]
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
    }, '0')
  }

  private substitution(u: number[], v: number[], indiceIsole: number) {
    const coefficientIsole = u[indiceIsole]
    const coefficients = v.map((coefficient, index) =>
      index === indiceIsole
        ? 0
        : coefficient - (v[indiceIsole] * u[index]) / coefficientIsole,
    )
    const indicesRestants = coefficients
      .map((coefficient, index) => ({ coefficient, index }))
      .filter(({ coefficient }) => coefficient !== 0)
    const indiceAExprimer = indicesRestants[0].index
    const indiceLibre = [0, 1, 2].find(
      (index) => index !== indiceIsole && index !== indiceAExprimer,
    )!
    return { coefficients, indiceAExprimer, indiceLibre }
  }

  private solutionParametree(
    u: number[],
    indiceIsole: number,
    substitution: {
      coefficients: number[]
      indiceAExprimer: number
      indiceLibre: number
    },
  ) {
    const coefficientAExprimer =
      substitution.coefficients[substitution.indiceAExprimer]
    const coefficientLibreAExprimer = fraction(
      -substitution.coefficients[substitution.indiceLibre],
      coefficientAExprimer,
    ).simplifie()
    const coefficientIsole = u[indiceIsole]
    const coefficientLibreIsole = fraction(
      -u[substitution.indiceLibre],
      coefficientIsole,
    )
      .differenceFraction(
        fraction(
          u[substitution.indiceAExprimer],
          coefficientIsole,
        ).produitFraction(coefficientLibreAExprimer),
      )
      .simplifie()
    const solution = ['x', 'y', 'z'].map((_, index) => {
      if (index === indiceIsole) {
        return expressionLineaire(fraction(0), coefficientLibreIsole)
      }
      if (index === substitution.indiceAExprimer) {
        return expressionLineaire(fraction(0), coefficientLibreAExprimer)
      }
      return 't'
    })
    return `\\begin{pmatrix}${solution.join('\\\\')}\\end{pmatrix}`
  }

  private solutionExemple(
    u: number[],
    indiceIsole: number,
    substitution: {
      coefficients: number[]
      indiceAExprimer: number
      indiceLibre: number
    },
    valeurParametre: number,
  ) {
    const valeurAExprimer =
      (-substitution.coefficients[substitution.indiceLibre] * valeurParametre) /
      substitution.coefficients[substitution.indiceAExprimer]
    const valeurIsolee =
      (-u[substitution.indiceAExprimer] * valeurAExprimer -
        u[substitution.indiceLibre] * valeurParametre) /
      u[indiceIsole]
    return [0, 1, 2].map((index) => {
      if (index === indiceIsole)
        return fraction(valeurIsolee).simplifie().texFractionSimplifiee
      if (index === substitution.indiceAExprimer)
        return fraction(valeurAExprimer).simplifie().texFractionSimplifiee
      return fraction(valeurParametre).texFractionSimplifiee
    })
  }

  private texMembreGaucheSubstitue(
    coefficients: number[],
    indiceIsole: number,
    expressionIsolee: string,
    variables: string[],
  ) {
    let expression = ''
    for (let index = 0; index < coefficients.length; index++) {
      const coefficient = coefficients[index]
      if (coefficient === 0) continue
      const variable =
        index === indiceIsole
          ? `\\left(${expressionIsolee}\\right)`
          : variables[index]
      expression +=
        expression === ''
          ? `${rienSi1(coefficient)}${variable}`
          : `${ecritureAlgebriqueSauf1(coefficient)}${variable}`
    }
    return expression === '' ? '0' : expression
  }

  private vecteurNul(vecteur: number[]) {
    return vecteur.every((coordonnee) => coordonnee === 0)
  }

  // Lecture partagée avec les checks : accepte \frac72, \dfrac{7}{2}, 3,5 ou 7/2.
  private valeurNumerique(saisie: string) {
    const valeur = evaluateArithmeticExpression(
      normalizeLatexArithmetic(saisie.replaceAll('{,}', ',')),
    )
    return valeur !== undefined && Number.isFinite(valeur) ? valeur : null
  }
}
