import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import {
  listeDesDiviseurs,
  premiersEntreBornes,
} from '../../../lib/outils/primalite'
import { listeQuestionsToContenu } from '../../../modules/outils'

import Exercice from '../../Exercice'

export const titre = 'Reconnaitre un nombre premier'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '05/11/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'c52a3'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
const listePremiers = premiersEntreBornes(1, 100)
const listeNonPremiers = [
  1, 21, 27, 33, 39, 42, 45, 49, 51, 54, 55, 57, 63, 69, 75, 77, 81, 87, 91, 93,
  95, 99,
]

export default class NombresPremiers extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: false }
      const nbrePremier = choice(listePremiers)
      const nbreNonPremier = choice(listeNonPremiers)
      const nbre = choice([nbrePremier, nbreNonPremier])
      this.autoCorrection[i].propositions = [
        {
          texte: 'est premier',
          statut: nbre === nbrePremier,
        },
        {
          texte: "n'est pas premier",
          statut: nbre === nbreNonPremier,
        },
      ]
      // on stocke le texte du qcm et sa correction dans une constante pour l'utiliser.
      // ###############################################################################################################
      const props = propositionsQcm(this, i) // on n'appelle cette fonction qu'une seule fois !!! car sinon, on mélange à nouveau les questions et les réponses et ça ne correspond plus à l'énoncé !
      // ###############################################################################################################
      const texte =
        `Indiquer si le nombre $${nbre}$ est premier ou pas.  ` + props.texte
      let texteCorr = '' /* string */
      if (nbre === nbrePremier) {
        texteCorr = `$${nbre}$ n'a que deux diviseurs $1$ et  $${nbre}$. Il est donc ${texteEnCouleurEtGras('premier')}.`
      } else {
        if (nbre === 1) {
          texteCorr = `$1$ ${texteEnCouleurEtGras("n'est pas premier")} car il n'a qu'un seul diviseur.`
        }
        if (nbre % 3 === 0 && nbre > 4) {
          texteCorr = `$${nbre}$ est divisible par $3$ (la somme de ses chiffres est un multiple de $3$), il admet donc au moins trois diviseurs, donc il ${texteEnCouleurEtGras("n'est pas premier")}.<br>
            ${texteGras('Remarque :')} La liste des diviseurs de $${nbre}$ est : $${listeDesDiviseurs(nbre).join(`$${sp(1)};${sp(1)}$`)}$.`
        }
        if (nbre % 2 === 0 && nbre > 4) {
          texteCorr = `$${nbre}$ est pair, il est donc divisible par $2$, il admet donc au moins trois diviseurs, donc il ${texteEnCouleurEtGras("n'est pas premier")}.<br>
              ${texteGras('Remarque :')} La liste des diviseurs de $${nbre}$ est : $${listeDesDiviseurs(nbre).join(`$${sp(1)};${sp(1)}$`)}$.`
        }
        if (nbre % 7 === 0 && nbre > 43) {
          texteCorr = `$${nbre}$ est divisible par $7$, il admet donc au moins trois diviseurs, donc il ${texteEnCouleurEtGras("n'est pas premier")}.<br>
               ${texteGras('Remarque :')}  La liste des diviseurs de $${nbre}$ est : $${listeDesDiviseurs(nbre).join(`$${sp(1)};${sp(1)}$`)}$.`
        }
        if (nbre % 5 === 0 && nbre > 6) {
          texteCorr = `$${nbre}$ est divisible par $5$, il admet donc au moins trois diviseurs, donc il ${texteEnCouleurEtGras("n'est pas premier")}.<br>
              ${texteGras('Remarque :')} La liste des diviseurs de $${nbre}$ est : $${listeDesDiviseurs(nbre).join(`$${sp(1)};${sp(1)}$`)}$.`
        }
      }
      if (this.questionJamaisPosee(i, nbrePremier)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.canEnonce = `Indiquer si $${nbre}$ est un nombre premier ou pas.  `
        this.canReponseACompleter = props.texte
        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
