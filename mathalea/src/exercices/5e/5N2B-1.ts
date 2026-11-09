import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { obtenirListeFacteursPremiers } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Deviner un nombre relatif'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '29/06/2026'
/**
 * Additions à trou dans les relatifs
 *
 *  @author Jean-claude Lhote à partir de CM000 de Rémi Angot
 * Éric Elter le rend interactif le 15/01/2024
 */

export const uuid = '76343'

export const refs = {
  'fr-fr': ['5N2B-1'],
  'fr-2016': ['5R10-1'],
  'fr-ch': ['9R2NO3C-2', '9R3NO3C-2', '10CTNO2A-2'],
}
/**
 * Liste toutes les valeurs absolues vérifiant l'énoncé du type 3 :
 * chiffre des unités imposé, produit des trois chiffres et ordre des chiffres des dixièmes et centièmes.
 */
function solutionsProduit(
  unite: number,
  produit: number,
  centiemeSuperieur: boolean,
): number[] {
  const solutions: number[] = []
  for (let d = 0; d <= 9; d++) {
    for (let c = 0; c <= 9; c++) {
      if (unite * d * c !== produit) continue
      if (centiemeSuperieur ? d >= c : d < c) continue
      solutions.push(arrondi(unite + d / 10 + c / 100, 2))
    }
  }
  return solutions
}

/**
 * Accepte toute saisie appartenant à la liste des solutions (signe compris).
 */
function compareSolutions(signe: number, valeursAbsolues: number[]) {
  return (input: string): { isOk: boolean; feedback?: string } => {
    const saisie = Number(
      input
        .replaceAll('\\,', '')
        .replaceAll('{,}', '.')
        .replaceAll(',', '.')
        .replaceAll('−', '-')
        .replaceAll(' ', ''),
    )
    if (Number.isNaN(saisie)) return { isOk: false }
    return {
      isOk: valeursAbsolues.some((v) => Math.abs(saisie - signe * v) < 1e-9),
    }
  }
}

export default class DevinerNombreRelatif extends Exercice {
  constructor() {
    super()

    this.spacing = 2
    this.nbQuestions = 3
    this.besoinFormulaireCaseACocher = ['Utiliser valeur absolue']
    this.sup = true
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles: (1 | 2 | 3)[] = [1, 2, 3]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let dixieme
    let signe: number
    let centieme
    let unite
    let somme
    let produit
    let facteurs
    let solutions: number[] = []
    const type = ['négatif', 'nul', 'positif']
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      signe = choice([-1, 1])
      solutions = []
      switch (listeTypeDeQuestions[i]) {
        case 1:
          unite = randint(1, 9)
          somme = randint(unite + 1, unite + 9)
          dixieme = somme - unite
          centieme = 0
          texte = `Je suis un nombre ${type[signe + 1]} dont la ${this.sup ? 'valeur absolue' : 'distance à zéro'} est comprise entre $${unite}$ et $${unite + 1}$.<br>`
          texte += `On m'écrit avec deux chiffres dont la somme est $${somme}$.<br>Qui suis-je ?`
          break

        case 2:
          unite = randint(1, 9)
          somme = randint(unite + 1, unite + 9)
          dixieme = somme - unite
          centieme = 0
          texte = "Je suis un nombre dont l'opposé est compris entre "
          if (signe < 0) {
            texte += `$${unite}$ et $${unite + 1}$.<br>`
          } else {
            texte += `$${-unite - 1}$ et $${-unite}$.<br>`
          }
          texte += `La somme de mes deux chiffres est $${somme}$.<br>Qui suis-je ?`
          break

        case 3:
        default:
          produit = choice([6, 10, 15])
          facteurs = obtenirListeFacteursPremiers(produit)
          facteurs.push(1)
          facteurs = shuffle(facteurs)
          unite = facteurs[0]
          dixieme = facteurs[1]
          centieme = facteurs[2]
          texte = `Je suis un nombre ${type[signe + 1]} dont la ${this.sup ? 'valeur absolue' : 'distance à zéro'} est comprise entre $${unite}$ et $${unite + 1}$.<br>`
          texte += `Le produit de mes trois chiffres vaut $${produit}$.<br>`
          if (dixieme < centieme) {
            texte +=
              'Mon chiffre des centièmes est supérieur à mon chiffre des dixièmes.'
          } else {
            texte +=
              'Mon chiffre des centièmes est inférieur à mon chiffre des dixièmes.'
          }
          texte += ' Qui suis-je ?'
          solutions = solutionsProduit(unite, produit, dixieme < centieme)
          break
      }
      texteCorr = `Je suis $${miseEnEvidence(texNombre(signe * (unite + dixieme / 10 + centieme / 100)))}$.`
      if (solutions.length > 1) {
        texteCorr = `Je peux être ${solutions
          .map((v) => `$${miseEnEvidence(texNombre(signe * v))}$`)
          .join(' ou ')}.`
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)

      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: arrondi(signe * (unite + dixieme / 10 + centieme / 100), 3),
            ...(solutions.length > 1
              ? { compare: compareSolutions(signe, solutions) }
              : {}),
          },
        },
        { signe: true },
      )
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
