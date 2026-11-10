import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import {
  Arete,
  FacePrisme,
  patronEnS,
  patronEnT,
  patronHasard,
  type AreteDuPatron,
} from '../../modules/PatronsPrismes'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Reporter des longueurs sur un patron de pavé droit'

export const dateDePublication = '25/06/2026'

export const uuid = '75a8c'
export const refs = {
  'fr-fr': ['5G2B-2'],
  'fr-2016': ['5G52-2'],
  'fr-ch': ['10CTES1B-2', '10LCES1B-2', '10LSES1B-2', 'PRQES07B-2', 'PRQES07D-3'],
}
/**
 * report de longueur sur un patron de pavé droit
 * @author Olivier Mimeau
 */
export default class longueurPatronPaveDroit extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : report de longueurs sur un patron : construction, pas de réponse courte.
    this.reponseCourteDisponible = false

    this.besoinFormulaireTexte = [
      'Type de patrons',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Patrons simples',
        '2 : Patrons moins simples',
      ].join('\n'),
    ]
    this.sup = '0'
    this.besoinFormulaire2Texte = [
      'Type de longueur à chercher',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Arête directe',
        '2 : Arête indirecte',
      ].join('\n'),
    ]
    this.sup2 = '0'
    this.besoinFormulaire3Texte = [
      'Nombre de longueurs à chercher',
      ['Nombres entre 1 et 3 séparés par des tirets :', '0 : Mélange'].join(
        '\n',
      ),
    ]
    this.sup3 = '0'
    this.besoinFormulaire4CaseACocher = [`Schéma dans l'énoncé`, true]
    this.sup4 = true
    this.consigne = ``
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const schema = this.sup4
    if (this.nbQuestions === 1) {
      this.consigne = `Le patron ci-dessous est ${schema ? 'le schéma ' : 'celui '} d'un patron de pavé droit. Compléter les longueurs manquantes.`
    } else {
      this.consigne = `Les patrons ci-dessous sont des ${schema ? 'schémas de' : ' '} patrons de pavé droit. Compléter les longueurs manquantes.`
    }
    const typeQuestionsDisponibles = ['TouS', 'AuPif']
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const typeDemandeDisponibles = ['Directe', 'Indirecte']
    const typeDeDemandeDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typeDemandeDisponibles,
      nbQuestions: this.nbQuestions * 3,
    })
    const listeTypeDeDemande = combinaisonListes(
      typeDeDemandeDisponibles,
      this.nbQuestions * 3,
    )
    const nbLongueursDisponibles = ['1', '2', '3']
    const nbdeLongueursDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 3,
      melange: 0,
      defaut: 0,
      listeOfCase: nbLongueursDisponibles,
      nbQuestions: this.nbQuestions,
    })
    const nbLongueurs = combinaisonListes(
      nbdeLongueursDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const numerotationFaces: 'sans' | 'standard' | 'hasard' = 'standard' //'hasard'
      const nbLongueursDemandee: number = +nbLongueurs[i]
      const dimensions: number[] = []
      dimensions[0] = randint(2, 5) //hauteurPrisme
      dimensions[1] = randint(2, 5, [dimensions[0]]) //largeur
      dimensions[2] = randint(dimensions[1] + 1, dimensions[1] + 5, [
        dimensions[0],
      ]) //longueur
      const dimSchema = combinaisonListes([3, 3.4, 3.6], 3)
      const dimensionsSchema: number[] = []
      dimensionsSchema[0] = schema ? dimSchema[0] : dimensions[0]
      dimensionsSchema[1] = schema ? dimSchema[1] : dimensions[1]
      dimensionsSchema[2] = schema ? dimSchema[2] : dimensions[2]
      const nbSommetBase = 4
      const listeCotesBase = [
        dimensionsSchema[2],
        dimensionsSchema[1],
        dimensionsSchema[2],
      ]
      const listeAnglesBase = [90, 90]
      let base1: FacePrisme = new FacePrisme(
        1,
        4,
        listeCotesBase,
        listeAnglesBase,
        true,
      )
      switch (listeTypeQuestions[i]) {
        case 'TouS':
          {
            const genrePatron = choice(['EnT', 'EnS'])
            switch (genrePatron) {
              case 'EnT':
                {
                  base1 = patronEnT(
                    nbSommetBase,
                    dimensionsSchema[0],
                    listeCotesBase,
                    listeAnglesBase,
                    {
                      angleDeDepart: 0,
                      horizontal: 'horizontal',
                      tNumerotation: numerotationFaces,
                    },
                  )
                }
                break
              case 'EnS':
                {
                  base1 = patronEnS(
                    nbSommetBase,
                    dimensionsSchema[0],
                    listeCotesBase,
                    listeAnglesBase,
                    {
                      angleDeDepart: 0,
                      horizontal: 'horizontal',
                      tNumerotation: numerotationFaces,
                    },
                  )
                }
                break
            }
          }
          break
        case 'AuPif':
          {
            let enLigne = true
            let k = 0
            while (enLigne && k < 50) {
              base1 = patronHasard(
                nbSommetBase,
                dimensionsSchema[0],
                listeCotesBase,
                listeAnglesBase,
                {
                  angleDeDepart: 0,
                  horizontal: 'horizontal',
                  enT: false,
                  enS: false,
                  tNumerotation: numerotationFaces,
                },
              )
              enLigne = quatreEnLigne(base1)
              k++
            }
          }
          break
        case 'type3':
        default:
          texte += `Question ${i + 1} par defaut merci de signaler le problème<br>`
          texteCorr = `Correction ${i + 1} de type 3`
          break
      }
      const lesDessins: ObjetMathalea2D[] = base1.patron('sans', 'sans')
      const lesDessinsCorr: ObjetMathalea2D[] = base1.patron('sans', 'sans')
      const lesBases = base1.trouverDeuxiemeBase()
      const numBase2 = lesBases[0] ? lesBases[0]?.numFace : 0
      const lesSegments: {
        longDepart: ExtremitesSegment
        longAChercher: ExtremitesSegment
        typedeRecherche: string
        longNum: number
      }[] = []
      for (let j = 0; j < 3; j++) {
        lesSegments[j] = fixeCotesQuestionReponse(
          base1,
          dimensionsSchema[j],
          numBase2,
          dimensions[j],
          `${listeTypeDeDemande[i * 3 + j]}`,
        )
      }
      const lesSegmentsMelanges = combinaisonListes(lesSegments, 3)
      for (let j = 0; j < 3; j++) {
        lesDessins.push(
          placeLatexSurSegment(
            `${texNombre(lesSegmentsMelanges[j].longNum, 1)}\\text{ cm}`,
            lesSegmentsMelanges[j].longDepart.ext1,
            lesSegmentsMelanges[j].longDepart.ext2,
          ),
        )
        lesDessinsCorr.push(
          placeLatexSurSegment(
            `${texNombre(lesSegmentsMelanges[j].longNum, 1)}\\text{ cm}`,
            lesSegmentsMelanges[j].longDepart.ext1,
            lesSegmentsMelanges[j].longDepart.ext2,
            { distance: 0.8 },
          ),
        )
      }
      if (this.interactif) {
        const inputs = []
        for (let j = 0; j < nbLongueursDemandee; j++) {
          const coordM = coordMultiMathsFieldSurSegment(
            lesSegmentsMelanges[j].longAChercher.ext1,
            lesSegmentsMelanges[j].longAChercher.ext2,
            1,
          )
          inputs.push({
            content: `%{champ1}\\text{ cm}`, // champ1 est à utiliser systématiquement pour tous les inputs
            x: coordM.x,
            y: coordM.y,
            classe: '', // Ici on pourra mettre le clavier à utiliser
            blanc: '\\ldots ',
            opacity: 1,
            index: j,
          })
        }
        const qMetaInteractif = new MetaInteractif2d(inputs, {
          exercice: this,
          question: i,
        })
        const elementsHandleAns = { bareme: toutPourUnPoint }
        Object.assign(elementsHandleAns, {
          field0: {
            value: texNombre(lesSegmentsMelanges[0].longNum, 1),
          },
        })
        if (nbLongueursDemandee > 1) {
          Object.assign(elementsHandleAns, {
            field1: {
              value: texNombre(lesSegmentsMelanges[1].longNum, 1),
            },
          })
        }
        if (nbLongueursDemandee > 2) {
          Object.assign(elementsHandleAns, {
            field2: {
              value: texNombre(lesSegmentsMelanges[2].longNum, 1),
            },
          })
        }
        handleAnswers(this, i, elementsHandleAns, {
          formatInteractif: 'MetaInteractif2d',
        })
        lesDessins.push(qMetaInteractif)
      } else {
        for (let j = 0; j < nbLongueursDemandee; j++) {
          lesDessins.push(
            placeLatexSurSegment(
              '\\text{.......}',

              lesSegmentsMelanges[j].longAChercher.ext1,
              lesSegmentsMelanges[j].longAChercher.ext2,
            ),
          )
        }
      }
      for (let j = 0; j < nbLongueursDemandee; j++) {
        lesDessinsCorr.push(
          placeLatexSurSegment(
            `${texNombre(lesSegmentsMelanges[j].longNum, 1)}\\text{ cm}`,
            lesSegmentsMelanges[j].longAChercher.ext1,
            lesSegmentsMelanges[j].longAChercher.ext2,
            { distance: 0.8 },
          ),
        )
      }
      lesDessinsCorr.push(...base1.codageCotes())
      texte += mathalea2d(
        Object.assign(
          {
            display: 'block', //'inline-block',
            scale: 0.4,
            id: '' /* `correction1Ex${this.numeroExercice}Q${i}` */,
          } as const,
          fixeBordures(lesDessins),
        ),
        lesDessins,
      )
      texteCorr += mathalea2d(
        Object.assign(
          {
            display: 'block', //'inline-block',
            scale: 0.4,
            id: '' /* `correction1Ex${this.numeroExercice}Q${i}` */,
          } as const,
          fixeBordures(lesDessinsCorr),
        ),
        lesDessinsCorr,
      )
      /* if (this.interactif) {
        texte += '<br>'
      } */

      if (
        this.questionJamaisPosee(
          i,
          ...dimensions,
          listeTypeQuestions[i],
          listeTypeDeDemande[i],
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

type coord = { x: number; y: number }
type ExtremitesSegment = { ext1: PointAbstrait; ext2: PointAbstrait }

function extSegment(cote: AreteDuPatron, numbase2: number): ExtremitesSegment {
  let exta: PointAbstrait
  let extb: PointAbstrait
  if (cote.face.numFace === numbase2) {
    exta = cote.face.sommeti(cote.numArete)
    extb = cote.face.sommeti(cote.numArete + 1)
  } else {
    exta = cote.face.sommeti(cote.numArete + 1)
    extb = cote.face.sommeti(cote.numArete)
  }
  return { ext1: exta, ext2: extb }
}

function sommetCommun(arete1: AreteDuPatron, arete2: AreteDuPatron): boolean {
  return (
    memeCoord(
      coordApprox(arete1, arete1.numArete),
      coordApprox(arete2, arete2.numArete),
    ) ||
    memeCoord(
      coordApprox(arete1, arete1.numArete),
      coordApprox(arete2, arete2.numArete + 1),
    ) ||
    memeCoord(
      coordApprox(arete1, arete1.numArete + 1),
      coordApprox(arete2, arete2.numArete),
    ) ||
    memeCoord(
      coordApprox(arete1, arete1.numArete + 1),
      coordApprox(arete2, arete2.numArete + 1),
    )
  )
}

function quatreEnLigne(faceDepart: FacePrisme): boolean {
  function combienDeFacesParLa(
    faceDepart: FacePrisme,
    numArete: number,
  ): number {
    let areteEnCours = faceDepart.aretesi(numArete)
    let nbFaceEnligne = 0
    while (areteEnCours.connectee) {
      areteEnCours = areteEnCours.autreFace.aretesi(areteEnCours.autreArete + 2)
      nbFaceEnligne++
    }
    return nbFaceEnligne
  }
  let result =
    1 +
      combienDeFacesParLa(faceDepart, 0) +
      combienDeFacesParLa(faceDepart, 2) >
    3
  result =
    result ||
    1 +
      combienDeFacesParLa(faceDepart, 1) +
      combienDeFacesParLa(faceDepart, 3) >
      3
  return result
}

function TrouveAreteEnFace(
  arete1: AreteDuPatron,
  listeAretes: AreteDuPatron[],
): number {
  const num = arete1.numArete + 2
  let AreteEnCours: Arete = arete1.face.aretesi(num)
  let faceEnCours = arete1.face

  let i = 0
  while (i < 12 && AreteEnCours.connectee) {
    faceEnCours = AreteEnCours.autreFace
    AreteEnCours = AreteEnCours.autreFace.aretesi(AreteEnCours.autreArete + 2)
    i++
  }

  let match = 0
  while (
    match < listeAretes.length &&
    (listeAretes[match].face !== faceEnCours ||
      listeAretes[match].numArete !== AreteEnCours.numero)
  ) {
    match++
  }
  if (match === listeAretes.length) {
    match = -1
  }

  return match
}

function coordApprox(arete: AreteDuPatron, num: number): coord {
  return {
    x: arrondi(arete.face.sommeti(num).x, 3),
    y: arrondi(arete.face.sommeti(num).y, 3),
  }
}

function memeCoord(pt1: coord, pt2: coord): boolean {
  return pt1.x === pt2.x && pt1.y === pt2.y
}

function fixeCotesQuestionReponse(
  face: FacePrisme,
  longAchercherSurSchema: number,
  numBase2: number,
  longAchercher: number,
  typeLongAChercher: string,
): {
  longDepart: ExtremitesSegment
  longAChercher: ExtremitesSegment
  typedeRecherche: string
  longNum: number
} {
  let aretesTrouvees: AreteDuPatron[] = []
  aretesTrouvees = face.trouveToutesAretesSurBordDeLongueur(
    longAchercherSurSchema,
  )

  const choixCoteConnu = randint(1, aretesTrouvees.length - 1)
  const coteConnu = aretesTrouvees.splice(choixCoteConnu, 1)[0]

  const aretesDirectes: AreteDuPatron[] = []
  for (let j = 0; j < aretesTrouvees.length; j++) {
    if (sommetCommun(aretesTrouvees[j], coteConnu)) {
      aretesDirectes.push(aretesTrouvees[j])
      aretesTrouvees.splice(j, 1)
    }
  }

  const aretesEnface: AreteDuPatron[] = []
  const numEnFace = TrouveAreteEnFace(coteConnu, aretesTrouvees)
  if (numEnFace > -1) {
    aretesEnface.push(aretesTrouvees[numEnFace])
    aretesTrouvees.splice(numEnFace, 1)
  }

  let arete: AreteDuPatron = coteConnu
  let typeQuestion = ''
  if (aretesTrouvees.length > 0 && typeLongAChercher === 'Indirecte') {
    arete = choice(aretesTrouvees)
    typeQuestion = 'Indirecte'
  } else {
    const choix: string[] = []
    if (aretesEnface.length > 0) {
      choix.push('EnFace')
    }
    if (aretesDirectes.length > 0) {
      choix.push('Direct')
    }

    typeQuestion = choice(choix)

    if (typeQuestion === 'EnFace') {
      arete = choice(aretesEnface)
    } else {
      arete = choice(aretesDirectes)
    }
  }

  return {
    longDepart: extSegment(coteConnu, numBase2),
    longAChercher: extSegment(arete, numBase2),
    typedeRecherche: typeQuestion,
    longNum: longAchercher,
  }
}

function coordMultiMathsFieldSurSegment(
  A: PointAbstrait,
  B: PointAbstrait,
  distance: number = 0.7,
): { x: number; y: number } {
  // code copié de placeLatex2d(A, B, distance)
  // Milieu de [AB]
  const Mx = (A.x + B.x) / 2
  const My = (A.y + B.y) / 2
  // Vecteur AB
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len = Math.hypot(dx, dy)
  // Vecteur normal unitaire (perpendiculaire, orientation +90°)
  const nx = len > 1e-12 ? -dy / len : 0
  const ny = len > 1e-12 ? dx / len : 1
  // Point décalé à distance le long de la normale
  return { x: Mx + nx * distance, y: My + ny * distance }
}
