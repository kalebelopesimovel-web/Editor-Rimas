
/******** referências ********/
const editor=document.getElementById("editor");
const meterPanel=document.getElementById("meterPanel");
const countChars=document.getElementById("countChars");
const countWords=document.getElementById("countWords");
const countLines=document.getElementById("countLines");

/*********** DICIONÁRIO DE RIMAS ***********/
const rhymeDict = {
  "ão": ["coração","visão","canção","mão","paisão","limão","melão","paixão"],
  "ar": ["amar","cantar","voar","pular","sonhar","falar","pesar","chorar"],
  "er": ["viver","saber","aprender","dizer","correr","mexer","beber"],
  "or": ["amor","dor","valor","temor","rumor","motor","rigor"],
  "im": ["assim","enfim","ruim","cem","bem","também","jardim","mim"],
};

/*********** contagem ***********/
function countSyllables(line){
  let l=line.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g,"")
     .replace(/[^a-z\s]/g,"");

  if(!l.trim())return 0;

  let vowels=l.match(/[aeiou]+/g);
  if(!vowels)return 0;

  let count=vowels.length;
  if(count>1)count--;
  return count;
}

function updateMeter(){
  let raw = editor.innerText||"";
  raw = raw.replace(/\r/g,"");

  let lines = raw.split("\n");
  while(lines.length>1 && !lines[lines.length-1].trim()){
    lines.pop();
  }

  meterPanel.textContent =
    lines.map(countSyllables).join("\n");

  const words = raw.match(/[a-záéíóúâêôãõç]+/gi) || [];
  const chars = (raw.match(/[a-záéíóúâêôãõç]/gi) || []).length;

  countLines.textContent = lines.length;
  countWords.textContent = words.length;
  countChars.textContent = chars;
}

editor.addEventListener("input",updateMeter);


/*********** marcar manual ***********/
let savedRange=null;
const paletteInline=document.getElementById("paletteInline");

function saveSelection(){
  let sel=window.getSelection();
  if(!sel||sel.isCollapsed)return null;
  return sel.getRangeAt(0).cloneRange();
}

function unwrap(root){
  root.querySelectorAll("span[data-manual]").forEach(
    s=>s.replaceWith(...s.childNodes)
  );
}

function applyColor(hex){
  if(!savedRange)return;
  let frag=savedRange.extractContents();
  unwrap(frag);

  let span=document.createElement("span");
  span.dataset.manual="1";
  span.style.background=hex;
  span.style.padding="1px 3px";
  span.appendChild(frag);

  savedRange.insertNode(span);
  savedRange=null;
  paletteInline.style.display="none";
}

btnMark.onclick=()=>{
  savedRange=saveSelection();
  if(savedRange) paletteInline.style.display="grid";
};
btnUnmark.onclick=()=>{
  savedRange=saveSelection();
  if(!savedRange)return;
  let frag=savedRange.extractContents();
  unwrap(frag);
  savedRange.insertNode(frag);
};

/******** paleta ********/
[
  "#ef4444","#fb923c","#facc15",
  "#4ade80","#06b6d4","#38bdf8",
  "#2563eb","#6366f1","#d946ef",
  "#f43f5e"
].forEach(hex=>{
  let d=document.createElement("div");
  d.className="color";
  d.style.background=hex;
  d.onclick=()=>applyColor(hex);
  paletteInline.appendChild(d);
});

/*********** AUTO-RIMAS SIMPLES ***********/
function normalize(t){
  return t.normalize("NFD")
          .replace(/[\u0300-\u036f]/g,"")
          .toLowerCase();
}

function getRhyme(word){
  let w=normalize(word);
  w=w.replace(/^[bcdfghjklmnpqrstvwxyz]+/,"");
  return w.slice(-3);
}

function removeAutoMarks(){
  editor.querySelectorAll("span.autoRima")
  .forEach(s=>s.replaceWith(...s.childNodes));
}

function autoMarkRimas(){

  removeAutoMarks();

  const palette=[
    "#ef4444","#fb923c","#facc15","#4ade80",
    "#06b6d4","#38bdf8","#2563eb","#6366f1"
  ];

  let groups={};
  let idx=0;

  let words = editor.innerText.match(/[a-záéíóúâêôãõç]+/gi) || [];

  words.forEach(w=>{
    let r=getRhyme(w);
    if(!groups[r]) groups[r]=palette[idx++ % palette.length];
  });

  walkApply((m)=>{
    let r=getRhyme(m);
    if(groups[r]){
      return `<span class="autoRima" style="background:${groups[r]};padding:1px 3px;border-radius:4px">${m}</span>`;
    }
    return m;
  });
}



