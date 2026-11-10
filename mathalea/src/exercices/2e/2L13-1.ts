import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la distributivité simple avec des fractions'
export const interactifReady = true

export const dateDePublication = '04/03/2026'

export const uuid = '7f8e2'
export const refs = {
  'fr-fr': ['2L13-1'],
  'fr-ch': ['11LCFA3F-13', '11LSFA3F-13'],
}

/**
 * Développer en utilisant la distributivité simple avec des fractions
 *
 * * Type 1 : \frac{a}{b}(cx+d)
 * * Type 2 : \frac{a}{b}x(cx+d)
 * * Type 3 : \frac{a}{b}(cx+\frac{d}{e})
 *
 * Les fractions sont choisies parmi une liste fixe de fractions irréductibles simples.
 *
 * @author Rémi Angot
 */
export default class ExerciceDistributiviteFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : (a/b)(cx+d)\n2 : (a/b)x(cx+d)\n3 : (a/b)(cx+d/e)\n4 : Mélange',
    ]
    this.sup = '4'
    this.nbQuestions = 6
    this.spacing = 2
    this.spacingCorr = 3
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1 && !context.isDiaporama
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    // Fractions irréductibles simples (numérateurs et dénominateurs < 10)
    const fractionsDisponibles: [number, number][] = [
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
      [1, 9],
      [2, 3],
      [2, 5],
      [2, 7],
      [2, 9],
      [3, 4],
      [3, 5],
      [3, 7],
      [3, 8],
      [4, 5],
      [4, 7],
      [4, 9],
      [5, 6],
      [5, 7],
      [5, 8],
      [5, 9],
      [6, 7],
      [7, 8],
      [7, 9],
      [8, 9],
    ]

    const typesDeQuestionsDisponibles = [
      'a/b(cx+d)',
      'a/bx(cx+d)',
      'a/b(cx+d/e)',
    ]
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      listeOfCase: typesDeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
      melange: 4,
    })

    // Affiche cx à l'intérieur de parenthèses (sans parenthèses supplémentaires si négatif)
    function displayCoeffVar(coef: number, v: string): string {
      if (coef === 1) return v
      if (coef === -1) return `-${v}`
      return `${coef}${v}`
    }

    // Affiche cx en tant que multiplicande isolé (grandes parenthèses si coef < 0)
    function displayCoeffVarMult(coef: number, v: string): string {
      if (coef === 1) return v
      if (coef === -1) return `\\left(-${v}\\right)`
      if (coef > 0) return `${coef}${v}`
      return `\\left(${coef}${v}\\right)`
    }

    // Construit le premier terme d'un polynôme : frac × v (sans + devant)
    function firstTermLatex(frac: FractionEtendue, v: string): string {
      const coef = frac.texFractionSaufUn
      if (coef === '') return v
      if (coef === '-') return `-${v}`
      return `${coef}${v}`
    }

    // Construit un terme algébrique suivant : +frac×v ou -frac×v
    function algTermLatex(frac: FractionEtendue, v: string): string {
      if (frac.isEqual(0)) return ''
      if (frac.isEqual(1)) return `+${v}`
      if (frac.isEqual(-1)) return `-${v}`
      return `${frac.ecritureAlgebrique}${v}`
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const [a, b] = choice(fractionsDisponibles)
      const f = new FractionEtendue(a, b)
      const c = randint(2, 9) * choice([1, -1])
      const d = randint(1, 9) * choice([1, -1])
      const inconnue = 'x'
      const typesDeQuestions = listeTypeDeQuestions[i]

      let texte = ''
      let reponseDev = ''
      let reponseRed = ''
      let reponseRedSimplifiee = ''
      const lettre = lettreDepuisChiffre(i + 1)
      let ASimplifier = false

      switch (typesDeQuestions) {
        case 'a/b(cx+d)': {
          texte = `$${lettre}=${f.texFSD}\\left(${displayCoeffVar(c, inconnue)}${ecritureAlgebrique(d)}\\right)$`
          const termD1 = d >= 0 ? `${d}` : `\\left(${d}\\right)`
          reponseDev = `${f.texFSD}\\times ${displayCoeffVarMult(c, inconnue)}+${f.texFSD}\\times ${termD1}`
          const coefX1 = new FractionEtendue(a * c, b)
          const coefCst1 = new FractionEtendue(a * d, b)
          reponseRed = `${firstTermLatex(coefX1, inconnue)}${coefCst1.ecritureAlgebrique}`
          ASimplifier = !(coefX1.estIrreductible && coefCst1.estIrreductible)
          reponseRedSimplifiee = `${firstTermLatex(coefX1.simplifie(), inconnue)}${coefCst1.simplifie().ecritureAlgebrique}`
          break
        }
        case 'a/bx(cx+d)': {
          texte = `$${lettre}=${f.texFSD}${inconnue}\\left(${displayCoeffVar(c, inconnue)}${ecritureAlgebrique(d)}\\right)$`
          const termD2 = d >= 0 ? `${d}` : `\\left(${d}\\right)`
          reponseDev = `${f.texFSD}${inconnue}\\times ${displayCoeffVarMult(c, inconnue)}+${f.texFSD}${inconnue}\\times ${termD2}`
          const coefX2 = new FractionEtendue(a * c, b)
          const coefX1b = new FractionEtendue(a * d, b)
          reponseRed = `${firstTermLatex(coefX2, `${inconnue}^2`)}${algTermLatex(coefX1b, inconnue)}`
          ASimplifier = !(coefX2.estIrreductible && coefX1b.estIrreductible)
          reponseRedSimplifiee = `${firstTermLatex(coefX2.simplifie(), inconnue)}${coefX1b.simplifie().ecritureAlgebrique}`
          break
        }
        case 'a/b(cx+d/e)': {
          const [d2, e] = choice(fractionsDisponibles)
          const f2 = new FractionEtendue(d2, e)
          texte = `$${lettre}=${f.texFSD}\\left(${displayCoeffVar(c, inconnue)}+${f2.texFSD}\\right)$`
          reponseDev = `${f.texFSD}\\times ${displayCoeffVarMult(c, inconnue)}+${f.texFSD}\\times ${f2.texFSD}`
          const prodFrac = f.produitFraction(f2)
          const coefX3 = new FractionEtendue(a * c, b)
          reponseRed = `${firstTermLatex(coefX3, inconnue)}${prodFrac.ecritureAlgebrique}`
          ASimplifier = !(coefX3.estIrreductible && prodFrac.estIrreductible)
          reponseRedSimplifiee = `${firstTermLatex(coefX3.simplifie(), inconnue)}${prodFrac.simplifie().ecritureAlgebrique}`
          break
        }
      }

      // Construction de la correction
      let texteCorr = texte + '<br>'
      texteCorr += `$${lettre}=${reponseDev}$`
      texteCorr += '<br>'
      if (ASimplifier) {
        texteCorr += `$${lettre}=${reponseRed}$<br>`
        texteCorr += `On peut encore réduire et obtenir : `
        texteCorr += `$${lettre}=${miseEnEvidence(reponseRedSimplifiee)}$.`
      } else texteCorr += `$${lettre}=${miseEnEvidence(reponseRed)}$`

      // Gestion de l'interactif
      handleAnswers(this, i, {
        reponse: {
          value: ASimplifier ? [reponseRed, reponseRedSimplifiee] : reponseRed,
          options: { expressionsForcementReduites: true },
        },
      })
      if (!context.isAmc) {
        texte += this.interactif
          ? `<br><br>$${lettre} = $` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )
          : ''
      }

      if (this.questionJamaisPosee(i, reponseRed)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
