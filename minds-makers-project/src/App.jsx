import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   MINDS MAKERS — Task & Team Control Room (React + Supabase)

   SETUP (do this before deploying):
   1. Create a free project at https://supabase.com
   2. Open the SQL Editor and run the contents of `schema.sql`
      (shipped alongside this file) once.
   3. Go to Project Settings → API and copy the "Project URL"
      and the "anon public" key into the two constants below.
   4. (Recommended for quick internal testing) Under
      Authentication → Providers → Email, you can turn OFF
      "Confirm email" so new teammates can sign in immediately.
      Leave it ON if you want real email verification.
   ============================================================ */

const SUPABASE_URL = "https://ltzkgbjfbtavmqucoeip.supabase.co"; // e.g. https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0emtnYmpmYnRhdm1xdWNvZWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzMzNjMsImV4cCI6MjEwMDc0OTM2M30.7DJr58QRJ6SSPCl2OVpZ8RQaPWoCpGtPeRacEAIZ0sQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CSS = `
:root{
  --void:#04060B; --deep:#0A1120; --panel:#0F1830; --panel-2:#131E3A; --elevated:#182747;
  --line:#1D2B4D; --blue-deep:#16244A; --blue-royal:#2B5FE2; --blue-royal-dim:#1C3E9E;
  --blue-sky:#5EC8FF; --electric:#00E1FF; --text:#EAF1FB; --muted:#7C8BA8; --muted-2:#4E5D80;
  --danger:#FF5C7A; --danger-dim:#3A1826; --ok:#33E0A0; --radius:10px; --radius-lg:16px;
}
.mm-root *{box-sizing:border-box;}
.mm-root{background:var(--void); color:var(--text); font-family:'Inter',sans-serif; min-height:100vh; position:relative; overflow-x:hidden;}
.mm-display{font-family:'Space Grotesk',sans-serif;}
.mm-mono{font-family:'JetBrains Mono',monospace;}
.mm-root a{color:inherit; text-decoration:none;}
.mm-root button{font-family:inherit; cursor:pointer;}
.mm-root input,.mm-root select,.mm-root textarea{font-family:inherit;}
.bg-grid{position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:linear-gradient(rgba(43,95,226,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(43,95,226,0.06) 1px, transparent 1px);
  background-size:48px 48px; mask-image:radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);}
