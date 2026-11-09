import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  combinaisonListes,
  enleveElement,
  remplaceDansTableau,
} from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { signe } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Déterminer une équation de tangente'
export const interactifReady = true

export const dateDePublication = '16/12/2021'
export const dateDeModifImportante = '09/12/2025'

/**
 * Déterminer une équation de tangente
 * @author Gilles Mora
 *  Ajout de l'interactivité par Jean-claude Lhote et passage en typescript
 */
export const uuid = '4c8c7'

export const refs = {
  'fr-fr': ['1AN11-3', 'BP1FDEV01', 'TSA3-10', 'TCA7-10'],
  'fr-ch': [],
}
export default class Equationdetangente extends Exercice {
  version: string

  constructor() {
    super()
    this.version = '1e' // Version par défaut
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Avec un nombre dérivé et une image donnés',
        '2 : Polynôme degré 2',
        '3 : Polynôme degré 3',
        '4 : Fonction rationnelle',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Correction sans formule']
    this.nbQuestions = 1 // Nombre de questions par défaut
    this.nbCols = 1 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 1 // Uniquement pour la sortie LaTeX
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.sup = '5'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    let listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    if (this.version === '1Tec') {
      enleveElement(listeTypeQuestions, 3) // Enlève la question 1
      enleveElement(listeTypeQuestions, 4) // Enlève la question 4
      listeTypeQuestions = remplaceDansTableau(listeTypeQuestions, 2, 3)
      listeTypeQuestions = remplaceDansTableau(listeTypeQuestions, 1, 2)

      if (listeTypeQuestions.length === 0) listeTypeQuestions = [2, 3]
      listeTypeQuestions = combinaisonListes(
        listeTypeQuestions,
        this.nbQuestions,
      )
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number, b: number, c: number, d: number, e: number
      let reponse: string
      let borneInf: number
      let borneSup: number
      const cours =
        " L'équation réduite de la tangente $(T)$ au point d'abscisse $a$  est : $y=f'(a)(x-a)+f(a)$.<br><br>"
      const cours2 = ` L'équation réduite de la tangente $(T)$ au point d'abscisse $a$  est : $y=mx+p$.<br>
       $m$ est le nombre dérivé de $f$ en $a$ et on calcule $p$ en utlisant un point qui appartient à la droite. <br>
       On utilise pour cela le point de coordonnées $(a\\,;\\,f(a))$.<br><br>`
      switch (listeTypeQuestions[i]) {
        case 1: // Cas 1 : Nombre dérivé donné
          a = randint(-5, 5) // Point d'abscisse
          b = randint(-5, 5, 0) // f(a)
          c = randint(-10, 10) // f'(a)
          borneInf = randint(-10, -7)
          borneSup = randint(7, 10)
          texte = `Soit $f$ une fonction dérivable sur $[${borneInf}\\,;\\,${borneSup}]$ et $\\mathcal{C}_f$ sa courbe représentative.<br>`
          texte += `On sait que $f(${a})=${b}$ et que $f'(${a})=${c}$.<br>`
          texte += `Déterminer l'équation réduite de la tangente $(T)$ à la courbe $\\mathcal{C}_f$ au point d'abscisse $${a}$.<br>`

          if (this.sup2) {
            // Correction sans formule (démonstration complète)

            texteCorr =
              cours2 +
              `Le coefficient directeur de la tangente est égal au nombre dérivé. <br>
            Ainsi, $m=f'(${a})=${c}$.<br><br>`
            texteCorr += `On obtient alors $(T) : y=${rienSi1(c)}x+p$.<br><br>`
            texteCorr += `La tangente passe par le point $A$ de coordonnées $(${a}\\,;\\,f(${a}))$.<br>`
            texteCorr += `On a $f(${a})=${b}$.<br><br>`
            texteCorr += `Les coordonnées de $A$ vérifient l'équation, donc :<br>`
            texteCorr += `$${b}=${c}\\times${ecritureParentheseSiNegatif(a)}+p$<br>`
            texteCorr += `$${b}=${c * a}+p$<br>`
            texteCorr += `$p=${b}${ecritureAlgebrique(-c * a)}$<br>`
            texteCorr += `$p=${b - c * a}$<br><br>`
            texteCorr += `Ainsi, l'équation de la tangente est : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(c, b - c * a))}$.`
          } else {
            // Correction avec formule
            texteCorr =
              cours +
              `On obtient pour $a=${a}$ :<br>
          $y=f'(${a})(x-${ecritureParentheseSiNegatif(a)})+f(${a})$<br><br>
         D'après l'énoncé, $f'(${a})=${c}$ et $f(${a})=${b}$, on a alors :<br>
          ${a === 0 ? `$y=${c}x${ecritureAlgebrique(b)}$` : `$y=${c}(x${ecritureAlgebrique(-a)})${ecritureAlgebrique(b)}$`}<br><br>`
            texteCorr += `En simplifiant l'écriture, on obtient  : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(c, b - c * a))}$.`
          }

          reponse = reduireAxPlusB(c, b - c * a)
          break

        case 2:
          {
            // Cas 2 : Polynôme avec Trinome
            a = randint(-3, 3, [0]) // coefficient de x²
            b = randint(3, 3) // coefficient de x
            c = randint(-5, 5) // terme constant
            d = randint(-4, 4, [0]) // point d'abscisse pour la tangente

            const poly = new Trinome(a, b, c)
            const valeurEnD = poly.texCalculImage(d) // Texte du calcul de f(d)
            const imageD = poly.image(d).valeurDecimale // Valeur numérique de f(d)
            const deriveeEnD = 2 * a * d + b // f'(d)

            texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${poly.tex}$ et $\\mathcal{C}_f$ sa courbe représentative.<br>`
            texte += `Déterminer l'équation réduite de la tangente $(T)$ à $\\mathcal{C}_f$ au point d'abscisse $${d}$.`

            if (this.sup2) {
              // Correction sans formule
              texteCorr =
                cours2 +
                `La fonction $f$ est un polynôme, donc elle est dérivable sur $\\mathbb{R}$.<br><br>
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=${reduireAxPlusB(2 * a, b)}$<br><br>
          $\\bullet$  Calcul de $f'(${d})$ :<br>
          $f'(${d})=${2 * a}\\times${ecritureParentheseSiNegatif(d)}${b === 0 ? `` : `${ecritureAlgebrique(b)}`}=${deriveeEnD}$<br><br>
          $\\bullet$ Calcul de $f(${d})$ :<br>
          $f(${d})=${valeurEnD}$<br><br>

          Le coefficient directeur de la tangente est le nombre dérivé. <br>
          Ainsi, $m=f'(${d})=${deriveeEnD}$.<br><br>
          On obtient alors $(T) : y=${rienSi1(deriveeEnD)}x+p$.<br><br>
          La tangente passe par le point $A$ de coordonnées $(${d}\\,;\\,f(${d}))$ soit $(${d}\\,;\\,${imageD})$.<br><br>
          Les coordonnées de $A$ vérifient l'équation, donc :<br>
          $${imageD}=${deriveeEnD}\\times${ecritureParentheseSiNegatif(d)}+p$<br>
          $${imageD}=${deriveeEnD * d}+p$<br>
          $p=${imageD}${ecritureAlgebrique(-deriveeEnD * d)}$<br>
          $p=${imageD - deriveeEnD * d}$<br><br>
          Ainsi, l'équation de la tangente est : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(deriveeEnD, imageD - d * deriveeEnD))}$.`
            } else {
              // Correction avec formule
              texteCorr =
                cours +
                `La fonction $f$ est un polynôme, donc elle est dérivable sur $\\mathbb{R}$.<br><br>
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=${2 * a === 1 ? '' : 2 * a === -1 ? '-' : 2 * a}x${b === 0 ? `` : `${ecritureAlgebrique(b)}`}$<br><br>
          $\\bullet$  Calcul de $f'(${d})$ :<br>
          $f'(${d})=${2 * a}\\times${ecritureParentheseSiNegatif(d)}${b === 0 ? `` : `${ecritureAlgebrique(b)}`}=${deriveeEnD}$<br><br>
          $\\bullet$ Calcul de $f(${d})$ :<br>
          $f(${d})=${valeurEnD}$<br><br>
          En remplaçant les valeurs dans cette équation, on obtient : <br>
       $y=f'(${d})(x${ecritureAlgebrique(-d)})+f(${d})$ <br>
       $y=${deriveeEnD}(x${ecritureAlgebrique(-d)})${ecritureAlgebrique(imageD)}$<br> <br>
       En simplifiant l'écriture, on obtient  : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(deriveeEnD, imageD - d * deriveeEnD))}$.`
            }

            reponse = reduireAxPlusB(deriveeEnD, imageD - d * deriveeEnD)
          }
          break

        case 3:
          {
            // Cas 3 : Polynôme degré 3
            a = randint(-2, 2, [0]) // coefficient de x³
            b = randint(-3, 3) // coefficient de x²
            c = randint(-2, 5) // coefficient de x
            d = randint(-5, 5, 0) // terme constant
            e = randint(-2, 4) // point d'abscisse pour la tangente

            const poly3 = new Polynome({ coeffs: [d, c, b, a] })
            const imageE = poly3.image(e) // f(e)
            const derivee3 = poly3.derivee()
            const deriveeEnE = derivee3.image(e) // f'(e)

            // Calcul détaillé de f(e) avec une étape
            const calculFE = `${a === 1 || a === -1 ? `${rienSi1(a)}` : `${a}\\times`}${ecritureParentheseSiNegatif(e)}^3${b === 0 ? '' : `${b === 1 || b === -1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(e)}^2`}${c === 0 ? '' : `${c === 1 || c === -1 ? `${signe(c)}` : `${ecritureAlgebrique(c)}\\times`}${ecritureParentheseSiNegatif(e)}`}${d === 0 ? '' : `${ecritureAlgebrique(d)}`}`

            // Calcul détaillé de f'(e) avec une étape
            const coefDeriveeX2 = 3 * a
            const coefDeriveeX = 2 * b
            const calculFPrimaE = `${coefDeriveeX2 === 1 || coefDeriveeX2 === -1 ? rienSi1(coefDeriveeX2) : `${coefDeriveeX2}\\times`}${ecritureParentheseSiNegatif(e)}^2${coefDeriveeX === 0 ? '' : `${coefDeriveeX === 1 || coefDeriveeX === -1 ? ecritureAlgebrique(coefDeriveeX) : `${ecritureAlgebrique(coefDeriveeX)}\\times`}${ecritureParentheseSiNegatif(e)}`}${c === 0 ? '' : `${ecritureAlgebrique(c)}`}`
            const texteCommun3 = `La fonction $f$ est un polynôme, donc elle est dérivable sur $\\mathbb{R}$.<br><br>`
            texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${poly3.toLatex()}$ et $\\mathcal{C}_f$ sa courbe représentative.<br>`
            texte += `Déterminer l'équation réduite de la tangente $(T)$ à $\\mathcal{C}_f$ au point d'abscisse $${e}$.`

            if (this.sup2) {
              // Correction sans formule
              texteCorr =
                cours2 +
                texteCommun3 +
                `
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=${derivee3.toLatex()}$<br><br>
          $\\bullet$ Calcul de $f'(${e})$ :<br>
          $f'(${e})=${calculFPrimaE}=${deriveeEnE}$<br><br>
          $\\bullet$ Calcul de $f(${e})$ :<br>
          $f(${e})=${calculFE}=${imageE}$<br><br>

          Le coefficient directeur de la tangente est le nombre dérivé.<br>
          Ainsi, $m=f'(${e})=${deriveeEnE}$.<br><br>
          On obtient alors $(T) : y=${rienSi1(deriveeEnE)}x+p$.<br><br>
          La tangente passe par le point $A$ de coordonnées $(${e}\\,;\\,f(${e}))=(${e}\\,;\\,${imageE})$.<br><br>
          Les coordonnées de $A$ vérifient l'équation, donc :<br>
          $${imageE}=${deriveeEnE}\\times${ecritureParentheseSiNegatif(e)}+p$<br>
          $${imageE}=${deriveeEnE * e}+p$<br>
          $p=${imageE}${ecritureAlgebrique(-deriveeEnE * e)}$<br>
          $p=${imageE - deriveeEnE * e}$<br><br>
          Ainsi, l'équation de la tangente est : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(deriveeEnE, imageE - e * deriveeEnE))}$.`
            } else {
              // Correction avec formule
              texteCorr =
                cours +
                texteCommun3 +
                `
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=${derivee3.toLatex()}$<br><br>
          $\\bullet$ Calcul de $f'(${e})$ :<br>
          $f'(${e})=${calculFPrimaE}=${deriveeEnE}$<br><br>
          $\\bullet$ Calcul de $f(${e})$ :<br>
          $f(${e})=${calculFE}=${imageE}$<br><br>
          En remplaçant les valeurs dans cette équation, on obtient : <br>
       $y=f'(${e})(x${ecritureAlgebrique(-e)})+f(${e})$ <br>
       $y=${deriveeEnE}(x${ecritureAlgebrique(-e)})${ecritureAlgebrique(imageE)}$<br> <br>
       En simplifiant l'écriture, on obtient  : $(T) :\\ y=${miseEnEvidence(reduireAxPlusB(deriveeEnE, imageE - e * deriveeEnE))}$.`
            }

            reponse = reduireAxPlusB(deriveeEnE, imageE - e * deriveeEnE)
          }
          break
        case 4: // Cas 4 : Fonction rationnelle a/(bx+c)
        default:
          {
            a = randint(1, 5) // numérateur
            b = randint(1, 2) // coefficient de x (on évite 1 pour avoir bx explicite)
            const valeurInterdite = randint(1, 4) // valeur interdite (nombre entier positif)
            c = -b * valeurInterdite // pour avoir -c/b = valeurInterdite
            d = randint(valeurInterdite + 1, 8) // point d'abscisse (différent de la valeur interdite)

            // Calcul avec FractionEtendue pour des valeurs exactes
            const denominateurEnD = b * d + c
            const fracFD = new FractionEtendue(a, denominateurEnD).simplifie() // f(d)
            const fracFPrimD = new FractionEtendue(
              -a * b,
              denominateurEnD * denominateurEnD,
            ).simplifie() // f'(d) = -ab/(bx+c)²

            // Calcul de l'ordonnée à l'origine : fd - d*f'(d) avec des fractions
            const fracD = new FractionEtendue(d, 1)
            const ordOrigineFrac = fracFD
              .differenceFraction(fracFPrimD.produitFraction(fracD))
              .simplifie()

            // Construction du texte pour le dénominateur bx+c
            const denomTexte = `${rienSi1(b)}x${ecritureAlgebrique(c)}`
            const texteCommun4 = `La fonction $f$ est dérivable sur $]${valeurInterdite}\\,;\\,+\\infty[$ (quotient de fonctions dérivables dont le dénominateur ne s'annule pas sur $]${valeurInterdite}\\,;\\,+\\infty[$).<br><br>`
            texte = `Soit $f$ la fonction définie sur $]${valeurInterdite}\\,;\\,+\\infty[$ par $f(x)=\\dfrac{${a}}{${denomTexte}}$ et $\\mathcal{C}_f$ sa courbe représentative.<br>`
            texte += `Déterminer l'équation réduite de la tangente $(T)$ à $\\mathcal{C}_f$ au point d'abscisse $${d}$.`

            if (this.sup2) {
              // Correction sans formule
              texteCorr =
                texteCommun4 +
                `
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=\\dfrac{${-a * b}}{(${denomTexte})^2}$<br><br>
          $\\bullet$ Calcul de $f'(${d})$ :<br>
          $f'(${d})=\\dfrac{${-a * b}}{(${b === 1 ? `` : `${b}\\times`}${d}${ecritureAlgebrique(c)})^2}=\\dfrac{${-a * b}}{${ecritureParentheseSiNegatif(denominateurEnD)}^2}=${fracFPrimD.texFractionSimplifiee}$<br><br>
          $\\bullet$ Calcul de $f(${d})$ :<br>
          $f(${d})=\\dfrac{${a}}{${b === 1 ? `` : `${b}\\times`}${d}${ecritureAlgebrique(c)}}=\\dfrac{${a}}{${denominateurEnD}}=${fracFD.texFractionSimplifiee}$<br><br>
          L'équation réduite de la tangente est $(T) : y=mx+p$.<br><br>
          Le coefficient directeur de la tangente est le nombre dérivé. <br>
          Ainsi, $m=f'(${d})=${fracFPrimD.texFractionSimplifiee}$.<br><br>
          On obtient alors $(T) : y=${rienSi1(fracFPrimD.simplifie())}x+p$.<br><br>
          La tangente passe par le point $A$ de coordonnées $(${d}\\,;\\,f(${d}))$ soit $\\left(${d}\\,;\\,${fracFD.texFractionSimplifiee}\\right)$.<br><br>
          Les coordonnées de $A$ vérifient l'équation, donc :<br>
          $${fracFD.texFractionSimplifiee}=${fracFPrimD.texFractionSimplifiee}\\times${ecritureParentheseSiNegatif(d)}+p$<br>
          $p=${fracFD.texFractionSimplifiee}${fracFPrimD.produitFraction(fracD).oppose().ecritureAlgebrique}$<br>
          $p=${ordOrigineFrac.texFractionSimplifiee}$<br><br>
          Ainsi, l'équation de la tangente est : $(T) :\\ y=${miseEnEvidence(`${fracFPrimD.valeurDecimale === 1 ? 'x' : fracFPrimD.valeurDecimale === -1 ? '-x' : `${fracFPrimD.texFractionSimplifiee}x`}${ordOrigineFrac.ecritureAlgebrique}`)}$.`
            } else {
              // Correction avec formule
              texteCorr =
                cours +
                texteCommun4 +
                `
          $\\bullet$ Calcul de $f'(x)$ :<br>
          $f'(x)=\\dfrac{${-a * b}}{(${denomTexte})^2}$<br><br>
          $\\bullet$ Calcul de $f'(${d})$ :<br>
          $f'(${d})=\\dfrac{${-a * b}}{(${b === 1 ? `` : `${b}\\times`}${d}${ecritureAlgebrique(c)})^2}=\\dfrac{${-a * b}}{${denominateurEnD * denominateurEnD}}=${fracFPrimD.texFractionSimplifiee}$<br><br>
          $\\bullet$ Calcul de $f(${d})$ :<br>
          $f(${d})=\\dfrac{${a}}{${b === 1 ? `` : `${b}\\times`}${d}${ecritureAlgebrique(c)}}=${fracFD.texFractionSimplifiee}$<br><br>
          En remplaçant les valeurs dans cette équation, on obtient : <br>
       $y=f'(${d})(x-${ecritureParentheseSiNegatif(d)})+f(${d})$ <br>
       $y=${fracFPrimD.texFractionSimplifiee}(x-${ecritureParentheseSiNegatif(d)})${fracFD.ecritureAlgebrique}$.<br> <br>
       En simplifiant l'écriture, on obtient  : $(T) :\\ y=${miseEnEvidence(`${fracFPrimD.valeurDecimale === 1 ? 'x' : fracFPrimD.valeurDecimale === -1 ? '-x' : `${fracFPrimD.texFractionSimplifiee}x`}${ordOrigineFrac.ecritureAlgebrique}`)}$.`
            }

            reponse = reduireAxPlusB(fracFPrimD, ordOrigineFrac)
          }
          break
      }

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lycee, {
        texteAvant: '<br>$y=$',
      })

      handleAnswers(this, i, {
        reponse: { value: reponse },
      })

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
