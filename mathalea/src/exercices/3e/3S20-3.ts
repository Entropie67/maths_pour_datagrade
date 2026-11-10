import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import { context } from '../../modules/context'

export const titre =
  'Calculer des probabilités dans une expérience aléatoire à deux épreuves'
export const dateDePublication = '27/01/2026'
export const interactifReady = true

// On lance un dé à 6 faces numérotées de 1 à 6
// Et on tire une boule dans une urne contenant 6 boules rouges et bleues
// on gagne si le numéro de la boule est supérieur ou égal au numéro du dé et si la boule est bleue.
function experience1() {
  // fabrication d'une urne avec 6 boules numérotées de 1 à 6 et de couleur rouge ou bleue
  const urne = []
  const nbBoulesRouges = randint(2, 4)
  const nbBoulesBleues = 6 - nbBoulesRouges
  const boulesRouges = Array(nbBoulesRouges).fill('R')
  const boulesBleues = Array(nbBoulesBleues).fill('B')
  const boules = shuffle([...boulesRouges, ...boulesBleues])
  for (let i = 1; i <= 6; i++) {
    urne.push({ numero: i, couleur: boules[i - 1] })
  }
  const enonce = `Le joueur d'un jeu télévisé doit lancer un dé à $6$ faces numérotées de $1$ à $6$.<br>
Ensuite, il tire une boule dans une urne contenant $6$ boules indiscernables au toucher.<br>
Ces boules sont numérotées de $1$ à $6$ et sont rouges ou bleues.<br>
Il gagne s'il tire une boule bleue dont le numéro est supérieur ou égal au numéro obtenu avec le dé.<br>
Voici l'urne utilisée :<br>
${premiereLettreEnMajuscule(
  urne
    .map(
      (boule) =>
        `la boule $${boule.numero}$ est ${boule.couleur === 'B' ? 'bleue' : 'rouge'}`,
    )
    .join(' ; '),
)}.<br>
Calculer la probabilité de gagner à ce jeu.`
  let correction = `Pour gagner, le joueur doit tirer une boule bleue dont le numéro est supérieur ou égal au numéro obtenu avec le dé.<br>
  On remplit le tableau à double entrée des issues possibles de cette expérience aléatoire :<br>`
  const entetesColonne = ['\\text{Dé\\textbackslash Boule}']
  const entetesLigne = []
  const contenu = []
  for (let i = 1; i <= 6; i++) {
    entetesColonne.push(
      `\\text{${i} (${boules[i - 1] === 'B' ? 'bleue' : 'rouge'})}`,
    )
    entetesLigne.push(`\\text{${i}}`)
    for (let j = 1; j <= 6; j++) {
      contenu.push(
        i <= j && boules[j - 1] === 'B' ? '\\textbf{gagné}' : '\\text{perdu}',
      )
    }
  }
  const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
  correction += tableau + '<br>'
  const nbIssuesGagnantes = contenu.filter(
    (issue) => issue === '\\textbf{gagné}',
  ).length
  const probaGagner = fraction(nbIssuesGagnantes, 36)
  correction += `Il y a $${nbIssuesGagnantes}$ issues gagnantes parmi $36$ issues possibles.<br>`
  correction += `La probabilité de gagner à ce jeu est donc de $${!probaGagner.estIrreductible ? probaGagner.texFraction + '=' + miseEnEvidence(probaGagner.texFractionSimplifiee) : miseEnEvidence(probaGagner.texFraction)}$.<br>`
  return {
    enonce,
    correction,
    alea: [...boules],
    reponse: probaGagner.texFraction,
  }
}

