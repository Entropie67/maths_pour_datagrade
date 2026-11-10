import { tableauColonneLigne } from '../../lib/2d/tableau'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { deDevant, numAlpha, sp } from '../../lib/outils/outilString'
import { prenomPronom } from '../../lib/outils/Personne'
import type { Valeur } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire un tableau'
export const dateDePublication = '23/08/2026'
export const interactifReady = true

export const uuid = '6373b'

export const refs = {
  'fr-fr': ['6P1autoA-4'],
  'fr-ch': ['9R1FA2A-3', '9R2FA2A-3', '9R3FA2A-3', 'PRQST01A-5', 'PRQPF01A-5'],
}

/**
 * Lire un tableau à simple ou à double entrée, dans des cas adaptés à une
 * lecture immédiate (emploi du temps, températures, tournoi sportif, tri des
 * déchets, effectifs d'un collège).
 * @author Rémi Angot
 * D'après une proposition de Mme Hamel.
 */

type ChampTableau = 'champ1' | 'champ2' | 'champ3' | 'champ4' | 'champ5'

/** Une sous-question posée à partir du tableau. */
type SousQuestion = {
  enonce: string
  correction: string
  reponse: string
  /** Si ce tableau est présent, la réponse est demandée sous forme de QCM. */
  propositions?: string[]
  vertical?: boolean
}

/** Le contexte tiré au sort : son texte, son tableau et ses sous-questions. */
type Donnees = {
  introduction: string
  tableau: string
  /** Dans l'ordre : lecture directe, recherche inverse, plus grande valeur, plus petite valeur, calcul. */
  sousQuestions: SousQuestion[]
}

const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const joursComplets = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]
const joursAbreges = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

/** Met un texte en mode texte pour un tableau rendu en LaTeX. */
function txt(texte: string | number): string {
  return `\\text{${texte}}`
}

/**
 * Construit une liste de propositions mélangées contenant la bonne réponse et
 * au plus `nbPropositions - 1` distracteurs.
 */
function propositions(
  bonneReponse: string,
  distracteursPossibles: string[],
  nbPropositions: number,
): string[] {
  const distracteurs = shuffle(
    distracteursPossibles.filter((texte) => texte !== bonneReponse),
  ).slice(0, Math.max(0, nbPropositions - 1))
  return shuffle([bonneReponse, ...distracteurs])
}

/** Tire `nb` entiers deux à deux distincts entre `min` et `max`. */
function valeursDistinctes(nb: number, min: number, max: number): number[] {
  const valeurs: number[] = []
  while (valeurs.length < nb) {
    const valeur = randint(min, max)
    if (!valeurs.includes(valeur)) valeurs.push(valeur)
  }
  return valeurs
}

