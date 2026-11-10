import { randInt } from 'three/src/math/MathUtils.js'
import { getRandomSubarray } from '../../lib/outils/arrayOutils'
import { texteEnCarte } from '../../lib/outils/embellissements'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'

import { addCompteEstBon } from '../../lib/customElements/MathaleaCompteEstBonElement'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '15/08/2026'
export const titre = 'Le compte est bon'
export const interactifReady = true
export const tags = ['ffjm']

/** Tirage aleatoire d'un compte est bon
 * @author Claire Stephan
 */

export const uuid = 'dcef5'
export const refs = {
  'fr-fr': ['EN-CompteBon'],
  'fr-ch': ['9R1NO6H-9', '9R2NO6H-9', '9R3NO6H-9'],
}

export type EtapeCompteEstBon = {
  gauche: number
  symbole: '+' | '-' | '\\times' | '\\div'
  droite: number
  resultat: number
}

export type CalculCompteEstBon = {
  valeur: number
  nombreOperations: number
  nombreDivisions: number
  etapes: EtapeCompteEstBon[]
}

function estMeilleurCalcul(
  candidat: CalculCompteEstBon,
  reference: CalculCompteEstBon,
): boolean {
  if (candidat.nombreOperations !== reference.nombreOperations) {
    return candidat.nombreOperations < reference.nombreOperations
  }
  if (candidat.nombreDivisions !== reference.nombreDivisions) {
    return candidat.nombreDivisions < reference.nombreDivisions
  }
  return JSON.stringify(candidat.etapes) < JSON.stringify(reference.etapes)
}

function ajouteCalcul(
  calculs: Map<number, CalculCompteEstBon>,
  candidat: CalculCompteEstBon,
): void {
  const calculExistant = calculs.get(candidat.valeur)
  if (
    calculExistant === undefined ||
    estMeilleurCalcul(candidat, calculExistant)
  ) {
    calculs.set(candidat.valeur, candidat)
  }
}

function combineCalculs(
  gauche: CalculCompteEstBon,
  droite: CalculCompteEstBon,
  symbole: EtapeCompteEstBon['symbole'],
  resultat: number,
): CalculCompteEstBon {
  return {
    valeur: resultat,
    nombreOperations: gauche.nombreOperations + droite.nombreOperations + 1,
    nombreDivisions:
      gauche.nombreDivisions +
      droite.nombreDivisions +
      (symbole === '\\div' ? 1 : 0),
    etapes: [
      ...gauche.etapes,
      ...droite.etapes,
      { gauche: gauche.valeur, symbole, droite: droite.valeur, resultat },
    ],
  }
}

/**
 * Énumère les entiers positifs atteignables avec chaque sous-ensemble du tirage.
 * Une plaque ne peut être utilisée qu'une fois. Les divisions sont exactes et les
 * soustractions doivent donner un résultat strictement positif.
 */
