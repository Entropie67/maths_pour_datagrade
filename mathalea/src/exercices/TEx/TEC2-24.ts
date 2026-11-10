import { all, isEqual } from '../../lib/interactif/checks'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { context } from '../../modules/context'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  rienSi0,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texRacineCarree } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer si un point appartient à une médiatrice ou à un cercle'
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '3703b'
export const refs = {
  'fr-fr': ['TEC2-24'],
  'fr-ch': [],
}

type Affixe = { re: number; im: number }
type Longueur = { nom: string; P: Affixe; Q: Affixe; nP: string; nQ: string }

/** Forme algébrique sans partie nulle : `3`, `-2\\mathrm{i}`, `3+\\mathrm{i}`, `0`. */
const forme = ({ re, im }: Affixe) => {
  if (im === 0) return `${re}`
  const imaginaire = `${ecritureAlgebriqueSauf1(im)}\\mathrm{i}`
  return re === 0
    ? imaginaire.replace(/^\+/, '')
    : `${rienSi0(re)}${imaginaire}`
}

/**
 * Le point C d'affixe z_C appartient-il à la médiatrice de [AB] , au cercle de centre A et de rayon AB ou au cercle de diamètre [AB] ?
 * On compare CA et CB (médiatrice) ou AC et AB (cercle), ou on teste la réciproque de Pythagore (cercle de diamètre).
 * @author Stéphane Guyon
 */
