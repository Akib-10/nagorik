import { useState } from 'react';
import { useCarbonFootprint } from 'react-carbon-footprint';
const CarbonFootprintDisplay = () => {
    const [gCO2, bytesTransferred] = useCarbonFootprint();
    const [open, setOpen] = useState(true); // true = expanded, false = hidden (small button)

    // Hidden state: only a small button is shown
    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                title="Show Network Carbon Footprint"
                style={{
                    position: 'fixed', bottom: 10, right: 10,
                    background: 'rgba(255,255,255,0.8)', padding: '6px 10px',
                    borderRadius: '5px', zIndex: 1000, cursor: 'pointer',
                    border: '1px solid #ccc'
                }}
            >
                CO₂ Emission
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: 10, right: 10,
            background: 'rgba(255,255,255,0.8)', padding: '10px',
            borderRadius: '5px', zIndex: 1000
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h3>Network Carbon Footprint</h3>
                <button
                    onClick={() => setOpen(false)}
                    title="Hide"
                    style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2em' }}
                >
                    ✕
                </button>
            </div>
            <p>Bytes Transferred: {bytesTransferred} bytes</p>
            <p>CO2 Emissions: {gCO2.toFixed(2)} grams CO2eq</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
                (Estimates based on network data transfer during this session)
            </p>
        </div>
    );
}

export default CarbonFootprintDisplay;