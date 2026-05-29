exports.handler = async function(event) {
  const path = event.queryStringParameters?.path || '';
  const url = 'https://dadosabertos.compras.gov.br' + decodeURIComponent(path);

  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
