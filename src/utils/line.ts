import type { Point, Line, Lines, PointMap } from './line.type'
import { Directions } from './line.type'
import { CannyJS } from './canny'

const directions = [
  Directions.Left,
  Directions.LeftTop,
  Directions.Top,
  Directions.TopRight,
  Directions.Right,
  Directions.RightBottom,
  Directions.Bottom,
  Directions.BottomLeft,
]

const compose = (...fncs: Function[]) => (...args: any[]) => fncs.reduce((p, n, i) => i ? n(p) : n(...p), args)

const transformArgsFuc = (fnc: Function) => (args: []) => fnc(...args)

const getPointByDirection = ([x, y]: Point, dirction: Directions): Point => {
  switch (dirction) {
    case Directions.Left:
      return [x - 1, y]
    case Directions.LeftTop:
      return [x - 1, y - 1]
    case Directions.Top:
      return [x, y - 1]
    case Directions.TopRight:
      return [x + 1, y - 1]
    case Directions.Right:
      return [x + 1, y]
    case Directions.RightBottom:
      return [x + 1, y + 1]
    case Directions.Bottom:
      return [x, y + 1]
    case Directions.BottomLeft:
      return [x - 1, y + 1]
  }
}

const getPoints = (imgData: ImageData['data'], w: number, h: number): PointMap => {
  const pointMap: PointMap = new Map()
  for (let y = h-1; y >= 0; y--) {
    for (let x = w-1; x >= 0; x--) {
  // for (let y = 0; y < h; y++) {
  //   for (let x = 0; x < w; x++) {
      const i = x * 4 + y * w * 4

      if (imgData[i] === 255) pointMap.set(`${x}-${y}`, [x, y])
    }
  }

  return pointMap
}

const getLines = (pointMap: PointMap) => {
  const pointCache = new Map<string, true>()
  const lines: Lines = []
  const { random } = Math
  for (const [x, y] of pointMap.values()) {
    if (pointCache.has(`${x}-${y}`)) continue
  

    directions.sort(() => random() - random())
    const line: Line = []
    let start: Point = [x, y]
    lines.push(line)
    line.push(start)
    let i = 0
    while (i < directions.length) {
      const [x, y] = getPointByDirection(start, directions[i])
      if (!pointMap.has(`${x}-${y}`) || pointCache.has(`${x}-${y}`)) {
        i++
        continue
      }
      
      i = 0
      line.push(start = [x, y])
      pointCache.set(`${x}-${y}`, true)
    }
  }

  return lines
}

const getCanvasData = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const { data } = ctx.getImageData(0, 0, w, h)

  return [data, w, h]
}

const getCanvasLines: (ctx: CanvasRenderingContext2D, w: number, h: number) => Lines = compose(
  getCanvasData,
  transformArgsFuc(getPoints),
  getLines
)

class ActiveImg extends HTMLElement {
  initial = false
  url: string | null = null
  width: string | null | undefined
  height: string | null | undefined
  svg: SVGSVGElement
  img: HTMLImageElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  shadowRoot: ShadowRoot
  styleNode: HTMLStyleElement
  wrapper: HTMLElement

  constructor() {
    super()

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.img = new Image()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.shadowRoot = this.attachShadow({ mode: 'open' })
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('wrapper')
    this.wrapper.style.setProperty('--time', '2s')
    this.wrapper.style.setProperty('--state', 'paused')
    this.styleNode = document.createElement('style')
    this.styleNode.setAttribute('type', 'text/css')
    this.styleNode.innerHTML = `
    .wrapper {
      position: relative;
    }
    img {
      position: absolute;
      opacity: 0;
      z-index: 1;
      animation: img 1s ease var(--time) var(--state) forwards;
    }
    svg {
      position: absolute;
    }
    svg polyline {
      stroke-dasharray: var(--offset);
      stroke-dashoffset: var(--offset);
      animation: line var(--time);
    }
    @keyframes line {
      100% {
        stroke-dashoffset: 0;
      }
    }
    @keyframes img {
      100% {
        opacity: 1
      }
    }
    `
  }
  
  async connectedCallback() {
    this.initial = true
    this.url = this.getAttribute('url')
    if (!this.url) throw new Error('需要 url')

    this.width = this.getAttribute('width')
    this.height = this.getAttribute('height')
    this.width && this.img.setAttribute('width', this.width)
    this.height && this.img.setAttribute('height', this.height)
    this.shadowRoot.appendChild(this.styleNode)
    this.wrapper.appendChild(this.img)
    this.shadowRoot.appendChild(this.wrapper)
    await this.start()
    this.wrapper.appendChild(this.svg)
    this.wrapper.style.setProperty('--state', 'running')
  }

  static get observedAttributes() {
    return ['width', 'height', 'url']
  }

  async attributeChangedCallback(key: string, oldVal: string, newVal: string) {
    this[key as 'width' | 'height' | 'url'] = newVal

    if (!this.initial) return
    this.svg.innerHTML = ''
    this.styleNode.innerHTML = `
    .wrapper {
      position: relative;
    }
    img {
      position: absolute;
      opacity: 0;
      z-index: 1;
    }
    svg {
      position: absolute;
    }
    svg polyline {
      stroke-dasharray: var(--offset);
      stroke-dashoffset: var(--offset);
    }`
    this.wrapper.style.setProperty('--state', 'paused')
    this.wrapper.style.setProperty('--state', 'running')
    await new Promise(r => setTimeout(r))
    await this.start()
    setTimeout(() => {
    this.styleNode.innerHTML = `
    .wrapper {
      position: relative;
    }
    img {
      position: absolute;
      opacity: 0;
      z-index: 1;
      animation: img 1s ease var(--time) var(--state) forwards;
    }
    svg {
      position: absolute;
    }
    svg polyline {
      stroke-dasharray: var(--offset);
      stroke-dashoffset: var(--offset);
      animation: line var(--time);
    }
    @keyframes line {
      100% {
        stroke-dashoffset: 0;
      }
    }
    @keyframes img {
      100% {
        opacity: 1
      }
    }
    `
  })
  }
  
  async start() {
    this.ctx.clearRect(0, 0, +this.width!, +this.height!)
    const img = await this.loadImg(this.url!)
    this.width && this.canvas.setAttribute('width', this.width)
    this.height && this.canvas.setAttribute('height', this.height)
    this.ctx.drawImage(img, 0, 0, +this.width!, +this.height!)
    const canny = CannyJS.canny(this.canvas, 80, 10, 1.4, 3);
    this.ctx.clearRect(0, 0, +this.width!, +this.height!)
    canny.drawOn(this.canvas);

    const data = getCanvasLines(this.ctx, +this.width!, +this.height!)
    this.svg.setAttribute('viewBox', `0,0 ${this.width} ${this.height}`)
    this.svg.setAttribute('width', this.width!)
    this.svg.setAttribute('height', this.height!)
    this.svg.innerHTML = this.createPolyLines(data)
  }

  createPolyLines(lines: Lines) {
    return lines.map(line => `<polyline style='--offset:${line.length}' points='${line.map(point => point.join(',')).join(' ')}' fill='none' stroke='pink' ></polyline>`).join('')
  }

  loadImg(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const { img } = this
      img.src = url
      img.onload = () => {
        this.width = img.width + ''
        this.height = img.height + ''
        resolve(img)
      }
      img.onerror = e => reject
    })
  }
}

customElements.define('active-img', ActiveImg)