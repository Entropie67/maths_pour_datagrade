import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteItalique, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb6ec'
export const refs = {
  'fr-fr': ['3Z1DNB-08'],
  'fr-ch': ['11LSFA1C-1'],
}
export const titre =
  'Préparation DNB : Volume, fonctions, vitesse, grandeurs composées'
export const dateDePublication = '08/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExercicePolynesie52024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction = texteItalique(
      "D'après l'exercice $5$ du brevet Polynésie 2024.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    r: number,
    h: number,
    v2: number,
    nom: string,
    duree: number,
    reste1: number,
    reste2: number,
  ): void {
    const v1 = v2 * 60
    const volume = Math.PI * r ** 2 * h
    const dureeMax = volume / v2
    const volumeArrondi = Math.round(volume * 10) / 10
    const volumeRestant = volumeArrondi - v1 * duree
    const xMin = -20
    const xMax = Math.ceil((dureeMax + 10) / 10) * 10
    const yMax = Math.ceil(volumeArrondi / 50) * 50 + 10
    const yMin = -30
    const rep = new RepereBuilder({ xMin, xMax, yMax, yMin })
      .setUniteY(0.1)
      .setUniteX(0.1)
      .setLabelY({ yMin, yMax, dy: 50 })
      .setLabelX({ xMin, xMax, dx: 50 })
      .setThickX({ xMin, xMax, dx: 50 })
      .setThickY({ yMin, yMax, dy: 50 })
      .setGrille({
        grilleX: { xMin, xMax, dx: 5 },
        grilleY: { yMin, yMax, dy: 5 },
      })
      .setGrilleSecondaire({
        grilleX: { xMin, xMax, dx: 0.5 },
        grilleY: { yMin, yMax, dy: 0.5 },
      })
    rep.yLabelEcart = 0.8
    const repBuild = rep.buildCustom()
    const f = (x: number) => volumeArrondi - v2 * x
    const cF = droite(
      pointAbstrait(xMin / 10, f(xMin) / 10),
      pointAbstrait(xMax / 10, f(xMax) / 10),
      '',
      'ForestGreen',
    )
    const lect1 = lectureAntecedent(
      Math.round((volumeArrondi - reste2) / v2 / 5) * 0.5,
      reste2 * 0.1,
      1,
      1,
      'red',
      `${reste2}`,
      `${Math.round((volumeArrondi - reste2) / v2 / 5) * 5}`,
    )
    const lect2 = lectureAntecedent(
      Math.round(dureeMax / 5) * 0.5,
      0,
      1,
      1,
      'purple',
      '',
      `${Math.round(dureeMax / 5) * 5}`,
    )
    const figure =
      mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.4 },
          fixeBordures([...repBuild.objets, cF]),
        ),
        repBuild.objets,
        cF,
      ) + ' <br'
    const figureCorrection = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.4 },
        fixeBordures([...repBuild.objets, cF, lect1, lect2]),
      ),
      repBuild.objets,
      cF,
      lect1,
      lect2,
    )

    this.enonce = `La piscine du camping ${nom} dispose d'un bassin circulaire de forme cylindrique de rayon $${texNombre(r, 1)}\\text{ m}$ et de hauteur $${texNombre(h, 1)}\\text{ m}$.<br>
    En fin de saison, on utilise une pompe dont le débit est de $${texNombre(v1, 1)}\\text{ m}^3/\\text{h}$ pour vider l'eau de la piscine.<br><br>`
    const question1 = `Montrer que le volume du bassin, arrondi au dixième de m$^3$, est $${texNombre(volumeArrondi, 1)}\\text{ m}^3$.`
    const question2 = `Le bassin est plein. On met en route la pompe. Au bout de $${duree}$ heures, quel volume d'eau en $\\text{ m}^3$ reste-t-il à vider${sp()}?`
    const question3a =
      "Montrer que l'expression $v(t)$ permet de déterminer le volume d'eau en $\\text{ m}^3$ qu'il reste à vider dans le bassin en fonction de la durée $t$, exprimée en minutes, d'utilisation de la pompe."
    const question3b = `Calculer le temps nécessaire pour que le volume d'eau restant à vider soit égal à $${texNombre(reste1, 1)}\\text{ m}^3$.<br>
    On donnera une valeur approchée à la minute près.`
    let question4 = `On a tracé ci-dessous une partie de la représentation graphique de la fonction $v$.<br><br>
${figure}
Répondre aux questions suivantes par une lecture graphique.`
    const question3 = ` On considère la fonction $v\\::\\: t \\longmapsto  ${texNombre(volumeArrondi, 1)} - ${texNombre(v2, 3)}t$.${createList(
      {
        items: [question3a, question3b],
        style: 'alpha',
      },
    )}`
    const question4a = `Déterminer l'antécédent de $${texNombre(reste2, 1)}$ par la fonction $v$. Interpréter le résultat.`
    const question4b =
      'Déterminer le temps nécessaire pour que la pompe vide complètement le bassin.'
    question4 += createList({
      items: [question4a, question4b],
      style: 'alpha',
    })
    const listeQuestions = createList({
      items: [question1, question2, question3, question4],
      style: 'nombres',
    })
    this.enonce += listeQuestions
    const correction1 = `Le volume du bassin est $V=\\pi R^2 h = \\pi\\times ${texNombre(r, 1)}^2\\times ${texNombre(h, 1)} \\approx ${miseEnEvidence(texNombre(volumeArrondi, 1))}$ ${texteEnCouleurEtGras('m$^3$')}.`
    const correction2 = `En une heure, la pompe vide $${texNombre(v1, 1)}\\text{ m}^3$, donc en $${duree}$ heures, elle vide $${duree}\\times ${texNombre(v1, 1)}$ soit $${texNombre(v1 * duree, 1)}\\text{ m}^3$.<br>
$${texNombre(volumeArrondi, 1)} - ${texNombre(v1 * duree, 1)} = ${texNombre(volumeRestant, 1)}\\text{ m}^3$<br>
Donc au bout de $${duree}$ heures, il reste $${miseEnEvidence(texNombre(volumeRestant, 1))}$ ${texteEnCouleurEtGras('m$^3$')} à vider.`
    const correction3a = `La pompe vide $${texNombre(v1, 1)}\\text{ m}^3$ par heure donc $\\dfrac{${texNombre(v1, 1)}}{60}=${texNombre(v2, 3)}\\text{ m}^3$ par minute.<br>
En $t$ minutes, elle vide $${texNombre(v2, 3)}t\\text{ m}^3$; il en reste donc $${miseEnEvidence(`${texNombre(volumeArrondi, 1)} - ${texNombre(v2, 3)}t`)}$ à vider.`
    const correction3b = `Le temps nécessaire pour que le volume d'eau restant à vider soit égal à $${texNombre(reste1, 1)}\\text{ m}^3$ est le temps $t$ tel que $v(t)=${texNombre(reste1, 1)}$.<br>
On résout cette équation.<br>
$\\begin{aligned}v(t)&=${texNombre(reste1, 1)}\\\\
${texNombre(volumeArrondi, 1)} - ${texNombre(v2, 3)}t &= ${texNombre(reste1, 1)}\\\\
${texNombre(volumeArrondi, 1)} - ${texNombre(reste1, 1)} &= ${texNombre(v2, 3)}t\\\\
${texNombre(volumeArrondi - reste1, 1)} &= ${texNombre(v2, 3)}t\\\\
t &= \\dfrac{${texNombre(volumeArrondi - reste1, 1)}}{${texNombre(v2, 3)}}\\\\
t \\approx ${Math.round((volumeArrondi - reste1) / v2)}~\\text{minutes}\\end{aligned}$<br>
Donc le temps nécessaire pour que le volume d'eau restant à vider soit égal à $${texNombre(reste1, 1)}\\text{ m}^3$ est d'environ $${miseEnEvidence(Math.round((volumeArrondi - reste1) / v2))}$ ${texteEnCouleurEtGras('minutes')}.`
    const correction3 = createList({
      items: [correction3a, correction3b],
      style: 'alpha',
    })
    const correction4a = `${figureCorrection}
 D'après le graphique, l'antécédent de $${texNombre(reste2, 1)}$ par la fonction $v$ est environ $${Math.round((volumeArrondi - reste2) / v2 / 5) * 5}$.<br>
Au bout de $${miseEnEvidence(Math.round((volumeArrondi - reste2) / v2 / 5) * 5)}$ ${texteEnCouleurEtGras('minutes')}, il reste donc $${texNombre(reste2, 1)}\\text{ m}^3$ à vider.`
    const correction4b = `D'après le graphique, le temps nécessaire pour que la pompe vide complètement le bassin est d'environ $${miseEnEvidence(Math.round(volumeArrondi / v2 / 5) * 5)}$ ${texteEnCouleurEtGras('minutes')}.`
    const correction4 = createList({
      items: [correction4a, correction4b],
      style: 'alpha',
    })
    const listeCorrections = createList({
      items: [correction1, correction2, correction3, correction4],
      style: 'nombres',
    })

    this.correction = listeCorrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3.6, 1.5, 0.235, 'du rocher', 2, 30, 40)
  }

  versionAleatoire: () => void = () => {
    const nom = choice([
      'de la pinède',
      'du petit dauphin',
      'des sables',
      'du petit vent',
      'des hirondelles',
      'des alizés',
      'des chênes',
      'des palmiers',
      'du lac',
    ])
    let r: number
    let h: number
    let v2: number
    let duree: number
    let f: (x: number) => number
    let reste1: number
    let reste2: number
    let dureeMax: number
    do {
      r = randint(18, 24, 20) / 5
      h = randint(4, 8) / 10 + 1
      v2 = (5 + 10 * randint(21, 37, 30)) / 1000
      const volume = Math.PI * r ** 2 * h
      duree = randint(2, 4)
      f = (x: number) => volume - v2 * x
      dureeMax = Math.round(volume / v2)
      reste2 = Math.floor(f(dureeMax / 2) / 10) * 10
      reste1 = Math.floor(f(dureeMax / 4) / 10) * 10
    } while (duree > dureeMax || reste1 === reste2 || dureeMax > 300)

    this.appliquerLesValeurs(r, h, v2, nom, duree, reste1, reste2)
  }
}
