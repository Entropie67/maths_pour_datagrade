import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer la moitié'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
/**
 * Calculer la moitié d'un nombre pair, d'un impair inférieur à 20, d'un multiple de 200, d'un nombre de la forme a00 avec a impair, d'un nombre de la forme
 *  a,b avec a et b pairs ou 1xx avec xx un nombre pair
 * @author Rémi Angot

 */
export const uuid = '14688'

export const refs = {
  'fr-fr': ['CM2N4N-2'],
  'fr-2016': ['CM009'],
  'fr-ch': ['PR-1', '9R1NO6C-6', '9R2NO6C-6', '9R3NO6C-6'],
}
export default class Moitie extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'

    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1 // niveau de difficulté
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = range1(6)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, a, b, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 1: // Table de 2
          a = randint(2, 9)
          texte = `$\\text{La moitié de }${a * 2}$`
          texteCorr = `$\\text{La moitié de }${a * 2} \\text{ est } ${miseEnEvidence(texNombre(a))}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a.toString() } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 2: // Impair inférieur à 20
          a = randint(2, 9)
          texte = `$\\text{La moitié de }${a * 2 + 1}$`
          texteCorr = `$\\text{La moitié de }${
            a * 2 + 1
          } \\text{ est } ${miseEnEvidence(texNombre(a + 5 / 10, 1))}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: texNombre(a + 5 / 10, 1) } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 3: // Table de 200
          a = randint(2, 9)
          texte = `$\\text{La moitié de }${texNombre(a * 2 * 100)}$`
          texteCorr = `$\\text{La moitié de }${texNombre(
            a * 2 * 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 100, 0))}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: texNombre(a * 100, 0) } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 4: // a00 avec a impair
          a = randint(2, 9)
          texte = `$\\text{La moitié de }${texNombre((a * 2 + 1) * 100, 0)}$`
          texteCorr = `$\\text{La moitié de }${texNombre(
            (a * 2 + 1) * 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a * 100 + 50, 0))}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: texNombre(a * 100 + 50, 0) } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 5: // a,b avec a et b pairs
          a = randint(2, 9)
          b = randint(2, 9)
          texte = `$\\text{La moitié de }${texNombre(a * 2 + (b * 2) / 100, 2)}$`
          texteCorr = `$\\text{La moitié de }${texNombre(
            a * 2 + (b * 2) / 100,
          )} \\text{ est } ${miseEnEvidence(texNombre(a + b / 100, 2))}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: texNombre(a + b / 100, 2) } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
        case 6: // 1xx avec xx un nombre pair
        default:
          a = randint(2, 9)
          texte = `$\\text{La moitié de }${100 + a * 2}$`
          texteCorr = `$\\text{La moitié de }${100 + a * 2} \\text{ est } ${miseEnEvidence(
            texNombre(50 + a, 0),
          )}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: texNombre(50 + a, 0) } },
            { formatInteractif: 'mathalea-mathfield' },
          )
          if (this.interactif)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          break
      }

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], String(a))) {
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
