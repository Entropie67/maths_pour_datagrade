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
export const titre =
  'Déterminer si un quadrilatère est un trapèze, avec la colinéarité (V/F)'
export const interactifReady = true

export const dateDePublication = '20/04/26'

/**
 * @author Stéphane Guyon
 */
export const uuid = '2ba45'

export const refs = {
  'fr-fr': ['2G27-3'],
  'fr-ch': ['3G93-9'],
}
export default class TrapezeVF extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let xa,
      ya,
      xb,
      yb,
      xc,
      yc,
      xd,
      yd,
      abx,
      aby,
      k,
      adx,
      ady,
      cdx,
      cdy,
      bcx,
      bcy,
      trapeze,
      z

    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        choice([1, 2]) //
      ) {
        case 1: {
          xa = randint(-5, 5)
          ya = randint(-5, 5)
          xb = randint(-5, 5, xa)
          yb = randint(-5, 5, ya)
          abx = xb - xa
          aby = yb - ya
          xc = randint(-5, 5, [xa, xb])
          yc = randint(-5, 5, [ya, yb])
          bcx = xc - xb
          bcy = yc - yb
          let iterations = 0
          do {
            k = randint(-5, 0, [0, 1])
            xd = xc + k * abx
            yd = yc + k * aby
            iterations++
          } while (
            (xd - xa) * (yb - yc) === (yd - ya) * (xb - xc) &&
            iterations < 50
          ) // on vérifie que ce n'est pas un parallélogramme
          trapeze = choice(['true', 'false'])
          z = randint(-2, 2, 0)
          if (trapeze === 'false') {
            xd += z
          }
          cdx = xd - xc
          cdy = yd - yc
          adx = xd - xa
          ady = yd - ya
          texte = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${texNombre(xd)}\\;;\\;${yd})$.<br>
        Le quadrilatère $ABCD$ est un trapèze.`
          this.canEnonce = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${texNombre(xd)}\\;;\\;${yd})$.<br>
        Le quadrilatère $ABCD$ est un trapèze.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: abx * cdy === aby * cdx,
              },
              {
                texte: 'Faux',
                statut: abx * cdy !== aby * cdx,
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Un quadrilatère est un trapèze si et seulement si deux de ses côtés opposés sont parallèles.<br>
            Pour vérifier si les côtés sont parallèles, on vérifie si des vecteurs formés par les sommets du quadrilatère sont colinéaires. <br>
            Si $A(x_A\\;;\\;y_A)$, $B(x_B\\;;\\;y_B)$, alors le vecteur $\\overrightarrow{AB}$ a pour coordonnées :
            $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$.<br>
            On a donc :<br>
            $\\overrightarrow{AD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xa)} \\\\ ${yd} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc $\\overrightarrow{AD}\\begin{pmatrix}${xd - xa} \\\\ ${yd - ya} \\end{pmatrix}$.<br>
            $\\overrightarrow{BC}\\begin{pmatrix}${xc} ${ecritureAlgebrique(-xb)} \\\\ ${yc} ${ecritureAlgebrique(-yb)} \\end{pmatrix}$ donc $\\overrightarrow{BC}\\begin{pmatrix}${xc - xb} \\\\ ${yc - yb} \\end{pmatrix}$.<br>
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AD}\\,;\\,\\overrightarrow{BC}\\right)&=\\begin{vmatrix} ${xd - xa} & ${xc - xb} \\\\ ${yd - ya} & ${yc - yb} \\end{vmatrix}\\\\
            &=
            ${adx}\\times ${ecritureParentheseSiNegatif(bcy)}-${ecritureParentheseSiNegatif(ady)}\\times ${ecritureParentheseSiNegatif(bcx)}\\\\
            &=${adx * bcy}-${ecritureParentheseSiNegatif(ady * bcx)}\\\\
            &=${adx * bcy - ady * bcx}\\end{aligned}$.<br>
            Le déterminant étant non-nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires. Les côtés $[AD]$ et $[BC]$ ne sont pas parallèles. <br>
            $\\overrightarrow{AB}\\begin{pmatrix}${xb} ${ecritureAlgebrique(-xa)} \\\\ ${yb} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc $\\overrightarrow{AB}\\begin{pmatrix}${xb - xa} \\\\ ${yb - ya} \\end{pmatrix}$.<br>
            $\\overrightarrow{CD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xc)} \\\\ ${yd} ${ecritureAlgebrique(-yc)} \\end{pmatrix}$ donc $\\overrightarrow{CD}\\begin{pmatrix}${xd - xc} \\\\ ${yd - yc} \\end{pmatrix}$.<br>
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AB}\\,;\\,\\overrightarrow{CD}\\right)&=\\begin{vmatrix} ${xb - xa} & ${xd - xc} \\\\ ${yb - ya} & ${yd - yc} \\end{vmatrix}\\\\
            &=
            ${abx}\\times ${ecritureParentheseSiNegatif(yd - yc)}-${ecritureParentheseSiNegatif(aby)}\\times ${ecritureParentheseSiNegatif(xd - xc)}\\\\
            &=${abx * (yd - yc)}-${ecritureParentheseSiNegatif(aby * (xd - xc))}\\\\
            &=${abx * (yd - yc) - aby * (xd - xc)}\\end{aligned}$.<br>`
          if (trapeze === 'true') {
            texteCorr += `Le déterminant étant nul, on peut en déduire que les deux vecteurs sont colinéaires, donc les côtés $[AB]$ et $[CD]$ sont parallèles. <br>
              Le quadrilatère $ABCD$ forme bien un trapèze. <br>
              Il fallait donc cocher ${texteEnCouleurEtGras('Vrai')}.`
          } else {
            texteCorr += `Le déterminant étant non-nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires. Les côtés $[AB]$ et $[CD]$ ne sont pas parallèles. <br>
             Le quadrilatère $ABCD$ n'est donc pas un trapèze. <br>
             Il fallait donc cocher ${texteEnCouleurEtGras('Faux')}.`
          }
          break
        }
        case 2:
        default: {
          xa = randint(-5, 5)
          ya = randint(-5, 5)
          xb = randint(-5, 5, xa)
          yb = randint(-5, 5, ya)
          xc = randint(-5, 5, [xa, xb])
          yc = randint(-5, 5, [ya, yb])
          bcx = xc - xb
          bcy = yc - yb
          let iterations2 = 0
          do {
            k = randint(-5, 5, [0, 1])
            xd = xa + k * bcx
            yd = ya + k * bcy
            iterations2++
          } while (
            (xd - xc) * (yb - ya) === (yd - yc) * (xb - xa) &&
            iterations2 < 50
          ) // on vérifie que ce n'est pas un parallélogramme
          trapeze = choice(['true', 'false'])
          z = randint(-2, 2, 0)
          if (trapeze === 'false') {
            yd += z
          }
          cdx = xd - xc
          cdy = yd - yc
          abx = xb - xa
          aby = yb - ya
          adx = xd - xa
          ady = yd - ya
          texte = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${xd}\\;;\\;${yd})$.<br>
        Le quadrilatère $ABCD$ est un trapèze.`
          this.canEnonce = `Dans un repère orthonormé, on considère les points $A(${xa}\\;;\\; ${ya})$, $B(${xb}\\;;\\;${yb})$, $C(${xc}\\;;\\;${yc})$ et $D(${xd}\\;;\\;${yd})$.<br>
        Le quadrilatère $ABCD$ est un trapèze.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: adx * bcy === ady * bcx,
              },
              {
                texte: 'Faux',
                statut: adx * bcy !== ady * bcx,
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Un quadrilatère est un trapèze si et seulement si deux de ses côtés opposés sont parallèles.<br>
            Pour vérifier si les côtés sont parallèles, on vérifie si les vecteurs formés par les sommets du quadrilatère sont colinéaires. <br>
            Si $A(x_A\\;;\\;y_A)$, $B(x_B\\;;\\;y_B)$, alors le vecteur $\\overrightarrow{AB}$ a pour coordonnées :
            $\\overrightarrow{AB}\\begin{pmatrix}x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$.<br>
            On a donc :<br>
            $\\overrightarrow{AB}\\begin{pmatrix}${xb} ${ecritureAlgebrique(-xa)} \\\\ ${yb} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc $\\overrightarrow{AB}\\begin{pmatrix}${xb - xa} \\\\ ${yb - ya} \\end{pmatrix}$.<br>
            $\\overrightarrow{CD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xc)} \\\\ ${yd} ${ecritureAlgebrique(-yc)} \\end{pmatrix}$ donc $\\overrightarrow{CD}\\begin{pmatrix}${xd - xc} \\\\ ${yd - yc} \\end{pmatrix}$.<br>
              Le déterminant de ces deux vecteurs est égal à : <br>
