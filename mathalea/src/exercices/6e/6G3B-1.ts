import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { cercle } from '../../lib/2d/cercle'
import { cibleCarree, dansLaCibleCarree } from '../../lib/2d/cibles'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import {
  droite,
  droiteParPointEtPerpendiculaire,
  positionLabelDroite,
} from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPoint } from '../../lib/2d/textes'
import {
  homothetie,
  similitude,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import { norme } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionLC,
} from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '30/11/2020'
export const dateDeModifImportante = '06/09/2024'
export const titre = 'Construire des médiatrices avec cible auto-corrective'
export const amcReady = true
export const amcType = 'AMCOpen'
/**
 * Construction de médiatrices avec dispositif d'auto-correction aléatoire
 * @author Jean-claude Lhote (Ajout AMC par Éric Elter)
 */
export const uuid = 'd7052'

export const refs = {
  'fr-fr': ['6G3B-1'],
  'fr-2016': ['6G25'],
  'fr-ch': ['9R1ES2D-2', '9R2ES2D-2', '9R3ES2D-2'],
}

const celluleAlea = function (rang: number) {
  const lettre = lettreDepuisChiffre(randint(1, rang))
  const chiffre = Number(randint(1, rang)).toString()
  return lettre + chiffre
}

export default class ConstruireMediatrices6e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let ee = 0, cpt = 0; ee < this.nbQuestions && cpt < 50;) {
      let result = [0, 0]
      let texteCorr = ''
      let texte = ''

      // On prépare la figure...
      const noms = choisitLettresDifferentes(4, 'QI', true)
      texte = `Construire la médiatrice $(d)$ du segment $[${noms[0]}${noms[1]}]$ et la médiatrice $(d')$ du segment $[${noms[2]}${noms[3]}]$.<br>`
      texte +=
        "Prolonger les droites $(d)$ et $(d')$ pour obtenir leur point d'intersection.<br>"
      const marks = ['/', '//', '///', 'x', 'o', 'S', 'V']
      const I = pointAbstrait(0, 0, 'I')
      const A = pointAdistance(I, randint(3, 6))
      const B = similitude(A, I, randint(65, 150), randint(8, 15) / 10)
      const medA = droite(I, A)
      const medB = droite(I, B)

      const dA = droiteParPointEtPerpendiculaire(A, medA)
      const dB = droiteParPointEtPerpendiculaire(B, medB)
      medA.color = colorToLatexOrHTML(bleuMathalea)
      medB.color = colorToLatexOrHTML('green')
      const cA = cercle(A, arrondi(randint(25, 40) / 20))
      const cB = cercle(B, arrondi(randint(45, 60) / 20))
      const A1 = pointIntersectionLC(dA, cA, noms[0], 1)
      const A2 = symetrieAxiale(A1, medA, noms[1])
      const B1 = pointIntersectionLC(dB, cB, noms[2], 1)
      const B2 = symetrieAxiale(B1, medB, noms[3])
      const sA = segmentAvecExtremites(A1, A2)
      const sB = segmentAvecExtremites(B1, B2)
      sA.color = colorToLatexOrHTML('black')
      sB.color = colorToLatexOrHTML('black')

      const objetsEnonce = []
      const objetsCorrection = []
      const nomA1 = texteParPoint(
        noms[0],
        translation(
          A1,
          homothetie(vecteur(A2, A1), A, 0.5 / norme(vecteur(A2, A1))),
        ),
        0,
        'black',
        1,
        'milieu',
        true,
      )
      const nomA2 = texteParPoint(
        noms[1],
        translation(
          A2,
          homothetie(vecteur(A1, A2), A, 0.5 / norme(vecteur(A2, A1))),
        ),
        0,
        'black',
        1,
        'milieu',
        true,
      )
      const nomB1 = texteParPoint(
        noms[2],
        translation(
          B1,
          homothetie(vecteur(B2, B1), A, 0.5 / norme(vecteur(B2, B1))),
        ),
        0,
        'black',
        1,
        'milieu',
        true,
      )
      const nomB2 = texteParPoint(
        noms[3],
        translation(
          B2,
          homothetie(vecteur(B1, B2), A, 0.5 / norme(vecteur(B2, B1))),
        ),
        0,
        'black',
        1,
        'milieu',
        true,
      )

      const cellule = celluleAlea(6)
      result = dansLaCibleCarree(I.x, I.y, 6, 0.6, cellule)
      const cible = cibleCarree({
        x: result[0],
        y: result[1],
        rang: 6,
        taille: 0.6,
        color: orangeMathalea,
      })
      cible.opacite = 0.7

      objetsEnonce.push(cible, sA, sB, nomA1, nomA2, nomB1, nomB2)
      objetsCorrection.push(
        cible,
        sA,
        sB,
        tracePoint(I),
        labelPoint(I),
        nomA1,
        nomA2,
        nomB1,
        nomB2,
      )
      objetsCorrection.push(
        medA,
        medB,
        codageMediatrice(A1, A2, bleuMathalea, marks[1]),
        codageMediatrice(B1, B2, 'green', marks[2]),
      )

      texteCorr += `Le point $I$ d'intersection des deux médiatrices est dans la case ${texteEnCouleurEtGras(cellule)} de la grille.<br>`

      // On appelle la fonction fixBordures qui va déterminer la fenêtre Mathalea2d.
      // Ici, la cible était un objet centré sur (cible.x, cible.y) et de taille 4, on crée deux points en diagonale
      // afin qu'elle soit prise en compte dans son intégralité avec les entêtes de lignes et de colonnes.
      const params = fixeBordures([
        nomA1,
        nomA2,
        nomB1,
        nomB2,
        pointAbstrait(cible.x - 2.5, cible.y - 2.5),
        pointAbstrait(cible.x + 2.5, cible.y + 2.5),
      ])
      const { xmin, xmax, ymin, ymax } = params
      objetsCorrection.push(
        texteParPoint(
          '(d)',
          positionLabelDroite(medA, { xmin, ymin, xmax, ymax }),
          0,
          'black',
          1,
          'milieu',
          true,
        ),
      )
      objetsCorrection.push(
        texteParPoint(
          "(d')",
          positionLabelDroite(medB, { xmin, ymin, xmax, ymax }),
          0,
          'black',
          1,
          'milieu',
          true,
        ),
      )
      Object.assign(params, { pixelsParCm: 20, scale: 0.7 })

      this.autoCorrectionAMC[ee] = {
        enonce: texte + mathalea2d(params, objetsEnonce),
        propositions: [
          {
            texte: texteCorr + mathalea2d(params, objetsCorrection),
            statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
            feedback: '',
            enonce: 'Texte écrit au-dessus ou avant les cases à cocher', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
            sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
          },
        ],
      }
      this.questionsAMC[ee] = amcConvert(this.autoCorrectionAMC[ee])

      if (this.questionJamaisPosee(ee, A.x, A.y, B.x, B.y)) {
        this.listeQuestions[ee] = texte + mathalea2d(params, objetsEnonce)
        this.listeCorrections[ee] =
          texteCorr + mathalea2d(params, objetsCorrection)
        ee++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
