import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire un graphique à deux axes verticaux'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '27/10/2026'

export const uuid = 'd5a9c'
export const refs = {
  'fr-fr': ['1A-S01-12'],
  'fr-ch': [],
}

/**
 * Lecture d'un graphique où deux grandeurs d'unités différentes sont tracées
 * avec chacune son axe vertical (à gauche et à droite) : valeur d'une
 * grandeur, écart entre deux années, lecture croisée des deux courbes.
 * @author Stéphane Guyon
 */

type Grandeur = {
  /** Groupe nominal : « le prix moyen du m² » */
  groupe: string
  /** Titre de l'axe : « Prix moyen du m² (en €) » */
  titreAxe: string
  /** Unité écrite après le champ de réponse */
  unite: string
  /** Valeur de la première graduation de l'axe */
  min: number
  /** Écart entre deux graduations de l'axe */
  pas: number
}

type Scenario = {
  contexte: string
  grandeurs: [Grandeur, Grandeur]
}

const scenarios: Scenario[] = [
  {
    contexte:
      'Une commune de taille moyenne suit son évolution depuis plusieurs années',
    grandeurs: [
      {
        groupe: 'la population',
        titreAxe: "Population (en milliers d'habitants)",
        unite: "milliers d'habitants",
        min: 10,
        pas: 5,
      },
      {
        groupe: 'le prix moyen du m² de logement',
        titreAxe: 'Prix moyen du m² (en €)',
        unite: '€',
        min: 1400,
        pas: 200,
      },
    ],
  },
  {
    contexte: 'Une entreprise de menuiserie publie son bilan',
    grandeurs: [
      {
        groupe: "le chiffre d'affaires",
        titreAxe: "Chiffre d'affaires (en milliers d'€)",
        unite: "milliers d'€",
        min: 200,
        pas: 50,
      },
      {
        groupe: "l'effectif de l'entreprise",
        titreAxe: 'Effectif (en salariés)',
        unite: 'salariés',
        min: 10,
        pas: 5,
      },
    ],
  },
  {
    contexte: 'Un lycée étudie ses données de gestion',
    grandeurs: [
      {
        groupe: "le nombre d'élèves",
        titreAxe: "Nombre d'élèves",
        unite: 'élèves',
        min: 600,
        pas: 50,
      },
      {
        groupe: 'le budget de fonctionnement',
        titreAxe: "Budget (en milliers d'€)",
        unite: "milliers d'€",
        min: 150,
        pas: 25,
      },
    ],
  },
  {
    contexte: 'Une station de ski dresse le bilan de ses saisons',
    grandeurs: [
      {
        groupe: 'le nombre de forfaits vendus',
        titreAxe: 'Forfaits vendus (en milliers)',
        unite: 'milliers de forfaits',
        min: 40,
        pas: 10,
      },
      {
        groupe: "le chiffre d'affaires",
        titreAxe: "Chiffre d'affaires (en millions d'€)",
        unite: "millions d'€",
        min: 2,
        pas: 0.5,
      },
    ],
  },
  {
    contexte: 'Une exploitation laitière suit sa production',
    grandeurs: [
      {
        groupe: 'la production de lait',
        titreAxe: 'Production (en milliers de L)',
        unite: 'milliers de litres',
        min: 300,
        pas: 50,
      },
      {
        groupe: 'le nombre de vaches',
        titreAxe: 'Nombre de vaches',
        unite: 'vaches',
        min: 40,
        pas: 5,
      },
    ],
  },
  {
    contexte: 'Un musée suit sa fréquentation',
    grandeurs: [
      {
        groupe: 'le nombre de visiteurs',
        titreAxe: 'Visiteurs (en milliers)',
        unite: 'milliers de visiteurs',
        min: 80,
        pas: 20,
      },
      {
        groupe: 'les recettes de la boutique',
        titreAxe: "Recettes (en milliers d'€)",
        unite: "milliers d'€",
        min: 100,
        pas: 25,
      },
    ],
  },
]

const nombreAnnees = 8
const derniereAnnee = 2025
const nombreGraduations = 6
/** Largeur en cm d'un intervalle d'une année à la suivante. */
const largeurAnnee = 1.6

/**
 * Niveaux (en nombre de graduations depuis le bas, multiples de $0,5$) formant
 * une ligne brisée sans palier.
 */
