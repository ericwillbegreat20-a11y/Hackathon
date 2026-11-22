/* Quiet, repetitive background music built locally with Web Audio. */
(()=>{'use strict';
let context, master, button, timer, nextNote=0, step=0, enabled=false;
const notes=[220,247,220,196,220,247,220,196];
const beat=1.15;
const zh=()=>!!window.__campusLang;
const LABEL={
 off:['♫ Background music: off','♫ 背景音乐：关'],
 on:['♫ Background music: on','♫ 背景音乐：开'],
 unavailable:['♫ Background music unavailable','♫ 背景音乐不可用'],
 click:['♫ Click to play background music','♫ 点击播放背景音乐']
};
const label=k=>LABEL[k][zh()?1:0];

function refreshLabel(){if(button){button.textContent=enabled?label('on'):label('off')}}
function makeButton(){
 if(button)return;
 button=document.createElement('button');
 button.type='button';
 button.className='campus-audio-toggle';
 button.setAttribute('aria-pressed','false');
 button.textContent=label('off');
 button.addEventListener('click',()=>playing()?stop():start());
 document.body.appendChild(button);
}
function playing(){return enabled;}
function schedule(){
 if(!context||!master||master.gain.value===0)return;
 while(nextNote<context.currentTime+0.15){
  const at=nextNote, frequency=notes[step++%notes.length];
  const tone=context.createOscillator(), envelope=context.createGain();
  tone.type='triangle';tone.frequency.setValueAtTime(frequency,at);
  envelope.gain.setValueAtTime(0.0001,at);
  envelope.gain.exponentialRampToValueAtTime(0.45,at+0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001,at+0.48);
  tone.connect(envelope);envelope.connect(master);
  tone.start(at);tone.stop(at+0.5);
  nextNote+=beat;
 }
}
async function start(){
 makeButton();
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext){button.textContent=label('unavailable');return;}
  if(!context){context=new AudioContext();master=context.createGain();master.gain.value=0.6;master.connect(context.destination);}
  await context.resume();
  if(context.state!=='running')throw new Error('Audio is paused by the browser');
  master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0.6,context.currentTime);
  nextNote=context.currentTime+0.05;step=0;schedule();clearInterval(timer);timer=setInterval(schedule,100);
  enabled=true;
  button.textContent=label('on');button.setAttribute('aria-pressed','true');
 }catch(_){button.textContent=label('click');button.setAttribute('aria-pressed','false');}
}
function stop(){
 enabled=false;
 if(context&&master){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,0.04);}
 clearInterval(timer);button.textContent=label('off');button.setAttribute('aria-pressed','false');
}
window.addEventListener('campuslangchange',refreshLabel);
window.campusDrone={start,toggle:()=>playing()?stop():start()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeButton,{once:true});else makeButton();
})();
