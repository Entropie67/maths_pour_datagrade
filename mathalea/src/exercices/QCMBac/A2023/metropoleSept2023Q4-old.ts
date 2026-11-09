// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c573b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'c573b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/23 : nature et variations'
export const dateDePublication = '03/11/2024'
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
export default class metropoleSept2023Q4Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      'une suite géométrique de raison $1{,}2$  ',
      'une suite décroissante ',
      'une suite arithmétique de raison $60$',
      'une suite ni géométrique ni arithmétique',
    ]

    this.enonce = `On considère la suite $\\left(u_n\\right)$ définie sur $\\mathbb N$ par${sp()}:
$u_0 = 15$ et pour tout entier naturel $n$${sp()}:  $u_{n+1} = 1,2u_n + 12.$<br>

On considère la suite $\\left(v_n\\right)$ définie sur $\\mathbb N$ par${sp()}: $v_n = u_n + 60$. <br>

La suite $\\left(v_n\\right)$ est${sp()}:`

    this.correction = `On a quel que soit $n \\in \\mathbb N$${sp()}:<br> `
    this.correction +=
      '$v_{n+1} = u_{n+1} + 60 $<br>$\\qquad=  1,2u_n + 12 + 60$ <br>$\\qquad= 1,2u_n + 72 $<br>$\\qquad= 1,2\\left(u_n + 60\\right)$ <br>$\\qquad= 1,2v_n$<br>'
    this.correction +=
      'Cette égalité montre que la suite $\\left(v_n\\right)$ est géométrique de raison $1{,}2$.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
