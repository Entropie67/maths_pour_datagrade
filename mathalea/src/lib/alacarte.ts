import type {
  IExercice,
  IExerciceStatique,
  InterfaceParams,
} from '../lib/types'
import Latex, { ordonneTkzBaseAvantEuclide } from './Latex'
import { loadPackagesFromContent } from './latex/preambuleTex'

interface Items {
  [key: string]: string
}

interface DocumentsEntity {
  title: string
  items: string[]
  number?: number
}

export interface UserSettings {
  items: Items
  documents: DocumentsEntity[]
}

export interface itemsWithExercises {
  [key: string]: (IExercice | IExerciceStatique)[]
}

export function handleUrl(url: URL) {
  const entries = url.searchParams.entries()
  let indiceExercice = -1
  const newExercisesParams: InterfaceParams[] = []
  for (const entry of entries) {
    if (entry[0] === 'uuid') {
      indiceExercice++
      const uuid = entry[1]
      if (!newExercisesParams[indiceExercice])
        newExercisesParams[indiceExercice] = { uuid }
      newExercisesParams[indiceExercice].uuid = uuid // string
      newExercisesParams[indiceExercice].interactif = '0' // par défaut
    } else if (entry[0] === 'n') {
      newExercisesParams[indiceExercice].nbQuestions = parseInt(entry[1]) // int
    } else if (entry[0] === 's') {
      newExercisesParams[indiceExercice].sup = entry[1]
    } else if (entry[0] === 's2') {
      newExercisesParams[indiceExercice].sup2 = entry[1]
    } else if (entry[0] === 's3') {
      newExercisesParams[indiceExercice].sup3 = entry[1]
    } else if (entry[0] === 's4') {
      newExercisesParams[indiceExercice].sup4 = entry[1]
    } else if (entry[0] === 's5') {
      newExercisesParams[indiceExercice].sup5 = entry[1]
    } else if (entry[0] === 'alea') {
      newExercisesParams[indiceExercice].alea = entry[1]
    } else if (entry[0] === 'cols') {
      newExercisesParams[indiceExercice].cols = parseInt(entry[1])
    } else if (entry[0] === 'i' && (entry[1] === '0' || entry[1] === '1')) {
      newExercisesParams[indiceExercice].interactif = entry[1]
    } else if (entry[0] === 'cd' && (entry[1] === '0' || entry[1] === '1')) {
      newExercisesParams[indiceExercice].cd = entry[1]
    }
  }
  return newExercisesParams
}

