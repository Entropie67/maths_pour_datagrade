import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import {
  tableauSignesFonction,
  trouveFonctionAffine,
} from '../../lib/mathFonctions/etudeFonction'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lecture graphique du signe d'une fonction affine"
// export const interactifReady = false
//

export const dateDePublication = '11/07/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '18/02/2025'
export const uuid = 'e39b8'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}

/**
 * trois niveaux, trouver les signes d'une fonction affine
 * @author Jean-claude Lhote

 */
export default class LectureSigneAffine extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de fonction ',
      'Nombres séparés par des tirets :\n1: Fonction constante\n2: Fonction affine\n3: Fonction linéaire\n4: Mélange',
    ]
  }

  nouvelleVersion() {
    // Dans ce modèle, j'ai pris la première question du fichier Doc-Automatismes-2de-acOT-GTCAN-2023.pdf.
    // La question posée est de lister tous les diviseurs d'un entier.
    // Selon le niveau choisi, on augmente la difficulté de l'entier choisi.
    // Le reste est identique pour les trois niveaux
    // Le bloc décidant de l'aléatoire
    let a: number, b: number

    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      shuffle: true,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (Number(listeTypeDeQuestion[i])) {
        case 1: // coefficient nul
          a = 0
          b = randint(-4, 4, 0)
          break
        case 2:
          {
            // coefficient entier relatif
            const y = randint(-3, 3, 0)
            const x = randint(-3, 3, 0)
            ;[a, b] = trouveFonctionAffine(0, y, x, 0) as [number, number]
          }
          break
        default: // coefficient rationnel
          b = 0
          a = Math.random() < 0.5 ? randint(-3, 3, 0) : 1 / randint(-4, 4, 0)
          break
      }
      // a = rationnalise(a)
      // b = rationnalise(b)
      const fonction = (x: number | FractionEtendue) => a * Number(x) + b
      const tableau = tableauSignesFonction(fonction, -6, 6, {
        step: 1,
        substituts: [
          { antVal: -6, antTex: '-\\infty' },
          { antVal: 6, antTex: '+\\infty' },
        ],
      })
      const repere = new RepereBuilder({
        xMin: -6,
        xMax: 6,
        yMin: -6,
        yMax: 6,
      })
        .setGrille({
          grilleX: { dx: 1, xMin: -6, xMax: 6 },
          grilleY: { dy: 1, yMin: -6, yMax: 6 },
        })
        .setThickX({ xMin: -6, xMax: 6, dx: 1 })
        .setThickY({ yMin: -6, yMax: 6, dy: 1 })
        .buildStandard()
      const d = droite(a, -1, b)
      if (this.questionJamaisPosee(i, listeTypeDeQuestion[i], a, b)) {
        this.listeQuestions[i] =
          'Dresser le tableau de signes de la fonction représentée ci-dessous.<br>' +
          mathalea2d(Object.assign({}, fixeBordures([repere, d])), [repere, d])
        this.listeCorrections[i] =
          'Le tableau de signes de la fonction est représenté ci-dessous.<br>' +
          tableau
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
