import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import DragAndDrop, { type Etiquette } from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { glossaire } from './CM2N1D-2'
export const titre = 'Décomposer un nombre entier'
export const interactifReady = true
export const dateDeModifImportante = '31/10/2026'

/**
 * Exercice modèle pour la nouvelle fonctionnalité de Drag&Drop
 * @author Jean-claude Lhote

*/

export const uuid = '6498e'
export const refs = {
  'fr-fr': ['CM2N1D-1'],
  'fr-2016': ['c3N10-0'],
  'fr-ch': ['9R1NO2A-7', '9R2NO2A-7', '9R3NO2A-7', 'PRQNO02A-1'],
}
class DragAndDropNumerationEntiere extends Exercice {
  dragAndDrops: DragAndDrop[]
  nombreDeChiffresMin: number
  morceaux!: string[][]
  exposantMorceaux!: number[][]
  constructor() {
    super()
    this.interactif = false
    this.nombreDeChiffresMin = 4
    this.nbQuestions = 4
    this.sup = false // false pour des puissances de 10 en chiffres, true pour lettres
    this.besoinFormulaireCaseACocher = [
      'Puissance de 10 en chiffres/lettres',
      false,
    ]
    this.besoinFormulaire2Texte = [
      'Nombre de chiffres des nombres à décomposer',
      'Nombre entre 4 et 9 séparés par des tirets',
    ]
    this.sup2 = '4-5-6'
    this.besoinFormulaire4Texte = [
      'Présence de zéro(s) ',
      'Nombres séparés par des tirets :\n1 : Sans zéro\n2 : Avec un zéro\n3 : Avec deux zéros consécutifs\n4 : Mélange',
    ]
    this.sup4 = '4'
    this.besoinFormulaire5CaseACocher = ['Décomposition désordonnée', false]
    this.sup5 = false
    this.dragAndDrops = []
  }

