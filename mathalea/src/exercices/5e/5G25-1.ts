import { distance } from 'apigeom/src/elements/calculus/Coords'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { barycentre, nommePolygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { TexteParPoint, texteParPoint } from '../../lib/2d/textes'
import {
  projectionOrtho,
  similitude,
  translation,
} from '../../lib/2d/transformations'
import { codageHauteurTriangle } from '../../lib/2d/triangles'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import {
  addMultiMathfield,
  MultiMathfieldElement,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveElementBis,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Identifier une hauteur et sa base associée'

export const dateDePublication = '07/07/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const interactifReady = true

export const uuid = '90fd5'
export const refs = {
  'fr-fr': ['5G25-1'],
  'fr-ch': ['PRQMG01A-1'],
}
/**
 * Identifier une hauteur et sa base associée
 * Une hauteur et sa base, 3 hauteurs, Triangle rectangle , sans codage (on ne peut pas savoir)
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  reponses: {
    pied: string
    hauteur: string
    base: string
    ecrireEn1: boolean
  }[][] = []
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Une hauteur et sa base',
        '2 : Plusieurs hauteurs',
        '3 : Triangle rectangle',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      `Inclure des situations sans codage (On ne peut pas savoir).'`,
      true,
    ]

    this.sup = '0'
    this.sup2 = true
    this.consigne = ''
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    let leChoix = String(this.sup)
    if (this.sup2) {
      if (!leChoix.includes('4')) leChoix += '-4'
    }
    if (leChoix.includes('0')) {
      leChoix = leChoix.replaceAll('0', '1-2-3')
    }
    const typeQuestionsDisponibles = [
      '1hauteur',
      '3hauteurs',
      'triRect',
      'onpps',
    ]
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: leChoix,
      min: 1,
      max: 4,
      melange: 0,
      defaut: 0,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const typeHauteur = ['interieur', 'exterieur']
    const tempListe = combinaisonListes(typeHauteur, this.nbQuestions)
    const listeQHauteur = combinaisonListes(tempListe, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const angleDepart = randint(-17, 18) * 10 //0
      const AB = 8
      const S: PointAbstrait[] = []
      S[0] = pointAbstrait(0, 0)
      S[1] = pointAdistance(S[0], AB, angleDepart)
      let angA = 0
      let angB = 0
      if (listeTypeQuestions[i] === 'triRect') {
        angA = randint(9, 12)
        angB = 18 - angA
      } else {
        if (listeQHauteur[i] === 'interieur') {
          angA = randint(7, 16)
          angB = randint(7, Math.min(36 - 5 - angA, 16), [18 - angA])
        } else {
          angA = randint(7, 24, [11, 12, 13, 14, 15, 16, 17, 18, 19])
          angB = randint(angA < 18 ? 20 : 7, 36 - 5 - angA, [
            17,
            18,
            angA,
            36 - 2 * angA,
            18 - angA,
          ])
        }
      }
      this.reponses[i] = []
      const angleA = angA * 5
      const angleB = angB * 5
      const angleC = 180 - angleA - angleB
      // sina/a=sinb/b=sinc/c
      const coeff =
        Math.sin((angleB * Math.PI) / 180) / Math.sin((angleC * Math.PI) / 180)
      S[2] = similitude(S[1], S[0], angleA, coeff)

      const nomTriangle = new Triangle()
      let nomSommets = nomTriangle.getSommets(false)
      const nomDuTriangleEnonce = `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`
      nomSommets = combinaisonListes(nomSommets, 3)
      for (let j = 0; j < 3; j++) {
        S[j].nom = nomSommets[j]
      }
      const nomPt: string[] = []
      const labelNomPt: TexteParPoint[] = [] //NestedObjetMathalea2dArray[] = [] //(TexteParPoint | Latex2d)[]=[]//ObjetMathalea2D[] = []

      const leTriangle = polygone([S[0], S[1], S[2]])

      const nom = nommePolygone(leTriangle, `${S[0].nom}${S[1].nom}${S[2].nom}`)
      const droiteRem = []
      const codage: ObjetMathalea2D[] = []
      const PiedHauteur: PointAbstrait[] = []
      let objetsDessinBordures: NestedObjetMathalea2dArray = []
      let objetsDessin: NestedObjetMathalea2dArray = [] // ObjetMathalea2D[]  = []
      const G = barycentre(leTriangle)
      switch (listeTypeQuestions[i]) {
        case 'triRect':
          codage[0] = codageAngleDroit(S[0], S[2], S[1])
          nomPt[0] = S[2].nom
          this.reponses[i].push({
            pied: S[2].nom,
            hauteur: `(${S[2].nom}${S[0].nom})`,
            base: `[${S[2].nom}${S[1].nom}]`,
            ecrireEn1: true,
          })
          this.reponses[i].push({
            pied: S[2].nom,
            hauteur: `(${S[2].nom}${S[1].nom})`,
            base: `[${S[2].nom}${S[0].nom}]`,
            ecrireEn1: false,
          })
          break
        case 'onpps':
          {
            //fausse hauteur
            const M = projectionOrtho(S[2], droite(S[0], S[1]))
            const N = decalePoint(M, 0.2, S[0], S[1])
            droiteRem[0] = segment(N, S[2])
            droiteRem[0].epaisseur = 1
            droiteRem[0].color = colorToLatexOrHTML(bleuMathalea)
            codage[0] = pointille(N, S[0], S[1])
            nomPt[0] = choice(
              ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
              [S[0].nom, S[1].nom, S[2].nom],
            )
            labelNomPt[0] = positionne(nomPt[0], M, G)
          }
          break
        default:
          {
            const nbDroite = listeTypeQuestions[i] === '3hauteurs' ? 3 : 1
            let Sbis = [...S]
            let enPremier = 0
            for (let j = 0; j < nbDroite; j++) {
              PiedHauteur[j] = projectionOrtho(
                Sbis[2],
                droite(Sbis[0], Sbis[1]),
              )
              droiteRem[j] = segment(Sbis[2], PiedHauteur[j])
              droiteRem[j].epaisseur = 1
              //codage[j] = pointille(Sbis[0], Sbis[1], Sbis[2])
              codage[j] = codageHauteurTriangle(Sbis[2], Sbis[0], Sbis[1])
              nomPt[j] = choice(
                ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
                [S[0].nom, S[1].nom, S[2].nom, ...nomPt],
              )
              PiedHauteur[j].nom = nomPt[j]
              enPremier += estEntrePoints(PiedHauteur[j], Sbis[0], Sbis[1])
                ? 1
                : 0
              this.reponses[i].push({
                pied: nomPt[j],
                hauteur: `(${nomPt[j]}${Sbis[2].nom})`,
                base: `[${Sbis[0].nom}${Sbis[1].nom}]`,
                ecrireEn1: enPremier === 1,
              })
              labelNomPt[j] = positionne(nomPt[j], PiedHauteur[j], G)
              Sbis = decale(Sbis)
            }
            if (this.reponses[i].length === 1) {
              this.reponses[i][0].ecrireEn1 = true
            }
          }
          break
      }

      objetsDessin = [
        leTriangle,
        ...droiteRem,
        nom,
        ...codage,
        ...PiedHauteur,
        ...labelNomPt,
      ]
      objetsDessinBordures = [
        leTriangle,
        ...droiteRem,
        nom,
        ...PiedHauteur,
        ...labelNomPt,
      ]

      enleveElementBis(objetsDessin, undefined)

      //texte += `Question ${i + 1} de type ${listeTypeQuestions[i]}<br>`

      texte += `On considère le triangle ${nomDuTriangleEnonce}. Indique une hauteur et la base qui lui correspond.`
      texte += mathalea2d(
        Object.assign(
          {
            display: 'block', //'inline-block',
            scale: 0.4,
            pixelsParCm: 20,
          } as const,
          fixeBordures(objetsDessinBordures),
        ),
        ...objetsDessin,
      )
      // texteCorr += `Correction ${i + 1} de type ${listeTypeQuestions[i]}<br>`
      if (listeTypeQuestions[i] !== 'onpps') {
        let indexPrem = 0
        for (let j = 0; j < this.reponses[i].length; j++) {
          if (this.reponses[i][j].ecrireEn1) {
            indexPrem = j
          }
        }

        texteCorr += `On cherche un angle droit, ici il y a un angle droit en ${this.reponses[i][indexPrem].pied}, la droite ${this.reponses[i][indexPrem].hauteur} est perpendiculaire à un côté et elle passe par un sommet, c'est une hauteur. Le côté ${this.reponses[i][indexPrem].base} est donc la base qui lui est associée.<br>`
        texteCorr += `Donc, sur cette figure, ${this.reponses[i].length > 1 ? 'une' : 'la'} hauteur est la droite $${miseEnEvidence(this.reponses[i][indexPrem].hauteur)}$ et sa base associée est le segment $${miseEnEvidence(this.reponses[i][indexPrem].base)}$`
        if (this.reponses[i].length > 1) {
          texteCorr +=
            this.reponses[i].length === 2
              ? `<br>Une autre réponse est possible${sp()}: <br>`
              : `<br>D'autres réponses sont possibles<br>`
          for (let j = 0; j < this.reponses[i].length; j++) {
            if (j !== indexPrem) {
              texteCorr += `Une autre hauteur est la droite $${miseEnEvidence(this.reponses[i][j].hauteur)}$ et sa base associée est le segment $${miseEnEvidence(this.reponses[i][j].base)}$<br>`
            }
          }
        }
      } else {
        texteCorr += `Il n'y a aucun codage d'angle droit sur cette figure. On ne peut donc ${texteEnCouleurEtGras('pas déterminer de hauteur ni de base associée')}<br>`
      }
      if (this.interactif) {
        texte += `${addMultiMathfield(this, i, {
          dataTemplate: `Une hauteur est (%{champ1} et sa base associée est [%{champ2}`,
          dataOptions: {
            champ1: { keyboard: KeyboardType.alphanumeric, texteApres: ')' },
            champ2: { keyboard: KeyboardType.alphanumeric, texteApres: ']' },
          },
        })}`
        handleAnswers(
          this,
          i,
          {
            bareme: toutPourUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
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

  correctionInteractive = (i?: number) => {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    const result: ('OK' | 'KO')[] = []

    const multiMF =
      (document.getElementById(
        `multi-mathfieldEx${this.numeroExercice}Q${i}`,
      ) as MultiMathfieldElement | null) ??
      (document.getElementById(
        `multiMathfieldEx${this.numeroExercice}Q${i}`,
      ) as MultiMathfieldElement | null)
    if (multiMF) {
      const values = multiMF.getValue()
      const saisie1 = String(values.champ1)
      const saisie2 = String(values.champ2)
      const spansResultat = multiMF.getSpansResultats()
      const spanResultat1 = spansResultat.champ1
      const spanResultat2 = spansResultat.champ2

      const test1 = this.estHauteur(saisie1, this.reponses[i])

      let test2 = false
      if (test1.isOk) {
        test2 = this.estBaseAssociee(saisie2, test1.laHauteur, this.reponses[i])
      }

      if (saisie1 === '' && saisie1 === '' && this.reponses[i].length === 0) {
        test1.isOk = true
        test2 = true
      }

      if (test1.isOk && test2) {
        result.push('OK')
        if (spanResultat1) spanResultat1.innerHTML = '😎'
        if (spanResultat2) spanResultat2.innerHTML = '😎'
      } else {
        result.push('KO')
        if (spanResultat1) spanResultat1.innerHTML = test1.isOk ? '😎' : '☹️'
        if (spanResultat2) spanResultat2.innerHTML = test2 ? '😎' : '☹️'
      }
    } else {
      console.error(
        `MultiMathfield pour la question ${i} de l'exercice ${this.numeroExercice} introuvable.`,
      )
    }
    return result[0] === 'OK' ? 'OK' : 'KO'
  }

  estHauteur(
    nom: string,
    reponses: {
      pied: string
      hauteur: string
      base: string
      ecrireEn1: boolean
    }[],
  ): { isOk: boolean; laHauteur: string } {
    let repOk = false
    let premiereOccurence = false
    let hauteur = ''
    for (let i = 0; i < reponses.length; i++) {
      repOk =
        repOk || comparePairePoint(nettoie(nom), nettoie(reponses[i].hauteur))
      if (!premiereOccurence && repOk) {
        hauteur = reponses[i].hauteur
        premiereOccurence = true
      }
    }
    return { isOk: repOk, laHauteur: hauteur }
  }

  estBaseAssociee(
    nom: string,
    hauteur: string,
    reponses: {
      pied: string
      hauteur: string
      base: string
      ecrireEn1: boolean
    }[],
  ): boolean {
    let index = -1
    for (let i = 0; i < reponses.length; i++) {
      if (hauteur === reponses[i].hauteur && index === -1) {
        index = i
      }
    }
    return comparePairePoint(nettoie(nom), nettoie(reponses[index].base))
  }
}

function decalePoint(
  M: PointAbstrait,
  dist: number,
  A: PointAbstrait,
  B: PointAbstrait,
): PointAbstrait {
  const v = vecteur(A, B)
  const AB = distance(A, B)
  let v0 = vecteur((v.x * dist) / AB, (v.y * dist) / AB)
  let N = translation(M, v0)
  if (distance(N, A) < 0.5 || distance(N, B) < 0.5) {
    v0 = vecteur((-v.x * dist) / AB, (-v.y * dist) / AB)
    N = translation(M, v0)
  }
  return N
}

function pointille(
  M: PointAbstrait,
  A: PointAbstrait,
  B: PointAbstrait,
): ObjetMathalea2D {
  let reponse: ObjetMathalea2D = vide2d() //segment(A,B)
  const AB = distance(A, B)
  const AM = distance(A, M)
  const BM = distance(B, M)
  if (AB + AM - BM < 0.01) {
    reponse = segment(A, M)
    reponse.pointilles = 5
  }
  if (AB + BM - AM < 0.01) {
    reponse = segment(A, M)
    reponse.pointilles = 5
  }
  return reponse
}

function decale(S: PointAbstrait[]): PointAbstrait[] {
  return [S[1], S[2], S[0]]
}

function estEntrePoints(
  M: PointAbstrait,
  A: PointAbstrait,
  B: PointAbstrait,
): boolean {
  const AB = distance(A, B)
  const AM = distance(A, M)
  const BM = distance(B, M)
  return AM + BM - AB < 0.01
}

function positionne(
  nom: string,
  Pt: PointAbstrait,
  G: PointAbstrait,
): TexteParPoint {
  const dist = 0.5
  const P = pointSurSegment(
    G,
    Pt,
    longueur(G, Pt) +
      (context.isHtml
        ? (dist * 20) / context.pixelsParCm
        : dist / context.scale),
  )
  return texteParPoint(nom, P, 0, 'black', 1 /* size */, 'milieu', true)
}

function comparePairePoint(paire1: string, paire2: string): boolean {
  let resultat = paire1 === paire2
  if (!resultat) resultat = paire1[1] + paire1[0] === paire2
  return resultat
}
function nettoie(paire1: string): string {
  return paire1
    .replaceAll('[', '')
    .replaceAll(']', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(' ', '')
}
