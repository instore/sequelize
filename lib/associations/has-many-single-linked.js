var Utils = require('./../utils')

module.exports = (function() {
  var HasManySingleLinked = function(definition, instance) {
    this.__factory = definition
    this.instance = instance
  }

  HasManySingleLinked.prototype.injectGetter = function(options) {
    var where = {}, options = options || {}
    var instance = this.instance
    var factory = this.__factory

    where[factory.identifier] = this.instance.id

    options.where = options.where ? Utils._.extend(options.where, where) : where

    query = factory.target.findAll(options)
    
    query.success(function(results){
      Utils._.each(results, function(result) {
        result[Utils._.camelize(Utils.singularize(factory.source.tableName))] = instance
      })
      instance[factory.options.as || Utils._.camelize(Utils.pluralize(factory.target.tableName))] = results
    })

    return query
  }

  HasManySingleLinked.prototype.injectSetter = function(emitter, oldAssociations, newAssociations) {
    var self    = this
      , options = this.__factory.options
      , chainer = new Utils.QueryChainer()

    // clear the old associations
    oldAssociations.forEach(function(associatedObject) {
      associatedObject[self.__factory.identifier] = null
      chainer.add(associatedObject.save())
    })

    // set the new associations
    newAssociations.forEach(function(associatedObject) {
      associatedObject[self.__factory.identifier] = self.instance.id
      chainer.add(associatedObject.save())
    })

    chainer
      .run()
      .success(function() { emitter.emit('success', newAssociations) })
      .error(function(err) { emitter.emit('error', err) })
  }

  return HasManySingleLinked
})()
