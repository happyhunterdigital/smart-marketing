# Deploy the Google Maps Business Auditor to a Cloud Server

Run the auditor on a cloud server instead of your laptop. It then audits day and night — no screen, no sleep issues. Useful if you want a scheduled, unattended check of your listing every month, or you run audits for many clients. This guide uses AWS EC2 as the example; the same steps work on Google Cloud, Azure, or DigitalOcean. You need a Debian- or Ubuntu-based virtual machine.

The result is an **API** your own code can call, plus a browser URL to control the auditor.

---

## Step 1 — Reserve a static IP

A static (Elastic) IP keeps your server reachable at a fixed address even if the machine restarts.

1. Create an [AWS account](https://signin.aws.amazon.com/signup?request_type=register) if you do not have one.
2. Open the **Elastic IP addresses** page in EC2.
3. Click **Allocate Elastic IP address**.
4. Keep the defaults and click **Allocate**.

You will attach this IP to the server in the next step.

---

## Step 2 — Create the virtual machine

1. Open the **EC2 Dashboard** and click **Launch instance**.
2. Use these recommended settings (tune machine size and disk for heavier workloads):

| Setting | Value |
| --- | --- |
| Name | `gmaps` |
| AMI (OS image) | Ubuntu Server 24.04 LTS |
| Instance type | `t3.medium` (2 vCPU, 4 GB RAM) |
| Key pair | Create a new RSA key pair |
| Allow SSH traffic | On (needed for terminal access) |
| Allow HTTP traffic | On (needed to reach the API) |
| Allow HTTPS traffic | On (needed for HTTPS) |
| Storage | 80 GiB Magnetic (cheapest) |

> The `.deb` installer requires a Debian-based OS, which Ubuntu satisfies.

3. **If scraping for your own use**, enable **Spot Instances** — they are 70–90% cheaper. Set request type to `Persistent` and interruption behaviour to `Stop`.
   **Do not use Spot for customer-facing APIs** — AWS can stop them at any time.

4. Click **Launch instance**.

5. **Attach your static IP**:
   - Open the **Elastic IPs** page.
   - Select your reserved IP → Actions → **Associate Elastic IP address**.
   - Pick your instance and click **Associate**.

6. **Connect**:
   - Open the **Instances** page, select your instance.
   - Click **Connect** → **EC2 Instance Connect** → **Connect**.

---

## Step 3 — Install the scraper on the server

Run these two commands inside the SSH terminal.

**1. Install the base packages** (Botasaurus CLI plus the web server that routes requests to the app):

```bash
curl -sL https://raw.githubusercontent.com/omkarcloud/botasaurus/master/vm-scripts/install-bota-desktop.sh | bash
```

**2. Install the desktop app.** You need your `AUTH_TOKEN`:

- Sign up for a free account at [omkar.cloud](https://www.omkar.cloud).
- Open the Google Maps Extractor page and find "What is my auth token?" — that is your token.
- Replace `AUTH_TOKEN` below with the real value.

```bash
python3 -m bota install-desktop-app --debian-installer-url https://www.omkar.cloud/l/deb --custom-args "--auth-token AUTH_TOKEN"
```

When the install finishes, the terminal prints a **link to your API documentation**. Open it — that is your live, server-side scraper API.

---

## Step 4 — Add a domain and SSL (optional but recommended)

Give the API a clean domain with HTTPS so it can be called from any frontend (like the Smart Marketing dashboard). Follow the step-by-step domain + SSL guide on [Botasaurus Desktop API documentation](https://www.omkar.cloud/botasaurus/docs/botasaurus-desktop/botasaurus-desktop-api/adding-domain-and-ssl).

---

## Deleting the server (and stopping costs)

Back up anything important first. Then:

1. **Cancel the Spot request** (Spot only) — otherwise the instance keeps respawning.
   - Spot Requests → select your request → **Actions** → **Cancel request** → confirm.
2. **Terminate the instance** — Instances → select → Instance state → **Terminate** → confirm.
3. **Release the Elastic IP** — Elastic IPs → select → Actions → **Release Elastic IP** → confirm.

That is it — no further charges. The static IP is the sneaky cost people forget: an unattached Elastic IP still bills you, so always release it.

---

## Cloud provider notes

- **Google Cloud / Azure / DigitalOcean:** identical flow — create a Debian/Ubuntu VM, allow SSH/HTTP/HTTPS, run the two install commands, keep the machine running.
- **Machine size:** `t3.medium` handles typical use. If you audit at zoom 18 or run country-scale checks for long stretches, step up to a larger instance.

Happy hunting, from Happy Hunter Digital.