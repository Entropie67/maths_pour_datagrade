import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { context } from '../../modules/context'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '14/01/2026'
export const dateDeModifImportante = '21/10/2026'
export const uuid = 'c2d7e'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export const refs = {
  'fr-fr': ['1A-F02-19'],
  'fr-ch': ['1mQCM-45', '11LSFA2G-3', '11LSQCMFA2D-3'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Vérifier si un nombre est un antécédent avec une fonction polynôme du second degré'
export default class AutoF2s extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { fonction: Trinome; candidats: number[] }
  >()

  appliquerLesValeurs(valeurs: { a: number; x1: number; x2: number }) {
    const { a, x1, x2 } = valeurs
    const f = new Trinome(0, 0, 0)
    f.defFormeFactorisee(a, x1, x2)

    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${f.tex}$.<br>
    ${this.sup3 || context.isAmc ? 'Un antécédent de $0$ par la fonction $f$ est :' : 'Déterminer un antécédent de $0$ par la fonction $f$.'}`

    // Choix de la racine à afficher comme bonne réponse
    const bonneReponse = choice([x1, x2])
    const autreRacine = bonneReponse === x1 ? x2 : x1

    // Génération des distracteurs (on ne met PAS l'autre racine)
    const distracteursPossibles: number[] = []

    // Distracteur prioritaire : f(0) = c (confusion image/antécédent)
    const fDe0 = f.c.valeurDecimale
    if (
      fDe0 !== bonneReponse &&
      fDe0 !== autreRacine &&
      Number.isInteger(fDe0)
    ) {
      distracteursPossibles.push(fDe0)
    }

    // Distracteur 2 : -b/a (erreur classique) - seulement si entier
    const distracteur2 = -f.b.valeurDecimale / f.a.valeurDecimale
    if (
      distracteur2 !== bonneReponse &&
      distracteur2 !== autreRacine &&
      Number.isInteger(distracteur2) &&
      !distracteursPossibles.includes(distracteur2)
    ) {
      distracteursPossibles.push(distracteur2)
    }

    // Distracteur 3 : alpha (abscisse du sommet) - seulement si entier
    const distracteur3 = f.alpha.valeurDecimale
    if (
      distracteur3 !== bonneReponse &&
      distracteur3 !== autreRacine &&
      Number.isInteger(distracteur3) &&
      !distracteursPossibles.includes(distracteur3)
    ) {
      distracteursPossibles.push(distracteur3)
    }

    // Compléter avec des distracteurs supplémentaires si nécessaire
    while (distracteursPossibles.length < 3) {
      const nouveauDistracteur = bonneReponse + choice([-1, 1, 2, -2, 3, -3])
      if (
        nouveauDistracteur !== bonneReponse &&
        nouveauDistracteur !== autreRacine &&
        !distracteursPossibles.includes(nouveauDistracteur)
      ) {
        distracteursPossibles.push(nouveauDistracteur)
      }
    }

    const distracteurs = distracteursPossibles.slice(0, 3)

    this.reponses = [`$${bonneReponse}$`, ...distracteurs.map((d) => `$${d}$`)]

    // Correction : on teste chaque réponse
    this.correction = `Pour trouver un antécédent de $0$, il suffit de tester chaque proposition en calculant son image :<br>`

    for (let i = 0; i < this.reponses.length; i++) {
      // Extraire la valeur numérique de la réponse
      const valeur = i === 0 ? bonneReponse : distracteurs[i - 1]

      // Calculer l'image
      this.correction += `$\\bullet$ Pour $x=${valeur}$ :<br>
      $f(${valeur})=${f.texCalculImage(valeur)}$<br>`
    }

    this.correction += `Donc, ${texteEnCouleurEtGras(`le nombre $${bonneReponse}$ est un antécédent de $0$ par la fonction $f$`)}.`
    this.preparerQuestionOuverte(f)
  }

  versionOriginale = () => {
    // Pour la version originale, on utilise directement la forme développée
    const f = new Trinome(2, -5, 3)

    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${f.tex}$.<br>
    ${this.sup3 || context.isAmc ? 'Un antécédent de $0$ par la fonction $f$ est :' : 'Déterminer un antécédent de $0$ par la fonction $f$.'}`

    // Les racines sont 1 et 3/2, on choisit 1 comme bonne réponse
    const bonneReponse = 1
    const distracteurs = [-1, 0, 3]

    this.reponses = [`$${bonneReponse}$`, ...distracteurs.map((d) => `$${d}$`)]

    // Correction : on teste chaque réponse
    this.correction = `Pour trouver un antécédent de $0$, il suffit de tester chaque proposition en calculant son image :<br>`

    const toutesLesValeurs = [bonneReponse, ...distracteurs]
    for (const valeur of toutesLesValeurs) {
      this.correction += `$\\bullet$ Pour $x=${valeur}$ :<br>
      $f(${valeur})=${f.texCalculImage(valeur)}$<br>`
    }

    this.correction += `Donc, ${texteEnCouleurEtGras(`le nombre $${bonneReponse}$ est un antécédent de $0$ par la fonction $f$`)}.`
    this.preparerQuestionOuverte(f)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const a = randint(1, 4) * choice([-1, 1])
      const x1 = randint(-5, 5, 0) // x1 ≠ 0
      const x2 = randint(-5, 5, [0, x1, -x1]) // x2 ≠ 0

      this.appliquerLesValeurs({ a, x1, x2 })
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  private preparerQuestionOuverte(f: Trinome) {
    // Limiter le calcul à de petits entiers, avec un cas vrai et un cas faux si possible.
    const valeursSimples = [1, -1, 2, -2, 0]
    const antecedentSimple = valeursSimples.find(
      (valeur) => f.image(valeur).valeurDecimale === 0,
    )
    const nonAntecedentSimple = valeursSimples.find(
      (valeur) => f.image(valeur).valeurDecimale !== 0,
    )!
    this.questionsOuvertes.set(this.enonce, {
      fonction: f,
      candidats:
        antecedentSimple === undefined
          ? [1, -1]
          : [antecedentSimple, nonAntecedentSimple],
    })
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    // Conserver les tirages du générateur, puis remplacer l'affichage du QCM.
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      const valeur = choice(donnees.candidats)
      const valeurTex = texNombre(valeur)
      const estAntecedent = donnees.fonction.image(valeur).valeurDecimale === 0
      const question = enonce.replace(
        'Déterminer un antécédent de $0$ par la fonction $f$.',
        `Le nombre $${valeurTex}$ est-il un antécédent de $0$ par la fonction $f$ ? Justifier la réponse.`,
      )
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            'Déterminer un antécédent de $0$ par la fonction $f$.',
            `Le nombre $${valeurTex}$ ${choixDeroulant(this, i, {
              choices: [
                { label: 'Choisir', value: '' },
                { label: 'est', value: 'est' },
                { label: 'n’est pas', value: 'nest' },
              ],
            })} un antécédent de $0$ par la fonction $f$.`,
          )
        : question
      this.listeCorrections[i] = `On calcule l'image de $${valeurTex}$ :<br>
      $f(${valeurTex})=${donnees.fonction.texCalculImage(valeur)}$.<br>
      On obtient $f(${valeurTex})${estAntecedent ? '=' : '\\neq'}0$.<br>
      ${texteEnCouleurEtGras(`Le nombre $${valeurTex}$ ${estAntecedent ? 'est' : 'n’est pas'} un antécédent de $0$ par la fonction $f$`)}.`
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: this.interactif
              ? estAntecedent
                ? 'est'
                : 'nest'
              : estAntecedent
                ? 'oui'
                : 'non',
            options: { texteSansCasse: true },
          },
        },
        {
          formatInteractif: this.interactif
            ? 'liste-deroulante'
            : 'mathalea-mathfield',
        },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.versionAleatoire()
  }
}
