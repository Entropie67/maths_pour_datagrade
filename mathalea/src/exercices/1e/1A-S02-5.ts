import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '12594'
export const refs = {
  'fr-fr': ['1A-S02-5', '2A-S2-5'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Déterminer la moyenne d'une série rangée en classes"
export const dateDePublication = '05/08/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 * @author Stéphane Guyon
 */

export default class MoyenneClasseQCM extends ExerciceQcmACourt {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(): void {
    const valeurInferieure = randint(2, 4) // valeur inférieure de la première classe
    const pas = choice([2, 4]) // pas de la classe
    const nombreClasses = 2 // nombre de classes
    let effectifs = []

    // Génère un tableau d'effectifs de longueur nombreClasses, avec des valeurs aléatoires entre 1 et 7
    effectifs = Array.from({ length: nombreClasses }, () => randint(3, 7))
    if (effectifs[0] === effectifs[1]) {
      effectifs[1] = randint(3, 7, effectifs[0])
    }
    // Génère les bornes des classes sous forme de chaînes '[a ; b['
    const classes = [
      `[${valeurInferieure} ; ${valeurInferieure + pas}[`,
      `[${valeurInferieure + pas} ; ${valeurInferieure + 2 * pas}[`,
    ]

    // On choisit les effectifs pour que la moyenne soit un entier
    // On fixe la somme des produits centre[i] * effectifs[i] pour que, divisée par sommeEffectifs, ça donne un entier
    // On choisit un entier cible pour la moyenne
    // const moyenneCible = randint(valeurInferieure + pas/2, valeurInferieure + 2 * pas)
    // On choisit des effectifs aléatoires sauf le dernier, qu'on ajuste pour que la moyenne soit entière
    const effectifs1 = randint(1, 7)
    const effectifs2 = randint(1, 7, effectifs1)
    effectifs = [effectifs1, effectifs2]
    const centres = [
      valeurInferieure + pas / 2,
      valeurInferieure + (3 * pas) / 2,
    ]

    const sommePartielle = effectifs1 * centres[0] + effectifs2 * centres[1]
    const sommeEffPartielle = effectifs1 + effectifs2
    const moyenne = sommePartielle / sommeEffPartielle
    // ⚠️ Test de sécurité
    if (!Number.isInteger(moyenne) || moyenne < 1 || moyenne > 10)
      return this.appliquerLesValeurs()

    // On crée le tableau de répartition des tailles
    // On utilise tableauColonneLigne pour créer un tableau avec les classes et les effectifs
    // tableauColonneLigne prend en premier argument un tableau de titres de colonnes,
    // en second argument un tableau de titres de lignes, et en troisième argument un tableau de valeurs
    // Ici, on utilise les classes comme titres de colonnes et 'Effectifs' comme titre de ligne
    // On utilise les effectifs comme valeurs
    const tableau = tableauColonneLigne(
      ['\\text{Taille}', ...classes],
      ['\\text{Effectifs}'],
      [...effectifs],
    )
    const distracteur1 = Number(
      effectifs.reduce((a, b) => a + b, 0) / effectifs.length,
    )
    const distracteur2 = moyenne + (randint(-1, 1, 0) * randint(1, 3, 2)) / 2
    let distracteur3
    do {
      distracteur3 = moyenne + randint(-2, 2, 0)
    } while (distracteur3 === distracteur1)
    this.reponses = [
      `$${moyenne}$`,
      `  $${distracteur1}$`,
      `  $${texNombre(distracteur2)}$`,
      `  $${texNombre(distracteur3)}$`,
    ]

    this.enonce = `On donne ci-dessous le tableau de répartition des tailles de plants d'une serre, rangées en classes.
 <br><br> ${tableau}
 <br><br> Les tailles sont exprimées en centimètres.<br>
  Quelle est la taille moyenne en $\\text{cm}$ des plants de cette serre ?`
    this.correction = `Pour calculer la taille d'une série rangée en classes, on calcule d'abord la valeur centrale de chaque classe :<br>
    La première classe a pour centre $\\dfrac{${valeurInferieure} + ${valeurInferieure + pas}}{2} = ${valeurInferieure + pas / 2}\\text{ cm}$.<br>
    La seconde classe a pour centre $\\dfrac{${valeurInferieure + pas} + ${valeurInferieure + 2 * pas}}{2} = ${valeurInferieure + (3 * pas) / 2}\\text{ cm}$.<br>
    On calcule ensuite la moyenne pondérée des tailles, en multipliant chaque centre de classe par l'effectif de la classe correspondante, puis en divisant par la somme des effectifs :<br>
    $\\dfrac{${effectifs[0]} \\times ${centres[0]} + ${effectifs[1]} \\times ${centres[1]}}{${effectifs[0]} + ${effectifs[1]}} = \\dfrac{${sommePartielle}}{${sommeEffPartielle}} = ${moyenne}$ .<br><br>
     La taille moyenne des plants de cette serre est donc de $${miseEnEvidence(moyenne)}\\text{ cm}$.`
    this.reponse = `${moyenne}`
  }

  versionAleatoire: () => void = () => {
    const n = 4 // nombre de réponses différentes voulues (on rappelle que la première réponse est la bonne)
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.texteApresReponseCourte = ' cm'

    this.versionAleatoire()
  }
}
