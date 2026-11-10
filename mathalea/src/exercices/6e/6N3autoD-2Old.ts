import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { labyrinthe } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const titre = 'Parcourir un labyrinthe de multiples'
export const dateDePublication = '06/12/2020'
export const dateDeModifImportante = '29/10/2024'

/**
 * @author Jean-claude Lhote (remaniée par Éric Elter pour la prise en compte du nb de lignes et de colonnes du labyrinthe)
 * Parcourir un labyrinthe de nombres en passant par les multiples du nombre choisi.
 * Relecture : Janvier 2022 par Éric Elter
 */

export const uuid = 'fd4d8'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceLabyrintheMultiplesOld extends Exercice {
  niveau: string
  constructor() {
    super()
    this.niveau = '6e'
    this.nbQuestions = 3

    this.besoinFormulaireNumerique = [
      'Tables',
      4,
      '1 : Tables de 2,5 et 10\n2 : Tables de 3 et 9\n3 : Tables de 4,6,7 et 8\n4 : Mélange',
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
      'Nombre de colonnes du labyrinthe (entre 2 et 8 ou bien 1 si vous laissez le hasard décider)',
      8,
    ]
    this.sup = 4
    this.sup2 = this.niveau === 'CM' ? 3 : 4
    this.sup3 = 1
    this.sup4 = 1
  }

  nouvelleVersion() {
    const maximum = this.niveau === 'CM' ? 10 : 13
    let table
    if (this.sup === 1) {
      table = combinaisonListes([2, 5, 10], this.nbQuestions)
    } else if (this.sup === 2) {
      table = combinaisonListes([3, 9], this.nbQuestions)
    } else if (this.sup === 3) {
      table = combinaisonListes([4, 6, 8], this.nbQuestions)
    } else {
      table = combinaisonListesSansChangerOrdre(
        [
          choice([2, 5, 10]),
          choice([3, 9]),
          choice([4, 6, 7, 8]),
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
        ],
        this.nbQuestions,
      )
    }
    const tailleChiffre = 1.5

    for (
      let q = 0, texte, texteCorr, monChemin, laby, listeMultiples;
      q < this.nbQuestions;
    ) {
      const nbL = this.sup3 === 1 ? randint(2, 8) : Math.max(2, this.sup3)
      const nbC =
        this.sup4 === 1 ? randint(3, 11 - nbL) : Math.max(3, this.sup4)
      laby = labyrinthe({ nbLignes: nbL, nbColonnes: nbC, scaleFigure: 0.7 })
      laby.niveau = contraindreValeur(1, 6, this.sup2, randint(1, 6)) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
      monChemin = laby.choisitChemin(laby.niveau) // On choisit un chemin
      laby.murs2d = laby.construitMurs(monChemin) // On construit le labyrinthe
      laby.chemin2d = laby.traceChemin(monChemin) // On trace le chemin solution

      texte = `Trouver la sortie en ne passant que par les cases contenant un multiple de $${table[q]}$.<br>`
      // Zone de construction des tableaux de nombres
      listeMultiples = []
      const listeNonMultiples = []
      for (let i = 2; i <= maximum; i++) {
        listeMultiples.push(table[q] * i)
      }
      for (let i = 1; i <= nbC * nbL; i++) {
        listeNonMultiples.push(
          randint(2, maximum) * table[q] + randint(1, table[q] - 1),
        )
      }

      listeMultiples = combinaisonListes(listeMultiples, nbC * nbL)

      // Le tableau de nombre étant fait, on place les objets nombres.
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
        scale: 0.4,
      }
      texte += mathalea2d(params, laby.murs2d, laby.nombres2d)
      if (
        (1 + q) % 3 === 0 &&
        !context.isHtml &&
        !context.isAmc &&
        this.nbQuestions > 3
      ) {
        // en contexte Latex, on évite que la consigne soit sur un page différente du labyrinthe
        texte += '\\newpage'
      }
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
      texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(String(laby.chemin2d.length - 1))}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(String(nbL - monChemin[monChemin.length - 1][1]))}$.<br>`
      texteCorr += mathalea2d(
        params,
        laby.murs2d,
        laby.nombres2d,
        laby.chemin2d,
      )

      /** ********************** AMC Open *****************************/
      if (context.isAmc) {
        this.autoCorrection = [
          {
            enonce: texte,
            propositions: [{ texte: texteCorr, statut: 3, feedback: '' }],
          },
        ]
      }
      /****************************************************/
      if (
        this.questionJamaisPosee(q, listeMultiples[0], listeNonMultiples[0])
      ) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
      listeQuestionsToContenu(this)
    }
  }
}
