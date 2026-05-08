from __future__ import annotations

import secrets
import sys
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[1]
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import DatabaseManager  # noqa: E402
from report_generator import generate_ip_report_docx, generate_report_docx, sanitize_filename  # noqa: E402

APP_TITLE = 'Clinical Documentation System IP (CDS_IP) - Unified Production Version'
TEMPLATES_DIR = BASE_DIR / 'templates'
OUTPUT_DIR = BASE_DIR / 'output'
STATIC_DIR = BASE_DIR / 'frontend' / 'static'

OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

app = FastAPI(title=APP_TITLE)
app.mount('/static', StaticFiles(directory=str(STATIC_DIR)), name='static')

db = DatabaseManager(BASE_DIR)
SESSIONS: Dict[str, dict] = {}


class LoginPayload(BaseModel):
    username: str
    password: str


class CasePayload(BaseModel):
    meta: Dict[str, Any]
    data: Dict[str, Any]
    autosave: bool = False


class UserPayload(BaseModel):
    full_name: str
    username: str
    password: str
    role: str


def current_user(request: Request) -> dict:
    token = request.cookies.get('cds_ip_session')
    if not token or token not in SESSIONS:
        raise HTTPException(status_code=401, detail='Not authenticated')
    return SESSIONS[token]


def role_allows_admin(user: dict) -> bool:
    return user.get('role') == 'Admin'


@app.get('/', response_class=HTMLResponse)
def index():
    return (STATIC_DIR / 'index.html').read_text(encoding='utf-8')


