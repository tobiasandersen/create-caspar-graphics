import React from 'react'
import { ChromePicker as ColorPicker } from 'react-color'
import styles from './settings.module.css'

const Row = ({ children, className, ...props }) => (
  <div className={`${styles.row}${className ? ' ' + className : ''}`} {...props}>
    {children}
  </div>
)

export default class Settings extends React.Component {
  state = { showColorPicker: false }

  onRef = ref => {
    if (!ref) {
      return
    }

    this.node = ref

    setTimeout(() => {
      ref.focus()
    })
  }

  render() {
    const { value, onChange } = this.props
    const { background, autoPreview, imageOpacity = 0.5 } = value
    const { showColorPicker } = this.state

    return (
      <div style={{ padding: 8 }}>
        <Row>
          <input
            id="autoPreview"
            type="checkbox"
            style={{ marginRight: 5 }}
            checked={autoPreview}
            onChange={evt => {
              onChange('autoPreview')(evt.target.checked)
            }}
          />
          <label htmlFor="autoPreview">Auto Play</label>
        </Row>
        <Row className={styles.opacityInput}>
          <div>
            <label htmlFor="opacity">Image Opacity</label>
            <input
              id='opacity'
              className={styles.numberInput}
              value={imageOpacity}
              type="number"
              step="0.1"
              min="0"
              max="1"
              onChange={evt => {
                onChange('imageOpacity')(evt.target.value)
              }}
            />
          </div>
          <input
            className={styles.rangeInput}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={imageOpacity}
            onChange={evt => {
              onChange('imageOpacity')(evt.target.value)
            }}
          />
        </Row>
        <Row>
          Background:
          <div
            onClick={() => {
              this.setState({ showColorPicker: true })
            }}
            style={{
              background,
              border: '1px solid #ccc',
              borderRadius: 4,
              marginLeft: 6,
              position: 'relative',
              height: 20,
              width: 20
            }}
          >
            {showColorPicker && (
              <div
                ref={this.onRef}
                tabIndex={0}
                onKeyDown={evt => {
                  if (evt.key === 'Enter') {
                    this.setState({ showColorPicker: false })
                  }
                }}
                onBlur={evt => {
                  setTimeout(() => {
                    if (
                      this.node &&
                      !this.node.contains(document.activeElement)
                    ) {
                      this.setState({ showColorPicker: false })
                    }
                  })
                }}
                style={{ position: 'absolute', bottom: 10, left: 10 }}
              >
                <ColorPicker
                  disableAlpha
                  color={background}
                  onChange={({ hex }) => {
                    onChange('background')(hex)
                  }}
                />
              </div>
            )}
          </div>
        </Row>
      </div>
    )
  }
}
