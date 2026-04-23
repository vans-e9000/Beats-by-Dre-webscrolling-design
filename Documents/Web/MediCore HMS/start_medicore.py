#!/usr/bin/env python3
"""
MediCore HMS - Project Starter
Starts both backend and frontend servers together
"""

import subprocess
import sys
import os
import time
import webbrowser
import threading

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_DIR, "backend")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")

BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5174"
API_URL = "http://localhost:5000/api"

GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"
CYAN = "\033[96m"


def log(msg: str, color=GREEN):
    print(f"{color}{msg}{RESET}")


def open_browser():
    """Open browser after a short delay"""
    time.sleep(3)
    log(f"\nOpening browser at {FRONTEND_URL}...", CYAN)
    webbrowser.open(FRONTEND_URL)


def start_backend():
    """Start the backend server"""
    log("\n[1/2] Starting Backend Server...", YELLOW)
    try:
        subprocess.run(
            ["npm", "run", "dev"],
            cwd=BACKEND_DIR,
            env={**os.environ, "NODE_ENV": "development"},
            check=True,
        )
    except FileNotFoundError:
        log("Error: npm not found. Is Node.js installed?", "\033[91m")
        sys.exit(1)
    except KeyboardInterrupt:
        log("\nBackend server stopped")


def start_frontend():
    """Start the frontend server"""
    log("[2/2] Starting Frontend Server...", YELLOW)
    try:
        subprocess.run(
            ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
            env={**os.environ, "NODE_ENV": "development"},
            check=True,
        )
    except FileNotFoundError:
        log("Error: npm not found. Is Node.js installed?", "\033[91m")
        sys.exit(1)
    except KeyboardInterrupt:
        log("\nFrontend server stopped")


def main():
    print(f"""
╔══════════════════════════════════════════╗
║     MediCore HMS - Starting...       ║
╠══════════════════════════════════════════╣
║  Backend: {BACKEND_URL:<25}   ║
║  Frontend: {FRONTEND_URL:<25}  ║
╚══════════════════════════════════════════╝
    """)

    # Start backend in separate thread to keep running
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()

    # Start frontend
    start_frontend()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("\n\nShutting down MediCore HMS...")
        sys.exit(0)