import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../../lib/outils/outilString'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Multiple simple'
export const interactifReady = true

export const uuid = 'f34d0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

const objets = [
  {
    sing: 'un paquet de gâteaux',
    plur: 'paquets de gâteaux',
    pMin: 3,
    pMax: 5,
    nbMax: 8,
  },
  {
    sing: 'une brioche au chocolat',
    plur: 'brioches au chocolat',
    pMin: 2,
    pMax: 3,
    nbMax: 9,
  },
  {
    sing: 'une barbe à papa',
    plur: 'barbes à papa',
    pMin: 2,
    pMax: 5,
    nbMax: 4,
  },
  {
    sing: 'une bouteille de jus de fruit',
    plur: 'bouteilles de jus de fruit',
    pMin: 2,
    pMax: 4,
    nbMax: 8,
  },
  {
    sing: 'une place de cinéma',
    plur: 'places de cinéma',
    pMin: 7,
    pMax: 10,
    nbMax: 5,
  },
]
/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q6 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    let quidam = 'Tom'
    let sexe = 'M'
    const objet = c != null ? objets[c] : choice(objets)
    if (a == null || b == null || c == null) {
      if (choice([0, 1]) === 0) {
        quidam = prenomM() as string
        sexe = 'M'
      } else {
        quidam = prenomF() as string
        sexe = 'F'
      }
      const nb = randint(2, objet.nbMax)
      a = randint(objet.pMin, objet.pMax)
      b = nb * a
    }
    this.reponse = Math.round(b / a)
    this.question = `${premiereLettreEnMajuscule(objet.sing)} coûte $${a}${sp()}\\text{€}$. <br>
    ${quidam} a $${b}${sp()}\\text{€}$.<br>
    Combien de ${objet.plur} peut-${sexe === 'M' ? 'il' : 'elle'} acheter ?`
    this.correction = ` $${b}\\div ${a}=${Math.round(b / a)}$.<br>
    ${quidam} peut acheter $${miseEnEvidence(Math.round(b / a))}$ ${objet.plur}.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 32, 0)
    else this.enonce()
  }
}
