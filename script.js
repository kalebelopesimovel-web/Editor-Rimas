/******** referências ********/
const editor=document.getElementById("editor");
const meterPanel=document.getElementById("meterPanel");
const countChars=document.getElementById("countChars");
const countWords=document.getElementById("countWords");
const countLines=document.getElementById("countLines");
const suggestions=document.getElementById("suggestions");


/*********** DICIONÁRIO DE RIMAS ***********/
const rhymeDict = {
  "ão": ["coração","visão","canção","mão","limão","melão","paixão"],
  "ar": ["amar","cantar","voar","sonhar","gritar","chorar"],
  "er": ["viver","saber","correr","mexer","dizer","beber"],
  "or": ["amor","dor","calor","valor","motor","rigor"],
  "im": ["assim","enfim","ruim","fim","jardim","mim","assim"],
};


/*********** pega última palavra ***********/
function getLastWord(){
  let text = editor.innerText.trim();
  if(!text) return "";
  let words=text.split(/\s+/);
  return words[words.length-1].toLowerCase();
}


/*********** gera sugestões ***********/
function getSuggestions(){
  let w=getLastWord();
  if(w.length<2)return [];
  
  let end = w.slice(-2);
  return rhymeDict[end] || [];
}


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
    lines.pop()

