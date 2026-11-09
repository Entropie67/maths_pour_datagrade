import { texteCentre } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  fraction,
  obtenirListeFractionsIrreductiblesFaciles,
} from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer des images ou des antécédents'
export const interactifReady = true

export const dateDePublication = '23/11/2025'

/**
 * Répondre à des questions sur les fonctions.
 * @author Gilles Mora
 */

export const uuid = '397d2'

export const refs = {
  'fr-fr': ['2F13-5', '1Tec-F12'],
  'fr-ch': ['11LCFA2F-5', '11LSFA2F-5'],
}

// ============ FONCTIONS HELPERS POUR PHRASES RÉPÉTÉES ============

/**
 * Génère l'énoncé "Soit f la fonction définie sur ... Calculer l'image de ..."
 */
function enonceCalculImage(
  nom: string,
  ensemble: string,
  expression: string,
  valeur: string | number,
): string {
  return `Soit $${nom}$ la fonction définie sur $${ensemble}$ par :
              ${texteCentre(`$${nom}(x)=${expression}$`)}
              Calculer l'image de $${valeur}$ par ${typeof valeur === 'number' ? `la fonction $${nom}$` : `$${nom}$`}.`
}

/**
 * Génère l'énoncé "Soit f la fonction définie sur ... Déterminer les éventuels antécédents de ..."
 */
function enonceCalculAntecedent(
  nom: string,
  ensemble: string,
  expression: string,
  image: string | number,
): string {
  return `Soit $${nom}$ la fonction définie sur $${ensemble}$ par :
                ${texteCentre(`$${nom}(x)=${expression}$`)}
                Déterminer les éventuels antécédents de $${image}$ par la fonction $${nom}$.`
}

/**
 * Génère la phrase "On calcule l'image de ... en remplaçant x par ... dans l'expression de ..."
 */
function phraseCorrectionImage(nom: string, valeur: string | number): string {
  return `On calcule l'image de $${valeur}$ en remplaçant $x$ par $${valeur}$ dans l'expression de $${nom}$ : <br>`
}

/**
 * Génère la phrase "On cherche s'il existe x ∈ ... tel que f(x)=..."
 */
function phraseCorrectionAntecedent(
  nom: string,
  ensemble: string,
  image: string | number,
): string {
  return `On cherche s'il existe $x\\in ${ensemble}$ tel que $${nom}(x)=${image}$.<br>`
}

/**
 * Génère la conclusion "L'antécédent de ... est ..."
 */
function conclusionAntecedent(
  image: string | number,
  antecedent: string,
): string {
  return `L'antécédent de $${image}$ est $${miseEnEvidence(antecedent)}$.`
}

