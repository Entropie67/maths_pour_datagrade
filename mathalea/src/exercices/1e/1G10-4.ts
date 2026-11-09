import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment, segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePointSurDroite } from '../../lib/2d/TracePointSurDroite'
import { milieu, pointAdistance } from '../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Calculer un produit scalaire avec une projection'
export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '23033'

export const refs = {
  'fr-fr': ['1G10-4'],
  'fr-ch': ['3G95-4'],
}

export default class CalculProduitScalaireProjection extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    // this.nbQuestionsModifiable= false
    this.sup = 1
    this.spacing = 1.5

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Dans un carré',
        '2 : Dans un triangle',
        '3: Avec une figure complexe',
        '4: Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, reponse, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: {
          // carré
          const choixb = choice([true, false])
          const choixa = choice([true, false])
          const A = pointAbstrait(0, 0, 'A', 'below')
          const a = randint(4, 8) //
          const b = a + randint(2, 7) //
          const B = pointAdistance(A, b, 0, 'B', 'below')
          const C = pointAdistance(B, a, 90, 'C', 'above')
          const D = pointAdistance(A, a, 90, 'D', 'above')
          const poly = polygone(A, B, C, D)
          const I = milieu(A, B, 'I', 'below')
          const O = milieu(A, C, 'O', 'above')
          const OI = segment(O, I)
          OI.pointilles = 2
          const a1 = afficheLongueurSegment(D, C, 'black', 0.5, '', true)
          const a2 = afficheLongueurSegment(C, B, 'black', 0.5, '', true)
          const objets = []
          const xmin = Math.min(A.x, B.x, C.x, D.x) - 1
          const ymin = Math.min(A.y, B.y, C.y, D.y) - 1.5
          const xmax = Math.max(A.x, B.x, C.x, D.x) + 1
          const ymax = Math.max(A.y, B.y, C.y, D.y) + 1.5
          objets.push(
            labelPoint(A, B, C, D, I, O),
            a1,
            a2,
            poly,
            OI,
            segment(A, C),
            segment(I, D),
            segment(B, D),
            codageSegment(A, I, '||'),
            codageAngleDroit(B, I, O),
            codageSegment(I, B, '||'),
          )
          texte = '$ABCD$ est un rectangle de centre $O$.<br>'
          switch (randint(6, 6)) {
            case 1: // AB.AC ou AB.AO
              texte += ` Calculer $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{AO}'}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points $A$ et $${choixb ? 'C' : 'O'}$ se projettent orthogonalement en $A$ et $${choixb ? 'B' : 'I'}$ sur $(AB)$.<br>
              Ainsi, $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{AO}'}=\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AB}' : '\\overrightarrow{AI}'}$.<br>
              Les vecteurs $\\overrightarrow{AB}$ et $${choixb ? '\\overrightarrow{AB}' : '\\overrightarrow{AI}'}$ sont colinéaires de même sens, donc : <br>
              $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AB}' : '\\overrightarrow{AI}'}=AB\\times ${choixb ? 'AB' : 'AI'}=${choixb ? `${miseEnEvidence(b * b)}` : `${miseEnEvidence(`${texNombre((b * b) / 2, 1)}`)}`}$`
              reponse = `${choixb ? `${b * b}` : `${texNombre((b * b) / 2, 1)}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{AO}'}=$`,
                },
              )
              break

            case 2: // CA.AI ou CA.AB
              texte += ` Calculer $\\overrightarrow{CA}\\cdot ${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points $C$ et $A$ se projettent orthogonalement en $B$ et $A$ sur $${choixb ? '(AI)' : '(AB)'}$.<br>
                Ainsi, $\\overrightarrow{CA}\\cdot ${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}=\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}$.<br>
                Les vecteurs $${choixb ? '\\overrightarrow{BA}' : '\\overrightarrow{BA}'}$ et $${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}$ sont colinéaires de sens contraire, donc : <br>
                $\\overrightarrow{CA}\\cdot ${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}=-BA\\times ${choixb ? 'AI' : 'AB'}=${choixb ? `${miseEnEvidence(`${texNombre((-b * b) / 2, 1)}`)}` : `${miseEnEvidence(`${texNombre(-b * b)}`)}`}$`
              reponse = `${choixb ? `${texNombre((b * b) / 2, 1)}` : `${-b * b}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$\\overrightarrow{CA}\\cdot ${choixb ? '\\overrightarrow{AI}' : '\\overrightarrow{AB}'}=$`,
                },
              )
              break

            case 3: // AB.OD ou AB.DO
              texte += ` Calculer $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{OD}' : '\\overrightarrow{DO}'}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points $O$ et $D$ se projettent orthogonalement en $I$ et $A$ sur $(AB)$.<br>
                Ainsi, $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{OD}' : '\\overrightarrow{DO}'}=\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{IA}' : '\\overrightarrow{AI}'}$.<br>
                Les vecteurs $\\overrightarrow{AB}$ et $${choixb ? '\\overrightarrow{IA}' : '\\overrightarrow{AI}'}$ sont colinéaires ${choixb ? ' de sens contraire' : 'de même sens'}, donc : <br>
               $\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{OD}' : '\\overrightarrow{DO}'}= ${choixb ? '-AB\\times IA' : 'AB\\times AI'}=${choixb ? `${miseEnEvidence(`${texNombre((-b * b) / 2, 1)}`)}` : `${miseEnEvidence(`${texNombre((b * b) / 2, 1)}`)}`}$`
              reponse = `${choixb ? `${texNombre((-b * b) / 2, 1)}` : `${texNombre((b * b) / 2, 1)}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{OD}' : '\\overrightarrow{DO}'}=$`,
                },
              )
              break
            case 4: // CB.CA ou CB.CI ou BC.CI ou BC.CA
              texte += ` Calculer $${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}\\cdot ${choixb ? '\\overrightarrow{CA}' : '\\overrightarrow{CI}'}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$C$ et $A$' : '$C$ et $I$'} se projettent orthogonalement en $C$ et $B$ sur ${choixa ? '$(CB)$' : '$(BC)$'}.<br>
                  Ainsi, $${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}\\cdot ${choixb ? '\\overrightarrow{CA}' : '\\overrightarrow{CI}'}=${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}\\cdot\\overrightarrow{CB}$.<br>
                  Les vecteurs $${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}$ et $\\overrightarrow{CB}$ sont colinéaires ${choixa ? ' de même sens' : 'de sens contraire'}, donc : <br>
                 $${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}\\cdot ${choixb ? '\\overrightarrow{CA}' : '\\overrightarrow{CI}'}= ${choixa ? 'CB\\times CB' : '-BC\\times CB'}=${choixa ? `${miseEnEvidence(`${texNombre(a * a, 1)}`)}` : `${miseEnEvidence(`${texNombre(-a * a, 1)}`)}`}$`
              reponse = choixa ? a * a : -a * a
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? '\\overrightarrow{CB}' : '\\overrightarrow{BC}'}\\cdot ${choixb ? '\\overrightarrow{CA}' : '\\overrightarrow{CI}'}=$`,
                },
              )
              break
            case 5: // OC.BI ou OC.IB
              texte += ` Calculer $\\overrightarrow{OC}\\cdot ${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points $O$ et $C$ se projettent orthogonalement en $I$ et $B$ sur ${choixb ? '$(IB)$' : '$(BI)$'}.<br>
                Ainsi, $\\overrightarrow{OC}\\cdot ${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}
                =\\overrightarrow{IB}\\cdot ${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}$.<br>
                Les vecteurs $\\overrightarrow{IB}$ et $${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}$ sont colinéaires ${choixb ? ' de même sens' : 'de sens contraire'}, donc : <br>
              $\\overrightarrow{OC}\\cdot ${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}=
              ${choixb ? 'IB' : '-IB'}\\times ${choixb ? 'IB' : 'BI'}=${choixb ? `${miseEnEvidence(`${texNombre((b * b) / 4, 2)}`)}` : `${miseEnEvidence(`${texNombre((-b * b) / 4, 2)}`)}`}$`
              reponse = `${choixb ? `${texNombre((b * b) / 4, 2)}` : `${texNombre((-b * b) / 4, 2)}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$\\overrightarrow{OC}\\cdot ${choixb ? '\\overrightarrow{IB}' : '\\overrightarrow{BI}'}=$`,
                },
              )
              break

            case 6: // ID.BC ou DI.BC
            default:
              texte += ` Calculer $${choixb ? '\\overrightarrow{ID}' : '\\overrightarrow{DI}'}\\cdot \\overrightarrow{BC}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$I$ et $D$' : '$D$ et $I$'} se projettent orthogonalement en ${choixb ? '$B$ et $C$' : '$C$ et $B$'} sur $(BC)$.<br>
                Ainsi, $${choixb ? '\\overrightarrow{ID}' : '\\overrightarrow{DI}'}\\cdot \\overrightarrow{BC}
                =${choixb ? '\\overrightarrow{BC}' : '\\overrightarrow{CB}'}\\cdot \\overrightarrow{BC}$.<br>
                Les vecteurs $${choixb ? '\\overrightarrow{BC}' : '\\overrightarrow{CB}'}$ et $\\overrightarrow{BC}$ sont colinéaires ${choixb ? ' de même sens' : 'de sens contraire'}, donc : <br>
              $${choixb ? '\\overrightarrow{ID}' : '\\overrightarrow{DI}'}\\cdot \\overrightarrow{BC}=
              ${choixb ? 'BC' : '-CB'}\\times BC=${choixb ? `${miseEnEvidence(`${texNombre(a * a, 2)}`)}` : `${miseEnEvidence(`${texNombre(-a * a, 2)}`)}`}$`
              reponse = `${choixb ? `${texNombre(a * a, 2)}` : `${texNombre(-a * a, 2)}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixb ? '\\overrightarrow{ID}' : '\\overrightarrow{DI}'}\\cdot \\overrightarrow{BC}=$`,
                },
              )
              break
          }
          break
        }
        case 2: {
          //
          const choixb = choice([true, false])
          const choixa = choice([true, false])
          const A = pointAbstrait(0, 0, 'A', 'below')
          const a = randint(8, 15) //
          const h = a > 10 ? a - randint(2, 8) : a - randint(2, 5) //
          const b = randint(6, 10) //
          const B = pointAdistance(A, a, 0, 'B', 'below')
          const H = pointAdistance(A, h, 0, 'H', 'below')
          const C = pointAdistance(H, b, 90, 'C', 'above')
          const poly = polygone(A, B, C)
          const a1 = afficheLongueurSegment(H, C, 'black', 0.5, '', true)
          const a2 = afficheLongueurSegment(H, A, 'black', 0.5, '', true)
          const a3 = afficheLongueurSegment(B, H, 'black', 0.5, '', true)
          const objets = []
          const xmin = Math.min(A.x, B.x, C.x, H.x) - 1
          const ymin = Math.min(A.y, B.y, C.y, H.y) - 1.5
          const xmax = Math.max(A.x, B.x, C.x, H.x) + 1
          const ymax = Math.max(A.y, B.y, C.y, H.y) + 1.5
          objets.push(
            labelPoint(A, B, C, H),
            a2,
            a1,
            a3,
            poly,
            segment(A, C),
            segment(A, C),
            segment(B, C),
            codageAngleDroit(A, H, C),
            segment(H, C),
          )
          texte =
            '$ABC$ est un triangle et $H$ est le pied de la hauteur issue de $B$.<br>'
          switch (randint(1, 2)) {
            case 1: // AB.AC ou AB.CA ou BA.AC ou BA.CA
              texte += ` Calculer $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$A$ et $C$' : '$C$ et $A$'} se projettent orthogonalement en ${choixb ? '$A$ et $H$' : '$H$ et $A$'} sur $(AB)$.<br>
                Ainsi, $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}
                =${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}`}$.<br>
                Les vecteurs ${choixa ? `$\\overrightarrow{AB}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}` : `$\\overrightarrow{BA}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}`} sont colinéaires 
                ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}=
                ${choixa ? ` ${choixb ? 'AB\\times AH' : '-AB\\times HA'}` : ` ${choixb ? '-BA\\times AH' : 'BA\\times HA'}`}=
                ${choixa ? ` ${choixb ? `${miseEnEvidence(a * h)}` : `${miseEnEvidence(-a * h)}`}` : ` ${choixb ? `${miseEnEvidence(-a * h)}` : `${miseEnEvidence(a * h)}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? a * h : -a * h}` : ` ${choixb ? -a * h : a * h}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}=$`,
                },
              )
              break

            case 2: // HB.CA ou HB.AC ou BH.AC ou BH.CA
            default:
              texte += ` Calculer $${choixa ? `\\overrightarrow{HB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BH}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 15,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$A$ et $C$' : '$C$ et $A$'} se projettent orthogonalement en ${choixb ? '$A$ et $H$' : '$H$ et $A$'} sur $(HB)$.<br>
                Ainsi, $${choixa ? `\\overrightarrow{HB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BH}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}
                =${choixa ? `\\overrightarrow{HB}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}` : `\\overrightarrow{BH}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}`}$.<br>
                Les vecteurs ${choixa ? `$\\overrightarrow{HB}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}` : `$\\overrightarrow{BH}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}`} sont colinéaires 
                ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                $${choixa ? `\\overrightarrow{HB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BH}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}=
                ${choixa ? ` ${choixb ? 'HB\\times AH' : '-HB\\times HA'}` : ` ${choixb ? '-BH\\times AH' : 'BH\\times HA'}`}=
                ${choixa ? ` ${choixb ? `${miseEnEvidence(h * (a - h))}` : `${miseEnEvidence(-h * (a - h))}`}` : ` ${choixb ? `${miseEnEvidence(-h * (a - h))}` : `${miseEnEvidence(h * (a - h))}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? h * (a - h) : -h * (a - h)}` : ` ${choixb ? -h * (a - h) : h * (a - h)}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{HB}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}` : `\\overrightarrow{BH}\\cdot ${choixb ? '\\overrightarrow{AC}' : '\\overrightarrow{CA}'}`}=$`,
                },
              )
              break
          }
          break
        }

        case 3: //
        default: {
          const choixb = choice([true, false])
          const choixa = choice([true, false])
          const k = randint(1, 2)
          const A = pointAbstrait(0, 0, 'A', 'below')
          const B = pointAdistance(A, 10, 0, 'B', 'below right')
          const C = pointAdistance(A, 3, 90, 'C', 'above')
          const D = pointAbstrait(k * choice([2, 3]), 0, 'D', 'below')
          const E = pointAbstrait(8, 4, 'E', 'above')
          const F = pointAbstrait(8, -4, 'F', 'below')
          const H = pointAbstrait(8, 0, 'H', 'below left')
          const AB = segmentAvecExtremites(A, B)
          const d = droite(A, B)
          const pointsSurAB = []
          const objets = []
          for (let i = 1; i < 10; i++) {
            pointsSurAB.push(pointAbstrait(k * i, 0), pointAbstrait(k * i, 0))
            objets.push(tracePointSurDroite(pointsSurAB[2 * (i - 1)], d))
          }
          const xmin = Math.min(A.x, B.x, C.x, E.x, F.x) - 1
          const ymin = Math.min(A.y, B.y, C.y, E.y, F.y) - 1
          const xmax = Math.max(A.x, B.x, C.x, E.x, F.x) + 1
          const ymax = Math.max(A.y, B.y, C.y, E.y, F.y) + 1
          objets.push(
            labelPoint(A, B, C, D, E, F, H),
            AB,
            segment(A, C),
            segment(C, D),
            segment(D, E),
            segment(C, E),
            segment(E, F),
            segment(F, B),
            segment(F, C),
            codageAngleDroit(B, A, C),
            codageAngleDroit(B, H, E),
          )
          texte = `Sur la figure ci-dessous, les points sont régulièrement espacés. <br>
          On a $AB=${texNombre(B.x / k, 0)}$.<br>`
          switch (randint(1, 4)) {
            case 1: // AB.DE ou AB.ED ou BA.DE ou BA.ED
              texte += `Calculer $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 25,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$D$ et $E$' : '$E$ et $D$'} se projettent orthogonalement en ${choixb ? '$D$ et $H$' : '$H$ et $D$'} sur $(AB)$.<br>
                  Ainsi, $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}`}
                  =${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{DH}' : '\\overrightarrow{HD}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{DH}' : '\\overrightarrow{HD}'}`}$.<br>
                  Les vecteurs ${choixa ? `$\\overrightarrow{AB}$ et ${choixb ? '$\\overrightarrow{DH}$' : '$\\overrightarrow{HD}$'}` : `$\\overrightarrow{BA}$ et ${choixb ? '$\\overrightarrow{DH}$' : '$\\overrightarrow{HD}$'}`} sont colinéaires 
                  ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                  $${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}`}=
                  ${choixa ? `${choixb ? 'AB\\times DH' : '-AB\\times HD'}` : ` ${choixb ? '-BA\\times DH' : 'BA\\times HD'}`}=
                  ${choixa ? ` ${choixb ? `${miseEnEvidence(((H.x - D.x) * 10) / k ** 2)}` : `${miseEnEvidence((-(H.x - D.x) * 10) / k ** 2)}`}` : ` ${choixb ? `${miseEnEvidence((-(H.x - D.x) * 10) / k ** 2)}` : `${miseEnEvidence(((H.x - D.x) * 10) / k ** 2)}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? ((H.x - D.x) * 10) / k ** 2 : (-(H.x - D.x) * 10) / k ** 2}` : ` ${choixb ? (-(H.x - D.x) * 10) / k ** 2 : ((H.x - D.x) * 10) / k ** 2}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{AB}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}` : `\\overrightarrow{BA}\\cdot ${choixb ? '\\overrightarrow{DE}' : '\\overrightarrow{ED}'}`}=$`,
                },
              )
              break

            case 2: // AD.CF et ...
              texte += `Calculer $${choixa ? `\\overrightarrow{AD}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}` : `\\overrightarrow{DA}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 25,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixb ? '$C$ et $F$' : '$F$ et $C$'} se projettent orthogonalement en ${choixb ? '$A$ et $H$' : '$H$ et $A$'} sur $(AD)$.<br>
                Ainsi, $${choixa ? `\\overrightarrow{AD}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}` : `\\overrightarrow{DA}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}`}
                =${choixa ? `\\overrightarrow{AD}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}` : `\\overrightarrow{DA}\\cdot ${choixb ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}`}$.<br>
                Les vecteurs ${choixa ? `$\\overrightarrow{AD}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}` : `$\\overrightarrow{DA}$ et ${choixb ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'}`} sont colinéaires 
                ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                $${choixa ? `\\overrightarrow{AD}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}` : `\\overrightarrow{DA}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}`}=
                ${choixa ? `${choixb ? 'AD\\times AH' : '-AD\\times HA'}` : ` ${choixb ? '-DA\\times AH' : 'DA\\times HA'}`}=
                ${choixa ? ` ${choixb ? `${miseEnEvidence((D.x * H.x) / k ** 2)}` : `${miseEnEvidence((-D.x * H.x) / k ** 2)}`}` : ` ${choixb ? `${miseEnEvidence((-D.x * H.x) / k ** 2)}` : `${miseEnEvidence((D.x * H.x) / k ** 2)}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? (D.x * H.x) / k ** 2 : (-D.x * H.x) / k ** 2}` : ` ${choixb ? (-D.x * H.x) / k ** 2 : (D.x * H.x) / k ** 2}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{AD}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}` : `\\overrightarrow{DA}\\cdot ${choixb ? '\\overrightarrow{CF}' : '\\overrightarrow{FC}'}`}=$`,
                },
              )
              break

            case 3: // CE.DB et ...
              texte += `Calculer $${choixa ? `\\overrightarrow{CE}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}` : `\\overrightarrow{EC}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 25,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixa ? '$C$ et $E$' : '$E$ et $C$'} se projettent orthogonalement en ${choixa ? '$A$ et $H$' : '$H$ et $A$'} sur $(DB)$.<br>
                Ainsi, $${choixa ? `\\overrightarrow{CE}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}` : `\\overrightarrow{EC}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}`}
                =${choixa ? '\\overrightarrow{AH}' : '\\overrightarrow{HA}'}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}$.<br>
                Les vecteurs ${choixa ? '$\\overrightarrow{AH}$' : '$\\overrightarrow{HA}$'} et ${choixb ? '$\\overrightarrow{DB}$' : '$\\overrightarrow{BD}$'} sont colinéaires 
                ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                $${choixa ? `\\overrightarrow{CE}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}` : `\\overrightarrow{EC}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}`}=
                ${choixa ? ` ${choixb ? 'AH\\times DB' : '-AH\\times BD'}` : ` ${choixb ? '-HA\\times DB' : 'HA\\times BD'}`}=
                ${choixa ? ` ${choixb ? `${miseEnEvidence(((10 - D.x) * H.x) / k ** 2)}` : `${miseEnEvidence((-(10 - D.x) * H.x) / k ** 2)}`}` : ` ${choixb ? `${miseEnEvidence((-(10 - D.x) * H.x) / k ** 2)}` : `${miseEnEvidence(((10 - D.x) * H.x) / k ** 2)}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? ((10 - D.x) * H.x) / k ** 2 : (-(10 - D.x) * H.x) / k ** 2}` : ` ${choixb ? (-(10 - D.x) * H.x) / k ** 2 : ((10 - D.x) * H.x) / k ** 2}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{CE}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}` : `\\overrightarrow{EC}\\cdot ${choixb ? '\\overrightarrow{DB}' : '\\overrightarrow{BD}'}`}=$`,
                },
              )
              break

            case 4: // DC.BH et ...
            default:
              texte += `Calculer $${choixa ? `\\overrightarrow{DC}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}` : `\\overrightarrow{CD}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}`}$.<br>`
              texte += mathalea2d(
                {
                  xmin,
                  ymin,
                  xmax,
                  ymax,
                  pixelsParCm: 25,
                  mainlevee: false,
                  amplitude: 0.3,
                  scale: 0.4,
                  center: !context.isHtml,
                },
                objets,
              )
              texteCorr = `Les points ${choixa ? '$D$ et $C$' : '$C$ et $D$'} se projettent orthogonalement en ${choixa ? '$D$ et $A$' : '$A$ et $D$'} sur $(BH)$.<br>
                Ainsi, $${choixa ? `\\overrightarrow{DC}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}` : `\\overrightarrow{CD}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}`}
                =${choixa ? '\\overrightarrow{DA}' : '\\overrightarrow{AD}'}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}$.<br>
                Les vecteurs ${choixa ? '$\\overrightarrow{DA}$' : '$\\overrightarrow{AD}$'} et ${choixb ? '$\\overrightarrow{BH}$' : '$\\overrightarrow{HB}$'} sont colinéaires 
                ${choixa ? ` ${choixb ? 'de même sens' : 'de sens contraire'}` : `${choixb ? 'sens contraire' : 'même sens'}`}, donc : <br>
                $${choixa ? `\\overrightarrow{DC}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}` : `\\overrightarrow{CD}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}`}=
                ${choixa ? ` ${choixb ? 'DA\\times BH' : '-DA\\times HB'}` : ` ${choixb ? '-AD\\times BH' : 'AD\\times HB'}`}=
                ${choixa ? ` ${choixb ? `${miseEnEvidence(((10 - H.x) * D.x) / k ** 2)}` : `${miseEnEvidence((-(10 - H.x) * D.x) / k ** 2)}`}` : ` ${choixb ? `${miseEnEvidence((-(10 - H.x) * D.x) / k ** 2)}` : `${miseEnEvidence(((10 - D.x) * H.x) / k ** 2)}`}`}$`
              reponse = ` ${choixa ? ` ${choixb ? ((10 - H.x) * D.x) / k ** 2 : (-(10 - H.x) * D.x) / k ** 2}` : ` ${choixb ? (-(10 - H.x) * D.x) / k ** 2 : ((10 - H.x) * D.x) / k ** 2}`}`
              handleAnswers(this, i, { reponse: { value: reponse } })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBase,
                {
                  texteAvant: `<br>$${choixa ? `\\overrightarrow{DC}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}` : `\\overrightarrow{CD}\\cdot ${choixb ? '\\overrightarrow{BH}' : '\\overrightarrow{HB}'}`}=$`,
                },
              )
              break
          }
          break
        }
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
