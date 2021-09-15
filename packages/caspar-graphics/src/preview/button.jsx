import React from 'react'
import styles from './button.module.css'

const Button = ({ children, ...props }) => (
  <button {...props} className={styles.button}>
    {children}
  </button>
)

export default Button
