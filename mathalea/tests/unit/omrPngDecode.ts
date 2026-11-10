import { inflateSync } from 'node:zlib'
import type { GrayImage } from '../../src/lib/omr/omrTypes'

/**
 * Décodeur PNG minimal, **réservé aux tests** : 8 bits par canal, gris, RGB ou
 * RGBA, non entrelacé — ce que produit `typst compile --format png`.
 *
 * Il existe parce que les tests tournent sous Node et jsdom, où il n'y a ni
 * canevas ni `ImageData` : sans lui, aucun test ne pourrait partir d'un vrai
 * rendu Typst. En production, la rastérisation passera par pdf.js et un
 * canevas, et ce fichier ne sera pas embarqué.
 */
export function decodePng(buffer: Buffer): GrayImage {
  if (buffer.readUInt32BE(0) !== 0x89504e47) {
    throw new Error('signature PNG invalide')
  }
  let position = 8
  let entete: {
    width: number
    height: number
    depth: number
    colorType: number
    interlace: number
  } | null = null
  const morceaux: Buffer[] = []
  while (position < buffer.length) {
    const longueur = buffer.readUInt32BE(position)
    const type = buffer.toString('ascii', position + 4, position + 8)
    const donnees = buffer.subarray(position + 8, position + 8 + longueur)
    if (type === 'IHDR') {
      entete = {
        width: donnees.readUInt32BE(0),
        height: donnees.readUInt32BE(4),
        depth: donnees[8],
        colorType: donnees[9],
        interlace: donnees[12],
      }
    } else if (type === 'IDAT') morceaux.push(donnees)
    else if (type === 'IEND') break
    position += 12 + longueur
  }
  if (entete == null) throw new Error('IHDR manquant')
  if (entete.depth !== 8 || entete.interlace !== 0) {
    throw new Error(
      `PNG non géré : profondeur ${entete.depth}, entrelacement ${entete.interlace}`,
    )
  }
  const canaux = { 0: 1, 2: 3, 4: 2, 6: 4 }[entete.colorType]
  if (canaux == null) {
    throw new Error(`type de couleur ${entete.colorType} non géré`)
  }

  const { width, height } = entete
  const brut = inflateSync(Buffer.concat(morceaux))
  const pas = width * canaux
  const pixels = Buffer.alloc(pas * height)
  let source = 0
  for (let y = 0; y < height; y++) {
    const filtre = brut[source++]
    const ligne = brut.subarray(source, source + pas)
    source += pas
    const courante = pixels.subarray(y * pas, (y + 1) * pas)
    const precedente = y > 0 ? pixels.subarray((y - 1) * pas, y * pas) : null
    for (let x = 0; x < pas; x++) {
      const a = x >= canaux ? courante[x - canaux] : 0
      const b = precedente != null ? precedente[x] : 0
      const c = x >= canaux && precedente != null ? precedente[x - canaux] : 0
      let valeur = ligne[x]
      switch (filtre) {
        case 0:
          break
        case 1:
          valeur += a
          break
        case 2:
          valeur += b
          break
        case 3:
          valeur += (a + b) >> 1
          break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          valeur += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
          break
        }
        default:
          throw new Error(`filtre PNG ${filtre} inconnu`)
      }
      courante[x] = valeur & 0xff
    }
  }

  const data = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    if (canaux <= 2) data[i] = pixels[i * canaux]
    else {
      data[i] =
        (0.299 * pixels[i * canaux] +
          0.587 * pixels[i * canaux + 1] +
          0.114 * pixels[i * canaux + 2]) |
        0
    }
  }
  return { width, height, data }
}
