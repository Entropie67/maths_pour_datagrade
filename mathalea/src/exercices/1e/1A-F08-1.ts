import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
export const dateDePublication = '28/08/2025'
export const dateDeModifImportante = '22/10/2026'

export const uuid = '7092d'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora +claude
 *
 */
export const refs = {
  'fr-fr': ['1A-F08-1'],
  'fr-ch': ['1mQCM-67', '11CTQCMFA2-10', '11LCQCMFA2A-8', '11LSQCMFA2A-13'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Déterminer une image par une fonction affine sans son expression'
export default class AutoF3a extends ExerciceQcmACourt {
  clavierReponseCourte = KeyboardType.clavierDeBase
  private enonceFonction = ''
  private xDemande = 0
  // Hors interactif, la question n'a pas de champ pour la porter
  enonceCourt = () =>
    this.enonceFonction +
    (this.interactif
      ? ''
      : `<br>Déterminer l'image de $${this.xDemande}$ par $f$.`)

  appliquerLesValeurs = (valeurs: {
    x1: number
    x2: number
    y1: number
    y2: number
    m: number
    p: number
    xDemande: number
    bonneReponse: number
    sommeDesImages: number
    distracteur2: number
    distracteur3: number
  }) => {
    const {
      x1,
      x2,
      y1,
      y2,
      m,
      p,
      xDemande,
      bonneReponse,
      sommeDesImages,
      distracteur2,
      distracteur3,
    } = valeurs

    // Énoncé
    this.enonceFonction = `On considère une fonction affine $f$ telle que $f(${x1})=${y1}$ et $f(${x2})=${y2}$.`
    this.xDemande = xDemande
    // En saisie libre, la question est portée par le texte placé avant le champ
    this.texteAvantReponseCourte = `<br>$f(${xDemande})=$`
    this.enonce = `${this.enonceFonction}<br>
    L'image de $${xDemande}$ par cette fonction affine est :`

    // Correction
    this.correction = `$f$ est une fonction affine, elle est donc de la forme $f(x)=mx+p$.<br>
     
    $\\begin{aligned}
    m&=\\dfrac{f(${x2})-f(${x1})}{${x2}-${ecritureParentheseSiNegatif(x1)}}\\\\
    &=\\dfrac{${y2}${y1 >= 0 ? '-' : '+'}${Math.abs(y1)}}{${x2 - x1}}\\\\
    &=${m}
    \\end{aligned}$<br>
    On a donc $f(x)=${rienSi1(m)}x+p$.<br> Pour déterminer $p$, on utilise la valeur de $f(${x1})$ :<br>
    $\\begin{aligned}
    f(${x1})&=${m === 1 ? `${x1}` : `${m}\\times ${ecritureParentheseSiNegatif(x1)}`}+p\\\\
    ${y1}&=${m * x1}+p\\\\
    p&=${p}
    \\end{aligned}$<br>
    On a donc $f(x)=${rienSi1(m)}x${ecritureAlgebrique(p)}$.<br>
    
    L'image de $${xDemande}$ par cette fonction est :<br>
    $\\begin{aligned}
    f(${xDemande})&=${m === 1 ? `${xDemande}` : `${m}\\times ${ecritureParentheseSiNegatif(xDemande)}`}  ${ecritureAlgebrique(p)}\\\\
    ${m === 1 ? '' : `&=${m * xDemande}${ecritureAlgebrique(p)}\\\\`} 
    &=${miseEnEvidence(bonneReponse)}
    \\end{aligned}$`

    // Réponses
    this.reponses = [
      `$${bonneReponse}$`,
      `$${sommeDesImages}$`,
      `$${distracteur2}$`,
      `$${distracteur3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      x1: 2,
      x2: 5,
      y1: 7,
      y2: 13,
      m: 2,
      p: 3,
      xDemande: 7,
      bonneReponse: 17,
      sommeDesImages: 20,
      distracteur2: 23,
      distracteur3: 14,
    })
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      // Choix des antécédents (simples pour faciliter les calculs)
      const x1 = randint(-5, 5, 0)
      const x2 = randint(x1 + 2, x1 + 5, 0) // Assure que x2 > x1

      // Choix du coefficient directeur m (valeurs simples)
      const m = choice([1, 2, 3, -1, -2])

      // Choix de l'ordonnée à l'origine p (valeurs simples)
      let p = randint(-5, 10)

      // Calcul des images correspondantes
      let y1 = m * x1 + p
      let y2 = m * x2 + p

      // Question sur l'image de la somme des antécédents
      const xDemande = x1 + x2
      let bonneReponse = m * xDemande + p
      let sommeDesImages = y1 + y2

      // Vérification que la bonne réponse n'est pas égale à la somme des images
      // Si c'est le cas, on ajuste légèrement les valeurs
      if (bonneReponse === sommeDesImages) {
        // On change p pour éviter cette égalité
        p = p + choice([-2, -1, 1, 2])
        y1 = m * x1 + p
        y2 = m * x2 + p
        bonneReponse = m * xDemande + p
        sommeDesImages = y1 + y2
      }

      // Autres distracteurs plausibles
      const distracteur2 = bonneReponse + (y2 - y1) // Erreur en ajoutant la pente
      const distracteur3 = m * xDemande // Oubli de l'ordonnée à l'origine

      this.appliquerLesValeurs({
        x1,
        x2,
        y1,
        y2,
        m,
        p,
        xDemande,
        bonneReponse,
        sommeDesImages,
        distracteur2,
        distracteur3,
      })
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.versionAleatoire()
  }
}
