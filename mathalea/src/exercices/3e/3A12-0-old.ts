import { engrenages } from '../../lib/2d/engrenage'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { bleuMathalea } from '../../lib/colors'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { ppcm } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

export const titre = 'Résoudre des problèmes avec des engrenages'
export const dateDePublication = '05/10/2022'
export const dateDeModifImportante = '17/01/2024'

/**
 * @author Jean-claude Lhote et Mickael Guironnet (pour la possibilité d'avoir plusieurs questions)
 * Résoudre des problèmes de ppcm avec les engrenages.
 */
export const uuid = '6b37f'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

const replayAnimationAction = '3A12-0-old:replay-animation'
let replayAnimationRegistered = false

export default class EngrenagesAnimes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4

    this.sup = 1
    this.sup2 = false
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Calculer le nombre de dents (n tours à gauche)\n2 : Calculer le nombre de dents (tourne de n dents à gauche)\n3 : Calculer le nombre de tours (2 roues)\n4 : Calculer le nombre de tours à droite (tourne de n dents à gauche)\n5 : Synchroniser 3 roues\n6 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      "Arrêt de l'animation après un cycle lors de la correction",
    ]
  }

  nouvelleVersion(numeroExercice?: number) {
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    /**
     * Liste les multiples de nbDentsRoueA par séries de 5 jusqu'à mettre en évidence un multiple de nbDentsRoueB
     * @param {number} nbDentsRoueA
     * @param {number} nbDentsRoueB
     */
    const listePremiersMultiples = function (
      nbDentsRoueA: number,
      nbDentsRoueB: number,
    ) {
      let result = `Voici la liste des premiers multiples de $${nbDentsRoueA}$ :<br>`
      // on va faire en sorte de toujours avoir un nombre de multiples multiple de 5
      const nbMarge =
        5 - ((ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA) % 5)
      const kMax = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA + nbMarge
      for (let k = 1; k < kMax + 1; k++) {
        result += `$${k}\\times${nbDentsRoueA} = `
        if (k === ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA) {
          result += miseEnEvidence(texNombre(k * nbDentsRoueA, 0), bleuMathalea)
          result += '$ ; '
        } else {
          result += `${texNombre(k * nbDentsRoueA, 0)}$ ; `
        }
        if (k % 5 === 0 && k !== kMax) {
          result += '<br>'
        }
      }
      result += '$\\ldots$ '
      result += '<br>'
      return result
    }

    const remiseAZeroT = function (
      numeroExercice: string,
      nbToursPremiereRoue: number,
      oneCycle: boolean,
      intervallesId: Record<string, number[]>,
    ) {
      try {
        const container = document.querySelector(
          `#containerAnimRoues${numeroExercice}`,
        )
        if (!container) return
        const animRoue =
          container.querySelectorAll<SVGAnimationElement>('[id^=animRoue]')
        const compteurRoue = container.querySelectorAll('text[id^=compteur]')

        // on arrete toutes les roues et on remet en position initiale
        // animRoue.forEach(e => e.endElement())
        // on remet à zéro le compteur de toutes les roues et on recupère intervalles Ids
        compteurRoue.forEach((e) => {
          e.textContent = '0'
        })

        intervallesId[numeroExercice]?.forEach((e) => clearInterval(e))
        intervallesId[numeroExercice] = []

        // on demarre les roues ou on remet en position intiale
        animRoue.forEach((e) => e.beginElement())

        // on met à jour les compteurs des roue
        compteurRoue.forEach((e, i) => {
          const inter = window.setInterval(
            () => {
              e.textContent = String(parseInt(e.textContent) + 1)
            },
            Number(animRoue[i].getAttribute('dur')) * 1000,
          )
          intervallesId[numeroExercice] = [
            ...intervallesId[numeroExercice],
            inter,
          ]
        })

        if (oneCycle) {
          // dans un cycle, on arrête tout si c'est demandé
          setTimeout(
            () => {
              animRoue.forEach((e) => e.endElement())
              intervallesId[numeroExercice]?.forEach((e) => clearInterval(e))
              intervallesId[numeroExercice] = []
            },
            nbToursPremiereRoue *
              parseFloat(animRoue[0].getAttribute('dur') ?? '') *
              1000,
          )
        }
      } catch (e) {
        window.notify(`${e} ... erreur dans la fonction remiseAZero()`, {
          intervallesId: JSON.stringify(intervallesId),
          numeroExercice,
          nbToursPremiereRoue,
        })
      }
    }

    for (let i = 0, cpt = 0, k = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const objetsEnonce = []
      const objetsCorrection = []
      let kk = k
      let nbDentsRoueA: number, nbDentsRoueB: number
      let nbDentsRoueC: number | undefined
      let nbToursA: number, nbToursB: number, nbToursAbc: number
      let nbToursC: number | undefined
      let texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      let texteCorr = '' // Idem pour le texte de la correction.
      let roues: ObjetMathalea2D[] = []
      let rouesCorr: ObjetMathalea2D[]
      switch (listeTypesDeQuestions[i]) {
        case 1:
          do {
            nbDentsRoueA = randint(8, 25)
            nbDentsRoueB = randint(8, 25, nbDentsRoueA)
            nbToursA = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA
            nbToursB = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueB
          } while (
            (nbToursA > 4 && nbToursB > 4) ||
            nbToursA === 1 ||
            nbToursB === 1
          ) // au moins une des deux roues fait moins de 5 tours
          texte +=
            `La roue dentée de gauche possède $${nbDentsRoueA}$ dents ` +
            (context.isHtml ? "(le dessin n'est pas représentatif)" : '') +
            '.<br>'
          texte += `Quand elle effectue $${nbToursA}$ tours, la roue de droite effectue $${nbToursB}$ tours.<br>`
          texte += 'Combien la roue de droite possède-t-elle de dents ?'
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          texteCorr +=
            'Le nombre de dents multiplié par le nombre de tours de chaque roue doit donner le même résultat.<br>'
          texteCorr = `La roue de gauche effectue $${nbToursA}$ tours, donc tourne de $${nbToursA}\\times ${nbDentsRoueA}=${nbDentsRoueA * nbToursA}$ dents.<br>`
          texteCorr += `Soit $n$ le nombre de dents de la roue de droite qui effectue $${nbToursB}$ tours, on a alors : $n\\times${nbToursB} = ${nbDentsRoueA}\\times ${nbToursA} = ${nbDentsRoueA * nbToursA}$.<br>`
          texteCorr += `On en déduit que $n=\\dfrac{${nbDentsRoueA * nbToursA}}{${nbToursB}}=${nbDentsRoueB}$.<br>`
          texteCorr += `La roue de droite a donc $${miseEnEvidence(nbDentsRoueB)}$ dents.<br>`
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbDentsRoueB } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          roues = engrenages(
            { dureeTourBase: 0, module: 0.4 },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          rouesCorr = engrenages(
            {
              dureeTourBase: Math.ceil(20 / Math.max(nbToursA, nbToursB)),
              module: 0.4,
              marqueurs: true,
            },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          break
        case 2:
          do {
            nbDentsRoueA = randint(8, 25)
            nbDentsRoueB = randint(8, 25, nbDentsRoueA)
            nbToursA = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA
            nbToursB = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueB
          } while (
            (nbToursA > 4 && nbToursB > 4) ||
            nbToursA === 1 ||
            nbToursB === 1
          ) // au moins une des deux roues fait moins de 5 tours
          texte +=
            `La roue dentée de gauche possède $${nbDentsRoueA}$ dents ` +
            (context.isHtml ? "(le dessin n'est pas représentatif)" : '') +
            '.<br>'
          texte += `Elle tourne de $${nbToursA * nbDentsRoueA}$ dents. Pendant ce temps, la roue de droite fait $${nbToursB}$ tour${nbToursB > 1 ? 's' : ''}.<br>`
          texte += 'Combien la roue de droite possède-t-elle de dents ?'
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbDentsRoueB } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texteCorr +=
            'Le nombre de dents multiplié par le nombre de tours de chaque roue doit donner le même résultat.<br>'
          texteCorr += `La roue de gauche tourne de $${nbToursA * nbDentsRoueA}$ dents en $${nbToursA}$ tours.<br>`
          texteCorr += `Soit $n$ le nombre de dents de la roue de droite, on a alors : $n\\times${nbToursB} = ${nbDentsRoueA * nbToursA}$.<br>`
          texteCorr += `On en déduit que $n=\\dfrac{${nbDentsRoueA * nbToursA}}{${nbToursB}}=${nbDentsRoueB}$.<br>`
          texteCorr += `La roue de droite a donc $${miseEnEvidence(nbDentsRoueB)}$ dents.<br>`
          roues = engrenages(
            { dureeTourBase: 0, module: 0.4 },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          rouesCorr = engrenages(
            {
              dureeTourBase: Math.ceil(20 / Math.max(nbToursA, nbToursB)),
              module: 0.4,
              marqueurs: true,
            },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          break
        case 3:
          do {
            nbDentsRoueA = randint(8, 25)
            nbDentsRoueB = randint(8, 25, nbDentsRoueA)
            nbToursA = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA
            nbToursB = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueB
          } while (
            (nbToursA > 4 && nbToursB > 4) ||
            nbToursA === 1 ||
            nbToursB === 1
          ) // au moins une des deux roues fait moins de 5 tours
          texte += `La roue dentée de gauche possède $${nbDentsRoueA}$ dents et celle de droite possède $${nbDentsRoueB}$ dents.<br>`
          texte += `${numAlpha(0)} Au bout de combien de tours pour la roue de gauche les deux roues retrouveront leur position initiale ?<br>`
          texte += `${numAlpha(1)} Combien de tours aura alors effectués la roue de droite ?`
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbToursB } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texteCorr += `Lorsque la roue de gauche effectue $n$ tours, cela fait $${nbDentsRoueA}n$ dents.<br>`
          texteCorr += `Lorsque la roue de droite effectue $m$ tours, cela fait $${nbDentsRoueB}m$ dents.<br>`
          texteCorr += `Nous cherchons donc le plus petit multiple commun à $${nbDentsRoueA}$ et à $${nbDentsRoueB}$.<br>`
          texteCorr += listePremiersMultiples(nbDentsRoueA, nbDentsRoueB)
          texteCorr += listePremiersMultiples(nbDentsRoueB, nbDentsRoueA)
          texteCorr += `${numAlpha(0)}Il faudra donc $${miseEnEvidence(nbToursA)}$ tours (car $${miseEnEvidence(nbToursA)}\\times${nbDentsRoueA}=${miseEnEvidence(nbDentsRoueA * nbToursA, bleuMathalea)}$) de la roue de gauche pour que les roues retrouvent leur position initiale.<br>`
          texteCorr += `${numAlpha(1)}La roue de droite aura effectué alors $${miseEnEvidence(nbToursB)}$ tours (car $${miseEnEvidence(nbToursB)}\\times${nbDentsRoueB}=${miseEnEvidence(nbDentsRoueB * nbToursB, bleuMathalea)}$).<br>`
          roues = engrenages(
            { dureeTourBase: 0, module: 0.4 },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          rouesCorr = engrenages(
            {
              dureeTourBase: Math.ceil(20 / Math.max(nbToursA, nbToursB)),
              module: 0.4,
              marqueurs: true,
            },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          break
        case 4:
          do {
            nbDentsRoueA = randint(8, 25)
            nbDentsRoueB = randint(8, 25, nbDentsRoueA)
            nbToursA = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA
            nbToursB = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueB
          } while (
            (nbToursA > 4 && nbToursB > 4) ||
            nbToursA === 1 ||
            nbToursB === 1
          ) // au moins une des deux roues fait moins de 5 tours
          texte +=
            `La roue dentée de gauche possède $${nbDentsRoueA}$ dents et la roue de droite en possède $${nbDentsRoueB}$ ` +
            (context.isHtml ? "(le dessin n'est pas représentatif)" : '') +
            '.<br>'
          texte += `La roue de gauche tourne de $${nbToursA * nbDentsRoueA}$ dents.<br>Pendant ce temps, combien la roue de droite effectue-t-elle de tours ?`
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbToursB } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texteCorr +=
            'Le nombre de dents multiplié par le nombre de tours de chaque roue doit donner le même résultat.<br>'
          texteCorr += `La roue de gauche tourne de $${nbToursA * nbDentsRoueA}$ dents.<br>`
          texteCorr += `Soit $n$ le nombre de tours de la roue de droite qui a $${nbDentsRoueB}$ dents, on a alors : $n\\times${nbDentsRoueB} = ${nbDentsRoueA * nbToursA}$.<br>`
          texteCorr += `On en déduit que $n=\\dfrac{${nbDentsRoueA * nbToursA}}{${nbDentsRoueB}}=${nbToursB}$.<br>`
          texteCorr += `La roue de droite a donc effectué $${miseEnEvidence(nbToursB)}$ tours pendant que la roue de gauche en a effectués $${nbToursA}$.<br>`
          roues = engrenages(
            { dureeTourBase: 0, module: 0.4 },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          rouesCorr = engrenages(
            {
              dureeTourBase: Math.ceil(20 / Math.max(nbToursA, nbToursB)),
              module: 0.4,
              marqueurs: true,
            },
            nbDentsRoueA,
            nbDentsRoueB,
          )
          break
        case 5:
          do {
            nbDentsRoueA = randint(8, 25)
            nbDentsRoueB = randint(8, 12, nbDentsRoueA)
            nbDentsRoueC = randint(8, 25, [nbDentsRoueA, nbDentsRoueB])
            nbToursA = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueA
            nbToursB = ppcm(nbDentsRoueA, nbDentsRoueB) / nbDentsRoueB
            nbToursC = ppcm(nbDentsRoueA, nbDentsRoueC) / nbDentsRoueC
            nbToursAbc =
              ppcm(ppcm(nbDentsRoueA, nbDentsRoueB), nbDentsRoueC) /
              nbDentsRoueA
          } while (
            (nbToursA > 4 && nbToursC > 4 && nbToursB > 4) ||
            nbToursA === 1 ||
            nbToursC === 1 ||
            nbToursB === 1
          ) // au moins une des deux roues fait moins de 5 tours
          roues = engrenages(
            { dureeTourBase: 0, module: 0.4 },
            nbDentsRoueA,
            nbDentsRoueB,
            nbDentsRoueC,
          )
          rouesCorr = engrenages(
            {
              dureeTourBase: Math.ceil(
                20 / Math.max(nbToursA, nbToursB, nbToursC),
              ),
              module: 0.4,
              marqueurs: true,
            },
            nbDentsRoueA,
            nbDentsRoueB,
            nbDentsRoueC,
          )
          texte += `La roue de gauche possède $${nbDentsRoueA}$ dents, celle du milieu en a $${nbDentsRoueB}$ et celle de droite en a $${nbDentsRoueC}$.<br>`
          texte += `${numAlpha(0)}Combien de tours doit effectuer la roue de gauche avant que son repère et celui de la roue du milieu soient à nouveau comme dans la position initiale ?`
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbToursA } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texte += `${numAlpha(1)}Combien de tours doit effectuer la roue de gauche avant que son repère et celui de la roue de droite soient à nouveau comme dans la position initiale ?`
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbToursB } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texte += `${numAlpha(2)}`
          texte += this.interactif
            ? `Dans la situation ${numAlpha(1, true)}, la roue du milieu n'étant pas dans sa position initiale, combien de tours la roue de gauche doit-elle effectuer pour que les trois roues retrouvent leur position initiale ?`
            : `Dans la situation ${numAlpha(1, true)}, la roue du milieu est-elle dans sa position initiale ? Sinon, combien de tours la roue de gauche doit-elle effectuer pour que les trois roues retrouvent leur position initiale ?`
          texte += ajouteChampTexteMathLive(
            this,
            kk,
            KeyboardType.clavierNumbers,
          )
          texte += '<br>'
          handleAnswers(
            this,
            kk,
            { reponse: { value: nbToursAbc } },
            { formatInteractif: 'mathlive' },
          )
          kk++
          texteCorr += `${numAlpha(0)}Le nombre de dents multiplié par le nombre de tours de chaque roue doit donner le même résultat.<br>`
          texteCorr += `Nous cherchons donc le plus petit multiple commun à $${nbDentsRoueA}$ et à $${nbDentsRoueB}$.<br>`
          texteCorr += listePremiersMultiples(nbDentsRoueA, nbDentsRoueB)
          texteCorr += listePremiersMultiples(nbDentsRoueB, nbDentsRoueA)
          texteCorr += `Il faudra donc $${miseEnEvidence(nbToursA)}$ tours de la roue de gauche et $${nbToursB}$ tours à la roue du milieu pour qu'elles se retrouvent dans leur position initiale.<br>`
          texteCorr += `<br>${numAlpha(1)}Faisons de même avec la roue de gauche et celle de droite.<br>`
          texteCorr += `Nous cherchons donc le plus petit multiple commun à $${nbDentsRoueA}$ et à $${nbDentsRoueC}$.<br>`
          texteCorr += listePremiersMultiples(nbDentsRoueA, nbDentsRoueC)
          texteCorr += listePremiersMultiples(nbDentsRoueC, nbDentsRoueA)
          texteCorr += `La roue de droite effectuera donc $${miseEnEvidence(nbToursC)}$ tours quand la roue de gauche en effectuera $${(nbToursC * nbDentsRoueC) / nbDentsRoueA}$.<br>`
          if (nbToursC !== nbDentsRoueA) {
            texteCorr += `En effet $${nbToursC}\\times ${nbDentsRoueC}=${(nbToursC * nbDentsRoueC) / nbDentsRoueA}\\times ${nbDentsRoueA}=${nbToursC * nbDentsRoueC}$.<br>`
          } else {
            texteCorr += `Remarque : Quand le plus petit multiple commun de deux nombres est le produit de ces nombres, on dit qu'ils sont premiers entre eux. $${nbDentsRoueC}$ et $${nbDentsRoueA}$ sont premiers entre eux.<br>`
          }
          texteCorr += `<br>${numAlpha(2)}Dans cette situation, la roue du milieu tourne, elle aussi, de $${nbToursC * nbDentsRoueC}$ dents.<br>`
          texteCorr +=
            (nbToursC * nbDentsRoueC) % nbDentsRoueB === 0
              ? `Ce nombre est un multiple du nombre de dents de la roue du milieu, donc elle a effectué exactement $\\dfrac{${nbToursC * nbDentsRoueC}}{${nbDentsRoueB}}=${(nbToursC * nbDentsRoueC) / nbDentsRoueB}$ tours.<br>`
              : "Ce nombre n'est pas un multiple du nombre de dents de la roue du milieu, donc elle ne sera pas dans sa position initiale.<br>"
          texteCorr += `Il faudra attendre que la roue de gauche tourne de $${nbToursAbc * nbDentsRoueA}$ dents soit $${miseEnEvidence(nbToursAbc)}$ tours, la roue du milieu en fera $${(nbToursAbc * nbDentsRoueA) / nbDentsRoueB}$ et la roue de droite en fera $${(nbToursAbc * nbDentsRoueA) / nbDentsRoueC}$.<br>`
          break
        default:
          throw new Error(
            `Type de question inconnu : ${listeTypesDeQuestions[i]}`,
          )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[0] = {
          enonce: 'Dans un engrenage, il y a deux roues. ' + texte,
          propositions: [
            {
              texte: texteCorr,
              statut: 3,
              feedback: '',
              sanscadre: false,
              pointilles: false,
            },
          ],
        }
      }
      objetsEnonce.push(...roues)
      objetsCorrection.push(...rouesCorr)

      const paramsEnonce = Object.assign({}, fixeBordures(objetsEnonce), {
        pixelsParCm: 20,
        scale: 0.75,
      })
      const paramsCorrection = Object.assign(
        {},
        fixeBordures(objetsCorrection),
        { pixelsParCm: 20, scale: 0.75 },
      )

      texte += mathalea2d(paramsEnonce, objetsEnonce)
      if (context.isHtml) {
        texteCorr += `<div id="containerAnimRoues${numeroExercice}_${i}">${mathalea2d(paramsCorrection, objetsCorrection)}</div>`
        const oneCycle = this.sup2
        const button = document.createElement('button')
        button.innerText = "Relancer l'animation"
        button.classList.add(
          'px-6',
          'py-2.5',
          'mr-10',
          'my-5',
          'ml-6',
          'bg-coopmaths',
          'text-white',
          'font-medium',
          'text-xs',
          'leading-tight',
          'uppercase',
          'rounded',
          'shadow-md',
          'transform',
          'hover:scale-110',
          'hover:bg-coopmaths-dark',
          'hover:shadow-lg',
          'focus:bg-coopmaths-dark',
          'focus:shadow-lg',
          'focus:outline-none',
          'focus:ring-0',
          'active:bg-coopmaths-dark',
          'active:shadow-lg',
          'transition',
          'duration-150',
          'ease-in-out',
        )
        button.setAttribute('id', `b_AnimRoue${numeroExercice}_${i}`)
        texteCorr += '<br>' + button.outerHTML
        registerReplayAnimation(remiseAZeroT)
        texteCorr += DomReadyActionElement.create({
          action: replayAnimationAction,
          payload: {
            numeroExercice,
            question: i,
            nbToursPremiereRoue: nbToursA,
            oneCycle,
          },
        })
      }

      if (
        this.questionJamaisPosee(
          i,
          nbToursA,
          nbToursB,
          nbToursC ?? '',
          nbDentsRoueA,
          nbDentsRoueB,
          nbDentsRoueC ?? '',
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        k = kk // pour interactif
      }
    }
    listeQuestionsToContenu(this)
  }
}

function registerReplayAnimation(
  remiseAZeroT: (
    numeroExercice: string,
    nbToursPremiereRoue: number,
    oneCycle: boolean,
    intervallesId: Record<string, number[]>,
  ) => void,
) {
  if (replayAnimationRegistered) return
  replayAnimationRegistered = true
  DomReadyActionElement.registerCallback(
    replayAnimationAction,
    ({ payload }) => {
      if (
        typeof payload !== 'object' ||
        payload === null ||
        ('numeroExercice' in payload &&
          typeof payload.numeroExercice !== 'number') ||
        !('question' in payload) ||
        typeof payload.question !== 'number' ||
        !('nbToursPremiereRoue' in payload) ||
        typeof payload.nbToursPremiereRoue !== 'number' ||
        !('oneCycle' in payload) ||
        typeof payload.oneCycle !== 'boolean'
      )
        return
      const numeroExercice =
        'numeroExercice' in payload ? payload.numeroExercice : undefined
      const { question, nbToursPremiereRoue, oneCycle } = payload
      const idSuffix = `${numeroExercice}_${question}`
      const btn = document.getElementById(`b_AnimRoue${idSuffix}`)
      if (!btn) return

      const intervallesId: Record<string, number[]> = {}
      const handleClick = function () {
        remiseAZeroT(idSuffix, nbToursPremiereRoue, oneCycle, intervallesId)
      }
      btn.addEventListener('click', handleClick)

      setTimeout(function () {
        document
          .querySelector(`#containerAnimRoues${idSuffix}`)
          ?.querySelectorAll<SVGAnimationElement>('[id^=animRoue]')
          .forEach((e) => e.endElement())
      })

      return () => {
        btn.removeEventListener('click', handleClick)
        intervallesId[idSuffix]?.forEach((e) => clearInterval(e))
        intervallesId[idSuffix] = []
      }
    },
  )
}
