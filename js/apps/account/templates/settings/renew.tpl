<div class="settings-table pt-renew-settings">
    <div class="row">
        <div class="col-1-2">
            <h3>AUTO RENEW PT PACKAGE</h3>
            <p class="is-tablet is-desktop">Convieniently keep sessions in your inventory by opting in to auto renewal of your training packages when you run out.</p>
        </div>
        <div class="col-1-2">

            <div class="partial-column forms-spa no-margin-top">

                <div class="time-label">60 min</div>
                <div style="overflow:hidden;"><a class="toggle toggle-60-renewal"><i>ON</i><b>/OFF</b></a></div>

                <div class="fancy-select black hhidden toggle-60-dropdown" data-time="60">
                    <span data-editor="" class="dropdown block">
                        <span class="option"><%= obj['60'].packageSize %></span>
                        <select>
                            <% _.each(obj['60'].packageSizeList, function(value, key){
                                if(key != 1){ //we do not want to display the 0 Sessions option
                                var isSelected = _.isEqual(obj['60'].packageSize, value) ? ' selected="selected" ' : ' ';
                                print('<option' + isSelected + 'value="' + key + '">' + value + '</option>');
                                }
                            }); %>
                        </select>
                    </span>
                </div>


                <div class="time-label">30 min</div>
                <div><a class="toggle toggle-30-renewal"><i>ON</i><b>/OFF</b></a></div>

                <div class="fancy-select black hhidden toggle-30-dropdown" data-time="30">
                    <span data-editor="" class="dropdown block">
                        <span class="option"><%= obj['30'].packageSize %></span>
                        <select>
                            <% _.each(obj['30'].packageSizeList, function(value, key){
                                if(key != 1){ //we do not want to display the 0 Sessions option
                                var isSelected = _.isEqual(obj['30'].packageSize, value) ? ' selected="selected" ' : ' ';
                                print('<option' + isSelected + 'value="' + key + '">' + value + '</option>');
                                }
                            }); %>
                        </select>
                    </span>
                </div>

            </div>

            <p class="is-mobile">Convieniently keep sessions in your inventory by opting in to auto renewal of your training packages when you run out.</p>
        </div>
    </div>

    <br />

    <div class="info-block membership-info">
        <div>
            <p>
                <a href="/personal-training/renew-policy" target="_blank">VIEW AUTOMATIC PT RENEWAL POLICY</a>
            </p>
        </div>
    </div>
</div>