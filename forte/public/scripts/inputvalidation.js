function isValidIBANNumber(input) {
  var CODE_LENGTHS = {
    AD: 24,
    AE: 23,
    AT: 20,
    AZ: 28,
    BA: 20,
    BE: 16,
    BG: 22,
    BH: 22,
    BR: 29,
    CH: 21,
    CR: 21,
    CY: 28,
    CZ: 24,
    DE: 22,
    DK: 18,
    DO: 28,
    EE: 20,
    ES: 24,
    FI: 18,
    FO: 18,
    FR: 27,
    GB: 22,
    GI: 23,
    GL: 18,
    GR: 27,
    GT: 28,
    HR: 21,
    HU: 28,
    IE: 22,
    IL: 23,
    IS: 26,
    IT: 27,
    JO: 30,
    KW: 30,
    KZ: 20,
    LB: 28,
    LI: 21,
    LT: 20,
    LU: 20,
    LV: 21,
    MC: 27,
    MD: 24,
    ME: 22,
    MK: 19,
    MR: 27,
    MT: 31,
    MU: 30,
    NL: 18,
    NO: 15,
    PK: 24,
    PL: 28,
    PS: 29,
    PT: 25,
    QA: 29,
    RO: 24,
    RS: 22,
    SA: 24,
    SE: 24,
    SI: 19,
    SK: 24,
    SM: 27,
    TN: 24,
    TR: 26
  };
  var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
    code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
    digits;
  // check syntax and length
  if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
    return false;
  }
  // rearrange country code and check digits, and convert chars to ints
  digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
    return letter.charCodeAt(0) - 55;
  });
  // final check
  if (mod97(digits)) return true;
}

function mod97(string) {
  var checksum = string.slice(0, 2),
    fragment;
  for (var offset = 2; offset < string.length; offset += 7) {
    fragment = String(checksum) + string.substring(offset, offset + 7);
    checksum = parseInt(fragment, 10) % 97;
  }
  return checksum;
}
const ibanInput = document.getElementsByName("iban")[0];

ibanInput.addEventListener("keyup", (e) => {
  if (isValidIBANNumber(e.srcElement.value)) {

    document.getElementById("iban-hint").innerText = "IBAN is Valid";
    document.getElementById("submit").removeAttribute("disabled");
  } else {

    document.getElementById("iban-hint").innerText = "Please insert a valid IBAN";
    document.getElementById("submit").setAttribute("disabled");
  };
})

const chargeVat = document.getElementsByName("chargeVat");
console.log(chargeVat[0].checked);

chargeVat[0].addEventListener("change", (e) => {
  if (e.srcElement.checked) {
    document.getElementsByName("vatRate")[0].removeAttribute("hidden");
  } else {

    document.getElementsByName("vatRate")[0].setAttribute("hidden", "true");
  }

})

const retainIrs = document.getElementsByName("retainIrs");
console.log(retainIrs[0].checked);

retainIrs[0].addEventListener("change", (e) => {
  if (e.srcElement.checked) {
    document.getElementsByName("irsRate")[0].removeAttribute("hidden");
  } else {

    document.getElementsByName("irsRate")[0].setAttribute("hidden", "true");
  }

})