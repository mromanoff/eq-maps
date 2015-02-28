<section class="class-module no-padding-bottom">
    <h3 class="tier"><%= trainerTier %></h3>

    <ul class="class-detail">
        <li class="big-font"><%= appointmentDate %></li>
        <li class="big-font"><%= appointmentTime %></li>
        <li class="medium-font">Personal Training</li>
        <li class="medium-font">w/<%= trainerFirstName %></li>
        <li class="medium-font"><%= facilityName %></li>
    </ul>
</section>

<section class="class-module no-padding-bottom">
    <% _.each(notes, function(note){ %>
    <p><%= note %></p>
    <% }); %>

    <p>Please confirm the details and cancel your session</p>

    <nav class="buttons">
        <% canCancelAll && print('<a href="#" class="button white small half-button box cancel-all">Cancel all Sessions</a>') %>
        <a href="#" class="button black small half-button box inline cancel">Cancel this Session</a>
    </nav>

    <nav class="buttons">
        <a href="#" class="underlined-small-link black update">reschedule this session</a><br>
        <a href="/personal-training" class="underlined-small-link black">Back</a>
    </nav>
</section>

