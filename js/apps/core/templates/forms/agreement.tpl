<div class="agreement">

    <div class="checkbox">
        <label>
            <span class="icon-check checkbox-replacement"></span>
        </label>
        <span class="label"><%= title %></span>
    </div>

    <div class="collapsible">
        <%if (copy === '') {%>
          <p>I, Buyer, authorize my bank to make my Equinox monthly payment by the method indicated below, and post it to my account.</p>
          <p>I understand that the monthly dues will be and will be transferred on the 23rd of each month beginning.</p>
          <p>The monthly dues will continued to be deducted each month at the monthly rate then in effect. Equinox will provide thirty days' notice to Member of any change in the monthly rate. I understand this Agreement is for a minimum of twelve (12) months after which time I may terminate my membership at any time by providing 45 days' written notice either in person at the club or by certified or registered mail to Equinox. The Additional Membership Agreement Terms set forth below are part of this Agreement and by signing below I acknowledge and agree to abide by all such Additional Membership Agreement Terms.</p>
        <%} else {%>
            <%=copy %>
        <% } %>
    </div>

</div>