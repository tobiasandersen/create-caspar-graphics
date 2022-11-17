import React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import styles from './switch.module.css'
import { motion } from 'framer-motion'
import cn from 'classnames'

export const Switch = ({ checked, onChange, className, labels, id, ...props }) => {
  return (
    <SwitchPrimitive.Root
      id={id}
      className={cn(styles.root, className)}
      checked={checked}
      onCheckedChange={onChange}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          layout='thumb'
          className={styles.thumb}
          animate={{ x: checked ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 400, damping: 30  }}
        />
      </SwitchPrimitive.Thumb>
      {labels !== false && (
        <>
          <div data-label='off'>
            <span>Off</span>
          </div>
          <div data-label='on'>
            <span>On</span>
          </div>
        </>
      )}
    </SwitchPrimitive.Root>
  )
}
