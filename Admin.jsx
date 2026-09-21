import { useState } from "react";

const SUPABASE_URL = "https://rwtgxlncaxddtznbapwz.supabase.co";
const SUPABASE_KEY = "sb_publishable_x0Uo41P_BbBFOmiKWbh2dQ_VyLByuFi";

const clone = (x) => JSON.parse(JSON.stringify(x));

const brl = (n) =>
  Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

async function supabaseFetch(tabela, opcoes = {}) {
  const resposta = await fetch(
    `${SUPABASE_URL}/rest/v1/${tabela}`,
    {
      ...opcoes,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(opcoes.headers || {}),
      },
    }
  );

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(erro || `Erro ${resposta.status}`);
  }

  if (resposta.status === 204) return null;

  return resposta.json();
}
function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#071A33]/65">
        {label}
      </span>

      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]"
      />
    </label>
  );
}

function Area({ label, value, onChange, rows = 5 }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#071A33]/65">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]"
      />
    </label>
  );
}

function Botao({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-3 text-xs font-medium tracking-[.12em] transition ${
        secondary
          ? "border border-[#071A33]/15 bg-white hover:bg-[#F7F8FA]"
          : "bg-[#071A33] text-white hover:bg-[#12345A]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
export default function Admin({ dados, onSalvar, onVoltar }) {
  const [aba, setAba] = useState("inicio");
  const [local, setLocal] = useState(() => clone(dados));
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [selecionado, setSelecionado] = useState(
    local.produtos[0]?.id || null
  );

  const produto = local.produtos.find(
    (p) => p.id === selecionado
  );

  const atualizar = (chave, valor) =>
    setLocal((d) => ({
      ...d,
      [chave]: valor,
    }));

  const config = (chave, valor) =>
    setLocal((d) => ({
      ...d,
      config: {
        ...d.config,
        [chave]: valor,
      },
    }));

  const imagem = (chave, valor) =>
    setLocal((d) => ({
      ...d,
      images: {
        ...d.images,
        [chave]: valor,
      },
    }));

  const editarProduto = (campo, valor) =>
    setLocal((d) => ({
      ...d,
      produtos: d.produtos.map((p) =>
        p.id === selecionado
          ? {
              ...p,
              [campo]: valor,
            }
          : p
      ),
    }));
function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#071A33]/65">
        {label}
      </span>

      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]"
      />
    </label>
  );
}

function Area({ label, value, onChange, rows = 5 }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#071A33]/65">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-xl border border-[#071A33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#12345A]"
      />
    </label>
  );
}

function Botao({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-3 text-xs font-medium tracking-[.12em] transition ${
        secondary
          ? "border border-[#071A33]/15 bg-white hover:bg-[#F7F8FA]"
          : "bg-[#071A33] text-white hover:bg-[#12345A]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

