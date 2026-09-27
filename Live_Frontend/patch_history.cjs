const fs = require('fs');
const file = 'c:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/FacultyDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `          </div>
        )}


      </div>
    </div>`;

const historyBlock = `          </div>
        )}

        {view === 'history' && (
          <div className="card space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Past Attendance History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium rounded-tl-lg">Date / Time</th>
                    <th className="p-3 border-b font-medium">Name</th>
                    <th className="p-3 border-b font-medium">Enrollment No</th>
                    <th className="p-3 border-b font-medium">Distance</th>
                    <th className="p-3 border-b font-medium rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allHistory.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition">
                      <td className="p-3 text-sm text-gray-700">
                        <div className="font-semibold">{new Date(record.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(record.date).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.name}</td>
                      <td className="p-3 text-sm text-gray-700">{record.studentId?.enrollmentNumber}</td>
                      <td className="p-3 text-sm text-gray-500">{record.distance}m</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Approved</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allHistory.length === 0 && <p className="text-center py-6 text-gray-500">No past attendance records found.</p>}
            </div>
          </div>
        )}

      </div>
    </div>`;

content = content.replace(targetStr, historyBlock);
fs.writeFileSync(file, content);
console.log('History view added');
