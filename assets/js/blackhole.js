// called when page loads and sets up event handlers
function pageLoad() {
    alert("a");
    document.getElementById("start").onclick = show("start-page", "game-page");
    alert("b");
    document.getElementById("finish").onclick = show("game-page", "start-page");
}


function show(shown, hidden) {
    alert("la");
  document.getElementById(shown).style.display='block';
  alert("sa");
  document.getElementById(hidden).style.display='none';
}

window.onload = pageLoad;
