const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/HeadDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldNav = `          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={() => setView('faculties')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'faculties' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>Faculty Codes</button>
            <button onClick={() => setView('timetable')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'timetable' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>Manage Timetable</button>
            <button onClick={() => setView('location')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'location' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>College Location Config</button>
            <button onClick={() => setView('students')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'students' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>Manage Students</button>
            <button onClick={() => setView('enrollments')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'enrollments' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>Manage Enrollments</button>
            <button onClick={() => setView('history')} className={\`px-6 py-2 rounded-xl font-bold transition-all shadow-sm \${view === 'history' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>Summary Reports (PDF)</button>
          </div>`;

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
          </div>`;

content = content.replace(oldNav, newNav);
fs.writeFileSync(file, content);
