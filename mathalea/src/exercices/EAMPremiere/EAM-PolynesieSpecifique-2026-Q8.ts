import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { repere } from '../../lib/2d/reperes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { mathalea2d, type Mathalea2dDisplay } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'psq08'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Lire les variations ou le signe sur une courbe'
export const dateDePublication = '02/07/2026'
export const dateDeModifImportante = '22/10/2026'

type ConfigurationParabole = {
  domaineMin: number
  domaineMax: number
  sommetX: number
  sommetY: number
  courbure: number
}

/**
 * @author Stéphane Guyon
 */
export default class AutoQ8PolynesieSpecifique2026 extends ExerciceQcmACourt {
  private borneMin = 0
  private bornePlusGrande = 0

  private intervalle(a: number, b: number): string {
    return `\\left[${a}\\,;\\,${b}\\right]`
  }

  private appliquerLesValeurs({
    domaineMin,
    domaineMax,
    sommetX,
    sommetY,
    courbure,
  }: ConfigurationParabole): void {
    const f = (x: number) => sommetY - courbure * (x - sommetX) ** 2
    const yMin = Math.floor(Math.min(f(domaineMin), f(domaineMax), 0)) - 1
    const yMax = Math.ceil(sommetY) + 1
    const r = repere({
      xMin: domaineMin - 0.5,
      xMax: domaineMax + 0.5,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
    })
    const c = courbe(f, {
      repere: r,
      color: 'blue',
      epaisseur: 2,
      xMin: domaineMin,
      xMax: domaineMax,
      yMin,
      yMax,
      step: 0.05,
    })
    const figure = mathalea2d(
      Object.assign(
        { scale: 0.55, display: 'block' as Mathalea2dDisplay },
        fixeBordures([r]),
      ),
      [r, c],
    )

    const borneAvantSommet = Math.floor(sommetX)
    this.borneMin = domaineMin
    this.bornePlusGrande = borneAvantSommet
    const intervalleCroissance = this.intervalle(domaineMin, borneAvantSommet)
    const intervalleNonMonotone = this.intervalle(borneAvantSommet, domaineMax)
    const propositions = {
      croissante: `$f$ est croissante sur $${intervalleCroissance}$`,
      positive: `$f$ est positive sur $${intervalleCroissance}$`,
      decroissante: `$f$ est décroissante sur $${intervalleNonMonotone}$`,
      fausseNegative: `$f$ est négative sur $${intervalleNonMonotone}$`,
    }
    const correct = propositions.croissante

    this.enonce = `On considère une fonction $f$ définie sur $${this.intervalle(domaineMin, domaineMax)}$, dont la courbe représentative est donnée ci-dessous.<br>
    ${figure}
    On peut dire que :`

    this.reponses = [
      correct,
      propositions.positive,
      propositions.fausseNegative,
      propositions.decroissante,
    ]

    this.correction = `$\\bullet$ On observe que sur l'intervalle $${intervalleCroissance}$, $f$ est bien croissante.<br>
    $\\bullet$ La courbe n'est pas toujours au-dessus de l'axe des abscisses sur $${intervalleCroissance}$ : la proposition «${sp()}$f$ est positive sur $${intervalleCroissance}$${sp()}» est fausse.<br>
    $\\bullet$ Sur $${intervalleNonMonotone}$, la fonction change de variation : elle n'est donc pas décroissante sur cet intervalle.<br>
    $\\bullet$ Sur ce même intervalle, la courbe n'est pas toujours sous l'axe des abscisses : la proposition «${sp()}$f$ est négative sur $${intervalleNonMonotone}$${sp()}» est fausse.<br>
    La seule bonne réponse est donc : $${miseEnEvidence('f')}$ ${texteEnCouleurEtGras('est croissante sur')} $${miseEnEvidence(intervalleCroissance)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      domaineMin: -2,
      domaineMax: 3,
      sommetX: 0.5,
      sommetY: 2.25,
      courbure: 1,
    })
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const cas: ConfigurationParabole[] = [
      {
        domaineMin: -2,
        domaineMax: 3,
        sommetX: 0.5,
        sommetY: 2.25,
        courbure: 1,
      },
      {
        domaineMin: -1,
        domaineMax: 4,
        sommetX: 1.5,
        sommetY: 2.25,
        courbure: 1,
      },
      {
        domaineMin: -3,
        domaineMax: 2,
        sommetX: -0.5,
        sommetY: 2.25,
        courbure: 1,
      },
      { domaineMin: -1, domaineMax: 4, sommetX: 1.5, sommetY: 4, courbure: 1 },
      {
        domaineMin: -2,
        domaineMax: 3,
        sommetX: 0.5,
        sommetY: 3,
        courbure: 0.75,
      },
    ]

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice(cas))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /On peut dire que :\s*$/,
        `Donner le plus grand entier $k$ tel que $f$ soit croissante sur $\\left[${this.borneMin}\\,;\\,k\\right]$.`,
      )
    this.reponseCourte = () => String(this.bornePlusGrande)
    this.correctionCourte = () =>
      `${(this.correction ?? '').split('<br>')[0]}<br>Le plus grand entier $k$ tel que $f$ soit croissante sur $\\left[${this.borneMin}\\,;\\,k\\right]$ est donc $${miseEnEvidence(String(this.bornePlusGrande))}$.`
    this.texteAvantReponseCourte = '$k=$'
    this.clavierReponseCourte = KeyboardType.clavierDeBase
  }
}
