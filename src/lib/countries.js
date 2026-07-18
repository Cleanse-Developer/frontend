// Country / state / postal reference data for the checkout + address forms.
//
// Scope note: this store ships from India via Shiprocket (India-only courier
// network + OTP). Non-India addresses are ACCEPTED and stored, and validation
// is relaxed per country so international checkout passes end to end — but
// fulfilment/serviceability remains India-only. See checkout/page.js.
//
// State handling: countries with a well-defined subdivision list (below) render
// a dropdown; every other country renders a free-text "State / Province /
// Region" input. Postal handling: India stays strict (6 digits); a few majors
// get a light format check; everyone else just needs a non-empty value.

export const DEFAULT_COUNTRY = "India";

// name + ISO-3166 alpha-2 code + E.164 dial code. Ordered India-first, then
// alphabetical, so the most common destination sits at the top of the dropdown.
export const COUNTRIES = [
  { code: "IN", name: "India", dial: "+91" },
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "AG", name: "Antigua and Barbuda", dial: "+1" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BS", name: "Bahamas", dial: "+1" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BB", name: "Barbados", dial: "+1" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BJ", name: "Benin", dial: "+229" },
  { code: "BT", name: "Bhutan", dial: "+975" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { code: "BW", name: "Botswana", dial: "+267" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "BN", name: "Brunei", dial: "+673" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "BF", name: "Burkina Faso", dial: "+226" },
  { code: "BI", name: "Burundi", dial: "+257" },
  { code: "KH", name: "Cambodia", dial: "+855" },
  { code: "CM", name: "Cameroon", dial: "+237" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CV", name: "Cape Verde", dial: "+238" },
  { code: "CF", name: "Central African Republic", dial: "+236" },
  { code: "TD", name: "Chad", dial: "+235" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "KM", name: "Comoros", dial: "+269" },
  { code: "CG", name: "Congo", dial: "+242" },
  { code: "CD", name: "Congo (DRC)", dial: "+243" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "CZ", name: "Czechia", dial: "+420" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "DJ", name: "Djibouti", dial: "+253" },
  { code: "DM", name: "Dominica", dial: "+1" },
  { code: "DO", name: "Dominican Republic", dial: "+1" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { code: "ER", name: "Eritrea", dial: "+291" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "SZ", name: "Eswatini", dial: "+268" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FJ", name: "Fiji", dial: "+679" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GA", name: "Gabon", dial: "+241" },
  { code: "GM", name: "Gambia", dial: "+220" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "GD", name: "Grenada", dial: "+1" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "GN", name: "Guinea", dial: "+224" },
  { code: "GW", name: "Guinea-Bissau", dial: "+245" },
  { code: "GY", name: "Guyana", dial: "+592" },
  { code: "HT", name: "Haiti", dial: "+509" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IQ", name: "Iraq", dial: "+964" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KI", name: "Kiribati", dial: "+686" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial: "+996" },
  { code: "LA", name: "Laos", dial: "+856" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LS", name: "Lesotho", dial: "+266" },
  { code: "LR", name: "Liberia", dial: "+231" },
  { code: "LY", name: "Libya", dial: "+218" },
  { code: "LI", name: "Liechtenstein", dial: "+423" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MO", name: "Macau", dial: "+853" },
  { code: "MG", name: "Madagascar", dial: "+261" },
  { code: "MW", name: "Malawi", dial: "+265" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "MV", name: "Maldives", dial: "+960" },
  { code: "ML", name: "Mali", dial: "+223" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "MH", name: "Marshall Islands", dial: "+692" },
  { code: "MR", name: "Mauritania", dial: "+222" },
  { code: "MU", name: "Mauritius", dial: "+230" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "FM", name: "Micronesia", dial: "+691" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "MN", name: "Mongolia", dial: "+976" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MZ", name: "Mozambique", dial: "+258" },
  { code: "MM", name: "Myanmar", dial: "+95" },
  { code: "NA", name: "Namibia", dial: "+264" },
  { code: "NR", name: "Nauru", dial: "+674" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "NE", name: "Niger", dial: "+227" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "KP", name: "North Korea", dial: "+850" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "PW", name: "Palau", dial: "+680" },
  { code: "PS", name: "Palestine", dial: "+970" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PG", name: "Papua New Guinea", dial: "+675" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "RW", name: "Rwanda", dial: "+250" },
  { code: "KN", name: "Saint Kitts and Nevis", dial: "+1" },
  { code: "LC", name: "Saint Lucia", dial: "+1" },
  { code: "VC", name: "Saint Vincent and the Grenadines", dial: "+1" },
  { code: "WS", name: "Samoa", dial: "+685" },
  { code: "SM", name: "San Marino", dial: "+378" },
  { code: "ST", name: "São Tomé and Príncipe", dial: "+239" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SN", name: "Senegal", dial: "+221" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SC", name: "Seychelles", dial: "+248" },
  { code: "SL", name: "Sierra Leone", dial: "+232" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "SB", name: "Solomon Islands", dial: "+677" },
  { code: "SO", name: "Somalia", dial: "+252" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "SS", name: "South Sudan", dial: "+211" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SR", name: "Suriname", dial: "+597" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "SY", name: "Syria", dial: "+963" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "TJ", name: "Tajikistan", dial: "+992" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TL", name: "Timor-Leste", dial: "+670" },
  { code: "TG", name: "Togo", dial: "+228" },
  { code: "TO", name: "Tonga", dial: "+676" },
  { code: "TT", name: "Trinidad and Tobago", dial: "+1" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "TM", name: "Turkmenistan", dial: "+993" },
  { code: "TV", name: "Tuvalu", dial: "+688" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VU", name: "Vanuatu", dial: "+678" },
  { code: "VA", name: "Vatican City", dial: "+39" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "YE", name: "Yemen", dial: "+967" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
];

// Curated subdivision lists. A country present here renders a state dropdown;
// anything absent falls back to a free-text region input.
const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const CANADA_STATES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
  "Yukon",
];

const AUSTRALIA_STATES = [
  "Australian Capital Territory", "New South Wales", "Northern Territory",
  "Queensland", "South Australia", "Tasmania", "Victoria",
  "Western Australia",
];

const UAE_STATES = [
  "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah",
  "Umm Al Quwain",
];

const UK_STATES = ["England", "Scotland", "Wales", "Northern Ireland"];

const STATES_BY_CODE = {
  IN: INDIA_STATES,
  US: US_STATES,
  CA: CANADA_STATES,
  AU: AUSTRALIA_STATES,
  AE: UAE_STATES,
  GB: UK_STATES,
};

// Suggested cities per country → state. These feed a <datalist> combobox, NOT a
// hard whitelist: the city field stays free-text so a customer in an unlisted
// town can still check out. State-name keys must match the STATES lists above
// exactly, or suggestions simply won't show. Countries/states absent here get a
// plain free-text city input.
const CITIES_BY_STATE = {
  IN: {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Manali"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Hazaribagh"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Shivamogga"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Navi Mumbai", "Aurangabad", "Solapur", "Kolhapur"],
    "Manipur": ["Imphal", "Thoubal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Noida", "Prayagraj", "Bareilly"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
    "Delhi": ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Puducherry": ["Puducherry", "Karaikal", "Yanam", "Mahe"],
  },
  US: {
    "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
    "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
    "Arizona": ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Chandler"],
    "Arkansas": ["Little Rock", "Fayetteville", "Fort Smith"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Oakland", "Long Beach"],
    "Colorado": ["Denver", "Colorado Springs", "Aurora", "Boulder", "Fort Collins"],
    "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford"],
    "Delaware": ["Wilmington", "Dover", "Newark"],
    "District of Columbia": ["Washington"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Tallahassee", "St. Petersburg"],
    "Georgia": ["Atlanta", "Savannah", "Augusta", "Columbus", "Athens"],
    "Hawaii": ["Honolulu", "Hilo", "Kailua"],
    "Idaho": ["Boise", "Nampa", "Idaho Falls"],
    "Illinois": ["Chicago", "Aurora", "Naperville", "Springfield", "Peoria"],
    "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"],
    "Iowa": ["Des Moines", "Cedar Rapids", "Davenport"],
    "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka"],
    "Kentucky": ["Louisville", "Lexington", "Bowling Green"],
    "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette"],
    "Maine": ["Portland", "Lewiston", "Bangor"],
    "Maryland": ["Baltimore", "Annapolis", "Rockville", "Frederick"],
    "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"],
    "Michigan": ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint"],
    "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth"],
    "Mississippi": ["Jackson", "Gulfport", "Biloxi"],
    "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia"],
    "Montana": ["Billings", "Missoula", "Bozeman", "Helena"],
    "Nebraska": ["Omaha", "Lincoln", "Bellevue"],
    "Nevada": ["Las Vegas", "Henderson", "Reno", "Carson City"],
    "New Hampshire": ["Manchester", "Nashua", "Concord"],
    "New Jersey": ["Newark", "Jersey City", "Trenton", "Atlantic City", "Princeton"],
    "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers"],
    "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
    "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
    "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
    "Oklahoma": ["Oklahoma City", "Tulsa", "Norman"],
    "Oregon": ["Portland", "Salem", "Eugene", "Bend"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Harrisburg", "Erie"],
    "Rhode Island": ["Providence", "Warwick", "Newport"],
    "South Carolina": ["Charleston", "Columbia", "Greenville", "Myrtle Beach"],
    "South Dakota": ["Sioux Falls", "Rapid City", "Pierre"],
    "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"],
    "Utah": ["Salt Lake City", "Provo", "West Valley City", "Park City"],
    "Vermont": ["Burlington", "Montpelier", "Rutland"],
    "Virginia": ["Virginia Beach", "Richmond", "Norfolk", "Arlington", "Alexandria"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue", "Olympia"],
    "West Virginia": ["Charleston", "Huntington", "Morgantown"],
    "Wisconsin": ["Milwaukee", "Madison", "Green Bay"],
    "Wyoming": ["Cheyenne", "Casper", "Jackson"],
  },
  CA: {
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach"],
    "New Brunswick": ["Moncton", "Saint John", "Fredericton"],
    "Newfoundland and Labrador": ["St. John's", "Mount Pearl", "Corner Brook"],
    "Northwest Territories": ["Yellowknife", "Hay River"],
    "Nova Scotia": ["Halifax", "Sydney", "Dartmouth"],
    "Nunavut": ["Iqaluit", "Rankin Inlet"],
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London", "Brampton", "Kitchener"],
    "Prince Edward Island": ["Charlottetown", "Summerside"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke"],
    "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert"],
    "Yukon": ["Whitehorse", "Dawson City"],
  },
  AU: {
    "Australian Capital Territory": ["Canberra"],
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
    "Northern Territory": ["Darwin", "Alice Springs", "Palmerston"],
    "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville", "Toowoomba"],
    "South Australia": ["Adelaide", "Mount Gambier", "Whyalla"],
    "Tasmania": ["Hobart", "Launceston", "Devonport"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Western Australia": ["Perth", "Fremantle", "Bunbury", "Mandurah"],
  },
  AE: {
    "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Madinat Zayed"],
    "Ajman": ["Ajman"],
    "Dubai": ["Dubai", "Jebel Ali", "Hatta"],
    "Fujairah": ["Fujairah", "Dibba Al-Fujairah"],
    "Ras Al Khaimah": ["Ras Al Khaimah"],
    "Sharjah": ["Sharjah", "Khor Fakkan", "Kalba"],
    "Umm Al Quwain": ["Umm Al Quwain"],
  },
  GB: {
    "England": ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Newcastle", "Sheffield"],
    "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn"],
  },
};

// Postal rules by ISO code. `regex` present → enforced format; absent → any
// non-empty value passes. India stays strict; the others are unambiguous
// enough to check without rejecting valid input.
const POSTAL_RULES = {
  IN: { regex: /^\d{6}$/, example: "560001", label: "Pincode" },
  US: { regex: /^\d{5}(-\d{4})?$/, example: "10001", label: "ZIP Code" },
  AU: { regex: /^\d{4}$/, example: "2000", label: "Postcode" },
  CA: { regex: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, example: "K1A 0B1", label: "Postal Code" },
  GB: { regex: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/, example: "SW1A 1AA", label: "Postcode" },
};

const _byName = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));
const _byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(nameOrCode) {
  if (!nameOrCode) return null;
  const key = String(nameOrCode).trim();
  return _byName.get(key.toLowerCase()) || _byCode.get(key.toUpperCase()) || null;
}

