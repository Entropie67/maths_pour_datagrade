import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Polygone, nommePolygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { rotation } from '../../lib/2d/transformations'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Vocabulaire du triangle rectangle'
export const interactifReady = true

export const uuid = '08f6e'
export const refs = {
  'fr-fr': ['4G40-0'],
  'fr-ch': ['1mG2-1'],
}
export const dateDePublication = '23/08/2024'

/**
 * Donner le nom des côtés dans un triangle rectangle
 * @author Jean-claude Lhote
 */

export default class VocabulaireTriangleRectangle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacingCorr = 3
    this.besoinFormulaireCaseACocher = ['Figure à main levée', true]
    this.besoinFormulaire2Texte = [
      'Type de questions ',
      'Nombres séparés par des tirets :\n1 : Donner le bon terme\n2 : Donner le bon côté\n3 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ["Indiquer l'angle sur la figure", true]
    this.sup = false
    this.sup2 = '3'
    this.sup3 = true
  }

  nouvelleVersion() {
    const mainlevee = this.sup
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const ab = randint(200, 500) / 100
      const ac = randint(300, Math.ceil(ab * 100)) / 100
      const a = pointAbstrait(0, 0)
      const b = pointAbstrait(ab, 0)
      const c = pointAbstrait(0, ac)
      const p1 = new Polygone(a, b, c)
      // p1.isVisible = false
      const p2 = rotation(p1, a, randint(0, 360))
      const A = p2.listePoints[0]
      const B = p2.listePoints[1]
      const C = p2.listePoints[2]
      const codage = codageAngleDroit(B, A, C)
      const nom = creerNomDePolygone(3)

      A.nom = nom[0]
      B.nom = nom[1]
      C.nom = nom[2]
      const nomme = nommePolygone(p2, nom)
      const hypo = segment(C, B, bleuMathalea)
      hypo.epaisseur = 2
      const codageDeAngle = codageAngle(A, B, C, 1)
      const objetsEnonce: NestedObjetMathalea2dArray = []

      objetsEnonce.push(p2, nomme, codage)
      if (this.sup3) objetsEnonce.push(codageDeAngle)
      let goodAnswer: string
      let texte = `Le triangle $${nom}$ est rectangle en $${nom[0]}$. <br>${mathalea2d(Object.assign({ mainlevee, pixelsParCm: 30, scale: 1 }, fixeBordures(objetsEnonce)), objetsEnonce)}`
      let texteCorr: string
      const choix = choice([1, 2, 3])
      switch (choix) {
        case 1:
          texte +=
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[0]}${nom[1]}]$ est :`
              : `Le côté adjacent à $\\widehat{${nom}}$ est :`
          goodAnswer =
            listeTypeDeQuestions[i] === 1
              ? `le côté adjacent à $\\widehat{${nom}}$.`
              : `[${nom[0]}${nom[1]}]`
          texteCorr =
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[0]}${nom[1]}]$ est ${texteEnCouleurEtGras('le côté adjacent')} à $\\widehat{${nom}}$.`
              : `Le côté adjacent à $\\widehat{${nom}}$ est $${miseEnEvidence(`[${nom[0]}${nom[1]}]`)}$.`
          break
        case 2:
          texte +=
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[0]}${nom[2]}]$ est :`
              : `Le côté opposé à $\\widehat{${nom}}$ est :`
          goodAnswer =
            listeTypeDeQuestions[i] === 1
              ? `le côté opposé à $\\widehat{${nom}}$.`
              : `[${nom[0]}${nom[2]}]`
          texteCorr =
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[0]}${nom[2]}]$ est ${texteEnCouleurEtGras('le côté opposé')} à $\\widehat{${nom}}$.`
              : `Le côté opposé à $\\widehat{${nom}}$ est $${miseEnEvidence(`[${nom[0]}${nom[2]}]`)}$.`
          break
        default:
          texte +=
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[1]}${nom[2]}]$ est :`
              : `L'hypoténuse du triangle ${nom} est :`
          goodAnswer =
            listeTypeDeQuestions[i] === 1
              ? "l'hypoténuse du triangle."
              : `[${nom[1]}${nom[2]}]`
          texteCorr =
            listeTypeDeQuestions[i] === 1
              ? `Le côté $[${nom[1]}${nom[2]}]$ est ${texteEnCouleurEtGras("l'hypoténuse")} du triangle $${nom}$.`
              : `L'hypoténuse du triangle $${nom}$ est $${miseEnEvidence(`[${nom[1]}${nom[2]}]`)}$.`
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options =
        listeTypeDeQuestions[i] === 1
          ? { ordered: true, vertical: true }
          : { ordered: true }
      this.autoCorrection[i].propositions =
        listeTypeDeQuestions[i] === 1
          ? [
              {
                texte: `le côté adjacent à $\\widehat{${nom}}$.`,
                statut:
                  goodAnswer === `le côté adjacent à $\\widehat{${nom}}$.`,
              },
              {
                texte: `le côté opposé à $\\widehat{${nom}}$.`,
                statut: goodAnswer === `le côté opposé à $\\widehat{${nom}}$.`,
              },
              {
                texte: "l'hypoténuse du triangle.",
                statut: goodAnswer === "l'hypoténuse du triangle.",
              },
            ]
          : [
              {
                texte: `[${nom[0]}${nom[1]}]`,
                statut: goodAnswer === `[${nom[0]}${nom[1]}]`,
              },
              {
                texte: `[${nom[0]}${nom[2]}]`,
                statut: goodAnswer === `[${nom[0]}${nom[2]}]`,
              },
              {
                texte: `[${nom[1]}${nom[2]}]`,
                statut: goodAnswer === `[${nom[1]}${nom[2]}]`,
              },
            ]
      const monQcm = propositionsQcm(this, i)
      texte += `<br>${monQcm.texte}`
      if (this.questionJamaisPosee(i, ab, ac)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
