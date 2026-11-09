import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngle } from '../../lib/2d/angles'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, Polygone } from '../../lib/2d/polygones'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angle, angleOriente } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { shuffleLettres } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = "Utiliser la formule d'Al-Kashi"
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '9774f'

export const refs = {
  'fr-fr': ['1G10-7'],
  'fr-ch': ['3G95-7'],
}

export default class ProduitScalaireAlKashi extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 4
    this.spacing = 1.5
    this.besoinFormulaire2CaseACocher = ['Rappel de la formule de cours', false]
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, reponse, objets, objetsC, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      objetsC = []
      const listeDeNomsDePolygones = ['QD']
      const nomDesPoints = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nomDesPoints)
      let longueurAB: number
      let longueurAC: number
      let longueurBC: number
      let A: PointAbstrait
      let B: PointAbstrait
      let C: PointAbstrait
      let ABC: Polygone
      let cptDo = 0
      do {
        cptDo++
        longueurAB = randint(4, 7)
        longueurAC = randint(4, 7, longueurAB)
        longueurBC =
          randint(5, Math.min(longueurAB + longueurAC - 2, 10), [
            longueurAB,
            longueurAC,
          ]) +
          randint(1, 89) / 100
        A = pointAbstrait(0, 0)
        const angle = randint(-170, 170)
        B = pointAdistance(A, longueurAB, angle)
        ABC = triangle2points2longueurs(A, B, longueurAC, longueurBC)
        C = ABC.listePoints[2]
      } while (Math.abs(Math.abs(angleOriente(B, A, C)) - 90) < 3 && cptDo < 30)
      const codeAB =
        angleOriente(C, A, B) > 0
          ? texteSurSegment(
              `$${texNombre(longueurAB, 1)}$`,
              A,
              B,
              'black',
              0.5,
              true,
            )
          : texteSurSegment(
              `$${texNombre(longueurAB, 1)}$`,
              B,
              A,
              'black',
              0.5,
              true,
            )
      const codeAC =
        angleOriente(B, C, A) > 0
          ? texteSurSegment(
              `$${texNombre(longueurAC, 1)}$`,
              C,
              A,
              'black',
              0.5,
              true,
            )
          : texteSurSegment(
              `$${texNombre(longueurAC, 1)}$`,
              A,
              C,
              'black',
              0.5,
              true,
            )
      const codeBCcours =
        angleOriente(A, B, C) > 0
          ? texteSurSegment('$a$', B, C, 'black', 0.5, true)
          : texteSurSegment('$a$', C, B, 'black', 0.5, true)
      const codeABcours =
        angleOriente(C, A, B) > 0
          ? texteSurSegment('$b$', A, B, 'black', 0.5, true)
          : texteSurSegment('$b$', B, A, 'black', 0.5, true)
      const codeACcours =
        angleOriente(B, C, A) > 0
          ? texteSurSegment('$c$', C, A, 'black', 0.5, true)
          : texteSurSegment('$c$', A, C, 'black', 0.5, true)
      const nom = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom)
      const nommeABC = nommePolygone(ABC, nom)
      const nommeABCcours = nommePolygone(ABC, 'ABC', 0.4)
      const codeAngleA = codageAngle(B, A, C, 1, '', 'red', 1, 1, 'red')
      const codeAngleB = codageAngle(A, B, C, 1, '', 'green', 1, 1, 'green')
      const codeAngleC = codageAngle(
        B,
        C,
        A,
        1,
        '',
        bleuMathalea,
        1,
        1,
        bleuMathalea,
      )
      objetsC.push(
        ABC,
        nommeABCcours,
        codeAngleA,
        codeAngleB,
        codeAngleC,
        codeACcours,
        codeABcours,
        codeBCcours,
      )
      // On fixe la valeur de l'angle ici pour que l'arrondi fait dans MathALÉA2D et dans l'exercice soit toujours le même
      const angleBACString = Math.round(angle(B, A, C)).toFixed(0)
      objets.push(
        ABC,
        nommeABC,
        codeAB,
        codeAC,
        afficheMesureAngle(B, A, C, 'black', 1, `${angleBACString}^\\circ`),
      )
      const figure = mathalea2d(
        Object.assign(
          { scale: 0.7, pixelsParCm: 20, display: 'inline' } as const,
          fixeBordures(objets),
        ),
        objets,
      )
      const figureC = mathalea2d(
        Object.assign(
          { scale: 0.7, pixelsParCm: 15, display: 'inline' } as const,
          fixeBordures(objetsC),
        ),
        objetsC,
      )
      const colonne1 =
        `Soit $ABC$ un triangle avec $AB=b$, $AC=c$ et $BC=a$. Alors :<br>
      <br>` +
        createList({
          items: [
            '$a^2=b^2+c^2-2bc\\cos(\\widehat{BAC})$ ',
            '$b^2=a^2+c^2-2ac\\cos(\\widehat{ACB})$ ',
            '$c^2=a^2+b^2-2ab\\cos(\\widehat{ABC})$',
          ],
          style: 'fleches',
        })
      const colonne2 = figureC
      const cours = deuxColonnes(colonne1, colonne2) + '<br>'
      texte = `En utilisant la figure ci-dessous, calculer $${nom[1]}${nom[2]}$ à $10^{-1}$ près.<br>`
      texte += figure
      if (this.sup2) {
        texteCorr = `${cours}`
      } else {
        texteCorr = ''
      }
      texteCorr += ` Dans le triangle  $${nom[0]}${nom[1]}${nom[2]}$, on connaît les longueurs $${nom[0]}${nom[1]}$, $${nom[0]}${nom[2]}$ et l'angle $\\widehat{${nom[1]}${nom[0]}${nom[2]}}$.<br>
          On applique la formule d'Al-Kashi : <br><br>
                $\\begin{aligned}
               ${nom[1]}${nom[2]}^2&=${nom[0]}${nom[1]}^2+ ${nom[0]}${nom[2]}^2-2\\times ${nom[0]}${nom[1]}\\times ${nom[0]}${nom[2]} \\times \\cos(\\widehat{${nom[1]}${nom[0]}${nom[2]}})\\\\
                ${nom[1]}${nom[2]}^2&=${longueurAB}^2+ ${longueurAC}^2-2\\times ${longueurAB}\\times ${longueurAC} \\times\\cos(${angleBACString}°)\\\\
                ${nom[1]}${nom[2]}^2&=${longueurAB ** 2 + longueurAC ** 2}-${2 * longueurAB * longueurAC}\\cos(${angleBACString}°)\\\\
                ${nom[1]}${nom[2]}&=\\sqrt{${longueurAB ** 2 + longueurAC ** 2}-${2 * longueurAB * longueurAC}\\cos(${angleBACString}°)}\\\\
                ${nom[1]}${nom[2]}&\\approx ${miseEnEvidence(texNombre(Math.sqrt(longueurAB ** 2 + longueurAC ** 2 - 2 * longueurAB * longueurAC * Math.cos(arrondi((Number(angleBACString) * Math.PI) / 180, 4))), 1))}\\\\
              \\end{aligned}$`
      reponse = texNombre(
        Math.sqrt(
          longueurAB ** 2 +
            longueurAC ** 2 -
            2 *
              longueurAB *
              longueurAC *
              Math.cos(arrondi((Number(angleBACString) * Math.PI) / 180, 4)),
        ),
        1,
      )
      handleAnswers(this, i, { reponse: { value: reponse } })
      texte +=
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: `<br>$${nom[1]}${nom[2]}\\approx$`,
        }) + '<br>'

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