/** Contexte 1 : l'emploi du temps d'un élève de 6e. */
function creeEmploiDuTemps(): Donnees {
  const { prenom, pronom } = prenomPronom()
  // null pour les deux lignes qui ne contiennent pas de cours
  const creneaux: ({ debut: string; fin: string } | null)[] = [
    { debut: '8\\text{ h}', fin: '9\\text{ h}' },
    { debut: '9\\text{ h}', fin: '10\\text{ h}' },
    null,
    { debut: '10\\text{ h }15', fin: '11\\text{ h }15' },
    { debut: '11\\text{ h }15', fin: '12\\text{ h }15' },
    null,
    { debut: '13\\text{ h }45', fin: '14\\text{ h }45' },
    { debut: '14\\text{ h }45', fin: '15\\text{ h }45' },
  ]
  const lignesDeCours = [0, 1, 3, 4, 6, 7]
  const indexMercredi = 2
  // Les matières les plus fréquentes restent celles qui le sont réellement.
  const matieres = [
    ...shuffle(['Mathématiques', 'Français']),
    ...shuffle(['Anglais', 'Histoire-Géo', 'SVT']),
    ...shuffle(['EPS', 'Technologie', 'Arts plastiques', 'Musique']),
  ]
  const effectifs = [5, 4, 4, 3, 3, 2, 2, 1, 1] // somme : 25 heures de cours

  const grille: string[][] = joursSemaine.map(() => new Array(8).fill(''))
  // Le mercredi après-midi est libre : c'est la journée la plus courte.
  grille[indexMercredi][6] = '-'
  grille[indexMercredi][7] = '-'
  // Un seul jour est complet, les trois autres commencent une heure plus tard
  // ou finissent une heure plus tôt.
  const joursPleins = shuffle([0, 1, 3, 4])
  const jourLePlusCharge = joursPleins[0]
  for (const jour of joursPleins.slice(1)) {
    grille[jour][choice([0, 7])] = '-'
  }

  const emplacements = shuffle(
    joursSemaine.flatMap((_, jour) =>
      lignesDeCours
        .filter((ligne) => grille[jour][ligne] === '')
        .map((ligne) => ({ jour, ligne })),
    ),
  )
  const sac: string[] = shuffle(
    matieres.flatMap((matiere, index) =>
      new Array<string>(effectifs[index]).fill(matiere),
    ),
  )
  for (const { jour, ligne } of emplacements) {
    // Une même matière n'est pas placée plus de deux fois dans une journée.
    let index = sac.findIndex(
      (matiere) =>
        grille[jour].filter((contenu) => contenu === matiere).length < 2,
    )
    if (index === -1) index = 0
    grille[jour][ligne] = sac[index]
    sac.splice(index, 1)
  }

  // Horaires écrits en LaTeX : à placer en mode maths.
  const horaire = (ligne: number) => {
    const creneau = creneaux[ligne]
    return creneau == null ? '' : `${creneau.debut}\\text{ - }${creneau.fin}`
  }
  const horaireLettresTex = (ligne: number) => {
    const creneau = creneaux[ligne]
    return creneau == null
      ? ''
      : `\\text{de }${creneau.debut}\\text{ à }${creneau.fin}`
  }
  // Horaires dans une phrase : seuls les nombres sont en mode maths.
  const horaireLettres = (ligne: number) => {
    const creneau = creneaux[ligne]
    return creneau == null ? '' : `de $${creneau.debut}$ à $${creneau.fin}$`
  }

  const entetesColonnes = [
    txt('Horaires'),
    ...joursSemaine.map((jour) => txt(jour)),
  ]
  const entetesLignes = creneaux.map((creneau, ligne) =>
    creneau == null
      ? ligne === 2
        ? '10\\text{ h - }10\\text{ h }15'
        : '12\\text{ h }15\\text{ - }13\\text{ h }45'
      : horaire(ligne),
  )
  const cellules = creneaux.flatMap((creneau, ligne) =>
    creneau == null
      ? joursSemaine.map(() => txt(ligne === 2 ? 'RÉCRÉATION' : 'DÉJEUNER'))
      : joursSemaine.map((_, jour) => txt(grille[jour][ligne])),
  )

  // Sous-question 1 : lecture directe d'une case.
  const caseLue = choice(
    emplacements.filter(({ jour, ligne }) => grille[jour][ligne] !== '-'),
  )
  const matiereLue = grille[caseLue.jour][caseLue.ligne]

  // Sous-question 2 : retrouver le créneau d'une matière qui n'a lieu qu'une fois.
  const matiereUnique = choice(matieres.slice(-2))
  let jourUnique = 0
  let ligneUnique = 0
  for (let jour = 0; jour < joursSemaine.length; jour++) {
    for (const ligne of lignesDeCours) {
      if (grille[jour][ligne] === matiereUnique) {
        jourUnique = jour
        ligneUnique = ligne
      }
    }
  }
  const creneauUnique = `${joursSemaine[jourUnique]}, ${horaireLettres(ligneUnique)}`
  const creneauUniqueTex = `\\text{${joursSemaine[jourUnique]}, }${horaireLettresTex(ligneUnique)}`
  const creneauxPossibles = joursSemaine.flatMap((jour) =>
    lignesDeCours.map((ligne) => `${jour}, ${horaireLettres(ligne)}`),
  )

  // Sous-questions 3 et 4 : la journée la plus chargée et la plus courte.
  const heuresParJour = joursSemaine.map(
    (_, jour) =>
      lignesDeCours.filter((ligne) => grille[jour][ligne] !== '-').length,
  )

  // Sous-question 5 : compter les heures d'une matière.
  const matiereComptee = choice(matieres.slice(0, 5))
  const nbHeures = effectifs[matieres.indexOf(matiereComptee)]

  return {
    introduction: `Voici l'emploi du temps de la semaine ${deDevant(prenom)}, élève de 6e. Le tiret (-) signifie qu'il n'y a pas cours à ce moment-là.`,
    tableau: tableauColonneLigne(entetesColonnes, entetesLignes, cellules, 1.3),
    sousQuestions: [
      {
        enonce: `Quelle matière ${prenom} a-t-${pronom} le ${joursSemaine[caseLue.jour].toLowerCase()} ${horaireLettres(caseLue.ligne)} ?`,
        correction: `On lit la case située à l'intersection de la ligne «${sp()}$${horaire(caseLue.ligne)}$${sp()}» et de la colonne «${sp()}${joursSemaine[caseLue.jour]}${sp()}» : $${miseEnEvidence(txt(matiereLue))}$.`,
        reponse: matiereLue,
        propositions: propositions(matiereLue, matieres, 4),
      },
      {
        enonce: `Quel jour et à quelle heure ${prenom} a-t-${pronom} ${matiereUnique} ?`,
        correction: `${matiereUnique} n'apparaît qu'une seule fois dans le tableau : $${miseEnEvidence(creneauUniqueTex)}$.`,
        reponse: creneauUnique,
        propositions: propositions(creneauUnique, creneauxPossibles, 4),
        vertical: true,
      },
      {
        enonce: `Quel jour ${prenom} a-t-${pronom} le plus d'heures de cours ?`,
        correction: `En comptant les cases de cours de chaque colonne, c'est le ${joursSemaine[jourLePlusCharge].toLowerCase()} qui en compte le plus, avec $${heuresParJour[jourLePlusCharge]}$ heures de cours : $${miseEnEvidence(txt(joursSemaine[jourLePlusCharge]))}$.`,
        reponse: joursSemaine[jourLePlusCharge],
        propositions: joursSemaine,
      },
      {
        enonce: `Quel jour ${prenom} a-t-${pronom} le moins d'heures de cours ?`,
        correction: `Le mercredi ne compte que $${heuresParJour[indexMercredi]}$ heures de cours, puisque l'après-midi est libre : $${miseEnEvidence(txt(joursSemaine[indexMercredi]))}$.`,
        reponse: joursSemaine[indexMercredi],
        propositions: joursSemaine,
      },
      {
        enonce: `Combien de fois le cours de «${sp()}${matiereComptee}${sp()}» apparaît-il dans la semaine ?`,
        correction: `On compte toutes les cases «${sp()}${matiereComptee}${sp()}» du tableau, colonne après colonne : il y en a $${miseEnEvidence(nbHeures)}$.`,
        reponse: String(nbHeures),
      },
    ],
  }
}

