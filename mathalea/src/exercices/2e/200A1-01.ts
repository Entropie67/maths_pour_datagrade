import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import {
  listeDesDiviseurs,
  premiersEntreBornes,
} from '../../lib/outils/primalite'
import ExerciceSimple from '../ExerciceSimple'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = "Lister tous les diviseurs d'un entier"
export const interactifReady = true

export const dateDePublication = '11/07/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '15/11/2025'
export const uuid = '15fd6'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1NO1B-5', '9R2NO1B-5', '9R3NO1B-5'],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

 */
export default class ModeleAutomatisme2nde extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.sup = 1
    this.besoinFormulaireNumerique = ['Niveau', 3]
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampTexte = {
      texteAvant: sp(5),
      texteApres: sp(5) + '(Séparer les diviseurs par un point-virgule.)',
    }
    this.optionsDeComparaison = { suiteDeNombres: true }
    this.comment =
      'Au niveau 1, l’entier est le produit de 10 par un nombre premier entre 7 et 29.<br> ' +
      'Au niveau 2, il est obtenu en multipliant 2 par deux petits nombres premiers.<br>' +
      'Au niveau 3, il résulte du produit de trois petits nombres premiers, puis multiplié par 10.'
  }

  nouvelleVersion() {
    // Dans ce modèle, j'ai pris la première question du fichier Doc-Automatismes-2de-acOT-GTCAN-2023.pdf.
    // La question posée est de lister tous les diviseurs d'un entier.
    // Selon le niveau choisi, on augmente la difficulté de l'entier choisi.
    // Le reste est identique pour les trois niveaux
    // Le bloc décidant de l'aléatoire
    let entierChoisi // La seule variable aléatoire de l'exo
    switch (this.sup) {
      case 1:
        entierChoisi = 10 * choice(premiersEntreBornes(7, 29))
        break
      case 2:
        do {
          const [b, c] = combinaisonListes(premiersEntreBornes(3, 13), 2)
          entierChoisi = 2 * b * c
        } while (entierChoisi % 10 === 0)
        break
      case 3:
      default:
        do {
          const [a, b, c] = combinaisonListes(premiersEntreBornes(2, 13), 3)
          entierChoisi = 10 * a * b * c
        } while (entierChoisi % 100 === 0) // on évite d'avoir 2 et 5 dans les trois facteurs aléatoires
        break
    }
    this.question = `Lister tous les diviseurs de $${texNombre(entierChoisi)}$. `
    this.correction = `La liste des diviseurs de $${texNombre(entierChoisi)}$ est : $${listeDesDiviseurs(
      entierChoisi,
    )
      .map((n) => miseEnEvidence(texNombre(n)))
      .join(`$${sp(1)};${sp(1)}$`)}$.`
    this.reponse = listeDesDiviseurs(entierChoisi).join(';')
  }
}
