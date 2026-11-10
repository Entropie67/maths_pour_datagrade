import {
  MARQUE_CHAMP_SCHEMA,
  schemaEnBarreFige,
  type CleTexteSchema,
  type RepartitionAvecReste,
  type SchemaEnBarreTypeEtapes,
} from '../../lib/customElements/SchemaEnBarreElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import { prenoms } from '../../lib/outils/Personne'
import { premierAvec } from '../../lib/outils/primalite'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Modéliser des problèmes niveau $2$'
export const interactifReady = true

export const dateDePublication = '3/06/2025'
export const dateDeModifImportante = '06/11/2026'

/**
 * Associer des problèmes à des modélisations en barres.
 * @author Jean-claude Lhote
 */
export const uuid = '4e89c'

export const refs = {
  'fr-fr': ['6N4A-2'],
  'fr-2016': ['6C35-1'],
  'fr-ch': ['9R1NO7F-7', '9R2NO7F-7', '9R3NO7F-7', 'PRQST02C-7'],
}

// Types utilisés dans les fonctions problèmes
type QuestionType = 'schéma' | 'énoncé' | 'mixte'
type ReponseType = [number, number, number, number]
type ObjetAVendre = {
  nomPluriel: string
  nom: string
  prixMini: number
  prixMaxi: number
}
type ObjetAPartager = {
  nom: string
  nomPart: string
  partsMaxParObjet: number
  partsMinParObjet: number
  multiplicateurParts: number
}

/**
 * Un texte du schéma : une étiquette facultative sur sa propre ligne, puis soit
 * une zone (nombre à compléter ou donné selon le type de question), soit une
 * valeur toujours affichée, et son unité.
 */
type TexteDuSchema = {
  etiquette?: string
  zone?: number
  valeur?: number
  unite: string
}
type SchemaDuProbleme = {
  type: SchemaEnBarreTypeEtapes
  textes: Partial<Record<CleTexteSchema, TexteDuSchema>>
  repartition?: RepartitionAvecReste
}

type FonctionProbleme = {
  (
    interactif?: boolean,
    typeQuestion?: QuestionType,
    decimaux?: boolean,
  ): { enonce: string; schema: SchemaDuProbleme; reponses: ReponseType }
}

/** Le tout est la zone 3, les trois parties les zones 0, 1 et 2. */
function schemaTroisParties(
  [partieA, partieB, partieC]: [string, string, string],
  unite: string,
): SchemaDuProbleme {
  return {
    type: 'additif-trois-parties',
    textes: {
      tout: { zone: 3, unite },
      partieA: { etiquette: partieA, zone: 0, unite },
      partieB: { etiquette: partieB, zone: 1, unite },
      partieC: { etiquette: partieC, zone: 2, unite },
    },
  }
}

/** Un produit (zones 0 et 1) partagé en parts égales (zones 2 et 3) avec un reste. */
function schemaAvecReste(
  nomParts: string,
  unitePart: string,
  unitePartage: string,
  etiquetteReste: string,
  uniteReste: string,
  repartition: RepartitionAvecReste,
): SchemaDuProbleme {
  const reste: TexteDuSchema = {
    etiquette: etiquetteReste,
    valeur: repartition.reste,
    unite: uniteReste,
  }
  return {
    type: 'multiplicatif-avec-reste',
    repartition,
    textes: {
      nombreDeParts: { zone: 0, unite: nomParts },
      part: { zone: 1, unite: unitePart },
      partPartage: { zone: 2, unite: unitePart },
      reste,
      nombrePartages: { zone: 3, unite: unitePartage },
    },
  }
}

/** « un tee-shirt » devient « Tee-shirt ». */
function etiquetteObjet(objet: ObjetAVendre): string {
  return premiereLettreEnMajuscule(objet.nom.replace(/^une? /, ''))
}

function etiquettesObjets(objets: ObjetAVendre[]): [string, string, string] {
  return [
    etiquetteObjet(objets[0]),
    etiquetteObjet(objets[1]),
    etiquetteObjet(objets[2]),
  ]
}

const ETAPES_TRIATHLON: [string, string, string] = [
  'Natation',
  'Vélo',
  'Course à pied',
]
const COLS: [string, string, string] = [
  'Premier col',
  'Deuxième col',
  'Dernier col',
]
const ETAPES_RANDONNEE: [string, string, string] = [
  'Avant la halte',
  'Avant le repas',
  'Après le repas',
]

