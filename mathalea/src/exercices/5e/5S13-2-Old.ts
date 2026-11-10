import { diagrammeBarres } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

export const titre = 'Calculer des fréquences statistiques'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

type Serie = {
  lieu: string
  individus: string
  caractere: string
  caracterePourTableau: string
  effectifTotal: number
  modalites: string[]
  effectifs: number[]
  rangEffectifCache: number
  entreeCachee: string
}
/**
 |*  888    888          888
 |*  888    888          888
 |*  888    888          888
 |*  8888888888  .d88b.  888 88888b.   .d88b.  888d888 .d8888b
 |*  888    888 d8P  Y8b 888 888 "88b d8P  Y8b 888P"   88K
 |*  888    888 88888888 888 888  888 88888888 888     "Y8888b.
 |*  888    888 Y8b.     888 888 d88P Y8b.     888          X88
 |*  888    888  "Y8888  888 88888P"   "Y8888  888      88888P'
 |*                          888
 |*                          888
 |*                          888
 */

/**
 * Construit un tableau d'entiers de longueur connue
 * dont la somme des éléments est égale à un total connu.
 * @author Eve & Sylvain Chambon
 * @param {int} nbElements Nombre d'entiers dans le tableau
 * @param {int} total Somme des éléments du tableau
 * @returns {Array} Tableau d'entier
 * @example > listeEntiersDepuisSomme(100,3)
 * < [34,29,37]
 */
function listeEntiersDepuisSomme(total: number, nbElements: number) {
  const valeurs = new Array(nbElements)
  // Répartition équitable du total dans les éléments du tableau
  const quotient = Math.floor(total / nbElements)
  const reste = total % nbElements
  for (let i = 0; i < valeurs.length - 1; i++) {
    valeurs[i] = quotient
  }
  valeurs[valeurs.length - 1] = quotient + reste
  // Changement des valeurs
  for (let i = 0, delta = 0; i < valeurs.length - 2; i++) {
    // création du delta
    delta = randint(-valeurs[i] + 1, valeurs[i] - 1)
    valeurs[i] += delta
    // répartition du delta entre les valeurs restantes du tableau
    const diviseur = valeurs.length - i - 2
    let q = 0
    if (delta >= 0) {
      q = Math.floor(delta / diviseur)
    } else {
      q = Math.ceil(delta / diviseur)
    }
    const r = delta % diviseur
    for (let j = i + 1; j < valeurs.length - 1; j++) {
      valeurs[j] -= q
    }
    valeurs[valeurs.length - 1] -= r
  }
  return valeurs
}

function graphique(
  hauteursBarres: number[],
  etiquettes: string[],
  {
    reperageTraitPointille = false,
    couleurDeRemplissage = bleuMathalea,
    titreAxeVertical = '',
    titre = '',
    hauteurDiagramme = 8,
    coeff = 2,
    axeVertical = false,
    etiquetteValeur = true,
    labelAxeVert = false,
  },
) {
  const diagramme = diagrammeBarres(hauteursBarres, etiquettes, {
    reperageTraitPointille,
    couleurDeRemplissage,
    titreAxeVertical,
    titre,
    hauteurDiagramme,
    coeff,
    axeVertical,
    etiquetteValeur,
    labelAxeVert,
  })
  return mathalea2d(
    Object.assign(
      {},
      fixeBordures([diagramme], { rxmin: -3, rymin: -3, rymax: 1.5 }),
      {
        display: 'inline' as const,
        scale: 0.5,
      },
    ),
    diagramme,
  )
}

/**
 |*  8888888888                                    d8b
 |*  888                                           Y8P
 |*  888
 |*  8888888    888  888  .d88b.  888d888  .d8888b 888  .d8888b  .d88b.
 |*  888        `Y8bd8P' d8P  Y8b 888P"   d88P"    888 d88P"    d8P  Y8b
 |*  888          X88K   88888888 888     888      888 888      88888888
 |*  888        .d8""8b. Y8b.     888     Y88b.    888 Y88b.    Y8b.
 |*  8888888888 888  888  "Y8888  888      "Y8888P 888  "Y8888P  "Y8888
 */

