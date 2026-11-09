import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer la somme de deux nombres mariés et un entier'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Somme de 3 nombres dont 2 ont des chiffres des unités compléments à 10
 * @author Rémi Angot

 */
export const uuid = '678f9'

export const refs = {
  'fr-fr': ['CM2N4A-17'],
  'fr-2016': ['CM018'],
  'fr-ch': ['9R1NO6A-13', '9R2NO6A-13', '9R3NO6A-13'],
}
export default class SommeDeDeuxNombresMariesEtUnEntier extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, a, b, c, u1, u2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      u1 = randint(1, 9)
      u2 = 10 - u1
      a = randint(1, 4) * 10 + u1
      b = randint(1, 4) * 10 + u2
      c = randint(1, 100 - a - b)

      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte = `$${a}+${b}+${c}=$`
          texteCorr = `$${a}+${b}+${c}=${miseEnEvidence(texNombre(a + b + c))}$`
          break
        case 2:
        default:
          texte = `$${a}+${c}+${b}=$`
          texteCorr = `$${a}+${c}+${b}=${miseEnEvidence(texNombre(a + b + c))}$`
          break
      }
      handleAnswers(this, i, { reponse: { value: a + b + c } })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      } else {
        texte += `$\\dots$`
      }

      if (
        this.questionJamaisPosee(
          i,
          listeTypeDeQuestions[i],
          String(a) + String(b) + String(c),
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
}
