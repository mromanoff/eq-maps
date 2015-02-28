$.fn.selectWrapper = function (options) {
        var defaults = {
            data : {},
            onChange: function () {},
            onReady: function () {},
            selector: $(this).selector,
            defaultValue: null,
            setValue: null,
        };

        var opts = $.extend(defaults, options);

        function setDefaultOption($select, txt) {
            $select.find('span.option').text(txt);

            return ' selected="selected" ';
        }

        return this.each(function () {
            var html = '',
                $this = $(this),
                $select = $this.find('select');

            function bindings() {
                $select.on('change', function () {
                    var val = $(this).find('option:selected').val();
                    console.warn('on change');

                    opts.onChange($(this));

                    setDefault(val);
                });
            }

            function setDefault(val) {
                var txt, $el = (opts.syncInstances) ? $(opts.selector) : $this.find('select');
                $this.find('select').val(val);
                txt = $this.find('select').find('option:selected').text();

                $el.find('span.option').text(txt);

                //opts.onChange($this.find('select'));
            }

            opts.setValue = function (val) {
                setDefault(val);
            }

            $.each(opts.data, function (i, item) {
                var selected = (item.selected) ? setDefaultOption($this, item.text) : '';
                html += '<option value="' + item.value + '"' + selected + '>' + item.text + '</option>';
            });

            $select.html(html); // dump in the dom

            bindings();

            if (opts.defaultValue) {
                setDefault(opts.defaultValue);
            }

            // wait a bit
            setTimeout(function () {
                opts.onReady($select);
            }, 4000);

        });
    };