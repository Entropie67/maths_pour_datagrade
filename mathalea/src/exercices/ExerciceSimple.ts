import { choice, combinaisonListes } from '../lib/outils/arrayOutils'
import type { IExerciceQcmOptions } from '../lib/types'
import { randint } from '../modules/outils'
import Exercice from './Exercice'

export default class ExerciceSimple extends Exercice {
  distracteurs: (string | number)[]
  typeExercice: 'simple'
  versionQcmDisponible?: boolean // Pour les exercices de type simple, si des distracteurs sont définis, on peut proposer une version QCM
  versionQcm?: boolean // Seulement pour les exercices de type simple, version QCM activée si 'true'
  versionQcmOptions?: IExerciceQcmOptions
  /** Plans de tirages partagés entre les questions d'une même version (voir fromQuestionPlan()).
   * Vidé par reinit() à chaque nouvelle version. */
  tiragesParQuestion?: Map<string, unknown[]>
  constructor() {
    super()
    this.distracteurs = []
    this.typeExercice = 'simple'
  }

  /**
   * Primitive de base pour contrôler le hasard entre les questions d'un exercice simple.
   *
   * Dans un exercice de type simple, nouvelleVersion() est appelée une fois par question, avec
   * une graine différente à chaque appel : un choice() ou un randint() classique y est donc
   * retiré indépendamment à chaque question, sans contrôle possible de la répartition globale
   * (rien n'empêche que les 10 questions tombent toutes sur le même cas).
   *
   * fromQuestionPlan(key, buildPlan) résout ça en construisant, au premier appel pour cette
   * `key`, un plan de nbQuestions valeurs via buildPlan(nbQuestions) — un plan qui peut donc
   * imposer n'importe quelle règle de répartition, y compris entre plusieurs variables liées
   * (ex. renvoyer des objets `{ niveau, operation }`, ou trier le plan pour que les questions
   * faciles arrivent en premier). Ce plan est stocké sur l'exercice et réutilisé pour toutes
   * les questions suivantes de la même version : chaque appel renvoie simplement la valeur
   * planifiée pour la question en cours (déduite de `listeQuestions.length`, qui vaut le
   * nombre de questions déjà validées). Une question retirée pour cause de doublon rappelle
   * nouvelleVersion() sans faire avancer `listeQuestions` : elle retombe donc sur la même
   * valeur planifiée plutôt que de consommer la suivante.
   *
   * Le plan est vidé par reinit() à chaque nouvelle version : deux versions avec la même
   * graine produisent donc le même plan (déterminisme), une autre graine peut en tirer un
   * autre (seul l'ordre change, la répartition imposée par buildPlan reste garantie).
   *
   * `quotaChoice()` et `quotaRandint()` sont des raccourcis pour les cas usuels ; utiliser
   * `fromQuestionPlan()` directement pour un plan sur mesure.
   *
   * @example
   * // Plan sur mesure : les 3 premières questions faciles, le reste mélangé
   * const niveau = this.fromQuestionPlan('niveau', (n) => {
   *   const plan = combinaisonListes(['facile', 'difficile'], n)
   *   return [...plan.filter(v => v === 'facile').slice(0, 3), ...shuffle(plan.filter((v, i) => i >= 3))]
   * })
   */
  fromQuestionPlan<T>(key: string, buildPlan: (nbQuestions: number) => T[]): T {
    if (this.tiragesParQuestion == null) {
      this.tiragesParQuestion = new Map()
    }
    let plan = this.tiragesParQuestion.get(key) as T[] | undefined
    if (plan == null || plan.length === 0) {
      plan = buildPlan(this.nbQuestions)
      this.tiragesParQuestion.set(key, plan)
    }
    // Les questions validées sont déjà dans listeQuestions : sa longueur est l'indice de la question en cours
    return plan[this.listeQuestions.length % plan.length]
  }

  /**
   * Équivalent, pour un exercice de type simple, du combinaisonListes() des exercices
   * classiques : comme choice(), mais garantit une répartition équilibrée des valeurs entre
   * les questions d'une même version. Avec ['facile', 'difficile'] sur 10 questions,
   * exactement 5 questions seront faciles (l'ordre reste aléatoire).
   *
   * Pour pondérer, répéter une valeur : quotaChoice('niveau', ['facile', 'facile', 'difficile'])
   * donne deux tiers de questions faciles.
   *
   * Pour contrôler conjointement plusieurs variables, donner une `key` différente à chaque
   * appel (les plans sont indépendants), ou passer par fromQuestionPlan() si les variables
   * doivent être liées entre elles.
   *
   * Sur un exercice à une seule question, la répartition n'a pas de sens : on retombe alors
   * sur choice(), pour ne pas changer les valeurs (et donc les liens) déjà produites par les
   * exercices qui utilisaient choice() avant d'adopter quotaChoice().
   */
  quotaChoice<T>(key: string, values: T[]): T {
    if (this.nbQuestions <= 1) return choice(values)
    return this.fromQuestionPlan(key, (nbQuestions) =>
      combinaisonListes(values, nbQuestions),
    )
  }

  /**
   * Variante de quotaChoice() pour un entier tiré entre min et max (bornes incluses) :
   * garantit que chaque valeur de l'intervalle revient un nombre de fois équilibré sur
   * l'ensemble des questions de la version, au lieu d'un randint() indépendant à chaque
   * question qui pourrait retomber plusieurs fois sur la même valeur.
   *
   * `listeAEviter` retire certaines valeurs de l'intervalle avant répartition, comme le
   * `listeAEviter` de randint().
   *
   * Sur un exercice à une seule question, la répartition n'a pas de sens : on retombe alors
   * sur randint(), pour ne pas changer les valeurs (et donc les liens) déjà produites par les
   * exercices qui utilisaient randint() avant d'adopter quotaRandint().
   */
  quotaRandint(
    key: string,
    min: number,
    max: number,
    listeAEviter: number[] = [],
  ): number {
    if (this.nbQuestions <= 1) return randint(min, max, listeAEviter)
    return this.fromQuestionPlan(key, (nbQuestions) => {
      const values: number[] = []
      for (let i = min; i <= max; i++) {
        if (!listeAEviter.includes(i)) values.push(i)
      }
      return combinaisonListes(values, nbQuestions)
    })
  }

  get key(): string {
    return [
      this.nbQuestions,
      this.interactif,
      this.sup,
      this.sup2,
      this.sup3,
      this.sup4,
      this.sup5,
      this.seed,
      this.correctionDetaillee,
      this.versionQcm,
    ].join('_')
  }
}
