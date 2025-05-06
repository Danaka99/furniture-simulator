export interface FurnitureTemplate {
    id: string;
    category: string;
    name: string;
    thumbnail: string;
    modelPath: string;
    price: number;
    defaultDimensions: {
        width: number;
        length: number;
        height: number;
    };
    minDimensions?: {
        width: number;
        length: number;
        height: number;
    };
    maxDimensions?: {
        width: number;
        length: number;
        height: number;
    };
}

export const FURNITURE_CATALOG: FurnitureTemplate[] = [
    {
        id: "sofa-1",
        name: "Modern Sofa",
        category: "Sofa",
        modelPath: "/models/sofa.glb",
        defaultDimensions: { width: 2.2, length: 0.85, height: 0.7 },
        minDimensions: { width: 1.8, length: 0.8, height: 0.7 },
        maxDimensions: { width: 3, length: 1, height: 0.8 },
        price: 999,
        thumbnail: "🛋️"
    },
    {
        id: "table-1",
        name: "Coffee Table",
        category: "Table",
        modelPath: "/models/table.glb",
        defaultDimensions: { width: 1.2, length: 0.6, height: 0.45 },
        minDimensions: { width: 0.8, length: 0.4, height: 0.45 },
        maxDimensions: { width: 1.5, length: 0.8, height: 0.45 },
        price: 299,
        thumbnail: "🪑"
    },
    {
        id: "chair-1",
        name: "Velvet Chair",
        category: "Chair",
        modelPath: "/models/chair.glb",
        defaultDimensions: { width: 0.5, length: 0.5, height: 0.9 },
        minDimensions: { width: 0.45, length: 0.45, height: 0.85 },
        maxDimensions: { width: 0.6, length: 0.6, height: 1 },
        price: 199,
        thumbnail: "🪑"
    },
    {
        id: "bed-1",
        name: "Modern Bed",
        category: "Bed",
        modelPath: "/models/bed.glb",
        defaultDimensions: { width: 1.8, length: 2.2, height: 1.2 },
        minDimensions: { width: 1.6, length: 2.0, height: 1.0 },
        maxDimensions: { width: 2.0, length: 2.4, height: 1.4 },
        price: 1299,
        thumbnail: "🛏️"
    },
    {
        id: "cabinet-1",
        name: "Storage Cabinet",
        category: "Storage",
        modelPath: "/models/cabinet.glb",
        defaultDimensions: { width: 1.2, length: 0.5, height: 1.8 },
        minDimensions: { width: 1.0, length: 0.4, height: 1.6 },
        maxDimensions: { width: 1.5, length: 0.6, height: 2.0 },
        price: 799,
        thumbnail: "🗄️"
    }
]; 