export const troisObjetsAVendre: [ObjetAVendre, ObjetAVendre, ObjetAVendre][] =
  [
    [
      {
        nomPluriel: 'tee-shirts',
        nom: 'un tee-shirt',
        prixMini: 7,
        prixMaxi: 15,
      },
      {
        nomPluriel: 'paires de baskets',
        nom: 'une paire de baskets',
        prixMini: 70,
        prixMaxi: 130,
      },
      { nomPluriel: 'shorts', nom: 'un short', prixMini: 10, prixMaxi: 25 },
    ],
    [
      { nomPluriel: 'livres', nom: 'un livre', prixMini: 5, prixMaxi: 20 },
      { nomPluriel: 'cahiers', nom: 'un cahier', prixMini: 2, prixMaxi: 5 },
      { nomPluriel: 'stylos', nom: 'un stylo', prixMini: 1, prixMaxi: 5 },
    ],
    [
      {
        nomPluriel: 'jeux vidéo',
        nom: 'un jeu vidéo',
        prixMini: 20,
        prixMaxi: 60,
      },
      {
        nomPluriel: 'consoles de jeu',
        nom: 'une console de jeu',
        prixMini: 200,
        prixMaxi: 400,
      },
      {
        nomPluriel: 'casques audio',
        nom: 'un casque audio',
        prixMini: 30,
        prixMaxi: 100,
      },
    ],
    [
      { nomPluriel: 'vélos', nom: 'un vélo', prixMini: 100, prixMaxi: 300 },
      {
        nomPluriel: 'casques de vélo',
        nom: 'un casque de vélo',
        prixMini: 10,
        prixMaxi: 30,
      },
      {
        nomPluriel: 'pompes à vélo',
        nom: 'une pompe à vélo',
        prixMini: 5,
        prixMaxi: 15,
      },
    ],
    [
      {
        nomPluriel: 'sacs à dos',
        nom: 'un sac à dos',
        prixMini: 15,
        prixMaxi: 50,
      },
      { nomPluriel: 'trousses', nom: 'une trousse', prixMini: 5, prixMaxi: 15 },
      {
        nomPluriel: 'ordinateurs portables',
        nom: 'un ordinateur portable',
        prixMini: 300,
        prixMaxi: 1000,
      },
    ],
    [
      {
        nomPluriel: 'smartphones',
        nom: 'un smartphone',
        prixMini: 200,
        prixMaxi: 800,
      },
      {
        nomPluriel: 'tablettes',
        nom: 'une tablette',
        prixMini: 150,
        prixMaxi: 600,
      },
      {
        nomPluriel: 'montres connectées',
        nom: 'une montre connectée',
        prixMini: 50,
        prixMaxi: 300,
      },
    ],
  ]
const objetsAPartager: ObjetAPartager[] = [
  {
    nom: 'paquets de gâteaux',
    nomPart: 'gâteaux',
    partsMaxParObjet: 10,
    partsMinParObjet: 4,
    multiplicateurParts: 1,
  },
  {
    nom: 'sacs de billes',
    nomPart: 'billes',
    partsMaxParObjet: 5,
    partsMinParObjet: 1,
    multiplicateurParts: 10,
  },
  {
    nom: 'boîtes de chocolats',
    nomPart: 'chocolats',
    partsMaxParObjet: 8,
    partsMinParObjet: 2,
    multiplicateurParts: 5,
  },
  {
    nom: 'sachets de bonbons',
    nomPart: 'bonbons',
    partsMaxParObjet: 12,
    partsMinParObjet: 5,
    multiplicateurParts: 2,
  },
]

// Somme de trois parties

export const troisAchats: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const choix = choice(troisObjetsAVendre)
  const prixAchat = choix.map(
    (o) =>
      randint(o.prixMini, o.prixMaxi) +
      (decimaux ? Number(Math.random().toFixed(1)) + choice([0.05, 0]) : 0),
  )
  const total = prixAchat.reduce((a, b) => a + b, 0)
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const enonce = `${prenom} achète ${choix[0].nom} à zone0 €, ${choix[1].nom} à zone1 € et ${choix[2].nom} à zone2 €. Combien a-t-${pronom} dépensé au total ?<br><br>
    Réponse : ${prenom} a dépensé au total : $${texNombre(prixAchat[0], 2)}+${texNombre(prixAchat[1], 2)}+${texNombre(prixAchat[2], 2)}=$ zone3 €.`
  const schema = schemaTroisParties(etiquettesObjets(choix), '€')
  return {
    enonce,
    schema,
    reponses: [prixAchat[0], prixAchat[1], prixAchat[2], total],
  }
}

