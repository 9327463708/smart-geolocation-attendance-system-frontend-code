const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// The exact string to replace
const oldRegexStr = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s.])(?!.*[\\s.]).*$/';
const newRegexStr = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s.])(?!.*[\\s.]).{4,12}$/';

content = content.split(oldRegexStr).join(newRegexStr);

// Update error messages
const oldErrMsg = "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots.";
const newErrMsg = "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces or dots. Max 12 characters.";
content = content.split(oldErrMsg).join(newErrMsg);

// Update HTML hints
const oldHint = "Must contain 1 uppercase, 1 lowercase, 1 number, 1 special char. No spaces or dots.";
const newHint = "Must contain 1 uppercase, 1 lowercase, 1 number, 1 special char. No spaces/dots. Max 12 chars.";
content = content.split(oldHint).join(newHint);

fs.writeFileSync(file, content);
