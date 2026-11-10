import { grille, seyes } from '../../lib/2d/Grille'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { additionMultiplePosee } from '../../modules/operations' // Adaptez le chemin selon votre structure de dossiers
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'

export const interactifReady = true

export const titre = 'Poser additions de plus de deux nombres décimaux'
export const dateDePublication = '04/01/2025'
/**
 * Additions de plus de deux nombres décimaux
 * xxx + xx,x + xx,xx + xx9,x + xxx,xx
 * @author Mireille Gain

 */
export const uuid = '15841'

export const refs = {
  'fr-fr': ['6N2A-2'],
  'fr-2016': ['6C20'],
  'fr-ch': ['9R1NO7A-2', '9R2NO7A-2', '9R3NO7A-2', 'PRQNO06A-8'],
}
export default class AdditionnerSoustrairesDecimaux extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon les opérations posées ne sont pas jolies
    this.nbQuestions = 4
    this.sup = 3
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Poser et effectuer le calcul suivant'
        : 'Poser et effectuer les calculs suivants'
    this.consigne += ' en une seule opération.'
    let typesDeQuestions, reponse
    const typesAdditions = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    const listeTypeDeQuestions = []

    for (let i = 0; i < this.nbQuestions; i++) {
      this.autoCorrection[i] = {}
      listeTypeDeQuestions.push(typesAdditions[i])
    }

    let grilletxt
    if (this.sup2 < 3) {
      const g = this.sup2 < 3 ? grille(0, 0, 5, 5, 'gray', 0.7) : vide2d()
      const carreaux = this.sup2 === 2 ? seyes(0, 0, 5, 5) : vide2d()
      const sc = this.sup2 === 2 ? 0.8 : 0.5
      const params = {
        xmin: 0,
        ymin: 0,
        xmax: 5,
        ymax: 5,
        pixelsParCm: 20,
        scale: sc,
      }
      grilletxt = '<br>' + mathalea2d(params, g, carreaux)
    } else {
      grilletxt = ''
    }
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let e = 0
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: // xxx + xx,x + xx,xx + xx9,x + xxx,xx
          a = randint(1, 4) * 100 + randint(2, 5) * 10 + randint(1, 9)
          b = arrondi(randint(5, 9) * 10 + randint(6, 9) + randint(1, 9) / 10)
          c = arrondi(
            randint(5, 9) * 10 +
              randint(6, 9) +
              randint(1, 9) / 10 +
              randint(1, 9) / 100,
          )
          d =
            randint(1, 4) * 100 +
            arrondi(randint(5, 9) * 10 + 9 + randint(1, 9) / 10)
          e =
            randint(1, 4) * 100 +
            randint(5, 9) * 10 +
            randint(6, 9) +
            arrondi(randint(1, 9) / 10 + randint(1, 9) / 100)
          texte = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}+${texNombre(e)}$`
          reponse = arrondi(a + b + c + d + e)
          texteCorr = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}+${texNombre(e)}=${miseEnEvidence(texNombre(arrondi(a + b + c + d + e)))}$<br>\n`
          texteCorr += additionMultiplePosee([a, b, c, d, e], {
            retenuesOn: true,
            calculer: true,
          })
          break

        case 2: // xx,x + xxx + xx,xx + x
          a = arrondi(randint(5, 9) * 10 + randint(6, 9) + randint(1, 9) / 10)
          b = randint(1, 4) * 100 + randint(2, 5) * 10 + randint(1, 9)
          c = arrondi(
            randint(5, 9) * 10 +
              randint(6, 9) +
              randint(1, 9) / 10 +
              randint(1, 9) / 100,
          )
          d = randint(1, 9)
          texte = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}$`
          reponse = arrondi(a + b + c + d)
          texteCorr = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}=${miseEnEvidence(texNombre(arrondi(a + b + c + d)))}$<br>\n`
          texteCorr += additionMultiplePosee([a, b, c, d], {
            retenuesOn: true,
            calculer: true,
          })

          break

        case 3: // xx,xx + x + xx,x
          a = arrondi(
            randint(5, 9) * 10 +
              randint(6, 9) +
              randint(1, 9) / 10 +
              randint(1, 9) / 100,
          )
          b = randint(1, 9)
          c = arrondi(randint(5, 9) * 10 + randint(6, 9) + randint(1, 9) / 10)
          texte = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}$`
          reponse = arrondi(a + b + c)
          texteCorr = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}=${miseEnEvidence(texNombre(arrondi(a + b + c)))}$<br>\n`
          texteCorr += additionMultiplePosee([a, b, c], {
            retenuesOn: true,
            calculer: true,
          })

          break

        case 4: // xx,x + xx,xx + xxx + x,x
        default:
          a = arrondi(randint(5, 9) * 10 + randint(6, 9) + randint(1, 9) / 10)
          b = arrondi(
            randint(5, 9) * 10 +
              randint(6, 9) +
              randint(1, 9) / 10 +
              randint(1, 9) / 100,
          )
          c = randint(1, 4) * 100 + randint(2, 5) * 10 + randint(1, 9)
          d = arrondi(randint(6, 9) + randint(1, 9) / 10)
          texte = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}$`
          reponse = arrondi(a + b + c + d)
          texteCorr = `$${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}=${miseEnEvidence(texNombre(arrondi(a + b + c + d)))}$<br>\n`
          texteCorr += additionMultiplePosee([a, b, c, d], {
            retenuesOn: true,
            calculer: true,
          })
      }

      texte += grilletxt
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.interactif && context.isHtml)
        texte +=
          '$~=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          reponse: {
            valeur: reponse,
            texte: texteCorr,
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits =
          nombreDeChiffresDansLaPartieEntiere(reponse) +
          nombreDeChiffresDansLaPartieDecimale(reponse) +
          2
        amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(reponse) + 1
        amcParam.signe = false
        amcParam.exposantNbChiffres = 0
      }
      if (this.questionJamaisPosee(i, a, b, c, d, e)) {
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
