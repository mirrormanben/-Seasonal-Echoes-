import { SolarTerm } from './types';

export const SOLAR_TERMS: SolarTerm[] = [
  // Spring
  { id: 1, name: '立春', enName: 'Start of Spring', date: '02-04', season: 'spring', description: 'Spring begins; life wakes up.' },
  { id: 2, name: '雨水', enName: 'Rain Water', date: '02-19', season: 'spring', description: 'Rainfall increases; snow melts.' },
  { id: 3, name: '惊蛰', enName: 'Awakening of Insects', date: '03-05', season: 'spring', description: 'Thunder awakens hibernating insects.' },
  { id: 4, name: '春分', enName: 'Spring Equinox', date: '03-20', season: 'spring', description: 'Day and night are of equal length.' },
  { id: 5, name: '清明', enName: 'Pure Brightness', date: '04-04', season: 'spring', description: 'Bright and clear; time for tomb sweeping.' },
  { id: 6, name: '谷雨', enName: 'Grain Rain', date: '04-20', season: 'spring', description: 'Rain helps grain grow.' },
  // Summer
  { id: 7, name: '立夏', enName: 'Start of Summer', date: '05-05', season: 'summer', description: 'Summer begins; crops grow vigorously.' },
  { id: 8, name: '小满', enName: 'Grain Buds', date: '05-21', season: 'summer', description: 'Grains are plump but not fully ripe.' },
  { id: 9, name: '芒种', enName: 'Grain in Ear', date: '06-05', season: 'summer', description: 'Wheat ripens; planting continues.' },
  { id: 10, name: '夏至', enName: 'Summer Solstice', date: '06-21', season: 'summer', description: 'Longest day of the year.' },
  { id: 11, name: '小暑', enName: 'Minor Heat', date: '07-07', season: 'summer', description: 'Heat begins to intensify.' },
  { id: 12, name: '大暑', enName: 'Major Heat', date: '07-22', season: 'summer', description: 'Hottest time of the year.' },
  // Autumn
  { id: 13, name: '立秋', enName: 'Start of Autumn', date: '08-07', season: 'autumn', description: 'Autumn begins; harvest approaches.' },
  { id: 14, name: '处暑', enName: 'Limit of Heat', date: '08-23', season: 'autumn', description: 'Summer heat fades.' },
  { id: 15, name: '白露', enName: 'White Dew', date: '09-07', season: 'autumn', description: 'Dew forms; nights get cooler.' },
  { id: 16, name: '秋分', enName: 'Autumn Equinox', date: '09-23', season: 'autumn', description: 'Day and night are equal again.' },
  { id: 17, name: '寒露', enName: 'Cold Dew', date: '10-08', season: 'autumn', description: 'Dew is cold; late autumn.' },
  { id: 18, name: '霜降', enName: 'Frost\'s Descent', date: '10-23', season: 'autumn', description: 'Frost appears; winter nears.' },
  // Winter
  { id: 19, name: '立冬', enName: 'Start of Winter', date: '11-07', season: 'winter', description: 'Winter begins; harvest stored.' },
  { id: 20, name: '小雪', enName: 'Minor Snow', date: '11-22', season: 'winter', description: 'Light snow falls.' },
  { id: 21, name: '大雪', enName: 'Major Snow', date: '12-07', season: 'winter', description: 'Heavy snow falls.' },
  { id: 22, name: '冬至', enName: 'Winter Solstice', date: '12-21', season: 'winter', description: 'Shortest day of the year.' },
  { id: 23, name: '小寒', enName: 'Minor Cold', date: '01-05', season: 'winter', description: 'Weather gets colder.' },
  { id: 24, name: '大寒', enName: 'Major Cold', date: '01-20', season: 'winter', description: 'Coldest time of the year.' },
];

export const SEASON_COLORS = {
  spring: 'from-emerald-50 to-teal-100 text-emerald-900 border-emerald-200',
  summer: 'from-rose-50 to-orange-100 text-rose-900 border-rose-200',
  autumn: 'from-amber-50 to-yellow-100 text-amber-900 border-amber-200',
  winter: 'from-slate-50 to-blue-100 text-slate-900 border-slate-200',
};

export const SEASON_ACCENT = {
  spring: 'bg-emerald-600',
  summer: 'bg-rose-500',
  autumn: 'bg-amber-600',
  winter: 'bg-slate-600',
};