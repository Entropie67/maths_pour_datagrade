import { codageAngle } from '../../../lib/2d/angles'
import {
    CodageAngleDroit,
    codageAngleDroit,
} from '../../../lib/2d/CodageAngleDroit'
import { droite } from '../../../lib/2d/droites'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { projectionOrtho, rotation } from '../../../lib/2d/transformations'
import { bleuMathalea } from '../../../lib/colors'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import { miseEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Utiliser les relations métriques dans un triangle rectangle'
export const dateDePublication = '10/04/2025'
export const interactifReady = false
export const dateDeModifImportante = '31/10/2026'

export const uuid = '4f81e'
export const refs = {
  'fr-ch': ['1mG3-6'],
  'fr-fr': [],
}

/**
 *
 * @author Nathan Scheinmann
 */

export default class RelationsMetriquesTriangleRectangle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : BD-BA',
        '2 : BD-AD',
        '3 : AB-AD',
        '4 : AE-AB',
        '5 : AE-ED',
        '6 : AE-AD',
        '7 : ED-AD',
        '8 : AE-EB',
        '9 : ED-EB',
        '10 : AB-EB',
        '11 : BD-EB',
        '12 : ED-BD',
        '13 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Nom des sommets qui changent']
    this.besoinFormulaire3CaseACocher = ['Appliquer une rotation aux triangles']
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.sup2 = false
    this.sup3 = false
    this.sup = '13'
    this.comment = ` Le triangle EAD est rectangle en E et les triangle AEB et EDB sont rectangles en B.<br>Le type de la question indique les longueurs fournies dans l'énoncé selon le triangle ci-dessous.<br> 
     <pre>      
          E<br>
         /|\\ <br>
        / | \\ <br>
       / | \\ <br>
      / | \\ <br>
     / | \\ <br>
    A-----B-----D <pre>`
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 12,
      melange: 13,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    this.consigne = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      let objetsEnonce = []
      const listeDeNomsDePolygones: string[] = []
      // Helper function to adjust the label anchor based on the quadrant of angle2
      function adjustedAnchor(base: string, angle2: number): string {
        // Define the order of anchors (clockwise order):
        // For no rotation (angle2=0), these positions mean:
        // "above right": top-right, "above left": top-left, "below left": bottom-left, "below right": bottom-right.
        const anchors = [
          'above right',
          'above left',
          'below left',
          'below right',
        ]
        const baseIndex = anchors.indexOf(base)
        if (baseIndex === -1) return base // fallback if base label isn't recognized

        // Determine the quadrant of angle2: 0 for [0,90), 1 for [90,180), etc.
        const quadrant = Math.floor(angle2 / 90)
        const newIndex = (baseIndex + quadrant) % 4
        return anchors[newIndex]
      }

      // Original code with quadrant-based label adjustments:

      const center = pointAbstrait(0, 0) // Define the center of rotation
      let angle = 90
      let angle2 = 0
      if (this.sup3 === true) {
        angle = choice([-1, 1]) * randint(45, 125) // Random angle for rotation
        angle2 = randint(0, 360)
      }

      const r = 5

      // For point D, base anchor is "below right"
      const labelD = adjustedAnchor('below right', angle2)
      const D = rotation(pointAbstrait(r, 0), center, angle2, 'D', labelD)

      // For point A, base anchor is "below left"
      const labelA = adjustedAnchor('below left', angle2)
      const A = rotation(pointAbstrait(-r, 0), center, angle2, 'A', labelA)

      // For point E, the base anchor depends on the value of angle
      const baseE = angle < 0 ? 'below right' : 'above left'
      const labelE = adjustedAnchor(baseE, angle2)
      const E = rotation(D, center, angle, 'E', labelE)

      // Define line dAD from A to D
      const dAD = droite(A, D)

      // For point B, again the base anchor depends on angle:
      const baseB = angle < 0 ? 'above left' : 'below right'
      const labelB = adjustedAnchor(baseB, angle2)
      const B = projectionOrtho(E, dAD, 'B', labelB)

      const C = D // pointAbstrait(AC, 0, 'C', 'below')
      const ADE = polygone(A, D, E)
      const ADESED = segment(E, D, bleuMathalea)
      const ADESAD = segment(A, D)
      const ADESAE = segment(A, E, 'red')
      const AEBSAB = segment(A, B, 'red')
      const AEBSEB = segment(E, B, bleuMathalea)
      const AEBSEA = segment(A, E)
      const DEBSED = segment(D, E)
      const DEBSEB = segment(E, B, 'red')
      const DEBSBD = segment(B, D, bleuMathalea)

      const sEB = segment(E, B)
      const codageDroitAED = codageAngleDroit(A, E, D)
      const codageDroitABE = codageAngleDroit(A, B, E)
      const codageDroitDBE = codageAngleDroit(D, B, E)
      const nomDesSommets = creerNomDePolygone(5, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nomDesSommets)
      if (this.sup2 === true) {
        A.nom = nomDesSommets[0]
        B.nom = nomDesSommets[1]
        C.nom = nomDesSommets[2]
        D.nom = nomDesSommets[3]
        E.nom = nomDesSommets[4]
      }
      const labels = labelPoint(A, B, C, D, E)

      objetsEnonce = [ADE, sEB, codageDroitABE, codageDroitAED, labels]
      const objetsCorr1 = [ADE, sEB, codageDroitABE, codageDroitAED, labels]
      const codageEAB = codageAngle(
        E,
        A,
        B,
        2,
        '|',
        'black',
        0.5,
        0.2,
        bleuMathalea,
        0.8,
        false,
        false,
      )
      const codageEDB = codageAngle(
        E,
        D,
        B,
        2,
        '||',
        'black',
        0.5,
        0.2,
        'red',
        0.8,
        false,
        false,
      )
      const codageAEB = codageAngle(
        A,
        E,
        B,
        2,
        '||',
        'black',
        0.5,
        0.2,
        'red',
        0.8,
        false,
        false,
      )
      const codageBED = codageAngle(
        B,
        E,
        D,
        2,
        '|',
        'black',
        0.5,
        0.2,
        bleuMathalea,
        0.8,
        false,
        false,
      )
      objetsCorr1.push(codageEAB as CodageAngleDroit)
      objetsCorr1.push(codageEDB as CodageAngleDroit)
      objetsCorr1.push(codageDroitDBE as CodageAngleDroit)
      if (this.correctionDetaillee) {
        texteCorr += `Les trois triangles sont rectangles. Les deux triangles inscrits dans le triangle $\\triangle ${A.nom}${E.nom}${D.nom}$ partage un angle avec ce même triangle, l'angle $\\widehat{${E.nom}${A.nom}${D.nom}}$ pour le triangle $\\triangle ${A.nom}${E.nom}${B.nom}$ (en bleu ci-dessous) et l'angle $\\widehat{${E.nom}${D.nom}${A.nom}}$ pour le triangle $\\triangle ${E.nom}${D.nom}${B.nom}$ (en rouge ci-dessous).`
        texteCorr +=
          '<br>' +
          mathalea2d(
            Object.assign(
              { pixelParCm: 25, scale: 0.4 },
              fixeBordures(objetsCorr1),
            ),
            objetsCorr1,
          )
        texteCorr += `Deux triangles qui ont deux paires d'angles égaux ont également leur troisième paire d'angles égaux. Par conséquent, les trois triangles $\\triangle ${A.nom}${E.nom}${D.nom}$, $\\triangle ${A.nom}${E.nom}${B.nom}$ et $\\triangle ${E.nom}${D.nom}${B.nom}$ sont semblables. On identifie les côtés correspondants comme ci-dessous.`
        const labelsAED = labelPoint(A, E, D)
        const labelsABE = labelPoint(A, E, B)
        const labelsEDB = labelPoint(E, D, B)
        const objetsTrAED = [
          ADESAD,
          ADESAE,
          ADESED,
          labelsAED,
          codageDroitAED,
          codageEDB,
          codageEAB,
        ]
        const objetsTrAEB = [
          AEBSAB,
          AEBSEA,
          AEBSEB,
          labelsABE,
          codageDroitABE,
          codageAEB,
          codageEAB,
        ]
        const objetsTrEDB = [
          DEBSBD,
          DEBSEB,
          DEBSED,
          labelsEDB,
          codageDroitDBE,
          codageEDB,
          codageBED,
        ]
        texteCorr +=
          '<br>' +
          mathalea2d(
            Object.assign(
              { pixelParCm: 25, scale: 0.4, display: 'inline-block' } as const,
              fixeBordures(objetsTrAED),
            ),
            objetsTrAED,
          )
        texteCorr += mathalea2d(
          Object.assign(
            { pixelParCm: 25, scale: 0.4, display: 'inline-block' } as const,
            fixeBordures(objetsTrAEB),
          ),
          objetsTrAEB,
        )
        texteCorr += mathalea2d(
          Object.assign(
            { pixelParCm: 25, scale: 0.4, display: 'inline-block' } as const,
            fixeBordures(objetsTrEDB),
          ),
          objetsTrEDB,
        )
        texteCorr += `<br>Par le théorème de Thalès, on a les rapports suivants : 
      <br><br>
      $\\begin{aligned}    
      \\dfrac{${miseEnCouleur(`${A.nom}${E.nom}`, 'red')}}{${miseEnCouleur(`${A.nom}${D.nom}`, 'black')}} = \\dfrac{${miseEnCouleur(`${A.nom}${B.nom}`, 'red')}}{${miseEnCouleur(`${A.nom}${E.nom}`, 'black')}} = \\dfrac{${miseEnCouleur(`${E.nom}${B.nom}`, 'red')}}{${miseEnCouleur(`${E.nom}${D.nom}`, 'black')}}\\\\\\\\
      \\dfrac{${miseEnCouleur(`${A.nom}${E.nom}`, 'red')}}{${miseEnCouleur(`${E.nom}${D.nom}`, bleuMathalea)}} = \\dfrac{${miseEnCouleur(`${A.nom}${B.nom}`, 'red')}}{${miseEnCouleur(`${E.nom}${B.nom}`, bleuMathalea)}} = \\dfrac{${miseEnCouleur(`${E.nom}${B.nom}`, 'red')}}{${miseEnCouleur(`${B.nom}${D.nom}`, bleuMathalea)}}\\\\\\\\
      \\dfrac{${miseEnCouleur(`${A.nom}${D.nom}`, 'black')}}{${miseEnCouleur(`${E.nom}${D.nom}`, bleuMathalea)}} = \\dfrac{${miseEnCouleur(`${A.nom}${E.nom}`, 'black')}}{${miseEnCouleur(`${E.nom}${B.nom}`, bleuMathalea)}} = \\dfrac{${miseEnCouleur(`${E.nom}${D.nom}`, 'black')}}{${miseEnCouleur(`${B.nom}${D.nom}`, bleuMathalea)}}
      \\end{aligned}$`
      } else {
        texteCorr += `Les trois triangles $\\triangle ${A.nom}${E.nom}${D.nom}$, $\\triangle ${A.nom}${E.nom}${B.nom}$ et $\\triangle ${E.nom}${D.nom}${B.nom}$ sont semblables, car ils sont tous rectangles et que $\\widehat{EAD}=\\widehat{EAB}$ et $\\widehat{EDA}=\\widehat{EDB}$.`
      }
      texte += 'Déterminer la longueur des segments '
      switch (listeTypeDeQuestions[i]) {
        // Cas 1 – Données : AB et BD
        case 1: {
          const abVal = randint(5, 10)
          const bdVal = randint(2, abVal, [abVal])
          texte += `$${A.nom}${E.nom}, ${E.nom}${D.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + B.nom} = ${abVal}\\text{ cm}$ et $${B.nom + D.nom} = ${bdVal}\\text{ cm}$.`
          const racineExtraite1 = extraireRacineCarree(abVal * bdVal)
          const racineExtraite2 = extraireRacineCarree(
            abVal * bdVal + bdVal * bdVal,
          )
          const racineExtraite3 = extraireRacineCarree(
            abVal * bdVal + abVal * abVal,
          )

          texteCorr += `<br> 
          On commence par déterminer $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom} = ${abVal} + ${bdVal} = ${miseEnEvidence(`${abVal + bdVal}\\text{ cm}`)}$.
          <br> On détermine $${E.nom + B.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom}${B.nom}}{${E.nom}${B.nom}} = \\dfrac{${E.nom}${B.nom}}{${B.nom}${D.nom}}$, il s'ensuit que $${E.nom + B.nom}^2=${A.nom + B.nom}\\times ${B.nom + D.nom} = ${abVal} \\times ${bdVal} = ${abVal * bdVal}\\text{ cm}$, d'où $${E.nom + B.nom} =${racineExtraite1[1] === abVal * bdVal ? ` ${miseEnEvidence(`\\sqrt{${abVal * bdVal}}\\text{ cm}`)}` : `\\sqrt{${abVal * bdVal}}=${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`}$.<br>
          On détermine $${E.nom + D.nom}$ et $${A.nom + E.nom}$ en utilisant le théorème de Pythagore. On a 
          $${E.nom + D.nom} = \\sqrt{${E.nom + B.nom}^2+${B.nom + D.nom}^2}$, d'où 
          $${E.nom + D.nom}=${racineExtraite2[1] === abVal * bdVal + bdVal * bdVal ? `${miseEnEvidence(`\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}`)}` : `\\sqrt{${abVal * bdVal + bdVal * bdVal}}= ${miseEnEvidence(`${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}`)}`}$.
          <br>On a
          $${A.nom + E.nom} = \\sqrt{${A.nom + B.nom}^2 + ${B.nom + E.nom}^2}$, d'où
          $${A.nom + E.nom}=${racineExtraite3[1] === abVal * bdVal + abVal * abVal ? `${miseEnEvidence(`\\sqrt{${abVal * bdVal + abVal * abVal}}\\text{ cm}`)}` : `\\sqrt{${abVal * bdVal + abVal * abVal}}= ${miseEnEvidence(`${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}`)}`}$.
          `
          break
        }

        // Cas 2 – Données : BD et AD
        case 2: {
          const lVal = randint(12, 20)
          let abVal: number
          let bdVal: number
          do {
            bdVal = randint(2, lVal - 2)
            abVal = lVal - bdVal
          } while (abVal === bdVal)
          texte += `$${A.nom}${E.nom}, ${A.nom}${B.nom}, ${E.nom}${B.nom}$ et $${E.nom}${D.nom}$, si `
          texte += `$${B.nom + D.nom} = ${bdVal}\\text{ cm}$ et $${A.nom + D.nom} = ${lVal}\\text{ cm}$.`

          const racineExtraite1 = extraireRacineCarree(abVal * bdVal)
          const racineExtraite2 = extraireRacineCarree(
            abVal * bdVal + bdVal * bdVal,
          )
          const racineExtraite3 = extraireRacineCarree(
            abVal * bdVal + abVal * abVal,
          )

          texteCorr += `<br>
  On commence par déterminer $${A.nom + B.nom}$. On a 
  $
    ${A.nom + B.nom} = ${A.nom + D.nom} - ${B.nom + D.nom}$,
  d'où 
   $ ${A.nom + B.nom} = ${lVal} - ${bdVal} = ${miseEnEvidence(`${abVal}\\text{ cm}`)}$,
  <br>
  On détermine ensuite $${E.nom + B.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} 
  $
    \\dfrac{${A.nom}${B.nom}}{${E.nom}${B.nom}} = \\dfrac{${E.nom}${B.nom}}{${B.nom}${D.nom}}$,
  il s'ensuit que
  $
    ${E.nom + B.nom}^2 = ${A.nom + B.nom} \\times ${B.nom + D.nom} = ${abVal} \\times ${bdVal} = ${abVal * bdVal}\\text{ cm}^2
  $,
  d'où 
  $
    ${E.nom + B.nom} = ${
      racineExtraite1[1] === abVal * bdVal
        ? miseEnEvidence(`\\sqrt{${abVal * bdVal}}\\text{ cm}`)
        : `\\sqrt{${abVal * bdVal}} = ${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`
    }$,
  <br>
  On détermine $${E.nom + D.nom}$ en appliquant le théorème de Pythagore. On a 
  $
    ${E.nom + D.nom} = \\sqrt{{${E.nom + B.nom}}^2 + {${B.nom + D.nom}}^2} = \\sqrt{${abVal * bdVal} + ${bdVal * bdVal}} = \\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}$,
  d'où $
    ${E.nom + D.nom} = ${
      racineExtraite2[1] === abVal * bdVal + bdVal * bdVal
        ? miseEnEvidence(`\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}`)
        : `\\sqrt{${abVal * bdVal + bdVal * bdVal}} = ${miseEnEvidence(`${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}`)}`
    }$,
  <br>
  Enfin, on détermine $${A.nom + E.nom}$ en appliquant le théorème de Pythagore. On a 
    $${A.nom + E.nom} = \\sqrt{{${A.nom + B.nom}}^2 + {${E.nom + B.nom}}^2} = \\sqrt{${abVal * abVal} + ${abVal * bdVal}} = \\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}$,
  d'où 
  $${A.nom + E.nom} = ${
    racineExtraite3[1] === abVal * abVal + abVal * bdVal
      ? miseEnEvidence(`\\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}`)
      : `\\sqrt{${abVal * abVal + abVal * bdVal}} = ${miseEnEvidence(`${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}`)}`
  }$.`
          break
        }

        // Cas 3 – Données : AB et AD
        case 3: {
          const lVal = randint(12, 20)
          let abVal: number
          let bdVal: number
          do {
            bdVal = randint(2, lVal - 2)
            abVal = lVal - bdVal
          } while (abVal === bdVal)
          texte += `$${A.nom}${E.nom}, ${E.nom}${D.nom}, ${E.nom}${B.nom}$ et $${B.nom}${D.nom}$, si `
          texte += `$${A.nom + B.nom} = ${abVal}\\text{ cm}$ et $${A.nom + D.nom} = ${lVal}\\text{ cm}$.`

          // Calcul des racines extraites pour simplifier les résultats :
          const racineExtraite1 = extraireRacineCarree(abVal * bdVal)
          const racineExtraite2 = extraireRacineCarree(
            abVal * bdVal + bdVal * bdVal,
          )
          const racineExtraite3 = extraireRacineCarree(
            abVal * abVal + abVal * bdVal,
          )

          texteCorr += `<br>
  On commence par déterminer $${B.nom + D.nom}$ : comme $${B.nom + D.nom} = ${A.nom + D.nom} - ${A.nom + B.nom}$, on a $${B.nom + D.nom} = ${lVal} - ${abVal} = ${miseEnEvidence(`${bdVal}\\text{ cm}`)}$. 

  <br>
  On détermine ensuite $${E.nom + B.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} 
  $
    \\dfrac{${A.nom}${B.nom}}{${E.nom}${B.nom}} = \\dfrac{${E.nom}${B.nom}}{${B.nom}${D.nom}}$,
  on a 
  $
    ${E.nom + B.nom}^2 = ${A.nom + B.nom} \\times ${B.nom + D.nom} = ${abVal} \\times ${bdVal} = ${abVal * bdVal}\\text{ cm}^2
  $,
  d'où 
  $
    ${E.nom + B.nom} = ${
      racineExtraite1[1] === abVal * bdVal
        ? miseEnEvidence(`\\sqrt{${abVal * bdVal}}\\text{ cm}`)
        : `\\sqrt{${abVal * bdVal}} = ${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`
    }$,
  <br>
  On détermine $${E.nom + D.nom}$ en appliquant le théorème de Pythagore. On a 
  $
    ${E.nom + D.nom} = \\sqrt{{${E.nom + B.nom}}^2 + {${B.nom + D.nom}}^2} = \\sqrt{${abVal * bdVal} + ${bdVal * bdVal}} = \\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}$,
  d'où $
    ${E.nom + D.nom} = ${
      racineExtraite2[1] === abVal * bdVal + bdVal * bdVal
        ? miseEnEvidence(`\\sqrt{${abVal * bdVal + bdVal * bdVal}}\\text{ cm}`)
        : `\\sqrt{${abVal * bdVal + bdVal * bdVal}} = ${miseEnEvidence(`${racineExtraite2[0]}${racineExtraite2[1] === 1 ? '' : `\\sqrt{${racineExtraite2[1]}}`}\\text{ cm}`)}`
    }$,
  <br>
  Enfin, on détermine $${A.nom + E.nom}$ en appliquant le théorème de Pythagore. On a 
    $${A.nom + E.nom} = \\sqrt{{${A.nom + B.nom}}^2 + {${E.nom + B.nom}}^2} = \\sqrt{${abVal * abVal} + ${abVal * bdVal}} = \\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}$,
  d'où 
  $${A.nom + E.nom} = ${
    racineExtraite3[1] === abVal * abVal + abVal * bdVal
      ? miseEnEvidence(`\\sqrt{${abVal * abVal + abVal * bdVal}}\\text{ cm}`)
      : `\\sqrt{${abVal * abVal + abVal * bdVal}} = ${miseEnEvidence(`${racineExtraite3[0]}${racineExtraite3[1] === 1 ? '' : `\\sqrt{${racineExtraite3[1]}}`}\\text{ cm}`)}`
  }$.`
          break
        }

        // Cas 4 – Données : AE et AB
        case 4: {
          const a = randint(6, 20)
          const abVal = randint(3, a - 1) // on demande a > AB
          texte += `$${E.nom}${D.nom}, ${B.nom}${D.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + E.nom} = ${a}\\text{ cm}$ et $${A.nom + B.nom} = ${abVal}\\text{ cm}$.`
          const racineExtraite1 = extraireRacineCarree(a * a - abVal * abVal)
          const bdVal = new FractionEtendue(a * a - abVal * abVal, abVal)
          const ebCarreVal = new FractionEtendue(a * a - abVal * abVal, 1)
          const edVal = bdVal.produitFraction(bdVal).sommeFraction(ebCarreVal)

          texteCorr += `<br>
          On commence par déterminer $${E.nom + B.nom}$. Par le théorème de Pythagore, on a $${E.nom + B.nom} = \\sqrt{${A.nom + E.nom}^2 - ${A.nom + B.nom}^2}$, d'où $${E.nom + B.nom} = \\sqrt{${a}^2 - ${abVal}^2} = ${racineExtraite1[1] === a * a - abVal * abVal ? miseEnEvidence(`\\sqrt{${a * a - abVal * abVal}}\\text{ cm}`) : `\\sqrt{${a * a - abVal * abVal}} = ${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`}$.
          <br> ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${B.nom + D.nom}= \\dfrac{${E.nom + B.nom}^2}{${A.nom + B.nom}}=${miseEnEvidence(bdVal.texFractionSimplifiee + '\\text{ cm}')}$.
          <br> On détermine $ED$ à l'aide du théorème de Pythagore. On a $${E.nom + D.nom}=\\sqrt{${E.nom + B.nom}^2+${B.nom + D.nom}^2}$, d'où $${E.nom + D.nom}=\\sqrt{(${racineExtraite1[1] === a * a - abVal * abVal ? `\\sqrt{${a * a - abVal * abVal}}` : `${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}`})^2+${bdVal.simplifie().texParentheses}^2}=${miseEnEvidence(edVal.simplifie().texRacineCarree() + '\\text{ cm}')}$
          <br> Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}$, d'où $${A.nom + D.nom} = ${abVal} + ${bdVal.texFractionSimplifiee} = ${miseEnEvidence(bdVal.ajouteEntier(abVal).texFractionSimplifiee + '\\text{ cm}')}$.
  `
          break
        }

        // Cas 5 – Données : AE et ED
        case 5: {
          const aeVal = randint(3, 20)
          const edVal = randint(3, 20, [aeVal]) // on demande a > d
          const racineExtraite1 = extraireRacineCarree(
            aeVal * aeVal + edVal * edVal,
          )
          const ebCarreVal = new FractionEtendue(
            aeVal * aeVal * edVal * edVal,
            aeVal * aeVal + edVal * edVal,
          )
          const adCarreVal = aeVal * aeVal + edVal * edVal
          const abCarreVal = new FractionEtendue(
            aeVal * aeVal * aeVal * aeVal,
            adCarreVal,
          )
          texte += `$${A.nom}${B.nom}, ${B.nom}${D.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + E.nom} = ${aeVal}\\text{ cm}$ et $${E.nom + D.nom} = ${edVal}\\text{ cm}$.`
          texteCorr += `
          <br>On détermine $${A.nom + D.nom}$ à l'aide du théorème de Pythagore. On a $${A.nom + D.nom} = \\sqrt{${A.nom + E.nom}^2 + ${E.nom + D.nom}^2}$, d'où $${A.nom + D.nom} = \\sqrt{${aeVal}^2 + ${edVal}^2} = ${racineExtraite1[1] === aeVal * aeVal + edVal * edVal ? miseEnEvidence(`\\sqrt{${aeVal * aeVal + edVal * edVal}}\\text{ cm}`) : `\\sqrt{${aeVal * aeVal + edVal * edVal}} = ${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`}$
          <br> ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + E.nom}}{${A.nom + D.nom}}=\\dfrac{${E.nom + B.nom}}{${E.nom + D.nom}}$, il s'ensuit que $${E.nom + B.nom}=\\dfrac{${A.nom + E.nom}\\times ${E.nom + D.nom}}{${A.nom + D.nom}}=${miseEnEvidence(ebCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          <br> On peut à présent utiliser le théorème de Thalès ou le théorème de Pythagore pour déterminer $${A.nom + B.nom}$ ou $${B.nom + D.nom}$.<br>On utilise une des relations données par le théorème de Thalès pour déterminer $${A.nom + B.nom}$. 
          On a $\\dfrac{${A.nom + E.nom}}{${A.nom + D.nom}}=\\dfrac{${A.nom + B.nom}}{${A.nom + E.nom}}$ d'où $${A.nom + B.nom}=\\dfrac{${A.nom + E.nom}^2}{${A.nom + D.nom}}=${miseEnEvidence(abCarreVal.simplifie().texRacineCarree())}$.
          <br> Enfin, on a que $${B.nom + D.nom} = ${A.nom + D.nom}-${A.nom + B.nom}=${racineExtraite1[1] === aeVal * aeVal + edVal * edVal ? `\\sqrt{${aeVal * aeVal + edVal * edVal}}` : `${`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}`}`}-${abCarreVal.simplifie().texRacineCarree()}=${miseEnEvidence(ebCarreVal.produitFraction(ebCarreVal).diviseFraction(abCarreVal).simplifie().texRacineCarree() + '\\text{ cm}')}$.
          `
          break
        }

        // Cas 6 – Données : AE et AD
        case 6: {
          const aeVal = randint(6, 15)
          const adVal = randint(aeVal + 2, aeVal + 10) // on demande AD > AE
          const edValCarre = adVal * adVal - aeVal * aeVal
          const racineExtraite1 = extraireRacineCarree(edValCarre)
          const ebValCarre = new FractionEtendue(
            aeVal * aeVal * edValCarre,
            adVal * adVal,
          ).simplifie()
          const bdValCarre = new FractionEtendue(
            edValCarre,
            1,
          ).differenceFraction(ebValCarre)
          const abValCarre = new FractionEtendue(
            aeVal * aeVal,
            1,
          ).differenceFraction(ebValCarre)
          texte += `$${A.nom}${B.nom}, ${E.nom}${D.nom}, ${E.nom}${B.nom}$ et $${B.nom}${D.nom}$, si `
          texte += `$${A.nom + E.nom} = ${aeVal}\\text{ cm}$ et $${A.nom + D.nom} = ${adVal}\\text{ cm}$.`
          texteCorr += `<br> Par le théorème de Pythagore, on a $${E.nom + D.nom} = \\sqrt{${A.nom + D.nom}^2 - ${A.nom + E.nom}^2}$, d'où $${E.nom + D.nom} = \\sqrt{${adVal}^2 - ${aeVal}^2} = ${racineExtraite1[1] === adVal * adVal - aeVal * aeVal ? miseEnEvidence(`\\sqrt{${adVal * adVal - aeVal * aeVal}}\\text{ cm}`) : `\\sqrt{${adVal * adVal - aeVal * aeVal}} = ${miseEnEvidence(`${racineExtraite1[0]}${racineExtraite1[1] === 1 ? '' : `\\sqrt{${racineExtraite1[1]}}`}\\text{ cm}`)}`}$.
          <br> ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + E.nom}}{${A.nom + D.nom}}=\\dfrac{${E.nom + B.nom}}{${E.nom + D.nom}}$, il s'ensuit que $${E.nom + B.nom}=\\dfrac{${A.nom + E.nom}\\times ${E.nom + D.nom}}{${A.nom + D.nom}}=${miseEnEvidence(ebValCarre.texRacineCarree() + '\\text{ cm}')}$.
          <br> On peut à présent utiliser le théorème de Thalès ou le théorème de Pythagore pour déterminer $${A.nom + B.nom}$ ou $${B.nom + D.nom}$.<br>On utilise le théorème de Pythagore. On a 
          $${A.nom + B.nom}= \\sqrt{${A.nom + E.nom}^2 - ${E.nom + B.nom}^2}$, d'où $${A.nom + B.nom}=\\sqrt{${aeVal * aeVal} - ${ebValCarre.texFractionSimplifiee}}=${miseEnEvidence(abValCarre.texRacineCarree() + '\\text{ cm}')}$.
          <br> Enfin, on détermine $${B.nom + D.nom}$. On a $${B.nom + D.nom} = ${A.nom + D.nom}-${A.nom + B.nom}=${adVal}-${abValCarre.texRacineCarree()}=${miseEnEvidence(bdValCarre.texRacineCarree() + '\\text{ cm}')}$.
          `
          break
        }

        // ==================================================
        // CAS 7 – Données : ED et AD
        // On cherche AB, AE, EB et BD
        // ==================================================
        case 7: {
          // 1) Données aléatoires pour ED (edVal) et AD (adVal)
          const edVal = randint(5, 12) // ED
          const adVal = randint(edVal + 2, edVal + 10) // AD > ED
          const aeCarre = adVal * adVal - edVal * edVal
          const aeSimpl = extraireRacineCarree(aeCarre)
          const ebValCarre = new FractionEtendue(
            edVal * edVal * aeCarre,
            adVal * adVal,
          )
          const abValCarre = new FractionEtendue(aeCarre, 1)
            .differenceFraction(ebValCarre)
            .simplifie()
          // 2) On prépare l'énoncé
          texte += `$${A.nom}${B.nom}, ${A.nom}${E.nom}, ${E.nom}${B.nom}$ et $${B.nom}${D.nom}$,`
          texte += ` si $${E.nom + D.nom} = ${edVal}\\text{ cm}$ et $${A.nom + D.nom} = ${adVal}\\text{ cm}$.`

          // 3) Correction : calculs et justifications
          // - Triangle AED rectangle en E => AE^2 + ED^2 = AD^2
          // - Relation de similarité ou Thalès : AE/AD = EB/ED
          // - Triangle AEB rectangle en B => AB^2 + EB^2 = AE^2
          // - AB + BD = AD

          texteCorr += `<br>
    On a $${A.nom + E.nom}^2 = ${A.nom + D.nom}^2 - ${E.nom + D.nom}^2 = ${adVal}^2 - ${edVal}^2 = ${aeCarre}$, 
    d'où $${A.nom + E.nom} = ${
      aeSimpl[1] === aeCarre
        ? miseEnEvidence(`\\sqrt{${aeCarre}}\\text{ cm}`)
        : `\\sqrt{${aeCarre}} = ${miseEnEvidence(`${aeSimpl[0]}${aeSimpl[1] === 1 ? '' : `\\sqrt{${aeSimpl[1]}}`}\\text{ cm}`)}`
    }.$

    <br>
    ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + E.nom}}{${A.nom + D.nom}} = \\dfrac{${E.nom + B.nom}}{${E.nom + D.nom}}$,
    il s'ensuit que $${E.nom + B.nom} = \\dfrac{${A.nom + E.nom}\\times ${E.nom + D.nom}}{${A.nom + D.nom}} = ${miseEnEvidence(ebValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}.$

    <br>
   Par le théorème de Pythagore, on a 
    $${A.nom + B.nom} = \\sqrt{${A.nom + E.nom}^2 - ${E.nom + B.nom}^2}$ d'où $${A.nom + B.nom} = \\sqrt{${aeCarre} - ${ebValCarre.simplifie().texFractionSimplifiee}} = ${miseEnEvidence(abValCarre.texRacineCarree() + '\\text{ cm}')}.$

    <br>
    Enfin, $${B.nom + D.nom} = ${A.nom + D.nom} - ${A.nom + B.nom}=${miseEnEvidence(
      ebValCarre
        .multiplieEntier(edVal * edVal)
        .diviseEntier(aeCarre)
        .inverse()
        .simplifie()
        .texRacineCarree() + '~cm',
    )}.$ 
  `
          break
        }
        // Cas 8 – Données : AE et EB
        case 8: {
          const aeVal = randint(6, 20)
          const ebVal = randint(2, aeVal - 1)
          const abValCarre = aeVal * aeVal - ebVal * ebVal
          const bdValCarre = new FractionEtendue(
            ebVal * ebVal * ebVal * ebVal,
            abValCarre,
          )
          const edValCarre = new FractionEtendue(
            ebVal * ebVal,
            1,
          ).sommeFraction(bdValCarre)
          const adVal = edValCarre
            .ajouteEntier(aeVal * aeVal)
            .simplifie()
            .texRacineCarree()
          texte += `$${A.nom}${B.nom}, ${E.nom}${D.nom}, ${B.nom}${D.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + E.nom} = ${aeVal}\\text{ cm}$ et $${E.nom + B.nom} = ${ebVal}\\text{ cm}$.`
          texteCorr += `<br> On commence par déterminer $${A.nom + B.nom}$. Par le théorème de Pythagore, on a $${A.nom + B.nom} = \\sqrt{${A.nom + E.nom}^2 - ${E.nom + B.nom}^2}$, d'où $${A.nom + B.nom} = \\sqrt{${aeVal}^2 - ${ebVal}^2} = ${miseEnEvidence(new FractionEtendue(abValCarre, 1).texRacineCarree() + '\\text{ cm}')}$.<br>
          On détermine ensuite $${B.nom + D.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${B.nom + D.nom}=\\dfrac{${E.nom + B.nom}^2}{${A.nom + B.nom}}=${miseEnEvidence(bdValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          <br>On détermine $${E.nom + D.nom}$ en appliquant le théorème de Pythagore. On a $${E.nom + D.nom} = \\sqrt{{${E.nom + B.nom}}^2 + {${B.nom + D.nom}}^2} = \\sqrt{${ebVal * ebVal} + ${bdValCarre.simplifie().texFractionSimplifiee}} = ${miseEnEvidence(edValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          <br>Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}=${miseEnEvidence(adVal + '\\text{ cm}')}$.
          `
          break
        }

        // Cas 9 – Données : ED et EB
        case 9: {
          const edVal = randint(3, 20)
          const ebVal = randint(2, edVal - 1)
          const bdValCarre = edVal * edVal - ebVal * ebVal
          const abValCarre = new FractionEtendue(
            ebVal * ebVal * ebVal * ebVal,
            bdValCarre,
          )
          const aeValCarre = new FractionEtendue(
            ebVal * ebVal,
            1,
          ).sommeFraction(abValCarre)
          const adVal = aeValCarre
            .ajouteEntier(edVal * edVal)
            .simplifie()
            .texRacineCarree()
          texte += `$${A.nom}${E.nom}, ${A.nom}${B.nom}, ${B.nom}${D.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${E.nom + D.nom} = ${edVal}\\text{ cm}, ${E.nom + B.nom} = ${ebVal}\\text{ cm}$.`
          texteCorr += `
          <br>
          On détermine $${B.nom + D.nom}$ à l'aide du théorème de Pythagore. On a $${B.nom + D.nom} = \\sqrt{${E.nom + D.nom}^2 - ${E.nom + B.nom}^2}$, d'où $${B.nom + D.nom} = \\sqrt{${edVal}^2 - ${ebVal}^2} = ${miseEnEvidence(new FractionEtendue(bdValCarre, 1).texRacineCarree() + '\\text{ cm}')}$.
         <br>On détermine ensuite $${A.nom + B.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${A.nom + B.nom}=\\dfrac{${E.nom + B.nom}^2}{${B.nom + D.nom}}=${miseEnEvidence(abValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
         <br> On détermine $${A.nom + E.nom}$ en appliquant le théorème de Pythagore. On a $${A.nom + E.nom} = \\sqrt{{${A.nom + B.nom}}^2 + {${E.nom + B.nom}}^2} = \\sqrt{${abValCarre.simplifie().texFractionSimplifiee} + ${ebVal * ebVal}} = ${miseEnEvidence(aeValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
         <br> Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}=${miseEnEvidence(adVal + '\\text{ cm}')}$.
          `
          break
        }

        // Cas 10 – Données : AB et EB
        case 10: {
          const abVal = randint(5, 20)
          const ebVal = randint(2, abVal - 1)
          const aeValCarre = abVal * abVal + ebVal * ebVal
          const bdValCarre = new FractionEtendue(
            ebVal * ebVal * ebVal * ebVal,
            abVal * abVal,
          )
          const edValCarre = new FractionEtendue(
            ebVal * ebVal,
            1,
          ).sommeFraction(bdValCarre)
          const adVal = edValCarre
            .ajouteEntier(aeValCarre)
            .simplifie()
            .texRacineCarree()

          texte += `$${A.nom}${E.nom}, ${E.nom}${D.nom}, ${B.nom}${D.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + B.nom} = ${abVal}\\text{ cm}, ${E.nom + B.nom} = ${ebVal}\\text{ cm}$.`
          texteCorr += `<br>On commence par déterminer $${A.nom + E.nom}$. Par le théorème de Pythagore, on a $${A.nom + E.nom} = \\sqrt{${A.nom + B.nom}^2 + ${E.nom + B.nom}^2}$, d'où $${A.nom + E.nom} = \\sqrt{${abVal}^2 + ${ebVal}^2} = ${miseEnEvidence(new FractionEtendue(aeValCarre, 1).texRacineCarree() + '\\text{ cm}')}$.
          <br> On détermine ensuite $${B.nom + D.nom}$. ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on'} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${B.nom + D.nom}=\\dfrac{${E.nom + B.nom}^2}{${A.nom + B.nom}}=${miseEnEvidence(bdValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          <br> On détermine $${E.nom + D.nom}$ en appliquant le théorème de Pythagore. On a $${E.nom + D.nom} = \\sqrt{{${E.nom + B.nom}}^2 + {${B.nom + D.nom}}^2} = \\sqrt{${ebVal * ebVal} + ${bdValCarre.simplifie().texFractionSimplifiee}} = ${miseEnEvidence(edValCarre.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          <br> Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}=${miseEnEvidence(adVal + '\\text{ cm}')}$.
          `
          break
        }

        // Cas 11 – Données : BD et EB
        case 11: {
          const dbVal = randint(3, 20)
          const ebVal = randint(3, 20, [dbVal])
          const ebCarreVal = ebVal * ebVal
          const edCarreVal = dbVal * dbVal + ebVal * ebVal
          const abCarreVal = new FractionEtendue(
            ebCarreVal * ebCarreVal,
            dbVal * dbVal,
          )
          const aeCarreVal = abCarreVal.ajouteEntier(ebCarreVal)
          const adVal = aeCarreVal
            .ajouteEntier(edCarreVal)
            .simplifie()
            .texRacineCarree()
          texte += `$${A.nom}${E.nom}, ${A.nom}${B.nom}, ${E.nom}${D.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${B.nom + D.nom} = ${dbVal}\\text{ cm}, ${E.nom + B.nom} = ${new FractionEtendue(ebCarreVal, 1).simplifie().texRacineCarree()}\\text{ cm}$.`
          texteCorr += `<br> Par le théorème de Pythagore, on a $${E.nom + D.nom}=\\sqrt{${B.nom + D.nom}^2 + ${E.nom + B.nom}^2}$, d'où $${E.nom + D.nom} = \\sqrt{${dbVal}^2 + ${new FractionEtendue(ebCarreVal, 1).simplifie().texRacineCarree()}^2} = ${miseEnEvidence(new FractionEtendue(edCarreVal, 1).texRacineCarree() + '\\text{ cm}')}$. <br> ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${A.nom + B.nom}=\\dfrac{${E.nom + B.nom}^2}{${B.nom + D.nom}}=${miseEnEvidence(abCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.<br> Par le théorème de Pythagore, on a $${A.nom + E.nom} = \\sqrt{${A.nom + B.nom}^2 + ${E.nom + B.nom}^2}$, d'où $${A.nom + E.nom} = \\sqrt{${abCarreVal.simplifie().texFractionSimplifiee} + ${ebCarreVal}} = ${miseEnEvidence(aeCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.<br> Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}=${miseEnEvidence(adVal + '\\text{ cm}')}$.
          `
          break
        }

        // Cas 12 – Données : ED et BD
        case 12: {
          const edVal = randint(3, 15)
          const bdVal = randint(2, edVal - 1)
          const ebCarreVal = new FractionEtendue(
            edVal * edVal - bdVal * bdVal,
            1,
          )
          const abCarreVal = ebCarreVal
            .produitFraction(ebCarreVal)
            .produitFraction(new FractionEtendue(bdVal * bdVal, 1).inverse())
          const adCarreVal = new FractionEtendue(
            edVal * edVal * edVal * edVal,
            1,
          ).produitFraction(new FractionEtendue(bdVal * bdVal, 1).inverse())
          const aeCarreVal = adCarreVal.ajouteEntier(-edVal * edVal)
          texte += `$${A.nom}${E.nom}, ${A.nom}${B.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${E.nom + D.nom} = ${edVal}\\text{ cm}$ et $${B.nom + D.nom} = ${bdVal}\\text{ cm}$.`
          texteCorr += `<br> Par le théorème de Pythagore, on a $${E.nom + B.nom}^2=\\sqrt{${E.nom + D.nom}^2 - ${B.nom + D.nom}^2}$, d'où $${E.nom + B.nom} = \\sqrt{${edVal}^2 - ${bdVal}^2} = ${miseEnEvidence(ebCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$. <br> ${this.correctionDetaillee ? 'Par la relation' : 'Par le théorème de Thalès, on a '} $\\dfrac{${A.nom + B.nom}}{${E.nom + B.nom}}=\\dfrac{${E.nom + B.nom}}{${B.nom + D.nom}}$, il s'ensuit que $${A.nom + B.nom}=\\dfrac{${E.nom + B.nom}^2}{${B.nom + D.nom}}=${miseEnEvidence(abCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.<br> Par le théorème de Pythagore, on a $${A.nom + E.nom} = \\sqrt{${A.nom + B.nom}^2 + ${E.nom + B.nom}^2}$, d'où $${A.nom + E.nom} = \\sqrt{${abCarreVal.simplifie().texFractionSimplifiee} + ${ebCarreVal.texFractionSimplifiee}} = ${miseEnEvidence(aeCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.<br> Enfin, on détermine $${A.nom + D.nom}$. On a $${A.nom + D.nom} = ${A.nom + B.nom} + ${B.nom + D.nom}=${miseEnEvidence(adCarreVal.simplifie().texRacineCarree() + '\\text{ cm}')}$.
          `
          break
        }
      }

      // Cas 13 – Données : AE et BD de côté pour l'instant, il faut utiliser plus que les simples relations
      /*         case 13: {
          const aeVal = randint(5, 15)
          const bdVal = randint(2, aeVal - 1)

          segments = [[A, E], [B, D]]
          texte += `$${A.nom}${B.nom}, ${E.nom}${D.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${A.nom + E.nom} = ${aeVal}\\text{ cm}, \\quad ${B.nom + D.nom} = ${bdVal}\\text{ cm}$.`
          texteCorr += `<br> D'une part on a par le théorème de Pythagore que $${A.nom+E.nom}^2=${E.nom+B.nom}^2+${A.nom+B.nom}^2$. D'autre part, on par la relation $\\dfrac{${E.nom+B.nom}}{${B.nom+D.nom}}=\\dfrac{${A.nom+B.nom}}{${E.nom+B.nom}}$ on a $${E.nom+B.nom}^2=${A.nom+B.nom}\\times ${B.nom+D.nom}$. On substitue ${E.nom+B.nom}^2$ dans la relation obtenue par le théorème de Pythagore pour obtenir<br>
          \\begin{aligned}
          & ${A.nom + E.nom}^2 = ${A.nom + B.nom} \\times ${B.nom + D.nom} + ${A.nom + B.nom}^2 \\\\
          \\end{aligned}
          `
          break
        } */

      // Cas 14 – Données : ED et AB idem que pour le 13, de côté pour l'instant
      /* case 14: {
          const dVal = randint(3, 10)
          const xVal = randint(5, 10)
          // d^2 = (AD - AB)*AD, avec AB = xVal
          const adVal = (xVal + Math.sqrt(xVal * xVal + 4 * dVal * dVal)) / 2
          const bdVal = adVal - xVal
          segments = [[E, D], [A, B]]
          texte += `$${A.nom}${E.nom}, ${B.nom}${D.nom}, ${E.nom}${B.nom}$ et $${A.nom}${D.nom}$, si `
          texte += `$${E.nom + D.nom} = ${dVal}\\text{ cm}, \\quad ${A.nom + B.nom} = ${xVal}\\text{ cm}$.`
          texteCorr += `
          `
          break
        } */

      // Cas 15 – Données : EB et AD idem que pour le 12 et 13
      /*         case 15: {
          const h = randint(2, 8)
          const lVal = randint(h + 3, h + 12)
          // On pose AB = t tel que t*(L-t)= h^2; t^2 - L*t + h^2 = 0
          const delta = lVal * lVal - 4 * h * h
          const t = (lVal - Math.sqrt(delta)) / 2
          const abVal = t
          const bdVal = lVal - t
          segments = [[E, B], [A, D]]
          texte += `$${A.nom}${E.nom}, ${A.nom}${B.nom}, ${E.nom}${D.nom}$ et $${B.nom}${D.nom}$, si `
          texte += `$${E.nom + B.nom} = ${h}\\text{ cm}$ et $${A.nom + D.nom} = ${lVal}\\text{ cm}$.`
          texteCorr += `
          `
          break
        } */

      texte +=
        '<br>' +
        mathalea2d(
          Object.assign(
            { pixelParCm: 25, scale: 0.4 },
            fixeBordures(objetsEnonce),
          ),
          objetsEnonce,
        )

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
