import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { distance } from 'apigeom/src/elements/calculus/Coords'
import { bissectrice } from '../../lib/2d/Bissectrice'
import { codageBissectrice } from '../../lib/2d/CodageBissectrice'
import { codageMediatrice } from '../../lib/2d/CodageMediatrice'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { mediatrice } from '../../lib/2d/Mediatrice'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import {
  projectionOrtho,
  similitude,
  translation,
} from '../../lib/2d/transformations'
import {
  codageHauteurTriangle,
  codageMedianeTriangle,
} from '../../lib/2d/triangles'
import { milieu, pointAdistance } from '../../lib/2d/utilitairesPoint'
import {
  centreCercleCirconscrit,
  centreCercleInscrit,
  centreGraviteTriangle,
  hauteurTriangle,
  medianeTriangle,
  orthoCentre,
  piedBissectrice,
} from '../../lib/2d/utilitairesTriangle'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  compteOccurences,
  enleveElementBis,
} from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Triangle } from '../../modules/Triangle'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre =
  'Reconnaitre de droites remarquables et des points de concours dans le triangle'

export const dateDePublication = '06/07/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '1972e'
export const refs = {
  'fr-fr': ['5G22-1'],
  'fr-ch': [],
}
/**
 * vocabulaire sur les droites remarquables ou les points de concours dans le triangle
 * @author Olivier Mimeau
 *
 */
