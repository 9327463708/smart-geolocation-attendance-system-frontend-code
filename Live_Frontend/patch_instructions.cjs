const fs = require('fs');
const file = 'c:/Users/HP/Downloads/Temple Management/college-attendance-system/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                <div className="flex flex-col gap-3 mt-6">
                  <button type="button" onClick={handleForgotPassword} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center bg-gray-800 hover:bg-gray-900">
                    {loading && loadingType === 'old' ? 'Sending...' : 'Get Old Password on Email'}
                  </button>
                  <div className="text-center text-xs text-gray-500 font-bold">- OR -</div>
                  <button type="button" onClick={handleSendOtp} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center">
                    {loading && loadingType === 'otp' ? 'Sending OTP...' : 'Set New Password (via OTP)'}
                  </button>
                </div>`;

const newStr = `                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={handleForgotPassword} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center bg-gray-800 hover:bg-gray-900">
                      {loading && loadingType === 'old' ? 'Sending...' : 'Get Old Password on Email'}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center leading-tight">Use this to receive your current password directly to your registered email.</p>
                  </div>
                  
                  <div className="text-center text-xs text-gray-400 font-black">- OR -</div>
                  
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={handleSendOtp} disabled={loading || !forgotEnrollment} className="btn-primary w-full flex justify-center items-center">
                      {loading && loadingType === 'otp' ? 'Sending OTP...' : 'Set New Password (via OTP)'}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center leading-tight">Use this to securely reset and create a brand new password via OTP verification.</p>
                  </div>
                </div>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
console.log('Instructions added');
