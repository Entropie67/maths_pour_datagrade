import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { latex2d } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range, range1 } from '../../lib/outils/nombres'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes algébriques avec des balances'
export const interactifReady = true

export const dateDePublication = '3/06/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '5c5a2'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

const items = [
  { nom: 'ananas', valMin: 80, valMax: 150 },
  { nom: 'pasteque', valMin: 40, valMax: 60 },
  { nom: 'banane', valMin: 8, valMax: 16 },
  { nom: 'kiwi', valMin: 8, valMax: 12 },
  { nom: 'pomme', valMin: 10, valMax: 15 },
  { nom: 'poire', valMin: 9, valMax: 12 },
  { nom: 'orange', valMin: 15, valMax: 22 },
  { nom: 'citron', valMin: 8, valMax: 14 },
  { nom: 'melon', valMin: 80, valMax: 140 },
  { nom: 'peche', valMin: 10, valMax: 15 },
]
const combinaisons = [
  [
    [2, 1, 2, 2],
    [3, 2, 2, 2],
    [2, 3, 2, 2],
    [4, 2, 3, 2],
    [3, 2, 3, 1],
  ],
  [
    [2, 1, 2, 3],
    [1, 2, 3, 2],
    [3, 1, 3, 3],
    [2, 3, 4, 3],
    [4, 2, 1, 2],
    [3, 3, 1, 3],
    [4, 1, 1, 1],
  ],
  [
    [4, 5, 2, 3],
    [3, 8, 1, 3],
    [2, 3, 4, 5],
    [7, 4, 2, 1],
    [3, 2, 6, 5],
    [2, 3, 5, 6],
  ],
  [
    [4, 3, 2, 4],
    [2, 3, 7, 6],
  ],
  /* Je pense que ça pourra intéresser d'autres niveaux (au lycée) mais par pour les 6e
  [
    [3, 3, 2, 4],
    [2, 4, 3, 3],
    [4, 3, 3, 2],
    [4, 2, 3, 3],
  ],
  */
]

