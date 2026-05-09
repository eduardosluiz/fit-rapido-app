import * as dns from 'dns';

/**
 * Esta é a Solução Atômica para o erro ENOTFOUND.
 * Ela intercepta as chamadas de rede da API e fornece o IP direto 
 * do Supabase, ignorando o DNS quebrado do servidor VPS.
 */
export function setupDnsOverride() {
  if (process.env.NODE_ENV !== 'production') return;

  const originalLookup = dns.lookup;

  // @ts-ignore
  dns.lookup = (hostname, options, callback) => {
    if (hostname.includes('supabase.co') || hostname.includes('supabase.com')) {
      console.log(`🎯 DNS Override: Redirecionando ${hostname} para 54.94.90.106`);
      // Retorna o IP direto da AWS São Paulo (Supabase)
      return (callback as any)(null, '54.94.90.106', 4);
    }
    return originalLookup(hostname, options as any, callback as any);
  };
  
  console.log('🚀 Sistema de Furo de DNS Ativado!');
}
