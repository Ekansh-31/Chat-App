const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
},
{
    timestamps: true,
}
);


userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};


//before saving the password it is going to encrypt the password
userSchema.pre('save', async function(next){
    if(!this.isModified){
        next();
    } //if the current password is not modified then move onto the next i.e dont run the code after it

    //otherwise we will generate a new password
   const salt = await bcrypt.genSalt(10);//higher this number more stronger the password
   this.password = await bcrypt.hash(this.password,salt);

});//this says that before saving all the data it will take this function(which is a middleware so it takes next)

 
const User = mongoose.model("User",userSchema);

module.exports = User;