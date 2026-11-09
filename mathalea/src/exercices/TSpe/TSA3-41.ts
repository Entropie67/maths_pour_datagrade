import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Lire graphiquement des informations sur la convexité'
export const dateDePublication = '10/08/2026'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

export const uuid = 'a341f'
export const refs = {
  'fr-fr': ['TSA3-41', 'TCA7-41'],
  'fr-ch': [],
}

type TypeRepresentation = 1 | 2 | 3

function intervalle(a: number, b: number): string {
  return `[${texNombre(a, 1)}\\,;\\,${texNombre(b, 1)}]`
}

function uniteVerticale(ymin: number, ymax: number): number {
  return Math.min(1, 10 / (ymax - ymin))
}

function parametresVerticaux(
  ymin: number,
  ymax: number,
): {
  ymin: number
  ymax: number
  pas: number
  unite: number
} {
  const amplitude = ymax - ymin
  const pas = amplitude > 25 ? 5 : amplitude > 14 ? 2 : 1
  const yminAdapte = pas === 5 ? Math.floor(ymin / pas) * pas : ymin
  const ymaxAdapte = pas === 5 ? Math.ceil(ymax / pas) * pas : ymax

  return {
    ymin: yminAdapte,
    ymax: ymaxAdapte,
    pas,
    unite: uniteVerticale(yminAdapte, ymaxAdapte),
  }
}

function positionLabelCourbe(
  fonction: (x: number) => number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  pasY: number,
  yUnite: number,
  xUnite: number,
): { x: number; y: number } {
  const margeVerticale = Math.max(pasY * 0.7, (ymax - ymin) * 0.08)
  const candidats = Array.from(
    { length: 9 },
    (_, index) => xmax - 0.45 - index * ((xmax - xmin - 0.9) / 8),
  )
  const x =
    candidats.find((abscisse) => {
      const image = fonction(abscisse)
      return image >= ymin + margeVerticale && image <= ymax - margeVerticale
    }) ?? (xmin + xmax) / 2
  const image = fonction(x)
  const pasDerivee = Math.max((xmax - xmin) / 1000, 0.001)
  const penteGraphique =
    ((fonction(x + pasDerivee) - fonction(x - pasDerivee)) / (2 * pasDerivee)) *
    (yUnite / xUnite)
  const norme = Math.hypot(penteGraphique, 1)
  const decalage = 1.5
  const normaleXBrute = (-penteGraphique * decalage) / norme
  const normaleX = Math.max(-0.85, Math.min(0.85, normaleXBrute))
  const normaleY = decalage / norme
  const margeX = 0.65
  const margeY = 0.45
  const candidatsLabel = [1, -1].map((sens) => ({
    x: x * xUnite + sens * normaleX,
    y: image * yUnite + sens * normaleY,
  }))
  const espaceDansCadre = (position: { x: number; y: number }): number =>
    Math.min(
      position.x - (xmin * xUnite + margeX),
      xmax * xUnite - margeX - position.x,
      position.y - (ymin * yUnite + margeY),
      ymax * yUnite - margeY - position.y,
    )
  const position = candidatsLabel.sort(
    (position1, position2) =>
      espaceDansCadre(position2) - espaceDansCadre(position1),
  )[0]

  return {
    x: Math.max(
      xmin * xUnite + margeX,
      Math.min(xmax * xUnite - margeX, position.x),
    ),
    y: Math.max(
      ymin * yUnite + margeY,
      Math.min(ymax * yUnite - margeY, position.y),
    ),
  }
}

