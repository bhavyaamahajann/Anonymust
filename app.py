import streamlit as st
import sqlite3
import datetime
import random

# Page Config
st.set_page_config(
    page_title="Anonymust — Safe Release",
    page_icon="☁️",
    layout="centered"
)

# Custom CSS matching authentic premium mockup styling
st.markdown("""
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet">
<style>
    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Satoshi', sans-serif;
        background-color: #f1f8f9;
        color: #28251d;
    }
    .main-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        justify-content: center;
        padding-top: 20px;
    }
    
    /* Mockup Overlapping Circle Logo */
    .logo-mockup {
        position: relative;
        width: 72px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .circle-bg {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        opacity: 0.65;
    }
    .circle-1 {
        background: #4caf50;
        left: 6px;
        z-index: 1;
    }
    .circle-2 {
        background: #00bcd4;
        right: 12px;
        z-index: 2;
    }
    .circle-3 {
        background: #e0e0e0;
        left: 18px;
        bottom: 4px;
        z-index: 0;
    }
    .smile-face {
        position: absolute;
        z-index: 3;
        font-size: 14px;
        color: #1c3d3a;
        display: flex;
        gap: 4px;
        align-items: center;
        transform: translateY(-2px);
        font-weight: bold;
    }
    
    .brand-title {
        font-size: 32px;
        font-weight: 900;
        color: #007b83;
        margin: 0;
        line-height: 1;
        letter-spacing: -0.03em;
    }
    
    .teal-sheet-card {
        background: #00828a;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        margin-bottom: 25px;
        color: white;
    }
    
    .teal-sheet-card h2 {
        color: white;
        text-align: center;
        font-size: 26px;
        font-weight: 800;
        margin-bottom: 20px;
    }
    
    .hero-card {
        background: linear-gradient(160deg, rgba(12, 123, 114, 0.1), #ffffff);
        border-radius: 16px;
        padding: 20px;
        border: 1px solid rgba(12, 123, 114, 0.15);
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        margin-bottom: 25px;
    }
    .hero-title {
        font-size: 20px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 8px;
    }
    .hero-desc {
        font-size: 14px;
        color: #6f6b64;
        margin-bottom: 12px;
    }
    .chip {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 999px;
        background: #efece6;
        border: 1px solid #d9d5cf;
        font-size: 11px;
        margin-right: 8px;
        margin-bottom: 8px;
        color: #28251d;
    }
    .card {
        background: white;
        border: 1px solid #efece6;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.01);
        margin-bottom: 16px;
        color: #28251d;
    }
    .post-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .avatar-role {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .avatar {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: rgba(12, 123, 114, 0.15);
        color: #0c7b72;
        display: grid;
        place-items: center;
        font-weight: bold;
    }
    .role-text {
        font-weight: 700;
        font-size: 14px;
    }
    .time-text {
        font-size: 11px;
        color: #8b877f;
    }
    .ai-note {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 123, 114, 0.08);
        border-left: 3px solid #0c7b72;
        font-size: 12px;
        color: #28251d;
        margin-top: 10px;
    }
    .toast-container {
        padding: 12px;
        background: white;
        border-radius: 8px;
        border: 1px solid #0c7b72;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        margin-top: 15px;
    }
</style>
""", unsafe_allow_html=True)

# Database Setup
DB_FILE = "streamlit_database.sqlite"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                mood TEXT NOT NULL,
                category TEXT NOT NULL,
                role TEXT NOT NULL,
                avatar TEXT NOT NULL,
                ai_note TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                score INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

init_db()

# Session State Initialization
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "auth_step" not in st.session_state:
    st.session_state.auth_step = "welcome"
if "user_name" not in st.session_state:
    st.session_state.user_name = None
if "phone_number" not in st.session_state:
    st.session_state.phone_number = None
if "signup_data" not in st.session_state:
    st.session_state.signup_data = None
if "mock_otp" not in st.session_state:
    st.session_state.mock_otp = None

