import { buildQcmForExercise } from '../lib/interactif/qcmBuilder'
import { qcmCamExport } from '../lib/qcmCam'
import type {
  IExerciceQcm,
  IExerciceQcmOptions,
  MessageMode,
} from '../lib/types'
import Exercice from './Exercice'

export const interactifReady = true
export const amcReady = 'true'
export const amcType = 'qcmMono'

export const nombreElementsDifferents = (liste: string[]) => {
  const elements = new Set(liste)
  return elements.size
}

// class à utiliser pour fabriquer des Qcms sans aléatoirisation (en cas d'aléatoirisation, on utilisera ExerciceQcmA à la place)
/**
 * @author Jean-claude Lhote
 */
export default class ExerciceQcm extends Exercice implements IExerciceQcm {
  versionQcm?: boolean
  versionQcmDisponible = true

  enonce!: string
  reponses!: string[]
  bonnesReponses?: boolean[]
  corrections?: string[]
  options: IExerciceQcmOptions
  ajouteQcmCorr = false // Pour savoir si on ajoute le qcm corrigé à la fin de la correction.
  sansLettreCorrection = false // Pour ne pas terminer la correction par « La bonne réponse est la réponse A ».
  versionAleatoire?: () => void
  versionOriginale?: () => void = undefined
  constructor() {
    super()
    // Il n'est pas prévu d'avoir plus d'une question car ceci est prévu pour un seul énoncé statique à la base même si on pourra changer les valeurs et prévoir une aléatoirisation
    this.nbQuestions = 1

    this.spacingCorr = 2 // idem pour la correction
    // Les options pour le qcm à modifier éventuellement (vertical à true pour les longues réponses par exemple)
    this.options = {
      vertical: false,
      ordered: false,
      lastChoice: 8,
      radio: true,
    }
    this.enonce = ''
    this.reponses = []
    this.correction = ''
  }

  messageMode(): MessageMode {
    if (this.sansLettreCorrection) return 'aucun'
    return this.bonnesReponses == null ? 'single' : 'multiple'
  }

  nouvelleVersion() {
    if (this.bonnesReponses != null)
      // Un seul = et non deux pour tester pour aussi undefined.
      this.options.radio = false
    this.consigne = ''
    // Calculée en fonction et appelée après versionAleatoire()/versionOriginale() (pas avant la boucle) :
    // ces méthodes peuvent réassigner this.bonnesReponses (ex. QCM où la bonne réponse change selon le
    // tirage comme 1A-S03-4), donc un calcul figé en amont validerait le tirage précédent au lieu de celui affiché.
    const calculerStatuts = (): boolean[] => {
      const statuts: boolean[] = Array(this.reponses.length).fill(false)
      if (this.bonnesReponses == null) {
        statuts.fill(false, 0, this.reponses.length - 1)
        statuts[0] = true
      } else {
        for (let k = 0; k < this.reponses.length; k++) {
          statuts[k] = this.bonnesReponses[k] ?? false
        }
      }
      return statuts
    }
    if (this.versionAleatoire != null) {
      for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30;) {
        this.versionAleatoire()

        const bonneReponse = this.reponses[0]
        if (this.questionJamaisPosee(i, this.enonce, bonneReponse)) {
          const statuts = calculerStatuts()
          const qcmData = buildQcmForExercise(this, i, {
            question: this.enonce,
            correction: this.correction,
            propositions: this.reponses.map((reponse, index) => ({
              texte: reponse,
              statut: statuts[index],
              correction: this.corrections?.[index],
            })),
            options: {
              ...this.options,
              dontKnow: this.options.dontKnow,
            },
            ajouteQcmCorr: this.ajouteQcmCorr,
            messageMode: this.messageMode(),
          })

          this.listeQuestions[i] = qcmData.question
          this.listeCorrections[i] = qcmData.correction
          i++
        }
        cpt++
      }
    } else {
      if (this.versionOriginale != null) this.versionOriginale()
      const statuts = calculerStatuts()
      const qcmData = buildQcmForExercise(this, 0, {
        question: this.enonce,
        correction: this.correction,
        propositions: this.reponses.map((reponse, index) => ({
          texte: reponse,
          statut: statuts[index],
          correction: this.corrections?.[index],
        })),
        options: {
          ...this.options,
          dontKnow: this.options.dontKnow,
        },
        ajouteQcmCorr: this.ajouteQcmCorr,
        messageMode: this.messageMode(),
      })

      this.listeQuestions[0] = qcmData.question
      this.listeCorrections[0] = qcmData.correction
    }
  }

  // Pour permettre d'exporter tous les qcm pour en faire des séries de questions pour QcmCam. Ne pas y toucher
  qcmCamExport(): { question: string; reponse: string }[] {
    return qcmCamExport(this)
  }
}
