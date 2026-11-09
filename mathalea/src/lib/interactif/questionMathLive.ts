import type {
  IExercice,
  InteractivityType,
  TableauMathliveType,
  Valeur,
} from '../../lib/types'
import { context } from '../../modules/context'
import type { ReponseParams } from '../amc/amcTypes'
import { FillInTheBlankElement } from '../customElements/FillInTheBlank'
import {
  MathaleaMathfieldElement,
  type MathaleaMathfieldVerificationCallback,
} from '../customElements/MathaleaMathfield'
import {
  MathaleaTextfieldElement,
  type MathaleaTextfieldVerificationCallback,
} from '../customElements/MathaleaTextfield'
import type { ToucheDeQuestion } from '../../components/keyboard/lib/touchesPersonnalisees'
import { texteApresChamp } from '../outils/outilString'
import './champTexte.scss'
import { buildDataKeyboardFromStyle } from './claviers/keyboard'
import { handleAnswers } from './gestionInteractif'
import {
  creeTableauMathliveElement,
  type ItabDbleEntry,
  type Itableau,
} from './tableaux/AjouteTableauMathlive'

const buildDataKeyboardString = (style = '') => {
  const blocks = buildDataKeyboardFromStyle(style)
  return blocks.join(' ')
}

/**
 * Une question pour rassembler les ajouteChampTexte et Cie et les handleHanswers.
 * Il faudrait pouvoir fournir autre chose que objetReponse.
 * Un truc du style :
 * [{id: 'reponse', value: 'valeur', options: {}},
 * {id: 'reponse2', value: 'valeur2', options: {}},
 * {id: 'reponse3', value: 'valeur3', options: {}}]
 * qui alimentera objetReponse.
 * ou alors, on fait un type conditionnel sur objetReponse...
 * C'est balaize à faire, mais ce serait mieux : on ouvre l'accolade, et si on commence à taper rep... il ouvre l'accolade, demande value, demande compare, demande options... idem si on commence à taper champ1....
 * @author Jean-claude Lhote
 * @param {Exercice} exercice
 * @param {number} question
 * @param {Valeur} objetReponse
 * @param {ReponseParams} reponseParams
 * @param {InteractivityType} typeInteractivite
 * @param {string} content
 * @param {string} classe
 * @param {ItabDbleEntry | Itableau} tableau
 * @param {TableauMathliveType} typeTableau
 * @param {string} texteAvant
 * @param {string} texteApres
 * @param {boolean} blocCenter
 * @param {boolean} espace
 * @returns string
 */
export function ajouteQuestionMathlive({
  exercice,
  question,
  objetReponse,
  reponseParams,
  typeInteractivite,
  content = '',
  classe = '',
  tableau,
  typeTableau = 'doubleEntree',
  texteAvant = '',
  texteApres = '',
  blocCenter = false,
  espace = false,
}: {
  exercice: IExercice
  question: number
  objetReponse: Valeur
  reponseParams: ReponseParams
  typeInteractivite: InteractivityType
  content?: string
  classe?: string
  tableau?: ItabDbleEntry | Itableau
  typeTableau?: TableauMathliveType
  texteAvant?: string
  texteApres?: string
  blocCenter?: boolean
  espace?: boolean
}) {
  if (!(
    typeInteractivite === 'mathlive' ||
    typeInteractivite === 'fillInTheBlank' ||
    typeInteractivite === 'tableauMathlive' ||
    typeInteractivite === 'texte'
  )) {
    window.notify(
      `Type d'interactivité ${typeInteractivite} non reconnu. Exercice ${exercice.id} ${exercice.uuid}`,
      { typeInteractivite },
    )
    return ''
  }
  if (reponseParams === undefined) {
    reponseParams = { formatInteractif: 'mathalea-mathfield' }
  } else {
    if (typeInteractivite === 'fillInTheBlank')
      reponseParams = { formatInteractif: 'fill-in-the-blank' }
    if (typeInteractivite === 'tableauMathlive')
      reponseParams = { formatInteractif: 'tableau-mathlive' }
    if (typeInteractivite === 'mathlive')
      reponseParams = { formatInteractif: 'mathalea-mathfield' }
  }
  handleAnswers(exercice, question, objetReponse, reponseParams)
  switch (typeInteractivite) {
    case 'fillInTheBlank':
      return `${texteAvant}${remplisLesBlancs(exercice, question, content, classe, '\\ldots')}${texteApresChamp(texteApres)}`
    case 'tableauMathlive': {
      if (!tableau) {
        window.notify(
          `Tableau non défini pour l'interactivité tableauMathlive. Exercice ${exercice.id} ${exercice.uuid}`,
          { typeInteractivite },
        )
        return ''
      }
      return creeTableauMathliveElement({
        numeroExercice: exercice.numeroExercice ?? 0,
        question,
        tableau,
        typeTableau,
        classes: classe,
        texteAvant,
        texteApres,
        blocCenter,
        espace,
      })
    }
    case 'texte':
      return ajouteChampTexte(exercice, question, classe, {
        texteAvant,
        texteApres,
        blocCenter,
        espace,
      })
    default:
      return ajouteChampTexteMathLive(exercice, question, classe, {
        texteAvant,
        texteApres,
        blocCenter,
        espace,
      })
  }
}