/** Contexte 2 : les températures maximales d'une semaine. */
function creeTemperatures(): Donnees {
  const ville = choice([
    'Caen',
    'Rennes',
    'Lille',
    'Nantes',
    'Dijon',
    'Bordeaux',
    'Strasbourg',
    'Toulouse',
    'Clermont-Ferrand',
    'Poitiers',
  ])
  const {
    nom: mois,
    article,
    min,
    max,
  } = choice([
    { nom: 'mars', article: 'de ', min: 6, max: 17 },
    { nom: 'avril', article: "d'", min: 8, max: 19 },
    { nom: 'mai', article: 'de ', min: 12, max: 24 },
    { nom: 'juin', article: 'de ', min: 16, max: 29 },
    { nom: 'septembre', article: 'de ', min: 14, max: 26 },
    { nom: 'octobre', article: "d'", min: 7, max: 19 },
  ])
  const temperatures = valeursDistinctes(7, min, max)
  const tMax = Math.max(...temperatures)
  const tMin = Math.min(...temperatures)
  const jourLePlusChaud = joursComplets[temperatures.indexOf(tMax)]
  const jourLePlusFroid = joursComplets[temperatures.indexOf(tMin)]
  const jourLu = randint(0, 6)
  const jourCherche = choice(
    [0, 1, 2, 3, 4, 5, 6],
    [jourLu, temperatures.indexOf(tMax), temperatures.indexOf(tMin)],
  )

  return {
    introduction: `Ce tableau donne la température maximale, en °C, relevée à ${ville} chaque jour d'une semaine ${article}${mois}.`,
    tableau: tableauColonneLigne(
      [txt('Jour'), ...joursAbreges.map((jour) => txt(jour))],
      ['\\text{Température (}^{\\circ}\\text{C)}'],
      temperatures,
      1.3,
    ),
    sousQuestions: [
      {
        enonce: `Quelle température maximale, en °C, a été relevée le ${joursComplets[jourLu].toLowerCase()} ?`,
        correction: `On lit la case de la colonne «${sp()}${joursAbreges[jourLu]}${sp()}» : $${miseEnEvidence(temperatures[jourLu])}$ °C.`,
        reponse: String(temperatures[jourLu]),
      },
      {
        enonce: `Quel jour a-t-on relevé une température maximale de $${temperatures[jourCherche]}$ °C ?`,
        correction: `La température $${temperatures[jourCherche]}$ °C se trouve dans la colonne «${sp()}${joursAbreges[jourCherche]}${sp()}» : $${miseEnEvidence(txt(joursComplets[jourCherche]))}$.`,
        reponse: joursComplets[jourCherche],
        propositions: joursComplets,
      },
      {
        enonce:
          'Quel jour la température maximale a-t-elle été la plus élevée ?',
        correction: `La plus grande valeur du tableau est $${tMax}$ °C : $${miseEnEvidence(txt(jourLePlusChaud))}$.`,
        reponse: jourLePlusChaud,
        propositions: joursComplets,
      },
      {
        enonce:
          'Quel jour la température maximale a-t-elle été la plus basse ?',
        correction: `La plus petite valeur du tableau est $${tMin}$ °C : $${miseEnEvidence(txt(jourLePlusFroid))}$.`,
        reponse: jourLePlusFroid,
        propositions: joursComplets,
      },
      {
        enonce:
          "Quel est l'écart, en °C, entre la température la plus élevée et la température la plus basse de la semaine ?",
        correction: `La température la plus élevée est $${tMax}$ °C et la plus basse est $${tMin}$ °C, donc $${tMax}-${tMin}=${miseEnEvidence(tMax - tMin)}$ °C.`,
        reponse: String(tMax - tMin),
      },
    ],
  }
}

