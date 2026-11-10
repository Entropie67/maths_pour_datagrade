import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { Droite } from '../../lib/2d/droites'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { milieu, pointIntersectionLC } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre, texRacineCarree } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  'Calculer et utiliser la distance entre deux points dans un repère'
export const dateDeModifImportante = '24/04/2026'

/**
 * @author Stéphane Guyon + Gilles Mora (interactif + bricoles)
 */
export const uuid = 'c5480'

export const refs = {
  'fr-fr': ['2G12-1'],
  'fr-ch': ['3G90-3'],
}
export default class Distance extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Application directe\n2 :  Application indirecte \n3 : Mélange',
    ]

    this.nbQuestions = 1
    this.spacing = 1.5
    this.sup = 1 //
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.sup = Number(this.sup)
    let typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2, 3, 4, 5]
    } else {
      typesDeQuestionsDisponibles = [1, 1, 2, 3, 4, 5]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      const variables: number[] = []
      let texte = ''
      let texteCorr = ''
      const CorrD =
        "On sait d'après le cours, que si $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ sont deux points d'un repère orthonormé, alors on a : $AB=\\sqrt{\\left(x_B-x_A\\right)^{2}+\\left(y_B-y_A\\right)^{2}}$.<br>"
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          {
            const xA = randint(0, 10) * choice([-1, 1])
            const yA = randint(1, 10) * choice([-1, 1])
            let xB = randint(0, 10) * choice([-1, 1])
            const yB = randint(0, 10) * choice([-1, 1])
            if (xB === xA && yA === yB) {
              xB = xB + randint(1, 8) * choice([-1, 1])
            }
            const XAB = (xB - xA) * (xB - xA)
            const YAB = (yB - yA) * (yB - yA)
            const AB = XAB + YAB
            const nom = creerNomDePolygone(2, ['OIJDXYAB'])
            const A = pointAbstrait(xA, yA, 'A')
            const B = pointAbstrait(xB, yB, 'B')
            A.nom = nom[0]
            B.nom = nom[1]
            if (extraireRacineCarree(AB)[0] === 1) {
              handleAnswers(this, i, {
                reponse: { value: `\\sqrt{${XAB + YAB}}` },
              })
            } else {
              handleAnswers(this, i, {
                reponse: {
                  value: [`\\sqrt{${XAB + YAB}}`, `${texRacineCarree(AB)}`],
                },
              })
            }
            texte =
              'Dans un repère orthonormé $(O\\,;\\,I\\,,\\,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$. <br>`
            texte += `Calculer la distance $${A.nom}${B.nom}$.`
            texte += this.interactif
              ? '<br>' +
                ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierFullOperations,
                  { texteAvant: `$${A.nom}${B.nom}=$` },
                )
              : ''
            if (this.correctionDetaillee) {
              texteCorr = `${CorrD}<br>`
            } else {
              texteCorr = ''
            }
            texteCorr +=
              "On applique la formule aux données de l'énoncé :<br><br>"
            texteCorr += `$\\phantom{On applique la formule  : } ${A.nom}${B.nom}=\\sqrt{\\left(x_${B.nom}-x_${A.nom}\\right)^{2}+\\left(y_${B.nom}-y_${A.nom}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{On applique la formule  : }${A.nom}${B.nom}=\\sqrt{\\left(${xB}-${ecritureParentheseSiNegatif(xA)}\\right)^{2}+\\left(${yB}-${ecritureParentheseSiNegatif(yA)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{On applique la formule :        } ${A.nom}${B.nom}=\\sqrt{${XAB}+${YAB}}$<br>`
            texteCorr += `$\\phantom{On applique la formule  :        } ${A.nom}${B.nom}=${miseEnEvidence(`\\sqrt{${texNombre(XAB + YAB)}}`)}$<br>`
            if (extraireRacineCarree(AB)[0] !== 1) {
              texteCorr += `$\\phantom{On applique la formule  :     } ${A.nom}${B.nom}=${miseEnEvidence(texRacineCarree(AB))}$<br>`
            }
            variables.push(xA, yA, xB, yB)
          }
          break
        case 2:
          {
            const xA = randint(0, 10) * choice([-1, 1])
            const yA = randint(0, 10) * choice([-1, 1])
            const ux = randint(0, 10) * choice([-1, 1])
            const uy = randint(1, 10) * choice([-1, 1])
            const xB = xA + ux
            const yB = yA + uy
            const xC = xA + uy * choice([-1, 1])
            const yC = yA + ux * choice([-1, 1])
            const XAB = (xB - xA) * (xB - xA)
            const YAB = (yB - yA) * (yB - yA)
            const AB = XAB + YAB
            const XAC = (xC - xA) * (xC - xA)
            const YAC = (yC - yA) * (yC - yA)
            const AC = XAC + YAC
            const nom = creerNomDePolygone(3, ['OIJDXY'])
            const A = pointAbstrait(xA, yA, 'A')
            const B = pointAbstrait(xB, yB, 'B')
            const C = pointAbstrait(xC, yC, 'C')
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            handleAnswers(this, i, {
              reponse: {
                value: ['OUI', 'oui', 'Oui', 'O'],
                options: { texteSansCasse: true },
              },
            })
            texte =
              'Dans un repère orthonormé $(O\\,;\\,I\\,,\\,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$.`
            texte += `<br>Le point $${C.nom}\\left(${xC}\\,;\\,${yC}\\right)$ appartient-il au cercle de centre $${A.nom}$ passant par $${B.nom}$ ?`
            if (this.interactif) {
              texte +=
                '<br>Répondre par O (pour Oui) ou N (pour Non). ' +
                '<br>' +
                ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
            }
            texteCorr = `Le point $${C.nom}$ appartient au cercle de centre $${A.nom}$ passant par $${B.nom}$ si et seulement si $${A.nom}${B.nom}=${A.nom}${C.nom}$.`
            texteCorr += `<br>${texteGras('Conseil :')} Faites un croquis pour visualiser la situation.<br>`
            texteCorr += '<br>On calcule séparément ces deux distances.<br>'
            if (this.correctionDetaillee) {
              texteCorr += `<br>${CorrD}`
            }
            texteCorr += `<br>$\\phantom{on applique la relation         } ${A.nom}${B.nom}=\\sqrt{\\left(${xB}-${ecritureParentheseSiNegatif(xA)}\\right)^{2}+\\left(${yB}-${ecritureParentheseSiNegatif(yA)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{on applique la relation        } ${A.nom}${B.nom}=\\sqrt{${XAB}+${YAB}}$<br>`
            texteCorr += `$\\phantom{on applique la relation         } ${A.nom}${B.nom}=\\sqrt{${texNombre(XAB + YAB)}}$<br>`
            if (extraireRacineCarree(AC)[0] !== 1) {
              texteCorr += `$\\phantom{on applique la relation    } ${A.nom}${B.nom}=${texRacineCarree(AB)}$<br>`
            }
            texteCorr += `<br>De même : $${A.nom}${C.nom}=\\sqrt{\\left(${xC}-${ecritureParentheseSiNegatif(xA)}\\right)^{2}+\\left(${yC}-${ecritureParentheseSiNegatif(yA)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${A.nom}${C.nom}=\\sqrt{${XAC}+${YAC}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${A.nom}${C.nom}=\\sqrt{${texNombre(XAC + YAC)}}$<br>`
            if (extraireRacineCarree(AC)[0] !== 1) {
              texteCorr += `$\\phantom{De même :   }${A.nom}${C.nom}=${texRacineCarree(AC)}$<br>`
            }
            texteCorr += `<br>On observe que $${A.nom}${B.nom}=${A.nom}${C.nom}$ donc le point $${A.nom}$ est équidistant de $${B.nom}$ et $${C.nom}$.`
            texteCorr += `<br>Le point $${C.nom}$ appartient bien au cercle de centre $${A.nom}$ et passant par $${B.nom}$.`
            variables.push(xA, yA, xB, yB, xC, yC)
          }
          break
        case 3:
          {
            const xA = randint(0, 5) * choice([-1, 1])
            const yA = randint(0, 9) * choice([-1, 1])
            const ux = randint(0, 9) * choice([-1, 1])
            const uy = randint(0, 9) * choice([-1, 1])
            const xB = xA + ux
            const yB = yA + uy
            const xC = xA + uy * choice([-1, 1]) + randint(1, 3)
            const yC = yA + ux * choice([-1, 1])

            const XAB = (xB - xA) * (xB - xA)
            const YAB = (yB - yA) * (yB - yA)
            const AB = XAB + YAB
            const XAC = (xC - xA) * (xC - xA)
            const YAC = (yC - yA) * (yC - yA)
            const AC = XAC + YAC
            const nom = creerNomDePolygone(3, ['OIJDXY'])
            const A = pointAbstrait(xA, yA, 'A')
            const B = pointAbstrait(xB, yB, 'B')
            const C = pointAbstrait(xC, yC, 'C')
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            handleAnswers(this, i, {
              reponse: {
                value: ['NON', 'non', 'Non', 'N'],
                options: { texteSansCasse: true },
              },
            })
            texte =
              'Dans un repère orthonormé $(O\\,;\\,I\\,,\\,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$.`
            texte += `<br>Le point $${C.nom}\\left(${xC}\\,;\\,${yC}\\right)$ appartient-il au cercle de centre $${A.nom}$ passant par $${B.nom}$ ?`
            if (this.interactif) {
              texte +=
                '<br>Répondre par «\u00a0O\u00a0» (pour Oui) ou «\u00a0N\u00a0» (pour Non). ' +
                '<br>' +
                ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
            }
            texteCorr = `Le point $${C.nom}$ appartient au cercle de centre $${A.nom}$ passant par $${B.nom}$ si et seulement si $${A.nom}${B.nom}=${A.nom}${C.nom}$.`
            texteCorr += `<br>${texteGras('Conseil :')} Faites un croquis pour visualiser la situation.<br>`
            texteCorr += '<br>On calcule séparément ces deux distances.<br>'
            if (this.correctionDetaillee) {
              texteCorr += `<br>${CorrD}`
            }
            texteCorr += `<br>$\\phantom{on applique la relation         } ${A.nom}${B.nom}=\\sqrt{\\left(${xB}-${ecritureParentheseSiNegatif(xA)}\\right)^{2}+\\left(${yB}-${ecritureParentheseSiNegatif(yA)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{on applique la relation        } ${A.nom}${B.nom}=\\sqrt{${XAB}+${YAB}}$<br>`
            texteCorr += `$\\phantom{on applique la relation         } ${A.nom}${B.nom}=\\sqrt{${texNombre(XAB + YAB)}}$<br>`
            if (extraireRacineCarree(AB)[0] !== 1) {
              texteCorr += `$\\phantom{on applique la relation    } ${A.nom}${B.nom}=${texRacineCarree(AB)}$<br>`
            }
            texteCorr += `<br>De même : $${A.nom}${C.nom}=\\sqrt{\\left(${xC}-${ecritureParentheseSiNegatif(xA)}\\right)^{2}+\\left(${yC}-${ecritureParentheseSiNegatif(yA)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${A.nom}${C.nom}=\\sqrt{${XAC}+${YAC}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${A.nom}${C.nom}=\\sqrt{${texNombre(XAC + YAC)}}$<br>`
            if (extraireRacineCarree(AC)[0] !== 1) {
              texteCorr += `$\\phantom{De même :   }${A.nom}${C.nom}=${texRacineCarree(AC)}$<br>`
            }
            texteCorr += `On observe que $${A.nom}${B.nom}\\neq ${A.nom}${C.nom}$ donc le point $${C.nom}$ n'appartient pas au cercle de centre $${A.nom}$ et passant par $${B.nom}$.`
            variables.push(xA, yA, xB, yB, xC, yC)
          }
          break
        case 4:
          {
            const xC = randint(0, 5) * choice([-1, 1]) // coordonnées du point A
            const yC = randint(0, 9) * choice([-1, 1]) // coordonnées du point A
            const ux = randint(0, 9) * choice([-1, 1])
            const uy = randint(0, 9) * choice([-1, 1])
            const xB = xC + ux
            const yB = yC + uy
            const xA = xC + uy * choice([-1, 1])
            const yA = yC + ux * choice([-1, 1])
            // const XAB = (xB - xA) * (xB - xA) inutilisées !
            // const YAB = (yB - yA) * (yB - yA)
            // const AB = XAB + YAB
            const XAC = (xC - xA) * (xC - xA)
            const YAC = (yC - yA) * (yC - yA)
            const AC = XAC + YAC
            const XBC = (xC - xB) * (xC - xB)
            const YBC = (yC - yB) * (yC - yB)
            const BC = XBC + YBC
            const nom = creerNomDePolygone(3, ['OIJDXY'])
            const A = pointAbstrait(xA, yA, 'A')
            const B = pointAbstrait(xB, yB, 'B')
            const C = pointAbstrait(xC, yC, 'C')
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            const xM1 = 0
            const yM1 = 0
            const xM2 = 5
            const yM2 = 1
            const M1 = pointAbstrait(xM1, yM1, 'A')
            const M2 = pointAbstrait(xM2, yM2, 'B')
            const med = mediatrice(M1, M2) as Droite
            const M3 = pointIntersectionLC(med, cercle(M1, 5.5))
            const s1 = segment(M1, M3, 'black')
            s1.pointilles = 5
            const s2 = segment(M2, M3, 'black')
            s2.pointilles = 5
            const s3 = segment(M2, M1, bleuMathalea)
            handleAnswers(this, i, {
              reponse: {
                value: ['OUI', 'oui', 'Oui', 'O'],
                options: { texteSansCasse: true },
              },
            })
            texte =
              'Dans un repère orthonormé $(O\\,;\\,I\\,,\\,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$.`
            texte += `<br>Le point $${C.nom}\\left(${xC}\\,;\\,${yC}\\right)$ appartient-il à la médiatrice du segment  $[${A.nom}${B.nom}]$ ?`
            if (this.interactif) {
              texte +=
                '<br>Répondre par «\u00a0O\u00a0» (pour Oui) ou «\u00a0N\u00a0» (pour Non). ' +
                '<br>' +
                ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
            }
            const colonne1 = mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 6,
                ymax: 6.5,
                pixelsParCm: 25,
                scale: 0.6,
              },
              segment(M1, M2, bleuMathalea),
              tracePoint(M1, bleuMathalea),
              tracePoint(M2, bleuMathalea),
              tracePoint(M3, bleuMathalea),
              texteParPosition(`${A.nom}`, 0, -0.5),
              texteParPosition(`${B.nom}`, 5, 0.5),
              s1,
              s2,
              s3,
              texteParPosition(`${C.nom}`, 2, 5.5),
              med,
              codageAngleDroit(M2, milieu(M1, M2), M3),
              codageSegments('//', 'black', M1, M3, M2, M3),
              codageSegments(
                '/',
                'black',
                M1,
                milieu(M1, M2),
                M2,
                milieu(M1, M2),
              ),
            )
            const colonne2 = `${texteGras('Rappel :')} La médiatrice du segment $[${A.nom}${B.nom}]$ est la droite qui passe  par le milieu de $[${A.nom}${B.nom}]$ et qui est perpendiculaire à $[${A.nom}${B.nom}]$.<br><br>
           Cette droite est l'ensemble des points équidistants des deux extrémités du segment.`

            if (this.correctionDetaillee) {
              texteCorr = deuxColonnes(colonne1, colonne2)
              texteCorr += `Cela signifie que $${C.nom}$ est un point de la médiatrice de $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$. <br>
            Ainsi, le point $${C.nom}$ appartient à la médiatrice du segment $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$.<br>
            `
              texteCorr += `<br>${CorrD}`
            } else {
              texteCorr = `Le point $${C.nom}$ appartient à la médiatrice du segment $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$.<br>`
            }
            texteCorr += '<br>On calcule séparément ces deux distances.<br>'
            texteCorr += `<br>$\\phantom{On applique la relation } ${C.nom}${B.nom}=\\sqrt{\\left(${xB}-${ecritureParentheseSiNegatif(xC)}\\right)^{2}+\\left(${yB}-${ecritureParentheseSiNegatif(yC)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{on applique la relation         } ${C.nom}${B.nom}=\\sqrt{${XBC}+${YBC}}$<br>`
            texteCorr += `$\\phantom{on applique la relation        } ${C.nom}${B.nom}=\\sqrt{${texNombre(XBC + YBC)}}$<br>`
            if (extraireRacineCarree(BC)[0] !== 1) {
              texteCorr += `$\\phantom{on applique la relation    } ${C.nom}${B.nom}=${texRacineCarree(BC)}$<br>`
            }
            texteCorr += `<br>De même : $${C.nom}${A.nom}=\\sqrt{\\left(${xA}-${ecritureParentheseSiNegatif(xC)}\\right)^{2}+\\left(${yA}-${ecritureParentheseSiNegatif(yC)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${C.nom}${A.nom}=\\sqrt{${XAC}+${YAC}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${C.nom}${A.nom}=\\sqrt{${texNombre(XAC + YAC)}}$<br>`
            if (extraireRacineCarree(AC)[0] !== 1) {
              texteCorr += `$\\phantom{De même :   } ${C.nom}${A.nom}=${texRacineCarree(AC)}$<br>`
            }
            texteCorr += `On observe que $${C.nom}${A.nom}=${C.nom}${B.nom}$ donc le point $${C.nom}$ est équidistant de $${A.nom}$ et $${B.nom}$.`
            texteCorr += `<br>Le point $${C.nom}$ appartient bien à la médiatrice du segment $[${A.nom}${B.nom}]$.`
            variables.push(xA, yA, xB, yB, xC, yC)
          }
          break
        case 5:
          {
            const xA = randint(0, 5) * choice([-1, 1])
            const yA = randint(0, 9) * choice([-1, 1])
            const ux = randint(0, 9) * choice([-1, 1])
            const uy = randint(0, 9) * choice([-1, 1])
            const xB = xA + ux
            const yB = yA + uy
            const xC = xA + uy * choice([-1, 1]) + randint(1, 3)
            const yC = yA + ux * choice([-1, 1])
            // const XAB = (xB - xA) * (xB - xA) inutilisées !
            // const YAB = (yB - yA) * (yB - yA)
            // const AB = XAB + YAB
            const XAC = (xC - xA) * (xC - xA)
            const YAC = (yC - yA) * (yC - yA)
            const AC = XAC + YAC
            const XBC = (xC - xB) * (xC - xB)
            const YBC = (yC - yB) * (yC - yB)
            const BC = XBC + YBC
            const nom = creerNomDePolygone(3, ['OIJDXY'])
            const A = pointAbstrait(xA, yA, 'A')
            const B = pointAbstrait(xB, yB, 'B')
            const C = pointAbstrait(xC, yC, 'C')
            A.nom = nom[0]
            B.nom = nom[1]
            C.nom = nom[2]
            const xM1 = 0
            const yM1 = 0
            const xM2 = 5
            const yM2 = 1
            const M1 = pointAbstrait(xM1, yM1, 'A')
            const M2 = pointAbstrait(xM2, yM2, 'B')
            const med = mediatrice(M1, M2) as Droite
            const M3 = pointIntersectionLC(med, cercle(M1, 5.5))
            const s1 = segment(M1, M3, 'black')
            s1.pointilles = 5
            const s2 = segment(M2, M3, 'black')
            s2.pointilles = 5
            const s3 = segment(M2, M1, bleuMathalea)
            handleAnswers(this, i, {
              reponse: {
                value: ['NON', 'non', 'Non', 'N'],
                options: { texteSansCasse: true },
              },
            })
            texte =
              'Dans un repère orthonormé $(O\\,;\\,I\\,,\\,J)$, on donne les points suivants :'
            texte += ` $${A.nom}\\left(${xA}\\,;\\,${yA}\\right)$ et $${B.nom}\\left(${xB}\\,;\\,${yB}\\right)$.`
            texte += `<br>Le point $${C.nom}\\left(${xC}\\,;\\,${yC}\\right)$ appartient-il à la médiatrice du segment  $[${A.nom}${B.nom}]$ ?`
            if (this.interactif) {
              texte +=
                '<br>Répondre par «\u00a0O\u00a0» (pour Oui) ou «\u00a0N\u00a0» (pour Non). ' +
                '<br>' +
                ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
            }
            const colonne1 = mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 6,
                ymax: 6.5,
                pixelsParCm: 25,
                scale: 0.6,
              },
              segment(M1, M2, bleuMathalea),
              tracePoint(M1, bleuMathalea),
              tracePoint(M2, bleuMathalea),
              tracePoint(M3, bleuMathalea),
              texteParPosition(`${A.nom}`, 0, -0.5),
              texteParPosition(`${B.nom}`, 5, 0.5),
              s1,
              s2,
              s3,
              texteParPosition(`${C.nom}`, 2, 5.5),
              med,
              codageAngleDroit(M2, milieu(M1, M2), M3),
              codageSegments('//', 'black', M1, M3, M2, M3),
              codageSegments(
                '/',
                'black',
                M1,
                milieu(M1, M2),
                M2,
                milieu(M1, M2),
              ),
            )
            const colonne2 = `${texteGras('Rappel :')} La médiatrice du segment $[${A.nom}${B.nom}]$ est la droite qui passe  par le milieu de $[${A.nom}${B.nom}]$ et qui est perpendiculaire à $[${A.nom}${B.nom}]$.<br><br>
           Cette droite est l'ensemble des points équidistants des deux extrémités du segment.`

            if (this.correctionDetaillee) {
              texteCorr = deuxColonnes(colonne1, colonne2)
              texteCorr += `Cela signifie que $${C.nom}$ est un point de la médiatrice de $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$. <br>
            Ainsi, le point $${C.nom}$ appartient à la médiatrice du segment $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$.<br>
            `
              texteCorr += `${CorrD}`
            } else {
              texteCorr = `Le point $${C.nom}$ appartient à la médiatrice du segment $[${A.nom}${B.nom}]$ si et seulement si $${C.nom}${A.nom}=${C.nom}${B.nom}$.<br>`
            }
            texteCorr += '<br>On calcule séparément ces deux distances.<br>'
            texteCorr += `<br>$\\phantom{On applique la relation } ${C.nom}${B.nom}=\\sqrt{\\left(${xB}-${ecritureParentheseSiNegatif(xC)}\\right)^{2}+\\left(${yB}-${ecritureParentheseSiNegatif(yC)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{on applique la relation         } ${C.nom}${B.nom}=\\sqrt{${XBC}+${YBC}}$<br>`
            texteCorr += `$\\phantom{on applique la relation        } ${C.nom}${B.nom}=\\sqrt{${texNombre(XBC + YBC)}}$<br>`
            if (extraireRacineCarree(BC)[0] !== 1) {
              texteCorr += `$\\phantom{on applique la relation    } ${C.nom}${B.nom}=${texRacineCarree(BC)}$<br>`
            }
            texteCorr += `<br>De même : $${C.nom}${A.nom}=\\sqrt{\\left(${xA}-${ecritureParentheseSiNegatif(xC)}\\right)^{2}+\\left(${yA}-${ecritureParentheseSiNegatif(yC)}\\right)^{2}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${C.nom}${A.nom}=\\sqrt{${XAC}+${YAC}}$<br>`
            texteCorr += `$\\phantom{De même :       } ${C.nom}${A.nom}=\\sqrt{${texNombre(XAC + YAC)}}$<br>`
            if (extraireRacineCarree(AC)[0] !== 1) {
              texteCorr += `$\\phantom{De même :   } ${C.nom}${A.nom}=${texRacineCarree(AC)}$<br>`
            }

            texteCorr += `On observe que $${C.nom}${A.nom}\\neq ${C.nom}${B.nom}$ donc le point $${C.nom}$ n'appartient pas à la médiatrice du segment $[${A.nom}${B.nom}]$.`
            variables.push(xA, yA, xB, yB, xC, yC)
          }
          break
      }
      variables.push(typesDeQuestions)
      if (this.questionJamaisPosee(i, variables.map(String).join(''))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        if (typesDeQuestions !== 1) {
          this.listeReponsesCourtes[i] =
            typesDeQuestions === 2 || typesDeQuestions === 4 ? 'O' : 'N'
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
