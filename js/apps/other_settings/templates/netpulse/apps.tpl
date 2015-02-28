<img src="/assets/images/logos/netpulse/logo-<%= serviceName %>.png">

<p>
    <% if (status == 'UNLINKED') { %>
        <a href="#" class="box button small black lnk-link">Link</a>
    <% } else { %>
        <a href="#" class="box button small white lnk-unlink">Unlink</a>
    <% } %>
</p>
