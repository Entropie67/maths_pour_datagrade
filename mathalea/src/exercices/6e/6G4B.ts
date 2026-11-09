import { miseEnEvidence } from '../../lib/outils/embellissements'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPoint } from '../../lib/2d/textes'
import { homothetie, rotation, similitude } from '../../lib/2d/transformations'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = "Estimer un angle sans rapporteur sur l'énoncé"

/**
 * Estimer un angle
 * @author Jean-claude Lhote
 */
export const uuid = 'c7f7a'

export const refs = {
  'fr-fr': ['6G4B'],
  'fr-2016': ['6G23-1'],
  'fr-ch': ['9R1ES1C-7', '9R2ES1C-7', '9R3ES1C-7', 'PRQES01B-9', 'PRQMG05A-3'],
}
export default class MesurerUnAngle extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Précision de l'angle",
      4,
      '1 : Angle à 10°\n2 : Angle à 5°\n3 : Angle à 1°\n 4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Utilisation du rapporteur', false]
    this.nbQuestions = 2

    this.sup = 1
    this.sup2 = false
    this.video = 'TEzu9uky56M'
  }

  nouvelleVersion() {
    let delta, arrondiA10Pres
    let angle: number
    let anglerot
    let Apos
    let Bpos
    let Cpos
    let p
    let texte
    let texteCorr
    let A
    let B
    let C
    let s2
    let s1
    let bis
    const signes = []
    let xMin, xMax, yMin, yMax, objetsEnonce, secteur0
    let typeDeQuestions
    if (this.sup < 4) typeDeQuestions = [this.sup]
    else typeDeQuestions = [1, 2, 3]
    const listeTypeDeQuestion = combinaisonListes(
      typeDeQuestions,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on évite d'avoir deux propositions différentes de 2° (comme 69° et 71°)
      do {
        signes.push(choice([-1, 1]))
        switch (listeTypeDeQuestion[i]) {
          case 1:
            angle = randint(1, 17, 9) * 10
            break
          case 2:
            angle = randint(1, 8) * 10 + randint(0, 1) * 90 + 5
            break
          case 3:
          default:
            angle = randint(1, 16) * 10 + randint(1, 9)
            break
        }
        arrondiA10Pres = Math.round(angle / 10) * 10
        delta = Math.round(Math.abs(angle / 10 - Math.round(angle / 10)) * 10)
      } while (delta === 1)

      anglerot = randint(-4, 4, 0) * 5
      angle = signes[i] * angle
      p = [
        choice(['x', 'y', 'z', 't']),
        lettreDepuisChiffre(randint(1, 16)),
        choice(['s', 'u', 'v', 'w']),
      ]
      if (!this.sup2) {
        texte = `Estimer la mesure de l'angle $\\widehat{${p[0] + p[1] + p[2]}}$ sans instrument.<br>`
      } else {
        texte = `Mesurer l'angle $\\widehat{${p[0] + p[1] + p[2]}}$.<br>`
      }
      A = pointAbstrait(0, 0)
      B = pointAbstrait(6, 0)
      B = rotation(B, A, anglerot)

      Bpos = texteParPoint(
        p[0],
        similitude(A, homothetie(B, A, 0.95), signes[i] * 90, 0.1),
        0,
        'black',
        1.5,
        'milieu',
        true,
      )
      s1 = demiDroite(A, B)
      C = rotation(B, A, angle)
      bis = rotation(B, A, angle / 2)
      Apos = texteParPoint(
        p[1],
        pointSurSegment(A, bis, -0.5),
        0,
        'black',
        1.5,
        'milieu',
        true,
      )
      Cpos = texteParPoint(
        p[2],
        similitude(A, homothetie(C, A, 0.95), -signes[i] * 90, 0.1),
        0,
        'black',
        1.5,
        'milieu',
        true,
      )
      s2 = demiDroite(A, C)
      // labels = labelPoint(A, B, C)
      secteur0 = afficheMesureAngle(B, A, C, 'black', 1.5, ' ')
      texteCorr = ''
      xMin = Math.min(A.x, C.x, B.x) - 1
      xMax = Math.max(A.x, C.x, B.x) + 1
      yMin = Math.min(A.y, C.y, B.y) - 1
      yMax = Math.max(A.y, C.y, B.y) + 1
      context.fenetreMathalea2d = [xMin, yMin, xMax, yMax]
      objetsEnonce = [s1, s2, Apos, Bpos, Cpos, secteur0]
      texte += mathalea2d(
        {
          xmin: xMin,
          ymin: yMin,
          xmax: xMax,
          ymax: yMax,
          pixelsParCm: 20,
          scale: 0.7,
        },
        objetsEnonce,
      )
      texteCorr += this.sup2
        ? `$${miseEnEvidence(Math.abs(angle))}^\\circ$`
        : `$${miseEnEvidence(`${Math.abs(angle)}^\\circ`)}$`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      if (!this.sup2) {
        this.autoCorrection[i].propositions = [
          {
            texte: `$${Math.abs(angle)}^\\circ$`,
            statut: true,
          },
          {
            texte: `$${(Math.abs(angle) + 45) % 180}^\\circ$`,
            statut: false,
          },
          {
            texte: `$${(Math.abs(angle) + 90) % 180}^\\circ$`,
            statut: false,
          },
          {
            texte: `$${(Math.abs(angle) + 135) % 180}^\\circ$`,
            statut: false,
          },
          {
            texte: '$180^\\circ$',
            statut: false,
          },
          {
            texte: '$90^\\circ$',
            statut: false,
          },
        ]
      } else {
        this.autoCorrection[i].propositions = [
          {
            texte: `$${Math.abs(angle)}^\\circ$`,
            statut: true,
          },
          {
            texte: `$${180 - Math.abs(angle)}^\\circ$`,
            statut: false,
          },
          {
            texte: `$${Math.round(Math.abs(angle) / 2)}^\\circ$`,
            statut: false,
          },
          {
            texte: `$${this.interactif ? Math.abs(angle) + 20 : arrondiA10Pres > angle ? arrondiA10Pres + delta : arrondiA10Pres - delta}^\\circ$`,
            statut: false,
          },
          {
            texte: '$180^\\circ$',
            statut: false,
          },
          {
            texte: '$90^\\circ$',
            statut: false,
          },
        ]
      }
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 6,
      }
      const props = propositionsQcm(this, i)
      if (!context.isAmc) {
        texte += props.texte
      }
      if (this.questionJamaisPosee(i, angle)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
