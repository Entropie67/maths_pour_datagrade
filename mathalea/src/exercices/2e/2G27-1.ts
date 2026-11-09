import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  'Reconnaître des droites parallèles avec la colinéarité (V/F)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '20/04/26' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export const uuid = '2ba43'

export const refs = {
  'fr-fr': ['2G27-1'],
  'fr-ch': ['3G93-7'],
}
export default class DroitesParallelesVF extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let xa, ya, xb, yb, xc, yc, xd, yd, abx, aby, k

    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        choice([1, 2]) //
      ) {
        case 1:
          xa = randint(-5, 5)
          ya = randint(-5, 5)
          xb = randint(-5, 5, xa)
          yb = randint(-5, 5, ya)
          abx = xb - xa
          aby = yb - ya
          xc = randint(-5, 5, [xa, xb])
          yc = randint(-5, 5, [ya, yb])
          k = randint(-5, 5, [0, 1])
          xd = xc + k * abx
          yd = yc + k * aby
          texte = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${texNombre(xd)}\\;;\\;${yd})$.<br>
        Déterminer si les droites $(AB)$ et $(CD)$ sont parallèles.`
          this.canEnonce = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${texNombre(xd)}\\;;\\;${yd})$.<br>
        Déterminer si les droites $(AB)$ et $(CD)$ sont parallèles.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: abx * (yd - yc) === aby * (xd - xc),
              },
              {
                texte: 'Faux',
                statut: xa === 50,
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Soient $A,B,C,D$ quatre points distincts. <br>Deux droites $(AB)$ et $(CD)$ sont parallèles si et seulement si les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$ sont colinéaires.<br>
            Si $A(x_A\\;;\\;y_A)$, $B(x_B\\;;\\;y_B)$, $C(x_C\\;;\\;y_C)$ et $D(x_D\\;;\\;y_D)$, alors les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$ ont pour coordonnées :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$ et $\\overrightarrow{CD}\\begin{pmatrix}x_D - x_C \\\\ y_D - y_C \\end{pmatrix}$.<br>
            On a donc :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}${xb} ${ecritureAlgebrique(-xa)} \\\\ ${yb} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc             $\\overrightarrow{AB}\\begin{pmatrix}${xb - xa}  \\\\ ${yb - ya}  \\end{pmatrix}$.<br> 
            $\\overrightarrow{CD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xc)} \\\\ ${yd} ${ecritureAlgebrique(-yc)} \\end{pmatrix}$ donc $\\overrightarrow{CD}\\begin{pmatrix}${xd - xc}  \\\\ ${yd - yc}  \\end{pmatrix}$.<br> 
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AB}\\,;\\,\\overrightarrow{CD}\\right)&=\\begin{vmatrix} ${xb - xa} & ${xd - xc} \\\\ ${yb - ya} & ${yd - yc} \\end{vmatrix}\\\\
            &=
            ${abx}\\times ${ecritureParentheseSiNegatif(yd - yc)}-${ecritureParentheseSiNegatif(aby)}\\times ${ecritureParentheseSiNegatif(xd - xc)}\\\\
            &=${abx * (yd - yc)}-${ecritureParentheseSiNegatif(aby * (xd - xc))}\\\\
            &=${abx * (yd - yc) - aby * (xd - xc)}\\end{aligned}$.<br>
            Le déterminant étant nul, on peut en déduire que les deux vecteurs sont colinéaires, donc les droites $(AB)$ et $(CD)$ sont parallèles. <br>
            Il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Vrai')}${sp()}».`
          break
        case 2:
        default:
          xa = randint(-5, 5)
          ya = randint(-5, 5)
          xb = randint(-5, 5, xa)
          yb = randint(-5, 5, ya)
          abx = xb - xa
          aby = yb - ya
          xc = randint(-5, 5, [xa, xb])
          yc = randint(-5, 5, [ya, yb])
          k = randint(-5, 5, [0, 1])
          xd = xc + k * abx
          yd = yc + k * aby + randint(-1, 1, 0)
          texte = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${xd}\\;;\\;${yd})$.<br>
        Déterminer si les droites $(AB)$ et $(CD)$ sont parallèles.`
          this.canEnonce = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${xd}\\;;\\;${yd})$.<br>
        Déterminer si les droites $(AB)$ et $(CD)$ sont parallèles.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: xa === 100,
              },
              {
                texte: 'Faux',
                statut: abx * (yd - yc) !== aby * (xd - xc),
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Soient $A,B,C,D$ quatre points distincts. <br>Deux droites $(AB)$ et $(CD)$ sont parallèles si et seulement si les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$ sont colinéaires.<br>
            Si $A(x_A\\;;\\;y_A)$, $B(x_B\\;;\\;y_B)$, $C(x_C\\;;\\;y_C)$ et $D(x_D\\;;\\;y_D)$, alors les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$ ont pour coordonnées :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$ et $\\overrightarrow{CD}\\begin{pmatrix}x_D - x_C \\\\ y_D - y_C \\end{pmatrix}$.<br>
            On a donc :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}${xb} ${ecritureAlgebrique(-xa)} \\\\ ${yb} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc             $\\overrightarrow{AB}\\begin{pmatrix}${xb - xa}  \\\\ ${yb - ya}  \\end{pmatrix}$.<br> 
            $\\overrightarrow{CD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xc)} \\\\ ${yd} ${ecritureAlgebrique(-yc)} \\end{pmatrix}$ donc $\\overrightarrow{CD}\\begin{pmatrix}${xd - xc}  \\\\ ${yd - yc}  \\end{pmatrix}$.<br> 
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AB}\\,;\\,\\overrightarrow{CD}\\right)&=\\begin{vmatrix} ${xb - xa} & ${xd - xc} \\\\ ${yb - ya} & ${yd - yc} \\end{vmatrix}\\\\
            &=
            ${abx}\\times ${ecritureParentheseSiNegatif(yd - yc)}-${ecritureParentheseSiNegatif(aby)}\\times ${ecritureParentheseSiNegatif(xd - xc)}\\\\
            &=${abx * (yd - yc)}-${ecritureParentheseSiNegatif(aby * (xd - xc))}\\\\
            &=${abx * (yd - yc) - aby * (xd - xc)}\\end{aligned}$<br>
              Le déterminant étant non-nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires, donc les droites $(AB)$ et $(CD)$ ne sont pas parallèles.
                   <br>Il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Faux')}${sp()}».`
          break
      }
      if (this.questionJamaisPosee(i, xa, ya, xb, yb, xc, yc, xd, yd)) {
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
