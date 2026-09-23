const STORAGE_KEY = "nexera-mvp-v1";
const initialState = {
  profiles: [
    { id: "discount", name: "Duyệt giảm giá khách hàng hiện hữu", owner: "Nguyên Phương · CEO", recipient: "Thu Hà · Trưởng phòng Kinh doanh", scope: "Khách hiện hữu · Sản phẩm A & B · Miền Bắc", selfMax: 8, consultMax: 12, exceptions: "Khách hàng chiến lược, công nợ quá hạn, thay đổi điều khoản thanh toán", start: "01/09/2026", review: "01/10/2026", status: "active", version: "1.0", executions: [
      { id:"e1", customer:"Công ty An Phát", amount:6, outcome:"Đã duyệt", class:"self", date:"19/09/2026", note:"Đủ điều kiện, tự xử lý" },
      { id:"e2", customer:"Hải Nam Trading", amount:10, outcome:"Đã tham vấn", class:"consult", date:"18/09/2026", note:"Tham vấn theo ngưỡng" },
      { id:"e3", customer:"Tân Thành Group", amount:15, outcome:"Chờ CEO", class:"escalate", date:"18/09/2026", note:"Vượt giới hạn 12%" },
      { id:"e4", customer:"Minh Quang JSC", amount:7, outcome:"Đã duyệt", class:"self", date:"17/09/2026", note:"Đủ điều kiện, tự xử lý" },
      { id:"e5", customer:"Đông Á Corp", amount:5, outcome:"Đã duyệt", class:"self", date:"16/09/2026", note:"Đủ điều kiện, tự xử lý" }
    ]},
    { id: "purchase", name: "Duyệt mua bổ sung vật tư", owner: "Nguyên Phương · CEO", recipient: "Minh Quân · Trưởng vận hành", scope: "Nhà cung cấp đã duyệt · Vật tư đóng gói", selfMax: 25, consultMax: 40, exceptions: "Nhà cung cấp mới, vượt ngân sách tháng", start: "10/09/2026", review: "10/10/2026", status: "active", version: "1.0", executions: [
      { id:"e6", customer:"Vật tư An Khang", amount:18, outcome:"Đã duyệt", class:"self", date:"19/09/2026", note:"Trong hạn mức" },
      { id:"e7", customer:"Bao bì Hoàng Long", amount:48, outcome:"Chờ CEO", class:"escalate", date:"17/09/2026", note:"Vượt giới hạn 40 triệu" }
    ]},
    { id: "complaint", name: "Xử lý khiếu nại giao hàng thông thường", owner: "Nguyên Phương · CEO", recipient: "Hồng Nhung · CSKH", scope: "Đơn hàng dưới 50 triệu · không có khiếu nại lặp lại", selfMax: 2, consultMax: 4, exceptions: "Khách hàng chiến lược, nguy cơ pháp lý", start: "15/09/2026", review: "15/10/2026", status: "draft", version: "1.0", executions: [] }
  ],
  knowledge: [
    { title:"Chính sách giá V3", type:"PDF", linked:"Duyệt giảm giá khách hàng hiện hữu", updated:"18/09/2026" },
    { title:"Checklist duyệt giảm giá", type:"Checklist", linked:"Duyệt giảm giá khách hàng hiện hữu", updated:"18/09/2026" },
    { title:"Quy trình mua vật tư chuẩn", type:"SOP", linked:"Duyệt mua bổ sung vật tư", updated:"12/09/2026" }
  ]
};

let state = loadState();
let currentPage = "dashboard";
let wizardStep = 1;
let wizard = {};
let executionProfileId = null;
let prefersReducedMotion = false;

