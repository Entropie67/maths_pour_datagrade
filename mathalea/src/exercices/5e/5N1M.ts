import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Multiplier ou diviser par $0{,}1$ ; $0{,}01$ ou $0{,}001$'
export const interactifReady = true

export const dateDePublication = '28/10/2026'

/**
 * Multiplier ou diviser un nombre décimal par 0,1 ; 0,01 ou 0,001
 * (déclinaison pour la 5e de 6N2C-3)
 * @author Rémi Angot
 */
export const uuid = '20f40'

export const refs = {
  'fr-fr': ['5N1M'],
  'fr-ch': ['9R1NO6G-7', '9R2NO6G-7', '9R3NO6G-7'],
}

const nomsDePuissances = ['dixième', 'centième', 'millième']

export default class MultiplierDiviserParUnDixiemeUnCentiemeUnMillieme extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Opération',
      'Nombres séparés par des tirets :\n1 : Multiplier par 0,1 ; 0,01 ou 0,001\n2 : Diviser par 0,1 ; 0,01 ou 0,001\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Résultat à calculer\n2 : Nombre à retrouver\n3 : 0,1 ; 0,01 ou 0,001 à retrouver\n4 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = [
      'Le nombre de départ est un entier',
      false,
    ]

    this.nbQuestions = 4
    this.consigne = 'Compléter.'
    this.sup = '3'
    this.sup2 = '4'
    this.sup3 = false
  }

  nouvelleVersion() {
    const listeOperations = gestionnaireFormulaireTexte({
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    const listeTypes = gestionnaireFormulaireTexte({
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    }).map(Number)

    for (
      let i = 0, texte: string, texteCorr: string, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const multiplication = listeOperations[i] === 1
      // k = 1, 2 ou 3 : 0,1 = 10^-1, 0,01 = 10^-2, 0,001 = 10^-3
      const k = randint(1, 3)
      const facteur = arrondi(10 ** -k, 3)
      const nbDecimales = this.sup3 ? 0 : randint(0, 2)
      // un nombre à décimales ne se termine jamais par 0
      const entier =
        nbDecimales === 0
          ? randint(11, 999)
          : choice([1, 2, 3, 4, 5, 6, 7, 8, 9]) + 10 * randint(1, 99)
      const nombre = arrondi(entier / 10 ** nbDecimales, 2)
      const resultat = arrondi(
        multiplication ? nombre * facteur : nombre / facteur,
        5,
      )
      const operateur = multiplication ? '\\times' : '\\div'
      const sNombre = texNombre(nombre, 2)
      const sResultat = texNombre(resultat, 5)
      const sFacteur = texNombre(facteur, 3)

      const explication = multiplication
        ? `Multiplier par $${sFacteur}$, c'est prendre le ${nomsDePuissances[k - 1]} (diviser par $${texNombre(10 ** k, 0)}$)${sp()}: chaque chiffre prend une valeur $${texNombre(10 ** k, 0)}$ fois plus petite.`
        : `Diviser par $${sFacteur}$, c'est multiplier par $${texNombre(10 ** k, 0)}$${sp()}: chaque chiffre prend une valeur $${texNombre(10 ** k, 0)}$ fois plus grande.`
      const equivalence = multiplication
        ? `$${sNombre}${operateur} ${sFacteur}=${sNombre}\\div ${texNombre(10 ** k, 0)}$`
        : `$${sNombre}${operateur} ${sFacteur}=${sNombre}\\times ${texNombre(10 ** k, 0)}$`

      const type = listeTypes[i]
      const trou = this.interactif
        ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        : '$\\ldots\\ldots\\ldots\\ldots$'
      texteCorr = texteEnCouleur(explication, bleuMathalea) + '<br>'
      if (type === 1) {
        texte = `$${sNombre}${operateur} ${sFacteur}=$ ${trou}`
        texteCorr += `${equivalence}<br>`
        texteCorr += `$${sNombre}${operateur} ${sFacteur}=${miseEnEvidence(sResultat)}$`
        handleAnswers(this, i, { reponse: { value: resultat } })
      } else if (type === 2) {
        texte = `${trou} $${operateur} ${sFacteur}=${sResultat}$`
        texteCorr += multiplication
          ? `Pour retrouver le nombre de départ, il faut multiplier $${sResultat}$ par $${texNombre(10 ** k, 0)}$.<br>`
          : `Pour retrouver le nombre de départ, il faut diviser $${sResultat}$ par $${texNombre(10 ** k, 0)}$.<br>`
        texteCorr += `$${miseEnEvidence(sNombre)}${operateur} ${sFacteur}=${sResultat}$`
        handleAnswers(this, i, { reponse: { value: nombre } })
      } else {
        texte = `$${sNombre}${operateur}$ ${trou} $=${sResultat}$`
        texteCorr += multiplication
          ? `Le chiffre des unités de $${sNombre}$ devient le chiffre des ${nomsDePuissances[k - 1]}s dans $${sResultat}$${sp()}: le nombre est divisé par $${texNombre(10 ** k, 0)}$, donc on a multiplié par $${sFacteur}$.<br>`
          : `Les chiffres de $${sNombre}$ prennent une valeur $${texNombre(10 ** k, 0)}$ fois plus grande dans $${sResultat}$${sp()}: le nombre est multiplié par $${texNombre(10 ** k, 0)}$, donc on a divisé par $${sFacteur}$.<br>`
        texteCorr += `$${sNombre}${operateur} ${miseEnEvidence(sFacteur)}=${sResultat}$`
        handleAnswers(this, i, { reponse: { value: facteur } })
      }
      if (
        this.questionJamaisPosee(
          i,
          entier,
          nbDecimales,
          k,
          type,
          Number(multiplication),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
