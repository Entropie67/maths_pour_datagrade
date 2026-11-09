import { createList } from '../../lib/format/lists'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '0cfa7'
export const refs = {
  'fr-fr': ['1A-S02-10', '2A-S2-10', 'BP1AUTO031'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Étudier l'effet du remplacement de deux valeurs"
export const dateDePublication = '05/07/2026'

type AffirmationVraie =
  'La moyenne augmente.' | "L'étendue augmente." | 'La médiane augmente.'

/**
 * @author Stéphane Guyon
 */
export default class RemplacerValeurSerieQCM extends ExerciceQcmA {
  private melangerSerie(serie: number[]): number[] {
    const serieTriee = [...serie].sort((a, b) => a - b)
    let serieMelangee = shuffle([...serie])
    let compteur = 0
    while (
      compteur < 20 &&
      serieMelangee.every((valeur, index) => valeur === serieTriee[index])
    ) {
      serieMelangee = shuffle([...serie])
      compteur++
    }
    return serieMelangee
  }

  private appliquerLesValeurs(
    serie: number[],
    anciennesValeurs: [number, number],
    nouvellesValeurs: [number, number],
    affirmationVraie: AffirmationVraie,
  ): void {
    const serieTriee = [...serie].sort((a, b) => a - b)
    const serieEnonce = this.melangerSerie(serie)
    const remplacements = new Map<number, number>([
      [anciennesValeurs[0], nouvellesValeurs[0]],
      [anciennesValeurs[1], nouvellesValeurs[1]],
    ])
    const serieModifieeTriee = serie
      .map((valeur) => remplacements.get(valeur) ?? valeur)
      .sort((a, b) => a - b)
    const medianeInitiale = serieTriee[2]
    const medianeModifiee = serieModifieeTriee[2]
    const etendueInitiale = serieTriee[4] - serieTriee[0]
    const etendueModifiee = serieModifieeTriee[4] - serieModifieeTriee[0]
    const sommeInitiale = serieTriee.reduce(
      (somme, valeur) => somme + valeur,
      0,
    )
    const sommeModifiee = serieModifieeTriee.reduce(
      (somme, valeur) => somme + valeur,
      0,
    )
    const effectifInitial = serieTriee.length
    const effectifModifie = serieModifieeTriee.length
    const moyenneAugmente = sommeModifiee > sommeInitiale
    const medianeAugmente = medianeModifiee > medianeInitiale
    const medianeDiminue = medianeModifiee < medianeInitiale
    const etendueAugmente = etendueModifiee > etendueInitiale

    const variationMediane = medianeAugmente
      ? 'augmente'
      : medianeDiminue
        ? 'diminue'
        : "n'augmente pas"
    const variationEtendue = etendueAugmente
      ? 'augmente'
      : etendueModifiee < etendueInitiale
        ? 'diminue'
        : 'ne change pas'
    const variationMoyenne = moyenneAugmente
      ? 'augmente'
      : sommeModifiee < sommeInitiale
        ? 'diminue'
        : 'ne change pas'
    const mettreEnEvidenceSiVrai = (texte: string, affirmation: string) =>
      affirmation === affirmationVraie
        ? `${texteEnCouleurEtGras(texte)}`
        : texte

    this.enonce = `La série suivante est donnée : $${serieEnonce.join('\\,;\\,')}$.<br>
    On remplace les valeurs $${anciennesValeurs[0]}$ et $${anciennesValeurs[1]}$ respectivement par $${nouvellesValeurs[0]}$ et $${nouvellesValeurs[1]}$.<br>
    Quelle affirmation est vraie ?`

    const distracteurs = [
      'La moyenne augmente.',
      'La médiane augmente.',
      "L'étendue augmente.",
      "L'effectif de la série augmente.",
    ].filter((affirmation) => affirmation !== affirmationVraie)

    this.reponses = [affirmationVraie, ...distracteurs].slice(0, 4)

    this.correction = `On commence par ranger les deux séries dans l'ordre croissant.<br>
    Série initiale : $${serieTriee.join('\\,;\\,')}$.<br>
    Nouvelle série : $${serieModifieeTriee.join('\\,;\\,')}$.
    ${createList({
      items: [
        `Effectif : il y a $${effectifInitial}$ valeurs dans la série initiale et $${effectifModifie}$ valeurs dans la nouvelle série. L'effectif n'augmente donc pas.`,
        `Médiane : la série contient $5$ valeurs, donc la médiane est la $3^e$ valeur. Elle vaut $${medianeInitiale}$ dans la série initiale et $${medianeModifiee}$ dans la nouvelle série. Donc ${mettreEnEvidenceSiVrai(`la médiane ${variationMediane}`, 'La médiane augmente.')}.`,
        `Étendue : l'étendue initiale vaut $${serieTriee[4]}-${serieTriee[0]}=${etendueInitiale}$. La nouvelle étendue vaut $${serieModifieeTriee[4]}-${serieModifieeTriee[0]}=${etendueModifiee}$. Donc ${mettreEnEvidenceSiVrai(`l'étendue ${variationEtendue}`, "L'étendue augmente.")}.`,
        `Moyenne : la somme des valeurs passe de $${sommeInitiale}$ à $${sommeModifiee}$, avec le même effectif. Donc ${mettreEnEvidenceSiVrai(`la moyenne ${variationMoyenne}`, 'La moyenne augmente.')}.`,
      ],
      style: 'puces',
    })}`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      [13, 7, 9, 4, 10],
      [4, 7],
      [5, 8],
      'La moyenne augmente.',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const scenario = choice(['moyenne', 'etendue', 'mediane'])
    const minimum = randint(3, 6)
    const deuxieme = minimum + randint(2, 3)
    const mediane = deuxieme + randint(3, 4)
    const quatrieme = mediane + randint(2, 3)
    const maximum = Math.min(20, quatrieme + randint(2, 3))
    const serieTriee = [minimum, deuxieme, mediane, quatrieme, maximum]
    const serie = this.melangerSerie(serieTriee)

    if (scenario === 'moyenne') {
      this.appliquerLesValeurs(
        serie,
        [deuxieme, quatrieme],
        [deuxieme + 1, quatrieme + 1],
        'La moyenne augmente.',
      )
    } else if (scenario === 'etendue') {
      this.appliquerLesValeurs(
        serie,
        [minimum, maximum],
        [minimum - 1, maximum + 1],
        "L'étendue augmente.",
      )
    } else {
      this.appliquerLesValeurs(
        serie,
        [deuxieme, mediane],
        [deuxieme - 1, mediane + 1],
        'La médiane augmente.',
      )
    }
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
