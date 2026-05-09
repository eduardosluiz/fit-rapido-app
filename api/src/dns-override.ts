import * as dns from 'dns';

/**
 * Versão Final e Definitiva do Furo de DNS.
 * Mapeia o host do Pooler para o IP da AWS São Paulo.
 */
export function setupDnsOverride() {
  if (process.env.NODE_ENV !== 'production') return;

  const originalLookup = dns.lookup;
  const SUPABASE_IP = '54.94.90.106';

  // @ts-ignore
  dns.lookup = (hostname, options, callback) => {
    let actualOptions = options;
    let actualCallback = callback;

    if (typeof options === 'function') {
      actualCallback = options;
      actualOptions = {};
    }

    // Se for QUALQUER coisa do supabase, mandamos para o IP da AWS SP
    if (hostname.includes('supabase.co') || hostname.includes('supabase.com')) {
      console.log(`🎯 DNS FIXED: ${hostname} -> ${SUPABASE_IP}`);
      
      // @ts-ignore
      if (actualOptions && actualOptions.all) {
        return actualCallback(null, [{ address: SUPABASE_IP, family: 4 }]);
      }
      return actualCallback(null, SUPABASE_IP, 4);
    }
    
    return originalLookup(hostname, options, actualCallback);
  };
  
  console.log('🚀 Sistema de Furo de DNS Ativado (Versão Final)!');
}
