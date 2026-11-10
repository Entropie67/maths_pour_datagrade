import { droite } from '../../lib/2d/droites'
import {
  listeFigures2d,
  type Forme,
} from '../../lib/2d/figures2d/listeFigures2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { latex2d } from '../../lib/2d/textes'
import {
  homothetie,
  projectionOrtho,
  rotation,
} from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Dire si deux figures sont symétriques par rapport à une droite'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '17/05/2025'

/**
 * Reconnaitre des figures symétriques par rapport à une droite donnée.
 * @author Jean-claude Lhote
 */
export const uuid = '528b2'

export const refs = {
  'fr-fr': ['6G1autoC-1', '6AutoG3-2'],
  'fr-2016': ['6G25-5'],
  'fr-ch': ['9R1ES4C-6', '9R2ES4C-6', '9R3ES4C-6', 'PRQES02D-9'],
}

export default class NbAxesDeSymetrie extends Exercice {
  constructor() {
    super()
    this.comment = `Dans cet exercice, la fréquence des figures symétriques est de 40${sp()}%. Les cas de non symétries sont variés : homothétie, rotation, translation.<br>
    Pour l'impression, privilégier les petites figures et l'axe plutôt vertical`
    this.nbQuestions = 3
    this.sup = '1'
    this.besoinFormulaireTexte = [
      "Type d'axes",
      'Nombres séparés par des tirets :\n1 : Plutôt vertical\n2 : Plutôt horizontal\n3 : Plutôt oblique\n4 : Mélange',
    ]
    this.besoinFormulaire4CaseACocher = ['Grandes figures', true]
    this.sup4 = true
  }

