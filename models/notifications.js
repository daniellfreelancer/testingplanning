const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    classroom: { type: mongoose.Types.ObjectId, ref: 'classroom' },
    workshop: { type: mongoose.Types.ObjectId, ref: 'workshop' },
    createByTeacher: { type: mongoose.Types.ObjectId, ref: 'user' },
    createByStudent: { type: mongoose.Types.ObjectId, ref: 'student' },
    title: {type:String},
    notificationText:{type:String},
    route: {type:String}

},
{
    timestamps: true,
});

const NOTIFICATIONS = mongoose.model('notification', notificationSchema);

module.exports = NOTIFICATIONS;