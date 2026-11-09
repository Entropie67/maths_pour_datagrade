import type { ExamConfig } from '../../../lib/LatexTypes'

// Helpers pour encoder/décoder
export function encodeBase64(obj: any): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
}

export function decodeBase64(str: string): any {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))))
  } catch (e) {
    return {}
  }
}

function escapeLatex(str: string): string {
  return str.replace(/[&_#%$]/g, '\\$&')
}

/*
  * MGU : ce fichier est un brouillon pour générer des templates d'examens en LaTeX.
  * L'idée est d'avoir une classe ExamTemplateEngine qui prend une config et génère un template LaTeX.
  * On peut ensuite créer des fonctions pour générer des templates spécifiques (brevet, bac, ds) à partir de cette classe.
  * Le but est d'avoir un code simple et facilement modifiable pour pouvoir ajuster les templates au besoin.
  * On peut aussi envisager d'ajouter des fonctionnalités comme la génération de feuilles de réponses, etc.
  * 
  * const engine = new ExamTemplateEngine({
  type: 'brevet',
  titre: 'BREVET BLANC',
  session: 'Mars 2026',
  matiere: 'MATHÉMATIQUES',
  duree: '2 heures',
  autorisation: 'L\'usage de la calculatrice est autorisé.',
  exercices: [
    { points: 6 },
    { points: 4 },
    { points: 4 },
    { points: 2.5 },
    { points: 3.5 }
  ]
})

const latex = engine.render()
*/

export class ExamTemplateEngine {
  constructor(private config: ExamConfig) {}

  private renderHeader(): string {
    return `
\\pagestyle{fancy}
\\lhead{}
\\chead{}
\\rhead{${this.config.titre ? `\\textbf{${escapeLatex(this.config.titre)}}$\\ $` : ''} page \\thepage / \\pageref{LastPage}}
\\lfoot{} \\cfoot{}\\rfoot{}
\\rule{0pt}{1.5cm}
`
  }

  private renderExercisesTable(): string {
    const rows = this.config.exercices
      ?.map(
        (exo, i) => `
\\textbf{Exercice ${i + 1}} & \\textbf{${exo.points} point${exo.points > 1 ? 's' : ''}} \\\\
\\hline`,
      )
      .join('\n')

    return `
\\begin{tabularx}{0.5\\linewidth}{|m{5cm}|*{1}{>{\\centering \\arraybackslash}X|}}
\\hline
${rows}
\\end{tabularx}
`
  }

  private renderCoverPage(): string {
    const totalPoints = this.config.exercices?.reduce(
      (sum, exo) => sum + exo.points,
      0,
    )

    return `
\\begin{center}
${this.config.titre ? `\\fbox{{\\Huge ${escapeLatex(this.config.titre)}}}\\\\` : ''}
\\vspace{1cm}
${this.config.session ? escapeLatex(this.config.session) + '\\\\' : ''}
\\vspace{1.5cm}

${this.config.matiere ? `\\LARGE {\\bf ${escapeLatex(this.config.matiere)}}\\\\` : ''}
\\rule{7cm}{1pt}\\\\
\\vspace{1cm}

${this.config.duree ? `\\textbf{Durée de l'épreuve : ${escapeLatex(this.config.duree)}}\\\\` : ''}
\\vspace{1cm}

${this.config.autorisation ? `\\textit{${escapeLatex(this.config.autorisation)}}\\\\` : ''}
\\vspace{2cm}

${this.renderExercisesTable()}

\\vspace{1cm}
\\textbf{Total : ${totalPoints} point${totalPoints && totalPoints > 1 ? 's' : ''}}

\\end{center}

\\vfill
\\hfill {\\bf Tournez la page S.V.P.}
\\newpage
`
  }

  public render(): string {
    return `
${this.renderHeader()}
${this.renderCoverPage()}
`
  }

  public generateTikzFiche(): string {
    return `
\\newif\\ifpasentetefiche
\\pasentetefichetrue  % ou false selon le comportement désiré
\\ifpasentetefiche
    \\RenewDocumentCommand\\TikzFiche{}{}%
    \\RenewDocumentCommand\\TikzIE{}{}%
\\fi
`
  }
}
