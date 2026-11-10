import {
  ajouteJuniperGreen,
  coupsPossibles,
  JuniperGreenElement,
  NOMBRE_DE_CASES_POUR_UN_POINT,
  nombresNonPremiers,
  type ModeDepart,
  type ModeErreur,
  type ReglesJuniperGreen,
} from '../../lib/customElements/JuniperGreenElement'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const dateDePublication = '04/09/2026'
export const titre = 'Jouer au Juniper Green'
export const interactifReady = true

export const uuid = 'cc308'
export const refs = {
  'fr-fr': ['EN-Juniper-Green'],
  'fr-ch': [],
}

/** Nombre de parties tirées au hasard avant de garder la plus longue. */
const NOMBRE_DE_TIRAGES = 20

const formulaireJuniperGreen: FormulaireComplexe = {
  champs: [
    {
      type: 'nombre',
      nom: 'max',
      label: 'Plus grand nombre de la grille',
      min: 2,
      max: 100,
      defaut: 40,
    },
    {
      type: 'selection',
      nom: 'nombresParLigne',
      label: 'Nombres par ligne',
      options: [
        { valeur: '5', label: '5 nombres par ligne' },
        { valeur: '10', label: '10 nombres par ligne' },
      ],
      defaut: '10',
    },
    {
      type: 'selection',
      nom: 'modeDepart',
      label: 'Mode de départ',
      options: [
        { valeur: 'libre', label: 'Départ libre' },
        {
          valeur: 'libreSansPremier',
          label: 'Départ libre, mais pas sur un nombre premier',
        },
        {
          valeur: 'aleatoireSansPremier',
          label: 'Départ aléatoire sur un nombre non premier',
        },
      ],
      defaut: 'libre',
    },
    {
      type: 'case',
      nom: 'rappelDesRegles',
      label: 'Rappeler les règles',
      defaut: true,
    },
    {
      type: 'case',
      nom: 'arretSurErreur',
      label: 'Arrêter la partie en cas d’erreur',
    },
    {
      type: 'case',
      nom: 'decompteCoupsRestants',
      label: 'Décompter les coups restants possibles',
    },
  ],
}

function modeDepartDepuisSup(valeur: unknown): ModeDepart {
  const nombre = Number(valeur)
  if (nombre === 2) return 'libreSansPremier'
  if (nombre === 3) return 'aleatoireSansPremier'
  return 'libre'
}

/**
 * Le jeu du Juniper Green : on choisit tour à tour un nombre de la grille,
 * chaque nombre devant être un multiple ou un diviseur du précédent.
 *
 * L'exercice est interactif au sens de MathALÉA : le score (sur 2) est
 * attribué par `JuniperGreenElement.verifQuestion()`, qui fige la partie
 * telle qu'elle a été jouée (voir `JuniperGreenElement.finalise()`). Il n'y a
 * donc pas de réponse attendue unique : `listeCorrections` ne sert qu'à
 * illustrer une partie possible parmi beaucoup d'autres (utile en PDF, où il
 * n'y a pas de partie jouée à figer).
 *
 * @author Rémi Angot
 */
export default class JuniperGreen extends Exercice {
  constructor() {
    super()
    // Jeu à plusieurs stratégies, sans réponse courte unique.
    this.reponseCourteDisponible = false
    this.interactifObligatoire = true
    this.besoinFormulaireComplexe = formulaireJuniperGreen
    this.sup = serialiseFormulaireComplexe(
      formulaireJuniperGreen,
      valeursParDefaut(formulaireJuniperGreen),
    )
    // Valeurs historiques conservées pour les liens publiés avec s2 à s5.
    this.sup2 = 2
    this.sup3 = 1
    this.sup4 = true
    this.sup5 = false
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.comment =
      'Le mode de départ «\u00a0départ libre, mais pas sur un nombre premier\u00a0» évite que le ' +
      'premier joueur gagne à coup sûr en choisissant un nombre premier supérieur à la ' +
      `moitié du plus grand nombre de la grille${sp()}: son adversaire ne pourrait alors répondre ` +
      'que 1. Le mode «\u00a0départ aléatoire sur un nombre non premier\u00a0» impose ce même premier ' +
      'nombre, tiré au hasard, sans laisser le premier joueur le choisir. ' +
      `Score${sp()}: 2/2 si la partie va jusqu’à son terme (plus aucun coup possible), sinon 1/2 ` +
      `à partir de ${NOMBRE_DE_CASES_POUR_UN_POINT} nombres choisis et 0/2 en dessous.`
  }