function graphique(
  fonction: (x: number) => number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  nomCourbe: string,
  objetsSupplementaires: ReturnType<typeof segment>[] = [],
  scale = 0.7,
  xUnite = 1,
  yUniteImposee?: number,
): string {
  const parametresY = parametresVerticaux(ymin, ymax)
  ymin = parametresY.ymin
  ymax = parametresY.ymax
  const yUnite = yUniteImposee ?? parametresY.unite
  const pasY = parametresY.pas
  const r = repere({
    xMin: xmin,
    xMax: xmax,
    xUnite,
    yMin: ymin,
    yMax: ymax,
    yUnite,
    yThickDistance: pasY,
    yLabelDistance: pasY,
    grilleX: false,
    grilleY: false,
    grilleSecondaire: true,
    grilleSecondaireXDistance: xUnite,
    grilleSecondaireYDistance: pasY,
  })
  const c = courbe(fonction, {
    repere: r,
    color: bleuMathalea,
    epaisseur: 2.5,
    xMin: xmin,
    xMax: xmax,
    yMin: ymin,
    yMax: ymax,
    step: 0.03,
  })
  const positionLabel = positionLabelCourbe(
    fonction,
    xmin,
    xmax,
    ymin,
    ymax,
    pasY,
    yUnite,
    xUnite,
  )
  const label = latex2d(nomCourbe, positionLabel.x, positionLabel.y, {
    color: bleuMathalea,
    letterSize: 'small',
  })
  const cadre = [
    segment(xmin * xUnite, ymin * yUnite, xmax * xUnite, ymin * yUnite),
    segment(xmax * xUnite, ymin * yUnite, xmax * xUnite, ymax * yUnite),
    segment(xmax * xUnite, ymax * yUnite, xmin * xUnite, ymax * yUnite),
    segment(xmin * xUnite, ymax * yUnite, xmin * xUnite, ymin * yUnite),
  ]
  cadre.forEach((cote) => {
    cote.epaisseur = 1
  })

  return mathalea2d(
    {
      xmin: xmin * xUnite - 0.3,
      xmax: xmax * xUnite + 0.3,
      ymin: ymin * yUnite - 0.3,
      ymax: ymax * yUnite + 0.3,
      pixelsParCm: 22,
      scale,
      center: !context.isHtml,
    },
    r,
    ...cadre,
    c,
    ...objetsSupplementaires,
    label,
  )
}

/**
 * @author Stéphane Guyon
 */
export default class ConvexiteEtCourbesDerivees extends ExerciceQcmA {
  private ordreDesCas: TypeRepresentation[] = shuffle([
    1, 2, 3,
  ] as TypeRepresentation[])
  private indiceDuCas = 0

  private casCourbeDeF(): void {
    const a = randint(-2, 2)
    const b = randint(-2, 2)
    const signe = randint(0, 1) === 0 ? -1 : 1
    const xmin = a - 3
    const xmax = a + 3
    const ymin = b - 9
    const ymax = b + 9
    const yUnite = uniteVerticale(ymin, ymax)
    const f = (x: number) => signe * (x - a) ** 3 + b
    const tangente = segment(xmin, b * yUnite, xmax, b * yUnite, orangeMathalea)
    tangente.epaisseur = 2
    tangente.pointilles = 2
    const figure = graphique(f, xmin, xmax, ymin, ymax, '\\mathcal C_f', [
      tangente,
    ])
    const gauche = intervalle(xmin, a)
    const droite = intervalle(a, xmax)
    const autourDuPoint = intervalle(a - 1, a + 1)
    const bonneReponseConvexite =
      signe > 0
        ? `$f$ est concave sur $${gauche}$.`
        : `$f$ est convexe sur $${gauche}$.`
    const proposerPointInflexion = randint(0, 1) === 0
    const bonneReponse = proposerPointInflexion
      ? `La courbe de $f$ admet un point d’inflexion d’abscisse $${a}$.`
      : bonneReponseConvexite
    const reponseInversee =
      signe > 0
        ? `$f$ est concave sur $${droite}$.`
        : `$f$ est convexe sur $${droite}$.`
    const courbureAutourDuPoint =
      randint(0, 1) === 0
        ? `$f$ est convexe sur $${autourDuPoint}$.`
        : `$f$ est concave sur $${autourDuPoint}$.`
    const distracteurVariation = proposerPointInflexion
      ? randint(0, 1) === 0
        ? `$f$ admet un maximum en $${a}$.`
        : `$f$ admet un minimum en $${a}$.`
      : `La courbe de $f$ admet un point d’inflexion d’abscisse $${a + (randint(0, 1) === 0 ? -1 : 1)}$.`

    this.enonce = `On considère une fonction $f$ deux fois dérivable sur $${intervalle(xmin, xmax)}$. On a représenté ci-dessous sa courbe $\\mathcal C_f$. La droite en pointillés est la tangente à $\\mathcal C_f$ au point d’abscisse $${a}$.<br>${figure}<br>
    Quelle affirmation est correcte ?`
    this.reponses = [
      bonneReponse,
      reponseInversee,
      courbureAutourDuPoint,
      distracteurVariation,
    ]
    this.correction = `La tangente à $\\mathcal C_f$ au point d’abscisse $${a}$ traverse la courbe : le point correspondant est donc un point d’inflexion.<br>
    Lorsque la courbe est orientée vers le haut, la fonction est convexe ; lorsqu’elle est orientée vers le bas, la fonction est concave.<br>
    On examine les quatre affirmations :<br>
    • ${texteEnCouleurEtGras(bonneReponse, 'black')} ${proposerPointInflexion ? `La tangente traverse la courbe au point d’abscisse $${a}$` : `Sur l’intervalle proposé, la courbe est orientée vers ${signe > 0 ? 'le bas' : 'le haut'}`}. Cette affirmation est vraie.<br>
    • ${texteEnCouleurEtGras(reponseInversee, 'black')} Sur cet intervalle, la courbe est orientée vers ${signe > 0 ? 'le haut' : 'le bas'}. Cette affirmation est fausse.<br>
    • ${texteEnCouleurEtGras(courbureAutourDuPoint, 'black')} Cet intervalle contient le point d’inflexion d’abscisse $${a}$. Cette affirmation est fausse.<br>
    • ${texteEnCouleurEtGras(distracteurVariation, 'black')} ${proposerPointInflexion ? `Le point d’abscisse $${a}$ est un point d’inflexion, pas un extremum` : `Le changement de convexité a lieu en $${a}$`}. Cette affirmation est fausse.<br>
    La bonne réponse est donc : ${texteEnCouleurEtGras(bonneReponse)}`
  }

