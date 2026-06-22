import type { Engine, EngineFault, Severity } from '../types'

type EstimateInput = Pick<Engine, 'brand' | 'code' | 'model' | 'yearFrom' | 'yearTo' | 'fuel' | 'displacement'>
type FaultInput = [name: string, probability: number, repairCost: number, severity: Severity]

const premiumPattern = /BMW|Mercedes|AMG|Audi|Porsche|Jaguar|Land Rover|Volvo|Alfa Romeo/i
const turboPattern = /turbo|tsi|tfsi|tce|ecoboost|gdi|thp|t-jet|multiair|kompressor|amg|opc|skyactiv-d|dci|hdi|tdci|cdti|jtd|multijet|d-4d|crdi|d5|drive-e/i
const performancePattern = /amg|m2|m3|m4|m5|type r|gti|rs\b|opc|wrx|corvette|camaro|mustang|hemi|coyote|f-type|911|boxster|cayman/i

function fault([name, probability, repairCost, severity]: FaultInput): EngineFault {
  return { name, probability, repairCost, severity }
}

interface SpecificRule {
  pattern: RegExp
  scoreDelta: number
  faults: FaultInput[]
}

// Family-specific modifiers are intentionally conservative and remain labelled as estimates.
const specificRules: SpecificRule[] = [
  { pattern: /EA111 1\.2 TSI|EA111 1\.4 TSI/i, scoreDelta: -12, faults: [['Rozvodový řetěz a napínák',40,28000,'vysoká'],['Karbon v sání',30,12000,'střední']] },
  { pattern: /EA888 Gen 1|EA888 Gen 2/i, scoreDelta: -13, faults: [['Zvýšená spotřeba oleje',45,45000,'vysoká'],['Rozvodový řetěz / napínák',35,32000,'vysoká']] },
  { pattern: /EA211 evo 1\.5 TSI/i, scoreDelta: -3, faults: [['Cukání za studena u části vozů',22,8000,'nízká']] },
  { pattern: /Prince EP6|1\.6 VTi|1\.6 THP/i, scoreDelta: -13, faults: [['Rozvodový řetěz',40,30000,'vysoká'],['Karbon v sání',35,14000,'střední'],['Vysokotlaké palivové čerpadlo',22,18000,'střední']] },
  { pattern: /EB2 1\.2 PureTech/i, scoreDelta: -15, faults: [['Rozvodový řemen v oleji',45,30000,'vysoká'],['Znečištění mazací soustavy',28,40000,'vysoká']] },
  { pattern: /H5Ft 1\.2 TCe/i, scoreDelta: -14, faults: [['Zvýšená spotřeba oleje',42,45000,'vysoká'],['Rozvodový řetěz',28,28000,'vysoká']] },
  { pattern: /1\.0 EcoBoost/i, scoreDelta: -11, faults: [['Rozvodový řemen v oleji',38,32000,'vysoká'],['Chladicí soustava / přehřátí',25,30000,'vysoká']] },
  { pattern: /Theta II/i, scoreDelta: -14, faults: [['Ojniční ložiska / mazání',35,70000,'vysoká'],['Zvýšená spotřeba oleje',30,35000,'vysoká']] },
  { pattern: /Ingenium 2\.0 D/i, scoreDelta: -14, faults: [['Rozvodový řetěz',35,55000,'vysoká'],['Ředění oleje při regeneraci DPF',30,20000,'střední']] },
  { pattern: /Skyactiv-D 2\.2/i, scoreDelta: -13, faults: [['Karbon a tlak oleje',38,45000,'vysoká'],['Ředění oleje palivem',32,18000,'střední']] },
  { pattern: /M96\/M97/i, scoreDelta: -10, faults: [['Ložisko mezihřídele / mazání',24,120000,'vysoká'],['Netěsnosti motoru',30,35000,'střední']] },
  { pattern: /EJ20\/EJ25/i, scoreDelta: -8, faults: [['Těsnění pod hlavou u části verzí',30,55000,'vysoká'],['Spotřeba oleje',25,30000,'střední']] },
  { pattern: /Twin Spark/i, scoreDelta: -9, faults: [['Spotřeba oleje',35,28000,'střední'],['Variátor časování',30,16000,'střední']] },
  { pattern: /TwinAir/i, scoreDelta: -7, faults: [['MultiAir modul',28,25000,'vysoká'],['Zapalování a nepravidelný chod',25,9000,'střední']] },
  { pattern: /N42\/N46/i, scoreDelta: -10, faults: [['Valvetronic / excentrická hřídel',32,35000,'vysoká'],['Úniky oleje',38,18000,'střední']] },
  { pattern: /N53/i, scoreDelta: -9, faults: [['Piezo vstřikovače',32,45000,'vysoká'],['NOx senzor',35,18000,'střední']] },
  { pattern: /N54/i, scoreDelta: -8, faults: [['Vysokotlaké palivové čerpadlo',30,25000,'vysoká'],['Turbodmychadla / wastegate',30,55000,'vysoká']] },
  { pattern: /M271/i, scoreDelta: -9, faults: [['Rozvodový řetěz a kola vaček',38,38000,'vysoká'],['Odvětrání klikové skříně',28,12000,'střední']] },
  { pattern: /M274/i, scoreDelta: -6, faults: [['Termostat / chladicí soustava',28,18000,'střední'],['Odvětrání klikové skříně',25,16000,'střední']] },
  { pattern: /1\.3 MultiJet|1\.3 CDTI/i, scoreDelta: -4, faults: [['Rozvodový řetěz při dlouhých intervalech',28,24000,'vysoká']] },
]

