import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'

const workerFiles = new Set([
  'maplibre-gl-worker.mjs',
  'maplibre-gl-shared.mjs',
])

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params

  if (!workerFiles.has(file)) {
    return new Response('Not found', { status: 404 })
  }

  const source = await readFile(join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist', file), 'utf8')
  return new Response(source, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
