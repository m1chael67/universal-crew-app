/* Reporting authentication and history. No PINs are retained in the browser. */
window.Reports = (() => {
  const endpoint='https://script.google.com/macros/s/AKfycbz46zN88GfxqXMNYdls7D9xFr6VjXKuOiO4rWIqfSG0Kg-NWgKFACMhkITS7HTj8sg/exec';
  let session; try{session=JSON.parse(sessionStorage.getItem('reportSession')||'null')}catch(e){}
  if(session && session.expiresAt<=Date.now()){session=null;sessionStorage.removeItem('reportSession')}
  async function request(data){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...data,token:session?.token||''}),redirect:'follow',credentials:'omit',signal:controller.signal});
      const result=await response.json();
      if(!result.success)throw new Error(result.error||'Request failed.');
      return result;
    }catch(error){if(error.name==='AbortError')throw new Error('No confirmation received. Check history before submitting again.');throw error}finally{clearTimeout(timer)}
  }
  function logout(){sessionStorage.removeItem('reportSession');location.reload()}
  function start(){
    const style=document.createElement('style');style.textContent='.report-panel{max-width:730px;margin:16px auto;padding:18px;background:white;border:1px solid #ddd;border-radius:18px;font-family:system-ui}.report-panel input,.report-panel select,.report-panel button{font:inherit;padding:10px;border-radius:10px;border:1px solid #ccc;margin:5px;max-width:100%}.report-panel button{cursor:pointer}.report-panel p{white-space:pre-wrap;overflow-wrap:anywhere}.report-panel summary{cursor:pointer;font-weight:800}.report-filters{display:flex;flex-wrap:wrap;gap:4px}.report-error{color:#b91c1c}';document.head.append(style);
    const bar=document.createElement('section');bar.className='report-panel';document.body.prepend(bar);
    if(!session){
      document.querySelectorAll('main, #historyApp').forEach(el=>el.hidden=true);
      bar.innerHTML='<h2>Reporting Sign In</h2><p>Use your private reporting PIN. Your normal site login is unchanged.</p><form><label>Employee <select required name="employee"></select></label><br><label>Reporting PIN <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required></label><button>Sign In</button><p role="status"></p></form>';
      const names=['Michael','Jeff','Alan','Derick','Anthony','Jesse','Delvon','Albert'];const select=bar.querySelector('select');names.forEach(name=>select.add(new Option(name,name)));select.value=localStorage.getItem('employee')||'Michael';
      bar.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=bar.querySelector('button');button.disabled=true;const msg=bar.querySelector('[role=status]');msg.textContent='Signing in…';try{const data=Object.fromEntries(new FormData(e.target));session=await request({action:'login',...data});sessionStorage.setItem('reportSession',JSON.stringify(session));location.reload()}catch(error){msg.textContent=error.message;button.disabled=false}};
      return;
    }
    bar.append(document.createTextNode('Reporting as '+session.employee+' · '));
    const history=document.createElement('a');history.textContent=session.level==='E5'?'All Reports & Issues':'My Report History';history.href='reporthistory.html';bar.append(history);
    const out=document.createElement('button');out.textContent='Sign Out';out.onclick=logout;bar.append(out);
    if(location.pathname.endsWith('dailyreport.html')&&!['E2','E5'].includes(session.level)){document.querySelector('main').hidden=true;bar.append(document.createTextNode(' Daily reports require Crew Lead access.'))}
    if(document.getElementById('historyApp'))loadHistory();
  }
  async function loadHistory(){
    const app=document.getElementById('historyApp');app.replaceChildren();
    const title=document.createElement('h1');title.textContent=session.level==='E5'?'All Reports & Issues':'My Reports & Issues';app.append(title);
    const status=document.createElement('p');status.textContent='Loading history…';app.append(status);
    try{
      const data=await request({action:'getHistory'});
      const rows=[...(data.crewLeadReports||[]).map(r=>({...r,_type:'crew'})),...(data.laborerIssues||[]).map(r=>({...r,_type:'issue'}))].sort((a,b)=>String(b.SubmittedAt).localeCompare(String(a.SubmittedAt)));
      const filters=document.createElement('div');filters.className='report-filters';
      const search=document.createElement('input');search.placeholder='Search reports';search.setAttribute('aria-label','Search reports');
      const type=document.createElement('select');[['','All types'],['crew','Daily reports'],['issue','Issues']].forEach(([v,t])=>type.add(new Option(t,v)));
      const author=document.createElement('select');author.add(new Option('All employees',''));[...new Set(rows.map(r=>r.CrewLead||r.Employee))].sort().forEach(n=>author.add(new Option(n,n)));author.hidden=session.level!=='E5';
      const date=document.createElement('input');date.type='date';date.setAttribute('aria-label','Filter report date');
      const refresh=document.createElement('button');refresh.textContent='Refresh';refresh.onclick=loadHistory;
      filters.append(search,type,author,date,refresh);app.append(filters);const list=document.createElement('div');app.append(list);
      function render(){list.replaceChildren();const filtered=rows.filter(r=>(!type.value||r._type===type.value)&&(!author.value||(r.CrewLead||r.Employee)===author.value)&&(!date.value||String(r.ReportDate).slice(0,10)===date.value)&&JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase()));status.textContent=filtered.length+' report(s)';
        filtered.forEach(row=>{const card=document.createElement('details');card.className='report-panel';const summary=document.createElement('summary');summary.textContent=[row.ReportDate,row.CrewLead||row.Employee,row._type==='crew'?'Daily Report':'Issue',row.FollowUpStatus,(row.Confidential===true||String(row.Confidential).toLowerCase()==='true')?'CONFIDENTIAL':''].filter(Boolean).join(' · ');card.append(summary);
          Object.entries(row).forEach(([key,value])=>{if(key[0]==='_'||value===''||value==null)return;const p=document.createElement('p');const b=document.createElement('strong');b.textContent=key.replace(/([a-z])([A-Z])/g,'$1 $2')+': ';p.append(b,document.createTextNode(String(value)));card.append(p)});
          if(session.level==='E5'){const select=document.createElement('select');['Open','Reviewed','In Progress','Resolved','Closed'].forEach(s=>select.add(new Option(s,s)));select.value=row.FollowUpStatus||'Open';const button=document.createElement('button');button.textContent='Update Follow-Up';const message=document.createElement('p');message.setAttribute('role','status');button.onclick=async()=>{button.disabled=true;try{await request({action:'updateFollowUpStatus',recordType:row._type,recordId:row.ReportID||row.IssueID,followUpStatus:select.value});row.FollowUpStatus=select.value;message.textContent='Updated by '+session.employee;summary.textContent=[row.ReportDate,row.CrewLead||row.Employee,select.value].join(' · ')}catch(e){message.textContent=e.message}finally{button.disabled=false}};card.append(select,button,message)}list.append(card)});
      }
      [search,type,author,date].forEach(el=>el.addEventListener('input',render));render();
    }catch(error){status.textContent=error.message;status.className='report-error';const retry=document.createElement('button');retry.textContent='Retry';retry.onclick=loadHistory;app.append(retry)}
  }
  document.addEventListener('DOMContentLoaded',start);
  return {request,get user(){return session},logout};
})();
