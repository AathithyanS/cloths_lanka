exports.genrateCrudMethods = Model => {
    return {
        create: record => Model.create(record),
        findOne: record => Model.findOne(record),
        update: (id, record) => Model.findByIdAndUpdate(id, record, { new: true })
    }
}