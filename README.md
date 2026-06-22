# AutoScan CZ

Moderní offline-first React + TypeScript aplikace pro předkupní analýzu ojetých vozů.

## Spuštění

```bash
npm install
npm run dev
```

Produkční sestavení:

```bash
npm run build
```

Jednosouborová offline verze:

```bash
npm run build:standalone
```

## Nasazení na Vercel

Projekt obsahuje `vercel.json` s nastavením pro Vite, SPA fallbackem, cache pro verzované assety a základními bezpečnostními hlavičkami.

1. Nahrajte repozitář na GitHub, GitLab nebo Bitbucket.
2. Ve Vercelu zvolte **Add New → Project** a importujte repozitář.
3. Vercel automaticky použije `npm run build` a publikuje složku `dist`.
4. Pro budoucí integrace doplňte v **Settings → Environment Variables** hodnoty z `.env.example`.

Nasazení přes CLI:

```bash
npm install -g vercel
vercel
vercel --prod
```

## Funkce

- VIN demo rozpoznání a ruční výběr motoru
- risk score se zachovanou logikou původního prototypu
- škálovatelný katalog motorů ze Supabase s offline cache a lokálním fallbackem
- filtrování podle značky, modelu, roku výroby, paliva a fulltextu
- předkupní checklist
- kalkulačka a grafy provozních nákladů
- LocalStorage garáž včetně načtení starého klíče `autoscanCars`
- porovnání uložených vozů
- přímý export analýzy do PDF
- rozhraní pro budoucí Supabase backend a VIN API

## Katalog motorů v Supabase

1. Vytvořte projekt na Supabase.
2. V jeho **SQL Editoru** spusťte `supabase/schema.sql`.
3. V **Table Editor → engines → Import data from CSV** nahrajte data ve formátu `supabase/engine-import-template.csv`.
4. Zkopírujte `.env.example` do `.env.local` a vyplňte `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.
5. Spusťte znovu `npm run dev` nebo vytvořte nový produkční build.

Aplikace načítá katalog po stránkách po 1 000 záznamech. Poslední úspěšná verze se ukládá do prohlížeče a funguje offline. Pokud Supabase není nastavený, použije se rozšířený katalog v `src/data/catalogSeed.ts`; ověřené rizikové profily zůstávají v `src/data/engines.ts`. Veřejný klíč má pouze právo čtení aktivních motorů; importy a úpravy zůstávají v administraci Supabase.

Každý záznam může obsahovat zdroj a datum posledního ověření. Skóre spolehlivosti a závady je vhodné publikovat až po kontrole, protože samotné technické katalogy tato data běžně neposkytují.

Vestavěný rozšířený katalog používá pro dosud ručně neověřené položky `Modelový odhad AutoScan v1`. Model kombinuje typ pohonu, přeplňování, objem, servisní náročnost značky, výkonové zaměření a zvláštní pravidla vybraných motorových rodin. V UI i doporučení je takový výsledek označený jako odhad s nižší mírou jistoty; nejde o statistiku poruch konkrétního VIN.

## Budoucí integrace

Proměnné prostředí jsou zdokumentované v `.env.example`. Rozhraní `CarBackend` v `src/services/backend.ts` odděluje data garáže od UI. `VinApiClient` v `src/services/vinApi.ts` lze nahradit konkrétním poskytovatelem bez změny analytické logiky.

> Výsledky jsou orientační a nenahrazují fyzickou prohlídku ani profesionální diagnostiku vozu.
