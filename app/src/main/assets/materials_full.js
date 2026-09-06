const KEY='lunar_iii_v1';
const DAY=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SHORT=['SUN','MON','TUE','WED','THU','FRI','SAT'];

const RESIN_GOALS=[
  {id:'homa',owner:'Hu Tao',title:'Staff of Homa ascension',kind:'domain',cost:20,days:[3,6,0],source:'Hidden Palace of Lianshan Formula',remaining:'Piece of Aerosiderite ×10 · Bit ×14 · Chunk ×6',priority:94},

  {id:'yelan_weekly',owner:'Yelan',title:'Azhdaha weekly drop',kind:'weekly',cost:30,source:'Azhdaha',remaining:'Gilded Scale ×9',priority:100},
  {id:'yelan_talent',owner:'Yelan',title:'Prosperity talent books',kind:'domain',cost:20,days:[1,4,0],source:'Taishan Mansion',remaining:'Teachings ×2 · Philosophies ×56',priority:95},
  {id:'yelan_boss',owner:'Yelan',title:'Ruin Serpent',kind:'boss',cost:40,source:'Ruin Serpent',remaining:'Runic Fang ×22 · Varunada Lazurite Gemstone ×4',priority:82},
  {id:'aqua',owner:'Yelan',title:'Aqua Simulacra ascension',kind:'domain',cost:20,days:[1,4,0],source:'Hidden Palace of Lianshan Formula',remaining:'Luminous Sands from Guyun ×3 · Lustrous Stone ×4',priority:94},

  {id:'mona_talent',owner:'Mona',title:'Resistance talent books',kind:'domain',cost:20,days:[2,5,0],source:'Forsaken Rift',remaining:'Philosophies of Resistance ×38',priority:95},
  {id:'mona_boss',owner:'Mona',title:'Oceanid',kind:'boss',cost:40,source:'Rhodeia of Loch / Oceanid',remaining:'Cleansing Heart ×30 · Varunada Lazurite Gemstone ×2',priority:82},
  {id:'ttds',owner:'Mona',title:'Thrilling Tales ascension',kind:'domain',cost:20,days:[2,5,0],source:'Cecilia Garden',remaining:"Boreal Wolf's Cracked Tooth ×3 · Broken Fang ×6 · Nostalgia ×3",priority:92},

  {id:'nicole_weekly',owner:'Nicole',title:'Il Dottore weekly drop',kind:'weekly',cost:30,source:'Il Dottore',remaining:'Counterfeit Resin ×12',priority:100},
  {id:'nicole_talent',owner:'Nicole',title:'Elysium talent books',kind:'domain',cost:20,days:[2,5,0],source:'Lightless Capital',remaining:'Philosophies of Elysium ×69',priority:95},
  {id:'nicole_boss',owner:'Nicole',title:'Whisperer of Nightmares',kind:'boss',cost:40,source:'Lord of the Hidden Depths',remaining:'Remnant of the Dreadwing ×46 · Agnidus Agate Gemstone ×1',priority:82},
  {id:'angelos',owner:'Nicole',title:"Angelos' Heptades ascension",kind:'domain',cost:20,days:[1,4,0],source:'Lost Mooncourt',remaining:'Artful Device Fragment ×2 · Replica ×14 · Inheritance ×14 · Wish ×6',priority:94},

  {id:'art_hutao',owner:'Hu Tao',title:'Crimson Witch artifacts',kind:'artifact',cost:20,source:'Hidden Palace of Zhou Formula',remaining:'4pc Crimson Witch of Flames',priority:10},
  {id:'art_yelan',owner:'Yelan',title:'Emblem artifacts',kind:'artifact',cost:20,source:'Momiji-Dyed Court',remaining:'4pc Emblem of Severed Fate',priority:10},
  {id:'art_mona',owner:'Mona',title:'Celestial Gift artifacts',kind:'artifact',cost:20,source:'Thorny Crown of the Mountain Wind',remaining:'4pc Celestial Gift for this Hu Tao team',priority:10},
  {id:'art_nicole',owner:'Nicole',title:'Scroll artifacts',kind:'artifact',cost:20,source:'Sanctum of Rainbow Spirits',remaining:'4pc Scroll of the Hero of Cinder City for this Hu Tao team',priority:10}
];

