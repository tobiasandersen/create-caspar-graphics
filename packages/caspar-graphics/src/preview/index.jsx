import ReactDOM from 'react-dom'
import React, { useState } from 'react'
import { States } from '../../'
import { Screen } from './screen'
import { usePersistentValue } from './use-persistent-value'
import { usePreviewState } from './use-preview-state'
import { usePreviewData } from './use-preview-data'
import { FaRegSadCry } from 'react-icons/fa'
import { Leva } from './leva'
import styles from './index.module.css'

export default function PreviewApp({
  templateNames,
  templatePreviews,
  projectName,
  projectSize
}) {
  const [templates, setTemplates] = React.useState({})
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

  const sortedTemplates = [...templateNames].sort((a, b) => {
    if (a < b) {
      return -1
    } else if (b < a) {
      return 1
    } else {
      return 0
    }
  })

  const schema = {}

  for (let i = 0; i < sortedTemplates.length; i++) {
    const key = sortedTemplates[i]
    const previewData = templatePreviews[i]
    const template = templates[key]
    const state = templateSettings[key] || {}

    if (!template) {
      continue
    }

    schema[key] = {
      layer: state.layer ?? i + 1,
      preset: state.preset || '',
      collapsed: state.collapsed ?? false,
      previewData,
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

  const isReady = sortedTemplates.every(template => schema[template] != null)

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
      <Screen settings={settings} size={projectSize}>
        {sortedTemplates.map((templateName, index) => (
          <TemplatePreview
            key={templateName}
            name={templateName}
            onReady={onTemplateReady}
            layer={schema[templateName]?.layer}
            initialPreset={templateSettings[templateName]?.preset}
            preview={templatePreviews[index]}
          />
        ))}
      </Screen>
    </div>
  )
}

const TemplatePreview = React.memo(
  ({ name, onReady, layer, initialPreset, preview }) => {
    console.log(2, preview)
    const [iframeRef, setIframeRef] = useState()
    const templateWindow = iframeRef?.contentWindow
    const [state, setState] = usePreviewState({
      templateWindow,
      autoPreview: false
    })
    const previewData = usePreviewData({
      presets: preview.previewData,
      images: preview.previewImages,
      initialPreset,
      templateWindow,
      state,
    })

    React.useEffect(() => {
      console.log(1, previewData)
      if (previewData.previewData !== undefined) {
        onReady(name, previewData, setState)
      }
    }, [name, previewData, onReady])

    const hidden = layer == null || layer === 0

    return (
      <iframe
        ref={setIframeRef}
        src={`/${name}.html`}
        onLoad={() => {
          setState(States.loaded)
        }}
        style={{
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? 'none' : 'initial',
          zIndex: layer
        }}
      />
    )
  }
)
