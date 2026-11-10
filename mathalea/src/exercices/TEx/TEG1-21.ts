import { estConnexe, figureGraphe, sommets } from '../../lib/2d/graphes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Utiliser la matrice d'adjacence d'un graphe"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Écrire la matrice d'adjacence d'un graphe (orienté ou non), puis compter
 * les chemins (ou les chaînes) d'une longueur donnée entre deux sommets à
 * l'aide d'une puissance de cette matrice.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'ecca7'

export const refs = {
  'fr-fr': ['TEG1-21'],
  'fr-ch': [],
}

function texPmatrix(table: (string | number)[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

function produit(X: number[][], Y: number[][]): number[][] {
  return X.map((ligne) =>
    Y[0].map((_, j) => ligne.reduce((s, x, k) => s + x * Y[k][j], 0)),
  )
}

function puissance(M: number[][], k: number): number[][] {
  let P = M
  for (let e = 1; e < k; e++) P = produit(P, M)
  return P
}

/**
 * Graphe aléatoire sans sommet isolé. Orienté : chaque sommet a au moins un
 * arc sortant et un arc entrant, avec au plus une boucle. Non orienté : connexe
 * et sans boucle.
 */
function grapheAleatoire(n: number, oriente: boolean): number[][] | null {
  const adj = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0),
  )
  if (oriente) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) adj[i][j] = randint(1, 10) <= 4 ? 1 : 0
      }
    }
    if (choice([true, false, false])) {
      const s = randint(0, n - 1)
      adj[s][s] = 1
    }
    if (adj.some((ligne) => ligne.every((a) => a === 0))) return null
    if (adj.some((_, j) => adj.every((ligne) => ligne[j] === 0))) return null
    const nbArcs = adj.flat().filter((a) => a === 1).length
    if (nbArcs < n + 1 || nbArcs > 2 * n + 1) return null
  } else {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        adj[i][j] = randint(1, 10) <= 5 ? 1 : 0
        adj[j][i] = adj[i][j]
      }
    }
    if (!estConnexe(adj)) return null
    const nbAretes = adj.flat().filter((a) => a === 1).length / 2
    if (nbAretes < n || nbAretes > 2 * n - 2) return null
  }
  return adj
}

/** Liste des chemins de longueur k de s à t (à n'appeler que s'ils sont peu nombreux). */
function chemins(adj: number[][], s: number, t: number, k: number): number[][] {
  if (k === 0) return s === t ? [[s]] : []
  const resultat: number[][] = []
  adj[s].forEach((a, j) => {
    if (a === 1) {
      for (const suite of chemins(adj, j, t, k - 1))
        resultat.push([s, ...suite])
    }
  })
  return resultat
}

export default class MatriceAdjacence extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Type de graphe',
      3,
      '1 : Orienté\n2 : Non orienté\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de sommets',
      3,
      '1 : 4 sommets\n2 : 5 sommets\n3 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = [
      "Puissance de la matrice d'adjacence donnée dans l'énoncé",
      false,
    ]
    this.sup = 3
    this.sup2 = 3
    this.sup3 = false
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const listeOriente = combinaisonListes(
      this.sup === 3 ? [true, false] : [this.sup === 1],
      this.nbQuestions,
    )
    const listeOrdres = combinaisonListes(
      this.sup2 === 3 ? [4, 5] : [this.sup2 + 3],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const oriente = listeOriente[i]
      const n = listeOrdres[i]
      let adj: number[][] | null = null
      for (let essai = 0; essai < 1000 && adj == null; essai++) {
        adj = grapheAleatoire(n, oriente)
      }
      if (adj == null) continue
      const k = randint(2, 4)
      const Mk = puissance(adj, k)
      const s = randint(0, n - 1)
      const t = randint(0, n - 1)
      const nombre = Mk[s][t]
      // On veut au moins un chemin, mais pas trop pour rester lisible.
      if (nombre === 0 || nombre > 30) continue
      if (!this.questionJamaisPosee(i, adj.flat().join(''), k, s, t)) continue

      const nom = oriente ? 'chemins' : 'chaînes'
      const depart = sommets[s]
      const arrivee = sommets[t]
      const trajet =
        s === t
          ? `partant de ${depart} et revenant en ${depart}`
          : oriente
            ? `allant de ${depart} à ${arrivee}`
            : `reliant ${depart} et ${arrivee}`
      const texM = texPmatrix(adj)
      const texMk = texPmatrix(Mk)

      let texte = `On considère le graphe ${oriente ? 'orienté' : 'non orienté'} $G$ ci-dessous.<br>`
      texte += figureGraphe(adj, oriente)
      texte += `<br>${numAlpha(0)}Écrire la matrice d'adjacence $M$ du graphe $G$, les sommets étant rangés dans l'ordre alphabétique.`
      if (this.interactif) {
        texte +=
          "<br>Saisir la matrice à l'aide de la touche «\u00a0Matrice\u00a0».<br>" +
          ajouteChampTexteMathLive(this, 2 * i, KeyboardType.clavierMatrice, {
            texteAvant: '$M=$',
          })
      }
      texte += this.sup3
        ? `<br>${numAlpha(1)}On donne $M^${k}=${texMk}$.<br>Déterminer le nombre de ${nom} de longueur $${k}$ ${trajet}.`
        : `<br>${numAlpha(1)}Déterminer, à l'aide de la calculatrice, le nombre de ${nom} de longueur $${k}$ ${trajet}.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, 2 * i + 1, KeyboardType.clavierNumbers)
      }
      handleAnswers(this, 2 * i, {
        reponse: { value: texM, compare: matriceCompare },
      })
      handleAnswers(this, 2 * i + 1, { reponse: { value: nombre } })

      let texteCorr = `${numAlpha(0)}`
      texteCorr += oriente
        ? "Le coefficient de la ligne $i$ et de la colonne $j$ de $M$ vaut $1$ s'il existe un arc allant du $i$-ième sommet vers le $j$-ième sommet, et $0$ sinon."
        : "Le coefficient de la ligne $i$ et de la colonne $j$ de $M$ vaut $1$ s'il existe une arête reliant le $i$-ième sommet et le $j$-ième sommet, et $0$ sinon. La matrice $M$ est donc symétrique."
      texteCorr += `<br>$M=${miseEnEvidence(texM)}$<br>`
      texteCorr += `${numAlpha(1)}Le nombre de ${nom} de longueur $${k}$ ${trajet} est le coefficient de la ligne $${s + 1}$ et de la colonne $${t + 1}$ de la matrice $M^${k}$.<br>`
      const MkColore = texPmatrix(
        Mk.map((ligne, l) =>
          ligne.map((x, c) =>
            l === s && c === t ? `\\textcolor{blue}{${x}}` : x,
          ),
        ),
      )
      texteCorr += this.sup3
        ? `$M^${k}=${MkColore}$<br>`
        : `La calculatrice donne $M^${k}=${MkColore}$.<br>`
      texteCorr += `Il y a donc $${miseEnEvidence(nombre)}$ ${nombre === 1 ? nom.slice(0, -1) : nom} de longueur $${k}$ ${trajet}.`
      if (nombre <= 6) {
        const liste = chemins(adj, s, t, k).map(
          (c) => `$${c.map((v) => sommets[v]).join(oriente ? '\\to ' : '-')}$`,
        )
        texteCorr +=
          liste.length === 1
            ? `<br>Il s'agit de ${liste[0]}.`
            : `<br>Il s'agit de ${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}.`
      }

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
