import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import type { AutoCorrectionAMC } from '../../lib/amc/amcTypes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, rangeMinMax } from '../../lib/outils/nombres'
import { pgcd, premierAvec } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Étudier des fonctions linéaires'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '13/04/2023'
export const dateDeModifImportante = '16/05/2024'

export const refs = {
  'fr-fr': ['3F20'],
  'fr-ch': ['11CTFA2D-1', '11LCFA2D-1', '11LSFA2D-1', 'PRQPF01C-1'],
}
export const uuid = 'aeb5a'
/**
 * Questions sur les fonctions linéaires
 * @author Jean-claude Lhote
 */
export default class FonctionsLineaires extends Exercice {
  lycee: boolean
  constructor() {
    super()

    this.comment = `L'exercice propose différents types de questions sur les fonctions linéaires :<br>
calcul d'image, calcul d'antécédent ou détermination du coefficient.<br>
Ce coefficient peut être au choix entier relatif ou rationnel relatif.<br>
Certaines questions de calcul d'image nécessitent le calcul du coefficient au préalable.<br>
Le choix a été fait d'un antécédent primaire entier positif, le coefficient étant négatif avec une probabilité de 50${sp()}%.<br>`
    this.sup = 1 // coefficient entier relatif
    this.nbQuestions = 8
    this.sup2 = '9'
    this.lycee = false
    this.besoinFormulaireNumerique = [
      'Coefficient : ',
      3,
      '1: Coefficient entier\n2: Coefficient rationnel\n3: Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1: Image par expression\n2: Image par valeurs\n3: Image par graphique\n4: Antécédent par expression\n5: Antécédent par valeurs\n6: Antécédent par graphique\n7: Expression par valeurs\n8: Expression par graphique\n9: Mélange',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'imageParExpression',
      'imageParValeurs',
      'imageParGraphique',
      'antecedentParExpression',
      'antecedentParValeurs',
      'antecedentParGraphique',
      'expressionParValeurs',
      'expressionParGraphique',
    ]
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 8,
      defaut: 9,
      nbQuestions: this.nbQuestions,
      listeOfCase: typesDeQuestionsDisponibles,
      melange: 9,
    })
    this.sup = contraindreValeur(1, 3, this.sup, 1)
    const listeTypeDeCoeff =
      this.sup === 1
        ? combinaisonListes([1], this.nbQuestions)
        : this.sup === 2
          ? combinaisonListes([2], this.nbQuestions)
          : combinaisonListes([1, 2], this.nbQuestions)
    const antecedents = []
    for (
      let i = 0, texteAMC, valeurAMC, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const elementAmc: AutoCorrectionAMC = {}
      const nomFonction = String.fromCharCode(102 + i)
      let texte = ''
      let texteCorr = ''
      // valeur associée à image0 pour le calcul de coefficient : image0 = coefficient * antecedent0
      // on retrouve ces valeurs antecedent0 et image0 dans l'énoncé pour certaines questions.
      // ce sont antecedent et image qui seront à calculer.
      const antecedent0 = 2 * randint(2, 10) + 1
      let coefficient, image
      switch (listeTypeDeCoeff[i]) {
        case 1:
          coefficient = randint(2, 10) * choice([-1, 1])
          break
        case 2:
          coefficient = new FractionEtendue(
            premierAvec(antecedent0, antecedents, false) * choice([-1, 1]),
            antecedent0,
          )
          break
      }

      let imageString
      let formatInteractif: 'calcul' | 'fractionEgale'
      //
      const antecedent = choice(
        rangeMinMax(-10, 10, [antecedent0, 0, 1, -1, 2 * antecedent0]),
      )

      const image0 =
        coefficient instanceof FractionEtendue
          ? coefficient.num
          : (coefficient as number) * antecedent0
      if (coefficient instanceof FractionEtendue) {
        image = coefficient.multiplieEntier(antecedent)
        imageString = (image as FractionEtendue).texFSD
        formatInteractif = 'fractionEgale'
      } else {
        image = (coefficient as number) * antecedent
        imageString = texNombre(image, 0)
        formatInteractif = 'calcul'
      }
      antecedents.push(antecedent, antecedent0)
      const coefficientString =
        coefficient instanceof FractionEtendue
          ? coefficient.simplifie().texFSD
          : (coefficient as number).toString()
      let xUnite, yUnite, xThickDistance, yThickDistance, xThickMin, yThickMin
      const tableauEchelleX = [
        [5, 1, 1],
        [10, 0.5, 2],
        [20, 0.25, 4],
        [50, 0.1, 10],
        [100, 0.05, 20],
      ]
      const tableauEchelleY = [
        [5, 1, 1],
        [10, 0.5, 2],
        [20, 0.25, 4],
        [50, 0.1, 10],
        [100, 0.05, 20],
        [200, 0.025, 40],
        [500, 0.01, 100],
      ]
      xUnite = tableauEchelleX[0][1]
      xThickDistance = tableauEchelleX[0][2]
      xThickMin = -tableauEchelleX[0][0] - xThickDistance
      for (let k = 1; Math.abs(antecedent0) > tableauEchelleX[k - 1][0]; k++) {
        xUnite = tableauEchelleX[k][1]
        xThickDistance = tableauEchelleX[k][2]
        xThickMin = -tableauEchelleX[k][0] - xThickDistance
      }
      yUnite = tableauEchelleY[0][1]
      yThickDistance = tableauEchelleY[0][2]
      yThickMin = -tableauEchelleY[0][0] - yThickDistance
      for (let k = 1; Math.abs(image0) > tableauEchelleY[k - 1][0]; k++) {
        yUnite = tableauEchelleY[k][1]
        yThickDistance = tableauEchelleY[k][2]
        yThickMin = -tableauEchelleY[k][0] - yThickDistance
      }
      const xMin = xThickMin
      const xMax = -xThickMin + xThickDistance + 5
      const yMin = yThickMin
      const yMax = -yThickMin
      const xmin = xMin * xUnite
      const ymin = yMin * yUnite
      const xmax = xMax * xUnite + 0.5
      const ymax = yMax * yUnite + 0.5
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
      const origine = pointAbstrait(0, 0)
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
        pointAbstrait(M.x + 0.7, M.y + (abs(M.y) / M.y) * 0.0),
        0,
        'black',
        1,
        'gauche',
      )
      switch (listeTypesDeQuestions[i]) {
        // On détermine l'image à partir de l'expression générale de la fonction
        case 'imageParExpression':
          texte += `Soit $${nomFonction}(x)=${coefficient instanceof FractionEtendue ? coefficient.texFSD : texNombre(coefficient as number)}x$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `$${nomFonction}(${texNombre(antecedent, 0)})=${coefficient instanceof FractionEtendue ? coefficient.texFSD : texNombre(coefficient as number, 0)} \\times ${ecritureParentheseSiNegatif(antecedent)}`
          texteCorr += `=${coefficient instanceof FractionEtendue ? (image as FractionEtendue).texFSD : texNombre(image, 0)}$`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else
            handleAnswers(this, i, {
              reponse: {
                value: image,
                options:
                  formatInteractif === 'fractionEgale'
                    ? { fractionEgale: true }
                    : {},
              },
            })
          break
        case 'imageParValeurs':
          texte += `Soit $${nomFonction}$ la fonction linéaire telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ de $${nomFonction}(x)=ax$ vérifie $a\\times ${antecedent0} = ${image0}$.<br>`
          texteCorr += `On en déduit $a=\\dfrac{${texNombre(image0, 0)}}{${antecedent0}}`
          if (pgcd(image0, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$ et par suite $${nomFonction}(x)=${coefficientString}x$.<br>`
          texteCorr += `Donc $${nomFonction}(${texNombre(antecedent, 0)})=${coefficient instanceof FractionEtendue ? coefficient.texFSD : texNombre(coefficient as number, 0)} \\times ${ecritureParentheseSiNegatif(antecedent)}`
          texteCorr += `=${coefficient instanceof FractionEtendue ? (image as FractionEtendue).texFSD : texNombre(image, 0)}$.`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else
            handleAnswers(this, i, {
              reponse: {
                value: image,
                options:
                  formatInteractif === 'fractionEgale'
                    ? { fractionEgale: true }
                    : {},
              },
            })
          break
        case 'imageParGraphique':
          texte += `La droite représentant la fonction linéaire $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$.<br>`
          texte += `Calculer l'image de $${antecedent}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
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
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${image0}$ et $${nomFonction}(x)=ax$ on en déduit $a\\times ${antecedent0} = ${image0}$ soit $a=\\dfrac{${image0}}{${antecedent0}}${coefficient instanceof FractionEtendue ? '' : '=' + coefficientString}$.<br>`
          texteCorr += `Ainsi $${nomFonction}(${antecedent})=${coefficientString}\\times ${ecritureParentheseSiNegatif(antecedent)}=${imageString}$.`
          if (context.isAmc) {
            texteAMC = `image de $${antecedent}$ par $${nomFonction}$`
            valeurAMC = image
          } else
            handleAnswers(this, i, {
              reponse: {
                value: image,
                options:
                  formatInteractif === 'fractionEgale'
                    ? { fractionEgale: true }
                    : {},
              },
            })
          break
        case 'antecedentParExpression':
          texte += `Soit $${nomFonction}(x)=${coefficient instanceof FractionEtendue ? coefficient.texFSD : texNombre(coefficient as number)}x$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString}\\times b=${imageString}$.<br>`
          if (coefficient instanceof FractionEtendue) {
            texteCorr += `Donc $b=\\dfrac{${(image as FractionEtendue).texFSD}}{${coefficientString}}=`
            texteCorr += `${(image as FractionEtendue).texFSD}\\times ${coefficient.inverse().texFSP}=`
          } else {
            texteCorr += `Donc $b=\\dfrac{${texNombre(image, 0)}}{${coefficientString}}=`
          }
          texteCorr += `${antecedent}$.`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'antecedentParValeurs':
          texte += `Soit $${nomFonction}$ la fonction linéaire telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
                  ? KeyboardType.clavierDeBaseAvecFraction
                  : KeyboardType.clavierDeBase,
                { texteAvant: ' :' },
              )
            : '.'
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ de $${nomFonction}(x)=ax$ vérifie $a\\times ${antecedent0} = ${image0}$.<br>`
          texteCorr += `$a=\\dfrac{${texNombre(image0, 0)}}{${antecedent0}}`
          if (pgcd(image0, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$.<br>Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString} \\times b=${imageString}$.<br>`
          texteCorr += `On en déduit que $b=\\dfrac{${imageString}}{${coefficientString}}=`
          if (coefficient instanceof FractionEtendue) {
            texteCorr += `${imageString}\\times ${coefficient.inverse().texFSP}=`
          }
          texteCorr += `${antecedent}$.`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'antecedentParGraphique':
          texte += `La droite représentant la fonction linéaire $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$.<br>`
          texte += `Calculer l'antécédent de $${imageString}$ par $${nomFonction}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                coefficient instanceof FractionEtendue
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
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${image0}$ alors $${nomFonction}(x)=\\dfrac{${image0}}{${antecedent0}}x`
          if (pgcd(image0, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}x`
          }
          texteCorr += `$<br>Posons $b$ l'antécédent de $${imageString}$, alors $${nomFonction}(b)=${coefficientString}\\times b=${imageString}$.<br>`
          texteCorr += `On en déduit que $b=\\dfrac{${imageString}}{${coefficientString}}=`
          if (coefficient instanceof FractionEtendue) {
            texteCorr += `${imageString}\\times ${coefficient.inverse().texFSP}=`
          }
          texteCorr += `${antecedent}$.`
          if (context.isAmc) {
            texteAMC = `antécédent de $${imageString}$ par $${nomFonction}$`
            valeurAMC = antecedent
          } else handleAnswers(this, i, { reponse: { value: antecedent } })
          break
        case 'expressionParValeurs':
          texte += `Soit $${nomFonction}$ la fonction linéaire telle que $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$.<br>`
          if (context.isAmc) {
            texte += `Donner le coefficient de  $${nomFonction}$.`
          } else {
            texte += `Donner l'expression de  $${nomFonction}(x)$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: `<br>$${nomFonction}(x)=$`,
              },
            )
          }
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ de $${nomFonction}(x)=ax$ vérifie $a\\times ${antecedent0} = ${image0}$.<br>`
          texteCorr += `Soit $a=\\dfrac{${texNombre(image0, 0)}}{${antecedent0}}`
          if (pgcd(image0, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$.<br>Donc $${nomFonction}(x)=${coefficientString}x$.`
          if (context.isAmc) {
            texteAMC = `coefficient de $${nomFonction}$ : valeur de $a$ dans $${nomFonction}(x)=ax$`
            valeurAMC = coefficient
          } else {
            handleAnswers(this, i, {
              reponse: { value: `${coefficientString}x` },
            })
          }
          break
        case 'expressionParGraphique':
          texte += `La droite représentant la fonction linéaire $${nomFonction}$ passe par le point de coordonnées $(${antecedent0};${image0})$.<br>`
          if (context.isAmc) {
            texte += `Donner le coefficient de  $${nomFonction}$.`
          } else {
            texte += `Donner l'expression de  $${nomFonction}(x)$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: `<br>$${nomFonction}(x)=$`,
              },
            )
          }
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
          texteCorr += `Comme $${nomFonction}(${antecedent0})=${texNombre(image0, 0)}$, le coefficient $a$ de $${nomFonction}(x)=ax$ est :<br>`
          texteCorr += `$a=\\dfrac{${texNombre(image0, 0)}}{${antecedent0}}`
          if (pgcd(image0, antecedent0) !== 1) {
            const simplification = new FractionEtendue(
              image0,
              antecedent0,
            ).simplifie().texFSD
            texteCorr += `=${simplification}`
          }
          texteCorr += `$.<br>Donc $${nomFonction}(x)=${coefficientString}x$.`
          if (context.isAmc) {
            texteAMC = `Coefficient de $${nomFonction}$ : valeur de $a$ dans $${nomFonction}(x)=ax$`
            valeurAMC = coefficient
          } else {
            handleAnswers(this, i, {
              reponse: { value: `${coefficientString}x` },
            })
          }
          break
      }
      const JCAMC = false // Si besoin de prendre en compte une info supplémentaire avant les cases à cocher dans AMC
      if (typeof coefficient === 'undefined') {
        coefficient = 0
      } // Pour éviter une erreur de compilation
      if (this.questionJamaisPosee(i, coefficient, antecedent0, image0)) {
        if (context.isAmc) {
          elementAmc.propositions = [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: JCAMC ? texteAMC : '',
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
          elementAmc.enonce =
            texte +
            (valeurAMC instanceof FractionEtendue
              ? " On donnera la réponse sous forme d'une fraction irréductible."
              : '') +
            '\\\\'
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
        // Fin de cette uniformisation

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
