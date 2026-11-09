import { bleuMathalea } from '../../lib/colors'
import {
  addMathaleaSolveur,
  baremeSolveur,
  commentaireSolveurInteractif,
  formulaireBaremeSolveur,
  modeSolveur,
  optionsSolveur,
} from '../../lib/customElements/MathaleaSolveurElement'
import { sameSet, seq } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Résoudre une équation du deuxième degré à l'aide de la factorisation"
export const dateDePublication = '31/10/2026'
export const dateDeModifImportante = '02/11/2026'
export const interactifReady = true
export const uuid = '77aae'
export const refs = {
  'fr-fr': ['2L22-5'],
  'fr-ch': ['1mCL4-0', '11LSFA4E-8'],
}

export default class ResoudreEquationParFactorisation extends Exercice {
  constructor() {
    super()
    this.comment = `${commentaireSolveurInteractif}<br>
Lorsque l'une des étapes est une équation produit (produit de deux expressions affines égal à zéro), un bouton « Équation produit » apparaît : il affiche la propriété du produit nul et propose une colonne par facteur, à résoudre dans l'ordre souhaité. L'élève donne ensuite l'ensemble des solutions $S=$, qui est la réponse vérifiée. Un carré comme $(x+3)^2=0$ n'est pas reconnu comme un produit : l'élève peut l'écrire $(x+3)(x+3)=0$ ou résoudre directement $x+3=0$. Une équation $x^2=a$ est considérée comme résolue : l'élève donne alors ses deux solutions dans $S=$.`
    this.nbQuestions = 5
    this.spacingCorr = 2
    this.sup = '10'
    this.sup2 = 1
    this.besoinFormulaire2Numerique = [
      'Second membre de l’équation',
      3,
      '1 : Nul \n2 : Polynôme non nul\n3 : Mélange',
    ]
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.besoinFormulaireTexte = [
      'Choix des questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Mise en évidence d’un monôme',
        '2 : Mise en évidence d’un polynôme',
        '3 : Se ramenant à $(x+a)^2=0$',
        '4 : Se ramenant à $(ax+b)^2=0$',
        '5 : Se ramenant à $(x-a)^2=0$',
        '6 : Se ramenant à $(ax-b)^2=0$',
        '7 : Se ramenant à $(x+a)(x-a)=0$',
        '8 : Se ramenant à $(ax+b)(ax-b)=0$',
        '9 : Se ramenant à $(x\\pm a)(x\\pm b)=0$',
        '10 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Numerique = formulaireBaremeSolveur()
    this.sup3 = 1
  }

  nouvelleVersion() {
    this.consigne = `Résoudre dans $\\mathbb{R}$ ${this.nbQuestions > 1 ? 'les équations suivantes' : 'l’équation suivante'} à l’aide de la factorisation.`
    if (this.interactif) {
      this.consigne +=
        '<br>Donner la réponse sous forme d’un ensemble de solutions.'
    }
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 9,
      melange: 10,
      defaut: 10,
      nbQuestions: this.nbQuestions,
    })
    const secondsMembres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = Number(types[i])
      let equation: string
      let factorisation: string
      let explication: string
      let etape = ''
      let a = 1
      let b = 0
      let c = 1
      let d = 0
      let facteurDouble = false
      let multiplicateur = 1

      if (type === 1) {
        const k = randint(2, 5)
        multiplicateur = k
        c = randint(1, 6)
        d = randint(-9, 9, 0)
        equation = `${reduirePolynomeDegre3(0, k * c, k * d, 0)}=0`
        factorisation = `${k}x(${reduireAxPlusB(c, d)})=0`
        explication = `Mettre en évidence le monôme $${k}x$.`
      } else if (type >= 3 && type <= 8) {
        a = type === 4 || type === 6 || type === 8 ? randint(2, 5) : 1
        const n = randint(1, 9)
        c = a
        if (type === 3 || type === 4) {
          b = d = n
          facteurDouble = true
          equation = `${reduirePolynomeDegre3(0, a * a, 2 * a * n, n * n)}=0`
          explication =
            'Factoriser avec la première identité remarquable : $a^2+2ab+b^2=(a+b)^2$.'
        } else if (type === 5 || type === 6) {
          b = d = -n
          facteurDouble = true
          equation = `${reduirePolynomeDegre3(0, a * a, -2 * a * n, n * n)}=0`
          explication =
            'Factoriser avec la deuxième identité remarquable : $a^2-2ab+b^2=(a-b)^2$.'
        } else {
          b = -n
          d = n
          equation = `${reduirePolynomeDegre3(0, a * a, 0, -n * n)}=0`
          explication =
            'Factoriser avec la troisième identité remarquable : $a^2-b^2=(a-b)(a+b)$.'
        }
        factorisation = facteurDouble
          ? `(${reduireAxPlusB(a, b)})^2=0`
          : `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0`
      } else if (type === 9) {
        b = randint(-9, 9, 0)
        d = randint(-9, 9, [0, b, -b])
        equation = `${reduirePolynomeDegre3(0, 1, b + d, b * d)}=0`
        factorisation = `(${reduireAxPlusB(1, b)})(${reduireAxPlusB(1, d)})=0`
        explication = `Utiliser la quatrième identité remarquable : $x^2+(a+b)x+ab=(x+a)(x+b)$.<br>Chercher deux nombres dont la somme vaut $${b + d}$ et le produit vaut $${b * d}$ : $${b}$ et $${d}$.`
      } else {
        // Conserver un degré exactement égal à deux, dans les cinq formes de 2L22-3.
        a = randint(2, 5)
        b = randint(-9, 9, 0)
        const u = randint(-5, 5, 0)
        const v = randint(-9, 9, 0)
        const w = randint(-5, 5, [0, u, -u, a, -a])
        const z = randint(-9, 9, 0)
        const commun = `(${reduireAxPlusB(a, b)})`
        const premier = `(${reduireAxPlusB(u, v)})`
        const second = `(${reduireAxPlusB(w, z)})`
        const variante = randint(1, 5)
        let difference = false
        let premierA = u
        let premierB = v
        let secondA = w
        let secondB = z
        switch (variante) {
          case 1:
            equation = `${commun}${premier}+${commun}${second}=0`
            break
          case 2:
            equation = `${commun}${premier}-${commun}${second}=0`
            difference = true
            break
          case 3:
            equation = `${commun}^2+${commun}${second}=0`
            premierA = a
            premierB = b
            break
          case 4:
            equation = `${commun}${premier}-${commun}^2=0`
            secondA = a
            secondB = b
            difference = true
            break
          default:
            equation = `${commun}${premier}=${commun}${second}`
            difference = true
        }
        const signe = difference ? -1 : 1
        c = premierA + signe * secondA
        d = premierB + signe * secondB
        // Éviter les équations du premier degré dans les variantes avec un carré.
        if (c === 0) continue
        etape += `$${commun}\\big[(${reduireAxPlusB(premierA, premierB)})${difference ? '-' : '+'}(${reduireAxPlusB(secondA, secondB)})\\big]=0$<br>`
        factorisation = `${commun}(${reduireAxPlusB(c, d)})=0`
        explication = `Mettre en évidence le polynôme $${commun}$.`
        if (variante === 5) {
          explication =
            'Ramener tous les termes dans le membre de gauche, puis mettre en évidence le facteur commun.'
        }
      }

