import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { cercle } from '../../lib/2d/cercle'
import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { Droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { traceCompas } from '../../lib/2d/traceCompas'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionCC,
  pointIntersectionDD,
} from '../../lib/2d/utilitairesPoint'
import { shuffle } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { stringNombre } from '../../lib/outils/texNombre'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = 'Construire un triangle et son cercle circonscrit'
export const dateDePublication = '27/08/2025'

/**
 * Publié le 27/08/2025
 * @author Jean-claude Lhote
 */
export const uuid = 'e0bca'

export const refs = {
  'fr-fr': ['6G6F'],
  'fr-2016': [],
  'fr-ch': ['PRQES02C-4', '9R1ES7C-1', '9R2ES7C-1', '9R3ES7C-1'],
}
export default class ConstruireUnTriangleEtSonCercleCirconscrit extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaire2CaseACocher = ['Ne pas montrer de schéma']
    this.sup2 = false
  }

  nouvelleVersion() {
    let listeDeNomsDePolygones: string[] = []
    for (let i = 0, verif, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      if (i % 5 === 0) listeDeNomsDePolygones = ['PQD']
      const IEP = new Alea2iep()
      const objetsEnonce = []
      const objetsCorrection = []
      if (!this.sup2) {
        texte =
          'Le triangle ci-dessous a été réalisé à main levée.<br>Construire ce triangle avec les instruments de géométrie en respectant les mesures indiquées.<br>Puis tracer son cercle circonscrit.<br>'
      }
      texteCorr = "Voici la construction qu'il fallait réaliser.<br>"
      const nom = creerNomDePolygone(4, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom)
      let sommets = []
      for (let i = 0; i < 3; i++) sommets.push(nom[i])
      sommets = this.seed === 'myriade' ? ['T', 'U', 'V'] : shuffle(sommets)
      sommets.push(nom[3]) // milieu
      const A = pointAbstrait(0, 0, sommets[0], 'left')

      const ac = this.seed === 'myriade' ? 60 : randint(35, 45)
      const lBC = this.seed === 'myriade' ? 4.4 : randint(35, 45, ac) / 10
      const lAB = this.seed === 'myriade' ? 4.3 : randint(46, 60) / 10
      const lAC = ac / 10
      const B =
        this.seed === 'myriade'
          ? pointAdistance(A, lAB, 140, sommets[1])
          : pointAdistance(A, lAB, randint(-45, 45), sommets[1])
      B.positionLabel = 'right'
      const cA = cercle(A, lAC)
      const cB = cercle(B, lBC)
      const C = pointIntersectionCC(
        cA,
        cB,
        sommets[2],
        this.seed === 'myriade' ? 2 : 1,
      )
      C.positionLabel = 'above'
      const CC = pointAbstrait(
        C.x + randint(-5, 5, 0) / 10,
        C.y + randint(-5, 5, 0) / 10,
        sommets[2],
      )
      const d1 = mediatrice(B, A) as Droite
      const d2 = mediatrice(B, C) as Droite
      const d3 = mediatrice(A, C) as Droite
      const cod1 = codageMediatrice(B, A, 'red', '||')
      const cod2 = codageMediatrice(C, B, bleuMathalea, 'O')
      const cod3 = codageMediatrice(A, C, 'green', '//')
      const O = pointIntersectionDD(d1, d2, 'O')
      O.positionLabel = 'above'
      const labO = labelPoint(O)
      const r = longueur(O, A)
      const cO = cercle(O, r)
      objetsEnonce.push(
        afficheLongueurSegment(B, A),
        texteSurSegment(`${stringNombre(segment(B, C).longueur, 1)} cm`, CC, B),
        texteSurSegment(`${stringNombre(segment(A, C).longueur, 1)} cm`, A, CC),
      )
      objetsCorrection.push(
        traceCompas(A, C, 30, 'gray', 1, 2),
        traceCompas(B, C, 30, 'gray', 1, 2),
        afficheLongueurSegment(B, A),
        afficheLongueurSegment(C, B),
        afficheLongueurSegment(A, C),
        d1,
        d2,
        d3,
        cO,
        cod1,
        cod2,
        cod3,
        labO,
      )
      if (this.sup2) {
        texte = `Construire un triangle $${sommets[0]}${sommets[1]}${sommets[2]}$ avec $${sommets[0]}${sommets[1]} = ${stringNombre(lAB)}\\text{ cm}$, $${sommets[1]}${sommets[2]} = ${stringNombre(lBC)}\\text{ cm}$ et $${sommets[0]}${sommets[2]} = ${stringNombre(lAC)}\\text{ cm}$.<br>`
      }
      texteCorr +=
        "Pour cette construction, nous avons utilisé le compas, la règle graduée et l'équerre.<br>L'animation ci-dessous montre une façon de procéder sans équerre.<br>"
      const [aIEP, bIEP, cIEP] =
        this.seed === 'myriade'
          ? IEP.triangle3longueurs('VTU', lAC, lBC, lAB)
          : IEP.triangle3longueurs(sommets.slice(0, 3).join(''), lAB, lAC, lBC)
      IEP.cercleCirconscrit(aIEP, bIEP, cIEP)
      verif = ''
      const T = polygoneAvecNom(A, B, C)
      const TT = polygoneAvecNom(A, B, CC)
      objetsEnonce.push(TT[0], TT[1])
      objetsCorrection.push(T[0], T[1])

      if (!this.sup2) {
        texte +=
          (context.vue === 'diap' ? '<center>' : '') +
          mathalea2d(
            Object.assign(
              { mainlevee: true, amplitude: 0.2, scale: 0.6, pixelsParCm: 30 },
              fixeBordures(objetsEnonce),
            ),
            objetsEnonce,
          ) +
          (context.vue === 'diap' ? '</center>' : '')
      }
      texteCorr +=
        (context.vue === 'diap' ? '<center>' : '') +
        mathalea2d(
          Object.assign({ pixelsParCm: 30 }, fixeBordures(objetsCorrection)),
          objetsCorrection,
        ) +
        (context.vue === 'diap' ? '</center>' : '')
      texteCorr += verif
      texteCorr += IEP.htmlBouton(this.numeroExercice ?? 0, i)

      if (this.questionJamaisPosee(i, lAB, String(lBC), lAC)) {
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
