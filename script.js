
/* =====================================================================
   FISH CHECK — GSCFPC  (In-memory state; RBAC; 4 personas)
   ===================================================================== */
const $=s=>document.querySelector(s);
const R_OWNER='Owner',R_BUYER='Buyer',R_CLASS='Classifier',R_CHECK='Checker';
const ROLES=[R_OWNER,R_BUYER,R_CLASS,R_CHECK];
const today=new Date();

let state={
  nextEmp:2,
  employees:[
    {id:'EMP-001',f:'Pancho',l:'Genova',username:'owner',email:'',contact:'0917-555-0101',hired:'2023-03-12',role:R_OWNER,pw:'owner123'},
  ],
  supplies:[
    {id:1,size:'Big',supplier:'OM Fishing',boxes:20,price:4500,total:90000,quality:'Class A',date:'2026-08-20'},
    {id:2,size:'Small',supplier:'Blue Water Traders',boxes:35,price:1200,total:42000,quality:'Class B',date:'2026-08-20'},
    {id:3,size:'Medium',supplier:'South Star',boxes:15,price:2600,total:39000,quality:'Class B',date:'2026-08-18'},
    {id:4,size:'Big',supplier:'Pacific Catch',boxes:25,price:4800,total:120000,quality:'Class A',date:'2026-08-17'},
    {id:5,size:'Small',supplier:'Gensan Seafoods',boxes:30,price:1500,total:45000,quality:'Class C',date:'2026-08-16'},
  ],
  inventory:[
    {id:'INV-A-001',cls:'A',species:'Tuna',boxRef:'A-F1',qty:60,date:'2026-08-20',img:null},
    {id:'INV-B-001',cls:'B',species:'Sardines',boxRef:'B-F2',qty:80,date:'2026-08-20',img:null},
    {id:'INV-C-001',cls:'C',species:'Mackarel',boxRef:'C-F3',qty:45,date:'2026-08-19',img:null},
    {id:'INV-A-002',cls:'A',species:'Yellowfin Tuna',boxRef:'A-F4',qty:70,date:'2026-08-18',img:null},
    {id:'INV-B-002',cls:'B',species:'Round Scad',boxRef:'B-F5',qty:55,date:'2026-08-17',img:null},
  ],
  expenses:[
    {id:1,cat:'Labor',desc:'Port workers wages',amount:8500,date:'2026-08-19'},
    {id:2,cat:'Ice',desc:'Flake ice for cold storage',amount:3200,date:'2026-08-20'},
    {id:3,cat:'Salt',desc:'Curing salt',amount:1800,date:'2026-08-20'},
    {id:4,cat:'Packaging',desc:'Styro boxes & film',amount:2400,date:'2026-08-20'},
    {id:5,cat:'Fuel',desc:'Hauling vans fuel',amount:5600,date:'2026-08-19'},
    {id:6,cat:'Transport',desc:'Fish transport ferry',amount:4200,date:'2026-08-20'},
    {id:7,cat:'Customer Loans',desc:'Advance to buyer \'Mang Rudy\'',amount:5000,date:'2026-08-18'},
  ],
  sales:[
    {id:1,box:'INV-A-001',buyer:'Marina Grill',qty:40,price:5200,revenue:208000,date:'2026-08-20'},
    {id:2,box:'INV-B-001',buyer:'Palengke Stalls',qty:55,price:2600,revenue:143000,date:'2026-08-19'},
  ],
  losses:[
    {id:1,box:'INV-C-001',reason:'Spoilage - thawed stock',qty:15,value:12000,date:'2026-08-20'},
  ],
  chat:[
    {id:1,ch:'general',who:'EMP-001',name:'Pancho Genova',role:R_OWNER,text:'Morning team — how is today\'s catch looking?',t:'2026-08-20 08:02'},
    {id:2,ch:'general',who:'EMP-003',name:'Marco Dela Cruz',role:R_CLASS,text:'Just finished grading the tuna haul. Class A line is strong, Class C needs to move fast.',t:'2026-08-20 08:15'},
    {id:3,ch:'purchases',who:'EMP-002',name:'Liza Ramirez',role:R_BUYER,text:'Seller is offering sardines at ₱1,200/box. Given Class B grading, I think we take 35 boxes.',t:'2026-08-20 09:40'},
    {id:4,ch:'finance',who:'EMP-004',name:'Nena Santos',role:R_CHECK,text:'Expense log updated: ice + packaging this morning. Net margin holding above target.',t:'2026-08-20 10:11'},
  ],
  currentTyping:-1,
};
let cur=null;         // current user
let view='';          // active nav for current role
let chatCh='general';

const channels=[
  {id:'general',name:'General Ops',dot:'#0d9488',roles:[R_OWNER,R_BUYER,R_CLASS,R_CHECK]},
  {id:'purchases',name:'Purchasing & Grading',dot:'#0891b2',roles:[R_BUYER,R_CLASS,R_CHECK]},
  {id:'quality',name:'Quality Channel',dot:'#16a34a',roles:[R_CLASS,R_BUYER]},
  {id:'finance',name:'Finance & Oversight',dot:'#f59e0b',roles:[R_CHECK,R_OWNER]},
];
const navMap={
  [R_OWNER]:[
    {id:'report',tl:'Decision Support Report',sb:'Consolidated business analytics & strategy',icon:'📊',roles:[R_OWNER]},
    {id:'employees',tl:'Employee Management',sb:'Add, view and terminate staff accounts',icon:'👥',roles:[R_OWNER]},
    {id:'roleAccess',tl:'Role & Access Assignment',sb:'Assign roles and system functions to employees',icon:'🔐',roles:[R_OWNER]},
    {id:'task5',tl:'Interactive Data Entry',sb:'Task 5 forms for employee and purchase records',icon:'📝',roles:[R_OWNER]},
    {id:'basicTables',tl:'Basic Tables',sb:'Task 4 system records and sample data',icon:'📋',roles:[R_OWNER]},
    {id:'chat',tl:'Coordination Hub',sb:'Real-time messaging across roles',icon:'💬',roles:channels.find(c=>c.id==='general').roles},
  ],
  [R_BUYER]:[
    {id:'supply',tl:'Supply Tracker',sb:'Manage fish purchases by size & box quantity',icon:'🛒'},
    {id:'chat',tl:'Coordination Hub',sb:'Coordinate with Checker, Classifier & Owner',icon:'💬'},
  ],
  [R_CLASS]:[
    {id:'quality',tl:'AI Quality Checker',sb:'Camera inspection & Class A/B/C grading',icon:'🤖'},
    {id:'inventory',tl:'Classified Inventory',sb:'Quality-verified boxed products',icon:'📦'},
    {id:'chat',tl:'Coordination Hub',sb:'Coordinate with Checker, Buyer & Owner',icon:'💬'},
  ],
  [R_CHECK]:[
    {id:'expenses',tl:'Expense Logging',sb:'Track operational costs',icon:'🧾'},
    {id:'profit',tl:'Profitability Tracker',sb:'Sales, losses & inventory movements',icon:'💰'},
    {id:'chat',tl:'Coordination Hub',sb:'Coordinate with Buyer, Classifier & Owner',icon:'💬'},
  ],
};

/* ---------------- helpers ---------------- */
const fm=n=>'₱'+Number(n).toLocaleString('en-PH',{minimumFractionDigits:0,maximumFractionDigits:0});
const f2=n=>'₱'+Number(n).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const dstr=d=>{const x=new Date(d);return x.toISOString?x.toISOString().slice(0,10):d};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayISO=()=>new Date().toISOString().slice(0,10);

