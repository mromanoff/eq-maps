define(function (require) {
    var tpl = require('text!tpl.html');

    var test = require('test'),
        a = Backbone.View.extend({
            el: $('.app'),
            render: function () {
                this.$el.append(_.template(tpl, {message: "This is a lodash template!"}));
                this.renderComponents($el);
                $('footer').css('margin', 0); // remove margin here so i don't messup css
            }
        });

    var b = new a();
    b.render();

    test.alert('Simple App')

});