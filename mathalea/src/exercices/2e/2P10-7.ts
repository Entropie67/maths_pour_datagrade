import { tableauColonneLigne } from '../../lib/2d/tableau'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { personnes } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Vérifier la cohérence d'une loi de probabilité"
export const dateDePublication = '18/08/2026'
export const interactifReady = true

export const uuid = '2e408'

export const refs = {
  'fr-fr': ['2P10-7'],
  'fr-ch': ['11LCNO4B-10', '11LSNO4B-10'],
}

export function genereEffectifsDeSomme100(): number[] {
  const coupures = [0, 100]
  for (let i = 0; i < 5; i++) coupures.push(randint(0, 100))
  coupures.sort((a, b) => a - b)
  return shuffle(coupures.slice(1).map((borne, i) => borne - coupures[i]))
}

export function rendSommeIncorrecte(effectifs: number[]): number[] {
  const resultat = [...effectifs]
  const indicesModifiables = resultat
    .map((effectif, indice) => ({ effectif, indice }))
    .filter(({ effectif }) => effectif > 0 || effectif < 100)
  const { effectif, indice } = choice(indicesModifiables)
  const signe = effectif === 0 ? 1 : effectif === 100 ? -1 : choice([-1, 1])
  const variationMaximale = signe === 1 ? 100 - effectif : effectif
  resultat[indice] += signe * randint(1, Math.min(10, variationMaximale))
  return resultat
}

function frequenceLatex(effectif: number): string {
  return texNombre(effectif / 100, 2)
}

/**
 * Vérifier qu'une liste de fréquences définit une loi de probabilité.
 *
 * @author Arnaud Meistermann
 */
export default class CoherenceLoiProbabilite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const [proprietaire, contradicteur] = personnes(2)
      const tableauCorrect = choice([true, false])
      const effectifsCorrects = genereEffectifsDeSomme100()
      const effectifs = tableauCorrect
        ? effectifsCorrects
        : rendSommeIncorrecte(effectifsCorrects)
      const frequences = effectifs.map(frequenceLatex)
      const somme = effectifs.reduce((total, effectif) => total + effectif, 0)
      const sommeLatex = frequenceLatex(somme)

      let texte = `${proprietaire.prenom} possède un dé truqué et affirme que la probabilité d'apparition de chacune des faces est donnée par le tableau suivant.<br>`
      texte += `${contradicteur.prenom} affirme que ce tableau est nécessairement faux. A-t-${contradicteur.pronom} raison ?<br><br>`
      texte += tableauColonneLigne(
        ['\\text{Issue}', '1', '2', '3', '4', '5', '6'],
        ['\\text{Probabilité}'],
        frequences,
      )

      this.autoCorrection[i] = {
        enonce: `${texte}\n`,
        options: { ordered: false, radio: true },
        propositions: [
          {
            texte: `${contradicteur.prenom} a raison.`,
            statut: !tableauCorrect,
          },
          {
            texte: `${contradicteur.prenom} a tort.`,
            statut: tableauCorrect,
          },
        ],
      }
      if (this.interactif) texte += `<br>${propositionsQcm(this, i).texte}`

      const calculSomme = frequences.join('+')
      let correction = `Pour définir une loi de probabilité, toutes les probabilités doivent être comprises entre $0$ et $1$. De plus, leur somme doit être égale à $1$.<br>`
      correction += `Ici, toutes les fréquences sont comprises entre $0$ et $1$.<br>`
      correction += `$${calculSomme}=${sommeLatex}${tableauCorrect ? '' : '\\neq 1'}$.<br>`
      correction += tableauCorrect
        ? `La somme est égale à $1$.<br>Il est possible que ce tableau soit correct. ${texteEnCouleurEtGras(`${contradicteur.prenom} a tort`)}.`
        : `La somme n'est pas égale à $1$ : ${texteEnCouleurEtGras(`${contradicteur.prenom} a raison`)}.`

      if (
        this.questionJamaisPosee(
          i,
          proprietaire.prenom,
          contradicteur.prenom,
          ...effectifs,
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(correction)
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
