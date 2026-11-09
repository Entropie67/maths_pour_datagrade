import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { labyrinthe } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { rangeMinMax } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '11/12/2020'
export const dateDeModifImportante = '29/10/2024'

export const titre = 'Parcourir un labyrinthe de fractions égales'

/**
 * @author Jean-claude Lhote (remaniée par EE pour la prise en compte du nb de lignes et de colonnes du labyrinthe)
 * Parcourir un labyrinthe de fractions en passant par des fractions égales.
 */
export const uuid = 'f8a4d'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceLabyrintheFractionsEgalesOld extends Exercice {
  niveau: string
  constructor() {
    super()
    this.besoinFormulaireNumerique = ['Facteur maximum', 20]
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
    this.niveau = '6e'
    this.nbQuestions = 1

    this.sup2 = 3
    this.sup = 10
    this.sup3 = 1
    this.sup4 = 1

    if (this.niveau === 'CM') {
      this.sup = 10
      this.sup2 = 3
    } else {
      this.sup = 13
      this.sup2 = 4
    }
  }

  nouvelleVersion() {
    const tailleChiffre = context.isAmc ? 1.1 : 0.7
    this.sup = Math.max(2, this.sup)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const mesfractions = []
      const nbL = this.sup3 === 1 ? randint(2, 8) : Math.max(2, this.sup3)
      const nbC =
        this.sup4 === 1 ? randint(3, 11 - nbL) : Math.max(3, this.sup4)
      const laby = labyrinthe({ nbLignes: nbL, nbColonnes: nbC })
      laby.niveau = contraindreValeur(1, 6, this.sup2, randint(1, 6)) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
      const monchemin = laby.choisitChemin(laby.niveau) // on choisit un chemin
      laby.murs2d = laby.construitMurs(monchemin) // On construit le labyrinthe
      laby.chemin2d = laby.traceChemin(monchemin) // On trace le chemin solution
      const table = randint(3, 8)
      let num = randint(1, 2 * table - 1)
      while (pgcd(num, table) !== 1) {
        num = randint(2, 2 * table - 1)
      }

      const maximum = this.sup
      texte = `Trouver la sortie en ne passant que par les cases contenant des fractions égales à $${new FractionEtendue(num, table).simplifie().texFSD}$.`

      // Zone de construction du tableau de nombres : S'ils sont sur monchemin et seulement s'ils doivent vérifier la consigne
      let listeMultiples = rangeMinMax(2, maximum, [table])
      listeMultiples = combinaisonListes(listeMultiples, nbC * nbL)

      for (let i = 0; i < nbC * nbL; i++) {
        mesfractions.push(
          new FractionEtendue(
            num * listeMultiples[i],
            table * listeMultiples[i],
          ),
        )
      }
      for (let i = 0; i < nbC * nbL; i++) {
        switch (randint(1, 3)) {
          case 1:
            mesfractions.push(
              new FractionEtendue(table, num).multiplieEntier(
                listeMultiples[i],
              ),
            )
            break
          case 2:
          case 3:
            mesfractions.push(
              new FractionEtendue(
                num * listeMultiples[i],
                table * Math.abs(listeMultiples[i] - table),
              ),
            )
            break
        }
      }

      // Le tableau de nombre étant fait, on place les objets nombres.
      laby.nombres2d = laby.placeNombres(
        monchemin,
        mesfractions.slice(0, nbC * nbL - 1),
        mesfractions.slice(nbC * nbL),
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
      if (context.isAmc)
        texte += ' Laisser dans le labyrinthe les traces du chemin parcouru.'
      texte += '<br>' + mathalea2d(params, laby.murs2d, laby.nombres2d)
      const nbDeNombresRencontres = laby.chemin2d.length - 1
      const numeroDeSortie = nbL - monchemin[monchemin.length - 1][1]
      texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(nbDeNombresRencontres)}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(numeroDeSortie)}$.<br>`
      texteCorr += mathalea2d(
        params,
        laby.murs2d,
        laby.nombres2d,
        laby.chemin2d,
      )
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          2 * i,
          KeyboardType.clavierNumbers,
          { texteAvant: 'Indiquer le numéro de la bonne sortie :' },
        )
        handleAnswers(this, 2 * i, {
          reponse: { value: numeroDeSortie },
        })
        texte += ajouteChampTexteMathLive(
          this,
          2 * i + 1,
          KeyboardType.clavierNumbers,
          { texteAvant: '<br>Combien de nombres rencontrés avant la sortie ?' },
        )
        handleAnswers(this, 2 * i + 1, {
          reponse: { value: nbDeNombresRencontres },
        })
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[0] = {
          enonce: 'ici la (ou les) question(s) est(sont) posée(s)',
          enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvantUneFois: false, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
          propositions: [
            {
              type: 'AMCOpen', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: texte,
                  sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
      }
      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
