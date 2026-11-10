import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { createList } from '../../lib/format/lists'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { prenomsPronoms } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { bleuMathalea } from '../../lib/colors'
import { deDevant, queDevant, sp } from '../../lib/outils/outilString'

export const uuid = 'f296a'
export const refs = {
  'fr-fr': ['3Z1DNB-25'],
  'fr-ch': ['11CTFA1A-10', '11LCFA1A-10', '11LSFA1A-10'],
}
export const titre =
  'Se préparer au DNB : graphique, vitesse et proportionnalité'
export const dateDePublication = '20/01/2026'

/**
 * @Author Olivier Mimeau
 *
 * ex 4 brevet Amérique du Nord juin 2025 aleatoire
 */
export default class ExerciceAmeriqueNord4062025 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction = texteItalique(
      "D'après l'exercice $4$ du brevet Amérique du Nord Juin 2025.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    longueurParcours: number,
    tempsParcours: number,
    pointsParcours: { x: number; y: number }[],
    Question2: { x: number; y: number },
    Question3: { x: number; y: number },
    vitesse2: number,
    vitesse3: number,
    prenom1: string,
    ilElle1: string,
    prenom2: string,
    prenom3: string,
  ): void {
    let txtPremiersKm = `les $${texNombre(Question3.y, 1)}$ premiers $\\text{kilomètres}$`
    if (Question3.y === 1) {
      txtPremiersKm = `le premier $\\text{kilomètre}$`
    }
    if (Question3.y === 1.5) {
      txtPremiersKm = `le premier $\\text{kilomètre}$ et demi`
    }

    const listeQuestions = createList({
      items: [
        `Le temps et la distance parcourue par ${prenom1} sont-ils proportionnels${sp()}?`,
        `Quelle distance ${prenom1} a-t-${ilElle1} parcourue au bout de $${texNombre(Question2.x, 1)}\\text{ minutes}$${sp()}?<br>Aucune justification n'est attendue.`,
        `Combien de temps a-t-${ilElle1} mis pour faire ${txtPremiersKm}${sp()}?<br>Aucune justification n'est attendue.`,
        `Quelle est la vitesse moyenne ${deDevant(prenom1)} lors de cette course${sp()}?<br>Exprimer le résultat au dixième de $\\text{ km/h}$ près.`,
        `${prenom2} et ${prenom3} ont couru sur le même parcours de $${texNombre(longueurParcours, 1)}\\text{ km}$. ${prenom2} à une vitesse régulière égale à $${texNombre(vitesse2, 1)}\\text{ km/h}$ et ${prenom3} a une vitesse régulière égale à $${texNombre(vitesse3, 1)}\\text{ km/h}$.`,
      ],
      style: 'nombres',
    })
    const listeSousQuestions5 = createList(
      {
        items: [
          `Sachant ${queDevant(prenom2)} et ${prenom3} sont partis en même temps, qui a été le premier à franchir la ligne d'arrivée${sp()}?`,
          `Quelle distance sépare ${prenom2} et ${prenom3}, lorsque le premier des deux franchit la ligne d'arrivée${sp()}?`,
        ],
        style: 'alpha', // a. b. ...
      },
      '', // shift: string = '',
      1, // startWith: number = 1,
      1, // nestedLevel: number = 0, ici sous question niveau 1
    )

    const correction1 = `La représentation graphique de la distance parcourue en fonction du temps n'est pas un segment contenant l'origine${sp()}: la distance parcourue par ${prenom1} ${texteEnCouleurEtGras("n'est pas proportionnelle")} au temps de course.`
    const correction2 = `On lit sur la courbe qu'au bout de $${texNombre(Question2.x, 1)}\\text{ minutes}$, ${prenom1} a parcouru $${miseEnEvidence(texNombre(Question2.y, 1))}\\text{ km}$.`
    const correction3 = `${prenom1} a parcouru ${txtPremiersKm} en $${miseEnEvidence(texNombre(Question3.x, 1))}\\text{ minutes}$.`
    let correction4 = `${prenom1} a parcouru les $${texNombre(longueurParcours, 1)}\\text{ km}$ en $${texNombre(tempsParcours, 1)}\\text{ minutes}$${sp()}:`
    let sousCorrection4a = ``
    let sousCorrection4b = ``
    let vitesse: number
    if (tempsParcours === 60) {
      sousCorrection4a = `$60 \\text{ minutes}= 1 \\text{ h}$ donc sans compter son arrêt de $10 \\text{ minutes}$, sa vitesse moyenne a été de $v_1$ = $${miseEnEvidence(texNombre(longueurParcours, 1))}\\text{ km/h}$`
    } else {
      sousCorrection4a = `Sans compter son arrêt de $10 \\text{ minutes}$, sa vitesse moyenne a été de $v_1$ = `
      sousCorrection4a += `$\\dfrac{d}{t}$<br>`
      sousCorrection4a += `$v_2 = \\dfrac{${texNombre(longueurParcours, 1)} \\text{ km}}{\\dfrac{${texNombre(tempsParcours, 1)}}{60}\\text{ h}}$ = $${texNombre(longueurParcours, 1)} \\times \\dfrac{60}{${texNombre(tempsParcours, 1)}}$`
      vitesse = longueurParcours / (tempsParcours / 60)
      if (texNombre(vitesse, 2) === texNombre(vitesse, 1)) {
        sousCorrection4a += `= $${miseEnEvidence(texNombre(vitesse, 1))}\\text{ km/h}$.<br>`
      } else {
        sousCorrection4a += `$\\approx ${miseEnEvidence(texNombre(vitesse, 1))}\\text{ km/h}$.<br>`
      }
    }
    if (tempsParcours - 10 === 60) {
      sousCorrection4b = `$60 \\text{ minutes}= 1 \\text{ h}$ donc avec son arrêt de $10 \\text{ minutes}$, sa vitesse moyenne a été de $v_1$ = $${miseEnEvidence(texNombre(longueurParcours, 1))}\\text{ km/h}$`
    } else {
      sousCorrection4b = `Avec son arrêt de $10 \\text{ minutes}$, sa vitesse moyenne a été de $v_2 = \\dfrac{d}{t}$<br>`
      sousCorrection4b += `$v_2 = \\dfrac{${texNombre(longueurParcours, 1)} \\text{ km}}{\\dfrac{${texNombre(tempsParcours - 10, 1)}}{60}\\text{ h}}$ = $${texNombre(longueurParcours, 1)} \\times \\dfrac{60}{${texNombre(tempsParcours - 10, 1)}}$`
      vitesse = longueurParcours / ((tempsParcours - 10) / 60)
      if (texNombre(vitesse, 2) === texNombre(vitesse, 1)) {
        sousCorrection4b += `= $${miseEnEvidence(texNombre(vitesse, 1))}\\text{ km/h}$.<br>`
      } else {
        sousCorrection4b += `$\\approx ${miseEnEvidence(texNombre(vitesse, 1))}\\text{ km/h}$.<br>`
      }
    }
    const listeCorrectionsSousQuestion4 = createList(
      {
        items: [sousCorrection4a, sousCorrection4b],
        style: 'puces',
      },
      '', // shift: string = '',
      1, // startWith: number = 1,
      1, // nestedLevel: number = 0, ici sous question niveau 1)
    )
    correction4 += listeCorrectionsSousQuestion4
    // $${texNombre(q3 - q1, 0)}$
    let prenomRapide: string
    let prenomLent: string
    let vitesseRapide: number
    let vitesseLente: number
    if (vitesse2 < vitesse3) {
      prenomRapide = prenom3
      prenomLent = prenom2
      vitesseRapide = vitesse3
      vitesseLente = vitesse2
    } else {
      prenomRapide = prenom2
      prenomLent = prenom3
      vitesseRapide = vitesse2
      vitesseLente = vitesse3
    }
    const distanceDernier: number =
      (vitesseLente * longueurParcours) / vitesseRapide
    let egalOuApprox: string = ``
    let ajouteEnviron = ''
    if (texNombre(distanceDernier, 3) === texNombre(distanceDernier, 2)) {
      egalOuApprox = `=`
    } else {
      egalOuApprox = `$\\approx~$`
      ajouteEnviron = 'environ '
    }
    // heuristique simple pour l'article : mot commençant par voyelle
    const motQue = /^[AEIOUH]/i.test(prenomLent) ? "qu'" : 'que '
    const sousCorrection5a = `${prenomRapide} courant plus vite ${motQue}${prenomLent} ${texteEnCouleurEtGras('est arrivée la première')}${sp()}!`
    let sousCorrection5b = `${prenomRapide} a parcouru les $${texNombre(longueurParcours, 1)}$ km à la vitesse de $${texNombre(vitesseRapide, 1)}$ km/h en un temps t tel que t = $\\dfrac{${texNombre(longueurParcours, 1)}}{${texNombre(vitesseRapide, 1)}}$.<br>`
    sousCorrection5b += `Au bout de ce temps ${prenomLent} a parcouru $${texNombre(vitesseLente, 1)}\\times \\dfrac{${texNombre(longueurParcours, 1)}}{${texNombre(vitesseRapide, 1)}}$ ${egalOuApprox}$${texNombre(distanceDernier, 2)}\\text{ km}$.<br>`
    sousCorrection5b += ` ${prenomLent} est donc à ce moment à $${texNombre(longueurParcours, 1)} − ${texNombre(distanceDernier, 2)} = ${miseEnEvidence(texNombre(longueurParcours - distanceDernier, 2))}\\text{ km}$ ${ajouteEnviron} de l'arrivée donc ${deDevant(prenomRapide)}. `
    const correction5 = createList(
      {
        items: [sousCorrection5a, sousCorrection5b],
        style: 'alpha',
      },
      '', // shift: string = '',
      1, // startWith: number = 1,
      1, // nestedLevel: number = 0, ici sous question niveau 1)
    )
    const listeCorrections = createList({
      items: [correction1, correction2, correction3, correction4, correction5],
      style: 'nombres',
    })
    const valeurMaxX: number = tempsParcours + 10
    const valeurMaxY: number = 15
    const pts: PointAbstrait[] = []
    const echelleX: number = 20 / valeurMaxX
    const echelleY: number = 1
    // let valeurMin: number
    for (let i = 0; i < pointsParcours.length; i++) {
      pts.push(
        pointAbstrait(
          pointsParcours[i].x * echelleX,
          pointsParcours[i].y * echelleY,
        ),
      )
    }

    const line = polyline(pts, bleuMathalea)
    const rep = new RepereBuilder({
      xMin: 0,
      xMax: valeurMaxX + 10,
      yMin: 0,
      yMax: valeurMaxY + 1,
    })
      .setUniteX(echelleX)
      .setUniteY(echelleY)
      .setThickX({ xMin: 0, xMax: valeurMaxX, dx: 10 })
      .setThickY({ yMin: 0, yMax: valeurMaxY, dy: 1 })
      .setLabelX({ xMin: 0, xMax: valeurMaxX, dx: 10 })
      .setLabelY({ yMin: 0, yMax: valeurMaxY, dy: 1 })
      .setGrille({
        grilleX: { dx: echelleX * 5 },
        grilleY: { dy: echelleY * 0.5 },
      })
      .buildCustom()
    const objets2d = [line, rep] // rep.trace()
    const fig = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.6 }, fixeBordures(objets2d)),
      objets2d,
    )
    this.enonce = `À l'approche d'une course organisée par son collège, ${prenom1} s'entraîne sur un parcours de $${texNombre(longueurParcours, 1)}$ km.<br>`
    this.enonce += `La courbe ci-dessous représente la distance parcourue par ${prenom1} (en kilomètres) en fonction du temps écoulé (en minutes).<br><br>`
    this.enonce += fig
    this.enonce += listeQuestions
    this.enonce += listeSousQuestions5 + '<br><br>'
    this.correction = `À l'approche d'une course organisée par son collège, ${prenom1} s'entraîne sur un parcours de $${texNombre(longueurParcours, 1)}$ km.`
    this.correction += listeCorrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      13.5,
      80,
      [
        { x: 0, y: 0 },
        { x: 10, y: 2 },
        { x: 20, y: 4.5 },
        { x: 30, y: 6.5 },
        { x: 40, y: 6.5 },
        { x: 50, y: 9 },
        { x: 60, y: 11 },
        { x: 80, y: 13.5 },
      ],
      { x: 20, y: 4.5 },
      { x: 50, y: 9 },
      12,
      10,
      'Malo',
      'il',
      'Louise',
      'Hillal',
    )
  }

  versionAleatoire: () => void = () => {
    const longueurParcours: number = randint(12, 15) + 0.5
    const tempsParcours10: number = randint(6, 10)
    const tempsParcours: number = tempsParcours10 * 10
    const vitesse2: number = randint(9, 15)
    const vitesse3: number = randint(9, 16, [vitesse2])
    const personnes = prenomsPronoms(3) as { prenom: string; pronom: string }[]
    const prenom1 = personnes[0].prenom
    const ilElle1 = personnes[0].pronom
    const prenom2 = personnes[1].prenom
    const prenom3 = personnes[2].prenom
    const listePointsAleatoires: { x: number; y: number }[] = []
    const pointsParcours: { x: number; y: number }[] = [{ x: 0, y: 0 }]
    let miTemps: number = Math.floor(tempsParcours / 2 / 10) // en dizaine de minutes
    miTemps = randint(miTemps - 1, miTemps)
    const heurePause: number = miTemps * 10
    const miParcours: number = Math.floor(longueurParcours / 2)
    const distanceAvantPause: number =
      randint(miParcours, miParcours + 1) + 0.5 * choice([0, 1])
    let vitesseMoyenne: number = (distanceAvantPause / heurePause) * 60
    let sousListeAleatoire = listePoints(miTemps - 1, 1)
    let d = 0
    let tAvant = 0
    for (let i = 0; i < sousListeAleatoire.length; i++) {
      const t = sousListeAleatoire[i] * 10
      d +=
        Math.round(((vitesseMoyenne * (t - tAvant)) / 60) * 2) / 2 +
        0.5 * choice([-1, 0, 1])
      pointsParcours.push({ x: t, y: d })
      listePointsAleatoires.push({ x: t, y: d })
      tAvant = t
    }
    pointsParcours.push({ x: heurePause, y: distanceAvantPause })
    pointsParcours.push({ x: heurePause + 10, y: distanceAvantPause })
    vitesseMoyenne =
      ((longueurParcours - distanceAvantPause) /
        (tempsParcours - heurePause - 10)) *
      60
    d = distanceAvantPause
    tAvant = heurePause + 10
    sousListeAleatoire = listePoints(tempsParcours10 - miTemps - 2, miTemps + 2)
    for (let i = 0; i < sousListeAleatoire.length; i++) {
      const t = sousListeAleatoire[i] * 10
      d +=
        Math.round(((vitesseMoyenne * (t - tAvant)) / 60) * 2) / 2 +
        0.5 * choice([-1, 0, 1])
      pointsParcours.push({ x: t, y: d })
      listePointsAleatoires.push({ x: t, y: d })
      tAvant = t
    }
    pointsParcours.push({ x: tempsParcours, y: longueurParcours })
    const indexQuestion2 = randint(0, listePointsAleatoires.length - 1)
    const question2 = listePointsAleatoires[indexQuestion2]
    const indexQuestion3 = randint(0, listePointsAleatoires.length - 1, [
      indexQuestion2,
    ])
    const question3 = listePointsAleatoires[indexQuestion3]

    this.appliquerLesValeurs(
      longueurParcours,
      tempsParcours,
      pointsParcours, // : {x: number, y: number}[],
      question2,
      question3,
      vitesse2,
      vitesse3,
      prenom1,
      ilElle1,
      prenom2,
      prenom3,
    )
  }
}

function listePoints(nbPointsMax: number, debutPoints: number): number[] {
  //  miTemps
  const nbPoints = randint(1, nbPointsMax)
  const listeNombres: number[] = Array.from(
    { length: nbPointsMax },
    (_, i) => debutPoints + i,
  )
  const melange = combinaisonListes(listeNombres, nbPoints)
  const sousListeAleatoire = melange.slice(0, nbPoints).sort((a, b) => a - b)
  return sousListeAleatoire
}