  nouvelleVersion(): void {
    const ancienFormat = !String(this.sup).includes('*')
    const params = lireFormulaireComplexe(formulaireJuniperGreen, this.sup)
    const modeDepart = ancienFormat
      ? modeDepartDepuisSup(this.sup3)
      : (params.selection('modeDepart') as ModeDepart)
    const modeErreur: ModeErreur = ancienFormat
      ? this.sup5 === true || this.sup5 === 'true'
        ? 'arret'
        : 'indication'
      : params.case('arretSurErreur')
        ? 'arret'
        : 'indication'
    const decompteCoupsRestants = ancienFormat
      ? false
      : params.case('decompteCoupsRestants')
    const regles: ReglesJuniperGreen = {
      max: Math.max(
        2,
        ancienFormat ? Number(this.sup) || 40 : params.nombre('max'),
      ),
      modeDepart,
    }
    const nombresParLigne = ancienFormat
      ? Number(this.sup2) === 1
        ? 5
        : 10
      : Number(params.selection('nombresParLigne'))

    const suiteInitiale: number[] =
      modeDepart === 'aleatoireSansPremier'
        ? [choice(nombresNonPremiers(regles.max))]
        : []

    // Règles masquées : la grille et le texte qu'elle écrit en dessous
    // suffisent quand les élèves connaissent déjà le jeu.
    const rappelDesRegles = ancienFormat
      ? this.sup4 === true || this.sup4 === 'true'
      : params.case('rappelDesRegles')
    this.consigne = !rappelDesRegles ? '' : this.texteRegles(regles, modeErreur)

    this.listeQuestions[0] = ajouteJuniperGreen(this, 0, {
      max: regles.max,
      nombresParLigne,
      modeDepart: regles.modeDepart,
      modeErreur,
      decompteCoupsRestants,
      suite: suiteInitiale,
      interactivityOn: this.interactif,
    })

    handleAnswers(
      this,
      0,
      { reponse: { value: '' } },
      { formatInteractif: JuniperGreenElement.elementTag },
    )

    const exemple = this.tirePartieLaPlusLongue(regles, suiteInitiale)
    const dernier = exemple.at(-1)
    this.listeCorrections[0] =
      'Les parties possibles sont très nombreuses. ' +
      `En voici une parmi beaucoup d’autres, avec ses ${exemple.length} nombre${exemple.length > 1 ? 's' : ''}.` +
      ajouteJuniperGreen(this, 0, {
        id: `juniper-greenEx${this.numeroExercice ?? 0}Q0Correction`,
        max: regles.max,
        nombresParLigne,
        modeDepart: regles.modeDepart,
        suite: exemple,
        animation: true,
        interactivityOn: false,
      }) +
      `<br>La partie s’arrête sur $${dernier}$ car aucun de ses multiples, ni de ses diviseurs ` +
      'n’est encore disponible dans la grille.'

    listeQuestionsToContenu(this)
  }

  /** Rappel des règles du jeu, affiché en consigne : à tour de rôle, jouer un multiple ou un diviseur du dernier nombre choisi. */
  private texteRegles(
    regles: ReglesJuniperGreen,
    modeErreur: ModeErreur,
  ): string {
    const regleDepart =
      regles.modeDepart === 'libre'
        ? 'Choisir librement le premier nombre.'
        : regles.modeDepart === 'libreSansPremier'
          ? 'Choisir librement le premier nombre, sans choisir un nombre premier.'
          : `Le premier nombre, non premier, est déjà tiré au hasard${sp()}: continuer à partir de lui.`
    const regleErreur =
      modeErreur === 'arret'
        ? 'Un choix invalide arrête la partie.'
        : 'Un choix invalide affiche une indication et n’arrête pas la partie.'
    return (
      'Choisir un nombre de la grille à tour de rôle.<br>' +
      `${regleDepart}<br>` +
      'Choisir ensuite un multiple ou un diviseur du nombre précédemment choisi.<br>' +
      `Ne pas choisir un nombre déjà utilisé${sp()}: le joueur qui ne peut plus jouer a perdu.<br>` +
      `${regleErreur}<br>` +
      'Cliquer sur «\u00a0Vérifier les réponses\u00a0» arrête la partie en cours et affiche le score.'
    )
  }

  /**
   * Une partie jouée au hasard se bloque souvent très vite : on en tire
   * plusieurs et on garde la plus longue, plus parlante comme exemple.
   */
  private tirePartieLaPlusLongue(
    regles: ReglesJuniperGreen,
    suiteInitiale: number[] = [],
  ): number[] {
    let laPlusLongue: number[] = []
    for (let tirage = 0; tirage < NOMBRE_DE_TIRAGES; tirage++) {
      const suite: number[] = [...suiteInitiale]
      let coups = coupsPossibles(suite, regles)
      while (coups.length > 0) {
        suite.push(choice(coups))
        coups = coupsPossibles(suite, regles)
      }
      if (suite.length > laPlusLongue.length) laPlusLongue = suite
    }
    return laPlusLongue
  }
}
