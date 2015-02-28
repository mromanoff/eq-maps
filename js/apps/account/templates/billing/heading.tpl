<h1><center><%= title %></center></h1>

<div class="module tpl-favoriteselector dtm-favoriteselector">
    <header class="header-container">
    	<h1><%= title %></h1>
    </header>
</div>

<% if( typeof update !== 'undefined' && update !== null ) { %>
    <div class="membership-total module">
        <div class="border-wrapper">

            <div class="col location">

                <div class="middle-wrapper">
                    <h3 class="club-name"><small>Do you have a new card?</small></h3>

                    <p class="description"><a href="#billing/add" class="btn-form-toggle toggle-form">Add a new card</a></p>
                </div>

            </div>

            <div class="col due-total">

                <p>
                    <% if( typeof cardType !== 'undefined' ) { %>
                        <%= cardType %>
                        <br>
                    <% } %>

                    <% if( typeof cardLastFourDigits !== 'undefined' ) { %>
                        **** **** **** <%= cardLastFourDigits %>
                        <br>
                    <% } %>

                    <% if( friendlyExpDate() ) { %>
                        <%= friendlyExpDate() %>
                        <br>
                    <% } %>
                </p>

                <p>
                    <% if( nameOnCard ) { %>
                        <%= nameOnCard %>
                        <br>
                    <% } %>

                    <% if( address1 ) { %>
                        <%= address1 %>
                        <br>
                    <% } %>

                    <% if( address2 ) { %>
                        <%= address2 %>
                        <br>
                    <% } %>

                    <% if( city && state && zipCode ) { %>
                        <%= city %>, <%= state %> <%= zipCode %>
                    <% } %>

                    <a href="#" class="link toggle-form lnk-edit">Edit</a>
                </p>

            </div>

            <% if( currentBalance > 0 ) { %>
                <div class="col due-total">
                    <p>This amount will be charged:</p>

                    <span class="membership-price">
                        <strong>$<%= currentBalance %></strong>
                    </span>
                </div>
            <% } %>

        </div>
    </div>
<% } %>


