import type { MathfieldElement } from 'mathlive'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { FillInTheBlankElement } from '../../lib/customElements/FillInTheBlank'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  buildDataKeyboardFromStyle,
  KeyboardType,
} from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  AddTabDbleEntryMathlive,
  type Icell,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import type { IExercice } from '../../lib/types'

export const titre = 'Donner différentes écritures de nombres décimaux'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '26/07/2026'

function texFraction(
  numerateur: number | string,
  denominateur: number | string,
) {
  return `\\dfrac{${numerateur}}{${denominateur}}`
}

/**
 * Une cellule du tableau.
 * `enonce` peut contenir des champs à compléter notés `%{nom}` :
 * ils deviennent des pointillés en version papier et des champs de saisie
 * en version interactive.
 */
type Cellule = {
  enonce: string
  correction: string
  grisee: boolean
  reponses: Record<string, number>
}

type LigneTableau = {
  type: number
  u: number
  d: number
  c: number
  n: number
  cellules: [Cellule, Cellule, Cellule]
}

function cellule(
  enonce: string,
  correction: string,
  reponses: Record<string, number> = {},
): Cellule {
  return { enonce, correction, grisee: false, reponses }
}

/** Cellule grisée : rien n'est demandé pour cette ligne. */
function celluleGrisee(): Cellule {
  return { enonce: '', correction: '', grisee: true, reponses: {} }
}

/** Remplace les champs `%{nom}` par des pointillés (version papier). */
function avecPointilles(contenu: string): string {
  return contenu.replace(/%\{[^}]+\}/g, '\\ldots')
}

/** Remplace les champs `%{nom}` par des zones de saisie MathLive. */
function avecChamps(contenu: string): string {
  return contenu.replace(/%\{([^}]+)\}/g, '\\placeholder[$1]{}')
}

/**
 * Construit les trois cellules d'une ligne : fraction décimale,
 * décomposition canonique et écriture décimale.
 */
function construitCellules(
  type: number,
  u: number,
  d: number,
  c: number,
  n: number,
): [Cellule, Cellule, Cellule] {
  const decimalCentiemes = arrondi(u + d / 10 + c / 100, 2)
  const decimalDixiemes = arrondi(u + d / 10, 1)
  switch (type) {
    case 1: // n/100 = ... + .../10 + .../100 = ...
      return [
        cellule(texFraction(n, 100), texFraction(n, 100)),
        cellule(
          `%{a}+${texFraction('%{b}', 10)}+${texFraction('%{c}', 100)}`,
          `${miseEnEvidence(u)}+${texFraction(miseEnEvidence(d), 10)}+${texFraction(miseEnEvidence(c), 100)}`,
          { a: u, b: d, c },
        ),
        cellule('%{a}', miseEnEvidence(texNombre(decimalCentiemes)), {
          a: decimalCentiemes,
        }),
      ]
    case 2: // n/100 = ... + .../100 + .../10 = ...
      return [
        cellule(texFraction(n, 100), texFraction(n, 100)),
        cellule(
          `%{a}+${texFraction('%{b}', 100)}+${texFraction('%{c}', 10)}`,
          `${miseEnEvidence(u)}+${texFraction(miseEnEvidence(c), 100)}+${texFraction(miseEnEvidence(d), 10)}`,
          { a: u, b: c, c: d },
        ),
        cellule('%{a}', miseEnEvidence(texNombre(decimalCentiemes)), {
          a: decimalCentiemes,
        }),
      ]
    case 3: // .../... = u + d/10 + c/100 = ...
      return [
        cellule(
          texFraction('%{a}', '%{b}'),
          texFraction(miseEnEvidence(n), miseEnEvidence(100)),
          { a: n, b: 100 },
        ),
        cellule(
          `${u}+${texFraction(d, 10)}+${texFraction(c, 100)}`,
          `${u}+${texFraction(d, 10)}+${texFraction(c, 100)}`,
        ),
        cellule('%{a}', miseEnEvidence(texNombre(decimalCentiemes)), {
          a: decimalCentiemes,
        }),
      ]
    case 4: // u = .../10
      return [
        cellule(
          texFraction('%{a}', 10),
          texFraction(miseEnEvidence(10 * u), 10),
          {
            a: 10 * u,
          },
        ),
        celluleGrisee(),
        cellule(String(u), String(u)),
      ]
    case 5: // u = .../100
      return [
        cellule(
          texFraction('%{a}', 100),
          texFraction(miseEnEvidence(texNombre(100 * u)), 100),
          { a: 100 * u },
        ),
        celluleGrisee(),
        cellule(String(u), String(u)),
      ]
    case 6: // n/10 = ... + .../10 + .../100 = ...
      return [
        cellule(texFraction(n, 10), texFraction(n, 10)),
        cellule(
          `%{a}+${texFraction('%{b}', 10)}+${texFraction('%{c}', 100)}`,
          `${miseEnEvidence(10 * u + d)}+${texFraction(miseEnEvidence(c), 10)}+${texFraction(miseEnEvidence(0), 100)}`,
          { a: 10 * u + d, b: c, c: 0 },
        ),
        cellule('%{a}', miseEnEvidence(texNombre(arrondi(n / 10, 1))), {
          a: arrondi(n / 10, 1),
        }),
      ]
    default: // 7 : .../100 = u + d/10 = ...
      return [
        cellule(texFraction('%{a}', 100), texFraction(miseEnEvidence(n), 100), {
          a: n,
        }),
        cellule(`${u}+${texFraction(d, 10)}`, `${u}+${texFraction(d, 10)}`),
        cellule('%{a}', miseEnEvidence(texNombre(decimalDixiemes)), {
          a: decimalDixiemes,
        }),
      ]
  }
}

