const $ = (s, root=document) => root.querySelector(s);
const app = $('#app'), modal = $('#modal');
const state = structuredClone(initial);
try { const savedLang = localStorage.getItem('campusline.lang'); if (savedLang === 'zh' || savedLang === 'en') state.lang = savedLang === 'zh' ? 1 : 0; } catch {}
// Bridge the separate fictional payment demo back to this page without changing
// any of its verification stages or transaction-history behavior.
const paymentBridgeKey = 'campusline.pendingDemoPayment.v1';
const paymentHistoryKey = 'misspay.transactions.v1';
function paymentTransactions(){
 try { const entries=JSON.parse(localStorage.getItem(paymentHistoryKey)||'[]'); return Array.isArray(entries)?entries:[]; }
 catch { return []; }
}
function reconcileDemoPayment(){
 let pending;
 try { pending=JSON.parse(sessionStorage.getItem(paymentBridgeKey)||'null'); } catch { return; }
 if(!pending || !Array.isArray(pending.existingIds))return;
 const completed=paymentTransactions().some(entry=>
  entry && entry.status==='success' && entry.amount===85 &&
  typeof entry.id==='string' && !pending.existingIds.includes(entry.id) &&
  typeof entry.createdAt==='string' && Date.parse(entry.createdAt)>=pending.startedAt
 );
 if(!completed)return;
 sessionStorage.removeItem(paymentBridgeKey);
 if(!state.paid){state.paid=true;render();}
}
function beginDemoPayment(){
 try {sessionStorage.setItem(paymentBridgeKey,JSON.stringify({
  startedAt:Date.now(),existingIds:paymentTransactions().map(x=>x?.id).filter(x=>typeof x==='string')
 }));} catch {}
 window.location.href='MISSPAY.html';
}

