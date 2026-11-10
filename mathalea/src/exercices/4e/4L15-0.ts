import { texteGras } from '../../lib/format/style'
import {
  choice,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { fractionSimplifiee } from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif, rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Trouver l'erreur dans une résolution d'équation du premier degré"

/**
 * * Trouver l'erreur dans une equation
 * @author Sébastien Lozano
 */
export const uuid = 'df5a3'

export const refs = {
  'fr-fr': ['4L15-0', 'BP2RES6', 'BP1AUTO018'],
  'fr-ch': ['10LCFA5C-4', '10LSFA5C-4', '11CTFA4C-4', '11LCFA4C-4', '11LSFA4C-4', 'PRQST03B-2', 'PRQAL05B-7'],
}

// une fonction pour gérer le signe
const signeDansEq = function (nb: number) {
  if (nb > 0) {
    return {
      signe: '+',
      operation: '\\bf{soustraire}',
      operationTexte: 'soustraire',
      chgt_signe: nb,
    }
  } else {
    return {
      signe: '',
      operation: '\\bf{ajouter}',
      operationTexte: 'ajouter',
      chgt_signe: nb * -1,
    }
  }
}

// une fonction pour gérer le genre du prénom et le pronom associé
const genreEtPrenom = function () {
  const n = randint(0, 1)
  if (n === 0) {
    return { prenom: prenomM(), pronom: 'il' }
  } else {
    return { prenom: prenomF(), pronom: 'elle' }
  }
}

// deux fonctionx pour conditionner la simplification d'une fraction
const isSimp = function (n: number, d: number) {
  if (fractionSimplifiee(n, d)[0] !== n) {
    return true
  } else {
    return false
  }
}

const simpFrac = function (n: number, d: number) {
  if (isSimp(n, d)) {
    if (fractionSimplifiee(n, d)[1] === 1) {
      return `$= ${fractionSimplifiee(n, d)[0]}$`
    } else if (fractionSimplifiee(n, d)[0] === 0) {
      return '$ = 0'
    } else {
      return `$= \\dfrac{${fractionSimplifiee(n, d)[0]}}{${fractionSimplifiee(n, d)[1]}}$`
    }
  } else {
    if (fractionSimplifiee(n, d)[1] === 1) {
      return `$= ${fractionSimplifiee(n, d)[0]}$`
    } else if (fractionSimplifiee(n, d)[0] === 0) {
      return '$ = 0$'
    } else {
      return ' '
    }
  }
}

export default class TrouverErreurResolEqDeg1 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    // On ne peut pas aller à la ligne dans l'environnement exo de la sortie LaTeX
    if (!context.isHtml) {
      this.consigne = this.consigne.replace('<br>', ' ')
    }
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Trouver l'erreur dans les résolutions suivantes.<br>On ne demande pas de résoudre l'équation."
        : "Trouver l'erreur dans la résolution suivante.<br>On ne demande pas de résoudre l'équation."
    const typeDeQuestionsDisponibles = shuffle([
      choice([1, 3]),
      choice([2, 4]),
      5,
    ])

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus
    const variables = ['x', 't', 'u', 'v', 'w', 'y', 'z']

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on choisit un nom pour l'inconnue
      const inc = variables[randint(0, variables.length - 1)]

      // on choisit les paramètres
      const a = randint(-9, 9, [-1, 0, 1])
      const b = randint(-9, 9, [-1, 0, 1])
      const c = randint(-9, 9, [-1, 0, 1, a, -a])
      const d = randint(-9, 9, [-1, 0, 1])

      const currentGenreEtPrenom = genreEtPrenom()

      // pour les situations
      const situations = [
        {
          // case 1 --> ax+b=d+cx  erreur à l'étape 1 on passe cx de l'autre côté
          pronom: currentGenreEtPrenom.pronom,
          prenom: currentGenreEtPrenom.prenom,
          a,
          b,
          c,
          d,
          inc,
          eq: `$${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}$`,
          et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(c).signe} ${rienSi1(c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          et2: `${texteGras('Étape $\\mathbf{2}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(c).signe} ${rienSi1(c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et3: `${texteGras('Étape $\\mathbf{3}$ :')} $${rienSi1(a + c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et4: `${texteGras('Étape $\\mathbf{4}$ :')} $${inc} = \\dfrac{${d} ${signeDansEq(-b).signe} ${-b}}{${a + c}}$`,
          et_fin: `${texteGras('Étape $\\mathbf{5}$ :')} $${inc} = \\dfrac{${d - b}}{${a + c}}$ ${simpFrac(d - b, a + c)}`,
          err: `L'erreur se situe à l'étape $1$.<br>${currentGenreEtPrenom.prenom} «${sp(1)}a fait passer${sp(1)}» le terme $${signeDansEq(c).signe} ${rienSi1(c)}${inc}$ «${sp(1)}de l'autre côté${sp(1)}»
            or pour obtenir une équation équivalente, il s'agit d'opérer de la même manière sur les deux membres de l'équation.<br>Ici il faut ${signeDansEq(c).operationTexte} $${signeDansEq(c).chgt_signe}${inc}$ aux deux membres.`,
          eq_corr: `${texteGras("Équation d'origine : ")} $${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}$`,
          eq_corr_et1: `${texteGras('Étape $\\mathbf{1}$ : ')} $${miseEnEvidence(signeDansEq(c).operation)}$ $${miseEnEvidence(signeDansEq(c).chgt_signe)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} aux deux membres.<br> $${rienSi1(a)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} $${signeDansEq(b).signe}\\,${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$${inc}$`)}<br>${texteGras('Étape $\\mathbf{2}$ : ')} On réduit.<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          eq_corr_et2: `${texteGras('Étape $\\mathbf{3}$ :')} $${miseEnEvidence(signeDansEq(b).operation)}$ $${miseEnEvidence(signeDansEq(b).chgt_signe)}$ aux deux membres.<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)} = ${d}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)}$<br>${texteGras('Étape $\\mathbf{4}$ : ')} Réduction à nouveau.<br> $${rienSi1(a - c)}${inc} = ${d - b}$`,
          eq_corr_et3: `${texteGras('Étape $\\mathbf{5}$ :')} $${miseEnEvidence('\\textbf{diviser par}')}$ $${miseEnEvidence(a - c)}$ les deux membres.<br> $\\dfrac{${rienSi1(a - c)}${inc}}{${miseEnEvidence(a - c)}} = \\dfrac{${d - b}}{${miseEnEvidence(a - c)}}$<br>$${inc} = \\dfrac{${d - b}}{${a - c}}$ ${simpFrac(d - b, a - c)}`,
        },
        {
          // case 2 --> ax+b=d+cx  erreur à l'étape 2 on passe b de l'autre côté
          pronom: currentGenreEtPrenom.pronom,
          prenom: currentGenreEtPrenom.prenom,
          a,
          b,
          c,
          d,
          inc,
          eq: `$${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}$`,
          et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(-c).signe} ${rienSi1(-c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`,
          et2: `${texteGras('Étape $\\mathbf{2}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(-c).signe} ${rienSi1(-c)}${inc} = ${d} ${signeDansEq(b).signe} ${b}$`, // l'erreur est là on passe de l'autre côté
          et3: `${texteGras('Étape $\\mathbf{3}$ :')} $${rienSi1(a - c)}${inc} = ${d} ${signeDansEq(b).signe} ${b}$`,
          et4: `${texteGras('Étape $\\mathbf{4}$ :')} $${inc} = \\dfrac{${d} ${signeDansEq(b).signe} ${b}}{${a - c}}$`,
          et_fin: `${texteGras('Étape $\\mathbf{5}$ :')} $${inc} = \\dfrac{${d + b}}{${a - c}}$ ${simpFrac(d + b, a - c)}`,
          err: `L'erreur se situe à l'étape $2$.<br>${currentGenreEtPrenom.prenom} «${sp(1)}a fait passer${sp(1)}» le terme $${signeDansEq(b).signe} ${b}$ «${sp(1)}de l'autre côté${sp(1)}»
            or pour obtenir une équation équivalente, il s'agit d'opérer de la même manière sur les deux membres de l'équation.<br>Ici il faut ${signeDansEq(b).operationTexte} $${signeDansEq(b).chgt_signe}$ aux deux membres.`,
          eq_corr: `${texteGras("Équation d'origine : ")} $${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}$`,
          eq_corr_et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${miseEnEvidence(signeDansEq(c).operation)}$ $${miseEnEvidence(signeDansEq(c).chgt_signe)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} aux deux membres<br> $${rienSi1(a)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} $ ${signeDansEq(b).signe}\\,${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)}<br>${texteGras('Étape $\\mathbf{2}$ : ')} On réduit.<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          eq_corr_et2: `${texteGras('Étape $\\mathbf{3}$ :')} $${miseEnEvidence(signeDansEq(b).operation)}$ $${miseEnEvidence(signeDansEq(b).chgt_signe)}$ aux deux membres<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)} = ${d}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)}$<br>${texteGras('Étape $\\mathbf{4}$ : ')} Réduction à nouveau.<br> $${rienSi1(a - c)}${inc} = ${d - b}$`,
          eq_corr_et3: `${texteGras('Étape $\\mathbf{5}$ :')} $${miseEnEvidence('\\textbf{diviser par}')}$ $${miseEnEvidence(a - c)}$ les deux membres<br> $\\dfrac{${rienSi1(a - c)}${inc}}{${miseEnEvidence(a - c)}} = \\dfrac{${d - b}}{${miseEnEvidence(a - c)}}$<br>$${inc} = \\dfrac{${d - b}}{${a - c}}$ ${simpFrac(d - b, a - c)}`,
        },
        {
          // case 3 --> ax+b=cx+d  erreur à l'étape 2 on passe cx de l'autre côté
          pronom: currentGenreEtPrenom.pronom,
          prenom: currentGenreEtPrenom.prenom,
          a,
          b,
          c,
          d,
          inc,
          eq: `$${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${rienSi1(a)}${inc} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et2: `${texteGras('Étape $\\mathbf{2}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(c).signe} ${rienSi1(c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`, // l'erreur est là on passe de l'autre côté
          et3: `${texteGras('Étape $\\mathbf{3}$ :')} $${rienSi1(a + c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et4: `${texteGras('Étape $\\mathbf{4}$ :')} $${inc} = \\dfrac{${d} ${signeDansEq(-b).signe} ${-b}}{${a + c}}$`,
          et_fin: `${texteGras('Étape $\\mathbf{5}$ :')} $${inc} = \\dfrac{${d - b}}{${a + c}}$ ${simpFrac(d - b, a + c)}`,
          err: `L'erreur se situe à l'étape $2$.<br>${currentGenreEtPrenom.prenom} «${sp(1)}a fait passer${sp(1)}» le terme $${signeDansEq(c).signe} ${rienSi1(c)}${inc}$ «${sp(1)}de l'autre côté${sp(1)}»
            or pour obtenir une équation équivalente, il s'agit d'opérer de la même manière sur les deux membres de l'équation.<br>Ici il faut ${signeDansEq(c).operationTexte} $${signeDansEq(c).chgt_signe}${inc}$ aux deux membres.`,
          eq_corr: `${texteGras("Équation d'origine : ")} $${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          eq_corr_et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${miseEnEvidence(signeDansEq(c).operation)}$ $${miseEnEvidence(signeDansEq(c).chgt_signe)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} aux deux membres<br> $${rienSi1(a)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} $${signeDansEq(b).signe}\\,${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)}<br>${texteGras('Étape $\\mathbf{2}$ : ')} On réduit.<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          eq_corr_et2: `${texteGras('Étape $\\mathbf{3}$ :')} $${miseEnEvidence(signeDansEq(b).operation)}$ $${miseEnEvidence(signeDansEq(b).chgt_signe)}$ aux deux membres<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)} = ${d}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)}$<br>${texteGras('Étape $\\mathbf{4}$ : ')} Réduction à nouveau.<br> $${rienSi1(a - c)}${inc} = ${d - b}$`,
          eq_corr_et3: `${texteGras('Étape $\\mathbf{5}$ :')} $${miseEnEvidence('\\textbf{diviser par}')}$ $${miseEnEvidence(a - c)}$ les deux membres<br> $\\dfrac{${rienSi1(a - c)}${inc}}{${miseEnEvidence(a - c)}} = \\dfrac{${d - b}}{${miseEnEvidence(a - c)}}$<br>$${inc} = \\dfrac{${d - b}}{${a - c}}$ ${simpFrac(d - b, a - c)}`,
        },
        {
          // case 4 --> ax+b=cx+d  erreur à l'étape 1 on passe b de l'autre côté
          pronom: currentGenreEtPrenom.pronom,
          prenom: currentGenreEtPrenom.prenom,
          a,
          b,
          c,
          d,
          inc,
          eq: `$${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${rienSi1(a)}${inc} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d} ${signeDansEq(b).signe} ${b}$`, // l'erreur est là on passe de l'autre côté
          et2: `${texteGras('Étape $\\mathbf{2}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(-c).signe} ${rienSi1(-c)}${inc} = ${d} ${signeDansEq(b).signe} ${b}$`,
          et3: `${texteGras('Étape $\\mathbf{3}$ :')} $${rienSi1(a - c)}${inc} = ${d} ${signeDansEq(b).signe} ${b}$`,
          et4: `${texteGras('Étape $\\mathbf{4}$ :')} $${inc} = \\dfrac{${d} ${signeDansEq(b).signe} ${b}}{${a - c}}$`,
          et_fin: `${texteGras('Étape $\\mathbf{5}$ :')} $${inc} = \\dfrac{${d + b}}{${a - c}}$ ${simpFrac(d + b, a - c)}`,
          err: `L'erreur se situe à l'étape $1$.<br>${currentGenreEtPrenom.prenom} «${sp(1)}a fait passer${sp(1)}» le terme $${signeDansEq(b).signe} ${b}$ «${sp(1)}de l'autre côté${sp(1)}»
            or pour obtenir une équation équivalente, il s'agit d'opérer de la même manière sur les deux membres de l'équation.<br>Ici il faut ${signeDansEq(b).operationTexte} $${signeDansEq(b).chgt_signe}$ aux deux membres.`,
          eq_corr: `${texteGras("Équation d'origine : ")} $${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          eq_corr_et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${miseEnEvidence(signeDansEq(c).operation)}$ $${miseEnEvidence(signeDansEq(c).chgt_signe)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} aux deux membres<br>$${rienSi1(a)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} $${signeDansEq(b).signe}\\,${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)}<br>${texteGras('Étape $\\mathbf{2}$ : ')} On réduit.<br>$${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          eq_corr_et2: `${texteGras('Étape $\\mathbf{3}$ :')} $${miseEnEvidence(signeDansEq(b).operation)}$ $${miseEnEvidence(signeDansEq(b).chgt_signe)}$ aux deux membres<br>$${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)} = ${d}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)}$<br>${texteGras('Étape $\\mathbf{4}$ : ')} Réduction à nouveau.<br>$${rienSi1(a - c)}${inc} = ${d - b}$`,
          eq_corr_et3: `${texteGras('Étape $\\mathbf{5}$ :')} $${miseEnEvidence('\\textbf{diviser par}')}$ $${miseEnEvidence(a - c)}$ les deux membres<br>$\\dfrac{${rienSi1(a - c)}${inc}}{${miseEnEvidence(a - c)}} = \\dfrac{${d - b}}{${miseEnEvidence(a - c)}}$<br>$${inc} = \\dfrac{${d - b}}{${a - c}}$ ${simpFrac(d - b, a - c)}`,
        },
        {
          // case 5 --> ax+b=cx+d  erreur à l'étape 4 on soustrait au lieu de diviser
          pronom: currentGenreEtPrenom.pronom,
          prenom: currentGenreEtPrenom.prenom,
          a,
          b,
          c,
          d,
          inc,
          eq: `$${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${rienSi1(a)}${inc} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et2: `${texteGras('Étape $\\mathbf{2}$ :')} $${rienSi1(a)}${inc} ${signeDansEq(-c).signe} ${rienSi1(-c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et3: `${texteGras('Étape $\\mathbf{3}$ :')} $${rienSi1(a - c)}${inc} = ${d} ${signeDansEq(-b).signe} ${-b}$`,
          et4: `${texteGras('Étape $\\mathbf{4}$ :')} $${inc} = ${d} ${signeDansEq(-b).signe} ${-b} - ${ecritureParentheseSiNegatif(a - c)}$`,
          et_fin: `${texteGras('Étape $\\mathbf{5}$ :')} $${inc} = ${d - b - a + c}$`,
          err: `L'erreur se situe à l'étape $4$.<br>${currentGenreEtPrenom.prenom} soustrait le coefficient de $${inc}$ au lieu de diviser par ce coefficient.<br>Or $${rienSi1(a - c)}${inc}$ représente la multiplication $${a - c}\\times ${inc}$, et l'opération inverse de la multiplication c'est la division et non la soustraction.<br>Ici il faut diviser les deux membres par $${a - c}$.`,
          eq_corr: `${texteGras("Équation d'origine : ")} $${rienSi1(a)}${inc} ${signeDansEq(b).signe} ${b} = ${rienSi1(c)}${inc} ${signeDansEq(d).signe} ${d}$`,
          eq_corr_et1: `${texteGras('Étape $\\mathbf{1}$ :')} $${miseEnEvidence(signeDansEq(c).operation)}$ $${miseEnEvidence(signeDansEq(c).chgt_signe)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} aux deux membres<br> $${rienSi1(a)}${inc} ${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)} $${signeDansEq(b).signe}\\,${b} = ${d} ${signeDansEq(c).signe} ${rienSi1(c)}${inc}\\,${miseEnEvidence(signeDansEq(-c).signe)}\\,${miseEnEvidence(-c)}$${texteEnCouleur(`$\\boldsymbol{${inc}}$`)}<br>${texteGras('Étape $\\mathbf{2}$ : ')} On réduit.<br>$${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b} = ${d}$`, // l'erreur est là, on passe de l'autre côté d'où l'oubli du chgt de signe
          eq_corr_et2: `${texteGras('Étape $\\mathbf{3}$ :')} $${miseEnEvidence(signeDansEq(b).operation)}$ $${miseEnEvidence(signeDansEq(b).chgt_signe)}$ aux deux membres<br> $${rienSi1(a - c)}${inc} ${signeDansEq(b).signe} ${b}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)} = ${d}\\,${miseEnEvidence(signeDansEq(-b).signe)}\\,${miseEnEvidence(-b)}$<br>${texteGras('Étape $\\mathbf{4}$ : ')} Réduction à nouveau.<br> $${rienSi1(a - c)}${inc} = ${d - b}$`,
          eq_corr_et3: `${texteGras('Étape $\\mathbf{5}$ :')} $${miseEnEvidence('\\textbf{diviser par}')}$ $${miseEnEvidence(a - c)}$ les deux membres<br> $\\dfrac{${rienSi1(a - c)}${inc}}{${miseEnEvidence(a - c)}} = \\dfrac{${d - b}}{${miseEnEvidence(a - c)}}$<br>$${inc} = \\dfrac{${d - b}}{${a - c}}$ ${simpFrac(d - b, a - c)}`,
        },
      ]

      const enonces = []
      for (let k = 0; k < 5; k++) {
        enonces.push({
          enonce: `          ${situations[k].prenom} doit résoudre l'équation suivante : ${situations[k].eq}.<br> Voilà ce qu'${situations[k].pronom} écrit :<br>${situations[k].et1}<br>${situations[k].et2}<br>${situations[k].et3}<br>${situations[k].et4}<br>${situations[k].et_fin}
        `,
          question: '',
          correction: `
        ${situations[k].err}<br>${texteGras('=== Voici une proposition de résolution détaillée : ===')}<br>${situations[k].eq_corr}<br>${situations[k].eq_corr_et1}<br>${situations[k].eq_corr_et2}<br>${situations[k].eq_corr_et3}
        `,
        })
      }
      texte = `${enonces[listeTypeDeQuestions[i] - 1].enonce}`
      texteCorr = `${enonces[listeTypeDeQuestions[i] - 1].correction}`

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