/**
 * Retourne le code html d'un div prévu pour le feedback toute forme d'interactivité.
 * @param {Exercice} exercice
 * @param {number} question
 * @param {string} style
 * @deprecated si vous l'utilisez après ajouteChampTexteMathlive, ajouteChampTexte ou remplisLesBlancs, vous n'avez pas besoin de l'utiliser, il est ajouté automatiquement.
 */
export function ajouteFeedback(
  exercice: IExercice,
  question: number,
  style = 'style="display: none"',
) {
  if (!context.isHtml) return ''
  const exo = exercice.numeroExercice
  if (
    exercice == null ||
    typeof exo !== 'number' ||
    typeof question !== 'number'
  )
    return ''
  return `<div class ="ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${exo}Q${question}" ${style !== '' ? style : ''}></div>`
}

export type OptionsChamp = {
  texteApres?: string
  texteAvant?: string
  /**
   * Remplace « réponse » dans le nom lu par les lecteurs d'écran :
   * « Exercice 2, question 3 : longueur du segment AB ».
   * Inutile si `texteAvant` est un texte ou une formule simple : il complète le nom.
   */
  nomAccessible?: string
  blocCenter?: boolean
  espace?: boolean
  placeholder?: string
  /**
   * Touches propres à cette question, ajoutées au clavier en plus des blocs
   * du `style` (voir `components/keyboard/lib/touchesPersonnalisees.ts`).
   * Une liste de listes donne un bloc par sous-liste.
   */
  dataKeys?: ToucheDeQuestion
  verifyCallbackName?: string
  verifyCallback?:
    | MathaleaMathfieldVerificationCallback
    | MathaleaTextfieldVerificationCallback
}

export function ajouteChampTexte(
  exercice: IExercice,
  i: number,
  style = '',
  options: OptionsChamp = {},
) {
  return ajouteChamp({ type: 'texte', exercice, i, style }, options)
}

export function ajouteChampTexteMathLive(
  exercice: IExercice,
  i: number,
  style = '',
  options: OptionsChamp = {},
) {
  return ajouteChamp({ type: 'mathlive', exercice, i, style }, options)
}

type ParamsChamp = {
  type: 'texte' | 'mathlive'
  exercice: IExercice
  i: number
  style?: string
}

