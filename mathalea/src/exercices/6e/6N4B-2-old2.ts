// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 46923 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { cubeDef, Shape3D, shapeCubeIso } from '../../lib/2d/figures2d/Shape3d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { listePattern3d } from '../../lib/2d/patterns/patternsPreDef'
import { VisualPattern3D } from '../../lib/2d/patterns/VisualPattern3D'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import {
  CubeStackEditorElement,
  type CubeStackState,
} from '../../lib/customElements/CubeStackEditorElement'
import {
  MathaleaCouteauSuisseElement,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import { MathaleaMathfieldElement } from '../../lib/customElements/MathaleaMathfield'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range, range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comprendre un algorithme itératif sur des motifs en 3D'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '10/06/2025'
export const dateDeModifImportante = '19/09/2026'
export const patternsFor6N4B_2 = listePattern3d.filter(
  (p) => p.type === 'affine' || p.type === 'linéaire',
) // On enlève les patterns quadratiques pour cet exercice

function cubeStackStateFromPattern(
  pattern: VisualPattern3D,
  step: number,
): CubeStackState {
  const cubes = Array.from(pattern.iterate3d(step), (cell) => {
    const [x, y, z] = VisualPattern3D.keyToCoord(cell)
    return { x, y: z, z: -y, color: '#ffffff' }
  })
  const horizontalCoordinates = cubes.flatMap((cube) => [cube.x, cube.z])
  const span =
    horizontalCoordinates.length === 0
      ? 0
      : Math.max(...horizontalCoordinates) -
        Math.min(...horizontalCoordinates) +
        1

  return {
    version: 1,
    grid: Math.max(12, span + 4),
    cubes,
  }
}

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes ${['e','a','é','i','o','u','y','è','ê'].includes(pattern.shapes[0][0]) ? 'd\'':'de'}${pattern.shapes[0]} du motif suivant.
 * Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '46923'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class PaternNum06emeOld2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.comment = `Les motifs sont des motifs figuratifs qui évoluent selon des règles définies.<br>
 Cet exercice contient des motifs issus de l'excellent site : <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br>
 Cet exercice propose d'étudier les premiers termes d'une série de motifs afin de répondre à différentes questions possibles.<br><br>
Grâce au premier paramètre, on peut choisir le nombre de motifs visibles.<br><br>
Grâce au deuxième paramètre, on peut choisir les questions à poser.<br><br>
Grâce au troisième paramètre, on peut imposer des motifs choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=1" target="_blank" style="color: blue">liste de motifs</a>.<br>
Si le nombre de motifs, dans l'exercice, est supérieur au nombre de motifs choisis, alors l'exercice sera complété par des motifs choisis au hasard. Le choix 0 sera toujours mis en dernier si d'autres choix ont été effectués.<br><br>
Grâce au quatrième paramètre, on peut imposer l'ordre des motifs choisis au quatrième paramètre (sauf pour le choix 0 qui sera toujours du hasard).
`
    this.besoinFormulaireNumerique = [
      'Nombre de figures par question',
      3,
      'Deux figures\nTrois Figures\nQuatre Figures',
    ]

    this.sup = 3

    this.besoinFormulaire3Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Motif suivant à dessiner',
        "2 : Nombre d'éléments du motif suivant",
        "3 : Nombre d'éléments du motif 10",
        "4 : Nombre d'éléments du motif 100",
        '5 : Numéro du motif à trouver',
        '6 : Ensemble des 5 premières propositions',
      ].join('\n'),
    ]
    this.sup3 = '6'

    const nbDePattern = patternsFor6N4B_2.length

    this.besoinFormulaire4Texte = [
      'Numéros des motifs désirés',
      [
        'Nombres séparés par des tirets  :',
        `Entre 1 et ${nbDePattern} : pour choisir un motif particulier`,
        `0 : pour laisser le hasard faire`,
      ].join('\n'),
    ]
    this.sup4 = `0`

    this.besoinFormulaire5CaseACocher = ['Ordre aléatoire des motifs']
    this.sup5 = true
  }

  nouvelleVersion(): void {
    const ordreAleatoireDesQuestions = this.sup5

    const nbDePattern = patternsFor6N4B_2.length
    let typesPattern = gestionnaireFormulaireTexte({
      saisie: this.sup4,
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
    // typesPattern = typesPattern.slice(0, 25)
    // typesPattern = typesPattern.reverse()

    const listePreDef = typesPattern.map((i) => patternsFor6N4B_2[i - 1])
    const nbFigures = contraindreValeur(2, 4, this.sup + 1, 4)
    const typesQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup3,
          min: 1,
          max: 5,
          defaut: 1,
          melange: 6,
          nbQuestions: 5,
          shuffle: false,
        }).map(Number),
      ),
    )
    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, nbDePattern) && cpt < 50;
    ) {
      const canvas3d: string[] = []
      /*  const popped = listePreDef.pop()
      if (!popped) {
        continue
      } */
      const pat = listePreDef[i]

      const delta = pat.fonctionNb(2) - pat.fonctionNb(1)
      const b = pat.fonctionNb(1) - delta
      const explain =
        pat.type === 'linéaire'
          ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1. Par conséquent, pour trouver le nombre de formes d'un motif il faut simplement multiplier par ${delta} le numéro du motif.`
          : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${pat.fonctionNb(1)}. Par conséquent, il faut multiplier le numéro du motif par ${delta} et ${b < 0 ? `retirer ${-b}` : `ajouter ${b}`}.`
      const pattern = new VisualPattern3D({
        initialCells: [],
        prefixId: '',
        shapes: ['cube-trois-couleurs'],
        type: 'full3D',
      })
      pattern.shapes = [
        ...(pat.shapes ?? ['cube-trois-couleurs-tube-edges']),
      ].slice(0, 11) as unknown as typeof pattern.shapes
      pattern.shape = shapeCubeIso(`cubeIsoQ${i}F0`) as Shape3D
      pattern.iterate3d = pat.iterate3d

      let texte = `Voici les ${nbFigures} premiers motifs d'une série de motifs figuratifs. Ils évoluent selon des règles définies.<br><br>`
      for (let j = 0; j < nbFigures + 1; j++) {
        pattern.prefixId = `Serie${i}F${j}`
        const c3d = pattern.render3d(j + 1)
        canvas3d.push(c3d)
      }
      const figsLatex = range(nbFigures).map((j) =>
        pattern.render(j + 1, 0, 0, Math.PI / 6),
      )
      texte += `${range(nbFigures - 1)
        .map((j) =>
          context.isHtml
            ? `<div style="display: inline-block; width: 250px; height: 250px; margin-right: 10px;">${canvas3d[j]}<h1>motif ${j + 1}</h1></div>`
            : mathalea2d(
                Object.assign(
                  { display: 'inline-block' } as const,
                  fixeBordures(figsLatex[j]),
                ),
                cubeDef(`cubeIsoQ${i}F0`),
                ...figsLatex[j],
              ),
        )
        .join('\n')}`

      let texteCorr = ''
      const listeQuestions: string[] = []
      const listeCorrections: string[] = []
      const elements: MathaleaCouteauSuisseChild[] = []
      let childQuestionIndex = i * 5
      const deMotif = 'de cubes'

      const addMathfieldQuestion = (question: string, answer: string) => {
        const questionIndex = childQuestionIndex++
        elements.push({
          formatInteractif: MathaleaMathfieldElement.elementTag,
          questionIndex,
          autoCorrection: { valeur: { reponse: { value: answer } } },
        })
        return `${question}<br>${
          this.interactif
            ? MathaleaMathfieldElement.create({
                numeroExercice: this.numeroExercice ?? 0,
                questionIndex,
                interactivityOn: true,
              })
            : ''
        }`
      }

      if (typesQuestions.includes(1)) {
        const step = nbFigures + 1
        const expectedState = cubeStackStateFromPattern(pattern, step)
        const questionIndex = childQuestionIndex++
        elements.push({
          formatInteractif: CubeStackEditorElement.elementTag,
          questionIndex,
          autoCorrection: {
            valeur: { reponse: { value: JSON.stringify(expectedState) } },
          },
        })
        listeQuestions.push(
          `\nDessiner le motif $${step}$.<br>${
            this.interactif
              ? CubeStackEditorElement.create({
                  numeroExercice: this.numeroExercice ?? 0,
                  questionIndex,
                  grid: expectedState.grid,
                  interactivityOn: true,
                })
              : ''
          }`,
        )
        canvas3d[nbFigures + 1] = pattern.render3d(nbFigures + 1)
        listeCorrections.push(`Voici le motif $${nbFigures + 1}$ :<br>
          ${
            context.isHtml
              ? `<div style="display: inline-block; width: 250px; height: 250px; margin-right: 10px;">${canvas3d[nbFigures + 1]}</div>`
              : mathalea2d(
                  Object.assign(
                    { display: 'inline-block' } as const,
                    fixeBordures(figsLatex[nbFigures]),
                  ),
                  cubeDef(`cubeIsoQ${i}F0`),
                  ...figsLatex[nbFigures],
                )
          }`)
      }

      if (typesQuestions.includes(2)) {
        const nbFormes = pat.fonctionNb(nbFigures + 1)
        const nbTex = texNombre(nbFormes, 0)
        listeQuestions.push(
          addMathfieldQuestion(
            `\nQuel sera le nombre ${deMotif} dans le motif $${nbFigures + 1}$ ?`,
            nbTex,
          ),
        )
        listeCorrections.push(
          `Le motif $${nbFigures + 1}$ contient $${miseEnEvidence(nbTex)}$ formes ${deMotif}.<br>`,
        )
      }

      if (typesQuestions.includes(3)) {
        const nbTex = texNombre(pat.fonctionNb(10), 0)
        listeQuestions.push(
          addMathfieldQuestion(
            `\nQuel sera le nombre ${deMotif} pour le motif $10$ ?`,
            nbTex,
          ),
        )
        listeCorrections.push(`Le motif $10$ contient $${miseEnEvidence(nbTex)}$ formes ${deMotif}.<br>
          En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(pat.formule.replaceAll('n', '10'), bleuMathalea)}$.<br>
          ${explain}`)
      }

      if (typesQuestions.includes(4)) {
        const nbTex = texNombre(pat.fonctionNb(100), 0)
        listeQuestions.push(
          addMathfieldQuestion(
            `\nQuel sera le nombre ${deMotif} pour le motif $100$ ?`,
            nbTex,
          ),
        )
        listeCorrections.push(`Le motif $100$ contient $${miseEnEvidence(nbTex)}$ formes ${deMotif}.<br>
          En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(pat.formule.replaceAll('n', '100'), bleuMathalea)}$.<br>
          ${explain}`)
      }

      if (typesQuestions.includes(5)) {
        const etape = randint(20, 80)
        const nbFormes = pat.fonctionNb(etape)
        const nbTex = texNombre(nbFormes, 0)
        listeQuestions.push(
          addMathfieldQuestion(
            `\nUn motif de cette série contient $${nbTex}$ ${deMotif.replace('de ', '')}. À quel numéro de motif cela correspond-il ?`,
            etape.toString(),
          ),
        )
        const explain2 =
          pat.type === 'linéaire'
            ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1. Par conséquent, pour trouver le numéro d'un motif dont on connait le nombre de formes, il faut simplement diviser ce nombre par ${delta} pour trouver le numéro.`
            : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${pat.fonctionNb(1)}. Par conséquent, il faut ${b < 0 ? `ajouter ${-b}` : `retirer ${b}`} au nombre de formes puis diviser le résultat par ${delta} : <br>
        $\\dfrac{${nbTex} ${b < 0 ? '+' : '-'} ${Math.abs(b)}}{${delta}}=${miseEnEvidence(etape)}$.`
        listeCorrections.push(`C'est le motif numéro $${miseEnEvidence(etape.toString())}$ qui contient $${miseEnEvidence(nbTex, bleuMathalea)}$ ${pattern.shapes[0]}s.<br>
          ${explain2}`)
      }

      const contenuInteractif =
        listeQuestions.length === 1
          ? '<br><br>' + listeQuestions[0]
          : createList({ items: listeQuestions, style: 'alpha' })
      this.autoCorrection[i] = {
        formatInteractif: MathaleaCouteauSuisseElement.elementTag,
        elements,
      }
      texte += MathaleaCouteauSuisseElement.create({
        numeroExercice: this.numeroExercice ?? 0,
        questionIndex: i,
        elements,
        contenu: contenuInteractif,
        interactivityOn: this.interactif,
      })
      texteCorr +=
        listeCorrections.length === 1
          ? listeCorrections[0]
          : createList({
              items: listeCorrections,
              style: 'alpha',
            })
      if (this.questionJamaisPosee(i, typesQuestions.join(''), pat.numero)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
