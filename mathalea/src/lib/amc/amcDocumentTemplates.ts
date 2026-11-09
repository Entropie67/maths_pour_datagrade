import { renderTemplate } from './amcTemplates'
/**
 * @author Jean-claude Lhote
 */
export type AMCPreambleRenderData = {
  documentClassOptions: string
  dynamicPreamble?: string
}

export type AMCHeaderRenderData = {
  isA3: boolean
  isAssociation: boolean
  isCodeGrid: boolean
  matiere: string
  titre: string
  nbExemplaires: number
  collectCorrectionsAtEnd?: boolean
  showWarningMessage?: boolean
  warningMessage?: string
}

export type AMCDocumentStartRenderData = {
  seed: number
  groupsContent: string
  mergeGroupsAndShuffle?: boolean
}

export type AMCCopyContentRenderData = {
  isCodeGrid: boolean
  groupsSections: string
  mergedGroupsContent?: string
  /** Section du groupe total (cleargroup + copygroup + titre + restituegroupe). Prioritaire sur mergedGroupsContent. */
  totalGroupSection?: string
  /** Sections individuelles des groupes non fusionnés dans le groupe total. */
  nonMergedGroupsSections?: string
  isA3: boolean
  isAssociation: boolean
  collectCorrectionsAtEnd?: boolean
  mergeGroupsAndShuffle?: boolean
}

export type AMCGroupSectionRenderData = {
  groupTitle: string
  groupName: string
  isMixed: boolean
  questionsToRestore: number
  pageBreakBefore?: boolean
  multicols?: boolean
}

