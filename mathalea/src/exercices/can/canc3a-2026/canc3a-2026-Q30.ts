import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver un nombre de boîtes'
export const interactifReady = true

export const uuid = '496e9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Éric Elter

*/

type TypeDeQuestion = {
  fabricant: string
  produit: string
}

export default class Can20266Q30 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>',
    }
  }

  typesDeQuestions: TypeDeQuestion[] = [
    { fabricant: 'usine', produit: 'stylos' },
    { fabricant: 'confiserie', produit: 'bonbons' },
    { fabricant: 'boulangerie', produit: 'biscuits' },
    { fabricant: 'chocolaterie', produit: 'chocolats' },
    { fabricant: 'fabrique', produit: 'balles de tennis' },
    { fabricant: 'cirière', produit: 'bougies' },
    { fabricant: 'imprimerie', produit: 'carnets' },
    { fabricant: 'savonnerie', produit: 'savons' },
    { fabricant: 'usine', produit: 'brosses à dents' },
    { fabricant: 'fabrique', produit: 'jouets' },
  ]

  enonce(choixQuestion?: TypeDeQuestion, Nombre?: number) {
    if (Nombre == null) {
      choixQuestion = choice(this.typesDeQuestions)
      Nombre = choice([
        randint(2, 4) * 100 + randint(2, 7) * 10,
        randint(2, 4) * 1000 + randint(2, 7) * 100,
      ])
    }

    this.question = `Une ${choixQuestion!.fabricant} a produit $${texNombre(Nombre)}$ ${choixQuestion!.produit}.<br>
Elle les emballe par boîte de $10$.<br>
Combien de boîtes faut-il ?`
    this.reponse = Math.ceil(Nombre / 10)
    this.correction = `Il faut partager $${texNombre(Nombre)}$ en $10$ pour trouver le nombre de boîtes pleines.<br>`
    this.correction += `Or, $${texNombre(Nombre)}=${Math.floor(Nombre / 10)} \\times 10$.<br>`
    this.correction += `Il y aura donc $${miseEnEvidence(texNombre(this.reponse))}$ boîtes pleines.`
    this.canReponseACompleter = 'Il faut $\\dots$ boîtes.'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(this.typesDeQuestions[3], 3200)
    else this.enonce()
  }
}
