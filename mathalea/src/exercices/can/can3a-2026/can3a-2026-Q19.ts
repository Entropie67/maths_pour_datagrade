import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Décomposition en produit de facteurs premiers'
export const interactifReady = true

export const uuid = 'oohnm'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsDeComparaison = { expressionNumerique: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(type?: 'a' | 'b' | 'c', facteurs?: number[]) {
    if (type == null) {
      type = choice(['a', 'b', 'c'])
    }

    if (type === 'a') {
      // Cas a : produit de 3 facteurs premiers distincts SIMPLES
      // Seulement 30, 42, 70 (pas de 105 qui est trop compliqué)
      if (facteurs == null) {
        const listeCasSimples = [
          [2, 3, 5], // 30
          [2, 3, 7], // 42
          [2, 5, 7], // 70
        ]
        facteurs = choice(listeCasSimples)
      }

      const nombre = facteurs[0] * facteurs[1] * facteurs[2]
      const decomposition = `${facteurs[0]}\\times${facteurs[1]}\\times ${facteurs[2]}`

      this.reponse = [decomposition]

      this.question = `Décompose $${nombre}$ en produit de facteurs premiers.`
      this.correction = `$${nombre}=${miseEnEvidence(decomposition)}$`
    } else if (type === 'b') {
      // Cas b : produit de 2 facteurs premiers au carré (2², 3², 5²)
      // Exemples : 36, 100
      if (facteurs == null) {
        facteurs = shuffle([2, 3, 5])
        // Éviter que le produit soit trop grand (> 190)
        while (facteurs[0] ** 2 * facteurs[1] ** 2 > 190) {
          facteurs = shuffle([2, 3, 5])
        }
        facteurs = facteurs.slice(0, 2)
      }

      const nombre = facteurs[0] * facteurs[0] * facteurs[1] * facteurs[1]
      const decompositionComplete = `${facteurs[0]}\\times ${facteurs[0]}\\times ${facteurs[1]}\\times ${facteurs[1]}`
      const decompositionCarres = `${facteurs[0]}^2\\times ${facteurs[1]}^2`

      this.reponse = [
        `${facteurs[0]}\\times${facteurs[0]}\\times${facteurs[1]}\\times${facteurs[1]}`,
        `${facteurs[1]}^2\\times${facteurs[0]}^2`,
        decompositionCarres,
      ]

      this.question = `Décompose $${nombre}$ en produit de facteurs premiers.`
      this.correction = `$${nombre}=${decompositionComplete}=${miseEnEvidence(decompositionCarres)}$`
    } else {
      // Cas c : un facteur au carré (ou plus) et un facteur simple
      // Exemples : 12 = 2²×3, 20 = 2²×5, 24 = 2³×3, 28 = 2²×7
      if (facteurs == null) {
        const exposant = choice([2, 3]) // 2² ou 2³
        const base = choice([2, 3])
        const autreFacteur = choice([2, 3, 5, 7].filter((x) => x !== base))
        facteurs = [base, exposant, autreFacteur]
      }

      const [base, exposant, autreFacteur] = facteurs
      const nombre = base ** exposant * autreFacteur

      let decompositionComplete = ''
      for (let i = 0; i < exposant; i++) {
        decompositionComplete += `${base}\\times `
      }
      decompositionComplete += autreFacteur

      const decompositionFactorisee = `${base}^${exposant}\\times ${autreFacteur}`

      this.reponse = [
        decompositionComplete.replace(/\\times /g, '\\times'),
        decompositionFactorisee,
        `${autreFacteur}\\times ${base}^${exposant}`,
      ]

      this.question = `Décompose $${nombre}$ en produit de facteurs premiers.`
      this.correction = `$${nombre}=${decompositionComplete}=${miseEnEvidence(decompositionFactorisee)}$`
    }
  }

  nouvelleVersion() {
    // Version officielle : 18 = 2×3×3 = 2×3²
    if (this.canOfficielle) {
      this.formatChampTexte =
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
      this.optionsDeComparaison = { expressionNumerique: true }
      this.optionsChampTexte = { texteAvant: '<br>' }

      const nombre = 18
      const decompositionComplete = '2\\times 3\\times 3'
      const decompositionCarres = '2\\times 3^2'

      this.reponse = [
        '2\\times 3\\times3',
        '3\\times 3\\times2',
        '2\\times 3^2',
        '3^2\\times 2',
      ]

      this.question = `Décompose $${nombre}$ en produit de facteurs premiers.`
      this.correction = `$${nombre}=${decompositionComplete}=${miseEnEvidence(decompositionCarres)}$`
    } else {
      this.enonce()
    }
  }
}
