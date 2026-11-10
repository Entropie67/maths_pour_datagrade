import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer une limite avec le théorème de comparaison ou des gendarmes'
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = '5db0b'
export const refs = {
  'fr-fr': ['TSA1-25', 'TCA1-15'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'plusCarre'
  | 'plusFraction'
  | 'plusRacine'
  | 'moinsCarre'
  | 'moinsFraction'
  | 'moinsRacine'
  | 'gendarmesCosinus'
  | 'gendarmesSinus'
  | 'gendarmesAlternee'

type DonneesQuestion = {
  expression: string
  comparaison: string
  suiteReference: string
  limiteReference: '+\\infty' | '-\\infty' | '0'
  reponse: '+\\infty' | '-\\infty' | '0'
  justificationPositivite: string
  correctionGendarmes?: string
}

/**
 * Limites de suites obtenues par le théorème de comparaison.
 * @author Stéphane Guyon
 */
export default class LimitesParComparaison extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Théorème de comparaison\n2 : Théorème des gendarmes\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'

    const typesComparaison: TypeQuestion[] = [
      'plusCarre',
      'plusFraction',
      'plusRacine',
      'moinsCarre',
      'moinsFraction',
      'moinsRacine',
    ]
    const typesGendarmes: TypeQuestion[] = [
      'gendarmesCosinus',
      'gendarmesSinus',
      'gendarmesAlternee',
    ]
    const typesDisponibles =
      this.sup === 1
        ? typesComparaison
        : this.sup === 2
          ? typesGendarmes
          : [...typesComparaison, ...typesGendarmes]
    const typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const a = randint(1, 5)
      const b = randint(-5, 5, 0)
      const c = randint(-7, 7)
      const d = randint(1, 9)
      const affine = reduireAxPlusB(b, c, 'n')
      const carre = '\\left(' + affine + '\\right)^2'
      const fractionPositive = '\\dfrac{' + carre + '}{n^2+' + d + '}'
      const racinePositive = '\\sqrt{n+' + d + '}'
      let donnees: DonneesQuestion

      switch (type) {
        case 'plusCarre': {
          const reference = rienSi1(a) + 'n'
          donnees = {
            expression: reference + '+' + carre,
            comparaison: 'u_n\\geqslant ' + reference,
            suiteReference: reference,
            limiteReference: '+\\infty',
            reponse: '+\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, $' + carre + '\\geqslant 0$.',
          }
          break
        }
        case 'plusFraction': {
          const reference = rienSi1(a) + 'n^2'
          donnees = {
            expression: reference + '+' + fractionPositive,
            comparaison: 'u_n\\geqslant ' + reference,
            suiteReference: reference,
            limiteReference: '+\\infty',
            reponse: '+\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, le numérateur est un carré et $n^2+' +
              d +
              '>0$, donc $' +
              fractionPositive +
              '\\geqslant 0$.',
          }
          break
        }
        case 'plusRacine':
          donnees = {
            expression: '\\mathrm{e}^n+' + racinePositive,
            comparaison: 'u_n\\geqslant \\mathrm{e}^n',
            suiteReference: '\\mathrm{e}^n',
            limiteReference: '+\\infty',
            reponse: '+\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, $n+' +
              d +
              '>0$, donc $' +
              racinePositive +
              '\\geqslant 0$.',
          }
          break
        case 'moinsCarre': {
          const reference = '-' + rienSi1(a) + 'n'
          donnees = {
            expression: reference + '-' + carre,
            comparaison: 'u_n\\leqslant ' + reference,
            suiteReference: reference,
            limiteReference: '-\\infty',
            reponse: '-\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, $' + carre + '\\geqslant 0$.',
          }
          break
        }
        case 'moinsFraction': {
          const reference = '-' + rienSi1(a) + 'n^2'
          donnees = {
            expression: reference + '-' + fractionPositive,
            comparaison: 'u_n\\leqslant ' + reference,
            suiteReference: reference,
            limiteReference: '-\\infty',
            reponse: '-\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, le numérateur est un carré et $n^2+' +
              d +
              '>0$, donc $' +
              fractionPositive +
              '\\geqslant 0$.',
          }
          break
        }
        case 'moinsRacine':
          donnees = {
            expression: '-\\mathrm{e}^n-' + racinePositive,
            comparaison: 'u_n\\leqslant -\\mathrm{e}^n',
            suiteReference: '-\\mathrm{e}^n',
            limiteReference: '-\\infty',
            reponse: '-\\infty',
            justificationPositivite:
              'Pour tout entier naturel $n$, $n+' +
              d +
              '>0$, donc $' +
              racinePositive +
              '\\geqslant 0$.',
          }
          break
        case 'gendarmesCosinus': {
          const majorant = `\\dfrac{${a}}{n+1}`
          const minorant = `-\\dfrac{${a}}{n+1}`
          donnees = {
            expression: `\\dfrac{${rienSi1(a)}\\cos(n)}{n+1}`,
            comparaison: '',
            suiteReference: '',
            limiteReference: '0',
            reponse: '0',
            justificationPositivite: '',
            correctionGendarmes: `Soit $n\\in\\mathbb N$, on a :<br>$\\begin{aligned}-1&\\leqslant \\cos(n)\\leqslant 1\\\\\\iff -${a}&\\leqslant ${rienSi1(a)}\\cos(n)\\leqslant ${a}&&\\text{car }${a}>0\\\\\\iff ${minorant}&\\leqslant u_n\\leqslant ${majorant}&&\\text{car }n+1>0.\\end{aligned}$<br>Or $\\displaystyle \\lim_{n\\to+\\infty}${minorant}=0$ et $\\displaystyle \\lim_{n\\to+\\infty}${majorant}=0$.<br>D’après le théorème des gendarmes, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'gendarmesSinus': {
          const majorant = `\\dfrac{${a}}{n^2+1}`
          const minorant = `-\\dfrac{${a}}{n^2+1}`
          donnees = {
            expression: `\\dfrac{${rienSi1(a)}\\sin(n)}{n^2+1}`,
            comparaison: '',
            suiteReference: '',
            limiteReference: '0',
            reponse: '0',
            justificationPositivite: '',
            correctionGendarmes: `Soit $n\\in\\mathbb N$, on a :<br>$\\begin{aligned}-1&\\leqslant \\sin(n)\\leqslant 1\\\\\\iff -${a}&\\leqslant ${rienSi1(a)}\\sin(n)\\leqslant ${a}&&\\text{car }${a}>0\\\\\\iff ${minorant}&\\leqslant u_n\\leqslant ${majorant}&&\\text{car }n^2+1>0.\\end{aligned}$<br>Or $\\displaystyle \\lim_{n\\to+\\infty}${minorant}=0$ et $\\displaystyle \\lim_{n\\to+\\infty}${majorant}=0$.<br>D’après le théorème des gendarmes, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'gendarmesAlternee': {
          const majorant = `\\dfrac{${a}}{\\sqrt{n+1}}`
          const minorant = `-\\dfrac{${a}}{\\sqrt{n+1}}`
          donnees = {
            expression: `\\dfrac{${rienSi1(a)}(-1)^n}{\\sqrt{n+1}}`,
            comparaison: '',
            suiteReference: '',
            limiteReference: '0',
            reponse: '0',
            justificationPositivite: '',
            correctionGendarmes: `Soit $n\\in\\mathbb N$, on a :<br>$\\begin{aligned}-1&\\leqslant (-1)^n\\leqslant 1\\\\\\iff -${a}&\\leqslant ${rienSi1(a)}(-1)^n\\leqslant ${a}&&\\text{car }${a}>0\\\\\\iff ${minorant}&\\leqslant u_n\\leqslant ${majorant}&&\\text{car }\\sqrt{n+1}>0.\\end{aligned}$<br>Or $\\displaystyle \\lim_{n\\to+\\infty}${minorant}=0$ et $\\displaystyle \\lim_{n\\to+\\infty}${majorant}=0$.<br>D’après le théorème des gendarmes, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
      }

      let texte =
        'La suite $(u_n)$ est définie, pour tout entier naturel $n$, par :<br>$u_n=' +
        donnees.expression +
        '$.'
      if (this.interactif) {
        texte +=
          '<br>$\\displaystyle \\lim_{n\\to+\\infty}u_n=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierLectureLimites)
      }

      let texteCorr = donnees.correctionGendarmes ?? ''
      if (donnees.correctionGendarmes == null) {
        texteCorr = donnees.justificationPositivite + '<br>'
        texteCorr +=
          'On en déduit que, pour tout entier naturel $n$, $' +
          donnees.comparaison +
          '$.<br>'
        texteCorr +=
          'Or $\\displaystyle \\lim_{n\\to+\\infty}' +
          donnees.suiteReference +
          '=' +
          donnees.limiteReference +
          '$.<br>'
        texteCorr +=
          'D’après le théorème de comparaison, $\\displaystyle \\lim_{n\\to+\\infty}u_n=' +
          miseEnEvidence(donnees.reponse) +
          '$.'
      }

      if (this.questionJamaisPosee(i, donnees.expression)) {
        handleAnswers(this, i, { reponse: { value: donnees.reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
