import * as dns from 'dns';

export function setupDnsOverride() {
  if (process.env.NODE_ENV !== 'production') return;

  const originalLookup = dns.lookup;

  // @ts-ignore
  dns.lookup = (hostname, options, callback) => {
    // Se o argumento options for omitido e callback for passado no lugar
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (hostname.includes('supabase.co') || hostname.includes('supabase.com')) {
      console.log(`🎯 DNS Override: Redirecionando ${hostname} para 54.94.90.106`);
      // No Node.js, o callback de dns.lookup espera (err, address, family)
      return callback(null, '54.94.90.106', 4);
    }
    
    return originalLookup(hostname, options, callback);
  };
  
  console.log('🚀 Sistema de Furo de DNS Ativado e Corrigido!');
}