const $ = (selector) => document.querySelector(selector);
const view = $("#view");
const dateText = new Intl.DateTimeFormat("vi-VN", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(new Date(2026, 8, 22));

if (window.gsap) {
  const motionMedia = gsap.matchMedia();
  motionMedia.add("(prefers-reduced-motion: reduce)", () => {
    prefersReducedMotion = true;
    return () => { prefersReducedMotion = false; };
  });
  gsap.defaults({ duration: 0.45, ease: "power2.out" });
}

function loadState(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(initialState); } catch { return structuredClone(initialState); } }
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateBadge(); }
function activeProfiles(){ return state.profiles.filter(p => p.status === "active"); }
function allExecutions(){ return state.profiles.flatMap(p => p.executions.map(e => ({...e, profile:p}))); }
function openExceptions(){ return allExecutions().filter(e => e.class === "escalate" && e.outcome === "Chờ CEO"); }
function updateBadge(){ $("#exceptionBadge").textContent = openExceptions().length; }
function escapeHTML(value=""){ return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;","\"":"&quot;"}[c])); }
function statusLabel(status){ return { active:"Đang hoạt động", draft:"Bản nháp", review:"Cần rà soát", self:"Tự quyết", consult:"Tham vấn", escalate:"Chuyển cấp" }[status] || status; }
function statusTag(status){ return `<span class="status ${status}">${statusLabel(status)}</span>`; }
function showToast(message){ const toast=$("#toast"); toast.textContent=message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2800); }
function fmtAmount(amount, profile){ return profile.id === "discount" ? `${amount}%` : `${amount} triệu`; }
function animateView(){
  if (!window.gsap) return;
  const groups = [$(".hero"), ...document.querySelectorAll(".metric"), ...document.querySelectorAll(".card")].filter(Boolean);
  gsap.killTweensOf(groups);
  gsap.fromTo(groups, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: prefersReducedMotion ? 0 : 0.42, stagger: prefersReducedMotion ? 0 : 0.045, overwrite: "auto" });
}
function animateDialog(dialog){
  if (!window.gsap || prefersReducedMotion) return;
  const panel = dialog.querySelector("form");
  gsap.fromTo(panel, { autoAlpha:0, y:14, scale:0.985 }, { autoAlpha:1, y:0, scale:1, duration:0.28, ease:"power3.out", overwrite:"auto" });
}

function render(){
  $("#breadcrumb").textContent = ({dashboard:"Tổng quan",profiles:"Đang chuyển giao",exceptions:"Ngoại lệ",knowledge:"Tri thức",reports:"Báo cáo"})[currentPage];
  document.querySelectorAll("#mainNav a").forEach(a=>a.classList.toggle("active",a.dataset.page===currentPage));
  ({dashboard:renderDashboard,profiles:renderProfiles,exceptions:renderExceptions,knowledge:renderKnowledge,reports:renderReports})[currentPage]();
  updateBadge();
  requestAnimationFrame(animateView);
}

