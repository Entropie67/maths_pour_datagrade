import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  all,
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'f85d9'
export const refs = {
  'fr-fr': ['1A-G03-1', '2A-G5-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Calculer le sinus, le cosinus et la tangente d'un angle (avec figure)"
export const dateDePublication = '18/06/2026'

/**
 * Version QCM de 3G3QCM-1, en question ouverte par défaut (QCM en option).
 * @author Stéphane Guyon
 * Date 18/06/2026
 */
export default class TrigonometrieTriangleRectangleQCM extends ExerciceQcmACourt {
  clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  // Nombre ou fraction (même non simplifiée) : pas de calcul à finir.
  // Une fraction juste mais non simplifiée est acceptée, avec une remarque.
  compareReponseCourte = (saisie: string, reponse: string) => {
    const resultat = all([
      isEqual(),
      isReduced({ allowReducibleFractions: true }),
    ])(saisie, reponse)
    if (
      resultat.isOk &&
      !onlyIrreducibleFractions().run(saisie, reponse).passed
    )
      return {
        ...resultat,
        feedback: `Bonne réponse. Elle pouvait être simplifiée : $${reponse}$.`,
      }
    return resultat
  }
  // Bonne réponse du tirage en cours, attendue dans le champ « sin(α) = … »
  private reponseAttendue = ''
  reponseCourte = () => this.reponseAttendue

  private fractionSimplifiee(
    numerateur: number,
    denominateur: number,
  ): [number, number] {
    const diviseur = pgcd(numerateur, denominateur)
    return [numerateur / diviseur, denominateur / diviseur]
  }

  private fractionTex(numerateur: number, denominateur: number) {
    const [numerateurSimplifie, denominateurSimplifie] =
      this.fractionSimplifiee(numerateur, denominateur)
    return `\\dfrac{${numerateurSimplifie}}{${denominateurSimplifie}}`
  }

  private appliquerLesValeurs(
    adjacent: number,
    oppose: number,
    hypotenuse: number,
    fonction: string,
  ): void {
    const [numerateurBonneReponse, denominateurBonneReponse] =
      fonction === 'cos'
        ? [adjacent, hypotenuse]
        : fonction === 'sin'
          ? [oppose, hypotenuse]
          : [oppose, adjacent]
    const bonneReponse = this.fractionTex(
      numerateurBonneReponse,
      denominateurBonneReponse,
    )
    const propositions = [
      [numerateurBonneReponse, denominateurBonneReponse],
      fonction === 'cos'
        ? [oppose, adjacent]
        : fonction === 'sin'
          ? [adjacent, hypotenuse]
          : [oppose, hypotenuse],
      fonction === 'cos'
        ? [oppose, hypotenuse]
        : fonction === 'sin'
          ? [oppose, adjacent]
          : [adjacent, hypotenuse],
      fonction === 'cos'
        ? [hypotenuse, adjacent]
        : fonction === 'sin'
          ? [hypotenuse, oppose]
          : [adjacent, oppose],
    ]

    this.reponseAttendue = bonneReponse
    this.texteAvantReponseCourte = `$\\${fonction}(\\alpha)=$`
    this.reponses = propositions.map(
      ([numerateur, denominateur]) =>
        `$${this.fractionTex(numerateur, denominateur)}$`,
    )

    this.enonce = `Dans le triangle $ABC$ rectangle en $A$ ci-dessous, qui n'est pas en vraie grandeur, quelle est la valeur de $\\${fonction} (\\alpha)$ ?`
    const triangle = polygone([
      pointAbstrait(0, 0, 'A', 'below left'),
      pointAbstrait(0, 3, 'C', 'above left'),
      pointAbstrait(4, 0, 'B', 'below right'),
    ])
    const angleDroit = codageAngleDroit(
      triangle.listePoints[1],
      triangle.listePoints[0],
      triangle.listePoints[2],
    )
    const labels = labelPoint(...triangle.listePoints)
    const angleAlpha = codageAngle(
      triangle.listePoints[0],
      triangle.listePoints[2],
      triangle.listePoints[1],
      1.5,
      '',
      'black',
      1,
      1,
      'none',
      0,
      false,
      false,
      '$\\alpha$',
    )
    const hypo = latex2d(`${hypotenuse}`, 2.7, 1.7, {})
    const coteAdjacent = latex2d(`${adjacent}`, 1.7, -0.8, {})
    const coteOppose = latex2d(`${oppose}`, -1, 1.5, {})
    const objets = [
      triangle,
      labels,
      angleDroit,
      angleAlpha,
      hypo,
      coteAdjacent,
      coteOppose,
    ]
    this.enonce += mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 1 },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.15,
          rymax: 0.45,
        }),
      ),
      objets,
    )
    this.correction = `Le triangle $ABC$ est rectangle en $A$ donc <br>`
    this.correction +=
      fonction === 'cos'
        ? `$\\cos(\\alpha)=\\dfrac{AB}{BC}=\\dfrac{${adjacent}}{${hypotenuse}}=${miseEnEvidence(bonneReponse)}$.`
        : fonction === 'sin'
          ? `$\\sin(\\alpha)=\\dfrac{AC}{BC}=\\dfrac{${oppose}}{${hypotenuse}}=${miseEnEvidence(bonneReponse)}$.`
          : `$\\tan(\\alpha)=\\dfrac{AC}{AB}=\\dfrac{${oppose}}{${adjacent}}=${miseEnEvidence(bonneReponse)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 3, 5, 'cos')
  }

  versionAleatoire: () => void = () => {
    const nombreReponses = 4
    do {
      const k = randint(2, 10)
      const fonction = choice(['cos', 'sin', 'tan'])
      const [adjacent, oppose, hypotenuse] = [4, 3, 5].map(
        (longueur) => longueur * k,
      )
      this.appliquerLesValeurs(adjacent, oppose, hypotenuse, fonction)
    } while (nombreElementsDifferents(this.reponses) < nombreReponses)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
