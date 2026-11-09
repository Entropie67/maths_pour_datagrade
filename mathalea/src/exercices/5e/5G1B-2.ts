import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { creerCouples, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { enumeration } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, range } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer les coordonnées (relatives) d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '30/10/2026'

/**
 * Lire les coordonnées d'un point du plan avec une précision allant de l'unité à 0,25.
 * @author Jean-claude Lhote - Éric Elter (pour l'interactivité)
 */
export const uuid = 'ab969'

export const refs = {
  'fr-fr': ['5G1B-2', '3AutoG01'],
  'fr-2016': ['5R12-2', '3AutoG01-2'],
  'fr-ch': ['9R1ES5A-2', '9R2ES5A-2', '9R3ES5A-2', 'PRQPF02A-3'],
}
function bareme(listePoints: number[]): [number, number] {
  let points = 0
  const nbPoints = listePoints.length / 2
  for (let i = 0; i < nbPoints; i++) {
    const indexBase = i * 2
    const x = listePoints[indexBase]
    const y = listePoints[indexBase + 1]
    points += x * y
  }
  return [points, nbPoints]
}
export default class ReperagePointDuPlan extends Exercice {
  quartDePlan: boolean
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      "1 : Coordonnées entières\n2 : Coordonnées 'en demis'\n3 : Coordonnées 'en quarts'",
    ]
    this.besoinFormulaire2CaseACocher = [
      'Grille pour les demis ou pour les quarts',
    ]
    this.besoinFormulaire3Numerique = ['Nombre de points (entre 1 et 5)', 5]
    this.besoinFormulaire4CaseACocher = [
      'Avec forcément un point sur un axe',
      true,
    ]
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 1
    this.sup2 = true
    this.sup3 = 5
    this.sup4 = true
    this.quartDePlan = false
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    let texte, texteCorr
    const forcerPointSurAxe = this.sup4

    let listePoints = []
    const points: PointAbstrait[] = []
    let xmin, xmax, ymin, ymax
    const k = Math.pow(2, this.sup - 1)
    const nom: string[] = []
    const objets2d = []
    const nbPoints = contraindreValeur(1, 5, this.sup3, 5)
    if (this.quartDePlan) {
      xmin = 0
      ymin = 0
      xmax = 10
      ymax = 10
    } else {
      xmin = -5
      ymin = -5
      xmax = 5
      ymax = 5
    }
    const listeAbs = []
    const listeOrd = []
    for (
      let i = arrondi(xmin + 1 / k);
      i < arrondi(xmax - (this.sup - 1) / k);
      i = arrondi(i + 1 / k)
    ) {
      listeAbs.push(i)
    }
    for (
      let i = arrondi(ymin + 1 / k);
      i < arrondi(ymax - (this.sup - 1) / k);
      i = arrondi(i + 1 / k)
    ) {
      listeOrd.push(i)
    }
    let X0 = false
    let Y0 = false
    listePoints = creerCouples(listeAbs, listeOrd, 10 * k, true)
    for (let l = 0, lettre = randint(1, 20); l < 5; l++) {
      nom.push(lettreDepuisChiffre(l + lettre))
    }
    for (let j = 0; j < nbPoints; j++) {
      points.push(
        pointAbstrait(
          listePoints[j][0],
          listePoints[j][1],
          nom[j],
          'above left',
        ),
      )
      if (points[j].x === 0) {
        X0 = true
      }
      if (points[j].y === 0) {
        Y0 = true
      }
    }
    if (!X0 && forcerPointSurAxe) {
      points[0].x = 0
    }
    if (!Y0 && nbPoints > 1 && forcerPointSurAxe) {
      points[1].y = 0
    }
    shuffle2tableaux(points, nom)

    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: '',
        enonceAvant: false,
        enonceApresNumQuestion: true,
        options: { barreseparation: true },
        propositions: [],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }

    texte =
      nbPoints > 1
        ? 'Déterminer les coordonnées respectives des points '
        : 'Déterminer les coordonnées du point '
    texte += enumeration(range(nbPoints - 1).map((i) => `$${nom[i]}$`))
    texte += '.<br>'

    texteCorr =
      nbPoints > 1
        ? 'Les coordonnées respectives des points sont :<br>'
        : 'Les coordonnées du point sont :<br>'
    texteCorr += enumeration(
      range(nbPoints - 1).map(
        (i) =>
          `$${nom[i]}(${miseEnEvidence(texNombre(points[i].x))}\\;;\\;${miseEnEvidence(texNombre(points[i].y))})$`,
      ),
    )
    texteCorr += '.'
    this.listeReponsesCourtes[0] = range(nbPoints - 1)
      .map(
        (i) =>
          `$${nom[i]}(${miseEnEvidence(texNombre(points[i].x))}\\;;\\;${miseEnEvidence(texNombre(points[i].y))})$`,
      )
      .join(' ; ')

    if (context.isAmc) {
      for (let i = 0; i < nbPoints; i++) {
        this.autoCorrectionAMC[0].propositions!.push(
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                multicolsBegin: true,
                reponse: {
                  texte: `Abscisse de $${nom[i]}$ :`,
                  valeur: points[i].x,
                  param: {
                    digits: 1,
                    decimals: this.sup - 1,
                    signe: !this.quartDePlan,
                    approx: 0,
                  },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                multicolsEnd: true,
                reponse: {
                  texte: `Ordonnée de $${nom[i]}$ :`,
                  valeur: points[i].y,
                  param: {
                    digits: 1,
                    decimals: this.sup - 1,
                    signe: !this.quartDePlan,
                    approx: 0,
                  },
                },
              },
            ],
          },
        )
      }
    }

    if (this.sup2) {
      objets2d.push(
        repere({
          xMin: xmin - 1,
          yMin: ymin - 1,
          xMax: xmax + 1,
          yMax: ymax + 1,
          grilleSecondaire: true,
          grilleSecondaireDistance: 1 / k,
          grilleSecondaireXMin: xmin - 1,
          grilleSecondaireYMin: ymin - 1,
          grilleSecondaireXMax: xmax + 1,
          grilleSecondaireYMax: ymax + 1,
        }),
      )
    } else {
      objets2d.push(
        repere({
          xMin: xmin - 1,
          yMin: ymin - 1,
          xMax: xmax + 1,
          yMax: ymax + 1,
        }),
      )
    }
    for (let i = 0; i < nbPoints; i++) {
      objets2d.push(tracePoint(points[i], 'red'), labelPoint(points[i]))
    }
    texte +=
      '<br>' +
      mathalea2d(
        {
          xmin: xmin - 1,
          ymin: ymin - 1,
          xmax: xmax + 1,
          ymax: ymax + 1,
          pixelsParCm: 30,
          scale: 0.75,
        },
        objets2d,
      )

    if (this.interactif) {
      const dataTemplate = range(nbPoints - 1)
        .map(
          (i) =>
            `$${nom[i]}($%{champ${2 * i + 1}}$;$%{champ${2 * i + 2}}$)$${i % 3 === 2 ? '\n' : ''}`,
        )
        .join(', ')
      interface ChampOption {
        keyboard: string | undefined
      }

      interface ChampReponse {
        value: number
      }
      const dataOptions: Record<string, ChampOption> = {}
      const reponses: Record<string, ChampReponse> = {}
      for (let i = 0; i < nbPoints; i++) {
        dataOptions[`champ${2 * i + 1}`] = {
          keyboard: KeyboardType.clavierDeBaseAvecFraction,
        }
        dataOptions[`champ${2 * i + 2}`] = {
          keyboard: KeyboardType.clavierDeBaseAvecFraction,
        }
        reponses[`champ${2 * i + 1}`] = { value: points[i].x }
        reponses[`champ${2 * i + 2}`] = { value: points[i].y }
      }
      texte += addMultiMathfield(this, 0, {
        dataOptions,
        dataTemplate,
      })
      handleAnswers(
        this,
        0,
        { bareme, ...reponses },
        { formatInteractif: 'multi-mathfield' },
      )
    }

    if (context.isAmc) {
      this.autoCorrectionAMC[0].enonce = texte
    }
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)

    listeQuestionsToContenuSansNumero(this)
  }
}
