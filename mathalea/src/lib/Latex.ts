import seedrandom from 'seedrandom'
import { ExamTemplateEngine } from '../components/setup/latex/LatexConfig'
import Exercice from '../exercices/Exercice'
import {
  loadFonts,
  loadLayoutOverrides,
  loadPackagesFromContent,
  loadPreambule,
  loadProfCollegeIfNeed,
  LOGO_CAN_TEX_FILE,
  logPDF,
} from '../lib/latex/preambuleTex'
import {
  isIExercice,
  type IExercice,
  type IExerciceStatique,
} from '../lib/types'
import { retrieveResourceFromUuid } from './components/refUtils'
import { isMathadataUuid } from './components/mathadataReferentiel'
import genericPreamble from './latex/preambule.tex?raw'
import mathadataCompatTex from './latex/mathadata-compat.tex?raw'
import { decodeExosGrouping, findExoPosition } from './LatexGroup'
import {
  preambuleBanque,
  referentielBanquesExternes,
} from './stores/banquesExternesStore'
import { estUuidBanqueExterne } from './types/banquesExternes'
import { isBanqueExterneType } from './types/referentiels'
import type {
  ExerciceLayoutConfig,
  ExoContent,
  LatexFileInfos,
  contentsType,
  latexFileType,
  picFile,
} from './LatexTypes'
import { mathaleaHandleExerciceSimple } from './mathalea.js'
import { getLang } from './stores/languagesStore'

export function sanitizeLatexInput(str: string): string {
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/&/g, '\\&')
    .replace(/_/g, '\\_')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/\^/g, '\\^{}')
    .replace(/~/g, '\\textasciitilde{}')
}

/**
 * Échappe les `%` d'un titre d'exercice : non échappé, il commente la fin de
 * la ligne et casse l'option `Titre={…}` de l'environnement `exercice`.
 * Le reste du titre est laissé tel quel car il peut contenir du LaTeX
 * (`$a+1$`, `\\dfrac`…).
 */
export function escapeLatexTitle(titre: string): string {
  return titre.replace(/(?<!\\)%/g, '\\%')
}

/** Référence d'une annale : examen, mois, année et lieu. */
function staticReferenceOf(exercice: IExerciceStatique): string {
  return `${exercice.examen || ''} ${exercice.mois || ''} ${exercice.annee || ''} ${exercice.lieu || ''}`
    .replace(/\s+/g, ' ')
    .trim()
}

function testIfLoaded(
  values: string[],
  valuetoSearch: string,
  valueToPut: string,
) {
  let search = false
  for (const value of values) {
    if (value.includes(valuetoSearch)) {
      search = true
      break
    }
  }
  if (search) {
    return valueToPut
  }
  return ''
}

function estimerLongueurLatex(
  texte: string,
  options: {
    includeSpaces?: boolean
  } = {},
): string {
  const { includeSpaces = true } = options

  // Étape 1: Supprimer les commandes LaTeX qui ne produisent pas de caractères visibles
  let nettoye = texte
    // Remplacer les commandes mathématiques simples comme $f$ par 'f'
    .replace(/\$([^$]+)\$/g, '$1')
    // Remplacer \mathbb{R} par 'R' (un caractère)
    .replace(/\\mathbb\{R\}/g, 'R')
    .replace(/\\mathbb\{([^}]+)\}/g, '$1') // cas général
    // Supprimer autres commandes LaTeX courantes
    .replace(/\\[a-zA-Z]+/g, '') // enlève les commandes comme \text, \frac, etc.
    .replace(/[{}]/g, '') // enlève les accolades

  // Compter les caractères (en tenant compte des espaces si demandé)
  if (!includeSpaces) {
    nettoye = nettoye.replace(/\s/g, '')
  }

  return nettoye
}

class Latex {
  exercices: (IExercice | IExerciceStatique)[]
  constructor() {
    this.exercices = []
  }

  isExerciceStaticInTheList() {
    return this.exercices.some((e) => e.typeExercice === 'statique')
  }

  isMathadataExerciceInTheList() {
    return this.exercices.some((e) => isMathadataUuid(String(e.uuid)))
  }

  /**
   * Code LaTeX du préambule déclaré par les banques externes dont un exercice
   * figure dans la liste (voir `manifest.preambule.tex`), une seule fois par
   * banque même si elle fournit plusieurs exercices de la fiche.
   */
  preambulesBanquesExternes(): string {
    const referentiel = referentielBanquesExternes()
    const idsBanques = new Set<string>()
    for (const e of this.exercices) {
      const uuid = String(e.uuid)
      if (!estUuidBanqueExterne(uuid)) continue
      const ressource = retrieveResourceFromUuid(referentiel, uuid)
      if (ressource !== null && isBanqueExterneType(ressource)) {
        idsBanques.add(ressource.banque)
      }
    }
    return [...idsBanques]
      .map((id) => preambuleBanque(id)?.tex)
      .filter((tex): tex is string => tex !== undefined)
      .join('\n')
  }

  getExercices() {
    return this.exercices.map((e, i) => ({
      titre: isIExercice(e) ? e.titre : '',
      uuid: e.uuid,
      index: i,
    }))
  }

  addExercices(exercices: (IExercice | IExerciceStatique)[]) {
    this.exercices.push(...exercices)
  }