#auth-screen{position:relative; z-index:1; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;}
.auth-wrap{width:100%; max-width:960px; display:grid; grid-template-columns:1.1fr 1fr; background:var(--panel); border:1px solid var(--line); border-radius:var(--radius-lg); overflow:hidden; box-shadow:0 40px 100px -20px rgba(0,0,0,0.6);}
.auth-side{padding:56px 44px; background:radial-gradient(circle at 20% 20%, rgba(0,225,255,0.10), transparent 55%), linear-gradient(160deg, var(--blue-deep), var(--deep) 70%); position:relative; display:flex; flex-direction:column; justify-content:space-between; border-right:1px solid var(--line);}
.brand-mark{display:flex; align-items:center; gap:10px;}
.brand-dot{width:12px; height:12px; border-radius:3px; background:var(--electric); box-shadow:0 0 16px 2px rgba(0,225,255,0.7);}
.brand-name{font-size:15px; letter-spacing:0.06em; color:var(--muted); text-transform:uppercase;}
.auth-side h1{font-size:34px; line-height:1.15; margin-top:40px; font-weight:600;}
.auth-side p{color:var(--muted); margin-top:16px; font-size:14.5px; line-height:1.6; max-width:34ch;}
.auth-pulse{display:flex; gap:6px; margin-top:44px;}
.pulse-bar{width:4px; background:var(--blue-royal); border-radius:2px; animation:pulse 1.6s ease-in-out infinite;}
.pulse-bar:nth-child(1){height:14px; animation-delay:0s;} .pulse-bar:nth-child(2){height:26px; animation-delay:.15s; background:var(--blue-sky);}
.pulse-bar:nth-child(3){height:18px; animation-delay:.3s;} .pulse-bar:nth-child(4){height:32px; animation-delay:.45s; background:var(--electric);}
.pulse-bar:nth-child(5){height:10px; animation-delay:.6s;}
@keyframes pulse{0%,100%{transform:scaleY(0.5); opacity:.6;} 50%{transform:scaleY(1); opacity:1;}}
.auth-form-side{padding:56px 44px; display:flex; flex-direction:column; justify-content:center;}
.auth-tabs{display:flex; gap:4px; margin-bottom:32px; background:var(--deep); padding:4px; border-radius:8px; border:1px solid var(--line);}
.auth-tab{flex:1; text-align:center; padding:9px 0; border-radius:6px; font-size:13.5px; color:var(--muted); font-weight:500; transition:.15s;}
.auth-tab.active{background:var(--elevated); color:var(--text);}
.field{margin-bottom:16px;}
.field label{display:block; font-size:12.5px; color:var(--muted); margin-bottom:6px; letter-spacing:0.02em;}
.field input,.field select{width:100%; padding:11px 13px; background:var(--deep); border:1px solid var(--line); border-radius:8px; color:var(--text); font-size:14px; outline:none; transition:.15s;}
.field textarea{width:100%; padding:11px 13px; background:var(--deep); border:1px solid var(--line); border-radius:8px; color:var(--text); font-size:13.5px; resize:vertical; min-height:70px; outline:none;}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--blue-royal); box-shadow:0 0 0 3px rgba(43,95,226,0.2);}
.btn{border:none; border-radius:8px; padding:12px 18px; font-size:14px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:.15s;}
.btn-primary{background:var(--blue-royal); color:#fff;} .btn-primary:hover{background:#3568f0;}
.btn-electric{background:var(--electric); color:#00181D;} .btn-electric:hover{filter:brightness(1.08);}
.btn-ghost{background:transparent; border:1px solid var(--line); color:var(--text);} .btn-ghost:hover{border-color:var(--blue-royal); background:rgba(43,95,226,0.08);}
.btn-danger{background:var(--danger-dim); color:var(--danger); border:1px solid rgba(255,92,122,0.3);} .btn-danger:hover{background:rgba(255,92,122,0.18);}
.btn-block{width:100%;} .btn-sm{padding:7px 12px; font-size:12.5px; border-radius:6px;}
.auth-note{margin-top:16px; font-size:12.5px; color:var(--muted-2); line-height:1.6;} .auth-note b{color:var(--blue-sky);}
.err-msg{color:var(--danger); font-size:12.5px; margin-top:10px; min-height:16px;}
.first-badge{display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:20px; background:rgba(0,225,255,0.12); border:1px solid rgba(0,225,255,0.35); color:var(--electric); font-size:11.5px; font-weight:600; letter-spacing:0.03em; margin-bottom:18px;}
#app-shell{display:grid; grid-template-columns:240px 1fr; min-height:100vh; position:relative; z-index:1;}
.sidebar{background:var(--panel); border-right:1px solid var(--line); padding:22px 16px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh;}
.sb-brand{display:flex; align-items:center; gap:9px; padding:0 8px 22px 8px; border-bottom:1px solid var(--line); margin-bottom:16px;}
.sb-brand .brand-dot{width:10px; height:10px;} .sb-brand span{font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:15.5px;}
.sb-nav{display:flex; flex-direction:column; gap:2px; flex:1;}
.sb-link{display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:8px; color:var(--muted); font-size:13.5px; font-weight:500; transition:.15s;}
.sb-link svg{width:17px; height:17px; opacity:.8; flex-shrink:0;}
.sb-link:hover{background:var(--elevated); color:var(--text);}
.sb-link.active{background:linear-gradient(90deg, rgba(43,95,226,0.22), rgba(43,95,226,0.05)); color:var(--text); box-shadow:inset 2px 0 0 var(--blue-royal);}
.sb-link.control{color:var(--electric);} .sb-link.control svg{opacity:1;}
.sb-link.control.active{background:linear-gradient(90deg, rgba(0,225,255,0.16), rgba(0,225,255,0.02)); box-shadow:inset 2px 0 0 var(--electric);}
.sb-divider{height:1px; background:var(--line); margin:12px 4px;}
.sb-foot{padding:12px 8px 0 8px; border-top:1px solid var(--line);}
.sb-user{display:flex; align-items:center; gap:10px; margin-bottom:10px;}
.avatar{width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0;}
.sb-user-name{font-size:13px; font-weight:600;} .sb-user-role{font-size:11px; color:var(--muted);}
.main{padding:26px 34px 60px 34px; max-width:1400px;}
.topbar{display:flex; align-items:center; justify-content:space-between; margin-bottom:26px; gap:16px; flex-wrap:wrap;}
.page-title{font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:600;}
.page-sub{color:var(--muted); font-size:13px; margin-top:4px;}
.pill{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:0.02em;}
.pill-owner{background:rgba(0,225,255,0.12); color:var(--electric); border:1px solid rgba(0,225,255,0.3);}
.pill-admin{background:rgba(94,200,255,0.12); color:var(--blue-sky); border:1px solid rgba(94,200,255,0.3);}
.pill-member{background:var(--elevated); color:var(--muted); border:1px solid var(--line);}
.pill-active{background:rgba(51,224,160,0.12); color:var(--ok); border:1px solid rgba(51,224,160,0.3);}
.pill-inactive{background:var(--danger-dim); color:var(--danger); border:1px solid rgba(255,92,122,0.3);}
.grid-4{display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px;}
.stat-card{background:var(--panel); border:1px solid var(--line); border-radius:var(--radius-lg); padding:20px; position:relative; overflow:hidden;}
.stat-card .label{color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:0.05em;}
.stat-card .value{font-family:'Space Grotesk',sans-serif; font-size:32px; font-weight:700; margin-top:8px;}
.stat-card .value.accent{color:var(--electric);} .stat-card .value.warn{color:var(--danger);}
.stat-card .sub{font-size:11.5px; color:var(--muted-2); margin-top:4px;}
.panel{background:var(--panel); border:1px solid var(--line); border-radius:var(--radius-lg); padding:20px;}
.panel-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; gap:10px; flex-wrap:wrap;}
.panel-head h3{font-family:'Space Grotesk',sans-serif; font-size:15.5px; font-weight:600;}
.two-col{display:grid; grid-template-columns:1.4fr 1fr; gap:16px;}
.activity-item{display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--line); font-size:13px; align-items:flex-start;}
.activity-item:last-child{border-bottom:none;}
.activity-dot{width:7px; height:7px; border-radius:50%; background:var(--blue-royal); margin-top:5px; flex-shrink:0;}
.activity-time{color:var(--muted-2); font-size:11px;}
.board-cols{display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:14px;}
.col{background:var(--panel); border:1px solid var(--line); border-radius:var(--radius-lg); padding:14px; min-height:200px;}
.col-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding:0 2px;}
.col-title{font-size:12.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--muted);}
.col-count{font-size:11px; color:var(--muted-2); background:var(--deep); padding:2px 7px; border-radius:10px;}
.col-drop{min-height:60px; display:flex; flex-direction:column; gap:10px;}
.col.dragover{outline:2px dashed var(--blue-royal); outline-offset:-4px; background:rgba(43,95,226,0.05);}
.card{background:var(--panel-2); border:1px solid var(--line); border-radius:10px; padding:13px; cursor:grab; transition:.15s;}
.card:hover{border-color:var(--blue-royal); transform:translateY(-1px);}
.card.dragging{opacity:0.4;}
.card-top{display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px;}
.card-title{font-size:13.5px; font-weight:600; line-height:1.35;}
.badge{font-size:10px; font-weight:700; padding:3px 7px; border-radius:5px; letter-spacing:0.03em; white-space:nowrap;}
.badge-low{background:rgba(124,139,168,0.15); color:var(--muted);}
.badge-medium{background:rgba(94,200,255,0.15); color:var(--blue-sky);}
.badge-high{background:rgba(0,225,255,0.15); color:var(--electric);}
.badge-urgent{background:rgba(255,92,122,0.15); color:var(--danger);}
.card-meta{display:flex; align-items:center; justify-content:space-between; margin-top:10px;}
.card-due{font-size:11px; color:var(--muted-2);} .card-due.overdue{color:var(--danger); font-weight:600;}
.progress-track{height:5px; background:var(--deep); border-radius:4px; overflow:hidden; margin-top:10px;}
.progress-fill{height:100%; background:linear-gradient(90deg, var(--blue-royal), var(--electric)); border-radius:4px;}
.mini-avatar{width:22px; height:22px; border-radius:6px; font-size:10px;}
.add-task-btn{width:100%; padding:9px; border:1px dashed var(--line); background:transparent; color:var(--muted); border-radius:8px; font-size:12.5px; margin-top:6px;}
.add-task-btn:hover{border-color:var(--blue-royal); color:var(--blue-sky);}
.team-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:16px;}
.team-card{background:var(--panel); border:1px solid var(--line); border-radius:var(--radius-lg); padding:18px; text-align:center; position:relative;}
.team-card .avatar{width:56px; height:56px; font-size:19px; border-radius:14px; margin:0 auto 12px auto;}
.team-card h4{font-size:14.5px; font-weight:600;} .team-card .role-title{font-size:12px; color:var(--muted); margin-top:2px;}
.team-card .counts{display:flex; justify-content:center; gap:16px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line);}
.tcount{text-align:center;} .tcount b{display:block; font-family:'Space Grotesk',sans-serif; font-size:17px;} .tcount span{font-size:10px; color:var(--muted-2); text-transform:uppercase;}
.inactive-badge{position:absolute; top:10px; right:10px; font-size:9.5px; background:var(--danger-dim); color:var(--danger); padding:2px 7px; border-radius:10px;}
.bar-row{display:flex; align-items:center; gap:12px; margin-bottom:14px;}
.bar-label{width:110px; font-size:12.5px; color:var(--muted); flex-shrink:0;}
.bar-track{flex:1; height:10px; background:var(--deep); border-radius:6px; overflow:hidden;}
.bar-fill{height:100%; border-radius:6px;}
.bar-val{width:34px; text-align:right; font-size:12px; color:var(--muted-2); font-family:'JetBrains Mono',monospace;}
.donut-wrap{display:flex; align-items:center; gap:22px;}
.control-banner{border:1px solid rgba(0,225,255,0.3); border-radius:var(--radius-lg); padding:18px 22px; margin-bottom:24px;
  background:repeating-linear-gradient(115deg, rgba(0,225,255,0.05) 0px, rgba(0,225,255,0.05) 1px, transparent 1px, transparent 26px), linear-gradient(120deg, rgba(0,225,255,0.09), rgba(43,95,226,0.04) 60%, transparent);
  display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; flex-wrap:wrap; gap:12px;}
