import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
  reduireAxPlusByPlusC,
} from '../../lib/outils/ecritures'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = "Étudier la réalité d'un quotient de complexes"
export const interactifReady = true
export const dateDePublication = '01/09/2026'
export const dateDeModifImportante = '31/10/2026'

export const uuid = 'df2d2'

export const refs = {
  'fr-fr': ['TEC1-51'],
  'fr-ch': [],
}

/**
 * Exprimer le conjugué d'un quotient dépendant de z, puis déterminer les
 * valeurs de z pour lesquelles ce quotient est réel.
 *
 * @author Stéphane Guyon
 */
export default class RealiteQuotientComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.nbQuestionsModifiable = true
    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeConstantes = randint(1, 3)
      const premiereConstante = randint(-5, 5, 0)
      const secondeConstante = randint(
        -5,
        5,
        typeConstantes === 3 ? [0, premiereConstante] : 0,
      )
      const a = typeConstantes === 2 ? premiereConstante : 0
      const b = typeConstantes === 2 ? 0 : premiereConstante
      const c = typeConstantes === 1 ? secondeConstante : 0
      const d = typeConstantes === 1 ? 0 : secondeConstante
      const constanteNumerateur = new Complexe(a, b)
      const constanteDenominateur = new Complexe(c, d)

      const conjugueNumerateur = constanteNumerateur.conjugue()
      const conjugueDenominateur = constanteDenominateur.conjugue()
      const valeurInterdite = constanteDenominateur.negate()
      const coefficientXBrut = b - d
      const coefficientYBrut = c - a
      const constanteEquationBrute = b * c - a * d
      const diviseurCommun = pgcd(
        Math.abs(coefficientXBrut),
        Math.abs(coefficientYBrut),
        Math.abs(constanteEquationBrute),
      )
      const coefficientXApresPgcd = coefficientXBrut / diviseurCommun
      const coefficientYApresPgcd = coefficientYBrut / diviseurCommun
      const constanteApresPgcd = constanteEquationBrute / diviseurCommun
      const premierCoefficientNonNul = [
        coefficientXApresPgcd,
        coefficientYApresPgcd,
        constanteApresPgcd,
      ].find((coefficient) => coefficient !== 0)!
      const changementDeSigne = premierCoefficientNonNul < 0
      const coefficientX = changementDeSigne
        ? -coefficientXApresPgcd
        : coefficientXApresPgcd
      const coefficientY = changementDeSigne
        ? -coefficientYApresPgcd
        : coefficientYApresPgcd
      const constanteEquation = changementDeSigne
        ? -constanteApresPgcd
        : constanteApresPgcd
      const equationBrute = reduireAxPlusByPlusC(
        coefficientXBrut,
        coefficientYBrut,
        constanteEquationBrute,
      )
      const equationApresPgcd = reduireAxPlusByPlusC(
        coefficientXApresPgcd,
        coefficientYApresPgcd,
        constanteApresPgcd,
      )
      const equationDroite = reduireAxPlusByPlusC(
        coefficientX,
        coefficientY,
        constanteEquation,
      )
      const explicationSimplification = `${
        diviseurCommun > 1
          ? `Le PGCD des coefficients de cette expression vaut $${diviseurCommun}$. En divisant l’équation $${equationBrute}=0$ par $${diviseurCommun}$, on obtient l’équation équivalente $${equationApresPgcd}=0$.<br>`
          : ''
      }${
        changementDeSigne
          ? `${diviseurCommun > 1 ? 'En multipliant cette dernière équation' : `En multipliant l’équation $${equationBrute}=0$`} par $-1$, on retient l’écriture $${equationDroite}=0$.<br>`
          : ''
      }`
      const quotient = `\\dfrac{z${constanteNumerateur.tex(true)}}{z${constanteDenominateur.tex(true)}}`
      const quotientConjugue = `\\dfrac{\\overline{z}${conjugueNumerateur.tex(true)}}{\\overline{z}${conjugueDenominateur.tex(true)}}`
      let calculConditionReelle: string

      if (typeConstantes === 1) {
        calculConditionReelle = `$\\begin{aligned}
        &\\left(z${constanteNumerateur.tex(true)}\\right)\\left(\\overline z${conjugueDenominateur.tex(true)}\\right)
        =\\left(\\overline z${conjugueNumerateur.tex(true)}\\right)\\left(z${constanteDenominateur.tex(true)}\\right)\\\\
        \\iff{}&z\\overline z${ecritureAlgebriqueSauf1(secondeConstante)}z${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante * secondeConstante)}i
        =z\\overline z${ecritureAlgebriqueSauf1(secondeConstante)}\\overline z${ecritureAlgebriqueSauf1(-premiereConstante)}iz${ecritureAlgebriqueSauf1(-premiereConstante * secondeConstante)}i\\\\
        \\iff{}&${rienSi1(secondeConstante)}z${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante * secondeConstante)}i
        =${rienSi1(secondeConstante)}\\overline z${ecritureAlgebriqueSauf1(-premiereConstante)}iz${ecritureAlgebriqueSauf1(-premiereConstante * secondeConstante)}i\\\\
        \\iff{}&${rienSi1(secondeConstante)}z${ecritureAlgebriqueSauf1(-secondeConstante)}\\overline z
        ${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante)}iz
        ${ecritureAlgebriqueSauf1(2 * premiereConstante * secondeConstante)}i=0\\\\
        \\iff{}&${rienSi1(secondeConstante)}(z-\\overline z)${ecritureAlgebriqueSauf1(premiereConstante)}i(z+\\overline z)${ecritureAlgebriqueSauf1(2 * premiereConstante * secondeConstante)}i=0.
        \\end{aligned}$<br>
        Or, en écrivant $z=x+\\mathrm{i}y$, avec $x\\in \\mathbb{R}$ et $y\\in \\mathbb{R}$, on a :<br>
        $z+\\overline z=2\\mathcal{Re}(z)=2x$ et $z-\\overline z=2i\\mathcal{Im}(z)=2iy$.<br> Ainsi, on obtient :<br>
        $\\begin{aligned}
        &${rienSi1(secondeConstante)}(2iy)${ecritureAlgebriqueSauf1(premiereConstante)}i(2x)${ecritureAlgebriqueSauf1(2 * premiereConstante * secondeConstante)}i=0\\\\
        \\iff{}&2i\\left(${equationBrute}\\right)=0\\\\
        \\iff{}&${equationBrute}=0.
        \\end{aligned}$<br>`
      } else if (typeConstantes === 2) {
        calculConditionReelle = `$\\begin{aligned}
        &\\left(z${constanteNumerateur.tex(true)}\\right)\\left(\\overline z${conjugueDenominateur.tex(true)}\\right)
        =\\left(\\overline z${conjugueNumerateur.tex(true)}\\right)\\left(z${constanteDenominateur.tex(true)}\\right)\\\\
        \\iff{}&z\\overline z${ecritureAlgebriqueSauf1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(premiereConstante)}\\overline z${ecritureAlgebriqueSauf1(-premiereConstante * secondeConstante)}i\\\\
        &\\qquad=z\\overline z${ecritureAlgebriqueSauf1(secondeConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante)}z${ecritureAlgebriqueSauf1(premiereConstante * secondeConstante)}i\\\\
        \\iff{}&${rienSi1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(premiereConstante)}\\overline z${ecritureAlgebriqueSauf1(-premiereConstante * secondeConstante)}i
        =${rienSi1(secondeConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante)}z${ecritureAlgebriqueSauf1(premiereConstante * secondeConstante)}i\\\\
        \\iff{}&${rienSi1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(-secondeConstante)}i\\overline z
        ${ecritureAlgebriqueSauf1(premiereConstante)}\\overline z${ecritureAlgebriqueSauf1(-premiereConstante)}z
        ${ecritureAlgebriqueSauf1(-2 * premiereConstante * secondeConstante)}i=0\\\\
        \\iff{}&${rienSi1(-secondeConstante)}i(z+\\overline z)${ecritureAlgebriqueSauf1(-premiereConstante)}(z-\\overline z)${ecritureAlgebriqueSauf1(-2 * premiereConstante * secondeConstante)}i=0.
        \\end{aligned}$<br>
        Or $z+\\overline z=2\\mathcal{Re}(z)$ et $z-\\overline z=2i\\mathcal{Im}(z)$.<br> Ainsi, en écrivant $z=x+\\mathrm{i}y$, on obtient :<br>
        $\\begin{aligned}
        &${rienSi1(-secondeConstante)}i(2x)${ecritureAlgebriqueSauf1(-premiereConstante)}(2iy)${ecritureAlgebriqueSauf1(-2 * premiereConstante * secondeConstante)}i=0\\\\
        \\iff{}&2i\\left(${equationBrute}\\right)=0\\\\
        \\iff{}&${equationBrute}=0.
        \\end{aligned}$<br>`
      } else {
        calculConditionReelle = `$\\begin{aligned}
        &\\left(z${constanteNumerateur.tex(true)}\\right)\\left(\\overline z${conjugueDenominateur.tex(true)}\\right)
        =\\left(\\overline z${conjugueNumerateur.tex(true)}\\right)\\left(z${constanteDenominateur.tex(true)}\\right)\\\\
        \\iff{}&z\\overline z${ecritureAlgebriqueSauf1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z${ecritureAlgebrique(premiereConstante * secondeConstante)}\\\\
        &\\qquad=z\\overline z${ecritureAlgebriqueSauf1(secondeConstante)}i\\overline z${ecritureAlgebriqueSauf1(-premiereConstante)}iz${ecritureAlgebrique(premiereConstante * secondeConstante)}\\\\
        \\iff{}&${rienSi1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z
        =${rienSi1(secondeConstante)}i\\overline z${ecritureAlgebriqueSauf1(-premiereConstante)}iz\\\\
        \\iff{}&${rienSi1(-secondeConstante)}iz${ecritureAlgebriqueSauf1(-secondeConstante)}i\\overline z
        ${ecritureAlgebriqueSauf1(premiereConstante)}i\\overline z${ecritureAlgebriqueSauf1(premiereConstante)}iz=0\\\\
        \\iff{}&${rienSi1(premiereConstante - secondeConstante)}i(z+\\overline z)=0.
        \\end{aligned}$<br>
        Or $z+\\overline z=2\\mathcal{Re}(z)$.<br> Ainsi, en écrivant $z=x+\\mathrm{i}y$, on obtient :<br>
        $\\begin{aligned}
        &${rienSi1(premiereConstante - secondeConstante)}i(2x)=0\\\\
        \\iff{}&2i\\left(${equationBrute}\\right)=0\\\\
        \\iff{}&${equationBrute}=0.
        \\end{aligned}$<br>`
      }
      let formatReponsePartie2: string
      let reponsePartie2: string
      let conclusionContrainte: string

      if (coefficientY === 0) {
        const abscisse = new FractionEtendue(
          -constanteEquation,
          coefficientX,
        ).simplifie()
        const abscisseTex = abscisse.texFractionSimplifiee
        const formeComplexe = abscisseTex === '0' ? 'iy' : `${abscisseTex}+iy`
        formatReponsePartie2 =
          abscisseTex === '0'
            ? `x&=%{champ2},\\quad z=iy,\\quad y\\in\\mathbb{R}`
            : `z&=%{champ2}+iy,\\quad y\\in\\mathbb{R}`
        reponsePartie2 = abscisseTex
        conclusionContrainte = `$${equationDroite}=0\\iff x=${abscisseTex}$.<br>
      Ainsi, les solutions sont les nombres complexes de la forme $z=${formeComplexe}$, avec $y\\in\\mathbb{R}$, à l’exception de la valeur interdite.<br>
      $${miseEnEvidence(`S=\\left\\{${formeComplexe}\\mid y\\in\\mathbb{R}\\right\\}\\setminus\\left\\{${valeurInterdite.tex()}\\right\\}`)}$.`
      } else if (coefficientX === 0) {
        const ordonnee = new FractionEtendue(
          -constanteEquation,
          coefficientY,
        ).simplifie()
        const ordonneeTex = ordonnee.texFractionSimplifiee
        const formeComplexe =
          ordonneeTex === '0' ? 'x' : `x+i\\left(${ordonneeTex}\\right)`
        formatReponsePartie2 =
          ordonneeTex === '0'
            ? `y&=%{champ2},\\quad z=x,\\quad x\\in\\mathbb{R}`
            : `z&=x+i\\left(%{champ2}\\right),\\quad x\\in\\mathbb{R}`
        reponsePartie2 = ordonneeTex
        conclusionContrainte = `$${equationDroite}=0\\iff y=${ordonneeTex}$.<br>
      Ainsi, les solutions sont les nombres complexes de la forme $z=${formeComplexe}$, avec $x\\in\\mathbb{R}$, à l’exception de la valeur interdite.<br>
      $${miseEnEvidence(`S=\\left\\{${formeComplexe}\\mid x\\in\\mathbb{R}\\right\\}\\setminus\\left\\{${valeurInterdite.tex()}\\right\\}`)}$.`
      } else {
        formatReponsePartie2 = `\\text{Équation cartésienne : }%{champ2}&=0`
        reponsePartie2 = equationDroite
        conclusionContrainte = `$${miseEnEvidence(`S=\\left\\{x+iy\\in\\mathbb{C}\\mid ${equationDroite}=0\\right\\}\\setminus\\left\\{${valeurInterdite.tex()}\\right\\}`)}$.`
      }

      const questions = createList({
        items: [
          'Exprimer $\\overline{Z}$ en fonction de $\\overline{z}$.',
          'Déterminer l’ensemble des nombres complexes $z$ tels que $Z\\in\\mathbb{R}$.',
        ],
        style: 'nombres',
      })
      let texte = `Soit $z\\in\\mathbb{C}$ tel que $z\\neq ${valeurInterdite.tex()}$.<br>
    On pose alors $Z=${quotient}$.<br>
    ${questions}`

      if (this.interactif) {
        texte += `<br>${remplisLesBlancs(
          this,
          i,
          `\\begin{aligned}
        \\overline{Z}&=%{champ1}\\\\
        ${formatReponsePartie2},\\quad z\\neq %{champ3}.
        \\end{aligned}`,
          KeyboardType.clavierEntierementPersonnalisable,
          '\\ldots',
          {
            dataKeys: [
              ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '+', '-'],
              ['x', 'y', 'z', '\\mathrm{i}', '\\overline{z}', '\\frac{#@}{#0}'],
            ],
          },
        )}`
      }

      const correctionPartie1 = `Pour tous nombres complexes $u$ et $v$, avec $v\\neq 0$, on a :
    $\\overline{\\left(\\dfrac{u}{v}\\right)}=\\dfrac{\\overline{u}}{\\overline{v}}$.<br>
    De plus, le conjugué d’une somme est la somme des conjugués. Ainsi :<br>
    $\\begin{aligned}
    \\overline{Z}
    &=\\overline{\\left(\\dfrac{z${constanteNumerateur.tex(true)}}{z${constanteDenominateur.tex(true)}}\\right)}\\\\
    &=\\dfrac{\\overline{z${constanteNumerateur.tex(true)}}}{\\overline{z${constanteDenominateur.tex(true)}}}\\\\
    &=\\dfrac{\\overline z+\\overline{${constanteNumerateur.tex()}}}{\\overline z+\\overline{${constanteDenominateur.tex()}}}\\\\
    &=${miseEnEvidence(quotientConjugue)}.
    \\end{aligned}$`

      const correctionPartie2 = `Un nombre complexe est réel si et seulement s’il est égal à son conjugué. Par conséquent :<br>
    $\\begin{aligned}
    Z\\in\\mathbb{R}
    &\\iff Z=\\overline Z\\\\
    &\\iff \\dfrac{z${constanteNumerateur.tex(true)}}{z${constanteDenominateur.tex(true)}}
    =\\dfrac{\\overline z${conjugueNumerateur.tex(true)}}{\\overline z${conjugueDenominateur.tex(true)}}.
    \\end{aligned}$<br>
    Les deux dénominateurs étant non nuls, cette égalité équivaut à l’égalité des produits en croix :<br>
    ${calculConditionReelle}
    ${explicationSimplification}Par conséquent, on a $Z\\in\\mathbb{R}$ si et seulement si $${equationDroite}=0$, avec $z\\neq ${valeurInterdite.tex()}$.<br>
    ${conclusionContrainte}<br>
    ${texteEnCouleurEtGras('Remarque :', bleuMathalea)} <br>il était possible de résoudre cette question en posant dès le départ $z=x+\\mathrm{i}y$, avec $x\\in \\mathbb{R}$ et $y\\in \\mathbb{R}$.`

      const texteCorr = createList({
        items: [correctionPartie1, correctionPartie2],
        style: 'nombres',
      })

      handleAnswers(
        this,
        i,
        {
          champ1: { value: quotientConjugue },
          champ2: { value: reponsePartie2 },
          champ3: { value: valeurInterdite.tex() },
        },
        { formatInteractif: 'fill-in-the-blank' },
      )

      if (
        this.questionJamaisPosee(
          i,
          typeConstantes,
          premiereConstante,
          secondeConstante,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
