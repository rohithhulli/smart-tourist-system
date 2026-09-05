"""
Curated destination facts registry for Karnataka destinations.
Enriches DestinationService responses with structured information for:
- Tagline, Rating, Suggested Duration
- Why Visit cards (History, Culture, Architecture, Nature, Food, Shopping, Adventure, Family)
- Things to Do, Local Food, Shopping, Culture & Festivals
- How to Reach (Air, Rail, Bus, Road)
- Best Time to Visit (Weather, Peak, Off-season)
- Travel Tips & FAQs
- Nearby Destinations
"""
from typing import Any, Dict

DESTINATION_FACTS: Dict[str, Dict[str, Any]] = {
    "mysuru": {
        "tagline": "Cultural Capital of Karnataka",
        "rating": 4.9,
        "suggested_duration": "3 Days / 2 Nights",
        "why_visit": [
            {"title": "Royal Wadiyar Heritage", "desc": "Witness grand Indo-Saracenic palaces, royal art durbar halls, and century-old state traditions.", "icon": "Landmark", "tag": "History"},
            {"title": "Living Silk & Sandalwood Traditions", "desc": "Famous worldwide for pure Mysore Silk weaving and heavenly fragrant Sandalwood crafts.", "icon": "Sparkles", "tag": "Culture"},
            {"title": "Architectural Splendor", "desc": "From the illuminated domes of Mysore Palace to the Gothic spires of St. Philomena's.", "icon": "Layers", "tag": "Architecture"},
            {"title": "Lush Green Sanctuaries", "desc": "Chamundi Hills trails, Ranganathittu Bird Sanctuary, and Karanji Lake's sprawling aviary.", "icon": "Trees", "tag": "Nature"},
            {"title": "Culinary Heritage", "desc": "Birthplace of the melt-in-mouth Mysore Pak, crispy Mylari Dosas, and filter coffee.", "icon": "Utensils", "tag": "Food"},
            {"title": "Vibrant Artisan Bazaars", "desc": "The 130-year-old Devaraja Market packed with colorful flowers, oils, and spices.", "icon": "ShoppingBag", "tag": "Shopping"},
            {"title": "Family Friendly Escapes", "desc": "India's oldest century-old Mysore Zoo and the musical fountains of Brindavan Gardens.", "icon": "Users", "tag": "Family"},
            {"title": "Yoga & Spiritual Center", "desc": "Global hub for Ashtanga Yoga with seekers visiting Gokulam year-round.", "icon": "Heart", "tag": "Wellness"},
        ],
        "things_to_do": [
            {"title": "Mysore Palace Grand Tour", "desc": "Explore ornate carved doors, silver thrones, stained glass ceilings, and the Sunday night illumination.", "badge": "Must Do"},
            {"title": "Chamundi Hills Pilgrimage", "desc": "Ascend 1,000 stone steps to Chamundeshwari Temple and see the colossal monolithic Nandi Bull.", "badge": "Spiritual"},
            {"title": "Heritage Walk in Devaraja Market", "desc": "Stroll down fragrant lanes filled with jasmine garlands, traditional agarbattis, and regional sweets.", "badge": "Culture"},
            {"title": "Sunset at Brindavan Gardens", "desc": "Admire terraced garden layouts and animated illuminated musical fountain performances.", "badge": "Leisure"},
            {"title": "Wildlife at Sri Chamarajendra Zoo", "desc": "Walk through one of India's best-managed zoological parks, home to exotic wildlife in lush habitats.", "badge": "Family"},
            {"title": "Birding at Ranganathittu", "desc": "Take a tranquil boat ride along the Cauvery river islets surrounded by migratory painted storks and marsh crocodiles.", "badge": "Nature"},
        ],
        "local_food": [
            {"name": "Mysore Pak", "desc": "Royal melt-in-mouth dessert crafted with pure desi ghee, gram flour, and cardamom sugar syrup.", "origin": "Created in royal palace kitchens"},
            {"name": "Mysore Masala Dosa", "desc": "Crispy golden fermented crepe layered with fiery red garlic-chilli chutney and spiced potato masala.", "origin": "Iconic eatery: Vinayaka Mylari"},
            {"name": "Idli Vada with Sambar", "desc": "Pillowy steamed rice cakes paired with crunchy spiced medu vada and coconut chutney.", "origin": "Traditional breakfast favorite"},
            {"name": "Chiroti & Badam Milk", "desc": "Flaky layered pastry dusted with powdered sugar and drizzled with saffron almond milk.", "origin": "Festive specialty"},
        ],
        "shopping": [
            {"name": "Devaraja Market", "desc": "130-year-old open market famous for traditional perfumes, fresh spices, jaggery, and flowers.", "type": "Traditional Bazaar"},
            {"name": "KSIC Mysore Silk Weaving Factory", "desc": "Government authenticated pure silk sarees crafted with genuine gold and silver zari threads.", "type": "Silk Sarees"},
            {"name": "Cauvery Handicrafts Emporium", "desc": "Intricately carved sandalwood statues, rosewood inlay artwork, and fragrant essential oils.", "type": "Handicrafts"},
        ],
        "culture_festivals": [
            {"name": "Mysuru Dasara (Nada Habba)", "season": "Sep – Oct", "desc": "State festival culminating in the majestic Jumboo Savari elephant procession with the golden howdah.", "highlight": "100,000 bulbs palace lighting"},
            {"name": "Chamundeshwari Car Festival", "season": "October", "desc": "Devotional rathotsava gathering thousands pulling the mammoth wooden chariot atop Chamundi Hill.", "highlight": "Ancient rituals & processions"},
        ],
        "how_to_reach": {
            "air": "Mysore Airport (MYQ) has regional flights to Chennai, Hyderabad, and Goa. Kempegowda International Airport Bengaluru (BLR, 175 km) is the primary gateway with expressway flybus connectivity.",
            "railway": "Mysuru Junction (MYS) is well-connected with Vande Bharat Express and Shatabdi Express to Bengaluru and Chennai, plus daily trains to all major Indian hubs.",
            "bus": "KSRTC runs high-frequency Airavat Volvo AC buses from Bengaluru Kempegowda Bus Station (every 10 minutes) via the 10-lane Expressway.",
            "road": "The 10-lane Bengaluru-Mysuru Expressway (NH 275) reduces driving time to just 90 minutes from Bengaluru.",
        },
        "best_time_details": {
            "months": "October to March",
            "weather": "Pleasant tropical climate with mild days (22°C - 28°C) and refreshing cool evenings (15°C - 19°C).",
            "peak_season": "October during Dasara and December holidays.",
            "off_season": "April to June (summer peak, warmer afternoons).",
        },
        "travel_tips": [
            "Book Mysore Palace illumination tickets in advance or visit Sunday evenings between 7:00 PM and 7:45 PM.",
            "Respect dress code when entering Chamundeshwari Temple (cover shoulders and knees; footwear deposit available).",
            "Prefer official KSRTC bus shuttles or prepaid auto-rickshaws for hassle-free local commuting.",
            "Buy GI-tagged Mysore Silk exclusively from government KSIC outlets to ensure authenticity.",
        ],
        "faqs": [
            {"q": "What is the best time to see Mysore Palace illuminated?", "a": "The palace is illuminated with over 100,000 bulbs every Sunday and on public holidays from 7:00 PM to 7:45 PM, and daily throughout the 10 days of Dasara."},
            {"q": "How many days are needed to comfortably tour Mysuru?", "a": "2 to 3 days are recommended to tour the major palaces, Chamundi Hills, Mysore Zoo, Ranganathittu Bird Sanctuary, and Srirangapatna."},
            {"q": "Can I visit Mysuru on a day trip from Bengaluru?", "a": "Yes, with the Bengaluru-Mysuru Expressway and Vande Bharat trains taking around 90 minutes, day trips are viable, though staying 1-2 nights is far more rewarding."},
            {"q": "Is photography allowed inside Mysore Palace?", "a": "Photography is allowed in the outer courtyard and grounds. Inside the palace residential museum, mobile cameras are allowed but tripods and professional video cameras are restricted."},
        ],
        "nearby_destinations": [
            {"name": "Srirangapatna", "slug": "mysuru", "distance_km": 16, "hero_image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=600&q=80", "category": "Heritage & Forts"},
            {"name": "Coorg (Madikeri)", "slug": "coorg", "distance_km": 118, "hero_image": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80", "category": "Hill Station"},
            {"name": "Bengaluru", "slug": "bengaluru", "distance_km": 140, "hero_image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80", "category": "Metropolis"},
            {"name": "Chikkamagaluru", "slug": "chikkamagaluru", "distance_km": 170, "hero_image": "https://images.unsplash.com/photo-1628080644488-0f04c60c6d58?auto=format&fit=crop&w=600&q=80", "category": "Coffee Country"},
        ],
    },
    "hampi": {
        "tagline": "UNESCO World Heritage Boulder Kingdom",
        "rating": 4.9,
        "suggested_duration": "3 Days / 2 Nights",
        "why_visit": [
            {"title": "Open Air Living Museum", "desc": "Over 500 ancient monument ruins sprawling across surreal boulder-strewn hills and valleys.", "icon": "Landmark", "tag": "Heritage"},
            {"title": "Engineering Marvels", "desc": "Acoustic musical pillars at Vittala Temple and the world-famed monolithic Stone Chariot.", "icon": "Layers", "tag": "Architecture"},
            {"title": "Epic Mythological Landscape", "desc": "Revered as ancient Kishkindha from the Ramayana, with Anjanadri Hill as Hanuman's birthplace.", "icon": "Sparkles", "tag": "Mythology"},
            {"title": "Breathtaking Sunsets", "desc": "Panoramic twilight views from atop Matanga Hill and Hemakuta Hill overlooking Tungabhadra.", "icon": "Sun", "tag": "Nature"},
            {"title": "Bouldering & Adventure", "desc": "Internationally renowned rock climbing and bouldering terrain across the Hippie Island side.", "icon": "Compass", "tag": "Adventure"},
            {"title": "Riverside Coracle Rides", "desc": "Traditional round wicker boat rides along the gentle eddies of the Tungabhadra River.", "icon": "Navigation", "tag": "Experience"},
        ],
        "things_to_do": [
            {"title": "Explore Vijaya Vittala Complex", "desc": "Marvel at the Stone Chariot, the sprawling mandapas, and listen to the resonance of musical pillars.", "badge": "Iconic"},
            {"title": "Sunrise from Matanga Hill", "desc": "Hike the ancient stone steps before dawn for a 360-degree sunrise panorama of temple gopurams.", "badge": "Scenic"},
            {"title": "Virupaksha Temple Darshan", "desc": "Visit the 7th-century functioning temple where daily poojas continue uninterrupted.", "badge": "Spiritual"},
            {"title": "Cycle Through the Royal Enclosure", "desc": "Rent a bicycle to discover the Stepped Tank, Lotus Mahal, and Elephant Stables.", "badge": "Adventure"},
            {"title": "Coracle Ride on Tungabhadra", "desc": "Glide past rock-cut Shiva lingas and secluded temple ruins on a circular country boat.", "badge": "Unique"},
        ],
        "local_food": [
            {"name": "Karnataka Thali (Jowar Rotti Meals)", "desc": "Nutritious roasted sorghum flatbread served with brinjal curry (enne gai), spicy chutney powders, and fresh curd.", "origin": "North Karnataka staple"},
            {"name": "Tender Coconut & Pomegranate Juice", "desc": "Refreshing local farm juices available throughout the temple ruins.", "origin": "Hydration essential"},
            {"name": "South Indian Filter Coffee", "desc": "Hot frothed chicory coffee brewed in brass dabarah cups.", "origin": "Morning energizer"},
        ],
        "shopping": [
            {"name": "Hampi Bazaar", "desc": "Ancient pillared street lined with handicrafts, leather journals, stone replicas of the chariot, and gypsy jewelry.", "type": "Antique Market"},
            {"name": "Kamalapura Co-operatives", "desc": "Handloom cotton shirts, banana fiber bags, and artisanal bronze figurines.", "type": "Handloom"},
        ],
        "culture_festivals": [
            {"name": "Hampi Utsav (Vijaya Utsav)", "season": "Nov – Jan", "desc": "Mega cultural festival illuminating boulder monuments with sound, laser shows, and classical dance performances.", "highlight": "Ancient monuments illuminated"},
            {"name": "Virupaksha Car Festival", "season": "March / April", "desc": "Annual temple chariot procession down Hampi Bazaar.", "highlight": "Grand wooden chariot"},
        ],
        "how_to_reach": {
            "air": "Jindal Vijayanagar Airport (VDY, 35 km) connects to Bengaluru and Hyderabad. Hubballi Airport (HBX, 160 km) offers broader connectivity.",
            "railway": "Hosapete Junction (HPT, 12 km) has daily direct express trains from Bengaluru, Hyderabad, Mumbai, and Goa.",
            "bus": "KSRTC overnight sleeper and Rajahamsa buses run daily from Bengaluru, Mysuru, Hubballi, and Panaji to Hosapete.",
            "road": "Well connected via NH 48 and NH 50. Driving distance from Bengaluru is approximately 340 km (6-7 hours).",
        },
        "best_time_details": {
            "months": "October to March",
            "weather": "Sunny, dry days with cool breezes (20°C - 30°C) and crisp nights.",
            "peak_season": "November through January.",
            "off_season": "April to June (high summer heat, reaching 40°C).",
        },
        "travel_tips": [
            "Rent a bicycle or electric scooter to explore the sprawling ruins spanning over 25 sq km.",
            "Carry cash as ATM networks in the heritage core can be intermittent.",
            "Start your excursions early (7:00 AM) and rest during the peak afternoon heat (12:30 PM - 3:00 PM).",
            "Hire an authorized ASI certified guide at the Vittala or Virupaksha complex for authentic historical context.",
        ],
        "faqs": [
            {"q": "How many days are recommended for Hampi?", "a": "At least 2 to 3 days to explore both the Sacred Center (temples) and the Royal Center, plus the Sanapur Lake side."},
            {"q": "Are the monuments open on all days?", "a": "Yes, outdoor monuments are open from sunrise to sunset. Ticketed monuments like Vittala Temple and Lotus Mahal close at 5:30 PM."},
            {"q": "Is non-vegetarian food and alcohol available in Hampi?", "a": "The sacred core around Virupaksha Temple is strictly vegetarian. Dining with non-vegetarian options is available across the river or in Hosapete town."},
        ],
        "nearby_destinations": [
            {"name": "Badami", "slug": "badami", "distance_km": 140, "hero_image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", "category": "Cave Temples"},
            {"name": "Pattadakal & Aihole", "slug": "pattadakal-aihole", "distance_km": 135, "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80", "category": "Cradle of Architecture"},
            {"name": "Chitradurga", "slug": "chitradurga", "distance_km": 130, "hero_image": "https://images.unsplash.com/photo-1600100397608-f416d6c66e2c?auto=format&fit=crop&w=600&q=80", "category": "Stone Fort"},
        ],
    },
    "coorg": {
        "tagline": "The Scotland of India & Coffee Country",
        "rating": 4.8,
        "suggested_duration": "3 Days / 2 Nights",
        "why_visit": [
            {"title": "Misty Coffee & Spice Plantations", "desc": "Wake up to the aroma of freshly roasted Arabica beans and cardamom orchards.", "icon": "Trees", "tag": "Nature"},
            {"title": "Majestic Waterfalls", "desc": "Gushing torrents at Abbey Falls, Iruppu Falls, and hidden mountain cascades.", "icon": "Droplets", "tag": "Scenic"},
            {"title": "Rich Kodava Martial Culture", "desc": "Distinctive customs, traditional dress (Kupya), and renowned Kodava hospitality.", "icon": "Sparkles", "tag": "Culture"},
            {"title": "Tibetan Golden Temple", "desc": "Bylakuppe, one of India's largest Tibetan settlements with monumental golden Buddha statues.", "icon": "Heart", "tag": "Spiritual"},
            {"title": "Trekking in Western Ghats", "desc": "Trails up Tadiandamol Peak (highest in Coorg), Pushpagiri, and Brahmagiri.", "icon": "Compass", "tag": "Trekking"},
        ],
        "things_to_do": [
            {"title": "Plantation Walking Tour", "desc": "Learn how coffee, black pepper, and vanilla are harvested and processed.", "badge": "Signature"},
            {"title": "Visit Abbey Falls", "desc": "Walk along hanging bridges surrounded by lush coffee shrubs to view the thundering falls.", "badge": "Scenic"},
            {"title": "Explore Namdroling Monastery", "desc": "Listen to soothing monk chants and admire 40-foot gilded Buddha statues.", "badge": "Peaceful"},
            {"title": "Sunset from Raja's Seat", "desc": "The historic vantage point where Kodagu kings watched crimson sunsets over mist-filled valleys.", "badge": "Romantic"},
            {"title": "Elephant Bathing at Dubare", "desc": "Interact with elephants, assist in scrubbing them by the Cauvery river, and learn about conservation.", "badge": "Wildlife"},
        ],
        "local_food": [
            {"name": "Pandi Curry & Kadambuttu", "desc": "Slow-cooked pork curry prepared with dark kachampuli vinegar, paired with steamed rice dumplings.", "origin": "Kodava signature feast"},
            {"name": "Akki Roti with Bamboo Shoot Curry", "desc": "Crisp rice flatbread with wild seasonal bamboo shoot (baimbale) curry.", "origin": "Traditional homestyle"},
            {"name": "Coorg Estate Coffee", "desc": "Shade-grown single origin Arabica coffee roasted and freshly ground.", "origin": "Local plantation crop"},
        ],
        "shopping": [
            {"name": "Madikeri Spice Market", "desc": "Freshly harvested green cardamom, cloves, cinnamon bark, black peppercorns, and nutmeg.", "type": "Spices"},
            {"name": "Estate Coffee Stores", "desc": "Pure Robusta, Arabica, and chicory coffee blends directly packaged from local estates.", "type": "Coffee"},
            {"name": "Coorg Honey & Chocolates", "desc": "Pure organic forest honey and artisanal homemade dark chocolates.", "type": "Confectionery"},
        ],
        "culture_festivals": [
            {"name": "Kailpodh (Festival of Arms)", "season": "September", "desc": "Harvest festival where Kodava weapons and agricultural implements are cleaned and worshipped.", "highlight": "Traditional martial games"},
            {"name": "Puthari (Harvest Festival)", "season": "Nov – Dec", "desc": "First sheaf of paddy cut ceremonially in the fields amidst gunfire salutes and folk dances.", "highlight": "Folk dances & feasts"},
        ],
        "how_to_reach": {
            "air": "Kannur International Airport (CNN, 90 km) and Mangaluru Airport (IXE, 140 km) offer convenient flights.",
            "railway": "Mysuru Junction (MYS, 118 km) and Hassan (115 km) are the closest major railway hubs.",
            "bus": "Regular KSRTC AC sleeper and non-AC buses link Madikeri with Bengaluru, Mysuru, and Mangaluru.",
            "road": "Scenic Western Ghats drive from Bengaluru (260 km, 5.5 hours) via Mysuru and Kushalnagar.",
        },
        "best_time_details": {
            "months": "October to April",
            "weather": "Cool and misty (15°C - 25°C). Monsoon (June - September) brings lush waterfalls and emerald green landscapes.",
            "peak_season": "October to January.",
            "off_season": "Heavy monsoon months (July - August) for those who love rain drenched romance.",
        },
        "travel_tips": [
            "Stay in a local plantation homestay to experience authentic Kodava culinary hospitality.",
            "Carry rain gear and umbrellas if traveling between June and September.",
            "Mountain roads are winding; travelers prone to motion sickness should carry appropriate remedies.",
        ],
        "faqs": [
            {"q": "Is Coorg suitable for family trips?", "a": "Yes! Coorg is ideal for families with pleasant weather, easy sightseeing spots like Dubare Elephant Camp, Raja's Seat, and comfortable homestays."},
            {"q": "Can we visit the Tibetan settlement at Bylakuppe?", "a": "Yes, Namdroling Monastery is open daily to public visitors free of charge."},
        ],
        "nearby_destinations": [
            {"name": "Mysuru", "slug": "mysuru", "distance_km": 118, "hero_image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=600&q=80", "category": "Heritage"},
            {"name": "Chikkamagaluru", "slug": "chikkamagaluru", "distance_km": 130, "hero_image": "https://images.unsplash.com/photo-1628080644488-0f04c60c6d58?auto=format&fit=crop&w=600&q=80", "category": "Coffee Trails"},
            {"name": "Mangaluru", "slug": "mangaluru", "distance_km": 140, "hero_image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", "category": "Coastal City"},
        ],
    },
    "gokarna": {
        "tagline": "Tranquil Temple Coast & Hidden Beaches",
        "rating": 4.8,
        "suggested_duration": "3 Days / 2 Nights",
        "why_visit": [
            {"title": "Pristine Crescent Beaches", "desc": "Om Beach shaped like the sacred Om symbol, Kudle, Half Moon, and Paradise Beach.", "icon": "Droplets", "tag": "Beaches"},
            {"title": "Ancient Spiritual Seat", "desc": "Mahabaleshwar Temple housing the legendary Atmalinga placed by Ravana.", "icon": "Sparkles", "tag": "Spiritual"},
            {"title": "Cliffside Beach Trekking", "desc": "Scenic coastal trail connecting Kudle Beach over rocky promontories to Paradise Beach.", "icon": "Compass", "tag": "Trekking"},
            {"title": "Laidback Coastal Vibes", "desc": "Uncommercialized alternative to crowded beach towns with beachside shacks and yoga.", "icon": "Heart", "tag": "Relaxation"},
        ],
        "things_to_do": [
            {"title": "Beach Trek (Kudle to Paradise)", "desc": "Trek over the rocky headlands connecting Gokarna's five famous beaches with ocean panoramas.", "badge": "Trek"},
            {"title": "Darshan at Mahabaleshwar Temple", "desc": "Touch the sacred Atmalinga enshrined in the floor of the sanctum sanctorum.", "badge": "Spiritual"},
            {"title": "Water Sports at Om Beach", "desc": "Enjoy banana boat rides, jet skiing, and dolphin-spotting boat trips.", "badge": "Adventure"},
            {"title": "Sunset Yoga at Kudle Beach", "desc": "Practice yoga on golden sands as the sun dips into the Arabian Sea.", "badge": "Wellness"},
        ],
        "local_food": [
            {"name": "Coastal Seafood Thali", "desc": "Fresh catch of the day surmai or pomfret fry served with coconut fish curry and rice.", "origin": "Karavali specialty"},
            {"name": "Todal Kappe (Clam Sukka)", "desc": "Fresh clams tossed in roasted coconut and aromatic spices.", "origin": "Seaside delicacy"},
            {"name": "Nutella Crepes & Shakshuka", "desc": "International beachside cafe breakfasts served at Kudle and Om beach shacks.", "origin": "Backpacker favorite"},
        ],
        "shopping": [
            {"name": "Car Street Bazaar", "desc": "Traditional brass lamps, rudraksha malas, seashells, incense, and herbal soaps.", "type": "Temple Market"},
        ],
        "culture_festivals": [
            {"name": "Maha Shivaratri", "season": "Feb – Mar", "desc": "Gokarna's biggest festival featuring twin grand wooden temple chariots drawn down Car Street.", "highlight": "Giant wooden chariots"},
        ],
        "how_to_reach": {
            "air": "Goa Dabolim Airport (GOI, 140 km) and Manohar International Airport Mopa (GOX, 175 km) are the nearest airports.",
            "railway": "Gokarna Road railway station (GOK, 8 km) is on the Konkan Railway network with daily trains from Mumbai and Mangaluru.",
            "bus": "Direct KSRTC and private sleeper buses connect Gokarna with Bengaluru (10 hours), Mangaluru, and Panaji.",
            "road": "Connected via NH 66 coastal highway. Smooth coastal drive from Goa or Mangaluru.",
        },
        "best_time_details": {
            "months": "October to March",
            "weather": "Warm days and breezy tropical evenings (22°C - 32°C).",
            "peak_season": "November to February.",
            "off_season": "Monsoon (June to August) brings dramatic rough seas; shacks remain closed.",
        },
        "travel_tips": [
            "Paradise Beach is accessible primarily on foot or by local boat from Om Beach.",
            "Dress respectfully when visiting the Mahabaleshwar Temple (dhoti for men, saree/salwar for women).",
            "Carry cash for boat rides and beach shacks as card POS machines often lose signal on beaches.",
        ],
        "faqs": [
            {"q": "Can we reach all beaches by road in Gokarna?", "a": "Gokarna Main Beach and Kudle Beach have road access. Om Beach is reachable by vehicle; Half Moon and Paradise Beach require a short hike or boat ride."},
            {"q": "Is Gokarna safe for solo female travelers?", "a": "Yes, Gokarna has a friendly, safe, and welcoming atmosphere with many solo and international travelers."},
        ],
        "nearby_destinations": [
            {"name": "Udupi", "slug": "udupi", "distance_km": 175, "hero_image": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=600&q=80", "category": "Temples & Coast"},
            {"name": "Dandeli", "slug": "dandeli", "distance_km": 140, "hero_image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80", "category": "River Rafting"},
            {"name": "Murudeshwar", "slug": "gokarna", "distance_km": 78, "hero_image": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", "category": "Colossal Shiva Statue"},
        ],
    },
}

def get_destination_facts(slug: str) -> Dict[str, Any]:
    """Retrieve structured facts for a destination slug, with graceful fallback defaults."""
    clean_slug = str(slug).strip().lower().replace("_", "-")
    facts = DESTINATION_FACTS.get(clean_slug)
    if facts:
        return facts

    # Generic high-quality defaults for other destinations
    return {
        "tagline": "A Premier Destination in Karnataka",
        "rating": 4.8,
        "suggested_duration": "2 Days / 1 Night",
        "why_visit": [
            {"title": "Rich Heritage & Monuments", "desc": "Explore regional landmarks, historic architecture, and deep cultural roots.", "icon": "Landmark", "tag": "History"},
            {"title": "Picturesque Scenery", "desc": "Immerse yourself in lush regional landscapes, viewpoints, and nature walks.", "icon": "Trees", "tag": "Nature"},
            {"title": "Authentic Cuisine", "desc": "Savor authentic regional Karnataka recipes prepared with local ingredients.", "icon": "Utensils", "tag": "Food"},
            {"title": "Warm Local Hospitality", "desc": "Experience peaceful local travel, welcoming communities, and traditional bazaars.", "icon": "Heart", "tag": "Culture"},
        ],
        "things_to_do": [
            {"title": "Heritage & Sightseeing Tour", "desc": "Visit the prominent attractions and photographic viewpoints.", "badge": "Highlight"},
            {"title": "Local Market Walk", "desc": "Discover traditional bazaars, regional produce, and authentic handicrafts.", "badge": "Culture"},
            {"title": "Nature & Landscape Photography", "desc": "Capture the beauty of scenic viewpoints and surrounding countrysides.", "badge": "Photography"},
        ],
        "local_food": [
            {"name": "Traditional Karnataka Meals", "desc": "Hearty spread of sambar, rasam, freshly cooked seasonal vegetables, and rice.", "origin": "Regional specialty"},
            {"name": "Fresh Filter Coffee", "desc": "Aromatic brewed coffee served hot in authentic brass tumblers.", "origin": "Classic refresher"},
        ],
        "shopping": [
            {"name": "Local Town Bazaars", "desc": "Traditional handlooms, regional snacks, and artisanal crafts.", "type": "Market"},
        ],
        "culture_festivals": [
            {"name": "Annual Temple Rathotsava", "season": "Winter / Spring", "desc": "Grand religious and cultural gathering with processions and folk music.", "highlight": "Cultural traditions"},
        ],
        "how_to_reach": {
            "air": "Closest regional airport with domestic connections, followed by taxi or coach transit.",
            "railway": "Nearest railway station connecting directly to major South Indian railway corridors.",
            "bus": "Frequent KSRTC express buses connecting all major district headquarters.",
            "road": "Well connected via national and state highways with scenic driveways and roadside amenities.",
        },
        "best_time_details": {
            "months": "October to March",
            "weather": "Mild, pleasant temperatures with clear skies and comfortable sightseeing conditions.",
            "peak_season": "October through January.",
            "off_season": "Summer months (April to June).",
        },
        "travel_tips": [
            "Plan your day excursions starting early in the morning to beat the midday warmth.",
            "Carry reusable water bottles and sun hats.",
            "Respect local heritage and customs when visiting sacred landmarks.",
        ],
        "faqs": [
            {"q": "How many days are needed to explore?", "a": "A 2 to 3 day itinerary is ideal to explore the key highlights without rushing."},
            {"q": "Are family friendly accommodations available?", "a": "Yes, high-rated hotels, homestays, and resorts are readily accessible."},
        ],
        "nearby_destinations": [],
    }
