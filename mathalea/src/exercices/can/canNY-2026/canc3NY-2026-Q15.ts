import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un multiple'

export const uuid = 'zpm9t'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class multiple extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : this.quotaChoice('a', [2, 5, 10])
    const annee = 2026

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: `$${texNombre(annee)}$ est-il un multiple de $${a}$ ? `,
      propositions: [
        {
          texte: 'OUI',
          statut: annee % a === 0,
        },
        {
          texte: 'NON',
          statut: annee % a !== 0,
        },
      ],
    }

    const qcm = propositionsQcm(this, 0)
    this.question =
      `$${texNombre(annee)}$ est-il un multiple de $${a}$ ? ` + qcm.texte
    this.canEnonce = `$${texNombre(annee)}$ est-il un multiple de $${a}$ ? `
    this.canReponseACompleter = `OUI ${sp(7)} NON`

    // Correction selon la valeur de a
    if (a === 2) {
      if (annee % 2 === 0) {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$ qui est pair. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("est un multiple")} de $2$.`
      } else {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$ qui n'est pas pair. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("n'est pas un multiple")} de $2$.`
      }
    } else if (a === 3) {
      if (annee % 3 === 0) {
        this.correction = `La somme des chiffres de $${texNombre(annee)}$ est divisible par $3$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("est un multiple")} de $3$.`
      } else {
        this.correction = `La somme des chiffres de $${texNombre(annee)}$ n'est pas divisible par $3$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("n'est pas un multiple")} de $3$.`
      }
    } else if (a === 5) {
      if (annee % 5 === 0) {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("est un multiple")} de $5$.`
      } else {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("n'est pas un multiple")} de $5$.`
      }
    } else if (a === 9) {
      if (annee % 9 === 0) {
        this.correction = `La somme des chiffres de $${texNombre(annee)}$ est divisible par $9$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("est un multiple")} de $9$.`
      } else {
        this.correction = `La somme des chiffres de $${texNombre(annee)}$ n'est pas divisible par $9$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("n'est pas un multiple")} de $9$.`
      }
    } else if (a === 10) {
      if (annee % 10 === 0) {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("est un multiple")} de $10$.`
      } else {
        this.correction = `$${texNombre(annee)}$ a pour chiffre des unités $${annee.toString().charAt(annee.toString().length - 1)}$. <br>
      Donc $${texNombre(annee)}$ ${texteEnCouleurEtGras("n'est pas un multiple")} de $10$.`
      }
    }
  }
}
