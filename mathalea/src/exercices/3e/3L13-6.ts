import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes en utilisant une équation'
export const interactifReady = true

export const dateDeModifImportante = '28/05/2026'

export const uuid = '08752'
export const refs = {
  'fr-fr': ['3L13-6'],
  'fr-ch': ['10LCFA5D-4', '10LSFA5D-4', '11CTFA4A-7', '11LCFA4A-7', '11LSFA4A-7', 'PRQAL04E-3'],
}

/**
 * @author Mickael Guironnet
 * Rajout de cas (plus d'aléatoirisation) par Éric Elter le 28/05/2026
 */
export default class ProblemesAvecEquations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Motos + voitures',
        '2 : Prix cinéma adultes/enfants',
        '3 : Fleurs',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      let probleme: Probleme | undefined
      switch (listeTypeDeQuestions[i]) {
        case 1: {
          // 1 : motos + voitures
          probleme = genererProblemeParking()
          break
        }
        case 2: {
          // 2 : prix cinéma adultes/enfants
          probleme = genererCinema()
          break
        }
        case 3: {
          // 3 : fleurs (jonquilles, roses, tulipes)
          probleme = genererFleurs()
          break
        }
        default: {
          continue
        }
      }

      // Skip this iteration
      if (!probleme) continue

      texte = `${probleme.enonce} 
        ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, { texteApres: ' ' + probleme.texteApres })}`
      handleAnswers(this, i, {
        reponse: { value: probleme.reponse.toString() },
      })

      texteCorr = `${probleme.solution}`

      if (this.questionJamaisPosee(i, probleme.donnees.a, probleme.donnees.b)) {
        this.listeQuestions[i] = texte || ''
        this.listeCorrections[i] = texteCorr || ''
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}

type Probleme = {
  enonce: string
  solution: string
  reponse: number
  donnees: {
    a: number
    b: number
  }
  texteApres: string
}

type Vehicule = {
  singulier: string
  pluriel: string
}

export function genererProblemeParking(): Probleme {
  // 🔹 Véhicules typés proprement
  const vehicules2Roues: Vehicule[] = [
    { singulier: 'moto', pluriel: 'motos' },
    { singulier: 'scooter', pluriel: 'scooters' },
    { singulier: 'trottinette', pluriel: 'trottinettes' },
    { singulier: 'vélo', pluriel: 'vélos' },
  ]

  const vehicules4Roues: Vehicule[] = [
    { singulier: 'voiture', pluriel: 'voitures' },
    { singulier: 'camionnette', pluriel: 'camionnettes' },
    { singulier: 'taxi', pluriel: 'taxis' },
    { singulier: 'quad', pluriel: 'quads' },
  ]

  // 🔹 Tirage
  const v2 = choice(vehicules2Roues)
  const v4 = choice(vehicules4Roues)

  const totalVehicules = randint(20, 49)
  const nb2 = randint(5, totalVehicules - 1)
  const nb4 = totalVehicules - nb2
  const roues = 2 * nb2 + 4 * nb4

  const cherche2 = choice([true, false])

  const nom2 = cherche2 ? v2.pluriel : v4.pluriel
  const nom4 = cherche2 ? v4.pluriel : v2.pluriel

  const enonce =
    `
Sur un parking, il y a des ${v4.pluriel} et des ${v2.pluriel}.<br>
J'ai compté $${totalVehicules}$ véhicules et $${roues}$ roues.<br>
` +
    (cherche2
      ? `Combien y a-t-il de ${v2.pluriel} ?`
      : `Combien y a-t-il de ${v4.pluriel} ?`)

  let solution = ''

  if (cherche2) {
    // x = véhicules 2 roues
    solution = `
Soit $x$ le nombre de ${v2.pluriel}.<br>
$${totalVehicules} - x$ est, alors, le nombre de ${v4.pluriel}.<br>

Chaque ${v2.singulier} a $2$ roues et chaque ${v4.singulier} a $4$ roues.<br><br>

On obtient comme nombre total de roues :<br>
$2x + 4(${totalVehicules} - x) = ${roues}$<br><br>

On résout l'équation $2x + 4(${totalVehicules} - x) = ${roues}$.<br>

$2x + ${4 * totalVehicules} - 4x = ${roues}$<br>
$${4 * totalVehicules} - 2x = ${roues}$<br>
$-2x = ${roues - 4 * totalVehicules}$<br>
$x = ${nb2}$<br>

Il y a $${miseEnEvidence(nb2)}$ ${nom2} et $${nb4}$ ${nom4}.
`
  } else {
    // x = véhicules 4 roues
    solution = `
Soit $x$ le nombre de ${v4.pluriel}.<br>
$${totalVehicules} - x$ est, alors, le nombre de ${v2.pluriel}.<br>

Chaque ${v2.singulier} a $2$ roues et chaque ${v4.singulier} a $4$ roues.<br><br>

On obtient comme nombre total de roues :<br>
$4x + 2(${totalVehicules} - x) = ${roues}$<br><br>

On résout l'équation $4x + 2(${totalVehicules} - x) = ${roues}$.<br>

$4x + ${2 * totalVehicules} - 2x = ${roues}$<br>
$2x + ${2 * totalVehicules} = ${roues}$<br>
$2x = ${roues - 2 * totalVehicules}$<br>
$x = ${nb4}$<br>

Il y a $${miseEnEvidence(nb4)}$ ${nom4} et $${nb2}$ ${nom2}.
`
  }

  solution = solution.trim()

  return {
    enonce,
    solution,
    reponse: cherche2 ? nb2 : nb4,
    donnees: { a: nb2, b: nb4 },
    texteApres: cherche2 ? nom2 : nom4,
  }
}