export const AMCPreambleTemplate = `% !TEX encoding = UTF-8 Unicode
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%% -I- PRÉAMBULE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	 \\documentclass[{{ documentClassOptions }}]{article}
	
  %%%%%% EE : Le mettre le plus tôt possible pour éviter un Warning à la compilation
  \\RequirePackage{etex}	  % pour avoir plus de "registres" mémoires / tikz...
  %%%%% PACKAGES LANGUE %%%%%
  \\usepackage{babel} % sans option => langue définie dans la classe du document
   \\usepackage{iftex}
   \\ifPDFTeX
     \\usepackage[T1]{fontenc}
     \\usepackage[utf8x]{inputenc}
     \\usepackage{lmodern}
   \\else
     \\usepackage{fontspec}
     \\setmainfont{Latin Modern Roman}
   \\fi
   \\usepackage{fp}
   \\usepackage{ProfCollege}

  %%%%%%%%%%%%%%%%%%%%% SPÉCIFICITÉS A.M.C. %%%%%%%%%%%%%%%%%%%%%%
  %\\usepackage[francais,bloc,completemulti]{automultiplechoice}
  %   remarque : avec completmulti => "aucune réponse ne convient" en +
   \\usepackage[francais,bloc,insidebox,nowatermark]{automultiplechoice} %//,insidebox
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  %%%%% PACKAGES MISE EN PAGE %%%%%
   \\usepackage{multicol}
   \\usepackage{wrapfig}
   \\usepackage{fancybox}  % pour \\doublebox \\shadowbox  \\ovalbox \\Ovalbox
   \\usepackage{calc} 	% Calculs
   \\usepackage{enumerate}	% Pour modifier les numérotations
   \\usepackage{enumitem}
   \\usepackage{tabularx}	% Pour faire des tableaux

   \\usepackage{xargs}	% EE : pour permettre DES options dans newcommand

  %%%%% PACKAGES FIGURES %%%%%
  %\\usepackage{pstricks,pst-plot,pstricks-add}
  %   POUR PSTRICKS d'où compilation sans PDFLateX mais : dvi, dvi2ps, ps2PDF...
  %   MAIS ON PRÉFÉRERA UTILISER TIKZ...
  \\usepackage{xcolor}% [avant tikz] xcolor permet de nommer + de couleurs
  \\usepackage{pgf,tikz}
  \\usepackage{graphicx} % pour inclure une image
  \\usetikzlibrary{arrows,calc,fit,patterns,plotmarks,shapes.geometric,shapes.misc,shapes.symbols,shapes.arrows,
    shapes.callouts, shapes.multipart, shapes.gates.logic.US,shapes.gates.logic.IEC, er, automata,backgrounds,chains,topaths,trees,petri,mindmap,matrix, calendar, folding,fadings,through,positioning,scopes,decorations.fractals,decorations.shapes,decorations.text,decorations.pathmorphing,decorations.pathreplacing,decorations.footprints,decorations.markings,shadows,babel} % Charge toutes les librairies de Tikz
  \\usepackage{tkz-tab,tkz-fct,tkz-euclide}	% Géométrie euclidienne avec TikZ
  %\\usetkzobj{all} %problème de compilation

  %%%%% PACKAGES MATHS %%%%%
   \\usepackage{ucs}
   \\usepackage{bm}
   \\usepackage{amsmath}
   \\usepackage{amsfonts}
   \\usepackage{amssymb}
  % Alias robustes pour les ensembles usuels, fréquents dans les énoncés.
  \\providecommand{\\R}{\\mathbb{R}}
  \\providecommand{\\N}{\\mathbb{N}}
  \\providecommand{\\Z}{\\mathbb{Z}}
  \\providecommand{\\Q}{\\mathbb{Q}}
  \\providecommand{\\C}{\\mathbb{C}}
   \\usepackage{gensymb}
   \\usepackage{eurosym}
   \\usepackage{frcursive}
   \\newcommand{\\Vcurs}{\\begin{cursive}V\\end{cursive}}
   \\usepackage[normalem]{ulem}
   % plus utilisé avec ProfCollege
   % \\usepackage{sistyle} \\SIdecimalsign, %% => \\num{...} \\num*{...}
   % cf. http://fr.wikibooks.org/wiki/LaTeX/%C3%89crire_de_la_physique
   %  sous Ubuntu, paquet texlive-science à installer
   %\\usepackage[autolanguage,np]{numprint} % déjà appelé par défaut dans introLatex
   \\usepackage{mathrsfs}  % Spécial math
   %\\usepackage[squaren]{SIunits}	% Pour les unités (gère le conflits avec  \\square de l'extension amssymb)
   \\usepackage{pifont}	% Pour les symboles "ding"
   \\usepackage{bbding}	% Pour les symboles
   \\usepackage[misc]{ifsym}	% Pour les symboles
   \\usepackage{cancel}	% Pour pouvoir barrer les nombres

  %%%%% AUTRES %%%%%
   \\usepackage{ifthen}
   \\usepackage{url} 	        	% Pour afficher correctement les url
   \\urlstyle{sf}                          	% qui s'afficheront en police sans serif
   \\usepackage{fancyhdr,lastpage}          	% En-têtes et pieds
    \\pagestyle{fancy}                      	% de pages personnalisés
   \\usepackage{fancybox}	% Pour les encadrés
   \\usepackage{xlop}	% Pour les calculs posés
  %\\usepackage{standalone}	% Pour avoir un apercu d'un fichier qui sera utilisé avec un input
   \\usepackage{multido}	% Pour faire des boucles
  %\\usepackage{hyperref}	% Pour gérer les liens hyper-texte
   \\usepackage{fourier}
   \\usepackage{colortbl} 	% Pour des tableaux en couleur
   \\usepackage{setspace}	% Pour \\begin{spacing}{2.0} \\end{spacing}
   \\usepackage{multirow}	% Pour des cellules multilignes dans un tableau
  %\\usepackage{import}	% Equivalent de input mais en spécifiant le répertoire de travail
  %\\usepackage[]{qrcode}
  %\\usepackage{pdflscape}
   \\usepackage[framemethod=tikz]{mdframed} % Pour les cadres
   \\usepackage{tikzsymbols}
   \\usepackage{scratch3}
  %\\usepackage{tasks}	% Pour les listes horizontales
\\usepackage{csvsimple}

  %%%%% Librairies utilisées par Mathgraphe32 %%%%
  \\usepackage{fix-cm}
  \\usepackage{textcomp}
  
  %%%%% PERSONNALISATION %%%%%

   %%%%% PERSONNALISATION %%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%% Pour compiler la correction sans AMC décommenter les lignes suivantes
%%%%%%%%%%%%%%%%%%%%%%%%%%%% ne pas oublier de les commenter à nouveaupour finaliser les copies dans AMC
% \\makeatletter \\def\\AMCforcecorrect{\\AMC@correctrue} \\makeatother
% \\AMCforcecorrect
% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%%% Explications %%%
  \\ExplSyntaxOn
\\tl_new:N \\explications
\\cs_new:Nn \\expl_vide: {
  \\tl_gset:Nn \\explications { \\debutexplications }
}
\\cs_new:Npn \\expl_ajoute:n #1 {
  \\tl_gput_right:Nn \\explications { #1 }
}
\\cs_new:Nn \\expl_ecrit: {
  \\tl_use:N \\explications
}
\\cs_new_eq:NN \\AMCexpliqueNouvelleCopie \\expl_vide:
\\cs_new_eq:NN \\AMCexpliqueAjoute \\expl_ajoute:n
\\cs_new_eq:NN \\AMCexpliqueTout \\expl_ecrit:
\\ExplSyntaxOff
\\def\\debutexplications{
  \\vspace{1ex}\\par\\noindent\\textbf{Élément de correction et d'explication :}\\vspace{.5ex}
}
{% raw %}
\\def\\laquestion#1{
  \\par\\noindent\\textbf{Question \\AMCref{#1}}
}
\\long\\def\\expliqueplustard#1#2{%
  \\AMCexpliqueAjoute{\\laquestion{#1} #2 \\bigskip}%
}
{% endraw %}
  %%% Fin des explications %%%

  \\renewcommand{\\multiSymbole}{$\\begin{smallmatrix}\\circ\\bullet\\bullet \\\\
           \\circ\\bullet\\circ \\end{smallmatrix}$\\noindent} % par défaut $\\clubsuit$
  %\\renewcommand{\\multiSymbole}{\\textbf{(! Évent. plusieurs réponses !)}\\noindent} % par défaut $\\clubsuit$
  \\renewcommand{\\AMCbeginQuestion}[2]{\\noindent{\\colorbox{gray!20}{\\bf#1}}#2}
  %\\renewcommand{\\AMCIntervalFormat}[2]{\\texttt{[}#1\\,;\\,#2\\texttt{[}}
                           % Crochets plus nets, virgule...
  %\\AMCboxDimensions{size=1.7ex,down=.2ex} %% taille des cases à cocher diminuée
  \\newcommand{\\collerVertic}{\\vspace{-3mm}} % évite un trop grand espace vertical
  \\newcommand{\\TT}{\\sout{\\textbf{Tiers Temps}} \\noindent} %
  \\newcommand{\\Prio}{\\fbox{\\textbf{PRIORITAIRE}} \\noindent} %
  \\newcommandx{\\notation}[3][2=false,3=true]{
    \\AMCOpen{lines=#1,lineup=#2,lineuptext=\\hspace{1cm},dots=#3}{\\mauvaise[{\\tiny NR}]{NR}\\scoring{0}\\mauvaise[{\\tiny RR}]{RR}\\scoring{0.01}\\mauvaise[{\\tiny R}]{R}\\scoring{0.33}\\mauvaise[{\\tiny V}]{V}\\scoring{0.67}\\bonne[{\\tiny VV}]{VV}\\scoring{1}}
  }
  %%\\newcommand{\\notation}[1]{
  %%\\AMCOpen{lines=#1}{\\mauvaise[{\\tiny NR}]{NR}\\scoring{0}\\mauvaise[{\\tiny RR}]{RR}\\scoring{0.01}\\mauvaise[{\\tiny R}]{R}\\scoring{0.33}\\mauvaise[{\\tiny V}]{V}\\scoring{0.67}\\bonne[{\\tiny VV}]{VV}\\scoring{1}}
  %%}
  
  %%pour afficher ailleurs que dans une question
  \\makeatletter
  \\newcommand{\\AffichageSiCorrige}[1]{\\ifAMC@correc #1\\fi}
  \\makeatother
  
  
  %%%%% TAILLES %%%%%
   \\usepackage{geometry}
   \\geometry{headsep=0.3cm, left=1.5cm,right=1.5cm,top=2.4cm,bottom=1.5cm}
   \\DecimalMathComma
  
   \\AMCcodeHspace=.3em % réduction de la taille des cases pour le code élève
   \\AMCcodeVspace=.3em
  % \\AMCcodeBoxSep=.1em
   
   \\def\\AMCotextReserved{\\emph{Ne rien cocher, réservé au prof !}}
   
  %%%%%% Définition des barèmes
  \\baremeDefautS{
    e=0.0001,% incohérence (plusieurs réponses données à 0,0001 pour définir des manquements au respect de consignes)
    b=1,% bonne réponse 1
    m=-0.01,% mauvaise réponse 0,01 pour différencier de la
    v=0} % non réponse qui reste à 0
  
  \\baremeDefautM{formula=((NBC-NMC)/NB)*((NBC-NMC)/NB>0)} % nombre de bonnes réponses cochées minorées des mauvaises réponses cochées, ramenées à 1, et ramenée à 0 si résultat négatif.
  
  %%%%%%%%% Paramètres pour réponses à construire
  \\AMCinterIrep=0pt \\AMCinterBrep=.5ex \\AMCinterIquest=0pt \\AMCinterBquest=3ex \\AMCpostOquest=7mm \\setlength{\\AMChorizAnswerSep}{3em plus 4em} \\setlength{\\AMChorizBoxSep}{1em}
{% if dynamicPreamble %}
{{ dynamicPreamble | safe }}
{% endif %}
  %%%%% Fin du préambule %%%%%%%
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
`