export default class DroitesRemarquablesPointsConcours extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Hauteur',
        '2 : Médiane',
        '3 : Bissectrice',
        '4 : Médiatrice',
        '5 : Centre de gravité',
        '6 : Orthocentre',
        '7 : Centre du cercle circonscrit',
        '8 : Centre du cercle inscrit',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [`hauteur à l'intérieur du triangle`]
    this.besoinFormulaire3CaseACocher = [
      'Dans les question de genre droite, permettre des schémas de type : on ne peut pas savoir',
    ]
    this.sup = '0'
    this.sup2 = true
    this.sup3 = true
    this.consigne = ''
    this.comment = `Le choix '0:Mélange' n'intègre pas le centre du cercle inscrit`
  }

  nouvelleVersion() {
    this.sup = String(this.sup)
    if (this.sup3) {
      if (typeof this.sup === 'string') {
        if (
          this.sup === '0' ||
          this.sup.includes('1') ||
          this.sup.includes('2') ||
          this.sup.includes('3') ||
          this.sup.includes('4')
        ) {
          this.sup += '-9'
        }
      }
    }

    this.sup.replaceAll('0', '1-2-3-4-5-6-7')

    const typeQuestionsDisponibles = [
      'hauteur',
      'mediane',
      'bissectrice',
      'mediatrice',
      'cGravite',
      'orthocentre',
      'CCirconscrit',
      'cInscrit',
      'onpps',
    ]
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 9,
      melange: 0,
      defaut: 0,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const typeHauteur = ['interieur']
    if (!this.sup2) {
      typeHauteur.push('exterieur')
    }
    const nbHauteur = compteOccurences(listeTypeQuestions, 'hauteur')
    const tempListe = combinaisonListes(typeHauteur, nbHauteur)
    const listeQHauteur = combinaisonListes(tempListe, nbHauteur)
    let indexQHauteur = 0
    const listeObjets: lesObjets[] = [
      {
        type: 'hauteur',
        genre: 'droite',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          hauteurTriangle(C, A, B, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageHauteurTriangle(C, A, B),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          projectionOrtho(C, droite(A, B)),
        txtCorr1: `la hauteur issue de $C$`,
        txtCorr2: ``,
        labelRep: 'une hauteur',
      },
      {
        type: 'mediane',
        genre: 'droite',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          medianeTriangle(C, A, B, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageMedianeTriangle(A, B, 'black', '||'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        txtCorr1: `la médiane issue de $C$`,
        txtCorr2: ``,
        labelRep: 'une médiane',
      },
      {
        type: 'bissectrice',
        genre: 'droite',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          bissectrice(A, C, B, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageBissectrice(A, C, B, 'black', '|'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        txtCorr1: `la bissectrice issue de $C$`,
        txtCorr2: ``,
        labelRep: 'une bissectrice',
      },
      {
        type: 'mediatrice',
        genre: 'droite',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          mediatrice(A, B, '', bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageMediatrice(A, B, 'black', '||'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        txtCorr1: `la médiatrice du segment $[AB]$`,
        txtCorr2: ``,
        labelRep: 'une médiatrice',
      },
      {
        type: 'cGravite',
        genre: 'point',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          medianeTriangle(A, B, C, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageMedianeTriangle(A, B, 'black', '||'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          centreGraviteTriangle(A, B, C, '', 'above'),
        txtCorr1: `médianes`,
        txtCorr2: `le centre de gravité`,
        labelRep: 'le centre de gravité',
      },
      {
        type: 'orthocentre',
        genre: 'point',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          hauteurTriangle(A, B, C, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageHauteurTriangle(A, B, C),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          orthoCentre(A, B, C, '', 'above'),
        txtCorr1: `hauteurs`,
        txtCorr2: `l'orthocentre`,
        labelRep: "l'orthocentre",
      },
      {
        type: 'CCirconscrit',
        genre: 'point',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          mediatrice(A, B, '', bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageMediatrice(A, B, 'black', '||'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          centreCercleCirconscrit(A, B, C, '', 'above'),
        txtCorr1: `médiatrices`,
        txtCorr2: `le centre du cercle circonscrit`,
        labelRep: 'le centre du cercle circonscrit',
      },
      {
        type: 'cInscrit',
        genre: 'point',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          bissectrice(A, B, C, bleuMathalea),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          codageBissectrice(A, B, C, 'black', '|'),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          centreCercleInscrit(A, B, C, '', 'above'),
        txtCorr1: `bissectrices`,
        txtCorr2: `le centre du cercle inscrit`,
        labelRep: 'le centre du cercle inscrit',
      },
      {
        type: 'onpps',
        genre: 'droite',
        fctdte: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        fctcodage: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        fctPtEnPlus: (A: PointAbstrait, B: PointAbstrait, C: PointAbstrait) =>
          pointAbstrait(0, 0),
        txtCorr1: `On ne peut pas savoir`,
        txtCorr2: ``,
        labelRep: 'On ne peut pas savoir',
      },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const angleDepart = randint(-17, 18) * 10 //0
      const AB = 8
      const S: PointAbstrait[] = []
      S[0] = pointAbstrait(0, 0)
      S[1] = pointAdistance(S[0], AB, angleDepart)
      let angA = randint(7, 24, [17, 18, 19])
      let angB = randint(7, 36 - 7 - angA, [
        17,
        18,
        angA,
        36 - 2 * angA,
        18 - angA,
      ])
      if (listeTypeQuestions[i] === 'hauteur') {
        if (listeQHauteur[indexQHauteur] === 'interieur') {
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
        indexQHauteur++
      }
      const angleA = angA * 5
      const angleB = angB * 5
      const angleC = 180 - angleA - angleB
      // sina/a=sinb/b=sinc/c
      const coeff =
        Math.sin((angleB * Math.PI) / 180) / Math.sin((angleC * Math.PI) / 180)
      S[2] = similitude(S[1], S[0], angleA, coeff)

      const nomTriangle = new Triangle()
      const nomSommets = nomTriangle.getSommets(false)
      const nomDuTriangle = `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`
      const nomPt = choice(
        ['I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'],
        nomSommets,
      )
      const leTriangle = polygone([S[0], S[1], S[2]])
      const nom = nommePolygone(
        leTriangle,
        `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`,
      )
      const droiteRem = []
      const codage: ObjetMathalea2D[] = []
      let ptEnPlus = pointAbstrait(0, 0)
      let objetsDessinBordures: NestedObjetMathalea2dArray = []
      let objetsDessin: NestedObjetMathalea2dArray = [] // ObjetMathalea2D[]  = []

      const choix = [{ label: 'Choisir une réponse :', value: '' }]
      const monObjet = trouveObjet(String(listeTypeQuestions[i]), listeObjets)
      const nbDroite = monObjet.genre === 'droite' ? 1 : 3
      let Sbis = [...S]
      for (let j = 0; j < nbDroite; j++) {
        droiteRem[j] = monObjet.fctdte(Sbis[0], Sbis[1], Sbis[2])
        droiteRem[j].epaisseur = 1
        codage[j] = monObjet.fctcodage(Sbis[0], Sbis[1], Sbis[2])
        Sbis = decale(Sbis)
      }
      ptEnPlus = monObjet.fctPtEnPlus(S[0], S[1], S[2])
      ptEnPlus.nom = nomPt
      if (listeTypeQuestions[i] === 'onpps') {
        const vectChoix: number[] = []
        if (listeTypeQuestions.includes('hauteur')) {
          vectChoix.push(1)
        }
        if (listeTypeQuestions.includes('mediatrice')) {
          vectChoix.push(4)
        }
        if (listeTypeQuestions.includes('mediane')) {
          vectChoix.push(2)
        }
        if (listeTypeQuestions.includes('bissectrice')) {
          vectChoix.push(3)
        }
        if (vectChoix.length === 0) {
          vectChoix.push(0)
        }
        switch (choice(vectChoix)) {
          case 1:
            {
              //fausse hauteur
              const M = projectionOrtho(S[2], droite(S[0], S[1]))
              const N = decalePoint(M, 0.2, S[0], S[1])
              droiteRem[0] = droite(N, S[2])
              droiteRem[0].color = colorToLatexOrHTML(bleuMathalea)
              codage[0] = pointille(N, S[0], S[1])
            }
            break
          case 4:
            {
              //fausse mediatrice
              const M = milieu(S[0], S[1])
              const N = decalePoint(M, 0.2, S[0], S[1])
              droiteRem[0] = droiteParPointEtPerpendiculaire(
                N,
                droite(S[0], S[1]),
              )
              droiteRem[0].color = colorToLatexOrHTML(bleuMathalea)
            }
            break
          case 2:
            {
              //fausse mediane
              const M = milieu(S[0], S[1])
              const N = decalePoint(M, 0.2, S[0], S[1])
              droiteRem[0] = droite(N, S[2])
              droiteRem[0].color = colorToLatexOrHTML(bleuMathalea)
            }
            break
          case 3:
          default:
            {
              //fausse bissectrice
              const M = piedBissectrice(S[0], S[2], S[1])
              const N = decalePoint(M, 0.2, S[0], S[1])
              droiteRem[0] = droite(N, S[2])
              droiteRem[0].color = colorToLatexOrHTML(bleuMathalea)
            }
            break
        }
      }
      if (monObjet.genre === 'droite') {
        texteCorr += `La droite tracée est ${texteEnCouleurEtGras(interprete(monObjet.txtCorr1, nomSommets))} dans le triangle $${nomDuTriangle}$.`
        if (listeTypeQuestions[i] === 'onpps') {
          texteCorr = `${texteEnCouleurEtGras('On ne peut pas savoir')}. En effet, il n'y a pas de codage indiquant de quel type de droite il s'agit.`
        }
      } else {
        texteCorr += `Le point ${nomPt} est le point de concours des ${monObjet.txtCorr1} dans le triangle $${nomDuTriangle}$.<br>`
        texteCorr += `Le point ${nomPt} est le ${texteEnCouleurEtGras(monObjet.txtCorr2)} au triangle $${nomDuTriangle}$.`
      }
      if (monObjet.genre === 'droite') {
        const listeReponsesDteComplete = [
          { label: 'une hauteur', value: 'hauteur' },
          { label: 'une médiane', value: 'mediane' },
          { label: 'une bissectrice', value: 'bissectrice' },
          { label: 'une médiatrice', value: 'mediatrice' },
          { label: 'On ne peut pas savoir', value: 'onpps' },
        ]
        let indexObj = trouveObjetReponsesDte(
          String(listeTypeQuestions[i]),
          listeReponsesDteComplete,
        )
        const aMettre = []
        aMettre.push(indexObj)
        if (this.sup3) {
          indexObj = trouveObjetReponsesDte('onpps', listeReponsesDteComplete)
          aMettre.push(indexObj)
        }
        const choixDep = [0, 1, 2, 3, 4]
        const nbAjout = 4 - aMettre.length
        for (let j = 0; j < nbAjout; j++) {
          aMettre.push(choice(choixDep, aMettre))
        }
        aMettre.sort((a, b) => a - b)
        for (let j = 0; j < aMettre.length; j++) {
          choix.push(listeReponsesDteComplete[aMettre[j]])
        }
      } else {
        choix.push(
          ...[
            { label: 'le centre de gravité', value: 'cGravite' },
            { label: "l'orthocentre", value: 'orthocentre' },
            {
              label: 'le centre du cercle circonscrit',
              value: 'CCirconscrit',
            },
            {
              label: 'le centre du cercle inscrit',
              value: 'cInscrit',
            },
          ],
        )
      }

      if (this.interactif) {
        texte +=
          monObjet.genre === 'droite'
            ? 'La droite tracée en bleu est '
            : `Le point ${nomPt} est `
        texte += choixDeroulant(this, i, { choices: choix }) + '.'
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: monObjet.type,
              options: { texteSansCasse: true },
            },
          },
          { formatInteractif: 'liste-deroulante' },
        )
      } else {
        texte += `Quelle est la nature `
        texte +=
          monObjet.genre === 'droite'
            ? `de la droite tracée en bleu `
            : `du point ${nomPt} `
        texte += `dans le triangle $${nomDuTriangle}$ ?<br>`
      }

      objetsDessin = [leTriangle, droiteRem[0], nom, codage[0]]
      objetsDessinBordures = [leTriangle, droiteRem[0], nom, ptEnPlus]
      if (monObjet.genre !== 'droite') {
        objetsDessin.push(
          droiteRem[1],
          droiteRem[2],
          codage[1],
          codage[2],
          labelPoint(ptEnPlus),
        )
        objetsDessinBordures.push(
          droiteRem[1],
          droiteRem[2],
          labelPoint(ptEnPlus),
        )
      }
      enleveElementBis(objetsDessin, undefined)
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

      if (
        this.questionJamaisPosee(
          i,
          `${nomSommets[0]}${nomSommets[1]}${nomSommets[2]}`,
          listeTypeQuestions[i],
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

type lesObjets = {
  type: string
  genre: string
  fctdte: (
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
  ) => ObjetMathalea2D
  fctcodage: (
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
  ) => ObjetMathalea2D
  fctPtEnPlus: (
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
  ) => PointAbstrait
  txtCorr1: string
  txtCorr2: string
  labelRep: string
}

function trouveObjet(type: string, listeObjets: lesObjets[]): lesObjets {
  for (let i = 0; i < listeObjets.length; i++) {
    if (listeObjets[i].type === type) {
      return listeObjets[i]
    }
  }
  throw new Error(`Objet de type "${type}" non trouvé`)
}

function trouveObjetReponsesDte(
  cherche: string,
  listeObjets: { label: string; value: string }[],
): number {
  for (let i = 0; i < listeObjets.length; i++) {
    if (listeObjets[i].value === cherche) {
      return i
    }
  }
  throw new Error(`Objet de type "${cherche}" non trouvé`)
}

function decale(S: PointAbstrait[]): PointAbstrait[] {
  return [S[1], S[2], S[0]]
}

function interprete(texte: string, S: string | string[]): string {
  const nomSommets = ['A', 'B', 'C']
  return texte
    .replaceAll(nomSommets[0], S[0])
    .replaceAll(nomSommets[1], S[1])
    .replaceAll(nomSommets[2], S[2])
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
