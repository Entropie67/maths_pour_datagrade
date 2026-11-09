// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 939af continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { Arbre } from '../../modules/arbres'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '939af'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Utiliser un arbre pour calculer une probabilité (intersection)'
export default class auto1AP3aOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    let objets = []
    const rationnel = true

    const omega = new Arbre({
      racine: true,
      rationnel,
      nom: '',
      proba: 1,
      visible: false,
      alter: '',
      enfants: [
        new Arbre({
          rationnel,
          nom: 'A',
          proba: 0.3,
          visible: false,
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: 0.6,
              visible: false,
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: 0.4,
            }),
          ],
        }),
        new Arbre({
          rationnel,
          nom: '\\bar A',
          proba: 0.7,
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: 0.4,
              visible: true,
              alter: '',
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: 0.6,
              visible: false,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, 3, true, 1, 8)

    this.enonce = "On donne l'arbre de probabilités ci-dessous :<br>"
    this.enonce += mathalea2d(
      Object.assign({ display: 'inline' } as const, fixeBordures(objets)),
      objets,
    )
    this.enonce += '<br>$P(A \\cap C)$ est égal à :'
    this.correction = `On sait que <br>$\\begin{aligned}
        P(A \\cap C) &= P(A) \\times P_A(C)\\\\
        &= \\dfrac{3}{10} \\times \\dfrac{6}{10} \\\\
        &= \\dfrac{18}{100}\\\\
        &= ${miseEnEvidence(`\\dfrac{9}{50}`)}
        \\end{aligned}$`

    this.reponses = [
      '$\\dfrac{9}{50}$',
      '$\\dfrac{13}{50}$ ',
      '$\\dfrac{7}{50}$ ',
      '$\\dfrac{11}{50}$ ',
    ]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      let objets = []
      const rationnel = true
      const NumA = randint(1, 9)
      const DenA = 10
      const NumAC = randint(1, 9)
      const DenAC = 10
      const NumBC = randint(2, 8)
      const DenBC = 10
      const pA = new FractionEtendue(NumA, DenA)
      const pAC = new FractionEtendue(NumAC, DenAC)
      const pBC = new FractionEtendue(NumBC, DenBC)

      // On définit l'arbre complet
      const omega = new Arbre({
        racine: true,
        rationnel,
        nom: '',
        proba: 1,
        visible: false,
        alter: '',
        enfants: [
          new Arbre({
            rationnel,
            nom: 'A',
            proba: pA,
            visible: false,
            enfants: [
              new Arbre({
                rationnel,
                nom: 'C',
                proba: pAC,
                visible: false,
              }),
              new Arbre({
                rationnel,
                nom: '\\bar C',
                proba: pAC.entierMoinsFraction(1),
              }),
            ],
          }),
          new Arbre({
            rationnel,
            nom: '\\bar A',
            proba: pA.entierMoinsFraction(1),
            enfants: [
              new Arbre({
                rationnel,
                nom: 'C',
                proba: pBC,
                visible: true,
              }),
              new Arbre({
                rationnel,
                nom: '\\bar C',
                proba: pBC.entierMoinsFraction(1),
                visible: false,
                alter: '',
              }),
            ],
          }),
        ],
      })

      omega.setTailles() // On calcule les tailles des arbres.
      objets = omega.represente(0, 6, 0, 3, true, 1, 8)
      const pC1 = pA.produitFraction(pAC)
      const distracteur = pA.sommeFraction(pAC)

      // Génère distracteur2 différent de distracteur1 et de la bonne réponse

      this.enonce = "On donne l'arbre de probabilités ci-dessous :<br>"
      this.enonce += mathalea2d(
        Object.assign({ display: 'inline' } as const, fixeBordures(objets)),
        objets,
      )
      this.enonce += '<br>$P(A \\cap C)$ est égal à :'

      this.correction = `On sait que :<br>$\\begin{aligned}
        P(A \\cap C) &= P(A) \\times P_A(C)\\\\
        &= ${pA.texFractionSimplifiee} \\times ${pAC.texFractionSimplifiee} \\\\
        &= ${miseEnEvidence(pC1.texFractionSimplifiee)}
        \\end{aligned}$`

      this.reponses = [
        `$${pC1.texFractionSimplifiee}$`,
        `$${pAC.texFractionSimplifiee}$`,
        `$${pBC.entierMoinsFraction(1).texFractionSimplifiee}$`,
        `$${distracteur.texFractionSimplifiee}$`,
      ]
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, this.reponses.length, true)
    ) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
