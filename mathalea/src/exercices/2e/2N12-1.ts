import {
  CrochetD,
  crochetD,
  CrochetG,
  crochetG,
  intervalle,
} from '../../lib/2d/intervalles'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'

export const dateDeModifImportante = '16/11/2025'
export const titre =
  'Associer un intervalle de $\\mathbb{R}$ à une inégalité et son schéma sur une droite graduée'
export const interactifReady = true

/**
 * @author Stéphane Guyon
 * Rajout de paramètres et amélioration de l'aléatoire par Éric Elter (16/11/2025)
 */

export const uuid = '31c01'

export const refs = {
  'fr-fr': ['2N12-1'],
  'fr-ch': ['2mIneq-8', '1mEI-6'],
}
export default class IntervallesDeR extends Exercice {
  can: boolean
  constructor() {
    super()
    this.can = false
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      "1 : Donner l'intervalle correspondant\n2 : Donner l'inégalité correspondante\n3: Mélange",
    ]
    this.sup = 3
    this.besoinFormulaire2Texte = [
      "Type d'inégalités données",
      [
        'Nombres séparés par des tirets  :',
        '1 : $x>a$',
        '2 : $x\\geqslant a$',
        '3 : $x<a$',
        '4 : $x\\leqslant a$',
        '5 : $a<x<b$',
        '6 : $a\\leqslant x < b$',
        '7 : $a\\leqslant x \\leqslant b$',
        '8 : $a < x \\leqslant b$',
        '9 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = 9

    this.besoinFormulaire3Texte = [
      "Type d'intervalles donnés",
      [
        'Nombres séparés par des tirets  :',
        '1 : $x \\in ]a\\,;\\,b]$',
        '2 : $x \\in [a\\,;\\,b]$',
        '3 : $x \\in [a\\,;\\,b[$',
        '4 : $x \\in ]a\\,;\\,b[$',
        '5 : $x \\in ]a\\,;\\,+\\infty[$',
        '6 : $x \\in [a\\,;\\,+\\infty[$',
        '7 : $x \\in ]-\\infty\\,;\\,a[$',
        '8 : $x \\in ]-\\infty\\,;\\,a]$',
        '9 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = 9
    this.comment = `Le premier paramètre « Type de questions » est en lien avec les paramètres suivants.<br>
      Vous pouvez choisir les inégalités ou les intervalles disponibles dans l'exercice.`
  }

  nouvelleVersion() {
    const typesInegalitesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const typesIntervallesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
      listeOfCase: rangeMinMax(9, 16),
    }).map(Number)

    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = typesInegalitesDisponibles
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = typesIntervallesDisponibles
    } else {
      typesDeQuestionsDisponibles = [
        ...typesInegalitesDisponibles,
        ...typesIntervallesDisponibles,
      ]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeQuestion = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      const s = segment(0, 0, 12, 0)
      s.styleExtremites = '->'
      const X1 = pointAbstrait(0, 0)
      const X2 = pointAbstrait(12, 0)

      const int = intervalle(X1, X2, 'black', 0)
      let a: number
      let b: number = 0
      let A: PointAbstrait
      let B: PointAbstrait
      let c1: CrochetG
      let c2: CrochetD
      let int1: Segment
      let c = 0
      let reponse
      switch (typeDeQuestion) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a = randint(1, 15)
          A = pointAbstrait(2, 0, String(a))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, X2, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $x>${a}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = `]${a}\\,;\\,+\\infty[`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 2:
          a = randint(1, 15)
          A = pointAbstrait(2, 0, String(a))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, X2, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $x\\geqslant ${a}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = `[${a}\\,;\\,+\\infty[`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 3:
          a = randint(1, 15)
          A = pointAbstrait(2, 0, String(a))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(X1, A, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $x<${a}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = `]-\\infty\\,;\\,${a}[`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 4:
          a = randint(1, 15)
          A = pointAbstrait(2, 0, String(a))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(X1, A, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $x\\leqslant ${a}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = `]-\\infty\\,;\\,${a}]`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 5:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetD(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $${a} < x < ${b}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = `]${a}\\,;\\,${b}[`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 6:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetD(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $${a}\\leqslant x<${b}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = `[${a}\\,;\\,${b}[`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 7:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetG(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $${a}\\leqslant x\\leqslant ${b}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = `[${a}\\,;\\,${b}]`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 8:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetG(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'intervalle $I$ de $\\mathbb{R}$ correspondant à l'inégalité $${a}< x\\leqslant ${b}$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = `]${a}\\,;\\,${b}]`
          texteCorr += `$I=${miseEnEvidence(reponse)}$`
          break

        case 9:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetG(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in ]${a}\\,;\\,${b}]$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = [`${a}< x\\leqslant ${b}`, `${b}> x\\geqslant ${a}`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 10:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetG(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in [${a}\\,;\\,${b}]$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = [
            `${a}\\leqslant x\\leqslant ${b}`,
            `${b}\\geqslant x\\geqslant ${a}`,
          ]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 11:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetD(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in [${a}\\,;\\,${b}[$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = [`${a}\\leqslant x< ${b}`, `${b}\\geqslant x> ${a}`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 12:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4
          c2 = crochetD(B, 'red')
          c2.taille = context.isHtml ? 0.2 : 0.4
          int1 = intervalle(A, B, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in ]${a}\\,;\\,${b}[$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
            c2,
          )
          reponse = [`${a}< x< ${b}`, `${b}> x> ${a}`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 13:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(12, 0, String(b))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4

          int1 = intervalle(A, B, 'red', 0)
          texte = `Déterminer l'inégalité correspondant à $x \\in ]${a}\\,;\\,+\\infty[$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          int1.epaisseur = 6
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = [`x > ${a}`, `${a} < x`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 14:
          a = randint(1, 15)
          c = a + 1
          b = randint(c, 25)
          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(12, 0, String(b))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4

          int1 = intervalle(A, B, 'red', 0)
          texte = `Déterminer l'inégalité correspondant à $x \\in [${a}\\,;\\,+\\infty[$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          int1.epaisseur = 6
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = [`x \\geqslant ${a}`, `${a} \\leqslant x`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 15:
          a = randint(1, 15)
          c = a + 1
          A = pointAbstrait(7, 0, String(a))
          c1 = crochetD(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4

          int1 = intervalle(X1, A, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in ]-\\infty\\,;\\,${a}[$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = [`x < ${a}`, `${a} > x`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
        case 16:
        default:
          a = randint(1, 15)
          c = a + 1
          A = pointAbstrait(7, 0, String(a))
          c1 = crochetG(A, 'red')
          c1.taille = context.isHtml ? 0.2 : 0.4

          int1 = intervalle(X1, A, 'red', 0)
          int1.epaisseur = 6
          texte = `Déterminer l'inégalité correspondant à $x \\in ]-\\infty\\,;\\,${a}]$${this.interactif || this.can ? '.' : " et représenter l'intervalle sur une droite graduée."}`
          texteCorr = mathalea2d(
            {
              xmin: -2,
              ymin: -2,
              xmax: 15,
              ymax: 2,
              scale: 0.6,
            },
            s,
            int,
            int1,
            c1,
          )
          reponse = [`x \\leqslant ${a}`, `${a} \\geqslant x`]
          texteCorr += `$${miseEnEvidence(reponse[0])}$`
          break
      }

      if (this.questionJamaisPosee(i, a, b, typeDeQuestion)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (this.interactif) {
          if (typeDeQuestion < 9) {
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { intervalle: true } },
            })
          } else {
            handleAnswers(this, i, { reponse: { value: reponse } })
          }
          texte += ajouteChampTexteMathLive(
            this,
            i,
            ` ${KeyboardType.clavierEnsemble} ${KeyboardType.clavierCompare}`,
            { texteAvant: typeDeQuestion < 9 ? '<br>$I=$' : '<br>' },
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
