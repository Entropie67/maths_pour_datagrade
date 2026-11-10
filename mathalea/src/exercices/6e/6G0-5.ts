import { miseEnEvidence } from '../../lib/outils/embellissements'
import { droite } from '../../lib/2d/droites'
import { grille, seyes } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, numAlpha, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Appartenir ou ne pas appartenir'
export const dateDePublication = '05/10/2022'
export const dateDeModifImportante = '4/10/2023'
// Ajout de l'interactivité et suppression de (AB] par Rémi Angot
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
/**
 * Fonction générale pour la notion d'appartenance
 * @author Mickael Guironnet
 */

export const uuid = '9af23'

export const refs = {
  'fr-fr': ['6G0-5', '6AutoG1-2'],
  'fr-2016': ['6G10-6'],
  'fr-ch': ['9R1ES1A-5', '9R2ES1A-5', '9R3ES1A-5'],
}

const responsiveColumnsAction = '6G0-5:responsive-columns'
let responsiveColumnsRegistered = false

export default class constructionElementaire extends Exercice {
  //
  constructor() {
    super()
    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = 4
    this.besoinFormulaireNumerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.besoinFormulaire2Numerique = ['Nombre de phrases à compléter', 10]
  }

  nouvelleVersion(numeroExercice: number) {
    for (
      let i = 0, colonne1, colonne2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce = []
      const objetsCorrection = []
      const propositionsAMC = []
      const indLettre = randint(1, 15)
      const A = pointAbstrait(
        0,
        0,
        lettreDepuisChiffre(indLettre),
        'above left',
      )
      const B = pointAbstrait(
        randint(10, 11),
        randint(-4, 4, [-1, 0, 1]),
        lettreDepuisChiffre(indLettre + 1),
        'above right',
      )
      const d = droite(A, B, '', bleuMathalea)
      const AA = pointSurDroite(
        d,
        randint(1, 2),
        lettreDepuisChiffre(indLettre + 6),
        'below',
      )
      const BB = pointSurDroite(
        d,
        randint(3, 5),
        lettreDepuisChiffre(indLettre + 7),
        'below',
      )
      const CC = pointSurDroite(
        d,
        randint(6, 7),
        lettreDepuisChiffre(indLettre + 8),
        'below',
      )
      const DD = pointSurDroite(
        d,
        randint(8, 9),
        lettreDepuisChiffre(indLettre + 9),
        'below',
      )
      const C = pointAbstrait(
        randint(2, 4, [A.x]),
        randint(3, 6, [A.y]),
        lettreDepuisChiffre(indLettre + 2),
        'above left',
      )
      const D = pointAbstrait(
        randint(6, 8),
        randint(-7, -6, [A.y]),
        lettreDepuisChiffre(indLettre + 3),
      )
      const T = tracePoint(A, B, C, D, AA, BB, CC, DD)
      T.tailleTikz = 0.3
      objetsEnonce.push(T, labelPoint(A, B, C, D, AA, BB, CC, DD), d)
      const Xmin = Math.floor(Math.min(A.x, B.x, C.x, D.x) - 1)
      const Xmax = Math.ceil(Math.max(A.x, B.x, C.x, D.x) + 1)
      const Ymin = Math.floor(Math.min(A.y, B.y, C.y, D.y) - 1)
      const Ymax = Math.ceil(Math.max(A.y, B.y, C.y, D.y) + 1)

      let g, sc, carreaux
      if (this.sup < 3) {
        g = grille(Xmin, Ymin, Xmax, Ymax, 'gray', 0.7)
      } else {
        g = vide2d()
      }
      if (this.sup === 2) {
        carreaux = seyes(Xmin, Ymin, Xmax, Ymax)
        sc = 0.8
      } else {
        carreaux = vide2d()
        sc = 0.5
      }

      objetsEnonce.push(g, carreaux)
      objetsCorrection.push(g, carreaux)
      const ppc = 20
      const figure = mathalea2d(
        {
          xmin: Xmin,
          ymin: Ymin,
          xmax: Xmax,
          ymax: Ymax,
          pixelsParCm: ppc,
          scale: sc,
          display: 'block',
        },
        objetsEnonce,
      )
      colonne1 =
        (context.vue === 'diap' ? '<center>' : '') +
        figure +
        (context.vue === 'diap' ? '</center>' : '')

      colonne2 = 'Compléter avec $\\in$ ou $\\notin$. <br>'
      let correction2 = ''
      let questind = 0
      const points = [A, AA, BB, CC, DD, B, C, D]
      const tirage = []
      const typeOld = []
      for (let k = 0; k < Math.max(2, this.sup2); k++) {
        const ind = randint(0, 7)
        const ind1 = randint(0, 4, [ind])
        const ind2 = randint(0, 5, rangeMinMax(0, ind1))
        if (typeOld.length > 3) {
          typeOld.length = 0
        }
        const type = randint(0, 3, typeOld)
        typeOld.push(type)
        const tira =
          ind.toString() + ind1.toString() + ind2.toString() + type.toString()
        if (tirage.indexOf(tira) > -1) {
          k--
          continue
        } else {
          tirage.push(tira)
        }
        // Au moins 2 tirages sont toujours effectués (stabilité des liens partagés),
        // mais on n'affiche que le nombre de phrases demandé.
        if (k >= this.sup2) continue
        let lettre = ['(', ')']
        let sol = ''
        switch (type) {
          case 0: // droite
            lettre = ['(', ')']
            if (ind <= 5) {
              sol = '\\in'
            } else {
              sol = '\\notin'
            }
            break
          case 1: // segment
            lettre = ['[', ']']
            if (ind <= 5 && ind >= ind1 && ind <= ind2) {
              sol = '\\in'
            } else {
              sol = '\\notin'
            }
            break
          case 2: // demi-droite [)
            lettre = ['[', ')']
            if (ind <= 5 && ind >= ind1) {
              sol = '\\in'
            } else {
              sol = '\\notin'
            }
            break
          case 3: // demi-droite [)
            lettre = ['[', ')']
            if (ind <= 5 && ind >= ind1) {
              sol = '\\in'
            } else {
              sol = '\\notin'
            }
            break
        }
        if (this.interactif) {
          colonne2 +=
            numAlpha(questind) +
            `$${points[ind].nom}${sp(3)}$` +
            choixDeroulant(this, i * this.sup2 + k, {
              choices: [
                { label: '?', value: '' },
                { latex: '\\in', value: 'in' },
                { latex: '\\notin', value: 'notin' },
              ],
            }) +
            `$${sp(3)}${lettre[0]}${points[ind1].nom}${points[ind2].nom}${lettre[1]}$<br>`
          handleAnswers(
            this,
            i * this.sup2 + k,
            { reponse: { value: sol.replace('\\', '') } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else {
          const enonce = `$${points[ind].nom}${sp(3)}\\ldots\\ldots\\ldots${sp(3)}${lettre[0]}${points[ind1].nom}${points[ind2].nom}${lettre[1]}$`
          colonne2 += numAlpha(questind) + enonce + '<br>'
          if (context.isAmc) {
            propositionsAMC[k] = {
              type: 'qcmMult', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              enonce,
              options: { ordered: true },
              propositions: [
                {
                  texte: '$\\notin$',
                  statut: sol === '\\notin',
                },
                {
                  texte: '$\\in$',
                  statut: sol !== '\\notin',
                },
              ],
            }
          }
        }
        correction2 +=
          numAlpha(questind++) +
          `$${points[ind].nom}${sp(3)}${miseEnEvidence(sol)}${sp(3)}${lettre[0]}${points[ind1].nom}${points[ind2].nom}${lettre[1]}$<br>`
      }

      const options = {
        eleId: numeroExercice + '_' + (this.indexQuestionHote ?? i),
        widthmincol1: '500px',
        widthmincol2: '300px',
        largeur1: 60,
      }
      const enonce = deuxColonnesResp(colonne1, colonne2, options)
      const optionsSol = {
        eleId: 's-' + numeroExercice + '_' + (this.indexQuestionHote ?? i),
        widthmincol1: '500px',
        widthmincol2: '300px',
        largeur1: 60,
      }
      const correction = deuxColonnesResp(colonne1, correction2, optionsSol)
      registerResponsiveColumns()
      const enonceResponsiveReady = DomReadyActionElement.create({
        action: responsiveColumnsAction,
        payload: {
          targetId: `cols-responsive1-${options.eleId}`,
          widthMinCol2: options.widthmincol2,
        },
      })
      const correctionResponsiveReady = DomReadyActionElement.create({
        action: responsiveColumnsAction,
        payload: {
          targetId: `cols-responsive1-${optionsSol.eleId}`,
          widthMinCol2: optionsSol.widthmincol2,
        },
      })

      /****************************************************/
      if (this.questionJamaisPosee(i, correction)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] =
          `${enonce}${enonceResponsiveReady}${context.isHtml && i < this.nbQuestions - 1 ? '<br>' : ''}`
        this.listeCorrections[i] =
          `${correction}${correctionResponsiveReady}${context.isHtml && i < this.nbQuestions - 1 ? '<br>' : ''}`

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce:
              figure +
              'À partir de la figure ci-dessus, compléter les phrases suivantes par $\\notin$ ou $\\in$.',
            enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
            enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
            melange: true, // EE : ce champ est facultatif et permet (si false) de ne pas provoquer le mélange des questions.
            options: { avecSymboleMult: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) des propositions : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
  }
}

function registerResponsiveColumns() {
  if (responsiveColumnsRegistered) return
  responsiveColumnsRegistered = true
  DomReadyActionElement.registerCallback<{
    targetId: string
    widthMinCol2: string
  }>(responsiveColumnsAction, ({ payload }) => {
    const resizeColumns = () => {
      const element = document.getElementById(payload.targetId)
      if (!element || element.clientWidth === 0) return

      const mathalea2dElement = element.querySelector('.mathalea2d')
      const widthMathalea2d = parseInt(
        mathalea2dElement?.getAttribute('width') ?? '800',
      )
      const col1 = `${widthMathalea2d}px`
      const col2 = parseInt(payload.widthMinCol2.replaceAll('px', ''))
      const parent = element.parentElement
      const diff = (parent?.clientWidth ?? 1000) - widthMathalea2d

      element.style.minWidth = col1
      if (!parent) return
      parent.style.gridTemplateColumns = diff > col2 ? 'repeat(2, 1fr)' : 'auto'
    }

    const resizeAfterRender = () => window.requestAnimationFrame(resizeColumns)
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(resizeAfterRender)

    const target = document.getElementById(payload.targetId)
    if (target) {
      resizeObserver?.observe(target)
    }
    resizeAfterRender()
    document.addEventListener('exercicesDiap', resizeAfterRender)
    document.addEventListener('zoominOrout', resizeAfterRender)
    document.addEventListener('pleinEcran', resizeAfterRender)
    window.addEventListener('resize', resizeAfterRender)

    return () => {
      resizeObserver?.disconnect()
      document.removeEventListener('exercicesDiap', resizeAfterRender)
      document.removeEventListener('zoominOrout', resizeAfterRender)
      document.removeEventListener('pleinEcran', resizeAfterRender)
      window.removeEventListener('resize', resizeAfterRender)
    }
  })
}
