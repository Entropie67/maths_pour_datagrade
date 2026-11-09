import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = 'Calculer en utilisant les propriétés des logarithmes'
export const dateDePublication = '27/07/2024'
export const uuid = '3e6bf'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TTE-6'],
  'fr-ch': [],
}
/**
 *
 * @author Jean-claude Lhote et modifié par Claire Rousset

*/
export default class ExerciceCalculsProprietesLn extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'log'
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.sup = '3'
    this.besoinFormulaireTexte = [
      'Type de question',
      ' Nombres séparés par des tirets :\n1 : Avec $\\log(a^n*b^m)$\n2 : Avec $\\log(a^n/b^m)$\n3 : Mélange',
    ]
    // this.besoinFormulaire2CaseACocher = ['Type de logarithme', false]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = [
      'Données exprimées avec des puissances',
      true,
    ]
    this.sup3 = true
  }

  nouvelleVersion() {
    this.version = this.sup2 ? 'ln' : 'log'
    const logString = this.version === 'ln' ? '\\ln' : '\\log'

    // La liste des types de questions fabriquée à partir du paramètre this.sup
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on déclare les objets A et B qui servent à définir a et b
      const A = { base: choice([2, 3, 5]), exp: randint(2, 5) }
      const B = {
        base: choice([2, 3, 5], [A.base]),
        exp: randint(2, 5, [A.exp]),
      }
      const valeurA = A.base ** A.exp
      const valeurB = B.base ** B.exp
      const valeurAfoisB = valeurA * valeurB
      const exprime = (A: { base: number; exp: number }) => `${A.base}^${A.exp}`
      const intro = `Exprimer, en fonction de $${logString} \\left(${A.base}\\right)$ et $${logString} \\left(${B.base}\\right)$, le nombre suivant : ${sp()} `
      let texte: string
      let texteCorr = ''
      const justification1mult = `car, pour tous réels $a$ et $b$ strictement positifs, $${logString}\\left(a \\times b\\right)=${logString}\\left(a\\right)+${logString}\\left(b\\right)$. `
      const justification1div = `car, pour tous réels $a$ et $b$ strictement positifs, $${logString}\\left( \\dfrac{a}{b}\\right)=${logString}\\left(a\\right)-${logString}\\left(b\\right)$. `
      const justification2 = `De plus, pour tout réel $a$ strictement positif et pour tout entier $n$, $${logString}\\left(a^n\\right)=n \\times ${logString}\\left(a\\right)$ donc `
      const signe = listeTypeQuestions[i] === 1 ? '+' : '-'
      switch (listeTypeQuestions[i]) {
        case 1: // log(A*B)
          texte = this.sup3
            ? `${logString}\\left(${exprime(A)}\\times ${exprime(B)}\\right)`
            : `${logString}\\left(${texNombre(valeurAfoisB)}\\right)`
          if (this.sup3) {
            texteCorr += `$${texte}=${logString}\\left(${exprime(A)}\\right)${signe}${logString}\\left(${exprime(B)}\\right)$ ${justification1mult} <br>`
            texteCorr += `${justification2} $${texte}=${miseEnEvidence(`${A.exp}${logString} \\left(${A.base}\\right)${signe}${B.exp}${logString} \\left(${B.base}\\right)`)}$.`
          } else {
            texteCorr += `En décomposant $${texNombre(valeurAfoisB)}$ en facteurs premiers, on obtient : $${texNombre(valeurAfoisB)} = ${exprime(A)}\\times ${exprime(B)}$. ${sp()} Ainsi : <br> `
            texteCorr += `$${texte}=${logString}\\left(${exprime(A)}\\times ${exprime(B)}\\right)= ${logString}\\left(${exprime(A)}\\right)${signe}${logString}\\left(${exprime(B)}\\right)$ ${justification1mult} <br> `
            texteCorr += `${justification2} $${texte}=${miseEnEvidence(`${A.exp}${logString} \\left(${A.base}\\right)${signe}${B.exp}${logString} \\left(${B.base}\\right)`)}$.`
          }
          break
        default: // log(A/B)
          texte = this.sup3
            ? `${logString}\\left(\\dfrac{${exprime(A)}}{${exprime(B)}}\\right)`
            : `${logString}\\left(\\dfrac{${texNombre(valeurA)}}{${texNombre(valeurB)}}\\right)`
          if (this.sup3) {
            texteCorr += `$${texte}= ${logString}\\left(${exprime(A)}\\right)${signe}${logString}\\left(${exprime(B)}\\right)$ ${justification1div} <br> `
            texteCorr += `${justification2} $${texte}=${miseEnEvidence(`${A.exp}${logString} \\left(${A.base}\\right)${signe}${B.exp}${logString} \\left(${B.base}\\right)`)}$. `
          } else {
            texteCorr += `En décomposant $${texNombre(valeurA)}$ et $${texNombre(valeurB)}$ en facteurs premiers, on obtient : $\\dfrac{${texNombre(valeurA)}}{${texNombre(valeurB)}} = \\dfrac{${exprime(A)}}{${exprime(B)}}$. ${sp()} Ainsi : <br> `
            texteCorr += `$${texte}=${logString}\\left(\\dfrac{${exprime(A)}}{${exprime(B)}}\\right)= ${logString}\\left(${exprime(A)}\\right)${signe}${logString}\\left(${exprime(B)}\\right)$ ${justification1div} <br> `
            texteCorr += `${justification2} $${texte}=${miseEnEvidence(`${A.exp}${logString} \\left(${A.base}\\right)${signe}${B.exp}${logString} \\left(${B.base}\\right)`)}$.`
          }
          break
      }

      texte = `${intro}$${texte}$`
      const answer = `${A.exp}${logString}(${A.base})${signe}${B.exp}${logString}(${B.base})`
      if (this.interactif) {
        handleAnswers(this, i, { reponse: { value: answer } })
        texte += `<br>$${lettreDepuisChiffre(i + 1)} = $`
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFonctionsTerminales,
        )
      }
      if (this.questionJamaisPosee(i, A.base, A.exp, B.base, B.exp, signe)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