function ajouteChamp(params: ParamsChamp, options: OptionsChamp = {}) {
  const { type, exercice, i, style = '' } = params
  let {
    texteAvant = '',
    texteApres = '',
    blocCenter = false,
    espace = false,
    placeholder = '',
    dataKeys,
  } = options
  texteApres = texteApresChamp(texteApres)
  if (!context.isHtml || !exercice.interactif || style === 'none') return ''
  if (typeof style !== 'string') {
    window.notify(
      `style doit être une chaîne de caractères. Exercice ${exercice.id} ${exercice.uuid}`,
      { style },
    )
  }
  if (style.includes('blocCenter')) blocCenter = true
  const dataKeyboard = buildDataKeyboardString(
    typeof style === 'string' ? style : '',
  )
  const id = `champTexteEx${exercice.numeroExercice}Q${i}`
  const champ =
    type === 'mathlive'
      ? MathaleaMathfieldElement.create({
          id,
          numeroExercice: exercice.numeroExercice ?? 0,
          questionIndex: i,
          dataKeyboard,
          dataKeys,
          espace,
          nomAccessible: options.nomAccessible,
          placeholder,
          className: style,
          verifyCallbackName: options.verifyCallbackName,
          verifyCallback:
            options.verifyCallback as MathaleaMathfieldVerificationCallback,
        })
      : MathaleaTextfieldElement.create({
          id,
          numeroExercice: exercice.numeroExercice ?? 0,
          questionIndex: i,
          dataKeyboard,
          espace,
          nomAccessible: options.nomAccessible,
          placeholder,
          className: style,
          verifyCallbackName: options.verifyCallbackName,
          verifyCallback:
            options.verifyCallback as MathaleaTextfieldVerificationCallback,
        })
  let html = `${etiquetteChamp(texteAvant, id)}${champ}${texteApres ? `<span>${texteApres}</span>` : ''} <span id="resultatCheckEx${exercice.numeroExercice}Q${i}"></span>`
  if (blocCenter) {
    html = `<div style='display: flex;justify-content: center; margin:5px;'>${html}<div>`
  }
  html += ajouteFeedback(exercice, i)
  return html
}

/**
 * Texte placé devant le champ : un `<label>` relié au champ s'il a du contenu.
 * Un texte fait seulement de blancs ou de `<br>` sert à la mise en page, il reste
 * donc tel quel sans former une étiquette vide.
 */
function etiquetteChamp(texteAvant: string, idChamp: string): string {
  const estMiseEnPage = /^(?:\s|&nbsp;|&#160;|<br\s*\/?>)*$/i.test(texteAvant)
  return estMiseEnPage
    ? texteAvant
    : `<label for="${idChamp}">${texteAvant}</label>`
}

export function remplisLesBlancs(
  exercice: IExercice,
  question: number,
  content: string,
  classes: string = '',
  blanc = '\\ldots',
  {
    dataKeys,
    nomAccessible,
  }: Pick<OptionsChamp, 'dataKeys' | 'nomAccessible'> = {},
) {
  let mfeValue = ''
  let resteContent = content
  while (resteContent) {
    // le drapeau `s` permet de gérer un contenu multi-ligne (ex : \begin{aligned}…)
    const chunks = /^(.*?)%\{([^}]+)}(.*?)$/s.exec(resteContent)
    if (chunks) {
      const [, start, n, end] = chunks
      const name = n
      if (name == null) throw Error(`Définition de ${name} manquante`)
      mfeValue += start
      if (exercice.interactif) {
        mfeValue += `\\placeholder[${name}]{}`
      } else {
        mfeValue += blanc
      }
      resteContent = end ?? ''
    } else {
      mfeValue += resteContent
      resteContent = ''
    }
  }
  if (exercice.interactif && context.isHtml) {
    const dataKeyboard = buildDataKeyboardString(classes)
    let classe = ''
    if (classes !== '') {
      if (classes === 'fillInTheBlank' || classes === 'fillInTheBlanks')
        classe = 'fillInTheBlanks'
      else
        classe = [
          'fillInTheBlanks',
          ...classes
            .split(' ')
            .filter(
              (el) => el !== 'fillInTheBlank' && el !== 'fillInTheBlanks',
            ),
        ].join(' ')
    } else {
      classe = 'fillInTheBlanks'
    }
    return `${FillInTheBlankElement.create({
      numeroExercice: exercice.numeroExercice ?? 0,
      questionIndex: question,
      className: classe,
      dataKeyboard,
      content: mfeValue,
      dataKeys,
      nomAccessible,
    })}<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>${ajouteFeedback(exercice, question)}`
  }
  if (mfeValue === '') return ''
  return `$${mfeValue}$`
}
