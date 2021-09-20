import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import isPlainObject from 'lodash/isPlainObject'
import queryString from 'query-string'
import { States } from '..'

export function usePreviewData({ templateWindow, state, ...props }) {
  const [previewData, setPreviewData] = useState()
  const [previewImages, setPreviewImages] = useState(null)
  const [initialPreset] = React.useState(props.initialPreset)

  // HACK: We use this to force updates when a template is reloaded.
  // There're definitely better ways to do this, but I feel lazy...
  const [reloads, setReloads] = useState(0)

  // Get preview data for the current template.
  useEffect(() => {
    if (state !== States.loaded) {
      return
    }

    setReloads(curr => curr + 1)

    setPreviewData(templateWindow.previewData || null)

    if (templateWindow?.previewImages) {
      setPreviewImages(templateWindow.previewImages)
    }
  }, [state])

  const values = Object.values(previewData || {})
  const hasManyPreviewSets =
    values.length > 1 && values.every(value => isPlainObject(value))

  let data = null

  if (hasManyPreviewSets) {
    // Get the selected preview set.
    const selected = initialPreset ? previewData[initialPreset] : values[0]
    data = isPlainObject(selected) ? selected : null
  } else if (isPlainObject(previewData)) {
    // There's only a single object for the preview data.
    data = previewData
  }

  // Update template with new data.
  useEffect(() => {
    if (templateWindow?.update) {
      templateWindow.update(data || {})
    }
  }, [templateWindow, data, reloads])

  return {
    // selectedDataKey,
    // selectedImageKey: params.imageKey,
    data: data || {},
    previewData,
    images: previewImages,
    // image: previewImages?.[params.imageKey],
    dataKeys: hasManyPreviewSets ? Object.keys(previewData) : null,
    clearChanges: () => {
      setUserData(undefined)
    },
    update: data => {
      setPreviewData(data)
    }
    // onChange: ({ type, value }) => {
    //   if (type === 'data') {
    //     if (typeof value === 'string') {
    //       const query = { ...params, dataKey: value || undefined }
    //       history.push(`${location.pathname}?${queryString.stringify(query)}`)
    //     } else if (isPlainObject(value)) {
    //       history.replace({ ...location, state: { data: value } })
    //     }
    //   } else if (type === 'image') {
    //     const query = { ...params, imageKey: value || undefined }
    //     history.push(`${location.pathname}?${queryString.stringify(query)}`)
    //   }
    // }
  }
}
