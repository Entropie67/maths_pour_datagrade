import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Manipuler fractions égales et égalité des produits en croix'

export const amcReady = true
export const amcType = 'qcmMono'

export const interactifReady = true
export const dateDePublication = '23/05/2021'
export const dateDeModifImportante = '26/08/2023'

export const description =
  `Déterminer si une égalité de deux fractions est vraie en utilisant les produits en croix.<br> 4 niveaux${sp()}: petits entiers, grands entiers, décimaux, mélange.`

/**
 * * Fractions et égalité des produits en croix
 * @author Sébastien Lozano
 */
export const uuid = 'd1fb2'

export const refs = {
  'fr-fr': ['4C26'],
  'fr-ch': ['9R1NO4D-7', '9R2NO4D-7', '9R3NO4D-7', 'PRQNO10B-7'],
}

/**
 * Une fonction pour afficher des fraction avec num et/ou den décimaux
 * @param num le numerateur de type number
 * @param den le dénominateur de type number
 */
function showFracNumDenDec(num: number, den: number) {
  const f = fraction(num, den)
  return `\\dfrac{${texNombre(f.num / 10, 1)}}{${texNombre(f.den / 10, 1)}}`
}
/**
 * Une fonction pour rendre deux fractions égales ou pas
 * @param {boolean} bool
 * @returns deux fractions egales ou non
 */
const fracEqualOrNot = function (
  bool: boolean,
  n: number,
  d: number,
  k: number,
) {
  // On a besoin de deux fractions
  let f2
  const f1 = fraction(n, d)
  if (bool) {
    f2 = fraction(n * k, d * k)
  } else {
    f2 = fraction(n + k, d + k)
  }
  return { frac: f1, fracEqualOrNot: f2 }
}

/**
 * Une fonction pour la correction
 * @param bool le booléen pour savoir si il y a égalité ou pas
 * @param f une fraction
 * @param fEqOrNot l'autre fraction égale ou pas
 */
function justifyEq(
  bool: boolean,
  deuxFractions: { frac: FractionEtendue; fracEqualOrNot: FractionEtendue },
  decimal = false,
) {
  const f = deuxFractions.frac
  const fEqOrNot = deuxFractions.fracEqualOrNot
  let strOut
  // tous les nombres sont entiers ! on pourrait complètement se passer de texNombre (sauf pour les séparateurs de classes) => précision mise à 0
  if (bool) {
    if (decimal) {
      strOut = `D'une part, $${texNombre(f.num / 10, 1)}\\times ${texNombre(fEqOrNot.den / 10, 1)} = ${texNombre((f.num * fEqOrNot.den) / 100, 2)}$.<br>
            D'autre part, $${texNombre(f.den / 10, 1)}\\times ${texNombre(fEqOrNot.num / 10, 1)} = ${texNombre((f.den * fEqOrNot.num) / 100, 2)}$.<br>
            On constate que les produits en croix sont égaux.<br>
            `
      strOut += `Les quotients $${showFracNumDenDec(f.num, f.den)}$ et $${showFracNumDenDec(fEqOrNot.num, fEqOrNot.den)}$ sont donc égaux.<br>${texteEnCouleurEtGras("L'égalité est vraie.")}`
    } else {
      strOut = `D'une part, $${texNombre(f.num, 0)}\\times ${texNombre(fEqOrNot.den, 0)} = ${texNombre(f.num * fEqOrNot.den, 0)}$.<br>
            D'autre part, $${texNombre(f.den, 0)}\\times ${texNombre(fEqOrNot.num, 0)} = ${texNombre(f.den * fEqOrNot.num, 0)}$.<br>
            On constate que les produits en croix sont égaux.<br>
            `
      strOut += `Les fractions $${f.texFraction}$ et $${fEqOrNot.texFraction}$ sont donc égales.<br>${texteEnCouleurEtGras("L'égalité est vraie.")}`
    }
  } else {
    if (!decimal) {
      strOut = `D'une part, $${texNombre(f.num, 0)}\\times ${texNombre(fEqOrNot.den, 0)} = ${texNombre(f.num * fEqOrNot.den, 0)}$.<br>
            D'autre part, $${texNombre(f.den, 0)}\\times ${texNombre(fEqOrNot.num, 0)} = ${texNombre(f.den * fEqOrNot.num, 0)}$.<br>
            On constate que les produits en croix ne sont pas égaux.<br>
            `
      strOut += `Les fractions $${f.texFraction}$ et $${fEqOrNot.texFraction}$ ne sont donc pas égales.<br>${texteEnCouleurEtGras("L'égalité est fausse.")}`
    } else {
      // si on utilise des nombres décimaux au numérateur et au dénominateur, il ne faudrait pas appeler ça des fractions
      strOut = `D'une part, $${texNombre(f.num / 10, 1)}\\times ${texNombre(fEqOrNot.den / 10, 1)} = ${texNombre((f.num * fEqOrNot.den) / 100, 2)}$.<br>
            D'autre part, $${texNombre(f.den / 10, 1)}\\times ${texNombre(fEqOrNot.num / 10, 1)} = ${texNombre((f.den * fEqOrNot.num) / 100, 2)}$.<br>
            On constate que les produits en croix ne sont pas égaux.<br>
            `
      strOut += `Les quotients $${showFracNumDenDec(f.num, f.den)}$ et $${showFracNumDenDec(fEqOrNot.num, fEqOrNot.den)}$ ne sont donc pas égaux.<br>${texteEnCouleurEtGras("L'égalité est fausse.")}`
    }
  }
  return strOut
}

