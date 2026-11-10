import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Encadrer un décimal par deux entiers consécutifs'
export const interactifReady = true
export const dateDeModifImportante = '06/10/2026'

/**
 * * Encadrer_un_decimal_par_deux_entiers_consecutifs
 * @author Sébastien Lozano
 */
export const uuid = '3e083'

export const refs = {
  'fr-fr': ['CM2N3L'],
  'fr-2016': ['6N31-1'],
  'fr-ch': ['PR-39', '9R1NO2D-6', '9R2NO2D-6', '9R3NO2D-6', 'PRQNO05A-11'],
}
export default class EncadrerUnDecimalParDeuxEntiersConsecutifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne =
      'Encadrer chaque nombre proposé par deux nombres entiers consécutifs.'
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = shuffle([0, 1, 2])

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus
    const questionStatements: string[] = []

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const m = randint(1, 9)
      const c = randint(1, 9)
      const d = randint(1, 9)
      const u = randint(1, 9)
      const di = randint(1, 9)
      const ci = randint(1, 9)
      const mi = randint(1, 9)

      // pour les situations, autant de situations que de cas dans le switch !

      const enonces = []
      // for (let k=0;k<3;k++) {
      enonces.push({
        enonce: `
          $\\ldots\\ldots < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < \\ldots\\ldots$`,
        question: '',
        correction: `$${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1))} < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + 1))}$`,
      })
      enonces.push({
        enonce: `
          $\\ldots\\ldots < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01))} < \\ldots\\ldots$`,
        question: '',
        correction: `$${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1))} < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01))} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + 1))}$`,
      })
      enonces.push({
        enonce: `
          $\\ldots\\ldots < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1))} < \\ldots\\ldots$`,
        question: '',
        correction: `$${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1))} < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1))} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + 1))}$`,
      })

      texte = `${enonces[listeTypeDeQuestions[i]].enonce}`
      texteCorr = `${enonces[listeTypeDeQuestions[i]].correction}`

      if (!questionStatements.includes(texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        questionStatements.push(texte)
        const lowerBound = m * 1000 + c * 100 + d * 10 + u
        handleAnswers(
          this,
          i,
          {
            bareme: toutPourUnPoint,
            champ1: { value: lowerBound },
            champ2: { value: lowerBound + 1 },
          },
          { formatInteractif: 'fill-in-the-blank' },
        )
        if (this.interactif && context.isHtml) {
          texte = remplisLesBlancs(
            this,
            i,
            texte
              .trim()
              .slice(1, -1)
              .replace('\\ldots\\ldots', '%{champ1}')
              .replace('\\ldots\\ldots', '%{champ2}'),
            KeyboardType.clavierNumbers,
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
