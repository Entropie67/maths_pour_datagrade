import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Déduire une comparaison du signe d'une différence"
export const dateDePublication = '17/07/2026'
export const dateDeModifImportante = '02/10/2026'
export const uuid = 'eb74b'

export const refs = {
  'fr-fr': ['1A-C01-9', '2A-N1-8'],
  'fr-ch': ['11CTQCMNO-4', '11LCQCMNO-4', '11LSQCMNO-4'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type Signe = '>' | '<' | '\\geqslant' | '\\leqslant'

const inverse: Record<Signe, Signe> = {
  '>': '<',
  '<': '>',
  '\\geqslant': '\\leqslant',
  '\\leqslant': '\\geqslant',
}

/**
 * Déduire une comparaison de deux réels à partir du signe de leur différence.
 * @author Stéphane Guyon
 */
export default class ComparerAvecLeSigneDUneDifference extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
      <p style="margin: 0;">
        On peut ajouter un même nombre aux deux membres d'une inégalité sans changer son sens.
      </p>
    `
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const [lettre1, lettre2] = choice([
      ['x', 'y'],
      ['a', 'b'],
      ['u', 'v'],
      ['m', 'n'],
    ] as const)
    const [premier, second] = choice([
      [lettre1, lettre2],
      [lettre2, lettre1],
    ] as const)
    const signe = this.quotaChoice('signe', [
      '>',
      '<',
      '\\geqslant',
      '\\leqslant',
    ] as const)
    const zeroAGauche = choice([true, false])
    // Hors QCM, les deux lettres sont présentées dans un ordre aléatoire
    const inverser = choice([true, false])

    const comparaison = `${premier} ${signe} ${second}`
    const sensSuperieur = signe === '>' || signe === '\\geqslant'
    const signeStrictInverse = sensSuperieur ? '>' : '<'
    const signeLargeInverse = sensSuperieur ? '\\leqslant' : '\\geqslant'
    const inegalite = zeroAGauche
      ? `0 ${inverse[signe]} ${premier}-${second}`
      : `${premier}-${second} ${signe} 0`
    const calcul = zeroAGauche
      ? `0+${second} ${inverse[signe]} ${premier}-${second}+${second}`
      : `${premier}-${second}+${second} ${signe} 0+${second}`
    const donnee = `Soient $${premier}$ et $${second}$ deux réels tels que $${inegalite}$.<br>`
    const explication = `Ajouter $${second}$ aux deux membres de l'inégalité ne change pas son sens :<br>
      $${calcul}$,<br>`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `${donnee}Choisir la comparaison entre $${premier}$ et $${second}$ qui en découle.`
      this.reponse = `$${comparaison}$`
      this.distracteurs = [
        `$${premier} = ${second}$`,
        `$${second} ${signeStrictInverse} ${premier}$`,
        `$${premier} ${signeLargeInverse} ${second}$`,
      ]
      this.correction = `${explication}donc $${miseEnEvidence(comparaison)}$.`
    } else {
      const [membre1, membre2] = inverser
        ? [second, premier]
        : [premier, second]
      const symbole = inverser ? inverse[signe] : signe
      this.consigne = ''
      // En interactif, les deux lettres entourent le champ de réponse
      // Un seul couple de symboles proposé (stricts ou larges) : une seule bonne réponse
      const symboles =
        signe === '>' || signe === '<'
          ? ['<', '>']
          : ['\\leqslant', '\\geqslant']
      this.question = `${donnee}Compléter avec le symbole $${symboles[0]}$ ou $${symboles[1]}$.${this.interactif ? '' : `<br>$${membre1} \\,\\ldots\\, ${membre2}$`}`
      this.optionsChampTexte = {
        texteAvant: `<br>$${membre1}$`,
        texteApres: `$${membre2}$`,
        dataKeys: symboles,
      }
      this.optionsDeComparaison = { texteSansCasse: true }
      // Écritures équivalentes des symboles larges (clavier virtuel ou physique)
      const equivalents: Record<Signe, string[]> = {
        '>': ['>'],
        '<': ['<'],
        '\\geqslant': ['\\geqslant', '\\geq', '\\ge', '>=', '≥', '⩾'],
        '\\leqslant': ['\\leqslant', '\\leq', '\\le', '<=', '≤', '⩽'],
      }
      this.reponse = equivalents[symbole]
      this.correction = `${explication}donc $${comparaison}$.<br>
      Ainsi, $${membre1} ${miseEnEvidence(symbole)} ${membre2}$.`
    }
  }
}