const breadcrumbTrail=[];
const pendingDismissals=new Map();
const attendanceChallenges=[
 {question:['For an inorder binary-tree traversal, which node is visited first?','对于二叉树的中序遍历，最先访问哪个节点？'],choices:[['Root','根节点'],['Left subtree','左子树'],['Right subtree','右子树']],correct:1},
 {question:['What is the main purpose of a thesis statement in an academic essay?','学术论文中中心论点句的主要作用是什么？'],choices:[['State the central claim','陈述核心论点'],['List references','列出参考文献'],['Give the page count','给出页数']],correct:0},
 {question:['What are the eigenvalues of the diagonal matrix diag(2, 3)?','对角矩阵 diag(2, 3) 的特征值是什么？'],choices:[['5 and 6','5 和 6'],['2 and 3','2 和 3'],['1 and 0','1 和 0']],correct:1}
];
const ui = {page:'search', course:0, tab:'modules', filter:'all', menu:false, thread:null, openModule:null};
const navIcons = {dashboard:'layout-grid',courses:'book-open',assignments:'clipboard-list',grades:'chart-no-axes-column',attendance:'calendar-check',discussion:'messages-square',wellbeing:'heart-handshake',help:'circle-help',payments:'wallet',notifications:'bell'};
const statusText = {present:['Present','出勤'],late:['Late','迟到'],absent:['Absent','缺席'],excused:['Excused','请假'],unrecorded:['Not recorded','尚未记录']};
const people = ['Alex Morgan','Jamie Park','Morgan Lee'];
const crypticCourseCodes=courses.map(()=>"Q"+Math.random().toString(36).slice(2,5).toUpperCase()+"-"+Math.floor(Math.random()*900+100));
const isStaff = () => state.role==='instructor';
const pick = a => a[state.lang];
const esc = s => String(s ?? '').replace(/[&<>"']/g, x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const T = (a,b) => esc(state.lang?b:a);
const D = a => esc(pick(a));
const L = a => D(labels[a]);
const DV = v => esc(Array.isArray(v)?pick(v):v);
const Ic = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const button = (label, action, opts={}) => `<button type="${opts.submit?'submit':'button'}" class="${opts.kind||'btn'}"${action?` data-action="${action}"`:''}${opts.id?` data-testid="${opts.id}"`:action?` data-testid="${action.replace(/:/g,'-')}"`:''}${opts.disabled?' disabled':''}>${opts.left?Ic(opts.left):''}${label}${opts.right?Ic(opts.right):''}</button>`;
const badge = (s,t='')=>`<span class="badge ${t}">${s}</span>`;
const mini = (name,tone='indigo')=>`<span class="mini-icon ${tone}">${Ic(name)}</span>`;
const schoolYear = () => T('Fall 2026','2026 秋季学期');
const name = () => isStaff()?'Dr. Maya Chen':'Alex Morgan';
const avatar = () => isStaff()?'MC':'AM';
const roleLabel = () => isStaff()?T('Instructor','教师'):T('Student','学生');
const unread = () => state.notices.filter(n=>!n.read).length;
const routeLabel = () => ui.page==='search'?T('Destination search','目的地搜索'):ui.page==='course'?D(courses[ui.course].name):ui.page==='thread'?L('discussion'):L(ui.page);
const due = a => state.lang?`11月${a.day}日 · ${a.time}`:`Nov ${a.day} · ${a.time}`;
const activeModule = (i)=>courseModules(i).findIndex((_,j)=>!complete(i,j));
const courseModules = i => [...courses[i].topics.map((topic,j)=>({topic,body:j===courses[i].done?courses[i].lesson:null})),...(state.modules[i]?.added||[])];
const complete = (i,j)=>state.modules[i]?.[j] ?? (j<courses[i].done);
let pendingDestination=null;
const studentDestinations=['dashboard','courses','assignments','grades','attendance','discussion','notifications','wellbeing','help','payments'];
const facultyDestinations=['dashboard','teaching','submissions','class attendance','discussions','notifications','help'];
const destinationWords=studentDestinations;
const activeDestinations=()=>isStaff()?facultyDestinations:studentDestinations;
const facultyRoutes={'dashboard':'dashboard','teaching':'courses','submissions':'assignments','class attendance':'attendance','discussions':'discussion','notifications':'notifications','help':'help'};
const facultyRouteLabels={courses:['Teaching courses','授课课程'],assignments:['Submission review','提交审阅'],attendance:['Class attendance','课堂考勤'],discussion:['Class discussions','课堂讨论'],dashboard:['Faculty dashboard','教师工作台']};
const destLabels={dashboard:['dashboard','总览'],courses:['courses','课程'],assignments:['assignments','作业'],grades:['grades','成绩'],attendance:['attendance','考勤'],discussion:['discussion','讨论区'],notifications:['notifications','通知'],wellbeing:['wellbeing','身心健康'],help:['help','帮助'],payments:['payments','费用支付'],teaching:['teaching','教学'],submissions:['submissions','提交审阅'],'class attendance':['class attendance','课堂考勤'],discussions:['discussions','讨论']};
const destWord=w=>{const p=destLabels[w];return state.lang&&p?`${p[1]} ${w}`:w};
const normalizeDest=raw=>{if(activeDestinations().includes(raw))return raw;for(const k of activeDestinations()){const p=destLabels[k];if(p&&p[1]===raw)return k}return null};
function searchView(){return `<section class="search-hub"><div class="search-warning">${T('ACCESS ROUTING PROTOCOL · MANUAL DESTINATION REQUIRED','访问路由协议 · 必须手动指定目的地')}</div><h1>${isStaff()?T('Faculty destination directory','教职员工目的地目录'):T('Destination directory search','目的地目录搜索')}</h1><p>${T('Enter the exact destination name. Every new section requires returning here first. Navigation shortcuts have been disabled by institutional policy.','请输入目的地的确切名称。每次进入新板块都必须先返回此处。导航快捷方式已被校方策略禁用。')}</p><form id="destination-search" class="destination-form"><label for="destination-input">${T('Requested destination','请求的目的地')}</label><input id="destination-input" autocomplete="off" spellcheck="false" placeholder="${T('Type a destination word','输入目的地关键词')}" required><button class="btn" type="submit">${T('Request access to destination','请求访问该目的地')}</button><p id="destination-error" role="alert"></p></form><div class="search-words"><strong>${T('HELP WORDS · Valid destination vocabulary (type, do not click)','提示词 · 有效目的地词汇（请手动输入，不要点击）')}</strong><div>${activeDestinations().map(w=>`<span>${destWord(w)}</span>`).join('')}</div></div><p class="search-note">${T('Correct spelling required.','必须拼写正确。')} ${isStaff()?T('Faculty destinations only; student services are unavailable.','仅限教职员工目的地；学生服务不可用。'):T('You may also type a course code after opening Courses.','打开“课程”后也可输入课程代码。')}</p></section>`}
function routeAssist(){return `<section class="route-assist"><button type="button" class="btn secondary" data-action="go:search" data-testid="return-search">← ${T('Return to directory search','返回目录搜索')}</button><div><strong>${T('HELP WORDS FOR OTHER WINDOWS','其他窗口的提示词')}</strong><p>${activeDestinations().map(w=>`<span>${destWord(w)}</span>`).join(' ')}</p><small>${T('To reach another window, return to search and type its word. These words are intentionally not links.','要前往其他窗口，请返回搜索页并输入对应关键词。这些词故意不是链接。')}</small></div></section>`}
function nav(keys){return `<button class="nav-link ${ui.page==='search'?'active':''}" data-action="go:search" data-testid="nav-search">${Ic('search')}${T('Destination search','目的地搜索')}</button><div class="nav-help">${keys.map(k=>`<span>${destWord(k)}</span>`).join(' · ')}<small>${T('Reference words only — return to search to navigate.','仅为参考词 — 请返回搜索页进行导航。')}</small></div>`}
function shell(){
 const notifications = T('Notifications','通知');
 return `<div class="shell ${ui.menu?'menu-open':''}">
 <aside class="rail" ${!ui.menu&&matchMedia('(max-width:680px)').matches?'inert':''}><button class="brand" data-action="go:search"><span class="brand-tile">${Ic('graduation-cap')}</span><span><strong>Campusline</strong><small>${T('Learning portal','大学学习门户')}</small></span></button>
 <nav aria-label="${T('Main navigation','主导航')}"><div class="nav-section"><div class="nav-label">${T('Workspace','学习空间')}</div>${nav(isStaff()?['dashboard','teaching','submissions','class attendance','discussions']:['dashboard','courses','assignments','grades','attendance','discussion'])}</div><div class="nav-section"><div class="nav-label">${T('Campus services','校园服务')}</div>${nav(isStaff()?['notifications','help']:['wellbeing','help','payments'])}</div></nav>
 <div class="rail-end"><button class="profile" data-action="roles" data-testid="profile-role"><span class="avatar">${avatar()}</span><span class="profile-copy"><strong>${name()}</strong><small>${roleLabel()} · ${T('Demo view','演示视图')}</small></span>${Ic('chevrons-up-down')}</button></div></aside>
 <button class="mobile-shade" type="button" data-action="menu" tabindex="-1" aria-label="${T('Close navigation','关闭导航')}"></button>
 <header class="top"><div class="crumb"><button class="icon-btn mobile-menu" type="button" data-action="menu" data-testid="mobile-menu" aria-label="${T('Navigation','导航')}" aria-expanded="${ui.menu}">${Ic('menu')}</button><button type="button" class="parent crumb-link" data-action="crumb:root">${T('My workspace','我的空间')}</button>${Ic('chevron-right')}<span class="crumb-maze">${breadcrumbTrail.slice(-5).map((item,j)=>`<button type="button" class="crumb-link" data-action="crumb:${j}" title="${T('Previous route','上一条路由')} ${j+1}">${esc(item.label)}</button>${Ic('chevron-right')}`).join('')}</span><strong>${isStaff()?(facultyRouteLabels[ui.page]?D(facultyRouteLabels[ui.page]):routeLabel()):routeLabel()}</strong></div><div class="top-actions">
 <span class="term">${Ic('calendar-days')}${schoolYear()}</span><button class="lang" data-action="lang" data-testid="language" title="${T('Switch to Simplified Chinese','切换至英语')}" aria-label="${T('Switch to Simplified Chinese','切换至英语')}">${Ic('globe-2')}${state.lang?'EN':'中文'}</button>
 <button class="icon-btn" data-action="go:notifications" title="${notifications}" aria-label="${notifications}${unread()?` (${unread()})`:''}" data-testid="notifications">${Ic('bell')}${unread()?'<span class="dot"></span>':''}</button>
 <button class="avatar" data-action="roles" data-testid="top-role" title="${T('Switch demo role','切换演示身份')}" aria-label="${T('Switch demo role','切换演示身份')}">${avatar()}</button></div></header>
 <main id="main" class="content" tabindex="-1">${view()}${ui.page==='search'?'':routeAssist()}</main></div>`;
}
const patterns = [
 `<path d="M8 101 151-9m-103 113L194-7M86 106 229-8m-105 113L270-7m-103 110L308-9M241-8l-14 16 14 17m17-30 14 13-14 17M159 64l-18 17 18 16m18-33 18 17-18 16"/><circle cx="195" cy="24" r="5"/><circle cx="107" cy="60" r="3"/><circle cx="279" cy="65" r="12"/>`,
 `<ellipse cx="185" cy="50" rx="116" ry="30" transform="rotate(-18 185 50)"/><ellipse cx="185" cy="50" rx="116" ry="42" transform="rotate(-18 185 50)"/><ellipse cx="185" cy="50" rx="116" ry="18" transform="rotate(-18 185 50)"/><path d="M177 0v100m-50-89v81m103-83v83M95 50h180"/><circle cx="226" cy="29" r="6"/>`,
 `<path d="M24 78h276M24 50h276M24 22h276M58 0v100M90 0v100M122 0v100M154 0v100M186 0v100M218 0v100M250 0v100M282 0v100"/><path stroke-width="2" d="M32 67C59 67 66 19 98 19s35 60 70 60 44-49 71-49 55 28 69 25"/><circle cx="98" cy="19" r="4"/><circle cx="168" cy="79" r="4"/>`
];
function courseCard(c,i){
 const length=courseModules(i).length, count=courseModules(i).filter((_,j)=>complete(i,j)).length, pct=Math.round(100*count/length);
 return `<button class="course-card ${c.tone}" data-action="course:${i}" data-testid="course-${i}"><div class="course-cover"><svg class="course-art" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid slice" stroke="currentColor" fill="none" aria-hidden="true">${patterns[i]}</svg><span class="course-mark">${Ic(c.icon)}</span></div><div class="course-body"><div class="course-code">${crypticCourseCodes[i]} · ${D(c.dept)}</div><h3>${esc(crypticCourseCodes[i])}</h3><p>${c.teacher}</p>${isStaff()?`<div class="progress-copy"><span>${T('Published modules','已发布模块')}</span><strong>${length}</strong></div>`:`<div class="progress" role="progressbar" aria-label="${T('Module progress','模块进度')}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><div class="progress-copy"><span>${count}/${length} ${T('modules complete','个模块已完成')}</span><strong>${pct}%</strong></div>`}</div></button>`;
}
const statusFor = a => state.submissions[a.id]?.score!=null?badge(T('Graded','已评分'),'teal'):state.submissions[a.id]?badge(T('Submitted','已提交'),'teal'):badge(T('To do','待提交'),'amber');
function assignmentRow(a,showStatus=true){
 const c=courses[a.course];
 return `<button class="row action" data-action="assignment:${a.id}" data-testid="assignment-${a.id}"><span class="date-tile ${c.tone}"><small>${T('NOV','11月')}</small><strong>${a.day}</strong></span><span class="row-main"><span class="row-name">${D(a.name)}</span><span class="row-info">${c.id} · ${state.lang?'截止 ':''}${a.time}</span></span>${showStatus?statusFor(a):''}<span class="row-end">${Ic('chevron-right')}</span></button>`;
}
function noticeRow(n,i){
 return `<button class="row action" data-action="notice:${i}" data-testid="notice-${i}">${mini(n.icon,n.tone)}<span class="row-main"><span class="row-name">${D(n.title)}</span><span class="row-info">${D(n.detail)}</span></span><span class="row-end">${D(n.date)}</span>${n.read?'':'<span class="unread"></span>'}</button>`;
}
function title(k,description,action=''){return `<div class="page-title"><div><span class="eyebrow">${schoolYear()}</span><h1>${L(k)}</h1><p>${description}</p></div>${action}</div>`}
const sex = (heading,action='',desc='') => `<div class="section-head"><div><h2>${heading}</h2>${desc?`<p class="descriptor">${desc}</p>`:''}</div>${action}</div>`;
const cta = (label,action)=>button(label,action,{kind:'text-btn',right:'arrow-right'});
// Instructor-only deliberately inconvenient exact-name student lookup.
const sampleStudentRecords = [
 {name:'Alex Morgan',id:'STU-1042',course:'CS 201',grade:'66 / 100',attendance:['Present · 2 of 3 meetings','出勤 · 3 次中 2 次'],standing:['Review required','需要复查']},
 {name:'Jamie Park',id:'STU-1087',course:'LANG 110',grade:'80 / 100',attendance:['Present · 3 of 3 meetings','出勤 · 3 次中 3 次'],standing:['Active','正常']},
 {name:'Morgan Lee',id:'STU-1136',course:'MATH 221',grade:'86 / 100',attendance:['Late · 2 of 3 meetings','迟到 · 3 次中 2 次'],standing:['Active','正常']}
];
function professorStudentLookup(){
 return `<section class="panel professor-student-lookup"><span class="eyebrow">${T('FACULTY STUDENT RECORDS · MANUAL LOOKUP ONLY','教职员工学生记录 · 仅限手动查询')}</span><h2>${T('Search for an individual student','查询单个学生')}</h2><p>${T("There is no student directory or browsable roster. Enter each student's full name separately to access their demo record.",'没有学生名录或可浏览的花名册。请逐个输入学生全名以访问其演示记录。')}</p><form id="professor-student-search" class="professor-student-form"><label for="professor-student-input">${T('Exact student full name','学生完整姓名')}</label><input id="professor-student-input" type="search" autocomplete="off" spellcheck="false" required placeholder="${T('Enter exact full name','请输入完整姓名')}"><button class="btn" type="submit">${T('Retrieve individual student record','检索单个学生记录')}</button><p id="professor-student-error" role="alert"></p></form><details class="professor-helpbox"><summary>${T('HELP BOX · Sample names to search','帮助框 · 可查询的示例姓名')}</summary><p>${T('Type one of these names exactly. This box is guidance, not a shortcut.','请准确输入以下姓名之一。此框仅为提示，并非快捷方式。')}</p><div class="professor-help-names">${people.map(p=>`<code>${esc(p)}</code>`).join('')}</div></details><div id="professor-student-result" aria-live="polite"></div></section>`;
}
function studentSearchResult(record){
 return `<div class="professor-result"><div class="search-warning">${T('SINGLE STUDENT RECORD · SEARCH AGAIN FOR ANY OTHER STUDENT','单个学生记录 · 查询其他学生请重新搜索')}</div><h3>${esc(record.name)}</h3><dl><div><dt>${T('Student ID','学号')}</dt><dd>${esc(record.id)}</dd></div><div><dt>${T('Enrolled course','所选课程')}</dt><dd>${esc(record.course)}</dd></div><div><dt>${T('Sample grade','示例成绩')}</dt><dd>${esc(record.grade)}</dd></div><div><dt>${T('Attendance','考勤')}</dt><dd>${DV(record.attendance)}</dd></div><div><dt>${T('Academic status','学业状态')}</dt><dd>${DV(record.standing)}</dd></div></dl><p>${T('Sample information for this demo only. Other students are hidden until separately searched.','仅用于本演示的示例信息。其他学生需单独查询后才会显示。')}</p></div>`;
}
function facultyDashboard(){
 const awaiting=assignments.length;
 return `<div class="dash faculty-dash">
 <section class="hero"><img class="hero-image" src="campus.webp" alt=""><div class="hero-copy"><div class="eyebrow">${T('FACULTY OPERATIONS · FALL 2026','教职员工工作 · 2026 秋季学期')}</div><h1>${T('Faculty workspace — Dr. Maya Chen','教师工作台 — Maya Chen 老师')}</h1><p>${T('Manage teaching responsibilities, review student submissions, and locate individual student records. Student-facing grades, payments, and personal course progress are not shown here.','管理教学任务、审阅学生提交并查找单个学生记录。此处不显示面向学生的成绩、费用和个人课程进度。')}</p></div></section>
 <section class="faculty-metrics"><div class="panel"><span class="eyebrow">${T('ACTIVE TEACHING','在授课程')}</span><h2>${courses.length} ${T('assigned classes','门授课班级')}</h2><p>${T('Manage teaching materials and class discussions.','管理教学材料与课堂讨论。')}</p></div><div class="panel"><span class="eyebrow">${T('ASSESSMENT OPERATIONS','考核工作')}</span><h2>${awaiting} ${T('assignment briefs','项作业说明')}</h2><p>${T('Open the submission review workspace.','打开提交审阅工作区。')}</p></div><div class="panel"><span class="eyebrow">${T('CLASS RECORDS','班级记录')}</span><h2>${T('Individual lookup required','需逐个查询')}</h2><p>${T('Student records can only be retrieved by exact name.','学生记录只能通过准确姓名检索。')}</p></div></section>
 ${professorStudentLookup()}
 <section class="panel"><span class="eyebrow">${T('FACULTY WORK QUEUE','教职工作队列')}</span><h2>${T('Teaching administration','教学管理')}</h2><div class="faculty-actions"><div><strong>${T('Course administration','课程管理')}</strong><p>${T('Published modules, teaching materials and course-level activity.','已发布模块、教学材料与课程层面动态。')}</p></div><div><strong>${T('Submission review','提交审阅')}</strong><p>${T('Review submitted work and publish feedback.','审阅已提交作业并发布反馈。')}</p></div><div><strong>${T('Class attendance','课堂考勤')}</strong><p>${T('Manage attendance records and session status.','管理考勤记录与课堂状态。')}</p></div><div><strong>${T('Discussion moderation','讨论管理')}</strong><p>${T('Review course threads and respond to students.','查看课程帖子并回复学生。')}</p></div></div><p class="search-note">${T('To open any workspace, return to destination search and enter its faculty help word.','要打开任何工作区，请返回目的地搜索并输入对应的教职提示词。')}</p></section>
 <footer class="dash-footer"><span>Campusline · ${T('Faculty teaching prototype','教师教学原型')}</span><span>${T('Fictional student records · Demo only','虚构学生记录 · 仅供演示')}</span></footer></div>`;
}
function dashboard(){
 if(isStaff())return facultyDashboard();
 const next=assignments.filter(a=>!state.submissions[a.id]);
 return `<div class="dash">

 <section class="hero"><img class="hero-image" src="campus.webp" alt="" fetchpriority="high"><div class="hero-copy"><div class="eyebrow"><i></i>${T('FALL 2026 TERM · WEEK 10','2026 秋季学期 · 第 10 周')}</div><h1>${isStaff()?T('Welcome back, Maya','欢迎回来，Maya'):T('Welcome back, Alex','欢迎回来，Alex')}</h1><p>${isStaff()?T('Review submissions, update attendance, and keep your classes moving.','查看作业、更新考勤，稳步推进教学。'):T('Pick up where you left off and get ready for the week ahead.','从上次学习的地方继续，准备好迎接新的一周。')}</p>${button(isStaff()?T('Review submissions','查看提交'):T('Continue learning','继续学习'),isStaff()?'go:assignments':'continue',{kind:'btn white',right:'arrow-right',id:isStaff()?'review-submissions':'continue'})}</div></section>
 <section>${sex(L('courses'),cta(T('All courses','所有课程'),'go:courses'),isStaff()?T('3 courses in the teaching demo','演示包含 3 门授课课程'):T('3 courses in progress','3 门课程正在学习中'))}<div class="course-grid">${courses.map(courseCard).join('')}</div></section>
 <div class="dash-split"><section class="panel">${sex(isStaff()?T('Assignment queue','作业队列'):T('Upcoming deadlines','即将截止'),cta(T('View assignments','查看作业'),'go:assignments'))}${(isStaff()?assignments:next).map(a=>assignmentRow(a)).join('')||`<div class="empty">${T('You’re caught up on upcoming work.','近期作业已全部完成。')}</div>`}</section><div class="stack">
 <section class="panel">${sex(T('Recent updates','最新动态'),cta(T('All notifications','所有通知'),'go:notifications'))}${state.notices.slice(0,3).map(noticeRow).join('')}</section>
 <section class="panel well-card">${mini('heart-handshake','amber')}<div><h2>${T('Take a breather','休息一下')}</h2><p>${T('A short reset for busy study days.','给忙碌的学习日一个短暂的放松时间。')}</p></div>${cta(T('Wellbeing space','身心健康空间'),'go:wellbeing')}</section>
 </div></div><footer class="dash-footer"><span>Campusline · ${T('University teaching prototype','大学教学原型')}</span><span>${T('Sample data · Changes reset on refresh','示例数据 · 刷新后重置')}</span></footer></div>`;
}
function coursesView(){return `<div class="page">${title('courses',T('Open a course to find modules, assignments, and class discussions.','打开课程即可查看模块、作业和讨论。'))}<div class="course-grid">${courses.map(courseCard).join('')}</div></div>`}
function tab(label,key){return `<button data-action="tab:${key}" data-testid="tab-${key}" aria-pressed="${ui.tab===key}">${label}</button>`}
function courseView(){
 const i=ui.course,c=courses[i], modules=courseModules(i);
 const moduleRows=modules.map((m,j)=>{
  const fallback=['Write a short summary of the main idea, work through an example, and post any questions to the course discussion.','写一段内容摘要，完成一个示例，并把问题发到课程讨论区。'];
  return `<details class="module" ${ui.openModule===j?'open':''} data-module="${j}"><summary data-testid="module-${j}">${mini(complete(i,j)?'check':'book-open',c.tone)}<span class="row-main"><span class="row-info">${T('Module','模块')} ${String(j+1).padStart(2,'0')}</span><strong class="row-name">${D(m.topic)}</strong></span>${!isStaff()&&complete(i,j)?badge(T('Complete','已完成'),'teal'):''}${Ic('chevron-down')}</summary><div class="module-body"><p>${D(m.body||fallback)}</p>${!isStaff()?button(complete(i,j)?T('Mark incomplete','标记为未完成'):T('Mark complete','标记为完成'),`module:${j}`,{kind:'btn secondary',left:'check',id:`complete-module-${j}`}):''}</div></details>`;
 }).join('');
 let inner=ui.tab==='modules'?`${sex(T('Course modules','课程模块'),isStaff()?button(T('Publish module','发布模块'),'newmodule',{left:'plus'}):'')}<div class="module-list">${moduleRows}</div>`:ui.tab==='assignments'?`${sex(L('assignments'))}${assignments.filter(a=>a.course===i).map(a=>assignmentRow(a)).join('')}`:`${sex(L('discussion'),button(T('New discussion','发起讨论'),'newthread',{left:'plus'}))}${state.threads.filter(th=>th.course===i).map(threadRow).join('')}`;
 return `<div class="page">${button(T('My courses','我的课程'),'go:courses',{kind:'text-btn back',left:'arrow-left'})}<div class="detail-banner ${c.tone}"><span class="course-mark">${Ic(c.icon)}</span><div><span class="course-code">${crypticCourseCodes[i]} · ${D(c.dept)}</span><h1>${esc(crypticCourseCodes[i])}</h1><p>${c.teacher}</p></div>${badge(schoolYear())}</div><div class="tabs">${tab(T('Modules','模块'),'modules')}${tab(L('assignments'),'assignments')}${tab(L('discussion'),'discussion')}</div><section class="panel">${inner}</section></div>`;
}
function courseSelect(value='all', includeAll=true){
 return `${includeAll?`<option value="all" ${value==='all'?'selected':''}>${T('All courses','所有课程')}</option>`:''}${courses.map((c,j)=>`<option value="${j}" ${Number(value)===j?'selected':''}>${c.id} · ${esc(crypticCourseCodes[j])}</option>`).join('')}`;
}
function filterLine(all=true){
 const value=all?ui.filter:(ui.filter==='all'?0:ui.filter);
 return `<div class="filter"><label for="course-filter">${T('Course','课程')}</label><select id="course-filter" data-testid="course-filter">${courseSelect(value,all)}</select></div>`;
}
function assignmentView(){
 const items=assignments.filter(a=>ui.filter==='all'||a.course===Number(ui.filter));
 return `<div class="page">${title('assignments',isStaff()?T('Open an assignment to review demo submissions and publish feedback.','打开作业，查看演示提交并发布反馈。'):T('Review instructions, hand in work, and track submission status.','查看作业说明、提交作品并跟踪状态。'))}${filterLine()}<section class="panel">${sex(isStaff()?T('Assignment queue','作业队列'):T('Fall 2026 assignments','2026 秋季作业'))}${items.map(a=>assignmentRow(a)).join('')}</section></div>`;
}
function gradeEntries(){
 return [...gradeHistory.map(r=>({...r,status:'posted'})),...assignments.map(a=>{
  const submission=state.submissions[a.id];
  return {id:a.id,course:a.course,name:a.name,score:submission?.score??null,feedback:submission?.feedback,status:submission?.score!=null?'graded':submission?'awaiting':'missing'};
 })];
}
function weakestGradeSubject(entries){
 const averages=courses.map((_,course)=>{
  const scores=entries.filter(entry=>entry.course===course&&Number.isFinite(entry.score));
  return scores.length?{course,count:scores.length,average:scores.reduce((sum,entry)=>sum+entry.score,0)/scores.length}:null;
 }).filter(Boolean);
 return averages.sort((a,b)=>a.average-b.average||a.course-b.course)[0];
}
function gradesView(){
 const entries=gradeEntries(), weakest=weakestGradeSubject(entries);
 const items=entries.filter(entry=>ui.filter==='all'||entry.course===Number(ui.filter)).sort((a,b)=>(a.score??Infinity)-(b.score??Infinity));
 const rows=items.map(entry=>{
  const weak=entry.course===weakest?.course;
  const feedback=entry.feedback?DV(entry.feedback):entry.status==='posted'?T('Posted','已发布'):entry.status==='graded'?T('Grade published','成绩已发布'):entry.status==='awaiting'?T('Awaiting grade','等待评分'):T('Not submitted','未提交');
  return `<tr ${weak?'class="weakest-grade"':''} data-testid="grade-${entry.id}"><td>${esc(crypticCourseCodes[entry.course])}${weak?` ${badge(T('Weakest subject','最不擅长'),'amber')}`:''}</td><td>${D(entry.name)}</td><td><strong class="grade-riddle">${entry.score!=null?`${100-entry.score} ${T('points escaped out of 100. Deduce the remainder.','分从 100 分中逃走了。请推断剩余分数。')}`:'–'}</strong></td><td>${feedback}</td></tr>`;
 }).join('');
 const warning=weakest?`<aside class="callout amber grade-warning" data-testid="weakest-subject"><strong>${T('Your weakest subject code:','最弱课程代码：')} ${esc(crypticCourseCodes[weakest.course])}</strong><p>${T('You need to keep working. Keep improving!','需要继续加油。')}</p><small>${T('Lowest subject average','各学科最低平均分')} · ${weakest.average.toFixed(1)} / 100 · ${weakest.count} ${T('graded assessments','项已评分考核')}</small></aside>`:'';
 return `<div class="page">${title('grades',isStaff()?T('Demo grades for Alex Morgan, ordered from worst to best. Grade new work in Assignments.','Alex Morgan 的演示成绩，按最差到最好排序。请在作业页面为新提交评分。'):T('Grades from worst to best. Your lowest scores appear first.','成绩从最差到最好排序，最低分优先显示。'),isStaff()?button(L('assignments'),'go:assignments',{kind:'btn outline',right:'arrow-right'}):'')}${warning}${filterLine()}<section class="panel grade-reveal-panel">${sex(T('Grade records','成绩记录'),badge(T('Worst → best','最差 → 最好'),'amber'),`${items.filter(entry=>Number.isFinite(entry.score)).length} ${T('graded assessments','项已评分考核')}`)}<div class="table-wrap"><table><thead><tr><th>${T('Course','课程')}</th><th>${T('Assessment','考核')}</th><th>${T('Score','分数')}</th><th>${T('Feedback / status','反馈 / 状态')}</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`;
}
function attendanceView(){
 const i=ui.filter==='all'?0:Number(ui.filter), c=courses[i];
 const rec=state.records[i]||{};
 const statuses=['unrecorded','present','late','absent','excused'];
 const roster=people.map((p,j)=>`<tr><td>${p}</td><td><select aria-label="${T('Attendance for','考勤：')} ${p}" data-testid="attendance-${j}" name="student${j}">${statuses.map(x=>`<option value="${x}" ${(rec[j]||'unrecorded')===x?'selected':''}>${D(statusText[x])}</option>`).join('')}</select></td></tr>`).join('');
 const date = T('Nov 23, 2026','2026年11月23日');
 const studentRows = [[T('Nov 9, 2026','2026年11月9日'),'present'],[T('Nov 16, 2026','2026年11月16日'),i===1?'late':'present'],[date,state.studentAttendance?.[i]?'present':rec[0]||'unrecorded']].map(([d,s])=>`<tr><td>${d}</td><td>${badge(D(statusText[s]),s==='present'?'teal':s==='unrecorded'?'':'amber')}</td></tr>`).join('');
 return `<div class="page">${title('attendance',isStaff()?T('Select a course and record attendance for the demo class meeting.','选择课程并记录演示课堂的考勤情况。'):T('Check your attendance record for each class.','查看每门课程的个人考勤记录。'))}${filterLine(false)}<section class="panel">${sex(D(c.name),'',isStaff()?date:T('Meeting history','课堂记录'))}${isStaff()?`<form data-form="attendance:${i}"><div class="table-wrap"><table><thead><tr><th>${T('Student','学生')}</th><th>${T('Status','状态')}</th></tr></thead><tbody>${roster}</tbody></table></div><div class="form-actions">${button(T('Save attendance','保存考勤'),null,{submit:true,id:'save-attendance'})}</div>${state.records[i]?`<p class="callout teal">${T('Attendance saved for this meeting.','本次课程的考勤已保存。')}</p>`:''}</form>`:`<div class="table-wrap"><table><thead><tr><th>${T('Date','日期')}</th><th>${T('Status','状态')}</th></tr></thead><tbody>${studentRows}</tbody></table></div><div class="attendance-challenge"><h3>${T('ATTENDANCE ELIGIBILITY EXAMINATION','出勤资格考核')}</h3><p>${T('Attendance is not granted merely for being here. Answer the question about the class to record your presence.','出勤并不仅仅因为到场就成立。请回答与课堂相关的问题以记录你的出勤。')}</p><p><strong>${DV(attendanceChallenges[i].question)}</strong></p><form data-form="attendance-quiz:${i}"><p data-error role="alert" class="callout amber" hidden></p><label class="field">${T('Select one answer','选择一个答案')}<select name="answer" required><option value="">${T('Choose an answer','请选择答案')}</option>${attendanceChallenges[i].choices.map((choice,j)=>`<option value="${j}">${DV(choice)}</option>`).join('')}</select></label><div class="form-actions">${button(T('Validate my presence','验证我的出勤'),null,{submit:true,id:'student-attendance'})}</div></form>${state.studentAttendance?.[i]?`<p class="callout teal">${T('Your attendance has been recorded for this session.','本次课程出勤已记录。')}</p>`:''}</div>`}</section></div>`;
}
const threadText=(th,key)=>esc((state.lang&&th[`${key}Zh`])||th[key]);
function threadRow(th){const c=courses[th.course];return `<button class="row action" data-action="thread:${th.id}" data-testid="thread-${th.id}">${mini('messages-square',c.tone)}<span class="row-main"><span class="row-name">${threadText(th,'title')}</span><span class="row-info">${c.id} · ${esc(th.author)}</span></span><span class="row-end">${th.replies.length} ${T('replies','条回复')}</span>${Ic('chevron-right')}</button>`}
function discussionView(){return `<div class="page">${title('discussion',T('Ask questions, share ideas, and learn from classmates.','提出问题、分享观点，与同学一起学习。'),button(T('New discussion','发起讨论'),'newthread',{left:'plus'}))}${filterLine()}<section class="panel">${state.threads.filter(th=>ui.filter==='all'||th.course===Number(ui.filter)).map(threadRow).join('')}</section></div>`}
function threadView(){
 const th=state.threads.find(t=>t.id===ui.thread);
 if(!th)return discussionView();
 return `<div class="page">${button(T('Back to discussions','返回讨论区'),'go:discussion',{kind:'text-btn back',left:'arrow-left'})}<section class="panel stack"><span class="eyebrow">${courses[th.course].id} · ${esc(th.author)}</span><h1>${threadText(th,'title')}</h1><p class="long-copy">${threadText(th,'body')}</p></section><section class="panel stack"><h2>${T('Replies','回复')} (${th.replies.length})</h2><div class="reply-list">${th.replies.length?th.replies.map(r=>`<article><strong>${esc(r.author)}</strong><p class="long-copy">${esc(r.body)}</p></article>`).join(''):`<p>${T('No replies yet. Start the conversation below.','暂无回复，欢迎开始讨论。')}</p>`}</div><form data-form="reply"><label class="field">${T('Your reply','你的回复')}<textarea name="body" required maxlength="1500" data-testid="reply-body"></textarea></label><div class="form-actions">${button(T('Post reply','发布回复'),null,{submit:true,id:'post-reply'})}</div></form></section></div>`;
}
function notificationsView(){return `<div class="page">${title('notifications',T('Course announcements, grade releases, and assignment updates.','课程公告、成绩发布和作业动态。'),button(T('Mark all as read','全部标为已读'),'readall',{kind:'btn outline',disabled:!unread(),left:'check-check'}))}<section class="panel">${sex(T('Inbox','收件箱'),badge(`${unread()} ${T('unread','条未读')}`,'indigo'))}${state.notices.map((n,i)=>`<div class="notice-dismiss-wrap">${noticeRow(n,i)}<button type="button" class="btn outline notice-dismiss" data-action="dismiss:${i}" data-testid="dismiss-${i}">${T('Dismiss','忽略')} ${pendingDismissals.has(i)?T('(waiting...)','（等待中…）'):''}</button></div>`).join('')}</section></div>`}
function wellbeingView(){return `<div class="page">${title('wellbeing',T('Make room for a short break or find support when you need it.','给自己一点休息时间，也可以在需要时寻求支持。'))}<div class="secondary-grid"><section class="panel"><span class="eyebrow">${T('Guided break','引导休息')}</span><h2>${T('One-minute breathing break','一分钟呼吸练习')}</h2><p>${T('If it feels comfortable, breathe in for four seconds and out for six. You can stop at any time.','如果感觉舒服，吸气四秒，呼气六秒。可随时停止。')}</p><div class="breathe" id="breathe"><span id="breathe-label" aria-hidden="true">${T('Ready','准备')}</span></div><p id="breathe-status" aria-live="polite">${T('60 seconds · Optional','60 秒 · 自愿参与')}</p><div>${button(T('Start breathing break','开始呼吸练习'),'breath',{left:'play',id:'breath-button'})}</div></section><section class="panel well-card"><span class="eyebrow">${T('Campus support','校园支持')}</span><h2>${T('Talk to someone','找人聊一聊')}</h2><p>${T('For personal support, contact your university’s counseling or student services team. This demo does not connect to a counselor.','如需个人支持，请联系学校的心理咨询或学生服务团队。本演示不会连接咨询师。')}</p><p>${T('If you are in immediate danger, contact local emergency services.','如遇紧急危险，请联系当地紧急服务。')}</p><div>${cta(T('Open help center','打开帮助中心'),'go:help')}</div></section></div></div>`}
const faqs=[
 [['How do I submit an assignment?','如何提交作业？'],['Open Assignments, select a task, then add text or select a sample file. The demo records the filename, not the file contents.','打开作业，选择一项任务，输入文字或选择示例文件。演示仅记录文件名，不保存文件内容。']],
 [['Where can I see grades and feedback?','在哪里查看成绩和反馈？'],['Open Grades. Feedback appears after an instructor publishes a score for the submitted assignment.','打开成绩页面。教师发布作业成绩后，反馈会显示在这里。']],
 [['How do I switch languages or roles?','如何切换语言或身份？'],['Use the language button in the header or the profile button to switch between the student and instructor demo views.','使用顶部语言按钮切换语言，或通过个人资料按钮切换学生与教师演示视图。']],
 [['Will a demo payment charge me?','演示付款会扣费吗？'],['No. The flow does not ask for payment details or process real money.','不会。流程不会要求输入支付信息或处理真实资金。']]
];
function helpView(){return `<div class="page">${title('help',T('Find answers and try the support request flow.','查找常见问题的答案并体验支持请求流程。'))}<div class="secondary-grid"><section class="panel faq"><h2>${T('Frequently asked questions','常见问题')}</h2>${faqs.map(([q,a],i)=>`<details><summary data-testid="faq-${i}">${D(q)}</summary><p>${D(a)}</p></details>`).join('')}</section><section class="panel"><h2>${T('Contact support','联系支持')}</h2><p>${T('Use fictional details in this demo. No request is sent to a university.','请在演示中使用虚构信息。请求不会发给任何大学。')}</p>${state.ticket?`<p class="callout teal" data-testid="support-result">${T('Demo request recorded:','演示请求已记录：')} ${esc(state.ticket)}.</p>`:''}${state.humanHelp?`<p class="callout amber" data-testid="human-help-queue">${T('There are still 400 people in the queue. Please try again later.','当前还有400人正在排队，请稍后。')}</p>`:''}${button(T('Create demo request','创建演示请求'),'helpform',{left:'life-buoy'})}${button(T('Human help','人工帮助'),'human-help',{left:'life-buoy'})}</section></div></div>`}
function paymentsView(){return `<div class="page">${title('payments',T('View a sample university fee and try a simulated payment.','查看示例大学费用并体验模拟支付。'))}<div class="secondary-grid"><section class="panel"><span class="eyebrow">${T('Demo student account','演示学生账户')}</span><h2>${T('Fall 2026 learning materials fee','2026 秋季学习材料费')}</h2><div class="amount">${state.paid?'$0.00':'$85.00'}</div><p>${state.paid?T('Remaining balance','剩余应付金额'):T('USD due Dec 1, 2026','美元 · 2026年12月1日到期')}</p><div>${state.paid?badge(T('Paid in demo','演示中已支付'),'teal'):button(T('Simulate payment','模拟支付'),'pay',{left:'credit-card'})}</div></section><section class="panel"><h2>${T('Payment activity','付款记录')}</h2>${state.paid?`<p class="callout teal" data-testid="payment-result">${T('Simulated payment: $85.00 USD · Receipt DEMO-2026-001','模拟付款：85.00 美元 · 收据 DEMO-2026-001')}</p>`:`<p>${T('No sample payments yet.','尚无示例支付记录。')}</p>`}<p>${T('No charge is made and no payment information is collected.','不会扣款，也不会收集支付信息。')}</p></section></div>`}
function view(){if(isStaff()&&['grades','wellbeing','payments'].includes(ui.page))return facultyDashboard();return ({search:searchView,dashboard,courses:coursesView,course:courseView,assignments:assignmentView,grades:gradesView,attendance:attendanceView,discussion:discussionView,thread:threadView,notifications:notificationsView,wellbeing:wellbeingView,help:helpView,payments:paymentsView}[ui.page]||dashboard)()}
let toastTimer, breathTimer, breathStart=0, lastPhase='', dialogTrigger;
function toast(msg){const box=$('#toast');box.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.textContent='',3000)}
function icons(){window.lucide?.createIcons()}
function render(){document.documentElement.lang=state.lang?'zh-Hans':'en';document.title=state.lang?'Campusline | 大学学习门户':'Campusline | University Learning Portal';const sk=document.querySelector('.skip');if(sk)sk.textContent=state.lang?'跳转到主要内容':'Skip to content';app.innerHTML=shell();icons()}
function go(page,options={}){
 if(isStaff()&&['grades','wellbeing','payments'].includes(page))page='search';
 if(ui.page!==page || Object.keys(options).length)breadcrumbTrail.push({page:ui.page,course:ui.course,thread:ui.thread,label:state.lang?'历史记录':(labels[ui.page]?.[0]||ui.page)});
 if(breadcrumbTrail.length>25)breadcrumbTrail.shift();
 stopBreath(); Object.assign(ui,{page,menu:false,filter:'all',tab:'modules',openModule:null},options);
 render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});
}
function openDialog(title,body){
 preserveAssignmentDraft();
 if(!modal.open)dialogTrigger=document.activeElement;
 modal.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-btn" data-action="close" data-testid="modal-close" aria-label="${T('Close','关闭')}">${Ic('x')}</button></div><div class="dialog-body">${body}</div>`;
 if(!modal.open)modal.showModal();
 icons();
}
modal.addEventListener('close',()=>{if(document.activeElement!==document.body)return;if(dialogTrigger?.isConnected)dialogTrigger.focus();else if(dialogTrigger?.dataset.testid)$(`[data-testid="${dialogTrigger.dataset.testid}"]`)?.focus()});
const field = (name,label,options={})=>`<label class="field">${label}${options.area?`<textarea name="${name}" data-testid="input-${name}" ${options.optional?'':'required'} maxlength="${options.max||1500}">${esc(options.value||'')}</textarea>`:`<input name="${name}" data-testid="input-${name}" type="${options.type||'text'}" ${options.optional?'':'required'} ${options.type==='number'?'min="0" max="100" step="1"':options.type==='file'?'':`maxlength="${options.max||100}"`} ${options.value!=null?`value="${esc(options.value)}"`:''}>`}${options.note?`<small class="muted">${options.note}</small>`:''}</label>`;
const form = (id,fields,action)=>`<form data-form="${id}">${fields}<p role="alert" class="callout amber" data-error hidden></p><div class="form-actions">${button(T('Cancel','取消'),'close',{kind:'btn outline'})}${button(action,null,{submit:true,id:`submit-${id.split(':')[0]}`})}</div></form>`;
const localizedNotice=(title,detail,route,icon='megaphone',tone='indigo')=>state.notices.unshift({title,detail,route,icon,tone,date:['Just now','刚刚']});
const assignmentLimitMs=60_000;
const assignmentQueueMs=10_000;
const submissionRoutes=[{id:'portal',label:['Course portal','课程门户']},{id:'email',label:['Email attachment','邮件附件']},{id:'drive',label:['Shared drive link','共享云盘链接']}];
const assignmentAttempts=new Map();
const resubmissionCounts=new Map();
const submissionHistory=new Map();
const judgeAttemptScores=new Map();
let assignmentTimer=null;
const submissionRouteLabel=id=>D(submissionRoutes.find(route=>route.id===id)?.label||submissionRoutes[0].label);
function assignmentForm(){return modal.open?$('form[data-form^="assignment:"]',modal):null}
function saveAssignmentDraft(f){
 const id=f.dataset.form.split(':')[1], attempt=assignmentAttempts.get(id);
 if(!attempt)return;
 const data=new FormData(f);
 attempt.text=String(data.get('answer')||'');
 attempt.file=data.get('file')?.name||attempt.file||'';
 const checked=data.getAll('portal-route');
 attempt.routes=attempt.routes.filter(route=>checked.includes(route));
 for(const route of checked)if(!attempt.routes.includes(route))attempt.routes.push(route);
 attempt.ack=$('[data-testid=portal-ack]',f)?.checked||false;
}
function preserveAssignmentDraft(){
 const f=assignmentForm();if(!f)return;
 const attempt=assignmentAttempts.get(f.dataset.form.split(':')[1]);if(!attempt)return;
 if(Date.now()<attempt.deadline)saveAssignmentDraft(f);
 clearTimeout(attempt.queueTimer);attempt.queueTimer=null;attempt.step=0;
}
function recordAssignment(id,automatic=false){
 const attempt=assignmentAttempts.get(id);if(!attempt||state.submissions[id])return;
 clearTimeout(attempt.queueTimer);
 const submission={text:attempt.text.trim(),file:attempt.file,route:attempt.routes.at(-1)||'portal',automatic};
 if(id==='trees'){
  const judged=judgeAttemptScores.get(id);
  submission.score=judged?.code===attempt.text.trim()?judged.score:0;
  submission.feedback=judged?.code===attempt.text.trim()?['Automatic strict online judge: 100 only if all exact tests passed; otherwise 0.','自动严格判题：仅当所有精确测试通过才得 100 分，否则为 0 分。']:['Not tested with the online judge for this submission: 0/100.','本次提交未经在线判题测试：0/100。'];
  submission.judgeGraded=true;
 }
 state.submissions[id]=submission;
 if(!submissionHistory.has(id))submissionHistory.set(id,[]);
 submissionHistory.get(id).push({...submission,attemptNumber:(resubmissionCounts.get(id)||0)+1});
 assignmentAttempts.delete(id);
 if(!assignmentAttempts.size){clearInterval(assignmentTimer);assignmentTimer=null}
 const visible=assignmentForm()?.dataset.form===`assignment:${id}`;
 render();
 if(visible)assignmentDialog(id);
 toast(automatic?T('Time expired: assignment auto-submitted','时间到：作业已自动提交'):T('Submission saved in demo','提交已保存在演示中'));
}
function startResubmission(id){
 if(isStaff()||!state.submissions[id])return;
 // Close the old submission dialog before creating a fresh attempt. Otherwise
 // openDialog() preserves the OLD answer into the NEW blank attempt.
 if(modal.open)modal.close();
 const count=(resubmissionCounts.get(id)||0)+1;
 resubmissionCounts.set(id,count);
 const limit=Math.max(1000,Math.floor(assignmentLimitMs/Math.pow(2,count)));
 delete state.submissions[id];
 judgeAttemptScores.delete(id);
 judgePending=null;
 ++judgeSequence;clearTimeout(judgeTimeout);judgeFrame?.remove();judgeFrame=null;
 assignmentAttempts.set(id,{deadline:Date.now()+limit,text:'',file:'',routes:[],ack:false,step:0,queueTimer:null});
 assignmentDialog(id);
 render();
}
function expireAssignment(id){
 const attempt=assignmentAttempts.get(id);
 if(attempt&&Date.now()>=attempt.deadline){recordAssignment(id,true);return true}
 return false;
}
function tickAssignments(){
 const f=assignmentForm();
 if(f){const id=f.dataset.form.split(':')[1], attempt=assignmentAttempts.get(id);if(attempt&&Date.now()<attempt.deadline)saveAssignmentDraft(f)}
 for(const [id,attempt] of assignmentAttempts){
  if(expireAssignment(id))continue;
  if(f?.dataset.form===`assignment:${id}`){
   const seconds=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000)), counter=$('[data-testid=assignment-countdown]',f);
   if(counter){counter.textContent=`${pick(['Time remaining','剩余时间'])}: 0:${String(seconds).padStart(2,'0')}`;if(seconds===60)counter.textContent=`${pick(['Time remaining','剩余时间'])}: 1:00`;counter.classList.toggle('urgent',seconds<=10)}
  }
 }
}
function assignmentDraftChanged(e){
 const f=e.target.closest('form[data-form^="assignment:"]');if(!f)return;
 const id=f.dataset.form.split(':')[1];if(expireAssignment(id))return;
 const attempt=assignmentAttempts.get(id);if(!attempt)return;
 saveAssignmentDraft(f);
 clearTimeout(attempt.queueTimer);attempt.queueTimer=null;attempt.step=0;
 const btn=$('button[type=submit]',f);btn.disabled=false;btn.textContent=pick(['Submit assignment','提交作业']);
 $('[data-confirmation]',f).hidden=true;$('[data-error]',f).hidden=true;
}
document.addEventListener('input',assignmentDraftChanged);
document.addEventListener('change',assignmentDraftChanged);
document.addEventListener('pointermove',e=>{if(e.target.closest('[data-action^="judge:"], [data-action="judge-confirm"], [data-action="judge-next"]'))moveJudgeButtons()});
modal.addEventListener('cancel',preserveAssignmentDraft);
document.addEventListener('visibilitychange',tickAssignments);
window.addEventListener('focus',tickAssignments);
function assignmentDialog(id){
 preserveAssignmentDraft();
 expireAssignment(id);
 const a=assignments.find(x=>x.id===id), r=state.submissions[id];
 const details=`<p class="small">${crypticCourseCodes[a.course]} · ${T('Due','截止')} ${due(a)}</p><p>${T('Unrealistic brief: compare every campus timetable, interview 500 students, build a production-ready AI tutor, and submit a 40-page report before midnight.','不切实际的作业：比较全校课表、访谈500名学生、构建可上线的AI导师，并在午夜前提交40页报告。')}</p>`;
 let section='';
 if(isStaff()){
  section=r?`<div class="callout"><strong>${T('Submission from Alex Morgan','Alex Morgan 的提交')}</strong><p>${T('Final submission route:','最终提交方式：')} ${submissionRouteLabel(r.route)}</p>${r.text?`<p class="long-copy">${esc(r.text)}</p>`:''}${r.file?`<p>${T('Sample filename:','示例文件名：')} ${esc(r.file)}</p>`:''}</div>${form(`grade:${id}`,field('score',T('Score out of 100','分数（满分 100）'),{type:'number',value:r.score})+field('feedback',T('Feedback','反馈'),{area:true,optional:true,value:r.feedback}),T('Publish grade','发布成绩'))}`:`<p class="callout">${T('No work submitted. Switch to Student to try the submission flow.','尚未提交作业。切换到学生视图以体验提交流程。')}</p>`;
 } else if(r){
  section=`<div class="callout teal" data-testid="submission-result"><strong>${r.automatic?T('Time expired · Automatically submitted','时间已到 · 已自动提交'):T('Demo submission recorded','演示提交已记录')}</strong><p data-testid="submission-route">${T('Final submission route:','最终提交方式：')} ${submissionRouteLabel(r.route)}</p>${r.text?`<p class="long-copy">${esc(r.text)}</p>`:!r.file?`<p>${T('An empty answer was submitted.','已提交空白答案。')}</p>`:''}${r.file?`<p>${T('Sample filename:','示例文件名：')} ${esc(r.file)}</p>`:''}<p>${T('Submission is final. Editing is closed.','提交已最终确认，无法继续编辑。')}</p></div>${r.score!=null?`<p><strong>${r.score} / 100</strong>${r.feedback?` · ${DV(r.feedback)}`:''}</p>${cta(T('View grades','查看成绩'),'go:grades')}`:''}${id==='trees'?`<p><strong>${T('Strict judge score for this submission:','本次提交的严格判题分数：')} ${r.score??0}/100</strong></p><p>${T('Resubmission resets the answer to blank and halves the time limit from the original 60 seconds. Previous submissions remain in history.','重新提交会清空答案，并将时间限制在原先 60 秒的基础上减半。历史提交仍会保留。')}</p><button type="button" class="btn" data-action="resubmit:${id}" data-testid="resubmit-assignment">${T('Resubmit from scratch','从头重新提交')} (${Math.max(1,Math.floor(60/Math.pow(2,(resubmissionCounts.get(id)||0)+1)))} ${T('seconds','秒')})</button><p>${T('Submission history:','提交历史：')} ${(submissionHistory.get(id)||[]).map(h=>`${T('Attempt','第')} ${h.attemptNumber} ${T(':','次')} ${h.score??T('ungraded','未评分')}/100`).join(' · ')}</p>`:''}`;
 } else {
  if(!assignmentAttempts.has(id))assignmentAttempts.set(id,{deadline:Date.now()+Math.max(1000,Math.floor(assignmentLimitMs/Math.pow(2,resubmissionCounts.get(id)||0))),text:'',file:'',routes:[],ack:false,step:0,queueTimer:null});
  const attempt=assignmentAttempts.get(id);
  const routes=`<fieldset class="submission-routes" data-testid="portal-route"><legend>${T('Submission route (multiple choices available)','提交方式（可多选）')}</legend>${submissionRoutes.map(route=>`<label class="route-choice"><input type="checkbox" name="portal-route" value="${route.id}" data-testid="portal-route-${route.id}" ${attempt.routes.includes(route.id)?'checked':''}><span>${D(route.label)}</span></label>`).join('')}<small>${T('Multiple selections are allowed here. Only ONE route can be finalized.','此处允许多选，但最终只能确认一种提交方式。')}</small></fieldset><label class="route-choice"><input type="checkbox" data-testid="portal-ack" ${attempt.ack?'checked':''}><span>${T('I confirm I reviewed the portal notice.','我确认已阅读门户提示。')}</span></label>`;
  section=form(`assignment:${id}`,`<p class="callout amber assignment-countdown" data-testid="assignment-countdown">${T('Time remaining: countdown starts now','剩余时间：倒计时立即开始')}</p><p class="callout amber">${T('The countdown starts on opening and is halved for every resubmission. The timer continues after closing. When time expires, your current answer is submitted, even if empty. If several routes are checked, the last checked route wins; if none, Course portal is used.','打开后限时 60 秒，关闭窗口仍继续计时。超时自动提交当前答案，即使为空白。若勾选多个方式，只保留最后勾选的一项；若未勾选，默认使用课程门户。')}</p>`+field('answer',T('Your answer','你的答案'),{area:true,optional:true,value:attempt.text})+field('file',T('Attach sample file (optional)','附加示例文件（可选）'),{type:'file',optional:true,note:attempt.file?`${T('Selected sample filename:','已选示例文件名：')} ${esc(attempt.file)}`:T('Enter an answer or choose a file. Only the filename is recorded.','输入答案或选择文件。演示仅记录文件名。')})+(id==='trees'?`<div class="callout"><strong>${T('Online judge · JavaScript','在线判题 · JavaScript')}</strong><p>${T('Write function inorder(root) returning an array of values. Use the answer box above as your code editor.','编写 inorder(root) 函数，返回节点值数组。请在上方答案框输入代码。')}</p><pre>function inorder(root) {
  // ${T('return values in left-root-right order','按左-根-右顺序返回值')}
}</pre><p class="small">${T('Strict online judge: every test must pass exactly or this attempt scores ZERO. You may rerun to improve your best score. Each run hides every previous result.','严格在线判题：每项测试都必须精确通过，否则本次得分为零。你可以重新运行以提高最佳成绩。每次运行都会隐藏之前的结果。')}</p><div class="judge-moving-controls"><button type="button" class="btn outline" data-action="judge:trees" data-testid="run-tests">${T('Run tests','运行测试')}</button></div><p data-judge-score aria-live="polite"></p><div data-judge-results aria-live="polite">${T('Tests not run yet.','尚未运行测试。')}</div></div>`:'')+routes+`<p class="callout" data-confirmation aria-live="polite" hidden></p>`,T('Submit assignment','提交作业'));
 }
 openDialog(D(a.name),details+section);
 if(!isStaff()&&!r){tickAssignments();showJudgeScore();moveJudgeButtons();if(!assignmentTimer)assignmentTimer=setInterval(tickAssignments,100)}
}
// Strict all-or-nothing judge; attempts and best score are local to this demo session.
let judgeFrame=null, judgeTimeout=null, judgeSequence=0, judgeRunCode='';
const judgeHistory=new Map();
let judgePending=null;
function moveJudgeButtons(){
 const f=assignmentForm();if(!f||f.dataset.form!=='assignment:trees')return;
 const buttons=f.querySelectorAll('[data-action^="judge:"], [data-action="judge-confirm"], [data-action="judge-next"]');
 buttons.forEach(b=>{b.style.position='relative';b.style.left=(Math.floor(Math.random()*5)-2)*17+'px';b.style.top=(Math.floor(Math.random()*3)-1)*9+'px';});
}
function showJudgeScore(){
 const f=assignmentForm();if(!f)return;
 const history=judgeHistory.get('trees')||{runs:0,best:0};
 const el=f.querySelector('[data-judge-score]');
 if(el)el.textContent=`${T('Attempts:','尝试次数：')} ${history.runs} · ${T('Best strict judge score:','最佳严格判题分数：')} ${history.best}/100 (${T('all 5 exact tests required for 100','需全部 5 项精确测试通过才可得 100 分')})`;
}
function displayJudgeGate(){
 const el=assignmentForm()?.querySelector('[data-judge-results]');if(!el||!judgePending)return;
 const pending=judgePending;
 if(!pending.confirmed){
  el.innerHTML=`<p>${T('Results are locked. Confirm that you accept the unforgiving all-or-nothing grading rule. You will only see ONE result at a time; the previous result vanishes.','结果已锁定。请确认你接受零容忍的全有或全无评分规则。你一次只能看到一个结果；之前的结果会消失。')}</p><div class="judge-moving-controls"><button type="button" class="btn outline" data-action="judge-confirm">${T('I ACCEPT ZERO FOR ANY MISTAKE — Reveal results','我接受任何错误都得零分 — 显示结果')}</button></div>`;
 }else if(pending.index<pending.results.length){
  const t=pending.results[pending.index];
  el.innerHTML=`<p><strong>${T('Result','结果')} ${pending.index+1} / ${pending.results.length}</strong></p><p>${t.pass?T('PASS','通过'):T('FAIL','失败')}: ${DV(t.name)}${t.error?' — '+DV(t.error):''}</p><p>${T('All other test results remain hidden.','其他测试结果仍然隐藏。')}</p><div class="judge-moving-controls"><button type="button" class="btn outline" data-action="judge-next">${T('Hide this result and reveal next','隐藏此结果并显示下一个')}</button></div>`;
 }else{
  el.innerHTML=`<p>${T('All individual results are hidden again. This run scored','所有单项结果再次被隐藏。本次得分为')} <strong>${pending.score}/100</strong>. ${pending.score===0?T('Even one tiny mismatch means ZERO.','即使一处微小不符也得零分。'):T('Every exact test passed.','所有精确测试均通过。')}</p><p>${T('Run tests again to attempt a higher best score.','再次运行测试以尝试更高的最佳分数。')}</p>`;
 }
 moveJudgeButtons();showJudgeScore();
}
function finishJudgeRun(results, testedCode){
 const passed=results.every(t=>t.pass);
 const history=judgeHistory.get('trees')||{runs:0,best:0};
 const current=assignmentAttempts.get('trees');
 if(current){judgeAttemptScores.set('trees',{code:testedCode.trim(),score:passed?100:0});}
 history.runs++;history.best=Math.max(history.best,passed?100:0);
 judgeHistory.set('trees',history);
 judgePending={results,score:passed?100:0,confirmed:false,index:0};
 displayJudgeGate();
}
function runAssignmentJudge(id){
 if(id!=='trees'||isStaff()||state.submissions[id]||expireAssignment(id))return;
 const f=assignmentForm(),attempt=assignmentAttempts.get(id);
 if(!f||!attempt)return;
 saveAssignmentDraft(f);
 const result=f.querySelector('[data-judge-results]');
 const code=attempt.text;
 judgePending=null;
 if(!code.trim()){result.textContent=T('Enter JavaScript in the answer box first.','请先在答案框中输入 JavaScript 代码。');return}
 if(code.length>15000){result.textContent=T('Code exceeds the 15,000-character judge limit.','代码超过判题器 15,000 字符的限制。');return}
 if(judgeFrame)judgeFrame.remove();clearTimeout(judgeTimeout);
 const seq=++judgeSequence;
 judgeRunCode=code;
 result.textContent=T('Running exact-match tests. Previous results are hidden…','正在运行精确匹配测试。之前的结果已隐藏…');
 moveJudgeButtons();
 const source=JSON.stringify(code).replace(/</g,'\\u003c');
 const html=`<!doctype html><meta charset="utf-8"><script>
 const code=${source};
 try {
  const solve=new Function(code+'\\n; return typeof inorder === "function" ? inorder : null;')();
  if(!solve)throw new Error(${JSON.stringify(pick(['Define a function named inorder(root).','请定义一个名为 inorder(root) 的函数。']))});
  const tests=[
   {name:['Empty tree','空树'],root:null,expected:[]},
   {name:['Single node','单节点'],root:{val:7,left:null,right:null},expected:[7]},
   {name:['Three nodes','三节点'],root:{val:4,left:{val:2},right:{val:6}},expected:[2,4,6]},
   {name:['Unbalanced tree','不平衡树'],root:{val:5,left:{val:3,right:{val:4}},right:{val:9,left:{val:7}}},expected:[3,4,5,7,9]},
   {name:['Zero and negative values','零与负值'],root:{val:0,left:{val:-2},right:{val:1}},expected:[-2,0,1]}
  ];
  const results=tests.map(t=>{try{const actual=solve(t.root);return {name:t.name,pass:JSON.stringify(actual)===JSON.stringify(t.expected),actual:JSON.stringify(actual)?.slice(0,200)}}catch(e){return {name:t.name,pass:false,error:String(e).slice(0,200)}}});
  parent.postMessage({type:'campusline-judge',seq:${seq},results},'*');
 }catch(e){parent.postMessage({type:'campusline-judge',seq:${seq},error:String(e).slice(0,300)},'*')}
 <\/script>`;
 judgeFrame=document.createElement('iframe');
 judgeFrame.setAttribute('sandbox','allow-scripts');
 judgeFrame.setAttribute('title',state.lang?'隔离的作业判题器':'Isolated assignment judge');
 judgeFrame.style.display='none';judgeFrame.srcdoc=html;
 document.body.appendChild(judgeFrame);
 judgeTimeout=setTimeout(()=>{
  if(seq!==judgeSequence)return;
  judgeFrame?.remove();judgeFrame=null;
  finishJudgeRun([{name:['Execution time limit (2 seconds)','执行超时（2 秒）'],pass:false,error:['Time limit exceeded','已超时']}],code);
 },2000);
}
window.addEventListener('message',event=>{
 const msg=event.data;
 if(!msg||msg.type!=='campusline-judge'||msg.seq!==judgeSequence||event.source!==judgeFrame?.contentWindow)return;
 clearTimeout(judgeTimeout);judgeFrame?.remove();judgeFrame=null;
 if(!assignmentForm()?.querySelector('[data-judge-results]'))return;
 if(msg.error){finishJudgeRun([{name:['Compilation / runtime error','编译 / 运行时错误'],pass:false,error:msg.error}],judgeRunCode);return}
 finishJudgeRun(msg.results,judgeRunCode);
});
function newThread(){
 const v=ui.page==='course'?ui.course:ui.filter==='all'?0:ui.filter;
 openDialog(T('New discussion','发起讨论'),form('thread',`<label class="field">${T('Course','课程')}<select name="course" data-testid="discussion-course">${courseSelect(v,false)}</select></label>`+field('title',T('Topic title','主题标题'))+field('body',T('Message','内容'),{area:true}),T('Post discussion','发布讨论')));
}
function stopBreath(){clearInterval(breathTimer);breathTimer=null;lastPhase=''}
function breathing(){
 const b=$('#breathe'), status=$('#breathe-status'), label=$('#breathe-label'), btn=$('[data-testid=breath-button]');
 if(!b)return;
 const reset=(finished=false)=>{stopBreath();b.removeAttribute('data-state');label.textContent=finished?T('Done','完成'):T('Ready','准备');status.textContent=finished?T('Break complete. Take your time returning to study.','练习结束。可以慢慢回到学习中。'):T('Break stopped.','练习已停止。');btn.innerHTML=`${Ic('play')}${T('Start breathing break','开始呼吸练习')}`;icons()};
 if(breathTimer){reset();return}
 breathStart=Date.now();btn.innerHTML=`${Ic('square')}${T('Stop breathing break','停止呼吸练习')}`;icons();
 const tick=()=>{const sec=Math.floor((Date.now()-breathStart)/1000);if(sec>=60){reset(true);return}const phase=sec%10<4?'inhale':'exhale';if(phase!==lastPhase){lastPhase=phase;b.dataset.state=phase;label.textContent=phase==='inhale'?T('Breathe in','吸气'):T('Breathe out','呼气');status.textContent=`${label.textContent} · ${60-sec} ${T('seconds left','秒剩余')}`}};
 tick();breathTimer=setInterval(tick,125);
}
function roleDialog(){
 openDialog(T('Switch demo role','切换演示身份'),`<p>${T('Use the same sample coursework to see both sides of the teaching workflow. This does not sign you into an account.','使用同一套示例课程体验教学的两端。此操作不会登录任何账户。')}</p><div class="form-actions">${button(T('Student view','学生视图'),'role:student',{kind:isStaff()?'btn outline':'btn',left:'graduation-cap'})}${button(T('Instructor view','教师视图'),'role:instructor',{kind:isStaff()?'btn':'btn outline',left:'presentation'})}</div>`);
}
function clickAction(e){
 const target=e.target.closest('[data-action]');
 if(!target||target.disabled)return;
 const [action,value]=target.dataset.action.split(':');
 switch(action){
 case 'confirm-destination': {if(!pendingDestination)break;const next=pendingDestination;pendingDestination=null;modal.close();go(next);break;}
 case 'cancel-destination': {pendingDestination=null;modal.close();toast(T('Navigation request withdrawn. Return to directory and try again.','导航请求已撤回。请返回目录重试。'));break;}
 case 'crumb': {go('search');break;const index=value==='root'?0:Number(value);const item=breadcrumbTrail[index];if(!item){go('dashboard');break;}breadcrumbTrail.splice(index);stopBreath();Object.assign(ui,{page:item.page,course:item.course,thread:item.thread,menu:false,filter:'all'});render();break;}
 case 'dismiss': {const index=Number(value);if(!state.notices[index]||pendingDismissals.has(index))break;const button=target;let remaining=5;button.disabled=true;button.textContent=`${T('Dismissing in','即将忽略')} ${remaining}${T('s','秒')}`;const interval=setInterval(()=>{remaining--;if(remaining>0){button.textContent=`${T('Dismissing in','即将忽略')} ${remaining}${T('s','秒')}`;return;}clearInterval(interval);pendingDismissals.delete(index);state.notices.splice(index,1);render();toast(T('Notification dismissed after mandatory waiting period.','强制等待结束后通知已忽略。'));},1000);pendingDismissals.set(index,interval);break;}
 case 'go': if(modal.open)modal.close();go(value==='search'?'search':'search');break;
 case 'menu': ui.menu=!ui.menu;render();if(ui.menu)$('.rail .brand').focus();else $('.mobile-menu').focus();break;
 case 'lang': stopBreath();state.lang=1-state.lang;window.__campusLang=state.lang;try{localStorage.setItem('campusline.lang',state.lang?'zh':'en')}catch{};render();$('[data-testid=language]').focus();window.dispatchEvent(new Event('campuslangchange'));break;
 case 'roles': roleDialog();break;
 case 'role': state.role=value;modal.close();go('search');break;
 case 'close': preserveAssignmentDraft();modal.close();break;
 case 'course': go('course',{course:Number(value)});break;
 case 'continue': {
  const i=courses.findIndex((_,j)=>activeModule(j)>=0);
  if(i>=0)go('course',{course:i,openModule:activeModule(i)});else go('courses');break;
 }
 case 'tab': ui.tab=value;ui.openModule=null;render();$(`[data-testid=tab-${value}]`)?.focus();break;
 case 'module': {const j=Number(value);const current=complete(ui.course,j);state.modules[ui.course]??={};state.modules[ui.course][j]=!current;ui.openModule=j;render();$(`[data-testid=module-${j}]`)?.focus({preventScroll:true});break}
 case 'assignment': assignmentDialog(value);break;
 case 'judge': runAssignmentJudge(value);break;
 case 'resubmit': startResubmission(value);break;
 case 'judge-confirm': if(judgePending){judgePending.confirmed=true;displayJudgeGate()}break;
 case 'judge-next': if(judgePending?.confirmed){judgePending.index++;displayJudgeGate()}break;
 case 'notice': {const n=state.notices[Number(value)];n.read=true;go('search');break}
 case 'readall': state.notices.forEach(n=>n.read=true);render();$('#main').focus({preventScroll:true});break;
 case 'thread': go('thread',{thread:value});break;
 case 'newthread': newThread();break;
 case 'newmodule': if(isStaff())openDialog(T('Publish a course module','发布课程模块'),form('module',field('title',T('Module title','模块标题'))+field('body',T('Lesson content','课程内容'),{area:true}),T('Publish module','发布模块')));break;
 case 'breath': breathing();break;
 case 'helpform': openDialog(T('Create demo request','创建演示请求'),form('help',field('title',T('Subject','主题'))+field('body',T('Describe the issue (use fictional details)','描述问题（请使用虚构信息）'),{area:true}),T('Record demo request','记录演示请求')));break;
 case 'human-help': state.humanHelp=true;render();$('[data-testid=human-help-queue]')?.scrollIntoView({block:'nearest'});break;
 case 'pay': beginDemoPayment();break;
 }
}
document.addEventListener('click',clickAction);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.menu&&!modal.open){ui.menu=false;render();$('.mobile-menu').focus()}});
document.addEventListener('change',e=>{if(e.target.id==='course-filter'){ui.filter=e.target.value;render();$('#course-filter').focus()}});
document.addEventListener('submit',e=>{
 if(e.target.id==='professor-student-search'){
  e.preventDefault();
  if(!isStaff()||ui.page!=='dashboard')return;
  const typed=document.getElementById('professor-student-input')?.value.trim()||'';
  const record=sampleStudentRecords.find(r=>r.name===typed);
  const error=document.getElementById('professor-student-error');
  const result=document.getElementById('professor-student-result');
  if(error)error.textContent=record?'':T('NO MATCH: Exact spelling and capitalization required. Open HELP BOX for sample names.','无匹配：需要拼写和大小写完全一致。请打开帮助框查看示例姓名。');
  if(result)result.innerHTML=record?studentSearchResult(record):'';
  return;
 }
 if(e.target.id==='destination-search'){
  e.preventDefault();const raw=$('#destination-input').value.trim().toLowerCase();
  const dest=normalizeDest(raw);
  if(dest){pendingDestination=isStaff()?facultyRoutes[dest]:dest;openDialog(T('MANDATORY DESTINATION CONSENT','强制目的地确认'),`<div class="destination-consent"><p class="consent-alarm">${T('NAVIGATION REQUEST UNDER REVIEW','导航请求正在审核中')}</p><h3>${T('Do you REALLY want to go to','你真的要前往')} ${esc(raw.toUpperCase())}?</h3><p>${T('This action may expose additional deadlines, grades, or unresolved administrative obligations. You can still refuse.','此操作可能会暴露更多截止日期、成绩或未解决的事务。你仍然可以拒绝。')}</p><div class="consent-buttons">${button(T('No, return to search','不，返回搜索'),'cancel-destination',{kind:'btn outline'})}${button(T('Yes, I insist on entering','是，我坚持进入')+' '+esc(raw),'confirm-destination',{kind:'btn'})}</div></div>`);return;}
  $('#destination-error').textContent=T('ACCESS DENIED: Unrecognized destination. Copy one of the help words exactly.','访问被拒绝：无法识别该目的地。请准确复制提示词之一。');return;
 }
 const f=e.target;if(!f.dataset.form)return;e.preventDefault();
 const [action,id]=f.dataset.form.split(':'), data=new FormData(f), get=k=>String(data.get(k)||'').trim();
 const fail=msg=>{const p=$('[data-error]',f);if(p){p.hidden=false;p.textContent=msg}};
 if(['thread','module','help'].includes(action)&&(!get('title')||!get('body'))){fail(T('Enter a title and a message.','请输入标题和内容。'));return}
 if(action==='assignment'&&!isStaff()){
  if(expireAssignment(id)||state.submissions[id])return;
  saveAssignmentDraft(f);
  const attempt=assignmentAttempts.get(id);if(!attempt||attempt.queueTimer)return;
  if(!attempt.text.trim()&&!attempt.file){fail(T('Add an answer or attach a sample file before submitting.','提交前请填写答案或附上示例文件。'));return}
  if(attempt.routes.length!==1){fail(attempt.routes.length?T(`You selected ${attempt.routes.length} routes. Deselect all but ONE before finalizing.`,`你选择了 ${attempt.routes.length} 种方式，请取消多余选项，最终只能保留一种。`):T('Please choose ONE submission route.','请选择一种提交方式。'));return}
  if(!attempt.ack){fail(T('Please acknowledge the portal notice.','请勾选已阅读门户提示。'));return}
  $('[data-error]',f).hidden=true;
  const btn=$('button[type=submit]',f), confirmation=$('[data-confirmation]',f);
  confirmation.hidden=false;
  const selectedRoute=pick(submissionRoutes.find(route=>route.id===attempt.routes[0]).label);
  const confirmations=[
   [`Confirm submission route: ${selectedRoute}. The timer is still running.`,`确认提交方式：${selectedRoute}。倒计时仍在继续。`],
   ['Confirm that your answer and sample file are ready to submit.','确认你的答案和示例文件已准备好提交。'],
   ['Confirm that this submission is final and cannot be edited afterward.','确认此提交为最终版本，提交后无法继续编辑。'],
   ['Final confirmation: submit this assignment? The 10-second portal queue counts toward your 60 seconds.','最终确认：提交此作业？10 秒的门户排队也计入 60 秒时限。']
  ];
  if(attempt.step<confirmations.length){
   const message=pick(confirmations[attempt.step]);attempt.step++;
   confirmation.textContent=`${pick(['Confirmation','确认'])} ${attempt.step}/${confirmations.length} · ${message}`;
   btn.textContent=attempt.step===confirmations.length?pick(['Confirm 4/4: submit','确认 4/4：提交']):pick([`Confirm ${attempt.step}/4`,`确认 ${attempt.step}/4`]);
   return;
  }
  btn.disabled=true;btn.textContent=pick(['Waiting in portal queue (10 seconds)…','正在门户队列中等待（10 秒）…']);
  attempt.queueTimer=setTimeout(()=>{attempt.queueTimer=null;if(expireAssignment(id)||state.submissions[id])return;recordAssignment(id)},assignmentQueueMs);
  return;
 }
 if(action==='grade'&&isStaff()&&state.submissions[id]){
  const score=Number(get('score'));
  if(get('score')===''||score<0||score>100||!Number.isInteger(score)){fail(T('Enter a whole number from 0 to 100.','请输入 0 到 100 的整数。'));return}
  Object.assign(state.submissions[id],{score,feedback:get('feedback')});
  localizedNotice(['New assignment grade posted','新作业成绩已发布'],assignments.find(a=>a.id===id).name,'grades','award','teal');
  modal.close();render();$(`[data-testid=assignment-${id}]`)?.focus({preventScroll:true});toast(T('Grade published','成绩已发布'));return;
 }
 if(action==='attendance-quiz'&&!isStaff()){
  const course=Number(id), challenge=attendanceChallenges[course];
  if(Number(get('answer'))!==challenge.correct){fail(T('Incorrect. Attendance denied. Review the class and try again.','回答错误。出勤未予记录。请复习课程内容后重试。'));return;}
  state.studentAttendance??={};state.studentAttendance[course]=true;render();toast(T('Attendance recorded after knowledge verification.','通过知识验证后出勤已记录。'));return;
 }
 if(action==='attendance'&&isStaff()){
  state.records[id]=Object.fromEntries(people.map((_,j)=>[j,get(`student${j}`)]));render();$('[data-testid=save-attendance]').focus();return;
 }
 if(action==='thread'){
  const th={id:`thread-${state.threads.length+1}`,course:Number(get('course')),title:get('title'),body:get('body'),author:name(),replies:[]};
  state.threads.unshift(th);modal.close();go('thread',{thread:th.id});return;
 }
 if(action==='reply'){
  if(!get('body')){const area=$('textarea',f);area.setCustomValidity(pick(['Enter a reply.','请输入回复。']));area.reportValidity();area.addEventListener('input',()=>area.setCustomValidity(''),{once:true});return}
  state.threads.find(t=>t.id===ui.thread).replies.push({body:get('body'),author:name()});render();$('[data-testid=reply-body]').focus();return;
 }
 if(action==='module'&&isStaff()){
  const i=ui.course;state.modules[i]??={};state.modules[i].added??=[];state.modules[i].added.push({topic:[get('title'),get('title')],body:[get('body'),get('body')]});
  localizedNotice(['New course module published','新课程模块已发布'],[get('title'),get('title')],`course:${i}`);modal.close();ui.openModule=courseModules(i).length-1;render();$(`[data-testid=module-${ui.openModule}]`)?.focus();toast(T('Module published','模块已发布'));return;
 }
 if(action==='help'){state.ticket=`HELP-2026-${String((state.requestCount=(state.requestCount||0)+1)).padStart(3,'0')}`;modal.close();render();$('#main').focus();return}
 if(action==='pay'){beginDemoPayment();return}
});
const mobileQuery=matchMedia('(max-width:680px)');
mobileQuery.addEventListener('change',()=>{ui.menu=false;$('.rail').inert=mobileQuery.matches;$('.shell').classList.remove('menu-open');$('.mobile-menu').setAttribute('aria-expanded','false')});
window.addEventListener('pageshow',reconcileDemoPayment);
window.addEventListener('focus',reconcileDemoPayment);
reconcileDemoPayment();
render();


