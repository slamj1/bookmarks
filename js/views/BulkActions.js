import _ from 'underscore'
import Backbone from 'backbone'
import templateString from '../templates/BulkActions.html'

const Marionette = Backbone.Marionette
const Radio = Backbone.Radio

export default Marionette.View.extend({
  className: 'bulk-actions'
, template: _.template(templateString)
, events: {
    'click .delete': 'delete'
  , 'click .select-all': 'selectAll'
  , 'click .selection-tools .close': 'abort'
  }
, initialize: function(opts) {
    this.app = opts.app
    this.all = this.app.bookmarks
    this.selected = opts.selected
    this.listenTo(this.selected, 'remove', this.onReduceSelection)
    this.listenTo(this.selected, 'add', this.onExtendSelection)
  }
, onRender: function() {
    // hack to ignore events caused by tagit setup -- we should really get something else...
    this.rendering = true
    this.$('.tags input')
    .val(_.intersection.apply(_, this.selected.pluck('tags')).join(','))
    .tagit({
      allowSpaces: true,
      availableTags: this.app.tags.pluck('name'),
      placeholderText: t('bookmarks', 'Enter tags'),
      onTagRemoved: this.onTagRemoved.bind(this),
      onTagAdded: this.onTagAdded.bind(this),
      onTagFinishRemoved: function() {},
      onTagClicked: function(){}
    })
    this.rendering = false
  }
, onReduceSelection: function() {
    if (this.selected.length == 0) {
	    this.$el.removeClass('active')
    }
    this.render()
  }
, onExtendSelection: function() {
    if (this.selected.length == 1) {
      this.$el.addClass('active')
    }
    this.render()
  }
, delete: function() {
    var that = this
    this.selected.forEach(function(model) {
      model.trigger('unselect', model)
      model.destroy({
        error: function() {
          Backbone.history.navigate('all', {trigger: true})
        }
      })
    })
  }
, onTagAdded: function(e, el) {
    if (this.rendering) return
    var tagName = $('.tagit-label', el).text()
    this.selected.forEach(function(model) {
      var tags = model.get('tags')
      model.set('tags', _.union(tags, [tagName]))
      model.save()
    }) 
  }
, onTagRemoved: function(e, el) {
    if (this.rendering) return
    var tagName = $('.tagit-label', el).text()
    this.selected.forEach(function(model) {
      var tags = model.get('tags')
      model.set('tags', _.without(tags, tagName))
      model.save()
    }) 
  }
, selectAll: function() {
    this.all.forEach(function(model) {
      model.trigger('select', model) 
    })
  }
, abort: function() {
    this.selected.models.slice().forEach(function(model) {
      model.trigger('unselect', model)
    })
  }
})
