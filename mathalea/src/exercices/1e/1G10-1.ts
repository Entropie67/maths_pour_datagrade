import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { representant } from '../../lib/2d/representantVecteur'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { projectionOrtho } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'

export const titre = 'Calculer des produits scalaires par projection'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'c88fa'
export const ref = '1G10-1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G95-1'],
}
/**
 * Stephan Grignon
 */
export default class SuperExoMathalea2d extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const casDisponibles = ['horizontale', 'verticale', 'angle droit penché']
    const casProjection = combinaisonListes(casDisponibles, this.nbQuestions)
    const casPositionH = randint(1, 3) // de même sens, de sens opposé ou projeté nul

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let x1 = 0
      let y1 = 0
      let x2 = 0
      let y2 = 0
      const objetsEnonce = []
      const objetsCorrection = []

      const A = pointAbstrait(0, 0, 'A')
      function generateur() {
        return randint(3, 5) * randint(-1, 1, [0])
      }
      switch (casProjection[i]) {
        case 'horizontale':
          x1 = generateur()
          y1 = 0
          break
        case 'verticale':
          y1 = generateur()
          x1 = 0
          break
        default: {
          // case 'angle droit penché'
          const germes = [
            [1, 1],
            [1, 2],
            [2, 1],
            [3, 2],
            [2, 3],
          ]
          const couple = germes[randint(0, germes.length - 1)] // On tire un germe au hasard
          let coeff = randint(-1, 1, [0]) * randint(1, 2)
          x1 = couple[0] * coeff
          y1 = couple[1] * coeff
          coeff = randint(1, 2) * randint(-1, 1, [0])
          x2 = -couple[1] * coeff
          y2 = couple[0] * coeff
        }
      }

      if (casProjection[i] !== 'angle droit penché') {
        switch (casPositionH) {
          case 1:
            if (x1 === 0) {
              // @remi : Jamais de == car '0' == 0 est vrai donc on utilise ===
              x2 = generateur()
              y2 = (randint(3, 5) * y1) / Math.abs(y1)
            } else {
              x2 = (randint(3, 5) * x1) / Math.abs(x1)
              y2 = generateur()
            }
            break
          case 2:
            if (x1 === 0) {
              x2 = generateur()
              y2 = (-randint(3, 5) * y1) / Math.abs(y1)
            } else {
              x2 = (-randint(3, 5) * x1) / Math.abs(x1)
              y2 = generateur()
            }
            break
          default: // case 3:
            if (x1 === 0) {
              x2 = generateur()
              y2 = 0
            } else {
              x2 = 0
              y2 = generateur()
            }
            break
        }
      }
      let B,
        C,
        H,
        d1,
        d2,
        monCodage,
        pointProjete,
        surDroite,
        autrePoint,
        AH,
        autreLongueur
      if (randint(0, 1) > 0) {
        pointProjete = 'B'
        autrePoint = 'C'
        surDroite = '(AC)'

        B = pointAbstrait(x2, y2, 'B')
        C = pointAbstrait(x1, y1, 'C')
        autreLongueur = longueur(A, C)

        d1 = droite(A, C)
        d1.pointilles = 1
        d1.color = colorToLatexOrHTML('green')

        H = projectionOrtho(B, d1, 'H')
        AH = longueur(A, H)
        if (AH !== 0) {
          monCodage = codageAngleDroit(A, H, B)
        } else {
          monCodage = vide2d()
        }

        d2 = droite(B, H)
        d2.pointilles = 1
        d2.color = colorToLatexOrHTML(bleuMathalea)
      } else {
        pointProjete = 'C'
        autrePoint = 'B'
        surDroite = '(AB)'

        C = pointAbstrait(x2, y2, 'C')
        B = pointAbstrait(x1, y1, 'B')
        autreLongueur = longueur(A, B)

        d1 = droite(A, B)
        d1.pointilles = 1
        d1.color = colorToLatexOrHTML(bleuMathalea)

        H = projectionOrtho(C, d1, 'H')
        if (longueur(A, H) === 0) {
          monCodage = vide2d()
        } else {
          monCodage = codageAngleDroit(A, H, C)
        }
        AH = longueur(A, H)

        d2 = droite(C, H)
        d2.pointilles = 1
        d2.color = colorToLatexOrHTML('green')
      }
      if (casPositionH === 3 || casProjection[i] === 'angle droit penché') {
        monCodage = codageAngleDroit(B, A, C)
      }

      const g = grille(-8, -6, 8, 6)
      const u = vecteur(A, B)
      const v = vecteur(A, C)
      const w = vecteur(A, H)

      const U = u.norme() === 0 ? vide2d() : representant(u, A)
      U.color = colorToLatexOrHTML(bleuMathalea)
      const V = v.norme() === 0 ? vide2d() : representant(v, A)
      V.color = colorToLatexOrHTML('green')
      const W = Math.abs(AH) < 0.1 ? vide2d() : representant(w, A)
      W.color = colorToLatexOrHTML('red')
      if (casProjection[i] === 'angle droit penché') {
        monCodage.color = colorToLatexOrHTML('red')
        objetsEnonce.push(
          g,
          tracePoint(A, B, C),
          labelPoint(A, B, C),
          U,
          V,
          monCodage,
        )
      } else {
        objetsEnonce.push(g, tracePoint(A, B, C), labelPoint(A, B, C), U, V)
      }

      // (fixeBordures(ObjetsEnonce) va fixer les limites optimales de xmin, xmax, ymin, ymax à partir des bordures des objets)
      const paramsEnonce = Object.assign({}, fixeBordures(objetsEnonce), {
        pixelsParCm: 20,
        scale: 1,
        mainlevee: false,
      })

      let texte =
        'Calculer le produit scalaire des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ en utilisant le quadrillage.<br>'
      texte += "L'unité correspond au côté d'un carreau de quadrillage."

      let texteCorr = ''

      if (casPositionH === 3 || casProjection[i] === 'angle droit penché') {
        texteCorr += `Comme les deux vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont ${texteGras('orthogonaux')}, on en déduit que $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${miseEnEvidence(0)}$.`
        objetsCorrection.push(
          g,
          tracePoint(A, B, C),
          labelPoint(A, B, C),
          U,
          V,
          W,
          d1,
          d2,
          monCodage,
        )
      } else if (casPositionH === 2) {
        texteCorr += `Soit $H$ le projeté orthogonal de  $${pointProjete}$ sur $${surDroite}$. Les vecteurs $\\overrightarrow{AH}$ et $\\overrightarrow{A${autrePoint}}$ sont ${texteGras('de sens opposés')}.<br> On en déduit que $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = - AH \\times A${autrePoint} = -${texNombre(AH)} \\times ${texNombre(autreLongueur)}= ${miseEnEvidence(texNombre(-AH * autreLongueur))}$.`
        objetsCorrection.push(
          g,
          tracePoint(A, B, C),
          labelPoint(A, B, C, H),
          U,
          V,
          W,
          d1,
          d2,
          monCodage,
        )
      } else if (casPositionH === 1) {
        texteCorr += `Soit $H$ le projeté orthogonal de  $${pointProjete}$ sur $${surDroite}$. Les vecteurs $\\overrightarrow{AH}$ et $\\overrightarrow{A${autrePoint}}$ sont ${texteGras('de même sens')}.<br> On en déduit que $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} =  AH \\times A${autrePoint} = ${texNombre(AH)} \\times ${texNombre(autreLongueur)}= ${miseEnEvidence(texNombre(AH * autreLongueur))}$.`
        objetsCorrection.push(
          g,
          tracePoint(A, B, C),
          labelPoint(A, B, C, H),
          U,
          V,
          W,
          d1,
          d2,
          monCodage,
        )
      }

      const paramsCorrection = Object.assign(
        {},
        fixeBordures(objetsCorrection),
        { pixelsParCm: 20, scale: 1, mainlevee: false },
      )
      texte += mathalea2d(paramsEnonce, objetsEnonce)
      if (this.interactif) {
        texte += '<br><br>$\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = $'
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
        handleAnswers(this, i, { reponse: { value: x1 * x2 + y1 * y2 } })
      }
      texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
      if (this.questionJamaisPosee(i, x1, x2, y1, y2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
