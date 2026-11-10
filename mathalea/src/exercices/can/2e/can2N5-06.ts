import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Décomposer un nombre en produit avec un carré'
export const interactifReady = true

export const dateDePublication = '20/12/2025'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '2d81e'

export const refs = {
  'fr-fr': ['can2N5-06'],
  'fr-ch': ['NR'],
}
export default class DecomposerUnNombre extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeNombres = [
      {
        nombre: 8,
        mult: 2,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 12,
        mult: 3,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 20,
        mult: 5,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 24,
        mult: 6,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 28,
        mult: 7,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 32,
        mult: 8,
        carre: 4,
        racine: 2,
        reponsesSupp: [
          '16\\times2',
          '2\\times16',
          '4^2\\times2',
          '2\\times4^2',
        ],
        correctionSupp: `On peut aussi écrire $32=${miseEnEvidence(`2\\times16`)}=${miseEnEvidence(`2\\times4^2`)}$ car $16$ est aussi un carré parfait (carré de $4$).<br>`,
      },
      {
        nombre: 40,
        mult: 10,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 44,
        mult: 11,
        carre: 4,
        racine: 2,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 18,
        mult: 2,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 27,
        mult: 3,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 45,
        mult: 5,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 54,
        mult: 6,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 63,
        mult: 7,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 72,
        mult: 8,
        carre: 9,
        racine: 3,
        reponsesSupp: [
          '36\\times2',
          '2\\times36',
          '6^2\\times2',
          '2\\times6^2',
        ],
        correctionSupp: `On peut aussi écrire $72=${miseEnEvidence(`2\\times36`)}=${miseEnEvidence(`2\\times6^2`)}$ car $36$ est aussi un carré parfait (carré de $6$).<br>`,
      },
      {
        nombre: 90,
        mult: 10,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 99,
        mult: 11,
        carre: 9,
        racine: 3,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 48,
        mult: 3,
        carre: 16,
        racine: 4,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 80,
        mult: 5,
        carre: 16,
        racine: 4,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 96,
        mult: 6,
        carre: 16,
        racine: 4,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 50,
        mult: 2,
        carre: 25,
        racine: 5,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 75,
        mult: 3,
        carre: 25,
        racine: 5,
        reponsesSupp: [],
        correctionSupp: '',
      },
      {
        nombre: 125,
        mult: 5,
        carre: 25,
        racine: 5,
        reponsesSupp: [],
        correctionSupp: '',
      },
    ]

    const choix = this.quotaChoice('choix', listeNombres)
    const {
      nombre: a,
      mult,
      carre,
      racine,
      reponsesSupp,
      correctionSupp,
    } = choix

    this.question = `Écrire le nombre $${a}$ comme le produit ${context.isDiaporama ? '<br>' : ''} de deux nombres entiers dont l'un ${context.isDiaporama ? '<br>' : ''} est un carré parfait.`

    // Construction de toutes les réponses acceptées
    const reponsesValides = [
      `${mult}\\times${carre}`,
      `${mult}\\times${racine}^2`,
      ...reponsesSupp,
    ]
    const toutesLesReponsesValides = reponsesValides.flatMap((expr) => {
      // Pour accepter a \times b si b \times a est accepté.
      const parts = expr.split('\\times')
      if (parts.length !== 2) return [expr] // sécurité

      const [a, b] = parts
      return [expr, `${b}\\times${a}`]
    })

    this.reponse = {
      reponse: {
        value: toutesLesReponsesValides,
        options: { texteSansCasse: true },
      },
    }
    this.correction = ` $${a}$ est divisible par $${carre}$ qui est le carré de $${racine}$.<br>
    Ainsi, $${a}=${miseEnEvidence(`${mult}\\times${carre}`)}=${miseEnEvidence(`${mult}\\times${racine}^2`)}$.<br>
    ${correctionSupp}`

    this.canReponseACompleter = `$${a}=\\ldots$`
  }
}
