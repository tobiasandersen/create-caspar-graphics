import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { parse } from '../utils/parse'

export const TemplateContext = React.createContext()

let root

export const render = (Template, options = {}) => {
  let { container = document.getElementById('root') } = options

  if (!container) {
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)
  }

  document.head.insertAdjacentHTML('beforeend', `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`)

  if (!root)  {
    root = createRoot(container)
  }

  root.render(
    React.createElement(TemplateProvider, {}, React.createElement(Template))
  )
}

export const TemplateProvider = ({ children, name }) => {
  const [state, setState] = useState(States.loading)
  const [data, setData] = useState()
  const [delays, setDelays] = useState([])

  const logger = (message, ...rest) => {
    console.log(`${name || 'caspar'}${message}`)
    rest && rest.length && console.log(rest)
  }

  // Handle state and data updates
  useEffect(() => {
    window.load = () => {
      setState(States.loaded)
      logger('.load()')
    }

    window.play = () => {
      setState(States.playing)
      logger('.play()')
    }

    window.pause = () => {
      setState(States.paused)
      logger('.pause()')
    }

    window.stop = () => {
      setState(States.stopped)
      logger('.stop()')
    }

    window.update = data => {
      try {
        data = typeof data === 'string' ? parse(data) : data
      } catch (err) {
        console.error(err)
      }

      logger(`.update(${data ? JSON.stringify(data || {}, null, 2) : 'null'})`)

      if (data) {
        setData(data)
      }
    }

    // Let the preview app know that we're all set up.
    window.onReady?.(window)

    return () => {
      delete window.load
      delete window.play
      delete window.pause
      delete window.stop
      delete window.update
    }
  }, [])

  // Remove template
  useEffect(() => {
    if (state === States.removed) {
      logger('.remove()')
      window.remove?.()
    }
  }, [state])

  const safeToRemove = useCallback(() => {
    setState(States.removed)
  }, [])

  const idRef = useRef(0)

  const delayPlay = useCallback(() => {
    const id = idRef.current++
    setDelays(delays => [...delays, id])

    return () => {
      setDelays(delays => delays.filter(delay => delay !== id))
    }
  }, [])

  // Make sure the data object doesn't change unless there's actually new data.
  const memoizedData = useMemo(() => data || {}, [JSON.stringify(data || {})])

  return (
    <TemplateContext.Provider
      value={{
        data: memoizedData,
        state,
        name,
        safeToRemove,
        delayPlay
      }}
    >
      {state !== States.removed ? (
        <TemplateWrapper>{children}</TemplateWrapper>
      ) : null}
    </TemplateContext.Provider>
  )
}

const TemplateWrapper = React.memo(({ children }) => children)

export const States = {
  loading: 'LOADING',
  loaded: 'LOADED',
  playing: 'PLAYING',
  paused: 'PAUSED',
  stopped: 'STOPPED',
  removed: 'REMOVED'
}
