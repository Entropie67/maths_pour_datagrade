import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ecritureAlgebrique,
  ecritureParentheseSiMoins,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer deux entiers $u$ et $v$ tels que $au+bv=c$'
export const interactifReady = true

export const dateDePublication = '11/09/2026'
/**
 * @author Arnaud Meistermann
 */
export const uuid = '38023'

export const refs = {
  'fr-fr': ['TEA2-02'],
  'fr-ch': [],
}

type DivisionEuclidienne = {
  dividende: number
  diviseur: number
  quotient: number
  reste: number
}

/**
 * Déroule l'algorithme d'Euclide (descente) : a = b*q0+r0, b = r0*q1+r1, ...
 * jusqu'à un reste nul.
 */
function etapesEuclide(a: number, b: number): DivisionEuclidienne[] {
  const etapes: DivisionEuclidienne[] = []
  let dividende = a
  let diviseur = b
  while (diviseur !== 0) {
    const quotient = Math.floor(dividende / diviseur)
    const reste = dividende - quotient * diviseur
    etapes.push({ dividende, diviseur, quotient, reste })
    dividende = diviseur
    diviseur = reste
  }
  return etapes
}

/**
 * Écrit un terme "coef × valeur" en notation algébrique :
 * coefficient 1/-1 réduit au seul signe, coefficient nul omis.
 */
function texTerme(coef: number, valeur: string): string {
  if (coef === 0) return ''
  if (coef === 1) return `+${valeur}`
  if (coef === -1) return `-${valeur}`
  return `${ecritureAlgebrique(coef)} \\times ${valeur}`
}

/** Assemble deux termes "coefA×valA + coefB×valB" sans + initial parasite. */
function texCombinaison(
  coefA: number,
  valA: string,
  coefB: number,
  valB: string,
): string {
  const t1 = texTerme(coefA, valA)
  const t2 = texTerme(coefB, valB)
  if (t1 === '') return t2.startsWith('+') ? t2.slice(1) : t2
  if (t2 === '') return t1.startsWith('+') ? t1.slice(1) : t1
  return (t1.startsWith('+') ? t1.slice(1) : t1) + t2
}

function ligneDivision(e: DivisionEuclidienne): string {
  return e.reste === 0
    ? `$${e.dividende} = ${e.diviseur} \\times ${e.quotient}$`
    : `$${e.dividende} = ${e.diviseur} \\times ${e.quotient} + ${e.reste}$`
}

type ResultatBezout = {
  etapes: DivisionEuclidienne[]
  gcd: number
  u: number
  v: number
  lignesRemontee: string[]
}

/**
 * Calcule pgcd(a,b) ainsi qu'un couple (u,v) tel que a*u+b*v=pgcd(a,b), en
 * générant au passage le détail texte de la remontée de l'algorithme d'Euclide.
 * Renvoie null si b divise a directement (pas de remontée à rédiger).
 */
function calculerBezout(a: number, b: number): ResultatBezout | null {
  const etapes = etapesEuclide(a, b)
  if (etapes.length < 2) return null

  const restes = [a, b, ...etapes.map((e) => e.reste)]
  const idxPgcd = etapes.length
  const gcd = restes[idxPgcd]

  const lignesRemontee: string[] = []
  let p = idxPgcd - 2
  let alpha = 1
  let beta = -etapes[p].quotient
  lignesRemontee.push(
    `$${gcd} = ${texCombinaison(
      alpha,
      `${etapes[p].dividende}`,
      beta,
      `${etapes[p].diviseur}`,
    )}$`,
  )

  while (p > 0) {
    const q = etapes[p - 1].quotient
    const prevDividende = etapes[p - 1].dividende
    const prevDiviseur = etapes[p - 1].diviseur

    const substitution = texCombinaison(
      1,
      `${prevDividende}`,
      -q,
      `${prevDiviseur}`,
    )
    lignesRemontee.push(
      `$\\phantom{${gcd}} = ${texCombinaison(
        alpha,
        `${prevDiviseur}`,
        beta,
        `(${substitution})`,
      )}$`,
    )

    const nouvelAlpha = beta
    const nouveauBeta = alpha - beta * q
    lignesRemontee.push(
      `$\\phantom{${gcd}} = ${texCombinaison(
        nouvelAlpha,
        `${prevDividende}`,
        nouveauBeta,
        `${prevDiviseur}`,
      )}$`,
    )

    alpha = nouvelAlpha
    beta = nouveauBeta
    p--
  }

  return { etapes, gcd, u: alpha, v: beta, lignesRemontee }
}

