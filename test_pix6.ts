import { QrCodePix } from 'qrcode-pix';

const pix = QrCodePix({
    version: '01',
    key: 'doidasemeias@gmail.com',
    name: 'JOSE ULISSES FELIX DA SIL',
    city: 'SAO PAULO',
    transactionId: '***',
    value: 50.00,
});
console.log("PAYLOAD FROM qrcode-pix:");
console.log(pix.payload());
