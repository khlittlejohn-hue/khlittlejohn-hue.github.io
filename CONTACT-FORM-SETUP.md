# Contact form → your Gmail

The "Get in touch" section now has a real contact form (name / email / subject / message).

**Right now** it works via the visitor's mail app: on Send it composes the message to khlittlejohn@gmail.com,
so it still lands in your inbox when they send. Zero setup.

**To make it deliver straight to your inbox** (no visitor mail app needed — the nicer experience):
1. Go to https://web3forms.com, enter **khlittlejohn@gmail.com**, and they email you a free **Access Key** (~60s).
2. Reply to me with the key (or paste it yourself into `index.html`: find `var WEB3FORMS_KEY=''` and put the key in the quotes).
3. I'll commit + push. Done — submissions then arrive directly in your Gmail, no mail-app step for the sender.

Free tier is generous (250 submissions/mo). No account, no backend, no data stored by us.
