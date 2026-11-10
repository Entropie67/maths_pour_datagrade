import { fixeBordures } from '../../lib/2d/fixeBordures'
import { point3d } from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Nommer des faces dans un pavé droit'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '06/11/2022'

/**
 * Nommer des faces dans un pavé droit
 * @author Éric Elter
 */

export const uuid = '6809f'

export const refs = {
  'fr-fr': ['CM2G5B-2', 'BP2G1'],
  'fr-2016': ['6G42-1', 'BP2G1'],
  'fr-ch': ['9R1ES3A-2', '9R2ES3A-2', '9R3ES3A-2', 'PRQES07A-2'],
}

/**
 * Inverse une chaîne de caractères
 * @param {string} str Chaîne à inverser
 * @author Éric Elter
 * @example inverseChaine('laval') renvoie 'laval' /// Hihihihi...
 * @example inverseChaine('parfait') renvoie 'tiafrap'
 * @example inverseChaine('1234') renvoie '4321'
 */
function inverseChaine(str: string): string {
  return str === '' ? '' : inverseChaine(str.slice(1)) + str.charAt(0)
}

function differentsNomsPossiblesDUneFace(
  face: string,
  nomSolide: string,
): string[] {
  let nouvelleFaceChiffree = ''
  let nouvelleFace = ''
  const tabChiffre: string[] = [face, inverseChaine(face)]
  const tab = []
  for (let i = 0; i < face.length - 1; i++) {
    nouvelleFaceChiffree = `${tabChiffre[2 * i].charAt(3)}${tabChiffre[2 * i].slice(0, 3)}`
    tabChiffre.push(nouvelleFaceChiffree, inverseChaine(nouvelleFaceChiffree))
  }
  for (let i = 0; i < tabChiffre.length; i++) {
    nouvelleFace = ''
    for (let j = 0; j < face.length; j++) {
      nouvelleFace += nomSolide[Number(tabChiffre[i][j])]
    }
    tab.push(nouvelleFace)
  }
  return tab
}
export default class LireFacePaveDroit extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Nombre de faces à trouver (entre 1 et 6)',
      6,
    ]
    this.besoinFormulaire2Texte = [
      'Faces à exclure du choix',
      'Nombres séparés par des tirets :\n1 : de devant\n2 : de derrière\n3 : de gauche\n4 : de droite\n5 : du dessus\n6 : du dessous\n7 : aucune à exclure',
    ]
    this.besoinFormulaire3Numerique = [
      "Type d'exercice interactif ou AMC",
      2,
      '1 : QCM\n2 : Numérique',
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de réponses dans le QCM (entre 2 et 6)',
      6,
    ]
    this.nbQuestions = 1
    this.sup = 3
    this.sup2 = 7
    this.sup3 = 1
    this.sup4 = 6
  }

  nouvelleVersion() {
    this.sup4 = contraindreValeur(2, 6, this.sup4, 6)

    const typesDeQuestionsIndisponibles = gestionnaireFormulaireTexte({
      max: 6,
      defaut: randint(1, 6),
      nbQuestions: this.nbQuestions,
      shuffle: false,
      saisie: this.sup2,
      enleveDoublons: true,
      melange: 0,
    }).map(Number)

    function comparerNombres(a: number, b: number): number {
      return a - b
    }

    typesDeQuestionsIndisponibles.sort(comparerNombres)
    let choixFace = rangeMinMax(0, 5)
    for (let i = typesDeQuestionsIndisponibles.length - 1; i >= 0; i--) {
      choixFace.splice(typesDeQuestionsIndisponibles[i], 1)
    }
    choixFace = combinaisonListes(choixFace, choixFace.length)
    let indiceQuestion

    for (
      let i = 0,
        texte,
        texteCorr,
        objetsEnonce,
        A,
        B,
        D,
        E,
        solideDessine,
        nomSolide,
        enonceAMC,
        enonceFigure,
        L,
        p,
        choixProfondeur,
        facesPossibles,
        h,
        resultatsPossibles,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      objetsEnonce = []
      let resultatsImpossibles = []
      context.anglePerspective = choice([-30, -60, 30, 60])

      L = randint(5, 20)
      h = randint(5, 20, [L])
      p = randint(5, 20, [L, h])
      A = point3d(0, 0, 0)
      B = point3d(L, 0, 0)
      D = point3d(0, 0, h)
      choixProfondeur = choice([p, -p])
      E = point3d(0, choixProfondeur, 0)

      nomSolide = choisitLettresDifferentes(8, 'OQWXD').join('')
      solideDessine = pave3d(A, B, D, E, bleuMathalea, true, nomSolide)
      objetsEnonce.push(...solideDessine.c2d)
      // enonceFigure = (context.isAmc ? '' : '<br>') + mathalea2d(Object.assign({}, fixeBordures(objetsEnonce), { scale: context.isHtml ? 0.7 : 0.2, style: 'block' }), objetsEnonce) + '<br>'
      enonceFigure =
        mathalea2d(
          Object.assign({}, fixeBordures(objetsEnonce), {
            scale: context.isHtml ? 0.7 : 0.3,
            display: 'block' as const,
          }),
          objetsEnonce,
        ) + '<br>'
      texte += enonceFigure
      facesPossibles = [
        ['de devant', '0123'],
        ['de derrière', '4567'],
        ['de gauche', '0374'],
        ['de droite', '1265'],
        ['du dessus', '2376'],
        ['du dessous', '0154'],
      ]

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: enonceFigure,
          enonceCentre: false,
          options: {
            ordered: false,
          },
          propositions: [],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      for (let ee = 0; ee < Math.min(choixFace.length, this.sup); ee++) {
        indiceQuestion = i * Math.min(choixFace.length, this.sup) + ee

        enonceAMC =
          this.sup === 1
            ? ''
            : (ee === 0 || context.isAmc ? '' : '<br>') + numAlpha(ee)

        enonceAMC += `Comment peut se nommer la face ${facesPossibles[choixFace[ee]][0]} du pavé droit ${nomSolide} ?`
        texte += enonceAMC
        resultatsPossibles = combinaisonListes(
          differentsNomsPossiblesDUneFace(
            facesPossibles[choixFace[ee]][1],
            nomSolide,
          ),
        )
        texteCorr += this.sup === 1 ? '' : numAlpha(ee)
        texteCorr += `La face ${facesPossibles[choixFace[ee]][0]} du pavé droit ${nomSolide} peut se nommer ${texteEnCouleurEtGras(resultatsPossibles[0])} mais aussi `
        for (let j = 1; j < resultatsPossibles.length - 2; j++)
          texteCorr += `${resultatsPossibles[j]}, `
        texteCorr += `${resultatsPossibles[resultatsPossibles.length - 2]} ou ${resultatsPossibles[resultatsPossibles.length - 1]}.<br>`

        if (this.sup3 !== 2 || context.isAmc) {
          resultatsImpossibles = []
          for (let j = 0; j < 6; j++) {
            if (j !== choixFace[ee]) {
              resultatsImpossibles.push(
                combinaisonListes(
                  differentsNomsPossiblesDUneFace(
                    facesPossibles[j][1],
                    nomSolide,
                  ),
                )[0],
              )
            }
          }
        }
        this.autoCorrection[indiceQuestion] = {}
        if (this.sup3 !== 2) {
          this.autoCorrection[indiceQuestion].enonce = `${texte}\n`
          this.autoCorrection[indiceQuestion].propositions = [
            {
              texte: `${resultatsPossibles[0]}`,
              statut: true,
            },
          ]
          for (
            let j = 0;
            j < Math.min(resultatsImpossibles.length, this.sup4 - 1);
            j++
          ) {
            const props = this.autoCorrection[indiceQuestion].propositions
            if (props) {
              props.push({
                texte: `${resultatsImpossibles[j]}`,
                statut: false,
              })
            }
          }

          this.autoCorrection[indiceQuestion].options = {}
          texte += propositionsQcm(this, indiceQuestion).texte
        } else {
          handleAnswers(this, indiceQuestion, {
            reponse: {
              value: resultatsPossibles.map(String),
              options: { texteAvecCasse: true },
            },
          })
          texte +=
            ajouteChampTexteMathLive(
              this,
              indiceQuestion,
              KeyboardType.alphanumeric,
            ) + '<br>'
        }
        if (context.isAmc) {
          this.autoCorrectionAMC[i].propositions!.push({
            type: 'qcmMono',
            enonce: enonceAMC,
            propositions: [
              {
                texte: `${resultatsPossibles[0]}`,
                statut: true,
              },
            ],
          })
          for (
            let j = 0;
            j < Math.min(resultatsImpossibles.length, this.sup4 - 1);
            j++
          ) {
            const props = this.autoCorrectionAMC[i].propositions
            if (props) {
              const props2 = props[ee].propositions
              props2!.push({
                texte: `${resultatsImpossibles[j]}`,
                statut: false,
              })
            }
          }
        }
      }

      if (this.questionJamaisPosee(i, nomSolide)) {
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
