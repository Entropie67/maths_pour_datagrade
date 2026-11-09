import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer une fraction avec $1$ ou $\\dfrac12$'
export const interactifReady = true

export const dateDePublication = '17/07/2025'
/**
 * @author Éric Elter
 */

export const uuid = 'c4c53'

export const refs = {
  'fr-fr': ['6N3I-2', '6AutoF1-6', '5N3autoF-2'],
  'fr-2016': ['6N20-5'],
  'fr-ch': ['9R1NO4H-2', '9R2NO4H-2', '9R3NO4H-2', 'PRQNO05B-5'],
}
export default class ComparerFractionAUnEtAUnDemi extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireNumerique = [
      'Choix de la comparaison',
      3,
      ['1 : Avec 1', '2 : Avec 1/2', "3 : L'un ou l'autre"].join('\n'),
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    this.consigne = 'Compléter avec $>$ ou $<$.'
    const typeDeQuestionsDisponibles =
      this.sup === 1
        ? combinaisonListes([1], this.nbQuestions)
        : this.sup === 2
          ? combinaisonListes([2], this.nbQuestions)
          : combinaisonListes([1, 2], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      let fractionReference = ''
      let denominateur = 1
      let choixNum = randint(0, 3)
      let numerateur = 1
      let fractionAComparer
      let fractionEgale
      switch (typeDeQuestionsDisponibles[i]) {
        case 1: // Comparaison avec 1
          denominateur = randint(6, 20)
          numerateur = [
            denominateur - 2,
            denominateur - 1,
            denominateur + 1,
            denominateur + 2,
          ][choixNum]
          fractionAComparer = new FractionEtendue(numerateur, denominateur)
          fractionEgale = new FractionEtendue(denominateur, denominateur)
          fractionReference = '1'
          break

        case 2: // Comparaison avec 1/2
        default: {
          const choixEntier = randint(3, 10)
          denominateur = 2 * choixEntier
          choixNum = randint(0, 3)
          numerateur = [
            choixEntier - 2,
            choixEntier - 1,
            choixEntier + 1,
            choixEntier + 2,
          ][choixNum]
          fractionAComparer = new FractionEtendue(numerateur, denominateur)
          fractionEgale = new FractionEtendue(choixEntier, denominateur)
          fractionReference = '\\dfrac12'
          break
        }
      }

      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
        texteCorr = `$${fractionReference}=${fractionEgale.texFraction}$ et`
        if (choice([true, false])) {
          // Dans un sens
          texte = remplisLesBlancs(
            this,
            i,
            `${fractionAComparer.texFraction}\\quad %{champ1} \\quad ${fractionReference}`,
            KeyboardType.clavierCompare,
          )
          reponse = choixNum < 2 ? '<' : '>'
          texteCorr += ` $${fractionAComparer.texFraction}${reponse}${fractionEgale.texFraction}$`
          texteCorr += ` donc $${fractionAComparer.texFraction}${miseEnEvidence(reponse)}${fractionReference}$.`
        } else {
          // Dans l'autre sens
          texte = remplisLesBlancs(
            this,
            i,
            `${fractionReference} \\quad %{champ1} \\quad ${fractionAComparer.texFraction}`,
            KeyboardType.clavierCompare,
          )
          reponse = choixNum < 2 ? '>' : '<'
          texteCorr += ` $${fractionEgale.texFraction}${reponse}${fractionAComparer.texFraction}$`
          texteCorr += ` donc $${fractionReference}${miseEnEvidence(reponse)}${fractionAComparer.texFraction}$.`
        }
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte
        handleAnswers(this, i, {
          champ1: { value: reponse, options: { texteSansCasse: true } },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
