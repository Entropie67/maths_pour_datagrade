import { barycentre, nommePolygone } from '../../lib/2d/polygones'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
// import { angle, angleOriente, MarqueAngle, MarqueAngleDroit } from '../../lib/2d/angles'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
// import { afficheLongueurSegment, texteSurSegment, placeLatexSurSegment } from '../../lib/2d/codages'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'

import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  homothetie,
  similitude,
  symetrieAxiale,
} from '../../lib/2d/transformations'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'

import { markTypeArray, MarqueAngle } from '../../lib/2d/MarkType'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import {
  choice,
  combinaisonListes,
  shuffle,
  shuffleLettres,
} from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Calculer des longueurs avec des triangles semblables'
export const dateDePublication = '30/12/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '58a64'
export const refs = {
  'fr-fr': [''],
  'fr-ch': ['NR'],
}
/**
 * calcul de longueurs avec des triangles semblables
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.consigne =
      'Dans cet exercice, les marques identiques désignent des angles égaux.'
    this.besoinFormulaireTexte = [
      'Types de questions ',
      'Nombres séparés par des tirets :\n1: Valeurs entières coefficient entier ou égal à 0,5\n2: Valeurs décimales coefficient entier\n3: Valeurs décimales coefficient décimal',
    ]
    //    this.besoinFormulaire2CaseACocher = ['Pour les tests,décoréler completement les deux triangles']
    //    this.sup2 = false
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 3,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeDeNomsDePolygones: string[] = []
      let texte = ''
      let texteCorr = ''
      // longueurAB, longueurAC, longueurBC, coeff : dimension triangle 1 et coefficient de proportionalité
      let coeff: number
      let longueurAB: number
      let longueurAC: number
      let longueurBC: number
      switch (
        typeQuestionsDisponibles[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: {
          coeff = randint(1, 4) === 1 ? 5 : randint(2, 10)
          longueurAB = randint(3, 8)
          longueurAC = randint(4, 7, longueurAB)
          longueurBC = randint(5, Math.min(longueurAB + longueurAC - 2, 11), [
            longueurAB,
            longueurAC,
          ])
          break
        }
        case 2: {
          coeff = choice([2, 3, 4, 5, 10])
          switch (coeff) {
            case 3: {
              longueurAB = randint(3, 7) * 10 + randint(1, 3)
              break
            }
            case 4: {
              longueurAB = randint(3, 7) * 10 + randint(1, 2)
              break
            }
            case 5: {
              longueurAB = randint(3, 7) * 10 + randint(1, 2)
              break
            }
            default: {
              longueurAB = randint(3, 7) * 10 + randint(1, 9)
              break
            }
          }
          longueurAC = randint(40, 80, longueurAB)
          longueurBC = randint(
            50,
            Math.min(longueurAB + longueurAC - 20, 110),
            [longueurAB, longueurAC],
          )
          const cotesrslt = [longueurAB, longueurAC, longueurBC] // shuffle([longueurAB, longueurAC, longueurBC])
          longueurAB = cotesrslt[0] / 10
          longueurAC = cotesrslt[1] / 10
          longueurBC = cotesrslt[2] / 10
          break
        }
        case 3: {
          coeff = randint(2, 55, [10, 11, 9])
          if (coeff % 5 === 0) {
            longueurAB = randint(20, 40)
            longueurAC = randint(25, 45, longueurAB)
            longueurBC = randint(
              30,
              Math.min(longueurAB + longueurAC - 10, 55),
              [longueurAB, longueurAC],
            )
            longueurAB /= 5
            longueurAC /= 5
            longueurBC /= 5
          } else {
            if (coeff % 2 === 0) {
              longueurAB = randint(8, 16)
              longueurAC = randint(10, 18, longueurAB)
              longueurBC = randint(
                12,
                Math.min(longueurAB + longueurAC - 4, 22),
                [longueurAB, longueurAC],
              )
              longueurAB /= 2
              longueurAC /= 2
              longueurBC /= 2
            } else {
              longueurAB = randint(4, 8)
              longueurAC = randint(5, 9, longueurAB)
              longueurBC = randint(
                6,
                Math.min(longueurAB + longueurAC - 2, 11),
                [longueurAB, longueurAC],
              )
            }
          }
          const cotesrslt = shuffle([longueurAB, longueurAC, longueurBC])
          /*           const cotesrslt = shuffle(faitTriangle(longueurAB, longueurAC, longueurBC)) */
          longueurAB = cotesrslt[0]
          longueurAC = cotesrslt[1]
          longueurBC = cotesrslt[2]
          coeff /= 10
          break
        }
        default: {
          coeff = 1 // break
          longueurAB = 6
          longueurAC = 8
          longueurBC = 10
        }
      }

      // texte = `Type : ${typeQuestionsDisponibles[i]} :: Coeff ${coeff} ::`
      const longueurDE = longueurAB * coeff
      const motAgrandissementReduction =
        coeff > 1 ? "d'agrandissement" : 'de réduction'
      let A = pointAbstrait(0, 0)
      let B = pointAdistance(A, longueurAB, randint(-170, 170))
      let p1 = triangle2points2longueurs(A, B, longueurAC, longueurBC)
      // deuxieme triangle par similitude on peut effectuer sur le premier car les figures sont séparées à l'affichage
      const coeffFig1Fig2 = coeff
      //      if (this.sup2) { coeffFig1Fig2 = coeff > 1 ? choice([1.25, 1.3, 1.4]) : choice([0.8, 0.75, 0.65]) }
      const O = barycentre(p1)
      const angle = randint(70, 220 - coeffFig1Fig2 * 20)
      let p2 = similitude(p1, O, angle, coeffFig1Fig2)
      if (randint(0, 1) === 1) {
        const d0 = droite(A, B)
        p2 = symetrieAxiale(p2, d0)
      }
      const longueurMaxp1 = Math.max(longueurAB, longueurAC, longueurBC)

      // mettre les triangles à une taille correcte
      const tailleMaxFigure = 14 // en unite*2 sert pour sortie PDF
      const tailleMinFigure = 7
      const scaleDessin = 0.5 // Mais scale à 0.5 est mieux que 1
      const largeurCol = 50 // en % sert pour sortie PDF et HTML ?

      const [coeffModif1, coeffModif2] = tailleFigures(
        longueurMaxp1,
        coeffFig1Fig2,
        [tailleMaxFigure, tailleMinFigure],
      )

      if (coeffModif1 !== 1) {
        p1 = homothetie(p1, O, coeffModif1)
      }
      if (coeffModif2 !== 1) {
        p2 = homothetie(p2, O, coeffModif2)
      }
      // tenir compte des modifications pour sommets A et B puis declarer tous les sommets

      A = p1.listePoints[0]
      B = p1.listePoints[1]
      const C = p1.listePoints[2]
      const D = p2.listePoints[0]
      const E = p2.listePoints[1]
      const F = p2.listePoints[2]

      // shuffle... : afin d'avoir un codage qui ne suit pas d'ordre precis
      // const codeAnglesHomologues = combinaisonListes(markTypeArray, 3) // shuffle(['|', '||', 'X'])
      const codeAnglesHomologues = combinaisonListes(
        markTypeArray.slice(1, 4),
        3,
      )
      const RayonAngle = 1
      const codeAngleA = new MarqueAngle(B, A, C, {
        mark: codeAnglesHomologues[0],
        rayon: RayonAngle,
      })
      const codeAngleD = new MarqueAngle(E, D, F, {
        mark: codeAnglesHomologues[0],
        rayon: RayonAngle,
      })
      const codeAngleB = new MarqueAngle(A, B, C, {
        mark: codeAnglesHomologues[1],
        rayon: RayonAngle,
      })
      const codeAngleE = new MarqueAngle(D, E, F, {
        mark: codeAnglesHomologues[1],
        rayon: RayonAngle,
      })
      const codeAngleC = new MarqueAngle(B, C, A, {
        mark: codeAnglesHomologues[2],
        rayon: RayonAngle,
      })
      const codeAngleF = new MarqueAngle(E, F, D, {
        mark: codeAnglesHomologues[2],
        rayon: RayonAngle,
      })
      // affiche la longueur à l'exterieur du triangle

      const codeAB =
        angleOriente(C, A, B) > 0
          ? placeLatexSurSegment(`${texNombre(longueurAB, 1)}\\text{ cm}`, A, B)
          : placeLatexSurSegment(`${texNombre(longueurAB, 1)}\\text{ cm}`, B, A)
      const codeAC =
        angleOriente(B, C, A) > 0
          ? placeLatexSurSegment(`${texNombre(longueurAC, 1)}\\text{ cm}`, C, A)
          : placeLatexSurSegment(`${texNombre(longueurAC, 1)}\\text{ cm}`, A, C)
      const codeBC =
        angleOriente(A, B, C) > 0
          ? placeLatexSurSegment(`${texNombre(longueurBC, 1)}\\text{ cm}`, B, C)
          : placeLatexSurSegment(`${texNombre(longueurBC, 1)}\\text{ cm}`, C, B)
      const codeDE =
        angleOriente(F, D, E) > 0
          ? placeLatexSurSegment(`${texNombre(longueurDE, 1)}\\text{ cm}`, D, E)
          : placeLatexSurSegment(`${texNombre(longueurDE, 1)}\\text{ cm}`, E, D)
      // shuffleLettres : afin d'avoir l'ordre alphabetique mais pas pour les points homologues
      const nom1 = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom1)
      const nom2 = shuffleLettres(creerNomDePolygone(3, listeDeNomsDePolygones))
      listeDeNomsDePolygones.push(nom2)
      const nommeP1 = nommePolygone(p1, nom1) // TEXTURSEGMENTS
      const nommeP2 = nommePolygone(p2, nom2)
      const objetsAAfficher1 = [
        p1,
        codeAngleA,
        codeAngleB,
        codeAngleC,
        codeAB,
        codeAC,
        codeBC,
        nommeP1,
      ]
      const objetsAAfficher2 = [
        p2,
        codeAngleD,
        codeAngleE,
        codeAngleF,
        codeDE,
        nommeP2,
      ]
      const bord1 = fixeBordures(objetsAAfficher1, {
        rxmin: -0.1,
        rymin: -0.1,
        rxmax: 0.1,
        rymax: 0.1,
      })
      const bord2 = fixeBordures(objetsAAfficher2, {
        rxmin: -0.1,
        rymin: -0.1,
        rxmax: 0.1,
        rymax: 0.1,
      })
      const colonne1 = mathalea2d(
        Object.assign(
          {
            /* pixelsParCm: 20,  */ scale: scaleDessin,
            optionsTikz: ['baseline=(current bounding box.north)'],
            mainlevee: false,
          },
          bord1,
        ),
        objetsAAfficher1,
      )
      const colonne2 = mathalea2d(
        Object.assign(
          {
            scale: scaleDessin,
            optionsTikz: ['baseline=(current bounding box.north)'],
            mainlevee: false,
          },
          bord2,
        ),
        objetsAAfficher2,
      )
      if (this.interactif && context.isHtml) {
        texte += `Donner les longueurs des segments $[${D.nom}${F.nom}]$ et $[${E.nom}${F.nom}]$.<br>`
        texte += deuxColonnesResp(colonne1, colonne2, {
          largeur1: largeurCol,
          eleId: '',
          widthmincol1: '0px',
          widthmincol2: '0px',
        })
        texte += remplisLesBlancs(
          this,
          i,
          `${D.nom}${F.nom} =  %{champ1}` +
            '\\text{ cm} ' +
            `${E.nom}${F.nom} =  %{champ2}` +
            '\\text{ cm}',
          KeyboardType.clavierNumbers,
          '\\ldots\\ldots',
        )
        handleAnswers(this, i, {
          bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
          champ1: { value: texNombre(longueurAC * coeff, 1) },
          champ2: { value: texNombre(longueurBC * coeff, 1) },
        })
      } else {
        texte += `Calculer les longueurs des segments $[${D.nom}${F.nom}]$ et $[${E.nom}${F.nom}]$. Justifier.<br>`
        texte += deuxColonnesResp(colonne1, colonne2, {
          largeur1: largeurCol,
          eleId: '',
          widthmincol1: '0px',
          widthmincol2: '0px',
        })
      }
      texteCorr = rediger(A, B, C, D, E, F, typeQuestionsDisponibles[i] === 3)
      if (typeQuestionsDisponibles[i] === 3) {
        texteCorr += `Le coefficient ${motAgrandissementReduction} est égal à $${texNombre(longueurDE, 1)} \\div  ${texNombre(longueurAB, 1)} = ${texNombre(coeff, 1)}$.<br>`
        texteCorr += `donc $${D.nom}${F.nom} = ${texNombre(coeff, 1)} \\times ${A.nom}${C.nom} = ${texNombre(coeff, 1)} \\times ${texNombre(longueurAC, 1)} = ${texNombre(longueurAC * coeff, 1)}\\text{ cm}$.<br>`
        texteCorr += `donc $${E.nom}${F.nom} = ${texNombre(coeff, 1)} \\times ${B.nom}${C.nom} = ${texNombre(coeff, 1)} \\times ${texNombre(longueurBC, 1)} = ${texNombre(longueurBC * coeff, 1)}\\text{ cm}$.`
      } else {
        texteCorr += `Les côtés $[${D.nom}${E.nom}]$ et $[${A.nom}${B.nom}]$ sont homologues et on remarque que $${D.nom}${E.nom} = ${texNombre(longueurDE, 1)}= ${texNombre(coeff, 1)} \\times ${texNombre(longueurAB, 1)}$.<br>`
        texteCorr += `donc $${D.nom}${F.nom} = ${texNombre(coeff, 1)} \\times ${A.nom}${C.nom} = ${texNombre(coeff, 1)} \\times ${texNombre(longueurAC, 1)} = ${texNombre(longueurAC * coeff, 1)}\\text{ cm}$.<br>`
        texteCorr += `donc $${E.nom}${F.nom} = ${texNombre(coeff, 1)} \\times ${B.nom}${C.nom} = ${texNombre(coeff, 1)} \\times ${texNombre(longueurBC, 1)} = ${texNombre(longueurBC * coeff, 1)}\\text{ cm}$.`
      }

      if (
        this.questionJamaisPosee(
          i,
          texte,
          longueurAB,
          longueurAC,
          longueurBC,
          coeff,
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
/* Faire entrer une figure et son image par similitude dans carré dans la taille est comprise entre deux valeurs
 * [number, number] Renvoit les coeffcient d'homothétie à appliquer sur chaque figure
 */

function tailleFigures(
  LongueurFig1: number,
  CoeffFig1Fig2: number,
  taille: [max: number, min: number],
): [number, number] {
  let coeffModif1 = 1
  let coeffModif2 = 1
  const LongueurFig2 = LongueurFig1 * CoeffFig1Fig2
  if (CoeffFig1Fig2 > 1) {
    if (LongueurFig2 > taille[0]) {
      coeffModif2 = taille[0] / LongueurFig2
      coeffModif1 = coeffModif2
    }
  } else {
    if (LongueurFig1 > taille[0]) {
      coeffModif1 = taille[0] / LongueurFig1
      coeffModif2 = coeffModif1
    }
  }
  if (CoeffFig1Fig2 > 1) {
    if (LongueurFig1 * coeffModif1 < taille[1]) {
      coeffModif1 = taille[1] / LongueurFig1
    }
  } else {
    if (LongueurFig2 * coeffModif2 < taille[1]) {
      coeffModif2 = taille[1] / LongueurFig2
    }
  }
  return [coeffModif1, coeffModif2]
}

function rediger(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  D: PointAbstrait,
  E: PointAbstrait,
  F: PointAbstrait,
  prop: boolean = true,
): string {
  let redaction = `$\\widehat{${A.nom + B.nom + C.nom}}$ = $\\widehat{${D.nom + E.nom + F.nom}}$.<br>`
  redaction += `$\\widehat{${C.nom + A.nom + B.nom}}$ = $\\widehat{${F.nom + D.nom + E.nom}}$.<br>`
  redaction += `$\\widehat{${B.nom + C.nom + A.nom}}$ = $\\widehat{${E.nom + F.nom + D.nom}}$.<br>`
  redaction +=
    "Les 3 paires d'angles sont égales. Comme les angles sont égaux deux à deux, les deux triangles sont semblables.<br>"
  if (prop) {
    redaction += `Les longueurs $${D.nom}${E.nom}$, $${D.nom}${F.nom}$ et $${E.nom}${F.nom}$ sont donc proportionnelles à $${A.nom}${B.nom}$, $${A.nom}${C.nom}$ et $${B.nom}${C.nom}$ respectivement.<br>`
  }
  return redaction
}
