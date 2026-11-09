import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre un problème avec une addition'
export const interactifReady = true

export const dateDePublication = '31/10/2024'
/**
 * @author Gilles Mora
 */
export const uuid = 'a7a49'

export const refs = {
  'fr-fr': ['canc3C17'],
  'fr-ch': [],
}
export default class problemeAddition extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (
      this.quotaRandint('typeProbleme', 1, 7) // 1,2, 3
    ) {
      case 1:
        {
          const a = randint(1, 3) * 10 + randint(4, 8)
          const b = randint(1, 3) * 10 + randint(6, 9)
          const prenom = prenomM()
          this.reponse = texNombre(a + b, 0)
          this.question = `Ce matin, ${prenom} a dépensé $${a}$ €, puis l'après-midi, il a dépensé $${b}$ €.<br>
Combien a-t-il dépensé en tout ?`
          this.correction = `${prenom} a d'abord dépensé $${a}$ €, puis il a dépensé $${b}$ €.<br>
          $${a} +${b}=${this.reponse}$<br>
          En tout, ${prenom} a dépensé $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 2:
        {
          const a = randint(3, 4) * 10 + randint(4, 8)
          const b = randint(2, 3) * 10 + randint(6, 9)
          this.reponse = texNombre(a + b, 0)
          this.question = `Pour le voyage de fin d’année, $${a}$ élèves de CE et $${b}$ élèves de CM partent.<br>
              Au total, combien d’élèves partent ?`
          this.correction = `$${a}$ élèves de CE et $${b}$ élèves de CM partent en voyage.<br>
          $${a} +${b}=${this.reponse}$ <br>
          En tout, $${miseEnEvidence(this.reponse)}$ élèves partent en voyage.`

          this.canReponseACompleter = '$\\ldots$ élèves'
          this.optionsChampTexte = { texteApres: 'élèves' }
        }
        break
      case 3:
        {
          const a = randint(21, 39) * 10 + randint(4, 8)
          const b = randint(1, 3) * 10 + randint(6, 9)
          this.reponse = texNombre(a + b, 0)
          this.question = `Un vendeur a vendu dans sa journée un VTT à $${a}$ € et un casque à $${b}$ €.<br>
Quel est le montant de la vente du jour pour ce vendeur ?`
          this.correction = `Dans la journée, le vendeur a vendu un VTT à $${a}$ € et un casque à $${b}$ €.<br>
          $${a} +${b}=${this.reponse}$<br>
          La vente du jour pour ce vendeur est $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 4:
        {
          const a = randint(2, 3) * 100 + randint(4, 8) * 10
          const b = randint(3, 4) * 100 + randint(6, 9) * 10
          this.reponse = texNombre(a + b, 0)
          this.question = `Dans une ville, il y a deux collèges.<br>
                  Dans l'un, il y a $${a}$ élèves et dans l'autre, il y a $${b}$ élèves.<br>
                  Combien y a-t-il d'élèves au collège dans cette ville ? `
          this.correction = `Il y a $${a}$ élèves dans un collège et $${b}$ élèves dans un autre.<br>
          $${a} +${b}=${this.reponse}$<br>
          En tout, il y a $${miseEnEvidence(this.reponse)}$ élèves au collège dans cette ville.`

          this.canReponseACompleter = '$\\ldots$ élèves'
          this.optionsChampTexte = { texteApres: 'élèves' }
        }
        break

      case 5:
        {
          const prenom = prenomM()
          const a = randint(3, 7) * 10 + randint(6, 9)
          const b = randint(1, 2) * 10 + randint(5, 7)
          this.reponse = texNombre(a + b, 0)
          this.question = `${prenom} a $${a}$ billes. <br>Il en gagne $${b}$ à la récréation.<br>
Combien de billes a-t-il maintenant ? `
          this.correction = `${prenom} a $${a}$ billes puis en gagne $${b}$.<br>
          $${a} +${b}=${this.reponse}$<br>
          En tout, ${prenom} a $${miseEnEvidence(this.reponse)}$ billes.`

          this.canReponseACompleter = '$\\ldots$ billes'
          this.optionsChampTexte = { texteApres: 'billes' }
        }
        break

      case 6:
        {
          const prenom = prenomF()
          const a = randint(21, 39) * 10 + randint(4, 8)
          const b = randint(1, 3) * 10 + randint(6, 9)
          this.reponse = texNombre(a + b, 0)
          this.question = `${prenom} a $${a}$ euros sur son compte en banque. <br>Elle dépose sur son compte $${b}$ euros.<br>
    Combien a-t-elle d'argent maintenant sur son compte ?`
          this.correction = `${prenom} a $${a}$ € sur son compte puis dépose $${b}$ €.<br>
          $${a} +${b}=${this.reponse}$<br>
           ${prenom} a maintenant $${miseEnEvidence(this.reponse)}$ euros sur son compte.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 7:
        {
          const a = randint(21, 39) * 10000 + randint(7, 9) * 1000
          const b = randint(4, 7) * 1000
          this.reponse = texNombre(a + b, 0)
          this.question = `Le prix d'une maison est $${texNombre(a, 0)}$ € hors frais d'agence. <br>
              Les frais d'agence s'élèvent à $${texNombre(b, 0)}$ €.<br>
       Quel est le prix de la maison frais d'agence inclus ?`
          this.correction = `Le prix de la maison est $${texNombre(a, 0)}$ € et les frais d'agence $${texNombre(b, 0)}$ €.<br>
           $${texNombre(a, 0)} +${texNombre(b, 0)}=${this.reponse}$<br>
         La maison coûte $${miseEnEvidence(this.reponse)}$ euros frais d'agence inclus.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
