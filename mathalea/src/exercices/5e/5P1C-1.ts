import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  "Reconnaître une situation de proportionnalité à l'aide d'un graphique"
export const interactifReady = true
export const dateDePublication = '25/10/2026'
export const uuid = '6a633'

export const refs = {
  'fr-fr': ['5P1C-1', '3AutoP01-4'],
  'fr-ch': ['9R1FA1A-5', '9R2FA1A-5', '9R3FA1A-5', 'PRQPF03A-6'],
}

/**
 * Un graphique est donné ; l'élève doit dire si la grandeur 1 est proportionnelle à la grandeur 2.
 * @author Rémi Angot
 */

type Nature = 'proportionnelle' | 'affine' | 'courbe'

type Situation = {
  /** Grandeur lue en ordonnée, avec son article : « le périmètre du triangle équilatéral » */
  grandeurY: string
  feminin: boolean
  /** Grandeur lue en abscisse, après « en fonction » : « du côté du triangle » */
  grandeurXDe: string
  /** Grandeur lue en abscisse, après « proportionnel » : « au côté du triangle » */
  grandeurXA: string
  legendeY: string
  legendeX: string
  nature: Nature
  f: (x: number) => number
  xMax: number
  /** Écart entre deux graduations (et deux croix) en abscisse */
  xPas: number
  yPas: number
}

const nombreDeSituations = 12

/** Plus petit multiple de `pas` supérieur ou égal à `valeur`. */
const multipleSuperieur = (valeur: number, pas: number) =>
  Math.ceil(valeur / pas - 1e-9) * pas

