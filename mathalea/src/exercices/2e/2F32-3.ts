import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { Spline, spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import type FractionEtendue from '../../modules/FractionEtendue'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
export const titre =
  "Déterminer le tableau de signes d'une fonction graphiquement"
export const interactifReady = true

export const dateDePublication = '06/07/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '07/12/2023' // interactivité
export const uuid = 'a7860' // @todo à changer dans un nouvel exo (utiliser pnpm getNewUuid)

export const refs = {
  'fr-fr': ['2F32-3'],
  'fr-ch': [],
}
// une liste de nœuds pour définir une fonction Spline
const noeuds1 = [
  { x: -4, y: -1, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
  { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: -2, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 0, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 1, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 3, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 4, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 5, y: 1, deriveeGauche: 0.5, deriveeDroit: 0.5, isVisible: true },
]
// une autre liste de nœuds...
const noeuds2 = [
  { x: -6, y: -2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
  { x: -5, y: 0, deriveeGauche: 2, deriveeDroit: 3, isVisible: true },
  { x: -4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -3, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: -1, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 0, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 1, y: 3, deriveeGauche: 3, deriveeDroit: 3, isVisible: true },
  { x: 2, y: 5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 3, y: 4, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: 4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 5, y: 4, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 6, y: 5, deriveeGauche: 0.2, deriveeDroit: 0.2, isVisible: true },
]

const noeuds3 = [
  { x: -6, y: -4, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: -2, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 4, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: 6, y: -3, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
]

const noeuds4 = [
  { x: -6, y: 3, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: -5, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -4, y: 2, deriveeGauche: -1.5, deriveeDroit: -1.5, isVisible: true },
  { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1.5, isVisible: true },
  { x: 0, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 1, y: -1, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
  { x: 2, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 3, y: -3, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
]
// une liste des listes
const mesFonctions = [noeuds1, noeuds2, noeuds3, noeuds4] //,, noeuds2noeuds1, noeuds2,

let coeffX
let coeffY
let deltaX
let deltaY

/**
 * choisit les caractèristique de la transformation de la courbe
 * @returns {{coeffX: -1|1, deltaX: int, deltaY: int, coeffY: -1|1}}
 */

function aleatoiriseCourbe(choix: number) {
  coeffX = choice([-1, 1]) // symétries ou pas
  coeffY = choice([-1, 1])
  deltaX = randint(-2, +2) // translations
  switch (choix) {
    case 1:
      deltaY = 0 // randint(-2, +2)
      break
    case 2:
      deltaY = randint(-2, +2)
      break
    default:
      deltaY = choice([randint(-4, +4), 0]) / 2
      break
  }
  return { coeffX, coeffY, deltaX, deltaY }
}

/**
 * Aléatoirise une courbe et demande les antécédents d'une valeur entière (eux aussi entiers)
 * @author Gilles Mora (Jean-claude Lhote pour la programmation)

 */
export default class BetaModeleSpline extends Exercice {
  spline?: Spline
  constructor() {
    super()
    this.nbQuestions = 1 // Nombre de questions par défaut
    this.correctionDetailleeDisponible = true // booléen qui indique si une correction détaillée est disponible.
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: '1', // @fixme à modifier dés qu'on aura une recherche fiable des zéros.
      min: 1,
      max: 3,
      melange: 3,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    // boucle de création des différentes questions
    for (let i = 0; i < this.nbQuestions; i++) {
      const { coeffX, coeffY, deltaX, deltaY } = aleatoiriseCourbe(
        Number(typeDeQuestions[i]),
      )
      // la liste des noeuds de notre fonction

      const nuage = choice(mesFonctions).map((noeud) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      const maSpline = spline(nuage)
      const fonctionD = (x: number) => maSpline.derivee(x)
      const choixInteractif = randint(0, 1)
      const { xMin, xMax, yMin, yMax } = maSpline.trouveMaxes()
      this.spline = maSpline
      const bornes = maSpline.trouveMaxes()
      const repere1 = repere({
        xMin: bornes.xMin - 1,
        xMax: bornes.xMax + 1,
        yMin: bornes.yMin - 1,
        yMax: bornes.yMax + 1,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
      })
      const courbe1 = maSpline.courbe({
        epaisseur: 1.5,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 2,
          style: '.',
          epaisseur: 2,
        },
        color: bleuMathalea,
      })

      const objetsEnonce = [
        ...(repere1.objets as NestedObjetMathalea2dArray),
        /* courbe2, */ courbe1,
      ]
      let texteEnonce

      const tableau = maSpline.tableauSignes()
      const tableauB = tableauSignesFonction(
        fonctionD as (x: number | FractionEtendue) => number,
        xMin,
        xMax,
        { step: 1, tolerance: 0.1 },
      )

      const tableauChoisi = [tableau, tableauB][choixInteractif]
      handleAnswers(this, i, {
        reponse: {
          value: choixInteractif === 0 ? ['oui'] : ['non'],
          options: { texteSansCasse: true },
        },
      })

      const figure = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.6, center: !context.isHtml },
          { xmin: xMin - 1, ymin: yMin - 1, xmax: xMax + 1, ymax: yMax + 1 },
        ),
        objetsEnonce,
        o,
      )

      texteEnonce =
        'Dresser le tableau de signes de la fonction $f$ représentée ci-dessous.<br>' +
        figure
      if (this.interactif) {
        // || this.can
        texteEnonce =
          "Voici la représentation graphique d'une fonction $f$ :<br>"
        texteEnonce += figure
        texteEnonce += '<br>Le tableau de signes de la fonction $f$ est : <br>'
        texteEnonce += tableauChoisi
        texteEnonce += '<br>Répondre par Oui ou Non. '
        texteEnonce += ajouteChampTexte(this, i)
      }
      let texteCorrection
      texteCorrection = `L'ensemble de définition de $f$ est $[${maSpline.x[0]}\\,;\\,${maSpline.x[maSpline.n - 1]}]$.<br>`
      if (this.correctionDetaillee) {
        texteCorrection += `Les images $f(x)$ sont positives lorsque la courbe est au-dessus de l'axe des abscisses et elles sont négatives lorsque la courbe est en dessous de l'axe des abscisses.<br><br>
          `
      }
      texteCorrection += `Tableau de signes de $f(x)$ sur $[${maSpline.x[0]}\\,;\\,${maSpline.x[maSpline.n - 1]}]$ :<br>
          `
      texteCorrection += tableau

      if (this.interactif) {
        if (choixInteractif === 0) {
          texteCorrection += `<br>Le tableau de signes correspond, il fallait donc répondre ${texteEnCouleurEtGras('Oui')}.`
        } else {
          texteCorrection += `<br>Le tableau de signes ne correspond pas, il fallait donc répondre ${texteEnCouleurEtGras('Non')}.`
        }
      }

      this.listeQuestions.push(texteEnonce)
      this.listeCorrections.push(texteCorrection)
      this.canEnonce = texteEnonce // 'Compléter'
    }

    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
