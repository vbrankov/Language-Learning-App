const fs = require('fs');
const forge = require('node-forge');

// Read the PFX file
const pfxData = fs.readFileSync('localhost.pfx');
const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxData.toString('binary')));
const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, 'password');

// Get certificate and private key
const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
const pkeyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

const cert = certBags[forge.pki.oids.certBag][0];
const pkey = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];

// Convert to PEM format
const certPem = forge.pki.certificateToPem(cert.cert);
const pkeyPem = forge.pki.privateKeyToPem(pkey.key);

// Write PEM files
fs.writeFileSync('localhost.pem', certPem);
fs.writeFileSync('localhost-key.pem', pkeyPem);

console.log('Certificates generated successfully!');
console.log('- localhost.pem (certificate)');
console.log('- localhost-key.pem (private key)');
