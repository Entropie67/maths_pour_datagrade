import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { OptionsComparaisonType } from '../../lib/types'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { glossaire } from './CM2N1D-2'
export const uuid = 'e116b'

export const refs = {
  'fr-fr': ['CM2N1D-3'],
  'fr-2016': ['c3N10-2'],
  'fr-ch': ['9R1NO2A-9', '9R2NO2A-9', '9R3NO2A-9', 'PRQNO02A-3'],
}
export const dateDeModifImportante = '31/01/2026'
export const titre = 'Décomposer des nombres entiers'
export const interactifReady = true

/**
 * Decomposition d'entier version 1 : il faut compléter une décomposition écrite avec des trous pour les chiffres
 * La présence de zéros est paramétrable (valeur par défaut : sans)
 * Le nombre de chiffres est réglable de 1 à 8 (valeur par défaut : 5)
 * On peut choisir de désordonner la décomposition pour éviter le remplissage 'en suivant' (valeur par défaut : non ordonnée)
 * @author Jean-claude Lhote
 */
class Decomp1 extends Exercice {
  constructor(numeroExercice: number) {
    super()

    this.interactif = false
    this.numeroExercice = numeroExercice
    this.nbQuestions = 5
    this.sup = 5 // nombre de chiffres
    this.sup2 = false
    this.sup4 = 1
    this.consigne = "Compléter chaque décomposition d'entier."
    this.besoinFormulaireNumerique = ['Nombre de chiffres significatifs', 8]
    this.besoinFormulaire2CaseACocher = [
      "Présence de zéros à l'intérieur du nombre",
      false,
    ]
    this.besoinFormulaire4Numerique = [
      'Type de question',
      5,
      "1 : Trouver le chiffre dans l'ordre\n2 : Trouver la classe dans l'ordre\n3 : Trouver le chiffre dans le désordre\n4 : Trouver la classe dans le désordre\n5 : Mélange",
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Compléter cette décomposition d'entier.<br>"
        : "Compléter chaque décomposition d'entier."
    if (this.interactif)
      this.consigne +=
        "<br>S'il y en a besoin, penser à mettre des espaces dans le nombre."
    const typeDeQuestions =
      this.sup4 % 2 === 0
        ? ['classe']
        : this.sup4 < 5
          ? ['chiffre']
          : ['chiffre', 'classe']

    const listeTypesDeQuestion = combinaisonListes(
      typeDeQuestions,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const ordonne =
        this.sup4 < 3 || (this.sup4 === 5 && choice([true, false]))
      const nombreArray: number[] = []
      const chiffresAvecExposantOrd: {
        chiffre: number
        exposant: number
        classe: string
      }[] = []
      const nbZeros = this.sup2 ? randint(1, Math.max(this.sup - 2, 1)) : 0
      for (let k = 0; k < this.sup; k++) {
        const chiffre = this.sup2
          ? k === this.sup - 1
            ? randint(1, 9, nombreArray)
            : randint(0, 9, nombreArray)
          : randint(1, 9, nombreArray)
        nombreArray.push(chiffre)
      }
      if (this.sup2) {
        let nbZerosInit = nombreArray.filter((el) => el === 0).length
        while (nbZeros > nbZerosInit) {
          const index = randint(0, nombreArray.length - 2)
          if (nombreArray[index] !== 0) {
            nombreArray[index] = 0
            nbZerosInit++
          }
        }
      }
      for (let k = 0; k < nombreArray.length; k++) {
        chiffresAvecExposantOrd.push({
          chiffre: nombreArray[k],
          exposant: k,
          classe: glossaire[k][nombreArray[k] > 1 ? 1 : 0],
        })
      }
      nombreArray.reverse()
      chiffresAvecExposantOrd.reverse()
      const chiffresAvecExposantEtClasse = ordonne
        ? chiffresAvecExposantOrd.filter((el) => el.chiffre !== 0)
        : shuffle(chiffresAvecExposantOrd.filter((el) => el.chiffre !== 0))
      // reverse() modifie nombreArray ! c'est maintenant l'élément 0, le chiffre de poids le plus fort.
      // on injecte un zéro s'il n'y en a pas si this.sup2 est à true

      // Le nombre complet écrit sans espace
      const nombreStr = nombreArray.map((el) => String(el)).join('')
      const items = chiffresAvecExposantEtClasse.filter(
        (el) => el.chiffre !== 0,
      )
      let decompo = ''
      const objetReponses: Record<
        string,
        {
          value: string | { value: string; nombre: boolean }
          compare?: unknown
          options?: OptionsComparaisonType
        }
      > = {}
      if (listeTypesDeQuestion[i] === 'chiffre') {
        for (let k = 0; k < items.length; k++) {
          decompo += `%{champ${k + 1}}~\\text{${glossaire[items[k].exposant][items[k].chiffre > 1 ? 1 : 0]}}+`
          objetReponses[`champ${k + 1}`] = { value: String(items[k].chiffre) }
        }
      } else {
        for (let k = 0; k < items.length; k++) {
          decompo += `(${String(items[k].chiffre)}\\times %{champ${k + 1}})+`
          objetReponses[`champ${k + 1}`] = {
            value: texNombre(10 ** items[k].exposant, 0),
            options: { nombreAvecEspace: true },
          }
        }
      }

      handleAnswers(this, i, objetReponses)
      decompo = decompo.substring(0, decompo.length - 1)
      const classe = KeyboardType.numbersSpace
      const texte = remplisLesBlancs(
        this,
        i,
        texNombre(Number(nombreStr), 0) + '=~' + decompo,
        classe,
        '\\ldots~',
      )

      const morceaux = items.map(
        (el) =>
          `${listeTypesDeQuestion[i] === 'chiffre' ? miseEnEvidence(el.chiffre) : el.chiffre} ${listeTypesDeQuestion[i] !== 'chiffre' ? `\\times ${miseEnEvidence(texNombre(10 ** el.exposant))}` : `\\text{ ${el.classe}}`}`,
      )
      const decompStr =
        listeTypesDeQuestion[i] !== 'chiffre'
          ? '(' + morceaux.join(')+(') + ')'
          : morceaux.join('+')
      const texteCorr = `$${texNombre(Number(nombreStr), 0)}=${decompStr}$`
      if (this.questionJamaisPosee(i, nombreStr)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}

export default Decomp1