export const triathlon: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom

  const distanceNatation = randint(2, 15) * 100 // en mètres
  const distanceVelo = distanceNatation * 15 // en mètres
  const distanceCourse = distanceNatation * 5 // en mètres
  const total = distanceNatation + distanceVelo + distanceCourse
  const enonce = `${prenom} participe à un triathlon. ${premiereLettreEnMajuscule(pronom)} nage zone0 $\\text{m}$, fait du vélo sur zone1 $\\text{m}$ et court sur zone2 $\\text{m}$. Quelle distance totale a-t-${pronom} parcourue ?<br><br>
      Réponse : ${prenom} a parcouru au total : $${texNombre(distanceNatation, 0)}+${texNombre(distanceVelo, 0)}+${texNombre(distanceCourse, 0)} = $ zone3 $\\text{m}$.`
  const schema = schemaTroisParties(ETAPES_TRIATHLON, 'm')
  return {
    enonce,
    schema,
    reponses: [distanceNatation, distanceVelo, distanceCourse, total],
  }
}
export const etapeDeMontagne: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom

  const ascension1 = randint(5, 25) * 50 // en mètres
  const ascension2 = randint(5, 25, Math.round(ascension1 / 100)) * 50 // en mètres
  const ascension3 =
    randint(5, 25, [ascension1 / 100, ascension2 / 100].map(Math.round)) * 50 // en mètres
  const total = ascension1 + ascension2 + ascension3
  const enonce = `${prenom} effectue à vélo une étape de montagne du tour de France. ${premiereLettreEnMajuscule(pronom)} grimpe trois cols qui ont les dénivelés suivants : zone0 $\\text{m}$ pour le premier col, zone1 $\\text{m}$ pour le deuxième et zone2 $\\text{m}$ pour le dernier. Quel dénivelé cumulé a-t-${pronom} grimpé ?<br><br>
      Réponse : ${prenom} a grimpé au total : $${texNombre(ascension1, 0)}+${texNombre(ascension2, 0)}+${texNombre(ascension3)}=$ zone3 $\\text{m}$.`
  const schema = schemaTroisParties(COLS, 'm')
  return {
    enonce,
    schema,
    reponses: [ascension1, ascension2, ascension3, total],
  }
}
export const randonnee: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom

  const distance1 = randint(10, 15) * 300 // en mètres
  const distance2 = randint(10, 15, Math.round(distance1 / 300)) * 300 // en mètres
  const distance3 =
    randint(10, 15, [distance1 / 300, distance2 / 300].map(Math.round)) * 100 // en mètres
  const total = distance1 + distance2 + distance3
  const enonce = `${prenom} part en randonnée. ${premiereLettreEnMajuscule(pronom)} marche zone0 $\\text{m}$ avant sa première halte, puis zone1 $\\text{m}$ avant le repas de midi et enfin zone2 $\\text{m}$. Quelle distance totale a-t-${pronom} parcourue ?<br><br>
      Réponse : ${prenom} a parcouru au total : $${texNombre(distance1, 0)}+${texNombre(distance2, 0)}+${texNombre(distance3, 0)}=$ zone3 $\\text{m}$.`
  const schema = schemaTroisParties(ETAPES_RANDONNEE, 'm')
  return { enonce, schema, reponses: [distance1, distance2, distance3, total] }
}

// Différence entre un tout et la somme de deux parties

