import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des équipes et comités'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'b3twd'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-4'],
}

/**
 * Combinaisons avec contraintes - Formation d'équipes et comités
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class EquipesComites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Comité simple (combinaison)',
        '2 : Équipe avec quotas (combinaison)',
        '3 : Équipe avec exclusions (combinaison)',
        '4 : Formation de plusieurs équipes (combinaison)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['simple', 'quotas', 'exclusions', 'plusieurs'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const contextes = [
      { groupe: 'adhérents', singulier: 'adhérent', lieu: "d'une association" },
      { groupe: 'employés', singulier: 'employé', lieu: "d'une entreprise" },
      { groupe: 'élèves', singulier: 'élève', lieu: "d'une classe" },
      { groupe: 'membres', singulier: 'membre', lieu: "d'un club" },
      { groupe: 'joueurs', singulier: 'joueur', lieu: "d'un club sportif" },
      { groupe: 'musiciens', singulier: 'musicien', lieu: "d'un orchestre" },
      {
        groupe: 'chercheurs',
        singulier: 'chercheur',
        lieu: "d'un laboratoire",
      },
      { groupe: 'bénévoles', singulier: 'bénévole', lieu: "d'une ONG" },
      { groupe: 'artistes', singulier: 'artiste', lieu: "d'un collectif" },
      { groupe: 'délégués', singulier: 'délégué', lieu: "d'un parti" },
      { groupe: 'candidats', singulier: 'candidat', lieu: "d'un concours" },
      { groupe: 'villageois', singulier: 'villageois', lieu: "d'un village" },
      { groupe: 'scouts', singulier: 'scout', lieu: "d'un groupe scout" },
      {
        groupe: 'volontaires',
        singulier: 'volontaire',
        lieu: "d'un programme humanitaire",
      },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]
      const ctx = choice(contextes)

      if (typeQuestion === 'simple') {
        const n = randint(12, 35)
        const k = randint(3, 8)
        reponse = combinaison(n, k)

        const comite = choice([
          'comité',
          'conseil',
          'bureau',
          'commission',
          'délégation',
          'jury',
          'groupe de travail',
          'équipe',
          'panel',
        ])

        texte = `Parmi les $${n}$ ${ctx.groupe} ${ctx.lieu}, on souhaite former un ${comite} de $${k}$ personnes. `
        texte += `De combien de façons peut-on constituer ce ${comite} ?`

        texteCorr = `On choisit $${k}$ personnes parmi $${n}$, l'ordre n'important pas.<br>`
        texteCorr += `Il s'agit d'une combinaison :<br>`
        texteCorr += `$C_{${k}}^{${n}} = \\dfrac{${n}!}{${k}! \\times ${n - k}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'quotas') {
        const categorie = choice([
          { cat1: 'francophones', cat2: 'non-francophones' },
          { cat1: 'seniors', cat2: 'juniors' },
          { cat1: 'internes', cat2: 'externes' },
          { cat1: 'titulaires', cat2: 'suppléants' },
          { cat1: 'végétariens', cat2: 'non-végétariens' },
        ])
        const n1 = randint(6, 18)
        const n2 = randint(6, 18)
        const k = randint(4, 7)
        const k1Min = randint(2, k - 2)

        let rep = 0
        for (let j = k1Min; j <= Math.min(k, n1); j++) {
          rep += combinaison(n1, j) * combinaison(n2, k - j)
        }
        reponse = rep

        texte = `Un groupe comprend $${n1}$ ${categorie.cat1} et $${n2}$ ${categorie.cat2}. On forme une équipe de $${k}$ personnes avec au moins $${k1Min}$ ${categorie.cat1}. `
        texte += `De combien de façons peut-on constituer cette équipe ?`

        texteCorr = `On additionne les cas où il y a $${k1Min}$, $${k1Min + 1}$, $\\ldots$, $${Math.min(k, n1)}$ ${categorie.cat1}.<br><br>`
        let calcul = ''
        for (let j = k1Min; j <= Math.min(k, n1); j++) {
          const c1 = combinaison(n1, j)
          const c2 = combinaison(n2, k - j)
          texteCorr += `$\\bullet$ $${j}$ ${categorie.cat1} et $${k - j}$ ${categorie.cat2} : $C_{${j}}^{${n1}} \\times C_{${k - j}}^{${n2}} = ${texNombre(c1)} \\times ${texNombre(c2)} = ${texNombre(c1 * c2)}$<br>`
          calcul += `${texNombre(c1 * c2)}`
          if (j < Math.min(k, n1)) calcul += ' + '
        }
        texteCorr += `<br>Total : $${calcul} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'exclusions') {
        const n = randint(10, 25)
        const k = randint(4, 7)
        const variante = choice([
          'maries',
          'disputes',
          'obligatoire',
          'deuxObligatoires',
        ])

        if (variante === 'maries') {
          const sansEux = combinaison(n - 2, k)
          const avecEux = combinaison(n - 2, k - 2)
          reponse = sansEux + avecEux

          const lien = choice([
            "sont mariés et ne peuvent venir qu'ensemble",
            'sont inséparables et ne participent que si les deux ou aucun sont sélectionnés',
          ])

          texte = `Parmi les $${n}$ ${ctx.groupe}, deux ${lien}. `
          texte += `De combien de façons peut-on former un groupe de $${k}$ personnes ?`

          texteCorr = `Deux cas possibles :<br>`
          texteCorr += `$\\bullet$ Sans eux : on choisit $${k}$ parmi $${n - 2}$ (combinaison): $C_{${k}}^{${n - 2}} = ${texNombre(sansEux)}$<br>`
          texteCorr += `$\\bullet$ Avec eux : on choisit $${k - 2}$ parmi $${n - 2}$ (combinaison): $C_{${k - 2}}^{${n - 2}} = ${texNombre(avecEux)}$<br><br>`
          texteCorr += `Total : $${texNombre(sansEux)} + ${texNombre(avecEux)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'disputes') {
          const total = combinaison(n, k)
          const avecLesDeux = combinaison(n - 2, k - 2)
          reponse = total - avecLesDeux

          const conflit = choice([
            'sont en conflit et ne peuvent pas être réunis',
            'refusent de travailler ensemble',
            'sont rivaux et ne doivent pas être dans le même groupe',
          ])

          texte = `Parmi les $${n}$ ${ctx.groupe}, deux ${conflit}. `
          texte += `De combien de façons peut-on former un groupe de $${k}$ personnes ?`

          texteCorr = `On retire du total les groupes où les deux sont présents.<br>`
          texteCorr += `$\\bullet$ Total : $C_{${k}}^{${n}} = ${texNombre(total)}$<br>`
          texteCorr += `$\\bullet$ Avec les deux ensemble : $C_{${k - 2}}^{${n - 2}} = ${texNombre(avecLesDeux)}$<br><br>`
          texteCorr += `Résultat : $${texNombre(total)} - ${texNombre(avecLesDeux)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'obligatoire') {
          reponse = combinaison(n - 1, k - 1)

          const role = choice([
            'président',
            'capitaine',
            'responsable',
            'directeur',
            'doyen',
            'trésorier',
            'secrétaire',
          ])

          texte = `Parmi les $${n}$ ${ctx.groupe}, le ${role} doit obligatoirement faire partie du groupe de $${k}$ personnes. `
          texte += `De combien de façons peut-on former ce groupe ?`

          texteCorr = `Le ${role} est déjà dans le groupe. On choisit les $${k - 1}$ autres parmi $${n - 1}$ (combinaison).<br>`
          texteCorr += `$C_{${k - 1}}^{${n - 1}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          // Deux personnes obligatoires
          reponse = combinaison(n - 2, k - 2)

          texte = `Parmi les $${n}$ ${ctx.groupe}, le président et le vice-président doivent obligatoirement faire partie du groupe de $${k}$ personnes. `
          texte += `De combien de façons peut-on former ce groupe ?`

          texteCorr = `Les $2$ personnes sont déjà dans le groupe. On choisit les $${k - 2}$ autres parmi $${n - 2}$ (combinaison).<br>`
          texteCorr += `$C_{${k - 2}}^{${n - 2}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else {
        // Formation de plusieurs équipes
        const tailleEquipe = randint(3, 5)
        const nbEquipes = randint(2, 3)
        const n = tailleEquipe * nbEquipes

        let numerateur = 1
        let reste = n
        for (let j = 0; j < nbEquipes; j++) {
          numerateur *= combinaison(reste, tailleEquipe)
          reste -= tailleEquipe
        }
        reponse = numerateur / factorielle(nbEquipes)

        texte = `Avec $${n}$ personnes, on souhaite former $${nbEquipes}$ équipes de $${tailleEquipe}$ joueurs chacune. `
        texte += `De combien de façons peut-on répartir ces personnes en équipes (il n'y a pas de rôle au sein de l'équipe) ?`

        texteCorr = `On choisit successivement les membres de chaque équipe (combinaison : l'ordre au sein d'une équipe ne compte pas), puis on divise par ${nbEquipes === 2 ? '$2$' : `$${nbEquipes}!$`} car les équipes ne sont pas numérotées : l'ordre dans lequel on forme les équipes ne compte pas.<br><br>`
        let calcul = ''
        reste = n
        for (let j = 0; j < nbEquipes; j++) {
          calcul += `C_{${tailleEquipe}}^{${reste}}`
          if (j < nbEquipes - 1) calcul += ' \\times '
          reste -= tailleEquipe
        }
        texteCorr += `$\\dfrac{${calcul}}{${nbEquipes}!} = \\dfrac{${texNombre(numerateur)}}{${factorielle(nbEquipes)}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, typeQuestion, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