/** Contexte 3 : les scores d'un tournoi sportif. */
function creeTournoi(): Donnees {
  const { sport, unite, uniteSingulier, min, max } = choice([
    {
      sport: 'handball',
      unite: 'buts',
      uniteSingulier: 'but',
      min: 2,
      max: 14,
    },
    {
      sport: 'football',
      unite: 'buts',
      uniteSingulier: 'but',
      min: 0,
      max: 6,
    },
    {
      sport: 'basketball',
      unite: 'points',
      uniteSingulier: 'point',
      min: 12,
      max: 32,
    },
  ])
  const equipes = shuffle([
    'Les Aigles',
    'Les Loups',
    'Les Renards',
    'Les Panthères',
    'Les Dauphins',
    'Les Tigres',
    'Les Étoiles',
    'Les Comètes',
    'Les Faucons',
    'Les Lynx',
  ]).slice(0, 4)
  const nbMatchs = 3

  let scores: number[][] = []
  let totaux: number[] = []
  let matchLu = 0
  for (let essai = 0; essai < 200; essai++) {
    scores = equipes.map(() =>
      new Array(nbMatchs).fill(0).map(() => randint(min, max)),
    )
    totaux = scores.map((ligne) => ligne.reduce((a, b) => a + b, 0))
    // Les totaux doivent être deux à deux distincts pour que le plus grand et
    // le plus petit soient uniques.
    if (new Set(totaux).size < equipes.length) continue
    // Il faut au moins un match où un score permet d'identifier une équipe.
    const matchsUtilisables = []
    for (let match = 0; match < nbMatchs; match++) {
      const colonne = scores.map((ligne) => ligne[match])
      if (new Set(colonne).size === colonne.length)
        matchsUtilisables.push(match)
    }
    if (matchsUtilisables.length === 0) continue
    matchLu = choice(matchsUtilisables)
    break
  }

  const totalMax = Math.max(...totaux)
  const totalMin = Math.min(...totaux)
  const meilleureEquipe = equipes[totaux.indexOf(totalMax)]
  const moinsBonneEquipe = equipes[totaux.indexOf(totalMin)]
  const indexEquipes = equipes.map((_, index) => index)
  const equipeLue = randint(0, equipes.length - 1)
  const matchQuelconque = randint(0, nbMatchs - 1)
  const equipeCherchee = choice(indexEquipes, [
    totaux.indexOf(totalMax),
    totaux.indexOf(totalMin),
  ])
  const equipeComptee = choice(indexEquipes, [equipeLue])

  return {
    introduction: `Ce tableau présente le nombre de ${unite} marqués par chaque équipe lors des trois matchs d'un tournoi de ${sport} du collège.`,
    tableau: tableauColonneLigne(
      [
        txt('Équipe'),
        ...new Array(nbMatchs)
          .fill(0)
          .map((_, match) => `${txt('Match ')}${match + 1}`),
      ],
      equipes.map((equipe) => txt(equipe)),
      scores.flat(),
      1.3,
    ),
    sousQuestions: [
      {
        enonce: `Combien de ${unite} l'équipe «${sp()}${equipes[equipeLue]}${sp()}» a-t-elle marqués au match $${matchQuelconque + 1}$ ?`,
        correction: `On lit la case située à l'intersection de la ligne «${sp()}${equipes[equipeLue]}${sp()}» et de la colonne «${sp()}Match $${matchQuelconque + 1}$${sp()}» : $${miseEnEvidence(scores[equipeLue][matchQuelconque])}$ ${scores[equipeLue][matchQuelconque] > 1 ? unite : uniteSingulier}.`,
        reponse: String(scores[equipeLue][matchQuelconque]),
      },
      {
        enonce: `Quelle équipe a marqué $${scores[equipeCherchee][matchLu]}$ ${scores[equipeCherchee][matchLu] > 1 ? unite : uniteSingulier} au match $${matchLu + 1}$ ?`,
        correction: `Dans la colonne «${sp()}Match $${matchLu + 1}$${sp()}», la valeur $${scores[equipeCherchee][matchLu]}$ se trouve sur la ligne : $${miseEnEvidence(txt(equipes[equipeCherchee]))}$.`,
        reponse: equipes[equipeCherchee],
        propositions: equipes,
      },
      {
        enonce: `Quelle équipe a marqué le plus de ${unite} sur les trois matchs ?`,
        correction: `En additionnant les trois scores de chaque ligne, le plus grand total est $${totalMax}$ ${unite} : $${miseEnEvidence(txt(meilleureEquipe))}$.`,
        reponse: meilleureEquipe,
        propositions: equipes,
      },
      {
        enonce: `Quelle équipe a marqué le moins de ${unite} sur les trois matchs ?`,
        correction: `En additionnant les trois scores de chaque ligne, le plus petit total est $${totalMin}$ ${unite} : $${miseEnEvidence(txt(moinsBonneEquipe))}$.`,
        reponse: moinsBonneEquipe,
        propositions: equipes,
      },
      {
        enonce: `Combien de ${unite} l'équipe «${sp()}${equipes[equipeComptee]}${sp()}» a-t-elle marqués sur les trois matchs ?`,
        correction: `On additionne les trois valeurs de la ligne «${sp()}${equipes[equipeComptee]}${sp()}» : $${scores[equipeComptee].join('+')}=${miseEnEvidence(totaux[equipeComptee])}$ ${unite}.`,
        reponse: String(totaux[equipeComptee]),
      },
    ],
  }
}

