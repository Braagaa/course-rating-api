const {Schema, model} = require('mongoose');
const R = require('ramda');

const Review = require('./Review');

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
            required: true
        }, 
        description: {
            type: String,
            required: true
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

CourseSchema.method('addReview', function(user, data) {
    return Review.createForCourse(user, this, data)
        .then(R.objOf('reviews'))
        .then(R.objOf('$push'))
        .then(R.bind(this.updateOne, this));
});

const Course = model('Course', CourseSchema);

module.exports = Course;
