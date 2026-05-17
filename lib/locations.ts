export type StateLocation = {
  state: string;
  cities: string[];
};

export const LOCATIONS: StateLocation[] = [
  {
    state: "Abia",
    cities: ["Umuahia", "Aba", "Ohafia", "Arochukwu", "Bende", "Isuikwuato", "Isiala Ngwa", "Ugwunagbo", "Ukwa"],
  },
  {
    state: "Adamawa",
    cities: ["Yola", "Jimeta", "Mubi", "Numan", "Ganye", "Michika", "Guyuk", "Gombi", "Hong", "Maiha", "Demsa"],
  },
  {
    state: "Akwa Ibom",
    cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Ikot Abasi", "Abak", "Essien Udim", "Itu", "Etinan", "Ini", "Mkpat Enin"],
  },
  {
    state: "Anambra",
    cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ogidi", "Ihiala", "Aguata", "Ozubulu", "Aguleri", "Obosi", "Abagana", "Nnewi North"],
  },
  {
    state: "Bauchi",
    cities: ["Bauchi", "Azare", "Misau", "Dass", "Tafawa Balewa", "Ningi", "Katagum", "Jama'are", "Ganjuwa", "Alkaleri"],
  },
  {
    state: "Bayelsa",
    cities: ["Yenagoa", "Ogbia", "Brass", "Sagbama", "Ekeremor", "Nembe", "Kolokuma", "Opokuma", "Southern Ijaw"],
  },
  {
    state: "Benue",
    cities: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Zaki Biam", "Aliade", "Vandekya", "Adikpo", "Oju", "Ugbokolo", "Otukpa"],
  },
  {
    state: "Borno",
    cities: ["Maiduguri", "Biu", "Gwoza", "Dikwa", "Monguno", "Bama", "Konduga", "Damboa", "Askira", "Chibok", "Mafa"],
  },
  {
    state: "Cross River",
    cities: ["Calabar", "Ogoja", "Ikom", "Obudu", "Ugep", "Akamkpa", "Obubra", "Yala", "Boki", "Etung", "Yakurr"],
  },
  {
    state: "Delta",
    cities: ["Asaba", "Warri", "Effurun", "Sapele", "Ughelli", "Agbor", "Ozoro", "Abraka", "Kwale", "Ibusa", "Oleh", "Ogwashi-Uku"],
  },
  {
    state: "Ebonyi",
    cities: ["Abakaliki", "Afikpo", "Onueke", "Ezza", "Edda", "Ishiagu", "Nkalagu", "Ikwo", "Ohaozara"],
  },
  {
    state: "Edo",
    cities: ["Benin City", "Ekpoma", "Auchi", "Uromi", "Igueben", "Ubiaja", "Fugar", "Igarra", "Okpella", "Sabongida-Ora", "Warake"],
  },
  {
    state: "Ekiti",
    cities: ["Ado-Ekiti", "Ikere-Ekiti", "Ijero-Ekiti", "Oye-Ekiti", "Efon-Alaaye", "Aramoko-Ekiti", "Ilawe-Ekiti", "Ido-Ekiti", "Emure-Ekiti"],
  },
  {
    state: "Enugu",
    cities: ["Enugu", "Nsukka", "Agbani", "Oji River", "Awgu", "Udi", "9th Mile Corner", "Iva Valley", "Ugwuaji", "Abakpa", "Ogui"],
  },
  {
    state: "FCT (Abuja)",
    cities: ["Abuja (Central)", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Lugbe", "Kuje", "Gwagwalada", "Bwari", "Kwali", "Abaji", "Karshi"],
  },
  {
    state: "Gombe",
    cities: ["Gombe", "Kaltungo", "Billiri", "Nafada", "Dukku", "Bajoga", "Kumo", "Pindiga", "Funakaye"],
  },
  {
    state: "Imo",
    cities: ["Owerri", "Orlu", "Okigwe", "Oguta", "Nkwerre", "Nnokwa", "Mbaise", "Mbano", "Ngor-Okpala", "Ohaji"],
  },
  {
    state: "Jigawa",
    cities: ["Dutse", "Hadejia", "Gumel", "Birnin Kudu", "Kazaure", "Ringim", "Babura", "Guri", "Kiyawa", "Mallam Madori", "Sule Tankarkar"],
  },
  {
    state: "Kaduna",
    cities: ["Kaduna", "Zaria", "Kafanchan", "Kagoro", "Birnin Gwari", "Zonkwa", "Kachia", "Saminaka", "Ikara", "Giwa", "Soba"],
  },
  {
    state: "Kano",
    cities: ["Kano", "Wudil", "Rano", "Bichi", "Gwarzo", "Kura", "Karaye", "Danbatta", "Dawakin Kudu", "Tofa", "Gezawa", "Ungogo"],
  },
  {
    state: "Katsina",
    cities: ["Katsina", "Daura", "Funtua", "Kankia", "Malumfashi", "Dutsin-Ma", "Mashi", "Rimi", "Kaita", "Jibia", "Batsari", "Musawa"],
  },
  {
    state: "Kebbi",
    cities: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Koko", "Bagudo", "Gwandu", "Kalgo", "Maiyama", "Augie"],
  },
  {
    state: "Kogi",
    cities: ["Lokoja", "Okene", "Kabba", "Anyigba", "Idah", "Ogaminana", "Ajaokuta", "Egbe", "Isanlu", "Obangede", "Okengwe"],
  },
  {
    state: "Kwara",
    cities: ["Ilorin", "Offa", "Omu-Aran", "Patigi", "Kaiama", "Share", "Lafiagi", "Jebba", "Ajasse-Ipo", "Oro"],
  },
  {
    state: "Lagos",
    cities: ["Lagos Island", "Victoria Island", "Ikeja", "Surulere", "Yaba", "Apapa", "Gbagada", "Lekki", "Ajah", "Ikorodu", "Badagry", "Epe", "Alimosho", "Mushin", "Isale-Eko", "Amuwo-Odofin", "Ojo", "Agege"],
  },
  {
    state: "Nasarawa",
    cities: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Doma", "Wamba", "Obi", "Awe", "Keana", "Toto"],
  },
  {
    state: "Niger",
    cities: ["Minna", "Bida", "Suleja", "Kontagora", "Lapai", "Kagara", "Mokwa", "New Bussa", "Agaie", "Rijau", "Wushishi"],
  },
  {
    state: "Ogun",
    cities: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ilaro", "Ota", "Ifo", "Ogijo", "Ijebu-Igbo", "Ewekoro", "Ipokia"],
  },
  {
    state: "Ondo",
    cities: ["Akure", "Ondo", "Owo", "Okitipupa", "Ore", "Ikare-Akoko", "Idanre", "Ile-Oluji", "Ifon", "Oba-Ile"],
  },
  {
    state: "Osun",
    cities: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Inisa", "Erin-Oke", "Ipetumodu", "Ikirun", "Iragbiji", "Ejigbo"],
  },
  {
    state: "Oyo",
    cities: ["Ibadan", "Ogbomosho", "Oyo", "Saki", "Iseyin", "Igboho", "Eruwa", "Igbo-Ora", "Fiditi", "Lalupon", "Moniya"],
  },
  {
    state: "Plateau",
    cities: ["Jos", "Bukuru", "Vom", "Pankshin", "Shendam", "Langtang", "Barkin Ladi", "Mangu", "Bokkos", "Wase", "Kanke"],
  },
  {
    state: "Rivers",
    cities: ["Port Harcourt", "Eleme", "Bonny", "Degema", "Ahoada", "Omoku", "Oyigbo", "Okrika", "Ogu", "Bori", "Nchia", "Rumuola"],
  },
  {
    state: "Sokoto",
    cities: ["Sokoto", "Wurno", "Rabah", "Tambuwal", "Isa", "Bodinga", "Dange", "Goronyo", "Gudu", "Illela"],
  },
  {
    state: "Taraba",
    cities: ["Jalingo", "Wukari", "Bali", "Gassol", "Zing", "Karim Lamido", "Ibi", "Takum", "Ussa", "Sardauna"],
  },
  {
    state: "Yobe",
    cities: ["Damaturu", "Potiskum", "Gashua", "Nguru", "Nangere", "Gujba", "Geidam", "Bade", "Machina", "Tarmuwa"],
  },
  {
    state: "Zamfara",
    cities: ["Gusau", "Kaura Namoda", "Anka", "Talata Mafara", "Zurmi", "Maradun", "Bungudu", "Maru", "Bakura", "Birnin Magaji"],
  },
];

export function getCitiesByState(state: string): string[] {
  const found = LOCATIONS.find(
    (l) => l.state.toLowerCase() === state.toLowerCase()
  );
  return found ? found.cities : [];
}
