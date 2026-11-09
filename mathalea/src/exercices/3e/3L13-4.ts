import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rectangle1Point2Longueurs } from '../../lib/2d/polygonesParticuliers'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { equation1erDegre1Inconnue } from '../../lib/outils/equations'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  "Résoudre un problème mêlant équations et périmètre et aire d'un rectangle"
export const interactifReady = true

export const dateDeModifImportante = '11/06/2025'

export const uuid = 'cd2f2'
export const refs = {
  'fr-fr': ['3L13-4', 'BP2RES15'],
  'fr-ch': ['10LCFA5D-3', '10LSFA5D-3', '11CTFA4A-6', '11LCFA4A-6', '11LSFA4A-6', 'PRQAL04E-2'],
}
/**
 * @author Guillaume Valmont
 */
export default class ProblemeEquationsPerimetreAireRectangle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '1-2'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Deux longueurs identiques',
        '2 : Deux longueurs différentes',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objets = []
      const rectangle = rectangle1Point2Longueurs(pointAbstrait(0, 0), 5, 3.5, {
        angleRotation: randint(-20, 20),
        avecCodageSegments: false,
      })
      const [A, B, C, D] = rectangle[0].listePoints
      const nomRectangle = A.nom + B.nom + C.nom + D.nom
      objets.push(rectangle)
      let equation
      let segment1: string, segment2: string, perimetre: number, reponse: number
      let longueur: number, largeur: number, longCote: string, largeCote: string
      texte = `$${nomRectangle}$ est un rectangle.<br>`
      switch (typesDeQuestionsDisponibles[i]) {
        case 1: {
          // Deux longueurs identiques
          let longueurConnue = -1
          const longueurInconnue = randint(20, 80)
          do {
            equation = equation1erDegre1Inconnue({
              valeursRelatives: false,
              type: 'ax+b=cx+d',
            })
            longueurConnue = equation.a * Number(equation.reponse) + equation.b
          } while (longueurConnue < 0)
          const a = equation.a
          const b = equation.b
          perimetre = 2 * longueurConnue + 2 * longueurInconnue
          let coteInconnu
          switch (randint(1, 2)) {
            case 1: // Longueurs identiques
              segment1 = `${A.nom}${B.nom}`
              objets.push(texteSurSegment(`$${equation.membreDeGauche}$`, B, A))
              segment2 = `${C.nom}${D.nom}`
              objets.push(texteSurSegment(`$${equation.membreDeDroite}$`, D, C))
              coteInconnu = `${B.nom}${C.nom}`
              longCote = segment1
              largeCote = coteInconnu
              longueur = longueurConnue
              largeur = longueurInconnue
              break
            case 2: // Largeurs identiques
            default:
              segment1 = `${B.nom}${C.nom}`
              objets.push(texteSurSegment(`$${equation.membreDeGauche}$`, C, B))
              segment2 = `${D.nom}${A.nom}`
              objets.push(texteSurSegment(`$${equation.membreDeDroite}$`, A, D))
              coteInconnu = `${A.nom}${B.nom}`
              longCote = coteInconnu
              largeCote = segment1
              longueur = longueurInconnue
              largeur = longueurConnue
              break
          }
          reponse = longueur * largeur
          texte += `$x$ est un nombre tel que $${segment1}=${equation.membreDeGauche}$ et $${segment2}=${equation.membreDeDroite}$ (en cm).<br>`
          texteCorr = `${nomRectangle} est un rectangle donc ses côtés opposés sont de la même longueur donc $${A.nom}${B.nom}=${C.nom}${D.nom}$ et $${B.nom}${C.nom}=${D.nom}${A.nom}$.<br>
            Ainsi $${equation.egalite}$.<br><br>
            ${texteGras("Résolution de l'équation.")}<br>
            ${this.correctionDetaillee ? equation.correctionDetaillee : equation.correction}<br><br>
            ${texteGras(`Calcul de $${segment1}$ en cm.`)}<br>
            $${segment1}=${equation.membreDeGauche}$<br>
            $${segment1}=${a} \\times ${equation.reponse as number}${ecritureAlgebrique(b)}$<br>
            $${segment1}=${longueurConnue}$<br><br>
            ${texteGras(`Calcul de $${coteInconnu}$ en cm.`)}<br>
            $\\mathcal{P} = 2 \\times ${longueurConnue} + 2 \\times ${coteInconnu}$<br>
            $${perimetre} = ${2 * longueurConnue} + 2 ${coteInconnu}$<br>`
          if (this.correctionDetaillee)
            texteCorr += `On soustrait $${2 * longueurConnue}$ aux deux membres.<br>`
          texteCorr += `$${perimetre} ${miseEnEvidence(`- ${2 * longueurConnue}`)} = 2 ${coteInconnu} ${miseEnEvidence(`- ${2 * longueurConnue}`)}$<br>
            $${perimetre - 2 * longueurConnue} = 2 ${coteInconnu}$<br>`
          if (this.correctionDetaillee)
            texteCorr += 'On divise les deux membres par $2$.<br>'
          texteCorr += `$${perimetre - 2 * longueurConnue} ${miseEnEvidence('\\div 2')} = 2 ${coteInconnu} ${miseEnEvidence('\\div 2')}$<br>
            $${longueurInconnue} = ${coteInconnu}$<br><br>
            ${texteGras(`Calcul de l'aire de $${nomRectangle}$ en $\\text{cm}^2$.`)}<br>
            $\\mathcal{A} = L \\times l$<br>
            $\\mathcal{A} = ${longCote} \\times ${largeCote}$<br>
            $\\mathcal{A} = ${longueur} \\times ${largeur}$<br>
            $\\mathcal{A} = ${texNombre(reponse)}$<br>
            Donc l'aire du rectangle $${nomRectangle}$ est de $${miseEnEvidence(texNombre(reponse))}\\text{ cm}^2$.`
          break
        }
        case 2: // Deux longueurs différentes
        default: {
          let a1: number, a2: number, b1: number, b2: number
          do {
            equation = equation1erDegre1Inconnue({
              valeursRelatives: false,
              divisiblePar: 2,
              type: 'ax+b=d',
            })
            a1 = randint(1, equation.a / 2)
            a2 = equation.a / 2 - a1
            b1 = randint(1, equation.b / 2)
            b2 = equation.b / 2 - b1
            longueur = a1 * Number(equation.reponse) + b1
          } while (
            a1 * Number(equation.reponse) + b1 <= 0 ||
            a2 * Number(equation.reponse) + b2 <= 0 ||
            equation.d === 4 ||
            a2 === 0
          )
          perimetre = equation.d
          const expression1 = `${rienSi1(a1)}x${b1 === 0 ? '' : ecritureAlgebrique(b1)}`
          const expression2 = `${rienSi1(a2)}x${b2 === 0 ? '' : ecritureAlgebrique(b2)}`
          switch (randint(1, 2)) {
            case 1:
              longCote = `${A.nom}${B.nom}`
              objets.push(texteSurSegment(`$${expression1}$`, B, A))
              break
            case 2:
            default:
              longCote = `${C.nom}${D.nom}`
              objets.push(texteSurSegment(`$${expression1}$`, D, C))
              break
          }
          switch (randint(1, 2)) {
            case 1:
              largeCote = `${B.nom}${C.nom}`
              objets.push(texteSurSegment(`$${expression2}$`, C, B))
              break
            case 2:
            default:
              largeCote = `${D.nom}${A.nom}`
              objets.push(texteSurSegment(`$${expression2}$`, A, D))
              break
          }
          segment1 = longCote
          segment2 = largeCote
          largeur = a2 * Number(equation.reponse) + b2
          reponse = longueur * largeur
          texte += `$x$ est un nombre tel que $${segment1}=${expression1}$ et $${segment2}=${expression2}$ (en cm).<br>`
          texteCorr = `${nomRectangle} est un rectangle donc ses côtés opposés sont de la même longueur donc $${A.nom}${B.nom}=${C.nom}${D.nom}$ et $${B.nom}${C.nom}=${D.nom}${A.nom}$.<br><br>
            ${texteGras('Mise en équation.')}<br>
            $\\mathcal{P} = 2 \\times ${segment1} + 2 \\times ${segment2}$<br>
            $${perimetre} = 2 \\times ${a1 === 0 || b1 === 0 ? expression1 : `(${expression1})`} + 2 \\times ${a2 === 0 || b2 === 0 ? expression2 : `(${expression2})`}$<br>
            $${perimetre} = ${equation.membreDeGauche}$<br><br>
            ${texteGras("Résolution de l'équation.")}<br>
            ${this.correctionDetaillee ? equation.correctionDetaillee : equation.correction}<br><br>
            ${texteGras(`Calcul de $${segment1}$ en cm.`)}<br>
            $${segment1} = ${a1} \\times ${equation.reponse as number}${b1 === 0 ? '' : ecritureAlgebrique(b1)}$<br>
            $${segment1} = ${longueur}$<br><br>
            ${texteGras(`Calcul de $${segment2}$ en cm.`)}<br>
            $${segment2} = ${a2} \\times ${equation.reponse as number}${b2 === 0 ? '' : ecritureAlgebrique(b2)}$<br>
            $${segment2} = ${largeur}$<br><br>
            ${texteGras(`Calcul de l'aire de $${nomRectangle}$ en $\\text{cm}^2$.`)}<br>
            $\\mathcal{A} = L \\times l$<br>
            $\\mathcal{A} = ${longCote} \\times ${largeCote}$<br>
            $\\mathcal{A} = ${longueur} \\times ${largeur}$<br>
            $\\mathcal{A} = ${reponse}$<br>
            Donc l'aire du rectangle $${nomRectangle}$ est de $${miseEnEvidence(reponse)}\\text{ cm}^2$.`
          break
        }
      }
      texte +=
        `Le périmètre de $${nomRectangle}$ mesure $${perimetre}\\text{ cm}$.<br>
      Déterminer son aire en $\\text{cm}^2$.` +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      handleAnswers(this, i, { reponse: { value: reponse } })
      texte += mathalea2d(
        Object.assign(
          {
            pixelsParCm: 20,
            scale: 0.5,
          },
          fixeBordures(objets),
        ),
        objets,
      )
      if (this.questionJamaisPosee(i, i)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
