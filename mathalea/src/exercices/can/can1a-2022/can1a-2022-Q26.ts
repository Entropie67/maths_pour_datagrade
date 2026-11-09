import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la valeur d'une suite définie par un algorithme"
export const interactifReady = true

export const uuid = '5uv2z'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q26 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(uInit?: number, seuil?: number, pas?: number) {
    if (uInit == null || seuil == null || pas == null) {
      uInit = randint(1, 5)
      seuil = randint(6, 20)
      pas = randint(2, 5)
    }

    this.question = `Que renvoie l'instruction $\\texttt{suite(${uInit})}$ ?<br>$\\begin{array}{|l|}
    \\hline\\\\
    \\texttt{def suite(u) :}  \\\\
    ${sp(6)} \\texttt{n=0}\\\\
    ${sp(6)} \\texttt{while u<${seuil}:}\\\\
    ${sp(12)} \\texttt{u = u+${pas}}\\\\
    ${sp(12)} \\texttt{n = n+1}\\\\
    ${sp(6)} \\texttt{return n}\\\\
    \\hline
    \\end{array}$`

    let u = uInit
    let n = 0
    let texteCorr = `L'instruction $\\texttt{while u<${seuil}}$ signifie : tant que u<${seuil}.<br>
On calcule les valeurs successives des  variables u et n. On s'arrête dès que u dépasse $${seuil}$ :<br>
On a au départ, u=${uInit} et n=0, puis, `

    while (u < seuil) {
      texteCorr += `<br>n = ${n + 1} et u = ${u} $ +$ ${pas} = ${u + pas} `
      n = n + 1
      u = pas + u
    }
    texteCorr += `$\\geqslant ${seuil}$. Donc l'algorithme retourne $${miseEnEvidence(n)}$.`

    this.correction = texteCorr
    this.reponse = n

    this.canEnonce = `$\\begin{array}{|l|}
    \\hline\\\\
    \\texttt{def suite(u) :}  \\\\
   ${sp(6)} \\texttt{n=0}\\\\
   ${sp(6)} \\texttt{while u<${seuil}:}\\\\
   ${sp(12)} \\texttt{u = u+${pas}}\\\\
   ${sp(12)} \\texttt{n = n+1}\\\\
   ${sp(6)} \\texttt{return n}\\\\
  \\hline
  \\end{array}$`
    this.canReponseACompleter = `$\\texttt{suite(${uInit})}$ renvoie $\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 5, 2)
    else this.enonce()
  }
}
