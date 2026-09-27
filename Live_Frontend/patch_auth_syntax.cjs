const fs = require('fs');
const file = 'C:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\) : showForgot \? \([\s\S]*?\{showOtpForm \? \(/, ') : showForgot ? (\n              showOtpForm ? (');

// Also make sure the closing tag is correct if we introduced an extra closing brace
// Actually, earlier I replaced `<form onSubmit=\{handleForgotPassword\} ... </form>` with `{showOtpForm ? ( ... ) : ( ... )}`
// Wait, the original was:
// `) : showForgot ? ( <form> ... </form> ) : (`
// I replaced `<form>...</form>` with `{showOtpForm ? <form>...</form> : <form>...</form>}`.
// So the result became `) : showForgot ? ( {showOtpForm ? <form>...</form> : <form>...</form>} ) : (`
// This IS valid JSX! Wait... `{showOtpForm ? ...}` is only valid inside JSX elements (like `<div>{showOtpForm ? ...}</div>`).
// If it's directly inside the ternary `showForgot ? ( {showOtpForm ? ...} ) :`, it is NOT valid JSX because `{}` denotes a JS expression inside JSX, but `( ... )` is already expecting JS or JSX. So `( {showOtpForm ? ... } )` is an object literal or block, which is invalid JSX syntax there.
// The correct syntax is `) : showForgot ? ( showOtpForm ? <form>...</form> : <form>...</form> ) : (` OR `) : showForgot ? ( <> {showOtpForm ? <form>...</form> : <form>...</form>} </> ) : (`.

content = content.replace(/\) : showForgot \? \([\s\S]*?\{showOtpForm \? \(/, ') : showForgot ? ( <>\n              {showOtpForm ? (');

content = content.replace(/<\/form>\n            \)}/, '</form>\n            )} \n            </>');

fs.writeFileSync(file, content);
