import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { creerSerieDeQuartiles } from '../../modules/outilsStat'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '2f4a3'
export const refs = {
  'fr-fr': ['1A-S03-2', '2A-S3-2'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Comprendre une boîte à moustaches'
export const dateDePublication = '31/12/2025'
/**
 * @author Jean-claude Lhote
 */

export default class ComprendreBoiteMoustachesQCM extends ExerciceQcmACourt {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    serie: number[],
    borneInf: number,
    borneSup: number,
  ): void {
    const maSerie = new Stat(serie)
    const moustache = maSerie.traceBoiteAMoustache({
      size: 10,
      height: 4,
      legendeOn: false,
      valeursOn: true,
      echelle: 1,
    })
    const termes = [
      { label: 'minimum', value: maSerie.min() },
      { label: 'premier quartile', value: maSerie.quartiles().q1 },
      { label: 'médiane', value: maSerie.mediane() },
      { label: 'troisième quartile', value: maSerie.quartiles().q3 },
      { label: 'maximum', value: maSerie.max() },
    ]

    const a = termes[borneInf].value
    const b = termes[borneSup].value

    const pourCent = (borneSup - borneInf) * 25
    const distracteur1 = choice([25, 50, 75, 100], pourCent)
    const distracteur2 = choice([10, 40, 60, 80])
    const distracteur3 = choice(
      [25, 10, 50, 40, 60, 75, 80, 90, 100],
      [pourCent, distracteur1, distracteur2],
    )

    this.reponses = [
      `${texNombre(pourCent, 0)}\\,\\%`,
      `${texNombre(distracteur1, 0)}\\,\\%`,
      `${texNombre(distracteur2, 0)}\\,\\%`,
      `${texNombre(distracteur3, 0)}\\,\\%`,
    ].map((r) => `$${r}$`)
    this.enonce = `Une série statistique est résumée par le diagramme en boîte ci-dessous. Quel pourcentage de valeurs sont comprises entre $${a}$ et $${b}$ ?<br>
      ${moustache}`

    // Correction : explication simple, claire
    this.correction = `La valeur $${a}$ correspond au ${termes[borneInf].label} et la valeur $${b}$ au ${termes[borneSup].label}.<br>
      Donc, la proportion de valeurs comprises entre $${a}$ et $${b}$ est de $${miseEnEvidence(texNombre(pourCent, 0) + '\\,\\%')}$.`
  }

  versionOriginale: () => void = () => {
    const maSerie = creerSerieDeQuartiles({
      q1: 30,
      mediane: 40,
      q3: 55,
      min: 10,
      max: 60,
      n: 40,
    })
    this.appliquerLesValeurs(maSerie, 1, 4)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // Nombre de réponses différentes souhaitées
    do {
      const min = randint(1, 4) * 5
      const q1 = min + randint(1, 4) * 5
      const tot = randint(5, 8)
      const a = randint(2, 4)
      const b = tot / 2 !== a ? tot - a : tot - a + 1
      const mediane = q1 + a * 5
      const q3 = mediane + b * 5
      const max = Math.round(randint(q3 + 5, 100) / 5) * 5
      const maSerie = creerSerieDeQuartiles({
        q1,
        mediane,
        q3,
        min,
        max,
        n: 40,
      })
      const borneInf = randint(0, 2)
      const borneSup = randint(2, 4, borneInf)
      this.appliquerLesValeurs(maSerie, borneInf, borneSup)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // La bonne réponse du QCM est de la forme « $25\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/\\,\\%\$$/, '').replace(/^\$/, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.texteApresReponseCourte = ' %'
    this.versionAleatoire()
  }
}