function creeSituation(numero: number): Situation {
  switch (numero) {
    case 1:
      return {
        grandeurY: 'le périmètre du triangle équilatéral',
        feminin: false,
        grandeurXDe: 'du côté du triangle',
        grandeurXA: 'au côté du triangle',
        legendeY: 'Périmètre (en cm)',
        legendeX: 'Côté (en cm)',
        nature: 'proportionnelle',
        f: (x) => 3 * x,
        xMax: 4,
        xPas: 1,
        yPas: 4,
      }
    case 2:
      return {
        grandeurY: "l'aire du triangle équilatéral",
        feminin: true,
        grandeurXDe: 'du côté du triangle',
        grandeurXA: 'au côté du triangle',
        legendeY: 'Aire (en cm²)',
        legendeX: 'Côté (en cm)',
        nature: 'courbe',
        f: (x) => (Math.sqrt(3) / 4) * x * x,
        xMax: 4,
        xPas: 1,
        yPas: 3,
      }
    case 3:
      return {
        grandeurY: 'le périmètre du carré',
        feminin: false,
        grandeurXDe: 'du côté du carré',
        grandeurXA: 'au côté du carré',
        legendeY: 'Périmètre (en cm)',
        legendeX: 'Côté (en cm)',
        nature: 'proportionnelle',
        f: (x) => 4 * x,
        xMax: 4,
        xPas: 1,
        yPas: 4,
      }
    case 4:
      return {
        grandeurY: "l'aire du carré",
        feminin: true,
        grandeurXDe: 'du côté du carré',
        grandeurXA: 'au côté du carré',
        legendeY: 'Aire (en cm²)',
        legendeX: 'Côté (en cm)',
        nature: 'courbe',
        f: (x) => x * x,
        xMax: 4,
        xPas: 1,
        yPas: 4,
      }
    case 5:
      return {
        grandeurY: 'le périmètre du cercle',
        feminin: false,
        grandeurXDe: 'du diamètre du cercle',
        grandeurXA: 'au diamètre du cercle',
        legendeY: 'Périmètre (en cm)',
        legendeX: 'Diamètre (en cm)',
        nature: 'proportionnelle',
        f: (x) => Math.PI * x,
        xMax: 4,
        xPas: 1,
        yPas: 2,
      }
    case 6:
      return {
        grandeurY: "l'aire du disque",
        feminin: true,
        grandeurXDe: 'du rayon du disque',
        grandeurXA: 'au rayon du disque',
        legendeY: 'Aire (en cm²)',
        legendeX: 'Rayon (en cm)',
        nature: 'courbe',
        f: (x) => Math.PI * x * x,
        xMax: 3,
        xPas: 1,
        yPas: 10,
      }
    case 7:
      return {
        grandeurY: 'le volume du cube',
        feminin: false,
        grandeurXDe: "de l'arête du cube",
        grandeurXA: "à l'arête du cube",
        legendeY: 'Volume (en cm³)',
        legendeX: 'Arête (en cm)',
        nature: 'courbe',
        f: (x) => x * x * x,
        xMax: 3,
        xPas: 1,
        yPas: 10,
      }
    case 8: {
      const article = choice(['stylos', 'cahiers', 'trombones'])
      const prixUnitaire = choice([1, 2, 3])
      const seuil = 200
      const degressif = choice([true, false])
      const f = (x: number) =>
        x <= seuil
          ? prixUnitaire * x
          : prixUnitaire * seuil + (prixUnitaire / 2) * (x - seuil)
      return {
        grandeurY: `le prix des ${article}`,
        feminin: false,
        grandeurXDe: 'de leur nombre',
        grandeurXA: 'à leur nombre',
        legendeY: 'Prix (en €)',
        legendeX: `Nombre de ${article}`,
        nature: degressif ? 'courbe' : 'proportionnelle',
        f: degressif ? f : (x) => prixUnitaire * x,
        xMax: 400,
        xPas: 100,
        yPas: 100 * prixUnitaire,
      }
    }
    case 9: {
      const vitesse = choice([20, 30, 40, 50])
      const vitesseReduite = vitesse / 2
      const changementDeVitesse = choice([true, false])
      return {
        grandeurY: 'la distance parcourue',
        feminin: true,
        grandeurXDe: 'de la durée du trajet',
        grandeurXA: 'à la durée du trajet',
        legendeY: 'Distance (en km)',
        legendeX: 'Temps (en h)',
        nature: changementDeVitesse ? 'courbe' : 'proportionnelle',
        f: changementDeVitesse
          ? (x) =>
              x <= 2 ? vitesse * x : 2 * vitesse + vitesseReduite * (x - 2)
          : (x) => vitesse * x,
        xMax: 4,
        xPas: 1,
        yPas: vitesse,
      }
    }
    case 10: {
      const forfait = choice([10, 15, 20])
      const prixParJour = choice([10, 15, 20])
      const avecForfait = choice([true, false])
      return {
        grandeurY: 'le tarif de location',
        feminin: false,
        grandeurXDe: 'du nombre de jours',
        grandeurXA: 'au nombre de jours',
        legendeY: 'Tarif (en €)',
        legendeX: 'Nombre de jours',
        nature: avecForfait ? 'affine' : 'proportionnelle',
        f: avecForfait
          ? (x) => forfait + prixParJour * x
          : (x) => prixParJour * x,
        xMax: 4,
        xPas: 1,
        yPas: 25,
      }
    }
    case 11: {
      const priseEnCharge = choice([3, 4, 5])
      const prixAuKilometre = choice([1, 2])
      return {
        grandeurY: 'le prix de la course en taxi',
        feminin: false,
        grandeurXDe: 'de la distance parcourue',
        grandeurXA: 'à la distance parcourue',
        legendeY: 'Prix (en €)',
        legendeX: 'Distance (en km)',
        nature: 'affine',
        f: (x) => priseEnCharge + prixAuKilometre * x,
        xMax: 5,
        xPas: 1,
        yPas: 5,
      }
    }
    default: {
      const variante = choice([
        'chauffe depuis zero',
        'chauffe depuis une valeur',
        'refroidit depuis une valeur',
        'refroidit depuis zero',
      ])
      const vitesse = choice([10, 20])
      const temperatureInitiale = choice([10, 20, 40, 50, 60])
      switch (variante) {
        case 'chauffe depuis zero':
          return {
            grandeurY: "la température de l'eau",
            feminin: true,
            grandeurXDe: 'du temps',
            grandeurXA: 'au temps',
            legendeY: 'Température (en °C)',
            legendeX: 'Temps (en min)',
            nature: 'proportionnelle',
            f: (x) => vitesse * x,
            xMax: 4,
            xPas: 1,
            yPas: vitesse,
          }
        case 'chauffe depuis une valeur':
          return {
            grandeurY: "la température de l'eau",
            feminin: true,
            grandeurXDe: 'du temps',
            grandeurXA: 'au temps',
            legendeY: 'Température (en °C)',
            legendeX: 'Temps (en min)',
            nature: 'affine',
            f: (x) => temperatureInitiale + vitesse * x,
            xMax: 4,
            xPas: 1,
            yPas: vitesse,
          }
        case 'refroidit depuis une valeur':
          return {
            grandeurY: 'la température du liquide',
            feminin: true,
            grandeurXDe: 'du temps',
            grandeurXA: 'au temps',
            legendeY: 'Température (en °C)',
            legendeX: 'Temps (en h)',
            nature: 'affine',
            f: (x) => temperatureInitiale - 10 * x,
            xMax: 4,
            xPas: 1,
            yPas: 10,
          }
        default:
          return {
            grandeurY: 'la température de la glace',
            feminin: true,
            grandeurXDe: 'du temps',
            grandeurXA: 'au temps',
            legendeY: 'Température (en °C)',
            legendeX: 'Temps (en h)',
            nature: 'proportionnelle',
            f: (x) => -vitesse * x,
            xMax: 4,
            xPas: 1,
            yPas: vitesse,
          }
      }
    }
  }
}

