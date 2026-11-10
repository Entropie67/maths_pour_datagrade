import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  listePatternsSansRatioNiFraction,
  type PatternRiche,
  type PatternRiche3D,
} from '../../lib/2d/patterns/patternsPreDef'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPosition } from '../../lib/2d/textes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
// import type { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import {
  cubeDef,
  project3dIso,
  shapeCubeIso,
  updateCubeIso,
} from '../../lib/2d/figures2d/Shape3d'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { VisualPattern3D } from '../../lib/2d/patterns/VisualPattern3D'
import { range1 } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
} from '../../modules/outils'

export const titre =
  "Définir une expression littérale à partir d'un motif itératif"
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '23/06/2025'
export const dateDeModifImportante = '03/06/2026'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif de rang n.
 * Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.
 * Cet exercice contient des modèles issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = 'a35d5'

export const refs = {
  'fr-fr': ['5N5A-4'],
  'fr-2016': ['5L10-5'],
  'fr-ch': ['10LCFA3A-1', '10LSFA3A-1', '11CTFA2H-1', 'PRQNO14A-8'],
}

export default class PaternNum1 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.comment = ` Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.<br>
 Cet exercice contient des patterns issus de l'excellent site : <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br>
 Cet exercice propose d'étudier les premiers termes d'une série de motifs afin de répondre à différentes questions possibles.<br><br>
Grâce au premier paramètre, on peut choisir le nombre de motifs visibles.<br><br>
Grâce au deuxième paramètre, on peut imposer des patterns choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=3" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des patterns choisis au hasard.<br><br>
Grâce au troisième paramètre, on peut imposer l'ordre des motifs choisis au deuxième paramètre (sauf pour le choix 0 qui sera toujours du hasard).
    `
    this.besoinFormulaireNumerique = [
      'Nombre de figures par question',
      3,
      'Deux figures\nTrois Figures\nQuatre Figures',
    ]
    this.sup = 3

    const nbDePattern = listePatternsSansRatioNiFraction.length
    this.besoinFormulaire2Texte = [
      'Numéros des motifs désirés',
      [
        'Nombres séparés par des tirets  :',
        `Entre 1 et ${nbDePattern} : pour choisir un motif particulier`,
        `0 : pour laisser le hasard faire`,
      ].join('\n'),
    ]
    this.sup2 = `0`

    this.besoinFormulaire5CaseACocher = ['Ordre aléatoire des motifs']
    this.sup5 = true
  }

  nouvelleVersion(): void {
    const ordreAleatoireDesQuestions = this.sup5
    const nbDePattern = listePatternsSansRatioNiFraction.length

    let typesPattern = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 0,
      max: nbDePattern,
      defaut: 0,
      melange: 0,
      nbQuestions: Math.min(this.nbQuestions, nbDePattern),
      shuffle: ordreAleatoireDesQuestions,
      exclus: [0],
    }).map(Number)

    typesPattern = [...typesPattern, ...shuffle(range1(nbDePattern))]
    typesPattern = enleveDoublonNum(typesPattern)

    const listePreDef = typesPattern.map(
      (i) => listePatternsSansRatioNiFraction[i - 1],
    )

    const nbFigures = contraindreValeur(2, 4, this.sup + 1, 4)
    for (let i = 0; i < this.nbQuestions;) {
      const objetsCorr: NestedObjetMathalea2dArray = []
      /* const popped = listePreDef.pop()
      if (!popped) {
        continue
      }
      const pat = popped
      */
      const pat = listePreDef[i]

      const pattern =
        'iterate3d' in pat
          ? new VisualPattern3D({
              initialCells: [],
              prefixId: `Ex${this.numeroExercice}Q${i}`,
              shapes: pat.shapes,
              type: 'iso',
            })
          : new VisualPattern([])

      if ('iterate3d' in pattern) {
        pattern.shape = shapeCubeIso()
        pattern.iterate3d = (pat as PatternRiche3D).iterate3d
        objetsCorr.push(cubeDef(`cubeIsoQ${i}F0`))
      } else {
        const pat2D = pat as PatternRiche
        pattern.iterate = (pat as PatternRiche).iterate
        pattern.shapes = pat2D.shapes || ['carré', 'carré']

        if (pat2D.shapes[0] in listeShapes2DInfos)
          objetsCorr.push(listeShapes2DInfos[pat2D.shapes[0]].shapeDef)
        else {
          console.warn(
            `Shape ${pat2D.shapes[0]} n'est pas dans listeShapesDef ou emojis`,
          )
        }
        if (pat2D.shapes[1] && pat2D.shapes[1] !== pat2D.shapes[0]) {
          if (pat2D.shapes[1] in listeShapes2DInfos)
            objetsCorr.push(listeShapes2DInfos[pat2D.shapes[1]].shapeDef)
          else {
            console.warn(
              `Shape ${pat2D.shapes[1]} n'est pas dans listeShapesDef ou emojis`,
            )
          }
        }
      }

      const rendered = pattern.render(nbFigures + 1, 0, 0, Math.PI / 6)
      objetsCorr.push(...rendered)
      let yMax = 0
      let yMin = 0
      const angle = Math.PI / 6
      let texte = `Voici les $${nbFigures}$ premiers motifs d'une série de motifs figuratifs. Les motifs se succèdent selon une règle bien définie.<br>`
      const figures: NestedObjetMathalea2dArray[] = []
      for (let j = 0; j < nbFigures; j++) {
        figures[j] = []
        if ('iterate3d' in pattern) {
          figures[j].push(cubeDef(`cubeIsoQ${i}F${j}`))
        } else {
          const pat2D = pat as PatternRiche
          for (const shape of pat2D.shapes) {
            if (shape in listeShapes2DInfos)
              figures[j].push(listeShapes2DInfos[shape].shapeDef)
            else {
              console.warn(
                `Shape ${shape} n'est pas dans listeShapesDef ou emojis.`,
              )
            }
          }
        }

        let xmin = Infinity
        let ymin = Infinity
        let xmax = -Infinity
        let ymax = -Infinity
        if ('iterate3d' in pattern) {
          if (context.isHtml) {
            updateCubeIso({
              pattern,
              i,
              j,
              angle,
              inCorrectionMode: false,
            })
            if (pattern.shape == null) {
              pattern.shape = shapeCubeIso(`cubeIsoQ${i}F${j}`, 0, 0, {
                fillStyle: '#ffffff',
                strokeStyle: '#000000',
                lineWidth: 1,
                opacite: 1,
                scale: 1,
              })
            }
            pattern.shape.codeSvg = `<use href="#cubeIsoQ${i}F${j}"></use>`
            const cells = (pattern as VisualPattern3D).update3DCells(j + 1)
            // Ajouter les SVG générés par svg() de chaque objet
            cells.forEach((cell) => {
              const [px, py] = project3dIso(cell[0], cell[1], cell[2], angle)
              const obj = shapeCubeIso(`cubeIsoQ${i}F${j}`, px, py)
              figures[j].push(obj)
              ymin = Math.min(ymin, -py / 20)
              ymax = Math.max(ymax, -py / 20)
              xmin = Math.min(xmin, px / 20)
              xmax = Math.max(xmax, px / 20)
            })
            xmin -= 1
            xmax += 1
          } else {
            figures[j].push(
              ...(pattern as VisualPattern3D).render(j + 1, 0, 0, Math.PI / 6),
            )
            ;({ xmin, ymin, xmax, ymax } = fixeBordures(figures[j]))
          }
        } else {
          figures[j].push(...pattern.render(j + 1, 0, 0))
          ;({ xmin, ymin, xmax, ymax } = fixeBordures(figures[j]))
        }
        figures[j].push(
          texteParPosition(
            `Motif ${j + 1}`,
            (xmax + xmin + 1) / 2,
            ymin - 1.5,
            0,
            'black',
            0.8,
            'milieu',
          ),
        )
        const cadre = polygone(
          pointAbstrait(xmin - 1, ymin - 2),
          pointAbstrait(xmax + 2, ymin - 2),
          pointAbstrait(xmax + 2, ymax + 2),
          pointAbstrait(xmin - 1, ymax + 2),
        )
        cadre.pointilles = 4
        figures[j].push(cadre)
        yMax = Math.max(yMax, ymax)
        yMin = Math.min(yMin, ymin)
      }
      texte += figures
        .map((fig, index) =>
          mathalea2d(
            Object.assign(
              fixeBordures(fig, { rxmin: 0, rymin: -1, rxmax: 0, rymax: 1 }),
              {
                id: `Motif${i}F${index}`,
                pixelsParCm: 20,
                yMax,
                yMin,
                scale: 0.4,
                display: 'inline-block' as const,
                optionsTikz: 'transform shape',
              },
            ),
            fig,
          ),
        )
        .join('\n')
      let texteCorr = ''

      const infosShape =
        pat.shapes[0] in listeShapes2DInfos
          ? listeShapes2DInfos[pat.shapes[0]]
          : { articleCourt: 'de ', nomPluriel: 'cubes' }
      const type = pat.type
      switch (type) {
        case 'linéaire':
          texteCorr += `On remarque que le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} augmente de manière constante à chaque nouveau motif.<br>
          Le motif $2$ en a deux fois plus que le motif $1$.<br>
          Le motif $3$ en a trois fois plus que le motif $1$.<br>
          C'est une situation de proportionnalité.<br>`
          break
        case 'affine':
          texteCorr += `On remarque que le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} augmente de manière constante à chaque nouveau motif.<br>
          Le motif $2$ en a $${pat.formule.split('\\times')[0]}$ de plus que le motif $1$.<br>
          Le motif $3$ en a encore $${pat.formule.split('\\times')[0]}$ de plus que le motif $2$.<br>
          Mais le motif $1$ n'en a pas $${pat.formule.split('\\times')[0]}$ mais $${pat.fonctionNb(1)}$.<br>`
          break
      }

      texteCorr += `La formule pour trouver le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} est : $${miseEnEvidence(pat.formule.replaceAll('n', 'n'))}$ où $n$ est le numéro du motif.<br>`
      texte += `<br>Quel sera le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} dans le motif au rang $n$ en fonction de $n$ ?<br>${ajouteQuestionMathlive(
        {
          exercice: this,
          question: i,
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          objetReponse: { reponse: { value: pat.formule } },
          typeInteractivite: 'mathlive',
        },
      )}`

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
