import { gestionnaireFormulaireTexte } from '../../modules/outils'
import PavagesEtTransformations from '../6e/_Pavages_et_transformations'
export const titre = "Trouver le symétrique d'une figure dans un pavage"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Exercice en html seulement. Symétrie centrale dans un pavage.
 * @author Jean-claude Lhote

 */
export const dateDeModifImportante = '10/10/2026'

export const uuid = '70c38'

export const refs = {
  'fr-fr': ['5G3A-10'],
  'fr-2016': ['5G12-1'],
  'fr-ch': ['9R1ES4E-2', '9R2ES4E-2', '9R3ES4E-2', 'PRQES02D-11'],
}
export default class PavagesEtDemiTour extends PavagesEtTransformations {
  constructor() {
    super()
    this.level = 5
    this.groupCentralSymmetryAnswers = true
    this.sup2 = 9
    this.sup3 = 3
    this.besoinFormulaire2Texte = [
      'Choix des pavages',
      'Nombres séparés par des tirets :\n1 : Carrés\n2 : Cerfs-volants\n3 : Quadrilatères concaves\n4 : Quadrilatères quelconques\n5 : Parallélogrammes\n6 : Triangles rectangles isocèles\n7 : Triangles équilatéraux\n8 : Losanges\n9 : Mélange',
    ]
    this.besoinFormulaire3Numerique = ['Nombre de centres de symétrie', 3]
    this.besoinFormulaireNumerique = false
  }
  protected override chooseTiling(): number {
    return (
      Number(
        gestionnaireFormulaireTexte({
          saisie: this.sup2,
          min: 1,
          max: 8,
          melange: 9,
          defaut: 9,
          nbQuestions: 1,
        })[0],
      ) - 1
    )
  }

  override nouvelleVersion(numeroExercice: number) {
    const count = Number(this.sup3)
    this.centralSymmetryCount = Number.isFinite(count)
      ? Math.max(1, Math.min(3, Math.trunc(count)))
      : 3
    super.nouvelleVersion(numeroExercice)
  }
}
