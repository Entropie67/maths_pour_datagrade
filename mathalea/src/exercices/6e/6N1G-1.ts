import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { type Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Repérer des nombres décimaux sur une droite graduée'
export const uuid = '50614'
export const refs = {
  'fr-fr': ['6N1G-1', 'BP2AutoN2', '5G1autoB'],
  'fr-2016': ['6N30-0', 'BP2AutoN2'],
  'fr-ch': ['PR-44', '9R1NO2C-7', '9R2NO2C-7', '9R3NO2C-7', 'PRQNO04A-1'],
}
export const interactifReady = true

export const dateDePublication = '26/08/2024'
export const dateDeModifImportante = '15/06/2025'

/**
 * @author Jean-claude Lhote
 */

let listesPas: Array<[number, number][]>

class ReperageEntiersOuDecimaux extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'décimaux'
    this.nbQuestions = 4
    this.sup = 5
    this.sup2 = false
    this.besoinFormulaireTexte = [
      'Types de pas de graduations',
      'Nombres séparés par des tirets :\n1 : Le pas secondaire vaut 0,5 ou 0,1\n2 : Le pas secondaire vaut 1,5 ; 2,5 ; 0,2 ou 0,3\n3 : Un peu plus difficile\n4 : Le pas principal est complexe\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Zéro visible']
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.besoinFormulaire3CaseACocher = ['Avec le mot abscisse']
    this.sup3 = true
  }

  nouvelleVersion() {
    if (this.interactif && this.version !== 'décimaux') {
      this.consigne = texteGras(
        ' Penser, si besoin, à mettre les espaces nécessaires.',
      )
    }
    // Listes de pas [pasPrincipal, Subdivision] selon degré de difficulté
    const nbDecimales = this.version === 'entiers' ? 0 : 3
    listesPas =
      this.version === 'entiers'
        ? [
            [
              // Liste facile
              [2, 2],
              [3, 3],
              [4, 4],
              [5, 5], // ici le pas secondaire vaut 1, les entiers sont consécutifs
            ],
            [
              [4, 2],
              [6, 3],
              [8, 4],
              [10, 5],
              [6, 2],
              [9, 3],
              [8, 2],
              [10, 2], // ici le pas secondaire vaut 2,3,4,5
            ],
            [
              [10, 5],
              [8, 4],
              [200, 4],
              [150, 3],
              [100, 4],
              [12, 2], // Pas secondaire 2,3,50,25,6
            ],
            [
              [45, 5],
              [200, 5],
              [15, 5],
              [200, 8],
              [150, 5],
              [24, 6], // Pas secondaire farfelu
            ],
          ]
        : this.version === 'décimaux'
          ? [
              [
                // Liste facile
                [1, 2],
                [2, 4],
                [5, 2],
                [1, 10],
                [0.1, 10],
                [0.01, 10],
                [4, 8],
              ],
              [
                [3, 2],
                [6, 4],
                [1, 5],
                [2, 10],
                [0.1, 5],
                [0.2, 10],
                [3, 10],
              ],
              [
                [0.01, 5],
                [0.02, 10],
                [0.3, 10],
                [10, 4],
                [5, 4],
              ],
              [
                [0.4, 5],
                [0.6, 3],
                [1.2, 4],
                [1.6, 8],
              ],
            ]
          : [
              // Liste pour c3N11-1
              [
                // Liste facile
                [10, 10],
                [100, 10],
                [1000, 10],
                [10000, 10],
              ],
              [
                [10, 2],
                [100, 2],
                [1000, 2],
                [10000, 2],
              ],
              [
                [10, 5],
                [100, 5],
                [1000, 5],
                [10000, 5],
              ],
              [
                [200, 8],
                [1000, 4],
                [100, 4],
                [1000, 8],
              ],
            ]

    const choix = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
    }).map(Number)
    const listeValeurs: [number, number][] = choix.map((index) =>
      choice(listesPas[index - 1]),
    )
    const distanceGrossesGraduations = 2.5

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const [pasPrincipal, subdivision] = listeValeurs[i]
      const premiereGrosseGraduation = this.sup2
        ? 0
        : randint(2, 15) * pasPrincipal
      const subdivisionsAvantPrincipale = randint(1, subdivision - 1)
      const premiereGraduation = this.sup2
        ? 0
        : premiereGrosseGraduation -
          (pasPrincipal * subdivisionsAvantPrincipale) / subdivision
      const decalageRepere1 = this.sup2
        ? premiereGrosseGraduation
        : premiereGrosseGraduation + randint(1, 3) * pasPrincipal
      const [repere1, repere2] = [
        decalageRepere1,
        decalageRepere1 + pasPrincipal,
      ]
      const xRepere1 =
        ((repere1 - premiereGraduation) * distanceGrossesGraduations) /
        pasPrincipal
      const xRepere2 =
        ((repere2 - premiereGraduation) * distanceGrossesGraduations) /
        pasPrincipal
      const decalagePremiereGrosseGraduation = this.sup2
        ? 0
        : (distanceGrossesGraduations * subdivisionsAvantPrincipale) /
          subdivision
      const nombreATrouver = this.sup2
        ? randint(0, 4) * pasPrincipal +
          (randint(1, subdivision - 1) * pasPrincipal) / subdivision
        : Math.min(
            premiereGraduation +
              randint(0, 5) * pasPrincipal +
              ((randint(1, subdivision - 1) + subdivisionsAvantPrincipale) *
                pasPrincipal) /
                subdivision,
            premiereGraduation +
              pasPrincipal * (5 + (subdivision - 1) / subdivision),
          )
      // fabrication de la droite graduée (faudra peut-être factoriser ça dans un objetMathalea2d() on verra)

      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(15, 0)
      const laDroite = segment(A, B)
      laDroite.styleExtremites = '->'
      // Les graduations principales
      const graduationsPrincipales: Segment[] = []
      for (let g = 0; g < 6; g++) {
        graduationsPrincipales.push(
          segment(
            pointAbstrait(
              decalagePremiereGrosseGraduation + g * distanceGrossesGraduations,
              -0.2,
            ),
            pointAbstrait(
              decalagePremiereGrosseGraduation + g * distanceGrossesGraduations,
              +0.2,
            ),
          ),
        )
      }
      // Les graduations secondaires
      const graduationsSecondaires: Segment[] = []
      if (premiereGraduation !== premiereGrosseGraduation) {
        for (
          let g = premiereGraduation;
          g < premiereGrosseGraduation;
          g += pasPrincipal / subdivision
        ) {
          graduationsSecondaires.push(
            segment(
              pointAbstrait(
                ((g - premiereGraduation) * distanceGrossesGraduations) /
                  pasPrincipal,
                -0.1,
              ),
              pointAbstrait(
                ((g - premiereGraduation) * distanceGrossesGraduations) /
                  pasPrincipal,
                0.1,
              ),
            ),
          )
        }
      }
      for (let g = 0; g < 6; g++) {
        for (let k = 1; k < subdivision; k++) {
          const xGraduation =
            ((premiereGrosseGraduation - premiereGraduation) / pasPrincipal +
              g +
              k / subdivision) *
            distanceGrossesGraduations
          if (xGraduation < B.x) {
            graduationsSecondaires.push(
              segment(
                pointAbstrait(xGraduation, -0.1),
                pointAbstrait(xGraduation, 0.1),
              ),
            )
          }
        }
      }

      const labelRepere1 = latex2d(
        texNombre(repere1, nbDecimales),
        xRepere1,
        -0.5,
        {},
      )
      const labelRepere2 = latex2d(
        texNombre(repere2, nbDecimales),
        xRepere2,
        -0.5,
        {},
      )
      const xPoint =
        ((nombreATrouver - premiereGraduation) * distanceGrossesGraduations) /
        pasPrincipal
      const abscisseATrouver = latex2d(
        texNombre(nombreATrouver, nbDecimales),
        xPoint,
        -1.2,
        { color: orangeMathalea },
      )
      const guide = segment(
        pointAbstrait(xPoint, -0.3),
        pointAbstrait(xPoint, -0.9),
      )
      guide.styleExtremites = '->'
      guide.color = colorToLatexOrHTML(orangeMathalea)
      guide.epaisseur = 2
      guide.pointilles = 2
      const pointATrouver = pointAbstrait(xPoint, 0, lettreDepuisChiffre(i + 1))
      const trace = tracePoint(pointATrouver)
      const label = labelPoint(pointATrouver)
      const laDroiteGraduee = [
        laDroite,
        ...graduationsPrincipales,
        ...graduationsSecondaires,
        labelRepere1,
        labelRepere2,
        trace,
        label,
      ]
      // fin fabrication droite graduée.
      let texte = this.sup3
        ? `Donner l'abscisse du point $${lettreDepuisChiffre(i + 1)}$, c'est-à-dire le nombre repéré par `
        : 'Donner le nombre repéré par le point '
      texte += `$${lettreDepuisChiffre(i + 1)}$${ajouteChampTexteMathLive(this, i, `  ${KeyboardType.numbersSpace}`, { texteAvant: ' : ' })}.<br>`
      texte += mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 1 },
          fixeBordures(laDroiteGraduee),
        ),
        laDroiteGraduee,
      )
      const figureCorrection = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 1 },
          fixeBordures(laDroiteGraduee, { rymin: -0.7 }),
        ),
        laDroiteGraduee,
        abscisseATrouver,
        guide,
      )
      let texteCorr = `On commence par calculer l'écart entre les deux graduations visibles : $${texNombre(repere2, nbDecimales)}-${texNombre(repere1, nbDecimales)}=${texNombre(pasPrincipal, nbDecimales)}$.<br>`
      texteCorr += `Ensuite, on compte le nombre d'intervalles entre ces deux graduations : il y a $${subdivision}$ intervalles.<br>`
      const pas = pasPrincipal / subdivision
      texteCorr += `Maintenant, on calcule la longueur de l'intervalle (le pas) : $${texNombre(pasPrincipal, nbDecimales)}\\div ${subdivision}=${texNombre(pas, nbDecimales)}$.<br>`
      texteCorr += `Ensuite, ${nombreATrouver < repere1 ? 'on retire' : 'on ajoute'} le pas autant de fois que nécessaire pour trouver ${this.sup3 ? "l'abscisse demandée" : 'le nombre demandé'} : `
      texteCorr +=
        nombreATrouver < repere1
          ? `$${texNombre(repere1, nbDecimales)}-${texNombre((repere1 - nombreATrouver) / pas, nbDecimales)}\\times ${texNombre(pas, nbDecimales)}=${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>`
          : nombreATrouver > repere2
            ? `$${texNombre(repere2, nbDecimales)}+${texNombre((nombreATrouver - repere2) / pas, nbDecimales)}\\times ${texNombre(pas, nbDecimales)}=${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>`
            : `$${texNombre(repere1, nbDecimales)}+${texNombre((nombreATrouver - repere1) / pas, nbDecimales)}\\times ${texNombre(pas, nbDecimales)}=${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>`
      if (repere1 - nombreATrouver > pasPrincipal) {
        const nbGrosseGrad = Math.floor(
          (repere1 - nombreATrouver) / pasPrincipal,
        )
        const nbPetiteGrad = Math.round(
          ((repere1 - nbGrosseGrad * pasPrincipal - nombreATrouver) *
            subdivision) /
            pasPrincipal,
        )
        texteCorr += `<br>On aurait pu aussi utiliser les grosses graduations, ainsi : $${texNombre(repere1, nbDecimales)}-${nbGrosseGrad}\\times ${texNombre(pasPrincipal, nbDecimales)}=${texNombre(repere1 - nbGrosseGrad * pasPrincipal, nbDecimales)}$.<br>`
        texteCorr += `Puis $${texNombre(repere1 - nbGrosseGrad * pasPrincipal, nbDecimales)}-${texNombre(nbPetiteGrad, 0)}\\times ${texNombre(pas, nbDecimales)}=${texNombre(repere1 - nbGrosseGrad * pasPrincipal, nbDecimales)}-${texNombre(nbPetiteGrad * pas, nbDecimales)}=${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>`
      } else if (nombreATrouver - repere2 > pasPrincipal) {
        const nbGrosseGrad = Math.floor(
          (nombreATrouver - repere2) / pasPrincipal,
        )
        const nbPetiteGrad = Math.round(
          ((nombreATrouver - nbGrosseGrad * pasPrincipal - repere2) *
            subdivision) /
            pasPrincipal,
        )
        texteCorr += `<br>On aurait pu aussi utiliser les grosses graduations, ainsi : $${texNombre(repere2, nbDecimales)}+${nbGrosseGrad}\\times ${texNombre(pasPrincipal, nbDecimales)}=${texNombre(repere2 + nbGrosseGrad * pasPrincipal, nbDecimales)}$.<br>`
        texteCorr += `Puis $${texNombre(repere2 + nbGrosseGrad * pasPrincipal, nbDecimales)}+${texNombre(nbPetiteGrad, 0)}\\times ${texNombre(pas, nbDecimales)}=${texNombre(repere2 + nbGrosseGrad * pasPrincipal, nbDecimales)}+${texNombre(nbPetiteGrad * pas, nbDecimales)}=${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>`
      }
      const correctionRapide = `${this.sup3 ? "L'abscisse du" : 'Le nombre repéré par le'} point $${lettreDepuisChiffre(i + 1)}$ est : $${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))}$.<br>Notation : $${lettreDepuisChiffre(i + 1)}(${miseEnEvidence(texNombre(nombreATrouver, nbDecimales))})$.`
      if (this.questionJamaisPosee(i, repere1, repere2, nombreATrouver, pas)) {
        this.listeQuestions[i] = texte
        if (this.interactif) {
          handleAnswers(this, i, {
            reponse: {
              value: texNombre(nombreATrouver, nbDecimales),
              options: { nombreAvecEspace: true },
            },
          })
        }
        this.listeCorrections[i] =
          `${this.correctionDetaillee ? `${texteCorr}<br>${correctionRapide}` : correctionRapide}<br>${figureCorrection}`

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
export default ReperageEntiersOuDecimaux
