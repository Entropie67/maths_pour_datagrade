// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a4b8f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 3ca3967a1).
/**
 * Exercice 1A-R02-6 : Calculer un prix dans une situation de proportionnalité
 *
 * L'élève doit calculer le prix d'une certaine quantité d'objets connaissant
 * le prix d'une autre quantité des mêmes objets.
 *
 * PRINCIPE :
 * - On présente une situation réaliste (boulangerie, papeterie, etc.)
 * - On donne le prix de Q1 objets = P1 euros
 * - On demande le prix de Q2 objets = ? euros
 * - La bonne réponse est : (P1 × Q2) ÷ Q1
 *
 * CONTEXTES :
 * - Lieux cohérents (boulangerie pour croissants, papeterie pour stylos, etc.)
 * - Prix unitaires réalistes selon l'objet
 * - Configurations prédéfinies garantissant des calculs propres
 *
 * DISTRACTEURS :
 * - d1 : Prix fixe de 1€ par objet supplémentaire (erreur conceptuelle)
 * - d2 : Confusion dans la formule : (Q2 × Q1) ÷ P1
 * - d3 : Autre confusion : (Q1 × P1) ÷ Q2
 *
 * @author G.Marris
 * @date 22/09/2025
 * @updated 08/10/2025 - Refactorisation : architecture conforme (appliquerLesValeurs)
 * @updated 08/01/2026 - Correction bug sujet original (énoncé figé)
 */

import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteItalique } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

// ============================================================================
// MÉTADONNÉES
// ============================================================================
export const uuid = 'a4b8f'
export const refs = { 'fr-fr': [], 'fr-ch': ['NR'] }
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un prix dans une situation de proportionnalité'
export const dateDePublication = '22/09/2025'

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================
interface ObjetAchat {
  nom: string
  pluriel: string
  qteMaxRealiste: number
  genre: 'M' | 'F' // pour les accords grammaticaux
}

interface LieuContexte {
  debut: string // "À la boulangerie" (début de phrase)
  milieu: string // "à la boulangerie" (milieu de phrase)
  objets: string[] // objets cohérents avec ce lieu
}

interface ModelePhrase {
  phrase: string
  utilise_lieu_debut: boolean
  utilise_lieu_milieu: boolean
  utilise_prenom: boolean
}

interface ConfigurationPrix {
  objet: string
  qte: number
  prixUnitaire: number
  prixTotal: number
}

interface DonneesExercice {
  objet: ObjetAchat
  lieu: LieuContexte
  qte1: number
  prix1: number
  qte2: number
  prixUnitaire: number
  bonneReponse: number
  distracteurs: [number, number, number]
  enoncePersonnalise?: string
  modele?: ModelePhrase
  prenom?: { nom: string; pronom: string } | null
}

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================
export default class Auto1AR71Old extends ExerciceQcmA {
  // ==========================================================================
  // 1. DONNÉES STATIQUES
  // ==========================================================================

