<% if(!!window.userProfileJson  && window.userProfileJson.SourceSystem !== 1) return; %>

<% if(startDate) { %>
    <div class="info-block narrow membership-info">
        <div>

            <h4>Your <%= membershipPlanName %>  membership</h4>

            <p>
                Your home club is <%= facility %><br />
                <%= membershipDuration() %><br />
                <%= contractInfo() %><br />

                <% if(canRenew) { %>
                    <a href="/classic/MYEQ/Renewal/ChooseAccess.aspx">Renew</a>
                <% } else if (canFreeze) {%>
                    <a href="/myeq/freeze">Freeze</a>
                <% } %>
            </p>

        </div>
    </div>
<% } %>