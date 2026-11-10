import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

export const titre =
  'Utiliser des critères de divisibilité de $2$, $3$, $5$, $9$ et $10$'

/**
 * Un nombre est-il divisible par 2, 3, 5, 9 ?
 *
 * MGu: exercice remanié pour gérer correctement le mode interactif QCM
 * Mais il faudrait le revoir, car on mélange un tableau avec un QCM...
 * Ajouter un paramètre pour sélectionner le mode d'affichage serait mieux : tableau ou QCM
 * @author Rémi Angot
 */
export const uuid = 'fa3ec'

export const refs = {
  'fr-fr': ['5N1J-3', '3AutoN09-1'],
  'fr-2016': ['6N43-2', '5A11-4', '3AutoN09-1'],
  'fr-ch': ['9R1NO1C-5', '9R2NO1C-5', '9R3NO1C-5', 'PRQNO08A-8', '1mCN-1'],
}
export default class TableauCriteresDeDivisibilite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Gros nombres', false]

    this.nbQuestions = 5

    this.sup = false // nombres plus grands pour les élèves de "sup"
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    if (!this.interactif) {
      this.listeAvecNumerotation = false
      this.consigne =
        'Compléter le tableau en mettant oui ou non dans chaque case.'
    } else {
      this.listeAvecNumerotation = true
      this.consigne =
        'Mettre une croix dans la case qui convient (ou les cases qui conviennent).'
    }

    const listeDesNombresPossibles = [
      'div2', // Divisible uniquement par 2
      'div3',
      'div39', // Divisible par 3 et 9
      'div5',
      'div25',
      'div23',
      'div239', // Divisible par 2, 3 et 9
      'div35',
      'div2359', // Divisible par 2, 3, 5 et 9
      'divrien', // Divisible ni par 2, ni par 3 ni par 5 ni par 9
    ]
    // divisible par 2, divisible par 3, divisible par 3 et 9...

    const listeDesTypesDeNombres = combinaisonListes(
      listeDesNombresPossibles,
      this.nbQuestions,
    )
    const tableauDeNombres: number[] = []

    const tableauDeNombresAvecCorrection = []
    const listeDeFacteurs = [
      7, 13, 17, 19, 23, 29, 37, 43, 47, 53, 59, 67, 73, 79, 83, 89, 97, 103,
      107, 109, 113, 127, 137, 139, 149, 157, 163, 167, 173, 179, 193, 197, 199,
      223, 227, 229, 233, 239, 257, 263, 269, 277, 281, 283, 293,
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++, i++) {
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = {}
      switch (listeDesTypesDeNombres[i]) {
        case 'div2':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              2 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\color{blue}{\\text{oui}} & \\text{non} & \\text{non} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$3$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $3$.",
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Le chiffre des unités est $0$, $2$, $4$, $6$ ou $8$, il est donc divisible par $2$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`

          break
        case 'div3':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              3 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} & \\text{non}& \\text{non}  \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est ni $0$, ni $2$, ni $4$, ni $6$, ni $8$. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est divisible par $3$ car la somme de ses chiffres est divisible par $3$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div39':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              9 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est ni $0$, ni $2$, ni $4$, ni $6$, ni $8$. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },

            {
              texte: '$9$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est divisible par $9$ et par $3$ car la somme de ses chiffres est divisible par $9$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div5':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              5 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\text{non} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non}  & \\text{non}\\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est ni $0$, ni $2$, ni $4$, ni $6$, ni $8$. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$3$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $3$.",
            },
            {
              texte: '$5$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback: `Ce nombre est divisible par $5$ car son chiffre des unités est $${tableauDeNombres[i].toString().charAt(tableauDeNombres[i].toString().length - 1)}$.`,
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div25':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              10 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\color{blue}{\\text{oui}} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} & \\color{blue}{\\text{oui}}\\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$3$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $3$.",
            },
            {
              texte: '$5$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est un multiple de $10$. Il est donc divisible par $2$ et par $5$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div23':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              6 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\text{non} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est un nombre pair. Il est donc divisible par $2$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div239':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              18 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },
            {
              texte: '$9$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est un nombre pair. Il est donc divisible par $2$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div35':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              15 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\text{non} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est ni $0$, ni $2$, ni $4$, ni $6$, ni $8$. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est un nombre pair. Il est donc divisible par $2$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div2359':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              90 *
              (this.sup
                ? choice(listeDeFacteurs.slice(30)) *
                  choice(listeDeFacteurs.slice(30))
                : choice(listeDeFacteurs)),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}}\\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$3$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$9$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$10$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'aucun de ces nombres',
              statut: false,
              feedback:
                'Ce nombre est un nombre pair. Il est donc divisible par $2$.',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'divrien':
          tableauDeNombres[i] = genereValeurUnique(
            tableauDeNombres,
            () =>
              choice(listeDeFacteurs) *
              (this.sup ? choice(listeDeFacteurs.slice(30)) : 1),
          )
          tableauDeNombresAvecCorrection[i] = `${texNombre(
            tableauDeNombres[i],
          )} & \\text{non} & \\text{non} & \\text{non} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Ce nombre est un nombre impair. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$3$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $3$.",
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
            },
            {
              texte: '$9$',
              statut: false,
              feedback: "La somme des chiffres n'est pas divisible par $9$.",
            },
            {
              texte: '$10$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est pas $0$, donc il n'est pas divisible par $10$.",
            },
            {
              texte: 'aucun de ces nombres',
              statut: true,
              feedback: 'Correct !',
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
      }
      this.autoCorrection[i].options = {
        ordered: true,
        lastChoice: 4,
      }

      if (this.interactif || context.isAmc) {
        const props = propositionsQcm(this, i)
        this.listeQuestions[i] =
          `$${texNombre(tableauDeNombres[i])}$ est divisible par : ` +
          props.texte
        this.listeCorrections[i] = props.texteCorr
      }
    } // fin de boucle de préparation des question
    // mise en forme selon les cas de figures
    // l'enoncé
    let texte = ''
    let texteCorr = ''
    if (context.isHtml && !this.interactif) {
      texte = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|c|c|}\n'
    }
    if (!context.isHtml && !this.interactif) {
      texte = '\n\n$\\begin{array}{|l|c|c|c|c|c|}\n'
    }
    if (!context.isAmc && !this.interactif) {
      texte += '\\hline\n'
      texte +=
        '\\ldots\\text{ est divisible} & \\text{par }2 & \\text{par }3 & \\text{par }5 & \\text{par }9 & \\text{par }10\\\\\n'
      texte += '\\hline\n'
      for (let k = 0; k < this.nbQuestions; k++) {
        texte += `${texNombre(tableauDeNombres[k])} & & & & & \\\\\n`
        texte += '\\hline\n'
      }
      texte += '\\end{array}\n$'
      this.listeQuestions.push(texte)
    }

    // la correction
    if (context.isHtml && !this.interactif) {
      texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|c|c|}\n'
    }
    if (!context.isHtml && !context.isAmc && !this.interactif) {
      texteCorr = '$\\begin{array}{|l|c|c|c|c|c|}\n'
    }

    if (!context.isAmc && !this.interactif) {
      texteCorr += '\\hline\n'
      texteCorr +=
        '\\ldots\\text{ est divisible} & \\text{par }2 & \\text{par }3 & \\text{par }5 & \\text{par }9 & \\text{par }10\\\\\n'
      texteCorr += '\\hline\n'
      for (let l = 0; l < this.nbQuestions; l++) {
        texteCorr += tableauDeNombresAvecCorrection[l]
        texteCorr += '\\hline\n'
      }
      texteCorr += '\\end{array}$\n'

      // Rappel des critères de divisibilité avec explications détaillées
      if (this.correctionDetaillee) {
        const digitSum = (n: number): number =>
          n
            .toString()
            .split('')
            .reduce((acc, d) => acc + Number(d), 0)
        const digitSumExpr = (n: number): string =>
          n.toString().split('').join(' + ') + ' = ' + digitSum(n)
        const joinAnd = (arr: string[]): string => {
          if (arr.length === 0) return ''
          if (arr.length === 1) return arr[0]
          return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1]
        }
        const nums = tableauDeNombres.slice(0, this.nbQuestions)
        const fmt = (n: number) => `$${texNombre(n)}$`
        const conclusionSimple = (d: number): string => {
          const yes = nums.filter((n) => n % d === 0).map(fmt)
          const no = nums.filter((n) => n % d !== 0).map(fmt)
          const parts: string[] = []
          if (yes.length > 0) {
            parts.push(
              `${joinAnd(yes)} ${yes.length > 1 ? 'sont divisibles' : 'est divisible'} par $${d}$`,
            )
          }
          if (no.length > 0) {
            parts.push(
              `${joinAnd(no)} ne ${no.length > 1 ? 'sont' : 'est'} pas divisible${no.length > 1 ? 's' : ''} par $${d}$`,
            )
          }
          return 'donc ' + parts.join(' et ') + '.'
        }

        if (context.isHtml) {
          texteCorr += `<br><br><b>Rappel des critères de divisibilité :</b><br>\n<ul>\n`
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{2}$ :</b> un nombre est divisible par $2$ si son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$, ${conclusionSimple(2)}</li>\n`
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{3}$ :</b> un nombre est divisible par $3$ si la somme de ses chiffres est divisible par $3$.\n<ul>\n`
          for (const n of nums) {
            const s = digitSum(n)
            const div = n % 3 === 0
            texteCorr += `<li>Pour $${texNombre(n)}$ : $${digitSumExpr(n)}$, $${s}$ ${div ? 'est' : "n'est pas"} divisible par $3$ donc $${texNombre(n)}$ ${div ? 'est' : "n'est pas"} divisible par $3$.</li>\n`
          }
          texteCorr += `</ul></li>\n`
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{5}$ :</b> un nombre est divisible par $5$ si son chiffre des unités est $0$ ou $5$, ${conclusionSimple(5)}</li>\n`
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{9}$ :</b> un nombre est divisible par $9$ si la somme de ses chiffres est divisible par $9$.\n<ul>\n`
          for (const n of nums) {
            const s = digitSum(n)
            const div = n % 9 === 0
            texteCorr += `<li>Pour $${texNombre(n)}$ : $${digitSumExpr(n)}$, $${s}$ ${div ? 'est' : "n'est pas"} divisible par $9$ donc $${texNombre(n)}$ ${div ? 'est' : "n'est pas"} divisible par $9$.</li>\n`
          }
          texteCorr += `</ul></li>\n`
          texteCorr += `</ul>\n`
        } else {
          texteCorr += `\n\\medskip\n{\\bfseries Rappel des critères de divisibilité :}\n\\begin{itemize}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $2$ :} un nombre est divisible par $2$ si son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$, ${conclusionSimple(2)}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $3$ :} un nombre est divisible par $3$ si la somme de ses chiffres est divisible par $3$.\n\\begin{itemize}\n`
          for (const n of nums) {
            const s = digitSum(n)
            const div = n % 3 === 0
            texteCorr += `\\item Pour $${texNombre(n)}$ : $${digitSumExpr(n)}$, $${s}$ ${div ? 'est' : "n'est pas"} divisible par $3$ donc $${texNombre(n)}$ ${div ? 'est' : "n'est pas"} divisible par $3$.\n`
          }
          texteCorr += `\\end{itemize}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $5$ :} un nombre est divisible par $5$ si son chiffre des unités est $0$ ou $5$, ${conclusionSimple(5)}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $9$ :} un nombre est divisible par $9$ si la somme de ses chiffres est divisible par $9$.\n\\begin{itemize}\n`
          for (const n of nums) {
            const s = digitSum(n)
            const div = n % 9 === 0
            texteCorr += `\\item Pour $${texNombre(n)}$ : $${digitSumExpr(n)}$, $${s}$ ${div ? 'est' : "n'est pas"} divisible par $9$ donc $${texNombre(n)}$ ${div ? 'est' : "n'est pas"} divisible par $9$.\n`
          }
          texteCorr += `\\end{itemize}\n`
          texteCorr += `\\end{itemize}\n`
        }
      }

      this.listeCorrections.push(texteCorr)
    }
  }
}

function genereValeurUnique(
  tableau: number[],
  generer: () => number,
  maxEssais = 50,
): number {
  let valeur: number
  let essais = 0

  do {
    valeur = generer()
    essais++
  } while (tableau.includes(valeur) && essais < maxEssais)

  if (essais === maxEssais) {
    console.error('Impossible de générer une valeur unique')
  }
  return valeur
}
