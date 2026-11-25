import { useEffect, useRef, useState } from 'react'
import './process.css'

type ScrollController = { start: number; end: number; kill: () => void }
type ScrollPlugin = {
  create: (options: {
    trigger: HTMLElement
    start: string
    end: string
    invalidateOnRefresh: boolean
    onUpdate: (value: { progress: number }) => void
    onRefresh: (value: { progress: number }) => void
  }) => ScrollController
}
type AnimationWindow = Window & {
  gsap?: { registerPlugin: (plugin: ScrollPlugin) => void }
  ScrollTrigger?: ScrollPlugin
}

const stages = [
  {
    name: 'Impressão', title: 'Camada por camada.', image: 'printed',
    alt: 'Miniatura branca do camaleão com a textura das camadas de impressão.',
    text: 'Cada peça começa a ganhar forma por meio da impressão 3D. O objeto é construído camada por camada, em um processo que pode levar várias horas, dependendo de seu tamanho e complexidade.',
  },
  {
    name: 'Acabamento', title: 'Imprimir é apenas o começo.', image: 'finished',
    alt: 'O mesmo camaleão branco, com a superfície lixada e preparada para pintura.',
    text: 'Após a impressão, cada peça recebe os cuidados necessários. Removemos suportes, realizamos ajustes, lixamento, montagem e preparação da superfície, conforme as necessidades do projeto.',
  },
  {
    name: 'Pintura', title: 'Ganhando personalidade.', image: 'painted',
    alt: 'O camaleão pintado com corpo verde, touca roxa e o emblema LK.',
    text: 'É aqui que cada peça se torna única. Cores, pintura e detalhes personalizados dão vida ao projeto, respeitando a identidade e as preferências de cada cliente.',
  },
  {
    name: 'Embalagem', title: 'Pronto para chegar até você.', image: 'packaged',
    alt: 'A embalagem kraft da LK3D preparada para a entrega.',
    text: 'Depois de todos os cuidados, seu projeto é preparado e embalado para entrega. Cada detalhe importa, desde a primeira camada até o momento de abrir a caixa.',
  },
]

type FrameSequence = { count: number; url: (index: number) => string }
type ProcessProps = { frames?: FrameSequence }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const formatNumber = (value: number) => String(value).padStart(2, '0')

/* Supply frames={{count: 150, url: i => '/assets/mascot/frames/' + i + '.webp'}}
   to progressively replace the four aligned renders. Indices start at zero. */
