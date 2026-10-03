// backend/script.js
// ---------------------------------------------------------------------------
// Sample-data generator for নাগরিক (Nagorik).
//
// Creates 60 realistic Dhaka civic-issue reports in YOUR MongoDB, each with 1-3
// real photos that are DOWNLOADED to disk and UPLOADED to YOUR Cloudinary
// account (folder nagorik/issues/images) - the same way the report form's
// backend upload works. No image links are stored; only Cloudinary references.
//
//  * Reports are spread across your EXISTING users (round-robin, so no single
//    user owns them all). No user is created, changed or removed.
//  * Photos come from Wikimedia Commons (free, openly licensed, no API key).
//  * Every photo uploaded by this script is tagged "nagorik-seed" and named
//    seed_*, so --cleanup can remove exactly what this script created.
//
// Usage (run from the backend folder):
//   node script.js               STEP 1 shows a full preview (which photos go with which
//                                report - nothing is saved), then asks "yes/no".
//                                Only after you type yes does STEP 2 create everything.
//   node script.js --dry-run     preview only, never asks, never saves
//   node script.js --yes         skip the question (preview, then create right away)
//   node script.js --cleanup     list what this script created (add --yes to delete)
//
// Options:
//   --limit N            only the first N reports (handy for a quick test)
//   --pending            leave reports "pending" (default: "approved" so they show in the feed)
//   --force              run even if sample data from an earlier run already exists
//   --keep-images        keep the downloaded photos (default: deleted at the end)
//   --allow-single-user  allow seeding when only one eligible user exists
//   --allow-no-image     also create reports for which no photo could be found
// ---------------------------------------------------------------------------
import './config/env.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import Issue from './models/Issue.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Comment from './models/Comment.js';
import Notification from './models/Notification.js';
import { cloudinary, isCloudinaryConfigured, CLOUDINARY_FOLDERS } from './config/cloudinary.js';
import { MAX_IMAGE_BYTES, MAX_ISSUE_MEDIA_COUNT } from './config/media.js';
import { normalizeAsset, deleteAssets } from './services/cloudinaryService.js';
import { validateMediaFile } from './utils/mediaValidation.js';

const SEED_TAG = 'nagorik-seed';
const SEED_PREFIX = `${CLOUDINARY_FOLDERS.issueImages}/seed_`;
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'NagorikSampleDataScript/1.0 (university project; one-off sample data generator)';
const MIN_REPORTS_WANTED = 50;

// ---------------------------------------------------------------------------
// 1. Photo topics: what to search for. Every query is tried in order.
// ---------------------------------------------------------------------------
const TOPICS = {
  waterlog: { cat: ['Water Logging'], q: ['Dhaka waterlogging', 'Dhaka flooded street', 'Dhaka rain flood road', 'Bangladesh waterlogging road'] },
  traffic: { cat: ['Roads & Transportation'], q: ['Dhaka traffic jam', 'Dhaka traffic congestion', 'Dhaka road traffic', 'Bangladesh traffic jam'] },
  pothole: { cat: ['Roads & Transportation'], q: ['Dhaka damaged road', 'Dhaka broken road', 'Bangladesh pothole road', 'Dhaka road repair'] },
  footpath: { cat: ['Roads & Transportation'], q: ['Dhaka footpath', 'Dhaka hawkers footpath', 'Dhaka street vendors', 'Dhaka pedestrians road'] },
  parking: { cat: ['Roads & Transportation'], q: ['Dhaka illegal parking', 'Dhaka parked cars street', 'Dhaka road parking'] },
  footbridge: { cat: ['Roads & Transportation', 'Public Safety'], q: ['Dhaka foot over bridge', 'Dhaka footbridge', 'Dhaka overpass pedestrian', 'Bangladesh foot overbridge'] },
  bus: { cat: ['Roads & Transportation'], q: ['Dhaka bus road', 'Dhaka bus stop', 'Dhaka buses traffic', 'Bangladesh bus road'] },
  crossing: { cat: ['Roads & Transportation', 'Public Safety'], q: ['Dhaka pedestrian crossing', 'Dhaka zebra crossing', 'Dhaka people crossing road', 'Dhaka road crossing'] },
  metro: { cat: ['Roads & Transportation'], q: ['Dhaka Metro Rail construction', 'Dhaka metro pillar', 'Dhaka MRT line 6', 'Dhaka metro rail'] },
  rickshaw: { cat: ['Roads & Transportation'], q: ['Dhaka rickshaw road', 'Dhaka rickshaws traffic', 'Old Dhaka rickshaw', 'Bangladesh rickshaw street'] },
  garbage: { cat: ['Waste Management'], q: ['Dhaka garbage', 'Dhaka waste dump', 'Dhaka rubbish street', 'Bangladesh garbage street'] },
  burning: { cat: ['Waste Management'], q: ['Dhaka burning garbage', 'Dhaka waste burning', 'Bangladesh burning waste', 'Dhaka smoke waste'] },
  debris: { cat: ['Waste Management'], q: ['Dhaka construction debris', 'Dhaka construction waste', 'Dhaka construction site', 'Bangladesh construction rubble'] },
  drain: { cat: ['Waste Management', 'Water Logging'], q: ['Dhaka drain', 'Dhaka canal garbage', 'Dhaka clogged drain', 'Bangladesh drain waste'] },
  market: { cat: ['Waste Management'], q: ['Dhaka fish market', 'Dhaka bazaar waste', 'Dhaka market garbage', 'Dhaka kitchen market'] },
  lake: { cat: ['Waste Management'], q: ['Dhanmondi Lake', 'Dhaka lake garbage', 'Dhaka lake walkway', 'Gulshan Lake Dhaka'] },
  buriganga: { cat: ['Environment', 'Pollution', 'Other'], q: ['Buriganga river pollution', 'Buriganga river Dhaka', 'Dhaka river pollution', 'Sadarghat Dhaka river'] },
  tannery: { cat: ['Environment', 'Pollution', 'Other'], q: ['Hazaribagh tannery', 'Hazaribagh Dhaka tannery pollution', 'Dhaka tannery', 'Hazaribagh leather'] },
  airpoll: { cat: ['Environment', 'Pollution', 'Other'], q: ['Dhaka air pollution', 'Dhaka smog', 'Dhaka construction dust', 'Dhaka dust road'] },
  mosquito: { cat: ['Public Health', 'Health', 'Other'], q: ['Dhaka stagnant water', 'Dhaka mosquito', 'Bangladesh dengue mosquito', 'Dhaka dengue'] },
  streetlight: { cat: ['Street Lights'], q: ['Dhaka street light', 'Dhaka street night', 'Dhaka night road', 'Bangladesh street light'] },
  wires: { cat: ['Electricity', 'Public Safety'], q: ['Dhaka electric wires', 'Dhaka overhead wires', 'Dhaka tangled cables', 'Bangladesh electric pole wires'] },
  transformer: { cat: ['Electricity', 'Public Safety'], q: ['Dhaka transformer', 'Bangladesh electric transformer', 'Dhaka electricity pole', 'Bangladesh power line'] },
  manhole: { cat: ['Public Safety'], q: ['Dhaka manhole', 'Dhaka open drain', 'Bangladesh manhole cover', 'Dhaka drain cover'] },
  water: { cat: ['Water Supply', 'Utilities', 'Other'], q: ['Dhaka water supply', 'Dhaka WASA', 'Dhaka water tap', 'Bangladesh water pipe'] },
  gas: { cat: ['Gas', 'Utilities', 'Other'], q: ['Dhaka gas cylinder', 'Bangladesh LPG cylinder', 'Dhaka gas stove', 'Bangladesh gas pipeline'] },
  stray: { cat: ['Public Safety', 'Other'], q: ['Dhaka stray dog', 'Bangladesh street dog', 'Dhaka street dogs', 'Bangladesh stray dogs'] },
  encroach: { cat: ['Other'], q: ['Dhaka canal encroachment', 'Dhaka slum canal', 'Dhaka illegal structure', 'Dhaka canal houses'] },
  toilet: { cat: ['Other'], q: ['Dhaka public toilet', 'Bangladesh public toilet', 'Dhaka toilet', 'Bangladesh sanitation'] },
  playground: { cat: ['Other', 'Waste Management'], q: ['Dhaka playground', 'Dhaka field garbage', 'Bangladesh playground', 'Dhaka open field'] },
};