  // Liste des objets avec leurs caractéristiques réalistes
  private static readonly OBJETS: ObjetAchat[] = [
    // Papeterie/École - prix unitaires typiques : 0,30€ à 3€
    { nom: 'stylo', pluriel: 'stylos', qteMaxRealiste: 25, genre: 'M' },
    { nom: 'crayon', pluriel: 'crayons', qteMaxRealiste: 30, genre: 'M' },
    { nom: 'gomme', pluriel: 'gommes', qteMaxRealiste: 15, genre: 'F' },
    { nom: 'feutre', pluriel: 'feutres', qteMaxRealiste: 20, genre: 'M' },
    { nom: 'cahier', pluriel: 'cahiers', qteMaxRealiste: 12, genre: 'M' },
    { nom: 'classeur', pluriel: 'classeurs', qteMaxRealiste: 8, genre: 'M' },
    { nom: 'règle', pluriel: 'règles', qteMaxRealiste: 10, genre: 'F' },
    { nom: 'livre', pluriel: 'livres', qteMaxRealiste: 8, genre: 'M' },

    // Alimentation - prix variables selon le produit
    { nom: 'croissant', pluriel: 'croissants', qteMaxRealiste: 12, genre: 'M' },
    {
      nom: 'pain au chocolat',
      pluriel: 'pains au chocolat',
      qteMaxRealiste: 10,
      genre: 'M',
    },
    { nom: 'baguette', pluriel: 'baguettes', qteMaxRealiste: 8, genre: 'F' },
    { nom: 'pomme', pluriel: 'pommes', qteMaxRealiste: 20, genre: 'F' },
    { nom: 'orange', pluriel: 'oranges', qteMaxRealiste: 15, genre: 'F' },
    { nom: 'banane', pluriel: 'bananes', qteMaxRealiste: 12, genre: 'F' },
    { nom: 'yaourt', pluriel: 'yaourts', qteMaxRealiste: 8, genre: 'M' },
    { nom: 'œuf', pluriel: 'œufs', qteMaxRealiste: 30, genre: 'M' },
    { nom: 'chocolat', pluriel: 'chocolats', qteMaxRealiste: 15, genre: 'M' },
    { nom: 'bonbon', pluriel: 'bonbons', qteMaxRealiste: 50, genre: 'M' },

    // Autres
    { nom: 'magazine', pluriel: 'magazines', qteMaxRealiste: 5, genre: 'M' },
    {
      nom: 'carte postale',
      pluriel: 'cartes postales',
      qteMaxRealiste: 10,
      genre: 'F',
    },
  ]

  // Lieux avec leurs objets cohérents pour créer des situations réalistes
  private static readonly CONTEXTES: LieuContexte[] = [
    {
      debut: 'À la boulangerie',
      milieu: 'à la boulangerie',
      objets: ['croissant', 'pain au chocolat', 'baguette'],
    },
    {
      debut: 'Dans cette papeterie',
      milieu: 'dans cette papeterie',
      objets: [
        'stylo',
        'crayon',
        'gomme',
        'feutre',
        'cahier',
        'classeur',
        'règle',
      ],
    },
    {
      debut: 'À la librairie',
      milieu: 'à la librairie',
      objets: ['livre', 'magazine', 'cahier'],
    },
    {
      debut: 'Au marché',
      milieu: 'au marché',
      objets: ['pomme', 'orange', 'banane'],
    },
    {
      debut: 'Au supermarché',
      milieu: 'au supermarché',
      objets: ['chocolat', 'bonbon', 'pomme', 'orange', 'yaourt', 'œuf'],
    },
    {
      debut: 'Dans ce magasin',
      milieu: 'dans ce magasin',
      objets: ['stylo', 'crayon', 'cahier', 'livre', 'chocolat'],
    },
    {
      debut: 'Dans cette boutique souvenir',
      milieu: 'dans cette boutique souvenir',
      objets: ['carte postale', 'magazine'],
    },
  ]