      const [gauche, droite] = equation.split('=')
      const expressionNulle = droite === '0' ? gauche : `${gauche}-${droite}`
      const equationNulle = `${expressionNulle}=0`
      const secondMembreNonNul = Number(secondsMembres[i]) === 2
      if (!secondMembreNonNul) {
        equation = equationNulle
      } else if (droite === '0') {
        const coefficientCarre = randint(0, 1) === 0 ? 0 : randint(-5, 5, 0)
        const coefficientLineaire = randint(-9, 9, 0)
        const constante = randint(-9, 9, 0)
        const secondMembre = reduirePolynomeDegre3(
          0,
          coefficientCarre,
          coefficientLineaire,
          constante,
        )
        // Garder les facteurs communs visibles dans le cas « polynôme ».
        const premierMembre =
          type === 2
            ? `${expressionNulle}+(${secondMembre})`
            : reduirePolynomeDegre3(
                0,
                multiplicateur * a * c + coefficientCarre,
                multiplicateur * (a * d + b * c) + coefficientLineaire,
                multiplicateur * b * d + constante,
              )
        equation = `${premierMembre}=${secondMembre}`
      }

      if (!this.questionJamaisPosee(i, equation)) continue

      const racine1 = new FractionEtendue(-b, a).simplifie()
      const racine2 = new FractionEtendue(-d, c).simplifie()
      const racines = racine1.isEqual(racine2)
        ? [racine1]
        : [racine1, racine2].sort(
            (r1, r2) => r1.valeurDecimale - r2.valeurDecimale,
          )
      const ensemble = `\\left\\{${racines.map((r) => r.texFractionSimplifiee).join(';')}\\right\\}`
      let correction = `$${equation}$<br>`
      if (secondMembreNonNul) {
        if (this.correctionDetaillee) {
          correction += `${texteEnCouleur('Ramener tous les termes dans le membre de gauche et réduire.', bleuMathalea)}<br>`
          const [premierMembre, secondMembre] = equation.split('=')
          correction += `$${premierMembre}-(${secondMembre})=0$<br>`
        }
        correction += `$${equationNulle}$<br>`
      }
      if (this.correctionDetaillee) {
        correction += `${texteEnCouleur(explication, bleuMathalea)}<br>`
      }
      if (this.correctionDetaillee) correction += etape
      correction += `$${factorisation}$<br>`
      if (facteurDouble) {
        correction += `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, b)})=0$<br>`
      }
      if (this.correctionDetaillee) {
        correction += `On reconnaît une équation produit-nul, donc on applique la propriété : <br> ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
      }
      if (facteurDouble) {
        correction +=
          'Les deux facteurs étant identiques, il suffit de résoudre une seule équation.<br>'
        correction += `$${reduireAxPlusB(a, b)}=0$<br>`
        correction += `$x=${racine1.texFractionSimplifiee}$.<br>`
      } else {
        correction += `$${reduireAxPlusB(a, b)}=0\\quad\\text{ou}\\quad ${reduireAxPlusB(c, d)}=0$<br>`
        correction += `$x=${racine1.texFractionSimplifiee}\\quad\\text{ou}\\quad x=${racine2.texFractionSimplifiee}$.<br>`
      }
      correction += `L’ensemble des solutions est $S=${miseEnEvidence(ensemble)}$.`
      const solveur = addMathaleaSolveur(this, i, {
        initial: equation,
        kind: 'equation',
        equationProduit: true,
        conclusion: 'S=',
        ...optionsSolveur(this.interactif, false, this.sup3),
      })
      const question = this.interactif ? solveur : `${solveur}.`
      handleAnswers(
        this,
        i,
        {
          reponse: { value: ensemble, compare: seq([sameSet()]) },
          bareme: baremeSolveur(modeSolveur(this.sup3)),
        },
        { formatInteractif: 'mathalea-solveur' },
      )
      this.listeQuestions[i] = question
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
