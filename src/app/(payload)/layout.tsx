import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import { serverFunction } from './serverFunctions'

type Args = {
  children: React.ReactNode
}

export default function Layout({ children }: Args) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}
