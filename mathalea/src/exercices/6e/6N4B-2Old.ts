import { cubeDef, Shape3D, shapeCubeIso } from '../../lib/2d/figures2d/Shape3d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { listePattern3d } from '../../lib/2d/patterns/patternsPreDef'
import { VisualPattern3D } from '../../lib/2d/patterns/VisualPattern3D'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range, range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comprendre un algorithme itératif sur des élements en 3D'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '10/06/2025'
export const dateDeModifImportante = '30/12/2025' // Ajout de patterns affines et linéaires
export const patternsFor6N4B_2 = listePattern3d.filter(
  (p) => p.type === 'affine' || p.type === 'linéaire',
) // On enlève les patterns quadratiques pour cet exercice

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes ${['e','a','é','i','o','u','y','è','ê'].includes(pattern.shapes[0][0]) ? 'd\'':'de'}${pattern.shapes[0]} du motif suivant.
 * Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '328b7'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class PaternNum06emeOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.comment = `Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif suivant.\n
 Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.\n
 Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/.\n
 Grâce au dernier paramètre, on peut imposer des patterns choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=2" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des patterns choisis au hasard.
`
    this.besoinFormulaireNumerique = ['Nombre de figures par question', 4]
    this.sup = 3
    this.besoinFormulaire4Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1: Motif suivant à dessiner\n2 : Motif suivant (nombre)\n3 : Motif 10 (nombre)\n4 : Numéro du motif\n5 : Motif 100 (nombre)\n6 : Question au hasard parmi les 5 précédentes',
    ]
    this.sup4 = '6'
    const nbDePattern = patternsFor6N4B_2.length
    this.besoinFormulaire5Texte = [
      'Numéros des pattern désirés :',
      [
        'Nombres séparés par des tirets  :',
        `Mettre des nombres entre 1 et ${nbDePattern}.`,
        `Mettre ${nbDePattern + 1} pour laisser le hasard faire.`,
      ].join('\n'),
    ]
    this.sup5 = `${nbDePattern + 1}`
  }

  nouvelleVersion(): void {
    const nbDePattern = patternsFor6N4B_2.length
    let typesPattern = gestionnaireFormulaireTexte({
      saisie: this.sup5,
      max: nbDePattern,
      defaut: nbDePattern + 1,
      melange: nbDePattern + 1,
      nbQuestions: Math.min(this.nbQuestions, nbDePattern),
    }).map(Number)

    typesPattern = [...typesPattern, ...shuffle(range1(nbDePattern))]
    typesPattern = enleveDoublonNum(typesPattern)
    typesPattern = typesPattern.slice(0, 25)
    typesPattern = typesPattern.reverse()

    const listePreDef = typesPattern.map((i) => patternsFor6N4B_2[i - 1])
    const nbFigures = Math.max(1, this.sup)
    const typesQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup4,
          min: 1,
          max: 5,
          defaut: 1,
          melange: 6,
          nbQuestions: 4,
          shuffle: false,
        }).map(Number),
      ),
    )
    let indexInteractif = 0
    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, nbDePattern) && cpt < 50;
    ) {
      const canvas3d: string[] = []
      const popped = listePreDef.pop()
      if (!popped) {
        continue
      }

      const delta = popped.fonctionNb(2) - popped.fonctionNb(1)
      const b = popped.fonctionNb(1) - delta
      const explain =
        popped.type === 'linéaire'
          ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1. Par conséquent, pour trouver le nombre de formes d'un motif il faut simplement multiplier par ${delta} le numéro du motif.`
          : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${popped.fonctionNb(1)}. Par conséquent, il faut multiplier le numéro du motif par ${delta} et ${b < 0 ? `retirer ${-b}` : `ajouter ${b}`}.`
      const pattern = new VisualPattern3D({
        initialCells: [],
        prefixId: '',
        shapes: ['cube-trois-couleurs'],
        type: 'full3D',
      })
      pattern.shapes = [
        ...(popped.shapes ?? ['cube-trois-couleurs-tube-edges']),
      ].slice(0, 11) as unknown as typeof pattern.shapes
      pattern.shape = shapeCubeIso(`cubeIsoQ${i}F0`) as Shape3D
      pattern.iterate3d = popped.iterate3d

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
      const deMotif = 'de cubes'
      for (const q of typesQuestions) {
        switch (q) {
          case 1:
            listeQuestions.push(`\nDessiner le motif $${nbFigures + 1}$.<br>`)
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
            break
          case 2:
            {
              const nbFormes = popped.fonctionNb(nbFigures + 1)
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
              listeCorrections.push(
                `Le motif $${nbFigures + 1}$ contient $${miseEnEvidence(texNombre(nbFormes, 0))}$ formes ${deMotif}.<br>`,
              )
            }
            break
          case 3:
            {
              const nbFormes = popped.fonctionNb(10)
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
              listeCorrections.push(`Le motif $10$ contient $${miseEnEvidence(nbTex)}$ formes ${deMotif}.<br>
            En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(popped.formule.replaceAll('n', '10'), bleuMathalea)}$.<br>
            ${explain}`)
            }
            break
          case 4:
            {
              const etape = randint(20, 80)
              const nbFormes = popped.fonctionNb(etape)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nUn motif de cette série contient $${nbTex}$ ${deMotif.replace('de ', '')}. À quel numéro de motif cela correspond-il ?<br>${ajouteQuestionMathlive(
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
                popped.type === 'linéaire'
                  ? `On constate que le nombre de formes  augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1. Par conséquent, pour trouver le numéro d'un motif dont on connait le nombre de formes, il faut simplement diviser ce nombre par ${delta} pour trouver le numéro.`
                  : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${popped.fonctionNb(1)}. Par conséquent, il faut ${b < 0 ? `ajouter ${-b}` : `retirer ${b}`} au nombre de formes puis diviser le résultat par ${delta} : <br>
        $\\dfrac{${nbTex} ${b < 0 ? '+' : '-'} ${Math.abs(b)}}{${delta}}=${miseEnEvidence(etape)}$.`
              listeCorrections.push(`C'est le motif numéro $${miseEnEvidence(etape.toString())}$ qui contient $${miseEnEvidence(texNombre(nbFormes, 0), bleuMathalea)}$ ${pattern.shapes[0]}s.<br>
            ${explain2}`)
            }
            break
          case 5:
            {
              const nbFormes = popped.fonctionNb(100)
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
            En effet, la formule pour trouver le nombre ${deMotif} est : $${miseEnEvidence(popped.formule.replaceAll('n', '100'), bleuMathalea)}$.<br>
            ${explain}`)
            }
            break
        }
      }
      texte +=
        listeQuestions.length === 1
          ? listeQuestions[0]
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
      if (this.questionJamaisPosee(i, typesQuestions.join(''), popped.numero)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