function genererCinema(): Probleme {
  const adultes = randint(50, 89)
  const enfants = randint(30, 59)
  const prixEnfant = randint(4, 9)
  const prixAdulte = prixEnfant + randint(2, 7)
  const tarifEnfant = choice([true, false])
  const total = texNombre(adultes * prixAdulte + enfants * prixEnfant)
  const totalNumerique = adultes * prixAdulte + enfants * prixEnfant

  let enonce = `
Au cinéma pour la sortie d'un film, il y a eu $${adultes}$ adultes et $${enfants}$ enfants.<br>`
  enonce += choice([true, false])
    ? `La place pour enfant coûte $${prixAdulte - prixEnfant}$ € de moins que celle pour adulte.<br>`
    : `La place pour adulte coûte $${prixAdulte - prixEnfant}$ € de plus que celle pour enfant.<br>`
  enonce += `Au total, le cinéma a récolté $${total}$ €.<br>`

  enonce += tarifEnfant
    ? `Quel est le prix du tarif enfant ?`
    : `Quel est le prix du tarif adulte ?`

  enonce = enonce.trim()

  let solution = `
Soit $x$ le prix du tarif enfant.<br>
Le prix du tarif adulte est donc $x + ${prixAdulte - prixEnfant}$.<br><br>

On obtient comme recette totale :<br>
$${enfants}x + ${adultes}(x + ${prixAdulte - prixEnfant}) = ${total}$<br>
$${enfants}x + ${adultes}x + ${adultes * (prixAdulte - prixEnfant)} = ${total}$<br>
$${adultes + enfants}x = ${texNombre(totalNumerique - adultes * (prixAdulte - prixEnfant))}$<br>
$x = ${prixEnfant}$<br>
`

  if (tarifEnfant) {
    // x = tarif enfant
    solution = `
Soit $x$ le prix du tarif enfant.<br>
Le prix du tarif adulte est donc $x + ${prixAdulte - prixEnfant}$.<br><br>

On obtient comme recette totale :<br>
$${enfants}x + ${adultes}(x + ${prixAdulte - prixEnfant}) = ${total}$<br><br>

On résout l'équation $${enfants}x + ${adultes}(x + ${prixAdulte - prixEnfant}) = ${total}$.<br>
$${enfants}x + ${adultes}x + ${adultes * (prixAdulte - prixEnfant)} = ${total}$<br>
$${adultes + enfants}x = ${texNombre(totalNumerique - adultes * (prixAdulte - prixEnfant))}$<br>
$x = ${prixEnfant}$<br>

Le prix du tarif enfant est $${miseEnEvidence(prixEnfant)}$ €.<br>
`
  } else {
    // x = tarif adulte
    solution = `
Soit $x$ le prix du tarif adulte.<br>
Le prix du tarif enfant est donc $x - ${prixAdulte - prixEnfant}$.<br><br>

On obtient comme recette totale :<br>
$${adultes}x + ${enfants}(x - ${prixAdulte - prixEnfant}) = ${total}$<br><br>

On résout l'équation $${adultes}x + ${enfants}(x - ${prixAdulte - prixEnfant}) = ${total}$.<br>
$${adultes}x + ${enfants}x - ${enfants * (prixAdulte - prixEnfant)} = ${total}$<br>
$${adultes + enfants}x = ${texNombre(totalNumerique + enfants * (prixAdulte - prixEnfant))}$<br>
$x = ${prixAdulte}$<br>

Le prix du tarif adulte est $${miseEnEvidence(prixAdulte)}$ €.<br>
`
  }

  solution = solution.trim()
  return {
    enonce,
    solution,
    reponse: tarifEnfant ? prixEnfant : prixAdulte,
    donnees: { a: adultes, b: enfants },
    texteApres: '€',
  }
}