function toast(msg,type='okb'){const d=document.createElement('div');d.className='toast '+type;d.textContent=msg;$('#toasts').appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .3s';setTimeout(()=>d.remove(),300)},3200);}
function byId(id){return state.employees.find(e=>e.id===id)}
function nextMsg(){return Math.max(0,...state.chat.map(c=>c.id))+1}
function empNextId(){const n=String(state.nextEmp).padStart(3,'0');state.nextEmp++;saveAuthState();return 'EMP-'+n;}

/* ---------------- authentication: login / register / forgot password ---------------- */
function authUsers(){ return state.employees; }

function normalize(v){ return String(v||'').trim().toLowerCase(); }

function saveAuthState(){
  try{ localStorage.setItem('fishCheckEmployeesV3', JSON.stringify(state.employees)); localStorage.setItem('fishCheckNextEmpV3', String(state.nextEmp)); }
  catch(e){}
}

function loadAuthState(){
  try{
    const saved=JSON.parse(localStorage.getItem('fishCheckEmployeesV3')||'null');
    const next=Number(localStorage.getItem('fishCheckNextEmpV3')||0);
    if(Array.isArray(saved) && saved.length){
      state.employees=saved;
      if(next>0) state.nextEmp=next;
    }
  }catch(e){}
}

function rememberLogin(){
  const checked=$('#remember-me')&&$('#remember-me').checked;
  try{
    if(checked) localStorage.setItem('fishCheckRememberedUser',$('#lg-id').value.trim());
    else localStorage.removeItem('fishCheckRememberedUser');
  }catch(e){}
}

function restoreRememberedLogin(){
  try{
    const rememberedId=localStorage.getItem('fishCheckRememberedUser');
    const user=findAccount(rememberedId);
    if(!user){if(rememberedId)localStorage.removeItem('fishCheckRememberedUser');return;}
    cur=user; view=navMap[user.role][0].id;
    $('#login').style.display='none'; $('#app').style.display='block';
    renderSide(); render();
  }catch(e){}
}

function showAuth(panel){
  ['login','register','forgot'].forEach(x=>{
    const el=document.getElementById('auth'+x.charAt(0).toUpperCase()+x.slice(1));
    if(el)el.classList.toggle('hidden',x!==panel);
  });
  ['lg-err','reg-err','fp-err'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='';});
}

function togglePassword(inputId,button){
  const input=document.getElementById(inputId);
  if(!input)return;
  const showing=input.type==='text';
  input.type=showing?'password':'text';
  button.textContent=showing?'👁':'🙈';
  button.setAttribute('aria-label',showing?'Show password':'Hide password');
}

function findAccount(identifier){
  const q=normalize(identifier);
  return state.employees.find(e =>
    normalize(e.id)===q ||
    normalize(e.username)===q ||
    normalize(e.email)===q
  );
}

function doLogin(){
  const loginValue=normalize($('#lg-id').value);
  const password=$('#lg-pw').value;
  const user=findAccount(loginValue);
  if(!user || user.pw!==password){
    $('#lg-err').textContent='Invalid username, email, employee ID, or password.';
    return;
  }
  cur=user; view=navMap[user.role][0].id;
  rememberLogin();
  $('#login').style.display='none'; $('#app').style.display='block';
  renderSide(); render();
  toast('Welcome back, '+user.f+'! Signed in as '+user.role);
}

function registerAccount(){
  const f=$('#reg-first').value.trim(), l=$('#reg-last').value.trim();
  const username=normalize($('#reg-username').value), email=normalize($('#reg-email').value);
  const contact=$('#reg-contact').value.trim(), role=$('#reg-role').value;
  const pw=$('#reg-password').value, pw2=$('#reg-confirm').value;

  if(!f||!l||!username||!email||!contact||!role||!pw||!pw2){
    $('#reg-err').textContent='Please complete all registration fields.'; return;
  }
  if(pw.length<6){ $('#reg-err').textContent='Password must be at least 6 characters.'; return; }
  if(pw!==pw2){ $('#reg-err').textContent='Passwords do not match.'; return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    $('#reg-err').textContent='Please enter a valid email address.'; return;
  }
  if(findAccount(username)||findAccount(email)){
    $('#reg-err').textContent='That username or email is already registered.'; return;
  }

  const id=empNextId();
  state.employees.push({id,f,l,contact,hired:todayISO(),role,pw,username,email});
  saveAuthState();

  $('#reg-err').textContent='';
  toast('Account created successfully. Your Employee ID is '+id+'.');
  $('#lg-id').value=username; $('#lg-pw').value='';
  showAuth('login');
}

function resetPassword(){
  const identifier=normalize($('#forgot-login').value), contact=$('#forgot-contact').value.trim();
  const p=$('#forgot-password').value, p2=$('#forgot-confirm').value;
  const u=findAccount(identifier);

  if(!u){ $('#fp-err').textContent='Account not found.'; return; }
  if(!contact || normalize(u.contact)!==normalize(contact)){
    $('#fp-err').textContent='The contact number does not match this account.'; return;
  }
  if(!p || p.length<6){ $('#fp-err').textContent='New password must be at least 6 characters.'; return; }
  if(p!==p2){ $('#fp-err').textContent='Passwords do not match.'; return; }

  u.pw=p;
  saveAuthState();
  toast('Password reset successfully.');
  $('#lg-id').value=u.username||u.email||u.id; $('#lg-pw').value='';
  showAuth('login');
}

function logout(){
  cur=null; $('#app').style.display='none'; $('#login').style.display='flex';
  $('#lg-pw').value='';
  showAuth('login');
}

function renderSide(){
  $('#sideRole').textContent=cur.role;$('#sideName').textContent=cur.f+' '+cur.l;$('#sideId').textContent=cur.id;
  $('#sideAv').textContent=(cur.f[0]||'?').toUpperCase();
  $('#sideNav').innerHTML=(navMap[cur.role]||[]).map(n=>
    `<button class="nav-item ${view===n.id?'active':''}" onclick="go('${n.id}')"><span class="ic">${n.icon}</span>${n.tl.split(' ')[0]}</button>`).join('');
}
function go(id){view=id;renderSide();render();}

