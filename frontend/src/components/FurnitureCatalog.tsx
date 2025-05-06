import React, { useState } from "react";
import "./FurnitureCatalog.css";

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface FurnitureCatalogProps {
  onSelectFurniture?: (furniture: FurnitureItem) => void;
}

const SAMPLE_FURNITURE: FurnitureItem[] = [
  {
    id: "modern-sofa",
    name: "Modern Sofa",
    category: "Sofas",
    price: 999.0,
    image: "/furniture/sofa.png",
  },
  {
    id: "coffee-table",
    name: "Coffee Table",
    category: "Tables",
    price: 299.0,
    image: "/furniture/table.png",
  },
  {
    id: "velvet-chair",
    name: "Velvet Chair",
    category: "Chairs",
    price: 199.0,
    image: "/furniture/chair.png",
  },
];

const CATEGORIES = ["All", "Tables", "Chairs", "Sofas"];

const FurnitureCatalog: React.FC<FurnitureCatalogProps> = ({
  onSelectFurniture,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFurniture = SAMPLE_FURNITURE.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  return (
    <div className="furniture-catalog">
      <h2 className="catalog-title">Furniture Catalog</h2>
      <div className="category-filter">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-chip ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="furniture-grid">
        {filteredFurniture.map((item) => (
          <div
            key={item.id}
            className="furniture-card"
            onClick={() => onSelectFurniture?.(item)}
          >
            <img src={item.image} alt={item.name} className="furniture-image" />
            <div className="furniture-info">
              <div className="furniture-name">{item.name}</div>
              <div className="furniture-price">${item.price.toFixed(2)}</div>
            </div>
            <button className="add-to-cart-button">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurnitureCatalog;
