import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { createQuestion } from '../../lib/interactif/createQuestion'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Étudier le sens de variation d'une suite définie de façon explicite"

export const dateDePublication = '03/10/2024'
/**
 * @author Stéphane Guyon
 */
export const dateDeModifImportante = '07/11/2026'

export const uuid = '53921'
export const refs = {
  'fr-fr': ['1AL12-2'],
  'fr-ch': [],
}

/** Méthodes d'étude du sens de variation */
const SIGNE_DIFFERENCE = 1
const FONCTION_ASSOCIEE = 2
const QUOTIENT = 3
const MELANGE = 4

/** Types de suites */
const AFFINE = 1
const SECOND_DEGRE = 2
const HOMOGRAPHIQUE = 3
const TERMES_POSITIFS = 4

/**
 * Contenu d'une question, découpé pour pouvoir proposer ou non
 * une question intermédiaire.
 */
type Etapes = {
  /** Définition de la fonction associée (méthode 2), reprise dans la question intermédiaire */
  preparation?: string
  /** Question intermédiaire (sa définition de `f` est comprise) */
  questionIntermediaire: string
  /** Correction de la question intermédiaire */
  correctionIntermediaire: string
  /** Correction de la conclusion */
  correctionFinale: string
}

const rang = (r: number) =>
  r > 0
    ? `à partir du rang $${miseEnEvidence(String(r))}$`
    : 'sur $\\mathbb{N}$'

function conclusion(croissante: boolean, r = 0, definieDepuisR = false) {
  const sens = texteEnCouleurEtGras(croissante ? 'croissante' : 'décroissante')
  return definieDepuisR
    ? `La suite $(u_n)$ est donc ${sens}.`
    : `La suite $(u_n)$ est donc ${sens} ${rang(r)}.`
}

/** Écriture `c n + k` (le terme constant est omis s'il est nul). */
function lineaire(c: number, k: number, variable = 'n') {
  return `${rienSi1(c)}${variable}${k === 0 ? '' : ` ${ecritureAlgebrique(k)}`}`
}

/**
 * Rédaction du sens de variation de la suite à partir de celui de `f`.
 * `definieDepuisR` : la suite n'est définie qu'à partir du rang `r`.
 */
function deduction(croissante: boolean, r = 0, definieDepuisR = false) {
  const domaine = definieDepuisR
    ? `Pour tout entier $n \\geqslant ${r}$`
    : 'Pour tout $n\\in\\mathbb{N}$'
  const suite = r > 0 ? `$(u_n)_{n \\geqslant ${r}}$` : '$(u_n)$'
  return [
    `${domaine}, on a $u_n=f(n)$.`,
    `La suite ${suite} a donc les mêmes variations que la fonction $f$ sur $[${r};+\\infty[$.`,
    conclusion(croissante, r, definieDepuisR),
  ].join('<br>')
}

const INTRO =
  'Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par'

