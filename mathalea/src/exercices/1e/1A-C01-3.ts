import { tableauColonneLigne } from '../../lib/2d/tableau'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '3e5b1'
export const refs = {
  'fr-fr': ['1A-C01-3', '2A-N1-2'],
  'fr-ch': ['10LCNO5B-4', '10LSNO5B-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer des grands ou des petits nombres'
export const dateDePublication = '24/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora + claude
 *
 */
export default class AutoC1c extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      `Voici quatre planètes et leur masse :<br>` +
      tableauColonneLigne(
        ['\\text{Planètes}', '\\text{Masses}'],
        ['\\text{Terre}', '\\text{Mercure}', '\\text{Vénus}', '\\text{Mars}'],
        [
          `${texNombre(5973)}\\times 10^{21}\\text{ kg}`,
          `${texNombre(33.02)}\\times 10^{22}\\text{ kg}`,
          `${texNombre(48685)}\\times 10^{20}\\text{ kg}`,
          `${texNombre(6.4185)}\\times 10^{23}\\text{ kg}`,
        ],
      ) +
      `<br><br>La planète dont la masse est la plus importante est :`

    this.correction = `On écrit les masses en écriture scientifique pour les comparer :<br><br>
    • Terre : $${texNombre(5973)}\\times 10^{21} = ${texNombre(5.973)}\\times 10^{3}\\times 10^{21} =${texNombre(5.973)}\\times 10^{24}$ kg<br>
    • Mercure : $${texNombre(33.02)}\\times 10^{22}=${texNombre(3.302)}\\times 10^{1}\\times 10^{22}=${texNombre(3.302)}\\times 10^{23}$ kg<br>
    • Vénus : $${texNombre(48685)}\\times 10^{20} = ${texNombre(4.8685)}\\times 10^{4}\\times 10^{20}= ${texNombre(4.8685)}\\times 10^{24}$ kg<br>
    • Mars : $${texNombre(6.4185)}\\times 10^{23}$ kg<br><br>
   On a donc : $${texNombre(5.973)}\\times 10^{24} > ${texNombre(4.8685)}\\times 10^{24}>${texNombre(6.4185)}\\times 10^{23} > ${texNombre(3.302)}$<br><br>
    Donc il s'agit de la planète ${texteEnCouleurEtGras('Terre')} qui a la masse la plus importante.`

    this.reponses = ['Terre', 'Mars', 'Mercure', 'Vénus']
  }

  versionAleatoire: () => void = () => {
    // Choisir le type d'exercice : 1 = masses de planètes, 2 = tailles de cellules/particules
    const typeExercice = randint(1, 2)

    // Générer 4 cas différents selon le numéro de l'élément avec la plus grande valeur
    const cas = randint(1, 4) // 1, 2, 3 ou 4

    let noms: string[] = []
    let unite = ''
    let contexte = ''
    let puissancesDisponibles: number[] = []

    if (typeExercice === 1) {
      // Cas 1 : Masses de planètes (puissances positives)
      noms = ['Planète 1', 'Planète 2', 'Planète 3', 'Planète 4']
      unite = '\\text{ kg}'
      contexte = 'Voici quatre planètes et leur masse'
      puissancesDisponibles = [20, 21, 22, 23, 24]
    } else {
      // Cas 2 : Tailles de cellules/particules (puissances négatives)
      noms = ['Cellule 1', 'Cellule 2', 'Cellule 3', 'Cellule 4']
      unite = '\\text{ mm}'
      contexte = 'Voici quatre cellules et leur taille'
      puissancesDisponibles = [-6, -7, -8, -9, -10]
    }

    // Génération des puissances : maximum 2 identiques
    let puissances: number[] = []
    const puissancesUtilisees = new Set()

    // Choisir 2 puissances qui seront utilisées 2 fois chacune, ou 4 puissances différentes
    const nombrePuissancesUniques = randint(2, 4) // 2, 3 ou 4 puissances différentes

    if (nombrePuissancesUniques === 2) {
      // 2 puissances, chacune utilisée 2 fois
      const puissance1 =
        puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
      let puissance2 =
        puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
      while (puissance2 === puissance1) {
        puissance2 =
          puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
      }
      puissances = [puissance1, puissance1, puissance2, puissance2]
      // Mélanger l'ordre
      for (let i = puissances.length - 1; i > 0; i--) {
        const j = randint(0, i)
        ;[puissances[i], puissances[j]] = [puissances[j], puissances[i]]
      }
    } else if (nombrePuissancesUniques === 3) {
      // 1 puissance utilisée 2 fois, 2 autres uniques
      const puissanceDouble =
        puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
      puissancesUtilisees.add(puissanceDouble)
      puissances = [puissanceDouble, puissanceDouble]

      // Ajouter 2 puissances uniques
      while (puissances.length < 4) {
        let nouvellePuissance =
          puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
        while (puissancesUtilisees.has(nouvellePuissance)) {
          nouvellePuissance =
            puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
        }
        puissances.push(nouvellePuissance)
        puissancesUtilisees.add(nouvellePuissance)
      }
      // Mélanger l'ordre
      for (let i = puissances.length - 1; i > 0; i--) {
        const j = randint(0, i)
        ;[puissances[i], puissances[j]] = [puissances[j], puissances[i]]
      }
    } else {
      // 4 puissances toutes différentes
      while (puissances.length < 4) {
        const nouvellePuissance =
          puissancesDisponibles[randint(0, puissancesDisponibles.length - 1)]
        if (!puissancesUtilisees.has(nouvellePuissance)) {
          puissances.push(nouvellePuissance)
          puissancesUtilisees.add(nouvellePuissance)
        }
      }
    }

    // Génération des coefficients : maximum 2 avec le même nombre de chiffres avant la virgule
    const coefficients: number[] = []
    const typesCoefficients = [
      () => Number((randint(1, 9) + randint(1, 99) / 100).toFixed(2)), // 1 chiffre avant virgule (1.xx à 9.xx)
      () => Number((randint(10, 99) + randint(1, 99) / 100).toFixed(2)), // 2 chiffres avant virgule (10.xx à 99.xx)
      () => Number((randint(100, 999) + randint(1, 99) / 100).toFixed(2)), // 3 chiffres avant virgule (100.xx à 999.xx)
      () => Number((randint(100, 999) + randint(1, 99) / 100).toFixed(2)), // Limité à 3 chiffres maximum (100.xx à 999.xx)
    ]

    const compteurTypes = [0, 0, 0, 0] // Compteur pour chaque type
    const typesAssignes = [] // Pour garder trace des types assignés

    for (let i = 0; i < 4; i++) {
      let typeChoisi
      let tentatives = 0

      do {
        typeChoisi = randint(0, 3)
        tentatives++
        // Si on a fait trop de tentatives, prendre n'importe quel type disponible
        if (tentatives > 20) {
          typeChoisi = compteurTypes.findIndex((count) => count < 2)
          if (typeChoisi === -1) typeChoisi = randint(0, 3) // Fallback
          break
        }
      } while (compteurTypes[typeChoisi] >= 2) // Maximum 2 coefficients du même type

      compteurTypes[typeChoisi]++
      typesAssignes.push(typeChoisi)
      coefficients.push(typesCoefficients[typeChoisi]())
    }

    // Stratégie pour déterminer qui gagne
    const strategieComparaison = randint(1, 3)
    const indexGagnant = cas - 1

    // Ajustement final pour garantir que le bon élément gagne
    if (strategieComparaison === 1) {
      // Le gagnant doit avoir la plus grande mantisse (même puissance ou puissances proches)
      // Trouver les éléments avec des puissances similaires au gagnant
      const puissanceGagnant = puissances[indexGagnant]
      const indicesPuissancesSimilaires = []
      for (let i = 0; i < 4; i++) {
        if (Math.abs(puissances[i] - puissanceGagnant) <= 1) {
          indicesPuissancesSimilaires.push(i)
        }
      }

      // S'assurer que le gagnant a la plus grande mantisse parmi ceux avec des puissances similaires
      const mantissesRivales = indicesPuissancesSimilaires
        .filter((i) => i !== indexGagnant)
        .map(
          (i) =>
            coefficients[i] * Math.pow(10, puissances[i] - puissanceGagnant),
        )

      if (mantissesRivales.length > 0) {
        const maxRivale = Math.max(...mantissesRivales)
        const mantisseGagnantEquivalente = coefficients[indexGagnant]
        if (mantisseGagnantEquivalente <= maxRivale) {
          coefficients[indexGagnant] = maxRivale * 1.2
        }
      }
    } else if (strategieComparaison === 2) {
      // Le gagnant doit gagner grâce à sa puissance
      const puissanceGagnant = puissances[indexGagnant]
      const autresPuissances = puissances.filter((_, i) => i !== indexGagnant)
      const maxAutrePuissance = Math.max(...autresPuissances)

      if (puissanceGagnant <= maxAutrePuissance) {
        // Changer la puissance du gagnant pour qu'elle soit supérieure
        puissances[indexGagnant] =
          maxAutrePuissance + (typeExercice === 1 ? 1 : -1)
        // Et réduire sa mantisse pour montrer que c'est vraiment la puissance qui compte
        coefficients[indexGagnant] = Number(
          (randint(10, 30) + randint(1, 99) / 100).toFixed(2),
        )
      }
    } else {
      // Stratégie mixte : vérification finale standard
      const valeurs = []
      for (let i = 0; i < 4; i++) {
        valeurs.push({
          valeur: coefficients[i] * Math.pow(10, puissances[i]),
          index: i,
        })
      }

      const valeurGagnant =
        coefficients[indexGagnant] * Math.pow(10, puissances[indexGagnant])
      const autresValeurs = valeurs.filter((v) => v.index !== indexGagnant)
      const maxAutreValeur = Math.max(...autresValeurs.map((v) => v.valeur))

      if (valeurGagnant <= maxAutreValeur) {
        const facteurCorrection = (maxAutreValeur / valeurGagnant) * 1.15
        coefficients[indexGagnant] *= facteurCorrection
      }
    }

    // Créer les valeurs
    const valeurs = []
    for (let i = 0; i < 4; i++) {
      valeurs.push({
        nom: noms[i],
        coefficient: coefficients[i],
        puissance: puissances[i],
        valeur: coefficients[i] * Math.pow(10, puissances[i]),
      })
    }

    // Déterminer le texte de la question selon le type
    const questionText =
      typeExercice === 1
        ? '<br>La planète dont la masse est la plus importante est :'
        : `<br>La cellule dont la taille est la plus importante est :`

    this.enonce =
      `${contexte} :<br>` +
      tableauColonneLigne(
        [
          typeExercice === 1 ? '\\text{Planètes}' : '\\text{Cellules}',
          typeExercice === 1 ? '\\text{Masses}' : '\\text{Tailles}',
        ],
        valeurs.map((v) => `\\text{${v.nom}}`),
        valeurs.map(
          (v) =>
            `${texNombre(v.coefficient, 4)}\\times 10^{${v.puissance}}${unite}`,
        ),
      ) +
      `${questionText}`

    // Construction de la correction
    let correctionTexte =
      typeExercice === 1
        ? `On écrit les masses en écriture scientifique pour les comparer :<br><br>`
        : `On écrit les tailles en écriture scientifique pour les comparer :<br><br>`

    // Convertir toutes les valeurs en notation scientifique standard (coefficient entre 1 et 10)
    const valeursScientifiques = []
    for (let i = 0; i < valeurs.length; i++) {
      const v = valeurs[i]
      let coeff = v.coefficient
      let puiss = v.puissance

      // Ajuster pour avoir un coefficient entre 1 et 10
      while (coeff >= 10) {
        coeff /= 10
        puiss += 1
      }
      while (coeff < 1) {
        coeff *= 10
        puiss -= 1
      }

      valeursScientifiques.push({
        nom: v.nom,
        coeffOriginal: v.coefficient,
        puissanceOriginale: v.puissance,
        coeffScientifique: coeff,
        puissanceScientifique: puiss,
        valeur: v.valeur,
      })

      if (Math.abs(coeff - v.coefficient) > 0.001) {
        // Calculer le facteur de conversion
        const puissanceFacteur = puiss - v.puissance
        correctionTexte += `• ${v.nom} : $${texNombre(v.coefficient, 8)}\\times 10^{${v.puissance}} = ${texNombre(coeff, 8)}\\times 10^{${puissanceFacteur}}\\times 10^{${v.puissance}} = ${texNombre(coeff, 8)}\\times 10^{${puiss}}$ ${unite.replace('\\text', '').replace('{', '').replace('}', '')}<br>`
      } else {
        correctionTexte += `• ${v.nom} : $${texNombre(v.coefficient, 8)}\\times 10^{${v.puissance}}$ ${unite.replace('\\text', '').replace('{', '').replace('}', '')}<br>`
      }
    }

    // Trier pour la comparaison finale
    const valeursTriees = [...valeursScientifiques].sort(
      (a, b) => b.valeur - a.valeur,
    )

    correctionTexte += `<br>On a donc : `
    for (let i = 0; i < valeursTriees.length; i++) {
      correctionTexte += `$${texNombre(valeursTriees[i].coeffScientifique, 8)}\\times 10^{${valeursTriees[i].puissanceScientifique}}$`
      if (i < valeursTriees.length - 1) correctionTexte += ' $>$ '
    }

    const propriete = typeExercice === 1 ? 'masse' : 'taille'

    correctionTexte += `<br><br> Donc il s'agit de la ${texteEnCouleurEtGras(valeursTriees[0].nom.toLowerCase())} qui a la ${propriete} la plus importante.`

    this.correction = correctionTexte

    // Les réponses avec la bonne réponse en première position
    this.reponses = [
      valeursTriees[0].nom, // Bonne réponse (celle qui a la plus grande valeur)
      ...noms.filter((nom) => nom !== valeursTriees[0].nom), // Les autres éléments
    ]
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour comparer des nombres, selon les situations, il est souvent plus pratique de tous les écrire :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>sous forme de fractions de même dénominateur,</li>
    <li>sous forme décimale,</li>
    <li>en notation scientifique.</li>
  </ul>
   <p style="margin: 0 0 10px 0;">
   Le plus simple dans cet exercice est de les écrire en notation scientifique.
  </p>
 `
    this.versionAleatoire()
    this.spacing = 1
    this.spacingCorr = 1.5
  }
}
