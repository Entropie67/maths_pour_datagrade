import { lampeMessage } from '../../../lib/format/message'
import {
    all,
    isEquation,
    isEquivalentEquation,
} from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    ecritureAlgebrique,
    ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import {
    columnTex,
    coordTex,
    crossProduct,
    equationPlanTex,
    expressionLineaireTex,
    simplifieVector,
    type Vector3,
    vectorBetween,
    vectorBetweenDetailsTex,
} from '../../../lib/outils/geometrieVectorielle'
import { resolutionSystemeLineaireHomogene2x3Tex } from '../../../lib/outils/systemesLineaires'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer une équation cartésienne d'un plan en cherchant un vecteur normal"
export const dateDePublication = '19/05/2026'
export const interactifReady = true

export const uuid = '7c2e9'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G99-3b'],
}

export default class EquationPlanTroisPointsSystemeNormal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.lycee
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let pointA: Vector3
      let pointB: Vector3
      let pointC: Vector3
      let vecteurAB: Vector3
      let vecteurAC: Vector3
      let normal: Vector3

      do {
        pointA = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
        pointB = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
        pointC = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
        vecteurAB = vectorBetween(pointA, pointB)
        vecteurAC = vectorBetween(pointA, pointC)
        normal = crossProduct(vecteurAB, vecteurAC)
      } while (
        (normal[0] === 0 && normal[1] === 0 && normal[2] === 0) ||
        normal.some((coordinate) => coordinate === 0)
      )

      normal = simplifieVector(normal)
      const [nx, ny, nz] = normal
      const d = -(nx * pointA[0] + ny * pointA[1] + nz * pointA[2])
      const resultat = equationPlanTex(nx, ny, nz, d)
      const sommePoint = nx * pointA[0] + ny * pointA[1] + nz * pointA[2]

      let texte =
        'Dans un repère orthonormé de l’espace, déterminer une équation cartésienne du plan passant par les trois points suivants :<br>'
      texte += `$A${coordTex(pointA)}$, $B${coordTex(pointB)}$ et $C${coordTex(pointC)}$.<br>`
      texte +=
        'On déterminera un vecteur normal au plan en résolvant un système.'
      if (this.interactif) {
        texte += '<br>Équation cartésienne du plan : '
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.lycee)
      }

      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          compare: all([isEquation(), isEquivalentEquation()]),
        },
      })

      let texteCorr = `On calcule d’abord deux vecteurs du plan, par exemple $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.<br>`
      texteCorr += `${vectorBetweenDetailsTex('AB', pointA, pointB)} et ${vectorBetweenDetailsTex('AC', pointA, pointC)}.<br>`
      texteCorr += lampeMessage({
        titre: 'Méthode :',
        texte:
          "Un vecteur $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est normal au plan $(ABC)$ lorsqu'il est orthogonal à deux vecteurs non colinéaires de ce plan, par exemple $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.",
      })
      texteCorr += `On pose donc $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ et on résout le système :<br>`
      texteCorr += `$\\begin{cases}
      ${expressionLineaireTex(vecteurAB, ['a', 'b', 'c'])}=0\\\\
      ${expressionLineaireTex(vecteurAC, ['a', 'b', 'c'])}=0
      \\end{cases}$<br>`
      texteCorr += resolutionSystemeLineaireHomogene2x3Tex({
        equations: [vecteurAB, vecteurAC],
        solution: normal,
      })
      texteCorr += `Ainsi, les vecteurs normaux sont les vecteurs $k${columnTex(normal)}$, avec $k\\in\\mathbb{R}$, et on peut choisir $\\vec n=${columnTex(normal)}$.<br>`
      texteCorr += `Le plan admet donc une équation de la forme $${expressionLineaireTex(normal, ['x', 'y', 'z'])}+d=0$.<br>`
      texteCorr += `Comme $A${coordTex(pointA)}$ appartient au plan, ses coordonnées vérifient cette équation :<br>`
      texteCorr += `$\\begin{aligned}
      ${nx}\\times ${ecritureParentheseSiNegatif(pointA[0])} ${ecritureAlgebrique(ny)}\\times ${ecritureParentheseSiNegatif(pointA[1])} ${ecritureAlgebrique(nz)}\\times ${ecritureParentheseSiNegatif(pointA[2])}+d&=0\\\\
      ${sommePoint}+d&=0\\\\
      d&=${d}.
      \\end{aligned}$<br>`
      texteCorr += `Ainsi, une équation cartésienne du plan est $${miseEnEvidence(resultat)}$.`

      if (this.questionJamaisPosee(i, ...pointA, ...pointB, ...pointC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