.control-banner::after{content:''; position:absolute; top:0; left:-40%; width:40%; height:100%; background:linear-gradient(90deg, transparent, rgba(0,225,255,0.08), transparent); animation:sweep 4.5s linear infinite;}
@keyframes sweep{0%{left:-40%;} 100%{left:120%;}}
.control-banner h2{font-family:'Space Grotesk',sans-serif; font-size:18px; display:flex; align-items:center; gap:9px;}
.control-banner p{color:var(--muted); font-size:12.5px; margin-top:4px;}
.live-dot{width:8px; height:8px; border-radius:50%; background:var(--electric); box-shadow:0 0 10px 2px rgba(0,225,255,0.7); animation:blink 1.4s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1;} 50%{opacity:.35;}}
.tabs-row{display:flex; gap:6px; margin-bottom:20px; border-bottom:1px solid var(--line); flex-wrap:wrap;}
.tab-btn{padding:10px 16px; font-size:13px; color:var(--muted); font-weight:500; border-bottom:2px solid transparent; margin-bottom:-1px; background:none; border-top:none; border-left:none; border-right:none;}
.tab-btn.active{color:var(--text); border-bottom-color:var(--electric);}
table{width:100%; border-collapse:collapse;}
th{text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted); padding:9px 10px; border-bottom:1px solid var(--line);}
td{padding:11px 10px; font-size:13px; border-bottom:1px solid var(--line);}
tr:last-child td{border-bottom:none;}
select.inline-select{background:var(--deep); color:var(--text); border:1px solid var(--line); border-radius:6px; padding:6px 8px; font-size:12.5px;}
.row-flex{display:flex; align-items:center; gap:8px;}
.danger-zone{border:1px solid rgba(255,92,122,0.3); border-radius:var(--radius-lg); padding:20px; margin-top:24px; background:rgba(255,92,122,0.03);}
.danger-zone h4{color:var(--danger); font-size:14px; margin-bottom:6px;} .danger-zone p{font-size:12.5px; color:var(--muted); margin-bottom:14px;}
.modal-backdrop{position:fixed; inset:0; background:rgba(2,4,10,0.72); backdrop-filter:blur(3px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;}
.modal{background:var(--panel-2); border:1px solid var(--line); border-radius:var(--radius-lg); width:100%; max-width:480px; padding:26px; max-height:88vh; overflow-y:auto; position:relative;}
.modal h3{font-family:'Space Grotesk',sans-serif; font-size:17px; margin-bottom:18px;}
.field-row{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.modal-actions{display:flex; gap:10px; margin-top:20px;}
.close-x{position:absolute; top:16px; right:16px; color:var(--muted); font-size:18px; background:none; border:none;}
.toast-wrap{position:fixed; bottom:24px; right:24px; z-index:200; display:flex; flex-direction:column; gap:10px;}
.toast{background:var(--elevated); border:1px solid var(--line); border-left:3px solid var(--electric); padding:12px 16px; border-radius:8px; font-size:13px; box-shadow:0 10px 30px rgba(0,0,0,0.4); animation:slidein .2s ease;}
@keyframes slidein{from{transform:translateX(20px); opacity:0;} to{transform:translateX(0); opacity:1;}}
.empty-state{text-align:center; padding:40px 20px; color:var(--muted);}
@media (max-width: 980px){
  .auth-wrap{grid-template-columns:1fr;} .auth-side{display:none;}
  .grid-4{grid-template-columns:repeat(2,1fr);} .board-cols{grid-template-columns:1fr;} .two-col{grid-template-columns:1fr;}
  #app-shell{grid-template-columns:1fr;}
  .sidebar{position:relative; height:auto; flex-direction:row; flex-wrap:wrap; align-items:center;}
  .sb-nav{flex-direction:row; flex-wrap:wrap;} .sb-foot{display:none;} .main{padding:20px;}
}
`;

/* ============ constants & helpers ============ */
const AVATAR_COLORS = ["#2B5FE2","#00A6C4","#5A4FCF","#1C7ED6","#0B7A75","#3B5BDB","#0E9F8E"];
const COLUMNS = [
  { k: "backlog", label: "Backlog" },
  { k: "progress", label: "In Progress" },
  { k: "review", label: "In Review" },
  { k: "done", label: "Done" },
];
function colorFor(str) { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }
function initials(name) { return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function isOverdue(dueDate, status) { if (!dueDate || status === "done") return false; return new Date(dueDate + "T23:59:59") < new Date(); }
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
function statusColor(s) { return { backlog: "#7C8BA8", progress: "#5EC8FF", review: "#2B5FE2", done: "#00E1FF" }[s] || "#7C8BA8"; }
function isAdminLike(u) { return u && (u.role === "owner" || u.role === "admin"); }

/* ---- map Supabase rows (snake_case) to the shapes the UI expects ---- */
function mapProfile(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, title: row.title, active: row.active, color: row.color, createdAt: new Date(row.created_at).getTime() };
}
function mapTask(row) {
  return { id: row.id, title: row.title, description: row.description || "", assigneeId: row.assignee_id, status: row.status, priority: row.priority, dueDate: row.due_date, progress: row.progress, creatorId: row.creator_id, createdAt: new Date(row.created_at).getTime() };
}
function mapActivity(row) {
  return { id: row.id, text: row.text, ts: new Date(row.ts).getTime() };
}

const DEFAULT_CONTENT = {
  authHeadlineFirst: "Set up the\nControl Room.",
  authSubFirst: "You're creating the very first Minds Makers account. It automatically becomes the Owner — the only account with full control over the entire workspace.",
  authHeadline: "Run the team.\nShip the work.",
  authSub: "One workspace for tasks, people, and progress — built for a team that moves fast.",
  authTagline: "Task board · Team directory · Live reports",
  dashboardSub: "Here's what's moving across {company} today.",
  controlBannerSub: "Full oversight for {company} — accounts, tasks, and site content live here.",
};

function RoleLabel({ role }) {
  if (role === "owner") return <span className="pill pill-owner">⚡ Owner</span>;
  if (role === "admin") return <span className="pill pill-admin">Admin</span>;
  return <span className="pill pill-member">Member</span>;
}
function PriorityBadge({ p }) {
  return <span className={"badge badge-" + p}>{p.toUpperCase()}</span>;
}
function EmptyState({ children }) { return <div className="empty-state">{children}</div>; }

/* ============ icons ============ */
const Icon = {
  dashboard: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>),
  tasks: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12l2 2 4-4" /></svg>),
  team: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17.5" cy="8.5" r="2.4" /><path d="M15.8 14.2c2.8.3 5.2 2.4 5.2 5.8" /></svg>),
  reports: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>),
  control: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l7 3.5v5c0 5-3.2 8.5-7 10.5-3.8-2-7-5.5-7-10.5v-5L12 2z" /><path d="M9.5 12l1.8 1.8L15 10" /></svg>),
};

/* ============================================================
   MAIN APP
   ============================================================ */
export default function MindsMakersApp() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(null); // row from `profiles` for the signed-in user
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [view, setView] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("users");
  const [companyName, setCompanyName] = useState("Minds Makers");
  const [siteContent, setSiteContent] = useState(DEFAULT_CONTENT);
  const [authMode, setAuthMode] = useState("login");
  const [authErr, setAuthErr] = useState("");
  const [isFirstAccount, setIsFirstAccount] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // {type:'task'|'invite', payload}
  const [draggingId, setDraggingId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const currentUser = profile;

  function pushToast(msg) {
    const id = uid("toast");
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }
  async function logActivity(text) {
    await supabase.from("activity").insert({ text });
  }

  /* ---------- auth session bootstrap ---------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // before anyone is signed in, check (via a security-definer RPC) whether the
  // workspace has zero accounts yet, so the sign-up screen can say "you'll become Owner".
  useEffect(() => {
    if (session === null) {
      supabase.rpc("is_workspace_empty").then(({ data }) => setIsFirstAccount(!!data)).catch(() => setIsFirstAccount(false));
    }
  }, [session]);

  /* ---------- load profile + all workspace data once signed in, then stay live ---------- */
  async function loadAll() {
    const [{ data: profs }, { data: tks }, { data: acts }, { data: settingsRows }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at"),
      supabase.from("activity").select("*").order("ts", { ascending: false }).limit(60),
      supabase.from("settings").select("*").eq("key", "app"),
    ]);
    setUsers((profs || []).map(mapProfile));
    setTasks((tks || []).map(mapTask));
    setActivity((acts || []).map(mapActivity));
    if (settingsRows && settingsRows[0] && settingsRows[0].value) {
      const v = settingsRows[0].value;
      if (v.companyName) setCompanyName(v.companyName);
      if (v.siteContent) setSiteContent({ ...DEFAULT_CONTENT, ...v.siteContent });
    }
    setDataLoading(false);
  }

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const { data: me } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!cancelled && me) setProfile(mapProfile(me));
    })();
    loadAll();
    const channel = supabase
      .channel("workspace-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, loadAll)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [session]);

  /* ---------- auth actions ---------- */
  async function handleSignup({ name, email, pass }) {
    setAuthErr("");
    const { error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password: pass, options: { data: { name } } });
    if (error) { setAuthErr(error.message); return; }
    pushToast("Account created! If email confirmation is enabled, check your inbox before logging in.");
  }
  async function handleLogin({ email, pass }) {
    setAuthErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
    if (error) { setAuthErr(error.message); return; }
  }
  async function logout() {
    if (currentUser) await logActivity(`${currentUser.name} logged out.`);
    await supabase.auth.signOut();
    setProfile(null);
    setAuthMode("login");
  }

  /* ---------- tasks ---------- */
  async function saveTask(taskId, data) {
    const row = { title: data.title, description: data.description, assignee_id: data.assigneeId, status: data.status, priority: data.priority, due_date: data.dueDate || null, progress: data.progress };
    if (taskId) {
      await supabase.from("tasks").update(row).eq("id", taskId);
      await logActivity(`${currentUser.name} updated "${data.title}".`);
      pushToast("Task updated.");
    } else {
      await supabase.from("tasks").insert({ ...row, creator_id: currentUser.id });
      await logActivity(`${currentUser.name} created "${data.title}".`);
      pushToast("Task created.");
    }
    setModal(null);
  }
  async function deleteTask(taskId) {
    const t = tasks.find((x) => x.id === taskId);
    await supabase.from("tasks").delete().eq("id", taskId);
    await logActivity(`${currentUser.name} deleted "${t.title}".`);
    pushToast("Task deleted.");
    setModal(null);
  }
  async function moveTask(taskId, newStatus) {
    const t = tasks.find((x) => x.id === taskId);
    if (!t || t.status === newStatus) return;
    await supabase.from("tasks").update({ status: newStatus, progress: newStatus === "done" ? 100 : t.progress }).eq("id", taskId);
    await logActivity(`${currentUser.name} moved "${t.title}" to ${COLUMNS.find((c) => c.k === newStatus).label}.`);
  }

  /* ---------- team / users ---------- */
  async function changeRole(userId, newRole) {
    const m = users.find((x) => x.id === userId);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (error) { pushToast(error.message); return; }
    await logActivity(`${currentUser.name} set ${m.name}'s role to ${newRole}.`);
    pushToast(`${m.name} is now ${newRole === "admin" ? "an Admin" : "a Member"}.`);
  }
  async function toggleActive(userId) {
    const m = users.find((x) => x.id === userId);
    const { error } = await supabase.from("profiles").update({ active: !m.active }).eq("id", userId);
    if (error) { pushToast(error.message); return; }
    await logActivity(`${currentUser.name} ${!m.active ? "reactivated" : "deactivated"} ${m.name}'s account.`);
    pushToast(`${m.name}'s account ${!m.active ? "reactivated" : "deactivated"}.`);
  }
  async function resetWorkspace() {
    if (!window.confirm("This will permanently clear all tasks and activity, and deactivate every non-owner account. Continue?")) return;
    await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("profiles").update({ active: false }).neq("role", "owner");
    await supabase.from("activity").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await logActivity(`${currentUser.name} reset the workspace.`);
    pushToast("Workspace has been reset.");
  }
  async function saveCompanyName(val) {
    if (!val.trim()) return;
    await supabase.from("settings").upsert({ key: "app", value: { companyName: val.trim(), siteContent } });
    await logActivity(`${currentUser.name} renamed the workspace to "${val.trim()}".`);
    pushToast("Settings saved.");
  }
  async function saveSiteContent(next) {
    await supabase.from("settings").upsert({ key: "app", value: { companyName, siteContent: next } });
    await logActivity(`${currentUser.name} updated the site content.`);
    pushToast("Site content saved — it now shows across the app.");
  }

  /* ============ RENDER: LOADING ============ */
  if (session === undefined) {
    return (
      <div className="mm-root">
        <style>{CSS}</style>
        <div className="bg-grid"></div>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", position: "relative", zIndex: 1 }}>Connecting to workspace…</div>
      </div>
    );
  }

  /* ============ RENDER: signed in but profile still loading ============ */
  if (session && !currentUser) {
    return (
      <div className="mm-root">
        <style>{CSS}</style>
        <div className="bg-grid"></div>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", position: "relative", zIndex: 1 }}>Loading your workspace…</div>
      </div>
    );
  }

  /* ============ RENDER: AUTH ============ */
  if (!session) {
    const isFirst = isFirstAccount;
    return (
      <div className="mm-root">
        <style>{CSS}</style>
        <div className="bg-grid"></div>
        <div id="auth-screen">
          <div className="auth-wrap">
            <div className="auth-side">
              <div>
                <div className="brand-mark"><div className="brand-dot"></div><span className="brand-name">Minds Makers</span></div>
                <h1>{(isFirst ? siteContent.authHeadlineFirst : siteContent.authHeadline).split("\n").map((line, i) => (<React.Fragment key={i}>{line}<br /></React.Fragment>))}</h1>
                <p>{isFirst ? siteContent.authSubFirst : siteContent.authSub}</p>
              </div>
              <div>
                <div className="auth-pulse"><div className="pulse-bar"></div><div className="pulse-bar"></div><div className="pulse-bar"></div><div className="pulse-bar"></div><div className="pulse-bar"></div></div>
                <p style={{ marginTop: 14, fontSize: 11.5, color: "var(--muted-2)" }}>{siteContent.authTagline}</p>
              </div>
            </div>
            <div className="auth-form-side">
              {isFirst ? (
                <SignupForm isFirst onSubmit={handleSignup} err={authErr} />
              ) : (
                <>
                  <div className="auth-tabs">
                    <div className={"auth-tab " + (authMode === "login" ? "active" : "")} onClick={() => { setAuthMode("login"); setAuthErr(""); }}>Log in</div>
                    <div className={"auth-tab " + (authMode === "signup" ? "active" : "")} onClick={() => { setAuthMode("signup"); setAuthErr(""); }}>Create account</div>
                  </div>
                  {authMode === "login" ? <LoginForm onSubmit={handleLogin} err={authErr} /> : <SignupForm onSubmit={handleSignup} err={authErr} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============ RENDER: APP SHELL ============ */
  const navItems = [
    { k: "dashboard", label: "Dashboard" },
    { k: "tasks", label: "Task Board" },
    { k: "team", label: "Team" },
    { k: "reports", label: "Reports" },
  ];

  const activeTasks = tasks;
  const myTasks = activeTasks.filter((t) => t.assigneeId === currentUser.id);
  const totalTasks = activeTasks.length;
  const inProgressCount = activeTasks.filter((t) => t.status === "progress").length;
  const doneCount = activeTasks.filter((t) => t.status === "done").length;
  const overdueCount = activeTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="mm-root">
      <style>{CSS}</style>
      <div className="bg-grid"></div>
      <div id="app-shell">
        <div className="sidebar">
          <div className="sb-brand"><div className="brand-dot"></div><span className="mm-display">Minds Makers</span></div>
          <div className="sb-nav">
            {navItems.map((it) => (
              <a key={it.k} className={"sb-link " + (view === it.k ? "active" : "")} onClick={() => setView(it.k)}>
                {Icon[it.k]()}<span>{it.label}</span>
              </a>
            ))}
            {isAdminLike(currentUser) && (
              <>
                <div className="sb-divider"></div>
                <a className={"sb-link control " + (view === "admin" ? "active" : "")} onClick={() => setView("admin")}>
                  {Icon.control()}<span>Control Center</span>
                </a>
              </>
            )}
          </div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="avatar" style={{ background: currentUser.color }}>{initials(currentUser.name)}</div>
              <div><div className="sb-user-name">{currentUser.name}</div><div className="sb-user-role"><RoleLabel role={currentUser.role} /></div></div>
            </div>
            <button className="btn btn-ghost btn-block btn-sm" onClick={logout}>Log out</button>
          </div>
        </div>

        <div className="main">
          {view === "dashboard" && (
            <>
              <div className="topbar">
                <div>
                  <div className="page-title">Welcome back, {currentUser.name.split(" ")[0]}</div>
                  <div className="page-sub">{siteContent.dashboardSub.replace("{company}", companyName)}</div>
                </div>
                <RoleLabel role={currentUser.role} />
              </div>
              <div className="grid-4">
                <div className="stat-card"><div className="label">Total Tasks</div><div className="value">{totalTasks}</div><div className="sub">Across the whole workspace</div></div>
                <div className="stat-card"><div className="label">In Progress</div><div className="value">{inProgressCount}</div><div className="sub">Being worked on right now</div></div>
                <div className="stat-card"><div className="label">Completed</div><div className="value accent">{doneCount}</div><div className="sub">Marked as done</div></div>
                <div className="stat-card"><div className="label">Overdue</div><div className={"value " + (overdueCount > 0 ? "warn" : "")}>{overdueCount}</div><div className="sub">Past their due date</div></div>
              </div>
              <div className="two-col">
                <div className="panel">
                  <div className="panel-head"><h3>My tasks</h3><button className="btn btn-ghost btn-sm" onClick={() => setView("tasks")}>Open board →</button></div>
                  {myTasks.length ? myTasks.slice(0, 6).map((t) => (
                    <div className="activity-item" key={t.id}>
                      <div className="activity-dot" style={{ background: statusColor(t.status) }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div className={"card-due " + (isOverdue(t.dueDate, t.status) ? "overdue" : "")} style={{ marginTop: 2 }}>Due {fmtDate(t.dueDate)} · {t.progress}% done</div>
                      </div>
                      <PriorityBadge p={t.priority} />
                    </div>
                  )) : <EmptyState>No tasks assigned to you yet.</EmptyState>}
                </div>
                <div className="panel">
                  <div className="panel-head"><h3>Recent activity</h3></div>
                  {activity.length ? activity.slice(0, 8).map((a) => (
                    <div className="activity-item" key={a.id}><div className="activity-dot"></div><div><div>{a.text}</div><div className="activity-time">{timeAgo(a.ts)}</div></div></div>
                  )) : <EmptyState>No activity yet.</EmptyState>}
                </div>
              </div>
            </>
          )}

          {view === "tasks" && (
            <TasksBoard
              tasks={tasks}
              users={users}
              draggingId={draggingId}
              setDraggingId={setDraggingId}
              moveTask={moveTask}
              openTaskModal={(taskId, presetStatus) => setModal({ type: "task", payload: { taskId, presetStatus } })}
            />
          )}

          {view === "team" && (
            <TeamView
              users={users}
              tasks={tasks}
              currentUser={currentUser}
              openInviteModal={() => setModal({ type: "invite" })}
            />
          )}

          {view === "reports" && <ReportsView users={users} tasks={tasks} />}

          {view === "admin" && isAdminLike(currentUser) && (
            <AdminView
              currentUser={currentUser}
              users={users}
              tasks={tasks}
              activity={activity}
              companyName={companyName}
              siteContent={siteContent}
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              changeRole={changeRole}
              toggleActive={toggleActive}
              resetWorkspace={resetWorkspace}
              saveCompanyName={saveCompanyName}
              saveSiteContent={saveSiteContent}
              openTaskModal={(taskId) => setModal({ type: "task", payload: { taskId } })}
            />
          )}
        </div>
      </div>

      {modal && modal.type === "task" && (
        <TaskModal
          task={tasks.find((t) => t.id === modal.payload.taskId) || null}
          presetStatus={modal.payload.presetStatus}
          users={users}
          currentUser={currentUser}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal.type === "invite" && (
        <InviteModal companyName={companyName} onClose={() => setModal(null)} />
      )}

      <div className="toast-wrap">
        {toasts.map((t) => <div className="toast" key={t.id}>{t.msg}</div>)}
      </div>
    </div>
  );
}

/* ============================================================
   AUTH FORMS
   ============================================================ */
function LoginForm({ onSubmit, err }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, pass }); }}>
      <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mindsmakers.com" /></div>
      <div className="field"><label>Password</label><input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Your password" /></div>
      <div className="err-msg">{err}</div>
      <button className="btn btn-primary btn-block" type="submit">Log in →</button>
      <p className="auth-note">New here? Switch to <b>Create account</b> to join the workspace.</p>
    </form>
  );
}
function SignupForm({ onSubmit, err, isFirst }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email, pass }); }}>
      {isFirst && <div className="first-badge">⚡ First account · becomes Owner</div>}
      <div className="field"><label>Full name</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Youssef Adel" /></div>
      <div className="field"><label>Work email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mindsmakers.com" /></div>
      <div className="field"><label>Password</label><input type="password" required minLength={4} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="At least 4 characters" /></div>
      <div className="err-msg">{err}</div>
      <button className={"btn btn-block " + (isFirst ? "btn-electric" : "btn-primary")} type="submit">{isFirst ? "Create Owner Account →" : "Create account →"}</button>
      {isFirst ? (
        <p className="auth-note">This account gets the <b>Control Center</b> — the only login with full, exclusive control over every user, every task, and the site's own content.</p>
      ) : (
        <p className="auth-note">You'll join as a <b>Member</b>. An owner or admin can promote you later.</p>
      )}
    </form>
  );
}

