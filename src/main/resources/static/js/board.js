(function () {
  'use strict';

  const QUADRANTS = ['selectiveInvest', 'doFirstDriveDaily', 'ignore', 'workIn'];
  const Q_LABELS = { selectiveInvest: 'Selectively Invest', doFirstDriveDaily: 'Do First / Drive Daily', ignore: 'Ignore / Delay', workIn: 'Work In' };
  const STORAGE_KEY = 'taskboard_data';

  let board = { selectiveInvest: [], doFirstDriveDaily: [], ignore: [], workIn: [], support: [], parking: [] };
  let currentQuadrant = null;
  let currentTaskIndex = -1;

  /* ── Persistence ── */
  function loadBoard() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { board = JSON.parse(raw) } catch (e) { } }
    QUADRANTS.forEach(q => { if (!Array.isArray(board[q])) board[q] = [] });
    if (!Array.isArray(board.support)) board.support = [];
    if (!Array.isArray(board.parking)) board.parking = [];
  }
  function saveBoard() { localStorage.setItem(STORAGE_KEY, JSON.stringify(board)) }

  /* ── Seed from server ── */
  function seedFromServer(serverBoard) {
    if (!serverBoard) return;
    const map = { selectiveInvestTasks: 'selectiveInvest', doFirstDriveDailyTasks: 'doFirstDriveDaily', ignoreTasks: 'ignore', workInTasks: 'workIn', supportTasks: 'support', parkingTasks: 'parking' };
    let hasData = false;
    Object.keys(map).forEach(sk => {
      const arr = serverBoard[sk];
      if (arr && arr.length) { hasData = true; board[map[sk]] = arr }
    });
    if (hasData) saveBoard();
  }

  /* ── Map JS board to server Board format ── */
  function toServerBoard() {
    return {
      selectiveInvestTasks: board.selectiveInvest || [],
      doFirstDriveDailyTasks: board.doFirstDriveDaily || [],
      ignoreTasks: board.ignore || [],
      workInTasks: board.workIn || [],
      supportTasks: board.support || [],
      parkingTasks: board.parking || []
    };
  }

  /* ── Render ── */
  function renderBoard() {
    let totalActive = 0;
    QUADRANTS.forEach(q => {
      const list = document.getElementById('list-' + q);
      if (!list) return;
      list.innerHTML = '';
      const tasks = board[q] || [];
      tasks.forEach((t, i) => {
        if (!t.completed) totalActive++;
        const tile = document.createElement('div');
        tile.className = 'task-tile' + (t.completed ? ' completed' : '');
        tile.innerHTML = `
        <button class="tile-check${t.completed ? ' checked' : ''}" data-q="${q}" data-i="${i}" onclick="TB.toggleComplete('${q}',${i});event.stopPropagation()">${t.completed ? '✓' : ''}</button>
        <div class="tile-info" onclick="TB.openModal('${q}',${i})">
          <div class="tile-title">${esc(t.title || 'Untitled')}</div>
          <div class="tile-meta">
            ${t.dueDate ? '<span>📅 ' + t.dueDate + '</span>' : ''}
            ${t.subTasks && t.subTasks.length ? '<span>📋 ' + t.subTasks.length + ' subtask' + (t.subTasks.length > 1 ? 's' : '') + '</span>' : ''}
          </div>
        </div>
        <div class="tile-actions">
          <div class="move-dropdown">
            <button class="tile-move" onclick="TB.toggleMoveMenu(this);event.stopPropagation()">⇄</button>
            <div class="move-menu">${QUADRANTS.filter(oq => oq !== q).map(oq => `<button onclick="TB.moveTask('${q}',${i},'${oq}');event.stopPropagation()">${Q_LABELS[oq]}</button>`).join('')}</div>
          </div>
        </div>`;
        list.appendChild(tile);
      });
      if (!tasks.length) list.innerHTML = '<div class="q-empty">No tasks yet — click + to add</div>';
    });
    const ov = document.getElementById('task-overview');
    if (ov) ov.textContent = totalActive + ' active task' + (totalActive !== 1 ? 's' : '');
    renderSidePanel();
  }

  /* ── Toggle complete ── */
  window.TB = {};
  TB.toggleComplete = function (q, i) {
    board[q][i].completed = !board[q][i].completed;
    saveBoard(); renderBoard();
  };

  /* ── Move task ── */
  TB.moveTask = function (from, i, to) {
    const task = board[from].splice(i, 1)[0];
    board[to].push(task);
    saveBoard(); renderBoard(); showToast('Moved to ' + Q_LABELS[to]);
  };

  /* ── Move menu ── */
  TB.toggleMoveMenu = function (btn) {
    document.querySelectorAll('.move-menu.show').forEach(m => { if (m !== btn.nextElementSibling) m.classList.remove('show') });
    btn.nextElementSibling.classList.toggle('show');
  };

  /* ── Modal ── */
  TB.openModal = function (q, i) {
    currentQuadrant = q; currentTaskIndex = i;
    const isNew = i < 0;
    const t = isNew ? { title: '', description: '', dueDate: '', isSupportRequired: false, subTasks: [], comments: [], completed: false } : JSON.parse(JSON.stringify(board[q][i]));
    document.getElementById('modal-title').value = t.title || '';
    document.getElementById('modal-desc').value = t.description || '';
    document.getElementById('modal-due').value = t.dueDate || '';
    document.getElementById('modal-support').checked = !!t.isSupportRequired;
    document.getElementById('btn-delete-task').style.display = isNew ? 'none' : '';
    renderSubTasks(t.subTasks || []);
    renderComments(t.comments || []);
    document.getElementById('modal-overlay').classList.add('active');
  };

  TB.closeModal = function () {
    document.getElementById('modal-overlay').classList.remove('active');
  };

  TB.saveTask = function () {
    const t = {
      title: document.getElementById('modal-title').value.trim() || 'Untitled',
      description: document.getElementById('modal-desc').value,
      dueDate: document.getElementById('modal-due').value,
      isSupportRequired: document.getElementById('modal-support').checked,
      subTasks: collectSubTasks(),
      comments: collectComments(),
      completed: false
    };
    if (currentTaskIndex < 0) {
      board[currentQuadrant].push(t);
    } else {
      t.completed = board[currentQuadrant][currentTaskIndex].completed || false;
      board[currentQuadrant][currentTaskIndex] = t;
    }
    saveBoard(); renderBoard(); TB.closeModal(); showToast('Task saved');
  };

  TB.deleteTask = function () {
    if (currentTaskIndex >= 0) {
      board[currentQuadrant].splice(currentTaskIndex, 1);
      saveBoard(); renderBoard();
    }
    TB.closeModal(); showToast('Task deleted');
  };

  /* ── SubTasks in modal ── */
  let modalSubTasks = [];
  function renderSubTasks(arr) {
    modalSubTasks = arr || [];
    const pending = modalSubTasks.filter(s => !s.completed);
    const done = modalSubTasks.filter(s => s.completed);
    const container = document.getElementById('subtask-list');
    container.innerHTML = '';
    pending.forEach((s, idx) => {
      const ri = modalSubTasks.indexOf(s);
      container.innerHTML += stItem(s, ri, false);
    });
    if (done.length) {
      const doneDiv = document.getElementById('subtask-done');
      doneDiv.innerHTML = `<div class="done-toggle" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">▸ Done (${done.length})</div><div style="display:none">${done.map(s => stItem(s, modalSubTasks.indexOf(s), true)).join('')}</div>`;
      doneDiv.style.display = 'block';
    } else {
      document.getElementById('subtask-done').style.display = 'none';
    }
  }
  function stItem(s, ri, isDone) {
    return `<div class="subtask-item${isDone ? ' done' : ''}">
    <button class="st-check${s.completed ? ' checked' : ''}" onclick="TB.toggleST(${ri})">${s.completed ? '✓' : ''}</button>
    <span class="st-title">${esc(s.title)}</span>
    <span class="st-date"><input type="date" value="${s.dueDate || ''}" onchange="TB.stDate(${ri},this.value)"></span>
    <button class="st-remove" onclick="TB.removeST(${ri})">✕</button>
  </div>`;
  }
  TB.addSubTask = function () {
    const inp = document.getElementById('subtask-input');
    const v = inp.value.trim();
    if (!v) return;
    modalSubTasks.push({ title: v, dueDate: '', completed: false });
    inp.value = '';
    renderSubTasks(modalSubTasks);
  };
  TB.toggleST = function (ri) {
    modalSubTasks[ri].completed = !modalSubTasks[ri].completed;
    renderSubTasks(modalSubTasks);
  };
  TB.removeST = function (ri) {
    modalSubTasks.splice(ri, 1);
    renderSubTasks(modalSubTasks);
  };
  TB.stDate = function (ri, v) { modalSubTasks[ri].dueDate = v };
  function collectSubTasks() { return modalSubTasks }

  /* ── Comments in modal ── */
  let modalComments = [];
  function renderComments(arr) {
    modalComments = arr || [];
    const container = document.getElementById('comment-list');
    container.innerHTML = '';
    modalComments.forEach(c => {
      container.innerHTML += `<div class="comment-item">
      <div class="comment-msg">${esc(c.message)}</div>
      <div class="comment-time">${c.createdAt ? formatDt(c.createdAt) : ''}${c.updatedAt && c.updatedAt !== c.createdAt ? ' · edited ' + formatDt(c.updatedAt) : ''}</div>
    </div>`;
    });
  }
  TB.addComment = function () {
    const ta = document.getElementById('comment-input');
    const v = ta.value.trim();
    if (!v) return;
    const now = new Date().toISOString();
    modalComments.unshift({ message: v, createdAt: now, updatedAt: now });
    ta.value = '';
    renderComments(modalComments);
  };
  function collectComments() { return modalComments }

  /* ── Sync / Backup / Share ── */
  TB.syncBoard = async function () {

    const csrfToken = document.querySelector('meta[name="_csrf"]').content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

    try {
      const response = await fetch('/my-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [csrfHeader]: csrfToken
        },
        body: JSON.stringify(toServerBoard())
      });

      if (!response.ok) {
        throw new Error('Sync failed: ' + response.status);
      }

      showToast('Board synced successfully');

    } catch (error) {
      console.error('Board sync failed:', error);
      showToast('Sync failed — check console');
    }
  };
  TB.backupBoard = function () {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'taskboard-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); URL.revokeObjectURL(a.href);
    showToast('Backup downloaded');
  };
  TB.shareBoard = function () {
    const uid = (window.__serverBoard && window.__serverBoard.userId) || document.body.dataset.userId || '';
    if (!uid) { showToast('No user ID available'); return; }
    const url = window.location.origin + '/member-board/' + uid;
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Copy failed'));
  };

  /* ══════════════════════════════════════════════
     Side Panel Logic
     ══════════════════════════════════════════════ */

  /* ── Toggle / Tabs ── */
  TB.toggleSidePanel = function () {
    const sp = document.getElementById('side-panel');
    const btn = document.getElementById('sp-toggle');
    sp.classList.toggle('collapsed');
    btn.textContent = sp.classList.contains('collapsed') ? '▸' : '◂';
  };
  TB.switchTab = function (tab) {
    document.querySelectorAll('.sp-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.sp-content').forEach(c => c.style.display = 'none');
    const el = document.getElementById('tab-' + tab);
    if (el) el.style.display = '';
  };

  /* ── Render side panel ── */
  function renderSidePanel() {
    renderPriorities();
    renderGenericList('support');
    renderGenericList('parking');
  }

  /* ── Priorities: subtasks with due dates sorted by nearest ── */
  function renderPriorities() {
    const container = document.getElementById('priorities-list');
    if (!container) return;
    const items = [];
    QUADRANTS.forEach(q => {
      (board[q] || []).forEach((task, ti) => {
        (task.subTasks || []).forEach((st, si) => {
          if (st.dueDate) {
            items.push({ taskTitle: task.title || 'Untitled', stTitle: st.title, dueDate: st.dueDate, completed: !!st.completed, q: q, ti: ti, si: si });
          }
        });
      });
    });
    items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (!items.length) { container.innerHTML = '<div class="sp-empty">No subtasks with due dates</div>'; return }
    const today = new Date().toISOString().slice(0, 10);
    container.innerHTML = items.map(it => {
      let dueClass = 'future';
      if (it.dueDate < today) dueClass = 'overdue';
      else if (it.dueDate <= addDays(today, 3)) dueClass = 'soon';
      return `<div class="sp-priority-item">
      <div class="sp-priority-task">${esc(it.taskTitle)}</div>
      <div class="sp-priority-row">
        <button class="st-check${it.completed ? ' checked' : ''}" onclick="TB.togglePriorityST('${it.q}',${it.ti},${it.si})">${it.completed ? '✓' : ''}</button>
        <span class="sp-priority-title${it.completed ? ' done' : ''}">${esc(it.stTitle)}</span>
        <span class="sp-priority-due ${dueClass}">${it.dueDate}</span>
      </div>
    </div>`;
    }).join('');
  }
  function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

  TB.togglePriorityST = function (q, ti, si) {
    board[q][ti].subTasks[si].completed = !board[q][ti].subTasks[si].completed;
    saveBoard(); renderBoard();
  };

  /* ── Generic lists (Support / Parking) ── */
  function renderGenericList(type) {
    const container = document.getElementById(type + '-list');
    if (!container) return;
    const items = board[type] || [];
    if (!items.length) { container.innerHTML = '<div class="sp-empty">No items yet</div>'; return }
    container.innerHTML = items.map((it, i) => `<div class="sp-generic-item">
    <button class="st-check${it.completed ? ' checked' : ''}" onclick="TB.toggleGeneric('${type}',${i})">${it.completed ? '✓' : ''}</button>
    <span class="sp-generic-title${it.completed ? ' done' : ''}" id="gen-${type}-${i}">${esc(it.title)}</span>
    <div class="sp-generic-actions">
      <button onclick="TB.editGeneric('${type}',${i})" title="Edit">✎</button>
      <button class="sp-del" onclick="TB.deleteGeneric('${type}',${i})" title="Delete">✕</button>
    </div>
  </div>`).join('');
  }

  TB.addGeneric = function (type) {
    const inp = document.getElementById(type + '-input');
    const v = inp.value.trim();
    if (!v) return;
    if (!Array.isArray(board[type])) board[type] = [];
    board[type].push({ title: v, completed: false });
    inp.value = '';
    saveBoard(); renderGenericList(type);
  };
  TB.toggleGeneric = function (type, i) {
    board[type][i].completed = !board[type][i].completed;
    saveBoard(); renderGenericList(type);
  };
  TB.editGeneric = function (type, i) {
    const span = document.getElementById('gen-' + type + '-' + i);
    if (!span) return;
    span.contentEditable = 'true';
    span.classList.remove('done');
    span.focus();
    const finish = () => {
      span.contentEditable = 'false';
      const newVal = span.textContent.trim();
      if (newVal) board[type][i].title = newVal;
      saveBoard(); renderGenericList(type);
    };
    span.onblur = finish;
    span.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); finish(); } if (e.key === 'Escape') { span.textContent = board[type][i].title; finish(); } };
  };
  TB.deleteGeneric = function (type, i) {
    board[type].splice(i, 1);
    saveBoard(); renderGenericList(type); showToast('Item deleted');
  };

  /* ── Helpers ── */
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML }
  function formatDt(iso) { try { return new Date(iso).toLocaleString() } catch (e) { return iso } }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ── Close menus on outside click ── */
  document.addEventListener('click', e => {
    if (!e.target.closest('.move-dropdown')) document.querySelectorAll('.move-menu.show').forEach(m => m.classList.remove('show'));
  });

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    loadBoard();
    if (window.__serverBoard) seedFromServer(window.__serverBoard);
    renderBoard();
  });

})();
