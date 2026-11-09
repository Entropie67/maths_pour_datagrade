import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import type { IExercice } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Démontrer que deux nombres sont premiers entre eux avec le théorème de Bézout'
export const interactifReady = true

export const dateDePublication = '12/09/2026'
export const uuid = '7b65e'

export const refs = {
  'fr-fr': ['TEA2-03'],
  'fr-ch': [],
}
/**
 * @author Arnaud Meistermann
 */

// renvoie [g, u, v] tels que a*u + c*v = g = pgcd(a,c)
function pgcdEtendu(a: number, c: number): [number, number, number] {
  if (c === 0) return [a, 1, 0]
  const [g, u1, v1] = pgcdEtendu(c, a % c)
  return [g, v1, u1 - Math.floor(a / c) * v1]
}

// Génère a=pn+q et b=rn+s tels que r*a-p*b=1, donc a et b premiers entre eux pour tout n
function genererCoprimalite() {
  let p: number, r: number, g: number, x: number
  do {
    p = randint(3, 12)
    r = randint(3, 12)
    ;[g, x] = pgcdEtendu(r, p)
  } while (p === r || g !== 1)

  const q = ((x % p) + p) % p
  const s = (r * q - 1) / p

  return { p, q, r, s }
}

export default class ExerciceCoprimaliteBezout extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { p, q, r, s } = genererCoprimalite()
      const expA = reduireAxPlusB(p, q, 'n')
      const expB = reduireAxPlusB(r, s, 'n')

      let texte = `Soit $n\\in\\mathbb{Z}$, on pose $a=${expA}$ et $b=${expB}$.<br> Démontrer, à l'aide du théorème de Bézout, que $a$ et $b$ sont premiers entre eux, $\\forall n\\in\\mathbb{Z}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            `%{champ1}\\times(${expA})+%{champ2}\\times(${expB})=%{champ3}`,
            KeyboardType.clavierNumbers,
          ) +
          `<br>Donc, d'après le théorème de Bézout, $a$ et $b$ sont premiers entre eux.`
      }

      let texteCorr =
        'On rappelle le théorème de Bézout : deux entiers relatifs $a$ et $b$ sont premiers entre eux si, et seulement si, il existe deux entiers relatifs $u$ et $v$ tels que $au+bv=1$.<br><br>'
      texteCorr += `Il suffit donc de trouver un couple d'entiers relatifs $u$ et $v$ tel que $au+bv=1$.<br>`
      texteCorr += `Calculons $${r}a-${p}b$ :<br>`

      const lignesCalcul = [
        `${r}a-${p}b&=${r}(${expA})-${p}(${expB})`,
        `&=${r * p}n${ecritureAlgebrique(r * q)}${ecritureAlgebrique(-p * r)}n${ecritureAlgebriqueSauf0(-p * s)}`,
        `&=${r * q}${ecritureAlgebrique(-p * s)}`,
        `&=${miseEnEvidence('1')}`,
      ]
      texteCorr += `$\\begin{aligned}
${lignesCalcul.join('\\\\\n')}
\\end{aligned}$<br>`

      texteCorr += `Ainsi, avec $u=${r}$ et $v=${ecritureAlgebrique(-p)}$, on a $au+bv=1$.<br>`
      texteCorr += `D'après le théorème de Bézout, $a$ et $b$ sont ${texteEnCouleurEtGras('premiers entre eux')}, quel que soit l'entier relatif $n$.`

      if (this.questionJamaisPosee(i, p, r)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(
          this,
          i,
          {
            // Valeurs de référence : état par défaut des champs et corrigé non interactif.
            champ1: { value: String(r) },
            champ2: { value: String(-p) },
            champ3: { value: '1' },
            // Vérification personnalisée : les coefficients de Bézout ne sont pas
            // uniques, donc on n'exige pas le couple (u ; v) du corrigé. On relit
            // les trois champs et on vérifie que u×a+v×b=1 est bien une identité
            // valable pour tout n, c'est-à-dire que le terme en n s'annule
            // (u×p+v×r=0) et que le terme constant vaut 1 (u×q+v×s=1).
            callback: (exercice: IExercice, question: number) => {
              const scoreVide = { nbBonnesReponses: 0, nbReponses: 0 }
              const mfe = document.querySelector(
                `#champTexteEx${exercice.numeroExercice}Q${question}`,
              ) as MathfieldElement | null
              if (mfe == null) {
                return { isOk: false, feedback: '', score: scoreVide }
              }

              const lireEntier = (nom: string): number | null => {
                const brut = (mfe.getPromptValue(nom) ?? '')
                  .replaceAll('\\,', '')
                  .replaceAll(' ', '')
                if (brut === '') return null
                return /^-?\d+$/.test(brut) ? Number(brut) : Number.NaN
              }

              const u = lireEntier('champ1')
              const v = lireEntier('champ2')
              const k = lireEntier('champ3')
              const champManquant = u == null || v == null || k == null

              const uu = u ?? Number.NaN
              const vv = v ?? Number.NaN
              const kk = k ?? Number.NaN

              const coefNNul = uu * p + vv * r === 0
              const resultatUnite = kk === 1
              const constanteOk = uu * q + vv * s === kk
              const champ3Ok = resultatUnite && constanteOk
              const isOk = !champManquant && coefNNul && champ3Ok

              mfe.setPromptState(
                'champ1',
                coefNNul ? 'correct' : 'incorrect',
                true,
              )
              mfe.setPromptState(
                'champ2',
                coefNNul ? 'correct' : 'incorrect',
                true,
              )
              mfe.setPromptState(
                'champ3',
                champ3Ok ? 'correct' : 'incorrect',
                true,
              )

              let feedback = ''
              if (champManquant) {
                feedback = 'Il faut compléter les trois zones de saisie.'
              } else if (!coefNNul) {
                feedback =
                  "Le terme en $n$ ne s'annule pas : cette égalité n'est donc pas valable pour tout entier relatif $n$."
              } else if (!resultatUnite) {
                feedback = 'Le résultat doit être égal à $1$.'
              } else if (!constanteOk) {
                feedback = "Cette égalité n'est pas vérifiée."
              }

              const spanReponseLigne = document.querySelector(
                `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
              )
              if (spanReponseLigne != null) {
                spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
              }

              return {
                isOk,
                feedback,
                score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
              }
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