function genericFaults(input: EstimateInput, turbo: boolean): FaultInput[] {
  if (input.fuel === 'elektro') return [
    ['Degradace trakční baterie',18,120000,'vysoká'],
    ['Chladicí / tepelný okruh',14,35000,'střední'],
    ['Výkonová elektronika nebo palubní nabíječka',10,65000,'vysoká'],
  ]
  if (input.fuel === 'hybrid') return [
    ['Stárnutí trakční baterie',20,65000,'vysoká'],
    ['Chlazení baterie a výkonové elektroniky',15,25000,'střední'],
    ['EGR / karbon u spalovací části',20,16000,'střední'],
  ]
  if (input.fuel === 'nafta') return [
    ['EGR / DPF při městském provozu',38,22000,'střední'],
    ['Vstřikování common-rail',27,32000,'vysoká'],
    ['Turbodmychadlo a jeho regulace',25,30000,'vysoká'],
    ['Dvouhmotový setrvačník',25,26000,'střední'],
  ]
  const faults: FaultInput[] = [
    ['Zapalovací cívky a svíčky',25,8000,'nízká'],
    ['Úniky oleje nebo chladiva',22,15000,'střední'],
  ]
  if (turbo) faults.push(['Turbodmychadlo a regulace plnicího tlaku',23,30000,'vysoká'], ['Karbon u přímého vstřikování',25,14000,'střední'])
  else faults.push(['Snímače a časování ventilů',20,14000,'střední'])
  return faults
}

export function estimateEngineRisk(input: EstimateInput): Pick<Engine, 'baseScore' | 'repairReserve' | 'faults' | 'riskDataStatus' | 'riskMethod' | 'purchaseRecommendation'> {
  const text = `${input.brand} ${input.code ?? ''} ${input.model}`
  const turbo = turboPattern.test(text)
  const premium = premiumPattern.test(input.brand)
  const performance = performancePattern.test(text)
  let score = 76
  if (input.fuel === 'nafta') score -= 5
  if (input.fuel === 'hybrid') score += 2
  if (input.fuel === 'elektro') score += 3
  if (turbo) score -= 4
  if (premium) score -= 2
  if (performance) score -= 5

  let repairReserve = input.fuel === 'nafta' ? 25000 : input.fuel === 'hybrid' ? 28000 : input.fuel === 'elektro' ? 30000 : 17000
  if ((input.displacement ?? 0) >= 2500) repairReserve += 9000
  if (premium) repairReserve += 7000
  if (performance) repairReserve += 10000

  const faults = genericFaults(input, turbo)
  for (const rule of specificRules) {
    if (!rule.pattern.test(text)) continue
    score += rule.scoreDelta
    faults.unshift(...rule.faults)
    repairReserve += Math.max(0, Math.round(Math.abs(rule.scoreDelta) / 4) * 3000)
  }

  const uniqueFaults = [...new Map(faults.map((item) => [item[0], item])).values()].slice(0, 5).map(fault)
  const finalScore = Math.max(35, Math.min(88, score))
  return {
    baseScore: finalScore,
    repairReserve: Math.round(repairReserve / 1000) * 1000,
    faults: uniqueFaults,
    riskDataStatus: 'estimated',
    riskMethod: 'Modelový odhad AutoScan v1',
    purchaseRecommendation: finalScore < 55
      ? 'Kupovat jen po odborné diagnostice, studeném startu a kontrole servisní historie. Počítejte s vyšší rezervou.'
      : finalScore < 72
        ? 'Před koupí ověřte diagnostiku, úniky, stav rozvodů a funkci emisních systémů. Vyžadujte doložený servis.'
        : 'Dobrá výchozí volba, pokud sedí historie a technický stav. Nevynechejte diagnostiku a zkušební jízdu.',
  }
}
