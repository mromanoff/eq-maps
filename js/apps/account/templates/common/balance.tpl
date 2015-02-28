<% if(!!window.userProfileJson  && window.userProfileJson.SourceSystem !== 1) return; %>
<!--// if employees accounts //-->
<% if( billingMode === 'None' || accountType === 'employee' ) { %>

    <div class="info-block narrow">
        <div>

            <h4>Your balance</h4>

            <p>Your account is up to date.</p>

        </div>
    </div>

<% } else { %>

    <div class="presentation-table membership-total module">
        <div class="row">

            <div class="col-1-2">
                <div class="col-padding">
                    <small>Your Balance</small>
                    <h3 class="club-name">
                        <% if (billingMode === 'CreditCard') { %>
                            <%= '$' + displayBalance() %>
                        <% } else if (billingMode === 'DirectOrEFT' && currentBalance > 0) { %>
                            <%= 'Your payment is past due' %>
                        <% } else { %>
                            <%= 'Your account is up to date.' %>
                        <% } %>
                    </h3>
                </div>
            </div>

            <div class="col-1-2">
                <div class="col-padding">
                    <% if( !cardLastFourDigits ) { %>
                        <small>You don’t have a credit  card on file</small>

                       
                            <section class="paragraph rich-content " data-hash="">
                                <nav class="button-container centered">
                                    <a href="#billing/add" class="white box button small">Add Card</a>
                                </nav>
                            </section>
                      
                    <% } %>

                    <% if( cardLastFourDigits ) { %>

                        <% if (paymentType == 'new' || paymentType == 'update') { %>
                            <small>Your card updated successfully</small>
                        <% } else { %>
                            <small>Your Card</small>
                        <% } %>

                        <h3 class="club-name">
                            <%= cardEnding() %>
                            <% if( isCardExpired ) { %>
                                <div style="color:red">Expired</div>
                            <% } %>
                            <!--<small>Auto Purchase: <a href="#" class="toggle"><i>ON</i><b>/OFF</b></a></small>-->
                        </h3>


                        <div class="auto-renew-info">
                            <p>
                                <%= packageStatus('60') %><br />
                                <%= packageStatus('30') %>
                            </p>
                            <p><a href="/account/ptrenew">Edit</a></strong></p>
                        </div>


                        <% if( displayBalance() === 0 || (billingMode === 'DirectOrEFT' && currentBalance > 0) ) { %>
                            <a href="#billing/update" class="cta">Change Card</a>
                        <% } %>
                    <% } %>
                </div>
            </div>

        </div>
    </div>

    <% if( (billingMode === 'CreditCard' || billingMode === 'DirectOrEFT') && currentBalance > 0 ) { %>
        <section class="paragraph rich-content " data-hash="">
            <nav class="button-container centered">
                <% if( isCardExpired ) { %>
                    <a href="#billing/payment" class="white box button large">Pay With New Card</a>
                <% } else { %>
                    <a href="#billing/payment" class="white box button large">Pay Due Now</a>
                <% } %>
            </nav>
        </section>
        <br /><br />
    <% } %>

<% } %>