import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { simplificationDeFractionAvecEtapes } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteCentre } from '../../lib/format/miseEnPage'
import { pgcd } from '../../lib/outils/primalite'
import Exercice from '../Exercice'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
  obtenirListeFractionsIrreductiblesFaciles,
} from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import FractionEtendue from '../../modules/FractionEtendue'
export const titre = "Montrer qu'un point appartient ou non à une courbe"

/**
 * Répondre à des questions sur les fonctions.
 * 11/ 2021
 * @author Gilles Mora
 */
export const uuid = '36795'

export const refs = {
  'fr-fr': ['2F30-1'],
  'fr-ch': ['11CTFA2C-4', '11LCFA2C-4', '11LSFA2C-4'],
}
export default class PointSurCourbe extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      4,
      '1 : Fonction affine\n2 : Polynôme de degré 2 \n3 : Fonction a/x+b \n4 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des questions',
      3,
      '1 : Abscisse du point A entière\n2 : Abscisse du point A fractionnaire\n3 : Mélange',
    ]

    this.sup = 1
    this.sup2 = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false

    this.nbQuestions = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = ['affine']
        break
      case 2:
        typesDeQuestionsDisponibles = ['polynôme']
        break
      case 3:
        typesDeQuestionsDisponibles = ['a/x+b']
        break
      case 4:
      default:
        typesDeQuestionsDisponibles = ['affine', 'polynôme', 'a/x+b']
        break

      //
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let sousChoix
    if (parseInt(this.sup2) === 1) {
      sousChoix = combinaisonListes([0], this.nbQuestions) // pour choisir aléatoirement des questions dans chaque catégorie
    } else if (parseInt(this.sup2) === 2) {
      sousChoix = combinaisonListes([1], this.nbQuestions)
    } else {
      sousChoix = combinaisonListes([0, 1], this.nbQuestions)
    }
    for (
      let i = 0,
        texte,
        texteCorr,
        x,
        y,
        a,
        b,
        c,
        abs,
        f,
        ord,
        fc,
        f1,
        f2,
        fa,
        fb,
        fractionb,
        enonce,
        correction,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;

    ) {
      // on ne choisit que des nombres compris entre 1 et 20
      x = randint(-9, 9, [0, 1, -1])
      y = randint(-9, 9, [x, 0])

      switch (listeTypeDeQuestions[i]) {
        case 'affine':
          switch (
            sousChoix[i] //
          ) {
            case 0:
              a = randint(-9, 9, [0, 1])
              b = randint(-9, 9, 0)
              abs = randint(-9, 9)
              ord = choice([a * abs + b, a * (abs + 1) + b])
              enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
              ${texteCentre(`$f(x)=${reduireAxPlusB(a, b)}$`)}
              On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
              Le point $A(${abs}; ${ord})$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
              $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
              et <br>
              $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>
               `
              }
              if (ord === a * abs + b) {
                correction += `$${abs}$ est bien dans l'ensemble de définition de $f$ et :<br>
                   $f(x_A)=f(${abs})=${a}\\times ${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(b)}=${ord}=y_A$.<br>
                L'image de $${abs}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
              } else {
                correction += `$${abs}$ est bien dans l'ensemble de définition de $f$ et :<br>
                  $f(x_A)=f(${abs})=${a}\\times ${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(b)}=${a * abs + b}\\neq${ord}$.<br>
                L'image de $${abs}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$.`
              }

              break
            case 1:
            default:
              a = randint(-9, 9, [0, 1])
              b = randint(-9, 9, 0)
              f = choice(obtenirListeFractionsIrreductibles())
              f1 = fraction(a * f.n + b * f.d, f.d) // ordonnée de A
              f2 = fraction(a * f.n + b * f.d + 1, f.d) // une autre ordonnée
              fc = choice([f1, f2])
              fractionb = fraction(b * f1.d, f1.d)
              enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
              ${texteCentre(`$f(x)=${reduireAxPlusB(a, b)}$`)}
              On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
              Le point $A\\left(${f.texFraction}; ${fc.texFractionSimplifiee}\\right)$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
              $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
              et <br>
              $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>
               `
              }
              if (fc === f1) {
                correction += `$${f.texFraction}$ est bien dans l'ensemble de définition de $f$ et  : <br>
                $f(x_A)=f\\left(${f.texFraction}\\right)=$`
                if (a === -1) {
                  correction += `$${rienSi1(a)}${f.texFraction}${ecritureAlgebrique(b)}=
                  ${rienSi1(a)}${f.texFraction}${fractionb.ecritureAlgebrique} =
                  \\dfrac{${rienSi1(a)}${f.n}${ecritureAlgebrique(b * f.d)}}{${f.d}}=
               ${f1.texFraction}${simplificationDeFractionAvecEtapes(a * f.n + b * f.d, f.d)}=y_A$.<br>
               L'image de $${f.texFraction}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
                } else {
                  correction += `$${a}\\times ${f.texFraction}${ecritureAlgebrique(b)}=
                  ${a}\\times${f.texFraction}${fractionb.ecritureAlgebrique} =
                  \\dfrac{${a}\\times${f.n}${ecritureAlgebrique(b * f.d)}}{${f.d}}=
               ${f1.texFraction}${simplificationDeFractionAvecEtapes(a * f.n + b * f.d, f.d)}=y_A$.<br>
               L'image de $${f.texFraction}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
                }
              } else {
                correction += `$${f.texFraction}$ est bien dans l'ensemble de définition de $f$ et  : <br>
              $f(x_A)=f\\left(${f.texFraction}\\right)=$`
                if (a === -1) {
                  correction += `$${rienSi1(a)}${f.texFraction}${ecritureAlgebrique(b)}=
                ${rienSi1(a)}${f.texFraction}${fractionb.ecritureAlgebrique} =
                \\dfrac{${rienSi1(a)}${f.n}${ecritureAlgebrique(b * f.d)}}{${f.d}}=
             ${f.texFraction}${simplificationDeFractionAvecEtapes(a * f.n + b * f.d, f.d)}\\neq${f2.texFractionSimplifiee}$.<br>
             L'image de $${f.texFraction}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$.`
                } else {
                  correction += `$${a}\\times ${f.texFraction}${ecritureAlgebrique(b)}=
                ${a}\\times${f.texFraction}${fractionb.ecritureAlgebrique} =
                \\dfrac{${a}\\times${f.n}${ecritureAlgebrique(b * f1.d)}}{${f1.d}}=
             ${f1.texFraction}${simplificationDeFractionAvecEtapes(a * f.n + b * f.d, f.d)}\\neq${f2.texFractionSimplifiee}$.<br>
             L'image de $${f.texFraction}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$.`
                }
              }
              break
          }
          break
        case 'polynôme':
          switch (
            sousChoix[i] // ax^2+bx+c
          ) {
            case 0:
              a = randint(-9, 9, 0)
              b = randint(-9, 9, 0)
              c = randint(-9, 9)
              abs = randint(-9, 9)
              ord = choice([
                a * abs ** 2 + b * abs + c,
                a * abs ** 2 + b * abs + c - 1,
              ])
              enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
              ${texteCentre(`$f(x)=${reduirePolynomeDegre3(0, a, b, c)}$`)}
              On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
              Le point $A(${abs}\\,;\\, ${ord})$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
              $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
              et <br>
              $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>
               `
              }
              if (ord === a * abs ** 2 + b * abs + c) {
                correction += `$${abs}$ est bien dans l'ensemble de définition de $f$ et :<br> `
                if (a !== 1) {
                  correction += `$f(x_A)=f(${abs})=${a}\\times ${ecritureParentheseSiNegatif(abs)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(c)}
                =${a * abs ** 2}${ecritureAlgebrique(b * abs)}${ecritureAlgebrique(c)}=${ord}=y_A$.<br>
                L'image de $${abs}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
                } else {
                  correction += `$f(x_A)=f(${abs})= ${ecritureParentheseSiNegatif(abs)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(c)}
                =${a * abs ** 2}${ecritureAlgebrique(b * abs)}${ecritureAlgebrique(c)}=${ord}=y_A$.<br>
                L'image de $${abs}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
                }
              } else {
                correction += `$${abs}$ est bien dans l'ensemble de définition de $f$ et :<br> `
                if (a !== 1) {
                  correction += `
                $f(x_A)=f(${abs})=${a}\\times ${ecritureParentheseSiNegatif(abs)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(c)}
                =${a * abs ** 2}${ecritureAlgebrique(b * abs)}${ecritureAlgebrique(c)}=${a * abs ** 2 + b * abs + c}\\neq${ord}$.<br>
                L'image de $${abs}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$`
                } else {
                  correction += ` $f(x_A)=f(${abs})= ${ecritureParentheseSiNegatif(abs)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(abs)}${ecritureAlgebrique(c)}
                =${a * abs ** 2}${ecritureAlgebrique(b * abs)}${ecritureAlgebrique(c)}=${a * abs ** 2 + b * abs + c}\\neq${ord}$.<br>
                L'image de $${abs}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$`
                }
              }
              break

          case 1:
