import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDeModifImportante = '10/11/2024'
export const titre =
  'Reconnaitre un quadrilatère particulier à partir de ses propriétés'

/**
 * Reconnaitre un quadrilatère particulier à partir de ses propriétés
 * @author Rémi Angot
 */
export const uuid = '4e52e'

export const refs = {
  'fr-fr': ['5G6D-2', '6AutoG2-1'],
  'fr-2016': ['6G33', '5G10-5'],
  'fr-ch': ['9R1ES2H-6', '9R2ES2H-6', '9R3ES2H-6', 'PRQES02B-2'],
}
export default class ReconnaitreQuadrilatereParticulier extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.nbColsCorr = 2 // Nombre de colonnes dans la correction pour la sortie LaTeX
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = context.isHtml
    this.sup = 4
    this.besoinFormulaireTexte = [
      'Type de quadrilatères',
      [
        'Nombres séparés par des tirets  :',
        '1 : Losange',
        '2 : Rectangle',
        '3 : Carré',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const listeDeQuad = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['losange', 'rectangle', 'carre'],
      nbQuestions: this.nbQuestions,
    }).map(String)

    this.consigne = !this.interactif
      ? ''
      : this.nbQuestions === 1
        ? 'Cocher la bonne réponse.'
        : 'Pour chaque question, cocher la bonne réponse.'

    for (
      let i = 0, numDeQuad, listeDeQuestions, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      numDeQuad = listeDeQuad[i] === 'losange' ? randint(1, 2) : randint(1, 3)
      listeDeQuestions = listeDeQuad[i] + numDeQuad
      texte = ''
      texteCorr = ''
      let A,
        B,
        C,
        D,
        O,
        ABCD,
        codage,
        codage1,
        codage2,
        codage3,
        codage4,
        sAC,
        sBD,
        marquesDemiDiagonales,
        marquesDemiDiagonales1,
        marquesDemiDiagonales2,
        marquesCotes
      this.autoCorrection[i] = {}
      switch (numDeQuad) {
        case 2:
          this.autoCorrection[i].propositions = [
            {
              texte: 'Losange',
              statut: false,
              feedback:
                listeDeQuad[i] === 'losange'
                  ? 'Les losanges ont des diagonales perpendiculaires et sécantes en leur milieu.'
                  : "Les losanges n'ont pas de diagonales de même longueur.",
            },
            {
              texte: 'Rectangle',
              statut: false,
              feedback:
                listeDeQuad[i] === 'rectangle'
                  ? 'Les rectangles ont des diagonales de même longueur et sécantes en leur milieu.'
                  : "Les rectangles n'ont pas de diagonales perpendiculaires.",
            },
            {
              texte: 'Carré',
              statut: false,
              feedback:
                (listeDeQuad[i] === 'losange'
                  ? 'Les carrés ont des diagonales perpendiculaires et sécantes en leur milieu, mais pas seulement. Leurs diagonales sont aussi de même longueur.'
                  : listeDeQuad[i] === 'rectangle'
                    ? 'Les carrés ont des diagonales perpendiculaires et de même longueur, mais pas seulement. Leurs diagonales sont aussi sécantes en leur milieu.'
                    : 'Les carrés ont des diagonales perpendiculaires, de même longueur et sécantes en leur milieu.') +
                ' Un carré est à la fois un rectangle et un losange.',
            },
            {
              texte: 'Trapèze',
              statut: false,
              feedback:
                "De manière générale, les trapèzes n'ont pas de diagonales perpendiculaires.",
            },
            {
              texte: 'Parallélogramme',
              statut: false,
              feedback:
                "De manière générale, les parallélogrammes n'ont pas de diagonales perpendiculaires.",
            },
          ]
          break
        default:
          this.autoCorrection[i].propositions = [
            {
              texte: 'Losange',
              statut: false,
              feedback:
                listeDeQuad[i] === 'losange'
                  ? 'Les losanges ont tous leurs côtés de même longueur.'
                  : "Les losanges n'ont pas d'angles droits.",
            },
            {
              texte: 'Rectangle',
              statut: false,
              feedback:
                listeDeQuad[i] === 'rectangle'
                  ? 'Les rectangles ont $4$ angles droits.'
                  : "Les rectangles n'ont pas tous leurs côtés de même longueur.",
            },
            {
              texte: 'Carré',
              statut: false,
              feedback:
                (listeDeQuad[i] === 'losange'
                  ? 'Les carrés ont tous leurs côtés de même longueur, mais pas seulement. Ils ont aussi $4$ angles droits.'
                  : listeDeQuad[i] === 'rectangle'
                    ? 'Les carrés ont $4$ angles droits, mais pas seulement. Ils ont aussi tous leurs côtés de même longueur.'
                    : 'Les carrés ont tous leurs côtés de même longueur et $4$ angles droits.') +
                ' Un carré est à la fois un rectangle et un losange.',
            },
            {
              texte: 'Trapèze',
              statut: false,
              feedback:
                "De manière générale, les trapèzes n'ont pas tous leurs côtés de même longueur, ni d'angles droits.",
            },
            {
              texte: 'Parallélogramme',
              statut: false,
              feedback:
                "De manière générale, les parallélogrammes n'ont pas tous leurs côtés de même longueur, ni d'angles droits.",
            },
          ]
      }
      this.autoCorrection[i].options = {
        ordered: true,
        lastChoice: 5,
      }

      switch (listeDeQuestions) {
        case 'losange1':
          texte =
            "Quelle est la nature d'un quadrilatère ayant $4$ côtés de même longueur ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(2, 3)
          C = pointAbstrait(0, 6)
          D = pointAbstrait(-2, 3)
          O = pointAbstrait(0, 3)
          ABCD = polygone(A, B, C, D)
          marquesCotes = codageSegments(
            '||',
            bleuMathalea,
            A,
            B,
            B,
            C,
            C,
            D,
            D,
            A,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -3, xmax: 3, ymin: -1, ymax: 7 },
                ABCD,
                marquesCotes,
              ) + '<br>'
          }
          texteCorr += "C'est un losange."
          break
        case 'losange2':
          texte =
            "Quelle est la nature d'un quadrilatère ayant ses diagonales perpendiculaires et sécantes en leur milieu ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(2, 3)
          C = pointAbstrait(0, 6)
          D = pointAbstrait(-2, 3)
          O = pointAbstrait(0, 3)
          ABCD = polygone(A, B, C, D)
          codage = codageAngleDroit(C, O, B)
          sAC = segment(A, C)
          sBD = segment(B, D)
          sAC.pointilles = 5
          sBD.pointilles = 5
          marquesDemiDiagonales1 = codageSegments('|', bleuMathalea, O, A, O, C)
          marquesDemiDiagonales2 = codageSegments(
            '|||',
            bleuMathalea,
            O,
            B,
            O,
            D,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -3, xmax: 3, ymin: -1, ymax: 7 },
                ABCD,
                codage,
                sAC,
                sBD,
                marquesDemiDiagonales1,
                marquesDemiDiagonales2,
              ) + '<br>'
          }
          texteCorr += "C'est un losange."
          break
        case 'rectangle1':
          texte =
            "Quelle est la nature d'un quadrilatère ayant $4$ angles droits ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(5, 0)
          C = pointAbstrait(5, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(2.5, 1.5)
          ABCD = polygone(A, B, C, D)
          codage1 = codageAngleDroit(A, B, C)
          codage2 = codageAngleDroit(B, C, D)
          codage3 = codageAngleDroit(C, D, A)
          codage4 = codageAngleDroit(D, A, B)
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 6, ymin: -1, ymax: 4 },
                ABCD,
                codage1,
                codage2,
                codage3,
                codage4,
              ) + '<br>'
          }
          texteCorr += "C'est un rectangle."
          break
        case 'rectangle2':
          texte =
            "Quelle est la nature d'un quadrilatère ayant ses diagonales de même longueur et sécantes en leur milieu ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(5, 0)
          C = pointAbstrait(5, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(2.5, 1.5)
          ABCD = polygone(A, B, C, D)
          sAC = segment(A, C)
          sBD = segment(B, D)
          marquesDemiDiagonales = codageSegments(
            '||',
            bleuMathalea,
            O,
            A,
            O,
            B,
            O,
            C,
            O,
            D,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 6, ymin: -1, ymax: 4 },
                ABCD,
                marquesDemiDiagonales,
                sAC,
                sBD,
              ) + '<br>'
          }
          texteCorr += "C'est un rectangle."
          break
        case 'rectangle3':
          texte =
            "Quelle est la nature d'un quadrilatère ayant $3$ angles droits ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(5, 0)
          C = pointAbstrait(5, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(2.5, 1.5)
          ABCD = polygone(A, B, C, D)
          codage1 = codageAngleDroit(A, B, C)
          codage2 = codageAngleDroit(B, C, D)
          codage3 = codageAngleDroit(C, D, A)
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 6, ymin: -1, ymax: 4 },
                ABCD,
                codage1,
                codage2,
                codage3,
              ) + '<br>'
          }
          texteCorr +=
            "C'est un rectangle car si le quadrilatère a $3$ angles droits, alors il en possède aussi forcément un quatrième."
          break
        case 'carre1':
          texte =
            "Quelle est la nature d'un quadrilatère ayant ses $4$ côtés de même longueur et $4$ angles droits ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(3, 0)
          C = pointAbstrait(3, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(1.5, 1.5)
          ABCD = polygone(A, B, C, D)
          codage1 = codageAngleDroit(A, B, C)
          codage2 = codageAngleDroit(B, C, D)
          codage3 = codageAngleDroit(C, D, A)
          marquesCotes = codageSegments(
            '||',
            bleuMathalea,
            A,
            B,
            B,
            C,
            C,
            D,
            D,
            A,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 4, ymin: -1, ymax: 4 },
                ABCD,
                codage1,
                codage2,
                codage3,
                marquesCotes,
              ) + '<br>'
          }
          texteCorr += "C'est un carré."
          break
        case 'carre2':
          texte =
            "Quelle est la nature d'un quadrilatère ayant ses diagonales perpendiculaires, de même longueur et sécantes en leur milieu ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(3, 0)
          C = pointAbstrait(3, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(1.5, 1.5)
          ABCD = polygone(A, B, C, D)
          codage = codageAngleDroit(C, O, D)
          sAC = segment(A, C)
          sBD = segment(B, D)
          sAC.pointilles = 5
          sBD.pointilles = 5
          marquesDemiDiagonales = codageSegments(
            '||',
            bleuMathalea,
            O,
            A,
            O,
            B,
            O,
            C,
            O,
            D,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 4, ymin: -1, ymax: 4 },
                ABCD,
                codage,
                marquesDemiDiagonales,
                sAC,
                sBD,
              ) + '<br>'
          }
          texteCorr += "C'est un carré."
          break
        case 'carre3':
          texte =
            "Quelle est la nature d'un quadrilatère ayant ses $4$ côtés de même longueur et un angle droit ?"
          A = pointAbstrait(0, 0)
          B = pointAbstrait(3, 0)
          C = pointAbstrait(3, 3)
          D = pointAbstrait(0, 3)
          O = pointAbstrait(1.5, 1.5)
          ABCD = polygone(A, B, C, D)
          codage = codageAngleDroit(A, B, C)
          marquesCotes = codageSegments(
            '||',
            bleuMathalea,
            A,
            B,
            B,
            C,
            C,
            D,
            D,
            A,
          )
          if (this.correctionDetaillee) {
            texteCorr =
              mathalea2d(
                { xmin: -1, xmax: 4, ymin: -1, ymax: 4 },
                ABCD,
                codage,
                marquesCotes,
              ) + '<br>'
          }
          texteCorr += "C'est un carré."
          break
      }

      this.autoCorrection[i].enonce = `${texte}\n`

      // 0: losange, 1: rectangle, 2: carré, 3: trapèze, 4: parallélogramme
      const autoCorr = this.autoCorrection[i].propositions
      switch (listeDeQuad[i]) {
        case 'losange':
          if (autoCorr && autoCorr[0]) {
            autoCorr[0].statut = true
          }
          break
        case 'rectangle':
          if (autoCorr && autoCorr[1]) {
            autoCorr[1].statut = true
          }
          break
        case 'carre':
          if (autoCorr && autoCorr[2]) {
            autoCorr[2].statut = true
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        const props = propositionsQcm(this, i)
        if (this.interactif) {
          texte += props.texte
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    this.nbQuestions = this.listeQuestions.length // MGu ici car il y a au maximum 8 questions différentes...
    this.autoCorrection = this.autoCorrection.slice(0, this.nbQuestions)
    listeQuestionsToContenu(this)
  }
}
