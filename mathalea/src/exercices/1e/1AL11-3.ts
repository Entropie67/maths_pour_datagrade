import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '6ca02'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1AL11-3', '1Gen-A202-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer un terme d'une suite arithmétique (QCM)"
export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const r = -2
    const p = 1
    const up = 5
    const n = 8
    this.enonce = `Soit $(u_n)$ la suite arithmétique de premier terme $u_${p}=${up}$ et de raison $${r}$.<br>
   $u_{${n}}$ vaut :`
    this.correction = `Soit $p\\in \\mathbb{N}$ et $r\\in\\mathbb{R}$.<br>
    On sait que le terme de rang $n$ d'une suite arithmétique $(u_n)$ de premier terme $u_p$ et de raison $r$ s'écrit $u_n=u_p + (n-p)r$.<br>
    Il vient donc, en appliquant les valeurs de l'énoncé :<br>
    $\\begin{aligned}
    u_{${n}}&=u_{${p}} + (${n}-${p})\\times${ecritureParentheseSiNegatif(r)}\\\\
    &=${up}+ ${n - p}\\times${ecritureParentheseSiNegatif(r)}\\\\
     &=${up} ${ecritureAlgebrique((n - p) * r)}\\\\
    &=${miseEnEvidence(`${up + (n - p) * r}`)}
    \\end{aligned}$`
    this.reponses = [
      `$${texNombre(up + (n - p) * r)}$`,
      `$${texNombre(up + n * r)}$`,
      `$${texNombre(up + (n - p - 1) * r)}$`,
      `$${texNombre(up - (n - p) * r)}$`,
    ]
  }

  versionAleatoire = () => {
    const r = randint(-5, 5, [-1, 0, 1])
    const p = randint(2, 5)
    const up = randint(-5, 5, [-1, 0, 1])
    const n = randint(15, 30)
    this.enonce = `Soient $(u_n)$ la suite arithmétique de premier rang  $u_${p}=${up}$ et de raison $${r}$.<br>
    $u_{${n}}$ vaut :`
    this.correction = `Soit $p\\in \\mathbb{N}$ et $r\\in\\mathbb{R}$.<br>
    On sait que le terme de rang $n$ d'une suite arithmétique $(u_n)$ de premier terme $u_p$ et de raison $r$ s'écrit $u_n=u_p + (n-p)r$.<br>
    Il vient donc, en appliquant les valeurs de l'énoncé :<br>
    $\\begin{aligned}
    u_{${n}}&=u_{${p}} + (${n}-${p})\\times${ecritureParentheseSiNegatif(r)}\\\\
    &=${up}+ ${n - p}\\times${ecritureParentheseSiNegatif(r)}\\\\
     &=${up} ${ecritureAlgebrique((n - p) * r)}\\\\
    &=${miseEnEvidence(`${up + (n - p) * r}`)}
    \\end{aligned}$`
    this.reponses = [
      `$${texNombre(up + (n - p) * r)}$`,
      `$${texNombre(up + n * r)}$`,
      `$${texNombre(up - (n - p) * r)}$`,
      `$${texNombre(up + (n - p + 1) * r)}$`,
    ]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
