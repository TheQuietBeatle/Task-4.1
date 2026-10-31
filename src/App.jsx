import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-course-pulse-v2';

// Fictional teaching records for the self-contained UI/UX exercise.
// Staff names and course descriptions are examples, not GUC historical records.
const COURSE_CATALOG = {
  CSEN701: {
    name: 'Advanced Computer Lab',
    description: 'A project-focused course emphasizing teamwork, planning, software development, and delivery across several milestones.',
    history: [
      {year: '2025/26', instructors: ['Dr. Mariam Farouk'], tas: ['Yara Hassan', 'Omar Fawzy']},
      {year: '2024/25', instructors: ['Dr. Karim Nabil'], tas: ['Nour Adel', 'Mina Sameh']},
    ],
  },
  MATH204: {
    name: 'Linear Algebra',
    description: 'Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.',
    history: [
      {year: '2025/26', instructors: ['Dr. Salma Younis'], tas: ['Layla Maher', 'Ahmed Sherif']},
      {year: '2024/25', instructors: ['Dr. Rana Hamdy'], tas: ['Youssef Tarek', 'Dina Mourad']},
    ],
  },
  CSEN401: {
    name: 'Software Engineering',
    description: 'Software requirements, architecture, implementation practices, testing, and collaborative development.',
    history: [
      {year: '2025/26', instructors: ['Dr. Tamer Elsayed'], tas: ['Rana Fathy', 'Adham Khalil']},
      {year: '2024/25', instructors: ['Dr. Hala Mansour'], tas: ['Malak Samir', 'Ali Mahmoud']},
    ],
  },
  HUMA101: {
    name: 'Critical Thinking & Communication',
    description: 'A discussion-based course about assessing arguments, presenting ideas, and communicating effectively.',
    history: [
      {year: '2025/26', instructors: ['Dr. Dina Saad'], tas: ['Mariam Hossam', 'Youssef Nader']},
      {year: '2024/25', instructors: ['Dr. Reem Taha'], tas: ['Farah Amr', 'Sara Magdy']},
    ],
  },
  CSEN202: {
    name: 'Data Structures',
    description: 'Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.',
    history: [
      {year: '2025/26', instructors: ['Dr. Amina Rashed'], tas: ['Rami Elshamy', 'Nada Wael']},
      {year: '2024/25', instructors: ['Dr. Yasser Salem'], tas: ['Hana Ehab', 'Bassel Mostafa']},
    ],
  },
};
const getCourse = code => COURSE_CATALOG[code?.toUpperCase()] || {
  name: 'Course details not yet added',
  description: 'This course does not have a profile in the example catalog.',
  history: [],
};
const readRoute = () => {
  const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const seed = [
  {id:'r1',courseCode:'CSEN701',rating:4,comment:'A challenging team project. The weekly milestones helped.',owner:'you',name:'You',date:'2026-10-06'},
  {id:'r2',courseCode:'CSEN701',rating:5,comment:'You learn the most when your group communicates well.',owner:'other',name:'Farida',date:'2026-10-02'},
  {id:'r3',courseCode:'MATH204',rating:3,comment:'Useful material but the pace felt fast.',owner:'other',name:'Karim',date:'2026-09-28'},
  {id:'r4',courseCode:'CSEN401',rating:4,comment:'Tutorial exercises are very important.',owner:'you',name:'You',date:'2026-09-24'},
  {id:'r5',courseCode:'HUMA101',rating:5,comment:'Well organized and approachable.',owner:'other',name:'Mariam',date:'2026-09-21'},
  {id:'r6',courseCode:'CSEN701',rating:3,comment:'Good practical work, but demanding during exam week.',owner:'other',name:'Youssef',date:'2026-09-15'},
  {id:'r7',courseCode:'MATH204',rating:5,comment:'Excellent explanation of difficult concepts.',owner:'other',name:'Nadine',date:'2026-08-30'},
  {id:'r8',courseCode:'CSEN401',rating:2,comment:'More worked examples in lectures would help.',owner:'other',name:'Adam',date:'2026-08-17'},
  {id:'r9',courseCode:'CSEN202',rating:4,comment:'The assignments strengthened problem-solving skills.',owner:'other',name:'Hassan',date:'2026-08-09'},
];
function getSaved(){try {let s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}
const avg = a => a.length?(a.reduce((s,r)=>s+r.rating,0)/a.length).toFixed(1):'—';
const stars = n => '★'.repeat(n)+'☆'.repeat(Math.max(0,5-n));
const formatDate = d => {const t=new Date(`${d}T00:00:00`);return Number.isNaN(t.getTime())?'Date not recorded':t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
const breakdown = list => [5,4,3,2,1].map(n=>({n,total:list.filter(r=>r.rating===n).length}));
// Course text is still free text; these only stop spacing and names from creating a second "course".
const compact = s => s.replace(/\s+/g,'').toUpperCase();
const resolveCourse = (text,reviews) => {
 const key=compact(text);
 if(!key)return null;
 return Object.keys(COURSE_CATALOG).find(c=>c===key||compact(COURSE_CATALOG[c].name)===key)||reviews.find(r=>compact(r.courseCode)===key)?.courseCode.toUpperCase()||null;
};
const suggestCourses = text => {
 const key=compact(text);
 return key.length<2?[]:Object.keys(COURSE_CATALOG).filter(c=>c.includes(key)||compact(COURSE_CATALOG[c].name).includes(key)).slice(0,3);
};
const RatingBars = ({list}) => {
 const rows=breakdown(list);
 const top=Math.max(...rows.map(x=>x.total),1);
 return <div className="rating-bars">{rows.map(d=><div key={d.n} className="rating-row"><span>{d.n}★</span><div className="barbg"><i style={{width:`${d.total/top*100}%`}}/></div><small>{d.total}</small></div>)}</div>;
};
const CourseOptions = () => <datalist id="course-options">{Object.keys(COURSE_CATALOG).map(c=><option key={c} value={c}>{COURSE_CATALOG[c].name}</option>)}</datalist>;
export default function App(){
 const [reviews,setReviews] = useState(getSaved);
 const [search,setSearch] = useState('');
 const [rating,setRating] = useState('all');
 const [course,setCourse] = useState('CSEN701');
 const [editor,setEditor] = useState(null);
 const [error,setError] = useState('');
 const [notice,setNotice] = useState('');
 const [noticeCourse,setNoticeCourse] = useState(null);
 const [ownerOnly,setOwnerOnly] = useState(false);
 const keepScroll = useRef(false);
 const editorStart = useRef(null);
 const editorOpen = Boolean(editor);
 const [tab,setTab] = useState('Overview');
 const [activeCourseCode,setActiveCourseCode] = useState(readRoute);
 useEffect(()=>{
  const changePage = () => {setActiveCourseCode(readRoute());setNotice('');if(keepScroll.current)keepScroll.current=false;else window.scrollTo({top:0,behavior:'instant'});};
  window.addEventListener('hashchange',changePage);
  return ()=>window.removeEventListener('hashchange',changePage);
 },[]);
 const openCourse = code => {window.location.hash=`#/courses/${encodeURIComponent(code)}`;setActiveCourseCode(code.toUpperCase());window.scrollTo({top:0,behavior:'instant'});};
 const navigateTo = (where) => {
  keepScroll.current=window.location.hash!=='#/';
  window.location.hash='#/';
  setActiveCourseCode(null);
  setNotice('');
  if(where==='reviews')requestAnimationFrame(()=>document.getElementById('review-list')?.scrollIntoView({behavior:'smooth'}));
  else window.scrollTo({top:0,behavior:'smooth'});
 };
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(reviews)),[reviews]);
 useEffect(()=>{
  if(!editorOpen)return;
  const back=document.activeElement;
  const modal=document.querySelector('.modal');
  const input=modal.querySelector('input');
  (input.value?modal.querySelector('select'):input).focus();
  return ()=>back?.focus?.();
 },[editorOpen]);
 const result = useMemo(()=>reviews.filter(r=>(!ownerOnly||r.owner==='you')&&(rating==='all'||r.rating===Number(rating))&&`${r.courseCode} ${COURSE_CATALOG[r.courseCode.toUpperCase()]?.name||''} ${r.comment} ${r.name}`.toLowerCase().includes(search.toLowerCase())),[reviews,search,rating,ownerOnly]);
 const courses = useMemo(()=>[...new Set([...Object.keys(COURSE_CATALOG),...reviews.map(r=>r.courseCode.toUpperCase())])].sort().map(code=>{const list=reviews.filter(r=>r.courseCode.toUpperCase()===code);return {code,name:getCourse(code).name,list,mine:list.some(r=>r.owner==='you')};}),[reviews]);
 const lookupCode = resolveCourse(course,reviews)||course.trim().toUpperCase();
 const selected = reviews.filter(x=>compact(x.courseCode)===compact(lookupCode));
 const filtersActive = ownerOnly||search!==''||rating!=='all';
 const uniqueCourses = [...new Set(reviews.map(x=>x.courseCode))];
 const ownReview = (code,exceptId=null) => reviews.find(r=>r.id!==exceptId&&r.owner==='you'&&compact(r.courseCode)===compact(code));
 const ownHere = activeCourseCode&&ownReview(activeCourseCode);
 const draftDirty = () => editor&&['courseCode','rating','comment'].some(k=>editor[k]!==editorStart.current[k]);
 const confirmDiscard = () => !draftDirty()||window.confirm('Discard your unsaved review?');
 const closeEditor = () => {if(confirmDiscard())setEditor(null);};
 function openEditor(r,courseCode=''){if(r&&r.owner!=='you')return;setError('');const next={id:r?.id||null, courseCode:r?.courseCode||courseCode,rating:String(r?.rating||''),comment:r?.comment||''};editorStart.current=next;setEditor(next);}
 // These controls remove themselves when clicked, which would otherwise drop focus out of the dialog.
 const focusRating = () => requestAnimationFrame(()=>document.querySelector('.modal select')?.focus());
 function switchToOwnReview(r){if(confirmDiscard()){openEditor(r);focusRating();}}
 function updateEditor(field,value){setError('');setEditor(s=>({...s,[field]:value}));}
 useEffect(()=>{
  if(!editorOpen)return;
  const onKey=e=>{
   if(e.key==='Escape'){closeEditor();return;}
   if(e.key!=='Tab')return;
   const modal=document.querySelector('.modal');
   const items=modal.querySelectorAll('button,input,select,textarea');
   const first=items[0],last=items[items.length-1];
   if(!modal.contains(document.activeElement)){e.preventDefault();first.focus();}
   else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',onKey);
  return ()=>document.removeEventListener('keydown',onKey);
 });
 function clearFilters(){setSearch('');setRating('all');setOwnerOnly(false);setTab('Browse');}
 function removeReview(r){
  if(r.owner!=='you'||!window.confirm(`Remove your review of ${r.courseCode}? This can't be undone.`))return;
  setReviews(reviews.filter(x=>x.id!==r.id));
  setNoticeCourse(null);
  setNotice(`Review removed for ${r.courseCode}.`);
  // The clicked button is gone after this, so hand focus to the message that replaces it.
  requestAnimationFrame(()=>document.querySelector('.notice-actions button:last-child')?.focus());
 }
 function submit(e){e.preventDefault();if(!editor.courseCode.trim()){setError('Enter a course code.');return;}if(!/^[1-5]$/.test(editor.rating)){setError('Rating must be from 1 to 5.');return;}const courseCode=resolveCourse(editor.courseCode,reviews)||editor.courseCode.trim().toUpperCase();if(ownReview(courseCode,editor.id)){setError('You have already reviewed this course.');return;}
 const payload={courseCode,rating:Number(editor.rating),comment:editor.comment.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
 if(editor.id){setReviews(reviews.map(r=>r.id===editor.id?{...r,...payload}:r));setNotice(`Review updated for ${courseCode}.`);}else{setReviews([{...payload,id:'r-'+Date.now()},...reviews]);setNotice(`Review posted for ${courseCode}.`);}
 setNoticeCourse(courseCode);
 setEditor(null);
 }
 function reset(){if(!window.confirm('Reset the demo? Your reviews and changes will be replaced by the example data.'))return;setReviews(seed);setSearch('');setRating('all');setOwnerOnly(false);setCourse('CSEN701');setEditor(null);setNoticeCourse(null);setNotice('Example data restored.');}
 const typedCourse = editor?.courseCode.trim()||'';
 const typedCode = editor&&resolveCourse(typedCourse,reviews);
 const typedOwn = typedCourse&&ownReview(typedCode||typedCourse,editor.id);
 const typedSuggestions = typedCourse&&!typedCode?suggestCourses(typedCourse):[];
 return <div className="review-app">
  <CourseOptions/>
  <aside className="sidebar"><div className="logo"><span>✦</span> course<span>pulse</span></div><div className="side-caption">WORKSPACE</div><button className={tab==='Overview'?'active':''} onClick={()=>{setTab('Overview');navigateTo('top');}}><span>▦</span> Overview</button><button className={tab==='Browse'?'active':''} onClick={()=>{setOwnerOnly(false);setTab('Browse');navigateTo('reviews');}}><span>≡</span> Browse reviews</button><button onClick={()=>openEditor(null)}><span>＋</span> Write a review</button><div className="side-caption gap">YOUR SPACE</div><button className={tab==='Yours'?'active':''} onClick={()=>{setSearch('');setRating('all');setOwnerOnly(true);setTab('Yours');navigateTo('reviews');}}><span>♡</span> Your reviews</button><div className="side-end"><div className="badge-face">Y</div><div><strong>Your account</strong><small>Student profile</small></div></div></aside>
  <main className="content">
   {notice&&<div className="notice" role="status"><span>{notice}</span><div className="notice-actions">{noticeCourse&&noticeCourse!==activeCourseCode&&<button type="button" className="row-edit" onClick={()=>openCourse(noticeCourse)}>View {noticeCourse}</button>}<button onClick={()=>setNotice('')} aria-label="Dismiss message">✕</button></div></div>}
   {activeCourseCode ? (
    <section className="course-detail-page">
      <button type="button" className="back-to-reviews" onClick={()=>navigateTo('reviews')}>← Back to reviews</button>
      <header className="course-hero">
        <div><p className="eyebrow">COURSE PROFILE</p><h1>{getCourse(activeCourseCode).name}</h1><p className="course-id">{activeCourseCode}</p><p className="course-description">{getCourse(activeCourseCode).description}</p></div>
        <div className="course-mini-score"><small>COURSE AVERAGE</small><strong>{avg(reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode))}</strong><span>{reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length} review(s)</span></div>
      </header>
      <div className="course-details-grid">
        <section className="panel teaching-history"><h2>Teaching history</h2><p>Instructors and teaching assistants for the previous two academic years.</p>
          {getCourse(activeCourseCode).history.length ? getCourse(activeCourseCode).history.map(entry=><div className="teaching-entry" key={entry.year}>
            <h3>{entry.year}</h3><div><small>INSTRUCTOR{entry.instructors.length===1?'':'S'}</small><span>{entry.instructors.join(', ')}</span></div><div><small>TEACHING ASSISTANTS</small><span>{entry.tas.join(', ')}</span></div>
          </div>) : <p className="history-empty">No example teaching records for this course.</p>}
          <p className="teaching-disclaimer">Illustrative course and teaching records; staff names are fictional.</p>
        </section>
        <section className="panel course-feedback"><div className="detail-review-head"><div><h2>Student reviews</h2><p>Feedback for {activeCourseCode} from the example community.</p></div>{ownHere?<div className="detail-review-actions"><button className="outline remove-review" onClick={()=>removeReview(ownHere)}>Remove your review</button><button className="post-review" onClick={()=>openEditor(ownHere)}>Edit your review</button></div>:<button className="post-review" onClick={()=>openEditor(null,activeCourseCode)}>＋ Review {activeCourseCode}</button>}</div>
          {reviews.some(r=>r.courseCode.toUpperCase()===activeCourseCode)&&<RatingBars list={reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode)}/>}
          {reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).length ? reviews.filter(r=>r.courseCode.toUpperCase()===activeCourseCode).map(r=><article className="course-review" key={r.id}>
            <div className="course-review-top"><strong>{r.name}</strong><span>{stars(r.rating)}</span></div><p>{r.comment||'No comment provided'}</p><div className="course-review-meta"><span>{formatDate(r.date)}</span>{r.owner==='you'&&<span className="review-actions"><button className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button><button className="row-remove" onClick={()=>removeReview(r)}>Remove</button></span>}</div>
          </article>) : <div className="course-review-empty">No reviews for this course yet.</div>}
        </section>
      </div>
    </section>
  ) : <><header className="page-head"><div><p className="eyebrow">ACADEMIC FEEDBACK PORTAL</p><h1>Course Review Board</h1><p>One place for course feedback, course signals and student opinions.</p></div><button className="post-review" onClick={()=>openEditor(null)}>＋ Write review</button></header>
   <section className="panel course-directory" aria-labelledby="course-directory-title"><div className="panel-head"><div><h2 id="course-directory-title">Choose a course</h2><p>Compare ratings, then open a course for its reviews and teaching history.</p></div></div><div className="course-cards">{courses.map(c=><button type="button" className="course-card" key={c.code} onClick={()=>openCourse(c.code)}><span className="course-card-top"><strong>{c.code}</strong>{c.mine&&<em>You reviewed</em>}</span><span className="course-card-name">{c.name}</span>{c.list.length?<span className="course-card-score"><b>{avg(c.list)}</b><span className="course-card-stars" aria-hidden="true">{stars(Math.round(avg(c.list)))}</span><small>{c.list.length} review{c.list.length===1?'':'s'}</small></span>:<span className="course-card-score"><small>No reviews yet</small></span>}</button>)}</div></section>
   <section className="review-list panel" id="review-list"><div className="panel-head reviews-heading"><div><h2>Explore student reviews</h2><p>Find a comment by course, rating or student. Results update as you type.</p></div><button className="outline" onClick={reset}>Reset demo</button></div><div className="searchbar"><div className="searchinput"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search reviews" placeholder="Search course name, code, comment or student"/></div><label><span>Rating</span><select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label></div>{filtersActive&&<div className="active-filters">{ownerOnly&&<span className="filter-chip">Only your reviews<button type="button" aria-label="Show reviews from everyone" onClick={()=>{setOwnerOnly(false);setTab('Browse');}}>✕</button></span>}<button type="button" className="row-edit" onClick={clearFilters}>Clear filters</button></div>}<div className="rows-wrapper"><table><thead><tr><th>Course</th><th>Stars</th><th>Student comment</th><th>Reviewer</th><th>Date</th><th>Action</th></tr></thead><tbody>{result.map(r=><tr key={r.id}><td><button type="button" className="course-link" title={`View ${getCourse(r.courseCode).name}`} onClick={()=>openCourse(r.courseCode)}><strong>{r.courseCode}</strong><small>{getCourse(r.courseCode).name}</small></button></td><td className="ratingcell">{stars(r.rating)}</td><td className="commentcell">{r.comment||'No comment provided'}</td><td>{r.name}</td><td className="datecell">{formatDate(r.date)}</td><td>{r.owner==='you'?<span className="review-actions"><button className="row-edit" onClick={()=>openEditor(r)}>Edit</button><button className="row-remove" onClick={()=>removeReview(r)} aria-label={`Remove your review of ${r.courseCode}`}>Remove</button></span>:<span className="dim">—</span>}</td></tr>)}{result.length===0&&<tr><td colSpan="6">No reviews match these filters. <button type="button" className="row-edit" onClick={clearFilters}>Clear filters</button></td></tr>}</tbody></table></div><p className="tablefoot">{result.length} of {reviews.length} reviews • Campus feedback platform</p></section>
   <h2 className="section-title">Community snapshot</h2>
   <section className="metrics"><div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong><span>Community contributions</span></div><div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong><span>Calculated across entries</span></div><div className="metric"><small>COURSES RATED</small><strong>{uniqueCourses.length}</strong><span>Unique course codes</span></div></section>
   <div className="analytic-grid"><section className="panel pulse"><div className="panel-head"><div><h2>Community rating overview</h2><p>Ratings from recent student submissions</p></div><span className="dots">···</span></div><div className="pulse-content"><div className="donut"><div><span>{avg(reviews)}</span><small>AVERAGE</small></div></div><RatingBars list={reviews}/></div></section>
    <section className="panel summary"><div className="panel-head"><div><h2>Course score lookup</h2><p>Check the average score for one course by code or name.</p></div></div><label>Course code or name<input list="course-options" value={course} onChange={e=>setCourse(e.target.value)} placeholder="Course code or name"/></label><div className="score"><span>Overall rating</span><strong>{avg(selected)}</strong><small>{selected.length} review(s)</small></div><div className="banner">Data updates as new reviews are added.</div>{course.trim()&&<button type="button" className="lookup-course-link" onClick={()=>openCourse(lookupCode)}>View course details →</button>}</section></div>
  </>}
  </main>
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&closeEditor()}><div className="modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit review':'Write a course review'}><div className="modal-title"><div><p className="eyebrow">YOUR CONTRIBUTION</p><h2>{editor.id?'Edit review':'Write a course review'}</h2><p>Share a rating and a short comment.</p></div><button onClick={closeEditor} aria-label="Close">✕</button></div><form onSubmit={submit}><label>Course code or name<input list="course-options" value={editor.courseCode} onChange={e=>updateEditor('courseCode',e.target.value)} placeholder="Start typing, e.g. Data Structures"/></label><div className="course-status" aria-live="polite">{typedOwn?<span className="status-warning">You have already reviewed {typedOwn.courseCode}. <button type="button" className="row-edit" onClick={()=>switchToOwnReview(typedOwn)}>Edit your review</button></span>:typedCode?<span className="status-ok">✓ {getCourse(typedCode).name} ({typedCode})</span>:typedCourse?<span>{typedSuggestions.length>0?<>Did you mean {typedSuggestions.map(c=><button type="button" className="suggestion" key={c} onClick={()=>{updateEditor('courseCode',c);focusRating();}}>{COURSE_CATALOG[c].name} ({c})</button>)}? Otherwise it</>:'Not a listed course: it'} will be saved as “{typedCourse.toUpperCase()}” with no course profile.</span>:<span>Pick a listed course, or type a code that isn't listed.</span>}</div><label>Overall rating<select value={editor.rating} onChange={e=>updateEditor('rating',e.target.value)}><option value="">Choose score</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} – {stars(n)}</option>)}</select></label><label>Comment<textarea value={editor.comment} rows={5} onChange={e=>updateEditor('comment',e.target.value)} placeholder="Comment (optional)"/></label>{error&&<div className="formerror" role="alert">{error}</div>}<div className="modal-actions"><button type="button" onClick={closeEditor}>Cancel</button><button className="post-review" type="submit">{editor.id?'Save review':'Submit review'}</button></div></form></div></div>}
 </div>;
}
