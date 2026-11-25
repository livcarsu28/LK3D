import {useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {motion,useReducedMotion} from 'framer-motion'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import 'tailwindcss/utilities.css'
import './site.css'
import Process from './Process'
import Lower from './Lower'

Object.assign(window,{gsap,ScrollTrigger})
const menu=[['inicio','Início'],['solucoes','Soluções'],['projetos','Nossos projetos'],['processo','Como funciona'],['sobre','Sobre nós'],['contato','Contato']]
function Cube({size=18}:{size?:number}){
 return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/></svg>
}
function Nav(){
 const [open,toggle]=useState(false),[active,setActive]=useState('inicio'),[scrolled,glass]=useState(false)
 useEffect(()=>{const update=()=>{glass(scrollY>24);document.documentElement.style.setProperty('--read',String(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));let current='inicio',y=-Infinity;for(const [id] of menu){const top=document.getElementById(id)?.getBoundingClientRect().top;if(top!==undefined&&top<innerHeight*.45&&top>y){current=id;y=top}}setActive(current)};update();addEventListener('scroll',update,{passive:true});const close=(e:KeyboardEvent)=>{if(e.key==='Escape')toggle(false)};addEventListener('keydown',close);return()=>{removeEventListener('scroll',update);removeEventListener('keydown',close)}},[])
 return <header className={'lk-header '+(scrolled||open?'glass':'')}><div className="readbar"/><div className="nav-wrap"><a href="#inicio" aria-label="LK3D, início"><img className="brand" src="/assets/logo.webp" alt="LK3D"/></a><nav id="site-menu" aria-label="Menu principal" className={open?'open':''}>{menu.map(([id,name])=><a key={id} onClick={()=>toggle(false)} className={active===id?'current':''} href={'#'+id}>{name}</a>)}</nav><a className="nav-quote" href="#contato" onClick={()=>toggle(false)}>Solicitar orçamento</a><button className="burger" aria-label={open?'Fechar menu':'Abrir menu'} aria-controls="site-menu" aria-expanded={open} onClick={()=>toggle(!open)}>{open?'×':'☰'}</button></div></header>
}
const showcase=[['/assets/hero.webp','Mascote LK3D','Pintura personalizada'],['/assets/mascot/printed.webp','Peça recém-impressa','Impressão em filamento'],['/assets/mascot/packaged.webp','Embalagem LK3D','Preparação para entrega']]
function Hero(){
 const [view,setView]=useState(0),reduced=useReducedMotion()
 return <><section className="lk-hero" id="inicio"><div className="hero-grid"/><div className="hero-wrap"><motion.div className="hero-copy" initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.55}}><div className="hero-kicker"><i/> Estúdio de impressão 3D</div><h1>Sua ideia.<br/>Nossa impressão.<br/><em>Infinitas<br/>possibilidades.</em></h1><p>Transformamos criatividade em realidade com impressão 3D personalizada. Desenvolvemos projetos exclusivos para você, sua empresa ou sua próxima grande ideia.</p><div className="hero-actions"><a href="#contato" className="hero-primary"><Cube/>Quero criar meu projeto</a><a href="#projetos" className="hero-secondary">Conhecer nossos trabalhos</a></div></motion.div><div className="hero-art"><div className="studio-image" key={view} style={{backgroundImage:'url('+showcase[view][0]+')'}} role="img" aria-label={showcase[view][1]+' em um estúdio iluminado em roxo'}/><div className="art-frame"><i/><i/><i/><i/></div><div className="sample-caption"><span className="sample-mark"><Cube size={22}/></span><div><strong>{showcase[view][1]}</strong><small>{showcase[view][2]}</small></div></div><div className="view-controls" aria-label="Imagens da peça">{showcase.map(([,name],i)=><button key={name} onClick={()=>setView(i)} aria-label={'Ver '+name} aria-pressed={i===view}><span/></button>)}</div></div></div><div className="hero-foot"><a href="#processo"><span className="mouse"/>Role para explorar</a><span className="hero-rule"/></div></section><div className="service-band" aria-label="Soluções da LK3D">{['Impressão 3D','Projetos sob demanda','Pintura artesanal','Peças exclusivas'].map(t=><span key={t}><b aria-hidden="true">✳</b>{t}</span>)}</div></>
}
function App(){return <><a className="skip" href="#principal">Pular para o conteúdo</a><Nav/><main id="principal"><Hero/><Process/><Lower/></main></>}
createRoot(document.getElementById('root')!).render(<App/>)