default:
  {
 a = randint(-2, 2, 0)
  b = randint(-5, 5)
  c = randint(-3, 3, 0)
  
  // Sélection de fractions spécifiques avec signe aléatoire
  const fractionBase = choice([
    fraction(1, 3),
    fraction(1, 4),
    fraction(1, 5),
    fraction(2, 3),
    fraction(2, 5),
    fraction(1, 6),
    fraction(4, 3),
    fraction(5, 3),
    fraction(3, 4)
  ])
  f = choice([fractionBase, fractionBase.oppose()])
  
  const trinome = new Trinome(a, b, c)
  const imageA = trinome.image(f) // ordonnée correcte de A
  const imageA2 = new FractionEtendue(imageA.n - 1, imageA.d) // ordonnée incorrecte
  fc = choice([imageA, imageA2])
  
  enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
  ${texteCentre(`$f(x)=${trinome.tex}$`)}
  On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
  Le point $A\\left(${f.texFSD}\\,;\\,${fc.texFractionSimplifiee}\\right)$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
  
  correction = ''
  if (this.correctionDetaillee) {
    correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
  $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
  et <br>
  $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>`
  }
  
  correction += `$${f.texFSD}$ est bien dans l'ensemble de définition de $f$ et :<br>
  $f(x_A)=f\\left(${f.texFSD}\\right)=${trinome.texCalculImage(f)}$`
  
  if (fc.isEqual(imageA)) {
    correction += `$=y_A$.<br>
    L'image de $${f.texFSD}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
  } else {
    correction += `$\\neq${fc.texFractionSimplifiee}$.<br>
    L'image de $${f.texFSD}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$.`
  }
}
  break
          }
          break
        case 'a/x+b':
        default:
          switch (
            sousChoix[i] // sousChoix[i] = randint(0, 5)
          ) {
            case 0:
              a = randint(-9, 9, 0)
              b = randint(-9, 9, 0)
              abs = randint(-9, 9, [0, 1, -1])
              while (pgcd(a, abs) !== 1) {
                a = randint(-9, 9, 0)
              }
              f1 = fraction(a + b * abs, abs) // ordonnée de A
              f2 = fraction(a + b * abs + 1, abs)
              fa = fraction(a, abs)
              fb = fraction(b * abs, abs)
              fc = choice([f1, f2])

              enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}^*$ par :
              ${texteCentre(`$f(x)=\\dfrac{${a}}{x}${ecritureAlgebrique(b)}$`)}
              On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
              Le point $A\\left(${abs}\\,;\\, ${fc.texFractionSimplifiee}\\right)$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
              $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
              et <br>
              $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>`
              }
              correction += `$${abs}$ est bien dans l'ensemble de définition de $f$ et : <br>
                              $f(x_A)=f(${abs})=\\dfrac{${a}}{${abs}}${ecritureAlgebrique(b)}
              =${fa.texFractionSimplifiee}${ecritureAlgebrique(b)}
              =${fa.texFractionSimplifiee}${fb.ecritureAlgebrique}=${f1.texFractionSimplifiee}
              $`
              if (fc === f1) {
                correction += `$=y_A$.<br>
                L'image de $${abs}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
              } else {
                correction += `$\\neq${fc.texFractionSimplifiee}$.<br>
                               L'image de $${abs}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$`
              }

              break

            case 1:
            default:
              a = randint(-9, 9, 0)
              b = randint(-9, 9, 0)
              abs = choice(obtenirListeFractionsIrreductiblesFaciles())

              f1 = fraction(a * abs.d + b * abs.n, abs.n) // ordonnée de A
              f2 = fraction(a * abs.d + b * abs.n - 1, abs.n)
              fa = fraction(a * abs.d, abs.n)
              fb = fraction(b * abs.n, abs.n)
              fc = choice([f1, f2])

              enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}^*$ par :
              ${texteCentre(`$f(x)=\\dfrac{${a}}{x}${ecritureAlgebrique(b)}$`)}
              On note $\\mathscr{C}_f$ la courbe représentative de la fonction $f$ dans un repère.<br>
              Le point $A\\left(${abs.texFractionSimplifiee}\\,;\\, ${fc.texFractionSimplifiee}\\right)$ appartient-il à $\\mathscr{C}_f$ ? Justifier.`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Un point de coordonnées $(x;y)$ est sur la courbe représentative d'une fonction $f$ si et seulement si :<br>
              $\\bullet$  $x$ appartient à l'ensemble de définition de $f$ <br>
              et <br>
              $\\bullet$ l'ordonnée $y$ du point est l'image de son abscisse, c'est à dire $y=f(x)$.<br>`
              }
              correction += `$${abs.texFractionSimplifiee}$ est bien dans l'ensemble de définition de $f$ et :<br>
              $f(x_A)=f\\left(${abs.texFractionSimplifiee}\\right)
              =\\dfrac{${a}}{${abs.texFractionSimplifiee}}${ecritureAlgebrique(b)}
              =${a}\\times \\dfrac{${abs.d}}{${abs.n}}${ecritureAlgebrique(b)}=
              ${fa.texFractionSimplifiee}${ecritureAlgebrique(b)}
              =${f1.texFractionSimplifiee}
              $`
              if (fc === f1) {
                correction += `$=y_A$.<br>
                L'image de $${abs.texFractionSimplifiee}$ est bien l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("est sur")} $\\mathscr{C}_f$.`
              } else {
                correction += `$\\neq${fc.texFractionSimplifiee}$.<br>
                               L'image de $${abs.texFractionSimplifiee}$ n'est pas l'ordonnée du point $A$, donc le point $A$ ${texteEnCouleurEtGras("n'est pas sur")} $\\mathscr{C}_f$`
              }
              break
          }
          break
      }

      texte = enonce
      texteCorr = correction

      if (
        this.questionJamaisPosee(i, listeTypeDeQuestions[i], x, y, sousChoix[i])
      ) {
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
