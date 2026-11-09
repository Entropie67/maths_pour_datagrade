import { fixeBordures } from '../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
export const dateDePublication = '10/08/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '35d5f'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-P05-3'],
  'fr-ch': ['4mProbStat-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Déterminer une probabilité conditionnelle'
export default class auto1AP3c extends ExerciceQcmACourt {
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
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: 0.6,
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
              // alter: 'x'
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: 0.6,
              visible: true,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, 3, true, 1, 8)

    // Génère distracteur2 différent de distracteur1 et de la bonne réponse

    this.enonce = "On donne l'arbre de probabilités ci-dessous :<br>"
    this.enonce += mathalea2d(
      Object.assign({ display: 'inline' } as const, fixeBordures(objets)),
      objets,
    )
    this.enonce += '<br>$P_C(A)$ est égal à :'
    this.correction = `On sait que $ P_C(A)=\\dfrac{P(A \\cap C)}{P(C)}$<br>
        D'après la formule des probabilités totales :<br>
         $\\begin{aligned}P(C)&=P(A\\cap C)+P(\\bar A \\cap C)\\\\
         &=P(A)\\times P_A(C)+P(\\bar A)\\times P_{\\bar A}(C)\\\\
         &=${texNombre(0.3)}\\times ${texNombre(0.6)}+${texNombre(0.7)}\\times ${texNombre(0.4)}\\\\
         &=${texNombre(0.18)}+${texNombre(0.28)}\\\\
            &=${texNombre(0.46)}\\\\
            \\end{aligned}$<br>
         <br>$\\begin{aligned}
    P_C(A)&=\\dfrac{P(A \\cap C)}{P(C)}\\\\
    &=\\dfrac{P(A)\\times P_A(C)}{P(C)}\\\\
    &=\\dfrac{${texNombre(0.18)}}{${texNombre(0.46)}}\\\\
   &=${miseEnEvidence(`\\dfrac{9}{23}`)}
     \\end{aligned}$`

    this.reponses = [
      '$\\dfrac{9}{23}$',
      '$\\dfrac{11}{23}$ ',
      '$\\dfrac{13}{23}$ ',
      '$\\dfrac{9}{50}$ ',
    ]
  }

  versionAleatoire = () => {
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
          enfants: [
            new Arbre({
              rationnel,
              nom: 'C',
              proba: pAC,
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
              // alter: 'x'
            }),
            new Arbre({
              rationnel,
              nom: '\\bar C',
              proba: pBC.entierMoinsFraction(1),
              visible: true,
              alter: '',
            }),
          ],
        }),
      ],
    })

    omega.setTailles() // On calcule les tailles des arbres.
    objets = omega.represente(0, 6, 0, 3, true, 1, 8)
    const pC1 = pA.produitFraction(pAC)
    const pC2 = pA.entierMoinsFraction(1).produitFraction(pBC)
    const pC = pC1.sommeFraction(pC2) // On a calculé P(C)
    const Reponse = pC1.diviseFraction(pC)
    // Génère distracteur2 différent de distracteur1 et de la bonne réponse

    this.enonce = "On donne l'arbre de probabilités ci-dessous :<br>"
    this.enonce += mathalea2d(
      Object.assign({ display: 'inline' } as const, fixeBordures(objets)),
      objets,
    )
    this.enonce += '<br>$P_C(A)$ est égal à :'

    this.correction = `On sait que $ P_C(A)=\\dfrac{P(A \\cap C)}{P(C)}$<br>
        D'après la formule des probabilités totales :<br>
         $\\begin{aligned}P(C)&=P(A\\cap C)+P(\\bar A \\cap C)\\\\
         &=P(A)\\times P_A(C)+P(\\bar A)\\times P_{\\bar A}(C)\\\\
         &=${pA.texFractionSimplifiee}\\times ${pAC.texFractionSimplifiee}+${pA.entierMoinsFraction(1).texFractionSimplifiee}\\times ${pBC.texFractionSimplifiee}\\\\
         &=${pC1.texFractionSimplifiee}+${pC2.texFractionSimplifiee}\\\\
            &=${pC.texFractionSimplifiee}\\\\
            \\end{aligned}$<br>
         <br>$\\begin{aligned}
    P_C(A)&=\\dfrac{P(A \\cap C)}{P(C)}\\\\
    &=\\dfrac{P(A)\\times P_A(C)}{P(C)}\\\\
    &=\\dfrac{${pC1.texFractionSimplifiee}}{${pC.texFractionSimplifiee}}\\\\
    &=${pC1.texFractionSimplifiee}\\times ${pC.inverse().texFractionSimplifiee}\\\\
    &=${miseEnEvidence(Reponse.texFractionSimplifiee)}\\\\
     \\end{aligned}$`
    // --- Distracteurs sûrs, distincts et ≠ bonne réponse --- Merci mon ami Chat GPT pour cette astuce, devenue trop lourde car j'ai viré un distracteur....
    const denom = Math.max(1, Reponse.denIrred) // garde-fou
    const correct = Reponse.numIrred

    // 1) Construire un pool de numérateurs candidats
    let candidats: number[] = []
    if (denom > 2) {
      // Numérateurs "classiques" entre 1 et denom-1
      for (let k = 1; k < denom; k++) {
        if (k !== correct) candidats.push(k)
      }
    } else {
      // Cas limites (denom = 1 ou 2) : valeurs autour de la réponse
      candidats = [
        correct + 1,
        Math.max(1, correct - 1),
        correct + 2,
        correct + 3,
      ]
    }

    // Déduplication et positifs
    candidats = Array.from(new Set(candidats)).filter((n) => n > 0)

    // 2) S'assurer d'avoir au moins 2 options
    while (candidats.length < 2) {
      const extra = correct + randint(1, 5)
      if (!candidats.includes(extra) && extra !== correct) candidats.push(extra)
    }

    // 3) Tirer deux candidats distincts sans boucle infinie
    const takeOne = () => {
      const i = randint(0, candidats.length - 1)
      return candidats.splice(i, 1)[0] // retire du pool pour garantir la distinction
    }
    const n1 = takeOne()

    // 4) Construire les deux distracteurs
    const distracteur1 = new FractionEtendue(n1, denom)
    this.reponses = [
      `$${Reponse.texFractionSimplifiee} $`,
      `$${distracteur1.texFractionSimplifiee}$ `,
      `$${pC1.texFractionSimplifiee} $`,
      `$${pAC.texFractionSimplifiee} $`,
    ]
  }

  constructor() {
    super()
    // Saisie libre (version QCM désactivée) : la dernière phrase devient une question
    this.enonceCourt = () =>
      this.enonce.replace(/\$([^$]+)\$ est égal à :\s*$/, (_, p: string) =>
        this.interactif ? `$${p}=$` : `Calculer $${p}$.`,
      )

    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { fractionEgale: true })

    this.versionAleatoire()
  }
}
