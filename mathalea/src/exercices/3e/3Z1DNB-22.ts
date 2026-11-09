import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import {
  premierMultipleInferieur,
  premierMultipleSuperieur,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'bc6ad'
export const refs = {
  'fr-fr': ['3Z1DNB-22'],
  'fr-ch': ['1mT-14'],
}
export const titre =
  'Préparation DNB : Statistiques, pourcentages, trigonométrie'
export const dateDePublication = '16/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExerciceMetropole392024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction =
      texteItalique(
        "D'après l'exercice $3$ du brevet Métropole septembre 2024.",
      ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    productions: number[],
    pourcentage: number,
    tarif: number,
    hauteurToit: number,
    longueurToit: number,
  ): void {
    const L = pointAbstrait(0, 0, 'L', 'left')
    const O = pointAbstrait(4, 3, 'O', 'above')
    const K = pointAbstrait(8, 0, 'K', 'right')
    const V = milieu(L, K, 'V', 'below')
    const fleche = segment(pointAbstrait(0.9, 2.7), pointAbstrait(1, 1.1))
    fleche.styleExtremites = '->'
    fleche.epaisseur = 2
    const textePanneaux = texteParPosition('panneaux solaires', 0.9, 3)
    const labels = labelPoint(L, O, K, V)
    const angleD = codageAngleDroit(K, V, O)
    const hauteur = placeLatexSurSegment(`${hauteurToit}\\text{ m}`, O, V, {})
    const longueur = placeLatexSurSegment(
      `${texNombre(longueurToit, 1)}\\text{ m}`,
      L,
      O,
      {},
    )
    const A = pointAbstrait(0, -5)
    const B = pointAbstrait(8, -5)
    const batiment = polygone(A, B, K, O, L)
    const baseToit = segment(L, K)
    const hToit = segment(O, V)
    const panneaux = homothetie(segment(L, O), milieu(L, O), 0.8)
    panneaux.epaisseur = 4
    const objets = [
      batiment,
      baseToit,
      hToit,
      panneaux,
      angleD,
      hauteur,
      longueur,
      labels,
      fleche,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 0.8 }, fixeBordures(objets)),
      objets,
      textePanneaux,
    )
    const entetesColonne = [
      '\\text{Jour de la semaine}',
      '\\text{Lundi}',
      '\\text{Mardi}',
      '\\text{Mercredi}',
      '\\text{Jeudi}',
      '\\text{Vendredi}',
      '\\text{Samedi}',
      '\\text{Dimanche}',
    ]
    const entetesLigne = ['\\text{Électricité produite (kWh)}']
    const contenu = productions.map((valeur) => String(valeur))
    const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
    this.enonce = `Une entreprise décide de faire poser sur le toit de son hangar des panneaux solaires.
Pendant une semaine d'utilisation, les productions d'électricité journalières en kilowatt-heures (kWh) de ces panneaux ont été relevées dans le tableau ci-dessous${sp()}:<br>
${tableau}`
    const question1a =
      `Quel jour la production d'électricité a-t-elle été la plus grande${sp()}?`
    const question1b = "Calculer l'étendue de ces productions d'électricité."
    const question1c =
      `Quelle est la production moyenne d'électricité par jour sur cette période${sp()}?`
    const question2 = `L'entreprise revend $${pourcentage}\\,\\%$ de sa production d'électricité au tarif de $${tarif}$ centimes le kWh.<br>
Combien a-t-elle gagné en euros pendant ces $7$ jours${sp()}?`
    const question3 =
      "Afin que les panneaux solaires aient une production maximale, le toit doit avoir une pente avec l'horizontale comprise entre $30^\\circ$ et $35^\\circ$.<br>" +
      deuxColonnesResp(
        `
Schéma en coupe du hangar.<br>
La pente du toit avec l'horizontale correspond à l'angle $\\widehat{\\text{OLV}}$.<br>
$OL = ${texNombre(longueurToit, 1)}\\text{ m}$<br>
$OV = ${texNombre(hauteurToit, 1)}\\text{ m}$<br>`,
        figure,
        { largeur1: 50, widthmincol1: '300px', widthmincol2: '300px' },
      ) +
      `Sur ce toit, les panneaux solaires ont-ils une production maximale${sp()}?`
    const question1 = createList({
      items: [question1a, question1b, question1c],
      style: 'alpha',
    })
    const questions = createList({
      items: [question1, question2, question3],
      style: 'nombres',
    })
    this.enonce += `<br><br>${questions}`
    const indexMin = productions.indexOf(Math.min(...productions))
    const indexMax = productions.indexOf(Math.max(...productions))
    const jours = [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ]
    const jourMin = jours[indexMin]
    const jourMax = jours[indexMax]
    const productionMin = productions[indexMin]
    const productionMax = productions[indexMax]
    const productionTotale = productions.reduce((a, b) => a + b, 0)
    const correction1a = `La production d'électricité a été la plus grande le ${jourMax} avec $${miseEnEvidence(productionMax)}$ kWh.`
    const correction1b = `La production a été la plus faible le ${jourMin} avec $${productionMin}$ kWh, donc l'étendue de ces productions d'électricité est${sp()}:<br>
    $${productionMax} - ${productionMin}=${miseEnEvidence(productionMax - productionMin)}$ kWh.`
    const correction1c = `La production moyenne d'électricité par jour sur cette période est${sp()}:<br>
    $\\dfrac{${productions.map((el) => String(el)).join('+')}}{7}=\\dfrac{${texNombre(productionTotale, 0)}}{7}=${miseEnEvidence(texNombre(productionTotale / 7, 2))}$ kWh.`
    const correction1 = createList({
      items: [correction1a, correction1b, correction1c],
      style: 'alpha',
    })
    const productionRevendue = (productionTotale * pourcentage) / 100
    const prixRevente = productionRevendue * tarif
    const correction2 = `La production d'électricité totale sur la semaine est de $${texNombre(productionTotale, 0)}$ kWh.<br>
    L'entreprise revend $${pourcentage}\\,\\%$ de sa production d'électricité soit${sp()}:<br>
    $${texNombre(productionTotale, 0)}\\times \\dfrac{${pourcentage}}{100} = ${texNombre(productionRevendue, 2)}$ kWh.<br>
    $${texNombre(productionRevendue, 2)}\\times${tarif} = ${texNombre(prixRevente, 2)}$ (centimes)<br>
    Donc elle a gagné environ $${miseEnEvidence(texNombre(prixRevente / 100, 2))}$€.`
    const angle = (Math.asin(hauteurToit / longueurToit) * 180) / Math.PI
    const correction3 = `Afin que les panneaux solaires aient une production maximale, le toit doit avoir une pente avec l'horizontale comprise entre $30^\\circ$ et $35^\\circ$.<br>
Le triangle $OLV$ est rectangle en $V$ donc on peut utiliser la fonction trigonométrique sinus${sp()}:<br>
$\\sin(\\widehat{OLV})=\\dfrac{OV}{OL}=\\dfrac{${texNombre(hauteurToit, 1)}}{${texNombre(longueurToit, 1)}}$.<br>
On en déduit que $${miseEnEvidence(`\\widehat{OLV}\\approx ${texNombre(angle, 1)}^\\circ`)}$.<br>
${
  angle < 30
    ? `La pente du toit avec l'horizontale est de $${texNombre(angle, 1)}^\\circ$ qui est inférieur à $30^\\circ$, donc les panneaux solaires n'ont pas une production maximale.`
    : angle > 35
      ? `La pente du toit avec l'horizontale est de $${texNombre(angle, 1)}^\\circ$ qui est supérieur à $35^\\circ$, donc les panneaux solaires n'ont pas une production maximale.`
      : `La pente du toit avec l'horizontale est de $${texNombre(angle, 1)}^\\circ$ qui est bien compris entre $30^\\circ$ et $35^\\circ$, donc les panneaux solaires ont une production maximale.`
}`
    this.correction = createList({
      items: [correction1, correction2, correction3],
      style: 'nombres',
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      [381, 363, 322, 329, 393, 405, 376],
      15,
      8,
      7,
      13.5,
    )
  }

  versionAleatoire: () => void = () => {
    const productions: number[] = []
    const productionMin = 300
    const productionMax = 450
    const productionMedian = randint(350, 400)
    let productionTotale = 0
    let hauteurToit = 0
    let longueurToit = 0
    let angle = 0
    let pourcentage = 0
    let tarif = 0
    do {
      productions.length = 0
      for (let i = 0; i < 3; i++) {
        productions.push(
          randint(productionMin, productionMedian),
          randint(productionMedian, productionMax),
        )
      }
      productionTotale = productions.reduce((a, b) => a + b, 0)
      const reste = productionTotale % 7
      productions.push(
        choice([
          premierMultipleInferieur(7, productionMedian),
          premierMultipleSuperieur(7, productionMedian),
        ]) +
          7 -
          reste,
      )
      productionTotale = productions.reduce((a, b) => a + b, 0)
      shuffle(productions)
      hauteurToit = randint(6, 8)
      longueurToit = randint(120, 150) / 10
      angle = (Math.asin(hauteurToit / longueurToit) * 180) / Math.PI
      pourcentage = randint(10, 20)
      tarif = randint(6, 10)
    } while (angle < 26 || angle > 38)

    this.appliquerLesValeurs(
      productions,
      pourcentage,
      tarif,
      hauteurToit,
      longueurToit,
    )
  }
}
