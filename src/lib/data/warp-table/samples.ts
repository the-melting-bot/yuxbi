/**
 * Warp Table — Seeded Sample Datasets
 * Curated, realistic samples that each reveal a different transformation story.
 */

import type { SampleDataset } from './types';

const contactsCsv = `first_name,last_name, email ,phone,city,signed_up_at
Mira,Okafor,mira.okafor@example.com,+1-415-555-0134,San Francisco,2025-11-02
Dev,Patel, dev.patel@example.com ,+1-415-555-0134,San Francisco,2025-11-02
Noor,Haddad,noor@example.com,+44 20 7946 0412,London,2024-08-18
Kenji,Arakawa,kenji.arakawa@example.com,+81-3-5555-2098,Tokyo,2025-02-11
Ines,Moreau,ines.moreau@example.com,+33 1 70 36 39 55,Paris,2023-12-04
Kenji,Arakawa,kenji.arakawa@example.com,+81-3-5555-2098,Tokyo,2025-02-11
Amara,Diallo,amara.diallo@example.com,+221 33 869 00 00,Dakar,2025-07-22
Leo,Schneider, leo@example.com,+49 30 55579912,Berlin,2024-05-30
Tallulah,Hughes,,+61 2 5550 3377,Sydney,2025-03-19
Priya,Ramanathan,priya.r@example.com,+91 80 4567 8901,Bengaluru,2025-01-08
`;

const businessesCsv = `Business Name,Category,Street,City,State,Zip,Rating,Reviews,Open Now
Loom & Ladle,Cafe,441 Alder Ave,Portland,OR,97214,4.7,312,TRUE
Northlight Books,Bookstore,88 Pier St,Seattle,WA,98101,4.8,204,TRUE
Saltfern Records,Record Store,1920 Mission Blvd,San Francisco,CA,94110,4.6,118,FALSE
Ember & Oak,Restaurant,300 Magnolia Way,Austin,TX,78701,4.5,987,TRUE
Tidebox Surf Co.,Surf Shop,55 Driftwood Ln,Encinitas,CA,92024,4.9,76,TRUE
Paperkite Studio,Design Studio,12 Willow Ct,Brooklyn,NY,11201,4.8,54,FALSE
The Fern Room,Florist,661 Tulip St,Minneapolis,MN,55403,4.7,132,TRUE
Granite & Grain Bakery,Bakery,201 Cedar Hollow,Asheville,NC,28801,4.9,401,TRUE
Hollowell Hardware,Hardware,27 Pinegrove Rd,Burlington,VT,05401,4.4,89,TRUE
Meridian Bicycles,Bike Shop,709 Foxglove Ave,Boulder,CO,80302,4.8,263,FALSE
`;

const inventoryJson = `[
  { "sku": "HB-2291", "name": "Heirloom Brass Hook", "category": "hardware", "price": 18.00, "stock": 42, "supplier": "Foundry North" },
  { "sku": "LN-1044", "name": "Linen Table Runner", "category": "textiles", "price": 36.50, "stock": 17, "supplier": "Tide & Tow" },
  { "sku": "CR-8812", "name": "Ceramic Pour-Over", "category": "kitchen", "price": 52.00, "stock": 8, "supplier": "Foundry North" },
  { "sku": "WD-3310", "name": "Walnut Cutting Board", "category": "kitchen", "price": 68.00, "stock": 0, "supplier": "Grain & Grove" },
  { "sku": "PT-4471", "name": "Terra Cotta Planter", "category": "garden", "price": 24.00, "stock": 31, "supplier": "Fernwood Works" },
  { "sku": "CN-9902", "name": "Beeswax Taper Set", "category": "home", "price": 14.00, "stock": 60, "supplier": "Honeyhaus" },
  { "sku": "LT-7781", "name": "Hand-Blown Pendant Lamp", "category": "lighting", "price": 185.00, "stock": 4, "supplier": "Ember Glass" },
  { "sku": "BK-3399", "name": "Field Notebook — Indigo", "category": "stationery", "price": 16.00, "stock": 120, "supplier": "Paperkite" }
]
`;

