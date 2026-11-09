import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { plot } from '../../lib/2d/Plot'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Lire une abscisse fractionnaire sur un axe gradué'

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

export const dateDePublication = '05/12/2025'

export const uuid = '4aa87'

export const refs = {
  'fr-fr': ['3AutoN15'],
  'fr-ch': ['9R1NO4B-5', '9R2NO4B-5', '9R3NO4B-5', 'PRQNO04B-7'],
}
/**
 * @author Jean-claude Lhote
 */
export default class LireAbscisseFractionnaire extends ExerciceQcmA {
  private appliquerLesValeurs(
    premiereAbscisse: number,
    deuxiemeAbscisse: number,
    divisionsUnite: number,
    numerateur: number,
    denominateur: number,
  ): void {
    const grid1 = grille(
      (premiereAbscisse - 0.5) * divisionsUnite,
      -1,
      (deuxiemeAbscisse + 1) * divisionsUnite,
      1,
      'gray',
      0.5,
      1 / divisionsUnite,
    )
    const grid2 = grille(
      (premiereAbscisse - 0.5) * divisionsUnite,
      -1,
      (deuxiemeAbscisse + 1) * divisionsUnite,
      1,
      'gray',
      0.8,
      1,
    )
    const line = segment(
      pointAbstrait((premiereAbscisse - 0.5) * divisionsUnite, 0),
      pointAbstrait((deuxiemeAbscisse + 1) * divisionsUnite, 0),
    )
    const premierPoint = plot(premiereAbscisse * divisionsUnite, 0, {
      rayon: 0.1,
      couleur: 'black',
      couleurDeRemplissage: 'black',
    })
    const deuxiemePoint = plot(deuxiemeAbscisse * divisionsUnite, 0, {
      rayon: 0.1,
      couleur: 'black',
      couleurDeRemplissage: 'black',
    })
    const abscisse1 = latex2d(
      premiereAbscisse.toString(),
      premiereAbscisse * divisionsUnite - 0.04,
      -0.4,
      { letterSize: 'normalsize' },
    )
    const abscisse2 = latex2d(
      deuxiemeAbscisse.toString(),
      deuxiemeAbscisse * divisionsUnite - 0.04,
      -0.4,
      { letterSize: 'normalsize' },
    )
    const pointE = plot((numerateur / denominateur) * divisionsUnite, 0, {
      rayon: 0.1,
      couleur: 'black',
      couleurDeRemplissage: 'black',
    })
    const labelE = latex2d(
      'E',
      (numerateur / denominateur) * divisionsUnite + 0.1,
      0.4,
      { letterSize: 'normalsize' },
    )
    const objets = [
      grid1,
      grid2,
      line,
      premierPoint,
      deuxiemePoint,
      pointE,
      abscisse1,
      abscisse2,
      labelE,
    ]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 40, scale: 0.5, display: 'block' } as const,
        fixeBordures(objets),
      ),
      objets,
    )

    this.reponses = [
      fraction(numerateur, denominateur).texFractionSimplifiee,
      fraction(numerateur - divisionsUnite / 2, denominateur)
        .texFractionSimplifiee,
      fraction(numerateur - 1, denominateur).texFractionSimplifiee,
      fraction(numerateur + divisionsUnite - 1, denominateur)
        .texFractionSimplifiee,
    ].map((el) => `$${el}$`)
    this.enonce =
      figure + `Sur cette droite graduée, quelle est l'abscisse du point $E$ ?`

    this.correction = `On remarque qu'il y a $${divisionsUnite * (deuxiemeAbscisse - premiereAbscisse)}$ divisions entre $${premiereAbscisse}$ et $${deuxiemeAbscisse}$, donc chaque division vaut $\\dfrac{1}{${divisionsUnite}}$.<br>`
    this.correction += `Le point $E$ est situé après $${numerateur}$ divisions à partir de l'origine.<br>`
    this.correction += `Donc l'abscisse de $E$ est égale à $${
      fraction(numerateur, denominateur).texFractionSimplifiee
    }$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(0, 1, 4, 7, 4)
  }

  versionAleatoire: () => void = () => {
    // Génération des valeurs
    const premiereAbscisse = randint(0, 1) // L'abscisse du premier point pour graduer l'axe
    const unite = randint(1, 2) // L'écart entre les deux points
    const deuxiemeAbscisse = premiereAbscisse + unite // L'abscisse du deuxième point pour graduer l'axe
    const facteurDivision = choice([1, 2]) // Pour avoir des fractions avec dénominateur 4 ou 8
    let cpt = 0 // Pour éviter boucle infinie
    let isInteger = false // Pour s'assurer d'avoir une fraction
    do {
      const divisionsUnite = 4
      const numerateur =
        randint(
          premiereAbscisse * divisionsUnite + 1,
          (deuxiemeAbscisse + 1) * divisionsUnite - 1,
          deuxiemeAbscisse * divisionsUnite,
        ) * facteurDivision
      const denominateur = divisionsUnite * facteurDivision
      isInteger = numerateur % denominateur === 0
      if (!isInteger) {
        this.appliquerLesValeurs(
          premiereAbscisse,
          deuxiemeAbscisse,
          divisionsUnite,
          numerateur,
          denominateur,
        )
      }

      cpt++
    } while (
      cpt < 50 &&
      isInteger &&
      nombreElementsDifferents(this.reponses) < 4
    )
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
