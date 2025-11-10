// Note Saver - popup.js (melhorado)
// Funcionalidades: salvar nota, listar notas, excluir, editar, limpar campo, persistência em chrome.storage.local
const noteEl = document.getElementById('note');
const saveBtn = document.getElementById('saveNote');
const clearBtn = document.getElementById('clearNote');
const showBtn = document.getElementById('showNotes');
const notesContainer = document.getElementById('notesContainer');
const noteListEl = document.getElementById('noteList');
const statusEl = document.getElementById('status');

function showStatus(msg, timeout = 2000) {
  statusEl.textContent = msg;
  statusEl.style.opacity = '1';
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { statusEl.style.opacity = '0'; }, timeout);
}

async function loadNote() {
  const data = await chrome.storage.local.get(['lastNote', 'notes']);
  if (data.lastNote) noteEl.value = data.lastNote;
  const notes = data.notes || [];
  renderNotes(notes);
}
loadNote();

function formatDate(iso) {
  try { const d = new Date(iso); return d.toLocaleString(); } catch(e){ return iso; }
}

function createNoteElement(note) {
  const li = document.createElement('li');
  li.className = 'note-item';

  const text = document.createElement('div');
  text.className = 'note-text';
  text.textContent = note.text;

  const meta = document.createElement('div');
  meta.className = 'note-meta';
  meta.textContent = formatDate(note.createdAt);

  const actions = document.createElement('div');
  actions.className = 'note-actions';

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copiar';
  copyBtn.className = 'btn small';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(note.text);
    showStatus('Texto copiado');
  });

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Editar';
  editBtn.className = 'btn small';
  editBtn.addEventListener('click', () => {
    noteEl.value = note.text;
    noteEl.focus();
    // marcar como editando usando data-edit-id
    noteEl.dataset.editId = note.id;
    showStatus('Editando nota');
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Excluir';
  delBtn.className = 'btn small danger';
  delBtn.addEventListener('click', async () => {
    if (!confirm('Excluir esta nota?')) return;
    const data = await chrome.storage.local.get(['notes']);
    const notes = data.notes || [];
    const filtered = notes.filter(n => n.id !== note.id);
    await chrome.storage.local.set({ notes: filtered });
    renderNotes(filtered);
    showStatus('Nota excluída');
  });

  actions.appendChild(copyBtn);
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(text);
  li.appendChild(meta);
  li.appendChild(actions);

  return li;
}

function renderNotes(notes) {
  noteListEl.innerHTML = '';
  if (!notes || notes.length === 0) {
    noteListEl.innerHTML = '<li class="empty">Nenhuma nota salva</li>';
    return;
  }
  // Ordenar por createdAt decrescente
  notes.sort((a,b) => b.createdAt - a.createdAt);
  for (const note of notes) {
    noteListEl.appendChild(createNoteElement(note));
  }
}

saveBtn.addEventListener('click', async () => {
  const text = noteEl.value.trim();
  if (!text) {
    showStatus('Escreva algo antes de salvar');
    return;
  }
  const data = await chrome.storage.local.get(['notes']);
  const notes = data.notes || [];
  const editId = noteEl.dataset.editId;
  if (editId) {
    // editar nota existente
    const idx = notes.findIndex(n => String(n.id) === String(editId));
    if (idx !== -1) {
      notes[idx].text = text;
      notes[idx].updatedAt = Date.now();
      await chrome.storage.local.set({ notes, lastNote: text });
      renderNotes(notes);
      delete noteEl.dataset.editId;
      noteEl.value = '';
      showStatus('Nota atualizada');
      return;
    }
  }
  const noteObj = {
    id: Date.now(),
    text,
    createdAt: Date.now()
  };
  notes.unshift(noteObj);
  await chrome.storage.local.set({ notes, lastNote: text });
  renderNotes(notes);
  noteEl.value = '';
  showStatus('Nota salva');
});

clearBtn.addEventListener('click', async () => {
  noteEl.value = '';
  delete noteEl.dataset.editId;
  await chrome.storage.local.remove('lastNote');
  showStatus('Campo limpo');
});

showBtn.addEventListener('click', async () => {
  if (notesContainer.style.display === 'none' || !notesContainer.style.display) {
    const data = await chrome.storage.local.get(['notes']);
    renderNotes(data.notes || []);
    notesContainer.style.display = 'block';
    showBtn.textContent = 'Ocultar notas';
  } else {
    notesContainer.style.display = 'none';
    showBtn.textContent = 'Mostrar notas';
  }
});