  /**
   * Configurations prix prédéfinies pour garantir des calculs propres.
   * Chaque configuration associe un objet à une quantité et un prix total,
   * ce qui détermine un prix unitaire exact (évite les arrondis compliqués).
   *
   * Format : { objet, quantité, prix_unitaire, prix_total }
   * Contrainte : prix_total = quantité × prix_unitaire (exactement)
   */
  private static readonly CONFIGURATIONS_PRIX: ConfigurationPrix[] = [
    // STYLOS (0,5€ - 3€ l'unité)
    { objet: 'stylo', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'stylo', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'stylo', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'stylo', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'stylo', qte: 5, prixUnitaire: 1.2, prixTotal: 6 },
    { objet: 'stylo', qte: 5, prixUnitaire: 1.8, prixTotal: 9 },
    { objet: 'stylo', qte: 5, prixUnitaire: 2.4, prixTotal: 12 },
    { objet: 'stylo', qte: 10, prixUnitaire: 1.1, prixTotal: 11 },
    { objet: 'stylo', qte: 10, prixUnitaire: 1.4, prixTotal: 14 },
    { objet: 'stylo', qte: 20, prixUnitaire: 0.6, prixTotal: 12 },
    { objet: 'stylo', qte: 20, prixUnitaire: 0.8, prixTotal: 16 },

    // CRAYONS (0,3€ - 1,5€ l'unité)
    { objet: 'crayon', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'crayon', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'crayon', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'crayon', qte: 5, prixUnitaire: 0.6, prixTotal: 3 },
    { objet: 'crayon', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'crayon', qte: 5, prixUnitaire: 1.2, prixTotal: 6 },
    { objet: 'crayon', qte: 10, prixUnitaire: 0.7, prixTotal: 7 },
    { objet: 'crayon', qte: 10, prixUnitaire: 1.1, prixTotal: 11 },
    { objet: 'crayon', qte: 20, prixUnitaire: 0.5, prixTotal: 10 },

    // GOMMES (0,4€ - 2,5€ l'unité)
    { objet: 'gomme', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'gomme', qte: 4, prixUnitaire: 1.5, prixTotal: 6 },
    { objet: 'gomme', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'gomme', qte: 5, prixUnitaire: 1.6, prixTotal: 8 },
    { objet: 'gomme', qte: 10, prixUnitaire: 0.9, prixTotal: 9 },

    // FEUTRES (0,6€ - 3,5€ l'unité)
    { objet: 'feutre', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'feutre', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'feutre', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'feutre', qte: 5, prixUnitaire: 1.4, prixTotal: 7 },
    { objet: 'feutre', qte: 5, prixUnitaire: 2.2, prixTotal: 11 },
    { objet: 'feutre', qte: 10, prixUnitaire: 1.3, prixTotal: 13 },

    // CAHIERS (1,5€ - 5€ l'unité)
    { objet: 'cahier', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'cahier', qte: 4, prixUnitaire: 2.75, prixTotal: 11 },
    { objet: 'cahier', qte: 4, prixUnitaire: 3.25, prixTotal: 13 },
    { objet: 'cahier', qte: 5, prixUnitaire: 2.4, prixTotal: 12 },
    { objet: 'cahier', qte: 5, prixUnitaire: 3.2, prixTotal: 16 },
    { objet: 'cahier', qte: 10, prixUnitaire: 1.8, prixTotal: 18 },

    // CLASSEURS (2€ - 8€ l'unité)
    { objet: 'classeur', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'classeur', qte: 4, prixUnitaire: 3.75, prixTotal: 15 },
    { objet: 'classeur', qte: 5, prixUnitaire: 3.2, prixTotal: 16 },
    { objet: 'classeur', qte: 5, prixUnitaire: 4.4, prixTotal: 22 },

    // RÈGLES (0,8€ - 3€ l'unité)
    { objet: 'règle', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'règle', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'règle', qte: 5, prixUnitaire: 1.6, prixTotal: 8 },
    { objet: 'règle', qte: 10, prixUnitaire: 1.2, prixTotal: 12 },

    // CROISSANTS (0,8€ - 2,2€ l'unité)
    { objet: 'croissant', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'croissant', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'croissant', qte: 5, prixUnitaire: 1.4, prixTotal: 7 },
    { objet: 'croissant', qte: 5, prixUnitaire: 2.0, prixTotal: 10 },
    { objet: 'croissant', qte: 10, prixUnitaire: 1.1, prixTotal: 11 },

    // PAINS AU CHOCOLAT (0,9€ - 2,5€ l'unité)
    { objet: 'pain au chocolat', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'pain au chocolat', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'pain au chocolat', qte: 5, prixUnitaire: 1.4, prixTotal: 7 },
    { objet: 'pain au chocolat', qte: 5, prixUnitaire: 2.0, prixTotal: 10 },
    { objet: 'pain au chocolat', qte: 10, prixUnitaire: 1.2, prixTotal: 12 },

    // BAGUETTES (0,8€ - 1,5€ l'unité)
    { objet: 'baguette', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'baguette', qte: 5, prixUnitaire: 1.0, prixTotal: 5 },
    { objet: 'baguette', qte: 5, prixUnitaire: 1.2, prixTotal: 6 },

    // POMMES (0,3€ - 1€ l'unité)
    { objet: 'pomme', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'pomme', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'pomme', qte: 5, prixUnitaire: 0.6, prixTotal: 3 },
    { objet: 'pomme', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'pomme', qte: 10, prixUnitaire: 0.7, prixTotal: 7 },
    { objet: 'pomme', qte: 20, prixUnitaire: 0.5, prixTotal: 10 },

    // ORANGES (0,3€ - 0,8€ l'unité)
    { objet: 'orange', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'orange', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'orange', qte: 5, prixUnitaire: 0.6, prixTotal: 3 },
    { objet: 'orange', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'orange', qte: 10, prixUnitaire: 0.5, prixTotal: 5 },
    { objet: 'orange', qte: 10, prixUnitaire: 0.9, prixTotal: 9 },

    // BANANES (0,2€ - 1€ l'unité)
    { objet: 'banane', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'banane', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'banane', qte: 5, prixUnitaire: 0.6, prixTotal: 3 },
    { objet: 'banane', qte: 10, prixUnitaire: 0.4, prixTotal: 4 },
    { objet: 'banane', qte: 10, prixUnitaire: 0.7, prixTotal: 7 },

    // YAOURTS (0,5€ - 1,5€ l'unité)
    { objet: 'yaourt', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'yaourt', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'yaourt', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'yaourt', qte: 5, prixUnitaire: 1.2, prixTotal: 6 },

    // ŒUFS (0,2€ - 0,6€ l'unité)
    { objet: 'œuf', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'œuf', qte: 5, prixUnitaire: 0.4, prixTotal: 2 },
    { objet: 'œuf', qte: 10, prixUnitaire: 0.3, prixTotal: 3 },
    { objet: 'œuf', qte: 20, prixUnitaire: 0.25, prixTotal: 5 },

    // CHOCOLATS (0,8€ - 4€ l'unité)
    { objet: 'chocolat', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'chocolat', qte: 4, prixUnitaire: 1.75, prixTotal: 7 },
    { objet: 'chocolat', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'chocolat', qte: 5, prixUnitaire: 1.6, prixTotal: 8 },
    { objet: 'chocolat', qte: 5, prixUnitaire: 2.4, prixTotal: 12 },

    // BONBONS (0,1€ - 1€ l'unité)
    { objet: 'bonbon', qte: 4, prixUnitaire: 0.25, prixTotal: 1 },
    { objet: 'bonbon', qte: 4, prixUnitaire: 0.5, prixTotal: 2 },
    { objet: 'bonbon', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'bonbon', qte: 5, prixUnitaire: 0.4, prixTotal: 2 },
    { objet: 'bonbon', qte: 5, prixUnitaire: 0.6, prixTotal: 3 },
    { objet: 'bonbon', qte: 10, prixUnitaire: 0.3, prixTotal: 3 },
    { objet: 'bonbon', qte: 20, prixUnitaire: 0.25, prixTotal: 5 },

    // LIVRES (6€ - 18€ l'unité)
    { objet: 'livre', qte: 4, prixUnitaire: 8.25, prixTotal: 33 },
    { objet: 'livre', qte: 4, prixUnitaire: 12.75, prixTotal: 51 },
    { objet: 'livre', qte: 5, prixUnitaire: 9.2, prixTotal: 46 },
    { objet: 'livre', qte: 5, prixUnitaire: 11.6, prixTotal: 58 },

    // MAGAZINES (2€ - 6€ l'unité)
    { objet: 'magazine', qte: 4, prixUnitaire: 2.25, prixTotal: 9 },
    { objet: 'magazine', qte: 4, prixUnitaire: 3.75, prixTotal: 15 },
    { objet: 'magazine', qte: 5, prixUnitaire: 2.8, prixTotal: 14 },
    { objet: 'magazine', qte: 5, prixUnitaire: 4.4, prixTotal: 22 },

    // CARTES POSTALES (0,5€ - 2€ l'unité)
    { objet: 'carte postale', qte: 4, prixUnitaire: 0.75, prixTotal: 3 },
    { objet: 'carte postale', qte: 4, prixUnitaire: 1.25, prixTotal: 5 },
    { objet: 'carte postale', qte: 5, prixUnitaire: 0.8, prixTotal: 4 },
    { objet: 'carte postale', qte: 5, prixUnitaire: 1.6, prixTotal: 8 },
    { objet: 'carte postale', qte: 10, prixUnitaire: 0.7, prixTotal: 7 },
  ]

