import { sp } from '../../lib/outils/outilString'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const dateDeModifImportante = '08/11/2026'

export const uuid = 'a24fc'
export const refs = {
  'fr-fr': ['TSP1-10', 'TCP1-10'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Calculer une probabilité avec une probabilité conditionnelle (QCM Bac)'
export const dateDePublication = '11/03/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcmA avec une version originale et une version aléatoire
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class metropoleSept2024Ex4Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    pA: FractionEtendue,
    pGa: FractionEtendue,
    pGb: FractionEtendue,
  ): void {
    const pB = new FractionEtendue(1, 1).differenceFraction(pA)
    const pAg = pA.produitFraction(pGa)
    const pBg = pB.produitFraction(pGb)
    const pG = pAg.sommeFraction(pBg)
    this.reponses = [
      pAg,
      pGa,
      pA.produitFraction(new FractionEtendue(1, 1).differenceFraction(pGa)),
      pA.produitFraction(pG),
    ].map((p) => `$${p.texFractionSimplifiee}$`)
    this.enonce = this.sup3
      ? `Un jeu vidéo possède une vaste communauté de joueurs en ligne.<br> Avant de débuter une partie, le joueur doit choisir entre deux «${sp()}mondes${sp()}» : soit le monde A, soit le monde B.
<br>On choisit au hasard un individu dans la communauté des joueurs.<br>
Lorsqu'il joue une partie, on admet que :<br>
$\\bullet~~$ la probabilité que le joueur choisisse le monde A est égale à $${pA.texFractionSimplifiee}$ ;<br>
$\\bullet~~$ si le joueur choisit le monde A, la probabilité qu'il gagne la partie est de $${pGa.texFractionSimplifiee}$ ;<br>
$\\bullet~~$ la probabilité que le joueur gagne la partie est de $${pG.texFractionSimplifiee}$.<br>
On considère les évènements suivants : <br>
$\\bullet~~$ $A$ : «${sp()}Le joueur choisit le monde A${sp()}» ; <br>
$\\bullet~~$ $B$ : «${sp()}Le joueur choisit le monde B${sp()}» ;<br>
$\\bullet~~$ $G$ : «${sp()}Le joueur gagne la partie${sp()}» .<br><br>`
      : ''
    this.enonce +=
      'Calculer la probabilité que le joueur choisisse le monde A et gagne la partie.'
    this.correction =
      'On utilise la formule des probabilités conditionnelles :<br>'
    this.correction += `$P(A \\cap G) = P(A) \\times P_A(G) = ${pA.texFractionSimplifiee} \\times ${pGa.texFractionSimplifiee} = ${miseEnEvidence(pAg.texFractionSimplifiee)}.$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      new FractionEtendue(2, 5),
      new FractionEtendue(7, 10),
      new FractionEtendue(1, 3),
    )
  }

  versionAleatoire: () => void = () => {
    do {
      this.appliquerLesValeurs(
        new FractionEtendue(randint(1, 2), 5),
        new FractionEtendue(randint(3, 9), 10),
        new FractionEtendue(randint(1, 7), 10),
      )
    } while (nombreElementsDifferents(this.reponses) < 4)
  }

  constructor() {
    super()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
    this.versionOriginale()
  }
}
