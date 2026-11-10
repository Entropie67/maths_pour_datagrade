import { sanitizeLatexInput } from '../../lib/Latex'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

const LAYOUT_CLASSES: Record<number, string> = {
  1: '',
  2: 'portrait-layout-gauche',
  3: 'portrait-layout-droite',
}

/**
 * Classe parente factorisant le gabarit commun des exercices "Portrait" de
 * la rubrique Égalité filles-garçons : les sous-classes ne renseignent que
 * le nom, la photo et les quatre champs de texte propres à la personne
 * présentée.
 */
const LIVRET_URL =
  'https://nuage03.apps.education.fr/index.php/s/NZgmoFpcSCW8Cag?dir=/&editing=false&openfile=true'
const LIVRET_TITRE =
  "«\u00a0Sur le chemin de l'égalité en mathématiques pour tous les élèves\u00a0» - Académie de Versailles"

export default class PortraitExercice extends Exercice {
  nom = ''
  photoSrc = ''
  photoAlt = ''
  source = ''
  superPouvoir = ''
  ceQuElleFait = ''
  leTrucStyle = ''
  parcours = ''
  // Portraits issus du livret Versailles (par opposition aux fiches "super-pouvoirs"
  // Femmes et numérique) : affiche la mention "D'après « lien »" comme dans les exercices.
  mentionLivret = false

