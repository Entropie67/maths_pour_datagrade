import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Reconnaître si trois points sont alignés avec la colinéarité (V/F)'
export const interactifReady = true

export const dateDePublication = '18/04/26'

/**
 * @author Stéphane Guyon
 */

export const uuid = '2ba44'
export const refs = {
  'fr-fr': ['2G27-2'],
  'fr-ch': ['3G93-8'],
}
export default class DroitesParallelesVF extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let xa, ya, xb, yb, xc, yc, abx, aby, k, z

    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      xa = randint(-5, 5)
      ya = randint(-5, 5)
      xb = randint(-5, 5, xa)
      yb = randint(-5, 5, ya)
      abx = xb - xa
      aby = yb - ya
      k = randint(-5, 5, [0, 1])
      xc = xa + k * abx
      yc = ya + k * aby
      z = 0
      const aligne = choice(['true', 'false'])
      if (aligne === 'false') {
        z = randint(-1, 1, 0)
      }
      if (xc / 2 === xc % 2) {
        xc = xc + z
      } else {
        yc = yc + z
      }
      texte = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$ et $C(${xc}\\;;\\;${yc})$.<br>
        Les points $A$, $B$ et $C$ sont alignés.`
      this.canEnonce = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$ et $C(${xc}\\;;\\;${yc})$.<br>
        Les points $A$, $B$ et $C$ sont alignés.`
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: 'Vrai',
            statut: aligne === 'true',
          },
          {
            texte: 'Faux',
            statut: aligne !== 'true',
          },
        ],
        options: { ordered: true, radio: true },
      }
      monQcm = propositionsQcm(this, i)
      texte += monQcm.texte

      texteCorr =
        monQcm.texteCorr +
        `Trois poins distincts $A,B,$ et $C$ sont alignés si et seulement si les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires.<br>
            Si $A(x_A\\;;\\;y_A)$, $B(x_B\\;;\\;y_B)$, $C(x_C\\;;\\;y_C)$, alors les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ ont pour coordonnées :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$ et $\\overrightarrow{AC}\\begin{pmatrix}x_C - x_A \\\\ y_C - y_A \\end{pmatrix}$.<br>
            On a donc :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}${xb} ${ecritureAlgebrique(-xa)} \\\\ ${yb} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc             $\\overrightarrow{AB}\\begin{pmatrix}${xb - xa}  \\\\ ${yb - ya}  \\end{pmatrix}$.<br>
            $\\overrightarrow{AC}\\begin{pmatrix}${xc} ${ecritureAlgebrique(-xa)} \\\\ ${yc} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc $\\overrightarrow{AC}\\begin{pmatrix}${xc - xa}  \\\\ ${yc - ya}  \\end{pmatrix}$.<br>
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AB}\\,;\\,\\overrightarrow{AC}\\right)&=\\begin{vmatrix} ${xb - xa} & ${xc - xa} \\\\ ${yb - ya} & ${yc - ya} \\end{vmatrix}\\\\
            &=
            ${abx}\\times ${ecritureParentheseSiNegatif(yc - ya)}-${ecritureParentheseSiNegatif(aby)}\\times ${ecritureParentheseSiNegatif(xc - xa)}\\\\
            &=${abx * (yc - ya)}-${ecritureParentheseSiNegatif(aby * (xc - xa))}\\\\
            &=${abx * (yc - ya) - aby * (xc - xa)}\\end{aligned}$.<br>`
      if (aligne === 'true') {
        texteCorr += `Le déterminant étant nul, on peut en déduire que les deux vecteurs sont colinéaires, donc les points $A$, $B$ et $C$ sont alignés. <br>
                Il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Vrai')}${sp()}».`
      } else {
        texteCorr += `Le déterminant étant non nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires, donc les points $A$, $B$ et $C$ ne sont pas alignés. <br>
                Il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Faux')}${sp()}».`
      }

      if (this.questionJamaisPosee(i, xa, ya, xb, yb, xc, yc)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