/** Contexte 4 : le tri des déchets au collège. */
function creeDechets(): Donnees {
  const types = shuffle([
    'Papier',
    'Plastique',
    'Verre',
    'Carton',
    'Métal',
    'Compost',
    'Textile',
  ]).slice(0, 4)
  const masses = valeursDistinctes(4, 4, 45)
  const total = masses.reduce((a, b) => a + b, 0)
  const masseMax = Math.max(...masses)
  const masseMin = Math.min(...masses)
  const typeLePlusLourd = types[masses.indexOf(masseMax)]
  const typeLePlusLeger = types[masses.indexOf(masseMin)]
  const typeCherche = choice(
    [0, 1, 2, 3],
    [masses.indexOf(masseMax), masses.indexOf(masseMin)],
  )
  const typeLu = choice([0, 1, 2, 3], [typeCherche])

  return {
    introduction:
      "Le collège pèse chaque semaine les déchets triés par les élèves. Voici les résultats, en kg, d'une semaine, par type de déchet.",
    tableau: tableauColonneLigne(
      [txt('Type de déchet'), ...types.map((type) => txt(type))],
      [txt('Masse collectée (kg)')],
      masses,
      1.3,
    ),
    sousQuestions: [
      {
        enonce: `Quelle masse de ${types[typeLu].toLowerCase()}, en kg, a été collectée cette semaine ?`,
        correction: `On lit la case de la colonne «${sp()}${types[typeLu]}${sp()}» : $${miseEnEvidence(masses[typeLu])}$ kg.`,
        reponse: String(masses[typeLu]),
      },
      {
        enonce: `Quel type de déchet représente une masse collectée de $${masses[typeCherche]}$ kg ?`,
        correction: `La masse $${masses[typeCherche]}$ kg se trouve dans la colonne «${sp()}${types[typeCherche]}${sp()}» : $${miseEnEvidence(txt(types[typeCherche]))}$.`,
        reponse: types[typeCherche],
        propositions: types,
      },
      {
        enonce:
          'Quel type de déchet représente la plus grande masse collectée ?',
        correction: `La plus grande masse du tableau est $${masseMax}$ kg : $${miseEnEvidence(txt(typeLePlusLourd))}$.`,
        reponse: typeLePlusLourd,
        propositions: types,
      },
      {
        enonce:
          'Quel type de déchet représente la plus petite masse collectée ?',
        correction: `La plus petite masse du tableau est $${masseMin}$ kg : $${miseEnEvidence(txt(typeLePlusLeger))}$.`,
        reponse: typeLePlusLeger,
        propositions: types,
      },
      {
        enonce:
          'Quelle est la masse totale, en kg, de déchets collectés cette semaine ?',
        correction: `On additionne toutes les masses du tableau : $${masses.join('+')}=${miseEnEvidence(total)}$ kg.`,
        reponse: String(total),
      },
    ],
  }
}

