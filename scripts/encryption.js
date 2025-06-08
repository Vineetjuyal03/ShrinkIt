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
