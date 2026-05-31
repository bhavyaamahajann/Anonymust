import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

// SVG Logo Component
export const Logo = ({ sm }) => (
  <svg className={`logo-svg ${sm ? 'sm' : ''}`} viewBox="0 0 72 72" aria-hidden="true">
    <defs>
      <linearGradient id="lgMint" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d4f5e4" />
        <stop offset="100%" stop-color="#8fd4b0" />
      </linearGradient>
      <linearGradient id="lgForest" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1f5c42" />
        <stop offset="100%" stop-color="#3d9b6e" />
      </linearGradient>
      <linearGradient id="lgLav" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ebe4f8" />
        <stop offset="100%" stop-color="#c9b8e8" />
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".12" />
      </filter>
    </defs>
    <g filter="url(#softShadow)">
      <circle cx="28" cy="48" r="22" fill="url(#lgForest)" opacity=".92" />
      <circle cx="48" cy="44" r="20" fill="url(#lgLav)" opacity=".88" />
      <circle cx="36" cy="26" r="24" fill="url(#lgMint)" />
    </g>
    <g stroke="#2d5a45" stroke-width="1.6" stroke-linecap="round" fill="none">
      <path d="M25 25c-1.5 2.5-1.5 5.5 1 7.5" />
      <path d="M28 23v2.5M27 24.2l1.4 1.2M29.2 24.2l-1.4 1.2" />
      <path d="M47 25c1.5 2.5 1.5 5.5-1 7.5" />
      <path d="M44 23v2.5M43 24.2l1.4 1.2M45.2 24.2l-1.4 1.2" />
      <path d="M32 35q4 3.5 8 0" stroke-width="2" />
    </g>
    <g stroke="#6aab82" stroke-width="1.1" stroke-linecap="round">
      <path d="M21 31v3.5M22.2 32v2M23.4 33v1" />
      <path d="M51 31v3.5M49.8 32v2M48.6 33v1" />
    </g>
  </svg>
);

// Welcome Screen
export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-app" id="screenWelcome">
      <div className="hero-panel">
        <div className="hero-shapes" aria-hidden="true">
          <span className="blob b1"></span>
          <span className="blob b2"></span>
          <span className="wave"></span>
        </div>
        <div className="hero-content">
          <div className="brand-lockup hero-logo">
            <Logo />
            <h1 className="brand-name">AnonyMust</h1>
          </div>
          <h2 className="welcome-title">Welcome Back!</h2>
          <p className="welcome-sub">Share freely, heal together. Sign in or create your safe space.</p>
        </div>
        <div className="welcome-actions">
          <button type="button" className="welcome-btn welcome-btn--outline" onClick={() => navigate('/login')}>Sign in</button>
          <button type="button" className="welcome-btn welcome-btn--filled" onClick={() => navigate('/signup')}>Sign up</button>
        </div>
      </div>
    </div>
  );
};

