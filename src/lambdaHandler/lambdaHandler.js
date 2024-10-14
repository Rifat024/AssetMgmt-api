import middy from 'middy';
import {
  authenticator,
  authorizer,
  handleErrorMiddleware,
} from '../commons/middlewares/middlewares';
import { createDiscovery, deleteDiscovery, getDiscoveryByCompany, getDiscoveryDetails, updateDiscovery } from '../handler/discovery/discoveryMgmt';
import { createTemplate, deleteTemplate, getTemplateByCompany, getTemplateDetails, updateTemplate } from '../handler/template/templateMgmt';
import { createAssetType, deleteAssetType, getAssetTypeByCompany, getAssetTypeDetails, updateAssetType } from '../handler/asset/assetTypeMgmt';
import { createNormalization, deleteNormalization, getNormalizationByCompany, getNormalizationDetails, updateNormalization } from '../handler/discovery/normalizationMgmt';
import { createAsset, deleteAsset, getAssetByCompany, getAssetDetails, updateAsset } from '../handler/asset/assetMgmt';

export const createDiscoveryLambda = middy(createDiscovery)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const updateDiscoveryLambda = middy(updateDiscovery)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const getDiscoveryByCompanyLambda = middy(getDiscoveryByCompany)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());


export const getDiscoveryDetailsLambda = middy(getDiscoveryDetails)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const deleteDiscoveryLambda = middy(deleteDiscovery)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const createNormalizationLambda = middy(createNormalization)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const updateNormalizationLambda = middy(updateNormalization)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const getNormalizationByCompanyLambda = middy(getNormalizationByCompany)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());


export const getNormalizationDetailsLambda = middy(getNormalizationDetails)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const deleteNormalizationLambda = middy(deleteNormalization)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const createTemplateLambda = middy(createTemplate)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const updateTemplateLambda = middy(updateTemplate)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const getTemplateByCompanyLambda = middy(getTemplateByCompany)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());


export const getTemplateDetailsLambda = middy(getTemplateDetails)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const deleteTemplateLambda = middy(deleteTemplate)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const createAssetTypeLambda = middy(createAssetType)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const updateAssetTypeLambda = middy(updateAssetType)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const getAssetTypeByCompanyLambda = middy(getAssetTypeByCompany)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());


export const getAssetTypeDetailsLambda = middy(getAssetTypeDetails)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const deleteAssetTypeLambda = middy(deleteAssetType)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const createAssetLambda = middy(createAsset)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const updateAssetLambda = middy(updateAsset)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const getAssetByCompanyLambda = middy(getAssetByCompany)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());


export const getAssetDetailsLambda = middy(getAssetDetails)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());

export const deleteTypeLambda = middy(deleteAsset)
  .use(authenticator())
  // .use(authorizer({}))
  .use(handleErrorMiddleware());
