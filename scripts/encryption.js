function generatePasswordVariants(input) {
    const words = input.match(/[a-zA-Z]+/g) || [];
    const numbers = input.match(/\d+/g) || [];
    const wrappers = [['(', ')'], ['[', ']'], ['<', '>'], ['"', '"'], ["'", "'"]];
    const separators = ['-', '_', '*', '+', '$', '#', '@'];

    const wrap = (text) => {
        const [left, right] = wrappers[Math.floor(Math.random() * wrappers.length)];
        return `${left}${text}${right}`;
    };

    const mutateCase = (word) =>
        word.split('').map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join('');

    const leetify = (text) => text.replace(/e/g, '3').replace(/i/g, '1').replace(/a/g, '@').replace(/t/g, '7');

    const base = `${wrap(words[0] || '')}${separators[Math.floor(Math.random() * separators.length)]}${wrap(numbers[0] || '123')}`;

    return [
        base,
        `${mutateCase(words[0] || 'pass')}${separators[1]}${numbers[0] || '123'}`,
        `${leetify(input)}@shrkt`,
        `${wrap(input)}_2025`,
        `${input.split('').reverse().join('')}$`,
        `Password=${input}`,
        `${input}_244466666`,
    ];
}
function regenerateSuggestion() {
    const input = document.getElementById("userPassword").value.trim();

    if (!input) {
        document.getElementById("suggestedPassword").value = "Enter a base input first!";
        return;
    }

    const variants = generatePasswordVariants(input);
    const randomIndex = Math.floor(Math.random() * variants.length);
    document.getElementById("suggestedPassword").value = variants[randomIndex];
}
function useSuggestion() {
    const suggested = document.getElementById("suggestedPassword").value;
    document.getElementById("userPassword").value = suggested;
}


async function encrypt() {
  const fileInput = document.getElementById("fileInput");
  const passwordInput = document.getElementById("userPassword");

  if (!fileInput.files.length) {
    alert("Please select a file to encrypt.");
    return;
  }

  const password = passwordInput.value;
  if (!password) {
    alert("Please enter a password.");
    return;
  }

  const file = fileInput.files[0];
  const fileBuffer = await file.arrayBuffer();

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive a key from password and salt
  const keyMaterial = await getKeyMaterial(password);
  const key = await deriveKey(keyMaterial, salt);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the file data
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileBuffer
  );

  // Prepare the output: [salt(16 bytes) + iv(12 bytes) + encrypted data]
  const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
  combinedBuffer.set(salt, 0);
  combinedBuffer.set(iv, salt.byteLength);
  combinedBuffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

  // Create blob and trigger download
  const blob = new Blob([combinedBuffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = file.name + ".shrkt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("File encrypted and downloaded.");
  document.getElementById("userPassword").value="";
  resetFileInput();
  hideCard();
}

// Helper to get key material from password string
async function getKeyMaterial(password) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
}

// Derive AES-GCM key using PBKDF2
async function deriveKey(keyMaterial, salt) {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}


async function decrypt() {
  const fileInput = document.getElementById("fileInput");
  const passwordInput = document.getElementById("decryptPassword");

  if (!fileInput.files.length) {
    alert("Please select a .shrkt file to decrypt.");
    return;
  }

  const password = passwordInput.value;
  if (!password) {
    alert("Please enter the password used during encryption.");
    return;
  }

  const file = fileInput.files[0];
  const fileBuffer = await file.arrayBuffer();
  const data = new Uint8Array(fileBuffer);

  // Extract salt (first 16 bytes), iv (next 12 bytes), and ciphertext (rest)
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  try {
    // Derive key from password and extracted salt
    const keyMaterial = await getKeyMaterial(password);
    const key = await deriveKey(keyMaterial, salt);

    // Decrypt the content
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    // Download the decrypted file
    const blob = new Blob([decryptedBuffer]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.shrkt$/, "") || "decrypted_file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Decryption successful. File downloaded.");
    document.getElementById("decryptPassword").value="";
  } catch (err) {
    console.error("Decryption failed:", err);
    alert("Decryption failed. The password may be incorrect or the file is corrupted.");
  }
  hideCard();
  resetFileInput();
}

