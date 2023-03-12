const mongoose=require('mongoose');
const preferenceSchema = mongoose.Schema(
    {
        userId:{type:String,required:true},
        preferences:{type:[String],required:true}
    }
);
const Preference = mongoose.model('preferences',preferenceSchema);
module.exports=Preference;