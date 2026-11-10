import MonomePlusieursVariables from '../../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomeFactorisable from '../../../lib/mathFonctions/PolynomeFactorisableDegMax4'
import PolynomePlusieursVariables from '../../../lib/mathFonctions/PolynomePlusieursVariables'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { listeDesDiviseurs } from '../../../lib/outils/primalite'
import EquationSecondDegre from '../../../modules/EquationSecondDegre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Factoriser un polynôme à l'aide des critères sur les racines entières et rationnelles"
export const dateDePublication = '30/09/2025'
export const interactifReady = false
export const uuid = 'a1eea'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mFctPoly1-1'],
}

/**
 * Factoriser un polynôme à l'aide des critères sur les racines entières et rationnelles.
 * @author Nathan Scheinmann
 */

export default class ExerciceFactorisePoly extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de racines',
      4,
      '1: Entières\n2: Rationnelles\n3: Réelles\n4: Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Coefficients entiers', true]
    this.besoinFormulaire3CaseACocher = [
      'Polynôme complètement factorisable',
      true,
    ]
    this.besoinFormulaire4CaseACocher = ['Se limiter au degré 3', true]
    this.sup = 4
    this.sup2 = true
    this.sup3 = true
    this.sup4 = true
    this.besoinFormulaire5CaseACocher = ['Avec une indication', true]
    this.nbQuestions = 3
    this.comment = `Cet exercice peut prendre un peu de temps à charger, car on force limite le nombre de candidats des racines à évaluer.`
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['entieres', 'rationnelles', 'reelles'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let fractionsDiviseurs: FractionEtendue[] = []
      let polynome: PolynomeFactorisable
      let termeConstant: FractionEtendue
      let termeDominant: FractionEtendue
      let polynomeEquivEntier: PolynomePlusieursVariables
      let degres: number

      do {
        degres = this.sup4 ? 3 : choice([3, 4])
        fractionsDiviseurs = []
        polynome = PolynomeFactorisable.creerPolynomeAleatoire(
          degres,
          listeTypeDeQuestions[i] as 'entieres' | 'rationnelles' | 'reelles',
          this.sup2 ? 'entier' : 'rationnel',
          this.sup3,
          1,
          0,
        )
        polynomeEquivEntier = polynome.polynomeEquivEntier

        termeConstant = polynomeEquivEntier.termes().slice(-1)[0].simplifie()
        termeDominant = polynomeEquivEntier.termes()[0].simplifie()
        polynomeEquivEntier.termes()[0].simplifie()
        const diviseursTermeConstant = listeDesDiviseurs(
          termeConstant.valeurAbsolue().num,
        )
        const diviseursTermeDominant = listeDesDiviseurs(
          termeDominant.valeurAbsolue().num,
        )

        for (const c of diviseursTermeConstant) {
          for (const d of diviseursTermeDominant) {
            const candidates = [
              new FractionEtendue(c, d),
              new FractionEtendue(-c, d),
            ]
            for (const fraction of candidates) {
              if (!fractionsDiviseurs.some((f) => f.isEqual(fraction))) {
                fractionsDiviseurs.push(fraction)
              }
            }
          }
        }
        fractionsDiviseurs.sort((a, b) => a.valeurDecimale - b.valeurDecimale)
      } while (
        (listeTypeDeQuestions[i] === 'relles' &&
          (fractionsDiviseurs.length > 3 * degres ||
            fractionsDiviseurs.length < 3)) ||
        (listeTypeDeQuestions[i] === 'entieres' &&
          fractionsDiviseurs.length > 4 * degres) ||
        (listeTypeDeQuestions[i] === 'rationnelles' &&
          this.sup3 &&
          fractionsDiviseurs.length > 4 * degres) ||
        (listeTypeDeQuestions[i] === 'rationnelles' &&
          !this.sup3 &&
          fractionsDiviseurs.length > 3 * degres)
      )

      if (this.sup5) {
        if (this.sup === 1) {
          this.consigne =
            `Indication${sp()}: utiliser le critère des racines entières.`
        } else {
          this.consigne =
            `Indication${sp()}: utiliser le critère des racines rationnelles.`
        }
      } else {
        this.consigne = ''
      }
      texte += `Factoriser autant que possible le polynôme $${polynome.toLatex()}$ sur $\\mathbb{R}$.\n`
      if (this.correctionDetaillee) {
        if (!this.sup2 && polynome.ppcm !== 1) {
          texteCorr += `On commence par multiplier le polynôme par le plus petit commun multiple des dénominateurs des coefficients, ici $${polynome.ppcm}$, ce qui ne change pas les racines du polynôme. On obtient donc le polynôme à coefficients entiers${sp()}: $P(x)=${polynomeEquivEntier.toString()}$.<br>`
        } else {
          texteCorr += `On pose $P(x)=${polynome.toLatex()}$.<br>`
        }
        if (this.sup5 && this.sup == 1) {
          texteCorr += `On cherche les racines entières à l'aide du critère des racines entières${sp()}: <br> Si une racine entière existe, alors elle est de la forme $\\pm d$ où $d$ divise le terme constant $${termeConstant.texFraction}$.<br> Les diviseurs de $${termeConstant.texFraction}$ sont${sp()}: $\\{\\pm${listeDesDiviseurs(termeConstant.valeurAbsolue().num).join('\\,;\\,\\pm')}\\}$, donc il faut tester les valeurs${sp()}: $\\{\\pm${listeDesDiviseurs(termeConstant.valeurAbsolue().num).join('\\,;\\,\\pm')}\\}$`
        } else {
          texteCorr += `On cherche les racines rationnelles à l'aide du critère des racines rationnelles${sp()}:<br>
          Si une racine rationnelle existe, alors est de la forme $\\pm \\dfrac{c}{d}$ où $c$ divise le terme constant $${termeConstant.texFraction}$ et $d$ divise le coefficient dominant $${termeDominant.texFraction}$.<br> Les diviseurs de $${termeConstant.texFraction}$ sont${sp()}: $\\{\\pm${listeDesDiviseurs(termeConstant.valeurAbsolue().num).join('\\,;\\,\\pm')}\\}$, et les diviseurs de $${termeDominant.texFraction}$ sont${sp()}: $\\{\\pm${listeDesDiviseurs(termeDominant.valeurAbsolue().num).join('\\,;\\,\\pm')}\\}$, donc il faut tester les valeurs${sp()}: `

          texteCorr += `$\\left\\{${fractionsDiviseurs.map((f) => f.toLatex()).join('\\,;\\,')}\\right\\}.$`
        }
        texteCorr += '<br><br>'
        const Qx = polynome.facteurSansRacineRationnelle.produit(
          new MonomePlusieursVariables(
            polynome.coeffDominant.multiplieEntier(polynome.ppcm),
            {
              variables: ['x'],
              exposants: [0],
            },
          ),
        )
        // Générer le tableau d'évaluations et trouver les racines
        const { tableauLatex, racines } =
          polynomeEquivEntier.tableauEvaluations(fractionsDiviseurs, 'x', 4)
        texteCorr += `On évalue $P(x)$ pour chaque candidat${sp()}:<br><br>$${tableauLatex}$<br><br>`

        if (racines.length > 0) {
          texteCorr += `L'ensemble des racines ${this.sup === 1 ? 'entières' : 'rationnelles'} est $\\left\\{${racines.map((r) => r.toLatex()).join('\\,;\\,')}\\right\\}$.<br><br>`

          // Cas où nb de racines = degré
          if (racines.length === degres) {
            texteCorr += `Comme on a trouvé $${degres}$ racine${degres > 1 ? 's' : ''} pour un polynôme de degré $${degres}$, on a déterminé tous les facteurs de $P(x)$ sur $\\mathbb{R}$${sp()}:<br>
            $${racines.map((r) => `\\left(x${ecritureAlgebrique(r.oppose())}\\right)`).join('\\,;\\,')}$<br>`
          } else {
            // Cas racines réelles : division polynomiale nécessaire
            texteCorr += `On pose $D(x)=${racines.map((r) => `\\left(x${ecritureAlgebrique(r.oppose())}\\right)`).join('')}${racines.length > 1 ? `=${PolynomePlusieursVariables.createPolynomeFromRoots(racines, new FractionEtendue(1, 1)).toString()}` : ''}$.<br>`
            // Application du théorème du reste nul
            texteCorr += `Par le théorème du reste nul, `
            if (racines.length === 1) {
              texteCorr += `$D(x)$ divise $P(x)$.`
            } else {
              texteCorr += `les monômes $${racines.map((r) => `\\left(x${ecritureAlgebrique(r.oppose())}\\right)`).join('\\text{ et } ')}$ divisent $P(x)$, donc $D(x)$ divise $P(x)$.`
            }
            texteCorr += ` On effectue la division polynomiale de $P(x)$ par $D(x)$.<br> On obtient que $P(x)=D(x) \\times Q(x)$ où $Q(x)=${Qx.toString()}$ est un polynôme de degré $2$.<br>`

            // Analyse du discriminant pour R(x)
            const equationR = EquationSecondDegre.aPartirDuPolynome(Qx)
            texteCorr += `Pour déterminer s'il existe d'autres racines réelles, on calcule le discriminant de $Q(x)$${sp()}: `
            texteCorr += `$\\Delta=${equationR.delta.toLatex()}$.<br>`

            if (equationR.delta.signe === -1) {
              texteCorr += `Comme $\\Delta < 0$, le polynôme $Q(x)$ n'a pas de racine réelle.<br>`
            } else if (equationR.delta.num === 0) {
              texteCorr += `Comme $\\Delta = 0$, le polynôme $Q(x)$ a une racine double réelle, elle vaut $${equationR.solutionsListeTex[0]}$.<br>
              On a que $(x${equationR.solutionsListeTexOppose[0]})^2$ est facteur de $P(x)$.<br>`
            } else {
              texteCorr += `Comme $\\Delta > 0$, le polynôme $Q(x)$ a deux racines réelles distinctes, l'ensemble de solutions est $${equationR.ensembleDeSolutionsTex}$.<br> On a que $(x${equationR.solutionsListeTexOppose[1]})$ et $(x${equationR.solutionsListeTexOppose[0]})$ sont des facteurs de $P(x)$.<br>`
            }
            texteCorr += `La somme des degrés des facteurs est $${polynome.coefficients.length - 1}$, ce qui implique que l'on a déterminé tous les facteurs de $P(x)$ sur $\\mathbb{R}$.<br>`
          }
          if (polynome.coeffDominant.toLatex() === '1') {
            texteCorr += `Puisque le coefficient dominant du polynôme vaut $1,$ la factorisation complète est${sp()}:<br>`
          } else {
            texteCorr += `On multiplie le produit des facteurs trouvés par le coefficient dominant ${!this.sup2 && polynome.ppcm !== 1 ? `du polynôme initial $${polynome.coeffDominant.toLatex()}$` : `$${termeDominant.toLatex()}$`} pour obtenir la factorisation complète${sp()}:<br>`
          }
        }
      }
      texteCorr += `<br>$
    ${polynome.toLatex()}=${miseEnEvidence(polynome.toLatex(true))}$.`
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
