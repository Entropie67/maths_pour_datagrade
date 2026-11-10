import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = '0b95d'
export const refs = {
  'fr-fr': ['1A-E05-6'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Déterminer un taux d’évolution réciproque'
export const dateDePublication = '20/10/2026'
/**
 * @author Gilles Mora + ia (claude)
 */
export default class TauxReciproqueDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>',
      texteApres: '$\\,\\%$',
    }
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    // Couples de coefficients multiplicateurs décimaux dont le produit vaut 1
    const [petit, grand] = this.quotaChoice('couple', [
      [0.8, 1.25],
      [0.5, 2],
      [0.4, 2.5],
      [0.25, 4],
      [0.2, 5],
      [0.625, 1.6],
    ])
    const estBaisse = this.quotaChoice('estBaisse', [true, false])
    const CM = estBaisse ? petit : grand
    const CMR = estBaisse ? grand : petit
    // Taux en pourcentage, signés
    const taux = Math.round((CM - 1) * 1000) / 10
    const tauxR = Math.round((CMR - 1) * 1000) / 10
    const evolution = `${estBaisse ? 'baisse' : 'hausse'} de $${texNombre(Math.abs(taux), 1)}\\,\\%$`
    // Inverses moins immédiats (0,8 ↔ 1,25 et 0,625 ↔ 1,6) : on donne l'égalité
    const avecEgalite = petit === 0.8 || petit === 0.625
    const egalite = `$${texNombre(CM, 3)}\\times ${texNombre(CMR, 3)}=1$`

    this.question = avecEgalite ? `On donne l'égalité ${egalite}.<br>` : ''
    this.question += this.versionQcm
      ? `Le taux d'évolution réciproque d'une ${context.isDiaporama ? '<br>' : ''}${evolution} est :`
      : `${avecEgalite ? "À l'aide de cette égalité, d" : 'D'}éterminer le taux d'évolution réciproque ${context.isDiaporama ? '<br>' : ''}d'une ${evolution}.`

    this.correction = `Le coefficient multiplicateur associé à une ${evolution} est : $CM=1${ecritureAlgebrique(taux / 100)}=${texNombre(CM, 3)}$.<br>
Le coefficient multiplicateur réciproque $CM_R$ vérifie l'égalité $${texNombre(CM, 3)}\\times CM_R=1$.<br>
${avecEgalite ? "D'après l'égalité donnée, " : 'Ainsi, '}$CM_R=\\dfrac{1}{${texNombre(CM, 3)}}=${texNombre(CMR, 3)}$.<br>
Le taux d'évolution réciproque est $T_R=${texNombre(CMR, 3)}-1=${texNombre(tauxR / 100, 3)}$, soit `
    this.correction += this.versionQcm
      ? `$${miseEnEvidence(`${ecritureAlgebrique(tauxR)}\\,\\%`)}$.`
      : `$${miseEnEvidence(ecritureAlgebrique(tauxR))}\\,\\%$.`

    this.reponse = this.versionQcm
      ? `$${ecritureAlgebrique(tauxR)}\\,\\%$`
      : tauxR
    // Erreurs classiques : même taux, opposé du taux de départ, mauvais signe
    this.distracteurs = [
      `$${ecritureAlgebrique(taux)}\\,\\%$`,
      `$${ecritureAlgebrique(-taux)}\\,\\%$`,
      `$${ecritureAlgebrique(-tauxR)}\\,\\%$`,
    ]

    this.canEnonce = avecEgalite ? `On donne l'égalité ${egalite}.` : ''
    this.canReponseACompleter = `Le taux d'évolution réciproque d'une ${evolution} est $\\ldots\\,\\%$.`
  }
}
