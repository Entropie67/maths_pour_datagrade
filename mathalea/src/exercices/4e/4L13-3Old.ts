import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  listePatternAffine,
  listePatternLineaire,
  listePatternsSansRatioNiFraction,
  type PatternRiche,
  type PatternRiche3D,
} from '../../lib/2d/patterns/patternsPreDef'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPosition } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  estentier,
  gestionnaireFormulaireTexte,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

import {
  cubeDef,
  project3dIso,
  shapeCubeIso,
  updateCubeIso,
} from '../../lib/2d/figures2d/Shape3d'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { VisualPattern3D } from '../../lib/2d/patterns/VisualPattern3D'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { equation1erDegre1Inconnue } from '../../lib/outils/equations'
import { arrondi, range1 } from '../../lib/outils/nombres'
import { context } from '../../modules/context'

export const titre = 'Travailler sur les motifs itératifs'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '10/06/2025'
export const dateDeModifImportante = '25/05/2026'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes ${['e','a','é','i','o','u','y','è','ê'].includes(pattern.shapes[0][0]) ? 'd\'':'de'}${pattern.shapes[0]} du motif suivant.
 * Les patterns sont des motifs figuratifs qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '8f4a4'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

export default class PaternNum04emeOld extends Exercice {
  niveau: string
  constructor() {
    super()
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.nbQuestions = 1
    this.comment = `Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif suivant.\n
 Les patterns sont des motifs figuratifs qui évoluent selon des règles définies par des fonctions linéaires ou affines.\n
 <br>Cet exercice contient des motifs issus de l'excellent site :  <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br><br>
Grâce au troisième paramètre, on peut imposer des motifs choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=6" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des motifs choisis au hasard.<br>
Les motifs linéaires ou affines correspondent aux motifs dont le motif n suit respectivement une fonction linéaire ou affine. Le choix de tels motifs prend le pas sur les autres choix.<br><br>
Grâce au quatrième paramètre, on peut choisir de résoudre la question sur le numéro de motif (Q6) par une équation ou de façon plus intuitive.<br>
La correction détaillée (ou pas) n'est utile que si on choisit une résolution par équation.`
    this.besoinFormulaireNumerique = ['Nombre de figures par question', 4]
    this.sup = 3
    this.besoinFormulaire2Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1: Motif suivant à dessiner\n2 : Motif suivant (nombre)\n3 : Motif 10 (nombre)\n4 : Motif 100 (nombre)\n5 : Motif n (nombre)\n6 : Numéro du motif\n7 : Ensemble de ces 6 questions',
    ]
    this.sup2 = '1-2-3-4-6'
    const nbDePattern = listePatternsSansRatioNiFraction.length
    this.besoinFormulaire3Texte = [
      'Numéros des motifs désirés :',
      [
        'Nombres séparés par des tirets  :',
        `Mettre des nombres entre 1 et ${nbDePattern}.`,
        `Mettre 100 pour les motifs linéaires.`,
        `Mettre 101 pour les motifs affines.`,
        `Mettre ${nbDePattern + 1} pour laisser le hasard faire.`,
      ].join('\n'),
    ]
    this.sup3 = `${nbDePattern + 1}`

