import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  canvasEnonceCorrection,
  empilementCubes,
} from '../../lib/3d/3d_dynamique/empilementsCube'
import {
  createCubesProjections,
  projectionCubesIso2d,
} from '../../lib/3d/3dProjectionMathalea2d/CubeIso'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const dateDePublication = '08/08/2025'
export const titre = 'Comparer les volumes de deux empilements de cubes'

/**
 * Comparer des volumes d'empilements de cubes
 * @author Jean-claude Lhote
 */

export const uuid = '5f117'

export const refs = {
  'fr-fr': ['6M3B', '5G2autoB-1'],
  'fr-2016': ['6G43-1'],
  'fr-ch': ['9R1GM3A-3', '9R2GM3A-3', '9R3GM3A-3', 'PRQMG02A-4'],
}

function trouvePave(volume: number): [number, number, number] {
  // Trouve un pavé dont le volume est proche de volume
  let divisors: number[] = []
  let volumeCible = 0
  let divisorsSurface: number[] = []
  let hauteur = 0
  let surface = 0
  do {
    // On choisit un volume aléatoire proche de volume
    volumeCible = randint(volume - 5, volume + 5, divisors)
    divisors = listeDesDiviseurs(volumeCible)
    divisors = divisors.filter((div) => div > 1 && div < volumeCible) // On enlève 1 et le volume lui-même
    if (divisors.length < 3) continue
    hauteur = choice(divisors)
    surface = volumeCible / hauteur
    divisorsSurface = listeDesDiviseurs(surface).filter(
      (div) => div > 1 && div < surface,
    ) // On enlève 1 et la surface elle-même
  } while (divisorsSurface.length < 2)
  const larg = choice(divisorsSurface)
  const long = surface / larg
  return [larg, long, hauteur]
}

export default class DenombrerCubes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = [
      "Taille de l'empilement",
      3,
      'De taille 3\nDe taille 4\nDe taille 5',
    ]
    this.besoinFormulaire3CaseACocher = ['3D dynamique', false]
    this.sup3 = false
    this.nbQuestions = 3 // Ici le nombre de questions
    this.sup2 = 1 // A décommenter : valeur par défaut d'un deuxième paramètre
    this.consigne = ''
    // c'est ici que commence le code de l'exercice cette fonction crée une copie de l'exercice
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      if (this.sup3 && context.isHtml) {
        this.consigne =
          `Un empilement de cubes et un pavé droit sont représentés ci-dessous.<br>Quel est celui qui a le plus petit volume (en nombre de cubes identiques)${sp()}?<br>Les petits cubes sont tous identiques. Le zoom peut changer d'un solide à l'autre.`
      } else {
        this.consigne =
          `Ci-dessous, un empilement de cubes est représenté sous deux angles différents et un pavé droit est représenté à côté.<br>Quel est celui qui a le plus petit volume (en nombre de cubes identiques)${sp()}?`
      }
    } else {
      if (this.sup3 && context.isHtml) {
        this.consigne =
          'Dans chacun des cas ci-dessous, un empilement de cubes et un pavé droit sont représentés.<br>Déterminer celui qui a le plus petit volume (en nombre de cubes identiques).'
      } else {
        this.consigne =
          'Dans chacun des cas ci-dessous, un empilement de cubes est représenté sous deux angles différents et un pavé droit est représenté à côté.<br>Déterminer celui qui a le plus petit volume (en nombre de cubes identiques).'
      }
    }
    const longueur = 2 + parseInt(this.sup2) // longueur de l'empilement
    const largeur = longueur // largeur de l'empilement
    const hauteur = Math.min(longueur, 4) // hauteur de l'empilement

    for (
      let q = 0, texte, texteCorr, cpt = 0;
      q < this.nbQuestions && cpt < 50;
    ) {
      const L1 = empilementCubes(longueur, largeur, hauteur) as [
        number,
        number,
        number,
      ][] // crée un empilement aléatoire
      const volume1 = L1.length
      const [larg, long, haut] = trouvePave(volume1)
      const L2: [number, number, number][] = []
      texte = ''
      texteCorr = ''
      for (let i = larg - 1; i > -1; i--) {
        for (let j = long - 1; j > -1; j--) {
          for (let k = 0; k < haut; k++) {
            L2.push([i, j, k])
          }
        }
      }

      if (this.sup3 && context.isHtml) {
        // 3d dynamique avec Canvas3DElement
        texte += '' // Nous utilisons souvent cette variable pour construire le texte de la question.
        const { canvasEnonce, canvasCorrection } = canvasEnonceCorrection(
          L1,
          `scene3dEx${this.numeroExercice}Q${q}-1`,
        )
        const {
          canvasEnonce: canvasEnonce2,
          canvasCorrection: canvasCorrection2,
        } = canvasEnonceCorrection(L2, `scene3dEx${this.numeroExercice}Q${q}-2`)
        texte += canvasEnonce
        texte += canvasEnonce2
        texteCorr += canvasCorrection
        texteCorr += canvasCorrection2
      } else {
        // 3d Iso avec Mathalea2d
        texte += ''
        const { figure, figureCorrection } = createCubesProjections(
          L1,
          largeur,
          longueur,
          hauteur,
        )
        const { objets: pave, params } = projectionCubesIso2d(
          L2,
          35,
          -20,
          false,
        )
        const { objets: objets2, params: params2 } = projectionCubesIso2d(
          L2,
          35,
          -20,
          true,
        )
        params.xmin -= 2
        params2.xmin -= 2
        texte += figure + mathalea2d(params, pave)
        texteCorr += figureCorrection + mathalea2d(params2, objets2)
      }

      texte += ''
      if (context.isHtml && this.sup3) {
        texte += ''
      }
      texteCorr += `<br>Le premier solide est un empilement de $${volume1}$ cubes.<br>`
      texteCorr += `Le deuxième solide est un pavé droit de dimensions $${larg} \\times ${long} \\times ${haut}$, son volume est de $${larg * long * haut}$.<br>`
      texteCorr += `Celui qui a le plus petit volume est donc ${texteEnCouleurEtGras(volume1 < larg * long * haut ? "l'empilement de cubes" : volume1 > larg * long * haut ? 'le pavé droit' : `aucun des deux${sp()}: ils ont le même volume`)}.<br>`

      this.autoCorrection[q] = {
        enonce: '',
        propositions: [
          {
            texte: "L'empilement de cubes",
            statut: volume1 < larg * long * haut,
          },
          { texte: 'Le pavé droit', statut: volume1 > larg * long * haut },
          {
            texte: 'Ils ont le même volume',
            statut: volume1 === larg * long * haut,
          },
        ],
        options: {
          ordered: true,
        },
      }
      const monQcm = propositionsQcm(this, q)
      if (
        this.questionJamaisPosee(q, JSON.stringify(L1) + JSON.stringify(L2))
      ) {
        this.listeQuestions[q] = texte += this.interactif ? monQcm.texte : ''
        this.listeCorrections[q] = texteCorr
        q++
      }

      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
