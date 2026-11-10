import Decimal from 'decimal.js'
import { texTexte, texTexteGras } from '../../lib/format/texTexte'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  compteOccurences,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '28/07/2025' // Rajout du paramètre this.sup3  et de la correction détaillée

/**
 * Conversions  mètres, litres, grammes, octets (et euros pour la version LaTeX) en utilisant le préfixe pour déterminer la multiplication ou division à faire.
 *
 * * 1 : De da, h, k vers l'unité de référence
 * * 2 : De d, c, m vers l'unité de référence
 * * 3 : Multiplications ou divisions vers l'unité de référence
 * * 4 : Conversions d'octets
 * * 5 : Un mélange de toutes les conversions
 * * Paramètre supplémentaire : utiliser des nombres décimaux (par défaut tous les nombres sont entiers)
 * @author Rémi Angot
 * Relecture : Novembre 2021 par EE
 */

type Unite = 'm' | 'g' | '€' | 'L' | 'o' | 'octets' | 'ko' | 'Mo' | 'Go' | 'To'

interface Traduction {
  singulier: string
  pluriel: string
}

/**
 * Traduit un symbole d'unité en ses équivalents français au singulier et au pluriel.
 *
 * @param symbole - Le symbole de l’unité à traduire : `'m'` pour mètre, `'g'` pour gramme, `'€'` pour euro, ou `'L'` pour litre.
 * @returns Un objet contenant les formes singulière et plurielle en français.
 * @author Éric Elter
 * @throws {Error} Si le symbole fourni n’est pas pris en charge.
 *
 * @example
 * unit = traduireUnite('€');
 * // unit.singulier --> "euro"
 * // unit.pluriel --> "euros"
 */
function traduireUnite(symbole: Unite): Traduction {
  switch (symbole) {
    case 'm':
      return { singulier: 'mètre', pluriel: 'mètres' }
    case 'g':
      return { singulier: 'gramme', pluriel: 'grammes' }
    case '€':
      return { singulier: 'euro', pluriel: 'euros' }
    case 'L':
      return { singulier: 'litre', pluriel: 'litres' }
    case 'o':
      return { singulier: 'octet', pluriel: 'octets' }
    default:
      throw new Error(`Symbole inconnu : ${symbole}`)
  }
}

