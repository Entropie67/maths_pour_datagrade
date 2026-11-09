import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'

import { bleuMathalea } from '../../../lib/colors'
import { arrondi } from '../../../lib/outils/nombres'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Multiplier ou diviser par $0{,}1$ ou $0{,}01$ ou $0{,}001$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '19/02/2023'
export const dateDePublication = '15/09/2021'

/**
 * @author Jean-claude Lhote
 * Ajout de la division par Guillaume Valmont le 19/02/2023
 */
export const uuid = '53034'

export const refs = {
  'fr-fr': ['can5C3-05', '5N1C-flash2'],
  'fr-ch': ['NR'],
}
export default class MultiplierParPuissanceDixNeg extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true

    this.formatChampTexte = KeyboardType.clavierNumbers
    this.besoinFormulaireNumerique = [
      'Multiplier ou diviser',
      3,
      '1 : Multiplier\n2 : Diviser\n3 : Mélange',
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, b)
    const facteur = arrondi(a * 100 + b * 10 + c)

    let typeQuestionsDisponibles = ['multiplier', 'diviser']
    if (this.sup === 1) typeQuestionsDisponibles = ['multiplier']
    else if (this.sup === 2) typeQuestionsDisponibles = ['diviser']
    const typeQuestion = this.quotaChoice(
      'typeQuestion',
      typeQuestionsDisponibles,
    )
    const d = this.quotaChoice('d', [0.1, 0.01, 0.001])
    this.reponse = arrondi(facteur * d)
    this.distracteurs = [
      arrondi(facteur / d),
      arrondi(facteur * 10 * d),
      arrondi((facteur * 10) / d),
    ]
    let operateurLaTeX = '\\times'
    let operateurLateXContraire = '\\div'
    let verbeOperation = 'multipli'
    let verbeOperationContraire = 'divis'
    let participePresentOperation = 'multipliant'
    let petitOuGrand = 'petit'
    if (typeQuestion === 'diviser') {
      this.reponse = arrondi(facteur / d)
      this.distracteurs = [
        arrondi(facteur * d),
        arrondi(facteur * 10 * d),
        arrondi((facteur * 10) / d),
      ]
      operateurLaTeX = '\\div'
      verbeOperation = 'divis'
      verbeOperationContraire = 'multipli'
      participePresentOperation = 'divisant'
      operateurLateXContraire = '\\times'
      petitOuGrand = 'grand'
    }

    this.question = `Calculer $${facteur}${operateurLaTeX} ${texNombre(d)}$.`
    if (this.versionQcm)
      this.question = `$${facteur}${operateurLaTeX} ${texNombre(d)} =$`
    this.correction = `$${facteur}${operateurLaTeX} ${texNombre(d)}=${miseEnEvidence(texNombre(this.reponse))}$<br>`

    if (d === 0.1) {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
  ${premiereLettreEnMajuscule(verbeOperation)}er par $0,1$ revient à ${verbeOperationContraire}er par $10$. <br>
  Quand on ${verbeOperationContraire}e par $10$, le chiffre des unités (chiffre souligné) dans le nombre  $${a}${b}\\underline{${c}}$
  devient le chiffre des ${typeQuestion === 'multiplier' ? 'dixièmes' : 'dizaines'}. On obtient alors :<br>
  $${facteur}${operateurLaTeX} ${texNombre(d)}=${facteur}${operateurLateXContraire} 10=${typeQuestion === 'multiplier' ? `${a}${b},\\underline{${c}}` : `${a}\\,${b}\\underline{${c}}0`}$.<br>
  Remarque : En ${participePresentOperation} un nombre par $0,1$, le résultat doit être plus ${petitOuGrand} que le nombre ${verbeOperation}é.
     `,
        bleuMathalea,
      )
    } else if (d === 0.01) {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
  ${premiereLettreEnMajuscule(verbeOperation)}er par $0,01$ revient à ${verbeOperationContraire}er par $100$. <br>
  Quand on ${verbeOperationContraire}e par $100$, le chiffre des unités (chiffre souligné) dans le nombre  $${a}${b}\\underline{${c}}$
  devient le chiffre des ${typeQuestion === 'multiplier' ? 'centièmes' : 'centaines'}. On obtient alors :<br>
  $${facteur}${operateurLaTeX} ${texNombre(d)}=${facteur}${operateurLateXContraire} 100=${typeQuestion === 'multiplier' ? `${a},${b}\\underline{${c}}` : `${a}${b}\\,\\underline{${c}}00`}$.<br>
  Remarque : En ${participePresentOperation} un nombre par $0,01$, le résultat doit être plus ${petitOuGrand} que le nombre ${verbeOperation}é.
     `,
        bleuMathalea,
      )
    } else {
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
  ${premiereLettreEnMajuscule(verbeOperation)}er par $0,001$ revient à ${verbeOperationContraire}er par $${texNombre(1000)}$. <br>
  Quand on ${verbeOperationContraire}e par $${texNombre(1000)}$, le chiffre des unités (chiffre souligné) dans le nombre  $${a}${b}\\underline{${c}}$
  devient le chiffre des ${typeQuestion === 'multiplier' ? 'millièmes' : 'unités de mille'}. On obtient alors :<br>
  $${facteur}${operateurLaTeX} ${texNombre(d)}=${facteur}${operateurLateXContraire} ${texNombre(1000)}=${typeQuestion === 'multiplier' ? `0,${a}${b}\\underline{${c}}` : `${a}${b}\\underline{${c}}\\,000`}$.<br>
  Remarque : En ${participePresentOperation} un nombre par $0,001$, le résultat doit être plus ${petitOuGrand} que le nombre ${verbeOperation}é.
     `,
        bleuMathalea,
      )
    }
  }
}
