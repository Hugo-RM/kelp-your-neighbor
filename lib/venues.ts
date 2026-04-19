/**
 * Hardcoded venue mappings with coordinates for Monterey area events
 * Add venues as they're discovered from seemonterey.com
 */

export interface Venue {
  name: string;
  lat: number;
  lon: number;
}

export const VENUES: Record<string, Venue> = {
  'monterey_plaza_hotel': {
    name: 'Monterey Plaza Hotel',
    lat: 36.6059,
    lon: -121.8921
  },
  'golden_state_theatre': {
    name: 'Golden State Theatre',
    lat: 36.6013,
    lon: -121.8891
  },
  'pacific_grove_performing_arts': {
    name: 'Pacific Grove Performing Arts',
    lat: 36.6155,
    lon: -121.9193
  },
  'carmel_mission': {
    name: 'Carmel Mission Basilica',
    lat: 36.5596,
    lon: -121.9395
  },
  'pinnacles_national_park': {
    name: 'Pinnacles National Park',
    lat: 36.4827,
    lon: -121.1604
  },
  'cannery_row': {
    name: 'Cannery Row',
    lat: 36.6144,
    lon: -121.8891
  },
  'el_estero_park': {
    name: 'El Estero Park',
    lat: 36.6030,
    lon: -121.8777
  },
  'point_lobos': {
    name: 'Point Lobos State Natural Reserve',
    lat: 36.5297,
    lon: -121.9433
  },
  'monterey_bay_aquarium': {
    name: 'Monterey Bay Aquarium',
    lat: 36.6233,
    lon: -121.9012
  },
  'laguna_seca_raceway': {
    name: 'Laguna Seca Raceway',
    lat: 36.6658,
    lon: -121.7607
  },
  '19th_annual_women_s_fund_luncheon': {
    name: "19th Annual Women's Fund Luncheon",
    // Location: Hyatt Regency Monterey Hotel & Spa
    lat: 36.5912,
    lon: -121.8745,
  },

  '2nd_annual_salinas_day_2026': {
    name: '2nd Annual Salinas Day 2026',
    // Location: Oldtown Salinas / Main Street
    lat: 36.6777,
    lon: -121.6555,
  },

  '3rd_annual_moonflower_festival': {
    name: '3rd Annual Moonflower Festival',
    // Location: Moonflower Farms, Watsonville/North County
    lat: 36.8831,
    lon: -121.7228,
  },

  'a_climate_dance_party': {
    name: 'A Climate Dance Party',
    // Location: Other Brother Beer Co, Seaside
    lat: 36.6138,
    lon: -121.8485,
  },

  'an_evening_with_meshell_ndegeocello': {
    name: 'An Evening with Meshell Ndegeocello',
    // Location: Golden State Theatre
    lat: 36.5994,
    lon: -121.8939,
  },

  'an_evening_with_wente_vineyards': {
    name: 'An Evening with Wente Vineyards',
    // Location: Kimpton Mirador Hotel
    lat: 36.6191,
    lon: -121.9161,
  },

  'annual_fisheries_trust_dinner': {
    name: 'Annual Fisheries Trust Dinner',
    // Location: Monterey Bay Aquarium
    lat: 36.6183,
    lon: -121.9015,
  },

  'annual_walk_of_remembrance_celebrates_impacts_and_legacy': {
    name: 'Annual Walk of Remembrance Celebrates Impacts and Legacy',
    // Location: Pacific Grove Museum of Natural History (Start point)
    lat: 36.6214,
    lon: -121.9154,
  },

  'big_sur_international_marathon': {
    name: 'Big Sur International Marathon',
    // Location: Highway 1 (Finish line at Rio Road, Carmel)
    lat: 36.5372,
    lon: -121.9126,
  },

  'black_violin_full_circle_tour': {
    name: 'Black Violin - Full Circle Tour',
    // Location: Golden State Theatre
    lat: 36.5994,
    lon: -121.8939,
  },

  'blanton_s_tasting_at_twc_with_drew_mayville_buffalo_trace_master_blender': {
    name: "Blanton's Tasting at TWC with Drew Mayville, Buffalo Trace Master Blender",
    // Location: The Whisky Club, Monterey
    lat: 36.5992,
    lon: -121.8938,
  },

  'calidore_string_quartet_chamber_music_monterey_bay': {
    name: 'CALIDORE STRING QUARTET Chamber Music Monterey Bay',
    // Location: Sunset Center, Carmel
    lat: 36.5534,
    lon: -121.9208,
  },

  'calidore_string_quartet': {
    name: 'Calidore String Quartet',
    // Location: Sunset Center, Carmel
    lat: 36.5534,
    lon: -121.9208,
  },

  'chai_workshop': {
    name: 'Chai Workshop',
    // Location: Ad Astra Bread Co, Seaside
    lat: 36.6141,
    lon: -121.8482,
  },

  'chai_making_workshop': {
    name: 'Chai-making Workshop',
    // Location: Ad Astra Bread Co, Seaside
    lat: 36.6141,
    lon: -121.8482,
  },

  'cinco_de_mama': {
    name: 'Cinco De Mama',
    // Location: The Barns at Cooper Molera
    lat: 36.5968,
    lon: -121.8914,
  },

  'classic_car_drive_in_movie_series_mystery_movie': {
    name: 'Classic Car "Drive"-In Movie Series MYSTERY MOVIE',
    // Location: WeatherTech Raceway Laguna Seca
    lat: 36.5841,
    lon: -121.7533,
  },

  'coastal_collectors_card_show_ft_reggie_jackson': {
    name: 'Coastal Collectors Card Show ft. Reggie Jackson',
    // Location: Embassy Suites, Seaside
    lat: 36.6133,
    lon: -121.8415,
  },

  'controlled_chaos_improv_at_california_s_first_theatre': {
    name: "Controlled Chaos Improv at California's First Theatre!",
    // Location: California's First Theatre
    lat: 36.6022,
    lon: -121.8945,
  },

  'don_t_miss_the_all_new_sea_otter_classic_trail_run': {
    name: "Don't miss the all-new Sea Otter Classic Trail Run",
    // Location: Fort Ord National Monument
    lat: 36.6362,
    lon: -121.7651,
  },

  'fireside_chat_with_robert_wickens': {
    name: 'Fireside Chat with Robert Wickens',
    // Location: WeatherTech Raceway Laguna Seca
    lat: 36.5841,
    lon: -121.7533,
  },

  'floral_arrangement_workshop_with_katarina_ruiz_of_solstice_florals': {
    name: 'Floral Arrangement Workshop with Katarina Ruiz of Solstice Florals',
    // Location: Solstice Florals Studio, Marina
    lat: 36.6844,
    lon: -121.8021,
  },

  'four_new_exhibits_on_display_may1_june_25_2026': {
    name: 'Four New Exhibits on Display May1-June 25, 2026',
    // Location: Monterey Museum of Art
    lat: 36.5982,
    lon: -121.8954,
  },

  'gold_gingham_patio_party': {
    name: 'Gold & Gingham Patio Party',
    // Location: Bernardus Lodge & Spa
    lat: 36.5202,
    lon: -121.7654,
  },

  'good_old_days_street_festival': {
    name: 'Good Old Days Street Festival',
    // Location: Downtown Pacific Grove (Lighthouse Ave)
    lat: 36.6211,
    lon: -121.9169,
  },

  'happy_hour_on_the_half_shell': {
    name: 'Happy Hour on the Half Shell',
    // Location: Monterey Abalone Company
    lat: 36.6042,
    lon: -121.8921,
  },

  'history_food_and_fun': {
    name: 'History, Food, and Fun',
    // Location: Custom House Plaza
    lat: 36.6026,
    lon: -121.8937,
  },

  'hot_takes_trivia_family_feud_style': {
    name: 'Hot Takes Trivia: Family Feud Style',
    // Location: Post No Bills, Sand City
    lat: 36.6192,
    lon: -121.8488,
  },

  'ilya_yakushev_piano': {
    name: 'Ilya Yakushev, Piano',
    // Location: Sunset Center, Carmel
    lat: 36.5534,
    lon: -121.9208,
  },

  'journey_usa_the_hits_of_journey': {
    name: 'JOURNEY USA - The Hits of Journey',
    // Location: Golden State Theatre
    lat: 36.5994,
    lon: -121.8939,
  },

  'japanese_american_citizens_league_hall_centennial_celebration': {
    name: 'Japanese American Citizens League Hall Centennial Celebration',
    // Location: JACL Hall, Monterey
    lat: 36.5947,
    lon: -121.8902,
  },

  'jazz_at_the_bistro': {
    name: 'Jazz at The Bistro',
    // Location: Mission Ranch, Carmel
    lat: 36.5458,
    lon: -121.9195,
  },

  'lido_stage_presents_line_dancing_with_nanci': {
    name: 'Lido Stage Presents: Line Dancing with Nanci',
    // Location: Lido Stage, Monterey
    lat: 36.5997,
    lon: -121.8942,
  },

  'mearth_day': {
    name: 'MEarth Day',
    // Location: MEarth at Hilton Bialek Habitat, Carmel
    lat: 36.5432,
    lon: -121.8988,
  },

  'mpc_theatre_arts_presents_seussical': {
    name: 'MPC Theatre Arts presents Seussical',
    // Location: Monterey Peninsula College Theater
    lat: 36.5925,
    lon: -121.8844,
  },

  'monday_night_putters_spring_2026_league': {
    name: 'Monday Night Putters® - Spring 2026 League',
    // Location: Tipsy Putt, Monterey
    lat: 36.6178,
    lon: -121.9011,
  },

  'monterey_bay_poetry_festival_2026': {
    name: 'Monterey Bay Poetry Festival 2026',
    // Location: Middlebury Institute of International Studies
    lat: 36.5991,
    lon: -121.8968,
  },

  'monterey_sportscar_championship': {
    name: 'Monterey SportsCar Championship',
    // Location: WeatherTech Raceway Laguna Seca
    lat: 36.5841,
    lon: -121.7533,
  },

  'music_show_featuring_paige_too': {
    name: 'Music Show Featuring Paige Too',
    // Location: Cibo Restaurant & Bar
    lat: 36.5998,
    lon: -121.8929,
  },

  'native_american_art_exhibit_reception': {
    name: 'Native American Art Exhibit & Reception',
    // Location: Pacific Grove Art Center
    lat: 36.6214,
    lon: -121.9207,
  },

  'pawty_for_peace_of_mind_dog_rescue': {
    name: 'PAWTY for Peace of Mind Dog Rescue',
    // Location: Hofsas House Hotel
    lat: 36.5574,
    lon: -121.9215,
  },

  'pacific_grove_art_center': {
    name: 'Pacific Grove Art Center',
    lat: 36.6214,
    lon: -121.9207,
  },

  'pebble_beach_food_wine': {
    name: 'Pebble Beach Food & Wine',
    // Location: Pebble Beach Event Center
    lat: 36.5664,
    lon: -121.9467,
  },

  'race_for_open_space': {
    name: 'Race for Open Space',
    // Location: Palo Corona Regional Park
    lat: 36.5361,
    lon: -121.9082,
  },

  'santa_lucia_highlands_sun_wind_wine_festival': {
    name: 'Santa Lucia Highlands Sun, Wind & Wine Festival',
    // Location: Mer Soleil Winery, Salinas
    lat: 36.5512,
    lon: -121.4321,
  },

  'scarlet_nights_at_carmel_mission_inn': {
    name: 'Scarlet Nights at Carmel Mission Inn',
    // Location: Carmel Mission Inn
    lat: 36.5415,
    lon: -121.9112,
  },

  'sip_paw_stay_comedy': {
    name: 'Sip Paw Stay Comedy',
    // Location: Alvarado Street Brewery, Salinas location
    lat: 36.6742,
    lon: -121.6568,
  },

  'spring_makers_market': {
    name: 'Spring Makers Market',
    // Location: Carmel Valley Village
    lat: 36.4831,
    lon: -121.7345,
  },

  'spring_released_party': {
    name: 'Spring Released Party',
    // Location: Tira Nanza Wines
    lat: 36.3861,
    lon: -121.6502,
  },

  'sun_wind_wine_festival': {
    name: 'Sun, Wind & Wine Festival',
    // Location: Mer Soleil Winery
    lat: 36.5512,
    lon: -121.4321,
  },

  'sunset_center': {
    name: 'Sunset Center',
    lat: 36.5534,
    lon: -121.9208,
  },

  'take_a_walk_on_the_wild_side': {
    name: 'Take a Walk on the Wild Side',
    // Location: Monterey Zoo
    lat: 36.5939,
    lon: -121.6247,
  },

  'taste_of_monterey_bay_beer_food_wine': {
    name: 'Taste of Monterey Bay-Beer Food & Wine',
    // Location: Custom House Plaza
    lat: 36.6026,
    lon: -121.8937,
  },

  'tea_pj_social': {
    name: 'Tea + PJ Social',
    // Location: Captain's Gig, Pacific Grove
    lat: 36.6212,
    lon: -121.9172,
  },

  'three_pie_dough_making_masterclasses_hosted_by_sugar_science': {
    name: 'Three Pie Dough-Making Masterclasses hosted by Sugar Science',
    // Location: Hidden Valley Music Seminars, Carmel Valley
    lat: 36.4845,
    lon: -121.7331,
  },

  'wags_on_the_runway': {
    name: 'WAGS on the Runway',
    // Location: Quail Lodge & Golf Club
    lat: 36.5215,
    lon: -121.8542,
  },

  'whalefest': {
    name: 'Whalefest',
    // Location: Old Fisherman's Wharf
    lat: 36.6042,
    lon: -121.8931,
  },

  'wineglass_clarinet_concerto_zappa_beethoven_s_eroica': {
    name: "Wineglass Clarinet Concerto + Zappa + Beethoven's Eroica",
    // Location: Sunset Center, Carmel
    lat: 36.5534,
    lon: -121.9208,
  },

  'winemakers_dinner': {
    name: 'Winemakers Dinner',
    // Location: Bernardus Lodge & Spa
    lat: 36.5202,
    lon: -121.7654,
  },

  'wizard_of_oz_on_ice': {
    name: 'Wizard of Oz on Ice',
    // Location: Monterey County Fairgrounds (Arena)
    lat: 36.5915,
    lon: -121.8642,
  },
};

/**
 * Normalize venue name and find matching coordinates
 * Returns coordinates or null if not found in hardcoded venues
 */
export function getVenueCoordinates(venueName: string): { lat: number; lon: number } | null {
  if (!venueName) return null;

  const normalizedInput = venueName.toLowerCase().trim();

  // Try exact matches first
  for (const venue of Object.values(VENUES)) {
    if (venue.name.toLowerCase() === normalizedInput) {
      return { lat: venue.lat, lon: venue.lon };
    }
  }

  // Try partial matches
  for (const venue of Object.values(VENUES)) {
    if (
      venue.name.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(venue.name.toLowerCase())
    ) {
      return { lat: venue.lat, lon: venue.lon };
    }
  }

  return null;
}

/**
 * Fallback coordinates for Monterey center
 */
export const MONTEREY_CENTER = {
  lat: 36.6002,
  lon: -121.8863
};
