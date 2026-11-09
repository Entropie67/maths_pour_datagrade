import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Reconnaitre coefficient directeur et ordonnée à l'origine d'une fonction affine"
export const dateDePublication = '19/05/2025'
export const interactifReady = true

/**
 * Reconnaitre coefficient directeur et ordonnée à l'origine d'une fonction affine
 * @author Éric Elter
 */
export const uuid = 'a2b1b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class CoefficientDirecteur extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5

    this.besoinFormulaireTexte = [
      'Type de fonctions affines',
      [
        'Nombres séparés par des tirets  :',
        '1 : f(x) = ax + b',
        '2 : f(x) = b + ax',
        '3 : f(x) = ax',
        '4 : f(x) = b',
        '5 : f(x) = a/c·x + b/d (coefficients rationnels)',
        '6 : f(x) avec racine carrée dans le coefficient directeur ou l’ordonnée à l’origine',
        '7 : f(x) = (ax + b)/c',
        '8 : f(x) = c(ax + b)',
        '9 : f(x) = ax + b + cx',
        '10 : f(x) = ax + b + c',
        '11 : f(x) = ax + b + cx + d',
        '12 : f(x) = x/c + b/d',
        '13 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Uniquement $f$ comme nom de fonction']
    this.besoinFormulaire3CaseACocher = ['Uniquement $x$ comme nom de variable']
    this.sup = '1-2-3-4-5-6-7'
    this.sup2 = true
    this.sup3 = true
    this.spacing = 1.5
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 12,
      melange: 13,
      defaut: 13,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nomFonction = this.sup2 ? 'f' : choice(['f', 'g', 'h', 'k'])
      const nomVariable = this.sup3 ? 'x' : choice(['x', 'a', 'b', 'c', 't'])
      let a = randint(-9, 9, [-1, 0, 1])
      let b = randint(-9, 9, [0])
      let c = randint(-9, 9, [-1, 0, 1])
      let d = randint(-9, 9, [-1, 0, 1])
      let texte = ''
      let texteCorr = ''
      let coefDir: number | string = 0
      let ordOrigine: number | string = 0
      let fonctionF = ''
      let texteCorSelonCase = ''
      switch (typesDeQuestionsDisponibles[i]) {
        case 1: // ax+b
          fonctionF = `${reduireAxPlusB(a, b, nomVariable)}`
          coefDir = a
          ordOrigine = b
          texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
          if (b < 0)
            texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${a}${nomVariable}+(${b})`
          break
        case 2: // b+ax
          fonctionF = `${b} ${ecritureAlgebrique(a)}${nomVariable}`
          coefDir = a
          ordOrigine = b
          texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(a, b, nomVariable)}`
          if (b < 0) texteCorSelonCase += `= ${a}${nomVariable}+(${b})`
          break
        case 3: // ax
          fonctionF = `${a}${nomVariable}`
          coefDir = a
          ordOrigine = 0
          texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}(${nomVariable}) = ${a}${nomVariable}+0`
          break
        case 4: // b
          fonctionF = `${b}`
          coefDir = 0
          ordOrigine = b
          texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}(${nomVariable}) = ${0}${nomVariable} ${ecritureAlgebrique(b)}`
          if (b < 0) texteCorSelonCase += `=0x+(${b})`
          break
        case 5: // a/c x + b/d
          c = randint(-9, 9, [-1, 0, 1, a, -a])
          d = randint(-9, 9, [-1, 0, 1, b, -b])
          coefDir = new FractionEtendue(a, c).texFractionSimplifiee
          ordOrigine = new FractionEtendue(b, d).texFractionSimplifiee
          if (choice([false, true])) {
            fonctionF = `${reduireAxPlusB(new FractionEtendue(a, c).simplifie(), new FractionEtendue(b, d).simplifie(), nomVariable)}`
            texteCorSelonCase += `On observe que l'expression algébrique de la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            if (b * d < 0)
              texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF =
              `${ordOrigine}` +
              (a * c < 0 ? '' : '+') +
              `${coefDir}${nomVariable}`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(new FractionEtendue(a, c).simplifie(), new FractionEtendue(b, d).simplifie(), nomVariable)}`
            if (b * d < 0)
              texteCorSelonCase += ` = ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
        case 6: {
          // sqrt(a)x+b ou =ax+sqrt(b)
          const signe = choice([true, false])
          if (choice([true, false])) {
            // sqrt est sur a
            a = randint(2, 8, [4])
            coefDir = signe ? `\\sqrt{${a}}` : `-\\sqrt{${a}}`
            ordOrigine = b
            if (choice([true, false])) {
              // Dans cet ordre : ${nomFonction}(${nomVariable})=sqrt(a)${nomVariable}+b
              fonctionF = `${coefDir}${nomVariable} ${ecritureAlgebrique(b)}`
              texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
              if (b < 0)
                texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${b})`
            } else {
              // Dans cet ordre : ${nomFonction}(${nomVariable})=b+sqrt(a)${nomVariable}
              fonctionF = signe
                ? `${ordOrigine} + ${coefDir}${nomVariable}`
                : `${ordOrigine} ${coefDir}${nomVariable}`
              texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${coefDir}${nomVariable} ${ecritureAlgebrique(b)}`
              if (b < 0)
                texteCorSelonCase += ` = ${coefDir}${nomVariable}+(${b})`
            }
          } else {
            // sqrt est sur b
            b = randint(2, 8, [4])
            coefDir = a
            ordOrigine = signe ? `\\sqrt{${b}}` : `-\\sqrt{${b}}`
            if (choice([true, false])) {
              // Dans cet ordre : ${nomFonction}(${nomVariable})=ax+sqrt(b)
              fonctionF = signe
                ? `${coefDir}${nomVariable} + ${ordOrigine}`
                : `${coefDir}${nomVariable} ${ordOrigine}`
              texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
              if (!signe)
                texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
            } else {
              // Dans cet ordre : ${nomFonction}(${nomVariable})=sqrt(b)+ax
              fonctionF = `${ordOrigine} ${ecritureAlgebrique(a)}${nomVariable}`
              texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${signe ? `${coefDir}${nomVariable} + ${ordOrigine}` : `${coefDir}${nomVariable} ${ordOrigine}`}`
              if (!signe)
                texteCorSelonCase += ` = \\sqrt{${coefDir}}${nomVariable}+(${ordOrigine})`
            }
          }
          break
        }
        case 7: // (ax+b)/c
          do {
            a = randint(-9, 9, [-1, 0, 1])
            b = randint(-9, 9, [0])
            c = randint(2, 9)
          } while (
            !new FractionEtendue(a, c).estIrreductible ||
            !new FractionEtendue(b, c).estIrreductible
          )
          coefDir = `${new FractionEtendue(a, c).texFractionSimplifiee}`
          ordOrigine = `${new FractionEtendue(b, c).texFractionSimplifiee}`
          if (choice([true, false])) {
            fonctionF = `${texFractionFromString(reduireAxPlusB(a, b, nomVariable), c)}`
            texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p$ car $${nomFonction}_{${i + 1}}(${nomVariable})=${texFractionFromString(a, c)}${nomVariable} +${texFractionFromString(b, c)}`
          } else {
            fonctionF = `${texFractionFromString(`${b} ${ecritureAlgebrique(a)}${nomVariable}`, c)}`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${texFractionFromString(reduireAxPlusB(a, b, nomVariable), c)}=${texFractionFromString(a, c)}${nomVariable} +${texFractionFromString(b, c)}`
          }
          break
        case 8: // c(ax+b)
          coefDir = c * a
          ordOrigine = c * b
          if (choice([true, false])) {
            fonctionF = `${c}(${reduireAxPlusB(a, b, nomVariable)})`
            texteCorSelonCase = `On développe $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}$.<br>`
            texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            if (ordOrigine < 0)
              texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF = `${c}(${b} ${ecritureAlgebrique(a)}${nomVariable})`
            texteCorSelonCase = `On développe $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${ordOrigine} ${ecritureAlgebrique(coefDir)}${nomVariable}$.<br>`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}`
            if (ordOrigine < 0)
              texteCorSelonCase += `= ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
        case 9: // ax+b+cx
          c = randint(-9, 9, [-1, 0, 1, -a, -a + 1, -a - 1])
          coefDir = a + c
          ordOrigine = b
          if (choice([true, false])) {
            fonctionF = `${reduireAxPlusB(a, b, nomVariable)} ${ecritureAlgebrique(c)}${nomVariable}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}$.<br>`
            texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            if (ordOrigine < 0)
              texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF = `${b} ${ecritureAlgebrique(a)}${nomVariable} ${ecritureAlgebrique(c)}${nomVariable}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${ordOrigine} ${ecritureAlgebrique(coefDir)}${nomVariable}$.<br>`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}`
            if (ordOrigine < 0)
              texteCorSelonCase += `= ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
        case 10: // ax+b+c
          c = randint(-9, 9, [-1, 0, 1, -b])
          coefDir = a
          ordOrigine = b + c
          if (choice([true, false])) {
            fonctionF = `${reduireAxPlusB(a, b, nomVariable)} ${ecritureAlgebrique(c)}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}$.<br>`
            texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            if (ordOrigine < 0)
              texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF = `${b} ${ecritureAlgebrique(a)}${nomVariable} ${ecritureAlgebrique(c)}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${ordOrigine} ${ecritureAlgebrique(coefDir)}${nomVariable}$.<br>`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}`
            if (ordOrigine < 0)
              texteCorSelonCase += `= ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
        case 11: // ax+b+cx+d
          c = randint(-9, 9, [-1, 0, 1, -a, -a + 1, -a - 1])
          d = randint(-9, 9, [-1, 0, 1, -b])
          coefDir = a + c
          ordOrigine = b + d
          if (choice([true, false])) {
            fonctionF = `${reduireAxPlusB(a, b, nomVariable)} ${ecritureAlgebrique(c)}${nomVariable} ${ecritureAlgebrique(d)}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}$.<br>`
            texteCorSelonCase += `On observe que la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            if (ordOrigine < 0)
              texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF = `${b} ${ecritureAlgebrique(a)}${nomVariable} ${ecritureAlgebrique(c)}${nomVariable} ${ecritureAlgebrique(d)}`
            texteCorSelonCase = `On réduit $${nomFonction}_{${i + 1}}(${nomVariable})$ et on obtient $${nomFonction}_{${i + 1}}(${nomVariable})=${ordOrigine} ${ecritureAlgebrique(coefDir)}${nomVariable}$.<br>`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(coefDir, ordOrigine, nomVariable)}`
            if (ordOrigine < 0)
              texteCorSelonCase += `= ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
        case 12: // x/c + b/d
          a = choice([-1, 1])
          c = randint(2, 9)
          d = randint(-9, 9, [-1, 0, 1, b, -b])
          coefDir = new FractionEtendue(a, c).texFractionSimplifiee
          ordOrigine = new FractionEtendue(b, d).texFractionSimplifiee
          if (choice([false, true])) {
            fonctionF =
              (a === 1 ? '' : '-') +
              `${texFractionFromString(nomVariable, c)} ${ecritureAlgebrique(new FractionEtendue(b, d).simplifie())}`
            texteCorSelonCase += `On observe que l'expression algébrique de la fonction $${nomFonction}_{${i + 1}}$ s'écrit bien sous la forme $${nomFonction}(${nomVariable})= m ${nomVariable}+ p`
            texteCorSelonCase += `$ et donc $${nomFonction}_{${i + 1}}(${nomVariable}) = ${coefDir}${nomVariable}+(${ordOrigine})`
          } else {
            fonctionF =
              `${ordOrigine}` +
              (a < 0 ? '-' : '+') +
              `${texFractionFromString(nomVariable, c)}`
            texteCorSelonCase += `On peut réécrire l'expression algébrique de cette fonction sous la forme $${nomFonction}(${nomVariable}) = m ${nomVariable} + p$ et donc $${nomFonction}_{${i + 1}}(${nomVariable})=${reduireAxPlusB(new FractionEtendue(a, c).simplifie(), new FractionEtendue(b, d).simplifie(), nomVariable)}`
            texteCorSelonCase += ` = ${coefDir}${nomVariable}+(${ordOrigine})`
          }
          break
      }
      texte = ` Soit $${nomFonction}_{${i + 1}}$ la fonction affine définie par $${nomFonction}_{${i + 1}}(${nomVariable})=${fonctionF}$.`
      texte +=
        '<br>' +
        numAlpha(0) +
        `Quel est le coefficient directeur de la droite représentative de $${nomFonction}_{${i + 1}}$ ?`
      texte += ajouteChampTexteMathLive(
        this,
        2 * i,
        typesDeQuestionsDisponibles[i] === 6
          ? KeyboardType.clavierFullOperations
          : KeyboardType.clavierDeBaseAvecFraction,
      )
      texte +=
        '<br>' +
        numAlpha(1) +
        `Quelle est l'ordonnée à l'origine de la droite représentative de $${nomFonction}_{${i + 1}}$ ?`
      texte += ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        typesDeQuestionsDisponibles[i] === 6
          ? KeyboardType.clavierFullOperations
          : KeyboardType.clavierDeBaseAvecFraction,
      )
      const reponse1 =
        typeof coefDir === 'number' ? coefDir.toString() : coefDir
      handleAnswers(this, 2 * i, { reponse: { value: reponse1 } })
      const reponse2 =
        typeof ordOrigine === 'number' ? ordOrigine.toString() : ordOrigine
      handleAnswers(this, 2 * i + 1, { reponse: { value: reponse2 } })
      texteCorr = ` $${nomFonction}_{${i + 1}}(${nomVariable})=${fonctionF}$.<br>`
      texteCorr += texteCorSelonCase

      texteCorr += '$.<br>'
      texteCorr += `Ici, on identifie : $m=${coefDir}$ et $p=${ordOrigine}$.<br>`
      texteCorr += `La droite représentative de $${nomFonction}_{${i + 1}}$ a donc pour ${texteEnCouleurEtGras('coefficient directeur', bleuMathalea)} $${miseEnEvidence(coefDir)}$ et pour ${texteEnCouleurEtGras("ordonnée à l'origine", bleuMathalea)} $${miseEnEvidence(ordOrigine)}$.<br>`

      if (
        this.questionJamaisPosee(i, a, b, c, d, typesDeQuestionsDisponibles[i])
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
