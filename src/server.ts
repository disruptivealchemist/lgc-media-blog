import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const start = async () => {
  const express = (await import('express')).default
  const next = (await import('next')).default
  const { getPayload } = await import('payload')
  const config = (await import('./payload.config')).default

  const app = express()
  const dev = process.env.NODE_ENV !== 'production'
  const nextApp = next({ dev })
  const handle = nextApp.getRequestHandler()

  await nextApp.prepare()

  const payload = await getPayload({ config })

  app.use(express.json())

  app.all('*', (req, res) => handle(req, res))

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
