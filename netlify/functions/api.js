exports.handler = async function(event) {
  const qs = event.queryStringParameters || {};
  const cnpj = qs.cnpj || '';
  const ano = qs.ano || '';
  const seq = qs.seq || '';
  const endpoint = qs.endpoint || 'contratacao';
  const numeroItem = qs.numeroItem || '';

  let url;
  if (endpoint === 'contratacao') {
    url = `https://pncp.gov.br/api/consulta/v1/orgaos/${cnpj}/compras/${ano}/${seq}`;
  } else if (endpoint === 'itens') {
    url = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpj}/compras/${ano}/${seq}/itens?pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'resultados') {
    url = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpj}/compras/${ano}/${seq}/itens/${numeroItem}/resultados?pagina=1&tamanhoPagina=500`;
  }

  if (!url) return { statusCode: 400, headers: {'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({error:'Parâmetros inválidos'}) };

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await resp.text();
    return { statusCode: resp.status, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body: data };
  } catch(e) {
    return { statusCode: 500, headers: {'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({error: e.message}) };
  }
};
