import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { itemize, listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre =
  'Traduire un programme de calcul par une expression littérale'

export const dateDeModifImportante = '15/10/2022' // Ajout du programme équivalent dans la correction

/**
 * Traduire un programme de calcul par une expression littérale de la forme ax+b après simplification
 * @author Rémi Angot
 * Ajout de la possibilité d'afficher un résultat qui n'est pas développé par Guillaume Valmont le 11/05/2022
 */
export const uuid = '12bb6'

export const refs = {
  'fr-fr': ['5N5A-2'],
  'fr-2016': ['5L10-2'],
  'fr-ch': ['9R2FA3C-3', '9R3FA3C-3', '10LCFA4C-3', '10LSFA4C-3', '11CTFA3C-3', '11LCFA3C-3', '11LSFA3C-3', 'PRQAL01A-2', 'PRQAL01B-2'],
}
export default class TraduireUnProgrammeDeCalcul extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireCaseACocher = ['Résultat développé']
    this.sup = true
  }

  nouvelleVersion() {
    const typeDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const a = randint(4, 11)
      const b = randint(2, 11)
      const c = randint(2, 11)
      const d = randint(2, 5)
      // Le programme équivalent est de la forme Ax + B
      let A = 0
      let B = 0
      switch (listeTypeDeQuestions[i]) {
        case 1: // (x+a)*b+c
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Ajouter $${a}$`,
            `Multiplier par $${b}$`,
            `Ajouter $${c}$`,
          ])
          texte +=
            'Si on note $x$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$x\\xrightarrow{+${a}} x+${a}\\xrightarrow{\\times  ${b}}(x+${a})\\times  ${b}`
          if (this.sup) texteCorr += `=${b}x+${a * b}`
          texteCorr += `\\xrightarrow{+${c}}`
          if (this.sup) texteCorr += `${b}x+${a * b + c}`
          else texteCorr += `(x+${a})\\times  ${b} + ${c}`
          texteCorr += '$<br>'
          texteCorr += 'Le résultat du programme est donc '
          if (this.sup)
            texteCorr += `$${miseEnEvidence(`${b}x+${a * b + c}`)}$.`
          else
            texteCorr += `$${miseEnEvidence(`(x+${a})\\times  ${b} + ${c}`)}$.`
          if (this.sup) [A, B] = [b, a * b + c]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: this.sup
                ? `$${b}x+${a * b + c}$`
                : `$(x+${a})\\times  ${b} + ${c}$`,
              statut: true,
            },
            {
              texte: `$${b}x+${a + c}$`,
              statut: false,
            },
            {
              texte: this.sup
                ? `$${b}x+${a * c}$`
                : `$(x+${a})\\times  ${b + c}$`,
              statut: false,
            },
            {
              texte: `$${b * a}x+${c}$`,
              statut: false,
            },
          ]
          break
        case 2: // (ax+b)*c
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Multiplier par $${a}$`,
            `Ajouter $${b}$`,
            `Multiplier par $${c}$`,
          ])
          texte +=
            'Si on note $y$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$y\\xrightarrow{\\times  ${a}} ${a}y\\xrightarrow{+${b}}${a}y+${b} \\xrightarrow{\\times  ${c}}(${a}y+${b})\\times ${c}`
          if (this.sup) texteCorr += `=${a * c}y+${b * c}`
          texteCorr += '$<br>'
          texteCorr += 'Le résultat du programme est donc '
          if (this.sup)
            texteCorr += `$${miseEnEvidence(`${a * c}y+${b * c}`)}$.`
          else texteCorr += `$${miseEnEvidence(`(${a}y+${b})\\times ${c}`)}$.`
          if (this.sup) [A, B] = [a * c, b * c]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: this.sup
                ? `$${a * c}y+${b * c}$`
                : `$(${a}y+${b})\\times ${c}$`,
              statut: true,
            },
            {
              texte: `$${a}y+${b * c}$`,
              statut: false,
            },
            {
              texte: this.sup
                ? `$${b * a}y+${c}$`
                : `$(${c}y + ${b}) \\times ${a}$`,
              statut: false,
            },
            {
              texte: `$${b}y+${a * c}$`,
              statut: false,
            },
          ]
          break
        case 3: // ax+b-2x
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Multiplier par $${a}$`,
            `Ajouter $${b}$`,
            'Soustraire le double du nombre de départ',
          ])
          texte +=
            'Si on note $a$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$a\\xrightarrow{\\times  ${a}} ${a}a\\xrightarrow{+${b}}${a}a+${b} \\xrightarrow{-2a}${a}a+${b}-2a=${a - 2}a+${b}$`
          texteCorr += '<br>'
          texteCorr += `Le résultat du programme est donc $${miseEnEvidence(`${a - 2}a+${b}`)}$.`
          if (this.sup) [A, B] = [a - 2, b]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${a - 2}a+${b}$`,
              statut: true,
            },
            {
              texte: this.sup
                ? `$${a + b - 2}a$`
                : `$(${a}a + ${b}) \\times 2$`,
              statut: false,
            },
            {
              texte: `$${a}a+${b - 2}$`,
              statut: false,
            },
            {
              texte: this.sup ? `$${a + b}-2a$` : `$(2a + ${b}) \\times ${a}$`,
              statut: false,
            },
          ]
          break
        case 4: // ax+b+3x
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Multiplier par $${a}$`,
            `Ajouter $${b}$`,
            'Ajouter le triple du nombre de départ',
          ])
          texte +=
            'Si on note $t$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$t\\xrightarrow{\\times  ${a}} ${a}t\\xrightarrow{+${b}}${a}t+${b} \\xrightarrow{+3t}${a}t+${b}+3t=${a + 3}t+${b}$`
          texteCorr += '<br>'
          texteCorr += `Le résultat du programme est donc $${miseEnEvidence(`${a + 3}t+${b}`)}$.`
          if (this.sup) [A, B] = [a + 3, b]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${a + 3}t+${b}$`,
              statut: true,
            },
            {
              texte: `$${a + b + 3}t$`,
              statut: false,
            },
            {
              texte: this.sup ? `$${a + b}t+3t$` : `$(${a}t + ${b}) \\times 3$`,
              statut: false,
            },
            {
              texte: this.sup ? `$${a + b}t-3t$` : `$(3t + ${b}) \\times ${a}$`,
              statut: false,
            },
          ]
          break
        case 5: // (ax+b)*c-d
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Multiplier par $${a}$`,
            `Ajouter $${b}$`,
            `Multiplier par $${c}$`,
            `Retrancher $${d}$`,
          ])
          texte +=
            'Si on note $x$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$x\\xrightarrow{\\times  ${a}} ${a}x\\xrightarrow{+${b}}${a}x+${b} \\xrightarrow{\\times  ${c}}(${a}x+${b})\\times  ${c}`
          if (this.sup) texteCorr += `=${a * c}x+${b * c}`
          texteCorr += `\\xrightarrow{-${d}}`
          if (this.sup) texteCorr += `${a * c}x+${b * c - d}`
          else texteCorr += `(${a}x+${b})\\times  ${c} - ${d}`
          texteCorr += '$<br>'
          texteCorr += 'Le résultat du programme est donc '
          if (this.sup)
            texteCorr += `$${miseEnEvidence(`${a * c}x+${b * c - d}`)}$.`
          else
            texteCorr += `$${miseEnEvidence(`(${a}x+${b})\\times  ${c} - ${d}`)}$.`
          if (this.sup) [A, B] = [a * c, b * c - d]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: this.sup
                ? `$${a * c}x+${b * c - d}$`
                : `$(${a}x+${b})\\times  ${c} - ${d}$`,
              statut: true,
            },
            {
              texte: `$${a}x+${ecritureParentheseSiNegatif(b * c - d)}$`,
              statut: false,
            },
            {
              texte: `$${a + b}x+${ecritureParentheseSiNegatif(c - d)}$`,
              statut: false,
            },
            {
              texte: this.sup
                ? `$${a + b * c}x-${d}$`
                : `$(${a + b}x - ${d}) \\times ${c}$`,
              statut: false,
            },
          ]
          break
        case 6: // (ax+b)*c+x
          texte = 'Voici un programme de calcul : \n'
          texte += itemize([
            'Choisir un nombre',
            `Multiplier par $${a}$`,
            `Ajouter $${b}$`,
            `Multiplier par $${c}$`,
            'Ajouter le nombre de départ',
          ])
          texte +=
            'Si on note $y$ le nombre de départ, quel est le résultat du programme de calcul ?'
          texteCorr = `$y\\xrightarrow{\\times  ${a}} ${a}y\\xrightarrow{+${b}}${a}y+${b} \\xrightarrow{\\times  ${c}}(${a}y+${b})\\times  ${c}`
          if (this.sup) texteCorr += `=${a * c}y+${b * c}`
          texteCorr += '\\xrightarrow{+y}'
          if (this.sup)
            texteCorr += `${a * c}y+${b * c}+y=${a * c + 1}y+${b * c}`
          else texteCorr += `(${a}y+${b})\\times  ${c} + y`
          texteCorr += '$<br>'
          texteCorr += 'Le résultat du programme est donc '
          if (this.sup)
            texteCorr += `$${miseEnEvidence(`${a * c + 1}y+${b * c}`)}$.`
          else
            texteCorr += `$${miseEnEvidence(`(${a}y+${b})\\times  ${c} + y`)}$.`
          if (this.sup) [A, B] = [a * c + 1, b * c]
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: this.sup
                ? `$${a * c + 1}y+${b * c}$`
                : `$(${a}y+${b})\\times  ${c} + y$`,
              statut: true,
            },
            {
              texte: `$${a + 1}y+${b * c}$`,
              statut: false,
            },
            {
              texte: this.sup ? `$${a}y+${c}$` : `$(${a}y+${b})\\times  ${c}$`,
              statut: false,
            },
            {
              texte: `$${a + b + c + 1}y$`,
              statut: false,
            },
          ]
          break
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }
      if (this.sup) {
        texteCorr += '<br><br>Le programme de calcul est équivalent à :'
        texteCorr += itemize([
          `Multiplier par $${A}$`,
          `${B > 0 ? 'Ajouter' : 'Enlever'} $${Math.abs(B)}$`,
        ])
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (context.vue === 'diap') {
          texte = texte.replace(
            ', quel est le résultat du programme de calcul ?',
            ',<br> quel est le résultat de ce programme ?',
          )
        }
        if (!context.isHtml && i === 0) {
          texte = '\\setlength\\itemsep{1em}' + texte
        } // espacement entre les questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
