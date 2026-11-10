import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Exercice from '../Exercice'
export const dateDePublication = '12/07/2026'
export const amcReady = true
export const amcType = 'qcmMult'
export const interactifReady = true

export const titre = 'Utiliser des critères de divisibilité de $2$, $5$ et $10$'

/**
 * Un nombre est-il divisible par 2, 5, 10 ?
 *
 * MGu: exercice remanié pour gérer correctement le mode interactif QCM
 * Mais il faudrait le revoir, car on mélange un tableau avec un QCM...
 * Ajouter un paramètre pour sélectionner le mode d'affichage serait mieux : tableau ou QCM
 * @author Éric Elter (d'après 5NIJ-3 de Rémi Angot)
 */
export const uuid = '70673'

export const refs = {
  'fr-fr': ['5N1autoA-3'],
  'fr-ch': ['9R1NO1C-2', '9R2NO1C-2', '9R3NO1C-2', 'PRQNO08A-6'],
}
export default class TableauCriteresDeDivisibilite25et10 extends Exercice {
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
      'div2', // Divisible uniquement par 2 (pas par 5, ni par 10)
      'div5', // Divisible uniquement par 5 (pas par 2, ni par 10)
      'div10', // Divisible par 2, par 5 et par 10
      'divrien', // Divisible ni par 2, ni par 5, ni par 10
    ]
    // divisible par 2, divisible par 5, divisible par 2 et 5 (donc par 10)...

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
          )} & \\color{blue}{\\text{oui}} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
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
          )} & \\text{non} & \\color{blue}{\\text{oui}} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Le chiffre des unités n'est ni $0$, ni $2$, ni $4$, ni $6$, ni $8$. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$5$',
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
              feedback: `Ce nombre est divisible par $5$ car son chiffre des unités est $${tableauDeNombres[i].toString().charAt(tableauDeNombres[i].toString().length - 1)}$.`,
            },
          ]
          this.autoCorrection[i].enonce =
            `$${texNombre(tableauDeNombres[i])}$ est divisible par\n`
          break
        case 'div10':
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
          )} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} & \\color{blue}{\\text{oui}} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: '$5$',
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
                'Ce nombre est un multiple de $10$. Il est donc divisible par $2$ et par $5$.',
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
          )} & \\text{non} & \\text{non} & \\text{non} \\\\`
          this.autoCorrection[i].propositions = [
            {
              texte: '$2$',
              statut: false,
              feedback:
                "Ce nombre est un nombre impair. Il n'est pas divisible par $2$.",
            },
            {
              texte: '$5$',
              statut: false,
              feedback: "Le chiffre des unités n'est ni $0$, ni $5$.",
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
        lastChoice: 3,
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
      texte = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|}\n'
    }
    if (!context.isHtml && !this.interactif) {
      texte = '\n\n$\\begin{array}{|l|c|c|c|}\n'
    }
    if (!context.isAmc && !this.interactif) {
      texte += '\\hline\n'
      texte +=
        '\\ldots\\text{ est divisible} & \\text{par }2 & \\text{par }5 & \\text{par }10\\\\\n'
      texte += '\\hline\n'
      for (let k = 0; k < this.nbQuestions; k++) {
        texte += `${texNombre(tableauDeNombres[k])} & & & \\\\\n`
        texte += '\\hline\n'
      }
      texte += '\\end{array}\n$'
      this.listeQuestions.push(texte)
    }

    // la correction
    if (context.isHtml && !this.interactif) {
      texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|c|}\n'
    }
    if (!context.isHtml && !context.isAmc && !this.interactif) {
      texteCorr = '$\\begin{array}{|l|c|c|c|}\n'
    }

    if (!context.isAmc && !this.interactif) {
      texteCorr += '\\hline\n'
      texteCorr +=
        '\\ldots\\text{ est divisible} & \\text{par }2 & \\text{par }5 & \\text{par }10\\\\\n'
      texteCorr += '\\hline\n'
      for (let l = 0; l < this.nbQuestions; l++) {
        texteCorr += tableauDeNombresAvecCorrection[l]
        texteCorr += '\\hline\n'
      }
      texteCorr += '\\end{array}$\n'

      // Rappel des critères de divisibilité avec explications détaillées
      if (this.correctionDetaillee) {
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
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{5}$ :</b> un nombre est divisible par $5$ si son chiffre des unités est $0$ ou $5$, ${conclusionSimple(5)}</li>\n`
          texteCorr += `<li style="margin-top:0.6em"><b>Par $\\mathbf{10}$ :</b> un nombre est divisible par $10$ si son chiffre des unités est $0$, ${conclusionSimple(10)}</li>\n`
          texteCorr += `</ul>\n`
        } else {
          texteCorr += `\n\\medskip\n{\\bfseries Rappel des critères de divisibilité :}\n\\begin{itemize}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $2$ :} un nombre est divisible par $2$ si son chiffre des unités est $0$, $2$, $4$, $6$ ou $8$, ${conclusionSimple(2)}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $5$ :} un nombre est divisible par $5$ si son chiffre des unités est $0$ ou $5$, ${conclusionSimple(5)}\n`
          texteCorr += `\\vspace{0.4em}\\item {\\bfseries Par $10$ :} un nombre est divisible par $10$ si son chiffre des unités est $0$, ${conclusionSimple(10)}\n`
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
