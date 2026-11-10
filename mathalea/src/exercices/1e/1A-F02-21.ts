import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import AutoQ6FMns2026 from '../EAMPremiere/EAM-FMnonSpe-2026-Q6'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '00867'
export const refs = {
  'fr-fr': ['1A-F02-21', '2A-F2-1'],
  'fr-ch': ['1mQCM-47', '11LSQCMFA2A-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer les coordonnées d'un point sur une courbe"
export const dateDePublication = '06/08/2026'
export const dateDeModifImportante = '21/10/2026'

/**
 * @author Gilles Mora
 * Clone de EAM-FMnonSpe-2026-Q6 en version exclusivement aléatoire.
 */
export default class DeterminerPointSurCourbe extends AutoQ6FMns2026 {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponse: string }
  >()

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    // Cet exercice construit lui-même sa version non QCM : il part de la génération du QCM,
    // et non de la saisie courte que propose maintenant la question dont il hérite.
    ExerciceQcmA.prototype.nouvelleVersion.call(this)
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      this.listeCorrections[i] = donnees.correction
      if (this.interactif) {
        const [abscisse, ordonnee] = donnees.reponse
          .replaceAll('\\,', '')
          .replace(/[()]/g, '')
          .split(';')
        const champs = remplisLesBlancs(
          this,
          i,
          '(%{champ1};%{champ2})',
          'fillInTheBlank ' + KeyboardType.clavierDeBase,
        )
        this.listeQuestions[i] = enonce.replace(
          /Déterminer les coordonnées du point de la courbe d'abscisse \$(.*?)\$\./,
          (_, abscisseTex) =>
            `Les coordonnées du point de la courbe d'abscisse $${abscisseTex}$ sont ${champs}.`,
        )
        handleAnswers(
          this,
          i,
          {
            bareme: toutPourUnPoint,
            champ1: {
              value: abscisse,
              options: { nombreDecimalSeulement: true },
            },
            champ2: {
              value: ordonnee,
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      } else {
        this.listeQuestions[i] = enonce
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: donnees.reponse.replaceAll('\\,', ''),
              options: { coordonnees: true },
            },
          },
          { formatInteractif: 'mathalea-mathfield' },
        )
      }
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    const preparerQuestion = () => {
      if (this.sup3 || context.isAmc) return
      const coordonnees = this.reponses[0]
        .replace(/^\$[A-Z]/, '')
        .replace(/\$$/, '')
      this.enonce = this.enonce.replace(
        /Le point d'abscisse \$(.*?)\$ de la courbe est :/,
        "Déterminer les coordonnées du point de la courbe d'abscisse $$$1$.",
      )
      const correction = (this.correction ?? '').replace(
        /C'est donc le point [\s\S]*$/,
        `Les coordonnées du point sont $${miseEnEvidence(coordonnees)}$.`,
      )
      this.questionsOuvertes.set(this.enonce, {
        correction,
        reponse: coordonnees,
      })
    }
    const aleatoire = this.versionAleatoire
    this.versionAleatoire = () => {
      aleatoire()
      preparerQuestion()
    }
    const originale = this.versionOriginale
    this.versionOriginale = () => {
      originale()
      preparerQuestion()
    }
    this.versionAleatoire()
  }
}
