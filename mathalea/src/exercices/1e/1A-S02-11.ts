import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  effectifTotal,
  sommeSerie,
  contextesSerie,
  tableauEffectifs,
  valeursCroissantes,
} from '../../lib/outils/serieEffectifs'
import { choice } from '../../lib/outils/arrayOutils'
import { pgcd } from '../../lib/outils/primalite'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = '5bda9'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-S02-11', '2A-S2-11'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = "Calculer la moyenne d'une série donnée par un tableau"

/**
 * La série est donnée par un tableau d'effectifs faibles :
 * la moyenne, entière ou décimale simple (dénominateur 2, 4 ou 5), se calcule à la main.
 */
export default class MoyenneTableauSaisieLibre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const contexte = choice(contextesSerie)
    const cas = this.quotaChoice('cas', ['entiere', 'decimale'])
    let valeurs: number[]
    let effectifs: number[]
    let total: number
    let somme: number
    let denominateur: number
    do {
      valeurs = valeursCroissantes(4, contexte.min, contexte.ecartMax)
      effectifs = valeurs.map(() => randint(1, 4))
      total = effectifTotal({ valeurs, effectifs })
      somme = sommeSerie({ valeurs, effectifs })
      denominateur = total / pgcd(somme, total)
    } while (
      total < 8 ||
      total > 12 ||
      (cas === 'entiere' && denominateur !== 1) ||
      (cas === 'decimale' && ![2, 4, 5].includes(denominateur))
    )
    const numerateur = somme / pgcd(somme, total)
    const moyenne = new Decimal(somme).div(total)
    const fractionIrreductible = `\\dfrac{${texNombre(numerateur)}}{${texNombre(denominateur)}}`
    const serie = { valeurs, effectifs }
    const produits = valeurs.map(
      (v, i) => `${texNombre(v)}\\times${texNombre(effectifs[i])}`,
    )
    // en interactif, la phrase de réponse tient lieu de consigne
    this.question = `${contexte.phrase}<br><br>${tableauEffectifs(contexte.nomValeur, serie)}${this.interactif ? '' : '<br>Calculer la moyenne de cette série.'}`
    this.optionsChampTexte = {
      texteAvant: `<br>${contexte.moyenne}`,
      texteApres: '.',
    }
    this.reponse = texNombre(moyenne)
    const quotient = `\\dfrac{${texNombre(somme)}}{${texNombre(total)}}`
    const reduit = denominateur !== total
    const calcul = `${quotient}${reduit && cas === 'decimale' ? `=${fractionIrreductible}` : ''}=${texNombre(moyenne)}`
    const resultat = texNombre(moyenne)
    this.correction = `L'effectif total est $${effectifs.join('+')}=${texNombre(total)}$.<br>
    La somme des valeurs est $${produits.join('+')}=${texNombre(somme)}$.<br>
    On en déduit la moyenne : $${calcul}$.<br>
    ${contexte.moyenne}$${miseEnEvidence(resultat)}$.`
  }
}
