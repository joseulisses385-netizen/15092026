import { QrCodePix } from 'qrcode-pix';
const qrCodePix = QrCodePix({
    version: '01',
    key: 'doidasemeias@gmail.com',
    name: 'Doidas e Meias',
    city: 'SAO PAULO',
    transactionId: 'TESTE123',
    value: 50.00,
});
console.log(qrCodePix.payload());
