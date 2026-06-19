# Pointing kylelittlejohn.com at this site (when you're ready)

You do NOT need "github" in your URL — you can use a clean apex domain like **kylelittlejohn.com**.
I did NOT add a CNAME file yet, because doing so before DNS is configured can make the site unreachable at the
custom domain. Do these in order:

1. **Buy the domain** (Namecheap / Cloudflare / Google Domains-equivalent) — ~$10–15/yr. (Your purchase — I can't buy it.)
2. **In the domain's DNS**, add for the apex (@):
   - A records → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - and a CNAME for `www` → khlittlejohn-hue.github.io
3. **In the repo**, add a file named `CNAME` (no extension) containing exactly: `kylelittlejohn.com`
   (Tell me "add the CNAME" once the domain is bought and I'll commit it + push.)
4. **GitHub → repo Settings → Pages → Custom domain** → enter kylelittlejohn.com, check "Enforce HTTPS" after it verifies.
DNS can take a few minutes to ~24h to propagate. The github.io URL keeps working and redirects.