/** Plus grand multiple de `pas` inférieur ou égal à `valeur`. */
const multipleInferieur = (valeur: number, pas: number) =>
  Math.floor(valeur / pas + 1e-9) * pas

/** Construit le graphique : une courbe, avec des croix en abscisses régulières. */
function creeGraphique(situation: Situation) {
  const { f, xMax, xPas, yPas } = situation
  const yMin = multipleInferieur(Math.min(f(0), f(xMax), 0), yPas)
  let yMax = multipleSuperieur(Math.max(f(0), f(xMax), 0), yPas)
  // Laisse de la place au-dessus de l'axe des abscisses quand la courbe est négative
  if (yMax === 0) yMax = yPas
  const hauteur = 5
  const xUnite = 8 / xMax
  const yUnite = hauteur / (yMax - yMin)
  const r = repere({
    xMin: 0,
    xMax,
    yMin,
    yMax,
    xUnite,
    yUnite,
    xThickDistance: xPas,
    yThickDistance: yPas,
    xLabelDistance: xPas,
    yLabelDistance: yPas,
    xThickMin: 0,
    yThickMin: yMin,
    xLabelMin: 0,
    yLabelMin: yMin,
    xThickMax: xMax,
    yThickMax: yMax,
    xLabelMax: xMax,
    yLabelMax: yMax,
    grille: true,
    grilleXDistance: xPas * xUnite,
    grilleYDistance: yPas * yUnite,
    grilleOpacite: 0.6,
    grilleCouleur: 'gray',
    xLegende: situation.legendeX,
    yLegende: situation.legendeY,
    xLegendePosition: [xMax * xUnite + 0.3, -0.7],
    yLegendePosition: [2, yMax * yUnite + 0.6],
  })
  const objets: NestedObjetMathalea2dArray = [
    r,
    courbe(f, {
      repere: r,
      xMin: 0,
      xMax,
      color: 'red',
      epaisseur: 1.5,
    }),
  ]
  for (let x = 0; x < xMax; x += xPas) {
    const croix = tracePoint(pointAbstrait(x * xUnite, f(x) * yUnite))
    croix.taille = 4
    croix.epaisseur = 2
    objets.push(croix)
  }
  return mathalea2d(
    {
      xmin: -1.5,
      ymin: yMin * yUnite - 1.5,
      xmax: xMax * xUnite + 6.5,
      ymax: yMax * yUnite + 1.5,
      pixelsParCm: 30,
      scale: 0.8,
    },
    objets,
  )
}

