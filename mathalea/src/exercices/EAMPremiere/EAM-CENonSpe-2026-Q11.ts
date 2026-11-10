import Decimal from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'bbdca'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Trouver une probabilité conditionnelle dans un arbre'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ11CEns2026 extends ExerciceQcmACourt {
  appliquerLesValeurs = (
    numA: number,
    numB_A: number,
    numB_NotA: number,
    xEstBarre: boolean,
    yEstBarre: boolean,
  ) => {
    const rationnel = false

    // Probabilités de l'arbre, en Decimal (calcul exact)
    const pA = new Decimal(numA).div(10)
    const pNotA = new Decimal(10 - numA).div(10)
    const pB_A = new Decimal(numB_A).div(10)
    const pNotB_A = new Decimal(10 - numB_A).div(10)
    const pB_NotA = new Decimal(numB_NotA).div(10)
    const pNotB_NotA = new Decimal(10 - numB_NotA).div(10)

    // Construction de l'arbre. Branches CACHÉES (visible:false) : P(A), P_A(barB), P_barA(B).
    // Branches AFFICHÉES : P(barA), P_A(B), P_barA(barB).
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
          proba: pA.toNumber(),
          visible: false,
          enfants: [
            new Arbre({ rationnel, nom: 'B', proba: pB_A.toNumber() }),
            new Arbre({
              rationnel,
              nom: '\\overline{B}',
              proba: pNotB_A.toNumber(),
              visible: false,
            }),
          ],
        }),
        new Arbre({
          rationnel,
          nom: '\\overline{A}',
          proba: pNotA.toNumber(),
          enfants: [
            new Arbre({
              rationnel,
              nom: 'B',
              proba: pB_NotA.toNumber(),
              visible: false,
            }),
            new Arbre({
              rationnel,
              nom: '\\overline{B}',
              proba: pNotB_NotA.toNumber(),
            }),
          ],
        }),
      ],
    })

    omega.setTailles()
    const objets = omega.represente(0, 6, 0, 3, true, 1, 8)

    // Branche demandée P_X(Y)
    const texX = xEstBarre ? '\\overline{A}' : 'A'
    const texY = yEstBarre ? '\\overline{B}' : 'B'
    const pX = xEstBarre ? pNotA : pA
    const pB_X = xEstBarre ? pB_NotA : pB_A
    const pNotB_X = xEstBarre ? pNotB_NotA : pNotB_A
    const pY_X = yEstBarre ? pNotB_X : pB_X // la branche demandée (réponse)
    const pYbar_X = yEstBarre ? pB_X : pNotB_X // la sous-branche voisine

    // Réponse exacte
    const resAns = pY_X

    this.enonce =
      "Soient $A$ et $B$ deux événements.<br>On donne l'arbre de probabilités ci-dessous :<br>"
    this.enonce += mathalea2d(
      Object.assign(
        { display: 'inline', scale: 0.5 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.enonce += `<br>On peut alors affirmer que $P_{${texX}}(${texY})$ est égale à :`

    // La proba demandée est affichée ssi xEstBarre === yEstBarre (branches P_A(B) et P_barA(barB))
    const estAffichee = xEstBarre === yEstBarre
    if (estAffichee) {
      this.correction = `La probabilité conditionnelle $P_{${texX}}(${texY})$ se lit directement sur la branche allant de $${texX}$ à $${texY}$ :<br>
$P_{${texX}}(${texY}) = ${miseEnEvidence(texNombre(resAns))}$`
    } else {
      // Branche cachée : on calcule par complément, la branche voisine étant affichée
      const texYbar = yEstBarre ? 'B' : '\\overline{B}'
      this.correction = `
Les deux branches issues de $${texX}$ ont des probabilités dont la somme vaut $1$, donc :<br>
$\\begin{aligned}
P_{${texX}}(${texY}) &= 1 - P_{${texX}}(${texYbar})\\\\
&= 1 - ${texNombre(pYbar_X)}\\\\
&= ${miseEnEvidence(texNombre(resAns))}
\\end{aligned}$`
    }

    // Distracteurs fondés sur les erreurs classiques :
    const d1 = pX // confond avec la probabilité de la première branche P(X)
    const d2 = pX.mul(pY_X) // confond la conditionnelle avec l'intersection P(X) × P_X(Y)
    const d3 = pB_A // lit l'autre conditionnelle affichée : P_A(B)

    const distracteurs = [texNombre(d1), texNombre(d2), texNombre(d3)]
    const distracteursUniques = [...new Set(distracteurs)].filter(
      (d) => d !== texNombre(resAns),
    )

    // Filet de sécurité : garantir 3 distracteurs uniques
    while (distracteursUniques.length < 3) {
      const texVal = texNombre(new Decimal(randint(1, 9)).div(10))
      if (
        texVal !== texNombre(resAns) &&
        !distracteursUniques.includes(texVal)
      ) {
        distracteursUniques.push(texVal)
      }
    }

    // Le premier élément est la bonne réponse, l'aléatoire mélangera l'ordre à l'affichage
    this.reponses = [
      `$${texNombre(resAns)}$`,
      `$${distracteursUniques[0]}$`,
      `$${distracteursUniques[1]}$`,
      `$${distracteursUniques[2]}$`,
    ]
  }

  // Version du sujet : P_barA(barB) = 0,6 (xEstBarre = true, yEstBarre = true)
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 3, 4, true, true)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const cas = [
      { numA: 4, numB_A: 2, numB_NotA: 7 }, // contient le cas du sujet
      { numA: 3, numB_A: 4, numB_NotA: 6 },
      { numA: 5, numB_A: 3, numB_NotA: 8 },
      { numA: 4, numB_A: 6, numB_NotA: 3 },
      { numA: 2, numB_A: 6, numB_NotA: 4 },
      { numA: 6, numB_A: 2, numB_NotA: 7 },
      { numA: 7, numB_A: 3, numB_NotA: 6 },
      { numA: 3, numB_A: 7, numB_NotA: 4 },
    ]

    let compteur = 0
    do {
      const casChoisi = choice(cas)
      // Q11 : la probabilité demandée se LIT sur une branche affichée de l'arbre.
      const xEstBarre = choice([true, false])
      const yEstBarre = xEstBarre // branche affichée : P_A(B) ou P_barA(barB)
      this.appliquerLesValeurs(
        casChoisi.numA,
        casChoisi.numB_A,
        casChoisi.numB_NotA,
        xEstBarre,
        yEstBarre,
      )
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, this.reponses.length, true)
    )
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /On peut alors affirmer que \$(P_\{.*?\}\(.*?\))\$ est égale à :\s*$/,
        (_, proba: string) =>
          this.interactif ? `$${proba}=$` : `Calculer $${proba}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.spacingCorr = 2
    this.spacing = 2
  }
}
