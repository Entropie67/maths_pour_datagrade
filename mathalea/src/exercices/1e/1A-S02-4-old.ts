// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 91cbe continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '91cbe'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer la valeur manquante d'une série de valeurs pondérées dont on connaît la moyenne"
export const dateDePublication = '01/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Stéphane Guyon
 *
 */

export default class MoyennePondereeQCMOld extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale

  private appliquerLesValeurs(): void {
    let x: number
    let notes: number[]
    let coeffX: number
    let moyenne: number
    let sommeProduits: number
    let sommeCoeff: number
    let estPossible = true
    let effectif: number
    // let propositionImpossibleIncluse = false // Pour savoir si on inclut la proposition "Impossible" dans les distracteurs

    do {
      effectif = randint(3, 4) // nombre de notes connues à coefficient 1
      notes = Array.from({ length: effectif }, () => randint(8, 15))
      coeffX = choice([2, 3])
      moyenne = randint(10, 16)

      const sommeNotes = notes.reduce((a, b) => a + b, 0)
      sommeCoeff = effectif + coeffX // la somme de tous les coefficients, y compris x
      sommeProduits = sommeNotes // la somme des notes connues de coeff 1

      const totalCible = moyenne * sommeCoeff
      x = (totalCible - sommeProduits) / coeffX // Calcul de x

      if (!Number.isInteger(x)) continue // Si x entier
      estPossible = x >= 0 && x <= 20 // On veut vérifier que x dans l'intervalle [0, 20]
    } while (!Number.isInteger(x) || (!estPossible && Math.random() < 0.8)) // On continue jusqu'à ce que x soit entier et dans l'intervalle [0, 20] ou qu'on ait une chance de 20% de ne pas respecter cette condition (pour avoir le cas impossible)

    function shuffleArray<T>(array: T[]): void {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    } // Fonction pour mélanger un tableau (je pense qu'elle ne sert à rien ici, mais je n'ose pas l'enlever)

    function genererDistracteurs(
      x: number,
      inclureImpossible: boolean,
    ): string[] {
      const numeriques = [-3, -2, -1, 1, 2, 3]
        .map((delta) => x + delta)
        .filter(
          (val) => Number.isInteger(val) && val >= 0 && val <= 20 && val !== x,
        )

      shuffleArray(numeriques)
      const distracteursTexte = numeriques
        .slice(0, inclureImpossible ? 2 : 3)
        .map((val) => `$x=${texNombre(val)}$`)

      if (inclureImpossible) {
        distracteursTexte.push(
          'Impossible, il faudrait une note supérieure à 20.',
        )
      }

      shuffleArray(distracteursTexte)
      return distracteursTexte
    }

    const nbColonnes = notes.length + 1

    //  En-têtes : 'Devoir', puis '1', '2', ..., jusqu'à la colonne de x
    const entetesColonnes = ['\\text{Devoir}'].concat(
      Array.from({ length: nbColonnes }, (_, i) => `${i + 1}`),
    )

    const entetesLignes = ['\\text{Note}', '\\text{Coefficient}']
    const ligneNotes = [...notes.map((n) => `${n}`), 'x']
    const ligneCoeffs = [...notes.map(() => '1'), `${coeffX}`]
    const contenu = [...ligneNotes, ...ligneCoeffs]

    //  Tableau KaTeX
    const tableau = tableauColonneLigne(entetesColonnes, entetesLignes, contenu)
    const produits = notes.map((n) => `${n} \\times 1`).join(' + ')
    const sommeLitterale = `${sommeProduits} + ${coeffX}x`
    const sommeCoeffsDetail = notes.map(() => '1').join(' + ') + ` + ${coeffX}`
    const coeffsErreur = Array.from({ length: notes.length }, (_, i) => i + 1)
    const sommeCoeffsErreur =
      coeffsErreur.reduce((a, b) => a + b, 0) + (notes.length + 1) // x en dernière position
    const sommeProduitsErreur = notes.reduce(
      (acc, note, i) => acc + note * coeffsErreur[i],
      0,
    )

    const xErreur =
      (moyenne * sommeCoeffsErreur - sommeProduitsErreur) / (notes.length + 1)

    let distracteurErreur: string | null = null

    if (Number.isInteger(xErreur)) {
      if (xErreur > 20) {
        distracteurErreur = 'Impossible, il faudrait une note supérieure à 20.'
        // propositionImpossibleIncluse = true
      } else {
        distracteurErreur = `$x=${texNombre(xErreur)}$`
      }
    }
    this.enonce = `Voici les $${effectif + 1}$ notes sur $20$ obtenues par un élève en mathématiques :<br><br>
${tableau}
<br><br>
On cherche ce que doit valoir $x$ pour que la moyenne de l'élève soit égale à $${moyenne}$.`
    if (estPossible) {
      const inclureImpossibleCommePiege = x >= 18
      const distracteurs = genererDistracteurs(x, inclureImpossibleCommePiege)
      // Ajout du distracteur par erreur "numéro de devoir comme coefficient"
      if (distracteurErreur && !distracteurs.includes(distracteurErreur)) {
        distracteurs.pop() // on en retire un pour garder 3 au total
        distracteurs.push(distracteurErreur)
        shuffleArray(distracteurs)
      }
      this.reponses = [`$x=${texNombre(x)}$`, ...distracteurs]

      this.correction = `
Pour déterminer la moyenne de l'élève, on calcule :<br>
$\\bullet$ La somme des produits de chaque note par son coefficient :

$${produits} + x \\times ${coeffX} = ${sommeLitterale}$.<br>

$\\bullet$ La somme des coefficients : $${sommeCoeffsDetail}= ${sommeCoeff}$.
<br>Remarque : On fera bien attention à ne pas utiliser la ligne des numéros de devoirs du tableau, donnée qui n'intervient pas dans le calcul de la moyenne.
<br>La moyenne est donc égale à $\\dfrac{${sommeProduits} + ${coeffX}x}{${sommeCoeff}}$. <br> Comme elle doit être égale à $${moyenne}$, on doit résoudre l'équation suivante :
<br>
$
\\begin{aligned}
\\dfrac{${sommeProduits} + ${coeffX}x}{${sommeCoeff}} &= ${moyenne}\\\\
${sommeProduits} + ${coeffX}x &= ${moyenne} \\times ${sommeCoeff}\\\\
    ${sommeProduits} + ${coeffX}x&= ${moyenne * sommeCoeff}\\\\
${coeffX}x &= ${moyenne * sommeCoeff} - ${sommeProduits}\\\\
 ${coeffX}x &= ${moyenne * sommeCoeff - sommeProduits}\\\\
x &= \\dfrac{${moyenne * sommeCoeff - sommeProduits}}{${coeffX}}\\\\
${miseEnEvidence('x' + sp())}& ${miseEnEvidence('=' + x)}
\\end{aligned}
$
`
    } else {
      // Générer des distracteurs élevés (≥17) incluant obligatoirement 20
      const distracteursSet = new Set<number>()
      distracteursSet.add(20) // on impose qu’il y ait un 20
      // propositionImpossibleIncluse = true
      while (distracteursSet.size < 3) {
        const val = randint(17, 20, 0)
        distracteursSet.add(val)
      }

      const distracteurs = Array.from(distracteursSet).map(
        (val) => `$x=${texNombre(val)}$`,
      )
      shuffleArray(distracteurs)

      this.reponses = [
        'Impossible, il faudrait une note supérieure à $20$.',
        ...distracteurs,
      ]

      this.correction = `
Pour déterminer la moyenne de l'élève, on calcule :<br>
$\\bullet$ La somme des produits de chaque note par son coefficient :

$${produits} + x \\times ${coeffX} = ${sommeLitterale}$.

<br>$\\bullet$ La somme des coefficients : $${sommeCoeffsDetail}= ${sommeCoeff}$.
<br>Remarque : On fera bien attention à ne pas utiliser la ligne des numéros de devoirs du tableau, donnée qui n'intervient pas dans le calcul de la moyenne.
<br>La moyenne est donc égale à $\\dfrac{${sommeProduits} + ${coeffX}x}{${sommeCoeff}}$. <br> Comme elle doit être égale à $${moyenne}$, on doit résoudre l'équation suivante :
<br>
$\\dfrac{${sommeProduits} + ${coeffX}x}{${sommeCoeff}} = ${moyenne}$<br>
$${sommeProduits} + ${coeffX}x = ${moyenne * sommeCoeff}$<br>
$x = \\dfrac{${moyenne * sommeCoeff - sommeProduits}}{${coeffX}} = ${x}$<br>
Mais cette valeur dépasse $20$. Il est donc ${texteEnCouleurEtGras("impossible d'obtenir une telle moyenne avec une note sur 20")}.
`
    }
  }

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
  }
}
