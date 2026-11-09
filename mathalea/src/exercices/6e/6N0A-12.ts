import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Multiplier deux entiers grâce à la distributivité'
export const dateDePublication = '10/01/2026'
// export const dateDeModifImportante = '04/01/2025'
export const interactifReady = true

/**
 * Développer des expressions de simple distributivité à l'aide d'un tableau de  multiplication
 * @author Jean-claude Lhote
 */

export const uuid = 'de189'

export const refs = {
  'fr-fr': ['6N0A-12'],
  'fr-ch': ['9R1NO6D-5', '9R2NO6D-5', '9R3NO6D-5'],
}
export default class TableSimpleDistributivite extends Exercice {
  constructor() {
    super()

    this.spacing = context.isHtml ? 1 : 2
    this.spacingCorr = context.isHtml ? 1 : 2
    this.nbQuestions = 4

    this.exoCustomResultat = true
    this.besoinFormulaireTexte = [
      'Nombre de chiffres du second facteur',
      'Nombres de 2 à 4 séparés par des tirets',
    ]
    this.sup = '3'
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.answers = {}
    this.consigne =
      this.nbQuestions > 1
        ? 'Dans chaque cas, compléter les tables de multiplication puis écrire le résultat de la multiplication.'
        : 'Compléter la table de multiplication puis écrire le résultat de la multiplication.'
    const nbChiffresSecondFacteur = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 2,
      max: 4,
      melange: 0,
      defaut: 3,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nbChiffres = nbChiffresSecondFacteur[i]

      const chiffres = shuffle(rangeMinMax(1, 9)).slice(0, nbChiffres)
      const a = randint(2, 9)
      const produits = [
        chiffres[0] || 0,
        chiffres[1] || 0,
        chiffres[2] || 0,
        chiffres[3] || 0,
      ]
        .map((x) => x * Math.pow(10, chiffres.indexOf(x)))
        .reverse()
        .filter((x) => x !== 0)
      const b = produits.reduce((acc, val) => acc + val, 0)
      let texte = ''
      let texteCorr = ''

      let tableau: TableauData = {
        entetesCol: [],
        entetesLgn: [],
        contenu: [],
        L1C1txt: '',
        L1C2txt: '',
        L1C3txt: '',
        L1C4txt: '',
      }

      this.autoCorrection[2 * i] = {}
      this.autoCorrection[2 * i + 1] = {}

      texte =
        `$${lettreDepuisChiffre(i + 1)} = ${choice([true, false]) ? `${a}\\times ${texNombre(b)}` : `${texNombre(b)}\\times ${a}`}=$` +
        ajouteChampTexteMathLive(this, 2 * i + 1, KeyboardType.clavierDeBase)
      texte += '<br><br>'
      texteCorr = texte
      // developpements = faitDeveloppement(a1, a0, b, c)
      tableau = faitTableau(a, produits)
      // texte += context.isHtml ? '<br>' : '\\par\\medskip'

      if (this.interactif) {
        const tableauVide = AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          tableau.entetesCol,
          tableau.entetesLgn,
          produits.map(() => ''),
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
          2 * i,
          false,
          { L0C0: 'red' },
        )
      }

      texteCorr += tableauColonneLigne(
        tableau.entetesCol,
        tableau.entetesLgn,
        produits.map((x) => miseEnEvidence(texNombre(a * x, 0))),
        1,
        true,
        this.numeroExercice,
        2 * i,
        false,
        { L0C0: 'red' },
      )

      texteCorr += `<br><br>$${lettreDepuisChiffre(i + 1)} =${produits.map((x) => texNombre(a * x, 0)).join('+')} =${miseEnEvidence(texNombre(a * b))}$`
      const champs = produits.map((x, index) => [
        `L1C${index + 1}`,
        { value: texNombre(a * x, 0) },
      ])
      handleAnswers(this, 2 * i, {
        bareme: toutPourUnPoint,
        ...Object.fromEntries(champs),
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: (a * b).toString(),
          options: {
            sansTimes: true,
          },
        },
      })

      if (this.questionJamaisPosee(i, a, b)) {
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
  L1C2txt: string
  L1C3txt: string
  L1C4txt?: string
}

function faitTableau(a: number, chiffres: number[]): TableauData {
  const entetesCol: string[] = ['\\phantom{A.}\\times\\phantom{E.}']
  const chiffresNonNuls = chiffres.filter((x) => x !== 0)
  const nbChiffres = chiffresNonNuls.length
  for (let i = 0; i < chiffresNonNuls.length; i++) {
    entetesCol.push(texNombre(chiffres[i], 0))
  }
  const tableau: TableauData = {
    entetesCol,
    entetesLgn: [texNombre(a, 0)],
    contenu: chiffresNonNuls.map((x) => '\\phantom{E.}'),
    L1C1txt: texNombre(chiffres[0] * a, 0),
    L1C2txt: texNombre(chiffres[1] * a, 0),
    L1C3txt: nbChiffres > 2 ? texNombre(chiffres[2] * a, 0) : '',
    L1C4txt: nbChiffres > 3 ? texNombre(chiffres[3] * a, 0) : '',
  }
  return tableau
}
