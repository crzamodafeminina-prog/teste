import { useMemo, useState } from "react";

const clone = (x) => JSON.parse(JSON.stringify(x));
const brl = (n) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Campo({ label, value, onChange, type = "text", placeholder = "" }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-[#071A33]/65">{label}</span><input value={value ?? ""} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} className="w-full rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]" /></label>;
}
function Area({ label, value, onChange, rows = 5 }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-[#071A33]/65">{label}</span><textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows} className="w-full resize-y rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]" /></label>;
}
function Botao({ children, onClick, secondary = false, type = "button" }) { return <button type={type} onClick={onClick} className={`rounded-full px-5 py-3 text-xs font-medium tracking-[.12em] transition ${secondary ? "border border-[#071A33]/15 bg-white hover:bg-[#F7F8FA]" : "bg-[#071A33] text-white hover:bg-[#12345A]"}`}>{children}</button>; }

export default function Admin({ dados, onSalvar, onVoltar }) {
  const [aba, setAba] = useState("inicio");
  const [local, setLocal] = useState(() => clone(dados));
  const [salvo, setSalvo] = useState(false);
  const [selecionado, setSelecionado] = useState(local.produtos[0]?.id || null);
  const produto = local.produtos.find(p => p.id === selecionado);

  const atualizar = (chave, valor) => setLocal(d => ({ ...d, [chave]: valor }));
  const config = (chave, valor) => setLocal(d => ({ ...d, config: { ...d.config, [chave]: valor } }));
  const imagem = (chave, valor) => setLocal(d => ({ ...d, images: { ...d.images, [chave]: valor } }));
  const salvar = () => { onSalvar(clone(local)); setSalvo(true); setTimeout(() => setSalvo(false), 2500); };
  const restaurar = () => { if (confirm("Restaurar os dados originais da CRZA? Isso apaga as alterações salvas neste navegador.")) { localStorage.removeItem("crza:site-data:v1"); window.location.reload(); } };

  const editarProduto = (campo, valor) => setLocal(d => ({ ...d, produtos: d.produtos.map(p => p.id === selecionado ? { ...p, [campo]: valor } : p) }));
  const excluirProduto = () => {
    if (!produto || !confirm(`Excluir ${produto.nome}?`)) return;
    const lista = local.produtos.filter(p => p.id !== produto.id);
    setLocal(d => ({ ...d, produtos: lista }));
    setSelecionado(lista[0]?.id || null);
  };
  const novoProduto = () => {
    const idBase = `produto-${Date.now()}`;
    const novo = { id: idBase, nome: "Novo produto", preco: 0, categoria: local.categorias[0] || "Biquínis", modelagem: "", cores: ["marinho"], tecido: "", bojo: false, destaque: false, descricao: "", imagens: [] };
    setLocal(d => ({ ...d, produtos: [...d.produtos, novo], images: { ...d.images, produtos: { ...d.images.produtos, [idBase]: [] } } }));
    setSelecionado(idBase);
  };
  const fotosProduto = local.images.produtos?.[selecionado] || [];
  const setFotos = (arr) => setLocal(d => ({ ...d, images: { ...d.images, produtos: { ...d.images.produtos, [selecionado]: arr } } }));

  const abas = [
    ["inicio", "Página inicial"], ["produtos", "Produtos"], ["imagens", "Imagens"], ["loja", "Loja"], ["categorias", "Categorias"], ["dados", "Dados"],
  ];

  return <div className="min-h-screen bg-[#F7F8FA] text-[#071A33]">
    <header className="sticky top-0 z-20 border-b border-[#071A33]/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div><div className="font-serif text-2xl tracking-[.18em]">CRZA</div><div className="text-[10px] uppercase tracking-[.18em] text-[#071A33]/45">Painel de edição</div></div>
        <div className="flex gap-2"><Botao secondary onClick={onVoltar}>Ver loja</Botao><Botao onClick={salvar}>{salvo ? "SALVO ✓" : "SALVAR ALTERAÇÕES"}</Botao></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[210px_1fr] lg:px-8">
      <aside className="h-fit rounded-2xl border border-[#071A33]/10 bg-white p-2 lg:sticky lg:top-24">
        {abas.map(([id,nome]) => <button key={id} onClick={() => setAba(id)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm ${aba === id ? "bg-[#071A33] text-white" : "hover:bg-[#F7F8FA]"}`}>{nome}</button>)}
        <div className="mt-5 border-t border-[#071A33]/10 pt-4"><button onClick={restaurar} className="w-full rounded-xl px-4 py-3 text-left text-xs text-red-600 hover:bg-red-50">Restaurar original</button></div>
      </aside>
      <main className="rounded-2xl border border-[#071A33]/10 bg-white p-5 sm:p-7">
        {aba === "inicio" && <div className="space-y-6"><div><h1 className="text-2xl font-medium">Página inicial</h1><p className="mt-1 text-sm text-[#071A33]/55">Edite os textos principais e as informações que aparecem na home.</p></div><div className="grid gap-5 md:grid-cols-2"><Campo label="Nome da marca" value={local.config.marca} onChange={v => config("marca",v)} /><Campo label="Cidade" value={local.config.cidade} onChange={v => config("cidade",v)} /></div><Campo label="Título principal da home (use \n para quebrar linha)" value={local.config.heroTitulo || ""} onChange={v => config("heroTitulo",v)} /><Area label="Texto principal da home" value={local.config.heroTexto || ""} onChange={v => config("heroTexto",v)} rows={4} /><Campo label="Título da seção institucional" value={local.config.identidadeTitulo || ""} onChange={v => config("identidadeTitulo",v)} /><Area label="Texto da seção institucional" value={local.config.identidadeTexto || ""} onChange={v => config("identidadeTexto",v)} rows={4} /><Campo label="Título da coleção" value={local.config.colecaoTitulo || ""} onChange={v => config("colecaoTitulo",v)} /><Area label="Texto da coleção" value={local.config.colecaoTexto || ""} onChange={v => config("colecaoTexto",v)} rows={4} /><div className="rounded-xl bg-[#F7F8FA] p-4 text-sm">As imagens da home podem ser trocadas na aba <b>Imagens</b>.</div></div>}

        {aba === "loja" && <div className="space-y-6"><div><h1 className="text-2xl font-medium">Dados da loja</h1><p className="mt-1 text-sm text-[#071A33]/55">Essas informações alimentam WhatsApp, Instagram, contato e pagamento.</p></div><div className="grid gap-5 md:grid-cols-2"><Campo label="WhatsApp (somente números)" value={local.config.whatsapp} onChange={v => config("whatsapp",v)} /><Campo label="Instagram (sem @)" value={local.config.instagram} onChange={v => config("instagram",v)} /><Campo label="E-mail" value={local.config.email} onChange={v => config("email",v)} /><Campo label="Cidade" value={local.config.cidade} onChange={v => config("cidade",v)} /><Campo label="Desconto no Pix (%)" type="number" value={Number(local.config.descontoPix || 0)*100} onChange={v => config("descontoPix", Number(v || 0)/100)} /><Campo label="Parcelas sem juros" type="number" value={local.config.parcelas} onChange={v => config("parcelas", Number(v || 1))} /><Campo label="Frete grátis acima de (R$)" type="number" value={local.config.freteGratisAcima} onChange={v => config("freteGratisAcima", Number(v || 0))} /></div><Area label="Mensagem padrão do WhatsApp" value={local.config.mensagemWhatsApp || "Oi! Vim pelo site da CRZA e tenho uma dúvida."} onChange={v => config("mensagemWhatsApp",v)} rows={3} /></div>}

        {aba === "categorias" && <div className="space-y-6"><div><h1 className="text-2xl font-medium">Categorias</h1><p className="mt-1 text-sm text-[#071A33]/55">Crie ou remova categorias para organizar os produtos.</p></div><div className="space-y-2">{local.categorias.map((cat,i) => <div key={`${cat}-${i}`} className="flex gap-2"><input value={cat} onChange={e => { const a=[...local.categorias]; a[i]=e.target.value; atualizar("categorias",a); }} className="flex-1 rounded-xl border border-[#071A33]/12 px-3 py-3 text-sm" /><button onClick={() => atualizar("categorias",local.categorias.filter((_,j)=>j!==i))} className="rounded-xl px-4 text-red-600 hover:bg-red-50">Excluir</button></div>)}</div><Botao onClick={() => atualizar("categorias",[...local.categorias,"Nova categoria"])}>+ ADICIONAR CATEGORIA</Botao></div>}

        {aba === "imagens" && <div className="space-y-7"><div><h1 className="text-2xl font-medium">Imagens</h1><p className="mt-1 text-sm text-[#071A33]/55">Cole o endereço público da imagem. Você pode trocar essas URLs quando quiser.</p></div><div className="space-y-5"><Campo label="Imagem principal (hero)" value={local.images.hero} onChange={v => imagem("hero",v)} placeholder="https://..." /><Campo label="Imagem da seção Sobre" value={local.images.sobre} onChange={v => imagem("sobre",v)} placeholder="https://..." /><Campo label="Imagem da coleção" value={local.images.colecao} onChange={v => imagem("colecao",v)} placeholder="https://..." /></div><div><h2 className="mb-3 font-medium">Instagram / galeria</h2><div className="grid gap-3 md:grid-cols-2">{local.images.instagram.map((x,i)=><Campo key={i} label={`Imagem ${i+1}`} value={x} onChange={v=>{const a=[...local.images.instagram];a[i]=v;imagem("instagram",a)}} placeholder="https://..." />)}</div></div></div>}

        {aba === "produtos" && <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-medium">Produtos</h1><p className="mt-1 text-sm text-[#071A33]/55">Tudo aqui pode ser alterado sem mexer no código.</p></div><Botao onClick={novoProduto}>+ NOVO PRODUTO</Botao></div><div className="grid gap-5 lg:grid-cols-[210px_1fr]"><div className="space-y-2">{local.produtos.map(p=><button key={p.id} onClick={()=>setSelecionado(p.id)} className={`w-full rounded-xl border px-4 py-3 text-left ${selecionado===p.id?"border-[#071A33] bg-[#071A33] text-white":"border-[#071A33]/10 hover:bg-[#F7F8FA]"}`}><div className="font-medium">{p.nome}</div><div className="text-xs opacity-60">{brl(p.preco)}</div></button>)}</div>{produto ? <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Campo label="Nome" value={produto.nome} onChange={v=>editarProduto("nome",v)} /><Campo label="Preço (R$)" type="number" value={produto.preco} onChange={v=>editarProduto("preco",Number(v||0))} /><Campo label="Modelagem" value={produto.modelagem} onChange={v=>editarProduto("modelagem",v)} /><Campo label="Tecido" value={produto.tecido} onChange={v=>editarProduto("tecido",v)} /><label className="block space-y-1.5"><span className="text-xs font-medium text-[#071A33]/65">Categoria</span><select value={produto.categoria} onChange={e=>editarProduto("categoria",e.target.value)} className="w-full rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm">{local.categorias.map(c=><option key={c}>{c}</option>)}</select></label><label className="flex items-center gap-3 rounded-xl border border-[#071A33]/10 p-3 text-sm"><input type="checkbox" checked={!!produto.destaque} onChange={e=>editarProduto("destaque",e.target.checked)} /> Mostrar como destaque</label></div><Area label="Descrição" value={produto.descricao} onChange={v=>editarProduto("descricao",v)} rows={5} /><div className="grid gap-5 md:grid-cols-2"><label className="flex items-center gap-3 rounded-xl border border-[#071A33]/10 p-3 text-sm"><input type="checkbox" checked={!!produto.bojo} onChange={e=>editarProduto("bojo",e.target.checked)} /> Possui bojo</label><Campo label="Cores (IDs separados por vírgula)" value={(produto.cores||[]).join(", ")} onChange={v=>editarProduto("cores",v.split(",").map(x=>x.trim()).filter(Boolean))} /></div><div><h2 className="mb-3 font-medium">Fotos do produto</h2><div className="space-y-2">{fotosProduto.map((url,i)=><div className="flex gap-2" key={i}><input value={url} onChange={e=>{const a=[...fotosProduto];a[i]=e.target.value;setFotos(a)}} placeholder="https://..." className="flex-1 rounded-xl border border-[#071A33]/12 px-3 py-3 text-sm" /><button onClick={()=>setFotos(fotosProduto.filter((_,j)=>j!==i))} className="px-3 text-red-600">×</button></div>)}</div><button onClick={()=>setFotos([...fotosProduto,""])} className="mt-3 rounded-xl border border-dashed border-[#071A33]/20 px-4 py-3 text-xs">+ adicionar foto</button></div><button onClick={excluirProduto} className="rounded-xl border border-red-200 px-4 py-3 text-xs text-red-600">Excluir produto</button></div> : <div className="rounded-xl bg-[#F7F8FA] p-6 text-sm">Nenhum produto cadastrado.</div>}</div></div>}

        {aba === "dados" && <div className="space-y-6"><div><h1 className="text-2xl font-medium">Configurações</h1><p className="mt-1 text-sm text-[#071A33]/55">Alguns campos avançados continuam usando os valores padrão da identidade CRZA.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6"><b>Importante:</b> esta primeira versão salva as alterações neste navegador. Isso permite editar a loja sem abrir o código. Para que as alterações sejam compartilhadas com todos os visitantes do site, o próximo passo é conectar o painel a um banco de dados (por exemplo, Supabase).</div><div className="rounded-2xl border border-[#071A33]/10 p-5"><div className="font-medium">Dados atualmente salvos</div><pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-[#071A33] p-4 text-[11px] text-white">{JSON.stringify(local,null,2)}</pre></div></div>}
      </main>
    </div>
  </div>;
}
