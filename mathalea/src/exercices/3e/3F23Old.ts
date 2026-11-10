import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '05/06/2025'
export const dateDeModifImportante = '27/03/2026'
export const titre =
  "Trouver l'intersection des droites représentant des fonctions affines"
export const interactifReady = true

/**
 * Trouver les coordonnées du point d'intersection des droites représentant des fonctions affines
 * @author Éric Elter
 */
export const uuid = 'ac71d'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class IntersectionDroites extends Exercice {
  constructor() {
    super()

    this.sup = 1
    this.sup2 = 1

    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de fonctions',
      '1 : 2 fonctions affines\n2 : 1 fonction affine et 1 fonction linéaire\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const a = randint(-9, 9, 0)
      let b = randint(-9, 9, 0)
      const c = randint(-9, 9, [0, a])
      let d = randint(-9, 9, 0)
      if (listeTypeDeQuestions[i] === 2) {
        if (choice([true, false])) b = 0
        else d = 0
      }

      texte = `Soient $f$ et $g$ deux fonctions affines définies par : $f(x)=${reduireAxPlusB(a, b)}$ et $g(x)=${reduireAxPlusB(c, d)}$. <br>`
      texte += `${numAlpha(0)} Quelle est l'abscisse du point d'intersection des deux droites représentatives respectivement de $f$ et de $g$ ?`
      texte += ajouteChampTexteMathLive(
        this,
        2 * i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      texte += `<br>${numAlpha(1)} Quelle est l'ordonnée de ce point d'intersection ?`
      texte += ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      texteCorr = `${numAlpha(0)} Le point d'intersection appartient aux droites représentatives respectivement de $f$ et de $g$.<br>
              Si $a$ est l'abscisse de ce point, alors l'image de $a$ par $f$ est la même que l'image de $a$ par $g$. <br>
              Donc $f(a)=g(a)$ et donc $${reduireAxPlusB(a, b, 'a')}=${reduireAxPlusB(c, d, 'a')}$<br>
              
              Résolvons cette équation pour trouver la valeur de $a$.<br>
              $\\begin{aligned}
              ${reduireAxPlusB(a, b, 'a')}&=${reduireAxPlusB(c, d, 'a')}\\\\
              ${reduireAxPlusB(a, b, 'a')}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-c) + 'a', bleuMathalea)}&=${reduireAxPlusB(c, d, 'a')}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-c) + 'a', bleuMathalea)}\\\\`
      texteCorr +=
        b === 0 && Math.abs(a - c) === 1
          ? ''
          : `         ${reduireAxPlusB(a - c, b, 'a')}&=${reduireAxPlusB(0, d, 'a')}\\\\`
      texteCorr +=
        b === 0
          ? ''
          : `        ${reduireAxPlusB(a - c, b, 'a')}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-b), bleuMathalea)}&=${reduireAxPlusB(0, d, 'a')}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-b), bleuMathalea)}\\\\   `
      texteCorr +=
        a - c === 1
          ? `${reduireAxPlusB(a - c, 0, 'a')}&=${miseEnEvidence(d - b)}\\\\`
          : `${reduireAxPlusB(a - c, 0, 'a')}&=${reduireAxPlusB(0, d - b, 'a')}\\\\`
      const abscisseFractionEtendue = new FractionEtendue(
        d - b,
        a - c,
      ).simplifie()
      const abscisse = abscisseFractionEtendue.texFSD
      const ordonnee = new FractionEtendue(
        a * abscisseFractionEtendue.num + b * abscisseFractionEtendue.den,
        abscisseFractionEtendue.den,
      ).simplifie().texFSD
      texteCorr +=
        Math.abs(a - c) !== 1
          ? `${texFractionFromString(a - c + 'a', a - c)}&=${texFractionFromString(d - b, a - c)}\\\\`
          : a - c === -1
            ? `a&=${miseEnEvidence(b - d)}`
            : ''
      if (Math.abs(a - c) !== 1) {
        if (new FractionEtendue(d - b, a - c).estIrreductible) {
          texteCorr += `a&=${miseEnEvidence(new FractionEtendue(d - b, a - c).texFSD)}`
        } else {
          texteCorr += `a&=${new FractionEtendue(d - b, a - c).texFSD}`
          texteCorr += `=${miseEnEvidence(abscisse)}`
        }
      }
      texteCorr += '\\end{aligned}$<br>'
      texteCorr += `Le point d'intersection des droites représentatives respectivement de $f$ et de $g$ a pour abscisse $${miseEnEvidence(abscisse)}$.<br>`

      texteCorr += `${numAlpha(1)} L'ordonnée du point d'intersection des droites représentatives respectivement de $f$ et de $g$ est l'image de son abscisse par $f$ ou par $g$.<br>`
      texteCorr += `On peut donc calculer $f\\Big(${abscisse}\\Big)$ ou bien $g\\Big(${abscisse}\\Big)$.<br>Ici, on fait le choix de calculer $f\\Big(${abscisse}\\Big)$.<br>`
      texteCorr += `$f\\Big(${abscisse}\\Big)=`
      texteCorr += a === 1 ? '' : a === -1 ? '-' : `${a} \\times `
      texteCorr +=
        b === 0
          ? `${ecritureParentheseSiNegatif(abscisseFractionEtendue)}=${miseEnEvidence(ordonnee)}$<br>`
          : `${ecritureParentheseSiNegatif(abscisseFractionEtendue)} ${ecritureAlgebrique(b)}=${miseEnEvidence(ordonnee)}$<br>`
      texteCorr += `Le point d'intersection des droites représentatives respectivement de $f$ et de $g$ a pour ordonnée $${miseEnEvidence(ordonnee)}$.<br>`
      // Important laisser ici les deux options de comparaison
      handleAnswers(this, 2 * i, {
        reponse: {
          value: abscisse,
          options: { fractionEgale: true, nombreDecimalSeulement: true },
        },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: ordonnee,
          options: { fractionEgale: true, nombreDecimalSeulement: true },
        },
      })

      if (this.questionJamaisPosee(i, a, b, c, d)) {
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
