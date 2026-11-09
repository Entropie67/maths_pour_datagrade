import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Compléter une table de double distributivité'
export const dateDePublication = '23/02/2023'
export const dateDeModifImportante = '29/12/2025'
export const interactifReady = true

/**
 * Développer des expressions de double distributivité à l'aide d'un tableau de  multiplication
 * @author Sébastien LOZANO ; Olivier Mimeau (passage TS - factorisation)
 */

export const uuid = 'c8403'

export const refs = {
  'fr-fr': ['3L11-10'],
  'fr-ch': ['11LCFA3F-3', '11LSFA3F-3', 'PRQAL03D-3'],
}
export default class TableDoubleDistributivite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      ' 1 : (x+a)(x+b) et (ax+b)(cx+d)\n 2 : (ax-b)(cx+d) et (ax-b)(cx-d)\n 3 : Mélange',
    ]

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 5
    this.sup = 1

    this.listeAvecNumerotation = false
    this.exoCustomResultat = true
  }

  nouvelleVersion() {
    this.answers = {}
    this.consigne =
      this.nbQuestions > 1
        ? 'Dans chaque cas, compléter les tables de multiplication, écrire le développement obtenu et le réduire.'
        : 'Compléter la table de multiplication, écrire le développement obtenu et le réduire.'

    let typesDeQuestionsDisponibles = [1, 2]
    if (this.sup === 2) {
      typesDeQuestionsDisponibles = [3, 4]
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const hauteurLigne = 1.7
    for (
      let i = 0, cpt = 0, a, b, c, d, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      let developpements: Developpements = {
        termesRectangles: [],
        eclate: '',
        reduit: '',
      }
      let tableau: TableauData = {
        entetesCol: [],
        entetesLgn: [],
        contenu: [],
        L1C1txt: '',
        L1C2txt: '',
        L2C1txt: '',
        L2C2nbr: 0,
      }

      a = randint(2, 9)
      b = randint(2, 9)
      c = randint(2, 9, [a])
      d = randint(2, 9, [b])

      this.autoCorrection[3 * i] = {}
      this.autoCorrection[3 * i + 1] = {}
      this.autoCorrection[3 * i + 2] = {}
      switch (typesDeQuestions) {
        case 1: // (x+b)(x+d)
          a = 1
          b = randint(2, 10)
          c = 1
          d = randint(2, 12)
          break
        case 3: // (ax-b)(cx+d)
          b = -b
          break
        case 4: // (ax-b)(cx-d)
          b = -b
          d = -d
          break
        default:
          break
      }
      // reduireAxPlusB(c, 0)
      texte = `$${lettreDepuisChiffre(i + 1)} = (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$` // (${a}x+${b})(${c}x-${d})$`
      texteCorr = texte + '<br>'
      developpements = faitDeveloppement(a * c, a * d, b * c, b * d)
      tableau = faitTableau(a, b, c, d)
      texte += context.isHtml ? '<br>' : '\\par\\medskip'
      if (this.interactif) {
        const tableauVide = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          tableau.entetesCol,
          tableau.entetesLgn,
          ['', '', '', ''],
        )
        // const NumEx = this.numeroExercice ? this.numeroExercice : 1
        // OM:  fonctionne pas
        const tabMathlive = AddTabDbleEntryMathlive.create(
          this.numeroExercice ?? 0,
          3 * i,
          tableauVide,
          `tableauMathlive`, // ` ${KeyboardType.clavierDeBaseAvecVariable}`,
          true,
          { L0C0: 'red' },
        )
        texte += tabMathlive.output
      } else {
        texte += tableauColonneLigne(
          tableau.entetesCol,
          tableau.entetesLgn,
          tableau.contenu,
          hauteurLigne,
          true,
          this.numeroExercice,
          i,
          false,
          { L0C0: 'red' },
        )
      }
      texte += context.isHtml
        ? '<br> Développement : '
        : '\\par\\medskip Développement : '
      texte += ajouteChampTexteMathLive(
        this,
        3 * i + 1,
        KeyboardType.clavierFullOperations,
      )
      texte += context.isHtml
        ? '<br> Développement réduit : '
        : '\\par\\medskip Développement réduit: '
      texte += ajouteChampTexteMathLive(
        this,
        3 * i + 2,
        KeyboardType.clavierFullOperations,
      )
      // aucune gestion de la largeur de colonne ici
      texteCorr += tableauColonneLigne(
        tableau.entetesCol,
        tableau.entetesLgn,
        [
          tableau.L1C1txt,
          tableau.L1C2txt,
          tableau.L2C1txt,
          `${tableau.L2C2nbr}`,
        ],
        1.2,
        true,
        this.numeroExercice,
        i,
        false,
        { L0C0: 'red' },
      )

      texteCorr += `<br>Développement : $${lettreDepuisChiffre(i + 1)} = ${developpements.eclate}$`

      texteCorr += `<br>Développement réduit : $${lettreDepuisChiffre(i + 1)} = ${developpements.reduit}$`

      handleAnswers(this, 3 * i, {
        bareme: toutPourUnPoint,
        L1C1: { value: tableau.L1C1txt, options: { fonction: true } },
        L1C2: { value: tableau.L1C2txt, options: { fonction: true } },
        L2C1: { value: tableau.L2C1txt, options: { fonction: true } },
        L2C2: { value: tableau.L2C2nbr, options: { fonction: true } },
      })
      handleAnswers(this, 3 * i + 1, {
        reponse: { value: developpements.eclate, options: { fonction: true } },
      })
      const reponse = developpements.reduit
      handleAnswers(this, 3 * i + 2, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, a, b, c, d, typesDeQuestions)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}

interface Developpements {
  termesRectangles: number[]
  eclate: string
  reduit: string
}

interface TableauData {
  entetesCol: string[]
  entetesLgn: string[]
  contenu: string[]
  L1C1txt: string
  L1C2txt: string
  L2C1txt: string
  L2C2nbr: number
}

function faitDeveloppement(
  a: number,
  b: number,
  c: number,
  d: number,
): Developpements {
  const plusMoins = c >= 0 ? '+' : '-'
  const reponse = {
    termesRectangles: [a, b, c, d],
    eclate:
      reduirePolynomeDegre3(0, a, b, 0) +
      ` ${plusMoins} ` +
      reduireAxPlusB(Math.abs(c), d), // `${a}x^2+${b}x+${c}x+${d}`,
    reduit: reduirePolynomeDegre3(0, a, b + c, d), // `${a}x^2+${b + c}x+${d}`,
  }
  return reponse
}

function faitTableau(a: number, b: number, c: number, d: number): TableauData {
  // ici (ax+b)(cx+d)
  const tableau: TableauData = {
    entetesCol: [
      '\\phantom{A.}\\times\\phantom{B.}',
      reduireAxPlusB(c, 0),
      `${d}`,
    ],
    entetesLgn: [reduireAxPlusB(a, 0), `${b}`],
    contenu: [
      `\\phantom{ABxCD}`,
      `\\phantom{ABxCD}`,
      `\\phantom{${c}x}`,
      `\\phantom{${d}}`,
    ],
    L1C1txt: reduirePolynomeDegre3(0, a * c, 0, 0), // `${a * c}x^2`,
    L1C2txt: reduireAxPlusB(a * d, 0), // `${b * c}x`,
    L2C1txt: reduireAxPlusB(b * c, 0), // `${a * c}x`,
    L2C2nbr: b * d,
  }
  return tableau
}