// ---------------------------------------------------------------------------
// 2. The reports. `imgs` = how many photos to attach (1-3).
//    status: O = Open, P = In progress, R = Resolved.
// ---------------------------------------------------------------------------
const R = (topic, title, pri, thana, area, road, block, imgs, status, desc) => ({
  topic, title, pri, thana, area, road, block, imgs, status, desc,
});

const REPORTS = [
  // ---- Water logging ----
  R('waterlog', 'Knee-deep waterlogging on Road 27 after every rain', 'High', 'Dhanmondi', 'Dhanmondi Road 27', '27', 'A', 2, 'O',
    'Water has been standing on Road 27 near the Dhanmondi 27 intersection for three days after the last heavy rain. Rickshaws and CNGs stall in the water and pedestrians cannot cross without wading. The drain covers at the corner look blocked. Please clear the drain line and pump the water out.'),
  R('waterlog', 'Mirpur-10 gyratory submerged, buses stalled', 'High', 'Mirpur', 'Mirpur-10 Roundabout', '', '', 3, 'P',
    'Every time it rains for an hour the Mirpur-10 roundabout goes under water and the buses stop moving. The jam stretches back to Mirpur-11. The drain inlets around the circle are covered with silt and plastic. This needs proper desilting before the next heavy rain.'),
  R('waterlog', 'Town Hall Bazar road under water for a week', 'High', 'Mohammadpur', 'Town Hall, Tajmahal Road', '', '', 2, 'O',
    'The lane in front of Town Hall Bazar has had dirty water standing in it for almost a week. Shopkeepers are losing customers and residents are walking through sewage-mixed water. The water level drops slightly at night but comes back with any drizzle.'),
  R('waterlog', 'Jatrabari flyover foot clogged with rainwater', 'Medium', 'Jatrabari', 'Jatrabari Flyover Approach', '', '', 1, 'O',
    'Rainwater collects at the bottom of the Jatrabari flyover ramp and does not drain. Vehicles slow to a crawl and motorbikes are slipping on the muddy edges. Please check the drain connection under the ramp.'),
  R('waterlog', 'Motijheel Shapla Chattar waterlogged, office-goers stranded', 'High', 'Motijheel', 'Shapla Chattar, Motijheel C/A', '', '', 2, 'R',
    'After the morning rain, the area around Shapla Chattar was waterlogged up to the ankle and many office-goers could not get to work on time. The same thing happens after almost every shower. A permanent fix for the drainage here is badly needed.'),
  R('waterlog', 'Khilgaon Taltola market lane flooded with sewage water', 'Medium', 'Khilgaon', 'Khilgaon Taltola', '', '', 2, 'O',
    'The lane beside Khilgaon Taltola market fills with a mix of rainwater and sewage whenever it rains. The smell is unbearable and children going to the nearby school have to walk through it. The sewer line seems to be choked.'),
  R('waterlog', 'Uttara Sector 7 inner road waterlogged, children cannot reach school', 'Medium', 'Uttara', 'Uttara Sector 7', '', '', 1, 'P',
    'The inner road of Sector 7 has been waterlogged since the weekend. School vans cannot enter and parents are carrying small children through the water. The road is low compared to the main road and the water has no way out.'),
  R('waterlog', 'Rampura bridge approach road flooded, motorbikes stuck', 'Medium', 'Rampura', 'Rampura Bridge', '', '', 2, 'O',
    'The approach road on the Rampura bridge side collects a large pool of water after rain. Motorbikes are breaking down in the middle of it and traffic piles up behind them. The road surface has also started to break up under the water.'),

  // ---- Roads, traffic, footpaths ----
  R('pothole', 'Deep potholes on Mirpur Road near Technical', 'High', 'Mirpur', 'Technical Mor, Mirpur', '', '', 2, 'P',
    'A line of deep potholes has opened up on Mirpur Road near Technical. Motorbike riders swerve suddenly to avoid them and I have seen two near-accidents this week. At night they are almost invisible. Please patch the road before someone gets seriously hurt.'),
  R('traffic', 'Farmgate intersection gridlock every evening', 'High', 'Tejgaon', 'Farmgate', '', '', 3, 'O',
    'Between 5 and 8 pm the Farmgate intersection is completely locked. Buses stop in the middle of the road to pick up passengers and the signal is ignored. It regularly takes more than 40 minutes to cross this one junction. We need stronger enforcement on bus stoppages.'),
  R('traffic', 'Mohakhali flyover entrance bottleneck', 'High', 'Gulshan', 'Mohakhali Flyover Entrance', '', '', 2, 'O',
    'The merge at the Mohakhali flyover entrance has become a daily bottleneck. Vehicles from three directions push in at once and nobody gives way. A traffic officer at peak hours would make a big difference.'),
  R('footpath', 'Broken footpath slabs near Gulshan-1 circle', 'Medium', 'Gulshan', 'Gulshan-1 Circle', '', '', 1, 'O',
    'Several footpath slabs near the Gulshan-1 circle are cracked and loose. They tilt when stepped on and splash muddy water on pedestrians. Elderly people and women with prams struggle to walk here.'),
  R('footpath', 'Illegal hawkers occupy the whole footpath at Gulistan', 'Medium', 'Paltan', 'Gulistan', '', '', 3, 'O',
    'Hawkers have taken over the footpath and part of the road at Gulistan, so pedestrians are forced to walk in the traffic lane. It is very dangerous around the bus stand. The footpath should be cleared and kept free for walking.'),
  R('parking', 'Illegal double parking narrows Banani Road 11', 'Medium', 'Banani', 'Banani Road 11', '11', '', 2, 'P',
    'Cars are double parked on both sides of Road 11 outside the restaurants every evening, leaving room for only one vehicle to pass. Ambulances and fire service vehicles would not be able to get through. Please enforce the no-parking rule.'),
  R('footbridge', 'Broken stairs on the Farmgate foot over bridge', 'High', 'Tejgaon', 'Farmgate Foot Over Bridge', '', '', 2, 'O',
    'Some steps on the foot over bridge at Farmgate are broken and the metal edges are sticking out. People hurry up and down in the rush hour and it is easy to trip. The handrail on one side is also loose.'),
  R('footbridge', 'No foot over bridge at Merul Badda, crossing is dangerous', 'High', 'Badda', 'Merul Badda, Pragati Sarani', '', '', 2, 'O',
    'There is no safe way to cross Pragati Sarani at Merul Badda, and the traffic here is very fast. Students and elderly people try to cross between moving buses. A foot over bridge or at least a signal-controlled crossing is urgently needed.'),
  R('bus', 'Buses stopping in the middle of the road at Sayedabad', 'Medium', 'Jatrabari', 'Sayedabad Bus Terminal', '', '', 2, 'O',
    'Long-distance buses stop on the main road outside Sayedabad terminal to wait for passengers, blocking two of the three lanes. The jam spreads towards Jatrabari. The terminal entrance and the roadside waiting area need to be managed.'),
  R('crossing', 'Faded zebra crossing and no signal near school, Satmasjid Road', 'Medium', 'Dhanmondi', 'Satmasjid Road', '', '', 1, 'R',
    'The zebra crossing in front of the school on Satmasjid Road has almost completely faded and drivers do not slow down. Children cross in groups during school hours. The crossing was repainted and a speed breaker added after this report.'),
  R('metro', 'Metro rail construction debris left on the road at Agargaon', 'Medium', 'Sher-e-Bangla Nagar', 'Agargaon', '', '', 2, 'P',
    'Iron rods, broken concrete and sand piles have been left beside the road near the Agargaon metro rail work area. Part of the road is narrowed and the dust is constant. Please clear the leftover material and cover the pile.'),
  R('rickshaw', 'Rickshaws and CNGs block the main road at Chawkbazar', 'Low', 'Chawkbazar', 'Chawkbazar Main Road', '', '', 2, 'O',
    'During the evening the main road at Chawkbazar is full of parked rickshaws and CNGs waiting for passengers. Buses and ambulances cannot pass. A designated stand a little further away would help.'),

  // ---- Waste management ----
  R('garbage', 'Overflowing garbage bin at Karwan Bazar kitchen market', 'High', 'Tejgaon', 'Karwan Bazar', '', '', 2, 'O',
    'The bins beside the Karwan Bazar kitchen market have been overflowing for several days. Rotten vegetables are spread across the road and flies are everywhere. The collection van does not come regularly. Vendors and customers both suffer from the smell.'),
  R('garbage', 'Garbage piled in the Kamrangirchar lane for days', 'High', 'Kamrangirchar', 'Kamrangirchar', '', '', 2, 'O',
    'Household garbage has piled up at the mouth of our lane in Kamrangirchar because the van has not come for days. Children play nearby and stray animals tear the bags open. Please arrange regular collection.'),
  R('burning', 'Waste being burned near residential blocks, Pallabi', 'Medium', 'Pallabi', 'Pallabi, Mirpur-12', '', '', 2, 'O',
    'Someone burns garbage every evening on the vacant plot next to our building. The thick smoke enters our flats and is hard on children and older people. Please stop the burning and arrange proper disposal.'),
  R('debris', 'Construction debris dumped on the roadside in Uttara Sector 13', 'Medium', 'Uttara', 'Uttara Sector 13', '', '', 1, 'P',
    'Bricks, broken tiles and sand from a nearby building have been dumped on the roadside and the pile is growing. It narrows the road and the dust spreads into houses. The contractor should be told to remove it.'),
  R('garbage', 'Secondary transfer station smell at Beribadh, Mohammadpur', 'High', 'Mohammadpur', 'Beribadh, Mohammadpur', '', '', 2, 'P',
    'The transfer station near Beribadh overflows before the trucks come, and the smell reaches houses 200 metres away. Leachate runs onto the road. The pickup schedule needs to be improved and the area cleaned daily.'),
  R('drain', 'Plastic bags clogging the drain on Azimpur Road', 'Medium', 'Lalbagh', 'Azimpur Road, Lalbagh', '', '', 2, 'O',
    'The roadside drain on Azimpur Road is packed with plastic bags and food packets, and water backs up even after light rain. Please clean the drain and put up signs against dumping.'),
  R('drain', 'Canal choked with garbage along Satarkul Road, Badda', 'High', 'Badda', 'Satarkul Road, Badda', '', '', 2, 'O',
    'The canal beside Satarkul Road is filled with garbage and the water does not flow. Mosquitoes breed in it and the smell is strong. Locals throw waste into it because there are no bins nearby.'),
  R('buriganga', 'Plastic waste floating in the Buriganga near Sadarghat', 'Medium', 'Kotwali', 'Sadarghat', '', '', 3, 'O',
    'A thick layer of plastic bottles, bags and other waste floats near the Sadarghat landing area. Boatmen have to push it aside to move. The river water is black and the smell reaches the terminal. Regular cleaning and bins at the ghat are needed.'),
  R('market', 'Fish market waste and dirty water on the road at Maniknagar', 'Medium', 'Mugda', 'Maniknagar Bazar', '', '', 2, 'O',
    'The bazaar waste and fish water are left on the road each morning and not cleaned until late afternoon. It is slippery and smells very bad. A cleaning schedule after market hours would help.'),
  R('lake', 'No dustbins along the Dhanmondi Lake walkway', 'Low', 'Dhanmondi', 'Dhanmondi Lake', '', '', 2, 'R',
    'There are hardly any dustbins along the lake walkway, so snack wrappers and bottles end up in the water and on the grass. More bins were placed along the walkway after this report.'),

  // ---- Mosquitoes / public health ----
  R('mosquito', 'Stagnant water at a construction site breeding mosquitoes, Mirpur-11', 'High', 'Mirpur', 'Mirpur-11', '', '', 2, 'O',
    'Water has collected in the open foundation of an unfinished building and is full of mosquito larvae. Several families nearby have fallen sick with fever. The owner should be asked to drain it, and fogging should be done in this block.'),
  R('mosquito', 'Abandoned tyres holding rainwater in Tejgaon Industrial Area', 'Medium', 'Tejgaon', 'Tejgaon Industrial Area', '', '', 2, 'P',
    'A pile of old tyres beside the workshop holds rainwater and larvae are visible. Workers and the nearby residential lane are getting bitten all day. The tyres should be removed or covered.'),
  R('mosquito', 'No mosquito fogging in our ward for two weeks', 'Medium', 'Badda', 'Uttar Badda', '', '', 1, 'O',
    'Fogging was done only once this month in Uttar Badda and the mosquitoes are back worse than before. With the dengue season on, please send the fogging team again, especially to the lanes near the canal.'),
  R('mosquito', 'Mosquito swarms along the Gulshan Lake edge', 'Medium', 'Gulshan', 'Gulshan Lake, Gulshan-2', '', '', 2, 'O',
    'The edge of the lake is overgrown with weeds and water hyacinth and the mosquitoes are terrible in the evening. Walkers and residents of nearby buildings are suffering. Please clear the weeds and spray along the lake.'),
  R('mosquito', 'Clogged drain water with larvae behind the school, Khilgaon', 'High', 'Khilgaon', 'Khilgaon Chowdhury Para', '', '', 2, 'P',
    'Behind the school the drain has no flow and the water is full of larvae. Students are bitten during class. Please clean the drain and spray the area.'),

  // ---- Street lights ----
  R('streetlight', 'Entire Shyamoli Ring Road stretch unlit at night', 'High', 'Adabor', 'Shyamoli Ring Road', '', '', 2, 'O',
    'About half a kilometre of the Ring Road near Shyamoli has no working street light. Women returning from work are afraid to walk here and the risk of accidents is high. Please repair the lights or replace the burnt-out ones.'),
  R('streetlight', 'Dark lane in Kalabagan, three lights not working', 'Medium', 'Kalabagan', 'Kalabagan, Lake Circus', '', '', 1, 'O',
    'Three lights in our lane have not worked for over a month. It is very dark after sunset and a few mobile snatching incidents have been talked about. Please repair them soon.'),
  R('streetlight', 'Flickering street lights in Mirpur-12', 'Low', 'Pallabi', 'Mirpur-12', '', 'C', 2, 'R',
    'The lights in Block C flicker all night and many have gone out completely. They were repaired and replaced with new bulbs after this report.'),
  R('streetlight', 'Street lights off along the Uttara Sector 10 road', 'Medium', 'Uttara', 'Uttara Sector 10', '', '', 2, 'P',
    'The lights along the main road of Sector 10 have been off for ten days. Residents walking to the mosque and market at night are in the dark, and cars cannot see pedestrians.'),
  R('streetlight', 'No lights in the Dakshinkhan underpass', 'High', 'Dakshinkhan', 'Dakshinkhan', '', '', 2, 'O',
    'The underpass has no working light at all. At night it is pitch dark and people use their phone torches to cross. It feels unsafe, especially for women and children.'),

  // ---- Public safety ----
  R('manhole', 'Open manhole on the Dhanmondi Road 8A pavement', 'High', 'Dhanmondi', 'Dhanmondi Road 8A', '8A', '', 2, 'P',
    'A manhole cover is missing on the pavement of Road 8A. Someone put a bamboo stick in it as a warning but it is very easy to fall in, especially at night. Please cover it immediately.'),
  R('wires', 'Hanging electric and internet cables at Mohammadpur Krishi Market', 'High', 'Mohammadpur', 'Krishi Market, Mohammadpur', '', '', 3, 'O',
    'Bundles of electric and internet cables hang very low over the road near the market. Delivery vans and loaded rickshaws catch them, and some wires have exposed joints. This is a serious risk, especially in the rain.'),
  R('transformer', 'Unfenced transformer box beside a school lane in Kazipara', 'High', 'Kafrul', 'Kazipara', '', '', 2, 'O',
    'A transformer on the roadside has no fence and the cover is open. School children pass by it every day and street animals chew on the cables. Please install a safe fence or enclosure.'),
  R('wires', 'Leaning electric pole near houses at Rayer Bazar', 'High', 'Hazaribagh', 'Rayer Bazar', '', '', 2, 'P',
    'An electric pole is tilting towards the houses and the wires have sagged. After the last rain it leaned further. Please replace or straighten it before it falls.'),
  R('crossing', 'Speeding vehicles near a school on Airport Road', 'High', 'Banani', 'Airport Road near Banani', '', '', 2, 'O',
    'Vehicles speed past the school gate on Airport Road and there is no speed breaker or crossing sign. Children cross in the middle of the day. Please add a crossing and a traffic officer at school hours.'),
  R('manhole', 'Open drain without cover next to the bus stop at Shahbagh', 'Medium', 'Shahbagh', 'Shahbagh Bus Stop', '', '', 1, 'O',
    'The drain next to the bus stop is uncovered and passengers step close to it while boarding. At night it is hard to see. Please place a proper cover.'),
  R('footbridge', 'Cracked ramp railing near the Moghbazar flyover', 'Medium', 'Ramna', 'Moghbazar Flyover', '', '', 2, 'O',
    'The railing on the pedestrian ramp near the flyover is cracked and one section has come loose. Walking along it feels unsafe, especially with the heavy traffic beside it. Please repair the railing.'),
  R('wires', 'Unsafe wiring on a footpath pole at Motijheel', 'High', 'Motijheel', 'Motijheel C/A', '', '', 2, 'P',
    'Wires on a roadside pole near the bank are loose and the insulation is worn. Sparks appear when it rains. The footpath beneath is used by many people every day.'),

  // ---- Utilities, environment and other ----
  R('water', 'Muddy and foul-smelling WASA water in Mohammadpur', 'High', 'Mohammadpur', 'Mohammadpur Block B', '', 'B', 2, 'P',
    'For the past five days the tap water has been muddy and has a sewage-like smell. We have to buy water for drinking and cooking. Please check the supply line for leaks and mixing with drain water.'),
  R('water', 'Very low water pressure for a month in Mugda', 'Medium', 'Mugda', 'Mugda Para', '', '', 1, 'O',
    'Water pressure has been very low for a month and does not reach the upper floors at all. People wake up in the middle of the night to fill buckets. Please check the supply and the pumping schedule.'),
  R('airpoll', 'Construction dust making it hard to breathe, Paltan', 'Medium', 'Paltan', 'Paltan', '', '', 2, 'O',
    'Dust from the nearby construction covers the street and the nearby buildings every day. Many people, especially the elderly, are coughing. The site should be covered and the road sprinkled with water regularly.'),
  R('airpoll', 'Black smoke from old buses on Mymensingh Road', 'Medium', 'Shahbagh', 'Mymensingh Road', '', '', 2, 'O',
    'Old buses on this road release thick black smoke at every stop, and the air at the intersection is hard to breathe. Vehicles with such emissions should be stopped and checked.'),
  R('stray', 'Pack of stray dogs scaring children in Uttara Sector 4', 'Medium', 'Uttara', 'Uttara Sector 4', '', '', 2, 'O',
    'A pack of stray dogs roams the park and the nearby roads in the evening and has chased children and cyclists. Parents are afraid to let children play outside. Please take a humane control measure.'),
  R('encroach', 'Illegal structures blocking canal flow at Demra', 'High', 'Demra', 'Demra Canal', '', '', 3, 'O',
    'Tin sheds and extensions have been built over the canal, narrowing it to a thin channel. During rain the water backs up into the lanes. The encroachment should be removed to restore the flow.'),
  R('tannery', 'Tannery smell and polluted water at Hazaribagh', 'High', 'Hazaribagh', 'Hazaribagh', '', '', 3, 'O',
    'A strong chemical smell comes from the old tannery area, especially in the evening, and the water in the nearby drain is dark. Residents report skin problems and headaches. We need proper cleanup and monitoring.'),
  R('buriganga', 'Black water and smell along the Buriganga bank at Shyampur', 'High', 'Shyampur', 'Buriganga Bank, Shyampur', '', '', 3, 'O',
    'The water near the bank is black and the smell reaches the nearby homes. Dead fish and waste float near the edge. Industrial and household waste seems to be flowing in directly.'),
  R('gas', 'Very low gas pressure, cannot cook at peak hours in Mirpur-1', 'Medium', 'Mirpur', 'Mirpur-1', '', '', 1, 'P',
    'Gas pressure drops almost to zero in the morning and evening, exactly when we need to cook. We are forced to buy cylinders. Please check the line and the pressure in this area.'),
  R('transformer', 'Frequent power cuts after transformer overload in Demra', 'High', 'Demra', 'Demra Staff Quarter', '', '', 2, 'R',
    'The transformer on our road trips every evening and the whole block loses power for hours. After this report a new transformer was installed and the cuts stopped.'),
  R('toilet', 'Public toilet locked and unusable at Gulistan', 'Medium', 'Paltan', 'Gulistan Public Toilet', '', '', 2, 'O',
    'The public toilet near Gulistan has been locked for weeks and there is no alternative nearby. Many commuters, especially women, have no facility. Please reopen it and keep it clean.'),
  R('playground', 'Neglected playground used as a dumping ground in Khilgaon', 'Low', 'Khilgaon', 'Khilgaon Playground', '', '', 2, 'O',
    'The playground is covered in garbage and debris and children no longer play there. It should be cleaned and fenced so it can be used again.'),
];

