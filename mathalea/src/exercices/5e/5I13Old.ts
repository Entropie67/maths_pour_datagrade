import {
  cubeDef,
  project3dIso,
  shapeCubeIso,
  updateCubeIso,
} from '../../lib/2d/figures2d/Shape3d'
import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
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
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import {
  compteOccurences,
  enleveDoublonNum,
  remplaceDansTableau,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = "Identifier la structure d'un motif (itératif)"
export const interactifReady = true

export const dateDeModifImportante = '22/11/2025'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif suivant.
 * Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote (modif par Éric Elter au niveau des paramètres notamment)
 */
export const uuid = 'f8b5e'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class PatternIteratifOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.comment = ` Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.<br>
 Cet exercice contient des patterns issus de l'excellent site : <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br>
 Cet exercice propose d'étudier les premiers termes d'une série de motifs afin de répondre à différentes questions possibles.<br>
Grâce au premier paramètre, on peut choisir le nombre de motifs visibles.<br>
Grâce au deuxième paramètre, on peut choisir les questions à poser.<br>
Grâce au troisième paramètre, on peut imposer des patterns choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=3" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des patterns choisis au hasard.
    `
    this.besoinFormulaireNumerique = [
      'Nombre de figures par question',
      3,
      'Deux figures\nTrois Figures\nQuatre Figures',
    ]
    this.sup = 2

    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Motif suivant à dessiner',
        '2 : Motif suivant (nombre)',
        '3 : Motif 10 (nombre)',
        '4 : Numéro du motif',
        '5 : Motif 100 (nombre)',
        '6 : Une question au hasard parmi les 5 précédentes',
        '7 : Ensemble des 5 premières propositions',
      ].join('\n'),
    ]
    this.sup2 = '7'

    const nbDePattern = listePatternsSansRatioNiFraction.length
    this.besoinFormulaire3Texte = [
      'Numéros des pattern désirés :',
      [
        'Nombres séparés par des tirets :',
        `Mettre des nombres entre 1 et ${nbDePattern}.`,
        `Mettre 0 pour laisser le hasard faire.`,
      ].join('\n'),
    ]

    this.sup3 = `0`
    this.listePackages = ['twemojis'] // this.listePackages est inutile mais la présence du mot "twemojis" est indispensable pour la sortie LaTeX.
  }

  nouvelleVersion(): void {
    // on ne conserve que les linéaires et les affines sans ratio, ni fraction, ni multiple shape
    const nbFigures = contraindreValeur(2, 4, this.sup + 1, 4)

    let typesQuestionsInitiales = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 6,
      defaut: 1,
      melange: 7,
      nbQuestions: 5,
      shuffle: false,
    }).map(Number)
    typesQuestionsInitiales = enleveDoublonNum(typesQuestionsInitiales)
    if (typesQuestionsInitiales.length === 6)
      typesQuestionsInitiales = range1(5)

    const nbDePattern = listePatternsSansRatioNiFraction.length
    let typesPattern = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: nbDePattern,
      defaut: 0,
      melange: 0,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    typesPattern = [...typesPattern, ...shuffle(range1(nbDePattern))]
    typesPattern = enleveDoublonNum(typesPattern)

    let typesQuestions
    let indexInteractif = 0
    const listePreDef = typesPattern.map(
      (i) => listePatternsSansRatioNiFraction[i - 1],
    )

    for (
      let i = 0, cpt = 0;
      i < Math.min(nbDePattern, this.nbQuestions) && cpt < 50;
    ) {
      if (compteOccurences(typesQuestionsInitiales, 6) > 0) {
        typesQuestions = remplaceDansTableau(
          typesQuestionsInitiales,
          6,
          randint(1, 5, typesQuestionsInitiales),
        )
        typesQuestions = enleveDoublonNum(typesQuestions)
      } else typesQuestions = typesQuestionsInitiales

      const objetsCorr: NestedObjetMathalea2dArray = []
      const pat = listePreDef[i]
      const delta = pat.fonctionNb(2) - pat.fonctionNb(1)
      const b = pat.fonctionNb(1) - delta
      const explain =
        pat.type === 'linéaire'
          ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape $1$. Par conséquent, pour trouver le nombre de formes d'un motif il faut simplement multiplier par $${delta}$ le numéro du motif.`
          : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas $${delta}$ formes sur le motif $1$, mais $${pat.fonctionNb(1)}$. Par conséquent, il faut multiplier le numéro du motif par $${delta}$ et ${b < 0 ? `retirer $${-b}$` : `ajouter $${b}$`}.`
      const pattern =
        'iterate3d' in pat
          ? new VisualPattern3D({
              initialCells: [],
              type: 'iso',
              shapes: pat.shapes,
              prefixId: `Ex${this.numeroExercice}Q${i}`,
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
        for (const shape of pattern.shapes) {
          if (shape in listeShapes2DInfos) {
            objetsCorr.push(listeShapes2DInfos[shape].shapeDef)
          } else {
            throw new Error(
              `Shape ${shape} not found in listeShapes2DInfos or emojis.`,
            )
          }
        }
      }

      const rendered = pattern.render(nbFigures + 1, 0, 0, Math.PI / 6)
      objetsCorr.push(...rendered)
      let yMax = 0
      let yMin = 0
      const angle = Math.PI / 6
      let texte = `Voici les $${nbFigures}$ premiers motifs d'une série de motifs figuratifs. Ils évoluent selon des règles définies.<br>`
      const figures: NestedObjetMathalea2dArray[] = []
      for (let j = 0; j < nbFigures; j++) {
        figures[j] = []
        if ('iterate3d' in pattern) {
          figures[j].push(cubeDef(`cubeIsoQ${i}F${j}`))
        } else {
          for (const shape of pattern.shapes) {
            if (shape in listeShapes2DInfos) {
              figures[j].push(listeShapes2DInfos[shape].shapeDef)
            } else {
              throw new Error(
                `Shape ${shape} not found in listeShapes2DInfos or emojis.`,
              )
            }
          }
        }

        let xmin = Infinity
        let ymin = Infinity
        let xmax = -Infinity
        let ymax = -Infinity
        if ('iterate3d' in pattern) {
          if (pattern.shape == null) {
            pattern.shape = shapeCubeIso(`cubeIsoQ${i}F${j}`, 0, 0, {
              fillStyle: '#ffffff',
              strokeStyle: '#000000',
              lineWidth: 1,
              opacite: 1,
              scale: 1,
            })
          }
          if (context.isHtml) {
            updateCubeIso({ pattern, i, j, angle })
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
      const listeQuestions: string[] = []
      const listeCorrections: string[] = []
      const infosShape =
        pattern.shapes[0] in listeShapes2DInfos
          ? listeShapes2DInfos[pattern.shapes[0]]
          : { articleCourt: 'de ', nomPluriel: 'cubes' }
      const deMotif = `${infosShape.articleCourt}${infosShape.nomPluriel}`

      for (const q of typesQuestions) {
        switch (q) {
          case 1:
            listeQuestions.push(`\nDessiner le motif $${nbFigures + 1}$.<br>`)
            listeCorrections.push(`Voici le motif $${nbFigures + 1}$ :<br>
              ${mathalea2d(Object.assign(fixeBordures(objetsCorr, { rxmin: 0, rymin: -1, rxmax: 0, rymax: 1 }), { scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr)}`)
            break
          case 2:
            {
              const nbFormes = pat.fonctionNb(nbFigures + 1)
              const nbTex = texNombre(nbFormes, 0)

              listeQuestions.push(
                `\nQuel sera le nombre ${deMotif} dans le motif $${nbFigures + 1}$ ?<br>${ajouteQuestionMathlive(
                  {
                    exercice: this,
                    question: indexInteractif++,
                    reponseParams: { formatInteractif: 'mathalea-mathfield' },
                    objetReponse: { reponse: { value: nbTex } },
                    typeInteractivite: 'mathlive',
                  },
                )}`,
              )
              listeCorrections.push(`Le motif $${nbFigures + 1}$ contient $${miseEnEvidence(texNombre(nbFormes, 0))}$ ${infosShape.nomPluriel}.<br>
          ${!typesQuestions.includes(1) ? mathalea2d(Object.assign(fixeBordures(objetsCorr, { rxmin: -1, rymin: 0, rxmax: 0, rymax: 1 }), { scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr) : ''}`)
            }
            break
          case 3:
            {
              const nbFormes = pat.fonctionNb(10)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nQuel sera le nombre ${deMotif} pour le motif $10$ ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: nbTex } },
                  typeInteractivite: 'mathlive',
                },
              )}
            `)
              listeCorrections.push(`Le motif $10$ contient $${miseEnEvidence(nbTex)}$ ${infosShape.nomPluriel}.<br>
            En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(pat.formule.replaceAll('n', '10'), bleuMathalea)}$.<br>
            ${explain}`)
            }
            break
          case 4:
            {
              const etape = randint(20, 80)
              const nbFormes = pat.fonctionNb(etape)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nUn motif de cette série contient $${nbTex}$ ${infosShape.nomPluriel}. À quel numéro de motif cela correspond-il ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: etape.toString() } },
                  typeInteractivite: 'mathlive',
                },
              )}
            `)

              const explain2 =
                pat.type === 'linéaire'
                  ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape $1$. Par conséquent, pour trouver le numéro d'un motif dont on connait le nombre de formes, il faut simplement diviser ce nombre par $${delta}$ pour trouver le numéro.`
                  : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas $${delta}$ formes sur le motif $1$, mais $${pat.fonctionNb(1)}$. Par conséquent, il faut ${b < 0 ? `ajouter $${-b}$` : `retirer $${b}$`} au nombre de formes puis diviser le résultat par $${delta}$ : <br>
        $\\dfrac{${nbTex} ${b < 0 ? '+' : '-'} ${Math.abs(b)}}{${delta}}=${miseEnEvidence(etape)}$.`
              listeCorrections.push(`C'est le motif numéro $${miseEnEvidence(etape.toString())}$ qui contient $${miseEnEvidence(texNombre(nbFormes, 0), bleuMathalea)}$ ${infosShape.nomPluriel}.<br>
            ${explain2}`)
            }
            break
          case 5:
            {
              const nbFormes = pat.fonctionNb(100)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nQuel sera le nombre ${deMotif} pour le motif $100$ ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: nbTex } },
                  typeInteractivite: 'mathlive',
                },
              )}
            `)
              listeCorrections.push(`Le motif $100$ contient $${miseEnEvidence(nbTex)}$ formes ${deMotif}.<br>
            En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(pat.formule.replaceAll('n', '100'), bleuMathalea)}$.<br>
            ${explain}`)
            }
            break
        }
      }
      texte +=
        listeQuestions.length === 1
          ? '<br>' + listeQuestions[0]
          : createList({
              items: listeQuestions,
              style: 'alpha',
            })
      texteCorr +=
        listeCorrections.length === 1
          ? '<br>' + listeCorrections[0]
          : createList({
              items: listeCorrections,
              style: 'alpha',
            })
      if (this.questionJamaisPosee(i, typesQuestions.join(''), pat.numero)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
        cpt++
      }
    }
  }
}