export default class ResoudreDesProblemes extends Exercice {
  classe: number = 6
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Niveaux de difficultés',
      'Nombres séparés par des tirets\n1: Soustraction\n2 : soustraction puis division\n3 multiplication puis soustraction\n4 : multiplication, soustraction puis division\n5 : Mélange',
    ]
    this.sup = '5'
    this.besoinFormulaire2CaseACocher = ['Masse décimale (unité kg)', false]
    this.sup2 = false
  }

  nouvelleVersion() {
    const uniteVolume = this.sup2 ? 'kg' : 'g'
    const niveaux = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = 'On a effectué deux pesées :<br>'
      let texteCorr = ''
      const [fruit1, fruit2] = combinaisonListes(items, 2)
      const p1 =
        randint(fruit1.valMin, fruit1.valMax) * 10 * (this.sup2 ? 0.001 : 1)
      const p2 =
        randint(fruit2.valMin, fruit2.valMax) * 10 * (this.sup2 ? 0.001 : 1)
      const [a, b, c, d] = choice(combinaisons[niveaux[i] - 1])

      const shape1 = listeShapes2DInfos[fruit1.nom]
      const shape2 = listeShapes2DInfos[fruit2.nom]
      const objetsA: NestedObjetMathalea2dArray = [
        shape1.shapeDef,
        shape2.shapeDef,
      ]
      const objetsB: NestedObjetMathalea2dArray = [
        shape1.shapeDef,
        shape2.shapeDef,
      ]
      for (let j = 0; j < a; j++) {
        const shape = shape1.shape2D.clone().translate(j * 0.9, -0.5)
        objetsA.push(shape)
      }
      for (let j = a; j < a + b; j++) {
        const shape = shape2.shape2D.clone().translate(j * 0.9, -0.5)
        objetsA.push(shape)
      }
      for (let j = 0; j < c; j++) {
        const shape = shape1.shape2D.clone().translate(j * 0.9, -0.5)
        objetsB.push(shape)
      }
      for (let j = c; j < c + d; j++) {
        const shape = shape2.shape2D.clone().translate(j * 0.9, -0.5)
        objetsB.push(shape)
      }
      const masseA = a * p1 + b * p2
      const masseB = c * p1 + d * p2
      const peseeA = [
        polyline(
          pointAbstrait(-0.5, -1),
          pointAbstrait(-0.2, -1.3),
          pointAbstrait((a + b - 1) * 0.9 + 0.2, -1.3),
          pointAbstrait((a + b - 1) * 0.9 + 0.5, -1),
        ),
        latex2d(
          `${texNombre(masseA, 3)}\\text{ ${uniteVolume}}`,
          (a + b) / 2,
          -1.7,
          {
            letterSize: 'small',
          },
        ),
      ]
      const peseeB = [
        polyline(
          pointAbstrait(-0.5, -1),
          pointAbstrait(-0.2, -1.3),
          pointAbstrait((c + d - 1) * 0.9 + 0.2, -1.3),
          pointAbstrait((c + d - 1) * 0.9 + 0.5, -1),
        ),
        latex2d(
          `${texNombre(masseB, 3)}\\text{ ${uniteVolume}}`,
          (c + d) / 2,
          -1.7,
          {
            letterSize: 'small',
          },
        ),
      ]
      objetsA.push(...peseeA)
      objetsB.push(...peseeB)
      texte +=
        mathalea2d(
          Object.assign(
            {
              display: context.isHtml ? 'block' : 'inline-block',
              pixelsParCm: 30,
              scale: 1,
            } as const,
            fixeBordures(objetsA, {
              rxmin: 0,
              rymin: 0,
              rxmax: 0,
              rymax: 0,
            }),
          ),
          objetsA,
        ) +
        (context.isHtml ? '' : '\n\n') +
        mathalea2d(
          Object.assign(
            {
              display: context.isHtml ? 'block' : 'inline-block',
              pixelsParCm: 30,
              scale: 1,
            } as const,
            fixeBordures(objetsB, {
              rxmin: 0,
              rymin: 0,
              rxmax: 0,
              rymax: 0,
            }),
          ),
          objetsB,
        )
      const ashape1 = mathalea2d(
        Object.assign(
          {},
          fixeBordures([shape1.shapeDef, shape1.shape2D], {
            rxmin: 0,
            rymin: 0,
            rxmax: 0,
            rymax: 0,
          }),
          { display: 'inline-block' as const, pixelsParCm: 23, scale: 0.5 },
        ),
        [shape1.shapeDef, shape1.shape2D],
      )
      const ashape2 = mathalea2d(
        Object.assign(
          {},
          fixeBordures([shape2.shapeDef, shape2.shape2D], {
            rxmin: 0,
            rymin: 0,
            rxmax: 0,
            rymax: 0,
          }),
          { display: 'inline-block' as const, pixelsParCm: 23, scale: 0.5 },
        ),
        [shape2.shapeDef, shape2.shape2D],
      )
      texte += '<br><br>'
      texte += remplisLesBlancs(
        this,
        i,
        `\\text{Quelle est la masse  d'${shape1.articleSingulier} ${shape1.nomSingulier} : }~%{champ1}~\\text{et celle d'${shape2.articleSingulier} ${shape2.nomSingulier} : }~%{champ2}\\text{ ?}`,
        KeyboardType.masse,
      )

      handleAnswers(this, i, {
        champ1: {
          value: `${stringNombre(p1, 3)}${this.sup2 ? ' kg' : ' g'}`,
          options: { unite: true },
        },
        champ2: {
          value: `${stringNombre(p2, 3)}${this.sup2 ? ' kg' : ' g'}`,
          options: { unite: true },
        },
      })

      switch (niveaux[i]) {
        case 1: // élimination directe d'un des deux fruits par soustraction
          if (a === c) {
            texteCorr += `On remarque que dans les deux pesées, il y a le même nombre ${shape1.articleCourt} ${shape1.nomPluriel}.<br>`
            texteCorr += `Par conséquent, la différence de masse entre les deux pesées se fait uniquement sur les ${shape2.nomPluriel} en plus.<br>`
            texteCorr += `La différence de masse est de : $${texNombre(Math.max(b, d) * p2 + a * p1, 3)}$ ${uniteVolume}$-${texNombre(Math.min(b, d) * p2 + a * p1, 3)}$ ${uniteVolume} soit $${texNombre(Math.abs(b - d) * p2, 3)}$ ${uniteVolume}.<br>`
            texteCorr += `${premiereLettreEnMajuscule(shape2.articleSingulier)} ${shape2.nomSingulier} pèse donc $${miseEnEvidence(
              `${texNombre(p2, 3)}\\text{ ${uniteVolume}}`,
            )}$`
            const lesShapes1 = range1(a)
              .map((i) => ashape1)
              .join('\n')
            const lesShapes2b = range1(b)
              .map((i) => ashape2)
              .join('\n')
            const lesShapes2d = range1(d)
              .map((i) => ashape2)
              .join('\n')
            // Schéma en boîtes
            // On aligne les shapes par le bas
            const boite = new SchemaEnBoite({
              topBraces: [
                {
                  start: 1,
                  end: a + b + 1,
                  text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                },
              ],
              bottomBraces: [
                {
                  start: 1,
                  end: c + d + 1,
                  text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                },
              ],
              lignes: [
                {
                  barres: [
                    {
                      content: lesShapes1,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2b,
                      length: b,
                      color: 'white',
                    },
                  ],
                },
                {
                  barres: [
                    {
                      content: lesShapes1,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2d,
                      length: d,
                      color: 'white',
                    },
                  ],
                },
              ],
            })

            if (context.isHtml) texteCorr += boite.display()
            // Il faut encore calculer p1
            const pesee = b > d ? 'deuxième' : 'première'
            texteCorr += `Pour calculer la masse d'${shape1.articleSingulier} ${shape1.nomSingulier}, on utilise la ${pesee} pesée :<br>`
            texteCorr += `${
              c > 1
                ? `${c} ${shape1.nomPluriel} pèsent`
                : `Un ${shape1.nomSingulier} pèse`
            } d'après la ${pesee} pesée :<br>`
            texteCorr += `$${
              b > d
                ? `${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}=${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}$`
                : `${texNombre(masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}=${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}$`
            }.<br>`
            texteCorr += `Donc ${shape1.articleSingulier} ${shape1.nomSingulier} pèse $${
              b > d
                ? `${
                    c === 1
                      ? ''
                      : `\\dfrac{${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}}{${c}}=`
                  }`
                : `${
                    a === 1
                      ? ''
                      : `\\dfrac{${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}}{${a}}=`
                  }`
            } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`
          } else if (b === d) {
            texteCorr += `On remarque que dans les deux pesées, il y a le même nombre ${shape2.articleCourt} ${shape2.nomPluriel}.<br>`
            texteCorr += `Par conséquent, la différence de masse entre les deux pesées se fait uniquement sur les ${shape1.nomPluriel} en plus.<br>`
            texteCorr += `La différence de masse est de : $${texNombre(Math.max(a, c) * p1 + b * p2, 3)}$ ${uniteVolume}$-${texNombre(Math.min(a, c) * p1 + b * p2, 3)}$ ${uniteVolume} soit $${texNombre(Math.abs(a - c) * p1, 3)}$ ${uniteVolume}.<br>`
            texteCorr += `${premiereLettreEnMajuscule(shape1.articleSingulier)} ${shape1.nomSingulier} pèse donc $${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`

            const lesShapes2 = range1(b)
              .map((i) => ashape2)
              .join('\n')
            const lesSchapes1a = range1(a)
              .map((i) => ashape1)
              .join('\n')
            const lesSchapes1c = range1(c)
              .map((i) => ashape1)
              .join('\n')
            // Schéma en boîtes
            // On aligne les shapes par le bas
            const boite = new SchemaEnBoite({
              topBraces: [
                {
                  start: a > c ? 1 : Math.abs(a - c) + 1,
                  end: a > c ? a + b + 1 : c + b + 1,
                  text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                },
              ],
              bottomBraces: [
                {
                  start: c > a ? 1 : a - c + 1,
                  end: c > a ? c + d + 1 : a + b + 1,
                  text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                },
              ],
              lignes: [
                {
                  barres: (a < c
                    ? [
                        {
                          content: '',
                          length: c - a,
                          color: 'white',
                        },
                      ]
                    : []
                  ).concat([
                    {
                      content: lesSchapes1a,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2,
                      length: b,
                      color: 'white',
                    },
                  ]),
                },
                {
                  barres: (a > c
                    ? [
                        {
                          content: '',
                          length: a - c,
                          color: 'white',
                        },
                      ]
                    : []
                  ).concat([
                    {
                      content: lesSchapes1c,
                      length: Math.min(a, c),
                      color: 'white',
                    },
                    {
                      content: lesShapes2,
                      length: b,
                      color: 'white',
                    },
                  ]),
                },
              ],
            })
            if (context.isHtml) texteCorr += boite.display()
            // Il faut encore calculer p2
            const pesee = a > c ? 'deuxième' : 'première'
            texteCorr += `Pour calculer la masse d'${shape2.articleSingulier} ${shape2.nomSingulier}, on utilise la ${pesee} pesée :<br>`
            texteCorr += `${
              d > 1
                ? `${d} ${shape2.nomPluriel} pèsent`
                : `Un ${shape2.nomSingulier} pèse`
            } d'après la ${pesee} pesée :<br>`
            texteCorr += `$${
              a > c
                ? `${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}=${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}$`
                : `${texNombre(masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}=${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}$`
            }.<br>`
            texteCorr += `Donc ${shape2.articleSingulier} ${shape2.nomSingulier} pèse $${
              a > c
                ? `${
                    d === 1
                      ? ''
                      : `\\dfrac{${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}}{${d}}=`
                  }`
                : `${
                    b === 1
                      ? ''
                      : `\\dfrac{${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}}{${b}}=`
                  }`
            }${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$`
          } else {
            console.error('Il y a un problème avec cette combinaison')
            texteCorr += `La masse d'${shape1.articleSingulier} ${shape1.nomSingulier} est ${texNombre(p1, 3)}$ ${uniteVolume} et celle d'${shape2.articleSingulier} ${shape2.nomSingulier} est ${texNombre(p2, 3)}$ ${uniteVolume}.`
            break
          }
          break
        case 2: // Soustraction puis division (c'est en grande majorité du code une copie du case 1 sauf pour l'ajout de la division en 2)
          if (a === c) {
            texteCorr += `On remarque que dans les deux pesées, il y a le même nombre ${shape1.articleCourt} ${shape1.nomPluriel}.<br>`
            texteCorr += `Par conséquent, la différence de masse entre les deux pesées se fait uniquement sur les ${shape2.nomPluriel} en plus.<br>`
            texteCorr += `La différence de masse est de : 
            $${texNombre(Math.max(b, d) * p2 + a * p1, 3)}$ ${uniteVolume}$-${texNombre(Math.min(b, d) * p2 + a * p1, 3)}$ ${uniteVolume} soit $${texNombre(Math.abs(b - d) * p2, 3)}$ ${uniteVolume} pour $${Math.abs(b - d)}$ ${Math.abs(b - d) === 1 ? shape2.nomSingulier : shape2.nomPluriel}.<br>`
            texteCorr += `${premiereLettreEnMajuscule(shape2.articleSingulier)} ${shape2.nomSingulier} pèse donc $${`\\dfrac{${texNombre(Math.abs(b - d) * p2, 3)}\\text{ ${uniteVolume}}}{${Math.abs(b - d)}}=
              ${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}`}$`

            const lesShapes1 = range1(a)
              .map((i) => ashape1)
              .join('\n')
            const lesShapes2b = range1(b)
              .map((i) => ashape2)
              .join('\n')
            const lesShapes2d = range1(d)
              .map((i) => ashape2)
              .join('\n')
            // Schéma en boîtes
            // On aligne les shapes par le bas
            const boite = new SchemaEnBoite({
              topBraces: [
                {
                  start: 1,
                  end: a + b + 1,
                  text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                },
              ],
              bottomBraces: [
                {
                  start: 1,
                  end: c + d + 1,
                  text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                },
              ],
              lignes: [
                {
                  barres: [
                    {
                      content: lesShapes1,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2b,
                      length: b,
                      color: 'white',
                    },
                  ],
                },
                {
                  barres: [
                    {
                      content: lesShapes1,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2d,
                      length: d,
                      color: 'white',
                    },
                  ],
                },
              ],
            })

            if (context.isHtml) texteCorr += boite.display()
            // Il faut encore calculer p1
            const pesee = b > d ? 'deuxième' : 'première'
            texteCorr += `Pour calculer la masse d'${shape1.articleSingulier} ${shape1.nomSingulier}, on utilise la ${pesee} pesée :<br>`
            texteCorr += `${
              c > 1
                ? `${c} ${shape1.nomPluriel} pèsent`
                : `Un ${shape1.nomSingulier} pèse`
            } d'après la ${pesee} pesée :<br>`
            texteCorr += `$${
              b > d
                ? `${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}=${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}$`
                : `${texNombre(masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}=${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}$`
            }.<br>`
            texteCorr += `Donc ${shape1.articleSingulier} ${shape1.nomSingulier} pèse $${
              b > d
                ? `${
                    c === 1
                      ? ''
                      : `\\dfrac{${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}}{${c}}=`
                  }`
                : `${
                    a === 1
                      ? ''
                      : `\\dfrac{${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}}{${a}}=`
                  }`
            } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`
          } else if (b === d) {
            texteCorr += `On remarque que dans les deux pesées, il y a le même nombre ${shape2.articleCourt} ${shape2.nomPluriel}.<br>`
            texteCorr += `Par conséquent, la différence de masse entre les deux pesées se fait uniquement sur les ${shape1.nomPluriel} en plus.<br>`
            texteCorr += `La différence de masse est de : $${texNombre(Math.max(a, c) * p1 + b * p2, 3)}$ ${uniteVolume}$-${texNombre(Math.min(a, c) * p1 + b * p2, 3)}$ ${uniteVolume} soit $${texNombre(Math.abs(a - c) * p1, 3)}$ ${uniteVolume} pour $${Math.abs(a - c)}$ ${Math.abs(a - c) === 1 ? shape1.nomSingulier : shape1.nomPluriel}.<br>`
            texteCorr += `${premiereLettreEnMajuscule(shape1.articleSingulier)} ${shape1.nomSingulier} pèse donc $`
            texteCorr += `\\dfrac{${texNombre(Math.abs(a - c) * p1, 3)}\\text{ ${uniteVolume}}}{${Math.abs(a - c)}}=
            ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`
            const lesShapes2 = range1(b)
              .map((i) => ashape2)
              .join('\n')
            const lesSchapes1a = range1(a)
              .map((i) => ashape1)
              .join('\n')
            const lesSchapes1c = range1(c)
              .map((i) => ashape1)
              .join('\n')
            // Schéma en boîtes
            // On aligne les shapes par le bas
            const boite = new SchemaEnBoite({
              topBraces: [
                {
                  start: c < a ? 1 : c - a + 1,
                  end: c < a ? a + b + 1 : c + b + 1,
                  text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                },
              ],
              bottomBraces: [
                {
                  start: c > a ? 1 : a - c + 1,
                  end: c > a ? c + d + 1 : a + b + 1,
                  text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                },
              ],
              lignes: [
                {
                  barres: (a < c
                    ? [
                        {
                          content: '',
                          length: c - a,
                          color: 'white',
                        },
                      ]
                    : []
                  ).concat([
                    {
                      content: lesSchapes1a,
                      length: a,
                      color: 'white',
                    },
                    {
                      content: lesShapes2,
                      length: b,
                      color: 'white',
                    },
                  ]),
                },
                {
                  barres: (a > c
                    ? [
                        {
                          content: '',
                          length: a - c,
                          color: 'white',
                        },
                      ]
                    : []
                  ).concat([
                    {
                      content: lesSchapes1c,
                      length: c,
                      color: 'white',
                    },
                    {
                      content: lesShapes2,
                      length: b,
                      color: 'white',
                    },
                  ]),
                },
              ],
            })
            if (context.isHtml) texteCorr += boite.display()
            // Il faut encore calculer p2
            const pesee = a > c ? 'deuxième' : 'première'
            texteCorr += `Pour calculer la masse d'${shape2.articleSingulier} ${shape2.nomSingulier}, on utilise la ${pesee} pesée :<br>`
            texteCorr += `${
              d > 1
                ? `${d} ${shape2.nomPluriel} pèsent`
                : `Un ${shape2.nomSingulier} pèse`
            } d'après la ${pesee} pesée :<br>`
            texteCorr += `$${
              a > c
                ? `${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}=${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}$`
                : `${texNombre(masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}=${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}$`
            }.<br>`
            texteCorr += `Donc ${shape2.articleSingulier} ${shape2.nomSingulier} pèse $${
              a > c
                ? `${
                    d === 1
                      ? ''
                      : `\\dfrac{${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}}{${d}}=`
                  }`
                : `${
                    b === 1
                      ? ''
                      : `\\dfrac{${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}}{${b}}=`
                  }`
            }${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$.<br>`
          } else {
            console.error('Il y a un problème avec cette combinaison')
            texteCorr += `La masse d'${shape1.articleSingulier} ${shape1.nomSingulier} est ${texNombre(p1, 3)}$ ${uniteVolume} et celle d'${shape2.articleSingulier} ${shape2.nomSingulier} est ${texNombre(p2, 3)}$ ${uniteVolume}.`
          }
          break
        case 3: // combinaison simple, a et c sont multiples l'un de l'autre ou b et d
        case 4:
          {
            const rapports = [
              [a / c, 0],
              [b / d, 1],
              [c / a, 2],
              [d / b, 3],
            ].filter((e) => e[0] === Math.floor(e[0]))
            rapports.sort((u, v) => v[1] - u[1])
            const cas = rapports[0][1]
            const vocable = {
              2: 'double',
              3: 'triple',
              4: 'quadruple',
            }
            switch (cas) {
              case 0: // a = kc
                {
                  const n = Math.round(a / c) as 2 | 3 | 4
                  texteCorr += `On remarque que le nombre de ${shape1.nomPluriel} dans la première pesée est ${vocable[n]} de celui de la deuxième pesée.<br>`
                  texteCorr += `On va ${vocable[n]}r la deuxième pesée pour avoir le même nombre de ${shape1.nomPluriel}.<br>`
                  const collection1 =
                    range1(a)
                      .map((i) => ashape1)
                      .join('\n') +
                    range1(b)
                      .map((i) => ashape2)
                      .join('\n')
                  let collection2 = range1(c)
                    .map((i) => ashape1)
                    .join('\n')
                  collection2 += range1(d)
                    .map((i) => ashape2)
                    .join('\n')
                  const boite = new SchemaEnBoite({
                    topBraces: range(n - 1).map((i: number) =>
                      Object.assign(
                        {},
                        {
                          start: 1 + i * (c + d),
                          end: 1 + (i + 1) * (c + d),
                          text: `$${texNombre(masseB, 3)}\\text{ ${uniteVolume}}$`,
                        },
                      ),
                    ),
                    bottomBraces: [
                      {
                        start: 1,
                        end: a + b + 1,
                        text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                      },
                    ],
                    lignes: [
                      {
                        barres: range1(n).map(() => ({
                          content: collection2,
                          length: c + d,
                          color: 'white',
                        })),
                      },
                      {
                        barres: [
                          {
                            content: collection1,
                            length: a + b,
                            color: 'white',
                          },
                        ],
                      },
                    ],
                    rightBraces: [
                      {
                        start: 2,
                        end: 3,
                        text: `$${texNombre(n * masseB, 3)}\\text{ ${uniteVolume}}$`,
                      },
                    ],
                  })
                  if (context.isHtml) texteCorr += boite.display()
                  texteCorr += `La différence de masse s'explique donc par le nombre de ${shape2.nomPluriel} en plus.<br>`
                  texteCorr += `On a : $${texNombre(n * masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(masseA, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(n * masseB - masseA, 3)}\\text{ ${uniteVolume}}$ pour $${n * d - b}$ ${n * d - b === 1 ? shape2.nomSingulier : shape2.nomPluriel}.<br>`
                  texteCorr += `${premiereLettreEnMajuscule(shape2.articleSingulier)} ${shape2.nomSingulier} pèse donc $${
                    n * d - b === 1
                      ? ''
                      : `\\dfrac{${texNombre(n * masseB - masseA, 3)}\\text{ ${uniteVolume}}}{ ${n * d - b}}=`
                  } ${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$<br>`
                  // Maintenant on retrouve la masse de fruit1
                  texteCorr += `Pour calculer la masse d'${shape1.articleSingulier} ${shape1.nomSingulier}, on utilise la deuxième pesée :<br>`
                  texteCorr += `${c > 1 ? `${c} ${shape1.nomPluriel} pèsent` : `Un ${shape1.nomSingulier} pèse`} :<br>`
                  texteCorr += `$${texNombre(masseB, 3)}\\text{ ${uniteVolume}} - ${texNombre(d * p2, 3)}\\text{ ${uniteVolume}} = ${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}$<br>`
                  texteCorr += `Donc ${shape1.articleSingulier} ${shape1.nomSingulier} pèse $${
                    c === 1
                      ? ''
                      : `\\dfrac{${texNombre(c * p1, 3)}\\text{ ${uniteVolume}}}{${c}}=`
                  } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`
                }
                break
              case 1: // b = kd
                {
                  const n = Math.round(b / d) as 2 | 3 | 4
                  texteCorr += `On remarque que le nombre de ${shape2.nomPluriel} dans la première pesée est ${vocable[n]} de celui de la deuxième pesée.<br>`
                  texteCorr += `On va ${vocable[n]}r la deuxième pesée pour avoir le même nombre de ${shape2.nomPluriel}.<br>`
                  const collection1 =
                    range1(a)
                      .map((i) => ashape1)
                      .join('\n') +
                    range1(b)
                      .map((i) => ashape2)
                      .join('\n')
                  let collection2 = range1(c)
                    .map((i) => ashape1)
                    .join('\n')
                  collection2 += range1(d)
                    .map((i) => ashape2)
                    .join('\n')
                  const boite = new SchemaEnBoite({
                    topBraces: range(n - 1).map((i: number) =>
                      Object.assign(
                        {},
                        {
                          start: 1 + i * (c + d),
                          end: 1 + (i + 1) * (c + d),
                          text: `$${texNombre(masseB, 3)}\\text{ ${uniteVolume}}$`,
                        },
                      ),
                    ),
                    bottomBraces: [
                      {
                        start: 1,
                        end: a + b + 1,
                        text: `$${texNombre(masseA, 3)}$ ${uniteVolume}`,
                      },
                    ],
                    lignes: [
                      {
                        barres: range1(n).map(() => ({
                          content: collection2,
                          length: c + d,
                          color: 'white',
                        })),
                      },
                      {
                        barres: [
                          {
                            content: collection1,
                            length: a + b,
                            color: 'white',
                          },
                        ],
                      },
                    ],
                    rightBraces: [
                      {
                        start: 2,
                        end: 3,
                        text: `$${texNombre(n * masseB, 3)}\\text{ ${uniteVolume}}$`,
                      },
                    ],
                  })
                  if (context.isHtml) texteCorr += boite.display()
                  texteCorr += `La différence de masse s'explique donc par le nombre de ${shape1.nomPluriel} en plus.<br>`
                  texteCorr += `On a : $${texNombre(n * masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(masseA, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(n * masseB - masseA, 3)}\\text{ ${uniteVolume}}$ pour $${n * c - a}$ ${n * c - a === 1 ? shape1.nomSingulier : shape1.nomPluriel}.<br>`
                  texteCorr += `${premiereLettreEnMajuscule(shape1.articleSingulier)} ${shape1.nomSingulier} pèse donc $${
                    n * c - a === 1
                      ? ''
                      : `\\dfrac{${texNombre(n * masseB - masseA, 3)}\\text{ ${uniteVolume}}}{ ${n * c - a}}=`
                  } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$<br>`
                  // Maintenant on retrouve la masse de fruit2
                  texteCorr += `Pour calculer la masse d'${shape2.articleSingulier} ${shape2.nomSingulier}, on utilise la deuxième pesée :<br>`
                  texteCorr += `${d > 1 ? `${d} ${shape2.nomPluriel} pèsent` : `Un ${shape2.nomSingulier} pèse`} :<br>`
                  texteCorr += `$${texNombre(masseB, 3)}\\text{ ${uniteVolume}} - ${texNombre(c * p1, 3)}\\text{ ${uniteVolume}} = ${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}$<br>`
                  texteCorr += `Donc ${shape2.articleSingulier} ${shape2.nomSingulier} pèse $${
                    d === 1
                      ? ''
                      : `\\dfrac{${texNombre(d * p2, 3)}\\text{ ${uniteVolume}}}{${d}}=`
                  } ${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$`
                }
                break
              case 2: // c = ka
                {
                  const n = Math.round(c / a) as 2 | 3 | 4
                  texteCorr += `On remarque que le nombre de ${shape1.nomPluriel} dans la deuxième pesée est ${vocable[n]} de celui de la première pesée.<br>`
                  texteCorr += `On va ${vocable[n]}r la première pesée pour avoir le même nombre de ${shape1.nomPluriel}.<br>`
                  const collection1 =
                    range1(a)
                      .map((i) => ashape1)
                      .join('\n') +
                    range1(b)
                      .map((i) => ashape2)
                      .join('\n')
                  let collection2 = range1(c)
                    .map((i) => ashape1)
                    .join('\n')
                  collection2 += range1(d)
                    .map((i) => ashape2)
                    .join('\n')
                  const boite = new SchemaEnBoite({
                    bottomBraces: [
                      {
                        start: 1,
                        end: c + d + 1,
                        text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                      },
                    ],
                    topBraces: range(n - 1).map((i: number) =>
                      Object.assign(
                        {},
                        {
                          start: 1 + i * (a + b),
                          end: 1 + (i + 1) * (a + b),
                          text: `$${texNombre(masseA, 3)}\\text{ ${uniteVolume}}$`,
                        },
                      ),
                    ),
                    lignes: [
                      {
                        barres: range1(n).map(() => ({
                          content: collection1,
                          length: a + b,
                          color: 'white',
                        })),
                      },
                      {
                        barres: [
                          {
                            content: collection2,
                            length: c + d,
                            color: 'white',
                          },
                        ],
                      },
                    ],
                    rightBraces: [
                      {
                        start: 2,
                        end: 3,
                        text: `$${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}$`,
                      },
                    ],
                  })
                  if (context.isHtml) texteCorr += boite.display()
                  texteCorr += `La différence de masse s'explique donc par le nombre de ${shape2.nomPluriel} en plus.<br>`
                  texteCorr +=
                    n * masseA > masseB
                      ? `On a : $${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(masseB, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(n * masseA - masseB, 3)}\\text{ ${uniteVolume}}$ pour $${n * b - d}$ ${n * b - d === 1 ? shape2.nomSingulier : shape2.nomPluriel}.<br>`
                      : `On a : $${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(masseB - n * masseA, 3)}\\text{ ${uniteVolume}}$ pour $${d - n * b}$ ${d - n * b === 1 ? shape2.nomSingulier : shape2.nomPluriel}.<br>`
                  texteCorr += `${premiereLettreEnMajuscule(shape2.articleSingulier)} ${shape2.nomSingulier} pèse donc $${
                    Math.abs(n * b - d) === 1
                      ? ''
                      : `\\dfrac{${texNombre(Math.abs(n * masseA - masseB), 3)}\\text{ ${uniteVolume}}}{ ${Math.abs(n * b - d)}}=`
                  } ${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$<br>`
                  // Maintenant on retrouve la masse de fruit1
                  texteCorr += `Pour calculer la masse d'${shape1.articleSingulier} ${shape1.nomSingulier}, on utilise la première pesée :<br>`
                  texteCorr += `${a > 1 ? `${a} ${shape1.nomPluriel} pèsent` : `Un ${shape1.nomSingulier} pèse`} :<br>`
                  texteCorr += `$${texNombre(masseA, 3)}\\text{ ${uniteVolume}} - ${texNombre(b * p2, 3)}\\text{ ${uniteVolume}} = ${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}$<br>`
                  texteCorr += `Donc ${shape1.articleSingulier} ${shape1.nomSingulier} pèse $${
                    a === 1
                      ? ''
                      : `\\dfrac{${texNombre(a * p1, 3)}\\text{ ${uniteVolume}}}{${a}}=`
                  } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$`
                }
                break
              case 3: // d = kb
                {
                  const n = Math.round(d / b) as 2 | 3 | 4
                  texteCorr += `On remarque que le nombre de ${shape2.nomPluriel} dans la deuxième pesée  est ${vocable[n]} de celui de la deuxième pesée.<br>`
                  texteCorr += `On va ${vocable[n]}r la première pesée pour avoir le même nombre de ${shape2.nomPluriel}.<br>`
                  const collection1 =
                    range1(a)
                      .map((i) => ashape1)
                      .join('\n') +
                    range1(b)
                      .map((i) => ashape2)
                      .join('\n')
                  let collection2 = range1(c)
                    .map((i) => ashape1)
                    .join('\n')
                  collection2 += range1(d)
                    .map((i) => ashape2)
                    .join('\n')
                  const boite = new SchemaEnBoite({
                    bottomBraces: [
                      {
                        start: 1,
                        end: c + d + 1,
                        text: `$${texNombre(masseB, 3)}$ ${uniteVolume}`,
                      },
                    ],
                    topBraces: range(n - 1).map((i: number) =>
                      Object.assign(
                        {},
                        {
                          start: 1 + i * (a + b),
                          end: 1 + (i + 1) * (a + b),
                          text: `$${texNombre(masseA, 3)}\\text{ ${uniteVolume}}$`,
                        },
                      ),
                    ),
                    lignes: [
                      {
                        barres: range1(n).map(() => ({
                          content: collection1,
                          length: a + b,
                          color: 'white',
                        })),
                      },
                      {
                        barres: [
                          {
                            content: collection2,
                            length: c + d,
                            color: 'white',
                          },
                        ],
                      },
                    ],
                    rightBraces: [
                      {
                        start: 2,
                        end: 3,
                        text: `$${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}$`,
                      },
                    ],
                  })
                  if (context.isHtml) texteCorr += boite.display()
                  texteCorr += `La différence de masse s'explique donc par le nombre de ${shape1.nomPluriel} en plus.<br>`
                  texteCorr +=
                    n * masseA > masseB
                      ? `On a : $${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}-${texNombre(masseB, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(n * masseA - masseB, 3)}\\text{ ${uniteVolume}}$ pour $${n * a - c}$ ${n * a - c === 1 ? shape1.nomSingulier : shape1.nomPluriel}.<br>`
                      : `On a : $${texNombre(masseB, 3)}\\text{ ${uniteVolume}}-${texNombre(n * masseA, 3)}\\text{ ${uniteVolume}}$ soit $${texNombre(masseB - n * masseA, 3)}\\text{ ${uniteVolume}}$ pour $${c - n * a}$ ${c - n * a === 1 ? shape1.nomSingulier : shape1.nomPluriel}.<br>`
                  texteCorr += `${premiereLettreEnMajuscule(shape1.articleSingulier)} ${shape1.nomSingulier} pèse donc $${
                    Math.abs(n * a - c) === 1
                      ? ''
                      : `\\dfrac{${texNombre(Math.abs(n * masseA - masseB), 3)}\\text{ ${uniteVolume}}}{ ${Math.abs(n * a - c)}}=`
                  } ${miseEnEvidence(`${texNombre(p1, 3)}\\text{ ${uniteVolume}}`)}$<br>`
                  // Maintenant on retrouve la masse de fruit2
                  texteCorr += `Pour calculer la masse d'${shape2.articleSingulier} ${shape2.nomSingulier}, on utilise la première pesée :<br>`
                  texteCorr += `${b > 1 ? `${b} ${shape2.nomPluriel} pèsent` : `Un ${shape2.nomSingulier} pèse`} :<br>`
                  texteCorr += `$${texNombre(masseA, 3)}\\text{ ${uniteVolume}} - ${texNombre(a * p1, 3)}\\text{ ${uniteVolume}} = ${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}$<br>`
                  texteCorr += `Donc ${shape2.articleSingulier} ${shape2.nomSingulier} pèse $${
                    b === 1
                      ? ''
                      : `\\dfrac{${texNombre(b * p2, 3)}\\text{ ${uniteVolume}}}{${b}}=`
                  } ${miseEnEvidence(`${texNombre(p2, 3)}\\text{ ${uniteVolume}}`)}$`
                }
                break
            }
          }
          break
        case 5: // Ce niveau n'est pas pour les 6e. On le garde pour d'autres niveaux.
          // combinaison complexe, a et c ne sont pas multiples l'un de l'autre et b et d non plus
          texteCorr += `Soit x la masse d'un ${fruit1.nom} et y la masse d'un ${fruit2.nom}.<br>`
          texteCorr += `$${rienSi1(a)}x + ${rienSi1(b)}y = ${texNombre(masseA, 3)}$ ${uniteVolume}<br>`
          texteCorr += `$${rienSi1(c)}x + ${rienSi1(d)}y = ${texNombre(masseB, 3)}$ ${uniteVolume}<br>`
          texteCorr +=
            'On peut résoudre ce système par substitution ou par combinaison.<br>'
          texteCorr +=
            'Par exemple, en multipliant la première équation par ' +
            d +
            ' et la deuxième par ' +
            b +
            ', puis en retranchant membre à membre , on obtient :<br>'
          texteCorr += `$${d * a}x + ${d * b}y - ${b * c} x - ${b * d}y = ${texNombre(d * masseA, 3)} - ${texNombre(b * masseB, 3)}$ ${uniteVolume}<br>`
          texteCorr += `$${rienSi1(d * a - b * c)}x = ${texNombre(d * masseA - b * masseB, 3)} \\Rightarrow ${fruit1.nom} = ${texNombre(
            (d * masseA - b * masseB) / (d * a - b * c),
            3,
          )}$ ${uniteVolume}<br>`
          texteCorr +=
            "En remplaçant dans l'une des deux équations, on trouve :<br>"
          texteCorr += `${fruit2.nom}$ = ${texNombre(
            (masseA - (a * (d * masseA - b * masseB)) / (d * a - b * c)) / b,
            3,
          )}$ ${uniteVolume}`
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      } else cpt++
    }
  }
}
