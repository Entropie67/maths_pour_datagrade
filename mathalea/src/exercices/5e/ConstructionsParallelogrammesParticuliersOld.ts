import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { cercle, cercleCentrePoint } from '../../lib/2d/cercle'
import { cibleCarree, dansLaCibleCarree } from '../../lib/2d/cibles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { traceCompas } from '../../lib/2d/traceCompas'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, similitude } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointIntersectionCC,
  pointIntersectionDD,
} from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Construire des quadrilatères particuliers'
export const dateDeModifImportante = '07/11/2026'
export const dateDePublication = '03/02/2020'
export const amcReady = true
export const amcType = 'AMCHybride'
/**
 * Construction de quadrilatères avec dispositif d'auto-correction aléatoire
 * @author Jean-claude Lhote
 */
export const uuid = '37e37'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ConstructionsParallelogrammesParticuliersOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      4,
      '1 : Figure facile 1\n2 : Figure facile 2 (3 sommets à placer)\n3 : Figure facile 3 \n4 : Figure moins facile 1\n5 : Figure moins facile 2\n6 : Figure moins facile 3\n7 : Figure moins facile 4\n8 : Une des figures faciles choisie au hasard\n9 : Une des figures moins faciles choisie au hasard\n10 : Une de toutes ces figures choisie au hasard',
    ]
    this.besoinFormulaire2Numerique = [
      'Taille des cases de la grille',
      3,
      '1 : taille 0,4cm\n2 : taille 0,6 cm\n3 : taille 0,8cm',
    ]
    this.besoinFormulaire3CaseACocher = ['Cibles pour la correction']
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 8
    this.sup2 = 2
    this.sup3 = true
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const tailleGrille = 0.2 + this.sup2 * 0.2
    let texte = ''
    let texteCorr = ''
    const celluleAlea = function (rang: number) {
      const lettre = lettreDepuisChiffre(randint(1, rang))
      const chiffre = Number(randint(1, rang)).toString()
      return lettre + chiffre
    }
    // On prépare la figure...
    const noms = choisitLettresDifferentes(5, 'QOX', true) // on choisit 5 lettres, les 4 premières sont les sommets, la 5e est le centre
    const nom = noms[0] + noms[1] + noms[2] + noms[3]
    let A,
      B,
      C,
      D,
      O,
      d1,
      d2,
      c1,
      c2,
      c3,
      c4,
      alpha,
      tri,
      t1,
      t2,
      t3,
      t4,
      t5,
      dd1,
      dd2
    const objetsEnonce = []
    const objetsCorrection = []
    let typesDeQuestionsDisponibles
    let xm, ym, xM, yM
    if (this.sup < 8) typesDeQuestionsDisponibles = [this.sup]
    else if (this.sup === 8) typesDeQuestionsDisponibles = [randint(1, 3)]
    else if (this.sup === 9) typesDeQuestionsDisponibles = [randint(4, 7)]
    else typesDeQuestionsDisponibles = [randint(1, 7)]

    const typeDeQuestion = choice(typesDeQuestionsDisponibles)
    switch (typeDeQuestion) {
      case 1:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(35, 45) // 2 AB
        c4 = randint(30, 40, c1) // 5 AD
        d1 = Math.abs(c4 - c1) + 15
        d2 = c1 + c4 - 15
        c1 = c1 / 5
        c4 = c4 / 5
        d1 = randint(Math.min(d1, d2), Math.max(d1, d2)) / 5 // BD
        B = pointAdistance(A, c1, randint(-30, 30), noms[1])
        D = pointIntersectionCC(cercle(A, c4), cercle(B, d1), noms[3])
        O = milieu(B, D, noms[4])
        C = rotation(A, O, 180, noms[2])
        texte = `$${nom}$ est un parallélogramme tel que `
        texte += `$${noms[0] + noms[1]}=${texNombre(c1)}\\text{ cm}$, $${noms[0] + noms[3]}=${texNombre(c4)}\\text{ cm}$, $${noms[1] + noms[3]}=${texNombre(d1)}\\text{ cm}$.<br>`
        objetsEnonce.push(tracePoint(A, B), labelPoint(A, B))
        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme, ses diagonales se coupent en leur milieu.<br>`
          texteCorr += `Nommons $${noms[4]}$, le milieu de $[${noms[1] + noms[3]}]$. $${noms[2]}$ est le symétrique de $${noms[0]}$ par rapport à $${noms[4]}$.`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[3]}$.<br>Puis plaçons $${noms[4]}$, le milieu de $[${noms[1] + noms[3]}]$ et enfin le point $${noms[2]}$.<br>`
        }
        if (longueur(B, D) !== longueur(A, C)) {
          texteCorr += `Comme $${noms[0] + noms[3]}\\ne ${noms[0] + noms[1]}$ et que $${noms[0] + noms[2]}\\ne ${noms[3] + noms[1]}$, le paralélogramme $${nom}$ n'est ni un losange, ni un rectangle.<br>`
          texteCorr += `$${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras("n'est pas un parallélogramme particulier")}.<br>`
        } else {
          texteCorr += `Comme $$${noms[0] + noms[2]} = ${noms[3] + noms[1]}$ et que $${noms[0] + noms[3]}\\ne ${noms[0] + noms[1]}$, le paralélogramme $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras('est un rectangle')}.<br>`
        }
        objetsCorrection.push(
          afficheLongueurSegment(A, B, 'black', -0.5),
          afficheLongueurSegment(A, D, 'black', 0.5),
        )
        t1 = traceCompas(A, D, 15)
        t2 = traceCompas(B, D, 15)
        t3 = traceCompas(O, C, 20)
        tri = polygoneAvecNom(A, B, D)
        xm = Math.min(A.x, B.x, D.x) - 0.8
        ym = Math.min(A.y, B.y, D.y) - 0.8
        xM = Math.max(A.x, B.x, D.x) + 0.8
        yM = Math.max(A.y, B.y, D.y) + 0.8
        break
      case 2:
        O = pointAbstrait(0, 0, noms[4])
        c1 = randint(35, 45) * 2 // AC
        c4 = randint((c1 + 20) / 2, 70) / 5 // BD
        c1 = c1 / 10
        alpha = randint(80, 100, [90, 89, 91])

        A = pointAdistance(O, c1 / 2, randint(30, 60), noms[0])
        B = similitude(A, O, alpha, c4 / c1, noms[1])
        D = rotation(B, O, 180, noms[3])
        C = rotation(A, O, 180, noms[2])
        texte = `$${nom}$ est un parallélogramme de centre $${noms[4]}$ tel que `
        texte += `$${noms[0] + noms[2]}=${texNombre(c1)}\\text{ cm}$, $${noms[1] + noms[3]}=${texNombre(c4)}\\text{ cm}$ et $\\widehat{${noms[0] + noms[4] + noms[1]}}=${alpha}^\\circ$ dans le sens inverse des aiguilles d'une montre.<br>`
        objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme, ses diagonales se coupent en leur milieu $${noms[4]}$.<br>`
          texteCorr += `$${noms[2]}$ est le symétrique de $${noms[0]}$ par rapport à $${noms[4]}$. La distance $${noms[4] + noms[1]}$ est égale à la moitié de $${noms[1] + noms[3]}$.<br>`
          texteCorr += `Construisons tout d'abord le point $${noms[2]}$ symétrique de $${noms[0]}$ par rapport à $${noms[4]}$.<br>`
          texteCorr += `Construisons ensuite un angle $\\widehat{${noms[0] + noms[4] + 'x'}}$ de mesure $${alpha}^\\circ$ dans le sens inverse des aiguilles d'une montre.<br>`
          texteCorr += `Construisons enfin le point $${noms[1]}$ sur $[${noms[4]}x)$ et son symétrique $${noms[3]}$ par rapport à $${noms[4]}$ situés tous les deux à $${texNombre(arrondi(c4 / 2))}\\text{ cm}$ de $${noms[4]}$.<br>`
        }
        texteCorr += `$${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras("n'est pas un parallélogramme particulier")}.<br>`
        xm = Math.min(A.x, B.x, C.x) - 0.8
        ym = Math.min(A.y, B.y, C.y) - 0.8
        xM = Math.max(A.x, B.x, C.x) + 0.8
        yM = Math.max(A.y, B.y, C.y) + 0.8
        break
      case 3:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(35, 45) * 2 // AB
        c4 = randint(25, 34) / 5 // AD
        c1 = c1 / 10

        B = pointAdistance(A, c1, randint(0, 30), noms[1])
        D = similitude(B, A, 90, c4 / c1, noms[3])
        O = milieu(B, D, noms[4])
        C = rotation(A, O, 180, noms[2])
        texte = `$${nom}$ est un parallélogramme tel que `
        texte += `$${noms[0] + noms[1]}=${texNombre(c1)}\\text{ cm}$, $${noms[0] + noms[3]}=${texNombre(c4)}\\text{ cm}$, $${noms[1] + noms[3]}=${noms[0] + noms[2]}$.<br>`
        objetsEnonce.push(tracePoint(A, B), labelPoint(A, B))

        if (this.correctionDetaillee) {
          texteCorr += `Désignons $${noms[4]}$ le milieu de $[${noms[1] + noms[3]}]$. $${noms[2]}$ est le symétrique de $${noms[0]}$ par rapport à $${noms[4]}$.<br>`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[3]}$ puis $${noms[4]}$ au milieu de $[${noms[1] + noms[3]}]$.<br>`
          texteCorr += `Les quatre sommets de $${nom}$ sont sur le cercle de centre $${noms[4]}$ passant par $${noms[0]}$. $[${noms[0]}${noms[2]}]$ et $[${noms[1]}${noms[3]}]$ sont des diamètres de ce cercle.<br>`
        }
        texteCorr += `Comme $${nom}$ est un parallélogramme dont les diagonales ont la même longueur, $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras('est donc un rectangle')}.<br>`
        objetsCorrection.push(
          afficheLongueurSegment(A, B, 'black', -0.5),
          afficheLongueurSegment(A, D, 'black', 0.5),
        )
        t1 = cercleCentrePoint(O, A, 'gray')
        t1.opacite = 0.5
        t3 = traceCompas(O, C, 20)
        tri = polygoneAvecNom(A, B, D)
        xm = Math.min(A.x, B.x, D.x) - 0.8
        ym = Math.min(A.y, B.y, D.y) - 0.8
        xM = Math.max(A.x, B.x, D.x) + 0.8
        yM = Math.max(A.y, B.y, D.y) + 0.8

        break
      case 4:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(35, 50) // AB
        c1 = c1 / 5
        c4 = (1.2 + randint(0, 8) / 20) * c1 // BD

        B = pointAdistance(A, c1, randint(0, 30), noms[1])
        D = pointIntersectionCC(cercle(A, c1), cercle(B, c4), noms[3])
        O = milieu(B, D, noms[4])
        C = rotation(A, O, 180, noms[2])

        texte = `$${nom}$ est un parallélogramme tel que `
        texte += `$${noms[0] + noms[1]}=${texNombre(c1)}\\text{ cm}$, $${noms[1] + noms[3]}=${texNombre(c4)}\\text{ cm}$, $[${noms[0] + noms[2]}]\\perp [${noms[1] + noms[3]}]$.<br>`
        objetsEnonce.push(tracePoint(A, B), labelPoint(A, B))

        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme dont les diagonales sont perpendiculaires, c'est un losange et alors `
          texteCorr += `le triangle $${noms[0] + noms[1] + noms[3]}$ est isocèle en $${noms[0]}$.<br>`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[3]}$ puis $${noms[4]}$, le milieu de $[${noms[1] + noms[3]}]$ et enfin le point $${noms[2]}$.<br>`
        }
        texteCorr += `Comme $${nom}$ est un parallélogramme dont les diagonales sont perpendiculaires, $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras('est donc un losange')}.<br>`
        objetsCorrection.push(
          afficheLongueurSegment(A, B, 'black', -0.5),
          afficheLongueurSegment(A, D, 'black', 0.5),
        )
        t1 = traceCompas(A, D, 15)
        t2 = traceCompas(B, D, 15)
        t3 = traceCompas(O, C, 20)
        tri = polygoneAvecNom(A, B, D)
        xm = Math.min(A.x, B.x, D.x) - 0.8
        ym = Math.min(A.y, B.y, D.y) - 0.8
        xM = Math.max(A.x, B.x, D.x) + 0.8
        yM = Math.max(A.y, B.y, D.y) + 0.8
        break
      case 5:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(35, 45) * 2 // AC
        c4 = randint((c1 - 4) / 2, 35) / 5 // AD
        c1 = c1 / 10
        alpha = randint(95, 120)
        B = pointAdistance(A, c1, randint(-30, 30), noms[1])
        D = similitude(B, A, alpha, c4 / c1, noms[3])
        O = milieu(B, D, noms[4])
        C = rotation(A, O, 180, noms[2])
        texte = `$${nom}$ est un parallélogramme de centre $${noms[4]}$ tel que `
        texte += `$${noms[0] + noms[1]}=${texNombre(c1)}\\text{ cm}$, $${noms[0] + noms[3]}=${texNombre(c4)}\\text{ cm}$ et $\\widehat{${noms[1] + noms[2] + noms[3]}}=${alpha}^\\circ$ dans le sens inverse des aiguilles d'une montre.<br>`
        objetsEnonce.push(tracePoint(A, B), labelPoint(A, B))
        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme, ses angles opposés ont la même mesure, donc $\\widehat{${noms[3] + noms[0] + noms[1]}}=${alpha}^\\circ$.<br>`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[3]}$.<br>`
          texteCorr += `Désignons $${noms[4]}$ le milieu de $[${noms[1] + noms[3]}]$.<br>`
          texteCorr += `Construisons ensuite le point $${noms[2]}$ symétrique de $${noms[0]}$ par rapport à $${noms[4]}$, milieu de $[${noms[1] + noms[3]}]$.<br>`
        }
        texteCorr += `Comme $${nom}$ est un parallélogramme qui ne possède pas d'angle droit et que ses côtés consécutifs sont de longueurs différentes, `
        texteCorr += `$${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras("n'est pas un parallélogramme particulier")}.<br>`
        t1 = traceCompas(A, D, 15)
        t2 = traceCompas(A, B, 15)
        t3 = traceCompas(O, C, 20)
        tri = polygoneAvecNom(A, B, D)
        xm = Math.min(A.x, B.x, D.x) - 0.8
        ym = Math.min(A.y, B.y, D.y) - 0.8
        xM = Math.max(A.x, B.x, D.x) + 0.8
        yM = Math.max(A.y, B.y, D.y) + 0.8
        break
      case 6:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(35, 45) * 2 // AC
        c2 = randint(15, 20) * 2 // AO
        c3 = c1 + randint(7, 10) * 2 - c2 // BO
        c1 = c1 / 10
        c2 = c2 / 10
        c3 = c3 / 10

        B = pointAdistance(A, c1, randint(-30, 30), noms[1])
        O = pointIntersectionCC(cercle(A, c2), cercle(B, c3), noms[4])
        C = rotation(A, O, 180, noms[2])
        D = rotation(B, O, 180, noms[3])
        texte = `$${nom}$ est un parallélogramme de centre $${noms[4]}$ tel que `
        texte += `$${noms[0] + noms[1]}=${texNombre(c1)}\\text{ cm}$, $${noms[4] + noms[2]}=${texNombre(c2)}\\text{ cm}$ et $${noms[4] + noms[3]}=${texNombre(c3)}\\text{ cm}$.<br>`
        objetsEnonce.push(tracePoint(A, B), labelPoint(A, B))
        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme, ses diagonales se coupent en leur milieu $${noms[4]}$.<br>`
          texteCorr += `On en déduit que $${noms[0] + noms[4]}=${noms[4] + noms[2]}=${texNombre(c2)}\\text{ cm}$ et que $${noms[1] + noms[4]}=${noms[4] + noms[3]}=${texNombre(c3)}\\text{ cm}$.<br>`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[4]}$ `
          texteCorr += `puis les points $${noms[2]}$ et $${noms[3]}$ symétriques respectifs de $${noms[0]}$ et $${noms[1]}$ par rapport à $${noms[4]}$.<br>`
        }
        if (c1 * c1 !== c2 * c2 + c3 * c3) {
          texteCorr += `D'après la contraposée du théorème de Pythagore, le triangle $${noms[0] + noms[1] + noms[4]}$ n'est pas un triangle rectangle, donc les diagonales ne sont pas perpendiculaires.<br>`
          if (c2 === c3)
            texteCorr += `Les diagonales ont la même longueur. $${nom}$ est un parallélogramme dont les diagonales sont de même longueur, $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras('est donc un rectangle')}.<br>`
          else
            texteCorr += `De plus, elles n'ont pas la même longueur, donc $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras("n'est pas un parallélogramme particulier")}.<br>`
        } else {
          texteCorr += `Le triangle $${noms[0] + noms[1] + noms[4]}$ est un triangle rectangle, donc les diagonales sont perpendiculaires.<br>`
          if (c2 === c3)
            texteCorr += `de plus les diagonales ont même longueur. $${nom}$ est un parallélogramme dont les diagonales sont perpendiculaires et de même longueur, $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras('est donc un carré')}.<br>`
        }
        texteCorr += '.<br>'
        t1 = traceCompas(A, O, 20)
        t2 = traceCompas(B, O, 20)
        t3 = traceCompas(O, C, 30)
        t4 = traceCompas(O, D, 30)

        tri = polygoneAvecNom(A, B, O)
        xm = Math.min(A.x, B.x, O.x) - 0.8
        ym = Math.min(A.y, B.y, O.y) - 0.8
        xM = Math.max(A.x, B.x, O.x) + 0.8
        yM = Math.max(A.y, B.y, O.y) + 0.8
        break
      case 7:
      default:
        A = pointAbstrait(0, 0, noms[0])
        c1 = randint(50, 60) / 5 // AC
        c2 = randint(25, 40) // angle OAB
        c3 = randint(30, 45, c2) // angle OCB

        C = pointAdistance(A, c1, randint(-30, 30), noms[2])
        O = milieu(A, C, noms[4])
        B = rotation(C, A, c2)
        dd1 = droite(A, B)
        D = rotation(A, C, -c3)
        dd2 = droite(C, D)
        B = pointIntersectionDD(dd1, dd2, noms[1])
        D = rotation(B, O, 180, noms[3])
        texte = `$${nom}$ est un parallélogramme de centre $${noms[4]}$ tel que `
        texte += `$${noms[0] + noms[2]}=${texNombre(c1)}\\text{ cm}$.<br>$\\widehat{${noms[4] + noms[0] + noms[1]}}=${c2}^\\circ$ dans le sens inverse des aiguilles d'une montre.<br>$\\widehat{${noms[4] + noms[2] + noms[1]}}=${c3}^\\circ$ dans le sens des aiguilles d'une montre.<br>`
        objetsEnonce.push(tracePoint(A, C), labelPoint(A, C))
        if (this.correctionDetaillee) {
          texteCorr += `Comme $${nom}$ est un parallélogramme, ses côtés opposés sont parallèles.<br>`
          texteCorr += `La diagonale $[${noms[0]}${noms[2]}]$ forme des angles $\\widehat{${noms[4] + noms[0] + noms[1]}}$ et $\\widehat{${noms[4] + noms[2] + noms[3]}}$ alternes-internes égaux.<br>`
          texteCorr += `De même les angles $\\widehat{${noms[4] + noms[0] + noms[3]}}$ et $\\widehat{${noms[4] + noms[2] + noms[1]}}$ sont alternes-internes égaux eux aussi.<br>`
          texteCorr += `On en déduit que $\\widehat{${noms[4] + noms[0] + noms[3]}}=\\widehat{${noms[4] + noms[2] + noms[1]}}=${miseEnEvidence(c3, 'red')}^\\circ$ et que $\\widehat{${noms[4] + noms[0] + noms[1]}}=\\widehat{${noms[4] + noms[2] + noms[3]}}=${miseEnEvidence(c2, bleuMathalea)}^\\circ$.<br>`
          texteCorr += `Construisons tout d'abord le triangle $${noms[0] + noms[1] + noms[2]}$ `
          texteCorr += `puis le point $${noms[3]}$ symétrique de $${noms[1]}$ par rapport à $${noms[4]}$.<br>`
        }

        texteCorr += `Le triangle $${noms[0] + noms[1] + noms[2]}$ n'est pas un triangle isocèle car ses angles ne sont pas égaux.<br>`
        texteCorr += `De plus, dans ce triangle $${noms[0] + noms[1] + noms[2]}$, l'angle $\\widehat{${noms[0] + noms[1] + noms[2]}}$ mesure $${180 - c2 - c3}^\\circ$ et n'est pas droit donc $${miseEnEvidence(nom)}$ ${texteEnCouleurEtGras("n'est pas un parallélogramme particulier")}.<br>`
        t1 = afficheMesureAngle(
          O,
          A,
          B,
          bleuMathalea,
          1,
          texNombre(c2) + '^\\circ',
        )

        t2 = afficheMesureAngle(O, C, B, 'red', 1, texNombre(c3) + '^\\circ')
        t3 = traceCompas(O, D, 30)
        t5 = tracePoint(O)
        t5.style = '+'
        objetsCorrection.push(t1, t2)
        tri = polygoneAvecNom(A, B, C)
        xm = Math.min(A.x, B.x, C.x) - 0.8
        ym = Math.min(A.y, B.y, C.y) - 0.8
        xM = Math.max(A.x, B.x, C.x) + 0.8
        yM = Math.max(A.y, B.y, C.y) + 0.8
        break
    }
    let texteAMC = texte + `Construire le parallélogramme $${nom}$<br><br>`
    texte += `Préciser si c'est un parallélogramme particulier puis construire le parallélogramme $${nom}$.<br>`
    texteAMC +=
      'Les sommets manquants devraient se trouver respectivement dans les cibles ci-dessous.'
    texteAMC +=
      '<br>Une fois la construction terminée et afin de vérifier votre soin, noircir, ci-contre, pour chacune des cibles,'
    texteAMC +=
      ' la lettre et le chiffre correspondants à la case dans laquelle se trouve le sommet construit.'

    const p = polygoneAvecNom(A, B, C, D)
    const polygoneInvisible = polygone(A, B, C, D)
    polygoneInvisible.opacite = 0 // Pour qu'il y ait la place du 4e sommet
    objetsEnonce.push(polygoneInvisible)

    const cellule1 = celluleAlea(5)
    const cellule2 = celluleAlea(5)
    const cellule3 = celluleAlea(5)
    const result3 = dansLaCibleCarree(B.x, B.y, 5, tailleGrille, cellule3)
    const result2 = dansLaCibleCarree(C.x, C.y, 5, tailleGrille, cellule2)
    const result1 = dansLaCibleCarree(D.x, D.y, 5, tailleGrille, cellule1)
    const cible1 = cibleCarree({
      x: result1[0],
      y: result1[1],
      rang: 5,
      num: typeDeQuestion === 7 ? 2 : 3,
      taille: tailleGrille,
      color: 'gray',
    })
    const cible2 = cibleCarree({
      x: result2[0],
      y: result2[1],
      rang: 5,
      num: 2,
      taille: tailleGrille,
      color: 'gray',
    })
    const cible3 = cibleCarree({
      x: result3[0],
      y: result3[1],
      rang: 5,
      num: 1,
      taille: tailleGrille,
      color: 'gray',
    })
    dd1 = segment(O, A)
    dd2 = segment(O, B)
    const dd3 = segment(O, C)
    const dd4 = segment(O, D)

    switch (typeDeQuestion) {
      case 1:
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              objetsCorrection,
              t1!,
              t2!,
              tri![0],
              tri![1],
              afficheLongueurSegment(D, B),
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t3)
        objetsCorrection.push(
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
          afficheLongueurSegment(O, B),
        )
        if (this.sup3) {
          objetsEnonce.push(cible1, cible2)
          objetsCorrection.push(cible1, cible2)
        }
        break
      case 2:
        // if (this.correctionDetaillee) texteCorr += mathalea2d({ xmin: xm, ymin: ym, xmax: xM, ymax: yM, pixelsParCm: 25, scale: 1 }, codageSegments('||', 'red', A, O, O, C), t3, dd1, dd3, dd2, afficheMesureAngle(A, O, B, 'black', 1, alpha + '^\\circ'), tracePoint(A, O, C), labelPoint(A, O, C), texteParPosition('x', B.x - 0.5, B.y), afficheLongueurSegment(A, O), afficheLongueurSegment(O, C)) + '<br>'
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              codageSegments('||', 'red', A, O, O, C),
              dd1,
              dd3,
              dd2,
              afficheMesureAngle(A, O, B, 'black', 1, alpha + '^\\circ'),
              tracePoint(A, O, C),
              labelPoint(A, O, C),
              texteParPosition('x', B.x - 0.5, B.y),
              afficheLongueurSegment(A, O),
              afficheLongueurSegment(O, C),
            ) + '<br>'
        // objetsCorrection.push(p[0], p[1], t3, afficheLongueurSegment(O, D))
        objetsCorrection.push(p[0], p[1], afficheLongueurSegment(O, D))
        objetsCorrection.push(
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
          afficheMesureAngle(A, O, B, 'black', 1, alpha + '^\\circ'),
        )
        if (this.sup3) {
          objetsEnonce.push(cible3, cible2, cible1)
          objetsCorrection.push(cible3, cible2, cible1)
        }
        break
      case 3:
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              objetsCorrection,
              tri![0],
              tri![1],
              codageAngleDroit(D, A, B),
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t1, t3)
        objetsCorrection.push(
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('||', 'red', B, O, O, D),
        )
        if (this.sup3) {
          objetsEnonce.push(cible1, cible2)
          objetsCorrection.push(cible1, cible2)
        }
        break
      case 4:
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              objetsCorrection,
              tri![0],
              tri![1],
              afficheLongueurSegment(D, B),
              t2!,
              traceCompas(A, B, 60),
              traceCompas(A, D, 60),
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t3, afficheLongueurSegment(O, B))
        objetsCorrection.push(
          codageAngleDroit(A, O, D),
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
        )
        if (this.sup3) {
          objetsEnonce.push(cible1, cible2)
          objetsCorrection.push(cible1, cible2)
        }
        break
      case 5:
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              tri![0],
              tri![1],
              demiDroite(A, B),
              demiDroite(A, D),
              afficheMesureAngle(B, A, D, 'black', 1, alpha + '^\\circ'),
              afficheLongueurSegment(A, B),
              afficheLongueurSegment(A, D),
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t3)
        objetsCorrection.push(
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
          afficheMesureAngle(B, A, D, 'black', 1, alpha + '^\\circ'),
          afficheLongueurSegment(B, A),
          afficheLongueurSegment(A, D),
          afficheLongueurSegment(C, B),
          afficheLongueurSegment(D, C),
        )
        if (this.sup3) {
          objetsEnonce.push(cible1, cible2)
          objetsCorrection.push(cible1, cible2)
        }
        break
      case 6:
        // if (this.correctionDetaillee) texteCorr += mathalea2d({ xmin: xm, ymin: ym, xmax: xM, ymax: yM, pixelsParCm: 25, scale: 1 }, objetsCorrection, tri[0], tri[1], afficheLongueurSegment(B, A), afficheLongueurSegment(O, B), afficheLongueurSegment(A, O), t1, t2, t5) + '<br>'
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              objetsCorrection,
              tri![0],
              tri![1],
              afficheLongueurSegment(B, A),
              afficheLongueurSegment(O, B),
              afficheLongueurSegment(A, O),
              t1!,
              t2!,
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t3, t4)
        objetsCorrection.push(
          cible1,
          cible2,
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
        )
        if (this.sup3) {
          objetsEnonce.push(cible1, cible2)
          objetsCorrection.push(cible1, cible2)
        }
        break
      case 7:
      default:
        if (this.correctionDetaillee)
          texteCorr +=
            mathalea2d(
              {
                xmin: xm,
                ymin: ym,
                xmax: xM,
                ymax: yM,
                pixelsParCm: 25,
                scale: 1,
              },
              objetsCorrection,
              tri![0],
              tri![1],
              afficheLongueurSegment(C, O),
              afficheLongueurSegment(O, A),
              labelPoint(O),
              t5!,
              codageSegments('||', 'red', A, O, O, C),
            ) + '<br>'
        objetsCorrection.push(p[0], p[1], t3)
        objetsCorrection.push(
          t1,
          t2,
          t3,
          dd1,
          dd2,
          dd3,
          dd4,
          labelPoint(O),
          codageSegments('||', 'red', A, O, O, C),
          codageSegments('|||', bleuMathalea, B, O, O, D),
          afficheMesureAngle(O, A, D, 'red', 1, texNombre(c3!) + '^\\circ'),
          afficheMesureAngle(
            O,
            C,
            D,
            bleuMathalea,
            1,
            texNombre(c2!) + '^\\circ',
          ),
        )
        if (this.sup3) {
          objetsEnonce.push(cible3, cible1)
          objetsCorrection.push(cible3, cible1)
        }
        break
    }
    texte += mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.7 },
        fixeBordures(objetsEnonce),
      ),
      objetsEnonce,
    )
    texteAMC +=
      '<br>' +
      mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.7 },
          fixeBordures(objetsEnonce),
        ),
        objetsEnonce,
      )
    texteCorr += mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.7 },
        fixeBordures(objetsCorrection.filter((el) => el != null)),
      ),
      objetsCorrection.filter((el) => el != null),
    )

    if (context.isAmc) {
      // Construction des QCM valables en AMC
      const reponseLettres = ['A', 'B', 'C', 'D', 'E']
      const reponseChiffres = ['1', '2', '3', '4', '5']

      const propositionsQcm1 = []
      for (let ee = 0; ee < 5; ee++) {
        propositionsQcm1.push({
          texte: reponseLettres[ee],
          statut: cellule3[0] === reponseLettres[ee],
        })
      }

      const propositionsQcm2 = []
      for (let ee = 0; ee < 5; ee++) {
        propositionsQcm2.push({
          texte: String(ee + 1),
          statut: cellule3[1] === reponseChiffres[ee],
        })
      }

      const propositionsQcm3 = []
      for (let ee = 0; ee < 5; ee++) {
        propositionsQcm3.push({
          texte: reponseLettres[ee],
          statut:
            typeDeQuestion === 7
              ? cellule1[0] === reponseLettres[ee]
              : cellule2[0] === reponseLettres[ee],
        })
      }

      const propositionsQcm4 = []
      for (let ee = 0; ee < 5; ee++) {
        propositionsQcm4.push({
          texte: String(ee + 1),
          statut:
            typeDeQuestion === 7
              ? cellule1[1] === reponseChiffres[ee]
              : cellule2[1] === reponseChiffres[ee],
        })
      }

      this.autoCorrectionAMC[0] = {}
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
      this.autoCorrectionAMC[0].options = {
        ordered: true,
        barreseparation: true,
        multicolsAll: true,
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
      this.autoCorrectionAMC[0].enonce = ''
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0]) // texte
      this.autoCorrectionAMC[0].propositions = [
        {
          type: 'AMCOpen',
          propositions: [
            {
              texte: texteCorr,
              enonce: texteAMC,
              statut: 0,
              sanscadre: true,
            },
          ],
        },
        {
          type: 'qcmMono',
          propositions: propositionsQcm1,
          enonce:
            numAlpha(0) +
            'Pour la cible 1 : <br>Lettre de la case du sommet construit, dans la cible 1',
        },
        {
          type: 'qcmMono',
          propositions: propositionsQcm2,
          enonce: 'Chiffre de la case du sommet construit, dans la cible 1',
        },
        {
          type: 'qcmMono',
          propositions: propositionsQcm3,
          enonce:
            '\\vspace{1cm}' +
            numAlpha(1) +
            'Pour la cible 2 : <br>Lettre de la case du sommet construit, dans la cible 2',
        },
        {
          type: 'qcmMono',
          propositions: propositionsQcm4,
          enonce: 'Chiffre de la case du sommet construit, dans la cible 2',
        },
      ]
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])

      if (typeDeQuestion === 2) {
        const propositionsQcm5 = []
        for (let ee = 0; ee < 5; ee++) {
          propositionsQcm5.push({
            texte: reponseLettres[ee],
            statut: cellule1[0] === reponseLettres[ee],
          })
        }

        const propositionsQcm6 = []
        for (let ee = 0; ee < 5; ee++) {
          propositionsQcm6.push({
            texte: ee + 1,
            statut: cellule1[1] === reponseChiffres[ee],
          })
        }
        this.autoCorrectionAMC[0].propositions.push(
          {
            type: 'qcmMono',
            propositions: propositionsQcm3,
            enonce:
              '\\vspace{1cm}' +
              numAlpha(2) +
              'Pour la cible 3 : <br>Lettre de la case du sommet construit, dans la cible 3',
          },
          {
            type: 'qcmMono',
            propositions: propositionsQcm4,
            enonce: 'Chiffre de la case du sommet construit, dans la cible 3',
          },
        )
      }
    }

    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
  }
}
