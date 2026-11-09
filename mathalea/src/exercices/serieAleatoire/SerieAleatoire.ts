import { get } from 'svelte/store'
import { ajouteBoutonSerieAleatoire } from '../../lib/customElements/SerieAleatoireBouton'
import { ajouteSelecteurSerieAleatoire } from '../../lib/customElements/SerieAleatoireSelecteur'
import {
  exercicesDeLaSelection,
  formatSelection,
  lienVersLaSerie,
  parseSelection,
  referentielDesExercices,
  tirageDeLaSerie,
} from '../../lib/serieAleatoire/selection'
import { globalOptions } from '../../lib/stores/globalOptions'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

export const titre = 'Série aléatoire'
export const dateDePublication = '04/09/2026'
export const interactifReady = false
export const uuid = '6b74b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/** Nombre d'exercices tirés au sort par défaut. */
const NOMBRE_PAR_DEFAUT = 5
/** Garde-fou sur la taille de la série (et donc sur la longueur du lien). */
const NOMBRE_MAXIMAL = 30

/**
 * App « Série aléatoire » : l'enseignant coche des niveaux, des thèmes, des
 * sous-thèmes ou des exercices précis dans toute l'arborescence de MathALÉA,
 * choisit combien d'exercices tirer au sort et si la série est interactive.
 *
 * L'exercice n'affiche alors qu'un gros bouton orange, qui ouvre dans un nouvel
 * onglet une séance MathALÉA en vue élève, un exercice par page. Le tirage a
 * lieu au clic et n'est pas gouverné par la graine : chaque clic sur le bouton,
 * donc chaque élève à qui le lien est transmis, ouvre une autre série.
 *
 * @author Rémi Angot
 */
export default class SerieAleatoire extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.nbCols = 1
    this.nbColsCorr = 1
    this.pasDeVersionLatex = true
    // Le tirage n'utilise pas la graine : « Nouvel énoncé » n'aurait rien à
    // changer.
    this.pasDeVersionAleatoire = true
    this.besoinFormulaireTexte = [
      'Sélection',
      'Niveaux, thèmes ou exercices séparés par des points-virgules. Un chemin comme « 6e>6N1 » désigne tout un thème, un identifiant à cinq caractères un exercice précis.',
    ]
    this.besoinFormulaire2Numerique = ["Nombre d'exercices", NOMBRE_MAXIMAL]
    this.besoinFormulaire3CaseACocher = ['Série interactive', true]
    this.sup = ''
    this.sup2 = NOMBRE_PAR_DEFAUT
    this.sup3 = true
  }

  nouvelleVersion() {
    const entrees = parseSelection(this.sup)
    const contenu = this.enTeteVueProf(entrees) + this.blocDuLien(entrees)
    this.contenu = contenu
    this.contenuCorrection = ''
    this.listeQuestions = [contenu]
    this.listeCorrections = []
  }

  /** Le réglage `sup2`, qui arrive tantôt en nombre, tantôt en chaîne. */
  private nombreDExercices(): number {
    const nombre = Number(this.sup2)
    if (!Number.isFinite(nombre) || nombre < 1) return NOMBRE_PAR_DEFAUT
    return Math.min(Math.floor(nombre), NOMBRE_MAXIMAL)
  }

  /** Le réglage `sup3`, booléen depuis le panneau, chaîne depuis l'URL. */
  private serieInteractive(): boolean {
    return this.sup3 === true || this.sup3 === 'true'
  }

  /**
   * En vue enseignante uniquement : le sélecteur d'exercices. L'élève et les
   * exports n'en voient rien, ils n'ont que le bouton.
   */
  private enTeteVueProf(entrees: string[]): string {
    const vue = get(globalOptions).v
    const estVueProf = vue === undefined || vue === ''
    if (!context.isHtml || context.isTypst || context.isAmc || !estVueProf) {
      return ''
    }
    return ajouteSelecteurSerieAleatoire({
      numeroExercice: this.numeroExercice ?? 0,
      selection: formatSelection(entrees),
      nombre: this.nombreDExercices(),
      interactif: this.serieInteractive(),
    })
  }

  /**
   * Le gros bouton, qui tire lui-même la série à chaque clic. Hors HTML, où il
   * n'y a personne pour cliquer, un tirage est figé et le lien écrit en toutes
   * lettres.
   */
  private blocDuLien(entrees: string[]): string {
    if (context.isHtml && !context.isTypst) {
      return ajouteBoutonSerieAleatoire({
        id: `serie-aleatoire-bouton-ex${this.numeroExercice ?? 0}`,
        selection: formatSelection(entrees),
        nombre: this.nombreDExercices(),
        interactif: this.serieInteractive(),
      })
    }
    const disponibles = exercicesDeLaSelection(
      referentielDesExercices(),
      entrees,
    )
    if (disponibles.length === 0) {
      return 'Aucun exercice sélectionné : choisissez un niveau, un thème ou des exercices.'
    }
    return lienVersLaSerie(
      tirageDeLaSerie(disponibles, this.nombreDExercices()),
      { interactif: this.serieInteractive() },
    )
  }
}
