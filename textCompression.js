class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}
function getFrequencies(text) {
    const frequencyMap = new Map();
    for (const char of text) {
        frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }
    return frequencyMap;
}
function buildHuffmanTree(frequencyMap) {
    const nodes = Array.from(frequencyMap, ([char, freq]) => new HuffmanNode(char, freq));
    nodes.sort((a, b) => a.freq - b.freq);

    if (nodes.length > 1) {
        while (nodes.length > 1) {
            const left = nodes.shift();
            const right = nodes.shift();
            const newNode = new HuffmanNode(null, left.freq + right.freq, left, right);
            nodes.push(newNode);
            nodes.sort((a, b) => a.freq - b.freq);
        }
    } else if (nodes.length === 1) {
        const left = nodes.shift();
        const newNode = new HuffmanNode(null, left.freq, left);
        nodes.push(newNode);
    }
    return nodes[0];
}
function generateCodes(root) {
    const codes = {};
    function traverse(node, currentCode) {
        if (!node) return;
        if (node.char !== null) {
            codes[node.char] = currentCode;
        }
        traverse(node.left, currentCode + '0');
        traverse(node.right, currentCode + '1');
    }
    traverse(root, '');
    return codes;
}
function compressText(inputText) {
    const frequencyMap = getFrequencies(inputText);
    const root = buildHuffmanTree(frequencyMap);
    const codes = generateCodes(root);

    const decodeMap = {};
    for (const char in codes) {
        decodeMap[codes[char]] = char;
    }

    const compressedBinary = inputText.split('').map(char => codes[char]).join('');
    return { compressedBinary, decodeMap };
}
function binaryToCharString(binaryString) {
    let padding = 0;
    if (binaryString.length % 8 !== 0) {
        padding = 8 - (binaryString.length % 8);
        binaryString += '0'.repeat(padding);
    }

    let compressedString = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        compressedString += String.fromCharCode(parseInt(byte, 2));
    }

    return { charString: compressedString, padding };
}
function handleFileCompression(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const inputText = event.target.result;
        if (inputText.length === 0) {  // Check for truly empty files
            alert("Error: The file is empty.");
            return;
        }
        const { compressedBinary, decodeMap } = compressText(inputText);
        const { charString, padding } = binaryToCharString(compressedBinary);
        const metadata = {
            header: "SHRINKIT",
            padding: padding,
            fileType: file.type,
            decodeMap: decodeMap
        };

        const metadataJSON = JSON.stringify(metadata);
        const finalData = metadataJSON + '\n' + charString;

        const blob = new Blob([finalData], { type: 'application/octet-stream' });
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = URL.createObjectURL(blob);
        let filename=file.name;
        downloadLink.download = filename.replace(/\.[^/.]+$/, "") + '.shrkt';
        downloadLink.style.display = "block";
        downloadLink.click();  // Auto-trigger the download
    };
    reader.readAsText(file);
}


// Decompression
function charStringToBinary(charString, padding) {
    let binaryString = '';

    for (let i = 0; i < charString.length; i++) {
        let binarySegment = charString.charCodeAt(i).toString(2).padStart(8, '0');
        binaryString += binarySegment;
    }

    // Remove the extra padding bits
    return binaryString.slice(0, -padding);
}
function decodeBinary(binaryString, decodeMap) {
    let decodedText = '';
    let currentCode = '';

    for (const bit of binaryString) {
        currentCode += bit;
        if (decodeMap[currentCode]) {
            decodedText += decodeMap[currentCode];
            currentCode = ''; // Reset for the next character
        }
    }

    return decodedText;
}
function decompressText(metadata, compressedData) {
    const binaryString = charStringToBinary(compressedData, metadata.padding);
    const originalText = decodeBinary(binaryString, metadata.decodeMap);
    return originalText;
}
function handleFileDecompression(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result;

        // Split metadata and compressed data
        const [metadataJSON, compressedData] = fileContent.split('\n', 2);

        if (!metadataJSON || !compressedData) {
            alert("Invalid compressed file format!");
            return;
        }

        const metadata = JSON.parse(metadataJSON);
        const decompressedText = decompressText(metadata, compressedData);

        // Generate original filename
        const originalFilename = file.name.replace(/\.shrkt$/, '') + metadata.fileType;

        // Use the existing download button
        const downloadLink = document.getElementById("downloadLink");
        const blob = new Blob([decompressedText], { type: metadata.fileType });

        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = originalFilename;
        downloadLink.style.display = "block";  // Ensure the button is visible
        downloadLink.click();  // Auto-trigger download
    };

    reader.readAsText(file);
}
