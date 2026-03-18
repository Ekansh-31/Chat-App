const asyncHandler = require('express-async-handler');
const  Chat = require('../models/chatModel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async(req,res)=>{
    const { userId } = req.body;

    if(!userId) {
        console.log("UserId param not sent with req");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ],
    }).populate("users", "-password").populate("latestMessage");     //for chat to exist the groupchat should be false then we use the and opeartor of mongodb which says that both of the conditions mentioned inside should be true (the conditions are that from the user array of the chatModel the current user that is logged in should match or it should be equal to the userId that we have sent)


    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if(isChat.length > 0) {
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        try {
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({_id: createdChat._id}).populate(
                "users",
                "-password"
            );

            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }


});  //once the chat is found we are going to populate the users array from the chatModel which only containes the userId at this point of time except the password and then we are also going to populate the latestMessages array


const fetchChats = asyncHandler(async (req,res) => {
    try {
        Chat.find( {users: { $elemMatch: { $eq: req.user._id } }} )
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1})
        .then(async (results)=>{
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
            res.status(200).send(results);
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const createGroupChat = asyncHandler(async (req,res) =>{
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the Fields" });
    }

    var users = JSON.parse(req.body.users);

    if(users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({_id: groupChat._id })
        .populate("users","-password")
        .populate("groupAdmin","-password");

        res.status(200).json(fullGroupChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});



const renameGroup = asyncHandler(async (req,res) =>{
    const { chatId, chatName } = req.body; // we need two things the chatId which is basically the GroupId and the chatName which is the updated group name

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId, 
        {
            chatName: chatName,  //what we want to update
        },
        {
            new: true, //if we dont provide new to be true then it is going to give the old value but when we give new to be true then it gives the updated value
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    //checking for errors
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(updatedChat); //if no error then send the response in json format
    }
});



const addToGroup = asyncHandler(async (req,res) =>{
    const { chatId, userId } = req.body; //the chatid which we are supposed to add the user to and the userid which is the user which is to be added

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    //checking for errors
    if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(added); //if no error then send the response in json format
    }
    
});



const removeFromGroup = asyncHandler(async (req,res) =>{
    const { chatId, userId } = req.body; //the chatid which we are supposed to add the user to and the userid which is the user which is to be added

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    //checking for errors
    if(!removed){
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(removed); //if no error then send the response in json format
    }
});


module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }


//acessChat - not understood fully