const entetesColonnes = [
  '\\text{N°}',
  '\\text{Fraction décimale}',
  '\\text{Décomposition canonique}',
  '\\text{Écriture décimale}',
]

/**
 * Couleurs de fond du tableau : les cellules grisées sont celles qui ne sont
 * pas demandées (nombres entiers). En sortie papier, les entêtes sont blancs
 * alors qu'ils gardent la couleur du thème en HTML.
 */
function styleTableau(lignes: LigneTableau[]): Record<string, string> {
  const style: Record<string, string> = {}
  for (let index = 0; index < lignes.length; index++) {
    if (lignes[index].cellules[1].grisee) {
      style[`L${index + 1}C2`] = 'lightgray'
    }
    if (!context.isHtml) style[`L${index + 1}C0`] = 'white'
  }
  if (!context.isHtml) {
    for (let colonne = 0; colonne < entetesColonnes.length; colonne++) {
      style[`L0C${colonne}`] = 'white'
    }
  }
  return style
}

/**
 * Compléter un tableau donnant plusieurs écritures d'un même nombre décimal
 * * 1) n/100 = ...+.../10 + .../100
 * * 2) n/100 = ...+.../100 + .../10
 * * 3).../100 = u + d/10 + c/100
 * * 4) u = .../10
 * * 5) u = .../100
 * * 6) n/10 = ... + .../10 + .../100
 * * 7) .../100 = u + d/10
 * @author Rémi Angot
 */
export const uuid = '1acf7'