export function enumereCalculsCompteEstBon(
  tirage: number[],
  avecDivision: boolean,
): Map<number, CalculCompteEstBon> {
  const calculsParSousEnsemble = new Map<
    number,
    Map<number, CalculCompteEstBon>
  >()

  for (let index = 0; index < tirage.length; index++) {
    calculsParSousEnsemble.set(
      1 << index,
      new Map([
        [
          tirage[index],
          {
            valeur: tirage[index],
            nombreOperations: 0,
            nombreDivisions: 0,
            etapes: [],
          },
        ],
      ]),
    )
  }

  const masqueComplet = (1 << tirage.length) - 1
  for (let masque = 1; masque <= masqueComplet; masque++) {
    if ((masque & (masque - 1)) === 0) continue

    const calculs = new Map<number, CalculCompteEstBon>()
    for (
      let masqueGauche = (masque - 1) & masque;
      masqueGauche > 0;
      masqueGauche = (masqueGauche - 1) & masque
    ) {
      const masqueDroite = masque ^ masqueGauche
      if (masqueGauche > masqueDroite) continue

      const calculsGauche = calculsParSousEnsemble.get(masqueGauche)
      const calculsDroite = calculsParSousEnsemble.get(masqueDroite)
      if (calculsGauche === undefined || calculsDroite === undefined) continue

      for (const gauche of calculsGauche.values()) {
        for (const droite of calculsDroite.values()) {
          ajouteCalcul(
            calculs,
            combineCalculs(gauche, droite, '+', gauche.valeur + droite.valeur),
          )
          ajouteCalcul(
            calculs,
            combineCalculs(
              gauche,
              droite,
              '\\times',
              gauche.valeur * droite.valeur,
            ),
          )

          if (gauche.valeur > droite.valeur) {
            ajouteCalcul(
              calculs,
              combineCalculs(
                gauche,
                droite,
                '-',
                gauche.valeur - droite.valeur,
              ),
            )
          } else if (droite.valeur > gauche.valeur) {
            ajouteCalcul(
              calculs,
              combineCalculs(
                droite,
                gauche,
                '-',
                droite.valeur - gauche.valeur,
              ),
            )
          }

          if (!avecDivision) continue
          if (gauche.valeur % droite.valeur === 0) {
            ajouteCalcul(
              calculs,
              combineCalculs(
                gauche,
                droite,
                '\\div',
                gauche.valeur / droite.valeur,
              ),
            )
          }
          if (
            droite.valeur % gauche.valeur === 0 &&
            droite.valeur !== gauche.valeur
          ) {
            ajouteCalcul(
              calculs,
              combineCalculs(
                droite,
                gauche,
                '\\div',
                droite.valeur / gauche.valeur,
              ),
            )
          }
        }
      }
    }
    calculsParSousEnsemble.set(masque, calculs)
  }

  const meilleursCalculs = new Map<number, CalculCompteEstBon>()
  for (const calculs of calculsParSousEnsemble.values()) {
    for (const calcul of calculs.values()) {
      ajouteCalcul(meilleursCalculs, calcul)
    }
  }
  return meilleursCalculs
}

export function cibleLaPlusProche(
  cible: number,
  calculs: Map<number, CalculCompteEstBon>,
): CalculCompteEstBon | undefined {
  let meilleurCalcul: CalculCompteEstBon | undefined
  for (const calcul of calculs.values()) {
    if (meilleurCalcul === undefined) {
      meilleurCalcul = calcul
      continue
    }
    const ecart = Math.abs(calcul.valeur - cible)
    const meilleurEcart = Math.abs(meilleurCalcul.valeur - cible)
    if (
      ecart < meilleurEcart ||
      (ecart === meilleurEcart && estMeilleurCalcul(calcul, meilleurCalcul)) ||
      (ecart === meilleurEcart &&
        calcul.nombreOperations === meilleurCalcul.nombreOperations &&
        calcul.nombreDivisions === meilleurCalcul.nombreDivisions &&
        calcul.valeur < meilleurCalcul.valeur)
    ) {
      meilleurCalcul = calcul
    }
  }
  return meilleurCalcul
}

