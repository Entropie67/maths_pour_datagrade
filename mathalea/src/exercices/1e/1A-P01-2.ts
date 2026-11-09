import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître les nombres pouvant être une probabilité'
export const dateDePublication = '23/10/2026'
export const interactifReady = true

export const uuid = 'df5fe'
export const refs = {
  'fr-fr': ['1A-P01-2'],
  'fr-ch': ['11LCNO4B-6', '11LSNO4B-6'],
}

type Nombre = {
  latex: string
  estUneProbabilite: boolean
  justification: string
}

// Nombres pouvant être une probabilité
const nombresValides: (() => Nombre)[] = [
  () => {
    const denominateur = randint(3, 10)
    return {
      latex: `\\dfrac{${randint(1, denominateur - 1)}}{${denominateur}}`,
      estUneProbabilite: true,
      justification: 'est compris entre $0$ et $1$',
    }
  },
  () => ({
    latex: texNombre(randint(1, 99) / 100, 2),
    estUneProbabilite: true,
    justification: 'est compris entre $0$ et $1$',
  }),
  () => ({
    latex: `${randint(1, 9) * 10}\\,\\%`,
    estUneProbabilite: true,
    justification: 'est compris entre $0\\,\\%$ et $100\\,\\%$',
  }),
  () =>
    choice([
      {
        latex: '0',
        estUneProbabilite: true,
        justification: 'est la probabilité d’un événement impossible',
      },
      {
        latex: '1',
        estUneProbabilite: true,
        justification: 'est la probabilité d’un événement certain',
      },
    ]),
]

// Nombres ne pouvant pas être une probabilité
const nombresInvalides: (() => Nombre)[] = [
  () => {
    const valeur = choice([-randint(1, 9) / 10, randint(11, 19) / 10])
    return {
      latex: texNombre(valeur, 1),
      estUneProbabilite: false,
      justification:
        valeur < 0
          ? 'est strictement négatif'
          : 'est strictement supérieur à $1$',
    }
  },
  () => {
    const denominateur = randint(2, 8)
    return {
      latex: `\\dfrac{${denominateur + randint(1, 5)}}{${denominateur}}`,
      estUneProbabilite: false,
      justification:
        'est strictement supérieur à $1$ (numérateur plus grand que le dénominateur)',
    }
  },
  () => ({
    latex: `${randint(11, 25) * 10}\\,\\%`,
    estUneProbabilite: false,
    justification: 'est strictement supérieur à $100\\,\\%$',
  }),
]

/**
 * Savoir qu'une probabilité est un nombre compris entre 0 et 1 :
 * compter, dans une liste, les nombres qui peuvent être une probabilité.
 * @author Arnaud Meistermann
 */
export default class NombresPouvantEtreUneProbabilite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    this.consigne = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // Entre 2 et 4 nombres valides parmi 6, pour qu'aucun compte ne se devine
      const nombreValides = randint(2, 4)
      const nombres = shuffle([
        ...shuffle(nombresValides)
          .slice(0, nombreValides)
          .map((genere) => genere()),
        ...Array.from({ length: 6 - nombreValides }, (_, k) =>
          nombresInvalides[k % nombresInvalides.length](),
        ),
      ])
      const liste = nombres.map((nombre) => `$${nombre.latex}$`).join(' ; ')
      let texte = `On considère les nombres suivants : ${liste}.<br>
      Combien de ces nombres peuvent être la probabilité d’un événement ?`
      if (this.interactif) {
        texte += `<br>${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`
      }
      handleAnswers(this, i, {
        reponse: {
          value: nombreValides,
          options: { nombreDecimalSeulement: true },
        },
      })
      const correction = `Une probabilité est un nombre compris entre $0$ et $1$ (entre $0\\,\\%$ et $100\\,\\%$ en pourcentage).<br>
      ${nombres
        .map(
          (nombre) =>
            `$\\bullet$ $${nombre.latex}$ ${nombre.estUneProbabilite ? 'peut' : 'ne peut pas'} être une probabilité : il ${nombre.justification}.`,
        )
        .join('<br>')}<br>
      Il y a donc $${miseEnEvidence(nombreValides)}$ nombres qui peuvent être une probabilité.`

      if (this.questionJamaisPosee(i, liste)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
