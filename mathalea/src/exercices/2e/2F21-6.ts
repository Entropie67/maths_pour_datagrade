import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { addTableauSignesVariations } from '../../lib/customElements/TableauSignesVariationsElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  celluleFleche,
  celluleValeur,
  colonne,
  ligneVariation,
} from '../../lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { abs } from '../../lib/outils/nombres'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer le sens de variation d'une fonction affine"
export const dateDeModifImportante = '18/05/2023'
export const interactifReady = true
/**
 * @author Stéphane Guyon mise à jour et ajout de cas Gilles Mora
 * typage typescript incomplet à cause de tableauDeVariation Jean-claude Lhote
 */
export const uuid = 'b72b0'

export const refs = {
  'fr-fr': ['2F21-6'],
  'fr-ch': ['11CTFA2D-8', '11LCFA2D-8', '11LSFA2D-8'],
}
export default class Variationsfonctionaffine extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de question',
      [
        'Nombres séparés par des tirets :',
        '1 : Déterminer le sens de variation (avec des entiers)',
        '2 : Déterminer le sens de variation (avec des fractions)',
        '3 : Dresser un tableau de variations (sur un intervalle borné)',
      ].join('\n'),
    ]

    this.nbQuestions = 2 // On complète le nb de questions

    // Par défaut, les trois cas sont cochés à poids égal.
    this.sup = '1-2-3'
  }

  propositionsSensDeVariation(nomF: string[], a: number) {
    return a > 0
      ? [
          { texte: `$${nomF}$ est croissante sur $\\mathbb R$.`, statut: true },
          {
            texte: `$${nomF}$ est décroissante sur $\\mathbb R$.`,
            statut: false,
          },
        ]
      : [
          {
            texte: `$${nomF}$ est décroissante sur $\\mathbb R$.`,
            statut: true,
          },
          { texte: `$${nomF}$ est croissante sur $\\mathbb R$.`, statut: false },
        ]
  }

  nouvelleVersion() {
    // melange/defaut = 4 : compatibilité des anciens liens partagés utilisant
    // l'ancien réglage numérique 4 = « Mélange des cas précédents ». Ce cas
    // n'est plus proposé dans le formulaire, qui coche désormais les cas 1 à
    // 3 individuellement.
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }) as number[]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // on rajoute les variables dont on a besoin
      const nom = [['f'], ['g'], ['h'], ['u'], ['v'], ['w']]
      const nomF = choice(nom)
      const typesDeQuestions = listeTypeDeQuestions[i]
      const variables: number[] = []
      let texte = ''
      let texteCorr = ''
      switch (typesDeQuestions) {
        case 1:
          {
            const a = randint(-10, 10, 0) // coefficient a de la fonction affine
            const b = randint(-10, 10) // coefficient b de la fonction affine
            texte = `Déterminer le sens de variation de la fonction $${nomF}$ définie sur $\\mathbb R$ par : `
            if (choice([true, false])) {
              texte += `$${nomF}(x)=${reduireAxPlusB(a, b)}$.`
            } else {
              texte += `$${b === 0 ? `${nomF}(x)=${rienSi1(a)}x` : `${nomF}(x)=${b}${ecritureAlgebriqueSauf1(a)}x`}$.`
            }
            texteCorr = `On reconnaît que $${nomF}$ est une fonction affine, de la forme $${nomF}(x)=ax+b$, `
            texteCorr += `avec $a=${a}~$ et $b=${b}$. <br>
        On sait qu'une fonction affine est monotone sur $\\mathbb{R}$.<br>
          Son sens de variation dépend du signe de $a$.<br>`
            let ligne1
            if (a > 0) {
              texteCorr += `Comme $a=${a}>0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement croissante')} sur $\\mathbb{R}$.<br>`
              ligne1 = ['Var', 10, '-/', 30, '+/', 30]
            } else {
              texteCorr += `Comme $a=${a}<0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement décroissante')} sur $\\mathbb{R}$.<br>`

              ligne1 = ['Var', 10, '+/', 30, '-/', 30]
            }
            texteCorr +=
              'On peut synthétiser cela dans un tableau de variations :<br><br>'
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2, 30],
                  [`$${nomF}(x)$`, 3, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                ['$-\\infty$', 30, '$+\\infty$', 30],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligne1],
              espcl: 5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 3, // taille de la première colonne en cm
              hauteurLignes: [15, 20],
            })
            if (this.interactif) {
              handleAnswers(
                this,
                i,
                {
                  qcm: {
                    enonce: texte,
                    propositions: this.propositionsSensDeVariation(nomF, a),
                    correction: texteCorr,
                    options: { radio: true },
                  },
                },
                { formatInteractif: 'mathalea-qcm' },
              )
              texte += addMathaleaQcm(this, i, { radio: true })
            }
            variables.push(a, b)
          }
          break

        case 2:
          {
            let a = randint(-10, 10, 0) // coefficient a de la fonction affine
            let b = randint(-10, 10) // coefficient b de la fonction affine
            let d = choice([abs(a) + 1, abs(b) + 1]) // dénominateur
            while (d === 1) {
              a = randint(-10, 10, 0) // coefficient a de la fonction affine
              b = randint(-10, 10) // coefficient b de la fonction affine
              d = choice([abs(a) + 1, abs(b) + 1])
            } // dénominateur
            texte = `Déterminer le sens de variation de la fonction $${nomF}$ définie sur $\\mathbb R$ par : `
            if (choice([true, false])) {
              texte += `$${nomF}(x)=\\dfrac{${reduireAxPlusB(a, b)}}{${d}}$.`
            } else {
              texte += `$${b === 0 ? `${nomF}(x)=\\dfrac{${rienSi1(a)}x}{${d}}` : `${nomF}(x)=\\dfrac{${b}${ecritureAlgebriqueSauf1(a)}x}{${d}}`}$.`
            }
            texteCorr = `On reconnaît que $${nomF}$ est une fonction affine, de la forme $${nomF}(x)=ax+b$, `
            texteCorr += `avec $a=\\dfrac{${a}}{${d}}${simplificationDeFractionAvecEtapes(a, d)}$ et $b=\\dfrac{${b}}{${d}}${simplificationDeFractionAvecEtapes(b, d)}$. <br>
        On sait qu'une fonction affine est monotone sur $\\mathbb{R}$.<br>
          Son sens de variation dépend du signe de $a$.<br>`
            let ligne1
            if (a > 0) {
              texteCorr += `Comme $a=${texFractionReduite(a, d)}>0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement croissante')} sur $\\mathbb{R}$.<br>`
              ligne1 = ['Var', 10, '-/', 30, '+/', 30]
            } else {
              texteCorr += `Comme $a=${texFractionReduite(a, d)}<0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement décroissante')} sur $\\mathbb{R}$.<br>`

              ligne1 = ['Var', 10, '+/', 30, '-/', 30]
            }
            texteCorr +=
              'On peut synthétiser cela dans un tableau de variations :<br><br>'
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2, 30],
                  [`$${nomF}(x)$`, 3, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                ['$-\\infty$', 30, '$+\\infty$', 30],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligne1],
              espcl: 5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 3, // taille de la première colonne en cm
              hauteurLignes: [15, 20],
            })
            if (this.interactif) {
              handleAnswers(
                this,
                i,
                {
                  qcm: {
                    enonce: texte,
                    propositions: this.propositionsSensDeVariation(nomF, a),
                    correction: texteCorr,
                    options: { radio: true },
                  },
                },
                { formatInteractif: 'mathalea-qcm' },
              )
              texte += addMathaleaQcm(this, i, { radio: true })
            }
            variables.push(a, b)
          }
          break

        case 3:
          {
            const a = randint(-10, 10, 0) // coefficient a de la fonction affine
            const b = randint(-10, 10) // coefficient b de la fonction affine
            const c = randint(-10, 5)
            const d = randint(c + 1, 10)
            const fc = a * c + b
            const fd = a * d + b
            texte = `Dresser le tableau de variations de la fonction $${nomF}$ définie sur $[${c}\\,;\\,${d}]$ par : `
            if (choice([true, false])) {
              texte += `$${nomF}(x)=${reduireAxPlusB(a, b)}$.`
            } else {
              texte += `$${b === 0 ? `${nomF}(x)=${rienSi1(b)}x` : `${nomF}(x)=${b}${ecritureAlgebriqueSauf1(a)}x`}$.`
            }
            texteCorr = `On reconnaît que $${nomF}$ est une fonction affine, de la forme $${nomF}(x)=ax+b$, `
            texteCorr += `avec $a=${a}~$ et $b=${b}$. <br>
          On sait qu'une fonction affine est monotone sur $\\mathbb{R}$.<br>
            Son sens de variation dépend du signe de $a$.<br>`
            let ligne1
            if (a > 0) {
              texteCorr += `Comme $a=${a}>0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement croissante')} sur $\\mathbb{R}$.<br>
            `
              ligne1 = ['Var', 10, `-/$${fc}$`, 30, `+/$${fd}$`, 30]
            } else {
              texteCorr += `Comme $a=${a}<0$, la fonction $${nomF}$ est ${texteEnCouleurEtGras('strictement décroissante')} sur $\\mathbb{R}$.<br>`

              ligne1 = ['Var', 10, `+/$${fc}$`, 30, `-/$${fd}$`, 30]
            }
            texteCorr += `De plus, $${nomF}(${c})=${a === 1 ? '' : `${a}\\times`} ${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(b)}=${fc}$ et $${nomF}(${d})=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(d)}${ecritureAlgebrique(b)}=${fd}$.<br>`
            texteCorr += 'On obtient ainsi le tableau de variations :<br><br>'
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2, 30],
                  [`$${nomF}(x)$`, 3, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                [`$${c}$`, 30, `$${d}$`, 30],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligne1],
              espcl: 5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 3, // taille de la première colonne en cm
              hauteurLignes: [15, 20],
            })
            if (this.interactif) {
              const configTableauVariations: TableauSVConfig = {
                variableName: 'x',
                colonnes: [colonne(String(c)), colonne(String(d))],
                lignes: [
                  ligneVariation(
                    `${nomF}(x)`,
                    [
                      celluleValeur('', {
                        editable: true,
                        expected: String(fc),
                        clavier: KeyboardType.clavierDeBase,
                      }),
                      celluleValeur('', {
                        editable: true,
                        expected: String(fd),
                        clavier: KeyboardType.clavierDeBase,
                      }),
                    ],
                    [
                      celluleFleche('', {
                        editable: true,
                        expected: a > 0 ? 'haut' : 'bas',
                      }),
                    ],
                  ),
                ],
              }
              texte += `<br>${addTableauSignesVariations(this, i, {
                config: configTableauVariations,
                bareme: 1,
              })}`
            }
            variables.push(a, b)
          }
          break
      }
      variables.push(typesDeQuestions)
      if (this.questionJamaisPosee(i, variables.map(String).join(';'))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
