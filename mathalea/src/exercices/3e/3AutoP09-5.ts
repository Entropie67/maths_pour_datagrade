import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { lectureImage } from '../../lib/2d/LectureImage'
import { repere } from '../../lib/2d/reperes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Utiliser un graphique pour résoudre un problème de prix'

export const interactifReady = true

export const dateDePublication = '4/01/2026'

export const uuid = '5bc82'

export const refs = {
  'fr-fr': ['3AutoP04-5'],
  'fr-ch': ['11CTFA2H-14', '11LCFA2H-3', '11LSFA2H-3'],
}

const articles = [
  { nom: 'oranges', det: "d'", prix: [1.2, 1.3, 1.4, 1.5] },
  { nom: 'pommes', det: 'de ', prix: [1.5, 1.6, 1.7, 1.8] },
  { nom: 'bananes', det: 'de ', prix: [1.1, 1.2, 1.3, 1.4] },
  { nom: 'ananas', det: "d'", prix: [2.5, 2.6, 2.7, 2.8] },
  { nom: 'cerises', det: 'de ', prix: [3.0, 3.2, 3.4, 3.6] },
]

/**
 * @author Jean-claude Lhote
 */
export default class ProblemeDePrix extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsDeComparaison = { estDansIntervalle: true }
  }

  nouvelleVersion(): void {
    const articleChoisi = choice(articles)
    const prixUnitaire = choice(articleChoisi.prix)
    const quantite1 = randint(11, 30) / 10
    const prixMax = Math.ceil(prixUnitaire * 3.5)
    const p = (x: number) => prixUnitaire * x
    const q = (y: number) => y / prixUnitaire
    const prix1 = arrondi(p(quantite1), 1)
    const prix2 = randint(11, Math.floor(prixUnitaire * 15)) / 5
    const quantite2 = arrondi(q(prix2), 1)

    const rep = repere({
      xMin: 0,
      xMax: 4,
      yMin: 0,
      yMax: prixMax,
      xUnite: 4,
      yUnite: 1,
      yThickDistance: 1,
      yLabelDistance: 2,
      xThickDistance: 0.5,
      xLabelDistance: 1,
      grilleXDistance: 2,
      grilleYDistance: 1,
      grilleSecondaireY: true,
      grilleSecondaireYDistance: 0.2,
      grilleSecondaireX: true,
      grilleSecondaireXDistance: 0.4,
      xLegende: 'Masse (kg)',
      yLegende: 'Prix (€)',
      yLegendePosition: [0.2, prixMax + 0.5],
      xLegendePosition: [15, -0.5],
    })
    const cP = courbe(p, {
      repere: rep,
      xMin: 0,
      xMax: 4,
      color: 'black',
      epaisseur: 1.5,
    })

    const objets: NestedObjetMathalea2dArray = [rep, cP]
    const graphique = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline-block', pixelsParCm: 20 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    const choix = choice([true, false])
    const objetsCorr = [
      ...objets,
      choix
        ? lectureImage(quantite1 * 4, prix1)
        : lectureAntecedent(quantite2 * 4, prix2, 1, 1, 'red', '', ''),
    ]
    const graphiqueCorrige = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline-block', pixelsParCm: 20 } as const,
        fixeBordures(objetsCorr),
      ),
      objetsCorr,
    )
    this.question = `${graphique}<br><br>
    Sur le graphique ci-dessus, on a représenté le prix en euros en fonction de la masse en kilogrammes ${articleChoisi.det}${articleChoisi.nom} achetés.<br>`

    this.question += choix
      ? `Quel est le prix à payer pour l'achat de $${texNombre(quantite1, 1)}$ kg ${articleChoisi.det}${articleChoisi.nom} ?`
      : `Quelle masse ${articleChoisi.det}${articleChoisi.nom} peut-on acheter avec $${texNombre(prix2, 2, true)}$ € ?`

    this.reponse = choix
      ? `[${texNombre(prix1 - 0.2, 2, true)}; ${texNombre(prix1 + 0.2, 2, true)}]`
      : `[${texNombre(quantite2 - 0.1, 1, true)}; ${texNombre(quantite2 + 0.1, 1, true)}]`

    this.correction =
      `${graphiqueCorrige}<br><br>` +
      (choix
        ? `Le prix à payer pour l'achat de $${texNombre(quantite1, 1)}$ kg ${articleChoisi.det}${articleChoisi.nom} est de $${miseEnEvidence(choix ? texNombre(prix1, 2, true) : texNombre(quantite2, 1, true))}$ €.`
        : `Avec $${texNombre(prix2, 2)}$ €, on peut acheter $${miseEnEvidence(texNombre(quantite2, 1, true))}$ kg ${articleChoisi.det}${articleChoisi.nom}.`)
    this.optionsChampTexte = choix ? { texteApres: '€' } : { texteApres: ' kg' }
  }
}
