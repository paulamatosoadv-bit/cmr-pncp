// v2 exports.handler = async function(event) {
  const qs = event.queryStringParameters || {};
  const cnpj = qs.cnpj || '';
  const ano = qs.ano || '';
  const seq = qs.seq || '';
  const endpoint = qs.endpoint || 'contratacao';
  const numeroItem = qs.numeroItem || '';
  const captchaToken = qs.captchaToken || '';

  const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';
  const PNCP_V1   = 'https://pncp.gov.br/api/pncp/v1';
  const CNET_BASE = 'https://cnetmobile.estaleiro.serpro.gov.br/comprasnet-fase-externa/public/v1';

  let url;

  if (endpoint === 'contratacao') {
    url = `${PNCP_BASE}/orgaos/${cnpj}/compras/${ano}/${seq}`;
  } else if (endpoint === 'itens') {
    url = `${PNCP_V1}/orgaos/${cnpj}/compras/${ano}/${seq}/itens?pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'resultados') {
    url = `${PNCP_V1}/orgaos/${cnpj}/compras/${ano}/${seq}/itens/${numeroItem}/resultados?pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'lances') {
    // Busca lances em disputa via Compras.gov.br usando captcha token
    if (!captchaToken) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Token do captcha necessário para buscar lances em disputa.' })
      };
    }
    // Buscar código da compra pelo número de controle PNCP
    const codigoCompra = qs.codigoCompra || '';
    url = `${CNET_BASE}/compras/${codigoCompra}/itens/${numeroItem}/propostas?captcha=${captchaToken}`;
  } else if (endpoint === 'compra-cnet') {
    // Buscar dados gerais da compra no Comprasnet com captcha
    if (!captchaToken) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Token do captcha necessário.' })
      };
    }
    const codigoCompra = qs.codigoCompra || '';
    url = `${CNET_BASE}/compras/${codigoCompra}?captcha=${captchaToken}`;
  }

  if (!url) return {
    statusCode: 400,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: 'Parâmetros inválidos' })
  };

  try {
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-device-platform': 'web',
        'x-version-number': '6.0.2',
        'Origin': 'https://cnetmobile.estaleiro.serpro.gov.br',
        'Referer': 'https://cnetmobile.estaleiro.serpro.gov.br/'
      }
    });
    const data = await resp.text();
    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
