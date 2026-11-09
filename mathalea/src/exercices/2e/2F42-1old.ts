import { fixeBordures } from '../../lib/2d/fixeBordures'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { spline, type NoeudSpline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer graphiquement les extremums'
export const interactifReady = true

export const dateDePublication = '27/06/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const uuid = '7761e' // @todo à changer dans un nouvel exo (utiliser pnpm getNewUuid)

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
// une liste de nœuds pour définir une fonction Spline
const noeuds1 = [
  { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -3, y: 1, deriveeGauche: 2, deriveeDroit: 2, isVisible: false },
  { x: -2, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -1, y: 1, deriveeGauche: -2, deriveeDroit: -2, isVisible: false },
  { x: 0, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 3, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 4, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]
// une autre liste de nœuds...
const noeuds2 = [
  { x: -5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -3, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -1, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 2, y: 2, deriveeGauche: -0.5, deriveeDroit: -0.5, isVisible: true },
]
const noeuds3 = [
  { x: -5, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: -4, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 0, y: 0, deriveeGauche: -0.5, deriveeDroit: -0.5, isVisible: true },
]
const noeuds4 = [
  { x: -5, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: -4, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
  { x: 0, y: 0, deriveeGauche: -0.5, deriveeDroit: -0.5, isVisible: true },
]
// une liste des listes
const mesFonctions = [noeuds1, noeuds2, noeuds3, noeuds4] //, noeuds1, noeuds2, noeuds3, noeuds4

/**
 * trouve les extrema mais ne fonctionne que si les extrema se trouvent en des noeuds.
 * @param {{x: number, y:number,deriveeGauche:number,deriveeDroit:number, isVisible:boolean}[]} nuage les noeuds
 * @returns {{yMin: number, yMax: number, xMax: number, xMin: number}}
 */
function trouveMaxes(nuage: NoeudSpline[]) {
  const xMin = Math.floor(Math.min(...nuage.map((el) => el.x)) - 1)
  const yMin = Math.floor(Math.min(...nuage.map((el) => el.y)) - 1)
  const xMax = Math.ceil(Math.max(...nuage.map((el) => el.x)) + 1)
  const yMax = Math.ceil(Math.max(...nuage.map((el) => el.y)) + 1)
  return { xMin, xMax, yMin, yMax }
}

/**
 * choisit les caractèristique de la transformation de la courbe
 * @returns {{coeffX: -1|1, deltaX: int, deltaY: int, coeffY: -1|1}}
 */
function aleatoiriseCourbe() {
  const coeffX = choice([-1, 1]) // symétries ou pas
  const coeffY = choice([-1, 1])
  const deltaX = randint(-2, +2) // translations
  const deltaY = randint(-2, +2)
  return { coeffX, coeffY, deltaX, deltaY }
}

/**
 * Aléatoirise une courbe et demande les antécédents d'une valeur entière (eux aussi entiers)
 * @author Gilles Mora (grâce au travail de Jean-claude Lhote)

 */
export default class BetaModeleSpline extends Exercice {
  constructor() {
    super()

    this.sup = '4'
    this.nbQuestions = 1 // Nombre de questions par défaut
  }

  nouvelleVersion() {
    for (let i = 0; i < this.nbQuestions; i++) {
      const { coeffX, coeffY, deltaX, deltaY } = aleatoiriseCourbe()
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
      const maSpline = spline(nuage)
      const { xMin, xMax, yMin, yMax } = trouveMaxes(nuage)
      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      // le repère dans lequel sera tracé la courbe (il est important que xMin et yMin soient entiers d'où les arrondis lors de leur définition plus haut
      const repere1 = repere({
        xMin: xMin - 1,
        xMax: xMax + 1,
        yMin: yMin - 1,
        yMax: yMax + 1,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: yMin - 1,
        grilleSecondaireYMax: yMax + 1,
        grilleSecondaireXMin: xMin - 1,
        grilleSecondaireXMax: xMax + 1,
      })
      const courbe1 = maSpline.courbe({
        epaisseur: 1.5,
        ajouteNoeuds: true,
        optionsNoeuds: {
          color: bleuMathalea,
          taille: 1,
          style: '.',
          epaisseur: 2,
        },
        color: bleuMathalea,
      })
      const objetsEnonce = [repere1, courbe1]
      let texteEnonce = `On donne la courbe représentative d'une fonction $f$ définie sur l'intervalle $[${maSpline.x[0]}\\,;\\,${maSpline.x[maSpline.n - 1]}]$. <br>`
      texteEnonce += `
      Déterminer les extremums de la fonction et préciser en quelles valeurs ils sont atteints.<br>`
      texteEnonce += mathalea2d(
        Object.assign({ scale: 0.7 }, fixeBordures(objetsEnonce)),
        objetsEnonce,
        o,
      )
      if (this.interactif) {
        texteEnonce +=
          '<br>Le maximum de $f$ est : ' +
          ajouteChampTexteMathLive(this, 4 * i, KeyboardType.clavierDeBase)
        texteEnonce +=
          '. Il est atteint en $x=$ ' +
          ajouteChampTexteMathLive(this, 4 * i + 1, KeyboardType.clavierDeBase)
        texteEnonce +=
          '<br>Le minimum de $f$ est : ' +
          ajouteChampTexteMathLive(this, 4 * i + 2, KeyboardType.clavierDeBase)
        texteEnonce +=
          '. Il est atteint en $x=$ ' +
          ajouteChampTexteMathLive(this, 4 * i + 3, KeyboardType.clavierDeBase)
      }
      // on ajoute les tracés pour repérer les antécédents et on en profite pour rendre les autres noeuds invisibles
      const solsMax = maSpline.solve(Math.max(...nuage.map((el) => el.y)), 0)
      const solsMin = maSpline.solve(Math.min(...nuage.map((el) => el.y)), 0)
      const solutionMax =
        solsMax!.length === 1 ? solsMax![0] : 'On a un problème'
      const solutionMin =
        solsMin!.length === 1 ? solsMin![0] : 'On a un problème'
      handleAnswers(
        this,
        4 * i,
        { reponse: { value: Math.max(...nuage.map((el) => el.y)) } },
        { formatInteractif: 'mathlive' },
      )
      handleAnswers(
        this,
        4 * i + 1,
        { reponse: { value: solutionMax } },
        { formatInteractif: 'mathlive' },
      )
      handleAnswers(
        this,
        4 * i + 2,
        { reponse: { value: Math.min(...nuage.map((el) => el.y)) } },
        { formatInteractif: 'mathlive' },
      )
      handleAnswers(
        this,
        4 * i + 3,
        { reponse: { value: solutionMin } },
        { formatInteractif: 'mathlive' },
      )

      const texteCorrection = `Le point le plus haut de la courbe a pour coordonnées $(${solutionMax}\\,;\\,${Math.max(...nuage.map((el) => el.y))})$.<br>
      On en déduit que le maximum de $f$ est $${Math.max(...nuage.map((el) => el.y))}$. Il est atteint en $x=${solutionMax}$.<br>
      Le point le plus bas de la courbe a pour coordonnées $(${solutionMin}\\,;\\,${Math.min(...nuage.map((el) => el.y))})$.<br>
      On en déduit que le minimum de $f$ est $${Math.min(...nuage.map((el) => el.y))}$. Il est atteint en $x=${solutionMin}$.`
      this.listeQuestions.push(texteEnonce)
      this.listeCorrections.push(texteCorrection)
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
