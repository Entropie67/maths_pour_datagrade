import { buildQcmForExercise } from '../../lib/interactif/qcmBuilder'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'c0f91'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Répondre à des QCM Bac : suites'
export const dateDePublication = '06/06/2026'

type Reponse = {
  texte: string
  statut?: boolean
}

type QcmItem = {
  enonce: string
  reponses: Reponse[]
  correction: string
}

const code = (source: string) => `<pre><code>${source}</code></pre>`

const qcmSuites: QcmItem[] = [
  {
    enonce:
      'On considère la suite $\\left(v_n\\right)$ définie sur $\\N$ par $v_n = \\dfrac{3n}{n + 2}$. On cherche à déterminer la limite de $v_n$ lorsque $n$ tend vers $+\\infty$.',
    reponses: [
      { texte: '$\\displaystyle\\lim_{n \\to + \\infty}v_n = 1$' },
      {
        texte: '$\\displaystyle\\lim_{n \\to + \\infty}v_n = 3$',
        statut: true,
      },
      { texte: '$\\displaystyle\\lim_{n \\to + \\infty}v_n = \\dfrac{3}{2}$' },
      { texte: 'On ne peut pas la déterminer' },
    ],
    correction:
      'Pour $n$ assez grand, on a $n \\ne 0$, donc $v_n = \\dfrac{3}{1 + \\frac{2}{n}}$.<br>Comme $\\displaystyle\\lim_{n \\to + \\infty} \\dfrac{2}{n} = 0$, on a $\\displaystyle\\lim_{n \\to + \\infty} v_n = 3$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère les suites $\\left(u_n\\right)$ et $\\left(v_n\\right)$ telles que, pour tout entier naturel $n$, $u_n= 1-\\left(\\frac{1}{4}\\right)^n$ et $v_n=1+\\left(\\frac{1}{4}\\right)^n$.<br>On considère de plus une suite $\\left(w_n\\right)$ qui, pour tout entier naturel $n$, vérifie $u_n\\leqslant w_n\\leqslant v_n$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      {
        texte:
          'Les suites $\\left(u_n\\right)$ et $\\left(v_n\\right)$ sont géométriques.',
      },
      { texte: 'La suite $(w_n)$ converge vers $1$.', statut: true },
      { texte: 'La suite $\\left(u_n\\right)$ est minorée par $1$.' },
      { texte: 'La suite $\\left(w_n\\right)$ est croissante.' },
    ],
    correction:
      'Application directe du théorème dit «\u00a0des gendarmes\u00a0». Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par $u_n  = \\dfrac{(- 1)^n}{n + 1}$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(u_n\\right)$ diverge vers $+\\infty$.' },
      { texte: 'la suite $\\left(u_n\\right)$ diverge vers $-\\infty$.' },
      { texte: "la suite $\\left(u_n\\right)$ n'a pas de limite." },
      { texte: 'la suite $\\left(u_n\\right)$ converge.', statut: true },
    ],
    correction:
      `On a $- 1 \\leqslant (- 1)^n \\leqslant 1$, donc puisque $n+1 \\geqslant 1 > 0$, on en déduit que pour tout naturel${sp()}: $- \\dfrac{1}{n+1} \\leqslant u_n \\leqslant \\dfrac{1}{n+1}$.<br>La suite $\\left(u_n\\right)$ encadrée par deux suites ayant pour limite $0$ a pour limite $0$. Réponse $\\mathbf{d}$.`,
  },
  {
    enonce:
      `On considère deux suites $\\left(v_n\\right)$ et $\\left(w_n\\right)$ vérifiant la relation${sp()}: $w_n = \\mathrm{e}^{- 2v_n} + 2$.<br>Soit $a$ un nombre réel strictement positif. On a $v_0 = \\ln (a)$.`,
    reponses: [
      { texte: '$w_0 = \\dfrac{1}{a^2}  +2$', statut: true },
      { texte: '$w_0 = \\dfrac{1}{a^2  +2}$' },
      { texte: '$w_0 = -2a +2$' },
      { texte: '$w_0 = \\dfrac{1}{- 2a} + 2$' },
    ],
    correction:
      'On a $w_0 = \\mathrm{e}^{- 2v_0} + 2 = \\mathrm{e}^{- 2\\ln (a)} + 2 = \\dfrac{1}{\\mathrm{e}^{2\\ln(a)}} + 2=  \\dfrac{1}{\\mathrm{e}^{\\ln \\left(a^2\\right)}} + 2 = \\dfrac{1}{a^2} + 2$. Réponse $\\mathbf{a}$.',
  },
  {
    enonce:
      `On considère deux suites $\\left(v_n\\right)$ et $\\left(w_n\\right)$ vérifiant la relation${sp()}: $w_n = \\mathrm{e}^{- 2v_n} + 2$.<br>On sait que la suite $\\left(v_n\\right)$ est croissante. On peut affirmer que la suite $\\left(w_n\\right)$ est${sp()}:`,
    reponses: [
      { texte: 'décroissante et majorée par $3$.' },
      { texte: 'décroissante et minorée par $2$.', statut: true },
      { texte: 'croissante et majorée par $3$.' },
      { texte: 'croissante et minorée par $2$.' },
    ],
    correction:
      `On a successivement${sp()}: $v_n \\leqslant v_{n+1} \\Rightarrow 2v_n \\leqslant 2v_{n+1} \\Rightarrow - 2v_{n+1} \\leqslant - 2v_n\\Rightarrow \\mathrm{e}^{- 2v_{n+1}} \\leqslant \\mathrm{e}^{- 2v_n}$ par croissance de la fonction exponentielle et enfin $\\mathrm{e}^{- 2v_{n+1}} + 2 \\leqslant \\mathrm{e}^{- 2v_n} + 2$, soit $w_{n+1} \\leqslant w_n$${sp()}: la suite $\\left(w_n\\right)$ est décroissante.<br>D’autre part on sait que quel que soit le réel $\\alpha$, $\\mathrm{e}^{\\alpha} > 0$ donc la suite est minorée par $2$. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On considère la suite $\\left(a_n\\right)$ ainsi définie${sp()}: $a_0 = 2$ et, pour tout entier naturel $n$, $a_{n+1} = \\dfrac13a_n + \\dfrac83$.<br>Pour tout entier naturel $n$, on a${sp()}:`,
    reponses: [
      { texte: '$a_n = 4 \\times \\left(\\dfrac13\\right)^n - 2$' },
      { texte: '$a_n = - \\dfrac{2}{3^n} + 4$', statut: true },
      { texte: '$a_n = 4 - \\left(\\dfrac13\\right)^n$' },
      {
        texte: '$a_n = 2 \\times \\left(\\dfrac13\\right)^n + \\dfrac{8n}{3}$',
      },
    ],
    correction:
      `Soit la suite $\\left(b_n\\right)$ définie pour tout naturel $n$ par $b_n = a_n + \\alpha$.<br>Alors $b_{n+1} = \\dfrac13b_n + \\dfrac{8 + 2\\alpha}{3}$.<br>Prenons $\\alpha = - 4$, alors $b_{n+1} = \\dfrac13b_n$${sp()}: cette égalité montre que la suite $\\left(b_n\\right)$ est une suite géométrique de raison $\\dfrac13$ et de premier terme $b_0 = a_0 + \\alpha = 2 - 4 = - 2$.<br>On sait qu’alors, quel que soit le naturel $n$, $b_n = b_0 \\times \\left(\\dfrac{1}{3}\\right)^n = - 2 \\times \\left(\\dfrac{1}{3}\\right)^n$.<br>Finalement $b_n = a_n - 4 \\iff a_n = 4 + b_n = 4 - 2\\times \\left(\\dfrac{1}{3}\\right)^n$. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On considère une suite $\\left(b_n\\right)$ telle que, pour tout entier naturel $n$, on a${sp()}: $b_{n+1} = b_n + \\ln \\left(\\dfrac{2}{\\left(b_n \\right)^2 + 3}\\right)$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(b_n\\right)$ est croissante.' },
      {
        texte: 'la suite $\\left(b_n\\right)$ est décroissante.',
        statut: true,
      },
      { texte: "la suite $\\left(b_n\\right)$ n'est pas monotone." },
      {
        texte:
          'le sens de variation de la suite $\\left(b_n\\right)$ dépend de $b_0$.',
      },
    ],
    correction:
      `On a quel que soit le naturel $n$, $b_{n+1} - b_n = \\ln \\left(\\dfrac{2}{\\left(b_n \\right)^2 + 3}\\right)$.<br>Or quel que soit le réel $b_n$, $b_n^2 \\geqslant 0$, donc $\\left(b_n\\right)^2 + 3 \\geqslant 3 > 2$, donc $\\dfrac{2}{\\left(b_n \\right)^2 + 3} < 1$ et enfin $\\ln \\left(\\dfrac{2}{\\left(b_n \\right)^2 + 3}\\right) < 0$.<br>Conclusion${sp()}: $b_{n+1} - b_n < 0$ montre que la suite $\\left(b_n\\right)$ est décroissante. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On donne la suite $\\left(u_n\\right)$ définie par${sp()}: $u_0 = 0$ et pour tout entier naturel $n$, $u_{n+1} = \\dfrac12 u_n + 1$.<br>La suite $\\left(v_n\\right)$, définie pour tout entier naturel $n$ par $v_n = u_n  - 2$, est${sp()}:`,
    reponses: [
      { texte: 'arithmétique de raison $- 2$ ;' },
      { texte: 'géométrique de raison $- 2$ ;' },
      { texte: 'arithmétique de raison $1$ ;' },
      { texte: 'géométrique de raison $\\dfrac12$.', statut: true },
    ],
    correction:
      `On a pour tout naturel $n$${sp()}: $v_{n+1} = u_{n+1} - 2 = \\dfrac12u_n + 1 - 2 = \\dfrac12u_n - 1 = \\dfrac12\\left(u_n - 2 \\right) = \\dfrac12v_n$.<br>L’égalité $v_{n+1} = \\dfrac12v_n$ montre que la suite $\\left(v_n\\right)$ est une suite géométrique de raison $\\dfrac12$. Réponse $\\mathbf{d}$.`,
  },
  {
    enonce:
      `On considère une suite $\\left(u_n\\right)$ telle que, pour tout entier naturel, on a${sp()}: $1  + \\left(\\dfrac14\\right)^n \\leqslant u_n \\leqslant 2 - \\dfrac{n}{n+1}$.<br>On peut affirmer que la suite $\\left(u_n\\right)$${sp()}:`,
    reponses: [
      { texte: 'converge vers $2$ ;' },
      { texte: 'converge vers $1$ ;', statut: true },
      { texte: 'diverge vers $+ \\infty$ ;' },
      { texte: "n'a pas de limite." },
    ],
    correction:
      'Comme $- 1 < \\dfrac{1}{4} < 1$, on sait que $\\displaystyle\\lim_{n \\to + \\infty}\\left(\\dfrac14\\right)^n = 0$ et donc $\\displaystyle\\lim_{n \\to + \\infty}1 + \\left(\\dfrac14\\right)^n = 1$.<br>On a $\\dfrac{n}{n + 1} = \\dfrac{1}{1 + \\frac1n}$. Or $\\displaystyle\\lim_{n \\to + \\infty} \\frac1n = 0 \\Rightarrow \\displaystyle\\lim_{n \\to + \\infty} \\dfrac{n}{n + 1} = 1$ et $\\displaystyle\\lim_{n \\to + \\infty}2 - \\dfrac{n}{n + 1} = 1$.<br>D’après le théorème des gendarmes, on peut dire que la suite $(u_n)$ est convergente et que $\\displaystyle\\lim_{n \\to + \\infty} u_n=1$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère les suites $\\left(a_n\\right)$ et $\\left(b_n\\right)$ définie par $a_0 = 1$ et, pour tout entier naturel $n$, $a_{n+1} = 0{,}5a_n + 1$ et $b_n = a_n - 2$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: '$\\left(a_n\\right)$ est arithmétique ;' },
      { texte: '$\\left(b_n\\right)$ est géométrique;', statut: true },
      { texte: '$\\left(a_n\\right)$ est géométrique;' },
      { texte: '$\\left(b_n\\right)$ est arithmétique.' },
    ],
    correction:
      '$b_n=a_n-2$ donc $a_n=b_n+2$.<br>$b_{n+1}=a_{n+1}-2 = 0{,}5 a_n +1-2 = 0{,}5\\left ( b_n+2\\right ) -1 =0{,}5 b_n +1-1=0{,}5 b_n$ donc la suite $(b_n)$ est géométrique de raison $0{,}5$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère les suites $\\left(u_n\\right)$ et $\\left(v_n\\right)$ définies par${sp()}: $u_0 = 2$, $v_0 = 1$ et, pour tout entier naturel $n$${sp()}: $\\left\\{\\begin{array}{lcl}u_{n+1}&=&u_n + 3v_n\\\\v_{n+1}&=&u_n + v_n.\\end{array}\\right.$<br>On peut affirmer que${sp()}:`,
    reponses: [
      {
        texte:
          '$\\left\\{\\begin{array}{lcl}u_2&=&5\\\\v_2&=&3\\end{array}\\right.$',
      },
      { texte: '$u_2^2 - 3v_2^2 = - 2^2$' },
      { texte: '$\\dfrac{u_2}{v_2} = 1{,}75$', statut: true },
      { texte: '$5u_1 = 3v_1$' },
    ],
    correction:
      '$\\left\\{\\begin{array}{lcl}u_1&=&u_0+3v_0=2+3\\times1=5\\\\v_1&=&u_0+v_0=2+1=3\\end{array}\\right.$ et $\\left\\{\\begin{array}{lcl}u_2&=&u_1+3v_1=5+3\\times3=14\\\\v_2&=&u_1+v_1=5+3=8\\end{array}\\right.$.<br>$\\dfrac{u_2}{v_2}=\\dfrac{14}{8}=1{,}75$. Réponse $\\mathbf{c}$.',
  },
  {
    enonce:
      `On considère les suites $\\left(u_n\\right)$ et $\\left(v_n\\right)$ définies par${sp()}: $u_0 = 2$, $v_0 = 1$ et, pour tout entier naturel $n$${sp()}: $\\left\\{\\begin{array}{lcl}u_{n+1}&=&u_n + 3v_n\\\\v_{n+1}&=&u_n + v_n.\\end{array}\\right.$<br>On considère le programme ci-dessous écrit en langage Python${sp()}:` +
      code(
        'def valeurs() :\n    u = 2\n    v = 1\n    for k in range(1,11) :\n        c = u\n        u = u + 3*v\n        v = c + v\n    return (u, v)',
      ) +
      `Ce programme renvoie${sp()}:`,
    reponses: [
      { texte: '$u_{11}$ et $v_{11}$ ;' },
      { texte: '$u_{10}$ et $v_{11}$ ;' },
      {
        texte: 'les valeurs de $u_n$ et $v_n$ pour $n$ allant de $1$ à $10$ ;',
      },
      { texte: '$u_{10}$ et $v_{10}$.', statut: true },
    ],
    correction: 'Réponse $\\mathbf{d}$.',
  },
  {
    enonce:
      `Un récipient contenant initialement $1$ litre d'eau est laissé au soleil.<br>Toutes les heures, le volume d'eau diminue de $15\\,\\%$.<br>Au bout de quel nombre entier d'heures le volume d'eau devient-il inférieur à un quart de litre${sp()}?`,
    reponses: [
      { texte: '$2$ heures' },
      { texte: '$8$ heures.' },
      { texte: '$9$ heures', statut: true },
      { texte: '$13$ heures' },
    ],
    correction:
      `Enlever $15\\,\\%$, revient à multiplier par $0{,}85$ $\\left(1 - \\dfrac{15}{100} = \\dfrac{85}{100} = 0{,}85 \\right)$.<br>Il faut donc trouver $n \\in \\N$ tel que $1 \\times 0{,}85^n < 0{,}25$ soit en prenant le logarithme népérien $n\\ln 0{,}85 < \\ln 0{,}25 \\iff n > \\dfrac{\\ln 0{,}25}{\\ln 0{,}85}$.<br>Or $\\dfrac{\\ln 0{,}25}{\\ln 0{,}85} \\approx 8{,}5$${sp()}: il faut donc attendre au moins la 9e heure. Réponse $\\mathbf{c}$.`,
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par $u_{n+1} = \\dfrac12u_n + 3$ et $u_0 = 6$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(u_n\\right)$ est strictement croissante.' },
      { texte: 'la suite $\\left(u_n\\right)$ est strictement décroissante.' },
      { texte: "la suite $\\left(u_n\\right)$ n'est pas monotone." },
      { texte: 'la suite $\\left(u_n\\right)$ est constante.', statut: true },
    ],
    correction:
      'Comme $u_0=6$, on obtient $u_1=\\dfrac12\\times6+3=6$. Si $u_n=6$, alors $u_{n+1}=\\dfrac12\\times6+3=6$. La suite est donc constante égale à $6$. Réponse $\\mathbf{d}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(a_n\\right)$ définie pour tout $n$ dans $\\N$ par${sp()}: $a_n = \\dfrac{1 - 3^n}{1 + 2^n}$.<br>La limite de la suite $\\left(a_n\\right)$ est égale à${sp()}:`,
    reponses: [
      { texte: '$- \\infty$', statut: true },
      { texte: '$- 1$' },
      { texte: '$1$' },
      { texte: '$+ \\infty$' },
    ],
    correction:
      '$a_n = \\dfrac{1 - 3^n}{1 + 2^n}=\\dfrac{3^n\\left(\\dfrac{1}{3^n}-1\\right)}{2^n\\left(\\dfrac{1}{2^n}+1\\right)}=\\left(\\dfrac{3}{2}\\right)^n \\dfrac{\\dfrac{1}{3^n}-1}{\\dfrac{1}{2^n}+1}$.<br>On a $\\displaystyle\\lim_{n \\to + \\infty} \\dfrac{\\dfrac{1}{3^n} - 1}{\\dfrac{1}{2^n} + 1} = - 1$. D’autre part $\\displaystyle\\lim_{n \\to + \\infty} \\left(\\dfrac{3}{2}\\right)^n=+\\infty$ car $\\dfrac{3}{2}> 1$, donc finalement par produit de limites, la limite de la suite $\\left(a_n\\right)$ est égale à $-\\infty$. Réponse $\\mathbf{a}$.',
  },
  {
    enonce:
      `Une action est cotée à $57$ € . Sa valeur augmente de $3\\,\\%$ tous les mois.<br>La fonction Python seuil() qui renvoie le nombre de mois à attendre pour que sa valeur dépasse $200$ € est${sp()}:`,
    reponses: [
      {
        texte: code(
          'def seuil() :\n    m=0\n    v=57\n    while v < 200 :\n        m=m+1\n        v = v*1.03\n    return m',
        ),
        statut: true,
      },
      {
        texte: code(
          'def seuil() :\n    m=0\n    v=57\n    while v > 200 :\n        m=m+1\n        v = v*1.03\n    return m',
        ),
      },
      {
        texte: code(
          'def seuil() :\n    v=57\n    for i in range (200) :\n        v = v*1.03\n    return v',
        ),
      },
      {
        texte: code(
          'def seuil() :\n    m=0\n    v=57\n    if v < 200 :\n        m=m+1\n    else :\n        v = v*1.03\n    return m',
        ),
      },
    ],
    correction:
      'Pour que la fonction seuil fonctionne, il faut que la boucle while s’exécute tant que $v<200$ et que le nombre de mois soit augmenté de $1$ à chaque exécution de la boucle. Réponse $\\mathbf{a}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par $u_n = \\dfrac{(-1)^n}{n+1}$.<br>On peut affirmer que la suite $\\left(u_n\\right)$ est${sp()}:`,
    reponses: [
      { texte: 'majorée et non minorée.' },
      { texte: 'minorée et non majorée.' },
      { texte: 'bornée.', statut: true },
      { texte: 'non majorée et non minorée.' },
    ],
    correction:
      '$\\forall n \\in \\N$, $ -1\\leqslant (-1)^n \\leqslant 1$ donc $-\\dfrac{1}{n+1} \\leqslant u_n \\leqslant \\dfrac{1}{n+1}$.<br>Or $\\forall n \\in \\N$, $n+1\\geqslant 1$ donc $\\dfrac{1}{n+1} \\leqslant 1$ et $-\\dfrac{1}{n+1} \\geqslant -1$.<br>Donc $\\forall n \\in \\N$, $-1\\leqslant u_n \\leqslant 1$. La suite $(u_n)$ est donc bornée. Réponse $\\mathbf{c}$.',
  },
  {
    enonce:
      `Soit $k$ un nombre réel non nul.<br>Soit $\\left(v_n\\right)$ une suite définie pour tout entier naturel $n$.<br>On suppose que $v_0 = k$ et que pour tout $n$, on a $v_n \\times v_{n+1} < 0$.<br>On peut affirmer que $v_{10}$ est${sp()}:`,
    reponses: [
      { texte: 'positif.' },
      { texte: 'négatif.' },
      { texte: 'du signe de $k$.', statut: true },
      { texte: 'du signe de $- k$.' },
    ],
    correction:
      'Cette inégalité nous permet d’affirmer que $\\forall n \\in \\N$, deux termes consécutifs $v_n$ et $v_{n+1}$ sont de signes opposés. Donc les termes $v_{n+1}$ et $v_{n+2}$ le sont aussi. Donc on peut en déduire que $\\forall n \\in \\N$, $v_n$ et $v_{n+2}$ sont de même signe.<br>Donc $v_0$, $v_2$, $\\ldots$, $v_{2k}$, avec $k\\in \\N$, sont de même signe, donc du signe de $k$. Réponse $\\mathbf{c}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(w_n\\right)$ définie pour tout entier naturel $n$ par${sp()}: $w_{n+1} = 2w_n - 4$ et $w_2 = 8$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: '$w_0 = 0$' },
      { texte: '$w_0 = 5$.', statut: true },
      { texte: '$w_0 = 10$.' },
      { texte: "Il n'est pas possible de calculer $w_0$." },
    ],
    correction:
      'Donc $\\forall n \\in \\N$, $w_n=\\dfrac{w_{n+1}+4}{2}$.<br>$w_1=\\dfrac{w_{2}+4}{2}=\\dfrac{8+4}{2}=6$ et $w_0=\\dfrac{w_{1}+4}{2}=\\dfrac{6+4}{2}=5$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(a_n\\right)$ définie pour tout entier naturel $n$ par${sp()}: $a_{n+1} = \\dfrac{\\mathrm{e}^n}{\\mathrm{e}^n + 1}a_n$ et $a_0 = 1$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(a_n\\right)$ est strictement croissante.' },
      {
        texte: 'la suite $\\left(a_n\\right)$ est strictement décroissante.',
        statut: true,
      },
      { texte: "la suite $\\left(a_n\\right)$ n'est pas monotone." },
      { texte: 'la suite $\\left(a_n\\right)$ est constante.' },
    ],
    correction:
      'Il est facile de démontrer par récurrence que $\\forall n \\in \\N$, $a_n > 0$ car $\\dfrac{\\mathrm{e}^n}{\\mathrm{e}^n+1}> 0$ et $a_0 > 0$.<br>$\\forall n \\in \\N$, $\\mathrm{e}^n < \\mathrm{e}^n+1$ donc $\\dfrac{\\mathrm{e}^n}{\\mathrm{e}^n+1}< 1$ donc $\\dfrac{\\mathrm{e}^n}{\\mathrm{e}^n+1} a_n< a_n$ donc $a_{n+1} < a_n$. La suite $(a_n)$ est donc strictement décroissante. Réponse $\\mathbf{b}$.',
  },
  {
    enonce: `Une cellule se reproduit en se divisant en deux cellules identiques, qui se divisent à leur tour, et ainsi de suite.<br>On appelle temps de génération le temps nécessaire pour qu’une cellule donnée se divise en deux cellules.<br>On a mis en culture $1$ cellule. Au bout de $4$ heures, il y a environ $${texNombre(4000)}$ cellules.<br>On peut affirmer que le temps de génération est environ égal à${sp()}:`,
    reponses: [
      { texte: "moins d'une minute." },
      { texte: '$12$ minutes.' },
      { texte: '$20$ minutes.', statut: true },
      { texte: '$1$ heure.' },
    ],
    correction: `D’après l’énoncé, nous savons que le nombre de cellules double à chaque intervalle de temps écoulé. Cherchons le premier entier $n$ tel que $2^n\\geqslant ${texNombre(4000)}$.<br>$2^n\\geqslant ${texNombre(4000)}\\iff \\ln\\left(2^n\\right) \\geqslant \\ln(${texNombre(4000)})\\iff n \\times \\ln(2) \\geqslant \\ln(${texNombre(4000)}) \\iff n \\geqslant \\dfrac{\\ln(${texNombre(4000)})}{\\ln(2)}$.<br>À la calculatrice${sp()}: $\\dfrac{\\ln(${texNombre(4000)})}{\\ln(2)}\\approx 11{,}97$ donc $n\\geqslant 12$.<br>Il s’est donc écoulé $12$ intervalles de temps pour que le nombre de cellules atteigne $${texNombre(4000)}$ en $4$ heures. Chaque intervalle de temps est donc${sp()}: $\\dfrac{4\\times 60}{12}= 20$ min. Réponse $\\mathbf{c}$.`,
  },
  {
    enonce:
      `On considère trois suites $\\left(u_n\\right)$, $\\left(v_n\\right)$ et $\\left(w_n\\right)$. On sait que, pour tout entier naturel $n$, on a${sp()}: $u_n \\leqslant v_n\\leqslant  w_n$ et de plus${sp()}: $\\displaystyle\\lim_{n \\to + \\infty} u_n= 1$ et $\\displaystyle\\lim_{n \\to + \\infty} w_n= 3$.<br>On peut alors affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(v_n\\right)$ converge ;' },
      {
        texte:
          'Si la suite $\\left(u_n\\right)$ est croissante alors la suite $\\left(v_n\\right)$ est minorée par $u_0$ ;',
        statut: true,
      },
      { texte: '$1 \\leqslant  v_0 \\leqslant 3$ ;' },
      { texte: 'la suite $\\left(v_n\\right)$ diverge.' },
    ],
    correction:
      'Si $\\left(u_n\\right)$ est croissante, on a pour tout $n \\in \\N$, $u_0 \\leqslant u_n \\leqslant v_n$, donc la suite $\\left(v_n\\right)$ est minorée par $u_0$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `On considère une suite $\\left(u_n\\right)$ telle que, pour tout entier naturel $n$ non nul${sp()}: $u_n \\leqslant  u_{n+1}  \\leqslant \\dfrac1n$.<br>On peut alors affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(u_n\\right)$ diverge ;' },
      { texte: 'la suite $\\left(u_n\\right)$ converge ;', statut: true },
      { texte: '$\\displaystyle\\lim_{n \\to + \\infty} u_n = 0$ ;' },
      { texte: '$\\displaystyle\\lim_{n \\to + \\infty} u_n = 1$.' },
    ],
    correction:
      `Pour tout entier $n \\in \\N^{*}$, $u_n \\leqslant u_{n+1} \\leqslant \\dfrac1n$${sp()}: la suite $\\left(u_n\\right)$ est donc croissante.<br>D’autre part${sp()}: pour $n \\ne 0$, on peut écrire${sp()}: $u_n \\leqslant u_{n+1} \\leqslant \\dfrac1n \\leqslant 1$.<br>Conclusion${sp()}: la suite $\\left(u_n\\right)$ est croissante et elle majorée par $1$${sp()}: elle converge donc. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On considère $\\left(u_n\\right)$ une suite réelle telle que pour tout entier naturel $n$, on a${sp()}: $n < u_n < n + 1$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      {
        texte: 'Il existe un entier naturel $N$ tel que $u_N$ est un entier ;',
      },
      { texte: 'la suite $\\left(u_n\\right)$ est croissante ;', statut: true },
      { texte: 'la suite $\\left(u_n\\right)$ est convergente ;' },
      { texte: "La suite $\\left(u_n\\right)$ n'a pas de limite." },
    ],
    correction:
      `On a au rang $n$${sp()}: $n < u_n < n+1$ et au rang $n+1$${sp()}: $n + 1 < u_{n+1} < n + 2$, donc $u_n < n+1 < u_{n+1}$${sp()}: la suite $\\left(u_n\\right)$ est croissante. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par${sp()}: $u_n = \\mathrm{e}^{2n+1}$.<br>La suite $\\left(u_n\\right)$ est${sp()}:`,
    reponses: [
      { texte: 'arithmétique de raison $2$ ;' },
      { texte: 'géométrique de raison $\\mathrm{e}$ ;' },
      { texte: 'géométrique de raison $\\mathrm{e}^2$ ;', statut: true },
      { texte: 'convergente vers $\\mathrm{e}$.' },
    ],
    correction:
      `Si pour tout entier naturel $n$, $u_n = \\mathrm{e}^{2n+1}$, alors $u_{n+1} = \\mathrm{e}^{2(n+1)+ 1} = \\mathrm{e}^{2n + 2 + 1} = \\mathrm{e}^{2} \\times \\mathrm{e}^{2n + 1} = \\mathrm{e}^{2} \\times u_n$${sp()}: cette égalité montre que la suite $\\left(u_n\\right)$ est géométrique de raison $\\mathrm{e}^{2}$. Réponse $\\mathbf{c}$.`,
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie sur $\\N$ par${sp()}: $u_0 = 15$ et pour tout entier naturel $n$${sp()}: $u_{n+1} = 1{,}2u_n + 12$.<br>La fonction Python suivante, dont la ligne $4$ est incomplète, doit renvoyer la plus petite valeur de l’entier $n$ telle que $u_n > 10\\,000$.` +
      code(
        'def seuil() :\n    n=0\n    u=15\n    while ... ...:\n        n=n+1\n        u=1,2*u+12\n    return(n)',
      ) +
      `À la ligne $4$, on complète par${sp()}:`,
    reponses: [
      { texte: '$u\\leqslant 10\\,000$ ;', statut: true },
      { texte: '$u =10\\,000$' },
      { texte: '$u>10\\,000$;' },
      { texte: '$n\\leqslant 10\\,000$.' },
    ],
    correction: 'Réponse $\\mathbf{a}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie sur $\\N$ par${sp()}: $u_0 = 15$ et pour tout entier naturel $n$${sp()}: $u_{n+1} = 1{,}2u_n + 12$.<br>On considère la suite $\\left(v_n\\right)$ définie sur $\\N$ par${sp()}: $v_n = u_n + 60$.<br>La suite $\\left(v_n\\right)$ est${sp()}:`,
    reponses: [
      { texte: 'une suite décroissante ;' },
      { texte: 'une suite géométrique de raison $1{,}2$ ;', statut: true },
      { texte: 'une suite arithmétique de raison $60$ ;' },
      { texte: 'une suite ni géométrique ni arithmétique.' },
    ],
    correction:
      `On a quel que soit $n \\in \\N$, $v_{n+1} = u_{n+1} + 60 = 1{,}2u_n + 12 + 60 = 1{,}2u_n + 72 = 1{,}2\\left(u_n + 60\\right) = 1{,}2v_n$${sp()}: cette égalité montre que la suite $\\left(v_n\\right)$ est géométrique de raison $1{,}2$. Réponse $\\mathbf{b}$.`,
  },
  {
    enonce:
      `On considère la suite numérique $\\left(u_n\\right)$ définie pour tout $n$ entier naturel par $u_n = \\dfrac{1 + 2^n}{3 + 5^n}$.<br>Cette suite${sp()}:`,
    reponses: [
      { texte: 'diverge vers $+\\infty$' },
      { texte: 'converge vers $\\dfrac25$' },
      { texte: 'converge vers $0$', statut: true },
      { texte: 'converge vers $\\dfrac13$.' },
    ],
    correction:
      `Pour tout entier naturel $n$, on a${sp()}: $u_n = \\dfrac{1 + 2^n}{3 + 5^n } = \\dfrac{2^n \\times \\left(\\frac{1}{2^n}+1\\right)}{5^n\\times \\left(\\frac{3}{5^n} + 1\\right)  } = \\left(\\dfrac{2}{5}\\right)^n \\dfrac{1 + \\left(\\frac{1}{2}\\right)^n}{1 + 3\\left(\\frac{1}{5}\\right)^n}$.<br>Par limite de somme et de quotient, on a alors $\\displaystyle\\lim_{n \\to +\\infty} \\dfrac{1 + \\left(\\frac{1}{2}\\right)^n}{1 + \\left(\\frac{1}{5}\\right)^n} = 1$, puis, par limite du produit${sp()}: $\\displaystyle\\lim_{n \\to +\\infty} u_n=0$. Réponse $\\mathbf{c}$.`,
  },
  {
    enonce:
      `Une suite $\\left(u_n\\right)$ est minorée par $3$ et converge vers un réel $\\ell$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: '$\\ell = 3$' },
      { texte: '$\\ell \\geqslant 3$', statut: true },
      { texte: 'La suite $\\left(u_n\\right)$ est décroissante.' },
      {
        texte:
          'La suite $\\left(u_n\\right)$ est constante à partir d’un certain rang.',
      },
    ],
    correction:
      'La limite est supérieure ou égale à $3$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      `La suite $\\left(w_n\\right)$ est définie par $w_1 = 2$ et pour tout entier naturel $n$ strictement positif, $w_{n+1} = \\dfrac1n w_n$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'La suite $\\left(w_n\\right)$ est géométrique' },
      { texte: 'La suite $\\left(w_n\\right)$ n’admet pas de limite' },
      { texte: '$w_5 = \\dfrac{1}{15}$' },
      {
        texte: 'La suite $\\left(w_n\\right)$ converge vers $0$.',
        statut: true,
      },
    ],
    correction:
      'On peut démontrer rapidement par récurrence que $w_n = \\dfrac{2}{(n-1)!}$, avec $n! = 1 \\times 2 \\times 3 \\times \\ldots \\times n$.<br>Or $\\displaystyle\\lim_{n \\to + \\infty}\\dfrac{2}{(n- 1)!} = 0$. Réponse $\\mathbf{d}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie par $u_0 = 3$ et, pour tout entier naturel $n$, $u_{n+1} = \\dfrac12u_n + \\dfrac12n + 1$.<br>La valeur de $u_2$ est égale à${sp()}:`,
    reponses: [
      { texte: '$\\dfrac{11}{4}$', statut: true },
      { texte: '$\\dfrac{13}{2}$' },
      { texte: '$3{,}5$' },
      { texte: '$2{,}7$' },
    ],
    correction:
      '$u_1=u_{0+1} = \\dfrac{1}{2}u_0 + \\dfrac{1}{2}\\times 0 +1 = \\dfrac{5}{2}$.<br>$u_2=u_{1+1} = \\dfrac{1}{2}u_1 + \\dfrac{1}{2}\\times 1 +1 = \\dfrac{1}{2}\\times \\dfrac{5}{2} + \\dfrac{1}{2} +1 = \\dfrac{11}{4}$. Réponse $\\mathbf{a}$.',
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie par $u_0 = 3$ et, pour tout entier naturel $n$, $u_{n+1} = \\dfrac12u_n + \\dfrac12n + 1$.<br>La suite $\\left(v_n\\right)$ définie, pour tout entier naturel $n$, par $v_n = u_n - n$ est${sp()}:`,
    reponses: [
      { texte: 'arithmétique de raison $\\dfrac12$' },
      { texte: 'géométrique de raison $\\dfrac12$', statut: true },
      { texte: 'constante.' },
      { texte: 'ni arithmétique, ni géométrique.' },
    ],
    correction:
      '$v_{n+1}=u_{n+1}-(n+1)=\\dfrac{1}{2}u_n+\\dfrac{1}{2}n+1-n-1 = \\dfrac{1}{2}u_n -\\dfrac{1}{2}n = \\dfrac{1}{2}\\left (u_n-n\\right )=\\dfrac{1}{2}v_n$.<br>Donc la suite $(v_n)$ est géométrique de raison $\\dfrac{1}{2}$. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      'On considère la suite $\\left(u_n\\right)$ définie par $u_0 = 3$ et, pour tout entier naturel $n$, $u_{n+1} = \\dfrac12u_n + \\dfrac12n + 1$.<br>On considère la fonction ci-dessous, écrite de manière incomplète en langage Python. $n$ désigne un entier naturel non nul. On rappelle qu’en langage Python «\u00a0i in range (n)\u00a0» signifie que i varie de $0$ à $n-1$.' +
      code(
        'def terme (n)\n    U=3\n    for i in range(n):\n        ...\n    return U',
      ) +
      `Pour que terme (n) renvoie la valeur de $u_n$, on peut compléter la ligne $4$ par${sp()}:`,
    reponses: [
      { texte: 'U = U/2 + (i$+$1)/2+1' },
      { texte: 'U = U/2 + n/2 + 1' },
      { texte: 'U = U/2 + (i$-$1)/2+1' },
      { texte: 'U = U/2 + i/2 + 1', statut: true },
    ],
    correction:
      `Pour $i=0$, il faut calculer $u_1$ ; la seule formule valable est${sp()}: U = U/2 + i/2 + 1. Réponse $\\mathbf{d}$.`,
  },
  {
    enonce:
      `On considère deux suites $\\left(u_{n}\\right)$ et $\\left(v_{n}\\right)$ à termes strictement positifs telles que $\\displaystyle\\lim _{n \\rightarrow+\\infty} u_{n}=+\\infty$ et $\\left(v_{n}\\right)$ converge vers $0$.<br>On peut affirmer que${sp()}:`,
    reponses: [
      { texte: 'la suite $\\left(\\frac{1}{v_{n}}\\right)$ converge.' },
      {
        texte: 'la suite $\\left(\\frac{v_{n}}{u_{n}}\\right)$ converge.',
        statut: true,
      },
      { texte: 'la suite $\\left(u_{n}\\right)$ est croissante.' },
      {
        texte:
          '$\\displaystyle\\lim _{n \\rightarrow+\\infty}\\left(-u_{n}\\right)^{n}=-\\infty$',
      },
    ],
    correction: 'Limite du quotient de deux suites. Réponse $\\mathbf{b}$.',
  },
  {
    enonce:
      'On considère la suite $\\left(u_n\\right)$ définie pour tout entier naturel $n$ par $u_n = n^2 - 17n + 20$.',
    reponses: [
      { texte: 'La suite $\\left(u_n\\right)$ est minorée.', statut: true },
      { texte: 'La suite $\\left(u_n\\right)$ est décroissante.' },
      {
        texte:
          'L’un des termes de la suite $\\left(u_n\\right)$ est égal à $2\\,021$.',
      },
    ],
    correction:
      `$n^2 - 17n + 20 = \\left(n - \\frac{17}{2} \\right)^2 - \\frac{209}{4}$.<br>On a donc quel que soit $n$, $u_n \\geqslant - \\frac{209}{4}$${sp()}: la suite est donc minorée. Réponse A.`,
  },
  {
    enonce:
      `On considère la suite $\\left(u_n\\right)$ définie par $u_0 = 2$ et, pour tout entier naturel $n$, $u_{n+1} = 0{,}75u_n +5$.<br>On considère la fonction «\u00a0seuil\u00a0» suivante écrite en Python${sp()}:` +
      code(
        'def seuil {} :\n    u = 2\n    n = 0\n    while u < 45 :\n        u = 0,75*u + 5\n        n = n+1\n    return n',
      ) +
      `Cette fonction renvoie${sp()}:`,
    reponses: [
      {
        texte: 'la plus petite valeur de $n$ telle que $u_n \\geqslant 45$ ;',
        statut: true,
      },
      { texte: 'la plus petite valeur de $n$ telle que $u_n < 45$ ;' },
      { texte: 'la plus grande valeur de $n$ telle que $u_n \\geqslant 45$.' },
    ],
    correction: 'Réponse A.',
  },
]

/**
 * Série statique de QCM de Bac sur les suites.
 *
 * @author Stéphane Guyon
 */
export default class QcmSuitesStatique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const nbQuestions = Math.min(this.nbQuestions, qcmSuites.length)
    const questions = shuffle(qcmSuites).slice(0, nbQuestions)

    for (const [index, qcm] of questions.entries()) {
      const qcmData = buildQcmForExercise(this, index, {
        question: qcm.enonce,
        correction: qcm.correction,
        propositions: qcm.reponses.map((reponse) => ({
          texte: reponse.texte,
          statut: reponse.statut ?? false,
        })),
        options: {
          vertical: true,
          ordered: true,
        },
      })

      this.listeQuestions[index] = qcmData.question
      this.listeCorrections[index] = qcmData.correction
    }
  }
}
