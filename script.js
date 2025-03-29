class HuffmanNode{
    constructor(char,freq,left=null,right=null){
        this.char=char;
        this.freq=freq;
        this.left=left;
        this.right=right;
    }
}


function getFrequencies(text) {
    const frequencyMap = new Map();

    for (const char of text) {
        // If character exists, increment count; otherwise, set to 1
        frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }

    return frequencyMap;
}


function buildHuffmanTree(frequencyMap) {
    // Create a priority queue (min-heap) from the frequency map
    const nodes = Array.from(frequencyMap, ([char, frequency]) => new HuffmanNode(char, frequency));
    nodes.sort((a, b) => a.frequency - b.frequency);

    // Build the tree by combining the lowest frequency nodes
    if(nodes.length>1){

        while (nodes.length > 1) {
            const left = nodes.shift();      // Smallest node
            const right = nodes.shift();     // Second smallest node
            
            // Create a new internal node with combined frequency
            const newNode = new HuffmanNode(null, left.frequency + right.frequency);
            newNode.left = left;
            newNode.right = right;
            
            // Add the new node back and sort again
            nodes.push(newNode);
            nodes.sort((a, b) => a.frequency - b.frequency);
        }
        
    }
    else if(nodes.length==1) {
        const left=nodes.shift();
        const newNode=new HuffmanNode(null,left.frequency);
        newNode.left=left;
        nodes.push(newNode);
    }
    // The last remaining node is the root of the Huffman Tree
    return nodes[0];
}

function generateCodes(root){
    const codes={};
    function traverse(node,currentCode){
        if(!node) return;
        if(node.char!=null){
            codes[node.char]=currentCode;
        }

        traverse(node.left,currentCode+'0');
        traverse(node.right,currentCode+'1');
    }
    traverse(root,'');
    return codes;
    
}

function compressText(inputText) {
    const frequencyMap = getFrequencies(inputText); // Use inputText here
    const root = buildHuffmanTree(frequencyMap);
    const codes = generateCodes(root);

    // Use an array for better performance
    const compressedBinary = [];
    for (const char of inputText) {
        compressedBinary.push(codes[char]);
    }

    return compressedBinary.join(''); // Convert array to a single binary string
}
