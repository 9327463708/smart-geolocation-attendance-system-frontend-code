const fs = require('fs');
const file = 'c:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/HeadDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('<button type="submit" className="flex-1 btn-success">Update Config</button>', '<button type="submit" className="flex-1 btn-success">Save Location</button>');

const oldNavStart = '<div className="flex flex-wrap gap-4 mb-8">';
let startIndex = content.indexOf(oldNavStart);
if (startIndex === -1) {
  startIndex = content.indexOf('<div className="flex flex-wrap gap-4 mb-6">');
}

const nextPart = "        {view === 'timetable' && <TimetableManager />}";
let endIndex = content.indexOf(nextPart);

if (startIndex !== -1 && endIndex !== -1) {
  const newNav = `          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setView('faculties')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'faculties' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              <span className="text-sm text-center">Faculty Codes</span>
            </button>
            <button onClick={() => setView('timetable')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'timetable' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              <span className="text-sm text-center">Timetable</span>
            </button>
            <button onClick={() => setView('location')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'location' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              <span className="text-sm text-center">College Location</span>
            </button>
            <button onClick={() => setView('students')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'students' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
              <span className="text-sm text-center">Students</span>
            </button>
            <button onClick={() => setView('enrollments')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'enrollments' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
              <span className="text-sm text-center">Enrollments</span>
            </button>
            <button onClick={() => setView('history')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'history' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              <span className="text-sm text-center">PDF Reports</span>
            </button>
          </div>\n\n`;

  content = content.substring(0, startIndex) + newNav + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Indices not found", startIndex, endIndex);
}
