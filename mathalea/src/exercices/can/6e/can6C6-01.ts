import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { prenomF } from '../../../lib/outils/Personne'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Rechercher un prix unitaire'
export const interactifReady = true

export const dateDePublication = '18/10/2021'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const dateDeModifImportante = '31/10/2026'
export const uuid = '81a00'

export const refs = {
  'fr-fr': ['can6C6-01', '6N2H-flash2'],
  'fr-ch': [],
}
export default class RecherchePrix extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteApres: ' €' }
  }

  nouvelleVersion() {
    const listeviennoiserie = [
      ['pains au chocolat', 'un pain au chocolat'],
      ['chocolatines', 'une chocolatine'],
      ['pains aux raisins', 'un pain aux raisins'],
      ['cookies', 'un cookie'],
      ['brioches', 'une brioche'],
    ]
    const a = this.quotaRandint('a', 2, 6)
    const v = choice(listeviennoiserie)
    const p = v[0]
    const s = v[1]
    const t = this.quotaChoice('t', [10, 20])
    const prenom1 = prenomF()
    const pu = this.quotaChoice('pu', [0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6])
    this.question = `À la boulangerie, ${prenom1} achète $${a}$ ${p}.<br>
     Elle paie avec un billet de $${t}$ €.<br>
     On lui rend $${texPrix(t - a * pu)}$ €.<br>
     
    Quel est le prix d'${s} ?`
    this.correction = `${prenom1} achète $${a}$ ${p}. Comme on lui rend $${texPrix(t - a * pu)}$ € sur son billet de $${t}$ €,
    ses ${p} lui ont coûté : $${t}-${texPrix(t - a * pu)}=${texPrix(a * pu)}$ €.<br>
    Le prix d'${s} est donc donné par :  $${texPrix(a * pu)}\\div ${a}=${miseEnEvidence(texPrix(pu))}$ €. `
    this.reponse = pu

    this.canReponseACompleter = '$\\dots$ €'
  }
}
