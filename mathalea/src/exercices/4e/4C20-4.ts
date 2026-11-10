import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import {
  listeNombresPremiersStrictJusqua,
  premierAvec,
} from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux fractions (dénominateurs non multiples)'
export const dateDePublication = '21/06/2026'
export const dateDeModifImportante = '21/10/2026'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = '7cf43'
export const refs = {
  'fr-fr': ['4C20-4'],
  'fr-ch': ['9R2NO4H-12', '9R3NO4H-12', 'PRQNO05B-12'],
}
/**
 * @author Jean-Claude Lhote
 */
export default class ExerciceComparerDeuxFractionsDenominateursNonMultiples extends Exercice {
  constructor() {
    super()
    this.spacingCorr = 2.5
    this.nbQuestions = 5
    this.besoinFormulaireCaseACocher = ['Inclure des nombres négatifs', false]
    this.sup = false
    this.besoinFormulaire2Texte = [
      'Types de dénominateurs',
      '0: Mélange des deux cas suivants\n1: Dénominateurs premiers entre eux\n2: Dénominateurs non premiers entre eux',
    ]
    this.sup2 = '0'
    this.besoinFormulaire3CaseACocher = [
      'Liste déroulante à la place du QCM',
      false,
    ]
    this.sup3 = false
  }

  nouvelleVersion() {
    // La liste déroulante n'a de sens qu'en interactif : la case est masquée sinon.
    this.besoinFormulaire3CaseACocher = this.interactif
      ? ['Liste déroulante à la place du QCM', false]
      : false
    this.consigne = 'Comparer les fractions suivantes.'
    const listeTypeDenominateurs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      min: 1,
      defaut: 0,
      melange: 0,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let d1 = 1
      let d2 = 1

      const premier1 = choice(listeNombresPremiersStrictJusqua(10))
      const premier2 = choice(listeNombresPremiersStrictJusqua(10), premier1)
      const autrePremier = premierAvec(premier1)
      switch (listeTypeDenominateurs[i]) {
        case 1:
          d1 = randint(3, 15)
          d2 = premierAvec(d1)
          break
        case 2:
        default:
          d1 = premier1 * autrePremier
          d2 = premier2 * autrePremier
          break
      }
      const [min, max] = choice([
        [0, 1],
        [1, 2],
        [2, 3],
      ])
      const signe = this.sup ? choice([-1, 1]) : 1

      const num1 = randint(min * d1 + 1, max * d1 - 1) * signe
      const num2 = randint(min * d2 + 1, max * d2 - 1) * signe
      const f1 = num1 / d1 < num2 / d2 ? fraction(num1, d1) : fraction(num2, d2)
      const f2 = num1 / d1 < num2 / d2 ? fraction(num2, d2) : fraction(num1, d1)
      let texte = ''
      let texteCorr = ''
      // Avec la liste déroulante, le symbole se place entre les deux fractions :
      // la bonne réponse dépend donc de l'ordre d'affichage.
      const petiteFractionDabord = choice([true, false])
      const [fractionGauche, fractionDroite] = petiteFractionDabord
        ? [f1, f2]
        : [f2, f1]
      // Hors interactivité, la case est sans effet : l'énoncé reste « … et … ».
      const listeDeroulante = this.sup3 && this.interactif && !context.isAmc
      texte = `$${fractionGauche.texFSD}$ et $${fractionDroite.texFSD}$`
      switch (listeTypeDenominateurs[i]) {
        case 1:
          texteCorr += `Les deux fractions ont des dénominateurs premiers entre eux, pour trouver un dénominateur commun, on peut multiplier les deux dénominateurs entre eux.<br>
          $${f1.texFSD} = ${f1.s === -1 ? '-' : ''} \\dfrac{${abs(f1.num)}\\times${f2.den}}{${f1.den}\\times${f2.den}}=${f1.reduire(f2.den).texFSD}$ et $${f2.texFSD} =${f2.s === -1 ? '-' : ''} \\dfrac{${abs(f2.num)}\\times${f1.den}}{${f2.den}\\times${f1.den}}=${f2.reduire(f1.den).texFSD}$<br>
          Or, $${f1.reduire(f2.den).texFSD} ${f1.num * f2.den < f2.num * f1.den ? '<' : '>'} ${f2.reduire(f1.den).texFSD}$.<br>`
          break
        case 2:
          texteCorr += `Les dénominateurs sont tous les deux des multiples de $${miseEnEvidence(`${autrePremier}`, bleuMathalea)}$, en effet :<br>
          $${d1}=${miseEnEvidence(`${premier1}`, bleuMathalea)}\\times${autrePremier}$ et $${d2}=${miseEnEvidence(`${premier2}`, bleuMathalea)}\\times${autrePremier}$<br>
          Donc pour trouver un dénominateur commun, il suffit de multiplier ces $3$ nombres entre eux : $${miseEnEvidence(`${premier1}\\times${premier2}\\times${autrePremier}=${autrePremier * premier1 * premier2}`, bleuMathalea)}$.<br>
          $${f1.texFSD} = ${f1.s === -1 ? '-' : ''} \\dfrac{${abs(f1.num)}\\times${f2.den / autrePremier}}{${f1.den}\\times${f2.den / autrePremier}}=${f1.reduire(f2.den / autrePremier).texFSD}$ et $${f2.texFSD} =${f2.s === -1 ? '-' : ''} \\dfrac{${abs(f2.num)}\\times${f1.den / autrePremier}}{${f2.den}\\times${f1.den / autrePremier}}=${f2.reduire(f1.den / autrePremier).texFSD}$<br>
          Or, $${f1.reduire(f2.den / autrePremier).texFSD} ${f1.num * (f2.den / autrePremier) < f2.num * (f1.den / autrePremier) ? '<' : '>'} ${f2.reduire(f1.den / autrePremier).texFSD}$.<br>`
          break
      }
      // La conclusion suit l'ordre d'affichage avec la liste déroulante.
      const [premiere, seconde] = listeDeroulante
        ? [fractionGauche, fractionDroite]
        : [f1, f2]
      const symbole = premiere.inferieurstrict(seconde) ? '<' : '>'
      texteCorr += `Donc $${miseEnEvidence(`${premiere.texFSD} ${symbole} ${seconde.texFSD}`)}.$`

      if (this.questionJamaisPosee(i, d1, d2, num1, num2)) {
        if (listeDeroulante) {
          const symboleChoisi = choixDeroulant(this, i, {
            choices: [
              { label: '?', value: '' },
              { latex: '<', value: '<' },
              { latex: '>', value: '>' },
              { latex: '=', value: '=' },
            ],
          })
          texte = `$${fractionGauche.texFSD}$${sp(2)}${symboleChoisi}${sp(2)}$${fractionDroite.texFSD}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: symbole } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else {
          this.autoCorrection[i] = {
            enonce: '',
            propositions: [
              {
                texte: `$${f1.texFSD} < ${f2.texFSD}$`,
                statut: f1.num / f1.den < f2.num / f2.den,
              },
              {
                texte: `$${f1.texFSD} > ${f2.texFSD}$`,
                statut: f1.num / f1.den > f2.num / f2.den,
              },
              {
                texte: `$${f1.texFSD} = ${f2.texFSD}$`,
                statut: f1.num / f1.den === f2.num / f2.den,
              },
            ],
          }
          if (this.interactif) {
            const monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
          }
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