/* ============================================================
   TASKS BOARD
   ============================================================ */
function TasksBoard({ tasks, users, draggingId, setDraggingId, moveTask, openTaskModal }) {
  const [dragOverCol, setDragOverCol] = useState(null);
  return (
    <>
      <div className="topbar">
        <div><div className="page-title">Task Board</div><div className="page-sub">Drag cards across columns to update status.</div></div>
        <button className="btn btn-primary" onClick={() => openTaskModal(null, "backlog")}>+ New Task</button>
      </div>
      <div className="board-cols">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.k);
          return (
            <div
              key={col.k}
              className={"col " + (dragOverCol === col.k ? "dragover" : "")}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.k); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => { e.preventDefault(); setDragOverCol(null); if (draggingId) moveTask(draggingId, col.k); setDraggingId(null); }}
            >
              <div className="col-head"><span className="col-title">{col.label}</span><span className="col-count">{items.length}</span></div>
              <div className="col-drop">
                {items.map((t) => {
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  return (
                    <div
                      key={t.id}
                      className={"card " + (draggingId === t.id ? "dragging" : "")}
                      draggable
                      onDragStart={() => setDraggingId(t.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => openTaskModal(t.id)}
                    >
                      <div className="card-top"><div className="card-title">{t.title}</div><PriorityBadge p={t.priority} /></div>
                      <div className="card-meta">
                        <div className="row-flex">
                          {assignee ? (<><div className="avatar mini-avatar" style={{ background: assignee.color }}>{initials(assignee.name)}</div><span style={{ fontSize: 11.5, color: "var(--muted)" }}>{assignee.name.split(" ")[0]}</span></>) : (<span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>Unassigned</span>)}
                        </div>
                        <span className={"card-due " + (isOverdue(t.dueDate, t.status) ? "overdue" : "")}>{fmtDate(t.dueDate)}</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: t.progress + "%" }}></div></div>
                    </div>
                  );
                })}
              </div>
              <button className="add-task-btn" onClick={() => openTaskModal(null, col.k)}>+ Add card</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   TASK MODAL
   ============================================================ */
