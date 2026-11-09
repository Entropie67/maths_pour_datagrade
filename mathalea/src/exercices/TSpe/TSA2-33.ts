import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { numAlpha } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Étudier les limites aux bornes du domaine de définition d'une fonction rationnelle"
export const dateDePublication = '08/08/2026'
export const interactifReady = false

export const uuid = '34375'
export const refs = {
  'fr-fr': ['TSA2-33', 'TCA2-33'],
  'fr-ch': [],
}

type PuissanceDenominateur = 1 | 2

function limiteSelonSigne(signe: number): '+\\infty' | '-\\infty' {
  return signe > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Limite en un réel de b/(cx+d) ou de b/(cx+d)^2 et asymptote verticale.
 * @author Stéphane Guyon
 */
export default class LimiteEtAsymptoteVerticale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    const puissance = choice([1, 2] as PuissanceDenominateur[])
    const a = randint(-5, 5)
    const b = randint(-9, 9, 0)
    const c = randint(-6, 6, 0)
    const d = -c * a
    const affine = reduireAxPlusB(c, d)
    const denominateur = puissance === 1 ? affine : `\\left(${affine}\\right)^2`
    const expression = `\\dfrac{${b}}{${denominateur}}`
    const asymptote = `x=${a}`

    const texte = `Soit $f$ la fonction définie sur $D_f=]-\\infty~;~${a}[\\cup]${a}~;~+\\infty[$ par $f(x)=${expression}$.<br>
    On note $\\mathcal C_f$ sa courbe représentative.<br><br>
    ${numAlpha(0)} Calculer $\\displaystyle \\lim_{x\\to-\\infty}f(x)$, $\\displaystyle \\lim_{x\\to ${a}^-}f(x)$, $\\displaystyle \\lim_{x\\to ${a}^+}f(x)$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)$.<br><br>
    ${numAlpha(1)} Interpréter graphiquement les résultats.`

    let correctionLimite: string
    let limitesEnA: string
    if (puissance === 1) {
      const signeZeroGauche = c > 0 ? -1 : 1
      const signeZeroDroite = -signeZeroGauche
      const zeroGauche = signeZeroGauche > 0 ? '0^+' : '0^-'
      const zeroDroite = signeZeroDroite > 0 ? '0^+' : '0^-'
      const limiteGauche = limiteSelonSigne(b * signeZeroGauche)
      const limiteDroite = limiteSelonSigne(b * signeZeroDroite)
      limitesEnA = `$\\displaystyle \\lim_{x\\to ${a}^-}f(x)=${miseEnEvidence(limiteGauche)}$ et $\\displaystyle \\lim_{x\\to ${a}^+}f(x)=${miseEnEvidence(limiteDroite)}$`

      correctionLimite = `${numAlpha(0)} Chercher les limites aux bornes de $D_f$ revient à chercher les limites en $-\\infty$, en $${a}$ et en $+\\infty$.<br><br>
      $\\bullet$ En $-\\infty$ et en $+\\infty$ :<br>
      Comme $\\displaystyle \\lim_{x\\to-\\infty}(${affine})=${c > 0 ? '-\\infty' : '+\\infty'}$ et $\\displaystyle \\lim_{x\\to+\\infty}(${affine})=${c > 0 ? '+\\infty' : '-\\infty'}$, on obtient par quotient :<br>
      $\\displaystyle \\lim_{x\\to-\\infty}f(x)=0$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=0$.<br>
      <br>$\\bullet$ En $${a}$ :<br>
      On a $\\displaystyle \\lim_{x\\to ${a}^-}(${affine})=${zeroGauche}$ et $\\displaystyle \\lim_{x\\to ${a}^+}(${affine})=${zeroDroite}$.<br>
      Enfin, $\\displaystyle \\lim_{x\\to ${a}}${b}=${b}$.<br>
      Par quotient :<br>
      $\\displaystyle \\lim_{x\\to ${a}^-}f(x)=${miseEnEvidence(limiteGauche)}$ et $\\displaystyle \\lim_{x\\to ${a}^+}f(x)=${miseEnEvidence(limiteDroite)}$.<br>
      Les limites à gauche et à droite étant différentes, la limite de $f$ en $${a}$ n'existe pas.`
    } else {
      const limite = limiteSelonSigne(b)
      limitesEnA = `$\\displaystyle \\lim_{x\\to ${a}^-}f(x)=${miseEnEvidence(limite)}$ et $\\displaystyle \\lim_{x\\to ${a}^+}f(x)=${miseEnEvidence(limite)}$`
      correctionLimite = `${numAlpha(0)} Chercher les limites aux bornes de $D_f$ revient à chercher les limites en $-\\infty$, en $${a}$ et en $+\\infty$.<br><br>
      $\\bullet$ En $-\\infty$ et en $+\\infty$ :<br>
      Comme $\\displaystyle \\lim_{x\\to-\\infty}(${affine})^2=+\\infty$ et $\\displaystyle \\lim_{x\\to+\\infty}(${affine})^2=+\\infty$, on obtient par quotient :<br>
      $\\displaystyle \\lim_{x\\to-\\infty}f(x)=0$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=0$.<br>
      <br>$\\bullet$ En $${a}$ :<br>
      On a $\\displaystyle \\lim_{x\\to ${a}^-}(${affine})^2=0^+$ et $\\displaystyle \\lim_{x\\to ${a}^+}(${affine})^2=0^+$.<br>
      Enfin, $\\displaystyle \\lim_{x\\to ${a}}${b}=${b}$.<br>
      Par quotient :<br>
      $\\displaystyle \\lim_{x\\to ${a}^-}f(x)=${miseEnEvidence(limite)}$ et $\\displaystyle \\lim_{x\\to ${a}^+}f(x)=${miseEnEvidence(limite)}$.<br>
      On en déduit que $\\displaystyle \\lim_{x\\to ${a}}f(x)=${miseEnEvidence(limite)}$.`
    }

    const correctionGraphique = `${numAlpha(1)} On a ${limitesEnA}. La courbe $\\mathcal C_f$ admet donc une asymptote verticale d'équation $${miseEnEvidence(asymptote)}$.<br>
    De plus, $\\displaystyle \\lim_{x\\to-\\infty}f(x)=0$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=0$. La courbe $\\mathcal C_f$ admet donc une asymptote horizontale d'équation $${miseEnEvidence('y=0')}$.`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = `${correctionLimite}<br><br>${correctionGraphique}`
    listeQuestionsToContenu(this)
  }
}
