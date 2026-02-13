# SeasonScope

A location-aware guide that tells users what produce is in-season locally, estimated carbon footprint (kg CO₂e per kg food), and water-stress risk for likely origins. All data and claims are cited with provenance and uncertainty.

## Architecture

```
seasonscope/
├── apps/
│   ├── web/          # Next.js (App Router) + TypeScript + Tailwind
│   └── mobile/       # React Native (Expo) + TypeScript
├── packages/
│   ├── shared/       # Shared domain logic, types, factor selection
│   ├── ui/           # Reusable UI components + design tokens
│   └── data/         # Database migrations, ETL, seed data, validation
├── render.yaml       # Render deployment blueprint
└── .env.example      # Environment variables template
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 16+ (or use Render/Supabase managed)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run migrations + seed data
npm run db:migrate
npm run seed

# 4. Start web dev server
npm run dev:web

# 5. Start mobile dev server (requires Expo)
npm run dev:mobile
```

### Database Setup

The database schema includes:
- `foods` – Canonical food items with synonyms
- `ghg_factors` – GHG emission factors with min/mid/max, citations, quality scores
- `seasonality` – Monthly in-season probabilities per region
- `origins` – Trade flow probabilities for food origin tracking
- `water_risk` – Water-stress risk indicators by region
- `sources` – Full citation records for all data
- `mappings` – User search term → canonical food mappings

### ETL Pipeline

```bash
# Full pipeline: migrate → seed → refresh views → validate
npm run etl

# Individual steps
npm run db:migrate    # Create/update tables
npm run seed          # Insert seed data (190+ foods)
npx tsx packages/data/src/validate.ts  # Validate data integrity
```

### Running Tests

```bash
npm test
```

## Deployment (Render)

1. Connect the repo to Render
2. Render auto-detects `render.yaml`
3. A web service and PostgreSQL database will be provisioned
4. After deployment, run the ETL pipeline to seed the database:
   ```bash
   # SSH into Render shell or use a one-off job
   npm run etl
   ```

## Data Sources

| Source | Coverage | License |
|--------|----------|---------|
| Poore & Nemecek 2018 | Global GHG factors (baseline) | Academic |
| Our World in Data | Tabulated P&N data | CC BY 4.0 |
| AGRIBALYSE 3.x | EU/FR region-specific LCA | Etalab 2.0 |
| FAO Crop Calendar | Global seasonality | Open data |
| WRI Aqueduct | Water-stress risk | CC BY 4.0 |
| Theurl et al. 2014 | Greenhouse vs import analysis | Academic |

## Data Quality

Every displayed value includes:
- **Range**: min / mid / max
- **Quality badge**: High (region-specific LCA), Medium (global average), Low (estimated)
- **Citations**: clickable source references
- **Assumptions**: explicit uncertainty documentation

## Key Features

- **Home**: "What's best to buy this month?" personalized to location + month
- **Browse**: Filter by category (Produce, Meat, Dairy, Grains, Legumes, Oils)
- **Food Detail**: CO₂e range, season calendar, alternatives, explanation panel
- **Compare**: Side-by-side comparison with breakdown
- **Data Sources**: Full methodology documentation
- **Heated Greenhouse Badge**: Warns when local greenhouse heating may exceed import emissions
- **Water-Risk Badge**: Regional water-stress indicator (not a moral verdict)

## Tech Stack

- **Web**: Next.js 14, TypeScript, Tailwind CSS
- **Mobile**: React Native (Expo), TypeScript
- **Database**: PostgreSQL with full-text search (trigram)
- **Deployment**: Render (web + database)
- **Shared**: Monorepo with shared types and domain logic
