<% if (typeof narrow !== 'undefined' && narrow == true) { %>
    <fieldset class="narrow-fieldset">
<% } %>

    <% _.each(fieldsets, function(field) { %>
        <fieldset class="fieldset-row static-fieldset">
            <div>
                <label><%= field.label %></label>
                <div><%= field.content %></div>
            </div>
        </fieldset>
    <% }); %>

<% if (typeof narrow !== 'undefined' && narrow == true) { %>
    </fieldset>
<% } %>