import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes de proportionnalité en utilisant la proportionnalité simple'
export const dateDePublication = '11/08/2021'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'AMCNum'
/**
 * On donne une relation de proportionnalité du type n objets coûtent x€ et on demande le prix de y objets
 * et le nombre d'objets qu'on peut acheter avec z€.
 * @author Jean-claude Lhote // pour l'exercice 6P11 original
 * @author CGrolleau // pour avoir ajouté des situations de proportionnalité en 03/2021
 * @author Guillaume Valmont // pour avoir fait la transition coefficient de linéarité -> coefficient de proportionnalité en 08/2021
 * Relecture : Novembre 2021 par EE
 */

// _____ Les fonctions suivantes renvoient un objet : {texte = ; texteCorr = ;} ______
// elles correspondent aux différentes situations problèmes
let versionSimplifiee = false
let indexN = 0
const couplePremiersEntreEux = [
  [3, 4],
  [3, 5],
  [3, 7],
  [6, 7],
  [3, 8],
  [7, 8],
  [7, 9],
  [3, 10],
  [7, 10],
  [9, 10],
  [3, 11],
  [6, 11],
  [7, 11],
  [9, 11],
  [7, 12],
  [9, 12],
  [11, 12],
  [3, 13],
  [6, 13],
  [7, 13],
  [9, 13],
  [11, 13],
  [12, 13],
] // Couples de nombres premiers entre eux
function questionAchat(exo: Exercice, i: number) {
  // questions d'origine du 6P11 : achat.
  const listeDeLieux = [
    'dans un magasin de bricolage',
    'dans une animalerie',
    'au supermarché local',
    "à l'épicerie",
    'dans la boutique du musée',
  ]
  const listeDeChoses: string[][] = [[]]
  const listeDeChose: string[][] = [[]]
  const listeDePrixUnit: number[][] = [[]]
  listeDeChoses[0] = [
    'articles',
    'outils',
    'accessoires',
    "pièces d'outillage",
    'pinceaux',
    'ampoules',
    'tournevis',
    'spatules',
    'raccords de tuyaux',
  ]
  listeDeChose[0] = [
    'un seul article',
    'un seul outil',
    'un seul accessoire',
    "une seule pièce d'outillage",
    'un seul pinceau',
    'une seule ampoule',
    'un seul tournevis',
    'une seule spatule',
    'un seul raccord de tuyaux',
  ]
  listeDeChoses[1] = [
    'poissons rouges',
    'cannetons',
    'perruches',
    'phasmes',
    'colliers anti-puces',
    'souris',
    'lapereaux',
    'paquets de graines',
  ]
  listeDeChose[1] = [
    'un seul poisson rouge',
    'un seul canneton',
    'une seule perruche',
    'un seul phasme',
    'un seul collier anti-puces',
    'une seule souris',
    'un seul lapereau',
    'un seul paquet de graines',
  ]
  listeDeChoses[2] = [
    'sets de tables',
    'verres',
    'assiettes',
    'os à mâcher',
    'dosettes de café',
    'packs de lait',
    'paquets de pâtes',
  ]
  listeDeChose[2] = [
    'un seul set de table',
    'un seul verre',
    'une seule assiette',
    'un seul os à mâcher',
    'une seule dosette de café',
    'un seul pack de lait',
    'un seul paquet de pâtes',
  ]
  listeDeChoses[3] = [
    'mangues',
    'ananas',
    'fruits de la passion',
    'melons',
    'paquets de madeleines de Commercy',
    'bergamotes',
    'bredeles',
    'pots de cancoillotte',
  ]
  listeDeChose[3] = [
    'une seule mangue',
    'un seul ananas',
    'un seul fruit de la passion',
    'un seul melon',
    'un seul paquet de madeleines de Commercy',
    'une seule bergamote',
    'un seul bredele',
    'un seul pot de cancoillotte',
  ]
  listeDeChoses[4] = [
    'cartes',
    'livres',
    'gravures',
    'puzzles',
    'maquettes',
    'roches',
    'jeux de société',
  ]
  listeDeChose[4] = [
    'une seule carte',
    'un seul livre',
    'une seule gravure',
    'un seul puzzle',
    'une seule maquette',
    'une seule roche',
    'un seul jeu de société',
  ]
  listeDePrixUnit[0] = [5, 4, 1.25, 3, 0.5, 1.5, 2, 6, 4.5]
  listeDePrixUnit[1] = [1.5, 7, 20, 2.5, 25, 2, 15, 8]
  listeDePrixUnit[2] = [1.25, 1.5, 2, 0.5, 5, 4.5, 3]
  listeDePrixUnit[3] = [2, 2.5, 1.25, 1.5, 4, 7, 12, 3]
  listeDePrixUnit[4] = [0.5, 5, 7, 13.5, 10, 15, 20]
  const index1 = randint(0, 4)
  const prenoms = [prenomF(), prenomM()]
  const index2 = randint(0, listeDeChoses[index1].length - 1)
  const objet = listeDeChoses[index1][index2]
  const pu =
    listeDePrixUnit[index1][index2] * (1 + randint(1, 2) * 0.2 * randint(-1, 1))
  const n = couplePremiersEntreEux[indexN][0]
  const y = couplePremiersEntreEux[indexN][1]
  let x
  if (versionSimplifiee) {
    x = n * randint(2, 5)
  } else {
    x = n * pu
  }
  let met = false
  let p
  while (met === false) {
    p = n * randint(2, 5)
    if (p !== y) {
      met = true
    }
  }
  const texte =
    `${prenoms[0]} a repéré, ${listeDeLieux[index1]}, des ${objet} qui l'intéressent.<br>
  Elle lit que $${n}$ ${objet} coûtent $${texPrix(x)}$ €. Elle veut en acheter $${y}$.<br>
  Combien va-t-elle dépenser ?` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' €',
    })
  const texteCorr =
    `Commençons par trouver le prix d'${listeDeChose[index1][index2]}. <br>` +
    `Si $${n}$ ${objet} coûtent $${texPrix(x)}$ €, alors ${listeDeChose[index1][index2]} coûte $${miseEnEvidence(n, bleuMathalea)}$ fois moins cher.<br>` +
    `$${texPrix(x)}$ € $ \\div ${miseEnEvidence(n, bleuMathalea)} = ${texPrix(x / n)} $ € <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire : ', 'black') +
    `${listeDeChose[index1][index2]} coûte $${miseEnEvidence(texPrix(x / n), bleuMathalea)}$ €.<br>` +
    `Cherchons maintenant le prix de $${y}$ ${objet}. <br>` +
    `$${y}$ ${objet}, c'est $${miseEnEvidence(y, bleuMathalea)}$ fois plus qu'${listeDeChose[index1][index2]}. <br>` +
    `$${y}$ ${objet} coûtent donc $${miseEnEvidence(y, bleuMathalea)}$ fois plus que $${miseEnEvidence(texPrix(x / n), bleuMathalea)}$ €, le prix d'${listeDeChose[index1][index2]}.` +
    `$${miseEnEvidence(texPrix(x / n), bleuMathalea)}$ € $\\times ${miseEnEvidence(y, bleuMathalea)} = ${texPrix((x * y) / n)}$ €<br>` +
    ` ${texteEnCouleurEtGras('Conclusion :', 'black')} $${y}$ ${objet} coûtent $${miseEnEvidence(texPrix((x * y) / n))}$ €.`
  handleAnswers(
    exo,
    i,
    { reponse: { value: texNombre((x * y) / n, 2) } },
    { formatInteractif: 'mathalea-mathfield' },
  )

  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: 'Réponse en € :',
    qreponse: (x * y) / n,
  }
}