// Tirer deux boules successives avec remise d'une urne
// On gagne si les deux boules sont de la même couleur
function experience3() {
  // Fabrication d'une urne avec 6 boules de 2 ou 3 couleurs différentes
  const couleurs = ['R', 'B', 'V'] as const // Rouge, Bleu, Vert
  const nbCouleurs = 3
  const urne = []

  // Distribution aléatoire des boules entre les couleurs
  const bouleParCouleur = []
  let totalBoules = 0

  // Génère une distribution aléatoire avec au moins 1 boule par couleur
  do {
    totalBoules = 0
    bouleParCouleur.length = 0
    for (let i = 0; i < nbCouleurs; i++) {
      const nbBoules = randint(1, 3)
      bouleParCouleur.push(nbBoules)
      totalBoules += nbBoules
    }
  } while (totalBoules < 5)

  // Si total dépasse 6, on ajuste en retirant 1 boule au hasard
  while (totalBoules > 6) {
    const indicesToRetirer = bouleParCouleur
      .map((nb, idx) => (nb > 1 ? idx : -1))
      .filter((idx) => idx !== -1)
    if (indicesToRetirer.length > 0) {
      const indexARetirer =
        indicesToRetirer[Math.floor(Math.random() * indicesToRetirer.length)]
      bouleParCouleur[indexARetirer]--
      totalBoules--
    } else {
      break
    }
  }

  // Construction de l'urne
  for (let i = 0; i < nbCouleurs; i++) {
    for (let j = 0; j < bouleParCouleur[i]; j++) {
      urne.push(couleurs[i])
    }
  }

  const nomsCouleurs = {
    R: 'rouge',
    B: 'bleue',
    V: 'verte',
  }
  const couleurChoisie = choice(['R', 'B', 'V']) as keyof typeof nomsCouleurs

  const conditionsDeVictoire = [
    `tire deux boules de la même couleur`,
    `tire deux boules de couleurs différentes`,
    `tire au moins une boule ${nomsCouleurs[couleurChoisie]}`,
  ]
  const conditionDeVictoire = choice(conditionsDeVictoire)
  const gagnePerdu = function (conditionDeVictoire: string) {
    switch (conditionDeVictoire) {
      case 'tire deux boules de la même couleur':
        return (b1: string, b2: string) => b1 === b2
      case 'tire deux boules de couleurs différentes':
        return (b1: string, b2: string) => b1 !== b2
      case `tire au moins une boule ${nomsCouleurs[couleurChoisie]}`:
        return (b1: string, b2: string) =>
          b1 === couleurChoisie || b2 === couleurChoisie
      default:
        return () => false
    }
  }
  const enonce = `Un joueur tire une boule d'une urne, note sa couleur, la remet dans l'urne, puis tire une deuxième boule.<br>
L'urne contient ${totalBoules} boules indiscernables au toucher :<br>
${premiereLettreEnMajuscule(
  bouleParCouleur
    .map(
      (nb, idx) =>
        `${nb} boule${nb > 1 ? 's' : ''} ${nomsCouleurs[couleurs[idx]]}${nb > 1 ? 's' : ''}`,
    )
    .join(' ; '),
)}.<br>
Il gagne s'il ${conditionDeVictoire}.<br>
Calculer la probabilité de gagner à ce jeu.`

  let correction = `Pour gagner, le joueur doit ${conditionDeVictoire.replace('tire', 'tirer')} (avec remise).<br>
  On remplit le tableau à double entrée des issues possibles de cette expérience aléatoire :<br>`

  const entetesColonne = [
    '1^\\text{er}\\text{ tirage}\\backslash 2^\\text{e}\\text{ tirage}',
  ]
  const entetesLigne = []
  const contenu = []
  const totalIssues = totalBoules * totalBoules

  // Crée les étiquettes du tableau
  for (let i = 0; i < totalBoules; i++) {
    entetesColonne.push(`\\text{${urne[i]}}`)
    entetesLigne.push(`\\text{${urne[i]}}`)
  }

  // Remplit le tableau
  for (let i = 0; i < totalBoules; i++) {
    for (let j = 0; j < totalBoules; j++) {
      contenu.push(
        gagnePerdu(conditionDeVictoire)(urne[i], urne[j])
          ? '\\textbf{gagné}'
          : '\\text{perdu}',
      )
    }
  }

  const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
  correction += tableau + '<br>'

  const nbIssuesGagnantes = contenu.filter(
    (issue) => issue === '\\textbf{gagné}',
  ).length
  const probaGagner = fraction(nbIssuesGagnantes, totalIssues)

  correction += `Il y a $${nbIssuesGagnantes}$ issues gagnantes parmi $${totalIssues}$ issues possibles.<br>`
  correction += `La probabilité de gagner à ce jeu est donc de $${!probaGagner.estIrreductible ? probaGagner.texFraction + '=' + miseEnEvidence(probaGagner.texFractionSimplifiee) : miseEnEvidence(probaGagner.texFraction)}$.<br>`

  return {
    enonce,
    correction,
    alea: [...urne],
    reponse: probaGagner.texFraction,
  }
}

