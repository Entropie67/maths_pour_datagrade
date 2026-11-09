import { miseEnEvidence } from '../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { grille, seyes } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { similitude, translation2Points } from '../../lib/2d/transformations'
import { vide2d } from '../../lib/2d/Vide2d'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
} from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { orangeMathalea, bleuMathalea } from '../../lib/colors'

export const dateDeModifImportante = '07/06/2023' // par EE : QCM interactif, nouveau paramètre, couleur appropriée dans la correction, AMC

/**
 * fonction servant à plusieurs exercices autour du cube et du pavé droit
 * @author Jean-claude Lhote
 */
export default class Solide6e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 5
    this.titre = ''
    this.besoinFormulaireNumerique = [
      'Type de solides',
      3,
      ' 1 : Cubes\n 2 : Pavés droits\n 3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.besoinFormulaire3Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1: Arêtes parallèles\n2: Faces parallèles\n3: Arêtes perpendiculaires\n4: Faces perpendiculaires\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = this.sup === 3 ? [1, 2] : [this.sup]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const listeDeProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })

    let Xmin, Xmax, Ymin, Ymax, ppc

    const sc = this.sup2 === 1 ? 0.5 : 0.8

    let A = pointAbstrait(0, 0)
    let B = pointAbstrait(0, 0)
    let C = pointAbstrait(0, 0)
    let D = pointAbstrait(0, 0)
    let E = pointAbstrait(0, 0)
    let F = pointAbstrait(0, 0)
    let G = pointAbstrait(0, 0)
    let H = pointAbstrait(0, 0)
    let AB
    let BC
    let CD
    let DA
    let EF
    let FG
    let GH
    let HE
    let AE
    let BF
    let CG
    let DH
    let coeffpersp
    let correction
    let carreaux
    let g
    let objetsEnonce = []
    let objetsCorrection = []
    let p
    let listeDeNomsDePolygones = ['PQD']
    for (
      let i = 0,
        texte = '',
        resultatCorrect: string[] = [],
        resultatFaux: string[] = [],
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (i % 2 === 0) listeDeNomsDePolygones = ['PQD']
      const nom = creerNomDePolygone(8, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom)
      const anglepersp = choice([30, 45, -30, -45, 150, 135, -150, -135])
      coeffpersp = anglepersp % 10 === 0 ? 0.6 : 0.4
      objetsCorrection = []
      objetsEnonce = []
      switch (listeTypeDeQuestions[i]) {
        case 1: // cube
          texte = `$${nom}$ est un cube.<br>`
          //  if (context.isHtml) texte += ' Reproduire la figure ci-dessous sur le cahier.<br>'
          // texte += ' Repasse tous les segments de même longueur dans une même couleur.<br>'
          correction = `Le cube ${nom}.<br>`
          break

        case 2:
          texte = `$${nom}$ est un pavé droit.<br>`
          // if (context.isHtml) texte += ' Reproduire la figure ci-dessous sur le cahier.<br>'
          // texte += ' Repasse tous les segments de même longueur dans une même couleur.<br>'
          correction = `Le pavé droit ${nom}.<br>`
          break
      }
      const aretesParalleles = [
        [
          [0, 1],
          [2, 3],
          [4, 5],
          [6, 7],
        ],
        [
          [0, 3],
          [1, 2],
          [4, 7],
          [5, 6],
        ],
        [
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ],
      ]
      const facesParalleles = [
        [
          [0, 1, 2, 3],
          [4, 5, 6, 7],
        ],
        [
          [3, 7, 4, 0],
          [1, 5, 6, 2],
        ],
        [
          [0, 1, 5, 4],
          [2, 6, 7, 3],
        ],
      ]
      const aretesPerp = [
        [
          [0, 1],
          [0, 4],
          [0, 3],
          [1, 5],
          [1, 2],
        ],
        [
          [0, 4],
          [0, 1],
          [0, 3],
          [4, 5],
          [4, 7],
        ],
        [
          [0, 3],
          [0, 1],
          [0, 4],
          [2, 3],
          [3, 7],
        ],
        [
          [1, 2],
          [0, 1],
          [1, 5],
          [2, 3],
          [2, 6],
        ],
        [
          [1, 5],
          [0, 1],
          [1, 2],
          [4, 5],
          [5, 6],
        ],
        [
          [4, 5],
          [1, 5],
          [5, 6],
          [0, 4],
          [4, 7],
        ],
        [
          [5, 6],
          [1, 5],
          [4, 5],
          [2, 6],
          [6, 7],
        ],
        [
          [2, 6],
          [6, 5],
          [6, 7],
          [1, 2],
          [2, 3],
        ],
        [
          [2, 3],
          [1, 2],
          [2, 6],
          [0, 3],
          [3, 7],
        ],
        [
          [3, 7],
          [2, 3],
          [0, 3],
          [4, 7],
          [6, 7],
        ],
        [
          [4, 7],
          [0, 4],
          [4, 5],
          [7, 3],
          [6, 7],
        ],
        [
          [6, 7],
          [2, 6],
          [6, 5],
          [7, 3],
          [4, 7],
        ],
      ]
      const facesPerp = [
        [
          [0, 1, 2, 3],
          [1, 5, 6, 2],
          [2, 6, 7, 3],
          [3, 7, 4, 0],
          [0, 1, 5, 4],
        ],
        [
          [1, 5, 6, 2],
          [0, 1, 2, 3],
          [2, 6, 7, 3],
          [4, 5, 6, 7],
          [0, 1, 5, 4],
        ],
        [
          [0, 1, 5, 4],
          [1, 5, 6, 2],
          [4, 5, 6, 7],
          [3, 7, 4, 0],
          [0, 1, 2, 3],
        ],
        [
          [4, 5, 6, 7],
          [0, 1, 5, 4],
          [1, 5, 6, 2],
          [2, 6, 7, 3],
          [3, 7, 4, 0],
        ],
        [
          [3, 7, 4, 0],
          [0, 1, 2, 3],
          [0, 1, 5, 4],
          [4, 5, 6, 7],
          [2, 6, 7, 3],
        ],
        [
          [2, 6, 7, 3],
          [0, 1, 2, 3],
          [1, 5, 6, 2],
          [4, 5, 6, 7],
          [3, 7, 4, 0],
        ],
      ]
      const toutesLesFaces = [
        [0, 1, 2, 3],
        [1, 5, 6, 2],
        [2, 6, 7, 3],
        [3, 7, 4, 0],
        [0, 1, 5, 4],
        [4, 5, 6, 7],
      ]
      let k = 0,
        l = 0,
        s = 0
      let nomFace, nomArete

      switch (listeDeProblemes[i]) {
        case 1: // citer les arêtes parallèles à une arête donnée
          ;[k, l, s] = [randint(0, 2), randint(0, 3), randint(0, 1)]
          texte += this.interactif
            ? `Parmi les arêtes proposées, citer toutes celles parallèles à [$${nom[aretesParalleles[k][l][s]] + nom[aretesParalleles[k][l][(s + 1) % 2]]}$].<br>`
            : `Citer toutes les arêtes parallèles à [$${nom[aretesParalleles[k][l][s]] + nom[aretesParalleles[k][l][(s + 1) % 2]]}$].<br>`
          correction = `Les arêtes parallèles à [$${nom[aretesParalleles[k][l][s]] + nom[aretesParalleles[k][l][(s + 1) % 2]]}$] sont [$${miseEnEvidence(nom[aretesParalleles[k][(l + 1) % 4][s]] + nom[aretesParalleles[k][(l + 1) % 4][(s + 1) % 2]])}$], [$${miseEnEvidence(nom[aretesParalleles[k][(l + 2) % 4][s]] + nom[aretesParalleles[k][(l + 2) % 4][(s + 1) % 2]])}$] et [$${miseEnEvidence(nom[aretesParalleles[k][(l + 3) % 4][s]] + nom[aretesParalleles[k][(l + 3) % 4][(s + 1) % 2]])}$].<br>`
          resultatCorrect = [
            `[$${nom[aretesParalleles[k][(l + 1) % 4][s]] + nom[aretesParalleles[k][(l + 1) % 4][(s + 1) % 2]]}$]`,
            `[$${nom[aretesParalleles[k][(l + 2) % 4][s]] + nom[aretesParalleles[k][(l + 2) % 4][(s + 1) % 2]]}$]`,
            `[$${nom[aretesParalleles[k][(l + 3) % 4][s]] + nom[aretesParalleles[k][(l + 3) % 4][(s + 1) % 2]]}$]`,
          ]
          resultatFaux = []
          for (let ee = 0; ee < 3; ee++) {
            if (ee !== k) {
              for (let ff = 0; ff < 4; ff++) {
                resultatFaux.push(
                  `[$${nom[aretesParalleles[ee][ff][s]] + nom[aretesParalleles[ee][ff][(s + 1) % 2]]}$]`,
                )
              }
            }
          }
          break

        case 2: // citer la face parallèle à une face donnée
          ;[k, l, s] = [randint(0, 2), randint(0, 1), randint(0, 3)]
          texte += `Quelle est la face parallèle à $${nom[facesParalleles[k][l][s]] + nom[facesParalleles[k][l][(s + 1) % 4]] + nom[facesParalleles[k][l][(s + 2) % 4]] + nom[facesParalleles[k][l][(s + 3) % 4]]}$ ?<br>`
          correction = `La face parallèle à $${nom[facesParalleles[k][l][s]] + nom[facesParalleles[k][l][(s + 1) % 4]] + nom[facesParalleles[k][l][(s + 2) % 4]] + nom[facesParalleles[k][l][(s + 3) % 4]]}$ est la face $${miseEnEvidence(nom[facesParalleles[k][(l + 1) % 2][s]] + nom[facesParalleles[k][(l + 1) % 2][(s + 1) % 4]] + nom[facesParalleles[k][(l + 1) % 2][(s + 2) % 4]] + nom[facesParalleles[k][(l + 1) % 2][(s + 3) % 4]])}$.<br>`
          resultatCorrect = [
            `$${nom[facesParalleles[k][(l + 1) % 2][s]] + nom[facesParalleles[k][(l + 1) % 2][(s + 1) % 4]] + nom[facesParalleles[k][(l + 1) % 2][(s + 2) % 4]] + nom[facesParalleles[k][(l + 1) % 2][(s + 3) % 4]]}$`,
          ]
          resultatFaux = []
          for (let ee = 0; ee < 3; ee++) {
            if (ee !== k) {
              for (let ff = 0; ff < 2; ff++) {
                resultatFaux.push(
                  `$${nom[facesParalleles[ee][ff][s]] + nom[facesParalleles[ee][ff][(s + 1) % 4]] + nom[facesParalleles[ee][ff][(s + 2) % 4]] + nom[facesParalleles[ee][ff][(s + 3) % 4]]}$`,
                )
              }
            }
          }
          break

        case 3: // citer les arêtes perpendiculaires à une arête donnée
          ;[k, l, s] = [randint(0, 11), 0, randint(0, 1)]
          texte += this.interactif
            ? `Parmi les arêtes proposées, citer toutes celles perpendiculaires à l'arête [$${nom[aretesPerp[k][l][s]] + nom[aretesPerp[k][l][(s + 1) % 2]]}$].<br>`
            : `Quelles sont les arêtes perpendiculaires à l'arête [$${nom[aretesPerp[k][l][s]] + nom[aretesPerp[k][l][(s + 1) % 2]]}$] ?<br>`
          correction = `Les arêtes perpendiculaires à l'arête [$${nom[aretesPerp[k][l][s]] + nom[aretesPerp[k][l][(s + 1) % 2]]}$] sont [$${miseEnEvidence(nom[aretesPerp[k][1][s]] + nom[aretesPerp[k][1][(s + 1) % 2]])}$], [$${miseEnEvidence(nom[aretesPerp[k][2][s]] + nom[aretesPerp[k][2][(s + 1) % 2]])}$], [$${miseEnEvidence(nom[aretesPerp[k][3][s]] + nom[aretesPerp[k][3][(s + 1) % 2]])}$] et [$${miseEnEvidence(nom[aretesPerp[k][4][s]] + nom[aretesPerp[k][4][(s + 1) % 2]])}$].`
          resultatCorrect = [
            `[$${nom[aretesPerp[k][1][s]] + nom[aretesPerp[k][1][(s + 1) % 2]]}$]`,
            `[$${nom[aretesPerp[k][2][s]] + nom[aretesPerp[k][2][(s + 1) % 2]]}$]`,
            `[$${nom[aretesPerp[k][3][s]] + nom[aretesPerp[k][3][(s + 1) % 2]]}$]`,
            `[$${nom[aretesPerp[k][4][s]] + nom[aretesPerp[k][4][(s + 1) % 2]]}$]`,
          ]
          resultatFaux = []
          for (let ee = 0; ee < 3; ee++) {
            if (ee !== k) {
              for (let ff = 1; ff < 5; ff++) {
                nomArete = `[$${nom[aretesPerp[ee][ff][s]] + nom[aretesPerp[ee][ff][(s + 1) % 2]]}$]`
                if (
                  resultatCorrect.indexOf(nomArete) === -1 &&
                  nomArete !==
                    `[$${nom[aretesPerp[k][l][s]] + nom[aretesPerp[k][l][(s + 1) % 2]]}$]`
                )
                  resultatFaux.push(nomArete)
              }
            }
          }
          break

        case 4: // citer les faces perpendiculaires à une face donnée
          ;[k, l, s] = [randint(0, 5), 0, randint(0, 3)]
          texte += `Quelles sont les faces perpendiculaires à la face $${nom[facesPerp[k][l][s]] + nom[facesPerp[k][l][(s + 1) % 4]] + nom[facesPerp[k][l][(s + 2) % 4]] + nom[facesPerp[k][l][(s + 3) % 4]]}$ ?<br>`
          correction = `Les faces perpendiculaires à la face $${nom[facesPerp[k][l][s]] + nom[facesPerp[k][l][(s + 1) % 4]] + nom[facesPerp[k][l][(s + 2) % 4]] + nom[facesPerp[k][l][(s + 3) % 4]]}$ `
          correction += `sont les faces $${miseEnEvidence(nom[facesPerp[k][l + 1][s]] + nom[facesPerp[k][l + 1][(s + 1) % 4]] + nom[facesPerp[k][l + 1][(s + 2) % 4]] + nom[facesPerp[k][l + 1][(s + 3) % 4]])}$, `
          correction += `$${miseEnEvidence(nom[facesPerp[k][l + 2][s]] + nom[facesPerp[k][l + 2][(s + 1) % 4]] + nom[facesPerp[k][l + 2][(s + 2) % 4]] + nom[facesPerp[k][l + 2][(s + 3) % 4]])}$, `
          correction += `$${miseEnEvidence(nom[facesPerp[k][l + 3][s]] + nom[facesPerp[k][l + 3][(s + 1) % 4]] + nom[facesPerp[k][l + 3][(s + 2) % 4]] + nom[facesPerp[k][l + 3][(s + 3) % 4]])}$ et `
          correction += `$${miseEnEvidence(nom[facesPerp[k][l + 4][s]] + nom[facesPerp[k][l + 4][(s + 1) % 4]] + nom[facesPerp[k][l + 4][(s + 2) % 4]] + nom[facesPerp[k][l + 4][(s + 3) % 4]])}$.`
          resultatCorrect = []
          for (let ee = 1; ee < 5; ee++) {
            resultatCorrect.push(
              `$${nom[facesPerp[k][l + ee][s]] + nom[facesPerp[k][l + ee][(s + 1) % 4]] + nom[facesPerp[k][l + ee][(s + 2) % 4]] + nom[facesPerp[k][l + ee][(s + 3) % 4]]}$`,
            )
          }
          resultatFaux = []
          for (let ee = 0; ee < 6; ee++) {
            nomFace = `$${nom[toutesLesFaces[ee][s]] + nom[toutesLesFaces[ee][(s + 1) % 4]] + nom[toutesLesFaces[ee][(s + 2) % 4]] + nom[toutesLesFaces[ee][(s + 3) % 4]]}$`
            if (
              resultatCorrect.indexOf(nomFace) === -1 &&
              nomFace !==
                `$${nom[facesPerp[k][l][s]] + nom[facesPerp[k][l][(s + 1) % 4]] + nom[facesPerp[k][l][(s + 2) % 4]] + nom[facesPerp[k][l][(s + 3) % 4]]}$`
            )
              resultatFaux.push(nomFace)
          }
          break
      }

      switch (listeTypeDeQuestions[i] % 2) {
        case 1:
          A = pointAbstrait(6, 0, nom[0], 'left')
          B = pointAbstrait(11, 0, nom[1], 'right')
          C = pointAbstrait(11, 5, nom[2], 'right')
          D = pointAbstrait(6, 5, nom[3], 'left')
          p = polygone(A, B, C, D)
          E = similitude(B, A, anglepersp, coeffpersp, nom[4], 'left')
          E.x = Math.round(E.x)
          E.y = Math.round(E.y)
          break

        case 0:
          A = pointAbstrait(5, 0, nom[0], 'left')
          B = pointAbstrait(9 + randint(1, 3), 0, nom[1], 'right')
          C = pointAbstrait(B.x, randint(3, 7), nom[2], 'right')
          D = pointAbstrait(A.x, C.y, nom[3], 'left')
          p = polygone(A, B, C, D)
          E = similitude(
            B,
            A,
            anglepersp,
            (coeffpersp * randint(5, 12)) / 10,
            nom[4],
            'left',
          )
          E.x = Math.round(E.x)
          E.y = Math.round(E.y)
          break
      }

      p = polygone(A, B, C, D)
      F = translation2Points(E, A, B, nom[5], 'right')
      G = translation2Points(F, B, C, nom[6], 'right')
      H = translation2Points(G, C, D, nom[7], 'left')
      AB = segment(A, B, 'black')
      BC = segment(B, C, 'black')
      CD = segment(C, D, 'black')
      DA = segment(D, A, 'black')
      EF = segment(E, F, 'black')
      FG = segment(F, G, 'black')
      GH = segment(G, H, 'black')
      HE = segment(H, E, 'black')
      AE = segment(A, E, 'black')
      BF = segment(B, F, 'black')
      CG = segment(C, G, 'black')
      DH = segment(D, H, 'black')
      AB.epaisseur = 2
      BC.epaisseur = 2
      CD.epaisseur = 2
      DA.epaisseur = 2
      EF.epaisseur = 2
      FG.epaisseur = 2
      GH.epaisseur = 2
      HE.epaisseur = 2
      AE.epaisseur = 2
      BF.epaisseur = 2
      CG.epaisseur = 2
      DH.epaisseur = 2
      if (G.y < C.y && G.x < C.x) {
        CG.pointilles = 5
        CG.color = colorToLatexOrHTML('gray')
        CG.opacite = 0.7
        GH.pointilles = 5
        GH.color = colorToLatexOrHTML('gray')
        GH.opacite = 0.7
        FG.pointilles = 5
        FG.color = colorToLatexOrHTML('gray')
        FG.opacite = 0.7
      } else if (E.y > A.y && E.x > A.x) {
        AE.pointilles = 5
        EF.pointilles = 5
        HE.pointilles = 5
        AE.color = colorToLatexOrHTML('gray')
        EF.color = colorToLatexOrHTML('gray')
        HE.color = colorToLatexOrHTML('gray')
        AE.opacite = 0.7
        EF.opacite = 0.7
        HE.opacite = 0.7
      } else if (F.x < B.x && F.y > B.y) {
        BF.pointilles = 5
        FG.pointilles = 5
        EF.pointilles = 5
        BF.color = colorToLatexOrHTML('gray')
        FG.color = colorToLatexOrHTML('gray')
        EF.color = colorToLatexOrHTML('gray')
        BF.opacite = 0.7
        FG.opacite = 0.7
        EF.opacite = 0.7
      } else if (H.x > D.x && H.y < D.y) {
        DH.pointilles = 5
        GH.pointilles = 5
        HE.pointilles = 5
        DH.color = colorToLatexOrHTML('gray')
        GH.color = colorToLatexOrHTML('gray')
        HE.color = colorToLatexOrHTML('gray')
        DH.opacite = 0.7
        GH.opacite = 0.7
        HE.opacite = 0.7
      }
      Xmin = Math.min(A.x, E.x) - 1
      Ymin = Math.min(A.y, E.y) - 1
      Xmax = Math.max(B.x, F.x) + 2
      Ymax = Math.max(D.y, H.y) + 1
      ppc = 20

      g = this.sup2 < 3 ? grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7) : vide2d()
      carreaux = this.sup2 === 2 ? seyes(Xmin, Ymin, Xmax, Ymax) : vide2d()

      objetsEnonce.push(
        AB,
        BC,
        CD,
        DA,
        EF,
        FG,
        GH,
        HE,
        AE,
        BF,
        CG,
        DH,
        labelPoint(A, B, C, D, E, F, G, H),
        p,
        g,
        carreaux,
      )

      const params = {
        xmin: Xmin,
        ymin: Ymin,
        xmax: Xmax,
        ymax: Ymax,
        pixelsParCm: ppc,
        scale: sc,
      }
      texte += mathalea2d(params, objetsEnonce)
      switch (listeDeProblemes[i]) {
        case 1:
          switch (k) {
            case 0:
              AB.color =
                l === 0
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              CD.color =
                l === 1
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              EF.color =
                l === 2
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              GH.color =
                l === 3
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              break
            case 1:
              BC.color =
                l === 1
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              DA.color =
                l === 0
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              FG.color =
                l === 3
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              HE.color =
                l === 2
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              break
            case 2:
              BF.color =
                l === 1
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              CG.color =
                l === 2
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              DH.color =
                l === 3
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              AE.color =
                l === 0
                  ? colorToLatexOrHTML(bleuMathalea)
                  : colorToLatexOrHTML(orangeMathalea)
              break
          }
          break
        case 2:
          switch (k) {
            case 0:
              AB.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              BC.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              CD.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              DA.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              EF.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              FG.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              GH.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              HE.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              break
            case 1:
              DH.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              HE.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              AE.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              DA.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              BF.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              FG.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              CG.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              BC.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              break
            case 2:
              AB.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              BF.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              EF.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              AE.color =
                l !== 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              CG.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              GH.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              DH.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              CD.color =
                l === 0
                  ? colorToLatexOrHTML(orangeMathalea)
                  : colorToLatexOrHTML(bleuMathalea)
              break
          }
          break
        case 3:
          switch (k) {
            case 0:
              AB.color = colorToLatexOrHTML(bleuMathalea)
              AE.color = colorToLatexOrHTML(orangeMathalea)
              DA.color = colorToLatexOrHTML(orangeMathalea)
              BF.color = colorToLatexOrHTML(orangeMathalea)
              BC.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 1:
              AE.color = colorToLatexOrHTML(bleuMathalea)
              AB.color = colorToLatexOrHTML(orangeMathalea)
              DA.color = colorToLatexOrHTML(orangeMathalea)
              EF.color = colorToLatexOrHTML(orangeMathalea)
              HE.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 2:
              DA.color = colorToLatexOrHTML(bleuMathalea)
              AB.color = colorToLatexOrHTML(orangeMathalea)
              AE.color = colorToLatexOrHTML(orangeMathalea)
              CD.color = colorToLatexOrHTML(orangeMathalea)
              DH.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 3:
              BC.color = colorToLatexOrHTML(bleuMathalea)
              AB.color = colorToLatexOrHTML(orangeMathalea)
              BF.color = colorToLatexOrHTML(orangeMathalea)
              CD.color = colorToLatexOrHTML(orangeMathalea)
              CG.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 4:
              BF.color = colorToLatexOrHTML(bleuMathalea)
              AB.color = colorToLatexOrHTML(orangeMathalea)
              BC.color = colorToLatexOrHTML(orangeMathalea)
              EF.color = colorToLatexOrHTML(orangeMathalea)
              FG.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 5:
              EF.color = colorToLatexOrHTML(bleuMathalea)
              BF.color = colorToLatexOrHTML(orangeMathalea)
              FG.color = colorToLatexOrHTML(orangeMathalea)
              AE.color = colorToLatexOrHTML(orangeMathalea)
              HE.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 6:
              FG.color = colorToLatexOrHTML(bleuMathalea)
              BF.color = colorToLatexOrHTML(orangeMathalea)
              EF.color = colorToLatexOrHTML(orangeMathalea)
              CG.color = colorToLatexOrHTML(orangeMathalea)
              GH.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 7:
              CG.color = colorToLatexOrHTML(bleuMathalea)
              FG.color = colorToLatexOrHTML(orangeMathalea)
              GH.color = colorToLatexOrHTML(orangeMathalea)
              BC.color = colorToLatexOrHTML(orangeMathalea)
              CD.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 8:
              CD.color = colorToLatexOrHTML(bleuMathalea)
              BC.color = colorToLatexOrHTML(orangeMathalea)
              CG.color = colorToLatexOrHTML(orangeMathalea)
              DA.color = colorToLatexOrHTML(orangeMathalea)
              DH.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 9:
              DH.color = colorToLatexOrHTML(bleuMathalea)
              CD.color = colorToLatexOrHTML(orangeMathalea)
              DA.color = colorToLatexOrHTML(orangeMathalea)
              HE.color = colorToLatexOrHTML(orangeMathalea)
              GH.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 10:
              HE.color = colorToLatexOrHTML(bleuMathalea)
              AE.color = colorToLatexOrHTML(orangeMathalea)
              EF.color = colorToLatexOrHTML(orangeMathalea)
              DH.color = colorToLatexOrHTML(orangeMathalea)
              GH.color = colorToLatexOrHTML(orangeMathalea)
              break
            case 11:
              GH.color = colorToLatexOrHTML(bleuMathalea)
              CG.color = colorToLatexOrHTML(orangeMathalea)
              FG.color = colorToLatexOrHTML(orangeMathalea)
              DH.color = colorToLatexOrHTML(orangeMathalea)
              HE.color = colorToLatexOrHTML(orangeMathalea)
              break
          }
          break
        case 4:
          AB.color = colorToLatexOrHTML(orangeMathalea)
          BC.color = colorToLatexOrHTML(orangeMathalea)
          CD.color = colorToLatexOrHTML(orangeMathalea)
          DA.color = colorToLatexOrHTML(orangeMathalea)
          EF.color = colorToLatexOrHTML(orangeMathalea)
          FG.color = colorToLatexOrHTML(orangeMathalea)
          GH.color = colorToLatexOrHTML(orangeMathalea)
          HE.color = colorToLatexOrHTML(orangeMathalea)
          AE.color = colorToLatexOrHTML(orangeMathalea)
          BF.color = colorToLatexOrHTML(orangeMathalea)
          CG.color = colorToLatexOrHTML(orangeMathalea)
          DH.color = colorToLatexOrHTML(orangeMathalea)
          switch (k) {
            case 0:
              AB.color = colorToLatexOrHTML(bleuMathalea)
              BC.color = colorToLatexOrHTML(bleuMathalea)
              CD.color = colorToLatexOrHTML(bleuMathalea)
              DA.color = colorToLatexOrHTML(bleuMathalea)
              break
            case 1:
              BF.color = colorToLatexOrHTML(bleuMathalea)
              FG.color = colorToLatexOrHTML(bleuMathalea)
              CG.color = colorToLatexOrHTML(bleuMathalea)
              BC.color = colorToLatexOrHTML(bleuMathalea)
              break
            case 2:
              AB.color = colorToLatexOrHTML(bleuMathalea)
              BF.color = colorToLatexOrHTML(bleuMathalea)
              EF.color = colorToLatexOrHTML(bleuMathalea)
              AE.color = colorToLatexOrHTML(bleuMathalea)
              break
            case 3:
              EF.color = colorToLatexOrHTML(bleuMathalea)
              FG.color = colorToLatexOrHTML(bleuMathalea)
              GH.color = colorToLatexOrHTML(bleuMathalea)
              HE.color = colorToLatexOrHTML(bleuMathalea)
              break
            case 4:
              DH.color = colorToLatexOrHTML(bleuMathalea)
              HE.color = colorToLatexOrHTML(bleuMathalea)
              AE.color = colorToLatexOrHTML(bleuMathalea)
              DA.color = colorToLatexOrHTML(bleuMathalea)
              break
            case 5:
              CG.color = colorToLatexOrHTML(bleuMathalea)
              GH.color = colorToLatexOrHTML(bleuMathalea)
              DH.color = colorToLatexOrHTML(bleuMathalea)
              CD.color = colorToLatexOrHTML(bleuMathalea)
              break
          }
          break
      }

      objetsCorrection.push(
        AB,
        BC,
        CD,
        DA,
        EF,
        FG,
        GH,
        HE,
        AE,
        BF,
        CG,
        DH,
        labelPoint(A, B, C, D, E, F, G, H),
        g,
        carreaux,
      )

      correction += mathalea2d(params, objetsCorrection)
      resultatCorrect = combinaisonListes(
        resultatCorrect,
        resultatCorrect.length,
      )
      resultatFaux = Array.from(new Set(resultatFaux))
      resultatFaux = combinaisonListes(resultatFaux, resultatFaux.length)
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = texte
      this.autoCorrection[i].propositions = [
        {
          texte: resultatCorrect[0],
          statut: true,
        },
        {
          texte:
            resultatCorrect.length > 1 ? resultatCorrect[1] : resultatFaux[3],
          statut: resultatCorrect.length > 1,
        },
        {
          texte: resultatFaux[0],
          statut: false,
        },
        {
          texte:
            listeDeProblemes[i] === 4 ? resultatCorrect[2] : resultatFaux[1],
          statut: listeDeProblemes[i] === 4,
        },
        {
          texte:
            listeDeProblemes[i] === 4 ? resultatCorrect[3] : resultatFaux[2],
          statut: listeDeProblemes[i] === 4,
        },
      ]
      const props = propositionsQcm(this, i)
      texte += this.interactif ? props.texte : ''
      if (this.questionJamaisPosee(i, texte, k, l, s)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte + '<br>'
        this.listeCorrections[i] = correction + '<br>'
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
