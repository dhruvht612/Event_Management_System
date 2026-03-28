require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { migrate, getDb } = require('./init');

migrate();
const db = getDb();

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const adminPass = process.env.SEED_ADMIN_PASSWORD || 'DemoAdmin123!';

const userEmail = process.env.SEED_USER_EMAIL || 'demo@example.com';
const userPass = process.env.SEED_USER_PASSWORD || 'DemoUser123!';

function ensureUser({ email, password, name, organization, role, membershipTier }) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log('User already exists:', email);
    return existing.id;
  }
  const id = uuidv4();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, organization, role, membership_tier)
     VALUES (?,?,?,?,?,?,?)`
  ).run(id, email, bcrypt.hashSync(password, 12), name, organization, role, membershipTier);
  console.log('Seeded user:', email, `(${role})`);
  return id;
}

ensureUser({
  email: adminEmail,
  password: adminPass,
  name: 'Demo Admin',
  organization: 'Event Platform',
  role: 'admin',
  membershipTier: 'vip',
});

ensureUser({
  email: userEmail,
  password: userPass,
  name: 'Demo Student',
  organization: 'State University',
  role: 'attendee',
  membershipTier: 'free',
});

const orgEmail = 'organizer@example.com';
let sampleEventId = null;

if (!db.prepare('SELECT id FROM users WHERE email = ?').get(orgEmail)) {
  const oid = uuidv4();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, organization, role, membership_tier)
     VALUES (?,?,?,?,?,?,?)`
  ).run(
    oid,
    orgEmail,
    bcrypt.hashSync('Organizer123!', 12),
    'Demo Organizer',
    'CS Club',
    'organizer',
    'premium'
  );
  console.log('Seeded organizer:', orgEmail);
  const eid = uuidv4();
  db.prepare(
    `INSERT INTO events (id, title, description, start_at, end_at, location_type, location_text, capacity, organizer_id)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(
    eid,
    'Spring Hackathon 2026',
    '48-hour build sprint with prizes, mentors, and food.',
    new Date(Date.now() + 86400000 * 14).toISOString(),
    new Date(Date.now() + 86400000 * 16).toISOString(),
    'physical',
    'Student Union Hall A',
    120,
    oid
  );
  db.prepare('INSERT INTO event_tags (event_id, tag) VALUES (?,?)').run(eid, 'hackathon');
  db.prepare('INSERT INTO event_tags (event_id, tag) VALUES (?,?)').run(eid, 'tech');
  db.prepare('INSERT OR IGNORE INTO share_events (id, event_id) VALUES (?,?)').run(uuidv4(), eid);
  sampleEventId = eid;
  console.log('Seeded sample event:', eid);
} else {
  const row = db
    .prepare(`SELECT id FROM events WHERE title = ? ORDER BY created_at DESC LIMIT 1`)
    .get('Spring Hackathon 2026');
  if (row) sampleEventId = row.id;
}

const orgId = db.prepare('SELECT id FROM users WHERE email = ?').get(orgEmail)?.id;
if (orgId) {
  const extras = [
    {
      title: 'UI/UX Design Workshop',
      description: 'Hands-on Figma session covering systems, accessibility, and handoff for student projects.',
      days: 7,
      loc: 'virtual',
      place: 'Zoom · link sent after RSVP',
      cap: 40,
      tags: ['workshop', 'design'],
    },
    {
      title: 'Tech Talk: Building with AI',
      description: 'Industry guests on LLMs, safety, and shipping real products in 2026.',
      days: 10,
      loc: 'physical',
      place: 'Innovation Lab, Room 204',
      cap: 200,
      tags: ['tech-talk', 'tech'],
    },
    {
      title: 'Alumni Networking Night',
      description: 'Meet graduates from product, research, and startups. Light refreshments provided.',
      days: 21,
      loc: 'physical',
      place: 'Alumni Center Terrace',
      cap: 80,
      tags: ['networking', 'careers'],
    },
    {
      title: 'Winter Game Jam 2026',
      description: '48-hour build with themes, judges, and prizes for best game feel and narrative.',
      days: 3,
      durationHours: 48,
      loc: 'physical',
      place: 'Game Lab · Engineering Annex',
      cap: 64,
      tags: ['hackathon', 'gaming'],
    },
    {
      title: 'Intro to Rust for Systems',
      description: 'Ownership, borrowing, and building a small CLI — laptops required.',
      days: 4,
      durationHours: 3,
      loc: 'physical',
      place: 'CS Building · Lab 112',
      cap: 35,
      tags: ['workshop', 'tech'],
    },
    {
      title: 'Women in Tech Meetup',
      description: 'Lightning talks, mentorship circles, and pizza. Allies welcome.',
      days: 5,
      loc: 'physical',
      place: 'Student Center · Room 3B',
      cap: 90,
      tags: ['networking', 'tech'],
    },
    {
      title: 'Cybersecurity & Privacy Panel',
      description: 'Campus IT and guest CISOs on threats, MFA, and safe research data.',
      days: 6,
      loc: 'physical',
      place: 'Auditorium B (stream link for remote)',
      cap: 150,
      tags: ['tech-talk', 'tech'],
    },
    {
      title: 'Career Fair: Tech & Engineering',
      description: 'Employer booths, resume reviews, and on-site coffee chats.',
      days: 8,
      durationHours: 5,
      loc: 'physical',
      place: 'Field House Main Floor',
      cap: 500,
      tags: ['networking', 'careers'],
    },
    {
      title: 'React & Server Components',
      description: 'Hands-on Vite + React 19 patterns for student club sites and portfolios.',
      days: 12,
      durationHours: 3,
      loc: 'virtual',
      place: 'Discord stage + screenshare',
      cap: 55,
      tags: ['workshop', 'tech'],
    },
    {
      title: 'Startup Pitch Night',
      description: 'Five-minute pitches, angel feedback, and networking after.',
      days: 15,
      loc: 'physical',
      place: 'Innovation Hub Atrium',
      cap: 120,
      tags: ['networking', 'tech'],
    },
    {
      title: 'Cloud Native Deep Dive',
      description: 'Kubernetes, service meshes, and cost-aware deployments for small teams.',
      days: 18,
      loc: 'physical',
      place: 'Innovation Lab, Room 204',
      cap: 85,
      tags: ['tech-talk', 'tech'],
    },
    {
      title: 'Open Source Contribution Day',
      description: 'Good first issues, maintainers on-site, and CoC-safe collaboration tips.',
      days: 22,
      durationHours: 6,
      loc: 'physical',
      place: 'Library Collaboration Zone',
      cap: 45,
      tags: ['workshop', 'tech'],
    },
    {
      title: 'ML Study Group Kickoff',
      description: 'Syllabus for the semester: notebooks, datasets, and peer accountability.',
      days: 25,
      loc: 'virtual',
      place: 'Zoom · calendar invite after RSVP',
      cap: 70,
      tags: ['workshop', 'tech'],
    },
    {
      title: 'Data Viz with Observable',
      description: 'From CSV to interactive plots — publishable notebooks for reports.',
      days: 29,
      durationHours: 2.5,
      loc: 'physical',
      place: 'Data Studio · North Quad',
      cap: 38,
      tags: ['workshop', 'design'],
    },
    {
      title: 'Debate: Future of CS Education',
      description: 'Faculty vs student panel on AI tooling, exams, and academic integrity.',
      days: 33,
      loc: 'physical',
      place: 'Main Auditorium',
      cap: 300,
      tags: ['tech-talk', 'tech'],
    },
    {
      title: 'Mobile Dev Sprint (iOS/Android)',
      description: 'One-day Flutter workshop with device lab access and TA support.',
      days: 37,
      durationHours: 8,
      loc: 'physical',
      place: 'Mobile Lab · Room 301',
      cap: 28,
      tags: ['workshop', 'tech'],
    },
    {
      title: 'Ethics in AI Student Forum',
      description: 'Open mic + moderated Q&A on bias, consent, and campus use policies.',
      days: 41,
      loc: 'virtual',
      place: 'YouTube live + Ethics Institute watch party',
      cap: 175,
      tags: ['tech-talk', 'tech'],
    },
    {
      title: 'Fall Coding Challenge 2025',
      description: 'Algorithm sprint and team prizes — archived for portfolio links.',
      days: -45,
      durationHours: 4,
      loc: 'physical',
      place: 'CS Building · Atrium',
      cap: 100,
      tags: ['hackathon', 'tech'],
    },
    {
      title: 'Resume & LinkedIn Workshop',
      description: 'ATS tips, bullet rewrites, and peer review stations.',
      days: -22,
      loc: 'virtual',
      place: 'Recorded · link in portal',
      cap: 120,
      tags: ['workshop', 'careers'],
    },
    {
      title: 'Guest Lecture: History of Computing',
      description: 'From Babbage to smartphones — required reading Q&A session.',
      days: -60,
      loc: 'physical',
      place: 'History Hall 101',
      cap: 220,
      tags: ['tech-talk', 'tech'],
    },
  ];
  for (const ex of extras) {
    if (db.prepare('SELECT id FROM events WHERE title = ?').get(ex.title)) continue;
    const eid = uuidv4();
    const durationMs = (ex.durationHours != null ? Number(ex.durationHours) : 2) * 3600000;
    const start = new Date(Date.now() + 86400000 * ex.days).toISOString();
    const end = new Date(Date.now() + 86400000 * ex.days + durationMs).toISOString();
    db.prepare(
      `INSERT INTO events (id, title, description, start_at, end_at, location_type, location_text, capacity, organizer_id)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(
      eid,
      ex.title,
      ex.description,
      start,
      end,
      ex.loc,
      ex.place,
      ex.cap,
      orgId
    );
    for (const t of ex.tags) {
      db.prepare('INSERT INTO event_tags (event_id, tag) VALUES (?,?)').run(eid, t);
    }
    db.prepare('INSERT OR IGNORE INTO share_events (id, event_id) VALUES (?,?)').run(uuidv4(), eid);
    console.log('Seeded event:', ex.title);
  }
}

if (sampleEventId) {
  const demoUserId = db.prepare('SELECT id FROM users WHERE email = ?').get(userEmail)?.id;
  if (demoUserId) {
    const already = db
      .prepare('SELECT id FROM registrations WHERE event_id = ? AND user_id = ?')
      .get(sampleEventId, demoUserId);
    if (!already) {
      const ticketCode = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
      const qrPayload = JSON.stringify({ e: sampleEventId, u: demoUserId, t: ticketCode });
      const rid = uuidv4();
      db.prepare(
        `INSERT INTO registrations (id, event_id, user_id, status, ticket_code, qr_payload)
         VALUES (?,?,?,?,?,?)`
      ).run(rid, sampleEventId, demoUserId, 'confirmed', ticketCode, qrPayload);
      console.log('Registered demo user for sample event');
    }
  }
}

console.log('');
console.log('--- Demo logins (email / password) ---');
console.log('Admin:   ', adminEmail, '/', adminPass);
console.log('Attendee:', userEmail, '/', userPass);
console.log('Organizer (optional):', orgEmail, '/ Organizer123!');
console.log('Done.');
