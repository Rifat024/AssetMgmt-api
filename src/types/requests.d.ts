export interface createDiscoveryRequest {
  items: Array<{
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
  }>
}

export interface updateDiscoveryRequest {
  assetName: string,
  assetType: string,
  serialNumber: string,
  modelNumber: string,
  purchaseDate: string,
  warrantyExpDate: string,
  location: string,
  department: string,
  status: 'ACTIVE | IN_ACTIVE'
}
export interface createTemplateRequest {
  type: 'LOCATION_TEMP | WARRANTY_TEMP | MAINTAINANCE_TEMP | LEASE_TEMP | PURCHASE_TEMP | RENT_TEMP | FAMILY_TEMP',
  name: string,
  tempData: {
  },
  status: 'ACTIVE | IN_ACTIVE'
}

export interface createAssetTypeRequest {
  name?: string;
  family?: string;
  description?: string;
  tags?: any[];
  properties?: any[];
  templates?: any[];
  consumable?: boolean;
  independently?: boolean;
  parentRequired?: boolean;
  expiryDate?: string;
  status: 'ACTIVE' | 'IN_ACTIVE';
  parentId: string,
  nodeParentId: string,
  // children?: any[];
}

export interface createAssetRequest {
  name?: string;
  assetType: string,
  assetDatas: Array<{
    template: string,
    templateData: {}
  }>
}
