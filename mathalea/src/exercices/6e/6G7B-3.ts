import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { cibleCarree, dansLaCibleCarree } from '../../lib/2d/cibles'
import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { distancePointDroite, droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { traceCompas } from '../../lib/2d/traceCompas'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { orangeMathalea } from '../../lib/colors'
import { arcenciel } from '../../lib/format/style'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Construire le symétrique d'un point avec cible auto-corrective"

/**
 * Construction de symétrique avec dispositif d'auto-correction aléatoire
 * Ref 6G24-3
 * @author Jean-claude Lhote
 * Publié le 30/11/2020
 */
export const uuid = '60e16'

export const refs = {
  'fr-fr': ['6G7B-3'],
  'fr-2016': ['6G24-3'],
  'fr-ch': ['9R1ES4B-5', '9R2ES4B-5', '9R3ES4B-5'],
}
export default class ConstruireSymetriquePoint6e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = ['Nombre de points (1 à 5)', 5]
    // this.besoinFormulaire2CaseACocher = ["Avec des points de part et d'autre"];
    this.sup = 3
  }

  nouvelleVersion() {
    let result = [0, 0]
    let texteCorr = ''
    const nbpoints = parseInt(this.sup)
    let nontrouve
    let assezloin
    let cible
    const celluleAlea = function (rang: number) {
      const lettre = lettreDepuisChiffre(randint(1, rang))
      const chiffre = Number(randint(1, rang)).toString()
      return lettre + chiffre
    }
    // On prépare la figure...
    const a = randint(-10, 10)
    const b = randint(-10, 10, a)
    const d = droite(a, b, 0, '(d)')
    const A = translation(
      pointAbstrait(0, 0),
      homothetie(d.directeur, pointAbstrait(0, 0), -0.5),
    )
    const B = translation(
      pointAbstrait(0, 0),
      homothetie(d.directeur, pointAbstrait(0, 0), 0.5),
    )
    const marks = ['/', '//', '///', 'x', 'o', 'S', 'V']
    const noms = choisitLettresDifferentes(nbpoints, 'Q', true)
    this.consigne = `Construire les symétriques respectifs des points $${noms[0]}$`
    for (let i = 1; i < nbpoints - 1; i++) {
      this.consigne += `, $${noms[i]}$`
    }
    this.consigne += ` et $${noms[nbpoints - 1]}$ par rapport à $(d)$.`
    const cibles = []
    const M = []
    const N = []
    const objetsEnonce = []
    const objetsCorrection = [] // cibles, M point marqués, N symétrique de M
    const cellules = []
    let xMin, yMin, xMax, yMax
    ;[xMin, yMin, xMax, yMax] = [0, 0, 0, 0]
    for (let i = 0; i < nbpoints; i++) {
      // On place les cibles.
      N.push(
        pointAbstrait(
          arrondi(randint(-80, 80, 0) / 10),
          arrondi(randint(-80, 80, 0) / 10),
          noms[i] + "'",
        ),
      )
      nontrouve = true
      while (distancePointDroite(N[i], d) < 3 || nontrouve) {
        nontrouve = true
        if (distancePointDroite(N[i], d) < 3) {
          N[i].x = arrondi(randint(-80, 80, 0) / 10)
          N[i].y = arrondi(randint(-80, 80, 0) / 10)
        } else {
          assezloin = true
          for (let j = 0; j < i; j++) {
            if (longueur(N[i], N[j]) < 4.5) assezloin = false
          }
          if (assezloin === false) {
            // éloigner les points donc les grilles
            N[i].x = arrondi(randint(-80, 80, 0) / 10)
            N[i].y = arrondi(randint(-80, 80, 0) / 10)
          } else nontrouve = false
        }
      }
    }

    objetsEnonce.push(d)
    objetsCorrection.push(d, tracePoint(A, B))

    for (let i = 0; i < nbpoints; i++) {
      cellules.push(celluleAlea(4))
      result = dansLaCibleCarree(N[i].x, N[i].y, 4, 0.6, cellules[i])
      cible = cibleCarree({
        x: result[0],
        y: result[1],
        rang: 4,
        num: i + 1,
        taille: 0.6,
        color: orangeMathalea,
      })
      cible.taille = 0.6
      cible.opacite = 0.7
      cibles.push(cible)
    }
    for (let i = 0; i < nbpoints; i++) {
      M.push(symetrieAxiale(N[i], d, noms[i]))
      objetsEnonce.push(tracePoint(M[i]), labelPoint(M[i]), cibles[i])
      objetsCorrection.push(
        tracePoint(M[i], N[i]),
        labelPoint(M[i], N[i]),
        cibles[i],
      )
      objetsCorrection.push(
        segment(M[i], N[i], arcenciel(i)),
        codageMediatrice(M[i], N[i], arcenciel(i + 5), marks[i]),
      )
      objetsCorrection.push(traceCompas(A, N[i], 20), traceCompas(B, N[i], 20))
      texteCorr += `$${noms[i]}'$, le symétrique du point $${noms[i]}$ est dans la case ${texteEnCouleurEtGras(cellules[i])} de la grille $${i + 1}$.<br>`
    }

    for (let i = 0; i < nbpoints; i++) {
      xMin = Math.min(xMin, N[i].x - 3, M[i].x - 3)
      yMin = Math.min(yMin, N[i].y - 3, M[i].y - 3)
      xMax = Math.max(xMax, N[i].x + 3, M[i].x + 3)
      yMax = Math.max(yMax, N[i].y + 3, M[i].y + 3)
    }

    context.fenetreMathalea2d = [xMin, yMin, xMax, yMax]

    this.listeQuestions.push(
      mathalea2d(
        {
          xmin: xMin,
          ymin: yMin,
          xmax: xMax,
          ymax: yMax,
          pixelsParCm: 20,
          scale: 0.7,
        },
        objetsEnonce,
      ),
    )
    this.listeCorrections.push(
      texteCorr +
        mathalea2d(
          {
            xmin: xMin,
            ymin: yMin,
            xmax: xMax,
            ymax: yMax,
            pixelsParCm: 20,
            scale: 0.7,
          },
          objetsCorrection,
        ),
    )
    listeQuestionsToContenu(this)

    //  let nonchoisi,coords=[],x,y,objetsEnonce=[],objetsCorrection=[],nomd,label_pos
  }
}
