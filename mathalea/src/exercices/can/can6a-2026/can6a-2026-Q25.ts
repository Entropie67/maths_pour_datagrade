import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Donner la nature d'un triangle"
export const interactifReady = true

export const uuid = 'js3qp'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can20266Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce(a?: string, b?: string, vf?: boolean) {
    if (a == null || b == null || vf == null) {
      ;[a, b] = choice([
        ['triangles équilatéraux', 'des triangles isocèles'],
        ['carrés', 'des rectangles'],
        ['losanges', 'des parallélogrammes'],
        ['rectangles', 'des parallélogrammes'],
        ['carrés', 'des losanges'],
        ['carrés', 'des parallélogrammes'],
      ])
      vf = choice([true, false])
    }

    this.question = vf
      ? `${context.isHtml ? '<u>Vrai ou Faux</u><br>' : '\\underline{Vrai ou Faux}<br>'}
     Tous les ${a} sont ${b}.`
      : `${context.isHtml ? '<u>Vrai ou Faux</u><br>' : '\\underline{Vrai ou Faux}<br>'}
     Tous les ${b.replace('des ', '')} sont des ${a}.`
    this.autoCorrection[0] = {
      enonce: this.question,
      options: { vertical: false },
      propositions: [
        {
          texte: `Vrai`,
          statut: vf,
        },
        {
          texte: `Faux`,
          statut: !vf,
        },
      ],
    }
    const monQcm = propositionsQcm(this, 0)
    this.question += monQcm.texte

    this.correction = vf
      ? `${texteEnCouleurEtGras('Vrai')} : tous les ${a} sont ${b} particuliers.`
      : `${texteEnCouleurEtGras('Faux')}.`
    if (!vf) {
      switch (a) {
        case 'triangles équilatéraux':
          this.correction += ` Par exemple, un triangle isocèle qui a $2$ côtés de $5\\text{ cm}$ et un côté de $3\\text{ cm}$, n'est pas équilatéral.`
          break
        case 'carrés':
          if (b === 'des rectangles') {
            this.correction += ` Par exemple, un rectangle qui a une largeur de $5\\text{ cm}$ et une longueur de $7\\text{ cm}$, n'est pas carré.`
          } else if (b === 'des losanges') {
            this.correction += ` Par exemple, un losange qui a une diagonale de $5\\text{ cm}$ et une diagonale de $7\\text{ cm}$, n'est pas carré.`
          } else {
            this.correction += ` Par exemple, un parallélogramme qui a un côté de $5\\text{ cm}$ et un autre de $7\\text{ cm}$, n'est pas carré.`
          }
          break
        case 'losanges':
          this.correction += ` Par exemple, un parallélogramme qui a un côtés de $5\\text{ cm}$ et un côté de $3\\text{ cm}$, n'est pas losange.`
          break
        case 'rectangles':
          this.correction += ` Par exemple, un parallélogramme qui a un angle de $40^\\circ$, n'est pas rectangle.`
          break
      }
    }

    this.canEnonce = vf
      ? `\\underline{Vrai ou Faux}<br>
    Tous les ${a} sont ${b}.<br>
    ${texteEnCouleurEtGras('Entoure la bonne réponse', 'black')}`
      : `\\underline{Vrai ou Faux}<br>
    Tous les ${b.replace('des ', '')} sont des ${a}.<br>
    ${texteEnCouleurEtGras('Entoure la bonne réponse', 'black')}`
    this.canReponseACompleter = `Vrai \\quad Faux`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce('triangles équilatéraux', 'isocèles', true)
    else this.enonce()
  }
}
