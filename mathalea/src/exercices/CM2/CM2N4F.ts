import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Ajouter un nombre entier à un nombre décimal avec une retenue'
export const dateDePublication = '01/10/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Ajouter un entier à un nombre décimal quand il y a une retenue sur les dizaines (somme des unités supérieure à 9)
 * ou sur les centaines (somme des dizaines supérieure à 9).
 * @author Rémi Angot
 */
export const uuid = 'e8358'

export const refs = {
  'fr-fr': ['CM2N4F'],
  'fr-ch': ['9R1NO6B-10', '9R2NO6B-10', '9R3NO6B-10'],
}

const pluriel = (n: number, mot: string) => `$${n}$ ${mot}${n > 1 ? 's' : ''}`

export default class AjouterEntierAvecRetenue extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes(
      ['unitesUnChiffre', 'unitesDeuxChiffres', 'dizaines'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const nbDecimales = randint(1, 2)
      const partieDecimale = randint(
        1,
        10 ** nbDecimales - 1,
        [10, 20, 30, 40, 50, 60, 70, 80, 90],
      )
      let dizainesA: number
      let unitesA: number
      let dizainesB = 0
      let unitesB = 0
      if (type === 'dizaines') {
        // retenue sur les centaines, pas sur les dizaines
        dizainesA = randint(2, 9)
        unitesA = randint(0, 8)
        dizainesB = randint(10 - dizainesA, 9)
        unitesB = randint(0, 9 - unitesA)
      } else {
        // retenue sur les dizaines
        unitesA = randint(2, 9)
        unitesB = randint(10 - unitesA, 9)
        if (type === 'unitesUnChiffre') {
          dizainesA = randint(1, 8)
        } else {
          dizainesA = randint(1, 7)
          dizainesB = randint(1, 8 - dizainesA)
        }
      }
      const a = 10 * dizainesA + unitesA
      const b = 10 * dizainesB + unitesB
      const decimal = arrondi(
        a + partieDecimale / 10 ** nbDecimales,
        nbDecimales,
      )
      const resultat = arrondi(decimal + b, nbDecimales)
      const texte = `$${texNombre(decimal, nbDecimales)}+${b}=$`
      let explication: string
      if (type === 'dizaines') {
        const sommeDizaines = dizainesA + dizainesB
        explication = `Il y a une retenue : ${pluriel(dizainesA, 'dizaine')} plus ${pluriel(dizainesB, 'dizaine')} font $${sommeDizaines}$ dizaines, soit $1$ centaine et ${pluriel(sommeDizaines - 10, 'dizaine')}.`
      } else {
        const sommeUnites = unitesA + unitesB
        explication = `Il y a une retenue : ${pluriel(unitesA, 'unité')} plus ${pluriel(unitesB, 'unité')} font $${sommeUnites}$ unités, soit $1$ dizaine et ${pluriel(sommeUnites - 10, 'unité')}.`
      }
      const decimalTex = texNombre(decimal, nbDecimales)
      const resultatTex = miseEnEvidence(texNombre(resultat, nbDecimales))
      let calcul = `${decimalTex}+${b}=${resultatTex}`
      if (dizainesB > 0 && unitesB > 0) {
        // on ajoute d'abord les unités, puis les dizaines
        const intermediaire = arrondi(decimal + unitesB, nbDecimales)
        calcul = `${decimalTex}+${b}=(${decimalTex}+${unitesB})+${10 * dizainesB}=${texNombre(intermediaire, nbDecimales)}+${10 * dizainesB}=${resultatTex}`
      }
      const texteCorr =
        texteEnCouleur(explication, bleuMathalea) + `<br>$${calcul}$`
      if (this.questionJamaisPosee(i, a, b, partieDecimale, nbDecimales)) {
        handleAnswers(this, i, { reponse: { value: resultat } })
        this.listeQuestions[i] =
          texte +
          (this.interactif
            ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
            : '$\\dots$')
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
