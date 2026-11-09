import { amcConvert } from '../../lib/amc/amcBuilders'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer reste et quotient d'une division euclidienne à partir d'une égalité"

export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

/**
 * Détermination du reste et quotient à partir de l'égalité découlant de la division euclidienne
 * @author Cédric GROLLEAU
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '37268'

export const refs = {
  'fr-fr': ['6N2K-3'],
  'fr-2016': ['6C11-1'],
  'fr-ch': ['9R1NO1E-6', '9R2NO1E-6', '9R3NO1E-6'], // Primaire anciennement :['9NO3-5'],
}
export default class DivisionsEuclidiennesEgalite2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      "1 : L'égalité correspond à la division euclidienne.\n2 : L'égalité ne correspond pas nécessairement à la division euclidienne.",
    ]
    this.consigneCorrection = texteGras(
      'Pour la division euclidienne de a par b, on cherche les nombres q et r tels que a = (b × q) + r avec r < b',
    )
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opidiv n'est pas joli
    this.nbQuestions = 4
    this.sup = 1
  }

  nouvelleVersion() {
    this.consigne = 'Répondre '
    this.consigne +=
      this.nbQuestions === 1
        ? 'à la question suivante'
        : 'aux questions suivantes'
    this.consigne += ' sans poser la division.'

    let typesDeQuestionsDisponibles, typesDeQuestions
    if (parseInt(this.sup) === 1) {
      typesDeQuestionsDisponibles = [1, 2, 2]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, q, r;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      q = randint(7, 75)
      b = randint(3, 25)
      r = typesDeQuestions === 1 ? 0 : randint(1, b - 1)
      a = b * q + r
      texte = `Utilise l'égalité suivante pour donner le quotient et le reste de la division euclidienne de $ ${texNombre(a)} $ par $ ${b} $.<br>`
      switch (typesDeQuestions) {
        case 1: // égalité "directe"
          texte += `$ ${texNombre(a)} = ${b} \\times ${q} $<br>`
          texteCorr = `L'égalité $ ${texNombre(a)} = ${b} \\times ${q} $ correspond bien à l'expression de la division euclidienne de $ ${texNombre(a)} $ par $ ${b} $. <br> Le quotient est $${miseEnEvidence(q)}$ et le reste est ${texteEnCouleurEtGras('$\\mathbf{0}$')}.`
          break
        case 2: // égalité "directe"
          texte += `$ ${texNombre(a)} = (${b} \\times ${q}) + ${r} $<br>`
          texteCorr = `$${r}$ est inférieur à $${b}$, l'égalité $ ${texNombre(a)} = (${b} \\times ${q}) + ${r} $ correspond bien à l'expression de la division euclidienne de $ ${texNombre(a)} $ par $${b}$. <br> On a donc : $${miseEnEvidence(q)}$ le quotient et $${miseEnEvidence(r)}$ le reste.`
          break
        case 3:
          texte += `$ ${texNombre(a)} = (${b} \\times ${q - 1}) + ${r + b} $<br>`
          texteCorr = `$${r + b}$ est supérieur à $${b}$. $${r + b}$ n'est donc pas le reste. <br> L'égalité $ ${texNombre(a)} = (${b} \\times ${q - 1}) + ${r + b} $ ne traduit pas directement la division euclidienne de $ ${texNombre(a)} $ par $${b}$. <br>
            Transformons cette égalité en utilisant le fait que $ ${r + b} = ${r} + ${b} $.<br>
            $ ${texNombre(a)} = (${b} \\times ${q - 1}) + ${r + b} = (${b} \\times ${q - 1}) + ${b} + ${r} = (${b} \\times ${q}) + ${r} $ <br>
            Ainsi, $ ${texNombre(a)} = (${b} \\times ${q}) + ${r} $.
            <br> On a donc : $${miseEnEvidence(q)}$ le quotient et $${miseEnEvidence(r)}$ le reste.`
          break
        case 4:
        default:
          texte += `$ ${texNombre(a)} = (${b} \\times ${q + 1}) - ${b - r} $<br>`
          texteCorr = `L'égalité $ ${texNombre(a)} = (${b} \\times ${q + 1}) - ${b - r} $ ne traduit pas directement la division euclidienne de $ ${texNombre(a)} $ par $${b}$. <br>
          Transformons cette égalité : <br>
          Dans cette égalité, on a pris ${q + 1} fois ${b} et on dépasse $ ${texNombre(a)} $. Cela veut dire qu'on a pris ${b} trop de fois.<br>
          Prenons-le une fois de moins, on va donc avoir ${q} fois ${b} : <br>
          $ ${texNombre(a)} = (${b} \\times ${q + 1}) - ${b - r} = (${b} \\times ${q}) + ${b} - ${b - r} = (${b} \\times ${q}) + ${r} $ <br>
          Ainsi, $ ${texNombre(a)} = (${b} \\times ${q}) + ${r} $.
          <br> On a donc : $${miseEnEvidence(q)}$ le quotient et $${miseEnEvidence(r)}$ le reste.`
          break
      }
      texte +=
        (this.interactif ? '<br>' : '') +
        addMultiMathfield(this, i, {
          dataTemplate: `Quel est le quotient de la division euclidienne de $${texNombre(a)}$ par $${b}$ ? %{champ1}<br>
          Quel est le reste de la division euclidienne de $${texNombre(a)}$ par $${b}$ ? %{champ2}`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
            },
            champ2: {
              keyboard: KeyboardType.clavierNumbers,
            },
          },
        })
      handleAnswers(
        this,
        i,
        {
          champ1: { value: q },
          champ2: { value: r },
          bareme: toutAUnPoint,
        },
        {
          formatInteractif: 'multi-mathfield',
        },
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          enonceAvant: false,
          options: { multicols: true, barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: texte + '<br>Quotient',
                    valeur: q,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'Reste',
                    valeur: r,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, a, b, q, r)) {
        // Si la question n'a jamais été posée, on en crée une autre

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
