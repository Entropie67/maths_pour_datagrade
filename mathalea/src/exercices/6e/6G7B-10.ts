import { codageAngle } from '../../lib/2d/angles'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { pointEstSur } from '../../lib/2d/utilitairesGeometriques'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { texcolors, texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { sameGeometricName, seq } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

const touchesClavier = [
  ['(', ')', '[', ']', '\\widehat{#0}'],
  [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
]
export const titre =
  'Appliquer les propriétés de conservation de la symétrie axiale'

export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '26/10/2020'
export const dateDeModifImportante = '27/06/2024' // EE : Rajout du paramètre du nombre de symétriques // interactivité ajouté par Jean-claude Lhote

/**
 * @author Jean-claude Lhote
 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'cd69a'

export const refs = {
  'fr-fr': ['6G7B-10'],
  'fr-2016': ['6G32-1'],
  'fr-ch': ['9R1ES4C-5', '9R2ES4C-5', '9R3ES4C-5', 'PRQES02D-8'],
}
export default class SymetrieAxialeConservation1 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Type d'axe :",
      5,
      '1 : Axe vertical\n2 : Axe horizontal\n3 : Axe oblique 1\n4 : Axe oblique 2\n5 : Axe aléatoire',
    ]
    this.besoinFormulaire3Numerique = ['Nombre de symétriques à trouver', 26]
    this.besoinFormulaire2CaseACocher = ["Avec des points de part et d'autre"]

    this.spacing = 2
    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = false
    this.sup3 = 4
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'Segment',
      'Droite',
      '1/2droite',
      'Triangle',
      'Angle',
    ]
    const points = []
    const traces = []
    const nom = []
    const alternance = this.sup2 === true ? 2 : 1
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      for (let ii = 0; ii < 25; ii++) nom.push(lettreDepuisChiffre(ii + 1))
      const noms = shuffle(nom)
      const listeTypeDeQuestions = combinaisonListes(
        typesDeQuestionsDisponibles,
        this.sup3,
      )
      texteCorr = `${texteGras("Dans la symétrie d'axe $(d)$, on observe :")}<br>`
      // On prépare la figure...
      let axe = this.sup
      let d
      let nonchoisi
      const coords: number[][] = []
      let x: number = 1
      let y: number = 1
      const objetsEnonce = []
      const objetsCorrection = []
      let nomd
      let labelPos
      if (axe === 5) axe = randint(1, 4) // choix de l'axe et des coordonnées
      switch (axe) {
        case 1:
          d = droite(1, 0, 0)
          nomd = texteParPosition('(d)', 0.3, 5.6)
          labelPos = 'above left'
          for (let ii = 0; ii < 12; ii++) {
            nonchoisi = false
            while (!nonchoisi) {
              // Le nouveau point est-il déjà dans la liste ?
              ;[x, y] = [randint(-5, 0), randint(-5, 5)]
              nonchoisi = true
              for (let j = 0; j < ii; j++) {
                if (coords[j][0] === x && coords[j][1] === y) nonchoisi = false
              }
            }
            coords.push([x, y]) // on stocke les 12 points
          }
          for (let j = 0; j < 12; j++)
            coords.push([-coords[j][0], coords[j][1]]) // on stocke les 12 images
          break
        case 2:
          d = droite(0, 1, 0)
          labelPos = 'above'
          nomd = texteParPosition('(d)', 5.6, 0.3)
          for (let ii = 0; ii < 12; ii++) {
            nonchoisi = false
            while (!nonchoisi) {
              // Le nouveau point est-il déjà dans la liste ?
              ;[x, y] = [randint(-5, 5), randint(-5, 0)]
              nonchoisi = true
              for (let j = 0; j < ii; j++) {
                if (coords[j][0] === x && coords[j][1] === y) nonchoisi = false
              }
            }
            coords.push([x, y]) // on stocke les 12 points
          }
          for (let j = 0; j < 12; j++)
            coords.push([coords[j][0], -coords[j][1]]) // on stocke les 12 images
          break
        case 3:
          d = droite(1, -1, 0)
          labelPos = 'above'
          nomd = texteParPosition('(d)', -5.8, -5.4)
          for (let ii = 0; ii < 12; ii++) {
            nonchoisi = false
            while (!nonchoisi) {
              // Le nouveau point est-il déjà dans la liste ?
              x = randint(-5, 5)
              y = randint(x, 5)
              nonchoisi = true
              for (let j = 0; j < ii; j++) {
                if (coords[j][0] === x && coords[j][1] === y) nonchoisi = false
              }
            }
            coords.push([x, y]) // on stocke les 12 points
          }
          for (let j = 0; j < 12; j++) coords.push([coords[j][1], coords[j][0]]) // on stocke les 12 images
          break
        case 4:
        default:
          d = droite(1, 1, 0)
          labelPos = 'above'
          nomd = texteParPosition('(d)', -5.8, 5.4)
          for (let ii = 0; ii < 12; ii++) {
            nonchoisi = false
            while (!nonchoisi) {
              // Le nouveau point est-il déjà dans la liste ? Si oui, on recommence.
              x = randint(-5, 5)
              y = randint(-5, -x)
              nonchoisi = true
              for (let j = 0; j < ii; j++) {
                if (coords[j][0] === x && coords[j][1] === y) {
                  nonchoisi = false
                }
              }
            }
            coords.push([x, y]) // on stocke les 12 points
          }
          for (let j = 0; j < 12; j++) {
            coords.push([-coords[j][1], -coords[j][0]])
          } // on stocke les 12 images
          break
      }
      for (let ii = 0; ii < 24; ii++) {
        if (ii < 12)
          points.push(
            pointAbstrait(coords[ii][0], coords[ii][1], noms[ii], labelPos),
          )
        else if (
          coords[ii][0] === coords[ii - 12][0] &&
          coords[ii][1] === coords[ii - 12][1]
        ) {
          points.push(
            pointAbstrait(
              coords[ii][0],
              coords[ii][1],
              noms[ii - 12],
              labelPos,
            ),
          )
          noms[ii] = noms[ii - 12]
        } else
          points.push(
            pointAbstrait(coords[ii][0], coords[ii][1], noms[ii], labelPos),
          )
        traces.push(tracePoint(points[ii]))
      }
      // On rédige les questions et les réponses

      const index = function (ii: number) {
        return (ii + 12 * (ii % alternance)) % 24
      }
      objetsEnonce.length = 0
      objetsCorrection.length = 0

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          propositions: [],
          options: { numerotationEnonce: true },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      texte =
        "Dans la symétrie d'axe $(d)$, répondre aux questions suivantes.<br>"
      for (let ii = 0, s1, s2, texteAMC, choix; ii < this.sup3;) {
        let reponse: string
        switch (listeTypeDeQuestions[ii]) {
          case 'Segment':
            choix = randint(0, 10) + randint(0, 1) * 12
            texteAMC =
              numAlpha(ii) +
              `Quel est le symétrique du segment $[${noms[index(choix)]}${noms[index(choix + 1)]}]$ ?`
            texteCorr +=
              numAlpha(ii) +
              `Le symétrique du segment $[${noms[index(choix)]}${noms[index(choix + 1)]}]$ est le segment $${miseEnEvidence(`[${noms[index(choix + 12)]}${noms[index(choix + 13)]}]`)}$.<br>`
            s1 = segment(
              points[index(choix)],
              points[index(choix + 1)],
              texcolors(ii * 3 + 2),
            )
            s2 = segment(
              points[index(choix + 12)],
              points[index(choix + 13)],
              texcolors(ii * 3 + 2),
            )
            s1.epaisseur = 2
            s2.epaisseur = 2
            objetsCorrection.push(s1, s2)
            reponse = `[${noms[index(choix + 12)]}${noms[index(choix + 13)]}]`
            break
          case 'Droite':
            choix = randint(0, 10) + randint(0, 1) * 12
            texteAMC =
              numAlpha(ii) +
              `Quel est le symétrique de la droite $(${noms[index(choix)]}${noms[index(choix + 1)]})$ ?`
            texteCorr +=
              numAlpha(ii) +
              `Le symétrique de la droite $(${noms[index(choix)]}${noms[index(choix + 1)]})$ est la droite $${miseEnEvidence(`(${noms[index(choix + 12)]}${noms[index(choix + 13)]})`)}$.<br>`
            objetsCorrection.push(
              droite(
                points[index(choix)],
                points[index(choix + 1)],
                '',
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              droite(
                points[index(choix + 12)],
                points[index(choix + 13)],
                '',
                texcolors(ii * 3 + 2),
              ),
            )
            reponse = `(${noms[index(choix + 12)]}${noms[index(choix + 13)]})`
            break
          case '1/2droite':
            choix = randint(0, 10) + randint(0, 1) * 12
            texteAMC =
              numAlpha(ii) +
              `Quel est le symétrique de la demi-droite $[${noms[index(choix)]}${noms[index(choix + 1)]})$ ?`
            texteCorr +=
              numAlpha(ii) +
              `Le symétrique de la demi-droite $[${noms[index(choix)]}${noms[index(choix + 1)]})$ est la demi-droite $${miseEnEvidence(`[${noms[index(choix + 12)]}${noms[index(choix + 13)]})`)}$.<br>`
            objetsCorrection.push(
              demiDroite(
                points[index(choix)],
                points[index(choix + 1)],
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              demiDroite(
                points[index(choix + 12)],
                points[index(choix + 13)],
                texcolors(ii * 3 + 2),
              ),
            )
            reponse = `[${noms[index(choix + 12)]}${noms[index(choix + 13)]})`
            break
          case 'Triangle':
            choix = randint(0, 9) + randint(0, 1) * 12
            while (
              pointEstSur(
                points[index(choix)],
                droite(points[index(choix + 1)], points[index(choix + 2)]),
              )
            ) {
              choix = randint(0, 9) + randint(0, 1) * 12
            }
            texteAMC =
              numAlpha(ii) +
              `Quel est le symétrique du triangle $${noms[index(choix)]}${noms[index(choix + 1)]}${noms[index(choix + 2)]}$ ?`
            texteCorr +=
              numAlpha(ii) +
              `Le symétrique du triangle $${noms[index(choix)]}${noms[index(choix + 1)]}${noms[index(choix + 2)]}$ est le triangle $${miseEnEvidence(`${noms[index(choix + 12)]}${noms[index(choix + 13)]}${noms[index(choix + 14)]}`)}$.<br>`
            objetsCorrection.push(
              polygone(
                [
                  points[index(choix)],
                  points[index(choix + 1)],
                  points[index(choix + 2)],
                ],
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              polygone(
                [
                  points[index(choix + 12)],
                  points[index(choix + 13)],
                  points[index(choix + 14)],
                ],
                texcolors(ii * 3 + 2),
              ),
            )
            reponse = `${noms[index(choix + 12)]}${noms[index(choix + 13)]}${noms[index(choix + 14)]}`
            break
          case 'Angle':
          default:
            choix = randint(0, 9) + randint(0, 1) * 12
            while (
              pointEstSur(
                points[index(choix)],
                droite(points[index(choix + 1)], points[index(choix + 2)]),
              )
            ) {
              choix = randint(0, 9) + randint(0, 1) * 12
            }
            texteAMC =
              numAlpha(ii) +
              `Quel est le symétrique de l'angle $\\widehat{${noms[index(choix)]}${noms[index(choix + 1)]}${noms[index(choix + 2)]}}$ ?`
            texteCorr +=
              numAlpha(ii) +
              `Le symétrique de l'angle $\\widehat{${noms[index(choix)]}${noms[index(choix + 1)]}${noms[index(choix + 2)]}}$ est l'angle $${miseEnEvidence(`\\widehat{${noms[index(choix + 12)]}${noms[index(choix + 13)]}${noms[index(choix + 14)]}}`)}$.<br>`
            objetsCorrection.push(
              codageAngle(
                points[index(choix)],
                points[index(choix + 1)],
                points[index(choix + 2)],
                2,
                '',
                texcolors(ii * 3 + 2),
                2,
                0.5,
                texcolors(ii * 3 + 2),
                0.2,
              ),
            )
            objetsCorrection.push(
              codageAngle(
                points[index(choix + 12)],
                points[index(choix + 13)],
                points[index(choix + 14)],
                2,
                '',
                texcolors(ii * 3 + 2),
                2,
                0.5,
                texcolors(ii * 3 + 2),
                0.2,
              ),
            )
            objetsCorrection.push(
              segment(
                points[index(choix)],
                points[index(choix + 1)],
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              segment(
                points[index(choix + 1)],
                points[index(choix + 2)],
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              segment(
                points[index(choix + 12)],
                points[index(choix + 13)],
                texcolors(ii * 3 + 2),
              ),
            )
            objetsCorrection.push(
              segment(
                points[index(choix + 13)],
                points[index(choix + 14)],
                texcolors(ii * 3 + 2),
              ),
            )
            reponse = `\\widehat{${noms[index(choix + 12)]}${noms[index(choix + 13)]}${noms[index(choix + 14)]}}`
            break
        }

        if (this.interactif) {
          texteAMC += ajouteChampTexteMathLive(
            this,
            i * this.sup3 + ii,
            KeyboardType.clavierEntierementPersonnalisable,
            { dataKeys: touchesClavier },
          )
          handleAnswers(this, i * this.sup3 + ii, {
            reponse: { value: reponse, compare: seq([sameGeometricName()]) },
          })
        }
        if (context.isAmc) {
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'AMCOpen',
            propositions: [
              {
                texte: ' ',
                numQuestionVisible: false,
                statut: 1, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                feedback: '',
                enonce: texteAMC, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
              },
            ],
          })
        }
        texte += texteAMC + '<br>'
        ii++
      }
      objetsEnonce.push(nomd, d)
      objetsCorrection.push(nomd, d)
      for (let ii = 0; ii < 24; ii++) {
        objetsEnonce.push(
          labelPoint(points[ii]),
          tracePoint(points[ii], bleuMathalea),
        )
        objetsCorrection.push(
          labelPoint(points[ii]),
          tracePoint(points[ii], bleuMathalea),
        )
      }
      const enonceAMC = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 1 },
          fixeBordures(objetsEnonce),
        ),
        objetsEnonce,
      )
      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce =
          "Pour chaque question ci-dessous, placer sur cette figure, l'objet mathématique cité puis tracer son symétrique. Répondre ensuite à la question.<br>" +
          enonceAMC +
          '<br>'
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].enonceAvant = false
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].enonceAvantUneFois = true
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      texte += enonceAMC
      texteCorr += mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 1 },
          fixeBordures(objetsCorrection),
        ),
        objetsCorrection,
      )
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