  // Modèles de phrases variées pour éviter la monotonie
  private static readonly MODELES: ModelePhrase[] = [
    {
      phrase:
        '#LIEU_DEBUT, le prix de #Q1 #OBJET est #PRIX1 €.<br>Le prix de #Q2 #OBJET est donc :',
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: false,
    },
    {
      phrase:
        "#LIEU_DEBUT, l'offre du jour annonce : #Q1 #OBJET pour #PRIX1 €.<br>Combien coûteront #Q2 #OBJET ?",
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: false,
    },
    {
      phrase:
        "#PRENOM a acheté #Q1 #OBJET #LIEU_MILIEU au prix de #PRIX1 €.<br>Le prix qu'#PRONOM_SUJET aurait payé pour #Q2 #OBJET est :",
      utilise_lieu_debut: false,
      utilise_lieu_milieu: true,
      utilise_prenom: true,
    },
    {
      phrase:
        '#PRENOM remarque #LIEU_MILIEU que #Q1 #OBJET coûtent #PRIX1 €.<br>Pour acheter #Q2 #OBJET, #PRONOM_SUJET devra payer :',
      utilise_lieu_debut: false,
      utilise_lieu_milieu: true,
      utilise_prenom: true,
    },
    {
      phrase:
        '#LIEU_DEBUT, #PRENOM calcule :<br> si #Q1 #OBJET coûtent #PRIX1 €, alors #Q2 #OBJET coûteront :',
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: true,
    },
    {
      phrase:
        '#LIEU_DEBUT, pour #PRIX1 €, on peut acheter #Q1 #OBJET.<br>Combien coûteront #Q2 #OBJET ?',
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: false,
    },
    {
      phrase:
        "#LIEU_DEBUT, l'étiquette indique : #PRIX1 € les #Q1 #OBJET.<br>Le prix de #Q2 #OBJET sera donc :",
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: false,
    },
    {
      phrase:
        'Avec un budget de #PRIX1 €, #PRENOM peut acheter #Q1 #OBJET.<br>Pour #Q2 #OBJET, #PRONOM_SUJET devra payer :',
      utilise_lieu_debut: false,
      utilise_lieu_milieu: false,
      utilise_prenom: true,
    },
    {
      phrase:
        '#LIEU_DEBUT, la promotion annonce : #PRIX1 € pour #Q1 #OBJET !<br>À ce prix, #Q2 #OBJET coûteront :',
      utilise_lieu_debut: true,
      utilise_lieu_milieu: false,
      utilise_prenom: false,
    },
  ]

