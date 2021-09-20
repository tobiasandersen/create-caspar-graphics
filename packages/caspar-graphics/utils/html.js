const path = require('path')
const paths = require('../config/paths')
const packageJson = require(paths.appPackageJson)
const appName = packageJson.appName || paths.appPath.match(/([^\/]*)\/*$/)[1]
const { mode = '1080p' } = packageJson['caspar-graphics'] || {}
const { html } = require('common-tags')

const size = mode.startsWith('720p')
  ? { width: 1280, height: 720 }
  : { width: 1920, height: 1080 }

// http://meyerweb.com/eric/tools/css/reset/
const cssReset = `
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  body {
    line-height: 1;
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  *:focus {
    outline: none;
  }

  html,
  body,
  #root {
    margin: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
`

const createPreviewHtml = templates => {
  const previewPath = path.join(paths.ownLib, 'preview')

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          ${cssReset}
        </style>
        <title>${appName}</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          window.templates = ${JSON.stringify(templates)}
          window.size = ${JSON.stringify(size)}
          window.projectName = '${appName}'
        </script>
        <script type="module" src="${previewPath}"></script>
      </body>
    </html>
  `
}

const createTemplateHtml = (name, production) => {
  const templatePath = path.join(paths.appTemplates, name, 'index.jsx')
  const createPath = path.join(
    paths.ownLib,
    'template',
    production ? 'create.jsx' : 'create.dev.js'
  )

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          ${cssReset}
        </style>
        <title>${name}</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="${templatePath}"></script>
        <script type="module" src="${createPath}"></script>
        <script type="module">
          import { createTemplate } from '${createPath}'
          import * as template from '${templatePath}'
          createTemplate(template)
        </script>
      </body>
    </html>
  `
}

module.exports = {
  createPreviewHtml,
  createTemplateHtml
}
