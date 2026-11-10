import { miseEnEvidence } from '../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { nomVecteurParPosition } from '../../lib/2d/NomVecteurParPosition'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import {
  representant,
  representantNomme,
} from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { vecteur } from '../../lib/2d/Vecteur'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = "Calculer les coordonnées d'un point par une translation"
export const dateDeModifImportante = '17/04/2024'

/**
 * Calculer les coordonnées d'un point image ou antécédent d'un autre par une translation
 * @author Stéphane Guyon, Jean-claude Lhote, Stéphan Grignon et Nathan Scheinmann

 */
export const uuid = 'fa7b9'

export const refs = {
  'fr-fr': ['2G26-6'],
  'fr-ch': ['3G91-8'],
}

export default class TranslationEtCoordonnes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 2
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      "1 :Calculer les coordonnées de l'image d'un point. \n 2 :Calculer les coordonnées de l'antécédent d'un point.\n3 : Mélange",
    ]
  }

  nouvelleVersion() {
    let typeQuestionsDisponibles: ('coorImage' | 'coorPre' | 'melange')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['coorImage']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['coorPre']
    } else {
      typeQuestionsDisponibles = ['coorImage', 'coorPre']
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let xA, yA, xB, yB, ux, uy, AbsRep, OrdRep
      const objets = []
      xA = randint(2, 8) * choice([-1, 1])
      yA = randint(2, 8) * choice([-1, 1])
      ux = randint(2, 8) * choice([-1, 1])
      uy = randint(2, 8) * choice([-1, 1])
      xB = xA + ux
      yB = yA + uy
      while (Math.abs(xB) < 2 || Math.abs(xB) > 8) {
        // On s'assure de choisir des points bien placés dans le repère.
        xA = randint(2, 8) * choice([-1, 1])
        ux = randint(2, 8) * choice([-1, 1])
        xB = xA + ux
      }
      while (Math.abs(yB) < 2 || Math.abs(yB) > 8) {
        // Idem pour les ordonnées
        yA = randint(2, 8) * choice([-1, 1])
        uy = randint(2, 8) * choice([-1, 1])
        yB = yA + uy
      }

      const r = repere({
        xUnite: 1,
        yUnite: 1,
        xMin: Math.min(-2, xA - 2, xB - 2, 2),
        yMin: Math.min(-2, yA - 2, yB - 2, 2),
        xMax: Math.max(-2, xA + 2, xB + 2, 2),
        yMax: Math.max(-2, yA + 2, yB + 2, 2),
        thickHauteur: 0.1,
        yLabelEcart: 0.4,
        xLabelEcart: 0.3,
        axeXStyle: '->',
        axeYStyle: '->',
      }) // On définit le repère
      const A = pointAbstrait(xA, yA) // On définit et on trace le point A
      const B = pointAbstrait(xB, yB) // On définit et on trace le point B
      const traceAetB = tracePoint(A, B, 'red') // Variable qui trace les points avec une croix
      const posLabelA = homothetie(B, A, -0.7 / longueur(A, B)) // pour positionner les noms des points aux extrémités proprement
      const posLabelB = homothetie(A, B, -0.7 / longueur(A, B))
      const labelA = latexParPoint('A', posLabelA, 'red', 10, 12, '')
      const labelB = latexParPoint("A'", posLabelB, 'red', 10, 12, '')
      const s = segment(A, B, 'red') // On trace en rouge [AB]
      s.styleExtremites = '->' // Variable qui transforme [AB] en vecteur
      const O = pointAbstrait(0, 0) // On définit et on trace le point O
      const o = texteParPosition('O', -0.3, -0.3)
      const I = pointAbstrait(1, 0) // On définit sans tracer le point I
      const J = pointAbstrait(0, 1) // On définit sans tracer le point J
      const vi = vecteur(O, I) // Variable qui définit vecteur OI
      const vj = vecteur(O, J) // Variable qui définit vecteur OJ
      const k = representant(vi, O) // Variable qui trace [OI]
      const j = representant(vj, O) // Variable qui trace [OJ]
      s.epaisseur = 2 // Variable qui grossit le tracé du vecteur AB
      s.color = colorToLatexOrHTML('red')
      k.epaisseur = 2 // Variable qui grossit le tracé du vecteur OI
      j.epaisseur = 2 // Variable qui grossit le tracé du vecteur OJ
      const nomi = nomVecteurParPosition('i', 0.5, -0.7, 1.5, 0)
      const nomj = nomVecteurParPosition('j', -0.7, 0.5, 1.5, 0)
      const nomAB = representantNomme(vecteur(A, B), A, "AA'", 1.5, 'red')
      objets.push(r, traceAetB, labelA, labelB, s, o, k, j, nomi, nomj, nomAB)
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'coorImage':
          AbsRep = xB
          OrdRep = yB
          texte = `Dans un repère orthonormé $\\big(O\\,;\\,\\vec \\imath,\\,\\vec \\jmath\\big)$, déterminer les coordonnées du point $A'$, image du point $A\\left(${xA}\\,;\\,${yA}\\right)$ par la translation de vecteur $\\vec{u}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$.<br>`
          if (this.interactif) {
            texte +=
              "Le point $A'$ est donné par" +
              remplisLesBlancs(this, i, "A'(%{champ1};{%{champ2}).")
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(AbsRep) },
                champ2: { value: String(OrdRep) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
        case 'coorPre':
          AbsRep = xA
          OrdRep = yA
          texte = `Dans un repère orthonormé $\\big(O\\,;\\,\\vec \\imath,\\,\\vec \\jmath\\big)$, déterminer les coordonnées du point $A$, dont l'image par la translation de vecteur $\\vec{u}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$ est le point $A'\\left(${xB}\\,;\\,${yB}\\right)$.<br>`
          if (this.interactif) {
            texte +=
              'Le point $A$ est donné par' +
              remplisLesBlancs(this, i, 'A(%{champ1};%{champ2})')
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(AbsRep) },
                champ2: { value: String(OrdRep) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
      }
      if (this.correctionDetaillee) {
        texteCorr +=
          "On sait d'après le cours que si $A'$ est l'image de $A$ par la translation de vecteur $\\vec{u}$, alors on a l'égalité : $\\overrightarrow{AA'}=\\vec{u}$.<br>"
        texteCorr +=
          "On connaît les coordonnées de $\\vec{u}$ avec l'énoncé, on calcule donc celles de $\\overrightarrow{AA'}$.<br>"
        texteCorr +=
          "On sait d'après le cours que si $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ sont deux points d'un repère, alors on a $\\overrightarrow{AB}\\begin{pmatrix}x_B-x_A\\\\y_B-y_A\\end{pmatrix}$.<br>"
        texteCorr += "On applique ci-dessous aux données de l'énoncé.<br><br>"
      }

      switch (listeTypeQuestions[i]) {
        case 'coorImage':
          texteCorr += `Soit $(x\\,;\\,y)$ les coordonnées du point $A'$, on a donc $\\overrightarrow{AA'}\\begin{pmatrix}x-${ecritureParentheseSiNegatif(xA)}\\\\y-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$`
          if (xA < 0 || yA < 0) {
            texteCorr += ` soit $\\overrightarrow{AA'}\\begin{pmatrix}x${ecritureAlgebrique(-xA)}\\\\y${ecritureAlgebrique(-yA)}\\end{pmatrix}$.<br>`
          } else {
            texteCorr += '.<br>'
          }
          texteCorr +=
            "Dire que $\\overrightarrow{AA'}=\\vec{u}$ équivaut à résoudre :<br><br>"
          texteCorr += '$\\left\\{\\begin{array}{l}'
          texteCorr += `x${ecritureAlgebrique(-xA)}=${ux} \\\\`
          texteCorr += `y${ecritureAlgebrique(-yA)}=${uy}`
          texteCorr += '\\end{array}'
          texteCorr += '\\right.$'
          texteCorr += '$\\Leftrightarrow\\left\\{\\begin{array}{l}'
          texteCorr += `x=${ux}${ecritureAlgebrique(xA)} \\\\`
          texteCorr += `y=${uy}${ecritureAlgebrique(yA)}`
          texteCorr += '\\end{array}'
          texteCorr += '\\right.$'
          texteCorr += '$\\Leftrightarrow\\left\\{\\begin{array}{l}'
          texteCorr += `x=${xB} \\\\`
          texteCorr += `y=${yB}`
          texteCorr += '\\end{array}'
          texteCorr += `\\right.$ soit $${miseEnEvidence(`A'(${xB}\\,;\\,${yB})`)}$.<br>`
          // texteCorr += `$\\begin{cases}x${ecritureAlgebrique(-xA)}=${ux}\\\\y${ecritureAlgebrique(-yA)}=${uy}\\end{cases}$`
          // texteCorr += `$\\Leftrightarrow\\begin{cases}x=${ux}${ecritureAlgebrique(xA)}\\\\y=${uy}${ecritureAlgebrique(yA)}\\end{cases}$`
          // texteCorr += `$\\Leftrightarrow\\begin{cases}x=${xB}\\\\y=${yB}\\end{cases}$ soit $${miseEnEvidence(`A'(${xB}\\,;\\,${yB})`)}$.<br>`
          break
        case 'coorPre':
          texteCorr += `Soit $(x\\,;\\,y)$ les coordonnées du point $A$, on a donc : $\\overrightarrow{AA'}\\begin{pmatrix}${xB}-x\\\\${yB}-y\\end{pmatrix}$.<br>`
          texteCorr +=
            "Dire que $\\overrightarrow{AA'}=\\vec{u}$ équivaut à résoudre :<br><br>"
          texteCorr += '$\\left\\{\\begin{array}{l}'
          texteCorr += `${xB}-x=${ux} \\\\`
          texteCorr += `${yB}-y=${uy}`
          texteCorr += '\\end{array}'
          texteCorr += '\\right.$'
          texteCorr += '$\\Leftrightarrow\\left\\{\\begin{array}{l}'
          texteCorr += `x=${xB}${ecritureAlgebrique(-ux)} \\\\`
          texteCorr += `y=${yB}${ecritureAlgebrique(-uy)}`
          texteCorr += '\\end{array}'
          texteCorr += '\\right.$'
          texteCorr += '$\\Leftrightarrow\\left\\{\\begin{array}{l}'
          texteCorr += `x=${xA} \\\\`
          texteCorr += `y=${yA}`
          texteCorr += '\\end{array}'
          texteCorr += `\\right.$ soit $${miseEnEvidence(`A(${xA}\\,;\\,${yA})`)}$.<br>`
          // texteCorr += `$\\begin{cases}${xB}-x=${ux}\\\\${yB}-y=${uy}\\end{cases}$`
          // texteCorr += `$\\Leftrightarrow\\begin{cases}x=${xB}${ecritureAlgebrique(-ux)}\\\\y=${yB}${ecritureAlgebrique(-uy)}\\end{cases}$`
          // texteCorr += `$\\Leftrightarrow\\begin{cases}x=${xA}\\\\y=${yA}\\end{cases}$ soit $${miseEnEvidence(`A(${xA}\\,;\\,${yA})`)}$.<br>`
          break
      }

      if (this.correctionDetaillee) {
        texteCorr += mathalea2d(
          Object.assign({ zoom: 1, scale: 0.6 }, fixeBordures(objets)),
          objets,
        ) // On trace le graphique
      }
      if (this.questionJamaisPosee(i, xA, yA, xB, yB)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