  getContentsForAVersion(
    latexFileInfos: LatexFileInfos,
    indiceVersion: number = 1,
  ): { content: string; contentCorr: string } {
    if (latexFileInfos.style === 'ProfMaquette') {
      return {
        content: this.getContentForAVersionProfMaquette(
          indiceVersion,
          latexFileInfos,
        ),
        contentCorr: '',
      }
    }
    if (latexFileInfos.style === 'ProfMaquetteQrcode') {
      latexFileInfos.qrcodeOption = 'AvecQrcode'
      return {
        content: this.getContentForAVersionProfMaquette(
          indiceVersion,
          latexFileInfos,
        ),
        contentCorr: '',
      }
    }
    let content = ''
    let contentCorr = ''
    this.loadExercicesWithVersion(indiceVersion)
    if (latexFileInfos.style === 'Can') {
      content += '\\begin{TableauCan}\n'
      contentCorr += '\n\\begin{enumerate}'
      for (const exercice of this.exercices) {
        if (exercice != null) {
          if (exercice.typeExercice === 'statique') {
            if (exercice.content === '') {
              content += '\\CompteurTC  &'
              content += "% Cet exercice n'est pas disponible au format LaTeX\n"
              content += '&\\stepcounter{nbEx}\\\\ \n'
              contentCorr += `\n\\item  Cet exercice n'est pas disponible au format LaTeX`
            } else {
              content += '\\CompteurTC  &'
              content += `\n % @see : ${getUrlFromExercice(exercice)}`
              content += `\n %{${exercice.examen || ''} ${exercice.mois || ''} ${exercice.annee || ''} ${exercice.lieu || ''}}\n`
              content += exercice.content
              content += '&\\stepcounter{nbEx}\\\\ \n'
              contentCorr += `\n\\item ${exercice.contentCorr || ''}`
            }
          } else if (isIExercice(exercice)) {
            // Initalisation de questionLiee à rien pour toutes les questions
            const questionLiee: {
              compteurQuestionsLiees: number
              dejaLiee: boolean
            }[] = Array.from(
              { length: exercice.listeQuestions?.length },
              () => ({
                compteurQuestionsLiees: 0,
                dejaLiee: false,
              }),
            )

            for (let i = 0; i < exercice.listeQuestions.length; i++) {
              // Enoncé de la question
              const enonce =
                exercice.listeCanEnonces != null &&
                exercice.listeCanEnonces[i] !== undefined &&
                exercice.listeCanEnonces[i].length !== 0
                  ? exercice.listeCanEnonces[i]
                  : exercice.listeQuestions[i]

              // Ne fonctionne que pour les CAN
              if (
                exercice.listeCanLiees != null &&
                !exercice.listeCanLiees.every((subTab) => subTab.length === 0)
              ) {
                // Recherche si la question est liée à la suivante et aux prochaines
                if (
                  exercice.listeCanLiees != null &&
                  exercice.listeCanLiees[i].length !== 0 &&
                  !questionLiee[i].dejaLiee
                ) {
                  // Recherche d'une question liée à d'autres
                  let j = i + 1
                  let questionSuivante = j < exercice.listeQuestions.length
                  while (questionSuivante) {
                    // Recherche des questions liées à la précédente
                    questionLiee[j].dejaLiee = exercice.listeCanLiees[
                      j
                    ].includes(exercice.listeCanNumerosLies[i])
                    if (questionLiee[j].dejaLiee) {
                      questionLiee[i].compteurQuestionsLiees++
                    }
                    questionSuivante =
                      questionLiee[j] && j < exercice.listeQuestions.length - 1
                    j++
                  }
                }
              }

              // L'énoncé des CAN est dépendant des questions liées ou pas
              content += '\\CompteurTC  &'
              if (questionLiee[i].compteurQuestionsLiees !== 0) {
                content += `\\SetCell[r=${questionLiee[i].compteurQuestionsLiees + 1}]{c}`
              }
              content += !questionLiee[i].dejaLiee
                ? ` { ${format(enonce)} }&`
                : '&'

              // La réponse à compléter des CAN est indépendante des questions liées
              if (
                exercice.listeCanReponsesACompleter != null &&
                exercice.listeCanReponsesACompleter[i] !== undefined
              ) {
                content += `{${format(exercice.listeCanReponsesACompleter[i])} }`
              }
              content += '&\\stepcounter{nbEx}\\\\'

              if (
                i + 1 < exercice.listeQuestions.length &&
                questionLiee[i + 1].dejaLiee
              ) {
                content += '*'
              } // Cette étoile permet de gérer les sauts de page malencontreux
              content += '\n'
            }
            // On itère sur le nombre de questions (et non listeCorrections) pour garder
            // une correspondance 1-1 avec les lignes ajoutées à content ci-dessus : un
            // exercice qui ne remplit pas listeCorrections (ex. outil interactif pur)
            // ne doit pas laisser l'environnement enumerate sans aucun \item, ce qui
            // provoque une erreur LaTeX "Something's wrong--perhaps a missing \item."
            for (let i = 0; i < exercice.listeQuestions.length; i++) {
              contentCorr += `\n\\item ${format(exercice.listeCorrections[i] ?? '')}`
            }
          }
        }
      }
      contentCorr += '\n\\end{enumerate}\n'
      // Supprime le \\ (ou \\*) final pour éviter "There's no line here to end"
      content = content.replace(/\\\\\*?\n$/, '\n')
      content = convertNestedTabularsForTableauCan(content)
      content += '\\end{TableauCan}\n\\addtocounter{nbEx}{-1}'
      /** On supprime les lignes vides car elles posent problème dans l'environnement TableauCan */
      //  content = content.replace(/\n\s*\n/gm, '\n') // En quoi elle posent problème ? On perd les sauts de ligne entre les questions, c'est pas top pour la lisibilité
    } else {
      const withReferences = latexFileInfos.withReferences ?? false
      // Un exercice fusionné prolonge le cadre du précédent : la fermeture de
      // `EXO` est donc différée jusqu'au premier exercice non fusionné.
      let isExoOpen = false
      let isCorrOpen = false
      /**
       * Ouvre le cadre d'un exercice — ou, s'il est fusionné avec le
       * précédent, se contente de l'en séparer.
       */
      const openExo = (hook: string, reference: string, merged: boolean) => {
        if (merged && isExoOpen) return '\n\\medskip\n\n'
        const closing = isExoOpen ? '\n\\end{EXO}\n' : ''
        isExoOpen = true
        return `${closing}\n\\begin{EXO}{${hook}}{${reference}}\n`
      }
      const openCorr = (merged: boolean) => {
        if (merged && isCorrOpen) return '\n\\medskip\n\n'
        const closing = isCorrOpen ? '\n\\end{EXO}\n' : ''
        isCorrOpen = true
        return `${closing}\n\\begin{EXO}{}{}\n`
      }
      // Numérotation des questions d'un exercice fusionné : elle continue
      // celle de l'exercice précédent plutôt que de repartir à 1 (les deux
      // listes restent des `enumerate` distincts, `buildContent` reçoit donc
      // le numéro de départ). Un exercice non fusionné remet le compteur à
      // zéro ; un exercice statique (annale) ne l'avance pas — son contenu
      // n'est pas une liste numérotée que ce mécanisme connaît, une fusion
      // à travers lui repart donc du numéro déjà atteint avant lui.
      // Énoncés et corrections sont deux sections séparées du document
      // (`content` / `contentCorr`), donc deux compteurs indépendants.
      let mergeQuestionCount = 0
      let mergeQuestionCountCorr = 0
      for (const [index, exercice] of this.exercices.entries()) {
        // les réglages par exercice, jusqu'ici réservés aux habillages
        // ProfMaquette, valent pour tous
        const confExo = latexFileInfos.exos?.[String(index)] ?? {}
        const merged = index > 0 && confExo.mergeWithPrevious === true
        if (!merged) {
          mergeQuestionCount = 0
          mergeQuestionCountCorr = 0
        }
        // la découpe des cadres d'exercice passe par un style redéfinissable
        // (`mathaleaexo`, voir `preambule.tex`)
        if (!merged) {
          content +=
            confExo.unbreakable === true
              ? '\n\\tcbset{mathaleaexo/.style={unbreakable}}'
              : '\n\\tcbset{mathaleaexo/.style={breakable}}'
        }
        content += breaksBefore(confExo)
        if (exercice.typeExercice === 'statique') {
          if (exercice.content === '') {
            content += "% Cet exercice n'est pas disponible au format LaTeX"
          } else {
            content += `\n% @see : ${getUrlFromExercice(exercice)}`
            const staticReference = withReferences
              ? `${exercice.examen || ''} ${exercice.mois || ''} ${exercice.annee || ''} ${exercice.lieu || ''}`.trim()
              : ''
            content += openExo(staticReference, '', merged)
            content += wrapInSpacing(
              testIfLoaded(
                [exercice.content ?? ''],
                '\\anote{',
                '\n\\resetcustomnotes',
              ) +
                exercice.content +
                testIfLoaded(
                  [exercice.content ?? ''],
                  '\\anote{',
                  '\n\\printcustomnotes',
                ) +
                writingLinesAtEnd(confExo),
              confExo,
            )
            contentCorr += openCorr(merged)
            contentCorr += testIfLoaded(
              [exercice.contentCorr ?? ''],
              '\\anote{',
              '\n\\resetcustomnotes',
            )
            contentCorr += exercice.contentCorr
            contentCorr += testIfLoaded(
              [exercice.contentCorr ?? ''],
              '\\anote{',
              '\n\\printcustomnotes',
            )
          }
        } else if (isIExercice(exercice)) {
          contentCorr += openCorr(merged)
          contentCorr += testIfLoaded(
            exercice.listeCorrections,
            '\\anote{',
            '\n\\resetcustomnotes',
          )
          contentCorr += buildContent(
            exercice.listeCorrections,
            exercice.spacingCorr,
            Boolean(exercice.listeAvecNumerotation),
            confExo.cols_corr ?? Number(exercice.nbColsCorr),
            correctionConf(confExo),
            merged ? mergeQuestionCountCorr + 1 : undefined,
          )
          mergeQuestionCountCorr += Math.max(
            exercice.listeCorrections.length,
            1,
          )
          contentCorr += testIfLoaded(
            exercice.listeCorrections,
            '\\anote{',
            '\n\\printcustomnotes',
          )
          content += `\n% @see : ${getUrlFromExercice(exercice)}`
          content += openExo(
            testIfLoaded(
              [
                exercice.introduction,
                exercice.consigne,
                ...exercice.listeQuestions,
              ],
              '\\anote{',
              '\n\\resetcustomnotes ',
            ),
            withReferences ? String(exercice.id).replace('.js', '') : '',
            merged,
          )
          content += wrapInSpacing(
            // La consigne est sortie de l'argument de l'environnement : des
            // retours à la ligne dedans le cassaient.
            format(exercice.consigne, false) +
              '\n\n' +
              writeIntroduction(exercice.introduction) +
              buildContent(
                exercice.listeQuestions,
                exercice.spacing,
                Boolean(exercice.listeAvecNumerotation),
                confExo.cols ?? Number(exercice.nbCols),
                confExo,
                merged ? mergeQuestionCount + 1 : undefined,
              ) +
              testIfLoaded(
                [
                  exercice.introduction,
                  exercice.consigne,
                  ...exercice.listeQuestions,
                ],
                '\\anote{',
                '\n\\printcustomnotes',
              ) +
              writingLinesAtEnd(confExo),
            confExo,
          )
          mergeQuestionCount += Math.max(exercice.listeQuestions.length, 1)
        }
      }
      if (isExoOpen) content += '\n\\end{EXO}\n'
      if (isCorrOpen) contentCorr += '\n\\end{EXO}\n'
    }
    content = content.replace(/\{images\//gi, '{') // exercice n°4P10
    contentCorr = contentCorr.replace(/\{images\//gi, '{') // exercice n°4P10
    return { content, contentCorr }
  }

  loadExercicesWithVersion(indiceVersion: number = 1) {
    for (const exercice of this.exercices) {
      if (exercice.typeExercice === 'statique') {
        const serie = exercice?.examen?.toLowerCase()
        if (serie === 'crpe' && indiceVersion === 1) {
          exercice.content = exercice.content?.replaceAll('{Images/', '{')
          exercice.contentCorr = exercice.contentCorr?.replaceAll(
            '{Images/',
            '{',
          )
        }
        continue
      }
      if (!Object.prototype.hasOwnProperty.call(exercice, 'listeQuestions')) {
        continue
      }
      if (isIExercice(exercice)) {
        const seedOld = exercice.seed
        const seed =
          indiceVersion > 1
            ? exercice.seed + indiceVersion.toString()
            : exercice.seed
        exercice.seed = seed
        if (exercice.typeExercice === 'simple') {
          mathaleaHandleExerciceSimple(exercice, false)
        } else {
          seedrandom(seed, { global: true })
          if (typeof exercice.nouvelleVersionWrapper === 'function') {
            exercice.nouvelleVersionWrapper()
          }
        }
        exercice.seed = seedOld // on remet l'ancienne seed pour ne pas perturber la génération des versions suivantes
      }
    }
  }

  getContentForAVersionProfMaquette(
    indiceVersion: number = 1,
    latexFileInfos: LatexFileInfos,
  ): string {
    this.loadExercicesWithVersion(indiceVersion)
    let content = ''
    const groups = decodeExosGrouping(
      latexFileInfos.exosGrouping ?? '',
      this.exercices.length,
    )
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const groupNbrs = groups[groupIndex]
      const exoGroups = new Exercice()
      let contentlocal = ''
      for (let i = 0; i < groupNbrs.length; i++) {
        const exoIndex = groupNbrs[i]

        const exercice = this.exercices[exoIndex]
        if (exercice.typeExercice === 'statique') {
          content += `\n% @see : ${getUrlFromExercice(exercice, indiceVersion)}`
          content += this.generateStaticExerciseContent(
            exercice as IExerciceStatique,
            latexFileInfos,
            indiceVersion,
          )
        } else if (isIExercice(exercice)) {
          contentlocal += `\n% @see Group ${exoIndex}: ${getUrlFromExercice(this.exercices[exoIndex], indiceVersion)}`

          const prefix = [exercice.introduction, exercice.consigne]
            .filter(Boolean)
            .join('\n')

          const questionsAvecIntro = exercice.listeQuestions.map(
            (q) => `${prefix}\n${q}`,
          )
          exoGroups.listeQuestions = [
            ...exoGroups.listeQuestions,
            ...questionsAvecIntro,
          ]
          exoGroups.listeCorrections = [
            ...exoGroups.listeCorrections,
            ...exercice.listeCorrections,
          ]
          exoGroups.typeExercice = exercice.typeExercice
          exoGroups.titre = exoGroups.titre + '\n' + `Groupe ${groupIndex + 1}`
        }
      }

      if (exoGroups.listeQuestions.length === 0) continue

      const confExo: ExerciceLayoutConfig =
        latexFileInfos.exos && latexFileInfos.exos[groupNbrs[0]]
          ? latexFileInfos.exos[groupNbrs[0]]
          : {}
      content +=
        contentlocal +
        this.generateExerciseContent(
          latexFileInfos,
          exoGroups,
          indiceVersion,
          confExo,
        )
    }

    for (let k = 0; k < this.exercices.length; k++) {
      if (findExoPosition(groups, k)) continue // cet exercice est déjà dans un groupe, on l'ignore ici
      const exercice = this.exercices[k]

      content += `\n% @see : ${getUrlFromExercice(exercice, indiceVersion)}`

      const confExo: ExerciceLayoutConfig =
        latexFileInfos.exos && latexFileInfos.exos[k]
          ? latexFileInfos.exos[k]
          : {}

      if (exercice.typeExercice === 'statique') {
        content += this.generateStaticExerciseContent(
          exercice as IExerciceStatique,
          latexFileInfos,
          indiceVersion,
          confExo,
        )
      } else {
        content += this.generateExerciseContent(
          latexFileInfos,
          exercice as IExercice,
          indiceVersion,
          confExo,
        )
      }
    }
    content = content.replace(/\{images\//gi, '{') // exercice n°4P10
    return content
  }

  /**
   * Clé `Ajout` de ProfMaquette affichant l'identifiant de l'exercice sur le
   * filet inférieur de son cadre, à droite. En haut à droite, il chevauchait
   * les titres longs (posés sur le filet supérieur) ou la première ligne de
   * l'énoncé.
   *
   * Renvoie une liste vide quand l'identifiant est masqué, ou quand le
   * QR-code est affiché (il mène de toute façon à l'exercice).
   */
  private referenceKeyFor(
    latexFileInfos: LatexFileInfos,
    reference: string,
  ): string[] {
    if (latexFileInfos.withReferences !== true) return []
    if (latexFileInfos.qrcodeOption === 'AvecQrcode') return []
    if (reference === '') return []
    return [
      `Ajout={\\node[anchor=east, xshift=-10pt, fill=tcbcolback, inner sep=2pt] at (frame.south east) {\\scriptsize ${sanitizeLatexInput(reference)}};}`,
    ]
  }

  /**
   * Titre ProfMaquette d'un exercice statique : le titre propre de la
   * ressource (MathAdata, banques externes) ou, pour une annale, sa
   * référence (examen, mois, année, lieu) quand les références sont
   * affichées. Chaîne vide s'il n'y a rien de pertinent à afficher.
   */
  private staticTitleFor(
    exercice: IExerciceStatique,
    latexFileInfos: LatexFileInfos,
  ): string {
    if (latexFileInfos.titleOption !== 'AvecTitre') return ''
    if (typeof exercice.titre === 'string' && exercice.titre.trim() !== '') {
      return exercice.titre.trim()
    }
    if (latexFileInfos.withReferences !== true) return ''
    return staticReferenceOf(exercice)
  }

  private generateStaticExerciseContent(
    exercice: IExerciceStatique,
    latexFileInfos: LatexFileInfos,
    indiceVersion: number,
    confExo: ExerciceLayoutConfig = {},
  ) {
    let content = ''
    if (exercice.content === '') {
      content += "% Cet exercice n'est pas disponible au format LaTeX"
    } else {
      content += breaksBefore(confExo)
      content += '\n\\needspace{10\\baselineskip}'
      const title = this.staticTitleFor(exercice, latexFileInfos)
      const titleKey =
        title !== '' ? `Titre={${sanitizeLatexInput(title)}}` : ''
      if (latexFileInfos.qrcodeOption === 'AvecQrcode') {
        content += `\n\\begin{exercice}[${
          titleKey !== '' ? `${titleKey}, ` : ''
        }Ajout={\\node[anchor=north east, inner sep=2pt, fill=white]
        at (frame.north east) {\\hypersetup{urlcolor=black, pdfnewwindow=true}\\qrcode[height=2cm]{${getUrlFromExercice(exercice, indiceVersion)}&v=eleve&es=0211}};
}]%[Lignes=5,Interieur]`
      } else {
        const reference = staticReferenceOf(exercice)
        const keys = [
          ...(titleKey !== '' ? [titleKey] : []),
          // la référence déjà affichée en titre n'est pas répétée en haut à droite
          ...(title === reference
            ? []
            : this.referenceKeyFor(latexFileInfos, reference)),
        ]
        content += `\n\\begin{exercice}${
          keys.length > 0 ? `[${keys.join(', ')}]` : ''
        }%[Lignes=5,Interieur]\n`
      }
      if (latexFileInfos.qrcodeOption === 'AvecQrcode')
        content += '\n\\vspace{2cm}'
      content += wrapInSpacing(
        (exercice.content ?? '') + writingLinesAtEnd(confExo),
        confExo,
      )
      content += '\n\\end{exercice}\n'
      content += '\n\\begin{Solution}\n'
      content += exercice.contentCorr
      content += '\n\\end{Solution}\n'
    }
    return content
  }

  private generateExerciseContent(
    latexFileInfos: LatexFileInfos,
    exercice: IExercice,
    indiceVersion: number,
    confExo: ExerciceLayoutConfig,
  ) {
    let content = breaksBefore(confExo) + '\n\\needspace{10\\baselineskip}'
    if (latexFileInfos.qrcodeOption === 'AvecQrcode') {
      content += `\n\\begin{exercice}[${
        latexFileInfos.titleOption === 'AvecTitre'
          ? `Titre={${escapeLatexTitle(exercice.titre)}}, `
          : ''
      }Ajout={\\node[anchor=north east, inner sep=2pt, fill=white]
        at (frame.north east) {\\hypersetup{urlcolor=black}\\qrcode[height=2cm]{${getUrlFromExercice(exercice, indiceVersion)}&v=eleve&es=0211}};
}]%[Lignes=5,Interieur]`
    } else {
      const keys = [
        ...(latexFileInfos.titleOption === 'AvecTitre'
          ? [`Titre={${escapeLatexTitle(exercice.titre)}}`]
          : []),
        ...this.referenceKeyFor(
          latexFileInfos,
          String(exercice.id ?? '').replace('.js', ''),
        ),
      ]
      content += `\n\\begin{exercice}${
        keys.length > 0 ? `[${keys.join(', ')}]` : ''
      }%[Lignes=5,Interieur]\n`
    }
    content += testIfLoaded(
      [...exercice.listeQuestions, exercice.consigne, exercice.introduction],
      '\\anote{',
      '\n\\resetcustomnotes',
    )
    if (latexFileInfos.qrcodeOption === 'AvecQrcode') {
      const phrases =
        exercice.listeQuestions.length > 0
          ? exercice.listeQuestions[0].split(/\\\\|\r?\n/)
          : []
      const firstQuestion =
        phrases.length > 0 ? estimerLongueurLatex(phrases[0]) : ''
      const secondQuestion =
        phrases.length > 1 ? estimerLongueurLatex(phrases[1]) : ''
      if (
        latexFileInfos.qrcodeOption === 'AvecQrcode' &&
        (exercice.introduction.length > 50 ||
          estimerLongueurLatex(exercice.consigne).length > 50 ||
          firstQuestion.length > 50 ||
          secondQuestion.length > 50)
      ) {
        // il faut un espace pour le QRCODE
        content += '\n\\vspace{2cm}'
      }
    }

    content += wrapInSpacing(
      writeIntroduction(exercice.introduction) +
        '\n' +
        format(exercice.consigne) +
        '\n' +
        buildContent(
          exercice.listeQuestions,
          exercice.spacing,
          Boolean(exercice.listeAvecNumerotation),
          confExo.cols ?? Number(exercice.nbCols),
          confExo,
        ) +
        testIfLoaded(
          [
            ...exercice.listeQuestions,
            exercice.consigne,
            exercice.introduction,
          ],
          '\\anote{',
          '\n\\printcustomnotes',
        ) +
        writingLinesAtEnd(confExo),
      confExo,
    )
    content += '\n\\end{exercice}\n'
    content += '\n\\begin{Solution}'
    content += testIfLoaded(
      [...exercice.listeCorrections],
      '\\anote{',
      '\n\\resetcustomnotes',
    )
    content += buildContent(
      exercice.listeCorrections,
      exercice.spacingCorr,
      Boolean(exercice.listeAvecNumerotation),
      confExo.cols_corr ?? Number(exercice.nbColsCorr),
      correctionConf(confExo),
    )
    content += testIfLoaded(
      [...exercice.listeCorrections],
      '\\anote{',
      '\n\\printcustomnotes',
    )
    content += '\n\\end{Solution}\n'
    return content
  }

  async getContents(latexFileInfos: LatexFileInfos): Promise<contentsType> {
    const contents: contentsType = {
      preamble: '',
      intro: '',
      content: '',
      contentCorr: '',
    }
    if (
      latexFileInfos.style === 'ProfMaquette' ||
      latexFileInfos.style === 'ProfMaquetteQrcode'
    ) {
      if (latexFileInfos.style === 'ProfMaquette') {
        for (let i = 1; i < latexFileInfos.nbVersions + 1; i++) {
          if (latexFileInfos.signal?.aborted) {
            throw new DOMException(
              'Aborted in getContents of Latex.ts',
              'AbortError',
            )
          }
          const contentVersion = this.getContentForAVersionProfMaquette(
            i,
            latexFileInfos,
          )
          contents.content += `\n\\begin{Maquette}[Fiche=${latexFileInfos.typeFiche === 'Fiche' ? 'true' : 'false'},IE=${latexFileInfos.typeFiche === 'Fiche' ? 'false' : 'true'}]{Numero= ,Niveau=${sanitizeLatexInput(latexFileInfos.subtitle || ' ')},Classe=${sanitizeLatexInput(latexFileInfos.reference || ' ')},Date= ${showsVersionInHeader(latexFileInfos) ? 'v' + i : ' '} ,Theme={${sanitizeLatexInput(latexFileInfos.title || 'Exercices')}},Code= ,Calculatrice=false}\n`
          contents.content += wrapInColumns(
            contentVersion,
            latexFileInfos.globalColumns,
          )

          contents.content += '\n\\end{Maquette}'
          contents.content += '\n\\clearpage'
          contents.contentCorr = ''
        }
      } else if (latexFileInfos.style === 'ProfMaquetteQrcode') {
        for (let i = 1; i < latexFileInfos.nbVersions + 1; i++) {
          if (latexFileInfos.signal?.aborted) {
            throw new DOMException(
              'Aborted2 in getContents of Latex.ts',
              'AbortError',
            )
          }
          latexFileInfos.qrcodeOption = 'AvecQrcode'
          const contentVersion = this.getContentForAVersionProfMaquette(
            i,
            latexFileInfos,
          )
          contents.content += `\n\\begin{Maquette}[Fiche=true, IE=false, CorrigeApres=false, CorrigeFin=true]{Niveau=${sanitizeLatexInput(latexFileInfos.subtitle || ' ')},Classe=${sanitizeLatexInput(latexFileInfos.reference || ' ')},Date= ${showsVersionInHeader(latexFileInfos) ? 'v' + i : ' '} ,Theme=${sanitizeLatexInput(latexFileInfos.title || 'Exercices')}}\n`
          contents.content += wrapInColumns(
            contentVersion,
            latexFileInfos.globalColumns,
          )
          contents.content += '\n\\end{Maquette}'
          contents.content += '\n\\clearpage'
          contents.contentCorr = ''
        }
      }
      if (latexFileInfos.signal?.aborted) {
        throw new DOMException(
          'Aborted3 in getContents of Latex.ts',
          'AbortError',
        )
      }
      this.loadPreambuleFromContents(contents, latexFileInfos)
      if (
        latexFileInfos.modele !== undefined &&
        latexFileInfos.modele !== 'aucun' &&
        latexFileInfos.examConfig !== undefined
      ) {
        const engine = new ExamTemplateEngine(latexFileInfos.examConfig)
        const tabularx = testIfLoaded([contents.preamble], 'tabularx', '1')
        if (tabularx !== '1') {
          contents.preamble += '\n\\usepackage{tabularx}'
        }
        const lastpage = testIfLoaded([contents.preamble], 'lastpage', '1')
        if (lastpage !== '1') {
          contents.preamble += '\n\\usepackage{lastpage}'
        }
        contents.intro += engine.generateTikzFiche()
        contents.intro += '\n\\begin{document}'
        contents.intro += `\n${engine.render()}\n`
      } else {
        contents.intro += '\n\\begin{document}'
      }
    } else {
      for (let i = 1; i < latexFileInfos.nbVersions + 1; i++) {
        if (latexFileInfos.signal?.aborted) {
          throw new DOMException(
            'Aborted in getContents of Latex.ts',
            'AbortError',
          )
        }
        const contentVersion = this.getContentsForAVersion(latexFileInfos, i)
        if (i > 1) {
          contents.content += '\n\\clearpage'
          contents.content += '\n\\setcounter{ExoMA}{0}'
          contents.contentCorr += '\n\\clearpage'
          contents.contentCorr += '\n\\setcounter{ExoMA}{0}'
        }
        if (showsVersionInHeader(latexFileInfos)) {
          contents.content += `\n\\version{${i}}`
          contents.contentCorr += `\n\\version{${i}}`
        }
        if (latexFileInfos.nbVersions > 1) {
          if (i > 1 && latexFileInfos.style === 'Can') {
            contents.content += '\n\\setcounter{nbEx}{1}'
            contents.content += '\n\\setcounter{CompteurTableauCan}{0}'
            contents.content += '\n\\pageDeGardeCan{nbEx}\n\\clearpage'
          }
        }
        // Le mode « Course aux nombres » compose déjà ses questions dans un
        // tableau qui occupe toute la largeur : le découper en colonnes n'a
        // pas de sens.
        const columns =
          latexFileInfos.style === 'Can'
            ? undefined
            : latexFileInfos.globalColumns
        contents.content += wrapInColumns(contentVersion.content, columns)
        contents.contentCorr += wrapInColumns(
          contentVersion.contentCorr,
          columns,
        )
      }

      if (latexFileInfos.signal?.aborted) {
        throw new DOMException(
          'Aborted in getContents of Latex.ts',
          'AbortError',
        )
      }
      if (latexFileInfos.style === 'Can') {
        const currentUrl = this.getURL()
        contents.preamble = `% @see : ${currentUrl.href.replaceAll('%', '\\%')}\n\\documentclass[a4paper,11pt,fleqn]{article}\n\n${addPackages(latexFileInfos, contents)}\n\n`
        contents.preamble +=
          '% Pour les carrés des cases à cocher\n\\usepackage{fontawesome5}\n\n'
        contents.preamble += '\n\\newbool{correctionDisplay}'
        contents.preamble += `\n\\setbool{correctionDisplay}{${latexFileInfos.correctionOption === 'AvecCorrection' ? 'true' : 'false'}}`
        contents.preamble += `\n\\Theme[CAN]{}{}{${latexFileInfos.durationCanOption}}{}`
        contents.intro += '\n\\begin{document}'
        contents.intro += '\n\\setcounter{nbEx}{1}'
        contents.intro += '\n\\setcounter{CompteurTableauCan}{0}'
        contents.intro += '\n\\pageDeGardeCan{nbEx}'
        contents.intro += '\n\\clearpage'
      } else {
        const currentUrl = this.getURL()
        contents.preamble += `% @see : ${currentUrl.href.replaceAll('%', '\\%')}\n\\documentclass[a4paper,11pt,fleqn]{article}\n\n${addPackages(latexFileInfos, contents)}\n\n`
        contents.preamble += `\\Theme[${latexFileInfos.style}]{nombres}{${sanitizeLatexInput(latexFileInfos.title)}}{${sanitizeLatexInput(latexFileInfos.reference)}}{${sanitizeLatexInput(latexFileInfos.subtitle)}}`
        contents.intro += '\n\\begin{document}\n'
      }
    }
    // après les deux branches : ces réglages surchargent ceux de l'habillage
    contents.preamble += loadLayoutOverrides(latexFileInfos)
    if (this.isMathadataExerciceInTheList()) {
      contents.preamble += '\n' + mathadataCompatTex
    }
    const preambulesBanquesExternes = this.preambulesBanquesExternes()
    if (preambulesBanquesExternes.length > 0) {
      contents.preamble += '\n' + preambulesBanquesExternes
    }
    contents.content = contents.content
      .replaceAll('\\\\\\\\', '\n\\medskip\n\n')
      .replace(/\n\s*\\\\/g, '\\\\\n')
    contents.contentCorr = contents.contentCorr
      .replaceAll('\\\\\\\\', '\n\\medskip\n\n')
      .replace(/\n\s*\\\\/g, '\\\\\n')

    return contents
  }

  private getURL(): URL {
    const currentUrl = new URL(window.location.href)
    if (currentUrl.hostname === 'localhost') {
      currentUrl.hostname = 'www.coopmaths.fr'
      currentUrl.port = ''
      currentUrl.protocol = 'https:'
      if (!currentUrl.pathname.startsWith('/alea')) {
        // garde la partie existante mais la préfixe
        // ex: '/foo' -> '/alea/foo', '/alea' reste '/alea'
        currentUrl.pathname = '/alea' + currentUrl.pathname
      }
    }
    currentUrl.searchParams.set('v', 'eleve')
    // Les réglages de mise en page des vues d'export n'ont aucun sens dans un
    // lien vers la vue élève, et sont assez volumineux pour rendre le lien
    // (repris dans l'en-tête de la fiche) illisible.
    for (const param of ['pdfParam', 'texParam', 'typstParam']) {
      currentUrl.searchParams.delete(param)
    }
    return currentUrl
  }

  private loadPreambuleFromContents(
    contents: contentsType,
    latexFileInfos: LatexFileInfos,
  ) {
    const currentUrl = this.getURL()
    contents.preamble = `% @see : ${currentUrl.href.replaceAll('%', '\\%')}`
    contents.preamble += '\n\\documentclass[a4paper,11pt,fleqn]{article}'
    loadProfCollegeIfNeed(contents) // avant profmaquette sinon ça plante
    contents.preamble += '\n\\usepackage{xcolor}'
    contents.preamble += '\n\\usepackage{ProfMaquette}'
    contents.preamble += `\n\\setKVdefault[Boulot]{CorrigeFin=${latexFileInfos.correctionOption === 'AvecCorrection' ? 'true' : 'false'}}`
    contents.preamble +=
      '\n\\setKVdefault[ClesExercices]{BaremeTotal=false,BaremeDetaille=false}'
    contents.preamble +=
      '\n\\usepackage[left=1.5cm,right=1.5cm,top=2cm,bottom=2cm]{geometry}'
    contents.preamble += '\n\\usepackage{hyperref}'
    contents.preamble += '\n\\usepackage{tikz}'
    contents.preamble += '\n\\usetikzlibrary{calc}'
    contents.preamble += '\n\\usepackage{fancyhdr}'
    contents.preamble += '\n\\pagestyle{fancy}'

    contents.preamble += '\n\\renewcommand\\headrulewidth{0pt}'
    contents.preamble += '\n\\setlength{\\headheight}{18pt}'
    contents.preamble += `\n\\fancyhead[R]{\\href{${currentUrl.href.replaceAll('%', '\\%')}}{Mathaléa}}`
    contents.preamble += '\n\\fancyfoot[C]{\\thepage}'
    contents.preamble += `\n\\fancyfoot[R]{%
\\begin{tikzpicture}[remember picture,overlay]
  \\node[anchor=south east] at ($(current page.south east)+(-2,0.25cm)$) {\\scriptsize {\\bfseries \\href{https://coopmaths.fr/}{Coopmaths.fr} -- \\href{http://creativecommons.fr/licences/}{CC-BY-SA}}};
\\end{tikzpicture}
}`
    contents.preamble += `\n\\fancyhead[L]{
\\begin{tikzpicture}[y=0.8, x=0.8, yscale=-0.04, xscale=0.04,remember picture, overlay,fill=orange!50,transform canvas={xshift=-1cm,yshift=1cm}]
%%%% Arc supérieur gauche%%%%
\\path[fill](523,1424)..controls(474,1413)and(404,1372)..(362,1333)..controls(322,1295)and(313,1272)..(331,1254)..controls(348,1236)and(369,1245)..(410,1283)..controls(458,1328)and(517,1356)..(575,1362)..controls(635,1368)and(646,1375)..(643,1404)..controls(641,1428)and(641,1428)..(596,1430)..controls(571,1431)and(538,1428)..(523,1424)--cycle;
%%%% Dé face supérieur%%%%
\\path[fill](512,1272)..controls(490,1260)and(195,878)..(195,861)..controls(195,854)and(198,846)..(202,843)..controls(210,838)and(677,772)..(707,772)..controls(720,772)and(737,781)..(753,796)..controls(792,833)and(1057,1179)..(1057,1193)..controls(1057,1200)and(1053,1209)..(1048,1212)..controls(1038,1220)and(590,1283)..(551,1282)..controls(539,1282)and(521,1278)..(512,1272)--cycle;
%%%% Dé faces gauche et droite%%%%
\\path[fill](1061,1167)..controls(1050,1158)and(978,1068)..(900,967)..controls(792,829)and(756,777)..(753,756)--(748,729)--(724,745)..controls(704,759)and(660,767)..(456,794)..controls(322,813)and(207,825)..(200,822)..controls(193,820)and(187,812)..(187,804)..controls(188,797)and(229,688)..(279,563)..controls(349,390)and(376,331)..(391,320)..controls(406,309)and(462,299)..(649,273)..controls(780,254)and(897,240)..(907,241)..controls(918,243)and(927,249)..(928,256)..controls(930,264)and(912,315)..(889,372)..controls(866,429)and(848,476)..(849,477)..controls(851,479)and(872,432)..(897,373)..controls(936,276)and(942,266)..(960,266)..controls(975,266)and(999,292)..(1089,408)..controls(1281,654)and(1290,666)..(1290,691)..controls(1290,720)and(1104,1175)..(1090,1180)..controls(1085,1182)and (1071,1176)..(1061,1167)--cycle;
%%%% Arc inférieur bas%%%%
\\path[fill](1329,861)..controls(1316,848)and(1317,844)..(1339,788)..controls(1364,726)and(1367,654)..(1347,591)..controls(1330,539)and(1338,522)..(1375,526)..controls(1395,528)and(1400,533)..(1412,566)..controls(1432,624)and(1426,760)..(1401,821)..controls(1386,861)and(1380,866)..(1361,868)..controls(1348,870)and(1334,866)..(1329,861)--cycle;
%%%% Arc inférieur gauche%%%%
\\path[fill](196,373)..controls(181,358)and(186,335)..(213,294)..controls(252,237)and(304,190)..(363,161)..controls(435,124)and(472,127)..(472,170)..controls(472,183)and(462,192)..(414,213)..controls(350,243)and(303,283)..(264,343)..controls(239,383)and(216,393)..(196,373)--cycle;
\\end{tikzpicture}
}
%%%%%% Style Fiche
\\tcbset{%
  userfiche/.style={%
    %move upwards=-1cm,colback=red!75%
    top=5pt, left=5pt, right=5pt, colback=red!5!white%
  }%
}%
\\tcbset{%
  userfichecor/.style={%
    %spread upwards=-1cm,colback=gray!5%
    top=5pt, left=5pt, right=5pt, colback=red!5!white%
  }%
}%
${latexFileInfos.qrcodeOption === 'AvecQrcode' ? '\n\\tcbset{\n  tikzfiche/.append style={height=4cm, height plus=25cm}\n}\n' : ''}
${
  latexFileInfos.typeFiche === 'Eval'
    ? `
% Interrogations écrites
% Définir un toggle "calculatrice"
\\newtoggle{CalculatriceDisplay}
% Valeur par défaut : désactivée
\\togglefalse{CalculatriceDisplay}
\\tcbset{%
  userie/.style={%
  colback=gray!5,
  enhanced,%
  overlay unbroken and first={%
    \\iftoggle{CalculatriceDisplay}{
    \\node[yshift=1em] at (frame.south) {\\scriptsize\\sffamily-- Calculatrice \\ifboolKV[IE]{Calculatrice}{autorisée}{interdite} --};
    }{}
    }%
  }%
}%}`
    : ''
}
% Parametrages
\\hypersetup{
    colorlinks=true,% On active la couleur pour les liens. Couleur par défaut rouge
    linkcolor=blue,% On définit la couleur pour les liens internes
    % filecolor=magenta,% On définit la couleur pour les liens vers les fichiers locaux      
    urlcolor=blue,% On définit la couleur pour les liens vers des sites web
    % pdftitle={Puissance Quatre},% On définit un titre pour le document pdf
    % pdfpagemode=FullScreen,% On fixe l'affichage par défaut à plein écran
}`
    contents.preamble += '\n\\usepackage{qrcode}'
    contents.preamble += '\n\\usepackage{mathrsfs}'
    contents.preamble += '\n\\usepackage{enumitem}'
    contents.preamble += '\n\\usepackage[french]{babel}'
    contents.preamble += '\n\\setlength{\\parindent}{0cm}'
    loadPackagesFromContent(contents)
    contents.preamble += loadFonts(latexFileInfos)
    const [latexCmds, latexPackages] = this.getContentLatex()
    for (const pack of latexPackages) {
      logPDF(`pack: ${pack} : ${window.location.href}`)
      if (pack === 'bclogo') {
        if (!contents.preamble.includes('bclogo')) {
          contents.preamble += '\n\\usepackage[tikz]{' + pack + '}'
        }
      } else {
        contents.preamble += '\n\\usepackage{' + pack + '}'
      }
    }
    for (const cmd of latexCmds) {
      contents.preamble += '\n' + cmd.replace('cmd', '')
    }
    contents.preamble = ordonneTkzBaseAvantEuclide(contents.preamble)
  }

  async getFile(latexFileInfos: LatexFileInfos): Promise<latexFileType> {
    const contents = await this.getContents(latexFileInfos)
    const preamble = contents?.preamble
    const intro = contents?.intro
    const content = contents?.content
    const contentCorr = contents?.contentCorr
    let latexWithoutPreamble = ''
    latexWithoutPreamble += intro
    latexWithoutPreamble += content
    if (
      latexFileInfos.style === 'ProfMaquette' ||
      latexFileInfos.style === 'ProfMaquetteQrcode'
    ) {
      latexWithoutPreamble += '\n\\end{document}'
    } else if (latexFileInfos.style === 'Can') {
      latexWithoutPreamble +=
        '\n\n\\clearpage\n\n\\ifbool{correctionDisplay}{\n\\begin{Correction}' +
        contentCorr +
        '\n\\clearpage\n\\end{Correction}}{}\n\\end{document}'
      latexWithoutPreamble +=
        '\n\n% Local Variables:\n% TeX-engine: luatex\n% End:'
    } else {
      // Les habillages Coopmaths et Classique émettaient la correction quoi
      // qu'il arrive : `correctionOption` n'était lu que par ProfMaquette
      // (clé `CorrigeFin`) et par la Course aux nombres (`correctionDisplay`).
      latexWithoutPreamble +=
        latexFileInfos.correctionOption === 'SansCorrection'
          ? '\n\n\\end{document}'
          : '\n\n\\clearpage\n\n\\begin{Correction}' +
            contentCorr +
            '\n\\clearpage\n\\end{Correction}\n\\end{document}'
      latexWithoutPreamble +=
        '\n\n% Local Variables:\n% TeX-engine: luatex\n% End:'
    }
    const latexWithPreamble = preamble + latexWithoutPreamble
    return { contents, latexWithoutPreamble, latexWithPreamble }
  }

  getContentLatex() {
    const packLatex: string[] = []
    for (const exo of this.exercices) {
      if (isIExercice(exo)) {
        if (typeof exo.listePackages === 'string') {
          packLatex.push(exo.listePackages)
        } else if (Array.isArray(exo.listePackages)) {
          packLatex.push(...exo.listePackages)
        }
      }
    }
    const packageFiltered: string[] = packLatex.filter(
      (value, index, array) => array.indexOf(value) === index,
    )
    const [latexCmds, latexPackages] = packageFiltered.reduce(
      (result: [string[], string[]], element: string) => {
        result[element.startsWith('cmd') ? 0 : 1].push(element)
        return result
      },
      [[], []],
    )

    return [latexCmds, latexPackages]
  }
}

/** Sauts de page et de colonne demandés avant un exercice */
function breaksBefore(confExo: ExerciceLayoutConfig): string {
  let breaks = ''
  if (confExo.pageBreakBefore === true) breaks += '\n\\newpage'
  if (confExo.columnBreakBefore === true) breaks += '\n\\columnbreak'
  return breaks
}

/**
 * Lignes à écrire posées une seule fois, à la fin de l'exercice. Le cas
 * « après chaque question » est traité par `buildContent`, qui seul connaît
 * le découpage en questions.
 */
function writingLinesAtEnd(confExo: ExerciceLayoutConfig): string {
  const lines = confExo.writingLines
  if (lines == null || lines.position !== 'fin' || lines.count < 1) return ''
  return `\n\\blocrep[1.5]{${lines.count}}{1}`
}

/** Enveloppe un contenu dans l'interligne demandé pour l'exercice */
function wrapInSpacing(content: string, confExo: ExerciceLayoutConfig): string {
  const stretch = confExo.baselinestretch
  if (stretch == null || stretch === 1) return content
  return `\n\\begin{spacing}{${stretch}}${content}\n\\end{spacing}`
}

/**
 * Réglages d'un exercice qui valent aussi pour sa correction : la
 * numérotation et l'espacement des questions, mais pas les lignes à écrire
 * (`blocrep`), qui n'ont pas de sens dans un corrigé.
 */
function correctionConf(confExo: ExerciceLayoutConfig): ExerciceLayoutConfig {
  return { labels: confExo.labels, itemsep: confExo.itemsep }
}

/**
 * Répartit une suite d'exercices sur plusieurs colonnes.
 *
 * L'enveloppe est posée autour du contenu d'**une** version : `\clearpage` et
 * les remises à zéro de compteurs qui séparent deux versions ne doivent pas
 * se retrouver à l'intérieur d'un `multicols`.
 */
function wrapInColumns(content: string, columns?: number): string {
  if (columns == null || columns < 2 || content.trim() === '') return content
  // `\raggedcolumns` : sans lui, multicol étire chaque colonne jusqu'en bas
  // de page en ouvrant de grands blancs entre les exercices.
  // `\mathaleaFitPictures` (voir `loadLayoutOverrides`) : les figures sont
  // conçues pour la pleine largeur et déborderaient d'une colonne.
  return `\n\\begin{multicols}{${columns}}\\raggedcolumns\\mathaleaFitPictures${content}\n\\end{multicols}`
}

/** Faut-il inscrire le numéro de version dans l'en-tête ? */
function showsVersionInHeader(latexFileInfos: LatexFileInfos): boolean {
  return latexFileInfos.showVersionInHeader ?? latexFileInfos.nbVersions > 1
}

function writeIntroduction(introduction = ''): string {
  let content = ''
  if (introduction.length > 0) {
    content += '\n' + format(introduction)
  }
  return content
}

function buildContent(
  questions: string[],
  spacing = 0,
  numbersNeeded: boolean,
  nbCols: number = 1,
  confExo: ExerciceLayoutConfig = {},
  /** Numéro de la première question : suite d'un exercice fusionné avec le précédent */
  startAt?: number,
): string {
  let content = ''
  // « Lignes après chaque question » de la vue LaTeX, ou le réglage
  // `blocrep` de la vue PDF, qui fait la même chose
  const linesPerQuestion =
    confExo.writingLines?.position === 'question' &&
    confExo.writingLines.count > 0
      ? { nbligs: confExo.writingLines.count, nbcols: 1 }
      : confExo.blocrep
  const blocrep = linesPerQuestion
    ? `\\blocrep[1.5]{${linesPerQuestion.nbligs}}{${linesPerQuestion.nbcols}} `
    : ''
  if (questions !== undefined && questions.length > 1) {
    content += '\n\\begin{enumerate}'
    const specs: string[] = []
    if (confExo.itemsep !== undefined && confExo.itemsep !== null) {
      specs.push(`itemsep=${confExo.itemsep}em`)
    } else if (spacing !== 0) {
      specs.push(`itemsep=${Math.min(spacing, 1)}em`)
    }
    if (confExo.labels) {
      specs.push(`label=${confExo.labels}`)
    } else if (!numbersNeeded) {
      specs.push('label={}')
    }
    if (startAt !== undefined && startAt > 1) {
      specs.push(`start=${startAt}`)
    }
    if (specs.length !== 0) {
      content += '[' + specs.join(',') + ']'
    }
    for (const question of questions) {
      if (nbCols > 1) {
        content += `\n\t\\item \\begin{minipage}[t]{\\linewidth} ${format(question)} \\end{minipage}${blocrep}`
      } else {
        content += `\n\t\\item ${format(question)}${blocrep}`
      }
    }
    content += '\n\\end{enumerate}'
  } else {
    if (nbCols > 1) {
      content += `\n \\begin{minipage}[t]{\\linewidth} ${format(questions[0])} \\end{minipage}${blocrep}`
    } else {
      content += `\n ${format(questions[0])}${blocrep}`
    }
  }
  if (nbCols < 2) {
    return content
  }
  return `\\begin{multicols}{${nbCols}}${content}\n\\end{multicols}`
}

/**
 * Construire la liste des URLs pour les fichiers des images nécessaires
 * ### Remarques :
 * * Chaque URL est construite à partir de l'adresse du site Coopmaths
 * * Elle a __toujours__ pour forme `https://coopmaths.fr/alea/static/<serie>/<annee>/tex/<format>/<nom_image>.<format>`
 * * Elle présuppose donc que les images sont toutes au format `eps` et qu'elles ne sont pas stockées ailleurs.
 * @author sylvain
 */
export function buildImagesUrlsList(
  exosContentList: ExoContent[],
  picsNames: picFile[][],
) {
  const imagesFilesUrls = [] as string[]
  exosContentList.forEach((exo, i) => {
    if (picsNames[i].length !== 0) {
      const year = exo.year
      const serie = exo?.serie?.toLowerCase()
      for (const file of picsNames[i]) {
        if (serie === 'crpe') {
          if (file.format) {
            imagesFilesUrls.push(
              `${window.location.origin}/alea/static/${serie}/${year}/images/${file.name}.${file.format}`,
            )
          } else {
            imagesFilesUrls.push(
              `${window.location.origin}/alea/static/${serie}/${year}/images/${file.name}.png`,
            )
          }
        } else if (serie != null) {
          if (file.format) {
            imagesFilesUrls.push(
              `${window.location.origin}/alea/static/${serie}/${year}/tex/${file.format}/${file.name}.${file.format}`,
            )
          } else {
            imagesFilesUrls.push(
              `${window.location.origin}/alea/static/${serie}/${year}/tex/eps/${file.name}.eps`,
            )
          }
        } else {
          imagesFilesUrls.push(
            `${window.location.origin}/alea/${file.name}.${file.format}`,
          )
        }
      }
    }
  })
  return imagesFilesUrls
}

/**
 * Constituer la liste des noms des images présentes dans le code de la feuille d'exercices.
 * ### Principe :
 * * Les deux variables globales `exosContentList` et `picsNames` servent à stocker le contenu de chaque
 * exercice et le nom de chaque images.
 * * Découpe le contenu du code LaTeX pour identifier les exercices en détectant
 * le texte entre les deux chaînes `\begin{EXO}` ... `\end{EXO}` (hormi les corrections où `\begin{EXO}`
 * est systématiquement suivi de `{}` vides)
 * * Dans le code de chaque exercice, on repère la commande `\includegraphics` dans les lignes non précédées d'un signe `%`
 * et on récupère le nom du fichier sans l'extension.
 * ### Remarques :
 * * `picsNames` est une tableau de tableaux au cas où des exercices contiendraient plusieurs figures
 * * les figures dans les corrections ne sont pas concernées.
 * @author sylvain
 */

export function getExosContentList(
  exercices: (IExercice | IExerciceStatique)[],
) {
  const exosContentList: ExoContent[] = []
  for (const exo of exercices) {
    let data: ExoContent = {}
    if (exo.typeExercice === undefined) {
      Object.assign(data, {}, { content: exo.contenu ?? '' })
    } else if (exo.typeExercice === 'simple') {
      Object.assign(data, {}, { content: exo.listeQuestions.join(' ') })
    } else {
      data = {
        content: exo.content,
        contentCorr: exo.contentCorr,
        serie: exo.examen,
        month: exo.mois,
        year: exo.annee,
        zone: exo.lieu,
        title: [exo.examen, exo.mois, exo.annee, exo.lieu].join(' '),
      }
    }
    exosContentList.push(data)
  }
  return exosContentList
}
export function getPicsNames(exosContentList: ExoContent[]) {
  const picsList = [] as RegExpMatchArray[][]
  const picsNames = [] as picFile[][]
  const regDeleteCommentaires = /^(?:(?!%))(.*?)$/gm
  const regExpImage =
    /(?:.*?)\\includegraphics(?:\[.*?\])?\{(?<fullName>.*?)\}/gm
  const regExpImageName = /(?<name>.*?)\.(?<format>.*)$/gm
  for (const exo of exosContentList) {
    if (exo.content) {
      const pics: RegExpMatchArray[] = []
      // on supprime les phrases avec des commentaires
      const content = [...exo.content.matchAll(regDeleteCommentaires)]
      if (exo.contentCorr) {
        content.push(...exo.contentCorr.matchAll(regDeleteCommentaires))
      }
      content.forEach((list) => {
        // on recherche sur les lignes restantes si une image ou plusieurs images sont présentes
        const matchIm = Array.from(list[0].matchAll(regExpImage))
        if (matchIm !== null && matchIm.length > 0) {
          pics.push(...matchIm)
        }
      })
      picsList.push(pics)
    } else {
      picsList.push([])
    }
  }
  picsList.forEach((list, index) => {
    picsNames.push([])
    if (list.length !== 0) {
      for (const item of list) {
        let imgObj
        if (item[1].match(regExpImageName)) {
          const imgFile = [...item[1].matchAll(regExpImageName)]
          if (imgFile[0].groups != null) {
            imgObj = {
              name: imgFile[0].groups.name,
              format: imgFile[0].groups.format,
            }
          }
        } else {
          imgObj = { name: item[1], format: '' }
        }
        if (imgObj != null) {
          picsNames[index].push(imgObj)
        }
      }
    }
  })
  return picsNames
}

/**
 * URL du logo de la Course aux nombres si le code LaTeX le référence (page de
 * garde du style `Can`), liste vide sinon. C'est la même image que celle de la
 * page de garde Typst : le `.tex` la cherche à côté de lui (`LOGO_CAN_TEX_FILE`).
 */
export function getLogoCanUrls(latexCode: string | undefined): string[] {
  if (!latexCode?.includes(`{${LOGO_CAN_TEX_FILE}}`)) return []
  return [
    `${window.location.origin}${import.meta.env.BASE_URL}images/${LOGO_CAN_TEX_FILE}`,
  ]
}

/**
 * Détecter si le code LaTeX contient des images
 */
export function doesLatexNeedsPics(contents: {
  content: string
  contentCorr: string
  preamble?: string
}) {
  if (getLogoCanUrls(contents.preamble).length > 0) return true
  const exos: ExoContent = {
    content: contents.content,
    contentCorr: contents.contentCorr,
  }
  const imas = getPicsNames([exos])
  return imas.some((e) => e.length > 0)
}

export function makeImageFilesUrls(
  exercices: (IExercice | IExerciceStatique)[],
) {
  const exosContentList = getExosContentList(exercices)
  const picsNames = getPicsNames(exosContentList)
  return buildImagesUrlsList(exosContentList, picsNames)
}

/**
 * Pour les exercices Mathalea on a des conventions pour les sauts de ligne qui fonctionnent en HTML comme en LaTeX
 * * `<br>` est remplacé par un saut de paragraphe
 * * `<br><br>` est remplacé par un saut de paragraphe et un medskip (si AvecLesDoublesEspaces est vrai). Dans this.consigne, il ne faut pas sinon cela fait planter la sortie LaTeX.
 *  Le \\euro mange l'espace qui vient après lui, d'où la nécessité d'insérer un espace insécable s'il y en avait un avant le replacement.
 */
export function format(
  text: string,
  AvecLesDoublesEspaces: boolean = true,
): string {
  if (text === undefined) return ''
  const lang = getLang()
  let formattedText = AvecLesDoublesEspaces
    ? text.replace(/(<br *\/?>[\n\t ]*)+<br *\/?>/gim, '\\medskip\n\n')
    : text

  formattedText = formattedText
    .replace(/(\d+)\s*°/g, '\\ang{$1}')
    .replace(/\n(<br *\/?>)/g, '$1')
    .replace(/<br>/g, '\n\n')
    .replace(/( )?€( )/g, '\\,\\euro{}~')
    .replace(/( )?€/g, '\\,\\euro{}')
    .replace(/\\\\\s*\n\n/gm, '\\\\')
    .replaceAll('«', '\\og{}')
    .replaceAll('»', '\\fg{}')
    .replaceAll('œ', '\\oe ')
    .replaceAll('°', '$^\\circ$ ')
    .replaceAll('\n\n\n', '\n\n') // une ligne vide... pas 2

  // Check if the language is 'fr-CH' and replace \times with \cdot if true
  if (lang === 'fr-CH') {
    formattedText = formattedText.replace(/\\times/g, '\\cdot')
  }

  return formattedText
}

/**
 * Dans le corps d'un `TableauCan`, remplace les `array` / `tabular` imbriqués
 * dans les cellules par des `tblr` (tabularray).
 *
 * Contexte : sur TeX Live 2026, `colortbl` (chargé par `\usepackage[table]{xcolor}`
 * du préambule générique) désynchronise la passe de mesure de `tabularray` dès
 * qu'une cellule contient un `array`/`tabular` imbriqué. La compilation s'arrête
 * alors sur « ! Missing number, treated as zero » à `\end{TableauCan}` et aucun
 * PDF n'est produit. Les autres habillages, qui n'utilisent pas `tabularray`,
 * ne sont pas concernés — d'où un bug propre à la Course aux nombres.
 * `tabularray` sait en revanche imbriquer ses propres `tblr` sans heurter
 * `colortbl`.
 *
 * `tabularray` ne reconnaît que `\\` comme fin de ligne : un `\tabularnewline`
 * (produit par les tableaux de valeurs) est donc remplacé par `\\`, sinon tout
 * le tableau tient sur une ligne et le `\hline` suivant est « Misplaced \noalign ».
 *
 * On ne convertit que les préambules « simples » (traits verticaux et colonnes
 * `c` / `l` / `r`) : ce sont les seuls que produisent les exercices CAN
 * (tableaux de proportionnalité, tableaux de valeurs, petites matrices). Un
 * préambule plus exotique est laissé tel quel : il produisait déjà un PDF
 * cassé, la situation n'empire pas.
 */
export function convertNestedTabularsForTableauCan(tableBody: string): string {
  return tableBody.replace(
    /\\begin\{(array|tabular)\}(\[[a-z]\])?\{([\s|clr]*)\}([\s\S]*?)\\end\{\1\}/g,
    (_whole, _env, _pos, spec: string, inner: string) =>
      `\\begin{tblr}{${spec.replace(/\s+/g, '')}}${inner.replace(/\\tabularnewline(?![a-zA-Z])/g, '\\\\')}\\end{tblr}`,
  )
}

/**
 * Garantit que `\usepackage{tkz-base}` précède `\usepackage{tkz-euclide}`
 * dans le préambule, sans doublon.
 *
 * Sur TeX Live 2026, `tkz-base` chargé après `tkz-euclide` déclenche
 * « ! Package tkz-base Error: tkz-base must be loaded before tkz-euclide. »
 * (erreur fatale → aucun PDF → le serveur de compilation renvoie 500).
 * Le préambule du style ProfMaquette peut produire le mauvais ordre :
 * `loadPackagesFromContent()` ajoute `tkz-euclide` (contenu avec `\tkz`/`\pic[`)
 * avant que la boucle sur les `listePackages` des exercices n'ajoute `tkz-base`.
 * On retire les occurrences en trop et on réinsère une paire ordonnée à
 * l'emplacement de la première des deux.
 */
export function ordonneTkzBaseAvantEuclide(preamble: string): string {
  const lignes = preamble.split('\n')
  const estBase = (l: string) => l.trim() === '\\usepackage{tkz-base}'
  const estEuclide = (l: string) => l.trim() === '\\usepackage{tkz-euclide}'
  const iBase = lignes.findIndex(estBase)
  const iEuclide = lignes.findIndex(estEuclide)
  if (iBase === -1 || iEuclide === -1) return preamble
  const dejaBon =
    iBase < iEuclide &&
    lignes.filter(estBase).length === 1 &&
    lignes.filter(estEuclide).length === 1
  if (dejaBon) return preamble
  const insertion = Math.min(iBase, iEuclide)
  const nettoyees = lignes.filter((l) => !estBase(l) && !estEuclide(l))
  nettoyees.splice(
    insertion,
    0,
    '\\usepackage{tkz-base}',
    '\\usepackage{tkz-euclide}',
  )
  return nettoyees.join('\n')
}

function getUrlFromExercice(
  ex: IExercice | IExerciceStatique,
  version: number = 1,
): string {
  const url = new URL('https://coopmaths.fr/alea')
  url.searchParams.append('uuid', String(ex.uuid))
  if (isIExercice(ex)) {
    if (ex.id !== undefined) url.searchParams.append('id', ex.id)
    if (ex.nbQuestions !== undefined) {
      url.searchParams.append('n', ex.nbQuestions.toString())
    }
    if (ex.duration !== undefined) {
      url.searchParams.append('d', ex.duration.toString())
    }
    if (ex.sup !== undefined) url.searchParams.append('s', String(ex.sup))
    if (ex.sup2 !== undefined) url.searchParams.append('s2', String(ex.sup2))
    if (ex.sup3 !== undefined) url.searchParams.append('s3', String(ex.sup3))
    if (ex.sup4 !== undefined) url.searchParams.append('s4', String(ex.sup4))
    if (ex.sup5 !== undefined) url.searchParams.append('s5', String(ex.sup5))
    if (ex.seed !== undefined)
      url.searchParams.append(
        'alea',
        version > 1 ? ex.seed + version.toString() : ex.seed,
      )
    if (ex.interactif) url.searchParams.append('i', '1')
    if (ex.correctionDetaillee !== undefined) {
      url.searchParams.append('cd', ex.correctionDetaillee ? '1' : '0')
    }
    if (ex.nbCols !== undefined) {
      url.searchParams.append('cols', ex.nbCols.toString())
    }
  }
  return url.href.replaceAll('%', '\\%')
}

function addPackages(latexFileInfos: LatexFileInfos, contents: contentsType) {
  contents.preamble += genericPreamble
  loadPreambule(latexFileInfos, contents)
  contents.preamble += loadFonts(latexFileInfos)
  return contents.preamble
}

export default Latex
