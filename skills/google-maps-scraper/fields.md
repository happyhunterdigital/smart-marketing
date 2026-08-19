# Data Fields — What an Audit Reads

Every business the tool finds comes back as a record with up to 50+ fields. An audit reads **three groups** of fields. The rest are useful context.

> **The one field to remember: KGMID.** It is the unique ID for each business and is always present. `PLACE_ID` can occasionally be missing, so use KGMID when you need to tell records apart.

---

## Audit group 1 — Business identity

Does Google know who you are? These fields answer that question.

| Field | What it means | Audit question it answers |
| --- | --- | --- |
| `NAME` | The business name as Google shows it. | Is my official name spelled exactly right? |
| `MAIN_CATEGORY` | The primary category, e.g. "Restaurant". | Is my primary trade category correct? |
| `CATEGORIES` | All categories the business is filed under. | Am I filed under the right categories? |
| `ADDRESS` | Street address. | Is my physical address correct? |
| `DETAILED_ADDRESS` | Fuller address including neighbourhood and postcode. | Is my full address right? |
| `COORDINATES` | Latitude and longitude. | Am I pinned at the right spot on the map? |
| `PLUS_CODE` | Open Location Code for the address. | |
| `SERVICE-AREA` (geolocation search) | The boundary you drew for a service-area business. | Is my designated service-area boundary correct? |
| `STATUS` | Listing status. | Is my listing active and live? |

**Red flag:** a wrong `NAME`, a missing `ADDRESS`, or an incorrect `MAIN_CATEGORY` is exactly the confusion that keeps AI answers from recommending you.

## Audit group 2 — Core contact points

Can a customer actually reach you? These fields answer that.

| Field | What it means | Audit question it answers |
| --- | --- | --- |
| `PHONE` | Local phone number, click-to-call on mobile. | Can a customer tap my number and call me? |
| `PHONE_INTERNATIONAL` | Phone number with country code. | Does my number include the right country code? |
| `WEBSITE` | The business website. | Is my website linked and working? |

**Red flag:** a missing `PHONE` or `WEBSITE` means customers cannot click to reach you — and Google has less proof the business is real.

## Audit group 3 — Ratings

Do customers prove you are real and trusted? These fields answer that.

| Field | What it means | Audit question it answers |
| --- | --- | --- |
| `RATING` | Average star rating. | What does my public rating look like? |
| `REVIEWS` | Total number of reviews. | How much social proof do I have? |
| `REVIEWS_PER_RATING` | How many reviews at each star level. | Where are my reviews concentrated? |
| `REVIEWS_LINK` | Link to the reviews page. | |
| `REVIEW_KEYWORDS` | Common words customers use in reviews. | What do customers actually say about me? |
| `FEATURED_REVIEWS` | Reviews Google highlights on the profile. | What is the first thing people read? |
| `FEATURED_QUESTION` | A question the business answered publicly. | |

**Red flag:** an empty or weak review profile is the most common reason AI and customers skip a business.

---

## Useful context fields (not part of the core audit)

### Social media

| Field | What it means |
| --- | --- |
| `LINKEDIN`, `TWITTER`, `FACEBOOK` | Social profiles. |
| `YOUTUBE`, `INSTAGRAM`, `PINTEREST` | Social profiles. |
| `GITHUB`, `SNAPCHAT`, `TIKTOK` | Social profiles. |

### Ownership and listing status

| Field | What it means |
| --- | --- |
| `OWNER` | Business owner name, where Google has it. |
| `OWNER_POSTS` | Updates posted by the owner. |
| `CAN_CLAIM` | Whether the listing is unclaimed. **If true, the listing needs to be claimed — no one is controlling what Google shows.** |
| `IS_SPENDING_ON_ADS` | Whether the business runs Google Ads. |
| `IS_TEMPORARILY_CLOSED` | Whether the business is temporarily closed. |
| `IS_PERMANENTLY_CLOSED` | Whether the business is permanently closed. |

### Media and visuals

| Field | What it means |
| --- | --- |
| `FEATURED_IMAGE` | Main photo shown on the profile. |
| `FEATURED_IMAGES` | Gallery of highlighted photos. |
| `IMAGE_COUNT` | Total number of photos. |
| `IMAGES` | Links to the photos. |

### Hours and busy times

| Field | What it means |
| --- | --- |
| `WORKDAY_TIMING` | Standard opening hours. |
| `CLOSED_ON` | Days the business is closed. |
| `HOURS` | Full opening hours breakdown. |
| `POPULAR_TIMES` | When customers visit, by hour. |
| `MOST_POPULAR_TIMES` | The busiest hours. |

### Services and ordering

| Field | What it means |
| --- | --- |
| `MENU` | Menu link. |
| `RESERVATIONS` | Booking / reservation links. |
| `ORDER_ONLINE_LINKS` | Links to order online. |
| `PRICE_RANGE` | Cost level, e.g. $, $$, $$$. |

### Additional details

| Field | What it means |
| --- | --- |
| `DESCRIPTION` | What Google writes about the business. |
| `LINK` | Direct Google Maps link to the business. |
| `PLACE_ID`, `CID`, `DATA_ID`, `KGMID` | Google's internal IDs for the record. |
| `ABOUT` | About section on the profile. |
| `ON_SITE_PLACES` | Other places listed on the same site. |
| `GAS_PRICES` | Fuel prices (for petrol stations). |
| `CUSTOMER_UPDATES` | Updates the business posts to customers. |
| `COMPETITORS` | Competing businesses shown by Google. |
| `LOCATION_SUMMARY` | Short summary of the location. |
| `TIME_ZONE` | The business's time zone. |

---

## Rental and hotel fields

When a place is a rental or hotel (flagged by `IS_RENTAL`), extra fields appear. Normal businesses do not have these.

### Core identity (rental variant)

Same core fields as above, plus:

| Field | What it means |
| --- | --- |
| `IS_RENTAL` | Whether the place is a rental/hotel. |
| `HOTEL_STARS` | Star rating of the hotel. |
| `PRICE` | Price level. |

### Property details

| Field | What it means |
| --- | --- |
| `SLEEPS` | How many guests it sleeps. |
| `BEDROOMS` | Number of bedrooms. |
| `BEDS` | Number of beds. |
| `BATHROOMS` | Number of bathrooms. |
| `MIN_NIGHTS` | Minimum night stay. |
| `AMENITIES` | Available amenities. |

### Check-in / check-out

| Field | What it means |
| --- | --- |
| `CHECKIN_DATE` | Available check-in date. |
| `CHECKOUT_DATE` | Available check-out date. |
| `CHECKIN_TIME` | Check-in time. |
| `CHECKOUT_TIME` | Check-out time. |

### Booking

| Field | What it means |
| --- | --- |
| `BOOKING_PLATFORMS` | Where the place can be booked. |
| `ADDITIONAL_RESULTS_FROM_WEB` | Extra web results about the place. |

### Nearby context

| Field | What it means |
| --- | --- |
| `NEARBY_RENTALS` | Other rentals nearby. |
| `NEARBY_HOTELS` | Hotels nearby. |

---

## Data quality promise

All fields are pulled directly from the live Google Maps listing, so the data matches what Google actually shows. Fields that do not apply to a business (for example, `MIN_NIGHTS` on a restaurant) are simply absent — they only appear when `IS_RENTAL` is true.