import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

type CouleurJetons = {
  nom: string
  pluriel: string
  nombre: number
}

export const titre =
  'Calculer une probabilité dans une situation d’équiprobabilité'
export const dateDePublication = '07/08/2026'
export const amcReady = true
export const interactifReady = true

export const dateDeModifImportante = '21/10/2026'

export const uuid = '267fb'
export const refs = {
  'fr-fr': ['1A-P04-2', '2A-P4-2'],
  'fr-ch': ['11LSNO4C-8'],
}

/**
 * Calculer la probabilité d'obtenir un jeton d'une couleur donnée.
 * @author Stéphane Guyon
 */
export default class ProbabiliteTirageJeton extends ExerciceQcmACourt {
  private appliqueLesValeurs(couleurs: CouleurJetons[], cible: CouleurJetons) {
    let nombreTotal = couleurs.reduce(
      (total, couleur) => total + couleur.nombre,
      0,
    )

    // La réponse 1/(nombre de couleurs) doit rester un distracteur.
    if (cible.nombre * couleurs.length === nombreTotal) {
      const autreCouleur = couleurs.find((couleur) => couleur !== cible)!
      autreCouleur.nombre += autreCouleur.nombre < 10 ? 1 : -1
      nombreTotal = couleurs.reduce(
        (total, couleur) => total + couleur.nombre,
        0,
      )
    }

    const fractionInitiale = new FractionEtendue(cible.nombre, nombreTotal)
    const bonneReponse = fractionInitiale.texFractionSimplifiee

    const candidats = [
      new FractionEtendue(1, couleurs.length).texFractionSimplifiee,
      new FractionEtendue(cible.nombre, nombreTotal - cible.nombre)
        .texFractionSimplifiee,
      ...couleurs
        .filter((couleur) => couleur !== cible)
        .map(
          (couleur) =>
            new FractionEtendue(couleur.nombre, nombreTotal)
              .texFractionSimplifiee,
        ),
      new FractionEtendue(nombreTotal - cible.nombre, nombreTotal)
        .texFractionSimplifiee,
      new FractionEtendue(1, cible.nombre).texFractionSimplifiee,
      new FractionEtendue(cible.nombre + 1, nombreTotal).texFractionSimplifiee,
      new FractionEtendue(Math.max(1, cible.nombre - 1), nombreTotal)
        .texFractionSimplifiee,
    ]
    const distracteurs = [...new Set(candidats)].filter(
      (reponse) => reponse !== bonneReponse,
    )

    this.reponses = [
      `$${bonneReponse}$`,
      ...distracteurs.slice(0, 3).map((reponse) => `$${reponse}$`),
    ]

    const listeCouleurs = couleurs
      .map(
        (couleur, index) =>
          `$\\bullet$ $${couleur.nombre}$ jetons ${couleur.pluriel}${index === couleurs.length - 1 ? '.' : ' ;'}`,
      )
      .join('<br>')

    this.enonce = `Une boîte contient des jetons indiscernables au toucher :<br>
    ${listeCouleurs}<br><br>
    On tire au hasard un jeton.<br>
    On note $A$ l'événement : «\u00a0obtenir un jeton ${cible.nom}\u00a0».<br>
    Calculer $P(A)$.`

    const fractionObtenue = `\\dfrac{${cible.nombre}}{${nombreTotal}}`
    const calculFinal =
      fractionInitiale.d !== nombreTotal
        ? `${fractionObtenue}=${miseEnEvidence(bonneReponse)}`
        : miseEnEvidence(fractionObtenue)

    this.correction = `On note $\\Omega$ l'univers constitué de tous les jetons de la boîte.<br>
    La boîte contient $${nombreTotal}$ jetons, donc $\\operatorname{Card}(\\Omega)=${nombreTotal}$.<br>
    Les jetons étant indiscernables au toucher et le tirage étant effectué au hasard, les $${nombreTotal}$ issues de $\\Omega$ sont équiprobables.<br>
    L'événement $A$ est : «\u00a0obtenir un jeton ${cible.nom}\u00a0».<br>
    La boîte contient $${cible.nombre}$ jetons ${cible.pluriel}, donc $\\operatorname{Card}(A)=${cible.nombre}$.<br>
    On en déduit :
    $P(A)=\\dfrac{\\operatorname{Card}(A)}{\\operatorname{Card}(\\Omega)}
    =${calculFinal}$.`
  }

  versionAleatoire = () => {
    const couleursDisponibles = [
      { nom: 'rouge', pluriel: 'rouges' },
      { nom: 'bleu', pluriel: 'bleus' },
      { nom: 'vert', pluriel: 'verts' },
      { nom: 'jaune', pluriel: 'jaunes' },
      { nom: 'noir', pluriel: 'noirs' },
    ]
    const nombreCouleurs = randint(3, 5)
    const couleurs: CouleurJetons[] = shuffle(couleursDisponibles)
      .slice(0, nombreCouleurs)
      .map((couleur) => ({ ...couleur, nombre: randint(3, 10) }))
    const cible = choice(couleurs)
    this.appliqueLesValeurs(couleurs, cible)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    this.options.ordered = context.isTypst
    // Saisie libre (version QCM désactivée) : la consigne devient « P(A)= »
    this.enonceCourt = () =>
      this.interactif
        ? this.enonce.replace(/Calculer \$P\(A\)\$\.\s*$/, '$P(A)=$')
        : this.enonce
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.versionAleatoire()
  }
}
