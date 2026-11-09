import { miseEnEvidence } from '../../lib/outils/embellissements'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { vecteur } from '../../lib/2d/Vecteur'
import { codageAngle } from '../../lib/2d/angles'
import { barycentre, nommePolygone, polygone } from '../../lib/2d/polygones'
import { rotation, similitude, translation } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  combinaisonListes,
  shuffle,
  shuffleLettres,
} from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true // pour définir qu'exercice peut s'afficher en mode interactif.

export const amcReady = true // pour définir que l'exercice peut servir à AMC
export const amcType = 'qcmMono'
export const titre =
  'Effectuer un lien entre triangles égaux et côtés homologues'

/**
 * Deux triangles égaux sont codés, il faut reconnaitre les côtés homologues
 * @author Rémi Angot

*/
export const uuid = '10148'

export const refs = {
  'fr-fr': ['5G24-1'],
  'fr-ch': ['11LCGM3A-3', '11LSGM3A-3', 'PRQES05A-4'],
}
export default class TrianglesEgaux extends Exercice {
  constructor() {
    super()

    this.consigne = 'Compléter les phrases suivantes.'
    this.nbQuestions = 3

    this.sup = 1 // Niveau de difficulté

    this.spacing = 2
  }

  nouvelleVersion() {
    const zoom = context.vue === 'diap' ? 0.5 : 1

    let typeQuestionsDisponibles = [
      'rotation',
      'similitude',
      'rotation2',
      'similitude2',
      'rotation3',
      'similitude3',
    ]
    if (this.nbQuestions === 3) {
      typeQuestionsDisponibles = ['similitude', 'rotation2', 'similitude3']
    } else if (this.nbQuestions === 4) {
      typeQuestionsDisponibles = [
        'rotation',
        'rotation2',
        'similitude2',
        'rotation3',
        'similitude3',
      ]
    }
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      texte = ''
      let l1 = randint(40, 70)
      let l2 = randint(40, 80, l1)
      let l3 = randint(40, l1 + l2 - 10, [l1, l2])
      l1 /= 10
      l2 /= 10
      l3 /= 10
      const A = pointAbstrait(0, 0)
      const B = pointAdistance(A, l1)
      const p1 = triangle2points2longueurs(A, B, l2, l3)
      const C = p1.listePoints[2]
      const O = barycentre(p1)
      const v = vecteur(longueur(A, B) + 2, 0)
      const O2 = translation(O, v)
      let p2 = similitude(p1, O2, randint(160, 200), 1)
      let D = p2.listePoints[0]
      let E = p2.listePoints[1]
      let F = p2.listePoints[2]
      let code1,
        code2,
        code3,
        code4,
        code5,
        code6,
        codeA1,
        codeA2,
        codeA3,
        codeA4,
        codeA5,
        codeA6,
        nom1,
        nom2,
        nommeP1,
        nommeP2
      code1 = codageSegment(A, B, '|')
      codeA1 = codageAngle(B, A, C)
      nommeP1 = nommePolygone(polygone(A, B, C), 'ABC')
      let objetsAfficher = [p1, code1, codeA1, nommeP1]
      // listeTypeQuestions[i] = 'rotation'
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'rotation':
          p2 = rotation(p1, A, angle(C, A, B) + randint(10, 100))
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom1 = nom1 + ' ' + choisitLettresDifferentes(2, nom1)
          nom1 = nom1.replaceAll(',', '')
          nommeP1 = nommePolygone(polygone(A, B, C, D, E, F), nom1)

          D.nom = nom1[0]
          E.nom = nom1[4]
          F.nom = nom1[5]
          objetsAfficher = [
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            code5,
            code6,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
          ]
          // texteCorr = `Correction ${i + 1} de type 1`
          break
        case 'similitude':
          p2 = similitude(p1, O2, randint(160, 200), 1)
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom2 = choisitLettresDifferentes(3, nom1).join('')
          D.nom = nom2[0]
          E.nom = nom2[1]
          F.nom = nom2[2]
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          objetsAfficher = [
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            code5,
            code6,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
            nommeP2,
          ]

          break
        case 'rotation2':
          p2 = rotation(p1, A, angle(C, A, B) + randint(10, 100))
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom1 = nom1 + ' ' + choisitLettresDifferentes(2, nom1)
          nom1 = nom1.replaceAll(',', '')
          nommeP1 = nommePolygone(polygone(A, B, C, D, E, F), nom1)
          D.nom = nom1[0]
          E.nom = nom1[4]
          F.nom = nom1[5]
          objetsAfficher = [
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            code5,
            code6,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
          ]

          // texteCorr = `Correction ${i + 1} de type 1`
          break
        case 'similitude2':
          p2 = similitude(p1, O2, randint(160, 200), 1)
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom2 = choisitLettresDifferentes(3, nom1).join('')

          D.nom = nom2[0]
          E.nom = nom2[1]
          F.nom = nom2[2]
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          objetsAfficher = [
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
          ]
          break
        case 'rotation3':
          p2 = rotation(p1, A, angle(C, A, B) + randint(10, 100))
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom1 = nom1 + ' ' + choisitLettresDifferentes(2, nom1)
          nom1 = nom1.replaceAll(',', '')
          nommeP1 = nommePolygone(polygone(A, B, C, D, E, F), nom1)

          D.nom = nom1[0]
          E.nom = nom1[4]
          F.nom = nom1[5]
          objetsAfficher = [
            p1,
            p2,
            code1,
            code2,
            codeA1,
            codeA2,
            codeA5,
            codeA6,
            nommeP1,
          ]
          // texteCorr = `Correction ${i + 1} de type 1`
          break
        case 'similitude3':
        default:
          p2 = similitude(p1, O2, randint(160, 200), 1)
          D = p2.listePoints[0]
          E = p2.listePoints[1]
          F = p2.listePoints[2]
          code1 = codageSegment(A, B, '|')
          code2 = codageSegment(D, E, '|')
          code3 = codageSegment(B, C, '||')
          code4 = codageSegment(E, F, '||')
          code5 = codageSegment(C, A, '|||')
          code6 = codageSegment(F, D, '|||')
          codeA1 = codageAngle(A, B, C)
          codeA2 = codageAngle(D, E, F)
          codeA3 = codageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngle(E, F, D, 0.8, 'X')
          codeA5 = codageAngle(C, A, B, 0.8, '||')
          codeA6 = codageAngle(F, D, E, 0.8, '||')
          nom1 = choisitLettresDifferentes(3).join('')
          nom2 = choisitLettresDifferentes(3, nom1).join('')

          D.nom = nom2[0]
          E.nom = nom2[1]
          F.nom = nom2[2]
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          objetsAfficher = [
            p1,
            p2,
            code1,
            code2,
            code3,
            code4,
            code5,
            code6,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
            nommeP2,
          ]

          break
      }
      A.nom = nom1[0]
      B.nom = nom1[1]
      C.nom = nom1[2]

