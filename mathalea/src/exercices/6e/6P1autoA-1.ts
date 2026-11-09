import { arc } from '../../lib/2d/Arc'
import { cercleCentrePoint } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { traceBarre, traceGraphiqueCartesien } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { motifs } from '../../lib/2d/pattern'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { texcolors } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import type { SharedQcmProposition, Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire des données représentées dans un diagramme'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Lecture de diagrammes
 * @author Jean-Claude Lhote
 */
export const uuid = 'adac4'

export const refs = {
  'fr-fr': ['6P1autoA-1', '3AutoS03-1', 'BP1AUTO028', '6AutoS1-1'],
  'fr-2016': ['6S10-1'],
  'fr-ch': ['9R1FA2B-2', '9R2FA2B-2', '9R3FA2B-2', 'PRQPF01A-1'],
}

type ChampDiagramme = 'champ1' | 'champ2' | 'champ3'

export default class LireUnDiagramme extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'espèces différentes",
      3,
      '1 : Deux espèces\n2 : Trois espèces\n3 : Quatre espèces',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de diagramme',
      5,
      '1 : Diagramme circulaire\n2 : Diagramme semi-circulaire\n3 : Diagramme en barres\n4 : Diagramme cartésien\n5 : Au hasard',
    ]
    this.besoinFormulaire3Texte = [
      'Types de questions',
      "1 : L'espèce la moins nombreuse\n2 : L'espèce la plus nombreuse\n3 : La part de l'espèce la plus nombreuse",
    ]

    this.nbQuestions = 2
    this.sup = 3
    this.sup2 = 5
    this.sup3 = '1-2-3'
    this.spacing = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    if (this.sup2 < 5) {
      typesDeQuestionsDisponibles = [this.sup2]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }
    const listeHachuresDisponibles = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10]
    const listeMotifs = combinaisonListes(listeHachuresDisponibles, 4)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let listeSousQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      nbQuestions: 0,
      min: 1,
      max: 3,
      defaut: 0,
      melange: 0,
      shuffle: false,
      enleveDoublons: true,
    }).map((v) => Number(v) - 1)
    if (listeSousQuestions.length === 0) listeSousQuestions = [0, 1, 2]
    let N = 0
    let nom
    let nbAnimaux = 4 // nombre d'animaux différents dans l'énoncé
    let lstAnimauxExo: string[] // liste des animaux uniquement cités dans l'exercice
    let lstNombresAnimaux // liste des effectifs de chaque animal
    let lstVal: number[] = [] // liste des valeurs à éviter pour les effectifs

    let paramsEnonce, coef, r, lstElementGraph, g
    let reponse1, reponse2, nbMin, nbMax
    let objets
    const lstAnimaux = [
      'Girafes',
      'Zèbres',
      'Gnous',
      'Buffles',
      'Gazelles',
      'Crocodiles',
      'Rhinocéros',
      'Léopards',
      'Guépards',
      'Hyènes',
      'Lycaons',
      'Servals',
      'Phacochères',
    ]
    const lstNomParc = [
      'Dramve',
      'Fatenmin',
      'Batderfa',
      'Vihi',
      'Genser',
      'Barbetdou',
      'Dramrendu',
      'Secai',
      'Cipeudram',
      'Cigel',
      'Lisino',
      'Fohenlan',
      'Farnfoss',
      'Kinecardine',
      'Zeffari',
      'Barmwich',
      'Swadlincote',
      'Swordbreak',
      'Loshull',
      'Ruyron',
      'Fluasall',
      'Blueross',
      'Vlane',
    ]
    let A, B, T, angle, a, legende, textelegende, hachures, a0, t, alpha
    for (let q = 0, texte, texteCorr, texteAMC; q < this.nbQuestions;) {
      objets = []
      lstVal = []
      lstAnimauxExo = []
      lstNombresAnimaux = []
      this.autoCorrection[q] = {}

      texteAMC =
        'Dans le parc naturel de ' +
        choice(lstNomParc) +
        ", il y a beaucoup d'animaux.<br> Voici un diagramme qui représente les effectifs de quelques espèces.<br><br>"
      texteCorr = ''
      switch (this.sup) {
        case 1:
          nbAnimaux = 2
          break
        case 2:
          nbAnimaux = 3
          break
        case 3:
          nbAnimaux = 4
          break
        default:
          nbAnimaux = 4
      }
      for (let i = 0; i < nbAnimaux - 1; i++) {
        N = randint(5, 40, lstVal) // choisit un nombre entre 5 et 40 sauf dans les valeurs à éviter
        lstNombresAnimaux.push(N)
        lstVal = lstVal.concat([N - 2, N - 1, N, N + 1, N + 2]) // valeurs à supprimer pour éviter des valeurs proches
      }

      let effectiftotal
      // Le test ci-dessous permet de proposer (avec une fréquence de 1/3) des effectifs les nombreux > 50 %
      const choixMajoritaire = randint(0, 2)
      if (choixMajoritaire > 0) {
        N = randint(5, 40, lstVal) // choisit un nombre entre 5 et 40 sauf dans les valeurs à éviter
        lstNombresAnimaux.push(N)
      } else {
        effectiftotal = 0
        for (let i = 0; i < nbAnimaux - 1; i++) {
          effectiftotal += lstNombresAnimaux[i]
        }
        lstNombresAnimaux.push(Math.round(effectiftotal * 1.25))
      }

      effectiftotal = 0
      for (let i = 0; i < nbAnimaux; i++) {
        effectiftotal += lstNombresAnimaux[i]
      }
      for (let i = 0; i < nbAnimaux; i++) {
        nom = choice(lstAnimaux, lstAnimauxExo) // choisit un animal au hasard sauf parmi ceux déjà utilisés
        lstAnimauxExo.push(nom)
      }

      nbMin = Math.min(...lstNombresAnimaux)
      nbMax = Math.max(...lstNombresAnimaux)

      switch (listeTypeDeQuestions[q]) {
        case 1:
          A = pointAbstrait(0, 0)
          B = pointAbstrait(6, 0)
          T = pointAbstrait(7, 0)
          a0 = cercleCentrePoint(A, B, 'black')
          objets.push(a0)
          alpha = 90

          t = tracePoint(A)
          t.style = '+'
          objets.push(t)

          for (let i = 0; i < nbAnimaux; i++) {
            angle = (360 * lstNombresAnimaux[i]) / effectiftotal
            a = arc(
              rotation(B, A, alpha),
              A,
              angle,
              true,
              texcolors(i + 1),
              'black',
              0.7,
            )
            hachures = motifs(listeMotifs[i])
            a.hachures = hachures
            a.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i + 1))
            a.couleurDesHachures = a.couleurDeRemplissage
            objets.push(a)
            alpha += angle
            legende = carre(
              translation(T, vecteur(0, 1.5 * i)),
              translation(T, vecteur(1, 1.5 * i)),
              'black',
            )
            legende.couleurDeRemplissage = a.couleurDeRemplissage
            legende.couleurDesHachures = a.couleurDesHachures
            legende.hachures = hachures
            legende.opaciteDeRemplissage = 0.7
            textelegende = texteParPosition(
              lstAnimauxExo[i],
              8.5,
              i * 1.5 + 0.5,
              0,
              'black',
              1.5,
              'gauche',
              false,
            )
            objets.push(legende, textelegende)
            paramsEnonce = Object.assign(
              { pixelsParCm: 20, scale: 0.5, mainlevee: false },
              fixeBordures(objets),
            )
          }
          break
        case 2:
          A = pointAbstrait(0, 0)
          B = pointAbstrait(6, 0)
          T = pointAbstrait(7, 0)
          a0 = arc(B, A, 180, true, 'white', 'black')
          objets.push(a0)
          alpha = 0
          t = tracePoint(A)
          t.style = '+'
          objets.push(t)

          for (let i = 0; i < nbAnimaux; i++) {
            angle = (180 * lstNombresAnimaux[i]) / effectiftotal
            a = arc(
              rotation(B, A, alpha),
              A,
              angle,
              true,
              texcolors(i + 1),
              'black',
              0.7,
            )
            hachures = motifs(listeMotifs[i])
            a.hachures = hachures
            a.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i + 1))
            a.couleurDesHachures = a.couleurDeRemplissage
            objets.push(a)
            alpha += angle
            legende = carre(
              translation(T, vecteur(0, 1.5 * i)),
              translation(T, vecteur(1, 1.5 * i)),
              'black',
            )
            legende.couleurDeRemplissage = a.couleurDeRemplissage
            legende.couleurDesHachures = a.couleurDesHachures
            legende.hachures = hachures
            legende.opaciteDeRemplissage = 0.7
            textelegende = texteParPosition(
              lstAnimauxExo[i],
              8.5,
              i * 1.5 + 0.5,
              0,
              'black',
              1,
              'gauche',
              false,
            )
            objets.push(legende, textelegende)
            paramsEnonce = Object.assign(
              { pixelsParCm: 20, scale: 0.5, mainlevee: false },
              fixeBordures(objets),
            )
          }
          break
        case 3:
          coef = 1
          switch (this.sup2) {
            case 1:
              coef = 1
              break
            case 2:
              coef = 10
              break
          }
          r = repere({
            grilleX: false,
            grilleY: 'pointilles',
            xThickListe: false,
            xLabelListe: false,
            yUnite: 0.1 / coef,
            yThickDistance: 10 * coef,
            yMax: (Math.round(nbMax / 10) + 1) * 10 * coef,
            yLabelEcart: 0.75,
            xMin: 0,
            xMax: 10,
            yMin: 0,
            axeXStyle: '',
            yLegende: "Nombre d'individus",
          })

          lstElementGraph = []
          for (let i = 0; i < nbAnimaux; i++) {
            objets.push(
              traceBarre(
                ((r.xMax - r.xMin) / (nbAnimaux + 1)) * (i + 1),
                lstNombresAnimaux[i],
                lstAnimauxExo[i],
                {
                  unite: 0.1 / coef,
                  couleurDeRemplissage: texcolors(i + 1),
                  hachures: 'north east lines',
                },
              ),
            )
          }
          if (r.objets != null) objets.push(r.objets)
          paramsEnonce = Object.assign(
            { pixelsParCm: 20, scale: 0.5, mainlevee: false },
            fixeBordures(objets),
          )

          break

        case 4:
          coef = 1
          switch (this.sup2) {
            case 1:
              coef = 1
              break
            case 2:
              coef = 10
              break
          }
          r = repere({
            grilleX: false,
            grilleY: 'pointilles',
            xThickListe: false,
            xLabelListe: false,
            yUnite: 0.1 / coef,
            yThickDistance: 10 * coef,
            yMax: (Math.round(nbMax / 10) + 1) * 10 * coef,
            yLabelEcart: 0.75,
            xMin: 0,
            xMax: 10,
            yMin: 0,
            axeXStyle: '',
            yLegende: "Nombre d'individus",
          })

          lstElementGraph = []
          for (let i = 0; i < nbAnimaux; i++) {
            lstElementGraph.push([(i + 1) * 2, lstNombresAnimaux[i]])
            objets.push(
              texteParPosition(
                lstAnimauxExo[i],
                (i + 1) * 2,
                -0.2,
                66,
                'black',
                1,
                'gauche',
              ),
            )
            objets.push(segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1))
          }
          g = traceGraphiqueCartesien(lstElementGraph, r, {
            couleurDesPoints: 'red',
            couleurDuTrait: 'lightgray',
            styleDuTrait: '', // plein par défaut
            epaisseurDuTrait: 1,
            styleDesPoints: 'o', // croix par défaut
            tailleDesPoints: 3,
          })

          if (r.objets != null) objets.push(r.objets)
          objets.push(g)

          paramsEnonce = Object.assign(
            { pixelsParCm: 20, scale: 0.5, mainlevee: false },
            fixeBordures(objets),
          )

          break
      }
      reponse1 = lstAnimauxExo[lstNombresAnimaux.indexOf(nbMin)]
      reponse2 = lstAnimauxExo[lstNombresAnimaux.indexOf(nbMax)]
      texteAMC += mathalea2d(paramsEnonce, objets)
      texte = texteAMC // Le texteAMC commun avec le texte (en non AMC) s'arrête ici !

      // Construction des QCM valables en interactif ET en AMC
      const propositionsQcm1: SharedQcmProposition[] = []
      for (let i = 0; i < nbAnimaux; i++) {
        propositionsQcm1.push({
          texte: `${lstAnimauxExo[i]}`,
          statut: reponse1 === lstAnimauxExo[i],
        })
      }

      const propositionsQcm2: SharedQcmProposition[] = []
      for (let i = 0; i < nbAnimaux; i++) {
        propositionsQcm2.push({
          texte: `${lstAnimauxExo[i]}`,
          statut: reponse2 === lstAnimauxExo[i],
        })
      }

      const propositionsQcm3: SharedQcmProposition[] = []
      propositionsQcm3.push(
        {
          texte: 'Plus de la moitié des animaux',
          statut: nbMax > effectiftotal / 2,
        },
        {
          texte: 'Moins de la moitié des animaux',
          statut: nbMax < effectiftotal / 2,
        },
        {
          texte: 'La moitié des animaux',
          statut: nbMax === effectiftotal / 2,
        },
      )

      const propositionsParSousQuestion = [
        propositionsQcm1,
        propositionsQcm2,
        propositionsQcm3,
      ]
      const textesSousQuestions = [
        "Quelle est l'espèce la moins nombreuse ?<br>",
        "Quelle est l'espèce la plus nombreuse ?<br>",
        "L'espèce la plus nombreuse représente $\\ldots$<br>",
      ]
      const correctionsSousQuestions = [
        `L'espèce la moins nombreuse parmi ces espèces est : ${texteEnCouleurEtGras(reponse1)}.<br>`,
        `L'espèce la plus nombreuse parmi ces espèces est : ${texteEnCouleurEtGras(reponse2)}.<br>`,
        `L'espèce la plus nombreuse parmi ces espèces représente : ${texteEnCouleurEtGras(
          nbMax > effectiftotal / 2
            ? 'plus de la moitié des animaux'
            : nbMax < effectiftotal / 2
              ? 'moins de la moitié des animaux'
              : 'la moitié des animaux',
        )}.<br>`,
      ]
      const avecNumerotation = listeSousQuestions.length > 1
      const dataOptions: DataOptionsMultiMathfield = {}
      const reponsesInteractives: Valeur = {}
      const lignesQuestions = listeSousQuestions.map(
        (sousQuestion, indexQuestion) => {
          const field = `champ${indexQuestion + 1}` as ChampDiagramme
          const propositions = propositionsParSousQuestion[sousQuestion]
          const bonneReponse = propositions.find(
            (proposition) => proposition.statut,
          )?.texte
          dataOptions[field] = {
            qcm: propositions.map((proposition) => ({
              label: proposition.texte,
              value: proposition.texte,
            })),
            vertical: sousQuestion === 2,
          }
          reponsesInteractives[field] = { value: bonneReponse ?? '' }
          return `${avecNumerotation ? numAlpha(indexQuestion) : ''}${textesSousQuestions[sousQuestion]} %{${field}}`
        },
      )

      if (!context.isAmc) {
        texte += addMultiMathfield(this, q, {
          dataTemplate: lignesQuestions.join('\n'),
          dataOptions,
        })
        texteCorr = listeSousQuestions
          .map(
            (sousQuestion, indexQuestion) =>
              `${avecNumerotation ? numAlpha(indexQuestion) : ''}${correctionsSousQuestions[sousQuestion]}`,
          )
          .join('')
        handleAnswers(this, q, reponsesInteractives, {
          formatInteractif: 'multi-mathfield',
        })
      } else {
        // en AMC
        this.autoCorrectionAMC[q] = {}
        this.autoCorrectionAMC[q].enonce = ''
        this.autoCorrectionAMC[q].propositions = listeSousQuestions.map(
          (sousQuestion, indexQuestion) => {
            const questionAmc = {
              type: 'qcmMono',
              propositions: propositionsParSousQuestion[sousQuestion],
              enonce:
                (indexQuestion === 0 ? texteAMC : '') +
                (avecNumerotation ? numAlpha(indexQuestion) : '') +
                textesSousQuestions[sousQuestion],
            }
            return sousQuestion === 2
              ? { ...questionAmc, options: { lastChoice: 2 } }
              : questionAmc
          },
        )
        this.questionsAMC[q] = amcConvert(this.autoCorrectionAMC[q])
      }

      if (this.questionJamaisPosee(q, effectiftotal)) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
