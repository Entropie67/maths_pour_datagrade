import { courbe } from '../../lib/2d/Courbe'
import { courbeInterpolee } from '../../lib/2d/CourbeInterpolee.1'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'

export const titre =
  "Résoudre un problème s'appuyant sur la lecture d'une représentation graphique"

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '28/12/2024' // Changements pour homogénéiser l'interactif le 10/02/2026

/**
 * Problème avec lecture de représentation graphique d'une fonction
 * @author Rémi Angot
 */
export const uuid = 'b429f'

export const refs = {
  'fr-fr': ['4F12', '3AutoP04-1'],
  'fr-ch': ['10LCFA3B-9', '10LSFA3B-9', '11CTFA2A-9', 'PRQPF01B-8'],
}
export default class ExploiterRepresentationGraphique extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes (nombres séparés par des tirets)',
      '1 : Projectile\n2 : Trajet à vélo\n3 : Température\n4 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup = '4'
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
    const typesDeProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      nbQuestions: this.nbQuestions,
      defaut: 4,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      if (typesDeProblemes[i] === 1) {
        typeDeProbleme = 'projectile2' // choice(['projectile', 'projectile2'])
      } else {
        typeDeProbleme = typesDeProblemes[i] === 2 ? 'velo' : 'temperature'
      }

      let f, t1, l, g1, r, graphique
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
            texte = `On a représenté ci-dessous l'évolution de la hauteur d'un projectile lancé depuis le sol (en m) en fonction du temps (en secondes).<br>

            ${mathalea2d(
              Object.assign({}, fixeBordures([repeRe, graphique, zero]), {
                pixelsParCm: 30,
                scale: 1,
              }),
              repeRe,
              graphique,
              zero,
            )}<br><br>
            À l'aide de ce graphique, répondre aux questions suivantes :<br><br>`
            const introAMC = texte
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) Au bout de combien de temps le projectile retombe-t-il au sol ? %{champ1}\n
              b) Quelle est la hauteur maximale atteinte par le projectile ? %{champ2}`,
              dataOptions: {
                champ1: {
                  keyboard: KeyboardType.clavierHms,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ2: {
                  keyboard: KeyboardType.longueur,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              },
            })

            handleAnswers(
              this,
              i,
              {
                champ1: {
                  value: texNombre(t1, 0) + 's',
                  options: { HMS: true },
                },
                champ2: {
                  value: `${Math.round(f(t1 / 2))}m`,
                  options: { unite: true, precisionUnite: 0 },
                },
                bareme: toutAUnPoint,
              },
              { formatInteractif: 'multi-mathfield' },
            )
            texteCorr = `${numAlpha(0)} Au bout de $${miseEnEvidence(texNombre(t1))}$ ${texteEnCouleurEtGras('s')}, le projectile retombe au sol car la courbe passe par le point de coordonnées $(${texNombre(
              t1,
            )}~;~0)$.<br>
            ${numAlpha(1)} Le point le plus haut de la courbe a pour abscisse $${texNombre(
              t1 / 2,
            )}$ et pour ordonnée $${Math.round(f(t1 / 2))}$ donc la hauteur maximale est de $${miseEnEvidence(Math.round(f(t1 / 2)))}$ ${texteEnCouleurEtGras('m')}.`

            if (context.isAmc) {
              enonceAMC = introAMC
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
              yLegende: 'Hauteur (en m)',
              xLegende: 'Distance (en m)',
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

            const introAMC = `On a représenté ci-dessous la trajectoire d'un projectile lancé depuis le sol.<br>

            ${mathalea2d(
              Object.assign({}, fixeBordures([repeRe, graphique, zero]), {
                pixelsParCm: 30,
                scale: 1,
              }),
              repeRe,
              graphique,
              zero,
            )}
            <br><br>
             À l'aide de ce graphique, répondre aux questions suivantes :<br><br>`
            texte = introAMC
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) À quelle distance le projectile est-il retombé au sol ? %{champ1}\n
          b) Quelle est la hauteur maximale atteinte par le projectile ? %{champ2}`,
              dataOptions: {
                champ1: {
                  keyboard: KeyboardType.longueur,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ2: {
                  keyboard: KeyboardType.longueur,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              },
            })

            handleAnswers(
              this,
              i,
              {
                champ1: {
                  value: texNombre(t1, 0) + 'm',
                  options: { unite: true, precisionUnite: 0 },
                },
                champ2: {
                  value: `${Math.round(f(t1 / 2))}m`,
                  options: { unite: true, precisionUnite: 0 },
                },
                bareme: toutAUnPoint,
              },
              { formatInteractif: 'multi-mathfield' },
            )
            texteCorr = `${numAlpha(0)} Le projectile retombe au sol à une distance de $${miseEnEvidence(texNombre(t1))}$ ${texteEnCouleurEtGras('m')}, car la courbe passe par le point de coordonnées $(${texNombre(
              t1,
            )}~;~0)$.<br>
             ${numAlpha(1)} Le point le plus haut de la courbe a pour abscisse $${texNombre(t1 / 2)}$ et pour ordonnée $${Math.round(f(t1 / 2))}$ donc la hauteur maximale est de $${miseEnEvidence(Math.round(f(t1 / 2)))}$ ${texteEnCouleurEtGras('m')}.`
            if (context.isAmc) {
              enonceAMC = introAMC
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
            }
            l.epaisseur = 2

            const fille = prenomF()
            const introAMC = `${fille} fait du vélo avec son smartphone sur une voie-verte rectiligne qui part de chez elle. Une application lui permet de voir à quelle distance de chez elle, elle se trouve.<br>
