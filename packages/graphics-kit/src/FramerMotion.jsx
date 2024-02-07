import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useCaspar } from './use-caspar'

export const FramerMotion = ({ children, hide, mode = 'wait' }) => {
  const { isPlaying, safeToRemove, isStopped } = useCaspar()

  console.log({ isPlaying, isStopped })

  return (
    <AnimatePresence
      mode={mode}
      onExitComplete={
        isStopped
          ? () => {
            console.log('exited')
            safeToRemove()
          }
          : null
      }
    >
      {!hide && isPlaying ? children : null}
    </AnimatePresence>
  )
}
