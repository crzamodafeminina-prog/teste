import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import AdminLogin from "./AdminLogin.jsx";
const SUPABASE_URL = "https://rwtgxlncaxddtznbapwz.supabase.co";
const SUPABASE_KEY = "sb_publishable_x0Uo41P_BbBFOmiKWbh2dQ_VyLByuFi";

async function supabaseFetch(tabela, params = "") {
  const resposta = await fetch(
    `${SUPABASE_URL}/rest/v1/${tabela}${params}`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar ${tabela}: ${resposta.status}`);
  }

  return resposta.json();
}
/* =========================================================================
   1. CONFIGURAÇÃO DA MARCA  — edite só esta parte para trocar dados
   ========================================================================= */
let CONFIG = {
  marca: "CRZA",
  whatsapp: "5531999999999",          // DDI + DDD + número, só dígitos
  instagram: "crza.oficial",
  email: "contato@crza.com.br",
  cidade: "Ouro Preto, MG",
  descontoPix: 0.05,                  // 5%
  parcelas: 3,                        // 3x sem juros
  freteGratisAcima: 299,
  heroTitulo: "O sol já sabe o seu nome.",
  heroTexto: "Moda para vestir o seu melhor — com conforto, leveza e elegância em cada detalhe. Corte limpo, caimento firme, nada sobrando.",
  identidadeTitulo: "Moda para se sentir bonita, confortável e elegante.",
  identidadeTexto: "A CRZA nasceu em Ouro Preto com uma ideia simples: criar peças que façam você se sentir especial, confortável e confiante.",
  colecaoTitulo: "Novos capítulos começam aqui.",
  colecaoTexto: "A CRZA começa no beachwear, mas foi criada para crescer com você: roupas leves, academia, casual e novos capítulos do seu estilo.",
  mensagemWhatsApp: "Oi! Vim pelo site da CRZA e tenho uma dúvida.",
};

/* =========================================================================
   2. IMAGENS — cole a URL da foto. Vazio = arte provisória gerada em SVG.
      Ex.: hero: "https://meusite.com/fotos/hero.jpg"
   ========================================================================= */
let IMAGES = {
  hero: "",
  sobre: "",
  colecao: "",
  produtos: {
    aura: [],      // ex.: ["url-frente.jpg", "url-costas.jpg"]
    bali: [],
    duna: [],
  },
  instagram: ["", "", "", "", "", ""],
};

/* =========================================================================
   3. CATÁLOGO
   ========================================================================= */
const TAMANHOS = ["PP", "P", "M", "G", "GG"];

const CORES = {
  marinho: { nome: "Azul-marinho", hex: "#071A33" },
  azul:     { nome: "Azul",         hex: "#12345A" },
  branco:   { nome: "Branco",       hex: "#FFFFFF" },
  areia:    { nome: "Areia",        hex: "#E8E3DB" },
};

let PRODUTOS = [
  { id:"aura", nome:"Aura", preco:110, categoria:"Biquínis", modelagem:"Cortininha", cores:["marinho","branco"], tecido:"Poliamida com proteção UV", bojo:true, destaque:true, descricao:"Cortininha de amarração regulável, criada para unir conforto, segurança e um visual elegante." },
  { id:"bali", nome:"Bali", preco:100, categoria:"Biquínis", modelagem:"Tomara que caia", cores:["marinho","branco","areia"], tecido:"Poliamida com proteção UV", bojo:true, destaque:true, descricao:"Tomara que caia com sustentação confortável e acabamento limpo. Uma peça essencial para dias de verão." },
  { id:"duna", nome:"Duna", preco:90, categoria:"Biquínis", modelagem:"Meia taça", cores:["marinho","branco"], tecido:"Poliamida com proteção UV", bojo:false, destaque:true, descricao:"Meia taça leve e elegante, pensada para acompanhar dias de praia com liberdade e conforto." },
];

let CATEGORIAS = ["Biquínis", "Roupas leves", "Academia"];

const MEDIDAS = [
  ["PP", "78–82", "60–64", "86–90"],
  ["P",  "83–87", "65–69", "91–95"],
  ["M",  "88–92", "70–74", "96–100"],
  ["G",  "93–97", "75–79", "101–105"],
  ["GG", "98–104","80–86", "106–112"],
];

/* =========================================================================
   4. DADOS EDITÁVEIS PELO PAINEL
   ========================================================================= */
const CRZA_STORAGE = "crza:site-data:v1";
const DADOS_PADRAO = () => ({
  config: JSON.parse(JSON.stringify(CONFIG)),
  images: JSON.parse(JSON.stringify(IMAGES)),
  produtos: JSON.parse(JSON.stringify(PRODUTOS)),
  categorias: [...CATEGORIAS],
});

async function carregarDados() {
  try {
    const [config, categorias, produtos, imagens, cores, tamanhos] =
      await Promise.all([
        supabaseFetch("configuracoes", "?select=*"),
        supabaseFetch("categorias", "?select=*&ativo=eq.true&order=ordem"),
        supabaseFetch("produtos", "?select=*&ativo=eq.true&order=ordem"),
        supabaseFetch("produto_imagens", "?select=*"),
        supabaseFetch("produto_cores", "?select=*"),
        supabaseFetch("produto_tamanhos", "?select=*"),
      ]);

    return {
      ...DADOS_PADRAO(),
      config: config[0]
        ? { ...CONFIG, ...config[0] }
        : DADOS_PADRAO().config,

      categorias: categorias.map((c) => c.nome),

      produtos: produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        preco: Number(p.preco),
        categoria: p.categoria || "Biquínis",
        modelagem: p.modelagem || "",
        tecido: p.tecido || "",
        bojo: Boolean(p.bojo),
        destaque: Boolean(p.destaque),
        descricao: p.descricao || "",

        cores: cores
          .filter((c) => c.produto_id === p.id)
          .map((c) => c.cor),

        tamanhos: tamanhos
          .filter((t) => t.produto_id === p.id)
          .map((t) => t.tamanho),

        imagens: imagens
          .filter((i) => i.produto_id === p.id)
          .map((i) => i.url),
      })),
    };
  } catch (erro) {
    console.error("Erro ao carregar dados do Supabase:", erro);
    return DADOS_PADRAO();
  }
}

function aplicarDados(dados) {
  CONFIG = dados.config;
  IMAGES = dados.images;
  PRODUTOS = dados.produtos;
  CATEGORIAS = dados.categorias;
  try { localStorage.setItem(CRZA_STORAGE, JSON.stringify(dados)); } catch {}
}

const DADOS_INICIAIS = DADOS_PADRAO();
CONFIG = DADOS_INICIAIS.config;
IMAGES = DADOS_INICIAIS.images;
PRODUTOS = DADOS_INICIAIS.produtos;
CATEGORIAS = DADOS_INICIAIS.categorias;

/* =========================================================================
   4. UTILITÁRIOS
   ========================================================================= */
const brl = (n) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const comPix = (n) => n * (1 - CONFIG.descontoPix);
const parcela = (n) => n / CONFIG.parcelas;
const zap = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
const insta = `https://instagram.com/${CONFIG.instagram}`;

function useCarrinho() {
  const [itens, setItens] = useState(() => {
    try {
      const salvo = localStorage.getItem("crza:carrinho");
      return salvo ? JSON.parse(salvo) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("crza:carrinho", JSON.stringify(itens)); } catch (e) {}
  }, [itens]);

  const adicionar = useCallback((produto, tamanho, cor, qtd = 1) => {
    const chave = `${produto.id}-${tamanho}-${cor}`;
    setItens((atual) => {
      const existe = atual.find((i) => i.chave === chave);
      if (existe) return atual.map((i) => i.chave === chave ? { ...i, qtd: i.qtd + qtd } : i);
      return [...atual, { chave, id: produto.id, nome: produto.nome, preco: produto.preco, tamanho, cor, qtd }];
    });
  }, []);

  const mudarQtd = useCallback((chave, delta) => {
    setItens((atual) => atual
      .map((i) => i.chave === chave ? { ...i, qtd: Math.max(0, i.qtd + delta) } : i)
      .filter((i) => i.qtd > 0));
  }, []);

  const remover = useCallback((chave) => setItens((a) => a.filter((i) => i.chave !== chave)), []);
  const limpar = useCallback(() => setItens([]), []);

  const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const contagem = itens.reduce((s, i) => s + i.qtd, 0);

  return { itens, adicionar, mudarQtd, remover, limpar, total, contagem };
}

function useTravaScroll(ativo) {
  useEffect(() => {
    if (ativo) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [ativo]);
}

/* =========================================================================
   5. ÍCONES
   ========================================================================= */
const Ico = ({ d, tam = 20, preenche = "none", ...p }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill={preenche} stroke="currentColor"
       strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {d}
  </svg>
);
const IconeBusca  = (p) => <Ico {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />;
const IconeSacola = (p) => <Ico {...p} d={<><path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>} />;
const IconeX      = (p) => <Ico {...p} d={<><path d="M6 6l12 12M18 6 6 18"/></>} />;
const IconeMenu   = (p) => <Ico {...p} d={<><path d="M4 7h16M4 12h16M4 17h16"/></>} />;
const IconeSeta   = (p) => <Ico {...p} d={<><path d="M5 12h14M13 6l6 6-6 6"/></>} />;
const IconeMais   = (p) => <Ico {...p} d={<><path d="M12 5v14M5 12h14"/></>} />;
const IconeMenos  = (p) => <Ico {...p} d={<><path d="M5 12h14"/></>} />;
const IconeInsta  = (p) => <Ico {...p} d={<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></>} />;
const IconeZap    = (p) => (
  <svg width={p.tam || 22} height={p.tam || 22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.07L2 22l5.07-1.36A10 10 0 1 0 12 2Zm5.5 14.1c-.24.67-1.4 1.28-1.94 1.32-.5.04-.98.22-3.3-.69-2.78-1.1-4.54-3.94-4.68-4.13-.13-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.6.46.24.58.8 2 .87 2.14.07.14.12.3.02.49-.1.19-.15.3-.29.47-.14.16-.3.36-.43.49-.14.13-.29.28-.12.56.16.27.73 1.2 1.56 1.95 1.08.96 1.98 1.26 2.26 1.4.28.14.44.12.6-.07.17-.2.7-.81.88-1.09.19-.27.37-.22.62-.13.25.09 1.6.75 1.87.89.28.13.46.2.53.31.07.11.07.64-.17 1.31Z"/>
  </svg>
);

/* =========================================================================
   6. ARTE PROVISÓRIA (SVG) — usada enquanto não há foto real
   ========================================================================= */
const PALETAS = [
  ["#12345A", "#071A33", "#F7F8FA"],
  ["#234C78", "#071A33", "#FFFFFF"],
  ["#456A91", "#12345A", "#E8E3DB"],
  ["#0B2748", "#071A33", "#FFFFFF"],
];

function ArteProvisoria({ semente = 0, retrato = true, rotulo }) {
  const p = PALETAS[semente % PALETAS.length];
  const uid = `a${semente}${retrato ? "r" : "q"}`;
  return (
    <svg viewBox={retrato ? "0 0 600 800" : "0 0 800 600"} className="w-full h-full block" preserveAspectRatio="xMidYMid slice" role="img" aria-label={rotulo || "Imagem provisória"}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p[2]} />
          <stop offset="60%" stopColor={p[0]} />
          <stop offset="100%" stopColor={p[1]} />
        </linearGradient>
        <radialGradient id={`s${uid}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".28" />
          <stop offset="100%" stopColor="#000000" stopOpacity=".18" />
        </radialGradient>
        <filter id={`n${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={`url(#g${uid})`} />
      <g opacity=".5">
        <ellipse cx={retrato ? 300 : 400} cy={retrato ? 300 : 230} rx={retrato ? 200 : 250} ry={retrato ? 250 : 190} fill={p[1]} opacity=".35" />
        <path d={retrato
          ? "M300 170c66 0 108 52 108 122 0 58-26 96-46 128 46 26 110 62 128 150 10 50 10 130 10 230H100c0-100 0-180 10-230 18-88 82-124 128-150-20-32-46-70-46-128 0-70 42-122 108-122Z"
          : "M400 120c60 0 98 46 98 110 0 52-24 86-42 116 42 22 100 56 116 134 10 46 10 80 10 120H218c0-40 0-74 10-120 16-78 74-112 116-134-18-30-42-64-42-116 0-64 38-110 98-110Z"}
          fill={p[1]} opacity=".55" />
      </g>
      <rect width="100%" height="100%" fill={`url(#s${uid})`} />
      <rect width="100%" height="100%" filter={`url(#n${uid})`} opacity=".16" />
    </svg>
  );
}

function Foto({ src, alt, semente = 0, retrato = true, className = "" }) {
  const [erro, setErro] = useState(false);
  const valida = src && !erro;
  return (
    <div className={`relative overflow-hidden bg-areiaesc ${className}`}>
      {valida
        ? <img src={src} alt={alt} loading="lazy" onError={() => setErro(true)} className="w-full h-full object-cover block" />
        : <ArteProvisoria semente={semente} retrato={retrato} rotulo={alt} />}
    </div>
  );
}

/* =========================================================================
   7. PEÇAS DE INTERFACE
   ========================================================================= */
function Botao({ children, variante = "cheio", como = "button", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] tracking-[0.14em] font-medium transition-colors duration-300 rounded-full";
  const estilos = {
    cheio:  "bg-terra text-offwhite hover:bg-terraesc",
    linha:  "border border-cacau/35 text-cacau hover:bg-cacau hover:text-offwhite",
    claro:  "bg-offwhite text-cacau hover:bg-areia",
    escuro: "bg-cacau text-offwhite hover:bg-terra",
  };
  const Tag = como;
  return <Tag className={`${base} ${estilos[variante]} ${className}`} {...props}>{children}</Tag>;
}

function Titulo({ children, className = "", nivel = "h2", ...props }) {
  const Tag = nivel;
  return <Tag className={`font-display font-light leading-[1.05] tracking-[-0.02em] ${className}`} {...props}>{children}</Tag>;
}

function Amostra({ corId, ativa, onClick, tamanho = 26 }) {
  const c = CORES[corId];
  return (
    <button type="button" onClick={onClick} title={c.nome} aria-label={`Cor ${c.nome}`} aria-pressed={ativa}
      className={`rounded-full border transition-all duration-200 ${ativa ? "border-cacau scale-110" : "border-cacau/20 hover:border-cacau/60"}`}
      style={{ width: tamanho, height: tamanho, padding: 3 }}>
      <span className="block w-full h-full rounded-full" style={{ background: c.hex }} />
    </button>
  );
}

function CardProduto({ produto, onAbrir, indice = 0 }) {
  const fotos = IMAGES.produtos[produto.id] || [];
  return (
    <article className="group">
      <button type="button" onClick={() => onAbrir(produto)} className="w-full text-left">
        <div className="relative aspect-[3/4] overflow-hidden bg-areia">
          <div className="w-full h-full transition-transform duration-700 group-hover:scale-[1.04]">
            <Foto src={fotos[0]} alt={`Biquíni ${produto.nome}`} semente={indice} className="w-full h-full" />
          </div>
          <span className="absolute left-4 top-4 bg-offwhite/90 backdrop-blur px-3 py-1 text-[11px] tracking-[0.12em] text-cacau">
            {produto.modelagem}
          </span>
        </div>
        <div className="pt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[22px] font-light">{produto.nome}</h3>
          <span className="text-[15px]">{brl(produto.preco)}</span>
        </div>
        <p className="text-[13px] text-cacau/55 mt-1">
          {brl(comPix(produto.preco))} no Pix · {CONFIG.parcelas}x de {brl(parcela(produto.preco))}
        </p>
      </button>
      <div className="flex items-center gap-2 mt-3">
        {produto.cores.map((c) => (
          <span key={c} title={CORES[c].nome} className="w-3.5 h-3.5 rounded-full border border-cacau/15" style={{ background: CORES[c].hex }} />
        ))}
        <button type="button" onClick={() => onAbrir(produto)}
          className="ml-auto text-[12px] tracking-[0.12em] text-terra hover:text-terraesc border-b border-terra/40 pb-0.5 transition-colors">
          Escolher tamanho
        </button>
      </div>
    </article>
  );
}

/* =========================================================================
   8. CABEÇALHO
   ========================================================================= */
function Cabecalho({ pagina, irPara, contagem, abrirCarrinho, abrirBusca }) {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const links = [
    ["inicio", "Início"], ["biquinis", "Biquínis"], ["colecao", "Coleções"],
    ["sobre", "Sobre nós"], ["contato", "Contato"],
  ];

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useTravaScroll(menuAberto);

  const navegar = (destino) => { setMenuAberto(false); irPara(destino); };

  return (
    <>
      <header className={`fixed left-0 right-0 z-40 transition-colors duration-500 ${rolou || pagina !== "inicio" ? "bg-offwhite/95 backdrop-blur-md border-b border-cacau/10" : "bg-transparent"}`}
              style={{ top: 0, paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-[68px] flex items-center justify-between gap-4">
          <button type="button" onClick={() => navegar("inicio")} aria-label="CRZA, ir para a página inicial"
            className={`font-display text-[26px] md:text-[30px] tracking-[0.34em] font-normal pl-[0.34em] transition-colors ${rolou || pagina !== "inicio" ? "text-cacau" : "text-offwhite"}`}>
            CRZA
          </button>

          <nav className="hidden md:flex items-center gap-9" aria-label="Principal">
            {links.map(([id, rotulo]) => (
              <button key={id} type="button" onClick={() => navegar(id)}
                className={`text-[13px] tracking-[0.1em] pb-1 border-b transition-colors ${
                  pagina === id ? "border-terra" : "border-transparent hover:border-current"
                } ${rolou || pagina !== "inicio" ? "text-cacau" : "text-offwhite"}`}>
                {rotulo}
              </button>
            ))}
          </nav>

          <div className={`flex items-center gap-1 ${rolou || pagina !== "inicio" ? "text-cacau" : "text-offwhite"}`}>
            <button type="button" onClick={abrirBusca} aria-label="Buscar produtos" className="p-2.5 hover:opacity-60 transition-opacity">
              <IconeBusca tam={19} />
            </button>
            <button type="button" onClick={abrirCarrinho} aria-label={`Carrinho, ${contagem} ${contagem === 1 ? "item" : "itens"}`} className="p-2.5 relative hover:opacity-60 transition-opacity">
              <IconeSacola tam={19} />
              {contagem > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terra text-offwhite text-[10px] w-[18px] h-[18px] rounded-full grid place-items-center font-medium">
                  {contagem}
                </span>
              )}
            </button>
            <button type="button" onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="p-2.5 md:hidden hover:opacity-60 transition-opacity">
              <IconeMenu tam={20} />
            </button>
          </div>
        </div>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50 bg-cacau text-offwhite flex flex-col md:hidden" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="h-[68px] px-5 flex items-center justify-between">
            <span className="font-display text-[26px] tracking-[0.34em] pl-[0.34em]">CRZA</span>
            <button type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu" className="p-2.5"><IconeX tam={22} /></button>
          </div>
          <nav className="flex-1 flex flex-col justify-center gap-2 px-7" aria-label="Menu">
            {links.map(([id, rotulo], i) => (
              <button key={id} type="button" onClick={() => navegar(id)}
                className="font-display text-[38px] font-light text-left py-2 subir"
                style={{ animationDelay: `${i * 60}ms` }}>
                {rotulo}
              </button>
            ))}
          </nav>
          <div className="px-7 pb-8 flex items-center gap-4 text-offwhite/70">
            <a href={insta} target="_blank" rel="noopener noreferrer" className="p-2" aria-label="Instagram"><IconeInsta tam={20} /></a>
            <a href={zap(CONFIG.mensagemWhatsApp)} target="_blank" rel="noopener noreferrer" className="p-2" aria-label="WhatsApp"><IconeZap tam={20} /></a>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   9. HERO
   ========================================================================= */
function Hero({ irPara }) {
  return (
    <section className="relative min-h-[88svh] md:min-h-screen flex items-end overflow-hidden bg-cacau">
      <div className="absolute inset-0 revelar">
        <Foto src={IMAGES.hero} alt="Modelo usando biquíni CRZA na praia" semente={0} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-cacau/80 via-cacau/20 to-cacau/40" />
      </div>

      <div className="relative w-full max-w-[1280px] mx-auto px-5 md:px-10 pb-16 md:pb-24">
        <div className="max-w-[640px]">
          <Titulo nivel="h1" className="text-offwhite text-[46px] sm:text-[64px] md:text-[86px] subir" style={{ animationDelay: "200ms" }}>
            {CONFIG.heroTitulo.split("\n").map((linha, i) => <span key={i}>{linha}{i < CONFIG.heroTitulo.split("\n").length - 1 && <br />}</span>)}
          </Titulo>
          <p className="text-offwhite/80 text-[16px] md:text-[18px] leading-relaxed mt-6 max-w-[430px] subir" style={{ animationDelay: "340ms" }}>
            {CONFIG.heroTexto}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-9 subir" style={{ animationDelay: "460ms" }}>
            <Botao onClick={() => irPara("biquinis")} variante="cheio">Comprar agora</Botao>
            <Botao onClick={() => irPara("colecao")} variante="claro" className="bg-transparent text-offwhite border border-offwhite/40 hover:bg-offwhite hover:text-cacau">
              Ver a coleção
            </Botao>
          </div>
        </div>
      </div>

      <div className="absolute right-5 md:right-10 bottom-16 md:bottom-24 hidden sm:block text-offwhite/60 text-[12px] tracking-[0.2em] [writing-mode:vertical-rl]">
        CRZA · {CONFIG.cidade}
      </div>
    </section>
  );
}

/* =========================================================================
   10. SEÇÕES DA HOME
   ========================================================================= */
function Destaques({ onAbrir, irPara }) {
  const destaques = PRODUTOS.filter((p) => p.destaque);
  return (
    <section className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <div>
          <Titulo className="text-[36px] md:text-[52px]">Destaques</Titulo>
          <p className="text-cacau/60 mt-3 max-w-[420px] leading-relaxed">
            Os três cortes da linha Biquínis, feitos para repetir o verão inteiro.
          </p>
        </div>
        <button type="button" onClick={() => irPara("biquinis")}
          className="text-[13px] tracking-[0.12em] text-terra hover:text-terraesc border-b border-terra/40 pb-1 transition-colors">
          Ver todos os biquínis
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 md:gap-x-8">
        {destaques.map((p, i) => <CardProduto key={p.id} produto={p} onAbrir={onAbrir} indice={i} />)}
      </div>
    </section>
  );
}

function Identidade() {
  const pontos = [
    ["Tecido que aguenta o mar", "Poliamida com proteção UV 50+, forro duplo e costura reforçada. Cloro, sal e sol não abrem o tom."],
    ["Feito em pequena escala", "Cada corte sai em lote reduzido. Sem estoque parado, sem peça que ninguém quis."],
    ["Conforto que acompanha", "Modelagens pensadas para vestir bem, se mover com liberdade e continuar elegantes."],
  ];
  return (
    <section className="bg-areia">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28 grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-20 items-center">
        <div className="relative">
          <Foto src={IMAGES.sobre} alt="Detalhe de um biquíni CRZA" semente={2} className="aspect-[4/5] w-full" />
          <div className="absolute -bottom-6 -right-4 md:-right-8 bg-cacau text-offwhite px-7 py-6 max-w-[210px]">
            <p className="font-display text-[30px] leading-none">CRZA</p>
            <p className="text-offwhite/65 text-[13px] mt-2 leading-snug">De {CONFIG.cidade} para onde a moda levar.</p>
          </div>
        </div>
        <div>
          <Titulo className="text-[36px] md:text-[54px] max-w-[500px]">
            {CONFIG.identidadeTitulo}
          </Titulo>
          <p className="text-cacau/70 leading-relaxed mt-6 max-w-[520px]">
            {CONFIG.identidadeTexto}
          </p>
          <dl className="mt-10 space-y-7 max-w-[520px]">
            {pontos.map(([titulo, texto]) => (
              <div key={titulo} className="border-t border-cacau/15 pt-5">
                <dt className="font-display text-[21px] font-normal">{titulo}</dt>
                <dd className="text-cacau/65 text-[15px] leading-relaxed mt-1.5">{texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function BannerColecao({ irPara }) {
  return (
    <section className="relative overflow-hidden bg-cacau">
      <div className="absolute inset-0 opacity-70">
        <Foto src={IMAGES.colecao} alt="Nova coleção CRZA" semente={3} retrato={false} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-cacau via-cacau/70 to-cacau/25" />
      </div>
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 py-24 md:py-36">
        <div className="max-w-[520px]">
          <p className="text-terra text-[13px] tracking-[0.22em] mb-5">UMA MARCA EM MOVIMENTO</p>
          <Titulo className="text-offwhite text-[40px] md:text-[64px]">{CONFIG.colecaoTitulo}</Titulo>
          <p className="text-offwhite/75 leading-relaxed mt-5 max-w-[440px]">
            {CONFIG.colecaoTexto}
          </p>
          <div className="mt-9">
            <Botao onClick={() => irPara("colecao")} variante="cheio">Entrar na lista</Botao>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecaoInstagram() {
  return (
    <section className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
        <Titulo className="text-[32px] md:text-[46px]">No Instagram</Titulo>
        <a href={insta} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] tracking-[0.12em] text-terra hover:text-terraesc border-b border-terra/40 pb-1 transition-colors">
          <IconeInsta tam={16} /> @{CONFIG.instagram}
        </a>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {IMAGES.instagram.map((src, i) => (
          <a key={i} href={insta} target="_blank" rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden" aria-label={`Abrir o Instagram da CRZA, publicação ${i + 1}`}>
            <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
              <Foto src={src} alt="" semente={i + 1} retrato={false} className="w-full h-full" />
            </div>
            <span className="absolute inset-0 bg-cacau/0 group-hover:bg-cacau/35 transition-colors grid place-items-center text-offwhite opacity-0 group-hover:opacity-100">
              <IconeInsta tam={22} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   11. PÁGINA DE BIQUÍNIS (busca + filtros)
   ========================================================================= */
function PaginaBiquinis({ onAbrir, buscaInicial = "" }) {
  const [busca, setBusca] = useState(buscaInicial);
  const [modelagem, setModelagem] = useState("todas");
  const [cor, setCor] = useState("todas");
  const [ordem, setOrdem] = useState("relevancia");

  useEffect(() => { setBusca(buscaInicial); }, [buscaInicial]);

  const modelagens = ["todas", ...Array.from(new Set(PRODUTOS.map((p) => p.modelagem)))];

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let r = PRODUTOS.filter((p) => {
      const casaTermo = !termo || [p.nome, p.categoria, p.modelagem, p.descricao].join(" ").toLowerCase().includes(termo);
      const casaModelagem = modelagem === "todas" || p.modelagem === modelagem;
      const casaCor = cor === "todas" || p.cores.includes(cor);
      return casaTermo && casaModelagem && casaCor;
    });
    if (ordem === "menor") r = [...r].sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") r = [...r].sort((a, b) => b.preco - a.preco);
    return r;
  }, [busca, modelagem, cor, ordem]);

  const limparFiltros = () => { setBusca(""); setModelagem("todas"); setCor("todas"); setOrdem("relevancia"); };
  const filtrando = busca || modelagem !== "todas" || cor !== "todas";

  return (
    <div className="pt-[68px]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-14 md:pt-20">
        <Titulo nivel="h1" className="text-[42px] md:text-[64px]">Biquínis</Titulo>
        <p className="text-cacau/60 mt-3 max-w-[480px] leading-relaxed">
          Todas as peças com proteção UV 50+. Frete grátis acima de {brl(CONFIG.freteGratisAcima)}.
        </p>
      </div>

      <div className="sticky z-30 bg-offwhite/95 backdrop-blur border-y border-cacau/10 mt-10"
           style={{ top: "calc(68px + env(safe-area-inset-top, 0px))" }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[200px]">
            <span className="sr-only">Buscar biquínis</span>
            <IconeBusca tam={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cacau/40" />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou modelagem"
              className="w-full bg-transparent border border-cacau/20 rounded-full pl-10 pr-4 py-2.5 text-[14px] placeholder:text-cacau/40 focus:border-terra outline-none transition-colors" />
          </label>

          <div className="scroll-x flex items-center gap-2 max-w-full">
            {modelagens.map((m) => (
              <button key={m} type="button" onClick={() => setModelagem(m)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] border transition-colors ${
                  modelagem === m ? "bg-cacau text-offwhite border-cacau" : "border-cacau/20 hover:border-cacau/50"}`}>
                {m === "todas" ? "Todas as modelagens" : m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-1">
            <button type="button" onClick={() => setCor("todas")} title="Todas as cores" aria-pressed={cor === "todas"}
              className={`px-3 py-2 rounded-full text-[13px] border transition-colors ${cor === "todas" ? "bg-cacau text-offwhite border-cacau" : "border-cacau/20 hover:border-cacau/50"}`}>
              Cores
            </button>
            {Object.keys(CORES).map((c) => (
              <Amostra key={c} corId={c} ativa={cor === c} onClick={() => setCor(cor === c ? "todas" : c)} tamanho={24} />
            ))}
          </div>

          <label className="ml-auto flex items-center gap-2 text-[13px] text-cacau/60">
            <span className="sr-only sm:not-sr-only">Ordenar</span>
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)}
              className="bg-transparent border border-cacau/20 rounded-full px-3 py-2 text-cacau focus:border-terra outline-none">
              <option value="relevancia">Relevância</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <p className="text-[13px] text-cacau/50 mb-8">
          {lista.length} {lista.length === 1 ? "peça" : "peças"}
          {filtrando && <button type="button" onClick={limparFiltros} className="ml-3 text-terra border-b border-terra/40 pb-0.5">limpar filtros</button>}
        </p>

        {lista.length === 0 ? (
          <div className="py-20 text-center">
            <Titulo className="text-[28px]">Nada encontrado com esses filtros</Titulo>
            <p className="text-cacau/55 mt-3">Tente outra modelagem ou cor — ou limpe a busca para ver a vitrine inteira.</p>
            <div className="mt-7"><Botao variante="linha" onClick={limparFiltros}>Ver todas as peças</Botao></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 md:gap-x-8">
            {lista.map((p, i) => <CardProduto key={p.id} produto={p} onAbrir={onAbrir} indice={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   12. OUTRAS PÁGINAS
   ========================================================================= */
function PaginaColecao({ onAbrir, irPara }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const daColecao = PRODUTOS.filter((p) => p.destaque);

  const inscrever = () => {
    if (!email.includes("@")) return;
    setEnviado(true);
    setEmail("");
  };

  return (
    <div className="pt-[68px]">
      <section className="relative bg-cacau overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <Foto src={IMAGES.colecao} alt="" semente={3} retrato={false} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-cacau to-cacau/30" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 py-24 md:py-36">
          <Titulo nivel="h1" className="text-offwhite text-[44px] md:text-[76px]">Próximos capítulos</Titulo>
          <p className="text-offwhite/75 leading-relaxed mt-5 max-w-[460px]">
            A CRZA começa no beachwear e se expande para roupas leves, academia e novos momentos.
            Descubra o que já chegou e acompanhe o que vem depois.
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <Titulo className="text-[32px] md:text-[46px] mb-10">Peças já disponíveis</Titulo>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12 md:gap-x-8">
          {daColecao.map((p, i) => <CardProduto key={p.id} produto={p} onAbrir={onAbrir} indice={i + 3} />)}
        </div>
      </section>

      <section className="bg-areia">
        <div className="max-w-[720px] mx-auto px-5 md:px-10 py-20 md:py-24 text-center">
          <Titulo className="text-[32px] md:text-[44px]">Lista de espera</Titulo>
          <p className="text-cacau/65 mt-4 leading-relaxed">
            Quem está na lista compra dois dias antes e escolhe o tamanho primeiro.
          </p>
          {enviado ? (
            <p className="mt-8 text-terra">Pronto — você entrou na lista. Avisaremos sobre as novidades da CRZA.</p>
          ) : (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-[460px] mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inscrever()}
                placeholder="seu@email.com" aria-label="Seu e-mail"
                className="flex-1 bg-offwhite border border-cacau/15 rounded-full px-5 py-3.5 text-[14px] placeholder:text-cacau/40 focus:border-terra outline-none transition-colors" />
              <Botao onClick={inscrever}>Entrar na lista</Botao>
            </div>
          )}
          <p className="text-[12px] text-cacau/45 mt-5">
            Prefere no WhatsApp? <a href={zap("Quero receber novidades da CRZA.")} target="_blank" rel="noopener noreferrer" className="text-terra border-b border-terra/40">chama aqui</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

function PaginaSobre({ irPara }) {
  return (
    <div className="pt-[68px]">
      <section className="max-w-[1280px] mx-auto px-5 md:px-10 pt-16 md:pt-24 pb-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-start">
        <div>
          <Titulo nivel="h1" className="text-[42px] md:text-[68px] max-w-[520px]">Começamos pelo sentir.</Titulo>
          <div className="mt-8 space-y-5 text-cacau/70 leading-relaxed max-w-[540px]">
            <p>
              A CRZA nasceu em {CONFIG.cidade} com uma ideia simples: criar moda que faça você se sentir linda, confortável e elegante.
              Começamos pelos biquínis, mas a CRZA foi pensada para crescer para outros momentos do seu dia.
            </p>
            <p>
              A estética da CRZA une azul-marinho, branco e formas limpas. Cada peça é pensada para ter presença sem abrir mão
              do conforto — porque se sentir bem também é parte da elegância.
            </p>
            <p>
              Nossa história começa em Ouro Preto, mas não termina aqui. Beachwear, roupas leves, academia e novos capítulos
              fazem parte de uma marca construída para acompanhar diferentes versões de você.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Botao onClick={() => irPara("biquinis")}>Ver os biquínis</Botao>
            <Botao variante="linha" como="a" href={insta} target="_blank" rel="noopener noreferrer">Instagram</Botao>
          </div>
        </div>
        <Foto src={IMAGES.sobre} alt="Bastidores da CRZA" semente={1} className="aspect-[4/5] w-full" />
      </section>

      <section className="bg-areia">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-20 md:py-24">
          <Titulo className="text-[32px] md:text-[44px]">Tabela de medidas</Titulo>
          <p className="text-cacau/60 mt-3 max-w-[460px] leading-relaxed">
            Medidas do corpo em centímetros. Na dúvida entre dois tamanhos, vá no maior — o lastex acomoda.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-cacau/25 text-cacau/60 text-[13px]">
                  <th className="py-3 font-medium">Tamanho</th>
                  <th className="py-3 font-medium">Busto</th>
                  <th className="py-3 font-medium">Cintura</th>
                  <th className="py-3 font-medium">Quadril</th>
                </tr>
              </thead>
              <tbody>
                {MEDIDAS.map(([t, b, c, q]) => (
                  <tr key={t} className="border-b border-cacau/10">
                    <td className="py-3.5 font-display text-[18px]">{t}</td>
                    <td className="py-3.5">{b}</td>
                    <td className="py-3.5">{c}</td>
                    <td className="py-3.5">{q}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-cacau/50 mt-5">A modelo das fotos tem 1,72 m e veste M.</p>
        </div>
      </section>
    </div>
  );
}

function PaginaContato() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  const enviar = () => {
    if (!form.nome.trim()) return setErro("Escreva seu nome para a gente saber com quem fala.");
    if (!form.email.includes("@")) return setErro("Confira o e-mail — falta o @.");
    if (form.mensagem.trim().length < 5) return setErro("Conte um pouco mais na mensagem.");
    setErro("");
    setOk(true);
    window.open(zap(`Oi, sou ${form.nome}. ${form.mensagem}`), "_blank", "noopener");
  };

  const campo = "w-full bg-offwhite border border-cacau/15 rounded-2xl px-5 py-3.5 text-[15px] placeholder:text-cacau/40 focus:border-terra outline-none transition-colors";

  return (
    <div className="pt-[68px]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-14 lg:gap-24">
        <div>
          <Titulo nivel="h1" className="text-[42px] md:text-[64px]">Fala com a gente</Titulo>
          <p className="text-cacau/65 mt-5 leading-relaxed max-w-[420px]">
            Dúvida de tamanho, troca, encomenda em outra cor. Respondemos de segunda a sábado, das 9h às 19h.
          </p>
          <div className="mt-10 space-y-5">
            <a href={zap(CONFIG.mensagemWhatsApp)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 border-t border-cacau/15 pt-5 group">
              <span className="text-terra"><IconeZap tam={22} /></span>
              <span>
                <span className="block font-display text-[20px]">WhatsApp</span>
                <span className="block text-cacau/55 text-[14px] group-hover:text-terra transition-colors">Resposta mais rápida</span>
              </span>
            </a>
            <a href={insta} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 border-t border-cacau/15 pt-5 group">
              <span className="text-terra"><IconeInsta tam={22} /></span>
              <span>
                <span className="block font-display text-[20px]">@{CONFIG.instagram}</span>
                <span className="block text-cacau/55 text-[14px] group-hover:text-terra transition-colors">Novidades e bastidores</span>
              </span>
            </a>
            <div className="border-t border-cacau/15 pt-5">
              <p className="font-display text-[20px]">{CONFIG.email}</p>
              <p className="text-cacau/55 text-[14px]">{CONFIG.cidade} · envio para todo o Brasil</p>
            </div>
          </div>
        </div>

        <div className="bg-areia p-7 md:p-10 rounded-3xl">
          {ok ? (
            <div className="py-10 text-center">
              <Titulo className="text-[28px]">Mensagem a caminho</Titulo>
              <p className="text-cacau/65 mt-3">Abrimos o WhatsApp com o seu texto. Se não abriu, chame direto pelo botão ao lado.</p>
              <div className="mt-6"><Botao variante="linha" onClick={() => setOk(false)}>Escrever outra</Botao></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Titulo className="text-[26px] mb-2">Envie uma mensagem</Titulo>
              <label className="block">
                <span className="sr-only">Nome</span>
                <input className={campo} placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </label>
              <label className="block">
                <span className="sr-only">E-mail</span>
                <input type="email" className={campo} placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block">
                <span className="sr-only">Mensagem</span>
                <textarea rows="5" className={`${campo} resize-none`} placeholder="Como podemos ajudar?" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
              </label>
              {erro && <p className="text-terraesc text-[14px]">{erro}</p>}
              <Botao onClick={enviar} className="w-full">Enviar pelo WhatsApp</Botao>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   13. MODAL DE PRODUTO
   ========================================================================= */
function ModalProduto({ produto, aoFechar, aoAdicionar }) {
  const [tamanho, setTamanho] = useState(null);
  const [cor, setCor] = useState(produto ? produto.cores[0] : null);
  const [qtd, setQtd] = useState(1);
  const [aviso, setAviso] = useState("");
  const [addOk, setAddOk] = useState(false);

  useTravaScroll(!!produto);

  useEffect(() => {
    if (produto) { setTamanho(null); setCor(produto.cores[0]); setQtd(1); setAviso(""); setAddOk(false); }
  }, [produto]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  if (!produto) return null;
  const fotos = IMAGES.produtos[produto.id] || [];
  const indice = PRODUTOS.findIndex((p) => p.id === produto.id);
  const corAtual = produto.cores.includes(cor) ? cor : produto.cores[0];

  const adicionar = () => {
    if (!tamanho) { setAviso("Escolha um tamanho para continuar."); return; }
    aoAdicionar(produto, tamanho, corAtual, qtd);
    setAviso("");
    setAddOk(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={`Biquíni ${produto.nome}`}>
      <button type="button" className="absolute inset-0 bg-cacau/60 backdrop-blur-sm" onClick={aoFechar} aria-label="Fechar" />
      <div className="relative bg-offwhite w-full md:max-w-[900px] md:rounded-3xl max-h-[92svh] overflow-y-auto subir"
           style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button type="button" onClick={aoFechar} aria-label="Fechar"
          className="absolute right-4 top-4 z-10 bg-offwhite/90 backdrop-blur rounded-full p-2.5 hover:bg-areia transition-colors">
          <IconeX tam={18} />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="md:h-full">
            <Foto src={fotos[0]} alt={`Biquíni ${produto.nome}`} semente={indice} className="aspect-[4/5] md:aspect-auto md:h-full w-full" />
          </div>

          <div className="p-6 md:p-9">
            <p className="text-[12px] tracking-[0.16em] text-cacau/50">{produto.categoria} · {produto.modelagem}</p>
            <Titulo className="text-[34px] md:text-[42px] mt-2">{produto.nome}</Titulo>

            <div className="mt-4">
              <p className="text-[24px]">{brl(produto.preco)}</p>
              <p className="text-[14px] text-cacau/60 mt-1">
                {brl(comPix(produto.preco))} no Pix (5% off) · {CONFIG.parcelas}x de {brl(parcela(produto.preco))} sem juros
              </p>
            </div>

            <p className="text-cacau/70 leading-relaxed mt-6 text-[15px]">{produto.descricao}</p>
            <p className="text-cacau/50 text-[13px] mt-3">{produto.tecido} · bojo {produto.bojo ? "removível" : "sem bojo"}</p>

            <div className="mt-8">
              <p className="text-[13px] text-cacau/60 mb-3">Cor: <span className="text-cacau">{CORES[corAtual].nome}</span></p>
              <div className="flex items-center gap-3">
                {produto.cores.map((c) => <Amostra key={c} corId={c} ativa={corAtual === c} onClick={() => setCor(c)} tamanho={32} />)}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[13px] text-cacau/60 mb-3">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {TAMANHOS.map((t) => (
                  <button key={t} type="button" onClick={() => { setTamanho(t); setAviso(""); }} aria-pressed={tamanho === t}
                    className={`w-[54px] h-[44px] rounded-xl border text-[14px] transition-colors ${
                      tamanho === t ? "bg-cacau text-offwhite border-cacau" : "border-cacau/20 hover:border-cacau/60"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex items-center border border-cacau/20 rounded-full">
                <button type="button" onClick={() => setQtd(Math.max(1, qtd - 1))} aria-label="Diminuir quantidade" className="p-3 hover:text-terra transition-colors"><IconeMenos tam={16} /></button>
                <span className="w-8 text-center text-[15px]" aria-live="polite">{qtd}</span>
                <button type="button" onClick={() => setQtd(qtd + 1)} aria-label="Aumentar quantidade" className="p-3 hover:text-terra transition-colors"><IconeMais tam={16} /></button>
              </div>
              <Botao onClick={adicionar} className="flex-1">Adicionar à sacola</Botao>
            </div>

            {aviso && <p className="text-terraesc text-[14px] mt-3">{aviso}</p>}
            {addOk && <p className="text-terra text-[14px] mt-3">Adicionado à sacola.</p>}

            <p className="text-[13px] text-cacau/50 mt-6 border-t border-cacau/12 pt-5">
              Frete grátis acima de {brl(CONFIG.freteGratisAcima)} · troca em até 7 dias · envio em 2 dias úteis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   14. SACOLA
   ========================================================================= */
function Sacola({ aberta, aoFechar, carrinho, irPara }) {
  useTravaScroll(aberta);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  if (!aberta) return null;
  const { itens, mudarQtd, remover, total, limpar } = carrinho;
  const falta = Math.max(0, CONFIG.freteGratisAcima - total);

  const finalizar = () => {
    const linhas = itens.map((i) => `• ${i.nome} — ${i.tamanho} / ${CORES[i.cor].nome} · ${i.qtd}x · ${brl(i.preco * i.qtd)}`).join("\n");
    const texto = `Olá! Quero finalizar meu pedido na CRZA:\n\n${linhas}\n\nTotal: ${brl(total)}\nNo Pix (5% off): ${brl(comPix(total))}\nOu ${CONFIG.parcelas}x de ${brl(parcela(total))} sem juros`;
    window.open(zap(texto), "_blank", "noopener");
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sacola de compras">
      <button type="button" className="absolute inset-0 bg-cacau/55 backdrop-blur-sm" onClick={aoFechar} aria-label="Fechar sacola" />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-offwhite flex flex-col shadow-2xl"
             style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-cacau/10 shrink-0">
          <Titulo className="text-[24px]">Sua sacola</Titulo>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="p-2 hover:text-terra transition-colors"><IconeX tam={20} /></button>
        </div>

        {itens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <p className="text-cacau/55 leading-relaxed">Sua sacola está vazia. Comece pela linha Biquínis — três cortes, três tons.</p>
            <div className="mt-7"><Botao onClick={() => { aoFechar(); irPara("biquinis"); }}>Ver os biquínis</Botao></div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {falta > 0 && (
                <p className="text-[13px] bg-areia rounded-xl px-4 py-3 text-cacau/70">
                  Faltam {brl(falta)} para o frete grátis.
                </p>
              )}
              {itens.map((i) => {
                const indice = PRODUTOS.findIndex((p) => p.id === i.id);
                const fotos = IMAGES.produtos[i.id] || [];
                return (
                  <div key={i.chave} className="flex gap-4 border-b border-cacau/10 pb-5">
                    <Foto src={fotos[0]} alt={i.nome} semente={indice} className="w-[76px] h-[96px] shrink-0 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <h3 className="font-display text-[19px]">{i.nome}</h3>
                        <button type="button" onClick={() => remover(i.chave)} aria-label={`Remover ${i.nome}`} className="text-cacau/40 hover:text-terra transition-colors"><IconeX tam={16} /></button>
                      </div>
                      <p className="text-[13px] text-cacau/55 mt-0.5">Tam. {i.tamanho} · {CORES[i.cor].nome}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-cacau/20 rounded-full">
                          <button type="button" onClick={() => mudarQtd(i.chave, -1)} aria-label="Diminuir" className="p-2 hover:text-terra transition-colors"><IconeMenos tam={14} /></button>
                          <span className="w-7 text-center text-[14px]">{i.qtd}</span>
                          <button type="button" onClick={() => mudarQtd(i.chave, 1)} aria-label="Aumentar" className="p-2 hover:text-terra transition-colors"><IconeMais tam={14} /></button>
                        </div>
                        <span className="text-[15px]">{brl(i.preco * i.qtd)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button" onClick={limpar} className="text-[13px] text-cacau/45 hover:text-terra transition-colors">Esvaziar sacola</button>
            </div>

            <div className="border-t border-cacau/12 px-6 py-5 shrink-0 bg-areia/50">
              <div className="flex justify-between items-baseline">
                <span className="text-cacau/65 text-[14px]">Subtotal</span>
                <span className="text-[20px]">{brl(total)}</span>
              </div>
              <div className="mt-2 space-y-1 text-[13px] text-cacau/60">
                <p className="flex justify-between"><span>No Pix (5% de desconto)</span><span className="text-terra">{brl(comPix(total))}</span></p>
                <p className="flex justify-between"><span>No cartão</span><span>{CONFIG.parcelas}x de {brl(parcela(total))} sem juros</span></p>
              </div>
              <Botao onClick={finalizar} className="w-full mt-5">Finalizar pelo WhatsApp</Botao>
              <p className="text-[12px] text-cacau/45 text-center mt-3">Frete calculado na conversa, conforme o CEP.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* =========================================================================
   15. BUSCA EM SOBREPOSIÇÃO
   ========================================================================= */
function Busca({ aberta, aoFechar, onAbrirProduto, irParaBusca }) {
  const [termo, setTermo] = useState("");
  const ref = useRef(null);
  useTravaScroll(aberta);

  useEffect(() => {
    if (aberta) { setTermo(""); setTimeout(() => ref.current && ref.current.focus(), 60); }
  }, [aberta]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  if (!aberta) return null;

  const t = termo.trim().toLowerCase();
  const achados = t
    ? PRODUTOS.filter((p) => [p.nome, p.modelagem, p.categoria, p.descricao].join(" ").toLowerCase().includes(t))
    : PRODUTOS.filter((p) => p.destaque);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Buscar produtos">
      <button type="button" className="absolute inset-0 bg-cacau/60 backdrop-blur-sm" onClick={aoFechar} aria-label="Fechar busca" />
      <div className="relative bg-offwhite max-h-[85svh] overflow-y-auto" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8 py-7">
          <div className="flex items-center gap-3 border-b border-cacau/20 pb-4">
            <IconeBusca tam={22} className="text-cacau/40 shrink-0" />
            <input ref={ref} type="search" value={termo} onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && termo.trim()) { irParaBusca(termo); aoFechar(); } }}
              placeholder="Buscar biquínis"
              className="flex-1 bg-transparent text-[22px] md:text-[26px] font-display font-light placeholder:text-cacau/30 outline-none" />
            <button type="button" onClick={aoFechar} aria-label="Fechar" className="p-2 text-cacau/50 hover:text-terra transition-colors"><IconeX tam={20} /></button>
          </div>

          <p className="text-[12px] tracking-[0.14em] text-cacau/45 mt-6 mb-4">
            {t ? `${achados.length} ${achados.length === 1 ? "resultado" : "resultados"}` : "Mais procurados"}
          </p>

          {achados.length === 0 ? (
            <p className="text-cacau/55 py-8">Nada com esse nome. Tente “cortininha”, “Aura” ou “tomara que caia”.</p>
          ) : (
            <ul className="divide-y divide-cacau/10">
              {achados.map((p) => {
                const indice = PRODUTOS.findIndex((x) => x.id === p.id);
                const fotos = IMAGES.produtos[p.id] || [];
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => { aoFechar(); onAbrirProduto(p); }}
                      className="w-full flex items-center gap-4 py-3.5 text-left group">
                      <Foto src={fotos[0]} alt="" semente={indice} className="w-[56px] h-[70px] shrink-0 rounded-md" />
                      <span className="flex-1">
                        <span className="block font-display text-[20px]">{p.nome}</span>
                        <span className="block text-[13px] text-cacau/55">{p.modelagem} · {p.categoria}</span>
                      </span>
                      <span className="text-[15px]">{brl(p.preco)}</span>
                      <span className="text-cacau/30 group-hover:text-terra transition-colors"><IconeSeta tam={18} /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   16. RODAPÉ
   ========================================================================= */
function Rodape({ irPara }) {
  const ano = new Date().getFullYear();
  return (
    <footer className="bg-cacau text-offwhite">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-[30px] tracking-[0.34em] pl-[0.34em]">CRZA</p>
            <p className="text-offwhite/60 text-[14px] leading-relaxed mt-4 max-w-[260px]">
              Moda para sentir: beleza, conforto e elegância em cada capítulo. Nascida em {CONFIG.cidade}.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href={insta} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="border border-offwhite/25 rounded-full p-2.5 hover:bg-offwhite hover:text-cacau transition-colors"><IconeInsta tam={18} /></a>
              <a href={zap(CONFIG.mensagemWhatsApp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="border border-offwhite/25 rounded-full p-2.5 hover:bg-offwhite hover:text-cacau transition-colors"><IconeZap tam={18} /></a>
            </div>
          </div>

          <nav aria-label="Loja">
            <h2 className="text-[13px] tracking-[0.14em] text-offwhite/45 mb-4">Loja</h2>
            <ul className="space-y-2.5 text-[15px]">
              {[["biquinis", "Biquínis"], ["colecao", "CRZA — Novos capítulos"], ["sobre", "Tabela de medidas"]].map(([id, r]) => (
                <li key={r}><button type="button" onClick={() => irPara(id)} className="text-offwhite/75 hover:text-offwhite transition-colors">{r}</button></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ajuda">
            <h2 className="text-[13px] tracking-[0.14em] text-offwhite/45 mb-4">Ajuda</h2>
            <ul className="space-y-2.5 text-[15px] text-offwhite/75">
              <li><button type="button" onClick={() => irPara("contato")} className="hover:text-offwhite transition-colors">Contato</button></li>
              <li><a href={zap("Quero fazer uma troca.")} target="_blank" rel="noopener noreferrer" className="hover:text-offwhite transition-colors">Trocas e devoluções</a></li>
              <li><a href={zap("Quero rastrear meu pedido.")} target="_blank" rel="noopener noreferrer" className="hover:text-offwhite transition-colors">Rastrear pedido</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[13px] tracking-[0.14em] text-offwhite/45 mb-4">Pagamento e entrega</h2>
            <ul className="space-y-2.5 text-[15px] text-offwhite/75">
              <li>Pix com {Math.round(CONFIG.descontoPix * 100)}% de desconto</li>
              <li>Cartão em até {CONFIG.parcelas}x sem juros</li>
              <li>Frete grátis acima de {brl(CONFIG.freteGratisAcima)}</li>
              <li>Envio para todo o Brasil</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-offwhite/12 mt-14 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-offwhite/45">
          <p>© {ano} CRZA. Todos os direitos reservados.</p>
          <p>{CONFIG.email} · {CONFIG.cidade}</p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
   17. APP
   ========================================================================= */
const PAGINAS = ["inicio", "biquinis", "colecao", "sobre", "contato", "admin"];

function App() {
  const hashInicial = (window.location.hash || "").replace("#", "");
  const [pagina, setPagina] = useState(PAGINAS.includes(hashInicial) ? hashInicial : "inicio");
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [produtoAberto, setProdutoAberto] = useState(null);
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoCatalogo, setTermoCatalogo] = useState("");
  const carrinho = useCarrinho();

  const irPara = useCallback((destino) => {
    setPagina(destino);
    window.location.hash = destino;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || "").replace("#", "");
      if (PAGINAS.includes(h)) { setPagina(h); window.scrollTo({ top: 0, behavior: "auto" }); }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const abrirProduto = useCallback((p) => setProdutoAberto(p), []);

  const adicionar = useCallback((produto, tamanho, cor, qtd) => {
    carrinho.adicionar(produto, tamanho, cor, qtd);
  }, [carrinho]);

  const irParaBusca = useCallback((termo) => {
    setTermoCatalogo(termo);
    irPara("biquinis");
  }, [irPara]);

  const salvarDados = useCallback((novosDados) => {
    aplicarDados(novosDados);
    setDados(novosDados);
  }, []);

  if (pagina === "admin") {
    return <AdminLogin dados={dados} onSalvar={salvarDados} onVoltar={() => irPara("inicio")} />;
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Cabecalho
        pagina={pagina}
        irPara={irPara}
        contagem={carrinho.contagem}
        abrirCarrinho={() => setSacolaAberta(true)}
        abrirBusca={() => setBuscaAberta(true)}
      />

      <main>
        {pagina === "inicio" && (
          <>
            <Hero irPara={irPara} />
            <Destaques onAbrir={abrirProduto} irPara={irPara} />
            <Identidade />
            <BannerColecao irPara={irPara} />
            <SecaoInstagram />
          </>
        )}
        {pagina === "biquinis" && <PaginaBiquinis onAbrir={abrirProduto} buscaInicial={termoCatalogo} />}
        {pagina === "colecao"  && <PaginaColecao onAbrir={abrirProduto} irPara={irPara} />}
        {pagina === "sobre"    && <PaginaSobre irPara={irPara} />}
        {pagina === "contato"  && <PaginaContato />}
      </main>

      <Rodape irPara={irPara} />

      <a href={zap(CONFIG.mensagemWhatsApp)} target="_blank" rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed right-5 z-40 bg-terra text-offwhite rounded-full p-4 shadow-lg hover:bg-terraesc transition-colors"
        style={{ bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}>
        <IconeZap tam={24} />
      </a>

      <ModalProduto produto={produtoAberto} aoFechar={() => setProdutoAberto(null)} aoAdicionar={adicionar} />
      <Sacola aberta={sacolaAberta} aoFechar={() => setSacolaAberta(false)} carrinho={carrinho} irPara={irPara} />
      <Busca aberta={buscaAberta} aoFechar={() => setBuscaAberta(false)} onAbrirProduto={abrirProduto} irParaBusca={irParaBusca} />
    </div>
  );
}


export default App;
