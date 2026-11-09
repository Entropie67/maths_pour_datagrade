import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Déterminer un antécédent par une fonction affine'
export const interactifReady = true

export const uuid = 'd341f'

export const refs = {
  'fr-fr': ['3F23-1'],
  'fr-ch': ['1mF2-17', '10LCFA3C-7', '10LSFA3C-7', '11CTFA2B-7'],
}
export const dateDePublication = '08/10/2024'
export const dateDeModifImportante = '20/08/2026'

/**
 * Reconnaitre une fonction affine
 * @author Erwan Duplessy
 * @author Jean-claude Lhote // remis au gout du jour et adapté à l'interactif
 * 3F23
 * date : 2021/02/21
 * référentiel 3F23 - Déterminer de manière algébrique l\'antécédent par une fonction, dans des cas se ramenant à la résolution d\'une équation du premier degré.
 * plusieurs cas :
 * f(x) = ax + b avec a et b petits relatifs
 * f(x) = ax + b avec a et b grands relatifs
 * f(x) = a(x + b) + c avec a, b, c petits relatifs
 * f(x) = a(bx + c) + dx + e  avec a, b, c, d petits relatifs
 * Une version QCM est disponible : ses distracteurs reproduisent les erreurs
 * les plus fréquentes (image prise pour l'antécédent, terme constant changé de
 * membre sans changer de signe, quotient inversé, développement incomplet).
 */

// En Version QCM, l'énoncé énonce directement la question à choix ("... est :") ;
// en mode calcul, il garde la formulation à l'infinitif ("Déterminer ...").
function consigneQuestion(m: number, expr: string, versionQcm: boolean) {
  return versionQcm
    ? `L'antécédent de $${m}$ par la fonction $f$ définie par ${expr} est :`
    : `Déterminer l'antécédent de $${m}$ par la fonction $f$ définie par ${expr}. `
}

