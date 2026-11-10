/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.unite.test.ts ⚠️
 */

import Decimal from 'decimal.js'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { nombreDeChiffresDansLaPartieEntiere } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer le volume de solides donnés'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '10/06/2024'
/**
 * Calcul de volumes.
 * @author Jean-claude Lhote (AMC par EE) // modifié par Mireille Gain pour y ajouter les décimaux
 */

export const uuid = '04b0d'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6M30'],
  'fr-ch': [],
}
export default class CalculDeVolumesOld extends Exercice {
  classe: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Sans conversion\n2 : Avec des conversions',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des décimaux', false]
    this.besoinFormulaire3Numerique = [
      "Type d'exercice interactif ou AMC",
      2,
      '1 : QCM\n2 : Numérique',
    ] // Texte, tooltip
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1 : Cubes\n2 : Pavés droits\n3 : Mélange',
    ]

    this.nbQuestions = 4

    this.sup = 1
    this.classe = 6
    this.sup3 = 2

    this.sup4 = 3
  }

  nouvelleVersion() {
    let thissup4Max

    let piApprox = false
    if (this.sup === 3) {
      this.sup = 1
      piApprox = true // calcul en prenant Pi environ 3
    }

    switch (this.classe) {
      case 6:
        thissup4Max = 2
        break
      case 5:
        thissup4Max = 4
        break
      case 4:
        thissup4Max = 8
        break
      case 3:
      default:
        thissup4Max = 9
        break
    }

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      min: 1,
      max: thissup4Max,
      defaut: thissup4Max + 1,
      melange: thissup4Max + 1,
      nbQuestions: Math.max(this.nbQuestions, thissup4Max),
      saisie: this.sup4,
      shuffle: true,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const listeUnites = [
      ['\\text{ m}', '\\text{ m}^3', 'm^3'],
      ['\\text{ dm}', '\\text{ dm}^3', 'dm^3'],
      ['\\text{ cm}', '\\text{ cm}^3', 'cm^3'],
      ['\\text{ mm}', '\\text{ mm}^3', 'mm^3'],
    ]
    let partieDecimale1, partieDecimale2, partieDecimale3
    /*   if (this.sup2) {
      partieDecimale1 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
      partieDecimale2 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
      partieDecimale3 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
    } else {
      partieDecimale1 = new Decimal(0)
      partieDecimale2 = new Decimal(0)
      partieDecimale3 = new Decimal(0)
    } */
    for (
      let i = 0,
        texte,
        texteCorr,
        L,
        l,
        h,
        c,
        r,
        j,
        resultat,
        resultat2,
        resultat3,
        resultat4,
        volume,
        cpt = 0;
      i < this.nbQuestions && cpt < 100;
    ) {
      this.autoCorrection[i] = {}
      texte = 'Calculer le volume'
      if (this.sup2) {
        partieDecimale1 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
        partieDecimale2 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
        partieDecimale3 = new Decimal(randint(1, 9)).div(10).mul(randint(0, 1))
      } else {
        partieDecimale1 = new Decimal(0)
        partieDecimale2 = new Decimal(0)
        partieDecimale3 = new Decimal(0)
      }
      switch (listeTypeDeQuestions[i]) {
        case 1: // cube
          c = new Decimal(randint(2, 20)).plus(partieDecimale1)
          volume = c.pow(3)
          j = randint(0, 3) // pour le choix de l'unité
          texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
          texte += ` d'un cube de $${texNombre(c, 1)} ${listeUnites[j][0]}$ d'arête.`
          texteCorr = `$\\mathcal{V}= c^3 =c \\times c \\times c = ${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=`
          texteCorr += `${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
          resultat = volume
          //  texte += resultat C'est gentil, ça de donner la réponse ;-)
          if (!c.eq(6)) resultat2 = c.pow(2).mul(6)
          else resultat2 = c.mul(24)
          if (!c.eq(2)) resultat3 = c.mul(4)
          else resultat3 = new Decimal(24)
          resultat4 = c.mul(6)
          break
        case 2: // pavé droit
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité

            l = partieDecimale1.plus(randint(2, 8))
            h = partieDecimale2.plus(randint(3, 10, Math.round(l.toNumber())))
            L = partieDecimale3.plus(randint(4, 10, Math.round(l.toNumber())))
            volume = l.mul(L).mul(h)

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'un pavé droit de $${texNombre(l, 1)}${listeUnites[j][0]}$ de profondeur, de $${texNombre(L, 1)}${listeUnites[j][0]}$ de longueur et de $${texNombre(h)}${listeUnites[j][0]}$ de hauteur.`
            texteCorr = `$\\mathcal{V}= l \\times L \\times h = ${texNombre(l, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(L, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(h)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`
            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
            resultat = volume
            resultat2 = l.plus(L).plus(h).mul(6)
            if (resultat2.eq(resultat)) resultat2 = resultat2.div(2)
            resultat3 = l
              .mul(2)
              .mul(L)
              .plus(L.mul(h).mul(2))
              .plus(l.mul(h).mul(2))
            resultat4 = l.plus(L).plus(h).mul(2)
          } else {
            // avec conversion
            j = randint(1, 2) // pour le choix de l'unité  centrale
            l = partieDecimale1.plus(randint(2, 5))
            h = partieDecimale2.plus(randint(3, 6)).mul(10)
            L = new Decimal(randint(6, 10)).div(10)
            volume = l.mul(L).mul(h)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += ` d'un pavé droit de $${texNombre(l, 1)}${listeUnites[j][0]}$ de profondeur, de $${texNombre(L, 1)}${listeUnites[j - 1][0]}$ de longueur et de $${texNombre(h)}${listeUnites[j + 1][0]}$ de hauteur.`
            texteCorr = `$\\mathcal{V}= l \\times L \\times h = ${texNombre(l, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(L, 1)}${listeUnites[j - 1][0]}\\times${texNombre(h, 0)}${listeUnites[j + 1][0]}=${texNombre(l, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(L.toNumber() * 10)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(h.div(10), 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=`
            texteCorr += `${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            resultat = volume
            resultat2 = l.plus(L).plus(h).mul(6)
            resultat3 = l
              .mul(2)
              .mul(L)
              .plus(L.mul(h).mul(2))
              .plus(l.mul(h).mul(2))
            resultat4 = l.plus(L).plus(h).mul(2)
          }
          break
        case 3: // Cylindre
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            r = new Decimal(randint(2, 10))
            h = new Decimal(randint(2, 15))

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            if (piApprox) {
              volume = r.pow(2).mul(h).mul(3)
              texte += ', en prenant $\\pi \\approx 3$, ' // On prend pi = 3
            } else {
              volume = r.pow(2).mul(h).mul(Decimal.acos(-1))
              texte += `, arrondi au $${listeUnites[j][1]}$ près, ` // Il faut toujours arrondir à cause de la présence de Pi
            }
            let diametre = choice([true, false])

            diametre = true
            if (diametre) {
              texte += `d'un cylindre de $${2 * r.toNumber()}${listeUnites[j][0]}$ de diamètre et de $${texNombre(h, 0)}${listeUnites[j][0]}$ de hauteur.`
            } else {
              texte += `d'un cylindre de $${r}${listeUnites[j][0]}$ de rayon et de $${texNombre(h, 0)}${listeUnites[j][0]}$ de hauteur.`
            }
            if (piApprox) {
              texteCorr = diametre
                ? `$R = diametre \\div 2 = ${2 * r.toNumber()}${listeUnites[j][0]} \\div 2 = ${r}${listeUnites[j][0]}$<br>`
                : ''
              texteCorr += `$\\mathcal{V}=\\pi \\times R ^2 \\times h =\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h, 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texNombre(
                r.pow(2).mul(h),
                0,
              )}\\pi${listeUnites[j][1]}\\approx ${texNombre(
                r.pow(2).mul(h),
                0,
              )}\\times 3${listeUnites[j][1]} \\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr = diametre
                ? `$R = diametre \\div 2 = ${2 * r.toNumber()}${listeUnites[j][0]} \\div 2 = ${r}${listeUnites[j][0]}$<br>`
                : ''
              texteCorr += `$\\mathcal{V}=\\pi \\times R ^2 \\times h =\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h, 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texNombre(
                r.pow(2).mul(h),
                0,
              )}\\pi${listeUnites[j][1]}\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          } else {
            j = randint(2, 3) // pour le choix de l'unité
            r = new Decimal(randint(2, 10))
            h = new Decimal(randint(20, 150))
            volume = r.pow(2).mul(h).mul(Decimal.acos(-1))
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += `, arrondi au $${listeUnites[j][1]}$ près,`
            texte += ` d'un cylindre de $${r}${listeUnites[j][0]}$ de rayon et de $${texNombre(h.div(10), 1)}${listeUnites[j - 1][0]}$ de hauteur.`
            texteCorr = `$\\mathcal{V}=\\pi \\times R ^2 \\times h =\\pi\\times\\left(${texNombre(r, 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h.div(10), 1)}${listeUnites[j - 1][0]}=\\pi\\times${texNombre(r.mul(r), 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}^2\\times${texNombre(h, 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texNombre(r.pow(2).mul(h), 0)}\\pi${listeUnites[j][1]}\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
          }
          resultat = volume.round()
          resultat2 = volume.mul(4).round()
          resultat3 = volume.div(2).round()
          resultat4 = volume.mul(2).round()
          break
        case 4: // prisme droit
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            c = partieDecimale3.plus(randint(2, 10))
            h = randint(2, 5)
            l = randint(6, 10)
            volume = c.mul(h * l).div(2)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            // texte += !volume.eq(volume.round()) ? `, arrondi au $${listeUnites[j][1]}$ près,` : ''
            if (choice([false, true])) {
              texte += ` d'un prisme droit de hauteur $${l}${listeUnites[j][0]}$. La base du prisme droit est un triangle rectangle dont les côtés de l'angle droit mesurent $${texNombre(c, 1)}${listeUnites[j][0]}$ et $${h}${listeUnites[j][0]}$.`
            } else {
              texte += ` d'un prisme droit de hauteur $${l}${listeUnites[j][0]}$ et dont les bases sont des triangles de base $${texNombre(c, 1)}${listeUnites[j][0]}$ et de hauteur correspondante $${h}${listeUnites[j][0]}$.`
            }
            texteCorr = `$\\mathcal{V}=\\mathcal{B} \\times h=\\dfrac{${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${l}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=`
          } else {
            j = randint(1, 2) // pour le choix de l'unité
            c = partieDecimale3.plus(randint(2, 10))
            h = new Decimal(randint(30, 50))
            l = new Decimal(randint(5, 15)).div(10)
            volume = c.mul(h).mul(l).div(2)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += ` d'un prisme droit de hauteur $${texNombre(l, 1)}${listeUnites[j - 1][0]}$ et dont les bases sont des triangles de base $${texNombre(c, 1)}${listeUnites[j][0]}$ et de hauteur correspondante $${h}${listeUnites[j + 1][0]}$.`
            texteCorr = `$\\mathcal{V}=\\mathcal{B} \\times h=\\dfrac{${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${h}${listeUnites[j + 1][0]}}{2}\\times${texNombre(l, 1)}${listeUnites[j - 1][0]}=\\dfrac{${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\times${texNombre(
              h.div(10),
              1,
            )}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${texNombre(l.mul(10), 0)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=`
          }
          texteCorr += `${miseEnEvidence(`${texNombre(volume, 2)}${listeUnites[j][1]}`)}$`
          resultat = volume
          resultat2 = volume.mul(4)
          resultat3 = c.plus(h).mul(l)
          resultat4 = volume.mul(2)
          break
        case 5: // cone
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            r = randint(2, 10)
            h = randint(2, 15)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            if (piApprox) {
              volume = new Decimal(r * r * h).mul(3).div(3)
              texte += ', en prenant $\\pi \\approx 3$, ' // On prend pi = 3
            } else {
              volume = new Decimal(r * r * h).mul(Decimal.acos(-1)).div(3)
              texte += `, arrondi au $${listeUnites[j][1]}$ près, ` // Il faut toujours arrondir à cause de la présence de Pi
            }
            const diametre = randint(0, 1)
            if (diametre) {
              // diamètre
              texte += `d'un cône de $${2 * r}${listeUnites[j][0]}$ de diamètre et de $${h}${listeUnites[j][0]}$ de hauteur.`
            } else {
              texte += `d'un cône de $${r}${listeUnites[j][0]}$ de rayon et de $${h}${listeUnites[j][0]}$ de hauteur.`
            }
            if (piApprox) {
              texteCorr = diametre
                ? `$R = diametre \\div 2 = ${2 * r}${listeUnites[j][0]} \\div 2 = ${r}${listeUnites[j][0]}$<br>`
                : ''
              texteCorr += `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texFractionFromString(
                r * r * h,
                3,
              )}\\pi${listeUnites[j][1]}\\approx${texFractionFromString(
                r * r * h,
                3,
              )}\\times 3 \\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr = diametre
                ? `$R = diametre \\div 2 = ${2 * r}${listeUnites[j][0]} \\div 2 = ${r}${listeUnites[j][0]}$<br>`
                : ''
              texteCorr += `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texFractionFromString(
                r * r * h,
                3,
              )}\\pi${listeUnites[j][1]}\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          } else {
            j = randint(2, 3) // pour le choix de l'unité
            r = randint(2, 10)
            h = randint(20, 150)
            volume = new Decimal(r * r * h).mul(Decimal.acos(-1)).div(3)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += `, arrondi au $${listeUnites[j][1]}$ près, ` // Il faut toujours arrondir à cause de la présence de Pi
            texte += `d'un cône de $${r}${listeUnites[j][0]}$ de rayon et de $${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}$ de hauteur.`
            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}=\\dfrac{1}{3}\\times\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}=${texFractionFromString(r * r * h, 3)}\\pi\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
          }
          resultat = volume.round()
          resultat2 = volume.mul(4).round()
          resultat3 = volume.div(2).round()
          resultat4 = volume.mul(2).round()
          break
        case 6: // pyramide à base carrée
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            c = partieDecimale2.plus(randint(2, 10))
            h = randint(2, 5)
            l = randint(6, 10)
            volume = c.mul(c).mul(h).div(3)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${h}${listeUnites[j][0]}$ et dont la base  est un carré de $${texNombre(c, 1)}${listeUnites[j][0]}$ de côté.`
            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\left(${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`
            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          } else {
            j = randint(1, 2) // pour le choix de l'unité
            c = partieDecimale2.plus(randint(2, 10))
            h = randint(30, 50)
            l = new Decimal(randint(5, 15)).div(10)
            volume = c.mul(c).mul(h).div(3)
            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}$ et dont la base  est un carré de $${texNombre(c, 1)}${listeUnites[j][0]}$  de côté.`
            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\left(${texNombre(c, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^2\\times${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}=\\dfrac{1}{3}\\times${texNombre(c.mul(c), 2)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}^2\\times${texNombre(h)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`
            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          }
          resultat = volume.round()
          resultat2 = volume.mul(3).round()
          resultat3 = volume.mul(3).div(4).round()
          resultat4 = volume.div(2).round()
          break
        case 9: // boule
          j = randint(0, 3) // pour le choix de l'unité
          r = randint(2, 10)
          volume = new Decimal(r).pow(3).mul(4).mul(Decimal.acos(-1)).div(3)
          texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
          texte += `, arrondi au $${listeUnites[j][1]}$ près,`
          texte += ` d'une boule de $${r}${listeUnites[j][0]}$ de rayon.`
          texteCorr = `$\\mathcal{V}=\\dfrac{4}{3} \\times \\pi \\times R^3=\\dfrac{4}{3}\\times\\pi\\times\\left(${r}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}\\right)^3=${texFractionFromString(4 * r * r * r, 3)}\\pi${listeUnites[j][1]}\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
          resultat = volume.round()
          resultat2 = volume.mul(3).round()
          resultat3 = volume.mul(3).div(4).round()
          resultat4 = volume.div(2).round()
          break
        // Ajout d'un nouveau cas (8) pour les pyramides à base triangulaire
        // À insérer dans le switch case après le cas 7 (boule)

        case 7: {
          // pyramide à base triangulaire rectangle
          let a, b
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            // Dimensions du triangle rectangle de base
            a = partieDecimale1.plus(randint(2, 10)) // premier côté de l'angle droit
            b = partieDecimale2.plus(randint(2, 10)) // deuxième côté de l'angle droit
            h = randint(2, 8) // hauteur de la pyramide

            // Calcul du volume : (1/3) × (aire de la base) × hauteur
            // Aire de la base triangulaire : (a × b) / 2
            volume = a.mul(b).mul(h).div(6) // (1/3) × (a×b/2) × h = (a×b×h)/6

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${h}${listeUnites[j][0]}$ et dont la base est un triangle rectangle dont les côtés de l'angle droit mesurent respectivement $${texNombre(a, 1)}${listeUnites[j][0]}$ et $${texNombre(b, 1)}${listeUnites[j][0]}$.`

            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\dfrac{${texNombre(a, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]} \\times ${texNombre(b, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`
            texteCorr += `=\\dfrac{${texNombre(a, 1)} \\times ${texNombre(b, 1)} \\times ${h}}{6}${listeUnites[j][1]}`

            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          } else {
            // avec conversion
            j = randint(1, 2) // pour le choix de l'unité
            a = partieDecimale1.plus(randint(2, 8)) // premier côté de l'angle droit
            b = partieDecimale2.plus(randint(2, 8)) // deuxième côté de l'angle droit
            h = randint(30, 50) // hauteur de la pyramide en unité inférieure

            volume = a.mul(b).mul(h).div(6) // (1/3) × (a×b/2) × h = (a×b×h)/6

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}$ et dont la base est un triangle rectangle de côtés $${texNombre(a, 1)}${listeUnites[j][0]}$ et $${texNombre(b, 1)}${listeUnites[j][0]}$.`

            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\dfrac{${texNombre(a, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]} \\times ${texNombre(b, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${texNombre(h / 10, 1)}${listeUnites[j - 1][0]}`
            texteCorr += `=\\dfrac{1}{3}\\times\\dfrac{${texNombre(a.mul(b), 2)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}^2}{2}\\times${texNombre(h)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`

            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          }

          resultat = volume.round()
          resultat2 = volume.mul(3).round() // erreur commune : oublier de diviser par 3
          resultat3 = a.mul(b).mul(h).div(3).round() // erreur commune : calculer le volume du prisme
          resultat4 = volume.div(2).round() // autre erreur possible
          break
        }
        case 8: // pyramide à base triangulaire quelconque
        default: {
          let coteBase
          let hauteurBase
          if (this.sup === 1) {
            // sans conversion
            j = randint(0, 3) // pour le choix de l'unité
            // Dimensions du triangle quelconque de base
            coteBase = partieDecimale1.plus(randint(3, 12)) // côté du triangle
            hauteurBase = partieDecimale2.plus(randint(2, 8)) // hauteur relative à ce côté
            h = randint(2, 8) // hauteur de la pyramide

            // Calcul du volume : (1/3) × (aire de la base) × hauteur
            // Aire de la base triangulaire : (côté × hauteur) / 2
            volume = coteBase.mul(hauteurBase).mul(h).div(6) // (1/3) × (côté×hauteur/2) × h = (côté×hauteur×h)/6

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${h}${listeUnites[j][0]}$ et dont la base est un triangle. La base du triangle mesure $${texNombre(coteBase, 1)}${listeUnites[j][0]}$ et la hauteur associée à cette base mesure $${texNombre(hauteurBase, 1)}${listeUnites[j][0]}$.`

            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\dfrac{${texNombre(coteBase, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]} \\times ${texNombre(hauteurBase, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${h}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`
            texteCorr += `=\\dfrac{${texNombre(coteBase, 1)} \\times ${texNombre(hauteurBase, 1)} \\times ${h}}{6}${listeUnites[j][1]}`

            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          } else {
            // avec conversion
            j = randint(1, 2) // pour le choix de l'unité
            coteBase = partieDecimale1.plus(randint(3, 12)) // côté du triangle
            hauteurBase = randint(30, 50) // hauteur relative à ce côté (en unité inférieure)
            h = new Decimal(randint(3, 15)).div(10) // hauteur de la pyramide (en unité supérieure)

            volume = coteBase.mul(hauteurBase).mul(h).div(6) // (1/3) × (côté×hauteur/2) × h = (côté×hauteur×h)/6

            texte += context.isAmc ? ` en$${listeUnites[j][1]}$` : ''
            texte += !volume.eq(volume.round())
              ? `, arrondi au $${listeUnites[j][1]}$ près,`
              : ''
            texte += ` d'une pyramide de hauteur $${texNombre(h, 1)}${listeUnites[j - 1][0]}$ et dont la base est un triangle. La base du triangle mesure $${texNombre(coteBase, 1)}${listeUnites[j][0]}$ et la hauteur associée à cette base mesure $${texNombre(hauteurBase)}${listeUnites[j + 1][0]}$.`

            texteCorr = `$\\mathcal{V}=\\dfrac{1}{3} \\times \\mathcal{B} \\times h=\\dfrac{1}{3}\\times\\dfrac{${texNombre(coteBase, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]} \\times ${texNombre(hauteurBase)}${listeUnites[j + 1][0]}}{2}\\times${texNombre(h, 1)}${listeUnites[j - 1][0]}`
            texteCorr += `=\\dfrac{1}{3}\\times\\dfrac{${texNombre(coteBase, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]} \\times ${texNombre(hauteurBase / 10, 1)}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}}{2}\\times${texNombre(h.mul(10))}${context.isAmc ? listeUnites[j][2] : listeUnites[j][0]}`

            if (volume.eq(volume.round())) {
              texteCorr += `=${miseEnEvidence(`${texNombre(volume)}${listeUnites[j][1]}`)}$`
            } else {
              texteCorr += `\\approx${miseEnEvidence(`${texNombre(volume.round())}${listeUnites[j][1]}`)}$`
            }
          }

          resultat = volume.round()
          resultat2 = volume.mul(3).round() // erreur commune : oublier de diviser par 3
          resultat3 = coteBase.mul(hauteurBase).mul(h).div(2).round() // erreur commune : calculer le volume du prisme
          resultat4 = volume.mul(2).round() // autre erreur possible
          break
        }
      }
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(Number(resultat))} ${listeUnites[j][1]}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(Number(resultat2))} ${listeUnites[j][1]}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(Number(resultat3))} ${listeUnites[j][1]}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(Number(resultat4))} ${listeUnites[j][1]}$`,
          statut: false,
        },
      ]
      resultat = resultat.toNumber()
      resultat2 = resultat2.toNumber()
      resultat3 = resultat3.toNumber()
      resultat4 = resultat4.toNumber()
      const props = propositionsQcm(this, i)
      if (this.interactif && this.sup3 !== 2) {
        texte += props.texte
      } else {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: new Grandeur(resultat, listeUnites[j][2]).toString(),
              options: { unite: true, precisionUnite: 0 },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.volume, {
          texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
        })
      }
      if (context.isAmc) {
        if (this.sup3 === 1) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'qcmMono',
                enonce: texte,
                propositions: [
                  {
                    texte: `$${texNombre(resultat)} ${listeUnites[j][1]}$`,
                    statut: true,
                  },
                  {
                    texte: `$${texNombre(resultat2)} ${listeUnites[j][1]}$`,
                    statut: false,
                  },
                  {
                    texte: `$${texNombre(resultat3)} ${listeUnites[j][1]}$`,
                    statut: false,
                  },
                  {
                    texte: `$${texNombre(resultat4)} ${listeUnites[j][1]}$`,
                    statut: false,
                  },
                ],
                options: {
                  ordered: false, // (si les réponses doivent rester dans l'ordre ci-dessus, false s'il faut les mélanger),
                },
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '\\\\Écrire le calcul:',
            enonceAvant: true,
            options: {
              multicols: true,
              barreseparation: false,
              multicolsAll: false,
              numerotationEnonce: true,
            },
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: texteCorr,
                    numQuestionVisible: false,
                    enonce: '',
                    statut: 6,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: '',
                      valeur: [resultat],
                      param: {
                        digits:
                          nombreDeChiffresDansLaPartieEntiere(resultat) +
                          randint(0, 2),
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      }
      if (
        this.questionJamaisPosee(i, resultat, resultat2, resultat3, resultat4)
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    if (this.sup === 1 && piApprox) {
      this.sup = 3
    }
  }
}