  private casCourbeDeFPrime(): void {
    const centre = randint(-2, 2)
    const h = randint(1, 2)
    const a = centre - h
    const b = centre + h
    const signe = randint(0, 1) === 0 ? -1 : 1
    const xmin = centre - 2 * h
    const xmax = centre + 2 * h
    const fPrime = (x: number) => {
      const t = x - centre
      return signe * (t ** 3 - 3 * h ** 2 * t)
    }
    const valeurs = [xmin, a, b, xmax].map(fPrime)
    const ymin = Math.floor(Math.min(...valeurs)) - 2
    const ymax = Math.ceil(Math.max(...valeurs)) + 2
    const parametresY = parametresVerticaux(ymin, ymax)
    const xUnite = 16 / (xmax - xmin)
    const yUnite = 12 / (parametresY.ymax - parametresY.ymin)
    const tangenteA = segment(
      (a - 0.65) * xUnite,
      fPrime(a) * yUnite,
      (a + 0.65) * xUnite,
      fPrime(a) * yUnite,
      orangeMathalea,
    )
    const tangenteB = segment(
      (b - 0.65) * xUnite,
      fPrime(b) * yUnite,
      (b + 0.65) * xUnite,
      fPrime(b) * yUnite,
      orangeMathalea,
    )
    tangenteA.epaisseur = 2
    tangenteB.epaisseur = 2
    const figure = graphique(
      fPrime,
      xmin,
      xmax,
      ymin,
      ymax,
      "\\mathcal C_{f'}",
      [tangenteA, tangenteB],
      1,
      xUnite,
      yUnite,
    )
    const gauche = intervalle(xmin, a)
    const interieur = intervalle(a, b)
    const droite = intervalle(b, xmax)
    const bonnesReponses =
      signe > 0
        ? [
            {
              texte: `$f$ est convexe sur $${gauche}$.`,
              justification: `sur $${gauche}$, $f'$ est croissante, donc $f''$ est positive sur cet intervalle`,
            },
            {
              texte: `$f$ est concave sur $${interieur}$.`,
              justification: `sur $${interieur}$, $f'$ est décroissante, donc $f''$ est négative sur cet intervalle`,
            },
            {
              texte: `$f$ est convexe sur $${droite}$.`,
              justification: `sur $${droite}$, $f'$ est croissante, donc $f''$ est positive sur cet intervalle`,
            },
          ]
        : [
            {
              texte: `$f$ est concave sur $${gauche}$.`,
              justification: `sur $${gauche}$, $f'$ est décroissante, donc $f''$ est négative sur cet intervalle`,
            },
            {
              texte: `$f$ est convexe sur $${interieur}$.`,
              justification: `sur $${interieur}$, $f'$ est croissante, donc $f''$ est positive sur cet intervalle`,
            },
            {
              texte: `$f$ est concave sur $${droite}$.`,
              justification: `sur $${droite}$, $f'$ est décroissante, donc $f''$ est négative sur cet intervalle`,
            },
          ]
    const bonneReponseChoisie = choice(bonnesReponses)
    const bonneReponse = bonneReponseChoisie.texte

    const intervalleSigneConstant = intervalle(a, centre)
    const distracteurs = shuffle([
      {
        texte:
          signe > 0
            ? `$f$ est concave sur $${gauche}$.`
            : `$f$ est convexe sur $${gauche}$.`,
        justification:
          signe > 0
            ? `sur $${gauche}$, la courbe de $f'$ est concave, mais $f'$ est croissante : $f$ est donc convexe`
            : `sur $${gauche}$, la courbe de $f'$ est convexe, mais $f'$ est décroissante : $f$ est donc concave`,
      },
      {
        texte:
          signe > 0
            ? `$f$ est croissante sur $${gauche}$.`
            : `$f$ est décroissante sur $${gauche}$.`,
        justification: `sur $${gauche}$, $f'$ est ${signe > 0 ? 'croissante' : 'décroissante'}, mais elle change de signe. La fonction $f$ est donc ${signe > 0 ? 'décroissante puis croissante' : 'croissante puis décroissante'}`,
      },
      {
        texte:
          signe > 0
            ? `$f$ est convexe sur $${intervalleSigneConstant}$.`
            : `$f$ est concave sur $${intervalleSigneConstant}$.`,
        justification: `sur $${intervalleSigneConstant}$, $f'$ est ${signe > 0 ? 'positive' : 'négative'}, ce qui renseigne sur les variations de $f$, pas sur sa convexité. Comme $f'$ y est ${signe > 0 ? 'décroissante' : 'croissante'}, $f$ y est ${signe > 0 ? 'concave' : 'convexe'}`,
      },
      {
        texte: `La courbe de $f$ admet un point d’inflexion d’abscisse $${centre}$.`,
        justification: `$${centre}$ est une racine de $f'$, ce qui correspond à un extremum de $f$. Les changements de variation de $f'$ ont lieu en $${a}$ et $${b}$ : ce sont ces abscisses qui correspondent aux points d’inflexion de la courbe de $f$`,
      },
    ]).slice(0, 3)

    this.enonce = `On considère une fonction $f$ deux fois dérivable sur $${intervalle(xmin, xmax)}$. On a représenté ci-dessous la courbe de sa fonction dérivée $f'$. Les tangentes aux sommets d’abscisses $${a}$ et $${b}$ sont horizontales.<br>${figure}<br>
    Quelle affirmation décrit correctement la convexité de la fonction $f$ ?`
    this.reponses = [bonneReponse, ...distracteurs.map(({ texte }) => texte)]
    this.correction = `La fonction $f$ est convexe lorsque sa dérivée $f'$ est croissante et concave lorsque $f'$ est décroissante.<br>
    On examine les quatre affirmations :<br>
    • ${texteEnCouleurEtGras(bonneReponse, 'black')} ${bonneReponseChoisie.justification[0].toUpperCase()}${bonneReponseChoisie.justification.slice(1)}. Cette affirmation est vraie.<br>
    ${distracteurs.map(({ texte, justification }) => `• ${texteEnCouleurEtGras(texte, 'black')} ${justification[0].toUpperCase()}${justification.slice(1)}. Cette affirmation est fausse.`).join('<br>')}<br>
    La bonne réponse est donc : ${texteEnCouleurEtGras(bonneReponse)}`
  }