function renderDashboard(){
  const active=activeProfiles(), ex=allExecutions(), self=ex.filter(e=>e.class==="self").length, escalated=ex.filter(e=>e.class==="escalate").length;
  const selfRate=ex.length ? Math.round(self/ex.length*100) : 0;
  const exceptions=openExceptions();
  view.innerHTML=`
    <div class="hero"><div><p class="eyebrow">BẢNG ĐIỀU KHIỂN LÃNH ĐẠO</p><h1>Chào anh Phương, hôm nay cần gì?</h1><p>${dateText.charAt(0).toUpperCase()+dateText.slice(1)}</p></div><span class="date-chip">◷ Dữ liệu cập nhật hôm nay</span></div>
    <div class="metric-grid">
      <article class="metric"><div class="metric-label">HỒ SƠ ĐANG HOẠT ĐỘNG</div><div class="metric-value">${active.length}</div><div class="metric-foot"><span class="trend-good">+1</span> hồ sơ trong 30 ngày</div></article>
      <article class="metric"><div class="metric-label">ĐỘI NGŨ TỰ XỬ LÝ</div><div class="metric-value">${self}<span style="font-size:16px;color:#84939b">/${ex.length}</span></div><div class="metric-foot"><span class="trend-good">${selfRate}%</span> trường hợp trong quyền</div></article>
      <article class="metric"><div class="metric-label">CẦN ANH/CHỊ XỬ LÝ</div><div class="metric-value">${exceptions.length}</div><div class="metric-foot">${escalated} trường hợp chuyển cấp</div></article>
      <article class="metric"><div class="metric-label">THỜI GIAN GIẢM CAN THIỆP</div><div class="metric-value">6.2<span style="font-size:16px;color:#84939b"> giờ</span></div><div class="metric-foot"><span class="trend-good">↓ 61%</span> so với kỳ gốc</div></article>
    </div>
    <div class="grid-2-1">
      <section class="card"><div class="card-head"><div><h3>Việc cần anh/chị chú ý</h3><p class="card-sub">Chỉ những trường hợp vượt quyền hoặc cần rà soát.</p></div><button class="link-button" data-go="exceptions">Xem tất cả →</button></div>
      ${exceptions.length ? exceptions.map(e=>`<div class="attention"><div class="attention-dot">!</div><div><strong>${escapeHTML(e.customer)}</strong><p>${escapeHTML(e.profile.name)} · Yêu cầu ${fmtAmount(e.amount,e.profile)} · ${escapeHTML(e.note)}</p></div><button class="link-button go" data-resolve="${e.id}">Xử lý →</button></div>`).join("") : `<div class="empty">Không có ngoại lệ nào đang chờ xử lý.</div>`}</section>
      <section class="card"><div class="card-head"><div><h3>Tiến độ chuyển giao</h3><p class="card-sub">Theo hồ sơ đang hoạt động</p></div></div>${active.map((p,i)=>{ const pct=Math.min(94,42+p.executions.length*9); return `<div class="progress-item"><div class="progress-label"><span>${escapeHTML(p.name)}</span><small>${p.executions.length} lần thực hiện</small></div><div class="bar"><span style="width:${pct}%"></span></div></div>`}).join("")}</section>
    </div>
    <div class="grid-equal">
      <section class="card"><div class="card-head"><div><h3>Hoạt động gần đây</h3><p class="card-sub">Những quyết định mới nhất trong Nexera.</p></div></div><div class="timeline">${ex.slice(0,5).map(e=>`<div class="timeline-item"><span>${e.date}</span><p>${escapeHTML(e.customer)} · ${statusLabel(e.class)}</p><small class="muted">${escapeHTML(e.profile.name)}</small></div>`).join("")}</div></section>
      <section class="card"><div class="card-head"><div><h3>Rà soát sắp tới</h3><p class="card-sub">Đánh giá trước khi mở rộng quyền.</p></div></div>${active.map(p=>`<div class="attention"><div class="attention-dot">◷</div><div><strong>${escapeHTML(p.name)}</strong><p>Rà soát vào ${p.review}</p></div><button class="link-button go" data-review="${p.id}">Xem →</button></div>`).join("")}</section>
    </div>`;
}

function renderProfiles(){
  view.innerHTML=`<div class="page-head"><div><p class="eyebrow">HỒ SƠ CHUYỂN GIAO</p><h1>Đang chuyển giao</h1><p class="muted">Quyền hiện hành, hướng dẫn và kết quả thực thi của đội ngũ.</p></div><button data-action="new-profile" class="primary-button">＋ Giải phóng một công việc</button></div>
  <section class="card"><div class="filter-row"><button class="filter">Tất cả trạng thái⌄</button><button class="filter">Tất cả người nhận⌄</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>HỒ SƠ</th><th>NGƯỜI NHẬN</th><th>PHẠM VI TỰ QUYẾT</th><th>PHIÊN BẢN</th><th>TRẠNG THÁI</th><th></th></tr></thead><tbody>${state.profiles.map(p=>`<tr><td><div class="profile-name">${escapeHTML(p.name)}</div><div class="subline">${escapeHTML(p.scope)}</div></td><td>${escapeHTML(p.recipient)}</td><td>≤ ${fmtAmount(p.selfMax,p)}</td><td>v${p.version}</td><td>${statusTag(p.status)}</td><td><button class="link-button" data-execute="${p.id}">${p.status==="draft"?"Kích hoạt":"Ghi nhận →"}</button></td></tr>`).join("")}</tbody></table></div></section>`;
}