# Helper functions for AI reflections
def get_ai_reflection(content, mood):
    text = content.lower()
    if mood == 'tense' or 'drained' in text or 'exhausted' in text or 'tired' in text:
        return 'AI reflection: This sounds like invisible labor plus low recognition. Suggested reset: 3-minute decompression before your next handoff.'
    elif mood == 'frustrated' or 'angry' in text or 'hate' in text or 'stupid' in text:
        return 'AI reflection: Frustration usually hides overload. Suggested support: Write down one task that should not be yours today, and step away from the keyboard for 5 minutes.'
    elif mood == 'sad' or 'heavy' in text or 'sad' in text or 'cry' in text:
        return 'AI reflection: This feels heavy. Micro-support: Step away for a glass of water, then share how you feel with one trusted colleague or friend.'
    elif mood == 'hopeful' or 'happy' in text or 'good' in text or 'win' in text:
        return 'AI reflection: Protect that positive momentum! Suggestion: Write down this victory so you can recall it during a future stressful day.'
    return 'AI reflection: You are maintaining a steady pace. Keep taking small micro-resets throughout the day to sustain your headspace.'

# Header Logo area
st.markdown("""
<div class="main-header">
    <div class="logo-mockup">
        <div class="circle-bg circle-1"></div>
        <div class="circle-bg circle-2"></div>
        <div class="circle-bg circle-3"></div>
        <div class="smile-face">
            <span>•</span>
            <span style="font-size:10px; margin-top:2px;">◡</span>
            <span>•</span>
        </div>
    </div>
    <div>
        <h1 class="brand-title">AnonyMust</h1>
    </div>
</div>
""", unsafe_allow_html=True)

# ----------------- AUTH FLOW -----------------
if not st.session_state.authenticated:
    
    if st.session_state.auth_step == "welcome":
        with st.container():
            st.markdown("""
            <div class="teal-sheet-card" style="text-align: center;">
                <h2>Welcome Back!</h2>
                <p style="color:rgba(255,255,255,0.8); font-size:14px; margin-bottom:20px;">Share freely, heal together. Sign in or create your safe space.</p>
            </div>
            """, unsafe_allow_html=True)
            
            col1, col2 = st.columns(2)
            if col1.button("Sign In", use_container_width=True, type="secondary"):
                st.session_state.auth_step = "login"
                st.rerun()
            if col2.button("Sign Up", use_container_width=True, type="primary"):
                st.session_state.auth_step = "signup"
                st.rerun()
            
    elif st.session_state.auth_step == "login":
        st.markdown("""
        <div class="teal-sheet-card">
            <h2>Log In</h2>
        </div>
        """, unsafe_allow_html=True)
        
        email = st.text_input("✉️ Email", placeholder="john.doe@example.com")
        password = st.text_input("🔒 Password", type="password", placeholder="••••••••••••")
        
        col1, col2 = st.columns([1, 1])
        if col1.button("Back", use_container_width=True):
            st.session_state.auth_step = "welcome"
            st.rerun()
        if col2.button("Log In", use_container_width=True, type="primary"):
            if not email or not password:
                st.error("Please fill in email and password.")
            else:
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                    user = cursor.fetchone()
                    if user and user['password'] == password:
                        st.session_state.authenticated = True
                        st.session_state.user_name = user['name']
                        st.success("Successfully logged in!")
                        st.rerun()
                    else:
                        st.error("Invalid email or password.")
                        
        st.markdown("---")
        if st.button("Continue with phone number", use_container_width=True):
            st.session_state.auth_step = "phone"
            st.rerun()
            
    elif st.session_state.auth_step == "signup":
        st.markdown("""
        <div class="teal-sheet-card">
            <h2>Sign Up</h2>
        </div>
        """, unsafe_allow_html=True)
        
        first_name = st.text_input("👤 First Name", placeholder="John")
        last_name = st.text_input("👤 Last Name", placeholder="Doe")
        email = st.text_input("✉️ Email", placeholder="john.doe@example.com")
        password = st.text_input("🔒 Password", type="password", placeholder="••••••••••••")
        confirm_password = st.text_input("🔒 Confirm Password", type="password", placeholder="••••••••••••")
        agree = st.checkbox("I agree to the Terms of Service and Privacy Policy", value=True)
        
        col1, col2 = st.columns(2)
        if col1.button("Back", use_container_width=True):
            st.session_state.auth_step = "welcome"
            st.rerun()
        if col2.button("Sign Up", use_container_width=True, type="primary"):
            if not first_name or not last_name or not email or not password or not confirm_password:
                st.error("Please complete all fields.")
            elif password != confirm_password:
                st.error("Passwords do not match.")
            elif not agree:
                st.error("Please agree to personal data processing.")
            else:
                st.session_state.signup_data = {
                    "name": f"{first_name} {last_name}",
                    "email": email,
                    "password": password
                }
                st.session_state.auth_step = "phone"
                st.rerun()

    elif st.session_state.auth_step == "phone":
        st.markdown("""
        <div class="teal-sheet-card">
            <h2>Verify Phone</h2>
        </div>
        """, unsafe_allow_html=True)
        phone = st.text_input("📞 Phone Number", placeholder="e.g. +1 555-0199")
        
        col1, col2 = st.columns(2)
        if col1.button("Back", use_container_width=True):
            st.session_state.auth_step = "welcome"
            st.rerun()
        if col2.button("Send Code", use_container_width=True, type="primary"):
            if not phone:
                st.error("Please enter your phone number.")
            else:
                code = str(random.randint(100000, 999999))
                st.session_state.phone_number = phone
                st.session_state.mock_otp = code
                st.session_state.auth_step = "otp"
                st.rerun()

    elif st.session_state.auth_step == "otp":
        st.markdown("""
        <div class="teal-sheet-card">
            <h2>Enter OTP</h2>
        </div>
        """, unsafe_allow_html=True)
        st.write(f"Enter the 6-digit OTP code sent to: **{st.session_state.phone_number}**")
        st.info(f"Demo OTP Code: {st.session_state.mock_otp}")
        
        entered_code = st.text_input("OTP Code", placeholder="XXXXXX", max_chars=6)
        
        col1, col2 = st.columns(2)
        if col1.button("Back", use_container_width=True):
            st.session_state.auth_step = "phone"
            st.rerun()
        if col2.button("Verify Code", use_container_width=True, type="primary"):
            if entered_code == st.session_state.mock_otp:
                if st.session_state.signup_data:
                    sd = st.session_state.signup_data
                    try:
                        with get_db() as conn:
                            conn.execute(
                                "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
                                (sd["name"], sd["email"], sd["password"], st.session_state.phone_number)
                            )
                            conn.commit()
                        st.session_state.user_name = sd["name"]
                    except sqlite3.IntegrityError:
                        st.session_state.user_name = sd["name"]
                else:
                    st.session_state.user_name = f"User {st.session_state.phone_number[-4:]}"
                
                st.session_state.authenticated = True
                st.success("Successfully Verified!")
                st.rerun()
            else:
                st.error("Invalid OTP code.")