/** Contexte 5 : les effectifs d'un collège. */
function creeEffectifs(): Donnees {
  const college = choice([
    'Jean Moulin',
    'Victor Hugo',
    'Marie Curie',
    'Jules Ferry',
    'George Sand',
    'Simone Veil',
    'Jean Jaurès',
    'Alexandre Dumas',
  ])
  const niveaux = ['6e', '5e', '4e', '3e']
  const effectifs = valeursDistinctes(4, 78, 138)
  const total = effectifs.reduce((a, b) => a + b, 0)
  const effectifMax = Math.max(...effectifs)
  const effectifMin = Math.min(...effectifs)
  const niveauLePlusNombreux = niveaux[effectifs.indexOf(effectifMax)]
  const niveauLeMoinsNombreux = niveaux[effectifs.indexOf(effectifMin)]
  const niveauCherche = choice(
    [0, 1, 2, 3],
    [effectifs.indexOf(effectifMax), effectifs.indexOf(effectifMin)],
  )
  const niveauLu = choice([0, 1, 2, 3], [niveauCherche])

  return {
    introduction: `Ce tableau donne le nombre d'élèves par niveau au collège ${college} à la rentrée.`,
    tableau: tableauColonneLigne(
      [txt('Niveau'), ...niveaux.map((niveau) => txt(niveau))],
      [txt("Nombre d'élèves")],
      effectifs,
      1.3,
    ),
    sousQuestions: [
      {
        enonce: `Combien d'élèves y a-t-il en classe de ${niveaux[niveauLu]} ?`,
        correction: `On lit la case de la colonne «${sp()}${niveaux[niveauLu]}${sp()}» : $${miseEnEvidence(effectifs[niveauLu])}$ élèves.`,
        reponse: String(effectifs[niveauLu]),
      },
      {
        enonce: `Quel niveau compte $${effectifs[niveauCherche]}$ élèves ?`,
        correction: `L'effectif $${effectifs[niveauCherche]}$ se trouve dans la colonne «${sp()}${niveaux[niveauCherche]}${sp()}» : $${miseEnEvidence(txt(niveaux[niveauCherche]))}$.`,
        reponse: niveaux[niveauCherche],
        propositions: niveaux,
      },
      {
        enonce: "Quel est le niveau qui compte le plus d'élèves ?",
        correction: `Le plus grand effectif du tableau est $${effectifMax}$ : $${miseEnEvidence(txt(niveauLePlusNombreux))}$.`,
        reponse: niveauLePlusNombreux,
        propositions: niveaux,
      },
      {
        enonce: "Quel est le niveau qui compte le moins d'élèves ?",
        correction: `Le plus petit effectif du tableau est $${effectifMin}$ : $${miseEnEvidence(txt(niveauLeMoinsNombreux))}$.`,
        reponse: niveauLeMoinsNombreux,
        propositions: niveaux,
      },
      {
        enonce: "Combien d'élèves y a-t-il en tout dans ce collège ?",
        correction: `On additionne les quatre effectifs du tableau : $${effectifs.join('+')}=${miseEnEvidence(total)}$ élèves.`,
        reponse: String(total),
      },
    ],
  }
}

