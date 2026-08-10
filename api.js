exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || {};
  const cnpj = qs.cnpj || '';
  const ano = qs.ano || '';
  const seq = qs.seq || '';
  const endpoint = qs.endpoint || 'contratacao';
  const numeroItem = qs.numeroItem || '';
  const captchaToken = qs.captchaToken || '';
  const codigoCompra = qs.codigoCompra || '';

  const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';
  const PNCP_V1   = 'https://pncp.gov.br/api/pncp/v1';
  const CNET_BASE = 'https://cnetmobile.estaleiro.serpro.gov.br/comprasnet-fase-externa/public/v1';

  let url;
  let headers = { 'Accept': 'application/json' };

  if (endpoint === 'contratacao') {
    url = `${PNCP_BASE}/orgaos/${cnpj}/compras/${ano}/${seq}`;
  } else if (endpoint === 'itens') {
    url = `${PNCP_V1}/orgaos/${cnpj}/compras/${ano}/${seq}/itens?pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'resultados') {
    url = `${PNCP_V1}/orgaos/${cnpj}/compras/${ano}/${seq}/itens/${numeroItem}/resultados?pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'lances') {
    if (!captchaToken) return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Token do captcha necessário.' }) };
    url = `${CNET_BASE}/compras/${codigoCompra}/itens/${numeroItem}/propostas?captcha=${captchaToken}`;
    headers = { ...headers, 'x-device-platform': 'web', 'x-version-number': '6.0.2', 'Origin': 'https://cnetmobile.estaleiro.serpro.gov.br', 'Referer': 'https://cnetmobile.estaleiro.serpro.gov.br/' };
  }

  if (!url) return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Parâmetros inválidos' }) };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const resp = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    
    const data = await resp.text();
    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: data
    };
  } catch(e) {
    return {
      statusCode: e.name === 'AbortError' ? 504 : 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.name === 'AbortError' ? 'API do governo não respondeu a tempo.' : e.message })
    };
  }
};
