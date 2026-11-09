import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { texteEnCouleur, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Vérifier si un nombre est solution d’une inéquation (V/F)'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication 24/10/2021
*/
export const uuid = 'e7754'

export const refs = {
  'fr-fr': ['can3L1-04', '2L30-flash1'],
  'fr-ch': [],
}
export default class SolutionInequation extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, b, c, d
    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        choice(['a', 'b', 'c']) //
      ) {
        case 'a':
          a = randint(1, 4)
          b = randint(1, 4)
          c = randint(2, 5)
          d = randint(-3, 3)
          texte = `$${d}$ est solution de l'inéquation ${sp(2)} $${rienSi1(a)}x+${b}>${c}$.<br>`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a * d + b > c,
              },
              {
                texte: 'Faux',
                statut: a * d + b <= c,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          if (a * d + b > c) {
            if (a === 1) {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("est solution")} car : $${ecritureParentheseSiNegatif(d)}+${b}=${d + b}$ et $${d + b}>${c}$.`
            } else {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("est solution")} car : $${a}\\times ${ecritureParentheseSiNegatif(d)}+${b}=${a * d + b}$ et $${a * d + b}>${c}$.`
            }
          } else {
            if (a === 1) {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("n'est pas solution")} car : $ ${ecritureParentheseSiNegatif(d)}+${b}=${d + b}$ et $${d + b}\\leqslant${c}$.`
            } else {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("n'est pas solution")} car : $${a}\\times ${ecritureParentheseSiNegatif(d)}+${b}=${a * d + b}$ et $${a * d + b}\\leqslant${c}$.`
            }
          }

          break
        case 'b':
          a = randint(1, 4)
          b = randint(1, 4)
          c = randint(2, 5)
          d = randint(-3, 3)
          texte = `$${d}$ est solution de l'inéquation ${sp(2)} $${rienSi1(a)}x^2-${b}>${c}$.<br>`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: a * d * d - b > c,
              },
              {
                texte: 'Faux',
                statut: a * d * d - b <= c,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          if (a * d * d - b > c) {
            if (a === 1) {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("est solution")} car : $ ${ecritureParentheseSiNegatif(d)}^2-${b}=${d ** 2 - b}$ et $${d ** 2 - b}>${c}$.`
            } else {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("est solution")} car : $${a}\\times${ecritureParentheseSiNegatif(d)}^2-${b}=${a * d ** 2 - b}$ et $${a * d ** 2 - b}>${c}$.`
            }
          } else {
            if (a === 1) {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("n'est pas solution")} car : $ ${ecritureParentheseSiNegatif(d)}^2-${b}=${d ** 2 - b}$ et $${d ** 2 - b}\\leqslant${c}$.`
            } else {
              texteCorr =
                monQcm.texteCorr +
                `$${d}$ ${texteEnCouleurEtGras("n'est pas solution")} car : $${a}\\times${ecritureParentheseSiNegatif(d)}^2-${b}=${a * d ** 2 - b}$ et $${a * d ** 2 - b}\\leqslant${c}$.`
            }
          }
          break
        case 'c':
        default:
          a = randint(2, 5)
          b = randint(-2, 4, 0)
          c = 0 // c'est pour questionJamaisPosee
          d = randint(-2, 5)
          texte = `$${d}$ est solution de l'inéquation ${sp(2)} $x^2\\leqslant ${a}x${ecritureAlgebrique(b)}$.<br>`
          this.canEnonce = texte
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: d ** 2 <= a * d + b,
              },
              {
                texte: 'Faux',
                statut: d ** 2 > a * d + b,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
          if (d ** 2 <= a * d + b) {
            texteCorr =
              monQcm.texteCorr +
              `$${d}$ ${texteEnCouleurEtGras("est solution")} car : $${d ** 2}\\leqslant${a * d + b}$<br>
          `
            texteCorr += texteEnCouleur(` Mentalement : <br>
          Faites deux calculs séparés puis comparez les résultats :<br>
          $\\bullet$ $${ecritureParentheseSiNegatif(d)}^2=${d ** 2}$.<br>
          $\\bullet$ $${a}\\times ${ecritureParentheseSiNegatif(d)}${ecritureAlgebrique(b)}=${a * d + b}$.<br>
          et $${d ** 2}$ est inférieur ou égal à $${a * d + b}$.
            `)
          } else {
            texteCorr =
              monQcm.texteCorr +
              `$${d}$ ${texteEnCouleurEtGras("n'est pas solution")} car : $${d ** 2}>${a * d + b}$<br>
         `
            texteCorr += texteEnCouleur(` Mentalement : <br>
          Faites deux calculs séparés puis comparez les résultats :<br>
          $\\bullet$ $${ecritureParentheseSiNegatif(d)}^2=${d ** 2}$.<br>
          $\\bullet$ $${a}\\times ${ecritureParentheseSiNegatif(d)}${ecritureAlgebrique(b)}=${a * d + b}$.<br>
          et $${d ** 2}$ n'est pas inférieur ou égal à $${a * d + b}$.
            `)
          }

          break
      }
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
