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

## Funkce verze 1.1

- VIN dekodér se servisní vrstvou, mock fallbackem a předvyplněním vozidla
- risk score se zachovanou logikou původního prototypu
- 166 motorových rodin, závady, ceny oprav a doporučení před koupí
- filtrování podle značky, modelu, roku výroby, paliva a fulltextu
- mock import kandidáta ze Sauto, TipCars, Bazoše a Marketplace
- interní odhad ceny ojetiny s verdiktem nízká / férová / vysoká
- servisní plán podle motoru a nájezdu s lokálními připomínkami
- předkupní checklist
- kalkulačka a grafy provozních nákladů
- LocalStorage garáž s detailem, editací a mazáním, připravená na účet
- porovnání uložených vozů
- profesionální PDF report s identitou AutoScan CZ
- bezpečné mock vrstvy Supabase pro users, vehicles, reports a reminders

Mock VIN databáze obsahuje testovací VINy `WDD2120251A043863`, `TMBJG7NE8J0123456` a `WBA3D31070F123456`. Bez API klíče se automaticky používá mock klient.

## Katalog motorů v Supabase

1. Vytvořte projekt na Supabase.
2. V jeho **SQL Editoru** spusťte `supabase/schema.sql` a volitelně `supabase/app-schema.sql`.
3. V **Table Editor → engines → Import data from CSV** nahrajte data ve formátu `supabase/engine-import-template.csv`.
4. Zkopírujte `.env.example` do `.env.local` a vyplňte `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.
5. Spusťte znovu `npm run dev` nebo vytvořte nový produkční build.

Aplikace načítá katalog po stránkách po 1 000 záznamech. Poslední úspěšná verze se ukládá do prohlížeče a funguje offline. Pokud Supabase není nastavený, použije se rozšířený katalog v `src/data/catalogSeed.ts`; ověřené rizikové profily zůstávají v `src/data/engines.ts`. Veřejný klíč má pouze právo čtení aktivních motorů; importy a úpravy zůstávají v administraci Supabase.

Každý záznam může obsahovat zdroj a datum posledního ověření. Skóre spolehlivosti a závady je vhodné publikovat až po kontrole, protože samotné technické katalogy tato data běžně neposkytují.

Vestavěný rozšířený katalog používá pro dosud ručně neověřené položky `Modelový odhad AutoScan v1`. Model kombinuje typ pohonu, přeplňování, objem, servisní náročnost značky, výkonové zaměření a zvláštní pravidla vybraných motorových rodin. V UI i doporučení je takový výsledek označený jako odhad s nižší mírou jistoty; nejde o statistiku poruch konkrétního VIN.

## Budoucí integrace

Proměnné prostředí jsou zdokumentované v `.env.example`. Rozhraní `VehicleRepository` v `src/services/storage.ts` odděluje garáž od úložiště. VIN klient i Supabase klient mají bezpečný lokální fallback a bez konfigurace nesmí shodit aplikaci.

> Výsledky jsou orientační a nenahrazují fyzickou prohlídku ani profesionální diagnostiku vozu.