/**
 * La classe Population sert à construire la série basée sur le theme choisi en paramètre
 */
class Population {
  lieu: string
  individus: string
  caractere: string
  caracterePourTableau: string
  effectifTotal: number
  modalites: string[]
  effectifs: number[]
  rangEffectifCache: number
  entreeCachee: string

  constructor(theme: string) {
    // dictionnaires des séries
    const listeThemes = ['etablissement', 'salon', 'parking', 'collection'] // chaque theme est une clé du dictionnaire
    const series = new Map()
    series.set('etablissement', {
      lieu: 'un établissement',
      individus: 'élèves',
      caractere: 'leur sport préféré',
      caracterePourTableau: 'Sports',
      modalites: [
        'Football',
        'Rugby',
        'Basket',
        'Tennis',
        'Judo',
        'Handball',
        'Volleyball',
        'Athlétisme',
        'Pingpong',
      ],
    })
    series.set('salon', {
      lieu: 'un salon européen de esport',
      individus: 'visiteurs',
      caractere: "leur pays d'origine",
      caracterePourTableau: 'Pays',
      modalites: [
        'France',
        'Angleterre',
        'Hollande',
        'Espagne',
        'Italie',
        'Belgique',
        'Allemagne',
        'Portugal',
        'Autriche',
      ],
    })
    series.set('parking', {
      lieu: 'un parking de supermarché',
      individus: 'voitures',
      caractere: 'leur couleur',
      caracterePourTableau: 'Couleurs',
      modalites: [
        'Noir',
        'Blanc',
        'Bleu',
        'Rouge',
        'Vert',
        'Gris',
        'Marron',
        'Jaune',
        'Orange',
      ],
    })
    series.set('collection', {
      lieu: 'une collection',
      individus: 'disques',
      caractere: 'leur style de musique',
      caracterePourTableau: 'Styles',
      modalites: [
        'Pop',
        'Jazz',
        'Rap',
        'RnB',
        'Folk',
        'Rock',
        'Électro',
        'Reggae',
        'Soul',
      ],
    })
    // construction de la série
    let serie
    if (theme === 'hasard') {
      serie = series.get(choice(listeThemes))
    } else {
      serie = series.get(theme)
    }
    this.lieu = serie.lieu
    this.individus = serie.individus
    this.caractere = serie.caractere
    this.caracterePourTableau = serie.caracterePourTableau
    this.effectifTotal = choice([100, 120, 150, 200, 250, 400, 500, 1000])
    this.modalites = shuffle(
      serie.modalites.slice(0, randint(5, serie.modalites.length)),
    )
    this.effectifs = listeEntiersDepuisSomme(
      this.effectifTotal,
      this.modalites.length,
    )
    this.rangEffectifCache = randint(0, this.modalites.length - 1)
    this.entreeCachee = this.modalites[this.rangEffectifCache]
  }

  getPreambule(styleExo: 'tableau' | 'diagramme') {
    let preambule = `Dans ${this.lieu} comptant ${this.effectifTotal} ${this.individus}, on a noté ${this.caractere}.<br>`
    switch (styleExo) {
      case 'tableau':
        preambule +=
          'On a consigné les résultats dans le tableau suivant :<br><br>'
        break
      case 'diagramme':
      default:
        preambule +=
          "On a représenté ces données à l'aide du diagramme ci-dessous.<br><br>"
        break
    }
    return preambule
  }

  getEntrees() {
    const entrees = new Map()
    for (let i = 0; i < this.modalites.length; i++) {
      entrees.set(this.modalites[i], this.effectifs[i])
    }
    return entrees
  }
}

/**
 * Calculs de fréquences sur une série qualitative
 * avec un effectif manquant et l'effectif total donné
 * @author Eve & Sylvain CHAMBON

 */
