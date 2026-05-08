const state = {
  user: null,
  users: [],
  cases: [],
  case: null,
  activeTab: 'intake',
  autosaveTimer: null,
  dirty: false,
};

const sections = {
  intake: {
    label: 'Intake Workspace',
    groups: [
      {
        title: 'Purpose of Consultation',
        kind: 'narrative',
        fields: [
          ['purpose_of_consultation', 'Purpose of Consultation', 'textarea', 'Type or paste the consultation purpose here exactly as you would in Word.']
        ]
      },
      {
        title: 'Client Details',
        kind: 'form',
        layout: 'grid3',
        fields: [
          ['claimant_full_name','Full Name of Claimant'], ['reference','Reference'], ['attorney_name','Name of Attorney'],
          ['attorney_reference','Attorney Reference'], ['assessor','Assessor'], ['followup_assessor','(If Applicable) Follow-up Assessor'],
          ['name','Name and Surname of client'], ['id_passport','ID / Passport Number'], ['dob','Date of Birth','date'],
          ['nationality','Nationality'], ['gender','Gender'], ['place_of_birth','Place of Birth'],
          ['home_language','Home Language'], ['other_languages','Other Languages'], ['highest_education','Highest Level Education'],
          ['pre_accident_education','Pre-accident Level of Education'], ['current_education','Current Level of Education'], ['date_accident','Date of accident','date'],
          ['date_evaluation','Date of evaluation','date'], ['assessment_date','Date of assessment','date'], ['venue_evaluation','Venue of evaluation'],
          ['client_contact','Client contact details'], ['email','Email address'], ['relationship_to_client','Relation to client'],
        ],
        wideFields: [
          ['physical_address','Physical address','textarea'],
          ['accompanying_person','Accompanying person (Guardian, Name and Surname)','textarea']
        ]
      },
      {
        title: 'Family History',
        kind: 'table_plus_notes',
        table: 'family_members',
        notes: [
          ['family_history','Family history notes','textarea','Use this area for additional family context not captured in the grid.']
        ]
      },
      {
        title: 'Educational History',
        kind: 'table_plus_notes',
        table: 'education_history_all',
        notes: [
          ['grade_repeated_before','Grade repeated before the Accident'], ['grade_at_accident','Grade at the time of the accident'],
          ['grade_repeated_after','Grade repeated after the accident'], ['highest_grade_passed','Highest grade passed']
        ]
      },
      {
        title: 'Future Plans',
        kind: 'narrative_pair',
        fields: [
          ['future_plans_pre','Pre-Accident','textarea','Describe the pre-accident career plans, directions and interests.'],
          ['future_plans_post','Post-Accident','textarea','Describe the post-accident career plans, directions and interests.']
        ]
      },
      {
        title: 'Accident Details and Complaints',
        kind: 'narrative_mix',
        fields: [
          ['accident_detail','Kindly tell me about the accident in detail','textarea'],
          ['transport_hospital','Transportation to Hospital and Name of Hospital','textarea'],
          ['injuries_sustained','What were the injuries that were sustained?','textarea'],
          ['treatment_administered','What was the treatment that was administered to the client?','textarea'],
          ['hospital_duration','How long were you in hospital?'],
          ['education_difficulties_client','Current educational difficulties and complaints after the accident — Client','textarea'],
          ['education_difficulties_guardian','Current educational difficulties and complaints after the accident — Guardian','textarea'],
          ['physical_difficulties','Physical difficulties','textarea'],
          ['cognitive_difficulties','Cognitive difficulties','textarea'],
          ['psychological_difficulties','Psychological difficulties','textarea'],
          ['behaviour_observation','Behavior observation: arrival time, conduct in interview, honesty, mobility, complaints, etc.','textarea']
        ]
      },
      {
        title: 'Checklist',
        kind: 'form',
        layout: 'grid2',
        fields: [
          ['schooling_at_accident','Was the injured schooling at the date of the accident?'],
          ['off_school_duration','How long were you off school?'],
          ['returned_to_school','After the accident, did the injured return to school since the accident and when?'],
          ['disability_grant','Are you currently receiving State Disability Grant?'],
          ['financial_dependence','Who are you currently financially dependent on?']
        ],
        wideFields: [
          ['documentation','Documentation: Birth Certificate / Identity doc / School reports / Any academic related documents','textarea']
        ]
      },
      {
        title: 'Current Living Conditions',
        kind: 'form',
        layout: 'grid3',
        fields: [
          ['housing_type','Type of housing (shack, bricks, rondavel, wendy house)'], ['housing_ownership','Ownership (owning or renting)'],
          ['bedrooms','Number of bedrooms'], ['dining_room','Dining or sitting room'], ['kitchen','Kitchen'],
          ['bathroom','Bathroom (Specify whether there is a bathroom or not)'], ['toilet','Toilet (inside/outside, flushing/pit)'],
          ['outside_rooms','Outside rooms'], ['water','Water'], ['electricity','Electricity'],
          ['amenities_distance','Near or far amenities (shops, clinics, hospital or police station)'], ['transport_mode','Mode of transport (private or public)']
        ],
        wideFields: [
          ['people_in_house','Specify the people living in the house','textarea']
        ]
      },
      {
        title: 'Collateral Information and Completion Details',
        kind: 'form',
        layout: 'grid2',
        fields: [
          ['pre_accident_educator','Pre-accident Educator'], ['current_educator','Current Educator'], ['principal_info','Principal (both pre / current)'],
          ['our_reference','Our Reference'], ['status','Case Status']
        ],
        wideFields: [
          ['collateral_info','Contact Details of other persons to verify information','textarea']
        ]
      }
    ]
  },
  ipdraft: {
    label: 'Draft IP Workspace',
    groups: [
      {
        title: 'IP Draft Administrative Data',
        kind: 'form',
        layout: 'grid3',
        fields: [
          ['current_age','Current Age'], ['type_of_accident','Type of Accident'], ['first_hospital','First Hospital'],
          ['referred_hospital','Referred / Follow-up Hospital'], ['medical_records_from','Medical records from'], ['raf1_completed_by','RAF 1 completed by'],
          ['raf4_completed_by','RAF 4 completed by'], ['orthopaedic_report_by','Orthopaedic report by'], ['radiologist_report_by','Radiologist report by'],
          ['educational_psychologist_by','Educational psychologist report by'], ['occupational_therapist_by','Occupational therapist report by']
        ]
      },
      {
        title: 'Draft Industrial Psychology Narrative',
        kind: 'narrative_mix',
        fields: [
          ['pre_morbid_potential','Pre-morbid potential','textarea'],
          ['post_morbid_potential','Post-morbid potential','textarea'],
          ['loss_of_earnings_text','Loss of earnings text','textarea'],
          ['recommendation_1','Recommendation 1','textarea'],
          ['recommendation_2','Recommendation 2','textarea'],
          ['industrial_psych_summary','Industrial Psychology Summary','textarea']
        ]
      }
    ]
  },
  files: { label: 'Generated Files' },
  users: { label: 'Users' }
};