export const AMCHeaderTemplate = `{% if isAssociation %}\\newcommand{\\sujet}{
{% endif %}
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  %%%% -II-b. MISE EN PAGE DU QCM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  \\exemplaire{ {{- nbExemplaires -}} }{   % <======  /!\\ PENSER À ADAPTER /!\\  ===  %
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
{% if collectCorrectionsAtEnd %}
  \\AMCexpliqueNouvelleCopie
{% endif %}
{% if isA3 %}\\begin{multicols}{2}
{% endif %}
  %%%%% EN-TÊTE, IDENTIFICATION AUTOMATIQUE DE L'ÉLÈVE %%%%%
  
  \\vspace*{-17mm}
  
  %%%%% INTRODUCTION ÉVENTUELLE %%%%%
  
  \\vspace{5mm}
  %\\noindent\\AMCcode{num.etud}{8}\\hspace*{\\fill} % Pour la version "verticale"
  %\\noindent\\AMCcodeH{num.etud}{8}	 % version "horizontale"
  \\begin{minipage}{7cm}
  \\begin{center}
    \\textbf{ {{- matiere -}} }
    
    \\textbf{ {{- titre -}} }
  \\end{center}
  \\end{minipage}
  \\hfill
{% if isAssociation %}\\begin{center}
  \\noindent{}\\fbox{\\vspace*{3mm}
       \\Large\\bf\\nom{}~\\prenom{}\\normalsize{}%
        \\vspace*{3mm}
      }
  \\end{center}
{% elif isCodeGrid %}\\begin{minipage}{10cm}
  \\champnom{\\fbox{\\parbox{10cm}{
    Écrivez vos nom, prénom et classe : \\\\
  }}}
  \\end{minipage}
  
  %\\\\
  \\vspace{2mm}
  
  Puis remplir les cases des trois premières lettres de votre \\textbf{nom de famille} PUIS des deux premières lettres de votre \\textbf{prénom}
  \\vspace{1mm}

  \\def\\AMCchoiceLabelFormat##1{\\textcolor{black!70}{\\tiny ##1}}  % pour alléger la couleur des lettres dans les cases et les réduire
  \\AMCcodeGrid[h]{ID}{ABCDEFGHIJKLMNOPQRSTUVWXYZ,
  ABCDEFGHIJKLMNOPQRSTUVWXYZ,
  ABCDEFGHIJKLMNOPQRSTUVWXYZ,
  ABCDEFGHIJKLMNOPQRSTUVWXYZ,
  ABCDEFGHIJKLMNOPQRSTUVWXYZ}
{% else %}\\begin{minipage}{10cm}
  \\champnom{\\fbox{\\parbox{10cm}{
    Écrivez vos nom, prénom et classe : \\\\
   \\\\
  }}}
  \\end{minipage}
  
  %\\\\
  \\vspace{2mm}
{% endif %}
{% if showWarningMessage %}{\\footnotesize {{ warningMessage | safe -}} }
{% endif %}
  
`

