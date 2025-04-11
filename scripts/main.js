document.getElementById("compressBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select a file first!");
        return;
    }

    const file = fileInput.files[0];
    const fileType = file.type;

    if (fileType.startsWith("text/")) {
        handleFileCompression(file);
    } else if (fileType.startsWith("image/")) {
        handleImageCompression(file);
    } else if (fileType === "application/pdf") {
        handlePDFCompression(file);
    } else {
        alert("Unsupported file type!");
    }
});

document.getElementById("decompressBtn").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select a compressed file first!");
        return;
    }

    const file = fileInput.files[0];

    // Check if file has the correct extension
    if (!file.name.endsWith(".shrkt")) {
        alert("Invalid file type! Please select a '.shrkt' compressed file.");
        return;
    }

    handleFileDecompression(file);
});