export const unAchatParmisTrois: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const choix = choice(troisObjetsAVendre)
  const prixAchat = choix.map(
    (o) =>
      randint(o.prixMini, o.prixMaxi) +
      (decimaux ? Number(Math.random().toFixed(1)) + choice([0.05, 0]) : 0),
  )
  const total = prixAchat.reduce((a, b) => a + b, 0)
  const totalInter = prixAchat[0] + prixAchat[1]
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const enonce = `${prenom} achète ${choix[0].nom} à zone0 €, ${choix[1].nom} à zone1 € et ${choix[2].nom}. ${premiereLettreEnMajuscule(pronom)} a payé en tout zone3 €. Combien coûte ${choix[2].nom} ?<br><br>
    Réponse :<br>
    - Calcul de la somme dépensée pour ${choix[0].nom} et ${choix[1].nom} en € : $${texNombre(prixAchat[0], 2)}+${texNombre(prixAchat[1], 2)}=${texNombre(totalInter, 2)}$.<br>
    - Prix ${choix[2].nom.replace('une', 'de la').replace('un', 'du')} en € : $${texNombre(total, 2)}-${texNombre(totalInter, 2)}=$ zone2 €.`

  const schema = schemaTroisParties(etiquettesObjets(choix), '€')
  return {
    enonce,
    schema,
    reponses: [prixAchat[0], prixAchat[1], prixAchat[2], total],
  }
} // fin de unAchatParmisTrois
const triathlon2: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const distanceNatation = randint(2, 15) * 100 // en mètres
  const distanceVelo = distanceNatation * 15 // en mètres
  const distanceCourse = distanceNatation * 5 // en mètres
  const total = distanceNatation + distanceVelo + distanceCourse
  const totalInter = distanceNatation + distanceCourse
  const enonce = `${prenom} participe à un triathlon. ${premiereLettreEnMajuscule(pronom)} nage zone0 $\\text{m}$, fait ensuite du vélo puis court sur zone2 $\\text{m}$. ${premiereLettreEnMajuscule(pronom)} a parcouru en tout zone3 $\\text{m}$. Quelle distance a-t-${pronom} parcourue à vélo ?<br><br>
      Réponse :<br>
      - Calcul de la distance parcourue en nage et en course à pied en mètres : $${texNombre(distanceNatation, 0)}+${texNombre(distanceCourse, 0)}=${texNombre(totalInter, 0)}$.<br>
      - Distance parcourue à vélo en mètres : $${texNombre(total, 0)}-${texNombre(totalInter, 0)}=$ zone1 $\\text{m}$.`

  const schema = schemaTroisParties(ETAPES_TRIATHLON, 'm')
  return {
    enonce,
    schema,
    reponses: [distanceNatation, distanceVelo, distanceCourse, total],
  }
}

export const etapeDeMontagne2: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const ascension1 = randint(5, 25) * 50 // en mètres
  const ascension2 = randint(5, 25, Math.round(ascension1 / 100)) * 50 // en mètres
  const ascension3 =
    randint(5, 25, [ascension1 / 100, ascension2 / 100].map(Math.round)) * 50 // en mètres
  const total = ascension1 + ascension2 + ascension3
  const enonce = `${prenom} effectue à vélo une étape de montagne du tour de France. ${premiereLettreEnMajuscule(pronom)} grimpe trois cols qui ont les dénivelés suivants : zone0 $\\text{m}$ pour le premier col et zone2 $\\text{m}$ pour le dernier. ${premiereLettreEnMajuscule(pronom)} a grimpé au total zone3 $\\text{m}$. Combien de mètres a-t-${pronom} grimpé lors de l'ascension du deuxième col ?<br><br>
      Réponse : ${prenom} a grimpé zone1 $\\text{m}$ au deuxième col.`
  const schema = schemaTroisParties(COLS, 'm')
  return {
    enonce,
    schema,
    reponses: [ascension1, ascension2, ascension3, total],
  }
}
export const randonnee2: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const distance1 = randint(10, 15) * 300 // en mètres
  const distance2 = randint(10, 15, Math.round(distance1 / 300)) * 300 // en mètres
  const distance3 =
    randint(10, 15, [distance1 / 300, distance2 / 300].map(Math.round)) * 100 // en mètres
  const total = distance1 + distance2 + distance3
  const totalInter = distance1 + distance2
  const enonce = `${prenom} part en randonnée. ${premiereLettreEnMajuscule(pronom)} marche zone0 $\\text{m}$ avant sa première halte, puis zone1 $\\text{m}$ avant le repas de midi et repart ensuite l'après-midi. ${premiereLettreEnMajuscule(pronom)} a parcouru au total zone3 $\\text{m}$. Quelle distance a-t-${pronom} parcourue l'après-midi ?<br><br>
         Réponse :<br>
      - Calcul de la distance parcourue le matin en mètres : $${texNombre(distance1, 0)}+${texNombre(distance2, 0)}=${texNombre(totalInter, 0)}$.<br>
      - Distance parcourue l'après-midi en mètres : $${texNombre(total, 0)}-${texNombre(totalInter, 0)}=$ zone2 $\\text{m}$.`

  const schema = schemaTroisParties(ETAPES_RANDONNEE, 'm')
  return { enonce, schema, reponses: [distance1, distance2, distance3, total] }
}

