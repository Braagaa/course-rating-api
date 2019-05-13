const {Schema, model} = require('mongoose');

const CourseSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true, trim: true},
    description: {type: String, required: true},
    estimatedTime: String,
    materialsNeeded: String,
    steps: [{
        stepNumber: Number, 
        title: {type: String, required: true}, 
        description: {type: String, required: true}
    }],
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

const Course = model('Course', CourseSchema);

module.exports = Course;
