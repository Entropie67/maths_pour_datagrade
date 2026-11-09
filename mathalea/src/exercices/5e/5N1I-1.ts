import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  "Dire si un entier donné est un diviseur ou multiple d'un autre"

export const dateDePublication = '02/05/2026'
export const dateDeModificationImportante = '04/06/2026'
export const uuid = '918c2'
export const refs = {
  'fr-fr': ['5N1I-1'],
  'fr-2016': ['5A10-3'],
  'fr-ch': ['9R1NO1A-3', '9R2NO1A-3', '9R3NO1A-3', 'PRQNO09A-3'],
}
/**
 * @author Éric Elter

*/
export default class MultiplesOuDiviseurs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 1.2
    this.spacingCorr = 1.2
  }

  nouvelleVersion() {
    const typeDeQuestionsDisponibles = [
      'nDiviseurDem',
      'nMulitpleDem',
      'NiLUnNiLautre',
      'nDiviseurDem',
      'nMulitpleDem',
      'NiLUnNiLautre',
    ]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let texteCorr = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // let texte = 'Entourer la seule réponse exacte.<br>'
      let texte = 'Cocher la seule réponse exacte.<br>'
      let bonneReponse
      const nb1 = randint(2, 10)
      const nb2 = randint(2, 10)
      const produit = nb1 * nb2
      let n, m

      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'nDiviseurDem':
          n = produit
          m = nb1
          bonneReponse = 'nDiviseurDem'
          texteCorr = `$${n}\\div${m}=${nb2}$ donc $${miseEnEvidence(`${m}`)}$ ${texteEnCouleurEtGras(`est un diviseur de`)} $${miseEnEvidence(`${n}`)}$.`
          break
        case 'nMulitpleDem':
          n = nb1
          m = produit
          bonneReponse = 'nMulitpleDem'
          texteCorr = `$${m}\\div${n}=${nb2}$ donc $${miseEnEvidence(`${m}`)}$ ${texteEnCouleurEtGras(`est un multiple de`)} $${miseEnEvidence(`${n}`)}$.`
          break
        case 'NiLUnNiLautre':
        default: {
          const delta = Math.min(nb1, nb2)

          const offsets = Array.from(
            { length: 2 * delta - 1 },
            (_, i) => i - (delta - 1),
          ).filter((x) => x !== 0)

          const mauvaisesReponses = offsets.map((x) => produit + x)

          const mauvaiseReponse = choice(mauvaisesReponses)
          n = choice([mauvaiseReponse, nb1])
          m = choice([mauvaiseReponse, nb1], n)

          texteCorr = `$${Math.max(m, n)}\\div${Math.min(m, n)}$ n'est pas égal à un entier puisque $${Math.max(m, n)}$ n'est pas dans la table de multiplication de $${Math.min(m, n)}$ donc `
          texteCorr += `$${miseEnEvidence(`${m}`)}$ ${texteEnCouleurEtGras(`n'est ni un diviseur, ni un multiple de`)} $${miseEnEvidence(`${n}`)}$.`
          bonneReponse = 'NiLUnNiLautre'
          break
        }
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: false, radio: true }
      // this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${m}$ est un diviseur de $${n}$.`,
          statut: bonneReponse === 'nDiviseurDem',
        },
        {
          texte: `$${m}$ est un multiple de $${n}$.`,
          statut: bonneReponse === 'nMulitpleDem',
        },
        {
          texte: `$${m}$ n'est ni un diviseur, ni un multiple de $${n}$.`,
          statut: bonneReponse === 'NiLUnNiLautre',
        },
      ]
      const props = propositionsQcm(this, i)
      texte += props.texte
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
