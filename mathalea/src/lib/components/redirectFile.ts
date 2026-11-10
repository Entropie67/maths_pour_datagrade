import { showDialogForLimitedTime } from './dialogs'

/**
 * Download a file reddirecting to custom URL
 * @param dialogId id of dialog widget where the info is displayed
 * @param url string to be added at the end of the URL
 * @param {boolean} shorten does the URL has to be shorten ?
 * @param {boolean} crypted does the URL need to be crypted ?
 * @author Mathieu Degrange
 */
export async function downloadRedirectFile(
  dialogId: string,
  url: URL,
  fileName: string,
) {
  try {
    const text = `<html><head><meta http-equiv="refresh" content="0;URL=${encodeURI(url.toString())}"></head></html>`
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
    )
    element.setAttribute('download', fileName + '.html')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    showDialogForLimitedTime(dialogId + '-success', 1000)
  } catch (error) {
    showDialogForLimitedTime(dialogId + '-error', 1000)
    throw error
  }
}
