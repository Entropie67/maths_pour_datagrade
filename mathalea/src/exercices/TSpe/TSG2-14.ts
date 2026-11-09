import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer les coordonnées d’un point défini par une combinaison de vecteurs'
export const interactifReady = true

export const dateDePublication = '23/11/2024'
export const dateDeModifImportante = '24/12/2025'
export const uuid = '8e145'

export const refs = {
  'fr-fr': ['TSG2-14'],
  'fr-ch': ['3G92-13'],
}
/**
 * @author Stéphane Guyon
 */

export default class ExercicePointParCombinaison extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const xA = randint(-4, 4)
      const yA = randint(-4, 4)
      const zA = randint(-4, 4)

      // vecteur AB non nul
      const uAB = randint(-4, 4, 0)
      const vAB = randint(-4, 4, 0)
      const wAB = randint(-4, 4, 0)

      const xB = xA + uAB
      const yB = yA + vAB
      const zB = zA + wAB

      // vecteur AC non nul
      let uAC = randint(-3, 3, 0)
      const vAC = randint(-3, 3, 0)
      const wAC = randint(-3, 3, 0)
      if (uAC === 0 && vAC === 0 && wAC === 0) {
        uAC = -1
      }
      const xC = xA + uAC
      const yC = yA + vAC
      const zC = zA + wAC

      // coefficients de combinaison (pas simultanément nuls)
      let k = randint(-5, 5, [-1, 0, 1])
      const z = randint(-5, 5, [-1, 0, 1])
      if (k === 0 && z === 0) {
        k = 1
      }

      if (
        this.questionJamaisPosee(i, xA, yA, zA, xB, yB, zB, xC, yC, zC, k, z)
      ) {
        const uAM = k * uAB + z * uAC
        const vAM = k * vAB + z * vAC
        const wAM = k * wAB + z * wAC

        const xM = xA + uAM
        const yM = yA + vAM
        const zM = zA + wAM

        let texte = `Dans l’espace muni d’un repère orthonormé, on considère les points
$A(${xA}~;~${yA}~;~${zA})$, $B(${xB}~;~${yB}~;~${zB})$ et $C(${xC}~;~${yC}~;~${zC})$.
<br>Déterminer les coordonnées du point $M$ tel que $\\overrightarrow{AM} = ${k}\\,\\overrightarrow{AB} ${ecritureAlgebrique(z)}\\,\\overrightarrow{AC}$.`

        let texteCorr = `On calcule d’abord $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ :<br>
On sait que $\\overrightarrow{AB}\\begin{pmatrix}x_B-x_A\\\\y_B-y_A\\\\z_B-z_A\\end{pmatrix}$ d'où  $\\overrightarrow{AB}\\begin{pmatrix}${xB}${ecritureAlgebrique(-xA)}\\\\${yB}${ecritureAlgebrique(-yA)}\\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ et $\\overrightarrow{AB}\\begin{pmatrix}${uAB}\\\\${vAB}\\\\${wAB}\\end{pmatrix}$  puis  $${k}\\overrightarrow{AB}\\begin{pmatrix}${k * uAB}\\\\${k * vAB}\\\\${k * wAB}\\end{pmatrix}$.<br>
De même : $\\overrightarrow{AC}\\begin{pmatrix}${uAC}\\\\${vAC}\\\\${wAC}\\end{pmatrix}$  donc  $${z}\\overrightarrow{AC}\\begin{pmatrix}${z * uAC}\\\\${z * vAC}\\\\${z * wAC}\\end{pmatrix}$.<br>
On en déduit alors  $${k}\\,\\overrightarrow{AB} ${ecritureAlgebrique(z)}\\,\\overrightarrow{AC}\\begin{pmatrix} ${k * uAB + z * uAC}\\\\${k * vAB + z * vAC}\\\\${k * wAB + z * wAC}\\end{pmatrix}$.<br>
 Soit $M(x;y;z)$ le point cherché. On a alors $\\overrightarrow{AM}\\begin{pmatrix}x - x_A\\\\y - y_A\\\\z - z_A\\end{pmatrix}$ d'où $\\overrightarrow{AM}\\begin{pmatrix}x${ecritureAlgebrique(-xA)}\\\\y${ecritureAlgebrique(-yA)}\\\\z${ecritureAlgebrique(-zA)}\\end{pmatrix}$ .<br>`
        texteCorr += ` $\\overrightarrow{AM} = ${k}\\,\\overrightarrow{AB} ${ecritureAlgebrique(z)}\\,\\overrightarrow{AC}
\\iff \\begin{cases}x${ecritureAlgebrique(-xA)}=${k * uAB + z * uAC}\\\\y${ecritureAlgebrique(-yA)}=${k * vAB + z * vAC}\\\\z${ecritureAlgebrique(-zA)}=${k * wAB + z * wAC}\\end{cases}
\\iff\\begin{cases}x=${xM}\\\\y=${yM}\\\\z=${zM}\\end{cases}$.<br>`
        texteCorr += `Le point $M$ a donc pour coordonnées :`
        texteCorr += `$M\\left(${miseEnEvidence(xM)}\\,;\\,${miseEnEvidence(yM)}\\,;\\,${miseEnEvidence(zM)}\\right)$.`

        if (this.interactif) {
          texte +=
            '<br><br>Coordonnées de $M$  ' +
            remplisLesBlancs(
              this,
              i,
              '\\left(%{champ1}~;~%{champ2}~;~%{champ3}\\right)',
              KeyboardType.clavierDeBase,
            )
          handleAnswers(this, i, {
            champ1: { value: xM },
            champ2: { value: yM },
            champ3: { value: zM },
          })
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
