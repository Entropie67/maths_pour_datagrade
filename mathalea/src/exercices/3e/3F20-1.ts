import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { latexParPoint, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import type { AutoCorrectionAMC } from '../../lib/amc/amcTypes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { pgcd, premierAvec } from '../../lib/outils/primalite'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Étudier des fonctions affines'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '08/05/2023'
export const dateDeModifImportante = '01/06/2024'

export const refs = {
  'fr-fr': ['3F20-1'],
  'fr-ch': ['11CTFA2D-2', '11LCFA2D-2', '11LSFA2D-2', 'PRQPF01C-2'],
}
export const uuid = '20d20'
/**
 * Questions sur les fonctions affines
 * @author Jean-claude Lhote
 */
export default class FonctionsAffines extends Exercice {
  lycee: boolean
  constructor() {
    super()

    this.comment = `L'exercice propose différents types de questions sur les fonctions affines comme son homologue 3F20 sur les fonctions affines :<br>
calcul d'image, calcul d'antécédent.<br>
Ce coefficient peut être au choix entier relatif ou rationnel relatif.<br>
Certaines questions de calcul d'image nécessitent des calculs préalables.<br>
Le choix a été fait d'un antécédent primaire entier positif, le coefficient étant négatif avec une probabilité de 50${sp()}% ainsi que l'ordonnée à l'origine.<br>`
    this.sup = 1 // coefficient entier relatif
    this.nbQuestions = 8
    this.lycee = false
    this.sup2 = this.lycee ? '11' : '9'
    this.spacingCorr = 3

    this.besoinFormulaireNumerique = [
      'Coefficient : ',
      3,
      '1: Coefficient entier\n2: Coefficient rationnel\n3: Mélange',
    ]
  }

  nouvelleVersion() {
    this.besoinFormulaire2Texte = this.lycee
      ? [
          'Types de questions',
          'Nombres séparés par des tirets :\n1: Image par expression\n2: Image par valeurs\n3: Image par graphique\n4: Antécédent par expression\n5: Antécédent par valeurs\n6: Antécédent par graphique\n7: Expression par valeurs\n8: Expression par graphique\n9: Expression par graphique (formule des accroissements)\n10: Expression par valeurs (formule des accroissements)\n11: Mélange',
        ]
      : [
          'Types de questions',
          'Nombres séparés par des tirets :\n1: Image par expression\n2: Image par valeurs\n3: Image par graphique\n4: Antécédent par expression\n5: Antécédent par valeurs\n6: Antécédent par graphique\n7: Expression par valeurs\n8: Expression par graphique\n9: Mélange',
        ]

    const typesDeQuestionsDisponibles = this.lycee
      ? [
          'imageParExpression',
          'imageParValeurs',
          'imageParGraphique',
          'antecedentParExpression',
          'antecedentParValeurs',
          'antecedentParGraphique',
          'expressionParValeurs',
          'expressionParGraphique',
          'expressionParGraphique2',
          'expressionParValeurs2',
        ]
      : [
          'imageParExpression',
          'imageParValeurs',
          'imageParGraphique',
          'antecedentParExpression',
          'antecedentParValeurs',
          'antecedentParGraphique',
          'expressionParValeurs',
          'expressionParGraphique',
        ]
    const questionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: this.lycee ? 10 : 8,
      defaut: this.lycee ? 11 : 9,
      nbQuestions: this.nbQuestions,
      listeOfCase: typesDeQuestionsDisponibles,
      melange: this.lycee ? 11 : 9,
    })
    this.sup = contraindreValeur(1, 3, this.sup, 1)
    const listeTypeDeCoeff =
      this.sup === 1
        ? combinaisonListes([1], this.nbQuestions)
        : this.sup === 2
          ? combinaisonListes([2], this.nbQuestions)
          : combinaisonListes([1, 2], this.nbQuestions)
    const listeTypesDeQuestions = combinaisonListes(
      questionsDisponibles,
      this.nbQuestions,
    )
    const antecedents = []
    for (
      let i = 0, texteAMC, valeurAMC, texte2AMC, valeur2AMC, texte3AMC, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte2AMC = ''
      texte3AMC = ''
      valeur2AMC = 0
      const elementAmc: AutoCorrectionAMC = {}
      const nomFonction = String.fromCharCode(102 + i)
      let texte = ''
      let texteCorr = ''
      // valeur associée à image0 pour le calcul de coefficient : image0 = coefficient * antecedent0
      // on retrouve ces valeurs antecedent0 et image0 dans l'énoncé pour certaines questions.
      // ce sont antecedent et image qui seront à calculer.
      const antecedent0 = 2 * randint(2, 5) + 1
      const ordonneeOrigine = randint(-10, 10, [0])
      let coefficient: number | FractionEtendue
      let image
      switch (listeTypeDeCoeff[i]) {
        case 2:
          coefficient = new FractionEtendue(
            premierAvec(antecedent0, antecedents, false) * choice([-1, 1]),
            antecedent0,
          )
          break
        case 1:
        default:
          coefficient = randint(2, 8) * choice([-1, 1])
          break
      }
      const coeffRationnel = coefficient instanceof FractionEtendue
      let imageString
      const antecedent = choice(rangeMinMax(-10, 10, [antecedent0, 0, 1, -1]))
      const image0 =
        ordonneeOrigine +
        (coeffRationnel
          ? (coefficient as FractionEtendue).num
          : (coefficient as number) * antecedent0)
      if (coeffRationnel) {
        image = (coefficient as FractionEtendue)
          .multiplieEntier(antecedent)
          .ajouteEntier(ordonneeOrigine)
        imageString = (image as FractionEtendue).texFSD
        // formatInteractif = 'fractionEgale'
      } else {
        image = ordonneeOrigine + (coefficient as number) * antecedent
        imageString = texNombre(image, 0)
      }
      antecedents.push(antecedent, antecedent0)
      const coefficientString = coeffRationnel
        ? (coefficient as FractionEtendue).simplifie().texFSD
        : (coefficient as number).toString()
      let xUnite, yUnite, xThickDistance, yThickDistance, xThickMin, yThickMin
      const tableauEchelleX = [
        [5, 1, 1],
        [10, 0.5, 2],
        [20, 0.25, 4],
        [50, 0.1, 10],
        [100, 0.05, 20],
        [250, 0.02, 50],
        [500, 0.01, 100],
        [1000, 0.005, 200],
        [2000, 0.00025, 400],
      ]
      const tableauEchelleY = [
        [5, 1, 1],
        [10, 0.5, 2],
        [20, 0.25, 4],
        [50, 0.1, 10],
        [100, 0.05, 20],
        [250, 0.02, 50],
        [500, 0.01, 100],
        [1000, 0.005, 200],
        [2000, 0.00025, 400],
      ]
      xUnite = tableauEchelleX[0][1]
      xThickDistance = tableauEchelleX[0][2]
      xThickMin = -tableauEchelleX[0][0] - xThickDistance
      for (let k = 1; Math.abs(antecedent0) > tableauEchelleX[k - 1][0]; k++) {
        if (k >= tableauEchelleX.length) break
        xUnite = tableauEchelleX[k][1]
        xThickDistance = tableauEchelleX[k][2]
        xThickMin = -tableauEchelleX[k][0] - xThickDistance
      }
      yUnite = tableauEchelleY[0][1]
      yThickDistance = tableauEchelleY[0][2]
      yThickMin = -tableauEchelleY[0][0] - yThickDistance
      for (
        let k = 1;
        Math.max(Math.abs(image0), Math.abs(ordonneeOrigine)) >
        tableauEchelleY[k - 1][0];
        k++
      ) {
        if (k >= tableauEchelleY.length) break
        yUnite = tableauEchelleY[k][1]
        yThickDistance = tableauEchelleY[k][2]
        yThickMin = -tableauEchelleY[k][0] - yThickDistance
      }
      const xMin = xThickMin
      const xMax = -xThickMin + xThickDistance
      const yMin = yThickMin
      const yMax = -yThickMin
      const xmin = xMin * xUnite - 1
      const ymin = yMin * yUnite - 1
      const xmax = xMax * xUnite + 1
      const ymax = yMax * yUnite + 1
      const r = repere({
        xUnite,
        yUnite,
        xMin,
        yMin,
        xMax,
        yMax,
        xThickDistance,
        yThickDistance,
        yLabelEcart: 0.8,
        grille: false,
      })
      const origine = pointAbstrait(0, ordonneeOrigine * yUnite)
      const M = pointAbstrait(antecedent0 * xUnite, image0 * yUnite)
      const d = droite(origine, M)
      const t = tracePoint(M)
      const projeteX = pointAbstrait(M.x, 0)
      const projeteY = pointAbstrait(0, M.y)
      const pointilles = polyline([projeteY, M, projeteX], 'red')
      pointilles.pointilles = 2
      pointilles.epaisseur = 1
      const coordonnees = texteParPoint(
        `(${antecedent0};${image0})`,
        pointAbstrait(M.x + 0.2, M.y),
        0,
        'black',
        1,
        'gauche',
      )
      switch (listeTypesDeQuestions[i]) {
        // On détermine l'image à partir de l'expression générale de la fonction
        case 'imageParExpression':
          texte += `Soit $${nomFonction}(x)=${coeffRationnel ? (coefficient as FractionEtendue).texFSD : texNombre(coefficient as number)}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                {
                  texteAvant: ' :',
                },
              )
            : '.'
          texteCorr += `$${nomFonction}(${texNombre(antecedent, 0)})=${coeffRationnel ? (coefficient as FractionEtendue).texFSD : texNombre(coefficient as number, 0)} \\times ${ecritureParentheseSiNegatif(antecedent)}${ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (coefficient as FractionEtendue).multiplieEntier(antecedent).texFraction : texNombre((coefficient as number) * antecedent, 0)}${coeffRationnel ? fraction(ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique : ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (image as FractionEtendue).texFSD : texNombre(image, 0)}$`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else handleAnswers(this, i, { reponse: { value: image } })
          break
        case 'imageParValeurs':
          texte += `Soit $${nomFonction}$ la fonction affine telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$ et $${nomFonction}(0)=${ordonneeOrigine}$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                {
                  texteAvant: ' :',
                },
              )
            : '.'
          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et par suite $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `$${nomFonction}(${texNombre(antecedent, 0)})=${coeffRationnel ? (coefficient as FractionEtendue).texFSD : texNombre(coefficient as number, 0)} \\times ${ecritureParentheseSiNegatif(antecedent)}${ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (coefficient as FractionEtendue).multiplieEntier(antecedent).texFraction : texNombre((coefficient as number) * antecedent, 0)}${coeffRationnel ? fraction(ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique : ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (image as FractionEtendue).texFSD : texNombre(image, 0)}$`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else handleAnswers(this, i, { reponse: { value: image } })
          break
        case 'imageParGraphique':
          texte += `La droite représentant la fonction affine $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$ et coupe l'axe des ordonnées en $(0;${ordonneeOrigine})$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texte += '<br>'
          texte += mathalea2d(
            {
              scale: 0.6,
              xmin,
              ymin,
              xmax,
              ymax,
            },
            r,
            d,
            t,
            coordonnees,
            pointilles,
          )

          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et par suite $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `$${nomFonction}(${texNombre(antecedent, 0)})=${coeffRationnel ? (coefficient as FractionEtendue).texFSD : texNombre(coefficient as number, 0)} \\times ${ecritureParentheseSiNegatif(antecedent)}${ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (coefficient as FractionEtendue).multiplieEntier(antecedent).texFraction : texNombre((coefficient as number) * antecedent, 0)}${coeffRationnel ? fraction(ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique : ecritureAlgebrique(ordonneeOrigine)}$<br>`
          texteCorr += `$\\phantom{f(${texNombre(antecedent, 0)})}=${coeffRationnel ? (image as FractionEtendue).texFSD : texNombre(image, 0)}$`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else handleAnswers(this, i, { reponse: { value: image } })
          break
        case 'antecedentParExpression':
          texte += `Soit $${nomFonction}(x)=${coeffRationnel ? (coefficient as FractionEtendue).texFSD : texNombre(coefficient as number)}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString}\\times b${ecritureAlgebrique(ordonneeOrigine)}=${imageString}$.<br>`
          texteCorr += `On en déduit $${coefficientString}b=${imageString}${ecritureAlgebrique(-ordonneeOrigine)}`
          if (coeffRationnel) {
            texteCorr += `=${imageString}${fraction(-ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique}`
          }
          texteCorr += `=${coeffRationnel ? (image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFraction : (image as number) - ordonneeOrigine}$.<br>`
          if (coeffRationnel) {
            texteCorr += `Donc $b=\\dfrac{${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}}{${coefficientString}}=`
            texteCorr += `${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}\\times ${(coefficient as FractionEtendue).inverse().texFSP}=`
          } else {
            texteCorr += `Donc $b=\\dfrac{${texNombre((image as number) - ordonneeOrigine, 0)}}{${coefficientString}}=`
          }
          texteCorr += `${antecedent}$`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'antecedentParValeurs':
          texte += `Soit $${nomFonction}$ la fonction affine telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$ et $${nomFonction}(0)=${ordonneeOrigine}$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et ainsi que $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString}\\times b${ecritureAlgebrique(ordonneeOrigine)}=${imageString}$.<br>`
          texteCorr += `On en déduit $${coefficientString}b=${imageString}${ecritureAlgebrique(-ordonneeOrigine)}`
          if (coeffRationnel) {
            texteCorr += `=${imageString}${fraction(-ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique}`
          }
          texteCorr += `=${coeffRationnel ? (image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFraction : (image as number) - ordonneeOrigine}$.<br>`
          if (coeffRationnel) {
            texteCorr += `Donc $b=\\dfrac{${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}}{${coefficientString}}=`
            texteCorr += `${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}\\times ${(coefficient as FractionEtendue).inverse().texFSP}=`
          } else {
            texteCorr += `Donc $b=\\dfrac{${texNombre((image as number) - ordonneeOrigine, 0)}}{${coefficientString}}=`
          }
          texteCorr += `${antecedent}$`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'antecedentParGraphique':
          texte += `La droite représentant la fonction affine $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$ et coupe l'axe des ordonnées en $(0;${ordonneeOrigine})$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coeffRationnel
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texte += '<br>'
          texte += mathalea2d(
            {
              scale: 0.6,
              xmin,
              ymin,
              xmax,
              ymax,
            },
            r,
            d,
            t,
            coordonnees,
            pointilles,
          )
          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et ainsi que $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString}\\times b${ecritureAlgebrique(ordonneeOrigine)}=${imageString}$.<br>`
          texteCorr += `On en déduit $${coefficientString}b=${imageString}${ecritureAlgebrique(-ordonneeOrigine)}`
          if (coeffRationnel) {
            texteCorr += `=${imageString}${fraction(-ordonneeOrigine * (coefficient as FractionEtendue).den, (coefficient as FractionEtendue).den).ecritureAlgebrique}`
          }
          texteCorr += `=${coeffRationnel ? (image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFraction : (image as number) - ordonneeOrigine}$.<br>`
          if (coeffRationnel) {
            texteCorr += `Donc $b=\\dfrac{${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}}{${coefficientString}}=`
            texteCorr += `${(image as FractionEtendue).ajouteEntier(-ordonneeOrigine).texFSD}\\times ${(coefficient as FractionEtendue).inverse().texFSP}=`
          } else {
            texteCorr += `Donc $b=\\dfrac{${texNombre((image as number) - ordonneeOrigine, 0)}}{${coefficientString}}=`
          }
          texteCorr += `${antecedent}$`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'expressionParValeurs':
          texte += `Soit $${nomFonction}$ la fonction affine telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$ et $${nomFonction}(0)=${ordonneeOrigine}$.<br>`
          texte += `Donner l'expression de  $${nomFonction}(x)$.`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
            {
              texteAvant: `<br>$${nomFonction}(x)=$`,
            },
          )
          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et ainsi que $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$`
          if (context.isAmc) {
            texteAMC = `Valeur de $a$ dans $${nomFonction}(x)=ax+b$`
            valeurAMC = coefficient
            texte2AMC = `Valeur de $b$ dans $${nomFonction}(x)=ax+b$`
            valeur2AMC = ordonneeOrigine
            texte3AMC = 'Vos calculs et votre réponse<br>'
          } else
            handleAnswers(this, i, {
              reponse: {
                value: `${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}`,
              },
            })
          break

        case 'expressionParGraphique':
          texte += `La droite représentant la fonction affine $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$ et coupe l'axe des ordonnées en $(0;${ordonneeOrigine})$.<br>`
          texte += `Donner l'expression de  $${nomFonction}(x)$.`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
            {
              texteAvant: `<br>$${nomFonction}(x)=$`,
            },
          )
          texte += '<br>'
          texte += mathalea2d(
            {
              scale: 0.6,
              xmin,
              ymin,
              xmax,
              ymax,
            },
            r,
            d,
            t,
            coordonnees,
            pointilles,
          )
          texteCorr += `Comme $${nomFonction}(0)=${ordonneeOrigine}$, la fonction $${nomFonction}(x)=ax+b$ vérifie $a\\times 0 + b = b = ${ordonneeOrigine}$ et par suite $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ tel que de $${nomFonction}(x)=ax${ecritureAlgebrique(ordonneeOrigine)}$ vérifie $a\\times ${antecedent0}${ecritureAlgebrique(ordonneeOrigine)} = ${image0}$ soit $${antecedent0}a=${image0 - ordonneeOrigine}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0 - ordonneeOrigine, 0)}}{${antecedent0}}`
          if (pgcd(image0 - ordonneeOrigine, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0 - ordonneeOrigine,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et ainsi que $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$`
          if (context.isAmc) {
            texteAMC = `Valeur de $a$ dans $${nomFonction}(x)=ax+b$`
            valeurAMC = coefficient
            texte2AMC = `Valeur de $b$ dans $${nomFonction}(x)=ax+b$`
            valeur2AMC = ordonneeOrigine
            texte3AMC = 'Vos calculs et votre réponse<br>'
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: `${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}`,
              },
            })
          }
          break
        case 'expressionParGraphique2':
          {
            let coefficientString
            let denCoefficient = randint(2, 6)
            let numCoefficient = randint(-7, 7, [0, denCoefficient])
            while (
              new FractionEtendue(numCoefficient, denCoefficient).estEntiere
            ) {
              denCoefficient = randint(2, 6)
              numCoefficient = randint(-7, 7, [0, denCoefficient])
            }

            if (coeffRationnel) {
              // on redéfinit le coefficient et les images pour ce cas de figure
              coefficient = new FractionEtendue(
                numCoefficient,
                denCoefficient,
              ).simplifie()
              coefficientString = (coefficient as FractionEtendue).texFSD
            } else {
              coefficient = randint(-4, 4, 0)
              coefficientString = coefficient.toString()
            }

            const antecedent2 = randint(-4, 4, [-1, 0, 1]) * denCoefficient
            const antecedent0 =
              randint(Math.abs(antecedent2), 8, [-1, 0, 1]) * denCoefficient
            const ordonneeOrigine = randint(-10, 10, 0)
            const image2 = coeffRationnel
              ? (coefficient as FractionEtendue)
                  .multiplieEntier(antecedent2)
                  .ajouteEntier(ordonneeOrigine)
              : (coefficient as number) * antecedent2 + ordonneeOrigine
            const image2String = coeffRationnel
              ? (image2 as FractionEtendue).texFraction
              : image2
            const image0 = coeffRationnel
              ? (coefficient as FractionEtendue)
                  .multiplieEntier(antecedent0)
                  .ajouteEntier(ordonneeOrigine)
              : (coefficient as number) * antecedent0 + ordonneeOrigine
            const image0String = coeffRationnel
              ? (image0 as FractionEtendue).texFraction
              : image0
            const diffImage0Image2 = coeffRationnel
              ? (image0 as FractionEtendue).sommeFraction(
                  (image2 as FractionEtendue).oppose(),
                ).texFraction
              : (image0 as number) - (image2 as number)

            xUnite = tableauEchelleX[0][1]
            xThickDistance = tableauEchelleX[0][2]
            xThickMin = -tableauEchelleX[0][0] - xThickDistance
            for (
              let k = 1;
              Math.abs(antecedent0) > tableauEchelleX[k - 1][0];
              k++
            ) {
              if (k >= tableauEchelleX.length) break
              xUnite = tableauEchelleX[k][1]
              xThickDistance = tableauEchelleX[k][2]
              xThickMin = -tableauEchelleX[k][0] - xThickDistance
            }
            yUnite = tableauEchelleY[0][1]
            yThickDistance = tableauEchelleY[0][2]
            yThickMin = -tableauEchelleY[0][0] - yThickDistance
            for (
              let k = 1;
              Math.max(Math.abs(image0 as number), Math.abs(ordonneeOrigine)) >
              tableauEchelleY[k - 1][0];
              k++
            ) {
              if (k >= tableauEchelleY.length) break
              yUnite = tableauEchelleY[k][1]
              yThickDistance = tableauEchelleY[k][2]
              yThickMin = -tableauEchelleY[k][0] - yThickDistance
            }
            const xMin = xThickMin
            const xMax = -xThickMin + xThickDistance
            const yMin = yThickMin
            const yMax = -yThickMin
            const xmin = xMin * xUnite - 1
            const ymin = yMin * yUnite - 1
            const xmax = xMax * xUnite + 1
            const ymax = yMax * yUnite + 1
            const r = repere({
              xUnite,
              yUnite,
              xMin,
              yMin,
              xMax,
              yMax,
              xThickDistance,
              yThickDistance,
              yLabelEcart: 0.8,
              grille: false,
            })
            const origine = pointAbstrait(0, ordonneeOrigine * yUnite)
            const M = pointAbstrait(
              antecedent0 * xUnite,
              (image0 as number) * yUnite,
            )
            const d = droite(origine, M)
            const t = tracePoint(M)
            const projeteX = pointAbstrait(M.x, 0)
            const projeteY = pointAbstrait(0, M.y)
            const pointilles = polyline([projeteY, M, projeteX], 'red')
            pointilles.pointilles = 2
            pointilles.epaisseur = 1
            // const coordonnees = texteParPoint(`(${antecedent0};${image0String})`, pointAbstrait(M.x + 0.2, M.y), 0, 'black', 1, 'gauche')
            const coordonnees = latexParPoint(
              `(${antecedent0};${image0String})`,
              pointAbstrait(M.x + 0.2, M.y),
              'black',
              12,
              20,
              '',
            )
            const N = pointAbstrait(
              antecedent2 * xUnite,
              coeffRationnel
                ? (image2 as FractionEtendue).valeurDecimale * yUnite
                : (image2 as number) * yUnite,
            )
            const u = tracePoint(N)
            const projeteNX = pointAbstrait(N.x, 0)
            const projeteNY = pointAbstrait(0, N.y)
            const pointillesN = polyline(
              [projeteNY, N, projeteNX],
              bleuMathalea,
            )
            pointilles.pointilles = 2
            pointilles.epaisseur = 1
            const positionCoord = antecedent2 < 0 ? N.x - 0.5 : N.x + 0.5
            // const orientationCoord = antecedent2 < 0 ? 'droite' : 'gauche'
            const coordonneesN = coeffRationnel
              ? latexParPoint(
                  `(${stringNombre(antecedent2)};${image2String})`,
                  pointAbstrait(positionCoord, N.y),
                  'black',
                  12,
                  20,
                  '',
                )
              : latexParPoint(
                  `(${antecedent2};${image2String})`,
                  pointAbstrait(positionCoord, N.y),
                  'black',
                  12,
                  20,
                  '',
                )
            texte += `La droite représentant la fonction affine $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0String})$ et par le point de coordonnées $(${stringNombre(antecedent2)};${image2String})$.<br>`
            texte += `Donner l'expression de  $${nomFonction}(x)$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: `<br>$${nomFonction}(x)=$`,
              },
            )
            texte += '<br>'
            texte += mathalea2d(
              {
                scale: 0.6,
                xmin,
                ymin,
                xmax,
                ymax,
              },
              r,
              d,
              t,
              coordonnees,
              pointilles,
              u,
              coordonneesN,
              pointillesN,
            )
            texteCorr += `La fonction $${nomFonction}(x)=ax+b$ est telle que `
            if (antecedent2 - antecedent0 > 0) {
              texteCorr += `$a=\\dfrac{f(${stringNombre(antecedent2)})-f(${antecedent0})}{${stringNombre(antecedent2)}-${ecritureParentheseSiNegatif(antecedent0)}}=\\dfrac{${image2String}-${ecritureParentheseSiNegatif(image0)}}{${antecedent2 - antecedent0}}=\\dfrac{${(image2 as number) - (image0 as number)}}{${antecedent2 - antecedent0}}=${coefficientString}$.<br>`
            } else {
              texteCorr += `$a=\\dfrac{f(${antecedent0})-f(${stringNombre(antecedent2)})}{${antecedent0}-${ecritureParentheseSiNegatif(antecedent2)}}=\\dfrac{${image0String}-${ecritureParentheseSiNegatif(image2)}}{${antecedent0 - antecedent2}}=\\dfrac{${diffImage0Image2}}{${antecedent0 - antecedent2}}=${coefficientString}$.<br>`
            }
            texteCorr += `On en déduit que $${nomFonction}(x)=${coefficientString}x+b$.<br>`
            texteCorr += `Comme $${nomFonction}(${antecedent0})=${image0String}$, on a $${coefficientString}\\times ${ecritureParentheseSiNegatif(antecedent0)}+b=${image0String}$ et par suite `
            texteCorr += coeffRationnel
              ? `$b=${image0String}${(coefficient as FractionEtendue).multiplieEntier(-1).ecritureAlgebrique}\\times ${ecritureParentheseSiNegatif(antecedent0)}=${ordonneeOrigine}$.<br>`
              : `$b=${image0String}${ecritureAlgebrique(-coefficient)}\\times ${ecritureParentheseSiNegatif(antecedent0)}=${ordonneeOrigine}$.<br>`
            texteCorr += `D'où $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$`
            if (context.isAmc) {
              texteAMC = `Valeur de $a$ dans $${nomFonction}(x)=ax+b$`
              valeurAMC = coefficient
              texte2AMC = `Valeur de $b$ dans $${nomFonction}(x)=ax+b$`
              valeur2AMC = ordonneeOrigine
              texte3AMC = 'Vos calculs et votre réponse<br>'
            } else {
              handleAnswers(this, i, {
                reponse: {
                  value: `${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}`,
                },
              })
            }
          }
          break
        case 'expressionParValeurs2': {
          texte += `Soit $${nomFonction}$ la fonction affine telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$ et $${nomFonction}(${antecedent})=${imageString}$.<br>`
          texte += `Donner l'expression de  $${nomFonction}(x)$.`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
            {
              texteAvant: `<br>$${nomFonction}(x)=$`,
            },
          )
          texteCorr += `La fonction $${nomFonction}(x)=ax+b$ est telle que `
          if (antecedent - antecedent0 > 0) {
            if (coeffRationnel) {
              texteCorr += `$a=\\dfrac{f(${antecedent})-f(${antecedent0})}{${antecedent}-${ecritureParentheseSiNegatif(antecedent0)}}=\\dfrac{${imageString}-${ecritureParentheseSiNegatif(image0)}}{${antecedent - antecedent0}}=\\dfrac{${imageString}-${new FractionEtendue(image0 * (image as FractionEtendue).den, (image as FractionEtendue).den).ecritureParentheseSiNegatif}}{${antecedent - antecedent0}}=\\dfrac{${(image as FractionEtendue).ajouteEntier(-image0).texFraction}}{${antecedent - antecedent0}}=${(image as FractionEtendue).ajouteEntier(-image0).texFraction}\\times \\dfrac{1}{${antecedent - antecedent0}}=${coefficientString}$.<br>`
            } else {
              texteCorr += `$a=\\dfrac{f(${antecedent})-f(${antecedent0})}{${antecedent}-${ecritureParentheseSiNegatif(antecedent0)}}=\\dfrac{${imageString}-${ecritureParentheseSiNegatif(image0)}}{${antecedent - antecedent0}}=\\dfrac{${(image as number) - image0}}{${antecedent - antecedent0}}=${coefficientString}$.<br>`
            }
          } else {
            if (coeffRationnel) {
              texteCorr += `$a=\\dfrac{f(${antecedent0})-f(${antecedent})}{${antecedent0}-${ecritureParentheseSiNegatif(antecedent)}}=\\dfrac{${image0}-${(image as FractionEtendue).ecritureParentheseSiNegatif}}{${antecedent0 - antecedent}}=\\dfrac{${new FractionEtendue(image0 * (image as FractionEtendue).den, (image as FractionEtendue).den).texFraction}-${(image as FractionEtendue).ecritureParentheseSiNegatif}}{${antecedent0 - antecedent}}=\\dfrac{${(image as FractionEtendue).multiplieEntier(-1).ajouteEntier(image0).texFraction}}{${antecedent0 - antecedent}}=${(image as FractionEtendue).multiplieEntier(-1).ajouteEntier(image0).texFraction}\\times \\dfrac{1}{${antecedent0 - antecedent}}=${coefficientString}$.<br>`
            } else {
              texteCorr += `$a=\\dfrac{f(${antecedent0})-f(${antecedent})}{${antecedent0}-${ecritureParentheseSiNegatif(antecedent)}}=\\dfrac{${image0}-${ecritureParentheseSiNegatif(image)}}{${antecedent0 - antecedent}}=\\dfrac{${image0 - (image as number)}}{${antecedent0 - antecedent}}=${coefficientString}$.<br>`
            }
          }
          texteCorr += `On en déduit que $${nomFonction}(x)=${coefficientString}x+b$.<br>`
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${image0}$, on a $${coefficientString}\\times ${ecritureParentheseSiNegatif(antecedent0)}+b=${image0}$ et par suite `
          if (coefficient !== undefined) {
            texteCorr += coeffRationnel
              ? `$b=${image0}${(coefficient as FractionEtendue).multiplieEntier(-1).ecritureAlgebrique}\\times ${ecritureParentheseSiNegatif(antecedent0)}=${ordonneeOrigine}$.<br>`
              : `$b=${image0}${ecritureAlgebrique(-coefficient)}\\times ${ecritureParentheseSiNegatif(antecedent0)}=${ordonneeOrigine}$.<br>`
          }
          texteCorr += `D'où $${nomFonction}(x)=${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}$`
          if (context.isAmc) {
            texteAMC = `Valeur de $a$ dans $${nomFonction}(x)=ax+b$`
            valeurAMC = coefficient
            texte2AMC = `Valeur de $b$ dans $${nomFonction}(x)=ax+b$`
            valeur2AMC = ordonneeOrigine
            texte3AMC = 'Vos calculs et votre réponse<br>'
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: `${coefficientString}x${ecritureAlgebrique(ordonneeOrigine)}`,
              },
            })
          }

          break
        }
      }

      const JCAMC = false || texte2AMC !== '' // Si besoin de prendre en compte une info supplémentaire avant les cases à cocher dans AMC
      if (coefficient !== undefined) {
        coefficient = 0
      }
      if (
        this.questionJamaisPosee(i, coefficient, antecedent0, image0) &&
        Math.abs(image0) > 1
      ) {
        if (context.isAmc) {
          elementAmc.propositions = [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    display: {
                      label: JCAMC ? texteAMC : '',
                      labelPosition: 'left',
                    },
                    valeur: valeurAMC,
                    param: {
                      signe: true,
                      digits: 2, // Ainsi, les réponses décimales auront toujours 2 digits et les réponses fractionnaires auront 2 digits pour le numérateur ET le dénominateur.
                    },
                  },
                },
              ],
            },
          ]
          if (texte2AMC !== '' && elementAmc.propositions != null) {
            elementAmc.propositions.push(
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    reponse: {
                      display: {
                        label: texte2AMC,
                        labelPosition: 'left',
                      },
                      valeur: valeur2AMC,
                      param: {
                        signe: true,
                        digits: 2, // Ainsi, les réponses décimales auront toujours 2 digits et les réponses fractionnaires auront 2 digits pour le numérateur ET le dénominateur.
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 3,
                    enonce: texte3AMC,
                  },
                ],
              },
            )
          }
          elementAmc.enonce = texte + '\\\\'
          elementAmc.enonceAvant = false
          elementAmc.enonceApresNumQuestion = true
          elementAmc.propositions![0].propositions![0].texte = texteCorr
          elementAmc.options = { multicolsAll: true }
          this.autoCorrectionAMC[i] = elementAmc
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')
        const pointFinal = /\.\s*$/.test(aRemplacer)
        aRemplacer = aRemplacer.replace(/\.\s*$/, '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$${pointFinal ? '.' : ''}`
        // Fin de cette uniformisation typesDeQuestionsDisponibles
        if (
          typesDeQuestionsDisponibles.indexOf(
            listeTypesDeQuestions[i].toString(),
          ) > 2
        )
          texteCorr += '.'
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
