import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const app = express()
const MAX_FILE_SIZE = 750 * 1024 * 1024
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
})

const PORT = process.env.PORT || 3000
const UPLOAD_DIR = path.resolve('./.minthost/uploads')

const AUTO_DELETE_TIME = 1000 * 60 * 60 * 24 * 7
const CLEAN_INTERVAL_MINUTES = 5

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function base64urlEncode(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function getAvailableDiskSpace(dir) {
  const stat = fs.statfsSync(dir)
  return stat.bavail * stat.bsize
}

app.post('/upload', upload.single('file'), (req, res) => {
  const originalName = req.headers['mint-filename']

  if (!req.file || !originalName) {
    return res.status(418).send('Missing file or Mint-Filename')
  }

  const base64Filename = base64urlEncode(originalName)

  const existingFiles = fs.readdirSync(UPLOAD_DIR)
  const conflict = existingFiles.some(file => file.startsWith(base64Filename + '_'))

  if (conflict) {
    return res.status(409).send('Filename already exists')
  }

  const buffer = req.file.buffer

  try {
    const available = getAvailableDiskSpace(UPLOAD_DIR)
    if (buffer.length > available) {
      return res.status(507).send('Insufficient storage space')
    }
  } catch (err) {
    console.error('Disk space check failed:', err)
    return res.status(500).send('Server error during disk space check')
  }

  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  const timestamp = Date.now()
  const filename = `${base64Filename}_${timestamp}_${hash}`
  const outPath = path.join(UPLOAD_DIR, filename)

  fs.writeFileSync(outPath, buffer)

  console.log(`Uploaded ${originalName} as ${hash}`)

  return res.status(200).json({
    hash,
    status: 'stored',
    filename: originalName,
  })
})

app.get('/:hash', (req, res) => {
  const { hash } = req.params

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return res.status(418).send('Invalid SHA256')
  }

  const matches = fs.readdirSync(UPLOAD_DIR).filter(name => name.endsWith(`_${hash}`))
  if (matches.length === 0) {
    return res.status(404).send('File not found')
  }

  const selected = matches.sort().reverse()[0]
  const parts = selected.split('_')
  if (parts.length < 3) {
    return res.status(500).send('Malformed file name')
  }
  const timestamp = parseInt(parts[1], 10)
  const age = Date.now() - timestamp
  const fullPath = path.join(UPLOAD_DIR, selected)

  if (isNaN(timestamp) || age > AUTO_DELETE_TIME) {
    try {
      fs.unlinkSync(fullPath)
      console.log(`Deleted expired file: ${selected}`)
    } catch (err) {
      console.error(`Failed to delete expired file ${selected}:`, err)
    }
    return res.status(410).send('File expired')
  }

  const stream = fs.createReadStream(fullPath)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${hash}"`)
  stream.pipe(res)
})

app.listen(PORT, () => {
  console.log(`congratulations! you successfully got a mint host running at http://localhost:${PORT}. note that you'll need to set up port forwarding (or run this on a service that assigns a domain name) to make it accessible to the world`)
})

setInterval(() => {
  const now = Date.now()
  const files = fs.readdirSync(UPLOAD_DIR)

  for (const file of files) {
    const parts = file.split('_')
    if (parts.length < 3) continue

    const timestamp = parseInt(parts[1], 10)
    const hash = parts[2]

    if (!/^[a-f0-9]{64}$/.test(hash) || isNaN(timestamp)) continue

    if (now - timestamp > AUTO_DELETE_TIME) {
      try {
        fs.unlinkSync(path.join(UPLOAD_DIR, file))
        console.log(`deleted expired file: ${file}`)
      } catch (err) {
        console.error(`failed to delete expired file ${file}:`, err)
      }
    }
  }
}, CLEAN_INTERVAL_MINUTES * 60 * 1000)