export const uuid = 'ff67d'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * version 0 :
 * La consigne avec un tableau d'effectifs
 * */
function exerciceAvecTableau(
  theme: string,
  exercice: Exercice,
  numero: number,
): { questions: string; corrections: string; effectifs: number[] } {
  // On a besoin de l'exercice et du numéro de question pour l'interactif
  // paramètres du problème
  const serie = new Population(theme)
  let preambule = serie.getPreambule('tableau')
  // construction du tableau
  const entetesColonnes = [`\\text{\\textbf{${serie.caracterePourTableau}}}`]
  for (const modalite of serie.modalites) {
    entetesColonnes.push(`\\text{${modalite}}`)
  }
  entetesColonnes.push('\\text{\\textbf{TOTAL}}')
  const entetesLignes = [
    '\\text{\\textbf{Effectifs}}',
    '\\text{\\textbf{Fréquences}}',
  ]
  const cellules = []
  // première ligne des effectifs
  serie.effectifs.forEach((eff, index) => {
    if (index !== serie.rangEffectifCache) {
      cellules.push(eff)
    } else {
      cellules.push('')
    }
  })
  cellules.push(`${serie.effectifTotal}`)
  // deuxième ligne de fréquences (vide)
  for (let i = 0; i <= serie.effectifs.length; i++) {
    cellules.push('')
  }
  preambule += tableauColonneLigne(
    entetesColonnes,
    entetesLignes,
    cellules,
    1.5,
  )
  preambule += '<br>'
  const texte = questionsEtCorrections(preambule, serie, exercice, numero) // on récupère les questions/réponses en relation
  return {
    questions: texte.questions,
    corrections: texte.corrections,
    effectifs: serie.effectifs,
  } // On ajoute les effectifs pour ne pas avoir de doublons dans les différentes questions
}

/**
 * version 1 :
 * La consigne avec un diagramme bâton
 * */
function exerciceAvecDiagramme(
  theme: string,
  exercice: Exercice,
  numero: number,
): { questions: string; corrections: string; effectifs: number[] } {
  // On a besoin de l'exercice et du numéro de question pour l'interactif
  // paramètres du problème
  const serie = new Population(theme)
  let preambule = serie.getPreambule('diagramme')
  // construction du diagramme
  const effectifsSansValeurCachee = serie.effectifs.map((elt, i) =>
    i !== serie.rangEffectifCache ? elt : 0,
  )
  const diagrammeBaton = graphique(effectifsSansValeurCachee, serie.modalites, {
    reperageTraitPointille: false,
    axeVertical: true,
    titreAxeVertical: 'Effectifs',
    labelAxeVert: true,
  })
  preambule += diagrammeBaton
  const texte = questionsEtCorrections(preambule, serie, exercice, numero) // on,numero récupère les questions/réponses en relation
  return {
    questions: texte.questions,
    corrections: texte.corrections,
    effectifs: serie.effectifs,
  } // On ajoute les effectifs pour ne pas avoir de doublons dans les différentes questions
}

/**
 * Les questions non modifiables, seule la physionomie de la consigne change (données en tableau ou en diagramme)...
 * Une seule fonction donc pour générer les questions et leurs corrections identiques pour les deux versions
 * @param {Map} entreesTableau l'objet Map avec les entrees du tableau sport/effectif
 * @param {String} cachee le sport dont on a caché l'effectif
 * @returns liste des questions, liste des corrections
 */
