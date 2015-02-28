/*global user */
(function (App) {
    'use strict';

    App.Components['contact-method'] = function ($el) {
        var $select = $el.find('select'),
            $input = $el.find('input'),
            methods = {
                phone: {
                    type: 'tel',
                    placeholder: '###-###-####',
                    pattern: '',
                    def: ''
                },
                email: {
                    type: 'email',
                    placeholder: 'john@doe.com',
                    pattern: '',
                    def: user ? user.EmailAddress : ''
                },
                twitter: {
                    type: 'text',
                    placeholder: '@username',
                    pattern: '',
                    def: ''
                }
            };

        $select.on('change.contactMethod', function () {
            var method = methods[$select.val().toLowerCase()];
            $input
                .attr('type', method.type || 'text')
                .attr('placeholder', method.placeholder || '');
            if (method.type === 'email') {
                $input.val(method.def);
            }
            else {
                $input.val('');
            }
        }).trigger('change');
    };

}(window.App));