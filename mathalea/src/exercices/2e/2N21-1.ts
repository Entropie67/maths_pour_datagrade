import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

export const titre = "Déterminer la parité d'une expression"
export const dateDeModifImportante = '03/11/2026'
export const interactifReady = true
export const interactifType = 'listeDeroulante'

/**
 * 2N21
 * @author Stéphane Guyon
 */
export const uuid = '3ec5c'

export const refs = {
  'fr-fr': ['2N21-1'],
  'fr-ch': ['11LSFA3J-2'],
}
export default class Parite extends Exercice {
  constructor() {
    super()

    this.consigne = 'Soit $n$ un entier naturel.'
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3]
    let typesDeQuestions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    // Énoncés déjà posés, sans la liste déroulante (son identifiant dépend de la question)
    const enonces: string[] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let texte = ''
      let texteCorr = ''
      // Réponse attendue : pair, impair, meme (même parité que n) ou contraire
      let reponse = ''

      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a = randint(2, 6)
          b = randint(2, 11, [4, 8, 9])

          texte = `Que peut-on dire de la parité de $${a}n$ ?`
          reponse = a % 2 === 0 ? 'pair' : 'meme'
          if (a % 2 === 0 && a !== 2) {
            texteCorr = `$${a}n=2\\times ${texNombre(a / 2)}n$<br>
                        Comme $${texNombre(a / 2)}n$ est un entier naturel, $${a}n$ s'écrit comme le double d'un entier naturel, il est donc ${texteEnCouleurEtGras('pair')}.`
          }
          if (a === 2) {
            texteCorr = `$${a}n=2\\times n$<br>
                        Comme $n$ est un entier naturel, $${a}n$ s'écrit comme le double d'un entier naturel, il est donc ${texteEnCouleurEtGras('pair')}.`
          }

          if (a === 3) {
            texteCorr = `$${a}n=2n+n$<br>
                            Comme $n$ est un entier naturel, $2 n$ est un nombre pair.<br>
                            Si $n$ est pair, $2n+n$ est la somme de deux nombres pairs, il sera donc pair. <br>
                            Si $n$ est impair, $2n+n$ est la somme d'un nombre pair et d'un impair, il sera donc impair. <br>
                            Au final, $${a}n$ a donc ${texteEnCouleurEtGras('la même parité que')} $n$.`
          }
          if (a % 2 !== 0 && a !== 3) {
            texteCorr = `$${a}n=2\\times ${texNombre((a - 1) / 2)}n+n$<br>
                            Comme $${texNombre((a - 1) / 2)}n$ est un entier naturel, $2\\times ${texNombre((a - 1) / 2)}n$ est un nombre pair.<br>
                            Si $n$ est pair, $2\\times${texNombre((a - 1) / 2)}n+n$ est la somme de deux nombres pairs, il sera donc pair. <br>
                            Si $n$ est impair, $2\\times${texNombre((a - 1) / 2)}n+n$ est la somme d'un nombre pair et d'un impair, il sera donc impair. <br>
                            Au final, $${a}n$ a donc ${texteEnCouleurEtGras('la même parité que')} $n$.`
          }

          break
        case 2:
          a = randint(2, 6)
          b = randint(2, 11)

          texte = `Que peut-on dire de la parité de $${a}n+${b}$ ?`
          if (a % 2 === 0) reponse = b % 2 === 0 ? 'pair' : 'impair'
          else reponse = b % 2 === 0 ? 'meme' : 'contraire'

          if (a % 2 === 0 && b % 2 === 0 && a !== 2) {
            texteCorr = `$${a}n+${b}=2\\times ${texNombre(a / 2)}n+${b}$<br>
                        Comme $${texNombre(a / 2)}n$ est un entier naturel, $2\\times ${texNombre(a / 2)}n$ est donc un nombre pair.<br>
                        $${b}$ est aussi un nombre pair.<br>
                        $${a}n+${b}$ est donc la somme de deux nombres pairs, il est donc ${texteEnCouleurEtGras('pair')}.`
          }
          if (a % 2 === 0 && b % 2 !== 0 && a !== 2) {
            texteCorr = `$${a}n+${b}=2\\times ${texNombre(a / 2)}n+${b}$<br>
                        Comme $${texNombre(a / 2)}n$ est un entier naturel, $2\\times ${texNombre(a / 2)}n$ est donc un nombre pair.<br>
                        $${b}$ est un nombre impair.<br>
                        $${a}n+${b}$ est donc la somme d'un nombre pair et d'un nombre impair. Il est donc ${texteEnCouleurEtGras('impair')}.`
          }

          if (a === 2 && b % 2 === 0) {
            texteCorr = `Comme $n$ est un entier naturel, $2n$ est un nombre pair.<br>
                        $${b}$ est aussi un nombre pair.<br>
                        $${a}n+${b}$ est donc la somme de deux nombres pairs, il est donc ${texteEnCouleurEtGras('pair')}.`
          }

