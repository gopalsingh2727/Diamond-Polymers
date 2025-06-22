import React, { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/rootReducer";
import { getAllMaterialTypesWithMaterials } from "../../../../redux/create/Materials/MaterialsCategories/MaterialsCategoriesActions";

interface Props {
  materialName: string;
  onSelect: (data: any) => void;
  suggestionType?: 'type' | 'name'; 
  selectedMaterialType?: string;
  showSuggestions?: boolean; // New prop to control visibility
}

const MaterialSuggestions: React.FC<Props> = ({ 
  materialName, 
  onSelect, 
  suggestionType = 'type',
  selectedMaterialType = '',
  showSuggestions = false
}) => {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  
  const materialCategoryState = useSelector((state: RootState) => state.materialCategories);
  const materialCategories = materialCategoryState.categories || [];
  const loading = materialCategoryState.loading || false;
  const error = materialCategoryState.error;
   console.log(materialCategoryState , "this call ");
   
  useEffect(() => {
    if (!hasFetched.current && !loading && materialCategories.length === 0) {
      dispatch(getAllMaterialTypesWithMaterials() as any);
      hasFetched.current = true;
    }
  }, [dispatch, loading, materialCategories.length]);

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

  const handleTypeClick = (category: any) => {
    onSelect({
      materialTypeName: category.materialTypeName,
      materialName: "",
    });
  };

  const handleNameClick = (material: any) => {
    onSelect({
      materialTypeName: selectedMaterialType,
      materialName: material.materialName,
      materialMol: material.materialMol
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