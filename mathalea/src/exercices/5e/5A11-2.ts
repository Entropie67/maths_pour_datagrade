import {
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { labyrinthe, type LabyrintheChemin } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
export const dateDePublication = '16/11/2021'
export const dateDeModifImportante = '29/10/2024'
export const interactifReady = true

export const titre =
  'Parcourir un labyrinthe de multiples avec critères choisis équilibrés'

/**
 * @author Jean-claude Lhote (remaniée par EE pour la prise en compte du nb de lignes et de colonnes du labyrinthe)
 * Sortir du labyrinthe en utilisant les critères de divisibilité.
 */
export const uuid = 'ef7b6'

export const refs = {
  'fr-fr': [''],
  'fr-ch': ['9R1NO1D-5', '9R2NO1D-5', '9R3NO1D-5'],
}
export default class ExerciceLabyrintheDivisibilite2 extends Exercice {
  niveau: string
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de rapidité',
      6,
      '1 : Escargot\n2 : Tortue\n3 : Lièvre\n4 : Antilope\n5 : Guépard\n6 : Au hasard',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de lignes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de colonnes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]

    this.niveau = '6e'
    this.nbQuestions = 4

    this.sup = 6
    this.sup3 = 1
    this.sup4 = 1

    // this.consigne=`Trouver la sortie en ne passant que par les cases contenant un nombre divisible par $${parseInt(this.sup)}$.`
  }

  nouvelleVersion() {
    const tailleChiffre = 0.8

    let texte
    let texteCorr
    let monChemin: LabyrintheChemin = []
    const listeCouples = shuffle([
      [2, 3],
      [2, 9],
      [5, 3],
      [5, 9],
      [10, 3],
      [10, 9],
    ])
    let tables = []
    for (const couple of listeCouples) {
      tables.push(couple[0], couple[1])
    }
    tables = combinaisonListesSansChangerOrdre(tables, this.nbQuestions)
    for (let q = 0; q < this.nbQuestions;) {
      const nbL = this.sup3 === 1 ? randint(2, 8) : Math.max(2, this.sup3)
      const nbC =
        this.sup4 === 1 ? randint(3, 11 - nbL) : Math.max(3, this.sup4)
      const laby = labyrinthe({ nbLignes: nbL, nbColonnes: nbC })
      laby.niveau = contraindreValeur(1, 6, this.sup, randint(1, 6)) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
      monChemin = laby.choisitChemin(laby.niveau) // On choisit un chemin
      laby.murs2d = laby.construitMurs(monChemin, tailleChiffre) // On construit le labyrinthe
      laby.chemin2d = laby.traceChemin(monChemin) // On trace le chemin solution
      texte = `Trouver la sortie en ne passant que par les cases contenant un nombre divisible par $${tables[q]}$.<br>`
      // Zone de construction du tableau de nombres : S'ils sont sur monChemin et seulement si, ils doivent vérifier la consigne
      let listeMultiples = []
      const listeNonMultiples = []
      for (let i = 200; i <= 12000; i += randint(1, 100)) {
        listeMultiples.push(tables[q] * i)
      }
      for (let i = 1; i <= nbC * nbL; i++) {
        listeNonMultiples.push(
          randint(200, 5000) * tables[q] + randint(1, tables[q] - 1),
        )
      }
      listeMultiples = combinaisonListes(listeMultiples, 12)

      // On place les objets nombres.
      laby.nombres2d = laby.placeNombres(
        monChemin,
        listeMultiples,
        listeNonMultiples,
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
      /* texte += ajouteChampTexteMathLive(
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
      }) */

      texte += addMultiMathfield(this, q, {
        dataTemplate: `Indiquer le numéro de la bonne sortie : %{champ1}<br>
        Combien de nombres rencontrés avant la sortie ? %{champ2}`,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers, minWidth: 100 },
          champ2: { keyboard: KeyboardType.clavierNumbers, minWidth: 100 },
        },
      })
      handleAnswers(
        this,
        q,
        {
          bareme: toutAUnPoint,
          champ1: { value: `${nbL - monChemin[monChemin.length - 1][1]}` },
          champ2: { value: `${laby.chemin2d.length - 1}` },

          // ...
        },
        { formatInteractif: 'multi-mathfield' },
      )
      texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(laby.chemin2d.length - 1)}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(nbL - monChemin[monChemin.length - 1][1])}$.<br>`
      texteCorr += mathalea2d(
        params,
        laby.murs2d,
        laby.nombres2d,
        laby.chemin2d,
      )
      if (
        this.questionJamaisPosee(q, listeMultiples[0], listeNonMultiples[0])
      ) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
    }
    listeQuestionsToContenu(this)
  }
}