export const AMCDocumentStartTemplate = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%% -II-DOCUMENT %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\begin{document}
\\AMCrandomseed{ {{- seed -}} }   % On choisit les "graines" pour initialiser le "hasard"
\\FPseed={{- seed -}}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%% -II-a. CONCEPTION DU QCM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  %%% préparation des groupes
  \\setdefaultgroupmode{ {{- "withoutreplacement" if mergeGroupsAndShuffle else "cyclic" -}} }
{{ groupsContent | safe }}
`

export const AMCCopyContentTemplate = `{% if isCodeGrid %}	 \\def\\AMCchoiceLabel##1{}{% endif %}
{% if mergeGroupsAndShuffle %}{% if totalGroupSection is defined %}{{ totalGroupSection | safe }}{{ nonMergedGroupsSections | safe }}{% else %}{{ mergedGroupsContent | safe }}{% endif %}{% else %}{{ groupsSections | safe }}{% endif %}{% if collectCorrectionsAtEnd %}\\explaincontext{\\AMCexpliqueTout}
{% endif %}{% if isA3 %}\\end{multicols}
{% endif %}{% if isAssociation %}\\AMCassociation{\\id}
    }
  }
{% else %}}
{% endif %}`

export const AMCGroupSectionTemplate = `
{% if pageBreakBefore %}\\clearpage
{% endif %}
{% if groupTitle and (groupTitle | trim | length) > 0 %}
  \\begin{center}
    \\hrule
    \\vspace{2mm}
    \\bf\\Large {{ groupTitle -}}
    \\vspace{1mm}
    \\hrule
  \\end{center}
{% else %}
  \\hrule
{% endif %}
{% if not isMixed %}\\setgroupmode{ {{- groupName -}} }{cyclic}

