import JSZip from 'jszip'

async function addRemoteFiles(zip: JSZip, urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Impossible de télécharger ${url} (${response.status}).`)
      }
      const fileName = url.split('/').pop() ?? ''
      zip.file(fileName, await response.arrayBuffer())
    }),
  )
}

function saveAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

import {
  buildImagesUrlsList,
  doesLatexNeedsPics,
  getExosContentList,
  getLogoCanUrls,
  getPicsNames,
} from './Latex'
import { type latexFileType } from './LatexTypes'
import type { IExercice, IExerciceStatique } from './types'

export async function downloadZip(filesUrls: string[], zipFileName: string) {
  const zip = new JSZip()
  await addRemoteFiles(zip, filesUrls)
  saveAs(await zip.generateAsync({ type: 'blob' }), zipFileName)
}

/**
 * Construit l'archive ZIP contenant le code LaTeX et tous les fichiers images nécessaires pour la compilation du code LaTeX
 * @param {string} zipFileName nom donné pour l'archive
 * @param {Latex} latex objet Latex contenant les données des exercices
 * @param {LatexFileInfos} filesInfo paramètres du fichier LaTeX à générer
 * @author sylvain
 */
export async function downloadTexWithImagesZip(
  zipFileName: string,
  latexFile: latexFileType,
  exercices: (IExercice | IExerciceStatique)[],
) {
  const zip = new JSZip()
  const logoUrls = getLogoCanUrls(latexFile.latexWithPreamble)
  const withImages =
    doesLatexNeedsPics(latexFile.contents) || logoUrls.length > 0
  const exosContentList = getExosContentList(exercices)
  const picsNames = getPicsNames(exosContentList)
  zip.file('main.tex', latexFile.latexWithPreamble)
  if (withImages) {
    await addRemoteFiles(zip, [
      ...buildImagesUrlsList(exosContentList, picsNames),
      ...logoUrls,
    ])
  }
  saveAs(await zip.generateAsync({ type: 'blob' }), `${zipFileName}.zip`)
}

export async function downloadFile(
  content: string,
  fileName: string,
): Promise<'success' | 'error'> {
  try {
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
    element.setAttribute('download', fileName)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  } catch (error) {
    console.error('Impossible de télécharger le fichier', error)
    return 'error'
  }
  return 'success'
}
