import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Quart'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Calculer le quart d'un multiple de 4, d'un impair, d'un multiple de 400, d'un multiple de 40, d'un nombre a,b avec a et b multiples de 4
 * @author Rémi Angot

 */
export const uuid = 'b434c'

export const refs = {
  'fr-fr': ['6P3autoA-2', '6AutoP1-1'],
  'fr-2016': ['CM011'],
  'fr-ch': ['9R1FA1D-2', '9R2FA1D-2', '9R3FA1D-2'],
}
export default class Quart extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = range1(5)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte = '', texteCorr = '', a = 0, b = 0, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 1: // Table de 4
          a = randint(2, 9)
          texte = `$\\text{Le quart de }${a * 4}$`
          texteCorr = `$\\text{Le quart de }${a * 4} \\text{ est } ${miseEnEvidence(a)}$`
          handleAnswers(this, i, { reponse: { value: a } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 2: // Impair
          a = randint(2, 9)
          b = choice([1, 2, 3])
          texte = `$\\text{Le quart de }${a * 4 + b}$`
          texteCorr = `$\\text{Le quart de }${
            a * 4 + b
          } \\text{ est } ${miseEnEvidence(texNombre(a + b / 4))}$`
          handleAnswers(this, i, { reponse: { value: arrondi(a + b / 4) } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 3: // Table de 400
          a = randint(2, 9)
          texte = `$\\text{Le quart de }${texNombre(a * 4 * 100)}$`
          texteCorr = `$\\text{Le quart de }${texNombre(
            a * 4 * 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 100))}$`
          handleAnswers(this, i, { reponse: { value: a * 100 } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 4: // Table de 40
          a = randint(2, 9)
          texte = `$\\text{Le quart de }${texNombre(a * 4 * 10)}$`
          texteCorr = `$\\text{Le quart de }${texNombre(
            a * 4 * 10,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 10))}$`
          handleAnswers(this, i, { reponse: { value: a * 10 } })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 5: // a,b avec a et b divisibles par 4
          a = randint(2, 9)
          b = randint(2, 9)
          texte = `$\\text{Le quart de }${texNombre(a * 4 + (b * 4) / 100)}$`
          texteCorr = `$\\text{Le quart de }${texNombre(
            a * 4 + (b * 4) / 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a + b / 100))}$`
          handleAnswers(this, i, {
            reponse: { value: arrondi(a + b / 100) },
          })
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr + '.'
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
}
