import streamlit as st
import sqlite3
import datetime
import random

# Page Config - Forced Expanded Sidebar Drawer by default
st.set_page_config(
    page_title="AnonyMust — Wellness Dashboard",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS matching the new Dashboard design & forcing Sidebar ALWAYS visible on launch
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
    :root {
      --bg: #f6f8f5;
      --surface: #ffffff;
      --ink: #17231f;
      --muted: #77837d;
      --line: #e6ebe7;
      --mint: #c8efd8;
      --mint2: #e9f8ee;
      --green: #2e805c;
      --dark: #1b3028;
      --amber: #f3c779;
      --lav: #e6def8;
      --coral: #ffd9cf;
    }

    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        background-color: var(--bg);
        color: var(--ink);
    }
    
    /* FORCE STREAMLIT SIDEBAR TO BE ALWAYS EXPANDED AND VISIBLE ON LAUNCH */
    [data-testid="stSidebar"], section[data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid var(--line) !important;
        min-width: 260px !important;
        transform: none !important;
        margin-left: 0 !important;
        visibility: visible !important;
        display: flex !important;
        opacity: 1 !important;
        left: 0 !important;
    }

    /* Hide the collapse/expand toggle controls to keep sidebar permanently visible */
    [data-testid="stSidebarCollapseButton"],
    [data-testid="collapsedControl"],
    [data-testid="stSidebarCollapsedControl"],
    button[aria-label="Collapse sidebar"],
    button[aria-label="Expand sidebar"] {
        display: none !important;
        visibility: hidden !important;
    }

    [data-testid="stSidebarNav"] {
        display: none;
    }

    .brand-header {
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 800;
        font-size: 20px;
        color: var(--ink);
        margin-bottom: 24px;
    }
    .brandmark {
        height: 32px;
        width: 32px;
        border-radius: 10px 10px 10px 3px;
        background: var(--dark);
        display: grid;
        place-items: center;
        color: #d6f7e1;
        font-size: 18px;
    }

    .hero-banner {
        background: var(--dark);
        color: white;
        border-radius: 24px;
        padding: 28px 30px;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
    }
    .hero-banner h2 {
        font-size: 26px;
        font-weight: 800;
        color: white;
        margin: 5px 0 10px;
    }
    .hero-banner p {
        color: #c1d1c8;
        font-size: 14px;
        margin: 0;
        max-width: 540px;
        line-height: 1.5;
    }
    .eyebrow-text {
        font-size: 11px;
        color: #a8d9bb;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .12em;
    }

    .card-box {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(25, 50, 38, .06);
        margin-bottom: 18px;
    }
    .metric-label {
        font-size: 13px;
        color: var(--muted);
        font-weight: 650;
    }
    .metric-val {
        font-size: 28px;
        font-weight: 800;
        margin: 8px 0 4px;
        letter-spacing: -.04em;
    }
    .metric-delta {
        font-size: 12px;
        color: var(--green);
        font-weight: 700;
    }
    .metric-delta.neutral {
        color: var(--muted);
    }

    .post-item {
        display: flex;
        gap: 13px;
        align-items: flex-start;
        padding: 14px 0;
        border-bottom: 1px solid var(--line);
    }
    .post-item:last-child {
        border-bottom: 0;
    }
    .post-icon {
        background: var(--mint2);
        width: 34px;
        height: 34px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        color: var(--green);
        flex-shrink: 0;
    }
    .tag-chip {
        background: var(--mint2);
        color: var(--green);
        padding: 4px 10px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
    }
    .privacy-card {
        background: #f4faf5;
        border: 1px solid #d8eee0;
        border-radius: 14px;
        padding: 15px;
        font-size: 12px;
        color: #557063;
        line-height: 1.45;
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
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                mood TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS community_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                tag TEXT NOT NULL,
                likes INTEGER DEFAULT 0,
                replies INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Seed default items if empty
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM journal_entries")
        if cursor.fetchone()[0] == 0:
            conn.execute("INSERT INTO journal_entries (content, mood, created_at) VALUES ('The presentation went better than I expected. I felt prepared.', 'Calm', datetime('now', '-2 hours'))")
            conn.execute("INSERT INTO journal_entries (content, mood, created_at) VALUES ('Too many meetings today, but a short walk helped me reset.', 'Mixed', datetime('now', '-1 day'))")
            conn.execute("INSERT INTO journal_entries (content, mood, created_at) VALUES ('Started the week feeling focused and energized.', 'Positive', datetime('now', '-6 days'))")
            
        cursor.execute("SELECT COUNT(*) FROM community_posts")
        if cursor.fetchone()[0] == 0:
            conn.execute("INSERT INTO community_posts (content, tag, likes, replies, created_at) VALUES ('I keep saying yes to everything and now I’m exhausted. Does anyone else struggle to pause?', 'Work stress', 18, 4, datetime('now', '-8 minutes'))")
            conn.execute("INSERT INTO community_posts (content, tag, likes, replies, created_at) VALUES ('Took a 10-minute walk between calls. It didn’t fix everything, but it helped.', 'Small win', 31, 6, datetime('now', '-24 minutes'))")
            conn.execute("INSERT INTO community_posts (content, tag, likes, replies, created_at) VALUES ('Reminder: a slow day is still a day. You don’t need to earn rest.', 'Support', 45, 9, datetime('now', '-1 hour'))")
        conn.commit()

init_db()

# Sidebar Brand
st.sidebar.markdown("""
<div class="brand-header">
    <div class="brandmark">✦</div>
    <span>AnonyMust</span>
</div>
""", unsafe_allow_html=True)

nav_page = st.sidebar.radio(
    "Navigation",
    ["◉ Overview", "✎ My journal", "☵ Anonymous feed", "◒ AI insights", "♢ Privacy center"],
    index=0
)

st.sidebar.markdown("""
<br/>
<div class="privacy-card">
    <strong style="color:#2e805c;">Private by design</strong>
    Your identity is never attached to a journal entry. You are in control.
</div>
""", unsafe_allow_html=True)

# Main App Header
current_date_str = datetime.datetime.now().strftime("%A, %B %d")
st.markdown(f"""
<div style="margin-bottom: 20px;">
    <div style="font-size:12px; color:#77837d; font-weight:700; text-transform:uppercase; letter-spacing:.12em;">{current_date_str}</div>
    <h1 style="font-size:30px; letter-spacing:-.03em; margin: 4px 0 0;">Good morning, Anon 👋</h1>
</div>
""", unsafe_allow_html=True)

# NAV 1: OVERVIEW
if nav_page == "◉ Overview":
    st.markdown("""
    <div class="hero-banner">
        <div class="eyebrow-text">Your daily reset</div>
        <h2>How are you feeling today?</h2>
        <p>A small check-in now can help you notice stress before it becomes overwhelming.</p>
    </div>
    """, unsafe_allow_html=True)

    # Metrics Row
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM journal_entries")
        total_entries = cursor.fetchone()[0]

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""
        <div class="card-box">
            <div class="metric-label">Check-in streak</div>
            <div class="metric-val">7 days</div>
            <div class="metric-delta">↑ 2 days this week</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class="card-box">
            <div class="metric-label">Mood this week</div>
            <div class="metric-val">Calmer</div>
            <div class="metric-delta">↑ 12% from last week</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown("""
        <div class="card-box">
            <div class="metric-label">Micro-actions</div>
            <div class="metric-val">12</div>
            <div class="metric-delta">68% completed</div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="card-box">
            <div class="metric-label">Private entries</div>
            <div class="metric-val">{total_entries}</div>
            <div class="metric-delta neutral">Only visible to you</div>
        </div>
        """, unsafe_allow_html=True)

    # Charts and Snapshot Split
    col_chart, col_snapshot = st.columns([1.5, 1])
    with col_chart:
        st.markdown("### Your mood pattern (Last 7 days)")
        st.bar_chart([40, 55, 30, 68, 51, 74, 62], height=210)
    with col_snapshot:
        st.markdown("### Well-being snapshot")
        st.write("• **Regulated**: 64%")
        st.write("• **Elevated**: 22%")
        st.write("• **Needs care**: 14%")
        st.progress(0.64)

    # Recent reflections & Suggestion
    col_ref, col_sugg = st.columns([1.5, 1])
    with col_ref:
        st.markdown("### Recent reflections")
        with get_db() as conn:
            entries = conn.execute("SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT 3").fetchall()
            for entry in entries:
                st.markdown(f"""
                <div class="post-item">
                    <div class="post-icon">✦</div>
                    <div style="flex:1;">
                        <p style="margin:0; font-size:14px;">“{entry['content']}”</p>
                        <small style="color:#77837d;">Private entry</small>
                    </div>
                    <span class="tag-chip">{entry['mood']}</span>
                </div>
                """, unsafe_allow_html=True)

    with col_sugg:
        st.markdown("""
        <div class="card-box" style="background:#e6def8; border:0;">
            <h3 style="margin:0 0 8px;">One gentle suggestion</h3>
            <p style="font-size:13px; color:#5b5572; line-height:1.5;">You’ve had several meeting-heavy days. Try a 5-minute screen-free reset before your next call.</p>
        </div>
        """, unsafe_allow_html=True)

# NAV 2: MY JOURNAL
elif nav_page == "✎ My journal":
    st.markdown("""
    <div class="hero-banner">
        <div class="eyebrow-text">Private journal</div>
        <h2>Make space for what you feel.</h2>
        <p>No judgment, no pressure, and no identity attached. Just an honest moment for you.</p>
    </div>
    """, unsafe_allow_html=True)

    col_input, col_recent = st.columns([1.5, 1])
    with col_input:
        st.markdown("### Daily check-in")
        mood = st.select_slider("How would you describe your energy right now?", options=["Stressed 😣", "Uneasy 😕", "Neutral 😐", "Calm 🙂", "Positive 😊"], value="Neutral 😐")
        journal_text = st.text_area("Want to get anything off your mind?", placeholder="Write freely… your entry stays private.", height=150)
        
        if st.button("Save privately", type="primary"):
            if journal_text.strip():
                mood_clean = mood.split()[0]
                with get_db() as conn:
                    conn.execute("INSERT INTO journal_entries (content, mood) VALUES (?, ?)", (journal_text.strip(), mood_clean))
                    conn.commit()
                st.success("Your reflection was saved privately!")
                st.rerun()
            else:
                st.warning("Write a note to save your check-in.")

    with col_recent:
        st.markdown("### Recent entries")
        with get_db() as conn:
            entries = conn.execute("SELECT * FROM journal_entries ORDER BY created_at DESC").fetchall()
            for entry in entries:
                st.markdown(f"""
                <div class="post-item">
                    <div class="post-icon">✦</div>
                    <div>
                        <p style="margin:0; font-size:14px;">{entry['content']}</p>
                        <small style="color:#77837d;">{entry['mood']}</small>
                    </div>
                </div>
                """, unsafe_allow_html=True)

# NAV 3: ANONYMOUS FEED
elif nav_page == "☵ Anonymous feed":
    st.markdown("""
    <div class="card-box" style="background:#e9f8ee; border-color:#d8eee0;">
        <strong style="color:#2e805c;">Community, without the identity</strong>
        <p style="margin:4px 0 0; color:#557063; font-size:13px;">This feed is ephemeral and AI-moderated. Be kind, avoid identifying details, and remember that peer support is not professional care.</p>
    </div>
    """, unsafe_allow_html=True)

    with st.expander("💬 Share an anonymous rant / support post"):
        new_rant = st.text_area("Write an anonymous message to the community...")
        rant_tag = st.selectbox("Tag", ["Work stress", "Small win", "Support", "General"])
        if st.button("Post Anonymously"):
            if new_rant.strip():
                with get_db() as conn:
                    conn.execute("INSERT INTO community_posts (content, tag) VALUES (?, ?)", (new_rant.strip(), rant_tag))
                    conn.commit()
                st.success("Posted anonymously!")
                st.rerun()

    with get_db() as conn:
        posts = conn.execute("SELECT * FROM community_posts ORDER BY created_at DESC").fetchall()
        for post in posts:
            st.markdown(f"""
            <div class="card-box">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <p style="margin:0 0 8px; font-size:14px; line-height:1.45;">“{post['content']}”</p>
                        <small style="color:#77837d;">Anonymous · {post['likes']} ♡ · {post['replies']} supportive replies</small>
                    </div>
                    <span class="tag-chip">{post['tag']}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

# NAV 4: AI INSIGHTS
elif nav_page == "◒ AI insights":
    st.markdown("""
    <div class="hero-banner">
        <div class="eyebrow-text">AI analysis</div>
        <h2>Patterns, not labels.</h2>
        <p>AnonyMust helps you reflect on signals in your entries. It does not diagnose or replace professional support.</p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Current signal", "Elevated", "Informational")
    c2.metric("Top pattern", "Meetings", "Appeared 6 times")
    c3.metric("Helpful action", "Walk", "4 positive reflections")
    c4.metric("Trend", "Improving", "Across 7 days")

    st.markdown("### What your reflections suggest")
    st.info("✦ Short recovery activities appear to help you move from elevated to regulated.")
    st.info("✦ Workload intensity seems higher on meeting-heavy days.")

# NAV 5: PRIVACY CENTER
elif nav_page == "♢ Privacy center":
    st.markdown("""
    <div class="card-box" style="background: linear-gradient(135deg, #f1fbf4, #ffffff); border-color: #dcefe2;">
        <div class="eyebrow-text" style="color:#2e805c;">Your control center</div>
        <h2 style="font-size:26px; margin:8px 0 6px;">Privacy should feel simple.</h2>
        <p style="color:#77837d; font-size:14px; margin:0;">AnonyMust is designed around anonymity. You decide what stays private, what becomes part of the community, and when you want a reminder.</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Preferences")
    st.toggle("Daily check-in reminder (Every day at 8:30 PM)", value=True)
    st.toggle("Calendar-based nudges (Suggest a reset after meeting-heavy days)", value=True)
    st.toggle("Personalized AI analysis (Use private entries to surface patterns)", value=True)
