import ReactDOM from 'react-dom'
import React, { useRef } from 'react'
import { States } from '../../'
import { Screen } from './screen'
import { usePersistentValue } from './use-persistent-value'
import { usePreviewState } from './use-preview-state'
import { usePreviewData } from './use-preview-data'
import { FaRegSadCry } from 'react-icons/fa'
import { Leva } from './leva'
import styles from './index.module.css'

const App = () => {
  const [templates, setTemplates] = React.useState({})
  const [templateSettings, setTemplateSettings] = usePersistentValue(
    `cg.${window.projectName}.templates`,
    {}
  )
  const [settings, setSettings] = usePersistentValue('settings', {
    autoPreview: false,
    background: '#ffffff',
    image: null,
    imageOpacity: 0.5
  })

  if (window.templates.length === 0) {
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

  const templateNames = [...window.templates].sort((a, b) => {
    if (a < b) {
      return -1
    } else if (b < a) {
      return 1
    } else {
      return 0
    }
  })

  const schema = {}

  for (let i = 0; i < templateNames.length; i++) {
    const key = templateNames[i]
    const template = templates[key]
    const state = templateSettings[key] || {}

    if (!template) {
      continue
    }

    schema[key] = {
      layer: state.layer ?? i + 1,
      preset: state.preset || '',
      collapsed: state.collapsed ?? false,
      previewData: template.data.previewData || {},
      previewImages: template.data.images,
      data: template.data.data,
      play: () => {
        template.setState(States.playing)
      },
      stop: () => {
        template.setState(States.stopped)
      },
      update: data => {
        template.data.update(data)
      },
      set: (dataKey, value) => {
        setTemplateSettings(current => ({
          ...current,
          [key]: { ...current[key], [dataKey]: value }
        }))
      }
    }
  }

  const onTemplateReady = React.useCallback((template, data, setState) => {
    setTemplates(value => ({ ...value, [template]: { data, setState } }))
  }, [])

  const isReady = templateNames.every(template => schema[template] != null)

  return (
    <div className={styles.container}>
      <Leva
        schema={isReady ? schema : null}
        settings={settings}
        onSettingChange={(key, value) => {
          setSettings(settings => ({ ...settings, [key]: value }))
        }}
        playAll={() => {
          for (const template of Object.values(schema)) {
            if (template.layer > 0) {
              template.play()
            }
          }
        }}
        stopAll={() => {
          for (const template of Object.values(schema)) {
            if (template.layer > 0) {
              template.stop()
            }
          }
        }}
        updateAll={data => {
          console.log('updateAll', data)
        }}
      />
      <Screen settings={settings}>
        {templateNames.map(template => (
          <Preview
            key={template}
            template={template}
            onReady={onTemplateReady}
            layer={schema[template]?.layer}
            initialPreset={templateSettings[template]?.preset}
          />
        ))}
      </Screen>
    </div>
  )
}

export const Preview = React.memo(({ template, onReady, layer, initialPreset }) => {
  const iframeRef = useRef()
  const templateWindow = iframeRef.current?.contentWindow
  const [state, setState] = usePreviewState({
    templateWindow,
    autoPreview: false
  })
  const previewData = usePreviewData({
    templateWindow,
    state,
    initialPreset
  })

  React.useEffect(() => {
    if (previewData.previewData !== undefined) {
      onReady(template, previewData, setState)
    }
  }, [template, previewData, onReady])

  const hidden = layer == null || layer === 0

  return (
    <iframe
      ref={iframeRef}
      src={`/${template}.html`}
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'initial',
        zIndex: layer
      }}
      onLoad={() => {
        // HACK: wait for update window.update to be set.
        setTimeout(() => {
          setState(States.loaded)
        }, 0)
      }}
    />
  )
})

ReactDOM.render(<App />, document.getElementById('root'))
