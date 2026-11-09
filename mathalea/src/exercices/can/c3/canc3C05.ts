import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleur, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Déterminer si un nombre est pair (V/F)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '20/11/2021'

/**
 * @author Jean-claude Lhote

 */
export const uuid = 'd0287'

export const refs = {
  'fr-fr': ['canc3C05', '2N21-flash1'],
  'fr-ch': [],
}
export default class PariteDunNombre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    for (
      let i = 0, a, b, c, d, e, f, g, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (choice([1, 2, 3, 4, 5])) {
        case 1:
          a = randint(10, 20) * 10
          b = randint(0, 9)
          c = randint(30, 60) * 10
          d = randint(1, 9)
          e = a + b
          f = c + d
          g = e + f
          texte = `Sans déterminer le résultat, le nombre $${e}+${f}$ est-il pair ?`
          this.canEnonce = texte
          texteCorr = `$${e}$ est un nombre ${e % 2 === 0 ? 'pair' : 'impair'} car il a $${b}$ comme chiffre des unités.<br>`
          texteCorr += `$${f}$ est un nombre ${f % 2 === 0 ? 'pair' : 'impair'} car il a $${d}$ comme chiffre des unités.<br>`
          texteCorr += `La somme ${e % 2 === 0 && f % 2 === 0 ? 'de deux nombres pairs' : e % 2 === 1 && f % 2 === 1 ? 'de deux nombres impairs' : "d'un nombre impair et d'un nombre pair"} est ${g % 2 === 0 ? 'paire' : 'impaire'}.<br>`
          texteCorr += texteEnCouleur(
            `Mentalement on peut ajouter seulement les chiffres des unités des deux nombres : $${b}+${d}=${b + d}$`,
          )
          texteCorr += `<br>Donc le nombre $${e}+${f}$ est ${texteEnCouleurEtGras(g % 2 === 0 ? 'pair' : 'impair')}.`
          break
        case 2:
          a = randint(10, 20) * 10
          b = randint(1, 9)
          c = randint(10, 20) * 10
          d = randint(1, 4) * 2 + 1
          if (choice([true, false])) {
            e = a + b
            f = c + d
          } else {
            f = a + b
            e = c + d
          }
          g = e * f
          texte = `Sans déterminer le résultat, le nombre $${e}\\times ${f}$ est-il pair ?`
          this.canEnonce = texte
          texteCorr = `$${e}\\times ${f}$ est un nombre ${texteEnCouleurEtGras(g % 2 === 0 ? 'pair' : 'impair')}.<br>En effet, son chiffre des unités s'obtient en multipliant le chiffre des unités de $${e}$ et celui de $${f}$.<br>`
          texteCorr += `Donc le chiffre des unités de $${e} \\times ${f}$ est celui de $${e % 10}\\times ${f % 10}=${b * d}$ soit $${g % 10}$.<br>`
          break
        case 3:
          a = choice([
            randint(101, 109) * 4,
            randint(111, 119) * 4,
            randint(121, 129) * 4,
          ])
          b = choice([0, 2])
          e = a + b
          g = e >> 1
          texte = `Sans déterminer le résultat, le nombre $${e}\\div 2$ est-il pair ?`
          this.canEnonce = texte
          texteCorr = `On va retirer le plus grand multiple de $20$ possible de $${e}$ :<br>`
          texteCorr += `Dans $${e}$ il va $${Math.floor(e / 20)}\\times 20=${e - (e % 20)}$ et il reste $${e % 20}$.<br>`
          texteCorr += `Si on divise $${e % 20}$ par $2$ on trouve $${texNombre((e % 20) / 2)}$ qui est un nombre ${g % 2 === 0 ? 'pair' : 'impair'}.<br>`
          texteCorr += `Or, $${e}\\div 2= (${e - (e % 20)} + ${e % 20})\\div 2 =${(e - (e % 20)) >> 1} + ${(e % 20) >> 1}=${e >> 1}$.<br>`
          texteCorr += `On peut aussi utiliser le critère de divisibilité par $4$ : la moitié de $${e}$ est paire exactement quand $${e}$ est un multiple de $4$.<br>`
          texteCorr += `Un nombre est divisible par $4$ lorsque le nombre formé par ses deux derniers chiffres est divisible par $4$.<br>`
          texteCorr += `Ici, $${e % 100}${g % 2 === 0 ? `=4\\times ${(e % 100) / 4}` : `=4\\times ${((e % 100) - 2) / 4}+2`}$ donc $${e}$ ${g % 2 === 0 ? 'est' : "n'est pas"} un multiple de $4$.<br>`
          texteCorr += `Donc le nombre $${e}\\div 2$ est ${texteEnCouleurEtGras(g % 2 === 0 ? 'pair' : 'impair')}.`
          break
        case 4:
          a = randint(10, 20) * 10
          b = randint(0, 9)
          c = randint(30, 60) * 10
          d = randint(1, 9)
          e = a + b
          f = c + d
          g = f - e
          texte = `Sans déterminer le résultat, le nombre $${f}-${e}$ est-il pair ?`
          this.canEnonce = texte
          texteCorr = `$${f}$ est un nombre ${f % 2 === 0 ? 'pair' : 'impair'} car il a $${d}$ comme chiffre des unités.<br>`
          texteCorr += `$${e}$ est un nombre ${e % 2 === 0 ? 'pair' : 'impair'} car il a $${b}$ comme chiffre des unités.<br>`
          texteCorr += `La différence ${e % 2 === 0 && f % 2 === 0 ? 'de deux nombres pairs' : e % 2 === 1 && f % 2 === 1 ? 'de deux nombres impairs' : "d'un nombre impair et d'un nombre pair"} est ${g % 2 === 0 ? 'paire' : 'impaire'}.<br>`
          texteCorr += texteEnCouleur(
            `Mentalement on peut soustraire les chiffres des unités des deux nombres ${d < b ? '(en empruntant une dizaine à $' + f + '$) ' : ''} : $${d < b ? d + 10 : d} - ${b}=${g % 10}$`,
          )
          texteCorr += `<br>Donc le nombre $${f}-${e}$ est ${texteEnCouleurEtGras(g % 2 === 0 ? 'pair' : 'impair')}.`
          break
        case 5:
        default: {
          a = randint(3, 7)
          b = a % 2 === 0 ? randint(1, 4) * 2 + 1 : randint(2, 9)
          g = b
          let produit = `${b}`
          for (let i = 1; i < a; i++) {
            produit += `\\times ${b}`
          }
          texte = `Sans déterminer le résultat, le nombre $${produit}$ est-il pair ?`
          this.canEnonce = texte
          if (b % 2 === 0) {
            texteCorr = `$${b}$ est un nombre pair. Le produit de deux nombres pairs est un nombre pair.<br>`
            texteCorr +=
              'Ainsi, les multiplications successives donnent toujours un résultat pair.<br>'
            texteCorr += `Donc le nombre $${produit}$ est ${texteEnCouleurEtGras('pair')}.`
          } else {
            texteCorr = `$${b}$ est un nombre impair. Le produit de deux nombres impairs est un nombre impair.<br>`
            texteCorr +=
              'Ainsi, les multiplications successives donnent toujours un résultat impair.<br>'
            texteCorr += `Donc le nombre $${produit}$ est ${texteEnCouleurEtGras('impair')}.`
          }
          break
        }
      }
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: 'Oui',
            statut: g % 2 === 0,
          },
          {
            texte: 'Non',
            statut: g % 2 === 1,
          },
        ],
        options: {
          ordered: true,
          radio: true,
        },
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += monQcm.texte
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
