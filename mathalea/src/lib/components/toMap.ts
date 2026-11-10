/**
 * Transforme un objet en arbre basé sur un type Map.
 * Chaque propriété devient une clé et la valeur correspondante devient :
 * - soit une valeur si la valeur de la propriété est un tableau
 * - soit une autre map dans le cas contraire
 * @param {object} obj
 * @return {Map} l'arbre correspondant à l'objet
 * @author sylvain Chambon
 */
type DeepMap<T> = T extends readonly unknown[]
  ? T
  : T extends Record<string, unknown>
    ? Map<string, DeepMap<T[keyof T]>>
    : T

export function toMap<T extends Record<string, unknown>>(
  obj: T,
): Map<string, DeepMap<T[keyof T]>> {
  const dico = new Map<string, DeepMap<T[keyof T]>>()
  for (const cle of Object.keys(obj)) {
    if (obj[cle] instanceof Object) {
      if (obj[cle] instanceof Array) {
        dico.set(cle, obj[cle] as DeepMap<T[keyof T]>)
      } else {
        dico.set(
          cle,
          toMap(obj[cle] as Record<string, unknown>) as DeepMap<T[keyof T]>,
        )
      }
    } else {
      dico.set(cle, obj[cle] as DeepMap<T[keyof T]>)
    }
  }
  return dico
}