    // this.besoinFormulaire4Numerique = ['Choisir un nombre pour équation', 9999] // Que pour les 3èmes
    this.sup4 = 0
    this.besoinFormulaire5CaseACocher = ['Résolution Q6 par équation']
    this.sup5 = false
    this.spacingCorr = 2
    this.niveau = '4e'
  }

  nouvelleVersion(): void {
    const resolutionIntuitive = this.niveau === '4e' && !this.sup5
    const nbDePattern = listePatternsSansRatioNiFraction.length
    const ordreAleatoireDesQuestions =
      (this.niveau === '3e' && this.sup5) ||
      (this.niveau === '4e' && this.sup3 >= nbDePattern + 1)

    let listePreDef: (PatternRiche | PatternRiche3D)[] = []

    if (String(this.sup3).includes('100')) {
      listePreDef = listePatternLineaire
      if (ordreAleatoireDesQuestions)
        listePreDef = combinaisonListes(listePreDef, this.nbQuestions)
      listePreDef = [...listePreDef, ...shuffle(listePatternAffine)]
    } else if (String(this.sup3).includes('101')) {
      listePreDef = listePatternAffine
      if (ordreAleatoireDesQuestions)
        listePreDef = combinaisonListes(listePreDef, this.nbQuestions)
      listePreDef = [...listePreDef, ...shuffle(listePatternLineaire)]
    } else {
      let typesPattern = gestionnaireFormulaireTexte({
        saisie: this.sup3,
        max: nbDePattern,
        defaut: nbDePattern + 1,
        melange: nbDePattern + 1,
        nbQuestions: this.nbQuestions,
        shuffle: ordreAleatoireDesQuestions,
      }).map(Number)

      typesPattern = [...typesPattern, ...shuffle(range1(nbDePattern))]
      typesPattern = enleveDoublonNum(typesPattern)
      typesPattern = typesPattern.slice(0, 25)
      typesPattern = typesPattern.reverse()

      listePreDef = typesPattern.map(
        (i) => listePatternsSansRatioNiFraction[i - 1],
      )
    }

    const nbFigures = Math.max(2, this.sup)
    const typesQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup2,
          max: 6,
          defaut: 7,
          melange: 7,
          nbQuestions: 6,
          shuffle: false,
        }).map(Number),
      ),
    )
    let indexInteractif = 0

    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, listePreDef.length) && cpt < 50;
    ) {
      const objetsCorr: NestedObjetMathalea2dArray = []
      const pat = listePreDef[i]
      const delta = pat.fonctionNb(2) - pat.fonctionNb(1)
      const b = pat.fonctionNb(1) - delta
      const explain =
        pat.type === 'linéaire'
          ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1. Par conséquent, pour trouver le nombre de formes d'un motif il faut simplement multiplier par ${delta} le numéro du motif.`
          : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${pat.fonctionNb(1)}. Par conséquent, il faut multiplier le numéro du motif par ${delta} et ${b < 0 ? `retirer ${-b}` : `ajouter ${b}`}.`
      const pattern =
        'iterate3d' in pat
          ? new VisualPattern3D({
              initialCells: [],
              type: 'iso',
              prefixId: `Ex${this.numeroExercice}Q${i}`,
              shapes: ['cube'],
            })
          : new VisualPattern([])

      const figureCorr = []
      let xmin = Infinity
      let ymin = Infinity
      let xmax = -Infinity
      let ymax = -Infinity
      if (pattern instanceof VisualPattern3D) {
        pattern.shape = shapeCubeIso()
        pattern.iterate3d = (pat as PatternRiche3D).iterate3d
        objetsCorr.push(cubeDef(`cubeIsoQ${i}F${nbFigures}`))

        const angle = Math.PI / 6
        if (context.isHtml) {
          updateCubeIso({
            pattern,
            i,
            j: nbFigures,
            angle,
            inCorrectionMode: true,
          })
          pattern.shape.codeSvg = `<use href="#cubeIsoQ${i}F${nbFigures}"></use>`
          // Ajouter les SVG générés par svg() de chaque objet
          const cells = (pattern as VisualPattern3D).update3DCells(nbFigures)
          cells.forEach((cell) => {
            const [px, py] = project3dIso(cell[0], cell[1], cell[2], angle)
            const obj = shapeCubeIso(`cubeIsoQ${i}F${nbFigures}`, px, py)
            figureCorr.push(obj)
            ymin = Math.min(ymin, -py / 20)
            ymax = Math.max(ymax, -py / 20)
            xmin = Math.min(xmin, px / 20)
            xmax = Math.max(xmax, px / 20)
          })
          xmin -= 5
          xmax += 5
          ymin -= 5
          ymax += 5
        } else {
          figureCorr.push(
            ...(pattern as VisualPattern3D).render(
              nbFigures,
              0,
              0,
              Math.PI / 6,
            ),
          )
          ;({ xmin, ymin, xmax, ymax } = fixeBordures(figureCorr))
        }
        objetsCorr.push(...figureCorr)
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
        objetsCorr.push(...pattern.render(nbFigures + 1, 0, 0))
        ;({ xmin, ymin, xmax, ymax } = fixeBordures(objetsCorr))
      }
      const xminCorr = xmin
      const xmaxCorr = xmax
      const yminCorr = ymin
      const ymaxCorr = ymax

      let yMax = 0
      let yMin = 0
      const angle = Math.PI / 6
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
        if (pattern instanceof VisualPattern3D) {
          if (context.isHtml) {
            updateCubeIso({
              pattern,
              i,
              j,
              angle,
              inCorrectionMode: false,
            })
            if (pattern.shape)
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
      texte += '<br><br>'
      let texteCorr = ''
      const listeQuestions: string[] = []
      const listeCorrections: string[] = []
      const infosShape =
        pattern.shapes[0] in listeShapes2DInfos
          ? listeShapes2DInfos[pattern.shapes[0]]
          : { articleCourt: 'de ', nomPluriel: 'cubes' }
      for (const q of typesQuestions) {
        switch (q) {
          case 1:
            listeQuestions.push(`\nDessiner le motif $${nbFigures + 1}$.<br>`)
            listeCorrections.push(`Voici le motif $${nbFigures + 1}$ :<br>
              ${mathalea2d(Object.assign({ scale: 0.4, optionsTikz: 'transform shape', id: `Motif${i}F${nbFigures}` }, { xmin: xminCorr, ymin: yminCorr, xmax: xmaxCorr, ymax: ymaxCorr }), objetsCorr)}`)
            break
          case 2:
            {
              const nbFormes = pat.fonctionNb(nbFigures + 1)
              const nbTex = texNombre(nbFormes, 0)

              listeQuestions.push(
                `\nQuel sera le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} dans le motif $${nbFigures + 1}$ ?<br>${ajouteQuestionMathlive(
                  {
                    exercice: this,
                    question: indexInteractif++,
                    reponseParams: { formatInteractif: 'mathalea-mathfield' },
                    objetReponse: { reponse: { value: nbTex } },
                    typeInteractivite: 'mathlive',
                    classe: KeyboardType.clavierNumbers,
                  },
                )}`,
              )
              listeCorrections.push(`Le motif $${nbFigures + 1}$ contient $${miseEnEvidence(texNombre(nbFormes, 0))}$ ${infosShape.nomPluriel}.<br>
          ${!typesQuestions.includes(1) ? mathalea2d(Object.assign({ scale: 0.4, optionsTikz: 'transform shape', id: `Motif${i}F${nbFigures}` }, { xmin: xminCorr, ymin: yminCorr, xmax: xmaxCorr, ymax: ymaxCorr }), objetsCorr) : ''}`)
            }
            break
          case 3:
            {
              const nbFormes = pat.fonctionNb(10)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nQuel sera le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} pour le motif $10$ ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: nbTex } },
                  typeInteractivite: 'mathlive',
                  classe: KeyboardType.clavierNumbers,
                },
              )}
            `)
              listeCorrections.push(`Le motif $10$ contient $${miseEnEvidence(nbTex)}$ ${infosShape.nomPluriel}.<br>
            En effet, la formule pour trouver le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} est : $${miseEnEvidence(pat.formule.replaceAll('n', '10'), bleuMathalea)}$.<br>
            ${explain}`)
            }
            break
          case 5: {
            const equation = equation1erDegre1Inconnue({
              valeursRelatives: true,
              type: pat.type === 'linéaire' ? 'ax=d' : 'ax+b=d',
              a: delta,
              b: pat.fonctionNb(0),
              d: 0,
              inconnue: 'n',
            })
            const reponseQ5 = equation.membreDeGauche

            listeQuestions.push(`\nSi $n$ désigne un entier naturel, exprimer, en fonction de $n$, le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} pour le motif $n$ ?<br>${ajouteQuestionMathlive(
              {
                exercice: this,
                question: indexInteractif++,
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: reponseQ5,
                    options: { calculFormel: true },
                  },
                },
                typeInteractivite: 'mathlive',
                classe: KeyboardType.alphanumeric,
              },
            )}
            `)
            let explain2
            if (pat.type === 'linéaire')
              explain2 = `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1.<br>`
            else if (pat.type === 'affine')
              explain2 = `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
              Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${pat.fonctionNb(1)}, soit ${b < 0 ? `${-b} de moins` : `${b} de plus`}.<br>`
            explain2 += `Par conséquent, pour trouver le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} pour le motif $n$, on peut utiliser l'expression $${miseEnEvidence(reponseQ5)}$.`
            listeCorrections.push(`\n` + explain2)

            break
          }
          case 6:
            {
              let explain2
              let etape = randint(20, 80)
              const nbFormes = this.sup4 > 9 ? this.sup4 : pat.fonctionNb(etape)
              const nbTex = texNombre(nbFormes, 0)
              let enonce

              if (this.sup4 <= 9)
                enonce = `\nUn motif de cette série contient $${nbTex}$ ${infosShape.nomPluriel}. À quel numéro de motif cela correspond-il ?`
              else {
                enonce = `\nOn dispose de $${nbTex}$ ${infosShape.nomPluriel}. Quel est le plus grand numéro de motif que l’on peut construire entièrement avec ces $${nbTex}$ ${infosShape.nomPluriel} ?`
              }

              const equation = equation1erDegre1Inconnue({
                valeursRelatives: true,
                a: delta,
                b: pat.fonctionNb(0),
                c: 0,
                d: nbFormes,
                inconnue: 'n',
              })
              etape = Math.floor(equation.reponseDecimale)

              if (resolutionIntuitive) // Correction intuitive
              {
                explain2 =
                  pat.type === 'linéaire'
                    ? `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Et que c'est aussi le nombre de formes à l'étape 1.<br>Par conséquent, pour trouver le numéro d'un motif dont on connait le nombre de formes, il faut simplement diviser ce nombre par ${delta} pour trouver le numéro.`
                    : `On constate que le nombre de formes augmente de $${delta}$ à chaque étape.<br>
        Cependant, il n'y a pas ${delta} formes sur le motif 1, mais ${pat.fonctionNb(1)}.<br>Par conséquent, il faut ${b < 0 ? `ajouter ${-b}` : `retirer ${b}`} au nombre de formes puis diviser le résultat par ${delta} : <br>
        $\\dfrac{${nbTex} ${b < 0 ? '+' : '-'} ${Math.abs(b)}}{${delta}}${estentier(equation.reponseDecimale) ? '=' + miseEnEvidence(etape) : (arrondi((nbFormes - b) / delta, 2) === arrondi((nbFormes - b) / delta, 3) ? '=' : `\\approx`) + texNombre(equation.reponseDecimale)}$.`
                listeCorrections.push(`C'est le motif numéro $${miseEnEvidence(etape)}$ qui contient $${miseEnEvidence(nbTex, bleuMathalea)}$ ${infosShape.nomPluriel}.<br>
                 ${explain2}`)
              } else {
                // Correction par équation
                explain2 = `Il faut résoudre l'équation $${equation.egalite}$.<br>`
                explain2 += this.correctionDetaillee
                  ? equation.correctionSansConclusionDetaillee
                  : equation.correctionSansConclusion
                if (!estentier(equation.reponseDecimale))
                  explain2 += `L'entier qui précède $${texNombre(equation.reponseDecimale)}$ est $${miseEnEvidence(texNombre(Math.floor(equation.reponseDecimale)))}$.<br>`
                listeCorrections.push(
                  `${explain2}Avec $${miseEnEvidence(nbTex, bleuMathalea)}$ ${infosShape.nomPluriel}, on peut continuer la série jusqu'au motif numéro $${miseEnEvidence(texNombre(etape))}$.`,
                )
              }

              listeQuestions.push(
                enonce +
                  `${ajouteQuestionMathlive({
                    exercice: this,
                    question: indexInteractif++,
                    reponseParams: { formatInteractif: 'mathalea-mathfield' },
                    objetReponse: { reponse: { value: etape.toString() } },
                    classe: KeyboardType.clavierNumbers,
                    typeInteractivite: 'mathlive',
                  })}
            `,
              )
            }
            break
          case 4:
            {
              const nbFormes = pat.fonctionNb(100)
              const nbTex = texNombre(nbFormes, 0)
              listeQuestions.push(`\nQuel sera le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} pour le motif $100$ ?<br>${ajouteQuestionMathlive(
                {
                  exercice: this,
                  question: indexInteractif++,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: nbTex } },
                  classe: KeyboardType.clavierNumbers,
                  typeInteractivite: 'mathlive',
                },
              )}
            `)
              listeCorrections.push(`Le motif $100$ contient $${miseEnEvidence(nbTex)}$ ${infosShape.nomPluriel}.<br>
            En effet, la formule pour trouver le nombre ${infosShape.articleCourt}${infosShape.nomPluriel} est : $${miseEnEvidence(pat.formule.replaceAll('n', '100'), bleuMathalea)}$.<br>
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
      if (this.questionJamaisPosee(i, typesQuestions.join(''), pat.numero)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