export default class EqResolvantesThalesBis extends Exercice {
  niveau: string
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de nombres',
      4,
      '1 : Petits entiers\n2 : Grands entiers\n3 : Décimaux\n4 : Mélange',
    ]
    this.nbQuestions = 4
    this.sup = 1 // Niveau de difficulté
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
    this.niveau = '5e'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? `Les égalités suivantes sont-elles vraies${sp()}? Justifier.`
        : `L'égalité suivante est-elle vraie${sp()}? Justifier.`

    const listeTypeDeQuestions = Number(this.sup < 4)
      ? Array(this.nbQuestions).fill(Number(this.sup))
      : Array(this.nbQuestions)
          .fill(0)
          .map(() => randint(1, 3))

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On a besoin d'un booléen pour que tout ne soit pas vrai ou faux
      let equalOrNot
      // On a besoin de variables opur les fractions
      let f, fEqOrNot, deuxFractions
      // On a besoin d'un numerateur d'un dénominateur et d'un coefficient pour les fractions égales
      let num, den
      // On a besoin d'un string pour stocker l'égalité et un autre pour la justification
      let egalite, justification
      const k = randint(2, 9)

      // On prépare tous les contenus selon le type de questions
      this.sup = Number(this.sup) // attention le formulaire renvoie un string, on a besoin d'un number pour le switch !
      switch (listeTypeDeQuestions[i]) {
        case 1: // petits entiers égalité
          equalOrNot = choice([true, false])
          num = randint(1, 9)
          den = randint(2, 9, num)
          deuxFractions = fracEqualOrNot(equalOrNot, num, den, k)
          egalite = `$${deuxFractions.frac.texFraction}\\overset{?}{=}${deuxFractions.fracEqualOrNot.texFraction}$`
          justification = justifyEq(equalOrNot, deuxFractions, false)
          break
        case 2: // grands entiers
          equalOrNot = choice([true, false])
          num = randint(11, 99)
          den = randint(11, 99, num)
          deuxFractions = fracEqualOrNot(equalOrNot, num, den, k)
          egalite = `$${deuxFractions.frac.texFraction}\\overset{?}{=}${deuxFractions.fracEqualOrNot.texFraction}$`
          justification = justifyEq(equalOrNot, deuxFractions, false)
          break
        case 3: // décimaux
          equalOrNot = choice([true, false])
          num = randint(11, 99)
          den = randint(11, 99, num)
          deuxFractions = fracEqualOrNot(equalOrNot, num, den, k)
          f = deuxFractions.frac
          fEqOrNot = deuxFractions.fracEqualOrNot
          // on utilise une fraction (quotient d'entiers) mais la fonction showFracNumDenDec() affiche les nombres divisés par 10
          egalite = `$${showFracNumDenDec(f.num, f.den)}\\overset{?}{=}${showFracNumDenDec(fEqOrNot.num, fEqOrNot.den)}$`
          // la justification se fait avec les entiers.
          justification = justifyEq(equalOrNot, deuxFractions, true)
          break
      }

      const enonces = []
      for (let k = 0; k < 4; k++) {
        enonces.push({
          enonce: egalite,
          question: '',
          correction: justification,
        })
      }
      texte = `${enonces[listeTypeDeQuestions[i]].enonce}`
      texteCorr = `${enonces[listeTypeDeQuestions[i]].correction}`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: "L'égalité est vraie.",
          statut: equalOrNot,
        },
        {
          texte: "L'égalité est fausse.",
          statut: !equalOrNot,
        },
        {
          texte: 'Je ne sais pas.',
          statut: false,
        },
      ]
      this.autoCorrection[i].options = { ordered: true } // On ne mélange pas les propositions 'Oui', 'Non' et 'Je ne sais pas'
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += '<br>' + props.texte
      }
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
