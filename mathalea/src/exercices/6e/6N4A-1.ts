import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes, deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { jourAuHasard } from '../../lib/outils/dateEtHoraires'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range, rangeMinMax } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Modéliser des problèmes'
export const interactifReady = true

export const dateDePublication = '24/04/2021'
export const dateDeModifImportante = '26/04/2024'

/**
 * Associer huit (ou quatre) problèmes à huit (ou quatre) types de modélisation différents
 * Autre option : faire trouver ces types de modélisation sans proposition (fait par EE sur proposition d'Aude D.)
 * Autre option : faire trouver la méthode de résolution sans utiliser de schéma de modélisation (fait par EE)
 *                et en choisissant le nombre de problèmes (limité à 8 toutefois)
 * @author Mireille Gain, 24 avril 2021
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '4e89b'

export const refs = {
  'fr-fr': ['6N4A-1'],
  'fr-2016': ['6C35'],
  'fr-ch': ['9R1NO7F-6', '9R2NO7F-6', '9R3NO7F-6', 'PRQST02C-6'], // Primaire anciennement :['9NO3-9'],
}

/**
 * Renvoie un petit objet masculin au hasard
 * @author Mireille Gain
 */
export function objetM() {
  return choice([
    'stickers',
    'gâteaux',
    'cahiers',
    'livres',
    'stylos',
    'crayons',
  ])
}

/**
 * Renvoie un petit objet féminin au hasard
 * @author Mireille Gain
 */
export function objetF() {
  return choice([
    'boîtes',
    'bougies',
    'cartes de vœux',
    'gommes',
    'photos',
    'petites peluches',
  ])
}

/**
 * Renvoie un petit objet au hasard
 * @author Mireille Gain
 */
export function objet() {
  return choice([
    'billes',
    'bonbons',
    'bougies',
    'cartes de vœux',
    'crayons',
    'gâteaux',
    'gommes',
    'photos',
    'stickers',
    'cahiers',
  ])
}

