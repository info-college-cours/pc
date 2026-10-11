document.addEventListener("DOMContentLoaded",()=>{
  const btn=document.createElement("button");
  btn.type="button";
  btn.className="back-to-top";
  btn.setAttribute("aria-label","Retour en haut");
  btn.title="Retour en haut";
  btn.innerHTML="↑";
  document.body.appendChild(btn);
  const toggle=()=>btn.classList.toggle("is-visible",window.scrollY>350);
  window.addEventListener("scroll",toggle,{passive:true});
  toggle();
  btn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
});
