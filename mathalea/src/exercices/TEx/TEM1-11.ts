import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { matrice as matrix } from '../../lib/mathFonctions/Matrice'
import type { Matrice } from '../../lib/mathFonctions/Matrice'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { rangeMinMax } from '../../lib/outils/nombres'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer un produit de matrices carrées ou colonnes'

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '25/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Maxime Nguyen

*/
export const uuid = '88241'

export const refs = {
  'fr-fr': ['TEM1-11'],
  'fr-ch': [],
}
export default class NomExercice extends Exercice {
  constructor() {
    super()

    this.consigne =
      'On définit deux matrices $A$ et $B$. Si le produit $A \\times B$ est possible, effectuer le calcul. Faire de même pour $B \\times A$.'
    this.nbQuestions = 2 // Nombre de questions par défaut
    this.nbCols = 1 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 1 // Uniquement pour la sortie LaTeX
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1', 'type2', 'type3'] // On créé 3 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, n = 0, m = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const matrices: Matrice[] = [] // vecteur qui stocke les matrices
      const matricesprint: string[] = [] // vecteur qui stocke les matrices écrites en LaTeX
      const nbmatrice = 2
      let nblignes: [number, number] = [2, 2]
      let nbcolonnes: [number, number] = [2, 2]
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1':
          nblignes = [2, 2]
          nbcolonnes = [2, 2]
          break
        case 'type2':
          nblignes = [3, 3]
          nbcolonnes = [3, 3]
          break
        case 'type3':
          nblignes = [3, 3]
          nbcolonnes = [3, 1]
      }
      const texteligne: string[] = [] // texte pour la correction
      const textecolonne: string[] = [] // texte pour la correction
      for (let compteur = 0; compteur < nbmatrice; compteur++) {
        let ligne: number[]
        const table: number[][] = []
        n = nblignes[compteur]
        if (n === 1) {
          texteligne.push('$1$ ligne ')
        } else {
          texteligne.push(`$${n}$ lignes `)
        }
        m = nbcolonnes[compteur]
        if (m === 1) {
          textecolonne.push('$1$ colonne ')
        } else {
          textecolonne.push(`$${m}$ colonnes `)
        }
        for (let i = 0; i < n; i++) {
          ligne = []
          for (let j = 0; j < m; j++) {
            const coef = choice([
              -6, -5, -4, -3, -2, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
              1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 6,
            ])
            ligne.push(coef)
          }
          table.push(ligne)
        }
        const matrice = matrix(table)
        matrices.push(matrice)
        matricesprint.push(matrice.toTex())
      }

