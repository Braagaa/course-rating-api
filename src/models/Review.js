const {Schema, model} = require('mongoose');

const ReviewSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    course: {type: Schema.Types.ObjectId, ref: 'Course'},
    postedOn: {type: Date, default: Date.now},
    rating: {type: Number, required: true, min: 1, max: 5},
    review: String
});
ReviewSchema.pre('save', function(next) {
    const {course, user} = this;
    if (course.user._id === user._id) {
        throw new Error('You cannot review your own course.');
    }
    next();
});

const Review = model('Review', ReviewSchema);

module.exports = Review;
