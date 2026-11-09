import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire un nombre avec une puissance'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '27/01/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '20fcc'

export const refs = {
  'fr-fr': ['can3C2-07', '2N40-flash3'],
  'fr-ch': ['NR'],
}
export default class EcrireAvecPuissances extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { seulementCertainesPuissances: true }
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const cas = this.quotaRandint('cas', 1, 2)

    if (cas === 1) {
      // Cas avec des entiers
      const choixEntiers = [
        { nombre: 4, reponses: ['2^2'] },
        { nombre: 8, reponses: ['2^3'] },
        { nombre: 16, reponses: ['2^4', '4^2'] },
        { nombre: 32, reponses: ['2^5'] },
        { nombre: 64, reponses: ['2^6', '4^3', '8^2'] },
        { nombre: 9, reponses: ['3^2'] },
        { nombre: 27, reponses: ['3^3'] },
        { nombre: 81, reponses: ['3^4', '9^2'] },
        { nombre: 25, reponses: ['5^2'] },
        { nombre: 125, reponses: ['5^3'] },
        { nombre: 36, reponses: ['6^2'] },
        { nombre: 49, reponses: ['7^2'] },
        { nombre: 100, reponses: ['10^2'] },
        { nombre: 1000, reponses: ['10^3'] },
        { nombre: 10000, reponses: ['10^4', '100^2'] },
      ]

      const valeur = choice(choixEntiers)

      this.question = `Écrire le nombre $${texNombre(valeur.nombre)}$ sous la forme $a^n$ avec $n\\neq 1$.`

      // Afficher toutes les solutions dans la correction
      const solutionsTexte = valeur.reponses
        .map((rep) => {
          const [base, exp] = rep.split('^')
          return `${base}^{${exp}}`
        })
        .join(' \\text{ ou } ')

      this.correction = `$${texNombre(valeur.nombre)}=${miseEnEvidence(solutionsTexte)}$`

      // Passer toutes les réponses possibles
      this.reponse = valeur.reponses

      this.canEnonce = 'Écrire sous la forme $a^n$ avec $n\\neq 1$.'
      this.canReponseACompleter = `$${valeur.nombre}=\\ldots$`
    } else {
      // Cas avec des décimaux
      const choixDecimaux = [
        { nombre: 0.04, reponses: ['0.2^2', '5^{-2}'] },
        { nombre: 0.008, reponses: ['0.2^3', '5^{-3}'] },
        { nombre: 0.09, reponses: ['0.3^2'] },
        { nombre: 0.027, reponses: ['0.3^3'] },
        { nombre: 0.16, reponses: ['0.4^2'] },
        { nombre: 0.064, reponses: ['0.4^3'] },
        { nombre: 0.25, reponses: ['0.5^2', '2^{-2}'] },
        { nombre: 0.125, reponses: ['0.5^3', '2^{-3}'] },
        { nombre: 0.36, reponses: ['0.6^2'] },
        { nombre: 0.49, reponses: ['0.7^2'] },
        { nombre: 0.64, reponses: ['0.8^2'] },
        { nombre: 0.81, reponses: ['0.9^2'] },
      ]

      const valeur = choice(choixDecimaux)

      this.question = `Écrire le nombre $${texNombre(valeur.nombre)}$ sous la forme $a^n$ avec $n\\neq 1$.`

      // Afficher toutes les solutions dans la correction
      const solutionsTexte = valeur.reponses
        .map((rep) => {
          if (rep.includes('{')) {
            // Cas avec exposant négatif déjà formaté
            return rep
          } else {
            const [base, exp] = rep.split('^')
            return `${texNombre(parseFloat(base))}^{${exp}}`
          }
        })
        .join(' \\text{ ou } ')

      this.correction = `$${texNombre(valeur.nombre)}=${miseEnEvidence(solutionsTexte)}$`

      // Passer toutes les réponses possibles
      this.reponse = valeur.reponses

      this.canEnonce =
        'Compléter avec un nombre sous la forme $a^n$ avec $n\\neq 1$.'
      this.canReponseACompleter = `$${texNombre(valeur.nombre)}=\\ldots$`
    }
  }
}
