(function (global) {
    'use strict';

    /* global debug */

    var EQ = global.EQ || {},
        Validator = {};

    /**
    * Validator Class to validate form elements based on data-val attributes
    *   provided by backend.
    *
    * @constructor
    * @param {Object} $el Input element to validate. Cannot be null.
    */
    Validator = function ($el) {
        /**
        * Check preconditions
        */
        if (!$el) {
            throw new Error('Param missing ($el) on Validator Constructor');
        }

        // Set Private Vars.
        this.$el = $el;
        this.fieldValidations = [];

        this.init();
    };

    Validator.prototype = {
        /**
        * Search for data-val attributes in the input to find the validations 
        *   that need to be applied and init them.
        *
        * @methodOf Validator
        * @return {Void}
        */
        init: function () {
            // debug('[Validator] ', this);
            var inputDataAttributes = this.$el.get(0).attributes,
                that = this,
                regexDataAttribute = /^data\-val\-(.+)$/;

            if (inputDataAttributes.length > 0) {
                $.each(inputDataAttributes, function (index, dataVal) {
                    var dataValName = dataVal.name;
                    if (regexDataAttribute.test(dataValName)) {
                        // Split to analize the parts
                        var dataValParts = dataValName.split('-');

                        // If there are only 3 parts, if a validator definition
                        if (dataValParts.length === 3) {
                            // Check if the value is a known validation
                            if (Validations[dataValName] !== undefined) {
                                that.fieldValidations.push(dataValName);
                            } else {
                                // The validation is new
                                debug('[Validator] ', 'New validation found: ' + dataValName + '. Needs to be defined on Validations namespace.');
                            }
                        }
                    }
                });
                
                this.fieldValidations = this.fieldValidations.sort();
            }
            // debug('[ValidatorList] ', that.fieldValidations);
        },

        /**
        * Check if the form element is valid. Also add the error class to the
        *   form element.
        *
        * @methodOf Validator
        * @return {Object} response object with the following format:
        *   {
        *       isValid: {Boolean},
        *       message: {String}
        *   }
        */
        validate: function () {
            var isFieldValid = true,
                fieldValidationResult = {
                    isValid: true,
                    message: ""
                },
                validationResult = {},
                that = this;

            $.each(this.fieldValidations, function (index, name) {
                validationResult = Validations[name](that.$el)
                // debug('[validationRun] ', that.$el.attr('name') + ' ' + name + ' ' + validationResult.isValid + ' - ' + validationResult.message);
                if (!validationResult.isValid) {
                    fieldValidationResult = validationResult;
                }
            });

            if (!fieldValidationResult.isValid) {
                if( this.$el.parent().hasClass('dropdown') ) {
                    this.$el.parent().addClass('error');
                } else if( this.$el.parents('.checkbox').length === 1 ) {
                    this.$el.parents('.checkbox').addClass('error');
                } else {
                    this.$el.addClass('error');
                }
            } else {
                if( this.$el.parent().hasClass('dropdown') ) {
                    this.$el.parent().removeClass('error');
                } else if( this.$el.parents('.checkbox').length === 1 ) {
                    this.$el.parents('.checkbox').removeClass('error');
                } else {
                    this.$el.removeClass('error');
                }
            }

            // If disabled, bypass validation.
            if (this.$el.is(':disabled')) {
                fieldValidationResult = {
                    isValid: true,
                    message: ""
                }
                if( this.$el.parent().hasClass('dropdown') ) {
                    this.$el.parent().removeClass('error');
                } else if( this.$el.parents('.checkbox').length === 1 ) {
                    this.$el.parents('.checkbox').removeClass('error');
                } else {
                    this.$el.removeClass('error');
                }
            }

            return fieldValidationResult;
        }
    };

    // Expose globally
    EQ.Validator = Validator;
    global.EQ = EQ;

    /**
    * Contains all the different validation functions that can be applied to a field
    * All these functions use the input element as the only parameter.
    * All these function return an object with the following format:
    *   {
    *       isValid: {Boolean},
    *       message: {String}
    *   }
    *
    * @namespace
    */
    var Validations = {
        'data-val-required': function ($el) {
            var result = {
                    isValid: true,
                    message: ''
                },
                value = $.trim($el.val()),
                message = $el.data('valRequired');

            if (value === "" || value === undefined || ($el.attr('type') === "checkbox" && $el.is(':checked') === false)) {
                result = {
                    isValid: false,
                    message: message
                }; 
            }

            return result;
        },
        'data-val-length': function ($el) {
            var result = {
                    isValid: true,
                    message: ''
                },
                value = $el.val(),
                valLengthMax = $el.data('valLengthMax'),
                valLengthMin = $el.data('valLengthMin'),
                minCheck = true,
                maxCheck = true,
                message = $el.data('valLength');

            if (valLengthMax !== undefined && $el.val().length >= valLengthMax) {
                maxCheck = false; 
            }

            if (valLengthMin !== undefined && $el.val().length <= valLengthMin) {
                minCheck = false;
            }

            if (minCheck === false || maxCheck === false) {
                result = {
                    isValid: false,
                    message: message
                }; 
            }

            return result;
        },
        'data-val-regex': function ($el) {
            var result = {
                    isValid: true,
                    message: ''
                },
                value = $el.val(),
                message = $el.data('valRegex'),
                regexPattern = $el.data('valRegexPattern'),
                regex = new RegExp(regexPattern.trim(), 'i');

            // debug('[REGEX] ', regexPattern + ' ' + value);
            // debug('[REGEXTEST] ', regex.test(value));
            if (!regex.test(value)) {
                result = {
                    isValid: false,
                    message: message
                }; 
            }

            return result;
        },
        'data-val-creditcard': function ($el) {
                var result = {
                    isValid: true,
                    message: ''
                },
                value = $el.val().replace(/\s/g,''),
                message = $el.data('dataValCreditcard'),
                checkCreditCard = function luhnChk(luhn) {
                var len = luhn.length,
                    mul = 0,
                    prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
                    sum = 0;
             
                while (len--) {
                    sum += prodArr[mul][parseInt(luhn.charAt(len), 10)];
                    mul ^= 1;
                }
             
                return sum % 10 === 0 && sum > 0;
            };

            if(!checkCreditCard(value)){
                var result = {
                    isValid: false,
                    message: message
                };
            }

            return result;
        },
        'data-val-notdefault': function ($el) {
            var result = {
                    isValid: true,
                    message: ''
                },
                value = $el.val(),
                message = $el.data('valNotdefault');

            if( value === '') {
                result = {
                    isValid: false,
                    message: message
                }
            }

            return result;
        }
    };

} (window));