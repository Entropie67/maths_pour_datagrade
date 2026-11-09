import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Connaitre le vocabulaire lié aux $4$ opérations'
export const interactifReady = true

/**
 * Exercice sur le vocabulaire : somme, différence, produit, quotient...
 * @author Mickael Guironnet
 */
export const uuid = '32e02'

export const refs = {
  'fr-fr': ['6N0B-2'],
  'fr-2016': ['6C13-1'],
  'fr-ch': ['9R1NO8A-1', '9R2NO8A-1', '9R3NO8A-1', 'PRQST02A-4'],
}
export default class VocabulaireSur4Operations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Addition (terme)',
        '2 : Addition (somme)',
        '3 : Addition (calcul)',
        '4 : Soustraction (terme)',
        '5 : Soustraction (différence)',
        '6 : Soustraction (calcul)',
        '7 : Multiplication (facteur)',
        '8 : Multiplication (produit)',
        '9 : Multiplication (calcul)',
        '10 : Division (dividende)',
        '11 : Division (diviseur)',
        '12 : Division (quotient)',
        '13 : Division (reste)',
        '14 : Division (calcul)',
        '15 : Mélange',
      ].join('\n'),
    ]
    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 15
    this.spacing = 2
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 14,
      defaut: 15,
      melange: 15,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    const listeVoc = [
      'des termes',
      'des facteurs',
      'le diviseur',
      'le dividende',
      'le reste',
      'la somme',
      'la différence',
      'le produit',
      'le quotient',
    ]
    for (
      let i = 0, texte, a, b, reste, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const reponse: { textes: string[]; statuts: boolean[] } = {
        textes: [],
        statuts: [],
      }
      do {
        a = randint(2, 10)
        b = randint(2, 10, [a])
        if (a < b) {
          ;[a, b] = [b, a]
        }
      } while (a - b === a || a - b === b)
      texte = ''
      texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte += `Dans l'opération «${sp()}$${a} + ${b}$${sp()}», comment s'appellent les nombres $${a}$ et $${b}$ ?`
          texteCorr += `Dans l'opération «${sp()}$${a} + ${b}$${sp()}», $${a}$ et $${b}$ s'appellent des ${texteEnCouleurEtGras('termes')}.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'des termes')
          break
        case 2:
          texte += `Dans l'égalité «${sp()}$${a} + ${b} = ${a + b}$ ${sp()}», comment s'appelle le nombre $${a + b}$ ?`
          texteCorr += `Dans l'égalité «${sp()}$${a} + ${b} = ${a + b}$${sp()}», $${a + b}$ s'appelle la ${texteEnCouleurEtGras('somme')} de $${a}$ et $${b}$.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'la somme')
          break
        case 3:
          texte += `Quelle est la somme de $${a}$ et $${b}$ ?`
          texteCorr += `La somme de $${a}$ et $${b}$ est $${miseEnEvidence(texNombre(a + b))}$ car $${a}+${b}=${a + b}$.`
          reponse.textes = [a, b, a + b, a * b, a - b].map(String)
          reponse.statuts = [false, false, true, false, false]
          break
        case 4:
          texte += `Dans l'opération «${sp()}$${a} - ${b}$${sp()}», comment s'appellent les nombres $${a}$ et $${b}$ ?`
          texteCorr += `Dans l'opération «${sp()}$${a} - ${b}$${sp()}», $${a}$ et $${b}$ s'appellent des ${texteEnCouleurEtGras('termes')}.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'des termes')
          break
        case 5:
          texte += `Dans l'égalité «${sp()}$${a} - ${b} = ${a - b}$${sp()}», comment s'appelle le nombre $${a - b}$ ?`
          texteCorr += `Dans l'égalité «${sp()}$${a} - ${b} = ${a - b}$${sp()}», $${a - b}$ s'appelle la ${texteEnCouleurEtGras('différence')} entre $${a}$ et $${b}$.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'la différence')
          break
        case 6:
          texte += `Quelle est la différence entre $${a}$ et $${b}$ ?`
          texteCorr += `La différence entre $${a}$ et $${b}$ est $${miseEnEvidence(texNombre(a - b))}$ car $${a}-${b}=${a - b}$.`
          reponse.textes = [a, b, a + b, a * b, a - b].map(String)
          reponse.statuts = [false, false, false, false, true]
          break
        case 7:
          texte += `Dans l'opération «${sp()}$${a} \\times ${b}$${sp()}», comment s'appellent les nombres $${a}$ et $${b}$ ?`
          texteCorr += `Dans l'opération «${sp()}$${a} \\times ${b}$${sp()}», $${a}$ et $${b}$ s'appellent des ${texteEnCouleurEtGras('facteurs')}.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'des facteurs')
          break
        case 8:
          texte += `Dans l'égalité «${sp()}$${a} \\times ${b} = ${a * b}$${sp()}», comment s'appelle le nombre $${a * b}$ ?`
          texteCorr += `Dans l'égalité «${sp()}$${a} \\times ${b} = ${a * b}$${sp()}», $${a * b}$ s'appelle le ${texteEnCouleurEtGras('produit')} de $${a}$ par $${b}$.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'le produit')
          break
        case 9:
          texte += `Quel est le produit de $${a}$ par $${b}$ ?`
          texteCorr += `Le produit de $${a}$ et $${b}$ est $${miseEnEvidence(texNombre(a * b))}$ car $${a}\\times${b}=${a * b}$.`
          reponse.textes = [a, b, a + b, a * b, a - b].map(String)
          reponse.statuts = [false, false, false, true, false]
          break
        case 10:
          texte += `Dans l'opération «${sp()}$${a * b} \\div ${b}$${sp()}», comment s'appelle le nombre $${a * b}$ ?`
          texteCorr += `Dans l'opération «${sp()}$${a * b} \\div ${b}$${sp()}», $${a * b}$ s'appelle le ${texteEnCouleurEtGras('dividende')}.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'le dividende')
          break
        case 11:
          texte += `Dans l'opération «${sp()}$${a * b} \\div ${b}$${sp()}», comment s'appelle le nombre $${b}$ ?`
          texteCorr += `Dans l'opération «${sp()}$${a * b} \\div ${b}$${sp()}», $${b}$ s'appelle le ${texteEnCouleurEtGras('diviseur')}.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'le diviseur')
          break
        case 12:
          texte += `Dans l'égalité «${sp()}$${a * b} \\div ${b} = ${a}$${sp()}», comment s'appelle le nombre $${a}$ ?`
          texteCorr += `Dans l'égalité «${sp()}$${a * b} \\div ${b} = ${a}$${sp()}», $${a}$ s'appelle le ${texteEnCouleurEtGras('quotient')} de  $${a * b}$ par $${b}$.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'le quotient')
          break
        case 13:
          reste = randint(1, Math.min(a, b) - 1)
          texte += `Dans l'égalité «${sp()}$${a * b + reste} = ${b} \\times ${a} + ${reste} $${sp()}», comment s'appelle le nombre $${reste}$ ?`
          texteCorr += `Dans l'égalité «${sp()}$${a * b + reste} = ${b} \\times ${a} + ${reste} $${sp()}», $${reste}$ s'appelle le ${texteEnCouleurEtGras('reste')} du quotient de  $${a * b + reste}$ par $${b}$ ou de $${a * b + reste}$ par $${a}$.`
          reponse.textes = listeVoc
          reponse.statuts = listeVoc.map((el) => el === 'le reste')
          break
        case 14:
          texte += `Quel est le quotient de $${a * b}$ par $${b}$ ?`
          texteCorr += `Le quotient de $${a * b}$ par $${b}$ est $${miseEnEvidence(texNombre(a))}$ car $${a * b}\\div${b}=${a}$.`
          reponse.textes = [a, b, a * b, a * b + b, a * b - b].map(String)
          reponse.statuts = [true, false, false, false, false]
          break
      }
      const props = []
      for (let j = 0; j < reponse.textes.length; j++) {
        props.push({
          texte: reponse.textes[j],
          statut: reponse.statuts[j],
        })
      }
      this.autoCorrection[i] = {
        propositions: props,
        options: {
          ordered: true,
          nbCols: 5,
        },
      }
      const monQcm = propositionsQcm(this, i)
      if (this.interactif) {
        texte += monQcm.texte
      }
      if (this.questionJamaisPosee(i, a, b, listeTypeDeQuestions[i])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