function questionRecette(exo: Exercice, i: number) {
  // questions avec des masses pour un nombre de personne dans des recettes correction : passage à l'unité
  const liste = [
    // liste des ingrédients avec différentes recettes associées et masses
    {
      ingredient: 'farine',
      recettes: ['gâteau au citron', 'gaufres', 'crêpes', 'cake'],
      quantites_par_pers: [20, 25, 30, 35, 40, 50], // A voir pour l'instant quantités "simples".
    },
    {
      ingredient: 'sucre',
      recettes: ['gâteau', 'mousse au chocolat', 'pain perdu', 'riz au lait'],
      quantites_par_pers: [15, 20, 25, 30, 35],
    },
    {
      ingredient: 'chocolat',
      recettes: ['gâteau', 'mousse au chocolat', 'flan', 'riz au lait'],
      quantites_par_pers: [10, 15, 20, 25, 30, 35],
    },
    {
      ingredient: 'beurre',
      recettes: ['gâteau', 'mousse au chocolat'],
      quantites_par_pers: [10, 12, 15, 18],
    },
  ]
  const nbPersonneInit = couplePremiersEntreEux[indexN][0] // nombre de personne indiqué dans la recette.
  const nbPersonneFinal = couplePremiersEntreEux[indexN][1] // nombre de personne pour lequel on veut cuisiner
  const alea1 = randint(0, 3) // pour le choix de l'ingredient
  const alea2 = randint(0, liste[alea1].recettes.length - 1) // pour le choix de la recette
  const alea3 = randint(0, liste[alea1].quantites_par_pers.length - 1) // pour le choix de la quantité par personne.
  const quantite = liste[alea1].quantites_par_pers[alea3] * nbPersonneInit // Calcul de la quantité dans la recette à partir de la qtt/personne et du nb de personne
  const quantiteReponse =
    liste[alea1].quantites_par_pers[alea3] * nbPersonneFinal // Pour la correction
  const prenoms = [prenomF(), prenomM()] // Choix de prénoms pour l'énoncé
  const texte =
    `${prenoms[0]} lit sur sa recette de ${liste[alea1].recettes[alea2]} pour $${nbPersonneInit}$ personnes qu'il faut $${texNombre(quantite)}$ g de ${liste[alea1].ingredient}. <br>` +
    `Elle veut adapter sa recette pour $${nbPersonneFinal}$ personnes.<br>` +
    `Quelle masse de ${liste[alea1].ingredient} doit-elle prévoir ?` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' g',
    })
  const texteCorr =
    `Commençons par trouver la masse de ${liste[alea1].ingredient} pour une personne. <br>` +
    ` $${nbPersonneInit}$ personnes, c'est $${miseEnEvidence(nbPersonneInit, bleuMathalea)}$ fois $1$ personne. ` +
    `il faut donc $${miseEnEvidence(nbPersonneInit, bleuMathalea)}$ fois moins que $${texNombre(quantite)}$ g pour $1$ personne.<br>` +
    `$${texNombre(quantite)}$ g $\\div ${miseEnEvidence(nbPersonneInit, bleuMathalea)} = ${liste[alea1].quantites_par_pers[alea3]}$ g <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire :', 'black') +
    ` il faut $${miseEnEvidence(liste[alea1].quantites_par_pers[alea3], bleuMathalea)}$ g de ${liste[alea1].ingredient} pour $1$ personne. <br>` +
    ` Cherchons maintenant la quantité nécessaire pour $${nbPersonneFinal}$ personnes. <br>` +
    ` $${nbPersonneFinal}$ personnes, c'est $${miseEnEvidence(nbPersonneFinal, bleuMathalea)}$ fois $1$ personne. <br>` +
    `Donc, il faut $${miseEnEvidence(nbPersonneFinal, bleuMathalea)}$ fois plus que $${liste[alea1].quantites_par_pers[alea3]}$ g de ${liste[alea1].ingredient} que pour $1$ personne pour faire sa recette.` +
    `$${miseEnEvidence(liste[alea1].quantites_par_pers[alea3], bleuMathalea)}$ g $\\times ${miseEnEvidence(nbPersonneFinal, bleuMathalea)} = ${quantiteReponse}$ g <br>
${texteEnCouleurEtGras('Conclusion : ', 'black')} ${prenoms[0]} doit utiliser $${miseEnEvidence(quantiteReponse)}$ g de ${liste[alea1].ingredient} pour $${nbPersonneFinal}$ personnes. `
  handleAnswers(
    exo,
    i,
    { reponse: { value: texNombre(quantiteReponse, 0) } },
    { formatInteractif: 'mathalea-mathfield' },
  )
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: 'Réponse en grammes :',
    qreponse: quantiteReponse,
  }
}

