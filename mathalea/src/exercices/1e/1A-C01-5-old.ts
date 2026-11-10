// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 32014 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '32014'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer avec des fonctions de référence'
export const dateDePublication = '03/04/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC1eOld extends ExerciceQcmA {
  private appliquerLesValeurs(cas: number): void {
    let texEnonce: string
    let bonnes: { tex: string; justif: string }[]
    let mauvaises: { tex: string; justif: string }[]

    switch (cas) {
      case 1: {
        // 0 < a < b
        texEnonce =
          `On considère deux réels $a$ et $b$ strictement positifs.<br> Si $a < b$ alors${sp()}:`
        bonnes = [
          {
            tex: '$\\dfrac{1}{a} > \\dfrac{1}{b}$',
            justif:
              `La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc elle inverse l'ordre${sp()}: $\\dfrac{1}{a} > \\dfrac{1}{b}$.`,
          },
          {
            tex: '$\\dfrac{1}{a} - \\dfrac{1}{b} > 0$',
            justif:
              'La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc $\\dfrac{1}{a} > \\dfrac{1}{b}$, soit $\\dfrac{1}{a} - \\dfrac{1}{b} > 0$.',
          },
          {
            tex: '$a^2 < b^2$',
            justif:
              'La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 < b^2$.',
          },
          {
            tex: '$\\sqrt{a} < \\sqrt{b}$',
            justif:
              'La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} < \\sqrt{b}$.',
          },
          {
            tex: '$-a > -b$',
            justif:
              `En multipliant par $-1$, on change le sens de l'inégalité${sp()}: $-a > -b$.`,
          },
          {
            tex: '$a - b < 0$',
            justif: 'Comme $a < b$, on a $a - b < 0$.',
          },
          {
            tex: '$b - a > 0$',
            justif: 'Comme $a < b$, on a $b - a > 0$.',
          },
        ]
        mauvaises = [
          {
            tex: '$\\dfrac{1}{a} < \\dfrac{1}{b}$',
            justif:
              `Faux. La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc elle inverse l'ordre${sp()}: $\\dfrac{1}{a} > \\dfrac{1}{b}$.`,
          },
          {
            tex: '$\\dfrac{1}{a} - \\dfrac{1}{b} < 0$',
            justif:
              'Faux. Comme $\\dfrac{1}{a} > \\dfrac{1}{b}$, on a $\\dfrac{1}{a} - \\dfrac{1}{b} > 0$.',
          },
          {
            tex: '$a^2 > b^2$',
            justif:
              'Faux. La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 < b^2$.',
          },
          {
            tex: '$\\sqrt{a} > \\sqrt{b}$',
            justif:
              'Faux. La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} < \\sqrt{b}$.',
          },
          {
            tex: '$-a < -b$',
            justif:
              `Faux. En multipliant par $-1$, on change le sens${sp()}: $-a > -b$.`,
          },
          {
            tex: '$a - b > 0$',
            justif: 'Faux. Comme $a < b$, on a $a - b < 0$.',
          },
          {
            tex: '$b - a < 0$',
            justif: 'Faux. Comme $a < b$, on a $b - a > 0$.',
          },
        ]
        break
      }

      case 2: {
        // a > b > 0
        texEnonce =
          `On considère deux réels $a$ et $b$ strictement positifs.<br> Si $a > b$ alors${sp()}:`
        bonnes = [
          {
            tex: '$\\dfrac{1}{a} < \\dfrac{1}{b}$',
            justif:
              `La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc elle inverse l'ordre${sp()}: $\\dfrac{1}{a} < \\dfrac{1}{b}$.`,
          },
          {
            tex: '$\\dfrac{1}{b} - \\dfrac{1}{a} > 0$',
            justif:
              'La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc $\\dfrac{1}{a} < \\dfrac{1}{b}$, soit $\\dfrac{1}{b} - \\dfrac{1}{a} > 0$.',
          },
          {
            tex: '$a^2 > b^2$',
            justif:
              'La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 > b^2$.',
          },
          {
            tex: '$\\sqrt{a} > \\sqrt{b}$',
            justif:
              'La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} > \\sqrt{b}$.',
          },
          {
            tex: '$-a < -b$',
            justif:
              `En multipliant par $-1$, on change le sens de l'inégalité${sp()}: $-a < -b$.`,
          },
          {
            tex: '$a - b > 0$',
            justif: 'Comme $a > b$, on a $a - b > 0$.',
          },
          {
            tex: '$b - a < 0$',
            justif: 'Comme $a > b$, on a $b - a < 0$.',
          },
        ]
        mauvaises = [
          {
            tex: '$\\dfrac{1}{a} > \\dfrac{1}{b}$',
            justif:
              'Faux. La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc $\\dfrac{1}{a} < \\dfrac{1}{b}$.',
          },
          {
            tex: '$\\dfrac{1}{b} - \\dfrac{1}{a} < 0$',
            justif:
              'Faux. Comme $\\dfrac{1}{a} < \\dfrac{1}{b}$, on a $\\dfrac{1}{b} - \\dfrac{1}{a} > 0$.',
          },
          {
            tex: '$a^2 < b^2$',
            justif:
              'Faux. La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 > b^2$.',
          },
          {
            tex: '$\\sqrt{a} < \\sqrt{b}$',
            justif:
              'Faux. La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} > \\sqrt{b}$.',
          },
          {
            tex: '$-a > -b$',
            justif:
              `Faux. En multipliant par $-1$, on change le sens${sp()}: $-a < -b$.`,
          },
          {
            tex: '$a - b < 0$',
            justif: 'Faux. Comme $a > b$, on a $a - b > 0$.',
          },
          {
            tex: '$b - a > 0$',
            justif: 'Faux. Comme $a > b$, on a $b - a < 0$.',
          },
        ]
        break
      }

      case 3: {
        // 0 < a < 1
        texEnonce =
          `On considère un réel $a$ tel que $0 < a < 1$. <br>On a alors${sp()}:`
        bonnes = [
          {
            tex: '$a^2 < a$',
            justif:
              'En multipliant $0 < a < 1$ par $a > 0$, on obtient $0 < a^2 < a$, donc $a^2 < a$.',
          },
          {
            tex: '$\\dfrac{1}{a} > 1$',
            justif:
              `La fonction inverse est décroissante sur $]0\\,;+\\infty[$${sp()}: comme $0 < a < 1$, on obtient $\\dfrac{1}{a} > 1$.`,
          },
          {
            tex: '$\\dfrac{1}{a} > a$',
            justif:
              'Comme $\\dfrac{1}{a} > 1$ et $a < 1$, on a $\\dfrac{1}{a} > 1 > a$.',
          },
          {
            tex: '$\\sqrt{a} > a$',
            justif:
              `Comme $0 < \\sqrt{a} < 1$, en multipliant par $\\sqrt{a}$${sp()}: $(\\sqrt{a})^2 = a < \\sqrt{a}$, donc $\\sqrt{a} > a$.`,
          },
        ]
        mauvaises = [
          {
            tex: '$a^2 > a$',
            justif: `Faux. En multipliant $0 < a < 1$ par $a > 0$${sp()}: $a^2 < a$.`,
          },
          {
            tex: '$\\dfrac{1}{a} < 1$',
            justif:
              `Faux. La fonction inverse est décroissante${sp()}: comme $0 < a < 1$, on a $\\dfrac{1}{a} > 1$.`,
          },
          {
            tex: '$\\dfrac{1}{a} < a$',
            justif:
              'Faux. Comme $\\dfrac{1}{a} > 1 > a$, on a $\\dfrac{1}{a} > a$.',
          },
          {
            tex: '$\\sqrt{a} < a$',
            justif:
              'Faux. Comme $0 < \\sqrt{a} < 1$, on a $(\\sqrt{a})^2 = a < \\sqrt{a}$, donc $\\sqrt{a} > a$.',
          },
        ]
        break
      }

      case 4: {
        // a > 1
        texEnonce = `On considère un réel $a$ tel que $a > 1$. <br>On a alors${sp()}:`
        bonnes = [
          {
            tex: '$a^2 > a$',
            justif: `En multipliant $a > 1$ par $a > 0$${sp()}: $a^2 > a$.`,
          },
          {
            tex: '$\\dfrac{1}{a} < 1$',
            justif:
              `La fonction inverse est décroissante sur $]0\\,;+\\infty[$${sp()}: comme $a > 1$, on obtient $\\dfrac{1}{a} < 1$.`,
          },
          {
            tex: '$a^2 > 1$',
            justif: `En multipliant $a > 1$ par $a > 0$${sp()}: $a^2 > a > 1$.`,
          },
          {
            tex: '$\\sqrt{a} > 1$',
            justif:
              `La fonction racine carrée est croissante${sp()}: comme $a > 1$, $\\sqrt{a} > \\sqrt{1} = 1$.`,
          },
        ]
        mauvaises = [
          {
            tex: '$a^2 < a$',
            justif: `Faux. En multipliant $a > 1$ par $a > 0$${sp()}: $a^2 > a$.`,
          },
          {
            tex: '$\\dfrac{1}{a} > 1$',
            justif:
              `Faux. La fonction inverse est décroissante${sp()}: comme $a > 1$, on a $\\dfrac{1}{a} < 1$.`,
          },
          {
            tex: '$a^2 < 1$',
            justif: 'Faux. Comme $a^2 > a > 1$, on a $a^2 > 1$.',
          },
          {
            tex: '$\\sqrt{a} < 1$',
            justif: 'Faux. Comme $a > 1$, $\\sqrt{a} > 1$.',
          },
        ]
        break
      }
    }

    this.enonce = texEnonce!

    // On pioche 1 bonne réponse et 3 mauvaises réponses distinctes
    const bonne = choice(bonnes!)
    const mauvaisesChoisies: { tex: string; justif: string }[] = []
    const copie = [...mauvaises!]
    while (mauvaisesChoisies.length < 3) {
      const m = choice(copie)
      mauvaisesChoisies.push(m)
      copie.splice(copie.indexOf(m), 1)
    }

    this.reponses = [
      bonne.tex,
      mauvaisesChoisies[0].tex,
      mauvaisesChoisies[1].tex,
      mauvaisesChoisies[2].tex,
    ]

    // Construction de la correction ciblée sur les 4 propositions affichées
    this.correction = `La bonne réponse est $${miseEnEvidence(bonne.tex.replace(/\$/g, ''))}$.<br>
${bonne.justif}<br><br>
Pour les autres propositions${sp()}:<br>
${mauvaisesChoisies[0].tex}${sp()}: ${mauvaisesChoisies[0].justif}<br>
${mauvaisesChoisies[1].tex}${sp()}: ${mauvaisesChoisies[1].justif}<br>
${mauvaisesChoisies[2].tex}${sp()}: ${mauvaisesChoisies[2].justif}`
  }

  versionOriginale: () => void = () => {
    // Image : 0 < a < b, bonne réponse 1/a > 1/b, distracteurs : -a < -b, 1/a - 1/b < 0, a² > b²
    this.enonce =
      `On considère deux réels $a$ et $b$ strictement positifs.<br> Si $a < b$ alors${sp()}:`

    this.reponses = [
      '$ \\dfrac{1}{b}-\\dfrac{1}{a} < 0$',
      '$-a < -b$',
      '$\\dfrac{1}{a} - \\dfrac{1}{b} < 0$',
      '$a^2 > b^2$',
    ]

    this.correction = `La bonne réponse est $${miseEnEvidence('\\dfrac{1}{b}-\\dfrac{1}{a} < 0')}$.<br>
La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc elle inverse l'ordre${sp()}: $\\dfrac{1}{a} > \\dfrac{1}{b}$ soit $ \\dfrac{1}{b}-\\dfrac{1}{a} < 0$.<br><br>
Pour les autres propositions${sp()}:<br>
$-a < -b$${sp()}: Faux. En multipliant par $-1$, on change le sens${sp()}: $-a > -b$.<br>
$\\dfrac{1}{a} - \\dfrac{1}{b} < 0$${sp()}: Faux. Comme $\\dfrac{1}{a} > \\dfrac{1}{b}$, on a $\\dfrac{1}{a} - \\dfrac{1}{b} > 0$.<br>
$a^2 > b^2$${sp()}: Faux. La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 < b^2$.`
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const cas = randint(1, 4)
      this.appliquerLesValeurs(cas)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut penser aux fonctions de référence, en particulier${sp()}:
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
     <li>repérer l'intervalle concerné par les valeurs de l'énoncé et faire le lien avec l'ensemble de définition de la fonction de référence utilisée;</li>
     <li>utiliser les variations de la <strong>fonction carré</strong> , <strong>fonction inverse</strong>, <strong>fonction racine carrée</strong>, ... selon les cas;</li>
    <li>se rappeler si besoin que multiplier une inégalité par un nombre négatif change le sens de l'inégalité.</li>
  </ul>
  <a href="https://podeduc.apps.education.fr/video/143477-indice-automatisme-1-c01-1mp4/?is_iframe=true&autoplay=true" target="_blank"
     style="display:inline-flex; align-items:center; gap:6px;
            padding:6px 14px; border:1px solid #b3cde8; border-radius:6px;
            font-size:13px; font-weight:500; color:#1a5fa8;
            background:#e8f1fb; text-decoration:none;">
            
    ▶ Voir la vidéo explicative
  </a>`
    this.versionAleatoire()
  }
}
