const fs = require('fs');
const path = 'c:\\Users\\Muetaz layyas\\Desktop\\injaz\\web\\src\\app\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The script already replaced the opening tag of the loop Link with <div>
// Now let's find where that was and replace the closing tag.
// It's inside the analyses.map

// Also replace the featured card Link
content = content.replace(
  /<Link href={`\/news\/\${analyses\[0\]\.slug \|\| analyses\[0\]\.id}`} className="relative block aspect-\[16\/10\] rounded-\[3rem\] overflow-hidden shadow-2xl group cursor-pointer">/g,
  '<div className="relative block aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl group">'
);

// Close the tags
// This is a bit tricky with just regex. 
// Let's use a more robust replacement for the whole sections.

const analysesBlockStart = '<div id="analyses-scroll"';
const analysesBlockEnd = ')) : (';
const startIdx = content.indexOf(analysesBlockStart);
const endIdx = content.indexOf(analysesBlockEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let block = content.substring(startIdx, endIdx);
    block = block.replace(/<Link[^>]*>/g, '<div className="flex-1 space-y-3">');
    block = block.replace(/<\/Link>/g, '</div>');
    content = content.substring(0, startIdx) + block + content.substring(endIdx);
}

// Fix مدى الصورة closing tag
content = content.replace(/<\/Link>/g, '</div>'); // This might be too aggressive if there are other Links.
// Let's check for other Links.

fs.writeFileSync(path, content);
console.log('Fixed all links in analyses and image extent');