$\\begin{aligned}
            det\\left(\\overrightarrow{AB}\\,;\\,\\overrightarrow{CD}\\right)&=\\begin{vmatrix} ${xb - xa} & ${xd - xc} \\\\ ${yb - ya} & ${yd - yc} \\end{vmatrix}\\\\
&=
            ${abx}\\times ${ecritureParentheseSiNegatif(cdy)}-${ecritureParentheseSiNegatif(aby)}\\times ${ecritureParentheseSiNegatif(cdx)}\\\\
            &=${abx * cdy}-${ecritureParentheseSiNegatif(aby * cdx)}\\\\
            &=${abx * cdy - aby * cdx}\\end{aligned}$.<br>
            Le déterminant étant non-nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires. Les côtés $[AB]$ et $[CD]$ ne sont pas parallèles. <br>
            $\\overrightarrow{AD}\\begin{pmatrix}${xd} ${ecritureAlgebrique(-xa)} \\\\ ${yd} ${ecritureAlgebrique(-ya)} \\end{pmatrix}$ donc $\\overrightarrow{AD}\\begin{pmatrix}${xd - xa} \\\\ ${yd - ya} \\end{pmatrix}$.<br>
            $\\overrightarrow{BC}\\begin{pmatrix}${xc} ${ecritureAlgebrique(-xb)} \\\\ ${yc} ${ecritureAlgebrique(-yb)} \\end{pmatrix}$ donc $\\overrightarrow{BC}\\begin{pmatrix}${xc - xb} \\\\ ${yc - yb} \\end{pmatrix}$.<br>
              Le déterminant de ces deux vecteurs est égal à : <br>
            $\\begin{aligned}
            det\\left(\\overrightarrow{AD}\\,;\\,\\overrightarrow{BC}\\right)&=\\begin{vmatrix} ${xd - xa} & ${xc - xb} \\\\ ${yd - ya} & ${yc - yb} \\end{vmatrix}\\\\
            &=
            ${adx}\\times ${ecritureParentheseSiNegatif(bcy)}-${ecritureParentheseSiNegatif(ady)}\\times ${ecritureParentheseSiNegatif(bcx)}\\\\
            &=${adx * bcy}-${ecritureParentheseSiNegatif(ady * bcx)}\\\\
            &=${adx * bcy - ady * bcx}\\end{aligned}$.<br>`
          if (trapeze === 'true') {
            texteCorr += `Le déterminant étant nul, on peut en déduire que les deux vecteurs sont colinéaires, donc les côtés $[AD]$ et $[BC]$ sont parallèles. <br>
              Le quadrilatère $ABCD$ forme bien un trapèze. <br>
              Il fallait donc cocher ${texteEnCouleurEtGras('Vrai')}.`
          } else {
            texteCorr += `Le déterminant étant non-nul, on peut en déduire que les deux vecteurs ne sont pas colinéaires. Les côtés $[AD]$ et $[BC]$ ne sont pas parallèles. <br>
             Le quadrilatère $ABCD$ n'est donc pas un trapèze. <br>
             Il fallait donc cocher ${texteEnCouleurEtGras('Faux')}.`
          }
          break
        }
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
