(() => {
  if (window.__lunarFullMaterialsLoaded) return;
  window.__lunarFullMaterialsLoaded = true;
  if (typeof mats === 'undefined' || typeof chars === 'undefined' || typeof s === 'undefined') return;

  const put = (id, data) => { mats[id] = Object.assign({}, mats[id] || {}, data); if (s.materials[id] == null) s.materials[id] = 0; };
  const setGroups = (id, character, talents, weapon) => { chars[id].groups = {character, talents, weapon}; };

  // HU TAO • Lv.1→90 + 10/10/10 + Staff of Homa Lv.1→90
  put('hutao_wit',{name:"Hero's Wit equivalent",need:419,owner:'hutao',group:'character',source:'Character EXP'});
  put('hutao_mora',{name:'Mora',need:7049500,step:100000,owner:'hutao',group:'character',source:'Lv.90 + 10/10/10 talents'});
  put('hutao_silk',{name:'Silk Flower',need:168,owner:'hutao',group:'character',source:'Liyue local specialty'});
  put('hutao_jade',{name:'Juvenile Jade',need:46,owner:'hutao',group:'character',source:'Primo Geovishap'});
  put('hutao_agate1',{name:'Agnidus Agate Sliver',need:1,owner:'hutao',group:'character',source:'Pyro bosses'});
  put('hutao_agate2',{name:'Agnidus Agate Fragment',need:9,owner:'hutao',group:'character',source:'Pyro bosses'});
  put('hutao_agate3',{name:'Agnidus Agate Chunk',need:9,owner:'hutao',group:'character',source:'Pyro bosses'});
  put('hutao_agate4',{name:'Agnidus Agate Gemstone',need:6,owner:'hutao',group:'character',source:'Pyro bosses'});
  put('hutao_nectar1',{name:'Whopperflower Nectar',need:36,owner:'hutao',group:'character',source:'Whopperflowers • ascension + talents'});
  put('hutao_nectar2',{name:'Shimmering Nectar',need:96,owner:'hutao',group:'character',source:'Whopperflowers • ascension + talents'});
  put('hutao_nectar3',{name:'Energy Nectar',need:129,owner:'hutao',group:'character',source:'Whopperflowers • ascension + talents'});
  put('hutao_diligence1',{name:'Teachings of Diligence',need:9,owner:'hutao',group:'talents',source:'Taishan Mansion',days:[2,5,0],domain:true});
  put('hutao_diligence2',{name:'Guide to Diligence',need:63,owner:'hutao',group:'talents',source:'Taishan Mansion',days:[2,5,0],domain:true});
  put('hutao_diligence3',{name:'Philosophies of Diligence',need:114,owner:'hutao',group:'talents',source:'Taishan Mansion',days:[2,5,0],domain:true});
  put('hutao_weekly',{name:'Shard of a Foul Legacy',need:18,owner:'hutao',group:'talents',source:'Childe • weekly boss'});
  put('hutao_crown',{name:'Crown of Insight',need:3,owner:'hutao',group:'talents',source:'10/10/10 talents'});
  put('homa_mora',{name:'Weapon Mora',need:1132000,step:100000,owner:'hutao',group:'weapon',source:'Staff of Homa Lv.1→90'});
  put('homa_ore',{name:'Mystic Enhancement Ore',need:907,owner:'hutao',group:'weapon',source:'Staff of Homa Lv.1→90'});
  put('homa_grain',{name:'Grain of Aerosiderite',need:5,owner:'hutao',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[3,6,0],domain:true});
  put('homa_piece',{name:'Piece of Aerosiderite',need:14,owner:'hutao',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[3,6,0],domain:true});
  put('homa_bit',{name:'Bit of Aerosiderite',need:14,owner:'hutao',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[3,6,0],domain:true});
  put('homa_chunk',{name:'Chunk of Aerosiderite',need:6,owner:'hutao',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[3,6,0],domain:true});
  put('homa_ley1',{name:'Dead Ley Line Branch',need:23,owner:'hutao',group:'weapon',source:'Abyss Mages / Lectors / Heralds'});
  put('homa_ley2',{name:'Dead Ley Line Leaves',need:27,owner:'hutao',group:'weapon',source:'Abyss Mages / Lectors / Heralds'});
  put('homa_ley3',{name:'Ley Line Sprout',need:41,owner:'hutao',group:'weapon',source:'Abyss Mages / Lectors / Heralds'});
  put('homa_slime1',{name:'Slime Condensate',need:15,owner:'hutao',group:'weapon',source:'Slimes'});
  put('homa_slime2',{name:'Slime Secretions',need:23,owner:'hutao',group:'weapon',source:'Slimes'});
  put('homa_slime3',{name:'Slime Concentrate',need:27,owner:'hutao',group:'weapon',source:'Slimes'});
  setGroups('hutao',
    ['hutao_wit','hutao_mora','hutao_silk','hutao_jade','hutao_agate1','hutao_agate2','hutao_agate3','hutao_agate4','hutao_nectar1','hutao_nectar2','hutao_nectar3'],
    ['hutao_diligence1','hutao_diligence2','hutao_diligence3','hutao_weekly','hutao_crown'],
    ['homa_mora','homa_ore','homa_grain','homa_piece','homa_bit','homa_chunk','homa_ley1','homa_ley2','homa_ley3','homa_slime1','homa_slime2','homa_slime3']
  );

  // YELAN • Lv.1→90 + 10/10/10 + Aqua Simulacra Lv.1→90
  put('yelan_wit',{name:"Hero's Wit equivalent",need:419,owner:'yelan',group:'character',source:'Character EXP'});
  put('yelan_mora',{name:'Mora',need:7049500,step:100000,owner:'yelan',group:'character',source:'Lv.90 + 10/10/10 talents'});
  put('yelan_starconch',{name:'Starconch',need:168,owner:'yelan',group:'character',source:'Liyue coast'});
  put('yelan_boss',{name:'Runic Fang',need:46,owner:'yelan',group:'character',source:'Ruin Serpent'});
  put('yelan_gem1',{name:'Varunada Lazurite Sliver',need:1,owner:'yelan',group:'character',source:'Hydro bosses'});
  put('yelan_gem2',{name:'Varunada Lazurite Fragment',need:9,owner:'yelan',group:'character',source:'Hydro bosses'});
  put('yelan_gem3',{name:'Varunada Lazurite Chunk',need:9,owner:'yelan',group:'character',source:'Hydro bosses'});
  put('yelan_gem',{name:'Varunada Lazurite Gemstone',need:6,owner:'yelan',group:'character',source:'Hydro bosses'});
  put('yelan_insig1',{name:"Recruit's Insignia",need:36,owner:'yelan',group:'character',source:'Fatui • ascension + talents'});
  put('yelan_insig2',{name:"Sergeant's Insignia",need:96,owner:'yelan',group:'character',source:'Fatui • ascension + talents'});
  put('yelan_insig3',{name:"Lieutenant's Insignia",need:129,owner:'yelan',group:'character',source:'Fatui • ascension + talents'});
  put('yelan_prosperity1',{name:'Teachings of Prosperity',need:9,owner:'yelan',group:'talents',source:'Taishan Mansion',days:[1,4,0],domain:true});
  put('yelan_prosperity2',{name:'Guide to Prosperity',need:63,owner:'yelan',group:'talents',source:'Taishan Mansion',days:[1,4,0],domain:true});
  put('yelan_prosperity',{name:'Philosophies of Prosperity',need:114,owner:'yelan',group:'talents',source:'Taishan Mansion',days:[1,4,0],domain:true});
  put('yelan_gilded',{name:'Gilded Scale',need:18,owner:'yelan',group:'talents',source:'Azhdaha • weekly boss'});
  put('yelan_crown',{name:'Crown of Insight',need:3,owner:'yelan',group:'talents',source:'10/10/10 talents'});
  put('aqua_mora',{name:'Weapon Mora',need:1132000,step:100000,owner:'yelan',group:'weapon',source:'Aqua Simulacra Lv.1→90'});
  put('aqua_ore',{name:'Mystic Enhancement Ore',need:907,owner:'yelan',group:'weapon',source:'Aqua Simulacra Lv.1→90'});
  put('aqua_sands',{name:'Luminous Sands from Guyun',need:5,owner:'yelan',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[1,4,0],domain:true});
  put('aqua_stone',{name:'Lustrous Stone from Guyun',need:14,owner:'yelan',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[1,4,0],domain:true});
  put('aqua_relic',{name:'Relic from Guyun',need:14,owner:'yelan',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[1,4,0],domain:true});
  put('aqua_body',{name:'Divine Body from Guyun',need:6,owner:'yelan',group:'weapon',source:'Hidden Palace of Lianshan Formula',days:[1,4,0],domain:true});
  put('aqua_stat1',{name:'Gloomy Statuette',need:23,owner:'yelan',group:'weapon',source:'The Black Serpents'});
  put('aqua_stat2',{name:'Dark Statuette',need:27,owner:'yelan',group:'weapon',source:'The Black Serpents'});
  put('yelan_statuette',{name:'Deathly Statuette',need:41,owner:'yelan',group:'weapon',source:'The Black Serpents'});
  put('aqua_spec1',{name:'Spectral Husk',need:15,owner:'yelan',group:'weapon',source:'Specters'});
  put('aqua_spec2',{name:'Spectral Heart',need:23,owner:'yelan',group:'weapon',source:'Specters'});
  put('aqua_spec3',{name:'Spectral Nucleus',need:27,owner:'yelan',group:'weapon',source:'Specters'});
  setGroups('yelan',
    ['yelan_wit','yelan_mora','yelan_starconch','yelan_boss','yelan_gem1','yelan_gem2','yelan_gem3','yelan_gem','yelan_insig1','yelan_insig2','yelan_insig3'],
    ['yelan_prosperity1','yelan_prosperity2','yelan_prosperity','yelan_gilded','yelan_crown'],
    ['aqua_mora','aqua_ore','aqua_sands','aqua_stone','aqua_relic','aqua_body','aqua_stat1','aqua_stat2','yelan_statuette','aqua_spec1','aqua_spec2','aqua_spec3']
  );

  // NICOLE • Lv.1→90 + Skill/Burst 10/10 + Angelos' Heptades Lv.1→90
  put('nicole_wit',{name:"Hero's Wit equivalent",need:419,owner:'nicole',group:'character',source:'Character EXP'});
  put('nicole_mora',{name:'Mora',need:5397000,step:100000,owner:'nicole',group:'character',source:'Lv.90 + Skill/Burst Lv.10'});
  put('nicole_pine',{name:'Pine Amber',need:168,owner:'nicole',group:'character',source:'Nod-Krai local specialty'});
  put('nicole_boss',{name:'Remnant of the Dreadwing',need:46,owner:'nicole',group:'character',source:'Lord of the Hidden Depths'});
  put('nicole_agate1',{name:'Agnidus Agate Sliver',need:1,owner:'nicole',group:'character',source:'Pyro bosses'});
  put('nicole_agate2',{name:'Agnidus Agate Fragment',need:9,owner:'nicole',group:'character',source:'Pyro bosses'});
  put('nicole_agate3',{name:'Agnidus Agate Chunk',need:9,owner:'nicole',group:'character',source:'Pyro bosses'});
  put('nicole_gem',{name:'Agnidus Agate Gemstone',need:6,owner:'nicole',group:'character',source:'Pyro bosses'});
  put('nicole_warrant1',{name:'Tattered Warrant',need:30,owner:'nicole',group:'character',source:'Fatui Oprichniki • ascension + Skill/Burst'});
  put('nicole_warrant2',{name:'Immaculate Warrant',need:74,owner:'nicole',group:'character',source:'Fatui Oprichniki • ascension + Skill/Burst'});
  put('nicole_warrant3',{name:'Frost-Etched Warrant',need:98,owner:'nicole',group:'character',source:'Fatui Oprichniki • ascension + Skill/Burst'});
  put('nicole_elysium1',{name:'Teachings of Elysium',need:6,owner:'nicole',group:'talents',source:'Lightless Capital',days:[2,5,0],domain:true});
  put('nicole_elysium2',{name:'Guide to Elysium',need:42,owner:'nicole',group:'talents',source:'Lightless Capital',days:[2,5,0],domain:true});
  put('nicole_elysium',{name:'Philosophies of Elysium',need:76,owner:'nicole',group:'talents',source:'Lightless Capital',days:[2,5,0],domain:true});
  put('nicole_counterfeit',{name:'Counterfeit Resin',need:12,owner:'nicole',group:'talents',source:'Il Dottore • weekly boss'});
  put('nicole_crown',{name:'Crown of Insight',need:2,owner:'nicole',group:'talents',source:'Skill + Burst Lv.10'});
  put('angel_mora',{name:'Weapon Mora',need:1132000,step:100000,owner:'nicole',group:'weapon',source:"Angelos' Heptades Lv.1→90"});
  put('angel_ore',{name:'Mystic Enhancement Ore',need:907,owner:'nicole',group:'weapon',source:"Angelos' Heptades Lv.1→90"});
  put('angel_art1',{name:'Artful Device Fragment',need:5,owner:'nicole',group:'weapon',source:'Lost Mooncourt',days:[1,4,0],domain:true});
  put('angel_art2',{name:'Artful Device Replica',need:14,owner:'nicole',group:'weapon',source:'Lost Mooncourt',days:[1,4,0],domain:true});
  put('angel_art3',{name:'Artful Device Inheritance',need:14,owner:'nicole',group:'weapon',source:'Lost Mooncourt',days:[1,4,0],domain:true});
  put('angel_art4',{name:'Artful Device Wish',need:6,owner:'nicole',group:'weapon',source:'Lost Mooncourt',days:[1,4,0],domain:true});
  put('angel_hilt1',{name:'Faded Flaming Hilt',need:23,owner:'nicole',group:'weapon',source:'Domain Keepers'});
  put('angel_hilt2',{name:'Fractured Flaming Hilt',need:27,owner:'nicole',group:'weapon',source:'Domain Keepers'});
  put('angel_hilt3',{name:'Jeweled Flaming Hilt',need:41,owner:'nicole',group:'weapon',source:'Domain Keepers'});
  put('angel_drive1',{name:'Broken Drive Shaft',need:15,owner:'nicole',group:'weapon',source:'Landcruisers'});
  put('angel_drive2',{name:'Reinforced Drive Shaft',need:23,owner:'nicole',group:'weapon',source:'Landcruisers'});
  put('angel_drive3',{name:'Precision Drive Shaft',need:27,owner:'nicole',group:'weapon',source:'Landcruisers'});
  setGroups('nicole',
    ['nicole_wit','nicole_mora','nicole_pine','nicole_boss','nicole_agate1','nicole_agate2','nicole_agate3','nicole_gem','nicole_warrant1','nicole_warrant2','nicole_warrant3'],
    ['nicole_elysium1','nicole_elysium2','nicole_elysium','nicole_counterfeit','nicole_crown'],
    ['angel_mora','angel_ore','angel_art1','angel_art2','angel_art3','angel_art4','angel_hilt1','angel_hilt2','angel_hilt3','angel_drive1','angel_drive2','angel_drive3']
  );

  // CITLALI • Lv.1→90 + Skill/Burst 10/10 + Starcaller's Watch Lv.1→90
  put('citlali_wit',{name:"Hero's Wit equivalent",need:419,owner:'citlali',group:'character',source:'Character EXP'});
  put('citlali_mora',{name:'Mora',need:5397000,step:100000,owner:'citlali',group:'character',source:'Lv.90 + Skill/Burst Lv.10'});
  put('citlali_berry',{name:'Quenepa Berry',need:168,owner:'citlali',group:'character',source:'Natlan local specialty'});
  put('citlali_boss',{name:'Talisman of the Enigmatic Land',need:46,owner:'citlali',group:'character',source:'Wayward Hermetic Spiritspeaker'});
  put('citlali_jade1',{name:'Shivada Jade Sliver',need:1,owner:'citlali',group:'character',source:'Cryo bosses'});
  put('citlali_jade2',{name:'Shivada Jade Fragment',need:9,owner:'citlali',group:'character',source:'Cryo bosses'});
  put('citlali_jade3',{name:'Shivada Jade Chunk',need:9,owner:'citlali',group:'character',source:'Cryo bosses'});
  put('citlali_gem',{name:'Shivada Jade Gemstone',need:6,owner:'citlali',group:'character',source:'Cryo bosses'});
  put('citlali_fang1',{name:'Juvenile Fang',need:30,owner:'citlali',group:'character',source:'Natlan Saurians • ascension + Skill/Burst'});
  put('citlali_fang2',{name:'Seasoned Fang',need:74,owner:'citlali',group:'character',source:'Natlan Saurians • ascension + Skill/Burst'});
  put('citlali_fang3',{name:"Tyrant's Fang",need:98,owner:'citlali',group:'character',source:'Natlan Saurians • ascension + Skill/Burst'});
  put('citlali_kindling1',{name:'Teachings of Kindling',need:6,owner:'citlali',group:'talents',source:'Blazing Ruins',days:[2,5,0],domain:true});
  put('citlali_kindling2',{name:'Guide to Kindling',need:42,owner:'citlali',group:'talents',source:'Blazing Ruins',days:[2,5,0],domain:true});
  put('citlali_kindling',{name:'Philosophies of Kindling',need:76,owner:'citlali',group:'talents',source:'Blazing Ruins',days:[2,5,0],domain:true});
  put('citlali_denial',{name:'Denial and Judgment',need:12,owner:'citlali',group:'talents',source:'The Knave • weekly boss'});
  put('citlali_crown',{name:'Crown of Insight',need:2,owner:'citlali',group:'talents',source:'Skill + Burst Lv.10'});
  put('star_mora',{name:'Weapon Mora',need:1132000,step:100000,owner:'citlali',group:'weapon',source:"Starcaller's Watch Lv.1→90"});
  put('star_ore',{name:'Mystic Enhancement Ore',need:907,owner:'citlali',group:'weapon',source:"Starcaller's Watch Lv.1→90"});
  put('star_decadence',{name:'Delirious Decadence of the Sacred Lord',need:5,owner:'citlali',group:'weapon',source:'Ancient Watchtower',days:[2,5,0],domain:true});
  put('star_desolation',{name:'Delirious Desolation of the Sacred Lord',need:14,owner:'citlali',group:'weapon',source:'Ancient Watchtower',days:[2,5,0],domain:true});
  put('star_demeanor',{name:'Delirious Demeanor of the Sacred Lord',need:14,owner:'citlali',group:'weapon',source:'Ancient Watchtower',days:[2,5,0],domain:true});
  put('star_divinity',{name:'Delirious Divinity of the Sacred Lord',need:6,owner:'citlali',group:'weapon',source:'Ancient Watchtower',days:[2,5,0],domain:true});
  put('star_will1',{name:'Shard of a Shattered Will',need:23,owner:'citlali',group:'weapon',source:'Wayob Manifestations'});
  put('star_will2',{name:'Locus of a Clear Will',need:27,owner:'citlali',group:'weapon',source:'Wayob Manifestations'});
  put('star_will3',{name:'Sigil of a Striding Will',need:41,owner:'citlali',group:'weapon',source:'Wayob Manifestations'});
  put('star_whistle1',{name:"Sentry's Wooden Whistle",need:15,owner:'citlali',group:'weapon',source:'Sauroform Tribal Warriors'});
  put('star_whistle2',{name:"Warrior's Metal Whistle",need:23,owner:'citlali',group:'weapon',source:'Sauroform Tribal Warriors'});
  put('star_whistle3',{name:"Saurian-Crowned Warrior's Golden Whistle",need:27,owner:'citlali',group:'weapon',source:'Sauroform Tribal Warriors'});
  setGroups('citlali',
    ['citlali_wit','citlali_mora','citlali_berry','citlali_boss','citlali_jade1','citlali_jade2','citlali_jade3','citlali_gem','citlali_fang1','citlali_fang2','citlali_fang3'],
    ['citlali_kindling1','citlali_kindling2','citlali_kindling','citlali_denial','citlali_crown'],
    ['star_mora','star_ore','star_decadence','star_desolation','star_demeanor','star_divinity','star_will1','star_will2','star_will3','star_whistle1','star_whistle2','star_whistle3']
  );

  // Small migration from the old partial counters where it maps cleanly.
  const migrateMax = (to, from) => { if ((+s.materials[to]||0) === 0 && (+s.materials[from]||0) > 0) s.materials[to] = +s.materials[from] || 0; };
  migrateMax('nicole_warrant3','nicole_warrant_char');
  migrateMax('citlali_fang3','citlali_fang_char');

  save();
})();
