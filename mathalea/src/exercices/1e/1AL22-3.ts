import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { boutonReponsePredefinie } from '../../lib/interactif/boutonReponsePredefinie'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choisiDelta } from '../../lib/mathFonctions/outilsMaths'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { pgcd } from '../../lib/outils/primalite'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true
//
export const titre = 'Factoriser un polynôme du second degré'

/**
 * Factoriser, si possible, un polynôme du second degré
 * On utilise un calcul intérmédiaire de discriminant
 * @author Stéphane Guyon

 */
export const uuid = '334ca'

export const refs = {
  'fr-fr': ['1AL22-3'],
  'fr-ch': [''], // OK?
}
/**
 * Écritures de la racine (B + t√m)/D (D > 0, t ≠ 0, m sans facteur carré) :
 * `racine` est la racine elle-même, `facteur` ce qui suit le x dans le
 * facteur (x - racine).
 */
function racineTex(
  B: number,
  t: number,
  m: number,
  D: number,
): { racine: string; facteur: string } {
  const radical = (coef: number) => `${rienSi1(coef)}\\sqrt{${m}}`
  if (D === 1) {
    // pas de trait de fraction : le facteur est x - B - t√m
    const terme = (n: number, debut: boolean) =>
      `${n < 0 ? '-' : debut ? '' : '+'}${radical(Math.abs(n))}`
    const racine =
      B === 0
        ? terme(t, true)
        : B > 0 || t < 0
          ? `${B}${terme(t, false)}`
          : `${terme(t, true)}${B}`
    const facteur = `${B === 0 ? '' : ecritureAlgebrique(-B)}${terme(-t, false)}`
    return { racine, facteur }
  }
  // numérateur écrit sans signe en tête, le signe passe devant la fraction
  const negatif = B <= 0 && t < 0
  const numerateur =
    B === 0
      ? radical(Math.abs(t))
      : negatif
        ? `${-B}+${radical(-t)}`
        : B > 0
          ? `${B}${t < 0 ? '-' : '+'}${radical(Math.abs(t))}`
          : `${radical(t)}-${-B}`
  const fraction = `\\dfrac{${numerateur}}{${D}}`
  return {
    racine: `${negatif ? '-' : ''}${fraction}`,
    facteur: `${negatif ? '+' : '-'}${fraction}`,
  }
}

