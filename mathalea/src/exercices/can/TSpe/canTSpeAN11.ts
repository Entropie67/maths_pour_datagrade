import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

import { rienSi1 } from '../../../lib/outils/ecritures'

export const titre = 'Calculer avec la fonction logarithme'
export const dateDePublication = '22/7/2024'
export const uuid = 'b9c63'
export const interactifReady = true

export const refs = {
  'fr-fr': ['canTSpeAN11'],
  'fr-ch': [],
}

/**
 *
 * @author  Jean-claude Lhote

 */
export default class CalculsLog extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'ln'
    this.nbQuestions = 1
    this.consigne = 'Calculer.'
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de question ',
      'Nombres séparés par des tirets  :\n1 : Logarithme(a^n)\n2 : Logarithme(1/a^n)\n3 : Exponentiation\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Type de logarithme', false]
    this.comment = 'Exercice de calculs de logarithmes'
  }

  nouvelleVersion() {
    if (this.sup2) this.version = 'ln'
    else this.version = 'log'
    const logString = this.version !== 'ln' ? '\\log' : '\\ln'
    const base = this.version !== 'ln' ? '10' : 'e'

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map((el) => Number(el))

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte: string
      let texteCorr: string
      let answer: string
      const n = randint(1, 7)
      if (listeTypeQuestions[i] < 3) {
        // log(a^n) ou log(1/a^n)
        if (listeTypeQuestions[i] === 1) {
          if (n === 1) {
            texte = `${logString} ${base}`
            texteCorr = `$${texte}=1$`
            answer = '1'
          } else if (n < 6) {
            texte = `${logString}(${base}^${n})`
            texteCorr = `$${texte}=${n}${logString} ${base}=${n}$`
            answer = String(n)
          } else {
            if (n === 6) {
              texte = `${logString}(\\sqrt{${base}})`
              texteCorr = `$${texte}=${logString}(${base}^{\\frac{1}{2}})=\\dfrac{1}{2}${logString} ${base}=\\dfrac{1}{2}$`
              answer = '\\frac12'
            } else {
              texte = `${logString}(\\sqrt[3]{${base}})`
              texteCorr = `$${texte}=${logString}(${base}^{\\frac{1}{3}})=\\dfrac{1}{3}${logString} ${base}=\\dfrac{1}{3}$`
              answer = '\\frac13'
            }
          }
        } else {
          if (n === 1) {
            texte = `${logString}(\\dfrac{1}{${base}})`
            texteCorr = `$${texte}=-1$`
            answer = '-1'
          } else if (n < 6) {
            if (choice([true, false])) {
              texte = `${logString}(\\dfrac{1}{${base}^${n}})`
              texteCorr = `$${texte}=${logString}(${base}^{${-n}})=${-n}${logString} ${base}=${-n}$`
            } else {
              if (base === 'e') {
                texte = `${logString}(\\mathrm{e}^{${-n}})`
                texteCorr = `$${texte}=${-n}${logString} (\\mathrm{e})=${-n}$`
              } else {
                texte = `${logString}(${texNombre(10 ** -n, 5)})`
                texteCorr = `$${texte}=${logString}(${base}^{${-n}})=${-n}${logString} ${base}=${-n}$`
              }
            }
            answer = String(-n)
          } else {
            if (n === 6) {
              texte = `${logString}(\\dfrac{1}{\\sqrt{${base}}})`
              texteCorr = `$${texte}=${logString}(${base}^{-\\frac{1}{2}})=-\\dfrac{1}{2}${logString} ${base}=-\\dfrac{1}{2}$`
              answer = '-\\frac12'
            } else {
              texte = `${logString}(\\dfrac{1}{\\sqrt[3]{${base}}})`
              texteCorr = `$${texte}=${logString}(${base}^{-\\frac{1}{3}})=-\\dfrac{1}{3}${logString} ${base}=-\\dfrac{1}{3}$`
              answer = '-\\frac13'
            }
          }
        }
      } else {
        // exponentiation
        const signe = choice([-1, 1]) // placé devant le ln|log
        const exposant = choice([-1, 1]) // exposant de la base dans le ln|log
        if (n === 1) {
          texte = `${base}^{${rienSi1(signe)}${logString} ${n}}`
          texteCorr = `$${texte}=${base}^0=1$`
          answer = '1'
        } else if (n < 6) {
          texte = `${base}^{${rienSi1(signe)}${logString} ${exposant === 1 ? `${n}` : `\\frac{1}{${n}}`}}`
          texteCorr = `$${texte}=${
            signe === 1
              ? `${exposant === 1 ? String(n) : `\\dfrac{1}{${n}}`}$`
              : `\\dfrac{1}{${base}^{${logString} ${exposant === 1 ? `${n}` : `\\frac{1}{${n}}`}}}=${exposant === 1 ? `\\dfrac{1}{${n}}` : `\\dfrac{1}{\\dfrac{1}{${n}}}=${n}`}$`
          }`
          answer =
            signe === 1
              ? exposant === 1
                ? String(n)
                : `\\frac1${n}`
              : exposant === 1
                ? `\\frac1${n}`
                : String(n)
        } else {
          if (n === 6) {
            texte = `${base}^{${rienSi1(signe)}${logString} \\sqrt{${n}}}`
            texteCorr = `$${texte}=${
              signe === 1
                ? `${base}^{\\frac{1}{2}${logString} ${n}}=(${base}^{${logString} ${n}})^{\\frac{1}{2}}=${n}^{\\frac{1}{2}}=\\sqrt{${n}}$`
                : `${base}^{-\\frac{1}{2}${logString} ${n}}=(${base}^{${logString} ${n}})^{-\\frac{1}{2}}=${n}^{-\\frac{1}{2}}=\\dfrac{1}{\\sqrt{${n}}}$`
            }`
            answer = signe === 1 ? `\\sqrt{${n}}` : `\\frac{1}{\\sqrt{${n}}}`
          } else {
            texte = `${base}^{${rienSi1(signe)}${logString} \\sqrt[3]{${n}}}`
            texteCorr = `$${texte}=${
              signe === 1
                ? `${base}^{\\frac{1}{3}${logString} ${n}}=(${base}^{${logString} ${n}})^{\\frac{1}{3}}=${n}^{\\frac{1}{3}}=\\sqrt[3]{${n}}$`
                : `${base}^{-\\frac{1}{3}${logString} ${n}}=(${base}^{${logString} ${n}})^{-\\frac{1}{3}}=${n}^{-\\frac{1}{3}}=\\dfrac{1}{\\sqrt[3]{${n}}}$`
            }`
            answer =
              signe === 1 ? `\\sqrt[3]{${n}}` : `\\frac{1}{\\sqrt[3]{${n}}}`
          }
        }
      }
      // on reprend la correction pour mettre me dernier membre en évidence.
      const chunks = texteCorr.split('=')
      const lastChunk = chunks[chunks.length - 1]
      chunks[chunks.length - 1] =
        miseEnEvidence(lastChunk.substring(0, lastChunk.length - 1)) + '$'
      texteCorr = chunks.join('=')
      // et voilà, c'est fait pour toute les corrections.
      if (this.questionJamaisPosee(i, n, listeTypeQuestions[i])) {
        texte = `$${texte}$` // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            { texteAvant: '=' },
          )
          handleAnswers(this, i, { reponse: { value: answer } })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
