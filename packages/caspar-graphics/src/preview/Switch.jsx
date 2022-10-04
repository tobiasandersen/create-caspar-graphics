import React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import styles from './switch.module.css'
import { motion } from 'framer-motion'
import cn from 'classnames'

export const Switch = ({ checked, onChange, className, ...props }) => {
  return (
    <SwitchPrimitive.Root
      className={cn(styles.root, className)}
      checked={checked}
      onCheckedChange={onChange}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          layout='thumb'
          className={styles.thumb}
          animate={{ x: checked ? 'calc(100% + 4px)' : 0 }}
        />
      </SwitchPrimitive.Thumb>
      <div data-label='off'>
        <span>Off</span>
      </div>
      <div data-label='on'>
        <span>On</span>
      </div>
    </SwitchPrimitive.Root>
  )
}