// Lancer deux dés avec couleurs différentes (dé rouge et dé bleu)
// On gagne selon différents critères (somme, différence, produit)
function experience2() {
  let ilGagneTrop = false
  do {
    const typeGain = randint(1, 3) // 1: somme, 2: différence, 3: produit
    let condition = ''

    let seuil = 0
    let comparateur = ''

    if (typeGain === 1) {
      // Cas 1 : La somme dépasse un certain nombre
      seuil = randint(5, 8)
      comparateur = choice(['<', '<=', '>=', '>'])
      condition = `la somme des deux dés ${comparateur.includes('<') ? 'soit inférieure' : 'soit supérieure'} ${comparateur.includes('=') ? 'ou égale à' : 'à'} $${seuil}$`
    } else if (typeGain === 2) {
      // Cas 2 : La différence est inférieure à un certain nombre
      seuil = 3
      comparateur = choice(['<', '<=', '>=', '>'])
      condition = `la différence entre les deux dés ${comparateur.includes('<') ? 'soit inférieure' : 'soit supérieure'} ${comparateur.includes('=') ? 'ou égale à' : 'à'} $${seuil}$`
    } else {
      // Cas 3 : Le produit est supérieur à un certain nombre
      seuil = randint(12, 20)
      comparateur = choice(['<', '<=', '>=', '>'])
      condition = `le produit des deux dés ${comparateur.includes('<') ? 'soit inférieur' : 'soit supérieur'} ${comparateur.includes('=') ? 'ou égal à' : 'à'} $${seuil}$`
    }

    const enonce = `Un joueur lance deux dés à $6$ faces numérotées de $1$ à $6$ : un dé rouge et un dé bleu.<br>
Pour gagner, il faut que ${condition}.<br>
Calculer la probabilité de gagner à ce jeu.`

    let correction = `Pour gagner, il faut que ${condition}.<br>
  On remplit le tableau à double entrée des issues possibles de cette expérience aléatoire :<br>`

    const entetesColonne = ['\\text{Dé rouge\\textbackslash Dé bleu}']
    const entetesLigne = []
    const contenu = []

    // Crée les étiquettes du tableau
    for (let i = 1; i <= 6; i++) {
      entetesColonne.push(`\\text{${i}}`)
      entetesLigne.push(`\\text{${i}}`)
    }

    // Remplit le tableau
    let nbIssuesGagnantes = 0
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        let isGagnante = false

        if (typeGain === 1) {
          // Somme > seuil
          isGagnante = comparateur.includes('<') ? i + j < seuil : i + j > seuil
          if (comparateur.includes('=')) {
            isGagnante = isGagnante || i + j === seuil
          }
        } else if (typeGain === 2) {
          // Différence < seuil
          isGagnante = comparateur.includes('<')
            ? Math.abs(i - j) < seuil
            : Math.abs(i - j) > seuil
          if (comparateur.includes('=')) {
            isGagnante = isGagnante || Math.abs(i - j) === seuil
          }
        } else {
          // Produit > seuil
          isGagnante = comparateur.includes('<') ? i * j < seuil : i * j > seuil
          if (comparateur.includes('=')) {
            isGagnante = isGagnante || i * j === seuil
          }
        }

        if (isGagnante) {
          contenu.push('\\textbf{gagné}')
          nbIssuesGagnantes++
        } else {
          contenu.push('\\text{perdu}')
        }
      }
    }

    const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
    correction += tableau + '<br>'

    const probaGagner = fraction(nbIssuesGagnantes, 36)

    correction += `Il y a $${nbIssuesGagnantes}$ issues gagnantes parmi $36$ issues possibles.<br>`
    correction += `La probabilité de gagner à ce jeu est donc de $${!probaGagner.estIrreductible ? probaGagner.texFraction + '=' + miseEnEvidence(probaGagner.texFractionSimplifiee) : miseEnEvidence(probaGagner.texFraction)}$.<br>`
    ilGagneTrop = probaGagner.superieurLarge(0.5)
    if (!ilGagneTrop) {
      return {
        enonce,
        correction,
        alea: { typeGain, seuil },
        reponse: probaGagner.texFraction,
      }
    }
  } while (true)
}

