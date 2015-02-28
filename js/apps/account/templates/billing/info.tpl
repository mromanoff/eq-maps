<h1><center><%= title %></center></h1>

<div class="module tpl-favoriteselector dtm-favoriteselector">
    <header class="header-container">
    	<h1>Billing & Account Balance</h1>
    </header>
</div>

<div class="membership-total module">
	<div class="border-wrapper">
	
		<div class="col location">
            <h4>Your Balance</h4>
            <% if( balanceMessage() !== '' ) { %>
                <p><%= balanceMessage() %></p>
            <% } %>
            <p>$<%= currentBalance %></p>
		</div>
		
		<div class="col due-total">
            <% if( !cardLastFourDigits ) { %>
            
                <h4>You don’t have a credit  card on file</h4>

                <% if( currentBalance === 0 ) { %>
                    <section class="paragraph rich-content " data-hash="">
                        <nav class="button-container centered">
                            <a href="#billing/add" class="white box button small">Add Card</a>
                        </nav>
                    </section>
                <% } %>
            <% } %>

            <% if( cardLastFourDigits ) { %>
            
                <h4>Your Card</h4>
                <p>
                    <strong><%= cardType %></strong> ending - <%= cardLastFourDigits %>
                
                    <% if( isCardExpired ) { %>
                        <div style="color:red">Expired</div>
                    <% } %>
                
                    <div>Auto Purchase: <%= autoPurchase() %></div>
                </p>

                <% if( currentBalance === 0 ) { %>
                    <div><a class="link" href="#billing/update">Edit</a></div>
                <% } %>
                
            <% } %>
		</div>
		
	</div>
</div>

<% if( isExpired() && currentBalance > 0 && cardLastFourDigits != null ) { %>
    <section class="paragraph rich-content " data-hash="">
        <nav class="button-container centered">
            <a href="#billing/payment" class="white box button small">PAY WITH NEW CARD</a>
        </nav>
    </section>
<% } %>

<% if( !cardLastFourDigits && currentBalance > 0 ) { %>
    <section class="paragraph rich-content " data-hash="">
        <nav class="button-container centered">
            <a href="#billing/payment" class="white box button small">Pay Due Now</a>
        </nav>
    </section>
<% } %>

<div>
    <center>
        <h6>HAVE QUESTIONS ABOUT YOUR CURRENT BALANCE?</h6>
        <p>Please contact your club manager to inquire or send us an email at <a href="mailto:lorem@equinox.com">lorem@equinox.com</a></p>
    </center>
</div>