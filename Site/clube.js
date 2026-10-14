// Clube Pugs Aventuras - conexão com o Supabase (chave publicável: pode ficar no site)
const PUGS_SUPABASE_URL = "https://jetaoirpqdshtwtmetpp.supabase.co";
const PUGS_SUPABASE_KEY = "sb_publishable_om_UVpQlJYwu4EoBVOuUEg_j6oMbCWL";
const pugs = window.supabase.createClient(PUGS_SUPABASE_URL, PUGS_SUPABASE_KEY);
const PUGS_ZAP = "16505825298";

function pugsErro(e) {
  const m = (e && (e.message || e.error_description || String(e))) || "";
  const t = m.toLowerCase();
  if (t.includes("invalid login")) return "E-mail ou senha não conferem. Confira e tente de novo.";
  if (t.includes("email not confirmed")) return "Falta confirmar o e-mail: abra o e-mail que mandamos (olhe também o spam) e clique no link.";
  if (t.includes("already registered") || t.includes("already been registered")) return "Esse e-mail já tem cadastro. Use a aba \"Já tenho conta\".";
  if (t.includes("password") && t.includes("6")) return "A senha precisa ter pelo menos 6 letras ou números.";
  if (t.includes("rate limit") || t.includes("security purposes")) return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (t.includes("invalid") && t.includes("email")) return "Esse e-mail parece estar escrito errado.";
  return "Ops, algo deu errado: " + m;
}
function pugsData(d) {
  if (!d) return "";
  const x = new Date(d);
  return x.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// Confere se a família pode usar o Clube (teste grátis ou assinatura valendo)
async function pugsAcesso() {
  const { data: s } = await pugs.auth.getSession();
  if (!s.session) return { login: false, ok: false };
  const { data } = await pugs.from("familias").select("*").eq("id", s.session.user.id).single();
  if (!data) return { login: true, ok: false };
  const hoje = new Date().toISOString().slice(0, 10);
  const pago = ["mensal", "anual", "cortesia"].includes(data.assinatura) && data.assinatura_ate && data.assinatura_ate >= hoje;
  const teste = new Date(data.teste_ate) > new Date();
  return { login: true, ok: pago || teste, familia: data };
}
async function pugsSoNoClube() {
  const a = await pugsAcesso();
  if (!a.login) { location.href = "entrar.html#entrar"; return null; }
  if (!a.ok) { location.href = "clube.html"; return null; }
  return a.familia;
}

// Idade a partir da data de nascimento (AAAA-MM-DD)
function pugsIdade(nasc) {
  if (!nasc) return null;
  const [a, m, d] = nasc.split("-").map(Number), h = new Date();
  let i = h.getFullYear() - a; if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) i--;
  return i;
}
// "Theo", "Theo e Lia", "Theo, Lia e Bia"
function pugsNomes(lista) {
  const n = lista.map((c) => c.nome).filter(Boolean);
  return n.length <= 1 ? (n[0] || "") : n.slice(0, -1).join(", ") + " e " + n[n.length - 1];
}