function questionDillution(exo: Exercice, i: number) {
  // questions de mélange de volumes
  let uniteSolvantVolumeFinal
  const liste = [
    {
      solute: 'sirop',
      volumeUnitaire: [12, 15, 18, 20],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'], // liste pour [0] singulier [1] pluriel
    },
    {
      solute: 'nettoyant pour sol',
      volumeUnitaire: [5, 8, 10, 12],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'],
    },
    {
      solute: 'médicament',
      volumeUnitaire: [3, 3.5, 4, 4.5, 5, 7.5],
      unite_solute: 'mL',
      unite_solvant: ['dL', 'dL'],
    },
    {
      solute: 'produit pour piscine',
      volumeUnitaire: [1, 1.2, 0.8, 1.5],
      unite_solute: 'L',
      unite_solvant: ['dizaine de mètres cubes', 'dizaines de mètres cubes'],
    },
  ]
  const volumeInitial = couplePremiersEntreEux[indexN][0] // volume d'eau pour la préparation
  const volumeFinal = couplePremiersEntreEux[indexN][1]
  const alea1 = randint(0, 3) // pour le choix du soluté
  const alea2 = randint(0, liste[alea1].volumeUnitaire.length - 1) // pour le choix du volume pour une unité de solvant
  let quantite
  if (versionSimplifiee) {
    quantite = volumeInitial * randint(2, 5)
  } else {
    quantite = liste[alea1].volumeUnitaire[alea2] * volumeInitial
  }
  if (volumeFinal < 2) {
    uniteSolvantVolumeFinal = liste[alea1].unite_solvant[0]
  } else {
    uniteSolvantVolumeFinal = liste[alea1].unite_solvant[1]
  }
  const volumeFinalAff = texNombre(volumeFinal) // pour affichage avec bon séparateur.
  const volumeInitialAff = texNombre(volumeInitial) // pour affichage avec bon séparateur.
  const texte =
    `Il est indiqué sur la bouteille de ${liste[alea1].solute} qu'il faut ` +
    ` $${texNombre(quantite)}$ ${liste[alea1].unite_solute} de ${liste[alea1].solute} pour $${volumeInitialAff}$ ${liste[alea1].unite_solvant[1]} d'eau.<br> ` +
    `On veut utiliser $${volumeFinalAff}$ ${uniteSolvantVolumeFinal} d'eau.<br>` +
    `Quel volume de ${liste[alea1].solute} doit-on prévoir ? ` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' ' + liste[alea1].unite_solute,
    })

  const texteCorr =
    `Commençons par trouver combien est-ce qu'il faut de ${liste[alea1].solute} pour $1$ ${liste[alea1].unite_solvant[0]} d'eau. <br>` +
    ` $${volumeInitial}$ ${liste[alea1].unite_solvant[1]} d'eau, c'est $${miseEnEvidence(volumeInitial, bleuMathalea)}$ fois $1$ ${liste[alea1].unite_solvant[0]} d'eau. ` +
    `Pour $1$ ${liste[alea1].unite_solvant[0]} d'eau, il faut donc $${miseEnEvidence(volumeInitial, bleuMathalea)}$ fois moins que $${texNombre(quantite)}$ ${liste[alea1].unite_solute}.<br>` +
    `$${texNombre(quantite)}$ ${liste[alea1].unite_solute} $\\div ${miseEnEvidence(volumeInitial, bleuMathalea)} = ${texNombre(quantite / volumeInitial)}$ ${liste[alea1].unite_solute} <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire :', 'black') +
    ` il faut $${miseEnEvidence(texNombre(quantite / volumeInitial), bleuMathalea)}$ ${liste[alea1].unite_solute} de ${liste[alea1].solute} pour $1$ ${liste[alea1].unite_solvant[0]} d'eau. <br>` +
    ` Cherchons maintenant la quantité nécessaire pour $${volumeFinalAff}$ ${uniteSolvantVolumeFinal} d'eau. <br>` +
    ` $${volumeFinalAff}$ ${uniteSolvantVolumeFinal} d'eau, c'est $${miseEnEvidence(volumeFinalAff, bleuMathalea)}$ fois $1$ ${liste[alea1].unite_solvant[0]} d'eau.` +
    ` Il faut donc $${miseEnEvidence(volumeFinalAff, bleuMathalea)}$ fois plus de ${liste[alea1].solute} que $${texNombre(quantite / volumeInitial)}$ ${liste[alea1].unite_solute} :` +
    `$${miseEnEvidence(texNombre(quantite / volumeInitial), bleuMathalea)}$ ${liste[alea1].unite_solute} $\\times ${miseEnEvidence(volumeFinalAff, bleuMathalea)} = ${texNombre((quantite / volumeInitial) * volumeFinal)}$ ${liste[alea1].unite_solute}<br>` +
    `${texteEnCouleurEtGras('Conclusion :', 'black')} il faut prévoir $${miseEnEvidence(texNombre((quantite / volumeInitial) * volumeFinal))}$ ${liste[alea1].unite_solute} de ${liste[alea1].solute}.`
  handleAnswers(
    exo,
    i,
    {
      reponse: {
        value: texNombre((quantite / volumeInitial) * volumeFinal, 6),
      },
    },
    { formatInteractif: 'mathalea-mathfield' },
  )
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: `Réponse en ${liste[alea1].unite_solute} :`,
    qreponse: (quantite / volumeInitial) * volumeFinal,
  }
}