export function generateLatex(
  userSettings: UserSettings,
  itemsWithExercises: itemsWithExercises,
  documentTitle = 'Évaluation à la carte',
) {
  let output = ''
  const exercicesLatex = new Latex()
  let outputCorr = '\n\n%%%%%%%%%%%%%%%%%%%%'
  outputCorr += '\n%%%  CORRECTION  %%%'
  outputCorr += '\n%%%%%%%%%%%%%%%%%%%%'
  for (const document of userSettings.documents) {
    const numberOfVersions = document.number || 1
    for (let i = 0; i < numberOfVersions; i++) {
      const intro = `
  
  %%% ${document.title} %%%
  \\clearpage
  \\fancyhead[R]{${document.title}}
  \\setcounter{numexercice}{0}
  
  `
      output += intro
      // `\fancyhead[L]{Correction}` doit être émis APRÈS le `\clearpage` :
      // fancyhdr résout l'en-tête au shipout, sinon « Correction » apparaît
      // dans l'en-tête gauche de la dernière page des énoncés.
      outputCorr += intro.replace(
        '\\clearpage',
        '\\clearpage\n  \\fancyhead[L]{Correction}',
      )

      for (const item of document.items) {
        if (itemsWithExercises[item]) {
          for (const exercise of itemsWithExercises[item]) {
            const latex = new Latex()
            latex.addExercices([exercise])
            exercicesLatex.addExercices([exercise])
            const contents = latex.getContentsForAVersion(
              {
                title: '',
                reference: '',
                subtitle: '',
                style: 'Classique',
                fontOption: 'StandardFont',
                tailleFontOption: 12,
                dysTailleFontOption: 14,
                correctionOption: 'AvecCorrection',
                qrcodeOption: 'SansQrcode',
                typeFiche: 'Fiche',
                durationCanOption: '9 min',
                titleOption: 'SansTitre',
                nbVersions: 1,
              },
              i + 1,
            )
            output +=
              '\n\n' +
              contents.content
                .replace('\\begin{EXO}', '\\exercice')
                .replace('\\end{EXO}', '')
            outputCorr +=
              '\n\n' +
              contents.contentCorr
                .replace('\\begin{EXO}', '\\exercice')
                .replace('\\end{EXO}', '')
          }
        }
      }
    }
  }
  outputCorr += '\n\n\\end{document}'
  // Comme pour les autres exports LaTeX, les packages et bibliothèques TikZ
  // sont chargés d'après le contenu réellement émis.
  const contents = {
    preamble: preambuleLight.replace(
      'DOCUMENT_TITLE_PLACEHOLDER',
      documentTitle,
    ),
    intro: '',
    content: output,
    contentCorr: outputCorr,
  }
  loadPackagesFromContent(contents)
  const [latexCmds, latexPackages] = exercicesLatex.getContentLatex()
  for (const pack of latexPackages) {
    if (!contents.preamble.includes(`{${pack}}`)) {
      contents.preamble += `\n\\usepackage{${pack}}`
    }
  }
  for (const cmd of latexCmds) {
    contents.preamble += '\n' + cmd.replace('cmd', '')
  }
  contents.preamble = ordonneTkzBaseAvantEuclide(contents.preamble)
  return `${contents.preamble}\n\n\\begin{document}\n${output}${outputCorr}`
}

const preambuleLight = `
\\documentclass[12pt]{article}
\\usepackage[left=1.5cm,right=1.5cm,top=2cm,bottom=2cm]{geometry}
%%% EE (24/04/2026) : Les modifs ci-dessous sont nécessaires pour accepter ’ comme apostrophe.
% \\usepackage[utf8]{inputenc}  % Inutile en LuaLaTeX : l'UTF-8 est natif, géré par fontspec
% \\usepackage[T1]{fontenc}     % Réservé à pdfLaTeX, à remplacer par fontspec en LuaLaTeX
\\usepackage{fontspec}
\\usepackage[french]{babel}
\\usepackage{multicol} 
\\usepackage{calc} 
\\usepackage{enumerate}
\\usepackage{enumitem}
\\usepackage{graphicx}
\\usepackage{tabularx}
\\usepackage[autolanguage,np]{numprint}
\\usepackage{hyperref}
\\usepackage{amsmath,amsfonts,amssymb,mathrsfs} 
\\usepackage{cancel}
\\usepackage{textcomp}
\\usepackage{gensymb}
\\usepackage{eurosym}
\\usepackage{fancyhdr,lastpage}          
\\pagestyle{fancy}                      
\\usepackage{fancybox}
\\usepackage{setspace}
\\usepackage[table,svgnames]{xcolor}
\\usepackage{qrcode}
\\usepackage{etoolbox}
\\usepackage{pgf,tikz}
\\usepackage{tcolorbox}
\\tcbuselibrary{breakable}

\\setlength{\\parindent}{0mm}
\\renewcommand{\\arraystretch}{1.5}
\\renewcommand{\\labelenumi}{\\textbf{\\theenumi{}.}}
\\renewcommand{\\labelenumii}{\\textbf{\\theenumii{}.}}
\\newcommand{\\version}[1]{\\fancyhead[R]{Version #1}}
\\setlength{\\headheight}{14.5pt}

\\newcounter{numexercice}
\\setcounter{numexercice}{0}
\\newcommand{\\exercice}[2]{%
  \\stepcounter{numexercice}%
  \\subsection*{%
    Exercice \\thenumexercice%
    \\ifstrempty{#1}
     {}
     {\\textnormal{ #1}}%
  }%
}

\\fancyhead[C]{DOCUMENT_TITLE_PLACEHOLDER}
\\fancyfoot{}
\\fancyhead[R]{}

\\renewcommand{\\headrulewidth}{0.4pt}
`
