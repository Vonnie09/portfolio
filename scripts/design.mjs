#!/usr/bin/env node
// Design helper for redesigning the portfolio without losing old designs.
//
//   npm run design -- list                      saved designs (git tags) and design branches
//   npm run design -- start <name>              new branch design/<name> to work on, live site untouched
//   npm run design -- save <DesignName> [--push]  bookmark the current version, e.g. VonDesignPart2
//   npm run design -- restore <DesignName>      bring back a saved design's files (you review, then commit)
//   npm run design -- shots [DesignName]        photos of every section (desktop, phone, no-3D) into design-shots/
//
// Saved designs are annotated git tags, so they also live on GitHub after --push.

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 4180
const DEBUG_PORT = 9334
// the page sections photographed for every view (top of page first)
const SECTIONS = ['home', 'about', 'portfolio', 'music', 'contact']

const [cmd, arg, ...flags] = process.argv.slice(2)

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
const say = (msg) => console.log(msg)
const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}
const isTag = (name) => !!name && git('tag', '-l', name) === name
const dirty = () => git('status', '--porcelain') !== ''
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function list() {
  const tags = git('tag', '-l', '--sort=-creatordate', '--format=%(refname:short)|%(creatordate:short)|%(contents:subject)')
  say('\nSaved designs (git tags):')
  say(tags ? tags.split('\n').map((l) => {
    const [n, d, s] = l.split('|')
    return `  • ${n}  (${d})  ${s}`
  }).join('\n') : '  (none yet)')
  const branches = git('branch', '--list', 'design/*', '--format=%(refname:short)')
  say('\nDesign branches:')
  say(branches ? branches.split('\n').map((b) => `  • ${b}`).join('\n') : '  (none yet)')
  say(`\nYou are on: ${git('branch', '--show-current') || '(detached)'}\n`)
}

function start(name) {
  if (!name) fail('Give the new design a name, e.g.  npm run design -- start part2')
  if (dirty()) fail('You have unsaved changes. Commit them (or save a design) first.')
  const branch = `design/${slug(name)}`
  git('switch', '-c', branch, 'main')
  say(`\n✔ Now on ${branch} (made from main).`)
  say('  Redesign here; the live site keeps the old look until this branch is merged into main.')
  say(`  Share it online first with:  git push -u origin ${branch}  (Vercel gives the branch its own preview link)\n`)
}

function save(name) {
  if (!name) fail('Give the design a name, e.g.  npm run design -- save VonDesignPart2')
  if (isTag(name)) fail(`"${name}" already exists. Pick a new name (designs are never overwritten).`)
  if (dirty()) fail('You have unsaved changes. Commit them first so the saved design includes them.')
  git('tag', '-a', name, '-m', `${name}: saved design (${git('log', '-1', '--format=%s')})`)
  say(`\n✔ Saved "${name}" at ${git('rev-parse', '--short', 'HEAD')}.`)
  if (flags.includes('--push')) {
    git('push', 'origin', name)
    say('✔ Also saved on GitHub.')
  } else {
    say(`  To keep it on GitHub too:  git push origin ${name}`)
  }
  say('')
}

function restore(name) {
  if (!isTag(name)) fail(`No saved design called "${name}". See:  npm run design -- list`)
  if (dirty()) fail('You have unsaved changes. Commit or discard them first.')
  // files that exist now but not in the saved design → remove them
  const added = git('diff', '--name-only', '--diff-filter=A', name, 'HEAD')
  if (added) execFileSync('git', ['rm', '-q', '--', ...added.split('\n')], { cwd: ROOT })
  git('checkout', name, '--', '.')
  say(`\n✔ Your files now look like "${name}" — nothing is committed yet.`)
  say('  Check it with  npm run dev , then save it with:')
  say(`    git commit -am "Go back to ${name}"`)
  say('  (Changed your mind?  git restore --staged --worktree .  undoes this.)\n')
}

