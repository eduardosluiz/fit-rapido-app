const fs = require('fs');
const file = 'src/app/admin/modalidades/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/text-\[9px\] font-black uppercase tracking-widest text-gray-500/g, 'text-[10px] font-medium uppercase tracking-wide text-gray-500');
content = content.replace(/text-\[9px\] font-bold uppercase tracking-\[0\.15em\] text-gray-800 dark:text-gray-200/g, 'text-[10px] font-medium uppercase tracking-wide text-gray-500');
content = content.replace(/text-\[9px\] font-bold uppercase tracking-\[0\.2em\] text-gray-500/g, 'text-[10px] font-medium uppercase tracking-wide text-gray-500');
content = content.replace(/text-\[9px\] font-bold uppercase tracking-\[0\.2em\] text-\[#c8921a\]/g, 'text-[10px] font-medium uppercase tracking-wide text-gray-500');

content = content.replace(/(<input[^>]*?)font-bold([^>]*?>)/g, '$1font-medium$2');

fs.writeFileSync(file, content);
console.log('Styles updated.');
