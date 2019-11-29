document.addEventListener("click", e => {

  if (e.target.id === "copy-clipboard") {
    e.srcElement.parentElement.parentElement.querySelector("input").select();
    document.execCommand('copy');
  }

})