// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c5b23 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'c5b23'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nouvelle Calédonie 08/23 : droites'
export const dateDePublication = '05/11/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SujetZero2024Ex5Q5Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      'sécantes.',
      'strictement parallèles.',
      'confondues.',
      'non coplanaires',
    ]

    this.enonce =
      "On se place dans l'espace muni d'un repère orthonormé $\\left(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k}\\right).$<br>"
    this.enonce +=
      `On considère les droites $\\left(d_1\\right)$ et $\\left(d_2\\right)$ dont des représentations paramétriques sont respectivement${sp()}:<br>`
    this.enonce +=
      ' <br>$\\left(d_1\\right)\\left\\{\\begin{array}{l}x=2+r\\\\y=1 + r\\quad (r \\in \\mathbb R)\\\\z=- r\\end{array}\\right.\\qquad$'
    this.enonce +=
      ' $\\left(d_2\\right)\\left\\{\\begin{array}{l}x=1 - s\\\\y=-1 + s \\quad (s \\in \\mathbb R)\\\\z=2 - s\\end{array}\\right. $<br>'
    this.enonce +=
      `<br>Les droites $\\left(d_1\\right)$ et $\\left(d_2\\right)$ sont${sp()}: `
    this.correction =
      '$\\overrightarrow{u_1}\\left(\\begin{array}{c}1 \\\\ 1 \\\\ -1\\end{array}\\right)$ est un vecteur directeur de $\\left(\\mathrm{d}_1\\right)$<br>'
    this.correction +=
      '$\\overrightarrow{u_2}\\left(\\begin{array}{c}-1 \\\\ 1 \\\\ -1\\end{array}\\right)$ est un vecteur directeur de $\\left(\\mathrm{d}_2\\right)$.<br>'
    this.correction +=
      'On a $\\dfrac{1}{-1} \\neq \\dfrac{1}{1}$, donc $\\overrightarrow{u_1}$ et $\\overrightarrow{u_2}$ ne sont pas colinéaires. Les droites ne sont donc pas parallèles.<br>'
    this.correction +=
      'Supposons que $\\left(\\mathrm{d}_1\\right)$ et $\\left(\\mathrm{d}_1\\right)$ soient sécantes en un point A. <br>'
    this.correction +=
      `Alors les coordonnées $A(a ; b ; c$ ) vérifient les deux représentations paramétriques${sp()}:<br>`
    this.correction +=
      '$ \\left\\{\\begin{array}{l} a = 2 + r \\\\ b = 1 + r \\\\ c = - r \\end{array}\\right. \\qquad $ et'
    this.correction +=
      '$\\qquad \\left\\{\\begin{array}{l}a =1-s\\\\b =-1+s \\\\c =2-s\\end{array}\\right.$<br>'
    this.correction +=
      'On a donc $-r=2-s \\iff r=s-2$ et $2+r=1-s \\iff 2+s-2=1-s \\iff 2 s=1 \\iff s=\\dfrac{1}{2}$. <br>'
    this.correction += `Donc${sp()}: $b=-1+\\dfrac{1}{2}=-\\dfrac{1}{2}$,<br>`
    this.correction += '$ a=1-\\dfrac{1}{2}=\\dfrac{1}{2}$ <br>'
    this.correction += 'et $c=2-\\dfrac{1}{2}=\\dfrac{3}{2}$.<br>'
    this.correction +=
      'Les deux droites sont sécantes en $A\\left(\\dfrac{1}{2} ;-\\dfrac{1}{2} ; \\dfrac{3}{2}\\right)$.<br>'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