const nestedApiJson = `{
  "meta": { "generated_at": "2026-04-18T09:12:44Z", "page": 1, "total": 5 },
  "results": [
    {
      "id": "ord_74A21",
      "customer": { "name": "Mira Okafor", "email": "mira.okafor@example.com", "tier": "gold" },
      "order": { "total": 184.50, "currency": "USD", "items": 3 },
      "shipping": { "city": "San Francisco", "country": "US", "status": "delivered" }
    },
    {
      "id": "ord_74A22",
      "customer": { "name": "Kenji Arakawa", "email": "kenji.arakawa@example.com", "tier": "silver" },
      "order": { "total": 52.00, "currency": "USD", "items": 1 },
      "shipping": { "city": "Tokyo", "country": "JP", "status": "in_transit" }
    },
    {
      "id": "ord_74A23",
      "customer": { "name": "Ines Moreau", "email": "ines.moreau@example.com", "tier": "gold" },
      "order": { "total": 312.75, "currency": "EUR", "items": 5 },
      "shipping": { "city": "Paris", "country": "FR", "status": "processing" }
    },
    {
      "id": "ord_74A24",
      "customer": { "name": "Amara Diallo", "email": "amara.diallo@example.com", "tier": "platinum" },
      "order": { "total": 998.00, "currency": "USD", "items": 8 },
      "shipping": { "city": "Dakar", "country": "SN", "status": "delivered" }
    },
    {
      "id": "ord_74A25",
      "customer": { "name": "Leo Schneider", "email": "leo@example.com", "tier": "silver" },
      "order": { "total": 67.20, "currency": "EUR", "items": 2 },
      "shipping": { "city": "Berlin", "country": "DE", "status": "delivered" }
    }
  ]
}
`;

const civicJson = `[
  { "permit_id": "BP-2025-44021", "type": "Residential Renovation", "address": "118 Larch St", "neighborhood": "Eastwood", "issued_on": "2025-09-14", "valuation": 82500 },
  { "permit_id": "BP-2025-44022", "type": "New Construction", "address": "4400 Harbor Way", "neighborhood": "Portside", "issued_on": "2025-09-15", "valuation": 1420000 },
  { "permit_id": "BP-2025-44023", "type": "Commercial Tenant Improvement", "address": "902 Pine Ave", "neighborhood": "Downtown", "issued_on": "2025-09-15", "valuation": 245000 },
  { "permit_id": "BP-2025-44024", "type": "Residential Renovation", "address": "67 Glenwood Ct", "neighborhood": "Eastwood", "issued_on": "2025-09-17", "valuation": 38000 },
  { "permit_id": "BP-2025-44025", "type": "Solar Install", "address": "12 Marigold Ln", "neighborhood": "Northfield", "issued_on": "2025-09-18", "valuation": 24500 },
  { "permit_id": "BP-2025-44026", "type": "Demolition", "address": "1 Warehouse Row", "neighborhood": "Portside", "issued_on": "2025-09-19", "valuation": 16000 },
  { "permit_id": "BP-2025-44027", "type": "Solar Install", "address": "339 Acorn St", "neighborhood": "Northfield", "issued_on": "2025-09-20", "valuation": 31800 }
]
`;

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'contacts',
    name: 'Contacts (CSV)',
    description: 'Messy contact list — blank emails, stray spaces, a duplicate row.',
    format: 'csv',
    content: contactsCsv
  },
  {
    id: 'businesses',
    name: 'Local Businesses (CSV)',
    description: 'Small-business directory with mixed-case headers and boolean flags.',
    format: 'csv',
    content: businessesCsv
  },
  {
    id: 'inventory',
    name: 'Inventory (JSON)',
    description: 'Flat product catalog — clean keys, numeric stock and price.',
    format: 'json',
    content: inventoryJson
  },
  {
    id: 'orders-api',
    name: 'Orders API Response (JSON)',
    description: 'Nested API payload with customer/order/shipping objects to flatten.',
    format: 'json',
    content: nestedApiJson
  },
  {
    id: 'permits',
    name: 'City Permits (JSON)',
    description: 'Civic dataset — good for grouping by neighborhood or keying by permit id.',
    format: 'json',
    content: civicJson
  }
];

export function getSampleById(id: string): SampleDataset | undefined {
  return SAMPLE_DATASETS.find((s) => s.id === id);
}
