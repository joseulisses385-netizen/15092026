import { createStaticPix } from 'pix-utils';
const pix = createStaticPix({
  merchantName: 'Doidas e Meias',
  merchantCity: 'SAO PAULO',
  pixKey: 'doidasemeias@gmail.com',
  infoAdicional: 'Pagamento',
  transactionId: 'TESTE123',
  transactionAmount: 50.00
});
console.log(pix.toBRCode());
