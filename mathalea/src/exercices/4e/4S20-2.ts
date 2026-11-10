import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  'Différencier événements impossibles, certains, ou possibles (lancer de dés)'

export const dateDePublication = '30/7/2024'
export const uuid = '48b39'
export const refs = {
  'fr-fr': ['4S20-2'],
  'fr-ch': ['11CTNO4A-4', '11LCNO4A-4', '11LSNO4A-4'],
}
/**
 *  Différencier événements impossibles, certains, ou possibles
 * @author Mireille Gain

*/
export default class ExerciceProbaLancerDeDes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbQuestionsModifiable = false
    this.spacing = 1.2
    this.spacingCorr = 1.2
  }

  nouvelleVersion() {
    const typeDeQuestionsDisponibles = [
      'type1',
      'type2',
      'type3',
      'type4',
      'type5',
    ]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let texteCorr = ''
    const n = randint(1, 5) // n est le nombre le plus petit du dé
    const m = randint(10, 17) // m est le nombre le plus grand du dé
    this.consigne = `Classer chaque événement suivant qu'il est impossible, certain, ou possible.<br>On lance un dé équilibré à $ ${texNombre(m - n + 1)}$ faces numérotées de $ ${texNombre(n)}$ à $ ${texNombre(m)}$. On regarde la face du dessus.<br>`

    for (let i = 0, k, p, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let bonneReponse
      k = choice([1, 2, 3, 4])
      p = choice([1, 2, 3, 4]) // p est un petit nombre entier qu'on va enlever à n ou ajouter à p
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1':
          texte = `Obtenir $ ${texNombre(n - p)}$ est un événement $\\ldots$<br>` // Le LateX entre deux symboles $, les variables dans des ${ }
          bonneReponse = 'impossible'
          texteCorr = `Obtenir $ ${texNombre(n - p)}$ est un événement ${texteEnCouleurEtGras('impossible')}.<br>`
          break
        case 'type2':
          if (k === 1) {
            texte = 'Obtenir un nombre impair est un événement $\\ldots$<br>'
            texteCorr =
              `Obtenir un nombre impair est un événement ${texteEnCouleurEtGras('possible')}.<br>`
          } else if (k === 2) {
            texte = 'Obtenir un nombre pair est un événement $\\ldots$<br>'
            texteCorr = `Obtenir un nombre pair est un événement ${texteEnCouleurEtGras('possible')}.<br>`
          } else if (k === 3) {
            texte = 'Ne pas obtenir un nombre impair est un événement $\\ldots$<br>'
            texteCorr =
              `Ne pas obtenir un nombre impair est un événement ${texteEnCouleurEtGras('possible')}.<br>`
          } else if (k === 4) {
            texte = 'Ne pas obtenir un nombre pair est un événement $\\ldots$<br>'
            texteCorr =
              `Ne pas obtenir un nombre pair est un événement ${texteEnCouleurEtGras('possible')}.<br>`
          }
          bonneReponse = 'possible'
          break
        case 'type3':
          if (k === 1) {
            texte = `Obtenir un nombre compris entre $ ${texNombre(n)}$ et $ ${texNombre(m)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre compris entre $ ${texNombre(n)}$ et $ ${texNombre(m)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
          }
          if (k === 2) {
            texte = `Obtenir un nombre compris entre $ ${texNombre(m)}$ et $ ${texNombre(n)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre compris entre $ ${texNombre(m)}$ et $ ${texNombre(n)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
          }
          if (k === 3) {
            texte = `Obtenir un nombre supérieur à $ ${texNombre(n)}$ et inférieur à $ ${texNombre(m)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre supérieur à $ ${texNombre(n)}$ et inférieur à $ ${texNombre(m)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
          }
          if (k === 4) {
            texte = `Obtenir un nombre inférieur à $ ${texNombre(m)}$ et supérieur à $ ${texNombre(n)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre inférieur à $ ${texNombre(m)}$ et supérieur à $ ${texNombre(n)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
          }
          bonneReponse = 'certain'
          break
        case 'type4':
          texte = `Obtenir $ ${texNombre(m + p)}$ est un événement $\\ldots$<br>`
          bonneReponse = 'impossible'
          texteCorr = `Obtenir $ ${texNombre(m + p)}$ est un événement ${texteEnCouleurEtGras('impossible')}.<br>`
          break
        case 'type5':
          texte = `Obtenir $ ${texNombre(n + p)}$ est un événement $\\ldots$<br>`
          bonneReponse = 'possible'
          texteCorr = `Obtenir $ ${texNombre(n + p)}$ est un événement ${texteEnCouleurEtGras('possible')}.<br>`
          break
        case 'type6':
          if (k === 1) {
            texte = `Obtenir un nombre supérieur à $ ${texNombre(m)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre supérieur à $ ${texNombre(m)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
            bonneReponse = 'impossible'
          }
          if (k === 2) {
            texte = `Obtenir un nombre inférieur à $ ${texNombre(n)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre inférieur à $ ${texNombre(n)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
            bonneReponse = 'impossible'
          }
          if (k === 3) {
            texte = `Obtenir un nombre supérieur à $ ${texNombre(n)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre supérieur à $ ${texNombre(n)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
            bonneReponse = 'possible'
          }
          if (k === 4) {
            texte = `Obtenir un nombre inférieur à $ ${texNombre(m)}$ est un événement $\\ldots$<br>`
            texteCorr = `Obtenir un nombre inférieur à $ ${texNombre(m)}$ est un événement ${texteEnCouleurEtGras('certain')}.<br>`
            bonneReponse = 'possible'
          }
          break
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: true }
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: 'impossible',
          statut: bonneReponse === 'impossible',
        },
        {
          texte: 'certain',
          statut: bonneReponse === 'certain',
        },
        {
          texte: 'possible',
          statut: bonneReponse === 'possible',
        },
      ]
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
