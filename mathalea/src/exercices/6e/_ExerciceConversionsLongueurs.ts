import Decimal from 'decimal.js'
import { texTexte } from '../../lib/format/texTexte'
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

export const dateDeModifImportante = '10/04/2026'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'AMCNum'
export const titre = 'Convertir des longueurs ou des masses'

/**
 * Conversions de longueur (ou de masses) en utilisant le préfixe pour déterminer la multiplication ou division à faire.
 *
 * * 1 : De dam, hm, $\\text{km}$ vers m
 * * 2 : De dm, cm, mm vers m
 * * 3 : De m vers dam, hm, km
 * * 4 : De m vers dm, cm, mm
 * * 5 : Mélange
 * * Paramètre supplémentaire : utiliser des nombres décimaux (par défaut tous les nombres sont entiers)
 * @author Rémi Angot
 * 10/04/206 : Rajout des choix 3 et 4, et le tableau peut être utilisé avec les grammes par Éric Elter
 */

export default class ExerciceConversionsLongueurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : De dam, hm, km vers m',
        '2 : De dm, cm, mm vers m',
        '3 : De m vers dam, hm, km',
        '4 : De m vers dm, cm, mm',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.besoinFormulaire3CaseACocher = ['Avec tableau']
    this.besoinFormulaire4Numerique = [
      'Type de grandeur',
      2,
      '1 : Longueur\n2 : Masse',
    ]
    this.sup = '1' // Niveau de difficulté de l'exercice
    this.sup2 = false // Avec des nombres décimaux ou pas
    this.sup3 = false // avec le tableau
    this.sup4 = 1 // avec des mètres (pas des grammes)
    this.spacing = 2
  }

  nouvelleVersion() {
    this.consigne = context.isDiaporama ? 'Convertir ' : 'Compléter '
    const reponses = []
    const prefixeMulti: [string, number][] = [
      ['da', 10],
      ['h', 100],
      ['k', 1000],
    ]
    const prefixeDiv: [string, number][] = [
      ['d', 10],
      ['c', 100],
      ['m', 1000],
    ]
    const listek = combinaisonListes([0, 1, 2], this.nbQuestions)
    const listeDeDecimaux = combinaisonListes(
      ['entier', 'XX,X', '0,X', '0,0X', 'X,XX'],
      this.nbQuestions,
    )
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const unite = this.sup4 === 1 ? 'm' : 'g'
    for (let i = 0, a, k, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let resultat = 0
      let texte = ''
      let texteCorr = ''
      // On limite le nombre d'essais pour chercher des valeurs nouvelles

      const typesDeQuestions = listeTypeDeQuestions[i]
      k = listek[i] // Plutôt que de prendre un préfix au hasard, on alterne entre 10,100 et 1000

      if (this.sup2) {
        // Si la case pour les nombres décimaux est cochée
        switch (listeDeDecimaux[i]) {
          case 'entier':
            a = randint(1, 99)
            break
          case 'XX,X':
            a = arrondi(randint(1, 19) + randint(1, 9) / 10, 1)
            break
          case '0,X':
            a = arrondi(randint(1, 9) / 10, 1)
            break
          case '0,0X':
            a = arrondi(randint(1, 9) / 100, 2)
            break
          case 'X,XX':
          default:
            a = arrondi(
              randint(1, 9) + randint(1, 9) / 10 + randint(1, 9) / 100,
              2,
            )
        }
      } else {
        a = choice([
          randint(1, 9),
          randint(1, 9) * 10,
          randint(1, 9) * 100,
          randint(1, 9) * 10 + randint(1, 9),
        ])
        // X, X0, X00, XX
      }

      if (typesDeQuestions === 1) {
        // dam/hm/km → m  (multiplication)
        resultat = arrondi(a * Number(prefixeMulti[k][1]), 12)
        texte = `$${texNombre(a)} ${texTexte(prefixeMulti[k][0] + unite)} = `
        texte +=
          this.interactif && context.isHtml
            ? `$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: `${sp()}$${texTexte(unite)}$` })}`
            : `\\dotfills  ${texTexte(unite)}$`
        texteCorr = `$ ${texNombre(a)}${texTexte(prefixeMulti[k][0] + unite)} =  ${texNombre(a)}\\times${texNombre(prefixeMulti[k][1])}${texTexte(unite)} = ${miseEnEvidence(texNombre(resultat))}${texTexte(unite)}$`
        if (this.sup3 && context.vue === 'diap') {
          texte += `<br>${buildTab('0', '', '0', '', 2, true, unite)}`
        }
        if (this.sup3) {
          texteCorr += `<br>${buildTab(String(a), `${prefixeMulti[k][0]}m`, String(resultat), unite, 2, false, unite)}`
        }
      } else if (typesDeQuestions === 2) {
        // dm/cm/mm → m  (division)
        resultat = arrondi(a / Number(prefixeDiv[k][1]), 12)
        texte = `$${texNombre(a)} ${texTexte(prefixeDiv[k][0] + unite)} = `
        texte +=
          this.interactif && context.isHtml
            ? `$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: `${sp()}$${texTexte(unite)}$` })}`
            : `\\dotfills  ${texTexte(unite)}$`
        texteCorr = `$ ${texNombre(a)}${texTexte(prefixeDiv[k][0] + unite)} =  ${texNombre(a)}\\div${texTexte(String(prefixeDiv[k][1]))}${texTexte(unite)} = ${miseEnEvidence(texNombre(resultat))}${texTexte(unite)}$`
        if (this.sup3 && context.vue === 'diap') {
          texte += `<br>${buildTab('0', '', '0', '', 2, true, unite)}`
        }
        if (this.sup3) {
          texteCorr += `<br>${buildTab(String(a), `${prefixeDiv[k][0]}m`, String(resultat), unite, 2, false, unite)}`
        }
      } else if (typesDeQuestions === 4) {
        // m → dm/cm/mm  (multiplication)
        resultat = arrondi(a * Number(prefixeDiv[k][1]), 12)
        texte = `$${texNombre(a)} ${texTexte(unite)} = `
        texte +=
          this.interactif && context.isHtml
            ? `$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: `${sp()}$${texTexte(prefixeDiv[k][0] + unite)}$` })}`
            : `\\dotfills  ${texTexte(prefixeDiv[k][0] + unite)}$`
        texteCorr = `$ ${texNombre(a)}${texTexte(unite)} =  ${texNombre(a)}\\times${texNombre(prefixeDiv[k][1])}${texTexte(prefixeDiv[k][0] + unite)} = ${miseEnEvidence(texNombre(resultat))}${texTexte(prefixeDiv[k][0] + unite)}$`
        if (this.sup3 && context.vue === 'diap') {
          texte += `<br>${buildTab('0', '', '0', '', 2, true, unite)}`
        }
        if (this.sup3) {
          texteCorr += `<br>${buildTab(String(a), unite, String(resultat), `${prefixeDiv[k][0]}m`, 2, false, unite)}`
        }
      } else {
        // if (typesDeQuestions === 3) {
        // m → dam/hm/km  (division)
        resultat = arrondi(a / Number(prefixeMulti[k][1]), 12)
        texte = `$${texNombre(a)} ${texTexte(unite)} = `
        texte +=
          this.interactif && context.isHtml
            ? `$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, { texteApres: `${sp()}$${texTexte(prefixeMulti[k][0] + unite)}$` })}`
            : `\\dotfills  ${texTexte(prefixeMulti[k][0] + unite)}$`
        texteCorr = `$ ${texNombre(a)}${texTexte(unite)} =  ${texNombre(a)}\\div${texTexte(String(prefixeMulti[k][1]))}${texTexte(prefixeMulti[k][0] + unite)} = ${miseEnEvidence(texNombre(resultat))}${texTexte(prefixeMulti[k][0] + unite)}$`
        if (this.sup3 && context.vue === 'diap') {
          texte += `<br>${buildTab('0', '', '0', '', 2, true, unite)}`
        }
        if (this.sup3) {
          texteCorr += `<br>${buildTab(String(a), unite, String(resultat), `${prefixeMulti[k][0]}m`, 2, false, unite)}`
        }
      }

      if (this.questionJamaisPosee(i, resultat)) {
        reponses[i] = resultat
        handleAnswers(this, i, {
          reponse: {
            value: arrondi(resultat, 7),
            options: { nombreDecimalSeulement: true },
          },
        })
        // Si la question n'a jamais été posée, on en crée une autre
        if (context.vue === 'diap') {
          texte = texte.replace('= \\dotfills', '~\\text{en}')
        } else if (context.isHtml) {
          texte = texte.replace(
            '\\dotfills',
            '\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots',
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
    if (context.vue === 'latex' && this.sup3) {
      this.consigne += "en s'aidant du tableau ci-dessous :\n\n"
      this.consigne += buildTab(
        '0',
        '',
        '0',
        '',
        Math.min(10, this.nbQuestions),
        true,
        unite,
      )
    } else if (context.vue !== 'diap' && context.isHtml && this.sup3) {
      this.consigne += "en s'aidant du tableau ci-dessous :<br><br>"
      this.consigne += buildTab(
        '0',
        '',
        '0',
        '',
        Math.min(10, this.nbQuestions),
        true,
        unite,
      )
    } else this.consigne += ':'
  }
}

/**
 * Fonction utilitaire retournant le rang d'un nombre
 * @param {*} nb Nombre entier ou décimal
 * @param {*} pos Le rang cherché
 * @returns retourne la valeur de la colonne, si zéro inutile alors on retourne ''
 * Exemple :
 * getDigitFromNumber(1302.56,1000) retourne '1'
 * getDigitFromNumber(1302.56,10000) retourne ''
 * getDigitFromNumber(1302.56,100) retourne '3'
 * getDigitFromNumber(1302.56,10) retourne '0'
 * getDigitFromNumber(1302.56,0.1) retourne '5'
 * getDigitFromNumber(1302.56,0.001) retourne ''
 */
export function getDigitFromNumber(nb: string | number, pos: number) {
  if (typeof nb === 'number') nb = nb.toString()
  const n = new Decimal(nb)
  const po = new Decimal(pos)
  const exp = Decimal.ln(po).div(Decimal.ln(10)).toNumber()
  let res: string
  if (po.comparedTo(1) >= 0) {
    // partie entière : milliers, centaines, dizaines, unités
    let resultat = n.sub(n.div(po.mul(10)).trunc().mul(po.mul(10)))
    resultat = resultat.div(po).trunc()
    res = po.equals(1) || n.comparedTo(po) >= 0 ? resultat.toString() : ''
  } else {
    // partie décimale : dixième, centième, millième
    let resultat = n.sub(n.div(po.mul(10)).trunc().mul(po.mul(10)))
    resultat = resultat.div(po).trunc()
    res = Math.abs(exp) <= n.decimalPlaces() ? resultat.toString() : ''
  }
  return res
}
/**
 * @param {*} a Nombre de départ
 * @param {*} uniteA Unité de départ (ex : 'km',...)
 * @param {*} r Nombre converti
 * @param {*} uniteR
 * @param {*} ligne Nombre de ligne dans le tableau (par défaut :2)
 * @param {*} force Ajoute deux colonnes avant $\\text{km}$ et deux après mm (par défaut : false)
 * @param {*} grandeur La lettre de l'unité de base (par défaut : 'm', peut être 'g', 'l', etc.)
 * @returns Un tableau de conversion en latex.
 */
function buildTab(
  a: string,
  uniteA: string,
  r: string,
  uniteR: string,
  ligne = 2,
  force = false,
  grandeur = 'm',
) {
  const tabRep: (nbre: string, uniteNbre: string) => string[] = (
    nbre: string,
    uniteNbre: string,
  ) => {
    const res = ['', '', '', '', '', '', '', '', '', '', '']
    // Normalisation : on retire le suffixe grandeur pour obtenir le préfixe seul
    const prefixe = uniteNbre.replaceAll(' ', '').slice(0, -grandeur.length)
    const rangIndex: Record<string, number> = {
      k: 2,
      h: 3,
      da: 4,
      '': 5,
      d: 6,
      c: 7,
      m: 8,
    }
    const posCol = rangIndex[prefixe]
    // Si uniteNbre est vide (pas d'unité), on retourne res vide
    if (uniteNbre.replaceAll(' ', '') === '' || posCol === undefined) {
      return res
    }
    if (posCol !== undefined) {
      for (let i = 0; i <= 10; i++) {
        res[i] =
          (posCol - i === 0 ? '\\color{blue}{' : '') +
          getDigitFromNumber(nbre, Decimal.pow(10, posCol - i).toNumber()) +
          (posCol - i === 0
            ? new Decimal(nbre).decimalPlaces() === 0
              ? '}'
              : ',}'
            : '')
      }
    }
    return res
  }
  const createTab = (
    aT: string[],
    rT: string[],
    first: number,
    end: number,
    ligne: number,
  ) => {
    let texte = '$\\def\\arraystretch{1.5}\\begin{array}{'
    for (let i = first; i <= end; i++) {
      texte += `|c${i === end ? '|}' : ''}`
    }
    const g = grandeur
    const headers = [
      '\\hspace*{0.6cm}',
      '\\hspace*{0.6cm}',
      `\\; \\text{k${g}} \\;`,
      `\\; h${g} \\;`,
      `da${g}`,
      `\\;\\; ${g} \\;\\;`,
      `\\; d${g} \\;`,
      `\\; c${g} \\;`,
      `\\;m${g}\\;`,
      '\\hspace*{0.6cm}',
      '\\hspace*{0.6cm}',
    ]
    texte += '\\hline '
    for (let i = first; i <= end; i++) {
      texte += `${headers[i]} ${i < end ? '&' : '\\\\'}`
    }
    texte += '\\hline '
    for (let i = first; i <= end; i++) {
      texte += `${aT[i]} ${i < end ? '&' : '\\\\'}`
    }
    texte += '\\hline '
    for (let i = first; i <= end; i++) {
      texte += `${rT[i]} ${i < end ? '&' : '\\\\'}`
    }
    for (let k = 3; k <= ligne; k++) {
      texte += '\\hline '
      for (let i = first; i <= end; i++) {
        texte += `  ${i < end ? '&' : '\\\\'}`
      }
    }
    texte += '\\hline \\end{array}$'
    return texte
  }
  const aTab = tabRep(a, uniteA)
  const rTab = tabRep(r, uniteR)
  const minTab1 = aTab[0] !== '' || aTab[1] !== '' || force ? 0 : 2
  const minTab2 = rTab[0] !== '' || rTab[1] !== '' || force ? 0 : 2
  const maxTab1 = aTab[9] !== '' || aTab[10] !== '' || force ? 10 : 8
  const maxTab2 = rTab[9] !== '' || rTab[10] !== '' || force ? 10 : 8
  const texte = createTab(
    aTab,
    rTab,
    Math.min(minTab1, minTab2),
    Math.max(maxTab1, maxTab2),
    ligne,
  )
  return texte
}
