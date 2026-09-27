const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/HeadDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('<button type="submit" className="flex-1 btn-success">Update Config</button>', '<button type="submit" className="flex-1 btn-success">Save Location</button>');
fs.writeFileSync(file, content);
