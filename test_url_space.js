const url = ' javascript:alert(1)';
console.log('trim:', new URL(url.trim()).protocol);
console.log('replace:', new URL(url.replace(/[\n\r\t ]/g, '')).protocol);

const malicious2 = 'java\nscript:alert(1)';
try {
  console.log('malicious2 trim:', new URL(malicious2.trim()).protocol);
} catch (e) {
  console.log('malicious2 trim throws');
}
try {
  console.log('malicious2 replace:', new URL(malicious2.replace(/[\n\r\t ]/g, '')).protocol);
} catch (e) {
  console.log('malicious2 replace throws');
}

const legitimate = 'https://evzone.com/foo bar';
try {
  console.log('legit trim:', new URL(legitimate.trim()).toString());
} catch(e) {}
try {
  console.log('legit replace:', new URL(legitimate.replace(/[\n\r\t ]/g, '')).toString());
} catch(e) {}
