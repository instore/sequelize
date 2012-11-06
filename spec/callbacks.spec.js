if(typeof require === 'function') {
  const buster    = require("buster")
      , Sequelize = require("../index")
      , Helpers   = require('./buster-helpers')
      , dialect   = Helpers.getTestDialect()
}

buster.spec.expose()

describe("[" + dialect.toUpperCase() + "] DAOFactory callbacks", function() {
  before(function(done) {
    var self = this

    Helpers.initTests({
      dialect: dialect,
      beforeComplete: function(sequelize, DataTypes) {
        self.sequelize = sequelize
      },
      onComplete: function(){
        done()
      }
    })
  })
  
  it("attaches instance callbacks", function() {
    var User = this.sequelize.define('UserWithCallbacks', {}, {
      callbacks: { 
        beforeValidation: [
          function(){ return 'beforeValidation 1'},
          function(){ return 'beforeValidation 2'}
        ],
        afterValidation: [
          function(){ return 'afterValidation 1'},
          function(){ return 'afterValidation 2'}
        ],
        beforeSave: [
          function(){ return 'beforeSave 1'},
          function(){ return 'beforeSave 2'}
        ],
        afterSave: [
          function(){ return 'afterSave 1'},
          function(){ return 'afterSave 2'}
        ],
        beforeCreate: [
          function(){ return 'beforeCreate 1'},
          function(){ return 'beforeCreate 2'}
        ],
        afterCreate: [
          function(){ return 'afterCreate 1'},
          function(){ return 'afterCreate 2'}
        ]
      },
    })

    var user = User.build()

    expect(user.callbacks.beforeValidation.length).toEqual(2)
    expect(user.callbacks.afterValidation.length).toEqual(2)
    expect(user.callbacks.beforeSave.length).toEqual(2)
    expect(user.callbacks.afterSave.length).toEqual(2)
    expect(user.callbacks.beforeCreate.length).toEqual(2)
    expect(user.callbacks.afterCreate.length).toEqual(2)
    expect(user.callbacks.beforeValidation[0]()).toEqual('beforeValidation 1')
    expect(user.callbacks.beforeValidation[1]()).toEqual('beforeValidation 2')
    expect(user.callbacks.afterValidation[0]()).toEqual('afterValidation 1')
    expect(user.callbacks.afterValidation[1]()).toEqual('afterValidation 2')
    expect(user.callbacks.beforeSave[0]()).toEqual('beforeSave 1')
    expect(user.callbacks.beforeSave[1]()).toEqual('beforeSave 2')
    expect(user.callbacks.afterSave[0]()).toEqual('afterSave 1')
    expect(user.callbacks.afterSave[1]()).toEqual('afterSave 2')
    expect(user.callbacks.beforeCreate[0]()).toEqual('beforeCreate 1')
    expect(user.callbacks.beforeCreate[1]()).toEqual('beforeCreate 2')
    expect(user.callbacks.afterCreate[0]()).toEqual('afterCreate 1')
    expect(user.callbacks.afterCreate[1]()).toEqual('afterCreate 2')
  })

  describe('beforeValidation', function(){
    before(function(done) {
      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          beforeValidation: [
            function(){ this.beforeValidation1 = true},
            function(){ this.beforeValidation2 = true}
          ]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called when calling validate method", function() {
      var user = this.User.build()
      user.validate()
      expect(user.beforeValidation1).toEqual(true)
      expect(user.beforeValidation2).toEqual(true)
    })
  })

  describe('afterValidation', function(){
    before(function(done) {
      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          afterValidation: [
            function(){ this.afterValidation1 = true},
            function(){ this.afterValidation2 = true}
          ]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called validation passes", function(){
      var user = this.User.build({username: 'test'})
      user.validate()
      expect(user.afterValidation1).toEqual(true)
      expect(user.afterValidation2).toEqual(true)
    })

    it("should not be called when validation fails", function(){
      var user = this.User.build()
      user.validate()
      expect(user.afterValidation).toEqual(undefined)
    })
  })

  describe('beforeSave', function(){
    before(function(done) {
      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          beforeSave: [
            function(){ this.username = 'username set by callback'}
          ]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called when calling save method", function(done) {
      var user = this.User.build({username: 'test username'})
      user.save().success(function(user) {
        expect(user.username).toEqual('username set by callback')
        done()
      })
    })
  })

  describe('afterSave', function(){

    before(function(done) {
      var self = this
      this.afterSaveCallback = function() { self.afterSaveCallbackCalled = true }
      
      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          afterSave: [this.afterSaveCallback]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called when save succeded", function(done) {
      var self = this
      var user = this.User.build({username: 'test username'})
      user.save().success(function(user) {
        expect(self.afterSaveCallbackCalled).toEqual(true)
        done()
      })
    })
  })

  describe('beforeCreate', function(){
    before(function(done) {
      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          beforeCreate: [
            function(){ this.username = 'username set by callback'}
          ]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called when calling create method", function(done) {
      this.User.create({username: 'test username'}).success(function(user) {
        expect(user.username).toEqual('username set by callback')
        done()
      })
    })
  })

  describe('afterCreate', function(){
    before(function(done) {
      var self = this
      this.afterCreateCallback = function() { self.afterCreateCallbackCalled = true }

      this.User = this.sequelize.define('UserWithCallbacks', {
        username: { type: Sequelize.STRING, validate: {notEmpty: true} }
      }, {
        callbacks: {
          beforeCreate: [this.afterCreateCallback]
        }
      })

      this.User.sync({ force: true }).success(done)
    })

    it("should be called when calling create method", function(done) {
      var self = this
      this.User.create({username: 'test username'}).success(function(user) {
        expect(self.afterCreateCallbackCalled).toEqual(true)
        done()
      })
    })
  })
})
