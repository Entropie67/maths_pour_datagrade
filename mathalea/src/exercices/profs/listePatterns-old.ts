// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 71ff5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Decimal from 'decimal.js'
import {
  cubeDef,
  faceLeft,
  faceRight,
  faceTop,
  project3dIso,
  shapeCubeIso,
  updateCubeIso,
} from '../../lib/2d/figures2d/Shape3d'
import {
  listeShapes2DInfos,
  shapeNames,
  type ShapeName,
} from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  listePatternRatio,
  listePatternsSansRatioNiFraction,
  type PatternRiche,
  type PatternRiche3D,
} from '../../lib/2d/patterns/patternsPreDef'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { VisualPattern3D } from '../../lib/2d/patterns/VisualPattern3D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { patternsFor6N4B_2 } from '../6e/6N4B-2'
import Exercice from '../Exercice'

export const titre =
  'Consulter la liste des patterns disponibles pour différents exercices'
export const dateDePublication = '26/11/2025'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const uuid = '71ff5'

/**
 * Affiche les patterns propres à un exercice
 * @author Éric Elter
 *  (sur la base de listePatterns de Jean-claude Lhote)
 */
export default class ListePatternsTousLesExosOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.listePackages = ['twemojis'] // this.listePackages est inutile mais la présence du mot "twemojis" est indispensable pour la sortie LaTeX.
    this.nbQuestionsModifiable = false
    this.pasDeVersionLatex = true // page de référence : contenu trop volumineux pour un export LaTeX
    this.besoinFormulaireNumerique = [
      'Liste restreinte pour la référence',
      6,
      '1 : 6N4B\n2 : 6N4B-2\n3 : 5I13\n4 : 5L10-5\n5 : 5P12-2\n6 : 4L13-3\n7 : 3L13-7\n8 : 3L16',
    ]
    this.sup = 1

    this.besoinFormulaire3Numerique = ['Nombre de motifs par pattern', 6]
    this.sup3 = 4
    this.comment = `Cette page affiche la liste des patterns disponibles dans des exercices avec leur numéro de référence et pour information, le nombre d'éléments 
    pour le motif $43$ ainsi que le nombre d'éléments au rang n de chaque pattern.<br>`
  }

  nouvelleVersion(): void {
    this.sup3 = Math.max(2, this.sup3) // On ne peut pas afficher moins de 2 motifs
    let texte = ''

    let listeOfAll: (PatternRiche | PatternRiche3D)[] = []
    switch (this.sup) {
      case 2:
        listeOfAll = patternsFor6N4B_2
        break
      case 5:
      case 8:
        listeOfAll = listePatternRatio
        break
      default:
        listeOfAll = listePatternsSansRatioNiFraction
        break
    }

    if (listeOfAll == null || listeOfAll.length === 0) return
    for (let i = 0; i < listeOfAll.length; i++) {
      const pat = listeOfAll[i]
      if (pat == null) {
        texte += `\n${texteEnCouleurEtGras(`Motif $\\mathbf{${i + 1}}$`, 'red')}: ${texteEnCouleurEtGras('Motif inexistant', 'red')}`
        continue
      }

      if ('nbMotifMin' in pat && typeof pat.nbMotifMin === 'number') {
        // On est en présence d'un motif répétitif
        const objets: NestedObjetMathalea2dArray = []
        if ('shapes' in pat) {
          for (const shape of pat.shapes) {
            if (shape in listeShapes2DInfos) {
              objets.push(listeShapes2DInfos[shape].shapeDef)
            }
          }
        }

        for (let j = 0; j <= pat.nbMotifMin; j++) {
          const pattern = new VisualPattern([])

          if ('shapes' in pat) pattern.shapes = pat.shapes
          if ('iterate' in pat) pattern.iterate = pat.iterate
          objets.push(pattern.render(j, j + 1, 0))
        }
        texte += `\n${texteEnCouleurEtGras(`Motif $\\mathbf{${i + 1}}$`, bleuMathalea)} ${pat.difficulte === undefined ? '' : ' (' + pat.difficulte + ')'} :<br>`
        texte += mathalea2d(
          Object.assign(
            fixeBordures(objets, { rxmin: 0, rymin: -1, rxmax: 0, rymax: 1 }),
            { pixelsParCm: 20, scale: 0.4, optionsTikz: 'transform shape' },
          ),
          objets,
        )
      } else {
        const texRatio = 'texRatio' in pat ? (pat.texRatio ?? '') : ''

        const ratio43 = pat
          .fonctionRatio?.(43)
          ?.values?.map((v) => texNombre(new Decimal(v)))
          .join(' : ')
        const unDePlus = this.sup3 + 1
        const n43 = !('nbMotifMin' in pat)
          ? pat.fonctionRatio != null
            ? new Decimal(pat.fonctionRatio(43).total())
            : new Decimal(pat.fonctionNb(43))
          : new Decimal(0)
        const ratioUnDePlus = pat
          .fonctionRatio?.(unDePlus)
          .values.map((v) => texNombre(new Decimal(v)))
          .join(' : ')
        const nUnDePlus = !('nbMotifMin' in pat)
          ? pat.fonctionRatio != null
            ? new Decimal(pat.fonctionRatio(unDePlus).total())
            : new Decimal(pat.fonctionNb(unDePlus))
          : new Decimal(0)
        const infosShape =
          pat.shapes[0] in listeShapes2DInfos
            ? listeShapes2DInfos[pat.shapes[0]]
            : { articleCourt: 'de ', nomPluriel: 'cubes' }

        const nom = infosShape.nomPluriel

        const patternRiche = pat
        const pattern =
          'iterate3d' in patternRiche
            ? new VisualPattern3D({
                initialCells: [],
                type: 'iso',
                prefixId: `Ex${this.numeroExercice}Q${i}`,
                shapes: ['cube'],
              })
            : new VisualPattern([])
        if (pattern instanceof VisualPattern3D) {
          pattern.shapes = ['cube']
          pattern.iterate3d = (patternRiche as PatternRiche3D).iterate3d
        } else {
          pattern.shapes =
            (patternRiche as PatternRiche).shapes ||
            (shapeNames[randint(0, shapeNames.length - 1)] as ShapeName)
          pattern.iterate = (patternRiche as PatternRiche).iterate
        }

        const angle = Math.PI / 2.5
        let yMax = 0
        let yMin = 0

        const figures: NestedObjetMathalea2dArray[] = []
        for (let j = 0; j < this.sup3; j++) {
          figures[j] = []
          let objets: NestedObjetMathalea2dArray = []
          let ymin = Infinity
          let ymax = -Infinity
          let xmin = Infinity
          let xmax = -Infinity
          if (context.isHtml) {
            let nom = String(choice(Object.keys(listeShapes2DInfos)))
            for (let n = 0; n < pattern.shapes.length; n++) {
              const name = pattern.shapes[n]
              if (name in listeShapes2DInfos) {
                if (name === 'carré') {
                  ///name = nom
                  nom = name
                  pattern.shapes[n] = nom
                  figures[j].push(listeShapes2DInfos[nom].shapeDef)
                } else figures[j].push(listeShapes2DInfos[name].shapeDef)
              } else if (name === 'cube') {
                const cubeIsoDef = cubeDef(`cubeIsoQ${i}F${j}`, 1)
                cubeIsoDef.svg = function (_coeff: number): string {
                  return `
          <defs>
            <g id="cubeIsoQ${i}F${j}">
              ${faceTop(angle)}
              ${faceLeft(angle)}
              ${faceRight(angle)}
            </g>
          </defs>`
                }
                figures[j].push(cubeIsoDef)
              } else {
                throw new Error(
                  `Shape ${name} n'est pas dans listeShapesDef ou emojis et n'est pas un cube`,
                )
              }
            }
          }
          if (pattern instanceof VisualPattern3D) {
            if (pattern.shape == null) {
              pattern.shape = shapeCubeIso(`cubeIsoQ${i}F${j}`, 1, 1, {
                scale: 1,
              })
            }
            if (context.isHtml) {
              updateCubeIso({ pattern, i, j, angle })
              pattern.shape.codeSvg = `<use href="#cubeIsoQ${i}F${j}"></use>`
              const cells = (pattern as VisualPattern3D).update3DCells(j + 1)
              // Ajouter les SVG générés par svg() de chaque objet
              cells.forEach((cell) => {
                const scale = 1
                const [px, py] = project3dIso(cell[0], cell[1], cell[2], angle)
                const obj = shapeCubeIso(`cubeIsoQ${i}F${j}`, px, py, { scale })
                obj.x = px / 20
                obj.y = -py / 20
                objets.push(obj)
                ymin = Math.min(ymin, obj.y * scale)
                ymax = Math.max(ymax, (obj.y + 1) * scale)
                xmin = Math.min(xmin, obj.x * scale)
                xmax = Math.max(xmax, (obj.x + 1) * scale)
              })
            } else {
              objets = [
                cubeDef(`cubeIsoQ${i}F${j}`),
                ...pattern.render(j + 1, 0, 0, Math.PI / 6),
              ]
              ;({ xmin, ymin, xmax, ymax } = fixeBordures(objets))
            }
          } else {
            const renderResult = pattern.render(j + 1, 0, 0)
            ;({ xmin, ymin, xmax, ymax } = fixeBordures(renderResult))
            objets = renderResult
          }
          for (const shape of pattern.shapes) {
            if (shape in listeShapes2DInfos) {
              figures[j].push(listeShapes2DInfos[shape].shapeDef)
            }
          }
          figures[j].push(...objets)
          figures[j].push(
            texteParPosition(
              `Motif ${j + 1}`,
              (xmax + xmin) / 2,
              -1.5,
              0,
              'black',
              0.8,
              'milieu',
            ),
          )
          const cadre = polygone(
            pointAbstrait(xmin - 2, -2),
            pointAbstrait(xmax + 2, -2),
            pointAbstrait(xmax + 2, ymax + 2),
            pointAbstrait(xmin - 2, ymax + 2),
          )
          cadre.pointilles = 4
          figures[j].push(cadre)

          yMax = Math.max(yMax, ymax)
          yMin = Math.min(yMin, ymin)
        }

        texte += `${texteEnCouleurEtGras(`Motif $\\mathbf{${i + 1}}$`, bleuMathalea)}${pat.difficulte === undefined ? '' : ' (' + pat.difficulte + ')'} :<br>`
        if (this.sup !== 5)
          texte += `Pour le motif $43$, il y a $${texNombre(n43)}$ ${nom}.<br>`
        else {
          const estTresGrand = n43.sub(100000).isPositive()
          texte += estTresGrand
            ? `Pour le motif $43$, il y a beaucoup trop d'éléments dans le ratio "${texRatio}".<br>`
            : `Pour le motif $43$, il y a $${texNombre(n43)}$ éléments dans le ratio "${texRatio}" de $${ratio43}$.<br>`
        }
        texte +=
          this.sup !== 5
            ? `Pour le motif $${unDePlus}$, il y a $${texNombre(nUnDePlus)}$ ${nom}.<br>`
            : `Pour le motif $${unDePlus}$, il y a $${texNombre(nUnDePlus)}$ éléments dans le ratio "${texRatio}" de $${ratioUnDePlus}$.<br>`

        const texRatioCouleur = (pat.formuleRatio ?? '')
          .split(' : ')
          .map((v) => miseEnEvidence(v, bleuMathalea))
          .join(' : ')

        texte +=
          this.sup !== 5
            ? `Pour le motif $${miseEnEvidence('n', bleuMathalea)}$, il y a $${miseEnEvidence(pat.formule, bleuMathalea)}$ éléments.<br>`
            : `Pour le motif $${miseEnEvidence('n', bleuMathalea)}$, le ratio "${texRatio}" est de $${texRatioCouleur}$.<br>`

        texte +=
          figures
            .map((fig, index) =>
              mathalea2d(
                Object.assign(
                  fixeBordures(fig, {
                    rxmin: 0,
                    rymin: -1,
                    rxmax: 0,
                    rymax: 1,
                  }),
                  {
                    id: `Motif${i}F${index}`,
                    pixelsParCm: 20,
                    yMax,
                    yMin,
                    scale: 0.5,
                    display: 'inline-block' as const,
                    optionsTikz: 'transform shape',
                  },
                ),
                fig,
              ),
            )
            .join('\n') + '<br>'
      }
    }
    this.listeQuestions = [texte]
  }
}
