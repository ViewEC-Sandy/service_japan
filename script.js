/* ViewEC Corp. 方案與費用試算邏輯 */
const PRICE_CONFIG={
  plans:{
    starter:{name:'基礎導入方案',price:null,type:'oneTime',revenueRate:0},
    growth:{name:'日本市場陪跑方案',price:null,type:'monthly',revenueRate:0},
    salesSimple:{name:'代銷售｜簡易方案',price:19800,type:'monthly',revenueRate:.25},
    salesBasic:{name:'代銷售｜基本方案',price:25800,type:'monthly',revenueRate:.25},
    managedBasic:{name:'客製代營運｜基本方案',price:36000,type:'monthly',revenueRate:.03},
    managedDesign:{name:'客製代營運｜圖片設計方案',price:48000,type:'monthly',revenueRate:.03},
    managedMarketing:{name:'客製代營運｜行銷設計方案',price:52000,type:'monthly',revenueRate:.03}
  },
  services:{
    storeSetup:{name:'店鋪帳號開立',price:80000,type:'oneTime'},
    orders:{name:'訂單處理與出貨服務',price:12000,type:'monthly'},
    cs:{name:'日文客服對應與評價管理',price:15000,type:'monthly'},
    adManagement:{name:'廣告投放服務',price:null,type:'monthly',rate:.10},
    campaign:{name:'行銷活動設定',price:null,type:'oneTime'},
    data:{name:'數據分析與報告製作',price:1000,type:'oneTime'}
  },
  materials:{
    main:{name:'商品主圖｜1 Listing・1張',price:1300},
    set:{name:'商品主圖＋商品介紹圖｜1 Listing・共9張',price:10000},
    resize:{name:'Resize 尺寸調整',price:1000},
    banner:{name:'品牌圖／促銷活動 Banner',price:1000}
  }
};

/* 方案已包含的單項服務。被包含的項目不會重複計費。 */
const PLAN_INCLUDED_SERVICES={
  salesSimple:['orders','cs','campaign'],
  salesBasic:['orders','cs','campaign'],
  managedBasic:['orders','cs','campaign','adManagement','data'],
  managedDesign:['orders','cs','campaign','adManagement','data'],
  managedMarketing:['orders','cs','campaign','adManagement','data']
};

const money=n=>`NT$ ${Number(n||0).toLocaleString('zh-TW')}`;
const stateKey='viewecQuoteStateV6';
const defaultState={plan:null,services:[],estimatedRevenue:0,adBudget:0,materials:{main:0,set:0,resize:0,banner:0}};

function getState(){
  try{
    const raw=JSON.parse(localStorage.getItem(stateKey)||'{}');
    const state={...defaultState,...raw,materials:{...defaultState.materials,...(raw.materials||{})}};
    state.services=(state.services||[]).filter(k=>PRICE_CONFIG.services[k]);
    if(state.plan&&!PRICE_CONFIG.plans[state.plan])state.plan=null;
    return state;
  }catch{return structuredClone(defaultState)}
}
const setState=s=>localStorage.setItem(stateKey,JSON.stringify(s));
const includedForPlan=plan=>new Set(PLAN_INCLUDED_SERVICES[plan]||[]);

function removeIncludedServices(state){
  const included=includedForPlan(state.plan),removed=[];
  state.services=(state.services||[]).filter(k=>{if(included.has(k)){removed.push(k);return false}return true});
  return removed;
}



let initialized=false;
function initSite(){
  if(initialized)return;initialized=true;
  const menu=document.getElementById('menu'),nav=document.getElementById('nav');
  menu?.addEventListener('click',()=>nav?.classList.toggle('open'));
  document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  initStages();initPlanSelection();initSingleServices();renderEstimate();
}

function initStages(){
  const cards=[...document.querySelectorAll('.stage-card')];if(!cards.length)return;
  const activate=stage=>{cards.forEach(c=>c.classList.toggle('feature',c.dataset.stage===stage));document.querySelectorAll('#plans .price[data-plan]').forEach(p=>{const on=p.dataset.plan===stage;p.classList.toggle('popular',on);const b=p.querySelector('.recommended');if(b)b.hidden=!on;const btn=p.querySelector('.select-plan');if(btn&&!btn.classList.contains('is-selected')){btn.classList.toggle('cta',on);btn.classList.toggle('ghost',!on)}})};
  cards.forEach(c=>c.addEventListener('click',()=>{activate(c.dataset.stage);document.getElementById('plans')?.scrollIntoView({behavior:'smooth',block:'start'})}));
}

