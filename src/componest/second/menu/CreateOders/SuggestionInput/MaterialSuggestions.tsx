import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";

interface Props {
  materialName: string;
  onSelect: (data: any) => void;
  suggestionType?: 'type' | 'name';
  selectedMaterialType?: string;
  showSuggestions?: boolean;
}

const MaterialSuggestions: React.FC<Props> = ({
  materialName,
  onSelect,
  suggestionType = 'type',
  selectedMaterialType = '',
  showSuggestions = false
}) => {
  // ✅ OPTIMIZED: Use cached data from orderFormData
  const orderFormData = useSelector((state: RootState) => state.orderFormData);
  const materialTypes = orderFormData?.data?.materialTypes || [];
  const materials = orderFormData?.data?.materials || [];
  const loading = orderFormData?.loading || false;
  const error = orderFormData?.error;

  // Build material categories with nested materials
  const materialCategories = useMemo(() => {
    return materialTypes.map((type: any) => ({
      ...type,
      materials: materials.filter((m: any) =>
        m.materialType?._id === type._id || m.materialType === type._id
      )
    }));
  }, [materialTypes, materials]);

  const filtered = useMemo(() => {
    if (!materialName.trim()) return [];
    
    const searchTerm = materialName.toLowerCase();
    
    if (suggestionType === 'type') {
      // Show only material types/categories
      return materialCategories
        .filter((cat: any) =>
          (cat.materialTypeName || "").toLowerCase().includes(searchTerm)
        )
        .slice(0, 5);
    } else {
      // Show only material names from selected type
      if (!selectedMaterialType) return [];
      
      const selectedCategory = materialCategories.find((cat: any) =>
        cat.materialTypeName === selectedMaterialType
      );
      
      if (selectedCategory && Array.isArray(selectedCategory.materials)) {
        return selectedCategory.materials
          .filter((material: any) =>
            (material.materialName || "").toLowerCase().includes(searchTerm)
          )
          .slice(0, 5);
      }
      return [];
    }
  }, [materialName, materialCategories, suggestionType, selectedMaterialType]);

  // FIXED: Handle material type selection - now includes ID
  const handleTypeClick = (category: any) => {
    console.log('🔧 MaterialSuggestions - Type clicked:', category);
    
    onSelect({
      _id: category._id, 
      materialTypeId: category._id, // ✅ Also provide as materialTypeId for consistency
      materialTypeName: category.materialTypeName,
      branchId: category.branchId,
      productId: category.productId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      materials: category.materials, // Include materials array if needed
      materialName: "" , 
    });
  };

  // FIXED: Handle material name selection - now includes all necessary IDs
  const handleNameClick = (material: any) => {
    console.log('🔧 MaterialSuggestions - Material clicked:', material);
    
    // Find the parent category to get the type name
    const parentCategory = materialCategories.find((cat: any) =>
      cat.materialTypeName === selectedMaterialType
    );
    
    onSelect({
      _id: material._id, // ✅ Pass the material ID
      materialId: material._id, // ✅ Also provide as materialId for consistency
      materialName: material.materialName,
      materialType: material.materialType, // ✅ This is the type ID reference
      materialTypeId: material.materialType, // ✅ Also provide as materialTypeId
      materialTypeName: selectedMaterialType, // ✅ Pass the type name
      materialMol: material.materialMol,
      branchId: material.branchId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
      // Include parent category info if available
      category: parentCategory ? {
        _id: parentCategory._id,
        materialTypeName: parentCategory.materialTypeName
      } : null
    });
  };

  if (loading) return <div className="suggestion-loading">Loading...</div>;
  if (error) return <div className="suggestion-error">Error loading categories</div>;
  if (filtered.length === 0 || !showSuggestions) return null;

  return (
    <ul className="suggestion-list">
      {suggestionType === 'type' ? (
        // Show material types
        filtered.map((cat: any, idx: number) => (
          <li
            key={cat._id || idx}
            className="suggestionItem"
            onClick={() => handleTypeClick(cat)}
          >
            📦 <strong>{cat.materialTypeName}</strong>
          </li>
        ))
      ) : (
        // Show material names
        filtered.map((material: any, idx: number) => (
          <li
            key={material._id || idx}
            className="suggestionItem"
            onClick={() => handleNameClick(material)}
          >
            📄 <strong>{material.materialName}</strong>
          </li>
        ))
      )}
    </ul>
  );
};

export default MaterialSuggestions;