import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from './ecritures'
import {
  expressionLineaireTex,
  simplifieVector,
  type Vector3,
} from './geometrieVectorielle'
import { pgcd } from './primalite'

type ResolutionSystemeHomogene2x3Options = {
  equations: [Vector3, Vector3]
  variables?: Vector3<string>
  solution: Vector3
  nomsLignes?: [string, string]
}

function termeVariableTex(
  coefficient: number,
  variable: string,
  estPremierTerme: boolean,
): string {
  if (coefficient === 0) return ''
  const valeurAbsolue = Math.abs(coefficient)
  const coeur = `${valeurAbsolue === 1 ? '' : valeurAbsolue}${variable}`
  if (estPremierTerme) return coefficient < 0 ? `-${coeur}` : coeur
  return coefficient < 0 ? ` - ${coeur}` : ` + ${coeur}`
}

function termeProduitTex(
  coefficient: number,
  valeur: number,
  estPremierTerme: boolean,
): string {
  if (coefficient === 0 || valeur === 0) return ''
  const coeur =
    Math.abs(coefficient) === 1
      ? ecritureParentheseSiNegatif(valeur)
      : `${Math.abs(coefficient)}\\times ${ecritureParentheseSiNegatif(valeur)}`
  if (estPremierTerme) return coefficient < 0 ? `-${coeur}` : coeur
  return coefficient < 0 ? ` - ${coeur}` : ` + ${coeur}`
}

function expressionSubstitutionTex(
  coefficientVariable: number,
  variable: string,
  coefficientValeur: number,
  valeur: number,
): string {
  const termes = [
    termeVariableTex(coefficientVariable, variable, true),
    termeProduitTex(coefficientValeur, valeur, coefficientVariable === 0),
  ].filter((terme) => terme !== '')

  return termes.join('') || '0'
}

function expressionVariableEtConstanteTex(
  coefficient: number,
  variable: string,
  constante: number,
): string {
  const partieVariable = termeVariableTex(coefficient, variable, true)
  if (constante === 0) return partieVariable || '0'
  return `${partieVariable}${ecritureAlgebrique(constante)}`
}

function expressionDoubleSubstitutionTex(
  coefficientVariable: number,
  variable: string,
  coefficientValeur1: number,
  valeur1: number,
  coefficientValeur2: number,
  valeur2: number,
): string {
  const termes = [
    termeVariableTex(coefficientVariable, variable, true),
    termeProduitTex(
      coefficientValeur1,
      valeur1,
      coefficientVariable === 0,
    ),
    termeProduitTex(
      coefficientValeur2,
      valeur2,
      coefficientVariable === 0 && coefficientValeur1 * valeur1 === 0,
    ),
  ].filter((terme) => terme !== '')

  return termes.join('') || '0'
}

function termeLigneTex(
  coefficient: number,
  nomLigne: string,
  estPremierTerme: boolean,
): string {
  if (coefficient === 0) return ''
  const valeurAbsolue = Math.abs(coefficient)
  const coeur = `${valeurAbsolue === 1 ? '' : valeurAbsolue}${nomLigne}`
  if (estPremierTerme) return coefficient < 0 ? `-${coeur}` : coeur
  return coefficient < 0 ? ` - ${coeur}` : ` + ${coeur}`
}

function combinaisonLignesTex(
  coefficientLigne1: number,
  coefficientLigne2: number,
  nomsLignes: [string, string],
): string {
  const termes = [
    termeLigneTex(coefficientLigne1, nomsLignes[0], true),
    termeLigneTex(coefficientLigne2, nomsLignes[1], coefficientLigne1 === 0),
  ].filter((terme) => terme !== '')

  return termes.join('')
}

function combinaisonLignesReduite(
  coefficientLigne1: number,
  coefficientLigne2: number,
): [number, number] {
  const diviseur = pgcd(Math.abs(coefficientLigne1), Math.abs(coefficientLigne2))
  if (diviseur === 0) return [coefficientLigne1, coefficientLigne2]
  return [coefficientLigne1 / diviseur, coefficientLigne2 / diviseur]
}

function vecteurLigneCombinee(
  equations: [Vector3, Vector3],
  coefficientLigne1: number,
  coefficientLigne2: number,
): Vector3 {
  return [
    coefficientLigne1 * equations[0][0] + coefficientLigne2 * equations[1][0],
    coefficientLigne1 * equations[0][1] + coefficientLigne2 * equations[1][1],
    coefficientLigne1 * equations[0][2] + coefficientLigne2 * equations[1][2],
  ]
}

