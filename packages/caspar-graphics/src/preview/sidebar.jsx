import React from 'react'
import styles from './sidebar.module.css'
import { MdChevronRight } from 'react-icons/md'
import { Switch } from './Switch'
import { States } from '../../'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Input } from './Input'
import { Checkbox } from './Checkbox'

export const Sidebar = ({ state, dispatch }) => {
  const { templates } = state
  return (
    <div className={styles.sidebar}>
      {templates.map(template => (
        <Template key={template.name} dispatch={dispatch} {...template} />
      ))}
    </div>
  )
}

const Template = ({ name, data, previewData, show, dispatch, schema }) => {
  const [checked, setChecked] = React.useState(false)
  return (
    <Collapsible.Root className={styles.template} open>
      <div className={styles.header}>
        <Collapsible.Trigger className={styles.trigger}>
          <MdChevronRight />
          <span>{name}</span>
        </Collapsible.Trigger>
        <Switch
          checked={show}
          onChange={checked => {
            dispatch({
              type: checked ? 'show' : 'hide',
              template: name
            })
          }}
        />
      </div>
      <Collapsible.Content>
        <div className={styles.data}>
          {Object.entries(schema).map(([key, type]) => {
            console.log({ type })
            const onChange = value => {
              console.log('onChange', data)
              dispatch({
                template: name,
                type: 'data-change',
                data: { ...data, [key]: value }
              })
            }

            const value = data?.[key]
            const props = {
              key,
              id: key,
              label: key,
              value,
              onChange
            }

            if (type === 'boolean') {
              return <Checkbox {...props} />
            }

            return <Input {...props} type={type} />
          })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
