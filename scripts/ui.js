
function showCard(cardId) {
    // Hide both first
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file to encrypt.");
        return;
    }
    document.getElementById('card-container').style.zIndex = 10;
    document.getElementById('encryptCard').style.display = 'none';
    document.getElementById('decryptCard').style.display = 'none';

    // Show the selected card
    document.getElementById(cardId).style.display = 'flex';
    document.getElementById(cardId).style.zIndex = 11;
}
function hideCard() {
    document.getElementById('card-container').style.zIndex = -10;
    document.getElementById('encryptCard').style.display = 'none';
    document.getElementById('decryptCard').style.display = 'none';
    document.getElementById('encryptCard').style.zIndex = -11;
    document.getElementById('decryptCard').style.zIndex = -11;
}
function showFileName() {
  const fileInput = document.getElementById("fileInput");
  const fileNameSpan = document.getElementById("fileName");

  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
  } else {
    fileNameSpan.textContent = "";
  }
}
function resetFileInput() {
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "";
}

const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragging');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('fileInput').files = files;
        showFileName();
    }
});

