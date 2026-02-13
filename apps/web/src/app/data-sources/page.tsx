import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookOpen, ExternalLink, AlertTriangle, Database, BarChart3, Droplets, Calendar, Thermometer } from 'lucide-react';

export default function DataSourcesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-8 sm:py-12 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            Data Sources & Methodology
          </h1>
          <p className="text-stone-500 mb-8">
            SeasonScope is committed to transparency. Every data point shown in the app
            is backed by cited sources. This page explains our methodology, data sources,
            and known limitations.
          </p>

          {/* Principles */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-600" />
              Our Principles
            </h2>
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5 text-sm text-stone-600 space-y-2">
              <p><strong>Cite everything.</strong> Every numeric value has provenance.</p>
              <p><strong>Show uncertainty.</strong> We display ranges and confidence scores, not false precision.</p>
              <p><strong>Don&apos;t overclaim.</strong> We show assumptions alongside recommendations.</p>
              <p><strong>Guide, not judge.</strong> We present data for informed choices, not moral verdicts.</p>
              <p><strong>Transparency.</strong> Our data pipeline, sources, and limitations are documented here.</p>
            </div>
          </section>

          {/* GHG Data */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-600" />
              Greenhouse Gas (GHG) Emission Factors
            </h2>
            <div className="space-y-4 text-sm text-stone-600">
              <div className="rounded-xl border border-stone-200 p-4">
                <h3 className="font-semibold text-stone-800 mb-1">Primary: Poore & Nemecek (2018)</h3>
                <p className="mb-2">
                  Our baseline GHG factors come from the comprehensive meta-analysis by
                  J. Poore and T. Nemecek, &ldquo;Reducing food&apos;s environmental impacts through
                  producers and consumers,&rdquo; published in <em>Science</em>, Vol. 360, Issue 6392,
                  pp. 987-992 (2018). This study synthesized data from ~38,700 farms and
                  1,600 processors across 119 countries.
                </p>
                <p className="mb-2">
                  We use the dataset as distributed by <strong>Our World in Data (OWID)</strong>,
                  which provides accessible, tabulated versions of the Poore & Nemecek data.
                </p>
                <div className="flex gap-2 text-xs">
                  <a
                    href="https://doi.org/10.1126/science.aaq0216"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <ExternalLink size={10} /> Paper (DOI)
                  </a>
                  <a
                    href="https://ourworldindata.org/environmental-impacts-of-food"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <ExternalLink size={10} /> OWID Dataset
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 p-4">
                <h3 className="font-semibold text-stone-800 mb-1">Regional: AGRIBALYSE 3.x</h3>
                <p className="mb-2">
                  Where available, we use AGRIBALYSE (maintained by ADEME, France) for
                  region-specific LCA data, particularly for French/EU food products.
                  This provides higher-quality, locally-relevant emission factors.
                </p>
                <p className="text-xs text-stone-400">
                  License: Open data (Etalab 2.0). Factors marked &ldquo;High Quality Data&rdquo;
                  when using region-specific LCA.
                </p>
              </div>
            </div>
          </section>

          {/* Seasonality */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              Seasonality Data
            </h2>
            <div className="text-sm text-stone-600 space-y-3">
              <p>
                Seasonality information is derived from <strong>FAO crop calendar data</strong>{' '}
                and supplemented with national/regional growing season information.
                We map each food to known harvest windows by country and climate zone.
              </p>
              <p>
                User location is resolved to a country + admin region, then mapped to a
                climate zone (using a simplified Köppen classification). The &ldquo;in-season
                probability&rdquo; reflects how likely a food is to be available from local
                production in a given month.
              </p>
              <p className="text-xs text-stone-400">
                Confidence scores are assigned based on data source quality:
                High (direct national crop calendar), Medium (regional/climate-zone inference),
                Low (global generalization).
              </p>
            </div>
          </section>

          {/* Water Risk */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Droplets size={18} className="text-emerald-600" />
              Water-Stress Risk
            </h2>
            <div className="text-sm text-stone-600 space-y-3">
              <p>
                Water-stress risk indicators use data from the{' '}
                <strong>WRI Aqueduct Water Risk Atlas</strong> (World Resources Institute).
                We compute a risk bucket for likely origin regions of each food.
              </p>
              <p>
                <strong>Important:</strong> This is a <em>risk indicator</em>, not a precise
                water footprint. It reflects regional water stress conditions, not
                crop-specific water consumption. Use it as one signal among many.
              </p>
              <div className="flex gap-2 text-xs">
                <a
                  href="https://www.wri.org/aqueduct"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <ExternalLink size={10} /> WRI Aqueduct
                </a>
              </div>
            </div>
          </section>

          {/* Greenhouse */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Thermometer size={18} className="text-emerald-600" />
              Heated Greenhouse Badge
            </h2>
            <div className="text-sm text-stone-600 space-y-3">
              <p>
                The &ldquo;Heated Greenhouse Likely&rdquo; badge appears when warm-season crops
                (e.g., tomatoes, peppers, cucumbers) are viewed in cold-climate regions during
                winter months. Research shows that greenhouse heating can significantly increase
                emissions:
              </p>
              <blockquote className="border-l-2 border-emerald-300 pl-3 text-xs italic text-stone-500">
                Theurl et al. (2014) found that heated greenhouse production of tomatoes in
                Austria resulted in 2-3x higher GHG emissions compared to imports from
                Spain during winter months. Similarly, Hospido et al. (2009) demonstrated
                that transport emissions from warmer regions can be lower than the heating
                energy required for local greenhouse production.
              </blockquote>
              <p className="text-xs text-stone-400">
                This badge is a heuristic based on crop type, climate zone, and month.
                It does not apply to unheated greenhouses, tunnels, or mild-climate regions.
              </p>
            </div>
          </section>

          {/* Data Quality */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Database size={18} className="text-emerald-600" />
              Data Quality Badges
            </h2>
            <div className="text-sm text-stone-600 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="font-medium text-emerald-700 mb-1">High Quality</div>
                  <p className="text-xs">Region-specific LCA data (e.g., AGRIBALYSE for EU)</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="font-medium text-amber-700 mb-1">Medium Quality</div>
                  <p className="text-xs">Reputable global average (Poore & Nemecek 2018)</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="font-medium text-stone-500 mb-1">Low Quality</div>
                  <p className="text-xs">Imputed or estimated from similar foods</p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Known Limitations
            </h2>
            <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-5 text-sm text-stone-600 space-y-2">
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li>
                  <strong>Global averages mask local variability.</strong> Emissions for the same
                  food can vary 10-50x between producers. Our ranges capture some but not all of this.
                </li>
                <li>
                  <strong>Seasonality is approximate.</strong> Actual growing seasons depend on
                  specific microclimates, varieties, and farming practices.
                </li>
                <li>
                  <strong>Water-risk is regional, not crop-specific.</strong> A region&apos;s water
                  stress doesn&apos;t tell you the specific water footprint of a crop.
                </li>
                <li>
                  <strong>Transport is simplified.</strong> We don&apos;t model specific supply chains
                  or distinguish between road, rail, ship, and air freight.
                </li>
                <li>
                  <strong>Data currency.</strong> Primary data is from 2018 meta-analysis.
                  Farming practices and emissions may have changed since then.
                </li>
                <li>
                  <strong>System boundaries.</strong> LCA data typically covers farm-to-retail.
                  Consumer transport, cooking, and food waste are not included.
                </li>
                <li>
                  <strong>Not a complete picture.</strong> Environmental impact includes
                  biodiversity, land use, pollution, and social factors that are not captured
                  by CO₂e alone.
                </li>
              </ul>
            </div>
          </section>

          {/* Factor selection */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-3">
              Factor Selection Logic
            </h2>
            <div className="text-sm text-stone-600 space-y-2">
              <p>
                When displaying emission factors, we follow this priority:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Region-specific factor if available for user&apos;s country/region</li>
                <li>Continent-level factor if available</li>
                <li>Global average (Poore & Nemecek 2018)</li>
              </ol>
              <p className="text-xs text-stone-400 mt-2">
                System modifiers (e.g., heated greenhouse vs. open field) are only applied
                when supported by data. Otherwise, the system is shown as &ldquo;unknown.&rdquo;
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
