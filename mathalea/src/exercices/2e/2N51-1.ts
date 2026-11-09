import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { abs } from '../../lib/outils/nombres'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Connaitre les propriétés calculatoires des racines carrées'
export const interactifReady = true

export const dateDeModifImportante = '13/12/2023'
/**
 * 2N32-2, ex 2N10-1
 * @author Stéphane Guyon modif Gilles Mora
 */
export const uuid = '99b29'

export const refs = {
  'fr-fr': ['2N51-1'],
  'fr-ch': ['1mCN-7', '11LSNO3C-2'],
}
export default class Proprietesracinecarree extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 2
    this.nbCols = 2

    this.sup = 1 //
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? `Indiquer l'écriture simplifiée ${this.nbQuestions === 1 ? 'du calcul suivant.' : 'des calculs suivants.'}`
      : `Donner, si possible, une écriture simplifiée ${this.nbQuestions === 1 ? 'du calcul suivant.' : 'des calculs suivants.'}`
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7]
    let typesDeQuestions //,
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let e = 0
      let texte = ''
      let texteCorr = ''
      let monQcm: { texte: string; texteCorr: string }
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1: // calcul de (a sqrt b)²
          a = randint(2, 9) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          c = a * a * b
          d = a * a
          texte = `$\\left(${a} \\sqrt{${b}}\\right)^{2}$`
          texteCorr = `$\\left(${a} \\sqrt{${b}}\\right)^{2}=${ecritureParentheseSiNegatif(a)}^{2}\\times \\left(\\sqrt{${b}}\\right)^{2}$
                        $\\phantom{\\left(${a} \\sqrt{${b}}\\right)^{2}}$<br>
                        $\\phantom{\\left(${a} \\sqrt{${b}}\\right)^{2}}=${d}\\times ${b}$<br>
                        $\\phantom{\\left(${a} \\sqrt{${b}}\\right)^{2}}=${miseEnEvidence(c)}$`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$${c}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$${a ** 2} \\sqrt{${b}}$`,
                statut: false,
              },
              {
                texte: `$${abs(a) * b} $`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 2: // calcul de (a sqrt b)*c sqrt b
          a = randint(2, 9) * choice([-1, 1])
          c = randint(2, 9) * choice([-1, 1])
          d = randint(2, 9) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          e = c * d

          texte = `$${c} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(d)}\\sqrt{${b}}$`
          texteCorr = `$ ${c} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(d)} \\sqrt{${b}}=${c}\\times ${ecritureParentheseSiNegatif(d)} \\sqrt{${b}} \\times \\sqrt{${b}}$<br>
                        $\\phantom{${c} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(d)} \\sqrt{${b}}}=${e}\\times ${b}$<br>
                        $\\phantom{${c} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(d)} \\sqrt{${b}}}=${miseEnEvidence(e * b)}$`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$${e * b}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$${e} \\sqrt{${b}}$`,
                statut: false,
              },
              {
                texte: `$${-e} \\sqrt{${b}}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 3: //  calcul de (a sqrt b)*(c + d sqrt b)
          a = randint(2, 9) * choice([-1, 1])
          c = randint(3, 9) * choice([-1, 1])
          d = randint(2, 9) * choice([-1, 1])
          b = randint(2, 11, [4, 8, 9])
          e = c * d

          texte = `$ ${a} \\sqrt{${b}}\\left( ${c}  ${ecritureAlgebrique(d)}\\sqrt{${b}}\\right)$`
          texteCorr = `$${a} \\sqrt{${b}}\\left( ${c}  ${ecritureAlgebrique(d)}\\sqrt{${b}}\\right)=
                        ${a} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(a)} \\sqrt{${b}}\\times ${ecritureParentheseSiNegatif(d)}\\sqrt{${b}}$<br>
                        $\\phantom{${a} \\sqrt{${b}}\\left( ${c}  ${ecritureAlgebrique(d)}\\sqrt{${b}}\\right)}=${a * c}\\sqrt{${b}}${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(d)}\\times ${b}$<br>
                        $\\phantom{${a} \\sqrt{${b}}\\left( ${c}  ${ecritureAlgebrique(d)}\\sqrt{${b}}\\right)}=${miseEnEvidence(`${a * c}\\sqrt{${b}}${ecritureAlgebrique(a * d * b)}`)}$`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$${a * c}\\sqrt{${b}}${ecritureAlgebrique(a * d * b)}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$${a * c}\\sqrt{${b}}${ecritureAlgebrique(-a * d * b)}$`,
                statut: false,
              },
              {
                texte: `$${rienSi1(a + c)}\\sqrt{${b}}${ecritureAlgebrique(a * d * b)}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 4: //  calcul de sqrt b + sqrt c
          a = randint(2, 9)

          d = randint(2, 9)
          b = randint(2, 11, [4, 8, 9])
          c = randint(2, 19, [4, 8, 9, 12, 16, 18, b])
          e = c * d

          texte = `$\\sqrt{${b}}+\\sqrt{${c}}$`
          texteCorr = `$  \\sqrt{${b}}+\\sqrt{${c}}$ n'est pas simplifiable : ${texteEnCouleurEtGras('On ne peut pas simplifier')}`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$\\sqrt{${b + c}}$`,
                statut: false,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: true,
              },
              {
                texte: `$\\sqrt{${b * c}}$`,
                statut: false,
              },
              {
                texte: `$${b + c}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 5: //  calcul de  sqrt b² + sqrt c²
          b = randint(2, 11)
          c = randint(2, 11, [b])
          e = c * d

          texte = `$  \\sqrt{${b * b}}+\\sqrt{${c * c}}$`
          texteCorr = `$  \\sqrt{${b * b}}+\\sqrt{${c * c}}=${b}+${c}=${miseEnEvidence(b + c)}$ `
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$\\sqrt{${b + c}}$`,
                statut: false,
              },
              {
                texte: `$${b + c}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$\\sqrt{${b * b + c * c}}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 6: //  calcul de  sqrt (b²c/c)
          b = randint(2, 11)
          c = randint(2, 7, [b])
          d = b * b * c

          texte = `$ \\sqrt{\\dfrac{${d}}{${c}}}$`
          texteCorr = `$ \\sqrt{\\dfrac{${d}}{${c}}}= \\sqrt{\\dfrac{${b}^{2}\\times${c}}{${c}}}$<br>
                        $\\phantom{\\sqrt{\\dfrac{${d}}{${c}}}}=\\sqrt{${b}^{2}}$<br>
                        $\\phantom{\\sqrt{\\dfrac{${d}}{${c}}}}=${miseEnEvidence(b)}$ `
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$\\sqrt{${b}}$`,
                statut: false,
              },
              {
                texte: `$${b}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$${b ** 2}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
        case 7: //  calcul de sqrt b * sqrt c
          b = randint(2, 11, [4, 9])
          c = randint(2, 10, [4, 9])
          d = b * c
          while (
            d === 4 ||
            d === 9 ||
            d === 16 ||
            d === 25 ||
            d === 36 ||
            d === 49 ||
            d === 64 ||
            d === 81 ||
            d === 100
          ) {
            b = randint(2, 11, [4, 9])
            c = randint(2, 10, [b])
            d = b * c
          }
          texte = `$ \\sqrt{${d}}\\times \\sqrt{${c}}$`
          texteCorr = `$ \\sqrt{${d}}\\times \\sqrt{${c}}=\\sqrt{${d}\\times${c}}$<br>
                        $\\phantom{\\sqrt{${d}}\\times \\sqrt{${c}}}=\\sqrt{${b}\\times${c}\\times${c}}$<br>
                        $\\phantom{\\sqrt{${d}}\\times \\sqrt{${c}}}=${miseEnEvidence(`${c}\\sqrt{${b}}`)}$ `
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$${c * b}$`,
                statut: false,
              },
              {
                texte: `$${c}\\sqrt{${b}}$`,
                statut: true,
              },
              {
                texte: 'On ne peut pas simplifier',
                statut: false,
              },
              {
                texte: `$${b}\\sqrt{${c}}$`,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
