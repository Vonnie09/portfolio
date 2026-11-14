// Can this browser draw with the graphics card (WebGL)?
// When it can't (e.g. Chrome with "graphics acceleration" turned off), everything is drawn by the
// processor, so heavy effects make the page lag. Then the page switches to a lighter look.
function detectWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext() // free it right away
    return !!gl
  } catch {
    return false
  }
}

export const hasWebGL = detectWebGL()
export const lite = !hasWebGL

if (lite) document.documentElement.classList.add('lite')
