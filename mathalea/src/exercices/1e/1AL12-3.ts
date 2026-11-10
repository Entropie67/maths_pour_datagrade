import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre =
  "Étudier le sens de variation d'une suite définie par récurrence"

export const dateDePublication = '03/10/2024'
/**
 * @author Samuel Rattoray
 */
export const uuid = '1b656'
export const refs = {
  'fr-fr': ['1AL12-3'],
  'fr-ch': ['autres-11'],
}
export default class VariationDUneSuiteDefinieParRecurrence extends Exercice {
  constructor() {
    super()

    // this.consigne = 'Une suite étant donnée, étudier son sens de variation.'
    this.nbQuestions = 3
    this.sup = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Arithmétique',
        '2 : u_n+a*n',
        '3 : u_n+a*n+b',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte: string,
        texteCorr: string,
        cpt = 0,
        alea1: number,
        alea2: number;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: {
          // Suite arithmétique (u_{n+1}=u_n+a avec u_0=premier_terme)
          const a = randint(1, 99) * choice([-1, 1])
          const premierTerme = randint(1, 39) * choice([-1, 1])
          alea1 = a
          alea2 = premierTerme

          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_0=${premierTerme}$ et $u_{n+1} = u_n ${ecritureAlgebrique(a)}$. `
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$'
          texteCorr = `On étudie le signe de la différence entre deux termes consécutifs :  <br> Soit $n\\in\\mathbb{N}$, on a $u_{n+1} - u_n = ${a}$`
          texteCorr += '<br><br>'
          if (a >= 0) {
            texteCorr += `$${a}>0$, on en déduit que $u_{n+1} - u_n >0$, soit $u_{n+1} > u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
          } else {
            texteCorr += `$${a}<0$, on en déduit que $u_{n+1} - u_n <0$, soit $u_{n+1} < u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
          }
          break
        }

        case 2: {
          // Suite définie par u_{n+1}=u_n+b*n avec u_0=u_0
          const b = randint(2, 50) * choice([-1, 1])
          const u0 = randint(1, 39) * choice([-1, 1])
          alea1 = b
          alea2 = u0

          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_0=${u0}$ et $u_{n+1} = u_n ${ecritureAlgebrique(b)}n$.`
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$'
          texteCorr = `On étudie le signe de la différence entre deux termes consécutifs :  <br> Soit $n\\in\\mathbb{N}$, on a $u_{n+1} - u_n = ${b}n$`
          texteCorr += '<br>'
          if (b >= 0) {
            texteCorr += `$${b}>0$ et $n \\geqslant 0$, on en déduit que $${b}n \\geqslant 0$.`
            texteCorr += '<br>'
            texteCorr += `$u_{n+1} - u_n \\geqslant 0$, soit $u_{n+1} \\geqslant u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
          } else {
            texteCorr += `$${b}<0$ et $n \\geqslant 0$, on en déduit que $${b}n \\leqslant 0$.`
            texteCorr += '<br>'
            texteCorr += `$u_{n+1} - u_n \\leqslant 0$, soit $u_{n+1} \\leqslant u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
          }
          break
        }

        default: {
          // Case 3 // Suite définie par u_{n+1}=u_n+c*n+d avec u_0=u
          const c = randint(1, 50) * choice([-1, 1])
          const d = randint(1, 50) * choice([-1, 1])
          const u = randint(1, 39) * choice([-1, 1])
          const rang = Math.floor(-d / c) + 1 // plus petit entier n tel que n > -d/c
          alea1 = d
          alea2 = u

          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_0=${u}$ et $u_{n+1} = u_n ${ecritureAlgebrique(c)}n ${ecritureAlgebrique(d)}$.`
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$'
          texteCorr = `On étudie le signe de la différence entre deux termes consécutifs :  <br> Soit $n\\in\\mathbb{N}$, on a $u_{n+1} - u_n = ${rienSi1(c)}n ${ecritureAlgebrique(d)}$`
          texteCorr += '<br>'
          if (c >= 0) {
            texteCorr += `$${rienSi1(c)}n ${ecritureAlgebrique(d)}>0 \\iff ${rienSi1(c)}n>${-d} \\iff n > ${new FractionEtendue(-d, c).texFractionSimplifiee}$.`
            texteCorr += '<br>'
            texteCorr += `On en déduit que $u_{n+1} - u_n > 0$, soit $u_{n+1} > u_n$, pour tout $n${-d / c > 0 ? ` \\geqslant ${rang}` : '\\in\\mathbb{N}'}$. `
            texteCorr += '<br>'
            if (-d / c > 0) {
              texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} à partir du rang $${miseEnEvidence(texNombre(rang))}$.`
            } else {
              texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
            }
          } else {
            texteCorr += `$${rienSi1(c)}n ${ecritureAlgebrique(d)}<0 \\iff ${rienSi1(c)}n<${-d} \\iff n>${new FractionEtendue(-d, c).texFractionSimplifiee}$.`
            texteCorr += '<br>'
            texteCorr += `On en déduit que $u_{n+1} - u_n < 0$, soit $u_{n+1} < u_n$, pour tout $n${-d / c > 0 ? ` \\geqslant ${rang}` : '\\in\\mathbb{N}'}$. `
            texteCorr += '<br>'
            if (-d / c > 0) {
              texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} à partir du rang $${miseEnEvidence(texNombre(rang))}$.`
            } else {
              texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
            }
          }
          break
        }
      }

      if (this.questionJamaisPosee(i, alea1, alea2)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++ // On passe à la question suivante
      }
      cpt++ // Sinon on incrémente le compteur d'essai pour avoir une question nouvelle
    }
    listeQuestionsToContenu(this) // La liste de question et la liste de la correction

    // sont transformés en chaine de caractère (avec une liste HTML ou LaTeX suivant le contexte)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté',3];
  // On aurait pu ajouter un formulaire pour régler le niveau de difficulté à l'aide de l'attribut this.sup
}
