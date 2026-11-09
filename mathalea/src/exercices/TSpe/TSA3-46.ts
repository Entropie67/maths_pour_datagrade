import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Reconnaître les courbes d'une fonction et de ses dérivées"
export const dateDePublication = '26/08/2026'
export const dateDeModifImportante = '28/10/2026'
export const interactifReady = true
export const interactifType = 'qcm'
export const amcReady = true
export const amcType = 'qcmMono'

export const uuid = 'faf4b'
export const refs = {
  'fr-fr': ['TSA3-46', 'TCA7-46'],
  'fr-ch': [],
}

type FonctionNumerique = (x: number) => number

function graphique(
  fonction: FonctionNumerique,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  scale: number,
  nomCourbe?: string,
  tangente?: { abscisse: number; ordonnee: number; pente: number },
): string {
  const yUnite = Math.min(0.3, 8 / (yMax - yMin))
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    yUnite,
    xLabelMin: xMin,
    xLabelMax: xMax,
    yLabelMin: yMin,
    yLabelMax: yMax,
    xThickDistance: 1,
    yThickDistance: 5,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 5,
    grilleSecondaireXMin: xMin,
    grilleSecondaireXMax: xMax,
    grilleSecondaireYMin: yMin,
    grilleSecondaireYMax: yMax,
  })

  const abscisseLabel = xMax - 0.55
  const ordonneeLabel = Math.max(
    yMin + 3,
    Math.min(yMax - 3, fonction(abscisseLabel)),
  )
  const decalageLabel = fonction(abscisseLabel) > yMax - 6 ? -1.15 : 1.15
  const objetsTangente = []
  if (tangente !== undefined) {
    const xAuxBornesVerticales = [
      tangente.abscisse + (yMin - tangente.ordonnee) / tangente.pente,
      tangente.abscisse + (yMax - tangente.ordonnee) / tangente.pente,
    ].sort((a, b) => a - b)
    const xTangenteMin = Math.max(xMin, xAuxBornesVerticales[0])
    const xTangenteMax = Math.min(xMax, xAuxBornesVerticales[1])
    const imageTangente = (x: number) =>
      tangente.ordonnee + tangente.pente * (x - tangente.abscisse)
    const traceTangente = segment(
      xTangenteMin,
      imageTangente(xTangenteMin) * yUnite,
      xTangenteMax,
      imageTangente(xTangenteMax) * yUnite,
      orangeMathalea,
    )
    traceTangente.epaisseur = 3
    traceTangente.pointilles = 4
    const xLabelTangente = tangente.abscisse + (tangente.pente > 0 ? 1 : -1)
    const decalageLabelTangente = tangente.pente > 0 ? -1.1 : 1.1
    objetsTangente.push(
      traceTangente,
      latex2d(
        '(T)',
        xLabelTangente,
        imageTangente(xLabelTangente) * yUnite + decalageLabelTangente,
        { color: orangeMathalea, letterSize: 'normalsize' },
      ),
    )
  }

  return mathalea2d(
    {
      xmin: xMin - 0.4,
      xmax: xMax + 0.4,
      ymin: yMin * yUnite - 0.2,
      ymax: yMax * yUnite + 0.3,
      pixelsParCm: 20,
      scale,
      center: !context.isHtml,
      centerLatex: true,
    },
    r,
    courbe(fonction, {
      repere: r,
      xMin,
      xMax,
      yMin,
      yMax,
      color: bleuMathalea,
      epaisseur: 3,
      step: context.isTypst ? 0.15 : 0.04,
    }),
    ...objetsTangente,
    ...(nomCourbe === undefined
      ? []
      : [
          latex2d(
            nomCourbe,
            abscisseLabel - 0.15,
            ordonneeLabel * yUnite + decalageLabel,
            {
              color: bleuMathalea,
              letterSize: 'normalsize',
            },
          ),
        ]),
  )
}

type NomFonction = 'f' | "f'" | "f''"
type RoleProposition =
  | 'correcte'
  | 'opposee'
  | 'primitive'
  | 'deriveePremiere'
  | 'deriveeTroisieme'
  | 'decalee'
  | 'autre'

/**
 * Reconnaître les courbes de f, f' et f'' les unes à partir des autres.
 * @author Stéphane Guyon
 */
