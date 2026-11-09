import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = '7f979'
export const refs = {
  'fr-fr': ['1A-C01-1'],
  'fr-ch': ['11CTQCMNO-1', '11LCQCMNO-1', '11LSQCMNO-1'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Comparer deux nombres'
export const dateDePublication = '02/09/2025'
export const dateDeModifImportante = '02/10/2026'

type Comparaison = {
  gauche: string
  droite: string
  signe: '<' | '>'
  justification: string
}

/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC1a extends ExerciceSimple {
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
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const choixType = this.quotaChoice('type', [1, 2, 3, 4])
    const a1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const b1 = a1 + randint(1, 9) / 100
    const c1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const d1 = c1 + randint(1, 9) / 10 + randint(1, 9) / 100
    const e1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const f1 = e1 + randint(1, 9) / 10 + randint(1, 9) / 100
    const g1 = randint(1, 5) + randint(1, 9) / 10 + randint(1, 9) / 100
    const h1 = g1 + randint(1, 9) / 10 + randint(1, 9) / 100
    // Hors QCM, les deux membres sont présentés dans un ordre aléatoire
    const inverser = choice([true, false])

    const a = texNombre(-a1, 4) // -a plus grand
    const b = texNombre(-b1, 4) // -b plus petit
    const c = texNombre(c1, 3)
    const d = texNombre(d1, 3)
    const e = texNombre(e1, 4)
    const f = texNombre(f1, 4)
    const g = texNombre(g1, 3)
    const h = texNombre(h1, 3)

    // Les quatre inégalités vraies, une par fonction de référence
    const comparaisons: Record<number, Comparaison> = {
      1: {
        gauche: `(${a})^2`,
        droite: `(${b})^2`,
        signe: '<',
        justification: `La fonction carré est strictement décroissante sur $]-\\infty\\,;\\,0]$ et $${a} > ${b}$, donc $(${a})^2 < (${b})^2$.`,
      },
      2: {
        gauche: `\\dfrac{1}{${c}}`,
        droite: `\\dfrac{1}{${d}}`,
        signe: '>',
        justification: `La fonction inverse est strictement décroissante sur $]0\\,;\\,+\\infty[$ et $${c}<${d}$, donc $\\dfrac{1}{${c}} > \\dfrac{1}{${d}}$.`,
      },
      3: {
        gauche: `${g}^2`,
        droite: `${h}^2`,
        signe: '<',
        justification: `La fonction carré est strictement croissante sur $[0\\,;\\,+\\infty[$ et $${g}<${h}$, donc $${g}^2<${h}^2$.`,
      },
      4: {
        gauche: `\\left(\\dfrac{1}{${f}}\\right)^2`,
        droite: `\\left(\\dfrac{1}{${e}}\\right)^2`,
        signe: '<',
        justification: `La fonction carré est strictement croissante sur $[0\\,;\\,+\\infty[$ et $\\dfrac{1}{${f}} < \\dfrac{1}{${e}}$, donc $\\left(\\dfrac{1}{${f}}\\right)^2<\\left(\\dfrac{1}{${e}}\\right)^2$.`,
      },
    }

    if (this.versionQcm) {
      // Propositions fausses : l'inégalité de chaque autre cas, renversée
      const fausses: Record<number, string> = {
        1: `$(${a})^2>(${b})^2$`,
        2: `$\\dfrac{1}{${c}} < \\dfrac{1}{${d}}$`,
        3: `$${g}^2>${h}^2$`,
        4: `$\\left(\\dfrac{1}{${f}}\\right)^2>\\left(\\dfrac{1}{${e}}\\right)^2$`,
      }
      const autres = [1, 2, 3, 4].filter((k) => k !== choixType)
      const vraie = comparaisons[choixType]
      this.consigne = ''
      this.question = 'La seule inégalité vraie est : '
      this.reponse = `$${vraie.gauche} ${vraie.signe} ${vraie.droite}$`
      this.distracteurs = autres.map((k) => fausses[k])
      this.correction =
        `La seule inégalité vraie est : $${miseEnEvidence(`${vraie.gauche} ${vraie.signe} ${vraie.droite}`)}$.<br>
        En effet, ${vraie.justification}<br><br>
        Concernant les autres propositions :<br>` +
        autres
          .map(
            (k) =>
              `${fausses[k]} est fausse car ${comparaisons[k].justification}<br>`,
          )
          .join('')
    } else {
      const { gauche, droite, signe, justification } = comparaisons[choixType]
      const [membre1, membre2] = inverser ? [droite, gauche] : [gauche, droite]
      const symbole = inverser ? (signe === '<' ? '>' : '<') : signe
      this.consigne = 'Compléter avec le symbole $<$ ou $>$.'
      // En interactif, les deux membres entourent le champ de réponse
      this.question = this.interactif
        ? ''
        : `$${membre1} \\,\\ldots\\, ${membre2}$`
      this.optionsChampTexte = {
        texteAvant: `$${membre1}$`,
        texteApres: `$${membre2}$`,
        dataKeys: ['<', '>'],
      }
      this.optionsDeComparaison = { texteSansCasse: true }
      this.reponse = symbole
      this.correction = `${justification}<br>
      Ainsi, $${membre1} ${miseEnEvidence(symbole)} ${membre2}$.`
    }
  }
}
