const CONFIG={base:60000,includedOrders:300,includedCases:150,orderRate:120,caseRate:120};
const money=n=>`NT$${Math.round(n).toLocaleString('zh-TW')}`;
function value(id){return Math.max(0,Math.floor(Number(document.getElementById(id)?.value)||0));}
function calculate(){
  const orders=value('orders'),cases=value('cases');
  const extraOrders=Math.max(0,orders-CONFIG.includedOrders),extraCases=Math.max(0,cases-CONFIG.includedCases);
  const orderFee=extraOrders*CONFIG.orderRate,caseFee=extraCases*CONFIG.caseRate,total=CONFIG.base+orderFee+caseFee;
  document.getElementById('orderDetail').textContent=`${extraOrders.toLocaleString()} 單 × ${money(CONFIG.orderRate)}`;
  document.getElementById('caseDetail').textContent=`${extraCases.toLocaleString()} 件 × ${money(CONFIG.caseRate)}`;
  document.getElementById('orderFee').textContent=money(orderFee);document.getElementById('caseFee').textContent=money(caseFee);document.getElementById('total').textContent=money(total);
  const status=document.getElementById('status');const over=extraOrders>0||extraCases>0;status.classList.toggle('over',over);status.textContent=over?'本月已有超出基本額度的處理量':'目前處理量在基本額度內';
  return{orders,cases,extraOrders,extraCases,orderFee,caseFee,total};
}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
window.initViewECSite=function(){
  ['orders','cases'].forEach(id=>document.getElementById(id)?.addEventListener('input',calculate));
  document.getElementById('resetBtn')?.addEventListener('click',()=>{document.getElementById('orders').value=0;document.getElementById('cases').value=0;calculate()});
  document.getElementById('copyBtn')?.addEventListener('click',async()=>{const r=calculate();const text=`ViewEC 營運服務費試算\n本月訂單：${r.orders} 單（超額 ${r.extraOrders} 單／${money(r.orderFee)}）\n本月客服：${r.cases} 件（超額 ${r.extraCases} 件／${money(r.caseFee)}）\n基本月費：${money(CONFIG.base)}\n預估月費：${money(r.total)}（未稅）`;try{await navigator.clipboard.writeText(text);showToast('已複製試算結果')}catch{showToast('無法自動複製，請稍後再試')}});
  const menu=document.getElementById('menu'),nav=document.getElementById('nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));calculate();
};
