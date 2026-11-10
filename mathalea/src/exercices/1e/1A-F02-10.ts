import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const titre =
  "Calculer l'ordonnée d'un point sur une droite (non définie explicitement)"
export const dateDePublication = '07/01/2026'
export const dateDeModifImportante = '21/10/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2F20-02 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'ab46f'

export const refs = {
  'fr-fr': ['1A-F02-10'],
  'fr-ch': ['1mQCM-39', '11CTQCMFA2-4', '11LCQCMFA2A-4', '11LSQCMFA2A-6'],
}
export default class AutoFO2j extends ExerciceQcmA {
  private questionsOuvertes = new Map<
    string,
    { correction: string; reponse: string }
  >()

  appliquerLesValeurs = (valeurs: {
    m: number
    xConnu: number
    yConnu: number
    b: number
    xDemande: number
    bonneReponse: number
    distracteur1: number
    distracteur2: number
    distracteur3: number
  }) => {
    const {
      m,
      xConnu,
      yConnu,
      b,
      xDemande,
      bonneReponse,
      distracteur1,
      distracteur2,
      distracteur3,
    } = valeurs

    // Énoncé
    this.enonce = `Soit $g$ la fonction affine définie sur $\\mathbb{R}$ par : $g(x)=${rienSi1(m)}x+b$.<br>
    On note $\\mathscr{D}$ sa courbe représentative dans un repère.<br>
    On sait que $A(${xConnu}~;~${yConnu})$ appartient à $\\mathscr{D}$.<br>
   L'ordonnée du point de $\\mathscr{D}$ dont l'abscisse est $${xDemande}$ est :`

    // Correction
    this.correction = `On cherche d'abord la valeur de $b$ en utilisant la condition donnée dans l'énoncé.<br>
    $A(${xConnu}~;~${yConnu})$ appartient à $\\mathscr{D}$ signifie que $g(${xConnu})=${yConnu}$.<br>
    $\\begin{aligned}
    g(${xConnu})&=${yConnu}\\\\
    ${m === 1 ? `${xConnu}` : `${m}\\times ${ecritureParentheseSiNegatif(xConnu)}`}+b&=${yConnu}\\\\
    ${m * xConnu}+b&=${yConnu}\\\\
    b&=${yConnu}${m * xConnu >= 0 ? '-' : '+'}${Math.abs(m * xConnu)}\\\\
    b&=${b}
    \\end{aligned}$<br>
    
    On a donc $g(x)=${rienSi1(m)}x${ecritureAlgebrique(b)}$.<br>
    
    L'image de $${xDemande}$ par cette fonction correspond à l'ordonnée du point de $\\mathscr{D}$ dont l'abscisse est $${xDemande}$ :<br>
    $\\begin{aligned}
    g(${xDemande})&=${m === 1 ? `${xDemande}` : `${m}\\times ${ecritureParentheseSiNegatif(xDemande)}`}${ecritureAlgebrique(b)}\\\\
    ${m === 1 ? '' : `&=${m * xDemande}${ecritureAlgebrique(b)}\\\\`}
    &=${miseEnEvidence(bonneReponse)}
    \\end{aligned}$`

    // Réponses
    this.reponses = [
      `$${bonneReponse}$`,
      `$${distracteur1}$`,
      `$${distracteur2}$`,
      `$${distracteur3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      m: 4,
      xConnu: 1,
      yConnu: 3,
      b: -1,
      xDemande: 0,
      bonneReponse: -1,
      distracteur1: 3,
      distracteur2: 0,
      distracteur3: 4,
    })
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      // Choix du coefficient directeur m
      const m = choice([2, 3, 4, 5, -2, -3])

      // Choix de l'antécédent connu (éviter 0 pour que ce soit intéressant)
      const xConnu = randint(-5, 5, 0)

      // Choix de b (entier, pas de fraction)
      const b = randint(-10, 10)

      // Calcul de l'image connue
      const yConnu = m * xConnu + b

      // Question sur l'image demandée (souvent 0 ou une autre valeur simple)
      const xDemande = choice([
        xConnu + 1,
        xConnu - 1,
        -xConnu,
        randint(-5, 5, xConnu),
      ])
      const bonneReponse = m * xDemande + b

      // Distracteurs plausibles
      const distracteur1 = yConnu // Confusion : réutiliser l'image connue
      const distracteur2 = m * xDemande // Oubli de b
      let distracteur3 = b // Confusion : juste la valeur de b

      // Vérification que tous les distracteurs sont différents de la bonne réponse
      if (distracteur3 === bonneReponse) {
        distracteur3 = bonneReponse + m
      }

      // Vérification qu'on n'a pas de doublons parmi les réponses
      const reponses = [bonneReponse, distracteur1, distracteur2, distracteur3]
      const uniqueReponses = new Set(reponses)

      // Si on a des doublons, on régénère en modifiant légèrement
      if (uniqueReponses.size < 4) {
        return this.versionAleatoire()
      }

      this.appliquerLesValeurs({
        m,
        xConnu,
        yConnu,
        b,
        xDemande,
        bonneReponse,
        distracteur1,
        distracteur2,
        distracteur3,
      })
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  nouvelleVersion() {
    this.questionsOuvertes.clear()
    super.nouvelleVersion()
    if (this.sup3 || context.isAmc) return
    this.consigne = ''
    for (let i = 0; i < this.listeQuestions.length; i++) {
      const enonce = this.autoCorrection[i].enonce ?? ''
      const donnees = this.questionsOuvertes.get(enonce)
      if (!donnees) continue
      this.listeQuestions[i] = this.interactif
        ? enonce.replace(
            /Déterminer l'ordonnée (du point de \$\\mathscr\{D\}\$ dont l'abscisse est \$.*?\$)\./,
            (_, fin) =>
              `L'ordonnée ${fin} est ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}.`,
          )
        : enonce
      this.listeCorrections[i] = donnees.correction
      handleAnswers(
        this,
        i,
        { reponse: { value: donnees.reponse } },
        { formatInteractif: 'mathalea-mathfield' },
      )
    }
  }

  constructor() {
    super()
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    const preparerQuestion = () => {
      if (this.sup3 || context.isAmc) return
      this.enonce = this.enonce.replace(
        /L'ordonnée (du point de \$\\mathscr\{D\}\$ dont l'abscisse est \$.*?\$) est :/,
        "Déterminer l'ordonnée $1.",
      )
      this.questionsOuvertes.set(this.enonce, {
        correction: this.correction ?? '',
        reponse: this.reponses[0].replace(/\$/g, '').trim(),
      })
    }
    const aleatoire = this.versionAleatoire
    this.versionAleatoire = () => {
      aleatoire()
      preparerQuestion()
    }
    const originale = this.versionOriginale
    this.versionOriginale = () => {
      originale()
      preparerQuestion()
    }
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