// Deliberately difficult but solvable local entry verification; never sends data away.
let entryVerified=false, captchaPuzzle=null;
let sessionTimeoutId=null;
const SESSION_LENGTH_MS=150000;
function resetSessionClock(){
 clearTimeout(sessionTimeoutId);
 sessionTimeoutId=setTimeout(()=>{
   entryVerified=false;
   clearInterval(ratingPromptTimer);
   document.getElementById('campus-rate-prompt')?.remove();
   if(modal.open)modal.close();
   document.getElementById('hate-advice')?.remove();
   // Do not discard saved submissions or grades; only revoke access.
   go('search');
   showEntryCaptcha();
   const message=document.createElement('p');
   message.className='session-expired-message';
   message.textContent=T('SESSION EXPIRED: 150 seconds elapsed. Complete access verification again.','会话已过期：已过去 150 秒。请重新完成访问验证。');
   document.querySelector('.hate-captcha')?.prepend(message);
 },SESSION_LENGTH_MS);
}

function newCaptcha(){
 const a=37+Math.floor(Math.random()*62), b=19+Math.floor(Math.random()*54), c=11+Math.floor(Math.random()*29);
 captchaPuzzle={answer:a*b-c, question:`(${a} × ${b}) − ${c}`};
 const gate=document.getElementById('hate-entry-gate');
 if(gate){gate.querySelector('[data-captcha-question]').textContent=captchaPuzzle.question;gate.querySelector('input').value='';gate.querySelector('[data-captcha-error]').textContent='';}
}
function showEntryCaptcha(){
 if(entryVerified||document.getElementById('hate-entry-gate'))return;
 const gate=document.createElement('div');gate.id='hate-entry-gate';gate.className='hate-entry-gate';
 gate.innerHTML=`<div class="hate-captcha"><h2>${T('MANDATORY ACCESS VERIFICATION','强制访问验证')}</h2><p>${T('To enter Campusline, compute the following expression. No calculator is provided.','要进入 Campusline，请计算以下表达式。不提供计算器。')}</p><strong data-captcha-question></strong><form id="hate-captcha-form"><label>${T('Exact numeric answer','精确数值答案')} <input required inputmode="numeric" autocomplete="off" aria-label="${T('CAPTCHA answer','验证码答案')}"></label><button type="submit" class="btn">${T('Verify entry','验证并进入')}</button></form><label style="display:block;margin-top:14px;font-size:12px;line-height:1.4;cursor:pointer"><input type="checkbox" data-captcha-disagree style="width:14px;height:14px;vertical-align:middle;margin:0 5px 0 0"> ${T("I do not agree to this website's privacy policy",'我不同意该网站的隐私协议')}</label><p data-captcha-error role="alert"></p><button type="button" class="btn outline" id="hate-refresh-captcha">${T('Regenerate an even newer challenge','重新生成一个更新的题目')}</button></div>`;
 document.body.appendChild(gate);newCaptcha();
 gate.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(gate.querySelector('[data-captcha-disagree]').checked){gate.querySelector('[data-captcha-error]').textContent=T('Consent to the privacy policy is required to continue.','需要同意隐私协议才能继续。');return;}const value=Number(gate.querySelector('input').value.trim());if(value===captchaPuzzle.answer){entryVerified=true;gate.remove();go('search');resetSessionClock();startRatePrompts();window.campusDrone?.start();}else{newCaptcha();gate.querySelector('[data-captcha-error]').textContent=T('Incorrect. The entire challenge has been replaced.','答案错误。整道题目已被替换。');}});
 gate.querySelector('#hate-refresh-captcha').addEventListener('click',newCaptcha);
}
const intrusiveAdvice=[
 ['Reminder: Reading the instructions may improve your understanding of the instructions.','提醒：阅读说明可能有助于你理解这些说明。'],
 ['Helpful tip: Correct answers are generally preferable to incorrect ones.','小提示：正确答案通常比错误答案更可取。'],
 ['Please remember that grades are numbers, but numbers are not always grades.','请记住，成绩是数字，但数字并不总是成绩。'],
 ['Efficiency suggestion: Consider clicking the button you intended to click.','效率建议：请考虑点击你本来想点击的按钮。'],
 ['You can improve performance by performing better.','你可以通过表现得更好来提升表现。']
];
function interruptWithAdvice(){
 if(document.getElementById('hate-advice'))return;
 const el=document.createElement('div');el.id='hate-advice';el.className='hate-advice';el.setAttribute('role','status');el.innerHTML=`<strong>${T('UNREQUESTED ACADEMIC ADVICE','多余的学业建议')}</strong><p>${DV(intrusiveAdvice[Math.floor(Math.random()*intrusiveAdvice.length)])}</p>`;
 document.body.appendChild(el);setTimeout(()=>el.remove(),1100);
}
setInterval(()=>{if(entryVerified)interruptWithAdvice()},17000);

