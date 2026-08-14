# Extracted Data Fields

Every business the tool finds comes back as a record with up to 50+ fields. Below is the complete list, grouped by what the data is for.

> **The one field to remember: KGMID.** It is the unique ID for each business and is always present. `PLACE_ID` can occasionally be missing, so use KGMID when you need to tell records apart.

---

## Core identity

Used to identify the business and understand what it does.

| Field | What it means |
| --- | --- |
| `PLACE_ID` | Google's internal ID. Usually present, sometimes missing. |
| `KGMID` | Knowledge Graph Machine ID. Always present and unique — use this as the record ID. |
| `CID` | Google's customer ID for the business. |
| `DATA_ID` | Another Google reference ID. |
| `NAME` | Business name. |
| `DESCRIPTION` | What Google writes about the business. |
| `LINK` | Direct Google Maps link to the business. |
| `MAIN_CATEGORY` | The primary category, e.g. "Restaurant". |
| `CATEGORIES` | All categories the business is filed under. |

## Contact information

Everything you need to reach out.

| Field | What it means |
| --- | --- |
| `WEBSITE` | The business website. |
| `PHONE` | Local phone number. |
| `PHONE_INTERNATIONAL` | Phone number with country code. |
| `ADDRESS` | Street address. |
| `DETAILED_ADDRESS` | Fuller address including neighbourhood and postcode. |
| `COORDINATES` | Latitude and longitude. |
| `PLUS_CODE` | Open Location Code for the address. |
| `TIME_ZONE` | The business's time zone. |

## Ratings and reviews

Useful for qualifying leads — a strong rating often means an active, well-run business.

| Field | What it means |
| --- | --- |
| `RATING` | Average star rating. |
| `REVIEWS` | Total number of reviews. |
| `REVIEWS_PER_RATING` | How many reviews at each star level. |
| `REVIEWS_LINK` | Link to the reviews page. |
| `REVIEW_KEYWORDS` | Common words customers use in reviews. |
| `FEATURED_REVIEWS` | Reviews Google highlights on the profile. |
| `FEATURED_QUESTION` | A question the business answered publicly. |

## Social media

Where the business is active online, and where they may be a better lead for a social or web service.

| Field | What it means |
| --- | --- |
| `LINKEDIN` | LinkedIn profile. |
| `TWITTER` | Twitter / X profile. |
| `FACEBOOK` | Facebook page. |
| `YOUTUBE` | YouTube channel. |
| `INSTAGRAM` | Instagram profile. |
| `PINTEREST` | Pinterest profile. |
| `GITHUB` | GitHub profile. |
| `SNAPCHAT` | Snapchat account. |
| `TIKTOK` | TikTok account. |

## Ownership and listing status

Signals whether a business is worth pursuing — and how urgently.

| Field | What it means |
| --- | --- |
| `OWNER` | Business owner name, where Google has it. |
| `OWNER_POSTS` | Updates posted by the owner. |
| `CAN_CLAIM` | Whether the listing is unclaimed (a common lead signal). |
| `IS_SPENDING_ON_ADS` | Whether the business runs Google Ads. |
| `STATUS` | Listing status. |
| `IS_TEMPORARILY_CLOSED` | Whether the business is temporarily closed. |
| `IS_PERMANENTLY_CLOSED` | Whether the business is permanently closed. |

## Media and visuals

A picture of how established the business is.

| Field | What it means |
| --- | --- |
| `FEATURED_IMAGE` | Main photo shown on the profile. |
| `FEATURED_IMAGES` | Gallery of highlighted photos. |
| `IMAGE_COUNT` | Total number of photos. |
| `IMAGES` | Links to the photos. |

## Hours and busy times

| Field | What it means |
| --- | --- |
| `WORKDAY_TIMING` | Standard opening hours. |
| `CLOSED_ON` | Days the business is closed. |
| `HOURS` | Full opening hours breakdown. |
| `POPULAR_TIMES` | When customers visit, by hour. |
| `MOST_POPULAR_TIMES` | The busiest hours. |

## Services and ordering

More useful context for restaurants and similar businesses.

| Field | What it means |
| --- | --- |
| `MENU` | Menu link. |
| `RESERVATIONS` | Booking / reservation links. |
| `ORDER_ONLINE_LINKS` | Links to order online. |
| `PRICE_RANGE` | Cost level, e.g. $, $$, $$$. |

## Additional details

| Field | What it means |
| --- | --- |
| `ABOUT` | About section on the profile. |
| `ON_SITE_PLACES` | Other places listed on the same site. |
| `GAS_PRICES` | Fuel prices (for petrol stations). |
| `CUSTOMER_UPDATES` | Updates the business posts to customers. |
| `COMPETITORS` | Competing businesses shown by Google. |
| `LOCATION_SUMMARY` | Short summary of the location. |

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