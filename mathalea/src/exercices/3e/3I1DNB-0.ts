import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { rotation, translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { createList } from '../../lib/format/lists'
import {
  centrage,
  deuxColonnesResp,
  troisColonnes,
} from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras, texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import ExerciceBrevetA from '../ExerciceBrevetA'

export const uuid = '972f6'
export const refs = {
  'fr-fr': ['3I1DNB-0', '3Z1DNB-16'],
  'fr-ch': [],
}
export const titre = 'Se préparer au DNB : Scratch'
export const dateDePublication = '7/12/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 */
export default class Exercice3I1DNB0 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.introduction = texteItalique(
      "D'après l'exercice $5$ du brevet Amérique du sud 2024.",
    ) + '<br>'

    this.versionAleatoire(0)
  }

  private appliquerLesValeurs(
    figure: string,
    av: number,
    rep: number,
    av2: number,
    rep2: number,
    angle: number,
    sens: 'direct' | 'indirect',
  ) {
    // enonce
    const ppcm = 15
    const sc = 0.5
    let texteScratch1: string
    let texteScratch2: string
    let poly
    const droit = sens === 'direct'
    const s = droit ? -1 : 1
    switch (figure) {
      case 'rectangle':
        {
          texteScratch1 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]
        \\initmoreblocks{définir \\namemoreblocks{${figure}}}
        \\blockpen{stylo en position d'écriture}
        \\blockrepeat{répéter \\ovalnum{2} fois}
        {
        \\blockmove{avancer de \\ovalnum{${av}} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{90} degrés}
         \\blockmove{avancer de \\ovalnum{a} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{b} degrés}
      }
         \\blockpen{relever le stylo}
         \\end{scratch}`
          texteScratch2 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]
        \\initmoreblocks{définir \\namemoreblocks{Motif A}}
        \\blockrepeat{répéter \\ovalnum{${rep}} fois}
        {
           \\blockmoreblocks{${figure}}
           \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{${angle}} degrés}
        }
         \\end{scratch}\n`
          const depart = pointAbstrait(0, 0)
          const p1 = translation(depart, vecteur(av / 5, 0))
          const p2 = rotation(translation(p1, vecteur(av / 10, 0)), p1, s * 90)
          const p3 = translation(p2, vecteur(-av / 5, 0))
          poly = polygone([depart, p1, p2, p3])
        }
        break
      case 'carré':
        {
          texteScratch1 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]
        \\initmoreblocks{définir \\namemoreblocks{${figure}}}
        \\blockpen{stylo en position d'écriture}
        \\blockrepeat{répéter \\ovalnum{2} fois}
        {
        \\blockmove{avancer de \\ovalnum{${av}} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{90} degrés}
         \\blockmove{avancer de \\ovalnum{a} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{b} degrés}
      }
         \\blockpen{relever le stylo}
         \\end{scratch}\n`
          texteScratch2 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]
        \\initmoreblocks{définir \\namemoreblocks{Motif A}}
        \\blockrepeat{répéter \\ovalnum{${rep}} fois}
        {
           \\blockmoreblocks{${figure}}
           \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{${angle}} degrés}
        }
         \\end{scratch}\n`
          const depart = pointAbstrait(0, 0)
          const p1 = translation(depart, vecteur(av / 5, 0))
          const p2 = rotation(translation(p1, vecteur(av / 5, 0)), p1, s * 90)
          const p3 = translation(p2, vecteur(-av / 5, 0))
          poly = polygone([depart, p1, p2, p3])
        }
        break
      default:
        {
          texteScratch1 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]\n
        \\initmoreblocks{définir \\namemoreblocks{${figure}}}
        \\blockpen{stylo en position d'écriture}
        \\blockrepeat{répéter \\ovalnum{2} fois}
        {
        \\blockmove{avancer de \\ovalnum{${av}} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{60} degrés}
         \\blockmove{avancer de \\ovalnum{a} pas}
        \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{b} degrés}
      }
         \\blockpen{relever le stylo}
         \\end{scratch}\n`
          texteScratch2 = `\\begin{scratch}[${context.isHtml ? '' : 'print,'} fill blocks,scale=0.8]
        \\initmoreblocks{définir \\namemoreblocks{Motif A}}
        \\blockrepeat{répéter \\ovalnum{${rep}} fois}
        {
           \\blockmoreblocks{${figure}}
           \\blockmove{tourner ${droit ? '\\turnright{}' : '\\turnleft{}'} de \\ovalnum{${angle}} degrés}
        }
         \\end{scratch}\n`
          const depart = pointAbstrait(0, 0)
          const p1 = translation(depart, vecteur(av / 5, 0))
          const p2 = rotation(translation(p1, vecteur(av / 5, 0)), p1, s * 60)
          const p3 = translation(p2, vecteur(-av / 5, 0))
          poly = polygone([depart, p1, p2, p3])
        }
        break
    }
    const info = texteParPosition('Point et', -5, 1)
    const info2 = texteParPosition('orientation', -5, 0)
    const info3 = texteParPosition('de départ.', -5, -1)

    const fleche = segment(pointAbstrait(-3, 0), pointAbstrait(-0.5, 0))
    fleche.styleExtremites = '->'
    const objets = [poly, fleche, info, info2, info3]
    const figure1 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets)),
      objets,
    )
    // 3 figures
    const objets2 = [poly]
    for (let i = 1; i < rep; i++) {
      objets2.push(rotation(poly, poly.listePoints[0], s * angle * i))
    }
    const fig3 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets2)),
      objets2,
    )
    const angle2 = this.sup
      ? angle - 10
      : angle === 50
        ? 60
        : angle === 60
          ? 70
          : 60

    const objets3 = [poly]
    for (let i = 1; i < (figure === 'losange' ? 6 : 8); i++) {
      objets3.push(rotation(poly, poly.listePoints[0], s * angle * i))
    }
    const fig2 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets3)),
      objets3,
    )

    const objets4 = [poly]
    for (let i = 1; i < rep; i++) {
      objets4.push(rotation(poly, poly.listePoints[0], s * angle2 * i))
    }
    const fig1 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets4)),
      objets4,
    )
    let figs = [fig1, fig2, fig3]
    const permute = 3 // randint(0, 2)
    if (!this.sup) {
      figs = figs.map((_, i, arr) => arr[(i - permute + 3) % 3])
    }

    const objets5 = [poly]
    for (let i = 1; i < rep2; i++) {
      objets5.push(translation(poly, vecteur((i * av2) / 5, 0)))
    }
    const fig4 = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets5)),
      objets5,
    )
    let enonce = `Dans cet exercice, aucune justification n'est attendue pour les réponses apportées aux questions $1$ et $2$.<br>
À l'aide d'un logiciel de programmation, on définit un bloc ${premiereLettreEnMajuscule(figure)} pour construire un ${figure}.<br>
${deuxColonnesResp(
  `${centrage(texteEnCouleurEtGras(`Bloc «${sp()}${figure}${sp()}»`, 'black'))}
${scratchblock(texteScratch1)}`,
  `${centrage(texteEnCouleurEtGras(`${premiereLettreEnMajuscule(figure)} obtenu`, 'black'))}
${figure1}`,
  { largeur1: 50, widthmincol1: '100px', widthmincol2: '100px', eleId: '' },
)}
`
    const listeFigs = figs.map(
      (el, k) => `${centrage(`figure $${k + 1}$`)}${el}`,
    ) as [string, string, string]
    enonce += createList({
      items: [
        `Dans le bloc «${sp()}${figure}${sp()}», par quelles valeurs faut-il remplacer $a$ et $b$ pour obtenir le ${figure} ci-dessus${sp()}?`,
        `On définit ensuite un nouveau bloc nommé «${sp()}Motif A${sp()}»${sp()}:<br>
    ${scratchblock(texteScratch2)}<br>
    Parmi les figures ci-dessous, laquelle est obtenue en utilisant le bloc «${sp()}Motif A${sp()}»${sp()}?<br>
    ${troisColonnes(...listeFigs, 200, 200)}`,
        `On définit un nouveau bloc nommé «${sp()}Motif B${sp()}»${sp()}:<br>
    En l'exécutant on obtient la figure ci-dessous${sp()}:<br>
    ${centrage(fig4)}
    Écrire un script du bloc «${sp()}Motif B${sp()}».`,
      ],
      style: 'nombres',
    })

    // correction
    const correction1 = createList({
      items: [
        `${
          figure === 'rectangle'
            ? `Le ${figure} ci-dessus, a une largeur qui est la moitié de sa longueur, il faut donc remplacer $a$ par $${miseEnEvidence(av / 2)}$.<br>`
            : `La figure ci-dessus est un ${figure} dont les côtés sont de même mesure, il faut donc remplacer $a$ par $${miseEnEvidence(av)}$.<br>`
        }
        ${
          figure === 'losange'
            ? `À la fin du premier bloc «${sp()}répéter${sp()}», on a effectué un demi-tour. On a donc $60+b=180$, c'est-à-dire $b$ est le supplémentaire de 60. Il faut remplacer $b$ par $${miseEnEvidence(120)}$.<br>`
            : `Le ${figure} possédant quatre angles droits, il faut remplacer $b$ par $${miseEnEvidence(90)}$.<br>`
        }`,
        `La figure obtenue en utilisant le bloc «${sp()}Motif A${sp()}» est la figure $${miseEnEvidence(this.sup ? 3 : ((2 + permute) % 3) + 1)}$.<br>
        En effet, la figure ${this.sup ? 1 : ((0 + permute) % 3) + 1} est obtenue en utilisant un angle de $${angle2}^{\\circ}$ et la figure ${this.sup ? 2 : ((1 + permute) % 3) + 1} comporte $${figure === 'rectangle' ? 8 : 6}$ ${figure}s.`,
        `Voici un script du bloc «${sp()}Motif B${sp()}»${sp()}:<br>
        ${scratchblock(`\\begin{scratch}[${context.isHtml ? 'print,' : ''}fill,blocks,scale=0.8]\n
        \\initmoreblocks{définir \\namemoreblocks{Motif B}}
        \\blockpen{stylo en position d'écriture}
        \\blockrepeat{répéter \\ovalnum{${rep2}} fois}
        {
           \\blockmoreblocks{${figure}}
           \\blockmove{avancer de \\ovalnum{${av2}} pas}
        }
         \\end{scratch}\n`)}`,
      ],
      style: 'nombres',
    })
    this.enonce = enonce
    this.correction = correction1
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('losange', 20, 3, 40, 3, 60, 'direct')
  }

  versionAleatoire: (i: number) => void = (i: number) => {
    const figure = choice(['carré', 'losange', 'rectangle'])
    const rep2 = choice([3, 4, 5])
    const av = randint(4, 5) * 5
    const av2 = rep2 > 4 ? av / 2 : rep2 > 3 ? av : av * 2

    const angle = figure === 'losange' ? choice([50, 60, 70]) : 45
    const rep = figure === 'losange' ? choice([3, 4, 5]) : choice([4, 6])

    const sens = choice(['direct', 'indirect']) as 'direct' | 'indirect'

    this.appliquerLesValeurs(figure, av, rep, av2, rep2, angle, sens)
  }
}
