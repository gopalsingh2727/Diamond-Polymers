// print.tsx
import React from "react";
import "./print.css"; // We'll create this for print-specific styles
type Product = {
  name: string;
  code: string;
  price: string;
};

type MixMaterial = {
  name: string;
  type: string;
  weight: number;
  percentage: number | string;
};

type Step = {
  MachineType: string;
  MachineName: string;
  SizeX: string;
  SizeY: string;
  SizeZ: string;
  OptereName: string;
};

type StepEntry = {
  stepname: string;
  steps: Step[];
};

type SavedMixingData = {
  data: MixMaterial[];
  totalWeight: string;
  loss: string;
};

type PrintProps = {
  orderId: string;
  date: string;
  customerData: {
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
  selectedOption: string;
  materialData: {
    width: string;
    height: string;
    gauge: string;
    dimensionUnit: string;
    gaugeUnit: string;
    materialType: string;
    materialName: string;
    totalWeight: string;
    onePieceWeight: string;
    totalPieces: string;
    mixing: string;
    savedMixing: SavedMixingData | null;
    printWork: string;
    savedStep: StepEntry | null;
    bottomGusset?: string;
    flap?: string;
    airHole?: string;
  };
  products: Product[];
  note: string;
};

const PrintOrder: React.FC<PrintProps> = ({
  orderId,
  date,
  customerData,
  selectedOption,
  materialData,
  products,
  note
}) => {
  return (
    <div className="print-container">
      {/* Header Section */}
      <header className="print-header">
        <h1>Order Details</h1>
        <div className="order-meta">
          <div><strong>Order ID:</strong> {orderId}</div>
          <div><strong>Date:</strong> {date}</div>
        </div>
      </header>

      {/* Customer Information */}
      <section className="customer-section">
        <h2>Customer Information</h2>
        <div className="customer-details">
          <div><strong>Name:</strong> {customerData.name}</div>
          <div><strong>Address:</strong> {customerData.address}</div>
          <div><strong>Phone:</strong> {customerData.phone}</div>
          <div><strong>WhatsApp:</strong> {customerData.whatsapp}</div>
          <div><strong>Email:</strong> {customerData.email}</div>
        </div>
      </section>

      {/* Main Content - Material or Product */}
      {selectedOption === "material" ? (
        <MaterialSection materialData={materialData} />
      ) : (
        <ProductSection products={products} />
      )}

      {/* Notes */}
      {note && (
        <section className="notes-section">
          <h2>Notes</h2>
          <p>{note}</p>
        </section>
      )}

      {/* Footer */}
      <footer className="print-footer">
        <div className="signature">
          <div>_________________________</div>
          <div>Customer Signature</div>
        </div>
        <div className="signature">
          <div>_________________________</div>
          <div>Company Representative</div>
        </div>
      </footer>
    </div>
  );
};

// Material Section Subcomponent
const MaterialSection: React.FC<{ materialData: PrintProps['materialData'] }> = ({ materialData }) => (
  <section className="material-section">
    <h2>Material Details</h2>
    
    {/* Size Information */}
    <div className="size-info">
      <h3>Size Specifications</h3>
      <div className="size-grid">
        <div><strong>Width:</strong> {materialData.width} {materialData.dimensionUnit}</div>
        <div><strong>Height:</strong> {materialData.height} {materialData.dimensionUnit}</div>
        <div><strong>Thickness:</strong> {materialData.gauge} {materialData.gaugeUnit}</div>
        {materialData.bottomGusset && (
          <div><strong>Bottom Gusset:</strong> {materialData.bottomGusset} {materialData.dimensionUnit}</div>
        )}
        {materialData.flap && (
          <div><strong>Flap:</strong> {materialData.flap} {materialData.dimensionUnit}</div>
        )}
        {materialData.airHole && (
          <div><strong>Air Hole:</strong> {materialData.airHole} {materialData.dimensionUnit}</div>
        )}
      </div>
    </div>

    {/* Material Properties */}
    <div className="material-properties">
      <h3>Material Properties</h3>
      <div className="property-grid">
        <div><strong>Material Type:</strong> {materialData.materialType}</div>
        <div><strong>Material Name:</strong> {materialData.materialName}</div>
        <div><strong>Total Weight:</strong> {materialData.totalWeight} kg</div>
        <div><strong>One Piece Weight:</strong> {materialData.onePieceWeight} kg</div>
        <div><strong>Total Pieces:</strong> {materialData.totalPieces}</div>
        <div><strong>Mixing:</strong> {materialData.mixing === "yes" ? "Yes" : "No"}</div>
      </div>
    </div>

    {/* Mixing Details */}
    {materialData.savedMixing && (
      <div className="mixing-details">
        <h3>Mixing Composition</h3>
        <table className="mixing-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Type</th>
              <th>Weight (kg)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {materialData.savedMixing.data.map((mat, index) => (
              <tr key={index}>
                <td>{mat.name}</td>
                <td>{mat.type}</td>
                <td>{mat.weight}</td>
                <td>{typeof mat.percentage === 'number' 
                      ? mat.percentage.toFixed(2) 
                      : mat.percentage}%</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={2}><strong>Total Loss</strong></td>
              <td colSpan={2}><strong>{materialData.savedMixing.loss} kg</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    )}

    {/* Print Work */}
    <div className="print-work">
      <h3>Print Work</h3>
      <p>{materialData.printWork === "yes" ? "Required" : "Not Required"}</p>
    </div>

    {/* Manufacturing Steps */}
    {materialData.savedStep && (
      <div className="steps-section">
        <h3>Manufacturing Steps: {materialData.savedStep.stepname}</h3>
        <table className="steps-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Machine Type</th>
              <th>Machine Name</th>
              <th>Size X</th>
              <th>Size Y</th>
              <th>Size Z</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            {materialData.savedStep.steps.map((step, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{step.MachineType}</td>
                <td>{step.MachineName}</td>
                <td>{step.SizeX}</td>
                <td>{step.SizeY}</td>
                <td>{step.SizeZ}</td>
                <td>{step.OptereName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

// Product Section Subcomponent
const ProductSection: React.FC<{ products: Product[] }> = ({ products }) => (
  <section className="product-section">
    <h2>Product Details</h2>
    <table className="product-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Product Code</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={index}>
            <td>{product.name}</td>
            <td>{product.code}</td>
            <td>{product.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export default PrintOrder;