export default class AntecedentParCalcul extends Exercice {
  conclusionAntecedent?: (image: number, antecedent: FractionEtendue) => string

  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Type de fonction affine',
      '1 : ax+b (a et b petits relatifs)\n2 : ax+b (a et b grands relatifs)\n3 : a(x+b) + c (petits relatifs)\n4 : a(bx + c) + dx + e (petits relatifs)\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Version QCM', false]

    this.consigne =
      'Répondre aux questions suivantes avec une valeur exacte simplifiée. '
    this.nbQuestions = 1

    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = '1'
    this.sup2 = false
  }

  nouvelleVersion() {
    const versionQcm = Boolean(this.sup2)
    this.consigne = versionQcm
      ? ''
      : 'Répondre aux questions suivantes avec une valeur exacte simplifiée. '
    const qcmOptions = { radio: true }
    // Comme pour les autres QCM, les lettres A, B, C, D identifient les
    // propositions en mode non interactif ; en mode interactif, ce sont des
    // cases à cocher/boutons radio qui remplissent ce rôle.
    const qcmFormat = this.interactif ? 'case' : 'lettre'
    // Une proposition s'écrit comme la bonne réponse : fraction simplifiée, signe
    // devant. Un dénominateur nul rend une chaîne vide, écartée avec les doublons.
    const enFraction = (num: number, den: number) =>
      den === 0 ? '' : `$${new FractionEtendue(num, den).simplifie().texFSD}$`

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 1,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let e = 0
      let m = 0
      let expr = ''
      let ante: FractionEtendue
      texteCorr = ''
      // Forme réduite f(x) = coeffReduit x + constanteReduite, commune aux quatre cas :
      // l'antécédent cherché vaut (m - constanteReduite) / coeffReduit.
      let coeffReduit = 0
      let constanteReduite = 0
      // Erreurs propres au cas traité, prioritaires sur les erreurs communes.
      let distracteursSpecifiques: { texte: string; feedback: string }[] = []

      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent
      ) {
        case 2:
          // f(x) = ax + b avec a et b grands relatifs
          a = randint(-999, 999, [-1, 0, 1])
          b = randint(-999, 999, [0])
          m = randint(-999, 999, [0])
          expr = `$f(x)=${a}x ${ecritureAlgebrique(b)}$`
          texte += consigneQuestion(m, expr, versionQcm)
          texteCorr += '$\\begin{aligned} '
          texteCorr += ` ${a}x ${ecritureAlgebrique(b)}&= ${m} \\\\ `
          texteCorr += ` ${a}x &= ${m} ${ecritureAlgebrique(-b)}\\\\ `
          ante = new FractionEtendue(m - b, a)
          coeffReduit = a
          constanteReduite = b
          break

        case 3:
          // f(x) = a(x + b) + c avec a, b, c petits relatifs
          a = randint(-20, 20, [-1, 0, 1])
          b = randint(-20, 20, [0])
          c = randint(-20, 20, [0])
          m = randint(-20, 20)
          expr = `$f(x)=${a}(x ${ecritureAlgebrique(b)})${ecritureAlgebrique(c)}$`
          texte += consigneQuestion(m, expr, versionQcm)
          texteCorr += '$\\begin{aligned} '
          texteCorr += `${a}(x ${ecritureAlgebrique(b)})${ecritureAlgebrique(c)} &= ${m}\\\\`
          texteCorr += `${a}x ${ecritureAlgebrique(a * b)}${ecritureAlgebrique(c)} &= ${m}\\\\`
          texteCorr += `${a}x ${ecritureAlgebrique(a * b + c)} &= ${m}\\\\`
          texteCorr += `${a}x &= ${m} ${ecritureAlgebrique(-a * b - c)}\\\\`
          ante = new FractionEtendue(m - b * a - c, a)
          coeffReduit = a
          constanteReduite = a * b + c
          distracteursSpecifiques = [
            {
              // Distributivité oubliée : a(x + b) réduit en ax + b.
              texte: enFraction(m - b - c, a),
              feedback: `dans $${a}(x ${ecritureAlgebrique(b)})$, le facteur $${a}$ multiplie aussi $${b}$ : le développement donne $${a}x ${ecritureAlgebrique(a * b)}$.`,
            },
          ]
          break

        case 4:
          // f(x) = a(bx + c) + dx + e  avec a, b, c, d petits relatifs
          a = randint(-20, 20, [-1, 0, 1])
          b = randint(-20, 20, [-1, 0, 1])
          c = randint(-20, 20, [0])
          d = randint(-20, 20, [-1, 0, 1, -a * b]) // d différent de -ab pour assurer une solution
          e = randint(-20, 20, [0])
          m = randint(-20, 20)
          expr = `$f(x)=${a}(${b}x ${ecritureAlgebrique(c)})${ecritureAlgebrique(d)}x${ecritureAlgebrique(e)}$`
          texte += consigneQuestion(m, expr, versionQcm)
          texteCorr += '$\\begin{aligned} '
          texteCorr += `${a}(${b}x ${ecritureAlgebrique(c)})${ecritureAlgebrique(d)}x${ecritureAlgebrique(e)} &= ${m}\\\\`
          texteCorr += `${a * b}x ${ecritureAlgebrique(a * c)}${ecritureAlgebrique(d)}x${ecritureAlgebrique(e)} &= ${m}\\\\`
          texteCorr += `${a * b + d}x ${ecritureAlgebrique(a * c + e)} &= ${m}\\\\`
          texteCorr += `${a * b + d}x  &= ${m}${ecritureAlgebrique(-a * c - e)}\\\\`
          texteCorr += `${a * b + d}x &= ${m - a * c - e}\\\\`
          ante = new FractionEtendue(m - a * c - e, a * b + d)
          coeffReduit = a * b + d
          constanteReduite = a * c + e
          distracteursSpecifiques = [
            {
              // Réduction incomplète : le terme dx n'est pas regroupé avec abx.
              texte: enFraction(m - a * c - e, a * b),
              feedback: `le terme $${d}x$ se regroupe avec $${a * b}x$ : le coefficient de $x$ vaut $${a * b + d}$, pas $${a * b}$.`,
            },
            {
              // Distributivité partielle : a ne multiplie que bx.
              texte: enFraction(m - e, a * b + d),
              feedback: `dans $${a}(${b}x ${ecritureAlgebrique(c)})$, le facteur $${a}$ multiplie aussi $${c}$ : le développement donne $${a * b}x ${ecritureAlgebrique(a * c)}$.`,
            },
          ]
          break
        case 1:
        default:
          // f(x) = ax + b avec a et b petits relatifs
          a = randint(-20, 20, [-1, 0, 1])
          b = randint(-20, 20, [0])
          m = randint(-20, 20)
          expr = `$f(x)=${a}x ${ecritureAlgebrique(b)}$`
          texte += consigneQuestion(m, expr, versionQcm)

          texteCorr += '$\\begin{aligned} '
          texteCorr += `${a}x ${ecritureAlgebrique(b)} &= ${m} \\\\ `
          texteCorr += `${a}x &= ${m} ${ecritureAlgebrique(-b)} \\\\ `
          texteCorr += `${a}x &= ${m - b} \\\\ `
          texteCorr += `${texFractionFromString(a + 'x', a)} &= ${texFractionFromString(m - b, a)} \\\\ ` // EE : Ne pas mettre fractionEtendue car sinon 0/14 affiche 0.
          ante = new FractionEtendue(m - b, a)
          coeffReduit = a
          constanteReduite = b
          break
      }

      texteCorr =
        `On cherche un nombre $x$ tel que $f(x) = ${m}$.<br>` +
        `On résout donc l'équation : $f(x) = ${m}$. <br>` +
        texteCorr

      if ((!ante.estIrreductible || ante.inferieurstrict(0)) && ante.num !== 0)
        texteCorr += `x &=${ante.texFraction}${ante.texSimplificationAvecEtapes('none', orangeMathalea)} \\\\` // c'est la couleur de miseEnEvidence
      else texteCorr += `x &=${miseEnEvidence(ante.texFSD)}`
      texteCorr += '\\end{aligned}$'
      texteCorr += this.conclusionAntecedent?.(m, ante) ?? ''

      let propositions: {
        texte: string
        statut: boolean
        feedback?: string
      }[] = []
      if (versionQcm) {
        const bonneReponse = enFraction(ante.num, ante.den)
        // Les erreurs d'élève repérées sur cette question, de la plus fréquente à
        // la moins fréquente : les trois premières qui ne retombent ni sur la
        // bonne réponse ni sur une autre proposition deviennent les distracteurs.
        const erreursFrequentes = [
          ...distracteursSpecifiques,
          {
            // Image et antécédent confondus : l'élève calcule f(m).
            texte: enFraction(coeffReduit * m + constanteReduite, 1),
            feedback: `c'est $f(${m})$, donc l'image de $${m}$ par $f$. Ici, c'est $x$ qui est cherché, pas $f(x)$.`,
          },
          {
            // Terme constant changé de membre sans changer de signe.
            texte: enFraction(m + constanteReduite, coeffReduit),
            feedback: `en changeant $${constanteReduite}$ de membre, il change aussi de signe : l'équation devient $${coeffReduit}x = ${m} ${ecritureAlgebrique(-constanteReduite)}$.`,
          },
          {
            // Quotient inversé : le coefficient de x divisé par le second membre.
            texte: enFraction(coeffReduit, m - constanteReduite),
            feedback: `le quotient est inversé : c'est $${m - constanteReduite}$ qui se divise par $${coeffReduit}$, et pas l'inverse.`,
          },
          {
            // Division par le coefficient de x oubliée.
            texte: enFraction(m - constanteReduite, 1),
            feedback: `l'équation $${coeffReduit}x = ${m - constanteReduite}$ n'est pas terminée : il reste à diviser les deux membres par $${coeffReduit}$.`,
          },
          {
            // Signe du quotient inversé.
            texte: enFraction(constanteReduite - m, coeffReduit),
            feedback: `le second membre vaut $${m} ${ecritureAlgebrique(-constanteReduite)} = ${m - constanteReduite}$, c'est lui qui se divise par $${coeffReduit}$.`,
          },
        ]
        const distracteurs = erreursFrequentes
          .filter(
            (erreur, rang) =>
              erreur.texte !== '' &&
              erreur.texte !== bonneReponse &&
              erreursFrequentes.findIndex(
                (autre) => autre.texte === erreur.texte,
              ) === rang,
          )
          .slice(0, 3)
        propositions = shuffle([
          { texte: bonneReponse, statut: true },
          ...distracteurs.map((erreur) => ({ ...erreur, statut: false })),
        ])
      }
      // Un tirage dégénéré (par exemple un antécédent nul) peut faire retomber
      // presque tous les distracteurs sur la bonne réponse : on retire alors.
      const qcmComplet = !versionQcm || propositions.length === 4

      if (
        qcmComplet &&
        this.questionJamaisPosee(i, a, b, listeTypeDeQuestions[i])
      ) {
        if (versionQcm) {
          handleAnswers(
            this,
            i,
            {
              qcm: {
                enonce: texte,
                propositions,
                correction: texteCorr,
                options: qcmOptions,
              },
            },
            { formatInteractif: 'mathalea-qcm' },
          )
          if (context.isHtml) {
            texte += addMathaleaQcm(this, i, {
              ...qcmOptions,
              format: qcmFormat,
              interactivityOn: this.interactif,
            })
          } else if (!context.isAmc) {
            const qcmLatex = propositionsQcm(this, i, {
              style: '',
              format: qcmFormat,
            })
            texte += qcmLatex.texte
            texteCorr += qcmLatex.texteCorr
          }
        } else if (this.interactif) {
          texte += `<br>${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
          handleAnswers(this, i, {
            reponse: {
              value: ante.simplifie().texFSD,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
        }
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
