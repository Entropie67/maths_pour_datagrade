/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.fonctionComparaisonPuissance.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import ce, {
  fonctionComparaison,
} from '../../lib/interactif/comparisonFunctions'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la notation puissance'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const dateDePublication = '21/11/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '23/04/2025' // Ajout par Rémi Angot du choix des exposants
/**
 * Passer d'un produit à la notation puissance et inversement
 * @author Guillaume Valmont
 */
export const uuid = '1d078'

export const refs = {
  'fr-fr': ['4C33-0'],
  'fr-ch': ['9R1NO5A-1', '9R2NO5A-1', '9R3NO5A-1', 'PRQNO03B-1', 'PRQNO07A-4'],
}
/**
 * Crée la fonction de comparaison d'une saisie pour « écrire sans notation puissance ».
 * Les écritures prévues dans `variantes` sont acceptées telles quelles.
 * Toute autre écriture mathématiquement égale, composée du bon nombre de facteurs
 * (donc du bon nombre de signes ×) tous égaux à la base au signe près,
 * est acceptée avec un feedback précisant qu'elle n'est pas l'écriture attendue.
 * Ex : -(-4)^2 = -4 × 4 ou (-4)^2 = 4 × 4
 */
function comparaisonProduit(
  base: number,
  exposant: number,
  variantes: string[],
) {
  return (saisie: string) => {
    for (const variante of variantes) {
      if (fonctionComparaison(saisie, variante, { texteSansCasse: true }).isOk)
        return { isOk: true, feedback: '' }
    }
    const nettoyee = saisie
      .replaceAll(/\\left|\\right|\\lparen|\\rparen|\\,|\\ /g, (m) =>
        m === '\\lparen' ? '(' : m === '\\rparen' ? ')' : '',
      )
      .replaceAll(/\s/g, '')
      .replaceAll(/\\cdot|\*|×/g, '\\times')
    let produit = nettoyee
    if (exposant < 0) {
      const fraction = nettoyee.match(/^-?\\[dt]?frac\{-?1\}\{(.*)\}$/)
      if (fraction == null) return { isOk: false, feedback: '' }
      produit = fraction[1]
    }
    const facteurs = produit.split('\\times')
    if (
      facteurs.length !== Math.abs(exposant) ||
      !facteurs.every(
        (f) => f.replaceAll(/[()-]/g, '') === String(Math.abs(base)),
      )
    )
      return { isOk: false, feedback: '' }
    const memeValeur = ce.parse(nettoyee).isEqual(ce.parse(variantes[0]))
    return memeValeur
      ? {
          isOk: true,
          feedback:
            "Cette écriture est juste mais ce n'est pas celle qui était attendue.",
        }
      : { isOk: false, feedback: '' }
  }
}

