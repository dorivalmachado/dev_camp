import mongoose from "mongoose";
import { IBootcamp } from "../interfaces/bootcamps/bootcamps.interface";
import slugify from "slugify"
import NodeGeocoder from "node-geocoder"
import geocoder from "../utils/geocoder.utils";

const bootcampsSchema = new mongoose.Schema<IBootcamp>({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
        trim: true,
        maxlength: [50, "Name can have up to 50 characters"]
    },
    slug: String,
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [500, "Description can have up to 500 characters"]
    },
    website: {
        type: String,
        match: [
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/, 
            "Use a valid URL with HTTP or HTTPS"
        ]
    },
    phone: {
        type: String,
        match: [
            /^([2-9]{1}[0-9]{2})(([2-9]{1})(1[0,2-9]{1}|[0,2-9]{1}[0-9]{1}))([0-9]{4})$/i,
            "Add a valid phone number with only numbers"
        ]
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Invalid email"]
    },
    address:{
        type: String,
        required: [true, "Address is required"]
    },
    location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating can not be more than 10"]
    },
    averageCost: Number,
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]
})

bootcampsSchema.pre("save", function () {
    this.slug = slugify(this.name, {lower: true})
})

bootcampsSchema.post("save", { errorHandler: true }, function (error: any, _, next) {
    if(error.code === 11000 && error.name === "MongoServerError") {
        next(new Error("User validation failed: name: Name already in use"))
    } else{
        next(error)
    };
})

bootcampsSchema.pre("save", async function() {
    const res: NodeGeocoder.Entry[] = await geocoder.geocode(this.address)
    const loc = res[0]

    this.location = {
        type: "Point",
        coordinates: [Number(loc.longitude), Number(loc.latitude)],
        formattedAddress: String(loc.formattedAddress),
        street: String(loc.streetName),
        city: String(loc.city),
        state: String(loc.stateCode),
        zipcode: String(loc.zipcode),
        country: String(loc.countryCode),
    }

    this.address = String(loc.formattedAddress)
})

const bootcampsModel = mongoose.model<IBootcamp>("Bootcamp", bootcampsSchema)

export default bootcampsModel