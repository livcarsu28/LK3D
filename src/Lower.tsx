import React, { useEffect, useRef, useState } from 'react';
import './lower.css';

interface Project {
  nome: string; categoria: string; imagens: string[]; descricao: string;
  material: string; personalizacao: string; acabamento: string; conceito: boolean;
}
interface Config {
  whatsapp: string; instagram: string; email: string; video: string; videoPoster: string; projects: Project[];
}
declare global { interface Window { LK3D_CONFIG?: Config } }
const config: Config = window.LK3D_CONFIG ?? {whatsapp:'', instagram:'', email:'', video:'', videoPoster:'', projects:[]};
const categories = ['Todos', 'Personalizados', 'Corporativos', 'Miniaturas', 'Decoração', 'Peças funcionais', 'Projetos especiais'];
const faq = [
  ['Quanto custa uma impressão 3D?', 'O orçamento considera o tamanho, o material, a quantidade, o tempo de impressão e o acabamento. Conte sua ideia para avaliarmos o projeto.'],
  ['Quanto tempo demora a produção?', 'O prazo depende da complexidade da peça e da quantidade. Combinamos a previsão na etapa de orçamento.'],
  ['Posso pedir uma peça totalmente personalizada?', 'Sim. Podemos partir de uma ideia, um desenho ou uma referência para avaliar as possibilidades de personalização.'],
  ['Preciso ter um modelo 3D pronto?', 'Você pode começar com uma descrição, fotografia ou esboço. Se já tiver um arquivo 3D, envie para avaliarmos.'],
  ['Vocês fazem acabamento e pintura?', 'Sim. Conforme o projeto, trabalhamos com lixamento, montagem e pintura nas cores combinadas.'],
  ['É possível produzir várias unidades para minha empresa?', 'Sim. Informe a quantidade, as cores e os elementos da sua marca para planejarmos a produção do lote.'],
  ['Quais materiais podem ser utilizados?', 'A escolha depende da função da peça, do ambiente de uso e do acabamento desejado. Indicamos as opções adequadas durante o orçamento.'],
  ['Como solicito um orçamento?', 'Preencha o formulário com os detalhes da ideia. Na conversa pelo WhatsApp você também pode encaminhar imagens, esboços e modelos.']
];
const orders = [
  ['Conte sua ideia', 'Envie uma descrição, fotografia, referência ou modelo do que deseja criar.'],
  ['Desenvolvemos a solução', 'Avaliamos dimensões, materiais, acabamento e viabilidade.'],
  ['Aprovação e produção', 'Com o orçamento aprovado, iniciamos a produção da sua peça.'],
  ['Sua ideia pronta', 'Fazemos o acabamento combinado e preparamos o projeto para entrega.']
];
const wa = config.whatsapp.replace(/\D/g, '');
function SectionTitle({text, children}: {text: string; children?: React.ReactNode}) {
  return <header className="lk-section-title"><h2>{text}</h2>{children && <p>{children}</p>}</header>;
}
function Modal({title, children, close}: {title: string; children: React.ReactNode; close: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog className="lk-dialog" ref={ref} aria-label={title} onCancel={close} onClick={event=>{if(event.target===ref.current) close()}}>
    <div className="lk-modal-body"><button className="lk-close" type="button" aria-label="Fechar" onClick={close}>×</button>{children}</div>
  </dialog>;
}
function ProjectModal({item, close, request}: {item: Project; close: () => void; request: () => void}) {
  const [index,setIndex]=useState(0);
  return <Modal title={item.nome} close={close}>
    <img className="lk-modal-image" src={item.imagens[index]} alt={item.nome}/>
    {item.imagens.length>1 && <div className="lk-thumbs">{item.imagens.map((url,i)=><button type="button" key={url} aria-label={'Ver imagem '+(i+1)} aria-pressed={i===index} onClick={()=>setIndex(i)}><img src={url} alt=""/></button>)}</div>}
    <div className="lk-modal-copy"><p className="lk-kicker">{item.conceito?'Referência ilustrativa · ':''}{item.categoria}</p><h3>{item.nome}</h3><p>{item.descricao}</p>
    <dl>{[['Material',item.material],['Personalização',item.personalizacao],['Acabamento',item.acabamento]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <button className="lk-action" type="button" onClick={request}>Quero um projeto semelhante</button></div>
  </Modal>;
}
function moveToQuote() {
  document.getElementById('contato')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant':'smooth'});
}
export default function Lower() {
  const [showContact,setShowContact]=useState(false);
  useEffect(()=>{
    const hero=document.getElementById('inicio');
    const contact=document.getElementById('contato');
    if(!hero||!contact||!window.IntersectionObserver) return;
    let heroVisible=true, contactVisible=false;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) {
        if(entry.target===hero) heroVisible=entry.isIntersecting;
        if(entry.target===contact) contactVisible=entry.isIntersecting;
      }
      setShowContact(!heroVisible&&!contactVisible);
    });
    observer.observe(hero); observer.observe(contact);
    return ()=>observer.disconnect();
  },[]);
  const [category,setCategory]=useState('Todos');
  const [project,setProject]=useState<Project|null>(null);
  const [privacy,setPrivacy]=useState(false);
  const [client,setClient]=useState('Pessoa física');
  const [kind,setKind]=useState('');
  const [brief,setBrief]=useState('');
  const [prepared,setPrepared]=useState('');
  const [copied,setCopied]=useState(false);
  const items=config.projects.filter(item=>category==='Todos'||item.categoria===category);
  function quote(company:boolean, reference?: Project) {
    setClient(company?'Empresa':'Pessoa física');
    if(reference) {setKind(reference.categoria);setBrief('Gostaria de um projeto semelhante a '+reference.nome+'.');}
    setProject(null); setPrepared(''); moveToQuote();
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const rows=Array.from(data.entries()).filter(([,v])=>String(v).trim()).map(([k,v])=>k+': '+v);
    const message='Olá, LK3D! Gostaria de solicitar um orçamento.\n\n'+rows.join('\n');
    setPrepared(message);setCopied(false);
    if(wa) window.open('https://wa.me/'+wa+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
  }
  async function copy() {
    try {await navigator.clipboard.writeText(prepared);setCopied(true);}
    catch {const field=document.getElementById('lk-prepared') as HTMLTextAreaElement|null; field?.focus();field?.select();}
  }
  return <div className="lk-lower">
    <section id="solucoes" className="lk-light lk-band"><div className="lk-wrap">
      <SectionTitle text="Criamos para quem imagina.">Seja para surpreender alguém, fortalecer sua marca ou desenvolver algo novo, encontramos uma forma de tornar sua ideia realidade.</SectionTitle>
      <div className="lk-solutions">{[
        ['Para você','Sua personalidade em cada detalhe.','Presentes, miniaturas, personagens e peças exclusivas para decorar ou colecionar.','Criar meu projeto','/assets/personal.webp'],
        ['Para sua empresa','Sua marca em uma nova dimensão.','Brindes, chaveiros, protótipos e peças funcionais personalizados para o seu negócio.','Solicitar orçamento empresarial','/assets/business.webp']
      ].map(([tag,title,desc,btn,img],i)=><article key={tag}><img src={img} alt="" loading="lazy"/><div><span className="lk-kicker">{tag}</span><h3>{title}</h3><p>{desc}</p><button className="lk-text-action" type="button" onClick={()=>quote(i===1)}>{btn}</button></div></article>)}</div>
    </div></section>
    <section id="projetos" className="lk-dark lk-band"><div className="lk-wrap">
      <SectionTitle text="Ideias que ganharam forma.">{config.projects.some(p=>p.conceito)?'Explore referências ilustrativas de peças e possibilidades de personalização.':'Conheça alguns dos projetos que transformamos em realidade.'}</SectionTitle>
      <div className="lk-filters" aria-label="Filtrar projetos por categoria">{categories.map(c=><button type="button" key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <div className="lk-projects">{items.map(item=><button key={item.nome} className="lk-project" type="button" onClick={()=>setProject(item)}><img src={item.imagens[0]} loading="lazy" alt={item.nome}/><span className="lk-project-caption"><small>{item.categoria}</small><strong>{item.nome}</strong></span></button>)}</div>
      {items.length===0&&<p role="status">Os projetos desta categoria serão adicionados em breve.</p>}
    </div></section>
    <section className="lk-light lk-band"><div className="lk-wrap lk-backstage">
      <div><SectionTitle text="Muito além de apertar um botão.">Cada projeto envolve planejamento, tecnologia, tempo e atenção aos detalhes. Da primeira camada ao acabamento final, trabalhamos para transformar sua ideia em uma peça especial.</SectionTitle><p>O tempo de produção varia com o tamanho, a complexidade, a quantidade e o acabamento escolhido.</p></div>
      {config.video?<video controls playsInline preload="none" poster={config.videoPoster||undefined} aria-label="Bastidores da produção da LK3D" src={config.video}/>:<div className="lk-video-soon"><span className="lk-reel" aria-hidden="true">▷</span><strong>Bastidores da produção</strong><small>Vídeo em breve</small></div>}
    </div></section>
    <section id="pedido" className="lk-light lk-order lk-band"><div className="lk-wrap"><SectionTitle text="Como fazer um pedido."/><ol>{orders.map(([t,d],i)=><li key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></li>)}</ol><a className="lk-action" href="#contato">Vamos criar algo juntos?</a></div></section>
    <section id="sobre" className="lk-purple lk-band"><div className="lk-wrap lk-about"><div className="lk-about-art"><img loading="lazy" src="/assets/happy.webp" alt="Camaleão da LK3D sorrindo"/></div><div>
      <SectionTitle text="Criatividade em outra dimensão.">A LK3D nasceu para transformar ideias em possibilidades reais. Unimos tecnologia, criatividade e cuidado artesanal para desenvolver peças personalizadas que carregam significado, personalidade e propósito.</SectionTitle>
      <p>Acreditamos que cada projeto é único, seja um presente especial, um produto para uma empresa ou uma ideia que ainda não saiu do papel.</p>
      <ul className="lk-benefits">{['Personalização de verdade','Produção sob demanda','Atendimento próximo','Acabamento e pintura personalizados'].map(b=><li key={b}>{b}</li>)}</ul>
    </div></div></section>
    <section id="contato" className="lk-dark lk-band"><div className="lk-wrap lk-contact">
      <div><SectionTitle text="Qual é a sua próxima grande ideia?">Você imagina. A LK3D ajuda a tornar realidade.</SectionTitle><p>Conte o que você tem em mente. Na conversa pelo WhatsApp, você poderá encaminhar imagens e arquivos de referência.</p></div>
      <form className="lk-form" onSubmit={submit} onChange={()=>{setPrepared('');setCopied(false);}}>
        <label>Nome *<input required name="Nome" autoComplete="name" placeholder="Seu nome"/></label>
        <label>WhatsApp *<input required type="tel" name="WhatsApp" pattern="(?=(?:\D*\d){8,15}\D*$)[0-9\+\(\) .\-]+" autoComplete="tel" placeholder="(00) 00000-0000" title="Digite seu telefone com DDD"/></label>
        <label>Tipo de cliente<select name="Tipo de cliente" value={client} onChange={e=>setClient(e.target.value)}><option>Pessoa física</option><option>Empresa</option></select></label>
        {client==='Empresa'&&<label>Nome da empresa<input name="Empresa" autoComplete="organization" placeholder="Opcional"/></label>}
        <label>Tipo de projeto *<select required name="Tipo de projeto" value={kind} onChange={e=>setKind(e.target.value)}><option value="">Selecione</option>{categories.slice(1).concat('Outro').map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="lk-span">Descrição da ideia *<textarea required name="Ideia" rows={4} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="O que você quer criar?"/></label>
        <details className="lk-span lk-optional"><summary>Detalhes adicionais <small>(opcional)</small></summary><div><label>Quantidade<input type="number" min="1" step="1" name="Quantidade" placeholder="Ex.: 10"/></label><label>Dimensões aproximadas<input name="Dimensões" placeholder="Ex.: 10 × 8 cm"/></label><label>Preferência de cores<input name="Cores" placeholder="Ex.: roxo e verde"/></label><label>Prazo desejado<input type="date" name="Prazo"/></label><label className="lk-span">Pintura ou acabamento<input name="Acabamento" placeholder="Como você imagina a superfície da peça?"/></label></div></details>
        <div className="lk-span"><button className="lk-action" type="submit">{wa?'Solicitar orçamento':'Preparar pedido de orçamento'}</button></div>
        {prepared&&<div className="lk-span lk-prepared"><p role="status">{wa?'Sua mensagem está pronta para enviar no WhatsApp.':'Seu pedido está pronto para copiar. O WhatsApp comercial será disponibilizado em breve.'}</p><textarea id="lk-prepared" aria-label="Mensagem preparada" readOnly rows={5} value={prepared}/><button type="button" className="lk-text-action" onClick={copy}>{copied?'Mensagem copiada':'Copiar mensagem'}</button></div>}
      </form>
    </div></section>
    <section className="lk-light lk-band"><div className="lk-wrap lk-faq"><SectionTitle text="Perguntas frequentes."/><div>{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
    <footer className="lk-dark lk-footer"><div className="lk-wrap"><div className="lk-footer-grid"><div><img src="/assets/logo.webp" width="155" alt="LK3D"/><p>Impressão 3D e peças personalizadas sob demanda.</p><strong>Mais uma ideia saindo do papel!</strong></div><nav aria-label="Navegação do rodapé">{[['Soluções','solucoes'],['Nossos projetos','projetos'],['Como fazer um pedido','pedido'],['Sobre nós','sobre'],['Contato','contato']].map(([t,id])=><a href={'#'+id} key={id}>{t}</a>)}</nav><div className="lk-foot-contact">{config.instagram&&<a href={config.instagram} target="_blank" rel="noreferrer">Instagram</a>}{config.email&&<a href={'mailto:'+config.email}>E-mail comercial</a>}<a href={wa?'https://wa.me/'+wa:'#contato'}>Solicitar orçamento</a><button type="button" onClick={()=>setPrivacy(true)}>Política de Privacidade</button></div></div><div className="lk-copyright">© {new Date().getFullYear()} LK3D. Todos os direitos reservados.</div></div></footer>
    {showContact&&<a className="lk-floating-wa" href={wa?'https://wa.me/'+wa:'#contato'} target={wa?'_blank':undefined} rel={wa?'noreferrer':undefined} aria-label={wa?'Conversar com a LK3D no WhatsApp':'Ir para o formulário de orçamento'}><svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 11.5a8 8 0 0 1-8.2 8 9 9 0 0 1-3.8-.8l-4.4 1.2 1.2-4.3a8 8 0 1 1 15.2-4.1Z"/><path d="M8.6 8.1c-.9 1.5 1 4.7 3.2 6s3.7 1.2 4.2-.4l-2.1-1.1-.9.7c-1.2-.6-2.1-1.4-2.8-2.7l.7-.9-1-2.1Z" strokeWidth="1.2"/></svg>{wa?'WhatsApp':'Orçamento'}</a>}
    {project&&<ProjectModal item={project} close={()=>setProject(null)} request={()=>quote(project.categoria==='Corporativos',project)}/>}
    {privacy&&<Modal title="Política de Privacidade" close={()=>setPrivacy(false)}><div className="lk-modal-copy"><h3>Política de Privacidade</h3><p>O formulário utiliza as informações que você digita para montar a sua mensagem de orçamento no navegador. Ao continuar no WhatsApp, você escolhe se deseja enviar a mensagem à LK3D.</p><p>Nome, telefone e detalhes do projeto servem para responder ao pedido, avaliar a produção e combinar o atendimento. Para solicitar informações ou exclusão dos dados compartilhados, entre em contato pelo mesmo canal de atendimento.</p>{config.email&&<a href={'mailto:'+config.email}>{config.email}</a>}</div></Modal>}
  </div>;
}
