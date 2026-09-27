const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/HeadDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('<div className="flex flex-wrap gap-4 mb-6">');
const nextPart = "        {view === 'timetable' && <TimetableManager />}";
let endIndex = content.indexOf(nextPart);

// fallback if nextPart not found exactly like that
if (endIndex === -1) {
  endIndex = content.indexOf("{view === 'timetable' && <TimetableManager />}");
}
if (endIndex === -1) {
  endIndex = content.indexOf("          {view === 'enrollments' && (");
}

if (startIndex !== -1 && endIndex !== -1) {
  const newNav = `          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setView('faculties')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'faculties' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">👨‍🏫</span>
              <span className="text-sm text-center">Faculty Codes</span>
            </button>
            <button onClick={() => setView('timetable')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'timetable' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">📅</span>
              <span className="text-sm text-center">Timetable</span>
            </button>
            <button onClick={() => setView('location')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'location' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">📍</span>
              <span className="text-sm text-center">College Location</span>
            </button>
            <button onClick={() => setView('students')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'students' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">🎓</span>
              <span className="text-sm text-center">Students</span>
            </button>
            <button onClick={() => setView('enrollments')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'enrollments' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">📋</span>
              <span className="text-sm text-center">Enrollments</span>
            </button>
            <button onClick={() => setView('history')} className={\`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all \${view === 'history' ? 'bg-brand-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:bg-gray-100'}\`}>
              <span className="text-xl mb-1">📊</span>
              <span className="text-sm text-center">PDF Reports</span>
            </button>
          </div>\n\n`;

  content = content.substring(0, startIndex) + newNav + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Failed to find boundaries", startIndex, endIndex);
}
