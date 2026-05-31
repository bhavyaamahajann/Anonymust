import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [moodCheckins, setMoodCheckins] = useState([]);
  const [pulseScore, setPulseScore] = useState(68); // default todays pulse
  const [nudgesCount, setNudgesCount] = useState(3);
  
  // Composer State
  const [composerText, setComposerText] = useState('');
  const [selectedMood, setSelectedMood] = useState('tense');
  const [composerCategory, setComposerCategory] = useState('workload');

  // Toast State
  const [toastText, setToastText] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch posts and insights
  const fetchDashboardData = async () => {
    try {
      const postsRes = await fetch(`${API_BASE_URL}/api/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      const checkinsRes = await fetch(`${API_BASE_URL}/api/insights/patterns`);
      if (checkinsRes.ok) {
        const checkinsData = await checkinsRes.json();
        setMoodCheckins(checkinsData);
        if (checkinsData.length > 0) {
          // Set todays pulse to the latest checkin score
          setPulseScore(checkinsData[checkinsData.length - 1].score);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const triggerToast = (text) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePostSubmit = async () => {
    if (!composerText.trim()) {
      triggerToast('Add a short note, then get a tailored micro-intervention.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: composerText,
          mood: selectedMood,
          category: composerCategory
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit post');

      // Update local posts feed
      setPosts([data, ...posts]);
      setComposerText('');
      
      // Update checkin score implicitly to match user mood
      let newScore = 68;
      if (selectedMood === 'tense') newScore = 45;
      else if (selectedMood === 'frustrated') newScore = 30;
      else if (selectedMood === 'sad') newScore = 20;
      else if (selectedMood === 'hopeful') newScore = 85;
      else if (selectedMood === 'steady') newScore = 70;
      
      await handleRecordCheckin(newScore);
      setNudgesCount(prev => prev + 1);

      // Trigger intervention toast message
      triggerToast(data.ai_note);
      
      // Return to home feed
      setActiveTab('home');
    } catch (err) {
      triggerToast(err.message || 'Post failed.');
    }
  };

  const handleRecordCheckin = async (score) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/insights/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
      });
      if (res.ok) {
        const data = await res.json();
        setMoodCheckins(data);
        setPulseScore(score);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for formatting post times
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const diffMs = new Date() - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="app-shell">
      <div className="status-bar">
        <span>9:41</span>
        <span>5G • 92%</span>
      </div>
      
      <div className="screen">
        <header className="topbar">
          <div className="brand">
            <div className="logo" aria-label="Anonymust logo">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 5c8 0 14 4.4 17 11.2v7.3c0 10.4-7.4 17.1-17 19.8-9.6-2.7-17-9.4-17-19.8v-7.3C10 9.4 16 5 24 5Z" stroke="currentColor" strokeWidth="3.2" fill="rgba(255,255,255,.12)" />
                <path d="M17 27c2.1 2.5 4.5 3.7 7 3.7s4.9-1.2 7-3.7" stroke="currentColor" strokeWidth="3.2" stroke-linecap="round" />
                <circle cx="18.5" cy="20.2" r="1.8" fill="currentColor" /><circle cx="29.5" cy="20.2" r="1.8" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1>Anonymust</h1>
              <p>Safe release, gentle recovery</p>
            </div>
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Switch theme">
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
        </header>

        <section className="hero">
          <div className="hero-card">
            <div className="eyebrow">Revived prototype</div>
            <h2>Anonymous support built for stressful workdays.</h2>
            <p>Express what happened, get a soft next step, and notice patterns before burnout gets louder.</p>
            <div className="meta-row" style={{ marginTop: '.9rem' }}>
              <div className="chip">Private by default</div>
              <div className="chip">2-minute check-ins</div>
              <div className="chip">Warm AI nudges</div>
            </div>
          </div>
        </section>

        <main className="content">
          {/* Tab 1: HOME */}
          <div className={`view ${activeTab === 'home' ? 'active' : ''}`}>
            <div className="card pulse">
              <div className="section-title">
                <h3>Today’s pulse</h3>
                <span>Updated now</span>
              </div>
              <div className="mood-bar">
                <div className="mood-fill" style={{ width: `${pulseScore}%` }}></div>
              </div>
              <div className="grid-2">
                <div className="kpi">
                  <strong>{pulseScore}%</strong>
                  <span>Calmer than Monday</span>
                </div>
                <div className="kpi">
                  <strong>{nudgesCount}</strong>
                  <span>Nudges completed</span>
                </div>
              </div>
            </div>

            <div className="card intervention">
              <div className="dot">☁️</div>
              <div>
                <strong>Micro-intervention</strong>
                <p className="tiny" style={{ marginTop: '.25rem' }}>Take one slow breath in for four counts, out for six. Then write the one thing you can postpone today.</p>
              </div>
            </div>

            <div>
              <div className="section-title">
                <h3>Community moments</h3>
                <span>Anonymous feed</span>
              </div>
              <div className="feed">
                {posts.map((post) => (
                  <article key={post.id} className="card post">
                    <div className="post-top">
                      <div style={{ display: 'flex', gap: '.75rem' }}>
                        <div className="avatar">{post.avatar}</div>
                        <div>
                          <strong>{post.role}</strong>
                          <br />
                          <small>{formatTime(post.created_at)} • {post.mood}</small>
                        </div>
                      </div>
                      <div className="chip">{post.category}</div>
                    </div>
                    <p>{post.content}</p>
                    {post.ai_note && <div className="ai-note">{post.ai_note}</div>}
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Tab 2: COMPOSER */}
          <div className={`view ${activeTab === 'new' ? 'active' : ''}`}>
            <div className="card composer">
              <div className="section-title">
                <h3>Post anonymously</h3>
                <span>Company-safe</span>
              </div>
              
              <div style={{ margin: '8px 0 16px' }}>
                <label className="tiny" style={{ display: 'block', marginBottom: '6px' }}>Topic Category</label>
                <select 
                  value={composerCategory} 
                  onChange={(e) => setComposerCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                >
                  <option value="workload">Workload</option>
                  <option value="meetings">Meetings</option>
                  <option value="culture">Team Culture</option>
                  <option value="recognition">Recognition</option>
                </select>
              </div>

              <div className="composer-wrap">
                <textarea 
                  placeholder="What happened today? You can be honest here."
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                />
              </div>

              <div className="emoji-row">
                {[
                  { emoji: '😮‍💨', mood: 'tense' },
                  { emoji: '😤', mood: 'frustrated' },
                  { emoji: '😔', mood: 'sad' },
                  { emoji: '🙂', mood: 'hopeful' },
                  { emoji: '😌', mood: 'steady' }
                ].map(item => (
                  <button 
                    key={item.mood}
                    className={`emoji ${selectedMood === item.mood ? 'active' : ''}`}
                    onClick={() => setSelectedMood(item.mood)}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              <div className="composer-actions">
                <button className="secondary-btn" type="button" onClick={() => triggerToast('Draft saved successfully!')}>Save draft</button>
                <button className="primary-btn" type="button" onClick={handlePostSubmit}>Post and get support</button>
              </div>
            </div>
            <div className="card">
              <strong>Why this flow is better</strong>
              <p className="tiny" style={{ marginTop: '.45rem' }}>The revive removes clutter, keeps one primary action, and immediately turns expression into a soft, useful next step.</p>
            </div>
          </div>

          {/* Tab 3: INSIGHTS */}
          <div className={`view ${activeTab === 'insights' ? 'active' : ''}`}>
            <div className="card">
              <div className="section-title">
                <h3>Weekly pattern</h3>
                <span>Last 7 entries</span>
              </div>
              <div className="mini-chart" aria-hidden="true">
                {moodCheckins.map((checkin) => (
                  <i key={checkin.id} style={{ height: `${checkin.score}%` }} title={`Score: ${checkin.score}%`}></i>
                ))}
              </div>
              <p className="tiny" style={{ marginTop: '.7rem' }}>Your stress spikes after clustered meetings. Evening check-ins help your score recover fastest.</p>
            </div>
            
            <div className="list">
              <div className="card">
                <strong>Check-in Pulse Level Indicator</strong>
                <p className="tiny" style={{ marginTop: '.45rem', marginBottom: '.85rem' }}>Set current pulse to record an manual update:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[30, 50, 70, 90].map(s => (
                    <button 
                      key={s} 
                      className="chip" 
                      onClick={() => handleRecordCheckin(s)}
                      style={{ cursor: 'pointer', background: pulseScore === s ? 'var(--color-primary-soft)' : '' }}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="card">
                <strong>Trigger</strong>
                <p className="tiny" style={{ marginTop: '.35rem' }}>Role ambiguity shows up in 4 of 7 entries.</p>
              </div>
              <div className="card">
                <strong>Best intervention</strong>
                <p className="tiny" style={{ marginTop: '.35rem' }}>Short breathing resets had the highest completion this week.</p>
              </div>
              <div className="card">
                <strong>Protective habit</strong>
                <p className="tiny" style={{ marginTop: '.35rem' }}>A two-line journal note after hard calls lowers next-check-in intensity.</p>
              </div>
            </div>
          </div>

          {/* Tab 4: SETTINGS */}
          <div className={`view ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="list">
              <div className="card settings-row">
                <div>
                  <strong>Dark mode</strong>
                  <div className="tiny">Softer late-night reading</div>
                </div>
                <button 
                  className={`toggle ${theme === 'dark' ? 'on' : ''}`} 
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                />
              </div>
              <div className="card settings-row">
                <div>
                  <strong>Gentle reminders</strong>
                  <div className="tiny">Only when stress is rising</div>
                </div>
                <button className="toggle on" aria-label="Reminders enabled"></button>
              </div>
              
              <div className="card settings-row" style={{ cursor: 'pointer' }} onClick={logout}>
                <div>
                  <strong style={{ color: '#c62828' }}>Logout</strong>
                  <div className="tiny">Sign out of {user?.name || 'Account'}</div>
                </div>
                <div>🚪</div>
              </div>

              <div className="card">
                <strong>Privacy language</strong>
                <p className="tiny" style={{ marginTop: '.4rem' }}>No names in posts. Patterns are shown in aggregate. The tone is built to feel safe, corporate, and warm at the same time.</p>
              </div>
            </div>
          </div>
        </main>

        <nav className="tabs" aria-label="Primary">
          <button className={`tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>⌂<span>Home</span></button>
          <button className={`tab ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>＋<span>New</span></button>
          <button className={`tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>◔<span>Insights</span></button>
          <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>☰<span>Settings</span></button>
        </nav>
      </div>

      <div className={`toast ${showToast ? 'show' : ''}`} id="toast">
        <strong>Support ready</strong>
        <div className="tiny" id="toastText" style={{ marginTop: '.2rem' }}>{toastText}</div>
      </div>
    </div>
  );
};
