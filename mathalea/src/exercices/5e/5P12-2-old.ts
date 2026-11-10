import { listeShapes2DInfos } from '../../lib/2d/figures2d/shapes2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  listePatternRatio,
  type PatternRiche,
  type PatternRiche3D,
} from '../../lib/2d/patterns/patternsPreDef'
import { VisualPattern } from '../../lib/2d/patterns/VisualPattern'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPosition } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { Ratio } from '../../lib/mathFonctions/Ratio'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = "Trouver le ratio d'évolution d'un motif numérique"
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '26/06/2025'
export const dateDeModificationImportante = '30/05/2026'

/**
 * Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif de rang n sous forme de ratio.
 * Les patterns sont des motifs numériques qui évoluent selon des règles définies.
 * Cet exercice contient des patterns issus de l'excellent site : https://www.visualpatterns.org/
 * @author Jean-claude Lhote
 */
export const uuid = '339c9'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class PaternRatioOld extends Exercice {
  ratios: Ratio[] = []
  niveau: string
  nbDePattern: number
  constructor() {
    super()
    this.ratios = []
    this.nbQuestions = 3
    this.comment = `Cet exercice contient des motifs issus de l'excellent site :  <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br><br>`
    this.comment += `<br>
Grâce au troisième paramètre, on peut imposer des motifs choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=5" target="_blank" style="color: blue">liste de motifs</a>.<br>
Si le choix se porte sur des motifs prédéfinis (de facile à très difficile), alors ces choix sont cumulables entre eux ainsi qu'avec d'autres numéros.<br>
Si plusieurs motifs prédéfinis sont choisis, alors ils seront toujours fournis dans l'ordre de difficulté même si l'ordre aléatoire du dernier paramètre a été choisi.<br>
Si aucun motif prédéfini n'est choisi et si le nombre de questions est supérieur au nombre de motifs choisis, alors l'exercice sera complété par des motifs choisis au hasard.`
    this.besoinFormulaireNumerique = ['Nombre de figures par question', 4]
    this.sup = 3
    this.nbDePattern = listePatternRatio.length
    this.besoinFormulaire2Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : Ratio du motif suivant\n2 : Ratio du motif suivant du suivant\n3 : Ratio du motif n\n4 : Ensemble de ces 3 questions',
    ]
    this.sup2 = '1-2'

    this.besoinFormulaire3Texte = [
      'Numéros des motifs désirés :',
      [
        'Nombres séparés par des tirets  :',
        `Mettre des nombres entre 1 et ${this.nbDePattern}.`,
        `Mettre 100 pour des motifs faciles.`,
        `Mettre 101 pour des motifs moyens.`,
        `Mettre 102 pour des motifs difficiles.`,
        `Mettre 103 pour des motifs très difficiles.`,
        `Mettre ${this.nbDePattern + 1} pour laisser le hasard faire.`,
      ].join('\n'),
    ]

    this.sup3 = `100-101`

    this.besoinFormulaire4CaseACocher = ['Ordre aléatoire des questions']
    this.sup4 = true

    this.niveau = '5e'
  }

  nouvelleVersion(): void {
    const nbFigures = Math.max(2, this.sup)

    const ordreAleatoireDesQuestions = this.sup4

    type Difficulte = 'facile' | 'moyen' | 'difficile' | 'très difficile'

    function filtrerPatternsParDifficulte(
      liste: (PatternRiche | PatternRiche3D)[],
      difficulte: Difficulte,
    ): (PatternRiche | PatternRiche3D)[] {
      return liste
        .filter((p) => p.difficulte === difficulte)
        .sort((a, b) => Number(a.numero) - Number(b.numero))
    }

    const patternsParDifficulte = {
      facile: filtrerPatternsParDifficulte(listePatternRatio, 'facile'),
      moyen: filtrerPatternsParDifficulte(listePatternRatio, 'moyen'),
      difficile: filtrerPatternsParDifficulte(listePatternRatio, 'difficile'),
      tresDifficile: filtrerPatternsParDifficulte(
        listePatternRatio,
        'très difficile',
      ),
    }

    let listePreDef: (PatternRiche | PatternRiche3D)[] = []

    const config = [
      { code: '100', niveau: 'facile' },
      { code: '101', niveau: 'moyen' },
      { code: '102', niveau: 'difficile' },
      { code: '103', niveau: 'tresDifficile' },
    ] as const

    const choixDifficulte = config.some((c) =>
      String(this.sup3).includes(c.code),
    )

    const parametre3 = String(this.sup3)
      .replaceAll('100', '')
      .replaceAll('101', '')
      .replaceAll('102', '')
      .replaceAll('103', '')

    const sansChiffreParametre3 = !/\d/.test(parametre3)

    let typesPattern = gestionnaireFormulaireTexte({
      saisie: parametre3,
      max: this.nbDePattern,
      defaut: this.nbDePattern + 1,
      melange: this.nbDePattern + 1,
      nbQuestions: this.nbQuestions,
      shuffle: ordreAleatoireDesQuestions,
    }).map(Number)

    if (choixDifficulte) {
      listePreDef = config.flatMap(({ code, niveau }) => {
        if (!String(this.sup3).includes(code)) return []
        const liste = patternsParDifficulte[niveau]
        return ordreAleatoireDesQuestions ? shuffle(liste) : liste
      })
      if (!sansChiffreParametre3) {
        const listePatternChoisi = typesPattern.map(
          (i) => listePatternRatio[i - 1],
        )
        listePreDef = Array.from(
          new Map(
            [...listePreDef, ...listePatternChoisi].map((elem) => [
              elem.numero,
              elem,
            ]),
          ).values(),
        )
      }
    } else {
      typesPattern = [...typesPattern, ...shuffle(range1(this.nbDePattern))]
      typesPattern = enleveDoublonNum(typesPattern)
      typesPattern = typesPattern.reverse()

      listePreDef = typesPattern.map((i) => listePatternRatio[i - 1])
    }

    const typesQuestions = Array.from(
      new Set(
        gestionnaireFormulaireTexte({
          saisie: this.sup2,
          max: 3,
          defaut: 4,
          melange: 4,
          nbQuestions: 3,
          shuffle: false,
        }).map(Number),
      ),
    )

    const nbSousQuestions = typesQuestions.length
    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, listePreDef.length) && cpt < 50;
    ) {
      const objetsCorr: NestedObjetMathalea2dArray = []

      const pat = listePreDef[i]
      const pattern = new VisualPattern([])
      pattern.iterate = (pat as PatternRiche).iterate
      pattern.shapes = pat.shapes

      for (const name of pat.shapes) {
        if (name in listeShapes2DInfos) {
          objetsCorr.push(listeShapes2DInfos[name].shapeDef)
        } else {
          throw new Error(
            `Le nom de la forme "${name}" n'est pas reconnu dans les formes prédéfinies.`,
          )
        }
      }

      const renderedSuivant = pattern.render(nbFigures + 1, 0, 0)
      objetsCorr.push(...renderedSuivant)
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
      if (!pat.fonctionRatio) {
        throw new Error(
          `La fonction ratio n'est pas définie pour le pattern ${JSON.stringify(pat)}`,
        )
      }
      const ratio = pat.fonctionRatio(nbFigures + 1)
      this.ratios[i] = ratio

      const listeQuestions: string[] = []
      const listeCorrections: string[] = []

      for (let k = 0; k < typesQuestions.length; k++) {
        let texteCorr = ''
        switch (typesQuestions[k]) {
          case 1: {
            listeQuestions.push(
              `\nDonner le ratio "${(pat as PatternRiche).texRatio}" dans le motif de rang $${nbFigures + 1}$ : ` +
                sp(6) +
                remplisLesBlancs(
                  this,
                  i * nbSousQuestions + k,
                  Array.from(
                    { length: ratio.values.length },
                    (_, index) => `%{champ${index + 1}}`,
                  ).join('~:~'),
                  KeyboardType.clavierNumbers,
                ) +
                '<br>',
            )
            const champs = Object.fromEntries(
              ratio.values.map((value: number, index: number) => [
                `champ${index + 1}`,
                {
                  value,
                  options: { nombreDecimalSeulement: true },
                },
              ]),
            )

            handleAnswers(
              this,
              i * nbSousQuestions + k,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(...listePoints),
                  1,
                ],
                ...champs,
              },
              { formatInteractif: 'fillInTheBlank' },
            )
            const result = ratio
              .toLatex()
              .split(':')
              .map((x: string) => miseEnEvidence(Number(x.trim())))
              .join(':')
            texteCorr = `Au rang $${nbFigures + 1}$, le ratio "${(pat as PatternRiche).texRatio}" est $${result}$.<br>`
            const figureCorr: NestedObjetMathalea2dArray = []
            for (const name of pat.shapes) {
              if (name in listeShapes2DInfos) {
                figureCorr.push(listeShapes2DInfos[name].shapeDef)
              } else {
                throw new Error(
                  `Le nom de la forme "${name}" n'est pas reconnu dans les formes prédéfinies.`,
                )
              }
            }
            figureCorr.push(...pattern.render(nbFigures + 1, 0, 0))
            texteCorr += mathalea2d(
              Object.assign(fixeBordures(figureCorr), {
                id: `Motif${i}Correction`,
                pixelsParCm: 20,
                scale: 0.6,
                display: 'block' as const,
                center: !context.isHtml,
                optionsTikz: 'transform shape',
              }),
              figureCorr,
            )
            break
          }
          case 2: {
            listeQuestions.push(
              `\nDonner le ratio "${(pat as PatternRiche).texRatio}" dans le motif de rang $${nbFigures + 2}$.` +
                sp(6) +
                remplisLesBlancs(
                  this,
                  i * nbSousQuestions + k,
                  Array.from(
                    { length: ratio.values.length },
                    (_, index) => `%{champ${index + 1}}`,
                  ).join('~:~'),
                  KeyboardType.clavierNumbers,
                ) +
                '<br>',
            )
            const champs = Object.fromEntries(
              pat
                .fonctionRatio(nbFigures + 2)
                .values.map((value: number, index: number) => [
                  `champ${index + 1}`,
                  {
                    value,
                    options: { nombreDecimalSeulement: true },
                  },
                ]),
            )

            handleAnswers(
              this,
              i * nbSousQuestions + k,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(...listePoints),
                  1,
                ],
                ...champs,
              },
              { formatInteractif: 'fillInTheBlank' },
            )

            const result = pat
              .fonctionRatio(nbFigures + 2)
              .toLatex()
              .split(':')
              .map((x: string) => {
                const n = Number(x.trim())
                return isNaN(n) ? x : miseEnEvidence(n)
              })
              .join(':')
            texteCorr = `Au rang $${nbFigures + 2}$, le ratio "${(pat as PatternRiche).texRatio}" est $${result}$.<br>`
            if (this.niveau === '5e') {
              const figureCorr: NestedObjetMathalea2dArray = []
              for (const name of pat.shapes) {
                if (name in listeShapes2DInfos) {
                  figureCorr.push(listeShapes2DInfos[name].shapeDef)
                }
              }
              figureCorr.push(...pattern.render(nbFigures + 2, 0, 0))

              texteCorr += mathalea2d(
                Object.assign(fixeBordures(figureCorr), {
                  id: `Motif${i}Correction`,
                  pixelsParCm: 20,
                  scale: 0.6,
                  display: 'block' as const,
                  center: !context.isHtml,
                  optionsTikz: 'transform shape',
                }),
                figureCorr,
              )
            }
            break
          }
          case 3: {
            const nbChamps = (pat.formuleRatio ?? '').split(' : ').length
            listeQuestions.push(
              `\nSi $n$ est un entier naturel, donner le ratio "${(pat as PatternRiche).texRatio}" dans le motif de rang $n$.` +
                sp(6) +
                remplisLesBlancs(
                  this,
                  i * nbSousQuestions + k,
                  Array.from(
                    { length: nbChamps },
                    (_, index) => `%{champ${index + 1}}`,
                  ).join('~:~'),
                  KeyboardType.alphanumeric,
                ) +
                '<br>',
            )
            const champs = Object.fromEntries(
              (pat.formuleRatio ?? '')
                .split(' : ')
                .map((value: string, index: number) => {
                  const trimmed = value.trim()
                  const n = Number(trimmed)

                  return [
                    `champ${index + 1}`,
                    {
                      value: isNaN(n) ? trimmed : n,
                      options: { calculFormel: true },
                    },
                  ]
                }),
            )

            handleAnswers(
              this,
              i * nbSousQuestions + k,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(...listePoints),
                  1,
                ],
                ...champs,
              },
              { formatInteractif: 'fillInTheBlank' },
            )
            const result = (pat.formuleRatio ?? '')
              .split(' : ')
              .map((x) => miseEnEvidence(String(x)))
              .join(':')
            texteCorr = `Au rang $n$, le ratio "${(pat as PatternRiche).texRatio}" est $${result}$.<br>`

            break
          }
        }
        listeCorrections.push(texteCorr)
      }

      texte +=
        listeQuestions.length === 1
          ? '<br>' + listeQuestions[0]
          : createList({
              items: listeQuestions,
              style: 'alpha',
            })
      const texteCorr =
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
