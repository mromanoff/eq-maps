<div class="module tpl-favoriteselector dtm-favoriteselector">
    <header class="header-container">
        <h1><%= thanks() %></h1>
    </header>
</div>

<div class="border-wrapper">
    <div class="membership-info">
        <div class="middle-wrapper">

            <h3 class="club-name"><small><%= msg() %></small></h3>

            <% if( confirmation() !== '' ) { %>
                <p class="description">Confirmation # <%= confirmation() %></p>
            <% } %>
        </div>
    </div>
</div>

<% if( confirmation() !== '' ) { %>
    <div class="membership-total module">
        <div class="border-wrapper">

            <div class="col location">
                <h4>Amount Charged</h4>
                <p>$<%= currentBalance %></p>
            </div>

            <div class="col due-total">
                <div><%= cardEnding() %></div>
                <div><%= autoPurchase() %></div>
                <div><%= nameOnCard %></div>
            </div>

        </div>
    </div>
<% } else { %>
    <div class="info-block narrow">
        <div>
            <div><%= cardEnding() %></div>
            <div><%= autoPurchase() %></div>
            <div><%= nameOnCard %></div>
        </div>
    </div>
<% } %>

<div class="centered-copy">
    <p><a class="link" href="javascript:window.print()">Print this page</a></p>
</div>

<br>

<div class="centered-copy">
    <a class="black box button large cancel" href="#">Back to Account</a>
</div>