// Login Screen
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-app" id="screenLogin">
      <div className="hero-panel" style={{ flex: '0 0 auto', minHeight: '140px', paddingBottom: 0 }}>
        <div className="hero-shapes" aria-hidden="true">
          <span className="blob b1"></span>
          <span className="blob b2"></span>
        </div>
        <button type="button" className="back-text" onClick={() => navigate('/')} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>
      <div className="form-sheet">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="outlined-field">
            <label htmlFor="loginEmail">Email</label>
            <input id="loginEmail" type="email" autocomplete="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="outlined-field">
            <label htmlFor="loginPassword">Password</label>
            <input id="loginPassword" type="password" autocomplete="current-password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="field-row">
            <label className="checkbox-label" style={{ margin: 0 }}>
              <input type="checkbox" id="rememberMe" />
              Remember me
            </label>
            <button type="button" className="link-btn" style={{ fontSize: '.875rem' }}>Forgot password?</button>
          </div>
          {error && <p className="form-error" role="status">{error}</p>}
          <button type="submit" className="btn-primary">Sign in</button>
        </form>
        <div className="divider">Sign in with</div>
        <div className="social-row" aria-label="Social sign in">
          <button type="button" className="social-btn" title="Facebook" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.9v-8.41H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.41C19.61 23.08 24 18.09 24 12.07z" /></svg>
          </button>
          <button type="button" className="social-btn" title="Google" aria-label="Google">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.5 3.5 15 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 8.5-4.8 8.5-7.3 0-.5 0-1-.1-1.4H12z" /></svg>
          </button>
          <button type="button" className="social-btn" title="Apple" aria-label="Apple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.68c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.55-2.73-1.76-3.32-1.79-1.41-.14-2.76.83-3.48.83-.73 0-1.85-.81-3.05-.79-1.57.02-3.02.91-3.83 2.32-1.63 2.83-.42 7.02 1.17 9.32.78 1.13 1.7 2.4 2.92 2.35 1.18-.05 1.62-.76 3.05-.76 1.43 0 1.83.76 3.07.74 1.27-.02 2.07-1.15 2.84-2.29.9-1.31 1.27-2.58 1.29-2.65-.03-.01-2.48-.95-2.5-3.78zM14.86 5.2c.65-.79 1.09-1.89.97-2.99-.94.04-2.08.63-2.75 1.42-.6.7-1.13 1.83-.99 2.91 1.05.08 2.12-.53 2.77-1.34z" /></svg>
          </button>
        </div>
        <p className="alt-auth">
          <button type="button" className="link-btn" onClick={() => navigate('/phone')}>Continue with phone number</button>
        </p>
        <p className="form-footer">
          Don't have an account?
          <button type="button" class="link-btn" onClick={() => navigate('/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
};

// Signup Screen
export const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please complete all fields.');
      return;
    }
    if (!agree) {
      setError('Please agree to personal data processing.');
      return;
    }

    // Go to Phone Verification screen and pass form data
    navigate('/phone', { state: { name, email, password } });
  };

  return (
    <div className="auth-app" id="screenSignup">
      <div className="hero-panel" style={{ flex: '0 0 auto', minHeight: '140px', paddingBottom: 0 }}>
        <div className="hero-shapes" aria-hidden="true">
          <span className="blob b1"></span>
          <span className="blob b2"></span>
        </div>
        <button type="button" className="back-text" onClick={() => navigate('/')} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>
      <div className="form-sheet">
        <h2>Get Started</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="outlined-field">
            <label htmlFor="signupName">Full Name</label>
            <input id="signupName" type="text" autocomplete="name" placeholder="Enter Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="outlined-field">
            <label htmlFor="signupEmail">Email</label>
            <input id="signupEmail" type="email" autocomplete="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="outlined-field">
            <label htmlFor="signupPassword">Password</label>
            <input id="signupPassword" type="password" autocomplete="new-password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required minlength="6" />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" id="agreeTerms" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
            <span>I agree to the processing of <a href="#">Personal data</a></span>
          </label>
          {error && <p className="form-error" role="status">{error}</p>}
          <button type="submit" className="btn-primary">Sign up</button>
        </form>
        <div className="divider">Sign up with</div>
        <div className="social-row" aria-label="Social sign up">
          <button type="button" className="social-btn" title="Facebook" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.9v-8.41H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79v8.41C19.61 23.08 24 18.09 24 12.07z" /></svg>
          </button>
          <button type="button" className="social-btn" title="Google" aria-label="Google">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.5 3.5 15 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 8.5-4.8 8.5-7.3 0-.5 0-1-.1-1.4H12z" /></svg>
          </button>
          <button type="button" className="social-btn" title="Apple" aria-label="Apple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.68c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.55-2.73-1.76-3.32-1.79-1.41-.14-2.76.83-3.48.83-.73 0-1.85-.81-3.05-.79-1.57.02-3.02.91-3.83 2.32-1.63 2.83-.42 7.02 1.17 9.32.78 1.13 1.7 2.4 2.92 2.35 1.18-.05 1.62-.76 3.05-.76 1.43 0 1.83.76 3.07.74 1.27-.02 2.07-1.15 2.84-2.29.9-1.31 1.27-2.58 1.29-2.65-.03-.01-2.48-.95-2.5-3.78zM14.86 5.2c.65-.79 1.09-1.89.97-2.99-.94.04-2.08.63-2.75 1.42-.6.7-1.13 1.83-.99 2.91 1.05.08 2.12-.53 2.77-1.34z" /></svg>
          </button>
        </div>
        <p className="alt-auth">
          <button type="button" className="link-btn" onClick={() => navigate('/phone')}>Verify with phone instead</button>
        </p>
        <p className="form-footer">
          Already have an account?
          <button type="button" className="link-btn" onClick={() => navigate('/login')}>Sign In</button>
        </p>
      </div>
    </div>
  );
};