export const refs = {
  'fr-fr': ['6N2autoB-1'],
  'fr-2016': ['6N23-1'],
  'fr-ch': ['9R1NO4E-7', '9R2NO4E-7', '9R3NO4E-7', 'PRQNO03A-2', 'PRQNO11A-8'], // Primaire anciennement : ['9NO10-11'],
}
export default class ExerciceDifferentesEcrituresNombresDecimaux extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : n/100 = ...+.../10 + .../100',
        '2 : n/100 = ...+.../100 + .../10',
        '3 : .../100 = u + d/10 + c/100',
        '4 : u = .../10',
        '5 : u = .../100',
        '6 : n/10 = ... + .../10 + .../100',
        '7 :  .../100 = u + d/10',
        '8 : Mélange',
      ].join('\n'),
    ]
    this.consigne =
      "Compléter le tableau ci-dessous. Pour chaque ligne, indiquer la fraction décimale, la décomposition canonique et l'écriture décimale correspondantes (les cases grisées ne sont pas à compléter)."
    this.spacing = 2
    this.spacingCorr = 2
    this.nbCols = 1
    this.nbColsCorr = 1
    this.sup = '1-2-3' // Type de question
  }

  nouvelleVersion() {
    if (context.isAmc) {
      this.consigne =
        "Compléter les égalités avec une fraction décimale, la décomposition canonique puis l'écriture décimale."
    } else {
      this.listeAvecNumerotation = false
    }
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 7,
      defaut: 8,
      melange: 8,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)

    const lignes: LigneTableau[] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = listeTypeDeQuestions[i]
      const u = type >= 4 && type <= 5 ? randint(2, 19) : randint(2, 9) // chiffre des unités
      const d = type >= 4 && type <= 5 ? 0 : randint(1, 9) // chiffre des dixièmes
      const c = (type >= 4 && type <= 5) || type === 7 ? 0 : randint(1, 9) // chiffre des centièmes
      const n = 100 * u + 10 * d + c
      if (!this.questionJamaisPosee(i, u, d, c)) {
        // Si la question a déjà été posée, on en tire une autre
        continue
      }
      lignes.push({
        type,
        u,
        d,
        c,
        n,
        cellules: construitCellules(type, u, d, c, n),
      })
      if (context.isAmc) this.ajouteQuestionAmc(i, type, u, d, c, n)
      i++
    }

    if (!context.isAmc) {
      this.listeQuestions.push(this.enonceTableau(lignes))
      this.listeCorrections.push(this.correctionTableau(lignes))
    }
    listeQuestionsToContenu(this)
  }

  /**
   * L'énoncé sous forme de tableau : un tableau interactif avec un champ de
   * saisie par pointillé en HTML interactif, un tableau classique sinon.
   */
  enonceTableau(lignes: LigneTableau[]): string {
    const numerosLignes = lignes.map((_, index) => String(index + 1))
    const style = styleTableau(lignes)

    if (this.interactif && context.isHtml) {
      return this.tableauInteractif(lignes, numerosLignes, style)
    }

    return tableauColonneLigne(
      entetesColonnes,
      numerosLignes,
      lignes.flatMap((ligne) =>
        ligne.cellules.map((celluleLigne) =>
          avecPointilles(celluleLigne.enonce),
        ),
      ),
      2.5,
      true,
      this.numeroExercice ?? 0,
      0,
      false,
      style,
    )
  }

  /** Le même tableau, entièrement complété. */
  correctionTableau(lignes: LigneTableau[]): string {
    return tableauColonneLigne(
      entetesColonnes,
      lignes.map((_, index) => String(index + 1)),
      lignes.flatMap((ligne) =>
        ligne.cellules.map((celluleLigne) => celluleLigne.correction),
      ),
      2.5,
      true,
      this.numeroExercice ?? 0,
      0,
      false,
      styleTableau(lignes),
    )
  }

  /**
   * Le tableau interactif : chaque cellule à compléter est un `fill-in-the-blank`
   * qui contient autant de zones de saisie que de pointillés.
   */
  tableauInteractif(
    lignes: LigneTableau[],
    numerosLignes: string[],
    style: Record<string, string>,
  ): string {
    const numeroExercice = this.numeroExercice ?? 0
    const dataKeyboard = buildDataKeyboardFromStyle(
      KeyboardType.clavierDeBase ?? '',
    ).join(' ')
    const enTete = (texte: string): Icell => ({
      texte,
      latex: true,
      gras: true,
      color: 'black',
    })
    const raws: Icell[][] = lignes.map((ligne, indexLigne) =>
      ligne.cellules.map((celluleLigne, indexColonne) => {
        if (Object.keys(celluleLigne.reponses).length === 0) {
          return {
            texte: celluleLigne.enonce,
            latex: true,
            gras: false,
            color: 'black',
          }
        }
        return {
          texte: FillInTheBlankElement.create({
            id: identifiantChamp(
              numeroExercice,
              indexLigne + 1,
              indexColonne + 1,
            ),
            elementId: `fill-in-the-blankEx${numeroExercice}Q0L${indexLigne + 1}C${indexColonne + 1}`,
            numeroExercice,
            questionIndex: 0,
            dataKeyboard,
            content: avecChamps(celluleLigne.enonce),
          }),
          latex: false,
          gras: false,
          color: 'black',
        }
      }),
    )
    const tableau = AddTabDbleEntryMathlive.create(
      numeroExercice,
      0,
      {
        raws,
        headingCols: entetesColonnes.map(enTete),
        headingLines: numerosLignes.map(enTete),
        colFooters: [],
        lineFooters: [],
      },
      'tableauMathlive',
      false,
      style,
    )
    // Un point par ligne : le total affiché (x1) doit correspondre au score
    // calculé par `verifieLeTableau()`, qui ne passe pas par les champs `L1C1`…
    const pointsParLigne = (): [number, number] => [
      lignes.length,
      lignes.length,
    ]
    handleAnswers(
      this,
      0,
      {
        bareme: pointsParLigne,
        callback: (exercice) => verifieLeTableau(exercice, lignes),
      },
      { formatInteractif: 'tableauMathlive' },
    )
    return tableau.output
  }

  /**
   * La sortie AMC reste une suite d'égalités à compléter, une par question.
   */
  ajouteQuestionAmc(
    i: number,
    type: number,
    u: number,
    d: number,
    c: number,
    n: number,
  ) {
    let texte: string
    let texteCorr: string
    let ecritureDecimale: string
    switch (type) {
      case 1: // n/100 = .... + .../10 + .../100=...
        ecritureDecimale = texNombre(arrondi(u + d / 10 + c / 100, 2))
        texte = `$${fraction(n, 100).texFraction}=a+${texFraction('b', '10')}+${texFraction('c', '100')}=d$`
        texteCorr = `$${fraction(n, 100).texFraction}=${miseEnEvidence(u)}+${texFraction(miseEnEvidence(d), '10')}+${texFraction(miseEnEvidence(c), '100')}=${miseEnEvidence(ecritureDecimale)}$`
        this.autoCorrectionAMC[i] = {
          enonceAvant: false,
          options: { multicols: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: u,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'b',
                    valeur: d,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'c',
                    valeur: c,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'd',
                    valeur: arrondi(u + d / 10 + c / 100, 2),
                    param: {
                      signe: false,
                      digits: 5,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      case 2: // n/100 = ... + .../100 + .../10
        ecritureDecimale = texNombre(arrondi(u + d / 10 + c / 100, 2))
        texte = `$${texFraction(n, '100')}=a+${texFraction('b', 100)}+${texFraction('c', 10)}=d$`
        texteCorr = `$${texFraction(n, '100')}=${miseEnEvidence(u)}+${texFraction(
          miseEnEvidence(c),
          100,
        )}+${texFraction(miseEnEvidence(d), 10)}=${miseEnEvidence(ecritureDecimale)}$`
        this.autoCorrectionAMC[i] = {
          options: { multicols: true },
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: u,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'b',
                    valeur: c,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'c',
                    valeur: d,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'd',
                    valeur: arrondi(u + d / 10 + c / 100, 2),
                    param: {
                      signe: false,
                      digits: 5,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      case 3: // .../... = u + d/10 + c/100=...
        ecritureDecimale = texNombre(arrondi(u + d / 10 + c / 100, 2))
        texte = `$${texFraction('a', '100')}=${u}+${texFraction(
          d,
          '10',
        )}+${texFraction(c, '100')}=b$`
        texteCorr = `$${texFraction(miseEnEvidence(n), '100')}=${u}+${texFraction(
          d,
          '10',
        )}+${texFraction(c, '100')}=${miseEnEvidence(ecritureDecimale)}$`
        this.autoCorrectionAMC[i] = {
          options: { multicols: true },
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: n,
                    param: {
                      signe: false,
                      digits: 4,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'b',
                    valeur: arrondi(u + d / 10 + c / 100, 2),
                    param: {
                      signe: false,
                      digits: 5,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      case 4: // u = .../10
        texte = `$${u}=${texFraction('a', '10')}$`
        texteCorr = `$${u}=${texFraction(miseEnEvidence(10 * u), '10')}$`
        this.autoCorrectionAMC[i] = {
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: arrondi(10 * u, 2),
                    param: {
                      signe: false,
                      digits: 3,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      case 5: // u = .../100
        texte = `$${u}=${texFraction('a', '100')}$`
        texteCorr = `$${u}=${texFraction(miseEnEvidence(100 * u), '100')}$`
        this.autoCorrectionAMC[i] = {
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: arrondi(100 * u, 2),
                    param: {
                      signe: false,
                      digits: 3,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      case 6: // n/10 = ... + .../10 + .../100 = ...
        ecritureDecimale = texNombre(arrondi(n / 10, 1))
        texte = `$${texFraction(n, 10)}=a+${texFraction('b', 10)}+${texFraction('c', 100)}=d$`
        texteCorr = `$${texFraction(n, 10)}=${miseEnEvidence(u * 10 + d)}+${texFraction(miseEnEvidence(c), 10)}+${texFraction(miseEnEvidence(0), 100)}=${miseEnEvidence(ecritureDecimale)}$`
        this.autoCorrectionAMC[i] = {
          options: { multicols: true },
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: arrondi(u * 10 + d, 2),
                    param: {
                      signe: false,
                      digits: 3,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'b',
                    valeur: c,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'c',
                    valeur: 0,
                    param: {
                      signe: false,
                      digits: 1,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'd',
                    valeur: arrondi(n / 10, 1),
                    param: {
                      signe: false,
                      digits: 5,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
      default: // 7 : .../100 = u + d/10 =...
        ecritureDecimale = texNombre(arrondi(u + d / 10, 1))
        texte = `$${texFraction('a', '100')}=${u}+${texFraction(d, '10')}=b$`
        texteCorr = `$${texFraction(miseEnEvidence(n), '100')}=${u}+${texFraction(d, '10')}=${miseEnEvidence(ecritureDecimale)}$`
        this.autoCorrectionAMC[i] = {
          options: { multicols: true },
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + '<br>a',
                    valeur: n,
                    param: {
                      signe: false,
                      digits: 4,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: 'b',
                    valeur: arrondi(u + d / 10, 1),
                    param: {
                      signe: false,
                      digits: 5,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        break
    }
    this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
  }
}

function identifiantChamp(
  numeroExercice: number,
  ligne: number,
  colonne: number,
): string {
  return `champTexteEx${numeroExercice}Q0L${ligne}C${colonne}`
}

/**
 * Vérifie toutes les cellules du tableau : une ligne complètement juste
 * rapporte un point.
 */
function verifieLeTableau(exercice: IExercice, lignes: LigneTableau[]) {
  const numeroExercice = exercice.numeroExercice ?? 0
  let nbBonnesReponses = 0
  let nbSaisiesVides = 0
  lignes.forEach((ligne, indexLigne) => {
    let ligneOk = true
    ligne.cellules.forEach((celluleLigne, indexColonne) => {
      const noms = Object.keys(celluleLigne.reponses)
      if (noms.length === 0) return
      const champ = document.querySelector(
        `math-field#${identifiantChamp(numeroExercice, indexLigne + 1, indexColonne + 1)}`,
      ) as MathfieldElement | null
      if (champ == null) {
        ligneOk = false
        return
      }
      for (const nom of noms) {
        const saisie = champ.getPromptValue(nom)
        if (saisie === '') nbSaisiesVides++
        const resultat = fonctionComparaison(
          saisie,
          String(celluleLigne.reponses[nom]),
        )
        champ.setPromptState(nom, resultat.isOk ? 'correct' : 'incorrect', true)
        if (!resultat.isOk) ligneOk = false
      }
      champ.classList.add('corrected')
      if (champ.getValue().length > 0 && typeof exercice.answers === 'object') {
        exercice.answers[
          `Ex${numeroExercice}Q0L${indexLigne + 1}C${indexColonne + 1}`
        ] = champ.getValue()
      }
    })
    if (ligneOk) nbBonnesReponses++
  })
  let feedback = ''
  if (nbSaisiesVides === 1) {
    feedback = 'Il manque une réponse dans une zone de saisie.'
  } else if (nbSaisiesVides > 1) {
    feedback = `Il manque une réponse dans ${nbSaisiesVides} zones de saisie.`
  }
  return {
    isOk: nbBonnesReponses === lignes.length,
    feedback,
    score: { nbBonnesReponses, nbReponses: lignes.length },
  }
}
