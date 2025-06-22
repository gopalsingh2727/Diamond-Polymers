// import { useState } from "react";







// type MixingRowProps = {
//   mat: MixMaterial;
//   index: number;
//   onMixChange: (index: number, key: keyof MixMaterial, value: string | number) => void;
//   onRemove: (index: number) => void;
//   isFirst: boolean;
// };

// const MixingRow = ({ mat, index, onMixChange, onRemove, isFirst }: MixingRowProps) => {
//   const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
//   const [showNameSuggestions, setShowNameSuggestions] = useState(false);

//   return (
//     <div className="popupitemall">
//       <div style={{ position: 'relative' }}>
//         <input
//           type="text"
//           value={mat.name}
//           onChange={(e) => onMixChange(index, "name", e.target.value)}
//           placeholder="Material Name"
//           readOnly={isFirst}
//           onFocus={() => setShowNameSuggestions(true)}
//           onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
//         />
//         <MaterialSuggestions
//           materialName={mat.name}
//           onSelect={(data) => {
//             onMixChange(index, "name", data.materialName);
//             onMixChange(index, "type", data.materialTypeName);
//             setShowNameSuggestions(false);
//           }}
//           suggestionType="name"
//           selectedMaterialType={mat.type}
//           showSuggestions={showNameSuggestions && mat.name.length > 0 && mat.type.length > 0}
//         />
//       </div>
      
//       <div style={{ position: 'relative' }}>
//         <input
//           type="text"
//           value={mat.type}
//           onChange={(e) => onMixChange(index, "type", e.target.value)}
//           placeholder="Material Type"
//           readOnly={isFirst}
//           onFocus={() => setShowTypeSuggestions(true)}
//           onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
//         />
//         <MaterialSuggestions
//           materialName={mat.type}
//           onSelect={(data) => {
//             onMixChange(index, "type", data.materialTypeName);
//             setShowTypeSuggestions(false);
//           }}
//           suggestionType="type"
//           showSuggestions={showTypeSuggestions && mat.type.length > 0}
//         />
//       </div>
      
//       <input
//         type="number"
//         value={mat.weight}
//         onChange={(e) => onMixChange(index, "weight", parseFloat(e.target.value) || 0)}
//         placeholder="Weight"
//       />
//       <input
//         type="number"
//         value={mat.percentage}
//         onChange={(e) => onMixChange(index, "percentage", parseFloat(e.target.value) || 0)}
//         placeholder="Percentage"
//       />
      
//       {!isFirst && (
//         <button
//           onClick={() => onRemove(index)}
//           style={{
//             background: 'none',
//             border: 'none',
//             fontSize: '18px',
//             cursor: 'pointer',
//             color: '#ff4444',
//             padding: '5px'
//           }}
//           title="Remove Row"
//         >
//           ✕
//         </button>
//       )}
//     </div>
//   );
// };



// export default  MixingRow