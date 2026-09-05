"""
Canonical seed data for Indian Destinations, Cultural Events, Galleries, and Reviews.
Focused on Karnataka's historic, coastal, and hill regions.
"""

DESTINATION_SEEDS = [
    {
        "name": "Mysuru",
        "slug": "mysuru",
        "short_description": "The Royal Heritage Capital of Karnataka, famed for glittering palaces, sandalwood aroma, and silk weaving.",
        "description": "Mysuru (formerly Mysore) sits at the base of Chamundi Hills and is one of South India's most evocative royal cities. The seat of the Wadiyar dynasty, it blends majestic Indo-Saracenic architecture, broad tree-lined avenues, vibrant artisan bazaars, and world-renowned yoga traditions. From the illuminated grandeur of Mysore Palace to the panoramic views from Chamundeshwari Temple, Mysuru radiates timeless charm.",
        "history": "Mysuru was ruled by the Wadiyar dynasty from 1399 until Indian independence, with brief periods of rule by Hyder Ali and Tipu Sultan in the late 18th century. The Wadiyars were great patrons of art, classical music, architecture, and education, creating Karnataka's cultural capital.",
        "district": "Mysuru",
        "state": "Karnataka",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "hero_image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Heritage & Royalty",
        "city_aliases": ["Mysuru", "Mysore", "Somnathpur", "Talakadu", "Srirangapatna", "Nanjangud", "Mandya", "H.D. Kote", "Gundlupet", "Chamarajanagar"],
        "events": [
            {
                "name": "Mysuru Dasara (Nada Habba)",
                "date": "September / October (10 Days)",
                "month": "October",
                "description": "A 400-year-old state festival celebrating Goddess Chamundeshwari's victory over Mahishasura. Features the iconic Jumboo Savari elephant procession, illuminating Mysore Palace with 100,000 bulbs.",
                "image_url": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Chamundi Temple Rathotsava",
                "date": "October (Post-Dasara)",
                "month": "October",
                "description": "Grand chariot festival on Chamundi Hills drawing thousands of devotees to pull the colossal wooden chariot.",
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=80",
                "caption": "Illuminated Mysore Palace during the evening spectacle",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
                "caption": "Ornate durbar halls and stained glass ceilings",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
                "caption": "Chamundi Hill steps overlooking the royal cityscape",
            },
        ],
        "reviews": [
            {
                "author_name": "Arun Kulkarni",
                "rating": 5.0,
                "comment": "Visiting Mysore Palace during Sunday evening illumination is pure magic. Truly the cultural crown of Karnataka.",
            },
            {
                "author_name": "Elena Rostova",
                "rating": 4.8,
                "comment": "Incredible heritage city! Clean, peaceful, and rich in history. Don't miss the Mylari dosas and Devaraja market.",
            },
        ],
    },
    {
        "name": "Hampi",
        "slug": "hampi",
        "short_description": "UNESCO World Heritage boulder kingdom and magnificent ruins of the Vijayanagara Empire.",
        "description": "Hampi is an open-air museum set against a surreal landscape of giant granite boulders, banana plantations, and the winding Tungabhadra River. In the 14th to 16th centuries, Hampi (Vijayanagara) was one of the largest and wealthiest metropolises in the world. Today, its monumental temples, royal pavilions, stone chariots, and cliffside sunsets attract history seekers and explorers from around the globe.",
        "history": "Founded in 1336 by the Sangama brothers Harihara and Bukka, Vijayanagara reached its golden zenith under Emperor Krishnadevaraya. It was a bustling trade hub for Arabian horses, Persian silks, and Golconda diamonds until its fall after the battle of Talikota in 1565.",
        "district": "Vijayanagara",
        "state": "Karnataka",
        "latitude": 15.3350,
        "longitude": 76.4600,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to February",
        "category": "UNESCO World Heritage",
        "city_aliases": ["Hampi", "Hospet", "Kamalapura"],
        "events": [
            {
                "name": "Hampi Utsava (Vijaya Utsava)",
                "date": "November / January (3 Days)",
                "month": "November",
                "description": "State cultural carnival celebrating Vijayanagara glory with classical music, lighting on ancient boulder temples, folk dance, and firework displays.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Virupaksha Car Festival (Phalaksha)",
                "date": "March / April",
                "month": "March",
                "description": "Annual temple chariot procession down Hampi Bazaar in honor of the celestial marriage of Lord Virupaksha and Pampa.",
                "image_url": "https://images.unsplash.com/photo-1600100397608-f416d6c66e2c?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "The iconic Stone Chariot at the Vijaya Vittala Temple complex",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1600100397608-f416d6c66e2c?auto=format&fit=crop&w=1200&q=80",
                "caption": "Sunset overlooking the Virupaksha Gopuram from Hemakuta Hill",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80",
                "caption": "Tungabhadra coracle crossing and rocky riverbanks",
            },
        ],
        "reviews": [
            {
                "author_name": "Pooja Hegde",
                "rating": 5.0,
                "comment": "Hampi feels like stepping onto another planet. Watching the sunset from Matanga Hill is a transcendent experience.",
            },
            {
                "author_name": "David Miller",
                "rating": 4.9,
                "comment": "One of the world's greatest archaeological marvels. Rent a bicycle and explore Vittala and the Zenana enclosure early in the morning.",
            },
        ],
    },
    {
        "name": "Gokarna",
        "slug": "gokarna",
        "short_description": "Sacred coastal town renowned for cliffside beaches, Om Beach contours, and Mahabaleshwar Shiva temple.",
        "description": "Gokarna sits quietly on the Arabian Sea coast where the Gangavali and Aghanashini rivers meet. Celebrated both as a sacred pilgrimage site harboring the revered Atmalinga and as a laid-back beach haven, Gokarna offers dramatic coastal cliff trails between Kudle, Om, Half Moon, and Paradise beaches. Unlike crowded resort towns, it maintains a mystical, unhurried coastal rhythm.",
        "history": "Revered in Hindu mythology as the ear of the earth (Go-Karna) where Lord Shiva emerged from Mother Earth. The 4th-century Kadamba and Vijayanagara kings patronized the Mahabaleshwar temple, cementing its reputation as Dakshina Kashi.",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "latitude": 14.5479,
        "longitude": 74.3188,
        "hero_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Coastal & Spiritual",
        "city_aliases": ["Gokarna", "Kumta", "Bhatkal", "Ankola"],
        "events": [
            {
                "name": "Mahashivaratri in Gokarna",
                "date": "February / March",
                "month": "February",
                "description": "Grand 9-day coastal festival where giant wooden temple chariots are hauled through car street to the sounding of conches.",
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "caption": "Om-shaped curved sandy beaches along the Arabian Sea",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80",
                "caption": "Cliff walk sunset trail connecting Kudle and Om beaches",
            },
        ],
        "reviews": [
            {
                "author_name": "Siddharth Rao",
                "rating": 4.9,
                "comment": "The cliffside hike from Kudle to Paradise beach is unmatched. Calming sunsets, great seafood, and peaceful temples.",
            },
        ],
    },
    {
        "name": "Coorg (Kodagu)",
        "slug": "coorg",
        "short_description": "The Scotland of India, cradled in misty Western Ghats, coffee estates, waterfalls, and Kodava warrior heritage.",
        "description": "Kodagu, commonly known as Coorg, is Karnataka's premier hill district enveloped in emerald coffee plantations, cardamom groves, and dense rainforests. Home to the martial Kodava people, Coorg features cascading waterfalls like Abbey and Iruppu, mist-covered mountain peaks like Tadiandamol, the serene Tibetan settlement of Bylakuppe, and the origin point of the holy River Cauvery at Talakaveri.",
        "history": "Coorg was ruled by the Lingayat Haleri dynasty from the 17th century until British annexation in 1834. The Kodavas preserve unique warrior traditions, distinct clan laws, weapons reverence, and harvest dance rituals.",
        "district": "Kodagu",
        "state": "Karnataka",
        "latitude": 12.4244,
        "longitude": 75.7382,
        "hero_image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
        "best_time": "September to April",
        "category": "Hill Station & Nature",
        "city_aliases": ["Coorg", "Kodagu", "Madikeri", "Kushalnagar", "Bylakuppe", "Bhagamandala", "Brahmagiri"],
        "events": [
            {
                "name": "Kailpodh (Festival of Arms)",
                "date": "September 3",
                "month": "September",
                "description": "Unique Kodava festival marking the end of the paddy sowing season where traditional weaponry is cleansed and worshiped.",
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Cauvery Theerthodbhava",
                "date": "Mid-October (Tula Sankramana)",
                "month": "October",
                "description": "Sacred phenomenon at Talakaveri where the holy spring springs forth into the kundike at an auspicious predetermined second.",
                "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                "caption": "Misty hills and rolling coffee plantations of Kodagu",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
                "caption": "Lush Western Ghats rainforest canopy near Abbey Falls",
            },
        ],
        "reviews": [
            {
                "author_name": "Meera Nambiar",
                "rating": 5.0,
                "comment": "A homestay nestled inside a coffee estate in Coorg with authentic Pandi curry is the absolute best weekend getaway.",
            },
        ],
    },
    {
        "name": "Chikkamagaluru",
        "slug": "chikkamagaluru",
        "short_description": "The birthplace of Indian coffee, towering Mullayanagiri peaks, misty valleys, and temple towns.",
        "description": "Chikkamagaluru (Chikmagalur) sits quietly against the dramatic Baba Budan Giri mountain range. Legend holds that Sufi saint Baba Budan first brought seven raw coffee beans from Yemen in the 17th century and planted them in these hills, introducing coffee to the Indian subcontinent. Today, it offers premier trekking routes to Mullayanagiri (Karnataka's highest peak at 1,930m), Kudremukh, and sacred temple hamlets like Sringeri and Horanadu.",
        "history": "Given as a dowry to the younger daughter of the Sakrepatna chieftain Rukmangada, giving the town its name (Chikka-magala-uru or 'Town of the Younger Daughter'). The Hoysalas had prominent footholds in surrounding hills.",
        "district": "Chikkamagaluru",
        "state": "Karnataka",
        "latitude": 13.3161,
        "longitude": 75.7720,
        "hero_image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85",
        "best_time": "September to March",
        "category": "Hill Station & Treks",
        "city_aliases": ["Chikkamagaluru", "Chikmagalur", "Kudremukh", "Horanadu", "Sringeri", "Sakleshpur"],
        "events": [
            {
                "name": "Coffee Blossom Harvest Season",
                "date": "March / April",
                "month": "March",
                "description": "Fragrant white coffee blossoms cover the slopes in snowy white sheets resembling snow across the Western Ghats.",
                "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                "caption": "Mullayanagiri peak rising above the sea of clouds",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
                "caption": "Sunlight filtering through thick mountain coffee foliage",
            },
        ],
        "reviews": [
            {
                "author_name": "Rohan Deshmukh",
                "rating": 4.9,
                "comment": "Reaching the peak of Mullayanagiri at 6 AM as the sunrise pierces the fog is an unforgettable visual.",
            },
        ],
    },
    {
        "name": "Bengaluru",
        "slug": "bengaluru",
        "short_description": "India's dynamic Silicon Valley and Garden City, home to tech innovation, historic forts, and Lalbagh botanical gardens.",
        "description": "Bengaluru (Bangalore) is India's premier tech capital and startup hub, famous for its pleasant year-round climate, expansive colonial parks, craft breweries, and rich historic roots. From Kempe Gowda's 16th-century mud fort and Tipu Sultan's teak Summer Palace to the glasshouse at Lalbagh and the neo-Dravidian Vidhana Soudha, Bengaluru bridges deep Southern heritage with ultra-modern cosmopolitan life.",
        "history": "Founded in 1537 by Kempe Gowda I, a feudatory ruler under the Vijayanagara Empire who erected four watchtowers demarcating the city borders. It later served as the military stronghold of Hyder Ali and the British cantonment.",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "hero_image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1400&q=85",
        "best_time": "Year-round (Best: October to February)",
        "category": "Urban & Modern Heritage",
        "city_aliases": ["Bengaluru", "Bangalore", "Devanahalli", "Chikkaballapur", "Tumakuru"],
        "events": [
            {
                "name": "Bengaluru Karaga Shaktyotsava",
                "date": "March / April (Chaitra Poornima)",
                "month": "April",
                "description": "Centuries-old night procession honoring Draupadi, winding through the historic Pete quarters with a priest balancing the floral pyramid pyramid.",
                "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Lalbagh Flower Show",
                "date": "January & August (Republic & Independence Day)",
                "month": "January",
                "description": "Extravagant floral sculptures inside the historic Lalbagh Glass House drawing hundreds of thousands of nature enthusiasts.",
                "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
                "caption": "The grand Vidhana Soudha legislative building illuminated at dusk",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
                "caption": "Historic Lalbagh botanical gardens and lake",
            },
        ],
        "reviews": [
            {
                "author_name": "Kavita S.",
                "rating": 4.7,
                "comment": "A wonderful blend of old world heritage (Bangalore Palace, Cubbon Park) and lively cafe culture.",
            },
        ],
    },
    {
        "name": "Udupi",
        "slug": "udupi",
        "short_description": "Spiritual sanctum of Krishna, birthplace of Udupi cuisine, and gateway to Malpe beach and St. Mary's basalt islands.",
        "description": "Udupi is world-renowned for two quintessential gifts: the 13th-century Sri Krishna Matha founded by saint Madhvacharya, and its world-spanning vegetarian culinary traditions. Positioned between the Western Ghats and the Arabian Sea, Udupi also boasts pristine coastal beauty, including the volcanic hexagonal basalt columns of St. Mary's Island, Kaup lighthouse beach, and tranquil backwaters.",
        "history": "In the 13th century, Vaishnavite philosopher Madhvacharya established the Dvaita (dualism) school of philosophy and set up the eight mathas (Ashta Mathas) to govern worship at the sacred Krishna Temple in cyclical biennial rotation (Paryaya).",
        "district": "Udupi",
        "state": "Karnataka",
        "latitude": 13.3409,
        "longitude": 74.7421,
        "hero_image": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Temple & Coastal",
        "city_aliases": ["Udupi", "Kundapura", "Kollur", "Manipal", "Malpe"],
        "events": [
            {
                "name": "Paryaya Festival",
                "date": "January 18 (Biennial)",
                "month": "January",
                "description": "Historic ceremony where the reign and management of Udupi Sri Krishna Matha transfers to the next matha swami with massive public processions.",
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=1200&q=80",
                "caption": "Sri Krishna Matha Car Street temple chariot rituals",
            },
            {
                "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "caption": "Malpe sea walk and boat ride toward St. Mary's basalt columns",
            },
        ],
        "reviews": [
            {
                "author_name": "Venkatesh Bhat",
                "rating": 5.0,
                "comment": "Seeing Lord Krishna through the Kanakana Kindi window and tasting the temple anna prasadam is an unforgettable blessing.",
            },
        ],
    },
    {
        "name": "Badami",
        "slug": "badami",
        "short_description": "Cradle of temple architecture, sandstone cave temples, and Agastya lake canyon.",
        "description": "Badami (ancient Vatapi) was the royal capital of the Early Chalukyas from 540 to 757 AD. Carved directly into rugged red sandstone cliffs surrounding the emerald waters of Agastya Lake, Badami's rock-cut cave temples represent the high watermark of Indian cave art and early temple architecture, with awe-inspiring carvings of 18-armed dancing Nataraja, Varaha, and Jain Tirthankaras.",
        "history": "Founded by Pulakeshin I in 540 AD, Vatapi flourished as the epicentre of Chalukyan rock architecture before conflicts with the Pallavas under Narasimhavarman I. It laid the foundation for South Indian stone architecture.",
        "district": "Bagalkot",
        "state": "Karnataka",
        "latitude": 15.9187,
        "longitude": 75.6766,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Cave Temples & Heritage",
        "city_aliases": ["Badami", "Bagalkot", "Guledagudda"],
        "events": [
            {
                "name": "Chalukya Dance Festival",
                "date": "January / February (3 Days)",
                "month": "January",
                "description": "Celebrated classical dance festival staged against the backdrop of illuminated rock-cut cave temples and Bhootnath temples.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "Red sandstone cave temples overlooking Agastya Lake",
            },
        ],
        "reviews": [
            {
                "author_name": "Deepak Joshi",
                "rating": 5.0,
                "comment": "The sheer artistry carved into the cliff faces at Cave 1 and Cave 3 will blow your mind. The reflection of Bhootnath temple in the lake at dawn is pure poetry.",
            },
        ],
    },
    {
        "name": "Dandeli",
        "slug": "dandeli",
        "short_description": "Adventure capital of Karnataka, white water river rafting on the Kali River, hornbills, and tiger sanctuary.",
        "description": "Dandeli is nestled in the dense evergreen canopy of the Northern Western Ghats along the swift Kali River. Celebrated as South India's adventure paradise, it offers grade-3 white water rafting, kayaking, river crossing, jungle safaris inside Dandeli Wildlife Sanctuary / Anshi Tiger Reserve, and birdwatching for rare Great Indian Hornbills.",
        "history": "Believed to be named after Dandelappa, a revered local deity and servant of the Mirashi landlords who sacrificed his life. The region historically supplied high quality teak and paper pulp before transforming into an eco-tourism hub.",
        "district": "Uttara Kannada",
        "state": "Karnataka",
        "latitude": 15.2444,
        "longitude": 74.6231,
        "hero_image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to May",
        "category": "Adventure & Wildlife",
        "city_aliases": ["Dandeli", "Sirsi", "Uttara Kannada"],
        "events": [
            {
                "name": "Kali River Rafting Carnival",
                "date": "November to February",
                "month": "December",
                "description": "Annual gatherings of adventure sports enthusiasts, kayakers, and wildlife photographers navigating the Kali rapids.",
                "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                "caption": "White water rapids roaring along the Kali River gorges",
            },
        ],
        "reviews": [
            {
                "author_name": "Naveen Raj",
                "rating": 4.8,
                "comment": "The Kali river rafting is top notch! Professional guides and thrilling class 3 rapids. We also spotted hornbills in the morning canopy.",
            },
        ],
    },
    {
        "name": "Vijayapura (Bijapur)",
        "slug": "vijayapura",
        "short_description": "Deccan Sultanate architectural wonders, the whispering gallery of Gol Gumbaz, and Ibrahim Rauza.",
        "description": "Vijayapura (formerly Bijapur) was the capital of the Adil Shahi dynasty from 1490 to 1686. It boasts some of the finest Islamic architecture in the Deccan, including the mammoth Gol Gumbaz (possessing the world's second-largest unsupported dome and an acoustic whispering gallery where even a soft whisper echoes 11 times), the ornate Ibrahim Rauza ('The Black Taj'), and the Malik-e-Maidan cannon.",
        "history": "Founded by the Chalukyas of Kalyani in the 10th-11th centuries as Vijayapura ('City of Victory'). It reached its zenith under Yusuf Adil Shah and his successors, who fostered Persian-Indian artistic syntheses.",
        "district": "Vijayapura",
        "state": "Karnataka",
        "latitude": 16.8302,
        "longitude": 75.7100,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Deccan Islamic Heritage",
        "city_aliases": ["Vijayapura", "Bijapur"],
        "events": [
            {
                "name": "Bijapur Music & Heritage Festival",
                "date": "February",
                "month": "February",
                "description": "Celebration of Hindustani classical and Sufi music held in the courtyard of Ibrahim Rauza and Gol Gumbaz.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "The massive circular dome and minarets of Gol Gumbaz",
            },
        ],
        "reviews": [
            {
                "author_name": "Sameer Khan",
                "rating": 4.9,
                "comment": "Testing the acoustic whispering gallery of Gol Gumbaz early before the crowd arrives is mind-bending.",
            },
        ],
    },
    {
        "name": "Belur & Halebidu",
        "slug": "belur-halebidu",
        "short_description": "UNESCO World Heritage Hoysala temple marvels, intricate soapstone filigree, and star-shaped shrines.",
        "description": "Belur and Halebidu (ancient Dwarasamudra) showcase the supreme zenith of Hoysala architecture. Inscribed on the UNESCO World Heritage list in 2023, the Chennakeshava Temple at Belur and the Hoysaleswara Temple at Halebidu feature mind-boggling chloritic schist (soapstone) filigree carvings where no two battle reliefs, dancers, or celestial figurines are identical.",
        "history": "Flourished from the 10th to the 14th centuries as the capital of the Hoysala Empire under King Vishnuvardhana and architect master sculptors Jakanachari and Dankanachari.",
        "district": "Hassan",
        "state": "Karnataka",
        "latitude": 13.1623,
        "longitude": 75.8596,
        "hero_image": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "UNESCO World Heritage",
        "city_aliases": ["Belur", "Halebidu", "Hassan", "Shravanabelagola"],
        "events": [
            {
                "name": "Belur Chennakeshava Rathotsava",
                "date": "March / April",
                "month": "March",
                "description": "Traditional temple car festival where holy scriptures from both Hindu and Sufi texts are read in an inspiring testament of communal harmony.",
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=1200&q=80",
                "caption": "Intricate Hoysala soapstone carving of dancing celestial damsels (Madanikas)",
            },
        ],
        "reviews": [
            {
                "author_name": "Dr. Ananya Murthy",
                "rating": 5.0,
                "comment": "The craftsmanship at Chennakeshava and Hoysaleshwara is unmatched anywhere on earth. Every single square inch tells a story.",
            },
        ],
    },
    {
        "name": "Pattadakal & Aihole",
        "slug": "pattadakal-aihole",
        "short_description": "UNESCO World Heritage cradle of temple styles, blending northern Nagara and southern Dravida architecture.",
        "description": "Pattadakal (the coronation site of Chalukyan monarchs) and Aihole (known as the 'Cradle of Hindu Rock Architecture' with over 120 stone temples dating back to the 6th century) represent the experimental workshops where ancient Indian stone carvers perfected both the curved Nagara towers of North India and the stepped Dravidian Vimanas of the South.",
        "history": "Under the Badami Chalukyas, royal architects gathered in the Malaprabha river valley to test temple engineering philosophies, culminating in the 8th-century Virupaksha temple built by Queen Lokamahadevi.",
        "district": "Bagalkot",
        "state": "Karnataka",
        "latitude": 15.9486,
        "longitude": 75.8160,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "UNESCO World Heritage",
        "city_aliases": ["Pattadakal", "Aihole"],
        "events": [
            {
                "name": "Pattadakal Dance Festival",
                "date": "January",
                "month": "January",
                "description": "Prestigious international Indian classical dance recitals illuminated before the UNESCO temple cluster.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "The grand Virupaksha temple and Mallikarjuna temple at Pattadakal",
            },
        ],
        "reviews": [
            {
                "author_name": "Kiran Varma",
                "rating": 4.9,
                "comment": "If you love architecture, you must visit Aihole and Pattadakal alongside Badami. The Durga Temple at Aihole is breathtaking.",
            },
        ],
    },
    {
        "name": "Mangaluru",
        "slug": "mangaluru",
        "short_description": "Coastal port city, sacred pilgrim shrines of Kadri and Kudroli, and gateway to Dharmasthala and Subramanya.",
        "description": "Mangaluru (Mangalore) is a bustling port city nestled between the roaring Arabian Sea and the soaring Western Ghats. Famous for its tile factories, coffee curing, pristine beaches like Panambur and Tannirbhavi, and unique Tulu Nadu folklore (Yakshagana and Kambala buffalo races), Mangaluru is also the spiritual stepping stone to revered inland pilgrimage centres including Sri Manjunatha Temple in Dharmasthala and Kukke Subramanya.",
        "history": "Named after Goddess Mangaladevi, the city was historically an influential trade outpost under the Alupas, Hoysalas, and Vijayanagara emperors, trading spices, timber, and silk with the Arab and Mediterranean worlds.",
        "district": "Dakshina Kannada",
        "state": "Karnataka",
        "latitude": 12.9141,
        "longitude": 74.8560,
        "hero_image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Coastal & Pilgrimage",
        "city_aliases": ["Mangaluru", "Mangalore", "Dharmasthala", "Subramanya"],
        "events": [
            {
                "name": "Mangaluru Dasara",
                "date": "September / October",
                "month": "October",
                "description": "Famed Tiger Dance (Pili Yesa) performances and grand floral processions centered around Kudroli Gokarnanatheshwara Temple.",
                "image_url": "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "caption": "Golden sands and sunset waters of Panambur Beach",
            },
        ],
        "reviews": [
            {
                "author_name": "Satish Shenoy",
                "rating": 4.8,
                "comment": "Unmatched coastal cuisine (Ghee Roast and Neer Dosa) and deeply spiritually uplifting temples.",
            },
        ],
    },
    {
        "name": "Shivamogga (Shimoga)",
        "slug": "shivamogga",
        "short_description": "Gateway to the Western Ghats, thunderous Jog Falls, and Agumbe rainforests.",
        "description": "Shivamogga ('Face of Shiva') is blessed with roaring rivers, lush rainforests, and misty mountain passes. Home to India's second-highest plunge waterfall—the thunderous Jog Falls formed by the Sharavathi River dropping 253 meters—and Agumbe (the 'Cherrapunji of the South' famed for king cobras and crimson sunset viewpoints over the Arabian Sea).",
        "history": "Ruled by the Kadambas, Chalukyas, Gangas, and later the Keladi Nayakas under Shivappa Nayaka who fortified key river frontiers against Deccan sultanates.",
        "district": "Shivamogga",
        "state": "Karnataka",
        "latitude": 13.9299,
        "longitude": 75.5681,
        "hero_image": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85",
        "best_time": "July to February",
        "category": "Waterfalls & Rainforest",
        "city_aliases": ["Shivamogga", "Shimoga", "Sagar", "Agumbe"],
        "events": [
            {
                "name": "Jog Falls Monsoon Festival",
                "date": "August / September",
                "month": "August",
                "description": "Spectacular celebration when the Raja, Roarer, Rocket, and Rani cascades are in full flood stage.",
                "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
                "caption": "Misty gorges and waterfalls surrounded by emerald Western Ghats foliage",
            },
        ],
        "reviews": [
            {
                "author_name": "Tanvi Rao",
                "rating": 4.9,
                "comment": "Witnessing Jog Falls during the peak monsoon mist is awe-inspiring. Agumbe's rainforest station is also a nature lover's dream.",
            },
        ],
    },
    {
        "name": "Chitradurga",
        "slug": "chitradurga",
        "short_description": "The Fort of Seven Circles (Yelu Suttina Kote), rocky boulder fortress, and legend of Onake Obavva.",
        "description": "Chitradurga ('Picturesque Fort') is legendary across Karnataka for its massive boulder hill-fort spanning 18 temples, 38 behind-the-wall doorways, 35 secret gateways, and rainwater harvesting interconnected reservoirs built across seven concentric ring fortifications. It was immortalized by heroine Onake Obavva who single-handedly defended a crevice against Hyder Ali's troops.",
        "history": "Built between the 10th and 18th centuries by dynasties including the Rashtrakutas, Chalukyas, and most notably the Nayakas of Chitradurga (Madakari Nayaka) before passing to Hyder Ali and the British.",
        "district": "Chitradurga",
        "state": "Karnataka",
        "latitude": 14.2251,
        "longitude": 76.3980,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Historical Forts & Boulders",
        "city_aliases": ["Chitradurga"],
        "events": [
            {
                "name": "Chitradurga Utsava",
                "date": "December / January",
                "month": "December",
                "description": "Cultural carnival featuring heritage walks, historical reenactments, and folk performances inside the stone fort.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "Granite walls and rock towers of the Seven Round Fort",
            },
        ],
        "reviews": [
            {
                "author_name": "Prajwal K.",
                "rating": 4.8,
                "comment": "The engineering of the rainwater harvesting system and defence walls on these sheer boulders is mind-boggling.",
            },
        ],
    },
    {
        "name": "Bidar",
        "slug": "bidar",
        "short_description": "Crown of North Karnataka, Bahmani royal palaces, Mahmud Gawan Madrasa, and Bidriware craftsmanship.",
        "description": "Bidar stands perched on a high laterite plateau overlooking the Deccan plains. Once the capital of the Bahmani Sultanate and Barid Shahi dynasty, Bidar contains over 30 monumental historical sites, including the triple-moated Bidar Fort, Rangin Mahal inlaid with mother-of-pearl, the Mahmud Gawan Madrasa, and the sacred Gurdwara Nanak Jhira Sahib. It is also the global home of Bidriware inlaid silver metal craft.",
        "history": "Shifted as capital from Gulbarga (Kalaburagi) by Bahmani ruler Ahmad Shah Wali in 1429. It became a renowned center for Islamic scholarship, Persian poetry, and metallurgy.",
        "district": "Bidar",
        "state": "Karnataka",
        "latitude": 17.9104,
        "longitude": 77.5199,
        "hero_image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
        "best_time": "October to March",
        "category": "Deccan Sultanate & Craft",
        "city_aliases": ["Bidar", "Kalaburagi"],
        "events": [
            {
                "name": "Bidar Utsav",
                "date": "January / February",
                "month": "January",
                "description": "Grand festival celebrating Bidri metal artisans, sufi qawwalis, and illuminated heritage walks inside Bidar Fort.",
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            },
        ],
        "galleries": [
            {
                "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
                "caption": "Historic minarets and arches of the Bahmani architecture in Bidar",
            },
        ],
        "reviews": [
            {
                "author_name": "Farhan Ahmed",
                "rating": 4.9,
                "comment": "Bidar Fort is enormous and relatively uncrowded. Do buy authentic Bidriware directly from the master artisan workshops.",
            },
        ],
    },
]
