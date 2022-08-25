import React from 'react'
import ReactDOM from 'react-dom'
import { TemplateProvider } from '.'
import { ClassWrapper } from './class-wrapper'

export function createTemplate(module) {
  const { default: Template } = module

  if (!Template) {
    return
  }

  // TODO: Move to html creation.
  const isClassComponent = typeof Template.prototype?.render === 'function'
  const size = Template.size || { width: 1920, height: 1080 }
  const width = size?.width || 1920
  const height = size?.height || 1080
  const html = document.documentElement
  const body = document.body
  const container = document.getElementById('root')

  if (width) {
    html.style.height = body.style.height = container.style.height = `${height}px`
  }

  if (height) {
    html.style.width = body.style.width = container.style.width = `${width}px`
  }

  ReactDOM.render(
    <TemplateProvider name={document.title}>
      {isClassComponent ? <ClassWrapper Template={Template} /> : <Template />}
    </TemplateProvider>,
    container
  )
}
