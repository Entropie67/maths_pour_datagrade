import Decimal from 'decimal.js'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '13/01/2026'
export const uuid = '18326'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C07-4', '2A-N7-4'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer une conversion kWh/Joules'
export default class auto1AC7d extends ExerciceQcmA {
  private appliquerLesValeurs(
    energieCoeff: number,
    bonneReponse: number,
    dist1: number,
    dist2: number,
    dist3: number,
  ): void {
    // Test si le résultat est exact ou approché
    const resultatExact = new Decimal(energieCoeff).div(3.6).toNumber()
    const estApproche = Math.abs(resultatExact - bonneReponse) > 0.001
    const symbole = estApproche ? '\\approx' : '='

    // Calcul de l'approximation par 4
    const numApprox = Math.round(energieCoeff)
    const resultatApprox = numApprox / 4

    this.enonce = `Un appareil a besoin d'une énergie de $${texNombre(energieCoeff)} \\times 10^{6}$ Joules ($\\text{J}$) pour se mettre en route.<br>
À combien de kilowatt-heures ($\\text{kWh}$) cela correspond-il ?<br>
<br>
$\\textit{Données :}$ $1~\\text{kWh} = 3,6 \\times 10^{6}~\\text{J}.$`

    this.correction = `Pour convertir des Joules en kWh, on utilise la relation donnée :<br>
$1~\\text{kWh} = 3,6 \\times 10^{6}~\\text{J}$<br>
L'énergie en Joules est : $E = ${texNombre(energieCoeff)} \\times 10^{6}~\\text{J}$<br>
Pour trouver l'énergie en kWh, on divise par $3,6 \\times 10^{6}$ :<br>
$E_{\\text{kWh}} = \\dfrac{${texNombre(energieCoeff)} \\times 10^{6}}{3,6 \\times 10^{6}} = \\dfrac{${texNombre(energieCoeff)}}{3,6} ${symbole} ${texNombre(bonneReponse)}~\\text{kWh}$<br>
Sans calculatrice, on peut estimer la valeur en approchant $${texNombre(energieCoeff)}$ par $${numApprox}$ et $3,6$ par $4$.<br>
On obtient alors : $\\dfrac{${numApprox}}{4} = ${texNombre(resultatApprox)}$, ce qui nous indique que le résultat est proche de $${texNombre(resultatApprox)}$.<br>
La seule réponse possible est $${miseEnEvidence(texNombre(bonneReponse))}$ ${texteEnCouleurEtGras('kWh')}.`

    this.reponses = [
      `$${texNombre(bonneReponse)}~\\text{kWh}$`,
      `$${texNombre(dist1)}~\\text{kWh}$`,
      `$${texNombre(dist2)}~\\text{kWh}$`,
      `$${texNombre(dist3)}~\\text{kWh}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7.5, 2.08, 0.5, 5.3, 20.35)
  }

  versionAleatoire = () => {
    // On choisit d'abord une partie entière cible pour le résultat (on exclut 0)
    const partieEntiereCible = choice([1, 2, 3, 4])

    // On génère un energieCoeff qui donnera cette partie entière
    // energieCoeff / 3.6 doit être entre partieEntiereCible et partieEntiereCible+1
    // Donc energieCoeff doit être entre 3.6*partieEntiereCible et 3.6*(partieEntiereCible+1)
    const borneMinDec = new Decimal(36).times(partieEntiereCible).div(10)
    const borneMaxDec = new Decimal(36).times(partieEntiereCible + 1).div(10)

    // On génère une valeur avec 1 décimale entre borneMin et borneMax
    // On exclut les multiples exacts de 3.6 (pour éviter les divisions exactes)
    let energieCoeffDec: Decimal
    let energieCoeff: number
    let bonneReponseDec: Decimal
    let bonneReponse: number
    let resultatExact: number

    do {
      const pas = borneMaxDec.minus(borneMinDec).div(10)
      energieCoeffDec = borneMinDec.plus(pas.times(randint(0, 10)))
      energieCoeff = energieCoeffDec.toNumber()

      // On calcule la bonne réponse
      bonneReponseDec = energieCoeffDec.div(new Decimal(36).div(10))
      bonneReponse = parseFloat(bonneReponseDec.toFixed(2))

      // On vérifie que ce n'est pas une division exacte
      resultatExact = energieCoeffDec.div(new Decimal(36).div(10)).toNumber()
    } while (Math.abs(resultatExact - Math.round(resultatExact)) < 0.001) // Répéter si division exacte

    // On génère les distracteurs
    // dist1 : division par 15 au lieu de 3.6 (erreur classique)
    const dist1Dec = energieCoeffDec.div(15)
    const dist1 = parseFloat(dist1Dec.toFixed(2))

    // dist2 : multiplication par energieCoeff au lieu de diviser
    const dist2Dec = energieCoeffDec.times(new Decimal(7).div(10))
    const dist2 = parseFloat(dist2Dec.toFixed(1))

    // dist3 : multiplication par 10 (confusion avec les puissances)
    const dist3Dec = bonneReponseDec.times(10)
    const dist3 = parseFloat(dist3Dec.toFixed(2))

    this.appliquerLesValeurs(energieCoeff, bonneReponse, dist1, dist2, dist3)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
