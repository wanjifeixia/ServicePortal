#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "请使用 root 执行此脚本" >&2
  exit 1
fi

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
if id serviceportal >/dev/null 2>&1 && getent group paypalpay >/dev/null 2>&1; then
  usermod -aG paypalpay serviceportal
fi
install -o root -g root -m 0755 "${repo_dir}/deploy/serviceportal-git-helper.py" /usr/local/sbin/serviceportal-git
install -d -o root -g root -m 0755 /usr/local/libexec/serviceportal-bin
ln -sfn /usr/local/sbin/serviceportal-git /usr/local/libexec/serviceportal-bin/git
install -o root -g root -m 0440 "${repo_dir}/deploy/serviceportal-git.sudoers" /etc/sudoers.d/serviceportal-git
install -o root -g root -m 0440 "${repo_dir}/deploy/serviceportal-services.sudoers" /etc/sudoers.d/serviceportal-services
install -d -o root -g root -m 0755 /etc/systemd/system/serviceportal.service.d
install -o root -g root -m 0644 "${repo_dir}/deploy/serviceportal-git-path.conf" /etc/systemd/system/serviceportal.service.d/git-path.conf

visudo -c
systemctl daemon-reload
systemctl restart serviceportal.service
systemctl is-active --quiet serviceportal.service
echo "ServicePortal 受限 Git 更新权限已安装。"
