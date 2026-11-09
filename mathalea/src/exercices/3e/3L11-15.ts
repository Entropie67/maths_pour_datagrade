import IdentiteRemarquable from '../../lib/mathFonctions/IdentiteRemarquable'
import MonomePlusieursVariables from '../../lib/mathFonctions/MonomePlusieursVariables'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  getRandomSubarray,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '04/09/2024'

/**
 * Développer une identité remarquable
 * @author Nathan Scheinmann
 * Éric Elter a modifié le code pour qu'il soit exploitable en France le 09/08/2025 (omission de le 4ème IR)
 */

export const uuid = '6e472'
export const refs = {
  // Exo pour la Suisse à cause de la 4ème identité remarquable.
  'fr-fr': [],
  'fr-ch': ['1mCL1-7', '11LSFA3G-5'],
}

export default class developperIdentiteRemarquable extends Exercice {
  pays: string
  lettresVariablesImposees?: string[]
  constructor() {
    super()
    this.pays = 'Suisse'
    this.consigne =
      'Développer et réduire en utilisant les identités remarquables.'

    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : (x+a)^2\n2 : (x-a)^2\n3 : (x-a)(x-b)\n4 : (x+a)(x+b)\n5 : (ax+by)^2\n6 : (ax-by)^2\n7 : (ax+by)(ax-by)\n8 : (ax+b)(ax+c)\n9 - Mélange',
    ]

