import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la fraction d'un nombre"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModificationImportante = '03/06/2026'

/**
 * Calculer la fraction d'un nombre divisible par le dénominateur ... ou pas.
 *
 * Par défaut la division du nombre par le dénominateur est inférieure à 11
 * @author Rémi Angot + Jean-claude Lhote
 */
export const uuid = 'ddb83'

export const refs = {
  'fr-fr': ['6N3L'],
  'fr-2016': ['6N33'],
  'fr-ch': ['9R1NO4I-5', '9R2NO4I-5', '9R3NO4I-5', '10CTNO3D-1', '10LCNO3D-1', '10LSNO3D-1', 'PRQNO15B-8'],
}
export default class FractionDUnNombre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Forcer résultat entier', true]
    this.besoinFormulaire2CaseACocher = ['Plusieurs méthodes', false]
    this.nbQuestions = 5

    this.spacingCorr = context.isHtml ? 3.5 : 2
    this.spacing = 2

    this.sup = true
    this.sup2 = false
    this.nbCols = 2
  }

  nouvelleVersion() {
    this.consigne = this.sup
      ? 'Donner la valeur décimale (ou entière) '
      : 'Donner la valeur '
    this.consigne +=
      this.nbQuestions === 1 ? 'du calcul suivant.' : 'des calculs suivants.'
    if (!this.sup)
      this.consigne +=
        "<br>La réponse doit être fournie sous forme fractionnaire, seulement s'il n'y a pas de réponse décimale (ou entière)."

    const listeFractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ] // Couples de nombres premiers entre eux

    for (
      let i = 0, a, b, k, n, j, fraction, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      fraction = choice(listeFractions)
      a = fraction[0]
      b = fraction[1]
      k = randint(1, 11)
      j = false
      if (this.sup || context.isAmc) n = b * k
      else if (randint(0, 1) === 0) n = b * k
      else n = randint(10, b * 11)
      texte = `$${texFractionFromString(a, b)}\\times${n}$`
      texteCorr = ''
      if (a === 1) {
        // Si n * 1/b
        if (n / b - arrondi(n / b, 4) === 0) {
          texteCorr += `$${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${miseEnEvidence(b, bleuMathalea)}\\times${texNombre(
            n / b,
          )}=1\\times${texNombre(n / b)}=${texNombre(n / b)}$<br>`
          texteCorr += `$${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=${n}\\div${miseEnEvidence(b, bleuMathalea)}=${texNombre(
            n / b,
          )}$`
        } else {
          const frac = new FractionEtendue(n, b)
          // si résultat non décimal
          texteCorr += `$${texFractionFromString(a, b)}\\times${n}=${frac.estIrreductible ? frac.texFraction : frac.texSimplificationAvecEtapes()}$`
        }
      } else {
        if (n / b - arrondi(n / b, 4) === 0) {
          // si n/b décimal calcul (n/b)*a
          texteCorr += `$${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${miseEnEvidence(b, bleuMathalea)}\\times${texNombre(
            n / b,
          )}=${a}\\times${texNombre(n / b)}=${texNombre((a * n) / b)}$<br>`
          texteCorr += `$${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=(${n}\\div${miseEnEvidence(
            b,
            bleuMathalea,
          )})\\times${a}=${texNombre(
            n / b,
          )}\\times${a}=${texNombre((n / b) * a)}$<br>`
        } else {
          if ((n * a) / b - arrondi((n * a) / b, 4) === 0) {
            // EE : Ne se produit jamais
            // si n/b non décimal, alors on se rabat sur (n*a)/b
            texteCorr += `$${texFractionFromString(
              a,
              miseEnEvidence(b, bleuMathalea),
            )}\\times${n}=(${n}\\times${a})\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${n * a}\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${texNombre((n / b) * a)}$<br>`
          } else {
            // si autre méthode et résultat fractionnaire calcul (n*a)/b
            texteCorr += `$${texFractionFromString(
              a,
              miseEnEvidence(b, bleuMathalea),
            )}\\times${n}=(${n}\\times${a})\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${n * a}\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${texFractionFromString(n * a, b)}$<br>`
          }
          j = true
        }
        if ((n * a) / b - arrondi((n * a) / b, 4) === 0 && this.sup2 && !j) {
          // Si autres méthodes et si (a*n)/b décimal calcul (n*a)/b
          texteCorr += ` $${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=(${n}\\times${a})\\div${miseEnEvidence(
            b,
            bleuMathalea,
          )}=${n * a}\\div${miseEnEvidence(b, bleuMathalea)}=${texNombre(
            (n / b) * a,
          )}$<br>`
        } else {
          // si autre méthode et résultat fractionnaire calcul (n*a)/b
          if (this.sup2 && !j) {
            texteCorr += ` $${texFractionFromString(
              a,
              miseEnEvidence(b, bleuMathalea),
            )}\\times${n}=(${n}\\times${a})\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${n * a}\\div${miseEnEvidence(
              b,
              bleuMathalea,
            )}=${texFractionFromString(n * a, miseEnEvidence(b, bleuMathalea))}$<br>`
          }
        }
        // si autre méthode et a/b décimal calcul (a/b)*n
        if (
          (b === 2 || b === 4 || b === 5 || b === 8 || b === 10) &&
          this.sup2
        ) {
          texteCorr += ` $${texFractionFromString(
            a,
            miseEnEvidence(b, bleuMathalea),
          )}\\times${n}=(${a}\\div${miseEnEvidence(
            b,
            bleuMathalea,
          )})\\times${n}=${texNombre(
            a / b,
          )}\\times${n}=${texNombre((n / b) * a)}$`
        }
      }

      handleAnswers(this, i, { reponse: { value: (n * a) / b } })
      if ((n * a) % b !== 0 && !context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: new FractionEtendue(n * a, b).texFraction,
          },
        })
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        { texteAvant: sp() + '$=$' },
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce = texte
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [
          { texte: texteCorr, statut: false },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits = 2
        amcParam.decimals = 0
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
