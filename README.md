# Tulevaisuustutka

Next.js + Supabase -pohjainen MVP heikkojen signaalien keräämiseen, arviointiin ja visualisointiin.

## Käynnistys

1. Asenna riippuvuudet:

```bash
npm install
```

2. Kopioi `.env.example` tiedostoksi `.env.local` ja lisää Supabase-arvot.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

3. Käynnistä kehityspalvelin:

```bash
npm run dev
```

Sovellus olettaa suunnitelmassa kuvatut Supabase-taulut, lookupit, relaatiot ja RLS-politiikat. Sovellus ei sisällä tietokantamigraatioita.
