print("Starting package installation...")
import micropip
import sys

micropip.set_index_urls(
    ["https://yeicor.github.io/OCP.wasm", "https://pypi.org/simple"]
)

print("Mocking incompatible OS-level and server packages...")

# 1. Mock pyperclip (relies on OS-level clipboards)
micropip.add_mock_package(
    "pyperclip",
    "1.9.0",
    modules={"pyperclip": "def copy(text): pass\ndef paste(): return ''"},
)

# 2. Mock websockets (sync websockets crash in browser environments)
micropip.add_mock_package(
    "websockets",
    "16.0",
    modules={
        "websockets": "",
        "websockets.sync": "",
        "websockets.sync.client": "def connect(*args, **kwargs): pass",
        "websockets.exceptions": "class WebSocketException(Exception): pass",
    },
)

# 3. Mock Pillow (Strict version constraint fails on Pyodide due to C-extensions)
micropip.add_mock_package("pillow", "12.1.0", modules={"PIL": "", "PIL.Image": ""})

# 4. Mock heavy server-side libraries (Not needed in WASM, saves MBs of downloading)
micropip.add_mock_package("ipykernel", "6.29.5", modules={"ipykernel": ""})
micropip.add_mock_package("flask", "3.0.0", modules={"flask": ""})
micropip.add_mock_package("flask_sock", "0.7.0", modules={"flask_sock": ""})

print("Installing core dependencies (using upstream ocp_vscode)...")
# Install standard upstream packages instead of the custom fork
await micropip.install(["lib3mf", "ssl", "ocp_vscode==3.1.2", "build123d", "sqlite3"])
# NOTE: to update ocp_vscode one must also update the required three-cad-viewer version
# e.g. npm install three-cad-viewer@4.1.2 at time of writing

print("Applying Pyodide monkey-patches to ocp_vscode...")
import ocp_vscode.comms
from ocp_vscode.comms import default, MessageType
from ocp_vscode.config import Collapse
import orjson
import builtins
import json


# Define our Pyodide-friendly send function
def _wasm_send(data, message_type, port=None, timeit=False):
    j = orjson.dumps(data, default=default)

    # Add the appropriate byte prefixes expected by the JS viewer
    prefixes = {
        MessageType.COMMAND: b"C:",
        MessageType.DATA: b"D:",
        MessageType.LISTEN: b"L:",
        MessageType.BACKEND: b"B:",
        MessageType.BACKEND_RESPONSE: b"R:",
        MessageType.CONFIG: b"S:",
    }
    j = prefixes.get(message_type, b"S:") + j

    # Send data through the JS bridge injected by PythonRuntime.ts
    result = builtins.send_data_to_js(j.decode("utf-8"), message_type.name)

    no_response_commands = ("screenshot", "set_relative_time")
    if message_type == MessageType.COMMAND:
        if isinstance(data, dict) and data.get("type") in no_response_commands:
            return {}

        if result and isinstance(result, str):
            try:
                return json.loads(result)
            except Exception:
                pass

        # 🚨 FALLBACK: Provide a dummy config dictionary to prevent `.get()` crashes
        # when upstream expects a synchronous response from the JS frontend.
        if result is None:
            return {
                "collapse": False,
                "_splash": False,
                "glass": True,
                "default_facecolor": (1, 234, 56),
                "default_thickedgecolor": (123, 45, 6),
                "default_vertexcolor": (123, 45, 6),
            }

    return result


# Inject the patches directly into the module
ocp_vscode.comms._send = _wasm_send
ocp_vscode.comms.port_check = lambda port: False

print("Importing JavaScript interfaces...")
from js import Blob, document
from js import window
from pyodide.ffi import to_js
import io

print("JavaScript interfaces imported")

print("Attempting to import build123d...")
try:
    import build123d

    print("build123d imported successfully!")
except ImportError as e:
    print(f"Failed to import build123d: {e}")