export default class ProportionnaliteSurGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = nombreDeSituations + 1
    this.besoinFormulaireTexte = [
      'Grandeurs proposées',
      [
        'Nombres séparés par des tirets  :',
        '1 : Périmètre du triangle équilatéral en fonction du côté',
        '2 : Aire du triangle équilatéral en fonction du côté',
        '3 : Périmètre du carré en fonction du côté',
        '4 : Aire du carré en fonction du côté',
        '5 : Périmètre du cercle en fonction du diamètre',
        '6 : Aire du disque en fonction du rayon',
        "7 : Volume du cube en fonction de l'arête",
        "8 : Prix en fonction du nombre d'articles (tarif dégressif possible)",
        '9 : Distance parcourue en fonction du temps (vitesse constante ou non)',
        '10 : Tarif de location en fonction du nombre de jours (avec ou sans forfait)',
        '11 : Prix de la course en taxi en fonction de la distance',
        '12 : Température en fonction du temps (chauffage ou refroidissement)',
        '13 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: nombreDeSituations,
      melange: nombreDeSituations + 1,
      defaut: nombreDeSituations + 1,
      nbQuestions: this.nbQuestions,
    })

    const listeDeSituations = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0; i < this.nbQuestions; i++) {
      const situation = creeSituation(Number(listeDeSituations[i]))
      const estProportionnelle = situation.nature === 'proportionnelle'
      const adjectif = situation.feminin ? 'proportionnelle' : 'proportionnel'
      const estIl = situation.feminin ? 'est-elle' : 'est-il'
      const grandeur =
        situation.grandeurY[0].toUpperCase() + situation.grandeurY.slice(1)

      let texte = `Le graphique ci-dessous représente ${situation.grandeurY} en fonction ${situation.grandeurXDe}.<br>`
      texte += `${creeGraphique(situation)}<br>`
      texte += `${grandeur} ${estIl} ${adjectif} ${situation.grandeurXA} ?`
      if (!this.interactif) texte += ' Justifier la réponse.'

      const propositions = [
        { texte: 'Oui', statut: estProportionnelle },
        { texte: 'Non', statut: !estProportionnelle },
      ]
      const qcmOptions = { radio: true, vertical: false }

      let texteCorr = ''
      if (situation.nature === 'proportionnelle') {
        texteCorr +=
          "La représentation graphique est une droite qui passe par l'origine du repère.<br>"
      } else if (situation.nature === 'affine') {
        texteCorr +=
          "La représentation graphique est une droite mais elle ne passe pas par l'origine du repère.<br>"
      } else {
        texteCorr += "La représentation graphique n'est pas une droite.<br>"
      }
      texteCorr += `${texteEnCouleurEtGras(estProportionnelle ? 'Oui' : 'Non')}, ${situation.grandeurY} ${estProportionnelle ? 'est' : "n'est pas"} ${adjectif} ${situation.grandeurXA}.`

      handleAnswers(
        this,
        i,
        {
          qcm: {
            enonce: texte,
            propositions,
            correction: texteCorr,
            options: qcmOptions,
          },
        },
        { formatInteractif: 'mathalea-qcm' },
      )

      // Hors interactivité, les propositions ne sont pas affichées : l'élève justifie à l'écrit.
      if (this.interactif && context.isHtml) {
        texte += addMathaleaQcm(this, i, {
          ...qcmOptions,
          interactivityOn: true,
        })
      }

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    }
    listeQuestionsToContenu(this)
  }
}
