import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { touchesDecimal } from '../../lib/outils/ordreDeGrandeur'
import {
  effectifTotal,
  effectifsCumules,
  medianeSerie,
  serieDepliee,
  contextesSerie,
  tableauEffectifs,
  tableauEffectifsCumules,
  valeursCroissantes,
} from '../../lib/outils/serieEffectifs'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = 'c391c'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-S02-12', '2A-S2-12'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = "Déterminer la médiane d'une série donnée par un tableau"

/**
 * La série est donnée par un tableau d'effectifs faibles :
 * la médiane se détermine à la main, l'effectif total pouvant être pair ou impair.
 */
export default class MedianeTableauSaisieLibre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const contexte = choice(contextesSerie)
    const cas = this.quotaChoice('cas', [
      'impair',
      'pairEgales',
      'pairDifferentes',
    ])
    const parite = cas === 'impair' ? 'impair' : 'pair'
    // une classe compte de 20 à 25 élèves ; sinon un petit effectif
    const [nbValeurs, effectifMax, totalMin, totalMax] = contexte.classe
      ? [6, 6, 20, 25]
      : [4, 4, 9, 13]
    let valeurs: number[]
    let effectifs: number[]
    let total: number
    let centrales: [number, number]
    do {
      valeurs = valeursCroissantes(nbValeurs, contexte.min, contexte.ecartMax)
      effectifs = valeurs.map(() => randint(1, effectifMax))
      total = effectifTotal({ valeurs, effectifs })
      const depliee = serieDepliee({ valeurs, effectifs })
      centrales = [
        depliee[Math.ceil(total / 2) - 1],
        depliee[Math.floor(total / 2)],
      ]
    } while (
      total < totalMin ||
      total > totalMax ||
      total % 2 !== (parite === 'impair' ? 1 : 0) ||
      (cas === 'pairEgales' && centrales[0] !== centrales[1]) ||
      (cas === 'pairDifferentes' && centrales[0] === centrales[1])
    )
    const serie = { valeurs, effectifs }
    const mediane = medianeSerie(serie)
    const rangee = serieDepliee(serie)
    const rang = (total + 1) / 2
    const [gauche, droite] = centrales
    // valeurs centrales distinctes : tout nombre qui les sépare est une médiane
    const plusieursMedianes = cas === 'pairDifferentes'
    this.question = `${contexte.phrase}<br><br>${tableauEffectifs(contexte.nomValeur, serie)}${this.interactif ? '' : '<br>Donner une valeur médiane de cette série.'}`
    this.optionsChampTexte = {
      dataKeys: touchesDecimal,
      texteAvant: `<br>${contexte.mediane}`,
      texteApres: '.',
    }
    if (plusieursMedianes) {
      this.reponse = `[${gauche};${droite}]`
      this.optionsDeComparaison = { estDansIntervalle: true }
    } else {
      this.reponse = mediane
      this.optionsDeComparaison = { nombreDecimalSeulement: true }
    }
    const eccs = effectifsCumules(effectifs)
    // première colonne dont l'ECC atteint le rang
    const colonneDuRang = (r: number) => eccs.findIndex((e) => e >= r)
    const phraseRang = (r: number) =>
      `la première valeur dont l'ECC est supérieur ou égal à $${r}$ est $${valeurs[colonneDuRang(r)]}$`
    const colonnesMarquees =
      parite === 'impair'
        ? [colonneDuRang(rang)]
        : [colonneDuRang(total / 2), colonneDuRang(total / 2 + 1)]
    const hl = miseEnEvidence(texNombre(mediane))
    // la correction reprend le sujet de l'énoncé : « Le nombre médian de … est égal à … »
    const phrase = (determinant: string) =>
      contexte.mediane
        .replace('Une valeur médiane du nombre', `${determinant} nombre médian`)
        .replace('égale à', 'égal à')
    // « un nombre de livres lus », d'après la phrase de l'énoncé
    const quantite = contexte.mediane
      .replace('Une valeur médiane du nombre', 'un nombre')
      .replace(/ est égale à $/, '')
    let methode: string
    let conclusion: string
    if (parite === 'impair') {
      methode = `L'effectif total est $${total}$ : il est impair, donc la médiane est la valeur de rang $\\dfrac{${total}+1}{2}=${rang}$.<br>
    Dans le tableau, ${phraseRang(rang)}.`
      conclusion = `${phrase('Le')}$${hl}$.`
    } else {
      const rangs = [total / 2, total / 2 + 1]
      methode = `L'effectif total est $${total}$ : il est pair, les valeurs centrales sont celles de rang $\\dfrac{${total}}{2}=${rangs[0]}$ et $${rangs[1]}$.<br>
    Dans le tableau, pour le rang $${rangs[0]}$, ${phraseRang(rangs[0])} ; pour le rang $${rangs[1]}$, ${phraseRang(rangs[1])}.`
      conclusion = plusieursMedianes
        ? `La médiane est ${quantite} compris entre $${gauche}$ et $${droite}$ : tout nombre de cet intervalle est une valeur médiane.<br>
    Par exemple, ${phrase('un')}$${hl}$.`
        : `Les deux valeurs centrales sont égales à $${gauche}$. ${phrase('Le')}$${hl}$.`
    }
    // déballage en deux moitiés ; en orange : la médiane, ou les deux valeurs centrales
    const demi = Math.floor(total / 2)
    const sep = '\\,;\\,'
    const moitie = (liste: string[]) =>
      `\\underbrace{${liste.join(sep)}}_{${demi}\\text{ valeurs}}`
    const texteValeurs = rangee.map((v) => texNombre(v))
    let serieAccolades: string
    let rangsComplement: string
    if (parite === 'impair') {
      serieAccolades = [
        moitie(texteValeurs.slice(0, demi)),
        miseEnEvidence(texteValeurs[demi]),
        moitie(texteValeurs.slice(demi + 1)),
      ].join(sep)
      rangsComplement = `La médiane est la valeur qui sépare la série en deux moitiés de $${demi}$ valeurs : c'est la valeur de rang $${rang}$, soit $${gauche}$.`
    } else {
      const debut = texteValeurs.slice(0, demi)
      const fin = texteValeurs.slice(demi)
      debut[demi - 1] = miseEnEvidence(debut[demi - 1])
      fin[0] = miseEnEvidence(fin[0])
      serieAccolades = [moitie(debut), moitie(fin)].join(sep)
      rangsComplement = `La série se sépare en deux moitiés de $${demi}$ valeurs.`
    }
    this.correction = `On ajoute au tableau une ligne d'effectifs cumulés croissants (ECC).<br><br>
    ${tableauEffectifsCumules(contexte.nomValeur, serie, colonnesMarquees)}<br>
    ${methode}<br><br>
    Méthode alternative : on écrit toutes les valeurs dans l'ordre croissant, en répétant chacune autant de fois que son effectif, puis on sépare la série en deux moitiés.<br>
    $${serieAccolades}$.<br>
    ${rangsComplement}<br><br>
    ${conclusion}`
  }
}
