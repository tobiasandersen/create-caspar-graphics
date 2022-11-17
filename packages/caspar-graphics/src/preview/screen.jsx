import React, { useRef } from 'react'
import { useRect } from '@reach/rect'
import styles from './screen.module.css'

export const Screen = ({ size, children, settings, image }) => {
  const containerRef = useRef()
  const containerRect = useRect(containerRef)

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={styles.screen}
        style={{
          background: settings.background,
          width: size?.width || 0,
          height: size?.height || 0,
          transform: `scale(${calcScale(containerRect, size)})
          translate(-50%, -50%)`
        }}
      >
        {children}
        {settings.image ? (
          <img
            src={settings.image.url}
            className={styles.image}
            style={{ opacity: settings.image.opacity ?? 0.3 }}
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