// quotient entier d'un produit par un diviseur (avec reste)
export const partageEntreAmis: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const objet = choice(objetsAPartager)
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  let nombreAmis: number
  let nombrePartsParObjet: number
  let nombreObjets: number
  let nombrePartsParAmi: number
  let nombrePartsRestantes: number
  do {
    nombreAmis = randint(4, 9)
    nombrePartsParObjet =
      randint(objet.partsMinParObjet, objet.partsMaxParObjet) *
      objet.multiplicateurParts
    nombreObjets = premierAvec(nombreAmis, [], false)
    nombrePartsParAmi = Math.floor(
      (nombreObjets * nombrePartsParObjet) / nombreAmis,
    )
    nombrePartsRestantes =
      nombreObjets * nombrePartsParObjet - nombreAmis * nombrePartsParAmi
  } while (
    nombrePartsRestantes === 0 ||
    nombreObjets === nombrePartsParObjet ||
    nombreObjets === nombrePartsParAmi ||
    nombrePartsParObjet === nombrePartsParAmi ||
    nombrePartsParAmi === nombreAmis ||
    nombreObjets === nombreAmis ||
    nombrePartsParObjet === nombreAmis
  )
  const enonce = `${prenom} a zone0 ${objet.nom} ${objet.nom.startsWith('boîtes') ? 'chacune' : 'chacun'} contenant zone1 ${objet.nomPart}. Quand ${pronom} les distribue à ses amis, chacun en a zone2 et il en reste $${nombrePartsRestantes}$. Combien a-t-${pronom} d'amis ?<br><br>
    Réponse :<br>
    - Calcul du nombre de ${objet.nomPart} total : $${nombreObjets} \\times ${nombrePartsParObjet} = ${nombreObjets * nombrePartsParObjet}$.<br>
    - Calcul du nombre de ${objet.nomPart} partagés : $${nombreObjets * nombrePartsParObjet}-${nombrePartsRestantes}=${nombreAmis * nombrePartsParAmi}$.<br>
    - Nombre d'amis : $${nombreAmis * nombrePartsParAmi} \\div ${nombrePartsParAmi} = ${nombreAmis}$.<br>
    ${prenom} a zone3 amis.`

  const schema = schemaAvecReste(
    objet.nom,
    objet.nomPart,
    'amis',
    'Reste',
    objet.nomPart,
    {
      nbHaut: nombreObjets,
      partHaut: nombrePartsParObjet,
      nbBas: nombreAmis,
      partBas: nombrePartsParAmi,
      reste: nombrePartsRestantes,
    },
  )
  const reponses: [number, number, number, number] = [
    nombreObjets,
    nombrePartsParObjet,
    nombrePartsParAmi,
    nombreAmis,
  ]
  return { enonce, schema, reponses }
} // fin de partageEntreAmis

export const partageDuTemps: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  let tempsParJour: number
  let nbJours: number
  let tempsTotal: number
  let tempsParSujet: number
  let nbSujets: number
  let tempsRestant: number
  do {
    tempsParJour = choice([30, 60, 90, 120]) // en minutes
    nbJours = randint(5, 8)
    tempsTotal = tempsParJour * nbJours // en minutes
    tempsParSujet = choice([55, 65, 85])
    nbSujets = Math.floor(tempsTotal / tempsParSujet)
    tempsRestant = tempsTotal % tempsParSujet
  } while (tempsRestant === 0 || nbSujets < 2)

  const enonce = `${prenom} veut réviser avant un examen. ${premiereLettreEnMajuscule(pronom)} dispose de zone0 jours de révision et décide de travailler zone1 minutes chaque jour. Chaque thème à réviser demande zone2 minutes de révisions et il restera $${tempsRestant}$ minutes à la fin pour faire un bilan de ses révisions. Combien de thèmes a-t-${pronom} à réviser ?<br><br>
    Réponse :<br>
    - Calcul du temps de révision total : $${nbJours} \\times ${tempsParJour} = ${tempsTotal}$ minutes.<br>
    - Calcul du temps hors bilan : $${tempsTotal}-${tempsRestant}=${tempsTotal - tempsRestant}$.<br>
    - Nombre de thèmes révisés :  $${tempsTotal - tempsRestant}\\div ${tempsParSujet}=${nbSujets}$.<br>
    ${prenom} a zone3 thèmes à réviser.`
  const schema = schemaAvecReste(
    'jours',
    'minutes',
    'thèmes',
    'Bilan',
    'minutes',
    {
      nbHaut: nbJours,
      partHaut: tempsParJour,
      nbBas: nbSujets,
      partBas: tempsParSujet,
      reste: tempsRestant,
    },
  )
  const reponses: [number, number, number, number] = [
    nbJours,
    tempsParJour,
    tempsParSujet,
    nbSujets,
  ]
  return { enonce, schema, reponses }
} // fin de partageDuTemps

