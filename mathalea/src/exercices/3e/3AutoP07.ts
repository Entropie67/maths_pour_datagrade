import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer un pourcentage restant'

export const interactifReady = true

export const dateDePublication = '23/12/2025'

export const uuid = '5b988'

export const refs = {
  'fr-fr': ['3AutoP03-4'],
  'fr-ch': ['10CTFA1C-13', '10LCFA1C-13', '10LSFA1C-13', 'PRQPF05A-9'],
}

const evenements = [
  { nomComplet: 'une olympiade de mathématiques', abrev: 'cette olympiade' },
  { nomComplet: "un bal de fin d'année", abrev: 'ce bal' },
  { nomComplet: 'une campagne de vaccination', abrev: 'cette campagne' },
  { nomComplet: 'une collecte de fonds', abrev: 'cette collecte' },
  { nomComplet: 'une opération de nettoyage', abrev: 'cette opération' },
]
const populations = [
  {
    lieu: 'un collège',
    tailleInit: 300,
    facteurTaille: 100,
    nom: 'élèves',
    déterminant: "d'",
  },
  {
    lieu: 'une ville',
    tailleInit: 5000,
    facteurTaille: 1000,
    nom: 'habitants',
    déterminant: "d'",
  },
  {
    lieu: 'une entreprise',
    tailleInit: 200,
    facteurTaille: 100,
    nom: 'employés',
    déterminant: "d'",
  },
  {
    lieu: 'une école',
    tailleInit: 1000,
    facteurTaille: 100,
    nom: 'étudiants',
    déterminant: "d'",
  },
  {
    lieu: 'une association',
    tailleInit: 150,
    facteurTaille: 50,
    nom: 'membres',
    déterminant: 'de ',
  },
]
/**
 * @author Jean-claude Lhote
 */
export default class PourcentageComplementaire extends ExerciceSimple {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const evenement = this.sup ? evenements[0] : choice(evenements)
    const population = Object.assign(
      {},
      this.sup ? populations[0] : choice(populations),
    )
    const pourcentage = this.sup ? 25 : choice([10, 25, 30, 40])
    const nbIndividus =
      population.tailleInit +
      (this.sup ? 0 : randint(0, 5) * population.facteurTaille)
    const nombreParticipants = Math.round((nbIndividus * pourcentage) / 100)
    const nombreNonParticipants = nbIndividus - nombreParticipants

    this.reponse = texNombre(nombreNonParticipants, 0)

    this.question = `Dans ${population.lieu}, $${pourcentage}\\,\\%$ des $${texNombre(nbIndividus)}$ ${population.nom} participent à ${evenement.nomComplet}.<br>
    Combien ${population.déterminant}${population.nom} ne participent pas à ${evenement.abrev} ?`
    this.correction = `Le nombre ${population.déterminant}${population.nom} participant à ${evenement.abrev} est égal à :<br>
    $${texNombre(nbIndividus, 0)} \\times \\dfrac{${texNombre(
      pourcentage,
      0,
    )}}{100} = ${texNombre(nombreParticipants, 0)}$.<br>
    Le nombre ${population.déterminant}${population.nom} ne participant pas à ${evenement.abrev} est donc égal à :<br>
    $${texNombre(nbIndividus, 0)} - ${texNombre(
      nombreParticipants,
      0,
    )} = ${miseEnEvidence(this.reponse)}$.<br>`
    if (this.correctionDetaillee) {
      this.correction += `<br>Une autre méthode consiste à calculer le pourcentage ${population.déterminant}${population.nom} ne participant pas à ${evenement.abrev}, qui est égal à $100\\,\\% - ${texNombre(pourcentage, 0)}\\,\\% = ${texNombre(100 - pourcentage, 0)}\\,\\%$.<br>
    Le nombre ${population.déterminant}${population.nom} ne participant pas à ${evenement.abrev} est donc égal à :<br>
    $${texNombre(nbIndividus, 0)} \\times \\dfrac{${texNombre(
      100 - pourcentage,
      0,
    )}}{100} = ${miseEnEvidence(this.reponse)}$.`
    }
  }
}