const dynamicTables = {
  family_members: {
    title: 'Family History',
    columns: ['Name and Surname', 'Relationship', 'Age', 'Education', 'Occupation'],
    minRows: 7
  },
  education_history_all: {
    title: 'Educational History',
    columns: ['Institution', 'Qualification', 'Year', 'Comments'],
    minRows: 8
  }
};

function escapeHtml(value='') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function api(path, options={}) {
  const headers = options.body ? {'Content-Type':'application/json'} : {};
  const resp = await fetch(path, {credentials:'include', ...options, headers:{...headers, ...(options.headers||{})}});
  if (resp.status === 401) { renderLogin(); throw new Error('Please login.'); }
  const contentType = resp.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await resp.json() : await resp.text();
  if (!resp.ok) throw new Error(payload.detail || payload.message || payload || 'Request failed');
  return payload;
}

function formValue(name) {
  const el = document.querySelector(`[name="${name}"]`);
  return el ? el.value : '';
}

function emptyRow(name) {
  const headers = state.case?.data?.[`${name}_headers`] || dynamicTables[name].columns;
  return Array.from({length: headers.length}, () => '');
}

function getTableHeaders(name) {
  return state.case?.data?.[`${name}_headers`] || [...dynamicTables[name].columns];
}

function getTableRows(name) {
  const rows = state.case?.data?.[name] || [];
  const headers = getTableHeaders(name);
  const normalized = rows.map(r => {
    const row = Array.isArray(r) ? [...r] : [];
    while (row.length < headers.length) row.push('');
    return row;
  });
  const explicitCount = Number(state.case?.data?.[`${name}__row_count`] || 0);
  const minRows = Math.max(dynamicTables[name].minRows || 0, explicitCount);
  while (normalized.length < minRows) normalized.push(Array.from({length: headers.length}, () => ''));
  return normalized;
}

