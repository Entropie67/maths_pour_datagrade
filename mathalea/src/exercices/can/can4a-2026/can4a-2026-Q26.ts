import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import { scratchblock } from '../../../modules/scratchblock'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Question $26$'
export const interactifReady = true

export const uuid = 'rda48'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ26 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = {
      texteApres: ' pas.',
    }
  }

  enonce(nb?: number, longueur?: number, angle?: number) {
    if (nb == null || longueur == null || angle == null) {
      nb = choice([4, 6, 8]) // Carré, hexagone, octogone
      longueur = randint(5, 15) * 5 // Multiple de 5
      angle = 360 / nb // Angle de rotation
    }

    const perimetre = nb * longueur

    let texteScratch = `\\begin{scratch}[${context.isHtml ? 'print,' : ''}fill,blocks,scale=0.8]\n`
    texteScratch += '\\blockinit{quand \\greenflag est cliqué}\n'
    texteScratch += "\\blockmove{stylo en position d'écriture}\n"
    texteScratch += `\\blockrepeat{répéter \\ovalnum{${String(nb)}} fois}{\n`
    texteScratch += `\\blockmove{avancer de \\ovalnum{${String(longueur)}} pas}\n`
    texteScratch += `\\blockmove{tourner \\turnright{} de \\ovalnum{${String(angle)}} degrés}\n`
    texteScratch += '}'
    texteScratch += '\\end{scratch}\n'
    const texte = scratchblock(texteScratch)

    this.question = texte || 'Problème de rendu'
    this.question += '<br>Le périmètre de la figure obtenue est '

    let nomFigure = ''
    if (nb === 4) nomFigure = 'un carré'
    else if (nb === 6) nomFigure = 'un hexagone'
    else if (nb === 8) nomFigure = 'un octogone'

    this.correction = `Ce programme trace ${nomFigure} régulier de côté $${longueur}$ pas.<br>
    Le périmètre est : $${nb}\\times ${longueur}=${miseEnEvidence(perimetre)}$ pas.`

    this.canReponseACompleter = '$\\ldots$ pas'
    this.reponse = perimetre

    if (!this.interactif) {
      this.question += '<br>$\\ldots$ pas'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 10, 60)
    else this.enonce()
  }
}
