import { addTableauSignesVariations } from '../lib/customElements/TableauSignesVariationsElement'
import { choixDeroulant } from '../lib/customElements/ListeDeroulanteElement'
import { KeyboardType } from '../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../lib/interactif/fonctionsBaremes'
import { sp } from '../lib/outils/outilString'
import { handleAnswers } from '../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
  type OptionsChamp,
} from '../lib/interactif/questionMathLive'
import type { TableauSVConfig } from '../lib/interactif/tableauSignesVariations/types'
import type { CompareFunction, OptionsComparaisonType } from '../lib/types'
import { mettreEnEvidenceSelonMode } from '../lib/interactif/alignerMiseEnEvidenceQcm'
import ExerciceQcmA from './ExerciceQcmA'

/**
 * Réponse à plusieurs champs placés dans un gabarit (ex. `A\\left(%{champ1}\\,;\\,%{champ2}\\right)`).
 * Le barème est fixe : une seule note pour toute la question.
 */
export type ChampsReponseCourte = {
  gabarit: string
  reponses: Record<string, { value: string; options?: OptionsComparaisonType }>
}

type ExerciceAvecSaisie = ExerciceQcmA & {
  reponseCourte?: () => string
  champsReponseCourte?: () => ChampsReponseCourte
  enonceCourt?: () => string
  correctionCourte?: () => string
  clavierReponseCourte?: string
  texteAvantReponseCourte?: string
  texteApresReponseCourte?: string
  optionsChampReponseCourte?: OptionsChamp
  champReponseCourteEnLigne?: boolean
  compareReponseCourte?: CompareFunction
}

/** La bonne proposition du QCM, celle dont la correction met la réponse en évidence. */
function bonneProposition(exercice: ExerciceQcmA): string | undefined {
  const bonnes = exercice.reponses.filter((_, k) =>
    exercice.bonnesReponses == null ? k === 0 : exercice.bonnesReponses[k],
  )
  return bonnes.length === 1 ? bonnes[0] : undefined
}

export function genereReponsesCourtes(exercice: ExerciceAvecSaisie) {
  exercice.consigne = ''
  for (let i = 0, cpt = 0; i < exercice.nbQuestions && cpt < 30; cpt++) {
    exercice.versionAleatoire()

    const champs = exercice.champsReponseCourte?.()
    const reponse = champs
      ? JSON.stringify(champs.reponses)
      : (exercice.reponseCourte?.() ??
        exercice.reponses[0]
          .replace(/^\$|\$$/g, '')
          .replace(/\\(?:text|mathrm)\{[^}]*\}/g, '')
          .replace(/\\,|\\ /g, '')
          .trim())
    const enonce = exercice.enonceCourt?.() ?? exercice.enonce
    if (exercice.questionJamaisPosee(i, enonce, reponse)) {
      exercice.listeQuestions[i] =
        enonce +
        (champs
          ? exercice.interactif
            ? `<br>${remplisLesBlancs(exercice, i, champs.gabarit, 'fillInTheBlank ' + (exercice.clavierReponseCourte ?? KeyboardType.clavierDeBase))}`
            : ''
          : exercice.interactif
            ? `${exercice.champReponseCourteEnLigne ? '' : '<br>'}${ajouteChampTexteMathLive(exercice, i, exercice.clavierReponseCourte ?? KeyboardType.clavierDeBase, { texteAvant: exercice.texteAvantReponseCourte ?? '', texteApres: exercice.texteApresReponseCourte ?? '', ...exercice.optionsChampReponseCourte })}`
            : '')
      // Hors interactif, la correction est toujours celle du QCM, avec la bonne
      // proposition complète en évidence ; seule la saisie en attend moins.
      exercice.listeCorrections[i] = mettreEnEvidenceSelonMode(
        exercice.interactif
          ? (exercice.correctionCourte?.() ?? exercice.correction ?? '')
          : (exercice.correction ?? ''),
        bonneProposition(exercice),
        exercice.interactif
          ? {
              reponseSaisie: champs
                ? Object.values(champs.reponses).map((champ) =>
                    String(champ.value),
                  )
                : reponse,
            }
          : {},
      )
      if (champs) {
        handleAnswers(
          exercice,
          i,
          { bareme: toutPourUnPoint, ...champs.reponses },
          { formatInteractif: 'fillInTheBlank' },
        )
        i++
        continue
      }
      handleAnswers(
        exercice,
        i,
        {
          reponse: {
            value: reponse,
            ...(exercice.compareReponseCourte
              ? { compare: exercice.compareReponseCourte }
              : {}),
          },
        },
        { formatInteractif: 'mathalea-mathfield' },
      )
      i++
    }
  }
}

