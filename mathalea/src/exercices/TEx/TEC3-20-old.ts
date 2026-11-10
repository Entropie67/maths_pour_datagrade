// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 91bbd continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  listePour2PiSur3,
  listePour3PiSur4,
  listePour5PiSur6,
  listePourMoins2PiSur3,
  listePourMoins3PiSur4,
  listePourMoins5PiSur6,
  listePourMoinsPiSur3,
  listePourMoinsPiSur4,
  listePourMoinsPiSur6,
  listePourPiSur3,
  listePourPiSur4,
  listePourPiSur6,
} from '../../lib/mathFonctions/Complexe'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Utiliser $\\cos(\\theta+\\theta^\\prime)=\\cos(\\theta)\\cos(\\theta^\\prime)-\\sin(\\theta)\\sin(\\theta^\\prime)$'
export const interactifReady = true

export const uuid = '91bbd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const dateDePublication = '18/08/2024'

/**
 * Transformer acos(wt)+bsin(wt) en A.cos(wt+phi)
 * @author Jean-claude Lhote
 */

export default class AcosOmegaTPlusBSinOmegaT extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    const listeDeValeurs = combinaisonListes(
      [
        ...listePourPiSur3,
        ...listePourPiSur4,
        ...listePourPiSur6,
        ...listePour2PiSur3,
        ...listePour3PiSur4,
        ...listePour5PiSur6,
        ...listePourMoinsPiSur3,
        ...listePourMoinsPiSur4,
        ...listePourMoinsPiSur6,
        ...listePourMoins2PiSur3,
        ...listePourMoins3PiSur4,
        ...listePourMoins5PiSur6,
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const { a, b, A, aSurA, moinsBSurA, phi } = listeDeValeurs[i]
      const w = randint(1, 5) * choice([-1, 1])
      const moinsB =
        b === '1'
          ? '-'
          : b === '-1'
            ? '+'
            : b.startsWith('-')
              ? `+${b.substring(1)}`
              : `-${b}`
      let texte = `Soit la fonction $f(t)=${a === '1' ? '' : a === '-1' ? '-' : a}\\cos(${rienSi1(w)}t)${moinsB}\\sin(${rienSi1(w)}t)$.<br>`
      texte += `Exprimer $f(t)$ sous la forme $Acos(${rienSi1(w)}t+\\phi)$.`
      let texteCorr = `Nous devons exprimer la fonction $f(t)=${a === '1' ? '' : a === '-1' ? '-' : a}\\cos(${rienSi1(w)}t)${moinsB}\\sin(${rienSi1(w)}t)$ sous la forme $Acos(${rienSi1(w)}t+\\phi)$.<br>`
      texteCorr +=
        'Nous allons utiliser la formule $\\cos(\\theta+\\theta^\\prime)=\\cos(\\theta)\\cos(\\theta^\\prime)-\\sin(\\theta)\\sin(\\theta^\\prime)$ :<br>'
      texteCorr += `Posons $f(t)=a\\cos(${rienSi1(w)}t)-b\\sin(${rienSi1(w)}t)$ : soit, $a=${a}$ et $b=${b}$.<br>`
      texteCorr += `Calculons $A=\\sqrt{a^2+b^2}=\\sqrt{${a.startsWith('-') ? `(${a})` : a}^2+${b.startsWith('-') ? `(${b})` : b}^2}=${A}$.<br>`
      texteCorr += `Ainsi, $\\dfrac{a}{A}=\\dfrac{${a}}{${A}}${aSurA.includes(`{${A}}`) ? '' : `=${aSurA}`}$ et $-\\dfrac{b}{A}=-\\dfrac{${b}}{${A}}${moinsBSurA.includes(`${A}`) ? '' : `=${moinsBSurA}`}$.<br>`
      texteCorr += `D'où, $\\dfrac{f(t)}{${A}}=${aSurA}\\cos(${rienSi1(w)}t)${moinsBSurA}\\sin(${rienSi1(w)}t)$.<br>`
      texteCorr += `On reconnait ici : $\\cos(${phi})=${aSurA}$ et $\\sin(${phi})=${moinsBSurA.startsWith('-(') ? moinsBSurA.substring(2, moinsBSurA.length - 1) : moinsBSurA.substring(1)}$.<br>`
      texteCorr += `On a donc bien une expression de la forme $Acos(${rienSi1(w)}t+\\phi)$ avec $\\phi=${phi}$.<br>`

      const value = `${A}\\cos(${rienSi1(w)}t${phi.startsWith('-') ? phi : `+${phi}`})`
      texteCorr += `Donc, $f(t)=${miseEnEvidence(value)}$.`

      if (this.questionJamaisPosee(i, a, b, w)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.grecTrigo, {
            texteAvant: '<br>$f(t)=$',
          })

        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, { reponse: { value } })
        i++
      }
      cpt++
    }
  }
}
