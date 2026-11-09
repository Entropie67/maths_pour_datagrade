// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 56f8a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '31/01/2026'
export const uuid = '56f8a'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer un effectif à partir d'une proportion"
interface Contexte {
  objet: string
  article: string
  pluriel: string
  attribut: string
  dans: string
}

export default class EffectifProportionOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const total = 20
    const proportion = 0.3
    const bonneReponse = total * proportion

    this.enonce =
      `Une boîte contient $${total}$ billes. <br>Dans cette boîte, la proportion de billes vertes est égale à $${proportion}$.<br> ` +
      `Le nombre de billes vertes dans la boîte est égal à :`

    this.correction =
      `Pour trouver le nombre de billes vertes, on multiplie le nombre total de billes par la proportion de billes vertes :<br>` +
      `$${total} \\times ${texNombre(proportion, 2)} = ${texNombre(total / 10, 0)} \\times \\underbrace{10 \\times ${texNombre(proportion, 2)}}_{${texNombre(proportion * 10, 0)}} = ${miseEnEvidence(bonneReponse.toString())}$<br>` +
      `Il y a donc $${miseEnEvidence(bonneReponse.toString())}$ billes vertes dans la boîte.`

    this.reponses = [
      `$${bonneReponse}$`,
      `$${bonneReponse - 3}$`,
      `$${bonneReponse - 1}$`,
      `$${total - bonneReponse - 3}$`,
    ]
  }

  versionAleatoire = () => {
    // Différents contextes possibles
    const contextes: Contexte[] = [
      {
        objet: 'bille',
        article: 'une',
        pluriel: 'billes',
        attribut: 'vertes',
        dans: 'dans la boîte',
      },
      {
        objet: 'livre',
        article: 'un',
        pluriel: 'livres',
        attribut: 'de science-fiction',
        dans: 'dans cette bibliothèque',
      },
      {
        objet: 'personne',
        article: 'une',
        pluriel: 'personnes',
        attribut: 'mineures',
        dans: 'dans ce groupe',
      },
      {
        objet: 'voiture',
        article: 'une',
        pluriel: 'voitures',
        attribut: 'électriques',
        dans: 'dans ce parking',
      },
      {
        objet: 'fruit',
        article: 'un',
        pluriel: 'fruits',
        attribut: 'mûrs',
        dans: 'dans ce panier',
      },
      {
        objet: 'carte',
        article: 'une',
        pluriel: 'cartes',
        attribut: 'rouges',
        dans: 'dans ce jeu',
      },
      {
        objet: 'participant',
        article: 'un',
        pluriel: 'participants',
        attribut: 'ayant réussi',
        dans: 'dans cette compétition',
      },
    ]

    const contexte = choice(contextes)

    // Proportions possibles avec une seule décimale de 0,1 à 0,9
    const proportionsPossibles = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

    // Choisir un total qui soit un multiple de 10 pour garantir un résultat entier
    const total = choice([20, 30, 40, 50, 60, 70, 80, 90])

    const proportion = choice(proportionsPossibles)
    const bonneReponse = total * proportion

    // Vérifier que la bonne réponse est bien un entier
    if (bonneReponse !== Math.round(bonneReponse)) {
      // Si ce n'est pas un entier, on refait un choix
      this.versionAleatoire()
      return
    }

    // Générer l'énoncé selon le contexte
    let conteneur = ''
    if (contexte.objet === 'bille') {
      conteneur = 'Une boîte'
    } else if (contexte.objet === 'élève') {
      conteneur = 'Une classe'
    } else if (contexte.objet === 'livre') {
      conteneur = 'Une bibliothèque'
    } else if (contexte.objet === 'personne') {
      conteneur = 'Un groupe'
    } else if (contexte.objet === 'voiture') {
      conteneur = 'Un parking'
    } else if (contexte.objet === 'fruit') {
      conteneur = 'Un panier'
    } else if (contexte.objet === 'carte') {
      conteneur = 'Un jeu'
    } else if (contexte.objet === 'participant') {
      conteneur = 'Une compétition'
    }

    this.enonce =
      `${conteneur} contient $${total}$ ${contexte.pluriel}. <br>${contexte.dans.charAt(0).toUpperCase() + contexte.dans.slice(1)}, ` +
      `la proportion de ${contexte.pluriel} ${contexte.attribut} est égale à $${texNombre(proportion, 1)}$.<br> ` +
      `Le nombre de ${contexte.pluriel} ${contexte.attribut} ${contexte.dans} est égal à :`

    this.correction =
      `Pour trouver le nombre de ${contexte.pluriel} ${contexte.attribut}, on multiplie le nombre total de ${contexte.pluriel} par la proportion de ${contexte.pluriel} ${contexte.attribut} :<br>` +
      `$${total} \\times ${texNombre(proportion, 1)} =${texNombre(total / 10, 0)} \\times \\underbrace{10 \\times ${texNombre(proportion, 2)}}_{${texNombre(proportion * 10, 0)}} = ${bonneReponse.toString()}$<br>` +
      `Il y a donc $${miseEnEvidence(bonneReponse.toString())}$ ${contexte.pluriel} ${contexte.attribut} ${contexte.dans}.`

    // Générer 3 distracteurs différents de la bonne réponse
    const distracteurs: number[] = []

    // Distracteur 1 : erreur de ±1 à ±5
    let dist1 = bonneReponse + choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    let tentatives = 0
    while (
      (dist1 <= 0 || dist1 >= total || dist1 === bonneReponse) &&
      tentatives < 20
    ) {
      dist1 = bonneReponse + choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
      tentatives++
    }
    if (tentatives < 20) {
      distracteurs.push(dist1)
    }

    // Distracteur 2 : autre valeur proche
    let dist2 = bonneReponse + choice([-7, -6, 6, 7, 8])
    tentatives = 0
    while (
      (dist2 <= 0 ||
        dist2 >= total ||
        dist2 === bonneReponse ||
        distracteurs.includes(dist2)) &&
      tentatives < 20
    ) {
      dist2 = bonneReponse + choice([-7, -6, 6, 7, 8])
      tentatives++
    }
    if (tentatives < 20 && !distracteurs.includes(dist2)) {
      distracteurs.push(dist2)
    }

    // Distracteur 3 : total - bonneReponse (les autres) ou autre valeur
    let dist3 = total - bonneReponse
    if (dist3 === bonneReponse || distracteurs.includes(dist3)) {
      dist3 = bonneReponse + choice([-10, -9, -8, 9, 10, 11])
      tentatives = 0
      while (
        (dist3 <= 0 ||
          dist3 >= total ||
          dist3 === bonneReponse ||
          distracteurs.includes(dist3)) &&
        tentatives < 20
      ) {
        dist3 = bonneReponse + choice([-10, -9, -8, 9, 10, 11])
        tentatives++
      }
    }
    if (
      !distracteurs.includes(dist3) &&
      dist3 > 0 &&
      dist3 < total &&
      dist3 !== bonneReponse
    ) {
      distracteurs.push(dist3)
    }

    // S'assurer qu'on a bien 3 distracteurs
    while (distracteurs.length < 3) {
      const dist = bonneReponse + choice([-2, -1, 1, 2])
      if (
        dist > 0 &&
        dist < total &&
        dist !== bonneReponse &&
        !distracteurs.includes(dist)
      ) {
        distracteurs.push(dist)
      }
    }

    this.reponses = [
      `$${bonneReponse}$`,
      `$${distracteurs[0]}$`,
      `$${distracteurs[1]}$`,
      `$${distracteurs[2]}$`,
    ]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
