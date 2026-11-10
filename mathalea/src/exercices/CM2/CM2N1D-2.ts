import { seq, stringEquals } from '../../lib/interactif/checks'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import type { AnswerType, Valeur } from '../../lib/types'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { context } from '../../modules/context'

export const titre = 'Recomposer un entier'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '14/08/2022'
export const dateDeModifImportante = '31/10/2026'
export const glossaire = [
  ['unité', 'unités'],
  ['dizaine', 'dizaines'],
  ['centaine', 'centaines'],
  ['mille', 'mille'],
  ['dizaine de mille', 'dizaines de mille'],
  ['centaine de mille', 'centaines de mille'],
  ['million', 'millions'],
  ['dizaine de millions', 'dizaines de millions'],
  ['centaine de millions', 'centaines de millions'],
  ['milliard', 'milliards'],
  ['dizaine de milliards', 'dizaines de milliards'],
  ['centaine de milliards', 'centaines de milliards'],
]

/**
 * @author Jean-claude Lhote

 */

export const uuid = 'c96de'

export const refs = {
  'fr-fr': ['CM2N1D-2'],
  'fr-2016': ['c3N10-1'],
  'fr-ch': ['9R1NO2A-8', '9R2NO2A-8', '9R3NO2A-8', 'PRQNO02A-2'],
}
/** Met en évidence le membre de droite d'une égalité en cours de construction (formule sans `$` final). */
function surligneMembreDroit(egalite: string) {
  const debut = egalite.indexOf('=') + 1
  return `${egalite.slice(0, debut)}${miseEnEvidence(egalite.slice(debut))}`
}