export const preparationCulinaire: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  let nombreMoules: number
  let nombrePartsParMoule: number
  let nombrePartsParAssiette: number
  let nombrePartsRestantes: number
  let nombreAssiettes: number
  const produit = choice([
    'cookies',
    'muffins',
    'madeleines',
    'cupcakes',
    'gâteaux',
  ])

  do {
    nombreMoules = randint(4, 9)
    nombrePartsParMoule = randint(3, 5) * 2
    nombrePartsParAssiette = premierAvec(nombrePartsParMoule, [], false)
    nombreAssiettes = Math.floor(
      (nombreMoules * nombrePartsParMoule) / nombrePartsParAssiette,
    )
    nombrePartsRestantes =
      nombreMoules * nombrePartsParMoule -
      nombreAssiettes * nombrePartsParAssiette
  } while (
    nombrePartsRestantes === 0 ||
    nombreMoules === nombrePartsParMoule ||
    nombreMoules === nombrePartsParAssiette ||
    nombreMoules === nombreAssiettes ||
    nombrePartsParMoule === nombrePartsParAssiette ||
    nombrePartsParMoule === nombreAssiettes ||
    nombrePartsParAssiette === nombreAssiettes
  )
  const enonce = `${prenom} prépare des ${produit}. ${premiereLettreEnMajuscule(pronom)} utilise zone0 moules, chacun pouvant contenir zone1 parts. Quand ${pronom} les range dans des assiettes, chaque assiette contient zone2 parts et il en reste $${nombrePartsRestantes}$. Combien d'assiettes a-t-${pronom} prévues ?<br><br>
  Réponse :<br>
  - Calcul du nombre de ${produit} total : $${nombreMoules} \\times ${nombrePartsParMoule} = ${nombreMoules * nombrePartsParMoule}$.<br>
  - Calcul du nombre de ${produit} disposés sur les assiettes : $${nombreMoules * nombrePartsParMoule}-${nombrePartsRestantes}=${nombreAssiettes * nombrePartsParAssiette}$.<br>
  - Nombre d'assiettes : $${nombreAssiettes * nombrePartsParAssiette} \\div ${nombrePartsParAssiette} = ${nombreAssiettes}$.<br>
  ${prenom} a prévu zone3 assiettes.`
  const schema = schemaAvecReste(
    'moules',
    'parts',
    'assiettes',
    'Reste',
    'parts',
    {
      nbHaut: nombreMoules,
      partHaut: nombrePartsParMoule,
      nbBas: nombreAssiettes,
      partBas: nombrePartsParAssiette,
      reste: nombrePartsRestantes,
    },
  )
  const reponses: [number, number, number, number] = [
    nombreMoules,
    nombrePartsParMoule,
    nombrePartsParAssiette,
    nombreAssiettes,
  ]
  return { enonce, schema, reponses }
} // fin de preparationCulinaire

