// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import {
  hasZeroMember,
  isEquation,
  isEquivalentEquation,
} from './equationChecks'
import { extractedRadicands } from './extractedRadicands'
import {
  coordinatesReduced,
  hasGroupedNumberSpacing,
  intervalBoundsReduced,
  isDecimalFraction,
  isFraction,
  isPowerForm,
  isScientificNotation,
  noTrigonometry,
  onlyDecimalNumbers,
} from './formAtoms'
import {
  fractionReducedFromExpected,
  noSquareRootInDenominator,
} from './fractionFormChecks'
import { isEqual } from './isEqual'
import {
  sameCoordinates,
  sameDuration,
  sameInterval,
  sameNumberList,
  sameNumberTuple,
  sameOrderedNumberList,
  sameWithUnit,
  valueInInterval,
} from './legacyDomainChecks'
import { noDecimal } from './noDecimal'
import { onlyIrreducibleFractions } from './onlyIrreducibleFractions'
import { sameIntegerProgressionSet } from './sameIntegerProgressionSet'
import { sameSet } from './sameSet'
import { stringEquals } from './stringEquals'

describe('checks heavy atoms', () => {
  describe('domain checks migrated from fonctionComparaison', () => {
    it('compares durations', () => {
      expect(all([sameDuration()])('90min', '1h30min')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameDuration({ unit: 'h' })])('90min', '1h30min'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('compares coordinates coordinate by coordinate', () => {
      expect(
        all([sameCoordinates()])('(\\frac{1}{2};3)', '(0.5;3)'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameCoordinates()])('(1;3-1)', '(1;2)')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameCoordinates()])('\\left(1;3-1\\right)', '(1;2)'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameCoordinates()])('(1;2;3)', '(1;2)')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Nombre de coordonnées différent',
      })
    })

    it('compares intervals and interval membership', () => {
      expect(all([sameInterval()])('[1;2]', '[1;2]')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameInterval()])(']1;2]', '[1;2]')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(all([valueInInterval()])('\\frac{3}{2}', '[1;2]')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([valueInInterval()])('2', '[1;2[')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('compares units with conversions', () => {
      expect(
        all([sameWithUnit()])('100\\operatorname{cm}', '1m'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameWithUnit({ strictSameUnit: true })])(
          '100\\operatorname{cm}',
          '1m',
        ),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(all([sameWithUnit()])('100', '1m')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('reads MathLive units when the same unit is required', () => {
      const strict = all([sameWithUnit({ strictSameUnit: true })])
      expect(strict('1\\operatorname{\\mathrm{m}}', '1m')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(strict('3,5\\operatorname{\\mathrm{cm}}', '3.5cm')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(strict('100\\operatorname{\\mathrm{cm}}', '1m')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('compares number tuples and lists', () => {
      expect(all([sameNumberTuple()])('(1;2;3)', '(1;2;3)')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameNumberTuple()])('\\left(1;2\\right)', '(1;2)'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameNumberTuple()])('\\{1;2;3\\}', '(1;2;3)')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(all([sameNumberList()])('3;1;2', '1;2;3')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameNumberList()])('1;2;1;3', '1;2;3')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(
        all([sameNumberList({ allowRepeatedNumbers: true })])(
          '1;2;1;3',
          '1;2;3',
        ),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameOrderedNumberList()])('1;2;3', '1;2;3')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([sameOrderedNumberList()])('3;1;2', '1;2;3')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('compares integer progression sets', () => {
      expect(
        all([sameIntegerProgressionSet()])('k\\pi', 'k\\pi'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameIntegerProgressionSet({ variable: 'k' })])(
          'S=\\left\\{k\\pi\\mid k\\in\\mathbb{Z}\\right\\}',
          'k\\pi',
        ),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([sameIntegerProgressionSet()])('2k\\pi', 'k\\pi'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('compares integer progression sets with compact MathLive fractions', () => {
      expect(
        all([sameIntegerProgressionSet()])(
          '-\\frac12\\pi+k\\pi',
          '\\frac12\\pi+k\\pi',
        ),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })
  })

  describe('form atoms', () => {
    it('checks fraction syntax without duplicating equality', () => {
      expect(all([isFraction()])('\\frac{2}{4}', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([isFraction()])('0.5', 'anything')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Résultat incorrect car une fraction est attendue.',
      })
      expect(
        all([isEqual(), isFraction()])('\\frac{2}{4}', '0.5'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([isEqual(), isFraction()])('0.5', '0.5')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('checks decimal fraction syntax', () => {
      expect(
        all([isDecimalFraction()])('\\frac{7}{10}', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([isDecimalFraction()])('\\frac{7}{8}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('checks that all numbers are written as decimal numbers', () => {
      expect(all([onlyDecimalNumbers()])('3,14', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([onlyDecimalNumbers()])('x+2+3,14', 'anything')).toMatchObject(
        {
          isOk: true,
          score: 1,
        },
      )
      expect(
        all([onlyDecimalNumbers()])('\\frac{314}{100}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(
        all([onlyDecimalNumbers()])('\\sqrt{2}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('checks scientific notation shape only', () => {
      expect(
        all([isScientificNotation()])('1,357\\times10^3', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([isScientificNotation()])('13,57\\times10^2', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(
        all([isEqual(), isScientificNotation()])('1,357\\times10^3', '1357'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('checks power form', () => {
      expect(all([isPowerForm()])('4^2', '16')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([isPowerForm()])('16', '16')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(
        all([isPowerForm({ forbidExponentOne: true })])('4^1', '4'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(
        all([isPowerForm({ exactExpectedPower: true })])('2^4', '4^2'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('refuses trigonometry', () => {
      expect(all([noTrigonometry()])('x^2+1', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([noTrigonometry()])('\\cos(x)+1', 'anything')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: "Aucune fonction trigonométrique n'est autorisée.",
      })
    })

    it('checks grouped number spacing relative to the expected number', () => {
      expect(
        all([hasGroupedNumberSpacing()])('1 234 567,890 1', '1234567,8901'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([hasGroupedNumberSpacing()])('1234567,8901', '1234567,8901'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('checks reduced coordinates coordinate by coordinate', () => {
      expect(all([coordinatesReduced()])('(1;2)', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([coordinatesReduced()])('\\left(1;2\\right)', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([coordinatesReduced()])('(1;3-1)', 'anything')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Les coordonnées ne sont pas assez réduites.',
      })
      expect(
        all([sameCoordinates(), coordinatesReduced()])('(1;2)', '(1;2)'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('checks reduced interval bounds bound by bound', () => {
      expect(all([intervalBoundsReduced()])('[1;2]', 'anything')).toMatchObject(
        {
          isOk: true,
          score: 1,
        },
      )
      expect(
        all([intervalBoundsReduced()])('[1;3-1]', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback: "Les bornes de l'intervalle ne sont pas assez réduites.",
      })
      expect(
        all([sameInterval(), intervalBoundsReduced()])('[1;2]', '[1;2]'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })
  })

  describe('onlyIrreducibleFractions', () => {
    const accepted: Array<[string, string]> = [
      ['\\dfrac{1}{2}', 'anything'],
      ['-\\dfrac{3}{5}', 'anything'],
      ['\\dfrac{-3}{5}', 'anything'],
      ['\\dfrac{3}{-5}', 'anything'],
      ['\\frac{7}{13}', 'anything'],
      ['-\\frac{7}{13}', 'anything'],
      ['1/3', 'anything'],
      ['x+\\dfrac{2}{3}', 'anything'],
      ['1', 'anything'],
    ]

    const refused: Array<[string, string, string]> = [
      [
        '\\dfrac{2}{4}',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '2/4',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        ' 2/4 ',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '2 / 4',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        'x+2/4',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '\\frac{2}{ 4 }',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '\\tfrac{2}{4}',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      // MathLive serializes single-digit fractions without braces
      [
        '\\dfrac24',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '\\frac24',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '\\dfrac{10}{15}',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '2/2',
        '1',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '-4/6',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        '-\\dfrac{4}{6}',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
      [
        'x+\\dfrac{6}{9}',
        'anything',
        'Résultat incorrect car une fraction irréductible est attendue.',
      ],
    ]

    it.each(accepted)('accepts %s for %s', (saisie, answer) => {
      expect(all([onlyIrreducibleFractions()])(saisie, answer)).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it.each(refused)('refuses %s for %s', (saisie, answer, feedback) => {
      expect(all([onlyIrreducibleFractions()])(saisie, answer)).toMatchObject({
        isOk: false,
        score: 0,
        feedback,
      })
    })

    it('plain integer 0 (no fraction) passes — nothing to check', () => {
      // No fraction pattern found → hasReducibleFraction returns false → passes
      expect(all([onlyIrreducibleFractions()])('0', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('\\dfrac{0}{3} fails — gcd(0,3)=3 ≠ 1 (reducible)', () => {
      // gcd(0, 3) = 3, so this fraction is considered reducible
      expect(
        all([onlyIrreducibleFractions()])('\\dfrac{0}{3}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Résultat incorrect car une fraction irréductible est attendue.',
      })
    })

    it('\\dfrac{1}{1} passes — gcd(1,1)=1', () => {
      expect(
        all([onlyIrreducibleFractions()])('\\dfrac{1}{1}', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('large primes \\dfrac{17}{19} pass', () => {
      expect(
        all([onlyIrreducibleFractions()])('\\dfrac{17}{19}', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('expression with both an irreducible and a reducible fraction fails', () => {
      // \\frac{1}{2} is ok but \\frac{2}{4} is reducible
      expect(
        all([onlyIrreducibleFractions()])(
          '\\dfrac{1}{2}+\\dfrac{2}{4}',
          'anything',
        ),
      ).toMatchObject({ isOk: false, score: 0 })
    })

    it('\\dfrac{-6}{9} fails — gcd(6,9)=3 ≠ 1', () => {
      expect(
        all([onlyIrreducibleFractions()])('\\dfrac{-6}{9}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Résultat incorrect car une fraction irréductible est attendue.',
      })
    })
  })

  describe('fraction form checks', () => {
    it('refuses square roots in denominators', () => {
      expect(
        all([noSquareRootInDenominator()])('\\dfrac{\\sqrt{2}}{2}', 'anything'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([noSquareRootInDenominator()])('\\dfrac{1}{\\sqrt{2}}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Incorrect car la fraction possède une racine carrée au dénominateur.',
      })
      expect(
        all([noSquareRootInDenominator()])('1/\\sqrt{2}', 'anything'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('accepts fractions reduced from the expected one without requiring irreducibility', () => {
      const compare = all([fractionReducedFromExpected()])

      expect(compare('\\dfrac{6}{14}', '\\dfrac{18}{42}')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('\\dfrac{9}{21}', '\\dfrac{18}{42}')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('\\dfrac{3}{7}', '\\dfrac{18}{42}')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('\\dfrac{18}{42}', '\\dfrac{18}{42}')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Résultat incorrect car une fraction réduite est attendue.',
      })
      expect(compare('\\dfrac{2}{7}', '\\dfrac{18}{42}')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })
  })

  describe('stringEquals', () => {
    it('accepts identical strings', () => {
      expect(
        all([stringEquals()])('Triangle ABC', 'Triangle ABC'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('refuses different strings', () => {
      expect(
        all([stringEquals()])('Triangle ABC', 'triangle ABC'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Le texte saisi ne correspond pas à la réponse attendue.',
      })
    })

    it('can ignore case and surrounding spaces', () => {
      expect(
        all([stringEquals({ ignoreCase: true, trim: true })])(
          '  triangle abc ',
          'Triangle ABC',
        ),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })
  })

  describe('equation checks', () => {
    it('checks that the answer is an equation', () => {
      expect(all([isEquation()])('2x+3y=5', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([isEquation()])('2x+3y-5', 'anything')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'La réponse doit être une équation avec un seul signe =.',
      })
    })

    it('accepts equivalent equations', () => {
      expect(
        all([isEquivalentEquation()])('4x+6y-10=0', '2x+3y-5=0'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('accepts equivalent equations with non-zero right-hand side', () => {
      expect(
        all([isEquivalentEquation()])('2x+3y=5', '2x+3y-5=0'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('accepts equivalent equations with compact MathLive fractions', () => {
      expect(
        all([isEquivalentEquation()])('\\frac12x+y=1', 'x+2y=2'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('accepts an isolated solution equivalent to a rational equation', () => {
      expect(
        all([isEquivalentEquation()])(
          'x=\\frac{63}{8}',
          '\\frac{8}{9}=\\frac{7}{x}',
        ),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('refuses a different isolated solution for a rational equation', () => {
      expect(
        all([isEquivalentEquation()])('x=8', '\\frac{8}{9}=\\frac{7}{x}'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('checks that one member is zero', () => {
      expect(all([hasZeroMember()])('2x+3y-5=0', 'anything')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(all([hasZeroMember()])('2x+3y=5', 'anything')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: "L'équation doit être écrite avec un membre égal à 0.",
      })
    })

    it('refuses a different equation', () => {
      expect(
        all([isEquivalentEquation()])('2x+3y-4=0', '2x+3y-5=0'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          "L'équation saisie n'est pas équivalente à l'équation attendue.",
      })
    })

    it('custom feedbackOk appears when another check fails', () => {
      const compare = all([
        isEquivalentEquation({
          feedbackOk: "L'équation est équivalente.",
        }),
        {
          name: 'forme',
          run: () => ({ passed: false, feedbackKo: 'Forme incorrecte.' }),
        },
      ])

      expect(compare('4x+6y-10=0', '2x+3y-5=0')).toMatchObject({
        isOk: false,
        feedback: "L'équation est équivalente.\nForme incorrecte.",
      })
    })
  })

  describe('noDecimal', () => {
    const accepted = [
      '3',
      '-12',
      '0',
      '3.0',
      '-7,000',
      '\\dfrac{1}{2}',
      '\\sqrt{2}',
      '2\\sqrt{3}+\\dfrac{5}{7}',
      'x^2+2x+1',
    ]

    const refused = [
      '3.14',
      '-0.5',
      '2,75',
      '\\dfrac{1.2}{3}',
      '\\sqrt{2.25}',
      'x+0.1',
      '10^{-1}+2',
    ]

    it.each(accepted)('accepts %s', (saisie) => {
      expect(all([noDecimal()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it.each(refused)('refuses %s', (saisie) => {
      expect(all([noDecimal()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: "La réponse ne doit pas contenir d'écriture décimale.",
      })
    })

    it('0.0 passes — Number("0.0") = 0 which is an integer', () => {
      // The pattern matches "0.0" but Number('0.0') === 0, which IS an integer → passes
      expect(all([noDecimal()])('0.0', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('3. (trailing dot) passes — Number("3.") = 3 which is an integer', () => {
      // The pattern \d+[.,] matches "3." but Number('3.') === 3 → passes
      expect(all([noDecimal()])('3.', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('large integer 1000 passes', () => {
      expect(all([noDecimal()])('1000', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('3.14159 fails', () => {
      expect(all([noDecimal()])('3.14159', '0')).toMatchObject({
        isOk: false,
        score: 0,
        feedback: "La réponse ne doit pas contenir d'écriture décimale.",
      })
    })
  })

  describe('extractedRadicands', () => {
    const accepted: Array<[string, string]> = [
      ['2\\sqrt{3}', '\\sqrt{12}'],
      ['3\\sqrt{2}', '\\sqrt{18}'],
      ['5\\sqrt{2}', '\\sqrt{50}'],
      ['6', '\\sqrt{36}'],
      ['-2\\sqrt{3}', '-\\sqrt{12}'],
      ['2\\sqrt{3}+1', '\\sqrt{12}+1'],
      ['\\sqrt{7}', '\\sqrt{7}'],
    ]

    const refused: Array<[string, string]> = [
      ['\\sqrt{12}', '\\sqrt{12}'],
      ['\\sqrt{18}', '3\\sqrt{2}'],
      ['2\\sqrt{12}', '4\\sqrt{3}'],
      ['\\sqrt{4}', '2'],
      ['1+\\sqrt{8}', '1+2\\sqrt{2}'],
    ]

    it.each(accepted)('accepts %s for %s', (saisie, answer) => {
      expect(all([extractedRadicands()])(saisie, answer)).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it.each(refused)('refuses %s for %s', (saisie, answer) => {
      expect(all([extractedRadicands()])(saisie, answer)).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Les facteurs carrés doivent être extraits des racines carrées.',
      })
    })

    it('still refuses an extracted but unequal answer', () => {
      expect(
        all([extractedRadicands()])('2\\sqrt{5}', '\\sqrt{12}'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'Le résultat est incorrect.',
      })
    })

    it('expression with no sqrt at all — passes (nothing to extract)', () => {
      // No sqrt pattern found → hasUnextractedSquareFactor returns false → passed
      expect(all([extractedRadicands()])('3', '3')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('\\sqrt{1} — extraireRacineCarree(1)=[1,1], outside=1 → passes', () => {
      // outside === 1 means no perfect square factor was found → not unextracted → passes
      expect(
        all([extractedRadicands()])('\\sqrt{1}', '\\sqrt{1}'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('\\sqrt{100} — extraireRacineCarree(100)=[10,1], outside=10 ≠ 1 → fails', () => {
      // 100 = 10², so outside=10 ≠ 1 → unextracted square factor → fails
      expect(
        all([extractedRadicands()])('\\sqrt{100}', '\\sqrt{100}'),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Les facteurs carrés doivent être extraits des racines carrées.',
      })
    })

    it('2\\sqrt{3}+\\sqrt{8} — sqrt(3) is ok but sqrt(8) is not extracted → fails', () => {
      // sqrt(3): extraireRacineCarree(3)=[1,3], outside=1 → ok
      // sqrt(8): extraireRacineCarree(8)=[2,2], outside=2 ≠ 1 → unextracted
      // 2√3 + √8 = 2√3 + 2√2 numerically
      expect(
        all([extractedRadicands()])(
          '2\\sqrt{3}+\\sqrt{8}',
          '2\\sqrt{3}+2\\sqrt{2}',
        ),
      ).toMatchObject({
        isOk: false,
        score: 0,
        feedback:
          'Les facteurs carrés doivent être extraits des racines carrées.',
      })
    })
  })

  describe('sameSet', () => {
    const accepted: Array<[string, string]> = [
      ['\\{1;2;3\\}', '\\{3;2;1\\}'],
      ['\\left\\{1;2;3\\right\\}', '\\{3;2;1\\}'],
      ['\\left\\lbrace1;2;3\\right\\rbrace', '\\{3;2;1\\}'],
      ['\\{-2;0;5\\}', '\\{5;-2;0\\}'],
      ['\\{\\dfrac{1}{2};\\sqrt{2}\\}', '\\{\\sqrt{2};0.5\\}'],
      ['\\emptyset', '\\emptyset'],
    ]

    const refused: Array<[string, string, string]> = [
      [
        '\\{1;2\\}',
        '\\{1;2;3\\}',
        'Toutes les valeurs sont correctes mais il en manque 1.',
      ],
      [
        '1;2;3\\}',
        '\\{1;2;3\\}',
        "Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide.",
      ],
      [
        '\\{1;2;3',
        '\\{1;2;3\\}',
        "Résultat incorrect car cet ensemble doit se terminer par une accolade ou bien être l'ensemble vide.",
      ],
      [
        '\\{1;1;2\\}',
        '\\{1;2\\}',
        'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
      ],
      ['\\{\\}', '\\emptyset', "L'ensemble est vide."],
    ]

    it.each(accepted)('accepts %s for %s', (saisie, answer) => {
      expect(all([sameSet()])(saisie, answer)).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it.each(refused)('refuses %s for %s', (saisie, answer, feedback) => {
      expect(all([sameSet()])(saisie, answer)).toMatchObject({
        isOk: false,
        score: 0,
        feedback,
      })
    })

    it('single element set matches itself', () => {
      expect(all([sameSet()])('\\{5\\}', '\\{5\\}')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('extra element in input — fails with count mismatch feedback', () => {
      expect(all([sameSet()])('\\{1;2;4\\}', '\\{1;2;3\\}')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('order-independent matching — {3;1;2} isEqual {1;2;3}', () => {
      expect(all([sameSet()])('\\{3;1;2\\}', '\\{1;2;3\\}')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('custom feedbackKo overrides the default error message', () => {
      const compare = all([
        sameSet({ feedbackKo: 'Cet ensemble est incorrect.' }),
      ])

      const result = compare('\\{1;2\\}', '\\{1;2;3\\}')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('Cet ensemble est incorrect.')
    })
  })

  describe('sameIntegerProgressionSet', () => {
    it('accepts equivalent arithmetic progressions', () => {
      // 2x+2 and 2x describe sets with same step=2, same residue
      expect(all([sameIntegerProgressionSet()])('2x+2', '2x')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('accepts equivalent progressions with pi', () => {
      expect(
        all([sameIntegerProgressionSet()])('2k\\pi', '2k\\pi-2\\pi'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('refuses progressions with different step', () => {
      // step 2 vs step 4 — different
      expect(all([sameIntegerProgressionSet()])('2x', '4x')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('refuses progressions with different residue', () => {
      // 2x+1 vs 2x+2 — same step but different offset modulo step
      expect(all([sameIntegerProgressionSet()])('2x+1', '2x+2')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('accepts with explicit variable option', () => {
      // 4n+1 and 4n-3 describe the same set (mod 4): 1 ≡ -3 (mod 4)
      expect(
        all([sameIntegerProgressionSet({ variable: 'n' })])('4n+1', '4n-3'),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('custom feedbackKo appears when failing', () => {
      const compare = all([
        sameIntegerProgressionSet({
          feedbackKo: 'Les ensembles ne coïncident pas.',
        }),
      ])

      const result = compare('2x+1', '2x+2')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('Les ensembles ne coïncident pas.')
    })
  })

  it('composes the heavy checks with partial scoring', () => {
    const compare = all([
      isEqual({ weight: 0.6 }),
      extractedRadicands({ weight: 0.2 }),
      noDecimal({ weight: 0.2 }),
    ])

    expect(compare('\\sqrt{12}', '\\sqrt{12}')).toMatchObject({
      isOk: false,
      score: 0.8,
      details: [
        { name: 'isEqual', passed: true },
        { name: 'extractedRadicands', passed: false },
        { name: 'noDecimal', passed: true },
      ],
    })
  })
})