  constructor() {
    super()
    // Fiche biographique sans question ni réponse attendue.
    this.reponseCourteDisponible = false
    this.nbQuestions = 0
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Position de la photo',
      3,
      '1 : Au-dessus\n2 : À gauche\n3 : À droite',
    ]
    this.sup = 1
  }

  private blocPhoto(): string {
    return `<div class="portrait-photo-block">
      <img class="portrait-photo" src="${this.photoSrc}" alt="${this.photoAlt}" width="160" height="160">
      <p class="portrait-source">Source : ${this.source}</p>
    </div>`
  }

  private blocTexte(): string {
    return `<div class="portrait-text-block">
      <p class="portrait-champ"><strong>Super-pouvoir :</strong> ${this.superPouvoir}</p>
      <p class="portrait-champ"><strong>Ce qu'elle fait :</strong> ${this.ceQuElleFait}</p>
      <p class="portrait-champ"><strong>Le truc stylé :</strong> ${this.leTrucStyle}</p>
      <p class="portrait-champ"><strong>Parcours :</strong> ${this.parcours}</p>
    </div>`
  }

  // Rendu LaTeX natif utilisé pour la génération de PDF (context.isHtml === false) :
  // le HTML/CSS des blocs ci-dessus n'est interprété que par le navigateur et par la
  // conversion HTML→Typst, pas par une compilation LaTeX classique. La photo n'est pas
  // embarquée via \includegraphics (le pipeline de compilation PDF ne télécharge pas les
  // images situées dans des sous-dossiers) : on renvoie vers la photo en ligne.
  private blocPhotoLatex(): string {
    const url = `https://coopmaths.fr${this.photoSrc}`
    return `\\href{${url}}{Voir la photo}\\\\
{\\footnotesize\\itshape Source~: ${sanitizeLatexInput(this.source)}}`
  }

  private blocTexteLatex(): string {
    return `\\textbf{Super-pouvoir~:} ${sanitizeLatexInput(this.superPouvoir)}\\\\[0.3em]
\\textbf{Ce qu'elle fait~:} ${sanitizeLatexInput(this.ceQuElleFait)}\\\\[0.3em]
\\textbf{Le truc stylé~:} ${sanitizeLatexInput(this.leTrucStyle)}\\\\[0.3em]
\\textbf{Parcours~:} ${sanitizeLatexInput(this.parcours)}`
  }

  private mentionLivretLatex(): string {
    if (!this.mentionLivret) return ''
    return `{\\footnotesize\\itshape D'après \\href{${LIVRET_URL}}{${sanitizeLatexInput(LIVRET_TITRE)}}}\\\\[0.3em]\n`
  }

  private consigneLatex(position: number): string {
    const photo = this.blocPhotoLatex()
    const texte = this.blocTexteLatex()
    let corps: string
    if (position === 2) {
      corps = `\\begin{minipage}{0.32\\linewidth}\n\\centering\n${photo}\n\\end{minipage}\\hfill\\begin{minipage}{0.62\\linewidth}\n${texte}\n\\end{minipage}`
    } else if (position === 3) {
      corps = `\\begin{minipage}{0.62\\linewidth}\n${texte}\n\\end{minipage}\\hfill\\begin{minipage}{0.32\\linewidth}\n\\centering\n${photo}\n\\end{minipage}`
    } else {
      corps = `\\begin{center}\n${photo}\n\\end{center}\n${texte}`
    }
    return `${this.mentionLivretLatex()}\\begin{center}\\textbf{\\large ${sanitizeLatexInput(this.nom)}}\\end{center}\n${corps}`
  }

  nouvelleVersion() {
    const position = typeof this.sup === 'number' ? this.sup : 1

    if (!context.isHtml) {
      // Génération LaTeX/PDF : pas de HTML/CSS disponible, on produit du LaTeX natif.
      this.consigne = this.consigneLatex(position)
    } else {
      const id = `portrait${this.numeroExercice}`
      const photo = this.blocPhoto()
      const texte = this.blocTexte()

      let corps: string
      if (context.isTypst) {
        // Typst n'interprète pas le CSS : flex-direction (utilisé ci-dessous
        // pour le navigateur) n'a aucun effet sur l'ordre du rendu, qui reste
        // toujours celui du HTML. La mise en page côte-à-côte est donc produite
        // en code Typst natif (#grid), inséré tel quel via le marqueur
        // <mathalea-typst> reconnu par htmlToTypst (voir latexToTypst.ts) ;
        // l'<img> et les <p> qu'il encadre restent du HTML ordinaire, convertis
        // normalement et donc correctement positionnés dans les cellules.
        if (position === 2) {
          corps = `<mathalea-typst>#grid(columns: (auto, 1fr), gutter: 16pt)[</mathalea-typst>${photo}<mathalea-typst>][</mathalea-typst>${texte}<mathalea-typst>]</mathalea-typst>`
        } else if (position === 3) {
          corps = `<mathalea-typst>#grid(columns: (1fr, auto), gutter: 16pt)[</mathalea-typst>${texte}<mathalea-typst>][</mathalea-typst>${photo}<mathalea-typst>]</mathalea-typst>`
        } else {
          corps = photo + texte
        }
      } else {
        corps = `<div class="portrait-layout ${LAYOUT_CLASSES[position] ?? ''}">${photo}${texte}</div>`
      }

      this.consigne = `
<div id="${id}" class="not-prose max-w-2xl mx-auto text-coopmaths-corpus dark:text-coopmathsdark-corpus">
  <style>
    #${id} .portrait-photo { width: 160px; height: 160px; object-fit: cover; background: #f4ded5; border-radius: 9999px; border: 3px solid #f15929; display: block; margin: 0 auto; }
    #${id} .portrait-layout { display: flex; flex-direction: column; align-items: center; gap: 0.5rem 1.25rem; margin-top: 0.75rem; }
    #${id} .portrait-layout-gauche { flex-direction: row; align-items: flex-start; }
    #${id} .portrait-layout-droite { flex-direction: row-reverse; align-items: flex-start; }
    #${id} .portrait-photo-block { flex-shrink: 0; text-align: center; }
    #${id} .portrait-text-block { flex: 1 1 auto; min-width: 12rem; }
    #${id} .portrait-source { text-align: center; font-size: 0.7rem; font-style: italic; opacity: 0.7; margin-top: 0.35rem; }
    #${id} .portrait-champ { margin: 0.35rem 0; }
    #${id} .portrait-champ strong { color: #f15929; }
    #${id} .portrait-mention { text-align: center; font-size: 0.75rem; font-style: italic; opacity: 0.75; margin-bottom: 0.5rem; }
  </style>
  ${this.mentionLivret ? `<p class="portrait-mention">D'après <a href="${LIVRET_URL}" target="_blank" rel="noopener noreferrer">${LIVRET_TITRE}</a></p>` : ''}
  <h3 class="text-center text-lg font-bold mb-2">${this.nom}</h3>
  ${corps}
</div>
`
    }
    // Un tableau vide casse le style Can : \begin{enumerate}\end{enumerate} sans \item
    // provoque "Something's wrong--perhaps a missing \item." à la compilation LaTeX.
    this.listeQuestions = ['']
    this.listeCorrections = ['']
    listeQuestionsToContenu(this)
  }
}
