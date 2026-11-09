import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Ajouter un nombre entre $1$ et $9$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '17/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3ca24'

export const refs = {
  'fr-fr': ['CPCA10'],
  'fr-ch': [],
}
export default class AjouterSimpleNombre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = ['Nombre minimum', 50]
    this.sup = 1
    this.besoinFormulaire2Numerique = ['Nombre maximum', 99]
    this.sup2 = 10
    this.besoinFormulaire3Texte = [
      'Nombres à ajouter',
      'Nombres séparés par des tirets (de 1 à 9)\n0 pour aléatoire',
    ]
    this.sup3 = '0'
    this.besoinFormulaire4CaseACocher = ['Commutativité des termes', false]
    this.sup4 = false
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const nombresAAjouter = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 9,
      melange: 0,
      defaut: 2,
      nbQuestions: 1,
      shuffle: true,
    }).map(Number)[0]
    const a = randint(this.sup, this.sup2)
    const somme = a + nombresAAjouter
    this.reponse = somme
    const alternance = this.sup4 ? choice([true, false]) : false
    this.question = alternance
      ? `Calculer : $${nombresAAjouter}+${a}=$`
      : `Calculer : $${a}+${nombresAAjouter}=$`
    this.correction = alternance
      ? ` $${nombresAAjouter}+${a}=${miseEnEvidence(somme)}$`
      : ` $${a}+${nombresAAjouter}=${miseEnEvidence(somme)}$`
    this.reponse = somme
  }
}