  nouvelleVersion(): void {
    const factor = this.sup4 ? 3 : 1.5
    const numerosChoisis: number[] = []
    const typeAxe = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['vertical', 'horizontal', 'oblique'],
    })
    for (let i = 0; i < this.nbQuestions;) {
      let texte = ''
      let texteCorr = ''
      const objets: NestedObjetMathalea2dArray = []
      const objetsCorr: NestedObjetMathalea2dArray = []

      const typeDeFigureChoisie = 'geometrique'
      const listeFigs = listeFigures2d
        .filter((el) => el.type === typeDeFigureChoisie)
        .filter((el) => !numerosChoisis.includes(el.numero))
      if (listeFigs.length === 0) {
        this.listeQuestions.push('Aucune figure disponible')
        this.listeCorrections.push('Aucune figure disponible')
        break
      }
      const choix = listeFigs.filter(
        (el) => !numerosChoisis.includes(el.numero),
      )
      const figure: Forme = choice(choix)
      numerosChoisis.push(figure.numero)
      texte += `Les deux figures sont-elles symétriques par rapport à la droite $(d_{${(i + 1) % 10}})$ ?<br>`
      const alpha = randint(-4, 4, [0]) * 15
      const options = figure.options ?? {}
      const forme =
        typeAxe[i] === 'vertical'
          ? figure
              .figure2d(options)
              .dilate(factor)
              .rotate(alpha)
              .translate(-4.5, 0)
          : typeAxe[i] === 'horizontal'
            ? figure
                .figure2d(options)
                .dilate(factor)
                .rotate(alpha)
                .translate(0, 4.5)
            : figure
                .figure2d(options)
                .dilate(factor)
                .rotate(alpha)
                .translate(-4.5, 4.5)
      forme.name = figure.name.replace(/ /g, '_')
      forme.opacite = 0.5
      objets.push(forme)
      const beta = choice([-8, 8])
      const angle =
        typeAxe[i] === 'vertical' ? 0 : typeAxe[i] === 'horizontal' ? 90 : -45
      const axe = rotation(
        droite(pointAbstrait(0, -1), pointAbstrait(0, 1)),
        pointAbstrait(0, 0),
        angle + beta,
      )

      objets.push(axe)
      const centre =
        typeAxe[i] === 'vertical'
          ? pointAbstrait(-4.5, 0)
          : typeAxe[i] === 'horizontal'
            ? pointAbstrait(0, 4.5)
            : pointAbstrait(-4.5, 4.5)
      const h = projectionOrtho(centre, axe)
      const v = homothetie(vecteur(centre, h), h, 2)
      const choixReponse = choice([
        'translation',
        'symetrie',
        'symetrie',
        'rotation',
        'homothetie',
      ])
      let forme2
      switch (choixReponse) {
        case 'translation':
          forme2 = forme.copy(forme.name + 'b').translate(v.x, v.y)
          objets.push(forme2)

          break
        case 'symetrie':
          forme2 = forme.symetrie(axe)
          forme2.opacite = 0.5
          objets.push(forme2)
          break

        case 'homothetie':
          forme2 = forme
            .copy(forme.name + 'b')
            .translate(-centre.x, -centre.y)
            .dilate(choice([1.3, 0.75]))
            .translate(centre.x, centre.y)
          forme2 = forme2.symetrie(axe)
          objets.push(forme2)
          break

        case 'rotation':
        default:
          forme2 = forme
            .copy(forme.name + 'b')
            .rotate(180 - angle - 4 * beta)
            .translate(v.x, v.y)
          objets.push(forme2)
          break
      }
      const nomDroite = latex2d(
        `(d_{${(i + 1) % 10}})`,
        axe.x2 + 0.6,
        axe.y2,
        {},
      )
      objets.push(nomDroite)
      texte += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures(objets, { rxmax: 3, rymax: 1, rymin: -1 }),
        ),
        objets,
      )
      if (this.interactif) {
        this.autoCorrection[i] = {
          propositions: [
            { texte: 'Oui', statut: choixReponse === 'symetrie' },
            { texte: 'Non', statut: choixReponse !== 'symetrie' },
          ],
          options: {
            ordered: true,
            radio: true,
          },
        }
        // const monQcm = propositionsQcm(this, i, { style: 'inline-block', format: 'case', radio: true })
        const monQcm = propositionsQcm(this, i, {
          style: 'inline-block',
          format: 'case',
        })
        texte += `${monQcm.texte}`
      }
      const onDirectionChange = (direction = 1) => {
        if (direction === 1) return
        // Ajoute l'icône à côté de la figure symétrique (forme2)
        const elem = document.getElementById(
          `${forme.name}Corr_${i - 1}`,
        ) as unknown as SVGElement // Je n'ai pas compris pourquoi il faut -1
        // On ne peut pas insérer un span dans un SVG, donc on crée un élément SVG pour l'icône
        if (
          elem &&
          !elem.ownerSVGElement?.querySelector(`#icone-resultat-${i}`)
        ) {
          const svgNS = 'http://www.w3.org/2000/svg'
          const iconGroup = document.createElementNS(svgNS, 'g')
          iconGroup.setAttribute('id', `icone-resultat-${i}`)
          iconGroup.setAttribute('class', 'icone-resultat')
          // Positionne l'icône à droite de la figure (décalage arbitraire, à ajuster si besoin)
          //   const bbox = elem.getBBox()
          const x = 0 // bbox.x + bbox.width + 100
          const y = 0 // bbox.y + bbox.height / 2
          if (choixReponse === 'symetrie') {
            // coche verte
            const path = document.createElementNS(svgNS, 'path')
            path.setAttribute('d', 'M4 20 L16 32 L36 8')
            path.setAttribute('stroke', 'green')
            path.setAttribute('stroke-width', '5')
            path.setAttribute('fill', 'none')
            path.setAttribute('stroke-linecap', 'round')
            path.setAttribute('stroke-linejoin', 'round')
            iconGroup.appendChild(path)
          } else {
            // croix rouge
            const line1 = document.createElementNS(svgNS, 'line')
            line1.setAttribute('x1', '4')
            line1.setAttribute('y1', '4')
            line1.setAttribute('x2', '36')
            line1.setAttribute('y2', '36')
            line1.setAttribute('stroke', 'red')
            line1.setAttribute('stroke-width', '5')
            line1.setAttribute('stroke-linecap', 'round')
            const line2 = document.createElementNS(svgNS, 'line')
            line2.setAttribute('x1', '36')
            line2.setAttribute('y1', '4')
            line2.setAttribute('x2', '4')
            line2.setAttribute('y2', '36')
            line2.setAttribute('stroke', 'red')
            line2.setAttribute('stroke-width', '5')
            line2.setAttribute('stroke-linecap', 'round')
            iconGroup.appendChild(line1)
            iconGroup.appendChild(line2)
          }
          iconGroup.setAttribute('transform', `translate(${x},${y}) scale(1.2)`)
          elem.ownerSVGElement?.appendChild(iconGroup)
          setTimeout(() => {
            iconGroup.remove()
          }, 2000)
        }
      }
      const anim = forme.loopReflectionAnimee(
        axe,
        `${forme.name}Corr_${i}`,
        onDirectionChange,
      )
      const formeBis = forme.copy(forme.name + 'Bis')
      formeBis.opacite = 0.3
      const forme2Bis = forme2.copy(forme2.name + 'Bis')
      forme2Bis.opacite = 0.3
      objetsCorr.push(formeBis, forme2Bis, anim, axe, nomDroite)
      texteCorr += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures(objetsCorr, { rxmax: 4, rymax: 2, rymin: -2.5 }),
        ),
        objetsCorr,
      )
      texteCorr += `Les deux figures ${texteEnCouleurEtGras((choixReponse === 'symetrie' ? 'sont' : 'ne sont pas') + ' symétriques')} par rapport à la droite $(d_{${(i + 1) % 10}})$.<br>`
      texteCorr +=
        choixReponse === 'homothetie'
          ? "Les figures n'ont pas la même taille."
          : choixReponse === 'translation'
            ? `Les figures ne sont pas symétriques par rapport à la droite $(d_{${(i + 1) % 10}})$, comme le montre l'animation.`
            : choixReponse === 'rotation'
              ? `L'animation montre que les figures ne sont pas symétriques par rapport à la droite $(d_{${(i + 1) % 10}})$.`
              : `L'animation montre que par pliage selon l'axe  $(d_{${(i + 1) % 10}})$ les deux figures se superposent parfaitement.`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
