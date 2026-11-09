import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  estPremier,
  factorisation,
  listeDesDiviseurs,
  pgcd,
  ppcm,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import {
  compareDecomposition,
  couleursFacteurs,
  texEchelleDeDivisions,
  texFacto,
  texListeDiviseurs,
  texRechercheDesDiviseurs,
  tirerNombre,
} from './PEA11'

export const titre =
  'Déterminer un PGCD et un PPCM à partir des décompositions en produit de facteurs premiers'
export const interactifReady = true
export const dateDePublication = '25/09/2026'
export const uuid = 'a92bf'
export const refs = {
  'fr-fr': ['PEA12'],
  'fr-ch': ['9R2NO1H-2', '9R3NO1H-2', '10CTNO1B-2', 'PRQNO09C-4'],
}

/**
 * Décomposer deux nombres en produit de facteurs premiers puis en déduire leur PGCD, leur PPCM et leurs diviseurs communs
 * @author Rémi Angot
 */
export default class PgcdPpcmDecomposition extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    let n = 1
    let m = 1
    let factoN: [number, number][] = []
    let factoM: [number, number][] = []
    for (let cpt = 0; cpt < 200; cpt++) {
      n = tirerNombre()
      m = tirerNombre()
      if (n < m) [n, m] = [m, n]
      factoN = factorisation(n)
      factoM = factorisation(m)
      if (conditionsRespectees(n, m, factoN, factoM)) break
    }
    const texN = texNombre(n, 0)
    const texM = texNombre(m, 0)
    const texCouple = `(${texN}\\text{ ; }${texM})`
    const exposantDans = (facto: [number, number][], p: number) =>
      facto.find(([q]) => q === p)?.[1] ?? 0
    const premiersN = factoN.map(([p]) => p)
    const premiersM = factoM.map(([p]) => p)
    const premiersCommuns = premiersN.filter((p) => premiersM.includes(p))
    const tousLesPremiers = [...new Set([...premiersN, ...premiersM])].sort(
      (a, b) => a - b,
    )
    const couleursCommuns: Record<number, string> = {}
    for (const p of premiersCommuns) couleursCommuns[p] = couleursFacteurs[p]
    const valeurPgcd = pgcd(n, m)
    const valeurPpcm = ppcm(n, m)
    const texPgcd = texNombre(valeurPgcd, 0)

    let question1 = `Décomposer $${texN}$ et $${texM}$ en produit de facteurs premiers.`
    if (this.interactif) {
      question1 += `<br>${remplisLesBlancs(this, 0, `${texN} = %{champ1} \\qquad ${texM} = %{champ2}`, KeyboardType.clavierFullOperations)}`
    }
    handleAnswers(
      this,
      0,
      {
        champ1: { value: texFacto(factoN), compare: compareDecomposition },
        champ2: { value: texFacto(factoM), compare: compareDecomposition },
      },
      { formatInteractif: 'fill-in-the-blank' },
    )
    let correction1 =
      'On divise successivement par les nombres premiers dans l’ordre croissant :'
    correction1 += `<br><br>$${texEchelleDeDivisions(n)} \\qquad\\qquad ${texEchelleDeDivisions(m)}$`
    correction1 += `<br><br>$${texN} = ${miseEnEvidence(texFacto(factoN))}$<br>$${texM} = ${miseEnEvidence(texFacto(factoM))}$`

    let question2 = `Déterminer le $\\text{PGCD}$ de $${texN}$ et $${texM}$.`
    if (this.interactif) {
      question2 += ajouteChampTexteMathLive(this, 1, KeyboardType.clavierDeBase)
    }
    handleAnswers(this, 1, { reponse: { value: valeurPgcd } })
    let correction2 = `Les facteurs premiers communs aux deux décompositions sont mis en couleur :<br><br>$${texN} = ${texFacto(factoN, couleursCommuns)}$<br>$${texM} = ${texFacto(factoM, couleursCommuns)}$`
    correction2 +=
      '<br><br>Le $\\text{PGCD}$ est le produit des facteurs premiers communs aux deux décompositions, chacun étant affecté du plus petit des deux exposants.'
    const factoPgcd: [number, number][] = premiersCommuns.map((p) => [
      p,
      Math.min(exposantDans(factoN, p), exposantDans(factoM, p)),
    ])
    correction2 += `<br><br>$\\text{PGCD}${texCouple} = ${texFacto(factoPgcd, couleursCommuns)} = ${miseEnEvidence(texPgcd)}$`

    let question3 = `Déterminer le $\\text{PPCM}$ de $${texN}$ et $${texM}$.`
    if (this.interactif) {
      question3 += ajouteChampTexteMathLive(this, 2, KeyboardType.clavierDeBase)
    }
    handleAnswers(this, 2, { reponse: { value: valeurPpcm } })
    let correction3 = `Tous les facteurs premiers des deux décompositions sont mis en couleur :<br><br>$${texN} = ${texFacto(factoN, couleursFacteurs)}$<br>$${texM} = ${texFacto(factoM, couleursFacteurs)}$`
    correction3 +=
      '<br><br>Le $\\text{PPCM}$ est le produit de tous les facteurs premiers qui apparaissent dans l’une ou l’autre des décompositions, chacun étant affecté du plus grand des exposants.'
    const factoPpcm: [number, number][] = tousLesPremiers.map((p) => [
      p,
      Math.max(exposantDans(factoN, p), exposantDans(factoM, p)),
    ])
    correction3 += `<br><br>$\\text{PPCM}${texCouple} = ${texFacto(factoPpcm, couleursFacteurs)} = ${miseEnEvidence(texNombre(valeurPpcm, 0))}$`

    const diviseursCommuns = listeDesDiviseurs(valeurPgcd)
    let question4 = `En déduire tous les diviseurs communs de $${texN}$ et $${texM}$.`
    if (this.interactif) {
      question4 += `<br>${ajouteChampTexteMathLive(this, 3, KeyboardType.clavierEnsemble, { texteAvant: 'Diviseurs séparés par des points-virgules :' })}`
    }
    handleAnswers(this, 3, {
      reponse: {
        value: diviseursCommuns.join(';'),
        options: { suiteDeNombres: true },
      },
    })
    let correction4 = `Les diviseurs communs de $${texN}$ et $${texM}$ sont les diviseurs de leur $\\text{PGCD}$, $${texPgcd}$.`
    correction4 += `<br>On cherche toutes les façons d’écrire $${texPgcd}$ comme produit de deux entiers, en testant les entiers dans l’ordre croissant à partir de $1$.`
    correction4 += `<br><br>${texRechercheDesDiviseurs(valeurPgcd, factoPgcd)}`
    correction4 += `<br><br>Les diviseurs communs de $${texN}$ et $${texM}$ sont : ${texListeDiviseurs(diviseursCommuns)}.`

    this.listeQuestions.push(question1, question2, question3, question4)
    this.listeCorrections.push(
      correction1,
      correction2,
      correction3,
      correction4,
    )

    listeQuestionsToContenu(this)
  }
}

/**
 * Pour que le PGCD et le PPCM soient intéressants : m ne divise pas n, leur PGCD a au moins 4 diviseurs,
 * chacun a au moins deux facteurs premiers distincts, un facteur commun a des exposants
 * différents et au moins un facteur premier n'apparaît que dans une des décompositions.
 */
function conditionsRespectees(
  n: number,
  m: number,
  factoN: [number, number][],
  factoM: [number, number][],
) {
  if (n > 2000 || m < 60) return false
  if (n % m === 0) return false
  const d = pgcd(n, m)
  if (d < 6 || estPremier(d)) return false
  if (factoN.length < 2 || factoM.length < 2) return false
  const communAvecExposantsDifferents = factoN.some(([p, e]) =>
    factoM.some(([q, f]) => q === p && f !== e),
  )
  if (!communAvecExposantsDifferents) return false
  const premiersN = factoN.map(([p]) => p)
  const premiersM = factoM.map(([p]) => p)
  const nonCommuns =
    premiersN.filter((p) => !premiersM.includes(p)).length +
    premiersM.filter((p) => !premiersN.includes(p)).length
  return nonCommuns > 0
}
