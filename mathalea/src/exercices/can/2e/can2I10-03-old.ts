// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 5e3ff continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer un effectif à partir d'un pourcentage"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '22/03/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '5e3ff'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class calculAvecPourcentageOld extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let compteur = 0
    do {
      const donnees: [number, number, number[]][] = [
        [60, 12, [50, 150, 200]],
        [60, 15, [200]],
        [60, 20, [50, 150, 200]],
        [60, 30, [50, 150, 200]],
        [40, 8, [50, 150, 200]],
        [40, 10, [50, 100, 150, 200]],
        [40, 20, [50, 100, 150, 200]],
        [75, 15, [200]],
        [75, 25, [200]],
        [80, 16, [25, 50, 75, 125, 150, 175, 200]],
        [80, 20, [25, 50, 75, 125, 150, 175, 200]],
        [80, 40, [25, 50, 75, 100, 125, 150, 175, 200]],
        [30, 6, [50, 100, 150, 200]],
        [30, 10, [200]],
        [30, 15, [200]],
      ]

      const [p1, p2, totaux] = choice(donnees)
      const k = p1 / p2
      const T = choice(totaux)
      const N = (T * p1) / 100
      const reponse = (T * p2) / 100

      const moyensTransport1 = choice([
        'en voiture',
        'en bus',
        'en tramway',
        'à pied',
      ])
      const moyensTransport2 = choice([
        'en vélo',
        'en métro',
        'en trottinette',
        'en covoiturage',
      ])

      const [lieu, personnes] = choice([
        ['Au lycée', 'professeurs'],
        ['Dans une entreprise', 'employés'],
        ['Dans un collège', 'enseignants'],
        ['Dans une association', 'membres'],
      ])

      const de =
        personnes === 'employés' || personnes === 'enseignants' ? "d'" : 'de '

      this.question = `${lieu}, $${N}$ ${personnes} viennent ${moyensTransport1}, ce qui représente $${p1}\\,\\%$ du total des ${personnes}.<br>
Par ailleurs, $${p2}\\,\\%$ des ${personnes} viennent ${moyensTransport2}.<br>
Combien ${de}${personnes} viennent ${moyensTransport2} ?`

      this.correction = `$${p2}\\,\\%$ représente $\\dfrac{1}{${k}}$ de $${p1}\\,\\%$.<br>
Donc le nombre ${de}${personnes} venant ${moyensTransport2} est : $\\dfrac{${N}}{${k}} = ${reponse}$.<br>
Il y a $${miseEnEvidence(reponse)}$ ${personnes} qui viennent ${moyensTransport2}.`

      this.reponse = `${texNombre(reponse, 0)}`
      if (this.versionQcm) {
        this.reponse = '$' + this.reponse + '$'
        this.question = `${lieu}, $${N}$ ${personnes} viennent ${moyensTransport1}, ce qui représente $${p1}\\,\\%$ du total des ${personnes}.<br>
Par ailleurs, $${p2}\\,\\%$ des ${personnes} viennent ${moyensTransport2}.<br>
Le nombre ${de}${personnes} venant ${moyensTransport2} est :`
        this.distracteurs = [
          `$${texNombre((p1 * N) / 100, 0)}$`,
          `$${texNombre((p2 * N) / 100, 0)}$`,
          `$${reponse - randint(1, 5)}$`,
        ]
      }
      compteur++
    } while (
      this.versionQcm &&
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true)
    )
  }
}