export default class MediatriceAffixes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '1-2-3'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Médiatrice',
        '2 : Cercle de centre A et de rayon AB',
        '3 : Cercle de diamètre [AB]',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    const types = combinaisonListes(typesDisponibles, this.nbQuestions)
    // Les deux situations (C appartient ou non) alternent
    const situations = combinaisonListes([true, false], this.nbQuestions)
    const egalite = [
      { label: 'Choisir…', value: '' },
      { latex: '=', value: '=' },
      { latex: '\\neq', value: '≠' },
    ]
    const champ = { keyboard: KeyboardType.clavierFullOperations }
    const compare = all([isEqual()])
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const estVraie = situations[i]
      const type = types[i]
      let a: Affixe = { re: randint(-5, 5), im: randint(-5, 5) }
      const p = randint(-3, 3, 0)
      const q = randint(-3, 3)
      const k = randint(-2, 2, 0)
      let b: Affixe
      let c: Affixe
      if (type === 1) {
        // I milieu de [AB], C = I + k × (vecteur normal à AB) pour que CA = CB
        b = { re: a.re + 2 * p, im: a.im + 2 * q }
        c = { re: a.re + p - k * q, im: a.im + q + k * p }
      } else if (type === 2) {
        // C est l'image de B par une symétrie ou une rotation de centre A : AC = AB
        b = { re: a.re + p, im: a.im + q }
        const [u, v] = choice([
          [-p, q],
          [p, -q],
          [-p, -q],
          [q, p],
          [-q, p],
          [q, -p],
          [-q, -p],
        ])
        c = { re: a.re + u, im: a.im + v }
      } else {
        // CA et CB sont orthogonaux : le triangle ABC est rectangle en C
        const o = a
        a = { re: o.re + p, im: o.im + q }
        b = { re: o.re - k * q, im: o.im + k * p }
        c = o
      }
      if (!estVraie) {
        if (choice([true, false])) c.re += choice([-2, -1, 1, 2])
        else c.im += choice([-2, -1, 1, 2])
      }
      const d2 = (P: Affixe, Q: Affixe) =>
        (P.re - Q.re) ** 2 + (P.im - Q.im) ** 2
      if (c.re === b.re && c.im === b.im) continue
      if (c.re === a.re && c.im === a.im) continue
      if (
        !this.questionJamaisPosee(i, type, a.re, a.im, b.re, b.im, c.re, c.im)
      )
        continue
      const enonce =
        `Dans le plan complexe, on considère trois points $A$, $B$ et $C$ d'affixes respectives $z_A=${forme(a)}$, ` +
        `$z_B=${forme(b)}$ et $z_C=${forme(c)}$.<br>`
      let consigne: string
      let modele: string
      let correction: string
      let reponses: Record<string, { value: string; compare?: typeof compare }>
      let options: Record<string, object>
      if (type === 3) {
        // Réciproque (ou contraposée) du théorème de Pythagore
        const ca2 = d2(a, c)
        const cb2 = d2(b, c)
        const ab2 = d2(a, b)
        const egaux = ca2 + cb2 === ab2
        if (egaux !== estVraie) continue
        const carre = (nom: string, P: Affixe, nP: string, n: number) =>
          `$\\begin{aligned}${nom}^2&=\\vert z_${nP}-z_${'C'}\\vert^2\\\\` +
          `&=${ecritureParentheseSiNegatif(P.re - c.re)}^2+${ecritureParentheseSiNegatif(P.im - c.im)}^2\\\\` +
          `&=${miseEnEvidence(String(n))}\\end{aligned}$`
        consigne = this.interactif
          ? ''
          : 'Déterminer si le point $C$ appartient au cercle de diamètre $[AB]$.'
        modele =
          '$CA^2=$ %{field0}<br>$CB^2=$ %{field1}<br>$AB^2=$ %{field2}<br>' +
          'On constate que $CA^2+CB^2$ %{field3} $AB^2$, donc le triangle $ABC$ %{field4} en $C$.<br>' +
          'On en déduit que le point $C$ %{field5} au cercle de diamètre $[AB]$.'
        options = {
          field0: champ,
          field1: champ,
          field2: champ,
          field3: { choices: egalite },
          field4: {
            choices: [
              { label: 'Choisir…', value: '' },
              { label: 'est rectangle', value: 'rectangle' },
              { label: "n'est pas rectangle", value: 'pas rectangle' },
            ],
          },
          field5: {
            choices: [
              { label: 'Choisir…', value: '' },
              { label: 'appartient', value: 'appartient' },
              { label: "n'appartient pas", value: 'appartient pas' },
            ],
          },
        }
        reponses = {
          field0: { value: String(ca2), compare },
          field1: { value: String(cb2), compare },
          field2: { value: String(ab2), compare },
          field3: { value: egaux ? '=' : '≠' },
          field4: { value: egaux ? 'rectangle' : 'pas rectangle' },
          field5: { value: egaux ? 'appartient' : 'appartient pas' },
        }
        correction =
          'Si $C$ appartient au cercle de diamètre $[AB]$, alors le triangle $ABC$ est rectangle en $C$ ; réciproquement, ' +
          'si $ABC$ est rectangle en $C$, alors $C$ appartient à ce cercle. On teste donc si $AB^2=CA^2+CB^2$.<br>' +
          `${carre('CA', a, 'A', ca2)}<br>${carre('CB', b, 'B', cb2)}<br>` +
          `$\\begin{aligned}AB^2&=\\vert z_B-z_A\\vert^2\\\\&=${ecritureParentheseSiNegatif(b.re - a.re)}^2+${ecritureParentheseSiNegatif(b.im - a.im)}^2\\\\&=${miseEnEvidence(String(ab2))}\\end{aligned}$<br>` +
          (egaux
            ? `Comme $CA^2+CB^2=${ca2}+${cb2}=${ab2}=AB^2$, d'après la réciproque du théorème de Pythagore, ${texteEnCouleurEtGras('le triangle $ABC$ est rectangle en $C$, donc le point $C$ appartient au cercle de diamètre $[AB]$')}.`
            : `Comme $CA^2+CB^2=${ca2}+${cb2}=${ca2 + cb2}\\neq ${ab2}=AB^2$, d'après la contraposée du théorème de Pythagore, ${texteEnCouleurEtGras("le triangle $ABC$ n'est pas rectangle en $C$, donc le point $C$ n'appartient pas au cercle de diamètre $[AB]$")}.`)
      } else {
        const mediatrice = type === 1
        // Longueurs comparées : CA et CB (médiatrice), AB et AC (cercle)
        const l1 = mediatrice
          ? { nom: 'CA', P: a, Q: c, nP: 'A', nQ: 'C' }
          : { nom: 'AB', P: b, Q: a, nP: 'B', nQ: 'A' }
        const l2 = mediatrice
          ? { nom: 'CB', P: b, Q: c, nP: 'B', nQ: 'C' }
          : { nom: 'AC', P: c, Q: a, nP: 'C', nQ: 'A' }
        const n1 = d2(l1.P, l1.Q)
        const n2 = d2(l2.P, l2.Q)
        if ((n1 === n2) !== estVraie) continue
        const objet = mediatrice
          ? 'à la médiatrice du segment $[AB]$'
          : 'au cercle de centre $A$ et de rayon $AB$'
        const detail = (l: Longueur, n: number) =>
          `$\\begin{aligned}${l.nom}&=\\vert z_${l.nP}-z_${l.nQ}\\vert\\\\` +
          `&=\\vert ${forme({ re: l.P.re - l.Q.re, im: l.P.im - l.Q.im })}\\vert\\\\` +
          `&=\\sqrt{${ecritureParentheseSiNegatif(l.P.re - l.Q.re)}^2+${ecritureParentheseSiNegatif(l.P.im - l.Q.im)}^2}\\\\` +
          (texRacineCarree(n) === `\\sqrt{${n}}`
            ? `&=${miseEnEvidence(`\\sqrt{${n}}`)}`
            : `&=\\sqrt{${n}}\\\\&=${miseEnEvidence(texRacineCarree(n))}`) +
          '\\end{aligned}$'
        // En interactif, l'énoncé commence directement par les champs de calcul
        consigne = this.interactif
          ? ''
          : `Déterminer si le point $C$ appartient ${objet}.`
        modele =
          `$${l1.nom}=$ %{field0}<br>$${l2.nom}=$ %{field1}<br>` +
          `On constate que $${mediatrice ? 'CA' : 'AC'}$ %{field2} $${mediatrice ? 'CB' : 'AB'}$, donc le point $C$ %{field3} ${objet}.`
        options = {
          field0: champ,
          field1: champ,
          field2: { choices: egalite },
          field3: {
            choices: [
              { label: 'Choisir…', value: '' },
              { label: 'appartient', value: 'appartient' },
              { label: "n'appartient pas", value: 'appartient pas' },
            ],
          },
        }
        reponses = {
          field0: { value: texRacineCarree(n1), compare },
          field1: { value: texRacineCarree(n2), compare },
          field2: { value: estVraie ? '=' : '≠' },
          field3: { value: estVraie ? 'appartient' : 'appartient pas' },
        }
        const egaux = mediatrice ? '$CA=CB$' : '$AC=AB$'
        const differents = mediatrice ? '$CA\\neq CB$' : '$AC\\neq AB$'
        correction =
          (mediatrice
            ? "Un point appartient à la médiatrice de $[AB]$ si et seulement s'il est équidistant de $A$ et de $B$, c'est-à-dire si $CA=CB$."
            : "Un point appartient au cercle de centre $A$ et de rayon $AB$ si et seulement si sa distance à $A$ est égale à $AB$, c'est-à-dire si $AC=AB$.") +
          `<br>${detail(l1, n1)}<br>${detail(l2, n2)}<br>` +
          (estVraie
            ? `Comme ${egaux}, ${texteEnCouleurEtGras(`le point $C$ appartient ${objet}`)}.`
            : `Comme ${differents}, ${texteEnCouleurEtGras(`le point $C$ n'appartient pas ${objet}`)}.`)
      }
      this.listeQuestions[i] =
        enonce +
        consigne +
        (this.interactif && context.isHtml && !context.isTypst
          ? (consigne === '' ? '' : '<br>') +
            addMultiMathfield(this, i, {
              dataTemplate: modele,
              dataOptions: options,
            })
          : '')
      this.listeCorrections[i] = correction
      handleAnswers(
        this,
        i,
        { ...reponses, bareme: toutAUnPoint },
        { formatInteractif: 'multi-mathfield' },
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}