export default class CourbesFonctionEtDerivees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.sup = 7
    this.besoinFormulaireNumerique = [
      'Courbe donnée et courbe demandée',
      7,
      "1 : f' donnée ; f demandée\n2 : f' donnée ; f'' demandée\n3 : f donnée ; f' demandée\n4 : f donnée ; f'' demandée\n5 : f'' donnée ; f demandée\n6 : f'' donnée ; f' demandée\n7 : Mélange",
    ]
  }

  nouvelleVersion(): void {
    this.autoCorrection = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const choix = Number(this.sup)
      const typeQuestion = choix >= 1 && choix <= 6 ? choix : randint(1, 6)
      const couples: Array<[NomFonction, NomFonction]> = [
        ["f'", 'f'],
        ["f'", "f''"],
        ['f', "f'"],
        ['f', "f''"],
        ["f''", 'f'],
        ["f''", "f'"],
      ]
      const [fonctionDonnee, fonctionDemandee] = couples[typeQuestion - 1]
      const descriptionFonction: Record<NomFonction, string> = {
        f: 'fonction $f$',
        "f'": "fonction dérivée $f'$",
        "f''": "fonction dérivée seconde $f''$",
      }
      const origine = randint(-1, 1)
      const ecartGauche = randint(1, 2)
      const ecartDroit = randint(1, 2)
      const racineGauche = origine - ecartGauche
      const racineDroite = origine + ecartDroit
      const centre = (racineGauche + racineDroite) / 2
      const coefficient = choice([-2, -1, 1, 2])
      const translationVerticale = randint(-5, 5)
      const positifExterieur = coefficient > 0
      const xMin = racineGauche - 2
      const xMax = racineDroite + 2

      const fonctions: Record<NomFonction, FonctionNumerique> = {
        f: (x: number) => {
          const t = x - origine
          return (
            coefficient *
              (t ** 3 / 3 +
                ((ecartGauche - ecartDroit) * t ** 2) / 2 -
                ecartGauche * ecartDroit * t) +
            translationVerticale
          )
        },
        "f'": (x: number) =>
          coefficient * (x - racineGauche) * (x - racineDroite),
        "f''": (x: number) =>
          coefficient * (2 * (x - origine) + ecartGauche - ecartDroit),
      }
      const opposee = (fonction: FonctionNumerique) => (x: number) =>
        -fonction(x)
      const primitiveF = (x: number) => {
        const t = x - origine
        return (
          coefficient *
            (t ** 4 / 12 +
              ((ecartGauche - ecartDroit) * t ** 3) / 6 -
              (ecartGauche * ecartDroit * t ** 2) / 2) +
          translationVerticale * t
        )
      }
      const deriveeTroisieme = (_x: number) => 2 * coefficient
      const decalageHorizontal = choice([-1, 1])
      const fonctionDecalee = (x: number) =>
        fonctions[fonctionDemandee](x - decalageHorizontal)
      const autreNom = (['f', "f'", "f''"] as NomFonction[]).find(
        (nom) => nom !== fonctionDonnee && nom !== fonctionDemandee,
      ) as NomFonction

      type DefinitionProposition = {
        fonction: FonctionNumerique
        statut: boolean
        role: RoleProposition
        nom: string
      }
      const reservoirDistracteurs: DefinitionProposition[] = [
        {
          fonction: opposee(fonctions[fonctionDemandee]),
          statut: false,
          role: 'opposee',
          nom: `-${fonctionDemandee}`,
        },
        {
          fonction: primitiveF,
          statut: false,
          role: 'primitive',
          nom: 'une primitive de f',
        },
        {
          fonction: deriveeTroisieme,
          statut: false,
          role: 'deriveeTroisieme',
          nom: "f'''",
        },
        {
          fonction: fonctionDecalee,
          statut: false,
          role: 'decalee',
          nom: `${fonctionDemandee} décalée`,
        },
        {
          fonction: fonctions[autreNom],
          statut: false,
          role: autreNom === "f'" ? 'deriveePremiere' : 'autre',
          nom: autreNom,
        },
      ]
      const definitionsPropositions: DefinitionProposition[] = shuffle([
        {
          fonction: fonctions[fonctionDemandee],
          statut: true,
          role: 'correcte',
          nom: fonctionDemandee,
        },
        ...shuffle(reservoirDistracteurs).slice(0, 3),
      ])
      // Les distracteurs (notamment une primitive quartique) peuvent prendre
      // de grandes valeurs aux bords. Ils ne doivent pas imposer une échelle
      // qui écrase les informations utiles des courbes de f, f' et f''.
      const valeursPourCadrage = (['f', "f'", "f''"] as NomFonction[]).flatMap(
        (nom) =>
          Array.from({ length: 41 }, (_, index) =>
            Math.abs(fonctions[nom](xMin + ((xMax - xMin) * index) / 40)),
          ),
      )
      const amplitudeVerticale = Math.max(
        15,
        Math.ceil((Math.max(...valeursPourCadrage) + 2) / 5) * 5,
      )
      const yMin = -amplitudeVerticale
      const yMax = amplitudeVerticale

      const graphiqueDonne = graphique(
        fonctions[fonctionDonnee],
        xMin,
        xMax,
        yMin,
        yMax,
        0.9,
        `\\mathcal C_{${fonctionDonnee}}`,
        typeQuestion === 4
          ? {
              abscisse: centre,
              ordonnee: fonctions.f(centre),
              pente: fonctions["f'"](centre),
            }
          : undefined,
      )
      const propositions = definitionsPropositions.map(
        (proposition, index) => ({
          texte: graphique(
            proposition.fonction,
            xMin,
            xMax,
            yMin,
            yMax,
            0.5,
            `\\mathcal C_${lettreDepuisChiffre(index + 1)}`,
          ),
          statut: proposition.statut,
        }),
      )
      const indicationTangente =
        typeQuestion === 4
          ? `<br>La droite $(T)$, tracée en pointillés, est la tangente à $\\mathcal C_f$ au point d'abscisse $${texNombre(centre)}$.`
          : ''
      const enonce = `La fonction $f$ est deux fois dérivable sur $\\mathbb R$. On donne ci-dessous la courbe représentative de la ${descriptionFonction[fonctionDonnee]}, notée $\\mathcal C_{${fonctionDonnee}}$.${indicationTangente}<br>
    ${graphiqueDonne}<br>
    Parmi les quatre courbes suivantes, laquelle peut représenter la ${descriptionFonction[fonctionDemandee]} ?`

      this.autoCorrection[i] = {
        enonce,
        options: { ordered: true, radio: true, vertical: false },
        propositions,
      }
      // Les propositions sont nommées A, B, C, D : en interactif la lettre
      // s'ajoute au bouton radio, sur papier (dont Typst) elle le remplace.
      // En Typst, les quatre courbes se rangent par défaut en grille 2×2,
      // alignées à gauche sous leur lettre.
      const qcm = propositionsQcm(this, i, {
        style: '',
        format: this.interactif && !context.isTypst ? 'caseLettre' : 'lettre',
        typstColumns: 2,
        typstFigureAlign: 'left',
      })

      const tableauQuadratique = (
        nomLigne: string,
        ligne: (string | number)[],
        hauteur = 18,
      ) =>
        tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 20],
              [`$${nomLigne}(x)$`, 3, 45],
            ],
            [
              '$-\\infty$',
              25,
              `$${texNombre(racineGauche)}$`,
              25,
              `$${texNombre(racineDroite)}$`,
              25,
              '$+\\infty$',
              25,
            ],
          ],
          tabLines: [ligne],
          espcl: 4.5,
          deltacl: 0.8,
          lgt: 3,
          scale: 0.9,
          hauteurLignes: [18, hauteur],
        })
      const tableauSigneFPrime = tableauQuadratique("f'", [
        'Line',
        20,
        '',
        10,
        positifExterieur ? '+' : '-',
        20,
        'z',
        20,
        positifExterieur ? '-' : '+',
        20,
        'z',
        20,
        positifExterieur ? '+' : '-',
        10,
      ])
      const tableauVariationsF = tableauQuadratique(
        'f',
        positifExterieur
          ? ['Var', 10, '-/', 20, '+/', 20, '-/', 20, '+/', 10]
          : ['Var', 10, '+/', 20, '-/', 20, '+/', 20, '-/', 10],
        28,
      )
      const tableauCentre = (
        nomLigne: string,
        ligne: (string | number)[],
        hauteur = 18,
      ) =>
        tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 20],
              [`$${nomLigne}(x)$`, 3, 45],
            ],
            ['$-\\infty$', 25, `$${texNombre(centre)}$`, 25, '$+\\infty$', 25],
          ],
          tabLines: [ligne],
          espcl: 5,
          deltacl: 0.8,
          lgt: 3,
          scale: 0.9,
          hauteurLignes: [18, hauteur],
        })
      const tableauSigneFSeconde = tableauCentre("f''", [
        'Line',
        20,
        '',
        10,
        coefficient > 0 ? '-' : '+',
        20,
        'z',
        20,
        coefficient > 0 ? '+' : '-',
        10,
      ])
      const tableauConvexiteF = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 20],
            ['$\\text{Convexité de }f$', 3, 60],
          ],
          ['$-\\infty$', 25, `$${texNombre(centre)}$`, 25, '$+\\infty$', 25],
        ],
        tabLines: [
          [
            'Line',
            20,
            '',
            10,
            coefficient > 0 ? '$\\text{Concave}$' : '$\\text{Convexe}$',
            35,
            't',
            20,
            coefficient > 0 ? '$\\text{Convexe}$' : '$\\text{Concave}$',
            35,
          ],
        ],
        espcl: 6.5,
        deltacl: 0.8,
        lgt: 6,
        scale: 0.9,
        hauteurLignes: [18, 22],
      })
      const tableauVariationsFPrime = tableauCentre(
        "f'",
        coefficient > 0
          ? ['Var', 10, '+/', 20, '-/', 20, '+/', 10]
          : ['Var', 10, '-/', 20, '+/', 20, '-/', 10],
        28,
      )

      const variationsF = positifExterieur
        ? `croissante, puis décroissante, puis croissante, avec des changements de variation en $${texNombre(racineGauche)}$ et $${texNombre(racineDroite)}$`
        : `décroissante, puis croissante, puis décroissante, avec des changements de variation en $${texNombre(racineGauche)}$ et $${texNombre(racineDroite)}$`
      const variationsFPrime =
        coefficient > 0
          ? `décroissante sur $]-\\infty\\,;\\,${texNombre(centre)}]$ puis croissante sur $[${texNombre(centre)}\\,;\\,+\\infty[$`
          : `croissante sur $]-\\infty\\,;\\,${texNombre(centre)}]$ puis décroissante sur $[${texNombre(centre)}\\,;\\,+\\infty[$`
      const convexiteF =
        coefficient > 0
          ? `concave sur $]-\\infty\\,;\\,${texNombre(centre)}]$ puis convexe sur $[${texNombre(centre)}\\,;\\,+\\infty[$`
          : `convexe sur $]-\\infty\\,;\\,${texNombre(centre)}]$ puis concave sur $[${texNombre(centre)}\\,;\\,+\\infty[$`

      let raisonnement: string
      let critere: string
      switch (typeQuestion) {
        case 1:
          raisonnement = `On lit le signe de $f'$ sur $\\mathcal C_{f'}$ :<br><br>${tableauSigneFPrime}<br>
        Sur chaque intervalle où $f'>0$, $f$ est croissante ; sur chaque intervalle où $f'<0$, $f$ est décroissante. Ainsi, $f$ est ${variationsF}.<br><br>${tableauVariationsF}`
          critere = `présenter les variations indiquées par le signe de $f'$`
          break
        case 2:
          raisonnement = `La fonction $f''$ est la dérivée de $f'$. Ainsi, les variations de $f'$ déterminent le signe de $f''$ : si $f'$ est croissante sur un intervalle, alors $f''$ y est positive ; si $f'$ est décroissante, alors $f''$ y est négative.<br>
        On lit sur $\\mathcal C_{f'}$ que $f'$ est ${variationsFPrime}.<br><br>${tableauVariationsFPrime}<br>
        On en déduit donc le signe de $f''$ :<br><br>${tableauSigneFSeconde}`
          critere = `avoir le signe imposé par les variations de $f'$`
          break
        case 3:
          raisonnement = `On lit sur $\\mathcal C_f$ que $f$ est ${variationsF}. On obtient le tableau de variations suivant :<br><br>${tableauVariationsF}<br>
        Lorsque la fonction $f$ est croissante sur un intervalle, sa dérivée $f'$ y est positive ; lorsque $f$ est décroissante, $f'$ y est négative.<br>
        Le signe de $f'$ est donc donné par :<br><br>${tableauSigneFPrime}`
          critere = `avoir le signe imposé par les variations de $f$ et s'annuler aux deux extremums de $f$`
          break
        case 4:
          raisonnement = `On observe que la tangente $(T)$ coupe la courbe $\\mathcal C_f$ au point d'abscisse $${texNombre(centre)}$. La courbe admet donc un point d'inflexion en ce point et la fonction $f$ change de convexité en $x=${texNombre(centre)}$.<br>
        On déduit du graphique que $f$ est ${convexiteF}. On obtient le tableau suivant :<br><br>${tableauConvexiteF}<br>
        Sur un intervalle où $f$ est concave, $f''$ est négative ; sur un intervalle où $f$ est convexe, $f''$ est positive.<br>
        On en déduit le signe de $f''$ :<br><br>${tableauSigneFSeconde}`
          critere = `avoir le signe imposé par la convexité de $f$ et s'annuler au point d'inflexion`
          break
        case 5:
          raisonnement = `On lit le signe de $f''$ sur $\\mathcal C_{f''}$ :<br><br>${tableauSigneFSeconde}<br>
        La fonction $f$ est concave lorsque $f''<0$ et convexe lorsque $f''>0$. Ainsi, $f$ est ${convexiteF}. On obtient le tableau de convexité suivant :<br><br>${tableauConvexiteF}`
          critere = `présenter la convexité imposée par le signe de $f''$`
          break
        default:
          raisonnement = `On lit le signe de $f''$ sur $\\mathcal C_{f''}$ :<br><br>${tableauSigneFSeconde}<br>
        Comme $f''$ est la dérivée de $f'$, la fonction $f'$ est ${variationsFPrime} :<br><br>${tableauVariationsFPrime}`
          critere = `présenter les variations imposées par le signe de $f''$`
      }

      const explicationOpposee: Record<number, string> = {
        1: `ses variations sont exactement opposées à celles déduites du signe de $f'$`,
        2: `son signe est opposé à celui imposé par les variations de $f'$`,
        3: `son signe donnerait à $f$ des variations opposées à celles observées`,
        4: `son signe correspondrait à une convexité opposée à celle de $f$`,
        5: `sa convexité est opposée à celle imposée par le signe de $f''$`,
        6: `ses variations sont opposées à celles imposées par le signe de $f''$`,
      }
      const analysesCourbes = definitionsPropositions
        .map((proposition, index) => {
          const nomCourbe = `$\\mathcal C_${lettreDepuisChiffre(index + 1)}$`
          if (proposition.role === 'correcte') {
            return `<b>Courbe ${nomCourbe} :</b> elle satisfait le critère attendu : ${critere}. Elle peut représenter $${fonctionDemandee}$.`
          }
          if (proposition.role === 'opposee') {
            return `<b>Courbe ${nomCourbe} :</b> ${explicationOpposee[typeQuestion]}. On l'élimine.`
          }
          if (proposition.role === 'primitive') {
            return `<b>Courbe ${nomCourbe} :</b> son signe, ses variations, ses extremums ou sa convexité ne correspondent pas aux informations déduites de la courbe donnée. Elle ne satisfait donc pas le critère attendu pour $${fonctionDemandee}$ : ${critere}. On l'élimine.`
          }
          if (proposition.role === 'deriveePremiere') {
            return `<b>Courbe ${nomCourbe} :</b> elle correspond à la forme de $f'$ et traduit une confusion sur l'ordre de dérivation. Elle ne satisfait pas le critère attendu pour $${fonctionDemandee}$. On l'élimine.`
          }
          if (proposition.role === 'deriveeTroisieme') {
            return `<b>Courbe ${nomCourbe} :</b> elle est constante et peut représenter $f'''$. Elle correspond à une dérivation supplémentaire. On l'élimine.`
          }
          if (proposition.role === 'decalee') {
            return `<b>Courbe ${nomCourbe} :</b> son allure est plausible, mais ses changements de signe ou de variation sont décalés horizontalement. Ils ne se produisent pas aux abscisses attendues. On l'élimine.`
          }
          return `<b>Courbe ${nomCourbe} :</b> elle correspond à la forme de $${proposition.nom}$ et traduit une confusion entre variation, signe et convexité. Elle ne satisfait pas le critère attendu pour $${fonctionDemandee}$. On l'élimine.`
        })
        .join('<br><br>')
      const lettreBonneCourbe = lettreDepuisChiffre(
        definitionsPropositions.findIndex((proposition) => proposition.statut) +
          1,
      )
      const rappelConvexiteGraphique =
        typeQuestion === 5
          ? `Lorsqu'une fonction est concave sur un intervalle, sa courbe est tournée vers le bas ; lorsqu'elle est convexe, sa courbe est tournée vers le haut.<br><br>`
          : ''

      const styleQcm = context.isHtml
        ? `<style>
          #exercice${this.numeroExercice} .my-3 {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            align-items: center;
            justify-items: center;
          }
        </style>`
        : ''
      const correctionQcm = context.isTypst ? '' : qcm.texteCorr
      if (
        this.questionJamaisPosee(
          i,
          typeQuestion,
          racineGauche,
          racineDroite,
          coefficient,
          translationVerticale,
        )
      ) {
        this.listeQuestions[i] = `${enonce}${styleQcm}${qcm.texte}`
        this.listeCorrections[i] =
          `<b>1. Exploitation de la courbe donnée</b><br>
    ${raisonnement}<br><br>
    <b>2. Examen des courbes proposées</b><br>
    ${rappelConvexiteGraphique}${analysesCourbes}<br><br>
    La seule courbe compatible est donc $${miseEnEvidence(`\\mathcal C_${lettreBonneCourbe}`)}$.<br>
    ${correctionQcm}`
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
