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
function binToDeci(codes) {
    const compactList = [];
    for (const char in codes) {
        const binary = codes[char];
        const length = binary.length;
        const decimal = parseInt(binary, 2);
        const charCode = char.charCodeAt(0);
        compactList.push([charCode, length, decimal]);
    }
    return compactList;
}
function deciToBin(compactList) {
    const decodeMap = {};
    for (const [charCode, length, decimalValue] of compactList) {
        const binaryCode = Number(decimalValue).toString(2).padStart(length, '0');
        const character = String.fromCharCode(charCode);
        decodeMap[binaryCode] = character;
    }
    return decodeMap;
}
function compressText(inputText) {
    const frequencyMap = getFrequencies(inputText);
    const root = buildHuffmanTree(frequencyMap);
    const codes = generateCodes(root);

    const CompactCodeMap = binToDeci(codes);

    const compressedBinary = inputText.split('').map(char => codes[char]).join('');
    return { compressedBinary, CompactCodeMap };
}
function binaryToUint8Array(binaryString) {
    let padding = 0;
    if (binaryString.length % 8 !== 0) {
        padding = 8 - (binaryString.length % 8);
        binaryString += '0'.repeat(padding);
    }

    const byteArray = new Uint8Array(binaryString.length / 8);
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        byteArray[i / 8] = parseInt(byte, 2);
    }

    return { byteArray, padding };
}

function handleFileCompression(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const inputText = event.target.result;
        if (inputText.length === 0) {
            alert("Error: The file is empty.");
            return;
        }

        const { compressedBinary, CompactCodeMap } = compressText(inputText);
        const { byteArray, padding } = binaryToUint8Array(compressedBinary);

        const metadata = {
            fT: fullToShortType[file.type],
            pad: padding,
            dMp: CompactCodeMap
        };

        const metadataJSON = JSON.stringify(metadata);
        const metadataBytes = new TextEncoder().encode(metadataJSON + customDelimiter);

        const finalBuffer = new Uint8Array(metadataBytes.length + byteArray.length);
        finalBuffer.set(metadataBytes, 0);
        finalBuffer.set(byteArray, metadataBytes.length);

        const blob = new Blob([finalBuffer], { type: 'application/octet-stream' });
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = URL.createObjectURL(blob);
        let filename = file.name;
        downloadLink.download = filename.replace(/\.[^/.]+$/, "") + '.shrkt';
        downloadLink.style.display = "block";
        downloadLink.click();
        document.getElementById("fileInput").value = '';
    };
    reader.readAsText(file);
}



// Decompression


function decodeBinary(binaryString, compactCodeMap) {
    let decodeMap=deciToBin(compactCodeMap);
    let decodedText = '';
    let currentCode = '';

    for (const bit of binaryString) {
        currentCode += bit;
        if (decodeMap[currentCode]) {
            decodedText += decodeMap[currentCode];
            currentCode = '';
        }
    }

    return decodedText;
}
function handleFileDecompression(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        const fullData = new Uint8Array(arrayBuffer);

        const decoder = new TextDecoder();
        const decodedText = decoder.decode(fullData);

        const delimiterIndex = decodedText.indexOf(customDelimiter);
        if (delimiterIndex === -1) {
            alert("Invalid compressed file format!");
            return;
        }

        const metadataJSON = decodedText.slice(0, delimiterIndex);
        const metadata = JSON.parse(metadataJSON);

        const compressedStartIndex = new TextEncoder().encode(metadataJSON + customDelimiter).length;
        const compressedBytes = fullData.slice(compressedStartIndex);

        const binaryString = [...compressedBytes].map(byte =>
            byte.toString(2).padStart(8, '0')).join('');

        const trimmedBinary = metadata.pad
            ? binaryString.slice(0, -metadata.pad)
            : binaryString;

        const decompressedText = decodeBinary(trimmedBinary, metadata.dMp);

        const originalFilename = file.name.replace(/\.shrkt$/, '') + '.' + metadata.fT;
        const downloadLink = document.getElementById("downloadLink");
        const blob = new Blob([decompressedText], { type: shortToFullType[metadata.fT] });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = originalFilename;
        downloadLink.style.display = "block";
        downloadLink.click();
        document.getElementById("fileInput").value = '';
    };

    reader.readAsArrayBuffer(file);
}

