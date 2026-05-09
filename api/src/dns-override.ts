import * as dns from 'dns';

export function setupDnsOverride() {
  if (process.env.NODE_ENV !== 'production') return;

  const originalLookup = dns.lookup;

  // @ts-ignore
  dns.lookup = (hostname, options, callback) => {
    let actualOptions = options;
    let actualCallback = callback;

    if (typeof options === 'function') {
      actualCallback = options;
      actualOptions = {};
    }

    if (hostname.includes('supabase.co') || hostname.includes('supabase.com')) {
      const ip = '54.94.90.106';
      console.log(`🎯 DNS Override: ${hostname} -> ${ip}`);
      
      // @ts-ignore
      if (actualOptions && actualOptions.all) {
        return actualCallback(null, [{ address: ip, family: 4 }]);
      }
      return actualCallback(null, ip, 4);
    }
    
    return originalLookup(hostname, options, callback);
  };
  
  console.log('🚀 Sistema de Furo de DNS Ativado e Robusto!');
}