function choisirResolution({
  equations,
  solution,
}: Pick<ResolutionSystemeHomogene2x3Options, 'equations' | 'solution'>): {
  variableEliminee: number
  variableResolue: number
  variableLibre: number
  coefficientLigne1: number
  coefficientLigne2: number
  coefficientVariableResolue: number
  coefficientVariableLibre: number
  equationSubstitution: Vector3
} {
  for (const variableLibre of [2, 1, 0]) {
    if (solution[variableLibre] === 0) continue
    const variablesAResoudre = [0, 1, 2].filter(
      (index) => index !== variableLibre,
    )

    for (const variableEliminee of variablesAResoudre) {
      const variableResolue = variablesAResoudre.find(
        (index) => index !== variableEliminee,
      ) as number
      let coefficientLigne1 = equations[1][variableEliminee]
      let coefficientLigne2 = -equations[0][variableEliminee]
      let equationSubstitution =
        equations[0][variableEliminee] !== 0 ? equations[0] : equations[1]

      if (
        equations[0][variableEliminee] === 0 &&
        equations[1][variableEliminee] !== 0
      ) {
        coefficientLigne1 = 1
        coefficientLigne2 = 0
        equationSubstitution = equations[1]
      } else if (
        equations[1][variableEliminee] === 0 &&
        equations[0][variableEliminee] !== 0
      ) {
        coefficientLigne1 = 0
        coefficientLigne2 = 1
        equationSubstitution = equations[0]
      }

      const equationCombinee = vecteurLigneCombinee(
        equations,
        coefficientLigne1,
        coefficientLigne2,
      )
      const coefficientVariableResolue = equationCombinee[variableResolue]
      const coefficientVariableLibre = equationCombinee[variableLibre]

      if (
        coefficientVariableResolue !== 0 &&
        equationSubstitution[variableEliminee] !== 0
      ) {
        return {
          variableEliminee,
          variableResolue,
          variableLibre,
          coefficientLigne1,
          coefficientLigne2,
          coefficientVariableResolue,
          coefficientVariableLibre,
          equationSubstitution,
        }
      }
    }
  }

  throw Error('Impossible de résoudre ce système homogène 2x3.')
}

function equationSimplifiee(coefficients: Vector3): Vector3 {
  const diviseur = pgcd(
    pgcd(Math.abs(coefficients[0]), Math.abs(coefficients[1])),
    Math.abs(coefficients[2]),
  )
  return (
    diviseur === 0
      ? coefficients
      : [
          coefficients[0] / diviseur,
          coefficients[1] / diviseur,
          coefficients[2] / diviseur,
        ] as Vector3
  )
}

function systemeDeuxLignesTex(
  ligne1: Vector3,
  ligne2: Vector3,
  variables: Vector3<string>,
  nomsLignes: [string, string],
): string {
  return `\\begin{cases}
  ${nomsLignes[0]}:\\;${expressionLineaireTex(ligne1, variables)}=0\\\\
  ${nomsLignes[1]}:\\;${expressionLineaireTex(ligne2, variables)}=0
  \\end{cases}`
}

function vecteursProportionnels(vector1: Vector3, vector2: Vector3): boolean {
  return (
    vector1[0] * vector2[1] === vector1[1] * vector2[0] &&
    vector1[0] * vector2[2] === vector1[2] * vector2[0] &&
    vector1[1] * vector2[2] === vector1[2] * vector2[1]
  )
}

function signeReductionLigne(ligneAvantReduction: Vector3, ligneApresReduction: Vector3): 1 | -1 {
  if (ligneAvantReduction.every((coefficient) => coefficient === 0)) return 1
  const indexCoefficientNonNul = ligneAvantReduction.findIndex(
    (coefficient) => coefficient !== 0,
  )
  return ligneAvantReduction[indexCoefficientNonNul] *
    ligneApresReduction[indexCoefficientNonNul] <
    0
    ? -1
    : 1
}

