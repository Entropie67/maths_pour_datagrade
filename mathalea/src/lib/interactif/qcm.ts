/**
 * Devine les options de comparaison adaptées selon la nature des réponses proposées.
 * Exemples :
 * - intervalles : { intervalle: true }
 * - ensembles : { ensembleDeNombres: true }
 * - fractions : { fractionEgale: true }
 * - puissances : { puissance: true }
 * - suites : { suiteDeNombres: true }
 * - coordonnées : { coordonnees: true }
 * - expressions : { egaliteExpression: true }
 */
import ExerciceQcm from '../../exercices/ExerciceQcm'
import ExerciceSimple from '../../exercices/ExerciceSimple'
import type { IExercice, UneProposition } from '../../lib/types'
import { context } from '../../modules/context'
import type { AutoCorrectionAMC } from '../amc/amcTypes'
import { MathaleaQcmElement } from '../customElements/MathaleaQcm'
import {
  barreTexte,
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../outils/embellissements'
import { lettreDepuisChiffre } from '../outils/outilString'
import { shuffleJusquaWithIndexes } from '../qcmCam'

export { verifQuestionQcm } from '../customElements/MathaleaQcm'

type PreparedQcmPropositions = {
  indexes: number[]
  vertical: boolean
  nbCols: number
}

/**
 * Prépare les propositions d'un QCM avant rendu.
 *
 * La mutation de `autoCorrection[questionIndex].propositions` est conservée :
 * les rendus HTML, LaTeX, AMC et QcmCam relisent ensuite cet ordre.
 */
export function prepareQcmPropositions(
  exercice: IExercice,
  questionIndex: number,
): PreparedQcmPropositions {
  const autoCorrection = exercice.autoCorrection[questionIndex]
  const propositions = autoCorrection.propositions ?? []
  const indexes: number[] = []

  elimineDoublons(propositions)

  const lastChoice = Math.min(
    autoCorrection.options?.lastChoice ?? propositions.length,
    propositions.length - 1,
  )
  const vertical = autoCorrection.options?.vertical ?? false
  const nbCols = Math.min(autoCorrection.options?.nbCols ?? 1, 1)
  const isTrueFalse =
    propositions.some((prop) => prop.texte === 'Vrai') &&
    propositions.some((prop) => prop.texte === 'Faux')

  if (isTrueFalse) {
    const vraiProp = propositions.find((prop) => prop.texte === 'Vrai')
    const fauxProp = propositions.find((prop) => prop.texte === 'Faux')
    const autresProps = propositions.filter(
      (prop) => prop.texte !== 'Vrai' && prop.texte !== 'Faux',
    )
    if (vraiProp != null && fauxProp != null) {
      autoCorrection.propositions = [vraiProp, fauxProp, ...autresProps]
    }
  } else if (!autoCorrection.options?.ordered) {
    const melange = shuffleJusquaWithIndexes(propositions, lastChoice)
    autoCorrection.propositions = melange.shuffledArray as UneProposition[]
    indexes.push(...melange.indexes)
  }

  return { indexes, vertical, nbCols }
}

/**
 * @param {exercice}
 * @param {number} i indice de la question
 * @param {{style: string, format: string, typstColumns?: number, typstFigureAlign?: string}} [options]
 *   `typstColumns` : nombre de colonnes des propositions par défaut dans la vue Typst
 *   (réglable ensuite depuis la palette) ; sans lui, une proposition figure tient sur une colonne.
 *   `typstFigureAlign` : alignement par défaut des figures des propositions dans la vue Typst
 *   (`center` sans lui, réglable ensuite figure par figure depuis la palette).
 * @returns {{texte: string, texteCorr: string}} {texte, texteCorr} le texte à ajouter pour la question traitée
 */
export function propositionsQcm(
  exercice: IExercice,
  i: number,
  options: {
    style: string
    format: string
    typstColumns?: number
    typstFigureAlign?: 'left' | 'center' | 'right'
  } = {
    style: '',
    format: 'case',
  },
) {
  /**
   * Mélange les éléments d'un tableau jusqu'à un certain index et laisse les suivants inchangés.
   * @param {Array} array - Le tableau à mélanger.
   * @param {number} lastChoice - L'index jusqu'auquel mélanger les éléments.
   * @returns {{shuffledArray: Array, indexes: Array}} - Le tableau mélangé et les index des anciens éléments dans le nouvel ordre.
   */
  const indexes = []
  let texte = ''
  let texteCorr = ''
  let espace = ''
  let nbCols = 1
  let vertical = false
  const classCss =
    options?.style != null && options.style !== ''
      ? `class="ml-2" style="${options.style};" `
      : 'class="ml-2"'
  if (context.isAmc) {
    if (exercice.autoCorrection?.[i] != null) {
      exercice.autoCorrection[i].formatInteractif = 'mathalea-qcm'
    }
    return { texte: '', texteCorr: '' }
  }
  if (exercice?.autoCorrection?.[i]?.propositions === undefined) {
    window.notify(
      'propositionsQcm a reçu une liste de propositions undefined',
      {
        autoCrorrection: exercice?.autoCorrection[i],
        propositions: exercice?.autoCorrection?.[i]?.propositions,
        exercise: exercice,
      },
    )
    return { texte: '', texteCorr: '' }
  } else if (exercice.autoCorrection[i].propositions.length === 0) {
    if (!context.isAmc) {
      window.notify('propositionsQcm a reçu une liste de propositions vide', {
        autoCrorrection: exercice.autoCorrection[i],
        propositions: exercice.autoCorrection[i].propositions,
        exercise: exercice,
      })
    }
    return { texte: '', texteCorr: '' }
  } else if (exercice.autoCorrection[i].propositions.length === 1) {
    if (!context.isAmc) {
      window.notify(
        'propositionsQcm a reçu une liste de propositions de taille 1',
        {
          autoCrorrection: exercice.autoCorrection[i],
          propositions: exercice.autoCorrection[i].propositions,
          exercise: exercice,
        },
      )
    }
    return { texte: '', texteCorr: '' }
  }

  exercice.autoCorrection[i].formatInteractif = 'mathalea-qcm'

  if (context.isHtml) {
    espace = '&emsp;'
  } else {
    espace = '\\qquad '
  }
  const qcmPreparation = prepareQcmPropositions(exercice, i)
  indexes.push(...qcmPreparation.indexes)
  vertical = qcmPreparation.vertical
  nbCols = qcmPreparation.nbCols
  if (context.isAmc) {
    syncQcmAutoCorrectionToAmc(exercice, i)
    return { texte: '', texteCorr: '' }
  }
  if (!context.isHtml) {
    const propositions = exercice.autoCorrection[i].propositions

    // Indices des bonnes réponses (1-indexé pour le package tasks)
    const correctIndices: number[] = []
    propositions.forEach((prop, index) => {
      if (prop.statut) {
        correctIndices.push(index + 1)
      }
    })

    // Si nbCols vaut 1 mais qu'on veut un affichage horizontal (!vertical),
    // on force le nombre de colonnes au nombre de propositions pour tout aligner sur une ligne.
    const finalCols = nbCols === 1 && !vertical ? propositions.length : nbCols

    const isLettre = options?.format === 'lettre'
    const optCols = `cols=${finalCols}`
    const optCase = isLettre ? '' : ', case' // Ajoute l'option 'case' par défaut ou si spécifié

    // Les options pour l'énoncé (sans la correction)
    const optionsQ = `[${optCols}${optCase}]`
    // Les options pour le corrigé (avec la liste des bonnes réponses)
    const optionsCorr = `[${optCols}${optCase}, correct={${correctIndices.join(',')}}]`

    // 4. Construction du contenu des tâches (le même pour la Q et la R)
    let contenuTasks = ''
    for (let rep = 0; rep < propositions.length; rep++) {
      contenuTasks += `  \\task ${propositions[rep].texte}\n`
    }

    // 5. Injection dans les chaînes LaTeX finales
    texte += `\\begin{qcmprop}${optionsQ}\n${contenuTasks}\\end{qcmprop}\n`
    texteCorr += `\\begin{qcmprop}${optionsCorr}\n${contenuTasks}\\end{qcmprop}\n`
  }
  if (context.isHtml) {
    const isRadio = exercice.autoCorrection[i].options?.radio ?? false
    const formateRV = (format: string, rep: number) => {
      if (format == null || format === 'case') {
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" checked>`
      }
      if (format === 'lettre') {
        return `<label ${classCss} >${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}.</label>`
      }
      return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" checked><label ${classCss} >${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}.</label>`
    }
    const formateRF = (format: string, rep: number) => {
      if (format == null || format === 'case') {
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default">`
      }
      if (format === 'lettre') {
        return `<label ${classCss} >${texteGras(`${barreTexte(lettreDepuisChiffre(rep + 1))}`)}.</label>`
      }
      return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default"><label ${classCss} >$${miseEnEvidence(`\\cancel{${lettreDepuisChiffre(rep + 1)}}`, 'black')}$.</label>`
    }
    texteCorr = '<div class="my-3">'

    if (!context.isTypst) {
      texte = MathaleaQcmElement.create({
        numeroExercice: exercice.numeroExercice ?? 0,
        questionIndex: i,
        propositions: exercice.autoCorrection[i].propositions ?? [],
        radio: isRadio,
        vertical,
        format: options?.format ?? 'case',
        style: options?.style ?? '',
        interactivityOn: exercice.interactif,
      })
    } else {
      const formateQ = (format: string, rep: number) => {
        if (format == null || format === 'case') {
          return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" id="checkEx${exercice.numeroExercice}Q${i}R${rep}">`
        }
        if (format === 'lettre') {
          return `<label ${classCss} >${texteGras(lettreDepuisChiffre(rep + 1))}.</label>`
        }
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" id="checkEx${exercice.numeroExercice}Q${i}R${rep}"><label ${classCss} >${lettreDepuisChiffre(rep + 1)}.</label>`
      }

      const typstAttributes =
        (options?.typstColumns != null
          ? ` data-typst-colonnes="${options.typstColumns}"`
          : '') +
        (options?.typstFigureAlign != null
          ? ` data-typst-align="${options.typstFigureAlign}"`
          : '')
      texte = `<div class="my-3"${typstAttributes}>`
      for (
        let rep = 0;
        rep < exercice.autoCorrection[i].propositions.length;
        rep++
      ) {
        if (nbCols > 1 && rep % nbCols === 0) texte += '<br>'
        texte += `<div class="ex${exercice.numeroExercice} ${vertical ? '' : 'inline-block'} my-2 align-center">
      ${formateQ(options?.format, rep)}
      <label id="labelEx${exercice.numeroExercice}Q${i}R${rep}" ${classCss} >${exercice.autoCorrection[i].propositions[rep].texte + espace}</label>
      </div>`
      }

      texte += `</div><div class="m-2" id="resultatCheckEx${exercice.numeroExercice}Q${i}"></div>`
    }
    for (
      let rep = 0;
      rep < exercice.autoCorrection[i].propositions.length;
      rep++
    ) {
      texteCorr += `<div class="${vertical ? '' : 'inline-block'}">
    ${
      exercice.autoCorrection[i].propositions[rep].statut
        ? formateRV(options?.format, rep)
        : formateRF(options?.format, rep)
    }
      <label id="labelEx${exercice.numeroExercice}Q${i}R${rep}" ${classCss} >${
        exercice.autoCorrection[i].propositions[rep].statut
          ? texteEnCouleurEtGras(
              String(exercice.autoCorrection[i].propositions[rep].texte),
            )
          : exercice.autoCorrection[i].propositions[rep].texte
      }</label>${espace}
      </div>`
    }
    /* for (
      let rep = 0;
      rep < exercice.autoCorrection[i].propositions.length;
      rep++
    ) {
      texte += `<div class="m-2" id="feedbackEx${exercice.numeroExercice}Q${i}R${rep}"></div>`
    } */
    texteCorr += '</div><div class="m-2"></div>'
  }
  if (!context.isHtml) {
    texte = '\n' + texte
    texteCorr = '\n' + texteCorr
  }
  syncQcmAutoCorrectionToAmc(exercice, i)
  return { texte, texteCorr, indexes }
}

export function syncQcmAutoCorrectionToAmc(
  exercice: IExercice,
  questionIndex: number,
  correction?: string,
): void {
  const source = exercice.autoCorrection[questionIndex]
  if (source == null) return
  const texteCorr =
    correction ??
    (source.options?.correction != null && source.options.correction !== ''
      ? source.options.correction
      : exercice.typeExercice === 'simple' || exercice instanceof ExerciceSimple
        ? exercice.correction
        : (exercice.listeCorrections[questionIndex] ?? ''))

  const exerciseAny = exercice as IExercice & {
    autoCorrectionAMC?: AutoCorrectionAMC[]
  }
  exerciseAny.autoCorrectionAMC ??= []
  exerciseAny.autoCorrectionAMC[questionIndex] = {
    ...exerciseAny.autoCorrectionAMC[questionIndex],
    enonce: source.enonce,
    options:
      source.options != null
        ? { ...source.options, correction: texteCorr }
        : correction != null
          ? { correction: texteCorr }
          : undefined,
    propositions: (source.propositions ?? []).map((proposition) => ({
      ...proposition,
    })),
  }
}

/**
 * prend un tableau de propositions [{texte: 'prop1', statut: true, feedback: 'Correct !'}, {texte: 'prop2', statut: false, ....}
 * élimine en cas de doublon la proposition fausse ou la deuxième proposition si elle sont toutes les deux fausses.
 * @author Jean-claude Lhote
 */
export function elimineDoublons(propositions: UneProposition[]) {
  // fonction qui va éliminer les doublons si il y en a
  let doublonsTrouves = false
  for (let i = 0; i < propositions.length - 1; i++) {
    for (let j = i + 1; j < propositions.length;) {
      if (propositions[i].texte === propositions[j].texte) {
        // les réponses i et j sont les mêmes
        doublonsTrouves = true
        if (propositions[i].statut) {
          // si la réponse i est bonne, on vire la j
          propositions.splice(j, 1)
        } else if (propositions[j].statut) {
          // si la réponse i est mauvaise et la réponse j bonne,
          // comme ce sont les mêmes réponses, on vire la j mais on met la i bonne
          propositions.splice(j, 1)
          propositions[i].statut = true
        } else {
          // Les deux réponses sont mauvaises
          propositions.splice(j, 1)
        }
      } else {
        j++
      }
    }
  }
  return doublonsTrouves
}
/**
 * Une fonction pour vérifier que l'on a bien le nombre de réponses différentes souhaité dans les propositions d'un exercice de type qcm. Utile pour vérifier que les distracteurs sont bien différents de la bonne réponse et entre eux.
 * @param exercice
 * @param nombreSouhaite
 * @param test
 * @param options
 * @returns
 */
export function aLeBonNombreDePropsDifferentes(
  exercice: any,
  nombreSouhaite: number, // le nombre de réponses différentes que l'on devrait avoir (bonne réponse + distracteurs)
  test = true, // Mettre à true pour ne pas afficher de notifications, utilisé dans l'exo pour tester l'aléatoire sans alerter l'utilisateur à chaque fois que ça ne marche pas
): boolean {
  let reponses: string[]
  if (exercice instanceof ExerciceQcm) {
    reponses = exercice.reponses
  } else if (exercice.distracteurs != null && exercice.reponse != null) {
    reponses = [String(exercice.reponse), ...exercice.distracteurs.map(String)]
    exercice.reponses = reponses.map((s: string) => s)
  } else {
    if (!test)
      window.notify(
        `l'exercice ne comporte pas les éléments pour fabriquer un qcm`,
        { exercice: JSON.stringify(exercice) },
      )
    return false
  }
  if (reponses == null) {
    if (!test)
      window.notify(
        'aLeBonNombreDePropsDifferentes a reçu un exercice sans réponses',
        { exercice },
      )
    return false
  }
  reponses = reponses.map((s: string) =>
    s.startsWith('$') && s.endsWith('$') ? s.slice(1, -1) : s,
  )
  if (nombreSouhaite > reponses.length) {
    if (!test)
      window.notify(
        'Il y a un nombre insuffisant de réponses dans this.reponses',
        { exercice },
      )
    return false
  }

  const doublons = []
  // La comparaison des différents éléments se fait en comparant des strings.
  let doublonsTrouvés = false
  let nbReponsesDifferentes = reponses.length
  for (let i = 0; i < reponses.length - 1; i++) {
    for (let j = i + 1; j < reponses.length;) {
      if (reponses[i].trim() === reponses[j].trim()) {
        if (i === 0) {
          exercice.reponses[j] = 'doublon de la bonne réponse'
        } else {
          exercice.reponses[j] = `doublon de la réponse à l'indice ${i}`
        }
        doublons.push(
          `à l'indice ${i} j'ai ${reponses[i]} et à l'indice ${j} j'ai ${reponses[j]}, je supprime la réponse à l'indice ${j} et je garde celle à l'indice ${i}`,
        )
        doublonsTrouvés = true
        nbReponsesDifferentes--
        reponses.splice(j, 1)
      } else {
        j++
      }
    }
  }
  if (doublonsTrouvés) {
    if (!test)
      window.notify(
        `aLeBonNombreDePropsDifferentes : J'ai trouvé ${exercice.reponses.length - nbReponsesDifferentes} doublons.
        Il en reste ${nbReponsesDifferentes} réponses différentes et j'en voulais ${nombreSouhaite},
        J'ai supprimé les doublons suivants :
        ${doublons.join(' ; ')}`,
        {
          doublons: doublons.join(' ; '),
        },
      )
    exercice.reponses = exercice.reponses.filter(
      (r: string) => !r.includes('doublon'),
    )
  }
  return !doublonsTrouvés
}
