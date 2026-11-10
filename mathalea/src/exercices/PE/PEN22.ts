import { miseEnEvidence } from '../../lib/outils/embellissements'
import { orangeMathalea } from '../../lib/colors'
import { base10VersBaseN } from '../../lib/mathFonctions/baseConversions'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  "Effectuer des additions et soustractions dans d'autres bases"
export const dateDePublication = '31/10/2021'

/**
* Passer d'une écriture en base 10 à l'écriture dans une autre base ou inversement

* * soustraction en base n
* *
* *
*
* @author Jean-claude Lhote pour les opérations posées et Rémi Angot pour la correction détaillée
*/
export const uuid = '3441e'

export const refs = {
  'fr-fr': ['PEN22'],
  'fr-ch': [],
}
export default class AdditionSoustractionBaseN extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Opérations',
      3,
      '1 : Uniquement des additions\n2 : Uniquement des soustractions\n3 Additions et soustractions',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des bases',
      3,
      '1 : Bases 2 à 5\n2 : Bases 12 et 16\n3 Bases 2 à base 16',
    ]
    this.consigne = `Poser et effectuer les calculs suivants${sp()}:`
    this.video = '-bIvS95dmYw'
    this.nbQuestions = 4

    this.pasDeVersionLatex = true
    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = 3
    this.sup2 = 3
  }

  nouvelleVersion() {
    let listeOperations = []
    let listeBases: number[] = []
    if (this.sup === 1) {
      listeOperations = Array(this.nbQuestions).fill('+')
    }
    if (this.sup === 2) {
      listeOperations = Array(this.nbQuestions).fill('-')
    }
    if (this.sup === 3) {
      for (let i = 0; i < this.nbQuestions; i++) {
        listeOperations[i] = i < this.nbQuestions / 2 ? '+' : '-'
      }
    }
    if (this.sup2 === 1) {
      listeBases = combinaisonListes([2, 3, 4, 5], this.nbQuestions)
    }
    if (this.sup2 === 2) {
      listeBases = combinaisonListes([12, 16], this.nbQuestions)
    }
    if (this.sup2 === 3) {
      if (this.nbQuestions < 5) {
        listeBases = combinaisonListes([3, 4, 12, 16], this.nbQuestions)
      } else {
        listeBases = combinaisonListes([3, 4, 5, 6, 12, 16], this.nbQuestions)
      }
    }
    for (
      let i = 0, texte, texteCorr, m, n, mb, nb, base, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      base = listeBases[i]
      if (listeOperations[i] === '+') {
        m = randint(base ** 2, base ** 4)
        n = randint(base ** 2, base ** 4)
        mb = base10VersBaseN(m, base)
        nb = base10VersBaseN(n, base)
        texte = `$(${mb})_{${base}} + (${nb})_{${base}}$`
        texteCorr =
          `En base $${base}$${sp()}:<br>` +
          operation({
            operande1: m,
            operande2: n,
            type: 'addition',
            base,
            options: { solution: true, colore: orangeMathalea },
          })
        const retenue = []
        for (let rang = 0; rang < Math.max(mb.length, nb.length); rang++) {
          const somme: number =
            parseInt(mb[mb.length - 1 - rang] || '0', base) +
            parseInt(nb[nb.length - 1 - rang] || '0', base) +
            parseInt(retenue[rang - 1] || '0', base)
          texteCorr += `<br> Au rang des $${base}^${rang}$${sp()}:  $${mb[mb.length - 1 - rang] || '0'} + ${nb[nb.length - 1 - rang] || '0'} ${retenue[rang - 1] ? '+' + retenue[rang - 1] : ''}`
          if (
            parseInt(mb[mb.length - 1 - rang] || '0', base) > 9 ||
            parseInt(nb[nb.length - 1 - rang] || '0', base) > 9
          ) {
            // Si un chiffre est un lettre
            texteCorr += ` = ${parseInt(mb[mb.length - 1 - rang] || '0', base)} + ${parseInt(nb[nb.length - 1 - rang] || '0', base)}`
          }
          texteCorr += `= ${somme}`
          if (somme >= base) {
            texteCorr += `= (${base10VersBaseN(somme, base)})_{${base}}$ donc on écrit $${base10VersBaseN(somme, base)[1]}$ et on retient $${base10VersBaseN(somme, base)[0]}$. `
            retenue[rang] = base10VersBaseN(somme, base)[0]
          } else if (somme >= 10) {
            texteCorr += `= (${base10VersBaseN(somme, base)})_{${base}}$`
          } else {
            texteCorr += '$'
          }
        }
        texteCorr += `<br>Finalement, $(${mb})_{${base}} + (${nb})_{${base}} = (${miseEnEvidence(base10VersBaseN(m + n, base))})_{${base}}$.`
      } else {
        m = randint(base ** 3, base ** 4)
        n = randint(base ** 2, m)
        mb = base10VersBaseN(m, base)
        nb = base10VersBaseN(n, base)
        texte = `$(${mb})_{${base}} - (${nb})_{${base}}$`
        texteCorr =
          `En base $${base}$${sp()}:<br>` +
          operation({
            operande1: m,
            operande2: n,
            type: 'soustraction',
            base,
            options: { solution: true, colore: orangeMathalea },
          })
        const retenue = []
        for (let rang = 0; rang < Math.max(mb.length, nb.length); rang++) {
          let difference =
            parseInt(mb[mb.length - 1 - rang] || '0', base) -
            (parseInt(nb[nb.length - 1 - rang] || '0', base) +
              parseInt(String(retenue[rang - 1] || '0'), base))
          if (difference < 0) difference += base
          if (retenue[rang - 1]) {
            texteCorr += `<br> Au rang des $${base}^${rang}$${sp()}:  $${mb[mb.length - 1 - rang] || '0'} - (${nb[nb.length - 1 - rang] || '0'} + 1)`
          } else {
            texteCorr += `<br> Au rang des $${base}^${rang}$${sp()}:  $${mb[mb.length - 1 - rang] || '0'} - ${nb[nb.length - 1 - rang] || '0'}`
          }
          if (
            parseInt(mb[mb.length - 1 - rang] || '0', base) > 9 ||
            parseInt(nb[nb.length - 1 - rang] || '0', base) > 9
          ) {
            // Si un chiffre est un lettre
            if (retenue[rang - 1]) {
              texteCorr += ` = ${parseInt(mb[mb.length - 1 - rang] || '0', base)} - (${parseInt(nb[nb.length - 1 - rang] || '0', base)} + 1)`
            } else {
              texteCorr += ` = ${parseInt(mb[mb.length - 1 - rang] || '0', base)} - ${parseInt(nb[nb.length - 1 - rang] || '0', base)}`
            }
          }
          if (
            parseInt(mb[mb.length - 1 - rang] || '0', base) <
            parseInt(nb[nb.length - 1 - rang] || '0', base)
          ) {
            texteCorr += `$ la soustraction est impossible donc on récupère un paquet de $${base}$ au rang supérieur.`
            if (retenue[rang - 1]) {
              texteCorr += `<br> $${base} + ${parseInt(mb[mb.length - 1 - rang] || '0', base)} - (${parseInt(nb[nb.length - 1 - rang] || '0', base)} + 1)`
            } else {
              texteCorr += `<br> $${base} + ${parseInt(mb[mb.length - 1 - rang] || '0', base)} - ${parseInt(nb[nb.length - 1 - rang] || '0', base)}`
            }
            retenue[rang] = 1
          }
          texteCorr += `= ${difference}$`
        }
        texteCorr += `<br>Finalement, $(${mb})_{${base}} - (${nb})_{${base}} = (${miseEnEvidence(base10VersBaseN(m - n, base))})_{${base}}$.`
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