function questionsEtCorrections(
  preambule: string,
  serie: Serie,
  exercice: Exercice,
  numero: number,
): { questions: string; corrections: string } {
  let questions: string[] = []
  const rangValeurChoisie = randint(
    0,
    serie.effectifs.length - 1,
    serie.rangEffectifCache,
  )
  const frequenceDemandee = arrondi(
    (serie.effectifs[rangValeurChoisie] * 100) / serie.effectifTotal,
    1,
  )
  // correction question 1
  let correction1 =
    numAlpha(0) +
    `L'effectif manquant est celui du ${serie.entreeCachee.charAt(0).toLocaleLowerCase() + serie.entreeCachee.slice(1)}. Soit $e$ cet effectif.<br>`
  correction1 += `$e=${serie.effectifTotal}-( `
  let first = true
  serie.effectifs.forEach((eff, index) => {
    if (index !== serie.rangEffectifCache) {
      if (first) {
        correction1 += `${eff} `
        first = !first
      } else {
        correction1 += `+ ${eff} `
      }
    }
  })
  correction1 += ')$<br>'
  correction1 += `$e=${texNombre(serie.effectifTotal, 0)}-${texNombre(serie.effectifTotal - serie.effectifs[serie.rangEffectifCache], 0)}$<br>`
  correction1 += `$e=${texNombre(serie.effectifs[serie.rangEffectifCache], 0)}$<br>`
  // correction question 2
  let correction2
  if (!context.isAmc && !exercice.interactif) {
    correction2 = numAlpha(1) + 'Calculs des fréquences.<br>'
    correction2 +=
      'On rappelle que pour la fréquence relative à une valeur est donnée par le quotient : '
    correction2 +=
      '$\\dfrac{\\text{effectif de la valeur}}{\\text{effectif total}}$<br><br>'
    correction2 += 'On en déduit donc les calculs suivants :<br><br>'
    const enteteTableau = ['']
    const premiereColonne = []
    const premiereLigneTableau: string[] = []
    const deuxiemeLigneTableau: string[] = []
    serie.effectifs.forEach((eff, index) => {
      enteteTableau.push(`\\text{${serie.modalites[index]}}`)
      const f = fraction(eff, serie.effectifTotal)
      premiereLigneTableau.push(f.texFraction)
      deuxiemeLigneTableau.push(`${texNombre(f.pourcentage, 1)} ${sp(1)}\\%`)
    })
    premiereColonne.push(
      '\\textbf{Fréquences}',
      '\\textbf{Fréquences en pourcentages}',
    )
    correction2 += tableauColonneLigne(
      enteteTableau,
      premiereColonne,
      premiereLigneTableau.concat(deuxiemeLigneTableau),
    )
    correction2 += '<br>'
  } else {
    // Pas besoin de tableau pour une seule valeur demandée.
    correction2 =
      '<br>' +
      numAlpha(1) +
      `Calcul de la fréquence de la valeur ${serie.modalites[rangValeurChoisie]}<br><br>`
    correction2 +=
      'On rappelle que pour la fréquence relative à une valeur est donnée par le quotient : '
    correction2 +=
      '$\\dfrac{\\text{effectif de la valeur}}{\\text{effectif total}}$.<br><br>'
    correction2 += 'On en déduit donc :<br>'
    const fValeur = fraction(
      serie.effectifs[rangValeurChoisie],
      serie.effectifTotal,
    )
    correction2 += `$\\text{Fréquence}_{${serie.modalites[rangValeurChoisie]}}= ${fValeur.texFraction}$<br>`
    correction2 += `$\\text{Fréquence}_{${serie.modalites[rangValeurChoisie]}}${egalOuApprox((serie.effectifs[rangValeurChoisie] * 100) / serie.effectifTotal, 1)}${texNombre(arrondi(fValeur.pourcentage, 1))} ${sp(1)}\\%$`
  }

  if (!exercice.interactif && !context.isAmc) {
    // Questions normales pour version non interactive html ou latex
    questions = [
      preambule,
      numAlpha(0) + "Déterminer l'effectif manquant.<br>",
      numAlpha(1) +
        `Déterminer les fréquences pour chaque ${serie.caractere.substring(5)} (en pourcentage, arrondir au dixième si besoin).<br>`,
    ]
  } else {
    if (!context.isAmc) {
      // Questions pour interactivité html
      handleAnswers(
        exercice,
        numero * 2,
        { reponse: { value: serie.effectifs[serie.rangEffectifCache] } },
        { formatInteractif: 'mathlive' },
      )
      handleAnswers(
        exercice,
        numero * 2 + 1,
        { reponse: { value: frequenceDemandee } },
        { formatInteractif: 'mathlive' },
      )
      questions = [
        preambule,
        numAlpha(0) +
          "Déterminer l'effectif manquant." +
          ajouteChampTexteMathLive(
            exercice,
            numero * 2,
            KeyboardType.clavierNumbers,
          ) +
          '<br>',
        numAlpha(1) +
          `Déterminer la fréquence de la valeur ${serie.modalites[rangValeurChoisie]} (en pourcentage, arrondir au dixième si besoin).` +
          ajouteChampTexteMathLive(
            exercice,
            numero * 2 + 1,
            KeyboardType.clavierNumbers,
            {
              texteApres: '%',
            },
          ) +
          '<br>',
      ]
    } else {
      // Pour AMC, on ne peut pas doubler les questions, il faut les intégrer dans un seul AMCHybride.
      exercice.autoCorrectionAMC[numero] = {
        options: { multicols: true },
        enonce:
          preambule +
          '<br>' +
          numAlpha(0) +
          "Déterminer l'effectif manquant." +
          '<br>' +
          numAlpha(1) +
          `Déterminer la fréquence de la valeur ${serie.modalites[rangValeurChoisie]} (en pourcentage, arrondir au dixième si besoin).`,
        propositions: [
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: correction1 + correction2,
                reponse: {
                  texte: numAlpha(0),
                  valeur: [serie.effectifs[serie.rangEffectifCache]],
                  param: {
                    digits: 3,
                    decimals: 0,
                    signe: false,
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
                reponse: {
                  texte: numAlpha(1),
                  valeur: [frequenceDemandee],
                  param: {
                    digits: 3,
                    decimals: 1,
                    signe: false,
                  },
                },
              },
            ],
          },
        ],
      }
      exercice.questionsAMC[numero] = amcConvert(
        exercice.autoCorrectionAMC[numero],
      )
    }
  }
  return {
    questions: questions.join('\n'),
    corrections: [correction1, correction2].join('\n'),
  }
}

