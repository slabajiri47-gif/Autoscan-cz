import type { Engine } from '../types'

const fault = (name: string, probability: number, repairCost: number, severity: Engine['faults'][number]['severity']) => ({ name, probability, repairCost, severity })

export const engines: Engine[] = [
  { id: 'OM642', brand: 'Mercedes', model: 'E / CLS / ML 350 CDI', vinPrefixes: ['WDD212', 'WDD218', 'WDC164'], baseScore: 76, repairReserve: 30000, faults: [fault('Těsnění olejového chladiče',85,25000,'vysoká'),fault('Swirl klapky / sání',70,15000,'střední'),fault('EGR / DPF',65,18000,'střední'),fault('7G-Tronic mechatronika',45,30000,'vysoká'),fault('Vstřiky / turbo u vysokého nájezdu',40,45000,'vysoká')] },
  { id: 'OM651', brand: 'Mercedes', model: '220 / 250 CDI', vinPrefixes: ['WDD204','WDD212','WDD207'], baseScore: 68, repairReserve: 22000, faults: [fault('Rozvody u starších kusů',55,30000,'vysoká'),fault('Vstřikovače',45,20000,'střední'),fault('EGR / DPF',60,16000,'střední'),fault('Netěsnosti sání',40,9000,'nízká')] },
  { id: 'M272', brand: 'Mercedes', model: 'E / C / CLS 280 / 350 benzín', vinPrefixes: ['WDD211','WDD219'], baseScore: 64, repairReserve: 25000, faults: [fault('Vyvažovací hřídel u starších ročníků',50,45000,'vysoká'),fault('Sání a klapky',45,18000,'střední'),fault('Úniky oleje',55,12000,'střední')] },
  { id: 'M113', brand: 'Mercedes', model: 'E500 / CLS500', vinPrefixes: ['WDB211','WDD219'], baseScore: 82, repairReserve: 26000, faults: [fault('Spotřeba paliva',90,0,'nízká'),fault('Úniky oleje',50,12000,'střední'),fault('Airmatic u vybavených kusů',45,35000,'vysoká')] },
  { id: '1.9 TDI', brand: 'VW / Škoda / Audi', model: 'Golf / Octavia / Passat', vinPrefixes: ['TMB','WVW','WAU'], baseScore: 84, repairReserve: 15000, faults: [fault('Turbo regulace',45,15000,'střední'),fault('Váha vzduchu',35,3000,'nízká'),fault('Spojka / DMF',55,22000,'střední'),fault('Koroze u starších aut',60,20000,'střední')] },
  { id: '2.0 TDI PD', brand: 'VW / Škoda / Audi', model: 'Octavia / Passat / A4', vinPrefixes: ['TMB','WVW','WAU'], baseScore: 55, repairReserve: 25000, faults: [fault('Hlava motoru / praskliny',35,35000,'vysoká'),fault('Vstřiky PD',50,25000,'vysoká'),fault('Turbo',45,18000,'střední'),fault('DPF u novějších',45,18000,'střední')] },
  { id: '2.0 TDI CR', brand: 'VW / Škoda / Audi', model: 'Octavia / Superb / A4', vinPrefixes: ['TMB','WVW','WAU'], baseScore: 72, repairReserve: 19000, faults: [fault('EGR chladič',50,15000,'střední'),fault('DPF',50,20000,'střední'),fault('Vstřiky',35,20000,'střední'),fault('DSG servis',45,12000,'střední')] },
  { id: '3.0 TDI', brand: 'Audi / VW', model: 'A6 / A7 / Q7 / Touareg', vinPrefixes: ['WAU','WVG'], baseScore: 63, repairReserve: 35000, faults: [fault('Rozvody vzadu',45,60000,'vysoká'),fault('EGR / DPF',55,25000,'střední'),fault('Vstřiky',40,35000,'vysoká'),fault('Tiptronic / DSG servis',35,25000,'střední')] },
  { id: 'M57', brand: 'BMW', model: '330d / 530d / X5', vinPrefixes: ['WBA','WBX'], baseScore: 80, repairReserve: 25000, faults: [fault('Swirl klapky',65,12000,'střední'),fault('Turbo',45,25000,'střední'),fault('Vstřiky',40,30000,'vysoká'),fault('Separátor odvětrání',50,5000,'nízká')] },
  { id: 'N47', brand: 'BMW', model: '118d / 320d / 520d', vinPrefixes: ['WBA'], baseScore: 50, repairReserve: 35000, faults: [fault('Rozvody vzadu',75,55000,'vysoká'),fault('EGR',50,12000,'střední'),fault('DPF',45,22000,'střední'),fault('Turbo',35,25000,'střední')] },
  { id: 'B47', brand: 'BMW', model: '320d / 520d novější', vinPrefixes: ['WBA'], baseScore: 72, repairReserve: 24000, faults: [fault('EGR svolávací témata',45,10000,'střední'),fault('DPF',40,20000,'střední'),fault('AdBlue u novějších',35,18000,'střední')] },
  { id: 'K9K 1.5 dCi', brand: 'Renault / Nissan / Dacia', model: 'Clio / Megane / Duster', vinPrefixes: ['VF1','UU1','SJN'], baseScore: 66, repairReserve: 16000, faults: [fault('Vstřiky',45,18000,'střední'),fault('Turbo',35,18000,'střední'),fault('Ojniční ložiska u zanedbaných kusů',30,30000,'vysoká')] },
  { id: '1.6 HDi/TDCi', brand: 'PSA / Ford', model: 'Focus / Peugeot / Citroën', vinPrefixes: ['VF3','VF7','WF0'], baseScore: 60, repairReserve: 20000, faults: [fault('Turbo kvůli mazání',55,25000,'vysoká'),fault('EGR / DPF',55,16000,'střední'),fault('Vstřiky',35,18000,'střední')] },
  { id: 'Skyactiv-G 2.0', brand: 'Mazda', model: 'Mazda 3 / 6 / CX-5', vinPrefixes: ['JMZ'], baseScore: 82, repairReserve: 14000, faults: [fault('Karbon u městského provozu',35,10000,'nízká'),fault('Koroze podvozku',40,18000,'střední'),fault('Cívky / svíčky',30,6000,'nízká')] },
  { id: 'OM646', brand: 'Mercedes', model: 'E220 CDI W211', vinPrefixes: ['WDB211'], baseScore: 78, repairReserve: 18000, faults: [fault('Vstřiky / těsnění',50,15000,'střední'),fault('EGR',45,9000,'nízká'),fault('Koroze W211',70,25000,'vysoká'),fault('SBC brzdy',35,25000,'vysoká')] },
]

export const checklistItems = [
  'Diagnostika bez zásadních chyb', 'Studený start bez kouře', 'Převodovka řadí hladce',
  'Bez úniku oleje / chladiva', 'Servisní historie doložená', 'STK a emise bez problémů',
  'Bez vážné koroze', 'DPF / EGR bez nouzového režimu', 'Testovací jízda bez vibrací',
  'Cena odpovídá stavu',
]
