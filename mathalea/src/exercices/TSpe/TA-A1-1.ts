import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '93c90'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['TA-A1-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des puissances ($1$)'
export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      'Soit $a$ un nombre réel non nul. À quelle expression est égal $a^5\\times a^3$ ?'
    this.correction = `On utilise la propriété de cours, qui calcule le produit des puissances d'un nombre réel non nul $a$  :<br>
      Soit $n\\in \\mathbb{N}^*$ et $k\\in \\mathbb{N}^*$<br>
      On a alors : $a^n\\times a^k=a^{n+k}$<br>
      Dans notre situation : $${miseEnEvidence('a^5\\times a^3=a^{8}')}$`

    this.reponses = [
      '$a^{8}$',
      '$a^{15}$',
      '$\\left(a^{5}\\right)^3$',
      'Aucune de ces propositions',
    ]
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const n = randint(2, 5)
      const k = randint(3, 6) // ne pas mettre 2 car 2+2 = 2*2 !
      this.enonce = `Soit $a$ un nombre réel non nul. À quelle expression est égal $a^${n}\\times a^${k}$ ?`
      this.correction = `On utilise la propriété de cours, qui calcule le produit des puissances d'un nombre réel non nul $a$    :<br>
    Soit $n\\in \\mathbb{N}$ et $k\\in \\mathbb{N}$<br>
    On a alors : $a^n\\times a^k=a^{n+k}$<br>
         Dans notre situation : $${miseEnEvidence(`a^{${n}}\\times a^{${n}}=a^{${n + k}}`)}$`
      this.reponses = [
        `$a^{${n + k}}$`,
        `$a^{${n * k}}$`,
        `$\\left(a^{${n}}\\right)^{${k}}$`,
        'Aucune de ces propositions.',
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.optionsDeComparaison = { texteSansCasse: true }
    this.versionAleatoire()
  }
}