export default class leCompteEstBon extends Exercice {
  pickList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100]

  constructor() {
    super()

    this.besoinFormulaireNumerique = ['Nombre cible minimal', 999]
    this.besoinFormulaire2Numerique = ['Nombre cible maximal', 999]
    this.besoinFormulaire3Texte = [
      'Nombre tiré maximal',
      ['1 : 10', '2 : 25', '3 : 50', '4 : 100', '5 : Mélange'].join('\n'),
    ]

    this.besoinFormulaire4CaseACocher = ['Avec $\\div$']
    this.besoinFormulaire5CaseACocher = ['La solution exacte existe', false]

    this.sup = 100
    this.sup2 = 999
    this.sup4 = true
    this.sup3 = '5' // Mélange
    this.sup5 = false // Solution exacte non imposée
    this.nbQuestions = 1

    this.consigne = `Effectuer un enchaînement d'opérations pour atteindre le nombre cible ou s'en rapprocher le plus possible. \n`
    this.consigne += `Pour chaque opération on a le choix entre $+,~-,~\\times~et~\\div$.\n`
    this.consigne += `On ne peut utiliser qu'une seule fois les nombres proposés et les solutions des calculs précédents.`

    // this.comment = 'Pour augmenter la difficulté on peut augmenter la taille de la grille ou diminuer le nombre de zéros.'
  }

  nouvelleVersion(): void {
    const nombresTiresMax = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
      listeOfCase: [10, 25, 50, 100],
    }).map(Number)

    const borne1 = Math.max(1, Math.trunc(Number(this.sup)) || 100)
    const borne2 = Math.max(1, Math.trunc(Number(this.sup2)) || 999)
    const cibleMin = Math.min(borne1, borne2)
    const cibleMax = Math.max(borne1, borne2)

    this.consigne = `Effectuer un enchaînement d'opérations pour atteindre le nombre cible ou s'en rapprocher le plus possible. \n`
    this.consigne += 'Pour chaque opération on a le choix entre $+,~-'
    this.consigne += this.sup4 ? `,~\\times~et~\\div` : `~et~\\times`
    this.consigne += `$\n. On ne peut utiliser qu'une seule fois les nombres proposés et les solutions des calculs précédents.`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const outils = this.pickList.filter(
        (nombre) => nombre <= nombresTiresMax[i],
      )
      const tirage: number[] = getRandomSubarray(outils, 6)
      const calculs = enumereCalculsCompteEstBon(tirage, this.sup4)
      const ciblesDansIntervalle = [...calculs.values()]
        .filter(
          (calcul) => calcul.valeur >= cibleMin && calcul.valeur <= cibleMax,
        )
        .sort((a, b) => a.valeur - b.valeur)
      let ciblesExactes = ciblesDansIntervalle.filter(
        (calcul) => calcul.nombreOperations >= 3,
      )

      // Une petite cible s'obtient toujours en moins de 3 opérations : à la
      // dernière tentative, on abandonne ce minimum, puis la solution exacte si
      // elle reste introuvable, plutôt que de ne générer aucune question.
      const derniereTentative = cpt === 49
      if (derniereTentative && ciblesExactes.length === 0) {
        ciblesExactes = ciblesDansIntervalle
      }
      if (this.sup5 && ciblesExactes.length === 0 && !derniereTentative) {
        cpt++
        continue
      }

      const cible =
        this.sup5 && ciblesExactes.length > 0
          ? ciblesExactes[randInt(0, ciblesExactes.length - 1)].valeur
          : randInt(cibleMin, cibleMax)
      const meilleurCalcul = cibleLaPlusProche(cible, calculs)
      if (meilleurCalcul === undefined) {
        cpt++
        continue
      }

      let text: string
      if (context.isHtml && !context.isTypst) {
        text = 'Valeur cible :<br>'
        text +=
          '<span style="display:inline-flex; justify-content:center; width:100%; gap:0.1rem; font-size:3rem; margin-top:5px;">'
        texNombre(cible)
          .split('')
          .forEach((x) => {
            text += `${texteEnCarte(x, true)}`
          })
        text += '</span><br><br>Nombres à utiliser :<br>'
        if (this.interactif) {
          text += addCompteEstBon(this, i, {
            cible,
            tirage,
            avecDivision: this.sup4,
            meilleurEcart: Math.abs(meilleurCalcul.valeur - cible),
          })
        } else {
          text +=
            '<span style="display:inline-flex; justify-content:center; width:100%; gap:0.5rem; font-size:2rem; margin-top:5px;">'
          tirage.forEach((x) => {
            text += `${texteEnCarte(texNombre(x))}`
          })
          text += '</span>'
        }
      } else if (context.isTypst) {
        text = 'Valeur cible:<br>'
        text += texNombre(cible)
          .split('')
          .map((chiffre) => texteEnCarte(chiffre, true))
          .join(' ')
        text += '<br><br>Nombres à utiliser:<br>'
        text += tirage
          .map((nombre) => texteEnCarte(texNombre(nombre)))
          .join(' ')
      } else {
        text = `Valeur cible: ${texNombre(cible)}<br>Nombres à utiliser:`
        tirage.forEach((x) => {
          text += `  ${texteEnCarte(texNombre(x))}`
        })
      }

      const texteCorr = correctionCompteEstBon(cible, meilleurCalcul)

      if (this.questionJamaisPosee(i, cible, ...tirage)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = text
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}

function correctionCompteEstBon(
  cible: number,
  calcul: CalculCompteEstBon,
): string {
  const introduction =
    calcul.valeur === cible
      ? 'Une solution exacte est :'
      : 'La valeur atteignable la plus proche est :'
  const etapes = calcul.etapes
    .map(
      (etape) =>
        `$${texNombre(etape.gauche)} ${etape.symbole} ${texNombre(etape.droite)} = ${texNombre(etape.resultat)}$`,
    )
    .join('<br>')

  if (calcul.etapes.length === 0) {
    return `${introduction}<br>$${miseEnEvidence(texNombre(calcul.valeur))}$`
  }
  return `${introduction}<br>${etapes}<br>On obtient $${miseEnEvidence(texNombre(calcul.valeur))}$.`
}
