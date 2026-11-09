import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const uuid = '38339'
export const refs = {
  'fr-fr': ['1A-C01-5'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Comparer avec des fonctions de référence'
export const dateDePublication = '03/04/2026'
export const dateDeModifImportante = '02/10/2026'

type Inegalite = {
  gauche: string
  signe: '<' | '>'
  droite: string
  justif: string
}
type Proposition = { tex: string; justif: string }
type Cas = {
  enonceQcm: string
  hypothese: string
  bonnes: Inegalite[]
  mauvaises: Proposition[]
}

const inverseOrdre = "donc elle inverse l'ordre"
const situations: Cas[] = [
  {
    // 0 < a < b
    enonceQcm:
      `On considère deux réels $a$ et $b$ strictement positifs.<br> Si $a < b$ alors${sp()}:`,
    hypothese:
      'On considère deux réels $a$ et $b$ strictement positifs tels que $a < b$.',
    bonnes: [
      {
        gauche: '\\dfrac{1}{a}',
        signe: '>',
        droite: '\\dfrac{1}{b}',
        justif: `La fonction inverse est décroissante sur $]0\\,;+\\infty[$, ${inverseOrdre}${sp()}: $\\dfrac{1}{a} > \\dfrac{1}{b}$.`,
      },
      {
        gauche: '\\dfrac{1}{a} - \\dfrac{1}{b}',
        signe: '>',
        droite: '0',
        justif:
          'La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc $\\dfrac{1}{a} > \\dfrac{1}{b}$, soit $\\dfrac{1}{a} - \\dfrac{1}{b} > 0$.',
      },
      {
        gauche: 'a^2',
        signe: '<',
        droite: 'b^2',
        justif:
          'La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 < b^2$.',
      },
      {
        gauche: '\\sqrt{a}',
        signe: '<',
        droite: '\\sqrt{b}',
        justif:
          'La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} < \\sqrt{b}$.',
      },
      {
        gauche: '-a',
        signe: '>',
        droite: '-b',
        justif:
          `En multipliant par $-1$, on change le sens de l'inégalité${sp()}: $-a > -b$.`,
      },
      {
        gauche: 'a - b',
        signe: '<',
        droite: '0',
        justif: 'Comme $a < b$, on a $a - b < 0$.',
      },
      {
        gauche: 'b - a',
        signe: '>',
        droite: '0',
        justif: 'Comme $a < b$, on a $b - a > 0$.',
      },
    ],
    mauvaises: [
      {
        tex: '$\\dfrac{1}{a} < \\dfrac{1}{b}$',
        justif: `Faux. La fonction inverse est décroissante sur $]0\\,;+\\infty[$, ${inverseOrdre}${sp()}: $\\dfrac{1}{a} > \\dfrac{1}{b}$.`,
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
        justif: `Faux. En multipliant par $-1$, on change le sens${sp()}: $-a > -b$.`,
      },
      {
        tex: '$a - b > 0$',
        justif: 'Faux. Comme $a < b$, on a $a - b < 0$.',
      },
      {
        tex: '$b - a < 0$',
        justif: 'Faux. Comme $a < b$, on a $b - a > 0$.',
      },
    ],
  },
  {
    // a > b > 0
    enonceQcm:
      `On considère deux réels $a$ et $b$ strictement positifs.<br> Si $a > b$ alors${sp()}:`,
    hypothese:
      'On considère deux réels $a$ et $b$ strictement positifs tels que $a > b$.',
    bonnes: [
      {
        gauche: '\\dfrac{1}{a}',
        signe: '<',
        droite: '\\dfrac{1}{b}',
        justif: `La fonction inverse est décroissante sur $]0\\,;+\\infty[$, ${inverseOrdre}${sp()}: $\\dfrac{1}{a} < \\dfrac{1}{b}$.`,
      },
      {
        gauche: '\\dfrac{1}{b} - \\dfrac{1}{a}',
        signe: '>',
        droite: '0',
        justif:
          'La fonction inverse est décroissante sur $]0\\,;+\\infty[$, donc $\\dfrac{1}{a} < \\dfrac{1}{b}$, soit $\\dfrac{1}{b} - \\dfrac{1}{a} > 0$.',
      },
      {
        gauche: 'a^2',
        signe: '>',
        droite: 'b^2',
        justif:
          'La fonction carré est croissante sur $[0\\,;+\\infty[$, donc $a^2 > b^2$.',
      },
      {
        gauche: '\\sqrt{a}',
        signe: '>',
        droite: '\\sqrt{b}',
        justif:
          'La fonction racine carrée est croissante sur $[0\\,;+\\infty[$, donc $\\sqrt{a} > \\sqrt{b}$.',
      },
      {
        gauche: '-a',
        signe: '<',
        droite: '-b',
        justif:
          `En multipliant par $-1$, on change le sens de l'inégalité${sp()}: $-a < -b$.`,
      },
      {
        gauche: 'a - b',
        signe: '>',
        droite: '0',
        justif: 'Comme $a > b$, on a $a - b > 0$.',
      },
      {
        gauche: 'b - a',
        signe: '<',
        droite: '0',
        justif: 'Comme $a > b$, on a $b - a < 0$.',
      },
    ],
    mauvaises: [
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
        justif: `Faux. En multipliant par $-1$, on change le sens${sp()}: $-a < -b$.`,
      },
      {
        tex: '$a - b < 0$',
        justif: 'Faux. Comme $a > b$, on a $a - b > 0$.',
      },
      {
        tex: '$b - a > 0$',
        justif: 'Faux. Comme $a > b$, on a $b - a < 0$.',
      },
    ],
  },
  {
    // 0 < a < 1
    enonceQcm: `On considère un réel $a$ tel que $0 < a < 1$. <br>On a alors${sp()}:`,
    hypothese: 'On considère un réel $a$ tel que $0 < a < 1$.',
    bonnes: [
      {
        gauche: 'a^2',
        signe: '<',
        droite: 'a',
        justif:
          'En multipliant $0 < a < 1$ par $a > 0$, on obtient $0 < a^2 < a$, donc $a^2 < a$.',
      },
      {
        gauche: '\\dfrac{1}{a}',
        signe: '>',
        droite: '1',
        justif:
          `La fonction inverse est décroissante sur $]0\\,;+\\infty[$${sp()}: comme $0 < a < 1$, on obtient $\\dfrac{1}{a} > 1$.`,
      },
      {
        gauche: '\\dfrac{1}{a}',
        signe: '>',
        droite: 'a',
        justif:
          'Comme $\\dfrac{1}{a} > 1$ et $a < 1$, on a $\\dfrac{1}{a} > 1 > a$.',
      },
      {
        gauche: '\\sqrt{a}',
        signe: '>',
        droite: 'a',
        justif:
          `Comme $0 < \\sqrt{a} < 1$, en multipliant par $\\sqrt{a}$${sp()}: $(\\sqrt{a})^2 = a < \\sqrt{a}$, donc $\\sqrt{a} > a$.`,
      },
    ],
    mauvaises: [
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
    ],
  },
  {
    // a > 1
    enonceQcm: `On considère un réel $a$ tel que $a > 1$. <br>On a alors${sp()}:`,
    hypothese: 'On considère un réel $a$ tel que $a > 1$.',
    bonnes: [
      {
        gauche: 'a^2',
        signe: '>',
        droite: 'a',
        justif: `En multipliant $a > 1$ par $a > 0$${sp()}: $a^2 > a$.`,
      },
      {
        gauche: '\\dfrac{1}{a}',
        signe: '<',
        droite: '1',
        justif:
          `La fonction inverse est décroissante sur $]0\\,;+\\infty[$${sp()}: comme $a > 1$, on obtient $\\dfrac{1}{a} < 1$.`,
      },
      {
        gauche: 'a^2',
        signe: '>',
        droite: '1',
        justif: `En multipliant $a > 1$ par $a > 0$${sp()}: $a^2 > a > 1$.`,
      },
      {
        gauche: '\\sqrt{a}',
        signe: '>',
        droite: '1',
        justif:
          `La fonction racine carrée est croissante${sp()}: comme $a > 1$, $\\sqrt{a} > \\sqrt{1} = 1$.`,
      },
    ],
    mauvaises: [
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
    ],
  },
]

/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC1e extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut penser aux fonctions de référence, en particulier${sp()}:
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
     <li>repérer l'intervalle concerné par les valeurs de l'énoncé et faire le lien avec l'ensemble de définition de la fonction de référence utilisée;</li>
     <li>utiliser les variations de la <strong>fonction carré</strong> , <strong>fonction inverse</strong>, <strong>fonction racine carrée</strong>, $\\ldots$ selon les cas;</li>
    <li>se rappeler si besoin que multiplier une inégalité par un nombre négatif change le sens de l'inégalité.</li>
  </ul>
  <a href="https://podeduc.apps.education.fr/video/143477-indice-automatisme-1-c01-1mp4/?is_iframe=true&autoplay=true" target="_blank"
     style="display:inline-flex; align-items:center; gap:6px;
            padding:6px 14px; border:1px solid #b3cde8; border-radius:6px;
            font-size:13px; font-weight:500; color:#1a5fa8;
            background:#e8f1fb; text-decoration:none;">
    ▶ Voir la vidéo explicative
  </a>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const cas = this.quotaChoice('cas', situations)
    const bonne = choice(cas.bonnes)
    // Trois propositions fausses distinctes pour le QCM
    const mauvaisesChoisies = shuffle(cas.mauvaises).slice(0, 3)
    // Hors QCM, les deux membres sont présentés dans un ordre aléatoire
    const inverser = choice([true, false])
    const bonneTex = `${bonne.gauche} ${bonne.signe} ${bonne.droite}`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = cas.enonceQcm
      this.reponse = `$${bonneTex}$`
      this.distracteurs = mauvaisesChoisies.map((m) => m.tex)
      this.correction =
        `La bonne réponse est $${miseEnEvidence(bonneTex)}$.<br>
${bonne.justif}<br><br>
Pour les autres propositions${sp()}:<br>` +
        mauvaisesChoisies.map((m) => `${m.tex}${sp()}: ${m.justif}`).join('<br>')
    } else {
      const [membre1, membre2] = inverser
        ? [bonne.droite, bonne.gauche]
        : [bonne.gauche, bonne.droite]
      const symbole = inverser ? (bonne.signe === '<' ? '>' : '<') : bonne.signe
      this.consigne = ''
      // En interactif, les deux membres entourent le champ de réponse
      this.question = `${cas.hypothese}<br>Compléter avec le symbole $<$ ou $>$.${this.interactif ? '' : `<br>$${membre1} \\,\\ldots\\, ${membre2}$`}`
      this.optionsChampTexte = {
        texteAvant: `<br>$${membre1}$`,
        texteApres: `$${membre2}$`,
        dataKeys: ['<', '>'],
      }
      this.optionsDeComparaison = { texteSansCasse: true }
      this.reponse = symbole
      this.correction = `${bonne.justif}<br>
      Ainsi, $${membre1} ${miseEnEvidence(symbole)} ${membre2}$.`
    }
  }
}
