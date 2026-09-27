const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add * to Enrollment Number label
content = content.replace(
  '{role === \'admin\' ? "Admin Username" : "Enrollment Number"}',
  '{role === \'admin\' ? "Admin Username" : "Enrollment Number"} <span className="text-red-500">*</span>'
);

// 2. Change onClick behavior of Forgot / Change Password link
const newOnClick = `onClick={() => {
                      if (!formData.enrollmentNumber) {
                        setError('પાસવર્ડ બદલવા માટે પહેલા તમારો Enrollment Number ઉપરના ખાનામાં લખો.');
                        return;
                      }
                      setForgotEnrollment(formData.enrollmentNumber);
                      setShowForgot(true);
                    }}`;

// Wait, the file might have multiple `onClick={() => setShowForgot(true)}`.
// I'll replace the specific one that is near the text "Forgot / Change Password?"
const targetStr = `onClick={() => setShowForgot(true)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">
                      Forgot / Change Password?`;
const replaceStr = `${newOnClick} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition">
                      Forgot / Change Password?`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync(file, content);
