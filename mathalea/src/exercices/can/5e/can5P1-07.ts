import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer un effectif à partir d'une proportion"
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '06/10/2026'

/**
 * Reprise de 1A-R01-6 (version QCM) en question flash
 * @author Gilles Mora
 */
export const uuid = 'b82e8'

export const refs = {
  'fr-fr': ['can5P1-07'],
  'fr-ch': ['NR'],
}

interface Contexte {
  phrase: (total: number) => string
  pluriel: string
  groupe: string
  lieu: string
}

export default class EffectifProportion extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const contextes: Contexte[] = [
      {
        phrase: (total) => `Une boîte contient $${total}$ billes.`,
        pluriel: 'billes',
        groupe: 'billes vertes',
        lieu: 'dans cette boîte',
      },
      {
        phrase: (total) => `Une bibliothèque compte $${total}$ livres.`,
        pluriel: 'livres',
        groupe: 'livres de science-fiction',
        lieu: 'dans cette bibliothèque',
      },
      {
        phrase: (total) => `Un groupe est composé de $${total}$ personnes.`,
        pluriel: 'personnes',
        groupe: 'personnes mineures',
        lieu: 'dans ce groupe',
      },
      {
        phrase: (total) => `Un parking accueille $${total}$ voitures.`,
        pluriel: 'voitures',
        groupe: 'voitures électriques',
        lieu: 'dans ce parking',
      },
      {
        phrase: (total) => `Un panier contient $${total}$ fruits.`,
        pluriel: 'fruits',
        groupe: 'fruits mûrs',
        lieu: 'dans ce panier',
      },
      {
        phrase: (total) => `Un jeu est composé de $${total}$ cartes.`,
        pluriel: 'cartes',
        groupe: 'cartes rouges',
        lieu: 'dans ce jeu',
      },
    ]

    const contexte = choice(contextes)
    const total = choice([20, 30, 40, 50, 60, 70, 80, 90])
    const k = choice([1, 2, 3, 4, 5, 6, 7, 8, 9])
    const proportion = k / 10
    const effectif = (total * k) / 10

    this.question =
      `${contexte.phrase(total)}<br>` +
      `La proportion de ${contexte.groupe} ${contexte.lieu} est égale à $${texNombre(proportion, 1)}$.<br>`
    this.question += this.versionQcm
      ? `Le nombre de ${contexte.groupe} ${contexte.lieu} est égal à :`
      : `Combien y a-t-il de ${contexte.groupe} ${contexte.lieu} ?`

    this.correction =
      `Pour trouver le nombre de ${contexte.groupe}, on multiplie le nombre total de ${contexte.pluriel} par la proportion de ${contexte.groupe} :<br>` +
      `$${total} \\times ${texNombre(proportion, 1)} = ${total / 10} \\times \\underbrace{10 \\times ${texNombre(proportion, 1)}}_{${k}} = ${effectif}$.<br>` +
      `Il y a donc $${miseEnEvidence(effectif)}$ ${contexte.groupe} ${contexte.lieu}.`

    this.reponse = this.versionQcm ? `$${effectif}$` : effectif
    this.optionsChampTexte = { texteAvant: '<br>' }

    // Erreurs classiques : effectif du complément, écart d'un dixième du total, confusion avec 10 × proportion
    this.distracteurs = [
      total - effectif,
      effectif + total / 10,
      effectif - total / 10,
      k,
    ]
      .filter(
        (valeur, index, liste) =>
          valeur > 0 && valeur !== effectif && liste.indexOf(valeur) === index,
      )
      .slice(0, 3)
      .map((valeur) => `$${valeur}$`)

    this.canEnonce = this.question
    this.canReponseACompleter = '$\\ldots$'
  }
}