function renderExceptions(){
  const exceptions=openExceptions();
  view.innerHTML=`<div class="page-head"><div><p class="eyebrow">TRƯỜNG HỢP VƯỢT PHẠM VI</p><h1>Ngoại lệ</h1><p class="muted">Đây là những quyết định thực sự cần được chuyển lên lãnh đạo.</p></div></div><section class="card"><div class="card-head"><div><h3>${exceptions.length} ngoại lệ đang chờ</h3><p class="card-sub">Không tính các trường hợp đã chuyển cấp và được xử lý.</p></div></div>${exceptions.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>YÊU CẦU</th><th>HỒ SƠ QUYỀN</th><th>LÝ DO CHUYỂN CẤP</th><th>THỜI ĐIỂM</th><th></th></tr></thead><tbody>${exceptions.map(e=>`<tr><td><div class="profile-name">${escapeHTML(e.customer)}</div><div class="subline">Yêu cầu ${fmtAmount(e.amount,e.profile)}</div></td><td>${escapeHTML(e.profile.name)}</td><td>${escapeHTML(e.note)}</td><td>${e.date}</td><td><button class="primary-button" data-resolve="${e.id}">Xử lý</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Tuyệt vời. Không có ngoại lệ nào cần xử lý.</div>`}</section>`;
}

function renderKnowledge(){ view.innerHTML=`<div class="page-head"><div><p class="eyebrow">TRI THỨC THỰC THI</p><h1>Tri thức</h1><p class="muted">Hướng dẫn, checklist và tài liệu gắn trực tiếp với quyền được giao.</p></div><button data-action="add-knowledge" class="primary-button">＋ Thêm tài liệu</button></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>TÀI LIỆU</th><th>LOẠI</th><th>GẮN VỚI HỒ SƠ</th><th>CẬP NHẬT</th><th></th></tr></thead><tbody>${state.knowledge.map((k,i)=>`<tr><td><div class="profile-name">${escapeHTML(k.title)}</div></td><td>${statusTag(k.type === "Checklist"?"self":"draft").replace(statusLabel(k.type === "Checklist"?"self":"draft"),escapeHTML(k.type))}</td><td>${escapeHTML(k.linked)}</td><td>${k.updated}</td><td><button class="link-button" data-knowledge="${i}">Xem →</button></td></tr>`).join("")}</tbody></table></div></section>`; }

