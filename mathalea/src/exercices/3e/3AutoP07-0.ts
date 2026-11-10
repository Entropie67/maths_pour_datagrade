import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer un pourcentage'

export const interactifReady = true

export const dateDePublication = '24/12/2025'

export const uuid = '82d74'

export const refs = {
  'fr-fr': ['3AutoP02-1'],
  'fr-ch': ['10CTFA1C-9', '10LCFA1C-9', '10LSFA1C-9', 'PRQPF05A-8'],
}

const caracteres = [
  'portent des lunettes',
  `ont une taille supérieure à $${texNombre(1.75)}\\text{ m}$`,
  'pratiquent un sport',
  'aiment la musique pop',
  'aiment le chocolat',
  "consomment plus de $2$ litres d'eau par jour",
]
const populations = [
  {
    lieu: 'un collège',
    tailleInit: 800,
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
  }

  nouvelleVersion() {
    const caractere = this.sup ? caracteres[0] : choice(caracteres)
    const population = Object.assign(
      {},
      this.sup ? populations[0] : choice(populations),
    )
    const pourcentage = this.sup ? 25 : choice([10, 25, 30, 40])
    const nbIndividus =
      population.tailleInit +
      (this.sup ? 0 : randint(0, 5) * population.facteurTaille)

    this.reponse = texNombre((nbIndividus * pourcentage) / 100, 0)

    this.question = `Dans ${population.lieu} de $${texNombre(nbIndividus)}$ ${population.nom}, $${pourcentage}\\,\\%$ des ${population.nom} ${caractere}.<br>
    Combien ${population.déterminant}${population.nom} ${caractere} ?`
    this.correction = `Le nombre ${population.déterminant}${population.nom} qui ${caractere} est égal à :<br>
    $${texNombre(nbIndividus, 0)} \\times \\dfrac{${texNombre(
      pourcentage,
      0,
    )}}{100} = \\dfrac{${texNombre(nbIndividus * pourcentage, 0)}}{100}=${miseEnEvidence(texNombre((nbIndividus * pourcentage) / 100, 0))}$.`
  }
}
