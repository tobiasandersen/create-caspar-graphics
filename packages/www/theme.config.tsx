import React from 'react'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span> Caspar Graphics</span>,
  useNextSeoProps: () => ({ titleTemplate: '%s | Caspar Graphics' }),
  project: {
    link: 'https://github.com/nxtedition/create-caspar-graphics'
  },
  docsRepositoryBase: 'https://github.com/nxtedition/create-caspar-graphics',
  footer: {
    text: <span>Caspar Graphics</span>
  }
}

export default config
