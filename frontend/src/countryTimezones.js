// Mapping from ISO 3166-1 alpha-3 country codes (used in Natural Earth GeoJSON) to:
// { name: "Country Name in Hebrew", timezone: "IANA timezone", nameEn: "English name" }

export const COUNTRY_TIMEZONES = {
  AFG: { nameEn: "Afghanistan", name: "אפגניסטן", timezone: "Asia/Kabul" },
  ALB: { nameEn: "Albania", name: "אלבניה", timezone: "Europe/Tirane" },
  DZA: { nameEn: "Algeria", name: "אלג'יריה", timezone: "Africa/Algiers" },
  AND: { nameEn: "Andorra", name: "אנדורה", timezone: "Europe/Andorra" },
  AGO: { nameEn: "Angola", name: "אנגולה", timezone: "Africa/Luanda" },
  ATG: { nameEn: "Antigua and Barbuda", name: "אנטיגואה וברבודה", timezone: "America/Antigua" },
  ARG: { nameEn: "Argentina", name: "ארגנטינה", timezone: "America/Argentina/Buenos_Aires" },
  ARM: { nameEn: "Armenia", name: "ארמניה", timezone: "Asia/Yerevan" },
  AUS: { nameEn: "Australia", name: "אוסטרליה", timezone: "Australia/Sydney" },
  AUT: { nameEn: "Austria", name: "אוסטריה", timezone: "Europe/Vienna" },
  AZE: { nameEn: "Azerbaijan", name: "אזרבייג'ן", timezone: "Asia/Baku" },
  BHS: { nameEn: "Bahamas", name: "איי בהאמה", timezone: "America/Nassau" },
  BHR: { nameEn: "Bahrain", name: "בחריין", timezone: "Asia/Bahrain" },
  BGD: { nameEn: "Bangladesh", name: "בנגלדש", timezone: "Asia/Dhaka" },
  BRB: { nameEn: "Barbados", name: "ברבדוס", timezone: "America/Barbados" },
  BLR: { nameEn: "Belarus", name: "בלארוס", timezone: "Europe/Minsk" },
  BEL: { nameEn: "Belgium", name: "בלגיה", timezone: "Europe/Brussels" },
  BLZ: { nameEn: "Belize", name: "בליז", timezone: "America/Belize" },
  BEN: { nameEn: "Benin", name: "בנין", timezone: "Africa/Porto-Novo" },
  BTN: { nameEn: "Bhutan", name: "בהוטן", timezone: "Asia/Thimphu" },
  BOL: { nameEn: "Bolivia", name: "בוליביה", timezone: "America/La_Paz" },
  BIH: { nameEn: "Bosnia and Herzegovina", name: "בוסניה והרצגובינה", timezone: "Europe/Sarajevo" },
  BWA: { nameEn: "Botswana", name: "בוטסוואנה", timezone: "Africa/Gaborone" },
  BRA: { nameEn: "Brazil", name: "ברזיל", timezone: "America/Sao_Paulo" },
  BRN: { nameEn: "Brunei", name: "ברוניי", timezone: "Asia/Brunei" },
  BGR: { nameEn: "Bulgaria", name: "בולגריה", timezone: "Europe/Sofia" },
  BFA: { nameEn: "Burkina Faso", name: "בורקינה פאסו", timezone: "Africa/Ouagadougou" },
  BDI: { nameEn: "Burundi", name: "בורונדי", timezone: "Africa/Bujumbura" },
  CPV: { nameEn: "Cape Verde", name: "כף ורדה", timezone: "Atlantic/Cape_Verde" },
  KHM: { nameEn: "Cambodia", name: "קמבודיה", timezone: "Asia/Phnom_Penh" },
  CMR: { nameEn: "Cameroon", name: "קמרון", timezone: "Africa/Douala" },
  CAN: { nameEn: "Canada", name: "קנדה", timezone: "America/Toronto" },
  CAF: { nameEn: "Central African Republic", name: "הרפובליקה המרכז-אפריקאית", timezone: "Africa/Bangui" },
  TCD: { nameEn: "Chad", name: "צ'אד", timezone: "Africa/Ndjamena" },
  CHL: { nameEn: "Chile", name: "צ'ילה", timezone: "America/Santiago" },
  CHN: { nameEn: "China", name: "סין", timezone: "Asia/Shanghai" },
  COL: { nameEn: "Colombia", name: "קולומביה", timezone: "America/Bogota" },
  COM: { nameEn: "Comoros", name: "קומורו", timezone: "Indian/Comoro" },
  COD: { nameEn: "DR Congo", name: "קונגו (דמוקרטית)", timezone: "Africa/Kinshasa" },
  COG: { nameEn: "Republic of Congo", name: "קונגו (רפובליקה)", timezone: "Africa/Brazzaville" },
  CRI: { nameEn: "Costa Rica", name: "קוסטה ריקה", timezone: "America/Costa_Rica" },
  CIV: { nameEn: "Côte d'Ivoire", name: "חוף השנהב", timezone: "Africa/Abidjan" },
  HRV: { nameEn: "Croatia", name: "קרואטיה", timezone: "Europe/Zagreb" },
  CUB: { nameEn: "Cuba", name: "קובה", timezone: "America/Havana" },
  CYP: { nameEn: "Cyprus", name: "קפריסין", timezone: "Asia/Nicosia" },
  CZE: { nameEn: "Czech Republic", name: "צ'כיה", timezone: "Europe/Prague" },
  DNK: { nameEn: "Denmark", name: "דנמרק", timezone: "Europe/Copenhagen" },
  DJI: { nameEn: "Djibouti", name: "ג'יבוטי", timezone: "Africa/Djibouti" },
  DOM: { nameEn: "Dominican Republic", name: "הרפובליקה הדומיניקנית", timezone: "America/Santo_Domingo" },
  ECU: { nameEn: "Ecuador", name: "אקוודור", timezone: "America/Guayaquil" },
  EGY: { nameEn: "Egypt", name: "מצרים", timezone: "Africa/Cairo" },
  SLV: { nameEn: "El Salvador", name: "אל סלבדור", timezone: "America/El_Salvador" },
  GNQ: { nameEn: "Equatorial Guinea", name: "גינאה המשוונית", timezone: "Africa/Malabo" },
  ERI: { nameEn: "Eritrea", name: "אריתריאה", timezone: "Africa/Asmara" },
  EST: { nameEn: "Estonia", name: "אסטוניה", timezone: "Europe/Tallinn" },
  SWZ: { nameEn: "Eswatini", name: "אסואטיני", timezone: "Africa/Mbabane" },
  ETH: { nameEn: "Ethiopia", name: "אתיופיה", timezone: "Africa/Addis_Ababa" },
  FJI: { nameEn: "Fiji", name: "פיג'י", timezone: "Pacific/Fiji" },
  FIN: { nameEn: "Finland", name: "פינלנד", timezone: "Europe/Helsinki" },
  FRA: { nameEn: "France", name: "צרפת", timezone: "Europe/Paris" },
  GAB: { nameEn: "Gabon", name: "גאבון", timezone: "Africa/Libreville" },
  GMB: { nameEn: "Gambia", name: "גמביה", timezone: "Africa/Banjul" },
  GEO: { nameEn: "Georgia", name: "גאורגיה", timezone: "Asia/Tbilisi" },
  DEU: { nameEn: "Germany", name: "גרמניה", timezone: "Europe/Berlin" },
  GHA: { nameEn: "Ghana", name: "גאנה", timezone: "Africa/Accra" },
  GRC: { nameEn: "Greece", name: "יוון", timezone: "Europe/Athens" },
  GTM: { nameEn: "Guatemala", name: "גואטמלה", timezone: "America/Guatemala" },
  GIN: { nameEn: "Guinea", name: "גינאה", timezone: "Africa/Conakry" },
  GNB: { nameEn: "Guinea-Bissau", name: "גינאה-ביסאו", timezone: "Africa/Bissau" },
  GUY: { nameEn: "Guyana", name: "גיאנה", timezone: "America/Guyana" },
  HTI: { nameEn: "Haiti", name: "האיטי", timezone: "America/Port-au-Prince" },
  HND: { nameEn: "Honduras", name: "הונדורס", timezone: "America/Tegucigalpa" },
  HUN: { nameEn: "Hungary", name: "הונגריה", timezone: "Europe/Budapest" },
  ISL: { nameEn: "Iceland", name: "איסלנד", timezone: "Atlantic/Reykjavik" },
  IND: { nameEn: "India", name: "הודו", timezone: "Asia/Kolkata" },
  IDN: { nameEn: "Indonesia", name: "אינדונזיה", timezone: "Asia/Jakarta" },
  IRN: { nameEn: "Iran", name: "איראן", timezone: "Asia/Tehran" },
  IRQ: { nameEn: "Iraq", name: "עיראק", timezone: "Asia/Baghdad" },
  IRL: { nameEn: "Ireland", name: "אירלנד", timezone: "Europe/Dublin" },
  ISR: { nameEn: "Israel", name: "ישראל", timezone: "Asia/Jerusalem" },
  ITA: { nameEn: "Italy", name: "איטליה", timezone: "Europe/Rome" },
  JAM: { nameEn: "Jamaica", name: "ג'מייקה", timezone: "America/Jamaica" },
  JPN: { nameEn: "Japan", name: "יפן", timezone: "Asia/Tokyo" },
  JOR: { nameEn: "Jordan", name: "ירדן", timezone: "Asia/Amman" },
  KAZ: { nameEn: "Kazakhstan", name: "קזחסטן", timezone: "Asia/Almaty" },
  KEN: { nameEn: "Kenya", name: "קניה", timezone: "Africa/Nairobi" },
  KIR: { nameEn: "Kiribati", name: "קיריבאטי", timezone: "Pacific/Tarawa" },
  PRK: { nameEn: "North Korea", name: "קוריאה הצפונית", timezone: "Asia/Pyongyang" },
  KOR: { nameEn: "South Korea", name: "קוריאה הדרומית", timezone: "Asia/Seoul" },
  KWT: { nameEn: "Kuwait", name: "כווית", timezone: "Asia/Kuwait" },
  KGZ: { nameEn: "Kyrgyzstan", name: "קירגיזסטן", timezone: "Asia/Bishkek" },
  LAO: { nameEn: "Laos", name: "לאוס", timezone: "Asia/Vientiane" },
  LVA: { nameEn: "Latvia", name: "לטביה", timezone: "Europe/Riga" },
  LBN: { nameEn: "Lebanon", name: "לבנון", timezone: "Asia/Beirut" },
  LSO: { nameEn: "Lesotho", name: "לסוטו", timezone: "Africa/Maseru" },
  LBR: { nameEn: "Liberia", name: "ליבריה", timezone: "Africa/Monrovia" },
  LBY: { nameEn: "Libya", name: "לוב", timezone: "Africa/Tripoli" },
  LIE: { nameEn: "Liechtenstein", name: "ליכטנשטיין", timezone: "Europe/Vaduz" },
  LTU: { nameEn: "Lithuania", name: "ליטא", timezone: "Europe/Vilnius" },
  LUX: { nameEn: "Luxembourg", name: "לוקסמבורג", timezone: "Europe/Luxembourg" },
  MDG: { nameEn: "Madagascar", name: "מדגסקר", timezone: "Indian/Antananarivo" },
  MWI: { nameEn: "Malawi", name: "מלאווי", timezone: "Africa/Blantyre" },
  MYS: { nameEn: "Malaysia", name: "מלזיה", timezone: "Asia/Kuala_Lumpur" },
  MDV: { nameEn: "Maldives", name: "מלדיביים", timezone: "Indian/Maldives" },
  MLI: { nameEn: "Mali", name: "מאלי", timezone: "Africa/Bamako" },
  MLT: { nameEn: "Malta", name: "מלטה", timezone: "Europe/Malta" },
  MHL: { nameEn: "Marshall Islands", name: "איי מרשל", timezone: "Pacific/Majuro" },
  MRT: { nameEn: "Mauritania", name: "מאוריטניה", timezone: "Africa/Nouakchott" },
  MUS: { nameEn: "Mauritius", name: "מאוריציוס", timezone: "Indian/Mauritius" },
  MEX: { nameEn: "Mexico", name: "מקסיקו", timezone: "America/Mexico_City" },
  FSM: { nameEn: "Micronesia", name: "מיקרונזיה", timezone: "Pacific/Pohnpei" },
  MDA: { nameEn: "Moldova", name: "מולדובה", timezone: "Europe/Chisinau" },
  MCO: { nameEn: "Monaco", name: "מונקו", timezone: "Europe/Monaco" },
  MNG: { nameEn: "Mongolia", name: "מונגוליה", timezone: "Asia/Ulaanbaatar" },
  MNE: { nameEn: "Montenegro", name: "מונטנגרו", timezone: "Europe/Podgorica" },
  MAR: { nameEn: "Morocco", name: "מרוקו", timezone: "Africa/Casablanca" },
  MOZ: { nameEn: "Mozambique", name: "מוזמביק", timezone: "Africa/Maputo" },
  MMR: { nameEn: "Myanmar", name: "מיאנמר", timezone: "Asia/Rangoon" },
  NAM: { nameEn: "Namibia", name: "נמיביה", timezone: "Africa/Windhoek" },
  NRU: { nameEn: "Nauru", name: "נאורו", timezone: "Pacific/Nauru" },
  NPL: { nameEn: "Nepal", name: "נפאל", timezone: "Asia/Kathmandu" },
  NLD: { nameEn: "Netherlands", name: "הולנד", timezone: "Europe/Amsterdam" },
  NZL: { nameEn: "New Zealand", name: "ניו זילנד", timezone: "Pacific/Auckland" },
  NIC: { nameEn: "Nicaragua", name: "ניקרגואה", timezone: "America/Managua" },
  NER: { nameEn: "Niger", name: "ניז'ר", timezone: "Africa/Niamey" },
  NGA: { nameEn: "Nigeria", name: "ניגריה", timezone: "Africa/Lagos" },
  MKD: { nameEn: "North Macedonia", name: "מקדוניה הצפונית", timezone: "Europe/Skopje" },
  NOR: { nameEn: "Norway", name: "נורווגיה", timezone: "Europe/Oslo" },
  OMN: { nameEn: "Oman", name: "עומאן", timezone: "Asia/Muscat" },
  PAK: { nameEn: "Pakistan", name: "פקיסטן", timezone: "Asia/Karachi" },
  PLW: { nameEn: "Palau", name: "פלאו", timezone: "Pacific/Palau" },
  PAN: { nameEn: "Panama", name: "פנמה", timezone: "America/Panama" },
  PNG: { nameEn: "Papua New Guinea", name: "פפואה גינאה החדשה", timezone: "Pacific/Port_Moresby" },
  PRY: { nameEn: "Paraguay", name: "פרגוואי", timezone: "America/Asuncion" },
  PER: { nameEn: "Peru", name: "פרו", timezone: "America/Lima" },
  PHL: { nameEn: "Philippines", name: "פיליפינים", timezone: "Asia/Manila" },
  POL: { nameEn: "Poland", name: "פולין", timezone: "Europe/Warsaw" },
  PRT: { nameEn: "Portugal", name: "פורטוגל", timezone: "Europe/Lisbon" },
  QAT: { nameEn: "Qatar", name: "קטאר", timezone: "Asia/Qatar" },
  ROU: { nameEn: "Romania", name: "רומניה", timezone: "Europe/Bucharest" },
  RUS: { nameEn: "Russia", name: "רוסיה", timezone: "Europe/Moscow" },
  RWA: { nameEn: "Rwanda", name: "רואנדה", timezone: "Africa/Kigali" },
  KNA: { nameEn: "Saint Kitts and Nevis", name: "סנט קיטס ונוויס", timezone: "America/St_Kitts" },
  LCA: { nameEn: "Saint Lucia", name: "סנט לוסיה", timezone: "America/St_Lucia" },
  VCT: { nameEn: "Saint Vincent and the Grenadines", name: "סנט וינסנט והגרנדינים", timezone: "America/St_Vincent" },
  WSM: { nameEn: "Samoa", name: "סמואה", timezone: "Pacific/Apia" },
  SMR: { nameEn: "San Marino", name: "סן מרינו", timezone: "Europe/San_Marino" },
  STP: { nameEn: "São Tomé and Príncipe", name: "סאו טומה ופרינסיפה", timezone: "Africa/Sao_Tome" },
  SAU: { nameEn: "Saudi Arabia", name: "ערב הסעודית", timezone: "Asia/Riyadh" },
  SEN: { nameEn: "Senegal", name: "סנגל", timezone: "Africa/Dakar" },
  SRB: { nameEn: "Serbia", name: "סרביה", timezone: "Europe/Belgrade" },
  SLE: { nameEn: "Sierra Leone", name: "סיירה לאונה", timezone: "Africa/Freetown" },
  SGP: { nameEn: "Singapore", name: "סינגפור", timezone: "Asia/Singapore" },
  SVK: { nameEn: "Slovakia", name: "סלובקיה", timezone: "Europe/Bratislava" },
  SVN: { nameEn: "Slovenia", name: "סלובניה", timezone: "Europe/Ljubljana" },
  SLB: { nameEn: "Solomon Islands", name: "איי שלמה", timezone: "Pacific/Guadalcanal" },
  SOM: { nameEn: "Somalia", name: "סומליה", timezone: "Africa/Mogadishu" },
  ZAF: { nameEn: "South Africa", name: "דרום אפריקה", timezone: "Africa/Johannesburg" },
  SSD: { nameEn: "South Sudan", name: "דרום סודן", timezone: "Africa/Juba" },
  ESP: { nameEn: "Spain", name: "ספרד", timezone: "Europe/Madrid" },
  LKA: { nameEn: "Sri Lanka", name: "סרי לנקה", timezone: "Asia/Colombo" },
  SDN: { nameEn: "Sudan", name: "סודן", timezone: "Africa/Khartoum" },
  SUR: { nameEn: "Suriname", name: "סורינאם", timezone: "America/Paramaribo" },
  SWE: { nameEn: "Sweden", name: "שוודיה", timezone: "Europe/Stockholm" },
  CHE: { nameEn: "Switzerland", name: "שוויץ", timezone: "Europe/Zurich" },
  SYR: { nameEn: "Syria", name: "סוריה", timezone: "Asia/Damascus" },
  TWN: { nameEn: "Taiwan", name: "טייוואן", timezone: "Asia/Taipei" },
  TJK: { nameEn: "Tajikistan", name: "טג'יקיסטן", timezone: "Asia/Dushanbe" },
  TZA: { nameEn: "Tanzania", name: "טנזניה", timezone: "Africa/Dar_es_Salaam" },
  THA: { nameEn: "Thailand", name: "תאילנד", timezone: "Asia/Bangkok" },
  TLS: { nameEn: "Timor-Leste", name: "טימור-לסטה", timezone: "Asia/Dili" },
  TGO: { nameEn: "Togo", name: "טוגו", timezone: "Africa/Lome" },
  TON: { nameEn: "Tonga", name: "טונגה", timezone: "Pacific/Tongatapu" },
  TTO: { nameEn: "Trinidad and Tobago", name: "טרינידד וטובגו", timezone: "America/Port_of_Spain" },
  TUN: { nameEn: "Tunisia", name: "תוניסיה", timezone: "Africa/Tunis" },
  TUR: { nameEn: "Turkey", name: "טורקיה", timezone: "Europe/Istanbul" },
  TKM: { nameEn: "Turkmenistan", name: "טורקמניסטן", timezone: "Asia/Ashgabat" },
  TUV: { nameEn: "Tuvalu", name: "טובאלו", timezone: "Pacific/Funafuti" },
  UGA: { nameEn: "Uganda", name: "אוגנדה", timezone: "Africa/Kampala" },
  UKR: { nameEn: "Ukraine", name: "אוקראינה", timezone: "Europe/Kiev" },
  ARE: { nameEn: "United Arab Emirates", name: "איחוד האמירויות הערביות", timezone: "Asia/Dubai" },
  GBR: { nameEn: "United Kingdom", name: "בריטניה", timezone: "Europe/London" },
  USA: { nameEn: "United States", name: "ארצות הברית", timezone: "America/New_York" },
  URY: { nameEn: "Uruguay", name: "אורוגוואי", timezone: "America/Montevideo" },
  UZB: { nameEn: "Uzbekistan", name: "אוזבקיסטן", timezone: "Asia/Tashkent" },
  VUT: { nameEn: "Vanuatu", name: "ונואטו", timezone: "Pacific/Efate" },
  VEN: { nameEn: "Venezuela", name: "ונצואלה", timezone: "America/Caracas" },
  VNM: { nameEn: "Vietnam", name: "וייטנאם", timezone: "Asia/Ho_Chi_Minh" },
  YEM: { nameEn: "Yemen", name: "תימן", timezone: "Asia/Aden" },
  ZMB: { nameEn: "Zambia", name: "זמביה", timezone: "Africa/Lusaka" },
  ZWE: { nameEn: "Zimbabwe", name: "זימבבואה", timezone: "Africa/Harare" },
  PSE: { nameEn: "Palestine", name: "פלסטין", timezone: "Asia/Gaza" },
  XKX: { nameEn: "Kosovo", name: "קוסובו", timezone: "Europe/Belgrade" },
  SOL: { nameEn: "Somaliland", name: "סומלילנד", timezone: "Africa/Mogadishu" },
};