function renderField(name, label, type='text', placeholder='') {
  const isText = type === 'textarea';
  return `<div class="field ${isText ? 'field-wide' : ''}">
    <label>${escapeHtml(label)}</label>
    ${isText
      ? `<textarea class="word-like" name="${name}" placeholder="${escapeHtml(placeholder || 'Type or paste here...')}"></textarea>`
      : `<input name="${name}" type="${type}" placeholder="${escapeHtml(placeholder || '')}">`}
  </div>`;
}

function renderGroup(group) {
  if (group.kind === 'form') {
    return `<section class="workspace-group">
      <div class="workspace-title">${escapeHtml(group.title)}</div>
      <div class="${group.layout || 'grid2'}">${(group.fields || []).map(f => renderField(...f)).join('')}</div>
      ${(group.wideFields || []).length ? `<div class="grid1">${group.wideFields.map(f => renderField(...f)).join('')}</div>` : ''}
    </section>`;
  }
  if (group.kind === 'narrative') {
    return `<section class="workspace-group">
      <div class="workspace-title">${escapeHtml(group.title)}</div>
      <div class="grid1">${group.fields.map(f => renderField(...f)).join('')}</div>
    </section>`;
  }
  if (group.kind === 'narrative_pair') {
    return `<section class="workspace-group">
      <div class="workspace-title">${escapeHtml(group.title)}</div>
      <div class="grid2 narrative-grid">${group.fields.map(f => renderField(...f)).join('')}</div>
    </section>`;
  }
  if (group.kind === 'narrative_mix') {
    return `<section class="workspace-group">
      <div class="workspace-title">${escapeHtml(group.title)}</div>
      <div class="grid1 narrative-mix">${group.fields.map(f => renderField(...f)).join('')}</div>
    </section>`;
  }
  if (group.kind === 'table_plus_notes') {
    return `<section class="workspace-group">
      <div class="workspace-title">${escapeHtml(group.title)}</div>
      ${renderSpreadsheet(group.table)}
      ${(group.notes || []).length ? `<div class="grid2" style="margin-top:16px;">${group.notes.map(f => renderField(...f)).join('')}</div>` : ''}
    </section>`;
  }
  return '';
}

function renderSpreadsheet(name) {
  const headers = getTableHeaders(name);
  const rows = getTableRows(name);
  const title = dynamicTables[name].title;
  const thead = headers.map((h, i) => `<th><input class="grid-header" data-grid-header="${name}" data-col="${i}" value="${escapeHtml(h)}"></th>`).join('');
  const tbody = rows.map((row, r) => `<tr>
    ${headers.map((_, c) => `<td contenteditable="true" spellcheck="false" class="grid-cell" data-grid-cell="${name}" data-row="${r}" data-col="${c}">${escapeHtml(row[c] || '')}</td>`).join('')}
    <td class="row-action"><button type="button" class="mini danger" data-remove-row="${name}" data-row="${r}">−</button></td>
  </tr>`).join('');
  return `<div class="sheet-wrap">
    <div class="sheet-toolbar">
      <div class="sheet-title">${escapeHtml(title)} grid</div>
      <div class="small">Paste directly from Excel. Use tab and enter just like a spreadsheet.</div>
      <div class="grow"></div>
      <button type="button" class="mini" data-add-row="${name}">Add Row</button>
      <button type="button" class="mini" data-add-column="${name}">Add Column</button>
      <button type="button" class="mini" data-paste-rows="${name}">Paste Table</button>
    </div>
    <div class="sheet-scroller">
      <table class="sheet-table">
        <thead><tr>${thead}<th class="row-action">Row</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
    <textarea class="bulk-paste hidden" data-bulk="${name}" placeholder="Paste a full Excel table here, then click Apply Paste."></textarea>
    <div class="toolbar hidden" data-bulk-toolbar="${name}" style="margin-top:8px;">
      <button type="button" class="primary mini" data-apply-bulk="${name}">Apply Paste</button>
      <button type="button" class="mini" data-cancel-bulk="${name}">Cancel</button>
    </div>
  </div>`;
}

function collectGridHeaders(name) {
  const headers = [];
  document.querySelectorAll(`[data-grid-header="${name}"]`).forEach(el => { headers[Number(el.dataset.col)] = el.value || `Column ${Number(el.dataset.col)+1}`; });
  return headers.filter(v => v !== undefined);
}

function collectGridRows(name) {
  const rows = {};
  document.querySelectorAll(`[data-grid-cell="${name}"]`).forEach(el => {
    const r = Number(el.dataset.row), c = Number(el.dataset.col);
    rows[r] = rows[r] || [];
    rows[r][c] = (el.innerText || '').replace(/\n/g, ' ').trim();
  });
  return Object.keys(rows).map(Number).sort((a,b)=>a-b).map(i => rows[i]).filter(row => row.some(v => (v||'').trim() !== ''));
}

