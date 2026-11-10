// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3292c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 720424992).
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '3292c'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une proportion de proportion (2)'
export const dateDePublication = '17/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Claude (ia) et Gilles Mora
 *
 */
export default class ProportionDeProportion2Old extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Dans un lycée, le quart des élèves sont internes, parmi eux, la moitié sont des filles. <br>
    La proportion des filles internes par rapport à l'ensemble des élèves du lycée est égale à : `
    this.correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donné par : <br>
    $\\dfrac{1}{4}\\times\\dfrac{1}{2}=\\dfrac{1}{8}=0,125=${miseEnEvidence('12,5\\,\\%')}$.`
    this.reponses = ['$12,5\\,\\%$', '$4\\,\\%$', '$25\\,\\%$', '$50\\,\\%$']
  }

  versionAleatoire: () => void = () => {
    switch (choice([1, 1, 2])) {
      case 1:
        {
          const proportions = [
            { tex: 'un dixième', frac: new FractionEtendue(1, 10), val: 0.1 },
            { tex: 'un cinquième', frac: new FractionEtendue(1, 5), val: 0.2 },
            {
              tex: 'deux cinquièmes',
              frac: new FractionEtendue(2, 5),
              val: 0.4,
            },
            {
              tex: 'trois cinquièmes',
              frac: new FractionEtendue(3, 5),
              val: 0.6,
            },
            { tex: 'un quart', frac: new FractionEtendue(1, 4), val: 0.25 },
            { tex: 'la moitié', frac: new FractionEtendue(1, 2), val: 0.5 },
            { tex: 'trois quarts', frac: new FractionEtendue(3, 4), val: 0.75 },
          ]
          const prop1 = choice(proportions)
          const prop2 = choice(proportions)
          const produitFraction = prop1.frac.produitFraction(prop2.frac)
          const bonneReponse1 = `${produitFraction.texFractionSimplifiee}`
          const bonneReponse2 = `${texNombre(prop1.val * prop2.val, 4)}`
          const bonneReponse3 = `${texNombre(prop1.val * prop2.val * 100, 4)}\\,\\%`

          let bonneReponseRetenue
          let correction
          const denominateur = produitFraction.d

          if (
            denominateur === 16 ||
            denominateur === 30 ||
            denominateur === 40
          ) {
            bonneReponseRetenue = bonneReponse1
            // Pour les fractions : mise en évidence directement après le calcul
            correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donnée par : <br>
    $${prop1.frac.texFractionSimplifiee}\\times ${prop2.frac.texFractionSimplifiee}=${miseEnEvidence(produitFraction.texFractionSimplifiee)}$.`
          } else {
            bonneReponseRetenue = choice([
              bonneReponse1,
              bonneReponse2,
              bonneReponse3,
            ])

            if (bonneReponseRetenue === bonneReponse1) {
              // Si c'est quand même une fraction qui est choisie
              correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donnée par : <br>
    $${prop1.frac.texFractionSimplifiee}\\times ${prop2.frac.texFractionSimplifiee}=${miseEnEvidence(produitFraction.texFractionSimplifiee)}$.`
            } else {
              // Pour les pourcentages ou décimaux : mise en évidence après "soit"
              if (bonneReponseRetenue === bonneReponse3) {
                // Si c'est un pourcentage, ajouter la fraction sur 100
                const pourcentageValeur = prop1.val * prop2.val * 100
                correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donnée par : <br>
    $${prop1.frac.texFractionSimplifiee}\\times ${prop2.frac.texFractionSimplifiee}=${produitFraction.texFractionSimplifiee}=\\dfrac{${texNombre(pourcentageValeur, 4)}}{100}$, soit $${miseEnEvidence(bonneReponseRetenue)}$.`
              } else {
                // Pour les décimaux uniquement
                correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donnée par : <br>
    $${prop1.frac.texFractionSimplifiee}\\times ${prop2.frac.texFractionSimplifiee}=${produitFraction.texFractionSimplifiee}$, soit $${miseEnEvidence(bonneReponseRetenue)}$.`
              }
            }
          }

          this.enonce = `Dans un lycée, ${prop1.tex}  des élèves sont internes, parmi eux, ${prop2.tex} sont des filles. <br>
    La proportion des filles internes par rapport à l'ensemble des élèves du lycée est égale à : `
          this.correction = correction
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$${texNombre(prop1.val * 100, 2)}\\,\\%$`,
            `$${prop1.frac.sommeFraction(prop2.frac).texFractionSimplifiee}$`,
            `$${texNombre(prop1.val * prop2.val * 10, 4)}$`,
          ]
        }
        break

      case 2:
      default:
        {
          const proportions = [
            {
              tex: 'un tiers',
              frac: new FractionEtendue(1, 3),
              val: 0.3333333333333,
            },
            {
              tex: 'trois cinquièmes',
              frac: new FractionEtendue(3, 5),
              val: 0.6,
            },
            {
              tex: 'trois dixièmes',
              frac: new FractionEtendue(3, 10),
              val: 0.3,
            },
          ]
          const prop1 = choice(proportions)
          const prop2 = choice(proportions)
          const produitFraction = prop1.frac.produitFraction(prop2.frac)
          const bonneReponse1 = `${produitFraction.texFractionSimplifiee}`

          const bonneReponseRetenue = choice([bonneReponse1])

          // Dans le cas 2, c'est toujours une fraction, donc mise en évidence directe
          const correction = `La proportion des filles internes par rapport à l'ensemble des élèves du lycée est donnée par : <br>
    $${prop1.frac.texFractionSimplifiee}\\times ${prop2.frac.texFractionSimplifiee}=${miseEnEvidence(produitFraction.texFractionSimplifiee)}$.`

          this.enonce = `Dans un lycée, ${prop1.tex}  des élèves sont internes, parmi eux, ${prop2.tex} sont des filles. <br>
    La proportion des filles internes par rapport à l'ensemble des élèves du lycée est égale à : `
          this.correction = correction
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$${texNombre(prop1.val * 100, 2)}\\,\\%$`,
            `$${prop1.frac.sommeFraction(prop2.frac).texFractionSimplifiee}$`,
            `$${new FractionEtendue(prop1.frac.n + prop2.frac.n, prop1.frac.d * prop2.frac.d).texFraction}$`,
          ]
        }
        break
    }
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()

    this.versionAleatoire()
  }
}