async function shots(name) {
  if (!existsSync(CHROME)) fail(`Google Chrome not found at ${CHROME} (set CHROME_PATH).`)
  let dir = ROOT
  let cleanup = () => {}
  const label = name || git('branch', '--show-current') || git('rev-parse', '--short', 'HEAD')
  if (name) {
    if (!isTag(name) && !git('branch', '--list', name)) fail(`No design or branch called "${name}".`)
    // build the old design in a temporary copy, so your current files are untouched
    dir = join(ROOT, '.design-tmp', slug(name))
    rmSync(dir, { recursive: true, force: true })
    git('worktree', 'add', '--detach', '-f', dir, name)
    symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'))
    cleanup = () => {
      try { git('worktree', 'remove', '--force', dir) } catch { rmSync(dir, { recursive: true, force: true }) }
    }
  }
  try {
    say(`\nBuilding "${label}"…`)
    execFileSync('npx', ['vite', 'build', '--logLevel', 'error'], { cwd: dir, stdio: 'inherit' })
    const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: dir, stdio: 'ignore' })
    try {
      await waitFor(`http://localhost:${PORT}/`)
      const out = join(ROOT, 'design-shots', slug(label))
      mkdirSync(out, { recursive: true })
      // [name, width, height, mobile?, extra Chrome flags]
      const views = [
        ['desktop', 1440, 900, false, ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']], // software 3D
        ['phone', 390, 844, true, ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']],
        ['no-3d', 1440, 900, false, ['--disable-gpu', '--disable-3d-apis']], // like Chrome without acceleration
      ]
      for (const [view, width, height, mobile, extra] of views) {
        const files = await capture({ view, width, height, mobile, extra, out })
        files.forEach((f) => say(`  ✔ ${join('design-shots', slug(label), f)}`))
      }
      say('')
    } finally {
      server.kill()
    }
  } finally {
    cleanup()
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Opens the page in a real (headless) Chrome, waits for the loading screen and animations
// like a visitor would, then photographs each section.
async function capture({ view, width, height, mobile, extra, out }) {
  const profile = join(ROOT, '.design-tmp', `chrome-${view}`)
  rmSync(profile, { recursive: true, force: true })
  const chrome = spawn(CHROME, [
    '--headless=new', `--user-data-dir=${profile}`, `--remote-debugging-port=${DEBUG_PORT}`,
    '--hide-scrollbars', `--window-size=${width},${height}`, ...extra, 'about:blank',
  ], { stdio: 'ignore' })
  try {
    let target
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(250)
      try {
        const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()
        target = list.find((t) => t.type === 'page')
      } catch {}
    }
    if (!target) fail('Could not talk to Chrome.')
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)))
    let id = 0
    const waiting = new Map()
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.id && waiting.has(msg.id)) waiting.get(msg.id)(msg.result || {}), waiting.delete(msg.id)
    }
    const send = (method, params = {}) =>
      new Promise((r) => {
        waiting.set(++id, r)
        ws.send(JSON.stringify({ id, method, params }))
      })
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
    await send('Page.navigate', { url: `http://localhost:${PORT}/` })
    await sleep(7000) // loading screen + badge + first animations
    const files = []
    for (const [i, section] of SECTIONS.entries()) {
      const { result } = await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.getElementById('${section}') || (${section === 'music'} && document.querySelector('.music'))
          if (!el) return false
          el.scrollIntoView({ block: 'start', behavior: 'instant' })
          return true
        })()`,
        returnByValue: true,
      })
      if (!result?.value) continue
      await sleep(i === 0 ? 300 : 1800) // let the fade-ins finish
      const { data } = await send('Page.captureScreenshot', { format: 'png' })
      const file = `${view}-${i + 1}-${section}.png`
      writeFileSync(join(out, file), Buffer.from(data, 'base64'))
      files.push(file)
      if (view === 'no-3d') break // the top of the page is what differs without 3D
    }
    ws.close()
    return files
  } finally {
    chrome.kill()
  }
}

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  fail('The preview server did not start.')
}

const help = () => say(`
Design helper
  npm run design -- list                        saved designs and design branches
  npm run design -- start <name>                new branch design/<name> for a redesign
  npm run design -- save <DesignName> [--push]  bookmark the current version (e.g. VonDesignPart2)
  npm run design -- restore <DesignName>        bring back a saved design (you commit after checking)
  npm run design -- shots [DesignName]          photos of every section into design-shots/ (desktop, phone, no-3D)
`)

const commands = { list, start, save, restore, shots }
if (!commands[cmd]) help()
else await commands[cmd](arg)