# ----------------- APP SYSTEM -----------------
else:
    # Navigation sidebar
    st.sidebar.title("☁️ AnonyMust Menu")
    st.sidebar.write(f"Welcome, **{st.session_state.user_name}**!")
    
    view_selection = st.sidebar.radio(
        "Navigate to:",
        ["Home & Feed", "Post Anonymously", "Insights & Patterns", "Settings"]
    )
    
    if st.sidebar.button("Logout 🚪", use_container_width=True):
        st.session_state.authenticated = False
        st.session_state.auth_step = "welcome"
        st.session_state.user_name = None
        st.session_state.phone_number = None
        st.session_state.signup_data = None
        st.session_state.mock_otp = None
        st.rerun()

    # Render views
    if view_selection == "Home & Feed":
        st.markdown("""
        <div class="hero-card">
            <div class="eyebrow">Revived Streamlit App</div>
            <div class="hero-title">Anonymous support built for stressful workdays.</div>
            <div class="hero-desc">Express what happened, get a soft next step, and notice patterns before burnout gets louder.</div>
            <div>
                <span class="chip">Private by default</span>
                <span class="chip">2-minute check-ins</span>
                <span class="chip">Warm AI nudges</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Pulse calculation
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT score FROM checkins ORDER BY created_at DESC LIMIT 1")
            latest_score_row = cursor.fetchone()
            pulse_score = latest_score_row[0] if latest_score_row else 68
            
            cursor.execute("SELECT COUNT(*) FROM posts")
            posts_count = cursor.fetchone()[0]

        # Pulse indicators
        st.markdown("### Today’s Pulse")
        st.progress(pulse_score / 100.0)
        
        col1, col2 = st.columns(2)
        col1.metric("Pulse Score", f"{pulse_score}%", "Calmer than Monday")
        col2.metric("Nudges Completed", posts_count)
        
        st.markdown("""
        <div class="card" style="display:flex; gap:12px; align-items:flex-start;">
            <div style="font-size:24px;">☁️</div>
            <div>
                <strong>Micro-intervention</strong>
                <p style="font-size:12px; margin-top:4px; color:#6f6b64;">Take one slow breath in for four counts, out for six. Then write the one thing you can postpone today.</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### Community Moments (Anonymous Feed)")
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM posts ORDER BY created_at DESC")
            posts = cursor.fetchall()
            
            for post in posts:
                st.markdown(f"""
                <div class="card">
                    <div class="post-header">
                        <div class="avatar-role">
                            <div class="avatar">{post['avatar']}</div>
                            <div>
                                <span class="role-text">{post['role']}</span><br/>
                                <span class="time-text">{post['mood']}</span>
                            </div>
                        </div>
                        <span class="chip">{post['category']}</span>
                    </div>
                    <p style="font-size:14px; margin-bottom:8px;">{post['content']}</p>
                    <div class="ai-note">{post['ai_note']}</div>
                </div>
                """, unsafe_allow_html=True)

    elif view_selection == "Post Anonymously":
        st.markdown("### Post Anonymously")
        st.write("Share how you are feeling, completely company-safe.")
        
        category = st.selectbox(
            "Select Category",
            ["workload", "meetings", "team culture", "recognition"]
        )
        
        content = st.text_area(
            "What happened today? You can be honest here.",
            placeholder="Type your release note..."
        )
        
        mood = st.select_slider(
            "Select Mood",
            options=["sad", "tense", "frustrated", "steady", "hopeful"],
            value="tense"
        )
        
        mood_emojis = {
            "sad": "😔",
            "tense": "😮‍💨",
            "frustrated": "😤",
            "steady": "😌",
            "hopeful": "🙂"
        }
        
        if st.button("Post & Get Support", type="primary"):
            if not content.strip():
                st.warning("Please type a short note before posting.")
            else:
                roles = [
                    ("Ops Team", "A"),
                    ("Product Circle", "P"),
                    ("Design Group", "D"),
                    ("Dev Lead", "S"),
                    ("Marketing Hub", "M")
                ]
                role_name, avatar_letter = random.choice(roles)
                ai_note = get_ai_reflection(content, mood)
                
                with get_db() as conn:
                    conn.execute(
                        "INSERT INTO posts (content, mood, category, role, avatar, ai_note) VALUES (?, ?, ?, ?, ?, ?)",
                        (content, mood_emojis[mood] + " " + mood, category, role_name, avatar_letter, ai_note)
                    )
                    
                    score_map = {"sad": 20, "tense": 45, "frustrated": 30, "steady": 70, "hopeful": 90}
                    conn.execute("INSERT INTO checkins (score) VALUES (?)", (score_map[mood],))
                    conn.commit()
                    
                st.success("Post submitted anonymously!")
                st.markdown(f"""
                <div class="toast-container">
                    <strong>Support ready</strong>
                    <p style="font-size:12px; margin-top:4px; color:#6f6b64;">{ai_note}</p>
                </div>
                """, unsafe_allow_html=True)

    elif view_selection == "Insights & Patterns":
        st.markdown("### Insights & Patterns")
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT score, created_at FROM checkins ORDER BY created_at ASC LIMIT 7")
            checkin_rows = cursor.fetchall()
            
        if checkin_rows:
            scores = [row['score'] for row in checkin_rows]
            st.write("Weekly stress recovery indicator:")
            st.bar_chart(scores)
            
        st.markdown("### Weekly Triggers & Habits")
        st.markdown("""
        <div class="card">
            <strong>Trigger:</strong> Role ambiguity shows up in 4 of 7 entries.
        </div>
        <div class="card">
            <strong>Best intervention:</strong> Short breathing resets had the highest completion this week.
        </div>
        <div class="card">
            <strong>Protective habit:</strong> A two-line journal note after hard calls lowers next-check-in intensity.
        </div>
        """, unsafe_allow_html=True)

    elif view_selection == "Settings":
        st.markdown("### Settings")
        
        st.toggle("Dark Mode (Softer late-night reading)", value=False)
        st.toggle("Gentle reminders (Only when stress is rising)", value=True)
        
        st.markdown("""
        <div class="card">
            <strong>Privacy language:</strong>
            <p style="font-size:12px; margin-top:4px; color:#6f6b64;">No names in posts. Patterns are shown in aggregate. The tone is built to feel safe, corporate, and warm at the same time.</p>
        </div>
        """, unsafe_allow_html=True)
