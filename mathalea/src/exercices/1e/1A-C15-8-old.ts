// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7e7b0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'

// import ExerciceQcmA from '../../ExerciceQcmA'
import { prenomPronom } from '../../lib/outils/Personne'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '7e7b0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer une fraction d'un paiement"
export const dateDePublication = '06/01/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C15hOld extends ExerciceQcmA {
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

    this.enonce = `${quidam} achète un vélo électrique. Pour le réserver, ${pronom} paye $${acompte.texFraction}$ du prix au magasin. <br>
    Le magasin lui propose de payer le reste en $${nbPaiements}$ paiements d'un même montant.<br>
Quelle fraction du prix du vélo représente l'un de ces $${nbPaiements}$ paiements ?`

    this.correction = `Après avoir payé un acompte de $${acompte.texFraction}$ du prix du vélo, ${quidam} doit encore payer  : $1 - ${acompte.texFraction} = ${reste.texFraction}$ du prix du vélo.<br>
Ce reste est divisé en $${nbPaiements}$ paiements égaux.<br>
Diviser par $${nbPaiements}$ revient à multiplier par $\\dfrac{1}{${nbPaiements}}$ donc, chaque paiement représente  $${reste.texFraction} \\times \\dfrac{1}{${nbPaiements}} = ${miseEnEvidence(unPaiement.texFraction)}$ du prix du vélo.`

    this.reponses = [
      `$${unPaiement.texFraction}$`,
      `$${d1.texFraction}$`,
      `$${d2.texFraction}$`,
      `$${d3.texFraction}$`,
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
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
