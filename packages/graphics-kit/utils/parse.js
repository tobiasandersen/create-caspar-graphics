import parser from 'fast-xml-parser'

export function parse(str) {
  try {
    const m = str.match(/<templateData>(.*)<\/templateData>/) || []
    return JSON.parse(m.length < 2 ? str : window.atob(m[1]))
  } catch (err) {
    console.log('parse failed' + err.message)
    return parseXML(str)
  }
}

function parseXML(xml) {
  const params = parser.parse(xml)
  const result = {}

  for (const val of params.templateData.componentData || []) {
    let componentData = {}

    for (const val2 of val.data || []) {
      componentData[val2.$.id] = val2.$.value
        .replace(/&amp;/g, '/&')
        .replace(/&lt;/g, '/<')
        .replace(/&gt;/g, '/>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "/'")
        .replace(/&#10;/g, '/\n')
        .replace(/&#13;/g, '/\r')
    }

    result[val.$.id] = componentData
  }

  return normalize(result)
}

function normalize(data) {
  return Object.entries(data || {})
    .map(([key, value]) => ({
      [key]:
        value && (value.text || value.test) === 'true'
          ? true
          : (value.text || value.test) === 'false'
          ? false
          : value.text || value.test
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})
}
