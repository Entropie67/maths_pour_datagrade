// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 83a52 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'

// import ExerciceQcmA from '../../ExerciceQcmA'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '83a52'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer en utilisant une proportionnalité'
export const dateDePublication = '14/01/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C15hOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    masse1L: number,
    unite1L: string,
    volume: number,
    bonneReponse: number,
    uniteReponse: string,
    dist1: number,
    unite1: string,
    dist2: number,
    unite2: string,
    dist3: number,
    unite3: string,
  ): void {
    // Calcul mental explicatif
    let explicationCalcul = ''
    if (volume === 100) {
      // 100 mL = 1/10 de litre
      if (unite1L === 'g') {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ g.<br>
Pour $100$ mL (soit un dixième de litre), on divise par $10$ :<br>
$${texNombre(masse1L)} \\div 10 = ${texNombre(masse1L / 10)}$ g`
      } else {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ kg.<br>
Pour $100$ mL (soit un dixième de litre), on divise par $10$ :<br>
$${texNombre(masse1L)} \\div 10 = ${texNombre(masse1L / 10)}$ kg`
      }
    } else if (volume === 200) {
      // 200 mL = 1/5 de litre
      if (unite1L === 'g') {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ g.<br>
Pour $200$ mL (soit un cinquième de litre), on divise par $5$ :<br>
$${texNombre(masse1L)} \\div 5 = ${texNombre(masse1L / 5)}$ g`
      } else {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ kg.<br>
Pour $200$ mL (soit un cinquième de litre), on divise par $5$ :<br>
$${texNombre(masse1L)} \\div 5 = ${texNombre(masse1L / 5)}$ kg`
      }
    } else if (volume === 250) {
      // 250 mL = 1/4 de litre
      if (unite1L === 'g') {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ g.<br>
Pour $250$ mL (soit un quart de litre), on divise par $4$ :<br>
$${texNombre(masse1L)} \\div 4 = ${texNombre(masse1L / 4)}$ g`
      } else {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ kg.<br>
Pour $250$ mL (soit un quart de litre), on divise par $4$ :<br>
$${texNombre(masse1L)} \\div 4 = ${texNombre(masse1L / 4)}$ kg`
      }
    } else if (volume === 500) {
      // 500 mL = 1/2 litre
      if (unite1L === 'g') {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ g.<br>
Pour $500$ mL (soit un demi-litre), on divise par $2$ :<br>
$${texNombre(masse1L)} \\div 2 = ${texNombre(masse1L / 2)}$ g`
      } else {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ kg.<br>
Pour $500$ mL (soit un demi-litre), on divise par $2$ :<br>
$${texNombre(masse1L)} \\div 2 = ${texNombre(masse1L / 2)}$ kg`
      }
    } else if (volume === 750) {
      // 750 mL = 3/4 de litre
      if (unite1L === 'g') {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ g.<br>
Pour $750$ mL (soit trois quarts de litre, $0,75$ L), on multiplie par $0,75$ :<br>
$${texNombre(masse1L)} \\times 0,75 = ${texNombre(masse1L * 0.75)}$ g`
      } else {
        explicationCalcul = `La masse d'un litre est de $${texNombre(masse1L)}$ kg.<br>
Pour $750$ mL (soit trois quarts de litre, $0,75$ L), on multiplie par $0,75$ :<br>
$${texNombre(masse1L)} \\times 0,75 = ${texNombre(masse1L * 0.75)}$ kg`
      }
    }

    // Conversion si nécessaire
    let explicationConversion = ''
    if (unite1L === 'g' && uniteReponse === 'kg') {
      const masseEnG = masse1L * (volume / 1000)
      explicationConversion = `<br>La masse obtenue est $${texNombre(masseEnG)}$ g.<br>
Pour convertir en kg : $${texNombre(masseEnG)}$ g $= ${texNombre(bonneReponse)}$ kg`
    } else if (unite1L === 'kg' && uniteReponse === 'g') {
      const masseEnKg = masse1L * (volume / 1000)
      explicationConversion = `<br>La masse obtenue est $${texNombre(masseEnKg)}$ kg.<br>
Pour convertir en g : $${texNombre(masseEnKg)}$ kg $= ${texNombre(bonneReponse)}$ g`
    }

    this.enonce = `La masse d'un litre d'huile est égale à $${texNombre(masse1L)}$ ${unite1L}.<br>
La masse de $${volume}$ millilitres de cette huile est égale à :`

    this.correction = `Pour trouver la masse de $${volume}$ mL d'huile, on utilise la proportionnalité :
<br>
$${volume}$ mL $= ${texNombre(volume / 1000)}$ L
<br>
${explicationCalcul}${explicationConversion}
<br>
La bonne réponse est donc : $${miseEnEvidence(`${texNombre(bonneReponse)}`)}$ ${texteEnCouleur(`${uniteReponse}`)}.`

    this.reponses = [
      `$${texNombre(bonneReponse)}\\text{ ${uniteReponse}}$`,
      `$${texNombre(dist1)}\\text{ ${unite1}}$`,
      `$${texNombre(dist2)}\\text{ ${unite2}}$`,
      `$${texNombre(dist3)}\\text{ ${unite3}}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Cas original de l'image : 1L = 900g, volume = 750mL, réponse = 0,675 kg
    this.appliquerLesValeurs(
      900,
      'g', // masse d'1L
      750, // volume en mL
      0.675,
      'kg', // bonne réponse (675g = 0,675 kg)
      750,
      'g', // distracteur 1 (le volume directement)
      6.75,
      'kg', // distracteur 2 (erreur de virgule)
      67.5,
      'g', // distracteur 3 (erreur de virgule)
    )
  }

  versionAleatoire = () => {
    // 16 cas variés : 4 cas pour chaque volume (100, 200, 250, 500 mL)
    // Pour chaque volume : 1 cas g→g, 1 cas kg→kg, 1 cas g→kg, 1 cas kg→g
    // [masse1L, unite1L, volume, bonneReponse, uniteReponse, dist1, unite1, dist2, unite2, dist3, unite3]
    const cas: Array<
      [
        number,
        string,
        number,
        number,
        string,
        number,
        string,
        number,
        string,
        number,
        string,
      ]
    > = [
      // 4 cas avec 100 mL (diviser par 10)
      [900, 'g', 100, 90, 'g', 100, 'g', 0.9, 'kg', 9, 'g'], // g → g
      [0.9, 'kg', 100, 0.09, 'kg', 100, 'g', 9, 'g', 0.9, 'kg'], // kg → kg
      [850, 'g', 100, 0.085, 'kg', 100, 'g', 8.5, 'g', 0.85, 'kg'], // g → kg
      [0.8, 'kg', 100, 80, 'g', 8, 'kg', 100, 'g', 8, 'g'], // kg → g (dist1: 8 kg au lieu de 0.08 kg)

      // 4 cas avec 200 mL (diviser par 5)
      [900, 'g', 200, 180, 'g', 200, 'g', 1.8, 'kg', 18, 'g'], // g → g
      [0.9, 'kg', 200, 0.18, 'kg', 200, 'g', 18, 'g', 1.8, 'kg'], // kg → kg
      [850, 'g', 200, 0.17, 'kg', 200, 'g', 17, 'g', 1.7, 'kg'], // g → kg
      [0.8, 'kg', 200, 160, 'g', 1.6, 'kg', 200, 'g', 16, 'g'], // kg → g (dist1: 1.6 kg au lieu de 0.16 kg)

      // 4 cas avec 250 mL (diviser par 4)
      [920, 'g', 250, 230, 'g', 250, 'g', 2.3, 'kg', 23, 'g'], // g → g
      [0.92, 'kg', 250, 0.23, 'kg', 250, 'g', 23, 'g', 2.3, 'kg'], // kg → kg
      [880, 'g', 250, 0.22, 'kg', 250, 'g', 22, 'g', 2.2, 'kg'], // g → kg
      [0.84, 'kg', 250, 210, 'g', 2.1, 'kg', 250, 'g', 21, 'g'], // kg → g (dist1: 2.1 kg au lieu de 0.21 kg)

      // 4 cas avec 500 mL (diviser par 2)
      [920, 'g', 500, 460, 'g', 500, 'g', 4.6, 'kg', 46, 'g'], // g → g
      [0.92, 'kg', 500, 0.46, 'kg', 500, 'g', 46, 'g', 4.6, 'kg'], // kg → kg
      [860, 'g', 500, 0.43, 'kg', 500, 'g', 43, 'g', 4.3, 'kg'], // g → kg
      [0.84, 'kg', 500, 420, 'g', 4.2, 'kg', 500, 'g', 42, 'g'], // kg → g (dist1: 4.2 kg au lieu de 0.42 kg)
    ]

    const indexCas = choice([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ])
    const [
      masse1L,
      unite1L,
      volume,
      bonneReponse,
      uniteReponse,
      dist1,
      unite1,
      dist2,
      unite2,
      dist3,
      unite3,
    ] = cas[indexCas]

    this.appliquerLesValeurs(
      masse1L,
      unite1L,
      volume,
      bonneReponse,
      uniteReponse,
      dist1,
      unite1,
      dist2,
      unite2,
      dist3,
      unite3,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
