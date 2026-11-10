import { glisseNombreInteractif } from '../../lib/apps/glisse_nombre_interactif'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Multiplier ou diviser par 0,1 ; 0,01 ou 0,001'
export const dateDePublication = '28/10/2026'

/**
 * Multiplication et/ou division d'un nombre décimal par 0,1 ; 0,01 ou 0,001.
 * La correction rappelle que 0,1 = 1/10, 0,01 = 1/100, 0,001 = 1/1000 et
 * indique comment se déplace le chiffre des unités.
 * La classe est étendue par 6N2autoD-4 (multiplications seulement).
 * @author Rémi Angot
 */
export const uuid = 'aaa0b'

export const refs = {
  'fr-fr': ['5N1autoE-4'],
  'fr-ch': ['9R1NO6G-8', '9R2NO6G-8', '9R3NO6G-8'],
}

const nomsPositionsDecimales = ['dixièmes', 'centièmes', 'millièmes']
const nomsPositionsEntieres = ['dizaines', 'centaines', 'milliers']

/**
 * Tire un nombre dont le chiffre des unités n'est pas nul.
 * @param decimal true pour un nombre décimal (1 à 3 décimales), false pour un entier
 */
function tireNombre(decimal: boolean): number {
  const entiere = choice([
    randint(1, 9),
    randint(1, 9) * 10 + randint(1, 9),
    randint(1, 9) * 100 + randint(0, 9) * 10 + randint(1, 9),
  ])
  if (!decimal) return entiere
  const nbDecimales = randint(1, 3)
  const partieDecimale = randint(1, 10 ** nbDecimales - 1)
  // Éviter un dernier chiffre décimal nul : 0,50 s'écrirait 0,5
  const fraction =
    partieDecimale % 10 === 0 ? partieDecimale + randint(1, 9) : partieDecimale
  return arrondi(entiere + fraction / 10 ** nbDecimales, 3)
}

/**
 * Écrit un nombre en colorant en bleu le chiffre d'une position donnée,
 * même quand le nombre contient des espaces de séparation (contrairement à coloreUnSeulChiffre).
 * @param nombre le nombre à écrire
 * @param exposant l'exposant de la position (0 pour les unités, -1 pour les dixièmes, 2 pour les centaines…)
 */
function nombreAvecChiffreColore(nombre: number, exposant: number): string {
  const jetons: string[] = texNombre(nombre).match(/\\,|,|\d|./g) ?? []
  const positionVirgule = jetons.indexOf(',')
  const nbChiffresPartieEntiere = jetons
    .slice(0, positionVirgule === -1 ? jetons.length : positionVirgule)
    .filter((jeton) => /\d/.test(jeton)).length
  const indexChiffre =
    exposant >= 0
      ? nbChiffresPartieEntiere - 1 - exposant
      : nbChiffresPartieEntiere - exposant - 1
  let compteur = -1
  return jetons
    .map((jeton) => {
      if (!/\d/.test(jeton)) return jeton
      compteur++
      return compteur === indexChiffre
        ? miseEnEvidence(jeton, bleuMathalea)
        : jeton
    })
    .join('')
}