function TaskModal({ task, presetStatus, users, currentUser, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description || "" : "");
  const [assigneeId, setAssigneeId] = useState(task ? task.assigneeId || "" : "");
  const [priority, setPriority] = useState(task ? task.priority : "medium");
  const [status, setStatus] = useState(task ? task.status : presetStatus || "backlog");
  const [dueDate, setDueDate] = useState(task ? task.dueDate || "" : "");
  const [progress, setProgress] = useState(task ? task.progress : 0);
  const canDelete = task && (isAdminLike(currentUser) || task.creatorId === currentUser.id);

  function submit() {
    if (!title.trim()) return;
    onSave(task ? task.id : null, { title: title.trim(), description: description.trim(), assigneeId: assigneeId || null, priority, status, dueDate, progress });
  }
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="close-x" onClick={onClose}>✕</button>
        <h3>{task ? "Edit Task" : "New Task"}</h3>
        <div className="field"><label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design onboarding flow" /></div>
        <div className="field"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." /></div>
        <div className="field-row">
          <div className="field"><label>Assignee</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {COLUMNS.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
            </select>
          </div>
          <div className="field"><label>Due date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Progress: <span>{progress}%</span></label>
          <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value, 10))} style={{ width: "100%" }} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>{task ? "Save changes" : "Create task"}</button>
          {canDelete && <button className="btn btn-danger" onClick={() => onDelete(task.id)}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MEMBER MODAL
   ============================================================ */
/* Real account creation must go through Supabase Auth sign-up (so passwords
   are hashed and never touch our own code) — an admin can't safely create a
   password for someone else from the browser without exposing a secret key.
   Instead, this modal gives them a ready-to-send invite; the teammate signs
   up themselves, and an owner/admin sets their role afterwards. */
function InviteModal({ companyName, onClose }) {
  const link = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  const message = `You're invited to join ${companyName}'s workspace.\n\n1. Go to: ${link}\n2. Click "Create account" and sign up with your work email.\n3. An admin will set your role once you're in.`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="close-x" onClick={onClose}>✕</button>
        <h3>Invite a teammate</h3>
        <p className="auth-note" style={{ marginBottom: 14 }}>For security, new logins are created by each person signing up themselves — share this message and they'll show up here once they join.</p>
        <div className="field"><textarea readOnly value={message} style={{ minHeight: 130 }} /></div>
        <div className="modal-actions">
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => { navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          >
            {copied ? "Copied ✓" : "Copy invite message"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TEAM VIEW
   ============================================================ */
function TeamView({ users, tasks, currentUser, openInviteModal }) {
  return (
    <>
      <div className="topbar">
        <div><div className="page-title">Team</div><div className="page-sub">{users.filter((x) => x.active).length} active members.</div></div>
        {isAdminLike(currentUser) && <button className="btn btn-primary" onClick={openInviteModal}>+ Invite teammate</button>}
      </div>
      <div className="team-grid">
        {users.map((m) => {
          const assigned = tasks.filter((t) => t.assigneeId === m.id).length;
          const completed = tasks.filter((t) => t.assigneeId === m.id && t.status === "done").length;
          return (
            <div className="team-card" key={m.id}>
              {!m.active && <div className="inactive-badge">Inactive</div>}
              <div className="avatar" style={{ background: m.color }}>{initials(m.name)}</div>
              <h4>{m.name}</h4>
              <div className="role-title">{m.title}</div>
              <div style={{ marginTop: 10 }}><RoleLabel role={m.role} /></div>
              <div className="counts">
                <div className="tcount"><b>{assigned}</b><span>Assigned</span></div>
                <div className="tcount"><b>{completed}</b><span>Done</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   REPORTS VIEW
   ============================================================ */
function DonutSvg({ pct }) {
  const r = 34, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#131E3A" strokeWidth="10" />
      <circle cx="45" cy="45" r={r} fill="none" stroke="#00E1FF" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 45 45)" />
    </svg>
  );
}
function ReportsView({ users, tasks }) {
  const counts = { backlog: 0, progress: 0, review: 0, done: 0 };
  tasks.forEach((t) => counts[t.status]++);
  const total = tasks.length || 1;
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status));
  const workload = users.filter((u) => u.active).map((u) => ({ name: u.name, color: u.color, count: tasks.filter((t) => t.assigneeId === u.id && t.status !== "done").length })).sort((a, b) => b.count - a.count);
  const maxLoad = Math.max(1, ...workload.map((w) => w.count));
  const doneRate = Math.round((counts.done / total) * 100);
  return (
    <>
      <div className="topbar"><div><div className="page-title">Reports</div><div className="page-sub">A live read on how work is flowing across the team.</div></div></div>
      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="panel-head"><h3>Tasks by status</h3></div>
          {COLUMNS.map((c) => (
            <div className="bar-row" key={c.k}>
              <div className="bar-label">{c.label}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: (counts[c.k] / total) * 100 + "%", background: statusColor(c.k) }}></div></div>
              <div className="bar-val">{counts[c.k]}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Completion rate</h3></div>
          <div className="donut-wrap">
            <DonutSvg pct={doneRate} />
            <div>
              <div className="mm-display" style={{ fontSize: 28, fontWeight: 700 }}>{doneRate}%</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>of all tasks completed</div>
            </div>
          </div>
        </div>
      </div>
      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><h3>Team workload (open tasks)</h3></div>
          {workload.length ? workload.map((w) => (
            <div className="bar-row" key={w.name}>
              <div className="bar-label">{w.name.split(" ")[0]}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: (w.count / maxLoad) * 100 + "%", background: w.color }}></div></div>
              <div className="bar-val">{w.count}</div>
            </div>
          )) : <EmptyState>No active team members yet.</EmptyState>}
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Overdue tasks</h3></div>
          {overdue.length ? (
            <table><thead><tr><th>Task</th><th>Due</th></tr></thead><tbody>
              {overdue.map((t) => <tr key={t.id}><td>{t.title}</td><td className="card-due overdue">{fmtDate(t.dueDate)}</td></tr>)}
            </tbody></table>
          ) : <EmptyState>Nothing overdue. Nice work.</EmptyState>}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   ADMIN / CONTROL CENTER  (Owner-exclusive tabs marked)
   ============================================================ */
function AdminView({ currentUser, users, tasks, activity, companyName, siteContent, adminTab, setAdminTab, changeRole, toggleActive, resetWorkspace, saveCompanyName, saveSiteContent, openTaskModal }) {
  const isOwner = currentUser.role === "owner";
  const tabs = isOwner
    ? [{ k: "users", label: "User Management" }, { k: "tasks", label: "All Tasks" }, { k: "settings", label: "Site Settings" }, { k: "content", label: "Site Content" }, { k: "log", label: "Activity Log" }]
    : [{ k: "users", label: "User Management" }, { k: "tasks", label: "All Tasks" }, { k: "log", label: "Activity Log" }];
  const activeTab = tabs.some((t) => t.k === adminTab) ? adminTab : "users";

  return (
    <>
      <div className="control-banner">
        <div><h2><span className="live-dot"></span>Control Center</h2><p>{siteContent.controlBannerSub.replace("{company}", companyName)}</p></div>
        <RoleLabel role={currentUser.role} />
      </div>
      <div className="tabs-row">
        {tabs.map((t) => <button key={t.k} className={"tab-btn " + (activeTab === t.k ? "active" : "")} onClick={() => setAdminTab(t.k)}>{t.label}</button>)}
      </div>

      {activeTab === "users" && (
        <>
          <div className="panel">
            <div className="panel-head"><h3>All accounts ({users.length})</h3></div>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {users.map((m) => (
                  <tr key={m.id}>
                    <td><div className="row-flex"><div className="avatar mini-avatar" style={{ background: m.color }}>{initials(m.name)}</div>{m.name}</div></td>
                    <td className="mm-mono" style={{ color: "var(--muted)" }}>{m.email}</td>
                    <td>
                      {isOwner && m.role !== "owner" ? (
                        <select className="inline-select" value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : <RoleLabel role={m.role} />}
                    </td>
                    <td>{m.active ? <span className="pill pill-active">Active</span> : <span className="pill pill-inactive">Inactive</span>}</td>
                    <td className="mm-mono" style={{ color: "var(--muted-2)", fontSize: 11.5 }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>{m.role !== "owner" && <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(m.id)}>{m.active ? "Deactivate" : "Activate"}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isOwner && (
            <div className="danger-zone">
              <h4>Danger zone</h4>
              <p>Wipe all tasks, activity, and team members (except your Owner account) from this session. This cannot be undone.</p>
              <button className="btn btn-danger" onClick={resetWorkspace}>Reset workspace data</button>
            </div>
          )}
        </>
      )}

      {activeTab === "tasks" && (
        <div className="panel">
          <div className="panel-head"><h3>Every task in the workspace ({tasks.length})</h3></div>
          {tasks.length ? (
            <table>
              <thead><tr><th>Task</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Due</th><th>Progress</th><th></th></tr></thead>
              <tbody>
                {tasks.map((t) => {
                  const a = users.find((x) => x.id === t.assigneeId);
                  return (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{a ? a.name : <span style={{ color: "var(--muted-2)" }}>Unassigned</span>}</td>
                      <td>{COLUMNS.find((c) => c.k === t.status).label}</td>
                      <td><PriorityBadge p={t.priority} /></td>
                      <td className={isOverdue(t.dueDate, t.status) ? "card-due overdue" : ""}>{fmtDate(t.dueDate)}</td>
                      <td className="mm-mono">{t.progress}%</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => openTaskModal(t.id)}>Edit</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <EmptyState>No tasks created yet.</EmptyState>}
        </div>
      )}

      {activeTab === "settings" && isOwner && <SiteSettingsPanel companyName={companyName} currentUser={currentUser} onSave={saveCompanyName} />}
      {activeTab === "content" && isOwner && <SiteContentPanel siteContent={siteContent} onSave={saveSiteContent} />}

      {activeTab === "log" && (
        <div className="panel">
          <div className="panel-head"><h3>Full activity log</h3></div>
          {activity.length ? activity.map((a) => (
            <div className="activity-item" key={a.id}><div className="activity-dot"></div><div><div>{a.text}</div><div className="activity-time">{timeAgo(a.ts)}</div></div></div>
          )) : <EmptyState>Nothing logged yet.</EmptyState>}
        </div>
      )}
    </>
  );
}

function SiteSettingsPanel({ companyName, currentUser, onSave }) {
  const [val, setVal] = useState(companyName);
  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <div className="panel-head"><h3>Workspace settings</h3></div>
      <div className="field"><label>Company name</label><input type="text" value={val} onChange={(e) => setVal(e.target.value)} /></div>
      <button className="btn btn-primary" onClick={() => onSave(val)}>Save changes</button>
      <p className="auth-note" style={{ marginTop: 18 }}>Signed in as <b>{currentUser.email}</b> — Owner accounts cannot be demoted or deactivated, and only the Owner can reach Site Settings and Site Content.</p>
    </div>
  );
}

/* Owner-exclusive: edit the actual copy shown across the site (auth screen + banners) */
function SiteContentPanel({ siteContent, onSave }) {
  const [draft, setDraft] = useState(siteContent);
  const fields = [
    { k: "authHeadline", label: "Sign-in headline (returning visitors)" },
    { k: "authSub", label: "Sign-in subtext (returning visitors)" },
    { k: "authHeadlineFirst", label: "Sign-in headline (very first / owner setup)" },
    { k: "authSubFirst", label: "Sign-in subtext (very first / owner setup)" },
    { k: "authTagline", label: "Small tagline under the pulse bars" },
    { k: "dashboardSub", label: "Dashboard subheading (use {company} for the company name)" },
    { k: "controlBannerSub", label: "Control Center banner subtext (use {company} for the company name)" },
  ];
  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <div className="panel-head"><h3>Site content</h3></div>
      <p className="auth-note" style={{ marginBottom: 16 }}>Edit any of the wording shown across the site. Changes apply immediately for everyone.</p>
      {fields.map((f) => (
        <div className="field" key={f.k}>
          <label>{f.label}</label>
          <textarea value={draft[f.k]} onChange={(e) => setDraft({ ...draft, [f.k]: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-electric" onClick={() => onSave(draft)}>Save site content</button>
    </div>
  );
}
