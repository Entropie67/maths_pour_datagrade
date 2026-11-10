import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Prouver que $3$ points de l’espace sont ou non alignés.'
export const interactifReady = true

export const dateDePublication = '27/11/2025'
export const uuid = '748e6'

export const refs = {
  'fr-fr': ['TSG2-15'],
  'fr-ch': ['3G93-10'],
}
/**
 * @author Stéphane Guyon
 */
export default class ExerciceAlignementEspace extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // scénario : aligné ou non
      const casAligne = randint(0, 1) === 1

      // point A
      const xA = randint(-5, 5)
      const yA = randint(-5, 5)
      const zA = randint(-5, 5)

      // choisir dx, dy, dz chacun non nuls (évite que xB-xA etc. soient nuls)
      const dx = randint(-5, 5, [0])

      const dy = randint(-5, 5, [0])

      const dz = randint(-5, 5, [0])

      // construire B (k1 != 0) et C
      const k1 = randint(1, 4)
      const xB = xA + k1 * dx
      const yB = yA + k1 * dy
      const zB = zA + k1 * dz

      let xC: number, yC: number, zC: number
      const k2 = randint(-4, 4, [0, k1])
      xC = xA + k2 * dx
      yC = yA + k2 * dy
      zC = zA + k2 * dz

      // C initialement sur la droite (k2 non nul), puis perturbation pour casser l'alignement
      if (!casAligne) {
        // perturber C sur une coordonnée pour garantir non-colinéarité
        const coord = randint(1, 3)
        if (coord === 1) xC += 1
        else if (coord === 2) yC += 1
        else zC += 1
      }
      // Une composante de AC peut être nulle (point C perturbé) : l'égalité est alors impossible.
      const exprimeK = (n: number, d: number) =>
        d === 0
          ? '\\text{impossible}'
          : new FractionEtendue(n, d).texFractionSimplifiee
      const kX = exprimeK(xB - xA, xC - xA)
      const kY = exprimeK(yB - yA, yC - yA)
      const kZ = exprimeK(zB - zA, zC - zA)
      const texte = `Dans l’espace, muni d'un repère orthonormé, on considère trois points  :<br>
      $A(${xA}~;~${yA}~;~${zA})$, $B(${xB}~;~${yB}~;~${zB})$ et $C(${xC}~;~${yC}~;~${zC})$.<br><br>
Les points $A$, $B$ et $C$ sont-ils alignés ? Justifier votre réponse.`

      let texteCorr = `La méthode consiste à savoir si les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires.<br>
        On cherche s'il existe un réel $k$ tel que  $\\overrightarrow{AB} = k\\overrightarrow{AC}$.<br>
        Pour le vérifier, on calcule les coordonnées des deux vecteurs, en sachant que  $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A\\\\y_B - y_A\\\\z_B - z_A\\end{pmatrix}$. <br> On obtient $\\overrightarrow{AB}\\begin{pmatrix}${xB} ${ecritureAlgebrique(-xA)}\\\\${yB} ${ecritureAlgebrique(-yA)}\\\\${zB} ${ecritureAlgebrique(-zA)}\\end{pmatrix}$
      d'où  $\\overrightarrow{AB}\\begin{pmatrix}${xB - xA}\\\\${yB - yA}\\\\${zB - zA}\\end{pmatrix}$ .<br>
       Il vient de la même manière  $\\overrightarrow{AC}\\begin{pmatrix}${xC - xA}\\\\${yC - yA}\\\\${zC - zA}\\end{pmatrix}$.<br>`

      // test robuste de colinéarité : on calcule k à partir d'une composante non nulle de AC
      texteCorr += `$\\overrightarrow{AB} = k\\overrightarrow{AC}$
      $\\iff \\begin{cases}
     ${xB - xA} = ${rienSi1(xC - xA)} k\\\\
     ${yB - yA} = ${rienSi1(yC - yA)} k\\\\
      ${zB - zA} = ${rienSi1(zC - zA)} k
      \\end{cases}$ $\\iff \\begin{cases}
     k= ${kX}\\\\
     k= ${kY}\\\\
      k= ${kZ}
      \\end{cases}$<br><br>`

      if (casAligne) {
        texteCorr += `On vient de prouver que $\\overrightarrow{AB} = ${kX}\\overrightarrow{AC}$. <br>Les vecteurs sont colinéaires.<br>`
        texteCorr += `Les points $A, \\,B$ et $C$ sont donc alignés : ${texteEnCouleurEtGras('oui')}.`
      } else {
        texteCorr += `On ne trouve pas un réel $k$ vérifiant simultanément les trois égalités.<br>`
        texteCorr += `Les vecteurs ne sont pas colinéaires. Les points $A, \\,B$ et $C$ ne sont pas alignés : ${texteEnCouleurEtGras('non')}.`
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.vFON, {
            texteAvant: `<br>Réponse (O (Oui) ou N (Non)) : `,
          })

        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: casAligne ? ['oui', 'O'] : ['non', 'N'],
            options: { texteSansCasse: true },
          },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
