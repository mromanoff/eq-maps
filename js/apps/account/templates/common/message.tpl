<div class="info-block narrow membership-info">
    <div>
        <% if (typeof errorMessage !== 'undefined' ) { %>
            <p><%= errorMessage %></p>
        <% } else { %>
            <p>Payments and updates to billing information are currently disabled during the monthly transaction processing window. Please try again later.</p>
        <% } %>
    </div>
</div>
