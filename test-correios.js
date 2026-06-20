const { rastrearEncomendas } = require('correios-brasil');

let codRastreio = ['PW826279930BR']; // Replace with a valid test code if you want, or just wait to see if the structure works.

rastrearEncomendas(codRastreio).then(response => {
  console.log(JSON.stringify(response, null, 2));
}).catch(err => console.error(err));