export function isIndia(countryName) {
  const c = findCountry(countryName);
  return !!c && c.code === "IN";
}

// State list for a country (by name or code). Empty array → use a free-text input.
export function statesForCountry(nameOrCode) {
  const c = findCountry(nameOrCode);
  return (c && STATES_BY_CODE[c.code]) || [];
}

export function hasStateList(nameOrCode) {
  return statesForCountry(nameOrCode).length > 0;
}

// Suggested cities for a country + state. Empty array → no suggestions (the city
// field stays a plain free-text input). Never a whitelist — see CITIES_BY_STATE.
export function citiesForState(countryNameOrCode, state) {
  const c = findCountry(countryNameOrCode);
  if (!c || !state) return [];
  return (CITIES_BY_STATE[c.code] && CITIES_BY_STATE[c.code][state]) || [];
}

// Dial code for a country name (falls back to India's +91).
export function dialForCountry(nameOrCode) {
  const c = findCountry(nameOrCode);
  return c ? c.dial : "+91";
}

// Field label for the postal input, so US users see "ZIP Code" etc.
export function postalLabel(nameOrCode) {
  const c = findCountry(nameOrCode);
  return (c && POSTAL_RULES[c.code]?.label) || "Postal Code";
}

export function postalExample(nameOrCode) {
  const c = findCountry(nameOrCode);
  return (c && POSTAL_RULES[c.code]?.example) || "";
}

// Country-aware postal validation. Returns an error string or null.
// Required for every country (the order schema needs a value); format is only
// enforced where POSTAL_RULES defines a regex.
export function validatePostal(value, countryName) {
  const v = (value || "").trim();
  const c = findCountry(countryName);
  const rule = c && POSTAL_RULES[c.code];
  const label = (rule && rule.label) || "Postal code";
  if (!v) return `${label} is required`;
  if (rule && rule.regex && !rule.regex.test(v)) {
    return `Please enter a valid ${label}${rule.example ? ` (e.g. ${rule.example})` : ""}`;
  }
  if (!rule && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(v)) {
    return "Please enter a valid postal code";
  }
  return null;
}

// Country-aware phone validation. India keeps the strict 10-digit mobile rule;
// other countries accept a general 6–15 digit international number.
export function validatePhoneForCountry(value, countryName) {
  const digits = (value || "").replace(/\D/g, "");
  if (isIndia(countryName)) {
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return "Please enter a valid 10-digit Indian mobile number";
    }
    return null;
  }
  if (digits.length < 6 || digits.length > 15) {
    return "Please enter a valid phone number";
  }
  return null;
}