${mathalea2d(
  Object.assign({}, fixeBordures([r, l, zero]), {
    pixelsParCm: 30,
    scale: 1,
  }),
  zero,
  r,
  l,
)}<br><br>
À l'aide de ce graphique, répondre aux questions suivantes :<br><br>`
            texte = introAMC
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) Que se passe-t-il après $${tempsPause}$ minutes de vélo ?\n
b) Pendant combien de temps, ${fille}, a-t-elle fait réellement du vélo ? %{champ2}\n
c) Quelle distance a-t-elle parcourue au total ? %{champ3}`,
              dataOptions: {
                champ2: {
                  keyboard: KeyboardType.clavierHms,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ3: {
                  keyboard: KeyboardType.longueur,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              },
            })

            handleAnswers(
              this,
              i,
              {
                champ2: {
                  value: '30 min',
                  options: { HMS: true },
                },
                champ3: {
                  value: `${2 * v3}km`,
                  options: { unite: true, precisionUnite: 0 },
                },
                bareme: toutAUnPoint,
              },
              { formatInteractif: 'multi-mathfield' },
            )
            texteCorr = `${numAlpha(0)} Après $${tempsPause}$ minutes de vélo, ${fille} fait une pause car la courbe devient horizontale.<br>`
            texteCorr += `${numAlpha(1)} ${fille} est partie $40$ min et a fait une pause de $10$ min donc elle a fait réellement du vélo pendant $${miseEnEvidence(texNombre(30))}$ ${texteEnCouleurEtGras('min')}.<br>
              ${numAlpha(2)} Le point le plus loin de sa maison est à $${v3}\\text{ km}$ et ensuite elle revient chez elle, donc la distance totale est de $${miseEnEvidence(texNombre(2 * v3))}$ ${texteEnCouleurEtGras('km')}.`
            /*

          this.listeQuestions.push(
            'À quel moment a-t-elle été la plus rapide ?',
          )
          this.listeCorrections.push(
            `${fille} a été la plus rapide ${periodeRapide} où elle a effectué $${miseEnEvidence(texNombre(v3))}$ ${texteEnCouleurEtGras('km')} en 10 minutes.`,
          )
            */
            if (context.isAmc) {
              enonceAMC = introAMC
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
                : vide2d(0, tmin)

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
            const introAMC = `On a représenté ci-dessous l'évolution de la température sur une journée.<br>

           ${mathalea2d(
             Object.assign({}, fixeBordures([r, graphique, zero]), {
               pixelsParCm: 30,
               scale: 1,
             }),
             r,
             graphique,
             zero,
           )}
           <br><br>
            À l'aide de ce graphique, répondre aux questions suivantes :<br><br>`
            texte = introAMC
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) Quelle est la température la plus froide de la journée ? %{champ1}\n
  b) Quelle est la température la plus chaude de la journée ? %{champ2}\n
  c) À quelle heure fait-il le plus chaud ? %{champ3}\n
  d) À quelle heure fait-il le plus froid ? %{champ4}`,
              dataOptions: {
                champ1: {
                  keyboard: KeyboardType.nombresEtDegreCelsius,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ2: {
                  keyboard: KeyboardType.nombresEtDegreCelsius,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ3: {
                  keyboard: KeyboardType.clavierHms,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
                champ4: {
                  keyboard: KeyboardType.clavierHms,
                  texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
                },
              },
            })
            handleAnswers(
              this,
              i,
              {
                champ1: {
                  value: `${tmin}°C`,
                  options: { unite: true, precisionUnite: 0 },
                },
                champ2: {
                  value: `${tmax}°C`,
                  options: { unite: true, precisionUnite: 0 },
                },
                champ3: {
                  value: texNombre(hmax, 0) + 'h',
                  options: { HMS: true },
                },
                champ4: {
                  value: texNombre(hmin, 0) + 'h',
                  options: { HMS: true },
                },
                bareme: toutAUnPoint,
              },
              { formatInteractif: 'multi-mathfield' },
            )

            texteCorr = `${numAlpha(0)} La température la plus basse est $${miseEnEvidence(tmin)}$ ${texteEnCouleurEtGras('°C')}.<br>
            ${numAlpha(1)} La température la plus élevée est $${miseEnEvidence(tmax)}$ ${texteEnCouleurEtGras('°C')}.<br>`
            texteCorr += `${numAlpha(2)} Il fait le plus chaud à $${miseEnEvidence(hmax)}$ ${texteEnCouleurEtGras('h')}.<br>
            ${numAlpha(3)} Il fait le plus froid à $${miseEnEvidence(hmin)}$ ${texteEnCouleurEtGras('h')}.`

            if (context.isAmc) {
              enonceAMC = introAMC
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
      if (this.questionJamaisPosee(i, typeDeProbleme)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
