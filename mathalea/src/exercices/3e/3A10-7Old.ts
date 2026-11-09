import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { Labyrinthe, labyrinthe } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

export const dateDePublication = '12/10/2022'
export const dateDeModifImportante = '29/10/2024'
export const titre = 'Explorer un labyrinthe de nombres premiers'
export const interactifReady = true

/** Explorer un labyrinthe de nombres premiers
 * @author Éric Elter // Sur la base d'autres labyrinthes déjà créés
 */
export const uuid = '9552d'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceLabyrinthePremiers3eOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Liste des nombres premiers ',
      3,
      '1 : Inférieurs à 30\n2 : Inférieurs à 100\n3 : Inférieurs à 200',
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau de rapidité',
      6,
      '1 : Escargot\n2 : Tortue\n3 : Lièvre\n4 : Antilope\n5 : Guépard\n6 : Au hasard',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de lignes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de colonnes du labyrinthe (entre 3 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.nbQuestions = 3
    this.sup = 3
    this.sup2 = 6
    this.sup3 = 1
    this.sup4 = 1
    this.comment =
      'Malgré le choix du nombre de colonnes et de lignes, pour une question de puissance de calculs, le nombre de cases est limité à 60.'
  }

  nouvelleVersion() {
    const tailleChiffre = 1.5
    let nbPremiers: number[] = []
    let nbMax
    switch (this.sup) {
      case 2:
        nbPremiers = [
          2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
          67, 71, 73, 79, 83, 89, 97,
        ]
        nbMax = 99
        break
      case 1:
        nbPremiers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
        nbMax = 29
        break
      case 3:
      default:
        nbPremiers = [
          2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
          67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137,
          139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199,
        ]
        nbMax = 199
        break
    }

    let texte, texteCorr
    let laby: Labyrinthe
    let monChemin

    for (let q = 0; q < this.nbQuestions;) {
      let nbL = this.sup3 === 1 ? randint(2, 7) : Math.max(2, this.sup3)
      let nbC = this.sup4 === 1 ? randint(3, 7) : Math.max(3, this.sup4)
      let indiceDiminution = 0
      while (nbL * nbC > 60) {
        indiceDiminution++
        if (choice([true, false])) {
          nbL =
            this.sup3 === 1
              ? randint(2, 7)
              : Math.max(2, this.sup3 - 1 - (indiceDiminution % 2))
          nbC =
            this.sup4 === 1
              ? randint(3, 7)
              : Math.max(3, this.sup4 - (indiceDiminution % 2))
        } else {
          nbL =
            this.sup3 === 1
              ? randint(2, 7)
              : Math.max(2, this.sup3 - (indiceDiminution % 2))
          nbC =
            this.sup4 === 1
              ? randint(3, 7)
              : Math.max(3, this.sup4 - 1 - (indiceDiminution % 2))
        }
      }
      laby = labyrinthe({ nbLignes: nbL, nbColonnes: nbC })
      laby.niveau = contraindreValeur(1, 6, this.sup2, randint(1, 6)) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
      monChemin = laby.choisitChemin(laby.niveau) // On choisit un chemin
      laby.murs2d = laby.construitMurs(monChemin) // On construit le labyrinthe
      laby.chemin2d = laby.traceChemin(monChemin, orangeMathalea) // On trace le chemin solution

      texte =
        'Trouver la sortie en ne passant que par les cases contenant un nombre premier.<br>'
      texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(laby.chemin2d.length - 1)}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(nbL - monChemin[monChemin.length - 1][1])}$.<br>`
      // Zone de construction du tableau de nombres : S'ils sont sur monChemin et seulement si, ils doivent vérifier la consigne

      const bonnesReponses = combinaisonListes(nbPremiers, nbC * nbL)
      let mauvaisesReponses = Array.from(
        { length: nbMax - 1 },
        (_, i) => i + 2,
      ).filter((number) => !nbPremiers.includes(number))
      mauvaisesReponses = combinaisonListes(mauvaisesReponses, nbC * nbL)
      // Le tableau de nombre étant fait, on place les objets nombres.
      laby.nombres2d = laby.placeNombres(
        monChemin,
        bonnesReponses,
        mauvaisesReponses,
        tailleChiffre,
      )
      const params = {
        xmin: -4,
        ymin: 0,
        xmax: 5 + 3 * nbC,
        ymax: 2 + 3 * nbL,
        pixelsParCm: 20,
        scale: 0.7,
      }
      texte += mathalea2d(params, laby.murs2d, laby.nombres2d)
      texte += ajouteChampTexteMathLive(
        this,
        2 * q,
        KeyboardType.clavierNumbers,
        { texteAvant: 'Indiquer le numéro de la bonne sortie :' },
      )
      handleAnswers(this, 2 * q, {
        reponse: { value: `${nbL - monChemin[monChemin.length - 1][1]}` },
      })
      texte += ajouteChampTexteMathLive(
        this,
        2 * q + 1,
        KeyboardType.clavierNumbers,
        { texteAvant: '<br>Combien de nombres rencontrés avant la sortie ?' },
      )
      handleAnswers(this, 2 * q + 1, {
        reponse: { value: `${laby.chemin2d.length - 1}` },
      })
      texteCorr += mathalea2d(
        params,
        laby.murs2d,
        laby.nombres2d,
        laby.chemin2d,
      )

      if (
        this.questionJamaisPosee(q, bonnesReponses[0], mauvaisesReponses[0])
      ) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
    }
    listeQuestionsToContenu(this)
  }
}
