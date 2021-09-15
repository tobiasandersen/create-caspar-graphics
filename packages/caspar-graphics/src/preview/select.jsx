import React from 'react'
import {
  ListboxInput,
  ListboxButton,
  ListboxPopover,
  ListboxList,
  ListboxOption
} from '@reach/listbox'
import '@reach/listbox/styles.css'
import { MdExpandMore } from 'react-icons/md'
import styles from './select.module.css'

export const Select = ({ children, value, onChange }) => {
  return (
    <ListboxInput
      value={value}
      onChange={onChange}
      className={styles.container}
    >
      <ListboxButton className={styles.button} arrow={<MdExpandMore />} />
      <ListboxPopover>
        <ListboxList>{children}</ListboxList>
      </ListboxPopover>
    </ListboxInput>
  )
}

export const SelectOption = ({ children, value }) => {
  return (
    <ListboxOption value={value} className={styles.option}>
      {children}
    </ListboxOption>
  )
}