      texte = `Soient $A=${matricesprint[0]}$ et $B = ${matricesprint[1]}$.` // Le LateX entre deux symboles $, les variables dans des ${ }
      texteCorr =
        'La matrice $A$ a ' + texteligne[0] + 'et ' + textecolonne[0] + '. '
      texteCorr +=
        'La matrice $B$ a ' + texteligne[1] + 'et ' + textecolonne[1] + '. '
      if (nbcolonnes[0] === nblignes[1]) {
        const produit = matrices[0].multiply(matrices[1])
        const produitprint = produit.toTex()
        texteCorr += `<br><br> Le produit $A \\times B$ est possible et c'est une matrice qui a $${nblignes[0]}$ lignes et $${nbcolonnes[1]}$ colonnes. `
        texteCorr += `<br><br> $ \\begin{array}{rccl} && \\textcolor{blue}{${matricesprint[1]}}& =\\textcolor{blue}{B} \\\\ \\textcolor{red}{A} = &\\textcolor{red}{${matricesprint[0]}} & ${produitprint} & = AB \\end{array} $`

        const l1 = matrices[0].subset(
          [nblignes[0] - 1],
          rangeMinMax(0, nbcolonnes[0] - 1),
        )
        const c1 = matrices[1].subset(rangeMinMax(0, nblignes[1] - 1), [
          nbcolonnes[1] - 1,
        ])

        let detail = `c_{${nblignes[0]}, ${nbcolonnes[1]}} = `
        for (let i = 0; i < nbcolonnes[0]; i++) {
          detail +=
            '\\textcolor{red}{' +
            ecritureParentheseSiMoins(l1.getValue(0, i).toString()) +
            '} \\times \\textcolor{blue}{' +
            ecritureParentheseSiMoins(c1.getValue(i, 0).toString()) +
            '}'
          if (i < nbcolonnes[0] - 1) {
            detail += '+'
          } else {
            detail += ' = '
          }
        }
        detail += `${produit.getValue(nblignes[0] - 1, nbcolonnes[1] - 1)}`
        texteCorr += `<br> Le détail du calcul de $c_{${nblignes[0]}, ${nbcolonnes[1]}}$ où $c_{${nblignes[0]}, ${nbcolonnes[1]}}$ est le coefficient de la $${nblignes[0]}$-ème ligne et de la $${nbcolonnes[1]}$-ème colonne de la matrice $C = AB$ donne : <br> $${detail}$.`
        texteCorr += `<br> On trouve $A \\times B = ${miseEnEvidence(produitprint)}$.`
      } else {
        texteCorr += `<br><br> Le produit $A \\times B$ ${texteEnCouleurEtGras("n'est pas possible")} car le nombre de colonnes de $A$ n'est pas égal au nombre de lignes de $B$.`
      }
      if (nbcolonnes[1] === nblignes[0]) {
        const produit = matrices[1].multiply(matrices[0])
        const produitprint = produit.toTex()
        texteCorr += `<br><br> Le produit $B \\times A$ est possible et c'est une matrice qui a $${nblignes[1]}$ lignes et $${nbcolonnes[0]}$ colonnes. `
        texteCorr += `<br><br> $ \\begin{array}{rccl} && \\textcolor{red}{${matricesprint[0]}}& =\\textcolor{red}{A} \\\\ \\textcolor{blue}{B} = &\\textcolor{blue}{${matricesprint[1]}} & ${produitprint} & = BA \\end{array} $`

        const l1 = matrices[1].subset(
          [nblignes[1] - 1],
          rangeMinMax(0, nbcolonnes[1] - 1),
        )
        const c1 = matrices[0].subset(rangeMinMax(0, nblignes[0] - 1), [
          nbcolonnes[0] - 1,
        ])

        let detail = `c_{${nblignes[1]}, ${nbcolonnes[0]}} = `
        for (let i = 0; i < nbcolonnes[1]; i++) {
          detail +=
            '\\textcolor{blue}{' +
            ecritureParentheseSiMoins(l1.getValue(0, i).toString()) +
            '} \\times \\textcolor{red}{' +
            ecritureParentheseSiMoins(c1.getValue(i, 0).toString()) +
            '}'
          if (i < nbcolonnes[1] - 1) {
            detail += '+'
          } else {
            detail += ' = '
          }
        }
        detail += `${produit.getValue(nblignes[1] - 1, nbcolonnes[0] - 1)}`
        texteCorr += `<br> Le détail du calcul de $c_{${nblignes[1]}, ${nbcolonnes[0]}}$ où $c_{${nblignes[1]}, ${nbcolonnes[0]}}$ est le coefficient de la $${nblignes[1]}$-ème ligne et de la $${nbcolonnes[0]}$-ème colonne de la matrice $C = BA$ donne : <br> $${detail}$.`
        texteCorr += `<br> On trouve $B \\times A = ${miseEnEvidence(produitprint)}$.`
      } else {
        texteCorr += `<br><br> Le produit $B \\times A$ ${texteEnCouleurEtGras("n'est pas possible")} car le nombre de colonnes de $B$ n'est pas égal au nombre de lignes de $A$.`
      }
      // Si la question n'a jamais été posée, on l'enregistre
      if (
        this.questionJamaisPosee(
          i,
          matrices.map((item) => item.toString()).join('|'),
        )
      ) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c, d...)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
