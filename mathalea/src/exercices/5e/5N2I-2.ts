import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const interactifReady = true

export const dateDePublication = '31/12/2025'
export const titre =
  'Compléter une soustraction à trou de deux nombres relatifs'

/**
 * Compléter une addition à trou entre 2 nombres relatifs.
 *
 * * On peut paramétrer la distance à zéro maximale des deux termes (par défaut égale à 20)
 * @author Jean-claude Lhote
 * 5R20-2
 */
export const uuid = 'cea42'

export const refs = {
  'fr-fr': ['5N2I-2'],
  'fr-2016': ['5R21-2'],
  'fr-ch': ['9R2NO3D-3', '9R3NO3D-3'],
}
export default class ExerciceSoustractionsRelatifsATrou extends Exercice {
  constructor() {
    super()
    this.sup = 20
    this.sup3 = false // decimaux
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire3CaseACocher = ['Avec des nombres décimaux']

    this.consigne = `Compléter${sp()}:`
    this.spacing = 0.5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.nbQuestions = 5
  }

  nouvelleVersion(numeroExercice: number) {
    const nombresDecimaux = this.sup3
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = nombresDecimaux
        ? (randint(10, this.sup * 10) * choice([1, -1])) / 10
        : randint(1, this.sup) * choice([1, -1])
      const b = nombresDecimaux
        ? (randint(10, this.sup * 10) * choice([1, -1])) / 10
        : randint(1, this.sup) * choice([1, -1])
      const c = a + b
      let texte = ''
      let texteCorr = ''
      const choix = randint(1, 2)
      switch (choix) {
        case 1: // Trouver le premier terme
          texte =
            (this.interactif
              ? `${ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: texNombre(c, 1) } },
                  typeInteractivite: 'mathlive',
                })}$`
              : '$\\ldots') +
            `- ${ecritureParentheseSiNegatif(a)} = ${texNombre(b, 1)}$`
          texteCorr = `Pour trouver le terme manquant, il suffit d'ajouter $${ecritureParentheseSiNegatif(a)}$ de chaque côté de l'égalité${sp()}:<br>$${texNombre(b, 1)} + ${ecritureParentheseSiNegatif(a)} = ${miseEnEvidence(texNombre(c, 1))}$`

          break
        case 2: // Trouver le deuxième terme
          texte =
            `$${texNombre(c, 1)}-` +
            (this.interactif
              ? `$${ajouteQuestionMathlive({
                  exercice: this,
                  question: i,
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: { reponse: { value: texNombre(a, 1) } },
                  typeInteractivite: 'mathlive',
                })}$`
              : `\\ldots`) +
            `=${texNombre(b, 1)}$`
          texteCorr = `Pour trouver le terme manquant, il suffit de retirer la différence (membre de droite) du premier terme${sp()}:<br>$${texNombre(c, 1)} - ${ecritureParentheseSiNegatif(b)} = ${texNombre(c, 1)} + ${ecritureParentheseSiNegatif(-b)}=${miseEnEvidence(texNombre(a, 1))}$`
      }
      if (this.questionJamaisPosee(i, choix, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