function genererNiveaux(): number[] {
  const niveaux = [randint(1, 5)]
  while (niveaux.length < nombreAnnees) {
    const precedent = niveaux[niveaux.length - 1]
    const ecart = randint(1, 3) * 0.5 * choice([-1, 1])
    const suivant = precedent + ecart
    niveaux.push(
      suivant < 0.5 || suivant > nombreGraduations - 0.5
        ? precedent - ecart
        : suivant,
    )
  }
  return niveaux
}

const estPluriel = (g: Grandeur) => g.groupe.startsWith('les ')
const estFeminin = (g: Grandeur) => /^(la|les) /.test(g.groupe)

/** « Quel était », « Quelle était », « Quelles étaient » selon la grandeur. */
function quelEtait(g: Grandeur): string {
  return `Quel${estFeminin(g) ? 'le' : ''}${estPluriel(g) ? 's étaient' : ' était'}`
}

const majuscule = (texte: string) => texte[0].toUpperCase() + texte.slice(1)

/** « est » ou « sont » selon la grandeur. */
const est = (g: Grandeur) => (estPluriel(g) ? 'sont' : 'est')

function valeurDuNiveau(g: Grandeur, niveau: number): number {
  return g.min + g.pas * niveau
}

export default class LireGraphiqueDeuxAxes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    // Les quatre types de questions alternent
    const types = combinaisonListes([1, 2, 3, 4], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 2000; cpt++) {
      const scenario = choice(scenarios)
      // La grandeur de gauche (violette) et celle de droite (orange) sont tirées
      const [gauche, droite] = shuffle(scenario.grandeurs)
      const premiere = derniereAnnee - nombreAnnees + 1
      const niveauxG = genererNiveaux()
      const niveauxD = genererNiveaux()
      const niveaux = [niveauxG, niveauxD]
      const grandeurs = [gauche, droite]
      const couleurs = ['purple', 'orange']
      const noms = ['violette', 'orange']
      const axes = ['gauche', 'droite']

      // Les valeurs lues sont toujours sur une graduation : on arrondit
      // les points interrogés à un niveau entier
      /** Question posée en non interactif. */
      let enonce: string
      /** Début de la phrase à compléter en interactif. */
      let debut: string
      /** Points lus sur le graphique : grandeur (0 gauche, 1 droite) et année. */
      let lectures: { s: number; k: number }[]
      let correction: string
      let reponse: number
      let unite: string
      let cle: (number | string)[]
      const type = types[i]
      if (type === 1) {
        const s = randint(0, 1)
        const k = randint(0, nombreAnnees - 1)
        niveaux[s][k] = Math.round(niveaux[s][k])
        reponse = valeurDuNiveau(grandeurs[s], niveaux[s][k])
        unite = grandeurs[s].unite
        enonce = `${quelEtait(grandeurs[s])} ${grandeurs[s].groupe} en $${premiere + k}$${sp()}?`
        lectures = [{ s, k }]
        debut = `${majuscule(grandeurs[s].groupe)} en $${premiere + k}$ ${est(grandeurs[s])} de`
        correction = `${grandeurs[s].groupe[0].toUpperCase()}${grandeurs[s].groupe.slice(1)} se lit sur la courbe ${texteEnCouleurEtGras(noms[s], couleurs[s])}, avec l'axe de ${axes[s]}.<br>En $${premiere + k}$, on lit : $${miseEnEvidence(texNombre(reponse, 1))}$ ${unite}.`
        cle = [type, s, k]
      } else if (type === 2) {
        const s = randint(0, 1)
        const k1 = randint(0, nombreAnnees - 2)
        const k2 = randint(k1 + 1, nombreAnnees - 1)
        niveaux[s][k1] = Math.round(niveaux[s][k1])
        niveaux[s][k2] = Math.round(niveaux[s][k2])
        if (niveaux[s][k1] === niveaux[s][k2]) continue
        const v1 = valeurDuNiveau(grandeurs[s], niveaux[s][k1])
        const v2 = valeurDuNiveau(grandeurs[s], niveaux[s][k2])
        reponse = Math.abs(v2 - v1)
        unite = grandeurs[s].unite
        enonce = `Calculer l'écart entre ${grandeurs[s].groupe} en $${premiere + k1}$ et ${grandeurs[s].groupe} en $${premiere + k2}$.`
        lectures = [
          { s, k: k1 },
          { s, k: k2 },
        ]
        debut = `L'écart entre ${grandeurs[s].groupe} en $${premiere + k1}$ et ${grandeurs[s].groupe} en $${premiere + k2}$ est de`
        correction = `On lit sur la courbe ${texteEnCouleurEtGras(noms[s], couleurs[s])}, avec l'axe de ${axes[s]} : $${texNombre(v1, 1)}$ ${unite} en $${premiere + k1}$ et $${texNombre(v2, 1)}$ ${unite} en $${premiere + k2}$.<br>L'écart est $${texNombre(Math.max(v1, v2), 1)}-${texNombre(Math.min(v1, v2), 1)}=${miseEnEvidence(texNombre(reponse, 1))}$ ${unite}.`
        cle = [type, s, k1, k2]
      } else if (type === 3) {
        // La courbe violette atteint son maximum (ou son minimum) une seule
        // année, et la courbe orange est sur une graduation cette année-là
        const extremum = choice(['maximum', 'minimum'])
        const valeurExtreme =
          extremum === 'maximum' ? Math.max(...niveauxG) : Math.min(...niveauxG)
        const k = niveauxG.indexOf(valeurExtreme)
        if (niveauxG.lastIndexOf(valeurExtreme) !== k) continue
        niveauxD[k] = Math.round(niveauxD[k])
        reponse = valeurDuNiveau(droite, niveauxD[k])
        unite = droite.unite
        lectures = [
          { s: 0, k },
          { s: 1, k },
        ]
        const aAtteint = estPluriel(gauche) ? 'ont atteint' : 'a atteint'
        enonce = `${quelEtait(droite)} ${droite.groupe} l'année où ${gauche.groupe} ${aAtteint} son ${extremum}${sp()}?`
        debut = `L'année où ${gauche.groupe} ${aAtteint} son ${extremum}, ${droite.groupe} ${estPluriel(droite) ? 'ont été' : 'a été'} de`
        correction = `${gauche.groupe[0].toUpperCase()}${gauche.groupe.slice(1)} se lit sur la courbe ${texteEnCouleurEtGras('violette', 'purple')}, avec l'axe de gauche : son ${extremum} est atteint en $${miseEnEvidence(premiere + k)}$.<br>Cette année-là, ${droite.groupe} se lit sur la courbe ${texteEnCouleurEtGras('orange', 'orange')}, avec l'axe de droite : $${miseEnEvidence(texNombre(reponse, 1))}$ ${unite}.`
        cle = [type, k, extremum]
      } else {
        // Une valeur de la courbe de l'autre grandeur est donnée : elle
        // n'est atteinte qu'une seule année
        const s = randint(0, 1)
        const t = 1 - s
        const k = randint(0, nombreAnnees - 1)
        niveaux[s][k] = Math.round(niveaux[s][k])
        if (
          niveaux[s].indexOf(niveaux[s][k]) !==
          niveaux[s].lastIndexOf(niveaux[s][k])
        )
          continue
        niveaux[t][k] = Math.round(niveaux[t][k])
        const donnee = valeurDuNiveau(grandeurs[s], niveaux[s][k])
        reponse = valeurDuNiveau(grandeurs[t], niveaux[t][k])
        unite = grandeurs[t].unite
        lectures = [
          { s, k },
          { s: t, k },
        ]
        const etaitS = estPluriel(grandeurs[s]) ? 'étaient' : 'était'
        const condition = `l'année où ${grandeurs[s].groupe} ${etaitS} de $${texNombre(donnee, 1)}$ ${grandeurs[s].unite}`
        enonce = `${quelEtait(grandeurs[t])} ${grandeurs[t].groupe} ${condition}${sp()}?`
        debut = `${majuscule(condition)}, ${grandeurs[t].groupe} ${estPluriel(grandeurs[t]) ? 'étaient' : 'était'} de`
        correction = `On cherche sur la courbe ${texteEnCouleurEtGras(noms[s], couleurs[s])} (axe de ${axes[s]}) l'année où ${grandeurs[s].groupe} ${estPluriel(grandeurs[s]) ? 'valent' : 'vaut'} $${texNombre(donnee, 1)}$ ${grandeurs[s].unite} : c'est en $${premiere + k}$.<br>Cette année-là, ${grandeurs[t].groupe} se lit sur la courbe ${texteEnCouleurEtGras(noms[t], couleurs[t])} (axe de ${axes[t]}) : $${miseEnEvidence(texNombre(reponse, 1))}$ ${unite}.`
        cle = [type, s, k]
      }
      // Les deux courbes ne se superposent jamais : à chaque année, elles sont
      // séparées d'au moins une graduation
      if (niveauxG.some((n, k) => Math.abs(n - niveauxD[k]) < 1)) continue
      if (!this.questionJamaisPosee(i, scenario.contexte, premiere, ...cle)) {
        continue
      }

      // Graphique : les abscisses sont en cm (1 année = largeurAnnee)
      const largeur = (nombreAnnees - 1) * largeurAnnee
      const traces = [0, 1].map((s) => {
        const ligne = polyline(
          niveaux[s].map((n, k) => pointAbstrait(k * largeurAnnee, n)),
          couleurs[s],
        )
        ligne.epaisseur = 2
        return ligne
      })
      const graduations = Array.from(
        { length: nombreGraduations + 1 },
        (_, n) => n,
      )
      const etiquettes = [0, 1].flatMap((s) =>
        graduations.map((n) =>
          texteParPosition(
            stringNombre(valeurDuNiveau(grandeurs[s], n), 1),
            s === 0 ? -0.9 : largeur + 0.9,
            n,
            0,
            couleurs[s],
            1,
          ),
        ),
      )
      const titresAxes = [0, 1].map((s) =>
        texteParPosition(
          grandeurs[s].titreAxe,
          s === 0 ? -0.5 : largeur + 0.5,
          nombreGraduations + 0.8,
          0,
          couleurs[s],
          1,
        ),
      )
      const graphique = repere({
        xMin: 0,
        xMax: nombreAnnees - 1,
        yMin: 0,
        yMax: nombreGraduations,
        xUnite: largeurAnnee,
        xThickDistance: 1,
        yThickDistance: 1,
        xLabelListe: Array.from({ length: nombreAnnees }, (_, k) => ({
          valeur: k,
          texte: `${premiere + k}`,
        })),
        labelsYareVisible: false,
        axeXStyle: '',
        axeYStyle: '',
        grilleX: false,
        grilleYDistance: 1,
        grilleXCouleur: 'lightgray',
        grilleYCouleur: 'lightgray',
      })
      // Une ligne verticale de la grille par année (xUnite ne s'applique pas
      // à l'espacement de la grille)
      const grilleAnnees = niveauxG.map((_, k) => {
        const ligne = segment(
          k * largeurAnnee,
          0,
          k * largeurAnnee,
          nombreGraduations,
          'lightgray',
        )
        ligne.epaisseur = 1
        return ligne
      })
      const axeDroit = segment(largeur, 0, largeur, nombreGraduations, 'black')
      const dessiner = (ajouts: ObjetMathalea2D[] = []) =>
        mathalea2d(
          {
            xmin: -4.5,
            xmax: largeur + 4.5,
            ymin: -1.2,
            ymax: nombreGraduations + 1.6,
            pixelsParCm: 28,
            scale: 1,
            center: !context.isHtml,
          },
          graphique,
          ...grilleAnnees,
          axeDroit,
          ...traces,
          ...etiquettes,
          ...titresAxes,
          ...ajouts,
        )
      const figure = dessiner()
      // Correction : pointillés de l'axe des années jusqu'au point, puis du
      // point jusqu'à l'axe de la grandeur lue
      const pointilles = lectures.flatMap(({ s: g, k }) => {
        const x = k * largeurAnnee
        const n = niveaux[g][k]
        const xAxe = g === 0 ? 0 : largeur
        // Pas de trait nul quand le point est sur l'axe vertical
        const traits = [segment(x, 0, x, n, couleurs[g])]
        if (x !== xAxe) traits.push(segment(x, n, xAxe, n, couleurs[g]))
        for (const trait of traits) {
          trait.pointilles = 2
          trait.epaisseur = 2
        }
        const point = tracePoint(pointAbstrait(x, n), couleurs[g])
        point.taille = 4
        return [...traits, point]
      })
      correction += `<br>${dessiner(pointilles)}`

      const intro = `${scenario.contexte}. Le graphique ci-dessous donne, de $${premiere}$ à $${derniereAnnee}$, l'évolution de deux grandeurs : ${gauche.groupe} (courbe ${texteEnCouleurEtGras('violette', 'purple')}, axe de gauche) et ${droite.groupe} (courbe ${texteEnCouleurEtGras('orange', 'orange')}, axe de droite).<br>${figure}<br>`

      createQuestion(this, i, {
        question: intro + (this.interactif ? '' : enonce),
        correction,
        answer: { value: reponse },
        field: {
          keyboard: KeyboardType.clavierNumbers,
          texteAvant: this.interactif ? `${debut} ` : undefined,
          texteApres: this.interactif ? ` ${unite}.` : ` ${unite}`,
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