export default class MultiplierDiviserParPuissancesNegativesDe10 extends Exercice {
  /** Si true, seules les multiplications sont posées (paramètre d'opération absent) */
  protected multiplicationSeulement = false

  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Résultat',
        '2 : Premier nombre',
        '3 : Nombre par lequel on multiplie ou divise (0,1 ; 0,01 ou 0,001)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type du premier nombre',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = ['Avec glisse-nombres']
    this.besoinFormulaire4Texte = [
      'Opération',
      [
        'Nombres séparés par des tirets  :',
        '1 : Multiplication',
        '2 : Division',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1-2'
    this.sup2 = '3'
    this.sup3 = true
    this.sup4 = '3'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.consigne = 'Compléter.'
    this.comment =
      'Le premier paramètre permet de choisir le nombre à rechercher dans chaque calcul.<br><br>'
    this.comment +=
      'Le deuxième paramètre permet de choisir si le premier nombre est entier, décimal ou un mélange des deux.<br><br>'
    this.comment += "Le troisième paramètre permet d'ajouter un glisse-nombre."
    this.comment +=
      '<br><br>Le quatrième paramètre permet de choisir entre des multiplications, des divisions ou un mélange des deux.'
  }

  nouvelleVersion() {
    const typesDeNombresCherches = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const typesDePremierNombre = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const operations = gestionnaireFormulaireTexte({
      saisie: this.multiplicationSeulement ? '1' : this.sup4,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const puissances = combinaisonListes([1, 2, 3], this.nbQuestions)

    this.consigne = 'Compléter.'
    if (context.isHtml && !context.isTypst && this.sup3) {
      this.consigne += '<br>Un glisse-nombre est à disposition pour répondre '
      this.consigne +=
        this.nbQuestions === 1 ? 'à la question.' : 'aux questions.'
      this.consigne += glisseNombreInteractif({ number: 20.25 })
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const k = puissances[i]
      const estMultiplication = operations[i] === 1
      const a = tireNombre(typesDePremierNombre[i] === 2)
      const coefficient = arrondi(10 ** -k, 3)
      const resultat = estMultiplication
        ? arrondi(a * coefficient, 6)
        : arrondi(a * 10 ** k, 6)
      if (!this.questionJamaisPosee(i, a, k, operations[i])) continue

      const signe = estMultiplication ? '\\times' : '\\div'
      const texteCoefficient = texNombre(coefficient)
      const fraction = `\\dfrac{1}{${texNombre(10 ** k)}}`
      const exposantArrivee = estMultiplication ? -k : k
      const nomArrivee = estMultiplication
        ? nomsPositionsDecimales[k - 1]
        : nomsPositionsEntieres[k - 1]
      const chiffreDesUnites = Math.floor(a) % 10

      // Rappel du cours : la même phrase quelle que soit la question posée
      let texteCorr = estMultiplication
        ? `Multiplier par $${texteCoefficient}=${fraction}$ revient à diviser par $${texNombre(10 ** k)}$.<br>`
        : `Diviser par $${texteCoefficient}=${fraction}$ revient à multiplier par $${texNombre(10 ** k)}$.<br>`
      texteCorr += `Le chiffre des unités devient le chiffre des ${nomArrivee}`
      texteCorr += ` (ici, le chiffre $${miseEnEvidence(chiffreDesUnites, bleuMathalea)}$ dans $${nombreAvecChiffreColore(a, 0)}$ et dans $${nombreAvecChiffreColore(resultat, exposantArrivee)}$).<br>`

      let texte: string
      let reponse: number
      let options: Record<string, boolean>
      const typeCherche = typesDeNombresCherches[i]
      if (typeCherche === 1) {
        // Recherche du résultat
        texte = `$${texNombre(a)}${signe}${texteCoefficient}=$`
        texte += this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          : sp() + '$\\ldots$'
        texteCorr += `$${texNombre(a)}${signe}${texteCoefficient}=${miseEnEvidence(texNombre(resultat))}$`
        reponse = resultat
        options = { fractionEgale: true, nombreDecimalSeulement: true }
      } else if (typeCherche === 2) {
        // Recherche du premier nombre
        texte = `${signe}${texteCoefficient}=${texNombre(resultat)}`
        texte = this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
              texteApres: `$${texte}$`,
            })
          : `$\\ldots${texte}$`
        texteCorr += `$${miseEnEvidence(texNombre(a))}${signe}${texteCoefficient}=${texNombre(resultat)}$`
        reponse = a
        options = { fractionEgale: true, nombreDecimalSeulement: true }
      } else {
        // Recherche du nombre par lequel on multiplie ou divise
        texte = `$${texNombre(a)}${signe}$`
        texte += this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
              texteApres: `$=${texNombre(resultat)}$`,
            })
          : `${sp()}$\\ldots=${texNombre(resultat)}$`
        texteCorr += `$${texNombre(a)}${signe}${miseEnEvidence(texteCoefficient)}=${texNombre(resultat)}$`
        reponse = coefficient
        options = { nombreDecimalSeulement: true }
      }
      handleAnswers(this, i, { reponse: { value: reponse, options } })

      if (this.sup3) {
        texteCorr += glisseNombreInteractif({
          number: a,
          animation: estMultiplication ? -k : k,
        })
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