export default class RecomposerEntierC3 extends Exercice {
  nombreDeChiffresMin: number
  morceaux: string[][]
  exposantMorceaux: number[][]

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Puissance de 10 en chiffres/lettres',
      false,
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de chiffres maximum des nombres à décomposer',
      9,
    ]
    this.besoinFormulaire3Texte = [
      'Types de question séparés par des tirets :',
      '1 : Décomposer (donner les chiffres)\n2 : Décomposer (compléter avec 10, 100...)\n3 : Composer (sans groupement)\n4 : Composer avec groupement\n5 : Mélange',
    ]
    this.besoinFormulaire4Texte = [
      'Présence de zéro(s) ',
      'Nombres séparés par des tirets :\n1 : Sans zéro\n2 : Avec un zéro\n3 : Avec deux zéros consécutifs\n4 : Mélange',
    ]
    this.besoinFormulaire5CaseACocher = ['Décomposition désordonnée', false]
    this.nbQuestions = 4
    this.sup = false // false pour des puissances de 10 en chiffres, true pour lettres
    this.sup2 = '4-5-6' // nombre de chiffres maximum du nombre à décomposer
    this.sup3 = '5'
    this.sup4 = '4'
    this.sup5 = false
    this.nombreDeChiffresMin = 4
    this.morceaux = []
    this.exposantMorceaux = []
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
    })
    // Pour activer le mélange
    const desordonne = this.sup5
    const enLettre = this.sup
    const presenceZeros = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    // ça c'est pour éviter de ne pas pouvoir fabriquer les nombres.
    const nombreDeChiffresMin = this.nombreDeChiffresMin

    const nombreDeChiffres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: nombreDeChiffresMin,
      max: 9,
      defaut: nombreDeChiffresMin,
      melange: 0,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    this.morceaux = []
    this.exposantMorceaux = []
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      let indexChamp = 1
      const reponses: Valeur & Record<`champ${number}`, AnswerType> = {
        bareme: toutPourUnPoint,
      }
      texte = ''
      texteCorr = ''
      const nbChiffres = nombreDeChiffres[i]
      let nombreStr = ''
      let nombre

      this.morceaux[i] = []
      this.exposantMorceaux[i] = []
      const presenceDeZeros = Number(presenceZeros[i])

      switch (listeTypeDeQuestions[i]) {
        case 1: // décomposition chiffre par chiffre dans l'ordre
          for (let k = 0; k < nbChiffres; k++) {
            nombreStr += randint(1, 9).toString()
          }
          if (presenceDeZeros > 1) {
            const arrayFromNbr: string[] = Array.from(nombreStr)
            const indexOfZero = randint(1, arrayFromNbr.length - 2)
            arrayFromNbr[indexOfZero] = '0'
            if (presenceDeZeros === 3) arrayFromNbr[indexOfZero + 1] = '0'
            nombreStr = arrayFromNbr.join('')
          }
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre, 0)}$ en complétant avec les nombres (à un seul chiffre) qui conviennent.<br>`
          texte += `$${texNombre(nombre, 0)}=`
          texteCorr += `$${texNombre(nombre, 0)}=`
          for (let k = 0; k < nbChiffres; k++) {
            this.morceaux[i][k] = nombreStr[k]
            this.exposantMorceaux[i][k] = nbChiffres - 1 - k
          }
          if (desordonne) {
            shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
          }

          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              if (this.interactif) {
                texte += enLettre
                  ? `%{champ${indexChamp}}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                  : `(%{champ${indexChamp}}\\times${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
                reponses[`champ${indexChamp}`] = { value: this.morceaux[i][k] }
                indexChamp++
              } else {
                texte += `${
                  enLettre
                    ? `\\ldots~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                    : `(\\ldots\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
                }`
              }
              texteCorr += enLettre
                ? `${this.interactif ? miseEnEvidence(this.morceaux[i][k]) : this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                : `(${this.interactif ? miseEnEvidence(this.morceaux[i][k]) : this.morceaux[i][k]}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
            }
          }
          texte = `${texte.endsWith('+') ? texte.slice(0, -1) : texte + '0'}$`
          texteCorr = this.interactif
            ? `${texteCorr.endsWith('+') ? texteCorr.slice(0, -1) : texteCorr + '0'}$`
            : `${surligneMembreDroit(texteCorr.endsWith('+') ? texteCorr.slice(0, -1) : texteCorr + '0')}$`

          break
        case 2: // décomposer en complétant les puissances de 10
          for (let k = 0; k < nbChiffres; k++) {
            nombreStr += randint(
              1,
              9,
              Array.from(nombreStr).map(Number),
            ).toString()
          }
          if (presenceDeZeros > 1) {
            const arrayFromNbr = Array.from(nombreStr)
            const indexOfZero = randint(1, arrayFromNbr.length - 2)
            arrayFromNbr[indexOfZero] = '0'
            if (presenceDeZeros === 3) arrayFromNbr[indexOfZero + 1] = '0'
            nombreStr = arrayFromNbr.join('')
          }
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre, 0)}$ en complétant avec les ${enLettre ? 'adjectifs numéraux' : 'valeurs'} qui conviennent ${enLettre ? 'unité, dizaine(s), centaine(s) $\\ldots$' : `($1, 10, 100,${texNombre(1000, 3)},\\ldots$)`}.<br>`
          texte += `$${texNombre(nombre, 0)}=`
          texteCorr = `$${texNombre(nombre, 0)}=`
          for (let k = 0; k < nbChiffres; k++) {
            // on prépare la correction pour l'exo non interactif
            this.morceaux[i][k] = nombreStr[k]
            this.exposantMorceaux[i][k] = nbChiffres - 1 - k
          }
          if (desordonne) {
            shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
          }
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.interactif) {
              if (this.morceaux[i][k] !== '0') {
                texte += `(${this.morceaux[i][k]}\\times %{champ${indexChamp}})+`

                reponses[`champ${indexChamp}`] = {
                  value: enLettre
                    ? glossaire[this.exposantMorceaux[i][k]]
                    : 10 ** this.exposantMorceaux[i][k],
                  ...(enLettre
                    ? {
                        compare: seq([
                          stringEquals({
                            ignoreCase: true,
                            trim: true,
                            ignoreLatexText: true,
                          }),
                        ]),
                      }
                    : {}),
                }
                indexChamp++
              }
            } else {
              if (this.morceaux[i][k] !== '0') {
                texte += `(${this.morceaux[i][k]}\\times \\ldots)+`
              }
            }
            if (this.morceaux[i][k] !== '0') {
              texteCorr += enLettre
                ? `${this.morceaux[i][k]}~${this.interactif ? miseEnEvidence(`\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}`) : `\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}`}+`
                : `(${this.morceaux[i][k]}\\times ${this.interactif ? miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], 0)) : texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
            }
          }
          texte = `${texte.endsWith('+') ? texte.slice(0, -1) : texte + '0'}$`
          texteCorr = this.interactif
            ? `${texteCorr.endsWith('+') ? texteCorr.slice(0, -1) : texteCorr + '0'}$`
            : `${surligneMembreDroit(texteCorr.endsWith('+') ? texteCorr.slice(0, -1) : texteCorr + '0')}$`
          break
        case 3: // trouver le nombre sans groupement
          for (let k = 0; k < nbChiffres; k++) {
            nombreStr += randint(1, 9).toString()
          }
          if (presenceDeZeros > 1) {
            const arrayFromNbr = Array.from(nombreStr)
            const indexOfZero = randint(1, arrayFromNbr.length - 2)
            arrayFromNbr[indexOfZero] = '0'
            if (presenceDeZeros === 3) arrayFromNbr[indexOfZero + 1] = '0'
            nombreStr = arrayFromNbr.join('')
          }
          nombre = new Decimal(nombreStr)
          texte +=
            "Donner le nombre correspondant au premier membre de l'égalité.<br>$"
          for (let k = 0; k < nbChiffres; k++) {
            this.morceaux[i][k] = nombreStr[k]
            this.exposantMorceaux[i][k] = nbChiffres - 1 - k
          }
          texteCorr = '$'
          if (desordonne) {
            shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
          }
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              texte += enLettre
                ? `${this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                : `(${this.morceaux[i][k]}~\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
              texteCorr += enLettre
                ? `${this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                : `(${this.morceaux[i][k]}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
            }
          }
          texte = texte.endsWith('+') ? texte.slice(0, -1) : texte + '0'
          texteCorr = texteCorr.endsWith('+')
            ? texteCorr.slice(0, -1)
            : texteCorr + '0'
          texteCorr += `=${miseEnEvidence(texNombre(nombre, 0))}$`
          if (!this.interactif) {
            texte += '= \\ldots\\ldots\\ldots$'
          } else {
            reponses[`champ${indexChamp}`] = { value: nombre }
            texte += `=%{champ${indexChamp}}$`
            indexChamp++
          }

          break
        case 4: // trouver le nombre avec groupement
          for (let k = 0; k < nbChiffres; k++) {
            nombreStr += randint(1, 9).toString()
          }
          if (presenceDeZeros > 1) {
            const arrayFromNbr = Array.from(nombreStr)
            const indexOfZero = randint(1, arrayFromNbr.length - 2)
            arrayFromNbr[indexOfZero] = '0'
            if (presenceDeZeros === 3) arrayFromNbr[indexOfZero + 1] = '0'
            nombreStr = arrayFromNbr.join('')
          }
          nombre = new Decimal(nombreStr)
          texte +=
            "Donner le nombre correspondant au premier membre de l'égalité.<br>$"
          texteCorr = '$'
          for (let k = 0, j, index = 0; index < nbChiffres; k++) {
            // on prépare la correction pour l'exo non interactif
            let testeur = 0
            do {
              testeur++
              j = choice([2, 2, 3]) // statistiquement 2 fois plus de groupements de 2 chiffres que de 3 chiffres (mais c'est sans compter les 0)
              this.morceaux[i][k] = nombreStr
                .substring(index, Math.min(index + j, nbChiffres))
                .replace(/^0+/g, '')
              this.exposantMorceaux[i][k] =
                nbChiffres - Math.min(index + j, nbChiffres)
            } while (this.morceaux[i][k] === '' && testeur < 100)
            if (this.morceaux[i][k] === '') break
            index += j
          }
          if (this.morceaux[i][this.morceaux[i].length - 1] === '')
            this.morceaux[i].pop()
          if (desordonne) {
            shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
          }
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              texte += enLettre
                ? `${this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                : `(${this.morceaux[i][k]}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
              texteCorr += enLettre
                ? `${this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
                : `(${this.morceaux[i][k]}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
            }
          }
          texte = texte.endsWith('+') ? texte.slice(0, -1) : texte + '0'
          texteCorr = texteCorr.endsWith('+')
            ? texteCorr.slice(0, -1)
            : texteCorr + '0'
          if (!this.interactif) {
            texte += ' = \\ldots\\ldots\\ldots$'
          } else {
            reponses[`champ${indexChamp}`] = { value: nombre }
            texte += `=%{champ${indexChamp}}$`
            indexChamp++
          }
          texteCorr += `=${miseEnEvidence(texNombre(nombre, 0))}$`
          break
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '$texte<br>',
          propositions: [
            {
              texte: texteCorr,
              statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              sanscadre: true,
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.interactif) {
        handleAnswers(this, i, reponses, {
          formatInteractif: 'fill-in-the-blank',
        })
        const debut = texte.lastIndexOf('<br>') + 4
        texte =
          texte.slice(0, debut) +
          remplisLesBlancs(
            this,
            i,
            texte.slice(debut + 1, -1),
            enLettre && listeTypeDeQuestions[i] === 2
              ? KeyboardType.numeration
              : KeyboardType.clavierDeBase,
          )
      }
      if (this.questionJamaisPosee(i, nombreStr)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