export function genererFleurs(): Probleme {
  // 🔹 Liste de fleurs
  const fleursPossibles = [
    'roses',
    'tulipes',
    'jonquilles',
    'marguerites',
    'lys',
    'pivoines',
    'dahlias',
  ]

  // 🔹 Outils
  function choisir3Fleurs(liste: string[]): [string, string, string] {
    let copie = [...liste]
    copie = shuffle(copie)
    return [copie[0], copie[1], copie[2]]
  }

  const [A, B, C] = choisir3Fleurs(fleursPossibles)

  // 🔹 Paramètres math
  const a = randint(5, 20) // quantité de A
  const diff = randint(2, 10) // écart
  const coef = randint(2, 4) // multiplicateur

  // On impose : B = A + diff
  const b = a + diff
  const c = coef * b

  // 🔹 Choix du type de question
  const questionSurA = choice([true, false])

  // Si la question porte sur B, il y a diff B de moins que de A : A = B + diff
  const nbA = questionSurA ? a : b + diff
  const sommeTotale = nbA + b + c
  const total = texNombre(sommeTotale)

  // 🔹 ÉNONCÉ
  const enonce = questionSurA
    ? `
Un grossiste livre $${total}$ fleurs à un commerçant.<br>
Cette livraison se compose de ${A}, ${B} et ${C}.<br>
Il y a $${diff}$ ${B} de plus que de ${A} et $${coef}$ fois plus de ${C} que de ${B}.<br>
Combien y a-t-il de ${A} ?
`.trim()
    : `
Un grossiste livre $${total}$ fleurs à un commerçant.<br>
Cette livraison se compose de ${A}, ${B} et ${C}.<br>
Il y a $${diff}$ ${B} de moins que de ${A} et $${coef}$ fois plus de ${C} que de ${B}.<br>
Combien y a-t-il de ${B} ?
`.trim()

  let solution = ''
  let reponse = 0
  let texteApres = ''

  // 🔹 SOLUTION
  if (questionSurA) {
    // x = A
    solution = `
Soit $x$ le nombre de ${A}.<br>
Il y a donc $x + ${diff}$ ${B} et $${coef}(x + ${diff})$ ${C}.<br><br>

On obtient comme nombre total de fleurs :<br>
$x + (x + ${diff}) + ${coef}(x + ${diff}) = ${total}$<br><br>

On résout l'équation $x + (x + ${diff}) + ${coef}(x + ${diff}) = ${total}$.<br>

$${2 + coef}x + ${diff + coef * diff} = ${total}$<br>
$${2 + coef}x = ${sommeTotale - (diff + coef * diff)}$<br>
$x = ${a}$<br>

Il y a $${miseEnEvidence(a)}$ ${A}.
`.trim()

    reponse = a
    texteApres = A
  } else {
    // x = B
    solution = `
Soit $x$ le nombre de ${B}.<br>
Il y a donc $x + ${diff}$ ${A} et $${coef}x$ ${C}.<br><br>

On obtient comme nombre total de fleurs :<br>
$(x + ${diff}) + x + ${coef}x = ${total}$<br><br>

On résout l'équation $(x + ${diff}) + x + ${coef}x = ${total}$.<br>
$${2 + coef}x + ${diff} = ${total}$<br>
$${2 + coef}x = ${sommeTotale - diff}$<br>
$x = ${b}$<br>

Il y a $${miseEnEvidence(b)}$ ${B}.
`.trim()

    reponse = b
    texteApres = B
  }

  // 🔹 RETURN
  return {
    enonce,
    solution,
    reponse,
    donnees: {
      a,
      b,
    },
    texteApres,
  }
}