    this.besoinFormulaire2Numerique = [
      'Coefficients',
      3,
      'Entiers \n2 : Fractionnaires \n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = ['Degré maximum', 5, '1\n2\n3\n4\n5']
    this.besoinFormulaire4Numerique = [
      'Nombre de variables différentes',
      5,
      '1\n2\n3\n4\n5',
    ]
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 9
    this.sup2 = 1
    this.sup3 = 2
    this.sup4 = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      'Développer et réduire en utilisant les identités remarquables.'

    let listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    if (this.pays === 'France') {
      listeDeQuestions = listeDeQuestions.filter((q) => q !== 4 && q !== 8)

      if (listeDeQuestions.length === 0) {
        listeDeQuestions.push(randint(1, 7, [4]))
      }
      listeDeQuestions = combinaisonListes(listeDeQuestions, this.nbQuestions)
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      const degMax = Math.max(this.sup3, 0)
      const variables = ['x', 'y', 'z', 'r', 's', 't']
      // Le tirage reste effectué, même avec une variable imposée, pour ne pas
      // modifier la suite des tirages des exercices déjà publiés.
      const variablesTirees = getRandomSubarray(
        variables,
        this.lettresVariablesImposees ? Math.max(this.sup4, 2) : this.sup4,
      )
      // Avec des lettres imposées (ex. x en France), elles sont conservées en
      // premier puis complétées par le tirage jusqu'au nombre demandé.
      const variablesSelect = this.lettresVariablesImposees
        ? [
            ...this.lettresVariablesImposees,
            ...variablesTirees.filter(
              (v) => !this.lettresVariablesImposees?.includes(v),
            ),
          ].slice(0, Math.max(this.sup4, this.lettresVariablesImposees.length))
        : variablesTirees
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let p1: MonomePlusieursVariables
      let p2: MonomePlusieursVariables
      let pSP1: MonomePlusieursVariables
      let pSP2: MonomePlusieursVariables
      p1 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: [],
        exposants: [],
      })
      p2 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: [],
        exposants: [],
      })
      pSP1 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: [],
        exposants: [],
      })
      pSP2 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: [],
        exposants: [],
      })
      if (this.sup2 === 1) {
        typeofCoeff = ['entier']
      } else if (this.sup2 === 2) {
        typeofCoeff = ['fraction']
      } else {
        typeofCoeff = typeCoeffListe
      }
      if (
        listeDeQuestions[i] === 1 ||
        listeDeQuestions[i] === 2 ||
        listeDeQuestions[i] === 3 ||
        listeDeQuestions[i] === 4
      ) {
        p1 = MonomePlusieursVariables.createRandomMonome(
          degMax,
          choice(typeofCoeff),
          variablesSelect,
        )
        p2 = MonomePlusieursVariables.createRandomMonome(
          0,
          choice(typeofCoeff),
          variablesSelect,
        )
        pSP1 = MonomePlusieursVariables.createRandomMonome(
          0,
          'entier',
          variablesSelect,
        )
        do {
          pSP2 = MonomePlusieursVariables.createRandomMonome(
            0,
            'entier',
            variablesSelect,
          )
        } while (pSP2 === pSP1 || pSP2.oppose() === pSP1)
        p1.coefficient = new FractionEtendue(1, 1)
        if (p2.coefficient.signe < 0) {
          p2 = p2.oppose()
        }
      }
      if (
        listeDeQuestions[i] === 5 ||
        listeDeQuestions[i] === 6 ||
        listeDeQuestions[i] === 7 ||
        listeDeQuestions[i] === 8
      ) {
        p1 = MonomePlusieursVariables.createRandomMonome(
          randint(0, Math.max(1, degMax)),
          choice(typeofCoeff),
          variablesSelect,
        )
        do {
          p2 = MonomePlusieursVariables.createRandomMonome(
            randint(0, Math.max(1, degMax)),
            choice(typeofCoeff),
            variablesSelect,
          )
        } while (p2.estSemblable(p1))
        pSP1 = MonomePlusieursVariables.createRandomMonome(
          0,
          'entier',
          variablesSelect,
        )
        do {
          pSP2 = MonomePlusieursVariables.createRandomMonome(
            0,
            'entier',
            variablesSelect,
          )
        } while (
          pSP2.coefficient.num === pSP1.coefficient.num ||
          pSP2.coefficient.num === -pSP1.coefficient.num
        )
        // if p1 is negative, take its opposite
        if (p1.coefficient.signe < 0) {
          p1 = p1.oppose()
        }
        if (p2.coefficient.signe < 0) {
          p2 = p2.oppose()
        }
      }
      switch (listeDeQuestions[i]) {
        case 1:
        case 5: {
          reponse = IdentiteRemarquable.carreDuneSomme(p1, p2).toString()
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}+${p2.toString()}\\right)^2$`
          if (listeDeQuestions[i] === 1) {
            texteCorr =
              "L'expression à développer correspond à la première identité remarquable $\\left(a+b\\right)^2=a^2+2ab+b^2$.<br>"
          } else {
            texteCorr =
              "L'expression à développer correspond à la première identité remarquable $\\left(ax+b\\right)^2=a^2x^2+2abx+b^2$.<br>"
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          break
        }
        case 2:
        case 6: {
          reponse = IdentiteRemarquable.carreDuneDifference(p1, p2).toString()
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}-${p2.toString()}\\right)^2$`
          if (listeDeQuestions[i] === 2) {
            texteCorr =
              "L'expression à développer correspond à la deuxième identité remarquable $\\left(a-b\\right)^2=a^2-2ab+b^2$.<br>"
          } else {
            texteCorr =
              "L'expression à développer correspond à la deuxième identité remarquable $\\left(ax-b\\right)^2=a^2x^2-2abx+b^2$.<br>"
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          break
        }
        case 3:
        case 7: {
          reponse = IdentiteRemarquable.differenceDeDeuxCarres(
            p1,
            p2,
          ).toString()
          const signe = ['+', '-']
          const choixSigne = randint(0, 1)
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}${signe[choixSigne]} ${p2.toString()}\\right)\\left(${p1.toString()}${signe[(choixSigne + 1) % 2]}${p2.toString()}\\right)$`
          if (listeDeQuestions[i] === 3) {
            texteCorr =
              "L'expression à développer correspond à la troisième identité remarquable $\\left(a-b\\right)(a+b)=a^2-b^2$.<br>"
          } else {
            texteCorr =
              "L'expression à développer correspond à la troisième identité remarquable $\\left(ax-b\\right)(ax+b)=a^2x^2-b^2$.<br>"
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          break
        }
        case 4:
        case 8: {
          reponse = IdentiteRemarquable.sommeProduit(p1, pSP1, pSP2).toString()
          const signeT1 = pSP1.coefficient.signe < 0 ? '' : '+'
          const signeT2 = pSP2.coefficient.signe < 0 ? '' : '+'
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}${signeT1}${pSP1.toString()}\\right)\\left(${p1.toString()}${signeT2}${pSP2.toString()}\\right)$`
          if (listeDeQuestions[i] === 1) {
            texteCorr =
              "L'expression à développer correspond à la quatrième identité remarquable $\\left(x+a\\right)(x+b)=x^2+(a+b)x+ab$ avec ${}<br>"
          } else {
            texteCorr =
              "L'expression à développer correspond à la quatrième identité remarquable $\\left(ax+b\\right)(ax+c)=a^2x^2+(b+c)ax+cb$.<br>"
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(reponse)}$`
          break
        }
      }
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecVariable,
          { texteAvant: ' $=$ ' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { expressionsForcementReduites: true },
          },
        })
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
