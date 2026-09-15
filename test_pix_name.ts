import { createStaticPix } from 'pix-utils';

const name = 'jose ulisses felix da silva'.substring(0, 25).toUpperCase();
const pix = createStaticPix({
  merchantName: name,
  merchantCity: 'SAO PAULO',
  pixKey: 'doidasemeias@gmail.com',
  infoAdicional: 'Loja',
  transactionId: '***',
  transactionAmount: 50.00
});
console.log(pix.toBRCode());
