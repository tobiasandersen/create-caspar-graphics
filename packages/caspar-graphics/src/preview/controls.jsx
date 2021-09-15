import React, { useRef, useState, useEffect } from 'react'
import Button from './button'
import { Editor } from './editor'
import {
  Tabs,
  TabList,
  Tab as ReachTab,
  TabPanels,
  TabPanel
} from '@reach/tabs'
import { PlayIcon, PauseIcon, StopIcon, UpdateIcon } from './icons'
import Settings from './settings'
import { Select, SelectOption } from './select'
import '@reach/tabs/styles.css'
import isPlainObject from 'lodash/isPlainObject'
import { usePersistentValue } from './use-persistent-value'
import isHotkey from 'is-hotkey'
import { States } from '../../'
import styles from './controls.module.css'

export const Controls = ({
  isPlaying,
  stop,
  play,
  pause,
  settings,
  onChangeSetting,
  previewData,
  templateWindow,
  state
}) => {
  const { data, images } = previewData
  const tabs = isPlainObject(images)
    ? ['data', 'images', 'settings']
    : ['data', 'settings']
  const [selectedTab, setSelectedTab] = usePersistentValue('selectedTab')
  const selectedTabIndex = Math.max(0, tabs.indexOf(selectedTab))
  const editorRef = useRef()

  const onUpdate = () => {
    const data = editorRef.current.getContent()

    if (data) {
      previewData.onChange({ type: 'data', value: data })
    }
  }

  // Keybindings
  useEffect(() => {
    const isSaveHotkey = isHotkey('mod+s')

    const onKeyDown = evt => {
      if ((isSaveHotkey(evt) || evt.key === 'F6') && onUpdate) {
        evt.preventDefault()
        onUpdate()
      } else if (evt.key === 'F2' && play) {
        evt.preventDefault()
        play()
      } else if (evt.key === 'F3' && pause) {
        evt.preventDefault()
        pause()
      } else if (evt.key === 'F1' && stop) {
        evt.preventDefault()
        stop()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    if (templateWindow) {
      templateWindow.document.addEventListener('keydown', onKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown)

      if (templateWindow) {
        templateWindow.document.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [templateWindow])

  return (
    <Tabs
      index={selectedTabIndex}
      onChange={index => {
        setSelectedTab(tabs[index])
      }}
      className={styles.tabs}
    >
      <div className={styles.header}>
        <Button
          disabled={
            ![States.playing, States.loaded, States.paused].includes(state)
          }
          title={isPlaying ? 'Pause (F4)' : 'Play (F2)'}
          onClick={() => {
            if (isPlaying) {
              pause()
            } else {
              play()
            }
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          style={{ marginRight: 5 }}
          disabled={state !== States.playing && state !== States.paused}
          title='Stop (F1)'
          onClick={() => {
            stop()
          }}
        >
          <StopIcon />
        </Button>
        <div
          style={{
            background: '#ccc',
            height: 16,
            margin: '0 10px',
            width: 1
          }}
        />
        <TabList className={styles.tabList}>
          <Tab>Data</Tab>
          {isPlainObject(images) ? <Tab>Images</Tab> : null}
          <Tab>Settings</Tab>
        </TabList>
      </div>
      <TabPanels className={styles.tabPanels}>
        <TabPanel>
          <div className={styles.tabPanel}>
            <div className={styles.tabPanelContent}>
              {Array.isArray(previewData.dataKeys) && (
                <Select
                  value={previewData.selectedDataKey || ''}
                  onChange={value => {
                    previewData.onChange({ type: 'data', value })
                  }}
                >
                  {previewData.dataKeys.map(key => (
                    <SelectOption
                      key={key}
                      value={key}
                      style={{
                        cursor: 'default',
                        fontWeight:
                          key === previewData.selectedDataKey
                            ? 'bold'
                            : 'normal'
                      }}
                    >
                      {key}
                    </SelectOption>
                  ))}
                </Select>
              )}
              <div className={styles.buttonContainer}>
                <Button
                  title={`Update (${getPrettySequence('mod+s')}, F6)`}
                  onClick={() => {
                    onUpdate()
                  }}
                >
                  <UpdateIcon />
                </Button>
              </div>
            </div>
            <div className={styles.editor}>
              <Editor ref={editorRef} value={data} />
            </div>
          </div>
        </TabPanel>
        {isPlainObject(images) ? (
          <TabPanel
            style={{
              overflow: 'overlay'
            }}
          >
            <div className={styles.tabPanelImages}>
              {Object.entries(images).map(([key, url]) => (
                <img
                  key={key}
                  title={key}
                  src={url}
                  onClick={() => {
                    previewData.onChange({
                      type: 'image',
                      value: key === previewData.selectedImageKey ? null : key
                    })
                  }}
                  style={{
                    boxShadow:
                      key === previewData.selectedImageKey
                        ? '0 0 0 2px #1b73e8'
                        : '0 0 0 1px #ddd'
                  }}
                />
              ))}
            </div>
          </TabPanel>
        ) : null}
        <TabPanel>
          <Settings value={settings} onChange={onChangeSetting} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

const Tab = ({ children }) => (
  <ReachTab className={styles.tab}>{children}</ReachTab>
)

const getNavigator = () => {
  const { userAgent, platform } = window.navigator

  return {
    isMac: /Mac|iPod|iPhone|iPad/.test(platform),
    isElectron: /Electron/.test(userAgent)
  }
}

const getPrettySequence = sequence => {
  if (typeof sequence !== 'string') {
    return ''
  }

  const { isMac } = getNavigator()

  return sequence
    .toUpperCase()
    .replace(/mod\+/gi, isMac ? '⌘' : 'Ctrl+')
    .replace(/alt\+/gi, isMac ? '⌥' : 'Alt+')
    .replace(/ctrl\+/gi, isMac ? '⌃' : 'Ctrl+')
    .replace(/del/gi, isMac ? '⌦' : 'Del')
    .replace(/shift\+/gi, '⇧')
}
