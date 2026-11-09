// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 999ee continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '999ee'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 09/23 : Python'
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
export default class metropoleSept2023Q3Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      `u$\\leqslant {${texNombre(10000)}}$`,
      `u $={${texNombre(10000)}}$  `,
      `u$> {${texNombre(10000)}}$`,
      `$n\\leqslant{${texNombre(10000)}}$`,
    ]

    this.enonce = `On considère la suite $\\left(u_n\\right)$ définie sur $\\mathbb N$ par${sp()}:
$u_0 = 15$ et pour tout entier naturel $n$${sp()}: $u_{n+1} = 1,2u_n + 12.$<br>

La fonction Python suivante, dont la ligne $4$ est incomplète, <br>doit renvoyer la plus petite valeur de l'entier $n$ telle que $u_n > ${texNombre(10000)}$.<br>

<br>def seuil()${sp()}:<br>
$\\qquad$ n=0<br>
$\\qquad$ u=15<br>
$\\qquad$ while ..............${sp()}:<br>
$\\qquad\\qquad$ n=n+1<br>
$\\qquad\\qquad$ u=1,2$*$u+12<br>
$\\qquad$ return(n)<br><br>


À la ligne $4$, on complète par${sp()}:`

    this.correction = `Pour sortir de la boucle quand $u>${texNombre(10000)}$, la boucle while doit fonctionner tant que $u\\leqslant ${texNombre(10000)}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