function questionDistance(exo: Exercice, i: number) {
  // questions de distance parcourue à une vitesse moyenne donnée
  const liste = [
    // liste des "moyens de locomotion" et vitesses associées
    {
      locomotion: 'piéton',
      vitesse: [3, 4, 5, 6],
    },
    {
      locomotion: 'cycliste',
      vitesse: [12, 15, 16, 17, 18, 20, 22],
    },
    {
      locomotion: 'camion',
      vitesse: [75, 77, 80, 82, 85],
    },
    {
      locomotion: 'train',
      vitesse: [125, 150, 175, 185, 195],
    },
  ]
  let facteur
  if (versionSimplifiee) {
    facteur = 1
  } else {
    facteur = randint(1, 19, [10]) / 10
  }
  const alea1 = randint(0, 3) // pour le choix de locomotion
  const dureeQ = couplePremiersEntreEux[indexN][0]
  const dureeR = couplePremiersEntreEux[indexN][1]
  const alea2 = randint(0, liste[alea1].vitesse.length - 1) // pour le facteur de distance parcourue
  const texte =
    `Un ${liste[alea1].locomotion} parcourt en moyenne $${texNombre(liste[alea1].vitesse[alea2] * dureeQ * facteur)}\\text{ km}$ en $${dureeQ}$ heures.<br>
     Quelle distance va-t-il parcourir, à la même vitesse, en $${dureeR}$ heures ?` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: '$\\text{ km}$',
    })

  const texteCorr =
    `Commençons par trouver quelle est la distance parcourue en $1$ h. <br>
  $1$ h, c'est $${miseEnEvidence(dureeQ, bleuMathalea)}$ fois moins que $${dureeQ}$ h.
   En $1$ h, le ${liste[alea1].locomotion} parcourt donc une distance $${miseEnEvidence(dureeQ, bleuMathalea)}$ fois moins grande qu'en $${dureeQ}$ h.<br>` +
    `$${texNombre(liste[alea1].vitesse[alea2] * facteur * dureeQ)}\\text{ km} \\div ${miseEnEvidence(dureeQ, bleuMathalea)} = ${texNombre(liste[alea1].vitesse[alea2] * facteur)} \\text{ km}$ <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire :', 'black') +
    ` en $1$ h, le ${liste[alea1].locomotion} parcourt $${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2] * facteur), bleuMathalea)}\\text{ km}$. <br>` +
    ` Cherchons maintenant la distance parcourue en $${dureeR}$ h. <br>` +
    ` $${dureeR}$ h, c'est $${miseEnEvidence(dureeR, bleuMathalea)}$ fois $1$ h.` +
    ` Le ${liste[alea1].locomotion} parcourt donc $${miseEnEvidence(dureeR, bleuMathalea)}$ fois plus de distance qu'en $1$ h.` +
    `$${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2] * facteur), bleuMathalea)}\\text{ km} \\times ${miseEnEvidence(dureeR, bleuMathalea)} = ${texNombre(liste[alea1].vitesse[alea2] * dureeR * facteur)}\\text{ km}$ <br>` +
    `${texteEnCouleurEtGras('Conclusion :', 'black')} le ${liste[alea1].locomotion} parcourra en moyenne $${miseEnEvidence(texNombre(liste[alea1].vitesse[alea2] * dureeR * facteur))}\\text{ km}$ en $${dureeR}$ h.`
  handleAnswers(
    exo,
    i,
    {
      reponse: {
        value: texNombre(liste[alea1].vitesse[alea2] * dureeR * facteur, 6),
      },
    },
    { formatInteractif: 'mathalea-mathfield' },
  )
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: 'Réponse en $\\text{km}$ :',
    qreponse: liste[alea1].vitesse[alea2] * dureeR * facteur,
  }
}

