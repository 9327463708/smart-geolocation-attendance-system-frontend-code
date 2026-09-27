const fs = require('fs');
const file = 'c:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add loadingType state
if (!content.includes('const [loadingType, setLoadingType] = useState(null);')) {
  content = content.replace(
    'const [loading, setLoading] = useState(false);',
    'const [loading, setLoading] = useState(false);\n  const [loadingType, setLoadingType] = useState(null);'
  );
}

// Update handleForgotPassword
content = content.replace(
  'setLoading(true);\n    try {\n      const res = await axios.post(\'http://localhost:5000/api/auth/forgot-password\'',
  'setLoading(true);\n    setLoadingType(\'old\');\n    try {\n      const res = await axios.post(\'http://localhost:5000/api/auth/forgot-password\''
);
// Make sure to reset loadingType in finally
content = content.replace(
  'setError(err.response?.data?.message || \'Server Error\');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  if (!role)',
  'setError(err.response?.data?.message || \'Server Error\');\n    } finally {\n      setLoading(false);\n      setLoadingType(null);\n    }\n  };\n\n  if (!role)'
);

// Update handleSendOtp
content = content.replace(
  'setLoading(true);\n    try {\n      const res = await axios.post(\'http://localhost:5000/api/auth/send-otp\'',
  'setLoading(true);\n    setLoadingType(\'otp\');\n    try {\n      const res = await axios.post(\'http://localhost:5000/api/auth/send-otp\''
);
content = content.replace(
  'setError(err.response?.data?.message || \'Server Error\');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const handleChangePasswordOtp',
  'setError(err.response?.data?.message || \'Server Error\');\n    } finally {\n      setLoading(false);\n      setLoadingType(null);\n    }\n  };\n\n  const handleChangePasswordOtp'
);

// Update buttons
content = content.replace(
  '{loading ? \'Sending...\' : \'Get Old Password on Email\'}',
  '{loading && loadingType === \'old\' ? \'Sending...\' : \'Get Old Password on Email\'}'
);
content = content.replace(
  '{loading ? \'Sending OTP...\' : \'Set New Password (via OTP)\'}',
  '{loading && loadingType === \'otp\' ? \'Sending OTP...\' : \'Set New Password (via OTP)\'}'
);

fs.writeFileSync(file, content);
console.log('Fixed loading buttons');
