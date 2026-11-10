import { miseEnEvidence } from '../../lib/outils/embellissements'
import ce from '../../lib/interactif/comparisonFunctions'
import { Matrice } from '../../lib/mathFonctions/Matrice'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  lettreIndiceeDepuisChiffre,
  lettreMinusculeDepuisChiffre,
} from '../../lib/outils/outilString'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer la matrice d'une application linéaire"

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '26/11/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '26/11/2024' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Maxime Nguyen
 */
export const uuid = 'de526'

export const refs = {
  'fr-fr': ['HPC105'],
  'fr-ch': [],
}
export default class NomExercice extends Exercice {
  declare sup: number

  constructor() {
    super()

    this.consigne =
      "Déterminer la matrice de l'application linéaire définie ci-dessous dans la base canonique."
    this.nbQuestions = 4

    this.besoinFormulaireNumerique = [
      'Difficulté',
      2,
      '1 : Fonction de deux variables\n2 : Fonction de trois variables',
    ] // le paramètre sera numérique de valeur max 3 (le 3 en vert)
    this.sup = 2 // Valeur du paramètre par défaut
    // Remarques : le paramètre peut aussi être un texte avec : this.besoinFormulaireTexte = [texte, tooltip]
    //              il peut aussi être une case à cocher avec : this.besoinFormulaireCaseACocher = [texte] (dans ce cas, this.sup = true ou this.sup = false)

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    let listeTypeDeQuestionsDisponibles
    if (this.sup === 1) {
      // On ajuste la difficulté selon le paramètre.
      listeTypeDeQuestionsDisponibles = ['type1']
    } else {
      // ne jamais laisser de cas où rien n'est assigné car si quelqu'un modifie le this.sup dans l'url, on se retrouve avec une erreur
      // Si c'est pas 1, c'est 2 !
      listeTypeDeQuestionsDisponibles = ['type2']
    }
    const listeTypeQuestions = combinaisonListes(
      listeTypeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, coefficients, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      coefficients = [
        -9, -8, -7, -6, -5, -4, -3, -3, -2, -2, -2, -1, -1, -1, -1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 6, 7, 8, 9,
      ]
      switch (listeTypeQuestions[i]) {
        case 'type1': {
          let expression1
          let expression2
          let expression3
          const n = choice([1, 2, 3])
          const m = 2
          const table = []
          const nommatrice = lettreIndiceeDepuisChiffre(i + 1)
          const nomfonction = lettreMinusculeDepuisChiffre(i + 6)
          let coef = 0
          for (let i = 0; i < n; i++) {
            const ligne = []
            for (let j = 0; j < m; j++) {
              coef = choice(coefficients)
              ligne.push(coef)
            }
            table.push(ligne)
          }
          const matrice = new Matrice(table)
          if (n === 1) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y`)
              .simplify().latex // On calcule l'expression de la première ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^2 & \\longrightarrow & \\mathbb{R} \\\\ (x,y) & \\longmapsto & ${expression1} \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^2$.
            <br><br> On calcule : $${nomfonction}(1,0) = ${table[0][0]}$ et $${nomfonction}(0,1) = ${table[0][1]}$.
            <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          } else if (n === 2) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y`)
              .simplify().latex // On calcule l'expression de la première ligne
            expression2 = ce
              .parse(`${table[1][0]} x + ${table[1][1]} y`)
              .simplify().latex // On calcule l'expression de la deuxième ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^2 & \\longrightarrow & \\mathbb{R}^2 \\\\ (x,y) & \\longmapsto & \\left( ${expression1} \\,, \\, ${expression2} \\right) \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^2$ dans la base de $\\mathbb{R}^2$. Ces vecteurs constituent les colonnes de la matrice $${nommatrice}$ représentant $${nomfonction}$ dans la base canonique. 
              <br><br> On calcule : $${nomfonction}(1,0) = (${table[0][0]},${table[1][0]})$ et $${nomfonction}(0,1) = (${table[0][1]},${table[1][1]})$.
              <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          } else if (n === 3) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y`)
              .simplify().latex // On calcule l'expression de la première ligne
            expression2 = ce
              .parse(`${table[1][0]} x + ${table[1][1]} y`)
              .simplify().latex // On calcule l'expression de la deuxième ligne
            expression3 = ce
              .parse(`${table[2][0]} x + ${table[2][1]} y`)
              .simplify().latex // On calcule l'expression de la troisième ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^2 & \\longrightarrow & \\mathbb{R}^3 \\\\ (x,y) & \\longmapsto & \\left( ${expression1} \\,, \\, ${expression2} \\,, \\, ${expression3} \\right) \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^2$ dans la base de $\\mathbb{R}^3$. Ces vecteurs constituent les colonnes de la matrice $${nommatrice}$ représentant $${nomfonction}$ dans la base canonique.  
              <br><br> On calcule : $${nomfonction}(1,0) = (${table[0][0]},${table[1][0]},${table[2][0]})$ et $${nomfonction}(0,1) = (${table[0][1]},${table[1][1]},${table[2][1]})$.
              <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          }
          break
        }
        case 'type2': {
          let expression1
          let expression2
          let expression3
          const n = choice([1, 2, 3])
          const m = 3
          const table = []
          const nommatrice = lettreIndiceeDepuisChiffre(i + 1)
          const nomfonction = lettreMinusculeDepuisChiffre(i + 6)
          let coef = 0
          for (let i = 0; i < n; i++) {
            const ligne = []
            for (let j = 0; j < m; j++) {
              coef = choice(coefficients)
              ligne.push(coef)
            }
            table.push(ligne)
          }
          const matrice = new Matrice(table)
          if (n === 1) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y + ${table[0][2]} z`)
              .simplify().latex // On calcule l'expression de la première ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^3 & \\longrightarrow & \\mathbb{R} \\\\ (x,y,z) & \\longmapsto & ${expression1} \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^3$.
            <br><br> On calcule : $${nomfonction}(1,0,0) = ${table[0][0]}$, $${nomfonction}(0,1,0) = ${table[0][1]}$ et $${nomfonction}(0,0,1) = ${table[0][2]}$.
            <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          } else if (n === 2) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y + ${table[0][2]} z`)
              .simplify().latex // On calcule l'expression de la première ligne
            expression2 = ce
              .parse(`${table[1][0]} x + ${table[1][1]} y + ${table[1][2]} z`)
              .simplify().latex // On calcule l'expression de la deuxième ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^3 & \\longrightarrow & \\mathbb{R}^2 \\\\ (x,y,z) & \\longmapsto & \\left( ${expression1} \\,, \\, ${expression2} \\right) \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^3$ dans la base de $\\mathbb{R}^2$. Ces vecteurs constituent les colonnes de la matrice $${nommatrice}$ représentant $${nomfonction}$ dans la base canonique.  
              <br><br> On calcule : $${nomfonction}(1,0,0) = (${table[0][0]},${table[1][0]})$, $${nomfonction}(0,1,0) = (${table[0][1]},${table[1][1]})$ et $${nomfonction}(0,0,1) = (${table[0][2]},${table[1][2]})$.
              <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          } else if (n === 3) {
            expression1 = ce
              .parse(`${table[0][0]} x + ${table[0][1]} y + ${table[0][2]} z`)
              .simplify().latex // On calcule l'expression de la première ligne
            expression2 = ce
              .parse(`${table[1][0]} x + ${table[1][1]} y + ${table[1][2]} z`)
              .simplify().latex // On calcule l'expression de la deuxième ligne
            expression3 = ce
              .parse(`${table[2][0]} x + ${table[2][1]} y + ${table[2][2]} z`)
              .simplify().latex // On calcule l'expression de la troisième ligne
            texte = `On donne l'application linéaire : \\[ ${nomfonction} : \\begin{array}{rcl} \\mathbb{R}^3 & \\longrightarrow & \\mathbb{R}^3 \\\\ (x,y,z) & \\longmapsto & \\left( ${expression1} \\,, \\, ${expression2} \\,, \\, ${expression3} \\right) \\end{array}.\\] <br> Déterminer la matrice de l'application linéaire $f$ dans la base canonique.`
            texteCorr = ''
            texteCorr += `On trouve la matrice de l'application linéaire $${nomfonction}$ en écrivant l'image par $${nomfonction}$ des vecteurs de la base canonique de $\\mathbb{R}^3$ dans la base de $\\mathbb{R}^3$. Ces vecteurs constituent les colonnes de la matrice $${nommatrice}$ représentant $${nomfonction}$ dans la base canonique.   
            <br><br> On calcule : $${nomfonction}(1,0,0) = (${table[0][0]},${table[1][0]},${table[2][0]})$, $${nomfonction}(0,1,0) = (${table[0][1]},${table[1][1]},${table[2][1]})$ et $${nomfonction}(0,0,1) = (${table[0][2]},${table[1][2]},${table[2][2]})$.
            <br><br> On en déduit que la matrice de $${nomfonction}$ dans la base canonique est : $${nommatrice} = ${miseEnEvidence(matrice.toTex())}$.`
          }
          break
        }
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