// Différence entre une somme de deux parties et une troisième partie
export const comparaisonDeuxSommes: FonctionProbleme = (
  interactif = false,
  typeQuestion: QuestionType = 'schéma',
  decimaux = false,
) => {
  const prenomData = choice(prenoms)
  const prenom = prenomData.prenom
  const pronom = prenomData.pronom
  const objets = choice(troisObjetsAVendre)
  const prixAchat1 =
    randint(objets[0].prixMini, objets[0].prixMaxi) +
    (decimaux ? Number(Math.random().toFixed(1)) + choice([0.05, 0]) : 0)
  const prixAchat2 =
    randint(objets[1].prixMini, objets[1].prixMaxi) +
    (decimaux ? Number(Math.random().toFixed(1)) + choice([0.05, 0]) : 0)
  const [objet1, prix1] =
    prixAchat1 < prixAchat2 ? [objets[0], prixAchat1] : [objets[1], prixAchat2]
  const [objet2, prix2] =
    prixAchat1 < prixAchat2 ? [objets[1], prixAchat2] : [objets[0], prixAchat1]
  const argentDePrenom = Math.round(
    ((prixAchat1 + prixAchat2) * randint(5, 8)) / 10,
  )
  const enonce = `${premiereLettreEnMajuscule(objet1.nom)} coûte zone0 € et ${objet2.nom} coûte zone1 €. ${prenom} a zone2 €. Combien ${prenom} doit-${pronom} avoir en plus pour acheter ces deux objets ?<br><br>
  Réponse :<br>
  - Calcul du prix total en € : $${texNombre(prix1, 2)}+${texNombre(prix2, 2)}=${texNombre(prix1 + prix2)}$.<br>
  - Calcul de la différence en € : $${texNombre(prix1 + prix2)}-${argentDePrenom}=${prix1 + prix2 - argentDePrenom}$.<br>
  ${prenom} doit avoir zone3 € de plus pour acheter ces deux objets.`
  const schema: SchemaDuProbleme = {
    type: 'additif-somme-comparaison',
    textes: {
      partieA: { etiquette: etiquetteObjet(objet1), zone: 0, unite: '€' },
      partieB: { etiquette: etiquetteObjet(objet2), zone: 1, unite: '€' },
      partieC: { etiquette: prenom, zone: 2, unite: '€' },
      difference: { zone: 3, unite: '€ de plus' },
    },
  }
  const reponses: [number, number, number, number] = [
    prix1,
    prix2,
    argentDePrenom,
    Math.max(0, prix1 + prix2 - argentDePrenom),
  ]
  return { enonce, schema, reponses }
}
/**
 * Fonction qui va produire l'énoncé et la correction en choisissant aléatoirement une fonction problème.
 * C'est aussi dans cette fonction qu'est géré l'interactivité le cas échéant.
 * @param exercice
 * @param typeQuestion
 * @param startInteractif
 * @returns
 */
