import mongoose from "mongoose";
import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";

const templateSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        companyId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        type: {
            type: String,
            enum: [AppConfig.TEMPLATE_TYPE.LOCATION_TEMP,
            AppConfig.TEMPLATE_TYPE.WARRANTY_TEMP,
            AppConfig.TEMPLATE_TYPE.MAINTAINANCE_TEMP,
            AppConfig.TEMPLATE_TYPE.LEASE_TEMP,
            AppConfig.TEMPLATE_TYPE.PURCHASE_TEMP,
            AppConfig.TEMPLATE_TYPE.RENT_TEMP,
            AppConfig.TEMPLATE_TYPE.FAMILY_TEMP,
            ],
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userProfile",
            required: true,
        },
        expiryDate: {
            type: String,
            default: expiryDate()
        },
        tags: {
            type: Array,
            default: []
        },
        tempData: {
            type: Object,
            default: {}
        },
        status: {
            type: String,
            enum: [AppConfig.DISCOVERY_STATUS.ACTIVE,
            AppConfig.DISCOVERY_STATUS.IN_ACTIVE
            ],
            default: AppConfig.DISCOVERY_STATUS.ACTIVE
        }
    },
    { timestamps: true }
);

const template = mongoose.model(
    "template",
    templateSchema,
    "TEMPLATES"
);

export default template;
