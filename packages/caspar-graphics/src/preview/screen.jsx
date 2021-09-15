import React, { useRef, useState } from 'react'
import { useRect } from '@reach/rect'
import styles from './screen.module.css'

export const Screen = ({ template, background, iframeRef, onLoad, image }) => {
  const containerRef = useRef()
  const containerRect = useRect(containerRef)
  const [templateSize, setTemplateSize] = useState()

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={styles.screen}
        style={{
          background,
          width: templateSize?.width || 0,
          height: templateSize?.height || 0,
          transform: `scale(${calcScale(containerRect, templateSize)})
          translate(-50%, -50%)`
        }}
      >
        <iframe
          ref={iframeRef}
          src={`/${template}.html`}
          onLoad={() => {
            const {
              offsetWidth: width,
              offsetHeight: height
            } = iframeRef.current.contentWindow.document.body
            setTemplateSize({ width, height })
            onLoad()
          }}
        />
        {image.src != null ? (
          <img
            src={image.src}
            className={styles.image}
            style={{
               opacity: image.opacity
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

function calcScale(container, template) {
  if (!container || !template) {
    return 1
  }

  const ratio = container.width / container.height
  return ratio >= 16 / 9
    ? container.height / template.height
    : container.width / template.width
}
