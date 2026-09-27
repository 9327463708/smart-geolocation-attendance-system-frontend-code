const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                  <input type="text" placeholder="Enter Enrollment Number" className="input-field" value={forgotEnrollment} onChange={(e) => setForgotEnrollment(e.target.value)} required />`;
const replaceStr = `                  <input type="text" className="input-field bg-gray-100 cursor-not-allowed" value={forgotEnrollment} readOnly title="You cannot change the enrollment number here. Go back to login to change it." />`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(file, content);