// Phone Entry Screen
export const PhonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Retain signup info if coming from signup flow
  const signupData = location.state || null;

  const handleSendCode = async () => {
    setError('');
    if (!phone) {
      setError('Please enter a phone number.');
      return;
    }

    try {
      const res = await sendOtp(phone);
      // Navigate to OTP page, passing phone and signup metadata
      navigate('/otp', { 
        state: { 
          phone, 
          signupData,
          mockCode: res.code // We pass the mock code to make verification frictionless for the user
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    }
  };

  return (
    <div className="auth-app" id="screenPhone" style={{ background: 'var(--bg)' }}>
      <div className="screen-plain screen-phone">
        <button type="button" className="back-btn" onClick={() => navigate('/login')} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="brand-lockup" style={{ justifyContent: 'center' }}>
          <Logo sm />
          <h1 className="brand-name">AnonyMust</h1>
        </div>
        <p className="tagline-plain">Share Freely, Heal Together</p>
        <div className="field-simple">
          <label className="visually-hidden" htmlFor="phoneInput">Phone number</label>
          <input id="phoneInput" type="tel" inputmode="tel" autocomplete="tel" placeholder="Enter Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength="20" />
        </div>
        {error && <p className="form-error" role="status">{error}</p>}
        <button type="button" className="btn-primary" onClick={handleSendCode} style={{ maxWidth: '340px', marginTop: '16px' }}>Send Code</button>
      </div>
    </div>
  );
};

// OTP Verification Screen
export const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const { phone, signupData, mockCode } = location.state || { phone: 'your number', signupData: null, mockCode: '' };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // If mockCode is supplied by mock backend, alert user so they know what to type
    if (mockCode) {
      console.log(`[Mock OTP Hint] Use OTP code: ${mockCode}`);
      // Fill OTP automatically for quick development testing
      const digits = mockCode.split('');
      if (digits.length === 6) {
        setOtp(digits);
      }
    }
  }, [mockCode]);

  const handleChange = (val, index) => {
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    try {
      if (signupData) {
        // Complete the signup verification flow
        await verifyOtp(phone, code, signupData.name, signupData.email, signupData.password);
      } else {
        // Simple login phone verification flow
        await verifyOtp(phone, code);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid code.');
    }
  };

  return (
    <div className="auth-app" id="screenOtp" style={{ background: 'var(--bg)' }}>
      <div className="screen-plain screen-otp">
        <button type="button" className="back-btn" onClick={() => navigate('/phone')} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <p className="eyrow-otp" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--green-muted)', margin: '0 0 8px' }}>Login/Register</p>
        <h1 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 800 }}>Verify your mobile number</h1>
        <p className="hint">Enter the 6 digit OTP sent to <span className="phone-display">{phone}</span>.</p>
        
        {mockCode && (
          <p style={{ color: 'var(--color-primary)', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>
            <strong>Demo Auto-Filled Code:</strong> {mockCode}
          </p>
        )}

        <div className="otp-row" role="group" aria-label="One-time code">
          {otp.map((digit, i) => (
            <input 
              key={i}
              id={`otp-${i}`}
              className="otp-digit" 
              type="text" 
              inputmode="numeric" 
              maxLength="1" 
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              aria-label={`Digit ${i + 1}`} 
            />
          ))}
        </div>
        
        {error && <p className="form-error" role="status">{error}</p>}
        
        <button type="button" className="btn-primary" onClick={handleVerify} style={{ marginTop: '24px' }}>Verify Code</button>

        <div className="resend">
          <strong>Didn't get the otp? </strong>
          {resendTimer > 0 ? (
            <span>Resend code in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
          ) : (
            <button type="button" className="link" onClick={() => setResendTimer(60)}>Resend code</button>
          )}
        </div>
      </div>
    </div>
  );
};
