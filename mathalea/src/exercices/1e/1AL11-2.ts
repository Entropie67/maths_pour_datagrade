import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiMoins,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
export const titre =
  "Calculer un terme d'une suite arithmétique ou géométrique"
export const interactifReady = true

export const dateDePublication = '29/09/2024'

/**
 *
 * @author Gilles Mora

*/
export const uuid = '3ae4a'

export const refs = {
  'fr-fr': ['1AL11-2', '1Gen-A202'],
  'fr-ch': [],
}
export default class TermesSASG extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '7'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Suite arithmétique avec premier terme u_0',
        '2 : Suite arithmétique avec premier terme u_1',
        '3 : Suite arithmétique avec premier terme u_p',
        '4 : Suite géométrique avec premier terme u_0',
        '5 : Suite géométrique avec premier terme u_1',
        '6 : Suite géométrique avec premier terme u_p',
        '7 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse
      const ListeNomS = ['u', 'v', 'w', 't']
      const NomS = choice(ListeNomS)
      let k
      let r
      let a
      let q
      let p
      let resultat
      switch (listeTypeDeQuestions[i]) {
        case 1:
          a = randint(-10, 10)
          k = randint(5, 15)
          r = randint(-10, 10, 0)
          reponse = texNombre(a + k * r, 0)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite arithmétique de raison $r=${r}$ et de premier terme $${NomS}_0=${a}$.<br>
          Calculer $${NomS}_{${k}}$.`
          if (this.correctionDetaillee) {
            texteCorr =
              "La forme explicite d'une suite arithmétique $(u_n)$ de raison $r$ et de premier terme $u_0$ est : $u_n=u_0+n\\times r$.<br>"
          } else {
            texteCorr = ''
          }
          texteCorr += `La suite $(${NomS}_n)$ est arithmétique de raison $r=${r}$ et de premier terme $${NomS}_0=${a}$.<br>
          On en déduit que pour tout $n\\in\\mathbb{N}$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_0+n\\times r\\\\
          ${NomS}_n&=${a}+n\\times ${ecritureParentheseSiMoins(r)}\\\\
           ${NomS}_n&=${a === 0 ? `${rienSi1(r)}n` : `${a}${ecritureAlgebriqueSauf1(r)}n`}
           \\end{aligned}$
          <br>Ainsi, `
          if (a === 0) {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_n=${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${r}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          } else {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_{${k}}=${a}${r === 1 ? `${ecritureAlgebrique(k)}` : `${-k}`} =${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${a}${ecritureAlgebrique(r)}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          }
          break
        case 2:
          a = randint(-10, 10)
          k = randint(5, 15)
          r = randint(-10, 10, 0)
          reponse = texNombre(a - r + k * r, 0)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite arithmétique de raison $r=${r}$ et de premier terme $${NomS}_1=${a}$.<br>
          Calculer $${NomS}_{${k}}$.`
          if (this.correctionDetaillee) {
            texteCorr =
              "La forme explicite d'une suite arithmétique $(u_n)$ de raison $r$ et de premier terme $u_1$ est : $u_n=u_1+(n-1)\\times r$.<br>"
          } else {
            texteCorr = ''
          }
          texteCorr += `
          La suite $(${NomS}_n)$ est arithmétique de raison $r=${r}$ et de premier terme $${NomS}_1=${a}$.<br>
          On en déduit que pour tout $n\\in\\mathbb{N}^*$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_1+(n-1)\\times r\\\\
          ${NomS}_n&=${a}+(n-1)\\times ${ecritureParentheseSiMoins(r)}\\\\
           ${NomS}_n&=${a - r === 0 ? `${rienSi1(r)}n$.` : `${a - r}${ecritureAlgebriqueSauf1(r)}n`}
           \\end{aligned}$<br>
          Ainsi, `
          if (a - r === 0) {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_n=${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${r}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          } else {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_{${k}}=${a - r}${r === 1 ? `${ecritureAlgebrique(k)}` : `${-k}`} =${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${a - r}${ecritureAlgebrique(r)}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          }
          break

        case 3:
          a = randint(-10, 10)
          k = randint(9, 15)
          r = randint(-10, 10, 0)
          p = randint(2, 4)
          reponse = texNombre(a + (k - p) * r, 0)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite arithmétique de raison $r=${r}$ avec $${NomS}_${p}=${a}$.<br>
            Calculer $${NomS}_{${k}}$.`
          if (this.correctionDetaillee) {
            texteCorr =
              'Si $(u_n)$ est une suite arithmétique  de raison $r$, alors pour tout entier naturel $n$ et $p$, on a $u_n=u_p+(n-p)\\times r$.<br>'
          } else {
            texteCorr = ''
          }
          texteCorr += `
              La suite $(${NomS}_n)$ est arithmétique de raison $r=${r}$ avec $${NomS}_${p}=${a}$.<br>
            On en déduit que pour tout $n\\in\\mathbb{N}$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_${p}+(n-${p})\\times r\\\\
          ${NomS}_n&=${a}+(n-${p})\\times ${ecritureParentheseSiMoins(r)}\\\\
          ${NomS}_n&=${a - p * r === 0 ? `=${rienSi1(r)}n` : `${a - p * r}${ecritureAlgebriqueSauf1(r)}n`}
           \\end{aligned}$<br>
          Ainsi, `
          if (a - p * r === 0) {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_n=${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${r}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          } else {
            if (r === 1 || r === -1) {
              texteCorr += `$${NomS}_{${k}}=${a - p * r}${r === 1 ? `${ecritureAlgebrique(k)}` : `${-k}`} =${miseEnEvidence(reponse)}$.`
            } else {
              texteCorr += `$${NomS}_{${k}}=${a - p * r}${ecritureAlgebrique(r)}\\times ${k} =${miseEnEvidence(reponse)}$.`
            }
          }
          break

        case 4:
          a = randint(-10, 10, 0)
          k = randint(5, 10)
          q = new Decimal(randint(8, 29, [10, 20])).div(10).mul(choice([-1, 1]))
          resultat = q.pow(k).mul(a)
          reponse = resultat.toFixed(1)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite géométrique de raison $q=${texNombre(q, 1)}$ et de premier terme $${NomS}_0=${a}$.<br>
            Calculer $${NomS}_{${k}}$.`
          texte += '<br>Donner la valeur arrondie au dixième.'
          if (this.correctionDetaillee) {
            texteCorr =
              "La forme explicite d'une suite géométrique $(u_n)$ de raison $q$ et de premier terme $u_0$ est : $u_n=u_0\\times q^n$.<br>"
          } else {
            texteCorr = ''
          }
          texteCorr += `La suite $(${NomS}_n)$ est géométrique de raison $q=${texNombre(q, 1)}$ et de premier terme $${NomS}_0=${a}$.<br>
          On en déduit que pour tout $n\\in\\mathbb{N}$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_0\\times q^n\\\\
          ${NomS}_n&=${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^n\\\\
           ${NomS}_{${k}}&=${a === 1 ? `${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k}}` : `${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k}}`}
           \\end{aligned}$<br>
           Ainsi, $${NomS}_{${k}}\\approx${miseEnEvidence(texNombre(resultat, 1))}$.`

          break
        case 5:
          a = randint(-10, 10, 0)
          k = randint(5, 10)
          q = new Decimal(randint(8, 29, [10, 20])).div(10).mul(choice([-1, 1]))
          resultat = q.pow(k - 1).mul(a)
          reponse = resultat.toFixed(1)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite géométrique de raison $q=${texNombre(q, 1)}$ et de premier terme $${NomS}_1=${a}$.<br>
            Calculer $${NomS}_{${k}}$.`
          texte += '<br>Donner la valeur arrondie au dixième.'
          if (this.correctionDetaillee) {
            texteCorr =
              "La forme explicite d'une suite géométrique $(u_n)$ de raison $q$ et de premier terme $u_1$ est : $u_n=u_1\\times q^{n-1}$.<br>"
          } else {
            texteCorr = ''
          }
          texteCorr += `La suite $(${NomS}_n)$ est géométrique de raison $q=${texNombre(q, 1)}$
          et de premier terme $${NomS}_1=${a}$.<br>
          On en déduit que pour tout $n\\in\\mathbb{N}^*$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_1\\times q^{n-1}\\\\
          ${NomS}_n&=${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^{n-1}\\\\
           ${NomS}_{${k}}&=${a === 1 ? `${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k - 1}}` : `${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k - 1}}`}
           \\end{aligned}$<br>
           Ainsi, $${NomS}_{${k}}\\approx${miseEnEvidence(texNombre(resultat, 1))}$.`

          break

        case 6:
          a = randint(-10, 10, 0)
          k = randint(9, 11)
          p = randint(2, 4)
          q = new Decimal(randint(8, 29, [10, 20])).div(10).mul(choice([-1, 1]))
          resultat = q.pow(k - p).mul(a)
          reponse = resultat.toFixed(1)
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte = `$(${NomS}_n)$ est une suite géométrique de raison $q=${texNombre(q, 1)}$ avec $${NomS}_${p}=${a}$.<br>
            Calculer $${NomS}_{${k}}$.`
          texte += '<br>Donner la valeur arrondie au dixième.'
          if (this.correctionDetaillee) {
            texteCorr =
              'Si $(u_n)$ est une suite géométrique  de raison $q$, alors pour tout entier naturel $n$ et $p$, on a $u_n=u_p\\times q^{n-p}$.<br>'
          } else {
            texteCorr = ''
          }
          texteCorr += ` La suite $(${NomS}_n)$ est géométrique de raison $q=${texNombre(q, 1)}$ avec $${NomS}_${p}=${a}$.<br>
          On en déduit que pour tout $n\\in\\mathbb{N}$,  <br>
          $\\begin{aligned}
          ${NomS}_n&=${NomS}_{${p}}\\times q^{n-${p}}\\\\
          ${NomS}_n&=${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^{n-${p}}\\\\
           ${NomS}_{${k}}&=${a === 1 ? `${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k - p}}` : `${a}\\times ${ecritureParentheseSiMoins(texNombre(q, 1))}^{${k - p}}`}
           \\end{aligned}$<br>
           Ainsi, $${NomS}_{${k}}\\approx${miseEnEvidence(texNombre(resultat, 1))}$.`

          break
      }

      if (
        listeTypeDeQuestions[i] === 1 ||
        listeTypeDeQuestions[i] === 2 ||
        listeTypeDeQuestions[i] === 3
      ) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: `$${NomS}_{${k}}=$`,
          })
      } else {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: `$${NomS}_{${k}}\\approx$`,
          })
      }
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
