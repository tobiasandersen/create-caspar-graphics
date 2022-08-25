import React, { useState, useEffect } from 'react'
import isPlainObject from 'lodash/isPlainObject'

export function usePreviewData({
  presets,
  images,
  templateWindow,
  initialPreset
}) {
  const [previewData, setPreviewData] = useState(null)
  const values = Object.values(presets || {})
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
  }, [templateWindow, data])

  return {
    // selectedDataKey,
    // selectedImageKey: params.imageKey,
    data: data || {},
    previewData,
    images,
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
