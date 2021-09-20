import React from 'react'
import {
  Leva as LevaPrimitive,
  LevaInputs,
  buttonGroup,
  useControls,
  folder,
  levaStore
} from 'leva'
import isEqual from 'lodash/isEqual'
import styles from './leva.module.css'

export const Leva = React.memo(function Leva({ schema, ...props }) {
  return (
    <div className={styles.leva}>
      {schema != null && <LevaImpl templates={schema} {...props} />}
    </div>
  )
})

const LevaImpl = ({ templates, settings, onSettingChange, playAll, stopAll, updateAll }) => {
  const [changes, setChanges] = React.useState()
  const [values, set] = useControls(() => {
    const schema = {
      Global: buttonGroup({
        opts: {
          Play: () => {
            playAll()
          },
          Stop: () => {
            stopAll()
          },
          Update: () => {
            const payload = {}
            const levaData = levaStore.getData()
            updateAll(payload)

            // for (const levaKey of Object.keys(levaData)) {
            //   const pattern = `${key.toUpperCase()}.${key}_data_`

            //   if (levaKey.match(pattern)) {
            //     const dataKey = levaKey.replace(pattern, '')
            //     payload[dataKey] = levaData[levaKey].value
            //   }
            // }

            // template.update(payload)
          }
        }
      })
    }

    // const hasChanges = changes && !isEqual(data, changes)
    const images = {}

    for (const [key, template] of Object.entries(templates)) {
      for (const [imageKey, image] of Object.entries(template.previewImages || {})) {
        images[`${imageKey} (${key})`] = image
      }

      const { data, previewData } = template
      const items = {}
      let allFields = {}

      for (const preset of Object.values(previewData)) {
        allFields = { ...allFields, ...preset }
      }

      for (const fieldKey of Object.keys(allFields)) {
        data[fieldKey] = data[fieldKey] ?? ''
      }

      for (const [dataKey, value] of Object.entries(data)) {
        items[key + '_data_' + dataKey] = {
          label: dataKey,
          value,
          type: typeof value === 'boolean' ? LevaInputs.BOOLEAN : LevaInputs.STRING,
          onChange: (newValue) => {
            if (newValue === value) {
              return
            }

            setChanges((changes = {}) => ({
              ...changes,
              [key]: { ...changes[key], [dataKey]: value }
            }))
          }
        }
      }

      schema[key.toUpperCase()] = folder(
        {
          [key + '_cmd']: buttonGroup({
            label: 'Commands',
            opts: {
              Play: () => {
                template.play()
              },
              Stop: () => {
                template.stop()
              },
            }
          }),
          [key]: {
            label: 'Layer',
            value: template.layer,
            options: Object.fromEntries(
              Array.from(
                { length: Object.keys(templates).length * 2 },
                (key, index) => [index === 0 ? 'Hidden' : index, index]
              )
            ),
            onChange: value => {
              if (template.layer !== value) {
                template.set('layer', value)
              }
            }
          },
          [key + '_preset']: {
            label: 'Preset',
            value: template.preset,
            options: Object.keys(template.previewData || {}),
            onChange: (value) => {
              const previewSet = template.previewData?.[value]

              if (!previewSet) {
                return
              }

              template.set('preset', value)

              const update = {}

              for (const dataKey of Object.keys(data)) {
                const dataValue = previewSet[dataKey]
                update[key + '_data_' + dataKey] = dataValue ? String(dataValue) : ''
              }

              set(update)
            }
          },
          ...items,
          [key + '_preset_buttons']: buttonGroup({
            label: '',
            opts: {
              Update: () => {
                const payload = {}
                const levaData = levaStore.getData()

                for (const levaKey of Object.keys(levaData)) {
                  const pattern = `${key.toUpperCase()}.${key}_data_`

                  if (levaKey.match(pattern)) {
                    const dataKey = levaKey.replace(pattern, '')
                    payload[dataKey] = levaData[levaKey].value
                  }
                }

                template.update(payload)
              },
            }
          }),
        },
        {
          collapsed: template.layer === 0
        }
      )
    }

    schema.Settings = folder(
      {
        autoPreview: { value: settings.autoPreview, label: 'Auto Preview' },
        background: {
          value: settings.background,
          label: 'Background',
          onChange: value => {
            if (value !== settings.background) {
              onSettingChange('background', value)
            }
          }
        },
        images: {
          value: Object.values(images).find(image => image === settings.image) ?? '',
          label: 'Image',
          options: { None: '', ...images },
          onChange: value => {
            if (value !== settings.image) {
              onSettingChange('image', value)
            }
          }
        },
        imageOpacity: {
          value: settings.imageOpacity,
          label: 'Image Opacity',
          min: 0,
          max: 1,
          onChange: value => {
            if (value !== settings.imageOpacity) {
              onSettingChange('imageOpacity', value)
            }
          }
        }
      },
      { collapsed: true }
    )

    return schema
  })

  return <LevaPrimitive fill={true} titleBar={false} flat={true} />
}
