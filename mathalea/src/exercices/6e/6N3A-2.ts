import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Passer d'une écriture fractionnaire à une fraction"
export const interactifReady = true

export const dateDePublication = '15/03/2025'

/**
 * écrire une écriture fractionnaire présentant des numérateurs et dénominateurs décimaux sous forme de fraction et éventuellement simplifier
 * @author Jean-claude Lhote
 */
export const uuid = '9cb7e'

export const refs = {
  'fr-fr': ['6N3A-2'],
  'fr-ch': ['9R1NO4C-7', '9R2NO4C-7', '9R3NO4C-7', 'PRQNO10A-5'],
}

export default class PasserEcritureFractionnaireFraction extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de question',
      'Nombres séparés par des tirets :\n1 : Numérateur décimal seulement\n2 : Dénominateur décimal seulement\n3 : Numérateur et dénominateur décimaux\n4 : Mélange',
    ]
    this.sup = '4'
    this.besoinFormulaire2Numerique = ['Nombre maximum de décimales', 3]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ['Avec simplification']
    this.sup3 = false
  }

  nouvelleVersion() {
    this.consigne = this.sup3
      ? 'Écrire les nombres suivants sous forme de fraction et simplifier si possible.'
      : 'Écrire les nombres suivants sous forme de fraction.'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 3,
    })
    const nbDecimalesMax = this.sup2
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let nbDecimalesNumerateur = 0
      let nbDecimalesDenominateur = 0
      let nbDecimalesSup = 0
      if (listeTypeDeQuestions[i] === 1) {
        nbDecimalesNumerateur = randint(1, nbDecimalesMax)
        nbDecimalesSup = nbDecimalesNumerateur
      } else if (listeTypeDeQuestions[i] === 2) {
        nbDecimalesDenominateur = randint(1, nbDecimalesMax)
        nbDecimalesSup = nbDecimalesDenominateur
      } else {
        nbDecimalesDenominateur = randint(1, nbDecimalesMax)
        nbDecimalesNumerateur = randint(1, nbDecimalesMax)
        nbDecimalesSup = Math.max(
          nbDecimalesNumerateur,
          nbDecimalesDenominateur,
        )
      }
      const facteurCommun = this.sup3 ? choice([2, 3, 4, 5, 6, 8, 9]) : 1
      let numerateur = 0
      let denominateur = 1
      do {
        numerateur = randint(1, 10 ** (nbDecimalesNumerateur + 1))
        denominateur = randint(2, 10 ** (nbDecimalesDenominateur + 1))
        numerateur *= facteurCommun
        denominateur *= facteurCommun
      } while (
        pgcd(numerateur, denominateur) !== facteurCommun ||
        numerateur % 10 === 0 ||
        denominateur % 10 === 0
      )

      const texNombreNumerateur = texNombre(
        numerateur / 10 ** nbDecimalesNumerateur,
        nbDecimalesNumerateur,
      )
      const texNombreDenominateur = texNombre(
        denominateur / 10 ** nbDecimalesDenominateur,
        nbDecimalesDenominateur,
      )
      const value = new FractionEtendue(
        (numerateur * 10 ** nbDecimalesMax) / 10 ** nbDecimalesNumerateur,
        (denominateur * 10 ** nbDecimalesMax) / 10 ** nbDecimalesDenominateur,
      )
      texte =
        `$\\dfrac{${texNombreNumerateur}}{${texNombreDenominateur}}$` +
        ajouteQuestionMathlive({
          exercice: this,
          question: i,
          texteAvant: '$=$',
          typeInteractivite: 'mathlive',
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          objetReponse: {
            reponse: {
              value,
              options: this.sup3
                ? { fractionSimplifiee: true }
                : { fractionEgale: true },
            },
          },
        })
      const multiplicateur = texNombre(10 ** nbDecimalesSup, 0)
      texteCorr = `Pour transformer l'écriture fractionnaire en fraction, il faut multiplier le numérateur et le dénominateur par $${multiplicateur}$.<br>
      $\\begin{aligned}\\dfrac{${texNombreNumerateur}}{${texNombreDenominateur}}&=\\dfrac{${texNombreNumerateur}\\times ${multiplicateur}}{${texNombreDenominateur}\\times ${multiplicateur}}\\\\
      &=${miseEnEvidence(value.texFraction, this.sup3 ? bleuMathalea : orangeMathalea)}
      \\end{aligned}$`
      if (this.sup3) {
        texteCorr += `<br>On peut simplifier la fraction en divisant le numérateur et le dénominateur par $${facteurCommun}$.<br>
        $\\begin{aligned}${value.texFraction}&=\\dfrac{${texNombre(value.num)}\\div ${facteurCommun}}{${texNombre(value.den)}\\div ${facteurCommun}}\\\\
        &=${miseEnEvidence(value.texFractionSimplifiee)}
        \\end{aligned}$`
      }
      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
