import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { all, isEqual, isReduced } from '../../lib/interactif/checks'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = 'Calculer une longueur avec la trigonométrie'
export const dateDePublication = '20/06/2026'
/**
 * Version QCM de 3G3QCM-1.
 */
export const dateDeModifImportante = '22/10/2026'

export const uuid = '831df'

export const refs = {
  'fr-fr': ['1A-G03-2', '2A-G5-2'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = true

type AngleRemarquable = 30 | 45 | 60
type FonctionTrigonometrie = 'sin' | 'cos' | 'tan'
type LongueurExacte = [coefficient: number, radical: 1 | 2 | 3]

/**
 * Calculer une longueur dans un triangle rectangle avec une valeur remarquable.
 * @author Stéphane Guyon
 */
export default class LongueurTrigonometrieQcm extends ExerciceQcmACourt {
  // Question ouverte par défaut (QCM en option) : la longueur s'écrit avant « cm »
  clavierReponseCourte = KeyboardType.lyceeClassique
  // Nombre ou fraction (même non simplifiée), racine possible : pas de calcul à finir
  compareReponseCourte = all([
    isEqual(),
    isReduced({ allowReducibleFractions: true }),
  ])
  texteApresReponseCourte = ' cm'

  private longueurTex([coefficient, radical]: LongueurExacte) {
    if (radical === 1) return `${coefficient}`
    return coefficient === 1
      ? `\\sqrt{${radical}}`
      : `${coefficient}\\sqrt{${radical}}`
  }

  private valeurTrigonometrieTex(
    angle: AngleRemarquable,
    fonction: FonctionTrigonometrie,
  ) {
    if (fonction === 'sin') {
      return angle === 30
        ? '\\dfrac{1}{2}'
        : angle === 45
          ? '\\dfrac{\\sqrt{2}}{2}'
          : '\\dfrac{\\sqrt{3}}{2}'
    }
    if (fonction === 'cos') {
      return angle === 30
        ? '\\dfrac{\\sqrt{3}}{2}'
        : angle === 45
          ? '\\dfrac{\\sqrt{2}}{2}'
          : '\\dfrac{1}{2}'
    }
    return angle === 30
      ? '\\dfrac{\\sqrt{3}}{3}'
      : angle === 45
        ? '1'
        : '\\sqrt{3}'
  }

  private longueurAvecRapportInverse(
    n: number,
    angle: AngleRemarquable,
    fonction: FonctionTrigonometrie,
  ): LongueurExacte {
    if (fonction === 'sin') {
      return angle === 30 ? [12 * n, 1] : angle === 45 ? [6 * n, 2] : [4 * n, 3]
    }
    if (fonction === 'cos') {
      return angle === 30 ? [4 * n, 3] : angle === 45 ? [6 * n, 2] : [12 * n, 1]
    }
    return angle === 30 ? [6 * n, 3] : angle === 45 ? [6 * n, 1] : [2 * n, 3]
  }

  private longueurCherchee(
    n: number,
    angle: AngleRemarquable,
    fonction: FonctionTrigonometrie,
  ): LongueurExacte {
    if (fonction === 'sin') {
      return angle === 30 ? [3 * n, 1] : angle === 45 ? [3 * n, 2] : [3 * n, 3]
    }
    if (fonction === 'cos') {
      return angle === 30 ? [3 * n, 3] : angle === 45 ? [3 * n, 2] : [3 * n, 1]
    }
    return angle === 30 ? [2 * n, 3] : angle === 45 ? [6 * n, 1] : [6 * n, 3]
  }

  private appliquerLesValeurs(
    n: number,
    angle: AngleRemarquable,
    fonction: FonctionTrigonometrie,
  ) {
    const longueurConnue = 6 * n
    const coteConnu = fonction === 'tan' ? 'AB' : 'BC'
    const coteCherche = fonction === 'cos' ? 'AB' : 'AC'
    const longueurCherchee = this.longueurCherchee(n, angle, fonction)
    const longueurChercheeTex = this.longueurTex(longueurCherchee)
    const valeurSinus = this.valeurTrigonometrieTex(angle, 'sin')
    const valeurCosinus = this.valeurTrigonometrieTex(angle, 'cos')
    const valeurTangente = this.valeurTrigonometrieTex(angle, 'tan')
    const valeurTrigonometrie = this.valeurTrigonometrieTex(angle, fonction)

    const A = pointAbstrait(0, 0, 'A', 'below left')
    const C = pointAbstrait(0, 3, 'C', 'above left')
    const B = pointAbstrait(4, 0, 'B', 'below right')
    const triangle = polygone([A, C, B])
    triangle.epaisseur = 2

    const angleDroit = codageAngleDroit(C, A, B)
    const angleConnu = codageAngle(
      A,
      B,
      C,
      1.5,
      '',
      'black',
      1,
      1,
      'none',
      0,
      false,
      false,
      `$${angle}^\\circ$`,
    )
    const positionLongueurConnue =
      coteConnu === 'BC'
        ? latex2d(`${longueurConnue}\\text{ cm}`, 2.8, 1.8, {})
        : latex2d(`${longueurConnue}\\text{ cm}`, 2, -0.7, {})
    const positionInconnue =
      coteCherche === 'AC'
        ? latex2d('?', -0.7, 1.5, {})
        : latex2d('?', 2, -0.7, {})
    const objets = [
      triangle,
      labelPoint(A, B, C),
      angleDroit,
      angleConnu,
      positionLongueurConnue,
      positionInconnue,
    ]

    this.enonce = `Dans le triangle $ABC$ rectangle en $A$ ci-dessous, qui n'est pas représenté à l'échelle, on donne $${coteConnu}=${longueurConnue}\\text{ cm}$ et $\\widehat{ABC}=${angle}^\\circ$.<br>
Quelle est la longueur $${coteCherche}$ ?<br>
<em>Aide :</em> $\\sin ${angle}^\\circ=${valeurSinus}$, $\\cos ${angle}^\\circ=${valeurCosinus}$ et $\\tan ${angle}^\\circ=${valeurTangente}$.<br>
${mathalea2d(
  Object.assign(
    { pixelsParCm: 25, scale: 0.9, center: !context.isHtml },
    fixeBordures(objets, {
      rxmin: -0.6,
      rxmax: 0.6,
      rymin: -0.15,
      rymax: 0.45,
    }),
  ),
  objets,
)}`

    const bonneReponse = `$${longueurChercheeTex}\\text{ cm}$`
    const reponseTex = (longueur: LongueurExacte) =>
      `$${this.longueurTex(longueur)}\\text{ cm}$`
    const distracteurs: string[] = []
    const ajouterSiDistinct = (longueur: LongueurExacte) => {
      const reponse = reponseTex(longueur)
      if (reponse !== bonneReponse && !distracteurs.includes(reponse)) {
        distracteurs.push(reponse)
      }
    }
    const autresFonctions = (['sin', 'cos', 'tan'] as const).filter(
      (autreFonction) => autreFonction !== fonction,
    )
    for (const autreFonction of autresFonctions) {
      const nombreDistracteurs = distracteurs.length
      ajouterSiDistinct(this.longueurCherchee(n, angle, autreFonction))
      if (distracteurs.length === nombreDistracteurs) {
        ajouterSiDistinct(
          this.longueurAvecRapportInverse(n, angle, autreFonction),
        )
      }
    }
    ajouterSiDistinct(this.longueurAvecRapportInverse(n, angle, fonction))

    // À 45°, certaines erreurs coïncident car sin(45°) = cos(45°) et tan(45°) = 1.
    const secours: LongueurExacte[] = [
      [12 * n, 1],
      [6 * n, 2],
      [4 * n, 3],
      [2 * n, 1],
    ]
    for (const longueur of secours) {
      if (distracteurs.length === 3) break
      ajouterSiDistinct(longueur)
    }
    this.texteAvantReponseCourte = `$${coteCherche}=$`
    this.reponses = [bonneReponse, ...distracteurs]

    const quotient =
      fonction === 'sin'
        ? '\\dfrac{AC}{BC}'
        : fonction === 'cos'
          ? '\\dfrac{AB}{BC}'
          : '\\dfrac{AC}{AB}'
    this.correction = `Le triangle $ABC$ est rectangle en $A$ donc <br>`
    this.correction += `$\\${fonction} ${angle}^\\circ=\\${fonction} (\\widehat{ABC})=${quotient}=${valeurTrigonometrie}$.<br>
On en déduit que $${coteCherche}=${coteConnu}\\times ${valeurTrigonometrie}=${longueurConnue}\\times ${valeurTrigonometrie}=${miseEnEvidence(`${longueurChercheeTex}${this.sup3 ? '\\text{ cm}' : ''}`)}${this.sup3 ? '' : '\\text{ cm}'}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(2, 30, 'sin')
  }

  versionAleatoire = () => {
    this.appliquerLesValeurs(
      randint(1, 4),
      choice<AngleRemarquable>([30, 45, 60]),
      choice<FonctionTrigonometrie>(['sin', 'cos', 'tan']),
    )
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
