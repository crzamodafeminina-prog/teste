import { useEffect, useState } from "react";
import Admin from "./Admin.jsx";

export default function AdminLogin({ dados, onSalvar, onVoltar }) {
  const [status, setStatus] = useState("carregando");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/admin-login", { credentials: "same-origin" })
      .then(r => r.json())
      .then(d => setStatus(d.authenticated ? "autenticado" : "login"))
      .catch(() => { setErro("Não foi possível verificar o acesso. Tente novamente."); setStatus("login"); });
  }, []);

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const r = await fetch("/api/admin-login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.error || "Não foi possível entrar."); return; }
      setSenha("");
      setStatus("autenticado");
    } catch { setErro("Não foi possível conectar ao servidor."); }
  };

  if (status === "carregando") return <div className="min-h-screen grid place-items-center bg-[#F7F8FA] text-[#071A33]">Verificando acesso…</div>;
  if (status === "autenticado") return <AdminWithLogout dados={dados} onSalvar={onSalvar} onVoltar={onVoltar} />;

  return <div className="min-h-screen grid place-items-center bg-[#F7F8FA] px-5 text-[#071A33]">
    <form onSubmit={entrar} className="w-full max-w-md rounded-3xl border border-[#071A33]/10 bg-white p-7 shadow-sm">
      <div className="font-serif text-3xl tracking-[.18em]">CRZA</div>
      <p className="mt-1 text-xs uppercase tracking-[.18em] text-[#071A33]/45">Área administrativa</p>
      <h1 className="mt-8 text-2xl font-medium">Acesso restrito</h1>
      <p className="mt-2 text-sm leading-6 text-[#071A33]/60">Digite a senha administrativa para editar a loja.</p>
      <label className="mt-6 block space-y-2"><span className="text-xs font-medium">Senha</span><input autoFocus type="password" value={senha} onChange={e => setSenha(e.target.value)} className="w-full rounded-xl border border-[#071A33]/12 px-4 py-3 outline-none focus:border-[#12345A]" /></label>
      {erro && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      <div className="mt-5 flex gap-2"><button type="button" onClick={onVoltar} className="flex-1 rounded-full border border-[#071A33]/15 px-5 py-3 text-xs font-medium tracking-[.12em]">VOLTAR À LOJA</button><button type="submit" className="flex-1 rounded-full bg-[#071A33] px-5 py-3 text-xs font-medium tracking-[.12em] text-white">ENTRAR</button></div>
    </form>
  </div>;
}

function AdminWithLogout({ dados, onSalvar, onVoltar }) {
  const Comp = Admin;
  return <div className="relative">
    <div className="fixed bottom-5 right-5 z-50"><button onClick={async () => { await fetch("/api/admin-login", { method: "DELETE", credentials: "same-origin" }); window.location.reload(); }} className="rounded-full border border-[#071A33]/15 bg-white px-4 py-2 text-xs shadow-sm">Sair do painel</button></div>
    <Comp dados={dados} onSalvar={onSalvar} onVoltar={onVoltar} />
  </div>;
}