// Lancer deux dés de tailles différentes : un dé à 4 faces et un dé à 6 faces
// On gagne selon différents critères
function experience4() {
  const conditionsDeVictoire = [
    {
      nom: 'le produit des deux dés soit pair',
      test: (d4: number, d6: number) => (d4 * d6) % 2 === 0,
    },
    {
      nom: 'le produit des deux dés soit impair',
      test: (d4: number, d6: number) => (d4 * d6) % 2 === 1,
    },
    {
      nom: 'la somme des deux dés soit un multiple de $3$',
      test: (d4: number, d6: number) => (d4 + d6) % 3 === 0,
    },
    {
      nom: 'la somme des deux dés soit supérieure à $7$',
      test: (d4: number, d6: number) => d4 + d6 > 7,
    },
    {
      nom: 'la somme des deux dés soit inférieure ou égale à $5$',
      test: (d4: number, d6: number) => d4 + d6 <= 5,
    },
    {
      nom: 'le dé à $6$ faces affiche un nombre strictement supérieur au dé à $4$ faces',
      test: (d4: number, d6: number) => d6 > d4,
    },
    {
      nom: 'le dé à $4$ faces affiche un nombre supérieur ou égal au dé à $6$ faces',
      test: (d4: number, d6: number) => d4 >= d6,
    },
    {
      nom: 'les deux dés affichent des nombres pairs',
      test: (d4: number, d6: number) => d4 % 2 === 0 && d6 % 2 === 0,
    },
    {
      nom: 'au moins un des deux dés affiche un nombre impair',
      test: (d4: number, d6: number) => d4 % 2 === 1 || d6 % 2 === 1,
    },
    {
      nom: 'le produit des deux dés soit supérieur à $10$',
      test: (d4: number, d6: number) => d4 * d6 > 10,
    },
  ]

  const conditionChoisie = choice(conditionsDeVictoire)

  const enonce = `Un joueur lance deux dés : un dé à $4$ faces numérotées de $1$ à $4$ et un dé à $6$ faces numérotées de $1$ à $6$.<br>
Pour gagner, il faut que ${conditionChoisie.nom}.<br>
Calculer la probabilité de gagner à ce jeu.`

  let correction = `Pour gagner, il faut que ${conditionChoisie.nom}.<br>
  On remplit le tableau à double entrée des issues possibles de cette expérience aléatoire :<br>`

  const entetesColonne = ['\\text{Dé 4 faces\\textbackslash Dé 6 faces}']
  const entetesLigne = []
  const contenu = []

  // Crée les étiquettes du tableau
  for (let i = 1; i <= 6; i++) {
    entetesColonne.push(`\\text{${i}}`)
  }
  for (let j = 1; j <= 4; j++) {
    entetesLigne.push(`\\text{${j}}`)
  }

  // Remplit le tableau
  let nbIssuesGagnantes = 0
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 6; j++) {
      const isGagnante = conditionChoisie.test(i, j)
      if (isGagnante) {
        contenu.push('\\textbf{gagné}')
        nbIssuesGagnantes++
      } else {
        contenu.push('\\text{perdu}')
      }
    }
  }

  const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
  correction += tableau + '<br>'

  const totalIssues = 24
  const probaGagner = fraction(nbIssuesGagnantes, totalIssues)

  correction += `Il y a $${nbIssuesGagnantes}$ issues gagnantes parmi $${totalIssues}$ issues possibles.<br>`
  correction += `La probabilité de gagner à ce jeu est donc de $${!probaGagner.estIrreductible ? probaGagner.texFraction + '=' + miseEnEvidence(probaGagner.texFractionSimplifiee) : miseEnEvidence(probaGagner.texFraction)}$.<br>`

  return {
    enonce,
    correction,
    alea: { condition: conditionChoisie.nom },
    reponse: probaGagner.texFraction,
  }
}