function collectData() {
  const data = {};
  Object.values(sections).forEach(section => {
    (section.groups || []).forEach(group => {
      (group.fields || []).forEach(([name]) => data[name] = formValue(name));
      (group.wideFields || []).forEach(([name]) => data[name] = formValue(name));
      (group.notes || []).forEach(([name]) => data[name] = formValue(name));
      if (group.table) {
        data[`${group.table}_headers`] = collectGridHeaders(group.table);
        data[group.table] = collectGridRows(group.table);
        data[`${group.table}__row_count`] = document.querySelectorAll(`[data-grid-cell="${group.table}"][data-col="0"]`).length;
      }
    });
  });
  data.primary_education = [];
  data.highschool_education = [];
  const educationRows = data.education_history_all || [];
  for (const row of educationRows) {
    const label = `${row[0] || ''} ${row[1] || ''} ${row[3] || ''}`.toLowerCase();
    if (label.includes('high')) data.highschool_education.push(row);
    else data.primary_education.push(row);
  }
  return data;
}

function setValues(data={}) {
  document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
    const value = data[el.name];
    if (value !== undefined && typeof value !== 'object') el.value = value || '';
  });
}

function updateLocalCaseData() {
  state.case = state.case || {id:null, data:{}, files:[], autosaves:[]};
  state.case.data = collectData();
}

function previewHtml(data={}) {
  return `
    <div class="preview-card">
      <div class="preview-head">${escapeHtml(data.claimant_full_name || data.name || 'New claimant')}</div>
      <div class="preview-line"><strong>Reference:</strong> ${escapeHtml(data.reference || '')}</div>
      <div class="preview-line"><strong>Attorney:</strong> ${escapeHtml(data.attorney_name || '')}</div>
      <div class="preview-line"><strong>Assessor:</strong> ${escapeHtml(data.assessor || '')}</div>
    </div>
    <div class="preview-card">
      <div class="preview-subtitle">Accident Overview</div>
      <div class="preview-text">${escapeHtml(data.accident_detail || 'No accident narrative entered yet.')}</div>
    </div>
    <div class="preview-card">
      <div class="preview-subtitle">Grid Summary</div>
      <div class="preview-line"><strong>Family rows:</strong> ${(data.family_members || []).length}</div>
      <div class="preview-line"><strong>Education rows:</strong> ${(data.education_history_all || []).length}</div>
    </div>
    <div class="preview-card">
      <div class="preview-subtitle">Draft IP Notes</div>
      <div class="preview-text">${escapeHtml(data.industrial_psych_summary || data.post_morbid_potential || 'No IP draft notes entered yet.')}</div>
    </div>`;
}

function renderFileTable(files=[]) {
  if (!files.length) return '<div class="small">No generated files yet.</div>';
  return `<table class="list-table"><thead><tr><th>Type</th><th>File</th><th>Created</th><th>Actions</th></tr></thead><tbody>
    ${files.map(f => `<tr><td>${escapeHtml(f.file_type)}</td><td>${escapeHtml(f.file_name)}</td><td>${escapeHtml(f.created_at || '')}</td><td><a href="/api/cases/${state.case.id}/download/${f.id}" target="_blank">Open</a> | <a href="/api/cases/${state.case.id}/download/${f.id}/attachment">Download</a></td></tr>`).join('')}
  </tbody></table>`;
}

function renderAutosaves(autosaves=[]) {
  if (!autosaves.length) return '<div class="small">No autosave snapshots yet.</div>';
  return `<table class="list-table"><thead><tr><th>Saved</th><th>Snapshot</th></tr></thead><tbody>
    ${autosaves.map(a => `<tr><td>${escapeHtml(a.snapshot_at || '')}</td><td class="small">Draft autosave retained in database</td></tr>`).join('')}
  </tbody></table>`;
}

function renderUsersPanel() {
  if (state.user?.role !== 'Admin') return '<div class="small">Only admin can manage users.</div>';
  return `
    <div class="workspace-group">
      <div class="workspace-title">Create User</div>
      <div class="grid2">
        <div class="field"><label>Full Name</label><input id="u_full_name"></div>
        <div class="field"><label>Username</label><input id="u_username"></div>
        <div class="field"><label>Password</label><input id="u_password" type="password"></div>
        <div class="field"><label>Role</label><select id="u_role"><option>Psychologist</option><option>Reviewer</option><option>Admin</option></select></div>
      </div>
      <div class="toolbar"><button id="create-user" class="primary">Create User</button></div>
    </div>
    <div class="workspace-group">
      <div class="workspace-title">Current Users</div>
      <table class="list-table"><thead><tr><th>Full Name</th><th>Username</th><th>Role</th></tr></thead><tbody>
        ${state.users.map(u => `<tr><td>${escapeHtml(u.full_name)}</td><td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.role)}</td></tr>`).join('')}
      </tbody></table>
    </div>`;
}

