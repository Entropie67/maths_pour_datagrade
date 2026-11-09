import { shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import type { MathfieldElement } from 'mathlive'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import type { AnswerType } from '../../lib/types'

export const titre = 'Recomposer un décimal ou un entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '14/08/2022'
export const dateDeModifImportante = '09/10/2023'

function remplaceParZero(chaine: string, place: number) {
  if (place > chaine.length) return chaine // On ne peut pas remplacer en dehors de la chaine !
  if (place === 0) return chaine // on ne veut pas remplacer le premier chiffre
  const debut = chaine.substring(0, place - 1)
  const fin = chaine.substring(place)
  return `${debut}0${fin}`
}

/**
 * @author Jean-claude Lhote
 */
export const uuid = 'f899b'

export const refs = {
  'fr-fr': ['6N1A-3'],
  'fr-2016': ['6N10-7'],
  'fr-ch': ['9R1NO2A-4', '9R2NO2A-4', '9R3NO2A-4', 'PRQNO02A-7', 'PRQNO02B-3'],
}
export default class RecomposerEntierC3 extends Exercice {
  nombreDeChamps?: number[]
  premierChamp?: number[]
  morceaux?: string[][]
  exposantMorceaux?: number[][]

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Nombre de chiffres minimum des nombres à décomposer',
      6,
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de chiffres maximum des nombres à décomposer',
      7,
    ]
    this.besoinFormulaire3Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Chiffrée en ordre sans zéro\n2 : Chiffrée en désordre sans zéro\n3 : Puissances de dix en ordre sans zéro\n4 : Puissances de dix en désordre sans zéro\n5 : Chiffrée en ordre avec zéros possibles\n6 : Chiffrée en désordre avec zéros possibles\n7 : Puissances de dix en ordre avec zéros possibles\n8 : Puissances de dix en désordre avec zéros possibles\n9 : Trouver le nombre en ordre sans zéro\n10 : Trouver le nombre en désordre avec zéro avec groupement\n11 : Trouver le nombre en désordre sans zéro avec groupement\n12 : Puissances de dix en désordre deux zéros consécutifs sans groupement\n13 : Mélange',
    ]
    this.besoinFormulaire4Texte = [
      'Nombre de chiffres de la partie décimale',
      '0 : Aucun chiffre dans la partie décimale\n1 : Un seul chiffre dans la partie décimale\n2 : Que deux chiffres dans la partie décimale\n3 : Que trois chiffres dans la partie décimale\n4 : Mélange',
    ]

    this.nbQuestions = 4
    this.sup = 5 // nombre de chiffres minimum du nombre à décomposer
    this.sup2 = 7 // nombre de chiffres maximum du nombre à décomposer
    this.sup3 = '1' // 5 initialement à remettre, le 1 c'est pour tester.
    this.sup4 = 4
    this.premierChamp = []
    this.morceaux = []
    this.exposantMorceaux = []
    this.nombreDeChamps = []
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 12,
      defaut: 13,
      melange: 13,
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      shuffle: false,
    }).map(Number)
    /**
     * Une fonction pour ajouter tous les nombres passés en argument.
     * @param args
     * @returns {*}
     */
    const somme = (listeNombres: number[]) =>
      listeNombres.reduce((prev, current) => prev + current)
    const nombreDeChiffresDec = gestionnaireFormulaireTexte({
      min: 0,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: String(this.sup4),
      shuffle: false,
    }).map(Number)

    this.nombreDeChamps = []
    this.premierChamp = []
    this.morceaux = []
    this.exposantMorceaux = []
    const glossaire = [
      ['millième', 'millièmes'],
      ['centième', 'centièmes'],
      ['dixième', 'dixièmes'],
      ['unité', 'unités'],
      ['dizaine', 'dizaines'],
      ['centaine', 'centaines'],
      ['unité de mille', 'unités de mille'],
      ['dizaine de mille', 'dizaines de mille'],
      ['centaine de mille', 'centaines de mille'],
      ['unité de million', 'unités de millions'],
      ['dizaine de millions', 'dizaines de millions'],
    ]
    for (
      let i = 0,
        cpt = 0,
        ee,
        nbChiffres,
        nombreDeChiffresMin,
        nombreDeChiffresMax,
        texte,
        texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      let nombreStr = ''
      let nombre
      let blanc = '\\ldots'
      this.morceaux[i] = []
      this.exposantMorceaux[i] = []
      nombreDeChiffresMin = contraindreValeur(
        nombreDeChiffresDec[i] + 3,
        6,
        this.sup,
        5,
      )
      nombreDeChiffresMax = contraindreValeur(
        nombreDeChiffresMin,
        7,
        this.sup2,
        nombreDeChiffresMin + 1,
      )
      nbChiffres = randint(nombreDeChiffresMin, nombreDeChiffresMax)
      let formule = ''
      const listeReponses: [propertyKey: string, answer: AnswerType][] = []
      const completeLesPuissances = (
        k: number,
        i: number,
        morceaux: string[][],
        exposantMorceaux: number[][],
      ) => {
        formule += `(${morceaux[i][k]}\\times %{champ${k + 1}})+`
        const nameProperty = `champ${k + 1}`
        listeReponses.push([
          nameProperty,
          {
            value: texNombre(10 ** exposantMorceaux[i][k]),
            options: { nombreAvecEspace: true },
          },
        ])
      }
      const completeLesMantisses = (
        k: number,
        i: number,
        morceaux: string[][],
        exposantMorceaux: number[][],
        nombreDeChiffresDec: number,
      ) => {
        formule += `(%{champ${k + 1}}\\times${texNombre(10 ** exposantMorceaux[i][k], nombreDeChiffresDec)})+`
        const nameProperty = `champ${k + 1}`
        listeReponses.push([
          nameProperty,
          { value: morceaux[i][k], options: { nombreAvecEspace: true } },
        ])
      }
      /* const chiffreDes = (k, i, morceaux, exposantMorceaux) => {
        formule += `\\quad%{champ${k + 1}}\\quad\\text{${glossaire[exposantMorceaux[i][k] + 3][Number(morceaux[i][k]) > 1 ? 1 : 0]}}\\quad+`
        const nameProperty = `champ${k + 1}`
        listeReponses.push([
          nameProperty,
          { value: morceaux[i][k],  }
        ])
      } */
      const trouveLeNombre = (nombre: Decimal, nombreDeChiffresDec: number) => {
        formule = ':~~%{champ1}+' // Le '+' c'est parce qu'il y en a dans toutes les autres formules et que le dernier caractère est supprimé
        listeReponses.push([
          'reponse',
          { value: texNombre(nombre.div(10 ** nombreDeChiffresDec)) },
        ])
      }
      const morcelleNombre = (
        i: number,
        nombreStr: string,
        melange: boolean,
        morceaux: string[][],
        exposantMorceaux: number[][],
      ) => {
        for (let k = 0; k < nbChiffres; k++) {
          morceaux[i][k] = nombreStr[k]
          exposantMorceaux[i][k] = nbChiffres - 1 - k - nombreDeChiffresDec[i]
        }
        if (melange) shuffle2tableaux(morceaux[i], exposantMorceaux[i])
      }
      const trouveEntierAlea = (sansZero: boolean) => {
        let str = ''
        for (let k = 0; k < nbChiffres; k++) {
          if (sansZero || (!sansZero && k === 0)) {
            str += randint(
              1,
              9,
              str === '' ? [] : Array.from(str).map((el) => Number(el)),
            ).toString() // On veut des chiffres tous différents sinon ça pose un problème pour l'interactif
            // En effet, chaque chiffre ayant une place définie par rapport à son placeholder, avec des doublons, on aurait des fausses mauvaises réponses.
          } else {
            str += randint(
              0,
              9,
              Array.from(str).map((el) => Number(el)),
            ).toString() // On veut des chiffres tous différents sinon ça pose un problème pour l'interactif
            // En effet, chaque chiffre ayant une place définie par rapport à son placeholder, avec des doublons, on aurait des fausses mauvaises réponses.
          }
        }
        if (!sansZero && str.indexOf('0') === -1) {
          str = remplaceParZero(str, randint(2, Math.min(2, str.length - 1)))
        }
        if (!sansZero && str.endsWith('0')) {
          // On récupère tous les chiffres déjà utilisés
          const used = Array.from(str).map((ch) => Number(ch))
          // On remplace le dernier chiffre (le 0)
          str = str.slice(0, -1) + randint(1, 9, used).toString()
        }

        return str
      }

      switch (listeTypeDeQuestions[i]) {
        case 1: // décomposition chiffre par chiffre dans l'ordre sans zéro
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les nombres (à un seul chiffre) qui conviennent.<br>`
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            false,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            completeLesMantisses(
              k,
              i,
              this.morceaux,
              this.exposantMorceaux,
              nombreDeChiffresDec[i],
            )
            texteCorr += `(${miseEnEvidence(this.morceaux[i][k])}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i])})+`
          }
          break
        case 2: // décomposition chiffre par chiffre avec désordre sans zéros
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les nombres (à un seul chiffre) qui conviennent.<br>`
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            true,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            completeLesMantisses(
              k,
              i,
              this.morceaux,
              this.exposantMorceaux,
              nombreDeChiffresDec[i],
            )
            texteCorr += `(${miseEnEvidence(this.morceaux[i][k])}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i])})+`
          }
          break
        case 3: // décomposer en complétant les puissances de 10 sans désordre et sans zéros
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les valeurs qui conviennent ($1, 10, 100${
            nombreDeChiffresDec[i] === 0
              ? `,${texNombre(1000)},\\ldots$).<br>`
              : `,\\ldots $ ou bien $${texNombre(0.1)}, ${texNombre(0.01)},\\ldots$).<br>`
          }`
          texte += this.interactif
            ? ' Penser à mettre les espaces nécessaires.<br>'
            : ''
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            false,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            completeLesPuissances(k, i, this.morceaux, this.exposantMorceaux)
            texteCorr += `(${this.morceaux[i][k]}\\times ${miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i]))})+`
          }
          blanc = '\\ldots\\ldots\\ldots'
          break
        case 4: // décomposer en complétant les puissances de 10 avec désordre et sans zéros
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les valeurs qui conviennent ($1, 10, 100${
            nombreDeChiffresDec[i] === 0
              ? `,${texNombre(1000)},\\ldots$).<br>`
              : `,\\ldots $ ou bien $${texNombre(0.1)}, ${texNombre(0.01)},\\ldots$).<br>`
          }`
          texte += this.interactif
            ? ' Penser à mettre les espaces nécessaires.<br>'
            : ''
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            true,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            completeLesPuissances(k, i, this.morceaux, this.exposantMorceaux)
            texteCorr += `(${this.morceaux[i][k]}\\times ${miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i]))})+`
          }
          blanc = '\\ldots\\ldots\\ldots'
          break
        case 5: // décomposition chiffre par chiffre en ordre avec zéros possibles
          nombreStr = trouveEntierAlea(false)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les nombres (à un seul chiffre) qui conviennent.<br>`
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            false,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              completeLesMantisses(
                k,
                i,
                this.morceaux,
                this.exposantMorceaux,
                nombreDeChiffresDec[i],
              )
              texteCorr += `(${miseEnEvidence(this.morceaux[i][k])}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i])})+`
            }
          }
          break
        case 6: // décomposition chiffre par chiffre avec désordre avec zéros possibles
          nombreStr = trouveEntierAlea(false)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les nombres (à un seul chiffre) qui conviennent.<br>`
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            true,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              completeLesMantisses(
                k,
                i,
                this.morceaux,
                this.exposantMorceaux,
                nombreDeChiffresDec[i],
              )
              texteCorr += `(${miseEnEvidence(this.morceaux[i][k])}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i])})+`
            }
          }
          break
        case 7: // décomposer en complétant les puissances de 10 sans désordre et avec zéros possibles
          nombreStr = trouveEntierAlea(false)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les valeurs qui conviennent ($1, 10, 100${
            nombreDeChiffresDec[i] === 0
              ? `,${texNombre(1000)},\\ldots$).<br>`
              : `,\\ldots $ ou bien $${texNombre(0.1)}, ${texNombre(0.01)},\\ldots$).<br>`
          }`
          texte += this.interactif
            ? ' Penser à mettre les espaces nécessaires.<br>'
            : ''
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            false,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              completeLesPuissances(k, i, this.morceaux, this.exposantMorceaux)
              texteCorr += `(${this.morceaux[i][k]}\\times ${miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i]))})+`
            }
          }
          blanc = '\\ldots\\ldots\\ldots'
          break
        case 8: // décomposer en complétant les puissances de 10 avec désordre et avec zéros possibles
          nombreStr = trouveEntierAlea(false)
          nombre = new Decimal(nombreStr)
          texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les valeurs qui conviennent ($1, 10, 100${
            nombreDeChiffresDec[i] === 0
              ? `,${texNombre(1000)},\\ldots$).<br>`
              : `,\\ldots $ ou bien $${texNombre(0.1)}, ${texNombre(0.01)},\\ldots$).<br>`
          }`
          texte += this.interactif
            ? ' Penser à mettre les espaces nécessaires.<br>'
            : ''
          texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
          texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
          morcelleNombre(
            i,
            nombreStr,
            true,
            this.morceaux,
            this.exposantMorceaux,
          )
          for (let k = 0; k < this.morceaux[i].length; k++) {
            if (this.morceaux[i][k] !== '0') {
              completeLesPuissances(k, i, this.morceaux, this.exposantMorceaux)
              texteCorr += `(${this.morceaux[i][k]}\\times ${miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i]))})+`
            }
          }
          blanc = '\\ldots\\ldots\\ldots'
          break

        case 9: // trouver le nombre sans groupement  en ordre sans zéros
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += 'Donner le nombre correspondant à <br>$'
          morcelleNombre(
            i,
            nombreStr,
            false,
            this.morceaux,
            this.exposantMorceaux,
          )
          texteCorr = '$'
          for (let k = 0; k < this.morceaux[i].length - 1; k++) {
            if (this.morceaux[i][k] !== '0') {
              texte += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
              texteCorr += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
            }
          }
          ee = this.morceaux[i].length - 1
          texte += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}`
          texteCorr += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}${sp()}`
          texteCorr += `$=${miseEnEvidence(texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i]))} `
          trouveLeNombre(nombre, nombreDeChiffresDec[i])
          break
        case 10: // trouver le nombre avec groupement en ordre sans zéros
          nombreStr = trouveEntierAlea(true)
          nombre = new Decimal(nombreStr)
          texte += 'Donner le nombre correspondant à <br>$'
          texteCorr = '$'
          for (let k = 0, j, index = 0; index < nbChiffres; k++) {
            // on prépare la correction pour l'exo non interactif
            let testeur = 0
            do {
              j = randint(1, 3)
              testeur++
              this.morceaux[i][k] = nombreStr
                .substring(index, Math.min(index + j, nbChiffres))
                .replace(/^0+/g, '')
              this.exposantMorceaux[i][k] =
                nbChiffres -
                Math.min(index + j, nbChiffres) -
                nombreDeChiffresDec[i]
            } while (this.morceaux[i][k] === '' && testeur < 100)
            if (testeur === 100) {
              window.notify('boucle sans fin detectée case 10 6N10-7', {
                nombreStr,
              })
            }
            index += j
          }
          for (let k = 0; k < this.morceaux[i].length - 1; k++) {
            if (this.morceaux[i][k] !== '0') {
              texte += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
              texteCorr += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
            }
          }
          ee = this.morceaux[i].length - 1
          texte += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}${sp()}`
          texteCorr += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}${sp()}`
          trouveLeNombre(nombre, nombreDeChiffresDec[i])
          texteCorr += `$=${miseEnEvidence(texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i]))} `
          break
        case 11: // trouver le nombre avec groupement en ordre avec zéros
          nombreStr = trouveEntierAlea(false)
          nombre = new Decimal(nombreStr)
          texte += 'Donner le nombre correspondant à <br>$'
          texteCorr = '$'
          for (let k = 0, j, index = 0; index < nbChiffres; k++) {
            // on prépare la correction pour l'exo non interactif
            let testeur = 0
            do {
              j = randint(1, 3)
              testeur++
              if (
                nombreStr.substring(index, nbChiffres).replace(/^0+/g, '') ===
                ''
              ) {
                // il reste que des zéros, on ne peut pas les prendre en compte
                break
              }
              this.morceaux[i][k] = nombreStr
                .substring(index, Math.min(index + j, nbChiffres))
                .replace(/^0+/g, '')
              this.exposantMorceaux[i][k] =
                nbChiffres -
                Math.min(index + j, nbChiffres) -
                nombreDeChiffresDec[i]
            } while (this.morceaux[i][k] === '' && testeur < 100)
            if (testeur === 100) {
              window.notify('boucle sans fin detectée case 11 6N10-7', {
                nombreStr,
              })
            }
            index += j
          }
          for (let k = 0; k < this.morceaux[i].length - 1; k++) {
            if (this.morceaux[i][k] !== '0') {
              texte += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
              texteCorr += `${this.morceaux[i][k]}$ ${glossaire[this.exposantMorceaux[i][k] + 3][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}$${sp()}+${sp()}`
            }
          }
          ee = this.morceaux[i].length - 1
          texte += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}${sp()}`
          texteCorr += `${this.morceaux[i][ee]}$ ${glossaire[this.exposantMorceaux[i][ee] + 3][Number(this.morceaux[i][ee]) > 1 ? 1 : 0]}${sp()}`
          trouveLeNombre(nombre, nombreDeChiffresDec[i])
          texteCorr += `$=${miseEnEvidence(texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i]))} `
          break
        case 12:
        default:
          {
            // décomposer avec les puissances de 10 avec groupement et désordre et présence de deux zéros consécutifs
            nombreStr = trouveEntierAlea(true)
            const place = randint(2, nbChiffres - 2)
            nombreStr = remplaceParZero(nombreStr, place)
            nombreStr = remplaceParZero(nombreStr, place + 1)
            nombre = new Decimal(nombreStr)
            texte += `Décomposer le nombre $${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}$ en complétant avec les valeurs qui conviennent ($1, 10, 100${
              nombreDeChiffresDec[i] === 0
                ? `,${texNombre(1000)},\\ldots$).<br>`
                : `,\\ldots $ ou bien $${texNombre(0.1, 1)}, ${texNombre(0.01, 2)},\\ldots$).<br>`
            }`
            texte += this.interactif
              ? ' Penser à mettre les espaces nécessaires.<br>'
              : ''
            texte += `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=$`
            texteCorr = `$${texNombre(nombre.div(10 ** nombreDeChiffresDec[i]), nombreDeChiffresDec[i])}=`
            for (let k = 0, j, index = 0; index < nbChiffres; k++) {
              // on prépare la correction pour l'exo non interactif
              let testeur = 0
              do {
                testeur++
                j = randint(1, 3)
                this.morceaux[i][k] = nombreStr
                  .substring(index, Math.min(index + j, nbChiffres))
                  .replace(/^0+/g, '')
              } while (this.morceaux[i][k] === '' && testeur < 100)
              if (testeur === 100) {
                window.notify('boucle sans fin detectée case 14 6N10-7', {
                  nombreStr,
                })
              }
              this.exposantMorceaux[i][k] =
                nbChiffres -
                Math.min(index + j, nbChiffres) -
                nombreDeChiffresDec[i]
              index += j
            }
            shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
            for (let k = 0; k < this.morceaux[i].length; k++) {
              if (this.morceaux[i][k] !== '0') {
                completeLesPuissances(
                  k,
                  i,
                  this.morceaux,
                  this.exposantMorceaux,
                )
                texteCorr += `(${this.morceaux[i][k]}\\times ${miseEnEvidence(texNombre(10 ** this.exposantMorceaux[i][k], nombreDeChiffresDec[i]))})+`
              }
            }
          }
          blanc = '\\ldots\\ldots\\ldots'
          break
      }

      if (this.questionJamaisPosee(i, nombre)) {
        if (listeTypeDeQuestions[i] < 12 && listeTypeDeQuestions[i] > 8) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            `  ${KeyboardType.numbersSpace}`,
            { espace: true, texteAvant: ' $=$ ' },
          )
          handleAnswers(this, i, {
            reponse: {
              value: listeReponses[0][1].value,
              options: { nombreAvecEspace: true },
            },
          })
        } else {
          texte += remplisLesBlancs(
            this,
            i,
            formule.substring(0, formule.length - 1),
            KeyboardType.numbersSpace,
            blanc,
          )
          // bareme est une fonction qui retourne [nbBonnesReponses, nbReponses]
          handleAnswers(
            this,
            i,
            Object.assign(
              {
                bareme: (listePoints: number[]) =>
                  [Math.floor(somme(listePoints) / listePoints.length), 1] as [
                    number,
                    number,
                  ],
              },
              Object.fromEntries(listeReponses),
            ),
            { formatInteractif: 'fillInTheBlank' },
          )
        }
        //   }
        //  texte = `${texte.substring(0, texte.length - 1)}$`
        texteCorr = `${texteCorr.substring(0, texteCorr.length - 1)}$`

        texte += this.interactif ? '<br>' : ''

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: `${texte}<br>`,
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

        texte +=
          context.isHtml && this.interactif
            ? `<span id=resultatCheckEx${this.numeroExercice}Q${i}></span>`
            : ''

        texte = texte.replaceAll('$$', ' ')
        texteCorr = texteCorr.replaceAll('$$', ' ')

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    const champsTexte = []
    const saisies = []
    if (this.premierChamp?.[i] === undefined) return 'OK'
    const spanResultat = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )
    let resultatOK = true
    if (this.nombreDeChamps === undefined) {
      window.notify('this.nombreDeChamps est undefined', { this: this })
      return 'KO'
    }
    for (let k = 0; k < this.nombreDeChamps[i]; k++) {
      champsTexte[k] = document.getElementById(
        `champTexteEx${this.numeroExercice}Q${k + this.premierChamp[i]}`,
      ) as MathfieldElement
      if (champsTexte[k] === null) {
        window.notify('champsTexte[k] est null', {
          k,
          champsTexte,
          this: this,
        })
        return 'KO'
      }
      saisies[k] = champsTexte[k].value
        .replace(',', '.')
        .replace(/\((\+?-?\d+)\)/, '$1')
      resultatOK =
        resultatOK &&
        Number.parseInt(saisies[k]) ===
          Number.parseInt(
            String(
              this.autoCorrection[this.premierChamp[i] + k]?.valeur?.reponse
                ?.value ?? '',
            ),
          )
    }
    if (spanResultat != null) {
      if (resultatOK) {
        spanResultat.innerHTML += '😎'
        return 'OK'
      }
      spanResultat.innerHTML += '☹️'
      return 'KO'
    }
    return 'KO'
  }
}
