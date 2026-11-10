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

export const uuid = '87c80'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer une probabilité à partir d'un arbre de probabilités"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1CEs2026 extends ExerciceQcmACourt {
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

    // Construction de l'arbre (toujours complet : A/barA puis B/barB)
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
          enfants: [
            new Arbre({ rationnel, nom: 'B', proba: pB_A.toNumber() }),
            new Arbre({ rationnel, nom: '\\overline{B}', proba: pNotB_A.toNumber() }),
          ],
        }),
        new Arbre({
          rationnel,
          nom: '\\overline{A}',
          proba: pNotA.toNumber(),
          enfants: [
            new Arbre({ rationnel, nom: 'B', proba: pB_NotA.toNumber() }),
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

    // Événement demandé X ∩ Y
    const texX = xEstBarre ? '\\overline{A}' : 'A'
    const texY = yEstBarre ? '\\overline{B}' : 'B'
    const pX = xEstBarre ? pNotA : pA
    const pB_X = xEstBarre ? pB_NotA : pB_A
    const pNotB_X = xEstBarre ? pNotB_NotA : pNotB_A
    const pY_X = yEstBarre ? pNotB_X : pB_X // P_X(Y) : la branche demandée
    const pYbar_X = yEstBarre ? pB_X : pNotB_X // l'autre sous-branche

    // Résultat exact : P(X) × P_X(Y)
    const resAns = pX.mul(pY_X)

    this.enonce =
      "Soient $A$ et $B$ deux événements.<br>On donne l'arbre de probabilités ci-dessous :<br>"
    this.enonce += mathalea2d(
      Object.assign(
        { display: 'inline', scale: 0.5 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.enonce += `<br>On peut alors affirmer que $P(${texX} \\cap ${texY})$ est égale à :`

    this.correction = `On a :<br>$\\begin{aligned}
        P(${texX} \\cap ${texY}) &= P(${texX}) \\times P_{${texX}}(${texY})\\\\
        &= ${texNombre(pX)} \\times ${texNombre(pY_X)} \\\\
        &= ${miseEnEvidence(texNombre(resAns))}
        \\end{aligned}$`

    // Distracteurs fondés sur les erreurs classiques :
    const d1 = pX.add(pY_X) // addition au lieu du produit : 0,6 + 0,7 = 1,3
    const d2 = pY_X // oubli de la première branche : 0,7
    const d3 = pX.mul(pYbar_X) // mauvaise sous-branche : 0,6 × 0,3 = 0,18

    const distracteurs = [texNombre(d1), texNombre(d2), texNombre(d3)]
    const distracteursUniques = [...new Set(distracteurs)].filter(
      (d) => d !== texNombre(resAns),
    )

    // Filet de sécurité : garantir 3 distracteurs uniques
    while (distracteursUniques.length < 3) {
      const texVal = texNombre(new Decimal(randint(1, 99)).div(100))
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

  // Version du sujet : P(barA ∩ B) avec P(A)=0,4 ; P_A(B)=0,2 ; P_barA(B)=0,7
  // -> 0,42 (correct) ; 1,3 ; 0,7 ; 0,18
  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 2, 7, true, false)
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
      const xEstBarre = choice([true, false])
      const yEstBarre = choice([true, false])
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
        /On peut alors affirmer que \$(P\([^$]*\))\$ est égale à :\s*$/,
        (_, proba: string) =>
          this.interactif ? `$${proba}=$` : `Calculer $${proba}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.spacingCorr = 2
    this.spacing = 2
  }
}
