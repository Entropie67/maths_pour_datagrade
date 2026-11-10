import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    arrondi,
    nombreDeChiffresDansLaPartieDecimale,
} from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import operation from '../../../modules/operations'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const dateDePublication = '16/09/2026'
export const amcReady = false
export const interactifReady = true

export const titre =
  'Poser et effectuer une division dont le diviseur est un nombre décimal'

/**
 * On part du QUOTIENT : trois chiffres significatifs, une ou deux décimales,
 * avec ou sans zéro au milieu. On le multiplie par un diviseur décimal
 * quelconque pour obtenir le dividende. La division s'arrête donc toujours,
 * et le résultat ne se devine pas à la lecture de l'opération.
 *
 * Le zéro au milieu du quotient (40,7 ; 3,05) est celui qu'il faut savoir
 * « descendre » dans la potence : c'est le second type de question.
 *
 * @author Nathan Scheinmann
 */
export const uuid = 'd4k7m'

export const refs = {
  'fr-fr': [''],
  'fr-ch': ['9R1NO7C-4', '9R2NO7C-4', '9R3NO7C-4'],
}

/** Les chiffres d'un nombre, sans virgule ni signe. */
function chiffresDe(nombre: number) {
  return String(nombre).replace(/[.-]/g, '')
}

/** Nombre de chiffres de `b` déjà présents dans `a`. */
function chiffresCommuns(a: number, b: number) {
  const dansA = new Set(chiffresDe(a))
  let n = 0
  for (const chiffre of chiffresDe(b)) if (dansA.has(chiffre)) n++
  return n
}

export default class DivisionParUnNombreDecimal extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des quotients',
      'Nombres séparés par des tirets :\n1 : Sans zéro à descendre\n2 : Avec un zéro à descendre\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2Numerique = [
      'Nombre de décimales du diviseur',
      3,
      '1 : Une décimale\n2 : Deux décimales\n3 : Mélange',
    ]
    this.sup2 = 3
    this.nbQuestions = 4
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Sinon la potence n'est pas jolie.
  }

  nouvelleVersion() {
    const reglageDecimales = Number(this.sup2)

    this.consigne =
      this.nbQuestions === 1
        ? 'Poser et effectuer la division suivante.'
        : 'Poser et effectuer les divisions suivantes.'

    // « 1-1-2 » donne deux quotients sans zéro pour un avec zéro.
    const listeTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 60;) {
      cpt++
      const avecZero = Number(listeTypes[i]) === 2

      // Le quotient : chiffres a b c, virgule après le premier ou le
      // deuxième. Avec zéro, c'est le chiffre du milieu qui vaut 0.
      const a = randint(1, 9)
      const b = avecZero ? 0 : randint(1, 9)
      const c = randint(1, 9)
      const nbDecimalesQuotient = randint(1, 2)
      const quotient = arrondi(
        (a * 100 + b * 10 + c) / 10 ** nbDecimalesQuotient,
        6,
      )

      // Le diviseur : deux chiffres, ni multiple de 10 (0,20 n'apprend rien
      // de plus que 0,2), ni 11, 22, … trop reconnaissables ; puis décalé
      // d'un ou deux rangs.
      const k =
        reglageDecimales === 1 || reglageDecimales === 2
          ? reglageDecimales
          : randint(1, 2)
      let diviseurEntier = randint(12, 99)
      while (diviseurEntier % 10 === 0 || diviseurEntier % 11 === 0) {
        diviseurEntier = randint(12, 99)
      }
      const diviseur = arrondi(diviseurEntier / 10 ** k, 6)

      const dividende = arrondi(quotient * diviseur, 6)

      // Trop de décimales rend le dividende illisible, et des chiffres communs
      // au dividende et au diviseur laissent deviner le quotient.
      if (nombreDeChiffresDansLaPartieDecimale(dividende) > 3) continue
      if (chiffresCommuns(dividende, diviseur) >= 2) continue
      if (dividende < 1) continue

      const texte =
        `$${texNombre(dividende)}\\div${texNombre(diviseur)}` +
        (this.interactif ? '=$' : '$') +
        (context.isHtml && this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          : '')

      let texteCorr = `Le diviseur $${texNombre(diviseur)}$ n'est pas un entier : on décale la virgule de $${k}$ rang${k > 1 ? 's' : ''} dans le dividende et dans le diviseur, ce qui ne change pas le quotient.`
      texteCorr += `<br>$${texNombre(dividende)}\\div${texNombre(diviseur)}=${texNombre(arrondi(dividende * 10 ** k, 6))}\\div${diviseurEntier}$.`
      texteCorr += operation({
        operande1: dividende,
        operande2: diviseur,
        type: 'division',
        precision: nbDecimalesQuotient,
        options: { solution: true, colore: orangeMathalea },
      })
      texteCorr += `<br>$${texNombre(dividende)}\\div${texNombre(diviseur)}=${miseEnEvidence(texNombre(quotient, nbDecimalesQuotient))}$.`

      handleAnswers(this, i, { reponse: { value: quotient } })

      if (this.questionJamaisPosee(i, dividende, diviseur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
