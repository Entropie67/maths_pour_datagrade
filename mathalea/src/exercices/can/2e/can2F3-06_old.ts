import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre =
  'Utiliser une fonction de référence pour comparer deux images (ancien exercice)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '03/01/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */

export const uuid = '25143'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ComparerAvecFctRef extends Exercice {
  protected typeQuestionFixe?: number

  constructor() {
    super()

    this.nbQuestions = 1

    this.spacing = 1.2
  }

  nouvelleVersion() {
    let texte, texteCorr, a, b, N, props
    for (let i = 0; i < this.nbQuestions;) {
      N = randint(1, 2)
      switch (this.typeQuestionFixe ?? choice([1, 2, 3])) {
        case 1:
          if (N === 1) {
            a = randint(1, 9) + randint(5, 9) / 10
            b = a + (randint(1, 9) / 10) * choice([1, -1])
            texte = 'Sélectionner l’affirmation correcte. '
            if (a < b) {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}>\\dfrac{1}{${texNombre(b)}}$`,
                    statut: true,
                  },
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}<\\dfrac{1}{${texNombre(b)}}$`,
                    statut: false,
                  },
                ],
              }
            } else {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}<\\dfrac{1}{${texNombre(b)}}$`,
                    statut: true,
                  },
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}>\\dfrac{1}{${texNombre(b)}}$`,
                    statut: false,
                  },
                ],
              }
            }

            props = propositionsQcm(this, i)
            if (this.interactif) texte += props.texte
            else {
              texte = `Comparer $\\dfrac{1}{${texNombre(a)}}$ et $\\dfrac{1}{${texNombre(b)}}$.`
            }

            texteCorr = `         La fonction inverse étant strictement décroissante sur $]0;+\\infty[$, elle change l'ordre.
        Cela signifie que deux nombres strictement positifs sont rangés dans l'ordre inverse de leurs inverses.<br>
        Autrement dit, si $a$ et $b$ sont deux nombres strictement positifs et si $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.<br>`

            if (a < b) {
              texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$, 
                alors $${miseEnEvidence(`\\dfrac{1}{${texNombre(a)}} > \\dfrac{1}{${texNombre(b)}}`)}$.`
            } else {
              texteCorr += `Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$, 
                alors $${miseEnEvidence(`\\dfrac{1}{${texNombre(a)}} < \\dfrac{1}{${texNombre(b)}}`)}$.`
            }
          } else {
            a = (randint(1, 9) + randint(5, 9) / 10) * -1
            b = a + (randint(1, 9) / 10) * choice([1, -1])
            texte = 'Sélectionner l’affirmation correcte. '
            if (a < b) {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}>\\dfrac{1}{${texNombre(b)}}$`,
                    statut: true,
                  },
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}<\\dfrac{1}{${texNombre(b)}}$`,
                    statut: false,
                  },
                ],
              }
            } else {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}<\\dfrac{1}{${texNombre(b)}}$`,
                    statut: true,
                  },
                  {
                    texte: `$\\dfrac{1}{${texNombre(a)}}>\\dfrac{1}{${texNombre(b)}}$`,
                    statut: false,
                  },
                ],
              }
            }

            props = propositionsQcm(this, i)
            if (this.interactif) texte += props.texte
            else {
              texte = `Comparer $\\dfrac{1}{${texNombre(a)}}$ et $\\dfrac{1}{${texNombre(b)}}$.`
            }

            texteCorr = `     La fonction inverse étant strictement décroissante sur $]-\\infty;0[$, elle change l'ordre.<br>
    Cela signifie que deux nombres strictement négatifs sont rangés dans l'ordre inverse de leurs inverses.<br>
    Autrement dit, si $a$ et $b$ sont deux nombres strictement négatifs et si $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.<br>`

            if (a < b) {
              texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$, 
              alors $${miseEnEvidence(`\\dfrac{1}{${texNombre(a)}} > \\dfrac{1}{${texNombre(b)}}`)}$.`
            } else {
              texteCorr += `Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$, 
              alors $${miseEnEvidence(`\\dfrac{1}{${texNombre(a)}} < \\dfrac{1}{${texNombre(b)}}`)}$.`
            }
          }
          this.canEnonce = `Comparer $\\dfrac{1}{${texNombre(a)}}$ et $\\dfrac{1}{${texNombre(b)}}$.`

          break
        case 2:
          a = randint(-10, 10) + (randint(-9, 9, 0) / 10) * choice([-1, 1])
          b = (a + randint(1, 9) / 10) * choice([-1, 1])
          texte = 'Sélectionner l’affirmation correcte. '
          if (a < b) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: `$${ecritureParentheseSiNegatif(b)}^3>${ecritureParentheseSiNegatif(a)}^3$`,
                  statut: true,
                },
                {
                  texte: `$${ecritureParentheseSiNegatif(a)}^3>${ecritureParentheseSiNegatif(b)}^3$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: `$${ecritureParentheseSiNegatif(b)}^3<${ecritureParentheseSiNegatif(a)}^3$`,
                  statut: true,
                },
                {
                  texte: `$(${ecritureParentheseSiNegatif(a)})^3<${ecritureParentheseSiNegatif(b)}^3$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Comparer $${ecritureParentheseSiNegatif(a)}^3$ et $${ecritureParentheseSiNegatif(b)}^3$.`
          }

          texteCorr = ` La fonction cube étant strictement croissante sur $\\mathbb{R}$, elle conserve l'ordre.<br>
            Cela signifie que deux nombres réels sont rangés dans le même ordre que leurs cubes.<br>
            Autrement dit, si $a$ et $b$ sont deux nombres réels et si $a < b$, alors $a^3 < b^3$.<br>`
          if (a < b) {
            texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$,
            alors $${miseEnEvidence(`${ecritureParentheseSiNegatif(b)}^3 > ${ecritureParentheseSiNegatif(a)}^3`)}$.`
          } else {
            texteCorr += `Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$, 
            alors $${miseEnEvidence(`${ecritureParentheseSiNegatif(b)}^3 < ${ecritureParentheseSiNegatif(a)}^3`)}$.`
          }
          this.canEnonce = `Comparer $${ecritureParentheseSiNegatif(a)}^3$ et $${ecritureParentheseSiNegatif(b)}^3$.`

          break
        case 3:
          a = randint(0, 10) + randint(6, 9) / 10
          b = a + (randint(1, 5, 0) / 10) * choice([-1, 1])
          if (b === 1) {
            b = 2
          }
          texte = 'Sélectionner l’affirmation correcte. '
          if (a < b) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: `$\\sqrt{${texNombre(b)}}>\\sqrt{${texNombre(a)}}$`,
                  statut: true,
                },
                {
                  texte: `$\\sqrt{${texNombre(a)}}>\\sqrt{${texNombre(b)}}$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: `$\\sqrt{${texNombre(b)}}<\\sqrt{${texNombre(a)}}$`,
                  statut: true,
                },
                {
                  texte: `$\\sqrt{${texNombre(b)}}>\\sqrt{${texNombre(a)}}$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Comparer $\\sqrt{${texNombre(a)}}$ et $\\sqrt{${texNombre(b)}}$.`
          }

          texteCorr = `                La fonction racine carrée étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre.<br>
                Cela signifie que deux nombres réels positifs sont rangés dans le même ordre que leurs racines carrées.<br>
                Autrement dit, si $a$ et $b$ sont deux nombres réels positifs et si $a < b$, alors $\\sqrt{a} < \\sqrt{b}$.<br>`
          if (a < b) {
            texteCorr += ` Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$, alors
                $${miseEnEvidence(`\\sqrt{${texNombre(b)}} > \\sqrt{${texNombre(a)}}`)}$.`
          } else {
            texteCorr += ` Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$, alors 
                $${miseEnEvidence(`\\sqrt{${texNombre(b)}} < \\sqrt{${texNombre(a)}}`)}$.`
          }
          this.canEnonce = `Comparer $\\sqrt{${texNombre(a)}}$ et $\\sqrt{${texNombre(b)}}$.`

          break
        case 4:
        default:
          a = randint(-10, 10, 0)
          do {
            b = randint(-10, 10, [0, a])
          } while (Math.abs(a) === Math.abs(b))
          texte = 'Sélectionner l’affirmation correcte. '
          if (Math.abs(a) < Math.abs(b)) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$|${a}|<|${b}|$`,
                  statut: true,
                },
                {
                  texte: `$|${a}|>|${b}|$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$|${a}|>|${b}|$`,
                  statut: true,
                },
                {
                  texte: `$|${a}|<|${b}|$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else texte = `Comparer $|${a}|$ et $|${b}|$.`

          texteCorr = `La valeur absolue d'un nombre est sa distance à zéro.<br>
          On a $|${a}|=${Math.abs(a)}$ et $|${b}|=${Math.abs(b)}$.<br>`
          if (Math.abs(a) < Math.abs(b)) {
            texteCorr += `Comme $${Math.abs(a)}<${Math.abs(b)}$, alors $${miseEnEvidence(`|${a}|<|${b}|`)}$.`
          } else {
            texteCorr += `Comme $${Math.abs(b)}<${Math.abs(a)}$, alors $${miseEnEvidence(`|${a}|>|${b}|`)}$.`
          }
          this.canEnonce = `Comparer $|${a}|$ et $|${b}|$.`
          break
      }
      if (this.questionJamaisPosee(i, N, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
