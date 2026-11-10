// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f3e42 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Étudier le sens de variation d'une suite définie de façon explicite"

export const dateDePublication = '03/10/2024'
/**
 * @author Samuel Rattoray
 */
export const uuid = 'f3e42'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class VariationDUneSuiteDefinieExplicitementOld extends Exercice {
  constructor() {
    super()
    this.titre = titre
    // this.consigne = 'Une suite étant donnée, étudier son sens de variation.'
    this.nbQuestions = 3
    this.sup = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Affine',
        '2 : Second degré',
        '3 : Homographique',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    this.autoCorrection = []
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    this.listeQuestions = [] // Vide la liste de questions
    this.listeCorrections = [] // Vide la liste de questions corrigées

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
          // fonction affine avec Entiers Relatifs (m*x+p)
          const m = randint(1, 99) * choice([-1, 1])
          const p = randint(1, 99) * choice([-1, 1])
          alea1 = m
          alea2 = p

          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_n =${rienSi1(m)}n${ecritureAlgebrique(p)}$. `
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$.'
          texteCorr =
            "Deux manières d'étudier le sens de variation de $(u_n)$ sont possibles."
          texteCorr += '<br><br>'
          texteCorr += 'Méthode $1$ : en étudiant le signe de $u_{n+1} - u_n$ :'
          texteCorr += '<br>Pour tout $n\\in\\mathbb{N}$ :'
          texteCorr += `<br>$u_{n+1} - u_n = ${rienSi1(m)}(n+1) ${ecritureAlgebrique(p)}-(${rienSi1(m)}n ${ecritureAlgebrique(p)})$`
          texteCorr += `<br>$\\phantom{u_{n+1} - u_n} = ${rienSi1(m)}n ${ecritureAlgebrique(m)} ${ecritureAlgebrique(p)} ${ecritureAlgebrique(-m)}n ${ecritureAlgebrique(-p)}$`
          texteCorr += `<br>$\\phantom{u_{n+1} - u_n} = ${m}$ `
          texteCorr += '<br>'
          if (m >= 0) {
            texteCorr += `$${m}>0$, on en déduit que $u_{n+1} - u_n >0$, soit $u_{n+1} > u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
          } else {
            texteCorr += `$${m}<0$, on en déduit que $u_{n+1} - u_n <0$, soit $u_{n+1} < u_n$. <br> La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
          }
          texteCorr += '<br><br>'
          texteCorr += `Méthode $2$ : en utilisant le sens de variation de la fonction associée : <br> Pour tout $n\\in\\mathbb{N}$ on a $(u_n) = f(n)$ où $f$ est la fonction définie sur $[0;+\\infty[$ par $f(x) = ${rienSi1(m)}x ${ecritureAlgebrique(p)}$`
          texteCorr += '<br>'
          texteCorr +=
            "$f$ est une fonction affine et le sens de variation d'une fonction affine dépend du signe de a :"
          texteCorr += '<br>'
          if (m >= 0) {
            texteCorr += `Or $a=${m}>0$, la fonction $f$ est donc croissante sur $[0;+\\infty[$. <br> On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
          } else {
            texteCorr += `Or $a=${m}<0$, la fonction $f$ est donc décroissante sur $[0;+\\infty[$. <br> On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
          }
          break
        }

        case 2: {
          // fonction polynome de degré 2 (a*x²+b*x+c)
          const a = randint(1, 9) * choice([-1, 1])
          const b = randint(0, 50) * choice([-1, 1])
          const c = randint(0, 50) * choice([-1, 1])
          const alpha = -b / (2 * a)
          const rangP = Math.ceil(alpha)
          alea1 = a
          alea2 = b

          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par ${b === 0 ? `$u_n = ${rienSi1(a)}n^2 ${ecritureAlgebrique(c)}$` : `$u_n = ${rienSi1(a)}n^2 ${ecritureAlgebriqueSauf1(b)}n ${ecritureAlgebrique(c)}$`}.`
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$.'
          texteCorr = `Dans ce cas, l'étude du sens de variation de la fonction est plus simple que d'étudier le signe de $u_{n+1}-u_{n}$. <br> On a $(u_n) = f(n)$ avec $f(x) = $${b === 0 ? `$${rienSi1(a)}x^2 ${ecritureAlgebrique(c)}$` : `$ ${rienSi1(a)}x^2 ${ecritureAlgebriqueSauf1(b)}x ${ecritureAlgebrique(c)}$`}.`
          texteCorr += '<br>'
          texteCorr +=
            'Pour les suites définies de manière explicite, le sens de variation de la fonction $f$ donne le sens de variation de la suite $u$. <br> On étudie donc le sens de variation de la fonction $f$.'
          texteCorr += '<br>'
          texteCorr += 'Or $f$ est une fonction polynomiale du second degré.'
          texteCorr += '<br>'
          texteCorr += `Pour étudier ses variations, nous calculons $\\alpha = \\dfrac{${'-b'}}{${'2a'}}$ qui correspond à l'abscisse du sommet de la parabole : $\\alpha = ${new FractionEtendue(-b, 2 * a).texFractionSimplifiee}$.`
          texteCorr += '<br>'
          if (a >= 0) {
            texteCorr += `De plus $a = ${a}>0$, la fonction $f$ est donc décroissante sur $]-\\infty;${new FractionEtendue(-b, 2 * a).texFractionSimplifiee}[$ et croissante sur $]${new FractionEtendue(-b, 2 * a).texFractionSimplifiee};+\\infty[$.`
            texteCorr += '<br>'
            if (rangP >= 0) {
              texteCorr += `On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('croissante')} pour tout entier $n \\geqslant ${miseEnEvidence(rangP)}$.`
            } else {
              texteCorr += `On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
            }
          } else {
            texteCorr += `De plus $${a}<0$, la fonction $f$ est donc croissante sur $]-\\infty;${new FractionEtendue(-b, 2 * a).texFractionSimplifiee}[$ et décroissante sur $]${new FractionEtendue(-b, 2 * a).texFractionSimplifiee};+\\infty[$.`
            texteCorr += '<br>'
            if (rangP >= 0) {
              texteCorr += `On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')} pour tout entier $n \\geqslant ${miseEnEvidence(rangP)}$.`
            } else {
              texteCorr += `On en déduit que la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
            }
          }
          break
        }

        // case 3:{ // fonction homographique (num_a*x+num_b)/(denom_c*x+denom_d)
        default: {
          let numA: number, numB: number, denomC: number, denomD: number
          do {
            numA = randint(1, 9)
            numB = randint(1, 9) * choice([-1, 1])
            denomC = randint(1, 9)
            denomD = randint(1, 9) * choice([-1, 1])
          } while (
            numA + numB === 0 ||
            denomD + denomC === 0 ||
            denomD + 2 * denomC === 0 ||
            denomD + 3 * denomC === 0 ||
            denomD + 4 * denomC === 0 ||
            denomD + 5 * denomC === 0 ||
            denomD + 6 * denomC === 0 ||
            denomD + 7 * denomC === 0 ||
            denomD + 8 * denomC === 0 ||
            denomD + 9 * denomC === 0
          )
          alea1 = numA
          alea2 = numB
          const numerateur = (numA + numB) * denomD - numB * (denomC + denomD)
          const Tableau = tableauColonneLigne(
            ['n', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ['u_n'],
            [
              new FractionEtendue(numB, denomD).texFractionSimplifiee,
              new FractionEtendue(numA + numB, denomC + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 2 + numB, denomC * 2 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 3 + numB, denomC * 3 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 4 + numB, denomC * 4 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 5 + numB, denomC * 5 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 6 + numB, denomC * 6 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 7 + numB, denomC * 7 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 8 + numB, denomC * 8 + denomD)
                .texFractionSimplifiee,
              new FractionEtendue(numA * 9 + numB, denomC * 9 + denomD)
                .texFractionSimplifiee,
            ],
          )
          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_n = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}}$.`
          texte += '<br><br>'
          texte += 'Étudier le sens de variation de la suite $(u_n)$.'
          if (numA * denomD === numB * denomC) {
            texteCorr = `On remarque que $u_n = \\dfrac{${numA}}{${denomC}} \\times \\dfrac{n ${ecritureAlgebrique(fraction(numB, numA))}}{n ${ecritureAlgebrique(fraction(denomD, denomC))}}$`
            texteCorr += '<br>'
            texteCorr += `$u_n = ${new FractionEtendue(numA, denomC).texFractionSimplifiee} \\times \\dfrac{n ${ecritureAlgebrique(fraction(numB, numA).simplifie())}}{n ${ecritureAlgebrique(fraction(denomD, denomC).simplifie())}}$`
            texteCorr += '<br><br>'
            texteCorr += `Alors $u_n = ${new FractionEtendue(numA, denomC).texFractionSimplifiee}$`
            texteCorr += '<br><br>'
            texteCorr += 'La suite $(u_n)$ est constante sur $\\mathbb{N}$'
          } else {
            texteCorr = '<br><br>'
            texteCorr += `Remarque : $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}=0 \\iff n= ${new FractionEtendue(-denomD, denomC).texFractionSimplifiee}$. Or $${new FractionEtendue(-denomD, denomC).texFractionSimplifiee} \\notin \\mathbb{N}$, c'est pourquoi $(u_n)$ est définie pour tout $n \\in \\mathbb{N}$`
            texteCorr += '<br>'
            texteCorr += 'Voici les premiers termes de la suite $(u_n)$ :'
            texteCorr += '<br>'
            texteCorr += Tableau
            texteCorr += '<br>'
            if (-denomD / denomC >= 0) {
              if (numerateur >= 0) {
                texteCorr += `On peut conjecturer que la suite $(u_n)$ est croissante pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$.`
              } else {
                texteCorr += `On peut conjecturer que la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')} à partir du rang $${miseEnEvidence(texNombre(Math.ceil(-denomD / denomC)))}$.`
              }
            } else {
              if (numerateur >= 0) {
                texteCorr += `On peut conjecturer que la suite $(u_n)$ est ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
              } else {
                texteCorr += `On peut conjecturer que la suite $(u_n)$ est ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
              }
            }
            texteCorr += '<br><br>'
            texteCorr +=
              'Soit $n \\in \\mathbb{N}$, calculons la différence entre deux termes consécutifs :'
            texteCorr += '<br><br>'
            texteCorr += `$u_{n+1} - u_n = \\dfrac{${rienSi1(numA)}(n+1) ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}(n+1) ${ecritureAlgebrique(denomD)}} - \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}}$`
            texteCorr += '<br><br>'
            texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numA)} ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomC)} ${ecritureAlgebrique(denomD)}} - \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}}$`
            texteCorr += '<br><br>'
            if (denomC + denomD === 0) {
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)}}{${rienSi1(denomC)}n} - \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}}$`
              texteCorr += '<br><br>'
              if (denomC >= 0) {
                texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)})(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})-(${rienSi1(numA)}n ${ecritureAlgebrique(numB)})${rienSi1(denomC)}n}{${rienSi1(denomC)}n (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
                texteCorr += '<br><br>'
              } else {
                texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)})(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})-(${rienSi1(numA)}n ${ecritureAlgebrique(numB)})(${rienSi1(denomC)}n)}{${rienSi1(denomC)}n (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
                texteCorr += '<br><br>'
              }
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD)}n ${ecritureAlgebrique((numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numB * denomC)}n)}{${rienSi1(denomC)}n (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD + (numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numB * denomC)}n)}{${rienSi1(denomC)}n (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${(numA + numB) * denomD}}{${rienSi1(denomC)}n (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
            } else {
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}} - \\dfrac{${rienSi1(numA)}n ${ecritureAlgebrique(numB)}}{${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA)}n ${ecritureAlgebrique(numB + numA)})(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})-(${rienSi1(numA)}n ${ecritureAlgebrique(numB)})(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD)}n ${ecritureAlgebrique((numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * (denomC + denomD))}n ${ecritureAlgebrique(numB * denomC)}n ${ecritureAlgebrique(numB * (denomC + denomD))})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{(${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * denomD + (numA + numB) * denomC)}n ${ecritureAlgebrique((numA + numB) * denomD)}) - (${rienSi1(numA * denomC)}n^2 ${ecritureAlgebrique(numA * (denomC + denomD) + numB * denomC)}n ${ecritureAlgebrique(numB * (denomC + denomD))})}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${(numA + numB) * denomD} ${ecritureAlgebrique(-numB * (denomC + denomD))}}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
              texteCorr += `$\\phantom{u_{n+1} - u_n} = \\dfrac{${(numA + numB) * denomD - numB * (denomC + denomD)}}{(${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}) (${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)})}$`
              texteCorr += '<br><br>'
            }
            if (denomC + denomD > 0 && denomD > 0) {
              texteCorr += `Comme $n\\in\\mathbb{N}$, $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}>0$ et $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`
            } else {
              if (denomC + denomD > 0 || denomD > 0) {
                if (denomC + denomD > 0) {
                  texteCorr += `Comme $n\\in\\mathbb{N}$, $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}>0$.`
                } else {
                  texteCorr += `Pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$ on a $${rienSi1(denomC)}n \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC)}$, soit  $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)} \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC + denomD + denomC)}$. On a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}>0$.`
                }
                texteCorr += '<br>'
                if (denomD > 0) {
                  texteCorr += `Comme $n\\in\\mathbb{N}$, $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`
                } else {
                  texteCorr += `Pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$ on a $${rienSi1(denomC)}n \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC)}$, soit  $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)} \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC + denomD)}$. On a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`
                }
              } else {
                texteCorr += `Pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$ on a $${rienSi1(denomC)}n \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC)}$.`
                texteCorr += '<br>'
                texteCorr += `On alors  $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)} \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC + denomD + denomC)}$ et $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)} \\geqslant ${texNombre(Math.ceil(-denomD / denomC) * denomC + denomD)}$.`
                texteCorr += '<br>'
                texteCorr += `On a donc $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD + denomC)}>0$ et $${rienSi1(denomC)}n ${ecritureAlgebrique(denomD)}>0$.`
              }
            }
            texteCorr += '<br>'
            if (numerateur >= 0) {
              texteCorr += `De plus : $${(numA + numB) * denomD - numB * (denomC + denomD)}>0$`
            } else {
              texteCorr += `De plus : $${(numA + numB) * denomD - numB * (denomC + denomD)}<0$`
            }
            texteCorr += '<br>'
            if (-denomD / denomC >= 0) {
              if (numerateur >= 0) {
                texteCorr += `On peut alors en déduire que $u_{n+1}-u_n > 0$ pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$.`
                texteCorr += '<br>'
                texteCorr += '<br>'
                texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} à partir du rang $${miseEnEvidence(texNombre(Math.ceil(-denomD / denomC)))}$.`
              } else {
                texteCorr += `On peut alors en déduire que $u_{n+1}-u_n < 0$ pour tout $n \\geqslant ${texNombre(Math.ceil(-denomD / denomC))}$.`
                texteCorr += '<br>'
                texteCorr += '<br>'
                texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} à partir du rang $${miseEnEvidence(texNombre(Math.ceil(-denomD / denomC)))}$.`
              }
            } else {
              if (numerateur >= 0) {
                texteCorr +=
                  'On peut alors en déduire que $u_{n+1}-u_n > 0$, soit $u_{n+1} > u_n$ pour tout entier $\\in\\mathbb{N}$.'
                texteCorr += '<br>'
                texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('croissante')} sur $\\mathbb{N}$.`
              } else {
                texteCorr +=
                  'On peut alors en déduire que $u_{n+1}-u_n < 0$ pour tout entier $\\in\\mathbb{N}$.'
                texteCorr += '<br>'
                texteCorr += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')} sur $\\mathbb{N}$.`
              }
            }
          }
          break
        }
      }

      if (this.questionJamaisPosee(i, alea1, alea2)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions.push(texte) // Sinon on enregistre la question dans listeQuestions
        this.listeCorrections.push(texteCorr) // On fait pareil pour la correction
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
