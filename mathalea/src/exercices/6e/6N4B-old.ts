// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8e5d3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  cubeDef,
  project3dIso,
  Shape3D,
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
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import {
  areSameArray,
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

export const titre = "Identifier la structure d'un motif itératif"
export const interactifReady = true

export const dateDePublication = '23/07/2025'
export const dateDeModifImportante = '03/06/2026'

/**
 * Identifier la structure d'un motif (itératif)
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Éric Elter (sur les bases du 6I13 de Jean-claude Lhote)
 */
export const uuid = '8e5d3'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

export default class PatternIteratif6eOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.comment = ` Les motifs sont des motifs figuratifs qui évoluent selon des règles définies.<br>
 Cet exercice contient des motifs issus de l'excellent site : <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br>
 Cet exercice propose d'étudier les premiers termes d'une série de motifs afin de répondre à différentes questions possibles.<br>
Grâce au premier paramètre, on peut choisir le nombre de motifs visibles.<br><br>
Grâce au deuxième paramètre, on peut choisir les questions à poser.<br><br>
Grâce au troisième paramètre, on peut choisir le numéro du motif de la question 4.<br><br>
Grâce au quatrième paramètre, on peut imposer des motifs choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=1" target="_blank" style="color: blue">liste de motifs</a>.<br>
Si le nombre de motifs, dans l'exercice, est supérieur au nombre de motifs choisis, alors l'exercice sera complété par des motifs choisis au hasard. Le choix 0 sera toujours mis en dernier si d'autres choix ont été effectués.<br><br>
Grâce au cinquième paramètre, on peut imposer l'ordre des motifs choisis au quatrième paramètre (sauf pour le choix 0 qui sera toujours du hasard).
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
        "2 : Nombre d'éléments du motif suivant",
        "3 : Nombre d'éléments du motif 10",
        "4 : Nombre d'éléments du motif choisi",
        "5 : Nombre d'éléments du motif 100",
        "6 : Un nombre d'éléments au hasard parmi les 4 précédents",
        '7 : Ensemble des 5 premières propositions',
      ].join('\n'),
    ]

    this.sup2 = '7'

    this.besoinFormulaire3Numerique = [
      `Numéro du motif de la question 4 (entre 11 et ${listePatternsSansRatioNiFraction.length}, ou bien ${listePatternsSansRatioNiFraction.length + 1} pour laisser le hasard choisir)`,
      listePatternsSansRatioNiFraction.length + 1,
    ]
    this.sup3 = 0

    const maxNumPattern = listePatternsSansRatioNiFraction.length

    this.besoinFormulaire4Texte = [
      'Numéros des motifs désirés',
      [
        'Nombres séparés par des tirets  :',
        `Entre 1 et ${maxNumPattern} : pour choisir un motif particulier`,
        `0 : pour laisser le hasard faire`,
      ].join('\n'),
    ]
    this.sup4 = '0'

    this.besoinFormulaire5CaseACocher = ['Ordre aléatoire des motifs']
    this.sup5 = true

    this.listePackages = ['twemojis'] // this.listePackages est inutile mais la présence du mot "twemojis" est indispensable pour la sortie LaTeX.
  }

  nouvelleVersion(): void {
    const ordreAleatoireDesQuestions = this.sup5
    // on ne conserve que les linéaires et les affines sans ratio, ni fraction, ni multiple shape
    const listePatternReference = listePatternsSansRatioNiFraction
    const angle = Math.PI / 6

    let listePattern = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup4,
      min: 0,
      max: listePatternReference.length,
      melange: 0,
      defaut: 0,
      exclus: [0],
      shuffle: ordreAleatoireDesQuestions,
    }).map(Number)

    listePattern = [
      ...listePattern,
      ...shuffle(range1(listePatternReference.length)),
    ]

    const listePreDef = listePattern.map((i) => listePatternReference[i - 1])

    const nbFigures = contraindreValeur(2, 4, this.sup + 1, 4)

    let typesQuestionsInitiales = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 6,
      defaut: 1,
      melange: 7,
      nbQuestions: 5,
      shuffle: false,
    }).map(Number)
    typesQuestionsInitiales = enleveDoublonNum(typesQuestionsInitiales)
    if (typesQuestionsInitiales.length === 6)
      typesQuestionsInitiales = range1(5)
    let typesQuestions
    let indexInteractif = 0
    for (
      let i = 0;
      i < Math.min(listePatternReference.length, this.nbQuestions);
    ) {
      typesQuestions = typesQuestionsInitiales
      if (compteOccurences(typesQuestionsInitiales, 6) > 0) {
        if (
          typesQuestionsInitiales.length === 5 &&
          typesQuestionsInitiales.includes(1)
        )
          typesQuestionsInitiales = range1(5)
        else if (typesQuestionsInitiales.length < 5) {
          typesQuestions = remplaceDansTableau(
            typesQuestionsInitiales,
            6,
            randint(2, 5, typesQuestionsInitiales),
          )
          typesQuestions = enleveDoublonNum(typesQuestions)
        }
      }

      const objetsCorr: NestedObjetMathalea2dArray = []
      const pat = listePreDef[i]
      const pattern =
        'iterate3d' in pat
          ? new VisualPattern3D({
              initialCells: [],
              type: 'iso',
              prefixId: `Ex${this.numeroExercice}Q${i}`,
              shapes: ['cube'],
            })
          : new VisualPattern([])
      if ('iterate3d' in pattern) {
        let xminCorr = Infinity
        let yminCorr = Infinity
        let xmaxCorr = -Infinity
        let ymaxCorr = -Infinity
        pattern.shape = shapeCubeIso(`cubeIsoQ${i}F0`) as Shape3D
        pattern.iterate3d = (pat as PatternRiche3D).iterate3d

        const figureCorr: NestedObjetMathalea2dArray = []
        if (context.isHtml) {
          pattern.shape.codeSvg = `<use href="#cubeIsoQ${i}F0"></use>`
          const cells = (pattern as VisualPattern3D).update3DCells(
            nbFigures + 1,
          )
          // Ajouter les SVG générés par svg() de chaque objet
          cells.forEach((cell) => {
            const [px, py] = project3dIso(cell[0], cell[1], cell[2], angle)
            const obj = shapeCubeIso(`cubeIsoQ${i}F0`, px, py)
            figureCorr.push(obj)
            yminCorr = Math.min(yminCorr, -py / 20)
            ymaxCorr = Math.max(ymaxCorr, -py / 20)
            xminCorr = Math.min(xminCorr, px / 20)
            xmaxCorr = Math.max(xmaxCorr, px / 20)
          })
        } else {
          figureCorr.push(
            (pattern as VisualPattern3D).render(nbFigures + 1, 0, 0, angle),
          )
        }
        objetsCorr.push(cubeDef(`cubeIsoQ${i}F0`))
        objetsCorr.push(...figureCorr)
        // On ajoute un cadre en Html à cause de la bordure car les éléments sont tous clonés à partir du même modèle centré à l'origine et en utilsant des href.
        if (context.isHtml) {
          const cadre = polygone(
            pointAbstrait(xminCorr - 1, yminCorr - 2),
            pointAbstrait(xmaxCorr + 2, yminCorr - 2),
            pointAbstrait(xmaxCorr + 2, ymaxCorr + 2),
            pointAbstrait(xminCorr - 1, ymaxCorr + 2),
          )
          objetsCorr.push(cadre)
        }
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
        const rendered = pattern.render(nbFigures + 1, 0, 0)
        objetsCorr.push(...rendered)
      }

      let yMax = 0
      let yMin = 0

      let texte = `Voici les ${nbFigures} premiers motifs d'une série de motifs figuratifs. Ils évoluent selon des règles définies.<br>`
      const figures: NestedObjetMathalea2dArray[] = []
      for (let j = 0; j < nbFigures; j++) {
        figures[j] = []
        if (pattern instanceof VisualPattern3D) {
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
          pattern.shape = shapeCubeIso('cubeIso')
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

      let complementCorrection = true
      const delta = pat.fonctionNb(2) - pat.fonctionNb(1)
      const b = pat.fonctionNb(1) - delta
      const explain = `On constate que le nombre ${infosShape.articleCourt} ${infosShape.nomPluriel} augmente de $${delta}$ à chaque étape.<br>
      ${
        b === 0
          ? `Au départ, il y a $${pat.fonctionNb(1)}$ ${pattern.shapes[0]}s sur le motif $1$ et $${delta * 2}$ ${pattern.shapes[0]}s sur le motif $2$. Donc le nombre de ${infosShape.nomPluriel} correspond à $${delta}$ fois le numéro du motif.<br>`
          : `Cependant, il n'y a pas ${delta} ${pattern.shapes[0]}s sur le motif 1, mais ${pat.fonctionNb(1)}. Par conséquent, il faut multiplier le numéro du motif par ${delta} et ${b < 0 ? `retirer ${-b}` : `ajouter ${b}`}.<br>`
      }`

      const colonne1TabCorrection = []
      const colonne2TabCorrection = []
      for (let indice = 1; indice < nbFigures + 1; indice++) {
        colonne1TabCorrection.push(indice.toString())
        colonne2TabCorrection.push(
          pat.fonctionNb(indice) +
            '=' +
            pat.formule.replaceAll('n', miseEnEvidence(indice, bleuMathalea)),
        )
      }

      for (const q of typesQuestions) {
        let numeroMotif = 0
        switch (q) {
          case 1:
            listeQuestions.push(`\nDessiner le motif $${nbFigures + 1}$.`)
            listeCorrections.push(`Voici le motif $${nbFigures + 1}$ :<br>
              ${mathalea2d(Object.assign(fixeBordures(objetsCorr, { rxmin: 0, rymin: -1, rxmax: 0, rymax: 1 }), { scale: 0.4, optionsTikz: 'transform shape' }), objetsCorr)}`)
            break
          case 2:
            numeroMotif = nbFigures + 1
            break
          case 3:
            numeroMotif = 10
            break
          case 4:
            this.sup3 = contraindreValeur(
              1,
              listePatternsSansRatioNiFraction.length + 1,
              this.sup3,
              randint(11, 99),
            )
            numeroMotif =
              this.sup3 === listePatternsSansRatioNiFraction.length + 1 ||
              this.sup3 < 11
                ? randint(11, listePatternsSansRatioNiFraction.length + 1)
                : this.sup3
            break
          case 5:
            numeroMotif = 100
            break
        }

        if (q !== 1) {
          const nbFormes = pat.fonctionNb(numeroMotif)
          const nbTex = texNombre(nbFormes, 0)

          listeQuestions.push(
            `\nQuel sera le nombre ${infosShape.articleCourt} ${infosShape.nomPluriel} dans le motif $${numeroMotif}$ ?${ajouteQuestionMathlive(
              {
                exercice: this,
                question: indexInteractif++,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: { reponse: { value: nbTex } },
                typeInteractivite: 'mathlive',
              },
            )}`,
          )
          listeCorrections.push(
            (complementCorrection ? explain : '') +
              `Une formule pour trouver le nombre ${infosShape.articleCourt} ${infosShape.nomPluriel} est donc : $${pat.formule.replaceAll('n', miseEnEvidence(`${numeroMotif}`, bleuMathalea))}=${miseEnEvidence(texNombre(nbFormes))}$.<br>
              Le motif $${numeroMotif}$ contient $${miseEnEvidence(texNombre(nbFormes, 0))}$ ${infosShape.nomPluriel}.`,
          )
          if (complementCorrection) complementCorrection = false

          if (q > 2) {
            colonne1TabCorrection.push('\\ldots')
            colonne2TabCorrection.push('')
          }
          colonne1TabCorrection.push(
            miseEnEvidence(numeroMotif.toString(), 'black'),
          )
          colonne2TabCorrection.push(
            pat.formule.replaceAll(
              'n',
              miseEnEvidence(numeroMotif, bleuMathalea),
            ) +
              '=' +
              miseEnEvidence(pat.fonctionNb(numeroMotif)),
          )
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
          ? listeCorrections[0]
          : createList({
              items: listeCorrections,
              style: 'alpha',
            })

      if (!areSameArray(typesQuestions, [1])) {
        texteCorr +=
          '<br><br>Les informations recherchées sont résumées dans ce tableau.<br><br>' +
          tableauColonneLigne(
            [
              '\\text{Numéro du motif}',
              `\\text{Nombre ${infosShape.articleCourt} ${infosShape.nomPluriel}}`,
            ],
            colonne1TabCorrection,
            colonne2TabCorrection,
          )
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