/* ---------------- page shell ---------------- */
function render(){
  const meta=navMap[cur.role].find(n=>n.id===view);
  $('#pgTitle').textContent=meta.tl;$('#pgSub').textContent=meta.sb;
  $('#topDate').textContent=today.toLocaleDateString('en-PH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const c=$('#content');
  const fn={report:renderReport,employees:renderEmployees,roleAccess:renderRoleAccess,task5:renderTask5,basicTables:renderBasicTables,supply:renderBuyer,chat:renderChat,
            quality:renderQuality,inventory:renderClassified,expenses:renderExpenses,profit:renderProfit}[view];
  if(fn)c.innerHTML=fn();
  if(view==='roleAccess')setupRoleAccessForm();
  window.scrollTo(0,0);
}

/* ================= BUYER — SUPPLY TRACKER ================= */
function renderBuyer(){
  const sup=state.supplies;
  const totalBoxes=sup.reduce((a,s)=>a+s.boxes,0), totalCost=sup.reduce((a,s)=>a+s.total,0);
  const bySize=s=>sup.filter(x=>x.size===s).reduce((a,x)=>a+x.boxes,0);
  // quality intel from classifier
  const inv=state.inventory;const A=inv.filter(i=>i.cls==='A').length,B=inv.filter(i=>i.cls==='B').length,C=inv.filter(i=>i.cls==='C').length;
  return `
  <div class="grid g4">
    <div class="stat"><div class="lab">Total Boxes</div><div class="val">${totalBoxes}</div><div class="delta">${sup.length} purchase lots</div></div>
    <div class="stat"><div class="lab">Total Cost</div><div class="val">${fm(totalCost)}</div><div class="delta">Supplier invoicing</div></div>
    <div class="stat"><div class="lab">Big / Medium / Small</div><div class="val" style="font-size:18px">${bySize('Big')} / ${bySize('Medium')} / ${bySize('Small')}</div><div class="delta">boxes by size</div></div>
    <div class="stat"><div class="lab">Classifier Grading</div><div class="val" style="font-size:18px"><span class="pill a">A ${A}</span> <span class="pill b">B ${B}</span> <span class="pill c">C ${C}</span></div><div class="delta">quality tiers for pricing</div></div>
  </div>
  <div class="grid g2 mt">
    <div class="card">
      <div class="section-head"><h3>📥 Record New Purchase</h3></div>
      <p class="hint">Link purchase cost and size to supplier pricing, informed by Classifier quality updates.</p>
      <div class="form-row">
        <div class="fgroup"><label>Fish Size</label><select id="bp-size"><option>Big</option><option>Medium</option><option>Small</option></select></div>
        <div class="fgroup"><label>Supplier</label><input id="bp-sup" placeholder="Supplier name"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label>Boxes</label><input id="bp-boxes" type="number" min="1" value="10"/></div>
        <div class="fgroup"><label>Price per Box (₱)</label><input id="bp-price" type="number" min="0" value="2000"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup" style="grid-column:1/-1"><label>Quality Tier (from Classifier)</label>
          <select id="bp-qual"><option>Class A</option><option>Class B</option><option>Class C</option></select></div>
      </div>
      <button class="btn block" onclick="addSupply()">+ Add Purchase Lot</button>
    </div>
    <div class="card">
      <div class="section-head"><h3>🛒 Purchase Lots</h3></div>
      <table class="tbl"><thead><tr><th>Date</th><th>Size</th><th>Supplier</th><th>Boxes</th><th>₱/Box</th><th>Total</th><th>Quality</th><th></th></tr></thead>
      <tbody>
        ${sup.length?sup.map(s=>`<tr><td>${s.date}</td><td>${s.size}</td><td>${esc(s.supplier)}</td><td>${s.boxes}</td><td>${fm(s.price)}</td><td><b>${fm(s.total)}</b></td><td><span class="pill ${s.quality[6].toLowerCase()}">${s.quality}</span></td><td><button class="icon-btn" title="Remove" onclick="delSupply(${s.id})">🗑</button></td></tr>`).join('')
        :`<tr><td colspan="8" class="empty">No purchases yet</td></tr>`}
      </tbody></table>
      <div class="flex mt"><b>Grand Total:</b> ${fm(totalCost)}</div>
      <div class="notice">💡 <b>Decision support for the buyer:</b> Supply is pushed to the Checker as the cost basis once classified. Negotiate Class C lots below market to protect margin.</div>
    </div>
  </div>`;
}
function addSupply(){
  const size=$('#bp-size').value,sup=$('#bp-sup').value.trim(),boxes=+$('#bp-boxes').value,price=+$('#bp-price').value,qual=$('#bp-qual').value;
  if(!sup||!boxes||!price){toast('Fill supplier, boxes and price','erro');return;}
  state.supplies.unshift({id:Math.max(0,...state.supplies.map(s=>s.id))+1,size,supplier:sup,boxes,price,total:boxes*price,quality:qual,date:todayISO()});
  toast('Purchase lot added — '+fm(boxes*price));render();
}
function delSupply(id){state.supplies=state.supplies.filter(s=>s.id!==id);toast('Purchase lot removed');render();}

/* ================= CLASSIFIER — AI QUALITY CHECKER ================= */
let cam={stream:null,dataURL:null,stats:null}; // current captured analysis
const SAMPLE_PALETTE=[['#93c5fd','#dbeafe','#f87171','#dc2626'],['#86efac','#dcfce7','#a78bfa','#8b5cf6'],['#fcd34d','#fef3c7','#f9a8d4','#ec4899']];
function renderQuality(){
  return `
  <div class="grid g2">
    <div class="card">
      <div class="section-head"><h3>🤖 AI Fish Quality Checker</h3></div>
      <p class="hint">Capture a fish using a camera-enabled device (or upload / sample). The model evaluates eyes, skin, gills and color to assign Class A, B or C.</p>
      <div class="cam-area">
        <div class="cam-box" id="camBox">
          <video id="camVid" autoplay playsinline muted class="hide"></video>
          <img id="camImg" class="hide"/>
          <div id="camEmpty" style="text-align:center;color:var(--muted)"><div style="font-size:40px">📷</div><p style="margin-top:6px">No capture yet</p></div>
        </div>
      </div>
      <div class="grid g3 mt">
        <button class="btn" onclick="startCam()">🎥 Live Camera</button>
        <label class="btn ghost" style="text-align:center">⬆ Upload<input id="camFile" type="file" accept="image/*" capture="environment" style="display:none" onchange="fileCapture(event)"/></label>
        <button class="btn ghost" onclick="sampleCapture()">🎲 Sample Fish</button>
      </div>
      <div class="mt" id="camStatus"></div>
    </div>

    <div class="card" id="resultCol">
      <div class="section-head"><h3>📋 AI Assessment</h3></div>
      ${cam.stats?renderResult():`<div style="text-align:center;padding:50px 0;color:var(--muted)"><div style="font-size:44px">🧬</div><p class="mt">Capture or upload a fish to run the on-device quality model.</p></div>`}
    </div>
  </div>`;
}
function traitVisuals(s){
  const g=Math.round(s.g/255*100);
  const skin=g>62?'Bright, glossy sheen':g>48?'Moderate sheen':'Dull / dried skin';
  const eyes=s.bright>0.60?'Clear, bulging eyes':s.bright>0.46?'Slightly cloudy':'Sunken, cloudy';
  const gills=s.red>0.72?'Bright red gills':s.red>0.55?'Pinkish gills':'Dusky brown gills';
  const color=s.hueIn?['Silver','Bluish','Pinkish','Greenish','Golden'][s.col] : 'Silver-ish';
  return {skin,eyes,gills,color};
}
function renderResult(){
  const s=cam.stats;const v=traitVisuals(s);
  const cls=s.cls, col=cls==='A'?'#16a34a':cls==='B'?'#f59e0b':'#dc2626';
  const lbl=cls==='A'?'CLASS A — High Quality':cls==='B'?'CLASS B — Neither Good Nor Bad':'CLASS C — Bad but Cookable';
  return `
  <div class="result-card">
    <div class="score-ring">
      <div class="score-num" style="background:${col}">${Math.round(s.score)}<small>FRESHNESS</small></div>
      <div><div class="tag">${lbl}</div>
      <p class="small mt" style="max-width:300px">${cls==='A'?'Market-ready premium; price at top tier.':cls==='B'?'Sell promptly at standard market rate.':'Move fast — discount to recover value.'}</p></div>
    </div>
    <div class="trait-row">
      <div class="trait"><div class="k">Eyes</div><div class="v">${v.eyes}</div></div>
      <div class="trait"><div class="k">Skin</div><div class="v">${v.skin}</div></div>
      <div class="trait"><div class="k">Gills</div><div class="v">${v.gills}</div></div>
      <div class="trait"><div class="k">Color</div><div class="v">${v.color}</div></div>
    </div>
    <label class="fgroup mt"><span style="text-transform:uppercase;font-size:11px;font-weight:800;color:var(--muted)">Species / product name</span>
      <input id="res-species" placeholder="e.g. Tuna" style="margin-top:5px"/></label>
    <div class="flex" style="align-items:flex-end">
      <div class="fgroup" style="flex:1"><label>Boxes to tag</label><input id="res-qty" type="number" min="1" value="10" style="margin-top:5px"/></div>
      <button class="btn ok" onclick="saveClassified()">📦 Save to Inventory as <b>${cls}</b></button>
    </div>
    <button class="btn ghost sm mt" onclick="resetCapture()">Clear and re-inspect</button>
  </div>`;
}
function classifyFromStats(stat){
  const bright=stat.bright,red=stat.red,g=stat.g/255,txt=stat.var;
  // gills redness strong + bright sheen + clear => fresh
  let score = red*42 + bright*34 + g* 8 + txt*16;
  score=Math.max(10,Math.min(96,score));
  score+= (Math.random()*3-1.5);
  const cls=score>=58?'A':score>=42?'B':'C';
  const conf=Math.min(97,52+score*0.42);
  return {score,cls,conf};
}
function getStats(img){
  const mw=260,mh=260,sc=Math.min(mw/img.naturalWidth,mh/img.naturalHeight,1);
  const c=document.createElement('canvas');c.width=Math.max(16,Math.round(img.naturalWidth*sc));c.height=Math.max(16,Math.round(img.naturalHeight*sc));
  const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);
  const d=ctx.getImageData(0,0,c.width,c.height).data;
  let r=0,g=0,b=0,n=c.width*c.height,rr=0;
  for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];rr+=d[i];}
  r/=n;g/=n;b/=n;
  // per-pixel variance sampled
  let sum=0,cnt=0;
  for(let i=0;i<d.length;i+=16){const y=(d[i]+d[i+1]+d[i+2])/3;sum+=y;cnt++;}
  const mean=sum/cnt;let vr=0;
  for(let i=0;i<d.length;i+=16){const y=(d[i]+d[i+1]+d[i+2])/3;vr+=(y-mean)*(y-mean);}
  vr=Math.sqrt(vr/cnt)/255;
  const st={bright:(r+g+b)/3/255,red:r/255,var:Math.min(1,Math.max(0.05,vr))};
  // color bucket
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,dlt=mx-mn;
  let hue=0;let hueIn=false;
  if(dlt>40){hueIn=true;if(mx===r)hue=((g-b)/dlt)%6;else if(mx===g)hue=(b-r)/dlt+2;else hue=(r-g)/dlt+4;hue=((hue*60)+360)%360;}
  st.col = hueIn?(hue<70?!1:0||hue<20?0:hue<90?3:hue<160?1:hue<270?2:hue<330?0:2):-1;
  st.hueIn=hueIn;
  return st;
}
function runAnalysis(img){
  const st=getStats(img);const res=classifyFromStats(st);
  st.score=res.score;st.cls=res.cls;st.conf=res.conf;
  cam.stats=st;cam.dataURL=uploadThumb(img);
  $('#camImg').src=cam.dataURL;$('#camImg').classList.remove('hide');
  const v=$('#camVid');if(v)v.classList.add('hide');
  $('#camEmpty').classList.add('hide');
  $('#resultCol').innerHTML=renderResult();
  $('#camStatus').innerHTML=`<span class="tag tone">Model confidence: ${Math.round(st.conf)}% · Graded ${st.cls}</span>`;
}
function uploadThumb(img){
  const sc=Math.min(320/img.naturalWidth,320/img.naturalHeight,1);
  const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg');
}
function fileCapture(e){
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const img=new Image();img.onload=()=>runAnalysis(img);img.src=URL.createObjectURL(f);
}
function startCam(){
  const box=$('#camBox');
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$('#camStatus').innerHTML='<span class="tag gray">Camera unavailable in this environment — use Upload or Sample.</span>';return;}
  $('#camStatus').innerHTML='<span class="tag tone">Requesting camera…</span><button class="btn sm ghost" style="margin-left:8px" onclick="snapCam()">📸 Snap</button>';
  const v=$('#camVid');v.classList.remove('hide');
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(str=>{
    cam.stream=str;v.srcObject=str;v.play();
    $('#camStatus').innerHTML='<span class="pill a">● Live</span> <button class="btn sm ghost" onclick="snapCam()">📸 Snap & Inspect</button>';
  }).catch(()=>$('#camStatus').innerHTML='<span class="tag gray">Camera blocked — use Upload or Sample.</span>');
}
function snapCam(){
  const v=$('#camVid');if(!v.videoWidth)return toast('No camera feed','erro');
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);
  const img=new Image();img.onload=()=>runAnalysis(img);img.src=c.toDataURL('image/jpeg');
  if(cam.stream)cam.stream.getTracks().forEach(t=>t.stop());
  toast('Live frame captured — running AI analysis');
}
function sampleCapture(){
  // draw a randomized fish on canvas and feed to same pipeline
  const c=document.createElement('canvas');c.width=320;c.height=220;const ctx=c.getContext('2d');
  const pal=SAMPLE_PALETTE[Math.floor(Math.random()*SAMPLE_PALETTE.length)];
  ctx.fillStyle='#eaf4fc';ctx.fillRect(0,0,320,220);
  const brightVar=Math.random()*60;
  // body
  ctx.fillStyle=pal[0];ctx.beginPath();ctx.ellipse(160,120,110,55,0,0,7);ctx.fill();
  // tail
  ctx.fillStyle=pal[1];ctx.beginPath();ctx.moveTo(50,120);ctx.lineTo(20,85);ctx.lineTo(18,155);ctx.closePath();ctx.fill();
  // eye
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(238,108,9,0,7);ctx.fill();
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(240,107,4,0,7);ctx.fill();
  // gills (redness signal)
  ctx.strokeStyle=pal[2];ctx.lineWidth=6;
  ctx.beginPath();ctx.arc(218,120,22,Math.PI*0.9,Math.PI*1.6);ctx.stroke();
  ctx.fillStyle=pal[2];ctx.fillRect(180,110,8,20);
  // skin sheen lines
  ctx.strokeStyle='rgba(255,255,255,'+(0.15+brightVar/400)+')';ctx.lineWidth=brightVar/30+1;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(120+i*18,60);ctx.quadraticCurveTo(140+i*12,120,120+i*20,175);ctx.stroke();}
  ctx.fillStyle=pal[3];if(pal[3]&&Math.random()<0.4){ctx.fillRect(40,40,60,8);}
  const img=new Image();img.onload=()=>runAnalysis(img);img.src=c.toDataURL('image/jpeg');
  toast('Sampled fish generated — analyzing…');
}
function resetCapture(){cam={stream:null,dataURL:null,stats:null};$('#camStatus').innerHTML='';render();}
function saveClassified(){
  if(!cam.stats)return;const cls=cam.stats.cls;
  const species=$('#res-species').value.trim()||'Fish';const qty=Math.max(1,+$('#res-qty').value||1);
  const id='INV-'+cls+'-'+String(state.inventory.length+1).padStart(2,'0');
  state.inventory.unshift({id,cls,species,boxRef:cls+'-'+Math.floor(Math.random()*90+10),qty,date:todayISO(),img:cam.dataURL});
  toast('Tagged '+qty+' '+species+' boxes as Class '+cls+' → '+id);cam.stats=null;render();
}