  // Prénoms pour les contextes personnalisés
  private static readonly PRENOMS = [
    { nom: 'Adam', pronom: 'il' },
    { nom: 'Alex', pronom: 'il' },
    { nom: 'Anaïs', pronom: 'elle' },
    { nom: 'Antoine', pronom: 'il' },
    { nom: 'Arthur', pronom: 'il' },
    { nom: 'Élise', pronom: 'elle' },
    { nom: 'Emma', pronom: 'elle' },
    { nom: 'Enzo', pronom: 'il' },
    { nom: 'Julien', pronom: 'il' },
    { nom: 'Julie', pronom: 'elle' },
    { nom: 'Laura', pronom: 'elle' },
    { nom: 'Léa', pronom: 'elle' },
    { nom: 'Lucas', pronom: 'il' },
    { nom: 'Margot', pronom: 'elle' },
    { nom: 'Marie', pronom: 'elle' },
    { nom: 'Noah', pronom: 'il' },
    { nom: 'Océane', pronom: 'elle' },
    { nom: 'Raphaël', pronom: 'il' },
    { nom: 'Sophie', pronom: 'elle' },
    { nom: 'Tom', pronom: 'il' },
  ]

  private static readonly MAX_TENTATIVES = 100

  // ==========================================================================
  // 2. MÉTHODES UTILITAIRES PRIVÉES
  // ==========================================================================

