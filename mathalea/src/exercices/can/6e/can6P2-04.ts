import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionReduite,
} from '../../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un pourcentage de proportion'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * reprise de can5P02 qui a été cassé en 2

 * Date de publication
*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '1a706'

export const refs = {
  'fr-fr': ['can6P2-04', '6N3P-flash1', '2I11-flash2'],
  'fr-ch': ['NR'],
}
export default class PoucentageProportion extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const listeCarac = ['filles', 'garçons', 'sportifs', 'musiciens']
    let a!: number
    let b!: number
    let c, n, carac, choix
    switch (this.quotaRandint('cas', 1, 2)) {
      case 1:
        if (choice([true, false])) {
          a = choice([20, 40])
          b = a === 20 ? choice([4, 8, 16, 5]) : choice([4, 8, 16, 10])
          carac = choice(listeCarac)
          n = carac
          this.question = ` Dans un groupe de $${a}$ enfants, $${b}$ sont des ${n}.<br>`
          this.question += this.versionQcm
            ? `Le pourcentage de ${n} dans ce groupe est :`
            : `Quel est le pourcentage de ${n} dans ce groupe ?`

          this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\%$' }
          this.correction = `La proportion de ${n} est donnée par $\\dfrac{${b}}{${a}}=${texFractionReduite(b, a)}=${texNombre(b / a)}$, soit `
        } else {
          a = choice([30, 60])
          b = a === 30 ? choice([6, 12, 18, 24]) : choice([6, 12, 15, 18, 24])
          carac = choice(listeCarac)
          n = carac
          this.question = ` Dans un groupe de $${a}$ enfants, $${b}$ sont des ${n}.<br>`
          this.question += this.versionQcm
            ? `Le pourcentage de ${n} dans ce groupe est :`
            : `Quel est le pourcentage de ${n} dans ce groupe ?`
          this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\%$' }
          this.correction = `La proportion de ${n} est donnée par $\\dfrac{${b}}{${a}}=${texFractionReduite(b, a)}=${texNombre(b / a)}$, soit `
        }
        this.correction += this.versionQcm
          ? `$${miseEnEvidence(texNombre((b / a) * 100) + '~\\%')}$.`
          : `$${miseEnEvidence(texNombre((b / a) * 100))}~\\%$.`
        this.reponse = this.versionQcm
          ? `$${texNombre((b / a) * 100, 2)}\\,\\%$`
          : arrondi((b / a) * 100)
        this.canEnonce = this.question
        this.canReponseACompleter = '$\\ldots$ $\\%$'
        this.distracteurs =
          a === arrondi((b / a) * 100)
            ? [`$${a + b}\\,\\%$`, `$${b}\\,\\%$`, `$${a - b}\\,\\%$`]
            : [`$${a}\\,\\%$`, `$${b}\\,\\%$`, `$${a - b}\\,\\%$`]
        break

      case 2:
        a = arrondi(randint(1, 12, 10) * 10)
        b = arrondi((a * randint(1, 7, 5)) / 10)
        c = (b / a) * 100
        choix = choice([true, false])
        this.question = `Le prix d'un article coûtant $${a}$ € ${choix ? 'baisse' : 'augmente'} de $${b}$ €.<br>`
        this.question += this.versionQcm
          ? `Le pourcentage ${choix ? 'de réduction' : 'd’augmentation'} de ce prix est :`
          : ` Quel est le pourcentage ${choix ? 'de réduction' : 'd’augmentation'} de ce prix ?`

        this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\%$' }
        this.correction = `${choix ? 'La réduction' : 'L’augmentation'} est de $${b}$ € sur un total de $${a}$ €.<br>
          Le pourcentage ${choix ? 'de baisse' : 'd’augmentation'} est donné par le quotient : $\\dfrac{${b}}{${a}}${simplificationDeFractionAvecEtapes(b, a)}=${texNombre(b / a)}=`
        this.correction += this.versionQcm
          ? `${miseEnEvidence(texNombre((b / a) * 100) + '~\\%')}$`
          : `${miseEnEvidence(texNombre((b / a) * 100))}~\\%$`
        if (b * 10 !== a) {
          this.correction += texteEnCouleur(
            `<br> Mentalement : <br>
        $10\\,\\%$ du prix, c'est le dixième du prix : $${a}\\div 10=${texNombre(a / 10)}$ €.<br>
        ${choix ? 'La réduction' : 'L’augmentation'} de $${b}$ € contient $${texNombre(c / 10)}$ fois $${texNombre(a / 10)}$ € car $${texNombre(c / 10)}\\times ${texNombre(a / 10)}=${b}$.<br>
        ${choix ? 'La réduction' : 'L’augmentation'} représente donc $${texNombre(c / 10)}$ fois $10\\,\\%$ du prix, soit $${texNombre(c / 10)}\\times 10\\,\\%=${texNombre(c)}\\,\\%$.`,
            bleuMathalea,
          )
        }
        this.reponse = this.versionQcm ? `$${texNombre(c, 2)}\\,\\%$` : c

        this.distracteurs =
          b === c
            ? [`$${a + b}\\,\\%$`, `$${a}\\,\\%$`, `$${a - b}\\,\\%$`]
            : [`$${a}\\,\\%$`, `$${b}\\,\\%$`, `$${a - b}\\,\\%$`]
        this.canEnonce = this.question
        this.canReponseACompleter = '$\\ldots$ $\\%$'
        break
    }
    if (this.versionQcm) {
      // Secours : Prendre le complément, oublier le facteur 100 ou inverser le rapport.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [100 - (b / a) * 100, b / a, (a / b) * 100, a + b].map(
          (n) => `$${texNombre(n, 4)}\\,\\%$`,
        ),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
