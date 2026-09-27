const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// The password regex rule
const validationCode = `
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s.])(?!.*[\\s.]).*$/;
    if (!passwordRegex.test(forgotNewPassword)) {
      setError('Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots.');
      return;
    }
`;

content = content.replace(
  /const handleChangePasswordOtp = async \(e\) => {\s*e\.preventDefault\(\);\s*setError\(''\);\s*setMsg\(''\);\s*setLoading\(true\);/,
  `const handleChangePasswordOtp = async (e) => {\n    e.preventDefault();\n    setError('');\n    setMsg('');\n${validationCode}\n    setLoading(true);`
);

// Add the UI hint below the new password box
content = content.replace(
  /<input type="password" placeholder="Enter New Password" className="input-field" value=\{forgotNewPassword\} onChange=\{\(e\) => setForgotNewPassword\(e\.target\.value\)\} required \/>/,
  `<input type="password" placeholder="Enter New Password" className="input-field" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} required />\n                  <p className="text-xs text-gray-500 mt-1">Must contain 1 uppercase, 1 lowercase, 1 number, 1 special char. No spaces or dots.</p>`
);

fs.writeFileSync(file, content);