export default class ExerciceConversions extends Exercice {
  correction_avec_des_fractions: boolean
  valUnitaire: boolean
  constructor(niveau = 1) {
    super()
    this.sup = niveau // Niveau de difficulté de l'exercice
    this.sup2 = false // Avec des nombres décimaux ou pas
    this.titre =
      'Convertir des longueurs, masses, contenance, prix ou unités informatiques'
    this.consigne = 'Compléter.'
    this.spacing = 2
    this.correction_avec_des_fractions = false
    this.valUnitaire = false
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      "1 : De da, h, k vers l'unité de référence\n2 : De d, c, m vers l'unité de référence\n3 : Multiplications ou divisions vers l'unité de référence\n4 : Conversions avec les octets\n5 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.besoinFormulaire3CaseACocher = ["Qu'avec des unités de longueurs"]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = [
      'Avec possiblement des fractions dans la correction',
    ]
    this.sup4 = false
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = false
    this.comment =
      'Le paramètre qui permet de ne choisir que des unités de longueurs devient caduque si, à un paramètre précédent, on choisit de convertir des unités de stockage informatique.'
  }

  nouvelleVersion() {
    this.correction_avec_des_fractions = this.sup4

    const prefixeMulti = [
      ['da', 10, 'déca', 'une dizaine de'],
      ['h', 100, 'hecto', 'une centaine de'],
      ['k', 1000, 'kilo', 'un millier de'],
    ]
    const prefixeDiv = [
      ['d', 10, 'déci', 'un dixième de'],
      ['c', 100, 'centi', 'un centième de'],
      ['m', 1000, 'milli', 'un millième de'],
    ]
    let listeDesProblemes = []
    listeDesProblemes[0] = this.sup
    if (compteOccurences(listeDesProblemes, 5) > 0)
      listeDesProblemes = rangeMinMax(1, 4) // Teste si l'utilisateur a choisi tout
    listeDesProblemes = combinaisonListes(listeDesProblemes, this.nbQuestions)
    const listeDesOperations = combinaisonListes(
      [true, false],
      this.nbQuestions,
    )
    for (
      let i = 0,
        val,
        k,
        div,
        resultat,
        texte,
        texteCorr,
        listeUniteInfo: Unite[] = [],
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      k = randint(0, 2) // Choix du préfixe
      texteCorr = ''
      switch (listeDesProblemes[i]) {
        case 2:
          div = true // Avec des divisions
          break
        case 3:
          div = listeDesOperations[i] // Avec des multiplications ou des divisions
          break
        case 4:
          listeUniteInfo = ['octets', 'ko', 'Mo', 'Go', 'To']
          break
        case 1:
        default:
          div = false // Il n'y aura pas de division
          break
      }
      let nbChiffreArrondi = 0
      if (this.valUnitaire) val = new Decimal(1)
      else if (this.sup2) {
        // Si la case pour les nombres décimaux est cochée
        nbChiffreArrondi = 2
        val = choice([
          new Decimal(randint(1, 9)).div(10).add(randint(1, 19)),
          new Decimal(randint(1, 9)).div(10),
          new Decimal(randint(1, 9)).div(100),
          new Decimal(
            randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9),
          ).div(100),
        ])
        // XX,X 0,X 0,0X X,XX
      } else {
        nbChiffreArrondi = 0
        val = new Decimal(
          choice([
            randint(1, 9),
            randint(1, 9) * 10,
            randint(1, 9) * 100,
            randint(1, 9) * 10 + randint(1, 9),
          ]),
        )
        // X, X0, X00, XX
      }
      let unite: Unite = this.sup3 ? 'm' : choice(['m', 'L', 'g'])
      if (!div && listeDesProblemes[i] < 4) {
        // S'il faut multiplier pour convertir
        // Choix de l'unité spécifique
        if (k === 2) {
          unite = this.sup3 ? 'm' : choice(['m', 'g', '€']) // on supprime les kL mais on accepte les k€.
        } else if (k > 2) {
          unite = 'o'
        }

        resultat = val.mul(prefixeMulti[k][1])
        texte =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeMulti[k][0] + unite) +
          ' = ' +
          (this.interactif && context.isHtml
            ? `$ ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: '$' + texTexte(unite) + '$' })}`
            : `\\dotfill ${texTexte(unite)}$`)

        texteCorr =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeMulti[k][0] + unite) +
          ' =  ' +
          texNombre(val, nbChiffreArrondi) +
          '\\times' +
          texNombre(Number(prefixeMulti[k][1]), nbChiffreArrondi) +
          texTexte(unite) +
          ' = ' +
          texNombre(resultat, Math.max(0, nbChiffreArrondi - k - 1)) +
          texTexte(unite) +
          '$'
      } else if (
        div &&
        listeDesProblemes[i] < 4 &&
        this.correction_avec_des_fractions
      ) {
        resultat = val.div(prefixeDiv[k][1])
        texte =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeDiv[k][0] + unite) +
          ' = ' +
          (this.interactif && context.isHtml
            ? `$ ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: ' $' + texTexte(unite) + '$' })}`
            : ` \\dotfill ${texTexte(unite)}$`)
        texteCorr =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeDiv[k][0] + unite) +
          ' =  ' +
          fraction(val.toNumber(), Number(prefixeDiv[k][1])).texFraction +
          texTexte(unite) +
          ' = ' +
          texNombre(resultat, nbChiffreArrondi + 3) +
          texTexte(unite) +
          '$'
      } else if (div && listeDesProblemes[i] < 4) {
        resultat = val.div(prefixeDiv[k][1])
        texte =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeDiv[k][0] + unite) +
          ' = ' +
          (this.interactif && context.isHtml
            ? `$ ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: ' $' + texTexte(unite) + '$' })}`
            : ` \\dotfill ${texTexte(unite)}$`)
        texteCorr =
          '$ ' +
          texNombre(val, nbChiffreArrondi) +
          texTexte(prefixeDiv[k][0] + unite) +
          ' =  ' +
          texNombre(val, nbChiffreArrondi) +
          '\\div' +
          texNombre(Number(prefixeDiv[k][1]), 0) +
          texTexte(unite) +
          ' = ' +
          texNombre(resultat, nbChiffreArrondi + k + 1) +
          texTexte(unite) +
          '$'
      } else {
        // pour type de question = 4
        if (!Array.isArray(listeUniteInfo)) {
          listeUniteInfo = ['octets', 'ko', 'Mo', 'Go', 'To']
        }
        div = !this.sup2 ? false : listeDesOperations[i] // Pas de décimaux ? Alors que des multiplications
        let unite1 // unité de résultat
        let unite2 // unité du départ
        if (!div) {
          unite2 = randint(1, 4)
          unite1 = randint(0, unite2 - 1)
        } else {
          unite1 = randint(1, 4)
          unite2 = randint(0, unite1 - 1)
        }
        const ecart = unite2 - unite1 // nombre de multiplication par 1000 pour passer de l'un à l'autre
        if (unite1 === 0 && val.toNumber() % 1 !== 0)
          val = new Decimal(randint(3, 100)) // Pas de nombre d'octets non entiers
        const uniteOctets = listeUniteInfo[unite1]
        unite = listeUniteInfo[unite1]
        if (!div) {
          resultat = val.mul(Math.pow(10, 3 * ecart))
          texte =
            '$ ' +
            texNombre(val, nbChiffreArrondi) +
            texTexte(listeUniteInfo[unite2]) +
            ' = ' +
            (this.interactif && context.isHtml
              ? `$ ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: ' $' + texTexte(unite) + '$' })}`
              : ` \\dotfill ${texTexte(unite)}$`)
          texteCorr =
            '$ ' +
            texNombre(val, nbChiffreArrondi) +
            texTexte(listeUniteInfo[unite2]) +
            ' =  ' +
            texNombre(val, nbChiffreArrondi) +
            '\\times' +
            texNombre(Math.pow(10, 3 * ecart), 0) +
            texTexte(uniteOctets) +
            ' = ' +
            texNombre(resultat, 0) +
            texTexte(uniteOctets) +
            '$'
        } else {
          val = val.div(Math.pow(10, randint(3 * ecart - 1, 3 * ecart + 1)))
          resultat = val.mul(Math.pow(10, 3 * ecart))
          texte =
            '$ ' +
            texNombre(val, nbChiffreArrondi + 3 * ecart) +
            texTexte(listeUniteInfo[unite2]) +
            ' = ' +
            (this.interactif && context.isHtml
              ? `$ ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: ' $' + texTexte(unite) + '$' })}`
              : ` \\dotfill ${texTexte(unite)}$`)
          texteCorr =
            '$ ' +
            texNombre(val, nbChiffreArrondi + 3 * ecart) +
            texTexte(listeUniteInfo[unite2]) +
            ' =  ' +
            texNombre(val, nbChiffreArrondi + 3 * ecart) +
            '\\div' +
            texNombre(Math.pow(10, -3 * ecart), 3 * ecart) +
            texTexte(uniteOctets) +
            ' = ' +
            texNombre(resultat) +
            texTexte(uniteOctets) +
            '$'
        }
      }

      // EE : Mise en couleur de la réponse interactive
      const aMettreEnCouleur: string = miseEnEvidence(
        (texteCorr.split('=').pop() ?? '').replaceAll('$', ''),
      )
      texteCorr =
        texteCorr.replace(String(texteCorr.split('=').pop()), '') +
        aMettreEnCouleur.replace(texTexteGras(unite), '') +
        texTexte(unite) +
        '$'
      if (this.correctionDetaillee && listeDesProblemes[i] !== 4) {
        texteCorr =
          `Un ${div ? prefixeDiv[k][2] : prefixeMulti[k][2]}${traduireUnite(unite).singulier} est ${div ? prefixeDiv[k][3] : prefixeMulti[k][3]} ${div ? traduireUnite(unite).singulier : traduireUnite(unite).pluriel} donc :<br>` +
          texteCorr +
          '.'
      }

      if (this.questionJamaisPosee(i, val, resultat.toString())) {
        handleAnswers(this, i, {
          reponse: {
            value: resultat.toString(),
            options: { nombreDecimalSeulement: true, fractionDecimale: true },
          },
        })
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.vue === 'diap') {
          texte = texte.replace('= \\dotfill', '\\text{ en }')
        }
        if (context.isHtml) {
          texte = texte.replace(
            '\\dotfill',
            '\\ldots\\ldots\\ldots\\ldots\\ldots',
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
