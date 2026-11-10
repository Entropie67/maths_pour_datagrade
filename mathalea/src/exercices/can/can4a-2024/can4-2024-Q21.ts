import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import { scratchblock } from '../../../modules/scratchblock'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Comprendre un programme scratch'
export const interactifReady = true

export const uuid = 'fdd2f'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(2, 6)
    const n = this.canOfficielle ? 50 : choice([10, 20, 50, 100])
    let prog0 = '\\begin{scratch}[print,fill,blocks,scale=0.8]\n'
    prog0 += '\\blockinit{quand \\greenflag est cliqué}\n'
    prog0 += "\\blocklook{Le lutin est placé au centre de l'écran} \n"
    prog0 += `\\blockrepeat{répéter \\ovalnum{${a}} fois}\n`
    prog0 += '{\n'
    prog0 += `\\blockmove{avancer de \\ovalnum{${n}} pas}\n`
    prog0 += '\\blockmove{attendre \\ovalmove{2} secondes}\n'
    prog0 += '}\n'
    prog0 += '\\end{scratch}<br>'
    let prog2 = '\\begin{scratch}[print,fill,blocks,scale=0.8]\n'
    prog2 += '\\blockinit{quand \\greenflag est cliqué}\n'
    prog2 += '\\blockrepeat{répéter \\ovalnum{4} fois}\n'
    prog2 += '{\n'
    prog2 += "\\blockpen{stylo en position d'écriture} \n"
    prog2 += '\\blockmove{avancer de \\ovalnum{100} pas}\n'
    prog2 += '\\blockmove{tourner \\turnright{} de \\ovalnum{...} degrés}\n'
    prog2 += '}\n'
    prog2 += '\\end{scratch}<br>'

    let prog3 = '\\begin{scratch}[print,fill,blocks,scale=0.8]\n'
    prog3 += '\\blockinit{quand \\greenflag est cliqué}\n'
    prog3 += '\\blockrepeat{répéter \\ovalnum{3} fois}\n'
    prog3 += '{\n'
    prog3 += "\\blockpen{stylo en position d'écriture} \n"
    prog3 += '\\blockmove{avancer de \\ovalnum{100} pas}\n'
    prog3 += '\\blockmove{tourner \\turnright{} de \\ovalnum{...} degrés}\n'
    prog3 += '}\n'
    prog3 += '\\end{scratch}<br>'

    let prog4 = '\\begin{scratch}[print,fill,blocks,scale=0.8]\n'
    prog4 += '\\blockinit{quand \\greenflag est cliqué}\n'
    prog4 += '\\blockrepeat{répéter \\ovalnum{...} fois}\n'
    prog4 += '{\n'
    prog4 += "\\blockpen{stylo en position d'écriture} \n"
    prog4 += '\\blockmove{avancer de \\ovalnum{100} pas}\n'
    prog4 += '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}\n'
    prog4 += '\\blockmove{avancer de \\ovalnum{50} pas}\n'
    prog4 += '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}\n'
    prog4 += '}\n'
    prog4 += '\\end{scratch}<br>'
    if (this.canOfficielle) {
      this.reponse = 150
      this.question = `${scratchblock(prog0)}`

      this.question +=
        "À l'issue de l'exécution de ce programme, de combien de pas le lutin a-t-il avancé ?"

      this.correction = `Le lutin a avancé de $3\\times 50 =${miseEnEvidence('150')}$ pas.`

      this.canReponseACompleter = '$\\ldots$ pas'
      if (this.interactif) {
        this.optionsChampTexte = { texteApres: 'pas ' }
      }
    } else {
      const choix = choice(['a', 'b', 'c', 'd']) //
      if (choix === 'a') {
        this.reponse = 90
        this.question = `${scratchblock(prog2)}`

        this.question +=
          'Quel nombre doit-on écrire à la place des pointillés pour tracer un carré ?'

        this.correction = `Un carré a des angles droits, il faut donc écrire  $${miseEnEvidence(90)}$.`
      }
      if (choix === 'b') {
        this.reponse = 120
        this.question = `${scratchblock(prog3)}`

        this.question +=
          'Quel nombre doit-on écrire à la place des pointillés pour tracer un triangle équilatéral ?'

        this.correction = `Un triangle équilatéral a des anlges de $60°$.<br>
     Le lutin doit tourner de $180-60=120°$ après avoir tracé un côté. <br>
     Ainsi, à la place des pointillés il faut écrire  $${miseEnEvidence(120)}$.`
      }
      if (choix === 'c') {
        this.reponse = 2
        this.question = `${scratchblock(prog4)}`

        this.question +=
          'Quel nombre doit-on écrire à la place des pointillés pour tracer un  rectangle ?'

        this.correction = `
      La boucle contient le tracé d'une longueur et d'une largeur du rectangle. <br>
      Ainsi, à la place des pointillés il faut écrire  $${miseEnEvidence(2)}$.`
      }
      if (choix === 'd') {
        this.reponse = a * n
        this.question = `${scratchblock(prog0)}`

        this.question +=
          "À l'issue de l'exécution de ce programme, de combien de pas le lutin a-t-il avancé ?"

        this.correction = `Le lutin a avancé de $${a}\\times ${n} =${miseEnEvidence(this.reponse)}$ pas.`
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: 'pas ' }
        }

        this.canReponseACompleter = '$\\ldots$ pas'
      }
    }
  }
}
