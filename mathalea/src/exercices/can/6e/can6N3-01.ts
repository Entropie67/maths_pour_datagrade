import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { latex2d } from '../../../lib/2d/textes'
import { amcConvert } from '../../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { pgcd } from '../../../lib/outils/primalite'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'

export const titre = 'Lire une abscisse sur une droite graduée'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '29/08/2021'
export const dateDeModifImportante = '12/10/2024'
/**
 * @author Jean-claude Lhote et Gilles Mora (Rajout version CM1\6e par Éric Elter)
 * Créé pendant l'été 2021

 */
export const uuid = 'ca515'

export const refs = {
  'fr-fr': ['can6N3-01', '2N11-flash1'],
  'fr-ch': [],
}

export default class AbscisseFractionnaire extends Exercice {
  version: string
  constructor() {
    super()
    this.nbQuestions = 1
    this.version = '6e'
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(2, 6, this.version === '6e' ? [] : [3, 6]) // dénominateur
      let b = randint(2, a * 4 - 1)
      do {
        b = randint(2, a * 4 - 1) // numérateur
      } while (b % a === 0)
      const c = new FractionEtendue(b, a)
      this.reponse = c
      this.question = "Déterminer l'abscisse du point $A$.<br>"

      this.question += mathalea2d(
        {
          xmin: -1,
          ymin: -1.5,
          xmax: 14,
          ymax: 1.5,
          scale: 0.5,
          pixelsParCm: 30,
          center: !context.isHtml,
        },
        latex2d('A', (3 * b) / a, 0.5, { color: bleuMathalea }),
        droiteGraduee({
          Unite: 3,
          Min: 0,
          Max: 4.2,
          x: 0,
          y: 0,
          thickSecDist: 1 / a,
          thickSec: true,
          thickOffset: 0,
          axeStyle: '->',
          pointListe: [[b / a, '']],
          pointCouleur: bleuMathalea,
          pointTaille: 3,
          pointStyle: 'x',
          labelsPrincipaux: true,
          step1: 1,
          step2: 1,
        }),
      )

      if (!context.isAmc) {
        this.question += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        handleAnswers(this, i, {
          reponse: { value: c.texFraction, options: {} },
        })
      }

      if ((a === 3 || a === 6) && b % a !== 0) {
        this.correction = `L'unité est divisée en $${a}$ intervalles.<br>
      Une graduation correspond donc à $\\dfrac{1}{${a}}$. <br>
       Comme le point $A$ est situé à $${b}$ graduations de l'origine,
        l'abscisse du point $A$ est donc $\\dfrac{1}{${a}}\\times ${b}$, soit  $${miseEnEvidence(`\\dfrac{${b}}{${a}}`)}$.`
      } else if (this.version !== '6e' || pgcd(a, b) === 1) {
        this.correction = `L'unité est divisée en $${a}$ intervalles.<br>
    Une graduation correspond donc à $${this.version === '6e' ? `\\dfrac{1}{${a}}` : `${texNombre(arrondi(1 / a))}`}$. <br>
     Comme le point $A$ est situé à $${b}$ graduations de l'origine,
      l'abscisse du point $A$ est donc $${this.version === '6e' ? `\\dfrac{1}{${a}}` : `${texNombre(arrondi(1 / a))}`}\\times ${b}$, soit  $${miseEnEvidence(`${this.version === '60xe' ? `\\dfrac{${b}}{${a}}` : `${texNombre(arrondi(b / a))}`}`)}$.<br>
      `
      } else {
        this.correction = `L'unité est divisée en $${a}$ intervalles.<br>
      Une graduation correspond donc à $\\dfrac{1}{${a}}$. <br>
       Comme le point $A$ est situé à $${b}$ graduations de l'origine,
        l'abscisse du point $A$ est donc $\\dfrac{1}{${a}}\\times ${b}$, soit  $\\dfrac{${b}}{${a}}$ que l'on peut simplifier en $${miseEnEvidence(`${texFractionReduite(b, a)}`)}$.<br>
        `
      }

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = this.question
        this.listeCorrections[i] = this.correction

        if (context.isAmc) {
          if (this.version === '6e') {
            this.autoCorrectionAMC[i] = {
              enonce: this.question,
              options: { multicols: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.correction,
                      statut: '',
                      reponse: {
                        texte: 'Numérateur',
                        valeur: b,
                        param: {
                          digits: b > 9 ? 2 : 1,
                          decimals: 0,
                          signe: false,
                          approx: 0,
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      statut: '',
                      reponse: {
                        texte: 'Dénominateur',
                        valeur: a,
                        param: {
                          digits: 1,
                          decimals: 0,
                          signe: false,
                          approx: 0,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            this.autoCorrectionAMC[i] = {
              enonce: this.question,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.correction,
                      statut: '',
                      reponse: {
                        texte: 'Valeur décimale',
                        valeur: arrondi(b / a),
                        param: {
                          digits: b > 9 ? 2 : 1,
                          decimals: 0,
                          signe: false,
                          approx: 0,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
