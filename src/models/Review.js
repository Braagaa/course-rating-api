const {Schema, model} = require('mongoose');
const R = require('ramda');

const {createError} = require('../modules/error-handling');

const ReviewSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    postedOn: {type: Date, default: Date.now},
    rating: {type: Number, required: true, min: 1, max: 5},
    review: String
});

ReviewSchema.static('createForCourse', function(user, course, data) {
    if (user.id === course.user.id)
        throw createError('You cannot review your own course.', 422);
    return Review.create({...data, user});
});

const Review = model('Review', ReviewSchema);

module.exports = Review;
