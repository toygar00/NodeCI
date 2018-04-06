const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function() {
    console.log('About to run query!!!!!!');

    Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
    })

    return exec.apply(this, arguments);
}