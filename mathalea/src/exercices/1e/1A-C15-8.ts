import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'

// import ExerciceQcmA from '../../ExerciceQcmA'
import { prenomPronom } from '../../lib/outils/Personne'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '23/10/2026'

export const uuid = 'e81fe'
export const refs = {
  'fr-fr': ['1A-C15-8'],
  'fr-ch': ['10CTQCMNO-9', '10LCQCMNO-10', '10LSQCMNO-11', '11CTQCMNO-9', '11LCQCMNO-12', '11LSQCMNO-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Calculer une fraction d'un paiement"
export const dateDePublication = '06/01/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C15h extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    num: number,
    den: number,
    nbPaiements: number,
    quidam: string,
    pronom: string,
  ): void {
    const acompte = new FractionEtendue(num, den)
    const reste = acompte.oppose().ajouteEntier(1) // 1 - acompte
    const unPaiement = reste.produitFraction(
      new FractionEtendue(1, nbPaiements),
    )

    // Distracteurs variés pour garantir 4 réponses distinctes
    const d1 = reste // Le reste total (oubli de diviser)
    const d2 = acompte // L'acompte lui-même (confusion)
    const d3 = reste.produitFraction(new FractionEtendue(1, nbPaiements + 1)) // Erreur sur le nombre de paiements

    // Un distracteur ne doit pas valoir la bonne réponse (ni un autre distracteur) : par exemple
    // l'acompte 1/5 vaut le paiement 4/20. On le remplace alors, sans tirage aléatoire supplémentaire.
    const memeValeur = (a: FractionEtendue, b: FractionEtendue) =>
      a.num * b.den === b.num * a.den
    const secours = [
      reste.produitFraction(new FractionEtendue(1, nbPaiements + 2)),
      reste.produitFraction(new FractionEtendue(1, Math.max(2, nbPaiements - 1))),
      acompte.produitFraction(new FractionEtendue(1, nbPaiements)),
    ]
    const distracteurs: FractionEtendue[] = []
    for (const candidat of [d1, d2, d3, ...secours]) {
      if (distracteurs.length === 3) break
      if (
        !memeValeur(candidat, unPaiement) &&
        !distracteurs.some((d) => memeValeur(d, candidat))
      ) {
        distracteurs.push(candidat)
      }
    }

    this.enonce = `${quidam} achète un vélo électrique. Pour le réserver, ${pronom} paye $${acompte.texFraction}$ du prix au magasin. <br>
    Le magasin lui propose de payer le reste en $${nbPaiements}$ paiements d'un même montant.<br>
Quelle fraction du prix du vélo représente l'un de ces $${nbPaiements}$ paiements ?`

    this.correction = `Après avoir payé un acompte de $${acompte.texFraction}$ du prix du vélo, ${quidam} doit encore payer  : $1 - ${acompte.texFraction} = ${reste.texFraction}$ du prix du vélo.<br>
Ce reste est divisé en $${nbPaiements}$ paiements égaux.<br>
Diviser par $${nbPaiements}$ revient à multiplier par $\\dfrac{1}{${nbPaiements}}$ donc, chaque paiement représente  $${reste.texFraction} \\times \\dfrac{1}{${nbPaiements}} = ${miseEnEvidence(unPaiement.texFraction)}$ du prix du vélo.`

    this.reponses = [
      `$${unPaiement.texFraction}$`,
      ...distracteurs.map((d) => `$${d.texFraction}$`),
    ]
  }

  versionOriginale: () => void = () => {
    let compteur = 0
    do {
      this.appliquerLesValeurs(1, 5, 3, 'Léa', 'elle')
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const listeFractions = [
        [1, 5],
        [1, 4],
        [2, 5],
        [1, 3],
        [3, 10],
        [2, 7],
        [1, 6],
        [3, 8],
        [1, 10],
        [2, 9],
      ]
      const frac = choice(listeFractions)
      const nbPaiements = choice([3, 4, 5, 6])
      const personne = prenomPronom()
      this.appliquerLesValeurs(
        frac[0],
        frac[1],
        nbPaiements,
        personne.prenom,
        personne.pronom,
      )
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { fractionEgale: true, nombreDecimalSeulement: true })
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
