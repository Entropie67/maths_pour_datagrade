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
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Compléter une table de simple distributivité'
export const dateDePublication = '29/12/2025'
// export const dateDeModifImportante = '04/01/2025'
export const interactifReady = true

/**
 * Développer des expressions de simple distributivité à l'aide d'un tableau de  multiplication
 * @author Olivier Mimeau
 */

export const uuid = 'de188'

export const refs = {
  'fr-fr': ['3L11-17'],
  'fr-ch': ['10LCFA4E-5', '10LSFA4E-5', 'PRQAL03C-5'],
}
export default class TableSimpleDistributivite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      `Nombres séparés par des tirets :\n
1 : a(bx+c)\n
2 : ax(bx+c)\n`,
    ]
    this.besoinFormulaire2Texte = [
      'Choix pour a',
      `Nombres séparés par des tirets :\n
1 : 1<a<10\n
2 : a=1 si forme ax(bx+c)\n
3 : a<0\n
4: Mélange\n`,
    ]

    this.besoinFormulaire3Texte = [
      'Choix pour b',
      `Nombres séparés par des tirets :\n
1 : 1<b<10\n
2 : b=1\n
3 : b<0\n
4: Mélange\n`,
    ]
    this.besoinFormulaire4Texte = [
      'pour c',
      `Nombres séparés par des tirets :\n
1 : 0<c<10\n
2 : c<0\n
3: Mélange\n`,
    ]

    this.spacing = context.isHtml ? 1 : 2
    this.spacingCorr = context.isHtml ? 1 : 2
    this.nbQuestions = 4
    this.sup = '1-2'
    this.sup2 = '1'
    this.sup3 = '1'
    this.sup4 = '3'
    this.listeAvecNumerotation = false
    this.exoCustomResultat = true
  }

  nouvelleVersion() {
    this.answers = {}
    this.consigne =
      this.nbQuestions > 1
        ? 'Dans chaque cas, compléter les tables de multiplication puis écrire le développement obtenu.'
        : 'Compléter la table de multiplication puis écrire le développement obtenu.'

    const listeTypeDeQuestions = gereFormulairesTextes(
      this.sup,
      1,
      2,
      5,
      5,
      this.nbQuestions,
    )
    const listeChoixa = gereFormulairesTextes(
      this.sup2,
      1,
      3,
      4,
      4,
      this.nbQuestions,
    )
    const listeChoixb = gereFormulairesTextes(
      this.sup3,
      1,
      3,
      4,
      4,
      this.nbQuestions,
    )
    const listeChoixc = gereFormulairesTextes(
      this.sup4,
      1,
      2,
      3,
      3,
      this.nbQuestions,
    )
    for (
      let i = 0, cpt = 0, a1, a0, b, c, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''

      let tableau: TableauData = {
        entetesCol: [],
        entetesLgn: [],
        contenu: [],
        L1C1txt: '',
        L1C2txt: [],
      }
      // a1x+a0
      a1 = listeChoixa[i] === 2 ? 1 : randint(2, 9)
      a0 = randint(2, 9)
      b =
        listeChoixb[i] === 2
          ? 1
          : listeChoixb[i] === 3
            ? -randint(1, 9, [a1, a0])
            : randint(2, 9, [a1, a0])
      c = randint(1, 9, [a0, a1])
      if (listeChoixc[i] === 2) {
        c = -c
      }
      switch (typesDeQuestions) {
        case 2: // ax(bx+c)
          a0 = 0
          a1 = listeChoixa[i] === 3 ? -a1 : a1
          break
        case 1: // a(bx+c)
        default:
          a1 = 0
          a0 = listeChoixa[i] === 3 ? -a0 : a0
          break
      }
      this.autoCorrection[2 * i] = {}
      this.autoCorrection[2 * i + 1] = {}

      texte = `$${lettreDepuisChiffre(i + 1)} = ${reduireAxPlusB(a1, a0)}(${reduireAxPlusB(b, c)})$`
      texte += '<br><br>'
      texteCorr = texte
      // developpements = faitDeveloppement(a1, a0, b, c)
      const dvpt = reduirePolynomeDegre3(0, a1 * b, a1 * c + a0 * b, a0 * c)
      tableau = faitTableau(a1, a0, b, c)
      // texte += context.isHtml ? '<br>' : '\\par\\medskip'

      if (this.interactif) {
        const tableauVide = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          tableau.entetesCol,
          tableau.entetesLgn,
          ['', ''],
        )
        // const NumEx = this.numeroExercice ? this.numeroExercice : 1
        // OM:  fonctionne pas
        const tabMathlive = AddTabDbleEntryMathlive.create(
          this.numeroExercice ?? 0,
          2 * i,
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
          1.7,
          true,
          this.numeroExercice,
          i,
          false,
          { L0C0: 'red' },
        )
      }

      texte += '<br><br> Développement réduit : '
      texte += ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        KeyboardType.lyceeClassique,
      )
      texte += `<br><br>`
      texteCorr += tableauColonneLigne(
        tableau.entetesCol,
        tableau.entetesLgn,
        [
          miseEnEvidence(reduirePolynomeDegre3(0, a1 * b, a0 * b, 0)),
          miseEnEvidence(reduireAxPlusB(a1 * c, a0 * c)),
        ],
        1,
        true,
        this.numeroExercice,
        i,
        false,
        { L0C0: 'red' },
      )

      texteCorr += `<br><br>Développement réduit : $${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(dvpt)}$`

      handleAnswers(this, 2 * i, {
        bareme: toutPourUnPoint,
        L1C1: {
          value: tableau.L1C1txt,
          options: {
            calculFormel: true,
          },
        },
        L1C2: {
          value: tableau.L1C2txt,
          options: {
            calculFormel: true,
          },
        },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: dvpt,
          options: {
            sansTimes: true,
          },
        },
      })

      if (this.questionJamaisPosee(i, a1, a0, b, c, typesDeQuestions)) {
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

interface TableauData {
  entetesCol: string[]
  entetesLgn: string[]
  contenu: string[]
  L1C1txt: string
  L1C2txt: string[]
}

function faitTableau(a: number, b: number, c: number, d: number): TableauData {
  // ici (ax+b)(cx+d) avec soit a=0 soit b=0
  const tableau: TableauData = {
    entetesCol: [
      '\\phantom{A.}\\times\\phantom{E.}',
      reduireAxPlusB(c, 0),
      `${d}`,
    ],
    entetesLgn: [reduireAxPlusB(a, b)],
    contenu: [`\\phantom{A.xE.}`, `\\phantom{A.xE.}`],
    L1C1txt: reduirePolynomeDegre3(0, a * c, b * c, 0), // `${a}x\\times${c}x+${b}\\times${c}x`, // reduirePolynomeDegre3(0, a * c, b * c, 0),
    L1C2txt: [reduireAxPlusB(a * d, b * d), `${a}x\\times${d}+${b}\\times${d}`], // `${a}x\\times${d}+${b}\\times${d}`, // reduireAxPlusB(a * d, b * d),
  }
  return tableau
}

function gereFormulairesTextes(
  gSaisie: string,
  gMin: number,
  gMx: number,
  gMelange: number,
  gDefaut: number,
  gNbQuestions: number,
): (string | number)[] {
  const typesDidactiquesDisponibles = gestionnaireFormulaireTexte({
    saisie: gSaisie,
    min: gMin,
    max: gMx,
    melange: gMelange,
    defaut: gDefaut,
    nbQuestions: gNbQuestions,
  })
  const listeTypeDidactiques = combinaisonListes(
    typesDidactiquesDisponibles,
    gNbQuestions,
  )
  return listeTypeDidactiques
}
