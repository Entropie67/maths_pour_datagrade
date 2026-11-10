// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ac9b0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { arrondi } from '../../lib/outils/nombres'
import { prenom } from '../../lib/outils/Personne'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'ac9b0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer le coût de consommation électrique d'un appareil"
export const dateDePublication = '09/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora assisté de Claude ai
 *
 */
export default class Auto1C15rOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    puissance: number,
    duree: number,
    appareil: string,
  ): void {
    const puissanceKW = puissance / 1000
    const dureeH = new FractionEtendue(duree, 60)
    const energie = puissanceKW * dureeH.valeurDecimale
    const cout = 0.2

    // Choisir aléatoirement entre "0,2 €" et "20 centimes" pour l'énoncé
    const coutEnonce = choice([
      '$0,2\\text{ €}$',
      "$20\\text{ centimes d'euro}$",
    ])

    this.enonce = `${prenom()} utilise ${appareil} pendant $${duree}$ minutes.<br>
      La puissance de cet appareil est $${texNombre(puissance)}$ watts.<br>
      Le coût d'un kilowatt-heure d'électricité est ${coutEnonce}.<br>
      Le coût en électricité pour cette utilisation est :`

    // Calculer la bonne réponse en euros et centimes
    const coutTotalEuros = energie * cout
    let coutEuros: string
    let coutCentimes: string

    if (coutTotalEuros < 0.01) {
      coutEuros = `$${texNombre(coutTotalEuros, 3)}\\text{ €}$`
      coutCentimes = `$${texNombre(coutTotalEuros * 100, 2)}\\text{ centimes d'euro}$`
    } else if (coutTotalEuros === 0.01) {
      coutEuros = '$0,01\\text{ €}$'
      coutCentimes = "$1\\text{ centime d'euro}$"
    } else if (coutTotalEuros < 0.1) {
      coutEuros = `$${texNombre(coutTotalEuros, 2)}\\text{ €}$`
      const centimes = Math.round(coutTotalEuros * 100)
      coutCentimes =
        centimes === 1
          ? "$1\\text{ centime d'euro}$"
          : `$${centimes}\\text{ centimes d'euro}$`
    } else {
      coutEuros = `$${texNombre(coutTotalEuros, 1)}\\text{ €}$`
      const centimes = Math.round(coutTotalEuros * 100)
      coutCentimes = `$${centimes}\\text{ centimes d'euro}$`
    }

    // Générer les distracteurs
    const distracteurs = [
      `$${texNombre(coutTotalEuros * 10, 1)}\\text{ €}$`, // Erreur facteur 10
      `$${texNombre(puissanceKW * cout, 2)}\\text{ €}$`, // Oubli de la durée
      `$${texNombre(coutTotalEuros * 10, 1)}\\text{ ${arrondi(coutTotalEuros * 10, 1) < 1.05 ? "centime d'euro" : "centimes d'euro"}}$`, // Confusion avec centimes
    ]

    // Bonne réponse en premier (choisir aléatoirement euros ou centimes)
    const bonneReponse = choice([coutEuros, coutCentimes])

    // Construction de la correction
    let correctionFinale = `La puissance de l'appareil est de $${texNombre(puissance)}$ W, soit $${texNombre(puissanceKW, 1)}$ kW.<br>
      La durée d'utilisation est de $${duree}$ minutes, soit $${dureeH.texFractionSimplifiee}$ heure.<br>
      L'énergie consommée est donc : $${texNombre(puissanceKW, 1)}\\times ${dureeH.texFractionSimplifiee}=${texNombre(energie, 3)}$ kWh.<br>
      Le coût de la consommation est : $${texNombre(energie, 3)}\\times ${texNombre(cout, 2)}=${texNombre(coutTotalEuros, 2)}$ €`

    // Si la bonne réponse est en centimes, ajouter la conversion
    if (bonneReponse === coutCentimes) {
      correctionFinale += `, soit ${texteEnCouleurEtGras(bonneReponse)}.`
    } else {
      correctionFinale += `, soit ${texteEnCouleurEtGras(coutEuros)}.`
    }

    this.correction = correctionFinale

    this.reponses = [bonneReponse, ...distracteurs]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1200, 10, 'un aspirateur')
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      // Tableau des configurations simples
      const configurations = [
        { puissance: 600, duree: 5 },
        { puissance: 600, duree: 10 },
        { puissance: 1000, duree: 6 },
        { puissance: 1000, duree: 10 },
        { puissance: 1200, duree: 5 },
        { puissance: 1200, duree: 10 },
        { puissance: 1200, duree: 20 },
        { puissance: 1500, duree: 10 },
        { puissance: 1500, duree: 20 },
        { puissance: 2000, duree: 15 },
        { puissance: 3000, duree: 10 },
      ]

      const config = choice(configurations)
      const appareils = [
        'un aspirateur',
        'un sèche-cheveux',
        'un fer à repasser',
        'un radiateur',
        'une bouilloire',
      ]
      const appareil = choice(appareils)

      this.appliquerLesValeurs(config.puissance, config.duree, appareil)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
