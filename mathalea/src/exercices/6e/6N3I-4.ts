import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer des fractions avec des méthodes simples'
export const dateDePublication = '26/10/2026'
export const interactifReady = true
export const uuid = '477eb'
export const refs = { 'fr-fr': ['6N3I-4'], 'fr-ch': ['9R1NO4H-4', '9R2NO4H-4', '9R3NO4H-4', 'PRQNO05B-7'] }

export default class ComparerFractionsMethodesSimples extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 8
    this.nbCols = 4
    this.nbColsCorr = 2
    this.spacing = 2
    this.spacingCorr = 2
    this.consigne = 'Comparer les fractions avec les symboles $<$, $>$ ou $=$.'
    this.sup = '6'
    this.besoinFormulaireTexte = [
      'Types de comparaison',
      'Nombres séparés par des tirets (répéter un nombre pour augmenter sa fréquence) :\n1 : Même dénominateur\n2 : Même numérateur\n3 : De part et d’autre de 1\n4 : De part et d’autre de 1/2\n5 : Fractions égales\n6 : Mélange',
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (
      let i = 0, essais = 0;
      i < this.nbQuestions && essais < 100;
      essais++
    ) {
      let a: FractionEtendue
      let b: FractionEtendue
      let explication: string
      switch (types[i]) {
        case 1: {
          const den = randint(3, 20)
          const num = randint(1, 2 * den)
          a = new FractionEtendue(num, den)
          b = new FractionEtendue(randint(1, 2 * den, num), den)
          explication =
            'À dénominateur égal, la plus grande fraction est celle qui a le plus grand numérateur.'
          break
        }
        case 2: {
          const num = randint(2, 20)
          const den = randint(2, 20)
          a = new FractionEtendue(num, den)
          b = new FractionEtendue(num, randint(2, 20, den))
          explication =
            'À numérateur égal, la plus grande fraction est celle qui a le plus petit dénominateur.'
          break
        }
        case 3: {
          const den1 = randint(3, 20)
          const den2 = randint(3, 20, den1)
          a = new FractionEtendue(randint(1, den1 - 1), den1)
          b = new FractionEtendue(randint(den2 + 1, 2 * den2), den2)
          explication = ''
          break
        }
        case 4: {
          const den1 = randint(3, 15)
          const den2 = randint(3, 15, den1)
          a = new FractionEtendue(randint(1, Math.floor((den1 - 1) / 2)), den1)
          b = new FractionEtendue(
            randint(Math.floor(den2 / 2) + 1, den2 - 1),
            den2,
          )
          explication = ''
          break
        }
        default: {
          const num = randint(1, 9)
          const den = randint(2, 12)
          const facteur = randint(2, 5)
          a = new FractionEtendue(num, den)
          b = new FractionEtendue(num * facteur, den * facteur)
          explication = `$${a.texFraction}=${b.texFraction}$ car on multiplie le numérateur et le dénominateur par $${facteur}$.`
        }
      }
      if (choice([true, false])) [a, b] = [b, a]
      if (types[i] === 3) {
        explication = [a, b]
          .map(
            (f) =>
              `$${f.texFraction}${f.num < f.den ? '<' : '>'}1$ car son numérateur est ${f.num < f.den ? 'inférieur' : 'supérieur'} à son dénominateur.`,
          )
          .join('<br><br>')
      } else if (types[i] === 4) {
        explication = [a, b]
          .map(
            (f) =>
              `$${f.num}$ est ${2 * f.num < f.den ? 'inférieur' : 'supérieur'} à la moitié de $${f.den}$, donc $${f.texFraction}${2 * f.num < f.den ? '<' : '>'}\\dfrac12$.`,
          )
          .join('<br><br>')
      } else if (types[i] === 5 && a.num === a.den) {
        explication = `$${a.texFraction}=1$ et $${b.texFraction}=1$ car, dans chaque fraction, le numérateur est égal au dénominateur.`
      } else if (types[i] === 5 && 2 * a.num === a.den) {
        explication = `$${a.texFraction}=\\dfrac12$ et $${b.texFraction}=\\dfrac12$ car, dans chaque fraction, le numérateur est égal à la moitié du dénominateur.`
      }
      if (!this.questionJamaisPosee(i, a.num, a.den, b.num, b.den)) continue
      const difference = a.num * b.den - b.num * a.den
      const symbole = difference === 0 ? '=' : difference < 0 ? '<' : '>'
      this.listeQuestions[i] = remplisLesBlancs(
        this,
        i,
        `${a.texFraction}\\quad%{champ1}\\quad${b.texFraction}`,
        KeyboardType.clavierEntierementPersonnalisable,
        '\\ldots',
        { dataKeys: ['>', '<', '='] },
      )
      handleAnswers(this, i, {
        champ1: { value: symbole, options: { texteSansCasse: true } },
      })
      this.listeCorrections[i] =
        `${texteEnCouleur(explication, bleuMathalea)}<br><br>Finalement, $${a.texFraction}${miseEnEvidence(symbole)}${b.texFraction}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
