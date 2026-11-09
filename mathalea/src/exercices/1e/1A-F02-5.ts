import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/09/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '7f52a'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export const refs = {
  'fr-fr': ['1A-F02-5'],
  'fr-ch': ['1mQCM-49', '11LSFA2G-2', '11LSQCMFA2D-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer l'image d'une fraction par une fonction polynôme du second degré"
export default class AutoF1f extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponse: string }
  >()

  versionOriginale: () => void = () => {
    this.enonce = `On considère la fonction  $f$ définie sur $\\mathbb{R}$ par $f(x)=2x^2+5x+8$.<br>
    L'image de $-\\dfrac{5}{4}$ par cette fonction est : `
    this.correction = `On remplace $x$ par $-\\dfrac{5}{4}$ dans l'expression de $f$ :<br>
     
    $\\begin{aligned}
    f\\left(-\\dfrac{5}{4}\\right)&=2\\times \\left(-\\dfrac{5}{4}\\right)^2+5\\times \\left(-\\dfrac{5}{4}\\right)+8\\\\
    &=2\\times \\dfrac{25}{16}-\\dfrac{25}{4}+8\\\\
    &=\\dfrac{25}{8}-\\dfrac{50}{8}+\\dfrac{64}{8}\\\\
    &=\\dfrac{25-50+64}{8}\\\\
    &=\\dfrac{39}{8}
    \\end{aligned}$<br><br>
    
    
    L'image de $-\\dfrac{5}{4}$  par la  fonction  $f$ est : $${miseEnEvidence('\\dfrac{39}{8}')}$.`

    this.reponses = [
      '$\\dfrac{39}{8}$', // Bonne réponse
      '$-\\dfrac{11}{8}$', // Erreur : l'élève met un signe - sur le résultat
      '$\\dfrac{25}{8}$', // Erreur : l'élève multiplie 5 × 5/4 = 25/4 au lieu de faire la multiplication correcte
      '$\\dfrac{89}{16}$', // Erreur : l'élève ne met pas au même dénominateur et fait 25/16 + 25/4 + 64/8
    ]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const listeFractions = [
        [1, 3],
        [1, 6],
        [2, 3],
        [3, 4],
        [3, 5],
        [4, 5],
        [5, 3],
        [4, 3],
        [5, 4],
        [6, 5],
        [5, 3],
        [2, 5],
      ]
      const frac = choice(listeFractions)
      const f = new FractionEtendue(frac[0], frac[1]).produitFraction(
        new FractionEtendue(-1, 1),
      )
      const a = randint(-2, 2, 0)
      const b = randint(-5, 5, [-1, 0, 1])
      const c = randint(-2, 2, 0)

      // Calcul de l'image de f par la fonction ax² + bx + c
      // f(x) = a*x² + b*x + c où x = frac[0]/frac[1]

      // Calcul de x²
      const xCarre = new FractionEtendue(frac[0] * frac[0], frac[1] * frac[1])

      // Calcul de a*x²
      const aXCarre = xCarre.produitFraction(new FractionEtendue(a, 1))

      // Calcul de b*x
      const bX = f.produitFraction(new FractionEtendue(b, 1))
      // Calcul de c (converti en fraction)
      const cFraction = new FractionEtendue(c, 1)

      // Calcul du résultat : a*x² + b*x + c
      const resultat = aXCarre.sommeFraction(bX).sommeFraction(cFraction)

      // Calcul du dénominateur commun (PPCM des dénominateurs)
      const ppcm = (a: number, b: number): number => {
        const pgcd = (x: number, y: number): number =>
          y === 0 ? x : pgcd(y, x % y)
        return Math.abs(a * b) / pgcd(a, b)
      }
      const denominateurCommun = ppcm(ppcm(aXCarre.den, bX.den), cFraction.den)

      // Conversion des fractions au même dénominateur
      const aXCarreCommun = new FractionEtendue(
        aXCarre.num * (denominateurCommun / aXCarre.den),
        denominateurCommun,
      )
      const bXCommun = new FractionEtendue(
        bX.num * (denominateurCommun / bX.den),
        denominateurCommun,
      )
      const cFractionCommun = new FractionEtendue(
        c * (denominateurCommun / cFraction.den),
        denominateurCommun,
      )

      // Calcul du numérateur final
      // const numerateurFinal =
      //  aXCarreCommun.num + bXCommun.num + cFractionCommun.num

      // Calcul des distracteurs
      // Distracteur 1 : erreur sur le signe du résultat
      const distracteur1 = resultat.oppose()

      // Distracteur 2 : erreur dans la multiplication b*x (l'élève multiplie num et den par b)
      const bXErreur = new FractionEtendue(f.num * b, f.den * b)
      const distracteur2 = aXCarre
        .sommeFraction(bXErreur)
        .sommeFraction(cFraction)

      // Distracteur 3 : erreur dans le calcul de x² (l'élève ne met pas le signe au carré)
      const xCarreErreur = new FractionEtendue(
        -frac[0] * frac[0],
        frac[1] * frac[1],
      )
      const aXCarreErreur = xCarreErreur.produitFraction(
        new FractionEtendue(a, 1),
      )
      const distracteur3 = aXCarreErreur
        .sommeFraction(bX)
        .sommeFraction(cFraction)

      this.enonce = `On considère la fonction  $f$ définie sur $\\mathbb{R}$ par $f(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.<br>
    L'image de $${f.texFSD}$ par cette fonction est : `

      this.correction = `On remplace $x$ par $${f.texFSD}$ dans l'expression de $f$ :<br>
     
    $\\begin{aligned}
    f\\left(${f.texFSD}\\right)&=${a === 1 ? `` : `${a === -1 ? `-` : `${a}\\times`}`} \\left(${f.texFSD}\\right)^2${ecritureAlgebriqueSauf1(b)}\\times \\left(${f.texFSD}\\right)${ecritureAlgebrique(c)}\\\\
    &=${a === 1 ? `` : `${a === -1 ? `-` : `${a}\\times`}`}${xCarre.texFSD}${bX.ecritureAlgebrique}${ecritureAlgebrique(c)}\\\\
    &=${aXCarre.texFSD}${bX.ecritureAlgebrique}${cFraction.ecritureAlgebrique}\\\\
    &=\\dfrac{${aXCarreCommun.num}${bXCommun.num >= 0 ? '+' : ''}${bXCommun.num}${cFractionCommun.num >= 0 ? '+' : ''}${cFractionCommun.num}}{${denominateurCommun}}\\\\
    &=${resultat.texFractionSimplifiee}
    \\end{aligned}$<br><br>
    
    L'image de $${f.texFSD}$ par la fonction $f$ est : $${miseEnEvidence(resultat.texFractionSimplifiee)}$.`

      this.reponses = [
        `$${resultat.texFractionSimplifiee}$`, // Bonne réponse
        `$${distracteur1.texFractionSimplifiee}$`, // Erreur sur le signe
        `$${distracteur2.texFractionSimplifiee}$`, // Erreur multiplication b*x
        `$${distracteur3.texFractionSimplifiee}$`, // Erreur sur x²
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            /Calculer l'image de \$(.*?)\$ par cette fonction\./,
            (_, valeur) =>
              `L'image de $${valeur}$ par la fonction $f$ est ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}.`,
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        { reponse: { value: donnees.reponse } },
        { formatInteractif: 'mathalea-mathfield' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    const preparerQuestion = () => {
      if (this.sup3 || context.isAmc) return
      this.enonce = this.enonce.replace(
        /L'image de \$(.*?)\$ par cette fonction est :\s*/,
        "Calculer l'image de $$$1$ par cette fonction.",
      )
      this.questionsOuvertes.set(this.enonce, {
        correction: this.correction ?? '',
        reponse: this.reponses[0].replace(/\$/g, '').trim(),
      })
    }
    const aleatoire = this.versionAleatoire
    this.versionAleatoire = () => {
      aleatoire()
      preparerQuestion()
    }
    const originale = this.versionOriginale
    this.versionOriginale = () => {
      originale()
      preparerQuestion()
    }
    this.versionAleatoire()
  }
}
