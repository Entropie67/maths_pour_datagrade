import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  combinaisonListes2,
  enleveElement,
  enleveElementNo,
} from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { range, rangeMinMax } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Trouver le vocabulaire associé aux termes de l'égalité issue de la division euclidienne"

export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '25/10/2021'
export const dateDeModifImportante = '07/05/2023'

/**
 * Détermination du vocabulaire associé à l'égalité issue de la division euclidienne
 *
 * @author Éric ELTER
 */
export const uuid = '4e35d'

export const refs = {
  'fr-fr': ['6N2J-4'],
  'fr-2016': ['6C11-2'],
  'fr-ch': ['NR'], // Primaire anciennement :['9NO3-6'],
}

/**
 * Met en couleur et en gras le dernier mot d'une chaîne de texte.
 *
 * @param texte
 * Chaîne de caractères contenant des mots séparés par des espaces.
 *
 * @returns
 * La chaîne reconstruite dont le dernier mot est transformé
 * par la fonction `texteEnCouleurEtGras`.
 */
function mettreDernierMotEnCouleurEtGras(texte: string): string {
  const mots = texte.trim().split(/\s+/)

  if (mots.length === 0) return texte

  const dernierMot = mots.pop()!
  const debut = mots.join(' ')

  return (debut ? debut + ' ' : '') + texteEnCouleurEtGras(dernierMot)
}

