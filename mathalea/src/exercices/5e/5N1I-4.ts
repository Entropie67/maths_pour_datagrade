import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { labyrinthe } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '7/12/2020'
export const dateDeModifImportante = '29/10/2024'
export const interactifReady = true

export const titre = 'Parcourir un labyrinthe de multiples'

/**
 * @author Jean-claude Lhote (remaniée par Éric Elter pour la prise en compte du nb de lignes et de colonnes du labyrinthe)
 * Sortir du labyrinthe en utilisant les critères de divisibilité.
 * Passage en multiMahField par Éric Elter (13/04/2026)
 */
export const uuid = 'e3870'

export const refs = {
  'fr-fr': ['5N1I-4'],
  'fr-2016': ['5A11-1'],
  'fr-ch': ['9R1NO1A-8', '9R2NO1A-8', '9R3NO1A-8', 'PRQNO09A-9', '9R1NO1D-4', '9R2NO1D-4', '9R3NO1D-4', 'PRQNO08A-15'],
}
export default class ExerciceLabyrintheDivisibilite extends Exercice {
  version: string
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Critères de divisibilité pour chaque question (entre 2 et 20)',
      'Nombres séparés par des tirets :',
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

    this.nbQuestions = 1

    this.sup = '2-5-10'
    this.sup3 = 1
    this.sup4 = 1
    this.sup2 = 4
    this.version = 'De2a20'
  }

  nouvelleVersion() {
    const tailleChiffre = context.isHtml ? 1.2 : 0.8

    let texte, texteCorr

    let monChemin

    const tablesPossibles = gestionnaireFormulaireTexte({
      min: 2,
      max: 20,
      defaut: choice([2, 5, 10]),
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      shuffle: true, // EE : laisser true
      melange: 0,
    }).map(Number)

    if (this.version === 'Que3et9') {
      for (let i = 2; i <= 20; i++) {
        if (i === 3 || i === 9) i++
        enleveElement(tablesPossibles, i)
      }
      if (tablesPossibles.length === 0) tablesPossibles.push(3, 9)
    } else if (this.version === 'Que25et10') {
      for (let i = 2; i <= 20; i++) {
        if (i === 2 || i === 5 || i === 10) i++
        enleveElement(tablesPossibles, i)
      }
      if (tablesPossibles.length === 0) tablesPossibles.push(2, 5, 10)
    }

    const tables = combinaisonListes(tablesPossibles, this.nbQuestions)

    for (let i = 0; i < this.nbQuestions;) {
      const nbL = this.sup3 === 1 ? randint(2, 8) : Math.max(2, this.sup3)
      const nbC =
        this.sup4 === 1 ? randint(3, 11 - nbL) : Math.max(3, this.sup4)
      const laby = labyrinthe({
        nbLignes: nbL,
        nbColonnes: nbC,
        scaleFigure: 0.7,
      })
      laby.niveau = contraindreValeur(1, 6, this.sup2, randint(1, 6)) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
      monChemin = laby.choisitChemin(laby.niveau) // On choisit un chemin
      laby.murs2d = laby.construitMurs(monChemin) // On construit le labyrinthe
      laby.chemin2d = laby.traceChemin(monChemin) // On trace le chemin solution
      texte = `Trouver la sortie en ne passant que par les cases contenant un nombre multiple de $${tables[i]}$.<br>`
      // Zone de construction du tableau de nombres : S'ils sont sur monChemin et seulement si, ils doivent vérifier la consigne
      let listeMultiples = []
      const listeNonMultiples = []
      for (let k = 200; k <= 12000; k += randint(1, 100)) {
        listeMultiples.push(tables[i] * k)
      }
      for (let k = 1; k <= nbC * nbL; k++) {
        listeNonMultiples.push(
          randint(200, 5000) * tables[i] + randint(1, tables[i] - 1),
        )
      }
      listeMultiples = combinaisonListes(listeMultiples, 12)
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
        scale: 0.5,
      }
      texte += mathalea2d(params, laby.murs2d, laby.nombres2d)
      if (this.interactif) {
        const numeroDeSortie = nbL - monChemin[monChemin.length - 1][1]
        const nbDeNombresRencontres = laby.chemin2d.length - 1
        texte += `${addMultiMathfield(this, i, {
          dataTemplate:
            'Indiquer le numéro de la bonne sortie : %{champ1}.\n Combien de nombres rencontrés avant la sortie ? %{champ2}',
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierNumbers },
            champ2: { keyboard: KeyboardType.clavierNumbers },
          },
        })}`
        handleAnswers(
          this,
          i,
          {
            champ1: { value: numeroDeSortie },
            champ2: { value: nbDeNombresRencontres },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }
      texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(laby.chemin2d.length - 1)}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(nbL - monChemin[monChemin.length - 1][1])}$.<br>`
      texteCorr += mathalea2d(
        params,
        laby.murs2d,
        laby.nombres2d,
        laby.chemin2d,
      )
      if (
        this.questionJamaisPosee(i, listeMultiples[0], listeNonMultiples[0])
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        i++
      }
    }
    listeQuestionsToContenu(this)
  }
} // Fin de l'exercice.