/* ============ CLASSIFIER — CLASSIFIED INVENTORY ============ */
function renderClassified(){
  const inv=state.inventory;
  const c=i=>i.cls;
  const A=inv.filter(i=>c(i)==='A').reduce((a,i)=>a+i.qty,0),B=inv.filter(i=>c(i)==='B').reduce((a,i)=>a+i.qty,0),C=inv.filter(i=>c(i)==='C').reduce((a,i)=>a+i.qty,0);
  const clsLabel={A:'Class A — High Quality',B:'Class B — Neither Good nor Bad',C:'Class C — Bad but Cookable'};
  return `
  <div class="grid g3">
    <div class="stat"><div class="lab">Class A boxes</div><div class="val">${A}</div><div class="delta"><span class="pill a">PREMIUM</span></div></div>
    <div class="stat"><div class="lab">Class B boxes</div><div class="val">${B}</div><div class="delta"><span class="pill b">STANDARD</span></div></div>
    <div class="stat"><div class="lab">Class C boxes</div><div class="val">${C}</div><div class="delta"><span class="pill c">DISCOUNT</span></div></div>
  </div>
  <div class="card mt">
    <div class="section-head"><h3>📦 Quality-Verified Boxes</h3>
      <span class="tag">Output feeds Buyer pricing & Checker inventory logging</span></div>
    <table class="tbl"><thead><tr><th>Box Ref</th><th>Species</th><th>Tier</th><th>Qty</th><th>Produced</th><th>Preview</th></tr></thead>
    <tbody>
      ${inv.length?inv.map(i=>`<tr><td><b>${i.id}</b></td><td>${esc(i.species)}</td><td><span class="pill ${i.cls.toLowerCase()}">${clsLabel[i.cls]} (${i.cls})</span></td><td>${i.qty}</td><td>${i.date}</td>
        <td>${i.img?`<img src="${i.img}" style="width:52px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--line)"/>`:'<span class="small">—</span>'}</td></tr>`).join('')
        :`<tr><td colspan="6" class="empty">No classified inventory yet — run the AI Checker.</td></tr>`}
    </tbody></table>
  </div>`;
}

/* ================= CHECKER — EXPENSES ================= */
const EXP_CATS=['Labor','Ice','Salt','Packaging','Fuel','Transport','Customer Loans','Other'];
function renderExpenses(){
  const ex=state.expenses;const total=ex.reduce((a,e)=>a+e.amount,0);
  const loans=ex.filter(e=>e.cat==='Customer Loans').reduce((a,e)=>a+e.amount,0);
  return `
  <div class="grid g3">
    <div class="stat"><div class="lab">Total Expenses</div><div class="val">${fm(total)}</div><div class="delta">${ex.length} logged entries</div></div>
    <div class="stat"><div class="lab">Operational (excl. loans)</div><div class="val">${fm(total-loans)}</div><div class="delta">ice, salt, labor, transit, etc.</div></div>
    <div class="stat"><div class="lab">Customer Loans Outstanding</div><div class="val" style="color:var(--b)">${fm(loans)}</div><div class="delta">receivables to collect</div></div>
  </div>
  <div class="grid g2 mt">
    <div class="card">
      <div class="section-head"><h3>🧾 Log Operational Expense</h3></div>
      <div class="form-row">
        <div class="fgroup"><label>Category</label><select id="ex-cat">${EXP_CATS.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="fgroup"><label>Amount (₱)</label><input id="ex-amt" type="number" min="0" value="1000"/></div>
      </div>
      <div class="fgroup"><label>Description</label><input id="ex-desc" placeholder="What was this for?"/></div>
      <button class="btn block" onclick="addExpense()">+ Log Expense</button>
    </div>
    <div class="card">
      <div class="section-head"><h3>📒 Expense Ledger</h3></div>
      <table class="tbl"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
      <tbody>
        ${ex.length?ex.map(e=>`<tr><td>${e.date}</td><td><span class="tag">${e.cat}</span></td><td>${esc(e.desc)}</td><td><b>${fm(e.amount)}</b></td><td><button class="icon-btn" onclick="delExp(${e.id})">🗑</button></td></tr>`).join('')
          :`<tr><td colspan="5" class="empty">No expenses logged</td></tr>`}
      </tbody></table>
    </div>
  </div>`;
}
function addExpense(){
  const cat=$('#ex-cat').value,amt=+$('#ex-amt').value,desc=$('#ex-desc').value.trim()||cat;
  if(!amt||amt<0){toast('Enter a valid amount','erro');return;}
  state.expenses.unshift({id:Math.max(0,...state.expenses.map(e=>e.id))+1,cat,amount:amt,desc,date:todayISO()});
  toast('Expense logged — '+fm(amt));render();
}
function delExp(id){state.expenses=state.expenses.filter(e=>e.id!==id);toast('Expense entry removed');render();}

