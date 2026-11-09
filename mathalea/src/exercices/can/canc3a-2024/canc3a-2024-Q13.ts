import { prenomM } from '../../../lib/outils/Personne'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { stringNombre, texPrix } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un coût'
export const interactifReady = true

export const uuid = '59072'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class CoutBDEtRomansCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: '€' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let coutUnitaire: number
    let nbBds: number
    let nbRomans: number
    let quidam: string
    if (this.canOfficielle) {
      quidam = 'Tom'
      coutUnitaire = 11
      nbBds = 6
      nbRomans = 4
    } else {
      quidam = prenomM(1) as string
      coutUnitaire = randint(11, 19)
      nbBds = randint(2, 8)
      nbRomans = 10 - nbBds
    }
    this.reponse = (coutUnitaire * 10).toFixed(0)
    this.question = `${quidam} achète $${stringNombre(nbBds, 0)}$ BD à 
    $${stringNombre(coutUnitaire, 2, true)}$ € ${sp(0.5)} l'unité et $${stringNombre(nbRomans, 0)}$ romans à $${stringNombre(coutUnitaire, 2, true)}$ €${sp(0.5)} l'unité.`

    this.question += '<br> Il paye : '
    if (!this.interactif) {
      this.question += '$\\ldots$ €'
    }
    this.canReponseACompleter = 'Il paye $\\ldots$ €'
    this.correction = `Comme les BD et les romans coûtent le même prix à l'unité, on calcule le nombre d'ouvrages : $${stringNombre(nbBds, 0)}+${stringNombre(nbRomans, 0)}=10$<br>`
    this.correction += `On multiplie ensuite par le prix unitaire : $10\\times ${texPrix(coutUnitaire)}=${miseEnEvidence(this.reponse)}$ €`
  }
}
