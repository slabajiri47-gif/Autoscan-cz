# Changelog

## 1.1.0 – Real-world buying workflow

- Automatický VIN dekodér po zadání 17 znaků s mock API, loading/error stavy a předvyplněním značky, modelu, roku, motoru, převodovky, nájezdu, počtu majitelů a dostupné servisní historie.
- Rozšířený katalog 166 motorových rodin s ověřenými nebo modelově odhadovanými riziky a doporučením před koupí.
- Supabase-ready klient, SQL schéma a mock repository pro uživatele, vozidla, reporty a připomínky.
- Asynchronní `VehicleRepository` s LocalStorage fallbackem, detailem, editací a mazáním vozidel.
- Nový profesionální PDF report AutoScan CZ.
- Interní mock odhad ceny ojetiny a porovnání s cenou inzerátu.
- Import odkazů ze Sauto, TipCars, Bazoše a Marketplace bez falešného přiřazování vozidel; fallback nabízí pouze ruční doplnění a neobsahuje demo kandidáty.
- Vercel serverless parser s allowlistem domén, JSON-LD/Open Graph extrakcí, ochranou proti SSRF a srozumitelnými chybami při blokaci webu.
- Servisní plán podle motoru a nájezdu s lokálními připomínkami.
- Nové prázdné, načítací a chybové stavy a mobilní úpravy navigace.