export default class VariationDUneSuiteDefinieExplicitement extends Exercice {
  constructor() {
    super()
    this.titre = titre
    this.nbQuestions = 3
    this.sup = SIGNE_DIFFERENCE
    this.sup2 = false
    this.besoinFormulaireNumerique = [
      'Méthode',
      4,
      [
        '1 : Étude du signe de u(n+1) - u(n)',
        '2 : Variations de la fonction associée',
        '3 : Étude du quotient u(n+1) / u(n)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Avec question intermédiaire', false]
  }

  /** Types de suites auxquels s'applique la méthode choisie. */
  private typesCompatibles(methode: number) {
    if (methode === FONCTION_ASSOCIEE)
      return [AFFINE, SECOND_DEGRE, HOMOGRAPHIQUE]
    if (methode === QUOTIENT) return [TERMES_POSITIFS]
    return [AFFINE, SECOND_DEGRE, HOMOGRAPHIQUE, TERMES_POSITIFS]
  }

  nouvelleVersion() {
    this.autoCorrection = []
    const melange = Number(this.sup) === MELANGE
    // Chaque question a sa méthode ; les suites tirées sont adaptées à cette méthode.
    const listeMethodes: number[] = melange
      ? combinaisonListes(
          [SIGNE_DIFFERENCE, FONCTION_ASSOCIEE, QUOTIENT],
          this.nbQuestions,
        )
      : new Array(this.nbQuestions).fill(Number(this.sup))
    const listeTypeDeQuestions: number[] = melange
      ? listeMethodes.map((m) => choice(this.typesCompatibles(m)))
      : combinaisonListes(
          this.typesCompatibles(Number(this.sup)),
          this.nbQuestions,
        )
    this.listeQuestions = [] // Vide la liste de questions
    this.listeCorrections = [] // Vide la liste de questions corrigées

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const methode = listeMethodes[i]
      let enonce: string
      let etapes: Etapes
      let alea1: number
      let alea2: number
      switch (listeTypeDeQuestions[i]) {
        case AFFINE: {
          // fonction affine avec Entiers Relatifs (m*x+p)
          const m = randint(1, 99) * choice([-1, 1])
          const p = randint(1, 99) * choice([-1, 1])
          alea1 = m
          alea2 = p
          const expression = `${rienSi1(m)}n${ecritureAlgebrique(p)}`
          enonce = `${INTRO} $u_n =${expression}$.`
          if (methode === FONCTION_ASSOCIEE) {
            const definition = `$f$ la fonction définie sur $[0;+\\infty[$ par $f(x)=${rienSi1(m)}x${ecritureAlgebrique(p)}$`
            etapes = {
              preparation: `Soit ${definition}.`,
              questionIntermediaire: `Soit ${definition}.<br>Étudier le sens de variation de la fonction $f$.`,
              correctionIntermediaire: `$f$ est une fonction affine de coefficient directeur $a=${m}$.<br>Or $a${m > 0 ? '>' : '<'}0$, donc $f$ est ${m > 0 ? 'croissante' : 'décroissante'} sur $[0;+\\infty[$.`,
              correctionFinale: `${deduction(m > 0)}`,
            }
          } else {
            etapes = {
              questionIntermediaire:
                'Exprimer $u_{n+1}-u_n$ en fonction de $n$.',
              correctionIntermediaire: [
                'Soit $n\\in\\mathbb{N}$.',
                `$u_{n+1} - u_n = ${rienSi1(m)}(n+1) ${ecritureAlgebrique(p)}-(${rienSi1(m)}n ${ecritureAlgebrique(p)})$`,
                `$\\phantom{u_{n+1} - u_n} = ${rienSi1(m)}n ${ecritureAlgebrique(m)} ${ecritureAlgebrique(p)} ${ecritureAlgebrique(-m)}n ${ecritureAlgebrique(-p)}$`,
                `$\\phantom{u_{n+1} - u_n} = ${m}$`,
              ].join('<br>'),
              correctionFinale: `$${m}${m > 0 ? '>' : '<'}0$, on en déduit que $u_{n+1} - u_n ${m > 0 ? '>' : '<'}0$, soit $u_{n+1} ${m > 0 ? '>' : '<'} u_n$.<br>${conclusion(m > 0)}`,
            }
          }
          break
        }

        case SECOND_DEGRE: {
          // fonction polynome de degré 2 (a*x²+b*x+c)
          const a = randint(1, 9) * choice([-1, 1])
          const b = randint(0, 50) * choice([-1, 1])
          const c = randint(0, 50) * choice([-1, 1])
          alea1 = a
          alea2 = b
          const polynome = (v: string) =>
            b === 0
              ? `${rienSi1(a)}${v}^2 ${ecritureAlgebrique(c)}`
              : `${rienSi1(a)}${v}^2 ${ecritureAlgebriqueSauf1(b)}${v} ${ecritureAlgebrique(c)}`
          enonce = `${INTRO} $u_n = ${polynome('n')}$.`
          const croissante = a > 0
          if (methode === FONCTION_ASSOCIEE) {
            const alpha = -b / (2 * a)
            const rangP = Math.max(0, Math.ceil(alpha))
            const sommet = new FractionEtendue(-b, 2 * a).texFractionSimplifiee
            const definition = `$f$ la fonction définie sur $[0;+\\infty[$ par $f(x) = ${polynome('x')}$`
            etapes = {
              preparation: `Soit ${definition}.`,
              questionIntermediaire: `Soit ${definition}.<br>Étudier le sens de variation de la fonction $f$.`,
              correctionIntermediaire: [
                'Dans notre situation, $f$ est une fonction polynomiale du second degré.',
                `Pour étudier ses variations, nous calculons $\\alpha = \\dfrac{-b}{2a}$ qui correspond à l'abscisse du sommet de la parabole, soit $\\alpha = ${sommet}$.`,
                a > 0
                  ? `De plus $a = ${a}>0$, la fonction $f$ est donc décroissante sur $]-\\infty;${sommet}[$ et croissante sur $]${sommet};+\\infty[$.`
                  : `De plus $a=${a}<0$, la fonction $f$ est donc croissante sur $]-\\infty;${sommet}[$ et décroissante sur $]${sommet};+\\infty[$.`,
              ].join('<br>'),
              correctionFinale: `${deduction(croissante, rangP)}`,
            }
          } else {
            // u_{n+1} - u_n = 2a n + (a + b)
            const coefficient = 2 * a
            const constante = a + b
            const seuil = -constante / coefficient
            const rangD = Math.max(0, Math.floor(seuil) + 1)
            const fractionSeuil = new FractionEtendue(-constante, coefficient)
              .texFractionSimplifiee
            const difference = lineaire(coefficient, constante)
            const signe = croissante ? '>' : '<'
            etapes = {
              questionIntermediaire:
                'Exprimer $u_{n+1}-u_n$ en fonction de $n$.',
              correctionIntermediaire: [
                'Soit $n\\in\\mathbb{N}$.',
                `$u_{n+1} - u_n = ${polynome('(n+1)')} - (${polynome('n')})$`,
                `$\\phantom{u_{n+1} - u_n} = ${difference}$`,
              ].join('<br>'),
              correctionFinale: [
                `Résolvons l'inéquation.<br>$${difference} ${signe} 0$<br>$\\iff ${lineaire(coefficient, 0)} ${signe} ${-constante}$<br>$\\iff n > ${fractionSeuil}$`,
                `Comme $n$ est un entier, $u_{n+1} - u_n ${signe} 0$, soit $u_{n+1} ${signe} u_n$, ${rangD > 0 ? `pour tout $n \\geqslant ${rangD}$` : 'pour tout $n\\in\\mathbb{N}$'}.`,
                conclusion(croissante, rangD),
              ].join('<br>'),
            }
          }
          break
        }

        case HOMOGRAPHIQUE: {
          // fonction homographique (num_a*x+num_b)/(denom_c*x+denom_d)
          let numA: number, numB: number, denomC: number, denomD: number
          do {
            numA = randint(1, 9)
            numB = randint(1, 9) * choice([-1, 1])
            denomC = randint(1, 9)
            denomD = randint(1, 9) * choice([-1, 1])
          } while (
            numA + numB === 0 ||
            denomD + denomC === 0 ||
            denomD + 2 * denomC === 0 ||
            denomD + 3 * denomC === 0 ||
            denomD + 4 * denomC === 0 ||
            denomD + 5 * denomC === 0 ||
            denomD + 6 * denomC === 0 ||
            denomD + 7 * denomC === 0 ||
            denomD + 8 * denomC === 0 ||
            denomD + 9 * denomC === 0
          )
          alea1 = numA
          alea2 = numB
          const numerateur = (numA + numB) * denomD - numB * (denomC + denomD)
          const rangFacteurs = Math.ceil(-denomD / denomC)
          const rangH = -denomD / denomC > 0 ? rangFacteurs : 0
          // La suite n'est définie qu'à partir du rang où le dénominateur est positif
          const condN =
            rangH > 0 ? `$n \\geqslant ${rangH}$` : '$n\\in\\mathbb{N}$'
          enonce = `${INTRO.replace('$n\\in\\mathbb{N}$', condN)} $u_n = \\dfrac{${lineaire(numA, numB)}}{${lineaire(denomC, denomD)}}$.`
          const croissante = numerateur >= 0
          const constante = numA * denomD === numB * denomC
          const dC = denomD + denomC
          // Résolution de denomC*n + k > 0 (denomC > 0)
          const resoudre = (k: number) =>
            `$${rienSi1(denomC)}n ${ecritureAlgebrique(k)} > 0$<br>$\\iff ${rienSi1(denomC)}n > ${-k}$<br>$\\iff n > ${new FractionEtendue(-k, denomC).texFractionSimplifiee}$`
          const simplification = [
            `On remarque que $u_n = \\dfrac{${numA}}{${denomC}} \\times \\dfrac{n ${ecritureAlgebrique(fraction(numB, numA))}}{n ${ecritureAlgebrique(fraction(denomD, denomC))}}$`,
            `$u_n = ${new FractionEtendue(numA, denomC).texFractionSimplifiee} \\times \\dfrac{n ${ecritureAlgebrique(fraction(numB, numA).simplifie())}}{n ${ecritureAlgebrique(fraction(denomD, denomC).simplifie())}}$`,
            `Alors $u_n = ${new FractionEtendue(numA, denomC).texFractionSimplifiee}$`,
          ].join('<br>')
          const fonction = `${rienSi1(numA)}x ${ecritureAlgebrique(numB)}`
          const denominateur = `${rienSi1(denomC)}x ${ecritureAlgebrique(denomD)}`
          const domaineTex = rangH > 0 ? `[${rangH};+\\infty[` : '[0;+\\infty['
          const domaine = `$${domaineTex}$`
          const definition = `$f$ la fonction définie sur ${domaine} par $f(x)=\\dfrac{${fonction}}{${denominateur}}$`

          if (methode === FONCTION_ASSOCIEE) {
            etapes = {
              preparation: `Soit ${definition}.`,
              questionIntermediaire: `Soit ${definition}.<br>Étudier le sens de variation de la fonction $f$.`,
              correctionIntermediaire: constante
                ? `${simplification}<br>La fonction $f$ est constante.`
                : [
                    `$f$ est dérivable sur ${domaine} et, pour tout $x$ de cet intervalle,`,
                    `$f'(x)=\\dfrac{${rienSi1(numA)}(${denominateur}) - ${rienSi1(denomC)}(${fonction})}{(${denominateur})^2}=\\dfrac{${numerateur}}{(${denominateur})^2}$.`,
                    `Pour tout $x\\in${domaineTex}$, $(${denominateur})^2>0$, donc $f'(x)$ est du signe de $${numerateur}$.`,
                    `$${numerateur}${croissante ? '>' : '<'}0$ donc $f'(x)${croissante ? '>' : '<'}0$ et $f$ est ${croissante ? 'croissante' : 'décroissante'} sur ${domaine}.`,
                  ].join('<br>'),
              correctionFinale: constante
                ? 'La suite $(u_n)$ est constante sur $\\mathbb{N}$.'
                : `${deduction(croissante, rangH, rangH > 0)}`,
            }
          } else {
            const calcul: string[] = []
            if (constante) {
              calcul.push(simplification, 'Donc $u_{n+1}-u_n=0$.')
            } else {
              calcul.push(
                `Soit ${condN}.`,
                `$u_{n+1} - u_n = \\dfrac{${rienSi1(numA)}(n+1) ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}(n+1) ${ecritureAlgebrique(denomD)}} - \\dfrac{${lineaire(numA, numB)}}{${lineaire(denomC, denomD)}}$`,
                `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numA)} ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomC)} ${ecritureAlgebrique(denomD)}} - \\dfrac{${lineaire(numA, numB)}}{${lineaire(denomC, denomD)}}$`,
              )
              if (denomC + denomD === 0) {
                calcul.push(
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)}}{${rienSi1(denomC)}n} - \\dfrac{${lineaire(numA, numB)}}{${lineaire(denomC, denomD)}}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)})(${lineaire(denomC, denomD)})-(${lineaire(numA, numB)})${denomC > 0 ? rienSi1(denomC) + 'n' : `(${rienSi1(denomC)}n)`}}{${rienSi1(denomC)}n (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD)}n ${ecritureAlgebrique((numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numB * denomC)}n)}{${rienSi1(denomC)}n (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD + (numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numB * denomC)}n)}{${rienSi1(denomC)}n (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{${(numA + numB) * denomD}}{${rienSi1(denomC)}n (${lineaire(denomC, denomD)})}$`,
                )
              } else {
                calcul.push(
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}} - \\dfrac{${lineaire(numA, numB)}}{${lineaire(denomC, denomD)}}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)})(${lineaire(denomC, denomD)})-(${lineaire(numA, numB)})(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD)}n ${ecritureAlgebrique((numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * (denomC + denomD))}n ${ecritureAlgebrique(numB * denomC)}n ${ecritureAlgebrique(numB * (denomC + denomD))})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD + (numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * (denomC + denomD) + numB * denomC)}n ${ecritureAlgebrique(numB * (denomC + denomD))})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{${(numA + numB) * denomD} ${ecritureAlgebrique(-numB * (denomC + denomD))}}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${lineaire(denomC, denomD)})}$`,
                  `$\\phantom{u_{n+1} - u_n} = \\dfrac{${numerateur}}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${lineaire(denomC, denomD)})}$`,
                )
              }
            }
            // Signe des deux facteurs du dénominateur
            const signes: string[] = []
            if (!constante) {
              if (dC > 0 && denomD > 0) {
                signes.push(
                  `Comme ${condN}, $${rienSi1(denomC)}n ${ecritureAlgebrique(dC)}>0$ et $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`,
                )
              } else if (dC > 0 || denomD > 0) {
                signes.push(
                  dC > 0
                    ? `Comme ${condN}, $${rienSi1(denomC)}n ${ecritureAlgebrique(dC)}>0$.`
                    : `Résolvons l'inéquation.<br>${resoudre(dC)}<br>Comme $n$ est un entier, on a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(dC)}>0$ pour tout $n \\geqslant ${rangFacteurs}$.`,
                  denomD > 0
                    ? `Comme ${condN}, $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`
                    : `Résolvons l'inéquation.<br>${resoudre(denomD)}<br>Comme $n$ est un entier, on a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$ pour tout $n \\geqslant ${rangFacteurs}$.`,
                )
              } else {
                signes.push(
                  `Résolvons les inéquations.<br>${resoudre(dC)}<br>${resoudre(denomD)}`,
                  `Comme $n$ est un entier, on a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(dC)}>0$ et $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$ pour tout $n \\geqslant ${rangFacteurs}$.`,
                )
              }
              signes.push(`De plus : $${numerateur}${croissante ? '>' : '<'}0$`)
              signes.push(
                rangH > 0
                  ? `On peut alors en déduire que $u_{n+1}-u_n ${croissante ? '>' : '<'} 0$ pour tout $n \\geqslant ${texNombre(rangH)}$.<br>`
                  : `On peut alors en déduire que $u_{n+1}-u_n ${croissante ? '>' : '<'} 0$, soit $u_{n+1} ${croissante ? '>' : '<'} u_n$ pour tout $n\\in\\mathbb{N}$.`,
              )
              signes.push(conclusion(croissante, rangH, rangH > 0))
            } else {
              signes.push('La suite $(u_n)$ est constante sur $\\mathbb{N}$.')
            }
            etapes = {
              questionIntermediaire:
                'Exprimer $u_{n+1}-u_n$ en fonction de $n$.',
              correctionIntermediaire: calcul.join('<br><br>'),
              correctionFinale: signes.join('<br>'),
            }
          }
          break
        }

        default: {
          // suites à termes strictement positifs
          if (randint(1, 2) === 1) {
            // u_n = k * a^n
            const k = randint(1, 9)
            const a = choice([2, 3, 4, 5, 0.5, 0.2, 0.8, 1.5, 1.2, 0.3])
            alea1 = k
            alea2 = a
            const K = k === 1 ? '' : `${k}\\times `
            const A = texNombre(a)
            const croissante = a > 1
            enonce = `${INTRO} $u_n = ${K}${A}^n$.`
            const positifs = `$${K}${A}^n>0$ pour tout $n\\in\\mathbb{N}$`
            if (methode === QUOTIENT) {
              etapes = {
                questionIntermediaire:
                  'Exprimer $\\dfrac{u_{n+1}}{u_n}$ en fonction de $n$, pour $n\\in\\mathbb{N}$.',
                correctionIntermediaire: `${positifs}.<br>Soit $n\\in\\mathbb{N}$.<br>$\\dfrac{u_{n+1}}{u_n}=\\dfrac{${K}${A}^{n+1}}{${K}${A}^{n}}=${A}$`,
                correctionFinale: `$${A}${croissante ? '>' : '<'}1$, donc $\\dfrac{u_{n+1}}{u_n}${croissante ? '>' : '<'}1$. Comme $u_n>0$ pour tout $n\\in\\mathbb{N}$, on en déduit que $u_{n+1} ${croissante ? '>' : '<'} u_n$.<br>${conclusion(croissante)}`,
              }
            } else {
              etapes = {
                questionIntermediaire:
                  'Exprimer $u_{n+1}-u_n$ en fonction de $n$.',
                correctionIntermediaire: `Soit $n\\in\\mathbb{N}$.<br>$u_{n+1}-u_n = ${K}${A}^{n+1} - ${K}${A}^{n} = ${K}${A}^{n}\\times(${A}-1)$`,
                correctionFinale: `${positifs}, donc $u_{n+1}-u_n$ est du signe de $${A}-1$.<br>$${A}-1${croissante ? '>' : '<'}0$, donc $u_{n+1}-u_n${croissante ? '>' : '<'}0$.<br>${conclusion(croissante)}`,
              }
            }
          } else {
            // u_n = (n+1) / b^n
            const b = randint(3, 6)
            alea1 = 0
            alea2 = b
            enonce = `${INTRO} $u_n = \\dfrac{n+1}{${b}^n}$.`
            if (methode === QUOTIENT) {
              etapes = {
                questionIntermediaire:
                  'Exprimer $\\dfrac{u_{n+1}}{u_n}$ en fonction de $n$, pour $n\\in\\mathbb{N}$.',
                correctionIntermediaire: `Soit $n\\in\\mathbb{N}$.<br>$\\dfrac{u_{n+1}}{u_n}=\\dfrac{n+2}{${b}^{n+1}}\\times\\dfrac{${b}^{n}}{n+1}=\\dfrac{n+2}{${b}(n+1)}$`,
                correctionFinale: `Soit $n\\in\\mathbb{N}$.<br>$\\dfrac{n+2}{${b}(n+1)} < 1$<br>$\\iff n+2 < ${b}(n+1)$<br>$\\iff n+2 < ${b}n + ${b}$<br>$\\iff n - ${b}n < ${b} - 2$<br>$\\iff ${-(b - 1)}n < ${b - 2}$<br>$\\iff n > ${new FractionEtendue(-(b - 2), b - 1).texFractionSimplifiee}$<br>Donc, pour tout $n\\in\\mathbb{N}$, $\\dfrac{u_{n+1}}{u_n}<1$.<br>Comme $u_n>0$ pour tout $n\\in\\mathbb{N}$, on en déduit que $u_{n+1} < u_n$.<br>${conclusion(false)}`,
              }
            } else {
              etapes = {
                questionIntermediaire:
                  'Exprimer $u_{n+1}-u_n$ en fonction de $n$.',
                correctionIntermediaire: `Soit $n\\in\\mathbb{N}$.<br>$u_{n+1}-u_n=\\dfrac{n+2}{${b}^{n+1}}-\\dfrac{n+1}{${b}^{n}}=\\dfrac{n+2}{${b}^{n+1}}-\\dfrac{${b}(n+1)}{${b}^{n+1}}=\\dfrac{${-(b - 1)}n${ecritureAlgebrique(-(b - 2))}}{${b}^{n+1}}$`,
                correctionFinale: `Soit $n\\in\\mathbb{N}$, $${b}^{n+1}>0$ et $${-(b - 1)}n${ecritureAlgebrique(-(b - 2))}<0$.<br>Donc $u_{n+1}-u_n<0$, soit $u_{n+1} < u_n$.<br>${conclusion(false)}`,
              }
            }
          }
          break
        }
      }

      if (this.questionJamaisPosee(i, alea1, alea2)) {
        // Si la question n'a jamais été posée, on la crée
        const consigne = `Étudier le sens de variation de la suite $(u_n)$.`
        if (this.sup2) {
          createQuestion(this, i, {
            question: enonce,
            subQuestions: [
              {
                question: etapes.questionIntermediaire,
                correction: etapes.correctionIntermediaire,
              },
              {
                question: `En déduire le sens de variation de la suite $(u_n)$.`,
                correction: etapes.correctionFinale,
              },
            ],
          })
        } else {
          createQuestion(this, i, {
            question: `${enonce}<br><br>${consigne}`,
            correction: [
              etapes.preparation,
              etapes.correctionIntermediaire,
              etapes.correctionFinale,
            ]
              .filter((partie) => partie != null)
              .join('<br>'),
          })
        }
        i++ // On passe à la question suivante
      }
    }
    listeQuestionsToContenu(this)
  }
}
