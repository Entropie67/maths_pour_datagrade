import {
  addMathaleaBranchingQcm,
  type MathaleaBranchingQcmData,
} from '../../lib/customElements/MathaleaBranchingQcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Démontrer ou réfuter une égalité littérale par calcul ou contre-exemple'
export const dateDePublication = '16/08/2026'
export const interactifReady = true
export const uuid = '8d4f2'
export const refs = {
  'fr-fr': ['4L23'],
  'fr-ch': ['NR'],
}

type ExpressionPolynomiale = {
  texte: string
  coefficientDegre2: number
  coefficientDegre1: number
  constante: number
}

type AffirmationLitterale = {
  variable: string
  membreGauche: ExpressionPolynomiale
  membreDroit: ExpressionPolynomiale
  statut: boolean
  expressionReduite: string
  contreExemple: number
}

type GenerateurAffirmation = () => AffirmationLitterale

/**
 * Convertit ax²+bx+c en une écriture compacte utilisable comme réponse attendue.
 */
function expressionReduite(
  coefficientDegre2: number,
  coefficientDegre1: number,
  constante: number,
  variable: string,
): string {
  const termes: { coefficient: number; texte: string }[] = []
  if (coefficientDegre2 !== 0) {
    termes.push({
      coefficient: coefficientDegre2,
      texte: `${rienSi1(coefficientDegre2)}${variable}^2`,
    })
  }
  if (coefficientDegre1 !== 0) {
    termes.push({
      coefficient: coefficientDegre1,
      texte: `${rienSi1(coefficientDegre1)}${variable}`,
    })
  }
  if (constante !== 0 || termes.length === 0) {
    termes.push({ coefficient: constante, texte: String(constante) })
  }
  return termes
    .map(({ coefficient, texte }, index) =>
      index === 0 || coefficient < 0 ? texte : `+${texte}`,
    )
    .join('')
}

function expressionLineaire(
  texte: string,
  coefficientDegre1: number,
  constante: number,
): ExpressionPolynomiale {
  return expressionPolynomiale(texte, 0, coefficientDegre1, constante)
}

function expressionPolynomiale(
  texte: string,
  coefficientDegre2: number,
  coefficientDegre1: number,
  constante: number,
): ExpressionPolynomiale {
  return { texte, coefficientDegre2, coefficientDegre1, constante }
}

function evaluer(expression: ExpressionPolynomiale, valeur: number): number {
  return (
    expression.coefficientDegre2 * valeur ** 2 +
    expression.coefficientDegre1 * valeur +
    expression.constante
  )
}

function choisirContreExemple(
  membreGauche: ExpressionPolynomiale,
  membreDroit: ExpressionPolynomiale,
): number {
  const candidats = shuffle([-3, -2, -1, 0, 1, 2, 3, 4, 5])
  return (
    candidats.find(
      (valeur) =>
        evaluer(membreGauche, valeur) !== evaluer(membreDroit, valeur),
    ) ?? 0
  )
}

function estUnContreExempleValide(
  saisie: string,
  membreGauche: ExpressionPolynomiale,
  membreDroit: ExpressionPolynomiale,
): boolean {
  const valeur = Number(
    saisie
      .replaceAll('{,}', '.')
      .replaceAll(',', '.')
      .replaceAll('\\,', '.')
      .trim(),
  )
  return (
    Number.isFinite(valeur) &&
    evaluer(membreGauche, valeur) !== evaluer(membreDroit, valeur)
  )
}

