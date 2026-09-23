print("Starting package installation...")
import micropip
import sys

# OCP.wasm wheels for build123d>=0.13 are now published directly on PyPI
# (as "*-OCP.wasm" suffixed distributions), so the old yeicor.github.io
# custom index is no longer needed.
micropip.set_index_urls(["https://pypi.org/simple"])

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
micropip.add_mock_package(
    "pillow",
    "12.2.0",
    modules={
        "PIL": "",
        "PIL.Image": "",
        "PIL.ImageColor": (
            "def getrgb(color):\n"
            "    color = color.strip()\n"
            "    if color.startswith('#'):\n"
            "        h = color.lstrip('#')\n"
            "        if len(h) == 3:\n"
            "            h = ''.join(c * 2 for c in h)\n"
            "        vals = tuple(int(h[i:i+2], 16) for i in range(0, len(h), 2))\n"
            "        return vals\n"
            "    if color.startswith('rgb'):\n"
            "        nums = color[color.index('(') + 1:color.index(')')].split(',')\n"
            "        return tuple(int(float(n.strip().rstrip('%'))) for n in nums)\n"
            "    import webcolors\n"
            "    rgb = webcolors.name_to_rgb(color)\n"
            "    return (rgb.red, rgb.green, rgb.blue)\n"
        ),
    },
)

# 4. Mock heavy server-side libraries (Not needed in WASM, saves MBs of downloading)
micropip.add_mock_package("ipykernel", "6.29.5", modules={"ipykernel": ""})
micropip.add_mock_package("flask", "3.0.0", modules={"flask": ""})
micropip.add_mock_package("flask_sock", "0.7.0", modules={"flask_sock": ""})


# 5. Mock psutil (safely stubs the Process class used by ipython's terminal checks)
micropip.add_mock_package(
    "psutil",
    "7.2.2",
    modules={
        "psutil": (
            "class Process:\n"
            "    def __init__(self, *args, **kwargs): pass\n"
            "    def parent(self): return None\n"
            "    def name(self): return ''\n"
        )
    },
)

print("Installing OCP WASM wheels (cadquery-ocp-novtk, lib3mf)...")
# build123d 0.13.0 depends on "cadquery-ocp-novtk" and "lib3mf", neither of
# which ship native wasm wheels under their real PyPI names. yeicor's
# OCP.wasm project publishes wasm-compatible builds of both under "-OCP.wasm"
# suffixed names; install those, then mock the real names (metadata only, via
# modules={}) so build123d's own dependency resolution is satisfied without
# micropip trying (and failing) to fetch the native-only packages, and
# without shadowing the real "lib3mf" import with an empty stub module.
await micropip.install(
    [
        "cadquery-ocp-novtk-OCP.wasm==8.0.1.0.post202609202030",
        "lib3mf-OCP.wasm==2.5.0.post202609201851",
    ]
)

import importlib.metadata

novtk_version = importlib.metadata.version("cadquery-ocp-novtk-OCP.wasm")
lib3mf_version = importlib.metadata.version("lib3mf-OCP.wasm")

micropip.add_mock_package("cadquery-ocp-novtk", novtk_version, modules={})
# The VTK-enabled variant shares the same OCP module, mock it too in case
# anything still depends on it.
micropip.add_mock_package("cadquery-ocp", novtk_version, modules={})
micropip.add_mock_package("lib3mf", lib3mf_version, modules={})

print("Installing core dependencies (using upstream ocp_vscode)...")
# Pin ahead of install: micropip resolves requirements via asyncio.gather
# without backtracking, so build123d's "webcolors~=24.8.0" can lose a race
# against ocp-tessellate's looser "webcolors>=24.8.0" and hard-fail.
await micropip.install(["webcolors==24.8.0"])
# Install standard upstream packages instead of the custom fork
# NOTE: pyodide 314.x bundles "ssl" (as a stub) and "sqlite3" by default, so
# they are no longer separately installable/needed via micropip.
await micropip.install(["ocp_vscode==4.1.0", "build123d==0.13.0"])
# NOTE: to update ocp_vscode one must also update the required three-cad-viewer version
# e.g. npm install three-cad-viewer@4.1.2 at time of writing

print("Applying Pyodide monkey-patches to ocp_vscode...")
# ocp_vscode>=4 moved its transport into the ocp_viewer_core package: the
# module-level `_send` function is gone, replaced by a `comms._send` bound
# method on the module-level `comms` singleton (an ocp_viewer_core
# WebSocketComms instance). Both the public ocp_vscode.comms helpers and the
# internal Session/Viewer pipeline route through that same singleton's
# `_send`, so patching the instance attribute here covers both.
import ocp_vscode.comms
from ocp_vscode.comms import default, MessageType
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


# Inject the patch into the singleton comms instance (not the module: _send
# is now a bound method, not a free function).
ocp_vscode.comms.comms._send = _wasm_send

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
