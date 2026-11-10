import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '20/02/2026'
export const uuid = '7168a'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C05-5', '2A-N5-5'],
  'fr-ch': ['10CTQCMNO-7', '10LCQCMNO-8', '10LSQCMNO-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Donner un ordre de grandeur à partir d'une situation de la vie courante"
export default class auto1AC5e extends ExerciceQcmA {
  private appliquerLesValeurs(
    enonce: string,
    bonneReponse: string,
    distracteurs: [string, string, string],
    correction: string,
  ): void {
    this.enonce = enonce
    this.correction = correction
    this.reponses = [bonneReponse, ...distracteurs]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      "Parmi les quatre propositions, laquelle est un ordre de grandeur de la longueur d'un terrain de football ?",
      '$0,1$ $\\text{km}$',
      ['$10$ $\\text{km}$', '$0,1$ $\\text{m}$', '$10$ $\\text{dm}$'],
      `Un terrain de football mesure environ $100$ $\\text{m}$. Comme $1\\text{ km}=1\\,000\\text{ m}$, on divise par $1\\,000$ : $100\\text{ m}=100\\div 1\\,000\\text{ km}=${miseEnEvidence('0,1\\text{ km}')}$.`,
    )
  }

  versionAleatoire = () => {
    const situations: {
      enonce: string
      bonneReponse: string
      distracteurs: [string, string, string]
      correction: string
    }[] = [
      // ===== LONGUEURS =====
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la longueur d'un terrain de football ?",
        bonneReponse: '$0,1\\text{ km}$',
        distracteurs: [
          '$1\\text{ km}$',
          `$${texNombre(1000)}\\text{ cm}$`,
          '$10\\text{ dm}$',
        ],
        correction: `Un terrain de football mesure environ $100$ $\\text{m}$. <br>Comme $1\\text{ km}=1\\,000\\text{ m}$, on divise par $1\\,000$ : <br>$100\\text{ m}=100\\div 1\\,000\\text{ km}=${miseEnEvidence('0,1\\text{ km}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la taille d'une fourmi ?",
        bonneReponse: '$0,05\\text{ dm}$',
        distracteurs: ['$0,05\\text{ m}$', '$5\\text{ dm}$', '$0,5\\text{ m}$'],
        correction: `Une fourmi mesure environ $5$ $\\text{mm}$. <br>Comme $1\\text{ dm}=100\\text{ mm}$, on divise par $100$ : <br>$5\\text{ mm}=5\\div 100\\text{ dm}=${miseEnEvidence('0,05\\text{ dm}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la taille d'un être humain adulte ?",
        bonneReponse: '$17\\text{ dm}$',
        distracteurs: [
          '$17\\text{ m}$',
          '$0,17\\text{ dm}$',
          '$170\\text{ mm}$',
        ],
        correction: `Un être humain adulte mesure environ $1,70$ $\\text{m}$.<br> Comme $1\\text{ m}=10\\text{ dm}$, on multiplie par $10$ : <br>$1,70\\text{ m}=1,70\\times 10\\text{ dm}=${miseEnEvidence('17\\text{ dm}')}$.`,
      },

      {
        enonce:
          'Parmi les quatre propositions, laquelle est un ordre de grandeur de la hauteur de la tour Eiffel ?',
        bonneReponse: '$30\\text{ dam}$',
        distracteurs: [
          '$3\\text{ km}$',
          '$30\\text{ dm}$',
          '$0,03\\text{ km}$',
        ],
        correction: `La tour Eiffel mesure environ $330$ $\\text{m}$. <br>Comme $1\\text{ dam}=10\\text{ m}$, on divise par $10$ :<br> $330\\text{ m}=330\\div 10\\text{ dam}=33\\text{ dam}$, de l'ordre de $${miseEnEvidence('30\\text{ dam}')}$.`,
      },
      {
        enonce:
          'Parmi les quatre propositions, laquelle est un ordre de grandeur de la distance Paris-Marseille ?',
        bonneReponse: '$800\\,000\\text{ m}$',
        distracteurs: [
          '$80\\,000\\text{ m}$',
          '$8\\,000\\text{ m}$',
          '$8\\,000\\,000\\text{ m}$',
        ],
        correction: `La distance Paris-Marseille est d'environ $800$ $\\text{km}$.<br> Comme $1\\text{ km}=1\\,000\\text{ m}$, on multiplie par $1\\,000$ : <br>$800\\text{ km}=800\\times 1\\,000\\text{ m}=${miseEnEvidence('800\\,000\\text{ m}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la longueur d'une voiture ?",
        bonneReponse: '$0,4\\text{ dam}$',
        distracteurs: [
          '$4\\text{ dm}$',
          '$0,04\\text{ dam}$',
          '$4\\text{ hm}$',
        ],
        correction: `Une voiture mesure environ $4$ $\\text{m}$. <br>Comme $1\\text{ dam}=10\\text{ m}$, on divise par $10$ : <br>$4\\text{ m}=4\\div 10\\text{ dam}=${miseEnEvidence('0,4\\text{ dam}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la longueur d'un stylo ?",
        bonneReponse: '$0,15\\text{ m}$',
        distracteurs: [
          '$1,5\\text{ m}$',
          '$0,015\\text{ m}$',
          '$15\\text{ m}$',
        ],
        correction: `Un stylo mesure environ $15$ $\\text{cm}$. <br>Comme $1\\text{ m}=100\\text{ cm}$, on divise par $100$ : <br>$15\\text{ cm}=15\\div 100\\text{ m}=${miseEnEvidence('0,15\\text{ m}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la largeur d'une main ?",
        bonneReponse: '$0,1\\text{ m}$',
        distracteurs: ['$1\\text{ m}$', '$0,01\\text{ m}$', '$10\\text{ m}$'],
        correction: `La largeur d'une main est d'environ $10$ $\\text{cm}$. <br>Comme $1\\text{ m}=100\\text{ cm}$, on divise par $100$ : <br>$10\\text{ cm}=10\\div 100\\text{ m}=${miseEnEvidence('0,1\\text{ m}')}$.`,
      },

      // ===== VITESSES =====
      {
        enonce: "La vitesse maximale  d'un train à grande vitesse peut être :",
        bonneReponse: '$320\\text{ km/h}$',
        distracteurs: [
          '$30\\text{ km/h}$',
          '$110\\text{ km/h}$',
          `$${texNombre(1280)}\\text{ km/h}$`,
        ],
        correction: `La vitesse maximale d'un train à grande vitesse est de l'ordre de $${miseEnEvidence('320\\text{ km/h}')}$.`,
      },
      {
        enonce:
          'Un piéton marche à une vitesse $V$ en $\\text{m/s}$. Il est plus vraisemblable que :',
        bonneReponse: '$V \\approx 1,4$',
        distracteurs: [
          '$V \\approx 14$',
          '$V \\approx 0,14$',
          '$V \\approx 140$',
        ],
        correction: `Un piéton marche à environ $5$ $\\text{km/h}$. <br>Or $1\\text{ km}=1\\,000\\text{ m}$ et $1\\text{ h}=3\\,600\\text{ s}$, donc $1\\text{ km/h}=\\dfrac{1\\,000}{3\\,600}\\text{ m/s}=\\dfrac{1}{3,6}\\text{ m/s}$. <br>
        Convertir des $\\text{km/h}$ en $\\text{m/s}$ revient donc à diviser par $3,6$ : <br>$5\\div 3,6\\approx 1,4$, soit $${miseEnEvidence('V \\approx 1,4')}$ $\\text{m/s}$.`,
      },

      {
        enonce:
          'Un cycliste roule en ville à une vitesse  $\\text{m/min}$. Il est plus vraisemblable que :',
        bonneReponse: '$V \\approx 330$',
        distracteurs: [
          '$V \\approx 33$',
          '$V \\approx 3\\,300$',
          '$V \\approx 3,3$',
        ],
        correction: `Un cycliste roule à environ $20$ $\\text{km/h}$, soit $20\\,000$ $\\text{m}$ en $60$ $\\text{min}$ : $20\\,000 \\div 60 \\approx 333$, de l'ordre de $${miseEnEvidence('V \\approx 330')}$ $\\text{m/min}$.`,
      },

      // ===== MASSES =====
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'une pomme ?",
        bonneReponse: '$0,15\\text{ kg}$',
        distracteurs: [
          '$1,5\\text{ kg}$',
          '$0,015\\text{ kg}$',
          '$15\\text{ kg}$',
        ],
        correction: `Une pomme pèse environ $150$ $\\text{g}$. <br>Comme $1\\text{ kg}=1\\,000\\text{ g}$, on divise par $1\\,000$ :<br> $150\\text{ g}=150\\div 1\\,000\\text{ kg}=${miseEnEvidence('0,15\\text{ kg}')}$.`,
      },
      {
        enonce:
          " Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'un être humain adulte ?",
        bonneReponse: '$70\\,000\\text{ g}$',
        distracteurs: [
          '$7\\,000\\text{ g}$',
          '$700\\,000\\text{ g}$',
          '$700\\text{ g}$',
        ],
        correction: `Un être humain adulte pèse environ $70$ $\\text{kg}$. <br>Comme $1\\text{ kg}=1\\,000\\text{ g}$, on multiplie par $1\\,000$ :<br> $70\\text{ kg}=70\\times 1\\,000\\text{ g}=${miseEnEvidence('70\\,000\\text{ g}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'une voiture ?",
        bonneReponse: '$1,2\\text{ t}$',
        distracteurs: ['$12\\text{ t}$', '$0,12\\text{ t}$', '$120\\text{ t}$'],
        correction: `Une voiture pèse environ $1\\,200$ $\\text{kg}$. Comme $1\\text{ t}=1\\,000\\text{ kg}$, on divise par $1\\,000$ : $1\\,200\\text{ kg}=1\\,200\\div 1\\,000\\text{ t}=${miseEnEvidence('1,2\\text{ t}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'un morceau de sucre ?",
        bonneReponse: '$0,006\\text{ kg}$',
        distracteurs: [
          '$0,06\\text{ kg}$',
          '$0,6\\text{ kg}$',
          '$6\\text{ kg}$',
        ],
        correction: `Un morceau de sucre pèse environ $6$ $\\text{g}$. <br>Comme $1\\text{ kg}=1\\,000\\text{ g}$, on divise par $1\\,000$ : <br>$6\\text{ g}=6\\div 1\\,000\\text{ kg}=${miseEnEvidence('0,006\\text{ kg}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'une baguette de pain ?",
        bonneReponse: '$0,25\\text{ kg}$',
        distracteurs: [
          '$2,5\\text{ kg}$',
          '$0,025\\text{ kg}$',
          '$25\\text{ kg}$',
        ],
        correction: `Une baguette de pain pèse environ $250$ $\\text{g}$. <br>Comme $1\\text{ kg}=1\\,000\\text{ g}$, on divise par $1\\,000$ : <br>$250\\text{ g}=250\\div 1\\,000\\text{ kg}=${miseEnEvidence('0,25\\text{ kg}')}$.`,
      },

      // ===== CONTENANCES =====
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la contenance d'une canette de soda ?",
        bonneReponse: '$0,33\\text{ L}$',
        distracteurs: [
          '$3,3\\text{ L}$',
          '$0,033\\text{ L}$',
          '$33\\text{ L}$',
        ],
        correction: `Une canette de soda contient environ $33$ $\\text{cL}$. <br>Comme $1\\text{ L}=100\\text{ cL}$, on divise par $100$ : <br>$33\\text{ cL}=33\\div 100\\text{ L}=${miseEnEvidence('0,33\\text{ L}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la contenance d'une baignoire ?",
        bonneReponse: '$200\\,000\\text{ mL}$',
        distracteurs: [
          '$20\\,000\\text{ mL}$',
          '$2\\,000\\,000\\text{ mL}$',
          '$2\\,000\\text{ mL}$',
        ],
        correction: `Une baignoire contient environ $200$ $\\text{L}$. <br>Comme $1\\text{ L}=1\\,000\\text{ mL}$, on multiplie par $1\\,000$ : <br>$200\\text{ L}=200\\times 1\\,000\\text{ mL}=${miseEnEvidence('200\\,000\\text{ mL}')}$.`,
      },

      // ===== AJOUTS =====
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de l'épaisseur d'un livre ?",
        bonneReponse: '$0,02\\text{ m}$',
        distracteurs: ['$0,2\\text{ m}$', '$0,002\\text{ m}$', '$2\\text{ m}$'],
        correction: `Un livre a une épaisseur d'environ $2$ $\\text{cm}$. Comme $1\\text{ m}=100\\text{ cm}$, on divise par $100$ : $2\\text{ cm}=2\\div 100\\text{ m}=${miseEnEvidence('0,02\\text{ m}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la masse d'un œuf ?",
        bonneReponse: '$0,06\\text{ kg}$',
        distracteurs: [
          '$0,6\\text{ kg}$',
          '$0,006\\text{ kg}$',
          '$6\\text{ kg}$',
        ],
        correction: `Un œuf pèse environ $60$ $\\text{g}$. <br>Comme $1\\text{ kg}=1\\,000\\text{ g}$, on divise par $1\\,000$ : <br>$60\\text{ g}=60\\div 1\\,000\\text{ kg}=${miseEnEvidence('0,06\\text{ kg}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la contenance d'un verre d'eau ?",
        bonneReponse: '$2,5\\text{ dL}$',
        distracteurs: [
          '$25\\text{ dL}$',
          '$0,25\\text{ dL}$',
          '$250\\text{ dL}$',
        ],
        correction: `Un verre d'eau contient environ $25$ $\\text{cL}$. <br>Comme $1\\text{ dL}=10\\text{ cL}$, on divise par $10$ : <br>$25\\text{ cL}=25\\div 10\\text{ dL}=${miseEnEvidence('2,5\\text{ dL}')}$.`,
      },
      {
        enonce:
          "Parmi les quatre propositions, laquelle est un ordre de grandeur de la hauteur d'un immeuble de $5$ étages ?",
        bonneReponse: '$0,15\\text{ hm}$',
        distracteurs: [
          '$1,5\\text{ hm}$',
          '$0,015\\text{ hm}$',
          '$15\\text{ hm}$',
        ],
        correction: `Un immeuble de $5$ étages mesure environ $15$ $\\text{m}$. <br>Comme $1\\text{ hm}=100\\text{ m}$, on divise par $100$ : <br>$15\\text{ m}=15\\div 100\\text{ hm}=${miseEnEvidence('0,15\\text{ hm}')}$.`,
      },
    ]

    const situationChoisie = choice(situations)
    this.appliquerLesValeurs(
      situationChoisie.enonce,
      situationChoisie.bonneReponse,
      situationChoisie.distracteurs,
      situationChoisie.correction,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
