import React, { useState } from 'react'
import styles from './settings.module.css'
import { MdMenu, MdMoreHoriz, MdMoreVert } from 'react-icons/md'
import { FiSun, FiMoon } from 'react-icons/fi'
import { Switch } from './Switch'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem
} from './Menu'

export const TemplateSettings = ({ value, onChange }) => {
  const { autoPlay, showJson } = value

  return (
    <div className={styles.container}>
      <button className={`${styles.button} ${styles.menuButton}`}>
        <MdMenu />
      </button>
      <div className={styles.control}>
        <label htmlFor="autoPlay">Autoplay</label>
        <Switch
          labels={false}
          id="autoPlay"
          className={styles.switch}
          checked={Boolean(autoPlay)}
          onChange={autoPlay => {
            onChange(value => ({ ...value, autoPlay }))
          }}
        />
      </div>
      <div className={styles.control}>
        <label htmlFor="json">JSON</label>
        <Switch
          labels={false}
          id="json"
          className={styles.switch}
          checked={Boolean(showJson)}
          onChange={showJson => {
            onChange(value => ({ ...value, showJson }))
          }}
        />
      </div>
    </div>
  )
}

export const GeneralSettings = ({ value, onChange, colorMode }) => {
  const { background, colorScheme } = value

  return (
    <div className={styles.container}>
      <div className={styles.control}>
        <label>Background</label>
        <Popover>
          <PopoverTrigger className={styles.colorPicker}>
            <span style={{ background }} />
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker
              color={background}
              onChange={background => {
                onChange(value => ({ ...value, background }))
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Menu>
        <MenuTrigger className={styles.button}>
          {colorMode === 'light' ? <FiSun /> : <FiMoon />}
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup
            value={colorScheme || 'system'}
            onValueChange={colorScheme => {
              onChange(value => ({ ...value, colorScheme }))
            }}
          >
            <MenuRadioItem value="system">System</MenuRadioItem>
            <MenuRadioItem value="light">Light</MenuRadioItem>
            <MenuRadioItem value="dark">Dark</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  )
}