export function resolutionSystemeLineaireHomogene2x3Tex({
  equations,
  variables = ['a', 'b', 'c'],
  solution,
  nomsLignes = ['L_1', 'L_2'],
}: ResolutionSystemeHomogene2x3Options): string {
  const resolution = choisirResolution({ equations, solution })
  const variableLibre = variables[resolution.variableLibre]
  const variableResolue = variables[resolution.variableResolue]
  const variableEliminee = variables[resolution.variableEliminee]
  const solutionSimplifiee = simplifieVector(solution)
  const valeurLibre = solutionSimplifiee[resolution.variableLibre]
  const valeurResolue = solutionSimplifiee[resolution.variableResolue]
  const valeurEliminee = solutionSimplifiee[resolution.variableEliminee]
  const [coefficientLigne1Reduit, coefficientLigne2Reduit] =
    combinaisonLignesReduite(
      resolution.coefficientLigne1,
      resolution.coefficientLigne2,
    )
  const coefficientsCombinaison = vecteurLigneCombinee(
    equations,
    coefficientLigne1Reduit,
    coefficientLigne2Reduit,
  )
  const coefficientsCombinaisonReduits =
    equationSimplifiee(coefficientsCombinaison)
  const coefficientVariableResolueReduit =
    coefficientsCombinaisonReduits[resolution.variableResolue]
  const coefficientVariableLibreReduit =
    coefficientsCombinaisonReduits[resolution.variableLibre]
  const valeurConstanteEliminee =
    resolution.equationSubstitution[resolution.variableResolue] *
      valeurResolue +
    resolution.equationSubstitution[resolution.variableLibre] * valeurLibre
  const nomEquationSubstitution =
    resolution.equationSubstitution === equations[0] ? nomsLignes[0] : nomsLignes[1]
  const systemeInitialTex = systemeDeuxLignesTex(
    equations[0],
    equations[1],
    variables,
    nomsLignes,
  )
  const systemeReduitTex = systemeDeuxLignesTex(
    equations[0],
    coefficientsCombinaisonReduits,
    variables,
    nomsLignes,
  )
  const signeReduction = signeReductionLigne(
    coefficientsCombinaison,
    coefficientsCombinaisonReduits,
  )
  const combinaisonTex =
    vecteursProportionnels(coefficientsCombinaisonReduits, equations[0])
      ? `${nomsLignes[1]}\\leftarrow ${signeReduction === -1 ? '-' : ''}${nomsLignes[0]}`
      : vecteursProportionnels(coefficientsCombinaisonReduits, equations[1])
        ? `${nomsLignes[1]}\\leftarrow ${signeReduction === -1 ? '-' : ''}${nomsLignes[1]}`
        : `${nomsLignes[1]}\\leftarrow ${signeReduction === -1 ? '-' : ''}\\left(${combinaisonLignesTex(
            coefficientLigne1Reduit,
            coefficientLigne2Reduit,
            nomsLignes,
          )}\\right)`
  const ligneDejaExploitable =
    coefficientLigne1Reduit === 0 && coefficientLigne2Reduit === 1

  let texte = `Ce système homogène admet toujours la solution nulle. Comme il comporte deux équations pour trois inconnues, il reste une variable libre : on obtient donc une infinité de solutions, et il suffit d'en choisir une non nulle.<br>`
  texte += `Résolvons ce système par combinaison linéaire. On note $${nomsLignes[0]}$ et $${nomsLignes[1]}$ ses deux lignes :<br>`
  if (ligneDejaExploitable) {
    texte += `$${systemeInitialTex}$<br>`
    texte += `La ligne $${nomsLignes[1]}$ ne contient pas $${variableEliminee}$ ; elle donne déjà $${expressionLineaireTex(coefficientsCombinaisonReduits, variables)}=0$.<br>`
  } else {
    texte += `$\\begin{aligned}
    ${systemeInitialTex}
    &\\xrightarrow{${combinaisonTex}} ${systemeReduitTex}
    \\end{aligned}$<br>`
  }
  texte += `On choisit alors $${variableLibre}=${valeurLibre}$. Dans l'équation obtenue :<br>`
  texte += `$${expressionSubstitutionTex(
    coefficientVariableResolueReduit,
    variableResolue,
    coefficientVariableLibreReduit,
    valeurLibre,
  )}=0\\iff ${expressionVariableEtConstanteTex(
    coefficientVariableResolueReduit,
    variableResolue,
    coefficientVariableLibreReduit * valeurLibre,
  )}=0\\iff ${variableResolue}=${valeurResolue}$.<br>`
  texte += `On remplace ensuite $${variableResolue}$ et $${variableLibre}$ dans la ligne $${nomEquationSubstitution}$ du système de départ :<br>`
  texte += `$${expressionDoubleSubstitutionTex(
    resolution.equationSubstitution[resolution.variableEliminee],
    variableEliminee,
    resolution.equationSubstitution[resolution.variableResolue],
    valeurResolue,
    resolution.equationSubstitution[resolution.variableLibre],
    valeurLibre,
  )}=0\\iff ${expressionVariableEtConstanteTex(
    resolution.equationSubstitution[resolution.variableEliminee],
    variableEliminee,
    valeurConstanteEliminee,
  )}=0\\iff ${variableEliminee}=${valeurEliminee}$.<br>`

  return texte
}
