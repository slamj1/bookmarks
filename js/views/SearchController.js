import Backbone from 'backbone'

const Marionette = Backbone.Marionette
const Radio = Backbone.Radio

export default Marionette.View.extend({
  el: '#searchbox'
, initialize: function() {
    var that = this
    // register a dummy search plugin
    OC.Plugins.register('OCA.Search', { attach: function(search) {
        search.setFilter('bookmarks', function(query) {
          that.submit(query)
        })
      }
    });
    this.listenTo(Radio.channel('nav'), 'navigate', this.onNavigate, this)
  }
, events: {
    'keydown': 'onKeydown'
  }
, onRender: function() {
    this.$el.show()
  }
, onNavigate: function(route, query) {
    if (route === 'search/:query') this.$el.val(decodeURIComponent(query))
  }
, submit: function(query) {
    if (query !== '') {
      query = encodeURIComponent(query)
      Backbone.history.navigate('search/'+query, {trigger: true})
    }else {
      Backbone.history.navigate('all', {trigger: true})
    }
  }
})