export default class Resolutionavecformecanonique extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.spacingCorr = 1.5
    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne =
      'Factoriser sur $\\mathbb{R}$, si cela est possible, ' +
      (this.nbQuestions !== 1 ? 'chaque' : 'le') +
      ` polynôme suivant de degré $2$${sp()}: `
    if (this.interactif) {
      this.consigne += '<br> '
    }
    const listeTypeDeQuestions = combinaisonListes(
      [true, true, false],
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte,
        texteCorr,
        a,
        b,
        b2,
        x1String,
        x2String,
        stringX1,
        stringX2,
        x1,
        x2,
        c,
        delta,
        alpha,
        reponse = '',
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      ;[a, b, c] = choisiDelta(listeTypeDeQuestions[i])
      alpha = fraction(-b, 2 * a)
      delta = b * b - 4 * a * c
      b2 = fraction(delta, 4 * a * a).simplifie() // terme b² dans l'expression a²-b²
      texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`
      texteCorr = `Factoriser sur $\\mathbb{R}$, si cela est possible${sp()}: $${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
      texteCorr +=
        '<br>On reconnaît un polynôme du second degré sous la forme $ax^2+bx+c$.'
      texteCorr += '<br>On cherche les éventuelles racine(s) du polynôme.'
      texteCorr +=
        `<br>On commence par calculer le discriminant${sp()}: $\\Delta = b^2-4ac$.`
      texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4 \\times ${ecritureParentheseSiNegatif(a)} \\times ${ecritureParentheseSiNegatif(c)}=${delta}$`

      // test des solutions
      if (delta < 0) {
        texteCorr +=
          "<br>Le discriminant étant négatif, d'après le cours, le polynôme n'admet aucune racine réelle."
        texteCorr += `<br>On en déduit que le polynôme ${texteEnCouleurEtGras("n'est pas factorisable")} sur $\\mathbb{R}$.`
      } else if (delta > 0) {
        // Cas des deux solutions :
        texteCorr +=
          `<br>Le discriminant étant positif, d'après le cours, le polynôme admet deux racines réelles${sp()}:`
        texteCorr +=
          '<br>$x_1=\\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2=\\dfrac{-b+\\sqrt{\\Delta}}{2a}$'
        texteCorr += `<br>$x_1=\\dfrac{-${ecritureParentheseSiNegatif(b)}-\\sqrt{${delta}}}{2\\times${ecritureParentheseSiNegatif(a)}}$ et $x_2=\\dfrac{-${ecritureParentheseSiNegatif(b)}+\\sqrt{${delta}}}{2\\times${ecritureParentheseSiNegatif(a)}}$.`
        if (b2.estParfaite) {
          // pas de radical, calcul rationnel
          const racine = (b2.racineCarree() as FractionEtendue).simplifie()
          if (a < 0) {
            x2 = alpha.simplifie().sommeFraction(racine.oppose()).simplifie()
            x1 = alpha.simplifie().sommeFraction(racine).simplifie()
          } else {
            x1 = alpha.simplifie().sommeFraction(racine.oppose()).simplifie()
            x2 = alpha.simplifie().sommeFraction(racine).simplifie()
          }
          // if (a < 0) {
          x1String = x1.oppose().ecritureAlgebrique
          stringX1 = x1.texFractionSimplifiee
          x2String = x2.oppose().ecritureAlgebrique
          stringX2 = x2.texFractionSimplifiee
          /*  } else {
              x1String = x1.ecritureAlgebrique
              stringX1 = x1.oppose().texFractionSimplifiee
              x2String = x2.ecritureAlgebrique
              stringX2 = x2.oppose().texFractionSimplifiee
            } */
        } else {
          // présence d'un radical : x1 et x2 s'écrivent (B ∓ K√m)/D avec D > 0,
          // après simplification par le PGCD de b, de k (Δ = k²m) et de 2a
          const [k, m] = extraireRacineCarree(delta)
          const g = pgcd(pgcd(Math.abs(b), k), Math.abs(2 * a))
          const signeA = a < 0 ? -1 : 1
          const B = (-b * signeA) / g
          const K = (k * signeA) / g
          const D = Math.abs(2 * a) / g
          const ecritures = [-K, K].map((t) => racineTex(B, t, m, D))
          ;[stringX1, stringX2] = ecritures.map((e) => e.racine)
          ;[x1String, x2String] = ecritures.map((e) => e.facteur)
        }
        texteCorr += `<br> Après simplification, on obtient${sp()}: $x_1= ${stringX1}$ et  $x_2=${stringX2}$.` // Solution
        texteCorr +=
          `<br> D'après le cours, on sait que le polynôme se factorise alors sous la forme${sp()}: $a(x-x_1)(x-x_2)$`
        // x1String et x2String contiennent ce qui suit le x dans chaque facteur,
        // que les racines soient rationnelles ou irrationnelles, avec ou sans dénominateur.
        reponse = `${rienSi1(a)}\\left(x ${x1String}\\right)\\left(x ${x2String}\\right)`
        texteCorr += `<br> Finalement, $${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=${miseEnEvidence(reponse)}$.`
      }

      if (delta < 0) {
        reponse = '\\text{Pas factorisable}'
        handleAnswers(this, i, { reponse: { value: reponse } })
      } else {
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { factorisation: true } },
        })
      }

      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
        delta < 0 ? {} : { texteAvant: ' $=$' },
      )
      if (this.interactif) {
        texte += boutonReponsePredefinie({
          numeroExercice: this.numeroExercice,
          indiceQuestion: i,
          label: 'Pas factorisable',
        })
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