// Tirer une carte de chaque tas parmi des cartes (Valet, Dame, Roi, As) de différentes couleurs
// On gagne si les deux cartes ont la même figure ou la même couleur
function experience5() {
  // Créer le jeu complet de 16 cartes
  const figures = ['V', 'D', 'R', 'A'] as const // Valet, Dame, Roi, As
  const couleurs = context.isHtml
    ? (['♣', '♦', '♥', '♠'] as const)
    : (['\\clubsuit', '\\diamondsuit', '\\heartsuit', '\\spadesuit'] as const) // Trèfle, Carreau, Cœur, Pique
  const nomsFigures = { V: 'Valet', D: 'Dame', R: 'Roi', A: 'As' }
  const nomsCouleurs = context.isHtml
    ? {
        '♣': 'Trèfle',
        '♦': 'Carreau',
        '♥': 'Cœur',
        '♠': 'Pique',
      }
    : {
        '\\clubsuit': 'Trèfle',
        '\\diamondsuit': 'Carreau',
        '\\heartsuit': 'Cœur',
        '\\spadesuit': 'Pique',
      }

  // Créer toutes les cartes
  const toutesLesCartes: Array<{ figure: string; couleur: string }> = []
  for (const figure of figures) {
    for (const couleur of couleurs) {
      toutesLesCartes.push({ figure, couleur })
    }
  }

  // Mélanger et distribuer entre deux tas
  const cartesMelangees = shuffle([...toutesLesCartes])
  const nbCartesTas1 = randint(4, 6)
  const tas1 = cartesMelangees.slice(0, nbCartesTas1)
  const tas2 = cartesMelangees.slice(nbCartesTas1, nbCartesTas1 + randint(4, 6))

  const enonce = `Un joueur dispose de deux tas de cartes à jouer (composées de valets, dames, rois et as).<br>
Le premier tas contient ${nbCartesTas1} cartes : ${tas1
    .map(
      (c) =>
        `${nomsFigures[c.figure as keyof typeof nomsFigures]} de ${nomsCouleurs[c.couleur as keyof typeof nomsCouleurs]}`,
    )
    .join(', ')}.<br>
Le deuxième tas contient ${tas2.length} cartes : ${tas2
    .map(
      (c) =>
        `${nomsFigures[c.figure as keyof typeof nomsFigures]} de ${nomsCouleurs[c.couleur as keyof typeof nomsCouleurs]}`,
    )
    .join(', ')}.<br>
Le joueur tire une carte au hasard dans chaque tas.<br>
Il gagne si les deux cartes ont la même figure ou la même couleur.<br>
Calculer la probabilité de gagner à ce jeu.`

  let correction = `Pour gagner, les deux cartes doivent avoir la même figure ou la même couleur.<br>
  On remplit le tableau à double entrée des issues possibles de cette expérience aléatoire :<br>`

  const entetesColonne = ['\\text{Tas 1\\textbackslash Tas 2}']
  const entetesLigne = []
  const contenu = []

  // Crée les étiquettes du tableau
  for (const carte2 of tas2) {
    entetesColonne.push(
      `\\text{${nomsFigures[carte2.figure as keyof typeof nomsFigures]} ${carte2.couleur}}`,
    )
  }
  for (const carte1 of tas1) {
    entetesLigne.push(
      `\\text{${nomsFigures[carte1.figure as keyof typeof nomsFigures]} ${carte1.couleur}}`,
    )
  }

  // Remplit le tableau
  let nbIssuesGagnantes = 0
  for (const carte1 of tas1) {
    for (const carte2 of tas2) {
      const gagne =
        carte1.figure === carte2.figure || carte1.couleur === carte2.couleur
      if (gagne) {
        contenu.push('\\textbf{gagné}')
        nbIssuesGagnantes++
      } else {
        contenu.push('\\text{perdu}')
      }
    }
  }

  const tableau = tableauColonneLigne(entetesColonne, entetesLigne, contenu)
  correction += tableau + '<br>'

  const totalIssues = tas1.length * tas2.length
  const probaGagner = fraction(nbIssuesGagnantes, totalIssues)

  correction += `Il y a $${nbIssuesGagnantes}$ issues gagnantes parmi $${totalIssues}$ issues possibles.<br>`
  correction += `La probabilité de gagner à ce jeu est donc de $${!probaGagner.estIrreductible ? probaGagner.texFraction + '=' + miseEnEvidence(probaGagner.texFractionSimplifiee) : miseEnEvidence(probaGagner.texFraction)}$.<br>`

  return {
    enonce,
    correction,
    alea: { tas1: JSON.stringify(tas1), tas2: JSON.stringify(tas2) },
    reponse: probaGagner.texFraction,
  }
}

/**
 * On doit calculer la probabilité qu'un événement se réalise après une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export const uuid = '7623a'

export const refs = {
  'fr-fr': ['3S20-3'],
  'fr-ch': ['11LSNO4C-11'],
}

export default class CalculProbaExperience2Epreuves extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Types d'expérience",
      `Nombres séparés par des tirets\n\n1 : Un dé et une urne\n2 : Deux dés\n3 : Une urne avec remise\n4 : Deux dés de tailles différentes\n5 : Deux tas de cartes\n0 : Mélange`,
    ]
    this.sup = '0'
    this.nbQuestions = 1
    this.spacing = context.isHtml ? 2 : 1.5
    this.spacingCorr = context.isHtml ? 2 : 1.5
  }

  nouvelleVersion() {
    const typeExperiences = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 0,
      nbQuestions: this.nbQuestions,
      defaut: 0,
    }).map(Number)
    const experiences = [
      experience1,
      experience2,
      experience3,
      experience4,
      experience5,
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const question = experiences[typeExperiences[i] - 1]()

      if (this.questionJamaisPosee(i, JSON.stringify(question.alea))) {
        this.listeQuestions[i] =
          question.enonce +
          ajouteQuestionMathlive({
            exercice: this,
            question: i,
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: { reponse: { value: question.reponse } },
            typeInteractivite: 'mathlive',
          })
        this.listeCorrections[i] = question.correction
        i++
      }
      cpt++
    }
  }
}
