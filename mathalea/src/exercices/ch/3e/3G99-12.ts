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
  "Déterminer une équation cartésienne d'un plan contenant une droite et un point"
export const dateDePublication = '19/05/2026'
export const interactifReady = true

export const uuid = '9b4e1'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G99-12'],
}

export default class EquationPlanDroitePointSystemeNormal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.lycee
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let pointA: Vector3
      let pointD: Vector3
      let direction: Vector3
      let vecteurAD: Vector3
      let normal: Vector3

      do {
        pointA = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
        pointD = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
        direction = [randint(-4, 4, 0), randint(-4, 4, 0), randint(-4, 4, 0)]
        vecteurAD = vectorBetween(pointA, pointD)
        normal = crossProduct(direction, vecteurAD)
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
        "Dans l'espace muni d'un repère orthonormé, on considère la droite $d$ passant par le point "
      texte += `$D${coordTex(pointD)}$ et de vecteur directeur $\\vec d=${columnTex(direction)}$. `
      texte += `Déterminer une équation cartésienne du plan $\\alpha$ contenant la droite $d$ et le point $A${coordTex(pointA)}$.`
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

      let texteCorr = `${vectorBetweenDetailsTex('AD', pointA, pointD)}.<br>`
      texteCorr += `Les vecteurs $\\overrightarrow{AD}$ et $\\vec d$ ne sont pas colinéaires : ils donnent donc deux directions du plan $\\alpha$.<br>`
      texteCorr += lampeMessage({
        titre: 'Méthode :',
        texte:
          'Un vecteur $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ normal au plan $\\alpha$ est orthogonal à deux vecteurs non colinéaires de ce plan. On impose donc $\\vec n\\cdot\\vec d=0$ et $\\vec n\\cdot\\overrightarrow{AD}=0$.',
      })
      texteCorr += `On pose $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ et on résout le système :<br>`
      texteCorr += `$\\begin{cases}
      ${expressionLineaireTex(direction, ['a', 'b', 'c'])}=0\\\\
      ${expressionLineaireTex(vecteurAD, ['a', 'b', 'c'])}=0
      \\end{cases}$<br>`
      texteCorr += resolutionSystemeLineaireHomogene2x3Tex({
        equations: [direction, vecteurAD],
        solution: normal,
      })
      texteCorr += `On peut donc choisir $\\vec n=${columnTex(normal)}$.<br>`
      texteCorr += `Le plan admet une équation de la forme $${expressionLineaireTex(normal, ['x', 'y', 'z'])}+d=0$.<br>`
      texteCorr += `Comme $A${coordTex(pointA)}$ appartient au plan, ses coordonnées vérifient cette équation :<br>`
      texteCorr += `$\\begin{aligned}
      ${nx}\\times ${ecritureParentheseSiNegatif(pointA[0])} ${ecritureAlgebrique(ny)}\\times ${ecritureParentheseSiNegatif(pointA[1])} ${ecritureAlgebrique(nz)}\\times ${ecritureParentheseSiNegatif(pointA[2])}+d&=0\\\\
      ${sommePoint}+d&=0\\\\
      d&=${d}.
      \\end{aligned}$<br>`
      texteCorr += `Ainsi, une équation cartésienne du plan $\\alpha$ est $${miseEnEvidence(resultat)}$.`

      if (this.questionJamaisPosee(i, ...pointA, ...pointD, ...direction)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
