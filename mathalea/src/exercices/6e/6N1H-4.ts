import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire des abscisses avec zoom sur l'axe"
export const interactifReady = true

export const dateDePublication = '30/12/2025'

export const uuid = '3c83a'
export const refs = {
  'fr-fr': ['6N1H-4'],
  'fr-ch': ['9R1NO2C-13', '9R2NO2C-13', '9R3NO2C-13', 'PRQNO04A-15'],
}
/**
 * Lire une abscisse sur une droite graduée avec des zooms successifs et le choix de la classe numérique de départ.
 * @author Olivier Mimeau
 */
export default class GradueeZommGrdNombres extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Classe de démarrage, nombres séparés par des tirets ',
      '0 : Unités\n1 : Dizaines\n2 : Centaines\n3 : Milliers\n4 : Dizaines de milliers\n5 : Centaines de milliers\n6 : Millions\n7 : Dizaines de millions\n8 : Centaines de millions\n9 : Milliards\n10 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Niveau de zoom',
      'Nombres entre 1 et 4 séparés par des tirets, 5 pour mélange',
    ]
    this.sup = '4'
    this.sup2 = '3'
  }

  nouvelleVersion() {
    const listeClasseDeDemarrage = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 0,
      max: 10,
      melange: 10,
      defaut: 3,
      // listeOfCase: [1, 2, 3, 4],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const listeNiveauZoom = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 5,
      melange: 5,
      defaut: 2,
      // listeOfCase: [1, 2, 3, 4],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let classeDepart = 100 // choice([1, 10, 100])
      if (typeof listeClasseDeDemarrage[i] === 'number')
        classeDepart = 10 ** Number(listeClasseDeDemarrage[i])
      const nbDepart = randint(0, 9) * classeDepart
      // nbDepart = randint(0, 9)
      let nbNiveauZoom = 1
      if (typeof listeNiveauZoom[i] === 'number')
        nbNiveauZoom = Number(listeNiveauZoom[i])
      const LeNombreCherche = []
      for (let j = 0; j < nbNiveauZoom + 1; j++) {
        LeNombreCherche.push(
          j === nbNiveauZoom ? randint(2, nbPas - 2) : randint(2, nbPas - 2),
        )
      }
      const borneSuivantNiveauZoom = []
      let x0 = new Decimal(nbDepart)
      borneSuivantNiveauZoom.push(nbDepart)
      for (let j = 0; j < nbNiveauZoom + 1; j++) {
        x0 = x0.add(
          new Decimal(LeNombreCherche[j]).mul(classeDepart).div(10 ** (j + 1)),
        )
        borneSuivantNiveauZoom.push(arrondi(x0.toNumber(), 5))
      }
      const nomsPoints = choisitLettresDifferentes(1 + 2 * nbNiveauZoom, 'QDN')
      texte = ``

      texteCorr = ``

      // this.reponse = texNombre(x0, 0)
      texte += `Déterminer l'abscisse du point $${nomsPoints[0]}$ ci-dessous :<br>`
      texte += faitLesDroites(
        Number(x0),
        classeDepart,
        nbNiveauZoom,
        borneSuivantNiveauZoom,
        nomsPoints,
        false, // correction = non
      )
      if (this.interactif) {
        texte += `<br><br>Abscisse du point $${nomsPoints[0]}$ : `
        handleAnswers(this, i, { reponse: { value: arrondi(Number(x0), 5) } })
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      texteCorr += `L'abscisse du point $${nomsPoints[0]}$ est $${miseEnEvidence(texNombre(x0, 5))}$ :`
      texteCorr += '<br><br>Voici la figure avec les lectures successives :<br>'
      texteCorr += faitLesDroites(
        Number(x0),
        classeDepart,
        nbNiveauZoom,
        borneSuivantNiveauZoom,
        nomsPoints,
        true, // correction = non
      )

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
const nbPas = 10

function abcisseVersDroite(x: number, xmin: number, xmax: number): number {
  return arrondi((x - xmin) / (xmax - xmin), 5)
}

function faitLesDroites(
  x0: number,
  classeDepart: number,
  nbNiveauZoom: number,
  borneSuivantNiveauZoom: number[],
  nomsPoints: string[],
  correction: boolean,
): string {
  const uniteDroite = 15
  const ecartDroites = 2
  const uniteDroiteZoom = 10
  const decaleDroiteZoom = 1
  let extremite = '->'
  if (borneSuivantNiveauZoom[0] === 0) extremite = '->'
  const droitesSegments = []
  let pA1, pA2, pB1, pB2, sA, sB
  let droitex0: number
  let droitex0Inf: number
  let droitex0Sup: number
  droitex0 = abcisseVersDroite(
    Number(x0),
    borneSuivantNiveauZoom[0],
    borneSuivantNiveauZoom[0] + classeDepart,
  )
  droitex0Inf = abcisseVersDroite(
    Number(borneSuivantNiveauZoom[1]),
    borneSuivantNiveauZoom[0],
    borneSuivantNiveauZoom[0] + classeDepart,
  )
  droitex0Sup = abcisseVersDroite(
    Number(borneSuivantNiveauZoom[1] + classeDepart / nbPas),
    borneSuivantNiveauZoom[0],
    borneSuivantNiveauZoom[0] + classeDepart,
  )
  let d = droiteGraduee({
    x: 0,
    y: 0,
    Unite: uniteDroite,
    Min: 0,
    Max: 1, // uniteDroite + 0.1,
    thickSec: true,
    thickSecDist: 0.1,
    axeStyle: extremite,
    pointTaille: 5,
    pointStyle: '+',
    labelsPrincipaux: false,
    labelListe: [
      [0, `${texNombre(borneSuivantNiveauZoom[0])}`],
      [1, `${texNombre(borneSuivantNiveauZoom[0] + classeDepart)}`],
    ],
    pointListe: [
      [droitex0, nomsPoints[0]], // point à trouver
      [droitex0Inf, nomsPoints[1]], // encadrement Inf
      [droitex0Sup, nomsPoints[2]], // encadrement sup
    ],
  })
  droitesSegments.push(d)
  let coefMult = 1
  let decalage = 0
  for (let j = 0; j < nbNiveauZoom; j++) {
    coefMult = j === 0 ? uniteDroite : uniteDroiteZoom
    decalage = j === 0 ? 0 : decaleDroiteZoom
    pA1 = pointAbstrait(
      droitex0Inf * coefMult + decalage,
      ecartDroites * j * -1,
    )
    pA2 = pointAbstrait(decaleDroiteZoom, ecartDroites * (j + 1) * -1)
    pB1 = pointAbstrait(
      droitex0Sup * coefMult + decalage,
      ecartDroites * j * -1,
    )
    pB2 = pointAbstrait(
      decaleDroiteZoom + uniteDroiteZoom,
      ecartDroites * (j + 1) * -1,
    )
    sA = segment(pA1, pA2)
    sB = segment(pB1, pB2)
    sA.pointilles = 5
    sB.pointilles = 5
    droitesSegments.push(sA)
    droitesSegments.push(sB)
    droitex0 = abcisseVersDroite(
      Number(x0),
      borneSuivantNiveauZoom[j + 1],
      borneSuivantNiveauZoom[j + 1] + classeDepart / 10 ** (j + 1),
    )
    droitex0Inf = abcisseVersDroite(
      Number(borneSuivantNiveauZoom[j + 2]),
      borneSuivantNiveauZoom[j + 1],
      borneSuivantNiveauZoom[j + 1] + classeDepart / 10 ** (j + 1),
    )
    droitex0Sup = abcisseVersDroite(
      Number(
        borneSuivantNiveauZoom[j + 2] + classeDepart / 10 ** (j + 1) / nbPas,
      ),
      borneSuivantNiveauZoom[j + 1],
      borneSuivantNiveauZoom[j + 1] + classeDepart / 10 ** (j + 1),
    )
    const listePoints: [number, string][] = [
      [0, nomsPoints[j * 2 + 1]], // encadrement Inf niveau n-1
      [1, nomsPoints[j * 2 + 2]], // encadrement Sup Inf niveau n-1
      [droitex0, nomsPoints[0]], // point à trouver
    ]
    if (j < nbNiveauZoom - 1) {
      listePoints.push([droitex0Inf, nomsPoints[(j + 1) * 2 + 1]]) // encadrement Inf
      listePoints.push([droitex0Sup, nomsPoints[(j + 1) * 2 + 2]]) // encadrement sup
    }
    let listeLabels: [number, string][] = []
    if (correction) {
      listeLabels = [
        [0, `${texNombre(borneSuivantNiveauZoom[j + 1])}`],
        [
          1,
          `${texNombre(borneSuivantNiveauZoom[j + 1] + classeDepart / 10 ** (j + 1))}`,
        ],
      ]
      if (j === nbNiveauZoom - 1) {
        listeLabels.push([droitex0, `${texNombre(x0)}`])
      }
    }
    d = droiteGraduee({
      x: decaleDroiteZoom,
      y: ecartDroites * (j + 1) * -1,
      Unite: uniteDroiteZoom,
      Min: 0,
      Max: 1, // uniteDroiteZoom,
      thickDistance: 1,
      thickSec: true,
      thickSecDist: 0.1,
      axeStyle: '->',
      pointTaille: 4,
      pointStyle: '+',
      labelsPrincipaux: false,
      labelListe: listeLabels,
      pointListe: listePoints,
    })
    droitesSegments.push(d)
    //         y: ecartDroites * (j + 1) * -1
  }
  return mathalea2d(
    {
      xmin: -1.7,
      ymin: -1.2 - ecartDroites * nbNiveauZoom,
      xmax: uniteDroite + 1,
      ymax: 1.5,
      pixelsParCm: 40,
      scale: 0.9,
    },
    // latex2d('A', x1B * 5, 0.5, { color: bleuMathalea }),
    droitesSegments,
  )
}
