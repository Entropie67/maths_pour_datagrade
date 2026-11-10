import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
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

export const dateDeModifImportante = '12/01/2026'

export const uuid = '67519'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Mickael Guironnet
 */
export default class ProblemesAvecEquations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '1-2'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Motos + voitures',
        '2 : Prix cinéma adultes/enfants',
        '3 : Fleurs (jonquilles, roses, tulipes)',
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

export function genererProblemeParking(): Probleme {
  // bornes raisonnables (collège)
  const totalVehicules: number = randint(20, 49) // 20 à 49
  const motos: number = randint(5, totalVehicules)
  const voitures: number = totalVehicules - motos
  const roues: number = 2 * motos + 4 * voitures

  const enonce = `
Sur un parking, il y a des voitures et des motos.
J'ai compté $${totalVehicules}$ véhicules et $${roues}$ roues.<br>
Combien y a-t-il de motos ?`.trim()

  const solution = `
Soit x le nombre de motos.<br>
et $${totalVehicules} - x$ le nombre de voitures.<br>

Chaque moto a 2 roues et chaque voiture a 4 roues.<br>

On écrit l'équation :<br>
$2x + 4(${totalVehicules} - x) = ${roues}$<br>

$2x + ${4 * totalVehicules} - 4x = ${roues}$<br>
$${4 * totalVehicules} - 2x = ${roues}$<br>
$-2x = ${roues - 4 * totalVehicules}$<br>
$x = ${motos}$<br>

Il y a $${miseEnEvidence(motos)}$ motos et $${voitures}$ voitures.
`.trim()

  return {
    enonce,
    solution,
    reponse: motos,
    donnees: { a: motos, b: voitures },
    texteApres: 'motos',
  }
}

function genererCinema(): Probleme {
  const adultes = randint(50, 89) // 50 à 89
  const enfants = randint(30, 59) // 30 à 59
  const prixEnfant = randint(4, 9) // 4 à 9 €
  const prixAdulte = prixEnfant + randint(2, 7) // 2 à 7 € de plus

  const total = adultes * prixAdulte + enfants * prixEnfant

  const enonce = `
Au cinéma pour la sortie d'un film, il y a eu $${adultes}$ adultes et $${enfants}$ enfants.<br>
La place pour adulte coûte $${prixAdulte - prixEnfant}$ € de plus que celle pour enfant.<br>
Au total, le cinéma a récolté $${texNombre(total)}$ €.<br>
Quel est le prix du tarif enfant ? 
`.trim()

  const solution = `
Soit $x$ le prix du tarif enfant.<br>
Le prix du tarif adulte est donc x + $${prixAdulte - prixEnfant}$.<br>

On calcule la recette totale :<br>
$${enfants}x + ${adultes}(x + ${prixAdulte - prixEnfant}) = ${total}$<br>
$${enfants}x + ${adultes}x + ${adultes * (prixAdulte - prixEnfant)} = ${total}$<br>
$${adultes + enfants}x = ${total - adultes * (prixAdulte - prixEnfant)}$<br>
$x = ${prixEnfant}$<br>

Le prix du tarif enfant est $${miseEnEvidence(prixEnfant)}$ €.<br>
`.trim()

  return {
    enonce,
    solution,
    reponse: prixEnfant,
    donnees: { a: adultes, b: enfants },
    texteApres: '€',
  }
}

function genererFleurs(): Probleme {
  const jonquilles = randint(8, 17) // 8 à 17
  const roses = jonquilles + randint(5, 6) // jonquilles + 5 à jonquilles + 6
  const tulipes = roses * randint(3, 5) // 3 à 5 fois roses
  const total = jonquilles + roses + tulipes

  const enonce = `
Un grossiste livre $${total}$ plantes à un fleuriste.<br>
Cette livraison se compose de roses, de tulipes et de jonquilles.<br>
Il y a $${roses - jonquilles}$ roses de plus que de jonquilles et $${tulipes / roses}$ fois plus de tulipes que de roses.<br>
Combien y a-t-il de jonquilles ? 
`.trim()

  const solution = `
Soit $x$ le nombre de jonquilles.<br>
Il y a donc $x + ${roses - jonquilles}$ roses.<br>
Il y a $${tulipes / roses}(x + ${roses - jonquilles})$ tulipes.<br>

Le total est :
$x + (x + ${roses - jonquilles}) + ${tulipes / roses}(x + ${roses - jonquilles}) = ${total}$<br>
$x + x + ${roses - jonquilles} + ${tulipes / roses}x + ${(tulipes / roses) * (roses - jonquilles)} = ${total}$<br>
$${2 + tulipes / roses}x + ${roses - jonquilles + (tulipes / roses) * (roses - jonquilles)} = ${total}$<br>
$${2 + tulipes / roses}x  = ${total} -  ${roses - jonquilles + (tulipes / roses) * (roses - jonquilles)}$<br>
$${2 + tulipes / roses}x  = ${total - (roses - jonquilles + (tulipes / roses) * (roses - jonquilles))}$<br>
$x  = \\dfrac{${total - (roses - jonquilles + (tulipes / roses) * (roses - jonquilles))}}{${2 + tulipes / roses}}$<br>
$x = ${jonquilles}$<br>

Il y a $${miseEnEvidence(jonquilles)}$ jonquilles.<br>
`.trim()

  return {
    enonce,
    solution,
    reponse: jonquilles,
    donnees: { a: jonquilles, b: roses },
    texteApres: 'jonquilles',
  }
}
