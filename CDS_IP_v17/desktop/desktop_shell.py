from __future__ import annotations

import os
import socket
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

from PySide6.QtCore import QUrl
from PySide6.QtWidgets import QApplication, QHBoxLayout, QLabel, QMainWindow, QMessageBox, QPushButton, QVBoxLayout, QWidget

try:
    from PySide6.QtWebEngineWidgets import QWebEngineView
    WEBENGINE_AVAILABLE = True
except Exception:
    WEBENGINE_AVAILABLE = False
    QWebEngineView = None

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / 'backend' / 'server.py'
BASE_URL = 'http://127.0.0.1:8000'


def port_open(host='127.0.0.1', port=8000):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex((host, port)) == 0


def wait_for_server(seconds=20):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if port_open():
            return True
        time.sleep(0.4)
    return False


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.server_process = None
        self.setWindowTitle('CDS_IP Unified Production Version')
        self.resize(1600, 950)
        self.start_server()
        self.build_ui()

    def start_server(self):
        if port_open():
            return
        env = os.environ.copy()
        env['PYTHONPATH'] = str(ROOT)
        creationflags = 0x08000000 if os.name == 'nt' else 0
        self.server_process = subprocess.Popen(
            [sys.executable, '-m', 'uvicorn', 'backend.server:app', '--host', '127.0.0.1', '--port', '8000'],
            cwd=str(ROOT),
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )
        if not wait_for_server():
            raise RuntimeError('The local CDS_IP server did not start on http://127.0.0.1:8000')

    def build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        top = QHBoxLayout()
        top.addWidget(QLabel('Clinical Documentation System IP (CDS_IP) - Unified Production Version'))
        top.addStretch(1)
        browser_btn = QPushButton('Open in Browser')
        browser_btn.clicked.connect(lambda: webbrowser.open(BASE_URL))
        top.addWidget(browser_btn)
        refresh_btn = QPushButton('Refresh')
        top.addWidget(refresh_btn)
        layout.addLayout(top)

        if WEBENGINE_AVAILABLE:
            self.view = QWebEngineView()
            self.view.setUrl(QUrl(BASE_URL))
            refresh_btn.clicked.connect(self.view.reload)
            layout.addWidget(self.view, 1)
        else:
            info = QLabel(
                'PySide6 WebEngine is not available in this environment. '\
                'Click "Open in Browser" to use the exact same CDS_IP interface in your web browser.'
            )
            info.setWordWrap(True)
            layout.addWidget(info, 1)
            refresh_btn.clicked.connect(lambda: webbrowser.open(BASE_URL))

    def closeEvent(self, event):
        if self.server_process and self.server_process.poll() is None:
            self.server_process.terminate()
            try:
                self.server_process.wait(timeout=3)
            except Exception:
                self.server_process.kill()
        super().closeEvent(event)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    try:
        window = MainWindow()
    except Exception as exc:
        QMessageBox.critical(None, 'CDS_IP failed to start', str(exc))
        raise SystemExit(1)
    window.show()
    raise SystemExit(app.exec())
