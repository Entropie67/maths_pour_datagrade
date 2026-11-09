import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiMoins,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { ppcm, ppcmListe } from '../../lib/outils/primalite'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des sommes algébriques de fractions'
export const dateDePublication = '18/08/2026'
export const interactifReady = true
export const uuid = 'b51bd'
export const refs = {
  'fr-fr': ['2N31-1', 'BP2AutoH1'],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-Claude Lhote
 */

const leSuperFormulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'typeDeQuestion',
      label: 'Types de calculs',
      items: [
        {
          nom: '1',
          label: 'Somme ou différence de deux fractions',
          poids: 1,
        },
        {
          nom: '2',
          label: "Somme ou différence d'un entier et d'une fraction",
          poids: 1,
        },
        {
          nom: '3',
          label: 'Somme algébrique de trois fractions',
          poids: 1,
        },
        {
          nom: '4',
          label: 'Somme algébrique de quatre fractions',
          poids: 1,
        },
      ],
    },
    {
      type: 'liste',
      nom: 'denominateurs',
      label: 'dénominateurs',
      items: [
        { nom: '1', label: '2, 4, 8' },
        { nom: '2', label: '3, 6, 12' },
        { nom: '3', label: '5, 10, 20' },
        { nom: '4', label: 'Quelconque inférieur à 10' },
      ],
    },
  ],
}
const calculeSomme3Fractions = (
  f1: FractionEtendue,
  f2: FractionEtendue,
  f3: FractionEtendue,
  resultatFinal: FractionEtendue,
  signe1: string,
  signe2: string,
) => {
  const cm = ppcmListe([f1.den, f2.den, f3.den])
  const calcul = `\\dfrac{${f1.num}${signe1}${f2.num}${signe2}${f3.num}}{${cm}}\\\\
        ${
          resultatFinal.estIrreductible
            ? `&=${miseEnEvidence(resultatFinal.texFSD)}`
            : `&=${resultatFinal.texFSD}\\\\\n
              &=${miseEnEvidence(resultatFinal.simplifie().texFSD)}`
        }
        \\end{aligned}`
  return calcul
}
const calculeSomme = (
  f1: FractionEtendue,
  f2: FractionEtendue,
  resultat: FractionEtendue,
  signe: string,
) => {
  let calcul = ''
  if (f1.den === f2.den) {
    calcul += `\\dfrac{${f1.num}${signe}${f2.num}}{${f1.den}}\\\\
        ${
          resultat.estIrreductible
            ? `&=${miseEnEvidence(resultat.texFSD)}`
            : `&=${resultat.texFSD}\\\\\n
              &=${miseEnEvidence(resultat.simplifie().texFSD)}`
        }
        \\end{aligned}`
  } else {
    const cm = ppcm(f1.den, f2.den)
    calcul += `${f1.reduire(cm / f1.den).texFSD} ${signe} ${f2.reduire(cm / f2.den).texFraction}\\\\\n`
    calcul += `&=\\dfrac{${f1.num * (cm / f1.den)}${signe}${f2.num * (cm / f2.den)}}{${cm}}\\\\\n`
    calcul += `${
      resultat.estIrreductible
        ? `&=${miseEnEvidence(resultat.texFSD)}`
        : `&=${resultat.texFSD}\\\\
        &=${miseEnEvidence(resultat.simplifie().texFSD)}`
    }
        \\end{aligned}`
  }
  return calcul
}
export default class ExerciceSommesAlgebriquesDeFractions2nde extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.listeAvecNumerotation = false
    this.consigne =
      'Calculer et donner le résultat sous la forme d’une fraction irréductible.'
    this.besoinFormulaireComplexe = leSuperFormulaire
    this.sup = serialiseFormulaireComplexe(
      leSuperFormulaire,
      valeursParDefaut(leSuperFormulaire),
    )
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = commentaireMultiLignes
  }

  choixDenominateurs(choix: string) {
    switch (choix) {
      case '1':
        return shuffle([2, 4, 8, 2, 4, 8])
      case '2':
        return shuffle([3, 6, 12, 3, 6, 12])
      case '3':
        return shuffle([5, 10, 20, 5, 10, 20])
      case '4':
      default:
        return [randint(2, 9), randint(2, 9), randint(2, 9), randint(2, 9)]
    }
  }

  calculSommeOuDifferenceDeDeuxFractions(
    f1: FractionEtendue,
    f2: FractionEtendue,
    signe: string,
    lettre: string,
  ): { texteCorr: string; resultat: FractionEtendue } {
    const resultat =
      signe === '+' ? f1.sommeFraction(f2) : f1.differenceFraction(f2)
    let calcul = `\\begin{aligned}${lettre}&=${f1.texFSD} ${signe} ${f2.texFraction}\\\\\n&=`
    calcul += calculeSomme(f1, f2, resultat, signe)
    return {
      texteCorr: `$${calcul}$`,
      resultat,
    }
  }

  uneSommeOuDifferenceDeDeuxFractions(
    choixDenominateurs: string,
    lettre: string,
  ) {
    // Les deux dénominateurs de départ doivent déjà être distincts : sinon,
    // pour un dénominateur premier (2, 3, 5...), la seule façon de rester
    // non entier est de garder ce même dénominateur des deux côtés, ce qui
    // rendrait la contrainte f1.den !== f2.den ci-dessous impossible à
    // satisfaire.
    let denominateurs: number[]
    do {
      denominateurs = this.choixDenominateurs(choixDenominateurs)
    } while (denominateurs[0] === denominateurs[1])
    let f1: FractionEtendue
    let f2: FractionEtendue
    do {
      f1 = fraction(randint(1, 9), denominateurs[0]).simplifie()
      f2 = fraction(randint(1, 9), denominateurs[1]).simplifie()
      // Ni même dénominateur, ni fraction devenue entière : ce dernier cas
      // est déjà couvert par le type "entier + fraction".
    } while (f1.den === f2.den || f1.estEntiere || f2.estEntiere)
    const signe = ['+', '-'][randint(0, 1)]

    const texte = `$${lettre}=${f1.texFSD} ${signe} ${f2.texFraction}$`
    const { texteCorr, resultat } = this.calculSommeOuDifferenceDeDeuxFractions(
      f1,
      f2,
      signe,
      lettre,
    )
    return { texte, texteCorr, resultat }
  }
  uneSommeOuDifferenceDUnEntierEtDUneFraction(
    choixDenominateurs: string,
    lettre: string,
  ) {
    const denominateurs = this.choixDenominateurs(choixDenominateurs)
    const a = randint(1, 9)
    let f2: FractionEtendue
    do {
      f2 = fraction(randint(1, 9), denominateurs[0]).simplifie()
    } while (f2.estEntiere)
    const signe = ['+', '-'][randint(0, 1)]
    const f1 = fraction(a, 1)

    const texte = `$${lettre}=${f1.texFSD} ${signe} ${f2.texFraction}$`
    const { texteCorr, resultat } = this.calculSommeOuDifferenceDeDeuxFractions(
      f1,
      f2,
      signe,
      lettre,
    )
    return { texte, texteCorr, resultat }
  }

  calculSommeTroisFractions(
    f1: FractionEtendue,
    f2: FractionEtendue,
    f3: FractionEtendue,
    signe1: string,
    signe2: string,
    lettre: string,
  ): { texteCorr: string; resultat: FractionEtendue } {
    const resultat1 =
      signe1 === '+' ? f1.sommeFraction(f2) : f1.differenceFraction(f2)
    const resultatFinal =
      signe2 === '+'
        ? resultat1.sommeFraction(f3)
        : resultat1.differenceFraction(f3)

    let calcul = `\\begin{aligned}${lettre}&=${f1.texFSD} ${signe1} ${f2.texFraction} ${signe2} ${f3.texFraction}\\\\\n&=`
    const cm = ppcmListe([f1.den, f2.den, f3.den])
    if (cm === f1.den && cm === f2.den && cm === f3.den) {
      calcul += calculeSomme3Fractions(
        f1,
        f2,
        f3,
        resultatFinal,
        signe1,
        signe2,
      )
    } else {
      calcul += `${f1.reduire(cm / f1.den).texFSD} ${signe1} ${
        f2.reduire(cm / f2.den).texFraction
      } ${signe2} ${f3.reduire(cm / f3.den).texFraction}\\\\\n`
      calcul += `&=\\dfrac{${f1.num * (cm / f1.den)}${signe1}${
        f2.num * (cm / f2.den)
      }${signe2}${f3.num * (cm / f3.den)}}{${cm}}\\\\\n`
      calcul += `${
        resultatFinal.estIrreductible
          ? `&=${miseEnEvidence(resultatFinal.texFSD)}`
          : `&=${resultatFinal.texFSD}\\\\
        &=${miseEnEvidence(resultatFinal.simplifie().texFSD)}`
      }
        \\end{aligned}`
    }
    return {
      texteCorr: `$${calcul}$`,
      resultat: resultatFinal,
    }
  }
  uneSommeOuDifferenceDeTroisFractions(
    choixDenominateurs: string,
    lettre: string,
  ) {
    const denominateurs = this.choixDenominateurs(choixDenominateurs)
    let f1: FractionEtendue
    let f2: FractionEtendue
    let f3: FractionEtendue
    do {
      f1 = fraction(randint(1, 9), denominateurs[0]).simplifie()
      f2 = fraction(randint(1, 9), denominateurs[1]).simplifie()
      f3 = fraction(randint(1, 9), denominateurs[2]).simplifie()
    } while (f1.estEntiere && f2.estEntiere && f3.estEntiere)
    const signe1 = ['+', '-'][randint(0, 1)]
    const signe2 = ['+', '-'][randint(0, 1)]

    const texte = `$${lettre}=${f1.texFSD} ${signe1} ${f2.texFraction} ${signe2} ${f3.texFraction}$`
    const { texteCorr, resultat } = this.calculSommeTroisFractions(
      f1,
      f2,
      f3,
      signe1,
      signe2,
      lettre,
    )
    return { texte, texteCorr, resultat }
  }

  uneSommeOuDifferenceDeQuatreFractions(
    choixDenominateurs: string,
    lettre: string,
  ) {
    const denominateurs = this.choixDenominateurs(choixDenominateurs)
    let f1: FractionEtendue
    let f2: FractionEtendue
    let f3: FractionEtendue
    let f4: FractionEtendue
    do {
      f1 = fraction(
        randint(1, 9, denominateurs[0]),
        denominateurs[0],
      ).simplifie()
      f2 = fraction(
        randint(1, 9, denominateurs[1]),
        denominateurs[1],
      ).simplifie()
      f3 = fraction(
        randint(1, 9, denominateurs[2]),
        denominateurs[2],
      ).simplifie()
      f4 = fraction(
        randint(1, 9, denominateurs[3]),
        denominateurs[3],
      ).simplifie()
    } while (f1.estEntiere && f2.estEntiere && f3.estEntiere && f4.estEntiere)
    const signe1 = ['+', '-'][randint(0, 1)]
    const signe2 = ['+', '-'][randint(0, 1)]
    const signe3 = ['+', '-'][randint(0, 1)]

    const texte = `$${lettre}=${f1.texFSD} ${signe1} ${ecritureParentheseSiMoins(f2.texFraction)} ${signe2} ${ecritureParentheseSiMoins(f3.texFraction)} ${signe3} ${ecritureParentheseSiMoins(f4.texFraction)}$`
    const cm = ppcmListe([f1.den, f2.den, f3.den, f4.den])
    const resultat1 =
      signe1 === '+' ? f1.sommeFraction(f2) : f1.differenceFraction(f2)
    const resultat2 =
      signe2 === '+'
        ? resultat1.sommeFraction(f3)
        : resultat1.differenceFraction(f3)
    const resultatFinal =
      signe3 === '+'
        ? resultat2.sommeFraction(f4)
        : resultat2.differenceFraction(f4)

    let calcul = `\\begin{aligned}${lettre}&=${f1.texFSD} ${signe1} ${ecritureParentheseSiMoins(f2.texFraction)} ${signe2} ${ecritureParentheseSiMoins(f3.texFraction)} ${signe3} ${ecritureParentheseSiMoins(f4.texFraction)}\\\\\n&=`
    calcul += `${f1.reduire(cm / f1.den).texFSD}${signe1}${ecritureParentheseSiMoins(
      f2.reduire(cm / f2.den).texFraction,
    )}${signe2}${ecritureParentheseSiMoins(f3.reduire(cm / f3.den).texFraction)}${signe3}${ecritureParentheseSiMoins(f4.reduire(cm / f4.den).texFraction)}\\\\\n`
    calcul += `&=\\dfrac{${f1.num * (cm / f1.den)}${ecritureAlgebrique(
      signe1 === '+' ? f2.num * (cm / f2.den) : -f2.num * (cm / f2.den),
    )}${ecritureAlgebrique(
      signe2 === '+' ? f3.num * (cm / f3.den) : -f3.num * (cm / f3.den),
    )}${ecritureAlgebrique(
      signe3 === '+' ? f4.num * (cm / f4.den) : -f4.num * (cm / f4.den),
    )}}{${cm}}\\\\\n`
    calcul += `${
      resultatFinal.estIrreductible
        ? `&=${miseEnEvidence(resultatFinal.texFSD)}`
        : `&=${resultatFinal.texFSD}\\\\
        &=${miseEnEvidence(resultatFinal.simplifie().texFSD)}`
    }
        \\end{aligned}`
    const texteCorr = `$${calcul}$`

    return {
      texte,
      texteCorr,
      resultat: resultatFinal,
    }
  }
  nouvelleVersion() {
    const params = lireFormulaireComplexe(leSuperFormulaire, this.sup)
    const choixDenominateurs = params.repartition(
      'denominateurs',
      this.nbQuestions,
    )
    const choixTypeDeQuestion = params.repartition(
      'typeDeQuestion',
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      let texte = ''
      let texteCorr = ''
      let resultat: FractionEtendue | null = null
      const lettre = lettreDepuisChiffre(i + 1)
      switch (choixTypeDeQuestion[i]) {
        case '1':
          ;({ texte, texteCorr, resultat } =
            this.uneSommeOuDifferenceDeDeuxFractions(
              choixDenominateurs[i],
              lettre,
            ))
          break
        case '2':
          ;({ texte, texteCorr, resultat } =
            this.uneSommeOuDifferenceDUnEntierEtDUneFraction(
              choixDenominateurs[i],
              lettre,
            ))
          break
        case '3':
          ;({ texte, texteCorr, resultat } =
            this.uneSommeOuDifferenceDeTroisFractions(
              choixDenominateurs[i],
              lettre,
            ))
          break
        case '4':
        default:
          ;({ texte, texteCorr, resultat } =
            this.uneSommeOuDifferenceDeQuatreFractions(
              choixDenominateurs[i],
              lettre,
            ))
          break
      }
      if (this.questionJamaisPosee(i, texteCorr)) {
        handleAnswers(this, i, {
          reponse: {
            value: resultat.texFractionSimplifiee,
            options: { fractionSimplifiee: true },
          },
        })
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${lettre} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup2),
        })
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
