const noteEl = document.getElementById('note');
const saveBtn = document.getElementById('saveNote');
const clearBtn = document.getElementById('clearNote');
const showBtn = document.getElementById('showNotes');
const notesContainer = document.getElementById('notesContainer');
const noteListEl = document.getElementById('noteList');

async function loadNote() {
  const data = await chrome.storage.local.get(['lastNote']);
  if (data.lastNote) noteEl.value = data.lastNote;
}
loadNote();

function renderNotes(notes) {
  noteListEl.innerHTML = "";
  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.textContent = note;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "8px";
    delBtn.addEventListener("click", async () => {
      notes.splice(index, 1);
      await chrome.storage.local.set({ notes });
      renderNotes(notes);
    });

    li.appendChild(delBtn);
    noteListEl.appendChild(li);
  });
}

saveBtn.addEventListener('click', async () => {
  const noteText = noteEl.value.trim();
  if (!noteText) return;

  const data = await chrome.storage.local.get(['notes']);
  let notes = data.notes || [];

  notes.push(noteText);
  await chrome.storage.local.set({ lastNote: noteText, notes });
  alert("Nota salva!");
});

clearBtn.addEventListener('click', async () => {
  noteEl.value = "";
  await chrome.storage.local.remove('lastNote');
});

showBtn.addEventListener('click', async () => {
  if (notesContainer.style.display === "none") {
    const data = await chrome.storage.local.get(['notes']);
    renderNotes(data.notes || []);
    notesContainer.style.display = "block";
  } else {
    notesContainer.style.display = "none";
  }
});