const TEAM=[
  {name:'Hu Tao',element:'Pyro',role:'On-field DPS',weapon:'Staff of Homa',artifact:'4pc Crimson Witch of Flames',stats:'EM or HP% / Pyro DMG / CRIT',note:'Character and talents are already finished. Resin goal is Homa, then artifacts.'},
  {name:'Yelan',element:'Hydro',role:'Off-field Hydro',weapon:'Aqua Simulacra',artifact:'4pc Emblem of Severed Fate',stats:'ER or HP% / Hydro DMG / CRIT',note:'Target from HoYoLAB: Lv.1 → 90 and talents 1/1/1 → 10/10/10.'},
  {name:'Mona',element:'Hydro',role:'Burst buffer',weapon:'Thrilling Tales of Dragon Slayers',artifact:'4pc Celestial Gift',stats:'ER / Hydro DMG / CRIT or utility',note:'Current target: Lv.70 → 90, Skill 1 → 5, Burst 4 → 10, TTDS Lv.50 → 90.'},
  {name:'Nicole',element:'Pyro',role:'ATK buffer + shield',weapon:"Angelos' Heptades",artifact:'4pc Scroll of the Hero of Cinder City',stats:'ATK% / ATK% / ATK%',note:'Current target: Lv.1 → 90, Skill + Burst → 10. Normal Attack stays Lv.1.'}
];

const PRIMO_SOURCES=[
  ['Daily Commissions','Daily','The boring little 60-primo faucet.'],
  ['Limited-time events','Version','Do event pages before they evaporate.'],
  ['Archon / Story / World quests','Permanent','Quest rewards, achievements and unlocked areas stack up.'],
  ['Exploration + chests','Permanent','Chests, oculi, offering systems, puzzles and region progress.'],
  ['Achievements','Permanent','Small individually, suspiciously large as a pile.'],
  ['Spiral Abyss','Recurring','Clear the current cycle as far as comfortably possible.'],
  ['Imaginarium Theater','Recurring','Recurring endgame rewards.'],
  ['Stygian Onslaught','Recurring','Check the current cycle and difficulty rewards.'],
  ['Character Test Runs','Banner','Free primos whenever eligible trials are live.'],
  ['Redeem codes','Free','ChatGPT checks this for you every day at 12:00.'],
  ['Maintenance / update mail','Version','Free mail after eligible updates and maintenance.'],
  ['HoYoLAB check-in','Monthly','Occasional primogems among the check-in rewards.'],
  ['Serenitea Pot gift sets','Permanent','Companion furnishing sets can pay out primogems.']
];

function defaultState(){return{
  resin:160,
  completedGoals:{},
  dayDone:{},
  wishes:{primos:0,fates:0,charPity:0,charGuaranteed:false,weaponPity:0,weaponFate:false},
  weekly:{weekKey:'',transformer:false,trap:false,teapot:false,azhdaha:false,dottore:false,third:false},
  weeklyBossCount:0
}}
function load(){try{return Object.assign(defaultState(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return defaultState()}}
let S=load();
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function clamp(n,a,b){n=Number(n)||0;return Math.max(a,Math.min(b,n))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function isoWeekKey(d=new Date()){
  const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);
  const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));
  return x.getUTCFullYear()+'-W'+String(Math.ceil((((x-y)/86400000)+1)/7)).padStart(2,'0')
}
function ensureWeek(){const k=isoWeekKey();if(S.weekly.weekKey!==k){S.weekly={weekKey:k,transformer:false,trap:false,teapot:false,azhdaha:false,dottore:false,third:false};S.weeklyBossCount=0;save()}}
ensureWeek();

function goalDone(id){return !!S.completedGoals[id]}
function available(g,day){if(g.kind==='domain')return g.days.includes(day);return true}
function unfinished(kind=null){return RESIN_GOALS.filter(g=>!goalDone(g.id)&&(!kind||g.kind===kind))}
function doneToday(id){return !!(S.dayDone[dateKey()]||{})[id]}
function weeklyDoneForGoal(g){
  if(g.id==='yelan_weekly') return !!S.weekly.azhdaha;
  if(g.id==='nicole_weekly') return !!S.weekly.dottore;
  return false;
}
function setDoneToday(id,v){
  if(v && id==='yelan_weekly') S.weekly.azhdaha=true;
  else if(v && id==='nicole_weekly') S.weekly.dottore=true;
  else {
    S.dayDone[dateKey()]=S.dayDone[dateKey()]||{};
    S.dayDone[dateKey()][id]=v;
  }
  save();renderToday();renderWeekly();
}
function tomorrowDomainGoals(){const d=(new Date().getDay()+1)%7;return RESIN_GOALS.filter(g=>!goalDone(g.id)&&g.kind==='domain'&&g.days.includes(d))}
function todayQueue(){
  const day=new Date().getDay();
  return RESIN_GOALS
    .filter(g=>!goalDone(g.id)&&g.kind!=='artifact'&&available(g,day)&&!doneToday(g.id)&&!weeklyDoneForGoal(g))
    .sort((a,b)=>b.priority-a.priority || a.owner.localeCompare(b.owner));
}
function artifactQueue(){return RESIN_GOALS.filter(g=>!goalDone(g.id)&&g.kind==='artifact'&&!doneToday(g.id))}
