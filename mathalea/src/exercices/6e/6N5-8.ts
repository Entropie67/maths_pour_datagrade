import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { queDevant, sp } from '../../lib/outils/outilString'
import { prenomF } from '../../lib/outils/Personne'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes de type : ... de plus ou ... de moins'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '10/07/2021'
export const dateDeModifImportante = '13/01/2026'

/**
 *
 * @author Laurence CANDILLE, Olivier Mimeau (ajout d'un cas) et Rémi Angot (refactorisation)

 * Relecture : Novembre 2021 par EE
 */
export const uuid = '99522'

export const refs = {
  'fr-fr': ['6N5-8', '5N1D-8'],
  'fr-2016': ['6C22'],
  'fr-ch': ['9R1NO7E-6', '9R2NO7E-6', '9R3NO7E-6', 'PRQST02B-12', 'PRQNO15A-6'], // Primaire anciennement :['9NO16-4'],
}
export default class ProblemesDePlusEtDeMoins extends Exercice {
  constructor() {
    super()
    this.consigne =
      `Résoudre les problèmes suivants au brouillon et écrire les réponses dans les cases, ne pas préciser «${sp()}€${sp()}» ni «${sp()}euros${sp()}» $\\ldots$`
    this.nbQuestions = 4
    this.sup = 1 // Niveau de difficulté
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Valeurs entières\n2 : Une décimale\n3 : Deux décimales',
    ]
  }

  nouvelleVersion() {
    const n = this.sup - 1
    if (this.interactif && context.isHtml) {
      this.consigne =
        this.nbQuestions > 1
          ? `Résoudre les problèmes suivants au brouillon et écrire les réponses dans les cases, ne pas préciser «${sp()}€${sp()}» ni «${sp()}euros${sp()}» $\\ldots$`
          : `Résoudre le problème suivant au brouillon et écrire la réponse dans la case, ne pas préciser «${sp()}€${sp()}» ni «${sp()}euros${sp()}» $\\ldots$`
    } else {
      this.consigne =
        this.nbQuestions > 1
          ? 'Résoudre les problèmes suivants.'
          : 'Résoudre le problème suivant.'
    }
    const typeQuestionsDisponibles = [
      'dePlusPourSoustraction',
      'deMoinsPourAddition',
      'dePlusPourAddition',
      'deMoinsPourSoustraction',
    ] // On créé 2 types de questions /// j'en ajoute deux et supprime la répition pour l'equilibrage
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    let r: number
    let e: number // argent de Romane et écart
    let m // argent de Malika
    let somme // argent total
    let prenom1, prenom2 // choix aleatoire des prenoms des filles
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let schema = ''
      // Boucle principale où i+1 correspond au numéro de la question
      prenom1 = prenomF()
      prenom2 = prenomF()
      while (prenom2 === prenom1) {
        prenom2 = prenomF()
      }
      ;[r, e] = nombreDecimales(n)
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'dePlusPourSoustraction':
          m = r - e
          somme = m + r

          texte = `${prenom2} dit à ${prenom1} : «${sp()}J'ai $${texPrix(r)}$ €, soit $${texPrix(e)}$ € de plus que toi.${sp()}»<br>`
          if (this.interactif && !context.isAmc) {
            texte += `Combien d'argent, en tout, possèdent les deux filles${sp()}?`
            texte += '<br>Les deux filles possèdent, en tout, '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte +=
              `Combien d'argent en euros possèdent, en tout, les deux filles${sp()}?`
          }
          texteCorr = `D'après l'énoncé, ${prenom2} a $${texPrix(r)}$ €.<br>${prenom2} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de plus')
          texteCorr += ` ${queDevant(prenom1)} signifie ${queDevant(prenom1)} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de moins')
          texteCorr += ` ${queDevant(prenom2)}. <br>${prenom1} a donc${sp()}: $${texPrix(r)}$ € - $${texPrix(e)}$ € = $${texPrix(m)}$ €.`
          texteCorr += `<br>$${texPrix(r)}$ € + $${texPrix(m)}$ € = $${texPrix(somme)}$ € `
          texteCorr += texteEnCouleur(
            `<br>Les deux filles possèdent, en tout, $${miseEnEvidence(texPrix(somme))}$ €.`,
          )
          schema = new SchemaEnBoite({
            lignes: [
              {
                barres: [
                  {
                    length: 5,
                    content: `? €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 5,
                    content: `? €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 2,
                    content: `$${texPrix(e)}$ €`,
                    type: 'boite',
                    color: 'orange',
                  },
                ],
              },
            ],
            topBraces: [
              {
                start: 1,
                end: 6,
                text: `${prenom1}`,
                type: 'accolade',
              },
              {
                start: 6,
                end: 13,
                text: `${prenom2}`,
                type: 'accolade',
              },
            ],
            bottomBraces: [
              {
                start: 1,
                end: 6,
                text: `$${texPrix(r)}$ € - $${texPrix(e)}$ €`,
              },
              {
                start: 6,
                end: 13,
                text: `$${texPrix(r)}$ €`,
                type: 'accolade',
              },
            ],
          }).display()

          break
        case 'deMoinsPourAddition':
          m = r + e
          somme = m + r

          texte = `${prenom2} dit à ${prenom1}${sp()}: «${sp()}J'ai $${texPrix(r)}$ €, soit $${texPrix(e)}$ € de moins que toi.${sp()}»<br>`
          if (this.interactif && !context.isAmc) {
            texte +=
              `Combien d'argent, en tout, possèdent les deux filles${sp()}?<br>Les deux filles possèdent, en tout,${sp()}:`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte +=
              `Combien d'argent en euros possèdent, en tout, les deux filles${sp()}?`
          }
          texteCorr = `D'après l'énoncé, ${prenom2} a $${texPrix(r)}$ €.<br>${prenom2} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de moins')
          texteCorr += ` ${queDevant(prenom1)} signifie ${queDevant(prenom1)} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de plus')
          texteCorr += ` ${queDevant(prenom2)}. <br>${prenom1} a donc${sp()}: $${texPrix(r)}$ € + $${texPrix(e)}$ € = $${texPrix(m)}$ €.`
          texteCorr += `<br>$${texPrix(r)}$ € + $${texPrix(m)}$ € = $${texPrix(somme)}$ € `
          texteCorr += texteEnCouleur(
            `<br>Les deux filles possèdent, en tout, $${miseEnEvidence(texPrix(somme))}$ €.`,
          )
          schema = new SchemaEnBoite({
            lignes: [
              {
                barres: [
                  {
                    length: 5,
                    content: `$${texPrix(r)}$ €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 2,
                    content: `$${texPrix(e)}$ €`,
                    type: 'boite',
                    color: 'orange',
                  },
                  {
                    length: 5,
                    content: `$${texPrix(r)}$ €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                ],
              },
            ],
            topBraces: [
              {
                start: 1,
                end: 6,
                text: `${prenom2}`,
                type: 'accolade',
              },
              {
                start: 6,
                end: 13,
                text: `${prenom1}`,
                type: 'accolade',
              },
            ],
            bottomBraces: [
              {
                start: 1,
                end: 13,
                text: `? €`,
                type: 'accolade',
              },
            ],
          }).display()

          break
        case 'dePlusPourAddition':
          m = r + e
          somme = m + r

          texte = `${prenom2} dit à ${prenom1}${sp()}: «${sp()}Tu as $${texPrix(r)}$ €, j'ai $${texPrix(e)}$ € de plus que toi.${sp()}»<br>`
          if (this.interactif && !context.isAmc) {
            texte +=
              `Combien d'argent, en tout, possèdent les deux filles${sp()}?<br>Les deux filles possèdent, en tout,${sp()}:`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte +=
              `Combien d'argent en euros possèdent, en tout, les deux filles${sp()}?`
          }
          texteCorr = `D'après l'énoncé, ${prenom1} a $${texPrix(r)}$ €.<br>${prenom2} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de plus')
          texteCorr += ` ${queDevant(prenom1)}. <br>${prenom2} a donc${sp()}: $${texPrix(r)}$ € + $${texPrix(e)}$ € = $${texPrix(m)}$ €.`
          texteCorr += `<br>$${texPrix(r)}$ € + $${texPrix(m)}$ € = $${texPrix(somme)}$ € `
          texteCorr += texteEnCouleur(
            `<br>Les deux filles possèdent, en tout, $${miseEnEvidence(texPrix(somme))}$ €.`,
          )
          schema = new SchemaEnBoite({
            lignes: [
              {
                barres: [
                  {
                    length: 5,
                    content: `$${texPrix(r)}$ €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 2,
                    content: `$${texPrix(e)}$ €`,
                    type: 'boite',
                    color: 'orange',
                  },
                  {
                    length: 5,
                    content: `$${texPrix(r)}$ €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                ],
              },
            ],
            topBraces: [
              {
                start: 1,
                end: 6,
                text: `${prenom1}`,
                type: 'accolade',
              },
              {
                start: 6,
                end: 13,
                text: `${prenom2}`,
                type: 'accolade',
              },
            ],
            bottomBraces: [
              {
                start: 1,
                end: 13,
                text: `? €`,
                type: 'accolade',
              },
            ],
          }).display()
          break
        case 'deMoinsPourSoustraction':
        default:
          m = r - e
          somme = m + r

          texte = `${prenom2} dit à ${prenom1}${sp()}: «${sp()}Tu as $${texPrix(r)}$ €, j'ai $${texPrix(e)}$ € de moins que toi.${sp()}»<br>`
          if (this.interactif && !context.isAmc) {
            texte +=
              `Combien d'argent, en tout, possèdent les deux filles${sp()}?<br>Les deux filles possèdent, en tout,${sp()}:`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte +=
              `Combien d'argent en euros possèdent, en tout, les deux filles${sp()}?`
          }
          texteCorr = `D'après l'énoncé, ${prenom1} a $${texPrix(r)}$ €.<br>${prenom2} a $${texPrix(e)}$ € `
          texteCorr += texteEnCouleurEtGras('de moins')
          texteCorr += ` ${queDevant(prenom1)}. <br>${prenom2} a donc${sp()}: $${texPrix(r)}$ € - $${texPrix(e)}$ € = $${texPrix(m)}$ €.`
          texteCorr += `<br>$${texPrix(r)}$ € + $${texPrix(m)}$ € = $${texPrix(somme)}$ € `
          texteCorr += texteEnCouleur(
            `<br>Les deux filles possèdent, en tout, $${miseEnEvidence(texPrix(somme))}$ €.`,
          )
          schema = new SchemaEnBoite({
            lignes: [
              {
                barres: [
                  {
                    length: 5,
                    content: `? €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 5,
                    content: `? €`,
                    type: 'boite',
                    color: 'lightblue',
                  },
                  {
                    length: 2,
                    content: `$${texPrix(e)}$ €`,
                    type: 'boite',
                    color: 'orange',
                  },
                ],
              },
            ],
            topBraces: [
              {
                start: 1,
                end: 6,
                text: `${prenom2}`,
                type: 'accolade',
              },
              {
                start: 6,
                end: 13,
                text: `${prenom1}`,
                type: 'accolade',
              },
            ],
            bottomBraces: [
              {
                start: 1,
                end: 6,
                text: `$${texPrix(r)}$ € - $${texPrix(e)}$ €`,
              },
              {
                start: 6,
                end: 13,
                text: `$${texPrix(r)}$ €`,
                type: 'accolade',
              },
            ],
          }).display()

          break
      }
      handleAnswers(this, i, { reponse: { value: texPrix(somme) } })

      if (this.questionJamaisPosee(i, m, somme)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = `${schema}<br><br>${texteCorr}`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function nombreDecimales(n: number): [number, number] {
  let r, e
  if (n === 0) {
    r = randint(40, 70)
    e = randint(10, 30)
    return [r, e]
  }
  if (n === 1) {
    r = (randint(40, 60) * 100 + randint(1, 9) * 10) / 100 // évite de retomber dans le cas n=0 par ex  4200/100
    e = (randint(10, 20) * 100 + randint(1, 9) * 10) / 100
    return [r, e]
  }
  r = (randint(40, 60) * 100 + randint(1, 9) * 10 + randint(1, 9)) / 100
  e = (randint(10, 20) * 100 + randint(1, 9) * 10 + randint(1, 9)) / 100
  return [r, e]
}
