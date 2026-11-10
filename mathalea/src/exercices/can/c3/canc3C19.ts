import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Résoudre un problème avec une multiplication'
export const interactifReady = true

export const dateDePublication = '31/10/2024'
/**
 * @author Gilles Mora
 */
export const uuid = 'a24fb'

export const refs = {
  'fr-fr': ['canc3C19'],
  'fr-ch': [],
}
export default class problemeMultiplication extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (
      this.quotaRandint('typeDeQuestions', 1, 6) // 1,2, 3
    ) {
      case 1:
        {
          const prenom = prenomM()
          const a = randint(4, 9)
          const b = randint(3, 9)
          this.reponse = texNombre(a * b, 0)
          this.question = `Un fleuriste vend des bouquets de roses. Dans
chaque bouquet, il y a $${a}$ roses. <br>
${prenom} achète $${b}$ bouquets.<br>
Combien a-t-il de roses ?`
          this.correction = `${prenom} achète $${b}$ bouquets de $${a}$ roses chacun.<br>
          $${a} \\times ${b}=${this.reponse}$<br>
          ${prenom} a $${miseEnEvidence(this.reponse)}$ roses en tout.`

          this.canReponseACompleter = '$\\ldots$ roses'
          this.optionsChampTexte = { texteApres: 'roses' }
        }
        break

      case 2:
        {
          const a = choice([25, 50])
          const b = a === 25 ? choice([4, 5, 6, 8, 10]) : randint(4, 12)
          this.reponse = texNombre(a * b, 0)
          this.question = `Une nageuse s'entraîne dans une piscine dont la longueur est  $${a}$ mètres.<br>
          Elle a parcouru $${b}$ longueurs.<br>
Combien de mètres a-t-elle parcourus ?`
          this.correction = `La nageuse a parcouru $${b}$ longueurs d'une piscine de $${a}$ mètres.<br>
          $${a} \\times ${b}=${this.reponse}$ <br>          
          Elle a parcouru $${miseEnEvidence(this.reponse)}$ mètres au total.`

          this.canReponseACompleter = '$\\ldots\\text{ m}$'
          this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
        }
        break
      case 3:
        {
          const a = randint(2, 4) * 100 + choice([50, 0])
          const b = randint(5, 9)
          this.reponse = texNombre(a * b, 0)
          this.question = `Un collège achète $${b}$ VTT pour l'association sportive.<br>
           Chaque VTT coûte $${a}$ euros.<br>
Combien cela coûte-t-il pour le collège ?`
          this.correction = `Le collège achète $${b}$ VTT à $${a}$ € l'unité.<br>
          $${a} \\times ${b}=${this.reponse}$<br>
          Le coût pour le collège est de  $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 4:
        {
          const a = randint(4, 9)
          const b = randint(5, 9) * 10
          this.reponse = texNombre(a * b, 0)
          this.question = `Dans une salle, il y a $${a}$ rangées de $${b}$ chaises.<br>
          Combien y a-t-il de places assises dans cette salle ?`
          this.correction = `Il y a $${a}$ rangées de $${b}$ chaises chacune.<br>
          $${a} \\times ${b}=${this.reponse}$<br>          
          Il y a $${miseEnEvidence(this.reponse)}$ places assises dans cette salle.`

          this.canReponseACompleter = '$\\ldots$ places assises'
          this.optionsChampTexte = { texteApres: 'places assises' }
        }
        break

      case 5:
        {
          const listeValeur: [number, string][] = [
            [1000, 'mille'],
            [2000, 'deux mille'],
            [3000, 'trois mille'],
            [4000, 'quatre mille'],
            [5000, 'cinq mille'],
            [6000, 'six mille'],
            [7000, 'sept mille'],
            [8000, 'huit mille'],
            [9000, 'neuf mille'],
          ]
          const a = choice(listeValeur)
          const b = randint(9, 25)
          this.reponse = texNombre(a[0] * b, 0)
          this.question = `Pour un concert, ${a[1]} billets ont été vendus. <br>
          Les places sont toutes au tarif de $${b}$ euros.<br>
          Quelle est la recette totale ? `
          this.correction = `Les ${a[1]} billets ont été vendus au tarif unique de $${b}$ €.<br>        
        $${texNombre(a[0], 0)} \\times ${texNombre(b, 0)}=${this.reponse}$<br>
        La recette totale est  $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 6:
        {
          const prenom = prenomF()
          const listeValeur: [number, string][] = [
            [4, 'trois'],
            [5, 'quatre'],
            [6, 'cinq'],
            [7, 'six'],
          ]
          const a = choice(listeValeur)
          const b = randint(1, 2) * 10 + randint(1, 9)
          this.reponse = texNombre(a[0] * b, 0)
          this.question = `${prenom} et ses ${a[1]} amis se partagent équitablement des bonbons.<br>
           Chacun en a eu $${b}$.<br>
Combien de bonbons avaient-ils à partager ?`
          this.correction = `Chacun des $${a[0]}$ enfants (${prenom} et ses ${a[1]} amis) a le même nombre de bonbons.<br>
          $${texNombre(a[0], 0)} \\times ${b}=${this.reponse}$<br>
          Le nombre de bonbons à partager est $${miseEnEvidence(this.reponse)}$.`

          this.canReponseACompleter = '$\\ldots$ bonbons'
          this.optionsChampTexte = { texteApres: 'bonbons' }
        }
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