  /**
   * Fonction pour remplacer les champs dans une phrase modèle.
   *
   * Les champs disponibles :
   * - #Q1, #Q2 : quantités
   * - #PRIX1 : prix de la première quantité
   * - #OBJET : nom de l'objet (gestion automatique sing./pluriel selon position)
   * - #LIEU_DEBUT, #LIEU_MILIEU : contexte du lieu
   * - #PRENOM, #PRONOM_SUJET : personnage si utilisé
   *
   * @param phrase Phrase modèle avec champs
   * @param donnees Données de l'exercice
   * @returns Phrase complète avec remplacements
   */
  private remplacerChamps(phrase: string, donnees: DonneesExercice): string {
    const { objet, lieu, qte1, qte2, prix1, prenom } = donnees
    let resultat = phrase

    // Remplacements de base
    resultat = resultat.replace(/#Q1/g, qte1.toString())
    resultat = resultat.replace(/#Q2/g, qte2.toString())
    resultat = resultat.replace(/#PRIX1/g, `$${texNombre(prix1, 2)}$`)

    // Objets avec accord singulier/pluriel
    const objet1 = qte1 > 1 ? objet.pluriel : objet.nom
    const objet2 = qte2 > 1 ? objet.pluriel : objet.nom

    let compteurObjet = 0
    resultat = resultat.replace(/#OBJET/g, () => {
      compteurObjet++
      return compteurObjet === 1 ? objet1 : objet2
    })

    // Lieux
    resultat = resultat.replace(/#LIEU_DEBUT/g, lieu.debut)
    resultat = resultat.replace(/#LIEU_MILIEU/g, lieu.milieu)

    // Prénoms
    if (prenom) {
      resultat = resultat.replace(/#PRENOM/g, prenom.nom)
      resultat = resultat.replace(/#PRONOM_SUJET/g, prenom.pronom)
    }

    return resultat
  }

  /**
   * Génère une configuration complète pour un exercice.
   *
   * ÉTAPES :
   * 1. Choisit un contexte cohérent (lieu + objet approprié)
   * 2. Sélectionne une configuration prix prédéfinie pour cet objet
   * 3. Tire au sort une quantité différente pour la question
   * 4. Calcule la bonne réponse et les distracteurs
   * 5. Vérifie la validité (pas de prix négatifs, propositions distinctes, etc.)
   *
   * @returns Configuration complète ou null si échec
   */
  private genererConfiguration(): DonneesExercice | null {
    // Étape 1 : Sélection d'un contexte cohérent
    const contexte = choice(Auto1AR71Old.CONTEXTES)
    const nomObjet = choice(contexte.objets)
    const objet = Auto1AR71Old.OBJETS.find((o) => o.nom === nomObjet)

    if (!objet) return null

    // Étape 2 : Filtrer les configurations pour cet objet
    const configurationsDisponibles = Auto1AR71Old.CONFIGURATIONS_PRIX.filter(
      (config) => config.objet === nomObjet,
    )

    if (configurationsDisponibles.length === 0) return null

    // Étape 3 : Sélection d'une configuration de prix
    const config = choice(configurationsDisponibles)
    const qte1 = config.qte
    const prix1 = config.prixTotal
    const prixUnitaire = config.prixUnitaire

    // Étape 4 : Quantité demandée (différente de celle donnée)
    let qte2: number
    do {
      qte2 = randint(2, objet.qteMaxRealiste)
    } while (qte2 === qte1)

    // Étape 5 : Calculs des réponses
    const bonneReponse = arrondi(qte2 * prixUnitaire, 2)

    // DISTRACTEURS :
    // d1 : Erreur "1€ par objet supplémentaire" -> prix1 + (qte2-qte1)
    const d1 = arrondi(prix1 + (qte2 - qte1), 2)
    // d2 : Confusion dans la formule : (qte2 × qte1) ÷ prix1
    const d2 = arrondi((qte2 * qte1) / prix1, 2)
    // d3 : Autre confusion : (qte1 × prix1) ÷ qte2
    const d3 = arrondi((qte1 * prix1) / qte2, 2)

    // Étape 6 : Validations de sécurité
    const propositions = [bonneReponse, d1, d2, d3]

    // Vérifier qu'aucun prix n'est négatif ou nul
    if (propositions.some((p) => p <= 0)) return null

    // Vérifier que les 4 propositions sont distinctes après formatage
    const propositionsFormatees = propositions.map(
      (p) => `$${texNombre(p, 2)}$`,
    )
    if (new Set(propositionsFormatees).size !== 4) return null

    return {
      objet,
      lieu: contexte,
      qte1,
      prix1,
      qte2,
      prixUnitaire,
      bonneReponse,
      distracteurs: [d1, d2, d3],
    }
  }

  // ==========================================================================
  // 3. CONSTRUCTEUR
  // ==========================================================================
  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  // ==========================================================================
  // 4. VERSIONS (qui appellent appliquerLesValeurs())
  // ==========================================================================

  versionOriginale: () => void = () => {
    const objet = Auto1AR71Old.OBJETS.find((o) => o.nom === 'croissant')!
    const lieu = Auto1AR71Old.CONTEXTES[0]

    this.appliquerLesValeurs({
      objet,
      lieu,
      qte1: 4,
      prix1: 6,
      qte2: 10,
      prixUnitaire: 1.5,
      bonneReponse: 15,
      distracteurs: [60, 8, 8.5],
      enoncePersonnalise:
        'Quatre croissants coûtent $6$ euros.<br>Dix croissants coûtent :',
    })
  }

  versionAleatoire: () => void = () => {
    for (let tentative = 0; tentative < Auto1AR71Old.MAX_TENTATIVES; tentative++) {
      // Choix aléatoires des données mathématiques (objet, lieu, quantités, prix, distracteurs)
      const config = this.genererConfiguration()
      if (!config) continue

      // Choix aléatoires de la formulation (modèle de phrase, prénom éventuel)
      const modele = choice(Auto1AR71Old.MODELES)
      const prenom = modele.utilise_prenom ? choice(Auto1AR71Old.PRENOMS) : null

      this.appliquerLesValeurs({
        ...config,
        modele,
        prenom,
      })
      return
    }

    console.warn(
      'Impossible de générer un exercice valide, utilisation de la version originale',
    )
    this.versionOriginale()
  }

  // ==========================================================================
  // 5. MÉTHODE CENTRALE : appliquerLesValeurs
  // ==========================================================================

  private appliquerLesValeurs(donnees: DonneesExercice): void {
    // Affectation par décomposition (destructuring) : l'ordre n'importe pas, seuls les noms comptent
    const {
      objet,
      qte1,
      prix1,
      qte2,
      prixUnitaire,
      bonneReponse,
      distracteurs,
      enoncePersonnalise,
      modele,
    } = donnees

    // ========================================================================
    // CONSTRUCTION ÉNONCÉ
    // ========================================================================
    if (enoncePersonnalise) {
      this.enonce = enoncePersonnalise
    } else {
      this.enonce = this.remplacerChamps(modele!.phrase, donnees)
    }

    // ========================================================================
    // CONSTRUCTION CORRECTION
    // ========================================================================
    const objetsPluriel1 = qte1 > 1 ? objet.pluriel : objet.nom
    const objetsPluriel2 = qte2 > 1 ? objet.pluriel : objet.nom
    const article = objet.genre === 'M' ? 'un' : 'une'

    // Vérifier si qte2/qte1 est un entier (cas simple)
    const rapport = qte2 / qte1
    const estRapportEntier = Number.isInteger(rapport)

    if (estRapportEntier) {
      // CAS SIMPLE : rapport entier
      this.correction =
        texteItalique('Méthode 1 – par multiplication directe') +
        ' :<br>' +
        `La quantité est multipliée par $${rapport}$ (car $${qte2} = ${qte1} \\times ${rapport}$).<br>` +
        `Donc le prix est aussi multiplié par $${rapport}$ : $${texNombre(prix1, 2)} \\times ${rapport} = ${miseEnEvidence(texNombre(bonneReponse, 2))}$ €.<br>` +
        texteItalique('Méthode 2 – calcul du prix unitaire') +
        ' :<br>' +
        `Le prix d'${article} ${objet.nom} est : $\\dfrac{${texNombre(prix1, 2)}}{${qte1}} = ${texNombre(prixUnitaire, 2)}$ €.<br>` +
        `Donc le prix de $${qte2}$ ${objetsPluriel2} est : $${qte2} \\times ${texNombre(prixUnitaire, 2)} = ${miseEnEvidence(texNombre(bonneReponse, 2))}$ €.`
    } else {
      // CAS GÉNÉRAL : rapport non entier
      this.correction =
        texteItalique('Méthode 1 – calcul du prix unitaire') +
        ' :<br>' +
        `Le prix d'${article} ${objet.nom} est : $\\dfrac{${texNombre(prix1, 2)}\\text{ €}}{${qte1}} = ${texNombre(prixUnitaire, 2)}$ €.<br>` +
        `Donc le prix de $${qte2}$ ${objetsPluriel2} est : $${qte2} \\times ${texNombre(prixUnitaire, 2)}\\text{ €} = ${miseEnEvidence(texNombre(bonneReponse, 2))}$ €.<br>` +
        texteItalique('Méthode 2 – par produit en croix') +
        ' :<br>' +
        `On a la proportion : $\\dfrac{${qte1} \\text{ ${objetsPluriel1}}}{${texNombre(prix1, 2)} \\text{ €}} = \\dfrac{${qte2} \\text{ ${objetsPluriel2}}}{? \\text{ €}}$.<br>` +
        `Donc $${qte1} \\times ? = ${qte2} \\times ${texNombre(prix1, 2)}$,  d'où  $? = \\dfrac{${qte2} \\times ${texNombre(prix1, 2)}}{${qte1}} = ${texNombre(bonneReponse, 2)}$.<br>` +
        `Le prix de ${qte2} ${objetsPluriel2} est $${miseEnEvidence(texNombre(bonneReponse, 2))}$ €.<br>` +
        `Vérification : $${qte1} \\times ${texNombre(bonneReponse, 2)} = ${texNombre(qte1 * bonneReponse, 2)}$  et  $${qte2} \\times ${texNombre(prix1, 2)} = ${texNombre(qte2 * prix1, 2)}$.`
    }

    // ========================================================================
    // CONSTRUCTION RÉPONSES
    // ========================================================================
    this.reponses = [
      `$${texNombre(bonneReponse, 2)}$ €`,
      `$${texNombre(distracteurs[0], 2)}$ €`,
      `$${texNombre(distracteurs[1], 2)}$ €`,
      `$${texNombre(distracteurs[2], 2)}$ €`,
    ]
  }
}
