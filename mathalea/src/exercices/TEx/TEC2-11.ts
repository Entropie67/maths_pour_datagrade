import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import type { Valeur } from '../../lib/types'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Lire l'affixe d'un point dans le plan complexe"
export const interactifReady = true
export const dateDePublication = '28/10/2026'
export const uuid = '3217b'
export const refs = {
  'fr-fr': ['TEC2-10-1'],
  'fr-ch': [],
}

const CHAMPS = [
  'field0',
  'field1',
  'field2',
  'field3',
  'field4',
  'field5',
  'field6',
  'field7',
] as const

const nomsPoints = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/**
 * Déterminer l'affixe d'un point dont on connait les coordonnées.
 * @author Stéphane Guyon
 */
export default class LireAffixe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const repere =
      "Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$"
    const points: { nom: string; re: number; im: number }[] = []
    for (
      let i = 0, cpt = 0;
      i < Math.min(this.nbQuestions, nomsPoints.length) && cpt < 50;
    ) {
      const re = randint(-5, 5)
      const im = randint(-5, 5)
      if (re !== 0 || im !== 0) {
        if (this.questionJamaisPosee(i, re, im)) {
          points.push({ nom: nomsPoints[i % nomsPoints.length], re, im })
          i++
        }
      }
      cpt++
    }
    const pluriel = points.length > 1
    this.listeAvecNumerotation = !pluriel
    // Une seule consigne commune quand il y a plusieurs questions
    this.consigne = pluriel
      ? `${repere}, quelles sont les affixes respectives des points ${points
          .map(({ nom, re, im }) => `$${nom}(${re}\\,;\\,${im})$`)
          .join(', ')} ?`
      : ''
    const affixes = points.map(({ re, im }) => new Complexe(re, im).tex())
    const correctionCommune = `L'affixe d'un point de coordonnées $(a\\,;\\,b)$ est $a+\\mathrm{i}b$.`
    if (pluriel) {
      // Une seule question : un champ par point, une seule correction
      const answers: Valeur = {}
      const dataOptions: DataOptionsMultiMathfield = {}
      points.forEach((_point, k) => {
        const name = CHAMPS[k]
        answers[name] = { value: affixes[k] }
        dataOptions[name] = { keyboard: KeyboardType.complexes }
      })
      const champs = this.interactif
        ? addMultiMathfield(this, 0, {
            dataTemplate: points
              .map(({ nom }, k) => `$z_${nom}=$ %{${CHAMPS[k]}}`)
              .join('<br><br>'),
            dataOptions,
          })
        : ''
      this.listeQuestions[0] = `<br>${champs}`
      this.listeCorrections[0] =
        correctionCommune +
        points
          .map(({ nom }, k) => `<br>$z_${nom}=${miseEnEvidence(affixes[k])}$.`)
          .join('')
      handleAnswers(
        this,
        0,
        { ...answers, bareme: toutAUnPoint },
        { formatInteractif: 'multi-mathfield' },
      )
    } else {
      points.forEach(({ nom, re, im }, i) => {
        createQuestion(this, i, {
          question: `${repere}, quelle est l'affixe du point $${nom}(${re}\\,;\\,${im})$ ?`,
          correction: `${correctionCommune.replace(/\.$/, '')}, donc $z_${nom}=${miseEnEvidence(affixes[i])}$.`,
          answer: { value: affixes[i] },
          field: {
            keyboard: KeyboardType.complexes,
            texteAvant: `<br>$z_${nom}=$`,
          },
        })
      })
    }
    listeQuestionsToContenu(this)
  }
}