function syncPlanUI(plan){
  document.querySelectorAll('.select-plan').forEach(b=>{const on=b.dataset.plan===plan;b.textContent=on?'取消此方案':'選擇此方案';b.classList.toggle('is-selected',on)});
  document.querySelectorAll('[data-plan-col]').forEach(el=>el.classList.toggle('selected-col',el.dataset.planCol===plan));
}

function initPlanSelection(){
  document.querySelectorAll('.select-plan').forEach(btn=>btn.addEventListener('click',()=>{
    const s=getState();
    s.plan=s.plan===btn.dataset.plan?null:btn.dataset.plan;
    const removed=removeIncludedServices(s);setState(s);syncPlanUI(s.plan);updateFloating();
    const n=document.getElementById('selectionNotice');
    if(n){n.hidden=false;if(s.plan){const extra=removed.length?'；方案已包含的重複單項服務已自動移除。':'';n.innerHTML=`已選擇 <strong>${PRICE_CONFIG.plans[s.plan].name}</strong>${extra} <a href="addons.html">查看單項服務 →</a>`}else n.innerHTML='已取消服務方案。你仍可直接購買 <a href="addons.html">單項服務 →</a>'}
  }));
  const s=getState();syncPlanUI(s.plan);updateFloating();
}
function updateFloating(){const s=getState(),box=document.getElementById('floatingSummary');if(!box)return;box.hidden=!s.plan;if(s.plan)document.getElementById('floatingPlan').textContent=PRICE_CONFIG.plans[s.plan].name;}

function syncIncludedServiceUI(){
  const s=getState(),included=includedForPlan(s.plan);
  document.querySelectorAll('.service-check').forEach(c=>{
    const isIncluded=included.has(c.dataset.service);c.disabled=isIncluded;if(isIncluded)c.checked=false;
    const card=c.closest('[data-service-card]');card?.classList.toggle('service-included',isIncluded);
    const note=card?.querySelector('.included-note');if(note)note.hidden=!isIncluded;
  });
}

function initSingleServices(){
  const checks=[...document.querySelectorAll('.service-check')];if(!checks.length)return;
  let s=getState();removeIncludedServices(s);setState(s);
  checks.forEach(c=>c.checked=s.services.includes(c.dataset.service));
  syncIncludedServiceUI();
  const revenue=document.getElementById('estimatedRevenue'),adBudget=document.getElementById('adBudget');
  if(revenue)revenue.value=s.estimatedRevenue||'';if(adBudget)adBudget.value=s.adBudget||'';
  document.querySelectorAll('[data-material-input]').forEach(input=>{input.value=s.materials[input.dataset.materialInput]||0});

  checks.forEach(c=>c.addEventListener('change',()=>{s=getState();s.services=checks.filter(x=>x.checked&&!x.disabled).map(x=>x.dataset.service);setState(s);renderEstimate()}));
  revenue?.addEventListener('input',()=>{s=getState();s.estimatedRevenue=Math.max(0,Number(revenue.value)||0);setState(s);renderEstimate()});
  adBudget?.addEventListener('input',()=>{s=getState();s.adBudget=Math.max(0,Number(adBudget.value)||0);setState(s);renderEstimate()});
  document.querySelectorAll('[data-material-input]').forEach(input=>input.addEventListener('input',()=>{s=getState();const k=input.dataset.materialInput;s.materials[k]=Math.max(0,Number(input.value)||0);input.value=s.materials[k];setState(s);renderEstimate()}));
  document.querySelectorAll('[data-qty-action][data-material]').forEach(b=>b.addEventListener('click',()=>{const input=document.querySelector(`[data-material-input="${b.dataset.material}"]`);if(!input)return;input.value=Math.max(0,(Number(input.value)||0)+(b.dataset.qtyAction==='plus'?1:-1));input.dispatchEvent(new Event('input'))}));
  document.getElementById('clearSelection')?.addEventListener('click',()=>{setState(structuredClone(defaultState));location.reload()});
}

