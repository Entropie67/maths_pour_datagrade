/**
 * récupère les paramètres a et b d'une chaine contenant ax+b. Ex: '-3' retournera [0,-3] et '-2x' retournera [-2,0]
 * @param texte
 * @returns {(number|number)[]|(number|number)[]}
 */
export function extraireCoeffAffine(texte: string) {
  const [, , c, d] = extraireCoeffDeg3(texte)
  return [c, d]
}

/**
 * récupère les 4 coefficients de ax³+bx²+cx+d
 * @param texte La chaine de caractère contenant l'expression ex : '-5x^3+\frac{3}{2}x^2-6x' retournera [-5,{signe:1,num:3,den:2},-6,0]
 * @returns {(number|{num: number, den: number, signe: number}|{num: number, den: number, signe: number}|{num: number, den: number, signe: number}|number)[]}
 */
export function extraireCoeffDeg3(texte: string) {
  texte = texte.replaceAll(/\s/g, '').replaceAll('−', '-').replaceAll('𝑥', 'x')
  let a, b, c, d
  // Normalement il y a du degré 3, on commence par chercher le coefficient
  const deg3 = texte.match(/-?(\\frac)?[{}\-0-9]*x\^3/)
  let fonctionDegre2
  if (deg3 != null) {
    let monome3 = deg3[0]
    fonctionDegre2 = texte.slice(monome3.length)
    let signeA = 1
    if (monome3[0] === '-') {
      // ça commence par un - donc a est négatif
      signeA = -1
      monome3 = monome3.slice(1)
    }
    if (monome3[0] === 'x') {
      // coeff 1 ou -1 non écrit
      a = signeA
    } else {
      if (monome3.includes('frac')) {
        const [num, den] = monome3.match(/[0-9]+/g) as string[]
        a = { signe: signeA, num: Number(num), den: Number(den) }
      } else {
        const monom3Number = monome3.match(/[0-9]/g)
        if (monom3Number != null) {
          const monom3 = monome3[0]
          if (monom3) a = signeA * Number(monom3)
        }
      }
    }
  } else {
    a = 0
    fonctionDegre2 = texte
  }
  // on passe à la suite de la fonction y a-t-il un coefficient de degré 2 ?
  const deg2 = fonctionDegre2.match(/-?\+?(\\frac)?[{}\-0-9]*x\^2/)
  let fonctionAffine
  if (deg2 != null) {
    let monome2 = deg2[0]
    fonctionAffine = fonctionDegre2.slice(monome2.length)
    let signeB = 1
    if (monome2[0] === '-') {
      // ça commence par - donc b est négatif
      signeB = -1
      monome2 = monome2.slice(1)
    }
    if (monome2[0] === 'x') {
      // coeff 1 ou -1 non écrit
      b = signeB
    } else {
      if (monome2[0] === '+') {
        monome2 = monome2.slice(1)
      }
      if (monome2.includes('frac')) {
        const [num, den] = monome2.match(/[0-9]+/g) as string[]
        b = { signe: signeB, num: Number(num), den: Number(den) }
      } else {
        const monom2 = monome2.match(/[0-9]+/g)
        if (monome2 === 'x^2') b = signeB
        else {
          if (monom2 != null) b = signeB * Number(monom2[0])
        }
      }
    }
  } else {
    b = 0
    fonctionAffine = fonctionDegre2
  }
  // maintenant on passe au coefficient de degré 1
  const deg1 = fonctionAffine.match(/-?\+?(\\frac)?[{}0-9]*x/)
  let fonctionConstante
  if (deg1 != null) {
    let monome1 = deg1[0]
    fonctionConstante = fonctionAffine.slice(monome1.length)
    let signeC = 1
    if (monome1[0] === '-') {
      // ça commence par - donc c est négatif
      signeC = -1
      monome1 = monome1.slice(1)
    }
    if (monome1[0] === 'x') {
      // coeff 1 ou -1 non écrit
      c = signeC
    } else {
      if (monome1[0] === '+') {
        monome1 = monome1.slice(1)
      }
      if (monome1.includes('frac')) {
        const [num, den] = monome1.match(/[0-9]+/g) as string[]
        c = { signe: signeC, num: Number(num), den: Number(den) }
      } else {
        const monom1 = monome1.match(/[0-9]+/g)
        if (monome1 === 'x') {
          c = 1
        } else if (monom1 != null) {
          c = signeC * Number(monom1[0])
        }
      }
    }
  } else {
    c = 0
    fonctionConstante = fonctionAffine
  }
  if (fonctionConstante.length === 0) {
    d = 0
  } else {
    // à priori d n'est pas une fraction... à vérifier !
    d = Number(fonctionConstante)
  }
  return [a, b, c, d]
}
