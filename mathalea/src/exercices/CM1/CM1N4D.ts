import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Ajouter ou soustraire des unités, des dizaines, des centaines, des dixièmes ou des centièmes à un nombre décimal sans retenue'
export const dateDePublication = '03/11/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Ajouter ou soustraire n unités, dizaines, centaines, dixièmes ou centièmes (n entier de 1 à 9) à un nombre décimal, sans retenue.
 * @author Rémi Angot
 */
export const uuid = '5ce36'

export const refs = {
  'fr-fr': ['CM1N4D'],
  'fr-ch': [],
}

const rangs = [
  { nom: 'unité', puissance: 0 },
  { nom: 'dizaine', puissance: 1 },
  { nom: 'centaine', puissance: 2 },
  { nom: 'dixième', puissance: -1 },
  { nom: 'centième', puissance: -2 },
]

export default class AjouterSoustraireUnitesDixiemesSansRetenue extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 1
    this.besoinFormulaireTexte = [
      'Rang du nombre ajouté ou soustrait',
      [
        'Nombres séparés par des tirets :',
        '1 : Unités',
        '2 : Dizaines',
        '3 : Centaines',
        '4 : Dixièmes',
        '5 : Centièmes',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup = '6'
    this.besoinFormulaire2Texte = [
      'Opération',
      [
        'Nombres séparés par des tirets :',
        '1 : Addition',
        '2 : Soustraction',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '3'
  }

  nouvelleVersion() {
    const listeRangs = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 5,
        melange: 6,
        defaut: 6,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    const listeOperations = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup2,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const rang = rangs[listeRangs[i] - 1]
      const addition = listeOperations[i] === 1
      const nbChiffresEntiers =
        rang.puissance === 2
          ? 3
          : rang.puissance === 1
            ? randint(2, 3)
            : randint(1, 3)
      const nbDecimales = rang.puissance === -2 ? 2 : randint(1, 2)
      // chiffres[puissance] : le premier chiffre de la partie entière et le dernier chiffre de la partie décimale ne sont pas nuls
      const chiffres = new Map<number, number>()
      for (let p = -nbDecimales; p < nbChiffresEntiers; p++) {
        const extremite = p === nbChiffresEntiers - 1 || p === -nbDecimales
        chiffres.set(p, randint(extremite ? 1 : 0, 9))
      }
      const chiffreAvant = addition ? randint(1, 8) : randint(2, 9)
      chiffres.set(rang.puissance, chiffreAvant)
      const n = addition
        ? randint(1, 9 - chiffreAvant)
        : randint(1, chiffreAvant - 1)
      const chiffreApres = addition ? chiffreAvant + n : chiffreAvant - n

      let nombre = new Decimal(0)
      for (const [p, chiffre] of chiffres) {
        nombre = nombre.add(new Decimal(10).pow(p).mul(chiffre))
      }
      const terme = new Decimal(10).pow(rang.puissance).mul(n)
      const resultat = addition ? nombre.add(terme) : nombre.sub(terme)
      const signe = addition ? '+' : '-'

      let texte = `$${texNombre(nombre, nbDecimales)}${signe}${texNombre(terme, 2)}=$`
      const explication = texteEnCouleur(
        `On ${addition ? 'ajoute' : 'soustrait'} $${n}$ ${rang.nom}${n > 1 ? 's' : ''} : le chiffre des ${rang.nom}s passe de $${chiffreAvant}$ à $${chiffreApres}$ et les autres chiffres ne changent pas.`,
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>$${texNombre(nombre, nbDecimales)}${signe}${texNombre(terme, 2)}=${miseEnEvidence(texNombre(resultat, nbDecimales))}$`

      if (
        this.questionJamaisPosee(i, nombre.toString(), terme.toString(), signe)
      ) {
        handleAnswers(this, i, { reponse: { value: resultat.toNumber() } })
        texte += this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          : '$\\dots$'
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
