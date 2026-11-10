import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { choice } from '../../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../../lib/outils/deprecatedFractions'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { arrondi } from '../../../lib/outils/nombres'

export const titre = 'Déterminer une relation de récurrence'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = '1eb6e'

export const refs = {
  'fr-fr': ['can1S1-04'],
  'fr-ch': ['autres-12'],
}
export default class RelationRec extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nomSuite = ['u', 'v', 'w']
    const s = choice(nomSuite)
    for (
      let i = 0, texte, texteCorr, a, b, c, T, proportion, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        choice([1, 1, 2, 3, 4]) //
      ) {
        case 1: // magazine arithmetico-geo
          a = randint(1, 30)
          b = randint(1, 10) * 100
          c = randint(5, 20) * 1000
          texte = `Chaque année, un magazine perd $${a}${sp(1)}\\%$ de ses abonnés mais en gagne $${texNombre(b)}$ nouveaux.<br>
          En $2020$, ce magazine compte $${texNombre(c)}$ abonnés.

          On note, pour tout $n\\in\\mathbb{N}$, $${s}_{n}$ le nombre d'abonnés en $2020+n$.<br>`
          if (this.interactif) {
            texte += `On a alors : $${s}_{n+1} = a~${s}_{n} + b$<br>avec `
            texte += remplisLesBlancs(
              this,
              i,
              `a~=~%{champ1}~\\text{ et }~b~=~%{champ2}`,
            )
          } else {
            texte += ` Donner le premier terme de cette suite et l'expression de $${s}_{n+1}$ en fonction de $${s}_{n}$. `
          }
          texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-${texNombre(a / 100)}${s}_{n}}_{\\text{Perte de } ${a}${sp(1)}\\%} +${texNombre(b)}=${texNombre(1 - a / 100)}${s}_{n}+${texNombre(b)}$.<br>


          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`${texNombre(1 - a / 100)}${s}_{n}+${texNombre(b)}`)}$.<br>`
          handleAnswers(this, i, {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: arrondi(1 - a / 100) },
            champ2: { value: b },
          })
          this.canEnonce = texte

          break

        case 2: // magazine geo
          a = randint(1, 15)
          b = randint(1, 10) * 100
          c = randint(5, 20) * 1000

          texte = `Chaque année, un magazine perd $${a}${sp()} \\%$ de ses abonnés.<br>
          En $2020$, ce magazine compte $${texNombre(c)}$ abonnés.
          On note, pour tout $n\\in\\mathbb{N}$, $${s}_{n}$ le nombre d'abonnés en $2020+n$.<br>`
          if (this.interactif) {
            texte += `On a alors : $${s}_{n+1} = a~${s}_{n} + b$<br>avec `
            texte += remplisLesBlancs(
              this,
              i,
              `a~=~%{champ1}~\\text{ et }~b~=~%{champ2}`,
            )
          } else {
            texte += ` Donner le premier terme de cette suite et l'expression de $${s}_{n+1}$ en fonction de $${s}_{n}$.  `
          }

          texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-${texNombre(a / 100)}${s}_{n}}_{\\text{Perte de } ${a}${sp(1)}\\%} =${texNombre(1 - a / 100)}${s}_{n}$.<br>


          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`${texNombre(1 - a / 100)}${s}_{n}`)}$.<br>`
          handleAnswers(this, i, {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: arrondi(1 - a / 100) },
            champ2: { value: 0 },
          })

          this.canEnonce = texte

          break

        case 3: // magazine arith
          a = randint(1, 15) * 100
          b = randint(1, 10) * 100
          c = randint(5, 20) * 1000
          texte = `Chaque année, un magazine perd $${texNombre(a)}$ abonnés.<br>
          En $2020$, ce magazine compte $${texNombre(c)}$ abonnés.
          On note, pour tout $n\\in\\mathbb{N}$, $${s}_{n}$ le nombre d'abonnés en $2020+n$.<br>`
          if (this.interactif) {
            texte += `On a alors : $${s}_{n+1} = a~${s}_{n} + b$<br>avec `
            texte += remplisLesBlancs(
              this,
              i,
              `a~=~%{champ1}~\\text{ et }~b~=~%{champ2}`,
            )
          } else {
            texte += ` Donner le premier terme de cette suite et l'expression de $${s}_{n+1}$ en fonction de $${s}_{n}$.  `
          }

          texteCorr = `On a $${s}_{n+1}=${s}_{n}-${texNombre(a)}$.<br>
          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`${s}_{n}-${texNombre(a)}`)}$.<br>`
          handleAnswers(this, i, {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: 1 },
            champ2: { value: -a },
          })

          this.canEnonce = texte

          break
        case 4:
        default: // magazine arith/geo avec tiers....
          proportion = [
            'le quart',
            'le tiers',
            'le dixième',
            'le cinquième',
            'la moitié',
          ] //
          a = randint(1, 15) * 100
          b = randint(1, 10) * 100
          c = randint(5, 20) * 1000
          T = choice(proportion)
          texte = `Chaque année, un magazine perd ${T} de ses abonnés mais en gagne $${b}$ nouveaux.<br>
          En $2020$, ce magazine compte $${texNombre(c)}$ abonnés.
          On note, pour tout $n\\in\\mathbb{N}$, $${s}_{n}$ le nombre d'abonnés en $2020+n$.<br>`
          if (this.interactif) {
            texte += `On a alors : $${s}_{n+1} = a~${s}_{n} + b$<br>avec `
            texte += remplisLesBlancs(
              this,
              i,
              `a~=~%{champ1}~\\text{ et }~b~=~%{champ2}`,
            )
          } else {
            texte += ` Donner le premier terme de cette suite et l'expression de $${s}_{n+1}$ en fonction de $${s}_{n}$.  `
          }
          if (T === 'le quart') {
            texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-\\dfrac{1}{4}${s}_{n}}_{\\text{Perte du quart }} +${b}=0,75${s}_{n}+${b}$.<br>

          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`0,75${s}_{n}+${b}`)}$.<br>`
          } else if (T === 'le tiers') {
            texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-\\dfrac{1}{3}${s}_{n}}_{\\text{Perte du tiers }} +${b}=\\dfrac{2}{3}${s}_{n}+${b}$.<br>

          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`\\dfrac{2}{3}${s}_{n}+${b}`)}$.<br>`
          } else if (T === 'le cinquième') {
            texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-\\dfrac{1}{5}${s}_{n}}_{\\text{Perte du cinquième }} +${b}=0,8${s}_{n}+${b}$.<br>

          Le premier terme de la suite est $${s}_{0}=${c}$ et $${s}_{n+1}=${miseEnEvidence(`0,8${s}_{n}+${b}`)}$.<br>`
          } else if (T === 'le dixième') {
            texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-\\dfrac{1}{10}${s}_{n}}_{\\text{Perte du dixième }} +${b}=0,9${s}_{n}+${b}$.<br>

          Le premier terme de la suite est $${s}_{0}=${texNombre(c)}$ et $${s}_{n+1}=${miseEnEvidence(`0,9${s}_{n}+${b}`)}$.<br>`
          } else {
            texteCorr = `On a $${s}_{n+1}=\\underbrace{${s}_{n}-\\dfrac{1}{2}${s}_{n}}_{\\text{Perte de la moitié }} +${b}=0,5${s}_{n}+${b}$.<br>

          Le premier terme de la suite est $${s}_{0}=${c}$ et $${s}_{n+1}=${miseEnEvidence(`0,5${s}_{n}+${b}`)}$.<br>`
          }

          if (T === 'la moitié') {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: ['0,5', `${texFractionFromString(1, 2)}`] },
              champ2: { value: b },
            })
          }

          if (T === 'le quart') {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: ['0,75', `${texFractionFromString(3, 4)}`] },
              champ2: { value: b },
            })
          }
          if (T === 'le tiers') {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: [`${texFractionFromString(2, 3)}`] },
              champ2: { value: b },
            })
          }
          if (T === 'le cinquième') {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: ['0,8', `${texFractionFromString(4, 5)}`] },
              champ2: { value: b },
            })
          }
          if (T === 'le dixième') {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: ['0,9', `${texFractionFromString(9, 10)}`] },
              champ2: { value: b },
            })
          }

          this.canEnonce = texte

          break
      }

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
