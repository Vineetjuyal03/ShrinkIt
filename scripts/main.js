const customDelimiter = "|~|";
const shortToFullType = {
    "txt": "text/plain",
    "jpg": "image/jpeg",
    "png": "image/png",
    "pdf": "application/pdf"
};
const fullToShortType = {
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf"
};
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

    const reader = new FileReader();

    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        const fullData = new Uint8Array(arrayBuffer);
        const decodedText = new TextDecoder().decode(fullData);
        const delimiterIndex = decodedText.indexOf(customDelimiter);

        if (delimiterIndex === -1) {
            alert("Invalid compressed file format!");
            return;
        }

        const metadataJSON = decodedText.slice(0, delimiterIndex);
        let metadata;
        try {
            metadata = JSON.parse(metadataJSON);
        } catch (e) {
            alert("Failed to parse metadata!");
            return;
        }

        if (!metadata.fT) {
            alert("Missing file type information in compressed file!");
            return;
        }

        // Call appropriate decompression function based on file type
        switch (metadata.fT) {
            case "txt":
                handleFileDecompression(file); // text decompression
                break;
            case "jpg":
            case "png":
                handleImageDecompression(file); // hypothetical function for images
                break;
            case "pdf":
                handlePdfDecompression(file); // hypothetical function for PDFs
                break;
            default:
                alert("Unsupported file type in compressed file: " + metadata.fT);
        }
    };

    reader.readAsArrayBuffer(file);
});


