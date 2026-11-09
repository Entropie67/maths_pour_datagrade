import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Trouver un ordre de grandeur (QCM)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = 'de779'

export const refs = {
  'fr-fr': ['can6C7-01', '6N2F-flash1'],
  'fr-ch': [],
}

export default class OrdreDeGrandeur extends Exercice {
  nbQuestions: number

  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(3, 7)
      const b = randint(2, 9)
      const c = randint(1, 9)
      const nombre = a * 100 + b * 10 + c
      const d = randint(5, 9)
      const resultat = nombre * d
      let texte = `$${texNombre(nombre, 0)}\\times ${d}$<br>
    Choisir parmi ces propositions, le résultat du calcul, sans effectuer précisément le calcul.<br>`
      // Ajout avant l'ajout des propositions de réponse
      // ça serait mieux en uniformisant avec this.question pour tous les exos can
      this.canEnonce = texte
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: `$${texNombre(resultat, 0)}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(d * 1000 + nombre, 0)}$`,
            statut: false,
          },
          {
            texte: `$${texNombre((a * 1000 + b * 100 + c) * d, 0)}$`,
            statut: false,
          },
        ],
      }
      const monQcm = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += monQcm.texte
      }
      let texteCorr = `$${texNombre(nombre, 0)} \\times ${d} = ${miseEnEvidence(texNombre(resultat, 0))}$<br>
        `
      if (nombre > a * 100 + 50) {
        texteCorr += texteEnCouleur(`
    Mentalement : <br>
On remplace le premier facteur $${texNombre(nombre, 0)}$ par $${(a + 1) * 100}$, on calcule
$${(a + 1) * 100}\\times ${d}=${texNombre((a + 1) * 100 * d, 0)}$ et on sélectionne le résultat qui s'en rapproche le plus.
    `, bleuMathalea)
      } else {
        texteCorr += texteEnCouleur(`
    Mentalement : <br>
    On remplace le premier facteur $${texNombre(nombre, 0)}$ par $${a * 100}$, on calcule
    $${a * 100}\\times ${d}=${texNombre(a * 100 * d, 0)}$ et on sélectionne le résultat qui s'en rapproche le plus.
           `, bleuMathalea)
      }
      if (this.questionJamaisPosee(i, a, nombre)) {
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
