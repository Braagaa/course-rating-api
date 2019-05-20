const {Schema, model} = require('mongoose');

const CourseSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required.']
    },
    estimatedTime: String,
    materialsNeeded: String,
    steps: [{
        stepNumber: Number, 
        title: {
            type: String,
            required: [true, 'Title for steps required.']
        }, 
        description: {
            type: String,
            required: [true, 'Description for steps required.']
        }
    }],
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

CourseSchema.static('findPopulate', function(id) {
    return Course.findById(id, {__v: 0})
        .populate({path: 'user', select: 'fullName'})
        .populate({
            path: 'reviews', 
            select: {__v: 0},
            populate: {path: 'user', select: 'fullName'}
        })
        .exec();
});

const Course = model('Course', CourseSchema);

module.exports = Course;