function renderReports(){
  const ex=allExecutions(), self=ex.filter(e=>e.class==="self").length, consult=ex.filter(e=>e.class==="consult").length, escalated=ex.filter(e=>e.class==="escalate").length;
  view.innerHTML=`<div class="page-head"><div><p class="eyebrow">KẾT QUẢ GIAO QUYỀN</p><h1>Báo cáo</h1><p class="muted">Đo giảm can thiệp cùng chất lượng xử lý, không chỉ số lượng hồ sơ tạo ra.</p></div></div><div class="metric-grid"><article class="metric"><div class="metric-label">TỶ LỆ TỰ XỬ LÝ</div><div class="metric-value">${ex.length?Math.round(self/ex.length*100):0}%</div><div class="metric-foot">${self}/${ex.length} lần thực hiện trong quyền</div></article><article class="metric"><div class="metric-label">CHUYỂN CẤP ĐÚNG QUY TẮC</div><div class="metric-value">${escalated}</div><div class="metric-foot">Không xem đây là lỗi của người nhận</div></article><article class="metric"><div class="metric-label">CẦN THAM VẤN</div><div class="metric-value">${consult}</div><div class="metric-foot">Các tình huống cần phối hợp</div></article><article class="metric"><div class="metric-label">TỶ LỆ LÀM LẠI</div><div class="metric-value">0%</div><div class="metric-foot"><span class="trend-good">Không tăng</span> so với kỳ gốc</div></article></div><section class="card" style="margin-top:16px"><div class="card-head"><div><h3>Kết luận kỳ quan sát</h3><p class="card-sub">Dữ liệu minh họa từ các lần thực hiện đã ghi nhận.</p></div></div><div class="callout"><strong>Đã quan sát ${ex.length} lần thực hiện.</strong> Đội ngũ tự xử lý ${self} trường hợp trong phạm vi quyền; ${escalated} trường hợp được chuyển cấp theo đúng quy tắc. Trước khi diễn giải thành hiệu quả, cần đối chiếu thêm dữ liệu kỳ gốc và thời gian hướng dẫn/rà soát thực tế.</div></section>`;
}

