const fs = require('fs');
const file = 'c:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/FacultyDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const navStart = '<div className="flex flex-wrap gap-4 mb-6">';
const navEnd = '<div className="flex-grow"></div>\n        </div>';

const startIndex = content.indexOf(navStart);
const endIndex = content.indexOf(navEnd, startIndex) + navEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const oldNavStr = content.substring(startIndex, endIndex);
  
  const newNav = `        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setView('history')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'history' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm text-center">Attendance History</span>
          </button>
          <button onClick={() => setView('today')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'today' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            <span className="text-sm text-center">Today's Approvals</span>
          </button>
          <button onClick={() => setView('qr')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'qr' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>
            <span className="text-sm text-center">Live QR Code</span>
          </button>
        </div>`;

  content = content.replace(oldNavStr, newNav);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Could not find start/end", startIndex, endIndex);
}
