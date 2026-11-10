import { Arc, arcPointPointAngle } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Droite, droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { TexteSurArc, texteSurArc } from '../../lib/2d/TexteSurArc'
import { homothetie, rotation, translation } from '../../lib/2d/transformations'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des liens entre angles et parallélisme'
export const dateDePublication = '15/01/2022'
export const dateDeModifImportante = '02/09/2026'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

type AngleParams = { O: number; A: number }
type AngleMarque = Arc & { nom?: string }
type AnglesSecantesResult = {
  arcs: Record<string, AngleMarque>
  points: Record<string, PointAbstrait>
  As: Droite
  Ax: Droite
  labels: Record<string, TexteSurArc>
}

// Conserver l'ordre historique des objets, avec les labels courants après remplacement.
function objetsAnglesSecantes(
  angles: AnglesSecantesResult,
): Array<Arc | PointAbstrait | Droite | TexteSurArc> {
  return [
    ...Object.values(angles.arcs),
    angles.points.s,
    angles.points.S,
    angles.points.t,
    angles.points.T,
    angles.points.x,
    angles.points.X,
    angles.points.Ox,
    angles.points.OX,
    angles.As,
    angles.Ax,
    angles.points.A,
    ...Object.values(angles.labels),
  ]
}

function aleaName(
  names: string[] = [],
  n = names.length,
  result: string[] = [],
) {
  const r = Math.floor(Math.random() * names.length)
  result.push(names[r])
  names.splice(r, 1)
  if (result.length === n) {
    return result
  } else {
    return aleaName(names, n, result)
  }
}

function anglesSecantes(
  A: PointAbstrait,
  rot: AngleParams = { O: 60, A: 0 },
): AnglesSecantesResult {
  const s = rotation(translation(A, vecteur(1, 0)), A, rot.A)
  // Les points S, T, X, OX ne servent qu'à placer les noms des directions/points :
  // on les éloigne du sommet pour que les labels soient vraiment « au bout » des droites.
  const S = rotation(translation(A, vecteur(4, 0)), A, rot.A)
  const t = rotation(s, A, 180)
  const T = rotation(S, A, 180)
  const x = rotation(translation(A, vecteur(1, 0)), A, rot.O)
  const X = rotation(translation(A, vecteur(4, 0)), A, rot.O)
  const Ox = rotation(x, A, 180)
  const OX = rotation(X, A, 180)
  return {
    arcs: {
      a: arcPointPointAngle(s, x, rot.O - rot.A, true, bleuMathalea),
      b: arcPointPointAngle(x, t, 180 - (rot.O - rot.A), true, 'green'),
      c: arcPointPointAngle(t, Ox, rot.O - rot.A, true, 'red'),
      d: arcPointPointAngle(Ox, s, 180 - (rot.O - rot.A), true, 'gray'),
    },
    points: {
      s,
      S,
      t,
      T,
      x,
      X,
      Ox,
      OX,
      A,
    },
    As: droite(A, s),
    Ax: droite(A, x),
    labels: {
      labela: texteSurArc(
        ((rot.O - rot.A) % 180) + '°',
        s,
        x,
        rot.O - rot.A,
        'black',
        0.7,
      ),
      labelb: texteSurArc(
        ((180 - (rot.O - rot.A)) % 180) + '°',
        x,
        t,
        180 - (rot.O - rot.A),
        'black',
        0.7,
      ),
      labelc: texteSurArc(
        ((rot.O - rot.A) % 180) + '°',
        t,
        Ox,
        rot.O - rot.A,
        'black',
        0.7,
      ),
      labeld: texteSurArc(
        ((180 - (rot.O - rot.A)) % 180) + '°',
        Ox,
        s,
        180 - (rot.O - rot.A),
        'black',
        0.7,
      ),
    },
  }
}

/**
 * Nomme les extrémités des deux droites sécantes.
 * - `parPoints === false` (comportement historique) : les demi-droites libres sont
 *   repérées par des directions en minuscules (s, t, u, …), les sommets par des points.
 * - `parPoints === true` : toutes les extrémités sont repérées par des points en
 *   MAJUSCULES (les angles sont alors nommés uniquement avec des points).
 */
