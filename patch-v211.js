// V20.11 — chargement immédiat et version cohérente
(function(){
'use strict';
const VERSION='V20.11';
const previousRenderHome=window.renderHome;
window.renderHome=function(){
  previousRenderHome();
  document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · chargement immédiat');
};
document.title='Sproochentest Lëtzebuergesch '+VERSION;
window.renderHome();
})();
