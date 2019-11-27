function copyToClipboard(a) {
  let copy = "iban-" + a
  document.getElementById(copy).select();
  document.execCommand('copy');


}