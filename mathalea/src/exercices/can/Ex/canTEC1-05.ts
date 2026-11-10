import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer le conjugué d'un nombre complexe"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '07/092025'

/**
 * Question de can : conjugué
 * @author Stéphane Guyon

*/
export const dateDeModifImportante = '31/10/2026'
export const uuid = 'ac62a'

export const refs = {
  'fr-fr': ['canTEC1-05', 'TEC1-21'],
  'fr-ch': [],
}
export default class Conjugue extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.complexes
  }

  nouvelleVersion() {
    const ReZ = randint(-5, 5)
    const ImZ = randint(-5, 5)
    const z = new Complexe(ReZ, ImZ)
    const moinsZ = new Complexe(-ReZ, -ImZ)
    const iZ = new Complexe(-ImZ, ReZ)
    const conjZ = new Complexe(ReZ, -ImZ)
    const conjIz = iZ.conjugue()
    const moinsIz = new Complexe(ImZ, -ReZ)
    const scenario = randint(0, 4)
    this.question = `On donne le nombre complexe $z = ${z.tex().replace(/i/g, '\\mathrm{i}')}$.<br>`
    this.correction =
      "Par définition, le conjugué d'un nombre complexe qui s'écrit sous la forme $z=a+\\mathrm{i}b$, avec $a$ et $b$ deux réels, est $\\overline{z} =a-\\mathrm{i}b$.<br>"
    switch (scenario) {
      case 0:
        this.question += 'Déterminer le conjugué de $z$.'
        this.correction += `On a donc ici : $\\overline{z} = ${miseEnEvidence(`${conjZ.tex().replace(/i/g, '\\mathrm{i}')}`)}$.`

        this.reponse = `${conjZ.tex().replace(/i/g, '\\mathrm{i}')}`
        break
      case 1:
        this.question += 'Déterminer $\\overline{z}$.'
        this.correction += `On a donc ici : $\\overline{z} = ${miseEnEvidence(`${conjZ.tex().replace(/i/g, '\\mathrm{i}')}`)}$.`

        this.reponse = `${conjZ.tex().replace(/i/g, '\\mathrm{i}')}`
        break
      case 2:
        this.question += 'Déterminer la forme algébrique de $Z=\\overline{-z}$.'
        this.correction += `
    $\\begin{aligned}
    Z&=\\overline{-z}\\\\
     &= \\overline{${moinsZ.tex().replace(/i/g, '\\mathrm{i}')}}\\\\
    &=${miseEnEvidence(`${moinsZ.conjugue().tex().replace(/i/g, '\\mathrm{i}')}`)}.
    \\end{aligned}$`

        this.reponse = `${moinsZ.conjugue().tex().replace(/i/g, '\\mathrm{i}')}`
        break
      case 3:
        this.question += 'Déterminer la forme algébrique de $Z=\\overline{\\mathrm{i}z}$.'
        this.correction += `
    $\\begin{aligned}
    Z&=\\overline{\\mathrm{i}z}\\\\
      &= \\overline{\\mathrm{i}\\left(${z.tex().replace(/i/g, '\\mathrm{i}')}\\right)}\\\\
      &= \\overline{${iZ.tex().replace(/i/g, '\\mathrm{i}')}}\\\\
    &=${miseEnEvidence(`${conjIz.tex().replace(/i/g, '\\mathrm{i}')}`)}.
    \\end{aligned}$<br>
    On aurait pu aussi utiliser la propriété des produits des conjugués :<br>
     $\\begin{aligned}
    Z&=\\overline{\\mathrm{i}z}\\\\
      &= \\overline{\\mathrm{i}} \\times \\overline{${z.tex().replace(/i/g, '\\mathrm{i}')}}\\\\
       &= -\\mathrm{i} \\left({${conjZ.tex().replace(/i/g, '\\mathrm{i}')}}\\right)\\\\
       &=${miseEnEvidence(`${conjIz.tex().replace(/i/g, '\\mathrm{i}')}`)}.
    \\end{aligned}$<br>`

        this.reponse = `${conjIz.tex().replace(/i/g, '\\mathrm{i}')}`
        break
      case 4:
        this.question +=
          'Déterminer la forme algébrique de $Z=\\overline{-\\mathrm{i}z}$.'
        this.correction += `
    $\\begin{aligned}
    Z&=\\overline{-\\mathrm{i}z}\\\\
      &= \\overline{-\\mathrm{i}\\left(${z.tex().replace(/i/g, '\\mathrm{i}')}\\right)}\\\\
      &= \\overline{${moinsIz.tex().replace(/i/g, '\\mathrm{i}')}}\\\\
    &=${miseEnEvidence(`${moinsIz.conjugue().tex().replace(/i/g, '\\mathrm{i}')}`)}.
    \\end{aligned}$<br>
    On aurait pu aussi utiliser la propriété des produits des conjugués :<br>
     $\\begin{aligned}
    Z&=\\overline{-\\mathrm{i}z}\\\\
      &= \\overline{-\\mathrm{i}} \\times \\left(\\overline{${z.tex().replace(/i/g, '\\mathrm{i}')} }\\right)\\\\
       &= \\mathrm{i} \\left({${conjZ.tex().replace(/i/g, '\\mathrm{i}')}}\\right)\\\\
      &=${miseEnEvidence(`${moinsIz.conjugue().tex().replace(/i/g, '\\mathrm{i}')}`)}.
    \\end{aligned}$<br>`

        this.reponse = `${moinsIz.conjugue().tex().replace(/i/g, '\\mathrm{i}')}`
        break
    }
  }
}
