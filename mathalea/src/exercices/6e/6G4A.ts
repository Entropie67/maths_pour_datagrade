import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { codageAngle } from '../../lib/2d/angles'
import { droite } from '../../lib/2d/droites'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionDD,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { couleurTab } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, numAlpha, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Nommer un angle'

export const interactifReady = true
export const amcType = 'AMCHybride'
export const amcReady = true

export const dateDePublication = '13/04/2022'
export const dateDeModifImportante = '27/03/2024'

/**
 * Nommer un angle
 * @author Éric Elter
 */
export const uuid = 'e10d1'

export const refs = {
  'fr-fr': ['6G4A'],
  'fr-2016': ['6G22'],
  'fr-ch': ['9R1ES1C-1', '9R2ES1C-1', '9R3ES1C-1', 'PRQES01B-3'],
}
export default class NommerUnAngle extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'angles à trouver (entre 1 et 3) :",
      3,
    ]
    if (context.isHtml)
      this.besoinFormulaire2Numerique = [
        'Exercice interactif',
        2,
        '1 : QCM\n2 : Texte',
      ]
    this.besoinFormulaire3CaseACocher = ['Figure en noir et blanc']
    this.nbQuestions = 2
    this.sup = 2
    this.sup2 = 1
    this.sup3 = false
  }

  nouvelleVersion() {
    let propositionsDuQcm = []
    for (
      let i = 0,
        texteAMC,
        troisBonnesReponses,
        resultatOK1,
        resultatOK2,
        resultat3,
        resultatPasOK1,
        resultatPasOK2,
        choixAngle,
        pt1,
        pt2,
        pt3,
        tailleAngle,
        aleaChoixCouleurRemplissage,
        couleurRemplissageAngle,
        couleurAngle,
        segmentsCorrection,
        resultat;
      i < this.nbQuestions;
      i++
    ) {
      const propositionsAMC = []
      let listePt1: PointAbstrait[] = []
      let listePt3: PointAbstrait[] = []
      // let figureExo
      // On prépare la figure...
      const marquageAngle = this.sup3
        ? combinaisonListes(['X', 'OO', '|||'], 3)
        : ['', '', '']

      const ChoixHorizontal = choice([-1, 1])

      const numB = randint(1, 26, [4, 5, 15, 23, 24, 25])
      const numA = randint(1, 26, [4, 5, 15, 23, 24, 25, numB])
      const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numA])
      const numM = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numA, numC])
      const numN = randint(1, 26, [
        4,
        5,
        15,
        23,
        24,
        25,
        numB,
        numA,
        numC,
        numM,
      ])
      const numI = randint(1, 26, [
        4,
        5,
        15,
        23,
        24,
        25,
        numB,
        numA,
        numC,
        numM,
        numN,
      ])

      /* A décommenter pour débugguer (et commenter les 6 lignes du dessus)
            const numA = 1
            const numB = 2
            const numC = 3
            const numI = 9
            const numM = 13
            const numN = 14
            */

      const ordB = randint(0, 2)
      const B = pointAbstrait(0, ordB, lettreDepuisChiffre(numB))

      const absA = ChoixHorizontal * randint(7, 12)
      const ordA = randint(4, 8)
      const A = pointAbstrait(absA, ordA, lettreDepuisChiffre(numA))

      const absC = ChoixHorizontal * randint(7, 12, [absA])
      const ordC = -1 * randint(2, 5)
      const C = pointAbstrait(absC, ordC, lettreDepuisChiffre(numC))
      const fractionSegmentAB = this.sup === 1 ? randint(2, 8) : randint(4, 6)
      const fractionSegmentBC =
        this.sup === 1
          ? randint(2, 8, [fractionSegmentAB])
          : randint(4, 6, [fractionSegmentAB])
      const AB = segment(A, B).longueur
      const BC = segment(B, C).longueur
      const M = pointSurSegment(
        B,
        A,
        (AB * fractionSegmentAB) / 10,
        lettreDepuisChiffre(numM),
      )
      const N = pointSurSegment(
        B,
        C,
        (BC * fractionSegmentBC) / 10,
        lettreDepuisChiffre(numN),
        'below',
      )
      const p1 = polygoneAvecNom(B, A, C)
      const I = pointIntersectionDD(
        droite(A, N),
        droite(C, M),
        lettreDepuisChiffre(numI),
        'left',
      )
      const listePoints = [numA, numB, numC, numM, numN, numI]
      const objetsEnonce = []
      const objetsCorrection = []
      const sommetsDejaTrouves: number[] = []
      const choixCouleurRemplissage = rangeMinMax(0, 7)
      //  couleurRemplissageAngle = ['none'] // Correction J-C : on définira ces couleurs en testant this.sup3
      // couleurAngle = 'black'
      let texte = ''
      const O = pointAbstrait(0, 0) // Sert à construire les symboles pour les questions
      const M1 = pointAbstrait(4, 0) // Sert à construire les symboles pour les questions
      let texteCorr = ''
      let positionIbis = ChoixHorizontal === -1 ? 'right' : 'left'
      const Ibis = pointAbstrait(
        I.x,
        I.y,
        lettreDepuisChiffre(numI),
        positionIbis,
      )

      for (let jj = 0, marquageAngleConsigne; jj < this.sup; jj++) {
        marquageAngleConsigne = []
        const choixSommet: number = choice(listePoints, sommetsDejaTrouves)
        if (!this.sup3) {
          aleaChoixCouleurRemplissage = choice(choixCouleurRemplissage)
          couleurRemplissageAngle = couleurTab(aleaChoixCouleurRemplissage)
          couleurAngle = couleurRemplissageAngle[0]
          enleveElement(choixCouleurRemplissage, aleaChoixCouleurRemplissage)
        } else {
          couleurRemplissageAngle = ['none']
          couleurAngle = 'black'
        }
        sommetsDejaTrouves[jj] = choixSommet
        switch (choixSommet) {
          case numA: // Si le sommet est A, alors il y a 3 choix possibles d'angles
            pt2 = A
            tailleAngle =
              (Math.min(
                segment(pt2, M).longueur,
                segment(pt2, N).longueur,
                segment(pt2, I).longueur,
                4,
              ) /
                2) *
              0.9
            choixAngle = 1
            switch (choixAngle) {
              case 1:
                listePt1 = [B, M]
                listePt3 = [N, I]
                break
              case 2:
                listePt1 = [C]
                listePt3 = [N, I]
                break
              case 3:
                listePt3 = [B, M]
                listePt1 = [C]
                break
            }
            break
          case numC: // Si le sommet est C, alors il y a 3 choix possibles d'angles
            pt2 = C
            choixAngle = randint(1, 3)
            tailleAngle =
              (Math.min(
                segment(pt2, M).longueur,
                segment(pt2, N).longueur,
                segment(pt2, I).longueur,
                4,
              ) /
                2) *
              0.9
            switch (choixAngle) {
              case 1:
                listePt1 = [B, N]
                listePt3 = [M, I]
                break
              case 2:
                listePt3 = [M, I]
                listePt1 = [A]
                break
              case 3:
                listePt3 = [B, N]
                listePt1 = [A]
                break
            }
            break
          case numB:
            pt2 = B
            tailleAngle =
              (Math.min(
                segment(pt2, M).longueur,
                segment(pt2, N).longueur,
                segment(pt2, I).longueur,
                4,
              ) /
                2) *
              0.9
            listePt1 = [C, N]
            listePt3 = [A, M]
            break
          case numM: // Si le sommet est M, alors il y a 2 choix possibles d'angles
            pt2 = M
            tailleAngle =
              (Math.min(
                segment(pt2, A).longueur,
                segment(pt2, C).longueur,
                segment(pt2, I).longueur,
                4,
              ) /
                2) *
              0.9
            listePt1 = [C, I]
            listePt3 = [randint(1, 2) === 1 ? A : B]
            positionIbis = ChoixHorizontal === -1 ? 'left' : 'right'
            break
          case numN: // Si le sommet est N, alors il y a 2 choix possibles d'angles
            pt2 = N
            tailleAngle =
              (Math.min(
                segment(pt2, A).longueur,
                segment(pt2, C).longueur,
                segment(pt2, I).longueur,
                4,
              ) /
                2) *
              0.9
            listePt1 = [A, I]
            listePt3 = [randint(1, 2) === 1 ? C : B]
            break
          case numI:
          default:
            pt2 = I
            choixAngle = randint(1, 4)
            switch (choixAngle) {
              case 1:
                listePt1 = [M]
                listePt3 = [A]
                break
              case 2:
                listePt1 = [C]
                listePt3 = [A]
                positionIbis = ChoixHorizontal === -1 ? 'right' : 'left'
                break
              case 3:
                listePt1 = [N]
                listePt3 = [C]
                break
              case 4:
              default:
                listePt1 = [N]
                listePt3 = [M]
                positionIbis = ChoixHorizontal === -1 ? 'left' : 'right'
                break
            }
            tailleAngle =
              (Math.min(
                segment(pt2, listePt1[0]).longueur,
                segment(pt2, listePt3[0]).longueur,
                4,
              ) /
                2) *
              0.9
        }

        pt1 = choice(listePt1) // Une fois la possibilité d'angle choisie, il y a deux points possibles.
        pt3 = choice(listePt3)
        segmentsCorrection = polyline(
          [listePt1[0], pt2, listePt3[0]],
          this.sup3 ? 'black' : couleurRemplissageAngle[0],
        )
        resultat = []
        for (const item1 in listePt1) {
          for (const item3 in listePt3) {
            resultat.push(
              `\\widehat{${listePt1[item1].nom}${pt2.nom}${listePt3[item3].nom}}`,
            )
            resultat.push(
              `\\widehat{${listePt3[item3].nom}${pt2.nom}${listePt1[item1].nom}}`,
            )
          }
        }
        // Les 5 résultats suivants sont pour le QCM
        // 2 résultats corrects, 2 résultats faux et un 5e résultat faux ou vrai, selon l'exercice.
        resultatOK1 = choice(resultat)
        resultatOK2 = choice(resultat, [resultatOK1])
        resultatPasOK1 = `\\widehat{${pt2.nom}${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}}`
        resultatPasOK2 = `\\widehat{${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}${pt2.nom}}`
        troisBonnesReponses = false
        if (choixSommet === numI) {
          // Si I est le sommet, que deux bonnes réponses.
          resultat3 = choice([
            `\\widehat{${listePt3[0].nom}${listePt1[0].nom}${pt2.nom}}`,
            `\\widehat{${pt2.nom}${listePt3[0].nom}${listePt1[0].nom}}`,
          ])
        } else {
          troisBonnesReponses = choice([true, false])
          if (troisBonnesReponses) {
            // Une 3e réponse vraie
            resultat3 = choice(resultat, [resultatOK1, resultatOK2])
          } else if (choice([true, false])) {
            // Une 3e réponse fausse
            resultat3 = `\\widehat{${pt2.nom}${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}}`
            while (resultat3 === resultatPasOK1)
              resultat3 = `\\widehat{${pt2.nom}${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}}`
          } else {
            resultat3 = `\\widehat{${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}${pt2.nom}}`
            while (resultat3 === resultatPasOK2)
              resultat3 = `\\widehat{${listePt1[randint(0, listePt1.length - 1)].nom}${listePt3[randint(0, listePt3.length - 1)].nom}${pt2.nom}}`
          }
        }
        segmentsCorrection.epaisseur = 3
        const ang = angleOriente(pt1, pt2, pt3)

        objetsEnonce.push(
          codageAngle(
            pt1,
            pt2,
            ang,
            tailleAngle,
            marquageAngle[jj],
            couleurAngle,
            2,
            1,
            couleurRemplissageAngle[0],
            1,
            false,
            true,
          ),
        )
        if (
          (this.interactif || context.isAmc) &&
          this.sup2 !== 2
        ) {
          texteAMC = 'Choisir tous les angles qui peuvent nommer'
        } else {
          texteAMC = 'Comment peut-on nommer'
        }
        texteAMC += " l'angle "
        marquageAngleConsigne.push(codageAngle(M1, O, 79, 1, marquageAngle[jj]))
        texteAMC += this.sup3
          ? 'marqué par le symbole' +
            mathalea2d(
              {
                xmin: 0,
                ymin: 0,
                xmax: 1.2,
                ymax: 1.2,
                pixelsParCm: 20,
                scale: 0.5,
                display: 'inline-block',
              },
              marquageAngleConsigne,
            )
          : `${couleurRemplissageAngle[1]}`
        texteAMC +=
          (this.interactif || context.isAmc) && this.sup2 !== 2
            ? '.'
            : `${sp()}?`
        texte += this.sup > 1 ? `${jj === 0 ? '' : '<br>'}${numAlpha(jj)}` : ''
        texte += texteAMC
        if (this.interactif && this.sup2 === 2) {
          texte += ajouteChampTexteMathLive(
            this,
            i * this.sup + jj,
            KeyboardType.angles,
          )
        }
        handleAnswers(this, i * this.sup + jj, {
          reponse: {
            value: resultat,
            options: { texteAvecCasse: true },
          },
        })
        objetsCorrection.push(
          codageAngle(
            pt1,
            pt2,
            ang,
            tailleAngle,
            marquageAngle[jj],
            couleurAngle,
            2,
            1,
            couleurRemplissageAngle[0],
            1,
            false,
            true,
          ),
          segmentsCorrection,
        )
        texteCorr +=
          this.sup > 1 ? `${jj === 0 ? '' : '<br>'}${numAlpha(jj)}` : ''
        texteCorr += "L'angle "
        texteCorr += this.sup3
          ? 'marqué par le symbole' +
            mathalea2d(
              {
                xmin: 0,
                ymin: 0,
                xmax: 1.2,
                ymax: 1.2,
                pixelsParCm: 20,
                scale: 0.5,
                display: 'inline-block',
              },
              marquageAngleConsigne,
            )
          : `${couleurRemplissageAngle[1]}`
        texteCorr += ` se nomme, au choix : $${this.sup3 ? miseEnEvidence(resultat[0], 'black') : miseEnEvidence(resultat[0], couleurRemplissageAngle[0])}$`
        for (let ee = 1; ee < resultat.length; ee++) {
          texteCorr += `, $${this.sup3 ? miseEnEvidence(resultat[ee], 'black') : miseEnEvidence(resultat[ee], couleurRemplissageAngle[0])}$`
        }
        texteCorr += '.'
        propositionsDuQcm = [
          {
            texte: `$${resultatOK1}$`,
            statut: true,
          },
          {
            texte: `$${resultatOK2}$`,
            statut: true,
          },
          {
            texte: `$${resultat3}$`,
            statut: troisBonnesReponses,
          },
          {
            texte: `$${resultatPasOK1}$`,
            statut: false,
          },
          {
            texte: `$${resultatPasOK2}$`,
            statut: false,
          },
        ]
        if (this.sup2 !== 2) {
          this.autoCorrection[i * this.sup + jj].enonce = `${texte}\n`
          this.autoCorrection[i * this.sup + jj].propositions =
            propositionsDuQcm
          this.autoCorrection[i * this.sup + jj].options = {}
          const props = propositionsQcm(this, i * this.sup + jj)
          if (this.interactif) texte += props.texte
        }
        if (context.isAmc) {
          propositionsAMC[jj] = {
            type: 'qcmMult', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
            enonce: texteAMC,
            propositions: propositionsDuQcm,
          }
        }
      }
      const params = {
        xmin: Math.min(0, absA, absC) - 1,
        ymin: ordC - 1,
        xmax: Math.max(0, absA, absC) + 1,
        ymax: ordA + 1,
        pixelsParCm: 20,
        scale: 0.5,
      }
      objetsEnonce.push(
        p1[0],
        p1[1],
        segment(A, N),
        segment(C, M),
        labelPoint(M, N, Ibis),
      )
      objetsCorrection.push(
        p1[0],
        p1[1],
        segment(A, N),
        segment(C, M),
        labelPoint(M, N, Ibis),
      )
      const figureExo = mathalea2d(params, objetsEnonce)
      texte += '<br>' + figureExo
      texteCorr += '<br>' + mathalea2d(params, objetsCorrection)
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: figureExo,
          enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
          melange: true, // EE : ce champ est facultatif et permet (si false) de ne pas provoquer le mélange des questions.
          options: { avecSymboleMult: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) des propositions : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
          propositions: propositionsAMC,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      listeQuestionsToContenu(this)
    }
  }
}