export default function Process({ frames }: ProcessProps) {
  const track = useRef<HTMLDivElement>(null)
  const studio = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLImageElement>(null)
  const trigger = useRef<ScrollController | null>(null)
  const draw = useRef<((progress: number) => void) | null>(null)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!track.current || !studio.current) return
    const shell = studio.current
    const layers = Array.from(shell.querySelectorAll<HTMLElement>('.lk-stage-render'))
    const motion = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 570px)')
    let currentStage = -1
    let currentFrame = -1
    const loaded = new Map<number, HTMLImageElement>()
    let disposed = false

    function paintFrame(index: number) {
      if (!frames || !frame.current || !loaded.get(index)?.naturalWidth || currentFrame !== index) return
      frame.current.src = frames.url(index)
      frame.current.style.opacity = '1'
    }
    function loadFrame(index: number) {
      if (!frames || index < 0 || index >= frames.count || loaded.has(index)) return
      const img = new Image()
      loaded.set(index, img)
      img.onload = () => { if (!disposed) paintFrame(index) }
      img.src = frames.url(index)
    }

    function update(progress: number) {
      const position = clamp(progress) * 4
      const index = Math.min(3, Math.floor(position))
      if (index !== currentStage) {
        currentStage = index
        setStage(index)
      }
      shell.style.setProperty('--process-progress', String(Math.max(.035, progress)))
      const phase = Math.min(1, position - index)
      layers.forEach((layer, i) => {
        const blend = i === 0 ? 1 : clamp((position - i + .32) / .54)
        layer.style.opacity = String(i === 2 ? (blend > 0 ? 1 : 0) : blend)
        if (i === 2) layer.style.clipPath = 'inset(' + (100 - 100 * blend) + '% 0 0 0)'
      })
      const scale = motion.matches ? 1 : 1 + (index === 3 ? .035 * (1 - phase) : .035 * Math.sin(position * Math.PI / 3))
      const packing = clamp((position - 2.68) / .54)
      shell.style.setProperty('--model-scale', String(scale))
      shell.style.setProperty('--studio-color', String(clamp((position - 1.65) / .7) * .48))
      shell.style.setProperty('--model-tilt', motion.matches ? '0deg' : Math.sin(position * 2) * 1.4 + 'deg')
      shell.style.setProperty('--packing-shift', motion.matches ? '0%' : packing * 4 + '%')
      if (frames && frames.count > 1 && frame.current) {
        const next = Math.round(clamp(progress) * (frames.count - 1))
        if (next !== currentFrame) {
          currentFrame = next
          if (!loaded.get(next)?.naturalWidth) frame.current.style.opacity = '0'
          loadFrame(next)
          paintFrame(next)
          for (let ahead = 1; ahead <= 3; ahead++) {
            loadFrame(next + ahead)
            loadFrame(next - ahead)
          }
          for (const item of loaded.keys()) if (Math.abs(item - next) > 9) loaded.delete(item)
        }
      }
    }
    draw.current = update
    function setup() {
      trigger.current?.kill()
      trigger.current = null
      update(0)
      if (motion.matches) return
      const root = track.current
      if (!root) return
      const library = window as AnimationWindow
      if (library.gsap && library.ScrollTrigger) {
        library.gsap.registerPlugin(library.ScrollTrigger)
        trigger.current = library.ScrollTrigger.create({
          trigger: root, start: 'top 74px', end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: self => update(self.progress),
          onRefresh: self => update(self.progress),
        })
        return
      }
      let raf = 0
      const native = {
        start: 0, end: 1,
        kill: () => {
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
          window.cancelAnimationFrame(raf)
        },
      }
      function renderScroll() {
        raf = 0
        const rect = root!.getBoundingClientRect()
        native.start = rect.top + window.scrollY - 74
        native.end = native.start + Math.max(1, rect.height - shell.offsetHeight)
        update(clamp((window.scrollY - native.start) / (native.end - native.start)))
      }
      function schedule() { if (!raf) raf = window.requestAnimationFrame(renderScroll) }
      trigger.current = native
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
      renderScroll()
    }
    setup()
    motion.addEventListener('change', setup)
    return () => {
      disposed = true
      loaded.clear()
      motion.removeEventListener('change', setup)
      trigger.current?.kill()
      trigger.current = null
      draw.current = null
    }
  }, [frames])

  function selectStage(index: number) {
    const position = (index + .28) / 4
    const controller = trigger.current
    if (controller) {
      window.scrollTo({ top: controller.start + position * (controller.end - controller.start), behavior: 'instant' })
    }
    draw.current?.(position)
  }

  return <section id="processo" className="lk-process" aria-labelledby="process-heading">
    <div className="lk-process-intro">
      <span className="lk-process-label"><i aria-hidden="true" />Processo de produção</span>
      <div className="lk-process-intro-grid">
        <h2 id="process-heading">Da primeira camada<br />ao último detalhe.</h2>
        <p>Uma ideia não ganha vida instantaneamente. Cada peça passa por um processo que combina tecnologia, criatividade, tempo e cuidado manual.</p>
      </div>
    </div>
    <div className="lk-process-track" ref={track}>
      <div className="lk-process-studio" ref={studio}>
        <div className="lk-process-shell">
          <div className="lk-process-art" role="img" aria-label={stages[stage].alt}>
            <div className="lk-model-stack">
              {stages.map((item, i) => <img className="lk-stage-render" key={item.image} src={'/assets/mascot/' + item.image + '.webp'} alt="" loading="lazy" decoding="async" style={{opacity: i === 0 ? 1 : 0}} />)}
              {frames && <img ref={frame} className="lk-sequence-frame" alt="" />}
            </div>
            <span className="lk-reticle lk-reticle-one" aria-hidden="true" />
            <span className="lk-reticle lk-reticle-two" aria-hidden="true" />
          </div>
          <div className="lk-process-details">
            <div className="lk-process-index"><span>ETAPA {formatNumber(stage + 1)}</span><span>/ 04</span></div>
            <div className="lk-stage-copy" key={stage}>
              <h3>{stages[stage].title}</h3>
              <p>{stages[stage].text}</p>
            </div>
            <nav className="lk-stage-nav" aria-label="Etapas da produção">
              {stages.map((item, i) => <button type="button" key={item.image} onClick={() => selectStage(i)} aria-pressed={i === stage}>
                <span aria-hidden="true">{formatNumber(i + 1)}</span>{item.name}
              </button>)}
            </nav>
          </div>
        </div>
        <div className="lk-studio-progress" aria-hidden="true"><i /></div>
      </div>
    </div>
    <div className="lk-process-close">
      <div><h2>Mais uma ideia saindo do papel!</h2><p>E se a próxima ideia fosse a sua?</p></div>
      <a href="#contato">Quero criar meu projeto</a>
    </div>
  </section>
}
