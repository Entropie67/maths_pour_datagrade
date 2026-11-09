import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  listePatternRatio,
  type PatternRiche,
} from '../../lib/2d/patterns/patternsPreDef'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPosition } from '../../lib/2d/textes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
// import type { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { gestionnaireFormulaireTexte } from '../../modules/outils'

export const titre = "Trouver le ratio d'évolution d'un motif numérique"
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '26/06/2025'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif de rang n sous forme de ratio.
 * Les patterns sont des motifs numériques qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '328b8'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class PaternRatioOldOldOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.comment =
      "Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/"
    this.comment += `<br>
Grâce au dernier paramètre, on peut imposer des patterns choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=5" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des patterns choisis au hasard.`
    this.besoinFormulaireNumerique = ['Nombre de figures par question', 4]
    this.sup = 3
    const nbDePattern = listePatternRatio.length
    this.besoinFormulaire2Texte = [
      'Numéros des pattern désirés :',
      [
        'Nombres séparés par des tirets  :',
        `Mettre des nombres entre 1 et ${nbDePattern}.`,
        `Mettre ${nbDePattern + 1} pour laisser le hasard faire.`,
      ].join('\n'),
    ]

    this.sup2 = `${nbDePattern + 1}`
  }

  nouvelleVersion(): void {
    /* const listePat: PatternRiche[] = shuffle(
      listePatternRatio,
    ) as PatternRiche[]
    */
    const nbFigures = Math.max(2, this.sup)

    const nbDePattern = listePatternRatio.length
    let typesPattern = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: nbDePattern,
      defaut: nbDePattern + 1,
      melange: nbDePattern + 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    typesPattern = [...typesPattern, ...shuffle(range1(nbDePattern))]
    typesPattern = enleveDoublonNum(typesPattern)
    typesPattern = typesPattern.reverse()

    const listePreDef = typesPattern.map((i) => listePatternRatio[i - 1])

    for (let i = 0; i < Math.min(this.nbQuestions, listePatternRatio.length);) {
      const objetsCorr: NestedObjetMathalea2dArray = []
      const popped = listePreDef.pop()
      if (!popped) {
        continue
      }
      const pat = popped
      const pattern = new VisualPattern([])
      pattern.iterate = (pat as PatternRiche).iterate
      pattern.shapes = pat.shapes

      //  patterns.push(pattern)

      for (const name of pat.shapes) {
        if (name in listeShapes2DInfos) {
          objetsCorr.push(listeShapes2DInfos[name].shapeDef)
        } else {
          throw new Error(
            `Le nom de la forme "${name}" n'est pas reconnu dans les formes prédéfinies.`,
          )
        }
      }
      const rendered = pattern.render(nbFigures + 1, 0, 0)
      objetsCorr.push(...rendered)
      let yMax = 0
      let yMin = 0
      let texte = `Voici les ${nbFigures} premiers motifs d'une série de motifs numériques. Les motifs se succèdent selon une règle bien définie.<br>`
      const figures: NestedObjetMathalea2dArray[] = []
      for (let j = 0; j < nbFigures; j++) {
        figures[j] = []
        for (const name of pat.shapes) {
          if (name in listeShapes2DInfos) {
            figures[j].push(listeShapes2DInfos[name].shapeDef)
          } else {
            throw new Error(
              `Le nom de la forme "${name}" n'est pas reconnu dans les formes prédéfinies.`,
            )
          }
        }

        let xmin = Infinity
        let ymin = Infinity
        let xmax = -Infinity
        let ymax = -Infinity

        figures[j].push(...pattern.render(j + 1, 0, 0))
        ;({ xmin, ymin, xmax, ymax } = fixeBordures(figures[j]))
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
          pointAbstrait(xmin - 2, ymin - 2),
          pointAbstrait(xmax + 2, ymin - 2),
          pointAbstrait(xmax + 2, ymax + 2),
          pointAbstrait(xmin - 2, ymax + 2),
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
      texte += `<br>Donner le ratio "${(pat as PatternRiche).texRatio}" dans le motif au rang $${nbFigures + 1}$ ?<br>${ajouteQuestionMathlive(
        {
          exercice: this,
          question: i,
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          objetReponse: { reponse: { value: pat.formule } },
          typeInteractivite: 'mathlive',
        },
      )}`
      if (!pat.fonctionRatio) {
        throw new Error(
          `La fonction ratio n'est pas définie pour le pattern ${JSON.stringify(pat)}`,
        )
      }
      const ratio = pat.fonctionRatio(nbFigures + 1)
      texteCorr += `Au rang $${nbFigures + 1}$, le ratio "${(pat as PatternRiche).texRatio}" sera $${miseEnEvidence(ratio.toLatex())}$.<br>`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