// ---------------------------------------------------------------------------
// 3. Small helpers (pure - easy to test)
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(question)).trim().toLowerCase();
    return answer === 'yes' || answer === 'y';
  } finally {
    rl.close();
  }
}
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STATUS = {
  O: { label: 'Open', cls: '' },
  P: { label: 'In progress', cls: 'st-progress' },
  R: { label: 'Resolved', cls: 'st-done' },
};

// Dhaka is UTC+6: YYYY-MM-DD as the reporter would have typed it.
function dhakaDate(d) {
  return new Date(d.getTime() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

// Same string the report form builds in ReportIssue.jsx.
function buildAddress(r) {
  return [
    r.road && `Road: ${r.road}`,
    r.block && `Block: ${r.block}`,
    r.area && `Area: ${r.area}`,
    r.thana && `Thana: ${r.thana}`,
    'City: Dhaka',
  ].filter(Boolean).join(', ');
}

// Picks the first category name that exists in the admin-managed list.
export function resolveCategory(hints, categoryNames) {
  const byLower = new Map(categoryNames.map((n) => [n.toLowerCase(), n]));
  for (const h of hints) if (byLower.has(h.toLowerCase())) return byLower.get(h.toLowerCase());
  if (byLower.has('other')) return byLower.get('other');
  return categoryNames[0] || null;
}

// Spread reports over the last ~8 weeks; resolved ones are older.
function pickCreatedAt(status, now) {
  const [lo, hi] = status === 'R' ? [14, 55] : status === 'P' ? [5, 45] : [0, 40];
  const d = new Date(now.getTime() - rand(lo, hi) * 86400000);
  d.setUTCHours(rand(1, 17), rand(0, 59), rand(0, 59), 0); // 07:00-23:00 Dhaka time
  return d > now ? new Date(now.getTime() - 3600000) : d;
}

// Builds the report list: users are dealt out round-robin from a shuffled list,
// so every user gets an (almost) equal share.
export function buildPlan(reports, users, categoryNames, now = new Date()) {
  const dealt = shuffle(users);
  return reports
    .map((r, i) => {
      const createdAt = pickCreatedAt(r.status, now);
      return {
        ...r,
        user: dealt[i % dealt.length],
        category: resolveCategory(TOPICS[r.topic].cat, categoryNames),
        createdAt,
        date: dhakaDate(new Date(createdAt.getTime() - rand(0, 2) * 86400000)),
      };
    })
    .sort((a, b) => a.createdAt - b.createdAt);
}

// ---------------------------------------------------------------------------
// 4. Wikimedia Commons: search, filter, download
// ---------------------------------------------------------------------------
const OK_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Only names that clearly mean Dhaka/Bangladesh (Mirpur, Uttara, Gulshan... also exist elsewhere).
const LOCATION_RE = /dhaka|dacca|bangladesh|buriganga|hazaribagh|sadarghat|kamrangirchar|dhanmondi|motijheel|farmgate|jatrabari|shyamoli/i;
// People, politics, maps and graphics: not useful (and not wanted) as report photos.
const REJECT_RE = /\b(map|logo|flag|emblem|seal|stamp|poster|diagram|chart|graph|screenshot|banknote|portrait|cricket|football|election|rally|protest|conference|ceremony|wedding|minister|president|ambassador|statue|selfie|book|painting|drawing|illustration|satellite)\b/i;

const stripHtml = (s = '') => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function acceptCandidate(c) {
  if (!OK_MIME.has(c.mime)) return false;
  if ((c.origWidth || 0) < 700) return false;
  const ratio = c.width / c.height;
  if (!(ratio > 0.6 && ratio < 2.4)) return false;
  if (REJECT_RE.test(c.text)) return false;
  return LOCATION_RE.test(c.text);
}

async function fetchRetry(url, { as }) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: as === 'json' ? 'application/json' : 'image/*' },
        signal: AbortSignal.timeout(45000),
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = Number(res.headers.get('retry-after')) * 1000 || attempt * 2500;
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (as === 'json') return await res.json();
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'unknown type'})`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      if (/^HTTP 4\d\d/.test(err.message) && !/429/.test(err.message)) break;
      await sleep(attempt * 1500);
    }
  }
  throw lastErr;
}

const searchCache = new Map();

export async function searchCommons(query) {
  if (searchCache.has(query)) return searchCache.get(query);
  const params = new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2',
    generator: 'search', gsrsearch: query, gsrnamespace: '6', gsrlimit: '40',
    prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '1600',
    iiextmetadatafilter: 'ImageDescription|ObjectName|Categories',
  });
  const data = await fetchRetry(`${COMMONS_API}?${params}`, { as: 'json' });
  await sleep(400);
  const pages = (data?.query?.pages || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0));
  const found = [];
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata || {};
    const cand = {
      id: String(p.pageid),
      title: p.title,
      url: info.thumburl || info.url,
      mime: info.mime,
      origWidth: info.width,
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      text: stripHtml(`${p.title} ${meta.ImageDescription?.value || ''} ${meta.ObjectName?.value || ''} ${meta.Categories?.value || ''}`),
    };
    if (acceptCandidate(cand)) found.push(cand);
  }
  searchCache.set(query, found);
  return found;
}

// Chooses `count` photos for one report. Prefers photos nobody has used yet; if a
// topic runs dry it re-uses one (uploaded again as its own separate asset).
export async function pickImages(topicKey, count, used, search = searchCommons) {
  const picked = [];
  const reused = [];
  const queries = TOPICS[topicKey].q;
  for (const q of queries) {
    if (picked.length >= count) break;
    let results = [];
    try { results = await search(q); } catch (err) { console.log(`      search failed for "${q}": ${err.message}`); }
    for (const c of results) {
      if (picked.length >= count) break;
      if (used.has(c.id) || picked.some((p) => p.id === c.id)) continue;
      picked.push(c);
    }
  }
  if (!picked.length) {
    for (const q of queries) {
      let results = [];
      try { results = await search(q); } catch { /* already logged above */ }
      if (results.length) { picked.push(results[0]); reused.push(results[0].id); break; }
    }
  }
  picked.forEach((c) => used.add(c.id));
  return { picked, reused };
}

// ---------------------------------------------------------------------------
// 5. Cloudinary upload (same folder + metadata shape the app stores)
// ---------------------------------------------------------------------------
function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: CLOUDINARY_FOLDERS.issueImages,
        public_id: publicId,
        unique_filename: false,
        overwrite: false,
        tags: [SEED_TAG],
      },
      (err, res) => (err ? reject(err) : resolve(res)),
    );
    stream.end(buffer);
  });
}

// Download one photo to disk, validate it exactly like the app does, upload it.
async function downloadAndUpload(candidate, slug, n, tmpDir) {
  const buffer = await fetchRetry(candidate.url, { as: 'image' });
  const file = { buffer, size: buffer.length, originalname: `${slug}-${n}` };
  const check = validateMediaFile(file, ['image']);
  if (!check.ok) throw new Error(check.error);
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('image too large');

  const ext = check.mimeType === 'image/png' ? 'png' : check.mimeType === 'image/webp' ? 'webp' : 'jpg';
  await fs.writeFile(path.join(tmpDir, `${slug}-${n}.${ext}`), buffer);

  const publicId = `seed_${slug}-${n}_${Math.random().toString(36).slice(2, 8)}`;
  const result = await uploadToCloudinary(buffer, publicId);
  return normalizeAsset(result, 'image');
}

// ---------------------------------------------------------------------------
// 6. Cleanup mode: only touches what this script created
// ---------------------------------------------------------------------------
async function cleanup(yes) {
  const seedRe = new RegExp('^' + escapeRegExp(SEED_PREFIX));
  const issues = await Issue.find({ 'media.publicId': seedRe }).select('title media').lean();
  console.log(`Found ${issues.length} sample report(s) created by this script.`);
  if (!issues.length) return;
  if (!yes) {
    issues.slice(0, 10).forEach((i) => console.log(`  - ${i.title}`));
    if (issues.length > 10) console.log(`  ... and ${issues.length - 10} more`);
    console.log('\nNothing deleted. Run "node script.js --cleanup --yes" to delete them,');
    console.log('their photos on Cloudinary, and any comments/notifications attached to them.');
    return;
  }
  const ids = issues.map((i) => i._id);
  const assets = issues.flatMap((i) => i.media.filter((m) => seedRe.test(m.publicId)));
  const failures = await deleteAssets(assets.map((m) => ({ publicId: m.publicId, resourceType: m.resourceType })));
  const c = await Comment.deleteMany({ issue: { $in: ids } });
  const n = await Notification.deleteMany({ $or: [{ issueId: { $in: ids } }, { targetType: 'Issue', targetId: { $in: ids } }] });
  const d = await Issue.deleteMany({ _id: { $in: ids } });
  console.log(`Deleted ${d.deletedCount} report(s), ${assets.length - failures.length} photo(s), ${c.deletedCount} comment(s), ${n.deletedCount} notification(s).`);
  if (failures.length) console.log(`Could not delete ${failures.length} photo(s) from Cloudinary (check the Media Library, tag "${SEED_TAG}").`);
}

// ---------------------------------------------------------------------------
// 7. Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const flag = (f) => args.includes(f);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number.parseInt(args[limitIdx + 1], 10) : null;
  const dryRun = flag('--dry-run');

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in backend/.env');
  if (!dryRun && !flag('--cleanup') && !isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in backend/.env');
  }
  if (flag('--cleanup') && !isCloudinaryConfigured) {
    console.log('Note: Cloudinary is not configured, photos will not be deleted from Cloudinary.');
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB: database "${mongoose.connection.name}" on ${mongoose.connection.host}`);

  if (flag('--cleanup')) {
    await cleanup(flag('--yes'));
    return;
  }

  const seedRe = new RegExp('^' + escapeRegExp(SEED_PREFIX));
  if (!flag('--force') && (await Issue.exists({ 'media.publicId': seedRe }))) {
    throw new Error('Sample data from an earlier run already exists. Use --cleanup first, or --force to add another batch.');
  }

  // Existing users only. Prefer regular (non-admin) users; never create or modify any.
  const everyone = await User.find({ isSuspended: { $ne: true } }).select('_id name isAdmin').lean();
  const regular = everyone.filter((u) => !u.isAdmin);
  const users = regular.length >= 2 ? regular : everyone;
  if (!users.length) throw new Error('No users found in the database. Register a few users first - this script never creates users.');
  if (users.length === 1 && !flag('--allow-single-user')) {
    throw new Error('Only one eligible user exists, so every report would belong to them. Register more users, or pass --allow-single-user.');
  }

  const categoryNames = (await Category.find().sort({ createdAt: 1 }).select('name').lean()).map((c) => c.name);
  if (!categoryNames.length) throw new Error('No report categories exist yet. Open the report form (or Admin > Categories) once so the defaults are created, then run again.');

  let plan = buildPlan(REPORTS, users, categoryNames);
  if (limit) plan = plan.slice(0, limit);

  console.log(`Plan: ${plan.length} report(s) spread across ${Math.min(users.length, plan.length)} existing user(s).`);
  console.log(`Categories in your database: ${categoryNames.join(', ')}\n`);

  // ---------- STEP 1: preview (always runs first, saves nothing) ----------
  console.log('STEP 1 of 2 - PREVIEW (nothing is saved yet)\n');
  const used = new Set();
  for (let i = 0; i < plan.length; i++) {
    const r = plan[i];
    console.log(`[${String(i + 1).padStart(2)}/${plan.length}] ${r.title}`);
    console.log(`      ${r.thana} · ${r.category} · ${r.pri} · user: ${r.user.name}`);
    const { picked, reused } = await pickImages(r.topic, Math.min(r.imgs, MAX_ISSUE_MEDIA_COUNT), used);
    r.picked = picked;
    r.reused = reused;
    if (!picked.length) console.log('      photos: NONE FOUND');
    picked.forEach((c) => console.log(`      photo: ${c.title}${reused.includes(c.id) ? ' (re-used)' : ''}`));
  }

  const ready = plan.filter((r) => r.picked.length);
  const noPhotos = plan.filter((r) => !r.picked.length);
  const photoTotal = plan.reduce((a, r) => a + r.picked.length, 0);
  const reusedTotal = plan.reduce((a, r) => a + r.reused.length, 0);
  const previewPerUser = new Map();
  (flag('--allow-no-image') ? plan : ready).forEach((r) => previewPerUser.set(r.user.name, (previewPerUser.get(r.user.name) || 0) + 1));

  console.log('\n---------------- PREVIEW SUMMARY ----------------');
  console.log(`${ready.length} of ${plan.length} report(s) have photos ready (${photoTotal} photo(s) in total).`);
  if (reusedTotal) console.log(`${reusedTotal} photo(s) are re-used because a topic ran out of pictures.`);
  if (noPhotos.length) {
    console.log(`${noPhotos.length} report(s) have NO photo and will be skipped${flag('--allow-no-image') ? ' (--allow-no-image: created without photos)' : ''}:`);
    noPhotos.forEach((r) => console.log(`  - ${r.title}`));
  }
  console.log('Reports per user:');
  [...previewPerUser].sort((a, b) => b[1] - a[1]).forEach(([name, n]) => console.log(`  ${String(n).padStart(2)}  ${name}`));

  if (dryRun) {
    console.log('\nPreview only (--dry-run) - nothing was saved.');
    return;
  }

  const toCreate = flag('--allow-no-image') ? plan.length : ready.length;
  if (!toCreate) throw new Error('No photos could be found for any report, so nothing would be created. Check your internet connection and try again.');

  // ---------- confirmation ----------
  if (!flag('--yes')) {
    if (!process.stdin.isTTY) {
      throw new Error('Preview finished. Run this in a normal terminal to confirm, or add --yes to skip the question.');
    }
    const ok = await confirm(`\nCreate ${toCreate} report(s) and upload ${photoTotal} photo(s) to Cloudinary now? Type yes to continue: `);
    if (!ok) {
      console.log('Cancelled. Nothing was saved.');
      return;
    }
  }

  // ---------- STEP 2: create ----------
  console.log('\nSTEP 2 of 2 - CREATING REPORTS (downloading and uploading photos, about 5-10 minutes)\n');
  const tmpDir = path.join(os.tmpdir(), `nagorik-seed-${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const stats = { created: 0, skipped: [], images: 0, perUser: new Map(), perCategory: new Map() };
  const status = flag('--pending') ? 'pending' : 'approved';

  for (let i = 0; i < plan.length; i++) {
    const r = plan[i];
    console.log(`[${String(i + 1).padStart(2)}/${plan.length}] ${r.title}`);
    const picked = r.picked;

    const media = [];
    const slug = slugify(r.title);
    for (let n = 0; n < picked.length; n++) {
      try {
        media.push(await downloadAndUpload(picked[n], slug, n + 1, tmpDir));
        console.log(`      uploaded ${n + 1}/${picked.length}: ${picked[n].title}`);
      } catch (err) {
        console.log(`      photo ${n + 1} failed (${picked[n].title}): ${err.message}`);
      }
      await sleep(300);
    }

    if (!media.length && !flag('--allow-no-image')) {
      console.log('      skipped: no photo could be uploaded');
      stats.skipped.push(r.title);
      continue;
    }

    const photos = media.map((m) => m.url);
    try {
      await Issue.create({
        title: r.title,
        priority: r.pri,
        category: r.category,
        date: r.date,
        area: r.area,
        thana: r.thana,
        city: 'Dhaka',
        description: r.desc,
        address: buildAddress(r),
        media,
        photos,
        img: photos[0] || '',
        statusLabel: STATUS[r.status].label,
        statusClass: STATUS[r.status].cls,
        moderationStatus: status,
        moderatedAt: status === 'approved' ? new Date(r.createdAt.getTime() + rand(1, 6) * 3600000) : null,
        moderatedBy: null,
        user: r.user._id,
        createdAt: r.createdAt,
        updatedAt: r.createdAt,
      });
    } catch (err) {
      // Same rollback the app does: never leave photos behind without a report.
      await deleteAssets(media.map((m) => ({ publicId: m.publicId, resourceType: 'image' })));
      console.log(`      FAILED to save report, photos rolled back: ${err.message}`);
      stats.skipped.push(r.title);
      continue;
    }

    stats.created += 1;
    stats.images += media.length;
    stats.perUser.set(r.user.name, (stats.perUser.get(r.user.name) || 0) + 1);
    stats.perCategory.set(r.category, (stats.perCategory.get(r.category) || 0) + 1);
  }

  console.log('\n================ SUMMARY ================');
  console.log(`Created: ${stats.created} report(s), ${stats.images} photo(s) uploaded to Cloudinary`);
  if (reusedTotal) console.log(`Photos re-used because a topic ran out of pictures: ${reusedTotal}`);
  if (stats.perUser.size) {
    console.log('\nReports per user:');
    [...stats.perUser].sort((a, b) => b[1] - a[1]).forEach(([name, n]) => console.log(`  ${String(n).padStart(2)}  ${name}`));
    console.log('\nReports per category:');
    [...stats.perCategory].sort((a, b) => b[1] - a[1]).forEach(([name, n]) => console.log(`  ${String(n).padStart(2)}  ${name}`));
  }
  if (stats.skipped.length) {
    console.log(`\nSkipped (${stats.skipped.length}) - no usable photo found:`);
    stats.skipped.forEach((t) => console.log(`  - ${t}`));
  }
  if (stats.created < MIN_REPORTS_WANTED) {
    console.log(`\nWarning: only ${stats.created} report(s) were created (target ${MIN_REPORTS_WANTED}). Run again with --force to add more.`);
  }
  if (flag('--keep-images')) console.log(`\nDownloaded photos kept in: ${tmpDir}`);
  else await fs.rm(tmpDir, { recursive: true, force: true });
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(`\nscript.js error: ${err.message}`);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

export { REPORTS, TOPICS };