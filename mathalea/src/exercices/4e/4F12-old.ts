import { courbe } from '../../lib/2d/Courbe'
import { courbeInterpolee } from '../../lib/2d/CourbeInterpolee.1'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Résoudre un problème s'appuyant sur la lecture d'une représentation graphique"

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '28/12/2024'

/**
 * Problème avec lecture de représentation graphique d'une fonction
 * @author Rémi Angot
 */
export const uuid = 'b428e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExploiterRepresentationGraphique extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des problèmes',
      4,
      '1 : Projectile\n2 : Trajet à vélo (non disponible en interactif)\n3 : Température\n4 : Au hasard',
    ]

    this.nbQuestions = 1

    this.nbQuestionsModifiable = false
    this.sup = 4
  }

  nouvelleVersion() {
    // Vitesses initiales donnant une hauteur entière et une portée entière
    // Vitesses initiales donnant une hauteur entière et une durée de vol entière.
    const vitessesInitiales = [
      28.27, 35.2, 49.6, 63.55, 70.85, 77.45, 84.85, 91.65,
    ]
    const vitessesInitialesBis = [
      10.95, 12.65, 14.15, 15.5, 16.7, 17.9, 19, 20, 21, 21.9, 22.8, 23.7, 24.5,
      25.3, 26.1, 26.8, 27.6, 28.2, 29,
    ]
    let xscale, zero
    let typeDeProbleme
    let enonceAMC
    let situation
    let repeRe
    let tempsPause
    let periodeRapide
    if (this.sup === 1) {
      typeDeProbleme = choice(['projectile', 'projectile2'])
    } else if (this.sup === 2) {
      if (this.interactif)
        typeDeProbleme = choice(['projectile', 'projectile2', 'temperature'])
      else typeDeProbleme = 'velo'
    } else if (this.sup === 3) {
      typeDeProbleme = 'temperature'
    } else {
      typeDeProbleme = this.interactif
        ? choice(['temperature', 'projectile', 'projectile2'])
        : choice(['temperature', 'projectile', 'projectile2', 'velo'])
    }
    let f, t1, l, g1, r, graphique
    let indiceQuestion = 0
    switch (typeDeProbleme) {
      case 'projectile': // Courbe de l'altitude de vol en fonction du temps
        {
          const V0 = choice(vitessesInitiales)
          t1 = Math.round((Math.sqrt(2) * V0) / 10)
          xscale = 9 / t1
          f = (x: number) =>
            Math.max(-5 * x ** 2 + (V0 * Math.sqrt(2) * x) / 2, 0)
          repeRe = repere({
            yLegende: 'Hauteur (en m)',
            xLegende: 'Temps (en s)',
            xUnite: 1 * xscale,
            yUnite: 0.1 * xscale,
            xMin: 0,
            yMin: 0,
            xMax: t1 + 1,
            yMax: f(t1 / 2) + 20,
            xThickDistance: 1,
            yThickDistance: 10,
            grilleSecondaireY: true,
            grilleSecondaireYDistance: 2,
            grilleSecondaireYMin: 0,
            grilleSecondaireYMax: f(t1 / 2) + 5,
          }) // ()
          graphique = courbe(f, { repere: repeRe, xMax: t1 + 1, step: 0.2 })
          zero = texteParPosition('0', -0.5, 0, 0, 'black', 1, 'milieu', true)
          this.introduction =
            "On a représenté ci-dessous l'évolution de la hauteur d'un projectile lancé depuis le sol (en m) en fonction du temps (en secondes)."

          this.introduction +=
            '<br><br>' +
            mathalea2d(
              Object.assign({}, fixeBordures([repeRe, graphique, zero]), {
                pixelsParCm: 30,
                scale: 1,
              }),
              repeRe,
              graphique,
              zero,
            )

          this.introduction +=
            '<br><br>' +
            "À l'aide de ce graphique, répondre aux questions suivantes :"

          this.listeQuestions.push(
            'Au bout de combien de temps le projectile retombe-t-il au sol ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.clavierHms,
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: { value: texNombre(t1, 0) + 's', options: { HMS: true } },
          })
          indiceQuestion++
          this.listeCorrections.push(
            `Au bout de $${miseEnEvidence(
              texNombre(t1) + sp() + '\\text{s}',
            )}$, le projectile retombe au sol car la courbe passe par le point de coordonnées $(${texNombre(
              t1,
            )}~;~0)$.`,
          )
          this.listeQuestions.push(
            'Quelle est la hauteur maximale atteinte par le projectile ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.longueur,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: `${Math.round(f(t1 / 2))}m`,
              options: { unite: true, precisionUnite: 0 },
            },
          })
          indiceQuestion++
          this.listeCorrections.push(
            `Le point le plus haut de la courbe a pour abscisse $${texNombre(
              t1 / 2,
            )}$ et pour ordonnée $${Math.round(f(t1 / 2))}$ donc la hauteur maximale est de $${miseEnEvidence(Math.round(f(t1 / 2)) + sp() + '\\text{m}')}$.`,
          )
          if (context.isAmc) {
            enonceAMC = this.introduction
            for (let i = 0; i < this.listeQuestions.length; i++) {
              enonceAMC += `${i + 1}) ${this.listeQuestions[i]}<br>`
            }
            this.autoCorrectionAMC[0] = {
              enonce: enonceAMC,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.listeCorrections[0],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: t1,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[1],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: Math.round(f(t1 / 2)),
                        param: {
                          digits: 3,
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
            this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
          }
        }
        break
      case 'projectile2':
        {
          const V0 = choice(vitessesInitialesBis)
          t1 = Math.round(V0 ** 2 / 10)
          xscale = 52 / t1
          f = (x: number) => Math.max((-10 * x ** 2) / V0 ** 2 + x, 0)
          repeRe = repere({
            yLegende: 'hauteur (en $\\text{m})',
            xLegende: 'distance (en $\\text{m})',
            xUnite: 0.25 * xscale,
            yUnite: 0.5 * xscale,
            xMin: 0,
            yMin: 0,
            xMax: t1 + 4,
            yMax: f(t1 / 2) + 2.1,
            xThickDistance: 4,
            yThickDistance: 1,
            grilleSecondaireY: true,
            grilleSecondaireYDistance: 0.25,
            grilleSecondaireYMin: 0,
            grilleSecondaireYMax: f(t1 / 2) + 1,
          }) // ()
          graphique = courbe(f, { repere: repeRe, step: 0.5 })
          zero = texteParPosition('0', -0.5, 0, 0, 'black', 1, 'milieu', true)

          this.introduction =
            "On a représenté ci-dessous la trajectoire d'un projectile lancé depuis le sol."

          this.introduction +=
            '<br><br>' +
            mathalea2d(
              Object.assign({}, fixeBordures([repeRe, graphique, zero]), {
                pixelsParCm: 30,
                scale: 1,
              }),
              repeRe,
              graphique,
              zero,
            )

          this.introduction +=
            '<br><br>' +
            "À l'aide de ce graphique, répondre aux questions suivantes :"

          this.listeQuestions.push(
            'À quelle distance le projectile est-il retombé au sol ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.longueur,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: `${t1}m`,
              options: { unite: true, precisionUnite: 0 },
            },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `Le projectile retombe au sol à une distance de $${miseEnEvidence(texNombre(t1) + sp() + '\\text{m}')}$, car la courbe passe par le point de coordonnées $(${texNombre(
              t1,
            )}~;~0)$.`,
          )

          this.listeQuestions.push(
            'Quelle est la hauteur maximale atteinte par le projectile ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.longueur,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: `${Math.round(f(t1 / 2))}m`,
              options: { unite: true, precisionUnite: 0 },
            },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `Le point le plus haut de la courbe a pour abscisse $${texNombre(t1 / 2)}$ et pour ordonnée $${Math.round(f(t1 / 2))}$ donc la hauteur maximale est de $${miseEnEvidence(Math.round(f(t1 / 2)) + sp() + '\\text{m}')}$.`,
          )
          if (context.isAmc) {
            enonceAMC = this.introduction
            for (let i = 0; i < this.listeQuestions.length; i++) {
              enonceAMC += `${i + 1}) ${this.listeQuestions[i]}<br>`
            }
            this.autoCorrectionAMC[0] = {
              enonce: enonceAMC,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.listeCorrections[0],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: t1,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[1],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: Math.round(f(t1 / 2)),
                        param: {
                          digits: 3,
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
            this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
          }
        }
        break

      case 'velo':
        {
          const v1 = randint(1, 4)
          const v2 = randint(1, 3, v1)
          const v3 = v1 + v2
          r = repere({
            yLegende: 'Distance (en km)',
            xLegende: 'Temps (en min)',
            xMin: 0,
            yMin: 0,
            xMax: 60,
            yMax: v3 + 1,
            xUnite: 0.1,
            yUnite: 1,
            xThickDistance: 10,
            yThickDistance: 1,
            grilleSecondaireY: true,
            grilleSecondaireX: true,
            grilleSecondaireYDistance: 0.2,
            grilleSecondaireXDistance: 2,
            grilleSecondaireXMin: 0,
            grilleSecondaireXMax: 60,
            grilleSecondaireYMin: 0,
            grilleSecondaireYMax: v3 + 1,
          })
          g1 = grille(-1, -1, 6, 8, 'black')
          g1.opacite = 1
          situation = randint(1, 3)
          zero = texteParPosition('0', -0.7, 0, 0, 'black', 1, 'milieu', true)

          if (situation === 1) {
            l = polyline(
              [
                pointAbstrait(0, 0),
                pointAbstrait(1, v1),
                pointAbstrait(2, v3),
                pointAbstrait(3, v3),
                pointAbstrait(4, 0),
              ],
              bleuMathalea,
            )
            tempsPause = 20
            periodeRapide = 'de la 30e à la 40e minute'
          } else if (situation === 2) {
            l = polyline(
              [
                pointAbstrait(0, 0),
                pointAbstrait(1, v3),
                pointAbstrait(2, v3),
                pointAbstrait(3, v2),
                pointAbstrait(4, 0),
              ],
              bleuMathalea,
            )
            tempsPause = 10
            periodeRapide = 'durant les 10 premières minutes'
          } else {
            l = polyline(
              [
                pointAbstrait(0, 0),
                pointAbstrait(1, v3),
                pointAbstrait(2, v2),
                pointAbstrait(3, v2),
                pointAbstrait(4, 0),
              ],
              bleuMathalea,
            )
            tempsPause = 20
            periodeRapide = 'durant les 10 premières minutes'
          }
          l.epaisseur = 2

          const fille = prenomF()
          this.introduction = `${fille} fait du vélo avec son smartphone sur une voie-verte rectiligne qui part de chez elle. Une application lui permet de voir à quelle distance de chez elle, elle se trouve.`

          this.introduction +=
            '<br><br>' +
            mathalea2d(
              Object.assign({}, fixeBordures([r, l, zero]), {
                pixelsParCm: 30,
                scale: 1,
              }),
              zero,
              r,
              l,
            )

          this.introduction +=
            '<br><br>' +
            "À l'aide de ce graphique, répondre aux questions suivantes :"

          this.listeQuestions.push(
            `Que se passe-t-il après ${tempsPause} minutes de vélo ?`,
          )
          this.listeCorrections.push(
            "La distance reste constante alors qu'elle est sur un chemin rectiligne. Elle a donc fait une pause.",
          )

          this.listeQuestions.push(
            `Pendant combien de temps, ${fille}, a-t-elle fait réellement du vélo ?`,
          )
          this.listeCorrections.push(
            `${fille} est partie 40 min et a fait une pause de 10 min donc elle a fait réellement du vélo pendant $${miseEnEvidence(texNombre(30) + sp() + '\\text{min}')}$.`,
          )

          this.listeQuestions.push(
            'Quelle distance a-t-elle parcourue au total ?',
          )
          this.listeCorrections.push(
            `Le point le plus loin de sa maison est à ${v3} $\\text{km}$ et ensuite elle revient chez elle, donc la distance totale est de $${miseEnEvidence(texNombre(2 * v3) + sp() + '\\text{km}')}$.`,
          )

          this.listeQuestions.push(
            'À quel moment a-t-elle été la plus rapide ?',
          )
          this.listeCorrections.push(
            `${fille} a été la plus rapide ${periodeRapide} où elle a effectué $${miseEnEvidence(texNombre(v3) + sp() + '\\text{km}')}$ en 10 minutes.`,
          )
          if (context.isAmc) {
            enonceAMC = this.introduction
            for (let i = 0; i < this.listeQuestions.length; i++) {
              enonceAMC += `${i + 1}) ${this.listeQuestions[i]}<br>`
            }
            this.autoCorrectionAMC[0] = {
              enonce: enonceAMC,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.listeCorrections[0],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: 40,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[1],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: 2 * v3,
                        param: {
                          digits: 2,
                          decimals: 0,
                          signe: false,
                          approx: 0,
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: this.listeCorrections[2],
                      statut: 2,
                    },
                  ],
                },
                {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: this.listeCorrections[3],
                      statut: 2,
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
          }
        }
        break
      case 'temperature':
      default:
        {
          const hmin = randint(2, 4)
          const hmax = randint(12, 16)
          const tmin = randint(-5, 15)
          const tmax = tmin + randint(5, 12)
          zero =
            tmin < 0
              ? texteParPosition('0', -0.5, 0, 0, 'black', 1, 'milieu', true)
              : vide2d()
          r = repere({
            xMin: 0,
            yMin: tmin - 1,
            yMax: tmax + 2,
            xMax: 24,
            xUnite: 1,
            yUnite: 1,
            xLegende: 'Heure',
            yLegende: 'Température (en °C)',
          })
          graphique = courbeInterpolee(
            [
              [-2, tmin + 2],
              [hmin, tmin],
              [hmax, tmax],
              [26, tmin + 2],
            ],
            {
              color: bleuMathalea,
              epaisseur: 2,
              repere: r,
              xMin: 0,
              xMax: 24,
            },
          )
          this.introduction =
            "On a représenté ci-dessous l'évolution de la température sur une journée."
          this.introduction +=
            '<br><br>' +
            mathalea2d(
              Object.assign({}, fixeBordures([r, graphique]), {
                pixelsParCm: 20,
                scale: 0.5,
              }),
              r,
              zero,
              graphique,
            )

          this.introduction +=
            '<br><br>' +
            "À l'aide de ce graphique, répondre aux questions suivantes :"

          this.listeQuestions.push(
            'Quelle est la température la plus froide de la journée ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.nombresEtDegreCelsius,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: `${tmin}°C`,
              options: { unite: true, precisionUnite: 0 },
            },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `La température la plus basse est $${miseEnEvidence(`${tmin}^\\circ\\text{C}`)}$.`,
          )

          this.listeQuestions.push(
            'Quelle est la température la plus chaude de la journée ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.nombresEtDegreCelsius,
                {
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: `${tmax}°C`,
              options: { unite: true, precisionUnite: 0 },
            },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `La température la plus élevée de la journée est $${miseEnEvidence(`${tmax}^\\circ\\text{C}`)}$.`,
          )
          this.listeQuestions.push(
            'À quelle heure fait-il le plus chaud ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.clavierHms,
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: { value: String(hmax) + ' h', options: { HMS: true } },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `C'est à $${miseEnEvidence(hmax + sp() + '\\text{h}')}$ qu'il fait le plus chaud.`,
          )
          this.listeQuestions.push(
            'À quelle heure fait-il le plus froid ?' +
              ajouteChampTexteMathLive(
                this,
                indiceQuestion,
                KeyboardType.clavierHms,
              ),
          )
          handleAnswers(this, indiceQuestion, {
            reponse: { value: String(hmin) + ' h', options: { HMS: true } },
          })
          indiceQuestion++

          this.listeCorrections.push(
            `C'est à $${miseEnEvidence(hmin + sp() + '\\text{h}')}$ qu'il fait le plus froid.`,
          )
          if (context.isAmc) {
            enonceAMC = this.introduction
            for (let i = 0; i < this.listeQuestions.length; i++) {
              enonceAMC += `${i + 1}) ${this.listeQuestions[i]}<br>`
            }
            this.autoCorrectionAMC[0] = {
              enonce: enonceAMC,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: this.listeCorrections[0],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: tmin,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[1],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: tmax,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[2],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: hmax,
                        param: {
                          digits: 2,
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
                      texte: this.listeCorrections[3],
                      statut: '',
                      reponse: {
                        texte: '1)',
                        valeur: hmin,
                        param: {
                          digits: 2,
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
            this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
          }
        }
        break
    }
    if (!context.isAmc) {
      listeQuestionsToContenu(this)
    }
  }
}
