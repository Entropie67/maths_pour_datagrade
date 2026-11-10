import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'
import type {
  CelluleSigne,
  LigneSigne,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'

export const uuid = '12a46'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer un tableau de signes d'un produit de facteurs"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4ANs2026 extends ExerciceQcmACourt {
  private sensProduit = 1
  private racines: [number, number] = [0, 0]

  private appliquerLesValeurs(
    signe1: number,
    racine1: number,
    signe2: number,
    racine2: number,
  ): void {
    this.sensProduit = signe1 * signe2
    this.racines = [Math.min(racine1, racine2), Math.max(racine1, racine2)]
    // Affichage d'un facteur, coefficient ±1 devant x (racine = zéro du facteur) :
    //  - signe +1 : « x + ... »   (via reduireAxPlusB)
    //  - signe -1 : « c - x »      (racine positive, ex. « 2-x »)
    const facteurTex = (signe: number, racine: number) =>
      signe > 0 ? reduireAxPlusB(1, -racine) : `${texNombre(racine)}-x`

    // Fonction associée à un facteur : signe·(x - racine)
    const facteur =
      (signe: number, racine: number) => (x: number | FractionEtendue) =>
        signe * (Number(x) - racine)

    // Fonction étudiée et distracteurs (rendus en tableaux de signes)
    const f = (x: number | FractionEtendue) =>
      facteur(signe1, racine1)(x) * facteur(signe2, racine2)(x)
    const fInverse = (x: number | FractionEtendue) =>
      -1 * facteur(signe1, racine1)(x) * facteur(signe2, racine2)(x) // signes inversés
    const fUneRacine = (x: number | FractionEtendue) =>
      facteur(signe1, racine1)(x) // un seul facteur (oubli de l'autre)
    const fRacinesOpposees = (x: number | FractionEtendue) =>
      facteur(signe1, -racine1)(x) * facteur(signe2, -racine2)(x) // racines de signe contraire

    // Racines ordonnées
    const rMin = Math.min(racine1, racine2)
    const rMax = Math.max(racine1, racine2)

    // Lignes du tableau de signes (correction)
    const ligneSigne = (signe: number, racineEstRMin: boolean) => {
      const avant = signe > 0 ? '-' : '+'
      const apres = signe > 0 ? '+' : '-'
      return racineEstRMin
        ? ['Line', 30, '', 0, avant, 20, 'z', 20, apres, 20, 't', 5, apres, 20]
        : ['Line', 30, '', 0, avant, 20, 't', 5, avant, 20, 'z', 20, apres, 20]
    }
    const ligne1 = ligneSigne(signe1, racine1 === rMin)
    const ligne2 = ligneSigne(signe2, racine2 === rMin)

    // Ligne du produit : zéros aux deux racines, signes évalués sur chaque intervalle
    const signeChar = (v: number) => (v > 0 ? '+' : '-')
    const sigI1 = signeChar(f(rMin - 1))
    const sigI2 = signeChar(f((rMin + rMax) / 2))
    const sigI3 = signeChar(f(rMax + 1))
    const ligneProduit = [
      'Line',
      30,
      '',
      0,
      sigI1,
      20,
      'z',
      20,
      sigI2,
      20,
      'z',
      20,
      sigI3,
      20,
    ]

    this.enonce = `On considère la fonction $A$ définie pour tout réel $x$ par : 
$A(x)=(${facteurTex(signe1, racine1)})(${facteurTex(signe2, racine2)})$.<br>
Le tableau de signes de $A(x)$ sur $\\mathbb{R}$ est :`

    this.reponses = [
      `${tableauSignesFonction(f, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fInverse, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fUneRacine, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fRacinesOpposees, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
    ]

    this.correction =
      `L'équation $${facteurTex(signe1, racine1)}=0$ a pour solution $x=${texNombre(
        racine1,
      )}$.<br>
L'équation $${facteurTex(signe2, racine2)}=0$ a pour solution $x=${texNombre(
        racine2,
      )}$.<br>
Le tableau de signes du produit $(${facteurTex(signe1, racine1)})(${facteurTex(
        signe2,
        racine2,
      )})$ est : <br>` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            [`$${facteurTex(signe1, racine1)}$`, 2, 50],
            [`$${facteurTex(signe2, racine2)}$`, 2, 50],
            [
              `$(${facteurTex(signe1, racine1)})(${facteurTex(
                signe2,
                racine2,
              )})$`,
              2,
              100,
            ],
          ],
          [
            '$-\\infty$',
            30,
            `$${texNombre(rMin)}$`,
            20,
            `$${texNombre(rMax)}$`,
            20,
            '$+\\infty$',
            30,
          ],
        ],
        tabLines: [ligne1, ligne2, ligneProduit],
        espcl: 3,
        deltacl: 1,
        lgt: 8,
      })
  }

  versionOriginale: () => void = () => {
    // f(x) = (x+5)(x+8) : racines -5 et -8, coefficients +1
    this.appliquerLesValeurs(1, -5, 1, -8)
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const signe1 = choice([1, -1])
    const signe2 = choice([1, -1])
    // Pour un facteur de coeff -1, on impose une racine positive => écriture « c-x » propre.
    const racinesToutes = [
      -9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9,
    ]
    const racinesPositives = [2, 3, 4, 5, 6, 7, 8, 9]
    const racine1 = choice(signe1 > 0 ? racinesToutes : racinesPositives)
    // racine2 ≠ racine1 ET ≠ -racine1 : garantit 4 tableaux distincts sans boucle de rejet.
    const racine2 = choice(
      (signe2 > 0 ? racinesToutes : racinesPositives).filter(
        (r) => r !== racine1 && r !== -racine1,
      ),
    )
    this.appliquerLesValeurs(signe1, racine1, signe2, racine2)
  }

  /** Tableau de signes de A(x) à compléter : les racines et les signes. */
  configTableauSignes(): TableauSVConfig {
    const [rMin, rMax] = this.racines
    const exterieur = this.sensProduit > 0 ? '+' : '-'
    const interieur = this.sensProduit > 0 ? '-' : '+'
    const ligne = (signes: CelluleSigne['symbole'][]): LigneSigne => ({
      type: 'signe',
      label: 'A(x)',
      cellules: [
        { symbole: '' },
        ...signes.flatMap((signe, k): CelluleSigne[] => [
          ...(k > 0 ? [{ symbole: '|0' } as CelluleSigne] : []),
          { symbole: '', editable: true, expected: signe },
        ]),
        { symbole: '' },
      ],
    })
    return {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '', editable: true, expected: texNombre(rMin, 2) },
        { valeur: '', editable: true, expected: texNombre(rMax, 2) },
        { valeur: '+\\infty' },
      ],
      lignes: [ligne([exterieur, interieur, exterieur])],
    }
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else {
      genereTableauxDeSignes(this)
      // La réponse est un tableau de signes : la correction complète est conservée.
      for (let i = 0; i < this.listeQuestions.length; i++) {
        this.listeReponsesCourtes[i] = null
      }
    }
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le tableau de signes de \$A\(x\)\$ sur \$\\mathbb\{R\}\$ est :\s*$/,
        'Déterminer le tableau de signes de $A(x)$ sur $\\mathbb{R}$.',
      )
    this.options.vertical = true
  }
}
