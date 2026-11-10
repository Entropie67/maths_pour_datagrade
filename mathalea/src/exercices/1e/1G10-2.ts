import { demiDroite } from '../../lib/2d/DemiDroite'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  'Calculer un angle avec le produit scalaire (dans un repère)'
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '09243'

export const refs = {
  'fr-fr': ['1G10-2'],
  'fr-ch': ['3G95-2'],
}

export default class AngleProduitScalaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 4
    this.spacing = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Avec des questions',
        '2 : Sans question',
        '3 : Avec le graphique',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte,
        texteCorr,
        xA,
        yA,
        xB,
        yB,
        xC,
        yC,
        A,
        B,
        C,
        r,
        o,
        objets,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      xA = randint(-2, 2)
      yA = randint(-2, 2)
      xB = randint(-5, 5, xA)
      yB = randint(-5, 5)
      xC = randint(-5, 5, [xA, xB])
      yC = randint(-5, 5)
      do {
        xA = randint(-2, 2)
        yA = randint(-2, 2)
        xB = randint(-5, 5, xA)
        yB = randint(-5, 5)
        xC = randint(-5, 5, [xA, xB])
        yC = randint(-5, 5)
      } while (
        (xB - xA) * (yC - yA) - (yB - yA) * (xC - xA) === 0 ||
        (xB - xA) * (xC - xA) + (yB - yA) * (yC - yA) === 0
      )
      A = pointAbstrait(xA, yA)
      B = pointAbstrait(xB, yB)
      C = pointAbstrait(xC, yC)
      const demiDroiteAB = demiDroite(A, B, bleuMathalea)
      const demiDroiteAC = demiDroite(A, C, bleuMathalea)
      const labelA = latex2d('A', xA - 0.5, yA + 0.5, {
        letterSize: 'normalsize',
      })
      const labelB = latex2d('B', xB - 0.5, yB + 0.5, {
        letterSize: 'normalsize',
      })
      const labelC = latex2d('C', xC - 0.5, yC - 0.5, {
        letterSize: 'normalsize',
      })
      const traceABetC = tracePoint(A, B, C, 'black')
      demiDroiteAB.epaisseur = 2
      demiDroiteAC.epaisseur = 2
      const redAB = extraireRacineCarree((xB - xA) ** 2 + (yB - yA) ** 2)
      const redAC = extraireRacineCarree((xC - xA) ** 2 + (yC - yA) ** 2)
      const redABAC = extraireRacineCarree(
        ((xC - xA) ** 2 + (yC - yA) ** 2) * ((xB - xA) ** 2 + (yB - yA) ** 2),
      )
      const texteIntro = `Dans un repère orthonormé, on considère les points $A(${xA}\\,;\\,${yA})$, $B(${xB}\\,;\\,${yB})$ et $C(${xC}\\,;\\,${yC})$.`
      const texteCorrQ1 = `On commence par calculer les coordonnées des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$<br>
                $\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\[0.7em]${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$, soit $\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\[0.7em]${yB - yA}\\end{pmatrix}$.<br>
                $\\overrightarrow{AC}\\begin{pmatrix}${xC}-${ecritureParentheseSiNegatif(xA)}\\\\[0.7em]${yC}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$, soit $\\overrightarrow{AC}\\begin{pmatrix}${xC - xA}\\\\[0.7em]${yC - yA}\\end{pmatrix}$.<br>
                Ainsi, $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${xB - xA}\\times ${ecritureParentheseSiNegatif(xC - xA)}+${ecritureParentheseSiNegatif(yB - yA)}\\times ${ecritureParentheseSiNegatif(yC - yA)}=${(xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}$.`
      const normeABsousRacine = (xB - xA) ** 2 + (yB - yA) ** 2
      const normeACsousRacine = (xC - xA) ** 2 + (yC - yA) ** 2
      const texteCorrQ2 = `On calcule $\\Vert\\overrightarrow{AB}\\Vert$ : <br>
      $\\begin{aligned}
      \\Vert\\overrightarrow{AB}\\Vert&=\\sqrt{${ecritureParentheseSiNegatif(xB - xA)}^2+${ecritureParentheseSiNegatif(yB - yA)}^2}\\\\
      &=${redAB[1] === 1 ? `${redAB[0]}` : `\\sqrt{${normeABsousRacine}}${redAB[0] === 1 ? '' : `\\\\&=${rienSi1(redAB[0])}\\sqrt{${redAB[1]}}`}`}
      \\end{aligned}$<br>
    On calcule $\\Vert\\overrightarrow{AC}\\Vert$ : <br>
      $\\begin{aligned}
      \\Vert\\overrightarrow{AC}\\Vert&=\\sqrt{${ecritureParentheseSiNegatif(xC - xA)}^2+${ecritureParentheseSiNegatif(yC - yA)}^2}\\\\
      &=${redAC[1] === 1 ? `${redAC[0]}` : `\\sqrt{${normeACsousRacine}}${redAC[0] === 1 ? '' : `\\\\&=${rienSi1(redAC[0])}\\sqrt{${redAC[1]}}`}`}
      \\end{aligned}$`
      const texteCorrQ3 = `En utilisant les deux égalités  
      $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${(xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}$ 
      et $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${redABAC[1] === 1 ? `${redABAC[0]}` : `${rienSi1(redABAC[0])}\\sqrt{${texNombre(redABAC[1])}}`}\\cos(\\widehat{BAC})$, on obtient :<br>
             $\\begin{aligned}
             ${redABAC[1] === 1 ? `${redABAC[0]}` : `${rienSi1(redABAC[0])}\\sqrt{${texNombre(redABAC[1])}}`}\\cos(\\widehat{BAC})&= ${(xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}\\\\
            \\cos(\\widehat{BAC})&=\\dfrac{${(xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}}{${redABAC[1] === 1 ? `${redABAC[0]}` : `${rienSi1(redABAC[0])}\\sqrt{${texNombre(redABAC[1])}}`}}\\\\
            \\widehat{BAC}&=\\cos^{-1}\\left(\\dfrac{${(xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)}}{${redABAC[1] === 1 ? `${redABAC[0]}` : `${rienSi1(redABAC[0])}\\sqrt{${texNombre(redABAC[1])}}`}}\\right)\\\\
             \\widehat{BAC}&\\approx ${miseEnEvidence(`${texNombre(arrondi((Math.acos(((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)) / Math.sqrt(((xC - xA) ** 2 + (yC - yA) ** 2) * ((xB - xA) ** 2 + (yB - yA) ** 2))) * 180) / Math.PI, 1))}`)}^{\\circ}
             \\end{aligned}$`
      r = repere({
        xUnite: 1,
        yUnite: 1,
        xMin: -7,
        yMin: -7,
        xMax: 7,
        yMax: 7,
        thickHauteur: 0.1,
        yLabelEcart: 0.6,
        xLabelEcart: 0.6,
        axeXStyle: '->',
        axeYStyle: '->',
      })
      o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
      objets.push(
        r,
        o,
        traceABetC,
        labelA,
        demiDroiteAB,
        demiDroiteAC,
        labelB,
        labelC,
      )
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: //
          texte =
            texteIntro +
            createList({
              items: [
                'Calculer $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}$ en utilisant les coordonnées.',
                `Montrer que $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}= ${redABAC[1] === 1 ? `${redABAC[0]}` : `${rienSi1(redABAC[0])}\\sqrt{${texNombre(redABAC[1])}}`}\\cos(\\widehat{BAC})$`,
                "En déduire une valeur approchée en degré à $0,1$ près de l'angle $\\widehat{BAC}$. ",
              ],
              style: 'nombres',
            })
          texteCorr = createList({
            items: [texteCorrQ1, texteCorrQ2, texteCorrQ3],
            style: 'nombres',
          })

          break

        case 2: //
          texte = texteIntro + '<br>'
          texte +=
            "Déterminer la valeur approchée en degré à $0{,}1$ près de l'angle $\\widehat{BAC}$."
          texteCorr = `${texteGras('Méthode :')} on calcule le produit scalaire de deux manières, d'abord avec les coordonnées puis avec le cosinus.<br>
          En utilisant ces deux expressions, on en déduit la mesure de l'angle $\\widehat{BAC}$. <br><br>`
          texteCorr +=
            `${texteGras('Calcul du produit scalaire avec les coordonnées :')}<br>` +
            texteCorrQ1 +
            '<br><br>'
          texteCorr +=
            `${texteGras('Calcul du produit scalaire avec le cosinus :')}<br>` +
            texteCorrQ2 +
            '<br><br>'
          texteCorr += `${texteGras("Calcul de l'angle :")}<br>` + texteCorrQ3
          break

        case 3:
        default:
          texte = texteIntro + '<br>'
          texte +=
            "Déterminer la valeur approchée en degré à $0{,}1$ près de l'angle $\\widehat{BAC}$."
          texte += mathalea2d(
            Object.assign({ zoom: 1, scale: 0.6 }, fixeBordures(objets)),
            objets,
          )
          texteCorr = `${texteGras('Méthode :')} on calcule le produit scalaire de deux manières, d'abord avec les coordonnées puis avec le cosinus.<br>
          En utilisant ces deux expressions, on en déduit la mesure de l'angle $\\widehat{BAC}$. <br><br>`
          texteCorr +=
            `${texteGras('Calcul du produit scalaire avec les coordonnées :')}<br>` +
            texteCorrQ1 +
            '<br><br>'
          texteCorr +=
            `${texteGras('Calcul du produit scalaire avec le cosinus :')}<br>` +
            texteCorrQ2 +
            '<br><br>'
          texteCorr += `${texteGras("Calcul de l'angle :")}<br>` + texteCorrQ3
          break
      }
      handleAnswers(this, i, {
        reponse: {
          value: texNombre(
            arrondi(
              (Math.acos(
                ((xB - xA) * (xC - xA) + (yB - yA) * (yC - yA)) /
                  Math.sqrt(
                    ((xC - xA) ** 2 + (yC - yA) ** 2) *
                      ((xB - xA) ** 2 + (yB - yA) ** 2),
                  ),
              ) *
                180) /
                Math.PI,
              1,
            ),
          ),
        },
      })
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: '$\\widehat{BAC}\\approx$',
            texteApres: '$^{\\circ}$',
          })
      }
      if (this.questionJamaisPosee(i, xA, xB, yA, yB)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
