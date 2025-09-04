"""Utility to send license expiration reminders.

Reads license expiration dates from ``config/licenses.json`` and sends a
reminder 30 days prior to expiration. Reminders can be printed to the CLI or
sent via email.
"""
from __future__ import annotations

import argparse
import json
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from pathlib import Path
from typing import Iterable, List, Tuple

CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "licenses.json"


def load_licenses(config_path: Path) -> List[dict]:
    """Load licenses from a JSON configuration file."""
    with config_path.open() as config_file:
        return json.load(config_file)


def licenses_expiring_on(target_date: datetime.date, config_path: Path) -> List[Tuple[dict, datetime.date]]:
    """Return licenses expiring exactly on ``target_date``.

    Parameters
    ----------
    target_date:
        Date to check for expiration.
    config_path:
        Path to the configuration file.
    """
    licenses = load_licenses(config_path)
    expiring: List[Tuple[dict, datetime.date]] = []
    for license_info in licenses:
        expiry_date = datetime.strptime(license_info["expiry_date"], "%Y-%m-%d").date()
        if expiry_date == target_date:
            expiring.append((license_info, expiry_date))
    return expiring


def notify_cli(licenses_due: Iterable[Tuple[dict, datetime.date]]) -> None:
    """Print reminders to the console."""
    sent = False
    for license_info, expiry_date in licenses_due:
        sent = True
        print(f"Reminder: '{license_info['name']}' expires on {expiry_date}.")
    if not sent:
        print("No licenses expiring in 30 days.")


def notify_email(licenses_due: Iterable[Tuple[dict, datetime.date]], host: str, port: int, sender: str,
                 username: str | None = None, password: str | None = None) -> None:
    """Send email reminders for expiring licenses."""
    with smtplib.SMTP(host=host, port=port) as smtp:
        if username and password:
            smtp.login(username, password)
        for license_info, expiry_date in licenses_due:
            recipient = license_info.get("email")
            if not recipient:
                continue
            body = f"Reminder: '{license_info['name']}' expires on {expiry_date}."
            message = MIMEText(body)
            message["Subject"] = f"License Expiration Notice: {license_info['name']}"
            message["From"] = sender
            message["To"] = recipient
            smtp.sendmail(sender, [recipient], message.as_string())


def main() -> None:
    parser = argparse.ArgumentParser(description="Send license expiration reminders.")
    parser.add_argument("--config", type=Path, default=CONFIG_PATH,
                        help="Path to licenses JSON configuration file.")
    parser.add_argument("--email", action="store_true",
                        help="Send reminders via email instead of CLI output.")
    parser.add_argument("--smtp-host", default="localhost",
                        help="SMTP server host")
    parser.add_argument("--smtp-port", type=int, default=25,
                        help="SMTP server port")
    parser.add_argument("--sender", default="noreply@example.com",
                        help="Email sender address")
    parser.add_argument("--username", help="SMTP username")
    parser.add_argument("--password", help="SMTP password")
    args = parser.parse_args()

    target_date = datetime.today().date() + timedelta(days=30)
    expiring = licenses_expiring_on(target_date, args.config)

    if args.email:
        notify_email(expiring, args.smtp_host, args.smtp_port, args.sender, args.username, args.password)
    else:
        notify_cli(expiring)


if __name__ == "__main__":
    main()
