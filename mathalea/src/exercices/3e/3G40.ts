import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { labelLatexPoint, labelPoint, texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  arete3d,
  demicercle3d,
  droite3d,
  point3d,
  rotation3d,
  rotationV3d,
  sensDeRotation3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { sphere3d } from '../../lib/3d/3dProjectionMathalea2d/Sphere3dPerspectiveCavaliere'

import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'
import type { AMCUneProposition } from '../../lib/amc/amcTypes'

export const dateDeModifImportante = '02/11/2022' // EE : Mise en place de this.sup2, des unités et du grossissement des points
export const titre = 'Se repérer sur une sphère'
export const amcReady = true
export const amcType = 'AMCHybride'

export const uuid = '75ea2'

export const refs = {
  'fr-fr': ['3G40'],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote, améliorations par Éric Elter
 *
 */
export default class ReperageSurLaSphere extends Exercice {
  declare sup: number
  declare sup2: boolean
  declare sup3: boolean
  declare sup4: boolean

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      ' 1 : Lire des coordonnées\n 2 : Placer des points\n 3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Coordonnées relatives']
    this.besoinFormulaire3CaseACocher = ['Axe Nord-Sud présent']
    this.besoinFormulaire4CaseACocher = ['Afficher demi-équateur caché']

    this.nbQuestions = 4
    this.sup = 3
    this.sup2 = false
    this.sup3 = false
    this.sup4 = false
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const inclinaison = 5
    const O = point3d(0, 0, 0, false, 'O')

    const Sph = sphere3d(
      O,
      10,
      context.isAmc ? 'darkgray' : 'red',
      'black',
      18,
      'black',
      36,
      'black',
      false,
      'black',
      inclinaison,
      false,
    )
    let listeTypeDeQuestions
    if (this.sup === 1)
      listeTypeDeQuestions = combinaisonListes([1], this.nbQuestions)
    else if (this.sup === 2)
      listeTypeDeQuestions = combinaisonListes([2], this.nbQuestions)
    else listeTypeDeQuestions = combinaisonListes([1, 2], this.nbQuestions)
    let texte
    let texteCorrection = ''

    const normalRot = vecteur3d(0, 1, 0)
    const droiteRot = droite3d(point3d(0, 0, 0), normalRot)
    let M = rotation3d(point3d(10, 0, 0, true, 'M'), droiteRot, inclinaison)
    const PoleNord = rotation3d(
      point3d(0, 0, 11, false, 'Nord'),
      droiteRot,
      inclinaison,
    )
    const PoleSud = rotation3d(
      point3d(0, 0, -11.5, false, 'Sud'),
      droiteRot,
      inclinaison,
    )
    const Pn = texteParPoint('Nord', PoleNord.c2d, 0, 'brown')
    const Ps = texteParPoint('Sud', PoleSud.c2d, 0, 'brown')
    Pn.taille = 15
    Pn.positionLabel = 'above'
    Ps.taille = 15
    Ps.positionLabel = 'below'

    const normalV = rotation3d(vecteur3d(0, 0, 1), droiteRot, inclinaison)
    M = rotationV3d(M, normalV, context.anglePerspective)
    const R = vecteur3d(O, M)
    let origine = rotation3d(
      point3d(0, -10, 0),
      droite3d(O, normalV),
      context.anglePerspective,
    )
    const normalH = rotationV3d(vecteur3d(O, origine), normalV, 90)
    if (context.isAmc) origine = rotation3d(origine, droite3d(O, normalH), -2) // Parce qu'il existe un décalage en Latex
    origine.c2d.nom = '0 ^\\circ'
    origine.c2d.positionLabel = 'above left'
    const uniteLongitudePositive = rotation3d(origine, droite3d(O, normalV), 8)
    uniteLongitudePositive.isVisible = true
    uniteLongitudePositive.c2d.nom = '10 ^\\circ'
    uniteLongitudePositive.c2d.positionLabel = 'above left'
    const uniteLongitudeNegative = rotation3d(
      origine,
      droite3d(O, normalV),
      this.sup2 ? -15 : -12,
    )
    uniteLongitudeNegative.isVisible = true
    uniteLongitudeNegative.c2d.nom = (this.sup2 ? '-' : '') + '10 ^\\circ'
    uniteLongitudeNegative.c2d.positionLabel = 'above left'
    let uniteLattitudePositive = rotation3d(origine, droite3d(O, normalH), -10)
    uniteLattitudePositive = rotation3d(
      uniteLattitudePositive,
      droite3d(O, normalV),
      -2,
    )
    uniteLattitudePositive.isVisible = true
    uniteLattitudePositive.c2d.nom = '10 ^\\circ'
    uniteLattitudePositive.c2d.positionLabel = 'above left'
    let uniteLattitudeNegative = rotation3d(origine, droite3d(O, normalH), 10)
    uniteLattitudeNegative = rotation3d(
      uniteLattitudeNegative,
      droite3d(O, normalV),
      this.sup2 ? -5 : -2,
    )
    uniteLattitudeNegative.isVisible = true
    uniteLattitudeNegative.c2d.nom = (this.sup2 ? '-' : '') + '10 ^\\circ'
    uniteLattitudeNegative.c2d.positionLabel = 'above left'
    const labelUnites = labelLatexPoint({
      points: [
        origine.c2d,
        uniteLattitudePositive.c2d,
        uniteLattitudeNegative.c2d,
        uniteLongitudePositive.c2d,
        uniteLongitudeNegative.c2d,
      ],
      color: 'black',
      taille: 10,
      couleurDeRemplissage: 'none',
    })

    if (context.isAmc) origine = rotation3d(origine, droite3d(O, normalH), 2) // Parce qu'il existe un décalage en Latex

    const greenwich = demicercle3d(
      O,
      normalH,
      rotation3d(vecteur3d(0, 0, -10), droiteRot, inclinaison),
      'indirect',
      false,
      context.isAmc ? 'darkgray' : 'green',
      0,
    )
    greenwich.epaisseur = context.isAmc ? 1.5 : 3

    greenwich.opacite = 1
    const objetsEnonce = []
    const objetsCorrection = [] // on initialise les tableaux des objets Mathalea2d
    const latitudes = []
    const longitudes = []
    const P = []
    const EstouOuest = []
    const NordouSud = []
    const E = texteParPoint(
      'Est',
      rotation3d(point3d(13.2, 0, 0, true, 'Est'), droiteRot, inclinaison).c2d,
      0,
      'brown',
    )
    E.taille = 15
    E.color = colorToLatexOrHTML('brown')
    E.positionLabel = 'above'
    const W = texteParPoint(
      'Ouest',
      rotation3d(point3d(-12, 0, 0, true, 'Ouest'), droiteRot, inclinaison).c2d,
      0,
      'brown',
    )
    W.taille = 15
    W.color = colorToLatexOrHTML('brown')
    W.positionLabel = 'below left'
    if (this.sup4) {
      const equateur2 = demicercle3d(
        O,
        normalV,
        R,
        'direct',
        true,
        context.isAmc ? 'black' : 'red',
        0,
      )
      equateur2.epaisseur = context.isAmc ? 1.5 : 3
      objetsEnonce.push(equateur2)
      objetsCorrection.push(equateur2)
    }
    if (this.sup3) {
      const Axe = arete3d(PoleSud, PoleNord)
      Axe.c2d.epaisseur = 2
      Axe.c2d.color = colorToLatexOrHTML(bleuMathalea)
      objetsEnonce.push(Axe.c2d)
      objetsCorrection.push(Axe.c2d)
    }

    if (this.sup2) {
      const rotationTerre = sensDeRotation3d(
        droite3d(O, normalV),
        rotation3d(vecteur3d(8, -8, 0), droiteRot, inclinaison),
        60,
        3,
        'purple',
      )
      objetsEnonce.push(...rotationTerre.c2d)
      objetsCorrection.push(...rotationTerre.c2d)
    }
    objetsEnonce.push(...Sph.c2d, greenwich, Pn, Ps, E, W, labelUnites)
    objetsCorrection.push(...Sph.c2d, greenwich, Pn, Ps, E, W, labelUnites)
    for (let i = 0; i < this.nbQuestions; i++) {
      latitudes.push(0)
      longitudes.push(0)
      P.push(point3d(0, 0, 0))
      EstouOuest.push('O')
      NordouSud.push('N')
    }
    const nom = choisitLettresDifferentes(this.nbQuestions, 'QX')
    texte = ''

    const propositionsAmc: AMCUneProposition[] = []
    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonceAvant: false,
        enonceAvantUneFois: true,
        propositions: propositionsAmc,
      }
    }
    let iAMC = 0
    for (
      let i = 0, latitude, longitude, M, lab, croix, texteAMC;
      i < this.nbQuestions;
    ) {
      latitude = randint(-3, 6, 0) * 10
      longitude = randint(-6, 4, 0) * 10
      while (
        latitudes.indexOf(latitude) !== -1 &&
        longitudes.indexOf(longitude) !== -1
      ) {
        latitude = randint(-3, 6, 0) * 10
        longitude = randint(-6, 4, 0) * 10
      }
      latitudes[i] = latitude
      longitudes[i] = longitude
      if (longitudes[i] < 0) EstouOuest[i] = 'O'
      else EstouOuest[i] = 'E'
      if (latitudes[i] < 0) NordouSud[i] = 'S'
      else NordouSud[i] = 'N'
      M = rotation3d(origine, droite3d(O, normalH), -latitudes[i])
      P[i] = rotation3d(M, droite3d(O, normalV), longitudes[i])
      P[i].isVisible = true
      P[i].c2d.nom = `${nom[i]}`
      P[i].c2d.positionLabel = 'above left'
      lab = labelPoint(P[i].c2d)
      lab.forEach((label) => {
        label.color = colorToLatexOrHTML(bleuMathalea)
        label.taille = 15
      })
      croix = tracePoint(P[i].c2d)
      croix.taille = 5
      croix.epaisseur = 2
      croix.color = colorToLatexOrHTML(bleuMathalea)
      croix.style = 'x'

      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte += `${this.nbQuestions > 1 ? numAlpha(i) : ''} Donner les coordonnées GPS du point $${nom[i]}$.<br>`
          texteCorrection += `${numAlpha(i)} Les coordonnées de $${nom[i]}$ sont `
          texteCorrection += this.sup2
            ? `${texteEnCouleurEtGras(`($${latitudes[i]}^\\circ$ ; $${longitudes[i]}^\\circ$)`)}.<br>`
            : `${texteEnCouleurEtGras(`($${Math.abs(latitudes[i])}^\\circ$${NordouSud[i]} ; $${Math.abs(longitudes[i])}^\\circ$${EstouOuest[i]})`)}.<br>`
          objetsEnonce.push(croix, lab)
          objetsCorrection.push(croix, lab)
          if (context.isAmc) {
            propositionsAmc.push({
              type: 'AMCOpen',
              propositions: [
                {
                  texte: ' ',
                  statut: 1, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: `${numAlpha(iAMC)} Donner la latitude du point $${nom[i]}$.`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  sanscadre: false,
                  pointilles: false,
                },
              ],
            })
            iAMC++
            propositionsAmc.push({
              type: 'AMCOpen',
              propositions: [
                {
                  texte: ' ',
                  statut: 1, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: `${numAlpha(iAMC)} Donner la longitude du point $${nom[i]}$.`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  sanscadre: false,
                  pointilles: false,
                },
              ],
            })
          }
          iAMC++
          break
        case 2:
          texteAMC = `Placer le point $${nom[i]}$ de  coordonnées GPS `
          texteAMC += this.sup2
            ? `($${latitudes[i]}^\\circ$ ; $${longitudes[i]}^\\circ$).<br>`
            : `($${Math.abs(latitudes[i])}^\\circ$${NordouSud[i]} ; $${Math.abs(longitudes[i])}^\\circ$${EstouOuest[i]}).<br>`
          texte += `${this.nbQuestions > 1 ? numAlpha(i) : ''} ` + texteAMC
          texteCorrection += `${numAlpha(i)} Le point $${nom[i]}$ de coordonnées GPS `
          texteCorrection += this.sup2
            ? `($${latitudes[i]}^\\circ$ ; $${longitudes[i]}^\\circ$).<br>`
            : `($${Math.abs(latitudes[i])}^\\circ$${NordouSud[i]} ; $${Math.abs(longitudes[i])}^\\circ$${EstouOuest[i]}).<br>`
          texteCorrection += ' est placé sur cette sphère.<br>'
          objetsCorrection.push(croix, lab)
          if (context.isAmc) {
            propositionsAmc.push({
              type: 'AMCOpen',
              propositions: [
                {
                  texte: ' ',
                  statut: 1, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: `${numAlpha(iAMC)} ${texteAMC}`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  sanscadre: true,
                },
              ],
            })
          }
          iAMC++
          break
      }
      i++
    }
    // paramètres pour la perspective
    context.anglePerspective = 30
    context.coeffPerspective = 0.5

    const paramsEnonce = Object.assign({}, fixeBordures(objetsEnonce), {
      pixelsParCm: 20,
      scale: 0.3,
      mainlevee: false,
    })
    if (context.isAmc)
      this.autoCorrection[0].enonce =
        mathalea2d(paramsEnonce, objetsEnonce) + '<br>'

    texte += '<br>' + mathalea2d(paramsEnonce, objetsEnonce)
    texteCorrection += '<br>' + mathalea2d(paramsEnonce, objetsCorrection)
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorrection)
    listeQuestionsToContenuSansNumero(this)
  }
}