export const ISRAEL_TIMEZONE = "Asia/Jerusalem";

export function getCountryInfo(iso3Code) {
  return COUNTRY_TIMEZONES[iso3Code] || null;
}

export function getCurrentTimeInTimezone(timezone) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return null;
  }
}

export function getTimeDiffFromIsrael(timezone) {
  try {
    const now = new Date();
    const israelOffset = getTimezoneOffset(ISRAEL_TIMEZONE, now);
    const targetOffset = getTimezoneOffset(timezone, now);
    const diffHours = (targetOffset - israelOffset) / 60;
    return diffHours;
  } catch {
    return null;
  }
}

function getTimezoneOffset(timezone, date) {
  // Get UTC offset in minutes for a given timezone
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate - utcDate) / 60000;
}

export function formatTimeDiff(diffHours) {
  if (diffHours === 0) return "אותה שעה כמו ישראל";
  const sign = diffHours > 0 ? "+" : "";
  const absH = Math.abs(diffHours);
  if (Number.isInteger(diffHours)) {
    return `${sign}${diffHours} שעות מישראל`;
  }
  const hours = Math.floor(absH);
  const mins = Math.round((absH - hours) * 60);
  const direction = diffHours > 0 ? "קדימה" : "אחורה";
  if (hours === 0) return `${mins} דקות ${direction} מישראל`;
  return `${sign}${hours}:${String(mins).padStart(2, '0')} שעות מישראל`;
}