export default class VocabulaireDivisionEuclidienne extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des mots à enlever',
      "Nombres séparés par des tirets :\nAu maximum, seuls les deux premiers entiers non nuls différents seront retenus.\n0 : Pour enlever aucun mot\n1 : Pour enlever 'dividende' du choix des mots\n2 : Pour enlever 'diviseur' du choix des mots\n3 : Pour enlever 'quotient' du choix des mots\n4 : Pour enlever 'reste' du choix des mots",
    ]
    this.besoinFormulaire2Numerique = [
      'Choix sur les mots à trouver',
      2,
      '1 : Les mots à trouver sont répartis au hasard, mais de façon cyclique.\n2 : Les mots à trouver sont tous présents et répartis au hasard mais les mots ne sont pas répartis forcément équitablement.',
    ]
    this.besoinFormulaire3Numerique = [
      "Choix sur l'égalité",
      2,
      '1 : Égalité classique (a=bq+r ou a=qb+r)\n2 : Égalité moins classique (par exemple, a=r+bq ou qb+r=a)\n3 : Mélange',
    ]
    this.besoinFormulaire4Numerique = [
      'Choix sur le nombre de divisions euclidiennes associées à chaque égalité',
      3,
      '1 : Une seule division euclidienne associée\n2 : Deux divisions euclidiennes associées\n3 : Mélange',
    ]
    this.besoinFormulaire5CaseACocher = ['Avec parenthèses']
    this.besoinFormulaire5CaseACocher = false
    this.nbQuestions = 5
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = 3
    this.sup5 = true
  }

  nouvelleVersion() {
    this.consigne =
      'En utilisant le vocabulaire associé à la division euclidienne, détermine, '
    this.consigne +=
      this.nbQuestions === 1
        ? "pour l'égalité proposée, "
        : 'pour chaque égalité proposée, '
    this.consigne += 'le mot adapté au nombre désigné.'

    const QuestionsDisponibles = range(3)
    if (this.sup) {
      if (typeof this.sup === 'number') {
        enleveElementNo(
          QuestionsDisponibles,
          contraindreValeur(0, 3, this.sup, 0) - 1,
        )
      } else {
        const QuestionsDisponibles2 = this.sup.split('-')
        for (let i = 0; i < QuestionsDisponibles2.length; i++) {
          if (QuestionsDisponibles.length > 2) {
            enleveElement(
              QuestionsDisponibles,
              contraindreValeur(
                0,
                3,
                Number.parseInt(QuestionsDisponibles2[i]),
                0,
              ) - 1,
            )
          }
        }
      }
    }
    const ChoixReponses = ['dividende', 'diviseur', 'quotient', 'reste']
    const ChoixQuestions =
      this.sup2 === 2
        ? combinaisonListes2(QuestionsDisponibles, this.nbQuestions)
        : combinaisonListes(QuestionsDisponibles, this.nbQuestions)
    let ReponsesCorrectes = []
    const Nbutilises = []
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      Nbutilises[0] = 0
      Nbutilises[1] = randint(5, 99)
      switch (this.sup4) {
        case 1:
          Nbutilises[2] = randint(3, Nbutilises[1] - 2)
          Nbutilises[3] = randint(Nbutilises[2] + 1, Nbutilises[1] - 1)
          break
        case 2:
          Nbutilises[2] = randint(5, 99, [Nbutilises[1]])
          Nbutilises[3] = randint(4, Math.min(Nbutilises[2], Nbutilises[1]) - 1)
          break
        default:
          if (randint(0, 1) === 0) {
            Nbutilises[2] = randint(3, Nbutilises[1] - 2)
            Nbutilises[3] = randint(Nbutilises[2] + 1, Nbutilises[1] - 1)
          } else {
            Nbutilises[2] = randint(5, 99, [Nbutilises[1]])
            Nbutilises[3] = randint(
              4,
              Math.min(Nbutilises[2], Nbutilises[1]) - 1,
            )
          }
          Nbutilises[2] = randint(5, 99, [Nbutilises[1]])
          Nbutilises[3] = randint(
            4,
            Math.max(Nbutilises[2], Nbutilises[1]) - 1,
            [Math.min(Nbutilises[2], Nbutilises[1])],
          )
          break
      }
      Nbutilises[0] = Nbutilises[2] * Nbutilises[1] + Nbutilises[3]
      const TabCorrection = []
      TabCorrection[0] = `$${texNombre(Nbutilises[0])}$ est le dividende`
      TabCorrection[1] = ''
      TabCorrection[2] = ''
      TabCorrection[3] = `$${Nbutilises[3]}$ est le reste`
      const TabEgaliteDivEuclidienne = []
      TabEgaliteDivEuclidienne[0] = `$${texNombre(Nbutilises[0])} = ${this.sup5 ? '(' : ''}${Nbutilises[1]} \\times ${Nbutilises[2]}${this.sup5 ? ')' : ''} + ${Nbutilises[3]}$`
      TabEgaliteDivEuclidienne[1] = `$${texNombre(Nbutilises[0])} = ${Nbutilises[3]} + ${this.sup5 ? '(' : ''}${Nbutilises[1]} \\times ${Nbutilises[2]}${this.sup5 ? ')' : ''}$`
      TabEgaliteDivEuclidienne[2] = `$${this.sup5 ? '(' : ''}${Nbutilises[1]} \\times ${Nbutilises[2]}${this.sup5 ? ')' : ''} + ${Nbutilises[3]} = ${texNombre(Nbutilises[0])}$`
      TabEgaliteDivEuclidienne[3] = `$${Nbutilises[3]} + ${this.sup5 ? '(' : ''}${Nbutilises[1]} \\times ${Nbutilises[2]}${this.sup5 ? ')' : ''} = ${texNombre(Nbutilises[0])}$`
      let EgaliteDivEuclidienne
      switch (this.sup3) {
        case 1:
          EgaliteDivEuclidienne = TabEgaliteDivEuclidienne[0]
          break
        case 2:
          EgaliteDivEuclidienne =
            TabEgaliteDivEuclidienne[choice(rangeMinMax(1, 3))]
          break
        default:
          EgaliteDivEuclidienne = TabEgaliteDivEuclidienne[choice(range(3))]
          break
      }
      texte =
        'Dans ' +
        EgaliteDivEuclidienne +
        `, quel nom porte $${texNombre(Nbutilises[ChoixQuestions[i]])}$ lorsque l'égalité est associée à une division euclidienne ?<br>`
      if (Nbutilises[3] < Nbutilises[1]) {
        if (Nbutilises[3] < Nbutilises[2]) {
          texteCorr =
            `$${Nbutilises[3]}$ est inférieur à $${Nbutilises[1]}$ et à $${Nbutilises[2]}$ donc l'égalité ` +
            EgaliteDivEuclidienne +
            ' peut être associée à deux divisions euclidiennes différentes :<br>'
          TabCorrection[1] = `$${Nbutilises[1]}$ est le diviseur`
          TabCorrection[2] = `$${Nbutilises[2]}$ est le quotient`
          texteCorr +=
            numAlpha(0) +
            `soit la division euclidienne de $ ${texNombre(Nbutilises[0])} $ par $ ${Nbutilises[1]} $. Alors, `
          for (let kk = 0; kk < 3; kk++) {
            texteCorr +=
              kk === ChoixQuestions[i]
                ? mettreDernierMotEnCouleurEtGras(TabCorrection[kk])
                : TabCorrection[kk]
            texteCorr += kk < 2 ? ', ' : ' et '
          }
          texteCorr +=
            ChoixQuestions[i] === 3
              ? mettreDernierMotEnCouleurEtGras(TabCorrection[3])
              : TabCorrection[3]
          texteCorr += '.<br>'
          TabCorrection[1] = `$${Nbutilises[1]}$ est le quotient`
          TabCorrection[2] = `$${Nbutilises[2]}$ est le diviseur`
          /* TabCorrection[ChoixQuestions[i]] = mettreDernierMotEnCouleurEtGras(
            TabCorrection[ChoixQuestions[i]],
          ) */
          texteCorr +=
            numAlpha(1) +
            `soit la division euclidienne de $ ${texNombre(Nbutilises[0])} $ par $ ${Nbutilises[2]} $. Alors, `
          for (let kk = 0; kk < 3; kk++) {
            texteCorr +=
              kk === ChoixQuestions[i]
                ? mettreDernierMotEnCouleurEtGras(TabCorrection[kk])
                : TabCorrection[kk]
            texteCorr += kk < 2 ? ', ' : ' et '
          }
          texteCorr +=
            ChoixQuestions[i] === 3
              ? mettreDernierMotEnCouleurEtGras(TabCorrection[3])
              : TabCorrection[3]
          texteCorr += '.<br>'
          if (ChoixQuestions[i] % 3 === 0) {
            ReponsesCorrectes = [ChoixReponses[ChoixQuestions[i]]]
          } else {
            ReponsesCorrectes = ['diviseur', 'quotient']
          }
        } else {
          texteCorr =
            `$${Nbutilises[3]}$ est inférieur à $${Nbutilises[1]}$ mais pas à $${Nbutilises[2]}$ donc l'égalité ` +
            EgaliteDivEuclidienne +
            ' est associée à'
          TabCorrection[1] = `$${Nbutilises[1]}$ est le diviseur`
          TabCorrection[2] = `$${Nbutilises[2]}$ est le quotient`
          texteCorr += ` la division euclidienne de $ ${texNombre(Nbutilises[0])} $ par $ ${Nbutilises[1]} $. Alors, `
          for (let kk = 0; kk < 3; kk++) {
            texteCorr +=
              kk === ChoixQuestions[i]
                ? mettreDernierMotEnCouleurEtGras(TabCorrection[kk])
                : TabCorrection[kk]
            texteCorr += kk < 2 ? ', ' : ' et '
          }
          texteCorr +=
            ChoixQuestions[i] === 3
              ? mettreDernierMotEnCouleurEtGras(TabCorrection[3])
              : TabCorrection[3]
          texteCorr += '.<br>'
          ReponsesCorrectes = [ChoixReponses[ChoixQuestions[i]]]
        }
      } else {
        texteCorr =
          `$${Nbutilises[3]}$ est inférieur à $${Nbutilises[2]}$ mais pas à $${Nbutilises[1]}$ donc l'égalité ` +
          EgaliteDivEuclidienne +
          ' est associée à'
        TabCorrection[1] = `$${Nbutilises[1]}$ est le quotient`
        TabCorrection[2] = `$${Nbutilises[2]}$ est le diviseur`
        texteCorr += ` la division euclidienne de $ ${texNombre(Nbutilises[0])} $ par $ ${Nbutilises[2]} $. Alors, `
        for (let kk = 0; kk < 3; kk++) {
          texteCorr +=
            kk === ChoixQuestions[i]
              ? mettreDernierMotEnCouleurEtGras(TabCorrection[kk])
              : TabCorrection[kk]
          texteCorr += kk < 2 ? ', ' : ' et '
        }
        texteCorr +=
          ChoixQuestions[i] === 3
            ? mettreDernierMotEnCouleurEtGras(TabCorrection[3])
            : TabCorrection[3]
        texteCorr += '.<br>'
        ReponsesCorrectes = [
          ChoixReponses[
            3 - ChoixQuestions[i] === 0 ? 3 : (3 - ChoixQuestions[i]) % 3
          ],
        ]
      }
      if (this.questionJamaisPosee(i, ...Nbutilises)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (this.interactif) {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric)
        }
        handleAnswers(this, i, {
          reponse: {
            value: ReponsesCorrectes.map((reponse) => reponse.toLowerCase()),
            options: { texteSansCasse: true },
          },
        })
        if (context.isAmc) {
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: 'dividende',
              statut: ReponsesCorrectes.includes('dividende'),
            },
            {
              texte: 'diviseur',
              statut: ReponsesCorrectes.includes('diviseur'),
            },
            {
              texte: 'quotient',
              statut: ReponsesCorrectes.includes('quotient'),
            },
            {
              texte: 'reste',
              statut: ReponsesCorrectes.includes('reste'),
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
          }
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