const contextes = [
  creeEmploiDuTemps,
  creeTemperatures,
  creeTournoi,
  creeDechets,
  creeEffectifs,
]

export default class LireUnTableau extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Tableau proposé',
      6,
      '1 : Un emploi du temps\n2 : Les températures de la semaine\n3 : Un tournoi sportif\n4 : Le tri des déchets\n5 : Les effectifs du collège\n6 : Au hasard',
    ]
    this.besoinFormulaire2Texte = [
      'Questions posées',
      '1 : Lire une case du tableau\n2 : Retrouver une case à partir de sa valeur\n3 : La plus grande valeur\n4 : La plus petite valeur\n5 : Un calcul à partir du tableau',
    ]

    this.consigne = "Répondre aux questions à l'aide du tableau."
    this.nbQuestions = 1
    this.sup = 6
    this.sup2 = '1-2-3-4'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.nbColsModifiable = false
    this.nbColsCorrModifiable = false
  }

  nouvelleVersion() {
    let listeSousQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: 0,
      min: 1,
      max: 5,
      melange: 0,
      defaut: 0,
      shuffle: false,
      enleveDoublons: true,
    }).map((valeur) => Number(valeur) - 1)
    if (listeSousQuestions.length === 0) listeSousQuestions = [0, 1, 2, 3]

    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50; cpt++) {
      const numeroContexte = Number(this.sup)
      const donnees =
        numeroContexte >= 1 && numeroContexte <= contextes.length
          ? contextes[numeroContexte - 1]()
          : choice(contextes)()

      const avecNumerotation = listeSousQuestions.length > 1
      const dataOptions: DataOptionsMultiMathfield = {}
      const reponses: Valeur = {}
      const lignesQuestions = listeSousQuestions.map((numero, index) => {
        const sousQuestion = donnees.sousQuestions[numero]
        const champ = `champ${index + 1}` as ChampTableau
        dataOptions[champ] =
          sousQuestion.propositions == null
            ? { ldots: true }
            : {
                qcm: sousQuestion.propositions.map((proposition) => ({
                  label: proposition,
                  value: proposition,
                })),
                vertical: sousQuestion.vertical ?? false,
                ldots: true,
              }
        reponses[champ] = { value: sousQuestion.reponse }
        return `${avecNumerotation ? numAlpha(index) : ''}${sousQuestion.enonce} %{${champ}}`
      })
      const texteCorr = listeSousQuestions
        .map(
          (numero, index) =>
            `${avecNumerotation ? numAlpha(index) : ''}${donnees.sousQuestions[numero].correction}`,
        )
        .join('<br>')

      const texte = `${donnees.introduction}<br><br>${donnees.tableau}<br>${addMultiMathfield(
        this,
        q,
        {
          dataTemplate: lignesQuestions.join('\n'),
          dataOptions,
        },
      )}`

      if (this.questionJamaisPosee(q, donnees.tableau)) {
        handleAnswers(this, q, reponses, {
          formatInteractif: 'multi-mathfield',
        })
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        q++
      }
    }
    listeQuestionsToContenu(this)
  }
}
