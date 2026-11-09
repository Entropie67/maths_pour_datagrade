import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ppcm } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer un vecteur orthogonal à deux autres vecteurs'
export const interactifReady = true

export const dateDePublication = '02/02/2025'

export const uuid = '24d3a'
export const refs = {
  'fr-fr': ['TSG2-24'],
  'fr-ch': ['3G98-2'],
}

/**
 * @author Stéphane Guyon

*/
export default class VecteurNormalADeuxAutresVecteurs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const u1 = randint(-5, 5, 0) // Composante x de u
      const u2 = randint(-5, 5, 0) // Composante y de u
      const u3 = randint(-5, 5, 0) // Composante z de u

      const v1 = randint(-5, 5, [0, u1]) // Composante x de v
      const v2 = randint(-5, 5, [0, u2]) // Composante y de v
      const v3 = randint(-5, 5, [0, u3]) // Composante z de v
      const k = randint(1, 3) // Pour simplifier les calculs, on impose une composante nulle au vecteur u.
      // if (k === 1) { u1 = 0 }// Pour varier les situations, on alterne cette qui s'annule.
      // if (k === 2) { u2 = 0 }// On alterne aléatoirement une des 3 composantes de u
      // if (k === 3) { u3 = 0 }
      const n1 = u2 * v3 - u3 * v2 // On calcule les 3 composantes du vecteur normal n, qui vérifient les l'égalité
      const n2 = u3 * v1 - u1 * v3
      const n3 = u1 * v2 - u2 * v1
      texte =
        "L'espace est muni d'un repère orthonormé $(O ; \\vec{\\imath}, \\vec{\\jmath}, \\vec{k})$.<br> Déterminer les réels $a$ et $b$, tels que "
      if (k === 1) {
        texte += `$\\overrightarrow{n}\\begin{pmatrix}${n1}\\\\a\\\\b\\end{pmatrix}$`
      }
      if (k === 2) {
        texte += `$\\overrightarrow{n}\\begin{pmatrix}a\\\\${n2}\\\\b\\end{pmatrix}$`
      }
      if (k === 3) {
        texte += `$\\overrightarrow{n}\\begin{pmatrix}a\\\\b\\\\${n3}\\end{pmatrix}$`
      }
      texte += ' soit un vecteur normal au plan engendré par les vecteurs <br>'
      texte += `$\\vec{u} \\begin{pmatrix}${u1}\\\\${u2}\\\\${u3}\\end{pmatrix}~$ et $~\\vec{v} \\begin{pmatrix}${v1}\\\\${v2}\\\\${v3}\\end{pmatrix}$ `
      if (this.interactif) {
        texte +=
          '<br><br> $\\overrightarrow{n}$ ' +
          remplisLesBlancs(
            this,
            i,
            '\\begin{pmatrix}%{champ1}\\\\%{champ2}\\\\%{champ3}\\end{pmatrix}.',
          )
      } else {
        texte += '.'
      }
      handleAnswers(this, i, {
        champ1: { value: n1 },
        champ2: { value: n2 },
        champ3: { value: n3 },
      })

      texteCorr = 'On sait que '
      if (k === 1) {
        texteCorr += `$\\overrightarrow{n}\\begin{pmatrix}${n1}\\\\a\\\\b\\end{pmatrix}$`
      }
      if (k === 2) {
        texteCorr += `$\\overrightarrow{n}\\begin{pmatrix}a\\\\${n2}\\\\b\\end{pmatrix}$`
      }
      if (k === 3) {
        texteCorr += `$\\overrightarrow{n}\\begin{pmatrix}a\\\\b\\\\${n3}\\end{pmatrix}$`
      }
      texteCorr +=
        'est un vecteur normal au plan engendré par $\\vec{u}$ et $\\vec{v}$. <br>'
      texteCorr +=
        '$\\vec n$ est donc orthogonal à tout vecteur de ce plan, ce qui implique que $\\vec n$ est orthogonal à $\\vec u$ et à $\\vec v$.<br>'
      texteCorr +=
        'Ainsi, on a nécessairement : $\\vec{n} \\cdot \\vec{u} = 0 \\quad (L_1)\\quad\\quad\\text{et} \\quad \\vec{n} \\cdot \\vec{v} = 0\\quad(L_2)$.'
      texteCorr +=
        "<br>Traduisons ces conditions dans un système de $2$ équations à $2$ inconnues, que l'on résout ici par combinaisons linéaires (d'autres méthodes sont possibles) :<br>"
      if (k === 1) {
        texteCorr += `$ \\phantom{\\iff}\\begin{cases}${u1}\\times ${ecritureParentheseSiNegatif(n1)}${ecritureAlgebrique(u2)}\\times a  ${ecritureAlgebrique(u3)}\\times b &= 0 \\quad (L_1)\\\\${v1}\\times${ecritureParentheseSiNegatif(n1)}  ${ecritureAlgebrique(v2)}\\times a ${ecritureAlgebrique(v3)}\\times b &= 0  \\quad (L_2)\\end{cases}$`
        texteCorr += `<br><br>$\\iff \\begin{cases}${rienSi1(u2)}a  ${ecritureAlgebriqueSauf1(u3)}b &= ${-u1 * n1} \\quad (L_1)\\\\  ${rienSi1(v2)}a ${ecritureAlgebriqueSauf1(v3)}b &= ${-v1 * n1} \\quad (L_2)\\end{cases}$`
      }
      if (k === 2) {
        texteCorr += `<br>$ \\begin{cases}${u1}\\times a ${ecritureAlgebrique(u2)}\\times ${ecritureParentheseSiNegatif(n2)} ${ecritureAlgebrique(u3)}\\times b &= 0 \\\\${v1}\\times a  ${ecritureAlgebrique(v2)}\\times ${ecritureParentheseSiNegatif(n2)} ${ecritureAlgebrique(v3)}\\times b &= 0 \\end{cases}$<br>$\\iff\\begin{cases}${rienSi1(u1)}a  ${ecritureAlgebriqueSauf1(u3)}b &= ${-u2 * n2} \\quad (L_1)\\\\${rienSi1(v1)} a   ${ecritureAlgebriqueSauf1(v3)}b &= ${-v2 * n2} \\quad (L_2)\\end{cases}$`
      }
      if (k === 3) {
        texteCorr += `<br>$ \\begin{cases}${u1}\\times a  ${ecritureAlgebrique(u2)}\\times b ${ecritureAlgebrique(u3)}\\times ${ecritureParentheseSiNegatif(n3)}&= 0 \\\\${v1}\\times a  ${ecritureAlgebriqueSauf1(v2)}b ${ecritureAlgebrique(v3)}\\times${ecritureParentheseSiNegatif(n3)} &= 0  \\end{cases}$<br>$\\iff \\begin{cases}${rienSi1(u1)}a  ${ecritureAlgebriqueSauf1(u2)}b &= ${-u3 * n3} \\quad (L_1)\\\\${rienSi1(v1)} a  ${ecritureAlgebriqueSauf1(v2)}b  &= ${-v3 * n3} \\quad (L_2)\\end{cases}$`
      }
      if (k === 1) {
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u2, v2))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u2, v2)) / u2)}b &= ${(-u1 * n1 * ppcm(u2, v2)) / u2} \\quad (${rienSi1(ppcm(u2, v2) / u2)}L_1)\\\\  ${rienSi1((v2 * ppcm(u2, v2)) / v2)}a ${ecritureAlgebriqueSauf1((v3 * ppcm(u2, v2)) / v2)}b &= ${(-v1 * n1 * ppcm(u2, v2)) / v2} \\quad (${rienSi1(ppcm(u2, v2) / v2)}L_2)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u2, v2))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u2, v2)) / u2)}b &= ${(-u1 * n1 * ppcm(u2, v2)) / u2} \\quad (L_1)\\\\   ${rienSi1((v3 * ppcm(u2, v2)) / v2 - (u3 * ppcm(u2, v2)) / u2)}b &= ${(-v1 * n1 * ppcm(u2, v2)) / v2 - (-u1 * n1 * ppcm(u2, v2)) / u2} \\quad (L_2-L_1)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u2, v2))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u2, v2) * n3) / u2)} &= ${(-u1 * n1 * ppcm(u2, v2)) / u2} \\quad (L_1)\\\\  b &= ${n3}\\quad (L_2)\\end{cases}$`
        texteCorr += `<br><br>$\\iff \\begin{cases}a    &= ${n2} \\quad (L_1)\\\\  b &= ${n3}\\quad (L_2)\\end{cases}$`
      }
      if (k === 2) {
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u1, v1)) / u1)}b &= ${(-u2 * n2 * ppcm(u1, v1)) / u1} \\quad (${rienSi1(ppcm(u1, v1) / u1)}L_1)\\\\  ${rienSi1((v1 * ppcm(u1, v1)) / v1)}a ${ecritureAlgebriqueSauf1((v3 * ppcm(u1, v1)) / v1)}b &= ${(-v2 * n2 * ppcm(u1, v1)) / v1} \\quad (${rienSi1(ppcm(u1, v1) / v1)}L_2)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u1, v1)) / u1)}b &= ${(-u2 * n2 * ppcm(u1, v1)) / u1} \\quad (L_1)\\\\   ${rienSi1((v3 * ppcm(u1, v1)) / v1 - (u3 * ppcm(u1, v1)) / u1)}b &= ${(-v2 * n2 * ppcm(u1, v1)) / v1 - (-u2 * n2 * ppcm(u1, v1)) / u1} \\quad (L_2-L_1)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u3 * ppcm(u1, v1) * n3) / u1)} &= ${(-u2 * n2 * ppcm(u1, v1)) / u1} \\quad (L_1)\\\\  b &= ${n3}\\quad (L_2)\\end{cases}$`
        texteCorr += `<br><br>$\\iff \\begin{cases}a    &= ${n1} \\quad (L_1)\\\\  b &= ${n3}\\quad (L_2)\\end{cases}$`
      }
      if (k === 3) {
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u2 * ppcm(u1, v1)) / u1)}b &= ${(-u3 * n3 * ppcm(u1, v1)) / u1} \\quad (${rienSi1(ppcm(u1, v1) / u1)}L_1)\\\\  ${rienSi1((v1 * ppcm(u1, v1)) / v1)}a ${ecritureAlgebriqueSauf1((v2 * ppcm(u1, v1)) / v1)}b &= ${(-v3 * n3 * ppcm(u1, v1)) / v1} \\quad (${rienSi1(ppcm(u1, v1) / v1)}L_2)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u2 * ppcm(u1, v1)) / u1)}b &= ${(-u3 * n3 * ppcm(u1, v1)) / u1} \\quad (L_1)\\\\   ${rienSi1((v2 * ppcm(u1, v1)) / v1 - (u2 * ppcm(u1, v1)) / u1)}b &= ${(-v3 * n3 * ppcm(u1, v1)) / v1 - (-u3 * n3 * ppcm(u1, v1)) / u1} \\quad (L_2-L_1)\\end{cases}$`
        texteCorr += `<br><br>$ \\iff \\begin{cases}${rienSi1(ppcm(u1, v1))}a   ${ecritureAlgebriqueSauf1((u2 * ppcm(u1, v1) * n2) / u1)} &= ${(-u3 * n3 * ppcm(u1, v1)) / u1} \\quad (L_1)\\\\  b &= ${n2}\\quad (L_2)\\end{cases}$`
        texteCorr += `<br><br>$\\iff \\begin{cases}a    &= ${n1} \\quad (L_1)\\\\  b &= ${n2}\\quad (L_2)\\end{cases}$`
      }

      texteCorr += `<br>Un vecteur normal aux deux vecteurs de l'énoncé est : $\\vec{n} \\begin{pmatrix} ${miseEnEvidence(n1)} \\\\ ${miseEnEvidence(n2)} \\\\ ${miseEnEvidence(n3)} \\end{pmatrix}$.`
      texteCorr +=
        '<br>Remarque : Tout vecteur non nul et colinéaire à ce vecteur sera aussi normal au plan.'
      if (this.questionJamaisPosee(i, u1, u2, u3, v1, v2, v3)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