function questionEchelle(exo: Exercice, i: number) {
  // X $\\text{cm}$ sur une carte correspond à x $\\text{km}$ dans la réalité...
  const distanceCarte = couplePremiersEntreEux[indexN][0] // Choix d'un nombre de $\\text{cm}$ sur la carte
  let distanceReel = distanceCarte * randint(2, 5) // Choix d'un nombre de $\\text{km}$ dans la réalité (on évite d'avoir 1cm pour 1km)
  if (!versionSimplifiee) distanceReel *= randint(1, 19, [10]) / 10
  const distanceCarte2 = couplePremiersEntreEux[indexN][1]
  const prenoms = [prenomF(), prenomM()]
  const texte =
    `Sur une carte sur laquelle $${distanceCarte}\\text{ cm}$ représente $${texNombre(distanceReel)}\\text{ km}$ dans la réalité, <br>
  ${prenoms[0]} mesure son trajet et elle trouve une distance de $${distanceCarte2}\\text{ cm}$. <br>` +
    'À quelle distance cela correspond dans la réalité ?' +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: '$\\text{ km}$',
    })

  const texteCorr =
    `Commençons par trouver à combien de $\\text{km}$ dans la réalité, $1\\text{ cm}$ sur la carte correspond. <br>
  $1\\text{ cm}$, c'est $${miseEnEvidence(distanceCarte, bleuMathalea)}$ fois moins que $${distanceCarte}\\text{ cm}$.<br>` +
    `$${texNombre(distanceReel)}\\text{ km}\\div ${miseEnEvidence(distanceCarte, bleuMathalea)} = ${texNombre(distanceReel / distanceCarte)}\\text{ km}$ <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire :', 'black') +
    ` $1\\text{ cm}$ sur la carte correspond donc à $${miseEnEvidence(texNombre(distanceReel / distanceCarte), bleuMathalea)}\\text{ km}$ dans la réalité. <br>` +
    ' Cherchons maintenant la distance réelle de son trajet. <br>' +
    ` $${distanceCarte2}\\text{ cm}$, c'est $${miseEnEvidence(distanceCarte2, bleuMathalea)}$ fois $1\\text{ cm}$.` +
    `$${miseEnEvidence(texNombre(distanceReel / distanceCarte), bleuMathalea)}\\text{ km}\\times ${miseEnEvidence(distanceCarte2, bleuMathalea)} = ${texNombre((distanceCarte2 * distanceReel) / distanceCarte)}\\text{ km}$<br>` +
    `${texteEnCouleurEtGras('Conclusion :', 'black')} son trajet correspond en réalité à une distance de $${miseEnEvidence(texNombre((distanceCarte2 * distanceReel) / distanceCarte))}\\text{ km}$.`
  handleAnswers(
    exo,
    i,
    {
      reponse: {
        value: texNombre((distanceCarte2 * distanceReel) / distanceCarte, 6),
      },
    },
    { formatInteractif: 'mathalea-mathfield' },
  )
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: 'Réponse en $\\text{km}$ :',
    qreponse: (distanceCarte2 * distanceReel) / distanceCarte,
  }
}

