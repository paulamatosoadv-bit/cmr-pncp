exports.handler = async function(event) {
  const qs = event.queryStringParameters || {};
  const codigo = qs.codigoCompra;
  const endpoint = qs.endpoint || 'contratacao';
  const numeroItem = qs.numeroItem || '';

  let url;
  if (endpoint === 'contratacao') {
    url = `https://dadosabertos.compras.gov.br/modulo-contratacao/5_consultarContratacao?codigoCompra=${codigo}&pagina=1`;
  } else if (endpoint === 'itens') {
    url = `https://dadosabertos.compras.gov.br/modulo-contratacao/6_consultarItensContratacao?codigoCompra=${codigo}&pagina=1&tamanhoPagina=500`;
  } else if (endpoint === 'resultados') {
    url = `https://dadosabertos.compras.gov.br/modulo-contratacao/7_consultarResultadoItemContratacao?codigoCompra=${codigo}&numeroItem=${numeroItem}&pagina=1&tamanhoPagina=500`;
  }

  if (!url) return { statusCode: 400, headers: {'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({error:'Parâmetros inválidos'}) };

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await resp.text();
    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: data
    };
  } catch(e) {
    return { statusCode: 500, headers: {'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({error: e.message}) };
  }
};
