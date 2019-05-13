const {Schema, model} = require('mongoose');

const ReviewSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    postedOn: {type: Date, default: Date.now},
    rating: {type: Number, required: true, min: 1, max: 5},
    review: String
});

const Review = model('Review', ReviewSchema);

module.exports = Review;