function genereEnonces(
  exercice: Exercice,
  typeQuestion: QuestionType,
  startInteractif = 0,
  fonction: FonctionProbleme,
): { enonce: string; nextInteractif: number; correction: string } {
  const interactif = exercice.interactif
  const {
    schema,
    reponses,
    enonce: enonceAvecZones,
  } = fonction(interactif, typeQuestion)
  let enonce = enonceAvecZones
  let indexInteractif = startInteractif
  const zoneAQuestionner = combinaisonListes(['e', 's'], 4)
  // Une zone est donnée à un endroit et à compléter à l'autre.
  const estDonneeDansEnonce = (zone: number) =>
    typeQuestion === 'schéma' ||
    (typeQuestion === 'mixte' && zoneAQuestionner[zone] === 'e')
  const nombreDansEnonce = (zone: number) => `$${texNombre(reponses[zone], 2)}$`
  const nombreDansSchema = (zone: number) => stringNombre(reponses[zone], 2)
  const cles = Object.keys(schema.textes) as CleTexteSchema[]
  /** Les textes du schéma, le contenu de chaque zone étant donné par `contenuZone`. */
  const textesDuSchema = (contenuZone: (zone: number) => string) =>
    Object.fromEntries(
      cles.map((cle) => {
        const { etiquette, zone, valeur, unite } = schema.textes[
          cle
        ] as TexteDuSchema
        const contenu =
          zone == null ? stringNombre(valeur ?? 0, 2) : contenuZone(zone)
        return [
          cle,
          `${etiquette == null ? '' : `${etiquette}\n`}${contenu} ${unite}`,
        ]
      }),
    )
  // Dans l'énoncé, le schéma attend les zones données par le texte (champ de
  // saisie ou points de suspension). La correction les montre toutes, celles à
  // compléter en évidence.
  const contenuZoneSchema = (zone: number) =>
    estDonneeDansEnonce(zone)
      ? interactif
        ? MARQUE_CHAMP_SCHEMA
        : '…'
      : nombreDansSchema(zone)

  for (let k = 0; k < 4; k++) {
    if (estDonneeDansEnonce(k)) {
      enonce = enonce.replace(`zone${k}`, nombreDansEnonce(k))
    }
  }
  let enonceCorr = enonce
  for (let k = 0; k < 4; k++) {
    enonceCorr = enonceCorr.replace(
      `zone${k}`,
      `$${miseEnEvidence(texNombre(reponses[k], 2))}$`,
    )
  }
  const schemaCorr = schemaEnBarreFige({
    type: schema.type,
    textes: textesDuSchema(nombreDansSchema),
    repartition: schema.repartition,
    nombresEnEvidence: cles.filter((cle) => {
      const zone = schema.textes[cle]?.zone
      return zone != null && estDonneeDansEnonce(zone)
    }),
  })
  enonceCorr =
    typeQuestion === 'schéma'
      ? `Le problème :<br><br>${enonceCorr}<br><br>
  se modélise par le schéma suivant :<br><br>
${schemaCorr}`
      : typeQuestion === 'énoncé'
        ? `Le schéma : <br><br>${schemaCorr}${context.isHtml ? '<br>' : ''}
correspond à l'énoncé ci-dessous :<br><br>
${enonceCorr}`
        : `Voici l'énoncé et le schéma correspondant :<br><br>
${enonceCorr}<br><br>
${schemaCorr}`

  /** Un champ de saisie par zone à compléter, un point par champ. */
  const ajouteChamp = (zone: number) => {
    const champ = ajouteChampTexteMathLive(
      exercice,
      indexInteractif,
      `schemaEnBoite ${KeyboardType.clavierNumbers}`,
    )
    handleAnswers(exercice, indexInteractif, {
      reponse: {
        value: texNombre(reponses[zone], 2),
        options: { noFeedback: true },
      },
    })
    indexInteractif++
    return champ
  }
  for (let k = 0; k < 4; k++) {
    if (estDonneeDansEnonce(k)) continue
    enonce = enonce.replace(
      `zone${k}`,
      interactif ? ajouteChamp(k) : '$\\ldots$',
    )
  }
  const champs: Partial<Record<CleTexteSchema, string>> = {}
  if (interactif) {
    for (let k = 0; k < 4; k++) {
      const cle = cles.find((c) => schema.textes[c]?.zone === k)
      if (cle != null && estDonneeDansEnonce(k)) champs[cle] = ajouteChamp(k)
    }
  }
  const schemaEnonce = schemaEnBarreFige({
    type: schema.type,
    textes: textesDuSchema(contenuZoneSchema),
    repartition: schema.repartition,
    champs,
  })
  const texte = `${enonce}<br>
  ${schemaEnonce}${context.isHtml ? '<br>' : ''}`
  return {
    enonce: texte,
    nextInteractif: indexInteractif,
    correction: enonceCorr,
  }
}

export default class ModelisationProblemes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Types de questions',
      "Nombres séparés par des tirets :\n1 : Compléter le schéma\n2 : Compléter l'énoncé\n3 : Compléter le schéma et l'énoncé\n4 : Mélange",
    ]
    this.sup = '4'
    this.besoinFormulaire2Texte = [
      'Types de problèmes',
      "Nombres séparés par des tirets :\n1 : Calcul de partie manquante avec comparaison\n2 : Somme de trois parties\n3 : Partie manquante d'une somme\n4 : Quotient (avec reste) d'un produit de deux nombres\n5 : Mélange",
    ]
    this.sup2 = '5'
  }

  nouvelleVersion() {
    this.consigne = `Trouver les nombres manquants dans ${this.nbQuestions > 1 ? 'ces problèmes' : 'ce problème'} afin que l'énoncé, la réponse et le schéma se correspondent.`
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['schéma', 'énoncé', 'mixte'],
    }) as unknown as QuestionType[]
    const typeDeProblèmes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
    }).map((el) => Number(el) - 1)
    const problèmes = [
      [comparaisonDeuxSommes],
      [troisAchats, triathlon, etapeDeMontagne, randonnee],
      [unAchatParmisTrois, triathlon2, etapeDeMontagne2, randonnee2],
      [partageEntreAmis, partageDuTemps, preparationCulinaire],
    ]
    const fonctions = typeDeProblèmes.map(
      (type, i) => problèmes[type][i % problèmes[type].length],
    )
    let indexInteractif = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { enonce, nextInteractif, correction } = genereEnonces(
        this,
        typeDeQuestions[i],
        indexInteractif,
        fonctions[i],
      )
      if (this.questionJamaisPosee(i, enonce.split('?')[0])) {
        indexInteractif = nextInteractif
        this.listeQuestions.push(enonce)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
  }
}
