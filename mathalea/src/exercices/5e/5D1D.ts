import { arc } from '../../lib/2d/Arc'
import { cercleCentrePoint } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { traceBarre, traceGraphiqueCartesien } from '../../lib/2d/diagrammes'
import { motifs } from '../../lib/2d/pattern'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { texcolors } from '../../lib/format/style'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { rangeMinMax } from '../../lib/outils/nombres'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '20/03/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '08/04/2026'
export const titre = 'Représenter des données par un diagramme'

/**
 * @author Mickael Guironnet - Jean-claude Lhote
 */
export const uuid = 'd3ca7'

export const refs = {
  'fr-fr': ['5D1D'],
  'fr-2016': ['5S12'],
  'fr-ch': ['9R1FA2C-1', '9R2FA2C-1', '9R3FA2C-1', '10CTFA2B-1', '10LCFA2B-1', '10LSFA2B-1', 'PRQST01B-3'],
}
export default class ConstruireUnDiagramme extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'espèces différentes",
      3,
      '1 : Deux espèces\n2 : Trois espèces\n3 : Quatre espèces',
    ]
    this.besoinFormulaire2Numerique = [
      'Valeurs numériques',
      2,
      '1 : Entre 1 et 100\n2 : Entre 100 et 1 000',
    ]
    this.besoinFormulaire3Numerique = [
      'Type de diagramme',
      5,
      '1 : Diagramme circulaire\n2 : Diagramme semi-circulaire\n3 : Diagramme en bâtons\n4 : Diagramme cartésien\n5 : Au hasard',
    ]
    this.besoinFormulaire4CaseACocher = ['Valeur exactes', true]
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 3
    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = true
    this.listeAvecNumerotation = false
    this.reponseCourteDisponible = false // La réponse est un diagramme.
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    if (this.sup3 < 5) {
      typesDeQuestionsDisponibles = [parseInt(this.sup3)]
    } else {
      typesDeQuestionsDisponibles = [randint(1, 4)]
    }
    let baseNombreAnimaux
    if (this.sup4) baseNombreAnimaux = 20
    else baseNombreAnimaux = randint(15, 24, 20)
    const listeHachuresDisponibles = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10]
    const listeMotifs = combinaisonListes(listeHachuresDisponibles, 4)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let nom
    let texte
    let texteCorr
    let nbAnimaux = 4 // nombre d'animaux différents dans l'énoncé
    const lstAnimauxExo: string[] = [] // liste des animaux uniquement cités dans l'exercice
    const lstNombresAnimaux: string[] = [] // liste des effectifs de chaque animal

    let paramsEnonce, paramsCorrection, coef, r, lstElementGraph, g
    const objetsEnonce = []
    const objetsCorrection = []
    const lstAnimaux = [
      'girafes',
      'zèbres',
      'buffles',
      'gazelles',
      'crocodiles',
      'rhinocéros',
      'léopards',
      'guépards',
      'hyènes',
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

    texte =
      'Dans le parc naturel de ' +
      choice(lstNomParc) +
      ", il y a beaucoup d'animaux.<br> Voici un tableau qui donne le nombre d'individus de quelques espèces.<br><br>"
    texteCorr = ''
    const entete = ['\\text{Animaux}']
    let contenutableau,
      A,
      B,
      T,
      angle,
      a,
      legende,
      textelegende,
      hachures,
      a0,
      t,
      alpha
    switch (parseInt(this.sup)) {
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

    const lstCoeffAnimaux = [] // liste des effectifs de chaque animal sur 20
    lstCoeffAnimaux.push(baseNombreAnimaux)
    const max = Math.floor(baseNombreAnimaux / nbAnimaux)
    for (let i = 0; i < nbAnimaux - 1; i++) {
      let k1: number = choice(rangeMinMax(2, max, lstCoeffAnimaux))
      if (k1 === undefined || k1 === null) {
        k1 = choice(rangeMinMax(2, max))
      }
      // const k1 = randint(2, Math.floor(20 / nbAnimaux), lstCoeffAnimaux)
      lstCoeffAnimaux.push(k1)
      lstCoeffAnimaux[0] -= k1
    }

    const factor = randint(3, 6)

    switch (parseInt(this.sup2)) {
      case 1:
        for (let i = 0; i < nbAnimaux; i++) {
          lstNombresAnimaux.push(String(lstCoeffAnimaux[i] * factor))
        }
        break
      case 2:
        for (let i = 0; i < nbAnimaux; i++) {
          lstNombresAnimaux.push(String(lstCoeffAnimaux[i] * factor * 10))
        }
        break
    }
    let effectiftotal = 0
    for (let i = 0; i < nbAnimaux; i++) {
      effectiftotal += Number(lstNombresAnimaux[i])
    }
    for (let i = 0; i < nbAnimaux; i++) {
      nom = choice(lstAnimaux, lstAnimauxExo) // choisit un animal au hasard sauf parmi ceux déjà utilisés
      lstAnimauxExo.push(nom)
      entete.push(`\\text{${nom}}`)
    }

    let emptyValues = []
    let yMax = 8
    switch (listeTypeDeQuestions[0]) {
      case 1:
        emptyValues = new Array(2 * nbAnimaux).fill('', 0, 2 * nbAnimaux)
        texte += `${tableauColonneLigne(entete, ['\\text{Effectifs}', '\\text{Fréquences}', '\\text{Angles}'], lstNombresAnimaux.concat(emptyValues))}<br><br>`
        texte += 'Représenter ces données par un diagramme circulaire.<br><br>'
        entete.push('\\text{Totaux}')
        contenutableau = []
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(lstNombresAnimaux[i])
        }
        contenutableau.push(texNombre(effectiftotal))
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(
            texFractionFromString(lstNombresAnimaux[i], effectiftotal) +
              egalOuApprox(Number(lstNombresAnimaux[i]) / effectiftotal, 2) +
              texNombre(Number(lstNombresAnimaux[i]) / effectiftotal, 2),
          )
        }
        contenutableau.push('1')
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(
            `${texFractionFromString(lstNombresAnimaux[i], effectiftotal)} \\times 360 ${egalOuApprox((Number(lstNombresAnimaux[i]) * 360) / effectiftotal, 0)} ${Math.round((Number(lstNombresAnimaux[i]) * 360) / effectiftotal)}^\\circ`,
          )
        }
        contenutableau.push('360^\\circ')

        texteCorr += `${tableauColonneLigne(entete, ['\\text{Effectifs}', '\\text{Fréquences}', '\\text{Angles}'], contenutableau, 3)}<br>`

        A = pointAbstrait(0, 0)
        B = pointAbstrait(6, 0)
        T = pointAbstrait(7, 0)
        a0 = cercleCentrePoint(A, B, 'black')
        objetsEnonce.push(a0)
        objetsCorrection.push(a0)
        alpha = 90

        t = tracePoint(A)
        t.style = '+'
        objetsEnonce.push(t)
        objetsCorrection.push(t)

        for (let i = 0; i < nbAnimaux; i++) {
          angle = (360 * Number(lstNombresAnimaux[i])) / effectiftotal
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
          objetsCorrection.push(a)
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
          objetsCorrection.push(legende, textelegende)
          paramsEnonce = {
            xmin: -6.5,
            ymin: -6.5,
            xmax: 6.5,
            ymax: 6.5,
            pixelsParCm: 20,
            scale: 1,
            mainlevee: false,
          }
          paramsCorrection = {
            xmin: -6.5,
            ymin: -6.5,
            xmax: 20,
            ymax: 6.5,
            pixelsParCm: 20,
            scale: 1,
            mainlevee: false,
          }
        }
        break
      case 2:
        emptyValues = new Array(2 * nbAnimaux).fill('', 0, 2 * nbAnimaux)
        texte += `${tableauColonneLigne(entete, ['\\text{Effectifs}', '\\text{Fréquences}', '\\text{Angles}'], lstNombresAnimaux.concat(emptyValues))}<br><br>`
        texte +=
          'Représenter ces données par un diagramme semi-circulaire.<br><br>'
        entete.push('\\text{Totaux}')
        contenutableau = []
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(lstNombresAnimaux[i])
        }
        contenutableau.push(texNombre(effectiftotal))
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(
            texFractionFromString(lstNombresAnimaux[i], effectiftotal) +
              egalOuApprox(Number(lstNombresAnimaux[i]) / effectiftotal, 2) +
              texNombre(Number(lstNombresAnimaux[i]) / effectiftotal, 2),
          )
        }
        contenutableau.push('1')
        for (let i = 0; i < nbAnimaux; i++) {
          contenutableau.push(
            `${texFractionFromString(lstNombresAnimaux[i], effectiftotal)} \\times 180 ${egalOuApprox((Number(lstNombresAnimaux[i]) * 180) / effectiftotal, 0)} ${Math.round((Number(lstNombresAnimaux[i]) * 180) / effectiftotal)}^\\circ`,
          )
        }
        contenutableau.push('180^\\circ')

        texteCorr += `${tableauColonneLigne(entete, ['\\text{Effectifs}', '\\text{Fréquences}', '\\text{Angles}'], contenutableau, 3)}<br>`

        A = pointAbstrait(0, 0)
        B = pointAbstrait(6, 0)
        T = pointAbstrait(7, 0)
        a0 = arc(B, A, 180, true, 'white', 'black')
        objetsEnonce.push(a0)
        objetsCorrection.push(a0)
        alpha = 0
        t = tracePoint(A)
        t.style = '+'
        objetsEnonce.push(t)
        objetsCorrection.push(t)

        for (let i = 0; i < nbAnimaux; i++) {
          angle = (180 * Number(lstNombresAnimaux[i])) / effectiftotal
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
          objetsCorrection.push(a)
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
          objetsCorrection.push(legende, textelegende)
          paramsEnonce = {
            xmin: -6.5,
            ymin: -0.2,
            xmax: 6.5,
            ymax: 6.5,
            pixelsParCm: 20,
            scale: 1,
            mainlevee: false,
          }
          paramsCorrection = {
            xmin: -6.5,
            ymin: -0.2,
            xmax: 20,
            ymax: 6.5,
            pixelsParCm: 20,
            scale: 1,
            mainlevee: false,
          }
        }
        break
      case 3:
        texte += `${tableauColonneLigne(entete, ['\\text{Effectifs}'], lstNombresAnimaux)}<br><br>`
        texte += 'Représenter ces données par un diagramme en bâtons.<br>'
        coef = 1
        switch (parseInt(this.sup2)) {
          case 1:
            coef = 1
            break
          case 2:
            coef = 10
            break
        }
        yMax = Math.max.apply(null, lstNombresAnimaux.map(Number))
        r = repere({
          grilleX: false,
          grilleY: 'pointilles',
          xThickListe: false,
          xLabelListe: false,
          yUnite: 0.1 / coef,
          yThickDistance: 10 * coef,
          yMax: yMax + 20 * coef,
          xMin: 0,
          xMax: 10,
          yMin: 0,
          axeXStyle: '',
          yLegende: "Nombre d'individus",
        })

        lstElementGraph = []
        for (let i = 0; i < nbAnimaux; i++) {
          objetsCorrection.push(
            traceBarre(
              ((r.xMax - r.xMin) / (nbAnimaux + 1)) * (i + 1),
              Number(lstNombresAnimaux[i]),
              premiereLettreEnMajuscule(lstAnimauxExo[i]),
              {
                unite: 0.1 / coef,
                couleurDeRemplissage: texcolors(i + 1),
                hachures: 'north east lines',
              },
            ),
          )
        }
        objetsCorrection.push(r)
        paramsEnonce = {
          xmin: -6.5,
          ymin: 0,
          xmax: 6.5,
          ymax: 0,
          pixelsParCm: 20,
          scale: 1,
          mainlevee: false,
        }
        paramsCorrection = {
          xmin: -6.5,
          ymin: -3.5,
          xmax: 20,
          ymax: yMax / 10 + 3,
          pixelsParCm: 20,
          scale: 1,
          mainlevee: false,
        }

        break

      case 4:
        texte += `${tableauColonneLigne(entete, ['\\text{Effectifs}'], lstNombresAnimaux)}<br><br>`
        texte += 'Représenter ces données par un graphique cartésien.<br>'
        coef = 1
        switch (parseInt(this.sup2)) {
          case 1:
            coef = 1
            break
          case 2:
            coef = 10
            break
        }
        yMax = Math.max.apply(null, lstNombresAnimaux.map(Number))
        r = repere({
          grilleX: false,
          grilleY: 'pointilles',
          xThickListe: false,
          xLabelListe: false,
          yUnite: 0.1 / coef,
          yThickDistance: 10 * coef,
          yMax: yMax + 20 * coef,
          xMin: 0,
          xMax: 10,
          yMin: 0,
          axeXStyle: '',
          yLegende: "Nombre d'individus",
        })

        lstElementGraph = []
        for (let i = 0; i < nbAnimaux; i++) {
          lstElementGraph.push([(i + 1) * 2, Number(lstNombresAnimaux[i])])
          objetsCorrection.push(
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
          objetsCorrection.push(segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1))
        }
        g = traceGraphiqueCartesien(lstElementGraph, r, {
          couleurDesPoints: 'red',
          couleurDuTrait: 'lightgray',
          styleDuTrait: '', // plein par défaut
          epaisseurDuTrait: 1,
          styleDesPoints: 'o', // croix par défaut
          tailleDesPoints: 3,
        })

        objetsCorrection.push(r, g)

        paramsEnonce = {
          xmin: -6.5,
          ymin: 0,
          xmax: 6.5,
          ymax: 0,
          pixelsParCm: 20,
          scale: 1,
          mainlevee: false,
        }
        paramsCorrection = {
          xmin: -6.5,
          ymin: -3.5,
          xmax: 20,
          ymax: yMax / 10 + 3,
          pixelsParCm: 20,
          scale: 1,
          mainlevee: false,
        }

        break
    }
    texte += mathalea2d(paramsEnonce, objetsEnonce)
    texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenuSansNumero(this) // On envoie l'exercice à la fonction de mise en page
  }
}
