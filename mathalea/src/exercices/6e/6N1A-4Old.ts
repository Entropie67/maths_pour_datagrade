import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { labyrinthe } from '../../modules/Labyrinthe'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Parcourir un labyrinthe de numération décimale'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '9/12/2020'
export const dateDeModifImportante = '29/10/2024'
/**
 * @author Jean-claude Lhote (remaniée par Éric Elter pour la prise en compte du nb de lignes et de colonnes du labyrinthe)
 * Sortir du labyrinthe en utilisant la numération décimale.
 * Ajout AMC et remaniement du code pour moins d'évidence dans la solution : Janvier 2022 par Éric Elter
 */
export const uuid = '80645'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceLabyrintheNumerationOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Avec des dizaines de mille et des dix-millièmes',
    ]
    // this.besoinFormulaire2Numerique = ['Niveau de rapidité', 6, ' 1 : Escargot\n 2 : Tortue\n 3 : Lièvre\n 4 : Antilope\n 5 : Guépard\n 6 : Au hasard']
    this.besoinFormulaire2Numerique = [
      'Quel chiffre recherché ?',
      3,
      " 1 : Unité ou au-dessus\n 2 : En dessous de l'unité\n 3 : Peu importe",
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de lignes du labyrinthe (entre 2 et 7 ou bien 1 si vous laissez le hasard décider)',
      7,
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de colonnes du labyrinthe (entre 2 et 7 ou bien 1 si vous laissez le hasard décider)',
      7,
    ]
    this.besoinFormulaire5CaseACocher = ['Que des nombres entiers']

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = 1
    this.sup = true
    this.sup5 = false
  }

  nouvelleVersion() {
    const tailleChiffre = !this.sup5 ? 0.7 : 1.1
    let texte, texteCorr
    const nbL = this.sup3 === 1 ? randint(2, 7) : Math.max(2, this.sup3)
    const nbC = this.sup4 === 1 ? randint(3, 7) : Math.max(3, this.sup4)
    const laby = labyrinthe({ nbLignes: nbL, nbColonnes: nbC })
    laby.niveau = randint(1, 6) // Le niveau (de 1 à 6=mélange) définit le nombre d'étapes
    const monchemin = laby.choisitChemin(laby.niveau) // On choisit un chemin
    laby.murs2d = laby.construitMurs(monchemin) // On construit le labyrinthe
    laby.chemin2d = laby.traceChemin(monchemin) // On trace le chemin solution
    const positions = this.sup
      ? [
          'dix-millièmes',
          'millièmes',
          'centièmes',
          'dixièmes',
          'unités',
          'dizaines',
          'centaines',
          'unités de mille',
          'dizaines de mille',
        ]
      : [
          'millièmes',
          'centièmes',
          'dixièmes',
          'unités',
          'dizaines',
          'centaines',
          'unités de mille',
        ]
    let rang
    let rangbis
    let nombretemp

    const rangMax = this.sup ? 8 : 6
    const rangMin = !this.sup5 ? 0 : this.sup ? 4 : 3

    if (this.sup2 === 3) {
      rang = randint(rangMin, rangMax)
    } else if (this.sup2 === 2 && !this.sup5) {
      rang = this.sup ? randint(0, 3) : randint(0, 2)
    } else {
      rang = this.sup ? randint(4, rangMax) : randint(3, rangMax)
    }
    const chiffre = randint(1, 9)
    texte = `Trouver la sortie en ne passant que par les cases contenant un nombre dont le chiffre des ${positions[rang]} est un $${miseEnEvidence(chiffre, 'black')}$.<br>`
    const reponsesOK = []
    for (let a = 0; a < nbC * nbL; a++) {
      let partieEntiere = this.sup
        ? randint(1, Math.pow(10, 5))
        : randint(1, Math.pow(10, 4))
      let partieDecimale = this.sup
        ? randint(1, Math.pow(10, 4))
        : randint(1, Math.pow(10, 3))
      if (this.sup) {
        if (rang > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rang - 3)) *
              Math.pow(10, rang - 3) +
            chiffre * Math.pow(10, rang - 4) +
            (partieEntiere % Math.pow(10, rang - 4))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rang + 1)) *
              Math.pow(10, rang + 1) +
            chiffre * Math.pow(10, rang) +
            (partieDecimale % Math.pow(10, rang))
        }
      } else {
        if (rang > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rang - 2)) *
              Math.pow(10, rang - 2) +
            chiffre * Math.pow(10, rang - 3) +
            (partieEntiere % Math.pow(10, rang - 3))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rang + 1)) *
              Math.pow(10, rang + 1) +
            chiffre * Math.pow(10, rang) +
            (partieDecimale % Math.pow(10, rang))
        }
      }

      nombretemp = !this.sup5
        ? partieEntiere +
          partieDecimale / (this.sup ? Math.pow(10, 4) : Math.pow(10, 3))
        : partieEntiere
      reponsesOK.push(nombretemp)
    }
    const reponsesPasOK = []
    for (let a = 0; a < nbC * nbL; a++) {
      if (this.sup2 === 3) {
        rangbis = randint(rangMin, rangMax, [rang])
      } else if (this.sup2 === 2 && !this.sup5) {
        rangbis = this.sup ? randint(0, 3, [rang]) : randint(0, 2, [rang])
      } else {
        rangbis = this.sup
          ? randint(4, rangMax, [rang])
          : randint(3, rangMax, [rang])
      }
      let partieEntiere = this.sup
        ? randint(1, Math.pow(10, 5))
        : randint(1, Math.pow(10, 4))
      let partieDecimale = this.sup
        ? randint(1, Math.pow(10, 4))
        : randint(1, Math.pow(10, 3))
      if (this.sup) {
        // Au rang attendu, on ne met pas le chiffre attendu.
        if (rang > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rang - 3)) *
              Math.pow(10, rang - 3) +
            randint(0, 9, [chiffre]) * Math.pow(10, rang - 4) +
            (partieEntiere % Math.pow(10, rang - 4))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rang + 1)) *
              Math.pow(10, rang + 1) +
            randint(0, 9, [chiffre]) * Math.pow(10, rang) +
            (partieDecimale % Math.pow(10, rang))
        }
        // Au rang non attendu, on met le chiffre attendu.
        if (rangbis > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rangbis - 3)) *
              Math.pow(10, rangbis - 3) +
            chiffre * Math.pow(10, rangbis - 4) +
            (partieEntiere % Math.pow(10, rangbis - 4))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rangbis + 1)) *
              Math.pow(10, rangbis + 1) +
            chiffre * Math.pow(10, rangbis) +
            (partieDecimale % Math.pow(10, rangbis))
        }
      } else {
        // Au rang attendu, on ne met pas le chiffre attendu.
        if (rang > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rang - 2)) *
              Math.pow(10, rang - 2) +
            randint(0, 9, [chiffre]) * Math.pow(10, rang - 3) +
            (partieEntiere % Math.pow(10, rang - 3))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rang + 1)) *
              Math.pow(10, rang + 1) +
            randint(0, 9, [chiffre]) * Math.pow(10, rang) +
            (partieDecimale % Math.pow(10, rang))
        }
        // Au rang non attendu, on met le chiffre attendu.
        if (rangbis > 3) {
          partieEntiere =
            Math.floor(partieEntiere / Math.pow(10, rangbis - 2)) *
              Math.pow(10, rangbis - 2) +
            chiffre * Math.pow(10, rangbis - 3) +
            (partieEntiere % Math.pow(10, rangbis - 3))
        } else {
          partieDecimale =
            Math.floor(partieDecimale / Math.pow(10, rangbis + 1)) *
              Math.pow(10, rangbis + 1) +
            chiffre * Math.pow(10, rangbis) +
            (partieDecimale % Math.pow(10, rangbis))
        }
      }
      nombretemp = !this.sup5
        ? partieEntiere +
          partieDecimale / (this.sup ? Math.pow(10, 4) : Math.pow(10, 3))
        : partieEntiere
      reponsesPasOK.push(nombretemp)
    }
    // Le tableau de nombre étant fait, on place les objets nombres.
    laby.nombres2d = laby.placeNombres(
      monchemin,
      reponsesOK,
      reponsesPasOK,
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
      2 * 0,
      KeyboardType.clavierNumbers,
      { texteAvant: 'Indiquer le numéro de la bonne sortie :' },
    )
    handleAnswers(this, 2 * 0, {
      reponse: { value: `${nbL - monchemin[monchemin.length - 1][1]}` },
    })
    texte += ajouteChampTexteMathLive(
      this,
      2 * 0 + 1,
      KeyboardType.clavierNumbers,
      { texteAvant: '<br>Combien de nombres rencontrés avant la sortie ?' },
    )
    handleAnswers(this, 2 * 0 + 1, {
      reponse: { value: `${laby.chemin2d.length - 1}` },
    })
    texteCorr = `Voici le chemin en couleur ($${miseEnEvidence(laby.chemin2d.length - 1)}$ nombres rencontrés avant la sortie) et la sortie est le numéro $${miseEnEvidence(nbL - monchemin[monchemin.length - 1][1])}$.<br>`
    texteCorr += mathalea2d(params, laby.murs2d, laby.nombres2d, laby.chemin2d)
    if (context.isAmc) {
      this.autoCorrectionAMC = [
        {
          enonce: texte,
          propositions: [
            {
              texte: '',
              statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
            },
          ],
        },
      ]
      this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
        amcConvert(questionAMC),
      )
    }
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
  }
} // Fin de l'exercice.
