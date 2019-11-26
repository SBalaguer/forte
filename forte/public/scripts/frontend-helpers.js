function copyToClipboard() {

  const toBeCopied = document.getElementById("numbertocopy").innerText;

  toBeCopied.execCommand("copy");
}