function questionRecouvrirSurface(exo: Exercice, i: number) {
  // peinture, gazon, carrelage pour une surface donnée.
  const liste = [
    {
      matiere: 'de la peinture',
      unite: 'L',
      qtt_matiere_unitaire: [0.5, 1, 1.5, 2], // quantité au m²
      qtt_surface: [2, 3, 5], // nombre de m² indiqués sur l'emballage
    },
    {
      matiere: 'du gazon',
      unite: 'kg',
      qtt_matiere_unitaire: [2.5, 3, 5, 10],
      qtt_surface: [25, 40, 50],
    },
    {
      matiere: 'du carrelage',
      unite: 'carreaux',
      qtt_matiere_unitaire: [25, 30, 50, 100],
      qtt_surface: [2, 4],
    },
  ]
  let alea1
  if (versionSimplifiee)
    alea1 = liste.length - 1 // Pour avoir un coef entier, la qtt_matiere_unitaire doit être plus grande que la surface, ce qui ne se trouve que dans le carrelage
  else alea1 = randint(0, liste.length - 1)
  const alea2 = randint(0, liste[alea1].qtt_matiere_unitaire.length - 1)
  const alea3 = randint(0, liste[alea1].qtt_surface.length - 1)
  const rapport = [0.25, 0.5, 0.75, 1.25, 1.5, 2, 3, 4, 5] // choix parmi des rapports simples (en 6eme cela parait suffisant)
  const alea4 = randint(0, rapport.length - 1)
  let quantite, surfaceFinale, surfaceInitiale
  if (versionSimplifiee) {
    surfaceInitiale = couplePremiersEntreEux[indexN][0]
    quantite = surfaceInitiale * randint(2, 5)
    surfaceFinale = couplePremiersEntreEux[indexN][1]
  } else {
    surfaceInitiale = liste[alea1].qtt_surface[alea3]
    quantite = liste[alea1].qtt_matiere_unitaire[alea2]
    surfaceFinale = arrondi(rapport[alea4] * liste[alea1].qtt_surface[alea3], 3)
  }
  const prenoms = [prenomF(), prenomM()]
  const qttaffichage = texNombre(quantite) // Pour affichage avec virgule en séparateur.
  const texte =
    `${prenoms[0]} doit acheter ${liste[alea1].matiere}. <br>` +
    `Sur la notice, il est indiqué de prévoir $${qttaffichage}$ ${liste[alea1].unite} pour $${texNombre(surfaceInitiale)}\\text{ m}^2$. <br> ` +
    `Combien doit-elle en acheter pour une surface de $${texNombre(surfaceFinale)}\\text{ m}^2$ ?` +
    ajouteChampTexteMathLive(exo, i, KeyboardType.clavierNumbers, {
      texteApres: ' ' + liste[alea1].unite,
    })

  const texteCorr =
    `Commençons par trouver combien de ${liste[alea1].unite} il faut prévoir pour $1\\text{ m}^2$. <br>
 $1\\text{ m}^2$, c'est $${miseEnEvidence(texNombre(surfaceInitiale), bleuMathalea)}$ fois moins que $${texNombre(surfaceInitiale)}\\text{ m}^2$.<br>` +
    `$${qttaffichage}$ ${liste[alea1].unite} $\\div ${miseEnEvidence(texNombre(surfaceInitiale), bleuMathalea)} = ${texNombre(quantite / surfaceInitiale)}$ ${liste[alea1].unite} <br>` +
    texteEnCouleurEtGras(' Conclusion intermédiaire :', 'black') +
    ` on a donc besoin de $${miseEnEvidence(texNombre(quantite / surfaceInitiale), bleuMathalea)}$ ${liste[alea1].unite} pour recouvrir $1\\text{ m}^2$.<br>` +
    ` Cherchons maintenant la quantité de ${liste[alea1].unite} nécessaire pour recouvrir $${texNombre(surfaceFinale)}\\text{ m}^2$.<br>` +
    ` $${texNombre(surfaceFinale)}\\text{ m}^2$, c'est $${miseEnEvidence(texNombre(surfaceFinale), bleuMathalea)}$ fois plus que $1\\text{ m}^2$.` +
    `$${miseEnEvidence(texNombre(quantite / surfaceInitiale), bleuMathalea)}$ ${liste[alea1].unite} $\\times ${miseEnEvidence(texNombre(surfaceFinale), bleuMathalea)} = ${texNombre((quantite * surfaceFinale) / surfaceInitiale)}$ ${liste[alea1].unite}<br>` +
    `${texteEnCouleurEtGras('Conclusion :', 'black')} ${prenoms[0]} aura besoin de $${miseEnEvidence(texNombre((quantite * surfaceFinale) / surfaceInitiale))}$ ${liste[alea1].unite} pour recouvrir $${texNombre(surfaceFinale)}\\text{ m}^2$.`
  handleAnswers(
    exo,
    i,
    {
      reponse: {
        value: texNombre((quantite * surfaceFinale) / surfaceInitiale, 3),
      },
    },
    { formatInteractif: 'mathalea-mathfield' },
  )
  return {
    qtexte: texte,
    qtexteCorr: texteCorr,
    qreponseAMC: `Réponse en ${liste[alea1].unite} :`,
    qreponse: arrondi((quantite * surfaceFinale) / surfaceInitiale, 3),
  }
}

