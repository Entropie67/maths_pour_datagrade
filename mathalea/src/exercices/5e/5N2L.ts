import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { sommeDesTermesParSigne } from '../../lib/outils/calculs'
import {
  ecritureAlgebrique,
  ecritureAlgebriquec,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  nombreDeChiffresDansLaPartieEntiere,
  signe,
  triePositifsNegatifs,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import {
  stringNombre,
  texNombre,
  texNombreCoul,
} from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Effectuer un enchaînement d'additions et de soustractions de nombres relatifs"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Effectuer la somme ou la différence de plusieurs relatifs
 *
 * * On peut paramétrer les distances à zéro qui sont par défaut inférieures à 20
 * * On peut utiliser des écritures simplifiées (ce qui n'est pas le cas par défaut)
 * @author Rémi Angot modifications par Jean-claude Lhote (Correction optimisée par Éric Elter)
 */
export const uuid = 'f6ea7'

export const refs = {
  'fr-fr': ['5N2L'],
  'fr-2016': ['5R22'],
  'fr-ch': ['9R2NO3D-7', '9R3NO3D-7', '11CTNO1C-7', 'PRQNO06B-5', 'PRQNO13B-7', 'PRQNO15B-5'],
}
export default class ExerciceAdditionsSoustractionRelatifsV2 extends Exercice {
  constructor() {
    super()
    this.sup = 20

    this.sup2 = 1
    this.sup3 = false
    this.nbCols = 2
    this.nbColsCorr = 2
    this.nbQuestions = 6 // Pour que les colonnes soient équilibrées !
    this.listeAvecNumerotation = false
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2Numerique = [
      'Type de questions',
      5,
      '1 : Tous les nombres entre parenthèses, correction avec des parenthèses \n2 : Seuls les termes négatifs sont entre parenthèses, correction avec des parenthèses \n3 : Seuls les termes négatifs sont entre parenthèses, correction avec des écritures simplifiées \n4 : Écriture simplifiée \n5 : Tous les nombres entre parenthèses, correction  avec des écritures simplifiées',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec des nombres décimaux']
  }

  nouvelleVersion() {
    this.sup = contraindreValeur(8, 100, this.sup, 20)
    this.consigne = this.interactif
      ? 'Calculer (mentalement ou au brouillon) et indiquer seulement le résultat final.'
      : 'Calculer, en détaillant les calculs.'
    let relatifs
    let sommesSignees
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      relatifs = []
      sommesSignees = []
      const signeA = -1
      const signeB = choice([-1, 1])
      const signeC = signeA === -1 && signeB === -1 ? 1 : choice([-1, 1])

      const partieDecimaleAUnChiffre = combinaisonListes(
        [true, true, false],
        this.nbQuestions,
      )
      const CoefDecimales = this.sup3
        ? partieDecimaleAUnChiffre[i]
          ? 10
          : 100
        : 1
      const valeurMaximale = this.sup > 5 ? this.sup : 9
      const a0 =
        (randint(1, valeurMaximale * CoefDecimales) / CoefDecimales) * signeA
      const b0 =
        (randint(1, valeurMaximale * CoefDecimales) / CoefDecimales) * signeB
      const c0 =
        (randint(1, valeurMaximale * CoefDecimales) / CoefDecimales) * signeC
      const d0 =
        (randint(1, valeurMaximale * CoefDecimales) / CoefDecimales) *
        choice([-1, 1])
      const e0 =
        (randint(1, valeurMaximale * CoefDecimales) / CoefDecimales) *
        choice([-1, 1])

      const [a, b, c, d, e] = choice([
        shuffle([a0, b0, c0, d0, e0]),
        [a0, b0, c0, d0, e0],
      ])
      const s1 = choice([-1, 1])
      const s2 = choice([-1, 1])
      const s4 = choice([-1, 1])
      let s3
      if (s1 === 1 && s2 === 1) {
        // On s'assure que les 3 premières opérations ne sont pas identiques
        s3 = -1
      } else if (s1 === -1 && s2 === -1) {
        s3 = 1
      } else {
        s3 = choice([-1, 1])
      }
      const aa = a
      const bb = s1 * b
      const cc = s2 * c
      const dd = s3 * d
      const ee = s4 * e
      // On a défini les 5 nombres (avec signes intégrés pour la version écriture simplifiée) aa / bb / cc / dd / ee
      // en écriture non simplifiée on utilies a / s1 / b s2 / c / s3 / d / s4 / e.
      switch (this.sup2) {
        case 1:
          texte = `$ ${lettreDepuisChiffre(i + 1)} =  ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(c)}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$`
          if (this.interactif && context.isHtml) {
            texte +=
              `$ ${sp(1)} = $` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          }
          if (!context.isHtml && !context.isAmc) {
            texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
          }
          texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(c)}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$`
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureNombreRelatifc(aa)}+${ecritureNombreRelatifc(bb)}+${ecritureNombreRelatifc(cc)}+${ecritureNombreRelatifc(dd)}+${ecritureNombreRelatifc(ee)} $`
          relatifs = triePositifsNegatifs([aa, bb, cc, dd, ee])

          if (relatifs[0] > 0 && relatifs[4] < 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureNombreRelatifc(relatifs[0])}+${ecritureNombreRelatifc(relatifs[1])}+${ecritureNombreRelatifc(relatifs[2])}+${ecritureNombreRelatifc(relatifs[3])}+${ecritureNombreRelatifc(relatifs[4])} $`
          }
          sommesSignees = sommeDesTermesParSigne([
            relatifs[0],
            relatifs[1],
            relatifs[2],
            relatifs[3],
            relatifs[4],
          ])
          if (sommesSignees[0] !== 0 && sommesSignees[1] !== 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureNombreRelatifc(sommesSignees[0])}+${ecritureNombreRelatifc(sommesSignees[1])} $`
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureAlgebriquec(aa + bb + cc + dd + ee, orangeMathalea)} $<br>`
          } else if (sommesSignees[0] !== 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommesSignees[0], orangeMathalea)}$`
          } else {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommesSignees[1], orangeMathalea)}$<br>`
          }
          break
        case 2:
          /// texNombreCoul (nombre: number | Decimal, positif = 'green', negatif = 'red', nul = 'black', precision: number)
          texte = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)}${signe(s1)}${ecritureParentheseSiNegatif(b)}${signe(s2)}${ecritureParentheseSiNegatif(c)}${signe(s3)}${ecritureParentheseSiNegatif(d)}${signe(s4)}${ecritureParentheseSiNegatif(e)}$`
          if (this.interactif && context.isHtml) {
            texte +=
              `$${sp(1)} = $` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          }
          if (!context.isHtml && !context.isAmc) {
            texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
          }
          texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(c)}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$`
          texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${texNombreCoul(a, bleuMathalea, 'green', 'black', 2)}+${ecritureNombreRelatifc(bb)}+${ecritureNombreRelatifc(cc)}+${ecritureNombreRelatifc(dd)}+${ecritureNombreRelatifc(ee)} $`
          relatifs = triePositifsNegatifs([aa, bb, cc, dd, ee])
          if (relatifs[0] > 0 && relatifs[4] < 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${texNombreCoul(relatifs[0], bleuMathalea, 'green', 'black', 2)}+${ecritureNombreRelatifc(relatifs[1])}+${ecritureNombreRelatifc(relatifs[2])}+${ecritureNombreRelatifc(relatifs[3])}+${ecritureNombreRelatifc(relatifs[4])} $`
          }
          sommesSignees = sommeDesTermesParSigne([
            relatifs[0],
            relatifs[1],
            relatifs[2],
            relatifs[3],
            relatifs[4],
          ])
          if (sommesSignees[0] !== 0 && sommesSignees[1] !== 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${texNombreCoul(sommesSignees[0], bleuMathalea, 'green', 'black', 2)}+${ecritureNombreRelatifc(sommesSignees[1])} $`
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}= ${ecritureAlgebriquec(aa + bb + cc + dd + ee, orangeMathalea)} $<br>`
          } else if (sommesSignees[0] !== 0) {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommesSignees[0], orangeMathalea)}$`
          } else {
            texteCorr += `<br>$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommesSignees[1], orangeMathalea)}$<br>`
          }
          break

        case 3: {
          /// texNombreCoul (nombre: number | Decimal, positif = 'green', negatif = 'red', nul = 'black', precision: number)
          texte = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)}${signe(s1)}${ecritureParentheseSiNegatif(b)}${signe(s2)}${ecritureParentheseSiNegatif(c)}${signe(s3)}${ecritureParentheseSiNegatif(d)}${signe(s4)}${ecritureParentheseSiNegatif(e)}$`
          if (this.interactif && context.isHtml) {
            texte +=
              `$${sp(1)} = $` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          }
          if (!context.isHtml && !context.isAmc) {
            texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
          }
          texteCorr = `$ ${lettreDepuisChiffre(i + 1)} =  ${texNombre(a, 2)}${signe(s1)}${ecritureParentheseSiNegatif(b)}${signe(s2)}${ecritureParentheseSiNegatif(c)}${signe(s3)}${ecritureParentheseSiNegatif(d)}${signe(s4)}${ecritureParentheseSiNegatif(e)}$<br>`
          relatifs = triePositifsNegatifs([aa, bb, cc, dd, ee])
          texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(aa, bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(bb)}${ecritureAlgebriquec(cc)}${ecritureAlgebriquec(dd)}${ecritureAlgebriquec(ee)}$<br>`
          if (
            sommeDesTermesParSigne([a, bb, cc, dd, ee])[0] !== 0 &&
            sommeDesTermesParSigne([a, bb, cc, dd, ee])[1] !== 0
          ) {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(relatifs[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(relatifs[1])}${ecritureAlgebriquec(relatifs[2])}${ecritureAlgebriquec(relatifs[3])}${ecritureAlgebriquec(relatifs[4])}$<br>`
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(sommeDesTermesParSigne([a, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1])}$<br>`
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(a + bb + cc + dd + ee, bleuMathalea, orangeMathalea, 'black', 2)} $`
          } else if (sommeDesTermesParSigne([a, bb, cc, dd, ee])[0] !== 0) {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(sommeDesTermesParSigne([a, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}$`
          } else {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommeDesTermesParSigne([a, bb, cc, dd, ee])[1], orangeMathalea)}$`
          }
          break
        }
        case 4:
          texte = `$ ${lettreDepuisChiffre(i + 1)} = ${texNombre(aa, 2)}${ecritureAlgebrique(bb)}${ecritureAlgebrique(cc)}${ecritureAlgebrique(dd)}${ecritureAlgebrique(ee)}$`
          if (this.interactif && context.isHtml) {
            texte +=
              `$${sp(1)} = $` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          }
          if (!context.isHtml && !context.isAmc) {
            texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
          }
          relatifs = triePositifsNegatifs([aa, bb, cc, dd, ee])
          texteCorr = `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(a, bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(bb)}${ecritureAlgebriquec(cc)}${ecritureAlgebriquec(dd)}${ecritureAlgebriquec(ee)}$<br>`
          texteCorr += `$${lettreDepuisChiffre(i + 1)}=`
          if (
            sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0] !== 0 &&
            sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1] !== 0
          ) {
            texteCorr += `${texNombreCoul(relatifs[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(relatifs[1])}${ecritureAlgebriquec(relatifs[2])}${ecritureAlgebriquec(relatifs[3])}${ecritureAlgebriquec(relatifs[4])}$<br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)}=`
            texteCorr += `${texNombreCoul(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1])}$<br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)}=`
            texteCorr += `${texNombreCoul(aa + bb + cc + dd + ee, bleuMathalea, orangeMathalea, 'black', 2)} $`
          } else if (sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0] !== 0) {
            texteCorr += `${texNombreCoul(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}$`
          } else {
            texteCorr += `${ecritureAlgebriquec(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1], bleuMathalea)}$`
          }
          break
        case 5:
        default:
          texte = `$ ${lettreDepuisChiffre(i + 1)} =  ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(c)}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$`
          if (this.interactif && context.isHtml) {
            texte +=
              `$ ${sp(1)} = $` +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          }
          if (!context.isHtml && !context.isAmc) {
            texte += `<br>$ ${lettreDepuisChiffre(i + 1)} =$`
          }
          texteCorr = `$ ${lettreDepuisChiffre(i + 1)} = ${ecritureNombreRelatif(a)}${signe(s1)}${ecritureNombreRelatif(b)}${signe(s2)}${ecritureNombreRelatif(c)}${signe(s3)}${ecritureNombreRelatif(d)}${signe(s4)}${ecritureNombreRelatif(e)}$<br>`
          relatifs = triePositifsNegatifs([a, bb, cc, dd, ee])
          texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(aa, bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(bb)}${ecritureAlgebriquec(cc)}${ecritureAlgebriquec(dd)}${ecritureAlgebriquec(ee)}$<br>`

          if (
            sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0] !== 0 &&
            sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1] !== 0
          ) {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(relatifs[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(relatifs[1])}${ecritureAlgebriquec(relatifs[2])}${ecritureAlgebriquec(relatifs[3])}${ecritureAlgebriquec(relatifs[4])}$<br>`
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}${ecritureAlgebriquec(sommeDesTermesParSigne([aa, bb, cc, dd, ee])[1])}$<br>`
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(aa + bb + cc + dd + ee, bleuMathalea, orangeMathalea, 'black', 2)} $`
          } else if (sommeDesTermesParSigne([aa, bb, cc, dd, ee])[0] !== 0) {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${texNombreCoul(sommeDesTermesParSigne([a, bb, cc, dd, ee])[0], bleuMathalea, orangeMathalea, 'black', 2)}$`
          } else {
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)}=${ecritureAlgebriquec(sommeDesTermesParSigne([a, bb, cc, dd, ee])[1], orangeMathalea)}$`
          }
          break
      }
      if (this.questionJamaisPosee(i, aa, bb, cc, dd, ee)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: stringNombre(aa + bb + cc + dd + ee, 2),
            options: { nombreDecimalSeulement: true },
          },
        })
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            options: { multicols: true },
            propositions: [
              {
                type: 'AMCOpen',

                propositions: [
                  {
                    enonce: this.consigne + '<br>' + texte,
                    texte: texteCorr,
                    statut: 3,
                    pointilles: true,
                  },
                ],
              },
              {
                type: 'AMCNum',

                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: 'Résultat',
                      valeur: [aa + bb + cc + dd + ee],
                      param: {
                        digits: Math.max(
                          2,
                          nombreDeChiffresDansLaPartieEntiere(
                            aa + bb + cc + dd + ee,
                          ),
                        ),
                        decimals: 0,
                        signe: true,
                        exposantNbChiffres: 0,
                        exposantSigne: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
