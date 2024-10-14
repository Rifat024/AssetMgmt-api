export interface getDiscoveryResponse {
    _id: string,
    createdAt: string,
    updatedAt: string,
    assetCode: string;
    assetName: string;
    assetType: string;
    serialNumber: string;
    modelNumber: string;
    purchaseDate: string;
    warrantyExpDate: string;
    location: string;
    department: string;
    status: 'ACTIVE' | 'IN_ACTIVE';
    modelCategory?: string;
    configurationItem?: string;
    quantity?: number;
    state?: string;
    assignedTo?: string;
    assignedDate?: string;
    managedBy?: string;
    ownedBy?: string;
    assetClass?: string;
    company?: string;
    installedDate?: string;
}

export interface getDiscoveryListResponse {
    total: number,
    items: Array<getDiscoveryResponse>
}

export interface getTemplateResponse {
    _id: string,
    createdAt: string,
    updatedAt: string,
    type: string,
    name: string,
    tempData: {
    },
    status: 'ACTIVE | IN_ACTIVE'
}

export interface getTemplateListResponse {
    total: number,
    items: Array<getTemplateResponse>
}

export interface getAssetTypeResponse {
    _id?: string;
    companyId: string;
    createdBy: string;
    name?: string;
    family?: string;
    description?: string;
    tags?: any[];
    properties?: Array<{}>;
    templates?: Array<{}>;
    consumable?: boolean;
    independently?: boolean;
    parentRequired?: boolean;
    expiryDate?: string;
    status: 'ACTIVE' | 'IN_ACTIVE';
    children?: Array<{}>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface getAssetTypeListResponse {
    total: number,
    items: Array<getAssetTypeResponse>
}

export interface getAssetResponse {
    _id?: string;
    companyId: string;
    createdBy: string;
    name?: string;
    assetDatas: Array<{
        template: string,
        templateData: {}
    }>
    createdAt?: Date;
    updatedAt?: Date;
}

export interface getAssetListResponse {
    total: number,
    items: Array<getAssetResponse>
}