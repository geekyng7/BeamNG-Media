const $ = id => document.getElementById(id);
let current = {}, pending = false, positionAnchor = 0, positionUpdatedAt = Date.now();
const format = ms => { const s=Math.max(0,Math.floor((Number(ms)||0)/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };
function paintTimeline() {
  const duration=Math.max(0,Number(current.duration)||0);
  const elapsed=current.is_playing&&duration>0?Math.max(0,Date.now()-positionUpdatedAt):0;
  const position=duration>0?Math.min(duration,positionAnchor+elapsed):positionAnchor;
  $('elapsed').textContent=format(position); $('duration').textContent=format(duration);
  $('progress').style.width=duration?`${Math.min(100,100*position/duration)}%`:'0%';
}
function render(s={}) {
  current=s;
  positionAnchor=Math.max(0,Number(s.position)||0); positionUpdatedAt=Date.now();
  $('track').textContent=s.track||'Нет активного плеера';
  $('artist').textContent=[s.artist,s.album].filter(Boolean).join(' · ')||(s.session?'Исполнитель не указан':'Запустите музыку в Windows');
  $('status').textContent=s.session?(s.is_playing?'Играет':'Пауза'):(s.error?'Ошибка':'Ожидание');
  $('status').classList.toggle('online',!!s.session);
  $('error').textContent=s.error||'';
  $('toggle').textContent=s.is_playing?'Ⅱ':'▶';
  $('toggle').setAttribute('aria-label',s.is_playing?'Пауза':'Продолжить');
  paintTimeline();
  const cover=$('cover');
  if(s.thumbnail){cover.style.backgroundImage=`url("${s.thumbnail}")`;cover.textContent='';}
  else {cover.style.backgroundImage='';cover.textContent='♪';}
}
async function toggle(){if(pending)return;pending=true;$('notice').textContent='';try{const r=await window.bridge.command(current.is_playing?'pause':'play');if(!r?.ok)$('notice').textContent=r?.error||'Команда не выполнена.';}catch(e){$('notice').textContent=e.message;}finally{pending=false;}}
window.bridge.getState().then(render);window.bridge.onState(render);
setInterval(paintTimeline,200);
$('toggle').addEventListener('click',toggle);
$('folder').addEventListener('click',()=>window.bridge.openBeamngFolder());