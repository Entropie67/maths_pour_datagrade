import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { getDigitFromNumber } from '../6e/_ExerciceConversionsLongueurs'
import Exercice from '../Exercice'

export const titre = 'Convertir des volumes ou des capacités'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDeModifImportante = '05/06/2023'

/**
 * Conversions d'unités de volumes vers les unités de capacité ou inversement.
 *
 * Dans la correction, on passe systématiquement par l'équivalence dm3 = L
 *
 * * 1 : Unités de volume vers litres
 * * 2 : Litres vers unités de volume
 * * 3 : Un mélange de toutes les conversions
 * * Paramètre supplémentaire : utiliser des nombres décimaux (par défaut tous les nombres sont entiers)
 * @author Rémi Angot

 */
export const uuid = 'f4d29'

export const refs = {
  'fr-fr': ['5G2D-2', '3AutoM04-2'],
  'fr-2016': ['6M31-2', '5M22-1', '3AutoG06-2'],
  'fr-ch': ['10CTGM4A-2', '10LCGM4A-2', '10LSGM4A-2', 'PRQMG04C-2'],
}
export default class UnitesDeVolumesEtDeCapacite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Unités de volume vers litres\n2 : Litres vers unités de volume\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.besoinFormulaire3Numerique = [
      'Avec tableau',
      4,
      "Uniquement dans l'énoncé\nUniquement dans la correction\nDans l'énoncé et dans la correction\nNi dans l'enoncé, ni dans la correction",
    ]

    this.sup = 1 // Niveau de difficulté de l'exercice
    this.sup2 = false // Avec des nombres décimaux ou pas
    this.sup3 = 4
    this.sup4 = 2
    this.spacing = 2
    this.nbQuestions = 8
  }

  nouvelleVersion() {
    this.introduction =
      this.sup3 === 1 || this.sup3 === 3
        ? `Vous pourrez vous aider de ce tableau${sp()}:<br><br>` +
          buildTab(0, '', 0, '', this.nbQuestions, false) +
          '<br><br>'
        : ''

    if (!(context.vue === 'diap'))
      this.besoinFormulaire4Numerique = [
        'Exercice interactif',
        2,
        '1 : QCM\n2 : Numérique',
      ]

    Decimal.set({ toExpNeg: -10 }) // Pour permettre aux petits nombres de s'afficher sans puissances de 10.

    this.consigne =
      this.interactif && this.sup4 === 1
        ? 'Cocher la bonne réponse.'
        : 'Compléter.'
    let listeTypeDeQuestions
    if (this.sup === 1) {
      listeTypeDeQuestions = combinaisonListes(
        ['dam3toL', 'm3toL', 'dm3toL', 'cm3toL'],
        this.nbQuestions,
      )
    } else if (this.sup === 2) {
      listeTypeDeQuestions = combinaisonListes(
        ['Ltodm3', 'Ltocm3', 'Ltom3'],
        this.nbQuestions,
      )
    } else {
      listeTypeDeQuestions = combinaisonListes(
        [
          'dam3toL',
          'm3toL',
          'dm3toL',
          'cm3toL',
          'mm3toL',
          'Ltodm3',
          'Ltocm3',
          'Ltom3',
        ],
        this.nbQuestions,
      )
    }
    let listeDeN = []
    let resultat, resultatFaux
    if (this.sup2) {
      listeDeN = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    } else {
      listeDeN = combinaisonListes([1, 2, 3, 4, 5, 6], this.nbQuestions)
    }
    for (
      let i = 0, n, uniteFinale, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (this.sup2) {
        switch (listeDeN[i]) {
          case 1:
            n = new Decimal(randint(2, 9)).div(10)
            break
          case 2:
            n = new Decimal(randint(11, 99)).div(10)
            break
          case 3:
            n = new Decimal(randint(1, 9)).div(10).add(randint(1, 9) * 10)
            break
          case 4:
          default:
            n = new Decimal(
              randint(11, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]),
            ).div(100)
            break
        }
      } else {
        switch (listeDeN[i]) {
          case 1:
            n = new Decimal(randint(2, 9))
            break
          case 2:
            n = new Decimal(randint(11, 99))
            break
          case 3:
            n = new Decimal(randint(1, 9) * 10)
            break
          case 4:
            n = new Decimal(randint(1, 9) * 100)
            break
          case 5:
            n = new Decimal(randint(11, 99) * 100)
            break
          case 6:
          default:
            n = new Decimal(randint(1, 9) * 1000)
            break
        }
      }
      switch (listeTypeDeQuestions[i]) {
        case 'dam3toL':
          texte = `$${texNombre(n, 3)}${sp()}\\text{dam}^3=\\dotfill${sp()}\\text{L}$`
          resultat = n.mul(1000000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{dam}^3=${texNombre(n, 3)}\\times1${sp()}000\\times1${sp()}000${sp()}\\text{dm}^3=${miseEnEvidence(texNombre(resultat, 0))}$ ${texteEnCouleurEtGras('L')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(
                  n.toNumber(),
                  'dam',
                  resultat.toNumber(),
                  'dm',
                  2,
                  true,
                )

          break
        case 'm3toL':
          texte = `$${texNombre(n, 3)}${sp()}\\text{m}^3=\\dotfill${sp()}\\text{L}$`
          resultat = n.mul(1000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{m}^3=${texNombre(n, 3)}\\times1${sp()}000${sp()}\\text{dm}^3=${miseEnEvidence(texNombre(resultat, 0))}$ ${texteEnCouleurEtGras('L')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'm', resultat.toNumber(), 'dm', 2, true)
          break
        case 'dm3toL':
          texte = `$${texNombre(n, 3)}${sp()}\\text{dm}^3=\\dotfill${sp()}\\text{L}$`
          resultat = n.mul(1)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{dm}^3=${miseEnEvidence(texNombre(resultat, 3))}$ ${texteEnCouleurEtGras('L')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'dm', resultat.toNumber(), 'dm', 2, true)
          break
        case 'cm3toL':
          texte = `$${texNombre(n, 3)}${sp()}\\text{cm}^3=\\dotfill${sp()}\\text{L}$`
          resultat = n.div(1000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{cm}^3=${texNombre(n, 3)}\\div 1${sp()}000${sp()}\\text{dm}^3=${miseEnEvidence(texNombre(resultat, 6))}$ ${texteEnCouleurEtGras('L')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'cm', resultat.toNumber(), 'dm', 2, true)
          break
        case 'mm3toL':
          texte = `$${texNombre(n, 3)}${sp()}\\text{mm}^3=\\dotfill${sp()}\\text{L}$`
          resultat = n.div(1000000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{mm}^3=${texNombre(n, 3)}\\div1${sp()}000\\div 1${sp()}000${sp()}\\text{dm}^3=${miseEnEvidence(texNombre(resultat, 9))}$ ${texteEnCouleurEtGras('L')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'mm', resultat.toNumber(), 'dm', 2, true)
          break
        case 'Ltodm3':
          texte = `$${texNombre(n, 3)}${sp()}\\text{L}=\\dotfill${sp()}\\text{dm}^3$`
          resultat = n.mul(1)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{L}=${miseEnEvidence(texNombre(resultat, 3))}$ ${texteEnCouleurEtGras('dm$^3$')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'dm', resultat.toNumber(), 'dm', 2, true)
          break
        case 'Ltocm3':
          texte = `$${texNombre(n, 3)}${sp()}\\text{L}=\\dotfill${sp()}\\text{cm}^3$`
          resultat = n.mul(1000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{L}=${texNombre(n, 0)}${sp()}\\text{dm}^3=${texNombre(n, 0)}\\times1${sp()}000${sp()}\\text{cm}^3=${miseEnEvidence(texNombre(n.mul(1000)))}$ ${texteEnCouleurEtGras('cm$^3$')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'dm', resultat.toNumber(), 'cm', 2, true)
          break
        case 'Ltom3':
        default:
          texte = `$${texNombre(n, 3)}${sp()}\\text{L}=\\dotfill${sp()}\\text{m}^3$`
          resultat = n.div(1000)
          texteCorr = `$${texNombre(n, 3)}${sp()}\\text{L}=${texNombre(n, 3)}${sp()}\\text{dm}^3=${texNombre(n, 3)}\\div1${sp()}000${sp()}\\text{m}^3=${miseEnEvidence(texNombre(resultat, 6))}$ ${texteEnCouleurEtGras('m$^3$')}`
          texteCorr +=
            this.sup3 === 1 || this.sup3 === 4
              ? ''
              : '<br>' +
                buildTab(n.toNumber(), 'dm', resultat.toNumber(), 'm', 2, true)
          break
      }

      this.autoCorrection[i] ??= {}
      this.autoCorrection[i].enonce = `${texte}\n`
      resultatFaux = combinaisonListes(
        [
          resultat.div(1000000),
          resultat.div(10000),
          resultat.div(1000),
          resultat.mul(1000000),
          resultat.mul(10000),
          resultat.mul(1000),
        ],
        6,
      )
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(resultat, 20)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(resultatFaux[0], 20)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultatFaux[1], 20)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultatFaux[2], 20)}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(resultatFaux[3], 20)}$`,
          statut: false,
        },
      ]

      const props = propositionsQcm(this, i)
      if (this.interactif && this.sup4 !== 2) {
        texte += props.texte
      } else if (this.interactif && this.sup4 === 2) {
        uniteFinale = listeTypeDeQuestions[i].split('to')[1]
        uniteFinale =
          uniteFinale === 'L'
            ? sp() + '$\\text{L}$'
            : sp() + `$ \\text{${uniteFinale.split('3')[0]}}^3$`
        texte =
          texte.split('\\dotfill')[0] +
          `$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteApres: uniteFinale,
          })}`
        // `propositionsQcm()` a positionné `formatInteractif` à 'mathalea-qcm' ;
        // en mode numérique il faut le forcer à 'mathlive' sinon la saisie de
        // l'élève n'est pas vérifiée (réponse considérée manquante).
        handleAnswers(
          this,
          i,
          { reponse: { value: resultat } },
          { formatInteractif: 'mathlive' },
        )
      }

      /* if ((this.sup3 === 1 || this.sup3 === 3) && i === this.nbQuestions - 1) {
        texte +=
          '<br><br>' +
          buildTab(0, '', 0, '', Math.min(8, this.nbQuestions), true)
      }
      */
      if (this.questionJamaisPosee(i, uniteFinale ?? 'm', resultat)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.vue === 'diap') {
          texte = texte.replace('= \\dotfill', '\\text{ en }')
        }
        if (context.isHtml) {
          texte = texte.replace(
            '\\dotfill',
            '$\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$',
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function buildTab(
  a: number,
  uniteA: string,
  r: number,
  uniteR: string,
  ligne = 2,
  correction = false,
) {
  const tabRep = function (nbre: number, uniteNbre: string): string[] {
    const res: string[] = []
    // 18 columns: hm³(0-2), dam³(3-5), m³(6-8), dm³(9-11), cm³(12-14), mm³(15-17)
    for (let ee = 0; ee < 18; ee++) res.push('')

    // Base index for units position (3rd column of each group)
    // hm: 2, dam: 5, m: 8, dm: 11, cm: 14, mm: 17
    const uniteBases: Record<string, number> = {
      hm: 2,
      dam: 5,
      m: 8,
      dm: 11,
      cm: 14,
      mm: 17,
    }

    const unite = uniteNbre.replaceAll(' ', '')
    const base = uniteBases[unite]
    if (base === undefined) return res

    for (let i = 0; i < 18; i++) {
      const digit = getDigitFromNumber(String(nbre), 10 ** (base - i))
      const isUnitsPosition = base - i === 0
      const hasDecimal = new Decimal(nbre).decimalPlaces() !== 0

      if (digit !== '') {
        res[i] =
          (isUnitsPosition ? '\\color{red}{' : '') +
          digit +
          (isUnitsPosition ? (hasDecimal ? ',}' : '}') : '')
      }
    }
    return res
  }

  const createTab = function (
    aT: string[],
    rT: string[],
    _first: number,
    _end: number,
    ligne: number,
    correction = false,
  ) {
    const phantom = '\\phantom{\\text{d}^3}'
    const volumeUnits = [
      '\\text{hm}^3',
      '\\text{dam}^3',
      '\\text{m}^3',
      '\\text{dm}^3',
      '\\text{cm}^3',
      '\\text{mm}^3',
    ]
    const capacityUnits = [
      '\\text{hL}',
      '\\text{daL}',
      '\\text{L}',
      '\\text{dL}',
      '\\text{cL}',
      '\\text{mL}',
    ]

    // Build column specification: ||c|c|c|| for each group of 3
    let texte =
      '$\\begin{array}{||c|c|c||c|c|c||c|c|c||c|c|c||c|c|c||c|c|c||}\n'
    texte += '\\hline\n'

    // First header row: volume units (in 3rd column of each group)
    texte += '\\rule{0pt}{3ex}'
    for (let i = 0; i < 6; i++) {
      texte += `${phantom} & ${phantom} & ${volumeUnits[i]}`
      texte += i < 5 ? ' & ' : ' \\\\\n'
    }

    // Second header row: capacity units (only in dm³ and cm³ groups)
    for (let i = 0; i < 18; i++) {
      if (i >= 9 && i <= 14) {
        // Capacity units in columns 9-14 (dm³ and cm³ groups)
        texte += capacityUnits[i - 9]
      } else {
        texte += phantom
      }
      texte += i < 17 ? ' & ' : ' \\\\\n'
    }
    texte += '\\hline\n'

    // Data rows
    if (correction) {
      // Row for input number (aT)
      for (let i = 0; i < 18; i++) {
        texte += aT[i] || ''
        texte += i < 17 ? ' & ' : ' \\\\\n'
      }
      // Row for result number (rT)
      for (let i = 0; i < 18; i++) {
        texte += rT[i] || ''
        texte += i < 17 ? ' & ' : ' \\\\\n'
      }
      texte += '\\hline\n'
    } else {
      // Empty rows for students to fill in
      for (let k = 0; k < ligne; k++) {
        texte += '\\rule{0pt}{4.5ex}'
        for (let i = 0; i < 18; i++) {
          texte += ''
          texte += i < 17 ? ' & ' : ' \\\\\n'
        }
        texte += '\\hline\n'
      }
    }
    texte += '\\end{array}$'
    return texte
  }
  const aTab = tabRep(a, uniteA)
  const rTab = tabRep(r, uniteR)
  const texte = createTab(aTab, rTab, 0, 6, ligne, correction)
  return texte
}
