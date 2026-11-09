import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texPrix } from '../../lib/format/style'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Remplir une facture'

/**
 * Compléter une facture
 * @author Rémi Angot

 * publié le
*/
export const uuid = '837cd'

export const refs = {
  'fr-fr': ['6N3Q-4', 'BP2CCF7'],
  'fr-2016': ['6P13-1', 'BP2CCF7'],
  'fr-ch': ['10CTFA1C-5', '10LCFA1C-5', '10LSFA1C-5', 'PRQPF05A-6'],
}
export default class CompleterUneFacture extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Sans réduction\n2 : Avec réduction',
    ]

    this.consigne = 'Compléter le tableau suivant.'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 2 // Niveau de difficulté
    // Pour les exercices chronométrés. 50 par défaut pour les exercices avec du texte
  }

  nouvelleVersion() {
    for (
      let i = 0,
        article1,
        q1,
        p1: number,
        article2,
        q2,
        p2: number,
        article3,
        q3,
        p3: number,
        r,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const listeArticles: [string, number][] = [
        ['Feuilletés au fromage', randint(50, 80) / 10],
        ['Feuilletés à la viande', randint(50, 80) / 10],
        ['Pizzas', randint(80, 140) / 10],
        ['Glaces à la vanille', randint(20, 60) / 10],
        ['Glaces au chocolat', randint(20, 60) / 10],
        ['Filets de saumon', randint(150, 200) / 10],
        ['Aiguillettes de poulet', randint(400, 700) / 10],
      ]
      article1 = choice(listeArticles)
      article2 = choice(listeArticles, [article1])
      article3 = choice(listeArticles, [article1, article2])
      p1 = article1[1]
      p2 = article2[1]
      p3 = article1[1]
      q1 = randint(2, 8)
      q2 = randint(2, 8, [q1])
      q3 = randint(2, 8, [q1, q2])
      r = randint(3, 9)

      if (this.sup === 1) {
        if (context.isHtml) {
          texte = '$\\def\\arraystretch{2.5}\\begin{array}{|c|c|c|c|}\n'
        } else {
          texte = '$\\begin{array}{|c|c|c|c|}\n'
        }
        texte += '\\hline\n'
        texte +=
          '\\text{Désignations} & \\text{Quantités} & \\text{Prix unitaires H.T.} & \\text{Montants} \\\\ \n'
        texte += '\\hline\n'
        texte += `\\text{${article1[0]}} & ${q1} & ${texPrix(p1)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += `\\text{${article2[0]}} & ${q2} & ${texPrix(p2)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += `\\text{${article3[0]}} & ${q3} & ${texPrix(p3)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += '\\text{Prix total (H.T.)} & & & \\ldots\\ldots \\\\ \n'
        texte += '\\hline\\hline\n'
        texte += '\\text{TVA (20~\\%)} & & & \\ldots\\ldots \\\\ \n'
        texte += '\\hline\n'
        texte += '\\text{Prix total (T.T.C.)} & & & \\ldots\\ldots \\\\ \n '
        texte += '\\hline\n'
        texte += '\\end{array}$'

        if (context.isHtml) {
          texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|c|c|c|c|}\n'
        } else {
          texteCorr = '$\\begin{array}{|c|c|c|c|}\n'
        }
        texteCorr += '\\hline\n'
        texteCorr +=
          '\\text{Désignations} & \\text{Quantités} & \\text{Prix unitaires H.T.} & \\text{Montants} \\\\ \n'
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article1[0]}} & ${q1} & ${texPrix(p1)} & ${miseEnEvidence(texPrix(p1 * q1))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article2[0]}} & ${q2} & ${texPrix(p2)} & ${miseEnEvidence(texPrix(p2 * q2))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article3[0]}} & ${q3} & ${texPrix(p3)} & ${miseEnEvidence(texPrix(p3 * q3))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Prix total (H.T.)} & & & ${miseEnEvidence(texPrix(p1 * q1 + p2 * q2 + p3 * q3))} \\\\ \n`
        texteCorr += '\\hline\\hline\n'
        texteCorr += `\\text{TVA (20~\\%)} & & & ${miseEnEvidence(texPrix((p1 * q1 + p2 * q2 + p3 * q3) * 0.2))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Prix total (T.T.C.)} & & & ${miseEnEvidence(texPrix((p1 * q1 + p2 * q2 + p3 * q3) * 1.2))} \\\\ \n `
        texteCorr += '\\hline\n'

        texteCorr += '\\end{array}$'
      } else {
        if (context.isHtml) {
          texte = '$\\def\\arraystretch{2.5}\\begin{array}{|c|c|c|c|}\n'
        } else {
          texte = '$\\begin{array}{|c|c|c|c|}\n'
        }
        texte += '\\hline\n'
        texte +=
          '\\text{Désignations} & \\text{Quantités} & \\text{Prix unitaires H.T.} & \\text{Montants} \\\\ \n'
        texte += '\\hline\n'
        texte += `\\text{${article1[0]}} & ${q1} & ${texPrix(p1)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += `\\text{${article2[0]}} & ${q2} & ${texPrix(p2)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += `\\text{${article3[0]}} & ${q3} & ${texPrix(p3)} & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += '\\text{Prix total brut (H.T.)} & & & \\ldots\\ldots \\\\ \n'
        texte += '\\hline\n'
        texte += `\\text{Réduction (${r}~\\%)} & & & \\ldots\\ldots \\\\ \n`
        texte += '\\hline\n'
        texte += '\\text{Prix total net (H.T.)} & & & \\ldots\\ldots \\\\ \n'
        texte += '\\hline\\hline\n'
        texte += '\\text{TVA (20~\\%)} & & & \\ldots\\ldots \\\\ \n'
        texte += '\\hline\n'
        texte += '\\text{Prix total (T.T.C.)} & & & \\ldots\\ldots \\\\ \n '
        texte += '\\hline\n'
        texte += '\\end{array}$'

        if (context.isHtml) {
          texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|c|c|c|c|}\n'
        } else {
          texteCorr = '$\\begin{array}{|c|c|c|c|}\n'
        }
        texteCorr += '\\hline\n'
        texteCorr +=
          '\\text{Désignations} & \\text{Quantités} & \\text{Prix unitaires H.T.} & \\text{Montants} \\\\ \n'
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article1[0]}} & ${q1} & ${texPrix(p1)} & ${miseEnEvidence(texPrix(p1 * q1))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article2[0]}} & ${q2} & ${texPrix(p2)} & ${miseEnEvidence(texPrix(p2 * q2))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{${article3[0]}} & ${q3} & ${texPrix(p3)} & ${miseEnEvidence(texPrix(p3 * q3))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Prix total brut (H.T.)} & & & ${miseEnEvidence(texPrix(p1 * q1 + p2 * q2 + p3 * q3))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Réduction (${r}~\\%)} & & & ${miseEnEvidence(texPrix(((p1 * q1 + p2 * q2 + p3 * q3) * r) / 100))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Prix total net (H.T.)} & & & ${miseEnEvidence(texPrix((p1 * q1 + p2 * q2 + p3 * q3) * (1 - r / 100)))} \\\\ \n`
        texteCorr += '\\hline\\hline\n'
        texteCorr += `\\text{TVA (20~\\%)} & & & ${miseEnEvidence(texPrix((p1 * q1 + p2 * q2 + p3 * q3) * (1 - r / 100) * 0.2))} \\\\ \n`
        texteCorr += '\\hline\n'
        texteCorr += `\\text{Prix total (T.T.C.)} & & & ${miseEnEvidence(texPrix((p1 * q1 + p2 * q2 + p3 * q3) * (1 - r / 100) * 1.2))} \\\\ \n `
        texteCorr += '\\hline\n'

        texteCorr += '\\end{array}$'
      }

      if (this.questionJamaisPosee(i, p1, p2, p3)) {
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
