#!/usr/bin/env python3
"""
MediCore HMS - Project Starter
Kills old processes, starts both backend + frontend, and monitors output
Usage:  python start_medicore.py
Stop:   Press Ctrl+C (kills both servers and frees ports)
"""

import subprocess
import sys
import os
import time
import threading

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_DIR, "backend")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")

BACKEND_PORT = 5000
FRONTEND_PORT = 5174
BACKEND_URL = f"http://localhost:{BACKEND_PORT}"
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

backend_proc = None
frontend_proc = None


def kill_port(port):
    """Kill any process listening on the given port (Windows)"""
    try:
        result = subprocess.run(
            f'netstat -ano | findstr ":{port}" | findstr LISTEN',
            capture_output=True, text=True, shell=True
        )
        pids = set()
        for line in result.stdout.strip().splitlines():
            parts = line.strip().split()
            if parts:
                pids.add(parts[-1])
        for pid in pids:
            if pid.isdigit() and int(pid) != os.getpid():
                subprocess.run(
                    f"taskkill //F //PID {pid}",
                    shell=True, capture_output=True
                )
                print(f"  Killed PID {pid} on port {port}")
    except Exception:
        pass


def check_port(port):
    """Check if a port is listening"""
    result = subprocess.run(
        f'netstat -ano | findstr ":{port}" | findstr LISTEN',
        capture_output=True, text=True, shell=True
    )
    return bool(result.stdout.strip())


def cleanup():
    """Kill both server processes and free ports"""
    print("\nStopping servers...")
    for proc in [backend_proc, frontend_proc]:
        if proc and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
    kill_port(BACKEND_PORT)
    kill_port(FRONTEND_PORT)
    print("All servers stopped.")


def stream_output(proc, label):
    """Stream subprocess output to console with label prefix"""
    for line in iter(proc.stdout.readline, b''):
        try:
            text = line.decode(errors='replace').rstrip()
            if text:
                sys.stdout.buffer.write(
                    f"[{label}] {text}\n".encode(
                        sys.stdout.encoding, errors='replace'
                    )
                )
                sys.stdout.flush()
        except Exception:
            pass


def wait_for_port(port, timeout=15, label=""):
    """Wait until a port is listening, with timeout"""
    start = time.time()
    while time.time() - start < timeout:
        if check_port(port):
            return True
        time.sleep(0.5)
    return False


def main():
    print("=" * 50)
    print("   MediCore HMS - Starting Servers")
    print("=" * 50)

    # Step 1: Kill old processes
    print("\n[1/3] Cleaning up old processes...")
    kill_port(BACKEND_PORT)
    kill_port(FRONTEND_PORT)
    time.sleep(1)

    # Step 2: Start backend
    print(f"\n[2/3] Starting Backend on port {BACKEND_PORT}...")
    global backend_proc
    backend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=BACKEND_DIR,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    # Step 3: Start frontend
    print(f"[3/3] Starting Frontend on port {FRONTEND_PORT}...")
    global frontend_proc
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    # Start streaming output in background
    t1 = threading.Thread(
        target=stream_output, args=(backend_proc, "BE"), daemon=True
    )
    t2 = threading.Thread(
        target=stream_output, args=(frontend_proc, "FE"), daemon=True
    )
    t1.start()
    t2.start()

    # Wait for both servers to be ready
    print("\nWaiting for servers to be ready...")
    be_ready = wait_for_port(BACKEND_PORT, timeout=15, label="Backend")
    fe_ready = wait_for_port(FRONTEND_PORT, timeout=15, label="Frontend")

    print("\n" + "=" * 50)
    if be_ready and fe_ready:
        print("   Both servers are UP!")
    else:
        if not be_ready:
            print(f"   WARNING: Backend not responding on :{BACKEND_PORT}")
        if not fe_ready:
            print(f"   WARNING: Frontend not responding on :{FRONTEND_PORT}")
    print("=" * 50)
    print(f"   Backend:  {BACKEND_URL}")
    print(f"   Frontend: {FRONTEND_URL}")
    print(f"   Open:     {FRONTEND_URL}")
    print("=" * 50)
    print("\n   Press Ctrl+C to stop both servers\n")

    # Keep running until Ctrl+C
    try:
        while True:
            if backend_proc.poll() is not None:
                print("Backend process exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()
        sys.exit(0)


if __name__ == "__main__":
    main()