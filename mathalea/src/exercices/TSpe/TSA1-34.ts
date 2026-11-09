import { all, isEqual } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier une suite arithmético-géométrique'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '06/11/2026'

export const uuid = 'ee4a0'
export const refs = {
  'fr-fr': ['TSA1-34', 'TCA1-24'],
  'fr-ch': [],
}

/** Écrit le produit `coefficient × a^n` sans « 1× » ni « -1× ». */
function termeGeometrique(coefficient: number, a: number) {
  const puissance = `${a < 0 ? `(${a})` : a}^n`
  if (coefficient === 1) return puissance
  if (coefficient === -1) return `-${puissance}`
  return `${coefficient}\\times ${puissance}`
}

/**
 * Expression explicite d'une suite arithmético-géométrique
 * $u_{n+1}=au_n+b$ en passant par la limite supposée et la suite auxiliaire.
 * @author Stéphane Guyon
 */
export default class SuiteArithmeticoGeometriqueExpression extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer l’expression de $u_n$ en fonction de $n$.'
        : 'Pour chaque suite, déterminer l’expression de $u_n$ en fonction de $n$.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = choice([2, 3, 4, 5, -2, -3])
      const ell = randint(-6, 6, [0])
      const b = ell * (1 - a)
      const u0 = randint(-8, 8, [ell])
      const v0 = u0 - ell
      const relation = `${a}u_n${ecritureAlgebrique(b)}`

      if (!this.questionJamaisPosee(i, a, ell, u0)) continue

      const reponse = `${termeGeometrique(v0, a)}${ecritureAlgebrique(ell)}`
      let texte = `Soit $(u_n)$ la suite définie par $u_0=${u0}$ et, pour tout $n\\in\\mathbb N$, $u_{n+1}=${relation}$.`
      if (this.interactif) {
        texte += `<br>$u_n=$${ajouteChampTexteMathLive(this, i, `${KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets} ${KeyboardType.variableN}`)}`
      }

      let texteCorr = `$(u_n)$ est une suite arithmético-géométrique.<br>`
      texteCorr += `On considère la fonction $f$ définie sur $\\mathbb R$ par $f(x)=${a}x${ecritureAlgebrique(b)}$, de sorte que $u_{n+1}=f(u_n)$.<br>`
      texteCorr += `Comme $f$ est continue, si la suite $(u_n)$ converge, elle converge vers un réel $\\ell$ tel que $f(\\ell)=\\ell$.<br>`
      texteCorr += `$\\begin{aligned}\\ell=${a}\\ell${ecritureAlgebrique(b)}&\\iff ${1 - a}\\ell=${b}\\\\&\\iff \\ell=${ell}.\\end{aligned}$<br>`
      texteCorr += `Si la suite $(u_n)$ converge, elle converge donc vers $${ell}$.<br>`
      texteCorr += `Soit $(v_n)$ la suite définie par $v_n=u_n${ecritureAlgebrique(-ell)}$.<br>`
      texteCorr += `Soit $n\\in\\mathbb N$.<br>`
      texteCorr += `$\\begin{aligned}v_{n+1}&=u_{n+1}${ecritureAlgebrique(-ell)}\\\\&=${relation}${ecritureAlgebrique(-ell)}\\\\&=${a}u_n${ecritureAlgebrique(b - ell)}\\\\&=${a}\\times\\left(u_n${ecritureAlgebrique(-ell)}\\right)\\\\&=${a}v_n.\\end{aligned}$<br>`
      texteCorr += `Ainsi, pour tout $n\\in\\mathbb N$, $v_{n+1}=${a}v_n$, donc $(v_n)$ est une suite géométrique de raison $${a}$ et de premier terme $v_0=u_0${ecritureAlgebrique(-ell)}=${v0}$.<br>`
      texteCorr += `Rappel : si $(v_n)$ est une suite géométrique de raison $q$ et de premier terme $v_0$, alors, pour tout $n\\in\\mathbb N$, $v_n=v_0\\times q^n$.<br>`
      texteCorr += `Donc, pour tout $n\\in\\mathbb N$, $v_n=${termeGeometrique(v0, a)}$.<br>`
      texteCorr += `Or $v_n=u_n${ecritureAlgebrique(-ell)}$, donc $u_n=v_n${ecritureAlgebrique(ell)}$, c’est-à-dire :<br>`
      texteCorr += `$u_n=${miseEnEvidence(reponse)}$.`

      handleAnswers(this, i, {
        reponse: { value: reponse, compare: all([isEqual()]) },
      })

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
