// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d7e12 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 16/10/2026 (commit 6597d5e6e).
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  listeNombresPremiersStrictJusqua,
  premierAvec,
} from '../../lib/outils/primalite'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux fractions (dénominateurs non multiples)'
export const dateDePublication = '21/06/2026'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = 'd7e12'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * @author Jean-Claude Lhote
 */
export default class ExerciceComparerDeuxFractionsDenominateursNonMultiplesOld extends Exercice {
  constructor() {
    super()
    this.spacingCorr = 2.5
    this.nbQuestions = 5
    this.besoinFormulaireCaseACocher = ['Inclure des nombres négatifs', false]
    this.sup = false
    this.besoinFormulaire2Texte = [
      'Types de dénominateurs',
      '0: Mélange des deux cas suivants\n1: dénominateurs premiers entre eux\n2: dénominateurs non premiers entre eux',
    ]
    this.sup2 = '0'
  }
  nouvelleVersion() {
    this.consigne = 'Compare les fractions suivantes.'
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
      if (choice([true, false])) {
        texte = `$${f1.texFraction}$ et $${f2.texFraction}$`
      } else {
        texte = `$${f2.texFraction}$ et $${f1.texFraction}$`
      }
      switch (listeTypeDenominateurs[i]) {
        case 1:
          texteCorr += `Les deux fractions ont des dénominateurs premiers entre eux, pour trouver un dénominateur commun, on peut multiplier les deux dénominateurs entre eux.<br>
          $${f1.texFraction} = \\dfrac{${f1.num}\\times${f2.den}}{${f1.den}\\times${f2.den}}=${f1.reduire(f2.den).texFraction}$ et $${f2.texFraction} = \\dfrac{${f2.num}\\times${f1.den}}{${f2.den}\\times${f1.den}}=${f2.reduire(f1.den).texFSD}$<br>
          Or $${f1.reduire(f2.den).texFSD} ${f1.num * f2.den < f2.num * f1.den ? '<' : '>'} ${f2.reduire(f1.den).texFSD}$<br>`
          break
        case 2:
          texteCorr += `Les dénominateurs sont tous les deux des multiples de $${miseEnEvidence(`\\large${autrePremier}`, bleuMathalea)}$, en effet :<br>
          $${d1}=${miseEnEvidence(`\\large${premier1}`, bleuMathalea)}\\times${autrePremier}$ et $${d2}=${miseEnEvidence(`\\large${premier2}`, bleuMathalea)}\\times${autrePremier}$<br>
          Donc pour trouver un dénominateur commun, il suffit de multiplier ces 3 nombresentre eux : $${miseEnEvidence(`\\large${premier1}\\times\\large${premier2}\\times\\large${autrePremier}=\\large${autrePremier * premier1 * premier2}`, bleuMathalea)}$.<br>
          $${f1.texFraction} = \\dfrac{${f1.num}\\times${f2.den / autrePremier}}{${f1.den}\\times${f2.den / autrePremier}}=${f1.reduire(f2.den / autrePremier).texFSD}$ et $${f2.texFraction} = \\dfrac{${f2.num}\\times${f1.den / autrePremier}}{${f2.den}\\times${f1.den / autrePremier}}=${f2.reduire(f1.den / autrePremier).texFSD}$<br>
          Or $${f1.reduire(f2.den / autrePremier).texFSD} ${f1.num * (f2.den / autrePremier) < f2.num * (f1.den / autrePremier) ? '<' : '>'} ${f2.reduire(f1.den / autrePremier).texFSD}$<br>`
          break
      }
      /*   const ppcMultiple = ppcm(d1, d2)
      texteCorr += `On obtient donc :<br>
      $${f1.texFraction}= \\dfrac{${f1.num}\\times${ppcMultiple}}{${f1.den}\\times${ppcMultiple}}=${f1.reduire(ppcMultiple).texFraction}$ et $${f2.texFraction} = \\dfrac{${f2.num}\\times${ppcMultiple}}{${f2.den}\\times${ppcMultiple}}=${f2.reduire(ppcMultiple).texFraction}$<br>
      */
      texteCorr += `Donc $${miseEnEvidence(`${f1.texFraction} ${f1.inferieurstrict(f2) ? '<' : '>'} ${f2.texFraction}`)}$`

      if (this.questionJamaisPosee(i, d1, d2, num1, num2)) {
        this.autoCorrection[i] = {
          enonce: '',
          propositions: [
            {
              texte: `$${f1.texFraction} < ${f2.texFraction}$`,
              statut: f1.inferieurstrict(f2),
            },
            {
              texte: `$${f1.texFraction} > ${f2.texFraction}$`,
              statut: f2.inferieurstrict(f1),
            },
            {
              texte: `$${f1.texFraction} = ${f2.texFraction}$`,
              statut: f1.isEqual(f2),
            },
          ],
        }
        if (this.interactif) {
          const monQcm = propositionsQcm(this, i)
          texte += monQcm.texte
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
