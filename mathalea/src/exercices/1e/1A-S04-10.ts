import {
  bleuMathalea,
  coopmathsCorpusLightest,
  orangeMathalea,
  vertMathalea,
} from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import Stat from '../../lib/mathFonctions/Stat'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'f4137'
export const refs = {
  'fr-fr': ['1A-S04-10'],
  'fr-ch': ['9R1FA2B-14', '9R2FA2B-14', '9R3FA2B-14'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Lire une proportion pour calculer un effectif dans un diagramme circulaire'
export const dateDePublication = '27/10/2026'

type TypeQuestion = 'effectif' | 'complementaire'

type Contexte = {
  /** Présentation du diagramme, qui donne l'effectif total */
  presentation: (effectifTotal: number) => string
  categories: string[]
  /** Verbe et complément pour les élèves du secteur : « pratiquent le judo » */
  affirmation: (categorie: string) => string
  /** Même chose à la forme négative : « ne pratiquent pas le judo » */
  negation: (categorie: string) => string
}

const contextes: Contexte[] = [
  {
    presentation: (effectifTotal) =>
      `Le diagramme circulaire ci-dessous donne la répartition de $${effectifTotal}$ élèves d'un lycée, selon le sport qu'ils pratiquent.`,
    categories: ['Football', 'Tennis', 'Judo', 'Basket', 'Rugby'],
    affirmation: (categorie) => `pratiquent le ${categorie.toLowerCase()}`,
    negation: (categorie) => `ne pratiquent pas le ${categorie.toLowerCase()}`,
  },
  {
    presentation: (effectifTotal) =>
      `Le diagramme circulaire ci-dessous donne la répartition de $${effectifTotal}$ élèves d'un lycée, selon l'option facultative choisie.`,
    categories: ['Théâtre', 'Musique', 'Latin', 'Danse'],
    affirmation: (categorie) =>
      `ont choisi l'option «\u00a0${categorie.toLowerCase()}\u00a0»`,
    negation: (categorie) =>
      `n'ont pas choisi l'option «\u00a0${categorie.toLowerCase()}\u00a0»`,
  },
  {
    presentation: (effectifTotal) =>
      `Le diagramme circulaire ci-dessous donne la répartition de $${effectifTotal}$ élèves d'un lycée, selon la mention obtenue au baccalauréat.`,
    categories: ['Très bien', 'Bien', 'Assez bien', 'Passable'],
    affirmation: (categorie) =>
      `ont obtenu la mention «\u00a0${categorie.toLowerCase()}\u00a0»`,
    negation: (categorie) =>
      `n'ont pas obtenu la mention «\u00a0${categorie.toLowerCase()}\u00a0»`,
  },
]

/**
 * Le disque est partagé en vingtièmes. Seul le secteur interrogé est facile à reconnaître
 * (un quart ou trois quarts, avec un angle droit codé sur le quart) : les autres secteurs prennent des valeurs quelconques.
 */
const totalParts = 20
const couleursSecteurs = [
  orangeMathalea,
  bleuMathalea,
  vertMathalea,
  coopmathsCorpusLightest,
]
// Le secteur interrogé est un quart ou les trois quarts du disque
const partsSecteurInterroge = [5, 15]
const partQuart = 5
// Un secteur trop petit ne laisse pas la place d'écrire sa légende
const partMinimaleAutreSecteur = 4
const partMinimaleComplementaire = 3
// Multiples de 20, inférieurs à 1 000, pour des calculs faisables de tête
const effectifsTotaux = [40, 60, 80, 100, 120, 160, 200]

/**
 * Répartit `reste` vingtièmes en `nombre` secteurs d'au moins `minimum` vingtièmes,
 * aucun ne valant `interdit` (pour ne pas égaler le secteur interrogé).
 */
function repartir(
  reste: number,
  nombre: number,
  minimum: number,
  interdit: number,
): number[] {
  let parts: number[]
  do {
    parts = Array<number>(nombre).fill(minimum)
    for (let i = 0; i < reste - nombre * minimum; i++) {
      parts[randint(0, nombre - 1)]++
    }
  } while (parts.includes(interdit))
  return parts
}

/**
 * @author Stéphane Guyon
 */
export default class LireProportionDiagrammeCirculaire extends ExerciceQcmACourt {
  /** Quatre réponses distinctes, la première étant la bonne. */
  private completerReponses(
    bonneReponse: string,
    candidats: string[],
    remplissage: () => string,
  ): string[] {
    const reponses = [bonneReponse]
    for (const candidat of candidats) {
      if (!reponses.includes(candidat)) reponses.push(candidat)
      if (reponses.length === 4) return reponses
    }
    for (let essai = 0; reponses.length < 4 && essai < 50; essai++) {
      const candidat = remplissage()
      if (!reponses.includes(candidat)) reponses.push(candidat)
    }
    return reponses
  }

  private appliquerLesValeurs(
    contexte: Contexte,
    type: TypeQuestion,
    parts: number[],
    categories: string[],
    indexSecteur: number,
    effectifTotal: number,
  ): void {
    const categorie = categories[indexSecteur]
    const partSecteur = parts[indexSecteur]
    const secteurEffectif = (effectifTotal * partSecteur) / totalParts
    const complementaire = effectifTotal - secteurEffectif

    // Aucune valeur n'est écrite sur le diagramme : seuls les noms des secteurs apparaissent
    const maSerie = new Stat(
      categories.map((nom, index) => [nom, parts[index]]),
      true,
      false,
    )
    const diagramme = maSerie.diagrammeCirc({
      effectifsOn: false,
      rayon: 5,
      legendesDansSecteurs: true,
      codeAnglesDroits: true,
      colors: (index) => couleursSecteurs[index % couleursSecteurs.length],
    })

    const autresParts = parts.filter((_, index) => index !== indexSecteur)
    const bonneReponse = texNombre(
      type === 'effectif' ? secteurEffectif : complementaire,
      0,
    )
    const candidats = [
      type === 'effectif' ? complementaire : secteurEffectif,
      ...autresParts.map((autre) => (effectifTotal * autre) / totalParts),
      effectifTotal / totalParts,
    ].map((valeur) => texNombre(valeur, 0))
    const reponses = this.completerReponses(bonneReponse, candidats, () =>
      texNombre(randint(1, effectifTotal - 1), 0),
    )
    this.reponses = reponses.map((r) => `$${r}$`)

    const introduction = `${contexte.presentation(effectifTotal)}<br>
    ${diagramme}<br><br>`
    const verbe =
      type === 'effectif'
        ? contexte.affirmation(categorie)
        : contexte.negation(categorie)
    const question = `Combien d'élèves ${verbe} ?`
    // Saisie libre non interactive : question ; saisie libre interactive : phrase affirmative à compléter
    this.enonce = `${introduction}${question}`
    this.enonceCourt = () =>
      this.interactif ? introduction : `${introduction}${question}<br>`
    this.texteAvantReponseCourte = `Le nombre d'élèves qui ${verbe} est égal à `
    this.clavierReponseCourte = KeyboardType.clavierNumbers

    const quart = effectifTotal / 4
    const estUnQuart = partSecteur === partQuart
    const calculQuart = (resultat: string) =>
      `$\\dfrac{1}{4}\\times${effectifTotal}=${effectifTotal}\\div4=${resultat}$`
    const calculTroisQuarts = (resultat: string) =>
      `$\\dfrac{3}{4}\\times${effectifTotal}=${effectifTotal}\\div4\\times3=${resultat}$`
    const lectureSecteur = estUnQuart
      ? `Le secteur «${sp()}${categorie}${sp()}» occupe le quart du disque, comme l'indique l'angle droit.`
      : `Le secteur «${sp()}${categorie}${sp()}» occupe les trois quarts du disque : le quart restant est marqué par un angle droit.`
    const effectifSecteur = `Le nombre d'élèves qui ${contexte.affirmation(categorie)} est donc`
    const resultatSecteur = texNombre(secteurEffectif, 0)
    const resultatComplementaire = texNombre(complementaire, 0)

    if (type === 'effectif') {
      this.correction = `${lectureSecteur}<br>
      ${effectifSecteur} ${(estUnQuart ? calculQuart : calculTroisQuarts)(miseEnEvidence(resultatSecteur))}.`
    } else if (estUnQuart) {
      this.correction = `${lectureSecteur}<br>
      ${effectifSecteur} ${calculQuart(resultatSecteur)}.<br>
      Le nombre d'élèves qui ${verbe} est donc $${effectifTotal}-${resultatSecteur}=${miseEnEvidence(resultatComplementaire)}$.`
    } else {
      this.correction = `${lectureSecteur}<br>
      Les élèves qui ${verbe} occupent donc le quart du disque : ${calculQuart(miseEnEvidence(String(quart)))}.`
    }
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const contexte = choice(contextes)
      const type = choice<TypeQuestion>(['effectif', 'complementaire'])
      // Question sur le complémentaire : le quart est cherché et les trois quarts restants sont
      // coupés en trois secteurs inégaux, que l'on ne peut pas lire. Il faut passer par le total.
      const partSecteurInterroge =
        type === 'complementaire' ? partQuart : choice(partsSecteurInterroge)
      const autresParts =
        partSecteurInterroge !== partQuart
          ? [totalParts - partSecteurInterroge]
          : type === 'complementaire'
            ? repartir(
                totalParts - partQuart,
                3,
                partMinimaleComplementaire,
                partQuart,
              )
            : repartir(
                totalParts - partQuart,
                randint(2, 3),
                partMinimaleAutreSecteur,
                partQuart,
              )
      const effectifTotal = choice(effectifsTotaux)
      const noms = shuffle(contexte.categories).slice(0, autresParts.length + 1)
      // Le secteur interrogé est le premier avant mélange ; on retrouve sa place ensuite
      const secteurs = shuffle(
        [partSecteurInterroge, ...autresParts].map((part, index) => ({
          part,
          nom: noms[index],
        })),
      )
      this.appliquerLesValeurs(
        contexte,
        type,
        secteurs.map(({ part }) => part),
        secteurs.map(({ nom }) => nom),
        secteurs.findIndex(({ nom }) => nom === noms[0]),
        effectifTotal,
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Saisie libre uniquement : on retire la case « Version QCM »
    this.besoinFormulaire3CaseACocher = false
    this.champReponseCourteEnLigne = true

    this.versionAleatoire()
  }
}
