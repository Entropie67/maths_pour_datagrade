import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { barycentre, nommePolygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { homothetie, rotation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { quatriemeProportionnelle } from '../../lib/outils/calculs'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone, numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '21/03/2022'

export const titre =
  'Calculer une longueur dans un triangle rectangle en utilisant la trigonométrie'

/**
 * @author Jean-claude Lhote à partir de 3G30-1 de Rémi Angot
 * Exercice remplaçant l'exercice initial utilisant MG32
 * Calculer une longueur en utilisant l'un des trois rapport trigonométrique.
 * * Si this.level=4 alors seul le cosinus sera utilisé.
 * Mars 2021
 * combinaisonListes des questions par Guillaume Valmont le 23/05/2022
 */
export const uuid = 'bd6b1'

export const refs = {
  'fr-fr': ['3G30'],
  'fr-ch': ['1mT-5'],
}
export default class CalculDeLongueur extends Exercice {
  level: number
  constructor() {
    super()
    this.nbQuestions = 3

    this.sup = false
    this.sup2 = '7'
    this.sup3 = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.interactif = false
    if (context.isHtml) {
      this.spacing = 2
      this.spacingCorr = 3
    } else {
      this.spacing = 2
      this.spacingCorr = 2
    }
    this.besoinFormulaireCaseACocher = ['Figure à main levée', false]
    this.besoinFormulaire2Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : Côté adjacent (cosinus)\n2 : Côté opposé (sinus)\n3 : Côté opposé (tangente)\n4 : Hypoténuse (cosinus)\n5 : Hypoténuse (sinus)\n 6 : Côté adjacent (tangente)\n7 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Types de correction',
      2,
      '1 : Avec produit en croix\n2 : Sans produit en croix',
    ]
    this.level = 3
  }

  nouvelleVersion() {
    let reponse = 0
    let listeDeNomsDePolygones: string[] = []
    const typeQuestionsDisponibles =
      this.level === 4
        ? gestionnaireFormulaireTexte({
            saisie: this.sup2,
            nbQuestions: this.nbQuestions,
            min: 1,
            max: 2,
            melange: 3,
            defaut: 3,
            listeOfCase: ['cosinus', 'invCosinus'],
          })
        : gestionnaireFormulaireTexte({
            saisie: this.sup2,
            nbQuestions: this.nbQuestions,
            min: 1,
            max: 6,
            melange: 7,
            defaut: 7,
            listeOfCase: [
              'cosinus',
              'sinus',
              'tangente',
              'invCosinus',
              'invSinus',
              'invTangente',
            ],
          })

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0; i < this.nbQuestions; i++) {
      const unite = choice(['m', 'cm', 'dm', 'mm'])
      if (i % 3 === 0) listeDeNomsDePolygones = ['QD']
      const nom = creerNomDePolygone(3, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nom)
      let texte = ''
      let texteAMC = ''
      let q2AMC = ''
      let nom1, nom2
      let texteCorr = ''
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      let ab, bc, ac

      const angleABC = randint(35, 55)
      const angleABCr = (angleABC * Math.PI) / 180
      if (!context.isHtml && this.sup) {
        // texte += '\\begin{minipage}{.7\\linewidth}\n'
      }
      switch (listeTypeQuestions[i]) {
        case 'cosinus': // AB=BCxcos(B)
          bc = randint(10, 15)
          ab = bc * Math.cos(angleABCr)
          ac = bc * Math.sin(angleABCr)
          /* if (this.level === 4) {
            texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[1] + nom[2]}=${texNombre(bc)}\\text{ ${unite}}$, $${nom[0] + nom[2]} = ${texNombre(arrondi(ac, 1))}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          } else { */
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[1] + nom[2]}=${bc}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          // }
          nom1 = nom[0]
          nom2 = nom[1]
          break
        case 'sinus':
          bc = randint(10, 15)
          ab = bc * Math.cos(angleABCr)
          ac = bc * Math.sin(angleABCr)
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[1] + nom[2]}=${bc}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          nom1 = nom[0]
          nom2 = nom[2]
          break
        case 'tangente':
          ab = randint(7, 10)
          ac = ab * Math.tan(angleABCr)
          bc = ab / Math.cos(angleABCr)
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[0] + nom[1]}=${ab}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          nom1 = nom[0]
          nom2 = nom[2]
          break
        case 'invCosinus':
          ab = randint(7, 10)
          bc = ab / Math.cos(angleABCr)
          ac = bc * Math.sin(angleABCr)
          /* if (this.level === 4) {
            texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[0] + nom[1]}=${texNombre(ab)}\\text{ ${unite}}$, $${nom[0] + nom[2]} = ${texNombre(arrondi(ac, 1))}\\text{ ${unite}}$  et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          } else { */
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[0] + nom[1]}=${ab}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          //  }
          nom1 = nom[1]
          nom2 = nom[2]
          break
        case 'invSinus':
          ac = randint(7, 10)
          bc = ac / Math.sin(angleABCr)
          ab = bc * Math.cos(angleABCr)
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[0] + nom[2]}=${ac}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          nom1 = nom[1]
          nom2 = nom[2]
          break
        case 'invTangente':
        default:
          ac = randint(7, 10)
          bc = ac / Math.sin(angleABCr)
          ab = Math.cos(angleABCr) * bc
          texteAMC += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> $${nom[0] + nom[2]}=${ac}\\text{ ${unite}}$ et $\\widehat{${nom}}=${angleABC}^\\circ$.<br>`
          nom1 = nom[0]
          nom2 = nom[1]
          break
      }
      texte +=
        texteAMC + `Calculer $${nom1 + nom2}$ à $0,1\\text{ ${unite}}$ près.`
      q2AMC = `Calculer $${nom1 + nom2}$ au dixième de $\\text{ ${unite}}$.`

      if (!context.isHtml && this.sup) {
        // texte += '\n\\end{minipage}\n'
      }
      const a = pointAbstrait(0, 0)
      const b = pointAbstrait(ab, 0)
      const c = pointAbstrait(0, ac)
      const p1 = polygone(a, b, c)
      // p1.isVisible = false
      const p2 = rotation(p1, a, randint(0, 360))
      const A = p2.listePoints[0]
      const B = p2.listePoints[1]
      const C = p2.listePoints[2]
      const codage = codageAngleDroit(B, A, C)
      A.nom = nom[0]
      B.nom = nom[1]
      C.nom = nom[2]
      const nomme = nommePolygone(p2, nom)
      const hypo = segment(C, B, bleuMathalea)
      hypo.epaisseur = 2
      const codageDeAngle = codageAngle(A, B, C, 2)
      const mAB = milieu(A, B)
      const mAC = milieu(A, C)
      const mBC = milieu(B, C)
      const G = barycentre(p2)
      const m3 = homothetie(mBC, G, 1 + 1.5 / longueur(G, mBC), 'm3', 'center')
      const m1 = homothetie(
        mAB,
        mBC,
        1 + 1.5 / longueur(mBC, mAB),
        'm1',
        'center',
      )
      const m2 = homothetie(
        mAC,
        mBC,
        1 + 1.5 / longueur(mBC, mAC),
        'm2',
        'center',
      )
      let m4
      let t1, t2, t3
      let nomLongueur // la longueur à déterminer
      let calcul0 = ''
      let calcul1 = ''
      let calcul2 = ''
      let calcul3 = ''
      let calcul4 = ''
      let calcul5 = '' // les propsitions de calcul pour AMC
      let calculTrue
      switch (listeTypeQuestions[i]) {
        case 'cosinus': // AB=BCxcos(B)
          t3 = latexParPoint(
            `${bc} \\text{ ${unite}}`,
            m3,
            'black',
            120,
            12,
            '',
          )
          t2 = latexParPoint('?', m1, 'black', 120, 12, '')
          /*  if (this.level === 4) {
            const mAC = milieu(A, C)
            const tAC = latexParPoint(
              `${texNombre(arrondi(ac, 1))} \\text{ ${unite}}`,
              mAC,
              'black',
              120,
              12,
              '',
            )
            objetsEnonce.push(tAC)
          } */
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t1 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 20, 12, '')
          break
        case 'sinus':
          t3 = latexParPoint(
            `${bc} \\text{ ${unite}}`,
            m3,
            'black',
            120,
            12,
            '',
          )
          t2 = latexParPoint('?', m2, 'black', 120, 12, '')
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t1 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 100, 12, '')
          break
        case 'tangente':
          t1 = latexParPoint(
            `${ab} \\text{ ${unite}}`,
            m1,
            'black',
            120,
            12,
            '',
          )
          t2 = latexParPoint('?', m2, 'black', 120, 12, '')
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t3 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 100, 12, '')
          break
        case 'invCosinus':
          t1 = latexParPoint(
            `${ab} \\text{ ${unite}}`,
            m1,
            'black',
            120,
            12,
            '',
          )
          t3 = latexParPoint('?', m3, 'black', 120, 12, '')
          /* if (this.level === 4) {
            const mAC = milieu(A, C)
            const tAC = latexParPoint(
              `${arrondi(ac, 1)} \\text{ ${unite}}`,
              mAC,
              'black',
              120,
              12,
              '',
            )
            objetsEnonce.push(tAC)
          } */
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t2 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 100, 12, '')
          break
        case 'invSinus':
          t2 = latexParPoint(
            `${ac} \\text{ ${unite}}`,
            m2,
            'black',
            120,
            12,
            '',
          )
          t3 = latexParPoint('?', m3, 'black', 120, 12, '')
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t1 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 100, 12, '')
          break
        case 'invTangente':
        default:
          t2 = latexParPoint(
            `${ac} \\text{ ${unite}}`,
            m2,
            'black',
            120,
            12,
            '',
          )
          t1 = latexParPoint('?', m1, 'black', 120, 12, '')
          m4 = homothetie(G, B, 2.7 / longueur(B, G), 'B2', 'center')
          t3 = latexParPoint(`${angleABC}^\\circ`, m4, 'black', 100, 12, '')
          break
      }
      objetsEnonce.push(p2, codage, nomme, t1, t2, t3, codageDeAngle)
      objetsCorrection.push(p2, codage, nomme, t1, t2, t3, hypo, codageDeAngle)

      const paramsEnonce = {
        xmin: Math.min(A.x, B.x, C.x) - 2,
        ymin: Math.min(A.y, B.y, C.y) - 2,
        xmax: Math.max(A.x, B.x, C.x) + 2,
        ymax: Math.max(A.y, B.y, C.y) + 2,
        pixelsParCm: 20,
        scale: 0.37,
        mainlevee: true,
        amplitude: context.isHtml ? 0.4 : 1,
      }
      const paramsCorrection = {
        xmin: Math.min(A.x, B.x, C.x) - 4,
        ymin: Math.min(A.y, B.y, C.y) - 4,
        xmax: Math.max(A.x, B.x, C.x) + 2,
        ymax: Math.max(A.y, B.y, C.y) + 2,
        pixelsParCm: 20,
        scale: 0.35,
        mainlevee: false,
      }
      if (!context.isHtml && this.sup) {
        texte += '\\\\' // \\begin{minipage}{.3\\linewidth}\n'
      }
      if (this.sup) {
        texte += mathalea2d(paramsEnonce, objetsEnonce)
      }
      if (this.correctionDetaillee) {
        if (!context.isHtml) {
          texteCorr += '\\begin{minipage}{.4\\linewidth}\n'
        }
        texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
        if (!context.isHtml) {
          texteCorr +=
            '\n\\end{minipage}\n' + '\\begin{minipage}{.7\\linewidth}\n'
        }
      }
      if (!context.isHtml && this.sup) {
        // texte += '\n\\end{minipage}\n'
      }
      switch (listeTypeQuestions[i]) {
        case 'cosinus': // AB=BCxcos(B)
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> le cosinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\cos\\left(\\widehat{${nom}}\\right)=\\dfrac{${nom[0] + nom[1]}}{${nom[1] + nom[2]}}$.<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\cos\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(nom[0] + nom[1], bc)}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[0] + nom[1]}=${bc} \\times \\cos\\left(${angleABC}^\\circ\\right)$`
          } else {
            texteCorr += `$\\cos\\left(${angleABC}^\\circ\\right)=${texFractionFromString(nom[0] + nom[1], bc)}$<br>`
            texteCorr += `$${nom[0] + nom[1]}=${bc} \\times \\cos\\left(${angleABC}^\\circ\\right)$`
          }
          texteCorr += `<br>soit $${nom[0] + nom[1]}\\approx${miseEnEvidence(texNombre(ab, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(ab, 1)
          nomLongueur = `$${nom[0] + nom[1]}$`
          calcul0 = `$${nom[1] + nom[2]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[1] + nom[2]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[1] + nom[2]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[1] + nom[2]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[1] + nom[2]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[1] + nom[2]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 0
          break
        case 'sinus':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> le sinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\sin \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[1] + nom[2])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\sin\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(nom[0] + nom[2], bc)}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[0] + nom[2]}=${quatriemeProportionnelle('\\color{red}{1}', bc, `\\sin\\left(${angleABC}^\\circ\\right)`)}$`
          } else {
            texteCorr += `$\\sin\\left(${angleABC}^\\circ\\right)=${texFractionFromString(nom[0] + nom[2], bc)}$<br>`
            texteCorr += `$${nom[0] + nom[2]}=${bc} \\times \\sin\\left(${angleABC}^\\circ\\right)$`
          }
          texteCorr += `<br>soit $${nom[0] + nom[2]}\\approx${miseEnEvidence(texNombre(ac, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(ac, 1)
          nomLongueur = `$${nom[0] + nom[2]}$`
          calcul0 = `$${nom[1] + nom[2]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[1] + nom[2]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[1] + nom[2]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[1] + nom[2]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[1] + nom[2]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[1] + nom[2]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 1
          break
        case 'tangente':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> la tangente de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\tan \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[0] + nom[1])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\tan\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(nom[0] + nom[2], ab)}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[0] + nom[2]}=${quatriemeProportionnelle('\\color{red}{1}', ab, `\\tan\\left(${angleABC}^\\circ\\right)`, 0)}$`
          } else {
            texteCorr += `$\\tan\\left(${angleABC}^\\circ\\right)=${texFractionFromString(nom[0] + nom[2], ab)}$<br>`
            texteCorr += `$${nom[0] + nom[2]}=${ab} \\times \\tan\\left(${angleABC}^\\circ\\right)$`
          }
          texteCorr += `<br>soit $${nom[0] + nom[2]}\\approx${miseEnEvidence(texNombre(ac, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(ac, 1)
          nomLongueur = `$${nom[0] + nom[2]}$`
          calcul0 = `$${nom[0] + nom[1]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[0] + nom[1]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[0] + nom[1]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[0] + nom[1]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[0] + nom[1]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[0] + nom[1]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 2
          break
        case 'invCosinus':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> le cosinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\cos\\left(\\widehat{${nom}}\\right)=\\dfrac{${nom[0] + nom[1]}}{${nom[1] + nom[2]}}$.<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\cos\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(ab, nom[1] + nom[2])}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[1] + nom[2]}=${quatriemeProportionnelle(`\\cos\\left(${angleABC}^\\circ\\right)`, ab, '\\color{red}{1}')}$`
          } else {
            texteCorr += `$\\cos\\left(${angleABC}^\\circ\\right)=${texFractionFromString(ab, nom[1] + nom[2])}$<br>`
            texteCorr += `$${nom[1] + nom[2]}= \\dfrac{${ab}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          }
          texteCorr += `<br>soit $${nom[1] + nom[2]}\\approx${miseEnEvidence(texNombre(bc, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(bc, 1)
          nomLongueur = `$${nom[1] + nom[2]}$`
          calcul0 = `$${nom[0] + nom[1]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[0] + nom[1]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[0] + nom[1]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[0] + nom[1]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[0] + nom[1]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[0] + nom[1]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 3
          break
        case 'invSinus':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> le sinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\sin \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[1] + nom[2])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\sin\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(ac, nom[1] + nom[2])}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[1] + nom[2]}=${quatriemeProportionnelle(`\\sin\\left(${angleABC}^\\circ\\right)`, ac, '\\color{red}{1}')}$`
          } else {
            texteCorr += `$\\sin\\left(${angleABC}^\\circ\\right)=${texFractionFromString(ac, nom[1] + nom[2])}$<br>`
            texteCorr += `$${nom[1] + nom[2]}=\\dfrac{${ac}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          }
          texteCorr += `<br>soit $${nom[1] + nom[2]}\\approx${miseEnEvidence(texNombre(bc, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(bc, 1)
          nomLongueur = `$${nom[1] + nom[2]}$`
          calcul0 = `$${nom[0] + nom[2]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[0] + nom[2]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[0] + nom[2]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[0] + nom[2]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[0] + nom[2]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[0] + nom[2]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 4
          break
        case 'invTangente':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$,<br> la tangente de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\tan \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[0] + nom[1])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          if (this.sup3 === 1) {
            texteCorr += `$\\dfrac{\\tan\\left(${angleABC}^\\circ\\right)}{\\color{red}{1}}=${texFractionFromString(ac, nom[0] + nom[1])}$<br>`
            texteCorr += `${texteEnCouleurEtGras('Les produits en croix sont égaux, donc : ', 'red')}<br>`
            texteCorr += `$${nom[0] + nom[1]}=${quatriemeProportionnelle(`\\tan\\left(${angleABC}^\\circ\\right)`, ac, '\\color{red}{1}')}$`
          } else {
            texteCorr += `$\\tan\\left(${angleABC}^\\circ\\right)=${texFractionFromString(ac, nom[0] + nom[1])}$<br>`
            texteCorr += `$${nom[0] + nom[1]}=\\dfrac{${ac}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          }
          texteCorr += `<br>soit $${nom[0] + nom[1]}\\approx${miseEnEvidence(texNombre(ab, 1))}$ ${texteEnCouleurEtGras(unite)}.`
          reponse = arrondi(ab, 1)
          nomLongueur = `$${nom[0] + nom[1]}$`
          calcul0 = `$${nom[0] + nom[2]}\\times\\cos\\left(${angleABC}^\\circ\\right)$`
          calcul1 = `$${nom[0] + nom[2]}\\times\\sin\\left(${angleABC}^\\circ\\right)$`
          calcul2 = `$${nom[0] + nom[2]}\\times\\tan\\left(${angleABC}^\\circ\\right)$`
          calcul3 = `$\\dfrac{${nom[0] + nom[2]}}{\\cos\\left(${angleABC}^\\circ\\right)}$`
          calcul4 = `$\\dfrac{${nom[0] + nom[2]}}{\\sin\\left(${angleABC}^\\circ\\right)}$`
          calcul5 = `$\\dfrac{${nom[0] + nom[2]}}{\\tan\\left(${angleABC}^\\circ\\right)}$`
          calculTrue = 5
          break
      }
      if (!context.isHtml && this.correctionDetaillee) {
        texteCorr += '\n\\end{minipage}\n'
      }
      /*****************************************************/
      // Pour AMC
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            texteAMC +
            (this.sup
              ? mathalea2d(paramsEnonce, objetsEnonce) +
                '<br>La figure ci-dessus ne respecte pas les dimensions.'
              : ''), // + '\\\\\n',
          enonceAvantUneFois: true,
          // enonceApresNumQuestion: true,
          options: {
            multicols: false,
            barreseparation: true,
            multicolsAll: true,
            numerotationEnonce: true,
          },
          propositions: [
            {
              type: 'qcmMono',
              enonce:
                numAlpha(0) +
                `Quel calcul effectuer pour calculer ${nomLongueur} ?`, // \\\\\n`,
              options: {
                ordered: true,
              },
              propositions: [
                {
                  texte: calcul0,
                  statut: calculTrue === 0,
                  feedback: '',
                },
                {
                  texte: calcul1,
                  statut: calculTrue === 1,
                  feedback: '',
                },
                {
                  texte: calcul2,
                  statut: calculTrue === 2,
                  feedback: '',
                },
                {
                  texte: calcul3,
                  statut: calculTrue === 3,
                  feedback: '',
                },
                {
                  texte: calcul4,
                  statut: calculTrue === 4,
                  feedback: '',
                },
                {
                  texte: calcul5,
                  statut: calculTrue === 5,
                  feedback: '',
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: numAlpha(1) + q2AMC, // `${nomLongueur} arrondie au dixième de ${unite}:\\\\\n`,
                    valeur: reponse,
                    param: {
                      digits: 3,
                      decimals: 1,
                      signe: false,
                      exposantNbChiffres: 0,
                      exposantSigne: false,
                      approx: 1,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (context.isHtml && !context.isAmc) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
          texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
        })
        handleAnswers(this, i, {
          reponse: {
            value: new Grandeur(arrondi(Number(reponse), 1), unite),
            options: { unite: true },
          },
        })
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
