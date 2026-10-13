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
