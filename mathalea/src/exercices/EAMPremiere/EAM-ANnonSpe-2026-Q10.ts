import { touchesDeLaReponse } from '../../lib/interactif/claviers/touchesDeLaReponse'
import { texteCentre } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '42fc1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11LCFA4D-9', '11LSFA4D-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Exprimer une variable à partir d'une formule"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ10ANns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(cas: number): void {
    switch (cas) {
      case 1: // Énergie cinétique, exprimer v
        this.enonce = `En physique, l'énergie cinétique d'un véhicule est donnée par la formule :
        ${texteCentre(`$E = \\dfrac{1}{2}mv^2$`)}
        où $m$ représente la masse du véhicule et $v$ sa vitesse.<br>
        On souhaite exprimer $v$ en fonction de $E$ et $m$. Une expression de $v$ est :`

        this.correction = `On isole $v$ étape par étape :<br>`
        this.correction += `$\\begin{aligned} E &= \\dfrac{1}{2}mv^2 \\\\`
        this.correction += `2E &= mv^2 \\\\`
        this.correction += `\\dfrac{2E}{m} &= v^2 \\\\`
        this.correction += `v &= \\sqrt{\\dfrac{2E}{m}} \\end{aligned}$<br>`
        this.correction += `Donc $${miseEnEvidence(`v = \\sqrt{\\dfrac{2E}{m}}`)}$.`

        this.reponses = [
          `$v = \\sqrt{\\dfrac{2E}{m}}$`,
          `$v = \\dfrac{2E}{m}$`,
          `$v = \\sqrt{E - \\dfrac{1}{2}m}$`,
          `$v = \\sqrt{2mE}$`,
        ]
        break

      case 2: // Énergie cinétique, exprimer m
        this.enonce = `En physique, l'énergie cinétique d'un véhicule est donnée par la formule :
        ${texteCentre(`$E = \\dfrac{1}{2}mv^2$`)}
        où $m$ représente la masse du véhicule et $v$ sa vitesse.<br>
        On souhaite exprimer $m$ en fonction de $E$ et $v$. Une expression de $m$ est :`

        this.correction = `On isole $m$ étape par étape :<br>`
        this.correction += `$\\begin{aligned} E &= \\dfrac{1}{2}mv^2 \\\\`
        this.correction += `2E &= mv^2 \\\\`
        this.correction += `m &= \\dfrac{2E}{v^2} \\end{aligned}$<br>`
        this.correction += `Donc $m = ${miseEnEvidence(`\\dfrac{2E}{v^2}`)}$.`

        this.reponses = [
          `$m = \\dfrac{2E}{v^2}$`,
          `$m = \\dfrac{E}{2v^2}$`,
          `$m = \\sqrt{\\dfrac{2E}{v}}$`,
          `$m = 2E - v^2$`,
        ]
        break

      case 3: // Aire d'un disque, exprimer r
        this.enonce = `En géométrie, l'aire d'un disque est donnée par la formule :
        ${texteCentre(`$A = \\pi r^2$`)}
        où $r$ représente le rayon du disque.<br>
        On souhaite exprimer $r$ en fonction de $A$. Une expression de $r$ est :`

        this.correction = `On isole $r$ étape par étape :<br>`
        this.correction += `$\\begin{aligned} A &= \\pi r^2 \\\\`
        this.correction += `\\dfrac{A}{\\pi} &= r^2 \\\\`
        this.correction += `r &= \\sqrt{\\dfrac{A}{\\pi}} \\end{aligned}$<br>`
        this.correction += `Donc $r = ${miseEnEvidence(`\\sqrt{\\dfrac{A}{\\pi}}`)}$.`

        this.reponses = [
          `$r = \\sqrt{\\dfrac{A}{\\pi}}$`,
          `$r = \\dfrac{A}{\\pi}$`,
          `$r = \\dfrac{\\sqrt{A}}{\\pi}$`,
          `$r = \\sqrt{A - \\pi}$`,
        ]
        break

      case 4: // Volume d'un cône, exprimer h
        this.enonce = `En géométrie, le volume d'un cône de révolution est donné par la formule :
        ${texteCentre(`$V = \\dfrac{1}{3}\\pi r^2 h$`)}
        où $r$ est le rayon de la base et $h$ la hauteur.<br>
        On souhaite exprimer $h$ en fonction de $V$ et $r$. Une expression de $h$ est :`

        this.correction = `On isole $h$ étape par étape :<br>`
        this.correction += `$\\begin{aligned} V &= \\dfrac{1}{3}\\pi r^2 h \\\\`
        this.correction += `3V &= \\pi r^2 h \\\\`
        this.correction += `h &= \\dfrac{3V}{\\pi r^2} \\end{aligned}$<br>`
        this.correction += `Donc $h = ${miseEnEvidence(`\\dfrac{3V}{\\pi r^2}`)}$.`

        this.reponses = [
          `$h = \\dfrac{3V}{\\pi r^2}$`,
          `$h = \\dfrac{V}{3\\pi r^2}$`,
          `$h = \\sqrt{\\dfrac{3V}{\\pi r}}$`,
          `$h = 3V - \\pi r^2$`,
        ]
        break
    }
    // Le champ de saisie est précédé du nom de la variable à exprimer
    this.texteAvantReponseCourte = `$${/^\$(\w+)\s*=/.exec(this.reponses[0])?.[1] ?? ''}=$`
  }

  versionOriginale: () => void = () => {
    // Version de l'image : Énergie cinétique, exprimer v
    this.appliquerLesValeurs(1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Tire au sort l'un des 5 cas
    const cas = choice([1, 2, 3, 4])
    this.appliquerLesValeurs(cas)
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /On souhaite exprimer \$(.)\$ en fonction de (.*)\. Une expression de \$.\$ est :\s*$/,
        (_, variable: string, donnees: string) =>
          `Exprimer $${variable}$ en fonction de ${donnees}.`,
      )
    // La bonne réponse du QCM est de la forme « $r = \sqrt{\dfrac{A}{\pi}}$ » : on ne garde que le second membre
    this.reponseCourte = () => {
      const reponse = this.reponses[0]
        .replace(/^\$[^=]*=\s*/, '')
        .replace(/\$$/, '')
      // Les lettres de la réponse ne sont pas toutes sur le clavier
      this.optionsChampReponseCourte = {
        dataKeys: touchesDeLaReponse(reponse),
      }
      return reponse
    }
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