function renderLogin(msg='') {
  document.getElementById('app').innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="hero-chip" style="display:inline-flex;margin-bottom:12px;">Beautiful mobile-style workspace</div>
        <h2>Clinical Documentation System IP</h2>
        <div class="small" style="margin-bottom:12px;">Unified production workspace for intake and draft Industrial Psychology reporting.</div>
        <div class="field"><label>Username</label><input id="login-user"></div>
        <div class="field"><label>Password</label><input id="login-pass" type="password"></div>
        <div class="message error">${escapeHtml(msg)}</div>
        <div class="toolbar" style="margin-top:14px;">
          <button class="primary" id="login-btn">Login</button>
          <span class="small">Default admin login: admin / admin123</span>
        </div>
      </div>
    </div>`;
  document.getElementById('login-btn').onclick = async () => {
    try {
      await api('/api/login', {method:'POST', body:JSON.stringify({username:document.getElementById('login-user').value, password:document.getElementById('login-pass').value})});
      await bootstrap();
    } catch (e) { renderLogin(e.message); }
  };
}

function caseCard(c) {
  const active = state.case && state.case.id === c.id ? 'active' : '';
  return `<div class="case-item ${active}" data-case-id="${c.id}">
    <div class="case-title">${escapeHtml(c.claimant_name || 'Untitled Case')}</div>
    <div class="case-meta">Ref: ${escapeHtml(c.reference || '')}</div>
    <div class="case-meta">Attorney: ${escapeHtml(c.attorney_name || '')}</div>
    <div class="case-meta">Assigned: ${escapeHtml(c.assigned_user_name || '')}</div>
    <div class="case-meta">Updated: ${escapeHtml(c.updated_at || '')}</div>
  </div>`;
}

async function bootstrap() {
  try {
    const data = await api('/api/bootstrap');
    state.user = data.user;
    state.users = data.users;
    state.cases = data.cases;
    if (!state.case && state.cases.length) state.case = await api(`/api/cases/${state.cases[0].id}`);
    renderApp();
  } catch {
    renderLogin('');
  }
}

async function saveCase(autosave=false) {
  updateLocalCaseData();
  const data = state.case?.data || {};
  const meta = {
    id: state.case?.id || null,
    claimant_name: data.claimant_full_name || data.name || '',
    reference: data.reference || '',
    attorney_name: data.attorney_name || '',
    assessor: data.assessor || state.user.full_name,
    assigned_user_id: state.case?.assigned_user_id || state.user.id,
    status: data.status || 'Draft'
  };
  const resp = await api('/api/cases', {method:'POST', body:JSON.stringify({meta, data, autosave})});
  state.case = await api(`/api/cases/${resp.case_id}`);
  state.cases = await api('/api/cases');
  state.dirty = false;
  renderApp();
}

function scheduleAutosave() {
  state.dirty = true;
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = setTimeout(async () => {
    try { await saveCase(true); } catch (e) { console.error(e); }
  }, 1000);
}

async function openCase(id) {
  state.case = await api(`/api/cases/${id}`);
  state.dirty = false;
  renderApp();
}

function newCase() {
  state.case = {
    id:null,
    data:{
      assessor: state.user?.full_name || '',
      status:'Draft',
      family_members: [],
      family_members_headers:[...dynamicTables.family_members.columns],
      family_members__row_count: dynamicTables.family_members.minRows,
      education_history_all: [],
      education_history_all_headers:[...dynamicTables.education_history_all.columns],
      education_history_all__row_count: dynamicTables.education_history_all.minRows
    },
    files:[],
    autosaves:[]
  };
  state.dirty = false;
  renderApp();
}

function triggerDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function generate(kind) {
  if (!state.case?.id) await saveCase(false);
  const result = await api(`/api/cases/${state.case.id}/generate/${kind}`, {method:'POST'});
  state.case = await api(`/api/cases/${state.case.id}`);
  state.cases = await api('/api/cases');
  renderApp();
  const latest = (state.case.files || []).find(f => f.file_name === result.file_name);
  if (latest) triggerDownload(`/api/cases/${state.case.id}/download/${latest.id}/attachment`);
}

function addTableRow(name) {
  updateLocalCaseData();
  state.case.data[name] = state.case.data[name] || [];
  state.case.data[name].push(emptyRow(name));
  state.case.data[`${name}__row_count`] = Math.max((state.case.data[`${name}__row_count`] || 0) + 1, state.case.data[name].length, dynamicTables[name].minRows || 0);
  renderApp();
  const newRowIndex = Math.max(0, getTableRows(name).length - 1);
  focusGridCell(name, newRowIndex, 0);
  scheduleAutosave();
}

function removeTableRow(name, rowIndex) {
  updateLocalCaseData();
  state.case.data[name] = (state.case.data[name] || []).filter((_, idx) => idx !== rowIndex);
  const currentCount = Number(state.case.data[`${name}__row_count`] || 0);
  state.case.data[`${name}__row_count`] = Math.max(dynamicTables[name].minRows || 0, currentCount - 1, state.case.data[name].length);
  renderApp();
  scheduleAutosave();
}

function addTableColumn(name) {
  updateLocalCaseData();
  const headerKey = `${name}_headers`;
  const headers = state.case.data[headerKey] || [...dynamicTables[name].columns];
  headers.push(`Extra Column ${headers.length + 1}`);
  state.case.data[headerKey] = headers;
  const targetRows = Math.max(Number(state.case.data[`${name}__row_count`] || 0), dynamicTables[name].minRows || 0, (state.case.data[name] || []).length);
  while ((state.case.data[name] || []).length < targetRows) (state.case.data[name] = state.case.data[name] || []).push(emptyRow(name).slice(0, headers.length - 1));
  state.case.data[name] = (state.case.data[name] || []).map(row => {
    const next = [...row];
    while (next.length < headers.length) next.push('');
    return next;
  });
  renderApp();
  scheduleAutosave();
}

function focusGridCell(name, row, col) {
  const el = document.querySelector(`[data-grid-cell="${name}"][data-row="${row}"][data-col="${col}"]`);
  if (el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function applyBulkPaste(name, raw) {
  const rows = raw.split(/\r?\n/).filter(Boolean).map(line => line.split('\t'));
  if (!rows.length) return;
  updateLocalCaseData();
  const headerKey = `${name}_headers`;
  const maxCols = Math.max(...rows.map(r => r.length), getTableHeaders(name).length);
  const headers = [...(state.case.data[headerKey] || getTableHeaders(name))];
  while (headers.length < maxCols) headers.push(`Extra Column ${headers.length + 1}`);
  state.case.data[headerKey] = headers;
  state.case.data[name] = rows.map(r => {
    const row = [...r];
    while (row.length < headers.length) row.push('');
    return row;
  });
  renderApp();
  scheduleAutosave();
}

function handleGridPaste(event) {
  const cell = event.currentTarget;
  const name = cell.dataset.gridCell;
  const startRow = Number(cell.dataset.row);
  const startCol = Number(cell.dataset.col);
  const text = event.clipboardData.getData('text/plain');
  if (!text.includes('\t') && !text.includes('\n')) return;
  event.preventDefault();
  updateLocalCaseData();
  const headerKey = `${name}_headers`;
  const headers = [...(state.case.data[headerKey] || getTableHeaders(name))];
  const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split('\t'));
  const neededCols = startCol + Math.max(...rows.map(r => r.length));
  while (headers.length < neededCols) headers.push(`Extra Column ${headers.length + 1}`);
  state.case.data[headerKey] = headers;
  const grid = state.case.data[name] ? [...state.case.data[name].map(r => [...r])] : [];
  while (grid.length < startRow + rows.length) grid.push(Array.from({length: headers.length}, () => ''));
  rows.forEach((rVals, rIdx) => {
    while ((grid[startRow + rIdx] || []).length < headers.length) grid[startRow + rIdx].push('');
    rVals.forEach((value, cIdx) => {
      grid[startRow + rIdx][startCol + cIdx] = value;
    });
  });
  state.case.data[name] = grid;
  state.case.data[`${name}__row_count`] = Math.max(grid.length, dynamicTables[name].minRows || 0);
  renderApp();
  scheduleAutosave();
  focusGridCell(name, startRow, startCol);
}

function bindGridKeys() {
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.addEventListener('paste', handleGridPaste);
    cell.addEventListener('input', () => {
      document.getElementById('preview').innerHTML = previewHtml(collectData());
      scheduleAutosave();
    });
    cell.addEventListener('keydown', e => {
      const name = e.currentTarget.dataset.gridCell;
      const row = Number(e.currentTarget.dataset.row);
      const col = Number(e.currentTarget.dataset.col);
      if (e.key === 'Tab') {
        e.preventDefault();
        focusGridCell(name, row, col + (e.shiftKey ? -1 : 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        focusGridCell(name, row + 1, col);
      } else if (e.key === 'ArrowRight' && e.currentTarget.innerText === '') {
        focusGridCell(name, row, col + 1);
      } else if (e.key === 'ArrowLeft' && e.currentTarget.innerText === '') {
        focusGridCell(name, row, col - 1);
      } else if (e.key === 'ArrowDown' && e.currentTarget.innerText === '') {
        focusGridCell(name, row + 1, col);
      } else if (e.key === 'ArrowUp' && e.currentTarget.innerText === '') {
        focusGridCell(name, row - 1, col);
      }
    });
  });
}

async function bindEvents() {
  document.getElementById('logout').onclick = async () => { await api('/api/logout', {method:'POST'}); renderLogin(); };
  document.getElementById('new-case').onclick = newCase;
  document.getElementById('save-case').onclick = () => saveCase(false).catch(e => alert(e.message));
  document.getElementById('generate-intake').onclick = () => generate('intake').catch(e => alert(e.message));
  document.getElementById('generate-ip').onclick = () => generate('ip-draft').catch(e => alert(e.message));
  const ms = document.getElementById('mobile-save'); if (ms) ms.onclick = () => saveCase(false).catch(e => alert(e.message));
  const mi = document.getElementById('mobile-intake'); if (mi) mi.onclick = () => generate('intake').catch(e => alert(e.message));
  const mip = document.getElementById('mobile-ip'); if (mip) mip.onclick = () => generate('ip-draft').catch(e => alert(e.message));
  document.getElementById('open-browser').onclick = () => window.open('/', '_blank');
  document.getElementById('case-search').oninput = () => renderApp();
  document.querySelectorAll('.case-item').forEach(el => el.onclick = () => openCase(el.dataset.caseId));
  document.querySelectorAll('.nav-tab').forEach(el => el.onclick = () => { state.activeTab = el.dataset.tab; renderApp(); });
  document.querySelectorAll('[data-add-row]').forEach(el => el.onclick = () => addTableRow(el.dataset.addRow));
  document.querySelectorAll('[data-add-column]').forEach(el => el.onclick = () => addTableColumn(el.dataset.addColumn));
  document.querySelectorAll('[data-remove-row]').forEach(el => el.onclick = () => removeTableRow(el.dataset.removeRow, Number(el.dataset.row)));
  document.querySelectorAll('[data-paste-rows]').forEach(el => el.onclick = () => {
    document.querySelector(`[data-bulk="${el.dataset.pasteRows}"]`).classList.remove('hidden');
    document.querySelector(`[data-bulk-toolbar="${el.dataset.pasteRows}"]`).classList.remove('hidden');
  });
  document.querySelectorAll('[data-cancel-bulk]').forEach(el => el.onclick = () => {
    document.querySelector(`[data-bulk="${el.dataset.cancelBulk}"]`).classList.add('hidden');
    document.querySelector(`[data-bulk-toolbar="${el.dataset.cancelBulk}"]`).classList.add('hidden');
  });
  document.querySelectorAll('[data-apply-bulk]').forEach(el => el.onclick = () => {
    const ta = document.querySelector(`[data-bulk="${el.dataset.applyBulk}"]`);
    applyBulkPaste(el.dataset.applyBulk, ta.value);
  });
  document.querySelectorAll('input[name], textarea[name], select[name], .grid-header').forEach(el => {
    el.oninput = () => {
      updateLocalCaseData();
      document.getElementById('preview').innerHTML = previewHtml(state.case?.data || {});
      scheduleAutosave();
    };
  });
  bindGridKeys();
  const del = document.getElementById('delete-case');
  del.onclick = async () => {
    if (!state.case?.id) return;
    if (!confirm('Delete the selected case?')) return;
    try { await api(`/api/cases/${state.case.id}`, {method:'DELETE'}); state.cases = await api('/api/cases'); newCase(); }
    catch (e) { alert(e.message); }
  };
  if (state.activeTab === 'users' && state.user.role === 'Admin') {
    const btn = document.getElementById('create-user');
    if (btn) btn.onclick = async () => {
      try {
        await api('/api/users', {method:'POST', body:JSON.stringify({
          full_name:document.getElementById('u_full_name').value,
          username:document.getElementById('u_username').value,
          password:document.getElementById('u_password').value,
          role:document.getElementById('u_role').value,
        })});
        const boot = await api('/api/bootstrap'); state.users = boot.users; renderApp();
      } catch(e) { alert(e.message); }
    };
  }
}

function renderWorkspace() {
  if (state.activeTab === 'users') return renderUsersPanel();
  if (state.activeTab === 'files') {
    return `
      <div class="workspace-group"><div class="workspace-title">Generated Files</div>${renderFileTable(state.case?.files || [])}</div>
      <div class="workspace-group"><div class="workspace-title">Autosave History</div>${renderAutosaves(state.case?.autosaves || [])}</div>`;
  }
  const section = sections[state.activeTab];
  return (section.groups || []).map(renderGroup).join('');
}

function renderApp() {
  const data = state.case?.data || {};
  const searchVal = document.getElementById('case-search')?.value?.toLowerCase() || '';
  const filteredCases = state.cases.filter(c => (c.claimant_name || '').toLowerCase().includes(searchVal) || (c.reference || '').toLowerCase().includes(searchVal));
  document.getElementById('app').innerHTML = `
    <div class="header">
      <div class="brand-badge">IP</div>
      <div class="header-copy">
        <h1>CDS_IP Unified Production Version</h1>
        <div class="small">Beautiful, phone-like drafting workspace with easy typing, pasting, and querying.</div>
      </div>
      <div class="small">Logged in as <strong>${escapeHtml(state.user.full_name)}</strong> (${escapeHtml(state.user.role)})</div>
      <div class="grow"></div>
      <button id="open-browser">Open Web Link</button>
      <button id="logout">Logout</button>
    </div>
    <div class="layout ux-layout">
      <aside class="panel left-col">
        <div class="panel-header"><h2>Case Dashboard</h2></div>
        <div class="panel-body">
          <div class="quick-card"><h3>Quick start</h3><div class="small">Create or open a case, type like Word, paste tables like Excel, and generate reports from the same screen.</div></div>
          <div class="toolbar" style="margin-bottom:10px;">
            <button class="primary" id="new-case">New Case</button>
            <button id="save-case">Save Draft</button>
            <button id="delete-case" class="danger">Delete</button>
          </div>
          <div class="search-wrap"><span>🔎</span><input id="case-search" class="search" placeholder="Query by claimant, reference, attorney, or assessor" value="${escapeHtml(searchVal)}"></div><div class="hero-strip"><div class="hero-chip">Easy typing</div><div class="hero-chip">Easy pasting</div><div class="hero-chip">Fast search</div></div>
          <div class="case-list">${filteredCases.map(caseCard).join('')}</div>
        </div>
      </aside>
      <main class="panel center-col">
        <div class="panel-header editor-head">
          <div>
            <h2>Unified Editor</h2>
            <div class="small">Same screens online and offline. Soft, clean, phone-like layout for faster work.</div>
          </div>
          <div class="grow"></div>
          <span class="status ${state.dirty ? 'warn' : 'ok'}">${state.dirty ? 'Autosaving…' : 'Saved'}</span>
        </div>
        <div class="workspace-tabs">
          <button class="nav-tab ${state.activeTab==='intake'?'active':''}" data-tab="intake">Intake Workspace</button>
          <button class="nav-tab ${state.activeTab==='ipdraft'?'active':''}" data-tab="ipdraft">Draft IP Workspace</button>
          <button class="nav-tab ${state.activeTab==='files'?'active':''}" data-tab="files">Files & Autosaves</button>
          <button class="nav-tab ${state.activeTab==='users'?'active':''}" data-tab="users">Users</button>
        </div>
        <div class="panel-body workspace-body">${renderWorkspace()}</div>
      </main>
      <aside class="panel right-col">
        <div class="panel-header"><h2>Preview and Output</h2></div>
        <div class="panel-body">
          <div class="hero-strip"><div class="hero-chip">Live preview</div><div class="hero-chip">One-tap output</div><div class="hero-chip">Autosave</div></div>
          <div class="toolbar" style="margin-bottom:12px;">
            <button id="generate-intake" class="primary">Generate Intake Report</button>
            <button id="generate-ip">Generate Draft IP Report</button>
          </div>
          <div id="preview">${previewHtml(data)}</div>
          <div class="mobile-actions">
            <button id="mobile-save">Save</button>
            <button id="mobile-intake" class="primary">Intake</button>
            <button id="mobile-ip">Draft IP</button>
          </div>
        </div>
      </aside>
    </div>`;
  setValues(data);
  bindEvents();
}

bootstrap();
