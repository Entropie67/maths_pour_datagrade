import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Calculer la probabilité d’une réunion ou d’une intersection'
export const dateDePublication = '07/08/2026'
export const amcReady = true
export const interactifReady = true

export const dateDeModifImportante = '21/10/2026'

export const uuid = '5398b'
export const refs = {
  'fr-fr': ['1A-P04-3', '2A-P4-3'],
  'fr-ch': [],
}

type TypeEvenement =
  | 'pairEtSuperieur'
  | 'pairOuSuperieur'
  | 'multipleEtInferieur'
  | 'multipleOuSuperieur'

/**
 * Construire un événement défini par deux conditions avant de calculer sa probabilité.
 * @author Stéphane Guyon
 */
export default class ProbabiliteDeuxConditions extends ExerciceQcmACourt {
  private appliqueLesValeurs(
    nombreCartes: number,
    typeEvenement: TypeEvenement,
    seuil: number,
    diviseur: number,
  ) {
    const univers = Array.from(
      { length: nombreCartes },
      (_, index) => index + 1,
    )
    const utilisePairs = typeEvenement.startsWith('pair')
    const utiliseEt = typeEvenement.includes('Et')
    const utiliseInferieur = typeEvenement === 'multipleEtInferieur'

    const premiereCondition = utilisePairs
      ? univers.filter((nombre) => nombre % 2 === 0)
      : univers.filter((nombre) => nombre % diviseur === 0)
    const secondeCondition = utiliseInferieur
      ? univers.filter((nombre) => nombre < seuil)
      : univers.filter((nombre) => nombre > seuil)
    const intersection = premiereCondition.filter((nombre) =>
      secondeCondition.includes(nombre),
    )
    const reunion = [
      ...new Set([...premiereCondition, ...secondeCondition]),
    ].sort((premierNombre, secondNombre) => premierNombre - secondNombre)
    const favorables = utiliseEt ? intersection : reunion

    const premiereDescription = utilisePairs
      ? 'pair'
      : `multiple de $${diviseur}$`
    const secondeDescription = utiliseInferieur
      ? `strictement inférieur à $${seuil}$`
      : `strictement supérieur à $${seuil}$`
    const liaison = utiliseEt ? 'et' : 'ou'
    const fractionInitiale = new FractionEtendue(
      favorables.length,
      nombreCartes,
    )
    const bonneReponse = fractionInitiale.texFractionSimplifiee
    const distracteurIntersectionCompteeDeuxFois = new FractionEtendue(
      premiereCondition.length + secondeCondition.length,
      nombreCartes,
    ).texFractionSimplifiee

    const candidats = [
      ...(!utiliseEt ? [distracteurIntersectionCompteeDeuxFois] : []),
      new FractionEtendue(favorables.length, nombreCartes - favorables.length)
        .texFractionSimplifiee,
      new FractionEtendue(nombreCartes - favorables.length, nombreCartes)
        .texFractionSimplifiee,
      new FractionEtendue(premiereCondition.length, nombreCartes)
        .texFractionSimplifiee,
      new FractionEtendue(secondeCondition.length, nombreCartes)
        .texFractionSimplifiee,
      new FractionEtendue(nombreCartes, favorables.length)
        .texFractionSimplifiee,
      new FractionEtendue(favorables.length + 1, nombreCartes)
        .texFractionSimplifiee,
    ]
    const distracteurs = [...new Set(candidats)].filter(
      (reponse) => reponse !== bonneReponse,
    )
    this.reponses = [
      `$${bonneReponse}$`,
      ...distracteurs.slice(0, 3).map((reponse) => `$${reponse}$`),
    ]

    this.enonce = `On choisit au hasard une carte parmi $${nombreCartes}$ cartes numérotées de $1$ à $${nombreCartes}$.<br><br>
    On considère l'événement $E$ :<br>
    «\u00a0Le nombre obtenu est ${premiereDescription} ${liaison} ${secondeDescription}.\u00a0»<br><br>
    Calculer $P(E)$.`

    const ecritureEnsemble = (nombres: number[]) =>
      nombres.map((nombre) => `${nombre}`).join('\\,;\\,')
    const fractionObtenue = `\\dfrac{${favorables.length}}{${nombreCartes}}`
    const calculFinal =
      fractionInitiale.d !== nombreCartes
        ? `${fractionObtenue}=${miseEnEvidence(bonneReponse)}`
        : miseEnEvidence(fractionObtenue)
    const constructionEvenement = utiliseEt
      ? `Le mot «${sp()}et${sp()}» correspond à une intersection :
      $E=E_1\\cap E_2$. On ne conserve donc que les nombres qui appartiennent aux deux ensembles.<br>
      Ainsi, $E=\\{${ecritureEnsemble(favorables)}\\}$ et
      $\\operatorname{Card}(E)=\\operatorname{Card}(E_1\\cap E_2)=${favorables.length}$.`
      : `Le mot «${sp()}ou${sp()}» correspond à une réunion :
      $E=E_1\\cup E_2$. On conserve donc les nombres qui appartiennent à au moins l'un des deux ensembles.<br>
      Les nombres de l'intersection $E_1\\cap E_2=\\{${ecritureEnsemble(intersection)}\\}$ ne doivent être comptés qu'une seule fois.<br>
      Ainsi, $E=\\{${ecritureEnsemble(favorables)}\\}$ et
      $\\operatorname{Card}(E)=\\operatorname{Card}(E_1)+\\operatorname{Card}(E_2)-\\operatorname{Card}(E_1\\cap E_2)
      =${premiereCondition.length}+${secondeCondition.length}-${intersection.length}=${favorables.length}$.`

    this.correction = `On note $\\Omega$ l'univers constitué des nombres inscrits sur les cartes. Ainsi,
    $\\operatorname{Card}(\\Omega)=${nombreCartes}$.<br>
    Le choix étant effectué au hasard parmi les $${nombreCartes}$ cartes, les issues de $\\Omega$ sont équiprobables.<br><br>
    On note $E_1$ l'événement : «${sp()}le nombre obtenu est ${premiereDescription}${sp()}».<br>
    Dans $\\Omega$, $E_1=\\{${ecritureEnsemble(premiereCondition)}\\}$.<br>
    On note $E_2$ l'événement : «${sp()}le nombre obtenu est ${secondeDescription}${sp()}».<br>
    Dans $\\Omega$, $E_2=\\{${ecritureEnsemble(secondeCondition)}\\}$.<br>
    ${constructionEvenement}<br>
    On en déduit :
    $P(E)=\\dfrac{\\operatorname{Card}(E)}{\\operatorname{Card}(\\Omega)}
    =${calculFinal}$.`
  }

  versionAleatoire = () => {
    const typesEvenements: TypeEvenement[] = [
      'pairEtSuperieur',
      'pairOuSuperieur',
      'multipleEtInferieur',
      'multipleOuSuperieur',
    ]
    const typeEvenement = choice(typesEvenements)
    const nombreCartes = randint(13, 20)
    const diviseur = randint(3, 5)
    const plusGrandMultiple = Math.floor(nombreCartes / diviseur) * diviseur
    const seuil =
      typeEvenement === 'multipleEtInferieur'
        ? randint(diviseur + 2, nombreCartes - 2)
        : typeEvenement === 'multipleOuSuperieur'
          ? randint(4, plusGrandMultiple - 1)
          : randint(4, nombreCartes - 3)
    this.appliqueLesValeurs(nombreCartes, typeEvenement, seuil, diviseur)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    this.options.ordered = context.isTypst
    // Saisie libre (version QCM désactivée) : la consigne devient « P(E)= »
    this.enonceCourt = () =>
      this.interactif
        ? this.enonce.replace(/Calculer \$P\(E\)\$\.\s*$/, '$P(E)=$')
        : this.enonce
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.versionAleatoire()
  }
}
