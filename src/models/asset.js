import mongoose from "mongoose";
import { expiryDate } from "../commons/constants";
import { AppConfig } from "../commons/environment/appconfig";


const assetDataSchema = new mongoose.Schema({
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "template",
        required: true
    },
    templateData: {
        type: Object,
        default: {},
    }
});

const assetSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        companyId: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userProfile",
            required: true,
        },
        assetType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "assetType",
            required: true,
        },
        assetDatas: {
            type: [assetDataSchema],
            default: []
        },
        name: {
            type: String,
        },
        // family: {
        //     type: String,
        // },
        // description: {
        //     type: String,
        // },
        // tags: {
        //     type: Array,
        //     default: []
        // },
        // properties: {
        //     type: Array,
        //     default: []
        // },
        // templates: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "template",
        //     default: []
        // }],
        // consumable: {
        //     type: Boolean,
        // },
        // independently: {
        //     type: Boolean,
        // },
        // parentRequired: {
        //     type: Boolean,
        // },
        expiryDate: {
            type: String,
            default: expiryDate()
        },
        status: {
            type: String,
            enum: [AppConfig.DISCOVERY_STATUS.ACTIVE,
            AppConfig.DISCOVERY_STATUS.IN_ACTIVE
            ],
            default: AppConfig.DISCOVERY_STATUS.ACTIVE
        },
        // children: {
        //     type: Array,
        //     default: []
        // }
    },
    { timestamps: true }
);

const assets = mongoose.model(
    "assets",
    assetSchema,
    "ASSETS"
);

export default assets;
