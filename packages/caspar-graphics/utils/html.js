const path = require('path')
const paths = require('../config/paths')
const packageJson = require(paths.appPackageJson)
const appName = packageJson.appName || paths.appPath.match(/([^\/]*)\/*$/)[1]
const { mode = '1080p' } = packageJson['caspar-graphics'] || {}
const { html } = require('common-tags')

const projectSize = mode.startsWith('720p')
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

const createPreviewHtml = (templateNames, templatePaths) => {
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
          import React from 'react'
          import ReactDOM from 'react-dom'
          import PreviewApp from '${previewPath}'

          const templatePreviews = await Promise.all(
            ${JSON.stringify(templatePaths)}.map(async templatePath => {
              const { previewData, previewImages } = await import(
                /* @vite-ignore */ templatePath
              )
              return { previewData, previewImages }
            })
          )

          ReactDOM.render(
            React.createElement(PreviewApp, {
              projectName: '${appName}',
              projectSize: ${JSON.stringify(projectSize)},
              templateNames: ${JSON.stringify(templateNames)},
              templatePreviews
            }),
            document.getElementById('root')
          )
        </script>
      </body>
    </html>
  `
}

const createTemplateHtml = (name) => {
  const templatePath = path.join(paths.appTemplates, name, 'index.jsx')
  const templateProviderPath = path.join(paths.ownLib, 'template', 'index.jsx')

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
        <script type="module">
          import React from 'react'
          import ReactDOM from 'react-dom'
          import { TemplateProvider } from '${templateProviderPath}'
          const { default: Template, size: templateSize } = await import(
            '${templatePath}'
          )

          const size = templateSize || ${JSON.stringify(projectSize)}
          const html = document.documentElement
          html.style.height = size?.width ?? 1920 + 'px'
          html.style.width = size?.height ?? 1080 + 'px'

          ReactDOM.render(
            React.createElement(
              TemplateProvider,
              { name: document.title },
              typeof Template.prototype?.render === 'function'
                ? React.createElement(ClassWrapper, { Template })
                : React.createElement(Template)
            ),
            document.getElementById('root')
          )
        </script>
      </body>
    </html>
  `
}

module.exports = {
  createPreviewHtml,
  createTemplateHtml
}
