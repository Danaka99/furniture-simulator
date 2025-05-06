export interface Room {
    width: number;
    length: number;
    height: number;
    shape: 'rectangular' | 'L-shaped' | 'custom';
    colorScheme: {
        walls: string;
        floor: string;
        ceiling: string;
    };
}

export interface DesignElement {
    id: string;
    type: 'chair' | 'table' | 'sofa' | 'bed' | 'cabinet' | 'lamp';
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    color: string;
    shade: number; // 0-1 value for shading
}

export interface Design {
    id: string;
    name: string;
    room: Room;
    elements: DesignElement[];
    createdAt: Date;
    updatedAt: Date;
} 