import mongoose from "mongoose";
import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";

const normalizationSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        companyId: {
            type: String,
            required: true,
        },
        assetCode: {
            type: String,
            required: true,
        },
        assetName: {
            type: String,
            required: true,
        },
        assetType: {
            type: String,
            required: true,
        },
        serialNumber: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userProfile",
            required: true,
        },
        discovery: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "discovery",
            required: true,
        },
        modelNumber: {
            type: String,
        },
        expiryDate: {
            type: String,
            default: expiryDate(),
        },
        warrantyExpDate: {
            type: String,
        },
        purchaseDate: {
            type: String,
        },
        location: {
            type: String,
        },
        department: {
            type: String,
        },
        status: {
            type: String,
            enum: [
                AppConfig.DISCOVERY_STATUS.ACTIVE,
                AppConfig.DISCOVERY_STATUS.IN_ACTIVE,
            ],
        },
        modelCategory: {
            type: String,
        },
        configurationItem: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        state: {
            type: String,
        },
        assignedTo: {
            type: String,
        },
        assignedDate: {
            type: String,
        },
        managedBy: {
            type: String,
        },
        ownedBy: {
            type: String,
        },
        assetClass: {
            type: String,
        },
        company: {
            type: String,
        },
        installedDate: {
            type: String,
        },
        subState:{
            type: String,
        }
    },
    { timestamps: true }
);

const normalization = mongoose.model(
    "normalization",
    normalizationSchema,
    "NORMALIZATIONS"
);

export default normalization;