/**
 * Version sans QCM où l'élève compare deux grandeurs avec une liste déroulante
 * (`<`, `>` ou `=`). Les tirages sont ceux de `genereReponsesCourtes` : mêmes appels à
 * `versionAleatoire`, dans le même ordre.
 * @param exercice l'exercice, qui donne le symbole attendu et, éventuellement, `enonceCourt`
 * @param options.gauche premier terme de la comparaison, en LaTeX (par exemple `A`)
 * @param options.droite second terme de la comparaison, en LaTeX (par exemple `B`)
 */
export function genereComparaisonsDeroulantes(
  exercice: ExerciceQcmA & {
    enonceCourt?: () => string
    symboleBonneReponse: () => string
  },
  options: { gauche: string; droite: string },
) {
  exercice.consigne = ''
  for (let i = 0, cpt = 0; i < exercice.nbQuestions && cpt < 30; cpt++) {
    exercice.versionAleatoire()
    const enonce = exercice.enonceCourt?.() ?? exercice.enonce
    const symbole = exercice.symboleBonneReponse()
    if (exercice.questionJamaisPosee(i, enonce, symbole)) {
      exercice.listeQuestions[i] =
        enonce +
        (exercice.interactif
          ? `<br>$${options.gauche}$${sp(2)}${choixDeroulant(exercice, i, {
              choices: [
                { label: '?', value: '' },
                { latex: '<', value: '<' },
                { latex: '>', value: '>' },
                { latex: '=', value: '=' },
              ],
            })}${sp(2)}$${options.droite}$`
          : '')
      exercice.listeCorrections[i] = exercice.correction ?? ''
      if (exercice.interactif) {
        handleAnswers(
          exercice,
          i,
          { reponse: { value: symbole } },
          { formatInteractif: 'liste-deroulante' },
        )
      }
      i++
    }
  }
}

/**
 * Version sans QCM où l'élève complète un tableau de signes (en interactif).
 * Les tirages sont ceux de `genereReponsesCourtes` : mêmes appels à
 * `versionAleatoire`, dans le même ordre.
 */
export function genereTableauxDeSignes(
  exercice: ExerciceQcmA & {
    enonceCourt?: () => string
    configTableauSignes: () => TableauSVConfig
  },
) {
  exercice.consigne = ''
  for (let i = 0, cpt = 0; i < exercice.nbQuestions && cpt < 30; cpt++) {
    exercice.versionAleatoire()

    const enonce = exercice.enonceCourt?.() ?? exercice.enonce
    if (exercice.questionJamaisPosee(i, enonce)) {
      exercice.listeQuestions[i] =
        enonce +
        (exercice.interactif
          ? `<br>${addTableauSignesVariations(exercice, i, {
              config: exercice.configTableauSignes(),
              bareme: 1,
            })}`
          : '')
      exercice.listeCorrections[i] = exercice.correction ?? ''
      exercice.listeReponsesCourtes[i] = exercice.reponseCourteExplicite
      i++
    }
  }
}

/** Conserve les tirages du QCM et propose une saisie par défaut. */
export default class ExerciceQcmACourt extends ExerciceQcmA {
  reponseCourte?: () => string
  enonceCourt?: () => string
  correctionCourte?: () => string
  clavierReponseCourte?: string
  texteAvantReponseCourte?: string
  texteApresReponseCourte?: string
  optionsChampReponseCourte?: OptionsChamp
  /** Place le champ de saisie à la suite de l'énoncé, sans retour à la ligne. */
  champReponseCourteEnLigne?: boolean
  compareReponseCourte?: CompareFunction

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
  }

  nouvelleVersion() {
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }

    genereReponsesCourtes(this)
  }
}
