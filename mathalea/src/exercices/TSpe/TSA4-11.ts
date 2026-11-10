import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier la continuité d’une fonction définie par morceaux'
export const interactifReady = false
export const dateDePublication = '22/08/2026'

export const uuid = 'b83e1'

export const refs = {
  'fr-fr': ['TSA4-11'],
  'fr-ch': [],
}

type Famille = 1 | 2

function variableCentree(a: number): string {
  if (a === 0) return 'x'
  return a > 0 ? `x-${a}` : `x+${-a}`
}

function expression(
  famille: Famille,
  a: number,
  valeurEnA: number,
  coefficient1: number,
): string {
  const u = variableCentree(a)
  if (famille === 1) {
    return reduireAxPlusB(coefficient1, valeurEnA - coefficient1 * a)
  }
  const carre = a === 0 ? 'x^2' : `(${u})^2`
  return `${rienSi1(coefficient1)}${carre}${ecritureAlgebrique(valeurEnA)}`
}

/**
 * @author Stéphane Guyon
 */
export default class ContinuiteFonctionParMorceaux extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'Répondre aux quatre questions suivantes.'
        : 'Pour chaque fonction, répondre aux quatre questions suivantes.'

    const familles = combinaisonListes([1, 2] as Famille[], this.nbQuestions)
    const casDeContinuite = combinaisonListes([true, false], this.nbQuestions)
    const cotesInclus = combinaisonListes([true, false], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const famille = familles[i]
      const estContinue = casDeContinuite[i]
      const gaucheIncluse = cotesInclus[i]
      const a = randint(-2, 2)
      const valeurGauche = randint(-3, 3)
      const valeurDroite = estContinue
        ? valeurGauche
        : randint(-3, 3, valeurGauche)
      const coefficientGauche = randint(-2, 2, 0)
      const coefficientDroite = randint(-2, 2, [0, coefficientGauche])
      const expressionGauche = expression(
        famille,
        a,
        valeurGauche,
        coefficientGauche,
      )
      const expressionDroite = expression(
        famille,
        a,
        valeurDroite,
        coefficientDroite,
      )
      const conditionGauche = gaucheIncluse ? `x\\leqslant ${a}` : `x<${a}`
      const conditionDroite = gaucheIncluse ? `x>${a}` : `x\\geqslant ${a}`

      const intervalleOuvertGauche = `$]-\\infty~;~${a}[$`
      const intervalleOuvertDroite = `$]${a}~;~+\\infty[$`

      const question = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par :
      $f(x)=\\begin{cases}
      ${expressionGauche} & \\text{si } ${conditionGauche},\\\\
      ${expressionDroite} & \\text{si } ${conditionDroite}.
      \\end{cases}$<br><br>
      ${numAlpha(0)} La fonction $f$ est-elle continue sur ${intervalleOuvertGauche} ?<br>
      ${numAlpha(1)} La fonction $f$ est-elle continue sur ${intervalleOuvertDroite} ?<br>
      ${numAlpha(2)} La fonction $f$ est-elle continue en $${a}$ ?<br>
      ${numAlpha(3)} Conclure sur la continuité de la fonction $f$ sur $\\mathbb{R}$.`

      const valeurFonction = gaucheIncluse ? valeurGauche : valeurDroite
      const valeurLimite = gaucheIncluse ? valeurDroite : valeurGauche
      const coteLimite = gaucheIncluse ? '+' : '-'
      const coteContenantA = gaucheIncluse ? '-' : '+'
      const intervalleContenantA = gaucheIncluse
        ? `$]-\\infty~;~${a}]$`
        : `$[${a}~;~+\\infty[$`
      const intervalleOuvertPourLimite = gaucheIncluse
        ? intervalleOuvertDroite
        : intervalleOuvertGauche
      const expressionAuPoint = gaucheIncluse
        ? expressionGauche
        : expressionDroite
      const expressionPourLimite = gaucheIncluse
        ? expressionDroite
        : expressionGauche
      const aSubstitue = `(${a})`
      const calculAuPoint = expressionAuPoint.replaceAll('x', aSubstitue)
      const calculLimite = expressionPourLimite.replaceAll('x', aSubstitue)

      let correction = `${numAlpha(0)} La fonction $x\\mapsto ${expressionGauche}$ est dérivable sur ${intervalleOuvertGauche}, donc la fonction $f$ est continue sur ${intervalleOuvertGauche}.<br><br>
      ${numAlpha(1)} La fonction $x\\mapsto ${expressionDroite}$ est dérivable sur ${intervalleOuvertDroite}, donc la fonction $f$ est continue sur ${intervalleOuvertDroite}.<br><br>
      ${numAlpha(2)} Comme la fonction $f$ est continue sur ${intervalleContenantA} et
      $f(${a})=${calculAuPoint}=${valeurFonction}$, alors :<br>
      $\\displaystyle\\lim_{x\\to ${a}^{${coteContenantA}}}f(x)=f(${a})=${valeurFonction}$.<br>
      D’autre part, sur l’intervalle ouvert ${intervalleOuvertPourLimite}, $f(x)=${expressionPourLimite}$. Donc :<br>
      $\\displaystyle\\lim_{x\\to ${a}^{${coteLimite}}}f(x)=\\lim_{x\\to ${a}^{${coteLimite}}}\\left(${expressionPourLimite}\\right)=${calculLimite}=${valeurLimite}$.<br>`

      if (estContinue) {
        correction += `Finalement, $\\displaystyle\\lim_{x\\to ${a}^-}f(x)=\\lim_{x\\to ${a}^+}f(x)=${valeurFonction}=f(${a})$. La fonction $f$ est donc continue en $${a}$.<br><br>
        ${numAlpha(3)}
        ${texteEnCouleurEtGras('La fonction ')}$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' est continue sur ')}$${miseEnEvidence('\\mathbb{R}')}$${texteEnCouleurEtGras('.')}`
      } else {
        correction += `Finalement, $\\displaystyle\\lim_{x\\to ${a}^-}f(x)=${valeurGauche}$ et $\\displaystyle\\lim_{x\\to ${a}^+}f(x)=${valeurDroite}$. Ces deux limites latérales sont différentes. La fonction $f$ n’est donc pas continue en $${a}$.<br><br>
        ${numAlpha(3)}
        ${texteEnCouleurEtGras('La fonction ')}$${miseEnEvidence('f')}$${texteEnCouleurEtGras(' n’est pas continue sur ')}$${miseEnEvidence('\\mathbb{R}')}$${texteEnCouleurEtGras('.')}`
      }

      if (
        this.questionJamaisPosee(
          i,
          famille,
          Number(estContinue),
          Number(gaucheIncluse),
          a,
          valeurGauche,
          valeurDroite,
          coefficientGauche,
          coefficientDroite,
        )
      ) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