export default class ModelisationProblemes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Valeurs différentes suivant les exercices\n2 : Valeurs identiques dans tous les exercices',
    ]
    this.besoinFormulaire2Numerique = [
      'Sélection de problèmes',
      4,
      '1 : 3 problèmes basés sur les mêmes nombres\n2 : 4 problèmes basés sur les mêmes nombres\n3 : 8 problèmes (par groupe de 4, avec distinction de 2 couleurs)\n4 : 8 problèmes mélangés (sans distinction de couleurs)',
    ]
    this.besoinFormulaire3Numerique = [
      'Variante avec les schémas',
      4,
      "1 : Sans schéma\n2 : Schémas dans la correction (non interactif)\n3 : Schémas dans l'énoncé et la correction",
    ]

    // un problème par schéma (8 par défaut), recalculé dans nouvelleVersion()
    this.nbQuestions = 8
    this.nbQuestionsModifiable = false
    this.sup = 2
    this.sup2 = 3
    this.sup3 = 3

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const presenceSchemas = this.sup3 === 3 && !context.isDiaporama
    // const nbSchemas = 8
    if (this.sup3 === 1) {
      this.consigne =
        "Trouver l'opération qui permet de résoudre le problème. Il n'est pas demandé d'effectuer le calcul."
    } else if (this.sup3 === 2) {
      this.consigne =
        "Déterminer un schéma à associer à chaque problème. Il n'est pas demandé de résoudre le problème."
    } else {
      this.consigne = 'Associer chaque problème avec sa modélisation.'
    }

    let colorA: string = 'black'
    let colorB: string = 'black'
    const schemas = []
    let brouilleLesCartes
    let typesDeQuestionsDisponibles
    let correctionSansSchema = ''
    let correctionSansSchemaLatex = ''
    switch (this.sup2) {
      case 1:
        // nbSchemas = 3
        typesDeQuestionsDisponibles = rangeMinMax(1, 4, [
          choice(rangeMinMax(1, 4)),
        ])
        colorA = 'black'
        brouilleLesCartes = shuffle(range(2))
        break
      case 2:
        // nbSchemas = 4
        typesDeQuestionsDisponibles = [5, 6, 7, 8]
        colorB = 'black'
        brouilleLesCartes = shuffle(range(3))
        break
      case 3:
        // nbSchemas = 8
        typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
        colorA = 'red'
        colorB = bleuMathalea
        brouilleLesCartes = shuffle(range(7))
        break
      case 4:
      default:
        // nbSchemas = 8
        typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
        colorA = 'black'
        colorB = 'black'
        brouilleLesCartes = shuffle(range(7))
        break
      /* default :
        nbSchemas = max(parseInt(nbSchemas), 1)
        typesDeQuestionsDisponibles = shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, nbSchemas)
        colorA = 'black'
        colorB = 'black'
        lettres = shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']).slice(0, this.nbQuestions)
        brouilleLesCartes = shuffle(range(this.nbQuestions - 1)) */
    }
    const listeTypeDeQuestions = shuffle(typesDeQuestionsDisponibles)
    this.nbQuestions = listeTypeDeQuestions.length
    const lettres = []
    lettres[brouilleLesCartes.indexOf(0)] = 'A'
    lettres[brouilleLesCartes.indexOf(1)] = 'B'
    lettres[brouilleLesCartes.indexOf(2)] = 'C'
    lettres[brouilleLesCartes.indexOf(3)] = 'D'
    lettres[brouilleLesCartes.indexOf(4)] = 'E'
    lettres[brouilleLesCartes.indexOf(5)] = 'F'
    lettres[brouilleLesCartes.indexOf(6)] = 'G'
    lettres[brouilleLesCartes.indexOf(7)] = 'H'
    const b1 = randint(15, 50)
    let c1 = randint(5, 9)
    const c3 = randint(5, 9)
    const d3 = c3 * randint(7, 13)
    let b5 = randint(15, 50)
    let c5 = randint(5, 9)
    let a7 = randint(9, 13)
    let b7 = randint(15, 50)
    if (this.sup === 2) {
      c1 = c3
      b5 = b1
      c5 = c1
      b7 = d3
      a7 = b1
    }
    let A1,
      A2,
      A3,
      A4,
      A5,
      A6,
      A7,
      A8,
      B1,
      B2,
      B3,
      B4,
      B5,
      B6,
      B7,
      B8,
      C1,
      C2,
      C3,
      C4,
      C5,
      C6,
      C7,
      C8,
      D1,
      D2,
      D3,
      D4,
      D5,
      D6,
      D7,
      D8,
      n1,
      n2,
      n3,
      n4,
      n5,
      n6,
      n7,
      n8,
      p1,
      traitHorizontal1,
      traitVertical1,
      tb1,
      th1,
      th12,
      p2,
      traitHorizontal2,
      traitVertical2,
      tb2,
      th2,
      th22,
      traitHorizontal22,
      traitVertical22,
      traitVertical23,
      th23,
      th24,
      th25,
      p3,
      traitHorizontal3,
      traitVertical3,
      tb3,
      th3,
      th32,
      p4,
      traitHorizontal4,
      traitVertical4,
      tb4,
      th4,
      th42,
      traitHorizontal42,
      traitVertical42,
      traitVertical43,
      th43,
      th44,
      th45,
      p5,
      traitHorizontal5,
      traitVertical5,
      tb5,
      th5,
      th52,
      traitHorizontal52,
      traitVertical52,
      traitVertical53,
      th53,
      th54,
      th55,
      p6,
      traitHorizontal6,
      traitVertical6,
      tb6,
      th6,
      th62,
      p7,
      traitHorizontal7,
      traitVertical7,
      tb7,
      th7,
      th72,
      traitHorizontal72,
      traitVertical72,
      traitVertical73,
      th73,
      th74,
      th75,
      p8,
      traitHorizontal8,
      traitVertical8,
      tb8,
      th8,
      th82

    for (
      let i = 0, o, colonne1, texteCorr;
      i < listeTypeDeQuestions.length;
      i++
    ) {
      colonne1 = ''
      texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `${prenomF()} avait $${b1}$ ${objetM()} ${jourAuHasard()}. `
              colonne1 += `<br>Le lendemain, elle en a trouvé $${c1}$ autres.`
              colonne1 += `<br>Combien cela lui en fait-il${sp()}?`
            } else {
              colonne1 += `${prenomM()} a $${c1}$ ans de moins que sa sœur ${prenomF()}.`
              colonne1 += `<br>Sachant qu'il a $${b1}$ ans, quel âge a sa sœur${sp()}?`
            }
            correctionSansSchema = `${b1}+${c1}`
            correctionSansSchemaLatex = `${b1} + ${c1}`
            A1 = pointAbstrait(0, 0)
            B1 = pointAbstrait(12, 0)
            C1 = pointAbstrait(12, 4)
            D1 = pointAbstrait(0, 4)
            p1 = polygone([A1, B1, C1, D1], colorA)
            p1.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal1 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitVertical1 = segment(pointAbstrait(6, 2), pointAbstrait(6, 4))
            tb1 = texteParPosition('?', 6, 1)
            th1 = texteParPosition(b1, 3, 3)
            th12 = texteParPosition(c1, 9, 3)
            n1 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p1,
              traitHorizontal1,
              traitVertical1,
              tb1,
              th1,
              th12,
              n1,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 2:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `${prenomM()} achète $${b1 * c1}$ ${objetM()} par paquets de $${b1}$.`
              colonne1 += `<br>Combien a-t-il acheté de paquets${sp()}?`
            } else {
              colonne1 += `${prenomM()} a besoin de $${b1 * c1}$ ${objetF()}.`
              colonne1 += `<br>Il en récupère $${b1}$ chaque jour.`
              colonne1 +=
                `<br>Au bout de combien de temps aura-t-il le nécessaire${sp()}?`
            }

            correctionSansSchema = `${b1 * c1}\\div${b1}`
            correctionSansSchemaLatex = `${b1 * c1} \\div ${b1}`
            A2 = pointAbstrait(0, 0)
            B2 = pointAbstrait(12, 0)
            C2 = pointAbstrait(12, 4)
            D2 = pointAbstrait(0, 4)
            p2 = polygone([A2, B2, C2, D2], colorA)
            p2.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal2 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitHorizontal22 = segment(
              pointAbstrait(0, 4.5),
              pointAbstrait(12, 4.5),
            )
            traitHorizontal22.styleExtremites = '<->'
            traitVertical2 = segment(pointAbstrait(2, 2), pointAbstrait(2, 4))
            traitVertical22 = segment(pointAbstrait(4, 2), pointAbstrait(4, 4))
            traitVertical23 = segment(
              pointAbstrait(10, 2),
              pointAbstrait(10, 4),
            )
            tb2 = texteParPosition(b1 * c1, 6, 1)
            th2 = texteParPosition(b1, 1, 3)
            th22 = texteParPosition(b1, 3, 3)
            th23 = texteParPosition('...', 7, 3)
            th24 = texteParPosition(b1, 11, 3)
            th25 = texteParPosition('?', 6, 5)
            n2 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p2,
              traitHorizontal2,
              traitVertical2,
              tb2,
              th2,
              th22,
              traitHorizontal22,
              traitVertical22,
              traitVertical23,
              th23,
              th24,
              th25,
              n2,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 3:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `${prenomF()} a $${b5}$ ans.`
              colonne1 += `<br>Sachant qu'elle a $${c5}$ ans de plus que son frère, quel âge a celui-ci${sp()}?`
            } else {
              colonne1 += `${prenomF()} a acheté $${b5}$ ${objetM()} pour les donner à ses amis.`
              colonne1 += `<br>Il lui en reste encore $${c5}$ à donner.`
              colonne1 += `<br>Combien en a-t-elle déjà distribué${sp()}?`
            }

            correctionSansSchema = `${b5}-${c5}`
            correctionSansSchemaLatex = `${b5} - ${c5}`
            A3 = pointAbstrait(0, 0)
            B3 = pointAbstrait(12, 0)
            C3 = pointAbstrait(12, 4)
            D3 = pointAbstrait(0, 4)
            p3 = polygone([A3, B3, C3, D3], colorA)
            p3.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal3 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitVertical3 = segment(pointAbstrait(6, 2), pointAbstrait(6, 4))
            tb3 = texteParPosition(b5, 6, 1)
            th3 = texteParPosition('?', 3, 3)
            th32 = texteParPosition(c5, 9, 3)
            n3 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p3,
              traitHorizontal3,
              traitVertical3,
              tb3,
              th3,
              th32,
              n3,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 4:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `${prenomF()} a acheté $${c5}$ ${objetM()} à $${b5}$ € pièce.`
              colonne1 += `<br>Combien a-t-elle payé${sp()}?`
            } else {
              colonne1 += `${prenomF()} récupère $${c5}$ paquets de $${b5}$ ${objetM()} chacun.`
              colonne1 += `<br>Combien en a-t-elle en tout${sp()}?`
            }

            correctionSansSchema = `${c5}\\times${b5}`
            correctionSansSchemaLatex = ` ${c5} \\times ${b5}`
            A4 = pointAbstrait(0, 0)
            B4 = pointAbstrait(12, 0)
            C4 = pointAbstrait(12, 4)
            D4 = pointAbstrait(0, 4)
            p4 = polygone([A4, B4, C4, D4], colorA)
            p4.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal4 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitHorizontal42 = segment(
              pointAbstrait(0, 4.5),
              pointAbstrait(12, 4.5),
            )
            traitHorizontal42.styleExtremites = '<->'
            traitVertical4 = segment(pointAbstrait(2, 2), pointAbstrait(2, 4))
            traitVertical42 = segment(pointAbstrait(4, 2), pointAbstrait(4, 4))
            traitVertical43 = segment(
              pointAbstrait(10, 2),
              pointAbstrait(10, 4),
            )
            tb4 = texteParPosition('?', 6, 1)
            th4 = texteParPosition(b5, 1, 3)
            th42 = texteParPosition(b5, 3, 3)
            th43 = texteParPosition('. . .', 7, 3)
            th44 = texteParPosition(b5, 11, 3)
            th45 = texteParPosition(c5, 6, 5)
            n4 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p4,
              traitHorizontal4,
              traitVertical4,
              tb4,
              th4,
              th42,
              traitHorizontal42,
              traitVertical42,
              traitVertical43,
              th43,
              th44,
              th45,
              n4,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 5:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `J'ai $${d3}$ ${objetF()} dans mon sac et je souhaite les partager avec mes $${c3 - 1}$ amis.`
              colonne1 += `<br>Quelle sera la part de chacun${sp()}?`
            } else {
              colonne1 += `$${c3}$ ${objetF()} identiques coûtent $${d3}$ €.`
              colonne1 += `<br>Quel est le prix d'une d'entre elles${sp()}?`
            }

            correctionSansSchema = `${d3}\\div${c3}`
            correctionSansSchemaLatex = `${d3} \\div ${c3}`
            A5 = pointAbstrait(0, 0)
            B5 = pointAbstrait(12, 0)
            C5 = pointAbstrait(12, 4)
            D5 = pointAbstrait(0, 4)
            p5 = polygone([A5, B5, C5, D5], colorB)
            p5.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal5 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitHorizontal52 = segment(
              pointAbstrait(0, 4.7),
              pointAbstrait(12, 4.7),
            )
            traitHorizontal52.styleExtremites = '<->'
            traitVertical5 = segment(pointAbstrait(2, 2), pointAbstrait(2, 4))
            traitVertical52 = segment(pointAbstrait(4, 2), pointAbstrait(4, 4))
            traitVertical53 = segment(
              pointAbstrait(10, 2),
              pointAbstrait(10, 4),
            )
            tb5 = texteParPosition(d3, 6, 1)
            th5 = texteParPosition('?', 1, 3)
            th52 = texteParPosition('?', 3, 3)
            th53 = texteParPosition('. . .', 7, 3)
            th54 = texteParPosition('?', 11, 3)
            th55 = texteParPosition(c3, 6, 5.2)
            n5 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p5,
              traitHorizontal5,
              traitVertical5,
              tb5,
              th5,
              th52,
              traitHorizontal52,
              traitVertical52,
              traitVertical53,
              th53,
              th54,
              th55,
              n5,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 6:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `${prenomF()} récupère $${b7}$ ${objet()} dans une salle, puis $${a7}$ dans une autre.`
              colonne1 += `<br>Combien en a-t-elle en tout${sp()}?`
            } else {
              colonne1 += `Un lot de ${objetM()} coûte $${b7}$ € et un lot de ${objetF()} coûte $${a7}$ €.`
              colonne1 += `<br>Combien coûte l'ensemble${sp()}?`
            }

            correctionSansSchema = `${a7}+${b7}`
            correctionSansSchemaLatex = `${b7} + ${a7}`
            A6 = pointAbstrait(0, 0)
            B6 = pointAbstrait(12, 0)
            C6 = pointAbstrait(12, 4)
            D6 = pointAbstrait(0, 4)
            p6 = polygone([A6, B6, C6, D6], colorB)
            p6.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal6 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitVertical6 = segment(pointAbstrait(6, 2), pointAbstrait(6, 4))
            tb6 = texteParPosition('?', 6, 1)
            th6 = texteParPosition(b7, 3, 3)
            th62 = texteParPosition(a7, 9, 3)
            n6 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p6,
              traitHorizontal6,
              traitVertical6,
              tb6,
              th6,
              th62,
              n6,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 7:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `J'ai $${d3}$ ${objetM()} dans mon sac et je dois les regrouper par $${c3}$.`
              colonne1 += `<br>Combien puis-je faire de tas${sp()}?`
            } else {
              colonne1 += `J'ai payé $${d3}$ € pour des ${objetM()} coûtant $${c3}$ € chacun.`
              colonne1 += `<br>Combien en ai-je acheté${sp()}?`
            }

            correctionSansSchema = `${d3}\\div${c3}`
            correctionSansSchemaLatex = `${d3} \\div ${c3}`
            A7 = pointAbstrait(0, 0)
            B7 = pointAbstrait(12, 0)
            C7 = pointAbstrait(12, 4)
            D7 = pointAbstrait(0, 4)
            p7 = polygone([A7, B7, C7, D7], colorB)
            p7.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal7 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitHorizontal72 = segment(
              pointAbstrait(0, 4.7),
              pointAbstrait(12, 4.7),
            )
            traitHorizontal72.styleExtremites = '<->'
            traitVertical7 = segment(pointAbstrait(2, 2), pointAbstrait(2, 4))
            traitVertical72 = segment(pointAbstrait(4, 2), pointAbstrait(4, 4))
            traitVertical73 = segment(
              pointAbstrait(10, 2),
              pointAbstrait(10, 4),
            )
            tb7 = texteParPosition(d3, 6, 1)
            th7 = texteParPosition(c3, 1, 3)
            th72 = texteParPosition(c3, 3, 3)
            th73 = texteParPosition('. . .', 7, 3)
            th74 = texteParPosition(c3, 11, 3)
            th75 = texteParPosition('?', 6, 5.2)
            n7 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p7,
              traitHorizontal7,
              traitVertical7,
              tb7,
              th7,
              th72,
              traitHorizontal72,
              traitVertical72,
              traitVertical73,
              th73,
              th74,
              th75,
              n7,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break

        case 8:
          {
            o = choice([1, 2])
            if (o === 1) {
              colonne1 += `Dans un sac, il y a $${a7}$ ${objetF()} et dans l'autre, il y en a $${b7}$.`
              colonne1 +=
                `<br>Combien y en a-t-il de plus dans ce deuxième sac${sp()}?`
            } else {
              colonne1 += `${prenomF()} a trouvé $${b7}$ ${objetF()} et ${prenomM()} en a trouvé $${a7}$.`
              colonne1 += `<br>Combien en a-t-il de moins qu'elle${sp()}?`
            }

            correctionSansSchema = `${b7}-${a7}`
            correctionSansSchemaLatex = `${b7} - ${a7}`
            A8 = pointAbstrait(0, 0)
            B8 = pointAbstrait(12, 0)
            C8 = pointAbstrait(12, 4)
            D8 = pointAbstrait(0, 4)
            p8 = polygone([A8, B8, C8, D8], colorB)
            p8.epaisseur = context.isHtml ? 3 : 2
            traitHorizontal8 = segment(
              pointAbstrait(0, 2),
              pointAbstrait(12, 2),
            )
            traitVertical8 = segment(pointAbstrait(6, 2), pointAbstrait(6, 4))
            tb8 = texteParPosition(b7, 6, 1)
            th8 = texteParPosition(a7, 3, 3)
            th82 = texteParPosition('?', 9, 3)
            n8 =
              this.sup3 === 2
                ? texteParPosition('', -1, 4)
                : texteParPosition(`${lettres[i]}.`, -1, 4)
            const objets = [
              p8,
              traitHorizontal8,
              traitVertical8,
              tb8,
              th8,
              th82,
              n8,
            ]
            schemas[brouilleLesCartes[i]] = mathalea2d(
              Object.assign({}, fixeBordures(objets), {
                ymin: -1,
                ymax: 6,
                display: 'inline' as const,
                pixelsParCm: 13,
                scale: 0.25,
              }),
              objets,
            )
          }
          break
      }
      if (this.correctionDetaillee) {
        texteCorr += colonne1 + '<br><br>'
      }
      if (listeTypeDeQuestions[i] === 5)
        texteCorr += `Puisque le partage se fait avec mes $${c3 - 1}$ amis, le partage se fait donc entre $${c3}$ personnes (mes $${c3 - 1}$ amis et moi). <br><br>`
      if (this.sup3 === 1) {
        handleAnswers(this, i, {
          reponse: {
            value: correctionSansSchema,
            options: { expressionNumerique: true },
          },
        })
        texteCorr += `L'opération qui peut résoudre le problème est${sp()}: `
        texteCorr += `$${miseEnEvidence(correctionSansSchemaLatex)}$`
        colonne1 += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBase,
          {
            texteAvant: sp(5) + `<br>Opération${sp()}:`,
          },
        )
      } else if (this.sup3 === 2) {
        texteCorr +=
          'Cet énoncé peut être associé avec le schéma ci-dessous.<br>' +
          schemas[brouilleLesCartes[i]]
        // la réponse est un schéma : pas de réponse courte
        this.listeReponsesCourtes[i] = null
      } else {
        texteCorr += `Cet énoncé est associé avec le schéma ${texteEnCouleurEtGras(lettres[i])}.`
        handleAnswers(this, i, {
          reponse: { value: lettres[i], options: { texteSansCasse: true } },
        })
        if (this.correctionDetaillee) {
          texteCorr += '<br>' + schemas[brouilleLesCartes[i]]
        }
        colonne1 += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.alphanumeric,
          {
            texteAvant: sp(5) + `<br>Schéma${sp()}:`,
          },
        )
      }
      this.listeQuestions.push(colonne1)
      this.listeCorrections.push(texteCorr)
    }

    const listeSchemas: string[][] = []
    listeSchemas[0] = []
    listeSchemas[1] = []
    listeSchemas[2] = []
    listeSchemas[3] = []
    if (this.sup3 === 3) {
      for (let j = 0; j < listeTypeDeQuestions.length; j++) {
        if (j % 4 < 2) {
          if (j % 2 === 0) {
            listeSchemas[0].push(schemas[j])
          } else {
            listeSchemas[1].push(schemas[j])
          }
        } else {
          if (j % 2 === 0) {
            listeSchemas[2].push(schemas[j])
          } else {
            listeSchemas[3].push(schemas[j])
          }
        }
      }
    }

    // On ne met pas les schéma en mode diaporama
    if (presenceSchemas) {
      this.introduction = `Les schémas à associer à chacun des énoncés sont${sp()}: ${context.isHtml ? '<br>' : '\\\\\n'}`
      // La grille HTML conserve les colonnes imbriquées dans l’export Typst.
      const colonnes = context.isHtml ? deuxColonnesResp : deuxColonnes
      this.introduction += colonnes(
        colonnes(
          listeSchemas[0].join(context.isHtml ? '<br>' : '\\\\\n'),
          listeSchemas[1].join(context.isHtml ? '<br>' : '\\\\\n'),
        ),
        colonnes(
          this.sup2 === 1
            ? context.isHtml
              ? '<br>'
              : ''
            : listeSchemas[2].join(context.isHtml ? '<br>' : '\\\\\n'),
          this.sup2 === 1
            ? listeSchemas[2].join(context.isHtml ? '<br>' : '\\\\\n')
            : listeSchemas[3].join(context.isHtml ? '<br>' : '\\\\\n'),
        ),
      )
    } else this.introduction = ''
  }
}
