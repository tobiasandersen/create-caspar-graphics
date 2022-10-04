import ReactDOM from 'react-dom'
import React, { useState, useReducer, useRef, useEffect } from 'react'
import { States } from '../../'
import { Screen } from './screen'
import { usePersistentValue } from './use-persistent-value'
import { usePreviewState } from './use-preview-state'
import { usePreviewData } from './use-preview-data'
import { FaRegSadCry } from 'react-icons/fa'
import { Leva } from './leva'
import { Sidebar } from './sidebar'
import styles from './index.module.css'
import './global.css'

function reducer(state, action) {
  console.log(action)

  if (!action.template) {
    return state
  }

  const updateTemplate = data => {
    const index = state.templates.findIndex(
      template => template.name === action.template
    )

    if (index === -1) {
      return state
    }

    const templates = [...state.templates]
    templates[index] = { ...templates[index], ...data }
    return { ...state, templates }
  }

  switch (action.type) {
    case 'show':
      return updateTemplate({ show: true })
    case 'hide':
      return updateTemplate({ show: false })
    case 'data-change':
      return updateTemplate({ data: action.data })
    case 'removed':
      return updateTemplate({ state: States.loading })
    case 'caspar-update':
      return updateTemplate({ data: action.data })
    case 'caspar-state':
      return updateTemplate({ actualState: action.state })
    default:
      return state
  }
}

function getInferredSchema(data) {
  return Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [key, Array.isArray(value) ? 'array' : typeof value]))
}

export default function PreviewApp({
  templateNames,
  templatePreviews,
  projectName,
  projectSize
}) {
  const templates = [...templateNames]
    .map((name, index) => {
      const { previewData, schema } = templatePreviews[index] || {}
      return {
        name,
        schema: schema || getInferredSchema(previewData),
        previewData,
        data: previewData,
        show: true,
        actualState: States.loading,
        layer: index,
      }
    })
    .sort((a, b) => a.localeCompare(b))
  const [state, dispatch] = useReducer(reducer, { templates })
  const [templateSettings, setTemplateSettings] = usePersistentValue(
    `cg.${projectName}.templates`,
    {}
  )
  const [settings, setSettings] = usePersistentValue('settings', {
    autoPreview: false,
    background: '#ffffff',
    image: null,
    imageOpacity: 0.5
  })

  if (templateNames.length === 0) {
    return (
      <div className={styles.empty}>
        <FaRegSadCry />
        <div>No templates found</div>
        <div>
          Make sure you use <span>.jsx</span> for your React files.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Sidebar state={state} dispatch={dispatch} />
      <Screen settings={settings} size={projectSize}>
        {state.templates.map(template => (
          <TemplatePreview
            key={template.name}
            dispatch={dispatch}
            {...template}
          />
        ))}
      </Screen>
    </div>
  )
}

const TemplatePreview = ({
  name,
  show,
  dispatch,
  layer,
  previewData,
  ...props
}) => {
  const [templateWindow, setTemplateWindow] = useState()

  // Data Updates
  useEffect(() => {
    if (!templateWindow) {
      return
    }

    // TODO: in nxt we often start by sending an empty object.
    // Could we have a mode (setting?) to do the same here?
    templateWindow.update(previewData || {})
    dispatch({ type: 'caspar-update', template: name, data: previewData })
  }, [templateWindow, previewData])

  // State Updates
  useEffect(() => {
    if (!templateWindow) {
      return
    }

    if (show) {
      templateWindow.play()
    } else {
      templateWindow.stop()
    }
  }, [templateWindow, show])

  return (
    <iframe
      src={`/${name}.html`}
      style={{ pointerEvents: show ? 'initial' : 'none' }}
      onLoad={evt => {
        const { contentWindow } = evt.target

        contentWindow.onReady = () => {
          setTemplateWindow(contentWindow)
          dispatch({
            type: 'caspar-state',
            template: name,
            state: States.loaded
          })
        }

        // Once the template has animated off, we want to reload it.
        // This is to imitate Caspar's remove method.
        contentWindow.remove = () => {
          contentWindow.location.reload()
          setTemplateWindow(null)
          dispatch({ type: 'removed', template: name })
        }
      }}
    />
  )
}