/*********** AUTO-RIMAS FONÉTICO ***********/
function normalizePh(text){
  return text.normalize("NFD")
         .replace(/[\u0300-\u036f]/g,"")
         .toLowerCase();
}

function getPhonetic(word){

  let w = normalizePh(word).replace(/[^a-z]/g,"");

  const rules=[

    [/ão|am\b|an\b/g,"ã"],
    [/em\b|en\b/g,"ẽ"],
    [/om\b|on\b/g,"õ"],

    [/ch/g,"x"],
    [/ss|ç|sc|s\b|z\b/g,"s"],

    [/ti(?=[a,e,o,u])/g,"tʃ"],
    [/di(?=[a,e,o,u])/g,"dʒ"],

    [/lh/g,"ʎ"],
    [/nh/g,"ɲ"],

    [/g(?=[e,i])/g,"j"],

    [/([bcdfghjklmnpqrstvwxyz]+)$/g,""],
    [/^[ptkbdg]+/g,""]
  ];

  rules.forEach(([r,t])=>w=w.replace(r,t));

  return w.slice(-4);
}

function removeAutoF(){
  editor.querySelectorAll("span.autoF")
  .forEach(s=>s.replaceWith(...s.childNodes));
}

function autoMarkF(){

  removeAutoMarks();
  removeAutoF();

  const palette=[
    "#f43f5e","#fb923c","#facc15","#4ade80",
    "#06b6d4","#38bdf8","#6366f1","#c084fc"
  ];

  let groups={};
  let idx=0;

  let words = editor.innerText.match(/[a-záéíóúâêôãõç]+/gi)||[];

  words.forEach(w=>{
    let p=getPhonetic(w);
    if(!groups[p]) groups[p]=palette[idx++ % palette.length];
  });

  walkApply((m)=>{

    let p=getPhonetic(m);
    if(!groups[p]) return m;

    return m.replace(
      /([bcdfghjklmnpqrstvwxyz]?[aeiouãõâêôáéíóú]+)$/i,
      `<span class="autoF" style="background:${groups[p]};padding:1px 3px;border-radius:4px">$1</span>`
    );
  });
}



/******** util para varrer DOM ********/
function walkApply(replacer){
  function walk(node){
    if(node.nodeType===3){
      let text=node.textContent;
      let newHTML=text.replace(
        /([a-záéíóúâêôãõç]+)/gi,
        (m)=>replacer(m)
      );

      if(newHTML!==text){
        let temp=document.createElement("span");
        temp.innerHTML=newHTML;
        let parent=node.parentNode;
        parent.replaceChild(temp,node);
        [...temp.childNodes].forEach(n=>parent.insertBefore(n,temp));
        parent.removeChild(temp);
      }
    } else {
      node.childNodes.forEach(walk);
    }
  }
  walk(editor);
}



/******** MENU ********/
optView.onclick=()=>{
  optView.classList.toggle("active");
  document.body.classList.toggle("hide-marks");
};

optAuto.onclick=()=>{
  optAuto.classList.toggle("active");

  if(optAuto.classList.contains("active")){
    autoMarkRimas();
  } else {
    removeAutoMarks();
  }
};

optAutoF.onclick=()=>{
  optAutoF.classList.toggle("active");

  if(optAutoF.classList.contains("active")){
    autoMarkF();
  } else {
    removeAutoF();
  }
};



/*********** PLAYER ***********/
const audio=document.getElementById("audio");
const bar=document.getElementById("bar");
const playBtn=document.getElementById("playBtn");

selectBeat.onclick=()=>file.click();
file.onchange=e=>audio.src=
  URL.createObjectURL(e.target.files[0]);

playBtn.onclick=()=>{
  audio.paused?(audio.play(),playBtn.textContent='❚❚')
               :(audio.pause(),playBtn.textContent='▶');
};

audio.ontimeupdate=()=>{
  if(!audio.duration)return;
  bar.style.width=(audio.currentTime/audio.duration*100)+"%";
};



/*********** EXPORTAR / SALVAR ***********/
exportTXT.onclick=()=>{
  const blob=new Blob([editor.innerText],{type:"text/plain"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="letra.txt";
  a.click();
};

exportHTML.onclick=()=>{
  const blob=new Blob([editor.innerHTML],{type:"text/html"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="letra.html";
  a.click();
};

saveText.onclick=()=>{
  localStorage.setItem("letraAtual",editor.innerHTML);
  alert("Salvo");
};

loadText.onclick=()=>{
  let t=localStorage.getItem("letraAtual");
  if(t){
    editor.innerHTML=t;
    updateMeter();
  }
};