          if (a === 2 && b % 2 !== 0) {
            texteCorr = `
                        Comme $n$ est un entier naturel, $2n$ est un nombre pair.<br>
                        $${b}$ est un nombre impair.<br>
                        $2n+${b}$ est donc la somme d'un nombre pair et d'un nombre impair. Il est donc ${texteEnCouleurEtGras('impair')}.`
          }
          if (a === 3 && b % 2 === 0) {
            texteCorr = `$${a}n+${b}=2n+n+${b}$<br>
                        Comme $n$ est un entier naturel, $2n$ est un nombre pair.<br>
                        $${b}$ est un nombre pair. <br>
                        $2n + ${b}$ est donc un nombre pair. <br>
                        $${a}n+${b}=2n+${b}+n$ est donc la somme d'un nombre pair et de $n$, il a donc ${texteEnCouleurEtGras('la même parité que')} $n$.`
          }
          if (a === 3 && b % 2 !== 0) {
            texteCorr = `$${a}n+${b}=2n+n+${b}$<br>
                        Comme $n$ est un entier naturel, $2n$ est un nombre pair.<br>
                        $${b}$ est un nombre impair. <br>
                        $2n + ${b}$ est donc un nombre impair. <br>
                        $${a}n+${b}=2n+${b}+n$ est donc la somme d'un nombre impair et de $n$, il a donc ${texteEnCouleurEtGras('la parité contraire de')} $n$.`
          }
          if (a % 2 !== 0 && b % 2 === 0 && a !== 3) {
            texteCorr = `$${a}n+${b}=2\\times ${texNombre((a - 1) / 2)}n+n+${b}$<br>
                        Comme $${texNombre((a - 1) / 2)}n$ est un entier naturel, $2\\times ${texNombre((a - 1) / 2)}n$ est donc un nombre pair.<br>
                        $${b}$ est aussi un nombre pair.<br>
                        $2\\times ${texNombre((a - 1) / 2)}n+${b}$ est donc un nombre pair.<br>
                        $${a}n+${b}=2\\times${texNombre((a - 1) / 2)}n+${b}+n$ est donc la somme d'un nombre pair et de $n$, il a donc ${texteEnCouleurEtGras('la même parité que')} $n$.`
          }
          if (a % 2 !== 0 && b % 2 !== 0 && a !== 3) {
            texteCorr = `$${a}n+${b}=2\\times ${texNombre((a - 1) / 2)}n+n+${b}$<br>
                        Comme $${texNombre((a - 1) / 2)}n$ est un entier naturel, $2 \\times ${texNombre((a - 1) / 2)}n$ est donc un nombre pair.<br>
                        $${b}$ est un nombre impair.<br>
                        $2\\times${texNombre((a - 1) / 2)}n +${b}$ est une somme d'un nombre pair et d'un nombre impair, c'est donc un nombre impair.<br>
                        $${a}n+${b}=2\\times${texNombre((a - 1) / 2)}n+${b}+n$ est donc la somme d'un nombre impair et de $n$, il a donc ${texteEnCouleurEtGras('la parité contraire de')} $n$.`
          }

          break

        case 3:
          a = randint(2, 6)
          b = randint(2, 11)

          texte = `Que peut-on dire de la parité de $${a}n^{2}$ ?`

          reponse = a % 2 === 0 ? 'pair' : 'meme'
          if (a === 2) {
            texteCorr = `Comme $n^{2}$ est un entier naturel, $2n^{2}$ s'écrit comme le double d'un entier naturel, il est donc ${texteEnCouleurEtGras('pair')}.`
          }
          if (a % 2 === 0 && a !== 2) {
            texteCorr = `$${a}n^{2}=2\\times ${texNombre(a / 2)}n^{2}$<br>
                        Comme $${texNombre(a / 2)}n^{2}$ est un entier naturel, $${a}n^{2}$ s'écrit comme le double d'un entier naturel, il est donc ${texteEnCouleurEtGras('pair')}.`
          }
          if (a % 2 !== 0) {
            const k = (a - 1) / 2
            const double = k === 1 ? '2n^{2}' : `2\\times ${texNombre(k)}n^{2}`
            texteCorr = `$${a}n^{2}=${double}+n^{2}$<br>
                        Comme $${k === 1 ? 'n^{2}' : `${texNombre(k)}n^{2}`}$ est un entier naturel, $${double}$ est donc un nombre pair.<br>
                        $${a}n^{2}$ est donc la somme d'un nombre pair et de $n^{2}$. Il a donc la même parité que $n^{2}$.<br>
                        Or, on sait d'après le cours (démonstration fondamentale) que $n^{2}$ et $n$ ont la même parité.<br>
                        Donc $${a}n^{2}$ a ${texteEnCouleurEtGras('la même parité que')} $n$.`
          }
          break
      }
      if (!enonces.includes(texte)) {
        enonces.push(texte)
        // Si la question n'a jamais été posée, on en créé une autre
        if (this.interactif) {
          texte +=
            '<br>Ce nombre est' +
            choixDeroulant(this, i, {
              choices: [
                { label: 'Choisir une réponse', value: '' },
                { label: 'pair', value: 'pair' },
                { label: 'impair', value: 'impair' },
                { label: 'de même parité que n', value: 'meme' },
                {
                  label: 'de parité contraire à celle de n',
                  value: 'contraire',
                },
              ],
            }) +
            '.'
          handleAnswers(
            this,
            i,
            { reponse: { value: reponse } },
            { formatInteractif: 'liste-deroulante' },
          )
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
