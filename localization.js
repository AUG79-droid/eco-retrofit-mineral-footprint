(function(){
"use strict";
const p=new URLSearchParams(location.search);
const req=p.get("hubLang")||p.get("lang");
const lang=req==="en"?"en":"es";
document.documentElement.lang=lang;

const exact=new Map([
  ...(window.MF_ES_1||[]),
  ...(window.MF_ES_2||[]),
  ...(window.MF_ES_3||[]),
  ...(window.MF_ES_4||[])
]);

const partial=[
  ["Back to Sustainability Hub","Volver al Sustainability Hub"],
  ["Stage ","Etapa "],
  ["Learning checkpoint ","Punto de aprendizaje "],
  ["How to Play","Cómo jugar"],
  ["Knowledge Base","Base de conocimiento"],
  ["Score","Puntuación"],
  ["Continue","Continuar"],
  ["Evaluate","Evaluar"],
  ["Back","Volver"],
  ["Open source","Abrir fuente"],["A400M cockpit context · Wikimedia Commons / UK MOD imagery","Contexto de cabina A400M · Wikimedia Commons / imágenes del UK MOD"]
];

function tr(v){
  if(lang!=="es"||!v)return v;
  const t=v.trim();
  if(exact.has(t))return v.replace(t,exact.get(t));
  let o=v;
  for(const [a,b] of partial)o=o.split(a).join(b);
  return o;
}

function walk(root){
  if(lang!=="es"||!root)return;
  if(root.nodeType===3){
    const x=tr(root.nodeValue);
    if(x!==root.nodeValue)root.nodeValue=x;
    return;
  }
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){
    if(!n.parentElement||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(n.parentElement.tagName))continue;
    const x=tr(n.nodeValue);
    if(x!==n.nodeValue)n.nodeValue=x;
  }
  root.querySelectorAll?.("[title],[aria-label],[alt],[placeholder],[data-guide]").forEach(el=>{
    for(const a of ["title","aria-label","alt","placeholder","data-guide"]){
      if(el.hasAttribute(a))el.setAttribute(a,tr(el.getAttribute(a)));
    }
  });
}

function addLanguageControl(){
  if(document.getElementById("mf-language-control"))return;
  const box=document.createElement("div");
  box.id="mf-language-control";
  box.setAttribute("role","group");
  box.setAttribute("aria-label",lang==="es"?"Idioma":"Language");
  box.innerHTML='<button type="button" data-l="es">ES</button><span>|</span><button type="button" data-l="en">EN</button>';
  box.style.cssText="position:fixed;z-index:2147483647;top:12px;right:12px;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#071b33;color:#fff;border:2px solid rgba(255,255,255,.75);font:800 12px/1 system-ui,sans-serif;box-shadow:0 5px 18px rgba(0,0,0,.3)";
  box.querySelectorAll("button").forEach(b=>{
    b.style.cssText="border:0;background:transparent;color:#fff;font:inherit;cursor:pointer;padding:2px 4px";
    b.setAttribute("aria-pressed",b.dataset.l===lang?"true":"false");
    if(b.dataset.l===lang)b.style.textDecoration="underline";
    b.onclick=()=>{
      const u=new URL(location.href);
      u.searchParams.set("hubLang",b.dataset.l);
      location.href=u.toString();
    };
  });
  document.body.appendChild(box);
}

function chooseSpanishVoice(){
  const voices=speechSynthesis.getVoices();
  return voices.find(v=>/^es[-_]/i.test(v.lang))||voices[0];
}

function init(){
  if(lang==="es"){
    document.title=tr(document.title);
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute("content",tr(meta.getAttribute("content")));
    walk(document.body);
  }
  addLanguageControl();

  if(lang==="es"){
    const target=document.querySelector(".shell")||document.body;
    let queued=false;
    const pending=new Set();
    const flush=()=>{
      queued=false;
      const nodes=[...pending];
      pending.clear();
      nodes.forEach(walk);
    };
    const obs=new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==="characterData"&&m.target)pending.add(m.target);
        for(const n of m.addedNodes)pending.add(n);
      }
      if(!queued){
        queued=true;
        queueMicrotask(flush);
      }
    });
    obs.observe(target,{subtree:true,childList:true,characterData:true});

    document.addEventListener("click",ev=>{
      const btn=ev.target.closest?.("#speakBtn");
      if(!btn)return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(!("speechSynthesis" in window))return;
      speechSynthesis.cancel();
      const msg=document.getElementById("avatarMsg")?.textContent||"";
      const u=new SpeechSynthesisUtterance(msg);
      u.lang="es-ES";
      u.rate=.95;
      u.pitch=.9;
      const voice=chooseSpanishVoice();
      if(voice)u.voice=voice;
      const avatar=document.getElementById("avatarImg");
      u.onstart=()=>avatar?.classList.add("speaking");
      u.onend=()=>avatar?.classList.remove("speaking");
      u.onerror=()=>avatar?.classList.remove("speaking");
      speechSynthesis.speak(u);
    },true);
  }
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();