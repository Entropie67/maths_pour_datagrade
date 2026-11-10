import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { minToHour } from '../../lib/outils/dateEtHoraires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { gcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '08/11/2026'

// Sans calculatrice : durées (en min) et vitesses (en km/h) faciles à manipuler de tête
const dureesSansCalculatrice = [
  10, 15, 20, 30, 40, 45, 75, 80, 90, 105, 120, 150, 180,
]
const vitessesSansCalculatrice = [30, 40, 50, 70, 80, 90, 100, 110, 120, 130] // 60 km/h est trop simple

/**
 * Durée donnée en minutes, écrite en LaTeX : 45 min, 1 h 15 min ou 2 h.
 */
function texDuree(minutes: number): string {
  return minutes % 60 === 0
    ? `${minutes / 60}\\text{ h}`
    : minToHour(minutes, true)
}

/**
 * Raisonnement de calcul mental : on découpe le trajet en durées de référence
 * (pgcd de la durée et de 60 min), pendant lesquelles la distance parcourue est entière.
 */
function raisonnementSansCalculatrice(
  type: 'vitesse' | 'temps' | 'distance',
  v: number,
  t: number,
  d: number,
  pronom: string,
  reponseEnMinutes: boolean,
): string {
  const km = (x: number) => `$${texNombre(x)}\\text{ km}$`
  let texte = 'Sans calculatrice, on peut raisonner ainsi.<br>'
  if (t % 60 === 0) {
    const n = t / 60
    switch (type) {
      case 'vitesse':
        return (
          texte +
          `En $${texDuree(t)}$, ${pronom} parcourt ${km(d)}, donc en $1\\text{ h}$, ${pronom} parcourt $${texNombre(d)} \\div ${n} = ${v}\\text{ km}$.`
        )
      case 'temps':
        return (
          texte +
          `En $1\\text{ h}$, ${pronom} parcourt ${km(v)}. Or $${texNombre(d)} = ${n} \\times ${v}$, donc il lui faut $${n}\\text{ h}$${reponseEnMinutes ? `, soit $${t}\\text{ min}$` : ''}.`
        )
      case 'distance':
        return (
          texte +
          `En $1\\text{ h}$, ${pronom} parcourt ${km(v)}, donc en $${texDuree(t)}$, ${pronom} parcourt $${n} \\times ${v} = ${texNombre(d)}\\text{ km}$.`
        )
    }
  }
  const ref = gcd(t, 60) // durée de référence, en minutes
  const n = t / ref // nombre de durées de référence dans le trajet
  const m = 60 / ref // nombre de durées de référence dans une heure
  const dRef = d / n // distance parcourue pendant la durée de référence
  const texRef = `$${ref}\\text{ min}$`
  const decoupage =
    (n > 1 ? `$${texDuree(t)} = ${n} \\times ${ref}\\text{ min}$ et ` : '') +
    `$1\\text{ h} = ${m} \\times ${ref}\\text{ min}$.<br>`
  switch (type) {
    case 'vitesse':
      return (
        texte +
        decoupage +
        `En ${texRef}, ${pronom} parcourt ${n > 1 ? `$${texNombre(d)} \\div ${n} = ${texNombre(dRef)}\\text{ km}$` : km(d)}, donc en $1\\text{ h}$, ${pronom} parcourt $${m} \\times ${texNombre(dRef)} = ${v}\\text{ km}$.`
      )
    case 'temps':
      texte += `$1\\text{ h} = ${m} \\times ${ref}\\text{ min}$.<br>`
      texte += `En $1\\text{ h}$, ${pronom} parcourt ${km(v)}, donc en ${texRef}, ${pronom} parcourt $${v} \\div ${m} = ${texNombre(dRef)}\\text{ km}$.<br>`
      if (n > 1) {
        texte += `Or $${texNombre(d)} = ${n} \\times ${texNombre(dRef)}$, donc il lui faut $${n} \\times ${ref}\\text{ min} = ${t}\\text{ min}$`
        texte += t > 60 && !reponseEnMinutes ? `, soit $${texDuree(t)}$.` : '.'
      } else {
        texte += `C'est exactement la distance à parcourir : il lui faut donc ${texRef}.`
      }
      return texte
    case 'distance':
    default:
      texte += decoupage
      texte += `En $1\\text{ h}$, ${pronom} parcourt ${km(v)}, donc en ${texRef}, ${pronom} parcourt $${v} \\div ${m} = ${texNombre(dRef)}\\text{ km}$`
      texte +=
        n > 1
          ? ` et en $${texDuree(t)}$, ${pronom} parcourt $${n} \\times ${texNombre(dRef)} = ${texNombre(d)}\\text{ km}$.`
          : '.'
      return texte
  }
}
export const titre = 'Résoudre un problème de vitesse'
export const interactifReady = true

