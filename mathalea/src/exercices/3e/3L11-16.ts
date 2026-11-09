import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import IdentiteRemarquable from '../../lib/mathFonctions/IdentiteRemarquable'
import MonomePlusieursVariables from '../../lib/mathFonctions/MonomePlusieursVariables'
import { choice, getRandomSubarray } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Compléter une identité remarquable à trou'
export const dateDePublication = '11/09/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = '7f0cf'
export const refs = {
  'fr-fr': ['3L11-16'],
  'fr-ch': ['1mCL1-8', '11LSFA3I-1'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Compléter le terme manquant afin d'obtenir une identité remarquable. Écrire ensuite l'identité remarquable correspondante factorisée."
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 - (x+a)^2\n2 - (x-a)^2\n3 - (ax+b)^2\n4 - (ax-b)^2\n5 - Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Coefficients',
      3,
      'Entiers \n2 : Fractionnaires \n3 : Mélange',
    ]
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.besoinFormulaire3CaseACocher = ["N'utiliser que $x$ comme variable"]
    this.sup = 5
    this.sup2 = 1
    this.sup3 = false
    this.listeAvecNumerotation = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne =
      "Compléter le terme manquant avec un monôme ayant un coefficient positif afin d'obtenir une identité remarquable. Écrire ensuite l'identité remarquable correspondante factorisée."

    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const coeffMax = 12
      const variables = this.sup3 ? ['x'] : ['x', 'y', 'z', 'r', 's', 't']
      const variablesSelect = getRandomSubarray(variables, 1)
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let p1: MonomePlusieursVariables
      let p2: MonomePlusieursVariables
      p1 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: [],
        exposants: [],
      })
      p2 = new MonomePlusieursVariables(new FractionEtendue(1, 1), {
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
      p1 = MonomePlusieursVariables.createRandomMonome(
        1,
        choice(typeofCoeff),
        variablesSelect,
        coeffMax,
      )
      p2 = MonomePlusieursVariables.createRandomMonome(
        0,
        choice(typeofCoeff),
        variablesSelect,
        coeffMax,
      )
      if (listeDeQuestions[i] === 1 || listeDeQuestions[i] === 2) {
        p1.coefficient = new FractionEtendue(1, 1)
      }
      if (p1.coefficient.signe < 0) {
        p1 = p1.oppose()
      }
      if (p2.coefficient.signe < 0) {
        p2 = p2.oppose()
      }
      const termeCentral = p1
        .produit(p2)
        .produit(
          new MonomePlusieursVariables(new FractionEtendue(2, 1), {
            variables: ['x'],
            exposants: [0],
          }),
        )
      if (this.correctionDetaillee) {
        texteCorr = `Les deux termes présents dans l'expression sont des carrés parfaits. On détermine les monômes qui au carré donnent ces termes.<br> On obtient un premier terme qui vaut $${p1.toString()}$ et un second terme qui vaut $${p2.toString()}$.<br>Le terme manquant est donc $2\\times ${p1.toString()}\\times ${p2.toString()}=${termeCentral.toString()}$. Le signe nous permet de savoir s'il s'agit de la première ou de la deuxième identité remarquable.<br>`
      }
      switch (listeDeQuestions[i]) {
        case 1:
        case 3: {
          const expr = IdentiteRemarquable.carreDuneSomme(p1, p2).ordonner()
          const identite = `\\left(${p1.toString()}+${p2.toString()}\\right)^2`
          const exprAvecTrou = expr
            .toStringSansLeTerme(1)
            .replace('\\ldots\\ldots', '%{champ1}')
          texte = remplisLesBlancs(
            this,
            i,
            `${lettreDepuisChiffre(i + 1)}=${exprAvecTrou}\\,=\\,%{champ2}`,
            KeyboardType.clavierDeBaseAvecVariable,
            '\\ldots\\ldots',
          )
          // si deux carrés facile
          // si un seul carré, alors on calcule la racine et on s'il divise le terme restant, si oui, alors première identité autrement, la quatrième
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${expr.toStringAvecTermeEnEvidence(1)}=${miseEnEvidence(identite)}$`
          handleAnswers(
            this,
            i,
            {
              champ1: { value: termeCentral.toString() },
              champ2: { value: identite, options: { factorisation: true } },
            },
            { formatInteractif: 'fill-in-the-blank' },
          )
          break
        }
        case 2:
        case 4: {
          const expr = IdentiteRemarquable.carreDuneDifference(
            p1,
            p2,
          ).ordonner()
          const identite = `\\left(${p1.toString()}-${p2.toString()}\\right)^2`
          const exprAvecTrou = expr
            .toStringSansLeTerme(1)
            .replace('\\ldots\\ldots', '%{champ1}')
          texte = remplisLesBlancs(
            this,
            i,
            `${lettreDepuisChiffre(i + 1)}=${exprAvecTrou}\\,=\\,%{champ2}`,
            KeyboardType.clavierDeBaseAvecVariable,
            '\\ldots\\ldots',
          )
          // idem que pour la 1re
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=${expr.toStringAvecTermeEnEvidence(1)}=${miseEnEvidence(identite)}$`
          handleAnswers(
            this,
            i,
            {
              champ1: { value: termeCentral.toString() },
              champ2: { value: identite, options: { factorisation: true } },
            },
            { formatInteractif: 'fill-in-the-blank' },
          )
          break
        }
        /* Cas suisse pas pris en compte pour l'instant 
        case 3:
        case 6: {
          const signeT1 = pSP1.coefficient.signe < 0 ? '' : '+'
          const signeT2 = pSP2.coefficient.signe < 0 ? '' : '+'
          const expr = IdentiteRemarquable.sommeProduit(
            p1,
            pSP1,
            pSP2,
          ).melangerTermes(true)
          texte = `$${lettreDepuisChiffre(i + 1)}=${expr.toStringSansLeDernierTerme()}\\,=\\,\\ldots\\ldots$`
          // si un seul carré et que la racine ne divise pas le terme restant, alors la quatrième
          // si aucun carré, alors la quatrième
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${expr.toStringAvecDernierTermeEnEvidence()}=${miseEnEvidence(`\\left(${p1.toString()}${signeT1}${pSP1.toString()}\\right)\\left(${p1.toString()}${signeT2}${pSP2.toString()}\\right)`)}$`
          break
        } */
      }
      if (
        this.questionJamaisPosee(
          i,
          p1.coefficient,
          p2.coefficient,
          listeDeQuestions[i],
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
