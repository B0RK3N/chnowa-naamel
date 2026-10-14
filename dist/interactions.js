// Interface and local progress. Existing chnowa-v1 favorites/checklists are retained.
let state;
try { state=JSON.parse(localStorage.getItem('chnowa-v1')); } catch {}
if (!state || typeof state!=='object' || Array.isArray(state)) state={};
state.favs=Array.isArray(state.favs)?state.favs.filter(id=>guides.some(g=>g.id===id)):[];
for (const key of ['checks','mode']) if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key])) state[key]={};
const urlLang=new URL(location.href).searchParams.get('lang');
let lang=(urlLang||state.lang)==='fr'?'fr':'ar', filter='all', savedOnly=false, active=null, view='all', newOnly=false;
const ix=()=>lang==='ar'?0:1;
const tr=(ar,fr)=>lang==='ar'?ar:fr;
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f\u064B-\u065F\u0670ـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase();
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
Object.assign(ui.ar,{study:'قرايتي',newGuides:'20 دليل جديد',library:'40 دليل لحياتك في تونس',libraryp:'أوراق، قراية، خدمة، نقل وفواتير. لقى خطوتك الجاية.',newonly:'الجديد',resetfilters:'فسّخ الفلاتر',statusall:'كل الحالات',statusprogress:'بديت فيهم',statusdone:'كمّلتهم',sortdefault:'الترتيب الأصلي',sortnew:'الجديد قبل',sortaz:'بالترتيب الأبجدي',footer:'40 دليل عملي · تحديث أكتوبر 2026',tickettitle:'كل خطوة<br>تقرّبك.',ticket1:'نعرف شنوّة نجهّز',ticket2:'نعرف لوين نمشي',ticket3:'نبدأ على روحي',stamp:'بالراحة',stampbold:'تتسهّل'});
Object.assign(ui.fr,{study:'Études',newGuides:'20 nouveaux guides',library:'40 guides pour le quotidien en Tunisie',libraryp:'Papiers, études, emploi, transport et factures. Trouvez votre prochaine étape.',newonly:'Nouveautés',resetfilters:'Effacer les filtres',statusall:'Tous les états',statusprogress:'En cours',statusdone:'Terminés',sortdefault:'Ordre initial',sortnew:'Les plus récents',sortaz:'Ordre alphabétique',footer:'40 guides pratiques · Mise à jour octobre 2026',tickettitle:'Chaque étape<br>vous rapproche.',ticket1:'Je sais quoi préparer',ticket2:'Je sais où aller',ticket3:'J’avance à mon rythme',stamp:'Un pas',stampbold:'à la fois'});
function persist(){try{localStorage.setItem('chnowa-v1',JSON.stringify(state));return true}catch{toast(tr('الحفظ موش متاح في المتصفّح هذا.','La sauvegarde est indisponible dans ce navigateur.'));return false}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function stepsFor(g){const steps=g.steps.map((s,i)=>({key:'base'+i,text:s[ix()]}));const mode=state.mode[g.id]||'first';for(const [i,s] of (g.extra?.[mode]||[]).entries())steps.splice(steps.length-1,0,{key:mode+i,text:s[ix()]});return steps}
function progressFor(g){const steps=stepsFor(g),checks=state.checks[g.id]||{};return {total:steps.length,done:steps.filter(s=>checks[s.key]===true).length}}
function matchesQuery(g,q){if(!q)return true;const aliases={cin:'cin',sajalni:'phone',passport:'passport',cnss:'cnss',steg:'steg',sonede:'sonede',fac:'university'};const hay=normalize([...g.title,...g.desc,g.keys,g.id,ui.ar[g.cat],ui.fr[g.cat]].join(' '));return q.split(/\s+/).every(term=>hay.includes(term)||g.id===(aliases[term]||term))}
function resetFilters(){filter='all';view='all';savedOnly=false;newOnly=false;$('#search').value='';$('#sort').value='default';$('#status').value='all';render()}
function render(){
 document.documentElement.lang=lang==='ar'?'ar-TN':'fr';document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-t]').forEach(el=>el.innerHTML=ui[lang][el.dataset.t]);
 $('#language').textContent=lang==='ar'?'FR ↗':'العربية ↗';$('#language').setAttribute('aria-label',tr('Passer en français','التبديل للعربية'));
 $('#search').placeholder=tr('شنوّة تحب تعمل؟ جرّب «تكوين» ولا «CNSS»','Essayez « formation », « CNSS » ou « facture »');
 $('#saved').textContent=ui[lang].saved+` (${state.favs.length})`;$('#saved').setAttribute('aria-pressed',String(savedOnly));
 $('#new-only').setAttribute('aria-pressed',String(newOnly));
 $('#status').setAttribute('aria-label',tr('حالة التقدّم','État de progression'));$('#sort').setAttribute('aria-label',tr('ترتيب الأدلة','Trier les guides'));
 const q=normalize($('#search').value.trim());
 let list=guides.filter(g=>(filter==='all'||g.cat===filter)&&(!savedOnly||state.favs.includes(g.id))&&(!newOnly||g.isNew)&&matchesQuery(g,q));
 list=list.filter(g=>{const p=progressFor(g);return view==='all'||(view==='progress'?p.done>0&&p.done<p.total:p.done===p.total)});
 if($('#sort').value==='new')list.sort((a,b)=>(b.reviewed||'2026-10-11').localeCompare(a.reviewed||'2026-10-11'));
 if($('#sort').value==='az')list.sort((a,b)=>a.title[ix()].localeCompare(b.title[ix()],lang));
 document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b.dataset.filter===filter;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));const n=guides.filter(g=>b.dataset.filter==='all'||g.cat===b.dataset.filter).length;b.innerHTML=`${ui[lang][b.dataset.filter]} <span class="filter-count">${n}</span>`});
 $('#count').textContent=`${list.length} / ${guides.length} `+tr('أدلة','guides');$('#empty').hidden=list.length>0;
 $('#empty-message').textContent=savedOnly&&!state.favs.length?tr('ما عندكش أدلة محفوظة. افتح دليل واضغط «احفظ الدليل».','Aucun favori. Ouvrez un guide et cliquez sur « Enregistrer ».'):tr('ما لقيناش نتيجة بالفلاتر هاذم. جرّب كلمة أخرى ولا فسّخ الفلاتر.','Aucun résultat avec ces filtres. Essayez un autre mot ou effacez les filtres.');
 $('#reset-filters').hidden=!(q||filter!=='all'||savedOnly||newOnly||view!=='all');
 $('#cards').innerHTML=list.map(g=>{const p=progressFor(g);return `<button class="card" data-id="${g.id}"><div class="card-top"><span class="icon"><svg viewBox="0 0 24 24" aria-hidden="true">${paths[g.icon]||paths.birth}</svg></span><span class="tag">${ui[lang][g.cat]}</span>${g.isNew?`<span class="new-badge">${tr('جديد','Nouveau')}</span>`:''}</div><h3>${g.title[ix()]}</h3><p>${g.desc[ix()]}</p>${p.done?`<div class="card-progress"><span>${p.done===p.total?'✓ ':''}${p.done}/${p.total} ${tr('خطوات كمّلتهم','étapes terminées')}</span><div class="progress"><span style="width:${p.done/p.total*100}%"></span></div></div>`:''}<div class="card-bottom"><span>${state.favs.includes(g.id)?'★ ':''}${p.total} ${tr('خطوات','étapes')}</span><b>${tr('نشوف الدليل ←','Voir le guide →')}</b></div></button>`}).join('');
}
function detail(){
 const g=guides.find(g=>g.id===active);if(!g)return;
 const steps=stepsFor(g),checks=state.checks[g.id]||{},p=progressFor(g);
 $('#dialog-tag').textContent=ui[lang][g.cat]+' / '+tr('دليل عملي','GUIDE PRATIQUE');
 $('#close').setAttribute('aria-label',tr('سكّر الدليل','Fermer le guide'));
 $('#detail').innerHTML=`<h2 id="guide-title" tabindex="-1">${g.title[ix()]}</h2><p>${g.desc[ix()]}</p><div class="detail-actions"><button id="favorite" aria-pressed="${state.favs.includes(g.id)}">${state.favs.includes(g.id)?tr('★ محفوظ · إلغاء الحفظ','★ Enregistré · Retirer'):tr('☆ احفظ الدليل','☆ Enregistrer')}</button><button id="share">${tr('شارك الدليل','Partager le guide')}</button><button id="print">${tr('اطبع القائمة','Imprimer')}</button><button id="reset">${tr('عاود من الأول','Réinitialiser')}</button></div>${g.extra?`<label for="mode">${tr('شنوّة وضعيتك؟','Votre situation principale :')}</label><select id="mode"><option value="first">${tr('أوّل طلب · بالغ','Première demande · adulte')}</option><option value="renew">${tr('تجديد · بالغ','Renouvellement · adulte')}</option><option value="student">${tr('تلميذ أو طالب · أوّل طلب','Élève ou étudiant · première demande')}</option><option value="minor">${tr('قاصر · أوّل طلب','Mineur · première demande')}</option></select>`:''}<div class="notice">${g.old?tr('المصدر الإداري قديم: ثبّت في القائمة الحالية والآجال والمعاليم عند المصلحة.','La source administrative est ancienne : confirmez les pièces, délais et frais actuels auprès du service.'):tr('خطوات تحضيرية: راجع المصدر للشروط والتفاصيل والآجال الحالية.','Liste de préparation : consultez la source pour les conditions, détails et délais actuels.')}${g.extra?tr(' إذا تجمع أكثر من حالة، راجع الشروط الكل في المصدر.',' Si plusieurs situations s’appliquent, consultez toutes les conditions.'):''}</div><h3>${tr('قائمتي','Ma checklist')} <small id="done" aria-live="polite">${p.done}/${p.total}</small></h3><div class="progress" role="progressbar" aria-label="${tr('تقدّمي','Ma progression')}" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.done}"><span style="width:${p.done/p.total*100}%"></span></div>${steps.map(s=>`<label class="checkrow"><input type="checkbox" data-key="${s.key}" ${checks[s.key]===true?'checked':''}><span>${s.text}</span></label>`).join('')}<h3>${tr('لوين نمشي؟','Où faire la démarche ?')}</h3><p>${g.where[ix()]}</p><h3>${tr('المصدر والتفاصيل','Source et détails')}</h3><a class="source" href="${g.source}" target="_blank" rel="noopener noreferrer">${g.sourceName} ↗</a>${(g.links||[]).map(l=>`<a class="source" href="${l[1]}" target="_blank" rel="noopener noreferrer">${l[0]} ↗</a>`).join('')}<p class="review-date">${tr('مراجعة المصدر: ','Source consultée le ')}${new Intl.DateTimeFormat(lang==='ar'?'ar-TN':'fr-FR',{dateStyle:'long',timeZone:'UTC'}).format(new Date((g.reviewed||'2026-10-11')+'T12:00:00Z'))}.</p><p class="privacy-note">${tr('تقدّمك ومحفوظاتك في المتصفّح هذا برك. ما نطلبوش وثائق ولا بيانات هوية.','Favoris et progression restent dans ce navigateur. Aucun document ni renseignement d’identité demandé.')}</p><section class="related"><h3>${tr('ينجموا يهمّوك زادة','À consulter aussi')}</h3>${guides.filter(r=>r.cat===g.cat&&r.id!==g.id).slice(0,3).map(r=>`<button data-related="${r.id}">${r.title[ix()]} ↗</button>`).join('')}</section>`;
 if(g.extra)$('#mode').value=state.mode[g.id]||'first';
}
let lastCard=null;
function openGuide(id,updateURL=true){if(!guides.some(g=>g.id===id))return;active=id;detail();if(!$('#guide').open){lastCard=document.activeElement;$('#guide').showModal()}$('#guide').scrollTop=0;$('#guide-title').focus();if(updateURL)history.replaceState(null,'',`#guide/${id}`)}
$('#cards').addEventListener('click',e=>{const card=e.target.closest('[data-id]');if(card)openGuide(card.dataset.id)});
$('#close').onclick=()=>$('#guide').close();
$('#guide').addEventListener('close',()=>{if(location.hash.startsWith('#guide/'))history.replaceState(null,'',location.pathname+location.search+'#guides');active=null;if(lastCard?.isConnected)lastCard.focus()});
$('#guide').addEventListener('click',e=>{if(e.target===$('#guide')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#detail').addEventListener('click',async e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.related){openGuide(button.dataset.related);return}
 if(button.id==='favorite'){state.favs=state.favs.includes(active)?state.favs.filter(id=>id!==active):[...state.favs,active];persist();render();detail();$('#favorite').focus()}
 if(button.id==='print')window.print();
 if(button.id==='reset'){state.checks[active]={};persist();render();detail();$('#reset').focus()}
 if(button.id==='share'){const url=new URL(location.href);url.searchParams.set('lang',lang);url.hash=`guide/${active}`;try{await navigator.clipboard.writeText(url.href);toast(tr('تنسخ رابط الدليل.','Lien du guide copié.'))}catch{let box=$('#share-link');if(!box){box=document.createElement('input');box.id='share-link';box.readOnly=true;box.setAttribute('aria-label',tr('رابط الدليل','Lien du guide'));button.closest('.detail-actions').after(box)}box.value=url.href;box.focus();box.select();toast(tr('انسخ الرابط هذا وابعثو.','Copiez ce lien pour le partager.'))}}
});
$('#detail').addEventListener('change',e=>{if(e.target.dataset.key){if(!state.checks[active]||typeof state.checks[active]!=='object')state.checks[active]={};state.checks[active][e.target.dataset.key]=e.target.checked;persist();const p=progressFor(guides.find(g=>g.id===active));$('#done').textContent=`${p.done}/${p.total}`;$('#detail .progress span').style.width=p.done/p.total*100+'%';$('#detail [role=progressbar]').setAttribute('aria-valuenow',String(p.done));render()}if(e.target.id==='mode'){state.mode[active]=e.target.value;persist();render();detail();$('#mode').focus()}});
$('#language').onclick=()=>{lang=lang==='ar'?'fr':'ar';state.lang=lang;persist();const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);render();if($('#guide').open)detail()};
$('#search').addEventListener('input',render);
$('#searchform').onsubmit=e=>{e.preventDefault();render();$('#guides').scrollIntoView({behavior:'smooth'})};
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{resetFilters();$('#search').value=b.dataset.query;render();$('#guides').scrollIntoView({behavior:'smooth'})});
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});
$('#saved').onclick=()=>{savedOnly=!savedOnly;filter='all';view='all';newOnly=false;$('#status').value='all';$('#search').value='';render();$('#guides').scrollIntoView({behavior:'smooth'})};
$('#new-only').onclick=()=>{newOnly=!newOnly;render()};
$('#status').onchange=e=>{view=e.target.value;render()};$('#sort').onchange=render;
$('#reset-filters').onclick=resetFilters;$('#empty-reset').onclick=resetFilters;
function openHash(){if(location.hash.startsWith('#guide/'))openGuide(location.hash.slice(7),false);else if($('#guide').open)$('#guide').close()}
window.addEventListener('hashchange',openHash);
render();openHash();