/**
 * Recherche de la vitesse, du temps ou de la distance en utilisant un tableau de proportionnalité et le produit en croix
 * @author Rémi Angot
 */
export const uuid = 'a29bd'

export const refs = {
  'fr-fr': ['5P1D'],
  'fr-2016': ['5P11-1'],
  'fr-ch': ['11CTFA1A-1', '11LCFA1A-1', '11LSFA1A-1', 'PRQPF03C-3'],
}
export default class VitesseDistanceTemps extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 4
    this.sup2 = 1
    this.sup3 = false
    this.besoinFormulaireNumerique = [
      'Type de problème',
      4,
      '1: Déterminer la vitesse\n2 : Déterminer la durée\n3 : Déterminer la distance \n4: Mélange ',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de correction',
      2,
      '1: Avec un tableau de proportionnalité\n2: Avec les formules',
    ]
    this.besoinFormulaire3CaseACocher = ['Sans calculatrice', false]
  }

  nouvelleVersion() {
    this.consigneCorrection =
      this.sup2 === 1
        ? 'À vitesse constante, la distance et le temps du trajet sont proportionnels. On peut donc utiliser la technique du produit en croix.'
        : ''
    let typesDeQuestionsDisponibles = ['vitesse', 'temps', 'distance']
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['vitesse']
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['temps']
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = ['distance']
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    let texteAvant: string
    let texteApres: string
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let t: number
      let v: number
      let prenom
      let destination
      let texte
      let texteCorr
      if (this.sup3) {
        t = choice(dureesSansCalculatrice)
        // v multiple de 60 / pgcd(t, 60) : la distance parcourue pendant pgcd(t, 60) minutes est entière
        const pas = 60 / gcd(t, 60)
        v = choice(
          vitessesSansCalculatrice.filter((vitesse) => vitesse % pas === 0),
        )
      } else {
        v = randint(8, 26, [12]) * 5 // On évite le 60 km/h trop trivial
        if (v % 2 === 0) {
          t = randint(5, 39, [20]) * 3
        } else {
          t = randint(2, 19, [10]) * 6
        } // On s'assure que le produit v*t est divisible par 6
      }
      const tHour = Math.floor(t / 60)
      const tMin = t % 60
      const d = (v * t) / 60
      const pronomgenre = choice(['il', 'elle'])
      if (pronomgenre === 'il') {
        prenom = prenomM()
      } else {
        prenom = prenomF()
      }
      if (d < 60) {
        destination = choice([
          'à son travail',
          "à l'école de ses enfants",
          'au cinéma',
          'au centre de loisirs',
        ])
      } else {
        destination = choice([
          "jusqu'à sa location de vacances",
          'dans la maison de ses parents',
          'à une conférence',
        ])
      }
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'vitesse':
          texte = `${prenom} met $${texDuree(t)}$ pour aller ${destination} qui est à une distance de $${texNombre(d)}\\text{ km}$.<br>Déterminer sa vitesse moyenne.`
          if (this.sup2 === 1) {
            if (context.isHtml) {
              texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|}\n'
            } else {
              texteCorr = '$\\begin{array}{|l|c|c|}\n'
            }
            texteCorr += '\\hline\n'
            texteCorr += `\\text{Distance (en km)} & ${texNombre(d)} & v\\\\ \n`
            texteCorr += '\\hline\n'
            texteCorr += `\\text{Temps (en min)} & ${t} & 60 \\\\ \n`
            texteCorr += '\\hline\n'
            texteCorr += '\\end{array}$'
            texteCorr += '<br><br>'
            texteCorr += `$v=\\dfrac{${texNombre(d)}\\times 60}{${t}}=${v}$ \n`
          } else {
            if (tHour === 0) {
              texteCorr = `$v = \\dfrac{d}{t} = \\dfrac{${texNombre(d)}\\text{ km}}{\\dfrac{${t}}{60}~\\text{h}}$`
            } else if (tMin === 0) {
              texteCorr = `$v = \\dfrac{d}{t} = \\dfrac{${texNombre(d)}\\text{ km}}{${tHour}~\\text{h}}$`
            } else {
              texteCorr = `$v = \\dfrac{d}{t} = \\dfrac{${texNombre(d)}\\text{ km}}{${tHour} + \\dfrac{${tMin}}{60}~\\text{h}}$`
            }
          }
          if (this.sup3) {
            texteCorr +=
              '<br><br>' +
              raisonnementSansCalculatrice(
                'vitesse',
                v,
                t,
                d,
                pronomgenre,
                this.interactif,
              )
          }
          texteCorr += '<br><br>'
          texteCorr += `Sa vitesse moyenne est de $${miseEnEvidence(v)}\\text{ km/h}$.`
          texteAvant = '<br>Sa vitesse moyenne est de '
          texteApres = '$\\text{km/h}$.'
          handleAnswers(this, i, { reponse: { value: v } })
          break
        case 'temps':
          texte = `Si ${prenom} roule à $${v}\\text{ km/h}$, combien de temps`
          texte += ' lui faudra-t-'
          texte += `${pronomgenre}`
          texte += ` pour aller ${destination} qui est à une distance de $${texNombre(d, 2)}$ $\\text{km}$ ?`
          if (this.sup2 === 1) {
            if (context.isHtml) {
              texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|}\n'
            } else {
              texteCorr = '$\\begin{array}{|l|c|c|}\n'
            }
            texteCorr += '\\hline\n'
            texteCorr += `\\text{Distance (en km)} & ${texNombre(d)} & ${v}\\\\ \n`
            texteCorr += '\\hline\n'
            texteCorr += '\\text{Temps (en min)} & t & 60 \\\\ \n'
            texteCorr += '\\hline\n'
            texteCorr += '\\end{array}$'
            texteCorr += '<br><br>'
            texteCorr += `$t=\\dfrac{${texNombre(d)}\\times 60}{${v}}=${t}$ \n`
          } else {
            const tFrac = new FractionEtendue(d, v)
            texteCorr = `$t = \\dfrac{d}{v} = \\dfrac{${texNombre(d)}\\text{ km}}{${v}~\\text{km/h}} = ${tFrac.texFractionSimplifiee}~\\text{h} = ${tFrac.texFractionSimplifiee} \\times 60~\\text{min} = ${t}~\\text{min}$`
          }
          if (this.sup3) {
            texteCorr +=
              '<br><br>' +
              raisonnementSansCalculatrice(
                'temps',
                v,
                t,
                d,
                pronomgenre,
                this.interactif,
              )
          }
          texteCorr += '<br><br>'
          texteCorr += `${prenom} mettra`
          texteCorr += this.interactif
            ? ` $${miseEnEvidence(t)}$ min`
            : ` $${miseEnEvidence(texDuree(t))}$`
          texteCorr += ` pour aller ${destination}.`
          texteAvant = `<br>${prenom} mettra `
          texteApres = '$\\text{min}$.'
          handleAnswers(this, i, { reponse: { value: t } })
          break
        case 'distance':
        default:
          texte = `${prenom} roule à $${v}\\text{ km/h}$ de moyenne pendant $${texDuree(t)}$.<br>Calculer la distance parcourue.`
          if (this.sup2 === 1) {
            if (context.isHtml) {
              texteCorr = '$\\def\\arraystretch{2.5}\\begin{array}{|l|c|c|}\n'
            } else {
              texteCorr = '$\\begin{array}{|l|c|c|}\n'
            }
            texteCorr += '\\hline\n'
            texteCorr += `\\text{Distance (en km)} & d & ${v}\\\\ \n`
            texteCorr += '\\hline\n'
            texteCorr += `\\text{Temps (en min)} & ${t} & 60 \\\\ \n`
            texteCorr += '\\hline\n'
            texteCorr += '\\end{array}$'
            texteCorr += '<br><br>'
            texteCorr += `$d=\\dfrac{${texNombre(t)}\\times ${v}}{60}=${texNombre(d)}$ \n`
          } else {
            if (tHour === 0) {
              texteCorr = `$d = v \\times t = ${v}~\\text{km/h} \\times \\dfrac{${t}}{60}~\\text{h} = ${texNombre(d)}\\text{ km}$`
            } else if (tMin === 0) {
              texteCorr = `$d = v \\times t = ${v}~\\text{km/h} \\times ${tHour}~\\text{h} = ${texNombre(d)}\\text{ km}$`
            } else {
              texteCorr = `$d = v \\times t = ${v}~\\text{km/h} \\times \\left(${tHour} + \\dfrac{${tMin}}{60}\\right)~\\text{h} = ${texNombre(d)}\\text{ km}$`
            }
          }
          if (this.sup3) {
            texteCorr +=
              '<br><br>' +
              raisonnementSansCalculatrice(
                'distance',
                v,
                t,
                d,
                pronomgenre,
                this.interactif,
              )
          }
          texteCorr += '<br><br>'
          texteCorr += `${pronomgenre.charAt(0).toUpperCase() + pronomgenre.slice(1)} a donc parcouru $${miseEnEvidence(texNombre(d))}\\text{ km}$.`
          texteAvant = `<br>${pronomgenre.charAt(0).toUpperCase() + pronomgenre.slice(1)} a parcouru `
          texteApres = '$\\text{km}$.'
          handleAnswers(this, i, { reponse: { value: d } })
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant,
        texteApres,
      })
      if (this.questionJamaisPosee(i, v, t)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
