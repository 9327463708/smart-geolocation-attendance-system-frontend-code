const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

const validationCodeAuth = `
    if (mode === 'register' && role === 'student') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s.])(?!.*[\\s.]).*$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots.');
        return;
      }
    }
`;

content = content.replace(
  /const handleAuth = async \(e\) => {\s*e\.preventDefault\(\);\s*setError\(''\);/,
  `const handleAuth = async (e) => {\n    e.preventDefault();\n    setError('');\n${validationCodeAuth}`
);

fs.writeFileSync(file, content);