function renderEstimate(){
  const s=getState(),planEl=document.getElementById('estimatePlan'),servicesEl=document.getElementById('estimateServices');if(!planEl&&!servicesEl)return;
  removeIncludedServices(s);setState(s);syncIncludedServiceUI();
  let one=0,monthly=0,hasUnknown=false;const lines=[];const external=[];

  if(planEl){
    if(s.plan){const p=PRICE_CONFIG.plans[s.plan];const label=p.price==null?'待報價':`${money(p.price)}${p.type==='monthly'?'／月':''}`;planEl.innerHTML=`<span>${p.name}</span><strong>${label}</strong>`;if(p.price==null)hasUnknown=true;else if(p.type==='monthly')monthly+=p.price;else one+=p.price}
    else planEl.innerHTML='<span>未選擇，可只購買單項服務</span><strong></strong>';
  }

  let revenueFee=0;const selectedPlan=s.plan?PRICE_CONFIG.plans[s.plan]:null;const rf=document.getElementById('revenueFeeLine');
  if(selectedPlan?.revenueRate){
    if(s.estimatedRevenue){revenueFee=s.estimatedRevenue*selectedPlan.revenueRate;monthly+=revenueFee}
    if(rf)rf.innerHTML=`<span>預估營收 ${money(s.estimatedRevenue||0)} × ${selectedPlan.revenueRate*100}%</span><strong>${s.estimatedRevenue?money(revenueFee)+'／月':'請輸入營收'}</strong>`;
  }else if(rf)rf.innerHTML='<span>未選擇適用方案</span><strong></strong>';

  s.services.forEach(k=>{
    const a=PRICE_CONFIG.services[k];if(!a)return;
    if(k==='adManagement'){
      const fee=s.adBudget*a.rate;if(s.adBudget){monthly+=fee;external.push(`<div class="estimate-line"><span>預估廣告實際投放金額<small>依實際發生金額為準</small></span><strong>${money(s.adBudget)}／月</strong></div>`)}
      lines.push(`<div class="estimate-line"><span>${a.name}<small>實際投放金額 × 10%</small></span><strong>${s.adBudget?money(fee)+'／月':'請輸入廣告預算'}</strong></div>`);return;
    }
    if(a.price==null){hasUnknown=true;lines.push(`<div class="estimate-line"><span>${a.name}</span><strong>另行報價</strong></div>`);return;}
    if(a.type==='monthly')monthly+=a.price;else one+=a.price;
    let note='';if(k==='orders'){note='<small>另加物流相關實際費用</small>';external.push('<div class="estimate-line"><span>物流／倉儲等相關費用</span><strong>依實際發生另計</strong></div>')}
    if(k==='data')note='<small>每月限提供一次</small>';
    lines.push(`<div class="estimate-line"><span>${a.name}${note}</span><strong>${money(a.price)}${a.type==='monthly'?'／月':''}</strong></div>`);
  });

  Object.entries(s.materials).forEach(([k,qty])=>{if(!qty)return;const m=PRICE_CONFIG.materials[k],total=m.price*qty;one+=total;lines.push(`<div class="estimate-line"><span>${m.name}<small>× ${qty}</small></span><strong>${money(total)}</strong></div>`)});
  if(servicesEl)servicesEl.innerHTML=lines.length?lines.join(''):'<p class="muted">尚未選擇單項服務</p>';
  const externalEl=document.getElementById('externalCosts');if(externalEl)externalEl.innerHTML=external.length?external.join(''):'<p class="muted">物流費、廣告實際投放金額等依實際發生另計。</p>';
  const oneEl=document.getElementById('oneTimeTotal'),monthEl=document.getElementById('monthlyTotal');if(oneEl)oneEl.textContent=money(one);if(monthEl)monthEl.textContent=money(monthly)+'／月';

  const quote=document.getElementById('quoteMail');
  if(quote){
    const selected=[s.plan?PRICE_CONFIG.plans[s.plan].name:null,...s.services.map(k=>PRICE_CONFIG.services[k]?.name),...Object.entries(s.materials).filter(([,q])=>q>0).map(([k,q])=>`${PRICE_CONFIG.materials[k].name} × ${q}`)].filter(Boolean).join('、');
    const body=`您好，我想洽詢以下服務組合：%0D%0A${encodeURIComponent(selected||'尚未選擇項目')}%0D%0A%0D%0A頁面試算：一次性服務費 ${encodeURIComponent(money(one))}；每月服務費 ${encodeURIComponent(money(monthly))}${hasUnknown?'；另有另行報價項目':''}${s.adBudget?`；預估廣告投放金額 ${encodeURIComponent(money(s.adBudget))}`:''}`;
    quote.href=`mailto:contact@example.com?subject=${encodeURIComponent('ViewEC 服務方案洽詢')}&body=${body}`;
  }
}

window.initViewECSite = initSite;
