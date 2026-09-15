function generatePixFromBase(amount: number): string {
  const basePix = "00020101021126440014BR.GOV.BCB.PIX0122doidasemeias@gmail.com5204000053039865802BR592555.764.543 JOSE ULISSES F6009SAO PAULO62080504daqr6304";
  
  // Tag 54 is transaction amount
  const amountStr = amount.toFixed(2);
  const amountLen = amountStr.length.toString().padStart(2, '0');
  const amountTag = `54${amountLen}${amountStr}`;
  
  // Insert amountTag right before 5802BR (Country Code)
  // basePix has 5303986 which ends at index:
  // 000201 (6) + 010211 (6=12) + 26440014BR.GOV.BCB.PIX0122doidasemeias@gmail.com (52=64) + 52040000 (8=72) + 5303986 (7=79)
  // Let's just do a string replace:
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

console.log(generatePixFromBase(50.00));
console.log(generatePixFromBase(1.00));
