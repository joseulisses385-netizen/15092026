export function generateStaticPix(
  pixKey: string,
  merchantName: string,
  merchantCity: string,
  amount: number
): string {
  // Use the exact base PIX payload from Mercado Pago (without amount and without CRC)
  const basePix = "00020101021126440014BR.GOV.BCB.PIX0122doidasemeias@gmail.com5204000053039865802BR592555.764.543 JOSE ULISSES F6009SAO PAULO62080504daqr6304";
  
  // Tag 54 is transaction amount
  const amountStr = amount.toFixed(2);
  const amountLen = amountStr.length.toString().padStart(2, '0');
  const amountTag = `54${amountLen}${amountStr}`;
  
  // Insert amountTag right before 5802BR (Country Code)
  const payload = basePix.replace('53039865802BR', `5303986${amountTag}5802BR`);
  
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  crc = crc & 0xffff;
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  return payload + crcHex;
}