  private casCourbeDeFSeconde(): void {
    const [a, b] = choice([
      [-3, 1],
      [-3, 3],
      [-2, 2],
      [-1, 1],
      [-1, 3],
    ] as Array<[number, number]>)
    const signe = randint(0, 1) === 0 ? -1 : 1
    const xmin = a - 2
    const xmax = b + 2
    const fSeconde = (x: number) => signe * (x - a) * (x - b)
    const sommet = (a + b) / 2
    const valeurs = [fSeconde(xmin), fSeconde(xmax), fSeconde(sommet)]
    const ymin = Math.floor(Math.min(...valeurs)) - 2
    const ymax = Math.ceil(Math.max(...valeurs)) + 2
    const figure = graphique(
      fSeconde,
      xmin,
      xmax,
      ymin,
      ymax,
      "\\mathcal C_{f''}",
    )
    const interieur = intervalle(a, b)
    const gauche = intervalle(xmin, a)
    const droite = intervalle(b, xmax)
    const bonneReponse =
      signe > 0
        ? `$f$ est concave sur $${interieur}$.`
        : `$f$ est convexe sur $${interieur}$.`
    const reponseInversee =
      signe > 0
        ? `$f$ est concave sur $${gauche}$.`
        : `$f$ est convexe sur $${gauche}$.`
    const distracteurVariationDeFPrime =
      signe > 0
        ? `$f'$ est décroissante sur $${droite}$.`
        : `$f'$ est croissante sur $${droite}$.`
    const distracteurConfusionFEtFSeconde = `$f$ est concave sur $${intervalle(xmin, xmax)}$.`
    const troisiemeDistracteur =
      signe < 0 ? distracteurConfusionFEtFSeconde : distracteurVariationDeFPrime
    const proposerPointInflexion = randint(0, 1) === 0
    const distracteurExtremumDeFSeconde = proposerPointInflexion
      ? `La courbe de $f$ admet un point d’inflexion d’abscisse $${sommet}$.`
      : signe > 0
        ? `$f'$ admet un minimum en $${sommet}$.`
        : `$f'$ admet un maximum en $${sommet}$.`

    this.enonce = `On considère une fonction $f$ deux fois dérivable sur $${intervalle(xmin, xmax)}$. On a représenté ci-dessous la courbe de sa dérivée seconde $f''$. Cette courbe coupe l’axe des abscisses en $${a}$ et $${b}$.<br>${figure}<br>
    Quelle affirmation décrit correctement la convexité de la fonction $f$ ?`
    this.reponses = [
      bonneReponse,
      reponseInversee,
      troisiemeDistracteur,
      distracteurExtremumDeFSeconde,
    ]
    this.correction = `La fonction $f$ est convexe lorsque $f''$ est positive et concave lorsque $f''$ est négative.<br>
    On examine les quatre affirmations :<br>
    • ${texteEnCouleurEtGras(bonneReponse, 'black')} Le signe de $f''$ entre ses deux racines permet de conclure. Cette affirmation est vraie.<br>
    • ${texteEnCouleurEtGras(reponseInversee, 'black')} Sur $${gauche}$, $f''$ est ${signe > 0 ? 'positive' : 'négative'}, donc $f$ y est ${signe > 0 ? 'convexe' : 'concave'}. Cette affirmation est fausse.<br>
    • ${texteEnCouleurEtGras(troisiemeDistracteur, 'black')} ${signe < 0 ? `La courbe représentée est celle de $f''$. Le fait que cette courbe soit concave ne signifie pas que $f$ est concave : la convexité de $f$ dépend du signe de $f''$` : `Sur $${droite}$, $f''$ est positive, donc $f'$ est croissante`}. Cette affirmation est fausse.<br>
    • ${texteEnCouleurEtGras(distracteurExtremumDeFSeconde, 'black')} ${proposerPointInflexion ? `La dérivée seconde change de signe en $${a}$ et en $${b}$ ; les points d’inflexion de la courbe de $f$ ont donc ces abscisses` : `L’abscisse indiquée est celle de l’extremum de la fonction $f''$ représentée, et non d’un extremum de $f'$`}. Cette affirmation est fausse.<br>
    La bonne réponse est donc : ${texteEnCouleurEtGras(bonneReponse)}`
  }

  versionAleatoire: () => void = () => {
    const cas = this.ordreDesCas[this.indiceDuCas % this.ordreDesCas.length]
    this.indiceDuCas++
    switch (cas) {
      case 1:
        this.casCourbeDeF()
        break
      case 2:
        this.casCourbeDeFPrime()
        break
      case 3:
        this.casCourbeDeFSeconde()
        break
    }
  }

  nouvelleVersion(): void {
    this.ordreDesCas =
      this.sup3 >= 1 && this.sup3 <= 3
        ? [this.sup3 as TypeRepresentation]
        : shuffle([1, 2, 3] as TypeRepresentation[])
    this.indiceDuCas = 0
    super.nouvelleVersion()
    if (!context.isHtml) {
      this.listeQuestions = this.listeQuestions.map((question) =>
        question.replaceAll(
          '\\begin{qcmprop}[cols=4]',
          '\\begin{qcmprop}[cols=1]',
        ),
      )
    }
  }

  constructor() {
    super()
    this.sup3 = 4
    this.besoinFormulaire3Numerique = [
      'Situations proposées',
      4,
      "1 : Courbe de f\n2 : Courbe de f'\n3 : Courbe de f''\n4 : Mélange",
    ]

    this.versionAleatoire()
  }
}
