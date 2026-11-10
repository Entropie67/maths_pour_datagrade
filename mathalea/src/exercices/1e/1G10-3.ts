import Decimal from 'decimal.js'
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Calculer un produit scalaire avec un angle'
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '867cd'

export const refs = {
  'fr-fr': ['1G10-3'],
  'fr-ch': ['3G95-3'],
}

export default class CalculProduitScalaireAngle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 1
    this.spacing = 1.5
    this.besoinFormulaire2CaseACocher = ['Avec des radians']
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Application de la formule',
        '2 : Avec une figure (parallélogramme)',
        '3 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, reponse, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1:
          {
            const AB = randint(2, 12)
            const AC = randint(2, 12)
            const listeAngle = [
              [30, '\\dfrac{\\pi}{6}'],
              [45, '\\dfrac{\\pi}{4}'],
              [60, '\\dfrac{\\pi}{3}'],
              [120, '\\dfrac{2\\pi}{3}'],
              [135, '\\dfrac{3\\pi}{4}'],
              [150, '\\dfrac{5\\pi}{6}'],
              [180, '\\pi'],
            ] // ]
            const angle = choice(listeAngle)
            const ligne1 = `\\overrightarrow{AB}\\cdot\\overrightarrow{AC}&=${AB}\\times ${AC}\\times \\cos\\left(${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}\\right)\\\\`
            texte = `On considère un triangle $ABC$ tel que $AB=${AB}$, $AC=${AC}$ et $\\widehat{BAC}=${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}$.<br>
          Calculer $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}$.`
            texteCorr = `D'après le cours on a : $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=AB\\times AC\\times \\cos(\\widehat{BAC})$.<br>
          On applique avec les données de l'énoncé : <br>`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant:
                  '<br>$\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=$',
              },
            )
            if (angle[0] === 30) {
              texteCorr += `$\\begin{aligned}
                ${ligne1}
                &=${AB * AC}\\times \\dfrac{\\sqrt{3}}{2}\\\\
                &=${miseEnEvidence(`${texNombre((AB * AC) / 2, 1)}\\sqrt{3}`)}
                \\end{aligned}$`
              reponse = [`${(AB * AC) / 2}\\sqrt{3}`]
            } else if (angle[0] === 45) {
              texteCorr += `$\\begin{aligned}
                ${ligne1}
                &=${AB * AC}\\times \\dfrac{\\sqrt{2}}{2}\\\\
                &=${miseEnEvidence(`${texNombre((AB * AC) / 2, 1)}\\sqrt{2}`)}
                \\end{aligned}$`
              reponse = [`${(AB * AC) / 2}\\sqrt{2}`]
            } else if (angle[0] === 60) {
              texteCorr += `$\\begin{aligned}
                ${ligne1}
                &=${AB * AC}\\times \\dfrac{1}{2}\\\\
                &=${miseEnEvidence(`${texNombre((AB * AC) / 2, 1)}`)}
                \\end{aligned}$`
              reponse = [`${(AB * AC) / 2}`]
            } else if (angle[0] === 120) {
              texteCorr += `$\\begin{aligned}
                ${ligne1}
                &=${AB * AC}\\times \\left(-\\dfrac{1}{2}\\right)\\\\
                &=${miseEnEvidence(`${texNombre((-AB * AC) / 2, 1)}`)}
                \\end{aligned}$`
              reponse = [`${(-AB * AC) / 2}`]
            } else if (angle[0] === 135) {
              texteCorr += `$\\begin{aligned}
                        ${ligne1}
                        &=${AB * AC}\\times \\left(-\\dfrac{\\sqrt{2}}{2}\\right)\\\\
                        &=${miseEnEvidence(`${texNombre((-AB * AC) / 2, 1)}\\sqrt{2}`)}
                        \\end{aligned}$`
              reponse = [`${(-AB * AC) / 2}\\sqrt{2}`]
            } else if (angle[0] === 150) {
              texteCorr += `$\\begin{aligned}
                            ${ligne1}
                            &=${AB * AC}\\times \\left(-\\dfrac{\\sqrt{3}}{2}\\right)\\\\
                            &=${miseEnEvidence(`${texNombre((-AB * AC) / 2, 1)}\\sqrt{3}`)}
                            \\end{aligned}$`
              reponse = [`${(-AB * AC) / 2}\\sqrt{3}`]
            } else {
              texteCorr += `$\\begin{aligned}
                            ${ligne1}
                            &=${AB * AC}\\times (-1)\\\\
                            &=${miseEnEvidence(`${texNombre(-AB * AC, 1)}`)}
                            \\end{aligned}$`
              reponse = [`${-AB * AC}`]
            }
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          break

        case 2: //
        default: {
          const A = pointAbstrait(0, 0, 'A', 'below')
          const a = randint(3, 6) //
          const b = randint(4, 8) //
          const d = new Decimal(a * b).div(2)
          const B = pointAdistance(A, b, 0, 'B', 'below')
          const listeAngle = [
            [
              30,
              '\\dfrac{\\pi}{6}',
              '\\dfrac{\\sqrt{3}}{2}',
              `${miseEnEvidence(`${texNombre(d, 1)}\\sqrt{3}`)}`,
              `${miseEnEvidence(`-${texNombre(d, 1)}\\sqrt{3}`)}`,
              `${texNombre(d, 1)}\\sqrt{3}`,
              '\\dfrac{5\\pi}{6}',
              150,
            ],
            [
              45,
              '\\dfrac{\\pi}{4}',
              '\\dfrac{\\sqrt{2}}{2}',
              `${miseEnEvidence(`${texNombre(d, 1)}\\sqrt{2}`)}`,
              `${miseEnEvidence(`-${texNombre(d, 1)}\\sqrt{2}`)}`,
              `${texNombre(d, 1)}\\sqrt{2}`,
              '\\dfrac{3\\pi}{4}',
              135,
            ],
            [
              60,
              '\\dfrac{\\pi}{3}',
              '\\dfrac{1}{2}',
              `${miseEnEvidence(`${texNombre(d, 1)}`)}`,
              `${miseEnEvidence(`-${texNombre(d, 1)}`)}`,
              `${texNombre(d, 1)}`,
              '\\dfrac{2\\pi}{3}',
              120,
            ],
          ] // ]
          const angle = choice(listeAngle)
          const cor1 = `&=${a}\\times ${b}\\times \\cos\\left(${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}\\right)\\\\
                         &=${a * b}\\times${angle[2]}\\\\
                         &=${angle[3]}
                         \\end{aligned}$`
          const cor2 = `&=-${a}\\times ${b}\\times \\cos\\left(${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}\\right)\\\\
                         &=-${a * b}\\times${angle[2]}\\\\
                         &=${angle[4]}
                         \\end{aligned}$`
          const cor3 = `&=-${a}\\times ${b}\\times \\cos\\left(${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}\\right)\\\\
                                  &=-${a * b}\\times\\left(-${angle[2]}\\right)\\\\
                                  &=${angle[3]}
                                  \\end{aligned}$`

          const cor4 = `&=${a}\\times ${b}\\times \\cos\\left(${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}\\right)\\\\
                                  &=${a * b}\\times\\left(-${angle[2]}\\right)\\\\
                                  &=${angle[4]}
                                  \\end{aligned}$`
          const methode =
            'On écrit le produit scalaire en utilisant des vecteurs de même origine.<br>'

          const C = pointAdistance(B, a, angle[0], 'C', 'above')
          const D = pointAdistance(A, a, angle[0], 'D', 'above')
          const poly = polygone(A, B, C, D)
          const a1 = afficheLongueurSegment(B, A, 'black', 0.5, '')
          const a2 = afficheLongueurSegment(C, B, 'black', 0.5, '')
          const a3 = afficheMesureAngle(
            B,
            A,
            D,
            'black',
            1,
            `${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}`,
          )
          const objets = []
          objets.push(labelPoint(A, B, C, D), a1, a2, a3, poly)
          texte = '$ABCD$ est un parallélogramme.<br>'
          texte += mathalea2d(
            Object.assign({ zoom: 1, scale: 0.6 }, fixeBordures(objets)),
            objets,
          )
          switch (randint(1, 10)) {
            case 1:
              texte +=
                'Calculer $\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>'
              texteCorr = `On a :<br> $\\begin{aligned}
         \\overrightarrow{AB}\\cdot \\overrightarrow{AD}&=AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
         ${cor1}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{AB}\\cdot \\overrightarrow{AD}=$',
                },
              )
              break
            case 2:
              texte +=
                'Calculer $\\overrightarrow{AB}\\cdot \\overrightarrow{BC}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{BC}=\\overrightarrow{AD}$, on a $\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>
                         $\\begin{aligned}
             \\overrightarrow{AB}\\cdot \\overrightarrow{BC}&= \\overrightarrow{AB}\\cdot \\overrightarrow{AD}\\\\
             &=AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
             ${cor1}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=$',
                },
              )
              break
            case 3:
              texte +=
                'Calculer $\\overrightarrow{AB}\\cdot \\overrightarrow{CB}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{CB}=-\\overrightarrow{AD}$, on a $\\overrightarrow{AB}\\cdot \\overrightarrow{CB}=-\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>
                         $\\begin{aligned}
             \\overrightarrow{AB}\\cdot \\overrightarrow{CB}&= -\\overrightarrow{AB}\\cdot \\overrightarrow{AD}\\\\
             &=-AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
             ${cor2}`
              reponse = `-${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{AB}\\cdot \\overrightarrow{CB}=$',
                },
              )
              break
            case 4:
              texte +=
                'Calculer $\\overrightarrow{DC}\\cdot \\overrightarrow{BC}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{DC}=\\overrightarrow{AB}$ et $\\overrightarrow{BC}=\\overrightarrow{AD}$, on a $\\overrightarrow{DC}\\cdot \\overrightarrow{BC}=\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>
                             $\\begin{aligned}
                 \\overrightarrow{DC}\\cdot \\overrightarrow{BC}&= \\overrightarrow{AB}\\cdot \\overrightarrow{AD}\\\\
                 &=AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
                 ${cor1}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{DC}\\cdot \\overrightarrow{BC}=$',
                },
              )
              break

            case 5:
              texte +=
                'Calculer $\\overrightarrow{CD}\\cdot \\overrightarrow{AD}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{CD}=-\\overrightarrow{AB}$, on a $\\overrightarrow{CD}\\cdot \\overrightarrow{AD}=-\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>
                                 $\\begin{aligned}
                     \\overrightarrow{CD}\\cdot \\overrightarrow{AD}&= -\\overrightarrow{AB}\\cdot \\overrightarrow{AD}\\\\
                     &=-AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
                     ${cor2}`
              reponse = `-${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{CD}\\cdot \\overrightarrow{AD}=$',
                },
              )
              break

            case 6:
              texte +=
                'Calculer $\\overrightarrow{DA}\\cdot \\overrightarrow{BA}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{DA}=-\\overrightarrow{AD}$ et $\\overrightarrow{BA}=-\\overrightarrow{AB}$, on a $\\overrightarrow{DA}\\cdot \\overrightarrow{BA}=\\overrightarrow{AB}\\cdot \\overrightarrow{AD}$.<br>
                                     $\\begin{aligned}
                 \\overrightarrow{DA}\\cdot \\overrightarrow{BA}&= \\overrightarrow{AB}\\cdot \\overrightarrow{AD}\\\\
                 &=AB\\times AD\\times \\cos(\\widehat{BAD})\\\\
                 ${cor1}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{DA}\\cdot \\overrightarrow{BA}=$',
                },
              )
              break
            case 7:
              texte +=
                'Calculer $\\overrightarrow{DA}\\cdot \\overrightarrow{DC}$.<br>'
              texteCorr =
                methode +
                `Comme  $ABCD$ est un parallélogramme, les angles consécutifs sont supplémentaires. <br>
                    Ainsi, $\\widehat{ADC}=${this.sup2 ? '\\pi' : '180^\\circ'}-${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}= ${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}$.<br>
                                         $\\begin{aligned}
                     \\overrightarrow{DA}\\cdot \\overrightarrow{DC}&= \\overrightarrow{DA}\\cdot \\overrightarrow{DC}\\\\
                     &=DA\\times DC\\times \\cos(\\widehat{ADC})\\\\
                     ${cor4}`
              reponse = `-${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{DA}\\cdot \\overrightarrow{DC}=$',
                },
              )
              break

            case 8:
              texte +=
                'Calculer $\\overrightarrow{AD}\\cdot \\overrightarrow{DC}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{AD}=-\\overrightarrow{DA}$, $\\overrightarrow{AD}\\cdot \\overrightarrow{DC}=-\\overrightarrow{DA}\\cdot \\overrightarrow{DC}$.<br>
                        De plus,  $ABCD$ est un parallélogramme donc ses angles consécutifs sont supplémentaires. <br>
                        Ainsi, $\\widehat{ADC}=${this.sup2 ? '\\pi' : '180^\\circ'}-${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}= ${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}$.<br>
                                             $\\begin{aligned}
                         \\overrightarrow{AD}\\cdot \\overrightarrow{DC}&= -\\overrightarrow{DA}\\cdot \\overrightarrow{DC}\\\\
                         &=-DA\\times DC\\times \\cos(\\widehat{ADC})\\\\
                         ${cor3}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{AD}\\cdot \\overrightarrow{DC}=$',
                },
              )
              break

            case 9:
              texte +=
                'Calculer $\\overrightarrow{BC}\\cdot \\overrightarrow{DC}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{BC}=-\\overrightarrow{DA}$, on a  $\\overrightarrow{BC}\\cdot \\overrightarrow{DC}=-\\overrightarrow{DA}\\cdot \\overrightarrow{DC}$.<br>
                        De plus,  $ABCD$ est un parallélogramme donc ses angles consécutifs sont supplémentaires. <br>
                        Ainsi, $\\widehat{ADC}=${this.sup2 ? '\\pi' : '180^\\circ'}-${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}= ${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}$.<br>
                                             $\\begin{aligned}
                         \\overrightarrow{BC}\\cdot \\overrightarrow{DC}&= -\\overrightarrow{DA}\\cdot \\overrightarrow{DC}\\\\
                         &=-DA\\times DC\\times \\cos(\\widehat{ADC})\\\\
                         ${cor3}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{BC}\\cdot \\overrightarrow{DC}=$',
                },
              )
              break

            case 10:
            default:
              texte +=
                'Calculer $\\overrightarrow{BA}\\cdot \\overrightarrow{CB}$.<br>'
              texteCorr =
                methode +
                `Comme  $\\overrightarrow{CB}=-\\overrightarrow{BC}$, on a  $\\overrightarrow{BA}\\cdot \\overrightarrow{CB}=-\\overrightarrow{BA}\\cdot \\overrightarrow{BC}$.<br>
                            De plus,  $ABCD$ est un parallélogramme donc ses angles consécutifs sont supplémentaires. <br>
                            Ainsi, $\\widehat{ABC}=${this.sup2 ? '\\pi' : '180^\\circ'}-${this.sup2 ? `${angle[1]}` : `${angle[0]}^\\circ`}= ${this.sup2 ? `${angle[6]}` : `${angle[7]}^\\circ`}$.<br>
                                                 $\\begin{aligned}
                             \\overrightarrow{BA}\\cdot \\overrightarrow{CB}&= -\\overrightarrow{BA}\\cdot \\overrightarrow{BC}\\\\
                             &=-BA\\times BC\\times \\cos(\\widehat{ABC})\\\\
                             ${cor3}`
              reponse = `${angle[5]}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                {
                  texteAvant:
                    '<br>$\\overrightarrow{BA}\\cdot \\overrightarrow{CB}=$',
                },
              )
              break
          }
          break
        }
      }

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
