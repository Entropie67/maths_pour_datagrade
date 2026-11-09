import Stat from '../../lib/mathFonctions/Stat'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { creerSerieDeQuartiles } from '../../modules/outilsStat'
import Exercice from '../Exercice'

export const uuid = 'a5ab7'
export const refs = {
  'fr-fr': ['betaBAM'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer deux nombres'
export const dateDePublication = '02/09/2025'

/**
 * @author Jean-claude Lhote
 */

export default class BetaBAM extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.spacing = 2
    this.besoinFormulaire2CaseACocher = [
      'Avec les légendes (boite à moustache)',
      true,
    ]
    this.sup2 = true
    this.besoinFormulaireCaseACocher = [
      'Avec les valeurs (boite à moustache)',
      true,
    ]
    this.sup = true
    this.besoinFormulaire3CaseACocher = [
      'Afficher les effectifs (diagrammes)',
      false,
    ]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = [
      'Afficher les valeurs (diagrammes)',
      true,
    ]
    this.sup4 = true
    this.besoinFormulaire5CaseACocher = ['Diagrammes en barres', true]
    this.sup5 = true
    this.nouvelleVersion()
  }

  nouvelleVersion() {
    const q1 = randint(2, 3)
    const q3 = randint(7, 10)
    const mediane = randint(q1 + 2, q3 - 2)
    const min = 1
    const max = 11

    const serie = creerSerieDeQuartiles({
      q1,
      mediane,
      q3,
      min,
      max,
      isInteger: true,
      n: 30,
    })
    const stat = new Stat(serie)
    const boite = stat.boiteAMoustache()
    const valeurs = boite.valeurs
    const ecartInterquartile = boite.q3 - boite.q1
    const borneInf = boite.q1 - 1.5 * ecartInterquartile
    const borneSup = boite.q3 + 1.5 * ecartInterquartile
    const valeursHorsBornes = stat.serie.filter(
      (v) => Number(v) < borneInf || Number(v) > borneSup,
    )
    const bonneReponse = valeursHorsBornes.length > 0 ? 'Oui' : 'Non'
    this.listeQuestions[0] = `Voici la série de nombres : ${stat.listeSerie({ triee: false, tableau: false })}.<br>
Peut-on affirmer qu'il y a des valeurs aberrantes dans cette série selon la méthode de la boîte à moustaches ?<br>
${stat.traceBoiteAMoustache({ size: 25, height: 4, legendeOn: this.sup2, valeursOn: this.sup })}<br>
Et voici l'histogramme de cette série :<br>
${
  this.sup5
    ? stat.diagramme({
        cumul: false,
        croissance: true,
        barres: true,
        percentVsEffectifs: true,
        valuesOn: this.sup4,
        effectifsOn: this.sup3,
      })
    : stat.diagramme({
        cumul: true,
        croissance: true,
        barres: false,
        percentVsEffectifs: true,
        effectifsOn: this.sup3,
        valuesOn: this.sup4,
      })
} <br>
${
  this.sup5
    ? stat.diagramme({
        cumul: false,
        croissance: true,
        barres: true,
        percentVsEffectifs: false,
        effectifsOn: this.sup3,
        valuesOn: this.sup4,
      })
    : stat.diagramme({
        cumul: true,
        croissance: false,
        barres: false,
        percentVsEffectifs: false,
        effectifsOn: this.sup3,
        valuesOn: this.sup4,
      })
}`

    this.listeCorrections[0] = `Rangeons les valeurs de la série par ordre croissant : $${valeurs.join('$, $')}$.<br>
    Pour déterminer s'il y a des valeurs aberrantes dans la série, nous devons calculer l'écart interquartile (IQR).<br>
$Q_1 = ${texNombre(boite.q1, 2)}$, $Q_3 = ${texNombre(boite.q3, 2)}$<br>
$\\text{IQR} = Q_3 - Q_1 = ${texNombre(ecartInterquartile, 2)}$<br>
Les bornes pour détecter les valeurs aberrantes sont :<br>
Borne inférieure $= Q_1 - 1,5 * \\text{ IQR} = ${texNombre(borneInf, 2)}$<br>
Borne supérieure $= Q_3 + 1,5 * \\text{ IQR} = ${texNombre(borneSup, 2)}$<br>
Les valeurs aberrantes sont celles qui sont en dehors de ces bornes : ${valeursHorsBornes.length > 0 ? `$${valeursHorsBornes.join('$, $')}$` : 'Aucune'}.<br>
Donc, peut-on affirmer qu'il y a des valeurs aberrantes dans cette série ? ${texteEnCouleurEtGras(bonneReponse)}.`
  }
}