  nouvelleVersion() {
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
      let i = 0, cpt = 0, texte: string, texteCorr: string;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      const nbChiffres = nombreDeChiffres[i]
      let nombreStr = ''

      this.morceaux[i] = []
      this.exposantMorceaux[i] = []
      const presenceDeZeros = Number(presenceZeros[i])

      for (let k = 0; k < nbChiffres; k++) {
        nombreStr += randint(1, 9, Array.from(nombreStr).map(Number)).toString()
      }
      if (presenceDeZeros > 1) {
        const arrayFromNbr = Array.from(nombreStr).map(Number)
        const indexOfZero = randint(1, arrayFromNbr.length - 2)
        arrayFromNbr[indexOfZero] = 0
        if (presenceDeZeros === 3) arrayFromNbr[indexOfZero + 1] = 0
        nombreStr = arrayFromNbr.map(String).join('')
      }
      const nombre = new Decimal(nombreStr)
      texte += `Décomposer le nombre $${texNombre(nombre, 0)}$ en complétant avec les ${enLettre ? 'adjectifs numéraux' : 'opérations'} qui conviennent ${enLettre ? '(unité(s) ou dizaine(s) ou centaine(s) ou $\\ldots$)' : `($\\times 1 \\text{ ou }\\times 10 \\text{ ou }\\times 100 \\text{ ou }\\times ${texNombre(1000, 3)} \\text{ ou }\\ldots$)`}.<br>`
      // texte += `$${texNombre(nombre, 0)}=`

      texteCorr = `$${texNombre(nombre, 0)}=`
      for (let k = 0; k < nbChiffres; k++) {
        // on prépare la correction pour l'exo non interactif
        this.morceaux[i][k] = nombreStr[k]
        this.exposantMorceaux[i][k] = nbChiffres - 1 - k
      }
      if (desordonne) {
        shuffle2tableaux(this.morceaux[i], this.exposantMorceaux[i])
      }
      let enonceATrous = `$${texNombre(nombre, 0)}=$ `
      const etiquettes: Etiquette[] = []
      const reponses = []
      for (let e = 0; e < Math.max(7, nbChiffres); e++) {
        if (enLettre) {
          etiquettes.push({
            id: String(2 * e + 1),
            contenu: glossaire[e][0],
          })
          if (e !== 3) {
            etiquettes.push({
              id: String(2 * e + 2),
              contenu: glossaire[e][1],
            })
          }
        } else {
          etiquettes.push({
            id: String(e + 1),
            contenu: `$\\times ${texNombre(10 ** e, 0)}$`,
          })
        }
      }
      if (context.isHtml) {
        for (let k = 0, indiceRectangle = 1; k < this.morceaux[i].length; k++) {
          if (this.morceaux[i][k] !== '0') {
            enonceATrous += `$(${this.morceaux[i][k]}$%{rectangle${indiceRectangle}}$)+$`
            if (this.exposantMorceaux[i][k] === 3) {
              reponses.push([
                `rectangle${indiceRectangle++}`,
                {
                  value: enLettre
                    ? String(2 * this.exposantMorceaux[i][k] + 1)
                    : String(this.exposantMorceaux[i][k] + 1),
                },
              ])
            } else {
              const shift = Number(this.morceaux[i][k]) > 1 ? 1 : 0
              reponses.push([
                `rectangle${indiceRectangle++}`,
                {
                  value: enLettre
                    ? String(2 * this.exposantMorceaux[i][k] + 1 + shift)
                    : String(this.exposantMorceaux[i][k] + 1),
                  options: { multi: false },
                },
              ])
            }
          }
        }
        const objetReponse = Object.fromEntries(reponses)
        enonceATrous = `${enonceATrous.substring(0, enonceATrous.length - 2)}$` // En fin de boucle on a ajouté un '+' inutile, il faut le supprimer
        // On conserve le mélange historique des étiquettes allant jusqu'aux
        // millions afin de ne pas décaler les tirages des questions suivantes.
        // Les nouvelles étiquettes nécessaires aux nombres de 8 et 9 chiffres
        // sont ajoutées ensuite.
        const nombreEtiquettesHistoriques = enLettre ? 13 : 7
        const etiquettesMelangees = [
          ...shuffle(etiquettes.slice(0, nombreEtiquettesHistoriques)),
          ...etiquettes.slice(nombreEtiquettesHistoriques),
        ]
        const leDragAndDrop = new DragAndDrop({
          exercice: this,
          question: i,
          etiquettes: [etiquettesMelangees],
          consigne: `Remettre les étiquettes au bon endroit pour reconstituer le nombre $${texNombre(nombre, 0)}$`,
          enonceATrous,
          nomsZones: this.morceaux[i]
            .filter((morceau) => morceau !== '0')
            .map(
              (morceau, k, termes) =>
                `Terme ${k + 1} sur ${termes.length}, à compléter après le chiffre ${morceau}`,
            ),
        })
        handleAnswers(this, i, objetReponse, { formatInteractif: 'dnd' })
        texte += leDragAndDrop.ajouteDragAndDrop({
          melange: false,
          duplicable: false,
        })
        this.dragAndDrops[i] = leDragAndDrop // on stocke les instances de dragAndDrop dans l'exercice pour pouvoir accéder aux listeners à supprimer lors de la vérification.
      } else {
        texte += '\n$'
        for (let k = 0; k < this.morceaux[i].length; k++) {
          if (this.morceaux[i][k] !== '0') {
            texte += `(${this.morceaux[i][k]} \\ldots \\ldots \\ldots) +`
          }
        }
        texte = `${texte.substring(0, texte.length - 2)}$`
      }
      for (let k = 0; k < this.morceaux[i].length; k++) {
        if (this.morceaux[i][k] !== '0') {
          texteCorr += enLettre
            ? `${this.morceaux[i][k]}~\\text{${glossaire[this.exposantMorceaux[i][k]][Number(this.morceaux[i][k]) > 1 ? 1 : 0]}}+`
            : `(${this.morceaux[i][k]}\\times ${texNombre(10 ** this.exposantMorceaux[i][k], 0)})+`
        }
      }
      // texte = `${texte.substring(0, texte.length - 1)}$`
      texteCorr = texteCorr.endsWith('+')
        ? texteCorr.slice(0, -1)
        : texteCorr + '0'
      const finMembreGauche = texteCorr.indexOf('=') + 1
      texteCorr = `${texteCorr.slice(0, finMembreGauche)}${miseEnEvidence(texteCorr.slice(finMembreGauche))}$`
      if (this.questionJamaisPosee(i, nombreStr)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
export default DragAndDropNumerationEntiere
