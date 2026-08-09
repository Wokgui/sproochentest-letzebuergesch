// V20.12 — récupération robuste des sauvegardes locales
(function(){
'use strict';
const VERSION='V20.12';
state=cleanState(state);
const previousRenderHome=window.renderHome;
window.renderHome=function(){
  state=cleanState(state);
  previousRenderHome();
  document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · sauvegarde sécurisée');
};
document.title='Sproochentest Lëtzebuergesch '+VERSION;
window.renderHome();
})();