export default class NotationPuissance extends Exercice {
  classe: number
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      'Type de calcul',
      3,
      '1 : Écrire sous forme de produit\n2 : Écrire sous forme de puissance\n3 : Mélange',
    ] // le paramètre sera numérique de valeur max 2 (le 2 en vert)
    this.sup = 1
    this.besoinFormulaire2Numerique = [
      'Base',
      3,
      '1 : Positive\n2 : Négative\n3 : Mélange',
    ]
    this.sup2 = 3
    this.besoinFormulaire3Numerique = false
    this.sup3 = 1
    this.besoinFormulaire4Numerique = [
      'Signe devant la base',
      3,
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
    this.sup4 = 3
    this.classe = 4
    this.besoinFormulaire5Numerique = [
      'Exposant',
      4,
      '1 : Carrés ou cubes\n2 : Exposants quelconques',
    ]
    this.sup5 = 2
  }

  nouvelleVersion() {
    let listeTypeDeQuestions
    switch (this.sup) {
      case 1:
        this.consigne = "Écrire l'expression "
        this.consigne +=
          this.classe === 2
            ? '(avec des $\\times$ si besoin) '
            : 'avec des $\\times$ et '
        this.consigne +=
          "sans utiliser la notation puissance. Aucun calcul n'est nécessaire."
        listeTypeDeQuestions = ['produit']
        break
      case 2:
        this.consigne =
          "Simplifier l'écriture en utilisant la notation puissance."
        listeTypeDeQuestions = ['puissance']
        break
      default:
        this.consigne = ''
        listeTypeDeQuestions = ['produit', 'puissance']
        break
    }
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    let listeSignesExposants
    switch (this.sup3) {
      case 1:
        listeSignesExposants = ['positif']
        break
      case 2:
        listeSignesExposants = ['négatif']
        break
      default:
        listeSignesExposants = ['positif', 'négatif']
        break
    }
    listeSignesExposants = combinaisonListes(
      listeSignesExposants,
      this.nbQuestions,
    )
    const listeSignes = combinaisonListes(
      this.sup4 === 1 ? [''] : this.sup4 === 2 ? ['-'] : ['', '-'],
      this.nbQuestions,
    )
    let listeSignesBase = combinaisonListes(['', '-'], this.nbQuestions)
    switch (this.sup2) {
      case 1:
        listeSignesBase = ['']
        break
      case 2:
        listeSignesBase = ['-']
        break
      default:
        listeSignesBase = ['', '-']
        break
    }
    const alternance2Et3 = combinaisonListes([2, 3], this.nbQuestions)
    listeSignesBase = combinaisonListes(listeSignesBase, this.nbQuestions)
    for (
      let i = 0,
        texte,
        texteCorr,
        base,
        exposant,
        pl,
        pr,
        apl,
        apr,
        signeContraire,
        produitSansParenthesesInitialesEtSansFois,
        produitSansParenthesesInitiales,
        produit,
        produitAlt,
        puissance,
        puissances,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      base = randint(2, 10)
      if (listeSignesBase[i] === '-') base = -base
      if (this.sup5 === 1) {
        exposant = alternance2Et3[i]
      } else {
        if (listeTypeDeQuestions[i] === 'puissance') {
          exposant = randint(2, 8)
        } else {
          exposant = randint(this.classe > 2 ? 2 : 0, 5)
        }
      }
      if (base < 0) {
        pl = '('
        pr = ')'
        apl = ''
        apr = ''
      } else {
        pl = ''
        pr = ''
        apl = '('
        apr = ')'
      }
      signeContraire = listeSignes[i] === '-' ? '' : '-'
      if (listeSignesExposants[i] === 'négatif') {
        exposant = exposant * -1
      }
      puissance = `${listeSignes[i] + pl + base + pr}^{${exposant}}`
      puissances = []
      const exp = exposant < 0 ? `{${exposant}}` : `${exposant}` // distinction importante pour comparer les chaînes de caractères en interactif
      puissances.push(`${listeSignes[i] + pl + base + pr}^${exp}`) // réponse de base

      if (exposant % 2 === 0)
        puissances.push(`${listeSignes[i] + apl + -base + apr}^${exp}`)
      else puissances.push(`${signeContraire + apl + -base + apr}^${exp}`) // si l'exposant est pair, on peut changer le signe de la base sans changer le signe devant et s'il est impair, on peut changer les deux signes
      if (exposant < 0) {
        puissances.push(
          `\\frac{1}{${listeSignes[i] + pl + base + pr}^${-exposant}}`,
        )
        if (exposant % 2 === 0)
          puissances.push(
            `\\frac{1}{${listeSignes[i] + apl + -base + apr}^${-exposant}}`,
          )
        else
          puissances.push(
            `\\frac{1}{${signeContraire + apl + -base + apr}^${-exposant}}`,
          ) // si l'exposant est pair, on peut changer le signe de la base sans changer le signe devant et s'il est impair, on peut changer les deux signes
      }
      produit = `${pl + base + pr}`
      produitSansParenthesesInitiales = `${base}`
      produitAlt = produit
      produitSansParenthesesInitialesEtSansFois =
        produitSansParenthesesInitiales
      for (let j = 0; j < Math.abs(exposant) - 1; j++) {
        produit += `\\times${pl + base + pr}`
        produitSansParenthesesInitiales += `\\times${pl + base + pr}`
        produitAlt += `(${base})`
        produitSansParenthesesInitialesEtSansFois += `(${base})`
      }
      switch (listeTypeDeQuestions[i]) {
        case 'produit':
          if (this.sup === 3) {
            texte = `Écrire $${puissance}$ `
            texte +=
              this.classe === 2
                ? '(avec des $\\times$ si besoin) '
                : 'avec des $\\times$ et '
            texte += 'sans utiliser la notation puissance'
          } else {
            texte = `$${puissance}$`
          }
          texteCorr = `$${puissance} = `
          if (exposant === 0) {
            texteCorr += listeSignes[i] + 1 + '$'
            handleAnswers(this, i, {
              reponse: {
                value: listeSignes[i] + 1,
                options: { texteSansCasse: true },
              },
            })
          } else if (exposant === 1) {
            if (listeSignes[i] === '') {
              pl = ''
              pr = ''
            }
            texteCorr += `${listeSignes[i] + pl + base + pr}$`

            const variantes = [listeSignes[i] + pl + base + pr]
            handleAnswers(this, i, {
              reponse: {
                value: variantes,
                compare: comparaisonProduit(base, exposant, variantes),
                options: { texteSansCasse: true },
              },
            })
          } else if (exposant > 1) {
            texteCorr += listeSignes[i] + produit + '$'
            const variantes = [
              listeSignes[i] + produit,
              listeSignes[i] + produitAlt,
              listeSignes[i] + produitSansParenthesesInitiales,
              listeSignes[i] + produitSansParenthesesInitialesEtSansFois,
            ]
            handleAnswers(this, i, {
              reponse: {
                value: variantes,
                compare: comparaisonProduit(base, exposant, variantes),
                options: { texteSansCasse: true },
              },
            })
          } else if (exposant === -1) {
            texteCorr += `${listeSignes[i]}\\dfrac{1}{${base}}$`
            const variantes = [`${listeSignes[i]}\\frac{1}{${base}}`]
            handleAnswers(this, i, {
              reponse: {
                value: variantes,
                compare: comparaisonProduit(base, exposant, variantes),
                options: { texteSansCasse: true },
              },
            })
          } else if (exposant < -1) {
            texteCorr += `${listeSignes[i]}\\dfrac{1}{${produit}}$`
            const variantes = [
              `${listeSignes[i]}\\frac{1}{${produit}}`,
              `${listeSignes[i]}\\frac{1}{${produitAlt}}`,
              `${listeSignes[i]}\\frac{1}{${produitSansParenthesesInitiales}}`,
              `${listeSignes[i]}\\frac{1}{${produitSansParenthesesInitialesEtSansFois}}`,
            ]
            handleAnswers(this, i, {
              reponse: {
                value: variantes,
                compare: comparaisonProduit(base, exposant, variantes),
                options: { texteSansCasse: true },
              },
            })
          }
          break
        case 'puissance':
        default: {
          let enonce, correction
          if (exposant < 0) {
            enonce = `$${listeSignes[i]} \\dfrac{1}{${produit}}$`
            correction = `$${listeSignes[i]} \\dfrac{1}{${produit}} = ${puissance}$`
          } else {
            enonce = `$${listeSignes[i]} ${produit}$`
            correction = `$${listeSignes[i]} ${produit} = ${puissance}$`
          }
          texte =
            this.sup === 3
              ? `Simplifier ${enonce} en utilisant la notation puissance`
              : enonce
          texteCorr = correction
          handleAnswers(this, i, {
            reponse: { value: puissances, options: { puissance: true } },
          })
          break
        }
      }

      texte += this.interactif
        ? (this.sup === 3 ? ' : ' : ' = ') +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations)
        : ''
      if (this.sup === 3) texte += '.'

      if (context.isAmc) {
        if (this.sup !== 3) this.titre = this.consigne
        this.autoCorrectionAMC[i].enonce =
          this.sup === 3
            ? texte + ' $=\\ldots$<br>'
            : 'Compléter : ' + texte + ' $=\\ldots$'
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [
          { statut: 1, sanscadre: true, texte: texteCorr },
        ]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`

      // Fin de cette uniformisation

      // Si la question n'base jamais été posée, on l'enregistre
      if (
        this.questionJamaisPosee(
          i,
          base,
          exposant,
          listeTypeDeQuestions[i],
          listeSignesExposants[i],
          listeSignes[i],
        )
      ) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple base, exposant, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
