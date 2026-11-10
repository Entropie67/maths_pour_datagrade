import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import DragAndDrop from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Lire une puissance'
export const interactifReady = true
export const dateDePublication = '12/11/2024'
export const uuid = 'a9001'
export const refs = {
  'fr-fr': ['3C10-4'],
  'fr-ch': ['PRQNO03B-7'],
}
/**
 * @Author Jean-Claude LHOTE
 */
export default class LireUnePuissance extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireCaseACocher = ['avec des mantisses négatives', false]
    this.besoinFormulaire2CaseACocher = ['avec des exposants négatifs', false]
    this.dragAndDrops = []
  }

  nouvelleVersion(): void {
    this.dragAndDrops = []
    const etiquettes = [
      [
        { id: '1', contenu: 'deux' },
        { id: '2', contenu: 'trois' },
        { id: '3', contenu: 'quatre' },
        { id: '4', contenu: 'cinq' },
        { id: '5', contenu: 'six' },
        { id: '6', contenu: 'sept' },
        { id: '7', contenu: 'huit' },
        { id: '8', contenu: 'neuf' },
      ],
      [
        { id: '9', contenu: 'moins' },
        { id: '11', contenu: 'au' },
        { id: '14', contenu: 'à la' },
      ],
      [
        { id: '10', contenu: 'exposant' },
        { id: '12', contenu: 'carré' },
        { id: '13', contenu: 'cube' },
        { id: '15', contenu: 'puissance' },
      ],
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const mantisse = randint(2, 9) * (this.sup ? choice([1, -1]) : 1)
      const mantisseEnLettres = `${mantisse < 0 ? 'moins ' : ''}${nombreEnLettres(Math.abs(mantisse))}`
      const mantisseEtiquette = etiquettes[0].find(
        (e) => e.contenu === nombreEnLettres(Math.abs(mantisse)),
      )
      const mantisseId = mantisseEtiquette?.id ?? '1'
      const exposant =
        choice([2, 3, 4, 5, 6, 7, 8, 9], [Math.abs(mantisse)]) *
        (this.sup2 ? choice([1, -1]) : 1)
      const exposantEnLettres = `${exposant < 0 ? 'moins ' : ''}${nombreEnLettres(Math.abs(exposant))}`
      const exposantEtiquette = etiquettes[0].find(
        (e) => e.contenu === nombreEnLettres(Math.abs(exposant)),
      )
      const exposantId = exposantEtiquette?.id ?? '2'
      const texte = `Comment se lit : $${mantisse < 0 ? `(${String(mantisse)})` : String(mantisse)}^{${exposant}}$ ? `
      const enonceATrous = '%{rectangle1}'

      const leDragAndDrop = new DragAndDrop({
        exercice: this,
        question: i,
        consigne: 'Écrire avec les étiquettes disponibles.',
        etiquettes,
        enonceATrous,
        nomsZones: ['Lecture de la puissance'],
      })

      const lectures = [
        `${mantisseEnLettres} exposant ${exposantEnLettres}`,
        `${mantisseEnLettres} à la puissance ${exposantEnLettres}`,
      ]
      if (exposant === 2) lectures.push(`${mantisseEnLettres} au carré`)
      if (exposant === 3) lectures.push(`${mantisseEnLettres} au cube`)
      const guillemets = lectures.map((l) => `«${sp()}${l}${sp()}»`)
      const value = `${guillemets.slice(0, -1).join(', ')} ou ${guillemets[guillemets.length - 1]}`
      const texteCorr = `$${mantisse < 0 ? `(${String(mantisse)})` : String(mantisse)}^{${exposant}}$ se lit : ${texteEnCouleurEtGras(value)}.`
      if (this.questionJamaisPosee(i, mantisse, exposant)) {
        this.dragAndDrops[i] = leDragAndDrop
        this.listeQuestions[i] =
          `${texte} ${this.interactif ? leDragAndDrop.ajouteDragAndDrop({ melange: false, duplicable: true }) : ''}`
        const values: string[] = []
        if (mantisse < 0) {
          if (exposant < 0) {
            values.push(
              `9|${mantisseId}|10|9|${exposantId}`,
              `9|${mantisseId}|14|15|9|${exposantId}`,
            )
          } else {
            values.push(
              `9|${mantisseId}|10|${exposantId}`,
              `9|${mantisseId}|14|15|${exposantId}`,
            )
            if (exposant === 2) {
              values.push(`9|${mantisseId}|11|12`)
            }
            if (exposant === 3) {
              values.push(`9|${mantisseId}|11|13`)
            }
          }
        }
        if (mantisse > 0) {
          if (exposant < 0) {
            values.push(
              `${mantisseId}|10|9|${exposantId}`,
              `${mantisseId}|14|15|9|${exposantId}`,
            )
          } else {
            values.push(
              `${mantisseId}|10|${exposantId}`,
              `${mantisseId}|14|15|${exposantId}`,
            )
            if (exposant === 2) {
              values.push(`${mantisseId}|11|12`)
            }
            if (exposant === 3) {
              values.push(`${mantisseId}|11|13`)
            }
          }
        }
        handleAnswers(
          this,
          i,
          {
            rectangle1: {
              value: [...values],
              options: { ordered: true, multi: true },
            },
          },
          { formatInteractif: 'dnd' },
        )
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
