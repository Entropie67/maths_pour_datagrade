import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer des termes d'une suite de matrices colonnes"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Suites de matrices colonnes vérifiant U_{n+1}=AU_n ou U_{n+1}=AU_n+B :
 * calcul des premiers termes.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '6ddf1'

export const refs = {
  'fr-fr': ['TEM1-31'],
  'fr-ch': [],
}

/** Arrondi qui élimine les erreurs de calcul sur les décimaux. */
function arrondi(x: number): number {
  return Math.round(x * 1e6) / 1e6
}

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/** Matrice à coefficients décimaux, écrits à la française. */
function texMatrice(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

function colonne(valeurs: number[]): number[][] {
  return valeurs.map((x) => [x])
}

function produit(A: number[][], U: number[]): number[] {
  return A.map((ligne) => arrondi(ligne.reduce((s, a, j) => s + a * U[j], 0)))
}

function somme(U: number[], V: number[]): number[] {
  return U.map((u, i) => arrondi(u + V[i]))
}

/** Détail du produit AU, ligne par ligne. */
function texDetailProduit(A: number[][], U: number[]): string {
  return texPmatrix(
    A.map((ligne) => [
      ligne
        .map(
          (a, j) =>
            `${j === 0 ? texNombre(a) : ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(U[j])}`,
        )
        .join('+'),
    ]),
  )
}

type Question = {
  texte: string
  /** Une correction par consigne. */
  consignes: string[]
  corrections: string[]
  /** Les deux matrices attendues, dans l'ordre des champs. */
  champs: { nom: string; reponse: string }[]
  cle: string
}

/** Calculer U_1 et U_2 lorsque U_{n+1}=AU_n+B ou U_{n+1}=AU_n. */
function questionTermes(p: number, avecB: boolean): Question | null {
  const A = Array.from({ length: p }, () =>
    Array.from({ length: p }, () => randint(-3, 3)),
  )
  if (A.flat().filter((a) => a === 0).length > p - 1) return null
  const B = Array.from({ length: p }, () => (avecB ? randint(-5, 5) : 0))
  if (avecB && B.every((b) => b === 0)) return null
  const U0 = Array.from({ length: p }, () => randint(-5, 5))
  if (U0.filter((u) => u === 0).length > 1) return null
  const U1 = somme(produit(A, U0), B)
  const U2 = somme(produit(A, U1), B)
  if (U2.some((u) => Math.abs(u) > 200)) return null

  const relation = avecB ? 'AU_n+B' : 'AU_n'
  const matrices = avecB
    ? `$A=${texMatrice(A)}$ et $B=${texMatrice(colonne(B))}$`
    : `$A=${texMatrice(A)}$`
  const texte = `Soit $(U_n)$ la suite de matrices colonnes définie par $U_0=${texMatrice(colonne(U0))}$ et, pour tout entier naturel $n$, $U_{n+1}=${relation}$, où ${matrices}.`
  const consignes = ['Calculer $U_1$.', 'Calculer $U_2$.']

  const etape = (n: number, U: number[], suivant: number[]) => {
    const AU = produit(A, U)
    let tex = `On applique la relation de récurrence avec $n=${n}$ :<br>$\\begin{aligned}U_{${n + 1}}&=AU_{${n}}${avecB ? '+B' : ''}\\\\&=${texMatrice(A)}\\times ${texMatrice(colonne(U))}${avecB ? `+${texMatrice(colonne(B))}` : ''}\\\\&=${texDetailProduit(A, U)}${avecB ? `+${texMatrice(colonne(B))}` : ''}`
    if (avecB)
      tex += `\\\\&=${texMatrice(colonne(AU))}+${texMatrice(colonne(B))}`
    tex += `\\\\&=${miseEnEvidence(texMatrice(colonne(suivant)))}\\end{aligned}$`
    return tex
  }
  const corrections = [etape(0, U0, U1), etape(1, U1, U2)]

  return {
    texte,
    champs: [
      { nom: 'U_1', reponse: texMatrice(colonne(U1)) },
      { nom: 'U_2', reponse: texMatrice(colonne(U2)) },
    ],
    cle: ['termes', ...A.flat(), ...B, ...U0].join('|'),
    consignes,
    corrections,
  }
}

export default class SuitesDeMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : Un+1 = AUn\n2 : Un+1 = AUn + B\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Taille des matrices',
      3,
      "1 : Carrées d'ordre 2\n2 : Carrées d'ordre 3\n3 : Mélange",
    ]
    this.sup = '3'
    this.sup2 = 1
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
    }).map(Number)
    const tailles = combinaisonListes(
      this.sup2 === 3 ? [2, 3] : [this.sup2 + 1],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      let question: Question | null = null
      for (let essai = 0; essai < 1000 && question == null; essai++) {
        question = questionTermes(p, typesDeQuestions[i] === 2)
      }
      if (question == null) continue
      if (!this.questionJamaisPosee(i, question.cle)) continue

      let texte = question.texte
      if (this.interactif) {
        texte += "<br>Saisir les matrices à l'aide de la touche «\u00a0Matrice\u00a0»."
      }
      let texteCorr = ''
      question.consignes.forEach((consigne, k) => {
        const numero = question.consignes.length > 1 ? numAlpha(k) : ''
        texte += `<br>${numero}${consigne}`
        texteCorr += `${k > 0 ? '<br>' : ''}${numero}${question.corrections[k]}`
        if (this.interactif) {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(
              this,
              2 * i + k,
              KeyboardType.clavierMatrice,
              { texteAvant: `$${question.champs[k].nom}=$` },
            )
        }
      })
      question.champs.forEach(({ reponse }, k) => {
        handleAnswers(this, 2 * i + k, {
          reponse: { value: reponse, compare: matriceCompare },
        })
      })

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
