import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { numAlpha } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Trinome from '../../../modules/Trinome'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer les domaines de bijectivité et la réciproque d'une fonction quadratique"
export const dateDePublication = '03/02/2026'
export const interactifReady = false
export const uuid = '607c3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mRecComp-1'],
}

/**
 * Déterminer les domaines de bijectivité et la réciproque d'une fonction quadratique
 * @author Nathan Scheinmann
 */

export default class ExerciceFactorisePoly extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Coefficient dominant',
      4,
      '1: Égal à 1\n2: Entier relatif\n3: Fractionnaire\n4: Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      `Avec la recherche de l'expression de la réciproque`,
    ]
    this.sup = 4
    this.sup2 = true
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['1', 'relatif', 'fractionnaire'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let a = new FractionEtendue(
        randint(-10, 10, 0),
        randint(1, 10, 0),
      ).simplifie()
      const b = new FractionEtendue(randint(-10, 10, 0), 1)
      const c = new FractionEtendue(randint(-10, 10, 0), 1)
      let solA = ''
      let solB = ''
      let bCompletion = b
        .produitFraction(a.inverse())
        .simplifie()
        .entierDivise(2)
        .simplifie()
      do {
        switch (listeTypeDeQuestions[i]) {
          case '1':
            a = new FractionEtendue(1, 1)
            break
          case 'relatif':
            a = new FractionEtendue(randint(-10, 10, 0), 1).simplifie()
            break
          case 'fractionnaire':
            a = new FractionEtendue(
              randint(-10, 10, 0),
              randint(1, 10, 0),
            ).simplifie()
            break
        }
        bCompletion = b
          .produitFraction(a.inverse())
          .simplifie()
          .entierDivise(2)
          .simplifie()
      } while (
        bCompletion.isEqual(b) ||
        (listeTypeDeQuestions[i] === 'fractionnaire' && a.den === 1)
      )
      const mono = choice([-1, 1])
      const monoT = mono === 1 ? 'croissante' : 'décroissante'
      const sens = a.signe > 0 ? 'convexe' : 'concave'
      const sensN = a.signe > 0 ? 1 : -1
      const f = new Trinome(a, b, c)
      const sommetX = f.alpha.simplifie()
      const sommetY = f.beta.simplifie()
      texte += `Soit $f(x)=${f.tex}$.<br>`
      if (this.sup2) {
        texte += `${numAlpha(0)}`
      }
      texte += `Déterminer les plus grands ensembles $A$ et $B$ de $\\mathbb{R}$ de sorte que $f~:A\\rightarrow B$ soit bijective ${monoT}.<br>`
      if (this.sup2) {
        texte += `${numAlpha(1)} Déterminer la fonction réciproque de $f~:A\\rightarrow B$.`
      }
      if (this.sup2) {
        texteCorr += `${numAlpha(0)}`
      }
      texteCorr += `On détermine le sommet de la parabole donné par $S\\left(-\\frac{b}{2a}~;~f\\left(-\\frac{b}{2a}\\right)\\right)$.<br> Dans notre cas, on a $S\\left(${sommetX.simplifie().texFSD}~;~${sommetY.simplifie().texFSD}\\right)$.<br> On cherche les ensembles $A$ et $B$ de $\\mathbb{R}$ de sorte que $f~:A\\rightarrow B$ soit bijective ${monoT}.<br> Comme la parabole est ${sens}, elle est bijective en la restreignant sur les domaines suivants : <br>`
      if (sens === 'concave') {
        texteCorr += `\\[\\left]-\\infty\\,;\\,${sommetX.simplifie().toLatex()}\\right]\\rightarrow  \\left]-\\infty\\,;\\,${sommetY.simplifie().toLatex()}\\right] \\text{ et } \\left[${sommetX.simplifie().texFSD}\\,;\\,+\\infty\\right[\\rightarrow  \\left]-\\infty\\,;\\,${sommetY.simplifie().texFSD}\\right]\\]`
      } else {
        texteCorr += `\\[\\left]-\\infty\\,;\\,${sommetX.simplifie().texFSD}\\right]\\rightarrow  \\left[${sommetY.simplifie().texFSD}\\,;\\,+\\infty\\right[ \\text{ et } \\left[${sommetX.simplifie().texFSD}\\,;\\,+\\infty\\right[\\rightarrow  \\left[${sommetY.simplifie().texFSD}\\,;\\,+\\infty\\right[\\]`
      }
      texteCorr += `La parabole est ${sens} et on cherche le domaine sur lequel elle est ${monoT}, ainsi <br>`
      if (monoT === 'croissante' && sens === 'convexe') {
        solA = `\\left[${sommetX.simplifie().texFSD}\\,;\\,+\\infty\\right[`
        solB = `\\left[${sommetY.simplifie().texFSD}\\,;\\,+\\infty\\right[`
      } else if (monoT === 'décroissante' && sens === 'convexe') {
        solA = `\\left]-\\infty\\,;\\,${sommetX.simplifie().texFSD}\\right]`
        solB = `\\left[${sommetY.simplifie().texFSD}\\,;\\,+\\infty\\right[`
      } else if (monoT === 'décroissante' && sens === 'concave') {
        solA = `\\left[${sommetX.simplifie().texFSD}\\,;\\,+\\infty\\right[`
        solB = `\\left]-\\infty\\,;\\,${sommetY.simplifie().texFSD}\\right[`
      } else if (monoT === 'croissante' && sens === 'concave') {
        solA = `\\left]-\\infty\\,;\\,${sommetX.simplifie().texFSD}\\right]`
        solB = `\\left]-\\infty\\,;\\,${sommetY.simplifie().texFSD}\\right[`
      }
      texteCorr += `$A=${miseEnEvidence(solA)}$ et $B=${miseEnEvidence(solB)}$.<br>`
      const fNorme = new Trinome(
        1,
        b.produitFraction(a.inverse()).simplifie(),
        c.produitFraction(a.inverse()).simplifie(),
      )
      const bP = bCompletion.produitFraction(bCompletion).simplifie()
      const complCarre = new Trinome(
        1,
        b.produitFraction(a.inverse()).simplifie(),
        bP.simplifie(),
      )
      const sansTermeConstant = new Trinome(
        1,
        b.produitFraction(a.inverse()).simplifie(),
        new FractionEtendue(0, 1),
      )
      const sousRacine = c
        .produitFraction(a.inverse())
        .oppose()
        .simplifie()
        .sommeFraction(bP)
        .simplifie()
      if (this.sup2) {
        texteCorr += `${numAlpha(1)} On utilise la méthode de la complétion du carré.<br> On a : <br><br>
        $\\begin{aligned}
        ${f.tex}&=y&&\\text{ (on remplace }f(x)\\text{ par }y\\text{)}\\\\`
        if (a.simplifie().texFSD !== '1') {
          texteCorr += `${fNorme.tex}&=${rienSi1(a.inverse().simplifie())}y&&\\text{ (on divise par }a\\text{)}\\\\`
        }
        texteCorr += `${sansTermeConstant.tex} &=${rienSi1(a.inverse().simplifie())}y  ${ecritureAlgebrique(c.produitFraction(a.inverse()).oppose().simplifie())}&&\\text{ (on réécrit)}\\\\`
        texteCorr += `${complCarre.tex} &=${rienSi1(a.inverse())}y  ${ecritureAlgebrique(c.produitFraction(a.inverse()).oppose().simplifie())} + ${bP.texFSD}&&\\text{ (on complète le carré)}\\\\`
        texteCorr += `\\left(x${ecritureAlgebrique(bCompletion)}\\right)^2 &=${rienSi1(a.inverse().simplifie())}y  ${ecritureAlgebrique(c.produitFraction(a.inverse()).oppose().simplifie())} + ${bP.texFSD}&&\\text{ (on factorise avec l'identité remarquable)}\\\\`
        texteCorr += `\\left(x${ecritureAlgebrique(bCompletion)}\\right)^2 &=${rienSi1(a.inverse().simplifie())}y  ${ecritureAlgebrique(sousRacine)}&&\\text{ (on réduit)}\\\\`
        texteCorr += `x${ecritureAlgebrique(bCompletion)} &={\\pm}\\sqrt{${rienSi1(a.inverse().simplifie())}y  ${ecritureAlgebrique(sousRacine)}}&&\\text{ (on prend la racine)}\\\\`
        texteCorr += `x &=${bCompletion.oppose().texFractionSimplifiee}{\\pm}\\sqrt{${rienSi1(a.inverse().simplifie())}y  ${ecritureAlgebrique(sousRacine)}} &&\\\\`
        texteCorr += ` \\end{aligned}$`
        texteCorr += `<br> On demande que la fonction $f$ (parabole ${sens}) soit bijective ${monoT}, l'expression recherchée pour la réciproque est donc : <br>\\[
        ${miseEnEvidence(`f^{-1}(x)= ${bCompletion.oppose().texFractionSimplifiee} ${mono * sensN === 1 ? '+' : '-'} \\sqrt{${rienSi1(a.inverse().simplifie())}x  ${ecritureAlgebrique(sousRacine)}`)}}
        \\]`
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
