import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'ca881'
export const refs = {
  'fr-fr': ['3AutoS03'],
  'fr-ch': [],
}
export const interactifReady = true

export const titre =
  "Interpréter les données d'un diagramme et donner la médiane de la série"
export const dateDePublication = '11/08/2026'

/**
 * DNB Asie juin 2026 - Question 9
 * @author Jean-Claude Lhote
 */
export default class AutoQ9Asiebrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'multi-mathfield'
  }

  enonce(serie?: [number, number][]) {
    this.consigne = `Le diagramme en barres ci-dessous donne les notes des élèves d’une classe au dernier contrôle de
mathématiques.`
    if (serie == null) {
      const min = 6
      const max = 17
      const effectif = randint(20, 30)
      const serie2: number[] = []
      for (let i = 0; i < effectif; i++) {
        serie2.push(randint(min, max))
      }
      const stat = new Stat(serie2)
      serie = stat.serieTableau as [number, number][]
    }
    const laSerie = new Stat(serie)
    this.question = addMultiMathfield(this, 0, {
      dataTemplate: `a) Combien d'élèves ont participé à ce contrôle ? %{champ1}<br>
      b) Quelle est la note médiane ? %{champ2}`,
      dataOptions: {
        champ1: { keyboard: KeyboardType.clavierDeBase, ldots: true },
        champ2: { keyboard: KeyboardType.clavierDeBase, ldots: true },
      },
    })
    this.question +=
      '<br>' +
      laSerie.diagramme({
        barres: true,
        percentVsEffectifs: false,
      })
    const nbEleves = laSerie.serie.length
    this.reponse = {
      champ1: { value: nbEleves.toString() },
      champ2: { value: laSerie.mediane().toString() },
    }

    this.correction = `${numAlpha(0)} Le nombre d'élèves ayant participé à ce contrôle est la somme des effectifs, soit :<br>
  $${serie.map(([note, effectif]) => effectif).join('+')} = ${miseEnEvidence(nbEleves.toString())}$.<br>
${numAlpha(1)} La note médiane est la valeur de la note qui partage la série en deux parties de même effectif.<br>
Comme la série comporte $${nbEleves.toString()}$ notes, la médiane est ${nbEleves % 2 === 0 ? 'la moyenne des deux notes centrales' : 'la note centrale'}, soit
$${miseEnEvidence(laSerie.mediane().toString())}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce([
        [7, 3],
        [8, 4],
        [10, 4],
        [11, 5],
        [12, 5],
        [15, 3],
        [17, 2],
        [18, 1],
      ])
    } else {
      this.enonce()
    }
  }
}