export default class CalculImageAntecedents extends Exercice {
  constructor() {
    super()
    this.spacing = 2
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Choix des fonctions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Fonction affine',
        '2 : Polynôme de degré 2',
        '3 : Fonction $\\dfrac{a}{x}+b$',
        '4: Fonction $\\dfrac{a}{x+b}+c$',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Choix des valeurs',
      [
        'Nombres séparés par des tirets  :',
        '1 : Valeurs entières',
        '2 : Valeurs fractionnaires',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3Texte = [
      'Type de calcul',
      [
        'Nombres séparés par des tirets  :',
        '1 : Calculer une image',
        '2 : Calculer un antécédent',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = 5
    this.sup2 = 3
    this.sup3 = 3

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    // Gestion du premier paramètre avec gestionnaireFormulaireTexte
    const choixType = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const typesDeQuestionsDisponibles: string[] = []
    for (const choix of choixType) {
      switch (choix) {
        case 1:
          typesDeQuestionsDisponibles.push('affine')
          break
        case 2:
          typesDeQuestionsDisponibles.push('polynôme')
          break
        case 3:
          typesDeQuestionsDisponibles.push('a/x+b')
          break
        case 4:
          typesDeQuestionsDisponibles.push('a/(x+b)+c')
          break
      }
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Gestion du deuxième paramètre avec gestionnaireFormulaireTexte
    const choixValeurs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const sousChoix = choixValeurs.map((v) => v - 1) // Convertir 1,2 en 0,1

    // Gestion du troisième paramètre avec gestionnaireFormulaireTexte
    const choixCalcul = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const typeCalcul = choixCalcul.map((v) => v === 1) // 1 = true (image), 2 = false (antécédent)

    const nomF = ['f', 'g', 'h', 'u', 'v', 'w']

    for (
      let i = 0,
        texte,
        texteCorr,
        nom,
        x,
        y,
        a: number,
        b: number,
        c: number,
        valeur,
        f,
        image,
        f1,
        fa,
        fb,
        fractionA,
        fractionB,
        fractionb,
        fractionb2,
        fractionc,
        fracSol,
        enonce,
        correction,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      x = randint(-9, 9, [0, 1, -1])
      y = randint(-9, 9, [x, 0])

      switch (listeTypeDeQuestions[i]) {
        case 'affine':
          switch (sousChoix[i]) {
            case 0:
              a = randint(-5, 12, [0, 1])
              b = randint(-10, 10, 0)
              valeur = randint(-12, 12, 0)
              nom = choice(nomF)

              if (typeCalcul[i]) {
                // Calcul d'une image
                image = a * valeur + b
                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}',
                  reduireAxPlusB(a, b),
                  valeur,
                )
                correction =
                  phraseCorrectionImage(nom, valeur) +
                  `$\\begin {aligned}
                ${nom}(${valeur})&=${a}\\times ${ecritureParentheseSiNegatif(valeur)}${ecritureAlgebrique(b)}\\\\
              &=${a * valeur}${ecritureAlgebrique(b)}\\\\
              &=${miseEnEvidence(image)}
              \\end{aligned}$`
                handleAnswers(this, i, { reponse: { value: image } })
              } else {
                // Calcul d'un antécédent
                image = randint(-10, 10, 0)
                valeur = new FractionEtendue(image - b, a)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}',
                  reduireAxPlusB(a, b),
                  image,
                )

                correction = `On cherche $x$ tel que $${nom}(x)=${image}$.<br>
                $\\begin{aligned}
                ${reduireAxPlusB(a, b)}&=${image}\\\\
                ${reduireAxPlusB(a, b)}${miseEnEvidence(ecritureAlgebrique(-b))}&=${image}${miseEnEvidence(ecritureAlgebrique(-b))}\\\\
                ${rienSi1(a)}x&=${image - b}\\\\
                x&=${valeur.texFractionSimplifiee}
                \\end{aligned}$<br>
                ${conclusionAntecedent(image, valeur.texFractionSimplifiee)}`

                handleAnswers(this, i, { reponse: { value: valeur } })
              }
              break

            case 1:
            default:
              a = randint(-5, 10, [0, 1])

              f = choice(obtenirListeFractionsIrreductiblesFaciles())
              b = randint(-9, 9, 0)
              nom = choice(nomF)

              if (typeCalcul[i]) {
                // Calcul d'une image
                fractionA = new FractionEtendue(a * f.n, f.d)
                fractionB = new FractionEtendue(b * f.d, f.d)
                f1 = new FractionEtendue(a * f.n + b * f.d, f.d)

                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}',
                  reduireAxPlusB(a, b),
                  f.texFraction,
                )

                correction =
                  phraseCorrectionImage(nom, f.texFraction) +
                  `$\\begin {aligned}
                ${nom}\\left(${f.texFraction}\\right)&=${a}\\times ${f.texFraction}${ecritureAlgebrique(b)}\\\\
              &=${fractionA.texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\
             ${Number.isInteger((a * f.n) / f.d) ? ` ` : `&=${fractionA.texFractionSimplifiee} ${ecritureAlgebrique(fractionB)}\\\\`}
              &=${miseEnEvidence(f1.texFractionSimplifiee)}
              \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent
                image = choice(obtenirListeFractionsIrreductiblesFaciles())
                f1 = fraction(image.n - b * image.d, a * image.d)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}',
                  reduireAxPlusB(a, b),
                  image.texFraction,
                )

                correction = `On cherche $x$ tel que $${nom}(x)=${image.texFraction}$.<br>
              $\\begin{aligned}
              ${reduireAxPlusB(a, b)}&=${image.texFraction}\\\\
              ${reduireAxPlusB(a, b)}${miseEnEvidence(ecritureAlgebrique(-b))}&=${image.texFraction}${miseEnEvidence(ecritureAlgebrique(-b))}\\\\
              ${rienSi1(a)}x&=${fraction(image.n - b * image.d, image.d).texFraction}\\\\
              x&=${f1.texFraction}${f1.texSimplificationAvecEtapes()}
              \\end{aligned}$<br>
              ${conclusionAntecedent(image.texFraction, f1.texFractionSimplifiee)}`

                handleAnswers(this, i, { reponse: { value: f1 } })
              }
              break
          }
          break

        case 'polynôme':
          switch (sousChoix[i]) {
            case 0:
              a = randint(-3, 5, [0, 1, -1])
              b = randint(-5, 5, 0)
              c = randint(-10, 10, 0)
              valeur = randint(-5, 5, [0, 1, -1])
              nom = choice(nomF)

              if (typeCalcul[i]) {
                // Calcul d'une image
                image = a * valeur ** 2 + b * valeur + c

                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}',
                  reduirePolynomeDegre3(0, a, b, c),
                  valeur,
                )

                correction =
                  phraseCorrectionImage(nom, valeur) +
                  `$\\begin {aligned}
                ${nom}(${valeur})&=${a}\\times ${ecritureParentheseSiNegatif(valeur)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(valeur)}${ecritureAlgebrique(c)}\\\\
                &=${a}\\times ${valeur ** 2}${ecritureAlgebrique(b * valeur)}${ecritureAlgebrique(c)}\\\\
                &=${a * valeur ** 2}${ecritureAlgebrique(b * valeur)}${ecritureAlgebrique(c)}\\\\
                &=${miseEnEvidence(image)}
                \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: image } })
              } else {
                // Calcul d'un antécédent pour ax^2+c
                a = randint(-5, 10, 0)
                c = randint(-5, 10, 0)
                valeur = randint(-5, 16)
                image = a * valeur + c
                nom = choice(nomF)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}',
                  reduirePolynomeDegre3(0, a, 0, c),
                  image,
                )
                if (this.interactif) {
                  enonce += `<br>S'il y a plusieurs antécédents, les écrire séparés par un point-virgule.<br>
                S'il n'y a pas d'antécédent, écrire $\\emptyset$.`
                }

                correction =
                  phraseCorrectionAntecedent(nom, '\\mathbb{R}', image) +
                  `On résout cette équation en isolant le carré.<br>
                  $\\begin{aligned}
                 ${reduirePolynomeDegre3(0, a, 0, c)}&=${image}\\\\
                 ${rienSi1(a)}x^2&=${image - c}\\\\
                 x^2&=\\dfrac{${image - c}}{${a}}\\\\
                 x^2&=${valeur}
                 \\end{aligned}$ <br>`

                if (valeur === 0) {
                  correction += ` Cette équation n'a qu'une seule solution : $0$.<br>
                  ${conclusionAntecedent(image, '0')} `
                  handleAnswers(this, i, { reponse: { value: 0 } })
                } else if (valeur < 0) {
                  correction += ` Cette équation n'a pas de solution car un carré est toujours positif.<br>
                  Il n'existe pas d'antécédent de $${image}$ par la fonction $${nom}$ : l'ensemble des antécédents est $${miseEnEvidence('\\emptyset')}$. `
                  handleAnswers(this, i, {
                    reponse: {
                      value: '\\emptyset',
                      options: { ensembleDeNombres: true },
                    },
                  })
                } else {
                  if (
                    valeur === 1 ||
                    valeur === 4 ||
                    valeur === 9 ||
                    valeur === 16
                  ) {
                    correction += ` Cette équation a deux solutions : $-\\sqrt{${valeur}}=-${Math.sqrt(valeur)}$ et $\\sqrt{${valeur}}=${Math.sqrt(valeur)}$.<br>
                    Les antécédents de $${image}$ sont : $${miseEnEvidence(`-${Math.sqrt(valeur)};${Math.sqrt(valeur)}`)}$. `
                    handleAnswers(this, i, {
                      reponse: {
                        value: `-${Math.sqrt(valeur)};${Math.sqrt(valeur)}`,
                        options: { suiteDeNombres: true },
                      },
                    })
                  } else {
                    correction += ` Cette équation a deux solutions : $-\\sqrt{${valeur}}$ et $\\sqrt{${valeur}}$.<br>
                    Les antécédents de $${image}$ sont : $${miseEnEvidence(`-\\sqrt{${valeur}};\\sqrt{${valeur}}`)}$. `
                    handleAnswers(this, i, {
                      reponse: {
                        value: `-\\sqrt{${valeur}};\\sqrt{${valeur}}`,
                        options: { suiteDeNombres: true },
                      },
                    })
                  }
                }
              }
              break

            case 1:
            default:
              if (typeCalcul[i]) {
                // Calcul d'une image
                a = randint(-2, 2, 0)
                b = randint(-2, 3, 0)
                c = randint(-3, 3, 0)
                f = choice(obtenirListeFractionsIrreductiblesFaciles())
                nom = choice(nomF)
                fractionA = new FractionEtendue(a * f.n ** 2, f.d ** 2)
                fractionb = new FractionEtendue(b * f.n, f.d)
                fractionb2 = new FractionEtendue(b * f.n * f.d, f.d ** 2)
                fractionc = new FractionEtendue(c * f.d ** 2, f.d ** 2)
                f1 = new FractionEtendue(
                  a * f.n ** 2 + b * f.n * f.d + c * f.d ** 2,
                  f.d ** 2,
                )

                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}',
                  reduirePolynomeDegre3(0, a, b, c),
                  f.texFraction,
                )

                correction = `On calcule l'image de $${f.texFraction}$ en remplaçant $x$ par $${f.texFraction}$ dans l'expression de $${nom}$ : <br>

                  $\\begin{aligned}
                  ${nom}\\left(${f.texFraction}\\right)&=${a === 1 ? '' : a === -1 ? '-' : `${a}\\times`} \\left(${f.texFraction}\\right)^2${b === 1 ? '+' : b === -1 ? '-' : `${b}\\times`}${f.texFraction}${ecritureAlgebrique(c)}\\\\
                  &=${a === 1 ? '' : a === -1 ? '-' : `${a}\\times`} \\dfrac{${f.n ** 2}}{${f.d ** 2}}${fractionb.ecritureAlgebrique}${ecritureAlgebrique(c)}\\\\
                  &=${new FractionEtendue(a * f.n ** 2, f.d ** 2).texFractionSimplifiee}${fractionb2.ecritureAlgebrique}${fractionc.ecritureAlgebrique}\\\\
                  &=${miseEnEvidence(f1.texFractionSimplifiee)}
                  \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent pour ax^2+c avec fraction
                a = randint(-2, 2, 0)
                b = 0
                c = randint(-3, 3, 0)
                f = choice(obtenirListeFractionsIrreductiblesFaciles())
                nom = choice(nomF)
                fracSol = new FractionEtendue(f.n - c * f.d, a * f.d)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}',
                  reduirePolynomeDegre3(0, a, 0, c),
                  f.texFraction,
                )
                if (this.interactif) {
                  enonce += `<br>S'il y a plusieurs antécédents, les écrire séparés par un point-virgule.<br>
                S'il n'y a pas d'antécédent, écrire $\\emptyset$.`
                }

                correction =
                  phraseCorrectionAntecedent(
                    nom,
                    '\\mathbb{R}',
                    f.texFraction,
                  ) +
                  `On résout cette équation en isolant le carré.<br>
                  $\\begin{aligned}
                 ${reduirePolynomeDegre3(0, a, 0, c)}&=${f.texFraction}\\\\
                 ${rienSi1(a)}x^2&=${f.texFraction} ${ecritureAlgebrique(-c)}\\\\
                 ${rienSi1(a)}x^2&=${new FractionEtendue(f.n - c * f.d, f.d).texFractionSimplifiee}\\\\
                 ${a === 1 ? '' : `x^2&=${fracSol.texFractionSimplifiee}`}
                 \\end{aligned}$ <br>`

                if (new FractionEtendue(f.n - c * f.d, a * f.d).signe === -1) {
                  correction += ` Cette équation n'a pas de solution car un carré est toujours positif.<br>
                  Il n'existe pas d'antécédent de $${f.texFraction}$ par la fonction $${nom}$ : l'ensemble des antécédents est $${miseEnEvidence('\\emptyset')}$. `
                  handleAnswers(this, i, {
                    reponse: {
                      value: '\\emptyset',
                      options: { ensembleDeNombres: true },
                    },
                  })
                } else {
                  correction += ` Cette équation a deux solutions : $-\\sqrt{${fracSol.texFractionSimplifiee}}$ et $\\sqrt{${fracSol.texFractionSimplifiee}}$.<br>
                    Les antécédents de $${f.texFraction}$ sont : $${miseEnEvidence(`-\\sqrt{${fracSol.texFractionSimplifiee}};\\sqrt{${fracSol.texFractionSimplifiee}}`)}$. `
                  handleAnswers(this, i, {
                    reponse: {
                      value: `-\\sqrt{${fracSol.texFraction}};\\sqrt{${fracSol.texFraction}}`,
                      options: { suiteDeNombres: true },
                    },
                  })
                }
              }
              break
          }
          break

        case 'a/x+b':
          switch (sousChoix[i]) {
            case 0:
              if (typeCalcul[i]) {
                // Calcul d'une image
                a = randint(-3, 9, 0)
                b = randint(-3, 9, 0)
                valeur = randint(-9, 9, [0, 1, -1])
                nom = choice(nomF)

                while (pgcd(a, valeur) !== 1) {
                  a = randint(-9, 9, 0)
                }

                f1 = new FractionEtendue(a + b * valeur, valeur)
                fa = new FractionEtendue(a, valeur)
                fb = new FractionEtendue(b * valeur, valeur)

                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}^*',
                  `\\dfrac{${a}}{x}${ecritureAlgebrique(b)}`,
                  valeur,
                )

                correction =
                  phraseCorrectionImage(nom, valeur) +
                  `$\\begin{aligned}
                  ${nom}(${valeur})&=\\dfrac{${a}}{${valeur}}${ecritureAlgebrique(b)}\\\\
                &=${fa.texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\
                &=${fa.texFractionSimplifiee}${fb.ecritureAlgebrique}\\\\
                &=${miseEnEvidence(f1.texFractionSimplifiee)}
                \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent
                a = randint(-3, 10, 0)
                b = randint(-9, 9, 0)
                image = randint(-9, 9, [0, 1, -1, b])
                nom = choice(nomF)
                f1 = new FractionEtendue(a, image - b)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}^*',
                  `\\dfrac{${a}}{x}${ecritureAlgebrique(b)}`,
                  image,
                )

                correction =
                  phraseCorrectionAntecedent(nom, '\\mathbb{R}^*', image) +
                  `$\\begin{aligned}
                      \\dfrac{${a}}{x}${ecritureAlgebrique(b)}&=${image}\\\\
                      \\dfrac{${a}}{x}${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-b))}&=${image}${miseEnEvidence(ecritureAlgebrique(-b))}\\\\
                      \\dfrac{${a}}{x}&=${image - b}\\\\
                      x\\times${ecritureParentheseSiNegatif(image - b)} &=${a} \\\\
                      x&=${f1.texFraction}${f1.texSimplificationAvecEtapes()}\\\\
                                                \\end{aligned}$<br>
                ${conclusionAntecedent(image, f1.texFractionSimplifiee)}`

                handleAnswers(this, i, { reponse: { value: f1 } })
              }
              break

            case 1:
            default:
              if (typeCalcul[i]) {
                // Calcul d'une image
                a = randint(-3, 9, 0)
                b = randint(-3, 9, 0)
                valeur = choice(obtenirListeFractionsIrreductiblesFaciles())

                f1 = new FractionEtendue(a * valeur.d + b * valeur.n, valeur.n)
                fa = new FractionEtendue(a * valeur.d, valeur.n)
                fb = new FractionEtendue(b * valeur.n, valeur.n)

                nom = choice(nomF)

                enonce = enonceCalculImage(
                  nom,
                  '\\mathbb{R}^*',
                  `\\dfrac{${a}}{x}${ecritureAlgebrique(b)}`,
                  valeur.texFraction,
                )

                correction =
                  phraseCorrectionImage(nom, valeur.texFraction) +
                  `$\\begin{aligned}
                  ${nom}\\left(${valeur.texFraction}\\right)
              &=\\dfrac{${a}}{${valeur.texFraction}}${ecritureAlgebrique(b)}\\\\
              &=\\dfrac{${a}\\times ${valeur.d}}{${valeur.n}}${ecritureAlgebrique(b)}\\\\
              &=${fa.texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\
              &=${fa.texFractionSimplifiee}${fb.ecritureAlgebrique}\\\\
              &=${miseEnEvidence(f1.texFractionSimplifiee)}
                  \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent
                a = randint(-9, 9, 0)
                b = randint(-9, 9, 0)
                image = choice(obtenirListeFractionsIrreductiblesFaciles())
                fa = fraction(image.n - b * image.d, image.d)
                f1 = fraction(a * image.d, image.n - b * image.d)
                nom = choice(nomF)

                enonce = enonceCalculAntecedent(
                  nom,
                  '\\mathbb{R}^*',
                  `\\dfrac{${a}}{x}${ecritureAlgebrique(b)}`,
                  image.texFraction,
                )

                correction =
                  phraseCorrectionAntecedent(
                    nom,
                    '\\mathbb{R}^*',
                    image.texFraction,
                  ) +
                  `$\\begin{aligned}
                      \\dfrac{${a}}{x}${ecritureAlgebrique(b)}&=${image.texFraction}\\\\
                      \\dfrac{${a}}{x}${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-b))}&=${image.texFraction}${miseEnEvidence(ecritureAlgebrique(-b))}\\\\
                      \\dfrac{${a}}{x}&=${fa.texFraction}\\\\
                      x\\times${ecritureParentheseSiNegatif(image.n - b * image.d)} &=${a}\\times ${image.d} \\\\
                      x&=${f1.texFraction}${f1.texSimplificationAvecEtapes()}
                                                \\end{aligned}$<br>
                ${conclusionAntecedent(image.texFraction, f1.texFractionSimplifiee)}`

                handleAnswers(this, i, { reponse: { value: f1 } })
              }
              break
          }
          break

        case 'a/(x+b)+c':
        default:
          switch (sousChoix[i]) {
            case 0:
              if (typeCalcul[i]) {
                // Calcul d'une image
                a = randint(-2, 5, 0)
                b = randint(-5, 5, 0)
                c = randint(-3, 9, 0)
                valeur = randint(-5, 5, [0, -b])
                nom = choice(nomF)

                while (pgcd(a, valeur + b) !== 1) {
                  valeur = randint(-9, 9, [0, -b])
                }

                f1 = new FractionEtendue(a + c * (valeur + b), valeur + b)
                fa = new FractionEtendue(a, valeur + b)

                enonce = enonceCalculImage(
                  nom,
                  `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                  `\\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}`,
                  valeur,
                )

                correction =
                  phraseCorrectionImage(nom, valeur) +
                  `$\\begin{aligned}
                  ${nom}(${valeur})&=\\dfrac{${a}}{${valeur}${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}\\\\
                &=\\dfrac{${a}}{${valeur + b}}${ecritureAlgebrique(c)}\\\\
                &=${fa.texFractionSimplifiee}${ecritureAlgebrique(c)}\\\\
                &=${miseEnEvidence(f1.texFractionSimplifiee)}
                \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent
                a = randint(-2, 5, 0)
                b = randint(-5, 5, 0)
                c = randint(-3, 9, 0)
                image = randint(-5, 5, [0, -b, c])
                nom = choice(nomF)
                f1 = new FractionEtendue(a, image - c)

                fractionb = new FractionEtendue(a, image - c)

                enonce = enonceCalculAntecedent(
                  nom,
                  `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                  `\\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}`,
                  image,
                )

                correction =
                  phraseCorrectionAntecedent(
                    nom,
                    `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                    image,
                  ) +
                  `$\\begin{aligned}
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}&=${image}\\\\
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}${miseEnEvidence(ecritureAlgebrique(-c))}&=${image}${miseEnEvidence(ecritureAlgebrique(-c))}\\\\
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}&=${image - c}\\\\
                      (x${ecritureAlgebrique(b)})\\times${ecritureParentheseSiNegatif(image - c)} &=${a} \\\\
                      x${ecritureAlgebrique(b)}&=${fractionb.texFractionSimplifiee}\\\\
                      x&=${fractionb.texFractionSimplifiee}${ecritureAlgebrique(-b)}\\\\
                      x&=${miseEnEvidence(new FractionEtendue(a - b * (image - c), image - c).texFractionSimplifiee)}
                      \\end{aligned}$<br>
                ${conclusionAntecedent(image, new FractionEtendue(a - b * (image - c), image - c).texFractionSimplifiee)}`

                handleAnswers(this, i, {
                  reponse: {
                    value: new FractionEtendue(a - b * (image - c), image - c),
                  },
                })
              }
              break

            case 1:
            default:
              if (typeCalcul[i]) {
                // Calcul d'une image
                a = randint(-2, 5, 0)
                b = randint(-5, 5, 0)
                c = randint(-3, 9, 0)
                valeur = choice(
                  obtenirListeFractionsIrreductiblesFaciles().filter(
                    (f) => f.n !== -b * f.d,
                  ),
                )
                nom = choice(nomF)

                fractionb = new FractionEtendue(
                  valeur.n + b * valeur.d,
                  valeur.d,
                )
                fa = new FractionEtendue(a * valeur.d, valeur.n + b * valeur.d)
                fractionc = new FractionEtendue(
                  c * (valeur.n + b * valeur.d),
                  valeur.n + b * valeur.d,
                )
                f1 = new FractionEtendue(
                  a * valeur.d + c * (valeur.n + b * valeur.d),
                  valeur.n + b * valeur.d,
                )

                enonce = enonceCalculImage(
                  nom,
                  `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                  `\\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}`,
                  valeur.texFraction,
                )

                correction =
                  phraseCorrectionImage(nom, valeur.texFraction) +
                  `$\\begin{aligned}
                ${nom}\\left(${valeur.texFraction}\\right)&=\\dfrac{${a}}{${valeur.texFraction}${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}\\\\
              &=\\dfrac{${a}}{${fractionb.texFraction}}${ecritureAlgebrique(c)}\\\\
              &=${a}\\times ${fractionb.inverse().texFraction}${ecritureAlgebrique(c)}\\\\
              &=${fa.texFractionSimplifiee}${ecritureAlgebrique(c)}\\\\
              &=${fa.texFractionSimplifiee}${fractionc.ecritureAlgebrique}\\\\
              &=${miseEnEvidence(f1.texFractionSimplifiee)}
              \\end{aligned}$`

                handleAnswers(this, i, { reponse: { value: f1 } })
              } else {
                // Calcul d'un antécédent
                a = randint(-2, 5, 0)
                b = randint(-5, 5, 0)
                c = randint(-3, 9, 0)
                image = choice(obtenirListeFractionsIrreductiblesFaciles())
                nom = choice(nomF)

                fa = fraction(image.n - c * image.d, image.d)
                fractionb = fraction(a * image.d, image.n - c * image.d)
                fractionb2 = fraction(
                  a * image.d - b * (image.n - c * image.d),
                  image.n - c * image.d,
                )

                enonce = enonceCalculAntecedent(
                  nom,
                  `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                  `\\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}`,
                  image.texFraction,
                )

                correction =
                  phraseCorrectionAntecedent(
                    nom,
                    `\\mathbb{R}\\smallsetminus\\{${-b}\\}`,
                    image.texFraction,
                  ) +
                  `$\\begin{aligned}
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}&=${image.texFraction}\\\\
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}${ecritureAlgebrique(c)}${miseEnEvidence(ecritureAlgebrique(-c))}&=${image.texFraction}${miseEnEvidence(ecritureAlgebrique(-c))}\\\\
                      \\dfrac{${a}}{x${ecritureAlgebrique(b)}}&=${fa.texFraction}\\\\
                      (x${ecritureAlgebrique(b)})\\times${ecritureParentheseSiNegatif(image.n - c * image.d)} &=${a}\\times ${image.d} \\\\
                      x${ecritureAlgebrique(b)}&=${fractionb.texFractionSimplifiee}\\\\
                      x&=${fractionb.texFractionSimplifiee}${ecritureAlgebrique(-b)}\\\\
                      x&=${fractionb2.texFraction}${fractionb2.texSimplificationAvecEtapes()}
                      \\end{aligned}$<br>
                ${conclusionAntecedent(image.texFraction, fractionb2.texFractionSimplifiee)}`

                handleAnswers(this, i, { reponse: { value: fractionb2 } })
              }
              break
          }
          break
      }

      texte = enonce
      texte +=
        ' ' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: '<br>',
        })
      texteCorr = correction

      if (
        this.questionJamaisPosee(i, listeTypeDeQuestions[i], x, y, sousChoix[i])
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
