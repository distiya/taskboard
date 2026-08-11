(function(){
'use strict';

const QUADRANTS = ['selectiveInvest','doFirstDriveDaily','ignore','workIn'];
const Q_LABELS = {selectiveInvest:'Selectively Invest',doFirstDriveDaily:'Do First / Drive Daily',ignore:'Ignore / Delay',workIn:'Work In'};

let board = {selectiveInvest:[],doFirstDriveDaily:[],ignore:[],workIn:[],support:[],parking:[]};

/* ── Load from server ── */
function loadFromServer(serverBoard){
  if(!serverBoard)return;
  const map={selectiveInvestTasks:'selectiveInvest',doFirstDriveDailyTasks:'doFirstDriveDaily',ignoreTasks:'ignore',workInTasks:'workIn',supportTasks:'support',parkingTasks:'parking'};
  Object.keys(map).forEach(sk=>{
    const arr=serverBoard[sk];
    if(arr&&arr.length)board[map[sk]]=arr;
  });
}

/* ── Render ── */
function renderBoard(){
  let totalActive=0;
  QUADRANTS.forEach(q=>{
    const list=document.getElementById('list-'+q);
    if(!list)return;
    list.innerHTML='';
    const tasks=board[q]||[];
    tasks.forEach((t,i)=>{
      if(!t.completed)totalActive++;
      const tile=document.createElement('div');
      tile.className='task-tile'+(t.completed?' completed':'');
      tile.innerHTML=`
        <span class="tile-check${t.completed?' checked':''}">${t.completed?'✓':''}</span>
        <div class="tile-info" onclick="MB.viewTask('${q}',${i})">
          <div class="tile-title">${esc(t.title||'Untitled')}</div>
          <div class="tile-meta">
            ${t.dueDate?'<span>📅 '+t.dueDate+'</span>':''}
            ${t.subTasks&&t.subTasks.length?'<span>📋 '+t.subTasks.length+' subtask'+(t.subTasks.length>1?'s':'')+'</span>':''}
          </div>
        </div>`;
      list.appendChild(tile);
    });
    if(!tasks.length)list.innerHTML='<div class="q-empty">No tasks</div>';
  });
  const ov=document.getElementById('task-overview');
  if(ov)ov.textContent=totalActive+' active task'+(totalActive!==1?'s':'');
  renderSidePanel();
}

/* ── View-only modal ── */
window.MB={};
MB.viewTask=function(q,i){
  const t=board[q][i];
  if(!t)return;
  document.getElementById('modal-title').textContent=t.title||'Untitled';
  document.getElementById('modal-desc').textContent=t.description||'No description';
  document.getElementById('modal-due').textContent=t.dueDate||'—';
  document.getElementById('modal-support').textContent=t.isSupportRequired?'Yes':'No';

  /* Subtasks */
  const stList=document.getElementById('modal-subtasks');
  const subs=t.subTasks||[];
  if(subs.length){
    stList.innerHTML=subs.map(s=>`<div class="subtask-item${s.completed?' done':''}">
      <span class="st-check${s.completed?' checked':''}">${s.completed?'✓':''}</span>
      <span class="st-title">${esc(s.title)}</span>
      ${s.dueDate?'<span class="st-date">'+s.dueDate+'</span>':''}
    </div>`).join('');
  } else {
    stList.innerHTML='<div class="sp-empty">No subtasks</div>';
  }

  /* Comments */
  const cmList=document.getElementById('modal-comments');
  const comments=t.comments||[];
  if(comments.length){
    cmList.innerHTML=comments.map(c=>`<div class="comment-item">
      <div class="comment-msg">${esc(c.message)}</div>
      <div class="comment-time">${c.createdAt?new Date(c.createdAt).toLocaleString():''}</div>
    </div>`).join('');
  } else {
    cmList.innerHTML='<div class="sp-empty">No comments</div>';
  }

  document.getElementById('modal-overlay').classList.add('active');
};
MB.closeModal=function(){
  document.getElementById('modal-overlay').classList.remove('active');
};

/* ── Side Panel ── */
MB.toggleSidePanel=function(){
  const sp=document.getElementById('side-panel');
  const btn=document.getElementById('sp-toggle');
  sp.classList.toggle('collapsed');
  btn.textContent=sp.classList.contains('collapsed')?'▸':'◂';
};
MB.switchTab=function(tab){
  document.querySelectorAll('.sp-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.sp-content').forEach(c=>c.style.display='none');
  const el=document.getElementById('tab-'+tab);
  if(el)el.style.display='';
};

function renderSidePanel(){
  renderPriorities();
  renderGenericList('support');
  renderGenericList('parking');
}

function renderPriorities(){
  const container=document.getElementById('priorities-list');
  if(!container)return;
  const items=[];
  QUADRANTS.forEach(q=>{
    (board[q]||[]).forEach(task=>{
      (task.subTasks||[]).forEach(st=>{
        if(st.dueDate)items.push({taskTitle:task.title||'Untitled',stTitle:st.title,dueDate:st.dueDate,completed:!!st.completed});
      });
    });
  });
  items.sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  if(!items.length){container.innerHTML='<div class="sp-empty">No subtasks with due dates</div>';return}
  const today=new Date().toISOString().slice(0,10);
  container.innerHTML=items.map(it=>{
    let cls='future';
    if(it.dueDate<today)cls='overdue';
    else if(it.dueDate<=addDays(today,3))cls='soon';
    return `<div class="sp-priority-item">
      <div class="sp-priority-task">${esc(it.taskTitle)}</div>
      <div class="sp-priority-row">
        <span class="st-check${it.completed?' checked':''}">${it.completed?'✓':''}</span>
        <span class="sp-priority-title${it.completed?' done':''}">${esc(it.stTitle)}</span>
        <span class="sp-priority-due ${cls}">${it.dueDate}</span>
      </div>
    </div>`;
  }).join('');
}

function renderGenericList(type){
  const container=document.getElementById(type+'-list');
  if(!container)return;
  const items=board[type]||[];
  if(!items.length){container.innerHTML='<div class="sp-empty">No items</div>';return}
  container.innerHTML=items.map(it=>`<div class="sp-generic-item">
    <span class="st-check${it.completed?' checked':''}">${it.completed?'✓':''}</span>
    <span class="sp-generic-title${it.completed?' done':''}">${esc(it.title)}</span>
  </div>`).join('');
}

/* ── Helpers ── */
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function addDays(ds,n){const d=new Date(ds);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}

/* ── Init ── */
document.addEventListener('DOMContentLoaded',()=>{
  if(window.__serverBoard)loadFromServer(window.__serverBoard);
  renderBoard();
});

})();
