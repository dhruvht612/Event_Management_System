const QRCode = require('qrcode');

async function generateQrDataUrl(payload) {
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return QRCode.toDataURL(json, { width: 256, margin: 2 });
}

module.exports = { generateQrDataUrl };
