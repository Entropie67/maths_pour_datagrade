import { orangeMathalea } from '../../lib/colors'
import {
  base10VersBaseN,
  baseNVersBase10,
} from '../../lib/mathFonctions/baseConversions'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = "Effectuer des multiplications dans d'autres bases"
export const dateDePublication = '2/11/2021'

/**
* Multiplications dans une autre base

*
* @author Rémi Angot
*/

export const uuid = 'a7016'

export const refs = {
  'fr-fr': ['PEN23'],
  'fr-ch': [],
}

export default class MultiplicationsBaseN extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix de la base',
      9,
      '3 à 9 (au hasard si laissé vide)',
    ]

    this.video = 'pkp9e8XDH3M'
    this.consigne = `Poser et effectuer les calculs suivants${sp()}:`
    this.nbQuestions = 3

    this.pasDeVersionLatex = true
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    const base =
      this.sup === undefined || this.sup < 3 || this.sup > 9
        ? randint(3, 5)
        : this.sup
    if ([3, 4, 5].includes(base)) {
      this.listeQuestions[0] = `Écrire la table de Pythagore en base ${base}.`
      this.listeCorrections[0] = tableDePythagore(base)
    }
    const indicePremierCalcul = [3, 4, 5].includes(base) ? 1 : 0

    for (
      let i = indicePremierCalcul, texte, texteCorr, m, n, mb, nb, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const n1 = base === 3 ? randint(0, 2) : randint(2, base - 1)
      const n2 = base === 3 ? randint(1, 2) : randint(2, base - 1, n1)
      nb = n2 * 10 + n1
      n = baseNVersBase10(nb, base)
      const m1 = randint(1, base - 1)
      const m2 = randint(2, base - 1)
      const m3 = randint(2, base - 1)
      mb = m3 * 100 + m2 * 10 + m1
      n = baseNVersBase10(nb, base)
      m = baseNVersBase10(mb, base)
      mb = mb.toString()
      nb = nb.toString()
      texte = `$(${mb})_{${base}} \\times (${nb})_{${base}}$`
      if (parseInt(mb) < parseInt(nb)) [mb, nb] = [nb, mb]
      texteCorr =
        `En base ${base}${sp()}:<br>` +
        operation({
          operande1: m,
          operande2: n,
          type: 'multiplication',
          base,
          options: { solution: true, colore: orangeMathalea },
        }) +
        '<br>'
      for (let ligne = nb.length - 1; ligne > -1; ligne--) {
        const retenue = []
        texteCorr += `Calcul de $${nb[ligne]}\\times${mb} :$ <br>`
        for (let colonne = 0; colonne < mb.length; colonne++) {
          const a = nb[ligne]
          const b = mb[mb.length - 1 - colonne]
          let abEnBaseN = base10VersBaseN(Number(a) * Number(b), base)
          if (retenue[colonne - 1]) {
            abEnBaseN = base10VersBaseN(
              parseInt(a) * parseInt(b) + parseInt(retenue[colonne - 1]),
              base,
            )
            texteCorr += `$\\qquad ${a} \\times ${b} + ${retenue[colonne - 1]} = ${parseInt(a) * parseInt(b) + parseInt(retenue[colonne - 1])} = (${abEnBaseN})_{${base}}  $`
          } else {
            texteCorr += `$\\qquad ${a} \\times ${b} = ${Number(a) * Number(b)} = (${abEnBaseN})_{${base}}  $`
          }
          if (Number(a) * Number(b) >= base) {
            texteCorr += `$\\quad$ On écrit ${abEnBaseN[abEnBaseN.length - 1]} et on retient ${abEnBaseN.slice(0, -1)}.<br>`
            retenue[colonne] = abEnBaseN.slice(0, -1).toString()
          } else {
            texteCorr += '<br>'
          }
        }
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

const tableDePythagore = (n: number) => {
  switch (n) {
    case 3:
      return `$\\begin{array}{|c|c|c|}
      \\hline
      \\times & (1)_3 & (2)_3 \\\\
      \\hline
      (1)_3 & (1)_3 & (2)_3 \\\\
      \\hline
      (2)_3 & (2)_3 & (11)_3  \\\\
      \\hline
   \\end{array}$`
    case 4:
      return `$\\begin{array}{|c|c|c|c|}
    \\hline
    \\times & (1)_4 & (2)_4 & (3)_4 \\\\
    \\hline
    (1)_4 & (1)_4 & (2)_4 & (3)_4  \\\\
    \\hline
    (2)_4 & (2)_4 & (10)_4 & (12)_4 \\\\
    \\hline
    (3)_4 & (3)_4 & (12)_4 & (21)_4 \\\\
    \\hline
 \\end{array}$`
    case 5:
      return `$\\begin{array}{|c|c|c|c|c|}
    \\hline
    \\times & (1)_5 & (2)_5 & (3)_5 & (4)_5 \\\\
    \\hline
    (1)_5 & (1)_5 & (2)_5 & (3)_5 & (4)_5  \\\\
    \\hline
    (2)_5 & (2)_5 & (4)_5 & (11)_5 & (13)_5 \\\\
    \\hline
    (3)_5 & (3)_5 & (11)_5 & (14)_5 & (22)_5 \\\\
    \\hline
    (4)_5 & (4)_5 & (13)_5 & (22)_5 & (31)_5 \\\\
    \\hline
 \\end{array}$`
    default:
      return ''
  }
}