function genererReductionVraie(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const a = randint(2, 7)
  const b = randint(1, 5, [a])
  const retrait = randint(1, 3)
  const membreGauche = expressionLineaire(
    `${rienSi1(a)}${variable}+${rienSi1(b)}${variable}`,
    a + b,
    0,
  )
  const membreDroit = expressionLineaire(
    `${rienSi1(a + b + retrait)}${variable}-${rienSi1(retrait)}${variable}`,
    a + b,
    0,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererReductionFausse(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const a = randint(2, 7)
  const b = randint(1, 5)
  const decalage = randint(1, 3)
  const membreGauche = expressionLineaire(`${a}+${rienSi1(b)}${variable}`, b, a)
  const membreDroit = expressionLineaire(
    `${a + b + decalage}${variable}`,
    a + b + decalage,
    0,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererConfusionConstanteEtCoefficient(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const constante = randint(2, 9)
  const coefficient = randint(2, 9, [constante])
  const membreGauche = expressionLineaire(
    `${constante}+${rienSi1(coefficient)}${variable}`,
    coefficient,
    constante,
  )
  const membreDroit = expressionLineaire(
    `${constante + coefficient}${variable}`,
    constante + coefficient,
    0,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererDistributiviteVraie(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const facteur = randint(2, 6)
  const constante = randint(1, 5)
  const signe = choice([-1, 1])
  const b = signe * constante
  const membreGauche = expressionLineaire(
    `${facteur}(${variable}${ecritureAlgebrique(b)})`,
    facteur,
    facteur * b,
  )
  const membreDroit = expressionLineaire(
    `${facteur}${variable}${ecritureAlgebrique(facteur * b)}`,
    facteur,
    facteur * b,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererDistributiviteFausse(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const facteur = randint(2, 6)
  const constante = randint(1, 5)
  const signe = choice([-1, 1])
  const b = signe * constante
  const membreGauche = expressionLineaire(
    `${facteur}(${variable}${ecritureAlgebrique(b)})`,
    facteur,
    facteur * b,
  )
  const membreDroit = expressionLineaire(
    `${facteur}${variable}${ecritureAlgebrique(b)}`,
    facteur,
    b,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererMembresComposesVrais(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const a = randint(2, 6)
  const b = randint(1, 5)
  const c = randint(1, 5)
  const membreGauche = expressionLineaire(
    `${rienSi1(a)}${variable}+${b}+${rienSi1(c)}${variable}`,
    a + c,
    b,
  )
  const membreDroit = expressionLineaire(
    `${a + c}${variable}${ecritureAlgebrique(b)}`,
    a + c,
    b,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererMembresComposesFaux(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const a = randint(2, 6)
  const b = randint(1, 5)
  const c = randint(1, 5)
  const decalage = randint(1, 3)
  const membreGauche = expressionLineaire(
    `${rienSi1(a)}${variable}+${b}+${rienSi1(c)}${variable}`,
    a + c,
    b,
  )
  const membreDroit = expressionLineaire(
    `${a + c}${variable}${ecritureAlgebrique(b + decalage)}`,
    a + c,
    b + decalage,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererConfusionCarreEtDouble(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const coefficient = randint(1, 5)
  const membreGauche = expressionPolynomiale(
    `${rienSi1(coefficient)}${variable}^2`,
    coefficient,
    0,
    0,
  )
  const membreDroit = expressionLineaire(
    `${2 * coefficient}${variable}`,
    2 * coefficient,
    0,
  )
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function genererConfusionCoefficientEtCarre(): AffirmationLitterale {
  const variable = choice(['x', 'y', 'z', 't'])
  const coefficient = randint(2, 5)
  const membreGauche = expressionPolynomiale(
    `${rienSi1(coefficient)}${variable}^2`,
    coefficient,
    0,
    0,
  )
  const membreDroit = choice([
    expressionPolynomiale(
      `(${rienSi1(coefficient)}${variable})^2`,
      coefficient ** 2,
      0,
      0,
    ),
    expressionLineaire(`${coefficient ** 2}${variable}`, coefficient ** 2, 0),
  ])
  return fabriquerAffirmation(variable, membreGauche, membreDroit)
}

function fabriquerAffirmation(
  variable: string,
  membreGauche: ExpressionPolynomiale,
  membreDroit: ExpressionPolynomiale,
): AffirmationLitterale {
  const statut =
    membreGauche.coefficientDegre2 === membreDroit.coefficientDegre2 &&
    membreGauche.coefficientDegre1 === membreDroit.coefficientDegre1 &&
    membreGauche.constante === membreDroit.constante
  return {
    variable,
    membreGauche,
    membreDroit,
    statut,
    expressionReduite: expressionReduite(
      membreGauche.coefficientDegre2,
      membreGauche.coefficientDegre1,
      membreGauche.constante,
      variable,
    ),
    contreExemple: choisirContreExemple(membreGauche, membreDroit),
  }
}

const generateursAffirmations: GenerateurAffirmation[] = [
  genererReductionVraie,
  genererReductionFausse,
  genererConfusionConstanteEtCoefficient,
  genererDistributiviteVraie,
  genererDistributiviteFausse,
  genererMembresComposesVrais,
  genererMembresComposesFaux,
  genererConfusionCarreEtDouble,
  genererConfusionCoefficientEtCarre,
]

/**
 * @author Jean-claude Lhote
 */
export default class DemontrerOuRefuterEgaliteLitterale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque affirmation, dire si elle est vraie ou fausse, puis justifier.'
        : "Dire si l'affirmation est vraie ou fausse, puis justifier."

    const generateurs = shuffle(generateursAffirmations)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const affirmation = generateurs[i % generateurs.length]()
      const egalite = `${affirmation.membreGauche.texte}=${affirmation.membreDroit.texte}`
      texte = `Pour tous les nombres $${affirmation.variable}$, a-t-on $${egalite}$ ?`

      const donneesQcm: MathaleaBranchingQcmData = {
        choices: [
          {
            texte: 'Vrai',
            statut: affirmation.statut,
            points: 1,
            feedback: "L'affirmation est fausse.",
            followup: {
              prompt:
                'Justifier en donnant une expression réduite commune aux deux membres.',
              expected: {
                value: affirmation.expressionReduite,
                options: { developpementEgal: true },
              },
              points: 2,
            },
          },
          {
            texte: 'Faux',
            statut: !affirmation.statut,
            points: 1,
            feedback: "L'affirmation est vraie.",
            followup: {
              prompt: 'Justifier en donnant un contre-exemple.',
              texteAvant: `$${affirmation.variable}=$`,
              callback: (answer) => ({
                isOk: estUnContreExempleValide(
                  answer,
                  affirmation.membreGauche,
                  affirmation.membreDroit,
                ),
                feedback: 'Cette valeur ne donne pas un contre-exemple.',
              }),
              points: 2,
            },
          },
        ],
      }

      if (this.interactif) {
        texte += addMathaleaBranchingQcm(this, i, donneesQcm)
      } else {
        texte += '<br>Répondre par Vrai ou Faux, puis justifier.'
      }

      texteCorr = `L'affirmation est ${texteEnCouleurEtGras(affirmation.statut ? 'vraie' : 'fausse')}.<br>`
      texteCorr += `Le membre de gauche se réduit en $${expressionReduite(
        affirmation.membreGauche.coefficientDegre2,
        affirmation.membreGauche.coefficientDegre1,
        affirmation.membreGauche.constante,
        affirmation.variable,
      )}$.<br>`
      texteCorr += `Le membre de droite se réduit en $${expressionReduite(
        affirmation.membreDroit.coefficientDegre2,
        affirmation.membreDroit.coefficientDegre1,
        affirmation.membreDroit.constante,
        affirmation.variable,
      )}$.`
      if (!affirmation.statut) {
        texteCorr += `<br>Par exemple, pour $${affirmation.variable}=${affirmation.contreExemple}$, on obtient $${evaluer(
          affirmation.membreGauche,
          affirmation.contreExemple,
        )}$ à gauche et $${evaluer(
          affirmation.membreDroit,
          affirmation.contreExemple,
        )}$ à droite. C'est un contre-exemple.`
      }

      if (this.questionJamaisPosee(i, egalite)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