{% endif %}{% if multicols %}\\begin{multicols}{2}
{% endif %}{% if questionsToRestore > 0 %}\\restituegroupe[{{- questionsToRestore -}}]{ {{- groupName -}} }

{% else %}\\restituegroupe{ {{- groupName -}} }

{% endif %}{% if multicols %}\\end{multicols}
{% endif %}`

function normalizeAmcTitleApostrophes(value: string): string {
  return value.replace(/[\u2018\u2019]/g, "'")
}

export function renderAMCPreamble(data: AMCPreambleRenderData) {
  return renderTemplate(AMCPreambleTemplate, data)
}

export function renderAMCHeader(data: AMCHeaderRenderData) {
  return renderTemplate(AMCHeaderTemplate, {
    ...data,
    titre: normalizeAmcTitleApostrophes(data.titre),
  })
}

export function renderAMCDocumentStart(data: AMCDocumentStartRenderData) {
  return renderTemplate(AMCDocumentStartTemplate, data)
}

export function renderAMCCopyContent(data: AMCCopyContentRenderData) {
  return renderTemplate(AMCCopyContentTemplate, data)
}

export function renderAMCGroupSection(data: AMCGroupSectionRenderData) {
  return renderTemplate(AMCGroupSectionTemplate, {
    ...data,
    groupTitle: normalizeAmcTitleApostrophes(data.groupTitle),
  })
}
