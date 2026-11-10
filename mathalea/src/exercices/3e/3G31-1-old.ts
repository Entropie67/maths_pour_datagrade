import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { similitude } from '../../lib/2d/transformations'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone, numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

/**
 * Convertit un angle en degrés vers des radians
 */
function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

/**
 * Convertit un angle en radians vers des degrés
 */
function radToDeg(rad: number) {
  return (rad * 180) / Math.PI
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '21/05/2024'
export const dateDePublication = '01/02/2021'
export const titre = "Calculer toutes les mesures d'angle d'une figure complexe"

/**
 * Deux triangles rectangles accolés, on connaît deux longueurs et un angle, il faut déterminer tous les autres angles
 * @author Rémi Angot
 */
export const uuid = '35e0b'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculDAngleFigureComplexe extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer la mesure de tous les angles de cette figure.'
    this.nbQuestions = 2

    this.spacingCorr = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = context.isHtml

    this.besoinFormulaireCaseACocher = ['Figure codée', false]
  }

  nouvelleVersion() {
    for (let i = 0; i < this.nbQuestions; i++) {
      const typesDeQuestion = choice(['BA-AD-BAC', 'BA-AD-ACB'])
      let texte, texteCorr

      const B = pointAbstrait(0, 0, '', 'below')
      const A = pointAbstrait(randint(4, 7), 0, '', 'below')
      const C = pointAbstrait(0, randint(3, 7, longueur(A, B)), '', 'above') // On exclue AB pour ne pas avoir un triangle isocèle
      const t1 = polygone([A, B, C])
      const t1c = polygone([A, B, C], bleuMathalea)
      t1c.epaisseur = 3
      const c1 = codageAngleDroit(A, B, C)
      const D = similitude(C, A, -90, randint(7, 12, 10) / 10, '', 'right') // On exclue 10 pour ne pas avoir un triangle isocèle
      const t2 = polygone([C, A, D])
      const t2c = polygone([C, A, D], bleuMathalea)
      t2c.epaisseur = 3
      const c2 = codageAngleDroit(C, A, D)
      const nom = creerNomDePolygone(4, 'QD')
      A.nom = nom[0]
      B.nom = nom[1]
      C.nom = nom[2]
      D.nom = nom[3]
      const labels = labelPoint(A, B, C, D)
      const BA = longueur(B, A)
      const AD = longueur(A, D, 1)
      const BAC = Math.round(angle(B, A, C))
      let AC = BA / Math.cos(degToRad(BAC))
      let ACD = Math.round(radToDeg(Math.atan(AD / AC)))
      let a1 = afficheMesureAngle(B, A, C, 'black', 1, BAC + '^\\circ')
      const a2 = afficheLongueurSegment(A, B)
      const a3 = afficheLongueurSegment(D, A)
      const a4 = afficheLongueurSegment(A, C)
      const a5 = codageAngle(A, C, D, 1.2)
      a5.epaisseur = 2
      const ACB = Math.round(angle(A, C, B))

      const objetsMathalea: NestedObjetMathalea2dArray = [
        t1,
        t2,
        c1,
        c2,
        labels,
      ]
      switch (
        typesDeQuestion // Suivant le type de question, le contenu sera différent
      ) {
        case 'BA-AD-BAC':
          if (this.sup) {
            objetsMathalea.push(a1, a2, a3)
          }
          texte = mathalea2d(
            {
              xmin: -1,
              scale: 0.6,
              ymin: -1,
              xmax: D.x + 1,
              ymax: Math.max(C.y, D.y) + 1,
              optionsTikz: 'baseline=(current bounding box.north)',
            },
            objetsMathalea,
          )
          if (!this.sup) {
            texte += `On a $${B.nom + A.nom} = ${texNombre(BA, 1)}\\text{ cm}$, $${A.nom + D.nom} = ${texNombre(AD, 1)}\\text{ cm}$ et $\\widehat{${B.nom + A.nom + C.nom}}=${BAC}^\\circ$.`
          }
          texte += this.interactif
            ? "<br><br>Les valeurs d'angle seront arrondies au degré près."
            : ''
          texteCorr = ''
          if (this.correctionDetaillee) {
            const texte1 = texteSurSegment('hypoténuse', C, A)
            const texte2 = texteSurSegment('adjacent', A, B, 'black', 1)
            texteCorr += mathalea2d(
              {
                xmin: -1,
                scale: 0.6,
                ymin: -2,
                xmax: D.x + 1,
                ymax: Math.max(C.y, D.y) + 1,
                optionsTikz: 'baseline=(current bounding box.north)',
              },
              t1c,
              t2,
              c1,
              c2,
              a1,
              a2,
              labels,
              texte1,
              texte2,
            )
          }
          texteCorr += `$${C.nom + B.nom + A.nom}$ est rectangle en $${B.nom}$. <br> Donc $\\cos\\left(\\widehat{${B.nom + A.nom + C.nom}}\\right)=\\dfrac{${B.nom + A.nom}}{${A.nom + C.nom}}$ <br>`
          texteCorr += `Soit $\\cos(${BAC}^\\circ)=\\dfrac{${texNombre(BA, 1)}}{${A.nom + C.nom}}$ <br> $${A.nom + C.nom}=\\dfrac{${texNombre(BA, 1)}}{\\cos(${BAC}^\\circ)}\\approx${texNombre(AC, 1)}\\text{ cm}$.`
          if (this.correctionDetaillee) {
            const texte3 = texteSurSegment('adjacent', C, A)
            const texte4 = texteSurSegment('opposé', A, D, 'black')
            texteCorr +=
              '<br><br>' +
              mathalea2d(
                {
                  xmin: -1,
                  scale: 0.6,
                  ymin: -1,
                  xmax: D.x + 1,
                  ymax: Math.max(C.y, D.y) + 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                },
                t1,
                t2c,
                c1,
                c2,
                a3,
                a4,
                a5,
                labels,
                texte3,
                texte4,
              )
          }
          texteCorr += `<br>$${C.nom + A.nom + D.nom}$ est rectangle en $${A.nom}$. <br> Donc $\\tan\\left(\\widehat{${A.nom + C.nom + D.nom}}\\right)=\\dfrac{${A.nom + D.nom}}{${A.nom + C.nom}}$ <br>`
          texteCorr += `Soit $\\tan\\left(\\widehat{${A.nom + C.nom + D.nom}}\\right)\\approx\\dfrac{${texNombre(AD, 1)}}{${texNombre(AC, 1)}}$ <br> $\\widehat{${A.nom + C.nom + D.nom}}\\approx\\text{arctan}\\left(\\dfrac{${texNombre(AD, 1)}}{${texNombre(AC, 1)}}\\right)\\approx${miseEnEvidence(ACD)}^\\circ$.<br>`
          texteCorr += `La somme des angles d'un triangle est égale à $180^\\circ$.<br> Donc $\\widehat{${B.nom + C.nom + A.nom}}=180^\\circ-90^\\circ-${BAC}^\\circ=${miseEnEvidence(90 - BAC)}^\\circ$.<br>`
          texteCorr += `De même, $\\widehat{${C.nom + D.nom + A.nom}}\\approx 180^\\circ-90^\\circ-${ACD}^\\circ$ et donc $\\widehat{${C.nom + D.nom + A.nom}}\\approx${miseEnEvidence(90 - ACD)}^\\circ$.<br>`
          if (this.interactif) {
            handleAnswers(this, 3 * i, { reponse: { value: String(ACD) } })
            handleAnswers(this, 3 * i + 1, {
              reponse: { value: String(90 - BAC) },
            })
            handleAnswers(this, 3 * i + 2, {
              reponse: { value: String(90 - ACD) },
            })
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${A.nom + C.nom + D.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i + 1,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${B.nom + C.nom + A.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i + 2,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${C.nom + D.nom + A.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
          }
          break
        case 'BA-AD-ACB':
        default:
          AC = BA / Math.sin(degToRad(ACB))
          ACD = Math.round(radToDeg(Math.atan(AD / AC)))
          a1 = afficheMesureAngle(A, C, B, 'black', 1, ACB + '^\\circ')
          if (this.sup) {
            objetsMathalea.push(a1, a2, a3)
          }
          texte = mathalea2d(
            {
              xmin: -1,
              scale: 0.6,
              ymin: -1,
              xmax: D.x + 1,
              ymax: Math.max(C.y, D.y) + 1,
              optionsTikz: 'baseline=(current bounding box.north)',
            },
            objetsMathalea,
          )
          if (!this.sup) {
            texte += `On a $${B.nom + A.nom} = ${texNombre(BA, 1)}\\text{ cm}$, $${A.nom + D.nom} = ${texNombre(AD, 1)}\\text{ cm}$ et $\\widehat{${A.nom + C.nom + B.nom}}=${ACB}^\\circ$.`
          }
          texte += this.interactif
            ? "<br><br>Les valeurs d'angle seront arrondies au degré près."
            : ''
          texteCorr = ''
          if (this.correctionDetaillee) {
            const texte1 = texteSurSegment('hypoténuse', C, A)
            const texte2 = texteSurSegment('opposé', A, B, 'black', 1)
            texteCorr += mathalea2d(
              {
                xmin: -1,
                scale: 0.6,
                ymin: -2,
                xmax: D.x + 1,
                ymax: Math.max(C.y, D.y) + 1,
                optionsTikz: 'baseline=(current bounding box.north)',
              },
              t1c,
              t2,
              c1,
              c2,
              a1,
              a2,
              labels,
              texte1,
              texte2,
            )
            texteCorr += '<br>'
          }
          texteCorr += `$${C.nom + B.nom + A.nom}$ est rectangle en $${B.nom}$.<br> Donc $\\sin\\left(\\widehat{${A.nom + C.nom + B.nom}}\\right)=\\dfrac{${B.nom + A.nom}}{${A.nom + C.nom}}$ <br>`
          texteCorr += `Soit $\\sin(${ACB}^\\circ)=\\dfrac{${texNombre(BA, 1)}}{${A.nom + C.nom}}$ <br> $${A.nom + C.nom}=\\dfrac{${texNombre(BA, 1)}}{\\sin(${ACB}^\\circ)}\\approx${texNombre(AC, 1)}\\text{ cm}$.`
          if (this.correctionDetaillee) {
            const texte3 = texteSurSegment('adjacent', C, A)
            const texte4 = texteSurSegment('opposé', A, D, 'black')
            texteCorr +=
              '<br><br>' +
              mathalea2d(
                {
                  xmin: -1,
                  scale: 0.6,
                  ymin: -1,
                  xmax: D.x + 1,
                  ymax: Math.max(C.y, D.y) + 1,
                  optionsTikz: 'baseline=(current bounding box.north)',
                },
                t1,
                t2c,
                c1,
                c2,
                a3,
                a4,
                a5,
                labels,
                texte3,
                texte4,
              )
          }
          texteCorr += `<br><br>$${C.nom + A.nom + D.nom}$ est rectangle en $${A.nom}$. <br> $\\tan\\left(\\widehat{${A.nom + C.nom + D.nom}}\\right)=\\dfrac{${A.nom + D.nom}}{${A.nom + C.nom}}$<br>`
          texteCorr += `Soit $\\tan\\left(\\widehat{${A.nom + C.nom + D.nom}}\\right)\\approx\\dfrac{${texNombre(AD, 1)}}{${texNombre(AC, 1)}}$ <br> $\\widehat{${A.nom + C.nom + D.nom}}\\approx\\text{arctan}\\left(\\dfrac{${texNombre(AD, 1)}}{${texNombre(AC, 1)}}\\right)\\approx${miseEnEvidence(ACD)}^\\circ$.`
          texteCorr += `<br><br>La somme des angles d'un triangle est égale à $180^\\circ$. <br> Donc $\\widehat{${B.nom + A.nom + C.nom}}=180^\\circ-90^\\circ-${ACB}^\\circ=${miseEnEvidence(90 - ACB)}^\\circ$.`
          texteCorr += `<br>De même, $\\widehat{${C.nom + D.nom + A.nom}}\\approx 180^\\circ-90^\\circ-${ACD}^\\circ$ et donc $\\widehat{${C.nom + D.nom + A.nom}}\\approx${miseEnEvidence(90 - ACD)}^\\circ$.`
          if (this.interactif) {
            handleAnswers(this, 3 * i, { reponse: { value: String(ACD) } })
            handleAnswers(this, 3 * i + 1, {
              reponse: { value: String(90 - ACB) },
            })
            handleAnswers(this, 3 * i + 2, {
              reponse: { value: String(90 - ACD) },
            })
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${A.nom + C.nom + D.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i + 1,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${B.nom + A.nom + C.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
            texte +=
              '<br><br>' +
              ajouteChampTexteMathLive(
                this,
                3 * i + 2,
                KeyboardType.clavierNumbers,
                {
                  texteAvant: `$\\widehat{${C.nom + D.nom + A.nom}}=$`,
                  texteApres: '$^\\circ$',
                },
              )
          }
          break
      }
      texte += '<br>'
      if (context.isAmc) {
        this.autoCorrectionAMC.push({
          enonce: texte,
          enonceAvant: false,
          enonceApresNumQuestion: true,
          options: { barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte:
                      numAlpha(0) +
                      `Valeur arrondie à l'unité de $\\widehat{${A.nom + C.nom + D.nom}}$`,
                    valeur: ACD,
                    alignement: 'center',
                    param: {
                      digits: 3,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte:
                      numAlpha(1) +
                      (typesDeQuestion === 'BA-AD-BAC'
                        ? `Valeur arrondie à l'unité  de $\\widehat{${B.nom + C.nom + A.nom}}$`
                        : `Valeur arrondie à l'unité de $\\widehat{${B.nom + A.nom + C.nom}}$`),
                    valeur:
                      typesDeQuestion === 'BA-AD-BAC' ? 90 - BAC : 90 - ACB,
                    alignement: 'center',
                    param: {
                      digits: 3,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte:
                      numAlpha(2) +
                      `Valeur arrondie à l'unité  de $\\widehat{${C.nom + D.nom + A.nom}}$`,
                    valeur: 90 - ACD,
                    alignement: 'center',
                    param: {
                      digits: 3,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        })
      }

      if (this.questionJamaisPosee(i, nom, BAC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
      }
    }

    listeQuestionsToContenu(this)
  }
}
