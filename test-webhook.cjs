const https = require('https');

const data = JSON.stringify({
  trans_items: [{ item_id: 2986355 }],
  cus_email: "jeffersomlima.inf@hotmail.com",
  cus_name: "Jeferson Lima da Silva",
  trans_status_name: "Paga"
});

const options = {
  hostname: 'rwqiptuxjnnuoolxslio.supabase.co',
  port: 443,
  path: '/functions/v1/eduzz-webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status de Retorno: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error("Erro na requisição:", e);
});

req.write(data);
req.end();
