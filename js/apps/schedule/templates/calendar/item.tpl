<div class="wrapper <%= className %>" data-id="<%= cid %>">
    <p><strong><%= appointment %></strong></p>
    <p><%= trainerFirstName %> <%= trainerLastName %></p>
    <p><%= facilityName %></p>
    <% scheduled && print('<p>Your reservation</p>') %>
    <% !scheduled && print('<div class="add-appointment"><div class="add">+</div></div>') %>
</div>