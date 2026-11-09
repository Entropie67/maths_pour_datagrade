// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1d2ba continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '13/01/2026'
export const uuid = '1d2ba'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Effectuer une conversion kWh/Joules'

export default class auto1AC7dOld extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { estDansIntervalle: true }
    this.optionsChampTexte = { texteApres: '$\\text{kWh}$' }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    // On choisit d'abord une partie entière cible pour le résultat (on exclut 0)
    const partieEntiereCible = this.quotaChoice('cible', [1, 2, 3, 4])
    // energieCoeff / 3,6 doit être entre partieEntiereCible et partieEntiereCible+1
    const borneMin = new Decimal(36).times(partieEntiereCible).div(10)
    const borneMax = new Decimal(36).times(partieEntiereCible + 1).div(10)

    // Valeur avec 1 décimale entre borneMin et borneMax, sans division exacte
    let energieCoeff: Decimal
    let exact: Decimal
    do {
      const pas = borneMax.minus(borneMin).div(10)
      energieCoeff = borneMin.plus(pas.times(randint(0, 10)))
      exact = energieCoeff.div(3.6)
    } while (exact.minus(exact.round()).abs().lt(0.001))
    const bonneReponse = exact.toDecimalPlaces(2)

    // Test si le résultat est exact ou approché
    const symbole = exact.minus(bonneReponse).abs().gt(0.001) ? '\\approx' : '='
    // Approximation par 4
    const numApprox = energieCoeff.round().toNumber()
    const resultatApprox = numApprox / 4

    this.correction = `Pour convertir des Joules en kWh, on utilise la relation donnée :<br>
$1~\\text{kWh} = 3,6 \\times 10^{6}~\\text{J}$<br>
L'énergie en Joules est : $E = ${texNombre(energieCoeff)} \\times 10^{6}~\\text{J}$<br>
Pour trouver l'énergie en kWh, on divise par $3,6 \\times 10^{6}$ :<br>
$E_{\\text{kWh}} = \\dfrac{${texNombre(energieCoeff)} \\times 10^{6}}{3,6 \\times 10^{6}} = \\dfrac{${texNombre(energieCoeff)}}{3,6} ${symbole} ${texNombre(bonneReponse)}~\\text{kWh}$<br>
Sans calculatrice, on peut estimer la valeur en approchant $${texNombre(energieCoeff)}$ par $${numApprox}$ et $3,6$ par $4$.<br>
On obtient alors : $\\dfrac{${numApprox}}{4} = ${texNombre(resultatApprox)}$, ce qui nous indique que le résultat est proche de $${texNombre(resultatApprox)}$.<br>
La réponse est donc $${miseEnEvidence(texNombre(bonneReponse))}$ ${texteEnCouleur('$\\text{kWh}$')}.`

    const enonce = `Un appareil a besoin d'une énergie de $${texNombre(energieCoeff)} \\times 10^{6}$ Joules (J) pour se mettre en route.<br>
À combien de kilowatt-heures (kWh) cela correspond-il ?<br>`
    const donnee = `<br>$\\textit{Données :}$ $1~\\text{kWh} = 3,6 \\times 10^{6}~\\text{J}.$`

    if (this.versionQcm) {
      this.question = enonce + donnee
      this.reponse = `$${texNombre(bonneReponse)}~\\text{kWh}$`
      // dist1 : division par 15 au lieu de 3,6 ; dist2 : multiplication par 0,7 ; dist3 : décalage de la virgule
      this.distracteurs = [
        energieCoeff.div(15).toDecimalPlaces(2),
        energieCoeff.times(0.7).toDecimalPlaces(1),
        bonneReponse.times(10),
      ].map((d) => `$${texNombre(d)}~\\text{kWh}$`)
    } else {
      this.question = `${enonce}Donner une valeur approchée de cette énergie en kWh, à $0,1$ près.${donnee}`
      this.reponse = `[${exact.minus(0.1).toFixed(3)};${exact.plus(0.1).toFixed(3)}]`
    }
  }
}
