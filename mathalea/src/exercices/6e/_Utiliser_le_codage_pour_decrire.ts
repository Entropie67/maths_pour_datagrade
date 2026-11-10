import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { codageAngle } from '../../lib/2d/angles'
import { Droite, droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import {
  affiniteOrtho,
  rotation,
  similitude,
  translation2Points,
} from '../../lib/2d/transformations'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { shuffle } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

/**
 * @author Jean-claude Lhote
 */
export default class UtiliserLeCodagePourDecrire extends Exercice {
  classe: number
  constructor() {
    super()
    this.classe = 5
    this.titre = 'Utiliser le codage pour décrire une figure'
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        "Nombres séparés par des tirets :\n1 : À propos de longueurs d'un polygone dessiné\n2 : À partir d'un carré sous forme de texte\n3 : À partir d'un rectangle sous forme de texte\n4 : À propos d'angles dans un polygone dessiné\n5 : Mélange",
      ].join('\n'),
    ]
    this.sup = 1
  }

  nouvelleVersion() {
    if (this.classe === 5) {
      this.besoinFormulaireTexte = [
        'Type de questions',
        [
          "Nombres séparés par des tirets :\n1 : À propos de longueurs d'un polygone dessiné\n2 : À partir d'un carré sous forme de texte\n3 : À partir d'un rectangle sous forme de texte\n4 : À propos d'angles dans un polygone dessiné\n5 : Mélange",
        ].join('\n'),
      ]
    } else {
      this.besoinFormulaireTexte = [
        'Type de questions',
        [
          "Nombres séparés par des tirets :\n1 : À propos de longueurs d'un polygone dessiné\n2 : À partir d'un carré sous forme de texte\n3 : À partir d'un rectangle sous forme de texte\n4 : Mélange",
        ].join('\n'),
      ]
    }
    let nom
    let paramsEnonce
    let paramsCorrection
    let objetsEnonce
    let objetsCorrection
    let A,
      B,
      C,
      D,
      E,
      F,
      s1,
      s2,
      s3,
      s4,
      s5,
      s6,
      s7,
      s8,
      medAC,
      medBC,
      dBD,
      dBC,
      dAC,
      dAF

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: this.classe === 6 ? 3 : 4,
      defaut: this.classe === 6 ? 4 : 5,
      melange: this.classe === 6 ? 4 : 5,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    // if (this.classe === 6) listeTypeDeQuestions.forEach(function (item, i) { if (item === 4) listeTypeDeQuestions[i] = randint(1, 3) })

    let listeDeNomsDePolygones: string[] = []
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objetsEnonce = []
      objetsCorrection = []
      paramsEnonce = {}
      paramsCorrection = {}
      if (i % 3 === 0) listeDeNomsDePolygones = ['PQD']
      nom = creerNomDePolygone(6, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom)
      let sommets = []
      for (let i = 0; i < 6; i++) {
        sommets.push(nom[i])
      }
      sommets = shuffle(sommets)

      A = pointAbstrait(0, 0, sommets[0], 'left')
      switch (listeTypeDeQuestions[i]) {
        case 1:
          C = pointAdistance(
            A,
            randint(5, 7),
            randint(-45, 45),
            sommets[2],
            'right',
          )
          s2 = segment(A, C)
          B = similitude(C, A, -85, randint(5, 7) / 10, sommets[1], 'below')
          s1 = segment(A, B)
          E = pointSurSegment(A, C, longueur(A, C) / 2.2, sommets[4], 'below')
          medBC = mediatrice(C, B) as Droite
          medAC = mediatrice(A, C) as Droite
          dBC = droite(C, B)
          dBD = rotation(dBC, B, randint(-40, -20))
          dAC = droite(A, C)
          dAF = rotation(dAC, A, randint(30, 40))
          D = pointIntersectionDD(dBD, medBC, sommets[3], 'below')
          D.x += randint(-2, 2, 0) / 5
          F = pointIntersectionDD(dAF, medAC, sommets[5], 'above')
          F.x += randint(-2, 2, 0) / 5
          s5 = segment(B, D)
          s6 = segment(C, D)
          s3 = segment(A, F)
          s7 = segment(C, F)
          s8 = segment(E, F)
          s4 = segment(B, C)
          paramsEnonce = {
            pixelsParCm: 20,
            scale: 0.7,
            mainlevee: true,
            amplitude: 0.3,
          }
          objetsEnonce.push(
            s1,
            s2,
            s4,
            s8,
            s7,
            s3,
            s6,
            s5,
            codageAngleDroit(B, A, C),
            codageSegments('//', 'black', A, F, F, C, 0.8),
            codageSegments('|||', 'black', A, E, E, C, 0.8),
            codageSegments('O', 'black', B, D, D, C, 0.8),
            labelPoint(A, B, C, D, E, F),
            codageAngleDroit(A, E, F),
          )
          texte = "À l'aide du schéma ci-dessous, déterminer :<br>"
          texte += '- deux segments de même longueur ;<br>'
          texte += "- le milieu d'un segment ;<br>"
          texte += '- un triangle rectangle ;<br>'
          texte += '- un triangle isocèle.<br>'
          texteCorr = `- Deux segments de même longueur : $[${sommets[0] + sommets[4]}]$ et $[${sommets[4] + sommets[2]}]$ ou $[${sommets[0] + sommets[5]}]$ et $[${sommets[5] + sommets[2]}]$`
          texteCorr += ` ou $[${sommets[1] + sommets[3]}]$ et $[${sommets[3] + sommets[2]}]$.<br>`
          texteCorr += `- $${sommets[4]}$ est le milieu du segment $[${sommets[0] + sommets[2]}]$.<br>`
          texteCorr += `- $${sommets[0] + sommets[1] + sommets[2]}$ est un triangle rectangle en $${sommets[0]}$, $${sommets[0] + sommets[4] + sommets[5]}$ est un triangle rectangle en $${sommets[4]}$ et $${sommets[2] + sommets[4] + sommets[5]}$ est un triangle rectangle en $${sommets[4]}$.<br>`
          texteCorr += `- $${sommets[0] + sommets[5] + sommets[2]}$ est un triangle isocèle en $${sommets[5]}$ et $${sommets[1] + sommets[3] + sommets[2]}$ est un triangle isocèle en $${sommets[3]}$.<br>`
          break
        case 2:
          B = pointAdistance(
            A,
            randint(5, 7),
            randint(-45, 45),
            sommets[1],
            'above',
          )
          C = similitude(A, B, randint(85, 90), 0.95, sommets[2], 'below')
          D = similitude(B, A, randint(-93, -87), 1, sommets[3], 'below')
          F = similitude(B, C, -55, 0.8, sommets[5], 'right')
          E = similitude(C, D, 57, randint(85, 115) / 100, sommets[4], 'right')
          s1 = segment(D, E)
          s2 = segment(C, E)
          s4 = segment(C, F)
          s5 = segment(B, F)
          s6 = polygone(A, B, C, D)
          paramsCorrection = {
            pixelsParCm: 20,
            scale: 0.7,
            mainlevee: true,
            amplitude: 0.3,
          }
          objetsCorrection.push(
            labelPoint(A, B, C, D, E, F),
            s1,
            s2,
            s4,
            s5,
            s6,
          )
          objetsCorrection.push(
            codageAngleDroit(D, A, B),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(C, D, A),
          )
          objetsCorrection.push(
            codageSegments('O', 'black', D, E, C, E, 0.8),
            codageSegments('O', 'black', A, B, B, C, C, D, D, A, 0.8),
            codageSegments('|||', 'black', F, C, B, F, 0.8),
          )
          texte = `$${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$ est un carré et $${sommets[3] + sommets[2] + sommets[4]}$ est un triangle équilatéral ($${sommets[4]}$ est à l'intérieur du carré $${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$).<br>`
          texte += ` $${sommets[1] + sommets[2] + sommets[5]}$ est un triangle isocèle en $${sommets[5]}$ ($${sommets[5]}$ est à l'extérieur du carré $${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$).<br>`
          texte +=
            'Représenter cette configuration par un schéma à main levée et ajouter les codages nécessaires.'
          texteCorr =
            'Voilà ci-dessous un schéma qui pourrait convenir à la situation.<br>'
          break
        case 3:
          B = pointAdistance(
            A,
            randint(5, 7),
            randint(-45, 45),
            sommets[1],
            'above',
          )
          C = similitude(A, B, randint(85, 90), 0.5, sommets[2], 'below')
          D = similitude(B, A, randint(-93, -87), 0.53, sommets[3], 'below')
          s1 = segment(D, B)
          s2 = segment(A, C)
          E = pointIntersectionDD(
            droite(A, C),
            droite(D, B),
            sommets[4],
            'above',
          )
          F = affiniteOrtho(E, droite(B, C), -1.1, sommets[5], 'right')
          s3 = polygone(A, B, C, D)
          s4 = segment(B, F)
          s5 = segment(C, F)
          paramsCorrection = {
            pixelsParCm: 20,
            scale: 0.7,
            mainlevee: true,
            amplitude: 0.3,
          }
          objetsCorrection.push(
            labelPoint(A, B, C, D, E, F),
            s1,
            s2,
            s3,
            s4,
            s5,
          )
          objetsCorrection.push(
            codageAngleDroit(D, A, B),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(C, D, A),
          )
          objetsCorrection.push(
            codageSegments(
              '||',
              'black',
              D,
              E,
              E,
              B,
              A,
              E,
              E,
              C,
              F,
              C,
              B,
              F,
              0.8,
            ),
            codageSegments('O', 'black', A, B, D, C, 0.8),
            codageSegments('/', 'black', A, D, B, C, 0.8),
          )
          texte = `$${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$ est un rectangle. Ses diagonales se coupent en $${sommets[4]}$.<br>`
          texte += `$${sommets[4] + sommets[1] + sommets[5] + sommets[2]}$ est un losange.<br>`
          texte +=
            'Représenter cette configuration par un schéma à main levée et ajouter les codages nécessaires.'
          texteCorr =
            'Voilà ci-dessous un schéma qui pourrait convenir à la situation.<br>'
          break
        case 4:
        default:
          B = pointAdistance(
            A,
            randint(6, 7),
            randint(-30, 30),
            sommets[1],
            'above right',
          )
          F = similitude(
            A,
            B,
            randint(-70, -50),
            randint(80, 90) / 100,
            sommets[5],
            'left',
          )
          D = similitude(
            B,
            A,
            angleOriente(A, B, F) + randint(3, 5),
            randint(15, 20) / 10,
            sommets[3],
            'below',
          )
          C = translation2Points(
            pointAbstrait(B.x + 1, B.y + 1),
            A,
            D,
            sommets[2],
            'below right',
          )
          E = pointIntersectionDD(
            droite(A, C),
            droite(D, B),
            sommets[4],
            'above right',
          )
          s3 = polygone(A, B, C, D)
          s4 = segment(B, F)
          s5 = segment(A, F)
          s1 = segment(B, D)
          s2 = segment(A, C)
          paramsEnonce = {
            pixelsParCm: 20,
            scale: 0.7,
            mainlevee: true,
            amplitude: 0.3,
          }
          objetsEnonce.push(labelPoint(A, B, C, D, E, F), s1, s2, s3, s4, s5)
          objetsEnonce.push(
            codageAngle(
              D,
              A,
              B,
              2,
              '|',
              'red',
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              B,
              C,
              D,
              2,
              '|',
              'red',
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              A,
              B,
              F,
              2,
              '|',
              'red',
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              A,
              B,
              C,
              2,
              '||',
              bleuMathalea,
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              A,
              D,
              C,
              2,
              '||',
              bleuMathalea,
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              B,
              A,
              F,
              2,
              '|||',
              'green',
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageAngle(
              B,
              F,
              A,
              2,
              '|||',
              'green',
              2,
              1,
              'none',
              0.2,
              false,
              false,
              '',
              1,
              { echelleMark: 1 },
            ),
          )
          objetsEnonce.push(
            codageSegments('VV', 'black', B, E, E, D, 0.8),
            codageSegments('O', 'black', A, E, E, C, 0.8),
          )
          texte = "À l'aide du schéma ci-dessous, déterminer :<br>"
          texte += `- la nature du triangle $${sommets[0] + sommets[1] + sommets[5]}$ ;<br>`
          texte += `- la nature du quadrilatère $${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$ ;<br>`
          texte += `- la nature de l'angle $\\widehat{${sommets[5] + sommets[1] + sommets[2]}}$.<br>`
          texteCorr = `Le triangle $${sommets[0] + sommets[1] + sommets[5]}$ a deux angles de même mesure, c'est donc un triangle isocèle en $${sommets[1]}$.<br>`
          texteCorr += `Le quadrilatère  $${sommets[0] + sommets[1] + sommets[2] + sommets[3]}$ a des diagonales qui se coupent en leur milieu, c'est donc un parallélogramme.<br>`
          texteCorr +=
            'Dans un parallélogramme, les angles consécutifs sont supplémentaires (leur somme vaut $180^\\circ$).<br>'
          texteCorr += ` D'après le codage, l'angle $\\widehat{${sommets[2] + sommets[1] + sommets[5]}}$ est la somme de deux angles supplémentaires. C'est donc un angle plat.<br>`

          break
      }
      if (objetsEnonce.length > 0) {
        texte += mathalea2d(
          Object.assign(paramsEnonce, fixeBordures(objetsEnonce)),
          objetsEnonce,
        )
      }
      if (objetsCorrection.length > 0) {
        texteCorr += mathalea2d(
          Object.assign(paramsCorrection, fixeBordures(objetsCorrection)),
          objetsCorrection,
        )
      }
      if (this.questionJamaisPosee(i, ...[B.x, B.y, C.x, C.y].map(String))) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
