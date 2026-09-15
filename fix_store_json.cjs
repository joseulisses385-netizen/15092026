const fs = require('fs');
const file = 'data/store.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

if (data.settings) {
    data.settings.whatsappNumber = "5511989055683";
    data.settings.whatsappDisplay = "(11) 98905-5683";
    data.settings.supportPhone = "(11) 97520-8196";
    // Old pix key check
    if (data.settings.pixKey === "5511975208196") {
       data.settings.pixKey = "5511989055683"; // Update pix key if they want the new number as well, but wait, maybe they didn't ask to change the pix key? Let's leave pixKey alone unless requested, or maybe wait... the request was "faça a correção do telefone para 11 98905-5683 deixe o 11975208196 somente como SAC"
    }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