/* ============ CHECKER — PROFITABILITY TRACKER ============ */
function invStats(){
  const inv=state.inventory;
  const inStock=inv.reduce((a,i)=>a+i.qty,0);
  const sold=state.sales.reduce((a,s)=>a+s.qty,0);
  const wasted=state.losses.reduce((a,l)=>a+l.qty,0);
  return {inStock,sold,wasted};
}
function profitability(){
  const purchases=state.supplies.reduce((a,s)=>a+s.total,0);
  const expenses=state.expenses.reduce((a,e)=>a+e.amount,0);
  const costs=purchases+expenses;
  const revenue=state.sales.reduce((a,s)=>a+s.revenue,0);
  const lossValue=state.losses.reduce((a,l)=>a+l.value,0);
  const net=revenue-costs-lossValue;
  const margin=costs?((revenue-lossValue)/costs-1)*100:0;
  return {purchases,expenses,costs,revenue,lossValue,net,margin};
}
function renderProfit(){
  const p=profitability();const iv=invStats();
  const stock=state.inventory;
  const clsOf=id=>{const i=stock.find(x=>x.id===id);return i?i.cls:'A'};
  return `
  <div class="grid g4">
    <div class="stat"><div class="lab">Revenue</div><div class="val" style="color:var(--a)">${fm(p.revenue)}</div><div class="delta">${state.sales.length} recorded sales</div></div>
    <div class="stat"><div class="lab">Total Cost (Buy + Ops)</div><div class="val" style="color:var(--c)">${fm(p.costs)}</div><div class="delta">purchases ${fm(p.purchases)} + expenses ${fm(p.expenses)}</div></div>
    <div class="stat"><div class="lab">Spoilage / Losses</div><div class="val" style="color:var(--warn)">${fm(p.lossValue)}</div><div class="delta">${state.losses.map(l=>l.qty).reduce((a,b)=>a+b,0)} boxes wasted</div></div>
    <div class="stat"><div class="lab ${p.net<0?'':'ok'}">Net Profit</div><div class="val ${p.net<0?'':'oky'}" style="color:${p.net<0?'var(--c)':'var(--a)'}">${fm(p.net)}</div><div class="delta">margin ${p.margin.toFixed(1)}%</div></div>
  </div>
  <div class="grid g2 mt">
    <div class="card">
      <div class="section-head"><h3>💰 Record Sale</h3></div>
      <p class="hint">Sell from classified stock — reduces inventory and books revenue.</p>
      <div class="form-row">
        <div class="fgroup"><label>Inventory Box</label><select id="s-box">${stock.filter(i=>i.qty>0).map(i=>`<option value="${i.id}">${i.id} · ${esc(i.species)} (${i.qty} left)</option>`).join('')}</select></div>
        <div class="fgroup"><label>Sold Units</label><input id="s-qty" type="number" min="1" value="1"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label>Unit Price (₱)</label><input id="s-price" type="number" min="0" value="2500"/></div>
        <div class="fgroup"><label>Customer / Buyer</label><input id="s-buyer" placeholder="Buyer name"/></div>
      </div>
      <button class="btn ok block" onclick="recordSale()">+ Record Sale</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:16px 0"/>
      <div class="section-head"><h3>⚠️ Record Loss (Spoilage)</h3></div>
      <div class="form-row">
        <div class="fgroup"><label>Inventory Box</label><select id="l-box">${stock.filter(i=>i.qty>0).map(i=>`<option value="${i.id}">${i.id} · ${esc(i.species)}</option>`).join('')}</select></div>
        <div class="fgroup"><label>Lost Units</label><input id="l-qty" type="number" min="1" value="1"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label>Est. Value Lost (₱)</label><input id="l-val" type="number" min="0" value="500"/></div>
        <div class="fgroup"><label>Reason</label><input id="l-reason" placeholder="e.g. spoilage"/></div>
      </div>
      <button class="btn danger block" onclick="recordLoss()">− Write Off Spoilage</button>
    </div>

    <div class="card">
      <div class="section-head"><h3>📦 Inventory Movements</h3><span class="tag">in: ${iv.inStock} · sold: ${iv.sold} · wasted: ${iv.wasted}</span></div>
      <div class="mini-label">Current Stock by Tier</div>
      ${(['A','B','C']).map(cl=>{
        const tot=stock.filter(i=>i.cls===cl).reduce((a,i)=>a+i.qty,0);
        const mx=Math.max(1,...stock.filter(i=>i.cls===cl).map(i=>i.qty));
        const color={A:'#16a34a',B:'#f59e0b',C:'#dc2626'}[cl];
        return `<div class="bar-row"><span class="lbl">Class ${cl}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(100,Math.min(100,tot/mx*100))}%;background:${color}">${tot}</div></div></div>`;
      }).join('')}
      <div class="mini-label">Recent Sales</div>
      <table class="tbl"><thead><tr><th>Box</th><th>Tier</th><th>Buyer</th><th>Qty</th><th>₱</th><th>Revenue</th></tr></thead>
      <tbody>
        ${state.sales.length?state.sales.slice(0,8).map(s=>`<tr><td>${s.box}</td><td><span class="pill ${clsOf(s.box).toLowerCase()}">${clsOf(s.box)}</span></td><td>${esc(s.buyer)}</td><td>${s.qty}</td><td>${fm(s.price)}</td><td><b>${fm(s.revenue)}</b></td></tr>`).join('')
        :`<tr><td colspan="6" class="empty">No sales yet</td></tr>`}
      </tbody></table>
    </div>
  </div>
  <div class="card mt">
    <div class="section-head"><h3>📉 Loss Register</h3></div>
    <table class="tbl"><thead><tr><th>Date</th><th>Box</th><th>Reason</th><th>Units</th><th>Value Lost</th></tr></thead>
    <tbody>
      ${state.losses.length?state.losses.map(l=>`<tr><td>${l.date}</td><td>${l.box}</td><td>${esc(l.reason)}</td><td>${l.qty}</td><td style="color:var(--c)"><b>${fm(l.value)}</b></td></tr>`).join('')
      :`<tr><td colspan="5" class="empty">No recorded losses</td></tr>`}
    </tbody></table>
    <div class="notice">💡 When a Class C spoils, write it off here — the value flows into net profitability and the Owner's report automatically.</div>
  </div>`;
}
function recordSale(){
  const box=$('#s-box').value,qty=Math.max(1,+$('#s-qty').value||1),price=Math.max(0,+$('#s-price').value||0),buyer=$('#s-buyer').value.trim()||'Walk-in';
  const item=state.inventory.find(i=>i.id===box);
  if(!item||item.qty<qty){toast('Insufficient stock in that box','erro');return;}
  item.qty-=qty;
  state.sales.unshift({id:Math.max(0,...state.sales.map(s=>s.id))+1,box,buyer,qty,price,revenue:qty*price,date:todayISO()});
  toast('Sale recorded — '+fm(qty*price));render();
}
function recordLoss(){
  const box=$('#l-box').value,qty=Math.max(1,+$('#l-qty').value||1),val=Math.max(0,+$('#l-val').value||0),reason=$('#l-reason').value.trim()||'Spoilage';
  const item=state.inventory.find(i=>i.id===box);
  if(!item||item.qty<qty){toast('Insufficient stock','erro');return;}
  item.qty-=qty;
  state.losses.unshift({id:Math.max(0,...state.losses.map(l=>l.id))+1,box,reason,qty,value:val,date:todayISO()});
  toast('Loss written off — '+fm(val),'warnb');render();
}

/* ================= CHAT ================= */
function visibleChannels(){return channels.filter(c=>c.roles.includes(cur.role));}
function renderChat(){
  const vc=visibleChannels();
  if(!channels.find(c=>c.id===chatCh&&c.roles.includes(cur.role)))chatCh=vc[0].id;
  const msgs=state.chat.filter(m=>m.ch===chatCh&&channels.find(c=>c.id===chatCh).roles.includes(cur.role));
  const members=channels.find(c=>c.id===chatCh).roles;
  const chName=channels.find(c=>c.id===chatCh).name;
  const online=members.length;
  return `
  <div class="chat-wrap">
    <div class="chat-side card" style="padding:12px">
      <div class="mini-label" style="margin-top:4px">Channels</div>
      ${vc.map(c=>`<button class="channel ${c.id===chatCh?'active':''}" onclick="setCh('${c.id}')"><span class="dot" style="background:${c.dot}"></span>${c.name}</button>`).join('')}
    </div>
    <div class="chat-main">
      <div class="chat-head"><div><h3>${chName}</h3><div class="on"><span class="pulse"></span> ${online} member(s) online · real-time</div></div><div class="right"><span class="tag">${members.map(r=>r+'s').join(' · ')}</span></div></div>
      <div class="msg-area">
        ${msgs.map(m=>{const mine=m.who===cur.id;const u=byId(m.who)||{f:m.name,l:'',role:m.role};return `
          <div class="msg ${mine?'mine':'other'}">
            <div class="mhead">${mine?'':'<span class="avatar" style="width:20px;height:20px;font-size:10px">'+(u.f&&u.f[0]||'?')+'</span>'}<span>${esc(u.f+' '+(u.l||''))} · ${u.role}</span><span class="mt">${m.t}</span></div>
            <div>${esc(m.text)}</div>
          </div>`;}).join('') || `<div class="empty" style="text-align:center;color:var(--muted);padding:40px">No messages in this channel yet — start the conversation.</div>`}
      </div>
      <div class="chat-input">
        <textarea id="chatText" placeholder="Message ${chName}… (Enter to send)" onkeydown="chatKey(event)"></textarea>
        <button class="btn" onclick="sendChat()">Send ➤</button>
      </div>
    </div>
  </div>`;
}
function setCh(id){chatCh=id;render();$('#chatText')&&$('#chatText').focus();}
function chatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}
function sendChat(){
  const t=document.getElementById('chatText');const txt=t&&t.value.trim();if(!txt)return;
  state.chat.push({id:nextMsg(),ch:chatCh,who:cur.id,name:cur.f+' '+cur.l,role:cur.role,text:txt,t:today.toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})});
  render();const a=$('.msg-area');if(a)a.scrollTop=a.scrollHeight;
}

/* ================= OWNER — EMPLOYEES ================= */
function renderEmployees(){
  return `
  <div class="grid g2">
    <div class="card">
      <div class="section-head"><h3>🧑‍💼 Add Employee</h3></div>
      <p class="hint">Date hired is captured automatically. Note the password shown — it becomes the employee's login credential.</p>
      <div class="form-row">
        <div class="fgroup"><label>First Name</label><input id="em-f" placeholder="Juan"/></div>
        <div class="fgroup"><label>Last Name</label><input id="em-l" placeholder="Dela Cruz"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label>Username</label><input id="em-u" placeholder="juan.delacruz"/></div>
        <div class="fgroup"><label>Email</label><input id="em-e" type="email" placeholder="juan@email.com"/></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label>Contact Number</label><input id="em-c" placeholder="09xx-xxx-xxxx"/></div>
        <div class="fgroup"><label>Role</label><select id="em-r">${[R_BUYER,R_CLASS,R_CHECK].map(r=>`<option>${r}</option>`).join('')}</select></div>
      </div>
      <div class="fgroup"><label>Password (auto-generate if blank)</label><input id="em-p" placeholder="leave blank to auto-generate"/></div>
      <button class="btn block" onclick="addEmployee()">+ Add Employee</button>
    </div>
    <div class="card">
      <div class="section-head"><h3>Employee Roster</h3><span class="tag">${state.employees.length} active</span></div>
      <table class="tbl"><thead><tr><th>Employee</th><th>ID</th><th>Contact</th><th>Date Hired</th><th>Role</th><th></th></tr></thead>
      <tbody>
        ${state.employees.map(e=>`<tr>
          <td><div class="flex"><span class="avatar" style="width:30px;height:30px;font-size:12px">${e.f[0]}</span><div><div style="font-weight:700">${esc(e.f+' '+e.l)}</div><div class="small">PW: <span class="mono">${e.pw}</span></div></div></div></td>
          <td><span class="tag">${e.id}</span></td><td>${esc(e.contact)}</td><td>${e.hired}</td>
          <td><span class="pill ${e.role==='Owner'?'gray':e.role==='Buyer'?'tone':e.role==='Classifier'?'b':'a'}">${e.role}</span></td>
          <td>
${e.role!==R_OWNER?`<button class="icon-btn" title="Remove employee" onclick="delEmployee('${e.id}')">🗑</button>`:''}
<button class="icon-btn" title="Change password" onclick="ownerChangePassword('${e.id}')">🔑</button>
</td>
        </tr>`).join('')}
      </tbody></table>
      <div class="notice">🗑 Use the delete button to remove an employee who has been fired. The Owner account itself cannot be deleted.</div>
    </div>
  </div>`;
}
function addEmployee(){
  const f=$('#em-f').value.trim(),l=$('#em-l').value.trim(),username=normalize($('#em-u').value),email=normalize($('#em-e').value),c=$('#em-c').value.trim(),r=$('#em-r').value;
  let pw=$('#em-p').value.trim();
  if(!f||!l||!username||!email||!c){toast('Fill name, username, email and contact','erro');return;}
  if(findAccount(username)||findAccount(email)){toast('Username or email already exists','erro');return;}
  if(!pw)pw=('fish'+(Math.random()*99999|0));
  const id=empNextId();
  state.employees.push({id,f,l,contact:c,hired:todayISO(),role:r,pw,username,email}); saveAuthState();
  toast('Added '+f+' '+l+' ('+id+') — role '+r);
  if(cur.role===R_OWNER&&$('#em-f')){$('#em-f').value='';$('#em-l').value='';$('#em-u').value='';$('#em-e').value='';$('#em-c').value='';$('#em-p').value='';}
  render();
}
function delEmployee(id){
  const e=byId(id);if(!e)return;
  if(e.role===R_OWNER){toast('Owner accounts cannot be removed','erro');return;}
  if(e.id===cur.id){toast('Cannot remove yourself while signed in','erro');return;}
  if(!confirm('Fire / remove '+e.f+' '+e.l+' ('+id+')?'))return;
  state.employees=state.employees.filter(x=>x.id!==id); saveAuthState();
  toast(e.f+' '+e.l+' removed from roster','warnb');render();
}

function ownerChangePassword(id){
  if(!cur || cur.role!==R_OWNER){toast('Owner permission required','erro');return;}
  const e=byId(id); if(!e)return;
  const p=prompt('Enter a new password for '+e.f+' '+e.l+':');
  if(p===null)return;
  if(p.length<6){toast('Password must be at least 6 characters.','erro');return;}
  e.pw=p; saveAuthState();
  toast('Password changed for '+e.id+'.');
  render();
}

function renderRoleAccess(){
  const employees=state.employees;
  return `
  <section class="form-container">
    <h2>Role &amp; Access Assignment</h2>
    <p>Assign an employee a role and select the functions they are allowed to access.</p>
    <form id="roleAccessForm">
      <div class="form-group">
        <label for="employee">Select Employee:</label>
        <select id="employee" name="employee" required>
          <option value="">-- Select Employee --</option>
          ${employees.map(e=>`<option value="${esc(e.id)}">${esc(e.f+' '+e.l)} (${esc(e.id)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="role">Select Role:</label>
        <select id="role" name="role" required>
          <option value="">-- Select Role --</option>
          ${ROLES.map(role=>`<option value="${role}">${role}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>System Access:</label>
        <div class="checkbox-group">
          ${['Fish Quality','Inventory','Sales','Reports'].map(access=>`<label><input type="checkbox" name="access" value="${access}"> ${access}</label>`).join('')}
        </div>
      </div>
      <button type="submit" class="assign-btn">Assign Role</button>
    </form>
    <p id="successMessage" role="status" aria-live="polite"></p>
  </section>`;
}

function setupRoleAccessForm(){
  const roleAccessForm=document.getElementById('roleAccessForm');
  const successMessage=document.getElementById('successMessage');
  if(!roleAccessForm||!successMessage)return;

  roleAccessForm.addEventListener('submit',function(event){
    event.preventDefault();

    const employeeId=document.getElementById('employee').value;
    const role=document.getElementById('role').value;
    const checkedAccess=document.querySelectorAll('input[name="access"]:checked');
    const accessList=[];

    checkedAccess.forEach(function(access){accessList.push(access.value);});

    if(employeeId===''){
      successMessage.textContent='Please select an employee.';
      return;
    }
    if(role===''){
      successMessage.textContent='Please select a role.';
      return;
    }
    if(accessList.length===0){
      successMessage.textContent='Please select at least one system access.';
      return;
    }

    const employee=byId(employeeId);
    if(!employee){
      successMessage.textContent='Please select a valid employee.';
      return;
    }

    employee.role=role;
    employee.access=accessList;
    saveAuthState();
    successMessage.innerHTML='✅ <strong>Role Assignment Successful!</strong><br>'+
      'Employee: '+esc(employee.f+' '+employee.l)+'<br>'+
      'Role: '+esc(role)+'<br>'+
      'Access: '+esc(accessList.join(', '));
    toast('Role and access updated for '+employee.id+'.');
    roleAccessForm.reset();
  });
}

/* ================= OWNER — DECISION SUPPORT REPORT ================= */
function renderReport(){
  const p=profitability();const iv=invStats();
  const inv=state.inventory;
  const qual=inv.reduce((a,i)=>{a[i.cls]=(a[i.cls]||0)+i.qty;return a;},{});
  const QA=qual.A||0,QB=qual.B||0,QC=qual.C||0,QT=QA+QB+QC||1;
  const cExpBy=cat=>state.expenses.filter(e=>e.cat===cat).reduce((a,e)=>a+e.amount,0);
  const expTot=state.expenses.reduce((a,e)=>a+e.amount,0);
  const recent=state.sales.slice(0,4);
  const lossUnits=state.losses.reduce((a,l)=>a+l.qty,0);
  // decision recommendations
  const recs=[];
  if(QC/QT>0.25)recs.push('High Class C ratio — accelerate discounted sales or donate, to curb spoilage.');else recs.push('Class C share is within control — keep moving inventory within 48h.');
  if(p.lossValue>20000)recs.push('Spoilage losses are exceeding budget — increase ice usage and shorten cold-chain gaps.');else recs.push('Spoilage write-offs are manageable.');
  if(cExpBy('Ice')+cExpBy('Fuel')>p.revenue*0.08)recs.push('Ice + fuel costs are heavy vs revenue — renegotiate logistics and supplier ice rates.');else recs.push('Logistics cost share is within a healthy band.');
  if(p.margin>18)recs.push('Healthy margin — consider scaling procurement of high-grade (Class A) lots.');else recs.push('Margin under pressure — review purchase basis and repricing of Class B/C.');
  // expense breakdown share
  const cats=[['Labor',cExpBy('Labor')],['Ice',cExpBy('Ice')],['Salt',cExpBy('Salt')],['Packaging',cExpBy('Packaging')],['Fuel',cExpBy('Fuel')],['Transport',cExpBy('Transport')],['Loans',cExpBy('Customer Loans')]].filter(x=>x[1]>0);
  const maxExp=Math.max(1,...cats.map(x=>x[1]));
  return `
  <div class="grid g4">
    <div class="stat"><div class="lab">Gross Revenue</div><div class="val" style="color:var(--a)">${fm(p.revenue)}</div><div class="delta">${state.sales.length} sales</div></div>
    <div class="stat"><div class="lab">Total Costs</div><div class="val" style="color:var(--c)">${fm(p.costs)}</div><div class="delta">buy ${fm(p.purchases)} + ops ${fm(p.expenses)}</div></div>
    <div class="stat"><div class="lab">Spoilage Value</div><div class="val" style="color:var(--warn)">${fm(p.lossValue)}</div><div class="delta">${lossUnits} boxes written off</div></div>
    <div class="stat"><div class="lab">Net Profit</div><div class="val" style="color:${p.net<0?'var(--c)':'var(--a)'}">${fm(p.net)}</div><div class="delta">margin ${p.margin.toFixed(1)}%</div></div>
  </div>

  <div class="grid g2 mt">
    <div class="card">
      <div class="section-head"><h3>🎯 Executive Strategy Recommendations</h3></div>
      <div class="flow">
        <div class="flow-step"><div class="flow-node">1</div><div class="flow-body"><h5>Procurement & Assessment</h5><p>Buyer negotiates ${state.supplies.length} lots (${fm(p.purchases)}). Classifier graded into ${QA}/${QB}/${QC} boxes (A/B/C).</p></div></div>
        <div class="flow-step"><div class="flow-node">2</div><div class="flow-body"><h5>Ledger & Cost Integration</h5><p>Checker attaches ${fm(cExpBy('Ice'))} ice, ${fm(cExpBy('Labor'))} labor, ${fm(cExpBy('Transport'))} transit onto purchase basis → precise batch cost.</p></div></div>
        <div class="flow-step"><div class="flow-node">3</div><div class="flow-body"><h5>Sales & Reporting</h5><p>${state.sales.length} sales logged (${fm(p.revenue)}), ${lossUnits} spoiled units written off. Compiled into this consolidated report.</p></div></div>
      </div>
      <div class="notice"><b>Strategy map:</b><br/>• ${recs.join('<br/>• ')}</div>
    </div>

    <div class="card">
      <div class="section-head"><h3>📊 Cost & Profit Composition</h3></div>
      <div class="mini-label">Quality Mix (stock boxes)</div>
      <div class="bar-row"><span class="lbl">Class A</span><div class="bar-track"><div class="bar-fill" style="width:${QA/QT*100}%;background:#16a34a">${QA}</div></div></div>
      <div class="bar-row"><span class="lbl">Class B</span><div class="bar-track"><div class="bar-fill" style="width:${QB/QT*100}%;background:#f59e0b">${QB}</div></div></div>
      <div class="bar-row"><span class="lbl">Class C</span><div class="bar-track"><div class="bar-fill" style="width:${QC/QT*100}%;background:#dc2626">${QC}</div></div></div>

      <div class="mini-label">Expense Allocation (% of total costs)</div>
      ${cats.map(c=>`<div class="bar-row"><span class="lbl">${c[0]}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(8,c[1]/p.costs*100)}%;background:#0e7490">${fm(c[1])}</div></div></div>`).join('')}

      <div class="mini-label">Recent Sales</div>
      ${recent.length?recent.map(s=>`<div class="bar-row"><span class="lbl">${s.buyer}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(8,s.revenue/Math.max(1,p.revenue)*100)}%;background:#0d9488">${fm(s.revenue)}</div></div></div>`).join(''):'<div class="small">No sales yet.</div>'}
    </div>
  </div>

  <div class="card mt">
    <div class="section-head"><h3>📑 Consolidated Executive Snapshot</h3><span class="tag">Business flow: Purchase → Grade → Log → Sell → Report</span></div>
    <div class="grid g4" style="gap:14px">
      <div><div class="small" style="color:var(--muted)">Procurement Spend</div><div class="kpi-big" style="color:var(--c)">${fm(p.purchases)}</div><div class="small">supplier cost of fish</div></div>
      <div><div class="small" style="color:var(--muted)">Operational Cost</div><div class="kpi-big" style="color:var(--c)">${fm(p.expenses)}</div><div class="small">incl. loans receivable</div></div>
      <div><div class="small" style="color:var(--muted)">Units Turned</div><div class="kpi-big" style="color:var(--brand2)">${iv.sold}<span style="font-size:16px"> sold</span></div><div class="small">${iv.inStock} in stock · ${iv.wasted} wasted</div></div>
      <div><div class="small" style="color:var(--muted)">Cash Margin</div><div class="kpi-big" style="color:var(--a)">${p.margin.toFixed(1)}%</div><div class="small">net over total cost</div></div>
    </div>
    <div class="notice mt">🏛️ Prepared by the <b>Checker</b> from live expenses, sales, spoilage and quality logs; reviewed by the <b>Owner</b> for strategic and purchasing decisions.</div>
  </div>`;
}

/* ================= TASK 4 — BASIC TABLES ================= */
function renderBasicTables(){
  return `
  <div class="task4-header">
    <div>
      <div class="mini-label">TASK 4</div>
      <h2>Basic System Tables</h2>
      <p class="hint">Sample records for the Fish Check — GSCFPC Management System.</p>
    </div>
    <span class="task4-badge">3 TABLES • 5 RECORDS EACH</span>
  </div>

  <div class="card mt">
    <div class="section-head">
      <div>
        <h3>👥 Employee Records</h3>
        <p class="table-description">Registered employees and their assigned system roles.</p>
      </div>
      <span class="tag">5 Records</span>
    </div>
    <div class="table-wrap">
      <table class="tbl task4-table">
        <thead><tr><th>Employee</th><th>Employee ID</th><th>Contact</th><th>Date Hired</th><th>Role</th></tr></thead>
        <tbody>${state.employees.slice(0,5).map(e=>`
          <tr>
            <td><div class="flex"><span class="avatar task4-avatar">${e.f[0]}</span><div><div class="task4-name">${esc(e.f+' '+e.l)}</div></div></div></td>
            <td><span class="tag">${e.id}</span></td>
            <td>${esc(e.contact)}</td>
            <td>${e.hired}</td>
            <td><span class="pill ${e.role==='Owner'?'gray':e.role==='Buyer'?'tone':e.role==='Classifier'?'b':'a'}">${e.role}</span></td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>

  <div class="card mt">
    <div class="section-head">
      <div>
        <h3>🛒 Purchase Records</h3>
        <p class="table-description">Sample purchase lots recorded by the Buyer.</p>
      </div>
      <span class="tag">5 Records</span>
    </div>
    <div class="table-wrap">
      <table class="tbl task4-table">
        <thead><tr><th>Date</th><th>Size</th><th>Supplier</th><th>Boxes</th><th>Price / Box</th><th>Total</th><th>Quality</th></tr></thead>
        <tbody>${state.supplies.slice(0,5).map(s=>`
          <tr>
            <td>${s.date}</td><td><span class="tag">${s.size}</span></td><td>${esc(s.supplier)}</td>
            <td><b>${s.boxes}</b></td><td>${fm(s.price)}</td><td><b>${fm(s.total)}</b></td>
            <td><span class="pill ${s.quality[6].toLowerCase()}">${s.quality}</span></td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>

  <div class="card mt">
    <div class="section-head">
      <div>
        <h3>📦 Inventory Records</h3>
        <p class="table-description">Quality-verified fish inventory available in the system.</p>
      </div>
      <span class="tag">5 Records</span>
    </div>
    <div class="table-wrap">
      <table class="tbl task4-table">
        <thead><tr><th>Box Reference</th><th>Species</th><th>Quality Tier</th><th>Quantity</th><th>Produced Date</th><th>Status</th></tr></thead>
        <tbody>${state.inventory.slice(0,5).map(i=>`
          <tr>
            <td><b>${i.id}</b></td><td>${esc(i.species)}</td>
            <td><span class="pill ${i.cls.toLowerCase()}">Class ${i.cls}</span></td>
            <td><b>${i.qty}</b> boxes</td><td>${i.date}</td>
            <td><span class="status-available">Available</span></td>
          </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>

  <div class="notice task4-notice"><b>Task 4 — Basic Table Requirement:</b> These tables contain relevant sample records from the Fish Check — GSCFPC Management System and are integrated into the existing system interface.</div>
  `;
}

/* =========================================================
   TASK 5 — INTERACTIVE WEB FORMS AND DATA INPUT
   ========================================================= */
function renderTask5(){
  return `
  <div class="task5-header">
    <div>
      <div class="mini-label">TASK 5</div>
      <h2>Interactive Data Entry</h2>
      <p class="hint">Add new employee and purchase records using interactive web forms. Submitted information is immediately added to the corresponding system tables.</p>
    </div>
    <span class="task5-badge">2 INTERACTIVE FORMS</span>
  </div>

  <div class="card task5-card">
    <div class="section-head">
      <div><h3>👤 Add Employee</h3><p class="table-description">Add a new employee to the Employee Records table.</p></div>
      <span class="tag">Employee Records</span>
    </div>
    <form id="task5EmployeeForm" class="task5-form">
      <div class="form-row">
        <div class="fgroup"><label for="t5-em-f">First Name</label><input id="t5-em-f" type="text" placeholder="Juan" required /></div>
        <div class="fgroup"><label for="t5-em-l">Last Name</label><input id="t5-em-l" type="text" placeholder="Dela Cruz" required /></div>
      </div>
      <div class="form-row">
        <div class="fgroup"><label for="t5-em-c">Contact Number</label><input id="t5-em-c" type="tel" placeholder="0917-123-4567" required /></div>
        <div class="fgroup"><label for="t5-em-r">Role</label><select id="t5-em-r" required><option value="">Select Role</option><option value="Buyer">Buyer</option><option value="Classifier">Classifier</option><option value="Checker">Checker</option></select></div>
      </div>
      <div class="fgroup"><label for="t5-em-p">Password</label><input id="t5-em-p" type="password" placeholder="Enter employee password" required /></div>
      <button type="submit" class="btn">+ Add Employee</button>
    </form>
  </div>

  <div class="card task5-card mt">
    <div class="section-head">
      <div><h3>🛒 Add Purchase Record</h3><p class="table-description">Add a new purchase lot to the Purchase Records table.</p></div>
      <span class="tag">Purchase Records</span>
    </div>
    <form id="task5PurchaseForm" class="task5-form">
      <div class="form-row">
        <div class="fgroup"><label for="t5-p-date">Purchase Date</label><input id="t5-p-date" type="date" value="${todayISO()}" required /></div>
        <div class="fgroup"><label for="t5-p-size">Fish Size</label><select id="t5-p-size" required><option value="Big">Big</option><option value="Medium">Medium</option><option value="Small">Small</option></select></div>
      </div>
      <div class="fgroup"><label for="t5-p-supplier">Supplier</label><input id="t5-p-supplier" type="text" placeholder="Supplier name" required /></div>
      <div class="form-row">
        <div class="fgroup"><label for="t5-p-boxes">Number of Boxes</label><input id="t5-p-boxes" type="number" min="1" value="10" required /></div>
        <div class="fgroup"><label for="t5-p-price">Price per Box (₱)</label><input id="t5-p-price" type="number" min="1" value="2000" required /></div>
      </div>
      <div class="fgroup"><label for="t5-p-quality">Quality Tier</label><select id="t5-p-quality" required><option value="Class A">Class A</option><option value="Class B">Class B</option><option value="Class C">Class C</option></select></div>
      <button type="submit" class="btn">+ Add Purchase Record</button>
    </form>
  </div>

  <div class="notice task5-notice mt"><b>How this works:</b> Enter information into either form and click the corresponding submit button. JavaScript captures the form data and dynamically adds the new record to the appropriate Task 4 table.</div>`;
}

function submitTask5Employee(e){
  e.preventDefault();
  const f=$('#t5-em-f').value.trim(),l=$('#t5-em-l').value.trim(),c=$('#t5-em-c').value.trim(),r=$('#t5-em-r').value,pw=$('#t5-em-p').value;
  if(!f||!l||!c||!r||!pw){toast('Please complete all employee fields.','erro');return;}
  const id=empNextId();
  state.employees.push({id,f,l,contact:c,hired:todayISO(),role:r,pw,username:'',email:''}); saveAuthState();
  toast('Employee '+f+' '+l+' added successfully ('+id+').');
  render();
}

function submitTask5Purchase(e){
  e.preventDefault();
  const date=$('#t5-p-date').value,size=$('#t5-p-size').value,supplier=$('#t5-p-supplier').value.trim(),boxes=Number($('#t5-p-boxes').value),price=Number($('#t5-p-price').value),quality=$('#t5-p-quality').value;
  if(!date||!size||!supplier||boxes<1||price<1||!quality){toast('Please complete all purchase fields.','erro');return;}
  const total=boxes*price;
  const newId=Math.max(0,...state.supplies.map(s=>Number(s.id)||0))+1;
  state.supplies.unshift({id:newId,size,supplier,boxes,price,total,quality,date});
  toast('Purchase record added — '+fm(total));
  render();
}

document.addEventListener('submit',e=>{
  if(e.target.id==='task5EmployeeForm')submitTask5Employee(e);
  if(e.target.id==='task5PurchaseForm')submitTask5Purchase(e);
});

loadAuthState();

state.employees.forEach(e=>{
  if(!e.username && e.role!==R_OWNER){
    e.username=(e.f+'.'+e.l).toLowerCase().replace(/[^a-z0-9.]/g,'');
  }
  if(!e.email && e.role!==R_OWNER){
    e.email=e.username+'@fishcheck.local';
  }
});

saveAuthState();
/* ================= boot ================= */
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('lg-id')&&!document.getElementById('app').style.display)doLogin();});

