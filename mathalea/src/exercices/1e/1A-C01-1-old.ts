// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6d860 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '6d860'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer deux nombres'
export const dateDePublication = '02/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC1aOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    choixType: number,
    a1: number,
    b1: number,
    c1: number,
    d1: number,
    e1: number,
    f1: number,
    g1: number,
    h1: number,
  ): void {
    const aStr1 = texNombre(-a1, 4) // -a plus grand
    const bStr1 = texNombre(-b1, 4) // -b plus petit

    // Création des fausses réponses réutilisables
    const fausseReponse1 = `$(${aStr1})^2>(${bStr1})^2$ est fausse car la fonction carré est strictement décroissante sur $]-\\infty\\,;\\,0]$, 
        on a :  $(${aStr1})^2 < (${bStr1})^2$ car $${aStr1} > ${bStr1}$.<br>`
    const fausseReponse2 = `$\\dfrac{1}{${texNombre(c1, 3)}}<\\dfrac{1}{${texNombre(d1, 3)}}$ est fausse car la fonction inverse est strictement décroissante sur $]0\\,;\\,+\\infty[$, donc $\\dfrac{1}{${texNombre(c1, 3)}} > \\dfrac{1}{${texNombre(d1, 3)}}$ car $${texNombre(c1, 3)}<${texNombre(d1, 3)}$.<br>`
    const fausseReponse3 = `$${texNombre(g1, 3)}^2>${texNombre(h1, 3)}^2$ est fausse car la fonction carré est strictement croissante sur $[0\\,;\\,+\\infty[$, donc $${texNombre(g1, 3)}^2<${texNombre(h1, 3)}^2$ car $${texNombre(g1, 3)}<${texNombre(h1, 3)}$.<br>`
    const fausseReponse4 = `$\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2>\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$ est fausse car la fonction carré est strictement croissante sur $]0\\,;\\,+\\infty[$, donc $\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2<\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$ car $\\dfrac{1}{${texNombre(f1, 4)}} < \\dfrac{1}{${texNombre(e1, 4)}}$.<br>`

    this.enonce = `La seule inégalité vraie est : `
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut penser aux fonctions de référence, en particulier :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>utiliser les variations de la <strong>fonction carré</strong> ;</li>
    <li>utiliser les variations de la <strong>fonction inverse</strong>.</li>
  </ul>
  <a href="https://podeduc.apps.education.fr/video/143477-indice-automatisme-1-c01-1mp4/?is_iframe=true&autoplay=true" target="_blank"
     style="display:inline-flex; align-items:center; gap:6px;
            padding:6px 14px; border:1px solid #b3cde8; border-radius:6px;
            font-size:13px; font-weight:500; color:#1a5fa8;
            background:#e8f1fb; text-decoration:none;">
    ▶ Voir la vidéo explicative
  </a>`

    switch (choixType) {
      case 1: // Fonction carré (nombres négatifs)
        this.correction = `La seule inégalité vraie est : $${miseEnEvidence(`(${aStr1})^2 < (${bStr1})^2`)}$.<br>
        En effet, la fonction carré étant strictement décroissante sur $]-\\infty\\,;\\,0]$, 
        on a : $(${aStr1})^2 < (${bStr1})^2$ car $${aStr1} > ${bStr1}$.<br><br>
        Concernant les autres propositions :<br>
        ${fausseReponse2}
        ${fausseReponse3}
        ${fausseReponse4}`

        this.reponses = [
          `$(${aStr1})^2<(${bStr1})^2$`,
          `$\\dfrac{1}{${texNombre(c1, 3)}} < \\dfrac{1}{${texNombre(d1, 3)}}$`,
          `$${texNombre(g1, 3)}^2>${texNombre(h1, 3)}^2$`,
          `$\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2>\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$`,
        ]
        break

      case 2: // Fonction inverse (nombres positifs)
        this.correction = `La seule inégalité vraie est : $${miseEnEvidence(`\\dfrac{1}{${texNombre(c1, 3)}}>\\dfrac{1}{${texNombre(d1, 3)}}`)}$.<br>
        En effet, la fonction inverse étant strictement décroissante sur $]0\\,;\\,+\\infty[$, donc $\\dfrac{1}{${texNombre(c1, 3)}} > \\dfrac{1}{${texNombre(d1, 3)}}$ car $${texNombre(c1, 3)}<${texNombre(d1, 3)}$.<br><br>
        Concernant les autres propositions :<br>
        ${fausseReponse1}
        ${fausseReponse3}
        ${fausseReponse4}`

        this.reponses = [
          `$\\dfrac{1}{${texNombre(c1, 3)}} > \\dfrac{1}{${texNombre(d1, 3)}}$`,
          `$(${aStr1})^2>(${bStr1})^2$`,
          `$${texNombre(g1, 3)}^2>${texNombre(h1, 3)}^2$`,
          `$\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2>\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$`,
        ]
        break

      case 3: // Fonction carré (nombres positifs simples)
        this.correction = `La seule inégalité vraie est : $${miseEnEvidence(`${texNombre(g1, 3)}^2<${texNombre(h1, 3)}^2`)}$.<br>
        En effet, la fonction carré étant strictement croissante sur $[0\\,;\\,+\\infty[$, 
        on a : $${texNombre(g1, 3)}^2<${texNombre(h1, 3)}^2$ car $${texNombre(g1, 3)}<${texNombre(h1, 3)}$.<br><br>
        Concernant les autres propositions :<br>
        ${fausseReponse1}
        ${fausseReponse2}
        ${fausseReponse4}`

        this.reponses = [
          `$${texNombre(g1, 3)}^2<${texNombre(h1, 3)}^2$`,
          `$(${aStr1})^2>(${bStr1})^2$`,
          `$\\dfrac{1}{${texNombre(c1, 3)}} < \\dfrac{1}{${texNombre(d1, 3)}}$`,
          `$\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2>\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$`,
        ]
        break

      case 4: // Fonction carré (avec fractions)
      default:
        this.correction = `La seule inégalité vraie est : $${miseEnEvidence(`\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2<\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2`)}$.<br>
        En effet, la fonction carré étant strictement croissante sur $[0\\,;\\,+\\infty[$, 
        on a : $\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2<\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$ car $\\dfrac{1}{${texNombre(f1, 4)}} < \\dfrac{1}{${texNombre(e1, 4)}}$.<br><br>
        Concernant les autres propositions :<br>
        ${fausseReponse1}
        ${fausseReponse2}
        ${fausseReponse3}`

        this.reponses = [
          `$\\left(\\dfrac{1}{${texNombre(f1, 4)}}\\right)^2<\\left(\\dfrac{1}{${texNombre(e1, 4)}}\\right)^2$`,
          `$${texNombre(g1, 3)}^2>${texNombre(h1, 3)}^2$`,
          `$\\dfrac{1}{${texNombre(c1, 3)}} < \\dfrac{1}{${texNombre(d1, 3)}}$`,
          `$(${aStr1})^2>(${bStr1})^2$`,
        ]
        break
    }
  }

  versionOriginale: () => void = () => {
    // Valeurs originales de l'exercice
    this.appliquerLesValeurs(
      1, // choixType : cas de la fonction carré avec nombres négatifs
      1.075, // a1
      1.076, // b1
      2.03, // c1
      2.032, // d1
      3, // e1 (pour 1/3)
      4, // f1 (pour 1/4)
      1.5, // g1 (valeur arbitraire)
      2.0, // h1 (valeur arbitraire)
    )
  }

  versionAleatoire: () => void = () => {
    const choixType = randint(1, 4) // 4 cas différents

    // Génération des nombres aléatoires
    const a1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const b1 = a1 + randint(1, 9) / 100
    const c1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const d1 = c1 + randint(1, 9) / 10 + randint(1, 9) / 100
    const e1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const f1 = e1 + randint(1, 9) / 10 + randint(1, 9) / 100
    const g1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const h1 = g1 + randint(1, 9) / 10 + randint(1, 9) / 100

    this.appliquerLesValeurs(choixType, a1, b1, c1, d1, e1, f1, g1, h1)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }
}
