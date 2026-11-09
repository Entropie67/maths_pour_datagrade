export function antecedentParDichotomie(
  xmin: number,
  xmax: number,
  f: (x: number) => number,
  y: number,
  precision = 0.01,
) {
  // On arrondit à 1E-6 parce que sinon, on passe à côté de valeur qui devraient être nulle mais le sont pas à 1E-15 !
  const ymax = Number(Math.max(f(xmax), f(xmin)).toFixed(6))
  const ymin = Number(Math.min(f(xmax), f(xmin)).toFixed(6))
  if (y > ymax || y < ymin) return false // y n'est pas entre les deux extrêmes, la méthode ne fonctionne pas.
  let xmoy, ymoy
  if (xmin > xmax) {
    xmoy = xmin
    xmin = xmax
    xmax = xmoy
  }
  xmoy = (xmax + xmin) / 2
  ymoy = f(xmoy)
  let cpt = 0
  while (Math.abs(ymoy - y) > precision && cpt < 1000) {
    if (f(xmin) < f(xmax)) {
      if (ymoy > y) {
        xmax = xmoy
      } else {
        xmin = xmoy
      }
    } else if (ymoy > y) {
      xmin = xmoy
    } else {
      xmax = xmoy
    }
    xmoy = (xmin + xmax) / 2
    ymoy = f(xmoy)
    cpt++
  }
  if (cpt > 1000) return false
  return xmoy
}