/** Rédige la partie commune de la correction : descente puis remontée. */
function texteEuclideEtRemontee(
  a: number,
  b: number,
  { etapes, gcd, lignesRemontee }: ResultatBezout,
): string {
  let texteCorr = `On applique l'algorithme d'Euclide pour calculer $PGCD(${a}~;~${b})$ :<br>`
  texteCorr += etapes.map((e) => ligneDivision(e)).join('<br>')
  texteCorr += `<br>Le dernier reste non nul est $${gcd}$, donc $PGCD(${a}~;~${b})=${gcd}$.<br><br>`
  texteCorr += `On remonte ensuite l'algorithme d'Euclide pour exprimer $${gcd}$ comme combinaison de $${a}$ et $${b}$ :<br>`
  texteCorr += lignesRemontee.join('<br>')
  return texteCorr
}

function ajouteChampsUV(exercice: Exercice, i: number): string {
  if (!exercice.interactif) return ''
  return (
    '<br>' +
    addMultiMathfield(exercice, i, {
      dataTemplate: `$u=$ %{champ1} $\\quad$ et $\\quad v=$ %{champ2}`,
      dataOptions: {
        champ1: { keyboard: KeyboardType.clavierDeBase },
        champ2: { keyboard: KeyboardType.clavierDeBase },
      },
    })
  )
}

export default class ExerciceBezout extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.nbQuestionsModifiable = true
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : $au+bv=PGCD(a,b)$\n2 : $au+bv=k\\times PGCD(a,b)$\n3 : Mélange',
    ]
    this.sup = '3'
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(25, 100)
      const b = randint(18, a - 1)
      // On simplifie d'abord par PGCD(a,b) : l'algorithme d'Euclide porte
      // alors sur des nombres plus petits (36u+30v=6 <=> 6u+5v=1).
      const d = pgcd(a, b)
      const aReduit = a / d
      const bReduit = b / d
      const resultat = calculerBezout(aReduit, bReduit)

      // bReduit divise aReduit directement : pas de remontée à rédiger, on retire.
      if (resultat == null) {
        cpt++
        continue
      }

      const introSimplification =
        d > 1
          ? `Remarquons que l'on peut simplifier l'équation en divisant par $${d}$ :<br>$${aReduit}u${ecritureAlgebrique(bReduit)}v=`
          : ''

      let texte = ''
      let texteCorr = ''
      let u = 0
      let v = 0

      if (listeDeQuestions[i] === 1) {
        const c = d
        u = resultat.u
        v = resultat.v
        texte = `Déterminer un couple d'entiers $u$ et $v$ tel que $${a}u${ecritureAlgebrique(b)}v=${c}$.`

        texteCorr = d > 1 ? `${introSimplification}1$<br><br>` : ''
        texteCorr += texteEuclideEtRemontee(aReduit, bReduit, resultat)
        if (d > 1) {
          texteCorr += `<br><br>On a donc $${aReduit}\\times${ecritureParentheseSiMoins(u)} + ${bReduit}\\times${ecritureParentheseSiMoins(v)}=1$.<br>`
          texteCorr += `En multipliant cette égalité par $${d}$, on obtient :<br>`
          texteCorr += `$${a}\\times${ecritureParentheseSiMoins(u)} + ${b}\\times${ecritureParentheseSiMoins(v)}=${c}$<br>`
        }
        texteCorr += `<br>Donc $u = ${miseEnEvidence(u)}$ et $v = ${miseEnEvidence(v)}$ conviennent. On dit que $u$ et $v$ sont des coefficients de Bézout de $${a}$ et $${b}$.`
      } else {
        const { u: u0, v: v0 } = resultat
        const k = randint(2, 6)
        const c = k * d
        u = k * u0
        v = k * v0

        texte = `Déterminer un couple d'entiers $u$ et $v$ tels que $${a}u${ecritureAlgebrique(b)}v=${c}$.`

        texteCorr = d > 1 ? `${introSimplification}${k}$<br><br>` : ''
        texteCorr += texteEuclideEtRemontee(aReduit, bReduit, resultat)
        texteCorr += `<br><br>On a donc $${aReduit}\\times${ecritureParentheseSiMoins(u0)} + ${bReduit}\\times${ecritureParentheseSiMoins(v0)}=1$.<br>`
        texteCorr += `En multipliant cette égalité par $${d * k}$, on obtient :<br>`
        texteCorr += `$${a}\\times${ecritureParentheseSiMoins(u)} + ${b}\\times${ecritureParentheseSiMoins(v)}=${c}$<br>`
        texteCorr += `Donc $u = ${miseEnEvidence(u)}$ et $v = ${miseEnEvidence(v)}$ conviennent.`
      }

      const cleUnicite = `${listeDeQuestions[i]}-${a}-${b}`
      if (this.questionJamaisPosee(i, cleUnicite)) {
        this.listeQuestions[i] = texte + ajouteChampsUV(this, i)
        this.listeCorrections[i] = texteCorr

        handleAnswers(
          this,
          i,
          {
            champ1: { value: `${u}` },
            champ2: { value: `${v}` },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
