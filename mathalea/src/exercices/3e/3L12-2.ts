import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import IdentiteRemarquable from '../../lib/mathFonctions/IdentiteRemarquable'
import MonomePlusieursVariables from '../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../../lib/mathFonctions/PolynomePlusieursVariables'
import { choice, getRandomSubarray } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Factoriser à l'aide de la mise en évidence ou des identités remarquables"
export const interactifReady = true
export const dateDePublication = '10/09/2024'

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = 'c4b73'
export const refs = {
  'fr-fr': ['3L12-2', 'BP2AutoI24'],
  'fr-ch': ['1mCL2-1', '11LSFA3I-5'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser au maximum les expressions suivantes'
        : "Factoriser au maximum l'expression suivante"
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 - Mise en évidence\n2 - Identité remarquable (sans somme-produit)\n3 - Mise en évidence puis identité (sans somme-produit)\n4 - Identité remarquable (somme-produit)\n5 - Mise en évidence puis identité (somme-produit)\n6 - Identité remarquable (somme-produit avec degré > 0)\n7 - Mise en évidence puis identité (somme-produit avec degré > 0)\n8 - Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      "Degré maximum du monôme en évidence ou du monôme de l'identité",
      3,
      '1\n2\n3',
    ]
    this.besoinFormulaire3Numerique = [
      'Degré maximum du facteur restant',
      5,
      '1\n2\n3\n4\n5',
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de variables différentes',
      5,
      '1\n2\n3\n4\n5',
    ]
    this.besoinFormulaire5CaseACocher = [
      'Mélanger les termes dans les identités',
    ]
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 2
    this.sup4 = 2
    this.sup5 = false
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser au maximum les expressions suivantes'
        : "Factoriser au maximum l'expression suivante"

    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte, texteCorr: string
      texte = ''
      texteCorr = ''
      let reponse = ''
      const degreMaxMonomeRestant = this.sup3
      const degreMaxMonomeEvid = Math.min(this.sup3 - 1, this.sup2)
      const variables = ['x', 'y', 'z', 'r', 's', 't']
      const variablesSelect = getRandomSubarray(variables, this.sup4)
      const typeofCoeff = ['entier']
      let p1: PolynomePlusieursVariables
      let p2: PolynomePlusieursVariables
      p1 = PolynomePlusieursVariables.createPolynomeFromMonome(
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: [],
          exposants: [],
        }),
      )
      p2 = PolynomePlusieursVariables.createPolynomeFromMonome(
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: [],
          exposants: [],
        }),
      )
      switch (listeDeQuestions[i]) {
        case 1: {
          do {
            do {
              p1 = PolynomePlusieursVariables.createRandomPolynome(
                0,
                degreMaxMonomeEvid,
                1,
                choice(typeofCoeff),
                variablesSelect,
              )
            } while (p1.toString() === '1')
            do {
              p2 = PolynomePlusieursVariables.createRandomPolynome(
                Math.min(1, degreMaxMonomeRestant),
                degreMaxMonomeRestant,
                randint(2, Math.min(3, degreMaxMonomeRestant) + 1),
                choice(typeofCoeff),
                variablesSelect,
              )
            } while (p2.miseEnFacteurCommun().toString() !== '1')
          } while (p1.contientCarre() || p2.contientCarre())
          texte = `$${lettreDepuisChiffre(i + 1)}=${p1.produit(p2).reduire().toString()}$`
          // check if all the coefficients are negative in which case we need to add a minus sign
          let testAllNeg = true
          let testSomeNeg = false

          for (let j = 0; j < p1.produit(p2).reduire().monomes.length; j++) {
            if (p1.produit(p2).reduire().monomes[j].coefficient.num > 0) {
              testAllNeg = false
              break
            }
          }
          for (let j = 0; j < p1.produit(p2).reduire().monomes.length; j++) {
            if (p1.produit(p2).reduire().monomes[j].coefficient.num < 0) {
              testSomeNeg = true
              break
            }
          }
          const produitReduit = p1.produit(p2).reduire()
          const facteurCommun = produitReduit.miseEnFacteurCommun()
          const facteurCommunOppose = facteurCommun.oppose()
          const polynomeRestant = produitReduit.diviserParMonome(facteurCommun)
          texteCorr = `On met en évidence le plus grand facteur possible, ici $${facteurCommun.toString()}$ ou $${facteurCommunOppose.toString()}$.<br>`
          reponse = testAllNeg
            ? `${facteurCommunOppose.toString()}(${polynomeRestant.oppose().toString()})`
            : `${facteurCommun.toString()}(${polynomeRestant.toString()})`
          if (testAllNeg) {
            texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`${facteurCommunOppose.toString()}(${polynomeRestant.oppose().toString()})`)}$`
          } else if (testSomeNeg) {
            texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`${facteurCommun.toString()}(${polynomeRestant.toString()})`)}$ ou $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`${facteurCommunOppose.toString()}(${polynomeRestant.oppose().toString()})`)}$`
          } else {
            texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`${facteurCommun.toString()}(${polynomeRestant.toString()})`)}$`
          }
          break
        }
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7: {
          let pSP1: MonomePlusieursVariables
          let pSP2: MonomePlusieursVariables
          pSP1 = MonomePlusieursVariables.createRandomMonome(
            0,
            'entier',
            variablesSelect,
          )
          pSP2 = MonomePlusieursVariables.createRandomMonome(
            0,
            'entier',
            variablesSelect,
          )
          let pSP3: MonomePlusieursVariables
          if (
            listeDeQuestions[i] === 3 ||
            listeDeQuestions[i] === 5 ||
            listeDeQuestions[i] === 7
          ) {
            pSP3 = MonomePlusieursVariables.createRandomMonome(
              randint(1, Math.max(1, this.sup2)),
              choice(typeofCoeff),
              variablesSelect,
            )
            pSP3.coefficient = new FractionEtendue(
              choice([-5, -3, -2, -1, 2, 3, 5]),
              1,
            )
          } else {
            pSP3 = MonomePlusieursVariables.createRandomMonome(
              0,
              'entier',
              variablesSelect,
            )
            pSP3.coefficient = new FractionEtendue(1, 1)
          }
          do {
            p1 = PolynomePlusieursVariables.createPolynomeFromMonome(
              MonomePlusieursVariables.createRandomMonome(
                randint(1, Math.max(1, this.sup3)),
                choice(typeofCoeff),
                variablesSelect,
              ),
            )
          } while (p1.contientCarre())
          do {
            p2 = PolynomePlusieursVariables.createPolynomeFromMonome(
              MonomePlusieursVariables.createRandomMonome(
                randint(0, Math.max(1, this.sup3)),
                choice(typeofCoeff),
                variablesSelect,
              ),
            )
          } while (
            p2.somme(p1).miseEnFacteurCommun().toString() !== '1' ||
            p2.monomes[0].estSemblable(p1.monomes[0]) ||
            (p2.monomes[0].estCarre() && p2.monomes[0].toString() !== '1')
          )
          if (listeDeQuestions[i] === 4 || listeDeQuestions[i] === 5) {
            do {
              pSP1 = MonomePlusieursVariables.createRandomMonome(
                0,
                'entier',
                variablesSelect,
              )
              pSP2 = MonomePlusieursVariables.createRandomMonome(
                0,
                'entier',
                variablesSelect,
              )
            } while (
              pSP2.coefficient.num === pSP1.coefficient.num ||
              pSP2.coefficient.num === -pSP1.coefficient.num ||
              pgcd(p1.monomes[0].coefficient.num, pSP1.coefficient.num) !== 1 ||
              pgcd(p1.monomes[0].coefficient.num, pSP2.coefficient.num) !== 1
            )
          } else if (listeDeQuestions[i] === 6 || listeDeQuestions[i] === 7) {
            do {
              do {
                p1 = PolynomePlusieursVariables.createPolynomeFromMonome(
                  MonomePlusieursVariables.createRandomMonome(
                    randint(1, Math.max(1, this.sup3)),
                    choice(typeofCoeff),
                    variablesSelect,
                  ),
                )
              } while (p1.contientCarre())
              pSP1 = MonomePlusieursVariables.createRandomMonome(
                randint(0, Math.min(p1.monomes[0].degre, 2)),
                'entier',
                variablesSelect,
              )
              pSP2 = MonomePlusieursVariables.createMonomeFromPartieLitterale(
                'entier',
                pSP1.partieLitterale,
              )
            } while (
              pSP2.coefficient.num === pSP1.coefficient.num ||
              pSP2.coefficient.num === -pSP1.coefficient.num ||
              pgcd(p1.monomes[0].coefficient.num, pSP1.coefficient.num) !== 1 ||
              pgcd(p1.monomes[0].coefficient.num, pSP2.coefficient.num) !== 1 ||
              p1.somme(pSP1).miseEnFacteurCommun().toString() !== '1'
            )
          }
          // if p1 is negative, take its opposite
          if (p1.monomes[0].coefficient.signe < 0) {
            p1 = p1.oppose()
          }
          if (p2.monomes[0].coefficient.signe < 0) {
            p2 = p2.oppose()
          }
          if (listeDeQuestions[i] === 2 || listeDeQuestions[i] === 3) {
            const j = choice([1, 1, 2, 2, 3])
            const facteurExterieur =
              listeDeQuestions[i] === 3 ? `${pSP3.toString()}\\times ` : ''
            if (j === 1) {
              reponse = `${facteurExterieur}(${p1.toString()}+${p2.toString()})^2`
              texte = `$${lettreDepuisChiffre(i + 1)}=${IdentiteRemarquable.carreDuneSomme(p1, p2).produit(pSP3).melangerTermes(this.sup5).toString()}$`
              if (listeDeQuestions[i] === 3) {
                texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)}&=${miseEnEvidence(pSP3.toString())} \\left(${IdentiteRemarquable.carreDuneSomme(p1, p2).melangerTermes(this.sup5).toString()}\\right) \\text{ ${this.sup5 ? 'on ordonne les termes puis' : ''} on met en évidence}\\\\&=${miseEnEvidence(`${pSP3.toString()} \\left(${p1.toString()}+${p2.toString()}\\right) ^2`)}\\quad \\text{ on factorise avec la première identité}\\end{aligned}$`
              } else if (listeDeQuestions[i] === 2) {
                texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`\\left(${p1.toString()}+${p2.toString()}\\right)^2`)}\\quad \\text{ on factorise avec la première identité}$`
              }
            } else if (j === 2) {
              reponse = `${facteurExterieur}(${p1.toString()}-${p2.toString()})^2`
              texte = `$${lettreDepuisChiffre(i + 1)}=${IdentiteRemarquable.carreDuneDifference(p1, p2).produit(pSP3).melangerTermes(this.sup5).toString()}$`
              if (listeDeQuestions[i] === 3) {
                texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)}&=${miseEnEvidence(pSP3.toString())} \\left(${IdentiteRemarquable.carreDuneDifference(p1, p2).melangerTermes(this.sup5).toString()}\\right) \\text{ ${this.sup5 ? 'on ordonne les termes puis' : ''} on met en évidence}\\\\&=${miseEnEvidence(`${pSP3.toString()} \\left(${p1.toString()}-${p2.toString()}\\right) ^2`)}\\quad \\text{ on factorise avec la deuxième identité}\\end{aligned}$`
              } else if (listeDeQuestions[i] === 2) {
                texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`\\left(${p1.toString()}-${p2.toString()}\\right)^2`)}\\quad \\text{ on factorise avec la deuxième identité}$`
              }
            } else if (j === 3) {
              const signe = ['+', '-']
              const choixSigne = randint(0, 1)
              reponse = `${facteurExterieur}(${p1.toString()}+${p2.toString()})(${p1.toString()}-${p2.toString()})`
              texte = `$${lettreDepuisChiffre(i + 1)}=${IdentiteRemarquable.differenceDeDeuxCarres(p1, p2).produit(pSP3).melangerTermes(this.sup5).toString()}$`
              if (listeDeQuestions[i] === 3) {
                texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)}&=${miseEnEvidence(pSP3.toString())} \\left(${IdentiteRemarquable.differenceDeDeuxCarres(p1, p2).melangerTermes(this.sup5).toString()}\\right) \\quad \\text{ ${this.sup5 ? 'on ordonne les termes puis' : ''} on met en évidence}\\\\&=${miseEnEvidence(`${pSP3.toString()} \\left(${p1.toString()}${signe[choixSigne]} ${p2.toString()}\\right)  \\left(${p1.toString()}${signe[(choixSigne + 1) % 2]}${p2.toString()}\\right) `)}\\quad \\text{ on factorise avec la troisième identité}\\end{aligned}$`
              } else if (listeDeQuestions[i] === 2) {
                texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`\\left(${p1.toString()}${signe[choixSigne]} ${p2.toString()}\\right)\\left(${p1.toString()}${signe[(choixSigne + 1) % 2]}${p2.toString()}\\right)`)}\\quad \\text{ on factorise avec la troisième identité}$`
              }
            }
          }
          if (
            listeDeQuestions[i] === 4 ||
            listeDeQuestions[i] === 5 ||
            listeDeQuestions[i] === 6 ||
            listeDeQuestions[i] === 7
          ) {
            const signeT1 = pSP1.coefficient.signe < 0 ? '' : '+'
            const signeT2 = pSP2.coefficient.signe < 0 ? '' : '+'
            const facteurExterieur =
              listeDeQuestions[i] === 5 || listeDeQuestions[i] === 7
                ? `${pSP3.toString()}\\times `
                : ''
            reponse = `${facteurExterieur}(${p1.toString()}${signeT1}${pSP1.toString()})(${p1.toString()}${signeT2}${pSP2.toString()})`
            texte = `$${lettreDepuisChiffre(i + 1)}=${IdentiteRemarquable.sommeProduit(p1, pSP1, pSP2).produit(pSP3).melangerTermes(this.sup5).toString()}$`
            if (listeDeQuestions[i] === 5 || listeDeQuestions[i] === 7) {
              texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)}&=${miseEnEvidence(pSP3.toString())} \\left(${IdentiteRemarquable.sommeProduit(p1, pSP1, pSP2).melangerTermes(this.sup5).toString()}\\right) \\quad \\text{ ${this.sup5 ? 'on ordonne les termes puis' : ''} on met en évidence}\\\\&=${miseEnEvidence(`${pSP3.toString()} \\left(${p1.toString()}${signeT1}${pSP1.toString()}\\right)  \\left(${p1.toString()}${signeT2}${pSP2.toString()}\\right) `)}\\quad \\text{ on factorise avec la quatrième identité}\\end{aligned}$`
            } else if (listeDeQuestions[i] === 4 || listeDeQuestions[i] === 6) {
              texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(`\\left(${p1.toString()}${signeT1}${pSP1.toString()}\\right)\\left(${p1.toString()}${signeT2}${pSP2.toString()}\\right)`)}\\quad \\text{ on factorise avec la quatrième identité}$`
            }
          }
          break
        }
      }
      if (
        this.questionJamaisPosee(
          i,
          p1.monomes[0].coefficient.num.toString() +
            p2.monomes[0].coefficient.num.toString(),
        )
      ) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { exclusifFactorisation: true },
          },
        })
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecVariable,
            { texteAvant: ' $=$' },
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