function openDelegation(){ wizardStep=1; wizard={type:"discount",name:"Duyệt giảm giá khách hàng hiện hữu",frequency:"50",problem:"Gần như lần nào cũng phải chờ Giám đốc",goal:"Giảm ít nhất 70% đề xuất CEO phải duyệt",recipient:"Thu Hà · Trưởng phòng Kinh doanh",backup:"",scope:"Khách hàng hiện hữu · Sản phẩm A & B · Miền Bắc",selfMax:"8",consultMax:"12",special:"Khách hàng chiến lược; công nợ quá hạn; thay đổi điều khoản thanh toán",knowledge:"Chính sách giá V3 + Checklist",start:"01/10/2026",review:"01/11/2026"}; renderWizard(); const dialog=$("#delegationDialog"); dialog.showModal(); animateDialog(dialog); }
function renderWizard(){
  $("#stepper").innerHTML=Array.from({length:6},(_,i)=>`<span class="step ${i+1<wizardStep?"done":i+1===wizardStep?"current":""}"></span>`).join("");
  const pages={
    1:`<div class="form-block"><h3>Việc nào anh/chị muốn giải phóng?</h3><p>Chọn một quyết định lặp lại, rủi ro thấp hoặc vừa để bắt đầu.</p><div class="field-grid"><div class="field"><label>Tên công việc</label><input data-w="name" value="${escapeHTML(wizard.name)}" /></div><div class="field"><label>Loại</label><select data-w="type"><option value="discount">Phê duyệt theo ngưỡng</option><option value="purchase">Quyết định mua bổ sung</option><option value="other">Quyền quyết định lặp lại khác</option></select></div><div class="field"><label>Tần suất ước tính mỗi tháng</label><input data-w="frequency" type="number" value="${wizard.frequency}" /></div><div class="field"><label>Mục tiêu sau khi giao</label><input data-w="goal" value="${escapeHTML(wizard.goal)}" /></div></div><div class="field" style="margin-top:14px"><label>Vấn đề hiện tại</label><textarea data-w="problem">${escapeHTML(wizard.problem)}</textarea></div></div>`,
    2:`<div class="form-block"><h3>Ai sẽ nhận quyền này?</h3><p>Người nhận cần xác nhận họ có đủ thông tin, công cụ và thời gian để thực hiện.</p><div class="field-grid one"><div class="field"><label>Người nhận</label><select data-w="recipient"><option>Thu Hà · Trưởng phòng Kinh doanh</option><option>Minh Quân · Trưởng vận hành</option><option>Hồng Nhung · Trưởng nhóm CSKH</option></select></div><div class="field"><label>Người dự phòng (không bắt buộc)</label><input data-w="backup" placeholder="Ví dụ: Phó phòng Kinh doanh" value="${escapeHTML(wizard.backup)}" /></div></div><div class="choice-row" style="margin-top:18px"><label class="choice"><input type="checkbox" checked disabled><span><strong>Đã xác nhận điều kiện thực hiện</strong><small>Người nhận có quyền truy cập dữ liệu, công cụ và thời gian cần thiết.</small></span></label></div></div>`,
    3:`<div class="form-block"><h3>Phạm vi nào được giao?</h3><p>Viết rõ các điều kiện để người nhận biết khi nào họ được xử lý.</p><div class="field"><label>Phạm vi áp dụng</label><textarea data-w="scope">${escapeHTML(wizard.scope)}</textarea><span class="hint">Ví dụ: khách hàng hiện hữu, sản phẩm A & B, khu vực miền Bắc.</span></div><div class="field" style="margin-top:14px"><label>Ngoài phạm vi</label><input value="Khách hàng mới, hợp đồng đặc biệt" disabled /></div></div>`,
    4:`<div class="form-block"><h3>Đặt giới hạn quyền</h3><p>Ngưỡng rõ ràng giúp giảm hỏi lại, đồng thời giữ lãnh đạo ở những quyết định quan trọng.</p><div class="rule-table"><div class="rule"><label>Được tự quyết</label><input data-w="selfMax" type="number" min="0" value="${wizard.selfMax}" placeholder="8" /></div><div class="rule"><label>Cần tham vấn đến</label><input data-w="consultMax" type="number" min="0" value="${wizard.consultMax}" placeholder="12" /></div><div class="rule"><label>Bắt buộc chuyển cấp</label><input value="Trên ${wizard.consultMax || 12}" disabled /></div></div><div class="field" style="margin-top:18px"><label>Ngoại lệ đặc biệt</label><textarea data-w="special">${escapeHTML(wizard.special)}</textarea></div></div>`,
    5:`<div class="form-block"><h3>Thêm tri thức thực thi</h3><p>Quyền chỉ hữu ích khi người nhận biết cần làm gì trước khi ra quyết định.</p><div class="field"><label>Hướng dẫn / tài liệu có sẵn</label><textarea data-w="knowledge">${escapeHTML(wizard.knowledge)}</textarea><span class="hint">Ở bản production, đây là nơi tải SOP, PDF, checklist hoặc thêm tình huống mẫu.</span></div><div class="callout" style="margin-top:16px"><strong>AI Copilot (giai đoạn sau)</strong><br>AI có thể tóm tắt tài liệu và hỏi điểm còn thiếu, nhưng không tự phê duyệt hoặc đặt quyền.</div></div>`,
    6:`<div class="form-block"><h3>Kiểm tra và kích hoạt</h3><p>Hệ thống sẽ tạo phiên bản quyền 1.0. Mọi thay đổi sau này được lưu thành phiên bản mới.</p><div class="callout"><strong>${escapeHTML(wizard.name)}</strong><br><br>Người nhận: ${escapeHTML(wizard.recipient)}<br>Phạm vi: ${escapeHTML(wizard.scope)}<br>Tự quyết: ≤ ${wizard.selfMax}${wizard.type==="discount"?"%":" triệu"}<br>Tham vấn: đến ${wizard.consultMax}${wizard.type==="discount"?"%":" triệu"}<br>Chuyển cấp: trên ${wizard.consultMax}${wizard.type==="discount"?"%":" triệu"}<br>Ngoại lệ: ${escapeHTML(wizard.special)}</div><div class="field-grid" style="margin-top:16px"><div class="field"><label>Ngày áp dụng</label><input data-w="start" type="date" value="${toISO(wizard.start)}" /></div><div class="field"><label>Ngày rà soát đầu tiên</label><input data-w="review" type="date" value="${toISO(wizard.review)}" /></div></div></div>`
  };
  $("#wizardBody").innerHTML=pages[wizardStep]; $("#wizardNext").textContent=wizardStep===6?"Phê duyệt & kích hoạt":"Tiếp tục"; $("#wizardBack").style.visibility=wizardStep===1?"hidden":"visible"; $("#stepLabel").textContent=`Bước ${wizardStep}/6`;
  const type=$('[data-w="type"]'); if(type) type.value=wizard.type; const recipient=$('[data-w="recipient"]'); if(recipient) recipient.value=wizard.recipient;
}
function toISO(value){ if(/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; const [day,month,year]=value.split("/"); return `${year}-${month}-${day}`; }
function fromISO(value){ const [year,month,day]=value.split("-"); return `${day}/${month}/${year}`; }
function collectWizard(){ document.querySelectorAll("[data-w]").forEach(el=>wizard[el.dataset.w]=el.value); }
function nextWizard(){ collectWizard(); if(wizardStep<6){ wizardStep++; renderWizard(); }else{ const profile={id:`p${Date.now()}`,name:wizard.name,owner:"Nguyên Phương · CEO",recipient:wizard.recipient,scope:wizard.scope,selfMax:Number(wizard.selfMax),consultMax:Number(wizard.consultMax),exceptions:wizard.special,start:fromISO(wizard.start),review:fromISO(wizard.review),status:"active",version:"1.0",executions:[]}; state.profiles.unshift(profile); state.knowledge.unshift({title:wizard.knowledge||"Hướng dẫn mới",type:"Checklist",linked:wizard.name,updated:"22/09/2026"}); saveState(); $("#delegationDialog").close(); currentPage="profiles"; render(); showToast("Đã kích hoạt hồ sơ chuyển giao · phiên bản quyền 1.0"); }}
function previousWizard(){ collectWizard(); if(wizardStep>1){wizardStep--;renderWizard();} }

function openExecution(profileId){ const profile=state.profiles.find(p=>p.id===profileId); if(!profile) return; if(profile.status==="draft"){profile.status="active";saveState();render();showToast("Hồ sơ đã được kích hoạt.");return;} executionProfileId=profileId; $("#executionBody").innerHTML=`<div class="form-block"><div class="callout"><strong>${escapeHTML(profile.name)}</strong><br>Người nhận: ${escapeHTML(profile.recipient)}<br>Tự quyết ≤ ${fmtAmount(profile.selfMax,profile)} · Tham vấn đến ${fmtAmount(profile.consultMax,profile)}</div><div class="field-grid" style="margin-top:17px"><div class="field"><label>Khách hàng / yêu cầu</label><input id="executionCustomer" placeholder="Ví dụ: Công ty An Phát" /></div><div class="field"><label>${profile.id==="discount"?"Mức giảm giá (%)":"Giá trị yêu cầu (triệu)"}</label><input id="executionAmount" type="number" min="0" placeholder="0" /></div></div><div class="field" style="margin-top:14px"><label>Ghi chú hoặc căn cứ</label><textarea id="executionNote" placeholder="Thông tin cần thiết để xử lý quyết định"></textarea></div><div id="executionResult"></div></div>`; $("#submitExecution").textContent="Kiểm tra quyền"; const dialog=$("#executionDialog"); dialog.showModal(); animateDialog(dialog); }
function submitExecution(){ const profile=state.profiles.find(p=>p.id===executionProfileId), customer=$("#executionCustomer").value.trim(), amount=Number($("#executionAmount").value), note=$("#executionNote").value.trim(); if(!customer || !Number.isFinite(amount)){showToast("Hãy nhập tên yêu cầu và giá trị cần quyết định.");return;} let classification=amount<=profile.selfMax?"self":amount<=profile.consultMax?"consult":"escalate"; const message={self:`Người nhận được tự quyết yêu cầu ${fmtAmount(amount,profile)}.`,consult:`Yêu cầu nằm trong vùng tham vấn. Người nhận vẫn xử lý nhưng cần tham vấn.`,escalate:`Yêu cầu vượt giới hạn ${fmtAmount(profile.consultMax,profile)}. Cần chuyển cấp cho CEO.`}[classification]; $("#executionResult").innerHTML=`<div class="execution-result ${classification}"><strong>${statusLabel(classification)} — ${message}</strong><span class="muted">Hệ thống sẽ ghi nhận phiên bản quyền ${profile.version} cùng quyết định này.</span></div>`; if(window.gsap&&!prefersReducedMotion)gsap.fromTo(".execution-result",{autoAlpha:0,y:8},{autoAlpha:1,y:0,duration:.3,ease:"power2.out"}); $("#submitExecution").textContent="Xác nhận & ghi nhận"; $("#submitExecution").onclick=()=>{ profile.executions.unshift({id:`e${Date.now()}`,customer,amount,outcome:classification==="self"?"Đã duyệt":classification==="consult"?"Đã tham vấn":"Chờ CEO",class:classification,date:"22/09/2026",note:note||message}); saveState(); $("#executionDialog").close(); render(); showToast(classification==="escalate"?"Đã tạo ngoại lệ và chuyển CEO xử lý.":"Đã ghi nhận lần thực hiện theo quyền hiện hành."); }; }
function resolveException(id){ for(const p of state.profiles){const e=p.executions.find(x=>x.id===id);if(e){e.outcome="CEO đã chấp thuận";e.note=`${e.note} · CEO đã xử lý`;saveState();render();showToast("Ngoại lệ đã được CEO xử lý và lưu bằng chứng.");return;}}}
function openReview(id){ const p=state.profiles.find(x=>x.id===id), e=p.executions, self=e.filter(x=>x.class==="self").length, esc=e.filter(x=>x.class==="escalate").length; $("#reviewTitle").textContent=`Rà soát: ${p.name}`; $("#reviewBody").innerHTML=`<div class="callout">Đây là thời điểm xem chất lượng thực tế trước khi mở rộng hoặc thu hẹp quyền. Nexera không tự thay đổi hạn mức.</div><div class="review-metrics"><div class="review-metric"><span class="muted">Tự xử lý</span><b>${self}/${e.length}</b></div><div class="review-metric"><span class="muted">Chuyển cấp</span><b>${esc}</b></div><div class="review-metric"><span class="muted">Phiên bản</span><b>${p.version}</b></div></div><div class="field"><label>Nhận xét của lãnh đạo</label><textarea placeholder="Ví dụ: giữ nguyên quyền thêm một chu kỳ để quan sát."></textarea></div>`; $("#keepAuthority").onclick=()=>{$("#reviewDialog").close();showToast("Đã ghi nhận quyết định giữ nguyên quyền.");}; const dialog=$("#reviewDialog"); dialog.showModal(); animateDialog(dialog); }

document.addEventListener("click",event=>{ const target=event.target.closest("[data-page],[data-go],[data-execute],[data-resolve],[data-review],[data-knowledge],[data-action]"); if(!target)return; if(target.dataset.page){event.preventDefault();currentPage=target.dataset.page;render();} if(target.dataset.go){currentPage=target.dataset.go;render();} if(target.dataset.execute)openExecution(target.dataset.execute); if(target.dataset.resolve)resolveException(target.dataset.resolve);if(target.dataset.review)openReview(target.dataset.review);if(target.dataset.knowledge)showToast("MVP: màn hình xem chi tiết tài liệu sẽ được kết nối ở vòng tiếp theo.");if(target.dataset.action==="new-profile")openDelegation();if(target.dataset.action==="add-knowledge")showToast("MVP: upload tài liệu sẽ là bước kế tiếp.");});
$("#startDelegation").onclick=openDelegation; $("#wizardNext").onclick=nextWizard; $("#wizardBack").onclick=previousWizard; $("#resetDemo").onclick=()=>{state=structuredClone(initialState);saveState();render();showToast("Đã khôi phục dữ liệu mẫu Nexera.");};
render();
