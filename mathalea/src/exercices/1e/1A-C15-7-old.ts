// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9823a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomM } from '../../lib/outils/Personne'
import { texPrix } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '9823a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Écrire l'équation modélisant un problème"
export const dateDePublication = '15/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC15gOld extends ExerciceQcmA {
  // Cas 1 : nombre de viennoiseries × prix unitaire
  private cas1(
    prenom: string,
    nbViennoiseries: number,
    prixTotal: number,
  ): void {
    this.enonce = `Pour le petit déjeuner, ${prenom} a acheté $${nbViennoiseries}$ viennoiseries.<br>
Il a payé $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le prix d'une viennoiserie.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Le prix total est égal au nombre de viennoiseries multiplié par le prix unitaire.<br>
On a donc : $${nbViennoiseries} \\times x = ${texPrix(prixTotal)}$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`${nbViennoiseries}x=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$${nbViennoiseries}x=${texPrix(prixTotal)}$`,
      `$${texPrix(prixTotal)}x=${nbViennoiseries}$`,
      `$x+${nbViennoiseries}=${texPrix(prixTotal)}$`,
      `$x=${texPrix(prixTotal)}+${nbViennoiseries}$`,
    ]
  }

  // Cas 2 : brioches (prix inconnu) + croissants (prix connu) même nombre
  private cas2(
    choix: boolean,
    prenom: string,
    nbBrioches: number,
    nbCroissants: number,
    prixCroissant: number,
    prixTotal: number,
  ): void {
    this.enonce = `Pour le petit déjeuner, ${prenom} a acheté $${nbBrioches}$ brioches et $${nbCroissants}$ croissants.<br>
Le prix d'un croissant est $${texPrix(prixCroissant)}$ € et il a payé au total $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le prix d'une brioche.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Le prix total est égal au prix des brioches plus le prix des croissants.<br>
Prix des brioches : $${nbBrioches}x$<br>
Prix des croissants : $${nbCroissants} \\times ${texPrix(prixCroissant)} = 
 ${choix ? `` : `${texPrix(nbCroissants * prixCroissant)}`}$<br>
${choix ? `Comme le nombre de brioches est égal au nombre de croissants, on a donc : $${nbBrioches}(x+${texPrix(prixCroissant)})=${texPrix(prixTotal)}$<br>` : ``}
L'équation qui modélise la situation est ${choix ? `$${miseEnEvidence(`${nbBrioches}(x+${texPrix(prixCroissant)})=${texPrix(prixTotal)}`)}$` : `$${miseEnEvidence(`${nbBrioches}x+${texPrix(nbCroissants * prixCroissant)}=${texPrix(prixTotal)}`)}$`}.`

    this.reponses = [
      choix
        ? `$${nbBrioches}(x+${texPrix(prixCroissant)})=${texPrix(prixTotal)}$`
        : `$${nbBrioches}x+${texPrix(nbCroissants * prixCroissant)}=${texPrix(prixTotal)}$`,
      `$${texPrix(prixCroissant)}x+${texPrix(nbCroissants)}=${texPrix(prixTotal)}$`,
      `$${nbBrioches}x+${texPrix(prixCroissant)}=${texPrix(prixTotal)}$`,
      `$x+${texPrix(nbCroissants * prixCroissant)}=${texPrix(prixTotal)}$`,
    ]
  }

  // Cas 3 : 1 brioche (prix inconnu) + croissants (prix connu)
  private cas3(
    nbCroissants: number,
    prixCroissant: number,
    prixTotal: number,
  ): void {
    this.enonce = `Pour le petit déjeuner, Yassine a acheté $1$ brioche et $${nbCroissants}$ croissants.<br>
Le prix d'un croissant est $${texPrix(prixCroissant)}$ € et il a payé au total $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le prix d'une brioche.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Le prix total est égal au prix de la brioche plus le prix des croissants.<br>
Prix de la brioche : $x$<br>
Prix des croissants : $${nbCroissants} \\times ${texPrix(prixCroissant)} = ${texPrix(nbCroissants * prixCroissant)}$<br>
On a donc : $x + ${texPrix(nbCroissants * prixCroissant)} = ${texPrix(prixTotal)}$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`x+${texPrix(nbCroissants * prixCroissant)}=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$x+${texPrix(nbCroissants * prixCroissant)}=${texPrix(prixTotal)}$`,
      `$${nbCroissants}(x+${texPrix(prixCroissant)})=${texPrix(prixTotal)}$`,
      `$x+${texPrix(prixCroissant)}=${texPrix(prixTotal)}$`,
      `$x \\times ${texPrix(prixCroissant)}=${texPrix(prixTotal)}$`,
    ]
  }

  // Cas 4 : x brioches + multiplicateur × x croissants
  private cas4(
    prenom: string,
    multiplicateur: number,
    prixCroissant: number,
    prixBrioche: number,
    prixTotal: number,
  ): void {
    const texteMultiplicateur = multiplicateur === 2 ? '$2$ fois' : '$3$ fois'

    this.enonce = `Pour le petit déjeuner, ${prenom} a acheté des brioches et des croissants.<br>
Il a acheté ${texteMultiplicateur} plus de croissants que de brioches.<br>
Le prix d'un croissant est $${texPrix(prixCroissant)}$ € et celui d'une brioche est $${texPrix(prixBrioche)}$ €.<br>
Il a payé au total $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le nombre de brioches achetées.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Nombre de brioches : $x$<br>
Nombre de croissants : $${multiplicateur}x$<br>
Prix des brioches : $x \\times ${texPrix(prixBrioche)} = ${texPrix(prixBrioche)}x$<br>
Prix des croissants : $${multiplicateur}x \\times ${texPrix(prixCroissant)} = ${texPrix(multiplicateur * prixCroissant)}x$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`${texPrix(prixBrioche)}x+${texPrix(multiplicateur * prixCroissant)}x=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$${texPrix(prixBrioche)}x+${texPrix(multiplicateur * prixCroissant)}x=${texPrix(prixTotal)}$`,
      `$${multiplicateur}x+x=${texPrix(prixTotal)}$`,
      `$${multiplicateur}x \\times ${texPrix(prixCroissant)} + ${texPrix(prixBrioche)}=${texPrix(prixTotal)}$`,
      `$x+${texPrix(multiplicateur * prixCroissant)}=${texPrix(prixTotal)}$`,
    ]
  }

  // Cas 5 : brioche plus chère que croissant de x centimes
  private cas5(
    prenom: string,
    nbBrioches: number,
    nbCroissants: number,
    supplementBrioche: number,
    prixTotal: number,
  ): void {
    const centimes = Math.round(supplementBrioche * 100)

    this.enonce = `Pour le petit déjeuner, ${prenom} a acheté $${nbBrioches}$ brioches et $${nbCroissants}$ croissants.<br>
Le prix d'une brioche est $${centimes}$ centimes plus cher que celui d'un croissant.<br>
Il a payé au total $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le prix d'un croissant.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Prix d'un croissant : $x$<br>
Prix d'une brioche : $x + ${texPrix(supplementBrioche)}$<br>
Prix des croissants : $${nbCroissants}x$<br>
Prix des brioches : $${nbBrioches}(x + ${texPrix(supplementBrioche)}) = ${nbBrioches}x + ${texPrix(nbBrioches * supplementBrioche)}$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`${nbCroissants + nbBrioches}x+${texPrix(nbBrioches * supplementBrioche)}=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$${nbCroissants + nbBrioches}x+${texPrix(nbBrioches * supplementBrioche)}=${texPrix(prixTotal)}$`,
      `$${nbBrioches}(x+${texPrix(supplementBrioche)})+${nbCroissants}=${texPrix(prixTotal)}$`,
      `$${nbBrioches}x+${nbCroissants}(x+${texPrix(supplementBrioche)})=${texPrix(prixTotal)}$`,
      `$${nbBrioches + nbCroissants}x+${texPrix(supplementBrioche)}=${texPrix(prixTotal)}$`,
    ]
  }

  // Cas 6 : nombre total de viennoiseries, x = nombre de croissants
  private cas6(
    prenom: string,
    nbTotal: number,
    prixCroissant: number,
    prixBrioche: number,
    prixTotal: number,
  ): void {
    this.enonce = `Pour le petit déjeuner, ${prenom} a acheté $${nbTotal}$ viennoiseries (croissants et brioches).<br>
Le prix d'un croissant est $${texPrix(prixCroissant)}$ € et celui d'une brioche est $${texPrix(prixBrioche)}$ €.<br>
Il a payé au total $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le nombre de croissants achetés.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Nombre de croissants : $x$<br>
Nombre de brioches : $${nbTotal} - x$<br>
Prix des croissants : $${texPrix(prixCroissant)}x$<br>
Prix des brioches : $${texPrix(prixBrioche)}(${nbTotal} - x)$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`${texPrix(prixCroissant)}x+${texPrix(prixBrioche)}(${nbTotal}-x)=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$${texPrix(prixCroissant)}x+${texPrix(prixBrioche)}(${nbTotal}-x)=${texPrix(prixTotal)}$`,
      `$${texPrix(prixCroissant)}x+${texPrix(prixBrioche)}x=${texPrix(prixTotal)}$`,
      `$(${texPrix(prixCroissant)}+${texPrix(prixBrioche)})x=${texPrix(prixTotal)}$`,
      `$${texPrix(prixCroissant)}(${nbTotal}-x)+${texPrix(prixBrioche)}x=${texPrix(prixTotal)}$`,
    ]
  }

  // Cas 7 : réduction sur le prix total
  private cas7(
    prenom: string,
    nbCroissants: number,
    reduction: number,
    prixTotal: number,
  ): void {
    this.enonce = `Pour le petit déjeuner, ${prenom} achète $${nbCroissants}$ croissants.<br>
Il bénéficie d'une réduction de $${texPrix(reduction)}$ € sur le prix total.<br>
Il paie (réduction déduite) $${texPrix(prixTotal)}$ €.<br>
On désigne par $x$ le prix d'un croissant.<br>
Parmi les équations suivantes, une seule modélise la situation. Laquelle ?`

    this.correction = `Prix sans réduction : $${nbCroissants}x$<br>
Réduction : $${texPrix(reduction)}$ €<br>
Prix payé : $${nbCroissants}x - ${texPrix(reduction)} = ${texPrix(prixTotal)}$<br>
L'équation qui modélise la situation est $${miseEnEvidence(`${nbCroissants}x-${texPrix(reduction)}=${texPrix(prixTotal)}`)}$.`

    this.reponses = [
      `$${nbCroissants}x-${texPrix(reduction)}=${texPrix(prixTotal)}$`,
      `$${nbCroissants}x+${texPrix(reduction)}=${texPrix(prixTotal)}$`,
      `$${nbCroissants}(x-${texPrix(reduction)})=${texPrix(prixTotal)}$`,
      `$${nbCroissants}x=${texPrix(prixTotal)}-${texPrix(reduction)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    const prenom = 'Yassine'
    const nbViennoiseries = 6
    const prixTotal = 5.7
    this.cas1(prenom, nbViennoiseries, prixTotal)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const prenom = prenomM() as string
      const typeCas = randint(1, 7)

      switch (typeCas) {
        case 1: {
          const nbViennoiseries = randint(5, 9)
          const prixTotal = (randint(8, 15) * nbViennoiseries) / 10
          this.cas1(prenom, nbViennoiseries, prixTotal)
          break
        }

        case 2: {
          const choix = choice([true, false])
          const nbBrioches = randint(4, 8)
          const nbCroissants = nbBrioches
          const prixCroissant = randint(11, 14) / 10
          const prixTotal =
            (randint(20, 30) * nbBrioches) / 10 + nbCroissants * prixCroissant
          this.cas2(
            choix,
            prenom,
            nbBrioches,
            nbCroissants,
            prixCroissant,
            prixTotal,
          )
          break
        }

        case 3: {
          const nbCroissants = randint(5, 9)
          const prixCroissant = randint(11, 14) / 10
          const prixTotal = randint(15, 25) / 10 + nbCroissants * prixCroissant
          this.cas3(nbCroissants, prixCroissant, prixTotal)
          break
        }

        case 4: {
          const multiplicateur = randint(2, 3)
          const prixCroissant = randint(11, 14) / 10
          const prixBrioche = randint(21, 39) / 10
          const nbBrioches = randint(2, 5)
          const prixTotal =
            nbBrioches * prixBrioche +
            multiplicateur * nbBrioches * prixCroissant
          this.cas4(
            prenom,
            multiplicateur,
            prixCroissant,
            prixBrioche,
            prixTotal,
          )
          break
        }

        case 5: {
          const nbBrioches = randint(3, 6)
          const nbCroissants = randint(4, 7, nbBrioches)
          const supplementBrioche = choice([0.3, 0.4, 0.5, 0.6, 0.7])
          const prixCroissant = randint(11, 14) / 10
          const prixBrioche = prixCroissant + supplementBrioche
          const prixTotal =
            nbBrioches * prixBrioche + nbCroissants * prixCroissant
          this.cas5(
            prenom,
            nbBrioches,
            nbCroissants,
            supplementBrioche,
            prixTotal,
          )
          break
        }

        case 6: {
          const nbTotal = randint(8, 12)
          const prixCroissant = randint(11, 14) / 10
          const prixBrioche = randint(21, 29) / 10
          const nbCroissantsReel = randint(3, nbTotal - 3)
          const prixTotal =
            nbCroissantsReel * prixCroissant +
            (nbTotal - nbCroissantsReel) * prixBrioche
          this.cas6(prenom, nbTotal, prixCroissant, prixBrioche, prixTotal)
          break
        }

        case 7: {
          const nbCroissants = randint(5, 8)
          const reduction = choice([1, 1.5, 2, 2.5])
          const prixCroissant = randint(11, 14) / 10
          const prixSansReduction = nbCroissants * prixCroissant
          const prixTotal = prixSansReduction - reduction
          this.cas7(prenom, nbCroissants, reduction, prixTotal)
          break
        }
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