function nommeExtremites(
  anglesA: AnglesSecantesResult,
  anglesB: AnglesSecantesResult,
  parPoints: boolean,
) {
  if (parPoints) {
    const noms = aleaName(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'], 8)
    anglesA.points.A.nom = noms[0]
    anglesB.points.A.nom = noms[1]
    anglesA.points.S.nom = noms[2]
    anglesA.points.T.nom = noms[3]
    anglesA.points.X.nom = noms[4]
    anglesB.points.S.nom = noms[5]
    anglesB.points.T.nom = noms[6]
    anglesB.points.OX.nom = noms[7]
  } else {
    const nomsPoints = aleaName(['A', 'B', 'C', 'D', 'E', 'F'], 2)
    anglesA.points.A.nom = nomsPoints[0]
    anglesB.points.A.nom = nomsPoints[1]
    const nomsDirections = aleaName(['s', 't', 'u', 'v', 'x', 'y'], 6)
    anglesA.points.S.nom = nomsDirections[0]
    anglesA.points.T.nom = nomsDirections[1]
    anglesA.points.X.nom = nomsDirections[2]
    anglesB.points.S.nom = nomsDirections[3]
    anglesB.points.T.nom = nomsDirections[4]
    anglesB.points.OX.nom = nomsDirections[5]
  }
  // Ces deux extrémités sont sur la sécante : elles portent le nom du sommet opposé.
  anglesA.points.OX.nom = anglesB.points.A.nom
  anglesB.points.X.nom = anglesA.points.A.nom
}

/**
 * Petits traits perpendiculaires tracés sur les droites, au niveau de chaque
 * extrémité nommée, pour indiquer la position exacte du point (mode « points »).
 */
function traitsPositionExtremites(
  anglesA: AnglesSecantesResult,
  anglesB: AnglesSecantesResult,
) {
  const paires: Array<[PointAbstrait, PointAbstrait]> = [
    [anglesA.points.A, anglesA.points.S],
    [anglesA.points.A, anglesA.points.T],
    [anglesA.points.A, anglesA.points.X],
    [anglesB.points.A, anglesB.points.S],
    [anglesB.points.A, anglesB.points.T],
    [anglesB.points.A, anglesB.points.OX],
  ]
  return paires.map(([sommet, extremite]) => {
    const M = pointSurSegment(extremite, sommet, 0.35)
    return segment(rotation(M, extremite, 90), rotation(M, extremite, -90))
  })
}

/**
 * Effectuer des liens entre angles et parallélisme
 * @author Frédéric PIOU
 * rendu interactif par Guillaume Valmont le 21/01/2024
 */
export const uuid = '19812'

export const refs = {
  'fr-fr': ['5G4A'],
  'fr-2016': ['5G30-2'],
  'fr-ch': ['1mG1-4', '11LCES1A-1', '11LSES1A-1'],
}
export default class ExercicesAnglesAIC extends Exercice {
  constructor() {
    super()

    const formulaire = [
      '1 : Angles marqués alternes-internes ou correspondants ?',
      '2 : Déterminer si des droites sont parallèles (angles marqués).',
      '3 : Déterminer si des droites sont parallèles (angles nommés).',
      "4 : Calculer la mesure d'un angle (angles marqués).",
      "5 : Calculer la mesure d'un angle (angles nommés).",
      '6 : Marquer un angle alterne-interne ou correspondant à un angle marqué.',
      '7 : Nommer un angle alterne-interne ou correspondant à un angle nommé.',
      '8 : Mélange',
    ]

    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n' + formulaire.join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      'Nommer les angles uniquement avec des points (au lieu des directions de droites)',
      false,
    ]
    this.sup2 = false

    this.nbCols = 2
    this.nbColsCorr = 2

    this.spacing = context.isHtml ? 1.75 : 1
    this.spacingCorr = context.isHtml ? 1.75 : 1
    this.sup = 8 // Type d'exercice
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const nquestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 7,
      defaut: 8,
      melange: 8,
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    const nommerParPoints = this.sup2 === true || this.sup2 === 'true'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      // Boucle principale où i+1 correspond au numéro de la question
      let exercice: { texte: string; texteCorr: string } = {
        texte: '',
        texteCorr: '',
      }
      const propositions: Array<{ texte: string; statut: boolean }> = []
      let options = { ordered: true }
      switch (
        nquestion[i] // Chaque question peut être d'un type différent, ici 4 cas sont prévus...
      ) {
        case 1: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          let param
          do {
            const createVariables = (O: number, A: number, B: number) => ({
              O,
              A,
              B,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(
              randint(0, 90),
              randint(-90, 0),
              randint(-90, 0),
            )
          } while (!(
            abs(param.O - abs(param.A)) > 30 && abs(param.O - abs(param.B)) > 30
          ))
          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.7
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].opaciteDeRemplissage = 0.7
          }
          const ab = choice([
            choice(['aa', 'bb', 'cc', 'dd']),
            choice(['ca', 'db']),
            choice(['a', 'b', 'c', 'd']) + choice(['a', 'b', 'c', 'd']),
          ])
          const a = ab[0]
          const b = ab[1]
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.arcs[b],
            anglesB.As,
            anglesA.labels['label' + a],
            anglesB.labels['label' + b],
          )

          const paramsEnonce = fixeBordures([
            ...objetsAnglesSecantes(anglesA),
            ...objetsAnglesSecantes(anglesB),
          ])
          // On copie tout le contenu de objetsEnonce dans objetsCorrection
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          // ici sont créés les texte, tex_corr, objets mathalea2d divers entrant dans le contenu de l'exercice
          let texte =
            "Les angles marqués sont-ils alternes-internes, correspondants ou ni l'un, ni l'autre ?<br>"
          let reponse
          let reponseCorrecte
          if (a === b) {
            reponse = `sont ${texteEnCouleurEtGras('correspondants')}`
            reponseCorrecte = 'correspondants'
          } else if (a + b === 'ca' || a + b === 'db') {
            reponse = `sont ${texteEnCouleurEtGras('alternes-internes')}`
            reponseCorrecte = 'alternes-internes'
          } else {
            reponse = `ne sont ${texteEnCouleurEtGras('ni alternes-internes')}, ${texteEnCouleurEtGras('ni correspondants')}`
            reponseCorrecte = "ni l'un ni l'autre"
          }
          const texteCorr = `Par définition, les angles marqués ${reponse}.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          propositions.push({
            texte: 'alternes-internes',
            statut: reponseCorrecte === 'alternes-internes',
          })
          propositions.push({
            texte: 'correspondants',
            statut: reponseCorrecte === 'correspondants',
          })
          propositions.push({
            texte: "ni l'un ni l'autre",
            statut: reponseCorrecte === "ni l'un ni l'autre",
          })
          break
        }
        case 2: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'A',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '70>O-A>30 and 70>O-B>30 and abs(A-B)<45'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number) => ({
              O,
              A,
              B: A,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(randint(0, 90), randint(-90, 90))
          } while (!(param.O - param.A < 70 && param.O - param.A > 30))

          /* const ab = aleaVariables(
            {
              a: 'randomInt(0,3)',
              b: 'randomInt(0,3)',
              test: 'a!=b and (a!=2 or b!=0) and (a!=3 or b!=1)'
            }
          ) */
          let ab
          do {
            const createVariables = (a: number, b: number) => ({
              a,
              b,
            })

            ab = createVariables(randint(0, 3), randint(0, 3))
          } while (!(
            ab.a !== ab.b &&
            (ab.a !== 2 || ab.b !== 0) &&
            (ab.a !== 3 || ab.b !== 1)
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.7
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].opaciteDeRemplissage = 0.7
          }
          anglesA.As.color = colorToLatexOrHTML('red')
          anglesB.As.color = colorToLatexOrHTML('red')
          const a = ['a', 'b', 'c', 'd'][ab.a]
          const b = ['a', 'b', 'c', 'd'][ab.b]
          const epsilon = randint(-2, 2, 0)
          anglesA.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + epsilon + '°',
            anglesA.points.s,
            anglesA.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.x,
            anglesA.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesA.labels.labelc = texteSurArc(
            ((param.O - param.A + epsilon) % 180) + '°',
            anglesA.points.t,
            anglesA.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.Ox,
            anglesA.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.s,
            anglesB.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.x,
            anglesB.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labelc = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.t,
            anglesB.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.Ox,
            anglesB.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.arcs[b],
            anglesB.As,
            anglesA.labels['label' + a],
            anglesB.labels['label' + b],
          )
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          let angles = ''
          let calculs: string | undefined
          anglesA.arcs[a].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML('red')
          anglesA.labels.labela.color = colorToLatexOrHTML('red')
          anglesA.labels.labelb.color = colorToLatexOrHTML('red')
          anglesA.labels.labelc.color = colorToLatexOrHTML('red')
          anglesA.labels.labeld.color = colorToLatexOrHTML('red')
          anglesB.labels.labela.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelb.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelc.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labeld.color = colorToLatexOrHTML(bleuMathalea)

          switch (a + b) {
            case 'ab':
            case 'ad':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              break
            case 'ac':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              break
            case 'ba':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'bc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelc.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'bd':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              break
            case 'cb':
            case 'cd':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              break
            case 'da':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'dc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelc.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              angles = 'alternes-internes'
              break
          }
          const paramsEnonce = fixeBordures([
            ...objetsAnglesSecantes(anglesA),
            ...objetsAnglesSecantes(anglesB),
          ])
          let texte = 'Les droites rouges sont-elles parallèles ?<br>'
          let sont, coord
          if (epsilon !== 0) {
            coord = 'mais pas'
            sont = 'ne sont pas'
          } else {
            coord = 'et'
            sont = 'sont'
          }
          const texteCorr =
            mathalea2d(
              Object.assign({ scale: 0.4 }, paramsEnonce),
              objetsCorrection,
            ) +
            `
          ${calculs !== undefined ? calculs : 'Les angles bleu et vert sont opposés par le sommet donc ils sont de même mesure.<br>'}
          Les angles rouge et vert sont ${angles} ${texteGras(coord + ' de même mesure')}.<br>
          Donc les droites rouges ${texteEnCouleurEtGras(sont + ' parallèles')}.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          propositions.push({
            texte: 'Oui',
            statut: epsilon === 0,
          })
          propositions.push({
            texte: 'Non',
            statut: epsilon !== 0,
          })
          break
        }
        case 4: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'A',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '70>O-A>30 and 70>O-B>30 and abs(A-B)<45'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number) => ({
              O,
              A,
              B: A,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(randint(0, 90), randint(-90, 90))
          } while (!(param.O - param.A < 70 && param.O - param.A > 30))
          /* const ab = aleaVariables(
            {
              a: 'randomInt(0,3)',
              b: 'randomInt(0,3)',
              test: 'a!=b and (a!=2 or b!=0) and (a!=3 or b!=1)'
            }
          ) */
          let ab
          do {
            const createVariables = (a: number, b: number) => ({
              a,
              b,
            })

            ab = createVariables(randint(0, 3), randint(0, 3))
          } while (!(
            ab.a !== ab.b &&
            (ab.a !== 2 || ab.b !== 0) &&
            (ab.a !== 3 || ab.b !== 1)
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.7
            anglesB.arcs[i].opaciteDeRemplissage = 0.7
          }
          const a = ['a', 'b', 'c', 'd'][ab.a]
          const b = ['a', 'b', 'c', 'd'][ab.b]
          anglesA.As.color = colorToLatexOrHTML('red')
          anglesB.As.color = colorToLatexOrHTML('red')
          const epsilon = 0
          anglesA.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + epsilon + '°',
            anglesA.points.s,
            anglesA.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.x,
            anglesA.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesA.labels.labelc = texteSurArc(
            ((param.O - param.A + epsilon) % 180) + '°',
            anglesA.points.t,
            anglesA.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.Ox,
            anglesA.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.s,
            anglesB.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.x,
            anglesB.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labelc = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.t,
            anglesB.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.Ox,
            anglesB.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.arcs[b],
            anglesB.As,
            anglesA.labels['label' + a],
          )
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          objetsCorrection.push(anglesB.labels['label' + b])
          let angles = ''
          let calculs: string | undefined
          let mesure = ''
          anglesA.arcs[a].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML('red')
          anglesA.labels.labela.color = colorToLatexOrHTML('red')
          anglesA.labels.labelb.color = colorToLatexOrHTML('red')
          anglesA.labels.labelc.color = colorToLatexOrHTML('red')
          anglesA.labels.labeld.color = colorToLatexOrHTML('red')
          anglesB.labels.labela.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelb.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelc.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labeld.color = colorToLatexOrHTML(bleuMathalea)

          switch (a + b) {
            case 'ab':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labelb.texte
              break
            case 'ac':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              mesure = anglesB.labels.labela.texte
              break
            case 'ad':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labeld.texte
              break
            case 'ba':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              mesure = anglesB.labels.labela.texte
              break
            case 'bc':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelc.texte, 'green')}$`
              mesure = anglesB.labels.labelc.texte
              break
            case 'bd':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              mesure = anglesB.labels.labelb.texte
              break
            case 'cb':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labelb.texte
              break
            case 'cd':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labeld.texte, 'green')}$`
              mesure = anglesB.labels.labeld.texte
              break
            case 'da':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              mesure = anglesB.labels.labela.texte
              break
            case 'dc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelc.texte, 'green')}$`
              angles = 'alternes-internes'
              mesure = anglesB.labels.labelc.texte
              break
          }
          const paramsEnonce = fixeBordures([
            ...objetsAnglesSecantes(anglesA),
            ...objetsAnglesSecantes(anglesB),
          ])
          let texte =
            "Sachant que les droites rouges sont parallèles, en déduire la mesure de l'angle bleu."
          texte += this.interactif ? '<br>' : ' Justifier.<br>'
          const texteCorr =
            mathalea2d(
              Object.assign({ scale: 0.4 }, paramsEnonce),
              objetsCorrection,
            ) +
            `Les angles rouge et vert sont ${texteGras(angles)} et formés par des droites ${texteGras('parallèles')}.<br>
          Donc ils sont ${texteGras('de même mesure')}.<br>De plus,
          ${calculs !== undefined ? calculs : ' les angles bleu et vert sont opposés par le sommet donc ils sont de même mesure.'}<br>
          L'angle bleu mesure donc $${miseEnEvidence(mesure)}$.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          const valMesure = Number(mesure.slice(0, mesure.length - 1))
          const valSupplementaireMesure = 180 - valMesure
          const valMesureDizaines = Math.floor(valMesure / 10)
          const valMesuresUnites = valMesure % 10
          const valDistracteur =
            valMesure % 10 === 5
              ? valMesure + choice([-1, 1]) * randint(1, 4)
              : valMesureDizaines * 10 + (10 - valMesuresUnites)
          const supplementaireDistracteur = 180 - valDistracteur
          propositions.push({
            texte: mesure,
            statut: true,
          })
          propositions.push({
            texte: valSupplementaireMesure.toString() + '°',
            statut: false,
          })
          propositions.push({
            texte: valDistracteur.toString() + '°',
            statut: false,
          })
          propositions.push({
            texte: supplementaireDistracteur.toString() + '°',
            statut: false,
          })
          options = { ordered: false }
          break
        }
        case 6: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'randomInt(-90,90)',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '40<O-A<140 and 40<O-B<140 and abs(B-A)<20'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number, B: number) => ({
              O,
              A,
              B,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(
              randint(0, 90),
              randint(-90, 90),
              randint(-90, 90),
            )
          } while (!(
            param.O - param.A > 40 &&
            param.O - param.A < 140 &&
            param.O - param.B > 30 &&
            param.O - param.B < 140 &&
            abs(param.B - param.A) < 20
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          const nomsPoints = aleaName(['A', 'B', 'C', 'D', 'E', 'F'], 2)
          anglesA.points.A.nom = nomsPoints[0]
          anglesB.points.A.nom = nomsPoints[1]
          const nomsDirections = aleaName(['s', 't', 'u', 'v', 'x', 'y'], 6)
          anglesA.points.S.nom = nomsDirections[0]
          anglesA.points.T.nom = nomsDirections[1]
          anglesA.points.X.nom = nomsDirections[2]
          anglesA.points.OX.nom = anglesB.points.A.nom
          anglesB.points.S.nom = nomsDirections[3]
          anglesB.points.T.nom = nomsDirections[4]
          anglesB.points.OX.nom = nomsDirections[5]
          anglesB.points.X.nom = anglesA.points.A.nom
          const nameAngles = [
            'S A X'.split(' '),
            'X A T'.split(' '),
            'T A OX'.split(' '),
            'OX A S'.split(' '),
          ]
          nameAngles.forEach(function (n, i) {
            const angleA = anglesA.arcs[['a', 'b', 'c', 'd'][i]]
            const angleB = anglesB.arcs[['a', 'b', 'c', 'd'][i]]
            angleA.nom = ''
            angleB.nom = ''
            for (let j = 0; j < 3; j++) {
              angleA.nom += anglesA.points[n[j]].nom
              angleB.nom += anglesB.points[n[j]].nom
            }
          })
          if (Math.abs(param.A) > 70) {
            anglesA.points.S.positionLabel = 'left'
            anglesA.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.B) > 70) {
            anglesB.points.S.positionLabel = 'left'
            anglesB.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.O) > 70) {
            anglesA.points.X.positionLabel = 'left'
            anglesB.points.OX.positionLabel = 'left'
          }
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.4
            anglesB.arcs[i].opaciteDeRemplissage = 0.7
          }
          const ab = choice([
            choice(['aa', 'bb', 'cc', 'dd']),
            choice(['ca', 'db']),
          ])
          const a = ab[0]
          const b = ab[1]
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.As,
            /*
            labelPoint(anglesA.points.S),
            labelPoint(anglesA.points.T),
            labelPoint(anglesA.points.X),
            labelPoint(anglesB.points.S),
            labelPoint(anglesB.points.T),
            labelPoint(anglesB.points.OX),
            labelPoint(anglesA.points.A),
            labelPoint(anglesB.points.A),
            */
          )
          const paramsEnonce = fixeBordures(
            [
              ...objetsAnglesSecantes(anglesA),
              ...objetsAnglesSecantes(anglesB),
            ],
            { rzoom: 1.5 },
          )
          // On copie tout le contenu de objetsEnonce dans objetsCorrection
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          const angleCorrection = anglesB.arcs[b]
          angleCorrection.couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(orangeMathalea)
          objetsCorrection.push(angleCorrection)
          const couleurAngles = shuffle(['green', 'red', bleuMathalea, 'gray'])
          anglesB.arcs['a'].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(couleurAngles[0])
          anglesB.arcs['b'].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(couleurAngles[1])
          anglesB.arcs['c'].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(couleurAngles[2])
          anglesB.arcs['d'].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(couleurAngles[3])
          // ici sont créés les texte, tex_corr, objets mathalea2d divers entrant dans le contenu de l'exercice
          let reponse
          if (a === b) {
            reponse = 'correspondant'
          } else if (a + b === 'ca' || a + b === 'db') {
            reponse = 'alterne-interne'
          }
          let texte
          if (this.interactif) {
            texte = `Quel est l'angle ${reponse} à l'angle marqué en bleu ?<br>`
            for (const i of ['a', 'b', 'c', 'd']) {
              objetsEnonce.push(anglesB.arcs[i])
            }
            objetsEnonce.push(
              texteSurArc(
                '1',
                anglesB.points.s,
                anglesB.points.x,
                param.O - param.A,
                'black',
                0.4,
              ),
            )
            objetsEnonce.push(
              texteSurArc(
                '2',
                anglesB.points.x,
                anglesB.points.t,
                180 - (param.O - param.A),
                'black',
                0.4,
              ),
            )
            objetsEnonce.push(
              texteSurArc(
                '3',
                anglesB.points.t,
                anglesB.points.Ox,
                param.O - param.A,
                'black',
                0.4,
              ),
            )
            objetsEnonce.push(
              texteSurArc(
                '4',
                anglesB.points.Ox,
                anglesB.points.s,
                180 - (param.O - param.A),
                'black',
                0.4,
              ),
            )
          } else {
            texte = `Marquer, en une autre couleur ou une autre teinte, l'angle ${reponse} à l'angle marqué en bleu.<br>`
          }
          const texteCorr = mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsCorrection,
          )
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          propositions.push({
            texte: '1',
            statut: b === 'a',
          })
          propositions.push({
            texte: '2',
            statut: b === 'b',
          })
          propositions.push({
            texte: '3',
            statut: b === 'c',
          })
          propositions.push({
            texte: '4',
            statut: b === 'd',
          })
          break
        }
        case 7: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'randomInt(-90,90)',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '40<O-A<140 and 40<O-B<140 and abs(B-A)<20'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number, B: number) => ({
              O,
              A,
              B,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(
              randint(0, 90),
              randint(-90, 90),
              randint(-90, 90),
            )
          } while (!(
            param.O - param.A > 40 &&
            param.O - param.A < 140 &&
            param.O - param.B > 30 &&
            param.O - param.B < 140 &&
            abs(param.B - param.A) < 20
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          nommeExtremites(anglesA, anglesB, nommerParPoints)
          const nameAngles = [
            'S A X'.split(' '),
            'X A T'.split(' '),
            'T A OX'.split(' '),
            'OX A S'.split(' '),
          ]
          nameAngles.forEach(function (n, i) {
            const angleA = anglesA.arcs[['a', 'b', 'c', 'd'][i]]
            const angleB = anglesB.arcs[['a', 'b', 'c', 'd'][i]]
            angleA.nom = ''
            angleB.nom = ''
            for (let j = 0; j < 3; j++) {
              angleA.nom += anglesA.points[n[j]].nom
              angleB.nom += anglesB.points[n[j]].nom
            }
          })
          if (Math.abs(param.A) > 70) {
            anglesA.points.S.positionLabel = 'left'
            anglesA.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.B) > 70) {
            anglesB.points.S.positionLabel = 'left'
            anglesB.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.O) > 70) {
            anglesA.points.X.positionLabel = 'left'
            anglesB.points.OX.positionLabel = 'left'
          }
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.7
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].opaciteDeRemplissage = 0.7
          }
          const ab = choice([
            choice(['aa', 'bb', 'cc', 'dd']),
            choice(['ca', 'db']),
          ])
          const a = ab[0]
          const b = ab[1]
          objetsEnonce.push(
            // anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.As,
            labelPoint(anglesA.points.S),
            labelPoint(anglesA.points.T),
            labelPoint(anglesA.points.X),
            labelPoint(anglesB.points.S),
            labelPoint(anglesB.points.T),
            labelPoint(anglesB.points.OX),
            labelPoint(anglesA.points.A),
            labelPoint(anglesB.points.A),
          )
          if (nommerParPoints) {
            objetsEnonce.push(...traitsPositionExtremites(anglesA, anglesB))
          }
          const paramsEnonce = fixeBordures(
            [
              ...objetsEnonce,
              ...objetsAnglesSecantes(anglesA),
              ...objetsAnglesSecantes(anglesB),
            ],
            { rzoom: 1.5 },
          )
          // On copie tout le contenu de objetsEnonce dans objetsCorrection
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })

          anglesB.arcs[b].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML(orangeMathalea)
          objetsCorrection.push(anglesB.arcs[b])
          objetsCorrection.push(anglesA.arcs[a])

          // ici sont créés les texte, tex_corr, objets mathalea2d divers entrant dans le contenu de l'exercice
          let reponse
          if (a === b) {
            reponse = 'correspondant'
          } else if (a + b === 'ca' || a + b === 'db') {
            reponse = 'alterne-interne'
          }
          let texte = `Quel est l'angle ${reponse} à l'angle $\\widehat{${anglesA.arcs[a].nom}}$ ?<br>`
          let texteCorr = mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsCorrection,
          )
          texteCorr += `L'angle ${reponse} à l'angle $${miseEnEvidence('\\widehat{' + anglesA.arcs[a].nom + '}', bleuMathalea)}$ est $${miseEnEvidence('\\widehat{' + anglesB.arcs[b].nom + '}')}$.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          propositions.push({
            texte: `$\\widehat{${anglesB.arcs.a.nom}}$`,
            statut: anglesB.arcs[b].nom === anglesB.arcs.a.nom,
          })
          propositions.push({
            texte: `$\\widehat{${anglesB.arcs.b.nom}}$`,
            statut: anglesB.arcs[b].nom === anglesB.arcs.b.nom,
          })
          propositions.push({
            texte: `$\\widehat{${anglesB.arcs.c.nom}}$`,
            statut: anglesB.arcs[b].nom === anglesB.arcs.c.nom,
          })
          propositions.push({
            texte: `$\\widehat{${anglesB.arcs.d.nom}}$`,
            statut: anglesB.arcs[b].nom === anglesB.arcs.d.nom,
          })
          break
        }
        case 3: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'A',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '70>O-A>30 and 70>O-B>30 and abs(A-B)<45'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number) => ({
              O,
              A,
              B: A,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(randint(0, 90), randint(-90, 90))
          } while (!(param.O - param.A < 70 && param.O - param.A > 30))
          /* const ab = aleaVariables(
            {
              a: 'randomInt(0,3)',
              b: 'randomInt(0,3)',
              test: 'a!=b and (a!=2 or b!=0) and (a!=3 or b!=1)'
            }
          ) */
          let ab
          do {
            const createVariables = (a: number, b: number) => ({
              a,
              b,
            })

            ab = createVariables(randint(0, 3), randint(0, 3))
          } while (!(
            ab.a !== ab.b &&
            (ab.a !== 2 || ab.b !== 0) &&
            (ab.a !== 3 || ab.b !== 1)
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          nommeExtremites(anglesA, anglesB, nommerParPoints)
          const nameAngles = [
            'S A X'.split(' '),
            'X A T'.split(' '),
            'T A OX'.split(' '),
            'OX A S'.split(' '),
          ]
          nameAngles.forEach(function (n, i) {
            const angleA = anglesA.arcs[['a', 'b', 'c', 'd'][i]]
            const angleB = anglesB.arcs[['a', 'b', 'c', 'd'][i]]
            angleA.nom = ''
            angleB.nom = ''
            for (let j = 0; j < 3; j++) {
              angleA.nom += anglesA.points[n[j]].nom
              angleB.nom += anglesB.points[n[j]].nom
            }
          })
          if (Math.abs(param.A) > 70) {
            anglesA.points.S.positionLabel = 'left'
            anglesA.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.B) > 70) {
            anglesB.points.S.positionLabel = 'left'
            anglesB.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.O) > 70) {
            anglesA.points.X.positionLabel = 'left'
            anglesB.points.OX.positionLabel = 'left'
          }
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.4
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].opaciteDeRemplissage = 0.4
          }
          const a = ['a', 'b', 'c', 'd'][ab.a]
          const b = ['a', 'b', 'c', 'd'][ab.b]
          const epsilon = randint(-2, 2, 0)
          anglesA.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + epsilon + '°',
            anglesA.points.s,
            anglesA.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.x,
            anglesA.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesA.labels.labelc = texteSurArc(
            ((param.O - param.A + epsilon) % 180) + '°',
            anglesA.points.t,
            anglesA.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.Ox,
            anglesA.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.s,
            anglesB.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.x,
            anglesB.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labelc = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.t,
            anglesB.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.Ox,
            anglesB.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.arcs[b],
            anglesB.As,
            anglesA.labels['label' + a],
            anglesB.labels['label' + b],
            labelPoint(anglesA.points.S),
            labelPoint(anglesA.points.T),
            labelPoint(anglesA.points.X),
            labelPoint(anglesB.points.S),
            labelPoint(anglesB.points.T),
            labelPoint(anglesB.points.OX),
            labelPoint(anglesA.points.A),
            labelPoint(anglesB.points.A),
          )
          if (nommerParPoints) {
            objetsEnonce.push(...traitsPositionExtremites(anglesA, anglesB))
          }
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          let angles = ''
          let calculs: string | undefined
          anglesA.arcs[a].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML('red')
          anglesA.labels.labela.color = colorToLatexOrHTML('red')
          anglesA.labels.labelb.color = colorToLatexOrHTML('red')
          anglesA.labels.labelc.color = colorToLatexOrHTML('red')
          anglesA.labels.labeld.color = colorToLatexOrHTML('red')
          anglesB.labels.labela.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelb.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelc.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labeld.color = colorToLatexOrHTML(bleuMathalea)
          switch (a + b) {
            case 'ab':
            case 'ad':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              break
            case 'ac':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              break
            case 'ba':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'bc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelc.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'bd':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              break
            case 'cb':
            case 'cd':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              break
            case 'da':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              break
            case 'dc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelc.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              angles = 'alternes-internes'
              break
          }

          const paramsEnonce = fixeBordures([
            ...objetsEnonce,
            ...objetsAnglesSecantes(anglesA),
            ...objetsAnglesSecantes(anglesB),
          ])
          let texte = `Les droites $(${anglesA.points.S.nom}${anglesA.points.T.nom})$ et $(${anglesB.points.S.nom}${anglesB.points.T.nom})$ sont-elles parallèles ?<br>`
          let sont, coord
          if (epsilon !== 0) {
            coord = 'mais pas'
            sont = 'ne sont pas'
          } else {
            coord = 'et'
            sont = 'sont'
          }
          const nomAngleSolution =
            angles !== 'alternes-internes'
              ? anglesB.arcs[a].nom
              : a === 'c'
                ? anglesB.arcs.a.nom
                : anglesB.arcs.b.nom
          const texteCorr =
            mathalea2d(
              Object.assign({ scale: 0.4 }, paramsEnonce),
              objetsCorrection,
            ) +
            `${calculs !== undefined ? calculs : `Les angles $\\widehat{${anglesB.arcs[a].nom}}$ et $\\widehat{${anglesB.arcs[b].nom}}$ sont opposés par le sommet, donc ils sont de même mesure.`}<br>
          Donc les angles $${miseEnEvidence('\\widehat{' + anglesA.arcs[a].nom + '}', 'red')}$ et $${miseEnEvidence('\\widehat{' + nomAngleSolution + '}', 'green')}$ sont ${angles} ${texteGras(coord + ' de même mesure')}.<br>
          Donc les droites $(${anglesA.points.S.nom}${anglesA.points.T.nom})$ et $(${anglesB.points.S.nom}${anglesB.points.T.nom})$ ${texteEnCouleurEtGras(sont + ' parallèles')}.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          propositions.push({
            texte: 'Oui',
            statut: epsilon === 0,
          })
          propositions.push({
            texte: 'Non',
            statut: epsilon !== 0,
          })
          break
        }
        case 5: {
          const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
          const objetsCorrection = [] // Idem pour la correction
          /* const param = aleaVariables(
            {
              O: 'randomInt(0,90)',
              A: 'randomInt(-90,90)',
              B: 'A',
              r1: 'pickRandom([1.5,2])',
              r2: 'pickRandom([1.5,2])',
              test: '70>O-A>30 and 70>O-B>30 and abs(A-B)<45'
            }
          ) */
          let param
          do {
            const createVariables = (O: number, A: number) => ({
              O,
              A,
              B: A,
              r1: choice([1.5, 2]),
              r2: choice([1.5, 2]),
            })

            param = createVariables(randint(0, 90), randint(-90, 90))
          } while (!(param.O - param.A < 70 && param.O - param.A > 30))
          /* const ab = aleaVariables(
            {
              a: 'randomInt(0,3)',
              b: 'randomInt(0,3)',
              test: 'a!=b and (a!=2 or b!=0) and (a!=3 or b!=1)'
            }
          ) */
          let ab
          do {
            const createVariables = (a: number, b: number) => ({
              a,
              b,
            })

            ab = createVariables(randint(0, 3), randint(0, 3))
          } while (!(
            ab.a !== ab.b &&
            (ab.a !== 2 || ab.b !== 0) &&
            (ab.a !== 3 || ab.b !== 1)
          ))

          const O = pointAbstrait(0, 0)
          const anglesA = anglesSecantes(
            homothetie(rotation(pointAbstrait(1, 0), O, param.O), O, param.r1),
            { O: param.O, A: param.A },
          )
          const anglesB = anglesSecantes(
            homothetie(
              rotation(pointAbstrait(1, 0), O, param.O + 180),
              O,
              param.r2,
            ),
            { O: param.O, A: param.B },
          )
          const secante = droite(anglesA.points.A, anglesB.points.A)
          nommeExtremites(anglesA, anglesB, nommerParPoints)
          const nameAngles = [
            'S A X'.split(' '),
            'X A T'.split(' '),
            'T A OX'.split(' '),
            'OX A S'.split(' '),
          ]
          nameAngles.forEach(function (n, i) {
            const angleA = anglesA.arcs[['a', 'b', 'c', 'd'][i]]
            const angleB = anglesB.arcs[['a', 'b', 'c', 'd'][i]]
            angleA.nom = ''
            angleB.nom = ''
            for (let j = 0; j < 3; j++) {
              angleA.nom += anglesA.points[n[j]].nom
              angleB.nom += anglesB.points[n[j]].nom
            }
          })
          if (Math.abs(param.A) > 70) {
            anglesA.points.S.positionLabel = 'left'
            anglesA.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.B) > 70) {
            anglesB.points.S.positionLabel = 'left'
            anglesB.points.T.positionLabel = 'left'
          }
          if (Math.abs(param.O) > 70) {
            anglesA.points.X.positionLabel = 'left'
            anglesB.points.OX.positionLabel = 'left'
          }
          for (const i of ['a', 'b', 'c', 'd']) {
            anglesA.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesA.arcs[i].opaciteDeRemplissage = 0.4
            anglesB.arcs[i].couleurDeRemplissage = context.isAmc
              ? colorToLatexOrHTML('none')
              : colorToLatexOrHTML(bleuMathalea)
            anglesB.arcs[i].opaciteDeRemplissage = 0.4
          }
          const a = ['a', 'b', 'c', 'd'][ab.a]
          const b = ['a', 'b', 'c', 'd'][ab.b]
          const epsilon = 0
          anglesA.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + epsilon + '°',
            anglesA.points.s,
            anglesA.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.x,
            anglesA.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesA.labels.labelc = texteSurArc(
            ((param.O - param.A + epsilon) % 180) + '°',
            anglesA.points.t,
            anglesA.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesA.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A) + epsilon) % 180) + '°',
            anglesA.points.Ox,
            anglesA.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labela = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.s,
            anglesB.points.x,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labelb = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.x,
            anglesB.points.t,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          anglesB.labels.labelc = texteSurArc(
            ((param.O - param.A) % 180) + '°',
            anglesB.points.t,
            anglesB.points.Ox,
            param.O - param.A,
            'black',
            0.7,
          )
          anglesB.labels.labeld = texteSurArc(
            ((180 - (param.O - param.A)) % 180) + '°',
            anglesB.points.Ox,
            anglesB.points.s,
            180 - (param.O - param.A),
            'black',
            0.7,
          )
          objetsEnonce.push(
            anglesA.arcs[a],
            anglesA.As,
            secante,
            anglesB.As,
            anglesA.labels['label' + a],
            labelPoint(anglesA.points.S),
            labelPoint(anglesA.points.T),
            labelPoint(anglesA.points.X),
            labelPoint(anglesB.points.S),
            labelPoint(anglesB.points.T),
            labelPoint(anglesB.points.OX),
            labelPoint(anglesA.points.A),
            labelPoint(anglesB.points.A),
            // anglesB.labels['label' + b]
          )
          if (nommerParPoints) {
            objetsEnonce.push(...traitsPositionExtremites(anglesA, anglesB))
          }
          objetsEnonce.forEach((objet) => {
            objetsCorrection.push(objet)
          })
          objetsCorrection.push(anglesB.labels['label' + b])
          objetsCorrection.push(anglesB.arcs[b])
          let angles = ''
          let calculs: string | undefined
          let mesure = ''
          anglesA.arcs[a].couleurDeRemplissage = context.isAmc
            ? colorToLatexOrHTML('none')
            : colorToLatexOrHTML('red')
          anglesA.labels.labela.color = colorToLatexOrHTML('red')
          anglesA.labels.labelb.color = colorToLatexOrHTML('red')
          anglesA.labels.labelc.color = colorToLatexOrHTML('red')
          anglesA.labels.labeld.color = colorToLatexOrHTML('red')
          anglesB.labels.labela.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelb.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labelc.color = colorToLatexOrHTML(bleuMathalea)
          anglesB.labels.labeld.color = colorToLatexOrHTML(bleuMathalea)

          switch (a + b) {
            case 'ab':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labelb.texte
              break
            case 'ac':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              mesure = anglesB.labels.labela.texte
              break
            case 'ad':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labeld.texte
              break
            case 'ba':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              mesure = anglesB.labels.labela.texte
              break
            case 'bc':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelc.texte, 'green')}$`
              mesure = anglesB.labels.labelc.texte
              break
            case 'bd':
              anglesB.arcs[a].couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'correspondants'
              mesure = anglesB.labels.labelb.texte
              break
            case 'cb':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelb.texte, 'green')}$`
              mesure = anglesB.labels.labelb.texte
              break
            case 'cd':
              anglesB.arcs.a.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'a'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'a'],
                anglesB.arcs.a,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labela.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labeld.texte, 'green')}$`
              mesure = anglesB.labels.labeld.texte
              break
            case 'da':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              angles = 'alternes-internes'
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labela.texte, 'green')}$`
              mesure = anglesB.labels.labela.texte
              break
            case 'dc':
              anglesB.arcs.b.couleurDeRemplissage = context.isAmc
                ? colorToLatexOrHTML('none')
                : colorToLatexOrHTML('green')
              anglesB.labels['label' + 'b'].color = colorToLatexOrHTML('green')
              objetsCorrection.push(
                anglesB.labels['label' + 'b'],
                anglesB.arcs.b,
              )
              calculs = `$180°-${miseEnEvidence(anglesB.labels.labelb.texte, bleuMathalea)} = ${miseEnEvidence(anglesB.labels.labelc.texte, 'green')}$`
              angles = 'alternes-internes'
              mesure = anglesB.labels.labelc.texte
              break
          }
          const paramsEnonce = fixeBordures([
            ...objetsEnonce,
            ...objetsAnglesSecantes(anglesA),
            ...objetsAnglesSecantes(anglesB),
          ])
          let texte = `Sachant que les droites $(${anglesA.points.S.nom}${anglesA.points.T.nom})$ et $(${anglesB.points.S.nom}${anglesB.points.T.nom})$ sont parallèles, en déduire la mesure de l'angle $\\widehat{${anglesB.arcs[b].nom}}$.<br>`
          const nomAngleSolution =
            angles !== 'alternes-internes'
              ? anglesB.arcs[a].nom
              : a === 'c'
                ? anglesB.arcs.a.nom
                : anglesB.arcs.b.nom
          let texteCorr = mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsCorrection,
          )
          texteCorr += `Les angles $${miseEnEvidence('\\widehat{' + anglesA.arcs[a].nom + '}', 'red')}$ et $${miseEnEvidence('\\widehat{' + nomAngleSolution + '}', 'green')}$ sont ${texteGras(angles)} et formés par des droites ${texteGras('parallèles')}.
          Donc ils sont ${texteGras('de même mesure')}.<br>
          De plus,${calculs !== undefined ? calculs : ` les angles $\\widehat{${anglesB.arcs[a].nom}}$ et $\\widehat{${anglesB.arcs[b].nom}}$ et vert sont opposés par le sommet.<br> Donc ils sont de même mesure.`}<br>
          Donc l'angle $${miseEnEvidence('\\widehat{' + anglesB.arcs[b].nom + '}', bleuMathalea)}$ mesure $${miseEnEvidence(mesure)}$.`
          texte += mathalea2d(
            Object.assign({ scale: 0.4 }, paramsEnonce),
            objetsEnonce,
          )
          exercice = { texte, texteCorr }
          const valMesure = Number(mesure.slice(0, mesure.length - 1))
          const valSupplementaireMesure = 180 - valMesure
          const valMesureDizaines = Math.floor(valMesure / 10)
          const valMesuresUnites = valMesure % 10
          const valDistracteur =
            valMesure % 10 === 5
              ? valMesure + choice([-1, 1]) * randint(1, 4)
              : valMesureDizaines * 10 + (10 - valMesuresUnites)
          const supplementaireDistracteur = 180 - valDistracteur
          propositions.push({
            texte: mesure,
            statut: true,
          })
          propositions.push({
            texte: valSupplementaireMesure.toString() + '°',
            statut: false,
          })
          propositions.push({
            texte: valDistracteur.toString() + '°',
            statut: false,
          })
          propositions.push({
            texte: supplementaireDistracteur.toString() + '°',
            statut: false,
          })
          options = { ordered: false }
          break
        }
      }
      // Les lignes ci-dessous permettent d'avoir un affichage aux dimensions optimisées
      if (this.questionJamaisPosee(i, exercice.texte)) {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            options: { barreseparation: true, numerotationEnonce: true }, // facultatif.
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    numQuestionVisible: false,
                    statut:
                      Number(nquestion[i]) < 6 && Number(nquestion[i]) > 1
                        ? 3
                        : 1, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    //    enonce: figure[3][0] + mathalea2d(figure[1], figure[0]) + '<br>' + figure[3][1] + ' Justifier la réponse.' // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                    enonce: exercice.texte, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          this.autoCorrection[i] = {
            enonce: exercice.texte,
            propositions,
            options,
          }
        }
        const monQcm = propositionsQcm(this, i)
        if (this.interactif) {
          exercice.texte = exercice.texte + monQcm.texte
        }
        this.listeQuestions[i] = exercice.texte
        this.listeCorrections[i] = exercice.texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