// on met tout ensemble
const listeDesThemes = [
  'hasard',
  'etablissement',
  'salon',
  'parking',
  'collection',
]
export default class CalculerDesFrequencesOld extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1

    this.spacingCorr = 1.5

    this.sup = '3'
    this.besoinFormulaireTexte = [
      'Type de questions',
      `Nombres séparés par des tirets\n${[
        "1 : Calculer des fréquences à partir d'un tableau d'effectifs",
        "2 : Calculer des fréquences à partir d'un diagramme bâton",
        '3 : Mélange',
      ].join('\n')}`,
    ]
    this.sup2 = 1
    this.besoinFormulaire2Numerique = [
      'Thème du contexte',
      5,
      [
        '1 : Au hasard',
        '2 : Établissement scolaire et sports préférés',
        '3 : Salon européen et nationalités des participants',
        '4 : Parking et couleurs des voitures',
        '5 : Collection de disques et styles de musique',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const theme = listeDesThemes[this.sup2 - 1]
    const exercice: { questions: string[]; corrections: string[] } = {
      questions: [],
      corrections: [],
    }
    let transit
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (typeDeQuestions[i]) {
        case 1: // tableau
          transit = exerciceAvecTableau(theme, this, i)
          exercice.questions = [transit.questions]
          exercice.corrections = [transit.corrections]
          break
        case 2: // diagramme
        default:
          transit = exerciceAvecDiagramme(theme, this, i)
          exercice.questions = [transit.questions]
          exercice.corrections = [transit.corrections]
          break
      }
      if (this.questionJamaisPosee(i, ...transit.effectifs)) {
        this.listeQuestions[i] = exercice.questions[0]
        this.listeCorrections[i] = exercice.corrections[0]
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
