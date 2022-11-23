export function parse(str) {
  try {
    const base64String = str.match(/<templateData>(.*)<\/templateData>/)?.[1]
    return JSON.parse(decodeURIComponent(escape(atob(base64String))))
  } catch (err) {
    console.log('parse failed:' + err.message)
    return null
  }
}