@app.post('/api/login')
def login(payload: LoginPayload):
    user = db.authenticate(payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid username or password')
    token = secrets.token_urlsafe(24)
    SESSIONS[token] = user
    response = JSONResponse({'ok': True, 'user': user})
    response.set_cookie('cds_ip_session', token, httponly=True, samesite='lax')
    return response


@app.post('/api/logout')
def logout(request: Request):
    token = request.cookies.get('cds_ip_session')
    if token:
        SESSIONS.pop(token, None)
    response = JSONResponse({'ok': True})
    response.delete_cookie('cds_ip_session')
    return response


@app.get('/api/bootstrap')
def bootstrap(request: Request):
    user = current_user(request)
    cases = db.list_cases(user['id'], include_all=role_allows_admin(user) or user['role'] == 'Reviewer')
    return {
        'app_title': APP_TITLE,
        'user': user,
        'cases': cases,
        'users': db.list_users(),
        'login_hint': 'admin / admin123',
    }


@app.get('/api/cases')
def list_cases(request: Request):
    user = current_user(request)
    return db.list_cases(user['id'], include_all=role_allows_admin(user) or user['role'] == 'Reviewer')


@app.get('/api/cases/{case_id}')
def get_case(case_id: int, request: Request):
    user = current_user(request)
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')
    if not (role_allows_admin(user) or user['role'] == 'Reviewer' or case.get('assigned_user_id') == user['id']):
        raise HTTPException(status_code=403, detail='Access denied')
    case['files'] = db.list_case_files(case_id)
    case['autosaves'] = db.list_autosave_snapshots(case_id)
    return case


@app.post('/api/cases')
def save_case(payload: CasePayload, request: Request):
    user = current_user(request)
    meta = dict(payload.meta)
    data = dict(payload.data)
    meta.setdefault('assigned_user_id', user['id'])
    meta.setdefault('assessor', user.get('full_name', ''))
    meta['claimant_name'] = data.get('claimant_full_name') or data.get('name') or meta.get('claimant_name', '')
    meta['reference'] = data.get('reference') or meta.get('reference', '')
    meta['attorney_name'] = data.get('attorney_name') or meta.get('attorney_name', '')

    case_id = meta.get('id')
    if case_id:
        existing = db.get_case(int(case_id))
        if not existing:
            raise HTTPException(status_code=404, detail='Case not found')
        if not (role_allows_admin(user) or user['role'] == 'Reviewer' or existing.get('assigned_user_id') == user['id']):
            raise HTTPException(status_code=403, detail='Access denied')
        db.update_case(int(case_id), meta, data)
    else:
        case_id = db.create_case(meta, data)

    if payload.autosave:
        db.add_autosave_snapshot(int(case_id), data, user['id'])
    case = db.get_case(int(case_id))
    return {'ok': True, 'case_id': int(case_id), 'case': case}


@app.delete('/api/cases/{case_id}')
def delete_case(case_id: int, request: Request):
    user = current_user(request)
    if not role_allows_admin(user):
        raise HTTPException(status_code=403, detail='Only admin can delete cases')
    db.delete_case(case_id)
    return {'ok': True}


@app.get('/api/cases/{case_id}/files')
def case_files(case_id: int, request: Request):
    _ = current_user(request)
    return db.list_case_files(case_id)


@app.get('/api/cases/{case_id}/download/{file_id}')
def download_case_file(case_id: int, file_id: int, request: Request):
    _ = current_user(request)
    files = db.list_case_files(case_id)
    match = next((f for f in files if f['id'] == file_id), None)
    if not match:
        raise HTTPException(status_code=404, detail='File not found')
    path = Path(match['file_path'])
    if not path.exists():
        raise HTTPException(status_code=404, detail='Physical file missing')
    return FileResponse(path, filename=path.name, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')


@app.get('/api/cases/{case_id}/download/{file_id}/attachment')
def download_case_file_attachment(case_id: int, file_id: int, request: Request):
    _ = current_user(request)
    files = db.list_case_files(case_id)
    match = next((f for f in files if f['id'] == file_id), None)
    if not match:
        raise HTTPException(status_code=404, detail='File not found')
    path = Path(match['file_path'])
    if not path.exists():
        raise HTTPException(status_code=404, detail='Physical file missing')
    headers = {'Content-Disposition': f'attachment; filename="{path.name}"'}
    return FileResponse(path, filename=path.name, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', headers=headers)


@app.post('/api/cases/{case_id}/generate/intake')
def generate_intake(case_id: int, request: Request):
    user = current_user(request)
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')
    data = case['data']
    claimant = data.get('claimant_full_name') or data.get('name') or 'Claimant'
    reference = data.get('reference') or case.get('reference') or 'Ref'
    out_name = f"Intake_{sanitize_filename(claimant)}_{sanitize_filename(reference)}.docx"
    case_dir = OUTPUT_DIR / f"case_{case_id}"
    case_dir.mkdir(parents=True, exist_ok=True)
    out_path = case_dir / out_name
    generate_report_docx(TEMPLATES_DIR / 'IP Intake Template.docx', out_path, data)
    db.add_file_record(case_id, 'Intake Report', str(out_path), user['id'])
    return {'ok': True, 'file_name': out_name}


@app.post('/api/cases/{case_id}/generate/ip-draft')
def generate_ip_draft(case_id: int, request: Request):
    user = current_user(request)
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail='Case not found')
    data = case['data']
    claimant = data.get('claimant_full_name') or data.get('name') or 'Claimant'
    reference = data.get('reference') or case.get('reference') or 'Ref'
    out_name = f"IP_Draft_{sanitize_filename(claimant)}_{sanitize_filename(reference)}.docx"
    case_dir = OUTPUT_DIR / f"case_{case_id}"
    case_dir.mkdir(parents=True, exist_ok=True)
    out_path = case_dir / out_name
    working_template = TEMPLATES_DIR / 'IP_Report_Template_WORKING.docx'
    generate_ip_report_docx(working_template, out_path, data)
    db.add_file_record(case_id, 'IP Draft Report', str(out_path), user['id'])
    return {'ok': True, 'file_name': out_name}


@app.get('/api/users')
def get_users(request: Request):
    user = current_user(request)
    if not role_allows_admin(user):
        raise HTTPException(status_code=403, detail='Only admin can manage users')
    return db.list_users()


@app.post('/api/users')
def create_user(payload: UserPayload, request: Request):
    user = current_user(request)
    if not role_allows_admin(user):
        raise HTTPException(status_code=403, detail='Only admin can manage users')
    db.add_user(payload.full_name, payload.username, payload.password, payload.role)
    return {'ok': True}