// _______ Fin des fonctions correspondants aux situations problèmes _____

export const uuid = 'b0f4e'

export const refs = {
  'fr-fr': ['6P3C-2', 'BP2AutoL8', '3AutoP02'],
  'fr-2016': ['6P12', 'BP2AutoL8'],
  'fr-ch': ['9R1FA1C-3', '9R2FA1C-3', '9R3FA1C-3', 'PRQPF03A-13'],
}
export default class ProportionnaliteParCoefDeProportionnalite extends Exercice {
  constructor() {
    super()

    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 6

    this.besoinFormulaireCaseACocher = [
      'Version simplifiée ne comportant que des nombres entiers',
    ]
    this.sup = false
    this.sup2 = 7
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Achat\n2 : Recette\n3 : Dilution\n4 : Distance\n5 : Échelle\n6 : Surface\n7 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Répondre à la question posée'
        : 'Répondre aux questions posées'
    this.consigne += !this.interactif ? ' en justifiant.' : '.'

    const listeIndexSituations = gestionnaireFormulaireTexte({
      max: 6,
      defaut: 7,
      melange: 7,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      indexN = randint(0, couplePremiersEntreEux.length - 1)
      if (this.sup) {
        versionSimplifiee = true
      } else {
        versionSimplifiee = false
      }
      let question
      switch (listeIndexSituations[i]) {
        case 1:
          question = questionAchat(this, i)
          break
        case 2:
          question = questionRecette(this, i)
          break
        case 3:
          question = questionDillution(this, i)
          break
        case 4:
          question = questionDistance(this, i)
          break
        case 5:
          question = questionEchelle(this, i)
          break
        case 6:
        default:
          question = questionRecouvrirSurface(this, i)
          break
      }

      if (
        this.questionJamaisPosee(i, listeIndexSituations[i], question.qreponse)
      ) {
        // Si la question n'a jamais été posée, on la garde.
        this.listeQuestions[i] = question.qtexte
        this.listeCorrections[i] = question.qtexteCorr
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: question.qtexte + '<br>' + question.qreponseAMC,
            propositions: [
              {
                texte: 'ce qui est affiché dans le corrigé AMC', // Si vide, le texte est la correction de l'exercice.
              },
            ],
            reponse: {
              texte:
                'le texte affiché au-dessus du formulaire numerique dans AMC', // facultatif
              valeur: question.qreponse, // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
              param: {
                // digits: 3, // obligatoire pour AMC (le nombre de chiffres pour AMC, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
                // decimals: 0, // facultatif. S'il n'est pas mis, il sera mis à 0 et sera déterminé automatiquement comme décrit ci-dessus
                signe: false, // (présence d'une case + ou - pour AMC)
              },
            },
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
