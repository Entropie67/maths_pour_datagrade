import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '5701a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une inéquation'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4AGs2026 extends ExerciceQcmACourt {
  // Inéquation ax + b (sym) 0 avec a < 0 : la division par a impose de changer le sens.
  // symFlip : symbole après changement de sens. borneADroite : solution de la forme [x0;+∞[.
  // ouvert : inégalité stricte (crochet ouvert sur la borne).
  private appliquerLesValeurs(
    a: number,
    b: number,
    sym: string,
    symFlip: string,
    borneADroite: boolean,
    ouvert: boolean,
  ): void {
    const aTermeX = a === -1 ? '-x' : `${a}x`
    const signeConst = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`
    const x0 = -b / a // borne solution (entière par construction)

    const intervalle = (v: number, droite: boolean, ouv: boolean) =>
      droite
        ? `${ouv ? ']' : '['}${v}\\,;\\,+\\infty[`
        : `]-\\infty\\,;\\,${v}${ouv ? '[' : ']'}`

    const correct = intervalle(x0, borneADroite, ouvert)
    const d1 = intervalle(x0, !borneADroite, ouvert) // oubli du changement de sens
    const d2 = intervalle(-x0, !borneADroite, ouvert) // oubli du sens + erreur de signe sur la borne
    const d3 = intervalle(-x0, borneADroite, ouvert) // erreur de signe sur la borne

    this.enonce = `On considère l'inéquation sur $\\mathbb{R}$ :<br>`
    this.enonce += `$(I) \\quad ${aTermeX} ${signeConst} ${sym} 0$.<br>`
    this.enonce += `On note $S$ l'ensemble des solutions de l'inéquation $(I)$.<br>`
    this.enonce += `On peut affirmer que :`

    this.correction = `On résout l'inéquation $(I)$ :<br>`
    this.correction += `$\\begin{aligned}
${aTermeX} ${signeConst} &${sym} 0\\\\
${aTermeX} &${sym} ${-b}\\\\
x&${symFlip} \\dfrac{${-b}}{${a}}\\text{ (on divise les deux membres par }${a} < 0, \\text{on change le sens de l'inégalité)}\\\\
x&${symFlip} ${x0}
\\end{aligned}$<br><br>`
    this.correction += `Donc $S = ${miseEnEvidence(correct)}$.`

    this.reponses = [
      `$S = ${correct}$`,
      `$S = ${d1}$`,
      `$S = ${d2}$`,
      `$S = ${d3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : -2x + 2 ≥ 0  =>  S = ]-∞ ; 1]
    this.appliquerLesValeurs(-2, 2, '\\geqslant', '\\leqslant', false, false)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const inequations = [
      {
        sym: '\\geqslant',
        symFlip: '\\leqslant',
        borneADroite: false,
        ouvert: false,
      },
      {
        sym: '\\leqslant',
        symFlip: '\\geqslant',
        borneADroite: true,
        ouvert: false,
      },
      { sym: '>', symFlip: '<', borneADroite: false, ouvert: true },
      { sym: '<', symFlip: '>', borneADroite: true, ouvert: true },
    ]

    let compteur = 0
    do {
      const a = choice([-1, -2, -3, -4]) // coefficient de x négatif (division par un négatif)
      const x0 = choice([-4, -3, -2, -1, 1, 2, 3, 4]) // borne non nulle
      const b = -a * x0 // garantit -b/a = x0 entier
      const ineq = choice(inequations)
      this.appliquerLesValeurs(
        a,
        b,
        ineq.sym,
        ineq.symFlip,
        ineq.borneADroite,
        ineq.ouvert,
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /On peut affirmer que :\s*$/,
        "Donner l'ensemble $S$ sous forme d'un intervalle.",
      )
    // La bonne réponse du QCM est de la forme « $S = ]-\\infty\\,;\\,1]$ » : on ne garde que l'intervalle
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/^\$S = /, '')
        .replace(/\$$/, '')
        .replace(/\\,/g, '')
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { intervalle: true })
    this.texteAvantReponseCourte = '$S=$'
    this.clavierReponseCourte = KeyboardType.clavierEnsemble
  }
}
