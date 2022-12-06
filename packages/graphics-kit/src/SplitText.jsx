import React, { memo, useRef, useState, useLayoutEffect } from 'react'

export const SplitText = ({ value, ...props }) => {
  return value ? <SplitPrimitive key={value} value={value} {...props} /> : null
}

const SplitPrimitive = memo(
  ({ value, lineClass = 'line', charClass = 'char' }) => {
    const ref = useRef()

    useLayoutEffect(() => {
      const lines = [[]]
      let top

      ref.current.childNodes?.forEach((el, index) => {
        if (el.offsetTop > top) {
          lines.push([el.innerText])
        } else {
          lines.at(-1).push(el.innerText)
        }

        top = el.offsetTop
      })

      ref.current.innerHTML = ''

      for (const line of lines) {
        const lineEl = document.createElement('div')
        lineEl.className = lineClass

        for (const char of line) {
          const charEl = document.createElement('div')
          charEl.className = charClass
          charEl.style.display = 'inline-block'
          charEl.style.whiteSpace = 'pre'
          charEl.textContent = char
          lineEl.appendChild(charEl)
        }

        ref.current.appendChild(lineEl)
      }
    }, [])

    return (
      <div ref={ref}>
        {value.split('').map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
    )
  }
)
