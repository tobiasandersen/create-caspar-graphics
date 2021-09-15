import ReactDOM from 'react-dom'
import React, { useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from 'react-router-dom'
import { Controls } from './controls'
import { States } from '../../'
import { Screen } from './screen'
import { usePersistentValue } from './use-persistent-value'
import { usePreviewState } from './use-preview-state'
import { usePreviewData } from './use-preview-data'
import styles from './index.module.css'
import { FaRegSadCry } from 'react-icons/fa'

export const Preview = ({ template, templates }) => {
  const [settings, setSettings] = usePersistentValue('settings', {
    autoPreview: false,
    background: '#ffffff',
    showImage: false,
    imageOpacity: 0.5
  })
  const iframeRef = useRef()
  const templateWindow = iframeRef.current?.contentWindow

  const [state, setState] = usePreviewState({
    templateWindow,
    autoPreview: settings.autoPreview
  })

  const previewData = usePreviewData({
    templateWindow,
    state
  })

  return (
    <div className={styles.container}>
      <Screen
        template={template}
        background={settings.background}
        iframeRef={iframeRef}
        image={{
          opacity: settings.imageOpacity,
          src: previewData?.image
        }}
        state={state}
        onLoad={() => {
          // HACK: wait for update window.update to be set.
          setTimeout(() => {
            setState(States.loaded)
          }, 0)
        }}
      />
      <div className={styles.links}>
        <div
          style={{
            alignItems: 'center',
            flex: '0 0 50%',
            display: 'grid',
            gridGap: 10,
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: 50,
            paddingRight: 24,
            overflow: 'overlay',
            width: '50%'
          }}
        >
          {templates.map(name => (
            <Link
              key={name}
              to={`/${name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 30,
                fontSize: 13,
                fontWeight: name === template ? 800 : 300,
                textTransform: 'uppercase'
              }}
            >
              {name}
            </Link>
          ))}
        </div>
        <div style={{ flex: '0 0 50%', display: 'flex' }}>
          {templateWindow != null && (
            <Controls
              templateWindow={templateWindow}
              play={() => {
                setState(States.playing)
              }}
              pause={() => {
                setState(States.paused)
              }}
              stop={() => {
                if (state === States.playing || state === States.paused) {
                  setState(States.stopped)
                }
              }}
              update={data => {
                setData(data)
              }}
              state={state}
              isPlaying={state === States.playing}
              settings={settings}
              onChangeSetting={key => value => {
                setSettings({ ...settings, [key]: value })
              }}
              previewData={previewData}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const App = () => {
  const { templates } = window

  if (templates.length === 0) {
    return (
      <div className={styles.empty}>
        <FaRegSadCry />
        <div>No templates found</div>
        <div>
          Make sure you use <span>.jsx</span> for your React files.
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Switch>
        {templates.map(template => (
          <Route key={template} path={'/' + template}>
            <Preview template={template} templates={templates} />
          </Route>
        ))}
        <Redirect to={templates[0]} />
      </Switch>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
