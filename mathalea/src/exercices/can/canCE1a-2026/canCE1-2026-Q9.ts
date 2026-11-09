import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Écrire un nombre en chiffres (QCM)'
export const interactifReady = true

export const uuid = '19b3f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
// [nombre en chiffres, écriture en lettres, distracteur 1, distracteur 2]
const nombres: [number, string, number, number][] = [
  [770, 'sept cent soixante-dix', 70070, 7070],
  [870, 'huit cent soixante-dix', 80070, 8070],
  [970, 'neuf cent soixante-dix', 90070, 9070],
  [670, 'six cent soixante-dix', 60070, 6070],
  [570, 'cinq cent soixante-dix', 50070, 5070],
  [470, 'quatre cent soixante-dix', 40070, 4070],
  [370, 'trois cent soixante-dix', 30070, 3070],
  [280, 'deux cent quatre-vingts', 20080, 2080],
  [380, 'trois cent quatre-vingts', 30080, 3080],
  [480, 'quatre cent quatre-vingts', 40080, 4080],
  [580, 'cinq cent quatre-vingts', 50080, 5080],
  [680, 'six cent quatre-vingts', 60080, 6080],
  [780, 'sept cent quatre-vingts', 70080, 7080],
  [880, 'huit cent quatre-vingts', 80080, 8080],
  [290, 'deux cent quatre-vingt-dix', 20090, 2090],
  [390, 'trois cent quatre-vingt-dix', 30090, 3090],
  [490, 'quatre cent quatre-vingt-dix', 40090, 4090],
  [590, 'cinq cent quatre-vingt-dix', 50090, 5090],
  [690, 'six cent quatre-vingt-dix', 60090, 6090],
  [790, 'sept cent quatre-vingt-dix', 70090, 7090],
  [890, 'huit cent quatre-vingt-dix', 80090, 8090],
]

export default class Can2026CE1Q9 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(nombre?: number, lettres?: string, dist1?: number, dist2?: number) {
    if (nombre == null || lettres == null || dist1 == null || dist2 == null) {
      ;[nombre, lettres, dist1, dist2] = choice(nombres)
    }

    this.autoCorrection[0] = {
      propositions: [
        {
          texte: `$${texNombre(dist1, 0)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(nombre, 0)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(dist2, 0)}$`,
          statut: false,
        },
      ],
      options: { vertical: true },
    }

    this.consigne = `Entoure le nombre  $\\textit{${lettres
      .charAt(0)
      .toUpperCase()}${lettres.slice(1)}}$.`
    const monQcm = propositionsQcm(this, 0)
    this.canEnonce = `Coche le nombre $\\textit{${lettres
      .charAt(0)
      .toUpperCase()}${lettres.slice(1)}}$.`
    this.question = `${monQcm.texte}`
    this.correction =
      monQcm.texteCorr +
      `${lettres.charAt(0).toUpperCase()}${lettres.slice(1)} s'écrit : $${miseEnEvidence(texNombre(nombre, 0))}$.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(770, 'sept cent soixante-dix', 70070, 7070)
    else this.enonce()
  }
}
