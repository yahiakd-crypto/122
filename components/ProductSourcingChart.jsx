import React from 'react';

const productsData = {
  "products": [
    {
      "name": "Drawstring 'Lazy' Cosmetic Bag",
      "category": "Travel Accessories",
      "source": "1688 (Domestic Wholesale)",
      "agent_required": true,
      "drawstring_mechanism_gate": true,
      "saturation_wall": true,
      "title_fluff": true,
      "price_data_available": false,
      "notes": "First 1688 domestic-wholesale source; agent ordering required. Drawstring mechanism is the key product feature. Category is saturated; viral trend. Title contains fluff; no price data."
    }
  ]
};

const InfoCard = ({ title, description, type = 'success' }) => {
  const isWarning = type === 'warning';
  const colorText = isWarning ? '#f59e0b' : '#2b9875';

  const icon = isWarning ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 24, height: 24 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginBottom: 8, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', minHeight: 56, borderRadius: 8, backgroundColor: '#232531', padding: 12, cursor: 'default' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%' }}>
          <div style={{ color: colorText, backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', padding: 6, borderRadius: 8, flexShrink: 0, marginTop: 2 }}>
            {icon}
          </div>
          <div style={{ width: '100%' }}>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: 14, margin: 0 }}>{title}</p>
            <p style={{ color: '#9ca3af', marginTop: 4, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductSourcingChart({ data = productsData }) {
  // Safely extract the products array whether it's directly passed or wrapped in an object
  const productsList = Array.isArray(data) ? data : (data?.products || []);

  if (!productsList || productsList.length === 0) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>No product sourcing data available to display.</div>;
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#1a1c23', minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', borderRadius: 12, border: '1px solid #2a2d3d' }}>
      <div style={{ marginBottom: 32, borderBottom: '1px solid #2a2d3d', paddingBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.025em' }}>Product Sourcing & Compliance</h2>
        <p style={{ marginTop: 4, fontSize: 12, color: '#9ca3af', margin: 0 }}>Evaluation gates and brand flags for incoming products</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%' }}>
        {productsList.map((product, index) => {

          // Format claims gate 11 description
          let claims11 = "";
          if (product.claims_gate_11) {
            const c = product.claims_gate_11;
            const arr = [];
            if (c.fast_charge_wattage_claims) arr.push(`Fast Charge: ${c.fast_charge_wattage_claims}`);
            if (c.apple_watch_mfi_gate) arr.push("Apple Watch MFi");
            if (c.qi_wpc_compliance) arr.push("Qi/WPC");
            if (c.fcc_ce_red_compliance) arr.push("FCC/CE-RED");
            claims11 = arr.join(" • ");
          }

          // Format claims gate 10 description
          let claims10 = "";
          if (product.claims_gate_10) {
            const c = product.claims_gate_10;
            const arr = [];
            if (c.no_anti_cavity_claims) arr.push("No Anti-Cavity");
            if (c.no_whitening_claims) arr.push("No Whitening");
            if (c.no_kills_bacteria_claims) arr.push("No Kills-Bacteria");
            if (c.no_replaces_toothpaste_claims) arr.push("No Replaces-Toothpaste");
            claims10 = arr.join(" • ");
          }

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>{product.name}</h3>
                <span style={{ padding: '4px 8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: 10, fontWeight: 700, borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.category || "General"}
                </span>
              </div>

              <div style={{ paddingLeft: 16, borderLeft: '2px solid #2a2d3d', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <InfoCard
                  title="Source Strategy"
                  description={product.source || product.source_type || "No source provided"}
                />

                {(product.agent_required || product.agent_ordering_required) && (
                  <InfoCard
                    type="warning"
                    title="Agent Required"
                    description="This product requires a sourcing agent for domestic wholesale ordering."
                  />
                )}

                {product.drawstring_mechanism_gate && (
                  <InfoCard
                    title="Product Design Gate"
                    description={`Drawstring mechanism identified: ${typeof product.drawstring_mechanism_gate === 'string' ? product.drawstring_mechanism_gate : "Key feature"}`}
                  />
                )}

                {product.saturation_wall && (
                  <InfoCard
                    type="warning"
                    title="Saturation Wall"
                    description={`Market trend alert: ${typeof product.saturation_wall === 'string' ? product.saturation_wall : "Saturated / Viral category"}`}
                  />
                )}

                {product.title_fluff && (
                  <InfoCard
                    type="warning"
                    title="Title Fluff"
                    description="The product title contains unnecessary marketing fluff."
                  />
                )}

                {(product.brand_flag_7 || product.brand_name) && (
                  <InfoCard
                    type="warning"
                    title="Brand Flag Detected"
                    description={`Potential branded product: ${product.brand_name || "Unknown Brand"}`}
                  />
                )}

                {product.claims_gate_11 && (
                  <InfoCard
                    title="Claims Gate 11 (Electronics)"
                    description={claims11}
                  />
                )}

                {product.claims_gate_10 && (
                  <InfoCard
                    title="Claims Gate 10 (Regulated)"
                    description={claims10}
                  />
                )}

                {product.data_sparse && (
                  <InfoCard
                    type="warning"
                    title="Sparse Data"
                    description="This product has very limited data available for research."
                  />
                )}

                {product.notes && (
                  <InfoCard
                    title="Strategic Notes"
                    description={product.notes}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
