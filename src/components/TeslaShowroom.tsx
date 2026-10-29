import React, { useState } from 'react';
import { 
  Car, 
  Zap, 
  Gauge, 
  BatteryCharging, 
  ShieldCheck, 
  SlidersHorizontal, 
  ExternalLink, 
  ChevronRight, 
  X, 
  Check,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { TESLA_FLEET, CURRENCY_RATES } from '../data/teslaData';
import { TeslaVehicle } from '../types';

export const TeslaShowroom: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<TeslaVehicle | null>(null);
  const [comparisonList, setComparisonList] = useState<string[]>(['model-s-plaid', 'cybertruck-cyberbeast']);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  
  // Enquiry Form State
  const [enquiryVehicle, setEnquiryVehicle] = useState<TeslaVehicle | null>(null);
  const [enquiryName, setEnquiryName] = useState<string>('');
  const [enquiryEmail, setEnquiryEmail] = useState<string>('');
  const [enquiryPhone, setEnquiryPhone] = useState<string>('');
  const [enquiryNotes, setEnquiryNotes] = useState<string>('');
  const [enquirySubmitted, setEnquirySubmitted] = useState<boolean>(false);

  const rateInfo = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES['USD'];

  const formatPrice = (priceUSD: number) => {
    const converted = Math.round(priceUSD * rateInfo.rate);
    return `${rateInfo.symbol}${converted.toLocaleString()}`;
  };

  const filteredFleet = categoryFilter === 'All'
    ? TESLA_FLEET
    : TESLA_FLEET.filter(v => v.category === categoryFilter);

  const toggleCompare = (id: string) => {
    if (comparisonList.includes(id)) {
      setComparisonList(prev => prev.filter(item => item !== id));
    } else {
      if (comparisonList.length >= 3) {
        setComparisonList(prev => [...prev.slice(1), id]);
      } else {
        setComparisonList(prev => [...prev, id]);
      }
    }
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitted(true);
    setTimeout(() => {
      setEnquirySubmitted(false);
      setEnquiryVehicle(null);
      setEnquiryName('');
      setEnquiryEmail('');
      setEnquiryPhone('');
      setEnquiryNotes('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
            <Car className="w-4 h-4 text-white" />
            <span>Electric Propulsion & Autonomous Fleet</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Tesla Showroom & Fleet
          </h1>
          <p className="mt-2 text-neutral-400 text-sm max-w-2xl">
            Explore cutting-edge high-performance electric vehicles. All vehicle metrics, acceleration ratings, and estimated ranges are based on manufacturer specifications.
          </p>
        </div>

        {/* Currency Switcher & Compare Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs">
            <span className="text-neutral-500 font-mono px-2">Currency:</span>
            {Object.keys(CURRENCY_RATES).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${
                  selectedCurrency === curr
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowComparison(true)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare ({comparisonList.length})</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {['All', 'Sedan', 'SUV', 'Truck', 'Supercar'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-900'
            }`}
          >
            {cat === 'All' ? 'Complete Fleet' : cat}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredFleet.map((vehicle) => {
          const isComparing = comparisonList.includes(vehicle.id);

          return (
            <div
              key={vehicle.id}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Vehicle Image Banner with hover sheen */}
                <div className="relative aspect-video bg-neutral-900 overflow-hidden cursor-pointer" onClick={() => setSelectedVehicle(vehicle)}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-neutral-800">
                    {vehicle.category}
                  </div>

                  <div className="absolute bottom-3 right-3 text-right">
                    <span className="text-[11px] text-neutral-400 uppercase font-mono block">Est. Base Price</span>
                    <span className="text-xl font-bold font-mono text-white">{formatPrice(vehicle.priceUSD)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                    {vehicle.tagline}
                  </p>

                  {/* Core Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 py-4 my-4 border-y border-neutral-900 text-center">
                    <div>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">
                        {vehicle.acceleration0to60}s
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">0-60 MPH</div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">
                        {vehicle.rangeMiles} mi
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">EST. RANGE</div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">
                        {vehicle.topSpeedMph} mph
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">TOP SPEED</div>
                    </div>
                  </div>

                  {/* Charging & Drivetrain */}
                  <div className="space-y-2 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      <span className="truncate">{vehicle.driveTrain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BatteryCharging className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      <span className="truncate">{vehicle.superchargingSpeed}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 sm:p-6 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    View Specs
                  </button>
                  <button
                    onClick={() => setEnquiryVehicle(vehicle)}
                    className="py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    Enquire
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400 border-t border-neutral-900">
                  <button
                    onClick={() => toggleCompare(vehicle.id)}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      isComparing ? 'bg-white border-white text-black' : 'border-neutral-600'
                    }`}>
                      {isComparing && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span>Compare Model</span>
                  </button>

                  <a
                    href={vehicle.officialTeslaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Official Tesla</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Disclaimers */}
      <div className="mt-12 p-4 bg-neutral-950 border border-neutral-900 rounded-xl text-xs text-neutral-500 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div>
          <strong>Disclaimer & Verified Purchasing:</strong> All pricing estimates, currency conversions, and vehicle specifications displayed are for informational and educational purposes. Vehicle options, taxes, incentives, and delivery fees vary by jurisdiction. Visit official Tesla dealerships or <a href="https://www.tesla.com" target="_blank" rel="noopener noreferrer" className="text-neutral-300 underline">tesla.com</a> to place official orders or schedule factory delivery.
        </div>
      </div>

      {/* MODAL 1: VEHICLE SPECIFICATIONS DETAIL */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">{selectedVehicle.category}</span>
                <h2 className="text-2xl font-black uppercase text-white mt-0.5">{selectedVehicle.name}</h2>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-neutral-900 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block">0-60 Time</span>
                <span className="text-xl font-bold font-mono text-white">{selectedVehicle.acceleration0to60}s</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block">Max Range</span>
                <span className="text-xl font-bold font-mono text-white">{selectedVehicle.rangeMiles} mi</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block">Peak Power</span>
                <span className="text-xl font-bold font-mono text-white">{selectedVehicle.peakPowerHp} hp</span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block">Top Speed</span>
                <span className="text-xl font-bold font-mono text-white">{selectedVehicle.topSpeedMph} mph</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-900 pt-4">
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-400">Powertrain</span>
                <span className="text-white font-medium">{selectedVehicle.specs.powertrain}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-400">Curb Weight</span>
                <span className="text-white font-mono">{selectedVehicle.specs.weightLbs.toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-400">Cargo Volume</span>
                <span className="text-white font-mono">{selectedVehicle.specs.cargoCuFt} cu ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-400">Aerodynamic Drag</span>
                <span className="text-white font-mono">{selectedVehicle.specs.dragCoefficient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-900">
                <span className="text-neutral-400">Supercharging</span>
                <span className="text-white">{selectedVehicle.superchargingSpeed}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={selectedVehicle.officialTeslaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase rounded-xl hover:bg-neutral-200 text-center transition-colors"
              >
                Configure on Official Tesla.com
              </a>
              <button
                onClick={() => {
                  setEnquiryVehicle(selectedVehicle);
                  setSelectedVehicle(null);
                }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase rounded-xl border border-neutral-800"
              >
                Enquire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VEHICLE COMPARISON TOOL */}
      {showComparison && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div>
                <h2 className="text-xl font-black uppercase text-white">Model Comparison Matrix</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Select up to 3 vehicles to compare specifications side-by-side</p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {comparisonList.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No vehicles selected. Check "Compare Model" on vehicle cards to inspect them side-by-side.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="py-3 px-3 text-neutral-500 uppercase font-mono">Specification</th>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <th key={id} className="py-3 px-3 font-bold text-white uppercase">
                            <div className="flex items-center justify-between gap-2">
                              <span>{v?.name}</span>
                              <button
                                onClick={() => toggleCompare(id)}
                                className="text-neutral-500 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Est. Price ({selectedCurrency})</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono font-bold text-white">
                            {v ? formatPrice(v.priceUSD) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">0-60 MPH Acceleration</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono font-bold text-white">
                            {v?.acceleration0to60} sec
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Estimated Range</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono text-white">
                            {v?.rangeMiles} miles
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Top Speed</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono text-white">
                            {v?.topSpeedMph} mph
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Peak Power</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono text-white">
                            {v?.peakPowerHp} hp
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Seating Capacity</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 text-neutral-300">
                            {v?.seating} Adults
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-400">Aerodynamics</td>
                      {comparisonList.map(id => {
                        const v = TESLA_FLEET.find(item => item.id === id);
                        return (
                          <td key={id} className="py-2.5 px-3 font-mono text-neutral-300">
                            {v?.specs.dragCoefficient}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: VEHICLE ENQUIRY FORM */}
      {enquiryVehicle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase">Consultation Enquiry</span>
                <h3 className="text-lg font-bold text-white uppercase">{enquiryVehicle.name}</h3>
              </div>
              <button
                onClick={() => setEnquiryVehicle(null)}
                className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enquirySubmitted ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white uppercase">Enquiry Dispatched</h4>
                <p className="text-xs text-neutral-400">
                  Thank you! An informational overview for the {enquiryVehicle.name} has been routed. We will also redirect you to official Tesla dealership resources.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Cosmonaut Explorer"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="explorer@spacemail.com"
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase mb-1">Preferences or Questions</label>
                  <textarea
                    rows={3}
                    placeholder="Inquiring about delivery window, home Supercharger wall connector, or FSD Supervised capability..."
                    value={enquiryNotes}
                    onChange={(e) => setEnquiryNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black font-extrabold uppercase rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Submit Vehicle Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