      const auChoixCote = [
        { label: 'Choisir le bon côté', value: '' },
        ...shuffle([
          { latex: `[${D.nom + E.nom}]`, value: `[${D.nom + E.nom}]` },
          { latex: `[${D.nom + F.nom}]`, value: `[${D.nom + F.nom}]` },
          { latex: `[${E.nom + F.nom}]`, value: `[${E.nom + F.nom}]` },
        ]),
      ]

      const repCote = [
        `[${D.nom + E.nom}]`,
        `[${D.nom + F.nom}]`,
        `[${E.nom + F.nom}]`,
      ]
      texte += `Ci-dessous les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ sont égaux.<br>`

      if (this.interactif) {
        texte +=
          `$[${A.nom}${B.nom}]$ et ` +
          choixDeroulant(this, 3 * i, { choices: auChoixCote }) +
          ' sont homologues.<br>'
        handleAnswers(
          this,
          3 * i,
          { reponse: { value: repCote[0] } },
          { formatInteractif: 'liste-deroulante' },
        )
        texte +=
          `$[${A.nom + C.nom}]$ et ` +
          choixDeroulant(this, 3 * i + 1, { choices: auChoixCote }) +
          ' sont homologues.<br>'
        handleAnswers(
          this,
          3 * i + 1,
          { reponse: { value: repCote[1] } },
          { formatInteractif: 'liste-deroulante' },
        )
        texte +=
          `$[${B.nom + C.nom}]$ et ` +
          choixDeroulant(this, 3 * i + 2, { choices: auChoixCote }) +
          ' sont homologues.<br>'
        handleAnswers(
          this,
          3 * i + 2,
          { reponse: { value: repCote[2] } },
          { formatInteractif: 'liste-deroulante' },
        )
      } else if (context.isAmc) {
        const options = { ordered: true, vertical: true }
        texte += `$[${A.nom + B.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
        listeDeroulanteToQcm(this, 3 * i, auChoixCote, repCote[0], options)
        texte += `$[${B.nom + C.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
        listeDeroulanteToQcm(this, 3 * i + 1, auChoixCote, repCote[1], options)
        texte += `$[${C.nom + A.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
        listeDeroulanteToQcm(this, 3 * i + 2, auChoixCote, repCote[2], options)
      } else {
        texte += 'Compléter les phrases suivantes.<br>'
        texte += `$[${A.nom + B.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
        texte += `$[${B.nom + C.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
        texte += `$[${C.nom + A.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
      }
      texte += mathalea2d(
        {
          xmin: Math.min(A.x, B.x, C.x, D.x, E.x, F.x) - 3,
          ymin: Math.min(A.y, B.y, C.y, D.y, E.y, F.y) - 3,
          xmax: Math.max(A.x, B.x, C.x, D.x, E.x, F.x) + 3,
          ymax: Math.max(A.y, B.y, C.y, D.y, E.y, F.y) + 3,
          scale: 0.5,
          zoom,
        },
        objetsAfficher,
      )
      texteCorr = `$[${A.nom + B.nom}]$ et $${miseEnEvidence(`[${D.nom + E.nom}]`)}$ sont homologues.<br>`
      texteCorr += `$[${B.nom + C.nom}]$ et $${miseEnEvidence(`[${E.nom + F.nom}]`)}$ sont homologues.<br>`
      texteCorr += `$[${C.nom + A.nom}]$ et $${miseEnEvidence(`[${F.nom + D.nom}]`)}$ sont homologues.<br>`
      if (
        this.questionJamaisPosee(
          i,
          typeQuestionsDisponibles[i],
          l1,
          l2,
          l3,
          listeTypeQuestions[i],
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté', 2,'1 : Facile\n2 : Difficile'];
}
