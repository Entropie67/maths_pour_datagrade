import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Comparer deux réels positifs à partir de leur rapport'
export const dateDePublication = '17/07/2026'
export const dateDeModifImportante = '02/10/2026'
export const uuid = 'bafb9'

export const refs = {
  'fr-fr': ['1A-C01-8', '2A-N1-7'],
  'fr-ch': ['11CTQCMNO-3', '11LCQCMNO-3', '11LSQCMNO-3'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Comparer deux réels strictement positifs à partir de la valeur de leur rapport.
 * @author Stéphane Guyon
 */
export default class ComparerAvecUnRapport extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const valeurRapport = randint(4, 16, [5, 10]) / 10
    const rapport = this.quotaChoice('rapport', ['aSurB', 'bSurA'] as const)
    // Hors QCM, on demande de comparer a à b ou b à a
    const inverser = choice([true, false])

    const valeur = texNombre(valeurRapport, 1)
    const numerateur = rapport === 'aSurB' ? 'a' : 'b'
    const denominateur = rapport === 'aSurB' ? 'b' : 'a'
    const aSuperieurAB =
      (rapport === 'aSurB' && valeurRapport > 1) ||
      (rapport === 'bSurA' && valeurRapport < 1)
    const comparaison = aSuperieurAB ? 'a > b' : 'a < b'
    const comparaisonFausse = aSuperieurAB ? 'a < b' : 'a > b'
    const comparaisonLargeFausse = aSuperieurAB
      ? 'a\\leqslant b'
      : 'a\\geqslant b'
    const comparaisonRapport = valeurRapport > 1 ? '>1' : '<1'
    const ordreMots = valeurRapport > 1 ? 'supérieur au' : 'inférieur au'

    const donnees = `$a$ et $b$ sont des réels strictement positifs.<br>
      On sait que $\\dfrac{${numerateur}}{${denominateur}}=${valeur}$.<br>`
    const explication = `Comme $\\dfrac{${numerateur}}{${denominateur}}=${valeur}${comparaisonRapport}$ et que $${denominateur}>0$, le numérateur $${numerateur}$ est ${ordreMots} dénominateur $${denominateur}$.<br>`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `${donnees}On peut en déduire que :`
      this.reponse = `$${comparaison}$`
      this.distracteurs = [
        '$a = b$',
        `$${comparaisonFausse}$`,
        `$${comparaisonLargeFausse}$`,
      ]
      this.correction = `${explication}On en déduit que $${miseEnEvidence(comparaison)}$.`
    } else {
      const [membre1, membre2] = inverser ? ['b', 'a'] : ['a', 'b']
      const symbole = aSuperieurAB !== inverser ? '>' : '<'
      this.consigne = ''
      // En interactif, les deux lettres entourent le champ de réponse
      this.question = `${donnees}Compléter avec le symbole $<$ ou $>$.${this.interactif ? '' : `<br>$${membre1} \\,\\ldots\\, ${membre2}$`}`
      this.optionsChampTexte = {
        texteAvant: `<br> $${membre1}$`,
        texteApres: ` $${membre2}$`,
        dataKeys: ['<', '>'],
      }
      this.optionsDeComparaison = { texteSansCasse: true }
      this.reponse = symbole
      this.correction = `${explication}On en déduit que $${membre1} ${miseEnEvidence(symbole)} ${membre2}$.`
    }
  }
}
