define(function (require, exports, module) {
    'use strict';

    var Forms = require('backbone.forms');

    var RecipientInfo = module.exports;

    RecipientInfo.Form = Forms.extend({
        template: _.template($('#tplRecipientInfo').html()),

        schema: {
            firstName: {
                title: '', type: 'Text', validators: [
                            function validateField(value) {
                                value = $.trim(value);
                                var reg = /^[a-zA-Z. ]*$/;
                                var $el = $('.error-msg.firstName');
                                var error;

                                $el.children().hide();
                                $('label[for=firstName]').removeClass('label-required');

                                if (!value) {
                                    $el.find('.required').show();
                                    $('label[for=firstName]').addClass('label-required');
                                    error = 'error';
                                } else if (!reg.test(value)) {
                                    $el.find('.format').show();
                                    $('label[for=firstName]').addClass('label-required');
                                    error = 'error';
                                }

                                return error;
                            }
                ]
            },
            lastName: {
                title: '', type: 'Text', validators: [
                    function validateField(value) {
                        value = $.trim(value);
                        var reg = /^[a-zA-Z. ]*$/;
                        var $el = $('.error-msg.lastName');
                        var error;

                        $el.children().hide();
                        $('label[for=lastName]').removeClass('label-required');

                        if (!value) {
                            $el.find('.required').show();
                            $('label[for=lastName]').addClass('label-required');
                            error = 'error';
                        } else if (!reg.test(value)) {
                            $el.find('.format').show();
                            $('label[for=lastName]').addClass('label-required');
                            error = 'error';
                        }

                        return error;
                    }
                ]
            },
            email: {
                title: '', type: 'Text', validators: [
                        function validateField(value) {
                            value = $.trim(value);
                            var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            var $el = $('.error-msg.email');
                            var error;
                            $el.children().hide();
                            $('label[for=email]').removeClass('label-required');

                            if (!value) {
                                $el.find('.required').show();
                                $('label[for=email]').addClass('label-required');
                                error = 'error';
                            } else if (!reg.test(value)) {
                                $el.find('.format').show();
                                $('label[for=email]').addClass('label-required');
                                error = 'error';
                            }

                            return error;
                        }
                ]
            },
            reTypeEmail: {
                title: '', type: 'Text', validators: [
                            function validateField(value, formValues) {
                                value = $.trim(value).toLowerCase();
                                var emailValue = $.trim(formValues.email).toLowerCase();
                                var $el = $('.error-msg.reTypeEmail');
                                var error;

                                $el.children().hide();
                                $('label[for=reTypeEmail]').removeClass('label-required');

                                if (!value) {
                                    $el.find('.required').show();
                                    $('label[for=reTypeEmail]').addClass('label-required');
                                    error = 'error';
                                } else if (emailValue !== value) {
                                    $el.find('.match').show();
                                    $('label[for=reTypeEmail]').addClass('label-required');
                                    error = 'error';
                                }

                                return error;
                            }
                ]
            },
            message: { title: '', type: 'TextArea', editorAttrs: { maxlength: 150 } }
        }
    });
});