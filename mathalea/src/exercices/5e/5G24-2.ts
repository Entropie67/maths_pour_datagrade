import { bleuMathalea } from '../../lib/colors'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { vecteur } from '../../lib/2d/Vecteur'
import { codageAngle } from '../../lib/2d/angles'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { barycentre, nommePolygone } from '../../lib/2d/polygones'
import { rotation, translation } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { texteEnCouleur, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Justifier que deux triangles sont égaux'

export const interactifReady = true // pour définir qu'exercice peut s'afficher en mode interactif.
// 'mathLive'
export const amcReady = true // pour définir que l'exercice peut servir à AMC
export const amcType = 'qcmMono'

/**
 * Deux triangles égaux sont codés, il faut reconnaitre les côtés homologues
 * @author Rémi Angot

*/
export const uuid = 'b9a52'

export const refs = {
  'fr-fr': ['5G24-2'],
  'fr-ch': [],
}
export default class TrianglesEgaux extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.sup = 6
    this.spacing = 2

    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : CCC\n2 : CAC\n3 : ACA\n4 : AAA\n5 : CC\n6 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['CCC', 'CAC', 'ACA', 'AAA', 'CC'],
    })
    if (this.interactif || context.isAmc) {
      this.consigne = 'Cocher la bonne réponse'
      this.spacing = 1
    } else {
      this.consigne =
        "Les triangles sont-ils égaux ? S'ils sont égaux, justifier la réponse."
    }
    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const listeDeNomsDePolygones: string[] = []
      texte = ''
      texteCorr = ''
      let trianglesEgaux = true
      if (i % 3 === 0) listeDeNomsDePolygones.push('QD')
      // Boucle principale où i+1 correspond au numéro de la question
      let l1 = randint(40, 70)
      let l2 = randint(40, 80, l1)
      let l3 = randint(40, l1 + l2 - 10, [l1, l2])
      l1 /= 10
      l2 /= 10
      l3 /= 10
      let A = pointAbstrait(0, 0)
      let B = pointAdistance(A, l1)
      const p1 = triangle2points2longueurs(A, B, l2, l3)
      const C = p1.listePoints[2]
      const O = barycentre(p1)
      const v = vecteur(
        Math.max(
          Math.abs(A.x - B.x),
          Math.abs(C.x - B.x),
          Math.abs(A.x - C.x),
        ) + 4,
        0,
      )
      const O2 = translation(O, v)
      const temp = translation(p1, v)
      temp.isVisible = false
      const p2 = rotation(temp, O2, randint(0, 360))
      const D = p2.listePoints[0]
      const E = p2.listePoints[1]
      const F = p2.listePoints[2]
      const code1 = codageSegment(A, B, '|')
      const code2 = codageSegment(D, E, '|')
      const code3 = codageSegment(B, C, '||')
      const code4 = codageSegment(E, F, '||')
      const code5 = codageSegment(C, A, '|||')
      const code6 = codageSegment(F, D, '|||')
      const codeA1 = codageAngle(A, B, C, 0.8, '|')
      const codeA2 = codageAngle(D, E, F, 0.8, '|')
      const codeA3 = codageAngle(B, C, A, 0.8, '||')
      const codeA4 = codageAngle(E, F, D, 0.8, '||')
      const codeA5 = codageAngle(C, A, B, 0.8, '|||')
      const codeA6 = codageAngle(F, D, E, 0.8, '|||')
      const nom1 = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom1)
      const nom2 = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom2)
      const nommeP1 = nommePolygone(p1, nom1)
      A = p1.listePoints[0]
      B = p1.listePoints[1]
      const nommeP2 = nommePolygone(p2, nom2)
      const objetsAAfficher = []
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'CCC':
          objetsAAfficher.push(
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            code5,
            code6,
            nommeP1,
            nommeP2,
          )
          texteCorr = `$${A.nom}${B.nom} = ${D.nom}${E.nom}$<br>
            $${B.nom}${C.nom} = ${E.nom}${F.nom}$<br>
            $${C.nom}${A.nom} = ${F.nom}${D.nom}$<br>
            Les triangles ${nom1} et ${nom2} ont leurs trois côtés deux à deux de même longueur.<br>
            Ils sont donc ${texteEnCouleurEtGras('égaux')}.`
          trianglesEgaux = true
          break
        case 'CAC':
          objetsAAfficher.push(
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            codeA1,
            codeA2,
            nommeP1,
            nommeP2,
          )
          texteCorr = `$${A.nom}${B.nom} = ${D.nom}${E.nom}$<br>
            $${B.nom}${C.nom} = ${E.nom}${F.nom}$<br>
            $\\widehat{${A.nom}${B.nom}${C.nom}} = \\widehat{${D.nom}${E.nom}${F.nom}}$<br>
            Les triangles ${nom1} et ${nom2} ont un angle de même mesure compris entre deux côtés deux à deux de même longueur.<br>
            Ils sont donc ${texteEnCouleurEtGras('égaux')}.`
          trianglesEgaux = true
          break
        case 'ACA':
          objetsAAfficher.push(
            p1,
            p2,
            code1,
            code2,
            codeA1,
            codeA2,
            codeA5,
            codeA6,
            nommeP1,
            nommeP2,
          )
          texteCorr = `$${A.nom}${B.nom} = ${D.nom}${E.nom}$<br>
            $\\widehat{${B.nom}${A.nom}${C.nom}} = \\widehat{${E.nom}${D.nom}${F.nom}}$<br>
            $\\widehat{${A.nom}${B.nom}${C.nom}} = \\widehat{${D.nom}${E.nom}${F.nom}}$<br>
            Les triangles ${nom1} et ${nom2} ont un côté de même longueur compris entre deux angles deux à deux de même mesure.<br>
            Ils sont donc ${texteEnCouleurEtGras('égaux')}.`
          trianglesEgaux = true
          break
        case 'AAA':
          objetsAAfficher.push(
            p1,
            p2,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
            nommeP2,
          )
          texteCorr = `${texteEnCouleurEtGras('On ne peut pas déterminer')} si ces triangles sont égaux. Ils ont la même forme mais leurs longueurs peuvent être différentes. On dit qu'ils sont ${texteEnCouleur('semblables', bleuMathalea)}.`
          trianglesEgaux = false
          break
        case 'CC':
          objetsAAfficher.push(
            p1,
            p2,
            code1,
            code2,
            code5,
            code6,
            nommeP1,
            nommeP2,
          )
          texteCorr =
            `${texteEnCouleurEtGras('On ne peut pas déterminer')} si ces triangles sont égaux (il manque une troisième information).`
          trianglesEgaux = false
          break
      }
      if (this.interactif || context.isAmc) {
        this.autoCorrection[i] = {
          enonce: texte,
          options: { ordered: true },
          propositions: [
            {
              texte: 'Les triangles sont égaux.',
              statut: trianglesEgaux,
            },
            {
              texte: 'Les triangles ne sont pas égaux.',
              statut: !trianglesEgaux,
            },
          ],
        }
        monQcm = propositionsQcm(this, i)
        texte += texte + monQcm.texte
      }
      texte += mathalea2d(
        Object.assign(
          {
            scale: 0.3,
            optionsTikz: ['baseline=(current bounding box.north)'],
          },
          fixeBordures(objetsAAfficher),
        ),
        objetsAAfficher,
      )
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], l1, l2, l3)) {
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
