#!/usr/bin/env python3
"""Allow only the Git write operations used by ServicePortal updates.

This helper is installed root-owned by install-update-permissions.sh. The
allowlist is intentionally explicit: adding a project requires reviewing and
updating this file and the matching sudoers entries.
"""

import os
import sys


ALLOWED = {
    "/opt/serviceportal": "main",
    "/root/sub2api-deploy": "main",
    "/opt/inboxops": "main",
    "/opt/gpt-outlook-register": "main",
    "/opt/chatgpt2api": "main",
    "/opt/icloud-privacy-mail": "master",
}
MUTATING = {"fetch", "merge", "reset", "clean"}


def main():
    args = sys.argv[1:]
    if len(args) < 3 or args[0] != "-C":
        os.execv("/usr/bin/git", ["/usr/bin/git", *args])

    path = os.path.realpath(args[1])
    if path not in ALLOWED:
        raise SystemExit("serviceportal-git: path not allowed")

    command = args[2]
    if command not in MUTATING:
        os.execv("/usr/bin/git", ["/usr/bin/git", *args])

    branch = ALLOWED[path]
    expected = {
        "fetch": ["-C", path, "fetch", "--prune", "origin", branch],
        "merge": ["-C", path, "merge", "--ff-only", f"origin/{branch}"],
        "reset": ["-C", path, "reset", "--hard", f"origin/{branch}"],
        "clean": ["-C", path, "clean", "-fd"],
    }[command]
    if args != expected:
        raise SystemExit("serviceportal-git: command not allowed")

    os.execv("/usr/bin/sudo", ["/usr/bin/sudo", "-n", "/usr/bin/git", *args])


if __name__ == "__main__":
    main()
