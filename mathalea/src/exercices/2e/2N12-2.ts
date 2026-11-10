import {
  CrochetD,
  crochetD,
  CrochetG,
  crochetG,
  intervalle,
} from '../../lib/2d/intervalles'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { Vide2d, vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Utiliser et comprendre les symboles $\\cup $ et $\\cap $ avec les intervalles de $\\mathbb{R}$'
export const interactifReady = true

/**
 * @author Stéphane Guyon
 */
export const uuid = 'dc2a5'

export const refs = {
  'fr-fr': ['2N12-2'],
  'fr-ch': [],
}
export default class UnionEtIntersectionIntervallesDeR extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const X1 = pointAbstrait(0, 0)
    const X2 = pointAbstrait(12, 0)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeQuestion = listeTypeDeQuestions[i]
      const test = randint(1, 6)
      let texte = 'Donner une écriture simplifiée, si possible, de '
      let texteCorr = ''
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let e = 0
      let f = 0
      let s: Segment
      let A: PointAbstrait
      let B: PointAbstrait
      let C: PointAbstrait
      let D: PointAbstrait
      let c1: CrochetG | Vide2d
      let c2: CrochetD | Vide2d
      let c3: CrochetG | Vide2d
      let c4: CrochetD | Vide2d
      let int: Segment
      let int1: Segment
      let int2: Segment

      // variables qui alternent les ouvertures de crochets
      switch (typeDeQuestion) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1: // Intersection de deux intervalles fermés disjoints
          a = randint(1, 15)
          e = a + 1
          b = randint(e, 25)
          e = b + 1
          c = randint(e, 35)
          e = c + 1
          d = randint(e, 45)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(5, 0, String(b))
          C = pointAbstrait(6, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', 0)
          int2 = intervalle(C, D, bleuMathalea, 0)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}]\\cap[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cap[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $]${c}~;~${d}]$.`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}]\\cap[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cap[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
          } else {
            texte += `$I=]${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
          }
          texteCorr +=
            "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
          texteCorr += `<br>Les deux ensembles sont disjoints, ils n'ont aucun élément en commun.<br>
                    $I=\\emptyset$`
          break
        case 2: // Union de deux intervalles fermés disjoints
          a = randint(1, 15)
          e = a + 1
          b = randint(e, 25)
          e = b + 1
          c = randint(e, 35)
          e = c + 1
          d = randint(e, 45)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(5, 0, String(b))
          C = pointAbstrait(6, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', 0)
          int2 = intervalle(C, D, bleuMathalea, 0)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ ou bien $[${c}~;~${d}]$, ou dans les deux.`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $[${c}~;~${d}]$, ou dans les deux.`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ou bien  $]${c}~;~${d}]$, ou dans les deux.`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}]$ ou bien  $[${c}~;~${d}[$, ou dans les deux.`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cup[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}[$ ou bien  $[${c}~;~${d}[$, ou dans les deux.`
          } else {
            texte += `$I=]${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $]${c}~;~${d}[$, ou dans les deux.`
          }
          texteCorr +=
            "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"
          texteCorr += `<br>Les deux ensembles sont disjoints, ils n'ont aucun élément en commun.<br>
                    On ne peut pas simplifier l'écriture de $I$ qui s'écrit donc `
          if (test === 1) {
            texteCorr += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}]$`
          } else if (test === 2) {
            texteCorr += `$I=]${a}~;~${b}]\\cup[${c}~;~${d}]$`
          } else if (test === 3) {
            texteCorr += `$I=[${a}~;~${b}]\\cup]${c}~;~${d}]$`
          } else if (test === 4) {
            texteCorr += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}[$`
          } else if (test === 5) {
            texteCorr += `$I=[${a}~;~${b}[\\cup[${c}~;~${d}[$`
          } else {
            texteCorr += `$I=]${a}~;~${b}]\\cup]${c}~;~${d}]$`
          }
          break
        case 3: // Intersection de deux intervalles fermés avec intervalle fermé en commun
          a = randint(1, 15)
          e = a + 4
          b = randint(29, 45)
          e = b - 1
          c = randint(16, e)
          e = b + 1
          d = randint(e, 65)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}]\\cap[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=[${c}~;~${b}]$`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cap[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=[${c}~;~${b}]$`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $]${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=]${c}~;~${b}]$`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cap]${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=]${c}~;~${b}[$`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cap[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=[${c}~;~${b}[$`
          } else {
            texte += `$I=]${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += `$I=]${c}~;~${b}]$`
          }

          break
        case 4: // Union de deux intervalles fermés avec intervalle fermé en commun
          a = randint(1, 15)
          e = a + 4
          b = randint(29, 45)
          e = b - 1
          c = randint(16, e)
          e = b + 1
          d = randint(e, 65)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ ou bien $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=[${a}~;~${d}]$`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=]${a}~;~${d}]$`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ou bien  $]${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=[${a}~;~${d}]$`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cup]${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}[$ ou bien  $]${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=[${a}~;~${d}[$`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cup[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}[$ ou bien  $[${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=[${a}~;~${d}[$`
          } else {
            texte += `$I=]${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $]${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `$I=]${a}~;~${d}]$`
          }

          break
        case 5: // Intersection de deux intervalles fermés dont un inclus dans l'autre
          a = randint(1, 15)
          e = a + 15
          b = randint(e, 35)
          e = a + 1
          f = b - 10
          c = randint(e, f)
          e = c + 1
          d = randint(e, f)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(9, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(7, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}] \\cap [${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $[${c}~;~${d}]\\subset [${a}~;~${b}]$ donc $I=[${c}~;~${d}]$`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cap[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]${a}~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $[${c}~;~${d}]\\subset ]${a}~;~${b}]$ donc $I=[${c}~;~${d}]$`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $]${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $]${c}~;~${d}]\\subset [${a}~;~${b}]$ donc $I=]${c}~;~${d}]$`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cap]${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $]${c}~;~${d}[\\subset [${a}~;~${b}[$ donc $I=]${c}~;~${d}[$`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cap[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}[$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $[${c}~;~${d}[\\subset [${a}~;~${b}[$ donc $I=[${c}~;~${d}[$`
          } else {
            texte += `$I=]${a}~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}]$ et dans $[${c}~;~${d}[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge.<br>"
            texteCorr += `On observe que $]${c}~;~${d}]\\subset ]${a}~;~${b}]$ donc $I=]${c}~;~${d}]$`
          }

          break
        case 6: // Union de deux intervalles fermés dont un inclus dans l'autre
          a = randint(1, 15)
          e = a + 15
          b = randint(e, 35)
          e = a + 1
          f = b - 10
          c = randint(e, f)
          e = c + 1
          d = randint(e, f)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(9, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(7, 0, String(d))
          if (test === 1) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else if (test === 5) {
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetD(D, bleuMathalea)
          } else {
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)

          if (test === 1) {
            texte += `$I=[${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ ou bien $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"

            texteCorr += `On a $[${c}~;~${d}]\\subset [${a}~;~${b}]$ donc $I=[${a}~;~${b}]$`
          } else if (test === 2) {
            texte += `$I=]${a}~;~${b}]\\cup[${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"

            texteCorr += `On a $[${c}~;~${d}]\\subset ]${a}~;~${b}]$ donc $I=]${a}~;~${b}]$`
          } else if (test === 3) {
            texte += `$I=[${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $[${a}~;~${b}]$ou bien  $]${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"

            texteCorr += `On a $]${c}~;~${d}]\\subset [${a}~;~${b}]$ donc $I=[${a}~;~${b}]$`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cup]${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}[$ ou bien  $]${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"

            texteCorr += `On a $]${c}~;~${d}[\\subset [${a}~;~${b}[$ donc $I=[${a}~;~${b}[$`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cup[${c}~;~${d}[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $[${a}~;~${b}[$ ou bien  $[${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"

            texteCorr += `On a $[${c}~;~${d}]\\subset [${a}~;~${b}[$ donc $I=[${a}~;~${b}[$`
          } else {
            texte += `$I=]${a}~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans  $]${a}~;~${b}]$ ou bien  $]${c}~;~${d}[$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"

            texteCorr += `On a $]${c}~;~${d}]\\subset ]${a}~;~${b}]$ donc $I=]${a}~;~${b}]$`
          }

          break
        case 7: // Intersection de deux intervalles avec infini
          a = randint(1, 15)
          e = a + 1
          b = randint(e, 25)
          e = b + 1
          c = randint(e, 35)
          e = c + 1
          d = randint(e, 45)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          B = pointAbstrait(5, 0, String(b))
          C = pointAbstrait(6, 0, String(c))
          D = pointAbstrait(10, 0, String(d))
          if (test === 1) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = vide2d()
          } else if (test === 5) {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = vide2d()
          } else {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetG(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = vide2d()
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', 0)
          int2 = intervalle(C, D, bleuMathalea, 0)

          if (test === 1) {
            texte += `$I=]-\\infty~;~${b}] \\cap [${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]-\\infty~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr +=
              "On observe que les deux intervalles sont disjoints donc aucun réel n'appartient aux deux ensembles.<br>"
            texteCorr += '$I=\\emptyset$'
          } else if (test === 2) {
            texte += `$I=]-\\infty~;~${b}] \\cap [${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]-\\infty~;~${b}]$ et dans $[${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr +=
              "On observe que les deux intervalles sont disjoints donc aucun réel n'appartient aux deux ensembles.<br>"
            texteCorr += '$I=\\emptyset$'
          } else if (test === 3) {
            texte += `$I=]-\\infty~;~${b}]\\cap]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]-\\infty~;~${b}]$ et dans $]${c}~;~${d}]$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr +=
              "On observe que les deux intervalles sont disjoints donc aucun réel n'appartient aux deux ensembles.<br>"
            texteCorr += '$I=\\emptyset$'
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cap]${c}~;~+\\infty[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}[$ et dans $]${c}~;~+\\infty[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += '$I=\\emptyset$'
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cap[${c}~;~+\\infty[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $[${a}~;~${b}[$ et dans $[${c}~;~+\\infty[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += '$I=\\emptyset$'
          } else {
            texte += `$I=]${a}~;~${b}]\\cap]${c}~;~+\\infty[$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]${a}~;~${b}]$ et dans $]${c}~;~+\\infty[$.`
            texteCorr +=
              "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
            texteCorr += '$I=\\emptyset$'
          }
          break
        case 8: // Union de deux intervalles un fermé et l'autre semi fermé, et disjoints
          a = randint(1, 15)
          e = a + 1
          b = randint(e, 25)
          e = b + 1
          c = randint(e, 35)
          e = c + 1
          d = randint(e, 45)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          B = pointAbstrait(5, 0, String(b))
          C = pointAbstrait(6, 0, String(c))

          if (test === 1) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 2) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 3) {
            A = pointAbstrait(0, 0)
            D = pointAbstrait(10, 0, String(d))
            c1 = vide2d()
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = crochetG(D, bleuMathalea)
          } else if (test === 4) {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = vide2d()
          } else if (test === 5) {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetD(A, 'red')
            c2 = crochetD(B, 'red')
            c3 = crochetD(C, bleuMathalea)
            c4 = vide2d()
          } else {
            A = pointAbstrait(0, 0, String(a))
            D = pointAbstrait(15, 0)
            c1 = crochetD(A, 'red')
            c2 = crochetG(B, 'red')
            c3 = crochetG(C, bleuMathalea)
            c4 = vide2d()
          }
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', 0)
          int2 = intervalle(C, D, bleuMathalea, 0)

          if (test === 1) {
            texte += `$I=]-\\infty~;~${b}] \\cup [${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $]-\\infty~;~${b}]$ ou bien dans $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=]-\\infty~;~${b}] \\cup [${c}~;~${d}]$`
          } else if (test === 2) {
            texte += `$I=]-\\infty~;~${b}] \\cup [${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $]-\\infty~;~${b}]$ ou bien dans $[${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=]-\\infty~;~${b}] \\cup [${c}~;~${d}]$`
          } else if (test === 3) {
            texte += `$I=]-\\infty~;~${b}]\\cup]${c}~;~${d}]$`
            texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $]-\\infty~;~${b}]$ ou bien dans $]${c}~;~${d}]$, ou dans les deux.`
            texteCorr +=
              "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=]-\\infty~;~${b}] \\cup ]${c}~;~${d}]$`
          } else if (test === 4) {
            texte += `$I=[${a}~;~${b}[\\cup]${c}~;~+\\infty[$`
            texteCorr = context.isHtml
              ? '<br>'
              : '' +
                "On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=[${a}~;~${b}[\\cup]${c}~;~+\\infty[$`
          } else if (test === 5) {
            texte += `$I=[${a}~;~${b}[\\cup[${c}~;~+\\infty[$`
            texteCorr = context.isHtml
              ? '<br>'
              : '' +
                "On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=[${a}~;~${b}[\\cup[${c}~;~+\\infty[$`
          } else {
            texte += `$I=]${a}~;~${b}]\\cup]${c}~;~+\\infty[$`
            texteCorr = context.isHtml
              ? '<br>'
              : '' +
                "On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge.<br>"
            texteCorr +=
              'On observe que les deux intervalles sont disjoints donc <br>'
            texteCorr += `$I=]${a}~;~${b}]\\cup]${c}~;~+\\infty[$`
          }

          break
        case 9:
          a = randint(1, 15)
          e = a + 4
          b = randint(29, 45)
          e = b - 1
          c = randint(16, e)
          e = b + 1
          d = randint(e, 65)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          c1 = crochetG(A, 'red')
          c2 = crochetD(B, 'red')
          c3 = crochetD(C, bleuMathalea)
          c4 = crochetG(D, bleuMathalea)
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)
          texte += `$I=]${a}~;~${b}[ \\cap [${c}~;~${d}]$`

          texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont à la fois dans $]${a}~;~${b}[$ et dans $[${c}~;~${d}]$.`
          texteCorr +=
            "<br>On regarde la partie de l'intervalle qui est coloriée à la fois en bleu et en rouge :<br>"
          texteCorr += `$I=[${c}~;~${b}[$`
          break
        case 10:
        default:
          a = randint(1, 15)
          e = a + 4
          b = randint(29, 45)
          e = b - 1
          c = randint(16, e)
          e = b + 1
          d = randint(e, 65)
          s = segment(0, 0, 10, 0)
          s.styleExtremites = '->'

          A = pointAbstrait(2, 0, String(a))
          B = pointAbstrait(6, 0, String(b))
          C = pointAbstrait(5, 0, String(c))
          D = pointAbstrait(9, 0, String(d))
          c1 = crochetG(A, 'red')
          c2 = crochetD(B, 'red')
          c3 = crochetG(C, bleuMathalea)
          c4 = crochetD(D, bleuMathalea)
          int = intervalle(X1, X2, 'black', 0)
          int1 = intervalle(A, B, 'red', -0.1)
          int2 = intervalle(C, D, bleuMathalea, 0.1)
          texte = `$I=]${a}~;~${b}[ \\cup ]${c}~;~${d}[$`

          texteCorr = `${context.isHtml ? '<br>' : ''}On cherche les réels qui sont dans $]${a}~;~${b}[$, ou bien dans $]${c}~;~${d}[$.`
          texteCorr +=
            "<br>On regarde donc la partie de l'intervalle qui est coloriée, soit en bleu, soit en rouge, soit en bleu et rouge :<br>"
          texteCorr += `$I=]${a}~;~${d}[$`
          break
      }
      texte += '.'
      let aRemplacer = texteCorr.split('=')[1]
      aRemplacer = aRemplacer.replace('$', '')
      texteCorr = texteCorr.split('=')[0] + '=$'
      texteCorr += `$${miseEnEvidence(aRemplacer)}$.`
      const listeObjets = [int, int1, int2, c1, c2, c3, c4].filter(
        (el) => el !== undefined,
      )
      texteCorr += mathalea2d(
        {
          xmin: -2,
          ymin: -2,
          xmax: 15,
          ymax: 2,
        },
        listeObjets,
      )
      if (this.questionJamaisPosee(i, a, b, String(c))) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '<br>$I=$',
              dataKeys: [
                '[',
                ']',
                ';',
                '\\emptyset',
                '\\mathbb{R}',
                '\\cup',
                '\\cap',
                '-\\infty',
                '+\\infty',
              ],
            },
          )
          handleAnswers(this, i, {
            reponse: { value: aRemplacer, options: { intervalle: true } },
          })
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
