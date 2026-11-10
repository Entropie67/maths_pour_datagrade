import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { touchesDeLaReponse } from '../../lib/interactif/claviers/touchesDeLaReponse'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import MonomePlusieursVariables from '../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../../lib/mathFonctions/PolynomePlusieursVariables'
import {
  choice,
  getRandomSubarray,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Factoriser à l'aide des groupements"
export const dateDePublication = '22/09/2024'
export const dateDeModifImportante = '03/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 * Il reste encore à faire attention aux identités remarquables
 */

export const uuid = '9965d'
export const refs = {
  'fr-fr': ['3L12-3', 'BP2AutoI25'],
  'fr-ch': ['1mCL2-2', '11LSFA3H-5'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1- Groupement non développé sans monôme semblable\n2- Groupement non développé avec monômes semblables\n3- Groupement non développé avec changement de signe dans le groupement\n4- Groupement développé termes non mélangés\n5- Groupement développé termes mélangés\n6- Groupement non développé sans monôme semblable avec mise en évidence supplémentaire\n7- Groupement non développé avec monômes semblables avec mise en évidence supplémentaire\n8- Groupement non développé avec changement de signe dans le groupement avec mise en évidence supplémentaire\n9- Groupement développé termes non mélangés avec mise en évidence supplémentaire\n10- Groupement développé termes mélangés avec mise en évidence supplémentaire\n11- Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Degré maximum du monôme en évidence',
      3,
      '2\n3\n4',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de termes du groupement (>1)',
      2,
      '2\n3',
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de variables différentes',
      4,
      '1\n2\n3\n4',
    ]
    this.besoinFormulaire5Numerique = [
      'Nombre de termes à factoriser',
      3,
      '2\n3\n4',
    ]
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = 1
    this.sup5 = 1
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
      max: 10,
      melange: 11,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    function imprimerExpr(
      g: PolynomePlusieursVariables,
      listeP: MonomePlusieursVariables[],
      ordreG: string[],
      signeG: number[],
      developpe: boolean,
      melange: boolean,
    ): string {
      let expression = ''
      if (developpe) {
        let polyFinale: PolynomePlusieursVariables
        polyFinale = PolynomePlusieursVariables.PolynomeNonReduit([
          listeP[0],
        ]).produit(signeG[0] === -1 ? g.oppose() : g)
        for (let j = 1; j < listeP.length; j++) {
          polyFinale = polyFinale.somme(
            PolynomePlusieursVariables.PolynomeNonReduit([listeP[j]]).produit(
              signeG[j] === -1 ? g.oppose() : g,
            ),
          )
        }
        if (melange) {
          polyFinale = polyFinale.melangerTermes(true)
        }
        expression += polyFinale.toString()
      } else {
        if (ordreG[0] === 'avant') {
          expression += `(${(signeG[0] === -1 ? g.oppose().toString() : g.toString()) + ')' + listeP[0].toStringAvecParentheses()}`
        } else {
          expression += `${listeP[0].toString() + '(' + (signeG[0] === -1 ? g.oppose().toString() : g.toString())})`
        }
        for (let j = 1; j < listeP.length; j++) {
          if (ordreG[j] === 'avant') {
            expression += `+(${(signeG[j] === -1 ? g.oppose().toString() : g.toString()) + ')' + listeP[j].toStringAvecParentheses()}`
          } else {
            expression += `${listeP[j].toStringAvecSigne() + '(' + (signeG[j] === -1 ? g.oppose().toString() : g.toString())})`
          }
        }
      }
      return expression
    }

    // Expression factorisée de la dernière ligne de la correction : c'est la réponse attendue
    function derniereExpression(input: string): string {
      const lines: string[] = input.split('\\\\')
      const lastLine: string = lines[lines.length - 2]
      return lastLine
        .substring(lastLine.lastIndexOf('=') + 1, lastLine.lastIndexOf('&&'))
        .trim()
    }

    function transformEquation(input: string): string {
      // Split the input into an array of lines
      const lines: string[] = input.split('\\\\')

      // Process the last line
      const lastLineIndex: number = lines.length - 2
      const lastLine: string = lines[lastLineIndex]

      // Find the last occurrence of = and &&
      const lastEqualIndex: number = lastLine.lastIndexOf('=')
      const lastAndIndex: number = lastLine.lastIndexOf('&&')

      if (lastEqualIndex !== -1 && lastAndIndex !== -1) {
        const beforeEqual: string = lastLine.substring(0, lastEqualIndex + 1)
        const betweenEqualAnd: string = lastLine
          .substring(lastEqualIndex + 1, lastAndIndex)
          .trim()
        const afterAnd: string = lastLine.substring(lastAndIndex)
        lines[lastLineIndex] =
          `${beforeEqual}${miseEnEvidence(betweenEqualAnd)}${afterAnd}`
      }

      // Return an array with three elements
      return lines.join('\\\\')
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      if (this.sup3 === 2) {
        this.sup4 = 2
      }
      let texte, texteCorr: string
      texte = ''
      texteCorr = ''
      const variables = ['x', 'y', 'z', 'r', 's', 't']
      const variablesSelect = getRandomSubarray(variables, this.sup4 + 1)
      const typeofCoeff = ['entier']
      const signeGroupements: number[] = []
      const ordreGroupements: string[] = []
      let p1: MonomePlusieursVariables
      let p2: MonomePlusieursVariables
      let p3: MonomePlusieursVariables
      let p4: MonomePlusieursVariables
      let p5: MonomePlusieursVariables
      let groupement: PolynomePlusieursVariables
      let listeTermesFactorises: MonomePlusieursVariables[] = []
      do {
        groupement = PolynomePlusieursVariables.createRandomPolynome(
          1,
          randint(1, this.sup3),
          this.sup3 + 1,
          choice(typeofCoeff),
          variablesSelect,
        ).ordonner()
      } while (
        (groupement.miseEnFacteurCommun().toString() !== '1' &&
          (listeDeQuestions[i] === 1 ||
            listeDeQuestions[i] === 2 ||
            listeDeQuestions[i] === 3 ||
            listeDeQuestions[i] === 4 ||
            listeDeQuestions[i] === 5)) ||
        (groupement.miseEnFacteurCommun().toString() === '1' &&
          (listeDeQuestions[i] === 6 ||
            listeDeQuestions[i] === 7 ||
            listeDeQuestions[i] === 8 ||
            listeDeQuestions[i] === 9 ||
            listeDeQuestions[i] === 10)) ||
        groupement.contientCarre()
      )
      do {
        do {
          p1 = MonomePlusieursVariables.createRandomMonome(
            randint(1, this.sup2 + 1),
            'entier',
            variablesSelect,
          )
          do {
            p2 = MonomePlusieursVariables.createRandomMonome(
              randint(0, this.sup2 + 1),
              'entier',
              variablesSelect,
            )
          } while (p2.estSemblable(p1))
          if (listeDeQuestions[i] === 2 || listeDeQuestions[i] === 3) {
            p3 = MonomePlusieursVariables.createMonomeFromPartieLitterale(
              'entier',
              p1.partieLitterale,
            )
            p4 = MonomePlusieursVariables.createMonomeFromPartieLitterale(
              'entier',
              p2.partieLitterale,
            )
            p5 = MonomePlusieursVariables.createRandomMonome(
              randint(0, this.sup2 + 1),
              'entier',
              variablesSelect,
            )
          } else {
            p3 = MonomePlusieursVariables.createRandomMonome(
              randint(0, this.sup2 + 1),
              'entier',
              variablesSelect,
            )
            p4 = MonomePlusieursVariables.createRandomMonome(
              randint(0, this.sup2 + 1),
              'entier',
              variablesSelect,
            )
            p5 = MonomePlusieursVariables.createRandomMonome(
              randint(0, this.sup2 + 1),
              'entier',
              variablesSelect,
            )
          }
        } while (
          p1.toString() === '-1' ||
          p2.toString() === '-1' ||
          p3.toString() === '-1' ||
          p4.toString() === '-1' ||
          p5.toString() === '-1' ||
          p1.toString() === '1' ||
          p2.toString() === '1' ||
          p3.toString() === '1' ||
          p4.toString() === '1' ||
          p5.toString() === '1' ||
          p1.toString() === '0' ||
          p2.toString() === '0' ||
          p3.toString() === '0' ||
          p4.toString() === '0' ||
          p5.toString() === '0'
        )
        // si tous les signes sont négatifs, on change le signe du groupement
        if (groupement.monomes.every((m) => m.coefficient.signe === -1)) {
          groupement = groupement.oppose()
        }
        listeTermesFactorises = [p1, p3]
        if (this.sup5 + 1 > 2) {
          listeTermesFactorises.push(p2)
        }
        if (this.sup5 + 1 > 3) {
          listeTermesFactorises.push(p4)
        }
        if (this.sup5 + 1 > 4) {
          listeTermesFactorises.push(p5)
        }
      } while (
        PolynomePlusieursVariables.PolynomeNonReduit(listeTermesFactorises)
          .reduire()
          .toString() === '0'
      )
      listeTermesFactorises = shuffle(listeTermesFactorises)
      // on ne veut pas que tous les termes soient négatifs lorsque la question est de type 4,5 ou 9,10
      if (
        listeDeQuestions[i] === 4 ||
        listeDeQuestions[i] === 5 ||
        listeDeQuestions[i] === 9 ||
        listeDeQuestions[i] === 10
      ) {
        if (listeTermesFactorises.every((m) => m.coefficient.signe === -1)) {
          listeTermesFactorises[0] = listeTermesFactorises[0].oppose()
        }
      }
      let groupementsPossibles = [groupement]
      if (listeDeQuestions[i] === 3) {
        groupementsPossibles = [groupement, groupement.oppose()]
      }
      for (let j = 0; j < this.sup5 + 1; j++) {
        const groupementSelect = choice(groupementsPossibles)
        if (groupement.toString() !== groupementSelect.toString()) {
          listeTermesFactorises[j] = listeTermesFactorises[j].oppose()
          signeGroupements.push(-1)
        } else {
          signeGroupements.push(1)
        }
        if (randint(0, 1) === 0) {
          ordreGroupements.push('avant')
        } else {
          ordreGroupements.push('après')
        }
      }
      if (signeGroupements.filter((s) => s !== -1).length === 0) {
        signeGroupements[0] = 1
        listeTermesFactorises[0] = listeTermesFactorises[0].oppose()
      }
      const listeTermesFactorisesSigne = listeTermesFactorises.map((x, j) =>
        signeGroupements[j] === -1 ? x.oppose() : x,
      )
      const ordreGroupementsApres = ordreGroupements.map(() => 'après')
      const signeGroupementsPositif = signeGroupements.map(() => 1)
      const groupementFactorise = PolynomePlusieursVariables.PolynomeNonReduit(
        listeTermesFactorisesSigne,
      )
      let developpe: boolean = false
      let melange: boolean = false
      switch (listeDeQuestions[i]) {
        case 1:
        case 2:
        case 3:
        case 6:
        case 7:
        case 8: {
          developpe = false
          melange = false
          break
        }
        case 4:
        case 9: {
          developpe = true
          melange = false
          break
        }
        case 5:
        case 10: {
          developpe = true
          melange = true
          break
        }
      }
      let unTerme: boolean = false
      texte += `$${lettreDepuisChiffre(i + 1)}=`
      texte += imprimerExpr(
        groupement,
        listeTermesFactorises,
        ordreGroupements,
        signeGroupements,
        developpe,
        melange,
      )
      texte += '$'
      texteCorr += `On procède de la manière suivante <br><br> $\\begin{aligned}${lettreDepuisChiffre(i + 1)}`
      if (melange) {
        texteCorr += `&=${imprimerExpr(groupement, listeTermesFactorises, ordreGroupements, signeGroupements, developpe, false)}&&\\text{préparer les groupements}\\\\`
      }
      if (developpe) {
        texteCorr += `&=${imprimerExpr(groupement, listeTermesFactorises, ordreGroupementsApres, signeGroupementsPositif, false, false)}&&\\text{mettre en évidence pour faire apparaître}\\\\
        & &&\\text{le groupement }(${groupement.toString()})\\\\`
      }
      if (ordreGroupements.some((s) => s === 'avant' && !developpe)) {
        texteCorr += `&=${imprimerExpr(groupement, listeTermesFactorises, ordreGroupementsApres, signeGroupements, false, false)}&&\\text{réarranger les termes}\\\\`
      }
      if (signeGroupements.some((s) => s === -1)) {
        texteCorr += `&=${imprimerExpr(groupement, listeTermesFactorisesSigne, ordreGroupementsApres, signeGroupementsPositif, false, false)}&&\\text{multiplier par } -1 \\text{ certains groupements}\\\\`
      }
      texteCorr += `&=(${groupementFactorise.toString()})(${groupement.toString()})&& \\text{mettre en évidence le facteur } (${groupement.toString()})\\\\`
      if (
        groupementFactorise.reduire().toString() !==
        groupementFactorise.toString()
      ) {
        if (groupementFactorise.reduire().monomes.length === 1) {
          texteCorr += `&=${groupementFactorise.reduire().toString()}(${groupement.toString()}) && \\text{réduire et ordonner les facteurs}\\\\`
          unTerme = true
        } else {
          texteCorr += `&=(${groupementFactorise.reduire().toString()})(${groupement.toString()}) && \\text{réduire et ordonner les facteurs}\\\\`
        }
      }
      if (
        groupementFactorise.reduire().miseEnFacteurCommun().toString() !==
          '1' &&
        unTerme === false
      ) {
        texteCorr += `&=${groupementFactorise.reduire().miseEnFacteurCommun().toString()}(${groupementFactorise.reduire().diviserParMonome(groupementFactorise.reduire().miseEnFacteurCommun())})(${groupement.toString()}) && \\text{factoriser le premier terme}\\\\`
        if (groupement.miseEnFacteurCommun().toString() !== '1') {
          texteCorr += `&=${groupementFactorise.reduire().miseEnFacteurCommun().toString()}(${groupementFactorise.reduire().diviserParMonome(groupementFactorise.reduire().miseEnFacteurCommun())})${groupement.miseEnFacteurCommun().toStringAvecParentheses()}(${groupement.diviserParMonome(groupement.miseEnFacteurCommun())}) && \\text{factoriser le groupement}\\\\`
        }
      } else {
        if (
          groupement.miseEnFacteurCommun().toString() !== '1' &&
          unTerme === false
        ) {
          texteCorr += `&=${groupementFactorise.reduire().miseEnFacteurCommun().toString() !== '1' ? groupementFactorise.reduire().miseEnFacteurCommun().toString() : ''}(${groupementFactorise.reduire().diviserParMonome(groupementFactorise.reduire().miseEnFacteurCommun())})${groupement.miseEnFacteurCommun().toStringAvecParentheses()}(${groupement.diviserParMonome(groupement.miseEnFacteurCommun())}) && \\text{factoriser le groupement}\\\\`
        } else if (
          groupement.miseEnFacteurCommun().toString() !== '1' &&
          unTerme === true
        ) {
          texteCorr += `&=${groupementFactorise.reduire().toString()}\\cdot ${groupement.miseEnFacteurCommun().toStringAvecParentheses()}(${groupement.diviserParMonome(groupement.miseEnFacteurCommun())}) && \\text{factoriser le groupement}\\\\`
        }
      }
      if (
        groupementFactorise.reduire().toString() !== '1' &&
        groupement.miseEnFacteurCommun().toString() !== '1' &&
        unTerme === false
      ) {
        texteCorr += `&=${groupementFactorise.reduire().miseEnFacteurCommun().produit(groupement.miseEnFacteurCommun()).toString()}(${groupementFactorise.reduire().diviserParMonome(groupementFactorise.reduire().miseEnFacteurCommun())})(${groupement.diviserParMonome(groupement.miseEnFacteurCommun()).toString()}) && \\text{réduire l'expression}\\\\`
      } else if (
        groupementFactorise.reduire().toString() !== '1' &&
        groupement.miseEnFacteurCommun().toString() !== '1' &&
        unTerme === true
      ) {
        // prob ici
        texteCorr += `&=${groupementFactorise.reduire().produit(groupement.miseEnFacteurCommun()).toString()}(${groupement.diviserParMonome(groupement.miseEnFacteurCommun()).toString()}) && \\text{réduire l'expression}\\\\`
      }
      texteCorr += '\\end{aligned}$'

      const reponse = derniereExpression(texteCorr)
      texteCorr = transformEquation(texteCorr)

      if (this.questionJamaisPosee(i, p1.toString(), groupement.toString())) {
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
            { texteAvant: ' $=$', dataKeys: touchesDeLaReponse(reponse) },
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