// Intentionally repetitive simulated Play Store rating prompt (no external redirect).
let ratingPromptTimer=null;
function showRatePrompt(){
 if(!entryVerified || document.getElementById('campus-rate-prompt'))return;
 const notice=document.createElement('aside');
 notice.id='campus-rate-prompt';
 notice.setAttribute('role','dialog');
 notice.setAttribute('aria-label',T('Rate this app reminder','为此应用评分提醒'));
 notice.innerHTML=`<div class="rate-prompt-heading">★★★★★ ${T('RATE CAMPUSLINE ON PLAY STORE','在 PLAY STORE 为 CAMPUSLINE 评分')}</div><p>${T('Your opinion is extremely important. Please rate this app immediately.','你的意见极其重要。请立即为此应用评分。')}</p><div class="rate-prompt-actions"><button type="button" data-rate-dismiss>${T('NOT NOW','暂不')}</button><button type="button" data-rate-confirm>${T('RATE APP','为应用评分')} ★★★★★</button></div><small>${T('This is a demo notification. No Play Store listing is linked.','这是一条演示通知。未链接任何 Play Store 页面。')}</small>`;
 document.body.appendChild(notice);
 notice.querySelector('[data-rate-dismiss]').addEventListener('click',()=>notice.remove());
 notice.querySelector('[data-rate-confirm]').addEventListener('click',()=>{
   notice.querySelector('p').textContent=T('Thank you. Your rating request has been recorded for this demo. You will be reminded again.','谢谢。你的评分请求已在此演示中记录。你还会再次收到提醒。');
   notice.querySelector('.rate-prompt-actions').remove();
 });
}
function startRatePrompts(){
 clearInterval(ratingPromptTimer);
 document.getElementById('campus-rate-prompt')?.remove();
 ratingPromptTimer=setInterval(showRatePrompt,20000);
}

showEntryCaptcha();
